import { NextResponse } from 'next/server';
import { dailyMaintenance } from '@/lib/cron/performance-monitoring';

/**
 * Daily Maintenance Cron Endpoint
 * 
 * Triggers daily database maintenance tasks including:
 * - Unused index detection
 * - High bloat table identification
 * - Performance report generation
 * 
 * Configure in vercel.json:
 * ```json
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-maintenance",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 * ```
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dailyMaintenance();
    return NextResponse.json({ 
      success: true, 
      message: 'Daily maintenance completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Daily maintenance failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Daily maintenance failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

