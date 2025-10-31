# Prompt 6 - File 5: Quick Reference Guide

## 🚀 Quick Start

### Run Tests
```bash
# Test monitoring functionality
npx tsx scripts/test-export-monitoring.ts

# Test cron endpoints (requires running server)
npm run dev
./scripts/test-cron-endpoints.sh http://localhost:3000 test-secret
```

### Environment Setup
```bash
# Add to .env.local
CRON_SECRET=your-secure-random-secret

# Optional: S3 archival
EXPORT_ARCHIVE_BUCKET=my-archive-bucket
EXPORT_ARCHIVE_REGION=us-east-1
```

---

## 📁 File Structure

```
src/
├── lib/
│   ├── monitoring/
│   │   └── export-metrics.ts          ← Metrics collection
│   └── cron/
│       ├── export-file-cleanup.ts     ← File cleanup job
│       └── export-log-cleanup.ts      ← Log cleanup job
│
├── app/api/cron/
│   ├── export-file-cleanup/route.ts   ← Daily cleanup endpoint
│   ├── export-log-cleanup/route.ts    ← Monthly cleanup endpoint
│   └── export-metrics-aggregate/route.ts  ← Hourly metrics
│
└── vercel.json                        ← Cron configuration

scripts/
├── test-export-monitoring.ts          ← Test suite
└── test-cron-endpoints.sh             ← Endpoint tests
```

---

## 🔧 Usage Examples

### 1. Log Export Metrics

```typescript
import { createExportMetricsService } from '@/lib/monitoring/export-metrics';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const supabase = createServerSupabaseClient();
const metricsService = createExportMetricsService(supabase);

// Log successful export
await metricsService.logExportMetric({
  export_id: exportLog.export_id,
  user_id: userId,
  format: 'jsonl',
  status: 'completed',
  conversation_count: 150,
  duration_ms: 2500,
  file_size_bytes: 524288,
});

// Log failed export
await metricsService.logExportMetric({
  export_id: exportLog.export_id,
  user_id: userId,
  format: 'json',
  status: 'failed',
  conversation_count: 50,
  duration_ms: 1200,
  file_size_bytes: null,
  error_type: 'DatabaseError',
  error_message: 'Connection timeout',
});
```

### 2. Aggregate Metrics

```typescript
// Aggregate hourly metrics
const endDate = new Date();
const startDate = new Date(endDate.getTime() - 60 * 60 * 1000);

const metrics = await metricsService.aggregateMetrics(
  startDate, 
  endDate, 
  'hourly'
);

console.log('Success rate:', (metrics.success_rate * 100).toFixed(1) + '%');
console.log('Total exports:', metrics.total_exports);
```

### 3. Check Failure Rate

```typescript
// Check failure rate for the past hour
const alert = await metricsService.checkFailureRate(60);

if (alert?.alert) {
  console.error('High failure rate:', alert.failure_rate);
  // Trigger alert notification
}
```

### 4. Manual File Cleanup

```typescript
import { exportFileCleanup } from '@/lib/cron/export-file-cleanup';

// Run cleanup manually
const result = await exportFileCleanup();

console.log('Deleted:', result.deleted_count);
console.log('Failed:', result.failed_count);
```

### 5. Manual Log Cleanup

```typescript
import { exportLogCleanup, getCleanupStats } from '@/lib/cron/export-log-cleanup';

// Get cleanup statistics
const stats = await getCleanupStats(supabase, 30);
console.log('Eligible for cleanup:', stats.eligible_for_cleanup);

// Run cleanup
const result = await exportLogCleanup(supabase, 30);
console.log('Deleted:', result.deleted_count);
```

---

## 📅 Cron Schedules

| Job | Schedule | Frequency | Purpose |
|-----|----------|-----------|---------|
| Export Metrics | `0 * * * *` | Hourly | Aggregate metrics & check alerts |
| File Cleanup | `0 2 * * *` | Daily at 2am UTC | Delete expired export files |
| Log Cleanup | `0 3 1 * *` | Monthly on 1st at 3am UTC | Delete old export logs |

---

## 🔍 Monitoring

### Structured Log Types

#### 1. Export Metric
```json
{
  "type": "export_metric",
  "export_id": "uuid",
  "format": "jsonl",
  "status": "completed",
  "duration_ms": 2500,
  "file_size_bytes": 524288
}
```

#### 2. Aggregated Metrics
```json
{
  "type": "aggregated_metrics",
  "total_exports": 42,
  "success_rate": 0.952,
  "avg_duration_by_format": {"jsonl": 2500}
}
```

#### 3. Failure Alert
```json
{
  "type": "export_failure_alert",
  "severity": "high",
  "failure_rate": 0.15,
  "threshold": 0.1
}
```

#### 4. Cleanup Complete
```json
{
  "type": "export_file_cleanup_complete",
  "deleted_count": 5,
  "duration_ms": 1234
}
```

### Query Logs

**Datadog**:
```
type:export_metric status:completed | avg:duration_ms by format
```

**CloudWatch Insights**:
```
fields @timestamp, export_id, duration_ms
| filter type = "export_metric"
| stats avg(duration_ms) by format
```

---

## 🧪 Testing Checklist

- [ ] Metrics logging works for success/failure
- [ ] Aggregation calculates correct statistics
- [ ] Failure rate alerts trigger at >10%
- [ ] File cleanup deletes expired exports
- [ ] Log cleanup removes old records
- [ ] Cron endpoints require authentication
- [ ] Unauthorized requests return 401

---

## 🚨 Troubleshooting

### Issue: Cron job not running

**Solution**:
1. Check Vercel dashboard → Cron Jobs
2. Verify `vercel.json` is in project root
3. Ensure app is deployed to Vercel (crons don't work locally)

### Issue: Unauthorized error

**Solution**:
1. Set `CRON_SECRET` in Vercel environment variables
2. Use correct secret in Authorization header
3. Format: `Bearer <CRON_SECRET>`

### Issue: Files not deleting

**Solution**:
1. Check export logs have `expires_at` set
2. Verify Supabase Storage bucket exists
3. Check service role key has storage permissions

### Issue: Metrics not showing

**Solution**:
1. Verify `export_logs` table has data
2. Check time range in aggregation query
3. Ensure logs are not empty

---

## 📊 Key Metrics

### Success Metrics
- ✅ Export success rate > 95%
- ✅ Average duration < 3000ms
- ✅ Failure rate < 10%
- ✅ File cleanup success rate > 99%

### Alert Thresholds
- 🚨 Failure rate > 10% (immediate alert)
- ⚠️ Average duration > 5000ms (warning)
- ⚠️ Export volume > 1000/hour (capacity alert)

---

## 🔗 Related Files

- **Export Service**: `src/lib/export-service.ts`
- **Export API**: `src/app/api/export/conversations/route.ts`
- **Performance Monitoring**: `src/lib/cron/performance-monitoring.ts`

---

## 📞 Support

For issues or questions:
1. Check test output for error details
2. Review Vercel logs for cron execution
3. Verify environment variables are set
4. Check Supabase connection and permissions

---

## ✅ Completion Checklist

- [x] Export metrics collection implemented
- [x] File cleanup job scheduled
- [x] Log cleanup job scheduled
- [x] Cron endpoints created and secured
- [x] Test scripts created and validated
- [x] Documentation complete
- [x] Ready for production deployment

