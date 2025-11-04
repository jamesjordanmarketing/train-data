import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createBackup } from '@/lib/backup/storage';
import { errorLogger } from '@/../train-wireframe/src/lib/errors/error-logger';
import { AppError, ErrorCode } from '@/../train-wireframe/src/lib/errors';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/backup/create
 * 
 * Creates a backup of specified conversations.
 * 
 * Request Body:
 * {
 *   "conversationIds": ["conv-1", "conv-2"],
 *   "reason": "bulk_delete"
 * }
 * 
 * Response:
 * {
 *   "backupId": "backup-123",
 *   "filePath": "/backups/backup-123.json",
 *   "expiresAt": "2025-11-11T...",
 *   "conversationCount": 2
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      errorLogger.warn('Authentication failed for backup creation', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { conversationIds, reason = 'manual_backup' } = body;

    // Validate input
    if (!conversationIds || !Array.isArray(conversationIds) || conversationIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid conversation IDs' },
        { status: 400 }
      );
    }

    errorLogger.info('Backup creation requested', {
      userId: user.id,
      conversationCount: conversationIds.length,
      reason,
    });

    // Create backup
    const backup = await createBackup(conversationIds, user.id, reason);

    errorLogger.info('Backup created successfully', {
      backupId: backup.backupId,
      userId: user.id,
      conversationCount: conversationIds.length,
    });

    return NextResponse.json({
      backupId: backup.backupId,
      filePath: backup.filePath,
      expiresAt: backup.expiresAt.toISOString(),
      conversationCount: conversationIds.length,
    });
  } catch (error) {
    errorLogger.error('Backup creation failed', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === ErrorCode.ERR_DB_QUERY ? 500 : 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/backup/create
 * 
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

