/**
 * Database Alerts API Routes
 * 
 * GET /api/database/alerts - Get active alerts
 * 
 * PATCH /api/database/alerts - Acknowledge or resolve alert
 * Body: { alertId: string, action: 'acknowledge' | 'resolve' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { databaseHealthService } from '@/lib/services/database-health-service';

export async function GET(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const alerts = await databaseHealthService.getActiveAlerts();
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching database alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { alertId, action } = await request.json();
    
    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'alertId and action are required' },
        { status: 400 }
      );
    }
    
    if (action === 'acknowledge') {
      await databaseHealthService.acknowledgeAlert(alertId, user.id);
    } else if (action === 'resolve') {
      await databaseHealthService.resolveAlert(alertId);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "acknowledge" or "resolve"' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

