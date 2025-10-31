/**
 * Batch Job Service
 * 
 * Database service layer for batch job orchestration and progress tracking.
 * Manages batch generation jobs with concurrent processing and error handling.
 */

import { supabase } from '../supabase';
import type { BatchJob, BatchItem, TierType } from '../../../train-wireframe/src/lib/types';

type BatchJobStatus = 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * Batch Job Service
 * 
 * Provides operations for creating, tracking, and managing batch conversation generation jobs
 */
export const batchJobService = {
  /**
   * Create a new batch job with items
   * 
   * @param job - Partial batch job data
   * @param items - Array of batch items
   * @returns Created batch job with embedded items
   * 
   * @example
   * ```typescript
   * const batchJob = await batchJobService.createJob(
   *   {
   *     name: 'Generate Template Conversations',
   *     priority: 'high',
   *     configuration: {
   *       tier: 'template',
   *       sharedParameters: { temperature: 0.7 },
   *       concurrentProcessing: 3,
   *       errorHandling: 'continue'
   *     }
   *   },
   *   [
   *     { position: 1, topic: 'Investment Strategy', tier: 'template', parameters: {...} },
   *     { position: 2, topic: 'Risk Assessment', tier: 'template', parameters: {...} }
   *   ]
   * );
   * ```
   */
  async createJob(
    job: Partial<BatchJob> & { createdBy?: string }, 
    items: Partial<BatchItem>[]
  ): Promise<BatchJob> {
    try {
      // Step 1: Insert batch job
      const { data: jobData, error: jobError } = await supabase
        .from('batch_jobs')
        .insert({
          name: job.name,
          status: job.status || 'queued',
          priority: job.priority || 'normal',
          total_items: items.length,
          completed_items: 0,
          failed_items: 0,
          successful_items: 0,
          tier: job.configuration?.tier,
          shared_parameters: job.configuration?.sharedParameters || {},
          concurrent_processing: job.configuration?.concurrentProcessing || 3,
          error_handling: job.configuration?.errorHandling || 'continue',
          created_by: job.createdBy,
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Step 2: Insert batch items
      if (items.length > 0) {
        const itemRecords = items.map((item, index) => ({
          batch_job_id: jobData.id,
          position: item.position ?? index + 1,
          topic: item.topic,
          tier: item.tier,
          parameters: item.parameters || {},
          status: item.status || 'queued',
        }));

        const { error: itemsError } = await supabase
          .from('batch_items')
          .insert(itemRecords);

        if (itemsError) {
          // Rollback: delete job if items insertion fails
          await supabase.from('batch_jobs').delete().eq('id', jobData.id);
          throw itemsError;
        }
      }

      // Fetch and return complete job with items
      return this.getJobById(jobData.id);
    } catch (error) {
      console.error('Error creating batch job:', error);
      throw error;
    }
  },

  /**
   * Get batch job by ID with all items
   * 
   * @param id - Batch job UUID
   * @returns Batch job with embedded items
   * 
   * @example
   * ```typescript
   * const job = await batchJobService.getJobById(jobId);
   * console.log(`Job progress: ${job.completedItems}/${job.totalItems}`);
   * ```
   */
  async getJobById(id: string): Promise<BatchJob> {
    try {
      // Fetch job
      const { data: jobData, error: jobError } = await supabase
        .from('batch_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (jobError) throw jobError;

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('batch_items')
        .select('*')
        .eq('batch_job_id', id)
        .order('position', { ascending: true });

      if (itemsError) throw itemsError;

      const items: BatchItem[] = (itemsData || []).map(item => ({
        id: item.id,
        position: item.position,
        topic: item.topic,
        tier: item.tier,
        parameters: item.parameters || {},
        status: item.status,
        progress: item.progress,
        estimatedTime: item.estimated_time,
        conversationId: item.conversation_id,
        error: item.error_message,
      }));

      return {
        id: jobData.id,
        name: jobData.name,
        status: jobData.status,
        totalItems: jobData.total_items,
        completedItems: jobData.completed_items,
        failedItems: jobData.failed_items,
        successfulItems: jobData.successful_items,
        startedAt: jobData.started_at,
        completedAt: jobData.completed_at,
        estimatedTimeRemaining: jobData.estimated_time_remaining,
        priority: jobData.priority,
        items,
        configuration: {
          tier: jobData.tier,
          sharedParameters: jobData.shared_parameters || {},
          concurrentProcessing: jobData.concurrent_processing,
          errorHandling: jobData.error_handling,
        },
      };
    } catch (error) {
      console.error('Error fetching batch job:', error);
      throw error;
    }
  },

  /**
   * Get all batch jobs
   * 
   * @param filters - Optional filters
   * @returns Array of batch jobs
   * 
   * @example
   * ```typescript
   * const jobs = await batchJobService.getAllJobs({ status: 'processing' });
   * ```
   */
  async getAllJobs(filters?: { status?: BatchJobStatus; createdBy?: string }): Promise<BatchJob[]> {
    try {
      let query = supabase
        .from('batch_jobs')
        .select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.createdBy) {
        query = query.eq('created_by', filters.createdBy);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Fetch items for each job
      const jobs = await Promise.all(
        (data || []).map(async (jobData) => {
          const { data: itemsData } = await supabase
            .from('batch_items')
            .select('*')
            .eq('batch_job_id', jobData.id)
            .order('position', { ascending: true });

          const items: BatchItem[] = (itemsData || []).map(item => ({
            id: item.id,
            position: item.position,
            topic: item.topic,
            tier: item.tier,
            parameters: item.parameters || {},
            status: item.status,
            progress: item.progress,
            estimatedTime: item.estimated_time,
            conversationId: item.conversation_id,
            error: item.error_message,
          }));

          return {
            id: jobData.id,
            name: jobData.name,
            status: jobData.status,
            totalItems: jobData.total_items,
            completedItems: jobData.completed_items,
            failedItems: jobData.failed_items,
            successfulItems: jobData.successful_items,
            startedAt: jobData.started_at,
            completedAt: jobData.completed_at,
            estimatedTimeRemaining: jobData.estimated_time_remaining,
            priority: jobData.priority,
            items,
            configuration: {
              tier: jobData.tier,
              sharedParameters: jobData.shared_parameters || {},
              concurrentProcessing: jobData.concurrent_processing,
              errorHandling: jobData.error_handling,
            },
          };
        })
      );

      return jobs;
    } catch (error) {
      console.error('Error fetching batch jobs:', error);
      throw error;
    }
  },

  /**
   * Update batch job status
   * 
   * @param id - Batch job UUID
   * @param status - New status
   * @returns Updated batch job
   * 
   * @example
   * ```typescript
   * await batchJobService.updateJobStatus(jobId, 'processing');
   * ```
   */
  async updateJobStatus(id: string, status: BatchJobStatus): Promise<BatchJob> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Set timestamps based on status
      if (status === 'processing' && !updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      }

      if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('batch_jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Return updated job with items
      return this.getJobById(id);
    } catch (error) {
      console.error('Error updating batch job status:', error);
      throw error;
    }
  },

  /**
   * Increment batch job progress
   * 
   * @param jobId - Batch job UUID
   * @param itemId - Batch item UUID
   * @param status - Item completion status ('completed' or 'failed')
   * @param conversationId - Optional conversation ID if successful
   * @param errorMessage - Optional error message if failed
   * 
   * @example
   * ```typescript
   * await batchJobService.incrementProgress(jobId, itemId, 'completed', conversationId);
   * ```
   */
  async incrementProgress(
    jobId: string,
    itemId: string,
    status: 'completed' | 'failed',
    conversationId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      // Update batch item status
      const itemUpdate: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (conversationId) {
        itemUpdate.conversation_id = conversationId;
      }

      if (errorMessage) {
        itemUpdate.error_message = errorMessage;
      }

      const { error: itemError } = await supabase
        .from('batch_items')
        .update(itemUpdate)
        .eq('id', itemId);

      if (itemError) throw itemError;

      // Get current job to calculate new progress
      const job = await this.getJobById(jobId);

      // Calculate updated counts
      const completedItems = job.completedItems + 1;
      const failedItems = status === 'failed' ? job.failedItems + 1 : job.failedItems;
      const successfulItems = status === 'completed' ? job.successfulItems + 1 : job.successfulItems;

      // Calculate estimated time remaining
      let estimatedTimeRemaining: number | undefined;
      if (job.startedAt && completedItems > 0) {
        const elapsedMs = Date.now() - new Date(job.startedAt).getTime();
        const avgTimePerItem = elapsedMs / completedItems;
        const remainingItems = job.totalItems - completedItems;
        estimatedTimeRemaining = Math.round((avgTimePerItem * remainingItems) / 1000); // in seconds
      }

      // Update job progress
      const jobUpdate: any = {
        completed_items: completedItems,
        failed_items: failedItems,
        successful_items: successfulItems,
        updated_at: new Date().toISOString(),
      };

      if (estimatedTimeRemaining !== undefined) {
        jobUpdate.estimated_time_remaining = estimatedTimeRemaining;
      }

      // Auto-complete job if all items processed
      if (completedItems >= job.totalItems) {
        jobUpdate.status = failedItems === job.totalItems ? 'failed' : 'completed';
        jobUpdate.completed_at = new Date().toISOString();
      }

      const { error: jobError } = await supabase
        .from('batch_jobs')
        .update(jobUpdate)
        .eq('id', jobId);

      if (jobError) throw jobError;
    } catch (error) {
      console.error('Error incrementing batch progress:', error);
      throw error;
    }
  },

  /**
   * Get active jobs for a user
   * 
   * @param userId - User UUID
   * @returns Array of active batch jobs
   * 
   * @example
   * ```typescript
   * const activeJobs = await batchJobService.getActiveJobs(userId);
   * ```
   */
  async getActiveJobs(userId: string): Promise<BatchJob[]> {
    try {
      const { data, error } = await supabase
        .from('batch_jobs')
        .select('*')
        .eq('created_by', userId)
        .in('status', ['queued', 'processing'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch items for each job
      const jobs = await Promise.all(
        (data || []).map(async (jobData) => {
          const { data: itemsData } = await supabase
            .from('batch_items')
            .select('*')
            .eq('batch_job_id', jobData.id)
            .order('position', { ascending: true });

          const items: BatchItem[] = (itemsData || []).map(item => ({
            id: item.id,
            position: item.position,
            topic: item.topic,
            tier: item.tier,
            parameters: item.parameters || {},
            status: item.status,
            progress: item.progress,
            estimatedTime: item.estimated_time,
            conversationId: item.conversation_id,
            error: item.error_message,
          }));

          return {
            id: jobData.id,
            name: jobData.name,
            status: jobData.status,
            totalItems: jobData.total_items,
            completedItems: jobData.completed_items,
            failedItems: jobData.failed_items,
            successfulItems: jobData.successful_items,
            startedAt: jobData.started_at,
            completedAt: jobData.completed_at,
            estimatedTimeRemaining: jobData.estimated_time_remaining,
            priority: jobData.priority,
            items,
            configuration: {
              tier: jobData.tier,
              sharedParameters: jobData.shared_parameters || {},
              concurrentProcessing: jobData.concurrent_processing,
              errorHandling: jobData.error_handling,
            },
          };
        })
      );

      return jobs;
    } catch (error) {
      console.error('Error fetching active jobs:', error);
      throw error;
    }
  },

  /**
   * Cancel a batch job
   * 
   * @param id - Batch job UUID
   * 
   * @example
   * ```typescript
   * await batchJobService.cancelJob(jobId);
   * ```
   */
  async cancelJob(id: string): Promise<void> {
    try {
      await this.updateJobStatus(id, 'cancelled');

      // Update all pending/queued items to cancelled
      const { error } = await supabase
        .from('batch_items')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('batch_job_id', id)
        .in('status', ['queued', 'processing']);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling batch job:', error);
      throw error;
    }
  },

  /**
   * Delete a batch job and its items
   * 
   * @param id - Batch job UUID
   * 
   * @example
   * ```typescript
   * await batchJobService.deleteJob(jobId);
   * ```
   */
  async deleteJob(id: string): Promise<void> {
    try {
      // Delete items first (if cascade is not set up)
      const { error: itemsError } = await supabase
        .from('batch_items')
        .delete()
        .eq('batch_job_id', id);

      if (itemsError) throw itemsError;

      // Delete job
      const { error: jobError } = await supabase
        .from('batch_jobs')
        .delete()
        .eq('id', id);

      if (jobError) throw jobError;
    } catch (error) {
      console.error('Error deleting batch job:', error);
      throw error;
    }
  },
};

