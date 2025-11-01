/**
 * Configuration Change Management Types
 * 
 * Type definitions for tracking configuration changes, managing audit trails,
 * and enabling safe rollback capabilities for User Preferences and AI Configuration.
 */

import type { AIConfiguration } from './ai-config';

/**
 * Configuration type discriminator
 */
export type ConfigType = 'user_preference' | 'ai_config';

/**
 * Configuration audit log entry
 * Represents a single change event in the audit trail
 */
export interface ConfigurationAuditLogEntry {
  id: string;
  configType: ConfigType;
  configId: string;
  changedBy: string;
  changedAt: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  changeReason?: string;
  clientIp?: string;
  userAgent?: string;
}

/**
 * Configuration change history with pagination
 * Used for displaying change history in UI
 */
export interface ConfigurationChangeHistory {
  entries: ConfigurationAuditLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Configuration diff showing changes between two configurations
 * Tracks added, modified, and removed configuration keys
 */
export interface ConfigurationDiff {
  added: Array<{ path: string; value: any }>;
  modified: Array<{ path: string; oldValue: any; newValue: any }>;
  removed: Array<{ path: string; value: any }>;
}

/**
 * Rollback preview showing what will change
 * Provides a preview of rollback operation before execution
 */
export interface RollbackPreview {
  targetVersion: ConfigurationAuditLogEntry;
  currentValues: Record<string, any>;
  targetValues: Record<string, any>;
  diff: ConfigurationDiff;
  warnings: string[]; // Potential issues with rollback
}

/**
 * Rollback validation result
 * Indicates whether a rollback operation is safe to execute
 */
export interface RollbackValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Rollback options for executing a configuration rollback
 */
export interface RollbackOptions {
  configType: ConfigType;
  configId: string;
  targetAuditLogId: string;
  reason?: string;
  confirmWarnings?: boolean; // User confirmed warnings
}

/**
 * Bulk rollback options for rolling back multiple configurations atomically
 */
export interface BulkRollbackOptions {
  rollbacks: RollbackOptions[];
  reason?: string;
}

/**
 * Change history query filters
 * Used for filtering and searching configuration change history
 */
export interface ChangeHistoryFilters {
  configType?: ConfigType;
  configId?: string;
  changedBy?: string;
  startDate?: string;
  endDate?: string;
  searchText?: string; // Search in change_reason
}

/**
 * Change statistics for analytics and reporting
 * Provides insights into configuration change patterns
 */
export interface ChangeStatistics {
  totalChanges: number;
  changesByType: Record<ConfigType, number>;
  changesByUser: Record<string, number>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
  mostChangedConfigs: Array<{
    configType: ConfigType;
    configId: string;
    changeCount: number;
  }>;
}

/**
 * Database row type for configuration_audit_log table
 */
export interface ConfigurationAuditLogRow {
  id: string;
  config_type: string;
  config_id: string;
  changed_by: string;
  changed_at: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  change_reason: string | null;
  client_ip: string | null;
  user_agent: string | null;
}

/**
 * Rollback execution result
 */
export interface RollbackResult {
  success: boolean;
  configType: ConfigType;
  configId: string;
  targetAuditLogId: string;
  error?: string;
}

/**
 * Bulk rollback execution result
 */
export interface BulkRollbackResult {
  success: boolean;
  results: RollbackResult[];
  errors: string[];
}

