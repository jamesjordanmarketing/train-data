/**
 * Scaffolding Data Service
 * 
 * CRUD operations for personas, emotional arcs, and training topics.
 * Provides data access layer for conversation scaffolding system.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  Persona,
  EmotionalArc,
  TrainingTopic,
  CompatibilityResult
} from '@/lib/types/scaffolding.types';

export class ScaffoldingDataService {
  constructor(private supabase: SupabaseClient) {}

  // ============================================================================
  // Persona Operations
  // ============================================================================

  async getAllPersonas(filters?: {
    domain?: string;
    is_active?: boolean;
    emotional_baseline?: string;
  }): Promise<Persona[]> {
    let query = this.supabase.from('personas').select('*');

    if (filters?.domain) {
      query = query.eq('domain', filters.domain);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.emotional_baseline) {
      query = query.eq('emotional_baseline', filters.emotional_baseline);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw new Error(`Failed to fetch personas: ${error.message}`);
    }

    return data || [];
  }

  async getPersonaById(id: string): Promise<Persona | null> {
    const { data, error } = await this.supabase
      .from('personas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch persona: ${error.message}`);
    }

    return data;
  }

  async getPersonaByType(persona_type: string, domain = 'financial_planning'): Promise<Persona | null> {
    const { data, error } = await this.supabase
      .from('personas')
      .select('*')
      .eq('persona_type', persona_type)
      .eq('domain', domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch persona by type: ${error.message}`);
    }

    return data;
  }

  async incrementPersonaUsage(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_persona_usage', { persona_id: id });

    if (error) {
      console.error(`Failed to increment persona usage: ${error.message}`);
    }
  }

  // ============================================================================
  // Emotional Arc Operations
  // ============================================================================

  async getAllEmotionalArcs(filters?: {
    domain?: string;
    is_active?: boolean;
    category?: string;
  }): Promise<EmotionalArc[]> {
    let query = this.supabase.from('emotional_arcs').select('*');

    if (filters?.domain) {
      query = query.eq('domain', filters.domain);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw new Error(`Failed to fetch emotional arcs: ${error.message}`);
    }

    return data || [];
  }

  async getEmotionalArcById(id: string): Promise<EmotionalArc | null> {
    const { data, error } = await this.supabase
      .from('emotional_arcs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch emotional arc: ${error.message}`);
    }

    return data;
  }

  async getEmotionalArcByType(arc_type: string, domain = 'financial_planning'): Promise<EmotionalArc | null> {
    const { data, error } = await this.supabase
      .from('emotional_arcs')
      .select('*')
      .eq('arc_type', arc_type)
      .eq('domain', domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch emotional arc by type: ${error.message}`);
    }

    return data;
  }

  async incrementArcUsage(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_arc_usage', { arc_id: id });

    if (error) {
      console.error(`Failed to increment arc usage: ${error.message}`);
    }
  }

  // ============================================================================
  // Training Topic Operations
  // ============================================================================

  async getAllTrainingTopics(filters?: {
    domain?: string;
    is_active?: boolean;
    category?: string;
    complexity_level?: string;
  }): Promise<TrainingTopic[]> {
    let query = this.supabase.from('training_topics').select('*');

    if (filters?.domain) {
      query = query.eq('domain', filters.domain);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.complexity_level) {
      query = query.eq('complexity_level', filters.complexity_level);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw new Error(`Failed to fetch training topics: ${error.message}`);
    }

    return data || [];
  }

  async getTrainingTopicById(id: string): Promise<TrainingTopic | null> {
    const { data, error } = await this.supabase
      .from('training_topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch training topic: ${error.message}`);
    }

    return data;
  }

  async getTrainingTopicByKey(topic_key: string, domain = 'financial_planning'): Promise<TrainingTopic | null> {
    const { data, error } = await this.supabase
      .from('training_topics')
      .select('*')
      .eq('topic_key', topic_key)
      .eq('domain', domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch training topic by key: ${error.message}`);
    }

    return data;
  }

  async incrementTopicUsage(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_topic_usage', { topic_id: id });

    if (error) {
      console.error(`Failed to increment topic usage: ${error.message}`);
    }
  }

  // ============================================================================
  // Compatibility Checking
  // ============================================================================

  async checkCompatibility(params: {
    persona_id: string;
    arc_id: string;
    topic_id: string;
  }): Promise<CompatibilityResult> {
    const [persona, arc, topic] = await Promise.all([
      this.getPersonaById(params.persona_id),
      this.getEmotionalArcById(params.arc_id),
      this.getTrainingTopicById(params.topic_id)
    ]);

    if (!persona || !arc || !topic) {
      return {
        is_compatible: false,
        warnings: ['One or more scaffolding entities not found'],
        suggestions: [],
        confidence: 0
      };
    }

    const warnings: string[] = [];
    const suggestions: string[] = [];
    let confidence = 1.0;

    // Check persona-arc compatibility
    if (persona.compatible_arcs.length > 0 && !persona.compatible_arcs.includes(arc.arc_type)) {
      warnings.push(`Persona "${persona.short_name}" typically doesn't use the ${arc.name} arc. This may still work, but consider alternative arcs.`);
      confidence -= 0.2;
    }

    // Check arc-topic suitability
    if (topic.suitable_arcs.length > 0 && !topic.suitable_arcs.includes(arc.arc_type)) {
      warnings.push(`Topic "${topic.name}" is not typically paired with ${arc.name}. Consider alternative topics or arcs.`);
      confidence -= 0.2;
    }

    // Check persona-topic suitability
    if (topic.suitable_personas.length > 0 && !topic.suitable_personas.includes(persona.persona_type)) {
      warnings.push(`Persona "${persona.short_name}" typically doesn't ask about ${topic.name}. Consider if this combination makes sense for your use case.`);
      confidence -= 0.15;
    }

    // Check complexity alignment
    if (persona.complexity_preference === 'simple' && topic.complexity_level === 'advanced') {
      warnings.push(`Persona prefers simple topics, but "${topic.name}" is advanced. This may create an unrealistic conversation.`);
      confidence -= 0.1;
    }

    // Generate suggestions based on warnings
    if (warnings.length > 0) {
      suggestions.push('Review the compatibility warnings and consider alternative combinations.');

      if (persona.compatible_arcs.length > 0) {
        suggestions.push(`Consider using one of ${persona.short_name}'s compatible arcs: ${persona.compatible_arcs.slice(0, 3).join(', ')}`);
      }
    }

    return {
      is_compatible: confidence > 0.3,
      warnings,
      suggestions,
      confidence: Math.max(0, confidence)
    };
  }
}

