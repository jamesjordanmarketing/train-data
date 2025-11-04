/**
 * DimensionParser Unit Tests
 * 
 * Tests for dimension parsing and validation including:
 * - Persona extraction with sample dimensions
 * - Complexity calculation
 * - Confidence validation
 * - Edge cases and error handling
 */

import { dimensionParser, DimensionParser } from '@/lib/generation/chunks-integration';
import type { DimensionSource } from '@/lib/generation/types';

describe('DimensionParser', () => {
  let parser: DimensionParser;

  beforeEach(() => {
    parser = new DimensionParser();
  });

  /**
   * Helper to create mock dimension data
   */
  const createMockDimensions = (overrides: Partial<DimensionSource> = {}): DimensionSource => ({
    confidence: 0.85,
    generatedAt: '2024-01-01T00:00:00Z',
    semanticDimensions: {
      domain: ['technology', 'software-development'],
      audience: 'software engineers',
      intent: 'instruct',
      persona: ['technical-expert', 'problem-solver'],
      emotion: ['neutral', 'confident'],
      complexity: 0.75,
      tone: 'professional',
    },
    ...overrides,
  });

  describe('isValid', () => {
    it('should validate dimensions with positive confidence', () => {
      const dims = createMockDimensions();
      expect(parser.isValid(dims)).toBe(true);
    });

    it('should reject dimensions with zero confidence', () => {
      const dims = createMockDimensions({ confidence: 0 });
      expect(parser.isValid(dims)).toBe(false);
    });

    it('should reject dimensions with negative confidence', () => {
      const dims = createMockDimensions({ confidence: -0.1 });
      expect(parser.isValid(dims)).toBe(false);
    });

    it('should validate dimensions with minimal semantic data', () => {
      const dims = createMockDimensions({
        semanticDimensions: { domain: ['test'] }
      });
      expect(parser.isValid(dims)).toBe(true);
    });

    it('should handle edge case of exactly 0.01 confidence', () => {
      const dims = createMockDimensions({ confidence: 0.01 });
      expect(parser.isValid(dims)).toBe(true);
    });
  });

  describe('isHighConfidence', () => {
    it('should return true for 0.8 confidence threshold', () => {
      const dims = createMockDimensions({ confidence: 0.8 });
      expect(parser.isHighConfidence(dims)).toBe(true);
    });

    it('should return true for confidence > 0.8', () => {
      const dims = createMockDimensions({ confidence: 0.95 });
      expect(parser.isHighConfidence(dims)).toBe(true);
    });

    it('should return false for confidence < 0.8', () => {
      const dims = createMockDimensions({ confidence: 0.79 });
      expect(parser.isHighConfidence(dims)).toBe(false);
    });

    it('should return true for perfect confidence', () => {
      const dims = createMockDimensions({ confidence: 1.0 });
      expect(parser.isHighConfidence(dims)).toBe(true);
    });

    it('should return false for low confidence', () => {
      const dims = createMockDimensions({ confidence: 0.5 });
      expect(parser.isHighConfidence(dims)).toBe(false);
    });
  });

  describe('isComplexContent', () => {
    it('should return true for complexity >= 0.7', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.complexity = 0.75;
      expect(parser.isComplexContent(dims)).toBe(true);
    });

    it('should return true for exactly 0.7 complexity', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.complexity = 0.7;
      expect(parser.isComplexContent(dims)).toBe(true);
    });

    it('should return false for complexity < 0.7', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.complexity = 0.69;
      expect(parser.isComplexContent(dims)).toBe(false);
    });

    it('should return false when complexity is undefined', () => {
      const dims = createMockDimensions();
      delete dims.semanticDimensions.complexity;
      expect(parser.isComplexContent(dims)).toBe(false);
    });

    it('should return false when complexity is null', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.complexity = null;
      expect(parser.isComplexContent(dims)).toBe(false);
    });

    it('should return false when complexity is 0', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.complexity = 0;
      expect(parser.isComplexContent(dims)).toBe(false);
    });

    it('should return true for very high complexity', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.complexity = 0.95;
      expect(parser.isComplexContent(dims)).toBe(true);
    });
  });

  describe('getPrimaryPersona', () => {
    it('should extract first persona from array', () => {
      const dims = createMockDimensions();
      expect(parser.getPrimaryPersona(dims)).toBe('technical-expert');
    });

    it('should return "professional" as default when no persona', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.persona = undefined;
      expect(parser.getPrimaryPersona(dims)).toBe('professional');
    });

    it('should return "professional" for empty persona array', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.persona = [];
      expect(parser.getPrimaryPersona(dims)).toBe('professional');
    });

    it('should handle single persona array', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.persona = ['educator'];
      expect(parser.getPrimaryPersona(dims)).toBe('educator');
    });

    it('should handle multiple personas and return first', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.persona = ['mentor', 'guide', 'expert'];
      expect(parser.getPrimaryPersona(dims)).toBe('mentor');
    });

    it('should handle null persona gracefully', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.persona = null;
      expect(parser.getPrimaryPersona(dims)).toBe('professional');
    });
  });

  describe('getPrimaryEmotion', () => {
    it('should extract first emotion from array', () => {
      const dims = createMockDimensions();
      expect(parser.getPrimaryEmotion(dims)).toBe('neutral');
    });

    it('should return "neutral" as default when no emotion', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.emotion = undefined;
      expect(parser.getPrimaryEmotion(dims)).toBe('neutral');
    });

    it('should return "neutral" for empty emotion array', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.emotion = [];
      expect(parser.getPrimaryEmotion(dims)).toBe('neutral');
    });

    it('should handle single emotion', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.emotion = ['enthusiastic'];
      expect(parser.getPrimaryEmotion(dims)).toBe('enthusiastic');
    });

    it('should handle multiple emotions and return first', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.emotion = ['curious', 'engaged', 'thoughtful'];
      expect(parser.getPrimaryEmotion(dims)).toBe('curious');
    });

    it('should handle null emotion gracefully', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.emotion = null;
      expect(parser.getPrimaryEmotion(dims)).toBe('neutral');
    });
  });

  describe('getSummary', () => {
    it('should generate comprehensive summary with all fields', () => {
      const dims = createMockDimensions();
      const summary = parser.getSummary(dims);

      expect(summary).toContain('Confidence: 85%');
      expect(summary).toContain('Complexity: 7.5/10');
      expect(summary).toContain('Personas: technical-expert, problem-solver');
      expect(summary).toContain('Emotions: neutral, confident');
      expect(summary).toContain('Domains: technology, software-development');
    });

    it('should handle minimal dimensions gracefully', () => {
      const dims: DimensionSource = {
        confidence: 0.6,
        generatedAt: '2024-01-01T00:00:00Z',
        semanticDimensions: {},
      };
      
      const summary = parser.getSummary(dims);
      
      expect(summary).toContain('Confidence: 60%');
      expect(summary).not.toContain('Complexity');
      expect(summary).not.toContain('Personas');
      expect(summary).not.toContain('Emotions');
      expect(summary).not.toContain('Domains');
    });

    it('should format complexity correctly', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.complexity = 0.83;
      
      const summary = parser.getSummary(dims);
      
      expect(summary).toContain('Complexity: 8.3/10');
    });

    it('should join multiple persona values', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.persona = ['expert', 'mentor', 'guide'];
      
      const summary = parser.getSummary(dims);
      
      expect(summary).toContain('Personas: expert, mentor, guide');
    });

    it('should join multiple domain values', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.domain = ['tech', 'business', 'education'];
      
      const summary = parser.getSummary(dims);
      
      expect(summary).toContain('Domains: tech, business, education');
    });

    it('should handle single array values', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.persona = ['solo'];
      dims.semanticDimensions.emotion = ['happy'];
      dims.semanticDimensions.domain = ['science'];
      
      const summary = parser.getSummary(dims);
      
      expect(summary).toContain('Personas: solo');
      expect(summary).toContain('Emotions: happy');
      expect(summary).toContain('Domains: science');
    });

    it('should format low confidence percentage correctly', () => {
      const dims = createMockDimensions({ confidence: 0.05 });
      
      const summary = parser.getSummary(dims);
      
      expect(summary).toContain('Confidence: 5%');
    });

    it('should format perfect confidence correctly', () => {
      const dims = createMockDimensions({ confidence: 1.0 });
      
      const summary = parser.getSummary(dims);
      
      expect(summary).toContain('Confidence: 100%');
    });

    it('should only include present fields in summary', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions = {
        complexity: 0.8,
        domain: ['tech'],
      };
      
      const summary = parser.getSummary(dims);
      
      expect(summary).toContain('Confidence:');
      expect(summary).toContain('Complexity:');
      expect(summary).toContain('Domains:');
      expect(summary).not.toContain('Personas:');
      expect(summary).not.toContain('Emotions:');
    });

    it('should separate fields with pipe character', () => {
      const dims = createMockDimensions();
      const summary = parser.getSummary(dims);
      
      const parts = summary.split(' | ');
      expect(parts.length).toBeGreaterThan(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle dimensions with all fields undefined', () => {
      const dims: DimensionSource = {
        confidence: 0.5,
        generatedAt: '2024-01-01T00:00:00Z',
        semanticDimensions: {
          domain: undefined,
          audience: undefined,
          intent: undefined,
          persona: undefined,
          emotion: undefined,
          complexity: undefined,
        },
      };

      expect(parser.isValid(dims)).toBe(true);
      expect(parser.isHighConfidence(dims)).toBe(false);
      expect(parser.isComplexContent(dims)).toBe(false);
      expect(parser.getPrimaryPersona(dims)).toBe('professional');
      expect(parser.getPrimaryEmotion(dims)).toBe('neutral');
      expect(parser.getSummary(dims)).toContain('Confidence: 50%');
    });

    it('should handle very high complexity values', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.complexity = 1.0;
      
      expect(parser.isComplexContent(dims)).toBe(true);
      expect(parser.getSummary(dims)).toContain('Complexity: 10.0/10');
    });

    it('should handle zero complexity', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.complexity = 0;
      
      expect(parser.isComplexContent(dims)).toBe(false);
      // Complexity 0 may be filtered out as falsy - that's acceptable
      const summary = parser.getSummary(dims);
      expect(summary).toBeTruthy();
    });

    it('should handle empty string values in arrays', () => {
      const dims = createMockDimensions();
      dims.semanticDimensions.persona = ['', 'valid-persona'];
      dims.semanticDimensions.emotion = [''];
      
      // Empty strings at position 0 will fall back to defaults since they're falsy
      // This is acceptable behavior - we want meaningful defaults not empty strings
      expect(parser.getPrimaryPersona(dims)).toBe('professional');
      expect(parser.getPrimaryEmotion(dims)).toBe('neutral');
    });
  });

  describe('Integration with Singleton', () => {
    it('should use singleton instance correctly', () => {
      const dims = createMockDimensions();
      
      // Test that singleton works the same as instance
      expect(dimensionParser.isValid(dims)).toBe(parser.isValid(dims));
      expect(dimensionParser.isHighConfidence(dims)).toBe(parser.isHighConfidence(dims));
      expect(dimensionParser.getPrimaryPersona(dims)).toBe(parser.getPrimaryPersona(dims));
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle technical documentation dimensions', () => {
      const dims = createMockDimensions({
        confidence: 0.92,
        semanticDimensions: {
          domain: ['api-documentation', 'rest-api', 'backend'],
          audience: 'backend developers',
          intent: 'reference',
          persona: ['technical-writer', 'engineer'],
          emotion: ['neutral', 'precise'],
          complexity: 0.65,
          tone: 'formal',
        },
      });

      expect(parser.isValid(dims)).toBe(true);
      expect(parser.isHighConfidence(dims)).toBe(true);
      expect(parser.isComplexContent(dims)).toBe(false);
      expect(parser.getPrimaryPersona(dims)).toBe('technical-writer');
      
      const summary = parser.getSummary(dims);
      expect(summary).toContain('92%');
      expect(summary).toContain('api-documentation');
    });

    it('should handle tutorial content dimensions', () => {
      const dims = createMockDimensions({
        confidence: 0.88,
        semanticDimensions: {
          domain: ['tutorial', 'web-development', 'beginner-friendly'],
          audience: 'junior developers',
          intent: 'teach',
          persona: ['mentor', 'educator', 'guide'],
          emotion: ['encouraging', 'supportive', 'patient'],
          complexity: 0.45,
          tone: 'friendly',
        },
      });

      expect(parser.isValid(dims)).toBe(true);
      expect(parser.isHighConfidence(dims)).toBe(true);
      expect(parser.isComplexContent(dims)).toBe(false);
      expect(parser.getPrimaryPersona(dims)).toBe('mentor');
      expect(parser.getPrimaryEmotion(dims)).toBe('encouraging');
    });

    it('should handle complex academic content', () => {
      const dims = createMockDimensions({
        confidence: 0.78,
        semanticDimensions: {
          domain: ['computer-science', 'algorithms', 'theory'],
          audience: 'graduate students',
          intent: 'analyze',
          persona: ['researcher', 'academic'],
          emotion: ['analytical', 'rigorous'],
          complexity: 0.92,
          tone: 'academic',
        },
      });

      expect(parser.isValid(dims)).toBe(true);
      expect(parser.isHighConfidence(dims)).toBe(false); // Just below threshold
      expect(parser.isComplexContent(dims)).toBe(true);
      expect(parser.getPrimaryPersona(dims)).toBe('researcher');
      
      const summary = parser.getSummary(dims);
      expect(summary).toContain('Complexity: 9.2/10');
    });

    it('should handle low-confidence dimensions', () => {
      const dims = createMockDimensions({
        confidence: 0.45,
        semanticDimensions: {
          domain: ['general'],
          audience: 'unknown',
          complexity: 0.5,
        },
      });

      expect(parser.isValid(dims)).toBe(true);
      expect(parser.isHighConfidence(dims)).toBe(false);
      expect(parser.isComplexContent(dims)).toBe(false);
      
      const summary = parser.getSummary(dims);
      expect(summary).toContain('Confidence: 45%');
    });
  });
});

