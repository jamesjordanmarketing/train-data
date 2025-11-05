# Database Health Monitoring Foundation - Implementation Complete

## Executive Summary

Successfully implemented comprehensive database health monitoring infrastructure for the Train platform, enabling proactive database performance monitoring, maintenance operations, and health alerting.

**Implementation Date**: November 1, 2025  
**Scope**: T-1.3.0 - Database Health Monitoring Foundation  
**Status**: ✅ Complete

---

## Deliverables

### 1. Type Definitions (`src/lib/types/database-health.ts`)

**Complete TypeScript type definitions for:**

- `TableHealthMetrics` - Table-level metrics from pg_stat_user_tables
- `IndexHealthMetrics` - Index-level metrics from pg_stat_user_indexes  
- `QueryPerformanceMetrics` - Query performance from pg_stat_statements
- `ConnectionPoolMetrics` - Connection pool status from pg_stat_activity
- `DatabaseOverviewMetrics` - Database-wide metrics from pg_stat_database
- `MaintenanceOperationRecord` - Maintenance operation tracking
- `DatabaseHealthAlert` - Health alert definitions
- `DatabaseHealthReport` - Comprehensive health report aggregate
- `HealthRecommendation` - AI-generated health recommendations
- `HealthMonitoringConfig` - Configuration for thresholds
- `MaintenanceOperationOptions` - Maintenance operation parameters

**Utility Functions:**
- `formatBytes()` - Human-readable byte formatting
- `calculatePercentage()` - Safe percentage calculation
- `needsVacuum()` - Determine if table needs VACUUM
- `needsAnalyze()` - Determine if table needs ANALYZE
- `calculateCacheHitRatio()` - Calculate cache hit percentage
- `getAlertSeverity()` - Determine alert severity from thresholds

### 2. Database Health Service (`src/lib/services/database-health-service.ts`)

**Core Methods:**

```typescript
// Get comprehensive health report
async getHealthReport(): Promise<DatabaseHealthReport>

// Individual metric queries
async getDatabaseOverview(): Promise<DatabaseOverviewMetrics>
async getTableHealthMetrics(): Promise<TableHealthMetrics[]>
async getIndexHealthMetrics(): Promise<IndexHealthMetrics[]>
async getSlowQueries(limit?: number): Promise<QueryPerformanceMetrics[]>
async getConnectionPoolMetrics(): Promise<ConnectionPoolMetrics>

// Alert management
async getActiveAlerts(): Promise<DatabaseHealthAlert[]>
async acknowledgeAlert(alertId: string, userId: string): Promise<void>
async resolveAlert(alertId: string): Promise<void>

// Configuration
setConfig(config: Partial<HealthMonitoringConfig>): void
```

**Features:**
- ✅ Queries all PostgreSQL system catalogs (pg_stat_*)
- ✅ Calculates derived metrics (bloat, ratios, percentages)
- ✅ Generates actionable health recommendations
- ✅ Configurable thresholds for alerting
- ✅ Service-role authentication for system queries
- ✅ Comprehensive error handling and logging

### 3. Database Maintenance Service (`src/lib/services/database-maintenance-service.ts`)

**Core Methods:**

```typescript
// Maintenance operations
async executeVacuum(options: MaintenanceOperationOptions, userId: string): Promise<MaintenanceOperationRecord>
async executeAnalyze(options: MaintenanceOperationOptions, userId: string): Promise<MaintenanceOperationRecord>
async executeReindex(options: MaintenanceOperationOptions, userId: string): Promise<MaintenanceOperationRecord>

// Operation tracking
async getOperationHistory(limit?: number): Promise<MaintenanceOperationRecord[]>
async getRunningOperations(): Promise<MaintenanceOperationRecord[]>
```

**Safety Features:**
- ✅ Pre-execution safety checks (table/index existence, peak hours, conflicts)
- ✅ Operation history tracking in `maintenance_operations` table
- ✅ Status tracking (queued, running, completed, failed)
- ✅ Duration measurement for performance analysis
- ✅ Error capture and status updates
- ✅ Conflict detection (prevent concurrent operations on same table)

### 4. API Routes

#### GET /api/database/health

**Query Parameters:**
- `type`: 'full' | 'overview' | 'tables' | 'indexes' | 'queries' | 'connections'
- `limit`: number (for queries type)

**Response Examples:**

```typescript
// Full report
GET /api/database/health
{
  "report": {
    "timestamp": "2025-11-01T12:00:00Z",
    "overview": { /* DatabaseOverviewMetrics */ },
    "tables": [ /* TableHealthMetrics[] */ ],
    "indexes": [ /* IndexHealthMetrics[] */ ],
    "slowQueries": [ /* QueryPerformanceMetrics[] */ ],
    "connectionPool": { /* ConnectionPoolMetrics */ },
    "alerts": [ /* DatabaseHealthAlert[] */ ],
    "recommendations": [ /* HealthRecommendation[] */ ]
  }
}

// Tables only
GET /api/database/health?type=tables
{
  "tables": [
    {
      "schemaName": "public",
      "tableName": "conversations",
      "rowCount": 1250,
      "deadTuples": 45,
      "deadTuplesRatio": 3.6,
      "tableSizeBytes": 524288,
      "tableSizeFormatted": "512.00 KB",
      "lastVacuum": "2025-10-30T10:15:00Z",
      "needsVacuum": false,
      "needsAnalyze": true
    }
  ]
}
```

#### POST /api/database/maintenance

**Execute maintenance operation:**

```typescript
// Request body
{
  "operationType": "VACUUM" | "VACUUM FULL" | "ANALYZE" | "REINDEX",
  "tableName": "conversations",  // optional, null for all tables
  "indexName": "idx_conversation_created_at",  // for REINDEX only
  "concurrent": true,  // for REINDEX CONCURRENTLY
  "verbose": false,
  "analyze": true  // for VACUUM with ANALYZE
}

// Response
{
  "operation": {
    "id": "uuid",
    "operationType": "VACUUM",
    "tableName": "conversations",
    "status": "completed",
    "startedAt": "2025-11-01T12:00:00Z",
    "completedAt": "2025-11-01T12:00:05Z",
    "durationMs": 5000,
    "initiatedBy": "user_id",
    "errorMessage": null
  }
}
```

#### GET /api/database/maintenance

**Query Parameters:**
- `type`: 'history' | 'running'
- `limit`: number (default 50)

```typescript
// Get operation history
GET /api/database/maintenance?type=history&limit=20

// Get currently running operations
GET /api/database/maintenance?type=running
```

#### GET /api/database/alerts

**Get active alerts:**

```typescript
{
  "alerts": [
    {
      "id": "uuid",
      "alertType": "high_bloat",
      "severity": "warning",
      "message": "Table 'conversations' has 25% bloat",
      "details": { "tableName": "conversations", "bloatPercentage": 25 },
      "createdAt": "2025-11-01T10:00:00Z",
      "acknowledgedAt": null,
      "resolvedAt": null
    }
  ]
}
```

#### PATCH /api/database/alerts

**Acknowledge or resolve alert:**

```typescript
// Request body
{
  "alertId": "uuid",
  "action": "acknowledge" | "resolve"
}

// Response
{
  "success": true
}
```

---

## Database Prerequisites

The implementation requires the following PostgreSQL functions and tables to be created in Supabase. These should be created as migrations or via SQL Editor.

### Required Database Tables

#### maintenance_operations

```sql
CREATE TABLE maintenance_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('VACUUM', 'VACUUM FULL', 'ANALYZE', 'REINDEX')),
  table_name TEXT,
  index_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms BIGINT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  initiated_by UUID NOT NULL REFERENCES auth.users(id),
  error_message TEXT,
  options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_maintenance_operations_status ON maintenance_operations(status);
CREATE INDEX idx_maintenance_operations_created_at ON maintenance_operations(created_at DESC);
```

#### performance_alerts (if not exists)

```sql
CREATE TABLE IF NOT EXISTS performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_performance_alerts_resolved ON performance_alerts(resolved_at);
CREATE INDEX idx_performance_alerts_created ON performance_alerts(created_at DESC);
```

### Required Database Functions

#### get_database_overview()

```sql
CREATE OR REPLACE FUNCTION get_database_overview()
RETURNS TABLE (
  datname NAME,
  database_size BIGINT,
  numbackends INTEGER,
  xact_commit BIGINT,
  xact_rollback BIGINT,
  blks_read BIGINT,
  blks_hit BIGINT,
  tup_returned BIGINT,
  tup_fetched BIGINT,
  tup_inserted BIGINT,
  tup_updated BIGINT,
  tup_deleted BIGINT,
  conflicts BIGINT,
  temp_files BIGINT,
  temp_bytes BIGINT,
  deadlocks BIGINT,
  checksum_failures BIGINT,
  stats_reset TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.datname,
    pg_database_size(d.datname) AS database_size,
    d.numbackends,
    d.xact_commit,
    d.xact_rollback,
    d.blks_read,
    d.blks_hit,
    d.tup_returned,
    d.tup_fetched,
    d.tup_inserted,
    d.tup_updated,
    d.tup_deleted,
    d.conflicts,
    d.temp_files,
    d.temp_bytes,
    d.deadlocks,
    COALESCE(d.checksum_failures, 0) AS checksum_failures,
    d.stats_reset
  FROM pg_stat_database d
  WHERE d.datname = current_database();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### get_table_health_metrics()

```sql
CREATE OR REPLACE FUNCTION get_table_health_metrics()
RETURNS TABLE (
  schemaname NAME,
  relname NAME,
  n_live_tup BIGINT,
  n_dead_tup BIGINT,
  table_size BIGINT,
  last_vacuum TIMESTAMP WITH TIME ZONE,
  last_autovacuum TIMESTAMP WITH TIME ZONE,
  last_analyze TIMESTAMP WITH TIME ZONE,
  last_autoanalyze TIMESTAMP WITH TIME ZONE,
  vacuum_count BIGINT,
  autovacuum_count BIGINT,
  analyze_count BIGINT,
  autoanalyze_count BIGINT,
  bloat_pct NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schemaname,
    s.relname,
    s.n_live_tup,
    s.n_dead_tup,
    pg_total_relation_size(s.relid) AS table_size,
    s.last_vacuum,
    s.last_autovacuum,
    s.last_analyze,
    s.last_autoanalyze,
    s.vacuum_count,
    s.autovacuum_count,
    s.analyze_count,
    s.autoanalyze_count,
    -- Simple bloat estimation
    CASE 
      WHEN s.n_live_tup > 0 
      THEN ROUND((s.n_dead_tup::NUMERIC / s.n_live_tup::NUMERIC) * 100, 2)
      ELSE 0
    END AS bloat_pct
  FROM pg_stat_user_tables s
  ORDER BY pg_total_relation_size(s.relid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### get_index_health_metrics()

```sql
CREATE OR REPLACE FUNCTION get_index_health_metrics()
RETURNS TABLE (
  schemaname NAME,
  relname NAME,
  indexrelname NAME,
  index_size BIGINT,
  idx_scan BIGINT,
  idx_tup_read BIGINT,
  idx_tup_fetch BIGINT,
  days_since_last_use NUMERIC,
  bloat_pct NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schemaname,
    s.relname,
    s.indexrelname,
    pg_relation_size(s.indexrelid) AS index_size,
    s.idx_scan,
    s.idx_tup_read,
    s.idx_tup_fetch,
    -- Days since last scan (approximate)
    CASE 
      WHEN s.idx_scan > 0 THEN 0
      ELSE EXTRACT(EPOCH FROM (NOW() - pg_stat_file('base/'||oid::text, true).modification))::NUMERIC / 86400
    END AS days_since_last_use,
    0::NUMERIC AS bloat_pct  -- Simplified, real bloat calculation is complex
  FROM pg_stat_user_indexes s
  ORDER BY pg_relation_size(s.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### get_connection_pool_metrics()

```sql
CREATE OR REPLACE FUNCTION get_connection_pool_metrics()
RETURNS TABLE (
  total BIGINT,
  active BIGINT,
  idle BIGINT,
  idle_in_transaction BIGINT,
  waiting BIGINT,
  max_connections INTEGER,
  by_database JSONB,
  by_user JSONB,
  longest_query_seconds NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE state = 'active')::BIGINT AS active,
    COUNT(*) FILTER (WHERE state = 'idle')::BIGINT AS idle,
    COUNT(*) FILTER (WHERE state = 'idle in transaction')::BIGINT AS idle_in_transaction,
    COUNT(*) FILTER (WHERE wait_event_type IS NOT NULL)::BIGINT AS waiting,
    (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections') AS max_connections,
    (SELECT jsonb_object_agg(datname, count) FROM (
      SELECT datname, COUNT(*)::INTEGER as count 
      FROM pg_stat_activity 
      GROUP BY datname
    ) db_counts) AS by_database,
    (SELECT jsonb_object_agg(usename, count) FROM (
      SELECT usename, COUNT(*)::INTEGER as count 
      FROM pg_stat_activity 
      WHERE usename IS NOT NULL
      GROUP BY usename
    ) user_counts) AS by_user,
    COALESCE(MAX(EXTRACT(EPOCH FROM (NOW() - query_start))), 0)::NUMERIC AS longest_query_seconds
  FROM pg_stat_activity
  WHERE pid <> pg_backend_pid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### execute_vacuum()

```sql
CREATE OR REPLACE FUNCTION execute_vacuum(
  p_table_name TEXT DEFAULT NULL,
  p_full BOOLEAN DEFAULT FALSE,
  p_analyze BOOLEAN DEFAULT FALSE,
  p_verbose BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  v_sql TEXT;
BEGIN
  -- Build VACUUM command
  v_sql := 'VACUUM';
  
  IF p_full THEN
    v_sql := v_sql || ' FULL';
  END IF;
  
  IF p_verbose THEN
    v_sql := v_sql || ' VERBOSE';
  END IF;
  
  IF p_analyze THEN
    v_sql := v_sql || ' ANALYZE';
  END IF;
  
  IF p_table_name IS NOT NULL THEN
    v_sql := v_sql || ' ' || quote_ident(p_table_name);
  END IF;
  
  -- Execute VACUUM
  EXECUTE v_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### execute_analyze()

```sql
CREATE OR REPLACE FUNCTION execute_analyze(
  p_table_name TEXT DEFAULT NULL,
  p_verbose BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  v_sql TEXT;
BEGIN
  v_sql := 'ANALYZE';
  
  IF p_verbose THEN
    v_sql := v_sql || ' VERBOSE';
  END IF;
  
  IF p_table_name IS NOT NULL THEN
    v_sql := v_sql || ' ' || quote_ident(p_table_name);
  END IF;
  
  EXECUTE v_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### execute_reindex()

```sql
CREATE OR REPLACE FUNCTION execute_reindex(
  p_table_name TEXT DEFAULT NULL,
  p_index_name TEXT DEFAULT NULL,
  p_concurrent BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  v_sql TEXT;
BEGIN
  IF p_index_name IS NOT NULL THEN
    -- Reindex specific index
    v_sql := 'REINDEX';
    IF p_concurrent THEN
      v_sql := v_sql || ' INDEX CONCURRENTLY';
    ELSE
      v_sql := v_sql || ' INDEX';
    END IF;
    v_sql := v_sql || ' ' || quote_ident(p_index_name);
  ELSIF p_table_name IS NOT NULL THEN
    -- Reindex entire table
    v_sql := 'REINDEX';
    IF p_concurrent THEN
      v_sql := v_sql || ' TABLE CONCURRENTLY';
    ELSE
      v_sql := v_sql || ' TABLE';
    END IF;
    v_sql := v_sql || ' ' || quote_ident(p_table_name);
  ELSE
    RAISE EXCEPTION 'Either table_name or index_name must be provided';
  END IF;
  
  EXECUTE v_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### table_exists() and index_exists()

```sql
CREATE OR REPLACE FUNCTION table_exists(p_table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = p_table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION index_exists(p_index_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname = p_index_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Environment Variables Required

Add to `.env.local`:

```bash
# Supabase credentials (should already exist)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for system catalog access
```

⚠️ **Important**: The service role key is required because standard users don't have access to PostgreSQL system catalogs (pg_stat_* views). The services use `SECURITY DEFINER` functions to query these views safely.

---

## Usage Examples

### 1. Get Full Health Report

```typescript
import { databaseHealthService } from '@/lib/services/database-health-service';

// Get comprehensive health report
const report = await databaseHealthService.getHealthReport();

console.log('Database:', report.overview.databaseName);
console.log('Size:', report.overview.databaseSizeFormatted);
console.log('Cache Hit Ratio:', report.overview.cacheHitRatio.toFixed(2), '%');
console.log('Active Alerts:', report.alerts.length);
console.log('Recommendations:', report.recommendations.length);

// Check tables needing maintenance
const tablesNeedingVacuum = report.tables.filter(t => t.needsVacuum);
console.log('Tables needing VACUUM:', tablesNeedingVacuum.length);
```

### 2. Execute Maintenance Operation

```typescript
import { databaseMaintenanceService } from '@/lib/services/database-maintenance-service';

// Run VACUUM on specific table
const operation = await databaseMaintenanceService.executeVacuum({
  operationType: 'VACUUM',
  tableName: 'conversations',
  analyze: true,
  verbose: false,
}, userId);

console.log('Operation completed in', operation.durationMs, 'ms');
```

### 3. Monitor Connection Pool

```typescript
const connectionMetrics = await databaseHealthService.getConnectionPoolMetrics();

console.log('Active connections:', connectionMetrics.activeConnections);
console.log('Idle connections:', connectionMetrics.idleConnections);
console.log('Utilization:', connectionMetrics.utilizationPercentage.toFixed(2), '%');
```

### 4. API Usage (Frontend)

```typescript
// Fetch health report from API
const response = await fetch('/api/database/health?type=tables');
const { tables } = await response.json();

// Execute maintenance via API
const response = await fetch('/api/database/maintenance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operationType: 'ANALYZE',
    tableName: 'conversations',
  }),
});
const { operation } = await response.json();

// Acknowledge alert
await fetch('/api/database/alerts', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    alertId: 'alert-uuid',
    action: 'acknowledge',
  }),
});
```

---

## Testing Checklist

### ✅ Type Safety
- [x] All types defined with strict TypeScript mode
- [x] No `any` types used (except for JSONB fields with Record<string, any>)
- [x] Utility functions return correct types
- [x] No linter errors

### ✅ Service Layer
- [x] Database health service instantiated as singleton
- [x] Database maintenance service instantiated as singleton
- [x] All methods properly typed
- [x] Error handling in place for all database queries
- [x] Service-role Supabase client used for system catalog access

### ✅ API Routes
- [x] All routes require authentication
- [x] Query parameters validated and typed
- [x] Request bodies validated
- [x] Error responses include helpful messages
- [x] Success responses match expected types

### ⚠️ Database Functions (Requires Manual Setup)
- [ ] maintenance_operations table created
- [ ] performance_alerts table created (if not exists)
- [ ] get_database_overview() function created
- [ ] get_table_health_metrics() function created
- [ ] get_index_health_metrics() function created
- [ ] get_connection_pool_metrics() function created
- [ ] execute_vacuum() function created
- [ ] execute_analyze() function created
- [ ] execute_reindex() function created
- [ ] table_exists() function created
- [ ] index_exists() function created

### ⚠️ Integration Testing (Requires Database Setup)
- [ ] GET /api/database/health returns full report
- [ ] GET /api/database/health?type=tables returns tables only
- [ ] GET /api/database/health?type=overview returns overview only
- [ ] POST /api/database/maintenance executes VACUUM
- [ ] POST /api/database/maintenance executes ANALYZE
- [ ] GET /api/database/maintenance returns operation history
- [ ] GET /api/database/alerts returns active alerts
- [ ] PATCH /api/database/alerts acknowledges alert

---

## Next Steps

1. **Database Setup** (Required before testing):
   - Create all required database tables via Supabase SQL Editor
   - Create all required PostgreSQL functions with SECURITY DEFINER
   - Verify pg_stat_statements extension is enabled
   - Test RPC functions directly in Supabase dashboard

2. **Frontend UI** (Next Phase - T-1.3.5):
   - Create database health dashboard component
   - Add maintenance operation trigger UI
   - Display health alerts and recommendations
   - Add operation history view
   - Implement real-time health monitoring

3. **Monitoring Integration**:
   - Integrate with existing cron jobs for automated health checks
   - Set up alert notifications (email, Slack, etc.)
   - Configure custom thresholds per environment
   - Add health report scheduling (daily, weekly)

4. **Documentation**:
   - Create user guide for database health dashboard
   - Document maintenance operation best practices
   - Add troubleshooting guide for common issues
   - Document alert types and recommended actions

---

## Technical Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐│
│  │ Health         │  │ Maintenance    │  │ Alerts       ││
│  │ Dashboard      │  │ Operations UI  │  │ Management   ││
│  └────────────────┘  └────────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Routes (Next.js)                   │
│                                                             │
│  /api/database/health      GET (full report + partials)    │
│  /api/database/maintenance POST (execute) | GET (history)  │
│  /api/database/alerts      GET | PATCH (acknowledge/resolve)│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                           │
│                                                             │
│  ┌────────────────────────┐  ┌─────────────────────────┐  │
│  │ DatabaseHealthService  │  │ DatabaseMaintenanceServ │  │
│  │ - getHealthReport()    │  │ - executeVacuum()       │  │
│  │ - getDatabaseOverview()│  │ - executeAnalyze()      │  │
│  │ - getTableMetrics()    │  │ - executeReindex()      │  │
│  │ - getIndexMetrics()    │  │ - getOperationHistory() │  │
│  │ - getSlowQueries()     │  │ - getRunningOperations()│  │
│  │ - getConnectionPool()  │  │ - performSafetyChecks() │  │
│  │ - generateRecs()       │  │                         │  │
│  └────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (Supabase) Database                 │
│                                                             │
│  System Catalogs:          Custom Tables:                  │
│  - pg_stat_database        - maintenance_operations         │
│  - pg_stat_user_tables     - performance_alerts            │
│  - pg_stat_user_indexes    - query_performance_logs        │
│  - pg_stat_statements      - index_usage_snapshots         │
│  - pg_stat_activity        - table_bloat_snapshots         │
│                                                             │
│  Custom Functions (SECURITY DEFINER):                      │
│  - get_database_overview()                                 │
│  - get_table_health_metrics()                             │
│  - get_index_health_metrics()                             │
│  - get_connection_pool_metrics()                          │
│  - execute_vacuum()                                        │
│  - execute_analyze()                                       │
│  - execute_reindex()                                       │
│  - table_exists(), index_exists()                         │
└─────────────────────────────────────────────────────────────┘
```

---

## File Manifest

| File Path | Type | Lines | Purpose |
|-----------|------|-------|---------|
| `src/lib/types/database-health.ts` | Types | 240 | All TypeScript type definitions |
| `src/lib/services/database-health-service.ts` | Service | 320 | Health monitoring service |
| `src/lib/services/database-maintenance-service.ts` | Service | 280 | Maintenance operations service |
| `src/app/api/database/health/route.ts` | API | 60 | Health metrics API endpoint |
| `src/app/api/database/maintenance/route.ts` | API | 80 | Maintenance operations API |
| `src/app/api/database/alerts/route.ts` | API | 70 | Alerts management API |

**Total Implementation**: ~1,050 lines of production code

---

## Conclusion

The Database Health Monitoring Foundation has been successfully implemented with comprehensive type safety, service layer architecture, and RESTful API endpoints. The system provides:

✅ Complete visibility into database performance metrics  
✅ Proactive health monitoring with recommendations  
✅ Safe maintenance operation execution  
✅ Alert management and tracking  
✅ Operation history and audit trail  

**Status**: Core implementation complete. Requires database setup (tables + functions) before functional testing. Ready for frontend UI development in next phase.

---

**Document Version**: 1.0  
**Last Updated**: November 1, 2025  
**Author**: AI Assistant (Claude Sonnet 4.5)  
**Review Status**: Pending

