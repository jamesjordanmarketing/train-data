/**
 * POST /api/conversations/generate-with-scaffolding
 * 
 * Generate conversation using scaffolding parameters (persona, emotional arc, training topic).
 * Orchestrates parameter assembly, template selection, and conversation generation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';
import { ParameterAssemblyService } from '@/lib/services/parameter-assembly-service';
import { TemplateSelectionService } from '@/lib/services/template-selection-service';
import { getConversationGenerationService } from '@/lib/services';
import type { GenerationParams } from '@/lib/services';

// Validation schema
const GenerateWithScaffoldingSchema = z.object({
  persona_id: z.string().uuid('Persona ID must be a valid UUID'),
  emotional_arc_id: z.string().uuid('Emotional arc ID must be a valid UUID'),
  training_topic_id: z.string().uuid('Training topic ID must be a valid UUID'),
  tier: z.enum(['template', 'scenario', 'edge_case']),
  template_id: z.string().uuid().optional(),
  chunk_id: z.string().uuid().optional(),
  chunk_context: z.string().optional(),
  document_id: z.string().uuid().optional(),
  temperature: z.number().min(0).max(1).optional(),
  max_tokens: z.number().min(100).max(8192).optional(),
  created_by: z.string().optional(),
});

export const maxDuration = 300; // 5 minutes for Claude API calls

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parse and validate request
    const body = await request.json();
    const validated = GenerateWithScaffoldingSchema.parse(body);

    // 2. Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'AI service not configured',
          details: 'Missing ANTHROPIC_API_KEY environment variable',
        },
        { status: 500 }
      );
    }

    // 3. Initialize services
    const supabase = createClient();
    const scaffoldingService = new ScaffoldingDataService(supabase);
    const templateSelectionService = new TemplateSelectionService(supabase);
    const parameterAssemblyService = new ParameterAssemblyService(
      scaffoldingService,
      templateSelectionService
    );
    const conversationGenerationService = getConversationGenerationService();

    // 4. Assemble parameters
    console.log('Assembling scaffolding parameters...');
    const assembled = await parameterAssemblyService.assembleParameters({
      persona_id: validated.persona_id,
      emotional_arc_id: validated.emotional_arc_id,
      training_topic_id: validated.training_topic_id,
      tier: validated.tier,
      template_id: validated.template_id,
      chunk_id: validated.chunk_id,
      chunk_context: validated.chunk_context,
      document_id: validated.document_id,
      temperature: validated.temperature,
      max_tokens: validated.max_tokens,
      created_by: validated.created_by,
    });

    console.log(`✓ Parameters assembled with template: ${assembled.conversation_params.template_id}`);
    console.log(`  Compatibility score: ${assembled.metadata.compatibility_score}`);
    if (assembled.metadata.warnings.length > 0) {
      console.log(`  Warnings: ${assembled.metadata.warnings.join('; ')}`);
    }

    // 5. Generate conversation using the conversation generation service
    console.log('Generating conversation...');
    const generationParams: GenerationParams = {
      templateId: assembled.conversation_params.template_id!,
      parameters: assembled.template_variables,
      tier: validated.tier,
      userId: validated.created_by || '00000000-0000-0000-0000-000000000000',
      temperature: assembled.conversation_params.temperature,
      maxTokens: assembled.conversation_params.max_tokens,
      category: [], // Could be derived from training topic category if needed
    };

    const result = await conversationGenerationService.generateSingleConversation(generationParams);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Generation failed',
          message: result.error || 'Unknown error',
          details: result.error,
        },
        { status: 500 }
      );
    }

    console.log(`✓ Conversation generated: ${result.conversation.id}`);
    console.log(`  Quality score: ${result.conversation.qualityScore}`);
    console.log(`  Turn count: ${result.conversation.totalTurns}`);
    console.log(`  Cost: $${result.metrics.cost.toFixed(4)}`);

    // 6. Update conversation with scaffolding provenance
    console.log('Updating conversation with scaffolding data...');
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        persona_id: validated.persona_id,
        emotional_arc_id: validated.emotional_arc_id,
        training_topic_id: validated.training_topic_id,
        scaffolding_snapshot: {
          persona: {
            id: assembled.conversation_params.persona.id,
            name: assembled.conversation_params.persona.name,
            persona_key: assembled.conversation_params.persona.persona_key,
            emotional_baseline: assembled.conversation_params.persona.emotional_baseline,
          },
          emotional_arc: {
            id: assembled.conversation_params.emotional_arc.id,
            name: assembled.conversation_params.emotional_arc.name,
            arc_key: assembled.conversation_params.emotional_arc.arc_key,
            starting_emotion: assembled.conversation_params.emotional_arc.starting_emotion,
            ending_emotion: assembled.conversation_params.emotional_arc.ending_emotion,
          },
          training_topic: {
            id: assembled.conversation_params.training_topic.id,
            name: assembled.conversation_params.training_topic.name,
            topic_key: assembled.conversation_params.training_topic.topic_key,
            complexity_level: assembled.conversation_params.training_topic.complexity_level,
          },
          generation_timestamp: new Date().toISOString(),
          scaffolding_version: '1.0',
          compatibility_score: assembled.metadata.compatibility_score,
          system_prompt: assembled.system_prompt,
        },
      })
      .eq('id', result.conversation.id);

    if (updateError) {
      console.error('⚠️ Failed to update conversation with scaffolding data:', updateError);
      // Don't fail the request, just log the error
    } else {
      console.log('✓ Conversation updated with scaffolding provenance');
    }

    // 7. Return success response
    return NextResponse.json(
      {
        success: true,
        conversation_id: result.conversation.id,
        conversation: result.conversation,
        metadata: {
          generation_time_ms: Date.now() - startTime,
          token_count: result.conversation.totalTokens,
          compatibility_score: assembled.metadata.compatibility_score,
          compatibility_warnings: assembled.metadata.warnings,
          compatibility_suggestions: assembled.metadata.suggestions,
          template_used: assembled.conversation_params.template_id,
          scaffolding: {
            persona_name: assembled.conversation_params.persona.name,
            emotional_arc_name: assembled.conversation_params.emotional_arc.name,
            training_topic_name: assembled.conversation_params.training_topic.name,
          },
        },
        quality_metrics: {
          quality_score: result.conversation.qualityScore,
          turn_count: result.conversation.totalTurns,
          status: result.conversation.status,
        },
        cost: result.metrics.cost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Conversation generation with scaffolding failed:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Generic error handler
    return NextResponse.json(
      {
        success: false,
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations/generate-with-scaffolding
 * Get API information
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    info: {
      endpoint: 'POST /api/conversations/generate-with-scaffolding',
      description: 'Generate a conversation using scaffolding parameters',
      requiredFields: ['persona_id', 'emotional_arc_id', 'training_topic_id', 'tier'],
      optionalFields: [
        'template_id',
        'chunk_id',
        'chunk_context',
        'document_id',
        'temperature',
        'max_tokens',
        'created_by',
      ],
    },
  });
}

