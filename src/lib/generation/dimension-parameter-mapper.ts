/**
 * Dimension Parameter Mapper
 * 
 * Maps semantic dimensions from chunk analysis to conversation generation parameters.
 * Provides parameter suggestions based on dimension data and confidence levels.
 */

import type { DimensionSource } from './types';

export interface ParameterSuggestions {
  persona?: string;
  emotion?: string;
  targetTurns: number;
  categories: string[];
  qualityModifier: number; // Adjustment based on dimension confidence
  complexity: number; // 0-1 scale
}

export class DimensionParameterMapper {
  /**
   * Map dimensions to conversation generation parameters
   */
  mapDimensionsToParameters(dimensions: DimensionSource): ParameterSuggestions {
    const semantic = dimensions.semanticDimensions;
    
    return {
      persona: semantic?.persona?.[0] || 'professional',
      emotion: semantic?.emotion?.[0] || 'neutral',
      targetTurns: this.calculateTargetTurns(semantic?.complexity || 0.5),
      categories: semantic?.domain || [],
      qualityModifier: this.calculateQualityModifier(dimensions.confidence),
      complexity: semantic?.complexity || 0.5,
    };
  }

  /**
   * Calculate target turn count from complexity
   * Simple: 6-8 turns, Medium: 10-12 turns, Complex: 12-16 turns
   */
  private calculateTargetTurns(complexity: number): number {
    // Map 0-1 complexity to 6-16 turn range
    // Formula: 6 + (complexity * 10)
    // - complexity 0.0 -> 6 turns
    // - complexity 0.5 -> 11 turns
    // - complexity 1.0 -> 16 turns
    return Math.round(6 + (complexity * 10));
  }

  /**
   * Calculate quality score modifier based on dimension confidence
   * Low confidence (<0.5) reduces quality expectations
   * High confidence (>0.8) increases quality expectations
   */
  private calculateQualityModifier(confidence: number): number {
    // Low confidence (<0.5) reduces quality score by up to 2 points
    // High confidence (>0.8) adds up to 1 point
    if (confidence < 0.5) {
      return -2 * (0.5 - confidence) * 2; // Max -2 at confidence=0
    } else if (confidence > 0.8) {
      return (confidence - 0.8) * 5; // Max +1 at confidence=1
    }
    return 0;
  }

  /**
   * Suggest temperature adjustment based on dimensions
   * More structured/technical content = lower temperature
   * Creative/scenario content = higher temperature
   */
  suggestTemperature(dimensions: DimensionSource): number {
    const semantic = dimensions.semanticDimensions;
    
    // Base temperature
    let temperature = 0.7;
    
    // Adjust for complexity (higher complexity = slightly lower temp for precision)
    if (semantic.complexity !== undefined) {
      if (semantic.complexity > 0.7) {
        temperature -= 0.1; // More structured
      } else if (semantic.complexity < 0.3) {
        temperature += 0.1; // More creative
      }
    }
    
    // Adjust for domain (technical domains = lower temp)
    if (semantic.domain?.some(d => 
      d.toLowerCase().includes('technical') || 
      d.toLowerCase().includes('legal') ||
      d.toLowerCase().includes('medical')
    )) {
      temperature -= 0.15;
    }
    
    // Clamp between 0.5 and 1.0
    return Math.max(0.5, Math.min(1.0, temperature));
  }

  /**
   * Suggest max tokens based on complexity and target turns
   */
  suggestMaxTokens(dimensions: DimensionSource, targetTurns: number): number {
    const complexity = dimensions.semanticDimensions.complexity || 0.5;
    
    // Base calculation: avg 150 tokens per turn
    const baseTokens = targetTurns * 150;
    
    // Adjust for complexity
    const complexityMultiplier = 1 + (complexity * 0.5); // 1.0x to 1.5x
    
    const suggestedTokens = Math.round(baseTokens * complexityMultiplier);
    
    // Clamp between 1024 and 4096
    return Math.max(1024, Math.min(4096, suggestedTokens));
  }

  /**
   * Map dimensions to conversation categories/tags
   */
  mapToCategories(dimensions: DimensionSource): string[] {
    const categories = new Set<string>();
    
    const semantic = dimensions.semanticDimensions;
    
    // Add domain tags
    if (semantic.domain) {
      semantic.domain.forEach(d => categories.add(d));
    }
    
    // Add audience-based category
    if (semantic.audience) {
      categories.add(`audience:${semantic.audience.toLowerCase()}`);
    }
    
    // Add intent-based category
    if (semantic.intent) {
      categories.add(`intent:${semantic.intent.toLowerCase()}`);
    }
    
    // Add complexity category
    if (semantic.complexity !== undefined) {
      if (semantic.complexity > 0.7) {
        categories.add('complexity:high');
      } else if (semantic.complexity > 0.4) {
        categories.add('complexity:medium');
      } else {
        categories.add('complexity:low');
      }
    }
    
    return Array.from(categories);
  }

  /**
   * Check if explicit parameters should override dimension suggestions
   * Returns true if confidence is too low to trust dimension-driven params
   */
  shouldPreferExplicitParams(dimensions: DimensionSource): boolean {
    return dimensions.confidence < 0.4;
  }

  /**
   * Get confidence level descriptor
   */
  getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Build explanation of dimension-driven parameter choices
   * Useful for audit logs and debugging
   */
  explainMapping(dimensions: DimensionSource, suggestions: ParameterSuggestions): string {
    const lines = [
      `Dimension-Driven Parameter Mapping (Confidence: ${(dimensions.confidence * 100).toFixed(0)}%)`,
      `- Persona: ${suggestions.persona} (from ${dimensions.semanticDimensions.persona?.join(', ') || 'default'})`,
      `- Emotion: ${suggestions.emotion} (from ${dimensions.semanticDimensions.emotion?.join(', ') || 'default'})`,
      `- Target Turns: ${suggestions.targetTurns} (complexity: ${(suggestions.complexity * 10).toFixed(1)}/10)`,
      `- Categories: ${suggestions.categories.join(', ') || 'none'}`,
      `- Quality Modifier: ${suggestions.qualityModifier >= 0 ? '+' : ''}${suggestions.qualityModifier.toFixed(1)}`,
    ];
    
    if (this.shouldPreferExplicitParams(dimensions)) {
      lines.push(`- Warning: Low confidence - explicit params recommended`);
    }
    
    return lines.join('\n');
  }
}

// Export singleton instance
export const dimensionParameterMapper = new DimensionParameterMapper();

