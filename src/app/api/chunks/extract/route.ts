import { NextRequest, NextResponse } from 'next/server';
import { ChunkExtractor } from '../../../../lib/chunk-extraction/extractor';
import { DimensionGenerator } from '../../../../lib/dimension-generation/generator';
import { chunkExtractionJobService, chunkService } from '../../../../lib/database';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 [Extract API] Received extraction request');
    
    const { documentId, forceReExtract } = await request.json();
    console.log(`📥 [Extract API] Document ID: ${documentId}, Force Re-extract: ${forceReExtract}`);

    if (!documentId) {
      console.error('❌ [Extract API] Missing documentId');
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ [Extract API] ANTHROPIC_API_KEY not configured in environment variables');
      return NextResponse.json(
        { 
          error: 'AI service not configured. Please set ANTHROPIC_API_KEY in Vercel environment variables.',
          details: 'Missing ANTHROPIC_API_KEY'
        },
        { status: 500 }
      );
    }

    console.log('✅ [Extract API] Environment variables verified');

    // Get server-side Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Get current user (optional - will use null if not authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    console.log(`✅ [Extract API] User authenticated: ${userId ? 'Yes' : 'No (using null)'}`);


    // NEW: Check if chunks already exist
    console.log(`🔍 [Extract API] Checking for existing chunks...`);
    const existingChunkCount = await chunkService.getChunkCount(documentId);
    console.log(`📊 [Extract API] Found ${existingChunkCount} existing chunks`);
    
    if (existingChunkCount > 0 && forceReExtract !== true) {
      // Chunks already exist and forceReExtract not set
      console.log(`⚠️ [Extract API] Chunks already exist, returning error`);
      return NextResponse.json(
        { 
          error: 'Chunks already exist for this document',
          existingChunks: existingChunkCount,
          hint: 'Set forceReExtract=true to delete existing chunks and re-extract'
        },
        { status: 400 }
      );
    }

    // NEW: If forceReExtract is true, delete all existing chunks and dimensions
    if (forceReExtract === true && existingChunkCount > 0) {
      console.log(`🗑️ [Extract API] Deleting ${existingChunkCount} existing chunks for document ${documentId}`);
      
      // Delete all chunk_dimensions first (foreign key constraint)
      const chunks = await chunkService.getChunksByDocument(documentId);
      for (const chunk of chunks) {
        await supabase
          .from('chunk_dimensions')
          .delete()
          .eq('chunk_id', chunk.id);
      }
      
      // Delete all chunks
      await chunkService.deleteChunksByDocument(documentId);
      console.log(`✅ [Extract API] Deleted all chunks and dimensions for document ${documentId}`);
    }

    // Start extraction
    console.log(`🚀 [Extract API] Starting chunk extraction...`);
    const extractor = new ChunkExtractor();
    const chunks = await extractor.extractChunksForDocument(documentId, userId);
    console.log(`✅ [Extract API] Extracted ${chunks.length} chunks`);

    // Get the extraction job to update its status
    console.log(`📝 [Extract API] Updating extraction job status...`);
    const job = await chunkExtractionJobService.getLatestJob(documentId);
    
    if (job) {
      // Update job status to generating_dimensions
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'generating_dimensions',
        current_step: 'Generating AI dimensions for chunks',
      });
      console.log(`✅ [Extract API] Updated job ${job.id} to generating_dimensions`);
    } else {
      console.warn(`⚠️ [Extract API] No extraction job found for document ${documentId}`);
    }

    // Automatically trigger dimension generation
    console.log(`🎯 [Extract API] Starting dimension generation...`);
    const generator = new DimensionGenerator();
    const runId = await generator.generateDimensionsForDocument({
      documentId,
      userId,
    });
    console.log(`✅ [Extract API] Dimension generation completed with run ID: ${runId}`);

    // Update job to completed
    if (job) {
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'completed',
        current_step: 'Dimension generation complete',
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
      });
      console.log(`✅ [Extract API] Updated job ${job.id} to completed`);
    }

    console.log(`🎉 [Extract API] Extraction successful! Returning response...`);
    return NextResponse.json({
      success: true,
      chunksExtracted: chunks.length,
      reExtracted: forceReExtract === true,
      runId,
      chunks,
    });

  } catch (error: any) {
    console.error('❌ [Extract API] Chunk extraction error:', error);
    console.error('❌ [Extract API] Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Extraction failed',
        details: error.stack || 'No stack trace available'
      },
      { status: 500 }
    );
  }
}

