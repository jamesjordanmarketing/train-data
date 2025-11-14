/**
 * Template Selection Service
 * 
 * Selects appropriate prompt templates based on emotional arc, tier, and context.
 * Provides template ranking and selection rationale for transparency.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  TemplateSelectionCriteria,
  TemplateSelectionResult
} from '@/lib/types/scaffolding.types';

export class TemplateSelectionService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Select best template based on criteria
   * Returns template ID of the highest-ranked match
   */
  async selectTemplate(criteria: TemplateSelectionCriteria): Promise<string> {
    // 1. Query templates matching emotional arc and tier
    const { data: templates, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('emotional_arc_type', criteria.emotional_arc_type)
      .eq('tier', criteria.tier)
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .order('usage_count', { ascending: false });

    if (error || !templates || templates.length === 0) {
      throw new Error(`No templates found for arc: ${criteria.emotional_arc_type}, tier: ${criteria.tier}`);
    }

    // 2. If persona specified, filter for compatibility
    let filtered_templates = templates;
    if (criteria.persona_type) {
      filtered_templates = templates.filter(t =>
        !t.suitable_personas ||
        t.suitable_personas.length === 0 ||
        t.suitable_personas.includes(criteria.persona_type)
      );
    }

    // 3. If topic specified, filter for compatibility
    if (criteria.topic_key) {
      filtered_templates = filtered_templates.filter(t =>
        !t.suitable_topics ||
        t.suitable_topics.length === 0 ||
        t.suitable_topics.includes(criteria.topic_key)
      );
    }

    // 4. Fallback if filtering eliminated all options
    if (filtered_templates.length === 0) {
      console.warn('No perfectly matching templates, using best arc+tier match');
      filtered_templates = templates;
    }

    // 5. Return highest rated template
    return filtered_templates[0].id;
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

