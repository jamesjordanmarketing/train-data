/**
 * Unit tests for error classes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AppError,
  APIError,
  NetworkError,
  ValidationError,
  GenerationError,
  DatabaseError,
  ErrorCode,
  type ErrorContext,
} from '../error-classes';

describe('AppError', () => {
  it('should create an AppError with basic properties', () => {
    const error = new AppError('Test error', ErrorCode.ERR_NET_UNKNOWN);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('AppError');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(ErrorCode.ERR_NET_UNKNOWN);
    expect(error.isRecoverable).toBe(false);
    expect(error.context.timestamp).toBeDefined();
  });

  it('should create an AppError with custom context', () => {
    const error = new AppError('Test error', ErrorCode.ERR_NET_UNKNOWN, {
      context: {
        userId: 'user123',
        requestId: 'req456',
        component: 'TestComponent',
        metadata: { key: 'value' },
      },
    });

    expect(error.context.userId).toBe('user123');
    expect(error.context.requestId).toBe('req456');
    expect(error.context.component).toBe('TestComponent');
    expect(error.context.metadata).toEqual({ key: 'value' });
  });

  it('should handle isRecoverable flag', () => {
    const nonRecoverable = new AppError('Error', ErrorCode.ERR_NET_UNKNOWN, {
      isRecoverable: false,
    });
    const recoverable = new AppError('Error', ErrorCode.ERR_NET_UNKNOWN, {
      isRecoverable: true,
    });

    expect(nonRecoverable.isRecoverable).toBe(false);
    expect(recoverable.isRecoverable).toBe(true);
  });

  it('should chain errors with cause', () => {
    const originalError = new Error('Original error');
    const appError = new AppError('Wrapped error', ErrorCode.ERR_NET_UNKNOWN, {
      cause: originalError,
    });

    expect(appError.cause).toBe(originalError);
  });

  it('should serialize to JSON correctly', () => {
    const error = new AppError('Test error', ErrorCode.ERR_NET_UNKNOWN, {
      context: { userId: 'user123' },
    });

    const json = error.toJSON();

    expect(json.name).toBe('AppError');
    expect(json.message).toBe('Test error');
    expect(json.code).toBe(ErrorCode.ERR_NET_UNKNOWN);
    expect(json.isRecoverable).toBe(false);
    expect(json.context.userId).toBe('user123');
    expect(json.stack).toBeDefined();
  });

  it('should include cause in JSON serialization', () => {
    const originalError = new Error('Original');
    const error = new AppError('Wrapped', ErrorCode.ERR_NET_UNKNOWN, {
      cause: originalError,
    });

    const json = error.toJSON();
    expect(json.cause).toBe('Original');
  });

  it('should provide default user message', () => {
    const error = new AppError('Technical error', ErrorCode.ERR_NET_UNKNOWN);
    expect(error.getUserMessage()).toBe('Technical error');
  });

  it('should preserve stack trace', () => {
    const error = new AppError('Test', ErrorCode.ERR_NET_UNKNOWN);
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AppError');
  });
});

describe('APIError', () => {
  it('should create an APIError with status code', () => {
    const error = new APIError(
      'Not found',
      404,
      ErrorCode.ERR_API_NOT_FOUND
    );

    expect(error).toBeInstanceOf(APIError);
    expect(error.name).toBe('APIError');
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe(ErrorCode.ERR_API_NOT_FOUND);
  });

  it('should mark 5xx errors as recoverable', () => {
    const error500 = new APIError('Server error', 500, ErrorCode.ERR_API_SERVER);
    const error502 = new APIError('Bad gateway', 502, ErrorCode.ERR_API_SERVER);

    expect(error500.isRecoverable).toBe(true);
    expect(error502.isRecoverable).toBe(true);
  });

  it('should mark 429 (rate limit) as recoverable', () => {
    const error = new APIError(
      'Rate limited',
      429,
      ErrorCode.ERR_API_RATE_LIMIT
    );

    expect(error.isRecoverable).toBe(true);
  });

  it('should mark 4xx errors (except 429) as non-recoverable', () => {
    const error401 = new APIError('Unauthorized', 401, ErrorCode.ERR_API_UNAUTHORIZED);
    const error404 = new APIError('Not found', 404, ErrorCode.ERR_API_NOT_FOUND);

    expect(error401.isRecoverable).toBe(false);
    expect(error404.isRecoverable).toBe(false);
  });

  it('should store response data', () => {
    const responseData = { error: 'Details', retry_after: 60 };
    const error = new APIError(
      'Rate limited',
      429,
      ErrorCode.ERR_API_RATE_LIMIT,
      { responseData }
    );

    expect(error.responseData).toEqual(responseData);
  });

  it('should provide user-friendly messages for common status codes', () => {
    const testCases = [
      { code: 401, expected: 'Authentication failed. Please sign in again.' },
      { code: 403, expected: "You don't have permission to perform this action." },
      { code: 404, expected: 'The requested resource was not found.' },
      { code: 429, expected: 'Rate limit exceeded. Please wait a moment and try again.' },
      { code: 500, expected: 'Server error. Please try again later.' },
      { code: 502, expected: 'Service temporarily unavailable. Please try again.' },
    ];

    testCases.forEach(({ code, expected }) => {
      const error = new APIError('Error', code, ErrorCode.ERR_API_SERVER);
      expect(error.getUserMessage()).toBe(expected);
    });
  });

  it('should serialize with status code and response data', () => {
    const error = new APIError(
      'Error',
      404,
      ErrorCode.ERR_API_NOT_FOUND,
      { responseData: { detail: 'Not found' } }
    );

    const json = error.toJSON();
    expect(json.statusCode).toBe(404);
    expect(json.responseData).toEqual({ detail: 'Not found' });
  });
});

describe('NetworkError', () => {
  it('should create a NetworkError', () => {
    const error = new NetworkError('Timeout', ErrorCode.ERR_NET_TIMEOUT);

    expect(error).toBeInstanceOf(NetworkError);
    expect(error.name).toBe('NetworkError');
    expect(error.message).toBe('Timeout');
    expect(error.code).toBe(ErrorCode.ERR_NET_TIMEOUT);
  });

  it('should be recoverable by default', () => {
    const error = new NetworkError('Offline', ErrorCode.ERR_NET_OFFLINE);
    expect(error.isRecoverable).toBe(true);
  });

  it('should provide user-friendly messages for network errors', () => {
    const testCases = [
      { code: ErrorCode.ERR_NET_OFFLINE, expected: 'No internet connection. Please check your network.' },
      { code: ErrorCode.ERR_NET_TIMEOUT, expected: 'Request timed out. Please try again.' },
      { code: ErrorCode.ERR_NET_ABORT, expected: 'Request was cancelled.' },
      { code: ErrorCode.ERR_NET_UNKNOWN, expected: 'Network error. Please check your connection.' },
    ];

    testCases.forEach(({ code, expected }) => {
      const error = new NetworkError('Error', code);
      expect(error.getUserMessage()).toBe(expected);
    });
  });
});

describe('ValidationError', () => {
  it('should create a ValidationError', () => {
    const error = new ValidationError('Invalid email');

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Invalid email');
    expect(error.code).toBe(ErrorCode.ERR_VAL_FORMAT);
  });

  it('should be recoverable by default', () => {
    const error = new ValidationError('Invalid');
    expect(error.isRecoverable).toBe(true);
  });

  it('should store field name', () => {
    const error = new ValidationError('Invalid', { field: 'email' });
    expect(error.field).toBe('email');
  });

  it('should store validation errors object', () => {
    const validationErrors = {
      email: 'Must be valid email',
      password: 'Too short',
    };
    const error = new ValidationError('Multiple errors', { validationErrors });

    expect(error.validationErrors).toEqual(validationErrors);
  });

  it('should provide user-friendly message with field name', () => {
    const error = new ValidationError('Must be valid', { field: 'email' });
    expect(error.getUserMessage()).toBe('Invalid value for email: Must be valid');
  });

  it('should provide user-friendly message with validation errors', () => {
    const error = new ValidationError('Errors', {
      validationErrors: { email: 'Invalid format' },
    });
    expect(error.getUserMessage()).toContain('email: Invalid format');
  });

  it('should serialize with field and validationErrors', () => {
    const error = new ValidationError('Invalid', {
      field: 'email',
      validationErrors: { email: 'Invalid' },
    });

    const json = error.toJSON();
    expect(json.field).toBe('email');
    expect(json.validationErrors).toEqual({ email: 'Invalid' });
  });
});

describe('GenerationError', () => {
  it('should create a GenerationError', () => {
    const error = new GenerationError(
      'Token limit',
      ErrorCode.ERR_GEN_TOKEN_LIMIT
    );

    expect(error).toBeInstanceOf(GenerationError);
    expect(error.name).toBe('GenerationError');
    expect(error.message).toBe('Token limit');
    expect(error.code).toBe(ErrorCode.ERR_GEN_TOKEN_LIMIT);
  });

  it('should be retryable by default', () => {
    const error = new GenerationError('Error', ErrorCode.ERR_GEN_TIMEOUT);
    expect(error.retryable).toBe(true);
    expect(error.isRecoverable).toBe(true);
  });

  it('should respect retryable flag', () => {
    const nonRetryable = new GenerationError(
      'Error',
      ErrorCode.ERR_GEN_CONTENT_POLICY,
      { retryable: false }
    );

    expect(nonRetryable.retryable).toBe(false);
    expect(nonRetryable.isRecoverable).toBe(false);
  });

  it('should store estimated tokens', () => {
    const error = new GenerationError(
      'Token limit',
      ErrorCode.ERR_GEN_TOKEN_LIMIT,
      { estimatedTokens: 8500 }
    );

    expect(error.estimatedTokens).toBe(8500);
  });

  it('should provide user-friendly messages for generation errors', () => {
    const testCases = [
      {
        code: ErrorCode.ERR_GEN_TOKEN_LIMIT,
        tokens: 8500,
        expected: 'Token limit exceeded (~8500 tokens). Try reducing conversation length.',
      },
      {
        code: ErrorCode.ERR_GEN_CONTENT_POLICY,
        expected: 'Content violates AI policy. Please modify your prompt.',
      },
      {
        code: ErrorCode.ERR_GEN_TIMEOUT,
        expected: 'Generation timed out. Please try again.',
      },
      {
        code: ErrorCode.ERR_GEN_RATE_LIMIT,
        expected: 'Generation rate limit exceeded. Please wait a moment.',
      },
    ];

    testCases.forEach(({ code, tokens, expected }) => {
      const error = new GenerationError('Error', code, {
        estimatedTokens: tokens,
      });
      expect(error.getUserMessage()).toBe(expected);
    });
  });

  it('should serialize with retryable and estimatedTokens', () => {
    const error = new GenerationError(
      'Error',
      ErrorCode.ERR_GEN_TOKEN_LIMIT,
      { retryable: false, estimatedTokens: 9000 }
    );

    const json = error.toJSON();
    expect(json.retryable).toBe(false);
    expect(json.estimatedTokens).toBe(9000);
  });
});

describe('DatabaseError', () => {
  it('should create a DatabaseError', () => {
    const error = new DatabaseError(
      'Connection failed',
      ErrorCode.ERR_DB_CONNECTION
    );

    expect(error).toBeInstanceOf(DatabaseError);
    expect(error.name).toBe('DatabaseError');
    expect(error.message).toBe('Connection failed');
    expect(error.code).toBe(ErrorCode.ERR_DB_CONNECTION);
  });

  it('should mark deadlocks as recoverable', () => {
    const error = new DatabaseError('Deadlock', ErrorCode.ERR_DB_DEADLOCK);
    expect(error.isRecoverable).toBe(true);
  });

  it('should mark timeouts as recoverable', () => {
    const error = new DatabaseError('Timeout', ErrorCode.ERR_DB_TIMEOUT);
    expect(error.isRecoverable).toBe(true);
  });

  it('should mark other errors as non-recoverable', () => {
    const error = new DatabaseError('Connection', ErrorCode.ERR_DB_CONNECTION);
    expect(error.isRecoverable).toBe(false);
  });

  it('should store SQL code', () => {
    const error = new DatabaseError('Error', ErrorCode.ERR_DB_CONSTRAINT, {
      sqlCode: '23505',
    });

    expect(error.sqlCode).toBe('23505');
  });

  it('should store constraint name', () => {
    const error = new DatabaseError('Error', ErrorCode.ERR_DB_CONSTRAINT, {
      constraint: 'conversations_pkey',
    });

    expect(error.constraint).toBe('conversations_pkey');
  });

  it('should provide user-friendly messages for database errors', () => {
    const testCases = [
      {
        code: ErrorCode.ERR_DB_CONNECTION,
        expected: 'Database connection failed. Please try again.',
      },
      {
        code: ErrorCode.ERR_DB_CONSTRAINT,
        constraint: 'unique_email',
        expected: 'Data constraint violation: unique_email',
      },
      {
        code: ErrorCode.ERR_DB_DEADLOCK,
        expected: 'Database busy. Please try again in a moment.',
      },
      {
        code: ErrorCode.ERR_DB_TIMEOUT,
        expected: 'Database operation timed out. Please try again.',
      },
    ];

    testCases.forEach(({ code, constraint, expected }) => {
      const error = new DatabaseError('Error', code, { constraint });
      expect(error.getUserMessage()).toBe(expected);
    });
  });

  it('should serialize with sqlCode and constraint', () => {
    const error = new DatabaseError('Error', ErrorCode.ERR_DB_CONSTRAINT, {
      sqlCode: '23505',
      constraint: 'unique_key',
    });

    const json = error.toJSON();
    expect(json.sqlCode).toBe('23505');
    expect(json.constraint).toBe('unique_key');
  });
});

describe('ErrorCode enum', () => {
  it('should have all required error codes', () => {
    const requiredCodes = [
      // API
      'ERR_API_RATE_LIMIT',
      'ERR_API_UNAUTHORIZED',
      'ERR_API_FORBIDDEN',
      'ERR_API_NOT_FOUND',
      'ERR_API_VALIDATION',
      'ERR_API_SERVER',
      'ERR_API_TIMEOUT',
      // Network
      'ERR_NET_OFFLINE',
      'ERR_NET_TIMEOUT',
      'ERR_NET_ABORT',
      'ERR_NET_UNKNOWN',
      // Generation
      'ERR_GEN_TOKEN_LIMIT',
      'ERR_GEN_CONTENT_POLICY',
      'ERR_GEN_TIMEOUT',
      'ERR_GEN_INVALID_RESPONSE',
      'ERR_GEN_RATE_LIMIT',
      // Database
      'ERR_DB_CONNECTION',
      'ERR_DB_QUERY',
      'ERR_DB_CONSTRAINT',
      'ERR_DB_DEADLOCK',
      'ERR_DB_TIMEOUT',
      // Validation
      'ERR_VAL_REQUIRED',
      'ERR_VAL_FORMAT',
      'ERR_VAL_RANGE',
      'ERR_VAL_TYPE',
    ];

    requiredCodes.forEach((code) => {
      expect(ErrorCode[code as keyof typeof ErrorCode]).toBe(code);
    });
  });
});

