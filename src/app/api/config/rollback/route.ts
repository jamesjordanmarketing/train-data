/**
 * API Route: Configuration Rollback
 * 
 * POST /api/config/rollback
 * 
 * Executes configuration rollback operations with validation.
 * Supports preview, validate, execute, and bulk actions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { configRollbackService } from '@/lib/services/config-rollback-service';
import { RollbackOptions, BulkRollbackOptions, ConfigType } from '@/lib/types/config-change-management';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const action = body.action;
    
    // Validate action
    if (!action || !['preview', 'validate', 'execute', 'bulk'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "preview", "validate", "execute", or "bulk"' },
        { status: 400 }
      );
    }
    
    // Handle preview
    if (action === 'preview') {
      const { configType, configId, targetAuditLogId } = body;
      
      if (!configType || !configId || !targetAuditLogId) {
        return NextResponse.json(
          { error: 'configType, configId, and targetAuditLogId are required for preview' },
          { status: 400 }
        );
      }
      
      // Validate config type
      if (!['user_preference', 'ai_config'].includes(configType)) {
        return NextResponse.json(
          { error: 'Invalid configType. Must be "user_preference" or "ai_config"' },
          { status: 400 }
        );
      }
      
      const preview = await configRollbackService.previewRollback(
        configType as ConfigType,
        configId,
        targetAuditLogId
      );
      
      return NextResponse.json({ preview });
    }
    
    // Handle validate
    if (action === 'validate') {
      const options: RollbackOptions = body.options;
      
      if (!options) {
        return NextResponse.json(
          { error: 'options are required for validate' },
          { status: 400 }
        );
      }
      
      // Validate required fields
      if (!options.configType || !options.configId || !options.targetAuditLogId) {
        return NextResponse.json(
          { error: 'options must include configType, configId, and targetAuditLogId' },
          { status: 400 }
        );
      }
      
      const validation = await configRollbackService.validateRollback(options);
      
      return NextResponse.json({ validation });
    }
    
    // Handle execute
    if (action === 'execute') {
      const options: RollbackOptions = body.options;
      
      if (!options) {
        return NextResponse.json(
          { error: 'options are required for execute' },
          { status: 400 }
        );
      }
      
      // Validate required fields
      if (!options.configType || !options.configId || !options.targetAuditLogId) {
        return NextResponse.json(
          { error: 'options must include configType, configId, and targetAuditLogId' },
          { status: 400 }
        );
      }
      
      await configRollbackService.rollbackToVersion(options, user.id);
      
      return NextResponse.json({ 
        success: true,
        message: 'Rollback executed successfully'
      });
    }
    
    // Handle bulk execute
    if (action === 'bulk') {
      const options: BulkRollbackOptions = body.options;
      
      if (!options || !options.rollbacks || !Array.isArray(options.rollbacks)) {
        return NextResponse.json(
          { error: 'options with rollbacks array is required for bulk' },
          { status: 400 }
        );
      }
      
      if (options.rollbacks.length === 0) {
        return NextResponse.json(
          { error: 'rollbacks array cannot be empty' },
          { status: 400 }
        );
      }
      
      // Validate each rollback
      for (const rollback of options.rollbacks) {
        if (!rollback.configType || !rollback.configId || !rollback.targetAuditLogId) {
          return NextResponse.json(
            { error: 'Each rollback must include configType, configId, and targetAuditLogId' },
            { status: 400 }
          );
        }
      }
      
      await configRollbackService.bulkRollback(options, user.id);
      
      return NextResponse.json({ 
        success: true,
        message: `Bulk rollback executed successfully for ${options.rollbacks.length} configurations`
      });
    }
    
    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error executing rollback:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to execute rollback',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

