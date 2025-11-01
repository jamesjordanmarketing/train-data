/**
 * Database Health API Routes
 * 
 * GET /api/database/health - Retrieve database health metrics
 * Query parameters:
 *   - type: 'full' | 'overview' | 'tables' | 'indexes' | 'queries' | 'connections'
 *   - limit: number (for queries type)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { databaseHealthService } from '@/lib/services/database-health-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameter for report type
    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('type') || 'full';
    
    if (reportType === 'overview') {
      const overview = await databaseHealthService.getDatabaseOverview();
      return NextResponse.json({ overview });
    }
    
    if (reportType === 'tables') {
      const tables = await databaseHealthService.getTableHealthMetrics();
      return NextResponse.json({ tables });
    }
    
    if (reportType === 'indexes') {
      const indexes = await databaseHealthService.getIndexHealthMetrics();
      return NextResponse.json({ indexes });
    }
    
    if (reportType === 'queries') {
      const limit = parseInt(searchParams.get('limit') || '20');
      const slowQueries = await databaseHealthService.getSlowQueries(limit);
      return NextResponse.json({ slowQueries });
    }
    
    if (reportType === 'connections') {
      const connectionPool = await databaseHealthService.getConnectionPoolMetrics();
      return NextResponse.json({ connectionPool });
    }
    
    // Default: full health report
    const report = await databaseHealthService.getHealthReport();
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error fetching database health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database health metrics' },
      { status: 500 }
    );
  }
}

