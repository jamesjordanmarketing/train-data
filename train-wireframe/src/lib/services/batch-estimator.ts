/**
 * Batch Estimator Service
 * 
 * Provides cost and time estimation for batch conversation generation jobs.
 * Uses historical data and token-based pricing models to calculate accurate estimates.
 */

import { TierType } from '../types';

// Token estimates per tier based on historical data
const TOKEN_ESTIMATES = {
  template: { input: 2000, output: 3000 },
  scenario: { input: 2500, output: 4000 },
  edge_case: { input: 3000, output: 5000 }
} as const;

// Claude pricing (per 1K tokens)
const PRICING = {
  inputPricePer1K: 0.015,   // $0.015 per 1K input tokens
  outputPricePer1K: 0.075   // $0.075 per 1K output tokens
} as const;

// Performance constants
const DEFAULT_AVG_GENERATION_TIME_SECONDS = 20;
const DEFAULT_RATE_LIMIT_PER_MINUTE = 50;

export interface CostEstimate {
  conversationCount: number;
  costPerConversation: number;
  totalCost: number;
  inputTokensPerConversation: number;
  outputTokensPerConversation: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  breakdown?: {
    inputCost: number;
    outputCost: number;
  };
}

export interface TimeEstimate {
  estimatedTimeSeconds: number;
  estimatedTimeMinutes: number;
  estimatedTimeHours?: number;
  estimatedTimeFormatted: string;
  itemsPerMinute: number;
  concurrency: number;
  rateLimitApplied: boolean;
}

export interface HistoricalStats {
  tier?: TierType;
  avgInputTokens: number;
  avgOutputTokens: number;
  avgCostPerConversation: number;
  avgDurationSeconds: number;
  sampleSize: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface BatchEstimateParams {
  conversationCount: number;
  tier?: TierType;
  concurrency?: number;
  rateLimit?: number;
  useHistoricalData?: boolean;
}

export class BatchEstimator {
  /**
   * Estimate the total cost for a batch of conversations
   */
  async estimateBatchCost(
    conversationCount: number,
    tier?: TierType
  ): Promise<CostEstimate> {
    // Use tier-specific estimates or default to scenario tier
    const estimate = tier 
      ? TOKEN_ESTIMATES[tier]
      : TOKEN_ESTIMATES.scenario;

    // Calculate cost per conversation
    const inputCostPerConversation = 
      (estimate.input / 1000) * PRICING.inputPricePer1K;
    const outputCostPerConversation = 
      (estimate.output / 1000) * PRICING.outputPricePer1K;
    const costPerConversation = inputCostPerConversation + outputCostPerConversation;

    // Calculate totals
    const totalCost = costPerConversation * conversationCount;
    const totalInputTokens = estimate.input * conversationCount;
    const totalOutputTokens = estimate.output * conversationCount;

    return {
      conversationCount,
      costPerConversation: this.roundToTwoDecimals(costPerConversation),
      totalCost: this.roundToTwoDecimals(totalCost),
      inputTokensPerConversation: estimate.input,
      outputTokensPerConversation: estimate.output,
      totalInputTokens,
      totalOutputTokens,
      breakdown: {
        inputCost: this.roundToTwoDecimals(
          (totalInputTokens / 1000) * PRICING.inputPricePer1K
        ),
        outputCost: this.roundToTwoDecimals(
          (totalOutputTokens / 1000) * PRICING.outputPricePer1K
        )
      }
    };
  }

  /**
   * Estimate the time required for a batch of conversations
   */
  async estimateBatchTime(
    conversationCount: number,
    concurrency: number,
    rateLimit: number = DEFAULT_RATE_LIMIT_PER_MINUTE
  ): Promise<TimeEstimate> {
    const avgGenerationTimeSeconds = DEFAULT_AVG_GENERATION_TIME_SECONDS;

    // Calculate theoretical time without rate limiting
    const theoreticalTimeSeconds = 
      (conversationCount / concurrency) * avgGenerationTimeSeconds;

    // Calculate rate limit constraints
    const maxRequestsPerSecond = rateLimit / 60;
    const actualConcurrency = Math.min(concurrency, Math.floor(maxRequestsPerSecond));
    const rateLimitApplied = actualConcurrency < concurrency;

    // Calculate actual time with rate limiting applied
    const adjustedTimeSeconds = 
      (conversationCount / actualConcurrency) * avgGenerationTimeSeconds;

    // Add buffer for overhead (10%)
    const finalTimeSeconds = Math.ceil(adjustedTimeSeconds * 1.1);

    // Calculate items per minute
    const itemsPerMinute = this.roundToTwoDecimals(
      (actualConcurrency / avgGenerationTimeSeconds) * 60
    );

    return {
      estimatedTimeSeconds: finalTimeSeconds,
      estimatedTimeMinutes: Math.ceil(finalTimeSeconds / 60),
      estimatedTimeHours: finalTimeSeconds >= 3600 
        ? this.roundToTwoDecimals(finalTimeSeconds / 3600)
        : undefined,
      estimatedTimeFormatted: this.formatDuration(finalTimeSeconds),
      itemsPerMinute,
      concurrency: actualConcurrency,
      rateLimitApplied
    };
  }

  /**
   * Get historical average statistics for more accurate estimates
   * Note: This would query the generation_logs table in a real implementation
   */
  async getHistoricalAverage(tier?: TierType): Promise<HistoricalStats> {
    // In a real implementation, this would query the database
    // For now, return defaults based on tier
    const estimate = tier 
      ? TOKEN_ESTIMATES[tier]
      : TOKEN_ESTIMATES.scenario;

    const avgCostPerConversation = 
      ((estimate.input / 1000) * PRICING.inputPricePer1K) +
      ((estimate.output / 1000) * PRICING.outputPricePer1K);

    return {
      tier,
      avgInputTokens: estimate.input,
      avgOutputTokens: estimate.output,
      avgCostPerConversation: this.roundToTwoDecimals(avgCostPerConversation),
      avgDurationSeconds: DEFAULT_AVG_GENERATION_TIME_SECONDS,
      sampleSize: 0, // No historical data yet
      confidenceLevel: 'low' // Low confidence without historical data
    };
  }

  /**
   * Get comprehensive estimate for a batch job
   */
  async getComprehensiveEstimate(params: BatchEstimateParams) {
    const {
      conversationCount,
      tier,
      concurrency = 3,
      rateLimit = DEFAULT_RATE_LIMIT_PER_MINUTE,
      useHistoricalData = false
    } = params;

    // Get cost and time estimates
    const costEstimate = await this.estimateBatchCost(conversationCount, tier);
    const timeEstimate = await this.estimateBatchTime(
      conversationCount, 
      concurrency, 
      rateLimit
    );

    // Get historical data if requested
    let historicalStats: HistoricalStats | undefined;
    if (useHistoricalData) {
      historicalStats = await this.getHistoricalAverage(tier);
    }

    return {
      cost: costEstimate,
      time: timeEstimate,
      historical: historicalStats,
      summary: {
        totalConversations: conversationCount,
        tier: tier || 'mixed',
        estimatedCost: costEstimate.totalCost,
        estimatedDuration: timeEstimate.estimatedTimeFormatted,
        concurrency: timeEstimate.concurrency,
        costPerConversation: costEstimate.costPerConversation,
        timePerConversation: `${DEFAULT_AVG_GENERATION_TIME_SECONDS}s`
      }
    };
  }

  /**
   * Format duration in seconds to human-readable string
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `~${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `~${minutes} minutes`;
    } else {
      return `~${secs} seconds`;
    }
  }

  /**
   * Round number to 2 decimal places
   */
  private roundToTwoDecimals(num: number): number {
    return Math.round(num * 100) / 100;
  }

  /**
   * Calculate cost variance between estimated and actual
   */
  calculateCostVariance(
    estimated: number, 
    actual: number
  ): { variance: number; percentageDiff: number; withinMargin: boolean } {
    const variance = actual - estimated;
    const percentageDiff = (variance / estimated) * 100;
    const withinMargin = Math.abs(percentageDiff) <= 10; // 10% margin

    return {
      variance: this.roundToTwoDecimals(variance),
      percentageDiff: this.roundToTwoDecimals(percentageDiff),
      withinMargin
    };
  }

  /**
   * Calculate time variance between estimated and actual
   */
  calculateTimeVariance(
    estimatedSeconds: number,
    actualSeconds: number
  ): { variance: number; percentageDiff: number; withinMargin: boolean } {
    const variance = actualSeconds - estimatedSeconds;
    const percentageDiff = (variance / estimatedSeconds) * 100;
    const withinMargin = Math.abs(percentageDiff) <= 20; // 20% margin

    return {
      variance: Math.round(variance),
      percentageDiff: this.roundToTwoDecimals(percentageDiff),
      withinMargin
    };
  }
}

// Export singleton instance
export const batchEstimator = new BatchEstimator();

