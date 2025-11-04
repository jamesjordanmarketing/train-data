/**
 * Error Handling Infrastructure
 * 
 * Centralized error handling for the Training Data Generation platform.
 * 
 * ## Features
 * - Custom error class hierarchy with specialized types
 * - Standardized error codes for consistent identification
 * - Type-safe error guards for TypeScript narrowing
 * - Centralized error logging with batching
 * - User-friendly error messages for business users
 * - Error context for debugging and tracing
 * 
 * ## Quick Start
 * 
 * ### Throwing Errors
 * ```typescript
 * import { APIError, ErrorCode } from '@/lib/errors';
 * 
 * throw new APIError(
 *   'Rate limit exceeded',
 *   429,
 *   ErrorCode.ERR_API_RATE_LIMIT
 * );
 * ```
 * 
 * ### Handling Errors
 * ```typescript
 * import { isAPIError, getUserMessage, errorLogger } from '@/lib/errors';
 * 
 * try {
 *   await fetchData();
 * } catch (error) {
 *   errorLogger.error('Data fetch failed', error);
 *   
 *   if (isAPIError(error)) {
 *     console.log('Status:', error.statusCode);
 *   }
 *   
 *   toast.error(getUserMessage(error));
 * }
 * ```
 * 
 * ### Logging
 * ```typescript
 * import { errorLogger } from '@/lib/errors';
 * 
 * errorLogger.info('Operation started', { userId: '123' });
 * errorLogger.error('Operation failed', error, { component: 'DataLoader' });
 * errorLogger.critical('System failure', error);
 * ```
 * 
 * @module errors
 */

// Export error classes and types
export {
  AppError,
  APIError,
  NetworkError,
  ValidationError,
  GenerationError,
  DatabaseError,
  ErrorCode,
  type ErrorContext,
} from './error-classes';

// Export type guards and utilities
export {
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
  type ErrorCategory,
  type SanitizedError,
  type ErrorSummary,
} from './error-guards';

// Export error logger
export {
  errorLogger,
  ErrorLogger,
  type LogLevel,
  type LogEntry,
} from './error-logger';

