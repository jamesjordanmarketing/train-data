/**
 * Generation Error Classification
 * 
 * This module provides:
 * - Generation-specific error types
 * - Error classification for recovery strategies
 * - User-friendly error messages
 * - Recovery action recommendations
 * 
 * @module generation/errors
 */

import { GenerationError, ErrorCode } from '../errors';

/**
 * Generation error types for classification.
 */
export enum GenerationErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  TOKEN_LIMIT = 'TOKEN_LIMIT',
  CONTENT_POLICY = 'CONTENT_POLICY',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
}

/**
 * Recovery actions for generation errors.
 */
export enum RecoveryAction {
  /** Retry the operation (automatic or manual) */
  RETRY = 'RETRY',
  /** Reduce content size or complexity */
  REDUCE_CONTENT = 'REDUCE_CONTENT',
  /** Modify the prompt to avoid policy violations */
  MODIFY_PROMPT = 'MODIFY_PROMPT',
  /** Skip this generation and continue */
  SKIP = 'SKIP',
  /** Contact support for assistance */
  CONTACT_SUPPORT = 'CONTACT_SUPPORT',
}

/**
 * Error classification result.
 */
export interface ErrorClassification {
  /** Error type category */
  type: GenerationErrorType;
  /** Recommended recovery action */
  action: RecoveryAction;
  /** User-friendly error message */
  message: string;
}

/**
 * Classify generation error and suggest recovery.
 * Analyzes error and provides actionable recovery strategy.
 * 
 * @param error - Error to classify
 * @returns Error classification with recovery strategy
 * 
 * @example
 * ```typescript
 * try {
 *   await generateConversation(prompt);
 * } catch (error) {
 *   const classification = classifyGenerationError(error);
 *   console.log(classification.message);
 *   
 *   switch (classification.action) {
 *     case RecoveryAction.RETRY:
 *       // Automatic retry
 *       break;
 *     case RecoveryAction.REDUCE_CONTENT:
 *       // Show UI to reduce content
 *       break;
 *   }
 * }
 * ```
 */
export function classifyGenerationError(error: unknown): ErrorClassification {
  if (!(error instanceof GenerationError)) {
    return {
      type: GenerationErrorType.SERVER_ERROR,
      action: RecoveryAction.RETRY,
      message: 'Unknown error occurred. Try again.',
    };
  }

  switch (error.code) {
    case ErrorCode.ERR_GEN_RATE_LIMIT:
      return {
        type: GenerationErrorType.RATE_LIMIT,
        action: RecoveryAction.RETRY,
        message: 'Rate limit reached. System will retry automatically.',
      };

    case ErrorCode.ERR_GEN_TOKEN_LIMIT:
      return {
        type: GenerationErrorType.TOKEN_LIMIT,
        action: RecoveryAction.REDUCE_CONTENT,
        message: error.estimatedTokens
          ? `Token limit exceeded (~${error.estimatedTokens} tokens). Reduce conversation length or complexity.`
          : 'Token limit exceeded. Reduce conversation length.',
      };

    case ErrorCode.ERR_GEN_CONTENT_POLICY:
      return {
        type: GenerationErrorType.CONTENT_POLICY,
        action: RecoveryAction.MODIFY_PROMPT,
        message: 'Content violates AI policy. Modify prompt to avoid sensitive topics.',
      };

    case ErrorCode.ERR_GEN_TIMEOUT:
      return {
        type: GenerationErrorType.TIMEOUT,
        action: RecoveryAction.RETRY,
        message: 'Generation timed out. Try again or reduce complexity.',
      };

    case ErrorCode.ERR_GEN_INVALID_RESPONSE:
      return {
        type: GenerationErrorType.INVALID_RESPONSE,
        action: RecoveryAction.RETRY,
        message: 'Invalid response from AI. Retrying may help.',
      };

    default:
      return {
        type: GenerationErrorType.SERVER_ERROR,
        action: RecoveryAction.CONTACT_SUPPORT,
        message: 'Server error. Contact support if this persists.',
      };
  }
}

/**
 * Error message templates by type.
 * Provides consistent messaging across the application.
 */
export const ERROR_MESSAGES: Record<GenerationErrorType, string> = {
  [GenerationErrorType.RATE_LIMIT]:
    'Too many requests. The system will automatically retry after a brief pause.',
  [GenerationErrorType.TOKEN_LIMIT]:
    'The conversation is too long. Consider reducing the number of turns or complexity.',
  [GenerationErrorType.CONTENT_POLICY]:
    'The content violates AI usage policies. Please modify your prompt to avoid restricted topics.',
  [GenerationErrorType.TIMEOUT]:
    'Generation took too long and timed out. Try simplifying the prompt or try again.',
  [GenerationErrorType.SERVER_ERROR]:
    'The AI service encountered an error. Please try again in a few moments.',
  [GenerationErrorType.INVALID_RESPONSE]:
    'The AI returned an invalid response. This usually resolves on retry.',
};

/**
 * Get detailed error message with suggestions.
 * 
 * @param type - Generation error type
 * @param includeRecovery - Include recovery suggestions
 * @returns Detailed error message
 * 
 * @example
 * ```typescript
 * const message = getDetailedErrorMessage(
 *   GenerationErrorType.TOKEN_LIMIT,
 *   true
 * );
 * // Returns message with recovery suggestions
 * ```
 */
export function getDetailedErrorMessage(
  type: GenerationErrorType,
  includeRecovery: boolean = true
): string {
  const baseMessage = ERROR_MESSAGES[type];
  
  if (!includeRecovery) {
    return baseMessage;
  }

  const suggestions: string[] = [];

  switch (type) {
    case GenerationErrorType.RATE_LIMIT:
      suggestions.push('Wait a few moments before trying again');
      suggestions.push('Consider reducing batch size');
      break;
    case GenerationErrorType.TOKEN_LIMIT:
      suggestions.push('Reduce the number of conversation turns');
      suggestions.push('Simplify the prompt');
      suggestions.push('Use fewer examples');
      break;
    case GenerationErrorType.CONTENT_POLICY:
      suggestions.push('Review prompt for sensitive content');
      suggestions.push('Avoid topics like violence, hate speech, or illegal activities');
      suggestions.push('Use more neutral language');
      break;
    case GenerationErrorType.TIMEOUT:
      suggestions.push('Simplify the prompt');
      suggestions.push('Reduce conversation complexity');
      suggestions.push('Check your internet connection');
      break;
    case GenerationErrorType.SERVER_ERROR:
      suggestions.push('Wait a few minutes and try again');
      suggestions.push('Check Claude API status');
      break;
    case GenerationErrorType.INVALID_RESPONSE:
      suggestions.push('Try again (usually resolves automatically)');
      suggestions.push('If persists, modify the prompt');
      break;
  }

  if (suggestions.length > 0) {
    return `${baseMessage}\n\nSuggestions:\n${suggestions.map(s => `• ${s}`).join('\n')}`;
  }

  return baseMessage;
}

/**
 * Estimate token count from text.
 * Rough estimation for UI display (not accurate, for approximation only).
 * 
 * @param text - Text to estimate
 * @returns Approximate token count
 * 
 * @example
 * ```typescript
 * const tokens = estimateTokenCount(prompt);
 * if (tokens > 4000) {
 *   console.warn('Prompt may be too long');
 * }
 * ```
 */
export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token
  // This is a simplification; real tokenization is more complex
  return Math.ceil(text.length / 4);
}

/**
 * Check if prompt is likely to exceed token limit.
 * 
 * @param prompt - Prompt text
 * @param maxTokens - Maximum allowed tokens
 * @returns True if likely to exceed limit
 * 
 * @example
 * ```typescript
 * if (isLikelyToExceedTokenLimit(prompt, 4096)) {
 *   showWarning('Prompt may be too long');
 * }
 * ```
 */
export function isLikelyToExceedTokenLimit(
  prompt: string,
  maxTokens: number = 4096
): boolean {
  const estimated = estimateTokenCount(prompt);
  // Use 80% threshold to be conservative
  return estimated > (maxTokens * 0.8);
}

/**
 * Create a generation error with token estimation.
 * Convenience function for creating token limit errors.
 * 
 * @param prompt - Prompt that exceeded limit
 * @param maxTokens - Maximum allowed tokens
 * @returns GenerationError with token information
 * 
 * @example
 * ```typescript
 * if (isLikelyToExceedTokenLimit(prompt, 4096)) {
 *   throw createTokenLimitError(prompt, 4096);
 * }
 * ```
 */
export function createTokenLimitError(
  prompt: string,
  maxTokens: number = 4096
): GenerationError {
  const estimated = estimateTokenCount(prompt);
  
  return new GenerationError(
    `Prompt exceeds token limit (estimated ${estimated} tokens, max ${maxTokens})`,
    ErrorCode.ERR_GEN_TOKEN_LIMIT,
    {
      retryable: false,
      estimatedTokens: estimated,
      context: {
        component: 'GenerationService',
        metadata: {
          maxTokens,
          estimatedTokens: estimated,
        },
      },
    }
  );
}

/**
 * Create a generation error for content policy violation.
 * 
 * @param reason - Reason for policy violation
 * @returns GenerationError for content policy
 * 
 * @example
 * ```typescript
 * throw createContentPolicyError('Prompt contains restricted content');
 * ```
 */
export function createContentPolicyError(reason?: string): GenerationError {
  return new GenerationError(
    reason || 'Content violates AI usage policy',
    ErrorCode.ERR_GEN_CONTENT_POLICY,
    {
      retryable: false,
      context: {
        component: 'GenerationService',
        metadata: { reason },
      },
    }
  );
}

/**
 * Create a generation error for timeout.
 * 
 * @param timeoutMs - Timeout duration in milliseconds
 * @returns GenerationError for timeout
 * 
 * @example
 * ```typescript
 * throw createTimeoutError(60000); // 60 second timeout
 * ```
 */
export function createTimeoutError(timeoutMs: number): GenerationError {
  return new GenerationError(
    `Generation timed out after ${timeoutMs}ms`,
    ErrorCode.ERR_GEN_TIMEOUT,
    {
      retryable: true,
      context: {
        component: 'GenerationService',
        metadata: { timeoutMs },
      },
    }
  );
}

/**
 * Create a generation error for invalid response.
 * 
 * @param details - Details about the invalid response
 * @returns GenerationError for invalid response
 * 
 * @example
 * ```typescript
 * throw createInvalidResponseError('Missing content in response');
 * ```
 */
export function createInvalidResponseError(details?: string): GenerationError {
  return new GenerationError(
    details || 'Received invalid response from AI',
    ErrorCode.ERR_GEN_INVALID_RESPONSE,
    {
      retryable: true,
      context: {
        component: 'GenerationService',
        metadata: { details },
      },
    }
  );
}

