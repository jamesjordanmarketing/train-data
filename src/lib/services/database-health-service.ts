/**
 * Database Health Monitoring Service
 * 
 * Service layer for querying database health metrics from PostgreSQL system catalogs
 * and pg_stat_* views. Provides comprehensive health reporting and recommendations.
 */

import { createClient } from '@supabase/supabase-js';
import {
  TableHealthMetrics,
  IndexHealthMetrics,
  QueryPerformanceMetrics,
  ConnectionPoolMetrics,
  DatabaseOverviewMetrics,
  DatabaseHealthAlert,
  DatabaseHealthReport,
  HealthRecommendation,
  HealthMonitoringConfig,
  DEFAULT_HEALTH_MONITORING_CONFIG,
  formatBytes,
  calculatePercentage,
  calculateCacheHitRatio,
  needsVacuum,
  needsAnalyze,
} from '../types/database-health';

class DatabaseHealthService {
  private config: HealthMonitoringConfig = DEFAULT_HEALTH_MONITORING_CONFIG;
  
  /**
   * Get Supabase client with lazy initialization
   * Avoids module-level initialization that breaks Next.js build
   */
  private getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  
  /**
   * Set custom monitoring configuration
   */
  setConfig(config: Partial<HealthMonitoringConfig>): void {
    this.config = { ...DEFAULT_HEALTH_MONITORING_CONFIG, ...config };
  }
  
  /**
   * Get comprehensive database health report
   */
  async getHealthReport(): Promise<DatabaseHealthReport> {
    const [overview, tables, indexes, slowQueries, connectionPool, alerts] = await Promise.all([
      this.getDatabaseOverview(),
      this.getTableHealthMetrics(),
      this.getIndexHealthMetrics(),
      this.getSlowQueries(),
      this.getConnectionPoolMetrics(),
      this.getActiveAlerts(),
    ]);
    
    const recommendations = this.generateRecommendations({
      overview,
      tables,
      indexes,
      slowQueries,
      connectionPool,
    });
    
    return {
      timestamp: new Date().toISOString(),
      overview,
      tables,
      indexes,
      slowQueries,
      connectionPool,
      alerts,
      recommendations,
    };
  }
  
  /**
   * Get database overview metrics from pg_stat_database
   */
  async getDatabaseOverview(): Promise<DatabaseOverviewMetrics> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_database_overview');
    
    if (error) {
      console.error('Failed to fetch database overview:', error);
      throw error;
    }
    
    // Transform raw data to typed metrics
    const raw = data[0];
    return {
      databaseName: raw.datname,
      databaseSizeBytes: raw.database_size,
      databaseSizeFormatted: formatBytes(raw.database_size),
      numBackends: raw.numbackends,
      transactionsCommitted: raw.xact_commit,
      transactionsRolledBack: raw.xact_rollback,
      commitRollbackRatio: calculatePercentage(
        raw.xact_commit,
        raw.xact_commit + raw.xact_rollback
      ),
      blocksRead: raw.blks_read,
      blocksHit: raw.blks_hit,
      cacheHitRatio: calculateCacheHitRatio(raw.blks_hit, raw.blks_read),
      tuplesReturned: raw.tup_returned,
      tuplesFetched: raw.tup_fetched,
      tuplesInserted: raw.tup_inserted,
      tuplesUpdated: raw.tup_updated,
      tuplesDeleted: raw.tup_deleted,
      conflicts: raw.conflicts,
      tempFiles: raw.temp_files,
      tempBytes: raw.temp_bytes,
      deadlocks: raw.deadlocks,
      checksumFailures: raw.checksum_failures || 0,
      lastStatsReset: raw.stats_reset,
    };
  }
  
  /**
   * Get table health metrics from pg_stat_user_tables
   */
  async getTableHealthMetrics(): Promise<TableHealthMetrics[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_table_health_metrics');
    
    if (error) {
      console.error('Failed to fetch table health metrics:', error);
      throw error;
    }
    
    return data.map((row: any) => {
      const deadTuplesRatio = calculatePercentage(row.n_dead_tup, row.n_live_tup);
      
      return {
        schemaName: row.schemaname,
        tableName: row.relname,
        rowCount: row.n_live_tup,
        deadTuples: row.n_dead_tup,
        deadTuplesRatio,
        tableSizeBytes: row.table_size,
        tableSizeFormatted: formatBytes(row.table_size),
        lastVacuum: row.last_vacuum,
        lastAutovacuum: row.last_autovacuum,
        lastAnalyze: row.last_analyze,
        lastAutoanalyze: row.last_autoanalyze,
        vacuumCount: row.vacuum_count,
        autovacuumCount: row.autovacuum_count,
        analyzeCount: row.analyze_count,
        autoanalyzeCount: row.autoanalyze_count,
        bloatPercentage: row.bloat_pct || 0,
        needsVacuum: needsVacuum(deadTuplesRatio),
        needsAnalyze: needsAnalyze(row.last_analyze, this.config.analyzeOverdueDays),
      };
    });
  }
  
  /**
   * Get index health metrics from pg_stat_user_indexes
   */
  async getIndexHealthMetrics(): Promise<IndexHealthMetrics[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_index_health_metrics');
    
    if (error) {
      console.error('Failed to fetch index health metrics:', error);
      throw error;
    }
    
    return data.map((row: any) => ({
      schemaName: row.schemaname,
      tableName: row.relname,
      indexName: row.indexrelname,
      indexSizeBytes: row.index_size,
      indexSizeFormatted: formatBytes(row.index_size),
      indexScans: row.idx_scan,
      indexTuplesRead: row.idx_tup_read,
      indexTuplesFetch: row.idx_tup_fetch,
      isUnused: row.idx_scan === 0 && row.days_since_last_use > this.config.unusedIndexDays,
      daysSinceLastUse: row.days_since_last_use,
      bloatPercentage: row.bloat_pct || 0,
      needsReindex: row.bloat_pct > this.config.highBloatThresholdPercent,
    }));
  }
  
  /**
   * Get slow query metrics from pg_stat_statements
   */
  async getSlowQueries(limit: number = 20): Promise<QueryPerformanceMetrics[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_slow_queries', { 
        hours_back: 24, 
        min_duration_ms: this.config.slowQueryThresholdMs 
      });
    
    if (error) {
      console.error('Failed to fetch slow queries:', error);
      throw error;
    }
    
    return data.slice(0, limit).map((row: any) => ({
      queryId: row.queryid,
      query: row.query,
      calls: row.calls,
      totalTimeMs: row.total_exec_time,
      meanTimeMs: row.mean_exec_time,
      minTimeMs: row.min_exec_time,
      maxTimeMs: row.max_exec_time,
      stddevTimeMs: row.stddev_exec_time,
      rows: row.rows,
      sharedBlocksHit: row.shared_blks_hit,
      sharedBlocksRead: row.shared_blks_read,
      cacheHitRatio: calculateCacheHitRatio(row.shared_blks_hit, row.shared_blks_read),
      isSlow: row.mean_exec_time > this.config.slowQueryThresholdMs,
    }));
  }
  
  /**
   * Get connection pool metrics from pg_stat_activity
   */
  async getConnectionPoolMetrics(): Promise<ConnectionPoolMetrics> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_connection_pool_metrics');
    
    if (error) {
      console.error('Failed to fetch connection pool metrics:', error);
      throw error;
    }
    
    const metrics = data[0];
    
    return {
      totalConnections: metrics.total,
      activeConnections: metrics.active,
      idleConnections: metrics.idle,
      idleInTransactionConnections: metrics.idle_in_transaction,
      waitingConnections: metrics.waiting,
      maxConnections: metrics.max_connections,
      utilizationPercentage: calculatePercentage(metrics.total, metrics.max_connections),
      connectionsByDatabase: metrics.by_database,
      connectionsByUser: metrics.by_user,
      longestRunningQuerySeconds: metrics.longest_query_seconds,
    };
  }
  
  /**
   * Get active health alerts
   */
  async getActiveAlerts(): Promise<DatabaseHealthAlert[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('performance_alerts')
      .select('*')
      .is('resolved_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch active alerts:', error);
      throw error;
    }
    
    return data.map((row: any) => ({
      id: row.id,
      alertType: row.alert_type,
      severity: row.severity,
      message: row.message,
      details: row.details,
      createdAt: row.created_at,
      acknowledgedAt: row.acknowledged_at,
      acknowledgedBy: row.acknowledged_by,
      resolvedAt: row.resolved_at,
    }));
  }
  
  /**
   * Generate health recommendations based on metrics
   */
  private generateRecommendations(metrics: {
    overview: DatabaseOverviewMetrics;
    tables: TableHealthMetrics[];
    indexes: IndexHealthMetrics[];
    slowQueries: QueryPerformanceMetrics[];
    connectionPool: ConnectionPoolMetrics;
  }): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];
    
    // Check cache hit ratio
    if (metrics.overview.cacheHitRatio < this.config.lowCacheHitRatioThreshold) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Low Cache Hit Ratio Detected',
        description: `Database cache hit ratio is ${metrics.overview.cacheHitRatio.toFixed(2)}%, below recommended ${this.config.lowCacheHitRatioThreshold}%`,
        action: 'Consider increasing shared_buffers in PostgreSQL configuration',
        impact: 'Improved query performance by reducing disk I/O',
        effort: 'medium',
      });
    }
    
    // Check tables needing vacuum
    const tablesNeedingVacuum = metrics.tables.filter(t => t.needsVacuum);
    if (tablesNeedingVacuum.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'maintenance',
        title: `${tablesNeedingVacuum.length} Tables Need VACUUM`,
        description: `Tables with high dead tuple ratio: ${tablesNeedingVacuum.map(t => t.tableName).join(', ')}`,
        action: 'Run VACUUM on affected tables',
        impact: 'Reduced table bloat and improved query performance',
        effort: 'low',
      });
    }
    
    // Check unused indexes
    const unusedIndexes = metrics.indexes.filter(i => i.isUnused);
    if (unusedIndexes.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'optimization',
        title: `${unusedIndexes.length} Unused Indexes Detected`,
        description: `Indexes not used in ${this.config.unusedIndexDays}+ days: ${unusedIndexes.map(i => i.indexName).join(', ')}`,
        action: 'Review and consider dropping unused indexes',
        impact: 'Reduced storage costs and faster write operations',
        effort: 'low',
      });
    }
    
    // Check slow queries
    if (metrics.slowQueries.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: `${metrics.slowQueries.length} Slow Queries Identified`,
        description: `Queries exceeding ${this.config.slowQueryThresholdMs}ms threshold`,
        action: 'Optimize slow queries with proper indexing and query rewriting',
        impact: 'Significant improvement in application responsiveness',
        effort: 'high',
      });
    }
    
    // Check connection pool utilization
    if (metrics.connectionPool.utilizationPercentage > this.config.highConnectionUsageThreshold) {
      recommendations.push({
        priority: 'high',
        category: 'capacity',
        title: 'High Connection Pool Utilization',
        description: `Connection pool at ${metrics.connectionPool.utilizationPercentage.toFixed(2)}% capacity`,
        action: 'Increase max_connections or implement connection pooling (e.g., PgBouncer)',
        impact: 'Prevent connection exhaustion and service disruptions',
        effort: 'medium',
      });
    }
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return recommendations;
  }
  
  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const supabase = this.getSupabaseClient();
    const { error } = await supabase
      .from('performance_alerts')
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId,
      })
      .eq('id', alertId);
    
    if (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  }
  
  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const supabase = this.getSupabaseClient();
    const { error } = await supabase
      .from('performance_alerts')
      .update({
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId);
    
    if (error) {
      console.error('Failed to resolve alert:', error);
      throw error;
    }
  }
}

export const databaseHealthService = new DatabaseHealthService();

