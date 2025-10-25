/**
 * Dimension Service
 * 
 * This service provides methods to fetch and join dimension data with metadata.
 * It handles the complexity of dimension data being stored across multiple tables:
 * - chunks table: mechanical chunk metadata (chunk_id, section_heading, page_start, etc.)
 * - chunk_dimensions table: AI-generated and other dimension data
 * - documents table: document-level metadata
 */

import { supabase } from './supabase';
import { ChunkDimensions, Chunk, ChunkRun } from '../types/chunks';
import { DIMENSION_METADATA, getAllDimensions } from './dimension-metadata';
import { getGenerationType, getConfidenceForDimension } from './dimension-classifier';

/**
 * Represents a single dimension row with its value and metadata
 */
export interface DimensionRow {
  fieldName: string;
  value: any;
  generationType: string;
  precisionConfidence: number;
  accuracyConfidence: number;
  description: string;
  dataType: string;
  allowedValuesFormat: string | null;
  category: string;
  displayOrder: number;
}

/**
 * Complete validation data for a chunk's dimensions
 */
export interface DimensionValidationData {
  chunk: Chunk;
  dimensions: ChunkDimensions;
  run: ChunkRun;
  document: any;
  dimensionRows: DimensionRow[];
  populatedPercentage: number;
  averagePrecision: number;
  averageAccuracy: number;
}

/**
 * Dimension Service
 * 
 * Provides methods to retrieve and validate dimension data
 */
export const dimensionService = {
  /**
   * Get complete dimension validation data for a specific chunk and run
   * 
   * This method:
   * 1. Fetches the chunk from the chunks table
   * 2. Fetches dimensions from chunk_dimensions table
   * 3. Fetches the run metadata
   * 4. Fetches the document metadata
   * 5. Joins dimension values with metadata
   * 6. Calculates population and confidence statistics
   * 
   * IMPORTANT: Some dimensions are stored in the chunks table:
   * - chunk_id, section_heading, page_start, page_end, char_start, char_end,
   *   token_count, overlap_tokens, chunk_handle
   * 
   * @param chunkId - UUID of the chunk
   * @param runId - UUID of the run
   * @returns Complete validation data or null if data not found
   */
  async getDimensionValidationData(
    chunkId: string,
    runId: string
  ): Promise<DimensionValidationData | null> {
    try {
      // 1. Fetch chunk
      const { data: chunk, error: chunkError } = await supabase
        .from('chunks')
        .select('*')
        .eq('id', chunkId)
        .single();
      
      if (chunkError) {
        console.error('Error fetching chunk:', chunkError);
        return null;
      }
      
      if (!chunk) {
        console.error('Chunk not found:', chunkId);
        return null;
      }
      
      // 2. Fetch dimensions for this chunk and run
      const { data: dimensions, error: dimError } = await supabase
        .from('chunk_dimensions')
        .select('*')
        .eq('chunk_id', chunkId)
        .eq('run_id', runId)
        .single();
      
      if (dimError) {
        console.error('Error fetching dimensions:', dimError);
        return null;
      }
      
      if (!dimensions) {
        console.error('Dimensions not found for chunk:', chunkId, 'run:', runId);
        return null;
      }
      
      // 3. Fetch run
      const { data: run, error: runError } = await supabase
        .from('chunk_runs')
        .select('*')
        .eq('run_id', runId)
        .single();
      
      if (runError) {
        console.error('Error fetching run:', runError);
        return null;
      }
      
      if (!run) {
        console.error('Run not found:', runId);
        return null;
      }
      
      // 4. Fetch document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', chunk.document_id)
        .single();
      
      if (docError) {
        console.error('Error fetching document:', docError);
        return null;
      }
      
      if (!document) {
        console.error('Document not found:', chunk.document_id);
        return null;
      }
      
      // 5. Build dimension rows by joining dimension values with metadata
      const allDimensionMetadata = getAllDimensions();
      const dimensionRows: DimensionRow[] = allDimensionMetadata.map(meta => {
        // IMPORTANT: Some dimensions are stored in the chunks table, not chunk_dimensions
        let value: any;
        
        switch (meta.fieldName) {
          case 'chunk_id':
            value = chunk.chunk_id;
            break;
          case 'section_heading':
            value = chunk.section_heading;
            break;
          case 'page_start':
            value = chunk.page_start;
            break;
          case 'page_end':
            value = chunk.page_end;
            break;
          case 'char_start':
            value = chunk.char_start;
            break;
          case 'char_end':
            value = chunk.char_end;
            break;
          case 'token_count':
            value = chunk.token_count;
            break;
          case 'overlap_tokens':
            value = chunk.overlap_tokens;
            break;
          case 'chunk_handle':
            value = chunk.chunk_handle;
            break;
          case 'chunk_type':
            value = chunk.chunk_type;
            break;
          default:
            // All other dimensions come from chunk_dimensions table
            value = (dimensions as any)[meta.fieldName];
        }
        
        const confidence = getConfidenceForDimension(meta.fieldName, dimensions);
        
        return {
          fieldName: meta.fieldName,
          value,
          generationType: meta.generationType,
          precisionConfidence: confidence.precision,
          accuracyConfidence: confidence.accuracy,
          description: meta.description,
          dataType: meta.dataType,
          allowedValuesFormat: meta.allowedValuesFormat,
          category: meta.category,
          displayOrder: meta.displayOrder
        };
      });
      
      // 6. Calculate statistics
      const populatedCount = dimensionRows.filter(row => {
        if (row.value === null || row.value === undefined) return false;
        if (typeof row.value === 'string' && row.value.trim() === '') return false;
        if (Array.isArray(row.value) && row.value.length === 0) return false;
        return true;
      }).length;
      
      const populatedPercentage = Math.round((populatedCount / dimensionRows.length) * 100);
      
      // Calculate average confidence only for AI Generated dimensions
      const aiRows = dimensionRows.filter(row => row.generationType === 'AI Generated');
      const avgPrecision = aiRows.length > 0 
        ? aiRows.reduce((sum, row) => sum + row.precisionConfidence, 0) / aiRows.length
        : 0;
      const avgAccuracy = aiRows.length > 0
        ? aiRows.reduce((sum, row) => sum + row.accuracyConfidence, 0) / aiRows.length
        : 0;
      
      return {
        chunk,
        dimensions,
        run,
        document,
        dimensionRows,
        populatedPercentage,
        averagePrecision: Math.round(avgPrecision * 10) / 10,
        averageAccuracy: Math.round(avgAccuracy * 10) / 10
      };
    } catch (error) {
      console.error('Unexpected error in getDimensionValidationData:', error);
      return null;
    }
  },
  
  /**
   * Get all runs for a specific chunk
   * 
   * This method:
   * 1. Finds the document for the chunk
   * 2. Gets all runs for that document
   * 3. Checks which runs have dimension data for this specific chunk
   * 4. Returns only runs that have data for this chunk
   * 
   * @param chunkId - UUID of the chunk
   * @returns Array of runs with hasData flag indicating if dimension data exists
   */
  async getRunsForChunk(chunkId: string): Promise<Array<{ run: ChunkRun; hasData: boolean }>> {
    try {
      // 1. Get chunk to find its document
      const { data: chunk, error: chunkError } = await supabase
        .from('chunks')
        .select('document_id')
        .eq('id', chunkId)
        .single();
      
      if (chunkError || !chunk) {
        console.error('Error fetching chunk for runs:', chunkError);
        return [];
      }
      
      // 2. Get all runs for this document
      const { data: runs, error: runsError } = await supabase
        .from('chunk_runs')
        .select('*')
        .eq('document_id', chunk.document_id)
        .order('started_at', { ascending: false });
      
      if (runsError || !runs) {
        console.error('Error fetching runs:', runsError);
        return [];
      }
      
      // 3. Check which runs have data for this specific chunk
      const runsWithStatus = await Promise.all(
        runs.map(async (run) => {
          const { data: dimData, error: dimError } = await supabase
            .from('chunk_dimensions')
            .select('id')
            .eq('chunk_id', chunkId)
            .eq('run_id', run.run_id)
            .limit(1);
          
          if (dimError) {
            console.error('Error checking dimension data:', dimError);
          }
          
          return {
            run,
            hasData: dimData ? dimData.length > 0 : false
          };
        })
      );
      
      // 4. Return only runs that have data for this chunk
      return runsWithStatus.filter(r => r.hasData);
    } catch (error) {
      console.error('Unexpected error in getRunsForChunk:', error);
      return [];
    }
  },

  /**
   * Get dimension data for multiple chunks in a run
   * 
   * Useful for batch operations or displaying dimension data across chunks
   * 
   * @param runId - UUID of the run
   * @returns Array of dimension validation data for all chunks in the run
   */
  async getDimensionsByRun(runId: string): Promise<DimensionValidationData[]> {
    try {
      // Get all dimensions for this run
      const { data: dimensionsList, error: dimError } = await supabase
        .from('chunk_dimensions')
        .select('chunk_id')
        .eq('run_id', runId);
      
      if (dimError || !dimensionsList) {
        console.error('Error fetching dimensions for run:', dimError);
        return [];
      }
      
      // Get validation data for each chunk
      const validationDataPromises = dimensionsList.map(dim =>
        this.getDimensionValidationData(dim.chunk_id, runId)
      );
      
      const validationDataList = await Promise.all(validationDataPromises);
      
      // Filter out nulls and return
      return validationDataList.filter((data): data is DimensionValidationData => data !== null);
    } catch (error) {
      console.error('Unexpected error in getDimensionsByRun:', error);
      return [];
    }
  },

  /**
   * Get summary statistics for a run
   * 
   * @param runId - UUID of the run
   * @returns Statistics about dimension population and confidence
   */
  async getRunStatistics(runId: string): Promise<{
    totalChunks: number;
    averagePopulatedPercentage: number;
    averagePrecision: number;
    averageAccuracy: number;
  } | null> {
    try {
      const dimensionsData = await this.getDimensionsByRun(runId);
      
      if (dimensionsData.length === 0) {
        return null;
      }
      
      const totalChunks = dimensionsData.length;
      const avgPopulated = dimensionsData.reduce((sum, d) => sum + d.populatedPercentage, 0) / totalChunks;
      const avgPrecision = dimensionsData.reduce((sum, d) => sum + d.averagePrecision, 0) / totalChunks;
      const avgAccuracy = dimensionsData.reduce((sum, d) => sum + d.averageAccuracy, 0) / totalChunks;
      
      return {
        totalChunks,
        averagePopulatedPercentage: Math.round(avgPopulated),
        averagePrecision: Math.round(avgPrecision * 10) / 10,
        averageAccuracy: Math.round(avgAccuracy * 10) / 10
      };
    } catch (error) {
      console.error('Unexpected error in getRunStatistics:', error);
      return null;
    }
  }
};

