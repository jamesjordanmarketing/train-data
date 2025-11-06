/**
 * Conversation Generator
 * 
 * Core generation engine that integrates rate limiting, retry logic,
 * Claude API calls, quality scoring, and database persistence
 */

import { RateLimiter } from './rate-limiter';
import { RetryManager } from './retry-manager';
import { ConversationService } from './conversation-service';
import { GenerationLogService } from './generation-log-service';
import { templateService } from './template-service';
import {
  GeneratorConfig,
  GenerationParams,
  ClaudeResponse,
  ParsedConversation,
  GeneratedConversation,
  BatchOptions,
  BatchResult,
  BatchItemResult,
  ClaudeAPIError,
  ParseError,
  GenerationValidationError,
  calculateCost,
  estimateTokens,
} from './types/generation';
import { qualityScorer, generateRecommendations, evaluateAndFlag } from './quality';
import { chunksService, dimensionParser } from './generation/chunks-integration';
import { promptContextBuilder } from './generation/prompt-context-builder';
import { dimensionParameterMapper } from './generation/dimension-parameter-mapper';
import type { DimensionSource } from './generation/types';

export class ConversationGenerator {
  private rateLimiter: RateLimiter;
  private retryManager: RetryManager;
  private conversationService: ConversationService;
  private generationLogService: GenerationLogService;
  private templateService: typeof templateService;
  private apiKey: string;
  private apiUrl: string;
  private defaultModel: string;

  constructor(config: GeneratorConfig) {
    this.rateLimiter = new RateLimiter(config.rateLimitConfig);
    this.retryManager = new RetryManager();
    this.conversationService = new ConversationService();
    this.generationLogService = new GenerationLogService();
    this.templateService = templateService;
    
    // API configuration
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.apiUrl = config.apiUrl || process.env.ANTHROPIC_API_BASE_URL || 'https://api.anthropic.com/v1';
    this.defaultModel = config.defaultModel || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    if (!this.apiKey) {
      console.warn('⚠️  ANTHROPIC_API_KEY not configured');
    }
  }

  /**
   * Generate a single conversation
   * 
   * @param params - Generation parameters
   * @returns Generated conversation with metadata
   */
  async generateSingle(params: GenerationParams): Promise<GeneratedConversation> {
    const startTime = Date.now();
    
    try {
      console.log(`🎯 Generating conversation: ${params.persona} - ${params.emotion} - ${params.topic}`);
      
      // 1. Acquire rate limit slot
      await this.rateLimiter.acquire();
      console.log(`✅ Rate limit slot acquired`);
      
      // 2. Check for chunk association and inject context
      let chunkContext: any = null;
      let dimensionSource: DimensionSource | null = null;
      let enrichedPrompt: string | null = null;
      
      if (params.chunkId) {
        console.log(`🔗 Chunk association detected: ${params.chunkId}`);
        
        // Fetch chunk and dimensions
        const chunkData = await chunksService.getChunkWithDimensions(params.chunkId);
        
        if (chunkData) {
          const { chunk, dimensions } = chunkData;
          chunkContext = chunk;
          dimensionSource = dimensions;
          
          console.log(`✅ Chunk loaded: ${chunk.chunkType} (${chunk.tokenCount} tokens)`);
          
          if (dimensions) {
            console.log(`✅ Dimensions loaded: ${dimensionParser.getSummary(dimensions)}`);
            
            // Auto-populate parameters from dimensions if not explicitly set
            if (!params.parameters?.explicitParams) {
              const suggestions = dimensionParameterMapper.mapDimensionsToParameters(dimensions);
              
              // Override params with dimension-driven suggestions
              params.persona = params.persona || suggestions.persona || params.persona;
              params.emotion = params.emotion || suggestions.emotion || params.emotion;
              params.parameters = {
                ...params.parameters,
                targetTurns: suggestions.targetTurns,
                categories: [...(params.parameters?.categories || []), ...suggestions.categories],
                dimensionConfidence: dimensions.confidence,
                complexity: suggestions.complexity,
              };
              
              // Adjust temperature based on dimensions
              if (!params.temperature) {
                params.temperature = dimensionParameterMapper.suggestTemperature(dimensions);
              }
              
              // Adjust max tokens based on complexity
              if (!params.maxTokens) {
                params.maxTokens = dimensionParameterMapper.suggestMaxTokens(dimensions, suggestions.targetTurns);
              }
              
              console.log(`✅ Parameters auto-populated from dimensions:`);
              console.log(dimensionParameterMapper.explainMapping(dimensions, suggestions));
            }
          }
        } else {
          console.warn(`⚠️  Chunk ${params.chunkId} not found or has no dimensions`);
        }
      }
      
      // 3. Resolve template with parameters
      let basePrompt = await this.templateService.resolveTemplate(
        params.templateId,
        {
          persona: params.persona,
          emotion: params.emotion,
          topic: params.topic,
          ...params.parameters,
        }
      );
      console.log(`✅ Template resolved (${basePrompt.length} chars)`);
      
      // 4. Inject chunk context into prompt if available
      let prompt = basePrompt;
      if (chunkContext && dimensionSource) {
        prompt = promptContextBuilder.buildPrompt(basePrompt, chunkContext, dimensionSource);
        console.log(`✅ Chunk context injected (${prompt.length} chars total)`);
      }
      
      // 5. Call Claude API with retry logic
      const retryConfig = {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 300000, // 5 minutes
        onRetry: (attempt: number, error: Error) => {
          console.log(`🔄 Retry attempt ${attempt}: ${error.message}`);
        },
      };
      
      const response = await this.retryManager.executeWithRetry(
        () => this.callClaudeAPI(prompt, params),
        retryConfig
      );
      console.log(`✅ Claude API call successful (${response.duration}ms)`);
      
      // 6. Parse and validate response
      const conversation = this.parseResponse(response, params);
      console.log(`✅ Response parsed (${conversation.totalTurns} turns)`);
      
      // 7. Calculate comprehensive quality score (with dimension confidence)
      const qualityScoreResult = qualityScorer.calculateScore(
        {
          turns: conversation.turns,
          totalTurns: conversation.totalTurns,
          totalTokens: conversation.totalTokens,
          tier: params.tier,
        },
        dimensionSource // Pass dimension source for confidence weighting
      );
      
      // Generate recommendations
      qualityScoreResult.recommendations = generateRecommendations(qualityScoreResult);
      
      console.log(`✅ Quality score: ${qualityScoreResult.overall}/10 ${qualityScoreResult.autoFlagged ? '(Flagged)' : ''}`);
      
      // 8. Calculate cost
      const cost = calculateCost(
        response.inputTokens,
        response.outputTokens,
        response.model
      );
      
      // 9. Save conversation and turns (with chunk context)
      const status = qualityScoreResult.overall >= 6 ? 'generated' : 'needs_revision';
      const saved = await this.conversationService.create({
        title: conversation.title,
        persona: params.persona,
        emotion: params.emotion,
        topic: params.topic,
        tier: params.tier,
        status,
        qualityScore: qualityScoreResult.overall,
        qualityMetrics: {
          overall: qualityScoreResult.overall,
          relevance: qualityScoreResult.breakdown.turnCount.score,
          accuracy: qualityScoreResult.breakdown.length.score,
          naturalness: qualityScoreResult.breakdown.structure.score,
          methodology: qualityScoreResult.breakdown.confidence.score,
          coherence: qualityScoreResult.breakdown.confidence.score,
          confidence: qualityScoreResult.breakdown.confidence.level,
          uniqueness: 7.5, // Default value
          trainingValue: qualityScoreResult.overall >= 8 ? 'high' : qualityScoreResult.overall >= 6 ? 'medium' : 'low',
        },
        confidenceLevel: qualityScoreResult.breakdown.confidence.level,
        turnCount: conversation.totalTurns,
        totalTokens: conversation.totalTokens,
        actualCostUsd: cost,
        generationDurationMs: response.duration,
        parameters: {
          ...params.parameters,
          // Store chunk and dimension metadata
          chunkId: params.chunkId,
          dimensionConfidence: dimensionSource?.confidence,
          dimensionRunId: dimensionSource?.runId,
        },
        documentId: params.documentId,
        chunkId: params.chunkId,
        createdBy: params.createdBy,
        parentId: params.templateId,
        parentType: 'template',
      } as any);
      
      // 10. Save conversation turns
      await this.conversationService.bulkCreateTurns(
        saved.id,
        conversation.turns.map((turn) => ({
          turnNumber: turn.turnNumber,
          role: turn.role,
          content: turn.content,
          tokenCount: turn.tokenCount,
          charCount: turn.content.length,
        }))
      );
      console.log(`✅ Conversation saved (ID: ${saved.id})`);
      
      // 11. Auto-flag if quality is below threshold
      if (qualityScoreResult.autoFlagged) {
        try {
          await evaluateAndFlag(saved.id, qualityScoreResult);
          console.log(`🚩 Auto-flagged conversation due to low quality score`);
        } catch (error) {
          console.error('Failed to auto-flag conversation:', error);
          // Continue even if flagging fails
        }
      }
      
      // 12. Log generation details (including chunk and dimension usage)
      await this.logGeneration(params, response, saved, cost, qualityScoreResult, dimensionSource, chunkContext);
      
      // 13. Increment template usage
      await this.templateService.incrementUsageCount(params.templateId);
      
      const totalDuration = Date.now() - startTime;
      console.log(`🎉 Generation complete in ${totalDuration}ms (cost: $${cost.toFixed(4)})`);
      
      return {
        ...conversation,
        id: saved.id,
        conversationId: saved.conversationId || saved.id,
        qualityScore: qualityScoreResult.overall,
        // Note: qualityBreakdown and recommendations are not part of GeneratedConversation type
        // They are stored in the database but not returned in the API response
        status,
        actualCostUsd: cost,
        generationDurationMs: response.duration,
        createdAt: saved.createdAt,
      };
      
    } catch (error) {
      console.error('❌ Generation failed:', error);
      
      // Log the failure
      await this.logFailure(params, error as Error);
      
      throw error;
    }
  }

  /**
   * Generate multiple conversations in batch
   * 
   * @param requests - Array of generation parameters
   * @param options - Batch options
   * @returns Batch result with all conversations
   */
  async generateBatch(
    requests: GenerationParams[],
    options: BatchOptions = {}
  ): Promise<BatchResult> {
    const startTime = Date.now();
    const concurrency = options.concurrency || 3;
    const results: BatchItemResult[] = [];
    let totalCost = 0;
    
    console.log(`🚀 Starting batch generation: ${requests.length} conversations, concurrency: ${concurrency}`);
    
    // Process in batches with controlled concurrency
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchPromises = batch.map(async (params) => {
        try {
          const result = await this.generateSingle(params);
          totalCost += result.actualCostUsd;
          return { success: true, data: result, params };
        } catch (error) {
          return { success: false, error: error as Error, params };
        }
      });
      
      // Wait for batch to complete
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process results
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason,
            params: batch[results.length % batch.length],
          });
        }
      }
      
      // Update progress
      if (options.onProgress) {
        const completed = results.length;
        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;
        const percentage = (completed / requests.length) * 100;
        
        // Estimate time remaining
        const elapsed = Date.now() - startTime;
        const avgTimePerItem = elapsed / completed;
        const remaining = requests.length - completed;
        const estimatedTimeRemaining = Math.ceil(avgTimePerItem * remaining);
        
        options.onProgress({
          completed,
          total: requests.length,
          percentage,
          successful,
          failed,
          estimatedTimeRemaining,
        });
      }
      
      // Stop on error if requested
      if (options.stopOnError && results.some((r) => !r.success)) {
        console.log('⚠️  Stopping batch due to error');
        break;
      }
    }
    
    const totalDuration = Date.now() - startTime;
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    
    console.log(`✅ Batch complete: ${successful} successful, ${failed} failed, $${totalCost.toFixed(2)}, ${totalDuration}ms`);
    
    return {
      total: requests.length,
      successful,
      failed,
      results,
      totalCost,
      totalDuration,
      runId: options.runId,
    };
  }

  /**
   * Call Claude API
   * 
   * @param prompt - Prompt text
   * @param params - Generation parameters
   * @returns Claude API response
   */
  private async callClaudeAPI(
    prompt: string,
    params: GenerationParams
  ): Promise<ClaudeResponse> {
    const startTime = Date.now();
    
    try {
      const model = this.defaultModel;
      const maxTokens = params.maxTokens || 2048;
      const temperature = params.temperature !== undefined ? params.temperature : 0.7;
      
      const response = await fetch(`${this.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          messages: [
            { role: 'user', content: prompt },
          ],
        }),
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ClaudeAPIError(
          response.status,
          errorData,
          errorData.error?.message || `HTTP ${response.status}`
        );
      }
      
      const data = await response.json();
      
      return {
        content: data.content[0].text,
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
        duration,
        model: data.model,
        stopReason: data.stop_reason,
      };
      
    } catch (error) {
      if (error instanceof ClaudeAPIError) {
        throw error;
      }
      
      // Wrap other errors
      if (error instanceof Error) {
        throw new ClaudeAPIError(500, { message: error.message }, error.message);
      }
      
      throw new ClaudeAPIError(500, {}, 'Unknown error');
    }
  }

  /**
   * Parse Claude API response
   * 
   * @param response - Claude API response
   * @param params - Generation parameters
   * @returns Parsed conversation
   */
  private parseResponse(
    response: ClaudeResponse,
    params: GenerationParams
  ): ParsedConversation {
    try {
      // Extract JSON from response content
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new ParseError('No JSON found in response', response.content);
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!parsed.turns || !Array.isArray(parsed.turns)) {
        throw new GenerationValidationError('Invalid conversation structure: missing turns array', {
          parsed,
        });
      }
      
      if (parsed.turns.length === 0) {
        throw new GenerationValidationError('Invalid conversation: no turns generated');
      }
      
      // Extract turns
      const turns = parsed.turns.map((turn: any, index: number) => {
        if (!turn.role || !turn.content) {
          throw new GenerationValidationError(
            `Invalid turn at index ${index}: missing role or content`,
            { turn, index }
          );
        }
        
        return {
          role: turn.role as 'user' | 'assistant',
          content: turn.content,
          turnNumber: index + 1,
          tokenCount: estimateTokens(turn.content),
        };
      });
      
      // Validate role alternation
      for (let i = 0; i < turns.length; i++) {
        if (i === 0 && turns[i].role !== 'user') {
          throw new GenerationValidationError('First turn must be from user');
        }
        if (i > 0 && turns[i].role === turns[i - 1].role) {
          throw new GenerationValidationError(
            `Invalid role sequence at turn ${i + 1}: consecutive ${turns[i].role} turns`
          );
        }
      }
      
      const totalTokens = response.inputTokens + response.outputTokens;
      
      return {
        title: parsed.title || `${params.persona} - ${params.emotion} - ${params.topic}`,
        persona: params.persona,
        emotion: params.emotion,
        tier: params.tier,
        topic: params.topic,
        turns,
        totalTurns: turns.length,
        totalTokens,
        parameters: params.parameters,
      };
      
    } catch (error) {
      if (error instanceof ParseError || error instanceof GenerationValidationError) {
        throw error;
      }
      
      throw new ParseError(
        `Failed to parse response: ${(error as Error).message}`,
        response.content
      );
    }
  }

  /**
   * Calculate quality score for conversation
   * 
   * @param conversation - Parsed conversation
   * @returns Quality score (1-10)
   */
  private calculateQualityScore(conversation: ParsedConversation): number {
    let score = 0;
    
    // Turn count (optimal: 8-16)
    if (conversation.totalTurns >= 8 && conversation.totalTurns <= 16) {
      score += 3;
    } else if (conversation.totalTurns >= 6 && conversation.totalTurns <= 20) {
      score += 2;
    } else if (conversation.totalTurns >= 4) {
      score += 1;
    }
    
    // Average turn length (optimal: 100-400 chars)
    const avgLength =
      conversation.turns.reduce((sum, t) => sum + t.content.length, 0) /
      conversation.totalTurns;
    
    if (avgLength >= 100 && avgLength <= 400) {
      score += 3;
    } else if (avgLength >= 50 && avgLength <= 600) {
      score += 2;
    } else if (avgLength >= 20) {
      score += 1;
    }
    
    // Structure validation (proper role alternation)
    const validStructure = conversation.turns.every((turn, i) => {
      if (i === 0) return turn.role === 'user';
      return turn.role !== conversation.turns[i - 1].role;
    });
    score += validStructure ? 4 : 0;
    
    return Math.min(score, 10);
  }

  /**
   * Log successful generation
   * 
   * @param params - Generation parameters
   * @param response - Claude API response
   * @param conversation - Saved conversation
   * @param cost - Generation cost
   * @param qualityScore - Quality score result
   * @param dimensionSource - Dimension data (if chunk-based)
   * @param chunkContext - Chunk reference (if chunk-based)
   */
  private async logGeneration(
    params: GenerationParams,
    response: ClaudeResponse,
    conversation: any,
    cost: number,
    qualityScore?: any,
    dimensionSource?: DimensionSource | null,
    chunkContext?: any
  ): Promise<void> {
    try {
      await this.generationLogService.create({
        conversationId: conversation.id,
        templateId: params.templateId,
        modelUsed: response.model,
        requestPayload: {
          prompt: '[REDACTED]',
          parameters: params.parameters,
          chunkId: params.chunkId,
          hasChunkContext: !!chunkContext,
          hasDimensions: !!dimensionSource,
        },
        responsePayload: {
          content: '[REDACTED]',
          stopReason: response.stopReason,
        },
        parameters: {
          ...params.parameters,
          // Log chunk and dimension usage for audit trail
          chunkId: params.chunkId,
          chunkType: chunkContext?.chunkType,
          dimensionConfidence: dimensionSource?.confidence,
          dimensionRunId: dimensionSource?.runId,
          dimensionDriven: !!dimensionSource,
        },
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        costUsd: cost,
        durationMs: response.duration,
        status: 'success',
        createdBy: params.createdBy,
      });
    } catch (error) {
      console.error('Failed to log generation (non-blocking):', error);
    }
  }

  /**
   * Log generation failure
   * 
   * @param params - Generation parameters
   * @param error - Error that occurred
   */
  private async logFailure(
    params: GenerationParams,
    error: Error
  ): Promise<void> {
    try {
      await this.generationLogService.create({
        conversationId: null as any, // No conversation created
        templateId: params.templateId,
        modelUsed: this.defaultModel,
        requestPayload: {
          prompt: '[REDACTED]',
          parameters: params.parameters,
        },
        responsePayload: null as any,
        parameters: params.parameters,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        durationMs: 0,
        status: 'failed',
        errorMessage: error.message,
        errorCode: error.name,
        createdBy: params.createdBy,
      });
    } catch (logError) {
      console.error('Failed to log failure (non-blocking):', logError);
    }
  }

  /**
   * Get rate limiter status
   * 
   * @returns Current rate limit status
   */
  getRateLimitStatus() {
    return this.rateLimiter.getStatus();
  }

  /**
   * Reset rate limiter
   */
  resetRateLimiter() {
    this.rateLimiter.reset();
  }
}

