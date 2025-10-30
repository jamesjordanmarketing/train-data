/**
 * API Route: Single Conversation Generation
 * 
 * POST /api/conversations/generate
 * Generates a single conversation using Claude API
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ConversationGenerator } from '@/lib/conversation-generator';
import {
  ClaudeAPIError,
  RateLimitError,
  ParseError,
  GenerationValidationError,
} from '@/lib/types/generation';
import { ValidationError } from '@/lib/types/errors';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Validation schema
const GenerationParamsSchema = z.object({
  templateId: z.string().uuid('Template ID must be a valid UUID'),
  persona: z.string().min(1, 'Persona is required'),
  emotion: z.string().min(1, 'Emotion is required'),
  topic: z.string().min(1, 'Topic is required'),
  tier: z.enum(['template', 'scenario', 'edge_case']),
  parameters: z.record(z.any()).optional().default({}),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(100).max(8192).optional(),
  documentId: z.string().uuid().optional(),
  chunkId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    let params;
    try {
      params = GenerationParamsSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors,
          },
          { status: 400 }
        );
      }
      throw error;
    }
    
    // Get user from session
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        {
          error: 'AI service not configured',
          details: 'Missing ANTHROPIC_API_KEY environment variable',
        },
        { status: 500 }
      );
    }
    
    // Initialize generator with rate limiting
    const generator = new ConversationGenerator({
      rateLimitConfig: {
        windowMs: 60000, // 1 minute
        maxRequests: 50, // 50 requests per minute
        enableQueue: true,
        pauseThreshold: 0.9, // Pause at 90% capacity
      },
      retryConfig: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 300000, // 5 minutes
      },
    });
    
    // Generate conversation
    const conversation = await generator.generateSingle({
      ...params,
      createdBy: userId,
    });
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: conversation,
        metadata: {
          qualityScore: conversation.qualityScore,
          turnCount: conversation.totalTurns,
          cost: conversation.actualCostUsd,
          duration: conversation.generationDurationMs,
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Generation error:', error);
    
    // Handle rate limit errors
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: error.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(error.retryAfter / 1000)),
          },
        }
      );
    }
    
    // Handle Claude API errors
    if (error instanceof ClaudeAPIError) {
      return NextResponse.json(
        {
          error: 'AI service error',
          message: error.message,
          details: error.details,
          status: error.status,
        },
        { status: 502 }
      );
    }
    
    // Handle parse errors
    if (error instanceof ParseError) {
      return NextResponse.json(
        {
          error: 'Response parsing failed',
          message: error.message,
          details: 'The AI generated an invalid response format',
        },
        { status: 500 }
      );
    }
    
    // Handle validation errors
    if (error instanceof GenerationValidationError || error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: error.message,
          details: (error as any).details,
        },
        { status: 422 }
      );
    }
    
    // Generic error handler
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations/generate
 * Get rate limit status
 */
export async function GET(request: NextRequest) {
  try {
    const generator = new ConversationGenerator({
      rateLimitConfig: {
        windowMs: 60000,
        maxRequests: 50,
        enableQueue: true,
      },
    });
    
    const status = generator.getRateLimitStatus();
    
    return NextResponse.json({
      success: true,
      data: status,
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get rate limit status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

