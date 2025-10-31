/**
 * Unit Tests for Batch Estimator Service
 * 
 * Tests cost and time estimation accuracy for batch generation jobs.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BatchEstimator } from '../batch-estimator';
import { TierType } from '../../types';

describe('BatchEstimator', () => {
  let estimator: BatchEstimator;

  beforeEach(() => {
    estimator = new BatchEstimator();
  });

  describe('estimateBatchCost', () => {
    it('should calculate cost for template tier correctly', async () => {
      const estimate = await estimator.estimateBatchCost(10, 'template');

      expect(estimate.conversationCount).toBe(10);
      expect(estimate.inputTokensPerConversation).toBe(2000);
      expect(estimate.outputTokensPerConversation).toBe(3000);
      expect(estimate.totalInputTokens).toBe(20000);
      expect(estimate.totalOutputTokens).toBe(30000);
      
      // Cost calculation: (2000/1000 * 0.015) + (3000/1000 * 0.075) = 0.03 + 0.225 = 0.255
      expect(estimate.costPerConversation).toBeCloseTo(0.26, 2);
      expect(estimate.totalCost).toBeCloseTo(2.55, 2);
    });

    it('should calculate cost for scenario tier correctly', async () => {
      const estimate = await estimator.estimateBatchCost(10, 'scenario');

      expect(estimate.inputTokensPerConversation).toBe(2500);
      expect(estimate.outputTokensPerConversation).toBe(4000);
      
      // Cost: (2500/1000 * 0.015) + (4000/1000 * 0.075) = 0.0375 + 0.3 = 0.3375
      expect(estimate.costPerConversation).toBeCloseTo(0.34, 2);
      expect(estimate.totalCost).toBeCloseTo(3.38, 2);
    });

    it('should calculate cost for edge_case tier correctly', async () => {
      const estimate = await estimator.estimateBatchCost(10, 'edge_case');

      expect(estimate.inputTokensPerConversation).toBe(3000);
      expect(estimate.outputTokensPerConversation).toBe(5000);
      
      // Cost: (3000/1000 * 0.015) + (5000/1000 * 0.075) = 0.045 + 0.375 = 0.42
      expect(estimate.costPerConversation).toBeCloseTo(0.42, 2);
      expect(estimate.totalCost).toBeCloseTo(4.20, 2);
    });

    it('should default to scenario tier when tier not specified', async () => {
      const estimate = await estimator.estimateBatchCost(10);

      expect(estimate.inputTokensPerConversation).toBe(2500);
      expect(estimate.outputTokensPerConversation).toBe(4000);
    });

    it('should include cost breakdown', async () => {
      const estimate = await estimator.estimateBatchCost(10, 'template');

      expect(estimate.breakdown).toBeDefined();
      expect(estimate.breakdown!.inputCost).toBeGreaterThan(0);
      expect(estimate.breakdown!.outputCost).toBeGreaterThan(0);
      
      // Total should equal sum of breakdown
      expect(estimate.totalCost).toBeCloseTo(
        estimate.breakdown!.inputCost + estimate.breakdown!.outputCost,
        2
      );
    });

    it('should scale linearly with conversation count', async () => {
      const estimate10 = await estimator.estimateBatchCost(10, 'template');
      const estimate100 = await estimator.estimateBatchCost(100, 'template');

      expect(estimate100.totalCost).toBeCloseTo(estimate10.totalCost * 10, 2);
      expect(estimate100.totalInputTokens).toBe(estimate10.totalInputTokens * 10);
      expect(estimate100.totalOutputTokens).toBe(estimate10.totalOutputTokens * 10);
    });

    it('should handle large batches', async () => {
      const estimate = await estimator.estimateBatchCost(1000, 'scenario');

      expect(estimate.conversationCount).toBe(1000);
      expect(estimate.totalCost).toBeGreaterThan(100); // Should be significant cost
      expect(estimate.totalInputTokens).toBe(2500000); // 2.5M tokens
      expect(estimate.totalOutputTokens).toBe(4000000); // 4M tokens
    });
  });

  describe('estimateBatchTime', () => {
    it('should calculate time for batch with default settings', async () => {
      const estimate = await estimator.estimateBatchTime(10, 3);

      expect(estimate.concurrency).toBeLessThanOrEqual(3);
      expect(estimate.estimatedTimeMinutes).toBeGreaterThan(0);
      expect(estimate.estimatedTimeSeconds).toBeGreaterThan(0);
      expect(estimate.itemsPerMinute).toBeGreaterThan(0);
      expect(estimate.estimatedTimeFormatted).toBeDefined();
    });

    it('should respect concurrency limits', async () => {
      const estimate1 = await estimator.estimateBatchTime(30, 1); // Sequential
      const estimate3 = await estimator.estimateBatchTime(30, 3); // Parallel

      // Parallel should be faster
      expect(estimate3.estimatedTimeSeconds).toBeLessThan(estimate1.estimatedTimeSeconds);
      
      // Should be roughly 3x faster (with overhead)
      const ratio = estimate1.estimatedTimeSeconds / estimate3.estimatedTimeSeconds;
      expect(ratio).toBeGreaterThan(2);
      expect(ratio).toBeLessThan(4);
    });

    it('should apply rate limiting when necessary', async () => {
      // With high concurrency and low rate limit, should be constrained
      const estimate = await estimator.estimateBatchTime(100, 10, 10); // 10 requests/min limit

      expect(estimate.rateLimitApplied).toBe(true);
      expect(estimate.concurrency).toBeLessThan(10);
    });

    it('should not apply rate limiting when concurrency is below limit', async () => {
      const estimate = await estimator.estimateBatchTime(10, 3, 50); // 50 requests/min

      expect(estimate.rateLimitApplied).toBe(false);
      expect(estimate.concurrency).toBe(3);
    });

    it('should format time correctly', async () => {
      const estimateShort = await estimator.estimateBatchTime(3, 3);
      expect(estimateShort.estimatedTimeFormatted).toMatch(/minutes|seconds/);

      const estimateLong = await estimator.estimateBatchTime(300, 3);
      expect(estimateLong.estimatedTimeFormatted).toMatch(/h|minutes/);
      
      if (estimateLong.estimatedTimeHours) {
        expect(estimateLong.estimatedTimeHours).toBeGreaterThan(0);
      }
    });

    it('should calculate items per minute correctly', async () => {
      const estimate = await estimator.estimateBatchTime(60, 3);

      // With 3 concurrent and 20s per conversation: 3/20 * 60 = 9 items/min
      expect(estimate.itemsPerMinute).toBeCloseTo(9, 0);
    });

    it('should handle edge cases', async () => {
      // Single item
      const estimateSingle = await estimator.estimateBatchTime(1, 1);
      expect(estimateSingle.estimatedTimeSeconds).toBeGreaterThan(0);

      // Very large batch
      const estimateLarge = await estimator.estimateBatchTime(1000, 5);
      expect(estimateLarge.estimatedTimeMinutes).toBeGreaterThan(60);
    });
  });

  describe('getHistoricalAverage', () => {
    it('should return historical stats for template tier', async () => {
      const stats = await estimator.getHistoricalAverage('template');

      expect(stats.tier).toBe('template');
      expect(stats.avgInputTokens).toBe(2000);
      expect(stats.avgOutputTokens).toBe(3000);
      expect(stats.avgCostPerConversation).toBeGreaterThan(0);
      expect(stats.avgDurationSeconds).toBe(20);
      expect(stats.sampleSize).toBe(0); // No historical data yet
      expect(stats.confidenceLevel).toBe('low');
    });

    it('should return stats for each tier', async () => {
      const tiers: TierType[] = ['template', 'scenario', 'edge_case'];

      for (const tier of tiers) {
        const stats = await estimator.getHistoricalAverage(tier);
        expect(stats.tier).toBe(tier);
        expect(stats.avgInputTokens).toBeGreaterThan(0);
        expect(stats.avgOutputTokens).toBeGreaterThan(0);
      }
    });

    it('should show higher token counts for higher tiers', async () => {
      const templateStats = await estimator.getHistoricalAverage('template');
      const scenarioStats = await estimator.getHistoricalAverage('scenario');
      const edgeCaseStats = await estimator.getHistoricalAverage('edge_case');

      expect(scenarioStats.avgInputTokens).toBeGreaterThan(templateStats.avgInputTokens);
      expect(edgeCaseStats.avgInputTokens).toBeGreaterThan(scenarioStats.avgInputTokens);
      
      expect(scenarioStats.avgOutputTokens).toBeGreaterThan(templateStats.avgOutputTokens);
      expect(edgeCaseStats.avgOutputTokens).toBeGreaterThan(scenarioStats.avgOutputTokens);
    });
  });

  describe('getComprehensiveEstimate', () => {
    it('should provide comprehensive estimate with all data', async () => {
      const estimate = await estimator.getComprehensiveEstimate({
        conversationCount: 50,
        tier: 'scenario',
        concurrency: 5,
        rateLimit: 50,
        useHistoricalData: true
      });

      expect(estimate.cost).toBeDefined();
      expect(estimate.time).toBeDefined();
      expect(estimate.historical).toBeDefined();
      expect(estimate.summary).toBeDefined();

      expect(estimate.summary.totalConversations).toBe(50);
      expect(estimate.summary.tier).toBe('scenario');
      expect(estimate.summary.estimatedCost).toBeGreaterThan(0);
      expect(estimate.summary.estimatedDuration).toBeDefined();
    });

    it('should work without historical data', async () => {
      const estimate = await estimator.getComprehensiveEstimate({
        conversationCount: 10,
        tier: 'template',
        concurrency: 3
      });

      expect(estimate.historical).toBeUndefined();
      expect(estimate.cost).toBeDefined();
      expect(estimate.time).toBeDefined();
    });

    it('should use defaults for optional parameters', async () => {
      const estimate = await estimator.getComprehensiveEstimate({
        conversationCount: 20
      });

      expect(estimate.time.concurrency).toBe(3); // Default concurrency
      expect(estimate.cost.conversationCount).toBe(20);
    });
  });

  describe('calculateCostVariance', () => {
    it('should calculate variance correctly', () => {
      const result = estimator.calculateCostVariance(10.0, 11.0);

      expect(result.variance).toBe(1.0);
      expect(result.percentageDiff).toBe(10.0);
      expect(result.withinMargin).toBe(true);
    });

    it('should identify estimates within 10% margin', () => {
      const within = estimator.calculateCostVariance(100, 105);
      expect(within.withinMargin).toBe(true);
      expect(within.percentageDiff).toBe(5);

      const outside = estimator.calculateCostVariance(100, 120);
      expect(outside.withinMargin).toBe(false);
      expect(outside.percentageDiff).toBe(20);
    });

    it('should handle negative variance (under-estimate)', () => {
      const result = estimator.calculateCostVariance(10.0, 9.0);

      expect(result.variance).toBe(-1.0);
      expect(result.percentageDiff).toBe(-10.0);
      expect(result.withinMargin).toBe(true);
    });

    it('should handle zero variance', () => {
      const result = estimator.calculateCostVariance(10.0, 10.0);

      expect(result.variance).toBe(0);
      expect(result.percentageDiff).toBe(0);
      expect(result.withinMargin).toBe(true);
    });
  });

  describe('calculateTimeVariance', () => {
    it('should calculate time variance correctly', () => {
      const result = estimator.calculateTimeVariance(100, 120);

      expect(result.variance).toBe(20);
      expect(result.percentageDiff).toBe(20);
      expect(result.withinMargin).toBe(true);
    });

    it('should identify estimates within 20% margin', () => {
      const within = estimator.calculateTimeVariance(100, 115);
      expect(within.withinMargin).toBe(true);

      const outside = estimator.calculateTimeVariance(100, 130);
      expect(outside.withinMargin).toBe(false);
      expect(outside.percentageDiff).toBe(30);
    });

    it('should handle negative variance (faster than expected)', () => {
      const result = estimator.calculateTimeVariance(100, 80);

      expect(result.variance).toBe(-20);
      expect(result.percentageDiff).toBe(-20);
      expect(result.withinMargin).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should provide accurate estimates for typical batch (90-100 conversations)', async () => {
      const estimate = await estimator.getComprehensiveEstimate({
        conversationCount: 90,
        concurrency: 3,
        useHistoricalData: true
      });

      // For 90 conversations at scenario tier
      expect(estimate.cost.totalCost).toBeGreaterThan(25); // Should be $25-35
      expect(estimate.cost.totalCost).toBeLessThan(40);

      // With concurrency 3, should take 30-40 minutes
      expect(estimate.time.estimatedTimeMinutes).toBeGreaterThan(20);
      expect(estimate.time.estimatedTimeMinutes).toBeLessThan(60);
    });

    it('should show cost difference between tiers for full dataset', async () => {
      const templateEstimate = await estimator.getComprehensiveEstimate({
        conversationCount: 100,
        tier: 'template'
      });

      const edgeCaseEstimate = await estimator.getComprehensiveEstimate({
        conversationCount: 100,
        tier: 'edge_case'
      });

      // Edge cases should cost more
      const costDifference = edgeCaseEstimate.cost.totalCost - templateEstimate.cost.totalCost;
      expect(costDifference).toBeGreaterThan(0);
      
      // Should be roughly 60% more expensive (edge_case vs template)
      const ratio = edgeCaseEstimate.cost.totalCost / templateEstimate.cost.totalCost;
      expect(ratio).toBeGreaterThan(1.5);
      expect(ratio).toBeLessThan(2.0);
    });

    it('should show time savings with higher concurrency', async () => {
      const sequential = await estimator.estimateBatchTime(90, 1);
      const parallel = await estimator.estimateBatchTime(90, 5);

      const timeSavings = sequential.estimatedTimeMinutes - parallel.estimatedTimeMinutes;
      expect(timeSavings).toBeGreaterThan(10); // Should save significant time
    });
  });

  describe('edge cases and validation', () => {
    it('should handle zero conversations', async () => {
      const estimate = await estimator.estimateBatchCost(0, 'template');
      
      expect(estimate.totalCost).toBe(0);
      expect(estimate.totalInputTokens).toBe(0);
      expect(estimate.totalOutputTokens).toBe(0);
    });

    it('should handle single conversation', async () => {
      const estimate = await estimator.estimateBatchCost(1, 'template');
      
      expect(estimate.conversationCount).toBe(1);
      expect(estimate.totalCost).toBe(estimate.costPerConversation);
    });

    it('should round costs to 2 decimal places', async () => {
      const estimate = await estimator.estimateBatchCost(3, 'template');
      
      // Check that values are rounded
      expect(estimate.totalCost.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
      expect(estimate.costPerConversation.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });
});

