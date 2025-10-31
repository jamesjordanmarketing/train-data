/**
 * Export Metrics Aggregation Cron Endpoint
 * 
 * GET /api/cron/export-metrics-aggregate
 * 
 * Scheduled endpoint for aggregating export metrics.
 * Called by Vercel Cron hourly to generate summary statistics.
 * 
 * Security:
 * - Requires CRON_SECRET in Authorization header
 * - Only accessible via cron trigger or authorized requests
 * 
 * Schedule: 0 * * * * (Hourly)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createExportMetricsService } from '@/lib/monitoring/export-metrics';

/**
 * GET /api/cron/export-metrics-aggregate
 * 
 * Aggregates export metrics for the past hour.
 * 
 * Headers:
 * - Authorization: Bearer <CRON_SECRET>
 * 
 * Response:
 * {
 *   success: true,
 *   metrics: AggregatedMetrics,
 *   failure_alert: object | null,
 *   timestamp: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
      console.warn('[Cron] CRON_SECRET not configured - skipping auth check');
    } else if (authHeader !== expectedAuth) {
      console.error('[Cron] Unauthorized cron request - invalid secret');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting export metrics aggregation...');

    // Create Supabase client and metrics service
    const supabase = createServerSupabaseClient();
    const metricsService = createExportMetricsService(supabase);

    // Aggregate metrics for the past hour
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 60 * 60 * 1000); // 1 hour ago

    const metrics = await metricsService.aggregateMetrics(startDate, endDate, 'hourly');

    // Check failure rate and potentially trigger alert
    const failureAlert = await metricsService.checkFailureRate(60);

    console.log('[Cron] Export metrics aggregation complete:', {
      total_exports: metrics.total_exports,
      success_rate: (metrics.success_rate * 100).toFixed(2) + '%',
      alert: failureAlert?.alert || false,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      metrics,
      failure_alert: failureAlert,
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('[Cron] Export metrics aggregation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

