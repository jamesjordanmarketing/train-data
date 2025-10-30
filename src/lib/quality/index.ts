/**
 * Quality Validation System
 * 
 * Comprehensive quality scoring and validation for generated conversations
 */

export * from './types';
export * from './scorer';
export * from './recommendations';
export * from './auto-flag';

// Re-export main functions for convenience
import { qualityScorer } from './scorer';
import { generateRecommendations } from './recommendations';
import { evaluateAndFlag, autoFlagger } from './auto-flag';
import type { ConversationData, QualityScore } from './types';

/**
 * Main quality validation function
 * Scores a conversation and generates recommendations
 */
export async function validateConversationQuality(
  conversation: ConversationData
): Promise<QualityScore> {
  // Calculate score
  const score = qualityScorer.calculateScore(conversation);
  
  // Generate recommendations
  score.recommendations = generateRecommendations(score);
  
  return score;
}

/**
 * Validate and auto-flag if needed
 */
export async function validateAndFlag(
  conversationId: string,
  conversation: ConversationData,
  options?: { threshold?: number; updateStatus?: boolean }
): Promise<{ score: QualityScore; flagResult: any }> {
  // Calculate quality score
  const score = await validateConversationQuality(conversation);
  
  // Auto-flag if below threshold
  const flagResult = await evaluateAndFlag(conversationId, score, options);
  
  return { score, flagResult };
}

export { qualityScorer, generateRecommendations, evaluateAndFlag, autoFlagger };

