/**
 * API Route: Batch Job Items
 * 
 * GET /api/conversations/batch/:id/items
 * Returns the batch items for a job, with optional filtering
 * 
 * Query Parameters:
 * - status: Filter by item status (completed, failed, queued, processing)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseAdminClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: jobId } = params;
    
    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job ID is required',
        },
        { status: 400 }
      );
    }
    
    // Get optional status filter from query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    
    const supabase = createServerSupabaseAdminClient();
    
    // Build query - using correct column names from batch_items schema:
    // batch_job_id (not job_id), position (not item_index), error (not error_message)
    let query = supabase
      .from('batch_items')
      .select('id, batch_job_id, position, status, conversation_id, error, created_at, updated_at')
      .eq('batch_job_id', jobId)
      .order('position', { ascending: true });
    
    // Apply status filter if provided
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    
    const { data: items, error } = await query;
    
    if (error) {
      console.error('[BatchItems] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch batch items' },
        { status: 500 }
      );
    }
    
    // Return items with summary
    // Note: batch_items uses 'queued' not 'pending'
    const summary = {
      total: items?.length || 0,
      completed: items?.filter(i => i.status === 'completed').length || 0,
      failed: items?.filter(i => i.status === 'failed').length || 0,
      queued: items?.filter(i => i.status === 'queued').length || 0,
      processing: items?.filter(i => i.status === 'processing').length || 0,
    };
    
    return NextResponse.json({
      success: true,
      jobId,
      summary,
      data: items || [],
    });
    
  } catch (error) {
    console.error('[BatchItems] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batch items' },
      { status: 500 }
    );
  }
}
