/**
 * Export File Cleanup Cron Endpoint
 * 
 * GET /api/cron/export-file-cleanup
 * 
 * Scheduled endpoint for deleting expired export files.
 * Called by Vercel Cron daily at 2am UTC.
 * 
 * Security:
 * - Requires CRON_SECRET in Authorization header
 * - Only accessible via cron trigger or authorized requests
 * 
 * Schedule: 0 2 * * * (Daily at 2am UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportFileCleanup } from '@/lib/cron/export-file-cleanup';

/**
 * GET /api/cron/export-file-cleanup
 * 
 * Executes the export file cleanup job.
 * 
 * Headers:
 * - Authorization: Bearer <CRON_SECRET>
 * 
 * Response:
 * {
 *   success: true,
 *   result: CleanupResult,
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

    console.log('[Cron] Starting export file cleanup job...');

    // Execute cleanup
    const result = await exportFileCleanup();

    // Return success response
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('[Cron] Export file cleanup job failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

