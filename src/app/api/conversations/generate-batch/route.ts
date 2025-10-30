/**
 * API Route: Batch Conversation Generation
 * 
 * POST /api/conversations/generate-batch
 * Generates multiple conversations in batch with controlled concurrency
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ConversationGenerator } from '@/lib/conversation-generator';
import { GenerationParams } from '@/lib/types/generation';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Validation schema
const BatchGenerationSchema = z.object({
  requests: z.array(
    z.object({
      templateId: z.string().uuid(),
      persona: z.string().min(1),
      emotion: z.string().min(1),
      topic: z.string().min(1),
      tier: z.enum(['template', 'scenario', 'edge_case']),
      parameters: z.record(z.any()).optional().default({}),
      temperature: z.number().min(0).max(1).optional(),
      maxTokens: z.number().min(100).max(8192).optional(),
      documentId: z.string().uuid().optional(),
      chunkId: z.string().uuid().optional(),
    })
  ).min(1).max(100, 'Batch size cannot exceed 100'),
  options: z.object({
    concurrency: z.number().min(1).max(10).optional().default(3),
    stopOnError: z.boolean().optional().default(false),
  }).optional().default({}),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    let validated;
    try {
      validated = BatchGenerationSchema.parse(body);
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
    
    // Generate batch job ID
    const runId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize generator
    const generator = new ConversationGenerator({
      rateLimitConfig: {
        windowMs: 60000, // 1 minute
        maxRequests: 50,
        enableQueue: true,
        pauseThreshold: 0.9,
      },
    });
    
    // Prepare requests with user ID
    const requests: GenerationParams[] = validated.requests.map((req) => ({
      ...req,
      createdBy: userId,
    }));
    
    console.log(`🚀 Starting batch generation: ${requests.length} conversations`);
    
    // Generate batch
    const result = await generator.generateBatch(requests, {
      ...validated.options,
      runId,
      onProgress: (progress) => {
        // Log progress (could be sent via websocket for real-time updates)
        console.log(
          `📊 Progress: ${progress.completed}/${progress.total} (${progress.percentage.toFixed(1)}%) - ` +
          `✅ ${progress.successful} success, ❌ ${progress.failed} failed, ` +
          `⏱️  ${progress.estimatedTimeRemaining ? Math.ceil(progress.estimatedTimeRemaining / 1000) + 's remaining' : 'calculating...'}`
        );
      },
    });
    
    console.log(`✅ Batch complete: ${result.successful}/${result.total} successful, $${result.totalCost.toFixed(2)}`);
    
    // Return summary response
    return NextResponse.json(
      {
        success: true,
        data: {
          runId: result.runId,
          summary: {
            total: result.total,
            successful: result.successful,
            failed: result.failed,
            totalCost: result.totalCost,
            totalDuration: result.totalDuration,
            avgCostPerConversation: result.successful > 0 ? result.totalCost / result.successful : 0,
            avgDurationPerConversation: result.successful > 0 ? result.totalDuration / result.successful : 0,
          },
          results: result.results.map((r) => ({
            success: r.success,
            conversationId: r.success ? r.data?.conversationId : undefined,
            qualityScore: r.success ? r.data?.qualityScore : undefined,
            error: !r.success ? r.error?.message : undefined,
            params: {
              persona: r.params.persona,
              emotion: r.params.emotion,
              topic: r.params.topic,
            },
          })),
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Batch generation error:', error);
    
    return NextResponse.json(
      {
        error: 'Batch generation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations/generate-batch
 * Get information about batch generation
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    info: {
      maxBatchSize: 100,
      defaultConcurrency: 3,
      maxConcurrency: 10,
      rateLimit: {
        windowMs: 60000,
        maxRequests: 50,
      },
    },
  });
}

