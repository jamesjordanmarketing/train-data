/**
 * Template Service - CRUD Operations for Prompt Templates
 * 
 * Provides database operations for managing conversation prompt templates
 * including versioning, usage tracking, and quality management.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Template, TemplateVariable } from '@/lib/types';

/**
 * Service class for template CRUD operations
 */
export class TemplateService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Fetch all templates with optional filtering and sorting
   */
  async getAllTemplates(filters?: {
    tier?: string;
    isActive?: boolean;
    sortBy?: 'name' | 'usageCount' | 'rating' | 'lastModified';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Template[]> {
    let query = this.supabase
      .from('prompt_templates')
      .select('*');

    // Apply filters
    if (filters?.tier) {
      query = query.eq('tier', filters.tier);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    // Apply sorting
    if (filters?.sortBy) {
      const column = this.mapSortColumn(filters.sortBy);
      query = query.order(column, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }

    return this.mapToTemplateType(data || []);
  }

  /**
   * Fetch a single template by ID
   */
  async getTemplateById(id: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch template: ${error.message}`);
    }

    return this.mapToTemplateType([data])[0];
  }

  /**
   * Create a new template
   */
  async createTemplate(
    template: Omit<Template, 'id' | 'usageCount' | 'lastModified'>
  ): Promise<Template> {
    const dbTemplate = this.mapToDbSchema(template);

    const { data, error } = await this.supabase
      .from('prompt_templates')
      .insert(dbTemplate)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }

    return this.mapToTemplateType([data])[0];
  }

  /**
   * Update an existing template
   */
  async updateTemplate(
    id: string,
    updates: Partial<Template>
  ): Promise<Template> {
    const dbUpdates = this.mapToDbSchema(updates);

    const { data, error } = await this.supabase
      .from('prompt_templates')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update template: ${error.message}`);
    }

    return this.mapToTemplateType([data])[0];
  }

  /**
   * Delete a template (with dependency checking)
   */
  async deleteTemplate(id: string): Promise<void> {
    // Check for dependencies (conversations using this template)
    const { count, error: countError } = await this.supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', id)
      .eq('parent_type', 'template');

    if (countError) {
      throw new Error(`Failed to check dependencies: ${countError.message}`);
    }

    if (count && count > 0) {
      throw new Error(
        `Cannot delete template: ${count} conversation(s) depend on it. Archive the template instead.`
      );
    }

    // No dependencies, proceed with deletion
    const { error } = await this.supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }

  /**
   * Increment usage count for a template
   */
  async incrementUsageCount(id: string): Promise<void> {
    const { error } = await this.supabase
      .rpc('increment_template_usage', { template_id: id });

    if (error) {
      throw new Error(`Failed to increment usage count: ${error.message}`);
    }
  }

  /**
   * Archive a template (set inactive)
   */
  async archiveTemplate(id: string): Promise<Template> {
    return this.updateTemplate(id, { isActive: false });
  }

  /**
   * Activate a template
   */
  async activateTemplate(id: string): Promise<Template> {
    return this.updateTemplate(id, { isActive: true });
  }

  /**
   * Map sort column name from frontend to database column
   */
  private mapSortColumn(sortBy: string): string {
    const mapping: Record<string, string> = {
      name: 'template_name',
      usageCount: 'usage_count',
      rating: 'rating',
      lastModified: 'updated_at',
    };
    return mapping[sortBy] || 'created_at';
  }

  /**
   * Map database rows to Template type
   */
  private mapToTemplateType(dbData: any[]): Template[] {
    return dbData.map((row) => ({
      id: row.id,
      name: row.template_name,
      description: row.description || '',
      category: row.tier, // Using tier as category for now
      structure: row.template_text,
      variables: Array.isArray(row.variables) ? row.variables : [],
      tone: row.style_notes || '',
      complexityBaseline: 5, // Default value, adjust as needed
      styleNotes: row.style_notes,
      exampleConversation: row.example_conversation,
      qualityThreshold: row.quality_threshold || 0.7,
      requiredElements: row.required_parameters || [],
      usageCount: row.usage_count || 0,
      rating: row.rating || 0,
      lastModified: row.updated_at,
      createdBy: row.created_by || '',
      // Additional fields from database
      tier: row.tier,
      isActive: row.is_active,
      version: row.version,
      applicablePersonas: row.applicable_personas || [],
      applicableEmotions: row.applicable_emotions || [],
    }));
  }

  /**
   * Map Template type to database schema
   */
  private mapToDbSchema(template: Partial<Template>): any {
    const dbSchema: any = {};

    // Map fields that exist in both
    if (template.name !== undefined) dbSchema.template_name = template.name;
    if (template.description !== undefined) dbSchema.description = template.description;
    if (template.structure !== undefined) dbSchema.template_text = template.structure;
    if (template.variables !== undefined) dbSchema.variables = template.variables;
    if (template.styleNotes !== undefined) dbSchema.style_notes = template.styleNotes;
    if (template.exampleConversation !== undefined) dbSchema.example_conversation = template.exampleConversation;
    if (template.qualityThreshold !== undefined) dbSchema.quality_threshold = template.qualityThreshold;
    if (template.requiredElements !== undefined) dbSchema.required_parameters = template.requiredElements;
    
    // Handle fields that might come from extended Template type
    if ('tier' in template) dbSchema.tier = template.tier;
    if ('isActive' in template) dbSchema.is_active = template.isActive;
    if ('applicablePersonas' in template) dbSchema.applicable_personas = template.applicablePersonas;
    if ('applicableEmotions' in template) dbSchema.applicable_emotions = template.applicableEmotions;

    return dbSchema;
  }
}

/**
 * API Request/Response Types
 */

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  structure: string;
  tier: 'template' | 'scenario' | 'edge_case';
  variables: TemplateVariable[];
  qualityThreshold?: number;
  isActive?: boolean;
  styleNotes?: string;
  exampleConversation?: string;
  requiredElements?: string[];
  applicablePersonas?: string[];
  applicableEmotions?: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  structure?: string;
  tier?: 'template' | 'scenario' | 'edge_case';
  variables?: TemplateVariable[];
  qualityThreshold?: number;
  isActive?: boolean;
  styleNotes?: string;
  exampleConversation?: string;
  requiredElements?: string[];
  applicablePersonas?: string[];
  applicableEmotions?: string[];
}

export interface TemplateListResponse {
  templates: Template[];
  total: number;
}

export interface TemplateResponse {
  template: Template;
}

export interface DeleteTemplateResponse {
  success: boolean;
  canArchive?: boolean;
  error?: string;
}

// --- Adapter: Singleton service with resolver and usage stats ---
import { getTemplateResolver } from './services/template-resolver';
import { TemplateNotFoundError, ValidationError, DatabaseError, ErrorCode } from './types/errors';
import { createClient } from './supabase/server';

const _supabasePromise = createClient();
const _baseServicePromise = (async () => new TemplateService(await _supabasePromise))();

export const templateService = {
  // Delegate CRUD operations to base service
  getAllTemplates: async (filters?: any) => (await _baseServicePromise).getAllTemplates(filters),
  getTemplateById: async (id: string) => (await _baseServicePromise).getTemplateById(id),
  createTemplate: async (template: any) => (await _baseServicePromise).createTemplate(template),
  updateTemplate: async (id: string, updates: any) => (await _baseServicePromise).updateTemplate(id, updates),
  deleteTemplate: async (id: string) => (await _baseServicePromise).deleteTemplate(id),
  incrementUsageCount: async (id: string) => (await _baseServicePromise).incrementUsageCount(id),
  archiveTemplate: async (id: string) => (await _baseServicePromise).archiveTemplate(id),
  activateTemplate: async (id: string) => (await _baseServicePromise).activateTemplate(id),

  // New methods for API compatibility
  async resolveTemplate(id: string, parameters: Record<string, any>): Promise<string> {
    const resolver = getTemplateResolver();
    const result = await resolver.resolveTemplate({ templateId: id, parameters });

    if (!result.success) {
      throw new ValidationError('Template resolution failed', {
        errors: result.errors,
        warnings: result.warnings,
      });
    }

    return result.resolvedPrompt;
  },

  async getUsageStats(templateId: string): Promise<{
    usageCount: number;
    rating: number;
    successRate: number;
    avgQualityScore: number;
    conversationsGenerated: number;
  }> {
    // Define database result type for type-safe field access
    interface TemplateDbRow {
      usage_count: number | null;
      rating: number | null;
    }

    // Fetch template basics
    const supabase = await _supabasePromise;
    const { data: tpl, error: tplErr } = await supabase
      .from('prompt_templates')
      .select('usage_count, rating')
      .eq('id', templateId)
      .single();

    if (tplErr || !tpl) {
      throw new TemplateNotFoundError(templateId);
    }

    // Type-safe cast to database row type
    const templateData = tpl as TemplateDbRow;

    // Fetch conversations related to template
    const { data: convs, error: convErr } = await supabase
      .from('conversations')
      .select('status, quality_score')
      .eq('parent_id', templateId)
      .eq('parent_type', 'template');

    if (convErr) {
      throw new DatabaseError('Failed to fetch conversations for usage stats', ErrorCode.ERR_DB_QUERY, {
        cause: convErr,
        context: { templateId },
      });
    }

    const total = convs?.length ?? 0;
    const successes = (convs ?? []).filter(c => c.status === 'approved' || c.status === 'generated').length;
    const conversationsGenerated = (convs ?? []).filter(c => c.status === 'generated').length;

    const scores = (convs ?? [])
      .map(c => c.quality_score)
      .filter((s: any) => s !== null && s !== undefined);

    const avgQualityScore = scores.length
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0;

    const successRate = total ? (successes / total) * 100 : 0;

    return {
      usageCount: templateData.usage_count ?? total,
      rating: templateData.rating ?? 0,
      successRate: Math.round(successRate * 10) / 10,
      avgQualityScore: Math.round(avgQualityScore * 100) / 100,
      conversationsGenerated,
    };
  },
};
