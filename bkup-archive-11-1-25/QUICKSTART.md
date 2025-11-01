# Performance Monitoring - Quick Start Guide

Get the database performance monitoring system up and running in 5 minutes.

## Step 1: Set Environment Variable

Add to your `.env.local`:
```bash
CRON_SECRET=your-random-secret-here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

## Step 2: Verify Database Schema

Ensure these tables exist in your Supabase database:
- `query_performance_logs`
- `index_usage_snapshots`
- `table_bloat_snapshots`
- `performance_alerts`

And these functions:
- `capture_index_usage_snapshot()`
- `detect_unused_indexes(age_days INT)`
- `capture_table_bloat_snapshot()`
- `get_slow_queries(hours_back INT, min_duration_ms INT)`
- `create_performance_alert(...)`
- `check_table_bloat_alerts()`

## Step 3: Test the Services

Run the test suite:
```bash
npm install -D tsx
npx tsx src/lib/services/__tests__/performance-services.test.ts
```

## Step 4: Test API Endpoints

```bash
# Start your dev server
npm run dev

# Test performance dashboard
curl http://localhost:3000/api/performance?metric=summary

# Test cron endpoints (use your actual CRON_SECRET)
curl -H "Authorization: Bearer your-cron-secret" \
     http://localhost:3000/api/cron/hourly-monitoring

curl -H "Authorization: Bearer your-cron-secret" \
     http://localhost:3000/api/cron/daily-maintenance
```

## Step 5: Deploy to Production

1. **Add environment variable to Vercel:**
   ```bash
   vercel env add CRON_SECRET production
   ```
   Paste your generated secret when prompted.

2. **Deploy:**
   ```bash
   git add .
   git commit -m "Add database performance monitoring"
   git push
   ```

3. **Verify cron jobs:**
   - Go to Vercel Dashboard → Your Project → Settings → Cron
   - You should see two cron jobs listed
   - Check logs after first execution

## Step 6: Integrate with Your Code

Add query logging to any service method:

```typescript
import { withQueryLogging } from '@/lib/middleware/query-logger';

async myServiceMethod(params: any) {
  return withQueryLogging(
    async () => {
      // Your existing database query
      const { data } = await supabase
        .from('your_table')
        .select('*')
        .eq('status', params.status);
      return data;
    },
    {
      queryName: 'service.methodName',
      endpoint: '/api/your-endpoint',
      parameters: params
    }
  );
}
```

## Daily Usage

### View Performance Dashboard
```bash
curl http://localhost:3000/api/performance?metric=summary | jq
```

### Check Slow Queries
```bash
curl http://localhost:3000/api/performance?metric=slow_queries&hours=24 | jq
```

### Check Table Bloat
```bash
curl http://localhost:3000/api/performance?metric=bloat&threshold=20 | jq
```

## Monitoring Schedule

| Task | Frequency | What It Does |
|------|-----------|--------------|
| Hourly Monitoring | Every hour | Captures index/bloat snapshots |
| Daily Maintenance | 2 AM daily | Detects unused indexes |
| Manual Review | Daily | Check performance dashboard |
| Deep Dive | Weekly | Analyze trends, optimize queries |

## Alert Thresholds

- **Slow Query**: >500ms → Automatic alert created
- **High Bloat**: >20% → Flagged in dashboard
- **Unused Index**: 30+ days → Listed in daily report

## Troubleshooting

### "Database function not found"
→ Verify all PostgreSQL functions are created in your database

### "Unauthorized" on cron endpoints
→ Check that CRON_SECRET matches in both .env.local and request header

### "No data appearing"
→ Run cron jobs manually first, then check database tables

### Cron jobs not running on Vercel
→ Ensure you're on a paid Vercel plan (Hobby or above)

## Next Steps

1. ✅ **Week 1**: Establish baseline metrics
2. ✅ **Week 2**: Adjust alert thresholds based on patterns
3. ✅ **Month 1**: Build visual dashboard
4. ✅ **Ongoing**: Use insights to optimize performance

## Full Documentation

- **Setup Guide**: `PERFORMANCE_MONITORING_SETUP.md`
- **Service Docs**: `src/lib/services/README.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`

## Support

Having issues? Check:
1. Database schema matches requirements
2. Environment variables are set correctly
3. Service role key has necessary permissions
4. Check logs in Vercel dashboard

---

**That's it! Your performance monitoring is now active.** 🚀

