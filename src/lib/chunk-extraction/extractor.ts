import { supabase } from '../supabase';
import { AIChunker } from './ai-chunker';
import { TextAnalyzer } from './text-analyzer';
import { chunkService, chunkExtractionJobService, documentService } from '../database';
import { Chunk, ChunkType } from '../../types/chunks';

export class ChunkExtractor {
  private aiChunker: AIChunker;
  private analyzer: TextAnalyzer;

  constructor() {
    this.aiChunker = new AIChunker();
    this.analyzer = new TextAnalyzer();
  }

  /**
   * Main extraction method - orchestrates the entire process
   */
  async extractChunksForDocument(documentId: string, userId: string | null): Promise<Chunk[]> {
    // Create extraction job
    const job = await chunkExtractionJobService.createJob(documentId, userId);

    try {
      // Update job status
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'extracting',
        started_at: new Date().toISOString(),
        current_step: 'Loading document',
        progress_percentage: 10,
      });

      // Get document with category data
      const document = await documentService.getById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Get document category
      const { data: categoryData } = await supabase
        .from('document_categories')
        .select(`
          *,
          categories (*)
        `)
        .eq('document_id', documentId)
        .eq('is_primary', true)
        .single();

      const primaryCategory = categoryData?.categories?.name || 'Unknown';

      // Update progress
      await chunkExtractionJobService.updateJob(job.id, {
        current_step: 'Analyzing document structure',
        progress_percentage: 30,
      });

      // Delete existing chunks (if regenerating)
      await chunkService.deleteChunksByDocument(documentId);

      // Extract chunk candidates using AI
      await chunkExtractionJobService.updateJob(job.id, {
        current_step: 'Identifying chunks with AI',
        progress_percentage: 50,
      });

      const candidates = await this.aiChunker.extractChunks({
        documentId,
        documentTitle: document.title,
        documentContent: document.content || '',
        primaryCategory,
      });

      // Create chunk records
      await chunkExtractionJobService.updateJob(job.id, {
        current_step: 'Creating chunk records',
        progress_percentage: 70,
      });

      const chunks: Chunk[] = [];
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        
        // Calculate page numbers based on character positions
        // Assume ~2500 characters per page (standard for documents)
        const pageStart = Math.floor(candidate.startIndex / 2500) + 1;
        const pageEnd = Math.floor(candidate.endIndex / 2500) + 1;
        
        // Calculate overlap with previous chunk
        let overlapTokens = 0;
        if (i > 0) {
          const prevCandidate = candidates[i - 1];
          if (candidate.startIndex < prevCandidate.endIndex) {
            const overlapText = document.content!.substring(
              candidate.startIndex, 
              Math.min(candidate.endIndex, prevCandidate.endIndex)
            );
            overlapTokens = this.analyzer.countTokens(overlapText);
          }
        }
        
        const chunk = await chunkService.createChunk({
          chunk_id: `${documentId}#C${String(i + 1).padStart(3, '0')}`,
          document_id: documentId,
          chunk_type: candidate.type,
          section_heading: candidate.sectionHeading || null,
          page_start: pageStart,
          page_end: pageEnd,
          char_start: candidate.startIndex,
          char_end: candidate.endIndex,
          token_count: this.analyzer.countTokens(document.content!.substring(candidate.startIndex, candidate.endIndex)),
          overlap_tokens: overlapTokens,
          chunk_handle: this.generateHandle(candidate.sectionHeading || `chunk-${i + 1}`),
          chunk_text: document.content!.substring(candidate.startIndex, candidate.endIndex),
          created_by: userId,
        });

        chunks.push(chunk);
      }

      // Update document status
      await supabase
        .from('documents')
        .update({
          chunk_extraction_status: 'completed',
          total_chunks_extracted: chunks.length,
        })
        .eq('id', documentId);

      // Complete job
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'completed',
        progress_percentage: 100,
        total_chunks_extracted: chunks.length,
        completed_at: new Date().toISOString(),
        current_step: 'Extraction complete',
      });

      return chunks;

    } catch (error: any) {
      // Mark job as failed
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString(),
      });
      throw error;
    }
  }

  private generateHandle(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
}

