/**
 * Error Classification System
 * 
 * Categorizes errors to determine retry behavior and appropriate handling strategies.
 * Distinguishes between transient errors (retryable) and permanent errors (non-retryable).
 * 
 * @module error-classifier
 */

/**
 * Error category types
 */
export type ErrorCategory = 
  | 'network'      // Network connectivity issues
  | 'rate_limit'   // API rate limit exceeded
  | 'server'       // Server errors (5xx)
  | 'client'       // Client errors (4xx)
  | 'validation'   // Input validation errors
  | 'timeout'      // Request timeout
  | 'unknown';     // Unclassified errors

/**
 * Error details for logging and debugging
 */
export interface ErrorDetails {
  category: ErrorCategory;
  isRetryable: boolean;
  statusCode?: number;
  originalMessage: string;
  timestamp: Date;
}

/**
 * Error Classifier
 * 
 * Analyzes errors to determine:
 * - Whether they should be retried
 * - What category they belong to
 * - Appropriate handling strategy
 */
export class ErrorClassifier {
  /**
   * Determine if an error is retryable
   * 
   * Retryable errors (transient):
   * - Network errors (ECONNREFUSED, ETIMEDOUT, etc.)
   * - Rate limit errors (429)
   * - Server errors (5xx)
   * - Timeout errors
   * 
   * Non-retryable errors (permanent):
   * - Client errors (4xx except 429)
   * - Validation errors
   * - Authentication errors (401, 403)
   * 
   * @param error - The error to classify
   * @returns true if the error should be retried
   */
  static isRetryable(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Network errors - retryable
    if (
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('enotfound') ||
      message.includes('enetunreach') ||
      message.includes('network request failed') ||
      message.includes('network error') ||
      message.includes('fetch failed') ||
      message.includes('socket hang up')
    ) {
      return true;
    }
    
    // Timeout errors - retryable
    if (
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('deadline exceeded')
    ) {
      return true;
    }
    
    // Rate limit errors - retryable
    if (
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('quota exceeded')
    ) {
      return true;
    }
    
    // Server errors (5xx) - retryable
    if (
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504') ||
      message.includes('internal server error') ||
      message.includes('bad gateway') ||
      message.includes('service unavailable') ||
      message.includes('gateway timeout')
    ) {
      return true;
    }
    
    // Authentication errors - not retryable
    if (
      message.includes('401') ||
      message.includes('403') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('authentication failed') ||
      message.includes('invalid api key') ||
      message.includes('invalid token')
    ) {
      return false;
    }
    
    // Client errors (4xx except 429) - not retryable
    if (
      message.includes('400') ||
      message.includes('404') ||
      message.includes('405') ||
      message.includes('409') ||
      message.includes('410') ||
      message.includes('bad request') ||
      message.includes('not found') ||
      message.includes('method not allowed') ||
      message.includes('conflict') ||
      message.includes('gone')
    ) {
      return false;
    }
    
    // Validation errors - not retryable
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('malformed') ||
      message.includes('missing required') ||
      message.includes('schema error')
    ) {
      return false;
    }
    
    // Default: not retryable (conservative approach)
    // Unknown errors should not be automatically retried to avoid
    // wasting resources on permanent failures
    return false;
  }
  
  /**
   * Categorize an error into a specific type
   * @param error - The error to categorize
   * @returns Error category
   */
  static categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('enotfound') ||
      message.includes('enetunreach') ||
      message.includes('network request failed') ||
      message.includes('network error') ||
      message.includes('fetch failed') ||
      message.includes('socket hang up')
    ) {
      return 'network';
    }
    
    // Timeout errors
    if (
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('deadline exceeded')
    ) {
      return 'timeout';
    }
    
    // Rate limit errors
    if (
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('quota exceeded')
    ) {
      return 'rate_limit';
    }
    
    // Server errors (5xx)
    if (
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504') ||
      message.includes('internal server error') ||
      message.includes('bad gateway') ||
      message.includes('service unavailable') ||
      message.includes('gateway timeout')
    ) {
      return 'server';
    }
    
    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('malformed') ||
      message.includes('missing required') ||
      message.includes('schema error')
    ) {
      return 'validation';
    }
    
    // Client errors (4xx)
    if (
      message.includes('400') ||
      message.includes('401') ||
      message.includes('403') ||
      message.includes('404') ||
      message.includes('405') ||
      message.includes('409') ||
      message.includes('410') ||
      message.includes('bad request') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('not found') ||
      message.includes('method not allowed') ||
      message.includes('conflict') ||
      message.includes('gone')
    ) {
      return 'client';
    }
    
    // Unknown category
    return 'unknown';
  }
  
  /**
   * Get detailed error information for logging
   * @param error - The error to analyze
   * @returns Detailed error information
   */
  static getErrorDetails(error: Error): ErrorDetails {
    const category = this.categorizeError(error);
    const isRetryable = this.isRetryable(error);
    const statusCode = this.extractStatusCode(error);
    
    return {
      category,
      isRetryable,
      statusCode,
      originalMessage: error.message,
      timestamp: new Date(),
    };
  }
  
  /**
   * Extract HTTP status code from error message if present
   * @param error - The error to analyze
   * @returns Status code or undefined
   */
  private static extractStatusCode(error: Error): number | undefined {
    const message = error.message;
    
    // Try to find status code in common formats
    // Format 1: "429 Rate limit exceeded"
    // Format 2: "Error: Status 503"
    // Format 3: "HTTP 500 Internal Server Error"
    
    const patterns = [
      /\b(\d{3})\b/,           // Any 3-digit number
      /status[:\s]+(\d{3})/i,  // "status: 429" or "Status 429"
      /http[:\s]+(\d{3})/i,    // "HTTP: 503" or "HTTP 503"
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const code = parseInt(match[1], 10);
        // Validate it's a reasonable HTTP status code
        if (code >= 100 && code < 600) {
          return code;
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Create a user-friendly error message based on error category
   * @param error - The error to format
   * @returns User-friendly error message
   */
  static getUserFriendlyMessage(error: Error): string {
    const category = this.categorizeError(error);
    
    switch (category) {
      case 'network':
        return 'Network connection error. Please check your internet connection and try again.';
        
      case 'rate_limit':
        return 'API rate limit exceeded. Please wait a moment and try again.';
        
      case 'server':
        return 'Server error occurred. The issue is temporary and will be retried automatically.';
        
      case 'client':
        return 'Request error. Please check your input and try again.';
        
      case 'validation':
        return 'Validation error. Please verify all required fields are filled correctly.';
        
      case 'timeout':
        return 'Request timed out. The operation is taking longer than expected and will be retried.';
        
      case 'unknown':
      default:
        return `An error occurred: ${error.message}`;
    }
  }
  
  /**
   * Determine recommended action based on error
   * @param error - The error to analyze
   * @returns Recommended action string
   */
  static getRecommendedAction(error: Error): string {
    const category = this.categorizeError(error);
    
    switch (category) {
      case 'network':
        return 'Check network connection and retry';
        
      case 'rate_limit':
        return 'Wait for rate limit reset and retry';
        
      case 'server':
        return 'Retry with exponential backoff';
        
      case 'client':
        return 'Fix request parameters (do not retry)';
        
      case 'validation':
        return 'Validate input data (do not retry)';
        
      case 'timeout':
        return 'Retry with increased timeout';
        
      case 'unknown':
      default:
        return 'Log error and investigate (do not retry)';
    }
  }
}

