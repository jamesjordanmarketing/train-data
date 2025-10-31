/**
 * Batch Generation Orchestration Service
 * 
 * Orchestrates parallel processing of multiple conversation generations with:
 * - Concurrency control (default 3 parallel jobs)
 * - Real-time progress tracking
 * - Pause/resume capability
 * - Error recovery and handling
 * - Cost and performance tracking
 */

import { TierType, BatchJob, BatchItem, Conversation } from '../types';
import { batchEstimator, CostEstimate, TimeEstimate } from './batch-estimator';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface BatchGenerationConfig {
  name: string;
  tier?: TierType; // undefined = all tiers
  conversationIds?: string[]; // specific conversations, or generate all
  templateId?: string; // use specific template
  sharedParameters: Record<string, any>; // applied to all conversations
  concurrentProcessing: number; // 1-10, default 3
  errorHandling: 'continue' | 'stop'; // default 'continue'
  priority: 'high' | 'normal' | 'low'; // default 'normal'
  userId: string;
}

export interface BatchJobStatus extends BatchJob {
  progress: number; // percentage 0-100
  elapsedTime?: string;
  estimatedTimeRemaining?: string;
  itemsPerMinute?: number;
  currentItems?: string[]; // IDs of items currently processing
}

export interface ProgressData {
  jobId: string;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number; // percentage
  totalItems: number;
  completedItems: number;
  failedItems: number;
  successfulItems: number;
  currentItem?: string; // item being processed
  elapsedTime: string; // "15 minutes"
  estimatedTimeRemaining: string; // "30 minutes"
  itemsPerMinute: number;
}

export interface BatchJobUpdate {
  status?: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  completedItems?: number;
  failedItems?: number;
  successfulItems?: number;
  startedAt?: string;
  completedAt?: string;
  estimatedTimeRemaining?: string;
  progress?: number;
}

// ============================================================================
// DEPENDENCY INTERFACES (to be implemented by Prompt 1 & 2 services)
// ============================================================================

interface BatchJobService {
  createJob(config: Partial<BatchJob>): Promise<BatchJob>;
  getJobById(jobId: string): Promise<BatchJob>;
  updateJob(jobId: string, updates: Partial<BatchJob>): Promise<BatchJob>;
  updateJobStatus(jobId: string, status: BatchJob['status']): Promise<void>;
  updateItemStatus(itemId: string, status: BatchItem['status']): Promise<void>;
  updateItem(itemId: string, updates: Partial<BatchItem>): Promise<void>;
  incrementProgress(jobId: string, itemId: string, outcome: 'completed' | 'failed'): Promise<void>;
  createBatchItems(jobId: string, items: Partial<BatchItem>[]): Promise<BatchItem[]>;
}

interface ConversationGenerationService {
  generateSingleConversation(config: {
    templateId?: string;
    parameters: Record<string, any>;
    tier: TierType;
    userId: string;
    conversationId: string;
  }): Promise<Conversation>;
}

// ============================================================================
// MOCK IMPLEMENTATIONS (Replace with real services from Prompt 1 & 2)
// ============================================================================

class MockBatchJobService implements BatchJobService {
  private jobs: Map<string, BatchJob> = new Map();
  private items: Map<string, BatchItem> = new Map();

  async createJob(config: Partial<BatchJob>): Promise<BatchJob> {
    const job: BatchJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name || 'Unnamed Job',
      status: 'queued',
      totalItems: config.totalItems || 0,
      completedItems: 0,
      failedItems: 0,
      successfulItems: 0,
      priority: config.priority || 'normal',
      items: [],
      configuration: config.configuration || {
        tier: 'template' as TierType,
        sharedParameters: {},
        concurrentProcessing: 3,
        errorHandling: 'continue'
      }
    };
    this.jobs.set(job.id, job);
    return job;
  }

  async getJobById(jobId: string): Promise<BatchJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    return { ...job };
  }

  async updateJob(jobId: string, updates: Partial<BatchJob>): Promise<BatchJob> {
    const job = await this.getJobById(jobId);
    const updated = { ...job, ...updates };
    this.jobs.set(jobId, updated);
    return updated;
  }

  async updateJobStatus(jobId: string, status: BatchJob['status']): Promise<void> {
    const job = await this.getJobById(jobId);
    job.status = status;
    this.jobs.set(jobId, job);
  }

  async updateItemStatus(itemId: string, status: BatchItem['status']): Promise<void> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }
    item.status = status;
    this.items.set(itemId, item);
  }

  async updateItem(itemId: string, updates: Partial<BatchItem>): Promise<void> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }
    const updated = { ...item, ...updates };
    this.items.set(itemId, updated);
  }

  async incrementProgress(
    jobId: string, 
    itemId: string, 
    outcome: 'completed' | 'failed'
  ): Promise<void> {
    const job = await this.getJobById(jobId);
    
    if (outcome === 'completed') {
      job.completedItems += 1;
      job.successfulItems += 1;
    } else {
      job.completedItems += 1;
      job.failedItems += 1;
    }
    
    this.jobs.set(jobId, job);
  }

  async createBatchItems(jobId: string, items: Partial<BatchItem>[]): Promise<BatchItem[]> {
    const job = await this.getJobById(jobId);
    const batchItems: BatchItem[] = items.map((item, index) => {
      const batchItem: BatchItem = {
        id: `item_${jobId}_${index}_${Date.now()}`,
        position: item.position || index,
        topic: item.topic || `Topic ${index}`,
        tier: item.tier || 'template',
        parameters: item.parameters || {},
        status: 'queued'
      };
      this.items.set(batchItem.id, batchItem);
      return batchItem;
    });
    
    job.items = batchItems;
    this.jobs.set(jobId, job);
    return batchItems;
  }
}

class MockConversationGenerationService implements ConversationGenerationService {
  async generateSingleConversation(config: {
    templateId?: string;
    parameters: Record<string, any>;
    tier: TierType;
    userId: string;
    conversationId: string;
  }): Promise<Conversation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate occasional failures (10% failure rate for testing)
    if (Math.random() < 0.1) {
      throw new Error(`Failed to generate conversation: ${config.conversationId}`);
    }

    return {
      id: config.conversationId,
      title: `Generated: ${config.parameters.topic || 'Untitled'}`,
      persona: config.parameters.persona || 'Default',
      emotion: config.parameters.emotion || 'Neutral',
      tier: config.tier,
      category: config.parameters.categories || [],
      status: 'generated',
      qualityScore: 0.8 + Math.random() * 0.2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: config.userId,
      turns: [],
      totalTurns: 10,
      totalTokens: 5000,
      parameters: config.parameters,
      reviewHistory: []
    };
  }
}

// Singleton instances (replace with real services)
const mockBatchJobService = new MockBatchJobService();
const mockConversationGenerationService = new MockConversationGenerationService();

// ============================================================================
// BATCH GENERATION SERVICE
// ============================================================================

export class BatchGenerationService {
  private activeJobs: Set<string> = new Set();
  private processingPromises: Map<string, Promise<void>> = new Map();
  
  constructor(
    private batchJobService: BatchJobService = mockBatchJobService,
    private conversationGenerationService: ConversationGenerationService = mockConversationGenerationService
  ) {}

  /**
   * Start a new batch generation job
   * Creates the job in the database and starts background processing
   */
  async startBatchGeneration(config: BatchGenerationConfig): Promise<BatchJob> {
    // Validate configuration
    this.validateConfig(config);

    // Generate conversation list
    const conversationSpecs = this.generateConversationSpecs(config);

    // Create batch job
    const job = await this.batchJobService.createJob({
      name: config.name,
      status: 'queued',
      totalItems: conversationSpecs.length,
      completedItems: 0,
      failedItems: 0,
      successfulItems: 0,
      priority: config.priority,
      configuration: {
        tier: config.tier || 'template',
        sharedParameters: config.sharedParameters,
        concurrentProcessing: config.concurrentProcessing,
        errorHandling: config.errorHandling
      }
    });

    // Create batch items
    await this.batchJobService.createBatchItems(
      job.id,
      conversationSpecs.map((spec, index) => ({
        position: index,
        topic: spec.topic,
        tier: spec.tier,
        parameters: spec.parameters,
        status: 'queued'
      }))
    );

    // Start background processing (don't await)
    this.startBackgroundProcessing(job.id);

    return job;
  }

  /**
   * Start background processing for a job
   */
  private startBackgroundProcessing(jobId: string): void {
    const processingPromise = this.processBatchJob(jobId)
      .catch(error => {
        console.error(`Background processing failed for job ${jobId}:`, error);
      })
      .finally(() => {
        this.activeJobs.delete(jobId);
        this.processingPromises.delete(jobId);
      });

    this.activeJobs.add(jobId);
    this.processingPromises.set(jobId, processingPromise);
  }

  /**
   * Process a batch job with concurrency control
   */
  async processBatchJob(jobId: string): Promise<void> {
    const job = await this.batchJobService.getJobById(jobId);

    // Update to processing
    await this.batchJobService.updateJobStatus(jobId, 'processing');
    await this.batchJobService.updateJob(jobId, { 
      startedAt: new Date().toISOString() 
    });

    // Get queued items
    const queuedItems = job.items.filter(item => item.status === 'queued');
    const concurrency = job.configuration.concurrentProcessing;
    const errorHandling = job.configuration.errorHandling;

    try {
      // Process in batches of N concurrent items
      for (let i = 0; i < queuedItems.length; i += concurrency) {
        const batch = queuedItems.slice(i, i + concurrency);

        // Check if job was paused/cancelled
        const currentJob = await this.batchJobService.getJobById(jobId);
        if (currentJob.status === 'paused' || currentJob.status === 'cancelled') {
          console.log(`Job ${jobId} ${currentJob.status}. Stopping processing.`);
          return;
        }

        // Process batch in parallel
        const results = await Promise.allSettled(
          batch.map(item => this.processItem(jobId, item))
        );

        // Handle errors
        const anyFailed = results.some(r => r.status === 'rejected');
        if (anyFailed && errorHandling === 'stop') {
          await this.batchJobService.updateJobStatus(jobId, 'failed');
          throw new Error('Batch processing stopped due to error (errorHandling: stop)');
        }

        // Update progress
        await this.updateProgress(jobId);
      }

      // All items processed successfully
      await this.batchJobService.updateJobStatus(jobId, 'completed');
      await this.batchJobService.updateJob(jobId, {
        completedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error(`Batch job ${jobId} failed:`, error);
      await this.batchJobService.updateJobStatus(jobId, 'failed');
      await this.batchJobService.updateJob(jobId, {
        completedAt: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Process a single batch item
   */
  private async processItem(jobId: string, item: BatchItem): Promise<void> {
    try {
      // Update item status
      await this.batchJobService.updateItemStatus(item.id, 'processing');

      // Generate conversation
      const conversation = await this.conversationGenerationService.generateSingleConversation({
        templateId: item.parameters.templateId,
        parameters: item.parameters,
        tier: item.tier,
        userId: item.parameters.userId,
        conversationId: `${item.tier}_${item.position}`
      });

      // Update item as completed
      await this.batchJobService.updateItemStatus(item.id, 'completed');
      await this.batchJobService.updateItem(item.id, {
        conversationId: conversation.id,
        progress: 100
      });

      // Increment job progress
      await this.batchJobService.incrementProgress(jobId, item.id, 'completed');

    } catch (error: any) {
      console.error(`Item ${item.id} failed:`, error);

      // Update item as failed
      await this.batchJobService.updateItemStatus(item.id, 'failed');
      await this.batchJobService.updateItem(item.id, {
        error: error.message || 'Unknown error'
      });

      // Increment job failed count
      await this.batchJobService.incrementProgress(jobId, item.id, 'failed');

      throw error;
    }
  }

  /**
   * Pause a running job
   */
  async pauseJob(jobId: string): Promise<BatchJob> {
    const job = await this.batchJobService.getJobById(jobId);

    if (job.status !== 'processing') {
      throw new Error(`Cannot pause job ${jobId} with status ${job.status}`);
    }

    // Update status to paused
    await this.batchJobService.updateJobStatus(jobId, 'paused');

    // Return updated job
    return this.batchJobService.getJobById(jobId);
  }

  /**
   * Resume a paused job
   */
  async resumeJob(jobId: string): Promise<BatchJob> {
    const job = await this.batchJobService.getJobById(jobId);

    if (job.status !== 'paused') {
      throw new Error(`Cannot resume job ${jobId} with status ${job.status}`);
    }

    // Update status to processing
    await this.batchJobService.updateJobStatus(jobId, 'processing');

    // Restart background processing
    this.startBackgroundProcessing(jobId);

    // Return updated job
    return this.batchJobService.getJobById(jobId);
  }

  /**
   * Cancel a running or paused job
   */
  async cancelJob(jobId: string): Promise<BatchJob> {
    const job = await this.batchJobService.getJobById(jobId);

    if (job.status === 'completed' || job.status === 'cancelled') {
      throw new Error(`Cannot cancel job ${jobId} with status ${job.status}`);
    }

    // Update status to cancelled
    await this.batchJobService.updateJobStatus(jobId, 'cancelled');
    await this.batchJobService.updateJob(jobId, {
      completedAt: new Date().toISOString()
    });

    // Return updated job
    return this.batchJobService.getJobById(jobId);
  }

  /**
   * Get current job status with progress data
   */
  async getJobStatus(jobId: string): Promise<BatchJobStatus> {
    const job = await this.batchJobService.getJobById(jobId);

    // Calculate progress
    const progressData = await this.calculateProgress(jobId);

    // Get currently processing items
    const currentItems = job.items
      .filter(item => item.status === 'processing')
      .map(item => item.id);

    return {
      ...job,
      progress: progressData.progress,
      elapsedTime: progressData.elapsedTime,
      estimatedTimeRemaining: progressData.estimatedTimeRemaining,
      itemsPerMinute: progressData.itemsPerMinute,
      currentItems
    };
  }

  /**
   * Calculate progress data for a job
   */
  async calculateProgress(jobId: string): Promise<ProgressData> {
    const job = await this.batchJobService.getJobById(jobId);

    // Calculate progress percentage
    const progress = job.totalItems > 0 
      ? Math.round((job.completedItems / job.totalItems) * 100)
      : 0;

    // Calculate elapsed time
    let elapsedTime = '0 minutes';
    let itemsPerMinute = 0;
    let estimatedTimeRemaining = 'calculating...';

    if (job.startedAt) {
      const startTime = new Date(job.startedAt).getTime();
      const now = Date.now();
      const elapsedMs = now - startTime;
      const elapsedMinutes = elapsedMs / (1000 * 60);

      elapsedTime = this.formatDuration(Math.floor(elapsedMs / 1000));

      // Calculate rate
      if (job.completedItems > 0 && elapsedMinutes > 0) {
        itemsPerMinute = Math.round((job.completedItems / elapsedMinutes) * 10) / 10;

        // Estimate time remaining
        const remainingItems = job.totalItems - job.completedItems;
        const estimatedMinutesRemaining = remainingItems / itemsPerMinute;
        estimatedTimeRemaining = this.formatDuration(
          Math.ceil(estimatedMinutesRemaining * 60)
        );
      }
    }

    // Get current item
    const currentItem = job.items.find(item => item.status === 'processing');

    return {
      jobId: job.id,
      status: job.status,
      progress,
      totalItems: job.totalItems,
      completedItems: job.completedItems,
      failedItems: job.failedItems,
      successfulItems: job.successfulItems,
      currentItem: currentItem?.id,
      elapsedTime,
      estimatedTimeRemaining,
      itemsPerMinute
    };
  }

  /**
   * Update progress for a job
   */
  private async updateProgress(jobId: string): Promise<void> {
    const progressData = await this.calculateProgress(jobId);

    await this.batchJobService.updateJob(jobId, {
      estimatedTimeRemaining: progressData.estimatedTimeRemaining
    });
  }

  /**
   * Get estimate for a batch generation
   */
  async estimateBatch(config: BatchGenerationConfig): Promise<{
    cost: CostEstimate;
    time: TimeEstimate;
  }> {
    const conversationSpecs = this.generateConversationSpecs(config);
    const conversationCount = conversationSpecs.length;

    const costEstimate = await batchEstimator.estimateBatchCost(
      conversationCount,
      config.tier
    );

    const timeEstimate = await batchEstimator.estimateBatchTime(
      conversationCount,
      config.concurrentProcessing
    );

    return {
      cost: costEstimate,
      time: timeEstimate
    };
  }

  /**
   * Validate batch generation configuration
   */
  private validateConfig(config: BatchGenerationConfig): void {
    if (!config.name || config.name.trim() === '') {
      throw new Error('Job name is required');
    }

    if (config.concurrentProcessing < 1 || config.concurrentProcessing > 10) {
      throw new Error('Concurrent processing must be between 1 and 10');
    }

    if (!config.userId) {
      throw new Error('User ID is required');
    }

    if (!config.sharedParameters) {
      throw new Error('Shared parameters are required');
    }
  }

  /**
   * Generate conversation specifications from config
   */
  private generateConversationSpecs(config: BatchGenerationConfig): Array<{
    topic: string;
    tier: TierType;
    parameters: Record<string, any>;
  }> {
    // If specific conversation IDs provided, use those
    if (config.conversationIds && config.conversationIds.length > 0) {
      return config.conversationIds.map(id => ({
        topic: `Topic for ${id}`,
        tier: config.tier || 'template',
        parameters: {
          ...config.sharedParameters,
          conversationId: id,
          userId: config.userId,
          templateId: config.templateId
        }
      }));
    }

    // Otherwise generate default set
    const specs: Array<{
      topic: string;
      tier: TierType;
      parameters: Record<string, any>;
    }> = [];

    const tiers: TierType[] = config.tier 
      ? [config.tier]
      : ['template', 'scenario', 'edge_case'];

    const conversationsPerTier = config.tier ? 10 : 30; // 10 if specific tier, 30 each if all tiers

    for (const tier of tiers) {
      for (let i = 0; i < conversationsPerTier; i++) {
        specs.push({
          topic: `${tier} conversation ${i + 1}`,
          tier,
          parameters: {
            ...config.sharedParameters,
            userId: config.userId,
            templateId: config.templateId
          }
        });
      }
    }

    return specs;
  }

  /**
   * Format duration in seconds to human-readable string
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes} minutes`;
    } else {
      return `${secs} seconds`;
    }
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): string[] {
    return Array.from(this.activeJobs);
  }

  /**
   * Check if a job is currently processing
   */
  isJobActive(jobId: string): boolean {
    return this.activeJobs.has(jobId);
  }
}

// Export singleton instance
export const batchGenerationService = new BatchGenerationService();

