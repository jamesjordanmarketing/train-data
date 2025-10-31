/**
 * Export Metrics Collection
 * 
 * Tracks and logs export operation metrics for monitoring, alerting, and performance analysis.
 * Implements structured JSON logging for integration with log aggregation tools (Datadog, Sentry, CloudWatch).
 * 
 * Features:
 * - Export success rate tracking
 * - Duration metrics by format and conversation count range
 * - File size statistics
 * - Format distribution analysis
 * - User activity tracking
 * - Failure rate alerting
 * 
 * Usage:
 * - Call logExportMetric() after each export completion or failure
 * - Call aggregateMetrics() hourly for summary statistics
 * - Call checkFailureRate() for alert triggering
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Metrics data structure for a single export operation
 */
export interface ExportMetric {
  /** Unique export identifier */
  export_id: string;
  /** User who initiated the export */
  user_id: string;
  /** Export format */
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  /** Export status */
  status: 'completed' | 'failed' | 'processing' | 'queued';
  /** Number of conversations exported */
  conversation_count: number;
  /** Conversation count range for aggregation */
  count_range: 'small' | 'medium' | 'large' | 'xlarge'; // <100, 100-499, 500-999, 1000+
  /** Export duration in milliseconds */
  duration_ms: number;
  /** File size in bytes (null if failed) */
  file_size_bytes: number | null;
  /** Error type if failed */
  error_type?: string;
  /** Error message if failed */
  error_message?: string;
  /** Timestamp when export was initiated */
  timestamp: string;
}

/**
 * Aggregated metrics summary
 */
export interface AggregatedMetrics {
  /** Time period for aggregation */
  period: 'hourly' | 'daily';
  /** Start of period */
  period_start: string;
  /** End of period */
  period_end: string;
  /** Total exports in period */
  total_exports: number;
  /** Successful exports */
  successful_exports: number;
  /** Failed exports */
  failed_exports: number;
  /** Success rate (0-1) */
  success_rate: number;
  /** Average duration by format */
  avg_duration_by_format: Record<string, number>;
  /** Average file size by format */
  avg_file_size_by_format: Record<string, number>;
  /** Maximum file size by format */
  max_file_size_by_format: Record<string, number>;
  /** Format distribution (count per format) */
  format_distribution: Record<string, number>;
  /** Exports per user */
  exports_per_user: Record<string, number>;
  /** Error distribution */
  error_distribution: Record<string, number>;
}

/**
 * Export Metrics Service
 */
export class ExportMetricsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Log export metrics after completion or failure
   * 
   * Creates structured JSON log entry for monitoring tools.
   * 
   * @param metric - Export metric data
   */
  async logExportMetric(metric: Omit<ExportMetric, 'count_range' | 'timestamp'>): Promise<void> {
    try {
      // Calculate conversation count range
      const count_range = this.getCountRange(metric.conversation_count);
      
      // Add timestamp
      const timestamp = new Date().toISOString();
      
      // Create complete metric
      const completeMetric: ExportMetric = {
        ...metric,
        count_range,
        timestamp,
      };
      
      // Log structured JSON for monitoring tools
      console.log(JSON.stringify({
        type: 'export_metric',
        ...completeMetric,
      }));
      
      // Store in database for historical analysis (optional)
      // Uncomment if you want to persist metrics
      /*
      await this.supabase
        .from('export_metrics')
        .insert({
          export_id: completeMetric.export_id,
          user_id: completeMetric.user_id,
          format: completeMetric.format,
          status: completeMetric.status,
          conversation_count: completeMetric.conversation_count,
          count_range: completeMetric.count_range,
          duration_ms: completeMetric.duration_ms,
          file_size_bytes: completeMetric.file_size_bytes,
          error_type: completeMetric.error_type,
          error_message: completeMetric.error_message,
          timestamp: completeMetric.timestamp,
        });
      */
      
    } catch (error) {
      console.error('Error logging export metric:', error);
      // Don't throw - metrics logging failures shouldn't break exports
    }
  }

  /**
   * Get conversation count range for aggregation
   */
  private getCountRange(count: number): 'small' | 'medium' | 'large' | 'xlarge' {
    if (count < 100) return 'small';
    if (count < 500) return 'medium';
    if (count < 1000) return 'large';
    return 'xlarge';
  }

  /**
   * Aggregate export metrics for a time period
   * 
   * Calculates summary statistics from export logs.
   * Call this hourly or daily for monitoring dashboards.
   * 
   * @param startDate - Start of period
   * @param endDate - End of period
   * @param period - Period type ('hourly' or 'daily')
   * @returns Aggregated metrics
   */
  async aggregateMetrics(
    startDate: Date,
    endDate: Date,
    period: 'hourly' | 'daily' = 'hourly'
  ): Promise<AggregatedMetrics> {
    try {
      // Fetch export logs for period
      const { data: exports, error } = await this.supabase
        .from('export_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) throw error;

      // Initialize aggregated metrics
      const metrics: AggregatedMetrics = {
        period,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        total_exports: exports?.length || 0,
        successful_exports: 0,
        failed_exports: 0,
        success_rate: 0,
        avg_duration_by_format: {},
        avg_file_size_by_format: {},
        max_file_size_by_format: {},
        format_distribution: {},
        exports_per_user: {},
        error_distribution: {},
      };

      if (!exports || exports.length === 0) {
        // Log empty period
        console.log(JSON.stringify({
          type: 'aggregated_metrics',
          ...metrics,
        }));
        return metrics;
      }

      // Calculate metrics
      const durationByFormat: Record<string, number[]> = {};
      const fileSizeByFormat: Record<string, number[]> = {};

      exports.forEach((exp: any) => {
        // Success/failure counts
        if (exp.status === 'completed') {
          metrics.successful_exports++;
        } else if (exp.status === 'failed') {
          metrics.failed_exports++;
          
          // Error distribution
          const errorType = exp.error_message?.split(':')[0] || 'Unknown';
          metrics.error_distribution[errorType] = (metrics.error_distribution[errorType] || 0) + 1;
        }

        // Format distribution
        metrics.format_distribution[exp.format] = (metrics.format_distribution[exp.format] || 0) + 1;

        // User activity
        metrics.exports_per_user[exp.user_id] = (metrics.exports_per_user[exp.user_id] || 0) + 1;

        // Duration tracking
        if (exp.created_at && exp.updated_at) {
          const duration = new Date(exp.updated_at).getTime() - new Date(exp.created_at).getTime();
          if (!durationByFormat[exp.format]) {
            durationByFormat[exp.format] = [];
          }
          durationByFormat[exp.format].push(duration);
        }

        // File size tracking
        if (exp.file_size !== null && exp.file_size !== undefined) {
          if (!fileSizeByFormat[exp.format]) {
            fileSizeByFormat[exp.format] = [];
          }
          fileSizeByFormat[exp.format].push(exp.file_size);
        }
      });

      // Calculate success rate
      metrics.success_rate = metrics.total_exports > 0
        ? metrics.successful_exports / metrics.total_exports
        : 0;

      // Calculate average duration by format
      Object.entries(durationByFormat).forEach(([format, durations]) => {
        metrics.avg_duration_by_format[format] = durations.reduce((a, b) => a + b, 0) / durations.length;
      });

      // Calculate file size stats by format
      Object.entries(fileSizeByFormat).forEach(([format, sizes]) => {
        metrics.avg_file_size_by_format[format] = sizes.reduce((a, b) => a + b, 0) / sizes.length;
        metrics.max_file_size_by_format[format] = Math.max(...sizes);
      });

      // Log aggregated metrics
      console.log(JSON.stringify({
        type: 'aggregated_metrics',
        ...metrics,
      }));

      return metrics;
    } catch (error) {
      console.error('Error aggregating export metrics:', error);
      throw error;
    }
  }

  /**
   * Check failure rate and trigger alert if threshold exceeded
   * 
   * Analyzes recent export failures and logs alert if failure rate > 10%.
   * 
   * @param lookbackMinutes - Minutes to look back for failure analysis (default: 60)
   * @returns Alert details if threshold exceeded, null otherwise
   */
  async checkFailureRate(lookbackMinutes: number = 60): Promise<{
    alert: boolean;
    failure_rate: number;
    failed_count: number;
    total_count: number;
    threshold: number;
  } | null> {
    try {
      const threshold = 0.10; // 10% failure rate threshold
      const lookbackStart = new Date(Date.now() - lookbackMinutes * 60 * 1000);

      // Fetch recent exports
      const { data: exports, error } = await this.supabase
        .from('export_logs')
        .select('status')
        .gte('timestamp', lookbackStart.toISOString());

      if (error) throw error;

      if (!exports || exports.length === 0) {
        return null; // No exports in period
      }

      const totalCount = exports.length;
      const failedCount = exports.filter((exp: any) => exp.status === 'failed').length;
      const failureRate = failedCount / totalCount;

      const result = {
        alert: failureRate > threshold,
        failure_rate: failureRate,
        failed_count: failedCount,
        total_count: totalCount,
        threshold,
      };

      // Log alert if threshold exceeded
      if (result.alert) {
        console.error(JSON.stringify({
          type: 'export_failure_alert',
          severity: 'high',
          message: `Export failure rate (${(failureRate * 100).toFixed(2)}%) exceeds threshold (${(threshold * 100)}%)`,
          ...result,
          timestamp: new Date().toISOString(),
        }));
      }

      return result;
    } catch (error) {
      console.error('Error checking failure rate:', error);
      throw error;
    }
  }

  /**
   * Get export volume statistics
   * 
   * Returns export counts per hour/day for capacity planning.
   * 
   * @param period - 'hourly' or 'daily'
   * @param days - Number of days to analyze
   * @returns Array of time periods with export counts
   */
  async getExportVolume(
    period: 'hourly' | 'daily' = 'daily',
    days: number = 7
  ): Promise<Array<{ period: string; count: number }>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data: exports, error } = await this.supabase
        .from('export_logs')
        .select('timestamp')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (!exports || exports.length === 0) {
        return [];
      }

      // Group by period
      const volumeMap = new Map<string, number>();

      exports.forEach((exp: any) => {
        const date = new Date(exp.timestamp);
        let periodKey: string;

        if (period === 'hourly') {
          periodKey = date.toISOString().substring(0, 13); // YYYY-MM-DDTHH
        } else {
          periodKey = date.toISOString().substring(0, 10); // YYYY-MM-DD
        }

        volumeMap.set(periodKey, (volumeMap.get(periodKey) || 0) + 1);
      });

      // Convert to array and sort
      const volume = Array.from(volumeMap.entries())
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => a.period.localeCompare(b.period));

      // Log volume statistics
      console.log(JSON.stringify({
        type: 'export_volume',
        period,
        days,
        total_exports: exports.length,
        avg_per_period: exports.length / volume.length,
        peak_period: volume.reduce((max, curr) => curr.count > max.count ? curr : max),
        volume_data: volume,
        timestamp: new Date().toISOString(),
      }));

      return volume;
    } catch (error) {
      console.error('Error getting export volume:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create ExportMetricsService instance
 */
export const createExportMetricsService = (supabase: SupabaseClient) => {
  return new ExportMetricsService(supabase);
};

