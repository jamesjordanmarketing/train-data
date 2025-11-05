/**
 * Quality Validation Service
 * 
 * Automated quality assessment for generated conversations.
 * Evaluates conversations based on structural criteria, content
 * quality, and training value.
 * 
 * Features:
 * - Turn count validation (optimal 8-16 turns)
 * - Response length validation
 * - Structure validation (alternating roles, valid JSON)
 * - Composite quality scoring (0-10 scale)
 * - Confidence level determination
 * 
 * @module quality-validator
 */

import type { ConversationTurn, QualityMetrics } from '../../../@/lib/types';

/**
 * Conversation structure for validation
 */
export interface ConversationForValidation {
  title?: string;
  turns: ConversationTurn[];
  parameters?: Record<string, any>;
}

/**
 * Individual scoring component
 */
interface ScoreComponent {
  score: number;
  maxScore: number;
  weight: number;
  reason: string;
}

/**
 * Detailed validation result
 */
export interface ValidationResult {
  qualityMetrics: QualityMetrics;
  scoreBreakdown: {
    turnCount: ScoreComponent;
    responseLength: ScoreComponent;
    structure: ScoreComponent;
    coherence: ScoreComponent;
  };
  issues: string[];
  suggestions: string[];
}

/**
 * Quality Validator
 * 
 * Evaluates conversation quality based on multiple criteria
 */
export class QualityValidator {
  // Scoring weights (must sum to 1.0)
  private readonly weights = {
    turnCount: 0.30,      // 30% - Number of turns
    responseLength: 0.25,  // 25% - Average response length
    structure: 0.30,       // 30% - JSON structure validity
    coherence: 0.15,       // 15% - Conversation coherence
  };

  // Turn count thresholds
  private readonly turnThresholds = {
    optimal: { min: 8, max: 16 },
    acceptable: { min: 6, max: 20 },
    minimal: { min: 4, max: 24 },
  };

  // Response length thresholds (characters)
  private readonly lengthThresholds = {
    optimal: { min: 100, max: 500 },
    acceptable: { min: 50, max: 800 },
    minimal: { min: 20, max: 1200 },
  };

  /**
   * Validate a conversation and calculate quality metrics
   * 
   * @param conversation - Conversation to validate
   * @returns Quality metrics and detailed breakdown
   * 
   * @example
   * ```typescript
   * const validator = new QualityValidator();
   * const result = validator.validateConversation({
   *   turns: [
   *     { role: 'user', content: 'Hello', timestamp: '...', tokenCount: 5 },
   *     { role: 'assistant', content: 'Hi there!', timestamp: '...', tokenCount: 8 }
   *   ]
   * });
   * 
   * console.log('Overall score:', result.qualityMetrics.overall);
   * console.log('Confidence:', result.qualityMetrics.confidence);
   * ```
   */
  validateConversation(conversation: ConversationForValidation): ValidationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 1. Turn Count Score
    const turnCountComponent = this.calculateTurnCountScore(
      conversation.turns.length,
      issues,
      suggestions
    );

    // 2. Response Length Score
    const lengthComponent = this.calculateLengthScore(
      conversation.turns,
      issues,
      suggestions
    );

    // 3. Structure Score
    const structureComponent = this.validateStructure(
      conversation,
      issues,
      suggestions
    );

    // 4. Coherence Score
    const coherenceComponent = this.calculateCoherenceScore(
      conversation.turns,
      issues,
      suggestions
    );

    // Calculate weighted composite score
    const compositeScore = this.calculateCompositeScore([
      turnCountComponent,
      lengthComponent,
      structureComponent,
      coherenceComponent,
    ]);

    // Determine confidence and training value
    const confidence = this.determineConfidence(compositeScore, issues.length);
    const trainingValue = this.determineTrainingValue(
      compositeScore,
      conversation.turns.length
    );

    // Calculate individual metrics (normalized to 0-10)
    const qualityMetrics: QualityMetrics = {
      overall: compositeScore,
      relevance: this.normalizeScore(structureComponent.score, structureComponent.maxScore),
      accuracy: this.normalizeScore(coherenceComponent.score, coherenceComponent.maxScore),
      naturalness: this.normalizeScore(lengthComponent.score, lengthComponent.maxScore),
      methodology: this.normalizeScore(turnCountComponent.score, turnCountComponent.maxScore),
      coherence: this.normalizeScore(coherenceComponent.score, coherenceComponent.maxScore),
      confidence,
      uniqueness: this.calculateUniqueness(conversation),
      trainingValue,
    };

    return {
      qualityMetrics,
      scoreBreakdown: {
        turnCount: turnCountComponent,
        responseLength: lengthComponent,
        structure: structureComponent,
        coherence: coherenceComponent,
      },
      issues,
      suggestions,
    };
  }

  /**
   * Calculate turn count score
   * @private
   */
  private calculateTurnCountScore(
    turnCount: number,
    issues: string[],
    suggestions: string[]
  ): ScoreComponent {
    let score = 0;
    let reason = '';

    if (
      turnCount >= this.turnThresholds.optimal.min &&
      turnCount <= this.turnThresholds.optimal.max
    ) {
      score = 10;
      reason = `Optimal turn count (${turnCount} turns)`;
    } else if (
      turnCount >= this.turnThresholds.acceptable.min &&
      turnCount <= this.turnThresholds.acceptable.max
    ) {
      score = 7;
      reason = `Acceptable turn count (${turnCount} turns)`;
      
      if (turnCount < this.turnThresholds.optimal.min) {
        suggestions.push(
          `Consider adding more turns (current: ${turnCount}, optimal: ${this.turnThresholds.optimal.min}-${this.turnThresholds.optimal.max})`
        );
      } else {
        suggestions.push(
          `Consider reducing turns (current: ${turnCount}, optimal: ${this.turnThresholds.optimal.min}-${this.turnThresholds.optimal.max})`
        );
      }
    } else if (
      turnCount >= this.turnThresholds.minimal.min &&
      turnCount <= this.turnThresholds.minimal.max
    ) {
      score = 4;
      reason = `Below optimal turn count (${turnCount} turns)`;
      issues.push(
        `Turn count ${turnCount} is outside optimal range (${this.turnThresholds.optimal.min}-${this.turnThresholds.optimal.max})`
      );
    } else {
      score = 2;
      reason = `Poor turn count (${turnCount} turns)`;
      issues.push(
        `Turn count ${turnCount} is critically low or high (optimal: ${this.turnThresholds.optimal.min}-${this.turnThresholds.optimal.max})`
      );
    }

    return {
      score,
      maxScore: 10,
      weight: this.weights.turnCount,
      reason,
    };
  }

  /**
   * Calculate response length score
   * @private
   */
  private calculateLengthScore(
    turns: ConversationTurn[],
    issues: string[],
    suggestions: string[]
  ): ScoreComponent {
    if (turns.length === 0) {
      return {
        score: 0,
        maxScore: 10,
        weight: this.weights.responseLength,
        reason: 'No turns to evaluate',
      };
    }

    const avgLength = turns.reduce((sum, t) => sum + t.content.length, 0) / turns.length;

    let score = 0;
    let reason = '';

    if (
      avgLength >= this.lengthThresholds.optimal.min &&
      avgLength <= this.lengthThresholds.optimal.max
    ) {
      score = 10;
      reason = `Optimal average length (${Math.round(avgLength)} chars)`;
    } else if (
      avgLength >= this.lengthThresholds.acceptable.min &&
      avgLength <= this.lengthThresholds.acceptable.max
    ) {
      score = 7;
      reason = `Acceptable average length (${Math.round(avgLength)} chars)`;
      
      if (avgLength < this.lengthThresholds.optimal.min) {
        suggestions.push(
          `Responses are slightly short (avg: ${Math.round(avgLength)} chars, optimal: ${this.lengthThresholds.optimal.min}-${this.lengthThresholds.optimal.max})`
        );
      } else {
        suggestions.push(
          `Responses are slightly long (avg: ${Math.round(avgLength)} chars, optimal: ${this.lengthThresholds.optimal.min}-${this.lengthThresholds.optimal.max})`
        );
      }
    } else if (
      avgLength >= this.lengthThresholds.minimal.min &&
      avgLength <= this.lengthThresholds.minimal.max
    ) {
      score = 4;
      reason = `Below optimal length (${Math.round(avgLength)} chars)`;
      issues.push(
        `Average response length ${Math.round(avgLength)} chars is outside optimal range`
      );
    } else {
      score = 2;
      reason = `Poor average length (${Math.round(avgLength)} chars)`;
      issues.push(
        `Average response length ${Math.round(avgLength)} chars is critically low or high`
      );
    }

    // Check for outliers
    const outliers = turns.filter(
      t => t.content.length < 20 || t.content.length > 1000
    );
    if (outliers.length > 0) {
      suggestions.push(
        `${outliers.length} turn(s) have unusual length (very short or very long)`
      );
    }

    return {
      score,
      maxScore: 10,
      weight: this.weights.responseLength,
      reason,
    };
  }

  /**
   * Validate conversation structure
   * @private
   */
  private validateStructure(
    conversation: ConversationForValidation,
    issues: string[],
    suggestions: string[]
  ): ScoreComponent {
    let score = 10; // Start with perfect score
    const deductions: string[] = [];

    // Check if turns exist
    if (!conversation.turns || !Array.isArray(conversation.turns)) {
      issues.push('Invalid conversation structure: turns array missing or invalid');
      return {
        score: 0,
        maxScore: 10,
        weight: this.weights.structure,
        reason: 'Invalid structure',
      };
    }

    // Check minimum turns
    if (conversation.turns.length < 2) {
      issues.push('Conversation must have at least 2 turns');
      score -= 5;
      deductions.push('insufficient turns (-5)');
    }

    // Verify alternating roles
    for (let i = 0; i < conversation.turns.length; i++) {
      const turn = conversation.turns[i];
      const expectedRole = i % 2 === 0 ? 'user' : 'assistant';

      if (!turn.role) {
        issues.push(`Turn ${i + 1} missing role`);
        score -= 2;
        deductions.push(`missing role at turn ${i + 1} (-2)`);
      } else if (turn.role !== expectedRole) {
        issues.push(
          `Turn ${i + 1} has incorrect role: expected '${expectedRole}', got '${turn.role}'`
        );
        score -= 3;
        deductions.push(`incorrect role at turn ${i + 1} (-3)`);
      }

      // Check content
      if (!turn.content || turn.content.trim().length === 0) {
        issues.push(`Turn ${i + 1} has empty content`);
        score -= 2;
        deductions.push(`empty content at turn ${i + 1} (-2)`);
      }

      // Check timestamp
      if (!turn.timestamp) {
        suggestions.push(`Turn ${i + 1} missing timestamp`);
      }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    const reason =
      deductions.length > 0
        ? `Structure issues: ${deductions.join(', ')}`
        : 'Valid structure';

    return {
      score,
      maxScore: 10,
      weight: this.weights.structure,
      reason,
    };
  }

  /**
   * Calculate coherence score based on conversation flow
   * @private
   */
  private calculateCoherenceScore(
    turns: ConversationTurn[],
    issues: string[],
    suggestions: string[]
  ): ScoreComponent {
    let score = 10; // Start with perfect score
    const deductions: string[] = [];

    if (turns.length === 0) {
      return {
        score: 0,
        maxScore: 10,
        weight: this.weights.coherence,
        reason: 'No turns to evaluate',
      };
    }

    // Check for very short responses (likely low quality)
    const veryShortTurns = turns.filter(t => t.content.length < 10);
    if (veryShortTurns.length > 0) {
      score -= Math.min(3, veryShortTurns.length);
      deductions.push(
        `${veryShortTurns.length} very short response(s) (-${Math.min(3, veryShortTurns.length)})`
      );
    }

    // Check for repeated content
    const contents = turns.map(t => t.content.toLowerCase().trim());
    const uniqueContents = new Set(contents);
    if (uniqueContents.size < contents.length) {
      const repeats = contents.length - uniqueContents.size;
      score -= Math.min(2, repeats);
      deductions.push(`${repeats} repeated response(s) (-${Math.min(2, repeats)})`);
      suggestions.push('Conversation contains repeated responses');
    }

    // Check for greeting/closing
    const firstTurn = turns[0].content.toLowerCase();
    const lastTurn = turns[turns.length - 1].content.toLowerCase();

    const hasGreeting = /\b(hello|hi|hey|greetings|good\s+(morning|afternoon|evening))\b/.test(
      firstTurn
    );
    const hasClosing = /\b(bye|goodbye|thank|thanks|appreciate|farewell)\b/.test(lastTurn);

    if (!hasGreeting) {
      suggestions.push('Conversation lacks a proper greeting');
    }

    if (!hasClosing && turns.length >= 6) {
      suggestions.push('Conversation lacks a proper closing');
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    const reason =
      deductions.length > 0
        ? `Coherence issues: ${deductions.join(', ')}`
        : 'Good coherence';

    return {
      score,
      maxScore: 10,
      weight: this.weights.coherence,
      reason,
    };
  }

  /**
   * Calculate composite weighted score
   * @private
   */
  private calculateCompositeScore(components: ScoreComponent[]): number {
    const weightedSum = components.reduce((sum, component) => {
      const normalizedScore = (component.score / component.maxScore) * 10;
      return sum + normalizedScore * component.weight;
    }, 0);

    // Round to 1 decimal place
    return Math.round(weightedSum * 10) / 10;
  }

  /**
   * Normalize score to 0-10 scale
   * @private
   */
  private normalizeScore(score: number, maxScore: number): number {
    return Math.round((score / maxScore) * 100) / 10;
  }

  /**
   * Determine confidence level
   * @private
   */
  private determineConfidence(
    score: number,
    issueCount: number
  ): 'high' | 'medium' | 'low' {
    if (score >= 8 && issueCount === 0) {
      return 'high';
    } else if (score >= 6 && issueCount <= 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Determine training value
   * @private
   */
  private determineTrainingValue(
    score: number,
    turnCount: number
  ): 'high' | 'medium' | 'low' {
    if (
      score >= 8 &&
      turnCount >= this.turnThresholds.optimal.min &&
      turnCount <= this.turnThresholds.optimal.max
    ) {
      return 'high';
    } else if (score >= 6) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Calculate content uniqueness score
   * @private
   */
  private calculateUniqueness(conversation: ConversationForValidation): number {
    if (conversation.turns.length === 0) {
      return 0;
    }

    // Simple uniqueness metric based on vocabulary diversity
    const allWords = conversation.turns
      .map(t => t.content.toLowerCase())
      .join(' ')
      .split(/\s+/)
      .filter(w => w.length > 3); // Filter short words

    const uniqueWords = new Set(allWords);
    const diversity = uniqueWords.size / Math.max(1, allWords.length);

    // Normalize to 0-10 scale
    return Math.round(diversity * 100) / 10;
  }

  /**
   * Quick validation check (returns only pass/fail)
   * 
   * @param conversation - Conversation to validate
   * @param threshold - Minimum quality score (default: 6.0)
   * @returns Whether conversation meets threshold
   */
  quickValidate(conversation: ConversationForValidation, threshold: number = 6.0): boolean {
    const result = this.validateConversation(conversation);
    return result.qualityMetrics.overall >= threshold;
  }

  /**
   * Get validation summary (for logging)
   * 
   * @param result - Validation result
   * @returns Human-readable summary
   */
  getSummary(result: ValidationResult): string {
    const { qualityMetrics, issues, suggestions } = result;

    let summary = `Quality Score: ${qualityMetrics.overall}/10 (${qualityMetrics.confidence} confidence)\n`;
    summary += `Training Value: ${qualityMetrics.trainingValue}\n`;

    if (issues.length > 0) {
      summary += `\nIssues (${issues.length}):\n`;
      issues.forEach((issue, i) => {
        summary += `  ${i + 1}. ${issue}\n`;
      });
    }

    if (suggestions.length > 0) {
      summary += `\nSuggestions (${suggestions.length}):\n`;
      suggestions.forEach((suggestion, i) => {
        summary += `  ${i + 1}. ${suggestion}\n`;
      });
    }

    return summary;
  }
}

/**
 * Singleton instance for convenience
 */
let validatorInstance: QualityValidator | null = null;

/**
 * Get or create singleton quality validator instance
 */
export function getQualityValidator(): QualityValidator {
  if (!validatorInstance) {
    validatorInstance = new QualityValidator();
  }
  return validatorInstance;
}

/**
 * Reset singleton instance (useful for testing)
 */
export function resetQualityValidator(): void {
  validatorInstance = null;
}

