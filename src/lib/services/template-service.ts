/**
 * Template Service - Complete CRUD Operations for Templates
 * 
 * Provides comprehensive database operations for managing conversation templates
 * with proper error handling, type safety, and database integration.
 * 
 * @module TemplateService
 */

import { createClient } from '@supabase/supabase-js';
import type { Template, TemplateVariable } from '@/lib/types';

// ============================================================================
// Type Definitions
// ============================================================================

export type CreateTemplateInput = Omit<Template, 'id' | 'usageCount' | 'rating' | 'lastModified'>;

export type UpdateTemplateInput = Partial<Omit<Template, 'id' | 'usageCount' | 'rating' | 'createdBy'>>;

export interface TemplateFilters {
  category?: string;
  minRating?: number;
  search?: string;
  tier?: 'template' | 'scenario' | 'edge_case';
  isActive?: boolean;
}

export interface DeleteResult {
  success: boolean;
  message: string;
}

// ============================================================================
// Template Service Class
// ============================================================================

export class TemplateService {
  constructor(private supabase: any) {}

  /**
   * Get all templates with optional filtering
   * 
   * @param filters - Optional filters for category, rating, search, etc.
   * @returns Array of templates matching the filters
   * 
   * @example
   * ```typescript
   * const templates = await service.getAll({ category: 'Financial Planning', minRating: 4 });
   * ```
   */
  async getAll(filters?: TemplateFilters): Promise<Template[]> {
    try {
      let query = this.supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters?.tier) {
        query = query.eq('tier', filters.tier);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch templates:', error);
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }

      return this.mapToTemplateArray(data || []);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error fetching templates');
    }
  }

  /**
   * Get templates by category
   * 
   * @param category - Category name to filter by
   * @returns Array of templates in the specified category
   */
  async getByCategory(category: string): Promise<Template[]> {
    return this.getAll({ category });
  }

  /**
   * Search templates by query string
   * 
   * @param query - Search query to match against name and description
   * @returns Array of templates matching the search query
   */
  async search(query: string): Promise<Template[]> {
    return this.getAll({ search: query });
  }

  /**
   * Get a single template by ID
   * 
   * @param id - Template UUID
   * @returns Template object or null if not found
   * 
   * @example
   * ```typescript
   * const template = await service.getById('550e8400-e29b-41d4-a716-446655440000');
   * if (!template) {
   *   console.log('Template not found');
   * }
   * ```
   */
  async getById(id: string): Promise<Template | null> {
    try {
      const { data, error } = await this.supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - return null instead of throwing
          return null;
        }
        console.error('Failed to fetch template:', error);
        throw new Error(`Failed to fetch template: ${error.message}`);
      }

      return this.mapToTemplate(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error fetching template');
    }
  }

  /**
   * Get template by name
   * 
   * @param name - Template name to search for
   * @returns Template if found, null otherwise
   */
  async getByName(name: string): Promise<Template | null> {
    try {
      const { data, error } = await this.supabase
        .from('templates')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - return null instead of throwing
          return null;
        }
        console.error('Failed to fetch template:', error);
        throw new Error(`Failed to fetch template: ${error.message}`);
      }

      return this.mapToTemplate(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error fetching template');
    }
  }

  /**
   * Create a new template
   * 
   * @param input - Template creation data
   * @returns Newly created template
   * @throws Error if user is not authenticated or creation fails
   * 
   * @example
   * ```typescript
   * const template = await service.create({
   *   name: 'Retirement Planning',
   *   description: 'Template for retirement planning conversations',
   *   category: 'Financial Planning',
   *   structure: 'Discuss {{topic}} with {{persona}}',
   *   variables: [{ name: 'topic', type: 'text', defaultValue: 'retirement goals' }],
   *   tone: 'Professional and empathetic',
   *   complexityBaseline: 5,
   *   qualityThreshold: 0.7,
   *   requiredElements: ['goal_setting', 'risk_assessment'],
   *   createdBy: userId
   * });
   * ```
   */
  async create(input: CreateTemplateInput): Promise<Template> {
    try {
      // Validate required fields
      if (!input.name || input.name.trim() === '') {
        throw new Error('Template name is required');
      }
      if (!input.structure || input.structure.trim() === '') {
        throw new Error('Template structure is required');
      }

      // Get current user ID
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Map to database schema
      const dbData = {
        name: input.name,
        description: input.description || '',
        category: input.category || 'General',
        structure: input.structure,
        variables: input.variables || [],
        tone: input.tone || '',
        complexity_baseline: input.complexityBaseline || 5,
        style_notes: input.styleNotes,
        example_conversation: input.exampleConversation,
        quality_threshold: input.qualityThreshold || 0.7,
        required_elements: input.requiredElements || [],
        usage_count: 0,
        rating: 0,
        created_by: input.createdBy || user.id,
        tier: input.tier || 'template',
        is_active: input.isActive !== false,
        version: input.version || 1,
        applicable_personas: input.applicablePersonas || [],
        applicable_emotions: input.applicableEmotions || [],
      };

      const { data, error } = await this.supabase
        .from('templates')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Failed to create template:', error);
        throw new Error(`Failed to create template: ${error.message}`);
      }

      return this.mapToTemplate(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error creating template');
    }
  }

  /**
   * Update an existing template
   * 
   * @param id - Template UUID
   * @param input - Partial template updates
   * @returns Updated template
   * @throws Error if template not found or update fails
   * 
   * @example
   * ```typescript
   * const updated = await service.update(templateId, {
   *   description: 'Updated description',
   *   qualityThreshold: 0.8
   * });
   * ```
   */
  async update(id: string, input: UpdateTemplateInput): Promise<Template> {
    try {
      // Check if template exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Template with ID ${id} not found`);
      }

      // Build update object
      const dbUpdates: any = {
        last_modified: new Date().toISOString(),
      };

      if (input.name !== undefined) dbUpdates.name = input.name;
      if (input.description !== undefined) dbUpdates.description = input.description;
      if (input.category !== undefined) dbUpdates.category = input.category;
      if (input.structure !== undefined) dbUpdates.structure = input.structure;
      if (input.variables !== undefined) dbUpdates.variables = input.variables;
      if (input.tone !== undefined) dbUpdates.tone = input.tone;
      if (input.complexityBaseline !== undefined) dbUpdates.complexity_baseline = input.complexityBaseline;
      if (input.styleNotes !== undefined) dbUpdates.style_notes = input.styleNotes;
      if (input.exampleConversation !== undefined) dbUpdates.example_conversation = input.exampleConversation;
      if (input.qualityThreshold !== undefined) dbUpdates.quality_threshold = input.qualityThreshold;
      if (input.requiredElements !== undefined) dbUpdates.required_elements = input.requiredElements;
      if (input.tier !== undefined) dbUpdates.tier = input.tier;
      if (input.isActive !== undefined) dbUpdates.is_active = input.isActive;
      if (input.version !== undefined) dbUpdates.version = input.version;
      if (input.applicablePersonas !== undefined) dbUpdates.applicable_personas = input.applicablePersonas;
      if (input.applicableEmotions !== undefined) dbUpdates.applicable_emotions = input.applicableEmotions;

      const { data, error } = await this.supabase
        .from('templates')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update template:', error);
        throw new Error(`Failed to update template: ${error.message}`);
      }

      return this.mapToTemplate(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error updating template');
    }
  }

  /**
   * Delete a template (with dependency checking)
   * 
   * Uses safe_delete_template function to check for dependencies.
   * Returns error if scenarios depend on this template.
   * 
   * @param id - Template UUID
   * @returns Delete result with success status and message
   * 
   * @example
   * ```typescript
   * const result = await service.delete(templateId);
   * if (!result.success) {
   *   console.error(result.message);
   * }
   * ```
   */
  async delete(id: string): Promise<DeleteResult> {
    try {
      // Check if template exists
      const existing = await this.getById(id);
      if (!existing) {
        return {
          success: false,
          message: `Template with ID ${id} not found`,
        };
      }

      // Use safe_delete function if available
      const { data, error } = await this.supabase.rpc('safe_delete_template', {
        template_id: id,
      });

      if (error) {
        // If function doesn't exist, fall back to direct delete with manual check
        if (error.code === '42883') {
          // Check for dependent scenarios
          const { count, error: countError } = await this.supabase
            .from('scenarios')
            .select('*', { count: 'exact', head: true })
            .eq('parent_template_id', id);

          if (countError) {
            throw new Error(`Failed to check dependencies: ${countError.message}`);
          }

          if (count && count > 0) {
            return {
              success: false,
              message: `Cannot delete template: ${count} scenario(s) depend on it. Archive the template or delete dependent scenarios first.`,
            };
          }

          // No dependencies, proceed with delete
          const { error: deleteError } = await this.supabase
            .from('templates')
            .delete()
            .eq('id', id);

          if (deleteError) {
            throw new Error(`Failed to delete template: ${deleteError.message}`);
          }

          return {
            success: true,
            message: 'Template deleted successfully',
          };
        }

        throw new Error(`Failed to delete template: ${error.message}`);
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
        message: 'Unexpected error deleting template',
      };
    }
  }

  /**
   * Duplicate a template with a new name
   * 
   * Creates a copy of an existing template with a new name.
   * Resets usage count and rating to 0.
   * 
   * @param id - Template UUID to duplicate
   * @param newName - Name for the duplicated template
   * @returns Newly created template copy
   * @throws Error if template not found or duplication fails
   * 
   * @example
   * ```typescript
   * const duplicate = await service.duplicate(templateId, 'Retirement Planning (Copy)');
   * ```
   */
  async duplicate(id: string, newName: string, includeScenarios?: boolean): Promise<Template> {
    try {
      // Get the original template
      const original = await this.getById(id);
      if (!original) {
        throw new Error(`Template with ID ${id} not found`);
      }

      // Create a copy with the new name
      const duplicateInput: CreateTemplateInput = {
        ...original,
        name: newName,
        // Don't copy these fields
        usageCount: undefined as any,
        rating: undefined as any,
        lastModified: undefined as any,
      };

      const duplicated = await this.create(duplicateInput);
      
      // TODO: If includeScenarios is true, duplicate related scenarios
      // This functionality can be implemented later if needed
      
      return duplicated;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error duplicating template');
    }
  }

  /**
   * Increment the usage count for a template
   * 
   * Called when a template is used to generate a conversation.
   * 
   * @param id - Template UUID
   * @throws Error if template not found or increment fails
   * 
   * @example
   * ```typescript
   * await service.incrementUsageCount(templateId);
   * ```
   */
  async incrementUsageCount(id: string): Promise<void> {
    try {
      // Check if template exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Template with ID ${id} not found`);
      }

      // Try using RPC function first
      const { error: rpcError } = await this.supabase.rpc('increment_template_usage', {
        template_id: id,
      });

      if (rpcError) {
        // If function doesn't exist, fall back to manual increment
        if (rpcError.code === '42883') {
          const { error } = await this.supabase
            .from('templates')
            .update({ usage_count: existing.usageCount + 1 })
            .eq('id', id);

          if (error) {
            throw new Error(`Failed to increment usage count: ${error.message}`);
          }
          return;
        }

        throw new Error(`Failed to increment usage count: ${rpcError.message}`);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error incrementing usage count');
    }
  }

  /**
   * Update the rating for a template
   * 
   * @param id - Template UUID
   * @param rating - New rating value (0-5)
   * @throws Error if template not found or rating is invalid
   * 
   * @example
   * ```typescript
   * await service.updateRating(templateId, 4.5);
   * ```
   */
  async updateRating(id: string, rating: number): Promise<void> {
    try {
      // Validate rating
      if (rating < 0 || rating > 5) {
        throw new Error('Rating must be between 0 and 5');
      }

      // Check if template exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Template with ID ${id} not found`);
      }

      const { error } = await this.supabase
        .from('templates')
        .update({ rating })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update rating: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unexpected error updating rating');
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Map database record to Template type
   */
  private mapToTemplate(dbRecord: any): Template {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description || '',
      category: dbRecord.category,
      structure: dbRecord.structure,
      variables: dbRecord.variables || [],
      tone: dbRecord.tone || '',
      complexityBaseline: dbRecord.complexity_baseline || 5,
      styleNotes: dbRecord.style_notes,
      exampleConversation: dbRecord.example_conversation,
      qualityThreshold: dbRecord.quality_threshold || 0.7,
      requiredElements: dbRecord.required_elements || [],
      usageCount: dbRecord.usage_count || 0,
      rating: dbRecord.rating || 0,
      lastModified: dbRecord.last_modified || dbRecord.updated_at || dbRecord.created_at,
      createdBy: dbRecord.created_by,
      tier: dbRecord.tier,
      isActive: dbRecord.is_active,
      version: dbRecord.version,
      applicablePersonas: dbRecord.applicable_personas || [],
      applicableEmotions: dbRecord.applicable_emotions || [],
    };
  }

  /**
   * Map array of database records to Template array
   */
  private mapToTemplateArray(dbRecords: any[]): Template[] {
    return dbRecords.map((record) => this.mapToTemplate(record));
  }
}

/**
 * Create a singleton instance of TemplateService
 * 
 * @param supabaseClient - Supabase client instance
 * @returns TemplateService instance
 * 
 * @example
 * ```typescript
 * import { supabase } from '../supabase';
 * import { createTemplateService } from './template-service';
 * 
 * const templateService = createTemplateService(supabase);
 * const templates = await templateService.getAll();
 * ```
 */
export function createTemplateService(
  supabaseClient: ReturnType<typeof createClient>
): TemplateService {
  return new TemplateService(supabaseClient);
}

