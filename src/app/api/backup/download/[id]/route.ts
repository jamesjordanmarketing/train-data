import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getBackup } from '@/lib/backup/storage';
import { errorLogger } from '@/../train-wireframe/src/lib/errors/error-logger';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/backup/download/[id]
 * 
 * Downloads a backup file by backup ID.
 * 
 * Response: JSON file download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backupId = params.id;

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      // Try cookie-based auth for browser downloads
      const cookieHeader = request.headers.get('cookie');
      if (!cookieHeader) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Fetch backup metadata
    const backup = await getBackup(backupId);

    if (!backup) {
      errorLogger.warn('Backup not found', { backupId });
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    // Check if backup has expired
    if (new Date(backup.expiresAt) < new Date()) {
      errorLogger.warn('Backup has expired', { backupId, expiresAt: backup.expiresAt });
      return NextResponse.json(
        { error: 'Backup has expired' },
        { status: 410 }
      );
    }

    // Verify file exists
    if (!existsSync(backup.filePath)) {
      errorLogger.error('Backup file not found on disk', { backupId, filePath: backup.filePath });
      return NextResponse.json(
        { error: 'Backup file not found' },
        { status: 404 }
      );
    }

    // Read backup file
    const fileContent = await readFile(backup.filePath, 'utf-8');

    errorLogger.info('Backup downloaded', {
      backupId,
      userId: backup.userId,
      fileSize: fileContent.length,
    });

    // Return file as download
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${backupId}.json"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    errorLogger.error('Backup download failed', error, { backupId: params.id });

    return NextResponse.json(
      { error: 'Failed to download backup' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/backup/download/[id]
 * 
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

