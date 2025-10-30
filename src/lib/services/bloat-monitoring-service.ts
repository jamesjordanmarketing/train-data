import { supabase } from '@/lib/supabase';

interface BloatSnapshot {
  schemaname: string;
  tablename: string;
  actual_size_bytes: number;
  estimated_size_bytes: number;
  bloat_bytes: number;
  bloat_ratio: number;
  dead_tuples: number;
  live_tuples: number;
}

/**
 * Bloat Monitoring Service
 * 
 * Tracks table bloat (wasted space from deleted/updated rows) to maintain
 * optimal database performance. High bloat slows queries and wastes disk space.
 */
export class BloatMonitoringService {
  /**
   * Capture current table bloat snapshot
   * 
   * Takes a snapshot of all tables and calculates their bloat levels.
   * Should be called daily to track bloat growth over time.
   * 
   * @returns Number of table snapshots captured
   * 
   * @example
   * ```typescript
   * const count = await bloatMonitoringService.captureSnapshot();
   * console.log(`Captured bloat data for ${count} tables`);
   * ```
   */
  async captureSnapshot(): Promise<number> {
    const { data, error } = await supabase
      .rpc('capture_table_bloat_snapshot');

    if (error) {
      console.error('Failed to capture bloat snapshot:', error);
      return 0;
    }

    // Check for alerts
    await this.checkBloatAlerts();

    return data || 0;
  }

  /**
   * Get current bloat status for all tables
   * 
   * Returns the most recent bloat measurements for each table in the database.
   * 
   * @returns Array of bloat snapshots (one per table)
   * 
   * @example
   * ```typescript
   * const bloatStatus = await bloatMonitoringService.getBloatStatus();
   * bloatStatus.forEach(table => {
   *   console.log(`${table.tablename}: ${table.bloat_ratio.toFixed(1)}% bloat`);
   * });
   * ```
   */
  async getBloatStatus(): Promise<BloatSnapshot[]> {
    const { data, error } = await supabase
      .from('table_bloat_snapshots')
      .select('*')
      .order('snapshot_timestamp', { ascending: false })
      .limit(20); // One per table from latest snapshot

    if (error) {
      console.error('Failed to get bloat status:', error);
      return [];
    }

    // Filter to most recent snapshot per table
    const latestByTable = new Map<string, BloatSnapshot>();
    data?.forEach(snapshot => {
      if (!latestByTable.has(snapshot.tablename)) {
        latestByTable.set(snapshot.tablename, snapshot as BloatSnapshot);
      }
    });

    return Array.from(latestByTable.values());
  }

  /**
   * Get tables with high bloat
   * 
   * Identifies tables exceeding the specified bloat threshold.
   * These tables are candidates for VACUUM FULL or reindexing.
   * 
   * @param threshold - Bloat percentage threshold (default: 20%)
   * @returns Array of tables with bloat above threshold
   * 
   * @example
   * ```typescript
   * const highBloat = await bloatMonitoringService.getHighBloatTables(20);
   * if (highBloat.length > 0) {
   *   console.log('Tables needing maintenance:', highBloat.map(t => t.tablename));
   * }
   * ```
   */
  async getHighBloatTables(threshold: number = 20): Promise<BloatSnapshot[]> {
    const allBloat = await this.getBloatStatus();
    return allBloat.filter(b => b.bloat_ratio > threshold);
  }

  /**
   * Check bloat and create alerts
   * 
   * @private
   */
  private async checkBloatAlerts(): Promise<void> {
    const { error } = await supabase
      .rpc('check_table_bloat_alerts');

    if (error) {
      console.error('Failed to check bloat alerts:', error);
    }
  }
}

export const bloatMonitoringService = new BloatMonitoringService();

