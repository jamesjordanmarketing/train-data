/**
 * API Route: Process Next Batch Item
 * 
 * POST /api/batch-jobs/[id]/process-next
 * Process a single item from the batch job queue
 * 
 * This endpoint is designed for polling-based processing to work around
 * Vercel serverless function execution limits. The client calls this
 * endpoint repeatedly until all items are processed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { batchJobService } from '@/lib/services/batch-job-service';
import { getConversationGenerationService } from '@/lib/services/conversation-generation-service';
import { createServerSupabaseAdminClient } from '@/lib/supabase-server';

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

/**
 * Append log entry to batch job log file in Supabase Storage
 */
async function appendBatchLog(jobId: string, message: string): Promise<void> {
  try {
    const supabase = createServerSupabaseAdminClient();
    const logPath = `${jobId}/log.txt`;
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    // Try to download existing log file
    const { data: existingData } = await supabase.storage
      .from('batch-logs')
      .download(logPath);
    
    let updatedContent = logEntry;
    if (existingData) {
      const existingText = await existingData.text();
      updatedContent = existingText + logEntry;
    }
    
    // Upload updated log file
    await supabase.storage
      .from('batch-logs')
      .upload(logPath, updatedContent, {
        contentType: 'text/plain',
        upsert: true,
      });
  } catch (error) {
    // Log to console but don't fail the request
    console.error(`[BatchLog] Failed to append log for job ${jobId}:`, error);
  }
}

interface ProcessResult {
  success: boolean;
  itemId?: string;
  conversationId?: string;
  error?: string;
  status: 'processed' | 'no_items' | 'job_cancelled' | 'job_completed' | 'error';
  remainingItems: number;
  progress: {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    percentage: number;
  };
}

/**
 * Auto-select template based on emotional arc
 */
async function autoSelectTemplate(
  emotionalArcId: string,
  tier?: string
): Promise<string | null> {
  try {
    // Use admin client to bypass RLS for template/arc lookups
    const supabase = createServerSupabaseAdminClient();
    
    // Get the arc_key from emotional_arcs table
    const { data: arcData, error: arcError } = await supabase
      .from('emotional_arcs')
      .select('arc_key')
      .eq('id', emotionalArcId)
      .single();

    if (arcError || !arcData) {
      console.log(`[ProcessNext] Emotional arc not found: ${emotionalArcId}`);
      return null;
    }

    const arcType = arcData.arc_key;
    console.log(`[ProcessNext] Looking for template with arc_type: ${arcType}, tier: ${tier}`);

    // Find a template with matching emotional_arc_type
    let query = supabase
      .from('prompt_templates')
      .select('id')
      .eq('emotional_arc_type', arcType);

    if (tier) {
      query = query.eq('tier', tier);
    }

    const { data: templateData, error: templateError } = await query.limit(1).single();

    if (templateError || !templateData) {
      // Try without tier filter
      const { data: anyTierData, error: anyTierError } = await supabase
        .from('prompt_templates')
        .select('id')
        .eq('emotional_arc_type', arcType)
        .limit(1)
        .single();

      if (anyTierError || !anyTierData) {
        console.warn(`[ProcessNext] No template found for arc_type=${arcType}`);
        return null;
      }

      console.log(`[ProcessNext] Auto-selected template ${anyTierData.id} (any tier) for arc ${arcType}`);
      return anyTierData.id;
    }

    console.log(`[ProcessNext] Auto-selected template ${templateData.id} for arc ${arcType}, tier ${tier}`);
    return templateData.id;

  } catch (error) {
    console.error(`[ProcessNext] Error auto-selecting template:`, error);
    return null;
  }
}

/**
 * POST /api/batch-jobs/[id]/process-next
 * Process the next queued item in the batch job
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ProcessResult>> {
  const startTime = Date.now();
  
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID is required',
        status: 'error',
        remainingItems: 0,
        progress: { total: 0, completed: 0, successful: 0, failed: 0, percentage: 0 },
      }, { status: 400 });
    }

    console.log(`[ProcessNext] Processing next item for job ${jobId}`);

    // Get current job status
    const job = await batchJobService.getJobById(jobId);

    if (!job) {
      return NextResponse.json({
        success: false,
        error: 'Job not found',
        status: 'error',
        remainingItems: 0,
        progress: { total: 0, completed: 0, successful: 0, failed: 0, percentage: 0 },
      }, { status: 404 });
    }

    // Check if job is cancelled or completed
    if (job.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        status: 'job_cancelled',
        remainingItems: 0,
        progress: {
          total: job.totalItems,
          completed: job.completedItems,
          successful: job.successfulItems,
          failed: job.failedItems,
          percentage: Math.round((job.completedItems / job.totalItems) * 100),
        },
      });
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return NextResponse.json({
        success: true,
        status: 'job_completed',
        remainingItems: 0,
        progress: {
          total: job.totalItems,
          completed: job.completedItems,
          successful: job.successfulItems,
          failed: job.failedItems,
          percentage: 100,
        },
      });
    }

    // Find next queued item
    const queuedItems = job.items?.filter(item => item.status === 'queued') || [];
    
    if (queuedItems.length === 0) {
      // No more items to process - mark job as complete
      const finalStatus = job.failedItems === job.totalItems ? 'failed' : 'completed';
      await batchJobService.updateJobStatus(jobId, finalStatus);
      
      // Log completion to storage
      await appendBatchLog(jobId, `Batch job complete - ${job.successfulItems} successful, ${job.failedItems} failed`);
      
      return NextResponse.json({
        success: true,
        status: 'job_completed',
        remainingItems: 0,
        progress: {
          total: job.totalItems,
          completed: job.completedItems,
          successful: job.successfulItems,
          failed: job.failedItems,
          percentage: 100,
        },
      });
    }

    // Get the first queued item
    const item = queuedItems[0];
    console.log(`[ProcessNext] Processing item ${item.id} (${queuedItems.length} remaining)`);

    // Log to storage
    await appendBatchLog(jobId, `Processing item ${item.id.slice(0, 8)}... (${queuedItems.length} remaining)`);

    // Update item status to processing
    await batchJobService.updateItemStatus(item.id, 'processing');

    // Ensure job is in processing status
    if (job.status === 'queued') {
      await batchJobService.updateJobStatus(jobId, 'processing');
    }

    try {
      // Resolve template ID
      let templateId = item.parameters?.templateId;

      if (!templateId || templateId === NIL_UUID) {
        console.log(`[ProcessNext] Auto-selecting template for item ${item.id}`);

        const emotionalArcId = item.parameters?.emotional_arc_id;
        if (emotionalArcId) {
          const autoSelectedId = await autoSelectTemplate(emotionalArcId, item.tier);
          if (autoSelectedId) {
            templateId = autoSelectedId;
            console.log(`[ProcessNext] Auto-selected template ${templateId}`);
          } else {
            throw new Error('No suitable template found for the emotional arc.');
          }
        } else {
          throw new Error('Cannot auto-select template: no emotional_arc_id provided.');
        }
      }

      // Generate conversation
      const generationService = getConversationGenerationService();
      const result = await generationService.generateSingleConversation({
        templateId,
        parameters: item.parameters || {},
        tier: item.tier,
        userId: job.createdBy || '00000000-0000-0000-0000-000000000000',
        runId: jobId,
      });

      const durationMs = Date.now() - startTime;

      if (result.success) {
        // Use the PRIMARY KEY (id), not the business key (conversation_id)
        // The FK constraint on batch_items.conversation_id references conversations.id (PK)
        const convId = result.conversation.id;
        
        await batchJobService.incrementProgress(
          jobId,
          item.id,
          'completed',
          convId
        );

        console.log(`[ProcessNext] Item ${item.id} completed in ${durationMs}ms: ${convId}`);
        
        // Log success to storage
        await appendBatchLog(jobId, `✓ Item ${item.id.slice(0, 8)}... completed (conversation: ${convId.slice(0, 8)}...)`);

        // Get updated job status
        const updatedJob = await batchJobService.getJobById(jobId);
        const remainingItems = updatedJob.items?.filter(i => i.status === 'queued').length || 0;

        return NextResponse.json({
          success: true,
          itemId: item.id,
          conversationId: convId,
          status: 'processed',
          remainingItems,
          progress: {
            total: updatedJob.totalItems,
            completed: updatedJob.completedItems,
            successful: updatedJob.successfulItems,
            failed: updatedJob.failedItems,
            percentage: Math.round((updatedJob.completedItems / updatedJob.totalItems) * 100),
          },
        });
      } else {
        // Generation failed
        await batchJobService.incrementProgress(
          jobId,
          item.id,
          'failed',
          undefined,
          result.error || 'Generation failed'
        );

        console.error(`[ProcessNext] Item ${item.id} failed in ${durationMs}ms: ${result.error}`);
        
        // Log failure to storage
        await appendBatchLog(jobId, `✗ Item ${item.id.slice(0, 8)}... failed: ${result.error || 'Unknown error'}`);

        const updatedJob = await batchJobService.getJobById(jobId);
        const remainingItems = updatedJob.items?.filter(i => i.status === 'queued').length || 0;

        return NextResponse.json({
          success: false,
          itemId: item.id,
          error: result.error,
          status: 'processed',
          remainingItems,
          progress: {
            total: updatedJob.totalItems,
            completed: updatedJob.completedItems,
            successful: updatedJob.successfulItems,
            failed: updatedJob.failedItems,
            percentage: Math.round((updatedJob.completedItems / updatedJob.totalItems) * 100),
          },
        });
      }
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`[ProcessNext] Item ${item.id} error in ${durationMs}ms:`, error);
      
      // Log error to storage
      await appendBatchLog(jobId, `✗ Error processing item ${item.id.slice(0, 8)}...: ${errorMessage}`);

      await batchJobService.incrementProgress(
        jobId,
        item.id,
        'failed',
        undefined,
        errorMessage
      );

      const updatedJob = await batchJobService.getJobById(jobId);
      const remainingItems = updatedJob.items?.filter(i => i.status === 'queued').length || 0;

      return NextResponse.json({
        success: false,
        itemId: item.id,
        error: errorMessage,
        status: 'processed',
        remainingItems,
        progress: {
          total: updatedJob.totalItems,
          completed: updatedJob.completedItems,
          successful: updatedJob.successfulItems,
          failed: updatedJob.failedItems,
          percentage: Math.round((updatedJob.completedItems / updatedJob.totalItems) * 100),
        },
      });
    }

  } catch (error) {
    console.error('[ProcessNext] Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error',
      remainingItems: 0,
      progress: { total: 0, completed: 0, successful: 0, failed: 0, percentage: 0 },
    }, { status: 500 });
  }
}
