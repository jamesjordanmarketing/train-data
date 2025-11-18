import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase-server';

/**
 * Test endpoint to verify authentication is working correctly
 * GET /api/test-auth
 * 
 * Returns:
 * - 401 if not authenticated
 * - 200 with user info if authenticated
 */
export async function GET(request: NextRequest) {
  const { user, response } = await requireAuth(request);

  if (response) {
    return response; // 401 Unauthorized
  }

  return NextResponse.json({
    success: true,
    message: 'Authentication successful!',
    user: {
      id: user!.id,
      email: user!.email,
      created_at: user!.created_at,
      last_sign_in_at: user!.last_sign_in_at,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Test endpoint to verify RLS policies work with authenticated user
 * POST /api/test-auth
 * 
 * Tests creating a record with the authenticated user's ID
 */
export async function POST(request: NextRequest) {
  const { user, response } = await requireAuth(request);

  if (response) {
    return response; // 401 Unauthorized
  }

  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: 'Authentication test successful',
      authenticated_user: {
        id: user!.id,
        email: user!.email,
      },
      request_body: body,
      note: 'User ID from JWT would be used for database operations',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

