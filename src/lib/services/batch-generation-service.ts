/**
 * Batch Generation Service
 * 
 * Orchestrates batch conversation generation with concurrent processing,
 * progress tracking, and error handling.
 * 
 * Features:
 * - Concurrent conversation generation
 * - Real-time progress tracking
 * - Pause/Resume/Cancel controls
 * - Automatic retry on failures
 * - Cost estimation
 * 
 * @module batch-generation-service
 */

import { randomUUID } from 'crypto';
import { getConversationGenerationService, type GenerationParams } from './conversation-generation-service';
import { batchJobService } from './batch-job-service';
import { conversationService } from './conversation-service';
import type { TierType } from '../../../train-wireframe/src/lib/types';

/**
 * Batch generation request parameters
 */
export interface BatchGenerationRequest {
  /** Batch job name */
  name: string;
  
  /** Array of conversation IDs to regenerate (optional) */
  conversationIds?: string[];
  
  /** Shared parameters applied to all conversations */
  sharedParameters?: Record<string, any>;
  
  /** Tier level (if not using conversation IDs) */
  tier?: TierType;
  
  /** Number of concurrent generations */
  concurrentProcessing?: number;
  
  /** Error handling strategy: 'stop' or 'continue' */
  errorHandling?: 'stop' | 'continue';
  
  /** User ID performing the generation */
  userId: string;
  
  /** Job priority */
  priority?: 'low' | 'normal' | 'high';
  
  /** Template ID (if generating new conversations) */
  templateId?: string;
  
  /** Array of parameter sets for new conversations */
  parameterSets?: Array<{
    templateId: string;
    parameters: Record<string, any>;
    tier: TierType;
  }>;
}

/**
 * Batch job status response
 */
export interface BatchJobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    percentage: number;
  };
  estimatedTimeRemaining?: number; // seconds
  estimatedCost?: number; // USD
  actualCost?: number; // USD
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cost and time estimation
 */
interface CostEstimate {
  estimatedCost: number; // USD
  estimatedTime: number; // seconds
  itemCount: number;
}

/**
 * Active batch job tracker
 */
interface ActiveJob {
  jobId: string;
  status: 'processing' | 'paused';
  cancelRequested: boolean;
  pauseRequested: boolean;
}

/**
 * Batch Generation Service
 * 
 * Orchestrates batch conversation generation with concurrent processing
 */
export class BatchGenerationService {
  private generationService = getConversationGenerationService();
  private activeJobs = new Map<string, ActiveJob>();
  
  // Cost estimation constants (Claude Sonnet 3.5)
  private readonly COST_PER_1K_INPUT_TOKENS = 0.003;
  private readonly COST_PER_1K_OUTPUT_TOKENS = 0.015;
  private readonly AVG_INPUT_TOKENS_PER_CONVERSATION = 2000;
  private readonly AVG_OUTPUT_TOKENS_PER_CONVERSATION = 1500;
  private readonly AVG_TIME_PER_CONVERSATION_MS = 12000; // 12 seconds

  /**
   * Start a batch generation job
   * 
   * @param request - Batch generation request parameters
   * @returns Job ID and initial status
   */
  async startBatchGeneration(request: BatchGenerationRequest): Promise<{
    jobId: string;
    status: string;
    estimatedCost: number;
    estimatedTime: number;
  }> {
    console.log(`[BatchGeneration] Starting batch: ${request.name}`);
    
    // Step 1: Prepare batch items
    let items: Array<{
      templateId: string;
      parameters: Record<string, any>;
      tier: TierType;
      position: number;
    }> = [];
    
    if (request.conversationIds && request.conversationIds.length > 0) {
      // Regenerate existing conversations
      const conversations = await Promise.all(
        request.conversationIds.map(id => conversationService.getById(id))
      );
      
      items = conversations.map((conv, index) => ({
        templateId: conv.templateId || '',
        parameters: {
          ...conv.parameters,
          ...request.sharedParameters,
        },
        tier: conv.tier,
        position: index + 1,
      }));
    } else if (request.parameterSets && request.parameterSets.length > 0) {
      // Generate new conversations from parameter sets
      items = request.parameterSets.map((set, index) => ({
        templateId: set.templateId,
        parameters: {
          ...set.parameters,
          ...request.sharedParameters,
        },
        tier: set.tier,
        position: index + 1,
      }));
    } else if (request.templateId && request.tier) {
      // Single template with shared parameters
      items = [{
        templateId: request.templateId,
        parameters: request.sharedParameters || {},
        tier: request.tier,
        position: 1,
      }];
    } else {
      throw new Error('Must provide conversationIds, parameterSets, or templateId with tier');
    }
    
    // Step 2: Estimate cost and time
    const estimate = this.estimateCostAndTime(items.length);
    
    // Step 3: Create batch job
    const batchJob = await batchJobService.createJob(
      {
        name: request.name,
        priority: request.priority || 'normal',
        status: 'queued',
        createdBy: request.userId,
        configuration: {
          tier: request.tier,
          sharedParameters: request.sharedParameters || {},
          concurrentProcessing: request.concurrentProcessing || 3,
          errorHandling: request.errorHandling || 'continue',
        },
      },
      items.map(item => ({
        position: item.position,
        topic: item.parameters.topic || 'Conversation',
        tier: item.tier,
        parameters: {
          templateId: item.templateId,
          ...item.parameters,
        },
        status: 'queued',
      }))
    );
    
    console.log(`[BatchGeneration] Created job ${batchJob.id} with ${items.length} items`);
    
    // Step 4: Start background processing (don't await)
    this.processJobInBackground(batchJob.id, request.concurrentProcessing || 3, request.errorHandling || 'continue', request.userId).catch(error => {
      console.error(`[BatchGeneration] Background processing error for job ${batchJob.id}:`, error);
    });
    
    return {
      jobId: batchJob.id,
      status: 'processing',
      estimatedCost: estimate.estimatedCost,
      estimatedTime: estimate.estimatedTime,
    };
  }

  /**
   * Get job status
   * 
   * @param jobId - Batch job UUID
   * @returns Current job status and progress
   */
  async getJobStatus(jobId: string): Promise<BatchJobStatus> {
    const job = await batchJobService.getJobById(jobId);
    
    const percentage = job.totalItems > 0 
      ? (job.completedItems / job.totalItems) * 100 
      : 0;
    
    return {
      jobId: job.id,
      status: job.status,
      progress: {
        total: job.totalItems,
        completed: job.completedItems,
        successful: job.successfulItems,
        failed: job.failedItems,
        percentage: Math.round(percentage * 10) / 10,
      },
      estimatedTimeRemaining: job.estimatedTimeRemaining,
      estimatedCost: job.estimatedCost,
      actualCost: job.actualCost,
      startedAt: job.startedAt || undefined,
      completedAt: job.completedAt || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  /**
   * Pause a running job
   * 
   * @param jobId - Batch job UUID
   */
  async pauseJob(jobId: string): Promise<BatchJobStatus> {
    console.log(`[BatchGeneration] Pausing job ${jobId}`);
    
    const activeJob = this.activeJobs.get(jobId);
    if (activeJob) {
      activeJob.pauseRequested = true;
      activeJob.status = 'paused';
    }
    
    await batchJobService.updateJobStatus(jobId, 'paused');
    return this.getJobStatus(jobId);
  }

  /**
   * Resume a paused job
   * 
   * @param jobId - Batch job UUID
   */
  async resumeJob(jobId: string): Promise<BatchJobStatus> {
    console.log(`[BatchGeneration] Resuming job ${jobId}`);
    
    const job = await batchJobService.getJobById(jobId);
    
    if (job.status !== 'paused') {
      throw new Error(`Job ${jobId} is not paused (current status: ${job.status})`);
    }
    
    await batchJobService.updateJobStatus(jobId, 'processing');
    
    // Restart processing
    const config = job.configuration || {};
    this.processJobInBackground(
      jobId, 
      config.concurrentProcessing || 3, 
      config.errorHandling || 'continue',
      job.createdBy
    ).catch(error => {
      console.error(`[BatchGeneration] Resume error for job ${jobId}:`, error);
    });
    
    return this.getJobStatus(jobId);
  }

  /**
   * Cancel a job
   * 
   * @param jobId - Batch job UUID
   */
  async cancelJob(jobId: string): Promise<BatchJobStatus> {
    console.log(`[BatchGeneration] Cancelling job ${jobId}`);
    
    const activeJob = this.activeJobs.get(jobId);
    if (activeJob) {
      activeJob.cancelRequested = true;
    }
    
    await batchJobService.updateJobStatus(jobId, 'cancelled');
    
    // Cancel all pending items
    const job = await batchJobService.getJobById(jobId);
    const pendingItems = job.items?.filter(item => item.status === 'queued' || item.status === 'processing') || [];
    
    for (const item of pendingItems) {
      await batchJobService.updateItemStatus(item.id, 'cancelled');
    }
    
    this.activeJobs.delete(jobId);
    
    return this.getJobStatus(jobId);
  }

  /**
   * Estimate cost and time for batch generation
   * 
   * @param itemCount - Number of conversations to generate
   * @returns Cost and time estimates
   */
  private estimateCostAndTime(itemCount: number): CostEstimate {
    const inputCost = (this.AVG_INPUT_TOKENS_PER_CONVERSATION * itemCount / 1000) * this.COST_PER_1K_INPUT_TOKENS;
    const outputCost = (this.AVG_OUTPUT_TOKENS_PER_CONVERSATION * itemCount / 1000) * this.COST_PER_1K_OUTPUT_TOKENS;
    const estimatedCost = inputCost + outputCost;
    
    // Time estimate assumes some concurrency benefit
    const estimatedTime = Math.ceil((itemCount * this.AVG_TIME_PER_CONVERSATION_MS) / 3000); // Assuming 3 concurrent
    
    return {
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      estimatedTime,
      itemCount,
    };
  }

  /**
   * Process batch job in background
   * 
   * @param jobId - Batch job UUID
   * @param concurrency - Number of concurrent generations
   * @param errorHandling - Error handling strategy
   * @param userId - User ID
   */
  private async processJobInBackground(
    jobId: string, 
    concurrency: number, 
    errorHandling: 'stop' | 'continue',
    userId: string
  ): Promise<void> {
    const activeJob: ActiveJob = {
      jobId,
      status: 'processing',
      cancelRequested: false,
      pauseRequested: false,
    };
    this.activeJobs.set(jobId, activeJob);
    
    try {
      // Update job status to processing
      await batchJobService.updateJobStatus(jobId, 'processing');
      
      // Get all queued items
      const job = await batchJobService.getJobById(jobId);
      const queuedItems = job.items?.filter(item => item.status === 'queued') || [];
      
      console.log(`[BatchGeneration] Processing ${queuedItems.length} queued items with concurrency ${concurrency}`);
      
      // Process items with concurrency control
      const processingQueue: Promise<void>[] = [];
      
      for (const item of queuedItems) {
        // Check for pause/cancel
        if (activeJob.pauseRequested) {
          console.log(`[BatchGeneration] Job ${jobId} paused by user`);
          break;
        }
        
        if (activeJob.cancelRequested) {
          console.log(`[BatchGeneration] Job ${jobId} cancelled by user`);
          break;
        }
        
        // Wait if we've hit concurrency limit
        if (processingQueue.length >= concurrency) {
          await Promise.race(processingQueue);
          // Remove completed promises
          processingQueue.splice(0, processingQueue.findIndex(p => p === undefined) + 1);
        }
        
        // Start processing this item
        const promise = this.processItem(jobId, item, userId)
          .then(() => {
            const index = processingQueue.indexOf(promise);
            if (index > -1) {
              processingQueue.splice(index, 1);
            }
          })
          .catch(error => {
            console.error(`[BatchGeneration] Item ${item.id} error:`, error);
            const index = processingQueue.indexOf(promise);
            if (index > -1) {
              processingQueue.splice(index, 1);
            }
            
            // Stop on error if configured
            if (errorHandling === 'stop') {
              activeJob.cancelRequested = true;
            }
          });
        
        processingQueue.push(promise);
      }
      
      // Wait for all remaining items
      await Promise.all(processingQueue);
      
      // Check final status
      const finalJob = await batchJobService.getJobById(jobId);
      if (finalJob.status === 'processing') {
        const finalStatus = finalJob.failedItems === finalJob.totalItems ? 'failed' : 'completed';
        await batchJobService.updateJobStatus(jobId, finalStatus);
      }
      
      console.log(`[BatchGeneration] Job ${jobId} finished: ${finalJob.successfulItems}/${finalJob.totalItems} successful`);
      
    } catch (error) {
      console.error(`[BatchGeneration] Job ${jobId} error:`, error);
      await batchJobService.updateJobStatus(jobId, 'failed');
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * Process a single batch item
   * 
   * @param jobId - Batch job UUID
   * @param item - Batch item to process
   * @param userId - User ID
   */
  private async processItem(jobId: string, item: any, userId: string): Promise<void> {
    try {
      console.log(`[BatchGeneration] Processing item ${item.id} (${item.topic})`);
      
      // Update item status to processing
      await batchJobService.updateItemStatus(item.id, 'processing');
      
      // Generate conversation
      const generationParams: GenerationParams = {
        templateId: item.parameters.templateId,
        parameters: item.parameters,
        tier: item.tier,
        userId,
        runId: jobId,
      };
      
      const result = await this.generationService.generateSingleConversation(generationParams);
      
      if (result.success) {
        // Update item with conversation ID
        await batchJobService.incrementProgress(
          jobId,
          item.id,
          'completed',
          result.conversation.id
        );
        
        console.log(`[BatchGeneration] Item ${item.id} completed: ${result.conversation.id}`);
      } else {
        // Mark as failed
        await batchJobService.incrementProgress(
          jobId,
          item.id,
          'failed',
          undefined,
          result.error?.message || 'Generation failed'
        );
        
        console.error(`[BatchGeneration] Item ${item.id} failed:`, result.error);
      }
      
    } catch (error) {
      console.error(`[BatchGeneration] Item ${item.id} processing error:`, error);
      
      await batchJobService.incrementProgress(
        jobId,
        item.id,
        'failed',
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

/**
 * Singleton instance
 */
let serviceInstance: BatchGenerationService | null = null;

/**
 * Get or create singleton batch generation service
 */
export function getBatchGenerationService(): BatchGenerationService {
  if (!serviceInstance) {
    serviceInstance = new BatchGenerationService();
  }
  return serviceInstance;
}

/**
 * Reset singleton instance (useful for testing)
 */
export function resetBatchGenerationService(): void {
  serviceInstance = null;
}

