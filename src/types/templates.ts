/**
 * Template Type Definitions
 * Matches database schema with snake_case properties
 */

export interface Template {
  id: string;
  template_name: string;
  description: string;
  tier: 'template' | 'scenario' | 'edge_case';
  category: string;
  template_text: string;
  structure: string;
  variables: Record<string, any>;
  tone: string;
  complexity_baseline: number;
  is_active: boolean;
  usage_count: number;
  rating: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

