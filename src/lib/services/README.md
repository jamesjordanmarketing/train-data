# Database Performance Monitoring Services

Comprehensive database performance monitoring for the Interactive LoRA Conversation Generation platform. These services ensure <100ms query performance as the conversation dataset grows.

## Services Overview

### 1. Query Performance Service
**Location:** `src/lib/services/query-performance-service.ts`

Logs and analyzes database query performance to identify slow queries and track performance trends.

**Features:**
- Automatic query performance logging
- Slow query detection (>500ms) with alerts
- Query statistics (avg, P95 latency)
- Query hash generation for grouping similar queries

**Usage:**
```typescript
import { queryPerformanceService } from '@/lib/services/query-performance-service';

// Manual logging
await queryPerformanceService.logQuery({
  query_text: 'conversations.list',
  duration_ms: 750,
  endpoint: '/api/conversations',
  user_id: userId,
  parameters: { status: 'pending_review' }
});

// Get slow queries
const slowQueries = await queryPerformanceService.getSlowQueries(24, 500);
console.log(`Found ${slowQueries.length} slow queries in last 24 hours`);

// Get performance stats
const stats = await queryPerformanceService.getQueryStats(startDate, endDate);
console.log(`P95 latency: ${stats.p95_duration_ms}ms`);
```

### 2. Index Monitoring Service
**Location:** `src/lib/services/index-monitoring-service.ts`

Monitors database index usage to identify unused indexes and detect missing indexes.

**Features:**
- Hourly index usage snapshots
- Unused index detection
- Index usage trend analysis
- Automatic alerts for large unused indexes

**Usage:**
```typescript
import { indexMonitoringService } from '@/lib/services/index-monitoring-service';

// Capture snapshot (call hourly)
const count = await indexMonitoringService.captureSnapshot();

// Detect unused indexes (30+ days without use)
const unusedIndexes = await indexMonitoringService.detectUnusedIndexes(30);
unusedIndexes.forEach(idx => {
  console.log(`${idx.indexname}: ${idx.index_size}, unused for ${idx.days_since_last_scan} days`);
});

// Get index usage trends
const trends = await indexMonitoringService.getIndexTrends('conversations', 7);
```

### 3. Bloat Monitoring Service
**Location:** `src/lib/services/bloat-monitoring-service.ts`

Tracks table bloat (wasted space from deleted/updated rows) to maintain optimal performance.

**Features:**
- Daily table bloat snapshots
- Bloat ratio calculation
- High bloat table identification
- Automatic alerts for tables >20% bloat

**Usage:**
```typescript
import { bloatMonitoringService } from '@/lib/services/bloat-monitoring-service';

// Capture snapshot (call daily)
const count = await bloatMonitoringService.captureSnapshot();

// Get bloat status for all tables
const bloatStatus = await bloatMonitoringService.getBloatStatus();
bloatStatus.forEach(table => {
  console.log(`${table.tablename}: ${table.bloat_ratio.toFixed(1)}% bloat`);
});

// Get tables with high bloat (>20%)
const highBloat = await bloatMonitoringService.getHighBloatTables(20);
```

## Middleware Integration

### Query Logger Middleware
**Location:** `src/lib/middleware/query-logger.ts`

Wraps database queries with automatic performance logging.

**Usage:**
```typescript
import { withQueryLogging } from '@/lib/middleware/query-logger';

// In a service method:
async list(filters: FilterConfig): Promise<Conversation[]> {
  return withQueryLogging(
    async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('status', filters.status);
      return data || [];
    },
    {
      queryName: 'conversations.list',
      endpoint: '/api/conversations',
      parameters: filters,
    }
  );
}

// In an API route with user context:
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  
  const conversations = await withQueryLogging(
    () => conversationService.list({ statuses: ['approved'] }),
    {
      queryName: 'conversations.list',
      endpoint: '/api/conversations',
      userId,
      parameters: { statuses: ['approved'] }
    }
  );
  
  return NextResponse.json(conversations);
}
```

## API Endpoints

### Performance Dashboard API
**Endpoint:** `GET /api/performance`

**Query Parameters:**
- `metric`: Type of metric to retrieve
  - `summary`: All metrics (default)
  - `slow_queries`: Slow query analysis
  - `bloat`: Table bloat status
- `hours`: Hours to look back (for slow_queries)
- `threshold`: Bloat percentage threshold (for bloat)

**Examples:**
```bash
# Get complete performance summary
curl http://localhost:3000/api/performance?metric=summary

# Get slow queries from last 12 hours
curl http://localhost:3000/api/performance?metric=slow_queries&hours=12

# Get tables with >30% bloat
curl http://localhost:3000/api/performance?metric=bloat&threshold=30
```

**Response (summary):**
```json
{
  "query_performance": {
    "total_queries": 1542,
    "slow_queries": 23,
    "avg_duration_ms": 45.2,
    "p95_duration_ms": 235.8
  },
  "table_bloat": [
    {
      "tablename": "conversations",
      "bloat_ratio": 15.3,
      "bloat_bytes": 524288,
      "dead_tuples": 1250
    }
  ],
  "unused_indexes": [
    {
      "indexname": "idx_old_field",
      "tablename": "conversations",
      "index_size": "2048 kB",
      "days_since_last_scan": 45
    }
  ],
  "generated_at": "2025-10-30T10:30:00Z"
}
```

## Scheduled Jobs

### Cron Configuration
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/hourly-monitoring",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/daily-maintenance",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Environment Variables
Add to `.env.local`:
```bash
CRON_SECRET=your-random-secret-here
```

### Cron Endpoints

**Hourly Monitoring:** `/api/cron/hourly-monitoring`
- Captures index usage snapshots
- Captures bloat snapshots
- Checks query performance metrics
- Runs every hour

**Daily Maintenance:** `/api/cron/daily-maintenance`
- Detects unused indexes
- Identifies high bloat tables
- Runs at 2 AM UTC (low traffic)

## Database Schema Requirements

The monitoring services require these database tables and functions to exist:

### Tables
- `query_performance_logs`: Query execution logs
- `index_usage_snapshots`: Hourly index usage data
- `table_bloat_snapshots`: Daily bloat measurements
- `performance_alerts`: Generated alerts

### Database Functions
- `capture_index_usage_snapshot()`: Captures current index usage
- `detect_unused_indexes(age_days)`: Finds unused indexes
- `capture_table_bloat_snapshot()`: Captures bloat data
- `get_slow_queries(hours_back, min_duration_ms)`: Returns slow queries
- `create_performance_alert(...)`: Creates alert record
- `check_table_bloat_alerts()`: Checks bloat thresholds

## Testing

Test the services with these commands:

```typescript
// Test query logging
import { queryPerformanceService } from '@/lib/services/query-performance-service';

await queryPerformanceService.logQuery({
  query_text: 'SELECT * FROM conversations WHERE status = ?',
  duration_ms: 750,
  endpoint: '/api/conversations',
  user_id: 'test-user-id',
});

// Verify log was created
const slowQueries = await queryPerformanceService.getSlowQueries(1);
console.log('Slow queries:', slowQueries);

// Test index monitoring
import { indexMonitoringService } from '@/lib/services/index-monitoring-service';

await indexMonitoringService.captureSnapshot();
const unusedIndexes = await indexMonitoringService.detectUnusedIndexes();
console.log('Unused indexes:', unusedIndexes);

// Test bloat monitoring
import { bloatMonitoringService } from '@/lib/services/bloat-monitoring-service';

await bloatMonitoringService.captureSnapshot();
const bloatStatus = await bloatMonitoringService.getBloatStatus();
console.log('Bloat status:', bloatStatus);
```

## Performance Thresholds

### Query Performance
- **Good:** <100ms average response time
- **Warning:** 100-500ms average response time
- **Critical:** >500ms average response time
- **Alert Threshold:** Individual queries >500ms

### Bloat Levels
- **Healthy:** <10% bloat ratio
- **Monitor:** 10-20% bloat ratio
- **Action Required:** >20% bloat ratio (consider VACUUM FULL)
- **Critical:** >50% bloat ratio (urgent maintenance needed)

### Index Usage
- **Active:** Used in last 7 days
- **Low Usage:** Used 7-30 days ago
- **Unused:** Not used in 30+ days
- **Consider Dropping:** Large unused indexes (>10MB, 30+ days unused)

## Best Practices

1. **Regular Monitoring:** Review performance dashboard daily
2. **Alert Response:** Investigate slow query alerts within 24 hours
3. **Index Maintenance:** Review unused indexes monthly, drop if confirmed unnecessary
4. **Bloat Management:** Schedule VACUUM FULL for tables >30% bloat during maintenance windows
5. **Query Optimization:** Optimize queries consistently showing >100ms latency
6. **Capacity Planning:** Track growth trends to anticipate scaling needs

## Integration Checklist

- ✅ Three monitoring services created
- ✅ Query logging middleware implemented
- ✅ Performance API endpoint functional
- ✅ Scheduled cron jobs configured
- ✅ All services use correct table names (conversation_templates, NOT prompt_templates)
- ✅ Error handling prevents monitoring failures from breaking application
- ✅ Logging is async to avoid performance impact
- ✅ TypeScript types match database schema
- ✅ Comprehensive JSDoc documentation

## Troubleshooting

### Queries not being logged
- Verify `query_performance_logs` table exists
- Check middleware is properly wrapping queries
- Ensure async logging errors aren't being thrown

### Cron jobs not running
- Verify `vercel.json` cron configuration
- Check `CRON_SECRET` environment variable is set
- Confirm authorization header is being sent

### Database functions not found
- Ensure all required PostgreSQL functions are created
- Verify function signatures match service calls
- Check database user has EXECUTE permissions

### High memory usage
- Reduce snapshot frequency if needed
- Implement data retention policy for old logs
- Consider archiving old snapshots

