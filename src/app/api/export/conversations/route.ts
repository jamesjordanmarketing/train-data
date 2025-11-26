/**
 * Export Conversations API Endpoint
 * 
 * POST /api/export/conversations
 * 
 * Exports conversations in specified format (JSONL, JSON, CSV, Markdown)
 * Supports filtering, selection, and background processing for large exports
 * 
 * Features:
 * - Synchronous processing for <500 conversations
 * - Background job creation for ≥500 conversations
 * - Comprehensive filtering (tier, status, quality, date range)
 * - Export audit trail with user attribution
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ExportService } from '@/lib/export-service';
import { getTransformer } from '@/lib/export-transformers';
import { ExportRequestSchema } from '@/lib/validations/export-schemas';
import { Conversation, ConversationTurn, FilterConfig, ExportConfig } from '@/lib/types';
import { SupabaseClient } from '@supabase/supabase-js';

const SYNC_THRESHOLD = 500; // Process synchronously if < 500 conversations
const EXPORT_EXPIRY_HOURS = 24; // Files expire after 24 hours

/**
 * POST /api/export/conversations
 * 
 * Request Body:
 * {
 *   config: ExportConfig,
 *   conversationIds?: string[], // For scope: 'selected'
 *   filters?: FilterConfig // For scope: 'filtered'
 * }
 * 
 * Response (Synchronous <500):
 * {
 *   export_id: string,
 *   status: 'completed',
 *   conversation_count: number,
 *   file_size: number,
 *   file_url: string,
 *   expires_at: string
 * }
 * 
 * Response (Background ≥500):
 * {
 *   export_id: string,
 *   status: 'queued',
 *   conversation_count: number,
 *   message: 'Export queued for background processing'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = ExportRequestSchema.parse(body);
    
    const { config, conversationIds, filters } = validated;
    
    // Create Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    // TODO: Replace with actual auth when available
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000';
    
    // Step 1: Apply scope filters and fetch conversations
    let conversationQuery = supabase
      .from('conversations')
      .select('*');
    
    switch (config.scope) {
      case 'selected':
        if (!conversationIds || conversationIds.length === 0) {
          return NextResponse.json(
            { error: 'conversationIds required for scope: selected' },
            { status: 400 }
          );
        }
        conversationQuery = conversationQuery.in('id', conversationIds);
        break;
        
      case 'filtered':
        conversationQuery = applyFilters(conversationQuery, filters);
        break;
        
      case 'all':
        // Only export approved conversations by default
        conversationQuery = conversationQuery.eq('status', 'approved');
        break;
    }
    
    // Fetch conversations
    const { data: conversations, error: conversationError } = await conversationQuery;
    
    if (conversationError) {
      console.error('Error fetching conversations:', conversationError);
      return NextResponse.json(
        { error: 'Failed to fetch conversations', details: conversationError.message },
        { status: 500 }
      );
    }
    
    if (!conversations || conversations.length === 0) {
      return NextResponse.json(
        { error: 'No conversations found matching the criteria' },
        { status: 404 }
      );
    }
    
    const conversationCount = conversations.length;
    
    // Step 2: Determine processing mode
    if (conversationCount >= SYNC_THRESHOLD) {
      // Background processing
      return await handleBackgroundExport(
        supabase,
        userId,
        config,
        conversationCount,
        conversationIds,
        filters
      );
    }
    
    // Step 3: Synchronous processing - Fetch conversation turns
    const conversationIdsToFetch = conversations.map((c: any) => c.id);
    const { data: turns, error: turnsError } = await supabase
      .from('conversation_turns')
      .select('*')
      .in('conversation_id', conversationIdsToFetch)
      .order('turn_number', { ascending: true });
    
    if (turnsError) {
      console.error('Error fetching turns:', turnsError);
      return NextResponse.json(
        { error: 'Failed to fetch conversation turns', details: turnsError.message },
        { status: 500 }
      );
    }
    
    // Step 4: Organize turns by conversation
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
    
    // Step 5: Transform data using appropriate transformer
    const transformer = getTransformer(config.format);
    const transformedData = await transformer.transform(
      conversations as Conversation[],
      turnsMap,
      config
    );
    
    // Step 6: Generate filename
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const tierLabel = config.scope === 'all' ? 'all' : config.scope;
    const extension = transformer.getFileExtension();
    const filename = `training-data-${tierLabel}-${timestamp}-${conversationCount}.${extension}`;
    
    // Step 7: Calculate file size
    const fileSize = Buffer.byteLength(transformedData, 'utf8');
    
    // Step 8: Store file (for now, we'll use a mock URL - in production, upload to Supabase Storage)
    const fileUrl = await storeExportFile(supabase, filename, transformedData, transformer.getMimeType());
    
    // Step 9: Create export log
    const exportService = new ExportService(supabase);
    const expiresAt = new Date(Date.now() + EXPORT_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    
    const exportLog = await exportService.createExportLog({
      user_id: userId,
      format: config.format,
      config: config,
      conversation_count: conversationCount,
      status: 'completed',
    });
    
    // Update with file details
    await exportService.updateExportLog(exportLog.export_id, {
      status: 'completed',
      file_size: fileSize,
      file_url: fileUrl,
      expires_at: expiresAt,
    });
    
    // Step 10: Return success response
    return NextResponse.json({
      export_id: exportLog.export_id,
      status: 'completed',
      conversation_count: conversationCount,
      file_size: fileSize,
      file_url: fileUrl,
      filename: filename,
      expires_at: expiresAt,
      format: config.format,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/export/conversations:', error);
    
    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: 'Invalid request body', 
          details: error 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Failed to export conversations' 
      },
      { status: 500 }
    );
  }
}

/**
 * Apply filters to conversation query based on FilterConfig
 */
function applyFilters(query: any, filters?: FilterConfig): any {
  if (!filters) {
    return query.eq('status', 'approved'); // Default to approved only
  }
  
  if (filters.tier && filters.tier.length > 0) {
    query = query.in('tier', filters.tier);
  }
  
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }
  
  if (filters.qualityScoreMin !== undefined) {
    query = query.gte('quality_score', filters.qualityScoreMin);
  }
  
  if (filters.qualityScoreMax !== undefined) {
    query = query.lte('quality_score', filters.qualityScoreMax);
  }
  
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }
  
  if (filters.categories && filters.categories.length > 0) {
    // PostgreSQL array overlap operator
    query = query.overlaps('category', filters.categories);
  }
  
  if (filters.searchQuery) {
    // Full-text search on title and topic
    query = query.or(`title.ilike.%${filters.searchQuery}%,topic.ilike.%${filters.searchQuery}%`);
  }
  
  return query;
}

/**
 * Handle background export processing for large datasets (≥500 conversations)
 */
async function handleBackgroundExport(
  supabase: SupabaseClient,
  userId: string,
  config: ExportConfig,
  conversationCount: number,
  _conversationIds?: string[],
  _filters?: FilterConfig
): Promise<NextResponse> {
  const exportService = new ExportService(supabase);
  
  // Create export log with 'queued' status
  const exportLog = await exportService.createExportLog({
    user_id: userId,
    format: config.format,
    config: config,
    conversation_count: conversationCount,
    status: 'queued',
  });
  
  // TODO: Create batch job in batch_jobs table
  // For now, we'll mark it as queued and return
  // In production, this would trigger a background worker
  
  console.log(`Background export queued: ${exportLog.export_id} (${conversationCount} conversations)`);
  
  return NextResponse.json({
    export_id: exportLog.export_id,
    status: 'queued',
    conversation_count: conversationCount,
    message: 'Export queued for background processing. Check status at /api/export/status/' + exportLog.export_id,
  }, { status: 202 }); // 202 Accepted
}

/**
 * Store export file to Supabase Storage (or file system for development)
 * Returns URL to download the file
 */
async function storeExportFile(
  _supabase: SupabaseClient,
  filename: string,
  _content: string,
  _mimeType: string
): Promise<string> {
  try {
    // In production, upload to Supabase Storage
    // For now, we'll create a mock URL
    // 
    // const { data, error } = await supabase.storage
    //   .from('exports')
    //   .upload(`${userId}/${filename}`, content, {
    //     contentType: mimeType,
    //     upsert: false,
    //   });
    //
    // if (error) throw error;
    // 
    // const { data: urlData } = supabase.storage
    //   .from('exports')
    //   .getPublicUrl(`${userId}/${filename}`);
    // 
    // return urlData.publicUrl;
    
    // Mock implementation: Return a placeholder URL
    // In development, the download endpoint will generate the file on-demand
    return `/api/export/download/${filename}`;
    
  } catch (error) {
    console.error('Error storing export file:', error);
    throw new Error('Failed to store export file');
  }
}

