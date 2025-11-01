/**
 * Scenario Service - Complete CRUD Operations for Scenarios
 * 
 * Provides comprehensive database operations for managing scenarios derived from templates.
 * Includes relationship handling with templates and conversation generation tracking.
 * 
 * @module ScenarioService
 */

import { createClient } from '@supabase/supabase-js';
import type { Scenario } from '../../../train-wireframe/src/lib/types';

// ============================================================================
// Type Definitions
// ============================================================================

export type GenerationStatus = 'not_generated' | 'generated' | 'error';

export type CreateScenarioInput = Omit<
  Scenario,
  'id' | 'variationCount' | 'qualityScore' | 'createdAt' | 'parentTemplateName' | 'generationStatus' | 'conversationId' | 'errorMessage'
>;

export type UpdateScenarioInput = Partial<
  Omit<Scenario, 'id' | 'createdAt' | 'createdBy' | 'parentTemplateName'>
>;

export interface ScenarioFilters {
  parentTemplateId?: string;
  status?: 'draft' | 'active' | 'archived';
  persona?: string;
  topic?: string;
  emotionalArc?: string;
  generationStatus?: GenerationStatus;
}

export interface DeleteResult {
  success: boolean;
  message: string;
}

// ============================================================================
// Scenario Service Class
// ============================================================================

export class ScenarioService {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  /**
   * Get all scenarios with optional filtering
   * 
   * @param filters - Optional filters for parent template, status, etc.
   * @returns Array of scenarios matching the filters
   * 
   * @example
   * ```typescript
   * const scenarios = await service.getAll({
   *   parentTemplateId: templateId,
   *   status: 'active'
   * });
   * ```
   */
  async getAll(filters?: ScenarioFilters): Promise<Scenario[]> {
    try {
      let query = this.supabase
        .from('scenarios')
        .select(`
          *,
          templates:parent_template_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.parentTemplateId) {
        query = query.eq('parent_template_id', filters.parentTemplateId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.persona) {
        query = query.eq('persona', filters.persona);
      }

      if (filters?.topic) {
        query = query.eq('topic', filters.topic);
      }

      if (filters?.emotionalArc) {
        query = query.eq('emotional_arc', filters.emotionalArc);
      }

      if (filters?.generationStatus) {
        query = query.eq('generation_status', filters.generationStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch scenarios:', error);
        throw new Error(`Failed to fetch scenarios: ${error.message}`);
      }

      return this.mapToScenarioArray(data || []);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error fetching scenarios');
    }
  }

  /**
   * Get scenarios by template ID
   * 
   * @param templateId - Parent template UUID
   * @returns Array of scenarios belonging to the specified template
   * 
   * @example
   * ```typescript
   * const scenarios = await service.getByTemplateId(templateId);
   * ```
   */
  async getByTemplateId(templateId: string): Promise<Scenario[]> {
    return this.getAll({ parentTemplateId: templateId });
  }

  /**
   * Get a single scenario by ID
   * 
   * @param id - Scenario UUID
   * @returns Scenario object or null if not found
   * 
   * @example
   * ```typescript
   * const scenario = await service.getById('550e8400-e29b-41d4-a716-446655440000');
   * ```
   */
  async getById(id: string): Promise<Scenario | null> {
    try {
      const { data, error } = await this.supabase
        .from('scenarios')
        .select(`
          *,
          templates:parent_template_id (
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
        console.error('Failed to fetch scenario:', error);
        throw new Error(`Failed to fetch scenario: ${error.message}`);
      }

      return this.mapToScenario(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error fetching scenario');
    }
  }

  /**
   * Create a new scenario
   * 
   * @param input - Scenario creation data
   * @returns Newly created scenario
   * @throws Error if parent template not found or creation fails
   * 
   * @example
   * ```typescript
   * const scenario = await service.create({
   *   name: 'Market Downturn Discussion',
   *   description: 'Client concerned about recent market volatility',
   *   parentTemplateId: templateId,
   *   context: 'Recent 15% market decline has caused anxiety',
   *   parameterValues: { situation: 'market_downturn', timeframe: 'recent' },
   *   status: 'active',
   *   topic: 'Market Volatility',
   *   persona: 'Anxious Investor',
   *   emotionalArc: 'Anxiety → Understanding → Reassurance',
   *   createdBy: userId
   * });
   * ```
   */
  async create(input: CreateScenarioInput): Promise<Scenario> {
    try {
      // Validate required fields
      if (!input.name || input.name.trim() === '') {
        throw new Error('Scenario name is required');
      }
      if (!input.context || input.context.trim() === '') {
        throw new Error('Scenario context is required');
      }

      // Validate parent template exists (if provided)
      if (input.parentTemplateId) {
        const { data: template, error: templateError } = await this.supabase
          .from('templates')
          .select('id, name')
          .eq('id', input.parentTemplateId)
          .single();

        if (templateError || !template) {
          throw new Error(
            `Parent template with ID ${input.parentTemplateId} not found`
          );
        }
      }

      // Get current user ID
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user && !input.createdBy) {
        throw new Error('User not authenticated');
      }

      // Map to database schema
      const dbData = {
        name: input.name,
        description: input.description || '',
        parent_template_id: input.parentTemplateId,
        context: input.context,
        parameter_values: input.parameterValues || {},
        variation_count: 0,
        status: input.status || 'draft',
        quality_score: 0,
        topic: input.topic || '',
        persona: input.persona || '',
        emotional_arc: input.emotionalArc || '',
        generation_status: 'not_generated' as GenerationStatus,
        conversation_id: null,
        error_message: null,
        created_by: input.createdBy || user?.id,
      };

      const { data, error } = await this.supabase
        .from('scenarios')
        .insert(dbData)
        .select(`
          *,
          templates:parent_template_id (
            name
          )
        `)
        .single();

      if (error) {
        console.error('Failed to create scenario:', error);
        throw new Error(`Failed to create scenario: ${error.message}`);
      }

      return this.mapToScenario(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error creating scenario');
    }
  }

  /**
   * Update an existing scenario
   * 
   * @param id - Scenario UUID
   * @param input - Partial scenario updates
   * @returns Updated scenario
   * @throws Error if scenario not found or update fails
   * 
   * @example
   * ```typescript
   * const updated = await service.update(scenarioId, {
   *   status: 'active',
   *   qualityScore: 0.85
   * });
   * ```
   */
  async update(id: string, input: UpdateScenarioInput): Promise<Scenario> {
    try {
      // Check if scenario exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Scenario with ID ${id} not found`);
      }

      // Build update object
      const dbUpdates: any = {};

      if (input.name !== undefined) dbUpdates.name = input.name;
      if (input.description !== undefined) dbUpdates.description = input.description;
      if (input.parentTemplateId !== undefined) {
        // Validate new parent template exists
        const { data: template, error: templateError } = await this.supabase
          .from('templates')
          .select('id')
          .eq('id', input.parentTemplateId)
          .single();

        if (templateError || !template) {
          throw new Error(
            `Parent template with ID ${input.parentTemplateId} not found`
          );
        }
        dbUpdates.parent_template_id = input.parentTemplateId;
      }
      if (input.context !== undefined) dbUpdates.context = input.context;
      if (input.parameterValues !== undefined) dbUpdates.parameter_values = input.parameterValues;
      if (input.variationCount !== undefined) dbUpdates.variation_count = input.variationCount;
      if (input.status !== undefined) dbUpdates.status = input.status;
      if (input.qualityScore !== undefined) dbUpdates.quality_score = input.qualityScore;
      if (input.topic !== undefined) dbUpdates.topic = input.topic;
      if (input.persona !== undefined) dbUpdates.persona = input.persona;
      if (input.emotionalArc !== undefined) dbUpdates.emotional_arc = input.emotionalArc;
      if (input.generationStatus !== undefined) dbUpdates.generation_status = input.generationStatus;
      if (input.conversationId !== undefined) dbUpdates.conversation_id = input.conversationId;
      if (input.errorMessage !== undefined) dbUpdates.error_message = input.errorMessage;

      const { data, error } = await this.supabase
        .from('scenarios')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          templates:parent_template_id (
            name
          )
        `)
        .single();

      if (error) {
        console.error('Failed to update scenario:', error);
        throw new Error(`Failed to update scenario: ${error.message}`);
      }

      return this.mapToScenario(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error updating scenario');
    }
  }

  /**
   * Delete a scenario (with dependency checking)
   * 
   * Uses safe_delete_scenario function to check for dependencies.
   * Returns error if edge cases depend on this scenario.
   * 
   * @param id - Scenario UUID
   * @returns Delete result with success status and message
   * 
   * @example
   * ```typescript
   * const result = await service.delete(scenarioId);
   * if (!result.success) {
   *   console.error(result.message);
   * }
   * ```
   */
  async delete(id: string): Promise<DeleteResult> {
    try {
      // Check if scenario exists
      const existing = await this.getById(id);
      if (!existing) {
        return {
          success: false,
          message: `Scenario with ID ${id} not found`,
        };
      }

      // Use safe_delete function if available
      const { data, error } = await this.supabase.rpc('safe_delete_scenario', {
        scenario_id: id,
      });

      if (error) {
        // If function doesn't exist, fall back to direct delete with manual check
        if (error.code === '42883') {
          // Check for dependent edge cases
          const { count, error: countError } = await this.supabase
            .from('edge_cases')
            .select('*', { count: 'exact', head: true })
            .eq('parent_scenario_id', id);

          if (countError) {
            throw new Error(`Failed to check dependencies: ${countError.message}`);
          }

          if (count && count > 0) {
            return {
              success: false,
              message: `Cannot delete scenario: ${count} edge case(s) depend on it. Delete dependent edge cases first.`,
            };
          }

          // No dependencies, proceed with delete
          const { error: deleteError } = await this.supabase
            .from('scenarios')
            .delete()
            .eq('id', id);

          if (deleteError) {
            throw new Error(`Failed to delete scenario: ${deleteError.message}`);
          }

          return {
            success: true,
            message: 'Scenario deleted successfully',
          };
        }

        throw new Error(`Failed to delete scenario: ${error.message}`);
      }

      // Return result from safe_delete function
      const result = Array.isArray(data) ? data[0] : data;
      return {
        success: result?.success || false,
        message: result?.message || 'Unknown error occurred',
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: 'Unexpected error deleting scenario',
      };
    }
  }

  /**
   * Update generation status for a scenario
   * 
   * Called when conversation generation starts, completes, or fails.
   * 
   * @param id - Scenario UUID
   * @param status - New generation status
   * @param conversationId - Optional conversation ID if generated successfully
   * @param errorMessage - Optional error message if generation failed
   * @throws Error if scenario not found or update fails
   * 
   * @example
   * ```typescript
   * // On successful generation
   * await service.updateGenerationStatus(
   *   scenarioId,
   *   'generated',
   *   conversationId
   * );
   * 
   * // On generation error
   * await service.updateGenerationStatus(
   *   scenarioId,
   *   'error',
   *   undefined,
   *   'API rate limit exceeded'
   * );
   * ```
   */
  async updateGenerationStatus(
    id: string,
    status: GenerationStatus,
    conversationId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      // Check if scenario exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Scenario with ID ${id} not found`);
      }

      const dbUpdates: any = {
        generation_status: status,
      };

      if (conversationId !== undefined) {
        dbUpdates.conversation_id = conversationId;
      }

      if (errorMessage !== undefined) {
        dbUpdates.error_message = errorMessage;
      }

      // Clear error message if status is not 'error'
      if (status !== 'error') {
        dbUpdates.error_message = null;
      }

      const { error } = await this.supabase
        .from('scenarios')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update generation status: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error updating generation status');
    }
  }

  /**
   * Bulk create multiple scenarios
   * 
   * Creates multiple scenarios in a single transaction.
   * Useful for batch scenario generation from templates.
   * 
   * @param scenarios - Array of scenario creation inputs
   * @returns Array of created scenarios
   * @throws Error if any creation fails
   * 
   * @example
   * ```typescript
   * const scenarios = await service.bulkCreate([
   *   {
   *     name: 'Scenario 1',
   *     context: 'Context 1',
   *     parentTemplateId: templateId,
   *     createdBy: userId
   *   },
   *   {
   *     name: 'Scenario 2',
   *     context: 'Context 2',
   *     parentTemplateId: templateId,
   *     createdBy: userId
   *   }
   * ]);
   * ```
   */
  async bulkCreate(scenarios: CreateScenarioInput[]): Promise<Scenario[]> {
    try {
      if (!scenarios || scenarios.length === 0) {
        return [];
      }

      // Validate all inputs first
      for (const input of scenarios) {
        if (!input.name || input.name.trim() === '') {
          throw new Error('All scenarios must have a name');
        }
        if (!input.context || input.context.trim() === '') {
          throw new Error('All scenarios must have context');
        }
      }

      // Get current user ID
      const { data: { user } } = await this.supabase.auth.getUser();
      
      // Map all scenarios to database schema
      const dbDataArray = scenarios.map((input) => ({
        name: input.name,
        description: input.description || '',
        parent_template_id: input.parentTemplateId,
        context: input.context,
        parameter_values: input.parameterValues || {},
        variation_count: 0,
        status: input.status || 'draft',
        quality_score: 0,
        topic: input.topic || '',
        persona: input.persona || '',
        emotional_arc: input.emotionalArc || '',
        generation_status: 'not_generated' as GenerationStatus,
        conversation_id: null,
        error_message: null,
        created_by: input.createdBy || user?.id,
      }));

      const { data, error } = await this.supabase
        .from('scenarios')
        .insert(dbDataArray)
        .select(`
          *,
          templates:parent_template_id (
            name
          )
        `);

      if (error) {
        console.error('Failed to bulk create scenarios:', error);
        throw new Error(`Failed to bulk create scenarios: ${error.message}`);
      }

      return this.mapToScenarioArray(data || []);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error bulk creating scenarios');
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Map database record to Scenario type
   */
  private mapToScenario(dbRecord: any): Scenario {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description || '',
      parentTemplateId: dbRecord.parent_template_id,
      parentTemplateName: dbRecord.templates?.name || '',
      context: dbRecord.context,
      parameterValues: dbRecord.parameter_values || {},
      variationCount: dbRecord.variation_count || 0,
      status: dbRecord.status,
      qualityScore: dbRecord.quality_score || 0,
      createdAt: dbRecord.created_at,
      createdBy: dbRecord.created_by,
      topic: dbRecord.topic || '',
      persona: dbRecord.persona || '',
      emotionalArc: dbRecord.emotional_arc || '',
      generationStatus: dbRecord.generation_status || 'not_generated',
      conversationId: dbRecord.conversation_id,
      errorMessage: dbRecord.error_message,
    };
  }

  /**
   * Map array of database records to Scenario array
   */
  private mapToScenarioArray(dbRecords: any[]): Scenario[] {
    return dbRecords.map((record) => this.mapToScenario(record));
  }
}

/**
 * Create a singleton instance of ScenarioService
 * 
 * @param supabaseClient - Supabase client instance
 * @returns ScenarioService instance
 * 
 * @example
 * ```typescript
 * import { supabase } from '../supabase';
 * import { createScenarioService } from './scenario-service';
 * 
 * const scenarioService = createScenarioService(supabase);
 * const scenarios = await scenarioService.getAll();
 * ```
 */
export function createScenarioService(
  supabaseClient: ReturnType<typeof createClient>
): ScenarioService {
  return new ScenarioService(supabaseClient);
}

