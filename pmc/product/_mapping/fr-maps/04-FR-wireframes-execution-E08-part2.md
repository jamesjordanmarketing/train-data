# Train - Settings & Administration Module Implementation Execution Instructions (E08 - Part 2)
**Generated**: 2025-01-29  
**Segment**: E08 - Settings & Administration Module (Prompts 3-4)  
**Total Prompts**: 2 (3-4 of 8 total)  
**Estimated Implementation Time**: 20-24 hours

## Context

This document contains the detailed execution instructions for **Prompts 3-4** of the Settings & Administration Module (E08). These prompts focus on:

- **Prompt 3**: Database Health Monitoring Foundation (T-1.3.0)
- **Prompt 4**: Configuration Change Management (T-2.1.0)

**Prerequisites**: 
- Prompts 1-2 have been completed successfully
- Database migrations from E08 have been applied
- User preferences and AI configuration systems are operational

**Reference Documents**:
- Main E08 document: `04-FR-wireframes-execution-E08.md`
- Task Inventory: `04-train-FR-wireframes-E08-output.md`
- Functional Requirements: `03-train-functional-requirements.md`

---

## Implementation Prompts

### Prompt 3: Database Health Monitoring Foundation (T-1.3.0)
**Scope**: Complete database health metrics collection, maintenance operations, and monitoring infrastructure  
**Dependencies**: Database migrations applied, existing monitoring services reviewed  
**Estimated Time**: 10-12 hours  
**Risk Level**: Medium

========================


You are a senior full-stack developer implementing the Database Health Monitoring Foundation for the Train platform (Interactive LoRA Training Data Generation). This critical infrastructure component enables proactive monitoring, performance optimization, and database maintenance operations.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Train platform relies on PostgreSQL (Supabase) for all data storage, including conversations, chunks, dimensions, templates, and audit logs. As the dataset grows to thousands of conversations, database performance becomes critical. This monitoring system provides visibility into database health and enables proactive maintenance.

**Functional Requirements (FR8.2.2):**
- Database stats dashboard showing: table sizes, index health, query performance
- Manual vacuum and analyze operations must be triggerable
- Backup and restore functionality must be available
- Archive old conversations based on retention policy
- Audit log cleanup must be scheduled (configurable retention)
- Connection pool monitoring must display active/idle connections
- Slow query identification using pg_stat_statements extension
- Index usage statistics from pg_stat_user_indexes
- Table bloat calculation using pg_stat_user_tables
- Performance alert system for threshold violations
- Monthly health report generation

**Technical Architecture:**
- **Frontend**: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API routes, Supabase PostgreSQL
- **Database**: PostgreSQL 15+ with system catalog access
- **Monitoring**: pg_stat_* views, pg_stat_statements extension
- **Type Safety**: Strict TypeScript mode throughout

**CURRENT CODEBASE STATE:**

**Existing Implementation:**
1. **Basic Performance Monitoring** (`src/app/api/performance/route.ts`):
   - API endpoint exists for fetching performance metrics
   - Basic integration with monitoring services
   
2. **Cron Jobs** (`src/lib/cron/performance-monitoring.ts`, `src/app/api/cron/hourly-monitoring/route.ts`):
   - Hourly monitoring cron job implemented
   - Daily maintenance cron job implemented
   - CRON_SECRET authentication in place

3. **Performance Monitoring Setup** (`PERFORMANCE_MONITORING_SETUP.md`):
   - Documentation for monitoring system setup
   - Required database tables documented:
     * query_performance_logs
     * index_usage_snapshots
     * table_bloat_snapshots
     * performance_alerts
   - Required database functions documented:
     * capture_index_usage_snapshot()
     * detect_unused_indexes(age_days INT)
     * capture_table_bloat_snapshot()
     * get_slow_queries(hours_back INT, min_duration_ms INT)
     * create_performance_alert(p_alert_type TEXT, p_severity TEXT, p_message TEXT, p_details JSONB)
     * check_table_bloat_alerts()

4. **Database Service** (`src/lib/database.ts`):
   - Basic CRUD operations established
   - Supabase client integration
   - Query patterns for filtering and ordering

**Gaps to Fill:**
- Comprehensive TypeScript type definitions for all health metrics
- Service layer for database health queries (wrapper around pg_stat views)
- Service layer for maintenance operations (VACUUM, ANALYZE, REINDEX)
- API routes for health metrics retrieval
- API routes for maintenance operation triggers
- UI components for database health dashboard
- Safety checks before destructive operations
- Maintenance operation history tracking
- Health alert configuration and display
- Health report generation

**IMPLEMENTATION TASKS:**

**Task T-1.3.1: Database Health Metrics Type Definition**

Create comprehensive TypeScript type definitions in `src/lib/types/database-health.ts`:

1. **Define Health Metrics Interfaces:**
```typescript
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
```

2. **Add Utility Functions:**
```typescript
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
```

**Task T-1.3.2: Database Health Monitoring Service**

Create `src/lib/services/database-health-service.ts`:

```typescript
import { supabase } from '../supabase';
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
```

**Task T-1.3.3: Database Maintenance Service**

Create `src/lib/services/database-maintenance-service.ts`:

```typescript
import { supabase } from '../supabase';
import {
  MaintenanceOperationRecord,
  MaintenanceOperationOptions,
} from '../types/database-health';

class DatabaseMaintenanceService {
  /**
   * Execute VACUUM operation on specified table or all tables
   */
  async executeVacuum(options: MaintenanceOperationOptions, userId: string): Promise<MaintenanceOperationRecord> {
    // Validate options
    if (options.operationType !== 'VACUUM' && options.operationType !== 'VACUUM FULL') {
      throw new Error('Invalid operation type for VACUUM');
    }
    
    // Perform safety checks
    await this.performSafetyChecks(options);
    
    // Create maintenance operation record
    const { data: operation, error: createError } = await supabase
      .from('maintenance_operations')
      .insert({
        operation_type: options.operationType,
        table_name: options.tableName || null,
        started_at: new Date().toISOString(),
        status: 'running',
        initiated_by: userId,
        options: {
          verbose: options.verbose || false,
          analyze: options.analyze || false,
        },
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Failed to create maintenance operation record:', createError);
      throw createError;
    }
    
    try {
      // Execute VACUUM via RPC function
      const { error: vacuumError } = await supabase.rpc('execute_vacuum', {
        p_table_name: options.tableName || null,
        p_full: options.operationType === 'VACUUM FULL',
        p_analyze: options.analyze || false,
        p_verbose: options.verbose || false,
      });
      
      if (vacuumError) throw vacuumError;
      
      // Update operation record as completed
      const completedAt = new Date().toISOString();
      const startedAt = new Date(operation.started_at);
      const durationMs = new Date(completedAt).getTime() - startedAt.getTime();
      
      const { data: updatedOperation, error: updateError } = await supabase
        .from('maintenance_operations')
        .update({
          completed_at: completedAt,
          duration_ms: durationMs,
          status: 'completed',
        })
        .eq('id', operation.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      return this.transformOperationRecord(updatedOperation);
    } catch (error) {
      // Update operation record as failed
      await supabase
        .from('maintenance_operations')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq('id', operation.id);
      
      throw error;
    }
  }
  
  /**
   * Execute ANALYZE operation on specified table or all tables
   */
  async executeAnalyze(options: MaintenanceOperationOptions, userId: string): Promise<MaintenanceOperationRecord> {
    if (options.operationType !== 'ANALYZE') {
      throw new Error('Invalid operation type for ANALYZE');
    }
    
    await this.performSafetyChecks(options);
    
    const { data: operation, error: createError } = await supabase
      .from('maintenance_operations')
      .insert({
        operation_type: 'ANALYZE',
        table_name: options.tableName || null,
        started_at: new Date().toISOString(),
        status: 'running',
        initiated_by: userId,
        options: {
          verbose: options.verbose || false,
        },
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    try {
      const { error: analyzeError } = await supabase.rpc('execute_analyze', {
        p_table_name: options.tableName || null,
        p_verbose: options.verbose || false,
      });
      
      if (analyzeError) throw analyzeError;
      
      const completedAt = new Date().toISOString();
      const startedAt = new Date(operation.started_at);
      const durationMs = new Date(completedAt).getTime() - startedAt.getTime();
      
      const { data: updatedOperation, error: updateError } = await supabase
        .from('maintenance_operations')
        .update({
          completed_at: completedAt,
          duration_ms: durationMs,
          status: 'completed',
        })
        .eq('id', operation.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      return this.transformOperationRecord(updatedOperation);
    } catch (error) {
      await supabase
        .from('maintenance_operations')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq('id', operation.id);
      
      throw error;
    }
  }
  
  /**
   * Execute REINDEX operation on specified index or table
   */
  async executeReindex(options: MaintenanceOperationOptions, userId: string): Promise<MaintenanceOperationRecord> {
    if (options.operationType !== 'REINDEX') {
      throw new Error('Invalid operation type for REINDEX');
    }
    
    if (!options.tableName && !options.indexName) {
      throw new Error('Either tableName or indexName must be specified for REINDEX');
    }
    
    await this.performSafetyChecks(options);
    
    const { data: operation, error: createError } = await supabase
      .from('maintenance_operations')
      .insert({
        operation_type: 'REINDEX',
        table_name: options.tableName || null,
        index_name: options.indexName || null,
        started_at: new Date().toISOString(),
        status: 'running',
        initiated_by: userId,
        options: {
          concurrent: options.concurrent || false,
        },
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    try {
      const { error: reindexError } = await supabase.rpc('execute_reindex', {
        p_table_name: options.tableName || null,
        p_index_name: options.indexName || null,
        p_concurrent: options.concurrent || false,
      });
      
      if (reindexError) throw reindexError;
      
      const completedAt = new Date().toISOString();
      const startedAt = new Date(operation.started_at);
      const durationMs = new Date(completedAt).getTime() - startedAt.getTime();
      
      const { data: updatedOperation, error: updateError } = await supabase
        .from('maintenance_operations')
        .update({
          completed_at: completedAt,
          duration_ms: durationMs,
          status: 'completed',
        })
        .eq('id', operation.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      return this.transformOperationRecord(updatedOperation);
    } catch (error) {
      await supabase
        .from('maintenance_operations')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq('id', operation.id);
      
      throw error;
    }
  }
  
  /**
   * Get maintenance operation history
   */
  async getOperationHistory(limit: number = 50): Promise<MaintenanceOperationRecord[]> {
    const { data, error } = await supabase
      .from('maintenance_operations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Failed to fetch operation history:', error);
      throw error;
    }
    
    return data.map(this.transformOperationRecord);
  }
  
  /**
   * Get running operations
   */
  async getRunningOperations(): Promise<MaintenanceOperationRecord[]> {
    const { data, error } = await supabase
      .from('maintenance_operations')
      .select('*')
      .eq('status', 'running')
      .order('started_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch running operations:', error);
      throw error;
    }
    
    return data.map(this.transformOperationRecord);
  }
  
  /**
   * Perform safety checks before executing maintenance operation
   */
  private async performSafetyChecks(options: MaintenanceOperationOptions): Promise<void> {
    // Check 1: Don't run VACUUM FULL during peak hours (example)
    if (options.operationType === 'VACUUM FULL') {
      const hour = new Date().getHours();
      if (hour >= 9 && hour <= 17) {
        throw new Error('VACUUM FULL cannot be run during peak hours (9 AM - 5 PM)');
      }
    }
    
    // Check 2: Verify table exists if tableName specified
    if (options.tableName) {
      const { data, error } = await supabase
        .rpc('table_exists', { p_table_name: options.tableName });
      
      if (error || !data) {
        throw new Error(`Table '${options.tableName}' does not exist`);
      }
    }
    
    // Check 3: Verify index exists if indexName specified
    if (options.indexName) {
      const { data, error } = await supabase
        .rpc('index_exists', { p_index_name: options.indexName });
      
      if (error || !data) {
        throw new Error(`Index '${options.indexName}' does not exist`);
      }
    }
    
    // Check 4: Don't run if another operation is running on same table
    if (options.tableName) {
      const runningOps = await this.getRunningOperations();
      const conflictingOp = runningOps.find(op => op.tableName === options.tableName);
      
      if (conflictingOp) {
        throw new Error(`Another ${conflictingOp.operationType} operation is already running on '${options.tableName}'`);
      }
    }
  }
  
  /**
   * Transform database record to MaintenanceOperationRecord type
   */
  private transformOperationRecord(row: any): MaintenanceOperationRecord {
    return {
      id: row.id,
      operationType: row.operation_type,
      tableName: row.table_name,
      indexName: row.index_name,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      durationMs: row.duration_ms,
      status: row.status,
      initiatedBy: row.initiated_by,
      errorMessage: row.error_message,
      options: row.options || {},
      createdAt: row.created_at,
    };
  }
}

export const databaseMaintenanceService = new DatabaseMaintenanceService();
```

**Task T-1.3.4: API Routes for Database Health**

Create `src/app/api/database/health/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { databaseHealthService } from '@/lib/services/database-health-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameter for report type
    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('type') || 'full';
    
    if (reportType === 'overview') {
      const overview = await databaseHealthService.getDatabaseOverview();
      return NextResponse.json({ overview });
    }
    
    if (reportType === 'tables') {
      const tables = await databaseHealthService.getTableHealthMetrics();
      return NextResponse.json({ tables });
    }
    
    if (reportType === 'indexes') {
      const indexes = await databaseHealthService.getIndexHealthMetrics();
      return NextResponse.json({ indexes });
    }
    
    if (reportType === 'queries') {
      const limit = parseInt(searchParams.get('limit') || '20');
      const slowQueries = await databaseHealthService.getSlowQueries(limit);
      return NextResponse.json({ slowQueries });
    }
    
    if (reportType === 'connections') {
      const connectionPool = await databaseHealthService.getConnectionPoolMetrics();
      return NextResponse.json({ connectionPool });
    }
    
    // Default: full health report
    const report = await databaseHealthService.getHealthReport();
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error fetching database health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database health metrics' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/database/maintenance/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { databaseMaintenanceService } from '@/lib/services/database-maintenance-service';
import { MaintenanceOperationOptions } from '@/lib/types/database-health';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const options: MaintenanceOperationOptions = await request.json();
    
    // Validate operation type
    if (!['VACUUM', 'VACUUM FULL', 'ANALYZE', 'REINDEX'].includes(options.operationType)) {
      return NextResponse.json(
        { error: 'Invalid operation type' },
        { status: 400 }
      );
    }
    
    // Execute appropriate operation
    let result;
    if (options.operationType === 'VACUUM' || options.operationType === 'VACUUM FULL') {
      result = await databaseMaintenanceService.executeVacuum(options, user.id);
    } else if (options.operationType === 'ANALYZE') {
      result = await databaseMaintenanceService.executeAnalyze(options, user.id);
    } else if (options.operationType === 'REINDEX') {
      result = await databaseMaintenanceService.executeReindex(options, user.id);
    }
    
    return NextResponse.json({ operation: result });
  } catch (error) {
    console.error('Error executing maintenance operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute maintenance operation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'history';
    
    if (type === 'running') {
      const operations = await databaseMaintenanceService.getRunningOperations();
      return NextResponse.json({ operations });
    }
    
    // Default: operation history
    const limit = parseInt(searchParams.get('limit') || '50');
    const history = await databaseMaintenanceService.getOperationHistory(limit);
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching maintenance operations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance operations' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/database/alerts/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { databaseHealthService } from '@/lib/services/database-health-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const alerts = await databaseHealthService.getActiveAlerts();
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching database alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { alertId, action } = await request.json();
    
    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'alertId and action are required' },
        { status: 400 }
      );
    }
    
    if (action === 'acknowledge') {
      await databaseHealthService.acknowledgeAlert(alertId, user.id);
    } else if (action === 'resolve') {
      await databaseHealthService.resolveAlert(alertId);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "acknowledge" or "resolve"' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
```

**ACCEPTANCE CRITERIA:**

1. **Type Definitions:**
   - [ ] All health metrics interfaces defined with complete fields
   - [ ] Utility functions for formatting and calculations implemented
   - [ ] Type safety maintained with strict TypeScript mode
   - [ ] JSDoc documentation complete for all types
   - [ ] Default configuration constant defined

2. **Database Health Service:**
   - [ ] getHealthReport() returns comprehensive report with all metrics
   - [ ] getDatabaseOverview() queries pg_stat_database correctly
   - [ ] getTableHealthMetrics() queries pg_stat_user_tables with bloat calculation
   - [ ] getIndexHealthMetrics() queries pg_stat_user_indexes with usage stats
   - [ ] getSlowQueries() uses pg_stat_statements with threshold filtering
   - [ ] getConnectionPoolMetrics() queries pg_stat_activity correctly
   - [ ] generateRecommendations() produces actionable recommendations
   - [ ] Alert acknowledgment and resolution functions work correctly

3. **Database Maintenance Service:**
   - [ ] executeVacuum() runs VACUUM operations with options
   - [ ] executeAnalyze() runs ANALYZE operations
   - [ ] executeReindex() runs REINDEX operations with CONCURRENT option
   - [ ] performSafetyChecks() validates before execution
   - [ ] Operation history tracking works correctly
   - [ ] Running operations are identified and prevent conflicts
   - [ ] Error handling updates operation status correctly

4. **API Routes:**
   - [ ] GET /api/database/health returns full or partial reports
   - [ ] Query parameters (type, limit) work correctly
   - [ ] POST /api/database/maintenance executes operations
   - [ ] GET /api/database/maintenance returns history or running operations
   - [ ] GET /api/database/alerts returns active alerts
   - [ ] PATCH /api/database/alerts acknowledges/resolves alerts
   - [ ] All routes require authentication
   - [ ] Error responses include helpful messages

5. **Database Functions (Prerequisites):**
   - [ ] get_database_overview() RPC function exists
   - [ ] get_table_health_metrics() RPC function exists
   - [ ] get_index_health_metrics() RPC function exists
   - [ ] get_slow_queries() RPC function exists
   - [ ] get_connection_pool_metrics() RPC function exists
   - [ ] execute_vacuum() RPC function exists
   - [ ] execute_analyze() RPC function exists
   - [ ] execute_reindex() RPC function exists
   - [ ] table_exists() and index_exists() helper functions exist

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/types/database-health.ts (NEW)
src/lib/services/database-health-service.ts (NEW)
src/lib/services/database-maintenance-service.ts (NEW)
src/app/api/database/health/route.ts (NEW)
src/app/api/database/maintenance/route.ts (NEW)
src/app/api/database/alerts/route.ts (NEW)
```

**Database Functions Required:**
All RPC functions must be created in Supabase SQL Editor before this implementation can work. Reference the PERFORMANCE_MONITORING_SETUP.md document for complete function definitions.

**Error Handling:**
- Service layer errors log to console and throw
- API routes catch errors and return 500 with message
- Maintenance operations update status to 'failed' on error
- Safety checks throw errors before execution starts

**Performance:**
- Health report generation < 3 seconds
- Individual metric queries < 500ms
- Maintenance operations logged with duration
- Connection pool queries < 100ms

**VALIDATION REQUIREMENTS:**

1. **Manual Testing:**
   - Call GET /api/database/health → verify returns full report
   - Call GET /api/database/health?type=tables → verify returns tables only
   - Call POST /api/database/maintenance with VACUUM → verify executes
   - Check maintenance_operations table → verify operation logged
   - Call GET /api/database/alerts → verify alerts returned
   - Generate test alert → verify appears in API response

2. **Service Testing:**
   - Test getHealthReport() with actual database
   - Verify all metrics calculations are correct
   - Test maintenance operations on test table
   - Verify safety checks prevent invalid operations
   - Test recommendation generation with various scenarios

3. **Integration Testing:**
   - Verify RPC functions are callable from services
   - Test full health report generation end-to-end
   - Verify maintenance operations complete successfully
   - Test alert workflow (create, acknowledge, resolve)

**DELIVERABLES:**

1. [ ] `src/lib/types/database-health.ts` - Complete type definitions
2. [ ] `src/lib/services/database-health-service.ts` - Health monitoring service
3. [ ] `src/lib/services/database-maintenance-service.ts` - Maintenance service
4. [ ] `src/app/api/database/health/route.ts` - Health API routes
5. [ ] `src/app/api/database/maintenance/route.ts` - Maintenance API routes
6. [ ] `src/app/api/database/alerts/route.ts` - Alerts API routes
7. [ ] Manual testing completed with all validation scenarios passing
8. [ ] API testing completed with Postman/Insomnia
9. [ ] Integration testing with actual database

Implement this database health monitoring foundation completely, ensuring all metrics are accurate, maintenance operations are safe, and the system provides actionable insights for database optimization.


++++++++++++++++++


### Prompt 4: Configuration Change Management (T-2.1.0)
**Scope**: Unified audit trail, rollback capabilities, change tracking  
**Dependencies**: T-1.1.0 (User Preferences), T-1.2.0 (AI Configuration)  
**Estimated Time**: 8-10 hours  
**Risk Level**: Medium

========================


You are a senior full-stack developer implementing the Configuration Change Management system for the Train platform. This critical system tracks all configuration changes, provides complete audit trails, enables rollback capabilities, and ensures configuration integrity.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Train platform has two primary configuration systems: User Preferences (theme, filters, notifications, etc.) and AI Configuration (model parameters, rate limiting, retry strategies, etc.). Changes to these configurations must be tracked for compliance, debugging, and recovery. Users need the ability to review change history and rollback to previous states.

**Functional Requirements (FR8.1.1, FR8.2.1):**
- All configuration changes logged to audit trail with user attribution
- Change history accessible per configuration with timestamp and values
- Rollback functionality to restore previous configuration state
- Change validation ensures configuration remains consistent
- Comparison functionality showing diff between configurations
- Change approval workflow for critical settings (optional)
- Export change history as CSV for compliance reporting
- Real-time change notifications to affected users
- Rate limiting on configuration changes to prevent abuse
- Change impact analysis before applying

**Technical Architecture:**
- **Frontend**: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API routes, Supabase PostgreSQL
- **Database**: PostgreSQL with JSONB, RLS policies, audit triggers
- **Audit Storage**: Immutable append-only audit log tables
- **Type Safety**: Strict TypeScript mode throughout

**CURRENT CODEBASE STATE:**

**Existing Implementation:**
1. **User Preferences Audit Trail** (`supabase/migrations/20251101_create_user_preferences.sql:164-193`):
   - configuration_audit_log table exists
   - Tracks user_id, changed_field, old_value, new_value, changed_at, changed_by
   - RLS policies for viewing own audit logs
   - Basic structure in place but NOT comprehensive

2. **AI Configuration Audit Trail** (`src/lib/services/ai-config-migration.sql:89-132`):
   - ai_configuration_audit table exists
   - Tracks config_id, action, old_value, new_value, changed_by
   - Trigger function audit_ai_config_changes() exists
   - Captures INSERT, UPDATE, DELETE operations

3. **Configuration Audit Log Table** (`04-FR-wireframes-execution-E08.md:545-616`):
   - Unified configuration_audit_log table schema defined
   - Fields: config_type, config_id, changed_by, changed_at, old_values, new_values, change_reason, client_ip, user_agent
   - Immutability enforced via RLS policies
   - Trigger functions defined for automatic logging

4. **User Preferences Service** (from Prompt 1):
   - updatePreferences() function exists
   - Validation functions exist
   - Database integration complete

5. **AI Configuration Service** (from Prompt 2):
   - updateConfiguration() function exists
   - Validation functions exist
   - Database integration complete

**Gaps to Fill:**
- Service layer for configuration rollback operations
- Change history query with pagination and filtering
- Diff generation for configuration comparisons
- Rollback preview functionality
- Rollback validation logic
- Bulk rollback capabilities
- API routes for change history retrieval
- API routes for rollback operations
- UI components for change history display
- UI components for rollback confirmation

**IMPLEMENTATION TASKS:**

**Task T-2.1.1: Configuration Audit Trail Schema Validation**

Verify the existing audit trail schema is comprehensive. Update if needed.

The unified schema from E08 document should include:

```sql
-- Ensure this table exists and matches specification
CREATE TABLE IF NOT EXISTS public.configuration_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_type VARCHAR(50) NOT NULL, -- 'user_preference', 'ai_config'
    config_id UUID NOT NULL, -- References either user_preferences.id or ai_configurations.id
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    old_values JSONB,
    new_values JSONB,
    change_reason TEXT,
    client_ip INET,
    user_agent TEXT,
    CONSTRAINT config_audit_log_type_check CHECK (config_type IN ('user_preference', 'ai_config'))
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_config_audit_config_type ON public.configuration_audit_log(config_type);
CREATE INDEX IF NOT EXISTS idx_config_audit_config_id ON public.configuration_audit_log(config_id);
CREATE INDEX IF NOT EXISTS idx_config_audit_changed_by ON public.configuration_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_config_audit_changed_at ON public.configuration_audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_audit_old_values ON public.configuration_audit_log USING GIN (old_values);
CREATE INDEX IF NOT EXISTS idx_config_audit_new_values ON public.configuration_audit_log USING GIN (new_values);

-- RLS policies (read-only, append-only)
ALTER TABLE public.configuration_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own configuration audit logs"
    ON public.configuration_audit_log
    FOR SELECT
    USING (changed_by = auth.uid());

-- Prevent updates and deletes (append-only)
CREATE POLICY "No updates to audit log"
    ON public.configuration_audit_log
    FOR UPDATE
    USING (false);

CREATE POLICY "No deletes from audit log"
    ON public.configuration_audit_log
    FOR DELETE
    USING (false);

-- Trigger function for user_preferences audit
CREATE OR REPLACE FUNCTION public.log_user_preferences_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.configuration_audit_log (
            config_type,
            config_id,
            changed_by,
            old_values,
            new_values
        ) VALUES (
            'user_preference',
            NEW.id,
            auth.uid(),
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to user_preferences
DROP TRIGGER IF EXISTS user_preferences_audit_trigger ON public.user_preferences;
CREATE TRIGGER user_preferences_audit_trigger
    AFTER UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.log_user_preferences_changes();
```

**Task T-2.1.2: Configuration Change Management Types**

Create `src/lib/types/config-change-management.ts`:

```typescript
import { UserPreferences } from './user-preferences';
import { AIConfiguration } from './ai-config';

/**
 * Configuration type discriminator
 */
export type ConfigType = 'user_preference' | 'ai_config';

/**
 * Configuration audit log entry
 */
export interface ConfigurationAuditLogEntry {
  id: string;
  configType: ConfigType;
  configId: string;
  changedBy: string;
  changedAt: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  changeReason?: string;
  clientIp?: string;
  userAgent?: string;
}

/**
 * Configuration change history with pagination
 */
export interface ConfigurationChangeHistory {
  entries: ConfigurationAuditLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Configuration diff showing changes
 */
export interface ConfigurationDiff {
  added: Array<{ path: string; value: any }>;
  modified: Array<{ path: string; oldValue: any; newValue: any }>;
  removed: Array<{ path: string; value: any }>;
}

/**
 * Rollback preview showing what will change
 */
export interface RollbackPreview {
  targetVersion: ConfigurationAuditLogEntry;
  currentValues: Record<string, any>;
  targetValues: Record<string, any>;
  diff: ConfigurationDiff;
  warnings: string[]; // Potential issues with rollback
}

/**
 * Rollback validation result
 */
export interface RollbackValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Rollback options
 */
export interface RollbackOptions {
  configType: ConfigType;
  configId: string;
  targetAuditLogId: string;
  reason?: string;
  confirmWarnings?: boolean; // User confirmed warnings
}

/**
 * Bulk rollback options
 */
export interface BulkRollbackOptions {
  rollbacks: RollbackOptions[];
  reason?: string;
}

/**
 * Change history query filters
 */
export interface ChangeHistoryFilters {
  configType?: ConfigType;
  configId?: string;
  changedBy?: string;
  startDate?: string;
  endDate?: string;
  searchText?: string; // Search in change_reason
}

/**
 * Change statistics
 */
export interface ChangeStatistics {
  totalChanges: number;
  changesByType: Record<ConfigType, number>;
  changesByUser: Record<string, number>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
  mostChangedConfigs: Array<{
    configType: ConfigType;
    configId: string;
    changeCount: number;
  }>;
}
```

**Task T-2.1.3: Configuration Rollback Service**

Create `src/lib/services/config-rollback-service.ts`:

```typescript
import { supabase } from '../supabase';
import {
  ConfigurationAuditLogEntry,
  ConfigurationChangeHistory,
  ConfigurationDiff,
  RollbackPreview,
  RollbackValidationResult,
  RollbackOptions,
  BulkRollbackOptions,
  ChangeHistoryFilters,
  ChangeStatistics,
} from '../types/config-change-management';
import { validateUserPreferences } from '../types/user-preferences';
import { validateAIConfiguration } from '../types/ai-config';

class ConfigRollbackService {
  /**
   * Get change history for a specific configuration
   */
  async getChangeHistory(
    configType: 'user_preference' | 'ai_config',
    configId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ConfigurationChangeHistory> {
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('configuration_audit_log')
      .select('*', { count: 'exact', head: true })
      .eq('config_type', configType)
      .eq('config_id', configId);
    
    if (countError) {
      console.error('Failed to count audit log entries:', countError);
      throw countError;
    }
    
    // Get entries for current page
    const { data, error } = await supabase
      .from('configuration_audit_log')
      .select('*')
      .eq('config_type', configType)
      .eq('config_id', configId)
      .order('changed_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (error) {
      console.error('Failed to fetch change history:', error);
      throw error;
    }
    
    const totalCount = count || 0;
    const hasMore = offset + pageSize < totalCount;
    
    return {
      entries: data.map(this.transformAuditLogEntry),
      totalCount,
      page,
      pageSize,
      hasMore,
    };
  }
  
  /**
   * Get change history with filters
   */
  async getFilteredChangeHistory(
    filters: ChangeHistoryFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ConfigurationChangeHistory> {
    const offset = (page - 1) * pageSize;
    
    let query = supabase
      .from('configuration_audit_log')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters.configType) {
      query = query.eq('config_type', filters.configType);
    }
    if (filters.configId) {
      query = query.eq('config_id', filters.configId);
    }
    if (filters.changedBy) {
      query = query.eq('changed_by', filters.changedBy);
    }
    if (filters.startDate) {
      query = query.gte('changed_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('changed_at', filters.endDate);
    }
    if (filters.searchText) {
      query = query.ilike('change_reason', `%${filters.searchText}%`);
    }
    
    // Get count
    const { count, error: countError } = await query;
    
    if (countError) {
      console.error('Failed to count filtered audit log entries:', countError);
      throw countError;
    }
    
    // Get entries
    const { data, error } = await query
      .order('changed_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (error) {
      console.error('Failed to fetch filtered change history:', error);
      throw error;
    }
    
    const totalCount = count || 0;
    const hasMore = offset + pageSize < totalCount;
    
    return {
      entries: data.map(this.transformAuditLogEntry),
      totalCount,
      page,
      pageSize,
      hasMore,
    };
  }
  
  /**
   * Preview rollback before applying
   */
  async previewRollback(
    configType: 'user_preference' | 'ai_config',
    configId: string,
    targetAuditLogId: string
  ): Promise<RollbackPreview> {
    // Get target audit log entry
    const { data: targetEntry, error: targetError } = await supabase
      .from('configuration_audit_log')
      .select('*')
      .eq('id', targetAuditLogId)
      .single();
    
    if (targetError) {
      console.error('Failed to fetch target audit log entry:', targetError);
      throw targetError;
    }
    
    // Get current configuration
    let currentValues: Record<string, any>;
    if (configType === 'user_preference') {
      const { data: currentConfig, error: currentError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('id', configId)
        .single();
      
      if (currentError) throw currentError;
      currentValues = currentConfig.preferences;
    } else {
      const { data: currentConfig, error: currentError } = await supabase
        .from('ai_configurations')
        .select('configuration')
        .eq('id', configId)
        .single();
      
      if (currentError) throw currentError;
      currentValues = currentConfig.configuration;
    }
    
    // Target values from audit log
    const targetValues = targetEntry.old_values; // Rollback to old values
    
    // Generate diff
    const diff = this.generateDiff(currentValues, targetValues);
    
    // Generate warnings
    const warnings: string[] = [];
    if (diff.removed.length > 0) {
      warnings.push(`${diff.removed.length} configuration keys will be removed`);
    }
    if (diff.added.length > 0) {
      warnings.push(`${diff.added.length} new configuration keys will be added`);
    }
    if (diff.modified.length > 10) {
      warnings.push('Large number of changes detected - please review carefully');
    }
    
    return {
      targetVersion: this.transformAuditLogEntry(targetEntry),
      currentValues,
      targetValues,
      diff,
      warnings,
    };
  }
  
  /**
   * Validate rollback before applying
   */
  async validateRollback(options: RollbackOptions): Promise<RollbackValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Get target values
      const { data: targetEntry, error: targetError } = await supabase
        .from('configuration_audit_log')
        .select('old_values')
        .eq('id', options.targetAuditLogId)
        .single();
      
      if (targetError) {
        errors.push('Target audit log entry not found');
        return { isValid: false, errors, warnings };
      }
      
      const targetValues = targetEntry.old_values;
      
      // Validate based on config type
      if (options.configType === 'user_preference') {
        const validationErrors = validateUserPreferences(targetValues);
        if (validationErrors.length > 0) {
          errors.push(...validationErrors);
        }
      } else if (options.configType === 'ai_config') {
        const validationErrors = validateAIConfiguration(targetValues);
        if (validationErrors.length > 0) {
          errors.push(...validationErrors);
        }
      }
      
      // Check for warnings
      if (!options.confirmWarnings) {
        warnings.push('User has not confirmed warnings');
      }
      
    } catch (error) {
      errors.push('Validation failed: ' + (error instanceof Error ? error.message : String(error)));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
  
  /**
   * Execute rollback to a previous configuration state
   */
  async rollbackToVersion(options: RollbackOptions, userId: string): Promise<void> {
    // Validate rollback
    const validation = await this.validateRollback(options);
    if (!validation.isValid) {
      throw new Error(`Rollback validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Get target values
    const { data: targetEntry, error: targetError } = await supabase
      .from('configuration_audit_log')
      .select('old_values')
      .eq('id', options.targetAuditLogId)
      .single();
    
    if (targetError) throw targetError;
    
    const targetValues = targetEntry.old_values;
    
    // Execute rollback based on config type
    if (options.configType === 'user_preference') {
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ preferences: targetValues })
        .eq('id', options.configId);
      
      if (updateError) throw updateError;
    } else if (options.configType === 'ai_config') {
      const { error: updateError } = await supabase
        .from('ai_configurations')
        .update({ configuration: targetValues })
        .eq('id', options.configId);
      
      if (updateError) throw updateError;
    }
    
    // Log rollback action
    await this.logRollbackAction(options, userId);
  }
  
  /**
   * Execute bulk rollback (atomic)
   */
  async bulkRollback(options: BulkRollbackOptions, userId: string): Promise<void> {
    // Validate all rollbacks first
    const validations = await Promise.all(
      options.rollbacks.map(rollback => this.validateRollback(rollback))
    );
    
    const hasErrors = validations.some(v => !v.isValid);
    if (hasErrors) {
      const allErrors = validations.flatMap(v => v.errors);
      throw new Error(`Bulk rollback validation failed: ${allErrors.join(', ')}`);
    }
    
    // Execute all rollbacks
    // Note: Supabase doesn't support true transactions in client
    // This is best-effort sequential execution
    for (const rollback of options.rollbacks) {
      await this.rollbackToVersion(rollback, userId);
    }
  }
  
  /**
   * Get change statistics
   */
  async getChangeStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<ChangeStatistics> {
    let query = supabase
      .from('configuration_audit_log')
      .select('*');
    
    if (startDate) {
      query = query.gte('changed_at', startDate);
    }
    if (endDate) {
      query = query.lte('changed_at', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Failed to fetch change statistics:', error);
      throw error;
    }
    
    // Calculate statistics
    const totalChanges = data.length;
    
    const changesByType: Record<string, number> = {};
    const changesByUser: Record<string, number> = {};
    const mostChangedConfigs: Record<string, number> = {};
    
    data.forEach(entry => {
      // By type
      changesByType[entry.config_type] = (changesByType[entry.config_type] || 0) + 1;
      
      // By user
      changesByUser[entry.changed_by] = (changesByUser[entry.changed_by] || 0) + 1;
      
      // By config
      const configKey = `${entry.config_type}:${entry.config_id}`;
      mostChangedConfigs[configKey] = (mostChangedConfigs[configKey] || 0) + 1;
    });
    
    // Recent activity (last 7 days)
    const recentActivity = this.calculateRecentActivity(data);
    
    // Most changed configs (top 10)
    const mostChangedConfigsArray = Object.entries(mostChangedConfigs)
      .map(([key, count]) => {
        const [configType, configId] = key.split(':');
        return { configType, configId, changeCount: count };
      })
      .sort((a, b) => b.changeCount - a.changeCount)
      .slice(0, 10);
    
    return {
      totalChanges,
      changesByType: changesByType as any,
      changesByUser,
      recentActivity,
      mostChangedConfigs: mostChangedConfigsArray as any,
    };
  }
  
  /**
   * Export change history as CSV
   */
  async exportChangeHistoryCSV(
    filters: ChangeHistoryFilters
  ): Promise<string> {
    // Get all matching entries (no pagination)
    let query = supabase
      .from('configuration_audit_log')
      .select('*');
    
    if (filters.configType) {
      query = query.eq('config_type', filters.configType);
    }
    if (filters.configId) {
      query = query.eq('config_id', filters.configId);
    }
    if (filters.changedBy) {
      query = query.eq('changed_by', filters.changedBy);
    }
    if (filters.startDate) {
      query = query.gte('changed_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('changed_at', filters.endDate);
    }
    
    const { data, error } = await query.order('changed_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch audit log for CSV export:', error);
      throw error;
    }
    
    // Generate CSV
    const headers = ['ID', 'Config Type', 'Config ID', 'Changed By', 'Changed At', 'Change Reason'];
    const rows = data.map(entry => [
      entry.id,
      entry.config_type,
      entry.config_id,
      entry.changed_by,
      entry.changed_at,
      entry.change_reason || '',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
    
    return csvContent;
  }
  
  /**
   * Transform database row to ConfigurationAuditLogEntry
   */
  private transformAuditLogEntry(row: any): ConfigurationAuditLogEntry {
    return {
      id: row.id,
      configType: row.config_type,
      configId: row.config_id,
      changedBy: row.changed_by,
      changedAt: row.changed_at,
      oldValues: row.old_values,
      newValues: row.new_values,
      changeReason: row.change_reason,
      clientIp: row.client_ip,
      userAgent: row.user_agent,
    };
  }
  
  /**
   * Generate diff between two configuration objects
   */
  private generateDiff(
    oldConfig: Record<string, any>,
    newConfig: Record<string, any>
  ): ConfigurationDiff {
    const added: Array<{ path: string; value: any }> = [];
    const modified: Array<{ path: string; oldValue: any; newValue: any }> = [];
    const removed: Array<{ path: string; value: any }> = [];
    
    // Helper function to traverse nested objects
    const traverse = (
      oldObj: any,
      newObj: any,
      path: string = ''
    ) => {
      const allKeys = new Set([
        ...Object.keys(oldObj || {}),
        ...Object.keys(newObj || {}),
      ]);
      
      allKeys.forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        const oldValue = oldObj?.[key];
        const newValue = newObj?.[key];
        
        if (oldValue === undefined && newValue !== undefined) {
          added.push({ path: currentPath, value: newValue });
        } else if (oldValue !== undefined && newValue === undefined) {
          removed.push({ path: currentPath, value: oldValue });
        } else if (
          typeof oldValue === 'object' &&
          typeof newValue === 'object' &&
          oldValue !== null &&
          newValue !== null &&
          !Array.isArray(oldValue) &&
          !Array.isArray(newValue)
        ) {
          // Recursively traverse nested objects
          traverse(oldValue, newValue, currentPath);
        } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          modified.push({ path: currentPath, oldValue, newValue });
        }
      });
    };
    
    traverse(oldConfig, newConfig);
    
    return { added, modified, removed };
  }
  
  /**
   * Calculate recent activity (last 7 days)
   */
  private calculateRecentActivity(
    entries: any[]
  ): Array<{ date: string; count: number }> {
    const activity: Record<string, number> = {};
    
    // Get last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activity[dateStr] = 0;
    }
    
    // Count entries per day
    entries.forEach(entry => {
      const dateStr = entry.changed_at.split('T')[0];
      if (activity[dateStr] !== undefined) {
        activity[dateStr]++;
      }
    });
    
    return Object.entries(activity)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  /**
   * Log rollback action for audit trail
   */
  private async logRollbackAction(
    options: RollbackOptions,
    userId: string
  ): Promise<void> {
    await supabase
      .from('configuration_audit_log')
      .insert({
        config_type: options.configType,
        config_id: options.configId,
        changed_by: userId,
        change_reason: options.reason || `Rollback to version ${options.targetAuditLogId}`,
      });
  }
}

export const configRollbackService = new ConfigRollbackService();
```

**Task T-2.1.4: API Routes for Configuration Change Management**

Create `src/app/api/config/change-history/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { configRollbackService } from '@/lib/services/config-rollback-service';
import { ChangeHistoryFilters } from '@/lib/types/config-change-management';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    // Get filter parameters
    const configType = searchParams.get('configType') as 'user_preference' | 'ai_config' | null;
    const configId = searchParams.get('configId');
    
    // Simple query: get history for specific config
    if (configType && configId) {
      const history = await configRollbackService.getChangeHistory(
        configType,
        configId,
        page,
        pageSize
      );
      return NextResponse.json({ history });
    }
    
    // Advanced query: with filters
    const filters: ChangeHistoryFilters = {
      configType: configType || undefined,
      changedBy: searchParams.get('changedBy') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      searchText: searchParams.get('searchText') || undefined,
    };
    
    const history = await configRollbackService.getFilteredChangeHistory(
      filters,
      page,
      pageSize
    );
    
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching change history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change history' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/config/rollback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { configRollbackService } from '@/lib/services/config-rollback-service';
import { RollbackOptions, BulkRollbackOptions } from '@/lib/types/config-change-management';

/**
 * POST /api/config/rollback
 * Execute rollback to a previous configuration state
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const action = body.action;
    
    // Handle preview
    if (action === 'preview') {
      const { configType, configId, targetAuditLogId } = body;
      
      if (!configType || !configId || !targetAuditLogId) {
        return NextResponse.json(
          { error: 'configType, configId, and targetAuditLogId are required' },
          { status: 400 }
        );
      }
      
      const preview = await configRollbackService.previewRollback(
        configType,
        configId,
        targetAuditLogId
      );
      
      return NextResponse.json({ preview });
    }
    
    // Handle validate
    if (action === 'validate') {
      const options: RollbackOptions = body.options;
      
      if (!options) {
        return NextResponse.json(
          { error: 'options are required' },
          { status: 400 }
        );
      }
      
      const validation = await configRollbackService.validateRollback(options);
      
      return NextResponse.json({ validation });
    }
    
    // Handle execute
    if (action === 'execute') {
      const options: RollbackOptions = body.options;
      
      if (!options) {
        return NextResponse.json(
          { error: 'options are required' },
          { status: 400 }
        );
      }
      
      await configRollbackService.rollbackToVersion(options, user.id);
      
      return NextResponse.json({ success: true });
    }
    
    // Handle bulk execute
    if (action === 'bulk') {
      const options: BulkRollbackOptions = body.options;
      
      if (!options || !options.rollbacks || options.rollbacks.length === 0) {
        return NextResponse.json(
          { error: 'options with rollbacks array is required' },
          { status: 400 }
        );
      }
      
      await configRollbackService.bulkRollback(options, user.id);
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Must be "preview", "validate", "execute", or "bulk"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error executing rollback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute rollback' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/config/statistics/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { configRollbackService } from '@/lib/services/config-rollback-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    
    const statistics = await configRollbackService.getChangeStatistics(startDate, endDate);
    
    return NextResponse.json({ statistics });
  } catch (error) {
    console.error('Error fetching change statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/config/export-csv/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { configRollbackService } from '@/lib/services/config-rollback-service';
import { ChangeHistoryFilters } from '@/lib/types/config-change-management';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const filters: ChangeHistoryFilters = await request.json();
    
    const csvContent = await configRollbackService.exportChangeHistoryCSV(filters);
    
    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="config-change-history-${new Date().toISOString()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting change history:', error);
    return NextResponse.json(
      { error: 'Failed to export change history' },
      { status: 500 }
    );
  }
}
```

**ACCEPTANCE CRITERIA:**

1. **Database Schema:**
   - [ ] Unified configuration_audit_log table exists
   - [ ] RLS policies prevent updates/deletes (append-only)
   - [ ] Indexes on config_type, config_id, changed_by, changed_at
   - [ ] GIN indexes on old_values and new_values JSONB fields
   - [ ] Trigger functions log changes on user_preferences and ai_configurations
   - [ ] Immutability enforced via RLS policies

2. **Type Definitions:**
   - [ ] All configuration change management types defined
   - [ ] ConfigurationDiff type supports nested object comparison
   - [ ] RollbackOptions include validation flags
   - [ ] ChangeStatistics type aggregates analytics
   - [ ] TypeScript compilation succeeds with strict mode

3. **Rollback Service:**
   - [ ] getChangeHistory() returns paginated history
   - [ ] getFilteredChangeHistory() applies all filter criteria
   - [ ] previewRollback() shows before/after diff
   - [ ] validateRollback() validates target configuration
   - [ ] rollbackToVersion() executes rollback correctly
   - [ ] bulkRollback() validates all before executing any
   - [ ] generateDiff() handles nested objects correctly
   - [ ] getChangeStatistics() aggregates accurately
   - [ ] exportChangeHistoryCSV() generates valid CSV

4. **API Routes:**
   - [ ] GET /api/config/change-history returns history
   - [ ] Pagination (page, pageSize) works correctly
   - [ ] Filtering (configType, changedBy, dates) works correctly
   - [ ] POST /api/config/rollback with action=preview returns preview
   - [ ] POST /api/config/rollback with action=validate returns validation
   - [ ] POST /api/config/rollback with action=execute performs rollback
   - [ ] POST /api/config/rollback with action=bulk performs bulk rollback
   - [ ] GET /api/config/statistics returns aggregated statistics
   - [ ] POST /api/config/export-csv downloads CSV file
   - [ ] All routes require authentication
   - [ ] Error responses include helpful messages

5. **Integration:**
   - [ ] User preferences updates trigger audit log entries
   - [ ] AI configuration updates trigger audit log entries
   - [ ] Rollback actually updates target configuration
   - [ ] Rollback action itself is logged in audit trail
   - [ ] Validation uses same validators as regular updates

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/types/config-change-management.ts (NEW)
src/lib/services/config-rollback-service.ts (NEW)
src/app/api/config/change-history/route.ts (NEW)
src/app/api/config/rollback/route.ts (NEW)
src/app/api/config/statistics/route.ts (NEW)
src/app/api/config/export-csv/route.ts (NEW)
```

**Data Flow:**
1. User updates configuration (user preferences or AI config)
2. Update triggers database trigger function
3. Trigger function inserts audit log entry
4. User views change history via API
5. User previews rollback to see diff
6. User executes rollback after confirmation
7. Rollback updates target configuration
8. Rollback action logged in audit trail

**Error Handling:**
- Service layer errors log to console and throw
- API routes catch errors and return 500 with message
- Validation errors return 400 with specific errors array
- Rollback validation must pass before execution
- Bulk rollback validates all before executing any

**Performance:**
- Change history queries use pagination
- Indexes support efficient filtering
- GIN indexes enable JSONB field queries
- CSV export may be slow for large datasets (consider background job for >10K records)
- Diff generation optimized for nested objects

**VALIDATION REQUIREMENTS:**

1. **Manual Testing:**
   - Update user preferences → verify audit log entry created
   - Call GET /api/config/change-history → verify returns history
   - Call POST /api/config/rollback action=preview → verify shows diff
   - Call POST /api/config/rollback action=execute → verify rollback works
   - Verify configuration_audit_log table → verify entry logged
   - Try invalid rollback → verify validation fails

2. **Service Testing:**
   - Test getChangeHistory() with real audit log data
   - Test generateDiff() with various configuration shapes
   - Test validateRollback() with valid and invalid configurations
   - Test rollbackToVersion() end-to-end
   - Test bulkRollback() with multiple rollbacks

3. **Integration Testing:**
   - Update user preferences → verify triggers audit log
   - Update AI configuration → verify triggers audit log
   - Rollback user preferences → verify preferences updated
   - Rollback AI configuration → verify configuration updated
   - Verify rollback action logged in audit trail

**DELIVERABLES:**

1. [ ] `src/lib/types/config-change-management.ts` - Complete type definitions
2. [ ] `src/lib/services/config-rollback-service.ts` - Rollback service implementation
3. [ ] `src/app/api/config/change-history/route.ts` - Change history API
4. [ ] `src/app/api/config/rollback/route.ts` - Rollback API
5. [ ] `src/app/api/config/statistics/route.ts` - Statistics API
6. [ ] `src/app/api/config/export-csv/route.ts` - CSV export API
7. [ ] Database schema validation complete
8. [ ] Trigger functions verified and working
9. [ ] Manual testing completed
10. [ ] Integration testing completed

Implement this configuration change management system completely, ensuring all changes are tracked, rollback capabilities are safe and validated, and the system provides complete audit trails for compliance and debugging.


++++++++++++++++++


## Document Summary

This Part 2 document provides detailed execution instructions for **Prompts 3-4** of the Settings & Administration Module (E08):

**Prompt 3: Database Health Monitoring Foundation (T-1.3.0)**
- Comprehensive TypeScript type definitions for all health metrics
- Database health monitoring service querying PostgreSQL system catalogs
- Database maintenance service for VACUUM, ANALYZE, REINDEX operations
- API routes for health metrics, maintenance operations, and alerts
- Safety checks and validation before maintenance operations
- Health recommendations generation based on metrics analysis
- **Estimated Time**: 10-12 hours

**Prompt 4: Configuration Change Management (T-2.1.0)**
- Configuration change management type definitions
- Configuration rollback service with preview and validation
- Change history querying with pagination and filtering
- Diff generation for configuration comparisons
- Bulk rollback capabilities
- API routes for change history, rollback, and statistics
- CSV export for compliance reporting
- **Estimated Time**: 8-10 hours

**Total Implementation Time**: 20-24 hours (2-3 days)

**Dependencies:**
- Prompts 1-2 must be completed first (User Preferences and AI Configuration foundations)
- Database migrations from main E08 document must be applied
- PostgreSQL RPC functions for health monitoring must be created

**Integration Points:**
- Integrates with user preferences service from Prompt 1
- Integrates with AI configuration service from Prompt 2
- Provides foundation for UI implementation in Prompts 5-7
- Enables system administration and monitoring capabilities

**Success Criteria:**
- All type definitions compile without errors
- All service layer functions work with real database
- All API endpoints accessible and authenticated
- Database health metrics accurate and actionable
- Configuration rollback preserves data integrity
- Complete audit trail for all configuration changes

---

**Document Status**: Complete (Prompts 3-4 Detailed)  
**Output Location**: `pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E08-part2.md`  
**Ready for**: Implementation by development team using Claude-4.5-sonnet


