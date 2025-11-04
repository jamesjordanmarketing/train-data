/**
 * Unit tests for error guards and utilities
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  APIError,
  NetworkError,
  ValidationError,
  GenerationError,
  DatabaseError,
  ErrorCode,
} from '../error-classes';
import {
  isAppError,
  isAPIError,
  isNetworkError,
  isValidationError,
  isGenerationError,
  isDatabaseError,
  categorizeError,
  isRetryable,
  getUserMessage,
  getErrorCode,
  sanitizeError,
  normalizeError,
  isRateLimitError,
  isTimeoutError,
  isAuthError,
  isValidationIssue,
  getStatusCode,
  getErrorSummary,
} from '../error-guards';

describe('Type Guards', () => {
  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new AppError('Test', ErrorCode.ERR_NET_UNKNOWN);
      expect(isAppError(error)).toBe(true);
    });

    it('should return true for AppError subclasses', () => {
      const apiError = new APIError('Test', 404, ErrorCode.ERR_API_NOT_FOUND);
      const netError = new NetworkError('Test', ErrorCode.ERR_NET_TIMEOUT);
      
      expect(isAppError(apiError)).toBe(true);
      expect(isAppError(netError)).toBe(true);
    });

    it('should return false for standard Error', () => {
      const error = new Error('Standard error');
      expect(isAppError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isAppError('string')).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
      expect(isAppError({})).toBe(false);
    });
  });

  describe('isAPIError', () => {
    it('should return true for APIError instances', () => {
      const error = new APIError('Test', 404, ErrorCode.ERR_API_NOT_FOUND);
      expect(isAPIError(error)).toBe(true);
    });

    it('should return false for other error types', () => {
      const appError = new AppError('Test', ErrorCode.ERR_NET_UNKNOWN);
      const netError = new NetworkError('Test', ErrorCode.ERR_NET_TIMEOUT);
      
      expect(isAPIError(appError)).toBe(false);
      expect(isAPIError(netError)).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('should return true for NetworkError instances', () => {
      const error = new NetworkError('Test', ErrorCode.ERR_NET_TIMEOUT);
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for other error types', () => {
      const apiError = new APIError('Test', 404, ErrorCode.ERR_API_NOT_FOUND);
      expect(isNetworkError(apiError)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should return true for ValidationError instances', () => {
      const error = new ValidationError('Invalid');
      expect(isValidationError(error)).toBe(true);
    });

    it('should return false for other error types', () => {
      const apiError = new APIError('Test', 400, ErrorCode.ERR_API_VALIDATION);
      expect(isValidationError(apiError)).toBe(false);
    });
  });

  describe('isGenerationError', () => {
    it('should return true for GenerationError instances', () => {
      const error = new GenerationError('Test', ErrorCode.ERR_GEN_TIMEOUT);
      expect(isGenerationError(error)).toBe(true);
    });

    it('should return false for other error types', () => {
      const appError = new AppError('Test', ErrorCode.ERR_NET_UNKNOWN);
      expect(isGenerationError(appError)).toBe(false);
    });
  });

  describe('isDatabaseError', () => {
    it('should return true for DatabaseError instances', () => {
      const error = new DatabaseError('Test', ErrorCode.ERR_DB_CONNECTION);
      expect(isDatabaseError(error)).toBe(true);
    });

    it('should return false for other error types', () => {
      const appError = new AppError('Test', ErrorCode.ERR_NET_UNKNOWN);
      expect(isDatabaseError(appError)).toBe(false);
    });
  });
});

describe('categorizeError', () => {
  it('should categorize API errors', () => {
    const error = new APIError('Test', 404, ErrorCode.ERR_API_NOT_FOUND);
    expect(categorizeError(error)).toBe('api');
  });

  it('should categorize network errors', () => {
    const error = new NetworkError('Test', ErrorCode.ERR_NET_TIMEOUT);
    expect(categorizeError(error)).toBe('network');
  });

  it('should categorize validation errors', () => {
    const error = new ValidationError('Invalid');
    expect(categorizeError(error)).toBe('validation');
  });

  it('should categorize generation errors', () => {
    const error = new GenerationError('Test', ErrorCode.ERR_GEN_TIMEOUT);
    expect(categorizeError(error)).toBe('generation');
  });

  it('should categorize database errors', () => {
    const error = new DatabaseError('Test', ErrorCode.ERR_DB_CONNECTION);
    expect(categorizeError(error)).toBe('database');
  });

  it('should return unknown for standard errors', () => {
    const error = new Error('Standard error');
    expect(categorizeError(error)).toBe('unknown');
  });

  it('should return unknown for non-error values', () => {
    expect(categorizeError('string')).toBe('unknown');
    expect(categorizeError(null)).toBe('unknown');
  });
});

describe('isRetryable', () => {
  it('should return true for recoverable AppErrors', () => {
    const error = new AppError('Test', ErrorCode.ERR_NET_TIMEOUT, {
      isRecoverable: true,
    });
    expect(isRetryable(error)).toBe(true);
  });

  it('should return false for non-recoverable AppErrors', () => {
    const error = new AppError('Test', ErrorCode.ERR_NET_UNKNOWN, {
      isRecoverable: false,
    });
    expect(isRetryable(error)).toBe(false);
  });

  it('should return false for non-AppError values', () => {
    const error = new Error('Standard error');
    expect(isRetryable(error)).toBe(false);
  });
});

describe('getUserMessage', () => {
  it('should return user message from AppError', () => {
    const error = new APIError('Technical', 404, ErrorCode.ERR_API_NOT_FOUND);
    const message = getUserMessage(error);
    expect(message).toBe('The requested resource was not found.');
  });

  it('should return generic message for standard Error', () => {
    const error = new Error('Technical error');
    const message = getUserMessage(error);
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should return generic message for unknown errors', () => {
    const message = getUserMessage('string error');
    expect(message).toBe('An unknown error occurred.');
  });
});

describe('getErrorCode', () => {
  it('should return error code from AppError', () => {
    const error = new AppError('Test', ErrorCode.ERR_NET_TIMEOUT);
    expect(getErrorCode(error)).toBe(ErrorCode.ERR_NET_TIMEOUT);
  });

  it('should return null for non-AppError', () => {
    const error = new Error('Standard');
    expect(getErrorCode(error)).toBeNull();
  });
});

describe('sanitizeError', () => {
  it('should sanitize AppError', () => {
    const error = new APIError('Technical', 404, ErrorCode.ERR_API_NOT_FOUND);
    const sanitized = sanitizeError(error);

    expect(sanitized.message).toBe('The requested resource was not found.');
    expect(sanitized.code).toBe(ErrorCode.ERR_API_NOT_FOUND);
    expect(sanitized.isRecoverable).toBe(false);
    expect(sanitized.category).toBe('api');
  });

  it('should sanitize standard Error', () => {
    const error = new Error('Technical error');
    const sanitized = sanitizeError(error);

    expect(sanitized.message).toBe('An unexpected error occurred.');
    expect(sanitized.code).toBeUndefined();
    expect(sanitized.isRecoverable).toBe(false);
    expect(sanitized.category).toBe('unknown');
  });

  it('should not include stack trace or internal details', () => {
    const error = new AppError('Test', ErrorCode.ERR_NET_UNKNOWN, {
      context: { userId: 'secret123' },
    });
    const sanitized = sanitizeError(error);

    expect(sanitized).not.toHaveProperty('stack');
    expect(sanitized).not.toHaveProperty('context');
  });
});

describe('normalizeError', () => {
  it('should return AppError as-is', () => {
    const error = new AppError('Test', ErrorCode.ERR_NET_UNKNOWN);
    const normalized = normalizeError(error);
    expect(normalized).toBe(error);
  });

  it('should convert standard Error to AppError', () => {
    const error = new Error('Standard error');
    const normalized = normalizeError(error, 'TestComponent');

    expect(normalized).toBeInstanceOf(AppError);
    expect(normalized.message).toBe('Standard error');
    expect(normalized.code).toBe(ErrorCode.ERR_NET_UNKNOWN);
    expect(normalized.context.component).toBe('TestComponent');
    expect(normalized.cause).toBe(error);
  });

  it('should convert unknown error to AppError', () => {
    const normalized = normalizeError('String error', 'TestComponent');

    expect(normalized).toBeInstanceOf(AppError);
    expect(normalized.message).toBe('Unknown error occurred');
    expect(normalized.code).toBe(ErrorCode.ERR_NET_UNKNOWN);
    expect(normalized.context.component).toBe('TestComponent');
    expect(normalized.context.metadata?.rawError).toBe('String error');
  });
});

describe('isRateLimitError', () => {
  it('should return true for API rate limit errors', () => {
    const error = new APIError('Rate limited', 429, ErrorCode.ERR_API_RATE_LIMIT);
    expect(isRateLimitError(error)).toBe(true);
  });

  it('should return true for generation rate limit errors', () => {
    const error = new GenerationError('Rate limited', ErrorCode.ERR_GEN_RATE_LIMIT);
    expect(isRateLimitError(error)).toBe(true);
  });

  it('should return false for other errors', () => {
    const error = new NetworkError('Timeout', ErrorCode.ERR_NET_TIMEOUT);
    expect(isRateLimitError(error)).toBe(false);
  });
});

describe('isTimeoutError', () => {
  it('should return true for various timeout errors', () => {
    const errors = [
      new APIError('Timeout', 504, ErrorCode.ERR_API_TIMEOUT),
      new NetworkError('Timeout', ErrorCode.ERR_NET_TIMEOUT),
      new GenerationError('Timeout', ErrorCode.ERR_GEN_TIMEOUT),
      new DatabaseError('Timeout', ErrorCode.ERR_DB_TIMEOUT),
    ];

    errors.forEach((error) => {
      expect(isTimeoutError(error)).toBe(true);
    });
  });

  it('should return false for non-timeout errors', () => {
    const error = new NetworkError('Offline', ErrorCode.ERR_NET_OFFLINE);
    expect(isTimeoutError(error)).toBe(false);
  });
});

describe('isAuthError', () => {
  it('should return true for authentication errors', () => {
    const error401 = new APIError('Unauthorized', 401, ErrorCode.ERR_API_UNAUTHORIZED);
    const error403 = new APIError('Forbidden', 403, ErrorCode.ERR_API_FORBIDDEN);

    expect(isAuthError(error401)).toBe(true);
    expect(isAuthError(error403)).toBe(true);
  });

  it('should return false for non-auth errors', () => {
    const error = new APIError('Not found', 404, ErrorCode.ERR_API_NOT_FOUND);
    expect(isAuthError(error)).toBe(false);
  });
});

describe('isValidationIssue', () => {
  it('should return true for ValidationError', () => {
    const error = new ValidationError('Invalid');
    expect(isValidationIssue(error)).toBe(true);
  });

  it('should return true for API validation errors', () => {
    const error = new APIError('Validation failed', 400, ErrorCode.ERR_API_VALIDATION);
    expect(isValidationIssue(error)).toBe(true);
  });

  it('should return false for other errors', () => {
    const error = new NetworkError('Timeout', ErrorCode.ERR_NET_TIMEOUT);
    expect(isValidationIssue(error)).toBe(false);
  });
});

describe('getStatusCode', () => {
  it('should return status code from APIError', () => {
    const error = new APIError('Not found', 404, ErrorCode.ERR_API_NOT_FOUND);
    expect(getStatusCode(error)).toBe(404);
  });

  it('should return null for non-API errors', () => {
    const error = new NetworkError('Timeout', ErrorCode.ERR_NET_TIMEOUT);
    expect(getStatusCode(error)).toBeNull();
  });
});

describe('getErrorSummary', () => {
  it('should generate summary for API error', () => {
    const error = new APIError('Not found', 404, ErrorCode.ERR_API_NOT_FOUND);
    const summary = getErrorSummary(error);

    expect(summary.title).toBe('API Error');
    expect(summary.message).toBe('The requested resource was not found.');
    expect(summary.canRetry).toBe(false);
    expect(summary.code).toBe(ErrorCode.ERR_API_NOT_FOUND);
  });

  it('should generate summary for network error with suggestions', () => {
    const error = new NetworkError('Timeout', ErrorCode.ERR_NET_TIMEOUT);
    const summary = getErrorSummary(error);

    expect(summary.title).toBe('Connection Error');
    expect(summary.canRetry).toBe(true);
    expect(summary.suggestions).toContain('Check your internet connection');
  });

  it('should generate summary for validation error', () => {
    const error = new ValidationError('Invalid email');
    const summary = getErrorSummary(error);

    expect(summary.title).toBe('Validation Error');
    expect(summary.suggestions).toContain('Review your input');
  });

  it('should generate summary for rate limit error', () => {
    const error = new APIError('Rate limited', 429, ErrorCode.ERR_API_RATE_LIMIT);
    const summary = getErrorSummary(error);

    expect(summary.suggestions).toContain('Wait a few moments before trying again');
  });

  it('should generate summary for auth error', () => {
    const error = new APIError('Unauthorized', 401, ErrorCode.ERR_API_UNAUTHORIZED);
    const summary = getErrorSummary(error);

    expect(summary.suggestions).toContain('Sign in again');
  });

  it('should generate summary for generation error', () => {
    const error = new GenerationError('Failed', ErrorCode.ERR_GEN_TIMEOUT);
    const summary = getErrorSummary(error);

    expect(summary.title).toBe('Generation Error');
  });

  it('should generate summary for database error', () => {
    const error = new DatabaseError('Connection failed', ErrorCode.ERR_DB_CONNECTION);
    const summary = getErrorSummary(error);

    expect(summary.title).toBe('Data Error');
  });

  it('should generate summary for unknown error', () => {
    const error = new Error('Unknown');
    const summary = getErrorSummary(error);

    expect(summary.title).toBe('Error');
    expect(summary.canRetry).toBe(false);
    expect(summary.code).toBeUndefined();
  });

  it('should add generic retry suggestion for retryable errors', () => {
    const error = new AppError('Test', ErrorCode.ERR_NET_UNKNOWN, {
      isRecoverable: true,
    });
    const summary = getErrorSummary(error);

    expect(summary.canRetry).toBe(true);
    expect(summary.suggestions).toContain('Try again');
  });
});

