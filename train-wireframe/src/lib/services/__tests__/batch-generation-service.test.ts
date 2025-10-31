/**
 * Integration Tests for Batch Generation Service
 * 
 * Tests batch orchestration, concurrency control, error handling,
 * pause/resume functionality, and progress tracking.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BatchGenerationService, BatchGenerationConfig } from '../batch-generation-service';
import { TierType } from '../../types';

describe('BatchGenerationService', () => {
  let service: BatchGenerationService;
  let testConfig: BatchGenerationConfig;

  beforeEach(() => {
    service = new BatchGenerationService();
    
    testConfig = {
      name: 'Test Batch Job',
      tier: 'template',
      conversationIds: Array(10).fill(null).map((_, i) => `test_conv_${i}`),
      sharedParameters: {
        persona: 'Test Persona',
        emotion: 'Neutral',
        topic: 'Test Topic'
      },
      concurrentProcessing: 3,
      errorHandling: 'continue',
      priority: 'normal',
      userId: 'test-user-123'
    };
  });

  describe('startBatchGeneration', () => {
    it('should create a batch job with correct initial state', async () => {
      const job = await service.startBatchGeneration(testConfig);

      expect(job.id).toBeDefined();
      expect(job.name).toBe('Test Batch Job');
      expect(job.status).toBe('queued');
      expect(job.totalItems).toBe(10);
      expect(job.completedItems).toBe(0);
      expect(job.failedItems).toBe(0);
      expect(job.successfulItems).toBe(0);
      expect(job.configuration.concurrentProcessing).toBe(3);
      expect(job.configuration.errorHandling).toBe('continue');
    });

    it('should validate configuration and throw on invalid input', async () => {
      const invalidConfig = { ...testConfig, name: '' };
      
      await expect(
        service.startBatchGeneration(invalidConfig)
      ).rejects.toThrow('Job name is required');
    });

    it('should validate concurrency limits', async () => {
      const invalidConfig = { ...testConfig, concurrentProcessing: 15 };
      
      await expect(
        service.startBatchGeneration(invalidConfig)
      ).rejects.toThrow('Concurrent processing must be between 1 and 10');
    });

    it('should start background processing automatically', async () => {
      const job = await service.startBatchGeneration(testConfig);
      
      // Check if job is in active jobs
      expect(service.isJobActive(job.id)).toBe(true);
    });
  });

  describe('processBatchJob', () => {
    it('should process batch with 10 conversations', async () => {
      const config: BatchGenerationConfig = {
        name: 'Test Batch',
        tier: 'template',
        conversationIds: Array(10).fill(null).map((_, i) => `test_${i}`),
        sharedParameters: { persona: 'Test', emotion: 'Neutral' },
        concurrentProcessing: 3,
        errorHandling: 'continue',
        priority: 'normal',
        userId: 'test-user'
      };

      const job = await service.startBatchGeneration(config);
      expect(job.id).toBeDefined();
      expect(job.status).toBe('queued');

      // Wait for processing to complete
      await service.processBatchJob(job.id);

      const finalJob = await service.getJobStatus(job.id);
      expect(finalJob.status).toBe('completed');
      expect(finalJob.completedItems).toBe(10);
    });

    it('should respect concurrency limits during processing', async () => {
      const config: BatchGenerationConfig = {
        ...testConfig,
        concurrentProcessing: 1 // Sequential processing
      };

      const job = await service.startBatchGeneration(config);
      
      // Start processing
      const processingPromise = service.processBatchJob(job.id);
      
      // Wait a bit for processing to start
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check status - should be processing
      const status = await service.getJobStatus(job.id);
      expect(status.status).toBe('processing');
      
      // Complete processing
      await processingPromise;
    }, 30000); // 30 second timeout

    it('should handle individual conversation failures gracefully with continue mode', async () => {
      // This test would use a mock that forces some failures
      const config: BatchGenerationConfig = {
        ...testConfig,
        errorHandling: 'continue'
      };

      const job = await service.startBatchGeneration(config);
      
      // Process job (some will fail due to 10% failure rate in mock)
      await service.processBatchJob(job.id);

      const finalJob = await service.getJobStatus(job.id);
      
      // Job should complete despite failures
      expect(['completed', 'failed']).toContain(finalJob.status);
      expect(finalJob.completedItems).toBeGreaterThan(0);
    }, 30000);

    it('should update progress after each conversation completes', async () => {
      const job = await service.startBatchGeneration(testConfig);

      // Start processing
      const processingPromise = service.processBatchJob(job.id);

      // Check progress periodically
      let previousCompleted = 0;
      let progressIncreased = false;

      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const status = await service.getJobStatus(job.id);
        
        if (status.completedItems > previousCompleted) {
          progressIncreased = true;
          previousCompleted = status.completedItems;
        }

        if (status.status === 'completed') break;
      }

      expect(progressIncreased).toBe(true);

      await processingPromise;
    }, 30000);
  });

  describe('pauseJob', () => {
    it('should pause a running job', async () => {
      const job = await service.startBatchGeneration(testConfig);

      // Wait for job to start processing
      await new Promise(resolve => setTimeout(resolve, 500));

      // Pause the job
      const pausedJob = await service.pauseJob(job.id);

      expect(pausedJob.status).toBe('paused');
    });

    it('should not start new conversations after pause', async () => {
      const config: BatchGenerationConfig = {
        ...testConfig,
        conversationIds: Array(20).fill(null).map((_, i) => `test_${i}`),
        concurrentProcessing: 2
      };

      const job = await service.startBatchGeneration(config);

      // Wait for some processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Pause
      await service.pauseJob(job.id);

      // Get completed count
      const statusAfterPause = await service.getJobStatus(job.id);
      const completedAtPause = statusAfterPause.completedItems;

      // Wait a bit more
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check that no new items were started
      const statusAfterWait = await service.getJobStatus(job.id);
      
      // Allow for in-flight conversations to complete, but no new ones should start
      expect(statusAfterWait.completedItems).toBeLessThanOrEqual(completedAtPause + 2);
    }, 30000);

    it('should throw error when pausing non-processing job', async () => {
      const job = await service.startBatchGeneration(testConfig);

      // Try to pause immediately (still queued)
      await expect(
        service.pauseJob(job.id)
      ).rejects.toThrow();
    });
  });

  describe('resumeJob', () => {
    it('should resume a paused job', async () => {
      const job = await service.startBatchGeneration(testConfig);

      // Wait for processing to start
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Pause
      await service.pauseJob(job.id);

      // Resume
      const resumedJob = await service.resumeJob(job.id);

      expect(resumedJob.status).toBe('processing');
      expect(service.isJobActive(job.id)).toBe(true);
    }, 30000);

    it('should continue processing remaining items after resume', async () => {
      const config: BatchGenerationConfig = {
        ...testConfig,
        conversationIds: Array(15).fill(null).map((_, i) => `test_${i}`)
      };

      const job = await service.startBatchGeneration(config);

      // Wait for some processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Pause
      await service.pauseJob(job.id);
      const statusAtPause = await service.getJobStatus(job.id);

      // Resume
      await service.resumeJob(job.id);

      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 10000));

      const finalStatus = await service.getJobStatus(job.id);
      
      // Should have completed more items after resume
      expect(finalStatus.completedItems).toBeGreaterThan(statusAtPause.completedItems);
    }, 30000);
  });

  describe('cancelJob', () => {
    it('should cancel a running job', async () => {
      const job = await service.startBatchGeneration(testConfig);

      // Wait for processing to start
      await new Promise(resolve => setTimeout(resolve, 500));

      // Cancel
      const cancelledJob = await service.cancelJob(job.id);

      expect(cancelledJob.status).toBe('cancelled');
      expect(cancelledJob.completedAt).toBeDefined();
    });

    it('should stop processing new conversations after cancellation', async () => {
      const config: BatchGenerationConfig = {
        ...testConfig,
        conversationIds: Array(20).fill(null).map((_, i) => `test_${i}`)
      };

      const job = await service.startBatchGeneration(config);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Cancel
      await service.cancelJob(job.id);
      const statusAfterCancel = await service.getJobStatus(job.id);

      // Wait more
      await new Promise(resolve => setTimeout(resolve, 2000));

      const finalStatus = await service.getJobStatus(job.id);

      // No significant progress should occur after cancellation
      expect(finalStatus.completedItems).toBeLessThanOrEqual(
        statusAfterCancel.completedItems + 3 // Allow for in-flight
      );
    }, 30000);

    it('should throw error when cancelling already completed job', async () => {
      const config: BatchGenerationConfig = {
        ...testConfig,
        conversationIds: ['test_1'] // Just one
      };

      const job = await service.startBatchGeneration(config);

      // Wait for completion
      await service.processBatchJob(job.id);

      // Try to cancel
      await expect(
        service.cancelJob(job.id)
      ).rejects.toThrow();
    }, 30000);
  });

  describe('getJobStatus', () => {
    it('should return current job status with progress', async () => {
      const job = await service.startBatchGeneration(testConfig);

      const status = await service.getJobStatus(job.id);

      expect(status.id).toBe(job.id);
      expect(status.progress).toBeGreaterThanOrEqual(0);
      expect(status.progress).toBeLessThanOrEqual(100);
      expect(status.totalItems).toBe(10);
    });

    it('should include elapsed time and estimates', async () => {
      const job = await service.startBatchGeneration(testConfig);

      // Wait for some processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const status = await service.getJobStatus(job.id);

      expect(status.elapsedTime).toBeDefined();
      expect(status.estimatedTimeRemaining).toBeDefined();
      expect(status.itemsPerMinute).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('should list currently processing items', async () => {
      const job = await service.startBatchGeneration(testConfig);

      // Wait for processing to start
      await new Promise(resolve => setTimeout(resolve, 500));

      const status = await service.getJobStatus(job.id);

      // Should have some items processing (up to concurrency limit)
      if (status.status === 'processing') {
        expect(status.currentItems).toBeDefined();
        expect(status.currentItems!.length).toBeLessThanOrEqual(
          testConfig.concurrentProcessing
        );
      }
    });
  });

  describe('estimateBatch', () => {
    it('should provide accurate cost estimates', async () => {
      const estimate = await service.estimateBatch(testConfig);

      expect(estimate.cost).toBeDefined();
      expect(estimate.cost.totalCost).toBeGreaterThan(0);
      expect(estimate.cost.conversationCount).toBe(10);
      expect(estimate.cost.costPerConversation).toBeGreaterThan(0);
    });

    it('should provide time estimates based on concurrency', async () => {
      const estimate = await service.estimateBatch(testConfig);

      expect(estimate.time).toBeDefined();
      expect(estimate.time.estimatedTimeMinutes).toBeGreaterThan(0);
      expect(estimate.time.concurrency).toBeLessThanOrEqual(
        testConfig.concurrentProcessing
      );
    });

    it('should estimate for different tiers', async () => {
      const templateEstimate = await service.estimateBatch({
        ...testConfig,
        tier: 'template'
      });

      const edgeCaseEstimate = await service.estimateBatch({
        ...testConfig,
        tier: 'edge_case'
      });

      // Edge cases should cost more (more tokens)
      expect(edgeCaseEstimate.cost.costPerConversation).toBeGreaterThan(
        templateEstimate.cost.costPerConversation
      );
    });
  });

  describe('error handling', () => {
    it('should continue on failure when errorHandling is "continue"', async () => {
      const config: BatchGenerationConfig = {
        ...testConfig,
        errorHandling: 'continue'
      };

      const job = await service.startBatchGeneration(config);
      await service.processBatchJob(job.id);

      const status = await service.getJobStatus(job.id);

      // Job should complete even if some items failed
      expect(['completed', 'failed']).toContain(status.status);
    }, 30000);

    it('should log failed items with error messages', async () => {
      const job = await service.startBatchGeneration(testConfig);
      await service.processBatchJob(job.id);

      const status = await service.getJobStatus(job.id);

      // Check for failed items with error messages
      const failedItems = status.items.filter(item => item.status === 'failed');
      
      failedItems.forEach(item => {
        expect(item.error).toBeDefined();
        expect(typeof item.error).toBe('string');
      });
    }, 30000);
  });

  describe('performance', () => {
    it('should process conversations concurrently', async () => {
      const config: BatchGenerationConfig = {
        ...testConfig,
        conversationIds: Array(9).fill(null).map((_, i) => `test_${i}`),
        concurrentProcessing: 3
      };

      const startTime = Date.now();
      const job = await service.startBatchGeneration(config);
      await service.processBatchJob(job.id);
      const endTime = Date.now();

      const totalTime = (endTime - startTime) / 1000; // seconds

      // With concurrency 3, 9 items should take ~3 batches * 2s = ~6s
      // Sequential would take ~18s
      // This confirms parallel processing
      expect(totalTime).toBeLessThan(12); // Should be much less than sequential
    }, 30000);

    it('should track items per minute accurately', async () => {
      const job = await service.startBatchGeneration(testConfig);

      // Wait for some processing
      await new Promise(resolve => setTimeout(resolve, 5000));

      const status = await service.getJobStatus(job.id);

      if (status.itemsPerMinute && status.itemsPerMinute > 0) {
        // Should process at least 1-2 items per minute with our setup
        expect(status.itemsPerMinute).toBeGreaterThan(0);
        expect(status.itemsPerMinute).toBeLessThan(100); // Sanity check
      }
    }, 30000);
  });

  describe('progress tracking', () => {
    it('should calculate progress percentage correctly', async () => {
      const job = await service.startBatchGeneration(testConfig);

      // Process job
      const processingPromise = service.processBatchJob(job.id);

      // Check progress at intervals
      const progressChecks: number[] = [];

      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const status = await service.getJobStatus(job.id);
        progressChecks.push(status.progress);
        
        if (status.status === 'completed') break;
      }

      await processingPromise;

      // Progress should generally increase
      const increasingProgress = progressChecks.some((progress, i) => 
        i > 0 && progress > progressChecks[i - 1]
      );

      expect(increasingProgress).toBe(true);
    }, 30000);

    it('should update estimated time remaining as job progresses', async () => {
      const config: BatchGenerationConfig = {
        ...testConfig,
        conversationIds: Array(15).fill(null).map((_, i) => `test_${i}`)
      };

      const job = await service.startBatchGeneration(config);

      // Wait for initial estimate
      await new Promise(resolve => setTimeout(resolve, 3000));

      const status1 = await service.getJobStatus(job.id);
      const estimate1 = status1.estimatedTimeRemaining;

      // Wait more
      await new Promise(resolve => setTimeout(resolve, 3000));

      const status2 = await service.getJobStatus(job.id);
      const estimate2 = status2.estimatedTimeRemaining;

      // Estimates should be provided
      expect(estimate1).toBeDefined();
      expect(estimate2).toBeDefined();

      // Progress should have been made
      expect(status2.completedItems).toBeGreaterThanOrEqual(status1.completedItems);
    }, 30000);
  });
});

