/**
 * API Route: Manually trigger enrichment pipeline
 * POST /api/conversations/[id]/enrich
 * 
 * Useful for:
 * - Retrying failed enrichments
 * - Triggering enrichment for old conversations
 * - Testing enrichment pipeline
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseAdminClient } from '@/lib/supabase-server';
import { getPipelineOrchestrator } from '@/lib/services/enrichment-pipeline-orchestrator';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    // Create admin client for service operations
    const supabase = createServerSupabaseAdminClient();

    // Get conversation to verify it exists and get user_id
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('conversation_id, created_by, enrichment_status, raw_response_path')
      .eq('conversation_id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify raw response exists
    if (!conversation.raw_response_path) {
      return NextResponse.json(
        { error: 'No raw response found for this conversation. Cannot enrich without raw data.' },
        { status: 400 }
      );
    }

    // Get user_id (prefer created_by, fallback to auth if available)
    let userId = conversation.created_by;
    
    if (!userId) {
      // Try to get from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      } else {
        // Use a default system user ID if no user context
        userId = '00000000-0000-0000-0000-000000000000';
      }
    }

    // Run pipeline
    console.log(`[API] Manually triggering enrichment for ${conversationId}`);
    const orchestrator = getPipelineOrchestrator();
    const result = await orchestrator.runPipeline(conversationId, userId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        conversation_id: result.conversationId,
        final_status: result.finalStatus,
        stages_completed: result.stagesCompleted,
        enriched_path: result.enrichedPath,
        enriched_size: result.enrichedSize,
        message: 'Enrichment pipeline completed successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        conversation_id: result.conversationId,
        final_status: result.finalStatus,
        stages_completed: result.stagesCompleted,
        error: result.error,
        validation_report: result.validationReport,
        message: 'Enrichment pipeline failed'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations/[id]/enrich
 * Check if conversation can be enriched
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const supabase = createServerSupabaseAdminClient();

    // Get conversation status
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('conversation_id, enrichment_status, raw_response_path, validation_report, enrichment_error')
      .eq('conversation_id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const canEnrich = !!conversation.raw_response_path;
    const needsRetry = ['validation_failed', 'normalization_failed'].includes(conversation.enrichment_status);

    return NextResponse.json({
      conversation_id: conversationId,
      enrichment_status: conversation.enrichment_status,
      can_enrich: canEnrich,
      needs_retry: needsRetry,
      has_raw_response: !!conversation.raw_response_path,
      has_validation_report: !!conversation.validation_report,
      enrichment_error: conversation.enrichment_error,
      message: canEnrich
        ? 'Conversation can be enriched'
        : 'Cannot enrich: No raw response available'
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


