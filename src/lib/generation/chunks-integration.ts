/**
 * Chunks Integration Service
 * 
 * Bridges chunk/dimension services with conversation generation system.
 * Provides convenient methods for fetching and transforming chunk data
 * for use in generation prompts and parameter mapping.
 */

import { chunkService, chunkDimensionService } from '@/lib/chunk-service';
import { toChunkReference, toDimensionSource } from './types';
import type { ChunkReference, DimensionSource } from './types';

export class ChunksIntegrationService {
  /**
   * Get chunk by ID and convert to ChunkReference for generation
   */
  async getChunkById(chunkId: string): Promise<ChunkReference | null> {
    try {
      const chunk = await chunkService.getChunkById(chunkId);
      if (!chunk) return null;

      // Fetch document title for better context
      const document = await chunkService.getDocumentById(chunk.document_id);
      const documentTitle = document?.title || document?.filename || undefined;

      return toChunkReference(chunk, documentTitle);
    } catch (error) {
      console.error('Error fetching chunk for generation:', error);
      return null;
    }
  }

  /**
   * Get multiple chunks by IDs (for multi-chunk conversations)
   */
  async getChunksByIds(chunkIds: string[]): Promise<ChunkReference[]> {
    const chunks = await Promise.all(
      chunkIds.map(id => this.getChunkById(id))
    );
    
    // Filter out nulls
    return chunks.filter((chunk): chunk is ChunkReference => chunk !== null);
  }

  /**
   * Get dimensions for a chunk (uses most recent run)
   */
  async getDimensionsForChunk(chunkId: string): Promise<DimensionSource | null> {
    try {
      const chunk = await chunkService.getChunkById(chunkId);
      if (!chunk) return null;

      // Get all runs for the document
      const runs = await chunkService.getDocumentById(chunk.document_id);
      if (!runs) return null;

      // Get most recent completed run
      const runService = await import('@/lib/chunk-service');
      const chunkRuns = await runService.chunkRunService.getRunsByDocument(chunk.document_id);
      
      const completedRuns = chunkRuns.filter(r => r.status === 'completed');
      if (completedRuns.length === 0) return null;

      const latestRun = completedRuns[0]; // Already sorted by started_at desc

      // Get dimensions for this chunk and run
      const dimensions = await chunkDimensionService.getDimensionsByChunkAndRun(
        chunkId,
        latestRun.run_id
      );

      if (!dimensions) return null;

      return toDimensionSource(dimensions);
    } catch (error) {
      console.error('Error fetching dimensions for generation:', error);
      return null;
    }
  }

  /**
   * Get chunk and dimensions together (convenience method)
   */
  async getChunkWithDimensions(chunkId: string): Promise<{
    chunk: ChunkReference;
    dimensions: DimensionSource | null;
  } | null> {
    const chunk = await this.getChunkById(chunkId);
    if (!chunk) return null;

    const dimensions = await this.getDimensionsForChunk(chunkId);

    return { chunk, dimensions };
  }

  /**
   * Get dimensions by specific run ID (for reproducibility)
   */
  async getDimensionsByRun(chunkId: string, runId: string): Promise<DimensionSource | null> {
    try {
      const dimensions = await chunkDimensionService.getDimensionsByChunkAndRun(chunkId, runId);
      if (!dimensions) return null;

      return toDimensionSource(dimensions);
    } catch (error) {
      console.error('Error fetching dimensions by run:', error);
      return null;
    }
  }

  /**
   * Check if a chunk has dimensions available
   */
  async hasDimensions(chunkId: string): Promise<boolean> {
    const dimensions = await this.getDimensionsForChunk(chunkId);
    return dimensions !== null;
  }

  /**
   * Get all chunks for a document (useful for batch generation)
   */
  async getChunksForDocument(documentId: string): Promise<ChunkReference[]> {
    try {
      const chunks = await chunkService.getChunksByDocument(documentId);
      const document = await chunkService.getDocumentById(documentId);
      const documentTitle = document?.title || document?.filename || undefined;

      return chunks.map(chunk => toChunkReference(chunk, documentTitle));
    } catch (error) {
      console.error('Error fetching chunks for document:', error);
      return [];
    }
  }

  /**
   * Get dimension statistics for a chunk (for audit logging)
   */
  async getDimensionStats(chunkId: string): Promise<{
    hasContent: boolean;
    hasTask: boolean;
    hasCER: boolean;
    hasScenario: boolean;
    confidence: number;
    generatedAt: string;
  } | null> {
    const dimensions = await this.getDimensionsForChunk(chunkId);
    if (!dimensions) return null;

    // Check which dimension types are populated
    const dim = dimensions.semanticDimensions;

    return {
      hasContent: !!(dim.domain || dim.audience || dim.intent),
      hasTask: false, // Would check task-specific fields from raw dimensions
      hasCER: false, // Would check CER-specific fields
      hasScenario: false, // Would check scenario-specific fields
      confidence: dimensions.confidence,
      generatedAt: dimensions.generatedAt,
    };
  }
}

// Export singleton instance
export const chunksService = new ChunksIntegrationService();

/**
 * Dimension Parser Utility
 * 
 * Provides helper functions for parsing and validating dimension data
 */
export class DimensionParser {
  /**
   * Validate dimension source has minimum required data
   */
  isValid(dimensions: DimensionSource): boolean {
    return (
      dimensions.confidence > 0 &&
      dimensions.semanticDimensions !== undefined
    );
  }

  /**
   * Check if dimensions are high confidence (>0.8)
   */
  isHighConfidence(dimensions: DimensionSource): boolean {
    return dimensions.confidence >= 0.8;
  }

  /**
   * Check if dimensions suggest complex content
   */
  isComplexContent(dimensions: DimensionSource): boolean {
    return (dimensions.semanticDimensions.complexity || 0) >= 0.7;
  }

  /**
   * Extract primary persona from dimension data
   */
  getPrimaryPersona(dimensions: DimensionSource): string {
    return dimensions.semanticDimensions.persona?.[0] || 'professional';
  }

  /**
   * Extract primary emotion from dimension data
   */
  getPrimaryEmotion(dimensions: DimensionSource): string {
    return dimensions.semanticDimensions.emotion?.[0] || 'neutral';
  }

  /**
   * Get human-readable dimension summary
   */
  getSummary(dimensions: DimensionSource): string {
    const semantic = dimensions.semanticDimensions;
    const parts = [
      `Confidence: ${(dimensions.confidence * 100).toFixed(0)}%`,
      semantic.complexity && `Complexity: ${(semantic.complexity * 10).toFixed(1)}/10`,
      semantic.persona && `Personas: ${semantic.persona.join(', ')}`,
      semantic.emotion && `Emotions: ${semantic.emotion.join(', ')}`,
      semantic.domain && `Domains: ${semantic.domain.join(', ')}`,
    ].filter(Boolean);

    return parts.join(' | ');
  }
}

// Export singleton instance
export const dimensionParser = new DimensionParser();

