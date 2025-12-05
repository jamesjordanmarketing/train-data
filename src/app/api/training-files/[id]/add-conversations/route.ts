/**
 * Training Files API - Add Conversations
 * 
 * POST /api/training-files/:id/add-conversations
 * Add conversations to an existing training file
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServerSupabaseAdminClient } from '@/lib/supabase-server';
import { createTrainingFileService } from '@/lib/services/training-file-service';
import { z, ZodError } from 'zod';

const AddConversationsSchema = z.object({
  conversation_ids: z.array(z.string().uuid()).min(1).max(80),
});

/**
 * POST /api/training-files/:id/add-conversations
 * Add conversations to an existing training file
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use user client for auth check
    const supabaseUser = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // 🔍 DEBUG: Log raw request body
    console.log('[ADD-CONVERSATIONS API] 📥 Received request body:', JSON.stringify(body));
    console.log('[ADD-CONVERSATIONS API] Training file ID:', params.id);
    console.log('[ADD-CONVERSATIONS API] Conversation IDs received:', body.conversation_ids);
    console.log('[ADD-CONVERSATIONS API] Number of IDs:', body.conversation_ids?.length);
    
    const validated = AddConversationsSchema.parse(body);
    
    // 🔍 DEBUG: Log validated IDs
    console.log('[ADD-CONVERSATIONS API] ✅ Validated conversation_ids:', JSON.stringify(validated.conversation_ids));
    
    // Use ADMIN client for database operations to bypass RLS
    // (conversations may be created by system user, not the current user)
    const supabaseAdmin = createServerSupabaseAdminClient();
    const service = createTrainingFileService(supabaseAdmin);
    const updated = await service.addConversationsToTrainingFile({
      training_file_id: params.id,
      conversation_ids: validated.conversation_ids,
      added_by: user.id,
    });
    
    console.log('[ADD-CONVERSATIONS API] ✅ Successfully added conversations');
    
    return NextResponse.json({ trainingFile: updated });
  } catch (error) {
    console.error('[ADD-CONVERSATIONS API] ❌ Error adding conversations:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add conversations' },
      { status: 500 }
    );
  }
}

