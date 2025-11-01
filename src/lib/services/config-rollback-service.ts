/**
 * Configuration Rollback Service
 * 
 * Provides comprehensive configuration change management including:
 * - Change history retrieval and filtering
 * - Rollback preview and validation
 * - Safe rollback execution with validation
 * - Bulk rollback operations
 * - Change statistics and analytics
 * - CSV export for compliance reporting
 */

import { supabase } from '../supabase';
import {
  ConfigurationAuditLogEntry,
  ConfigurationChangeHistory,
  ConfigurationDiff,
  RollbackPreview,
  RollbackValidationResult,
  RollbackOptions,
  BulkRollbackOptions,
  ChangeHistoryFilters,
  ChangeStatistics,
  ConfigurationAuditLogRow,
  ConfigType,
} from '../types/config-change-management';
import { validateAIConfiguration } from '../types/ai-config';

class ConfigRollbackService {
  /**
   * Get change history for a specific configuration
   * @param configType - Type of configuration (user_preference or ai_config)
   * @param configId - UUID of the configuration
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of entries per page
   * @returns Paginated change history
   */
  async getChangeHistory(
    configType: ConfigType,
    configId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ConfigurationChangeHistory> {
    const offset = (page - 1) * pageSize;
    
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('configuration_audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('config_type', configType)
        .eq('config_id', configId);
      
      if (countError) {
        console.error('Failed to count audit log entries:', countError);
        throw countError;
      }
      
      // Get entries for current page
      const { data, error } = await supabase
        .from('configuration_audit_log')
        .select('*')
        .eq('config_type', configType)
        .eq('config_id', configId)
        .order('changed_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (error) {
        console.error('Failed to fetch change history:', error);
        throw error;
      }
      
      const totalCount = count || 0;
      const hasMore = offset + pageSize < totalCount;
      
      return {
        entries: (data || []).map(this.transformAuditLogEntry),
        totalCount,
        page,
        pageSize,
        hasMore,
      };
    } catch (error) {
      console.error('Error in getChangeHistory:', error);
      throw error;
    }
  }
  
  /**
   * Get change history with advanced filters
   * @param filters - Filter criteria
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of entries per page
   * @returns Filtered paginated change history
   */
  async getFilteredChangeHistory(
    filters: ChangeHistoryFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ConfigurationChangeHistory> {
    const offset = (page - 1) * pageSize;
    
    try {
      let query = supabase
        .from('configuration_audit_log')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters.configType) {
        query = query.eq('config_type', filters.configType);
      }
      if (filters.configId) {
        query = query.eq('config_id', filters.configId);
      }
      if (filters.changedBy) {
        query = query.eq('changed_by', filters.changedBy);
      }
      if (filters.startDate) {
        query = query.gte('changed_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('changed_at', filters.endDate);
      }
      if (filters.searchText) {
        query = query.ilike('change_reason', `%${filters.searchText}%`);
      }
      
      // Execute count query
      const { count, error: countError } = await query;
      
      if (countError) {
        console.error('Failed to count filtered audit log entries:', countError);
        throw countError;
      }
      
      // Get entries with pagination
      const { data, error } = await query
        .order('changed_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (error) {
        console.error('Failed to fetch filtered change history:', error);
        throw error;
      }
      
      const totalCount = count || 0;
      const hasMore = offset + pageSize < totalCount;
      
      return {
        entries: (data || []).map(this.transformAuditLogEntry),
        totalCount,
        page,
        pageSize,
        hasMore,
      };
    } catch (error) {
      console.error('Error in getFilteredChangeHistory:', error);
      throw error;
    }
  }
  
  /**
   * Preview rollback before applying
   * Shows what will change and generates warnings
   * @param configType - Type of configuration
   * @param configId - Configuration ID
   * @param targetAuditLogId - Audit log entry to rollback to
   * @returns Rollback preview with diff and warnings
   */
  async previewRollback(
    configType: ConfigType,
    configId: string,
    targetAuditLogId: string
  ): Promise<RollbackPreview> {
    try {
      // Get target audit log entry
      const { data: targetEntry, error: targetError } = await supabase
        .from('configuration_audit_log')
        .select('*')
        .eq('id', targetAuditLogId)
        .single();
      
      if (targetError || !targetEntry) {
        console.error('Failed to fetch target audit log entry:', targetError);
        throw new Error('Target audit log entry not found');
      }
      
      // Get current configuration
      let currentValues: Record<string, any>;
      if (configType === 'user_preference') {
        const { data: currentConfig, error: currentError } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('id', configId)
          .single();
        
        if (currentError || !currentConfig) {
          throw new Error('Current configuration not found');
        }
        currentValues = currentConfig.preferences;
      } else {
        const { data: currentConfig, error: currentError } = await supabase
          .from('ai_configurations')
          .select('configuration')
          .eq('id', configId)
          .single();
        
        if (currentError || !currentConfig) {
          throw new Error('Current configuration not found');
        }
        currentValues = currentConfig.configuration;
      }
      
      // Target values from audit log (rollback to old values)
      const targetValues = targetEntry.old_values || {};
      
      // Generate diff
      const diff = this.generateDiff(currentValues, targetValues);
      
      // Generate warnings
      const warnings: string[] = [];
      if (diff.removed.length > 0) {
        warnings.push(`${diff.removed.length} configuration key(s) will be removed`);
      }
      if (diff.added.length > 0) {
        warnings.push(`${diff.added.length} new configuration key(s) will be added`);
      }
      if (diff.modified.length > 10) {
        warnings.push('Large number of changes detected - please review carefully');
      }
      
      // Check if rollback is recent
      const changeDate = new Date(targetEntry.changed_at);
      const daysSince = (Date.now() - changeDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 30) {
        warnings.push(`Rolling back to a configuration from ${Math.floor(daysSince)} days ago`);
      }
      
      return {
        targetVersion: this.transformAuditLogEntry(targetEntry),
        currentValues,
        targetValues,
        diff,
        warnings,
      };
    } catch (error) {
      console.error('Error in previewRollback:', error);
      throw error;
    }
  }
  
  /**
   * Validate rollback before applying
   * Checks if target configuration is valid
   * @param options - Rollback options
   * @returns Validation result with errors and warnings
   */
  async validateRollback(options: RollbackOptions): Promise<RollbackValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Get target audit log entry
      const { data: targetEntry, error: targetError } = await supabase
        .from('configuration_audit_log')
        .select('old_values')
        .eq('id', options.targetAuditLogId)
        .single();
      
      if (targetError || !targetEntry) {
        errors.push('Target audit log entry not found');
        return { isValid: false, errors, warnings };
      }
      
      const targetValues = targetEntry.old_values;
      
      if (!targetValues || Object.keys(targetValues).length === 0) {
        errors.push('Target configuration is empty or invalid');
        return { isValid: false, errors, warnings };
      }
      
      // Validate based on config type
      if (options.configType === 'user_preference') {
        // User preferences validation
        // Add specific validation logic here when user preferences type is available
        // For now, basic structural validation
        if (typeof targetValues !== 'object') {
          errors.push('User preferences must be an object');
        }
      } else if (options.configType === 'ai_config') {
        // AI configuration validation
        const validationErrors = validateAIConfiguration(targetValues);
        if (validationErrors.length > 0) {
          errors.push(...validationErrors);
        }
      }
      
      // Check for warnings
      if (!options.confirmWarnings) {
        warnings.push('User has not confirmed warnings');
      }
      
      if (!options.reason || options.reason.trim() === '') {
        warnings.push('No reason provided for rollback');
      }
      
    } catch (error) {
      errors.push('Validation failed: ' + (error instanceof Error ? error.message : String(error)));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
  
  /**
   * Execute rollback to a previous configuration state
   * @param options - Rollback options
   * @param userId - User executing the rollback
   */
  async rollbackToVersion(options: RollbackOptions, userId: string): Promise<void> {
    try {
      // Validate rollback
      const validation = await this.validateRollback(options);
      if (!validation.isValid) {
        throw new Error(`Rollback validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Get target values
      const { data: targetEntry, error: targetError } = await supabase
        .from('configuration_audit_log')
        .select('old_values')
        .eq('id', options.targetAuditLogId)
        .single();
      
      if (targetError || !targetEntry) {
        throw new Error('Target audit log entry not found');
      }
      
      const targetValues = targetEntry.old_values;
      
      // Execute rollback based on config type
      if (options.configType === 'user_preference') {
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update({ preferences: targetValues })
          .eq('id', options.configId);
        
        if (updateError) {
          throw new Error('Failed to rollback user preferences: ' + updateError.message);
        }
      } else if (options.configType === 'ai_config') {
        const { error: updateError } = await supabase
          .from('ai_configurations')
          .update({ configuration: targetValues })
          .eq('id', options.configId);
        
        if (updateError) {
          throw new Error('Failed to rollback AI configuration: ' + updateError.message);
        }
      }
      
      // Log rollback action
      await this.logRollbackAction(options, userId);
      
      console.log(`Rollback completed successfully for ${options.configType}:${options.configId}`);
    } catch (error) {
      console.error('Error in rollbackToVersion:', error);
      throw error;
    }
  }
  
  /**
   * Execute bulk rollback (atomic)
   * Validates all rollbacks before executing any
   * @param options - Bulk rollback options
   * @param userId - User executing the rollback
   */
  async bulkRollback(options: BulkRollbackOptions, userId: string): Promise<void> {
    try {
      // Validate all rollbacks first
      const validations = await Promise.all(
        options.rollbacks.map(rollback => this.validateRollback(rollback))
      );
      
      const hasErrors = validations.some(v => !v.isValid);
      if (hasErrors) {
        const allErrors = validations.flatMap(v => v.errors);
        throw new Error(`Bulk rollback validation failed: ${allErrors.join(', ')}`);
      }
      
      // Execute all rollbacks
      // Note: Supabase doesn't support true transactions in client
      // This is best-effort sequential execution
      for (const rollback of options.rollbacks) {
        await this.rollbackToVersion(rollback, userId);
      }
      
      console.log(`Bulk rollback completed successfully for ${options.rollbacks.length} configurations`);
    } catch (error) {
      console.error('Error in bulkRollback:', error);
      throw error;
    }
  }
  
  /**
   * Get change statistics for analytics and reporting
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns Change statistics
   */
  async getChangeStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<ChangeStatistics> {
    try {
      let query = supabase
        .from('configuration_audit_log')
        .select('*');
      
      if (startDate) {
        query = query.gte('changed_at', startDate);
      }
      if (endDate) {
        query = query.lte('changed_at', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch change statistics:', error);
        throw error;
      }
      
      const entries = data || [];
      
      // Calculate statistics
      const totalChanges = entries.length;
      
      const changesByType: Record<string, number> = {};
      const changesByUser: Record<string, number> = {};
      const mostChangedConfigs: Record<string, number> = {};
      
      entries.forEach((entry: ConfigurationAuditLogRow) => {
        // By type
        changesByType[entry.config_type] = (changesByType[entry.config_type] || 0) + 1;
        
        // By user
        changesByUser[entry.changed_by] = (changesByUser[entry.changed_by] || 0) + 1;
        
        // By config
        const configKey = `${entry.config_type}:${entry.config_id}`;
        mostChangedConfigs[configKey] = (mostChangedConfigs[configKey] || 0) + 1;
      });
      
      // Recent activity (last 7 days)
      const recentActivity = this.calculateRecentActivity(entries);
      
      // Most changed configs (top 10)
      const mostChangedConfigsArray = Object.entries(mostChangedConfigs)
        .map(([key, count]) => {
          const [configType, configId] = key.split(':');
          return { configType: configType as ConfigType, configId, changeCount: count };
        })
        .sort((a, b) => b.changeCount - a.changeCount)
        .slice(0, 10);
      
      return {
        totalChanges,
        changesByType: changesByType as Record<ConfigType, number>,
        changesByUser,
        recentActivity,
        mostChangedConfigs: mostChangedConfigsArray,
      };
    } catch (error) {
      console.error('Error in getChangeStatistics:', error);
      throw error;
    }
  }
  
  /**
   * Export change history as CSV for compliance reporting
   * @param filters - Filter criteria
   * @returns CSV content as string
   */
  async exportChangeHistoryCSV(
    filters: ChangeHistoryFilters
  ): Promise<string> {
    try {
      // Get all matching entries (no pagination)
      let query = supabase
        .from('configuration_audit_log')
        .select('*');
      
      if (filters.configType) {
        query = query.eq('config_type', filters.configType);
      }
      if (filters.configId) {
        query = query.eq('config_id', filters.configId);
      }
      if (filters.changedBy) {
        query = query.eq('changed_by', filters.changedBy);
      }
      if (filters.startDate) {
        query = query.gte('changed_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('changed_at', filters.endDate);
      }
      
      const { data, error } = await query.order('changed_at', { ascending: false });
      
      if (error) {
        console.error('Failed to fetch audit log for CSV export:', error);
        throw error;
      }
      
      // Generate CSV
      const headers = ['ID', 'Config Type', 'Config ID', 'Changed By', 'Changed At', 'Change Reason'];
      const rows = (data || []).map((entry: ConfigurationAuditLogRow) => [
        entry.id,
        entry.config_type,
        entry.config_id,
        entry.changed_by,
        entry.changed_at,
        entry.change_reason || '',
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');
      
      return csvContent;
    } catch (error) {
      console.error('Error in exportChangeHistoryCSV:', error);
      throw error;
    }
  }
  
  /**
   * Transform database row to ConfigurationAuditLogEntry
   * @param row - Database row
   * @returns Transformed audit log entry
   */
  private transformAuditLogEntry(row: any): ConfigurationAuditLogEntry {
    return {
      id: row.id,
      configType: row.config_type,
      configId: row.config_id,
      changedBy: row.changed_by,
      changedAt: row.changed_at,
      oldValues: row.old_values,
      newValues: row.new_values,
      changeReason: row.change_reason,
      clientIp: row.client_ip,
      userAgent: row.user_agent,
    };
  }
  
  /**
   * Generate diff between two configuration objects
   * Supports nested object comparison
   * @param oldConfig - Old configuration
   * @param newConfig - New configuration
   * @returns Configuration diff
   */
  private generateDiff(
    oldConfig: Record<string, any>,
    newConfig: Record<string, any>
  ): ConfigurationDiff {
    const added: Array<{ path: string; value: any }> = [];
    const modified: Array<{ path: string; oldValue: any; newValue: any }> = [];
    const removed: Array<{ path: string; value: any }> = [];
    
    // Helper function to traverse nested objects
    const traverse = (
      oldObj: any,
      newObj: any,
      path: string = ''
    ) => {
      const allKeys = new Set([
        ...Object.keys(oldObj || {}),
        ...Object.keys(newObj || {}),
      ]);
      
      allKeys.forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        const oldValue = oldObj?.[key];
        const newValue = newObj?.[key];
        
        if (oldValue === undefined && newValue !== undefined) {
          added.push({ path: currentPath, value: newValue });
        } else if (oldValue !== undefined && newValue === undefined) {
          removed.push({ path: currentPath, value: oldValue });
        } else if (
          typeof oldValue === 'object' &&
          typeof newValue === 'object' &&
          oldValue !== null &&
          newValue !== null &&
          !Array.isArray(oldValue) &&
          !Array.isArray(newValue)
        ) {
          // Recursively traverse nested objects
          traverse(oldValue, newValue, currentPath);
        } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          modified.push({ path: currentPath, oldValue, newValue });
        }
      });
    };
    
    traverse(oldConfig, newConfig);
    
    return { added, modified, removed };
  }
  
  /**
   * Calculate recent activity (last 7 days)
   * @param entries - Audit log entries
   * @returns Recent activity data
   */
  private calculateRecentActivity(
    entries: any[]
  ): Array<{ date: string; count: number }> {
    const activity: Record<string, number> = {};
    
    // Get last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activity[dateStr] = 0;
    }
    
    // Count entries per day
    entries.forEach(entry => {
      const dateStr = entry.changed_at.split('T')[0];
      if (activity[dateStr] !== undefined) {
        activity[dateStr]++;
      }
    });
    
    return Object.entries(activity)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  /**
   * Log rollback action for audit trail
   * @param options - Rollback options
   * @param userId - User ID
   */
  private async logRollbackAction(
    options: RollbackOptions,
    userId: string
  ): Promise<void> {
    try {
      await supabase
        .from('configuration_audit_log')
        .insert({
          config_type: options.configType,
          config_id: options.configId,
          changed_by: userId,
          change_reason: options.reason || `Rollback to version ${options.targetAuditLogId}`,
        });
    } catch (error) {
      console.error('Failed to log rollback action:', error);
      // Don't throw - logging failure shouldn't fail the rollback
    }
  }
}

export const configRollbackService = new ConfigRollbackService();

