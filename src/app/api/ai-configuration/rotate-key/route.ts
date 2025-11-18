/**
 * API Route: /api/ai-configuration/rotate-key
 * 
 * Handles API key rotation for AI configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { aiConfigService } from '@/lib/services/ai-config-service';

/**
 * POST /api/ai-configuration/rotate-key
 * 
 * Rotate API key (moves current primary to secondary, sets new primary)
 * 
 * Request Body:
 * {
 *   newPrimaryKey: string
 * }
 * 
 * Response:
 * { success: true } | { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { newPrimaryKey } = body;
    
    if (!newPrimaryKey || typeof newPrimaryKey !== 'string') {
      return NextResponse.json(
        { error: 'newPrimaryKey is required and must be a string' },
        { status: 400 }
      );
    }
    
    const result = await aiConfigService.rotateAPIKey(user.id, newPrimaryKey);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to rotate API key', errors: result.errors },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rotating API key:', error);
    return NextResponse.json(
      { error: 'Failed to rotate API key' },
      { status: 500 }
    );
  }
}

