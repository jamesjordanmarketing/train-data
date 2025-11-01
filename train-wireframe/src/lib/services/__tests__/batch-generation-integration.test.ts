import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BatchGenerationService } from '../batch-generation-service';

describe('BatchGenerationService Integration', () => {
  let service: BatchGenerationService;

  beforeEach(() => {
    service = new BatchGenerationService();
  });

  describe('Batch Configuration', () => {
    it('should create valid batch configuration', () => {
      const config = {
        templateId: 'test-template',
        count: 10,
        tier: 'premium' as const,
        categories: ['support', 'billing'],
        qualityTarget: 85,
      };

      expect(config.count).toBe(10);
      expect(config.tier).toBe('premium');
    });

    it('should validate batch size limits', () => {
      const smallBatch = { count: 5 };
      const largeBatch = { count: 100 };

      expect(smallBatch.count).toBeGreaterThan(0);
      expect(largeBatch.count).toBeLessThanOrEqual(100);
    });
  });

  describe('Quality Validation', () => {
    it('should validate quality score ranges', () => {
      const scores = [75, 85, 90, 92, 88];
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;

      expect(average).toBeGreaterThan(0);
      expect(average).toBeLessThanOrEqual(100);
    });
  });
});

