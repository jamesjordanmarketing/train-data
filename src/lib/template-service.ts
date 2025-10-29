/**
 * Template Service
 * 
 * Service for managing conversation templates with template resolution
 * and parameter validation.
 */

import { supabase } from './supabase';
import {
  Template,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateFilter,
  TemplateStats,
  ValidationResult,
} from './types/templates';
import {
  TemplateNotFoundError,
  DatabaseError,
  ValidationError,
} from './types/errors';

/**
 * TemplateService class
 * Provides all template-related database operations
 */
export class TemplateService {
  /**
   * Create a new template
   * 
   * @param template - Template creation data
   * @returns Created template
   * @throws ValidationError if input is invalid
   * @throws DatabaseError if database operation fails
   * 
   * @example
   * ```typescript
   * const template = await templateService.create({
   *   templateName: 'Financial Planning Success',
   *   description: 'Template for successful financial planning conversations',
   *   category: 'Financial Planning',
   *   tier: 'template',
   *   templateText: 'Generate a conversation about {{topic}}...',
   *   structure: 'Problem → Solution → Success',
   *   variables: [{ name: 'topic', type: 'text', defaultValue: 'retirement' }],
   *   createdBy: userId
   * });
   * ```
   */
  async create(template: CreateTemplateInput): Promise<Template> {
    try {
      const insertData = {
        template_name: template.templateName,
        description: template.description,
        category: template.category,
        tier: template.tier,
        template_text: template.templateText,
        structure: template.structure,
        variables: template.variables || [],
        tone: template.tone,
        complexity_baseline: template.complexityBaseline,
        style_notes: template.styleNotes,
        example_conversation: template.exampleConversation,
        quality_threshold: template.qualityThreshold,
        required_elements: template.requiredElements || [],
        applicable_personas: template.applicablePersonas || [],
        applicable_emotions: template.applicableEmotions || [],
        applicable_topics: template.applicableTopics || [],
        usage_count: 0,
        rating: 0,
        success_rate: 0,
        version: 1,
        is_active: true,
        created_by: template.createdBy,
      };

      const { data: createdTemplate, error } = await supabase
        .from('conversation_templates')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        throw new DatabaseError(`Failed to create template: ${error.message}`, error);
      }

      return this.mapDbToTemplate(createdTemplate);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error creating template:', error);
      throw new DatabaseError('Unexpected error creating template', error as Error);
    }
  }

  /**
   * Get template by ID
   * 
   * @param id - Template UUID
   * @returns Template or null if not found
   * 
   * @example
   * ```typescript
   * const template = await templateService.getById(templateId);
   * if (template) {
   *   console.log(`Template: ${template.templateName}`);
   * }
   * ```
   */
  async getById(id: string): Promise<Template | null> {
    try {
      const { data: template, error } = await supabase
        .from('conversation_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching template:', error);
        throw new DatabaseError(`Failed to fetch template: ${error.message}`, error);
      }

      return this.mapDbToTemplate(template);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error fetching template:', error);
      throw new DatabaseError('Unexpected error fetching template', error as Error);
    }
  }

  /**
   * List templates with optional filters
   * 
   * @param filters - Optional filter configuration
   * @returns Array of templates
   * 
   * @example
   * ```typescript
   * const templates = await templateService.list({
   *   tier: 'template',
   *   isActive: true,
   *   minRating: 4.0
   * });
   * ```
   */
  async list(filters?: TemplateFilter): Promise<Template[]> {
    try {
      let query = supabase.from('conversation_templates').select('*');

      // Apply filters
      if (filters?.tier) {
        query = query.eq('tier', filters.tier);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters?.minUsageCount !== undefined) {
        query = query.gte('usage_count', filters.minUsageCount);
      }

      // Order by rating and usage
      query = query.order('rating', { ascending: false });
      query = query.order('usage_count', { ascending: false });

      const { data: templates, error } = await query;

      if (error) {
        console.error('Error listing templates:', error);
        throw new DatabaseError(`Failed to list templates: ${error.message}`, error);
      }

      return (templates || []).map(this.mapDbToTemplate);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error listing templates:', error);
      throw new DatabaseError('Unexpected error listing templates', error as Error);
    }
  }

  /**
   * Update a template
   * 
   * @param id - Template UUID
   * @param updates - Partial template updates
   * @returns Updated template
   * @throws TemplateNotFoundError if template doesn't exist
   * 
   * @example
   * ```typescript
   * const updated = await templateService.update(id, {
   *   description: 'Updated description',
   *   qualityThreshold: 8.0,
   *   lastModifiedBy: userId
   * });
   * ```
   */
  async update(id: string, updates: UpdateTemplateInput): Promise<Template> {
    try {
      // Check if template exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new TemplateNotFoundError(id);
      }

      const updateData: any = {};
      
      // Map camelCase to snake_case
      if (updates.templateName !== undefined) updateData.template_name = updates.templateName;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.tier !== undefined) updateData.tier = updates.tier;
      if (updates.templateText !== undefined) updateData.template_text = updates.templateText;
      if (updates.structure !== undefined) updateData.structure = updates.structure;
      if (updates.variables !== undefined) updateData.variables = updates.variables;
      if (updates.tone !== undefined) updateData.tone = updates.tone;
      if (updates.complexityBaseline !== undefined) updateData.complexity_baseline = updates.complexityBaseline;
      if (updates.styleNotes !== undefined) updateData.style_notes = updates.styleNotes;
      if (updates.exampleConversation !== undefined) updateData.example_conversation = updates.exampleConversation;
      if (updates.qualityThreshold !== undefined) updateData.quality_threshold = updates.qualityThreshold;
      if (updates.requiredElements !== undefined) updateData.required_elements = updates.requiredElements;
      if (updates.applicablePersonas !== undefined) updateData.applicable_personas = updates.applicablePersonas;
      if (updates.applicableEmotions !== undefined) updateData.applicable_emotions = updates.applicableEmotions;
      if (updates.applicableTopics !== undefined) updateData.applicable_topics = updates.applicableTopics;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.lastModifiedBy !== undefined) updateData.last_modified_by = updates.lastModifiedBy;

      // Increment version if content changed
      if (updates.templateText !== undefined || updates.structure !== undefined) {
        updateData.version = existing.version + 1;
      }

      const { data: template, error } = await supabase
        .from('conversation_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        throw new DatabaseError(`Failed to update template: ${error.message}`, error);
      }

      return this.mapDbToTemplate(template);
    } catch (error) {
      if (error instanceof TemplateNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error updating template:', error);
      throw new DatabaseError('Unexpected error updating template', error as Error);
    }
  }

  /**
   * Delete a template
   * 
   * @param id - Template UUID
   * @throws TemplateNotFoundError if template doesn't exist
   * 
   * @example
   * ```typescript
   * await templateService.delete(templateId);
   * ```
   */
  async delete(id: string): Promise<void> {
    try {
      // Check if template exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new TemplateNotFoundError(id);
      }

      const { error } = await supabase
        .from('conversation_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting template:', error);
        throw new DatabaseError(`Failed to delete template: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof TemplateNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error deleting template:', error);
      throw new DatabaseError('Unexpected error deleting template', error as Error);
    }
  }

  /**
   * Resolve template by replacing placeholders with parameters
   * 
   * @param templateId - Template UUID
   * @param parameters - Parameter values
   * @returns Resolved template text
   * @throws TemplateNotFoundError if template doesn't exist
   * @throws ValidationError if parameters are invalid
   * 
   * @example
   * ```typescript
   * const resolved = await templateService.resolveTemplate(templateId, {
   *   topic: 'retirement planning',
   *   persona: 'Anxious Investor',
   *   emotion: 'Worried'
   * });
   * console.log(resolved);
   * ```
   */
  async resolveTemplate(templateId: string, parameters: Record<string, any>): Promise<string> {
    try {
      const template = await this.getById(templateId);
      if (!template) {
        throw new TemplateNotFoundError(templateId);
      }

      // Validate parameters first
      const validation = await this.validateParameters(templateId, parameters);
      if (!validation.isValid) {
        throw new ValidationError(
          'Invalid template parameters',
          { errors: validation.errors }
        );
      }

      // Replace placeholders in template text
      let resolvedText = template.templateText;
      
      // Replace {{variableName}} with parameter values
      Object.entries(parameters).forEach(([key, value]) => {
        const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        resolvedText = resolvedText.replace(placeholder, String(value));
      });

      // Check if there are any unresolved placeholders
      const unresolvedPlaceholders = resolvedText.match(/\{\{[^}]+\}\}/g);
      if (unresolvedPlaceholders) {
        throw new ValidationError(
          'Some template placeholders were not resolved',
          { unresolvedPlaceholders }
        );
      }

      return resolvedText;
    } catch (error) {
      if (error instanceof TemplateNotFoundError || error instanceof ValidationError) throw error;
      console.error('Unexpected error resolving template:', error);
      throw new DatabaseError('Unexpected error resolving template', error as Error);
    }
  }

  /**
   * Validate template parameters
   * 
   * @param templateId - Template UUID
   * @param parameters - Parameter values to validate
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * const validation = await templateService.validateParameters(templateId, {
   *   topic: 'retirement'
   * });
   * if (!validation.isValid) {
   *   console.error('Validation errors:', validation.errors);
   * }
   * ```
   */
  async validateParameters(
    templateId: string,
    parameters: Record<string, any>
  ): Promise<ValidationResult> {
    try {
      const template = await this.getById(templateId);
      if (!template) {
        throw new TemplateNotFoundError(templateId);
      }

      const errors: Array<{ field: string; message: string }> = [];

      // Check if all required variables are provided
      template.variables.forEach((variable) => {
        const value = parameters[variable.name];

        // Check if required variable is missing
        if (value === undefined || value === null || value === '') {
          errors.push({
            field: variable.name,
            message: `Required parameter '${variable.name}' is missing`,
          });
          return;
        }

        // Validate type
        if (variable.type === 'number') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push({
              field: variable.name,
              message: `Parameter '${variable.name}' must be a number`,
            });
          }
        }

        // Validate dropdown options
        if (variable.type === 'dropdown' && variable.options) {
          if (!variable.options.includes(String(value))) {
            errors.push({
              field: variable.name,
              message: `Parameter '${variable.name}' must be one of: ${variable.options.join(', ')}`,
            });
          }
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      if (error instanceof TemplateNotFoundError) throw error;
      console.error('Unexpected error validating parameters:', error);
      throw new DatabaseError('Unexpected error validating parameters', error as Error);
    }
  }

  /**
   * Increment template usage count
   * 
   * @param templateId - Template UUID
   * 
   * @example
   * ```typescript
   * await templateService.incrementUsage(templateId);
   * ```
   */
  async incrementUsage(templateId: string): Promise<void> {
    try {
      const template = await this.getById(templateId);
      if (!template) {
        throw new TemplateNotFoundError(templateId);
      }

      const { error } = await supabase
        .from('conversation_templates')
        .update({ usage_count: template.usageCount + 1 })
        .eq('id', templateId);

      if (error) {
        console.error('Error incrementing usage:', error);
        throw new DatabaseError(`Failed to increment usage: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof TemplateNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error incrementing usage:', error);
      throw new DatabaseError('Unexpected error incrementing usage', error as Error);
    }
  }

  /**
   * Update template rating
   * 
   * @param templateId - Template UUID
   * @param rating - New rating (0-5)
   * 
   * @example
   * ```typescript
   * await templateService.updateRating(templateId, 4.5);
   * ```
   */
  async updateRating(templateId: string, rating: number): Promise<void> {
    try {
      if (rating < 0 || rating > 5) {
        throw new ValidationError('Rating must be between 0 and 5');
      }

      const template = await this.getById(templateId);
      if (!template) {
        throw new TemplateNotFoundError(templateId);
      }

      const { error } = await supabase
        .from('conversation_templates')
        .update({ rating })
        .eq('id', templateId);

      if (error) {
        console.error('Error updating rating:', error);
        throw new DatabaseError(`Failed to update rating: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof TemplateNotFoundError || error instanceof ValidationError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error updating rating:', error);
      throw new DatabaseError('Unexpected error updating rating', error as Error);
    }
  }

  /**
   * Get template usage statistics
   * 
   * @param templateId - Template UUID
   * @returns Template usage statistics
   * 
   * @example
   * ```typescript
   * const stats = await templateService.getUsageStats(templateId);
   * console.log(`Used ${stats.usageCount} times with ${stats.successRate}% success`);
   * ```
   */
  async getUsageStats(templateId: string): Promise<TemplateStats> {
    try {
      const template = await this.getById(templateId);
      if (!template) {
        throw new TemplateNotFoundError(templateId);
      }

      // Get conversations generated from this template
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, status, quality_score')
        .eq('parent_id', templateId)
        .eq('parent_type', 'template');

      if (error) {
        console.error('Error fetching template stats:', error);
        throw new DatabaseError(`Failed to fetch template stats: ${error.message}`, error);
      }

      const conversationsGenerated = conversations?.length || 0;
      const approvedConversations = conversations?.filter(c => c.status === 'approved').length || 0;
      const qualityScores = conversations?.filter(c => c.quality_score !== null).map(c => c.quality_score) || [];
      const avgQualityScore = qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : undefined;

      return {
        usageCount: template.usageCount,
        rating: template.rating,
        successRate: template.successRate,
        avgQualityScore,
        conversationsGenerated,
      };
    } catch (error) {
      if (error instanceof TemplateNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error getting usage stats:', error);
      throw new DatabaseError('Unexpected error getting usage stats', error as Error);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Map database record to Template type
   */
  private mapDbToTemplate(dbRecord: any): Template {
    return {
      id: dbRecord.id,
      templateName: dbRecord.template_name,
      description: dbRecord.description,
      category: dbRecord.category,
      tier: dbRecord.tier,
      templateText: dbRecord.template_text,
      structure: dbRecord.structure,
      variables: dbRecord.variables || [],
      tone: dbRecord.tone,
      complexityBaseline: dbRecord.complexity_baseline,
      styleNotes: dbRecord.style_notes,
      exampleConversation: dbRecord.example_conversation,
      qualityThreshold: dbRecord.quality_threshold,
      requiredElements: dbRecord.required_elements || [],
      applicablePersonas: dbRecord.applicable_personas || [],
      applicableEmotions: dbRecord.applicable_emotions || [],
      applicableTopics: dbRecord.applicable_topics || [],
      usageCount: dbRecord.usage_count,
      rating: dbRecord.rating,
      successRate: dbRecord.success_rate,
      version: dbRecord.version,
      isActive: dbRecord.is_active,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: dbRecord.created_by,
      lastModifiedBy: dbRecord.last_modified_by,
    };
  }
}

// Export singleton instance
export const templateService = new TemplateService();

