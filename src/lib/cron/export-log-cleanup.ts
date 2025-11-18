/**
 * Export Log Cleanup Job
 * 
 * Scheduled job to delete old export logs and optionally archive them.
 * Runs monthly (first day of month) to clean up logs older than 30 days.
 * 
 * Features:
 * - Deletes export logs older than retention period (default: 30 days)
 * - Optional archival to S3 or external storage before deletion
 * - Logs cleanup summary for monitoring
 * - Handles deletion errors gracefully
 * - Preserves recent logs for auditing
 * 
 * Configuration:
 * - Schedule: Monthly on first day at 3am UTC (0 3 1 * *)
 * - Retention: 30 days (configurable)
 * - Archive: Optional S3 archival
 * 
 * Usage:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/export-log-cleanup",
 *     "schedule": "0 3 1 * *"
 *   }]
 * }
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Configuration for export log cleanup job
 */
export const LOG_CLEANUP_CONFIG = {
  /** Cron schedule expression (monthly on 1st at 3am UTC) */
  schedule: '0 3 1 * *',
  /** Retention period in days */
  retentionDays: 30,
  /** Enable archival to S3 before deletion */
  enableArchival: false,
  /** S3 bucket for archival (if enabled) */
  archiveBucket: process.env.EXPORT_ARCHIVE_BUCKET || '',
  /** S3 region */
  archiveRegion: process.env.EXPORT_ARCHIVE_REGION || 'us-east-1',
};

/**
 * Log cleanup result summary
 */
export interface LogCleanupResult {
  /** Total logs found for cleanup */
  total_found: number;
  /** Successfully deleted logs */
  deleted_count: number;
  /** Failed deletions */
  failed_count: number;
  /** Logs archived (if enabled) */
  archived_count: number;
  /** Total size of archived data (bytes) */
  archived_size_bytes: number;
  /** Errors encountered during cleanup */
  errors: Array<{ log_id: string; error: string }>;
  /** Total time taken (ms) */
  duration_ms: number;
  /** Timestamp when cleanup started */
  timestamp: string;
}

/**
 * Archive metadata for S3 or external storage
 */
export interface ArchiveMetadata {
  /** Archive file path */
  archive_path: string;
  /** Number of logs archived */
  log_count: number;
  /** Archive file size (bytes) */
  file_size: number;
  /** Archive timestamp */
  archived_at: string;
}

/**
 * Execute export log cleanup job
 * 
 * Deletes old export logs, optionally archiving them first.
 * 
 * @param supabase - Supabase client (optional, creates one if not provided)
 * @param retentionDays - Days to retain logs (default: 30)
 * @returns Log cleanup result summary
 */
export async function exportLogCleanup(
  supabase?: SupabaseClient,
  retentionDays: number = LOG_CLEANUP_CONFIG.retentionDays
): Promise<LogCleanupResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log('[Cron] Starting export log cleanup...', {
    timestamp,
    retention_days: retentionDays,
    archival_enabled: LOG_CLEANUP_CONFIG.enableArchival,
  });

  // Initialize result
  const result: LogCleanupResult = {
    total_found: 0,
    deleted_count: 0,
    failed_count: 0,
    archived_count: 0,
    archived_size_bytes: 0,
    errors: [],
    duration_ms: 0,
    timestamp,
  };

  try {
    // Create Supabase client if not provided
    const client = supabase || await createServerSupabaseClient();

    // Step 1: Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    console.log(`[Cron] Deleting logs older than ${cutoffISO}`);

    // Step 2: Fetch old export logs
    const { data: oldLogs, error: fetchError } = await client
      .from('export_logs')
      .select('*')
      .lt('created_at', cutoffISO)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[Cron] Error fetching old export logs:', fetchError);
      throw new Error(`Failed to fetch old export logs: ${fetchError.message}`);
    }

    result.total_found = oldLogs?.length || 0;

    if (!oldLogs || oldLogs.length === 0) {
      console.log('[Cron] No old export logs found');
      result.duration_ms = Date.now() - startTime;
      logCleanupSummary(result);
      return result;
    }

    console.log(`[Cron] Found ${oldLogs.length} old export logs`);

    // Step 3: Archive logs if enabled
    if (LOG_CLEANUP_CONFIG.enableArchival) {
      try {
        const archiveMetadata = await archiveExportLogs(oldLogs, timestamp);
        result.archived_count = archiveMetadata.log_count;
        result.archived_size_bytes = archiveMetadata.file_size;
        console.log(`[Cron] Archived ${archiveMetadata.log_count} logs to ${archiveMetadata.archive_path}`);
      } catch (error) {
        console.error('[Cron] Failed to archive logs (continuing with deletion):', error);
        // Don't fail the entire job if archival fails
      }
    }

    // Step 4: Delete old logs
    const logIds = oldLogs.map(log => log.id);
    
    // Delete in batches to avoid timeouts
    const batchSize = 100;
    for (let i = 0; i < logIds.length; i += batchSize) {
      const batch = logIds.slice(i, i + batchSize);
      
      try {
        const { error: deleteError } = await client
          .from('export_logs')
          .delete()
          .in('id', batch);

        if (deleteError) {
          console.error(`[Cron] Error deleting batch ${i}-${i + batch.length}:`, deleteError);
          result.failed_count += batch.length;
          result.errors.push({
            log_id: `batch_${i}`,
            error: deleteError.message,
          });
        } else {
          result.deleted_count += batch.length;
          console.log(`[Cron] Deleted batch ${i}-${i + batch.length} (${batch.length} logs)`);
        }
      } catch (error) {
        console.error(`[Cron] Exception deleting batch ${i}:`, error);
        result.failed_count += batch.length;
      }
    }

    // Step 5: Calculate duration and log summary
    result.duration_ms = Date.now() - startTime;
    logCleanupSummary(result);

    return result;
  } catch (error) {
    console.error('[Cron] Export log cleanup failed:', error);
    result.duration_ms = Date.now() - startTime;
    
    // Log failure
    console.error(JSON.stringify({
      type: 'export_log_cleanup_failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      ...result,
    }));
    
    throw error;
  }
}

/**
 * Archive export logs to S3 or external storage
 * 
 * Creates a compressed JSON archive of logs before deletion.
 * 
 * @param logs - Export logs to archive
 * @param timestamp - Archive timestamp
 * @returns Archive metadata
 */
async function archiveExportLogs(
  logs: any[],
  timestamp: string
): Promise<ArchiveMetadata> {
  try {
    // Create archive filename
    const dateStr = timestamp.split('T')[0]; // YYYY-MM-DD
    const archivePath = `export-logs/archive-${dateStr}.json`;

    // Convert logs to JSON
    const archiveData = JSON.stringify({
      archived_at: timestamp,
      log_count: logs.length,
      logs: logs,
    }, null, 2);

    const fileSize = Buffer.byteLength(archiveData, 'utf8');

    // TODO: Implement S3 upload when archival is enabled
    // This is a placeholder for S3 integration
    /*
    if (LOG_CLEANUP_CONFIG.enableArchival && LOG_CLEANUP_CONFIG.archiveBucket) {
      const AWS = require('aws-sdk');
      const s3 = new AWS.S3({ region: LOG_CLEANUP_CONFIG.archiveRegion });
      
      await s3.putObject({
        Bucket: LOG_CLEANUP_CONFIG.archiveBucket,
        Key: archivePath,
        Body: archiveData,
        ContentType: 'application/json',
        ServerSideEncryption: 'AES256',
      }).promise();
      
      console.log(`[Cron] Uploaded archive to S3: ${archivePath}`);
    }
    */

    // For now, just log the archive intent
    console.log('[Cron] Archive prepared (S3 upload not configured):', {
      path: archivePath,
      log_count: logs.length,
      file_size: fileSize,
    });

    return {
      archive_path: archivePath,
      log_count: logs.length,
      file_size: fileSize,
      archived_at: timestamp,
    };
  } catch (error) {
    console.error('[Cron] Error archiving export logs:', error);
    throw error;
  }
}

/**
 * Log cleanup summary with structured JSON
 */
function logCleanupSummary(result: LogCleanupResult): void {
  console.log(JSON.stringify({
    type: 'export_log_cleanup_complete',
    ...result,
  }));
  
  console.log('[Cron] Export log cleanup complete:', {
    found: result.total_found,
    deleted: result.deleted_count,
    failed: result.failed_count,
    archived: result.archived_count,
    archived_size_mb: (result.archived_size_bytes / (1024 * 1024)).toFixed(2),
    duration_ms: result.duration_ms,
  });
}

/**
 * Cleanup logs for a specific user
 * 
 * Deletes export logs for a single user (e.g., after account deletion).
 * 
 * @param supabase - Supabase client
 * @param userId - User ID to cleanup logs for
 * @returns Number of logs deleted
 */
export async function cleanupUserExportLogs(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    console.log(`[Cleanup] Deleting export logs for user: ${userId}`);

    const { data: deletedLogs, error } = await supabase
      .from('export_logs')
      .delete()
      .eq('user_id', userId)
      .select('id');

    if (error) {
      throw new Error(`Failed to delete user export logs: ${error.message}`);
    }

    const deletedCount = deletedLogs?.length || 0;
    console.log(`[Cleanup] Deleted ${deletedCount} export logs for user ${userId}`);

    return deletedCount;
  } catch (error) {
    console.error('[Cleanup] Error deleting user export logs:', error);
    throw error;
  }
}

/**
 * Get cleanup statistics
 * 
 * Returns information about logs eligible for cleanup.
 * 
 * @param supabase - Supabase client
 * @param retentionDays - Days to retain logs
 * @returns Cleanup statistics
 */
export async function getCleanupStats(
  supabase: SupabaseClient,
  retentionDays: number = LOG_CLEANUP_CONFIG.retentionDays
): Promise<{
  eligible_for_cleanup: number;
  total_size_estimate_mb: number;
  oldest_log_date: string | null;
  cutoff_date: string;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    // Count eligible logs
    const { count, error: countError } = await supabase
      .from('export_logs')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoffISO);

    if (countError) {
      throw new Error(`Failed to count eligible logs: ${countError.message}`);
    }

    // Get oldest log date
    const { data: oldestLog } = await supabase
      .from('export_logs')
      .select('created_at')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    // Estimate size (average 1KB per log entry)
    const estimatedSizeMB = ((count || 0) * 1024) / (1024 * 1024);

    return {
      eligible_for_cleanup: count || 0,
      total_size_estimate_mb: estimatedSizeMB,
      oldest_log_date: oldestLog?.created_at || null,
      cutoff_date: cutoffISO,
    };
  } catch (error) {
    console.error('[Cleanup] Error getting cleanup stats:', error);
    throw error;
  }
}

