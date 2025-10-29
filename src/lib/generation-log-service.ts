/**
 * Generation Log Service
 * 
 * Service for tracking AI generation requests, responses, and performance metrics
 */

import { supabase } from './supabase';
import {
  GenerationLog,
  CreateGenerationLogInput,
  CostSummary,
  PerformanceMetrics,
  GenerationLogFilter,
} from './types/generation-logs';
import { DatabaseError } from './types/errors';

/**
 * GenerationLogService class
 * Provides all generation log-related operations
 */
export class GenerationLogService {
  /**
   * Create a new generation log entry
   * 
   * @param log - Generation log data
   * @returns Created log entry
   * 
   * @example
   * ```typescript
   * const log = await generationLogService.create({
   *   conversationId: convId,
   *   runId: batchJobId,
   *   templateId: templateId,
   *   requestPayload: { prompt: '...', model: 'claude-sonnet-4' },
   *   responsePayload: { content: '...', usage: {} },
   *   modelUsed: 'claude-sonnet-4-5-20250929',
   *   inputTokens: 1500,
   *   outputTokens: 2500,
   *   costUsd: 0.045,
   *   durationMs: 3200,
   *   status: 'success',
   *   createdBy: userId
   * });
   * ```
   */
  async create(log: CreateGenerationLogInput): Promise<GenerationLog> {
    try {
      const insertData = {
        conversation_id: log.conversationId,
        run_id: log.runId,
        template_id: log.templateId,
        request_payload: log.requestPayload,
        response_payload: log.responsePayload,
        model_used: log.modelUsed,
        parameters: log.parameters || {},
        temperature: log.temperature,
        max_tokens: log.maxTokens,
        input_tokens: log.inputTokens || 0,
        output_tokens: log.outputTokens || 0,
        cost_usd: log.costUsd,
        duration_ms: log.durationMs,
        status: log.status,
        error_message: log.errorMessage,
        error_code: log.errorCode,
        retry_attempt: log.retryAttempt || 0,
        created_by: log.createdBy,
      };

      const { data: createdLog, error } = await supabase
        .from('generation_logs')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating generation log:', error);
        throw new DatabaseError(`Failed to create generation log: ${error.message}`, error);
      }

      return this.mapDbToLog(createdLog);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error creating generation log:', error);
      throw new DatabaseError('Unexpected error creating generation log', error as Error);
    }
  }

  /**
   * Get generation logs by conversation ID
   * 
   * @param conversationId - Conversation UUID
   * @returns Array of generation logs for the conversation
   * 
   * @example
   * ```typescript
   * const logs = await generationLogService.getByConversation(conversationId);
   * console.log(`Found ${logs.length} generation attempts`);
   * ```
   */
  async getByConversation(conversationId: string): Promise<GenerationLog[]> {
    try {
      const { data: logs, error } = await supabase
        .from('generation_logs')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching generation logs:', error);
        throw new DatabaseError(`Failed to fetch generation logs: ${error.message}`, error);
      }

      return (logs || []).map(this.mapDbToLog);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error fetching logs by conversation:', error);
      throw new DatabaseError('Unexpected error fetching logs by conversation', error as Error);
    }
  }

  /**
   * Get generation logs by run/batch ID
   * 
   * @param runId - Batch job/run UUID
   * @returns Array of generation logs for the run
   * 
   * @example
   * ```typescript
   * const logs = await generationLogService.getByRunId(batchJobId);
   * const successfulLogs = logs.filter(l => l.status === 'success');
   * ```
   */
  async getByRunId(runId: string): Promise<GenerationLog[]> {
    try {
      const { data: logs, error } = await supabase
        .from('generation_logs')
        .select('*')
        .eq('run_id', runId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching generation logs:', error);
        throw new DatabaseError(`Failed to fetch generation logs: ${error.message}`, error);
      }

      return (logs || []).map(this.mapDbToLog);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error fetching logs by run:', error);
      throw new DatabaseError('Unexpected error fetching logs by run', error as Error);
    }
  }

  /**
   * Get cost summary for a date range
   * 
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Cost summary with detailed breakdown
   * 
   * @example
   * ```typescript
   * const summary = await generationLogService.getCostSummary(
   *   new Date('2025-01-01'),
   *   new Date('2025-01-31')
   * );
   * console.log(`Total cost: $${summary.totalCost.toFixed(2)}`);
   * console.log(`Success rate: ${(summary.successfulRequests / summary.totalRequests * 100).toFixed(1)}%`);
   * ```
   */
  async getCostSummary(startDate: Date, endDate: Date): Promise<CostSummary> {
    try {
      const { data: logs, error } = await supabase
        .from('generation_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        console.error('Error fetching cost summary:', error);
        throw new DatabaseError(`Failed to fetch cost summary: ${error.message}`, error);
      }

      const summary: CostSummary = {
        totalCost: 0,
        totalRequests: logs?.length || 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        avgCostPerRequest: 0,
        avgDurationMs: 0,
        byModel: {},
        byStatus: {
          success: 0,
          failed: 0,
          rate_limited: 0,
          timeout: 0,
        },
      };

      if (!logs || logs.length === 0) return summary;

      let totalDuration = 0;
      let durationCount = 0;

      logs.forEach((log: any) => {
        // Sum costs and tokens
        summary.totalCost += log.cost_usd || 0;
        summary.totalInputTokens += log.input_tokens || 0;
        summary.totalOutputTokens += log.output_tokens || 0;

        // Count by status
        if (log.status === 'success') summary.successfulRequests++;
        else summary.failedRequests++;
        
        summary.byStatus[log.status as keyof typeof summary.byStatus]++;

        // Track duration
        if (log.duration_ms) {
          totalDuration += log.duration_ms;
          durationCount++;
        }

        // Track by model
        const model = log.model_used || 'unknown';
        if (!summary.byModel[model]) {
          summary.byModel[model] = {
            count: 0,
            cost: 0,
            inputTokens: 0,
            outputTokens: 0,
          };
        }
        summary.byModel[model].count++;
        summary.byModel[model].cost += log.cost_usd || 0;
        summary.byModel[model].inputTokens += log.input_tokens || 0;
        summary.byModel[model].outputTokens += log.output_tokens || 0;
      });

      summary.avgCostPerRequest = summary.totalRequests > 0 
        ? summary.totalCost / summary.totalRequests 
        : 0;
      
      summary.avgDurationMs = durationCount > 0 
        ? totalDuration / durationCount 
        : 0;

      return summary;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error getting cost summary:', error);
      throw new DatabaseError('Unexpected error getting cost summary', error as Error);
    }
  }

  /**
   * Get performance metrics
   * 
   * @param templateId - Optional template ID to filter by
   * @returns Performance metrics including latency percentiles and success rates
   * 
   * @example
   * ```typescript
   * const metrics = await generationLogService.getPerformanceMetrics(templateId);
   * console.log(`P95 latency: ${metrics.p95DurationMs}ms`);
   * console.log(`Success rate: ${(metrics.successRate * 100).toFixed(1)}%`);
   * ```
   */
  async getPerformanceMetrics(templateId?: string): Promise<PerformanceMetrics> {
    try {
      let query = supabase
        .from('generation_logs')
        .select('*')
        .order('created_at', { ascending: true });

      if (templateId) {
        query = query.eq('template_id', templateId);
      }

      const { data: logs, error } = await query;

      if (error) {
        console.error('Error fetching performance metrics:', error);
        throw new DatabaseError(`Failed to fetch performance metrics: ${error.message}`, error);
      }

      const metrics: PerformanceMetrics = {
        avgDurationMs: 0,
        p50DurationMs: 0,
        p95DurationMs: 0,
        p99DurationMs: 0,
        successRate: 0,
        avgInputTokens: 0,
        avgOutputTokens: 0,
        totalRequests: logs?.length || 0,
        requestsPerDay: [],
        errorRate: 0,
      };

      if (!logs || logs.length === 0) return metrics;

      // Calculate durations
      const durations = logs
        .filter((log: any) => log.duration_ms !== null)
        .map((log: any) => log.duration_ms)
        .sort((a, b) => a - b);

      if (durations.length > 0) {
        metrics.avgDurationMs = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        metrics.p50DurationMs = durations[Math.floor(durations.length * 0.5)];
        metrics.p95DurationMs = durations[Math.floor(durations.length * 0.95)];
        metrics.p99DurationMs = durations[Math.floor(durations.length * 0.99)];
      }

      // Calculate success and error rates
      const successCount = logs.filter((log: any) => log.status === 'success').length;
      const errorCount = logs.filter((log: any) => log.status !== 'success').length;
      metrics.successRate = metrics.totalRequests > 0 ? successCount / metrics.totalRequests : 0;
      metrics.errorRate = metrics.totalRequests > 0 ? errorCount / metrics.totalRequests : 0;

      // Calculate average tokens
      const totalInputTokens = logs.reduce((sum, log: any) => sum + (log.input_tokens || 0), 0);
      const totalOutputTokens = logs.reduce((sum, log: any) => sum + (log.output_tokens || 0), 0);
      metrics.avgInputTokens = metrics.totalRequests > 0 ? totalInputTokens / metrics.totalRequests : 0;
      metrics.avgOutputTokens = metrics.totalRequests > 0 ? totalOutputTokens / metrics.totalRequests : 0;

      // Calculate requests per day (last 30 days)
      const requestsByDate: Record<string, number> = {};
      logs.forEach((log: any) => {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        requestsByDate[date] = (requestsByDate[date] || 0) + 1;
      });
      metrics.requestsPerDay = Object.values(requestsByDate);

      return metrics;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error getting performance metrics:', error);
      throw new DatabaseError('Unexpected error getting performance metrics', error as Error);
    }
  }

  /**
   * List generation logs with filters
   * 
   * @param filters - Filter configuration
   * @param limit - Maximum number of results
   * @returns Array of generation logs
   */
  async list(filters?: GenerationLogFilter, limit: number = 100): Promise<GenerationLog[]> {
    try {
      let query = supabase.from('generation_logs').select('*');

      if (filters?.conversationId) {
        query = query.eq('conversation_id', filters.conversationId);
      }

      if (filters?.runId) {
        query = query.eq('run_id', filters.runId);
      }

      if (filters?.templateId) {
        query = query.eq('template_id', filters.templateId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.modelUsed) {
        query = query.eq('model_used', filters.modelUsed);
      }

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.from)
          .lte('created_at', filters.dateRange.to);
      }

      query = query.order('created_at', { ascending: false }).limit(limit);

      const { data: logs, error } = await query;

      if (error) {
        console.error('Error listing generation logs:', error);
        throw new DatabaseError(`Failed to list generation logs: ${error.message}`, error);
      }

      return (logs || []).map(this.mapDbToLog);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error listing generation logs:', error);
      throw new DatabaseError('Unexpected error listing generation logs', error as Error);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Map database record to GenerationLog type
   */
  private mapDbToLog(dbRecord: any): GenerationLog {
    return {
      id: dbRecord.id,
      conversationId: dbRecord.conversation_id,
      runId: dbRecord.run_id,
      templateId: dbRecord.template_id,
      requestPayload: dbRecord.request_payload || {},
      responsePayload: dbRecord.response_payload,
      modelUsed: dbRecord.model_used,
      parameters: dbRecord.parameters || {},
      temperature: dbRecord.temperature,
      maxTokens: dbRecord.max_tokens,
      inputTokens: dbRecord.input_tokens,
      outputTokens: dbRecord.output_tokens,
      costUsd: dbRecord.cost_usd,
      durationMs: dbRecord.duration_ms,
      status: dbRecord.status,
      errorMessage: dbRecord.error_message,
      errorCode: dbRecord.error_code,
      retryAttempt: dbRecord.retry_attempt,
      createdAt: dbRecord.created_at,
      createdBy: dbRecord.created_by,
    };
  }
}

// Export singleton instance
export const generationLogService = new GenerationLogService();

