/**
 * AI Configuration & Rate Limiting Setup
 * 
 * Centralized configuration for Claude API integration including
 * rate limiting, model settings, and request management.
 * 
 * Server-side only - never expose to client
 */

import { getRateLimiter } from './ai/rate-limiter';
import type { AIConfig, ModelConfig, RateLimitConfig } from './ai/types';

/**
 * Model configurations for different Claude API tiers
 */
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  opus: {
    name: 'claude-3-opus-20240229',
    rateLimit: 40,
    rateLimitWindow: 60,
    costPerMillionInputTokens: 15,
    costPerMillionOutputTokens: 75,
    maxTokens: 4096
  },
  sonnet: {
    name: 'claude-3-5-sonnet-20241022',
    rateLimit: 50,
    rateLimitWindow: 60,
    costPerMillionInputTokens: 3,
    costPerMillionOutputTokens: 15,
    maxTokens: 4096
  },
  haiku: {
    name: 'claude-3-haiku-20240307',
    rateLimit: 60,
    rateLimitWindow: 60,
    costPerMillionInputTokens: 0.25,
    costPerMillionOutputTokens: 1.25,
    maxTokens: 4096
  }
};

/**
 * Main AI configuration object
 */
export const AI_CONFIG: AIConfig & {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  retryConfig: {
    defaultStrategy: 'exponential' | 'linear' | 'fixed';
    exponential: {
      baseDelayMs: number;
      maxAttempts: number;
      maxDelayMs: number;
      jitterFactor: number;
    };
    linear: {
      incrementMs: number;
      maxAttempts: number;
      maxDelayMs: number;
    };
    fixed: {
      delayMs: number;
      maxAttempts: number;
    };
    continueOnError: boolean;
  };
} = {
  // API credentials
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  baseUrl: process.env.ANTHROPIC_API_BASE_URL || 'https://api.anthropic.com/v1',
  
  // Model configuration
  model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  maxTokens: 24576,
  temperature: 0.7,
  
  // Model tier configurations
  models: {
    opus: MODEL_CONFIGS.opus,
    sonnet: MODEL_CONFIGS.sonnet,
    haiku: MODEL_CONFIGS.haiku
  },
  
  // Default model tier
  defaultModel: 'sonnet',
  
  // Rate limiting configuration
  rateLimitThreshold: 0.9, // Queue requests at 90% capacity
  rateLimitPauseMs: 5000, // Pause for 5 seconds when rate limited
  
  // Request configuration
  timeout: 180000, // 180 seconds (3 minutes) - Increased for complex generations with structured outputs
  maxConcurrentRequests: 3,
  
  // Retry strategy configuration
  retryConfig: {
    defaultStrategy: 'exponential',
    exponential: {
      baseDelayMs: 1000,      // Start with 1 second delay
      maxAttempts: 3,          // Maximum 3 retry attempts
      maxDelayMs: 300000,      // Cap at 5 minutes
      jitterFactor: 0.1,       // Add 10% random jitter
    },
    linear: {
      incrementMs: 2000,       // Increment by 2 seconds each retry
      maxAttempts: 3,          // Maximum 3 retry attempts
      maxDelayMs: 300000,      // Cap at 5 minutes
    },
    fixed: {
      delayMs: 5000,           // Fixed 5 second delay
      maxAttempts: 3,          // Maximum 3 retry attempts
    },
    continueOnError: false,    // Stop batch on error by default
  }
};

/**
 * Rate limiter configuration derived from AI_CONFIG
 */
export const RATE_LIMIT_CONFIG: RateLimitConfig = {
  requestLimit: MODEL_CONFIGS.sonnet.rateLimit, // Default to Sonnet limits
  windowSeconds: MODEL_CONFIGS.sonnet.rateLimitWindow,
  threshold: AI_CONFIG.rateLimitThreshold,
  pauseMs: AI_CONFIG.rateLimitPauseMs,
  maxConcurrentRequests: AI_CONFIG.maxConcurrentRequests
};

/**
 * Gets the model configuration for a specific tier
 * @param tier - Model tier ('opus', 'sonnet', 'haiku')
 * @returns Model configuration
 */
export function getModelConfig(tier: 'opus' | 'sonnet' | 'haiku' = 'sonnet'): ModelConfig {
  return MODEL_CONFIGS[tier];
}

/**
 * Gets rate limit configuration for a specific model tier
 * @param tier - Model tier
 * @returns Rate limit configuration for that tier
 */
export function getRateLimitConfig(tier: 'opus' | 'sonnet' | 'haiku' = 'sonnet'): RateLimitConfig {
  const modelConfig = getModelConfig(tier);
  return {
    requestLimit: modelConfig.rateLimit,
    windowSeconds: modelConfig.rateLimitWindow,
    threshold: AI_CONFIG.rateLimitThreshold,
    pauseMs: AI_CONFIG.rateLimitPauseMs,
    maxConcurrentRequests: AI_CONFIG.maxConcurrentRequests
  };
}

/**
 * Calculates the estimated cost for a generation request
 * @param tier - Model tier
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @returns Estimated cost in USD
 */
export function calculateCost(
  tier: 'opus' | 'sonnet' | 'haiku',
  inputTokens: number,
  outputTokens: number
): number {
  const config = getModelConfig(tier);
  const inputCost = (inputTokens / 1_000_000) * config.costPerMillionInputTokens;
  const outputCost = (outputTokens / 1_000_000) * config.costPerMillionOutputTokens;
  return inputCost + outputCost;
}

// Initialize rate limiter singleton with default configuration
// This ensures the rate limiter is ready when the app starts
if (typeof window === 'undefined') {
  // Only initialize on server-side
  try {
    getRateLimiter(RATE_LIMIT_CONFIG);
    console.log('✅ Rate limiter initialized with config:', {
      requestLimit: RATE_LIMIT_CONFIG.requestLimit,
      windowSeconds: RATE_LIMIT_CONFIG.windowSeconds,
      threshold: `${RATE_LIMIT_CONFIG.threshold * 100}%`
    });
  } catch (error) {
    console.error('❌ Failed to initialize rate limiter:', error);
  }
}

// Validate configuration on import
if (!AI_CONFIG.apiKey && process.env.NODE_ENV !== 'development') {
  console.warn('⚠️  ANTHROPIC_API_KEY not configured');
}

/**
 * Get AI configuration for a specific user with hierarchical fallback
 * 
 * This integrates with the new AI configuration system, providing:
 * - User-specific configurations from database
 * - Organization-level configurations
 * - Environment variable fallbacks
 * - Default configurations
 * 
 * @param userId - Optional user ID. If not provided, returns environment-based config
 * @returns Complete AI configuration object
 */
export async function getAIConfigForUser(userId?: string) {
  // Import the new types and service dynamically to avoid circular dependencies
  const { aiConfigService } = await import('./services/ai-config-service');
  const { DEFAULT_AI_CONFIGURATION } = await import('./types/ai-config');
  
  if (!userId) {
    // Return environment-based configuration for unauthenticated requests
    return {
      ...DEFAULT_AI_CONFIGURATION,
      model: {
        ...DEFAULT_AI_CONFIGURATION.model,
        model: AI_CONFIG.model,
        temperature: AI_CONFIG.temperature,
        maxTokens: AI_CONFIG.maxTokens,
      },
      apiKeys: {
        primaryKey: AI_CONFIG.apiKey,
        keyVersion: 1,
        rotationSchedule: 'manual' as const,
      },
    };
  }
  
  // Get user-specific configuration with full fallback chain
  return await aiConfigService.getEffectiveConfiguration(userId);
}

/**
 * Convert legacy model tier to new AI configuration format
 * 
 * Helper function to bridge between old tier-based config and new config system
 * 
 * @param tier - Model tier ('opus', 'sonnet', 'haiku')
 * @returns Partial AI configuration for the specified tier
 */
export function legacyTierToAIConfig(tier: 'opus' | 'sonnet' | 'haiku' = 'sonnet') {
  const modelConfig = getModelConfig(tier);
  
  return {
    model: {
      model: modelConfig.name,
      temperature: 0.7,
      maxTokens: modelConfig.maxTokens,
      topP: 0.9,
      streaming: false,
    },
    rateLimiting: {
      requestsPerMinute: modelConfig.rateLimit,
      concurrentRequests: AI_CONFIG.maxConcurrentRequests,
      burstAllowance: 10,
    },
  };
}