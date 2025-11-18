/**
 * Export History API Endpoint
 * 
 * GET /api/export/history
 * 
 * Returns a paginated list of export operations for the authenticated user
 * Supports filtering by format and status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ExportService } from '@/lib/export-service';
import { ExportHistoryQuerySchema } from '@/lib/validations/export-schemas';

/**
 * GET /api/export/history
 * 
 * Query Parameters:
 * - format?: 'json' | 'jsonl' | 'csv' | 'markdown' (optional filter)
 * - status?: 'queued' | 'processing' | 'completed' | 'failed' | 'expired' (optional filter)
 * - page?: number (default: 1)
 * - limit?: number (default: 25, max: 100)
 * 
 * Response:
 * {
 *   exports: ExportLog[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number,
 *     hasNext: boolean,
 *     hasPrev: boolean
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      format: searchParams.get('format') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '25',
    };
    
    const validated = ExportHistoryQuerySchema.parse(queryParams);
    const { format, status, page, limit } = validated;
    
    // Create Supabase client and export service
    const supabase = await createServerSupabaseClient();
    const exportService = new ExportService(supabase);
    
    // Get authenticated user
    // TODO: Replace with actual auth when available
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000';
    
    // Build filter object
    const filters: any = {};
    if (format) {
      filters.format = format;
    }
    if (status) {
      filters.status = status;
    }
    
    // Fetch exports with pagination
    const { logs, total } = await exportService.listExportLogs(
      userId,
      filters,
      {
        page,
        limit,
      }
    );
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    // Enhance export logs with additional info
    const enhancedLogs = logs.map((log: any) => {
      // Extract filename from file_url if available
      let filename: string | undefined;
      if (log.file_url) {
        const urlParts = log.file_url.split('/');
        filename = urlParts[urlParts.length - 1];
      }
      
      // Add user-friendly status message
      let statusMessage: string;
      switch (log.status) {
        case 'queued':
          statusMessage = 'Queued for processing';
          break;
        case 'processing':
          statusMessage = 'Processing...';
          break;
        case 'completed':
          statusMessage = 'Ready to download';
          break;
        case 'failed':
          statusMessage = 'Failed';
          break;
        case 'expired':
          statusMessage = 'Expired';
          break;
        default:
          statusMessage = log.status;
      }
      
      // Check if export is still downloadable
      const isDownloadable = log.status === 'completed' && 
        (!log.expires_at || new Date(log.expires_at) > new Date());
      
      return {
        export_id: log.export_id,
        format: log.format,
        status: log.status,
        statusMessage,
        conversation_count: log.conversation_count,
        file_size: log.file_size,
        file_url: log.file_url,
        filename,
        created_at: log.created_at,
        expires_at: log.expires_at,
        error_message: log.error_message,
        isDownloadable,
        config: {
          scope: log.config.scope,
          includeMetadata: log.config.includeMetadata,
          includeQualityScores: log.config.includeQualityScores,
        },
      };
    });
    
    // Return paginated response
    return NextResponse.json({
      exports: enhancedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
    
  } catch (error) {
    console.error('Error in GET /api/export/history:', error);
    
    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: 'Invalid query parameters', 
          details: error 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Failed to fetch export history' 
      },
      { status: 500 }
    );
  }
}

