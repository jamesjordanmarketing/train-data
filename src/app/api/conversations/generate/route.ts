/**
 * API Route: Single Conversation Generation
 * 
 * POST /api/conversations/generate
 * Generates a single conversation using the new conversation generation service
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getConversationGenerationService } from '@/lib/services';
import type { GenerationParams } from '@/lib/services';

// Validation schema
const GenerateRequestSchema = z.object({
  templateId: z.string().uuid('Template ID must be a valid UUID'),
  parameters: z.record(z.string(), z.any()),
  tier: z.enum(['template', 'scenario', 'edge_case']),
  userId: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(100).max(8192).optional(),
  category: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validated = GenerateRequestSchema.parse(body);
    
    // Get user ID (from body or use default for testing)
    const userId = validated.userId || '00000000-0000-0000-0000-000000000000';
    
    // Check for API key
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
    
    // Prepare generation parameters
    const generationParams: GenerationParams = {
      templateId: validated.templateId,
      parameters: validated.parameters,
      tier: validated.tier,
      userId,
      temperature: validated.temperature,
      maxTokens: validated.maxTokens,
      category: validated.category,
    };
    
    // Get conversation generation service
    const generationService = getConversationGenerationService();
    
    // Generate conversation
    const result = await generationService.generateSingleConversation(generationParams);
    
    // Check if generation was successful
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
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        conversation: result.conversation,
        cost: result.conversation.actualCostUsd,
        qualityMetrics: {
          qualityScore: result.conversation.qualityScore,
          turnCount: result.conversation.totalTurns,
          tokenCount: result.conversation.totalTokens,
          durationMs: result.conversation.generationDurationMs,
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Generation error:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request', 
          details: error.issues 
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
 * GET /api/conversations/generate
 * Get API information
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    info: {
      endpoint: 'POST /api/conversations/generate',
      description: 'Generate a single conversation',
      requiredFields: ['templateId', 'parameters', 'tier'],
      optionalFields: ['userId', 'temperature', 'maxTokens', 'category'],
    },
  });
}

