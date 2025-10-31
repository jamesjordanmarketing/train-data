/**
 * Export Log Cleanup Cron Endpoint
 * 
 * GET /api/cron/export-log-cleanup
 * 
 * Scheduled endpoint for deleting old export logs.
 * Called by Vercel Cron monthly on the first day at 3am UTC.
 * 
 * Security:
 * - Requires CRON_SECRET in Authorization header
 * - Only accessible via cron trigger or authorized requests
 * 
 * Schedule: 0 3 1 * * (Monthly on 1st at 3am UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportLogCleanup } from '@/lib/cron/export-log-cleanup';

/**
 * GET /api/cron/export-log-cleanup
 * 
 * Executes the export log cleanup job.
 * 
 * Headers:
 * - Authorization: Bearer <CRON_SECRET>
 * 
 * Response:
 * {
 *   success: true,
 *   result: LogCleanupResult,
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

    console.log('[Cron] Starting export log cleanup job...');

    // Execute cleanup
    const result = await exportLogCleanup();

    // Return success response
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('[Cron] Export log cleanup job failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

