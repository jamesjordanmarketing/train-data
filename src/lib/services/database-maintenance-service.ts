/**
 * Database Maintenance Service
 * 
 * Service layer for executing database maintenance operations (VACUUM, ANALYZE, REINDEX)
 * with safety checks, operation history tracking, and error handling.
 */

import { createClient } from '@supabase/supabase-js';
import {
  MaintenanceOperationRecord,
  MaintenanceOperationOptions,
} from '../types/database-health';

class DatabaseMaintenanceService {
  /**
   * Get Supabase client with lazy initialization
   * Avoids module-level initialization that breaks Next.js build
   */
  private getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  
  /**
   * Execute VACUUM operation on specified table or all tables
   */
  async executeVacuum(options: MaintenanceOperationOptions, userId: string): Promise<MaintenanceOperationRecord> {
    // Validate options
    if (options.operationType !== 'VACUUM' && options.operationType !== 'VACUUM FULL') {
      throw new Error('Invalid operation type for VACUUM');
    }
    
    // Perform safety checks
    await this.performSafetyChecks(options);
    
    // Create maintenance operation record
    const supabase = this.getSupabaseClient();
    const { data: operation, error: createError } = await supabase
      .from('maintenance_operations')
      .insert({
        operation_type: options.operationType,
        table_name: options.tableName || null,
        started_at: new Date().toISOString(),
        status: 'running',
        initiated_by: userId,
        options: {
          verbose: options.verbose || false,
          analyze: options.analyze || false,
        },
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Failed to create maintenance operation record:', createError);
      throw createError;
    }
    
    try {
      // Execute VACUUM via RPC function
      const { error: vacuumError } = await supabase.rpc('execute_vacuum', {
        p_table_name: options.tableName || null,
        p_full: options.operationType === 'VACUUM FULL',
        p_analyze: options.analyze || false,
        p_verbose: options.verbose || false,
      });
      
      if (vacuumError) throw vacuumError;
      
      // Update operation record as completed
      const completedAt = new Date().toISOString();
      const startedAt = new Date(operation.started_at);
      const durationMs = new Date(completedAt).getTime() - startedAt.getTime();
      
      const { data: updatedOperation, error: updateError } = await supabase
        .from('maintenance_operations')
        .update({
          completed_at: completedAt,
          duration_ms: durationMs,
          status: 'completed',
        })
        .eq('id', operation.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      return this.transformOperationRecord(updatedOperation);
    } catch (error) {
      // Update operation record as failed
      await supabase
        .from('maintenance_operations')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq('id', operation.id);
      
      throw error;
    }
  }
  
  /**
   * Execute ANALYZE operation on specified table or all tables
   */
  async executeAnalyze(options: MaintenanceOperationOptions, userId: string): Promise<MaintenanceOperationRecord> {
    if (options.operationType !== 'ANALYZE') {
      throw new Error('Invalid operation type for ANALYZE');
    }
    
    await this.performSafetyChecks(options);
    
    const supabase = this.getSupabaseClient();
    const { data: operation, error: createError } = await supabase
      .from('maintenance_operations')
      .insert({
        operation_type: 'ANALYZE',
        table_name: options.tableName || null,
        started_at: new Date().toISOString(),
        status: 'running',
        initiated_by: userId,
        options: {
          verbose: options.verbose || false,
        },
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    try {
      const { error: analyzeError } = await supabase.rpc('execute_analyze', {
        p_table_name: options.tableName || null,
        p_verbose: options.verbose || false,
      });
      
      if (analyzeError) throw analyzeError;
      
      const completedAt = new Date().toISOString();
      const startedAt = new Date(operation.started_at);
      const durationMs = new Date(completedAt).getTime() - startedAt.getTime();
      
      const { data: updatedOperation, error: updateError } = await supabase
        .from('maintenance_operations')
        .update({
          completed_at: completedAt,
          duration_ms: durationMs,
          status: 'completed',
        })
        .eq('id', operation.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      return this.transformOperationRecord(updatedOperation);
    } catch (error) {
      await supabase
        .from('maintenance_operations')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq('id', operation.id);
      
      throw error;
    }
  }
  
  /**
   * Execute REINDEX operation on specified index or table
   */
  async executeReindex(options: MaintenanceOperationOptions, userId: string): Promise<MaintenanceOperationRecord> {
    if (options.operationType !== 'REINDEX') {
      throw new Error('Invalid operation type for REINDEX');
    }
    
    if (!options.tableName && !options.indexName) {
      throw new Error('Either tableName or indexName must be specified for REINDEX');
    }
    
    await this.performSafetyChecks(options);
    
    const supabase = this.getSupabaseClient();
    const { data: operation, error: createError } = await supabase
      .from('maintenance_operations')
      .insert({
        operation_type: 'REINDEX',
        table_name: options.tableName || null,
        index_name: options.indexName || null,
        started_at: new Date().toISOString(),
        status: 'running',
        initiated_by: userId,
        options: {
          concurrent: options.concurrent || false,
        },
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    try {
      const { error: reindexError } = await supabase.rpc('execute_reindex', {
        p_table_name: options.tableName || null,
        p_index_name: options.indexName || null,
        p_concurrent: options.concurrent || false,
      });
      
      if (reindexError) throw reindexError;
      
      const completedAt = new Date().toISOString();
      const startedAt = new Date(operation.started_at);
      const durationMs = new Date(completedAt).getTime() - startedAt.getTime();
      
      const { data: updatedOperation, error: updateError } = await supabase
        .from('maintenance_operations')
        .update({
          completed_at: completedAt,
          duration_ms: durationMs,
          status: 'completed',
        })
        .eq('id', operation.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      return this.transformOperationRecord(updatedOperation);
    } catch (error) {
      await supabase
        .from('maintenance_operations')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq('id', operation.id);
      
      throw error;
    }
  }
  
  /**
   * Get maintenance operation history
   */
  async getOperationHistory(limit: number = 50): Promise<MaintenanceOperationRecord[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('maintenance_operations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Failed to fetch operation history:', error);
      throw error;
    }
    
    return data.map(this.transformOperationRecord);
  }
  
  /**
   * Get running operations
   */
  async getRunningOperations(): Promise<MaintenanceOperationRecord[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('maintenance_operations')
      .select('*')
      .eq('status', 'running')
      .order('started_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch running operations:', error);
      throw error;
    }
    
    return data.map(this.transformOperationRecord);
  }
  
  /**
   * Perform safety checks before executing maintenance operation
   */
  private async performSafetyChecks(options: MaintenanceOperationOptions): Promise<void> {
    // Check 1: Don't run VACUUM FULL during peak hours (example)
    if (options.operationType === 'VACUUM FULL') {
      const hour = new Date().getHours();
      if (hour >= 9 && hour <= 17) {
        throw new Error('VACUUM FULL cannot be run during peak hours (9 AM - 5 PM)');
      }
    }
    
    // Check 2: Verify table exists if tableName specified
    const supabase = this.getSupabaseClient();
    
    if (options.tableName) {
      const { data, error } = await supabase
        .rpc('table_exists', { p_table_name: options.tableName });
      
      if (error || !data) {
        throw new Error(`Table '${options.tableName}' does not exist`);
      }
    }
    
    // Check 3: Verify index exists if indexName specified
    if (options.indexName) {
      const { data, error } = await supabase
        .rpc('index_exists', { p_index_name: options.indexName });
      
      if (error || !data) {
        throw new Error(`Index '${options.indexName}' does not exist`);
      }
    }
    
    // Check 4: Don't run if another operation is running on same table
    if (options.tableName) {
      const runningOps = await this.getRunningOperations();
      const conflictingOp = runningOps.find(op => op.tableName === options.tableName);
      
      if (conflictingOp) {
        throw new Error(`Another ${conflictingOp.operationType} operation is already running on '${options.tableName}'`);
      }
    }
  }
  
  /**
   * Transform database record to MaintenanceOperationRecord type
   */
  private transformOperationRecord(row: any): MaintenanceOperationRecord {
    return {
      id: row.id,
      operationType: row.operation_type,
      tableName: row.table_name,
      indexName: row.index_name,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      durationMs: row.duration_ms,
      status: row.status,
      initiatedBy: row.initiated_by,
      errorMessage: row.error_message,
      options: row.options || {},
      createdAt: row.created_at,
    };
  }
}

export const databaseMaintenanceService = new DatabaseMaintenanceService();

