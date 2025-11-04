/**
 * ChunksService - Integration with chunks-alpha Module
 * 
 * Provides methods to:
 * - Query chunks from chunks-alpha database
 * - Retrieve 60-dimension analysis data
 * - Filter by document, category, quality threshold
 * - Cache results to minimize database load
 * - Parse semantic dimensions
 * 
 * Performance target: <200ms for single chunk retrieval with dimensions
 * Cache hit target: <50ms
 * 
 * Usage:
 *   const chunk = await chunksService.getChunkById('chunk-id');
 *   const dims = await chunksService.getDimensionsForChunk('chunk-id');
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChunkReference, DimensionSource } from '../types';
import { chunkCache } from './chunk-cache';
import { dimensionParser } from './dimension-parser';

/**
 * Extended chunk data with dimensions
 */
export interface ChunkWithDimensions extends ChunkReference {
  dimensions?: DimensionSource;
}

/**
 * Query options for filtering chunks
 */
export interface ChunkQueryOptions {
  limit?: number;
  offset?: number;
  minQuality?: number; // Minimum confidence score
  category?: string;
  sortBy?: 'relevance' | 'page' | 'created_at';
  includeContent?: boolean; // Whether to include full content (default: true)
}

/**
 * Database chunk record structure
 */
interface DbChunk {
  id: string;
  chunk_id: string;
  title: string | null;
  content: string;
  document_id: string;
  section_heading: string | null;
  page_start: number | null;
  page_end: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database chunk dimensions record structure
 */
interface DbChunkDimensions {
  id: string;
  chunk_id: string;
  run_id: string;
  dimensions: Record<string, any>;
  confidence_score: number;
  generated_at: string;
}

/**
 * Database document record structure
 */
interface DbDocument {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export class ChunksService {
  private supabase: SupabaseClient;
  private useCache: boolean;

  /**
   * Create a new ChunksService
   * 
   * @param supabaseUrl - Supabase project URL
   * @param supabaseKey - Supabase API key (anon or service role)
   * @param useCache - Enable caching (default: true)
   */
  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    useCache: boolean = true
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    this.useCache = useCache;
  }

  /**
   * Get a single chunk by ID with dimensions
   * 
   * Workflow:
   * 1. Check cache
   * 2. Query database if cache miss
   * 3. Parse dimensions
   * 4. Cache result
   * 
   * @param chunkId - Chunk UUID
   * @returns Chunk with dimensions or null if not found
   */
  async getChunkById(chunkId: string): Promise<ChunkWithDimensions | null> {
    // Check cache first
    if (this.useCache) {
      const cacheKey = chunkCache.generateKey('chunk', chunkId);
      const cached = chunkCache.get<ChunkWithDimensions>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Query chunk with document title join
      const { data: chunk, error: chunkError } = await this.supabase
        .from('chunks')
        .select(`
          id,
          chunk_id,
          title,
          content,
          document_id,
          section_heading,
          page_start,
          page_end,
          documents:document_id (
            title
          )
        `)
        .eq('id', chunkId)
        .single();

      if (chunkError) {
        if (chunkError.code === 'PGRST116') {
          // Not found
          console.warn(`Chunk not found: ${chunkId}`);
          return null;
        }
        console.error('Error fetching chunk:', chunkError);
        return null;
      }

      if (!chunk) {
        return null;
      }

      // Transform to ChunkReference
      const chunkRef: ChunkWithDimensions = {
        id: chunk.id,
        title: chunk.title || `Chunk ${chunk.chunk_id}`,
        content: chunk.content,
        documentId: chunk.document_id,
        documentTitle: (chunk.documents as any)?.title || undefined,
        sectionHeading: chunk.section_heading || undefined,
        pageStart: chunk.page_start || undefined,
        pageEnd: chunk.page_end || undefined
      };

      // Fetch dimensions separately
      const dimensions = await this.getDimensionsForChunk(chunkId);
      if (dimensions) {
        chunkRef.dimensions = dimensions;
      }

      // Cache the result
      if (this.useCache) {
        const cacheKey = chunkCache.generateKey('chunk', chunkId);
        chunkCache.set(cacheKey, chunkRef);
      }

      return chunkRef;
    } catch (error) {
      console.error('Unexpected error in getChunkById:', error);
      return null;
    }
  }

  /**
   * Get all chunks for a document with optional filtering
   * 
   * @param documentId - Document UUID
   * @param options - Query options for filtering and pagination
   * @returns Array of chunks with dimensions
   */
  async getChunksByDocument(
    documentId: string,
    options: ChunkQueryOptions = {}
  ): Promise<ChunkWithDimensions[]> {
    const {
      limit = 100,
      offset = 0,
      minQuality,
      sortBy = 'page',
      includeContent = true
    } = options;

    // Check cache for document chunks list
    const cacheKey = chunkCache.generateKey('doc-chunks', `${documentId}-${limit}-${offset}`);
    if (this.useCache && !minQuality) {
      const cached = chunkCache.get<ChunkWithDimensions[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Build query
      let query = this.supabase
        .from('chunks')
        .select(`
          id,
          chunk_id,
          title,
          ${includeContent ? 'content,' : ''}
          document_id,
          section_heading,
          page_start,
          page_end,
          created_at,
          documents:document_id (
            title
          )
        `)
        .eq('document_id', documentId)
        .range(offset, offset + limit - 1);

      // Apply sorting
      switch (sortBy) {
        case 'page':
          query = query.order('page_start', { ascending: true });
          break;
        case 'created_at':
          query = query.order('created_at', { ascending: false });
          break;
        case 'relevance':
        default:
          query = query.order('chunk_id', { ascending: true });
          break;
      }

      const { data: chunks, error: chunksError } = await query;

      if (chunksError) {
        console.error('Error fetching chunks by document:', chunksError);
        return [];
      }

      if (!chunks || chunks.length === 0) {
        return [];
      }

      // Transform chunks
      const chunkRefs: ChunkWithDimensions[] = await Promise.all(
        chunks.map(async (chunk: any) => {
          const chunkRef: ChunkWithDimensions = {
            id: chunk.id,
            title: chunk.title || `Chunk ${chunk.chunk_id}`,
            content: chunk.content || '',
            documentId: chunk.document_id,
            documentTitle: chunk.documents?.title || undefined,
            sectionHeading: chunk.section_heading || undefined,
            pageStart: chunk.page_start || undefined,
            pageEnd: chunk.page_end || undefined
          };

          // Fetch dimensions if quality filter needed
          if (minQuality !== undefined) {
            const dimensions = await this.getDimensionsForChunk(chunk.id);
            if (dimensions) {
              chunkRef.dimensions = dimensions;
            }
          }

          return chunkRef;
        })
      );

      // Apply quality filter if specified
      let filteredChunks = chunkRefs;
      if (minQuality !== undefined) {
        filteredChunks = chunkRefs.filter(
          chunk => chunk.dimensions && chunk.dimensions.confidence >= minQuality
        );
      }

      // Cache the result (only if no quality filter)
      if (this.useCache && minQuality === undefined) {
        chunkCache.set(cacheKey, filteredChunks);
      }

      return filteredChunks;
    } catch (error) {
      console.error('Unexpected error in getChunksByDocument:', error);
      return [];
    }
  }

  /**
   * Get dimensions for a specific chunk
   * 
   * Retrieves the most recent dimension analysis
   * Parses raw dimensions into semantic categories
   * 
   * @param chunkId - Chunk UUID
   * @returns Parsed dimension source or null
   */
  async getDimensionsForChunk(chunkId: string): Promise<DimensionSource | null> {
    // Check cache first
    if (this.useCache) {
      const cacheKey = chunkCache.generateKey('dimensions', chunkId);
      const cached = chunkCache.get<DimensionSource>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Get most recent dimension analysis for this chunk
      const { data: dimension, error: dimError } = await this.supabase
        .from('chunk_dimensions')
        .select('*')
        .eq('chunk_id', chunkId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      if (dimError) {
        if (dimError.code === 'PGRST116') {
          // No dimensions found
          console.warn(`No dimensions found for chunk: ${chunkId}`);
          return null;
        }
        console.error('Error fetching dimensions:', dimError);
        return null;
      }

      if (!dimension) {
        return null;
      }

      // Parse dimensions using DimensionParser
      const parsed = dimensionParser.parse(
        dimension.dimensions || {},
        dimension.confidence_score || 0,
        chunkId
      );

      // Cache the result
      if (this.useCache) {
        const cacheKey = chunkCache.generateKey('dimensions', chunkId);
        chunkCache.set(cacheKey, parsed);
      }

      return parsed;
    } catch (error) {
      console.error('Unexpected error in getDimensionsForChunk:', error);
      return null;
    }
  }

  /**
   * Search chunks by content
   * 
   * Performs full-text search on chunk content
   * Returns chunks ordered by relevance
   * 
   * @param searchQuery - Search term
   * @param options - Query options
   * @returns Array of matching chunks
   */
  async searchChunks(
    searchQuery: string,
    options: ChunkQueryOptions = {}
  ): Promise<ChunkWithDimensions[]> {
    const {
      limit = 20,
      offset = 0,
      minQuality,
      includeContent = true
    } = options;

    if (!searchQuery || searchQuery.trim().length === 0) {
      console.warn('Empty search query provided');
      return [];
    }

    try {
      // Use PostgreSQL full-text search with ilike for simplicity
      // For production, consider using ts_vector and ts_query
      const { data: chunks, error: searchError } = await this.supabase
        .from('chunks')
        .select(`
          id,
          chunk_id,
          title,
          ${includeContent ? 'content,' : ''}
          document_id,
          section_heading,
          page_start,
          page_end,
          documents:document_id (
            title
          )
        `)
        .ilike('content', `%${searchQuery}%`)
        .range(offset, offset + limit - 1)
        .limit(limit);

      if (searchError) {
        console.error('Error searching chunks:', searchError);
        return [];
      }

      if (!chunks || chunks.length === 0) {
        return [];
      }

      // Transform and optionally fetch dimensions
      const chunkRefs: ChunkWithDimensions[] = await Promise.all(
        chunks.map(async (chunk: any) => {
          const chunkRef: ChunkWithDimensions = {
            id: chunk.id,
            title: chunk.title || `Chunk ${chunk.chunk_id}`,
            content: chunk.content || '',
            documentId: chunk.document_id,
            documentTitle: chunk.documents?.title || undefined,
            sectionHeading: chunk.section_heading || undefined,
            pageStart: chunk.page_start || undefined,
            pageEnd: chunk.page_end || undefined
          };

          // Optionally fetch dimensions
          if (minQuality !== undefined) {
            const dimensions = await this.getDimensionsForChunk(chunk.id);
            if (dimensions) {
              chunkRef.dimensions = dimensions;
            }
          }

          return chunkRef;
        })
      );

      // Apply quality filter if specified
      if (minQuality !== undefined) {
        return chunkRefs.filter(
          chunk => chunk.dimensions && chunk.dimensions.confidence >= minQuality
        );
      }

      return chunkRefs;
    } catch (error) {
      console.error('Unexpected error in searchChunks:', error);
      return [];
    }
  }

  /**
   * Get chunk count for a document
   * 
   * @param documentId - Document UUID
   * @returns Total number of chunks
   */
  async getChunkCount(documentId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('chunks')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId);

      if (error) {
        console.error('Error getting chunk count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Unexpected error in getChunkCount:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache for a specific chunk
   * 
   * @param chunkId - Chunk UUID
   */
  invalidateChunkCache(chunkId: string): void {
    if (!this.useCache) return;

    const chunkKey = chunkCache.generateKey('chunk', chunkId);
    const dimensionsKey = chunkCache.generateKey('dimensions', chunkId);
    
    chunkCache.invalidate(chunkKey);
    chunkCache.invalidate(dimensionsKey);
  }

  /**
   * Invalidate cache for all chunks in a document
   * 
   * @param documentId - Document UUID
   */
  invalidateDocumentCache(documentId: string): void {
    if (!this.useCache) return;

    const prefix = chunkCache.generateKey('doc-chunks', documentId);
    chunkCache.invalidateByPrefix(prefix);
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    if (!this.useCache) return;
    chunkCache.clear();
  }

  /**
   * Get cache metrics
   * 
   * @returns Cache performance metrics
   */
  getCacheMetrics() {
    return chunkCache.getMetrics();
  }

  /**
   * Enable or disable caching
   * 
   * @param enabled - Whether to enable caching
   */
  setCacheEnabled(enabled: boolean): void {
    this.useCache = enabled;
  }

  /**
   * Test database connection
   * 
   * @returns True if connection successful
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('chunks')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  }
}

// Export singleton instance
// Note: These environment variables should be set in your .env file
const supabaseUrl = typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL || '';
const supabaseKey = typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY || '';

// Only create singleton if environment variables are available
export const chunksService = (supabaseUrl && supabaseKey)
  ? new ChunksService(supabaseUrl, supabaseKey)
  : null;

