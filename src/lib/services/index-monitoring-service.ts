import { supabase } from '@/lib/supabase';

interface IndexUsageSnapshot {
  schemaname: string;
  tablename: string;
  indexname: string;
  idx_scan: number;
  idx_tup_read: number;
  idx_tup_fetch: number;
  index_size_bytes: number;
  table_size_bytes: number;
}

interface UnusedIndex {
  schemaname: string;
  tablename: string;
  indexname: string;
  index_size: string;
  idx_scan: number;
  days_since_last_scan: number;
}

/**
 * Index Monitoring Service
 * 
 * Monitors database index usage to identify unused indexes that can be dropped
 * and detect missing indexes that could improve query performance.
 */
export class IndexMonitoringService {
  /**
   * Capture current index usage snapshot
   * 
   * Takes a snapshot of all database indexes and their usage statistics.
   * Should be called hourly for accurate trend analysis.
   * 
   * @returns Number of index snapshots captured
   * 
   * @example
   * ```typescript
   * const count = await indexMonitoringService.captureSnapshot();
   * console.log(`Captured ${count} index usage snapshots`);
   * ```
   */
  async captureSnapshot(): Promise<number> {
    const { data, error } = await supabase
      .rpc('capture_index_usage_snapshot');

    if (error) {
      console.error('Failed to capture index snapshot:', error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Detect unused indexes
   * 
   * Identifies indexes that haven't been used in the specified number of days.
   * Large unused indexes are candidates for removal to reduce storage and write overhead.
   * 
   * @param ageDays - Number of days without usage to consider an index unused (default: 30)
   * @returns Array of unused indexes with size and usage information
   * 
   * @example
   * ```typescript
   * const unusedIndexes = await indexMonitoringService.detectUnusedIndexes(30);
   * unusedIndexes.forEach(idx => {
   *   console.log(`${idx.indexname}: ${idx.index_size}, unused for ${idx.days_since_last_scan} days`);
   * });
   * ```
   */
  async detectUnusedIndexes(ageDays: number = 30): Promise<UnusedIndex[]> {
    const { data, error } = await supabase
      .rpc('detect_unused_indexes', { age_days: ageDays });

    if (error) {
      console.error('Failed to detect unused indexes:', error);
      return [];
    }

    // Create alerts for large unused indexes
    if (data && data.length > 0) {
      for (const index of data) {
        await this.createUnusedIndexAlert(index);
      }
    }

    return data || [];
  }

  /**
   * Get index usage trends over time
   * 
   * Analyzes how index usage has changed over the specified time period.
   * Useful for understanding seasonal patterns and validating index effectiveness.
   * 
   * @param tableName - Name of the table to analyze
   * @param days - Number of days to analyze (default: 7)
   * @returns Array of indexes with daily scan counts
   * 
   * @example
   * ```typescript
   * const trends = await indexMonitoringService.getIndexTrends('conversations', 7);
   * trends.forEach(trend => {
   *   console.log(`${trend.indexname}: ${trend.scans_per_day.join(', ')} scans/day`);
   * });
   * ```
   */
  async getIndexTrends(tableName: string, days: number = 7): Promise<{
    indexname: string;
    scans_per_day: number[];
  }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('index_usage_snapshots')
      .select('indexname, idx_scan, snapshot_timestamp')
      .eq('tablename', tableName)
      .gte('snapshot_timestamp', startDate.toISOString())
      .order('snapshot_timestamp', { ascending: true });

    if (error || !data) {
      console.error('Failed to get index trends:', error);
      return [];
    }

    // Group by index and calculate daily scan rates
    const indexMap = new Map<string, number[]>();
    
    data.forEach(row => {
      if (!indexMap.has(row.indexname)) {
        indexMap.set(row.indexname, []);
      }
      indexMap.get(row.indexname)!.push(row.idx_scan);
    });

    return Array.from(indexMap.entries()).map(([indexname, scans]) => ({
      indexname,
      scans_per_day: scans,
    }));
  }

  /**
   * Create alert for unused index
   * 
   * @private
   */
  private async createUnusedIndexAlert(index: UnusedIndex): Promise<void> {
    await supabase.rpc('create_performance_alert', {
      p_alert_type: 'unused_index',
      p_severity: 'warning',
      p_message: `Unused index detected: ${index.indexname} (${index.index_size})`,
      p_details: {
        table: index.tablename,
        index: index.indexname,
        size: index.index_size,
        days_unused: index.days_since_last_scan,
      },
    });
  }
}

export const indexMonitoringService = new IndexMonitoringService();

