/**
 * Tests for character sanitization
 */

import { validateAndSanitize, sanitizeRecord, detectProblematicCharacters } from '../validation/sanitize';
import { DEFAULT_CHARACTER_VALIDATION_CONFIG } from '../core/config';

describe('Character Sanitization', () => {
  describe('validateAndSanitize', () => {
    it('should handle apostrophes safely', () => {
      const result = validateAndSanitize("don't worry", DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized).toBe("don't worry");
      expect(result.valid).toBe(true);
    });

    it('should handle quotes safely', () => {
      const result = validateAndSanitize('He said "hello"', DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized).toBe('He said "hello"');
      expect(result.valid).toBe(true);
    });

    it('should handle newlines', () => {
      const result = validateAndSanitize('Line 1\nLine 2', DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized).toBe('Line 1\nLine 2');
      expect(result.valid).toBe(true);
    });

    it('should handle emojis', () => {
      const result = validateAndSanitize('Happy 😊', DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized).toBe('Happy 😊');
      expect(result.valid).toBe(true);
    });

    it('should strip invalid UTF-8', () => {
      const input = 'Test\uFFFDvalue';
      const result = validateAndSanitize(input, DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized).toBe('Testvalue');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should remove control characters', () => {
      const input = 'Test\u0000value';
      const result = validateAndSanitize(input, DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized).toBe('Testvalue');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should apply Unicode normalization', () => {
      const input = 'café'; // Can be composed or decomposed
      const result = validateAndSanitize(input, DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized.normalize('NFC')).toBe('café');
    });

    it('should truncate long fields', () => {
      const longString = 'x'.repeat(2_000_000);
      const result = validateAndSanitize(longString, DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized.length).toBe(1_000_000);
      expect(result.warnings.some(w => w.includes('Truncated'))).toBe(true);
    });
  });

  describe('sanitizeRecord', () => {
    it('should sanitize string fields in a record', () => {
      const record = {
        id: '1',
        text: "don't worry",
        number: 42
      };
      const result = sanitizeRecord(record, DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized.text).toBe("don't worry");
      expect(result.sanitized.number).toBe(42);
    });

    it('should sanitize nested objects', () => {
      const record = {
        id: '1',
        parameters: {
          note: "can't do this",
          value: 100
        }
      };
      const result = sanitizeRecord(record, DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized.parameters.note).toBe("can't do this");
    });

    it('should sanitize arrays', () => {
      const record = {
        id: '1',
        tags: ["don't", "can't", "won't"]
      };
      const result = sanitizeRecord(record, DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized.tags).toEqual(["don't", "can't", "won't"]);
    });
  });

  describe('detectProblematicCharacters', () => {
    it('should detect apostrophes', () => {
      const result = detectProblematicCharacters("don't");
      expect(result.hasApostrophes).toBe(true);
    });

    it('should detect quotes', () => {
      const result = detectProblematicCharacters('He said "hello"');
      expect(result.hasQuotes).toBe(true);
    });

    it('should detect newlines', () => {
      const result = detectProblematicCharacters('Line 1\nLine 2');
      expect(result.hasNewlines).toBe(true);
    });

    it('should detect emojis', () => {
      const result = detectProblematicCharacters('Happy 😊');
      expect(result.hasEmoji).toBe(true);
    });
  });
});

