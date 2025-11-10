/**
 * Tests for error code mapping
 */

import { mapDatabaseError, isTransientError, ERROR_MAPPINGS } from '../errors/codes';

describe('Error Code Mapping', () => {
  describe('mapDatabaseError', () => {
    it('should map PostgreSQL unique violation', () => {
      const error = { code: '23505', message: 'duplicate key value violates unique constraint' };
      const mapped = mapDatabaseError(error);
      expect(mapped.code).toBe('ERR_DB_UNIQUE_VIOLATION');
      expect(mapped.automatable).toBe(true);
    });

    it('should map foreign key violation', () => {
      const error = { code: '23503', message: 'violates foreign key constraint' };
      const mapped = mapDatabaseError(error);
      expect(mapped.code).toBe('ERR_DB_FK_VIOLATION');
      expect(mapped.automatable).toBe(false);
    });

    it('should map NOT NULL violation', () => {
      const error = { code: '23502', message: 'null value in column "name"' };
      const mapped = mapDatabaseError(error);
      expect(mapped.code).toBe('ERR_DB_NOT_NULL_VIOLATION');
    });

    it('should map invalid cast error', () => {
      const error = { code: '22P02', message: 'invalid input syntax for type integer' };
      const mapped = mapDatabaseError(error);
      expect(mapped.code).toBe('ERR_CAST_INVALID_INPUT');
    });

    it('should map by pattern when no PG code', () => {
      const error = { message: 'duplicate key value violates unique constraint "users_pkey"' };
      const mapped = mapDatabaseError(error);
      expect(mapped.code).toBe('ERR_DB_UNIQUE_VIOLATION');
    });

    it('should return ERR_FATAL for unknown errors', () => {
      const error = { message: 'Something went wrong' };
      const mapped = mapDatabaseError(error);
      expect(mapped.code).toBe('ERR_FATAL');
      expect(mapped.automatable).toBe(false);
    });
  });

  describe('isTransientError', () => {
    it('should detect connection errors', () => {
      const error = { message: 'Connection timeout' };
      expect(isTransientError(error)).toBe(true);
    });

    it('should detect network errors', () => {
      const error = { message: 'Network error occurred' };
      expect(isTransientError(error)).toBe(true);
    });

    it('should not detect constraint violations as transient', () => {
      const error = { message: 'duplicate key value violates unique constraint' };
      expect(isTransientError(error)).toBe(false);
    });
  });

  describe('ERROR_MAPPINGS', () => {
    it('should have all required error codes', () => {
      const requiredCodes = [
        'ERR_DB_UNIQUE_VIOLATION',
        'ERR_DB_FK_VIOLATION',
        'ERR_DB_NOT_NULL_VIOLATION',
        'ERR_CHAR_INVALID_UTF8',
        'ERR_AUTH_RLS_DENIED'
      ];

      for (const code of requiredCodes) {
        const mapping = ERROR_MAPPINGS.find(m => m.code === code);
        expect(mapping).toBeDefined();
        expect(mapping?.remediation).toBeTruthy();
      }
    });

    it('should have examples for automatable errors', () => {
      const automatableErrors = ERROR_MAPPINGS.filter(m => m.automatable);
      for (const error of automatableErrors) {
        expect(error.example).toBeTruthy();
      }
    });
  });
});

