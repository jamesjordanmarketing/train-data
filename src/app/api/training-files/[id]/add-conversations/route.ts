/**
 * Training Files API - Add Conversations
 * 
 * POST /api/training-files/:id/add-conversations
 * Add conversations to an existing training file
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
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
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validated = AddConversationsSchema.parse(body);
    
    const service = createTrainingFileService(supabase);
    const updated = await service.addConversationsToTrainingFile({
      training_file_id: params.id,
      conversation_ids: validated.conversation_ids,
      added_by: user.id,
    });
    
    return NextResponse.json({ trainingFile: updated });
  } catch (error) {
    console.error('Error adding conversations:', error);
    
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

