/**
 * Generation Log Service
 * 
 * Database service layer for tracking AI generation requests, responses,
 * and performance metrics. Provides comprehensive audit logging for
 * compliance and cost analysis.
 */

import { createServerSupabaseAdminClient } from '../supabase-server';

// Define types inline to avoid circular dependencies
interface GenerationLog {
  id: string;
  conversationId?: string;
  runId?: string;
  templateId?: string;
  requestPayload: Record<string, any>;
  responsePayload?: Record<string, any>;
  modelUsed?: string;
  parameters: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
  inputTokens: number;
  outputTokens: number;
  costUsd?: number;
  durationMs?: number;
  status: 'success' | 'failed' | 'rate_limited' | 'timeout';
  errorMessage?: string;
  errorCode?: string;
  retryAttempt: number;
  createdAt: string;
  createdBy?: string;
}

interface GenerationLogParams {
  conversationId?: string;
  runId?: string;
  templateId?: string;
  requestPayload: Record<string, any>;
  responsePayload?: Record<string, any>;
  modelUsed?: string;
  parameters?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  durationMs?: number;
  status: 'success' | 'failed' | 'rate_limited' | 'timeout';
  errorMessage?: string;
  errorCode?: string;
  retryAttempt?: number;
  createdBy: string;
}

interface CostSummary {
  totalCost: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgCostPerRequest: number;
  avgDurationMs: number;
  byModel: Record<string, {
    count: number;
    cost: number;
    inputTokens: number;
    outputTokens: number;
  }>;
  byStatus: Record<string, number>;
}

/**
 * Generation Log Service
 * 
 * Provides comprehensive logging and analytics for AI generation operations
 */
export const generationLogService = {
  /**
   * Log a generation request/response
   * 
   * @param params - Generation log parameters
   * 
   * @example
   * ```typescript
   * await generationLogService.logGeneration({
   *   conversationId: convId,
   *   runId: batchJobId,
   *   requestPayload: { prompt: '...', model: 'claude-sonnet-4' },
   *   responsePayload: { content: '...', usage: {...} },
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
  async logGeneration(params: GenerationLogParams): Promise<void> {
    try {
      // Get admin client for server-side operations
      const supabase = createServerSupabaseAdminClient();
      
      // Calculate cost if not provided
      let costUsd = params.costUsd;
      if (!costUsd && params.inputTokens !== undefined && params.outputTokens !== undefined) {
        costUsd = this.calculateCost(params.inputTokens, params.outputTokens, params.modelUsed);
      }

      const { error } = await supabase
        .from('generation_logs')
        .insert({
          conversation_id: params.conversationId,
          run_id: params.runId,
          template_id: params.templateId,
          request_payload: params.requestPayload,
          response_payload: params.responsePayload,
          model_used: params.modelUsed,
          parameters: params.parameters || {},
          temperature: params.temperature,
          max_tokens: params.maxTokens,
          input_tokens: params.inputTokens || 0,
          output_tokens: params.outputTokens || 0,
          cost_usd: costUsd,
          duration_ms: params.durationMs,
          status: params.status,
          error_message: params.errorMessage,
          error_code: params.errorCode,
          retry_attempt: params.retryAttempt || 0,
          created_by: params.createdBy,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging generation:', error);
      throw error;
    }
  },

  /**
   * Get generation logs for a conversation
   * 
   * @param conversationId - Conversation UUID
   * @returns Array of generation logs ordered by creation time
   * 
   * @example
   * ```typescript
   * const logs = await generationLogService.getLogsByConversation(conversationId);
   * console.log(`Conversation generated after ${logs.length} attempts`);
   * ```
   */
  async getLogsByConversation(conversationId: string): Promise<GenerationLog[]> {
    try {
      const supabase = createServerSupabaseAdminClient();
      
      const { data, error } = await supabase
        .from('generation_logs')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapDbToLog);
    } catch (error) {
      console.error('Error fetching logs by conversation:', error);
      throw error;
    }
  },

  /**
   * Get generation logs by date range
   * 
   * @param from - Start date (ISO string)
   * @param to - End date (ISO string)
   * @returns Array of generation logs within the date range
   * 
   * @example
   * ```typescript
   * const logs = await generationLogService.getLogsByDateRange(
   *   '2025-01-01T00:00:00Z',
   *   '2025-01-31T23:59:59Z'
   * );
   * ```
   */
  async getLogsByDateRange(from: string, to: string): Promise<GenerationLog[]> {
    try {
      const supabase = createServerSupabaseAdminClient();
      
      const { data, error } = await supabase
        .from('generation_logs')
        .select('*')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapDbToLog);
    } catch (error) {
      console.error('Error fetching logs by date range:', error);
      throw error;
    }
  },

  /**
   * Calculate total cost with optional filters
   * 
   * @param filters - Optional filters (date range, user ID)
   * @returns Total cost in USD
   * 
   * @example
   * ```typescript
   * const monthlyCost = await generationLogService.calculateTotalCost({
   *   dateRange: ['2025-01-01', '2025-01-31'],
   *   userId: userId
   * });
   * console.log(`Monthly cost: $${monthlyCost.toFixed(2)}`);
   * ```
   */
  async calculateTotalCost(filters?: { 
    dateRange?: [string, string]; 
    userId?: string 
  }): Promise<number> {
    try {
      const supabase = createServerSupabaseAdminClient();
      
      let query = supabase
        .from('generation_logs')
        .select('cost_usd');

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange[0])
          .lte('created_at', filters.dateRange[1]);
      }

      if (filters?.userId) {
        query = query.eq('created_by', filters.userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).reduce((sum, log) => sum + (log.cost_usd || 0), 0);
    } catch (error) {
      console.error('Error calculating total cost:', error);
      throw error;
    }
  },

  /**
   * Get cost summary for analysis and budgeting
   * 
   * @param from - Start date (ISO string)
   * @param to - End date (ISO string)
   * @returns Comprehensive cost summary
   * 
   * @example
   * ```typescript
   * const summary = await generationLogService.getCostSummary(
   *   '2025-01-01T00:00:00Z',
   *   '2025-01-31T23:59:59Z'
   * );
   * console.log(`Total cost: $${summary.totalCost.toFixed(2)}`);
   * console.log(`Success rate: ${(summary.successfulRequests / summary.totalRequests * 100).toFixed(1)}%`);
   * ```
   */
  async getCostSummary(from: string, to: string): Promise<CostSummary> {
    try {
      const logs = await this.getLogsByDateRange(from, to);

      const summary: CostSummary = {
        totalCost: 0,
        totalRequests: logs.length,
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

      if (logs.length === 0) return summary;

      let totalDuration = 0;
      let durationCount = 0;

      logs.forEach(log => {
        // Sum costs and tokens
        summary.totalCost += log.costUsd || 0;
        summary.totalInputTokens += log.inputTokens || 0;
        summary.totalOutputTokens += log.outputTokens || 0;

        // Count by status
        if (log.status === 'success') {
          summary.successfulRequests++;
        } else {
          summary.failedRequests++;
        }
        summary.byStatus[log.status]++;

        // Track duration
        if (log.durationMs) {
          totalDuration += log.durationMs;
          durationCount++;
        }

        // Track by model
        const model = log.modelUsed || 'unknown';
        if (!summary.byModel[model]) {
          summary.byModel[model] = {
            count: 0,
            cost: 0,
            inputTokens: 0,
            outputTokens: 0,
          };
        }
        summary.byModel[model].count++;
        summary.byModel[model].cost += log.costUsd || 0;
        summary.byModel[model].inputTokens += log.inputTokens || 0;
        summary.byModel[model].outputTokens += log.outputTokens || 0;
      });

      summary.avgCostPerRequest = summary.totalRequests > 0 
        ? summary.totalCost / summary.totalRequests 
        : 0;

      summary.avgDurationMs = durationCount > 0 
        ? totalDuration / durationCount 
        : 0;

      return summary;
    } catch (error) {
      console.error('Error generating cost summary:', error);
      throw error;
    }
  },

  /**
   * Get logs by run/batch ID
   * 
   * @param runId - Batch job/run UUID
   * @returns Array of generation logs for the run
   * 
   * @example
   * ```typescript
   * const logs = await generationLogService.getLogsByRunId(batchJobId);
   * const failedLogs = logs.filter(l => l.status !== 'success');
   * ```
   */
  async getLogsByRunId(runId: string): Promise<GenerationLog[]> {
    try {
      const supabase = createServerSupabaseAdminClient();
      
      const { data, error } = await supabase
        .from('generation_logs')
        .select('*')
        .eq('run_id', runId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapDbToLog);
    } catch (error) {
      console.error('Error fetching logs by run ID:', error);
      throw error;
    }
  },

  /**
   * Get logs by template ID
   * 
   * @param templateId - Template UUID
   * @returns Array of generation logs for the template
   * 
   * @example
   * ```typescript
   * const logs = await generationLogService.getLogsByTemplateId(templateId);
   * const avgCost = logs.reduce((sum, l) => sum + (l.costUsd || 0), 0) / logs.length;
   * ```
   */
  async getLogsByTemplateId(templateId: string): Promise<GenerationLog[]> {
    try {
      const supabase = createServerSupabaseAdminClient();
      
      const { data, error } = await supabase
        .from('generation_logs')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapDbToLog);
    } catch (error) {
      console.error('Error fetching logs by template ID:', error);
      throw error;
    }
  },

  /**
   * Delete old logs (for data retention policies)
   * 
   * @param olderThan - Delete logs older than this date
   * @returns Number of deleted logs
   * 
   * @example
   * ```typescript
   * const oneYearAgo = new Date();
   * oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
   * const deleted = await generationLogService.deleteOldLogs(oneYearAgo.toISOString());
   * console.log(`Deleted ${deleted} old logs`);
   * ```
   */
  async deleteOldLogs(olderThan: string): Promise<number> {
    try {
      const supabase = createServerSupabaseAdminClient();
      
      const { error, count } = await supabase
        .from('generation_logs')
        .delete({ count: 'exact' })
        .lt('created_at', olderThan);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error deleting old logs:', error);
      throw error;
    }
  },

  /**
   * Calculate cost based on token usage and model
   * 
   * @param inputTokens - Number of input tokens
   * @param outputTokens - Number of output tokens
   * @param model - Model identifier
   * @returns Estimated cost in USD
   */
  calculateCost(inputTokens: number, outputTokens: number, model?: string): number {
    // Pricing for Claude Sonnet 4 (as of 2025)
    const pricing = {
      'claude-sonnet-4': { inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
      'claude-sonnet-4-5-20250929': { inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
      'claude-3-5-sonnet-20241022': { inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
      'default': { inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
    };

    const modelKey = model && model in pricing ? model as keyof typeof pricing : 'default';
    const rates = pricing[modelKey];

    const inputCost = (inputTokens / 1000) * rates.inputCostPer1K;
    const outputCost = (outputTokens / 1000) * rates.outputCostPer1K;

    return inputCost + outputCost;
  },

  /**
   * Map database record to GenerationLog type
   * @private
   */
  mapDbToLog(dbRecord: any): GenerationLog {
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
  },
};

