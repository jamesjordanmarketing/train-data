/**
 * API Route: Download raw minimal JSON
 * GET /api/conversations/[id]/download/raw
 * 
 * Returns signed URL to download raw minimal JSON from Claude (stored at raw_response_path)
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

    // Create Supabase client
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get conversation storage service
    const storageService = getConversationStorageService();

    // Get raw response download URL
    try {
      const downloadInfo = await storageService.getRawResponseDownloadUrl(conversationId);

      return NextResponse.json({
        conversation_id: downloadInfo.conversation_id,
        download_url: downloadInfo.download_url,
        filename: downloadInfo.filename || `${conversationId}-raw.json`,
        file_size: downloadInfo.file_size,
        expires_at: downloadInfo.expires_at,
        expires_in_seconds: downloadInfo.expires_in_seconds
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Conversation not found or no raw response available' },
            { status: 404 }
          );
        }
        if (error.message.includes('No raw response path')) {
          return NextResponse.json(
            { error: 'No raw response available for this conversation' },
            { status: 404 }
          );
        }
      }

      console.error('Error generating raw download URL:', error);
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

