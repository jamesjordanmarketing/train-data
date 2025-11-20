/**
 * API Route: Download enriched JSON
 * GET /api/conversations/[id]/download/enriched
 * 
 * Returns signed URL to download enriched JSON (with predetermined fields populated)
 * Only available when enrichment_status is 'enriched' or 'completed'
 * 
 * AUTHENTICATION PATTERN:
 * - User authentication checked at API boundary (security)
 * - Storage access via service layer with admin credentials (functionality)
 * - This bypasses RLS restrictions while maintaining security
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getConversationStorageService } from '@/lib/services/conversation-storage-service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    // Create Supabase client for authentication only
    const supabase = await createClient();

    // Authenticate user (security check at API boundary)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get conversation storage service (uses SERVICE_ROLE_KEY internally)
    const storageService = getConversationStorageService();

    // Get enriched response download URL using storage service
    // This uses admin credentials to bypass RLS restrictions
    try {
      const downloadInfo = await storageService.getEnrichedDownloadUrl(conversationId);

      return NextResponse.json({
        conversation_id: downloadInfo.conversation_id,
        download_url: downloadInfo.download_url,
        filename: downloadInfo.filename || `${conversationId}-enriched.json`,
        file_size: downloadInfo.file_size,
        enrichment_status: 'completed', // If we got here, enrichment is complete
        expires_at: downloadInfo.expires_at,
        expires_in_seconds: downloadInfo.expires_in_seconds
      });
    } catch (error) {
      // Handle specific error cases from storage service
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Conversation not found' },
            { status: 404 }
          );
        }
        if (error.message.includes('Enrichment not complete')) {
          return NextResponse.json(
            { 
              error: error.message,
              enrichment_status: 'not_completed'
            },
            { status: 400 }
          );
        }
        if (error.message.includes('No enriched file path')) {
          return NextResponse.json(
            { error: 'No enriched file available for this conversation' },
            { status: 404 }
          );
        }
      }

      console.error('Error generating enriched download URL:', error);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

