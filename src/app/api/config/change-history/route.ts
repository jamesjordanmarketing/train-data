/**
 * API Route: Configuration Change History
 * 
 * GET /api/config/change-history
 * 
 * Retrieves configuration change history with pagination and filtering.
 * Supports both simple queries (specific config) and advanced filtering.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { configRollbackService } from '@/lib/services/config-rollback-service';
import { ChangeHistoryFilters, ConfigType } from '@/lib/types/config-change-management';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, pageSize must be 1-100' },
        { status: 400 }
      );
    }
    
    // Get filter parameters
    const configType = searchParams.get('configType') as ConfigType | null;
    const configId = searchParams.get('configId');
    
    // Validate config type if provided
    if (configType && !['user_preference', 'ai_config'].includes(configType)) {
      return NextResponse.json(
        { error: 'Invalid configType. Must be "user_preference" or "ai_config"' },
        { status: 400 }
      );
    }
    
    // Simple query: get history for specific config
    if (configType && configId) {
      const history = await configRollbackService.getChangeHistory(
        configType,
        configId,
        page,
        pageSize
      );
      return NextResponse.json({ history });
    }
    
    // Advanced query: with filters
    const filters: ChangeHistoryFilters = {
      configType: configType || undefined,
      changedBy: searchParams.get('changedBy') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      searchText: searchParams.get('searchText') || undefined,
    };
    
    const history = await configRollbackService.getFilteredChangeHistory(
      filters,
      page,
      pageSize
    );
    
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching change history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch change history',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

