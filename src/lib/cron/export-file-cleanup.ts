/**
 * Export File Cleanup Job
 * 
 * Scheduled job to delete expired export files and update export log status.
 * Runs daily at 2am UTC to clean up files older than 24 hours.
 * 
 * Features:
 * - Deletes expired export files from storage
 * - Updates export log status to 'expired'
 * - Logs deletion summary for monitoring
 * - Handles individual file deletion errors gracefully
 * - Continues processing even if some deletions fail
 * 
 * Configuration:
 * - Schedule: Daily at 2am UTC (0 2 * * *)
 * - Retention: 24 hours (configurable)
 * 
 * Usage:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/export-file-cleanup",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ExportService } from '@/lib/export-service';

/**
 * Configuration for export file cleanup job
 */
export const CLEANUP_CONFIG = {
  /** Cron schedule expression (daily at 2am UTC) */
  schedule: '0 2 * * *',
  /** Retention period in hours */
  retentionHours: 24,
  /** Storage bucket name */
  storageBucket: 'exports',
};

/**
 * Cleanup result summary
 */
export interface CleanupResult {
  /** Total files found for cleanup */
  total_found: number;
  /** Successfully deleted files */
  deleted_count: number;
  /** Failed deletions */
  failed_count: number;
  /** Export logs updated to 'expired' status */
  logs_updated: number;
  /** Errors encountered during cleanup */
  errors: Array<{ export_id: string; error: string }>;
  /** Total time taken (ms) */
  duration_ms: number;
  /** Timestamp when cleanup started */
  timestamp: string;
}

/**
 * Execute export file cleanup job
 * 
 * Finds and deletes expired export files, updates export logs.
 * 
 * @param supabase - Supabase client (optional, creates one if not provided)
 * @returns Cleanup result summary
 */
export async function exportFileCleanup(
  supabase?: SupabaseClient
): Promise<CleanupResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log('[Cron] Starting export file cleanup...', {
    timestamp,
    retention_hours: CLEANUP_CONFIG.retentionHours,
  });

  // Initialize result
  const result: CleanupResult = {
    total_found: 0,
    deleted_count: 0,
    failed_count: 0,
    logs_updated: 0,
    errors: [],
    duration_ms: 0,
    timestamp,
  };

  try {
    // Create Supabase client if not provided
    const client = supabase || createServerSupabaseClient();
    const exportService = new ExportService(client);

    // Step 1: Find expired exports
    const now = new Date().toISOString();
    
    const { data: expiredExports, error: fetchError } = await client
      .from('export_logs')
      .select('*')
      .eq('status', 'completed')
      .lt('expires_at', now)
      .not('expires_at', 'is', null);

    if (fetchError) {
      console.error('[Cron] Error fetching expired exports:', fetchError);
      throw new Error(`Failed to fetch expired exports: ${fetchError.message}`);
    }

    result.total_found = expiredExports?.length || 0;
    
    if (!expiredExports || expiredExports.length === 0) {
      console.log('[Cron] No expired exports found');
      result.duration_ms = Date.now() - startTime;
      logCleanupSummary(result);
      return result;
    }

    console.log(`[Cron] Found ${expiredExports.length} expired exports`);

    // Step 2: Delete files and update logs
    for (const exp of expiredExports) {
      try {
        // Delete file from storage
        await deleteExportFile(client, exp);
        result.deleted_count++;
        
        // Update export log status to 'expired'
        await exportService.updateExportLog(exp.export_id, {
          status: 'expired',
        });
        result.logs_updated++;

        console.log(`[Cron] Cleaned up export: ${exp.export_id}`);
      } catch (error) {
        // Log error but continue with other exports
        result.failed_count++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({
          export_id: exp.export_id,
          error: errorMessage,
        });
        
        console.error(`[Cron] Failed to cleanup export ${exp.export_id}:`, errorMessage);
      }
    }

    // Step 3: Calculate duration and log summary
    result.duration_ms = Date.now() - startTime;
    logCleanupSummary(result);

    return result;
  } catch (error) {
    console.error('[Cron] Export file cleanup failed:', error);
    result.duration_ms = Date.now() - startTime;
    
    // Log failure
    console.error(JSON.stringify({
      type: 'export_file_cleanup_failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      ...result,
    }));
    
    throw error;
  }
}

/**
 * Delete export file from storage
 * 
 * Handles deletion from Supabase Storage or local file system.
 * 
 * @param supabase - Supabase client
 * @param exportLog - Export log record
 */
async function deleteExportFile(
  supabase: SupabaseClient,
  exportLog: any
): Promise<void> {
  try {
    // If file_url is a storage URL, delete from Supabase Storage
    if (exportLog.file_url && exportLog.file_url.includes('/storage/v1/object/')) {
      // Extract storage path from URL
      const urlParts = exportLog.file_url.split('/storage/v1/object/public/');
      if (urlParts.length > 1) {
        const [bucket, ...pathParts] = urlParts[1].split('/');
        const filePath = pathParts.join('/');
        
        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (error) {
          throw new Error(`Storage delete failed: ${error.message}`);
        }
        
        console.log(`[Cron] Deleted file from storage: ${filePath}`);
      }
    } else if (exportLog.file_path) {
      // For local file system paths (development mode)
      // Note: This requires file system access, which may not be available in serverless
      // In production, files should be in Supabase Storage
      console.log(`[Cron] Skipping local file deletion (serverless): ${exportLog.file_path}`);
    } else {
      // No file to delete (file_url may be a dynamic endpoint)
      console.log(`[Cron] No physical file to delete for export: ${exportLog.export_id}`);
    }
  } catch (error) {
    console.error('[Cron] Error deleting export file:', error);
    throw error;
  }
}

/**
 * Log cleanup summary with structured JSON
 */
function logCleanupSummary(result: CleanupResult): void {
  console.log(JSON.stringify({
    type: 'export_file_cleanup_complete',
    ...result,
  }));
  
  console.log('[Cron] Export file cleanup complete:', {
    found: result.total_found,
    deleted: result.deleted_count,
    failed: result.failed_count,
    logs_updated: result.logs_updated,
    duration_ms: result.duration_ms,
  });
}

/**
 * Cleanup exports older than specified retention period
 * 
 * Alternative cleanup method that doesn't rely on expires_at field.
 * Deletes exports based on creation time.
 * 
 * @param supabase - Supabase client
 * @param retentionHours - Hours to retain exports (default: 24)
 * @returns Cleanup result
 */
export async function cleanupOldExports(
  supabase: SupabaseClient,
  retentionHours: number = 24
): Promise<CleanupResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log('[Cron] Starting old export cleanup...', {
    timestamp,
    retention_hours: retentionHours,
  });

  const result: CleanupResult = {
    total_found: 0,
    deleted_count: 0,
    failed_count: 0,
    logs_updated: 0,
    errors: [],
    duration_ms: 0,
    timestamp,
  };

  try {
    // Calculate cutoff date
    const cutoffDate = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
    
    // Find old completed exports
    const { data: oldExports, error: fetchError } = await supabase
      .from('export_logs')
      .select('*')
      .eq('status', 'completed')
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch old exports: ${fetchError.message}`);
    }

    result.total_found = oldExports?.length || 0;

    if (!oldExports || oldExports.length === 0) {
      console.log('[Cron] No old exports found');
      result.duration_ms = Date.now() - startTime;
      return result;
    }

    console.log(`[Cron] Found ${oldExports.length} old exports`);

    // Delete files and update logs
    const exportService = new ExportService(supabase);
    
    for (const exp of oldExports) {
      try {
        await deleteExportFile(supabase, exp);
        result.deleted_count++;
        
        await exportService.updateExportLog(exp.export_id, {
          status: 'expired',
        });
        result.logs_updated++;
      } catch (error) {
        result.failed_count++;
        result.errors.push({
          export_id: exp.export_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    result.duration_ms = Date.now() - startTime;
    logCleanupSummary(result);

    return result;
  } catch (error) {
    console.error('[Cron] Old export cleanup failed:', error);
    result.duration_ms = Date.now() - startTime;
    throw error;
  }
}

