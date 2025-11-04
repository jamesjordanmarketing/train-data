/**
 * Unit Tests for Generation Error Classification
 * 
 * Tests error classification, recovery actions, and helper functions.
 */

import { describe, it, expect } from 'vitest';
import {
  GenerationErrorType,
  RecoveryAction,
  classifyGenerationError,
  ERROR_MESSAGES,
  getDetailedErrorMessage,
  estimateTokenCount,
  isLikelyToExceedTokenLimit,
  createTokenLimitError,
  createContentPolicyError,
  createTimeoutError,
  createInvalidResponseError,
} from '../errors';
import { GenerationError, ErrorCode } from '../../errors';

describe('Generation Error Classification', () => {
  describe('classifyGenerationError', () => {
    it('should classify rate limit errors', () => {
      const error = new GenerationError(
        'Rate limit exceeded',
        ErrorCode.ERR_GEN_RATE_LIMIT
      );

      const classification = classifyGenerationError(error);

      expect(classification.type).toBe(GenerationErrorType.RATE_LIMIT);
      expect(classification.action).toBe(RecoveryAction.RETRY);
      expect(classification.message).toContain('System will retry automatically');
    });

    it('should classify token limit errors with estimated tokens', () => {
      const error = new GenerationError(
        'Token limit exceeded',
        ErrorCode.ERR_GEN_TOKEN_LIMIT,
        {
          estimatedTokens: 8500,
        }
      );

      const classification = classifyGenerationError(error);

      expect(classification.type).toBe(GenerationErrorType.TOKEN_LIMIT);
      expect(classification.action).toBe(RecoveryAction.REDUCE_CONTENT);
      expect(classification.message).toContain('8500 tokens');
    });

    it('should classify token limit errors without estimated tokens', () => {
      const error = new GenerationError(
        'Token limit exceeded',
        ErrorCode.ERR_GEN_TOKEN_LIMIT
      );

      const classification = classifyGenerationError(error);

      expect(classification.type).toBe(GenerationErrorType.TOKEN_LIMIT);
      expect(classification.action).toBe(RecoveryAction.REDUCE_CONTENT);
      expect(classification.message).not.toContain('8500');
    });

    it('should classify content policy errors', () => {
      const error = new GenerationError(
        'Content policy violation',
        ErrorCode.ERR_GEN_CONTENT_POLICY
      );

      const classification = classifyGenerationError(error);

      expect(classification.type).toBe(GenerationErrorType.CONTENT_POLICY);
      expect(classification.action).toBe(RecoveryAction.MODIFY_PROMPT);
      expect(classification.message).toContain('violates AI policy');
    });

    it('should classify timeout errors', () => {
      const error = new GenerationError(
        'Generation timed out',
        ErrorCode.ERR_GEN_TIMEOUT
      );

      const classification = classifyGenerationError(error);

      expect(classification.type).toBe(GenerationErrorType.TIMEOUT);
      expect(classification.action).toBe(RecoveryAction.RETRY);
      expect(classification.message).toContain('timed out');
    });

    it('should classify invalid response errors', () => {
      const error = new GenerationError(
        'Invalid response',
        ErrorCode.ERR_GEN_INVALID_RESPONSE
      );

      const classification = classifyGenerationError(error);

      expect(classification.type).toBe(GenerationErrorType.INVALID_RESPONSE);
      expect(classification.action).toBe(RecoveryAction.RETRY);
      expect(classification.message).toContain('Invalid response');
    });

    it('should handle unknown generation errors', () => {
      const error = new GenerationError(
        'Unknown error',
        ErrorCode.ERR_DB_QUERY as any // Use wrong error code
      );

      const classification = classifyGenerationError(error);

      expect(classification.type).toBe(GenerationErrorType.SERVER_ERROR);
      expect(classification.action).toBe(RecoveryAction.CONTACT_SUPPORT);
    });

    it('should handle non-GenerationError instances', () => {
      const error = new Error('Standard error');

      const classification = classifyGenerationError(error);

      expect(classification.type).toBe(GenerationErrorType.SERVER_ERROR);
      expect(classification.action).toBe(RecoveryAction.RETRY);
      expect(classification.message).toBe('Unknown error occurred. Try again.');
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have messages for all error types', () => {
      const errorTypes = Object.values(GenerationErrorType);

      errorTypes.forEach(type => {
        expect(ERROR_MESSAGES[type]).toBeDefined();
        expect(ERROR_MESSAGES[type].length).toBeGreaterThan(0);
      });
    });

    it('should provide user-friendly messages', () => {
      expect(ERROR_MESSAGES[GenerationErrorType.RATE_LIMIT]).toContain('automatically retry');
      expect(ERROR_MESSAGES[GenerationErrorType.TOKEN_LIMIT]).toContain('too long');
      expect(ERROR_MESSAGES[GenerationErrorType.CONTENT_POLICY]).toContain('violates');
    });
  });

  describe('getDetailedErrorMessage', () => {
    it('should return base message without recovery suggestions', () => {
      const message = getDetailedErrorMessage(
        GenerationErrorType.RATE_LIMIT,
        false
      );

      expect(message).toBe(ERROR_MESSAGES[GenerationErrorType.RATE_LIMIT]);
      expect(message).not.toContain('Suggestions:');
    });

    it('should include suggestions for rate limit errors', () => {
      const message = getDetailedErrorMessage(
        GenerationErrorType.RATE_LIMIT,
        true
      );

      expect(message).toContain('Suggestions:');
      expect(message).toContain('Wait a few moments');
      expect(message).toContain('reduce batch size');
    });

    it('should include suggestions for token limit errors', () => {
      const message = getDetailedErrorMessage(
        GenerationErrorType.TOKEN_LIMIT,
        true
      );

      expect(message).toContain('Suggestions:');
      expect(message).toContain('Reduce the number of conversation turns');
      expect(message).toContain('Simplify the prompt');
    });

    it('should include suggestions for content policy errors', () => {
      const message = getDetailedErrorMessage(
        GenerationErrorType.CONTENT_POLICY,
        true
      );

      expect(message).toContain('Suggestions:');
      expect(message).toContain('Review prompt');
      expect(message).toContain('Avoid topics like violence');
    });

    it('should include suggestions for timeout errors', () => {
      const message = getDetailedErrorMessage(
        GenerationErrorType.TIMEOUT,
        true
      );

      expect(message).toContain('Suggestions:');
      expect(message).toContain('Simplify the prompt');
      expect(message).toContain('Check your internet connection');
    });

    it('should include suggestions for server errors', () => {
      const message = getDetailedErrorMessage(
        GenerationErrorType.SERVER_ERROR,
        true
      );

      expect(message).toContain('Suggestions:');
      expect(message).toContain('Wait a few minutes');
      expect(message).toContain('Claude API status');
    });
  });

  describe('estimateTokenCount', () => {
    it('should estimate token count from text', () => {
      const text = 'Hello world, this is a test prompt';
      const tokens = estimateTokenCount(text);

      // Rough estimate: ~4 chars per token
      // "Hello world, this is a test prompt" = 35 chars / 4 ≈ 9 tokens
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(20);
    });

    it('should handle empty strings', () => {
      const tokens = estimateTokenCount('');

      expect(tokens).toBe(0);
    });

    it('should handle long text', () => {
      const longText = 'test '.repeat(1000); // 5000 characters
      const tokens = estimateTokenCount(longText);

      // ~5000 chars / 4 ≈ 1250 tokens
      expect(tokens).toBeGreaterThan(1000);
      expect(tokens).toBeLessThan(1500);
    });
  });

  describe('isLikelyToExceedTokenLimit', () => {
    it('should return false for short prompts', () => {
      const shortPrompt = 'Generate a short conversation';
      
      const result = isLikelyToExceedTokenLimit(shortPrompt, 4096);

      expect(result).toBe(false);
    });

    it('should return true for very long prompts', () => {
      // Create a prompt with ~20,000 characters (≈5000 tokens)
      const longPrompt = 'test '.repeat(4000);
      
      const result = isLikelyToExceedTokenLimit(longPrompt, 4096);

      expect(result).toBe(true);
    });

    it('should use 80% threshold for safety', () => {
      // Create prompt at exactly 80% of limit
      // 4096 * 0.8 = 3276.8 tokens ≈ 13,107 chars
      const prompt = 'a'.repeat(13107);
      
      const result = isLikelyToExceedTokenLimit(prompt, 4096);

      expect(result).toBe(true);
    });

    it('should use custom max tokens', () => {
      const prompt = 'test '.repeat(1000); // ~1250 tokens
      
      const result = isLikelyToExceedTokenLimit(prompt, 1000);

      expect(result).toBe(true);
    });
  });

  describe('createTokenLimitError', () => {
    it('should create error with token estimation', () => {
      const prompt = 'test '.repeat(2000); // ~2500 tokens
      
      const error = createTokenLimitError(prompt, 4096);

      expect(error).toBeInstanceOf(GenerationError);
      expect(error.code).toBe(ErrorCode.ERR_GEN_TOKEN_LIMIT);
      expect(error.estimatedTokens).toBeGreaterThan(0);
      expect(error.retryable).toBe(false);
      expect(error.message).toContain('estimated');
      expect(error.message).toContain('4096');
    });

    it('should use default max tokens', () => {
      const prompt = 'test';
      
      const error = createTokenLimitError(prompt);

      expect(error.message).toContain('4096');
    });
  });

  describe('createContentPolicyError', () => {
    it('should create error with reason', () => {
      const error = createContentPolicyError('Contains restricted content');

      expect(error).toBeInstanceOf(GenerationError);
      expect(error.code).toBe(ErrorCode.ERR_GEN_CONTENT_POLICY);
      expect(error.retryable).toBe(false);
      expect(error.message).toContain('restricted content');
    });

    it('should use default message without reason', () => {
      const error = createContentPolicyError();

      expect(error.message).toContain('violates AI usage policy');
    });
  });

  describe('createTimeoutError', () => {
    it('should create error with timeout duration', () => {
      const error = createTimeoutError(60000);

      expect(error).toBeInstanceOf(GenerationError);
      expect(error.code).toBe(ErrorCode.ERR_GEN_TIMEOUT);
      expect(error.retryable).toBe(true);
      expect(error.message).toContain('60000ms');
    });
  });

  describe('createInvalidResponseError', () => {
    it('should create error with details', () => {
      const error = createInvalidResponseError('Missing content field');

      expect(error).toBeInstanceOf(GenerationError);
      expect(error.code).toBe(ErrorCode.ERR_GEN_INVALID_RESPONSE);
      expect(error.retryable).toBe(true);
      expect(error.message).toContain('Missing content field');
    });

    it('should use default message without details', () => {
      const error = createInvalidResponseError();

      expect(error.message).toContain('invalid response');
    });
  });
});

