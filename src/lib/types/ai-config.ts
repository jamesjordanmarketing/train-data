/**
 * AI Configuration Types
 * 
 * Comprehensive type definitions for AI configuration system with
 * Claude API parameters, rate limiting, retry strategies, cost management,
 * and hierarchical configuration resolution.
 */

export interface ModelConfiguration {
  model: string; // claude-sonnet-4-5-20250929, claude-3-opus, claude-3-haiku
  temperature: number; // 0.0-1.0
  maxTokens: number; // 1-4096
  topP: number; // 0.0-1.0
  streaming: boolean;
}

export interface RateLimitConfiguration {
  requestsPerMinute: number;
  concurrentRequests: number;
  burstAllowance: number; // Extra requests allowed in burst
}

export type BackoffStrategy = 'exponential' | 'linear' | 'fixed';

export interface RetryStrategyConfiguration {
  maxRetries: number; // 0-10
  backoffType: BackoffStrategy;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds, cap for exponential backoff
}

export interface CostBudgetConfiguration {
  dailyBudget: number; // USD
  weeklyBudget: number; // USD
  monthlyBudget: number; // USD
  alertThresholds: number[]; // [0.5, 0.75, 0.9] = 50%, 75%, 90%
}

export interface APIKeyConfiguration {
  primaryKey: string; // Encrypted
  secondaryKey?: string; // Optional for rotation
  keyVersion: number;
  rotationSchedule?: 'manual' | 'monthly' | 'quarterly';
}

export interface TimeoutConfiguration {
  generationTimeout: number; // milliseconds
  connectionTimeout: number; // milliseconds
  totalRequestTimeout: number; // milliseconds
}

export interface ModelCapabilities {
  contextWindow: number; // tokens
  outputLimit: number; // tokens
  costPer1kInputTokens: number; // USD
  costPer1kOutputTokens: number; // USD
  supportedFeatures: string[]; // ['vision', 'function_calling', etc]
}

export interface AIConfiguration {
  // Model Configuration
  model: ModelConfiguration;
  
  // Rate Limiting
  rateLimiting: RateLimitConfiguration;
  
  // Retry Strategy
  retryStrategy: RetryStrategyConfiguration;
  
  // Cost Budget
  costBudget: CostBudgetConfiguration;
  
  // API Keys
  apiKeys: APIKeyConfiguration;
  
  // Timeouts
  timeouts: TimeoutConfiguration;
  
  // Metadata
  capabilities?: ModelCapabilities;
}

export const DEFAULT_AI_CONFIGURATION: AIConfiguration = {
  model: {
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    streaming: false,
  },
  rateLimiting: {
    requestsPerMinute: 50,
    concurrentRequests: 3,
    burstAllowance: 10,
  },
  retryStrategy: {
    maxRetries: 3,
    backoffType: 'exponential',
    baseDelay: 1000,
    maxDelay: 16000,
  },
  costBudget: {
    dailyBudget: 100.0,
    weeklyBudget: 500.0,
    monthlyBudget: 2000.0,
    alertThresholds: [0.5, 0.75, 0.9],
  },
  apiKeys: {
    primaryKey: '', // Will be loaded from env/vault
    keyVersion: 1,
    rotationSchedule: 'manual',
  },
  timeouts: {
    generationTimeout: 60000,
    connectionTimeout: 10000,
    totalRequestTimeout: 120000,
  },
};

export const AVAILABLE_MODELS: Record<string, ModelCapabilities> = {
  'claude-sonnet-4-5-20250929': {
    contextWindow: 200000,
    outputLimit: 4096,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    supportedFeatures: ['text', 'vision', 'tool_use'],
  },
  'claude-3-5-sonnet-20241022': {
    contextWindow: 200000,
    outputLimit: 8192,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    supportedFeatures: ['text', 'vision', 'tool_use'],
  },
  'claude-3-opus-20240229': {
    contextWindow: 200000,
    outputLimit: 4096,
    costPer1kInputTokens: 0.015,
    costPer1kOutputTokens: 0.075,
    supportedFeatures: ['text', 'vision', 'tool_use'],
  },
  'claude-3-haiku-20240307': {
    contextWindow: 200000,
    outputLimit: 4096,
    costPer1kInputTokens: 0.00025,
    costPer1kOutputTokens: 0.00125,
    supportedFeatures: ['text', 'vision'],
  },
};

/**
 * Validate AI configuration
 * @param config - Partial AI configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateAIConfiguration(config: Partial<AIConfiguration>): string[] {
  const errors: string[] = [];
  
  if (config.model) {
    if (config.model.temperature !== undefined && (config.model.temperature < 0 || config.model.temperature > 1)) {
      errors.push('Temperature must be between 0 and 1');
    }
    if (config.model.maxTokens !== undefined && (config.model.maxTokens < 1 || config.model.maxTokens > 4096)) {
      errors.push('Max tokens must be between 1 and 4096');
    }
    if (config.model.topP !== undefined && (config.model.topP < 0 || config.model.topP > 1)) {
      errors.push('Top P must be between 0 and 1');
    }
    if (config.model.model && !AVAILABLE_MODELS[config.model.model]) {
      errors.push(`Invalid model: ${config.model.model}. Available models: ${Object.keys(AVAILABLE_MODELS).join(', ')}`);
    }
  }
  
  if (config.rateLimiting) {
    if (config.rateLimiting.requestsPerMinute !== undefined && config.rateLimiting.requestsPerMinute < 1) {
      errors.push('Requests per minute must be at least 1');
    }
    if (config.rateLimiting.concurrentRequests !== undefined && config.rateLimiting.concurrentRequests < 1) {
      errors.push('Concurrent requests must be at least 1');
    }
    if (config.rateLimiting.burstAllowance !== undefined && config.rateLimiting.burstAllowance < 0) {
      errors.push('Burst allowance must be non-negative');
    }
  }
  
  if (config.retryStrategy) {
    if (config.retryStrategy.maxRetries !== undefined && (config.retryStrategy.maxRetries < 0 || config.retryStrategy.maxRetries > 10)) {
      errors.push('Max retries must be between 0 and 10');
    }
    if (config.retryStrategy.baseDelay !== undefined && config.retryStrategy.baseDelay < 0) {
      errors.push('Base delay must be non-negative');
    }
    if (config.retryStrategy.maxDelay !== undefined && config.retryStrategy.baseDelay !== undefined && 
        config.retryStrategy.maxDelay < config.retryStrategy.baseDelay) {
      errors.push('Max delay must be greater than or equal to base delay');
    }
    if (config.retryStrategy.backoffType && !['exponential', 'linear', 'fixed'].includes(config.retryStrategy.backoffType)) {
      errors.push('Backoff type must be exponential, linear, or fixed');
    }
  }
  
  if (config.costBudget) {
    if (config.costBudget.dailyBudget !== undefined && config.costBudget.dailyBudget < 0) {
      errors.push('Daily budget must be non-negative');
    }
    if (config.costBudget.weeklyBudget !== undefined && config.costBudget.dailyBudget !== undefined && 
        config.costBudget.weeklyBudget < config.costBudget.dailyBudget) {
      errors.push('Weekly budget must be at least daily budget');
    }
    if (config.costBudget.monthlyBudget !== undefined && config.costBudget.weeklyBudget !== undefined && 
        config.costBudget.monthlyBudget < config.costBudget.weeklyBudget) {
      errors.push('Monthly budget must be at least weekly budget');
    }
    if (config.costBudget.alertThresholds) {
      for (const threshold of config.costBudget.alertThresholds) {
        if (threshold < 0 || threshold > 1) {
          errors.push('Alert thresholds must be between 0 and 1');
          break;
        }
      }
    }
  }
  
  if (config.timeouts) {
    if (config.timeouts.generationTimeout !== undefined && config.timeouts.generationTimeout < 0) {
      errors.push('Generation timeout must be non-negative');
    }
    if (config.timeouts.connectionTimeout !== undefined && config.timeouts.connectionTimeout < 0) {
      errors.push('Connection timeout must be non-negative');
    }
    if (config.timeouts.totalRequestTimeout !== undefined && config.timeouts.totalRequestTimeout < 0) {
      errors.push('Total request timeout must be non-negative');
    }
  }
  
  return errors;
}

/**
 * Calculate cost for API usage
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @param model - Model identifier
 * @returns Cost in USD
 */
export function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const capabilities = AVAILABLE_MODELS[model];
  if (!capabilities) {
    console.warn(`Unknown model: ${model}, using default cost`);
    return 0;
  }
  
  const inputCost = (inputTokens / 1000) * capabilities.costPer1kInputTokens;
  const outputCost = (outputTokens / 1000) * capabilities.costPer1kOutputTokens;
  
  return inputCost + outputCost;
}

/**
 * Database record type for AI configurations
 */
export interface AIConfigurationRecord {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  config_name: string;
  configuration: AIConfiguration;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

