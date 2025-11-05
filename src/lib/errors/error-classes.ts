/**
 * Error Classes and Error Code Constants
 * 
 * This module provides a comprehensive error handling infrastructure with:
 * - Custom error class hierarchy (AppError and specialized subclasses)
 * - Standardized error codes for consistent error identification
 * - Error context for debugging and logging
 * - User-friendly error messages for business users
 * - Error serialization for logging and transmission
 * - Stack trace preservation with error chaining
 * 
 * @module error-classes
 */

/**
 * Standardized error codes for the application.
 * Each code follows the pattern: ERR_{CATEGORY}_{SPECIFIC_ERROR}
 */
export enum ErrorCode {
  // API Errors (4xx/5xx HTTP errors)
  ERR_API_RATE_LIMIT = 'ERR_API_RATE_LIMIT',
  ERR_API_UNAUTHORIZED = 'ERR_API_UNAUTHORIZED',
  ERR_API_FORBIDDEN = 'ERR_API_FORBIDDEN',
  ERR_API_NOT_FOUND = 'ERR_API_NOT_FOUND',
  ERR_API_VALIDATION = 'ERR_API_VALIDATION',
  ERR_API_SERVER = 'ERR_API_SERVER',
  ERR_API_TIMEOUT = 'ERR_API_TIMEOUT',
  
  // Network Errors (connectivity issues)
  ERR_NET_OFFLINE = 'ERR_NET_OFFLINE',
  ERR_NET_TIMEOUT = 'ERR_NET_TIMEOUT',
  ERR_NET_ABORT = 'ERR_NET_ABORT',
  ERR_NET_UNKNOWN = 'ERR_NET_UNKNOWN',
  
  // Generation Errors (AI/LLM related)
  ERR_GEN_TOKEN_LIMIT = 'ERR_GEN_TOKEN_LIMIT',
  ERR_GEN_CONTENT_POLICY = 'ERR_GEN_CONTENT_POLICY',
  ERR_GEN_TIMEOUT = 'ERR_GEN_TIMEOUT',
  ERR_GEN_INVALID_RESPONSE = 'ERR_GEN_INVALID_RESPONSE',
  ERR_GEN_RATE_LIMIT = 'ERR_GEN_RATE_LIMIT',
  
  // Database Errors (Supabase/PostgreSQL)
  ERR_DB_CONNECTION = 'ERR_DB_CONNECTION',
  ERR_DB_QUERY = 'ERR_DB_QUERY',
  ERR_DB_CONSTRAINT = 'ERR_DB_CONSTRAINT',
  ERR_DB_DEADLOCK = 'ERR_DB_DEADLOCK',
  ERR_DB_TIMEOUT = 'ERR_DB_TIMEOUT',
  
  // Validation Errors (input/data validation)
  ERR_VAL_REQUIRED = 'ERR_VAL_REQUIRED',
  ERR_VAL_FORMAT = 'ERR_VAL_FORMAT',
  ERR_VAL_RANGE = 'ERR_VAL_RANGE',
  ERR_VAL_TYPE = 'ERR_VAL_TYPE',
}

/**
 * Error context interface for debugging and logging.
 * Captures metadata about when and where an error occurred.
 */
export interface ErrorContext {
  /** ISO timestamp when error occurred */
  timestamp: string;
  /** User ID if available (for user-specific errors) */
  userId?: string;
  /** Request ID for tracing across services */
  requestId?: string;
  /** Component/module where error occurred */
  component?: string;
  /** Additional metadata (flexible for any context) */
  metadata?: Record<string, unknown>;
}

/**
 * Base application error class.
 * All custom errors should extend this class or one of its subclasses.
 * 
 * @example
 * ```typescript
 * throw new AppError(
 *   'Failed to load data',
 *   ErrorCode.ERR_DB_QUERY,
 *   { context: { component: 'DataLoader' } }
 * );
 * ```
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly isRecoverable: boolean;
  public readonly context: ErrorContext;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: ErrorCode,
    options: {
      isRecoverable?: boolean;
      context?: Partial<ErrorContext>;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.isRecoverable = options.isRecoverable ?? false;
    this.context = {
      timestamp: new Date().toISOString(),
      ...options.context,
    };
    this.cause = options.cause;

    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error for logging and transmission.
   * Includes all relevant error details.
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      isRecoverable: this.isRecoverable,
      context: this.context,
      stack: this.stack,
      cause: this.cause?.message,
    };
  }

  /**
   * Get user-friendly error message (non-technical).
   * Override in subclasses for specific error types.
   */
  getUserMessage(): string {
    return this.message;
  }
}

/**
 * API Error class for HTTP/REST API errors.
 * Automatically determines recoverability based on status code.
 * 
 * @example
 * ```typescript
 * throw new APIError(
 *   'Rate limit exceeded',
 *   429,
 *   ErrorCode.ERR_API_RATE_LIMIT,
 *   { responseData: { retry_after: 60 } }
 * );
 * ```
 */
export class APIError extends AppError {
  public readonly statusCode: number;
  public readonly responseData?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    options: {
      responseData?: unknown;
      context?: Partial<ErrorContext>;
      cause?: Error;
    } = {}
  ) {
    super(message, code, {
      // 5xx errors and 429 (rate limit) are recoverable
      isRecoverable: statusCode >= 500 || statusCode === 429,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.responseData = options.responseData;
  }

  getUserMessage(): string {
    switch (this.statusCode) {
      case 401:
        return 'Authentication failed. Please sign in again.';
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Rate limit exceeded. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again.';
      case 503:
        return 'Service is down for maintenance. Please try again later.';
      case 504:
        return 'Request timed out. Please try again.';
      default:
        if (this.statusCode >= 500) {
          return 'Server error. Please try again later.';
        }
        return 'An unexpected error occurred. Please try again.';
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      responseData: this.responseData,
    };
  }
}

/**
 * Network Error class for connectivity and network-related errors.
 * All network errors are considered recoverable by default.
 * 
 * @example
 * ```typescript
 * throw new NetworkError(
 *   'Network timeout after 30s',
 *   ErrorCode.ERR_NET_TIMEOUT,
 *   { context: { component: 'API Client' } }
 * );
 * ```
 */
export class NetworkError extends AppError {
  constructor(
    message: string,
    code: ErrorCode,
    options: {
      context?: Partial<ErrorContext>;
      cause?: Error;
    } = {}
  ) {
    super(message, code, {
      isRecoverable: true,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'NetworkError';
  }

  getUserMessage(): string {
    switch (this.code) {
      case ErrorCode.ERR_NET_OFFLINE:
        return 'No internet connection. Please check your network.';
      case ErrorCode.ERR_NET_TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorCode.ERR_NET_ABORT:
        return 'Request was cancelled.';
      default:
        return 'Network error. Please check your connection.';
    }
  }
}

/**
 * Validation Error class for input validation failures.
 * Used for form validation, data validation, etc.
 * 
 * @example
 * ```typescript
 * throw new ValidationError(
 *   'Email format is invalid',
 *   {
 *     field: 'email',
 *     validationErrors: { email: 'Must be a valid email address' }
 *   }
 * );
 * ```
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly validationErrors?: Record<string, string>;

  constructor(
    message: string,
    options: {
      field?: string;
      validationErrors?: Record<string, string>;
      context?: Partial<ErrorContext>;
    } = {}
  ) {
    super(message, ErrorCode.ERR_VAL_FORMAT, {
      isRecoverable: true,
      context: options.context,
    });
    this.name = 'ValidationError';
    this.field = options.field;
    this.validationErrors = options.validationErrors;
  }

  getUserMessage(): string {
    if (this.field) {
      return `Invalid value for ${this.field}: ${this.message}`;
    }
    if (this.validationErrors) {
      const errors = Object.entries(this.validationErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
      return `Validation errors: ${errors}`;
    }
    return `Validation error: ${this.message}`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      validationErrors: this.validationErrors,
    };
  }
}

/**
 * Generation Error class for AI/LLM generation failures.
 * Includes special handling for token limits and content policy violations.
 * 
 * @example
 * ```typescript
 * throw new GenerationError(
 *   'Token limit exceeded',
 *   ErrorCode.ERR_GEN_TOKEN_LIMIT,
 *   {
 *     estimatedTokens: 8500,
 *     retryable: false
 *   }
 * );
 * ```
 */
export class GenerationError extends AppError {
  public readonly retryable: boolean;
  public readonly estimatedTokens?: number;

  constructor(
    message: string,
    code: ErrorCode,
    options: {
      retryable?: boolean;
      estimatedTokens?: number;
      context?: Partial<ErrorContext>;
      cause?: Error;
    } = {}
  ) {
    super(message, code, {
      isRecoverable: options.retryable ?? true,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'GenerationError';
    this.retryable = options.retryable ?? true;
    this.estimatedTokens = options.estimatedTokens;
  }

  getUserMessage(): string {
    switch (this.code) {
      case ErrorCode.ERR_GEN_TOKEN_LIMIT:
        return `Token limit exceeded${this.estimatedTokens ? ` (~${this.estimatedTokens} tokens)` : ''}. Try reducing conversation length.`;
      case ErrorCode.ERR_GEN_CONTENT_POLICY:
        return 'Content violates AI policy. Please modify your prompt.';
      case ErrorCode.ERR_GEN_TIMEOUT:
        return 'Generation timed out. Please try again.';
      case ErrorCode.ERR_GEN_RATE_LIMIT:
        return 'Generation rate limit exceeded. Please wait a moment.';
      case ErrorCode.ERR_GEN_INVALID_RESPONSE:
        return 'Received invalid response from AI. Please try again.';
      default:
        return 'Generation failed. Please try again.';
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryable: this.retryable,
      estimatedTokens: this.estimatedTokens,
    };
  }
}

/**
 * Database Error class for database operation failures.
 * Includes SQL error codes and constraint information.
 * 
 * @example
 * ```typescript
 * throw new DatabaseError(
 *   'Unique constraint violation',
 *   ErrorCode.ERR_DB_CONSTRAINT,
 *   {
 *     constraint: 'conversations_pkey',
 *     sqlCode: '23505'
 *   }
 * );
 * ```
 */
export class DatabaseError extends AppError {
  public readonly sqlCode?: string;
  public readonly constraint?: string;

  constructor(
    message: string,
    code: ErrorCode,
    options: {
      sqlCode?: string;
      constraint?: string;
      context?: Partial<ErrorContext>;
      cause?: Error;
    } = {}
  ) {
    super(message, code, {
      // Deadlocks and timeouts are recoverable
      isRecoverable: code === ErrorCode.ERR_DB_DEADLOCK || code === ErrorCode.ERR_DB_TIMEOUT,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'DatabaseError';
    this.sqlCode = options.sqlCode;
    this.constraint = options.constraint;
  }

  getUserMessage(): string {
    switch (this.code) {
      case ErrorCode.ERR_DB_CONNECTION:
        return 'Database connection failed. Please try again.';
      case ErrorCode.ERR_DB_CONSTRAINT:
        return this.constraint 
          ? `Data constraint violation: ${this.constraint}`
          : 'Data validation error. Please check your input.';
      case ErrorCode.ERR_DB_DEADLOCK:
        return 'Database busy. Please try again in a moment.';
      case ErrorCode.ERR_DB_TIMEOUT:
        return 'Database operation timed out. Please try again.';
      case ErrorCode.ERR_DB_QUERY:
        return 'Database query failed. Please try again.';
      default:
        return 'Database error occurred. Please try again.';
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      sqlCode: this.sqlCode,
      constraint: this.constraint,
    };
  }
}

