/**
 * Example API Route Integration
 * 
 * This file demonstrates how to integrate the API error handling
 * and retry logic in a Next.js API route (or similar server endpoint).
 * 
 * For Vite/React apps, adapt this pattern to your server framework.
 */

/**
 * Example 1: Basic Conversation Generation API
 * 
 * POST /api/conversations/generate
 * Body: { prompt: string, conversationId?: string }
 */

import apiClient from '../src/lib/api/client';
import { withRetry } from '../src/lib/api/retry';
import { classifyGenerationError } from '../src/lib/generation/errors';
import { sanitizeError } from '../src/lib/errors';
import { errorLogger } from '../src/lib/errors/error-logger';

interface GenerateRequest {
  prompt: string;
  conversationId?: string;
  maxTokens?: number;
  temperature?: number;
}

interface GenerateResponse {
  success: boolean;
  data?: {
    content: any;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
    conversationId: string;
  };
  error?: {
    message: string;
    code?: string;
    recoveryAction?: string;
    isRecoverable: boolean;
  };
}

/**
 * Generate conversation with full error handling
 */
export async function generateConversation(
  request: GenerateRequest
): Promise<GenerateResponse> {
  const { prompt, conversationId, maxTokens, temperature } = request;

  try {
    // Log request
    errorLogger.info('Starting conversation generation', {
      conversationId,
      promptLength: prompt.length,
    });

    // Generate with automatic retry
    const response = await withRetry(
      () => apiClient.generateConversation(prompt, {
        conversationId,
        maxTokens,
        temperature,
      }),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 16000,
        backoffFactor: 2,
      },
      {
        conversationId,
        component: 'ConversationGenerationAPI',
      }
    );

    // Log success
    errorLogger.info('Conversation generated successfully', {
      conversationId,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
    });

    return {
      success: true,
      data: {
        content: response.content,
        usage: {
          input_tokens: response.usage?.input_tokens || 0,
          output_tokens: response.usage?.output_tokens || 0,
        },
        conversationId: conversationId || 'unknown',
      },
    };

  } catch (error) {
    // Classify error for user-friendly response
    const classification = classifyGenerationError(error);
    const sanitized = sanitizeError(error);

    // Log error
    errorLogger.error('Conversation generation failed', error as Error, {
      conversationId,
      errorType: classification.type,
      recoveryAction: classification.action,
    });

    return {
      success: false,
      error: {
        message: classification.message,
        code: sanitized.code,
        recoveryAction: classification.action,
        isRecoverable: sanitized.isRecoverable,
      },
    };
  }
}

/**
 * Example 2: Batch Conversation Generation
 * 
 * POST /api/conversations/batch-generate
 * Body: { prompts: string[], conversationIds?: string[] }
 */

interface BatchGenerateRequest {
  prompts: string[];
  conversationIds?: string[];
  maxTokens?: number;
}

interface BatchGenerateResponse {
  success: boolean;
  results: Array<{
    index: number;
    success: boolean;
    conversationId?: string;
    content?: any;
    usage?: { input_tokens: number; output_tokens: number };
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Generate multiple conversations with graceful failure handling
 */
export async function batchGenerateConversations(
  request: BatchGenerateRequest
): Promise<BatchGenerateResponse> {
  const { prompts, conversationIds, maxTokens } = request;

  errorLogger.info('Starting batch conversation generation', {
    batchSize: prompts.length,
  });

  const results: BatchGenerateResponse['results'] = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const conversationId = conversationIds?.[i];

    try {
      const response = await withRetry(
        () => apiClient.generateConversation(prompt, {
          conversationId,
          maxTokens,
        }),
        { maxAttempts: 3 },
        { conversationId, component: 'BatchGeneration' }
      );

      results.push({
        index: i,
        success: true,
        conversationId,
        content: response.content,
        usage: {
          input_tokens: response.usage?.input_tokens || 0,
          output_tokens: response.usage?.output_tokens || 0,
        },
      });

      successful++;

    } catch (error) {
      const classification = classifyGenerationError(error);

      errorLogger.warn('Batch item failed, continuing...', error as Error, {
        batchIndex: i,
        conversationId,
      });

      results.push({
        index: i,
        success: false,
        conversationId,
        error: classification.message,
      });

      failed++;
    }

    // Add small delay between requests to be polite to API
    if (i < prompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  errorLogger.info('Batch generation complete', {
    total: prompts.length,
    successful,
    failed,
  });

  return {
    success: failed < prompts.length, // At least one succeeded
    results,
    summary: {
      total: prompts.length,
      successful,
      failed,
    },
  };
}

/**
 * Example 3: Rate Limit Status Endpoint
 * 
 * GET /api/rate-limit/status
 */

interface RateLimitStatusResponse {
  activeRequests: number;
  requestsLastMinute: number;
  remainingCapacity: number;
  status: 'healthy' | 'warning' | 'critical';
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(): RateLimitStatusResponse {
  const status = apiClient.getRateLimitStatus();

  // Determine status level
  let statusLevel: 'healthy' | 'warning' | 'critical';
  const capacityRatio = status.remainingCapacity / 50; // Assuming 50 req/min

  if (capacityRatio > 0.5) {
    statusLevel = 'healthy';
  } else if (capacityRatio > 0.2) {
    statusLevel = 'warning';
  } else {
    statusLevel = 'critical';
  }

  return {
    ...status,
    status: statusLevel,
  };
}

/**
 * Example 4: Health Check Endpoint
 * 
 * GET /api/health
 */

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'down';
  api: {
    reachable: boolean;
    responseTime?: number;
  };
  rateLimit: RateLimitStatusResponse;
  timestamp: string;
}

/**
 * Health check with API connectivity test
 */
export async function healthCheck(): Promise<HealthCheckResponse> {
  const startTime = Date.now();
  
  try {
    // Try a minimal API call to check connectivity
    await withRetry(
      () => apiClient.generateConversation('test', { maxTokens: 10 }),
      { maxAttempts: 1 }, // Don't retry for health check
      { component: 'HealthCheck' }
    );

    const responseTime = Date.now() - startTime;
    const rateLimitStatus = getRateLimitStatus();

    return {
      status: rateLimitStatus.status === 'critical' ? 'degraded' : 'healthy',
      api: {
        reachable: true,
        responseTime,
      },
      rateLimit: rateLimitStatus,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    errorLogger.error('Health check failed', error as Error);

    return {
      status: 'down',
      api: {
        reachable: false,
      },
      rateLimit: getRateLimitStatus(),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Example 5: Webhook/Event Handler
 * 
 * POST /api/webhooks/generate
 */

interface WebhookRequest {
  eventType: 'conversation.request';
  data: {
    prompt: string;
    conversationId: string;
    callbackUrl?: string;
  };
}

/**
 * Async webhook handler for background processing
 */
export async function handleGenerationWebhook(
  request: WebhookRequest
): Promise<void> {
  const { data } = request;

  try {
    // Generate conversation
    const response = await generateConversation({
      prompt: data.prompt,
      conversationId: data.conversationId,
    });

    // Send callback if URL provided
    if (data.callbackUrl) {
      await fetch(data.callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
    }

    errorLogger.info('Webhook processed successfully', {
      conversationId: data.conversationId,
    });

  } catch (error) {
    errorLogger.error('Webhook processing failed', error as Error, {
      conversationId: data.conversationId,
      callbackUrl: data.callbackUrl,
    });

    // Optionally send failure notification
    if (data.callbackUrl) {
      try {
        await fetch(data.callbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: 'Generation failed',
          }),
        });
      } catch (callbackError) {
        errorLogger.error('Callback notification failed', callbackError as Error);
      }
    }
  }
}

/**
 * USAGE IN NEXT.JS API ROUTES:
 * 
 * // app/api/conversations/generate/route.ts
 * import { NextResponse } from 'next/server';
 * import { generateConversation } from '@/examples/api-route-integration';
 * 
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *   const result = await generateConversation(body);
 *   
 *   return NextResponse.json(result, {
 *     status: result.success ? 200 : 500,
 *   });
 * }
 * 
 * 
 * // app/api/rate-limit/status/route.ts
 * import { NextResponse } from 'next/server';
 * import { getRateLimitStatus } from '@/examples/api-route-integration';
 * 
 * export async function GET() {
 *   const status = getRateLimitStatus();
 *   return NextResponse.json(status);
 * }
 */

