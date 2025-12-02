/**
 * Failed Generation Download API Route
 * 
 * GET /api/failed-generations/[id]/download
 * Returns the full RAW Error File Report JSON for download
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFailedGenerationService } from '@/lib/services/failed-generation-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing failure ID' },
        { status: 400 }
      );
    }
    
    const service = getFailedGenerationService();
    const report = await service.downloadErrorReport(id);
    
    if (!report) {
      // If no stored report, generate one from the database record
      const failure = await service.getFailedGeneration(id);
      
      if (!failure) {
        return NextResponse.json(
          { error: 'Failed generation not found' },
          { status: 404 }
        );
      }
      
      // Generate report from failure record
      const generatedReport = {
        error_report: {
          failure_type: failure.failure_type,
          stop_reason: failure.stop_reason,
          stop_reason_analysis: getStopReasonAnalysis(failure.stop_reason),
          truncation_pattern: failure.truncation_pattern,
          truncation_details: failure.truncation_details,
          timestamp: failure.created_at,
          analysis: {
            input_tokens: failure.input_tokens || 0,
            output_tokens: failure.output_tokens || 0,
            max_tokens_configured: failure.max_tokens,
            tokens_remaining: failure.max_tokens - (failure.output_tokens || 0),
            conclusion: getConclusion(failure),
          },
        },
        request_context: {
          model: failure.model,
          temperature: failure.temperature || 0.7,
          max_tokens: failure.max_tokens,
          structured_outputs_enabled: failure.structured_outputs_enabled,
          prompt_length: failure.prompt_length,
        },
        raw_response: failure.raw_response,
        extracted_content: failure.response_content || '',
        scaffolding_context: {
          persona_id: failure.persona_id,
          emotional_arc_id: failure.emotional_arc_id,
          training_topic_id: failure.training_topic_id,
          template_id: failure.template_id,
        },
      };
      
      return NextResponse.json(generatedReport);
    }
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('[API] Error downloading error report:', error);
    return NextResponse.json(
      { error: 'Failed to download error report' },
      { status: 500 }
    );
  }
}

function getStopReasonAnalysis(stopReason: string | null): string {
  if (stopReason === 'end_turn') {
    return 'Claude finished naturally, but content appears truncated - unexpected behavior';
  } else if (stopReason === 'max_tokens') {
    return 'Claude hit max_tokens limit - response was cut off';
  } else if (!stopReason) {
    return 'stop_reason not available - may indicate API error or missing field';
  }
  return `Unknown stop_reason: ${stopReason}`;
}

function getConclusion(failure: {
  stop_reason: string | null;
  output_tokens: number | null;
  max_tokens: number;
}): string {
  const outputTokens = failure.output_tokens || 0;
  const maxTokens = failure.max_tokens;
  const tokensRemaining = maxTokens - outputTokens;
  
  if (failure.stop_reason === 'max_tokens') {
    return `Truncation caused by max_tokens limit (${maxTokens})`;
  } else if (tokensRemaining > maxTokens * 0.8) {
    return `Truncation occurred FAR below max_tokens limit (used ${outputTokens}/${maxTokens} tokens) - root cause unknown`;
  } else {
    return 'Truncation cause unclear - review raw response and stop_reason';
  }
}

