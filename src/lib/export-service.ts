/**
 * Export Service Layer
 * 
 * Manages export log operations for the Interactive LoRA Conversation Generation Module.
 * Implements CRUD operations for export_logs table with proper error handling and type safety.
 * 
 * DATABASE VERIFICATION STATUS:
 * ✅ export_logs table should exist with columns: id, export_id, user_id, timestamp, format, 
 *    config, conversation_count, file_size, status, file_url, expires_at, error_message,
 *    created_at, updated_at
 * ✅ Indexes should exist on: user_id, timestamp, status, format, expires_at
 * ✅ Foreign key constraint to auth.users(id) should exist
 * ✅ RLS enabled with policies for SELECT, INSERT, UPDATE
 * 
 * To verify manually, run these queries in Supabase SQL Editor:
 * 
 * -- Check table structure
 * SELECT column_name, data_type, is_nullable 
 * FROM information_schema.columns 
 * WHERE table_name = 'export_logs' 
 * ORDER BY ordinal_position;
 * 
 * -- Check indexes
 * SELECT indexname, indexdef 
 * FROM pg_indexes 
 * WHERE tablename = 'export_logs';
 * 
 * -- Check RLS policies
 * SELECT policyname, cmd, qual 
 * FROM pg_policies 
 * WHERE tablename = 'export_logs';
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ExportConfig } from '../../@/lib/types';

/**
 * ExportLog interface matching database schema
 * Represents a complete export operation record
 */
export interface ExportLog {
  /** Primary key (auto-generated) */
  id: string;
  /** Unique export identifier (generated in app) */
  export_id: string;
  /** User who initiated the export (FK to auth.users) */
  user_id: string;
  /** Export timestamp (ISO 8601 format) */
  timestamp: string;
  /** Export file format */
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  /** Export configuration object (JSONB) */
  config: ExportConfig;
  /** Number of conversations included in export */
  conversation_count: number;
  /** File size in bytes (null until completed) */
  file_size: number | null;
  /** Export processing status */
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  /** URL to download completed export file (null until completed) */
  file_url: string | null;
  /** Expiration timestamp for download link (ISO 8601 format) */
  expires_at: string | null;
  /** Error message if status is 'failed' */
  error_message: string | null;
  /** Record creation timestamp (auto-generated) */
  created_at: string;
  /** Record last update timestamp (auto-updated) */
  updated_at: string;
  /** Number of times the export has been downloaded */
  downloaded_count?: number;
}

/**
 * Input type for creating a new export log
 * Required fields for initiating an export operation
 */
export interface CreateExportLogInput {
  /** User identifier initiating the export */
  user_id: string;
  /** Export file format */
  format: ExportLog['format'];
  /** Export configuration settings */
  config: ExportConfig;
  /** Number of conversations to export */
  conversation_count: number;
  /** Initial status (defaults to 'queued') */
  status?: ExportLog['status'];
}

/**
 * Input type for updating an existing export log
 * All fields are optional for partial updates
 */
export interface UpdateExportLogInput {
  /** Updated processing status */
  status?: ExportLog['status'];
  /** File size in bytes (set when export completes) */
  file_size?: number;
  /** Download URL (set when export completes) */
  file_url?: string;
  /** Expiration timestamp (set when export completes) */
  expires_at?: string;
  /** Error message (set when export fails) */
  error_message?: string;
}

/**
 * Custom error: Export log not found
 * Thrown when attempting to access a non-existent export_id
 */
export class ExportNotFoundError extends Error {
  constructor(export_id: string) {
    super(`Export not found: ${export_id}`);
    this.name = 'ExportNotFoundError';
  }
}

/**
 * Custom error: Export permission denied
 * Thrown when RLS policies block access to an export log
 */
export class ExportPermissionError extends Error {
  constructor(export_id: string) {
    super(`Permission denied for export: ${export_id}`);
    this.name = 'ExportPermissionError';
  }
}

/**
 * ExportService Class
 * 
 * Provides CRUD operations for export logs with proper error handling,
 * type safety, and audit trail capabilities.
 * 
 * @example
 * ```typescript
 * import { createClient } from '@supabase/supabase-js';
 * import { createExportService } from './export-service';
 * 
 * const supabase = createClient(url, key);
 * const exportService = createExportService(supabase);
 * 
 * // Create an export log
 * const log = await exportService.createExportLog({
 *   user_id: 'user-123',
 *   format: 'jsonl',
 *   config: { scope: 'filtered', format: 'jsonl', ... },
 *   conversation_count: 42
 * });
 * 
 * // Update when completed
 * await exportService.updateExportLog(log.export_id, {
 *   status: 'completed',
 *   file_size: 1024000,
 *   file_url: 'https://storage.example.com/exports/file.jsonl'
 * });
 * ```
 */
export class ExportService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create a new export log entry
   * 
   * Generates a unique export_id and creates a record in the export_logs table.
   * Initial status defaults to 'queued' unless specified otherwise.
   * 
   * @param input - Export log creation data
   * @returns Created export log with generated export_id
   * @throws Error if database insert fails
   * 
   * @example
   * ```typescript
   * const log = await exportService.createExportLog({
   *   user_id: 'user-123',
   *   format: 'jsonl',
   *   config: {
   *     scope: 'filtered',
   *     format: 'jsonl',
   *     includeMetadata: true,
   *     includeQualityScores: true,
   *     includeTimestamps: true,
   *     includeApprovalHistory: false,
   *     includeParentReferences: false,
   *     includeFullContent: true
   *   },
   *   conversation_count: 42
   * });
   * console.log('Export created:', log.export_id);
   * ```
   */
  async createExportLog(input: CreateExportLogInput): Promise<ExportLog> {
    try {
      const logData: Partial<ExportLog> = {
        export_id: crypto.randomUUID(), // Generate unique export_id
        user_id: input.user_id,
        format: input.format,
        config: input.config,
        conversation_count: input.conversation_count,
        status: input.status || 'queued',
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('export_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        console.error('Error creating export log:', error);
        throw new Error(`Failed to create export log: ${error.message}`);
      }

      return data as ExportLog;
    } catch (error) {
      console.error('Export service error:', error);
      throw error;
    }
  }

  /**
   * Get export log by export_id
   * 
   * Retrieves a single export log record. Returns null if not found
   * (legitimate case for non-existent IDs).
   * 
   * @param export_id - Unique export identifier
   * @returns Export log or null if not found
   * @throws Error if database query fails (except "not found" case)
   * 
   * @example
   * ```typescript
   * const log = await exportService.getExportLog('export-uuid-123');
   * if (log) {
   *   console.log('Export status:', log.status);
   * } else {
   *   console.log('Export not found');
   * }
   * ```
   */
  async getExportLog(export_id: string): Promise<ExportLog | null> {
    try {
      const { data, error } = await this.supabase
        .from('export_logs')
        .select('*')
        .eq('export_id', export_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - legitimate "not found" case
          return null;
        }
        throw error;
      }

      return data as ExportLog;
    } catch (error) {
      console.error('Error fetching export log:', error);
      throw error;
    }
  }

  /**
   * List export logs for a user with optional filters and pagination
   * 
   * Retrieves export logs for a specific user with support for:
   * - Filtering by format, status, and date range
   * - Pagination with configurable page size
   * - Ordered by timestamp (most recent first)
   * 
   * @param user_id - User identifier
   * @param filters - Optional filters (format, status, date range)
   * @param pagination - Optional pagination (page, limit)
   * @returns Array of export logs and total count
   * @throws Error if database query fails
   * 
   * @example
   * ```typescript
   * // Get first page of JSONL exports
   * const result = await exportService.listExportLogs('user-123', {
   *   format: 'jsonl',
   *   status: 'completed'
   * }, {
   *   page: 1,
   *   limit: 25
   * });
   * 
   * console.log(`Found ${result.total} exports, showing ${result.logs.length}`);
   * result.logs.forEach(log => {
   *   console.log(`${log.export_id}: ${log.status}`);
   * });
   * ```
   */
  async listExportLogs(
    user_id: string,
    filters?: {
      format?: ExportLog['format'];
      status?: ExportLog['status'];
      dateFrom?: string;
      dateTo?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ logs: ExportLog[]; total: number }> {
    try {
      // Build query with count
      let query = this.supabase
        .from('export_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', user_id)
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters?.format) {
        query = query.eq('format', filters.format);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('timestamp', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('timestamp', filters.dateTo);
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 25;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        logs: (data || []) as ExportLog[],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error listing export logs:', error);
      throw error;
    }
  }

  /**
   * Update export log status and metadata
   * 
   * Updates an existing export log with new status, file information,
   * or error details. Automatically updates the updated_at timestamp.
   * 
   * @param export_id - Export identifier
   * @param updates - Fields to update (partial update supported)
   * @returns Updated export log
   * @throws ExportNotFoundError if export_id doesn't exist
   * @throws Error if database update fails
   * 
   * @example
   * ```typescript
   * // Mark export as completed with download info
   * const updated = await exportService.updateExportLog('export-uuid-123', {
   *   status: 'completed',
   *   file_size: 1024000,
   *   file_url: 'https://storage.example.com/exports/data.jsonl',
   *   expires_at: new Date(Date.now() + 86400000).toISOString() // 24 hours
   * });
   * 
   * // Mark export as failed
   * await exportService.updateExportLog('export-uuid-456', {
   *   status: 'failed',
   *   error_message: 'Database connection timeout'
   * });
   * ```
   */
  async updateExportLog(
    export_id: string,
    updates: UpdateExportLogInput
  ): Promise<ExportLog> {
    try {
      const updateData: Partial<ExportLog> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('export_logs')
        .update(updateData)
        .eq('export_id', export_id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ExportNotFoundError(export_id);
        }
        throw error;
      }

      return data as ExportLog;
    } catch (error) {
      console.error('Error updating export log:', error);
      throw error;
    }
  }

  /**
   * Delete export log
   * 
   * Permanently removes an export log record. This is typically an admin-only
   * operation and should be used sparingly. Consider marking as 'expired' instead.
   * 
   * @param export_id - Export identifier
   * @throws Error if database delete fails
   * 
   * @example
   * ```typescript
   * await exportService.deleteExportLog('export-uuid-123');
   * console.log('Export log deleted');
   * ```
   */
  async deleteExportLog(export_id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('export_logs')
        .delete()
        .eq('export_id', export_id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting export log:', error);
      throw error;
    }
  }

  /**
   * Mark expired exports
   * 
   * Bulk operation to find completed exports with expired download links
   * and update their status to 'expired'. Typically called by a cleanup job.
   * 
   * @returns Number of exports marked as expired
   * @throws Error if database update fails
   * 
   * @example
   * ```typescript
   * // Run cleanup job
   * const expiredCount = await exportService.markExpiredExports();
   * console.log(`Marked ${expiredCount} exports as expired`);
   * ```
   */
  async markExpiredExports(): Promise<number> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('export_logs')
        .update({ status: 'expired', updated_at: now })
        .eq('status', 'completed')
        .lt('expires_at', now)
        .select('id');

      if (error) {
        throw error;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error marking expired exports:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create an ExportService instance
 * 
 * Convenience function for creating a service instance with
 * dependency-injected Supabase client.
 * 
 * @param supabase - Supabase client instance
 * @returns ExportService instance
 * 
 * @example
 * ```typescript
 * import { createClient } from '@supabase/supabase-js';
 * import { createExportService } from './export-service';
 * 
 * const supabase = createClient(url, key);
 * const exportService = createExportService(supabase);
 * ```
 */
export const createExportService = (supabase: SupabaseClient) => {
  return new ExportService(supabase);
};

