import { supabase } from '@/lib/supabase';

interface QueryPerformanceLog {
  id: string;
  query_text: string;
  query_hash?: string;
  duration_ms: number;
  execution_timestamp: string;
  user_id?: string;
  endpoint?: string;
  parameters?: Record<string, any>;
  error_message?: string;
  stack_trace?: string;
  is_slow: boolean;
}

interface SlowQuery {
  query_text: string;
  avg_duration_ms: number;
  max_duration_ms: number;
  execution_count: number;
  last_execution: string;
}

/**
 * Query Performance Service
 * 
 * Logs and analyzes database query performance to maintain sub-100ms response times.
 * Automatically creates alerts for slow queries and tracks performance trends.
 */
export class QueryPerformanceService {
  /**
   * Log a query execution with performance metrics
   * 
   * @param params - Query execution details
   * 
   * @example
   * ```typescript
   * await queryPerformanceService.logQuery({
   *   query_text: 'conversations.list',
   *   duration_ms: 750,
   *   endpoint: '/api/conversations',
   *   user_id: userId,
   *   parameters: { status: 'pending_review' }
   * });
   * ```
   */
  async logQuery(params: {
    query_text: string;
    duration_ms: number;
    user_id?: string;
    endpoint?: string;
    parameters?: Record<string, any>;
    error_message?: string;
    stack_trace?: string;
  }): Promise<void> {
    try {
      // Generate query hash for grouping similar queries
      const query_hash = this.hashQuery(params.query_text);

      const { error } = await supabase
        .from('query_performance_logs')
        .insert({
          query_text: params.query_text,
          query_hash,
          duration_ms: params.duration_ms,
          user_id: params.user_id,
          endpoint: params.endpoint,
          parameters: params.parameters || {},
          error_message: params.error_message,
          stack_trace: params.stack_trace,
        });

      if (error) {
        console.error('Failed to log query performance:', error);
      }

      // If slow query, create alert
      if (params.duration_ms > 500) {
        await this.createSlowQueryAlert(params.query_text, params.duration_ms);
      }
    } catch (err) {
      // Don't let logging failures break the application
      console.error('Query performance logging error:', err);
    }
  }

  /**
   * Get slow queries from the last N hours
   * 
   * @param hours - Number of hours to look back (default: 24)
   * @param minDurationMs - Minimum duration to consider slow (default: 500ms)
   * @returns Array of slow queries with aggregated statistics
   * 
   * @example
   * ```typescript
   * const slowQueries = await queryPerformanceService.getSlowQueries(24, 500);
   * console.log(`Found ${slowQueries.length} slow queries`);
   * ```
   */
  async getSlowQueries(hours: number = 24, minDurationMs: number = 500): Promise<SlowQuery[]> {
    const { data, error } = await supabase
      .rpc('get_slow_queries', {
        hours_back: hours,
        min_duration_ms: minDurationMs,
      });

    if (error) {
      console.error('Failed to get slow queries:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get query performance statistics for a date range
   * 
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @returns Performance statistics including totals, averages, and percentiles
   * 
   * @example
   * ```typescript
   * const startDate = new Date();
   * startDate.setHours(startDate.getHours() - 24);
   * const stats = await queryPerformanceService.getQueryStats(startDate, new Date());
   * console.log(`P95 latency: ${stats.p95_duration_ms}ms`);
   * ```
   */
  async getQueryStats(startDate: Date, endDate: Date): Promise<{
    total_queries: number;
    slow_queries: number;
    avg_duration_ms: number;
    p95_duration_ms: number;
  }> {
    const { data, error } = await supabase
      .from('query_performance_logs')
      .select('duration_ms, is_slow')
      .gte('execution_timestamp', startDate.toISOString())
      .lte('execution_timestamp', endDate.toISOString());

    if (error || !data) {
      console.error('Failed to get query stats:', error);
      return { total_queries: 0, slow_queries: 0, avg_duration_ms: 0, p95_duration_ms: 0 };
    }

    const durations = data.map(d => d.duration_ms).sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);
    
    return {
      total_queries: data.length,
      slow_queries: data.filter(d => d.is_slow).length,
      avg_duration_ms: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      p95_duration_ms: durations[p95Index] || 0,
    };
  }

  /**
   * Create alert for slow query
   * 
   * @private
   */
  private async createSlowQueryAlert(queryText: string, durationMs: number): Promise<void> {
    const severity = durationMs > 2000 ? 'error' : durationMs > 1000 ? 'warning' : 'info';
    
    await supabase.rpc('create_performance_alert', {
      p_alert_type: 'slow_query',
      p_severity: severity,
      p_message: `Slow query detected: ${durationMs}ms`,
      p_details: {
        query: queryText.substring(0, 500), // Truncate long queries
        duration_ms: durationMs,
      },
    });
  }

  /**
   * Hash query text for grouping similar queries
   * 
   * @private
   */
  private hashQuery(queryText: string): string {
    // Normalize query by removing literal values
    const normalized = queryText
      .replace(/\d+/g, '?') // Replace numbers with ?
      .replace(/'[^']*'/g, '?') // Replace string literals with ?
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();
    
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

// Export singleton instance
export const queryPerformanceService = new QueryPerformanceService();

