/**
 * DimensionParser - Semantic Analysis of 60-Dimension Data
 * 
 * Parses chunk dimension data to extract:
 * - Personas (authoritative, supportive, analytical, casual)
 * - Emotions (anxious, confident, curious, frustrated)
 * - Complexity score (0-1) for turn count determination
 * - Domain tags (financial, technical, healthcare, legal)
 * 
 * Usage:
 *   const parser = new DimensionParser();
 *   const parsed = parser.parse(dimensionData, confidence);
 *   console.log(parsed.semanticDimensions.persona); // ['authoritative', 'analytical']
 */

import { DimensionSource } from '../types';

/**
 * Dimension mapping configuration
 * Maps specific dimension names to semantic categories
 */
interface DimensionMapping {
  personas: Record<string, string[]>; // persona -> dimension names
  emotions: Record<string, string[]>; // emotion -> dimension names
  complexity: string[]; // dimensions that indicate complexity
  domains: Record<string, string[]>; // domain -> dimension names
}

/**
 * Default dimension mappings based on 60-dimension schema
 * These mappings should be tuned based on actual dimension analysis
 */
const DEFAULT_MAPPINGS: DimensionMapping = {
  personas: {
    authoritative: ['formality', 'expertise_level', 'directness', 'assertiveness'],
    supportive: ['empathy', 'politeness', 'encouragement', 'helpfulness'],
    analytical: ['technical_depth', 'logical_structure', 'precision', 'detail_level'],
    casual: ['conversational_tone', 'informality', 'friendliness', 'relatability']
  },
  emotions: {
    anxious: ['uncertainty', 'concern', 'hesitation', 'worry'],
    confident: ['assertiveness', 'certainty', 'decisiveness', 'self_assurance'],
    curious: ['inquisitiveness', 'interest', 'exploration', 'open_mindedness'],
    frustrated: ['impatience', 'dissatisfaction', 'irritation', 'urgency']
  },
  complexity: [
    'technical_depth',
    'vocabulary_complexity',
    'sentence_structure',
    'concept_density',
    'abstraction_level',
    'detail_level'
  ],
  domains: {
    financial: ['financial_terminology', 'investment_concepts', 'monetary_references', 'risk_discussion'],
    technical: ['technical_terminology', 'implementation_details', 'system_architecture', 'code_references'],
    healthcare: ['medical_terminology', 'health_references', 'clinical_concepts', 'patient_care'],
    legal: ['legal_terminology', 'regulatory_references', 'compliance_discussion', 'contractual_language']
  }
};

export class DimensionParser {
  private mappings: DimensionMapping;
  private personaThreshold: number;
  private emotionThreshold: number;
  private domainThreshold: number;
  private minConfidenceThreshold: number;

  /**
   * Create a new DimensionParser
   * 
   * @param mappings - Custom dimension mappings (optional)
   * @param thresholds - Custom thresholds for matching (optional)
   */
  constructor(
    mappings?: Partial<DimensionMapping>,
    thresholds?: {
      persona?: number;
      emotion?: number;
      domain?: number;
      minConfidence?: number;
    }
  ) {
    this.mappings = {
      ...DEFAULT_MAPPINGS,
      ...mappings
    };
    this.personaThreshold = thresholds?.persona ?? 0.6;
    this.emotionThreshold = thresholds?.emotion ?? 0.6;
    this.domainThreshold = thresholds?.domain ?? 0.5;
    this.minConfidenceThreshold = thresholds?.minConfidence ?? 0.3;
  }

  /**
   * Parse raw dimension data into semantic categories
   * 
   * @param rawDimensions - Raw dimension values (dimension_name: value 0-1)
   * @param confidence - Overall confidence score (0-1)
   * @param chunkId - Optional chunk ID for traceability
   * @returns DimensionSource with semantic dimensions
   */
  parse(
    rawDimensions: Record<string, number>,
    confidence: number,
    chunkId?: string
  ): DimensionSource {
    // Validate confidence threshold
    const isConfident = this.validateConfidence(confidence);
    
    // If confidence too low, return conservative defaults
    if (!isConfident) {
      console.warn(`Low confidence (${confidence}) for chunk ${chunkId || 'unknown'}, using defaults`);
      return this.createDefaultDimensionSource(rawDimensions, confidence, chunkId);
    }

    // Extract semantic dimensions
    const personas = this.extractPersonas(rawDimensions);
    const emotions = this.extractEmotions(rawDimensions);
    const complexity = this.calculateComplexity(rawDimensions);
    const domain = this.extractDomainTags(rawDimensions);

    return {
      chunkId: chunkId || 'unknown',
      dimensions: rawDimensions,
      confidence,
      extractedAt: new Date().toISOString(),
      semanticDimensions: {
        persona: personas,
        emotion: emotions,
        complexity,
        domain
      }
    };
  }

  /**
   * Extract persona categories from dimensions
   * 
   * Analyzes dimension values and matches against persona profiles
   * Returns personas that exceed the threshold
   * 
   * @param dimensions - Dimension values
   * @returns Array of matched personas
   */
  extractPersonas(dimensions: Record<string, number>): string[] {
    const personas: string[] = [];

    for (const [persona, dimensionNames] of Object.entries(this.mappings.personas)) {
      const score = this.calculateCategoryScore(dimensions, dimensionNames);
      
      if (score >= this.personaThreshold) {
        personas.push(persona);
      }
    }

    // If no personas match, return a default
    if (personas.length === 0) {
      personas.push('neutral');
    }

    return personas;
  }

  /**
   * Extract emotion categories from dimensions
   * 
   * Analyzes dimension values and matches against emotion profiles
   * Returns emotions that exceed the threshold
   * 
   * @param dimensions - Dimension values
   * @returns Array of matched emotions
   */
  extractEmotions(dimensions: Record<string, number>): string[] {
    const emotions: string[] = [];

    for (const [emotion, dimensionNames] of Object.entries(this.mappings.emotions)) {
      const score = this.calculateCategoryScore(dimensions, dimensionNames);
      
      if (score >= this.emotionThreshold) {
        emotions.push(emotion);
      }
    }

    // If no emotions match, return a default
    if (emotions.length === 0) {
      emotions.push('neutral');
    }

    return emotions;
  }

  /**
   * Calculate complexity score from dimensions
   * 
   * Complexity determines turn count in conversation generation:
   * - High complexity (>0.7): More turns needed
   * - Medium complexity (0.4-0.7): Standard turn count
   * - Low complexity (<0.4): Fewer turns needed
   * 
   * @param dimensions - Dimension values
   * @returns Complexity score (0-1)
   */
  calculateComplexity(dimensions: Record<string, number>): number {
    const complexityDimensions = this.mappings.complexity;
    const score = this.calculateCategoryScore(dimensions, complexityDimensions);
    
    // Normalize to 0-1 range and ensure reasonable defaults
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Extract domain tags from dimensions
   * 
   * Identifies subject matter domains (financial, technical, etc.)
   * for appropriate template and parameter selection
   * 
   * @param dimensions - Dimension values
   * @returns Array of matched domain tags
   */
  extractDomainTags(dimensions: Record<string, number>): string[] {
    const domains: string[] = [];

    for (const [domain, dimensionNames] of Object.entries(this.mappings.domains)) {
      const score = this.calculateCategoryScore(dimensions, dimensionNames);
      
      if (score >= this.domainThreshold) {
        domains.push(domain);
      }
    }

    // Domains can be empty (general content)
    return domains;
  }

  /**
   * Validate confidence score meets minimum threshold
   * 
   * @param confidence - Confidence score (0-1)
   * @param minThreshold - Optional custom threshold
   * @returns True if confidence is acceptable
   */
  validateConfidence(confidence: number, minThreshold?: number): boolean {
    const threshold = minThreshold ?? this.minConfidenceThreshold;
    return confidence >= threshold;
  }

  /**
   * Calculate aggregate score for a category
   * 
   * Takes the average of dimension values that match the category
   * Missing dimensions are treated as 0
   * 
   * @param dimensions - All dimension values
   * @param targetDimensions - Dimension names to aggregate
   * @returns Average score (0-1)
   */
  private calculateCategoryScore(
    dimensions: Record<string, number>,
    targetDimensions: string[]
  ): number {
    if (targetDimensions.length === 0) return 0;

    let sum = 0;
    let count = 0;

    for (const dimName of targetDimensions) {
      const value = dimensions[dimName];
      if (value !== undefined && value !== null && !isNaN(value)) {
        sum += value;
        count++;
      }
    }

    // If no matching dimensions found, return 0
    if (count === 0) return 0;

    return sum / count;
  }

  /**
   * Create default dimension source for low-confidence data
   * 
   * @param rawDimensions - Raw dimension values
   * @param confidence - Confidence score
   * @param chunkId - Optional chunk ID
   * @returns Conservative default dimension source
   */
  private createDefaultDimensionSource(
    rawDimensions: Record<string, number>,
    confidence: number,
    chunkId?: string
  ): DimensionSource {
    return {
      chunkId: chunkId || 'unknown',
      dimensions: rawDimensions,
      confidence,
      extractedAt: new Date().toISOString(),
      semanticDimensions: {
        persona: ['neutral'],
        emotion: ['neutral'],
        complexity: 0.5, // Medium complexity default
        domain: []
      }
    };
  }

  /**
   * Get readable description of parsed dimensions
   * 
   * Useful for debugging and logging
   * 
   * @param dimensionSource - Parsed dimension source
   * @returns Human-readable summary
   */
  describe(dimensionSource: DimensionSource): string {
    const { semanticDimensions } = dimensionSource;
    if (!semanticDimensions) return 'No semantic dimensions available';

    const parts: string[] = [];
    
    if (semanticDimensions.persona && semanticDimensions.persona.length > 0) {
      parts.push(`Personas: ${semanticDimensions.persona.join(', ')}`);
    }
    
    if (semanticDimensions.emotion && semanticDimensions.emotion.length > 0) {
      parts.push(`Emotions: ${semanticDimensions.emotion.join(', ')}`);
    }
    
    if (semanticDimensions.complexity !== undefined) {
      const level = 
        semanticDimensions.complexity > 0.7 ? 'High' :
        semanticDimensions.complexity > 0.4 ? 'Medium' : 'Low';
      parts.push(`Complexity: ${level} (${semanticDimensions.complexity.toFixed(2)})`);
    }
    
    if (semanticDimensions.domain && semanticDimensions.domain.length > 0) {
      parts.push(`Domains: ${semanticDimensions.domain.join(', ')}`);
    }

    return parts.join(' | ');
  }

  /**
   * Update dimension mappings at runtime
   * 
   * Useful for tuning based on actual data analysis
   * 
   * @param newMappings - Partial or complete mappings to update
   */
  updateMappings(newMappings: Partial<DimensionMapping>): void {
    this.mappings = {
      ...this.mappings,
      ...newMappings
    };
  }

  /**
   * Get current dimension mappings
   * 
   * @returns Current mappings configuration
   */
  getMappings(): DimensionMapping {
    return { ...this.mappings };
  }

  /**
   * Get current thresholds
   * 
   * @returns Current threshold configuration
   */
  getThresholds(): {
    persona: number;
    emotion: number;
    domain: number;
    minConfidence: number;
  } {
    return {
      persona: this.personaThreshold,
      emotion: this.emotionThreshold,
      domain: this.domainThreshold,
      minConfidence: this.minConfidenceThreshold
    };
  }
}

// Export singleton instance with default configuration
export const dimensionParser = new DimensionParser();

