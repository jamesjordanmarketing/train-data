/**
 * Type Definitions for Generation Logs
 */

import { z } from 'zod';

// ============================================================================
// Generation Log Types
// ============================================================================

export interface GenerationLog {
  id: string;
  
  // References
  conversationId?: string;
  runId?: string;
  templateId?: string;
  
  // Request/Response
  requestPayload: Record<string, any>;
  responsePayload?: Record<string, any>;
  modelUsed?: string;
  
  // Parameters
  parameters: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
  
  // Cost Tracking
  inputTokens: number;
  outputTokens: number;
  costUsd?: number;
  
  // Performance
  durationMs?: number;
  status: 'success' | 'failed' | 'rate_limited' | 'timeout';
  
  // Error Handling
  errorMessage?: string;
  errorCode?: string;
  retryAttempt: number;
  
  // Audit
  createdAt: string;
  createdBy?: string;
}

export interface CreateGenerationLogInput {
  conversationId?: string;
  runId?: string;
  templateId?: string;
  requestPayload: Record<string, any>;
  responsePayload?: Record<string, any>;
  modelUsed?: string;
  parameters?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  durationMs?: number;
  status: 'success' | 'failed' | 'rate_limited' | 'timeout';
  errorMessage?: string;
  errorCode?: string;
  retryAttempt?: number;
  createdBy: string;
}

export interface CostSummary {
  totalCost: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgCostPerRequest: number;
  avgDurationMs: number;
  byModel: Record<string, {
    count: number;
    cost: number;
    inputTokens: number;
    outputTokens: number;
  }>;
  byStatus: Record<string, number>;
}

export interface PerformanceMetrics {
  avgDurationMs: number;
  p50DurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;
  successRate: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  totalRequests: number;
  requestsPerDay: number[];
  errorRate: number;
}

export interface GenerationLogFilter {
  conversationId?: string;
  runId?: string;
  templateId?: string;
  status?: 'success' | 'failed' | 'rate_limited' | 'timeout';
  modelUsed?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

// ============================================================================
// Validation Schemas
// ============================================================================

export const CreateGenerationLogSchema = z.object({
  conversationId: z.string().uuid().optional(),
  runId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  requestPayload: z.record(z.string(), z.any()),
  responsePayload: z.record(z.string(), z.any()).optional(),
  modelUsed: z.string().optional(),
  parameters: z.record(z.string(), z.any()).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  inputTokens: z.number().int().min(0).optional(),
  outputTokens: z.number().int().min(0).optional(),
  costUsd: z.number().min(0).optional(),
  durationMs: z.number().int().min(0).optional(),
  status: z.enum(['success', 'failed', 'rate_limited', 'timeout']),
  errorMessage: z.string().optional(),
  errorCode: z.string().optional(),
  retryAttempt: z.number().int().min(0).optional(),
  createdBy: z.string().uuid(),
});

