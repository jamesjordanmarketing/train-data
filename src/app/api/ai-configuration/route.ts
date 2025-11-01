/**
 * API Route: /api/ai-configuration
 * 
 * Handles CRUD operations for AI configurations with hierarchical fallback:
 * User DB → Organization DB → Environment Variables → Defaults
 * 
 * Methods:
 * - GET: Retrieve effective configuration and user configurations
 * - PATCH: Update user configuration
 * - DELETE: Remove user configuration (revert to defaults)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { aiConfigService } from '@/lib/services/ai-config-service';

/**
 * GET /api/ai-configuration
 * 
 * Returns:
 * - effective: The effective configuration after fallback chain resolution
 * - userConfigurations: List of user-specific configurations
 * 
 * Query Parameters:
 * - userId: (optional) User ID to fetch configuration for. Defaults to authenticated user.
 * 
 * Response:
 * {
 *   effective: AIConfiguration,
 *   userConfigurations: AIConfigurationRecord[]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || user.id;
    
    // Only allow users to access their own configuration (unless admin)
    if (userId !== user.id) {
      // TODO: Add admin check here when roles are implemented
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const effectiveConfig = await aiConfigService.getEffectiveConfiguration(userId);
    const userConfigs = await aiConfigService.getUserConfigurations(userId);
    
    return NextResponse.json({
      effective: effectiveConfig,
      userConfigurations: userConfigs,
    });
  } catch (error) {
    console.error('Error fetching AI configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ai-configuration
 * 
 * Update user AI configuration
 * 
 * Request Body:
 * {
 *   configName: string,
 *   updates: Partial<AIConfiguration>
 * }
 * 
 * Response:
 * { success: true } | { error: string, errors: string[] }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { configName, updates } = body;
    
    if (!configName) {
      return NextResponse.json(
        { error: 'configName is required' },
        { status: 400 }
      );
    }
    
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'updates must be an object' },
        { status: 400 }
      );
    }
    
    const result = await aiConfigService.updateConfiguration(user.id, configName, updates);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: result.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating AI configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-configuration
 * 
 * Delete user AI configuration (reverts to organization/environment defaults)
 * 
 * Request Body:
 * {
 *   configName: string
 * }
 * 
 * Response:
 * { success: true } | { error: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { configName } = body;
    
    if (!configName) {
      return NextResponse.json(
        { error: 'configName is required' },
        { status: 400 }
      );
    }
    
    const result = await aiConfigService.deleteConfiguration(user.id, configName);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to delete configuration' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI configuration:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-configuration/toggle
 * 
 * Toggle configuration active state
 * 
 * Request Body:
 * {
 *   configId: string,
 *   isActive: boolean
 * }
 * 
 * Response:
 * { success: true } | { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { configId, isActive } = body;
    
    if (!configId) {
      return NextResponse.json(
        { error: 'configId is required' },
        { status: 400 }
      );
    }
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }
    
    const result = await aiConfigService.toggleConfiguration(configId, isActive);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to toggle configuration' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling AI configuration:', error);
    return NextResponse.json(
      { error: 'Failed to toggle configuration' },
      { status: 500 }
    );
  }
}

