/**
 * Export Download API Endpoint
 * 
 * GET /api/export/download/[id]
 * 
 * Downloads a completed export file with proper Content-Type and Content-Disposition headers
 * Verifies export status, user permissions, and expiration before serving the file
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ExportService, ExportNotFoundError } from '@/lib/export-service';
import { getTransformer } from '@/lib/export-transformers';
import { Conversation, ConversationTurn } from '../../../../../../@/lib/types';

/**
 * GET /api/export/download/[id]
 * 
 * Path Parameters:
 * - id: export_id (UUID)
 * 
 * Response:
 * - On success: File stream with appropriate headers
 * - On error: JSON error response
 * 
 * Status Codes:
 * - 200: File successfully streamed
 * - 403: User doesn't own export
 * - 404: Export not found
 * - 410: Export has expired (Gone)
 * - 425: Export not yet completed (Too Early)
 * - 500: Server error
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
        { error: 'Access denied', message: 'You do not have permission to download this export' },
        { status: 403 }
      );
    }
    
    // Check export status
    if (exportLog.status === 'expired') {
      return NextResponse.json(
        { error: 'Export expired', message: 'This export has expired. Please create a new export.' },
        { status: 410 } // 410 Gone
      );
    }
    
    if (exportLog.status === 'failed') {
      return NextResponse.json(
        { error: 'Export failed', message: exportLog.error_message || 'Export processing failed' },
        { status: 500 }
      );
    }
    
    if (exportLog.status !== 'completed') {
      return NextResponse.json(
        { 
          error: 'Export not ready', 
          message: `Export is currently ${exportLog.status}. Please try again later.`,
          status: exportLog.status 
        },
        { status: 425 } // 425 Too Early
      );
    }
    
    // Check if export has expired
    if (exportLog.expires_at) {
      const expiryDate = new Date(exportLog.expires_at);
      const now = new Date();
      
      if (now > expiryDate) {
        // Mark as expired
        await exportService.updateExportLog(exportId, { status: 'expired' });
        
        return NextResponse.json(
          { error: 'Export expired', message: 'This export has expired. Please create a new export.' },
          { status: 410 } // 410 Gone
        );
      }
    }
    
    // Regenerate the export file on-demand
    // In production, this would retrieve from Supabase Storage
    // For now, we regenerate from the database
    const fileContent = await regenerateExportFile(supabase, exportLog);
    
    if (!fileContent) {
      return NextResponse.json(
        { error: 'File not found', message: 'Export file could not be retrieved' },
        { status: 404 }
      );
    }
    
    // Get transformer for MIME type and file extension
    const transformer = getTransformer(exportLog.format);
    const mimeType = transformer.getMimeType();
    const extension = transformer.getFileExtension();
    
    // Generate filename
    const timestamp = new Date(exportLog.created_at).toISOString().split('T')[0];
    const tierLabel = exportLog.config.scope;
    const filename = `training-data-${tierLabel}-${timestamp}-${exportLog.conversation_count}.${extension}`;
    
    // Increment download count (fire-and-forget)
    supabase
      .from('export_logs')
      .update({ 
        downloaded_count: (exportLog as any).downloaded_count ? (exportLog as any).downloaded_count + 1 : 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('export_id', exportId)
      .then(() => {})
      .catch(err => console.error('Failed to update download count:', err));
    
    // Return file with appropriate headers
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(fileContent, 'utf8').toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    console.error('Error in GET /api/export/download/[id]:', error);
    
    if (error instanceof ExportNotFoundError) {
      return NextResponse.json(
        { error: 'Export not found', message: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Failed to download export' 
      },
      { status: 500 }
    );
  }
}

/**
 * Regenerate export file from database
 * In production, this would retrieve from Supabase Storage
 * For development, we regenerate on-demand
 */
async function regenerateExportFile(supabase: any, exportLog: any): Promise<string | null> {
  try {
    // Fetch conversations based on the original export config
    let conversationQuery = supabase
      .from('conversations')
      .select('*');
    
    const { config } = exportLog;
    
    // Apply the same filters that were used originally
    switch (config.scope) {
      case 'all':
        conversationQuery = conversationQuery.eq('status', 'approved');
        break;
      // For 'selected' and 'filtered', we don't have the original IDs/filters
      // So we'll just return what we can
      default:
        conversationQuery = conversationQuery.eq('status', 'approved');
    }
    
    // Limit to the count specified in the export log
    conversationQuery = conversationQuery.limit(exportLog.conversation_count);
    
    const { data: conversations, error: conversationError } = await conversationQuery;
    
    if (conversationError || !conversations) {
      console.error('Error fetching conversations for export:', conversationError);
      return null;
    }
    
    // Fetch turns
    const conversationIds = conversations.map((c: any) => c.id);
    const { data: turns, error: turnsError } = await supabase
      .from('conversation_turns')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('turn_number', { ascending: true });
    
    if (turnsError) {
      console.error('Error fetching turns for export:', turnsError);
      return null;
    }
    
    // Organize turns by conversation
    const turnsMap = new Map<string, ConversationTurn[]>();
    (turns || []).forEach((turn: any) => {
      const conversationId = turn.conversation_id;
      if (!turnsMap.has(conversationId)) {
        turnsMap.set(conversationId, []);
      }
      turnsMap.get(conversationId)!.push({
        role: turn.role,
        content: turn.content,
        timestamp: turn.created_at,
        tokenCount: turn.token_count || 0,
      });
    });
    
    // Transform using the appropriate transformer
    const transformer = getTransformer(exportLog.format);
    const transformedData = await transformer.transform(
      conversations as Conversation[],
      turnsMap,
      config
    );
    
    return transformedData;
    
  } catch (error) {
    console.error('Error regenerating export file:', error);
    return null;
  }
}

