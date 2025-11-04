/**
 * Error Type Guards and Utility Functions
 * 
 * This module provides:
 * - Type guard functions for TypeScript type narrowing
 * - Error classification and categorization utilities
 * - Error sanitization for client-side display
 * - Error normalization for consistent handling
 * 
 * @module error-guards
 */

import {
  AppError,
  APIError,
  NetworkError,
  ValidationError,
  GenerationError,
  DatabaseError,
  ErrorCode,
} from './error-classes';

/**
 * Type guard for AppError instances.
 * Use this to check if an unknown error is our custom AppError.
 * 
 * @example
 * ```typescript
 * try {
 *   // some code
 * } catch (error) {
 *   if (isAppError(error)) {
 *     console.log(error.code); // TypeScript knows error has 'code' property
 *   }
 * }
 * ```
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard for APIError instances.
 * Narrows type to APIError, providing access to statusCode and responseData.
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Type guard for NetworkError instances.
 * Useful for handling connectivity-related errors specifically.
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard for ValidationError instances.
 * Provides access to field and validationErrors properties.
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard for GenerationError instances.
 * Useful for handling AI generation failures.
 */
export function isGenerationError(error: unknown): error is GenerationError {
  return error instanceof GenerationError;
}

/**
 * Type guard for DatabaseError instances.
 * Provides access to sqlCode and constraint properties.
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

/**
 * Error category for classification.
 */
export type ErrorCategory = 'api' | 'network' | 'validation' | 'generation' | 'database' | 'unknown';

/**
 * Categorize an error into one of the predefined categories.
 * Useful for error reporting and metrics.
 * 
 * @example
 * ```typescript
 * const category = categorizeError(error);
 * analytics.trackError(category, error);
 * ```
 */
export function categorizeError(error: unknown): ErrorCategory {
  if (isAPIError(error)) return 'api';
  if (isNetworkError(error)) return 'network';
  if (isValidationError(error)) return 'validation';
  if (isGenerationError(error)) return 'generation';
  if (isDatabaseError(error)) return 'database';
  return 'unknown';
}

/**
 * Check if an error is retryable/recoverable.
 * Used to determine if automatic retry logic should be applied.
 * 
 * @example
 * ```typescript
 * if (isRetryable(error) && retryCount < maxRetries) {
 *   await retryOperation();
 * }
 * ```
 */
export function isRetryable(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isRecoverable;
  }
  
  // Treat unknown errors as non-retryable by default for safety
  return false;
}

/**
 * Extract a user-friendly message from any error.
 * Always returns a string suitable for display to end users.
 * 
 * @example
 * ```typescript
 * try {
 *   // some code
 * } catch (error) {
 *   toast.error(getUserMessage(error));
 * }
 * ```
 */
export function getUserMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.getUserMessage();
  }
  
  if (error instanceof Error) {
    // For standard Error objects, provide generic message
    return 'An unexpected error occurred. Please try again.';
  }
  
  return 'An unknown error occurred.';
}

/**
 * Extract error code from an error if available.
 * Returns null for non-AppError instances.
 * 
 * @example
 * ```typescript
 * const code = getErrorCode(error);
 * if (code === ErrorCode.ERR_API_RATE_LIMIT) {
 *   // Handle rate limit specifically
 * }
 * ```
 */
export function getErrorCode(error: unknown): ErrorCode | null {
  if (isAppError(error)) {
    return error.code;
  }
  return null;
}

/**
 * Sanitized error representation for client display.
 * Contains only safe-to-display information.
 */
export interface SanitizedError {
  message: string;
  code?: ErrorCode;
  isRecoverable: boolean;
  category?: ErrorCategory;
}

/**
 * Sanitize error for client display.
 * Removes sensitive data like stack traces, internal details, etc.
 * Safe to send to frontend or external systems.
 * 
 * @example
 * ```typescript
 * const safeError = sanitizeError(error);
 * res.status(500).json({ error: safeError });
 * ```
 */
export function sanitizeError(error: unknown): SanitizedError {
  if (isAppError(error)) {
    return {
      message: error.getUserMessage(),
      code: error.code,
      isRecoverable: error.isRecoverable,
      category: categorizeError(error),
    };
  }

  return {
    message: 'An unexpected error occurred.',
    isRecoverable: false,
    category: 'unknown',
  };
}

/**
 * Convert any error to an AppError instance.
 * Useful for normalizing error handling across the application.
 * 
 * @example
 * ```typescript
 * try {
 *   JSON.parse(invalidJson);
 * } catch (error) {
 *   const appError = normalizeError(error, 'JSONParser');
 *   errorLogger.error('Parse failed', appError);
 * }
 * ```
 */
export function normalizeError(error: unknown, component?: string): AppError {
  // Already an AppError, return as-is
  if (isAppError(error)) {
    return error;
  }

  // Standard Error object
  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorCode.ERR_NET_UNKNOWN,
      {
        context: { component },
        cause: error,
      }
    );
  }

  // Unknown error type (string, object, etc.)
  return new AppError(
    'Unknown error occurred',
    ErrorCode.ERR_NET_UNKNOWN,
    {
      context: { 
        component,
        metadata: { rawError: String(error) },
      },
    }
  );
}

/**
 * Check if error indicates a rate limit was hit.
 * Useful for implementing backoff strategies.
 */
export function isRateLimitError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === ErrorCode.ERR_API_RATE_LIMIT || code === ErrorCode.ERR_GEN_RATE_LIMIT;
}

/**
 * Check if error indicates a timeout.
 * Useful for adjusting timeout settings or retry logic.
 */
export function isTimeoutError(error: unknown): boolean {
  const code = getErrorCode(error);
  return (
    code === ErrorCode.ERR_API_TIMEOUT ||
    code === ErrorCode.ERR_NET_TIMEOUT ||
    code === ErrorCode.ERR_GEN_TIMEOUT ||
    code === ErrorCode.ERR_DB_TIMEOUT
  );
}

/**
 * Check if error is authentication-related.
 * Useful for triggering re-authentication flows.
 */
export function isAuthError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === ErrorCode.ERR_API_UNAUTHORIZED || code === ErrorCode.ERR_API_FORBIDDEN;
}

/**
 * Check if error is a validation error.
 * Useful for form handling and input validation.
 */
export function isValidationIssue(error: unknown): boolean {
  return isValidationError(error) || getErrorCode(error) === ErrorCode.ERR_API_VALIDATION;
}

/**
 * Extract HTTP status code from error if available.
 * Returns null for non-API errors.
 */
export function getStatusCode(error: unknown): number | null {
  if (isAPIError(error)) {
    return error.statusCode;
  }
  return null;
}

/**
 * Create a user-friendly error summary object.
 * Useful for displaying error information in UI.
 */
export interface ErrorSummary {
  title: string;
  message: string;
  canRetry: boolean;
  code?: ErrorCode;
  suggestions?: string[];
}

/**
 * Generate a comprehensive error summary for UI display.
 * Includes user-friendly title, message, and actionable suggestions.
 * 
 * @example
 * ```typescript
 * const summary = getErrorSummary(error);
 * showErrorModal(summary.title, summary.message, summary.suggestions);
 * ```
 */
export function getErrorSummary(error: unknown): ErrorSummary {
  const message = getUserMessage(error);
  const canRetry = isRetryable(error);
  const code = getErrorCode(error);
  const category = categorizeError(error);

  // Determine title based on category
  let title = 'Error';
  switch (category) {
    case 'api':
      title = 'API Error';
      break;
    case 'network':
      title = 'Connection Error';
      break;
    case 'validation':
      title = 'Validation Error';
      break;
    case 'generation':
      title = 'Generation Error';
      break;
    case 'database':
      title = 'Data Error';
      break;
  }

  // Generate suggestions based on error type
  const suggestions: string[] = [];
  
  if (isNetworkError(error)) {
    suggestions.push('Check your internet connection');
    suggestions.push('Try again in a few moments');
  }
  
  if (isRateLimitError(error)) {
    suggestions.push('Wait a few moments before trying again');
    suggestions.push('Consider reducing request frequency');
  }
  
  if (isTimeoutError(error)) {
    suggestions.push('Try again with a smaller request');
    suggestions.push('Check your internet connection speed');
  }
  
  if (isAuthError(error)) {
    suggestions.push('Sign in again');
    suggestions.push('Check your account permissions');
  }

  if (isValidationError(error)) {
    suggestions.push('Review your input');
    suggestions.push('Check for required fields');
  }

  if (canRetry && suggestions.length === 0) {
    suggestions.push('Try again');
  }

  return {
    title,
    message,
    canRetry,
    code: code ?? undefined,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

