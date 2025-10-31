/**
 * Batch Generation Service Unit Tests
 * 
 * Tests for batchGenerationService with concurrent processing,
 * progress tracking, and error handling
 */

import { batchGenerationService } from '../batch-generation-service';
import { batchJobService } from '../batch-job-service';
import { getConversationGenerationService } from '../conversation-generation-service';

// Mock dependencies
jest.mock('../batch-job-service');
jest.mock('../conversation-generation-service');
jest.mock('../conversation-service');

describe('batchGenerationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startBatchGeneration', () => {
    it('should create batch job with valid configuration', async () => {
      const mockJobId = 'job-123';
      const mockRequest = {
        name: 'Test Batch',
        userId: 'user-123',
        tier: 'template' as const,
        parameterSets: [
          {
            templateId: 'template-1',
            parameters: { persona: 'Test', emotion: 'Happy' },
            tier: 'template' as const,
          },
        ],
        concurrentProcessing: 3,
        errorHandling: 'continue' as const,
      };

      (batchJobService.create as jest.Mock).mockResolvedValue({
        id: mockJobId,
        name: mockRequest.name,
        status: 'queued',
        configuration: mockRequest,
        progress: {
          total: 1,
          completed: 0,
          successful: 0,
          failed: 0,
          percentage: 0,
        },
      });

      const result = await batchGenerationService.startBatchGeneration(mockRequest);

      expect(result.id).toBe(mockJobId);
      expect(result.status).toBe('queued');
      expect(batchJobService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockRequest.name,
          total_items: 1,
        })
      );
    });

    it('should validate minimum required fields', async () => {
      await expect(
        batchGenerationService.startBatchGeneration({
          name: '',
          userId: '',
        } as any)
      ).rejects.toThrow();
    });

    it('should calculate cost estimate for batch', async () => {
      const mockRequest = {
        name: 'Test Batch',
        userId: 'user-123',
        parameterSets: [
          { templateId: 'template-1', parameters: {}, tier: 'template' as const },
          { templateId: 'template-2', parameters: {}, tier: 'scenario' as const },
        ],
      };

      (batchJobService.create as jest.Mock).mockResolvedValue({
        id: 'job-123',
        configuration: mockRequest,
      });

      const result = await batchGenerationService.startBatchGeneration(mockRequest);

      expect(result.configuration).toBeDefined();
    });
  });

  describe('processBatchJob', () => {
    it('should process batch with concurrent executions', async () => {
      const mockJobId = 'job-123';
      const mockJob = {
        id: mockJobId,
        status: 'queued',
        configuration: {
          parameterSets: [
            { templateId: 'template-1', parameters: {}, tier: 'template' as const },
            { templateId: 'template-2', parameters: {}, tier: 'template' as const },
            { templateId: 'template-3', parameters: {}, tier: 'template' as const },
          ],
          concurrentProcessing: 2,
          errorHandling: 'continue',
          userId: 'user-123',
        },
      };

      (batchJobService.getById as jest.Mock).mockResolvedValue(mockJob);
      (batchJobService.updateProgress as jest.Mock).mockResolvedValue({});

      const mockGenService = {
        generateSingleConversation: jest.fn().mockResolvedValue({
          success: true,
          conversation: { id: 'conv-1' },
        }),
      };
      (getConversationGenerationService as jest.Mock).mockReturnValue(mockGenService);

      await batchGenerationService.processBatchJob(mockJobId);

      expect(mockGenService.generateSingleConversation).toHaveBeenCalledTimes(3);
      expect(batchJobService.updateProgress).toHaveBeenCalled();
    });

    it('should handle individual generation failures with continue strategy', async () => {
      const mockJobId = 'job-123';
      const mockJob = {
        id: mockJobId,
        status: 'queued',
        configuration: {
          parameterSets: [
            { templateId: 'template-1', parameters: {}, tier: 'template' as const },
            { templateId: 'template-2', parameters: {}, tier: 'template' as const },
          ],
          concurrentProcessing: 1,
          errorHandling: 'continue',
          userId: 'user-123',
        },
      };

      (batchJobService.getById as jest.Mock).mockResolvedValue(mockJob);
      (batchJobService.updateProgress as jest.Mock).mockResolvedValue({});

      const mockGenService = {
        generateSingleConversation: jest
          .fn()
          .mockResolvedValueOnce({ success: false, error: { message: 'Failed' } })
          .mockResolvedValueOnce({ success: true, conversation: { id: 'conv-2' } }),
      };
      (getConversationGenerationService as jest.Mock).mockReturnValue(mockGenService);

      await batchGenerationService.processBatchJob(mockJobId);

      expect(mockGenService.generateSingleConversation).toHaveBeenCalledTimes(2);
      expect(batchJobService.updateProgress).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({
          failed: 1,
          successful: 1,
        })
      );
    });

    it('should stop processing on error with stop strategy', async () => {
      const mockJobId = 'job-123';
      const mockJob = {
        id: mockJobId,
        status: 'queued',
        configuration: {
          parameterSets: [
            { templateId: 'template-1', parameters: {}, tier: 'template' as const },
            { templateId: 'template-2', parameters: {}, tier: 'template' as const },
            { templateId: 'template-3', parameters: {}, tier: 'template' as const },
          ],
          concurrentProcessing: 1,
          errorHandling: 'stop',
          userId: 'user-123',
        },
      };

      (batchJobService.getById as jest.Mock).mockResolvedValue(mockJob);
      (batchJobService.updateProgress as jest.Mock).mockResolvedValue({});
      (batchJobService.updateStatus as jest.Mock).mockResolvedValue({});

      const mockGenService = {
        generateSingleConversation: jest
          .fn()
          .mockResolvedValueOnce({ success: true, conversation: { id: 'conv-1' } })
          .mockResolvedValueOnce({ success: false, error: { message: 'Failed' } }),
      };
      (getConversationGenerationService as jest.Mock).mockReturnValue(mockGenService);

      await batchGenerationService.processBatchJob(mockJobId);

      expect(mockGenService.generateSingleConversation).toHaveBeenCalledTimes(2);
      expect(batchJobService.updateStatus).toHaveBeenCalledWith(
        mockJobId,
        'failed',
        expect.any(String)
      );
    });

    it('should respect concurrency limits', async () => {
      const mockJobId = 'job-123';
      const concurrentProcessing = 2;
      const mockJob = {
        id: mockJobId,
        status: 'queued',
        configuration: {
          parameterSets: Array(5).fill({
            templateId: 'template-1',
            parameters: {},
            tier: 'template' as const,
          }),
          concurrentProcessing,
          errorHandling: 'continue',
          userId: 'user-123',
        },
      };

      (batchJobService.getById as jest.Mock).mockResolvedValue(mockJob);
      (batchJobService.updateProgress as jest.Mock).mockResolvedValue({});

      let concurrentCount = 0;
      let maxConcurrent = 0;

      const mockGenService = {
        generateSingleConversation: jest.fn().mockImplementation(async () => {
          concurrentCount++;
          maxConcurrent = Math.max(maxConcurrent, concurrentCount);
          await new Promise(resolve => setTimeout(resolve, 10));
          concurrentCount--;
          return { success: true, conversation: { id: 'conv-1' } };
        }),
      };
      (getConversationGenerationService as jest.Mock).mockReturnValue(mockGenService);

      await batchGenerationService.processBatchJob(mockJobId);

      expect(maxConcurrent).toBeLessThanOrEqual(concurrentProcessing);
    });
  });

  describe('getJobStatus', () => {
    it('should return current job status with progress', async () => {
      const mockJobId = 'job-123';
      const mockJob = {
        id: mockJobId,
        status: 'processing',
        progress: {
          total: 10,
          completed: 5,
          successful: 4,
          failed: 1,
          percentage: 50,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (batchJobService.getById as jest.Mock).mockResolvedValue(mockJob);

      const result = await batchGenerationService.getJobStatus(mockJobId);

      expect(result.jobId).toBe(mockJobId);
      expect(result.status).toBe('processing');
      expect(result.progress.percentage).toBe(50);
    });

    it('should calculate estimated time remaining', async () => {
      const startTime = new Date(Date.now() - 60000); // 1 minute ago
      const mockJob = {
        id: 'job-123',
        status: 'processing',
        progress: {
          total: 100,
          completed: 50,
          successful: 50,
          failed: 0,
          percentage: 50,
        },
        started_at: startTime.toISOString(),
        created_at: startTime.toISOString(),
        updated_at: new Date().toISOString(),
      };

      (batchJobService.getById as jest.Mock).mockResolvedValue(mockJob);

      const result = await batchGenerationService.getJobStatus('job-123');

      expect(result.estimatedTimeRemaining).toBeDefined();
      expect(result.estimatedTimeRemaining).toBeGreaterThan(0);
    });
  });

  describe('pauseJob', () => {
    it('should pause active job', async () => {
      const mockJobId = 'job-123';
      
      (batchJobService.updateStatus as jest.Mock).mockResolvedValue({
        id: mockJobId,
        status: 'paused',
      });

      await batchGenerationService.pauseJob(mockJobId);

      expect(batchJobService.updateStatus).toHaveBeenCalledWith(
        mockJobId,
        'paused'
      );
    });
  });

  describe('resumeJob', () => {
    it('should resume paused job', async () => {
      const mockJobId = 'job-123';
      
      (batchJobService.updateStatus as jest.Mock).mockResolvedValue({
        id: mockJobId,
        status: 'processing',
      });

      (batchJobService.getById as jest.Mock).mockResolvedValue({
        id: mockJobId,
        status: 'paused',
        configuration: {
          parameterSets: [],
          userId: 'user-123',
        },
      });

      await batchGenerationService.resumeJob(mockJobId);

      expect(batchJobService.updateStatus).toHaveBeenCalledWith(
        mockJobId,
        'processing'
      );
    });
  });

  describe('cancelJob', () => {
    it('should cancel active job', async () => {
      const mockJobId = 'job-123';
      
      (batchJobService.updateStatus as jest.Mock).mockResolvedValue({
        id: mockJobId,
        status: 'cancelled',
      });

      await batchGenerationService.cancelJob(mockJobId);

      expect(batchJobService.updateStatus).toHaveBeenCalledWith(
        mockJobId,
        'cancelled',
        expect.any(String)
      );
    });

    it('should mark job for cancellation if currently processing', async () => {
      const mockJobId = 'job-123';
      
      // Simulate job currently being processed
      (batchJobService.getById as jest.Mock).mockResolvedValue({
        id: mockJobId,
        status: 'processing',
      });

      await batchGenerationService.cancelJob(mockJobId);

      // Should request cancellation
      expect(batchJobService.updateStatus).toHaveBeenCalled();
    });
  });

  describe('getCostEstimate', () => {
    it('should estimate cost for parameter sets', async () => {
      const parameterSets = [
        { templateId: 'template-1', parameters: {}, tier: 'template' as const },
        { templateId: 'template-2', parameters: {}, tier: 'scenario' as const },
        { templateId: 'template-3', parameters: {}, tier: 'edge_case' as const },
      ];

      const estimate = await batchGenerationService.getCostEstimate(parameterSets);

      expect(estimate.itemCount).toBe(3);
      expect(estimate.estimatedCost).toBeGreaterThan(0);
      expect(estimate.estimatedTime).toBeGreaterThan(0);
    });

    it('should calculate higher cost for edge cases', async () => {
      const templateSets = [
        { templateId: 'template-1', parameters: {}, tier: 'template' as const },
      ];
      const edgeCaseSets = [
        { templateId: 'template-1', parameters: {}, tier: 'edge_case' as const },
      ];

      const templateEstimate = await batchGenerationService.getCostEstimate(templateSets);
      const edgeCaseEstimate = await batchGenerationService.getCostEstimate(edgeCaseSets);

      expect(edgeCaseEstimate.estimatedCost).toBeGreaterThan(templateEstimate.estimatedCost);
    });
  });
});

