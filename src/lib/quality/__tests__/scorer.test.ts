/**
 * Quality Scorer Test Suite
 * 
 * Comprehensive tests for quality scoring algorithm
 */

import { describe, it, expect } from '@jest/globals';
import { QualityScorer } from '../scorer';
import { ConversationData } from '../types';

describe('QualityScorer', () => {
  const scorer = new QualityScorer();

  describe('Turn Count Evaluation', () => {
    it('should give optimal score for template with 8-16 turns', () => {
      const conversation: ConversationData = {
        turns: Array(12).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'Test content with sufficient length for evaluation',
        })),
        totalTurns: 12,
        totalTokens: 500,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.turnCount.score).toBe(10);
      expect(result.breakdown.turnCount.status).toBe('optimal');
    });

    it('should give acceptable score for template with 6-7 turns', () => {
      const conversation: ConversationData = {
        turns: Array(6).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'Test content with sufficient length for evaluation',
        })),
        totalTurns: 6,
        totalTokens: 300,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.turnCount.score).toBeGreaterThanOrEqual(5);
      expect(result.breakdown.turnCount.score).toBeLessThan(10);
      expect(result.breakdown.turnCount.status).toBe('acceptable');
    });

    it('should give poor score for template with too few turns', () => {
      const conversation: ConversationData = {
        turns: Array(3).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'Test content',
        })),
        totalTurns: 3,
        totalTokens: 150,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.turnCount.score).toBeLessThan(5);
      expect(result.breakdown.turnCount.status).toBe('poor');
    });

    it('should use different thresholds for scenario tier', () => {
      const conversation: ConversationData = {
        turns: Array(15).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'Test content with sufficient length',
        })),
        totalTurns: 15,
        totalTokens: 750,
        tier: 'scenario',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.turnCount.score).toBe(10);
    });
  });

  describe('Length Evaluation', () => {
    it('should give optimal score for appropriate turn length', () => {
      const conversation: ConversationData = {
        turns: Array(10).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'A'.repeat(200), // 200 chars per turn
        })),
        totalTurns: 10,
        totalTokens: 500,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.length.score).toBe(10);
      expect(result.breakdown.length.status).toBe('optimal');
      expect(result.breakdown.length.avgTurnLength).toBe(200);
    });

    it('should penalize very short turns', () => {
      const conversation: ConversationData = {
        turns: Array(10).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'Hi', // Very short
        })),
        totalTurns: 10,
        totalTokens: 100,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.length.score).toBeLessThan(7);
      expect(result.breakdown.length.status).toBe('poor');
    });

    it('should penalize overall conversation that is too short', () => {
      const conversation: ConversationData = {
        turns: Array(8).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'Short', // Very short total
        })),
        totalTurns: 8,
        totalTokens: 50,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.length.score).toBe(3);
    });
  });

  describe('Structure Evaluation', () => {
    it('should give perfect score for valid structure', () => {
      const conversation: ConversationData = {
        turns: [
          { role: 'user', content: 'Hello, how can I help?' },
          { role: 'assistant', content: 'I can assist you with that.' },
          { role: 'user', content: 'Great, thanks!' },
          { role: 'assistant', content: 'You\'re welcome!' },
        ],
        totalTurns: 4,
        totalTokens: 200,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.structure.score).toBe(10);
      expect(result.breakdown.structure.valid).toBe(true);
      expect(result.breakdown.structure.issues).toHaveLength(0);
    });

    it('should detect when conversation does not start with user', () => {
      const conversation: ConversationData = {
        turns: [
          { role: 'assistant', content: 'Hello!' },
          { role: 'user', content: 'Hi' },
        ],
        totalTurns: 2,
        totalTokens: 100,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.structure.valid).toBe(false);
      expect(result.breakdown.structure.issues.length).toBeGreaterThan(0);
      expect(result.breakdown.structure.score).toBeLessThan(10);
    });

    it('should detect improper role alternation', () => {
      const conversation: ConversationData = {
        turns: [
          { role: 'user', content: 'Hello' },
          { role: 'user', content: 'Are you there?' },
          { role: 'assistant', content: 'Yes' },
        ],
        totalTurns: 3,
        totalTokens: 150,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.structure.valid).toBe(false);
      expect(result.breakdown.structure.issues.some(i => i.includes('alternation'))).toBe(true);
    });

    it('should detect empty turns', () => {
      const conversation: ConversationData = {
        turns: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: '' },
          { role: 'user', content: 'Anyone there?' },
        ],
        totalTurns: 3,
        totalTokens: 100,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.structure.valid).toBe(false);
      expect(result.breakdown.structure.issues.some(i => i.includes('empty'))).toBe(true);
    });

    it('should detect imbalanced turn distribution', () => {
      const conversation: ConversationData = {
        turns: [
          { role: 'user', content: 'Question 1' },
          { role: 'assistant', content: 'Answer 1' },
          { role: 'user', content: 'Question 2' },
          { role: 'assistant', content: 'Answer 2' },
          { role: 'user', content: 'Question 3' },
        ],
        totalTurns: 5,
        totalTokens: 250,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.structure.issues.some(i => i.includes('Imbalanced'))).toBe(true);
    });
  });

  describe('Confidence Evaluation', () => {
    it('should give high confidence for varied, consistent conversation', () => {
      const conversation: ConversationData = {
        turns: [
          { role: 'user', content: 'Can you help me with investment strategies?' },
          { role: 'assistant', content: 'I\'d be happy to help! What are your goals?' },
          { role: 'user', content: 'I want to save for retirement in 20 years.' },
          { role: 'assistant', content: 'Great! Let\'s discuss diversification strategies.' },
          { role: 'user', content: 'What about risk management?' },
          { role: 'assistant', content: 'Risk management is crucial for long-term success.' },
        ],
        totalTurns: 6,
        totalTokens: 300,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.confidence.score).toBeGreaterThanOrEqual(7);
      expect(result.breakdown.confidence.level).not.toBe('low');
    });

    it('should detect repetitive content', () => {
      const conversation: ConversationData = {
        turns: Array(8).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'This is the same content every time.',
        })),
        totalTurns: 8,
        totalTokens: 400,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.confidence.score).toBeLessThan(7);
      expect(result.breakdown.confidence.factors.some(f => 
        f.name.includes('Repetitive') && f.impact === 'negative'
      )).toBe(true);
    });

    it('should detect proper conversation ending', () => {
      const conversation: ConversationData = {
        turns: [
          { role: 'user', content: 'Hello there' },
          { role: 'assistant', content: 'Hi! How can I help?' },
          { role: 'user', content: 'Thanks for the info' },
          { role: 'assistant', content: 'You\'re very welcome! Feel free to reach out anytime if you have more questions.' },
        ],
        totalTurns: 4,
        totalTokens: 200,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.confidence.factors.some(f => 
        f.name.includes('Complete Ending') && f.impact === 'positive'
      )).toBe(true);
    });
  });

  describe('Overall Score Calculation', () => {
    it('should calculate weighted average correctly', () => {
      const conversation: ConversationData = {
        turns: Array(10).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'A'.repeat(200),
        })),
        totalTurns: 10,
        totalTokens: 500,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      
      // Verify weights sum to expected overall
      const expectedOverall = 
        result.breakdown.turnCount.score * result.breakdown.turnCount.weight +
        result.breakdown.length.score * result.breakdown.length.weight +
        result.breakdown.structure.score * result.breakdown.structure.weight +
        result.breakdown.confidence.score * result.breakdown.confidence.weight;
      
      expect(Math.abs(result.overall - expectedOverall)).toBeLessThan(0.1);
    });

    it('should auto-flag conversations with score < 6', () => {
      const conversation: ConversationData = {
        turns: [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello' },
        ],
        totalTurns: 2,
        totalTokens: 50,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.overall).toBeLessThan(6);
      expect(result.autoFlagged).toBe(true);
    });

    it('should not auto-flag conversations with score >= 6', () => {
      const conversation: ConversationData = {
        turns: Array(10).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'A reasonably detailed response with sufficient content.',
        })),
        totalTurns: 10,
        totalTokens: 500,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.overall).toBeGreaterThanOrEqual(6);
      expect(result.autoFlagged).toBe(false);
    });
  });

  describe('Tier-Specific Thresholds', () => {
    it('should use template tier thresholds', () => {
      const config = scorer.getTierConfig('template');
      expect(config.turnCount.optimal.min).toBe(8);
      expect(config.turnCount.optimal.max).toBe(16);
    });

    it('should use scenario tier thresholds', () => {
      const config = scorer.getTierConfig('scenario');
      expect(config.turnCount.optimal.min).toBe(10);
      expect(config.turnCount.optimal.max).toBe(20);
    });

    it('should use edge_case tier thresholds', () => {
      const config = scorer.getTierConfig('edge_case');
      expect(config.turnCount.optimal.min).toBe(6);
      expect(config.turnCount.optimal.max).toBe(12);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty conversation', () => {
      const conversation: ConversationData = {
        turns: [],
        totalTurns: 0,
        totalTokens: 0,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.structure.valid).toBe(false);
      expect(result.breakdown.structure.score).toBe(0);
    });

    it('should handle single turn', () => {
      const conversation: ConversationData = {
        turns: [{ role: 'user', content: 'Hello' }],
        totalTurns: 1,
        totalTokens: 50,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.overall).toBeLessThan(6);
    });

    it('should handle very long conversation', () => {
      const conversation: ConversationData = {
        turns: Array(50).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'Normal content with sufficient length',
        })),
        totalTurns: 50,
        totalTokens: 2500,
        tier: 'template',
      };

      const result = scorer.calculateScore(conversation);
      expect(result.breakdown.turnCount.status).not.toBe('optimal');
    });
  });

  describe('Score Consistency', () => {
    it('should produce consistent scores for identical conversations', () => {
      const conversation: ConversationData = {
        turns: Array(10).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'Test content',
        })),
        totalTurns: 10,
        totalTokens: 500,
        tier: 'template',
      };

      const result1 = scorer.calculateScore(conversation);
      const result2 = scorer.calculateScore(conversation);

      expect(result1.overall).toBe(result2.overall);
      expect(result1.breakdown.turnCount.score).toBe(result2.breakdown.turnCount.score);
      expect(result1.breakdown.length.score).toBe(result2.breakdown.length.score);
      expect(result1.breakdown.structure.score).toBe(result2.breakdown.structure.score);
      expect(result1.breakdown.confidence.score).toBe(result2.breakdown.confidence.score);
    });
  });
});

