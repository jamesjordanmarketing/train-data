import { NextResponse } from 'next/server';
import { queryPerformanceService } from '@/lib/services/query-performance-service';
import { indexMonitoringService } from '@/lib/services/index-monitoring-service';
import { bloatMonitoringService } from '@/lib/services/bloat-monitoring-service';

/**
 * Performance Metrics API
 * 
 * GET /api/performance?metric=summary
 * GET /api/performance?metric=slow_queries&hours=24
 * GET /api/performance?metric=bloat&threshold=20
 * 
 * Provides real-time access to database performance metrics including:
 * - Query performance statistics
 * - Slow query analysis
 * - Table bloat status
 * - Unused index detection
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'summary';

    switch (metric) {
      case 'summary':
        const endDate = new Date();
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - 24);

        const [queryStats, bloatStatus, unusedIndexes] = await Promise.all([
          queryPerformanceService.getQueryStats(startDate, endDate),
          bloatMonitoringService.getBloatStatus(),
          indexMonitoringService.detectUnusedIndexes(),
        ]);

        return NextResponse.json({
          query_performance: queryStats,
          table_bloat: bloatStatus,
          unused_indexes: unusedIndexes,
          generated_at: new Date().toISOString(),
        });

      case 'slow_queries':
        const hours = parseInt(searchParams.get('hours') || '24');
        const slowQueries = await queryPerformanceService.getSlowQueries(hours);
        return NextResponse.json({ slow_queries: slowQueries });

      case 'bloat':
        const threshold = parseInt(searchParams.get('threshold') || '20');
        const highBloat = await bloatMonitoringService.getHighBloatTables(threshold);
        return NextResponse.json({ high_bloat_tables: highBloat });

      default:
        return NextResponse.json({ error: 'Invalid metric type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance metrics' },
      { status: 500 }
    );
  }
}

