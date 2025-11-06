/**
 * Export Status API Endpoint
 * 
 * GET /api/export/status/[id]
 * 
 * Returns the current status of an export operation, including:
 * - Export status (queued, processing, completed, failed, expired)
 * - Progress percentage for background jobs
 * - File details when completed
 * - Error messages when failed
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ExportService, ExportNotFoundError, ExportPermissionError } from '@/lib/export-service';

/**
 * GET /api/export/status/[id]
 * 
 * Path Parameters:
 * - id: export_id (UUID)
 * 
 * Response:
 * {
 *   export_id: string,
 *   status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired',
 *   progress?: number, // 0-100 for background jobs
 *   conversation_count: number,
 *   file_size?: number,
 *   file_url?: string,
 *   filename?: string,
 *   format: string,
 *   error_message?: string,
 *   created_at: string,
 *   expires_at?: string
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: exportId } = params;
    
    if (!exportId) {
      return NextResponse.json(
        { error: 'Export ID is required' },
        { status: 400 }
      );
    }
    
    // Create Supabase client and export service
    const supabase = createServerSupabaseClient();
    const exportService = new ExportService(supabase);
    
    // Get authenticated user
    // TODO: Replace with actual auth when available
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000';
    
    // Fetch export log
    const exportLog = await exportService.getExportLog(exportId);
    
    if (!exportLog) {
      return NextResponse.json(
        { error: 'Export not found', export_id: exportId },
        { status: 404 }
      );
    }
    
    // Verify user owns this export (RLS check)
    if (exportLog.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied', message: 'You do not have permission to access this export' },
        { status: 403 }
      );
    }
    
    // Check if export has expired
    if (exportLog.status === 'completed' && exportLog.expires_at) {
      const expiryDate = new Date(exportLog.expires_at);
      const now = new Date();
      
      if (now > expiryDate) {
        // Mark as expired
        await exportService.updateExportLog(exportId, { status: 'expired' });
        (exportLog as any).status = 'expired';
      }
    }
    
    // Calculate progress for background jobs
    let progress: number | undefined;
    if (exportLog.status === 'processing' || exportLog.status === 'queued') {
      // Check if there's an associated batch job
      const { data: batchJob } = await supabase
        .from('batch_jobs')
        .select('*')
        .eq('export_id', exportId)
        .single();
      
      if (batchJob) {
        progress = batchJob.completed_items && batchJob.total_items
          ? Math.round((batchJob.completed_items / batchJob.total_items) * 100)
          : 0;
      }
    }
    
    // Extract filename from file_url if available
    let filename: string | undefined;
    if (exportLog.file_url) {
      const urlParts = exportLog.file_url.split('/');
      filename = urlParts[urlParts.length - 1];
    }
    
    // Build response
    const response: any = {
      export_id: exportLog.export_id,
      status: exportLog.status,
      conversation_count: exportLog.conversation_count,
      format: exportLog.format,
      created_at: exportLog.created_at,
    };
    
    if (progress !== undefined) {
      response.progress = progress;
    }
    
    if (exportLog.file_size) {
      response.file_size = exportLog.file_size;
    }
    
    if (exportLog.file_url) {
      response.file_url = exportLog.file_url;
      response.filename = filename;
    }
    
    if (exportLog.expires_at) {
      response.expires_at = exportLog.expires_at;
    }
    
    if (exportLog.error_message) {
      response.error_message = exportLog.error_message;
    }
    
    // Add helpful message based on status
    switch (exportLog.status) {
      case 'queued':
        response.message = 'Export is queued for processing';
        break;
      case 'processing':
        response.message = `Export is being processed (${progress || 0}% complete)`;
        break;
      case 'completed':
        response.message = 'Export completed successfully. Download available.';
        break;
      case 'failed':
        response.message = 'Export failed. See error_message for details.';
        break;
      case 'expired':
        response.message = 'Export has expired. Please create a new export.';
        break;
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in GET /api/export/status/[id]:', error);
    
    if (error instanceof ExportNotFoundError) {
      return NextResponse.json(
        { error: 'Export not found', message: error.message },
        { status: 404 }
      );
    }
    
    if (error instanceof ExportPermissionError) {
      return NextResponse.json(
        { error: 'Access denied', message: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Failed to get export status' 
      },
      { status: 500 }
    );
  }
}

