/**
 * Tests for apostrophe safety (E02 regression tests)
 */

import { sanitizeRecord } from '../validation/sanitize';
import { generateDollarQuotedInsert } from '../operations/import';
import { DEFAULT_CHARACTER_VALIDATION_CONFIG } from '../core/config';

describe('Apostrophe Safety', () => {
  describe('E02 Problem Records', () => {
    it('should handle "don\'t" in JSONB field', () => {
      const record = {
        id: '1',
        parameters: {
          strategy_rationale: "most people don't understand it"
        }
      };

      const result = sanitizeRecord(record, DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized.parameters.strategy_rationale).toBe("most people don't understand it");
      expect(result.warnings.length).toBe(0);
    });

    it('should handle mixed quotes and apostrophes', () => {
      const record = {
        id: '2',
        parameters: {
          quote: 'He said "I can\'t do this"'
        }
      };

      const result = sanitizeRecord(record, DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized.parameters.quote).toBe('He said "I can\'t do this"');
    });

    it('should handle possessive apostrophes', () => {
      const record = {
        id: '3',
        text: "It's Marcus's strategy"
      };

      const result = sanitizeRecord(record, DEFAULT_CHARACTER_VALIDATION_CONFIG);
      expect(result.sanitized.text).toBe("It's Marcus's strategy");
    });
  });

  describe('Dollar-Quoted SQL Generation', () => {
    it('should generate safe SQL with apostrophes', () => {
      const record = {
        id: '1',
        persona: "Marcus - The Overwhelmed Avoider",
        parameters: {
          strategy_rationale: "most people don't understand it"
        }
      };

      const sql = generateDollarQuotedInsert('conversations', record);
      
      expect(sql).toContain('$$1$$');
      expect(sql).toContain('$$Marcus - The Overwhelmed Avoider$$');
      expect(sql).toContain("don't");
      expect(sql).not.toContain("\\'"); // No escaping needed
    });

    it('should handle NULL values', () => {
      const record = {
        id: '1',
        optional_field: null
      };

      const sql = generateDollarQuotedInsert('test_table', record);
      expect(sql).toContain('NULL');
    });

    it('should handle numbers and booleans', () => {
      const record = {
        id: '1',
        count: 42,
        active: true
      };

      const sql = generateDollarQuotedInsert('test_table', record);
      expect(sql).toContain('42');
      expect(sql).toContain('true');
    });

    it('should handle arrays', () => {
      const record = {
        id: '1',
        tags: ['tag1', 'tag2']
      };

      const sql = generateDollarQuotedInsert('test_table', record);
      expect(sql).toContain('ARRAY');
    });
  });

  describe('Real E02 Failure Cases', () => {
    const e02Records = require('../fixtures/e02-problem.test.json');

    it('should sanitize all E02 problem records', () => {
      for (const record of e02Records) {
        const result = sanitizeRecord(record, DEFAULT_CHARACTER_VALIDATION_CONFIG);
        expect(result.sanitized).toBeDefined();
        // All apostrophes should be preserved
        if (record.parameters?.strategy_rationale) {
          expect(result.sanitized.parameters.strategy_rationale).toContain("don't");
        }
      }
    });

    it('should generate safe SQL for all E02 records', () => {
      for (const record of e02Records) {
        const sql = generateDollarQuotedInsert('conversations', record);
        expect(sql).toBeTruthy();
        expect(sql).toContain('INSERT INTO conversations');
        // Should not have escaped apostrophes
        expect(sql).not.toContain("\\'");
      }
    });
  });
});

