/**
 * Template Resolution Service
 * 
 * Resolves template placeholders with actual parameter values.
 * Wraps the existing parameter injection infrastructure with
 * service-level interface and database integration.
 * 
 * Features:
 * - Parameter injection with {{placeholder}} syntax
 * - Validation of required parameters
 * - Security sanitization
 * - Template caching for performance
 * - Database integration for template retrieval
 * 
 * @module template-resolver
 */

import { supabase } from '../supabase';
import { 
  injectParameters, 
  validateTemplateResolution,
  generatePreview,
  ResolvedTemplate as InjectionResult,
} from '../ai/parameter-injection';
import type { Template, TemplateVariable } from '../../../train-wireframe/src/lib/types';

/**
 * Result of template resolution
 */
export interface ResolvedTemplate {
  /** Original template ID */
  templateId: string;
  
  /** Original template structure */
  originalTemplate: string;
  
  /** Fully resolved prompt text */
  resolvedPrompt: string;
  
  /** Parameters used in resolution */
  parameters: Record<string, any>;
  
  /** Whether resolution was successful */
  success: boolean;
  
  /** Validation errors */
  errors: string[];
  
  /** Warnings (non-fatal) */
  warnings: string[];
  
  /** Template metadata */
  template: Template;
}

/**
 * Parameters for template resolution
 */
export interface ResolveParams {
  templateId: string;
  parameters: Record<string, any>;
  userId?: string;
  validateOnly?: boolean;
}

/**
 * Template Resolver Service
 * 
 * Orchestrates template retrieval, parameter injection, and validation.
 */
export class TemplateResolver {
  private templateCache = new Map<string, Template>();
  private cacheEnabled = true;
  private cacheTTL = 60000; // 1 minute
  private cacheTimestamps = new Map<string, number>();

  /**
   * Resolve a template with given parameters
   * 
   * @param params - Resolution parameters
   * @returns Resolved template with prompt text
   * 
   * @example
   * ```typescript
   * const resolver = new TemplateResolver();
   * const resolved = await resolver.resolveTemplate({
   *   templateId: 'template-123',
   *   parameters: {
   *     persona: 'Anxious Investor',
   *     emotion: 'Worried',
   *     topic: 'Market Volatility'
   *   },
   *   userId: 'user-456'
   * });
   * 
   * if (resolved.success) {
   *   console.log('Resolved prompt:', resolved.resolvedPrompt);
   * } else {
   *   console.error('Errors:', resolved.errors);
   * }
   * ```
   */
  async resolveTemplate(params: ResolveParams): Promise<ResolvedTemplate> {
    try {
      // 1. Get template from database (with caching)
      const template = await this.getTemplate(params.templateId);

      if (!template) {
        return this.createErrorResult(
          params.templateId,
          params.parameters,
          ['Template not found']
        );
      }

      // 2. If validation only, check without resolving
      if (params.validateOnly) {
        const validation = validateTemplateResolution(template, params.parameters);
        
        return {
          templateId: params.templateId,
          originalTemplate: template.structure,
          resolvedPrompt: '', // Not resolved in validation mode
          parameters: params.parameters,
          success: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
          template,
        };
      }

      // 3. Inject parameters
      const result = injectParameters(
        template.structure,
        template.variables,
        params.parameters,
        {
          escapeHtml: false, // Don't escape for prompts
          throwOnMissing: false,
          auditLog: true,
          userId: params.userId,
          templateId: params.templateId,
        }
      );

      // 4. Format errors
      const errors = result.errors.map(e => `${e.parameterName}: ${e.error}`);
      if (result.missingRequired.length > 0) {
        errors.push(`Missing required parameters: ${result.missingRequired.join(', ')}`);
      }

      return {
        templateId: params.templateId,
        originalTemplate: template.structure,
        resolvedPrompt: result.resolved,
        parameters: result.parameters,
        success: result.success,
        errors,
        warnings: result.warnings,
        template,
      };
    } catch (error) {
      console.error('Error resolving template:', error);
      
      return this.createErrorResult(
        params.templateId,
        params.parameters,
        [error instanceof Error ? error.message : 'Unknown error']
      );
    }
  }

  /**
   * Batch resolve multiple templates
   * 
   * @param resolveParamsList - Array of resolution parameters
   * @returns Array of resolved templates
   * 
   * @example
   * ```typescript
   * const resolver = new TemplateResolver();
   * const resolved = await resolver.batchResolveTemplates([
   *   { templateId: 'template-1', parameters: { ... } },
   *   { templateId: 'template-2', parameters: { ... } },
   * ]);
   * ```
   */
  async batchResolveTemplates(
    resolveParamsList: ResolveParams[]
  ): Promise<ResolvedTemplate[]> {
    // Pre-fetch all unique templates to minimize DB calls
    const uniqueTemplateIds = [...new Set(resolveParamsList.map(p => p.templateId))];
    await this.preloadTemplates(uniqueTemplateIds);

    // Resolve all templates
    return Promise.all(
      resolveParamsList.map(params => this.resolveTemplate(params))
    );
  }

  /**
   * Generate a preview of resolved template (for UI)
   * 
   * @param templateId - Template ID
   * @param parameters - Parameter values
   * @returns Preview text and validation status
   * 
   * @example
   * ```typescript
   * const preview = await resolver.generatePreview('template-123', {
   *   persona: 'Anxious Investor'
   * });
   * console.log(preview.preview);
   * ```
   */
  async generatePreview(
    templateId: string,
    parameters: Record<string, any>
  ): Promise<{ preview: string; valid: boolean; errors: string[] }> {
    try {
      const template = await this.getTemplate(templateId);

      if (!template) {
        return {
          preview: '',
          valid: false,
          errors: ['Template not found'],
        };
      }

      return generatePreview(template, parameters);
    } catch (error) {
      return {
        preview: '',
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Validate parameters without resolving template
   * 
   * @param templateId - Template ID
   * @param parameters - Parameter values
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * const validation = await resolver.validateParameters(
   *   'template-123',
   *   { persona: 'Anxious Investor' }
   * );
   * 
   * if (!validation.valid) {
   *   console.error('Invalid:', validation.errors);
   * }
   * ```
   */
  async validateParameters(
    templateId: string,
    parameters: Record<string, any>
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    try {
      const template = await this.getTemplate(templateId);

      if (!template) {
        return {
          valid: false,
          errors: ['Template not found'],
          warnings: [],
        };
      }

      return validateTemplateResolution(template, parameters);
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
      };
    }
  }

  /**
   * Get template from database or cache
   * @private
   */
  private async getTemplate(templateId: string): Promise<Template | null> {
    // Check cache first
    if (this.cacheEnabled) {
      const cached = this.templateCache.get(templateId);
      const timestamp = this.cacheTimestamps.get(templateId);

      if (cached && timestamp && Date.now() - timestamp < this.cacheTTL) {
        return cached;
      }
    }

    // Fetch from database
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Map database record to Template type
      const template: Template = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        category: data.category || '',
        structure: data.structure,
        variables: data.variables || [],
        tone: data.tone || '',
        complexityBaseline: data.complexity_baseline || 5,
        styleNotes: data.style_notes,
        exampleConversation: data.example_conversation,
        qualityThreshold: data.quality_threshold || 7,
        requiredElements: data.required_elements || [],
        usageCount: data.usage_count || 0,
        rating: data.rating || 0,
        lastModified: data.updated_at || data.created_at,
        createdBy: data.created_by,
        tier: data.tier,
        isActive: data.is_active ?? true,
        version: data.version || 1,
        applicablePersonas: data.applicable_personas,
        applicableEmotions: data.applicable_emotions,
      };

      // Cache template
      if (this.cacheEnabled) {
        this.templateCache.set(templateId, template);
        this.cacheTimestamps.set(templateId, Date.now());
      }

      return template;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  }

  /**
   * Pre-load templates into cache
   * @private
   */
  private async preloadTemplates(templateIds: string[]): Promise<void> {
    // Filter out already cached templates
    const uncachedIds = templateIds.filter(id => {
      const timestamp = this.cacheTimestamps.get(id);
      return !timestamp || Date.now() - timestamp >= this.cacheTTL;
    });

    if (uncachedIds.length === 0) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .in('id', uncachedIds);

      if (error) {
        console.error('Error preloading templates:', error);
        return;
      }

      if (!data) {
        return;
      }

      // Cache all templates
      data.forEach(dbRecord => {
        const template: Template = {
          id: dbRecord.id,
          name: dbRecord.name,
          description: dbRecord.description || '',
          category: dbRecord.category || '',
          structure: dbRecord.structure,
          variables: dbRecord.variables || [],
          tone: dbRecord.tone || '',
          complexityBaseline: dbRecord.complexity_baseline || 5,
          styleNotes: dbRecord.style_notes,
          exampleConversation: dbRecord.example_conversation,
          qualityThreshold: dbRecord.quality_threshold || 7,
          requiredElements: dbRecord.required_elements || [],
          usageCount: dbRecord.usage_count || 0,
          rating: dbRecord.rating || 0,
          lastModified: dbRecord.updated_at || dbRecord.created_at,
          createdBy: dbRecord.created_by,
          tier: dbRecord.tier,
          isActive: dbRecord.is_active ?? true,
          version: dbRecord.version || 1,
          applicablePersonas: dbRecord.applicable_personas,
          applicableEmotions: dbRecord.applicable_emotions,
        };

        this.templateCache.set(template.id, template);
        this.cacheTimestamps.set(template.id, Date.now());
      });
    } catch (error) {
      console.error('Error preloading templates:', error);
    }
  }

  /**
   * Create error result
   * @private
   */
  private createErrorResult(
    templateId: string,
    parameters: Record<string, any>,
    errors: string[]
  ): ResolvedTemplate {
    return {
      templateId,
      originalTemplate: '',
      resolvedPrompt: '',
      parameters,
      success: false,
      errors,
      warnings: [],
      template: {} as Template, // Empty template on error
    };
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Enable/disable caching
   */
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }

  /**
   * Set cache TTL
   */
  setCacheTTL(ttlMs: number): void {
    this.cacheTTL = ttlMs;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; enabled: boolean; ttlMs: number } {
    return {
      size: this.templateCache.size,
      enabled: this.cacheEnabled,
      ttlMs: this.cacheTTL,
    };
  }
}

/**
 * Singleton instance for convenience
 */
let resolverInstance: TemplateResolver | null = null;

/**
 * Get or create singleton template resolver instance
 */
export function getTemplateResolver(): TemplateResolver {
  if (!resolverInstance) {
    resolverInstance = new TemplateResolver();
  }
  return resolverInstance;
}

/**
 * Reset singleton instance (useful for testing)
 */
export function resetTemplateResolver(): void {
  resolverInstance = null;
}

