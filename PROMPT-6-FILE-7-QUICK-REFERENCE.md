# Database Health Monitoring - Quick Reference

## 🚀 Quick Start

### 1. Apply Database Migration

```bash
# Run migration in Supabase SQL Editor or via CLI
psql -h your_host -U postgres -d your_db -f supabase/migrations/20251101_database_health_monitoring.sql
```

Or copy/paste the migration SQL into Supabase Dashboard → SQL Editor → New Query → Run

### 2. Enable pg_stat_statements (Optional but Recommended)

```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### 3. Test API Endpoints

```bash
# Get full health report
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/database/health

# Get table metrics only
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/database/health?type=tables
```

---

## 📊 API Endpoints

### Health Metrics

```typescript
// Full health report
GET /api/database/health
// Returns: { report: DatabaseHealthReport }

// Specific metrics
GET /api/database/health?type=overview    // Database overview
GET /api/database/health?type=tables      // Table health metrics
GET /api/database/health?type=indexes     // Index health metrics
GET /api/database/health?type=queries&limit=20  // Slow queries
GET /api/database/health?type=connections // Connection pool
```

### Maintenance Operations

```typescript
// Execute maintenance
POST /api/database/maintenance
Body: {
  operationType: "VACUUM" | "VACUUM FULL" | "ANALYZE" | "REINDEX",
  tableName?: string,
  indexName?: string,
  concurrent?: boolean,
  verbose?: boolean,
  analyze?: boolean
}
// Returns: { operation: MaintenanceOperationRecord }

// Get operation history
GET /api/database/maintenance?type=history&limit=50

// Get running operations
GET /api/database/maintenance?type=running
```

### Alerts

```typescript
// Get active alerts
GET /api/database/alerts
// Returns: { alerts: DatabaseHealthAlert[] }

// Acknowledge alert
PATCH /api/database/alerts
Body: { alertId: "uuid", action: "acknowledge" }

// Resolve alert
PATCH /api/database/alerts
Body: { alertId: "uuid", action: "resolve" }
```

---

## 💻 Service Layer Usage

### Import Services

```typescript
import { databaseHealthService } from '@/lib/services/database-health-service';
import { databaseMaintenanceService } from '@/lib/services/database-maintenance-service';
```

### Get Health Report

```typescript
// Full report with all metrics
const report = await databaseHealthService.getHealthReport();

// Access metrics
console.log('Database:', report.overview.databaseName);
console.log('Size:', report.overview.databaseSizeFormatted);
console.log('Cache Hit Ratio:', report.overview.cacheHitRatio.toFixed(2) + '%');
console.log('Tables needing VACUUM:', report.tables.filter(t => t.needsVacuum).length);
console.log('Recommendations:', report.recommendations.length);
```

### Individual Metrics

```typescript
// Database overview only
const overview = await databaseHealthService.getDatabaseOverview();

// Table health metrics
const tables = await databaseHealthService.getTableHealthMetrics();
const largestTable = tables[0]; // sorted by size desc

// Index metrics
const indexes = await databaseHealthService.getIndexHealthMetrics();
const unusedIndexes = indexes.filter(i => i.isUnused);

// Slow queries
const slowQueries = await databaseHealthService.getSlowQueries(10);

// Connection pool
const pool = await databaseHealthService.getConnectionPoolMetrics();
console.log(`Utilization: ${pool.utilizationPercentage.toFixed(1)}%`);
```

### Execute Maintenance

```typescript
// VACUUM a specific table
const operation = await databaseMaintenanceService.executeVacuum({
  operationType: 'VACUUM',
  tableName: 'conversations',
  analyze: true,
  verbose: false,
}, userId);

console.log(`Completed in ${operation.durationMs}ms`);

// ANALYZE all tables
await databaseMaintenanceService.executeAnalyze({
  operationType: 'ANALYZE',
  tableName: null, // null = all tables
}, userId);

// REINDEX an index
await databaseMaintenanceService.executeReindex({
  operationType: 'REINDEX',
  indexName: 'idx_conversation_created_at',
  concurrent: true, // non-blocking
}, userId);
```

### Alert Management

```typescript
// Get active alerts
const alerts = await databaseHealthService.getActiveAlerts();

// Acknowledge alert
await databaseHealthService.acknowledgeAlert(alertId, userId);

// Resolve alert
await databaseHealthService.resolveAlert(alertId);
```

---

## 🎯 Common Use Cases

### 1. Daily Health Check

```typescript
async function dailyHealthCheck() {
  const report = await databaseHealthService.getHealthReport();
  
  // Check critical issues
  if (report.overview.cacheHitRatio < 90) {
    console.warn('⚠️ Low cache hit ratio:', report.overview.cacheHitRatio);
  }
  
  // Check tables needing maintenance
  const tablesNeedingVacuum = report.tables.filter(t => t.needsVacuum);
  if (tablesNeedingVacuum.length > 0) {
    console.warn('⚠️ Tables need VACUUM:', tablesNeedingVacuum.map(t => t.tableName));
  }
  
  // Check active alerts
  if (report.alerts.length > 0) {
    console.warn('⚠️ Active alerts:', report.alerts.length);
    report.alerts.forEach(alert => {
      console.log(`  ${alert.severity}: ${alert.message}`);
    });
  }
  
  // Review recommendations
  const highPriorityRecs = report.recommendations.filter(r => r.priority === 'high');
  if (highPriorityRecs.length > 0) {
    console.log('💡 High priority recommendations:');
    highPriorityRecs.forEach(rec => {
      console.log(`  ${rec.title}: ${rec.action}`);
    });
  }
}
```

### 2. Automated Maintenance

```typescript
async function automatedMaintenance(userId: string) {
  const tables = await databaseHealthService.getTableHealthMetrics();
  
  // Vacuum tables with > 10% dead tuples
  for (const table of tables.filter(t => t.needsVacuum)) {
    console.log(`Running VACUUM on ${table.tableName}...`);
    try {
      await databaseMaintenanceService.executeVacuum({
        operationType: 'VACUUM',
        tableName: table.tableName,
        analyze: true,
      }, userId);
      console.log(`✅ VACUUM completed for ${table.tableName}`);
    } catch (error) {
      console.error(`❌ VACUUM failed for ${table.tableName}:`, error);
    }
  }
  
  // Analyze tables not analyzed in 7+ days
  for (const table of tables.filter(t => t.needsAnalyze)) {
    console.log(`Running ANALYZE on ${table.tableName}...`);
    try {
      await databaseMaintenanceService.executeAnalyze({
        operationType: 'ANALYZE',
        tableName: table.tableName,
      }, userId);
      console.log(`✅ ANALYZE completed for ${table.tableName}`);
    } catch (error) {
      console.error(`❌ ANALYZE failed for ${table.tableName}:`, error);
    }
  }
}
```

### 3. Performance Investigation

```typescript
async function investigatePerformance() {
  // Get slow queries
  const slowQueries = await databaseHealthService.getSlowQueries(20);
  
  console.log('🐌 Slowest queries:');
  slowQueries.forEach((q, i) => {
    console.log(`${i + 1}. ${q.query.substring(0, 80)}...`);
    console.log(`   Mean: ${q.meanTimeMs.toFixed(2)}ms, Calls: ${q.calls}, Cache Hit: ${q.cacheHitRatio.toFixed(2)}%`);
  });
  
  // Get indexes with low usage
  const indexes = await databaseHealthService.getIndexHealthMetrics();
  const unusedIndexes = indexes.filter(i => i.isUnused);
  
  console.log('\n🗂️ Unused indexes:');
  unusedIndexes.forEach(idx => {
    console.log(`  ${idx.indexName} on ${idx.tableName} (${idx.indexSizeFormatted})`);
  });
  
  // Check connection pool
  const pool = await databaseHealthService.getConnectionPoolMetrics();
  
  console.log('\n🔌 Connection pool:');
  console.log(`  Total: ${pool.totalConnections} / ${pool.maxConnections} (${pool.utilizationPercentage.toFixed(1)}%)`);
  console.log(`  Active: ${pool.activeConnections}, Idle: ${pool.idleConnections}`);
  console.log(`  Longest query: ${pool.longestRunningQuerySeconds}s`);
}
```

---

## 🔧 Configuration

### Custom Thresholds

```typescript
import { databaseHealthService } from '@/lib/services/database-health-service';

// Set custom monitoring thresholds
databaseHealthService.setConfig({
  slowQueryThresholdMs: 1000,        // 1 second instead of 500ms
  highBloatThresholdPercent: 30,     // 30% instead of 20%
  lowCacheHitRatioThreshold: 95,     // 95% instead of 90%
  highConnectionUsageThreshold: 85,  // 85% instead of 80%
  vacuumOverdueDays: 14,             // 14 days instead of 7
  analyzeOverdueDays: 14,            // 14 days instead of 7
  unusedIndexDays: 60,               // 60 days instead of 30
});
```

---

## 📋 Type Definitions

### Key Types

```typescript
// Full health report
interface DatabaseHealthReport {
  timestamp: string;
  overview: DatabaseOverviewMetrics;
  tables: TableHealthMetrics[];
  indexes: IndexHealthMetrics[];
  slowQueries: QueryPerformanceMetrics[];
  connectionPool: ConnectionPoolMetrics;
  alerts: DatabaseHealthAlert[];
  recommendations: HealthRecommendation[];
}

// Table health
interface TableHealthMetrics {
  schemaName: string;
  tableName: string;
  rowCount: number;
  deadTuples: number;
  deadTuplesRatio: number;
  tableSizeBytes: number;
  tableSizeFormatted: string;
  lastVacuum: string | null;
  lastAnalyze: string | null;
  bloatPercentage: number;
  needsVacuum: boolean;
  needsAnalyze: boolean;
}

// Maintenance operation
interface MaintenanceOperationOptions {
  operationType: 'VACUUM' | 'VACUUM FULL' | 'ANALYZE' | 'REINDEX';
  tableName?: string;
  indexName?: string;
  concurrent?: boolean;
  verbose?: boolean;
  analyze?: boolean;
}

// Health alert
interface DatabaseHealthAlert {
  id: string;
  alertType: AlertType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  details: Record<string, any>;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}
```

---

## 🔒 Security Notes

- All API routes require authentication via Supabase Auth
- Database functions use `SECURITY DEFINER` to access system catalogs
- Service role key required in environment variables
- RLS policies enforce user-level access control
- VACUUM FULL blocked during peak hours (9 AM - 5 PM)
- Concurrent operations on same table are prevented

---

## 🧪 Testing Checklist

- [ ] Apply database migration successfully
- [ ] Test GET /api/database/health (all types)
- [ ] Test POST /api/database/maintenance (VACUUM)
- [ ] Test POST /api/database/maintenance (ANALYZE)
- [ ] Test GET /api/database/alerts
- [ ] Test PATCH /api/database/alerts (acknowledge)
- [ ] Verify operation history tracking
- [ ] Verify safety checks prevent invalid operations
- [ ] Test with actual database under load
- [ ] Enable pg_stat_statements and test slow queries

---

## 📚 Related Documentation

- Full Implementation: `PROMPT-6-FILE-7-DATABASE-HEALTH-IMPLEMENTATION.md`
- Database Migration: `supabase/migrations/20251101_database_health_monitoring.sql`
- Type Definitions: `src/lib/types/database-health.ts`
- Services: `src/lib/services/database-health-service.ts`

---

## 🆘 Troubleshooting

### "Function does not exist" error
→ Run the database migration to create required functions

### "Permission denied" error
→ Ensure SUPABASE_SERVICE_ROLE_KEY is set in environment variables

### "pg_stat_statements does not exist" warning
→ Enable extension: `CREATE EXTENSION pg_stat_statements;`

### Slow queries endpoint returns empty array
→ Normal if pg_stat_statements is not enabled or no slow queries exist

### VACUUM FULL rejected during peak hours
→ Safety check prevents VACUUM FULL between 9 AM - 5 PM (configurable in service)

---

**Quick Reference Version**: 1.0  
**Last Updated**: November 1, 2025

