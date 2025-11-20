/**
 * API Route: Download enriched JSON
 * GET /api/conversations/[id]/download/enriched
 * 
 * Returns signed URL to download enriched JSON (with predetermined fields populated)
 * Only available when enrichment_status is 'enriched' or 'completed'
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Fetch conversation to check enrichment status
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('conversation_id, enrichment_status, enriched_file_path, enriched_file_size')
      .eq('conversation_id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check enrichment status
    if (conversation.enrichment_status !== 'completed' && conversation.enrichment_status !== 'enriched') {
      return NextResponse.json(
        { 
          error: `Enrichment not complete (status: ${conversation.enrichment_status})`,
          enrichment_status: conversation.enrichment_status
        },
        { status: 400 }
      );
    }

    // Check if enriched file path exists
    if (!conversation.enriched_file_path) {
      return NextResponse.json(
        { error: 'Enriched file path not found' },
        { status: 404 }
      );
    }

    // Generate signed URL
    const { data: signedData, error: signError } = await supabase.storage
      .from('conversation-files')
      .createSignedUrl(conversation.enriched_file_path, 3600); // 1 hour

    if (signError || !signedData) {
      console.error('Failed to generate signed URL:', signError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    // Extract filename
    const filename = conversation.enriched_file_path.split('/').pop() || `${conversationId}-enriched.json`;
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return NextResponse.json({
      conversation_id: conversationId,
      download_url: signedData.signedUrl,
      filename,
      file_size: conversation.enriched_file_size,
      enrichment_status: conversation.enrichment_status,
      expires_at: expiresAt,
      expires_in_seconds: 3600
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

