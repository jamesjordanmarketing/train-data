/**
 * Edge Case Service
 * 
 * Service for managing edge cases and boundary conditions
 */

import { supabase } from './supabase';
import {
  EdgeCase,
  CreateEdgeCaseInput,
  UpdateEdgeCaseInput,
  EdgeCaseFilter,
} from './types/templates';
import {
  EdgeCaseNotFoundError,
  DatabaseError,
  ErrorCode,
} from './types/errors';
import { createDatabaseError } from './database/errors';

/**
 * EdgeCaseService class
 * Provides all edge case-related database operations
 */
export class EdgeCaseService {
  /**
   * Create a new edge case
   * 
   * @param edgeCase - Edge case creation data
   * @returns Created edge case
   * 
   * @example
   * ```typescript
   * const edgeCase = await edgeCaseService.create({
   *   name: 'Negative Account Balance Inquiry',
   *   description: 'Client asking about how system handles negative balances',
   *   category: 'Error Handling',
   *   triggerCondition: 'Account balance < 0',
   *   expectedBehavior: 'System should prevent negative balance and show warning',
   *   riskLevel: 'high',
   *   priority: 8,
   *   parentTemplateId: templateId,
   *   status: 'active',
   *   createdBy: userId
   * });
   * ```
   */
  async create(edgeCase: CreateEdgeCaseInput): Promise<EdgeCase> {
    try {
      const insertData = {
        name: edgeCase.name,
        description: edgeCase.description,
        category: edgeCase.category,
        trigger_condition: edgeCase.triggerCondition,
        expected_behavior: edgeCase.expectedBehavior,
        risk_level: edgeCase.riskLevel,
        priority: edgeCase.priority,
        test_scenario: edgeCase.testScenario,
        validation_criteria: edgeCase.validationCriteria || [],
        tested: false,
        related_scenario_ids: edgeCase.relatedScenarioIds || [],
        parent_template_id: edgeCase.parentTemplateId,
        status: edgeCase.status || 'active',
        created_by: edgeCase.createdBy,
      };

      const { data: createdEdgeCase, error } = await supabase
        .from('edge_cases')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating edge case:', error);
        throw new DatabaseError(
          `Failed to create edge case`,
          ErrorCode.ERR_DB_QUERY,
          {
            cause: error,
            context: { operation: 'create edge case' }
          }
        );
      }

      return this.mapDbToEdgeCase(createdEdgeCase);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error creating edge case:', error);
      throw new DatabaseError(
        'Unexpected error creating edge case',
        ErrorCode.ERR_DB_QUERY,
        {
          cause: error instanceof Error ? error : new Error(String(error)),
          context: { operation: 'create edge case' }
        }
      );
    }
  }

  /**
   * Get edge case by ID
   * 
   * @param id - Edge case UUID
   * @returns Edge case or null if not found
   */
  async getById(id: string): Promise<EdgeCase | null> {
    try {
      const { data: edgeCase, error } = await supabase
        .from('edge_cases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching edge case:', error);
        throw createDatabaseError('Failed to fetch edge case', error, 'fetch edge case');
      }

      return this.mapDbToEdgeCase(edgeCase);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error fetching edge case:', error);
      throw createDatabaseError('Unexpected error fetching edge case', error, 'fetch edge case');
    }
  }

  /**
   * List edge cases with optional filters
   * 
   * @param filters - Optional filter configuration
   * @returns Array of edge cases
   * 
   * @example
   * ```typescript
   * const edgeCases = await edgeCaseService.list({
   *   riskLevel: 'high',
   *   status: 'active',
   *   tested: false
   * });
   * ```
   */
  async list(filters?: EdgeCaseFilter): Promise<EdgeCase[]> {
    try {
      let query = supabase.from('edge_cases').select('*');

      if (filters?.riskLevel) {
        query = query.eq('risk_level', filters.riskLevel);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.tested !== undefined) {
        query = query.eq('tested', filters.tested);
      }

      if (filters?.parentTemplateId) {
        query = query.eq('parent_template_id', filters.parentTemplateId);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      query = query.order('priority', { ascending: false });
      query = query.order('created_at', { ascending: false });

      const { data: edgeCases, error } = await query;

      if (error) {
        console.error('Error listing edge cases:', error);
        throw createDatabaseError('Failed to list edge cases', error, 'list edge cases');
      }

      return (edgeCases || []).map(this.mapDbToEdgeCase);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error listing edge cases:', error);
      throw createDatabaseError('Unexpected error listing edge cases', error, 'list edge cases');
    }
  }

  /**
   * Update an edge case
   * 
   * @param id - Edge case UUID
   * @param updates - Partial edge case updates
   * @returns Updated edge case
   * @throws EdgeCaseNotFoundError if edge case doesn't exist
   */
  async update(id: string, updates: UpdateEdgeCaseInput): Promise<EdgeCase> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new EdgeCaseNotFoundError(id);
      }

      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.triggerCondition !== undefined) updateData.trigger_condition = updates.triggerCondition;
      if (updates.expectedBehavior !== undefined) updateData.expected_behavior = updates.expectedBehavior;
      if (updates.riskLevel !== undefined) updateData.risk_level = updates.riskLevel;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.testScenario !== undefined) updateData.test_scenario = updates.testScenario;
      if (updates.validationCriteria !== undefined) updateData.validation_criteria = updates.validationCriteria;
      if (updates.tested !== undefined) updateData.tested = updates.tested;
      if (updates.lastTestedAt !== undefined) updateData.last_tested_at = updates.lastTestedAt;
      if (updates.relatedScenarioIds !== undefined) updateData.related_scenario_ids = updates.relatedScenarioIds;
      if (updates.parentTemplateId !== undefined) updateData.parent_template_id = updates.parentTemplateId;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { data: edgeCase, error } = await supabase
        .from('edge_cases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating edge case:', error);
        throw createDatabaseError('Failed to update edge case', error, 'update edge case');
      }

      return this.mapDbToEdgeCase(edgeCase);
    } catch (error) {
      if (error instanceof EdgeCaseNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error updating edge case:', error);
      throw createDatabaseError('Unexpected error updating edge case', error, 'update edge case');
    }
  }

  /**
   * Delete an edge case
   * 
   * @param id - Edge case UUID
   * @throws EdgeCaseNotFoundError if edge case doesn't exist
   */
  async delete(id: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new EdgeCaseNotFoundError(id);
      }

      const { error } = await supabase
        .from('edge_cases')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting edge case:', error);
        throw createDatabaseError('Failed to delete edge case', error, 'delete edge case');
      }
    } catch (error) {
      if (error instanceof EdgeCaseNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error deleting edge case:', error);
      throw createDatabaseError('Unexpected error deleting edge case', error, 'delete edge case');
    }
  }

  /**
   * Mark edge case as tested
   * 
   * @param id - Edge case UUID
   */
  async markAsTested(id: string): Promise<void> {
    try {
      await this.update(id, {
        tested: true,
        lastTestedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof EdgeCaseNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error marking as tested:', error);
      throw createDatabaseError('Unexpected error marking as tested', error, 'mark as tested');
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private mapDbToEdgeCase(dbRecord: any): EdgeCase {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      category: dbRecord.category,
      triggerCondition: dbRecord.trigger_condition,
      expectedBehavior: dbRecord.expected_behavior,
      riskLevel: dbRecord.risk_level,
      priority: dbRecord.priority,
      testScenario: dbRecord.test_scenario,
      validationCriteria: dbRecord.validation_criteria || [],
      tested: dbRecord.tested,
      lastTestedAt: dbRecord.last_tested_at,
      relatedScenarioIds: dbRecord.related_scenario_ids || [],
      parentTemplateId: dbRecord.parent_template_id,
      status: dbRecord.status,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: dbRecord.created_by,
    };
  }
}

// Export singleton instance
export const edgeCaseService = new EdgeCaseService();

