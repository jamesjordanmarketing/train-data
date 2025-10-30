import { queryPerformanceService } from '@/lib/services/query-performance-service';
import { indexMonitoringService } from '@/lib/services/index-monitoring-service';
import { bloatMonitoringService } from '@/lib/services/bloat-monitoring-service';

/**
 * Hourly performance monitoring job
 * 
 * This should be triggered by your deployment platform's cron system:
 * - Vercel Cron: Add to vercel.json
 * - AWS EventBridge: Create scheduled rule
 * - GitHub Actions: Use workflow schedule
 * 
 * Captures index usage snapshots and checks for performance issues.
 * 
 * @example
 * ```typescript
 * // In vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/hourly-monitoring",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 * 
 * // In /api/cron/hourly-monitoring/route.ts:
 * import { hourlyMonitoring } from '@/lib/cron/performance-monitoring';
 * 
 * export async function GET(request: Request) {
 *   const authHeader = request.headers.get('authorization');
 *   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 *   
 *   await hourlyMonitoring();
 *   return new Response('OK');
 * }
 * ```
 */
export async function hourlyMonitoring(): Promise<void> {
  console.log('[Cron] Starting hourly performance monitoring...');

  try {
    // Capture index usage snapshot
    const indexCount = await indexMonitoringService.captureSnapshot();
    console.log(`[Cron] Captured ${indexCount} index usage snapshots`);

    // Capture bloat snapshot
    const bloatCount = await bloatMonitoringService.captureSnapshot();
    console.log(`[Cron] Captured ${bloatCount} table bloat snapshots`);

    // Check for performance issues
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1);
    
    const queryStats = await queryPerformanceService.getQueryStats(startDate, endDate);
    
    if (queryStats.p95_duration_ms > 1000) {
      console.warn(`[Cron] P95 query duration (${queryStats.p95_duration_ms}ms) exceeds threshold (1000ms)`);
      // Alert would be automatically created by the service
    }

    console.log('[Cron] Hourly monitoring complete:', {
      queries: queryStats.total_queries,
      slow_queries: queryStats.slow_queries,
      avg_duration: queryStats.avg_duration_ms,
      p95_duration: queryStats.p95_duration_ms,
    });
  } catch (error) {
    console.error('[Cron] Hourly monitoring failed:', error);
  }
}

/**
 * Daily maintenance job
 * 
 * This should run during low-traffic hours (e.g., 2 AM UTC).
 * Performs more expensive analysis like unused index detection.
 * 
 * @example
 * ```typescript
 * // In vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-maintenance",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 * 
 * // In /api/cron/daily-maintenance/route.ts:
 * import { dailyMaintenance } from '@/lib/cron/performance-monitoring';
 * 
 * export async function GET(request: Request) {
 *   const authHeader = request.headers.get('authorization');
 *   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 *   
 *   await dailyMaintenance();
 *   return new Response('OK');
 * }
 * ```
 */
export async function dailyMaintenance(): Promise<void> {
  console.log('[Cron] Starting daily maintenance...');

  try {
    // Detect unused indexes
    const unusedIndexes = await indexMonitoringService.detectUnusedIndexes(30);
    console.log(`[Cron] Found ${unusedIndexes.length} unused indexes`);

    // Check for high bloat tables
    const highBloat = await bloatMonitoringService.getHighBloatTables(20);
    console.log(`[Cron] Found ${highBloat.length} tables with high bloat`);

    console.log('[Cron] Daily maintenance complete');
  } catch (error) {
    console.error('[Cron] Daily maintenance failed:', error);
  }
}

