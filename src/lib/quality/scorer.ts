/**
 * Quality Scoring Engine
 * 
 * Evaluates conversation quality based on multiple criteria:
 * - Turn count (30% weight)
 * - Length/token usage (25% weight)
 * - Structure validity (30% weight)
 * - Confidence/coherence (15% weight)
 * - Dimension confidence (optional, adds context when available)
 */

import {
  QualityScore,
  QualityBreakdown,
  TurnCountScore,
  LengthScore,
  StructureScore,
  ConfidenceScore,
  ConversationData,
  TierConfig,
  ConfidenceFactor,
} from './types';
import type { DimensionSource } from '../generation/types';

// Tier-specific thresholds
const TIER_CONFIG: TierConfig = {
  template: {
    turnCount: {
      optimal: { min: 8, max: 16 },
      acceptable: { min: 6, max: 20 },
    },
    avgTurnLength: {
      optimal: { min: 100, max: 400 },
      acceptable: { min: 50, max: 600 },
    },
    minTotalLength: 1000,
  },
  scenario: {
    turnCount: {
      optimal: { min: 10, max: 20 },
      acceptable: { min: 8, max: 24 },
    },
    avgTurnLength: {
      optimal: { min: 150, max: 500 },
      acceptable: { min: 80, max: 700 },
    },
    minTotalLength: 1500,
  },
  edge_case: {
    turnCount: {
      optimal: { min: 6, max: 12 },
      acceptable: { min: 4, max: 16 },
    },
    avgTurnLength: {
      optimal: { min: 120, max: 450 },
      acceptable: { min: 60, max: 650 },
    },
    minTotalLength: 800,
  },
};

// Component weights (must sum to 1.0)
const WEIGHTS = {
  turnCount: 0.30,
  length: 0.25,
  structure: 0.30,
  confidence: 0.15,
};

// Dimension confidence weighting
const DIMENSION_WEIGHT = 0.15; // Weight when dimension confidence is available

export class QualityScorer {
  /**
   * Calculate comprehensive quality score for a conversation
   * @param conversation - Conversation data to score
   * @param dimensionSource - Optional dimension data from chunk analysis
   */
  calculateScore(
    conversation: ConversationData,
    dimensionSource?: DimensionSource | null
  ): QualityScore {
    const breakdown = this.calculateBreakdown(conversation);
    const overall = this.calculateOverallScore(breakdown, dimensionSource);
    
    // Auto-flag if score is low OR dimension confidence is very low
    const autoFlagged = overall < 6.0 || (dimensionSource ? dimensionSource.confidence < 0.5 : false);

    return {
      overall: Math.round(overall * 10) / 10, // Round to 1 decimal
      breakdown,
      recommendations: [], // Will be populated by recommendations.ts
      autoFlagged,
      calculatedAt: new Date().toISOString(),
      dimensionConfidence: dimensionSource?.confidence,
    };
  }

  /**
   * Calculate detailed breakdown of quality components
   */
  private calculateBreakdown(conversation: ConversationData): QualityBreakdown {
    return {
      turnCount: this.evaluateTurnCount(conversation),
      length: this.evaluateLength(conversation),
      structure: this.evaluateStructure(conversation),
      confidence: this.evaluateConfidence(conversation),
    };
  }

  /**
   * Calculate weighted overall score
   * @param breakdown - Quality breakdown scores
   * @param dimensionSource - Optional dimension confidence data
   */
  private calculateOverallScore(
    breakdown: QualityBreakdown,
    dimensionSource?: DimensionSource | null
  ): number {
    // Base score from conversation analysis
    let baseScore = (
      breakdown.turnCount.score * WEIGHTS.turnCount +
      breakdown.length.score * WEIGHTS.length +
      breakdown.structure.score * WEIGHTS.structure +
      breakdown.confidence.score * WEIGHTS.confidence
    );

    // Apply dimension confidence factor if available
    if (dimensionSource) {
      const dimConfidence = dimensionSource.confidence;
      
      // Convert 0-1 confidence to 0-10 score
      const dimensionScore = dimConfidence * 10;
      
      // Adjust base score based on dimension confidence
      // High confidence (>0.8): boost score slightly
      // Low confidence (<0.5): reduce score
      if (dimConfidence >= 0.8) {
        baseScore += (dimConfidence - 0.8) * 5; // Max +1 point
      } else if (dimConfidence < 0.5) {
        baseScore += -2 * (0.5 - dimConfidence) * 2; // Max -2 points
      }
      
      // Alternative: Blend dimension confidence as weighted component
      // baseScore = baseScore * (1 - DIMENSION_WEIGHT) + dimensionScore * DIMENSION_WEIGHT;
    }

    return Math.max(0, Math.min(10, baseScore)); // Clamp between 0-10
  }

  /**
   * Evaluate turn count against tier-specific thresholds
   */
  private evaluateTurnCount(conversation: ConversationData): TurnCountScore {
    const config = TIER_CONFIG[conversation.tier];
    const actual = conversation.totalTurns;
    const { optimal, acceptable } = config.turnCount;

    let score: number;
    let status: 'optimal' | 'acceptable' | 'poor';
    let message: string;

    if (actual >= optimal.min && actual <= optimal.max) {
      score = 10;
      status = 'optimal';
      message = 'Turn count is within optimal range';
    } else if (actual >= acceptable.min && actual <= acceptable.max) {
      // Graduated scoring for acceptable range
      if (actual < optimal.min) {
        // Too few turns
        const distance = optimal.min - actual;
        const maxDistance = optimal.min - acceptable.min;
        score = 7 - (distance / maxDistance) * 2; // 7-5
      } else {
        // Too many turns
        const distance = actual - optimal.max;
        const maxDistance = acceptable.max - optimal.max;
        score = 7 - (distance / maxDistance) * 2; // 7-5
      }
      status = 'acceptable';
      message = actual < optimal.min 
        ? 'Turn count is slightly below optimal' 
        : 'Turn count is slightly above optimal';
    } else {
      // Outside acceptable range
      score = actual < acceptable.min ? 3 : 4;
      status = 'poor';
      message = actual < acceptable.min
        ? 'Turn count is too low - conversation may be too brief'
        : 'Turn count is too high - conversation may be too lengthy';
    }

    return {
      score: Math.round(score * 10) / 10,
      weight: WEIGHTS.turnCount,
      actual,
      target: `${optimal.min}-${optimal.max} (optimal), ${acceptable.min}-${acceptable.max} (acceptable)`,
      status,
      message,
    };
  }

  /**
   * Evaluate conversation length and token usage
   */
  private evaluateLength(conversation: ConversationData): LengthScore {
    const config = TIER_CONFIG[conversation.tier];
    
    // Calculate total character length and average turn length
    const totalLength = conversation.turns.reduce(
      (sum, turn) => sum + turn.content.length,
      0
    );
    const avgTurnLength = totalLength / conversation.totalTurns;

    const { optimal, acceptable } = config.avgTurnLength;

    let score: number;
    let status: 'optimal' | 'acceptable' | 'poor';
    let message: string;

    // Check if conversation is too short overall
    if (totalLength < config.minTotalLength) {
      score = 3;
      status = 'poor';
      message = 'Overall conversation length is too short';
    } else if (avgTurnLength >= optimal.min && avgTurnLength <= optimal.max) {
      score = 10;
      status = 'optimal';
      message = 'Turn length is within optimal range';
    } else if (avgTurnLength >= acceptable.min && avgTurnLength <= acceptable.max) {
      // Graduated scoring
      if (avgTurnLength < optimal.min) {
        const distance = optimal.min - avgTurnLength;
        const maxDistance = optimal.min - acceptable.min;
        score = 7 - (distance / maxDistance) * 2;
      } else {
        const distance = avgTurnLength - optimal.max;
        const maxDistance = acceptable.max - optimal.max;
        score = 7 - (distance / maxDistance) * 2;
      }
      status = 'acceptable';
      message = avgTurnLength < optimal.min
        ? 'Turn length is slightly below optimal'
        : 'Turn length is slightly above optimal';
    } else {
      score = avgTurnLength < acceptable.min ? 3 : 4;
      status = 'poor';
      message = avgTurnLength < acceptable.min
        ? 'Turn length is too short - responses lack detail'
        : 'Turn length is too long - responses may be overly verbose';
    }

    return {
      score: Math.round(score * 10) / 10,
      weight: WEIGHTS.length,
      actual: totalLength,
      target: `${optimal.min}-${optimal.max} chars/turn (optimal)`,
      avgTurnLength: Math.round(avgTurnLength),
      status,
      message,
    };
  }

  /**
   * Evaluate conversation structure and validity
   */
  private evaluateStructure(conversation: ConversationData): StructureScore {
    const issues: string[] = [];
    let score = 10;

    // Check if conversation has turns
    if (conversation.turns.length === 0) {
      return {
        score: 0,
        weight: WEIGHTS.structure,
        valid: false,
        issues: ['No turns found in conversation'],
        status: 'has_issues',
        message: 'Conversation has no turns',
      };
    }

    // Check if conversation starts with user
    if (conversation.turns[0].role !== 'user') {
      issues.push('Conversation does not start with user message');
      score -= 2;
    }

    // Check for proper role alternation
    let lastRole: 'user' | 'assistant' | null = null;
    for (let i = 0; i < conversation.turns.length; i++) {
      const turn = conversation.turns[i];
      
      if (lastRole === turn.role) {
        issues.push(`Improper role alternation at turn ${i + 1}`);
        score -= 1.5;
        break; // Only report first alternation issue
      }
      
      lastRole = turn.role;
    }

    // Check for empty turns
    const emptyTurns = conversation.turns.filter(
      (turn) => !turn.content || turn.content.trim().length === 0
    );
    if (emptyTurns.length > 0) {
      issues.push(`${emptyTurns.length} empty turn(s) found`);
      score -= emptyTurns.length * 2;
    }

    // Check for very short turns (likely incomplete)
    const veryShortTurns = conversation.turns.filter(
      (turn) => turn.content.trim().length < 10
    );
    if (veryShortTurns.length > 0) {
      issues.push(`${veryShortTurns.length} very short turn(s) (< 10 chars)`);
      score -= veryShortTurns.length * 0.5;
    }

    // Check for balanced user/assistant turns
    const userTurns = conversation.turns.filter((t) => t.role === 'user').length;
    const assistantTurns = conversation.turns.filter((t) => t.role === 'assistant').length;
    const difference = Math.abs(userTurns - assistantTurns);
    
    if (difference > 1) {
      issues.push(`Imbalanced turn distribution (${userTurns} user, ${assistantTurns} assistant)`);
      score -= 1;
    }

    score = Math.max(0, score); // Ensure score doesn't go below 0

    return {
      score: Math.round(score * 10) / 10,
      weight: WEIGHTS.structure,
      valid: issues.length === 0,
      issues,
      status: issues.length === 0 ? 'valid' : 'has_issues',
      message: issues.length === 0
        ? 'Conversation structure is valid'
        : `${issues.length} structural issue(s) found`,
    };
  }

  /**
   * Evaluate confidence based on content quality indicators
   */
  private evaluateConfidence(conversation: ConversationData): ConfidenceScore {
    const factors: ConfidenceFactor[] = [];
    let score = 7; // Start at medium confidence

    // Check for conversation coherence indicators
    
    // 1. Response variation (not too repetitive)
    const uniqueResponses = new Set(
      conversation.turns.map((t) => t.content.toLowerCase().substring(0, 50))
    ).size;
    const repetitionRate = uniqueResponses / conversation.turns.length;
    
    if (repetitionRate > 0.9) {
      score += 1.5;
      factors.push({
        name: 'High Response Variation',
        impact: 'positive',
        description: 'Responses show good variety and uniqueness',
      });
    } else if (repetitionRate < 0.6) {
      score -= 2;
      factors.push({
        name: 'Low Response Variation',
        impact: 'negative',
        description: 'Responses appear repetitive',
      });
    }

    // 2. Average response length consistency
    const lengths = conversation.turns.map((t) => t.content.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avgLength;

    if (coefficientOfVariation < 0.5) {
      score += 1;
      factors.push({
        name: 'Consistent Turn Lengths',
        impact: 'positive',
        description: 'Turn lengths are consistent throughout',
      });
    } else if (coefficientOfVariation > 1.5) {
      score -= 1;
      factors.push({
        name: 'Inconsistent Turn Lengths',
        impact: 'negative',
        description: 'Turn lengths vary significantly',
      });
    }

    // 3. Natural conversation flow (questions and answers)
    const questionMarks = conversation.turns.filter(
      (t) => t.content.includes('?')
    ).length;
    const questionRate = questionMarks / conversation.totalTurns;

    if (questionRate >= 0.2 && questionRate <= 0.5) {
      score += 1;
      factors.push({
        name: 'Natural Question Flow',
        impact: 'positive',
        description: 'Good balance of questions and statements',
      });
    } else if (questionRate > 0.7) {
      score -= 0.5;
      factors.push({
        name: 'Too Many Questions',
        impact: 'negative',
        description: 'Excessive questions may indicate lack of depth',
      });
    }

    // 4. Completeness (conversation has proper ending)
    const lastTurn = conversation.turns[conversation.turns.length - 1];
    if (lastTurn.role === 'assistant' && lastTurn.content.length > 50) {
      score += 0.5;
      factors.push({
        name: 'Complete Ending',
        impact: 'positive',
        description: 'Conversation has a proper concluding response',
      });
    }

    // Determine confidence level
    score = Math.max(0, Math.min(10, score)); // Clamp between 0-10
    let level: 'high' | 'medium' | 'low';
    
    if (score >= 8) {
      level = 'high';
    } else if (score >= 5) {
      level = 'medium';
    } else {
      level = 'low';
    }

    return {
      score: Math.round(score * 10) / 10,
      weight: WEIGHTS.confidence,
      level,
      factors,
      message: `Confidence level is ${level} based on ${factors.length} indicators`,
    };
  }

  /**
   * Get tier configuration for reference
   */
  getTierConfig(tier: 'template' | 'scenario' | 'edge_case') {
    return TIER_CONFIG[tier];
  }

  /**
   * Get component weights for reference
   */
  getWeights() {
    return WEIGHTS;
  }
}

// Export singleton instance
export const qualityScorer = new QualityScorer();

