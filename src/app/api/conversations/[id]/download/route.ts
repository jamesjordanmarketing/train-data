/**
 * Conversation Download API Endpoint
 * 
 * GET /api/conversations/[id]/download
 * 
 * Generates a fresh signed URL for downloading conversation JSON file.
 * CRITICAL: Signed URLs are generated on-demand and expire after 1 hour.
 * They are NEVER stored in the database.
 * 
 * Authentication: Required (JWT via Supabase Auth)
 * Authorization: User must own the conversation
 * 
 * Flow:
 *   1. Validate JWT and extract user
 *   2. Fetch conversation (RLS filters by user)
 *   3. Verify user owns conversation (defense in depth)
 *   4. Generate fresh signed URL from file_path
 *   5. Return temporary URL with expiry metadata
 * 
 * Example:
 *   GET /api/conversations/60dfa7c6-7eff-45b4-8450-715c9c893ec9/download
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *   
 *   Response:
 *   {
 *     "conversation_id": "60dfa7c6-7eff-45b4-8450-715c9c893ec9",
 *     "download_url": "https://...storage.../sign/...?token=xyz",
 *     "filename": "conversation.json",
 *     "file_size": 45678,
 *     "expires_at": "2025-11-18T14:30:00Z",
 *     "expires_in_seconds": 3600
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createServerSupabaseClientFromRequest } from '@/lib/supabase-server';
import { ConversationStorageService } from '@/lib/services/conversation-storage-service';
import { ConversationDownloadResponse } from '@/lib/types/conversations';

export const dynamic = 'force-dynamic'; // Always dynamic, never cached

/**
 * GET /api/conversations/[id]/download
 * 
 * Generate download URL for conversation JSON file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const conversationId = params.id;

  console.log(`[GET /api/conversations/${conversationId}/download] Request received`);

  // ================================================================
  // Step 1: Validate Authentication
  // ================================================================
  const { user, response: authErrorResponse } = await requireAuth(request);

  if (authErrorResponse) {
    console.warn(`[GET /api/conversations/${conversationId}/download] ❌ Unauthorized`);
    return authErrorResponse; // 401 Unauthorized
  }

  const authenticatedUserId = user!.id;
  console.log(`[GET /api/conversations/${conversationId}/download] ✅ Authenticated as user: ${authenticatedUserId}`);

  // ================================================================
  // Step 2: Validate Conversation ID Format
  // ================================================================
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!conversationId || !uuidRegex.test(conversationId)) {
    console.warn(`[GET /api/conversations/${conversationId}/download] ❌ Invalid conversation ID format`);
    return NextResponse.json(
      {
        error: 'Bad Request',
        message: 'Invalid conversation ID format. Expected UUID.',
      },
      { status: 400 }
    );
  }

  // ================================================================
  // Step 3: Initialize Service with Authenticated Client
  // ================================================================
  // Create authenticated Supabase client (RLS will automatically filter by user)
  const { supabase } = createServerSupabaseClientFromRequest(request);
  const storageService = new ConversationStorageService(supabase);

  try {
    // ================================================================
    // Step 4: Get Conversation and Generate Download URL
    // ================================================================
    // This method:
    //   - Fetches conversation from database (RLS filters by user automatically)
    //   - Verifies file_path exists
    //   - Generates fresh signed URL (valid 1 hour)
    //   - Returns URL + metadata
    console.log(`[GET /api/conversations/${conversationId}/download] Fetching conversation and generating download URL...`);

    const downloadInfo: ConversationDownloadResponse = 
      await storageService.getDownloadUrlForConversation(conversationId);

    console.log(`[GET /api/conversations/${conversationId}/download] ✅ Generated signed URL (expires in 1 hour)`);

    // ================================================================
    // Step 5: Verify User Owns Conversation (Defense in Depth)
    // ================================================================
    // RLS should already enforce this, but double-check for security
    const conversation = await storageService.getConversation(conversationId);
    
    if (conversation && conversation.created_by !== authenticatedUserId) {
      console.warn(`[GET /api/conversations/${conversationId}/download] ❌ Forbidden: User ${authenticatedUserId} does not own conversation (owned by ${conversation.created_by})`);
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to download this conversation',
        },
        { status: 403 }
      );
    }

    // ================================================================
    // Step 6: Return Download Information
    // ================================================================
    const duration = Date.now() - startTime;
    console.log(`[GET /api/conversations/${conversationId}/download] ✅ Success (${duration}ms)`);

    return NextResponse.json({
      ...downloadInfo,
      _meta: {
        generated_at: new Date().toISOString(),
        generated_for_user: authenticatedUserId,
        duration_ms: duration,
      },
    });

  } catch (error: any) {
    console.error(`[GET /api/conversations/${conversationId}/download] ❌ Error:`, error);

    // Handle specific error types
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Conversation not found or you do not have access to it',
        },
        { status: 404 }
      );
    }

    if (error.message?.includes('No file path')) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Conversation file not available for download',
        },
        { status: 404 }
      );
    }

    if (error.message?.includes('Failed to generate')) {
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Failed to generate download URL. Please try again.',
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while preparing your download',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight (if needed)
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}

