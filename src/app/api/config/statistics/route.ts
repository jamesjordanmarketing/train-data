/**
 * API Route: Configuration Change Statistics
 * 
 * GET /api/config/statistics
 * 
 * Retrieves aggregated statistics about configuration changes.
 * Useful for analytics, dashboards, and compliance reporting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { configRollbackService } from '@/lib/services/config-rollback-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    
    // Validate date formats if provided
    if (startDate && isNaN(Date.parse(startDate))) {
      return NextResponse.json(
        { error: 'Invalid startDate format. Use ISO 8601 format' },
        { status: 400 }
      );
    }
    
    if (endDate && isNaN(Date.parse(endDate))) {
      return NextResponse.json(
        { error: 'Invalid endDate format. Use ISO 8601 format' },
        { status: 400 }
      );
    }
    
    const statistics = await configRollbackService.getChangeStatistics(startDate, endDate);
    
    return NextResponse.json({ statistics });
  } catch (error) {
    console.error('Error fetching change statistics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

