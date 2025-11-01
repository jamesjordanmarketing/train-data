/**
 * API Route: Export Configuration Change History as CSV
 * 
 * POST /api/config/export-csv
 * 
 * Exports configuration change history as CSV file for compliance reporting.
 * Applies filters from request body.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { configRollbackService } from '@/lib/services/config-rollback-service';
import { ChangeHistoryFilters } from '@/lib/types/config-change-management';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const filters: ChangeHistoryFilters = await request.json();
    
    // Validate config type if provided
    if (filters.configType && !['user_preference', 'ai_config'].includes(filters.configType)) {
      return NextResponse.json(
        { error: 'Invalid configType. Must be "user_preference" or "ai_config"' },
        { status: 400 }
      );
    }
    
    // Validate date formats if provided
    if (filters.startDate && isNaN(Date.parse(filters.startDate))) {
      return NextResponse.json(
        { error: 'Invalid startDate format. Use ISO 8601 format' },
        { status: 400 }
      );
    }
    
    if (filters.endDate && isNaN(Date.parse(filters.endDate))) {
      return NextResponse.json(
        { error: 'Invalid endDate format. Use ISO 8601 format' },
        { status: 400 }
      );
    }
    
    const csvContent = await configRollbackService.exportChangeHistoryCSV(filters);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `config-change-history-${timestamp}.csv`;
    
    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error exporting change history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export change history',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

