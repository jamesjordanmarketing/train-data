/**
 * Database Health Monitoring Type Definitions
 * 
 * Comprehensive TypeScript types for database health metrics,
 * maintenance operations, and monitoring infrastructure.
 */

/**
 * Table-level health metrics from pg_stat_user_tables
 */
export interface TableHealthMetrics {
  schemaName: string;
  tableName: string;
  rowCount: number; // n_live_tup
  deadTuples: number; // n_dead_tup
  deadTuplesRatio: number; // calculated percentage
  tableSizeBytes: number; // pg_total_relation_size
  tableSizeFormatted: string; // human-readable (e.g., "2.5 GB")
  lastVacuum: string | null; // last_vacuum timestamp
  lastAutovacuum: string | null; // last_autovacuum timestamp
  lastAnalyze: string | null; // last_analyze timestamp
  lastAutoanalyze: string | null; // last_autoanalyze timestamp
  vacuumCount: number; // vacuum_count
  autovacuumCount: number; // autovacuum_count
  analyzeCount: number; // analyze_count
  autoanalyzeCount: number; // autoanalyze_count
  bloatPercentage: number; // estimated bloat percentage
  needsVacuum: boolean; // derived flag based on dead tuples ratio
  needsAnalyze: boolean; // derived flag based on last analyze time
}

/**
 * Index-level health metrics from pg_stat_user_indexes
 */
export interface IndexHealthMetrics {
  schemaName: string;
  tableName: string;
  indexName: string;
  indexSizeBytes: number; // pg_relation_size
  indexSizeFormatted: string;
  indexScans: number; // idx_scan
  indexTuplesRead: number; // idx_tup_read
  indexTuplesFetch: number; // idx_tup_fetch
  isUnused: boolean; // idx_scan = 0 for extended period
  daysSinceLastUse: number | null;
  bloatPercentage: number;
  needsReindex: boolean;
}

/**
 * Query performance metrics from pg_stat_statements
 */
export interface QueryPerformanceMetrics {
  queryId: string; // query id hash
  query: string; // sanitized query text
  calls: number; // number of times executed
  totalTimeMs: number; // total_exec_time
  meanTimeMs: number; // mean_exec_time
  minTimeMs: number; // min_exec_time
  maxTimeMs: number; // max_exec_time
  stddevTimeMs: number; // stddev_exec_time
  rows: number; // total rows returned
  sharedBlocksHit: number; // cache hits
  sharedBlocksRead: number; // disk reads
  cacheHitRatio: number; // calculated percentage
  isSlow: boolean; // mean_time > threshold (default 500ms)
}

/**
 * Connection pool metrics from pg_stat_activity
 */
export interface ConnectionPoolMetrics {
  totalConnections: number;
  activeConnections: number; // state = 'active'
  idleConnections: number; // state = 'idle'
  idleInTransactionConnections: number; // state = 'idle in transaction'
  waitingConnections: number; // waiting = true
  maxConnections: number; // from pg_settings
  utilizationPercentage: number; // (total / max) * 100
  connectionsByDatabase: Record<string, number>;
  connectionsByUser: Record<string, number>;
  longestRunningQuerySeconds: number | null;
}

/**
 * Database-wide overview metrics from pg_stat_database
 */
export interface DatabaseOverviewMetrics {
  databaseName: string;
  databaseSizeBytes: number;
  databaseSizeFormatted: string;
  numBackends: number; // active connections
  transactionsCommitted: number; // xact_commit
  transactionsRolledBack: number; // xact_rollback
  commitRollbackRatio: number; // calculated percentage
  blocksRead: number; // blks_read (disk reads)
  blocksHit: number; // blks_hit (cache hits)
  cacheHitRatio: number; // (blks_hit / (blks_hit + blks_read)) * 100
  tuplesReturned: number; // tup_returned
  tuplesFetched: number; // tup_fetched
  tuplesInserted: number; // tup_inserted
  tuplesUpdated: number; // tup_updated
  tuplesDeleted: number; // tup_deleted
  conflicts: number; // conflicts
  tempFiles: number; // temp_files
  tempBytes: number; // temp_bytes
  deadlocks: number; // deadlocks
  checksumFailures: number; // checksum_failures (if enabled)
  lastStatsReset: string | null; // stats_reset
}

/**
 * Maintenance operation record from maintenance_operations table
 */
export interface MaintenanceOperationRecord {
  id: string;
  operationType: 'VACUUM' | 'VACUUM FULL' | 'ANALYZE' | 'REINDEX';
  tableName: string | null;
  indexName: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  status: 'queued' | 'running' | 'completed' | 'failed';
  initiatedBy: string; // user_id
  errorMessage: string | null;
  options: Record<string, any>; // JSONB options
  createdAt: string;
}

/**
 * Database health alert definition
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 
  | 'high_bloat' 
  | 'slow_query' 
  | 'unused_index' 
  | 'low_cache_hit_ratio' 
  | 'high_connection_usage' 
  | 'vacuum_overdue' 
  | 'analyze_overdue';

export interface DatabaseHealthAlert {
  id: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  details: Record<string, any>; // JSONB with specific alert context
  createdAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  resolvedAt: string | null;
}

/**
 * Aggregate health report combining all metrics
 */
export interface DatabaseHealthReport {
  timestamp: string;
  overview: DatabaseOverviewMetrics;
  tables: TableHealthMetrics[];
  indexes: IndexHealthMetrics[];
  slowQueries: QueryPerformanceMetrics[];
  connectionPool: ConnectionPoolMetrics;
  alerts: DatabaseHealthAlert[];
  recommendations: HealthRecommendation[];
}

/**
 * Health recommendation generated from metrics analysis
 */
export interface HealthRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'maintenance' | 'capacity' | 'optimization';
  title: string;
  description: string;
  action: string; // suggested action to take
  impact: string; // expected impact if action taken
  effort: 'low' | 'medium' | 'high'; // estimated effort
}

/**
 * Configuration for health monitoring
 */
export interface HealthMonitoringConfig {
  slowQueryThresholdMs: number; // default 500ms
  highBloatThresholdPercent: number; // default 20%
  lowCacheHitRatioThreshold: number; // default 90%
  highConnectionUsageThreshold: number; // default 80%
  vacuumOverdueDays: number; // default 7 days
  analyzeOverdueDays: number; // default 7 days
  unusedIndexDays: number; // default 30 days
}

/**
 * Maintenance operation execution options
 */
export interface MaintenanceOperationOptions {
  operationType: 'VACUUM' | 'VACUUM FULL' | 'ANALYZE' | 'REINDEX';
  tableName?: string; // if null, operates on all tables
  indexName?: string; // for REINDEX operations
  concurrent?: boolean; // for REINDEX CONCURRENTLY
  verbose?: boolean;
  analyze?: boolean; // for VACUUM with ANALYZE
}

/**
 * Default health monitoring configuration
 */
export const DEFAULT_HEALTH_MONITORING_CONFIG: HealthMonitoringConfig = {
  slowQueryThresholdMs: 500,
  highBloatThresholdPercent: 20,
  lowCacheHitRatioThreshold: 90,
  highConnectionUsageThreshold: 80,
  vacuumOverdueDays: 7,
  analyzeOverdueDays: 7,
  unusedIndexDays: 30,
};

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Calculate percentage safely (handle division by zero)
 */
export function calculatePercentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
}

/**
 * Determine if table needs vacuum based on dead tuples ratio
 */
export function needsVacuum(deadTuplesRatio: number): boolean {
  return deadTuplesRatio > 10; // More than 10% dead tuples
}

/**
 * Determine if table needs analyze based on last analyze time
 */
export function needsAnalyze(lastAnalyze: string | null, thresholdDays: number): boolean {
  if (!lastAnalyze) return true;
  
  const lastAnalyzeDate = new Date(lastAnalyze);
  const daysSinceAnalyze = (Date.now() - lastAnalyzeDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceAnalyze > thresholdDays;
}

/**
 * Calculate cache hit ratio from blocks hit and blocks read
 */
export function calculateCacheHitRatio(blocksHit: number, blocksRead: number): number {
  const total = blocksHit + blocksRead;
  if (total === 0) return 100;
  return (blocksHit / total) * 100;
}

/**
 * Generate severity based on metric value and thresholds
 */
export function getAlertSeverity(
  value: number, 
  warningThreshold: number, 
  criticalThreshold: number
): AlertSeverity {
  if (value >= criticalThreshold) return 'critical';
  if (value >= warningThreshold) return 'warning';
  return 'info';
}

