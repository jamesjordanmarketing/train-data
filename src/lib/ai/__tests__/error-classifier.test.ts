/**
 * Unit tests for error classifier
 * 
 * Tests error categorization and retryability logic
 */

import { describe, test, expect } from '@jest/globals';
import { ErrorClassifier } from '../error-classifier';

describe('ErrorClassifier.isRetryable', () => {
  describe('Network Errors (Retryable)', () => {
    test('identifies ECONNREFUSED as retryable', () => {
      const error = new Error('ECONNREFUSED: Connection refused');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies ETIMEDOUT as retryable', () => {
      const error = new Error('ETIMEDOUT: Request timed out');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies network request failures as retryable', () => {
      const error = new Error('Network request failed');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies socket hang up as retryable', () => {
      const error = new Error('socket hang up');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies ECONNRESET as retryable', () => {
      const error = new Error('ECONNRESET: Connection reset');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });
  });

  describe('Timeout Errors (Retryable)', () => {
    test('identifies timeout errors as retryable', () => {
      const error = new Error('Request timeout');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies timed out errors as retryable', () => {
      const error = new Error('Operation timed out');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies deadline exceeded as retryable', () => {
      const error = new Error('Deadline exceeded');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });
  });

  describe('Rate Limit Errors (Retryable)', () => {
    test('identifies 429 status as retryable', () => {
      const error = new Error('429 Too Many Requests');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies rate limit messages as retryable', () => {
      const error = new Error('Rate limit exceeded');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies quota exceeded as retryable', () => {
      const error = new Error('Quota exceeded');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });
  });

  describe('Server Errors (Retryable)', () => {
    test('identifies 500 errors as retryable', () => {
      const error = new Error('500 Internal Server Error');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies 502 errors as retryable', () => {
      const error = new Error('502 Bad Gateway');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies 503 errors as retryable', () => {
      const error = new Error('503 Service Unavailable');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });

    test('identifies 504 errors as retryable', () => {
      const error = new Error('504 Gateway Timeout');
      expect(ErrorClassifier.isRetryable(error)).toBe(true);
    });
  });

  describe('Client Errors (Non-Retryable)', () => {
    test('identifies 400 errors as non-retryable', () => {
      const error = new Error('400 Bad Request');
      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });

    test('identifies 401 errors as non-retryable', () => {
      const error = new Error('401 Unauthorized');
      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });

    test('identifies 403 errors as non-retryable', () => {
      const error = new Error('403 Forbidden');
      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });

    test('identifies 404 errors as non-retryable', () => {
      const error = new Error('404 Not Found');
      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });
  });

  describe('Validation Errors (Non-Retryable)', () => {
    test('identifies validation errors as non-retryable', () => {
      const error = new Error('Validation error: field is required');
      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });

    test('identifies invalid input as non-retryable', () => {
      const error = new Error('Invalid request parameters');
      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });

    test('identifies malformed data as non-retryable', () => {
      const error = new Error('Malformed JSON');
      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });
  });

  describe('Unknown Errors (Non-Retryable by default)', () => {
    test('defaults to non-retryable for unknown errors', () => {
      const error = new Error('Something went wrong');
      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });
  });
});

describe('ErrorClassifier.categorizeError', () => {
  test('categorizes network errors', () => {
    const error = new Error('ECONNREFUSED');
    expect(ErrorClassifier.categorizeError(error)).toBe('network');
  });

  test('categorizes timeout errors', () => {
    const error = new Error('Request timeout');
    expect(ErrorClassifier.categorizeError(error)).toBe('timeout');
  });

  test('categorizes rate limit errors', () => {
    const error = new Error('429 Rate limit exceeded');
    expect(ErrorClassifier.categorizeError(error)).toBe('rate_limit');
  });

  test('categorizes server errors', () => {
    const error = new Error('500 Internal Server Error');
    expect(ErrorClassifier.categorizeError(error)).toBe('server');
  });

  test('categorizes validation errors', () => {
    const error = new Error('Validation failed');
    expect(ErrorClassifier.categorizeError(error)).toBe('validation');
  });

  test('categorizes client errors', () => {
    const error = new Error('400 Bad Request');
    expect(ErrorClassifier.categorizeError(error)).toBe('client');
  });

  test('categorizes unknown errors', () => {
    const error = new Error('Something random');
    expect(ErrorClassifier.categorizeError(error)).toBe('unknown');
  });
});

describe('ErrorClassifier.getErrorDetails', () => {
  test('returns complete error details', () => {
    const error = new Error('500 Internal Server Error');
    const details = ErrorClassifier.getErrorDetails(error);
    
    expect(details.category).toBe('server');
    expect(details.isRetryable).toBe(true);
    expect(details.statusCode).toBe(500);
    expect(details.originalMessage).toBe('500 Internal Server Error');
    expect(details.timestamp).toBeInstanceOf(Date);
  });

  test('handles errors without status codes', () => {
    const error = new Error('Network request failed');
    const details = ErrorClassifier.getErrorDetails(error);
    
    expect(details.category).toBe('network');
    expect(details.isRetryable).toBe(true);
    expect(details.statusCode).toBeUndefined();
  });

  test('extracts status codes from various formats', () => {
    const error1 = new Error('429 Rate limit');
    expect(ErrorClassifier.getErrorDetails(error1).statusCode).toBe(429);
    
    const error2 = new Error('Status: 503');
    expect(ErrorClassifier.getErrorDetails(error2).statusCode).toBe(503);
    
    const error3 = new Error('HTTP 404 Not Found');
    expect(ErrorClassifier.getErrorDetails(error3).statusCode).toBe(404);
  });
});

describe('ErrorClassifier.getUserFriendlyMessage', () => {
  test('provides user-friendly message for network errors', () => {
    const error = new Error('ECONNREFUSED');
    const message = ErrorClassifier.getUserFriendlyMessage(error);
    expect(message).toContain('Network connection error');
  });

  test('provides user-friendly message for rate limit errors', () => {
    const error = new Error('429 Rate limit exceeded');
    const message = ErrorClassifier.getUserFriendlyMessage(error);
    expect(message).toContain('rate limit');
  });

  test('provides user-friendly message for server errors', () => {
    const error = new Error('500 Internal Server Error');
    const message = ErrorClassifier.getUserFriendlyMessage(error);
    expect(message).toContain('Server error');
  });

  test('provides user-friendly message for validation errors', () => {
    const error = new Error('Validation failed');
    const message = ErrorClassifier.getUserFriendlyMessage(error);
    expect(message).toContain('Validation error');
  });
});

describe('ErrorClassifier.getRecommendedAction', () => {
  test('recommends retry for network errors', () => {
    const error = new Error('Network request failed');
    const action = ErrorClassifier.getRecommendedAction(error);
    expect(action).toContain('retry');
  });

  test('recommends not retrying for client errors', () => {
    const error = new Error('400 Bad Request');
    const action = ErrorClassifier.getRecommendedAction(error);
    expect(action).toContain('do not retry');
  });

  test('recommends waiting for rate limits', () => {
    const error = new Error('429 Rate limit exceeded');
    const action = ErrorClassifier.getRecommendedAction(error);
    expect(action).toContain('Wait');
  });

  test('recommends exponential backoff for server errors', () => {
    const error = new Error('503 Service Unavailable');
    const action = ErrorClassifier.getRecommendedAction(error);
    expect(action).toContain('exponential backoff');
  });
});

describe('Edge Cases', () => {
  test('handles case insensitive error messages', () => {
    const error1 = new Error('NETWORK REQUEST FAILED');
    const error2 = new Error('network request failed');
    
    expect(ErrorClassifier.isRetryable(error1)).toBe(true);
    expect(ErrorClassifier.isRetryable(error2)).toBe(true);
  });

  test('handles errors with mixed content', () => {
    const error = new Error('Request failed with status 500 due to server error');
    expect(ErrorClassifier.categorizeError(error)).toBe('server');
    expect(ErrorClassifier.isRetryable(error)).toBe(true);
  });

  test('handles empty error messages', () => {
    const error = new Error('');
    expect(ErrorClassifier.categorizeError(error)).toBe('unknown');
    expect(ErrorClassifier.isRetryable(error)).toBe(false);
  });

  test('prioritizes more specific error patterns', () => {
    // Should be categorized as validation, not client
    const error = new Error('400 Bad Request: Validation failed');
    expect(ErrorClassifier.categorizeError(error)).toBe('validation');
  });
});

