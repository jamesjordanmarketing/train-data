/**
 * Template Selection Service
 * 
 * Selects appropriate prompt templates based on emotional arc (primary selector), 
 * tier, persona, and topic compatibility.
 * Implements the "emotional arc as primary selector" strategy.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  TemplateSelectionCriteria,
  TemplateSelectionResult
} from '@/lib/types/scaffolding.types';

export interface PromptTemplate {
  id: string;
  template_name: string;
  description?: string;
  category?: string;
  tier: 'template' | 'scenario' | 'edge_case';
  template_text: string;
  emotional_arc_type: string;
  emotional_arc_id?: string;
  suitable_personas?: string[];
  suitable_topics?: string[];
  quality_threshold?: number;
  rating?: number;
  usage_count?: number;
  is_active: boolean;
}

export class TemplateSelectionService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Select templates based on emotional arc (primary) and optional filters
   * CRITICAL: Emotional arc is the primary selector
   */
  async selectTemplates(criteria: TemplateSelectionCriteria): Promise<PromptTemplate[]> {
    // Step 1: Query by emotional arc (required, primary selector)
    let query = this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('emotional_arc_type', criteria.emotional_arc_type)
      .eq('is_active', true);

    // Step 2: Filter by tier if provided
    if (criteria.tier) {
      query = query.eq('tier', criteria.tier);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error(`No templates found for emotional arc: ${criteria.emotional_arc_type}`);
    }

    let templates = data as PromptTemplate[];

    // Step 3: Score templates by persona compatibility (don't filter out, just rank)
    const scoredTemplates = templates.map(t => {
      let score = 1.0;
      
      // Reduce score if persona doesn't match (but don't eliminate)
      if (criteria.persona_type && t.suitable_personas && t.suitable_personas.length > 0) {
        if (!t.suitable_personas.includes(criteria.persona_type)) {
          score *= 0.5; // Less ideal, but still usable
        }
      }
      
      // Reduce score if topic doesn't match (but don't eliminate)
      if (criteria.topic_key && t.suitable_topics && t.suitable_topics.length > 0) {
        if (!t.suitable_topics.includes(criteria.topic_key)) {
          score *= 0.5; // Less ideal, but still usable
        }
      }
      
      return { template: t, score };
    });

    // Step 4: Sort by score (higher first), then quality_threshold, then rating
    scoredTemplates.sort((a, b) => {
      // First by compatibility score
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
      
      // Then by quality threshold
      const qualityDiff = (b.template.quality_threshold || 0) - (a.template.quality_threshold || 0);
      if (qualityDiff !== 0) return qualityDiff;
      
      // Finally by rating
      return (b.template.rating || 0) - (a.template.rating || 0);
    });

    return scoredTemplates.map(st => st.template);
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<PromptTemplate | null> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as PromptTemplate;
  }

  /**
   * Validate template compatibility with persona and topic
   */
  async validateCompatibility(
    templateId: string,
    personaKey: string,
    topicKey: string
  ): Promise<{ compatible: boolean; warnings: string[] }> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      return { compatible: false, warnings: ['Template not found'] };
    }

    const warnings: string[] = [];

    // Check persona compatibility
    if (template.suitable_personas && template.suitable_personas.length > 0) {
      if (!template.suitable_personas.includes(personaKey)) {
        warnings.push(`Persona "${personaKey}" not in template's suitable personas list`);
      }
    }

    // Check topic compatibility
    if (template.suitable_topics && template.suitable_topics.length > 0) {
      if (!template.suitable_topics.includes(topicKey)) {
        warnings.push(`Topic "${topicKey}" not in template's suitable topics list`);
      }
    }

    return {
      compatible: warnings.length === 0,
      warnings
    };
  }

  /**
   * Select best template based on criteria (legacy method)
   * Returns template ID of the highest-ranked match
   */
  async selectTemplate(criteria: TemplateSelectionCriteria): Promise<string> {
    const templates = await this.selectTemplates(criteria);
    
    if (templates.length === 0) {
      throw new Error(`No templates found for arc: ${criteria.emotional_arc_type}, tier: ${criteria.tier}`);
    }

    return templates[0].id;
  }

  /**
   * Get detailed selection result with rationale
   */
  async selectTemplateWithRationale(criteria: TemplateSelectionCriteria): Promise<TemplateSelectionResult> {
    const ranked = await this.getRankedTemplates(criteria);

    if (ranked.length === 0) {
      throw new Error('No templates available for selection');
    }

    return ranked[0];
  }

  /**
   * Get all compatible templates ranked by fit
   * Returns array of templates with confidence scores and rationale
   */
  async getRankedTemplates(criteria: TemplateSelectionCriteria): Promise<TemplateSelectionResult[]> {
    // Query all potentially matching templates
    const { data: templates } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('emotional_arc_type', criteria.emotional_arc_type)
      .eq('is_active', true);

    if (!templates || templates.length === 0) {
      return [];
    }

    // Score each template
    const scored = templates.map(template => {
      let score = 0.5; // Base score
      const rationale_parts: string[] = [];

      // Tier match (required)
      if (template.tier === criteria.tier) {
        score += 0.2;
        rationale_parts.push(`Tier match (${criteria.tier})`);
      } else {
        return null; // Tier mismatch is disqualifying
      }

      // Persona compatibility
      if (criteria.persona_type) {
        if (!template.suitable_personas || template.suitable_personas.length === 0) {
          // Template works with all personas
          score += 0.1;
          rationale_parts.push('Works with all personas');
        } else if (template.suitable_personas.includes(criteria.persona_type)) {
          score += 0.15;
          rationale_parts.push(`Persona match (${criteria.persona_type})`);
        } else {
          score -= 0.05;
          rationale_parts.push(`Persona mismatch`);
        }
      }

      // Topic compatibility
      if (criteria.topic_key) {
        if (!template.suitable_topics || template.suitable_topics.length === 0) {
          score += 0.05;
          rationale_parts.push('Works with all topics');
        } else if (template.suitable_topics.includes(criteria.topic_key)) {
          score += 0.1;
          rationale_parts.push(`Topic match (${criteria.topic_key})`);
        }
      }

      // Quality indicators
      if (template.rating >= 4.5) {
        score += 0.05;
        rationale_parts.push(`High rating (${template.rating})`);
      }

      const rationale = rationale_parts.join(', ');

      return {
        template_id: template.id,
        template_name: template.template_name,
        confidence_score: Math.min(score, 1.0),
        rationale
      };
    }).filter(Boolean) as Array<{
      template_id: string;
      template_name: string;
      confidence_score: number;
      rationale: string;
    }>;

    // Sort by confidence descending
    scored.sort((a, b) => b.confidence_score - a.confidence_score);

    // Format results
    const results: TemplateSelectionResult[] = scored.map((primary, index) => ({
      template_id: primary.template_id,
      template_name: primary.template_name,
      confidence_score: primary.confidence_score,
      rationale: primary.rationale,
      alternatives: scored.slice(index + 1, index + 3).map(alt => ({
        template_id: alt.template_id,
        template_name: alt.template_name,
        confidence_score: alt.confidence_score
      }))
    }));

    return results;
  }
}

