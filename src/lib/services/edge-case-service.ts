/**
 * Edge Case Service - Complete CRUD Operations for Edge Cases
 * 
 * Provides comprehensive database operations for managing edge cases and boundary conditions.
 * Includes relationship handling with scenarios and test status tracking.
 * 
 * @module EdgeCaseService
 */

import { createClient } from '@supabase/supabase-js';
import type { EdgeCase } from '@/lib/types';

// ============================================================================
// Type Definitions
// ============================================================================

export type EdgeCaseType =
  | 'error_condition'
  | 'boundary_value'
  | 'unusual_input'
  | 'complex_combination'
  | 'failure_scenario';

export type TestStatus = 'not_tested' | 'passed' | 'failed';

export interface TestResults {
  expectedBehavior: string;
  actualBehavior: string;
  passed: boolean;
  testDate: string;
}

export type CreateEdgeCaseInput = Omit<
  EdgeCase,
  'id' | 'createdAt' | 'parentScenarioName' | 'testStatus' | 'testResults'
>;

export type UpdateEdgeCaseInput = Partial<
  Omit<EdgeCase, 'id' | 'createdAt' | 'createdBy' | 'parentScenarioName'>
>;

export interface EdgeCaseFilters {
  parentScenarioId?: string;
  edgeCaseType?: EdgeCaseType;
  complexity?: number;
  minComplexity?: number;
  maxComplexity?: number;
  testStatus?: TestStatus;
}

// ============================================================================
// Edge Case Service Class
// ============================================================================

export class EdgeCaseService {
  constructor(private supabase: any) {}

  /**
   * Get all edge cases with optional filtering
   * 
   * @param filters - Optional filters for scenario, type, complexity, etc.
   * @returns Array of edge cases matching the filters
   * 
   * @example
   * ```typescript
   * const edgeCases = await service.getAll({
   *   parentScenarioId: scenarioId,
   *   testStatus: 'not_tested'
   * });
   * ```
   */
  async getAll(filters?: EdgeCaseFilters): Promise<EdgeCase[]> {
    try {
      let query = this.supabase
        .from('edge_cases')
        .select(`
          *,
          scenarios:parent_scenario_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.parentScenarioId) {
        query = query.eq('parent_scenario_id', filters.parentScenarioId);
      }

      if (filters?.edgeCaseType) {
        query = query.eq('edge_case_type', filters.edgeCaseType);
      }

      if (filters?.complexity !== undefined) {
        query = query.eq('complexity', filters.complexity);
      }

      if (filters?.minComplexity !== undefined) {
        query = query.gte('complexity', filters.minComplexity);
      }

      if (filters?.maxComplexity !== undefined) {
        query = query.lte('complexity', filters.maxComplexity);
      }

      if (filters?.testStatus) {
        query = query.eq('test_status', filters.testStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch edge cases:', error);
        throw new Error(`Failed to fetch edge cases: ${error.message}`);
      }

      return this.mapToEdgeCaseArray(data || []);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error fetching edge cases');
    }
  }

  /**
   * Get edge cases by scenario ID
   * 
   * @param scenarioId - Parent scenario UUID
   * @returns Array of edge cases belonging to the specified scenario
   * 
   * @example
   * ```typescript
   * const edgeCases = await service.getByScenarioId(scenarioId);
   * ```
   */
  async getByScenarioId(scenarioId: string): Promise<EdgeCase[]> {
    return this.getAll({ parentScenarioId: scenarioId });
  }

  /**
   * Get edge cases by type
   * 
   * @param type - Edge case type
   * @returns Array of edge cases of the specified type
   * 
   * @example
   * ```typescript
   * const errorCases = await service.getByType('error_condition');
   * ```
   */
  async getByType(type: EdgeCaseType): Promise<EdgeCase[]> {
    return this.getAll({ edgeCaseType: type });
  }

  /**
   * Get a single edge case by ID
   * 
   * @param id - Edge case UUID
   * @returns Edge case object or null if not found
   * 
   * @example
   * ```typescript
   * const edgeCase = await service.getById('550e8400-e29b-41d4-a716-446655440000');
   * ```
   */
  async getById(id: string): Promise<EdgeCase | null> {
    try {
      const { data, error } = await this.supabase
        .from('edge_cases')
        .select(`
          *,
          scenarios:parent_scenario_id (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - return null instead of throwing
          return null;
        }
        console.error('Failed to fetch edge case:', error);
        throw new Error(`Failed to fetch edge case: ${error.message}`);
      }

      return this.mapToEdgeCase(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error fetching edge case');
    }
  }

  /**
   * Get edge case by name
   * 
   * @param name - Edge case name to search for
   * @returns Edge case if found, null otherwise
   */
  async getByName(name: string): Promise<EdgeCase | null> {
    try {
      const { data, error } = await this.supabase
        .from('edge_cases')
        .select(`
          *,
          scenarios:parent_scenario_id (
            name
          )
        `)
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - return null instead of throwing
          return null;
        }
        console.error('Failed to fetch edge case:', error);
        throw new Error(`Failed to fetch edge case: ${error.message}`);
      }

      return this.mapToEdgeCase(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error fetching edge case');
    }
  }

  /**
   * Create a new edge case
   * 
   * @param input - Edge case creation data
   * @returns Newly created edge case
   * @throws Error if parent scenario not found or creation fails
   * 
   * @example
   * ```typescript
   * const edgeCase = await service.create({
   *   title: 'Negative Account Balance',
   *   description: 'User attempts to withdraw more than account balance',
   *   parentScenarioId: scenarioId,
   *   edgeCaseType: 'error_condition',
   *   complexity: 7,
   *   createdBy: userId
   * });
   * ```
   */
  async create(input: CreateEdgeCaseInput): Promise<EdgeCase> {
    try {
      // Validate required fields
      if (!input.title || input.title.trim() === '') {
        throw new Error('Edge case title is required');
      }
      if (!input.description || input.description.trim() === '') {
        throw new Error('Edge case description is required');
      }
      if (!input.parentScenarioId) {
        throw new Error('Parent scenario ID is required');
      }

      // Validate parent scenario exists
      const { data: scenario, error: scenarioError } = await this.supabase
        .from('scenarios')
        .select('id, name')
        .eq('id', input.parentScenarioId)
        .single();

      if (scenarioError || !scenario) {
        throw new Error(
          `Parent scenario with ID ${input.parentScenarioId} not found`
        );
      }

      // Validate complexity range (1-10)
      if (input.complexity !== undefined && (input.complexity < 1 || input.complexity > 10)) {
        throw new Error('Complexity must be between 1 and 10');
      }

      // Get current user ID
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user && !input.createdBy) {
        throw new Error('User not authenticated');
      }

      // Map to database schema
      const dbData = {
        title: input.title,
        description: input.description,
        parent_scenario_id: input.parentScenarioId,
        edge_case_type: input.edgeCaseType || 'error_condition',
        complexity: input.complexity || 5,
        test_status: 'not_tested' as TestStatus,
        test_results: null,
        created_by: input.createdBy || user?.id,
      };

      const { data, error } = await this.supabase
        .from('edge_cases')
        .insert(dbData)
        .select(`
          *,
          scenarios:parent_scenario_id (
            name
          )
        `)
        .single();

      if (error) {
        console.error('Failed to create edge case:', error);
        throw new Error(`Failed to create edge case: ${error.message}`);
      }

      return this.mapToEdgeCase(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error creating edge case');
    }
  }

  /**
   * Update an existing edge case
   * 
   * @param id - Edge case UUID
   * @param input - Partial edge case updates
   * @returns Updated edge case
   * @throws Error if edge case not found or update fails
   * 
   * @example
   * ```typescript
   * const updated = await service.update(edgeCaseId, {
   *   complexity: 8,
   *   description: 'Updated description'
   * });
   * ```
   */
  async update(id: string, input: UpdateEdgeCaseInput): Promise<EdgeCase> {
    try {
      // Check if edge case exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Edge case with ID ${id} not found`);
      }

      // Validate complexity range if provided
      if (input.complexity !== undefined && (input.complexity < 1 || input.complexity > 10)) {
        throw new Error('Complexity must be between 1 and 10');
      }

      // Build update object
      const dbUpdates: any = {};

      if (input.title !== undefined) dbUpdates.title = input.title;
      if (input.description !== undefined) dbUpdates.description = input.description;
      if (input.parentScenarioId !== undefined) {
        // Validate new parent scenario exists
        const { data: scenario, error: scenarioError } = await this.supabase
          .from('scenarios')
          .select('id')
          .eq('id', input.parentScenarioId)
          .single();

        if (scenarioError || !scenario) {
          throw new Error(
            `Parent scenario with ID ${input.parentScenarioId} not found`
          );
        }
        dbUpdates.parent_scenario_id = input.parentScenarioId;
      }
      if (input.edgeCaseType !== undefined) dbUpdates.edge_case_type = input.edgeCaseType;
      if (input.complexity !== undefined) dbUpdates.complexity = input.complexity;
      if (input.testStatus !== undefined) dbUpdates.test_status = input.testStatus;
      if (input.testResults !== undefined) dbUpdates.test_results = input.testResults;

      const { data, error } = await this.supabase
        .from('edge_cases')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          scenarios:parent_scenario_id (
            name
          )
        `)
        .single();

      if (error) {
        console.error('Failed to update edge case:', error);
        throw new Error(`Failed to update edge case: ${error.message}`);
      }

      return this.mapToEdgeCase(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error updating edge case');
    }
  }

  /**
   * Delete an edge case
   * 
   * Edge cases have no dependencies, so they can be safely deleted.
   * 
   * @param id - Edge case UUID
   * @throws Error if edge case not found or deletion fails
   * 
   * @example
   * ```typescript
   * await service.delete(edgeCaseId);
   * ```
   */
  async delete(id: string): Promise<void> {
    try {
      // Check if edge case exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Edge case with ID ${id} not found`);
      }

      const { error } = await this.supabase
        .from('edge_cases')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete edge case:', error);
        throw new Error(`Failed to delete edge case: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error deleting edge case');
    }
  }

  /**
   * Update test status for an edge case
   * 
   * Called when edge case testing is performed.
   * 
   * @param id - Edge case UUID
   * @param status - New test status
   * @param testResults - Optional test results if test was executed
   * @throws Error if edge case not found or update fails
   * 
   * @example
   * ```typescript
   * // Mark as passed with results
   * await service.updateTestStatus(edgeCaseId, 'passed', {
   *   expectedBehavior: 'Show error message',
   *   actualBehavior: 'Error message displayed correctly',
   *   passed: true,
   *   testDate: new Date().toISOString()
   * });
   * 
   * // Mark as failed with results
   * await service.updateTestStatus(edgeCaseId, 'failed', {
   *   expectedBehavior: 'Show error message',
   *   actualBehavior: 'No error message shown',
   *   passed: false,
   *   testDate: new Date().toISOString()
   * });
   * ```
   */
  async updateTestStatus(
    id: string,
    status: TestStatus,
    testResults?: TestResults
  ): Promise<void> {
    try {
      // Check if edge case exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Edge case with ID ${id} not found`);
      }

      // Validate test results if provided
      if (testResults) {
        if (!testResults.expectedBehavior || testResults.expectedBehavior.trim() === '') {
          throw new Error('Test results must include expected behavior');
        }
        if (!testResults.actualBehavior || testResults.actualBehavior.trim() === '') {
          throw new Error('Test results must include actual behavior');
        }
        if (testResults.passed === undefined) {
          throw new Error('Test results must include passed status');
        }
        if (!testResults.testDate) {
          throw new Error('Test results must include test date');
        }
      }

      const dbUpdates: any = {
        test_status: status,
      };

      if (testResults !== undefined) {
        dbUpdates.test_results = testResults;
      }

      const { error } = await this.supabase
        .from('edge_cases')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update test status: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error updating test status');
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Map database record to EdgeCase type
   */
  private mapToEdgeCase(dbRecord: any): EdgeCase {
    return {
      id: dbRecord.id,
      title: dbRecord.title,
      description: dbRecord.description,
      parentScenarioId: dbRecord.parent_scenario_id,
      parentScenarioName: dbRecord.scenarios?.name || '',
      edgeCaseType: dbRecord.edge_case_type,
      complexity: dbRecord.complexity,
      testStatus: dbRecord.test_status,
      testResults: dbRecord.test_results,
      createdAt: dbRecord.created_at,
      createdBy: dbRecord.created_by,
    };
  }

  /**
   * Map array of database records to EdgeCase array
   */
  private mapToEdgeCaseArray(dbRecords: any[]): EdgeCase[] {
    return dbRecords.map((record) => this.mapToEdgeCase(record));
  }
}

/**
 * Create a singleton instance of EdgeCaseService
 * 
 * @param supabaseClient - Supabase client instance
 * @returns EdgeCaseService instance
 * 
 * @example
 * ```typescript
 * import { supabase } from '../supabase';
 * import { createEdgeCaseService } from './edge-case-service';
 * 
 * const edgeCaseService = createEdgeCaseService(supabase);
 * const edgeCases = await edgeCaseService.getAll();
 * ```
 */
export function createEdgeCaseService(
  supabaseClient: ReturnType<typeof createClient>
): EdgeCaseService {
  return new EdgeCaseService(supabaseClient);
}

