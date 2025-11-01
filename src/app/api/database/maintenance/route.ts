/**
 * Database Maintenance API Routes
 * 
 * POST /api/database/maintenance - Execute maintenance operation
 * Body: MaintenanceOperationOptions
 * 
 * GET /api/database/maintenance - Get maintenance operation history
 * Query parameters:
 *   - type: 'history' | 'running'
 *   - limit: number (for history type)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { databaseMaintenanceService } from '@/lib/services/database-maintenance-service';
import { MaintenanceOperationOptions } from '@/lib/types/database-health';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const options: MaintenanceOperationOptions = await request.json();
    
    // Validate operation type
    if (!['VACUUM', 'VACUUM FULL', 'ANALYZE', 'REINDEX'].includes(options.operationType)) {
      return NextResponse.json(
        { error: 'Invalid operation type' },
        { status: 400 }
      );
    }
    
    // Execute appropriate operation
    let result;
    if (options.operationType === 'VACUUM' || options.operationType === 'VACUUM FULL') {
      result = await databaseMaintenanceService.executeVacuum(options, user.id);
    } else if (options.operationType === 'ANALYZE') {
      result = await databaseMaintenanceService.executeAnalyze(options, user.id);
    } else if (options.operationType === 'REINDEX') {
      result = await databaseMaintenanceService.executeReindex(options, user.id);
    }
    
    return NextResponse.json({ operation: result });
  } catch (error) {
    console.error('Error executing maintenance operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute maintenance operation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'history';
    
    if (type === 'running') {
      const operations = await databaseMaintenanceService.getRunningOperations();
      return NextResponse.json({ operations });
    }
    
    // Default: operation history
    const limit = parseInt(searchParams.get('limit') || '50');
    const history = await databaseMaintenanceService.getOperationHistory(limit);
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching maintenance operations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance operations' },
      { status: 500 }
    );
  }
}

