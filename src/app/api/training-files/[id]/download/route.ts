/**
 * Training Files API - Download
 * 
 * GET /api/training-files/:id/download?format=json|jsonl
 * Generate signed download URL for training file
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createTrainingFileService } from '@/lib/services/training-file-service';
import { z, ZodError } from 'zod';

const DownloadQuerySchema = z.object({
  format: z.enum(['json', 'jsonl']),
});

/**
 * GET /api/training-files/:id/download?format=json|jsonl
 * Generate signed download URL for training file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const validated = DownloadQuerySchema.parse({
      format: searchParams.get('format') || 'json',
    });
    
    const service = createTrainingFileService(supabase);
    const trainingFile = await service.getTrainingFile(params.id);
    
    if (!trainingFile) {
      return NextResponse.json({ error: 'Training file not found' }, { status: 404 });
    }
    
    const filePath = validated.format === 'json' 
      ? trainingFile.json_file_path 
      : trainingFile.jsonl_file_path;
    
    const downloadUrl = await service.getDownloadUrl(filePath);
    
    return NextResponse.json({
      download_url: downloadUrl,
      filename: `${trainingFile.name}.${validated.format}`,
      expires_in_seconds: 3600,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}

