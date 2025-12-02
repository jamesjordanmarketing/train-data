/**
 * Training Files API - List and Create
 * 
 * GET /api/training-files - List all training files
 * POST /api/training-files - Create new training file
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServerSupabaseAdminClient } from '@/lib/supabase-server';
import { createTrainingFileService } from '@/lib/services/training-file-service';
import { z, ZodError } from 'zod';

const CreateTrainingFileSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  conversation_ids: z.array(z.string().uuid()).min(1).max(80),
});

/**
 * GET /api/training-files
 * List all training files
 */
export async function GET(request: NextRequest) {
  try {
    // Use user client for auth check
    const supabaseUser = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use ADMIN client for database operations to bypass RLS
    const supabaseAdmin = createServerSupabaseAdminClient();
    const service = createTrainingFileService(supabaseAdmin);
    const files = await service.listTrainingFiles({ status: 'active' });

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing training files:', error);
    return NextResponse.json(
      { error: 'Failed to list training files' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/training-files
 * Create new training file
 */
export async function POST(request: NextRequest) {
  try {
    // Use user client for auth check
    const supabaseUser = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = CreateTrainingFileSchema.parse(body);

    // Use ADMIN client for database operations to bypass RLS
    // (conversations may be created by system user, not the current user)
    const supabaseAdmin = createServerSupabaseAdminClient();
    const service = createTrainingFileService(supabaseAdmin);
    const trainingFile = await service.createTrainingFile({
      name: validated.name,
      description: validated.description,
      conversation_ids: validated.conversation_ids,
      created_by: user.id,
    });

    return NextResponse.json({ trainingFile }, { status: 201 });
  } catch (error) {
    console.error('Error creating training file:', error);

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
      { error: 'Failed to create training file' },
      { status: 500 }
    );
  }
}

