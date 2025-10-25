import { supabase } from '../supabase';
import { textExtractor, ExtractionError } from './text-extractor';
import { SupportedFileType } from '../types/upload';

/**
 * Document Processor
 * 
 * Orchestrates the complete document processing workflow:
 * 1. Fetch document record from database
 * 2. Download file from Supabase Storage
 * 3. Extract text using TextExtractor
 * 4. Update database with extracted content
 * 5. Handle errors and update status
 */
export class DocumentProcessor {
  /**
   * Process a document: extract text and update database
   * @param documentId - UUID of document to process
   * @returns Success status and extracted text length
   */
  async processDocument(documentId: string): Promise<{ 
    success: boolean; 
    textLength?: number;
    error?: string;
  }> {
    console.log(`[DocumentProcessor] Starting processing for document: ${documentId}`);
    
    try {
      // ================================================
      // STEP 1: Fetch Document Record
      // ================================================
      console.log(`[DocumentProcessor] Fetching document record...`);
      
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        throw new Error(`Failed to fetch document: ${fetchError?.message || 'Not found'}`);
      }

      // Check if already processed
      if (document.status === 'completed') {
        console.log(`[DocumentProcessor] Document already processed, skipping`);
        return { success: true, textLength: document.content?.length || 0 };
      }

      // Validate required fields
      if (!document.file_path) {
        throw new Error('Document has no file_path');
      }

      if (!document.source_type) {
        throw new Error('Document has no source_type');
      }

      // ================================================
      // STEP 2: Update Status to Processing
      // ================================================
      console.log(`[DocumentProcessor] Updating status to 'processing'...`);
      
      await supabase
        .from('documents')
        .update({
          status: 'processing',
          processing_progress: 10,
          processing_started_at: new Date().toISOString(),
          processing_error: null
        })
        .eq('id', documentId);

      // ================================================
      // STEP 3: Download File from Storage
      // ================================================
      console.log(`[DocumentProcessor] Downloading file from storage: ${document.file_path}`);
      
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download file: ${downloadError?.message || 'File not found'}`);
      }

      // Convert Blob to Buffer
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`[DocumentProcessor] File downloaded: ${buffer.length} bytes`);

      // Update progress
      await this.updateProgress(documentId, 30);

      // ================================================
      // STEP 4: Extract Text
      // ================================================
      console.log(`[DocumentProcessor] Extracting text from ${document.source_type} file...`);
      
      const extractedText = await textExtractor.extractText(
        buffer,
        document.source_type as SupportedFileType,
        documentId
      );

      console.log(`[DocumentProcessor] Text extracted: ${extractedText.length} characters`);

      // Update progress
      await this.updateProgress(documentId, 70);

      // ================================================
      // STEP 5: Validate Extracted Text
      // ================================================
      textExtractor.validateExtractedText(extractedText, documentId);

      // Update progress
      await this.updateProgress(documentId, 85);

      // ================================================
      // STEP 6: Update Database with Extracted Content
      // ================================================
      console.log(`[DocumentProcessor] Updating database with extracted content...`);
      
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          content: extractedText,
          status: 'completed',
          processing_progress: 100,
          processing_completed_at: new Date().toISOString(),
          processing_error: null
        })
        .eq('id', documentId);

      if (updateError) {
        throw new Error(`Failed to update document: ${updateError.message}`);
      }

      console.log(`[DocumentProcessor] Processing completed successfully for ${documentId}`);
      
      return { 
        success: true, 
        textLength: extractedText.length 
      };

    } catch (error) {
      // ================================================
      // ERROR HANDLING
      // ================================================
      console.error(`[DocumentProcessor] Processing failed for ${documentId}:`, error);
      
      let errorMessage: string;
      let recoverable = true;

      if (error instanceof ExtractionError) {
        errorMessage = error.message;
        recoverable = error.recoverable;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error during processing';
      }

      // Update database with error status
      await supabase
        .from('documents')
        .update({
          status: 'error',
          processing_progress: 0,
          processing_error: errorMessage,
          processing_completed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  /**
   * Update processing progress in database
   * @param documentId - Document UUID
   * @param progress - Progress percentage (0-100)
   */
  private async updateProgress(documentId: string, progress: number): Promise<void> {
    await supabase
      .from('documents')
      .update({ processing_progress: progress })
      .eq('id', documentId);
  }

  /**
   * Retry processing for a document in error state
   * @param documentId - Document UUID
   * @returns Processing result
   */
  async retryProcessing(documentId: string): Promise<{ 
    success: boolean; 
    textLength?: number;
    error?: string;
  }> {
    console.log(`[DocumentProcessor] Retrying processing for document: ${documentId}`);
    
    // Reset status to uploaded
    await supabase
      .from('documents')
      .update({
        status: 'uploaded',
        processing_progress: 0,
        processing_error: null,
        processing_started_at: null,
        processing_completed_at: null
      })
      .eq('id', documentId);

    // Process again
    return this.processDocument(documentId);
  }
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor();

