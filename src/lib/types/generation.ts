/**
 * Type Definitions for AI Generation
 * 
 * Types for conversation generation, rate limiting, and retry logic
 */

import { TierType } from './conversations';

// ============================================================================
// Error Types
// ============================================================================

export class ClaudeAPIError extends Error {
  constructor(
    public status: number,
    public details: any,
    message?: string
  ) {
    super(message || `Claude API Error: ${status}`);
    this.name = 'ClaudeAPIError';
    Object.setPrototypeOf(this, ClaudeAPIError.prototype);
  }

  get isRetryable(): boolean {
    // Rate limit errors (429): retryable
    if (this.status === 429) return true;
    // Server errors (5xx): retryable
    if (this.status >= 500 && this.status < 600) return true;
    // Timeout errors: retryable (indicated by 408 or 504)
    if (this.status === 408 || this.status === 504) return true;
    // Client errors (4xx validation): not retryable
    return false;
  }
}

export class RateLimitError extends Error {
  constructor(public retryAfter: number) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ParseError extends Error {
  constructor(message: string, public content?: string) {
    super(message);
    this.name = 'ParseError';
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

export class GenerationValidationError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'GenerationValidationError';
    Object.setPrototypeOf(this, GenerationValidationError.prototype);
  }
}

// ============================================================================
// Rate Limiter Types
// ============================================================================

export interface RateLimiterConfig {
  windowMs: number; // Time window in milliseconds (60000 for 1 minute)
  maxRequests: number; // Max requests in window
  enableQueue: boolean; // Queue requests when at limit
  pauseThreshold?: number; // Pause at this percentage of limit (default 0.9 = 90%)
}

export interface RateLimitStatus {
  used: number;
  remaining: number;
  resetAt: Date;
  queueLength: number;
  isPaused: boolean;
}

// ============================================================================
// Retry Manager Types
// ============================================================================

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // Starting delay in ms (e.g., 1000)
  maxDelay: number; // Cap on delay (e.g., 300000 = 5 minutes)
  onRetry?: (attempt: number, error: Error) => void;
}

// ============================================================================
// Generation Types
// ============================================================================

export interface GenerationParams {
  templateId: string;
  persona: string;
  emotion: string;
  topic: string;
  tier: TierType;
  parameters: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
  documentId?: string;
  chunkId?: string;
  createdBy?: string;
}

export interface ClaudeResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  duration: number;
  model: string;
  stopReason?: string;
}

export interface ParsedConversation {
  title: string;
  persona: string;
  emotion: string;
  tier: TierType;
  topic?: string;
  turns: ConversationTurnData[];
  totalTurns: number;
  totalTokens: number;
  parameters: Record<string, any>;
}

export interface ConversationTurnData {
  role: 'user' | 'assistant';
  content: string;
  turnNumber: number;
  tokenCount: number;
}

export interface GeneratedConversation extends ParsedConversation {
  id: string;
  conversationId: string;
  qualityScore: number;
  status: string;
  actualCostUsd: number;
  generationDurationMs: number;
  createdAt: string;
}

// ============================================================================
// Batch Generation Types
// ============================================================================

export interface BatchOptions {
  concurrency?: number; // Number of parallel requests (default 3)
  stopOnError?: boolean; // Stop batch on first error (default false)
  onProgress?: (progress: BatchProgress) => void;
  runId?: string; // Batch job ID for tracking
}

export interface BatchProgress {
  completed: number;
  total: number;
  percentage: number;
  successful: number;
  failed: number;
  estimatedTimeRemaining?: number;
}

export interface BatchItemResult {
  success: boolean;
  data?: GeneratedConversation;
  error?: Error;
  params: GenerationParams;
}

export interface BatchResult {
  total: number;
  successful: number;
  failed: number;
  results: BatchItemResult[];
  totalCost: number;
  totalDuration: number;
  runId?: string;
}

// ============================================================================
// Generator Config
// ============================================================================

export interface GeneratorConfig {
  rateLimitConfig: RateLimiterConfig;
  retryConfig?: RetryConfig;
  apiKey?: string;
  apiUrl?: string;
  defaultModel?: string;
}

// ============================================================================
// Cost Tracking
// ============================================================================

export interface CostEstimate {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCostUsd: number;
  model: string;
}

export const PRICING = {
  'claude-3-5-sonnet-20241022': {
    inputCostPer1K: 0.003,
    outputCostPer1K: 0.015,
  },
  'claude-sonnet-4-5-20250929': {
    inputCostPer1K: 0.003,
    outputCostPer1K: 0.015,
  },
  'default': {
    inputCostPer1K: 0.003,
    outputCostPer1K: 0.015,
  },
} as const;

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string = 'default'
): number {
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING.default;
  
  const inputCost = (inputTokens / 1000) * pricing.inputCostPer1K;
  const outputCost = (outputTokens / 1000) * pricing.outputCostPer1K;
  
  return inputCost + outputCost;
}

export function estimateTokens(text: string): number {
  // Rough estimate: ~1.3 tokens per word
  const words = text.split(/\s+/).length;
  return Math.ceil(words * 1.3);
}

