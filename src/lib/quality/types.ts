/**
 * Quality Validation Types
 * 
 * Type definitions for quality scoring, breakdown, and recommendations
 */

export interface QualityScore {
  overall: number; // 0-10
  breakdown: QualityBreakdown;
  recommendations: string[];
  autoFlagged: boolean;
  calculatedAt: string;
}

export interface QualityBreakdown {
  turnCount: TurnCountScore;
  length: LengthScore;
  structure: StructureScore;
  confidence: ConfidenceScore;
}

export interface TurnCountScore {
  score: number; // 0-10
  weight: number; // Weight in final score (0.30)
  actual: number;
  target: string;
  status: 'optimal' | 'acceptable' | 'poor';
  message: string;
}

export interface LengthScore {
  score: number; // 0-10
  weight: number; // Weight in final score (0.25)
  actual: number;
  target: string;
  avgTurnLength: number;
  status: 'optimal' | 'acceptable' | 'poor';
  message: string;
}

export interface StructureScore {
  score: number; // 0-10
  weight: number; // Weight in final score (0.25)
  valid: boolean;
  issues: string[];
  status: 'valid' | 'has_issues';
  message: string;
}

export interface ConfidenceScore {
  score: number; // 0-10
  weight: number; // Weight in final score (0.20)
  level: 'high' | 'medium' | 'low';
  factors: ConfidenceFactor[];
  message: string;
}

export interface ConfidenceFactor {
  name: string;
  impact: 'positive' | 'negative';
  description: string;
}

export interface ConversationData {
  turns: ConversationTurn[];
  totalTurns: number;
  totalTokens: number;
  tier: 'template' | 'scenario' | 'edge_case';
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  tokenCount?: number;
}

// Tier-specific configuration
export interface TierConfig {
  template: TierThresholds;
  scenario: TierThresholds;
  edge_case: TierThresholds;
}

export interface TierThresholds {
  turnCount: {
    optimal: { min: number; max: number };
    acceptable: { min: number; max: number };
  };
  avgTurnLength: {
    optimal: { min: number; max: number };
    acceptable: { min: number; max: number };
  };
  minTotalLength: number;
}

