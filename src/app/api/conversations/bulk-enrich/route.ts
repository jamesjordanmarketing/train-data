/**
 * API Route: Bulk Conversation Enrichment
 * 
 * POST /api/conversations/bulk-enrich
 * Triggers enrichment pipeline for multiple conversations
 * 
 * This endpoint is used by:
 * - Batch job page after generation completes
 * - Manual "Enrich All" actions on conversation lists
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseAdminClient } from '@/lib/supabase-server';
import { getPipelineOrchestrator } from '@/lib/services/enrichment-pipeline-orchestrator';

// Validation schema
const BulkEnrichRequestSchema = z.object({
  conversationIds: z.array(z.string().uuid()).min(1).max(100),
  sequential: z.boolean().optional().default(true),
});

type EnrichmentResult = {
  conversationId: string;
  status: 'enriched' | 'failed' | 'skipped';
  error?: string;
  enrichmentStatus?: string;
};

export async function POST(request: NextRequest) {
  console.log('[BulkEnrich] Starting bulk enrichment request');
  
  try {
    const body = await request.json();
    const validated = BulkEnrichRequestSchema.parse(body);
    
    console.log(`[BulkEnrich] Processing ${validated.conversationIds.length} conversations`);
    
    const supabase = createServerSupabaseAdminClient();
    const orchestrator = getPipelineOrchestrator();
    
    const results: EnrichmentResult[] = [];
    
    // Process each conversation sequentially
    for (const conversationId of validated.conversationIds) {
      try {
        console.log(`[BulkEnrich] Processing ${conversationId}`);
        
        // Get conversation to verify it exists and get user_id
        // First try by conversation_id (correct), then fallback to id (legacy bug)
        let conversation = null;
        let actualConversationId = conversationId;
        
        // Try conversation_id first (correct field)
        const { data: convByConvId, error: _convError1 } = await supabase
          .from('conversations')
          .select('conversation_id, created_by, enrichment_status, raw_response_path')
          .eq('conversation_id', conversationId)
          .single();
        
        if (convByConvId) {
          conversation = convByConvId;
          actualConversationId = convByConvId.conversation_id;
        } else {
          // Fallback: try by id (database row ID) - fixes legacy bug where wrong ID was stored
          console.log(`[BulkEnrich] ⚠️ Not found by conversation_id, trying by id...`);
          const { data: convById, error: _convError2 } = await supabase
            .from('conversations')
            .select('conversation_id, created_by, enrichment_status, raw_response_path')
            .eq('id', conversationId)
            .single();
          
          if (convById) {
            conversation = convById;
            actualConversationId = convById.conversation_id;
            console.log(`[BulkEnrich] ✅ Found by id, actual conversation_id: ${actualConversationId}`);
          }
        }
        
        if (!conversation) {
          console.log(`[BulkEnrich] ❌ Conversation ${conversationId} not found`);
          results.push({
            conversationId,
            status: 'failed',
            error: 'Conversation not found',
          });
          continue;
        }
        
        // Skip if already enriched
        if (conversation.enrichment_status === 'completed') {
          console.log(`[BulkEnrich] ⏭️ Skipping ${actualConversationId} - already completed`);
          results.push({
            conversationId,
            status: 'skipped',
            enrichmentStatus: 'completed',
          });
          continue;
        }
        
        // Skip if no raw response
        if (!conversation.raw_response_path) {
          console.log(`[BulkEnrich] ❌ ${actualConversationId} has no raw response`);
          results.push({
            conversationId,
            status: 'failed',
            error: 'No raw response found',
          });
          continue;
        }
        
        // Get user_id from conversation or use system user
        const userId = conversation.created_by || '00000000-0000-0000-0000-000000000000';
        
        // Run enrichment pipeline using the actual conversation_id
        const result = await orchestrator.runPipeline(actualConversationId, userId);
        
        if (result.success) {
          console.log(`[BulkEnrich] ✅ ${actualConversationId} enriched successfully`);
          results.push({
            conversationId,
            status: 'enriched',
            enrichmentStatus: result.finalStatus,
          });
        } else {
          console.log(`[BulkEnrich] ❌ ${actualConversationId} enrichment failed: ${result.error}`);
          results.push({
            conversationId,
            status: 'failed',
            error: result.error,
            enrichmentStatus: result.finalStatus,
          });
        }
        
      } catch (error) {
        console.error(`[BulkEnrich] Error processing ${conversationId}:`, error);
        results.push({
          conversationId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    // Calculate summary
    const summary = {
      total: validated.conversationIds.length,
      successful: results.filter(r => r.status === 'enriched').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
    };
    
    console.log(`[BulkEnrich] Complete - ${summary.successful}/${summary.total} enriched, ${summary.failed} failed, ${summary.skipped} skipped`);
    
    return NextResponse.json({
      success: summary.failed === 0,
      summary,
      results,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[BulkEnrich] Validation error:', error.issues);
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('[BulkEnrich] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk enrichment' },
      { status: 500 }
    );
  }
}
