/**
 * Scenario Service
 * 
 * Service for managing scenarios derived from templates
 */

import { supabase } from './supabase';
import {
  Scenario,
  CreateScenarioInput,
  UpdateScenarioInput,
  ScenarioFilter,
} from './types/templates';
import {
  ScenarioNotFoundError,
  DatabaseError,
  ErrorCode,
} from './types/errors';
import { createDatabaseError } from './database/errors';

/**
 * ScenarioService class
 * Provides all scenario-related database operations
 */
export class ScenarioService {
  /**
   * Create a new scenario
   * 
   * @param scenario - Scenario creation data
   * @returns Created scenario
   * 
   * @example
   * ```typescript
   * const scenario = await scenarioService.create({
   *   name: 'Retirement Planning - Market Downturn',
   *   description: 'Client concerned about market impact on retirement',
   *   parentTemplateId: templateId,
   *   context: 'Recent market volatility has caused anxiety...',
   *   topic: 'Retirement Planning',
   *   persona: 'Anxious Investor',
   *   emotionalArc: 'Anxiety → Understanding → Reassurance',
   *   complexity: 'moderate',
   *   status: 'active',
   *   createdBy: userId
   * });
   * ```
   */
  async create(scenario: CreateScenarioInput): Promise<Scenario> {
    try {
      const insertData = {
        name: scenario.name,
        description: scenario.description,
        parent_template_id: scenario.parentTemplateId,
        context: scenario.context,
        topic: scenario.topic,
        persona: scenario.persona,
        emotional_arc: scenario.emotionalArc,
        complexity: scenario.complexity,
        emotional_context: scenario.emotionalContext,
        parameter_values: scenario.parameterValues || {},
        tags: scenario.tags || [],
        variation_count: 0,
        status: scenario.status || 'draft',
        created_by: scenario.createdBy,
      };

      const { data: createdScenario, error } = await supabase
        .from('scenarios')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating scenario:', error);
        throw createDatabaseError('Failed to create scenario', error, 'create scenario');
      }

      return this.mapDbToScenario(createdScenario);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error creating scenario:', error);
      throw createDatabaseError('Unexpected error creating scenario', error, 'create scenario');
    }
  }

  /**
   * Get scenario by ID
   * 
   * @param id - Scenario UUID
   * @returns Scenario or null if not found
   */
  async getById(id: string): Promise<Scenario | null> {
    try {
      const { data: scenario, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching scenario:', error);
        throw createDatabaseError('Failed to fetch scenario', error, 'fetch scenario');
      }

      return this.mapDbToScenario(scenario);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error fetching scenario:', error);
      throw createDatabaseError('Unexpected error fetching scenario', error, 'fetch scenario');
    }
  }

  /**
   * List scenarios with optional filters
   * 
   * @param filters - Optional filter configuration
   * @returns Array of scenarios
   * 
   * @example
   * ```typescript
   * const scenarios = await scenarioService.list({
   *   parentTemplateId: templateId,
   *   status: 'active',
   *   complexity: 'moderate'
   * });
   * ```
   */
  async list(filters?: ScenarioFilter): Promise<Scenario[]> {
    try {
      let query = supabase.from('scenarios').select('*');

      if (filters?.parentTemplateId) {
        query = query.eq('parent_template_id', filters.parentTemplateId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.complexity) {
        query = query.eq('complexity', filters.complexity);
      }

      if (filters?.persona) {
        query = query.eq('persona', filters.persona);
      }

      query = query.order('created_at', { ascending: false });

      const { data: scenarios, error } = await query;

      if (error) {
        console.error('Error listing scenarios:', error);
        throw createDatabaseError('Failed to list scenarios', error, 'list scenarios');
      }

      return (scenarios || []).map(this.mapDbToScenario);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error listing scenarios:', error);
      throw createDatabaseError('Unexpected error listing scenarios', error, 'list scenarios');
    }
  }

  /**
   * Update a scenario
   * 
   * @param id - Scenario UUID
   * @param updates - Partial scenario updates
   * @returns Updated scenario
   * @throws ScenarioNotFoundError if scenario doesn't exist
   */
  async update(id: string, updates: UpdateScenarioInput): Promise<Scenario> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new ScenarioNotFoundError(id);
      }

      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.parentTemplateId !== undefined) updateData.parent_template_id = updates.parentTemplateId;
      if (updates.context !== undefined) updateData.context = updates.context;
      if (updates.topic !== undefined) updateData.topic = updates.topic;
      if (updates.persona !== undefined) updateData.persona = updates.persona;
      if (updates.emotionalArc !== undefined) updateData.emotional_arc = updates.emotionalArc;
      if (updates.complexity !== undefined) updateData.complexity = updates.complexity;
      if (updates.emotionalContext !== undefined) updateData.emotional_context = updates.emotionalContext;
      if (updates.parameterValues !== undefined) updateData.parameter_values = updates.parameterValues;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.variationCount !== undefined) updateData.variation_count = updates.variationCount;
      if (updates.qualityScore !== undefined) updateData.quality_score = updates.qualityScore;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { data: scenario, error } = await supabase
        .from('scenarios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating scenario:', error);
        throw createDatabaseError('Failed to update scenario', error, 'update scenario');
      }

      return this.mapDbToScenario(scenario);
    } catch (error) {
      if (error instanceof ScenarioNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error updating scenario:', error);
      throw createDatabaseError('Unexpected error updating scenario', error, 'update scenario');
    }
  }

  /**
   * Delete a scenario
   * 
   * @param id - Scenario UUID
   * @throws ScenarioNotFoundError if scenario doesn't exist
   */
  async delete(id: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new ScenarioNotFoundError(id);
      }

      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting scenario:', error);
        throw createDatabaseError('Failed to delete scenario', error, 'delete scenario');
      }
    } catch (error) {
      if (error instanceof ScenarioNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error deleting scenario:', error);
      throw createDatabaseError('Unexpected error deleting scenario', error, 'delete scenario');
    }
  }

  /**
   * Increment scenario variation count
   * 
   * @param id - Scenario UUID
   */
  async incrementVariationCount(id: string): Promise<void> {
    try {
      const scenario = await this.getById(id);
      if (!scenario) {
        throw new ScenarioNotFoundError(id);
      }

      const { error } = await supabase
        .from('scenarios')
        .update({ variation_count: scenario.variationCount + 1 })
        .eq('id', id);

      if (error) {
        console.error('Error incrementing variation count:', error);
        throw createDatabaseError('Failed to increment variation count', error, 'increment variation count');
      }
    } catch (error) {
      if (error instanceof ScenarioNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error incrementing variation count:', error);
      throw createDatabaseError('Unexpected error incrementing variation count', error, 'increment variation count');
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private mapDbToScenario(dbRecord: any): Scenario {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      parentTemplateId: dbRecord.parent_template_id,
      context: dbRecord.context,
      topic: dbRecord.topic,
      persona: dbRecord.persona,
      emotionalArc: dbRecord.emotional_arc,
      complexity: dbRecord.complexity,
      emotionalContext: dbRecord.emotional_context,
      parameterValues: dbRecord.parameter_values || {},
      tags: dbRecord.tags || [],
      variationCount: dbRecord.variation_count,
      qualityScore: dbRecord.quality_score,
      status: dbRecord.status,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: dbRecord.created_by,
    };
  }
}

// Export singleton instance
export const scenarioService = new ScenarioService();

