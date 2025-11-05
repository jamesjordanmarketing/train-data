/**
 * Conversation Generation Service
 * 
 * Main orchestration service for AI conversation generation.
 * Integrates template resolution, Claude API calls, quality validation,
 * and database persistence into a cohesive workflow.
 * 
 * Features:
 * - End-to-end conversation generation
 * - Template resolution with parameter injection
 * - Claude API integration with rate limiting
 * - Automated quality validation
 * - Database persistence
 * - Comprehensive logging
 * 
 * @module conversation-generation-service
 */

import { randomUUID } from 'crypto';
import { ClaudeAPIClient, getClaudeAPIClient } from './claude-api-client';
import { TemplateResolver, getTemplateResolver } from './template-resolver';
import { QualityValidator, getQualityValidator } from './quality-validator';
import { conversationService } from './conversation-service';
import { generationLogService } from './generation-log-service';
import type {
  Conversation,
  ConversationTurn,
  ConversationStatus,
  TierType,
} from '../../../@/lib/types';

/**
 * Parameters for conversation generation
 */
export interface GenerationParams {
  /** Template ID to use */
  templateId: string;

  /** Template parameters (e.g., persona, emotion, topic) */
  parameters: Record<string, any>;

  /** Tier level */
  tier: TierType;

  /** Optional conversation ID (for regeneration) */
  conversationId?: string;

  /** User ID performing the generation */
  userId: string;

  /** Optional run/batch ID */
  runId?: string;

  /** Optional category tags */
  category?: string[];

  /** Optional override for model temperature */
  temperature?: number;

  /** Optional override for max tokens */
  maxTokens?: number;
}

/**
 * Result of conversation generation
 */
export interface GenerationResult {
  /** Generated conversation */
  conversation: Conversation;

  /** Whether generation was successful */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Quality validation details */
  qualityDetails?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };

  /** Performance metrics */
  metrics: {
    durationMs: number;
    cost: number;
    totalTokens: number;
  };
}

/**
 * Conversation Generation Service
 * 
 * Orchestrates the complete conversation generation workflow:
 * 1. Template resolution
 * 2. Claude API call
 * 3. Response parsing
 * 4. Quality validation
 * 5. Database persistence
 */
export class ConversationGenerationService {
  private claudeClient: ClaudeAPIClient;
  private templateResolver: TemplateResolver;
  private qualityValidator: QualityValidator;

  constructor(
    claudeClient?: ClaudeAPIClient,
    templateResolver?: TemplateResolver,
    qualityValidator?: QualityValidator
  ) {
    this.claudeClient = claudeClient || getClaudeAPIClient();
    this.templateResolver = templateResolver || getTemplateResolver();
    this.qualityValidator = qualityValidator || getQualityValidator();
  }

  /**
   * Generate a single conversation
   * 
   * @param params - Generation parameters
   * @returns Generation result with conversation and metrics
   * 
   * @example
   * ```typescript
   * const service = new ConversationGenerationService();
   * const result = await service.generateSingleConversation({
   *   templateId: 'template-123',
   *   parameters: {
   *     persona: 'Anxious Investor',
   *     emotion: 'Worried',
   *     topic: 'Market Volatility',
   *     intent: 'seek_reassurance',
   *     tone: 'concerned'
   *   },
   *   tier: 'template',
   *   userId: 'user-456'
   * });
   * 
   * if (result.success) {
   *   console.log('Generated:', result.conversation.id);
   *   console.log('Quality:', result.conversation.qualityScore);
   * }
   * ```
   */
  async generateSingleConversation(
    params: GenerationParams
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const generationId = randomUUID();

    console.log(`[${generationId}] Starting conversation generation`);
    console.log(`[${generationId}] Template: ${params.templateId}`);
    console.log(`[${generationId}] Parameters:`, params.parameters);

    try {
      // Step 1: Resolve template with parameters
      console.log(`[${generationId}] Step 1: Resolving template...`);
      const resolvedTemplate = await this.templateResolver.resolveTemplate({
        templateId: params.templateId,
        parameters: params.parameters,
        userId: params.userId,
      });

      if (!resolvedTemplate.success) {
        throw new Error(
          `Template resolution failed: ${resolvedTemplate.errors.join(', ')}`
        );
      }

      console.log(
        `[${generationId}] ✓ Template resolved (${resolvedTemplate.resolvedPrompt.length} chars)`
      );

      // Step 2: Generate conversation via Claude API
      console.log(`[${generationId}] Step 2: Calling Claude API...`);
      const apiResponse = await this.claudeClient.generateConversation(
        resolvedTemplate.resolvedPrompt,
        {
          conversationId: params.conversationId || generationId,
          templateId: params.templateId,
          temperature: params.temperature,
          maxTokens: params.maxTokens,
          userId: params.userId,
          runId: params.runId,
        }
      );

      console.log(
        `[${generationId}] ✓ API response received (${apiResponse.usage.output_tokens} tokens, $${apiResponse.cost.toFixed(4)})`
      );

      // Step 3: Parse Claude response
      console.log(`[${generationId}] Step 3: Parsing response...`);
      const parsedConversation = this.parseClaudeResponse(
        apiResponse.content,
        params,
        resolvedTemplate.template
      );

      console.log(
        `[${generationId}] ✓ Parsed ${parsedConversation.turns.length} turns`
      );

      // Step 4: Validate quality
      console.log(`[${generationId}] Step 4: Validating quality...`);
      const qualityResult = this.qualityValidator.validateConversation({
        turns: parsedConversation.turns,
        parameters: params.parameters,
      });

      const qualityScore = qualityResult.qualityMetrics.overall;
      console.log(
        `[${generationId}] ✓ Quality score: ${qualityScore}/10 (${qualityResult.qualityMetrics.confidence} confidence)`
      );

      if (qualityResult.issues.length > 0) {
        console.log(
          `[${generationId}] Issues: ${qualityResult.issues.join('; ')}`
        );
      }

      // Step 5: Determine status based on quality
      const status: ConversationStatus = this.determineStatus(
        qualityScore,
        resolvedTemplate.template.qualityThreshold || 7
      );

      console.log(`[${generationId}] Status: ${status}`);

      // Step 6: Build complete conversation object
      const conversation: Conversation = {
        id: '', // Will be assigned by database
        title:
          parsedConversation.title ||
          this.generateTitle(params.parameters),
        persona: params.parameters.persona || 'Unknown',
        emotion: params.parameters.emotion || 'Neutral',
        tier: params.tier,
        category: params.category || [],
        status,
        qualityScore,
        qualityMetrics: qualityResult.qualityMetrics,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: params.userId,
        turns: parsedConversation.turns,
        totalTurns: parsedConversation.turns.length,
        totalTokens:
          apiResponse.usage.input_tokens + apiResponse.usage.output_tokens,
        parentId: params.templateId,
        parentType: 'template',
        parameters: params.parameters,
        reviewHistory: [
          {
            id: randomUUID(),
            action: 'generated',
            performedBy: params.userId,
            timestamp: new Date().toISOString(),
            comment: `Generated with quality score ${qualityScore}/10`,
          },
        ],
      };

      // Step 7: Save to database
      console.log(`[${generationId}] Step 5: Saving to database...`);
      const savedConversation = await conversationService.create(
        conversation,
        conversation.turns
      );

      console.log(`[${generationId}] ✓ Saved as ${savedConversation.id}`);

      const durationMs = Date.now() - startTime;

      console.log(
        `[${generationId}] ✅ Generation complete (${durationMs}ms, $${apiResponse.cost.toFixed(4)})`
      );

      return {
        conversation: savedConversation,
        success: true,
        qualityDetails: {
          score: qualityScore,
          issues: qualityResult.issues,
          suggestions: qualityResult.suggestions,
        },
        metrics: {
          durationMs,
          cost: apiResponse.cost,
          totalTokens:
            apiResponse.usage.input_tokens + apiResponse.usage.output_tokens,
        },
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error(
        `[${generationId}] ❌ Generation failed: ${errorMessage}`
      );

      // Return error result
      return {
        conversation: {} as Conversation, // Empty conversation on error
        success: false,
        error: errorMessage,
        metrics: {
          durationMs,
          cost: 0,
          totalTokens: 0,
        },
      };
    }
  }

  /**
   * Parse Claude API response into conversation structure
   * @private
   */
  private parseClaudeResponse(
    content: string,
    params: GenerationParams,
    template: any
  ): { title: string; turns: ConversationTurn[] } {
    try {
      // Claude should return JSON with conversation structure
      const parsed = JSON.parse(content);

      // Validate structure
      if (!parsed.turns || !Array.isArray(parsed.turns)) {
        throw new Error('Invalid response structure: missing turns array');
      }

      // Map turns to ConversationTurn format
      const turns: ConversationTurn[] = parsed.turns.map(
        (turn: any, index: number) => {
          if (!turn.role || !turn.content) {
            throw new Error(
              `Invalid turn structure at index ${index}: missing role or content`
            );
          }

          return {
            role: turn.role,
            content: turn.content,
            timestamp: new Date().toISOString(),
            tokenCount: ClaudeAPIClient.estimateTokens(turn.content),
          };
        }
      );

      return {
        title: parsed.title || this.generateTitle(params.parameters),
        turns,
      };
    } catch (error) {
      console.error('Error parsing Claude response:', error);

      // If JSON parsing fails, try to extract as plain text
      if (content.includes('user:') || content.includes('assistant:')) {
        return this.parseAsPlainText(content, params);
      }

      throw new Error(
        `Failed to parse Claude response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse plain text response as fallback
   * @private
   */
  private parseAsPlainText(
    content: string,
    params: GenerationParams
  ): { title: string; turns: ConversationTurn[] } {
    const turns: ConversationTurn[] = [];
    const lines = content.split('\n').filter(line => line.trim());

    let currentRole: 'user' | 'assistant' = 'user';
    let currentContent = '';

    for (const line of lines) {
      if (line.toLowerCase().startsWith('user:')) {
        if (currentContent) {
          turns.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: new Date().toISOString(),
            tokenCount: ClaudeAPIClient.estimateTokens(currentContent),
          });
        }
        currentRole = 'user';
        currentContent = line.substring(5).trim();
      } else if (line.toLowerCase().startsWith('assistant:')) {
        if (currentContent) {
          turns.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: new Date().toISOString(),
            tokenCount: ClaudeAPIClient.estimateTokens(currentContent),
          });
        }
        currentRole = 'assistant';
        currentContent = line.substring(10).trim();
      } else {
        currentContent += ' ' + line;
      }
    }

    // Add last turn
    if (currentContent) {
      turns.push({
        role: currentRole,
        content: currentContent.trim(),
        timestamp: new Date().toISOString(),
        tokenCount: ClaudeAPIClient.estimateTokens(currentContent),
      });
    }

    return {
      title: this.generateTitle(params.parameters),
      turns,
    };
  }

  /**
   * Generate conversation title from parameters
   * @private
   */
  private generateTitle(parameters: Record<string, any>): string {
    const persona = parameters.persona || 'User';
    const topic = parameters.topic || 'General Discussion';
    const emotion = parameters.emotion;

    if (emotion) {
      return `${persona} - ${topic} (${emotion})`;
    }

    return `${persona} - ${topic}`;
  }

  /**
   * Determine conversation status based on quality score
   * @private
   */
  private determineStatus(
    qualityScore: number,
    qualityThreshold: number
  ): ConversationStatus {
    if (qualityScore >= qualityThreshold) {
      return 'generated';
    } else if (qualityScore >= qualityThreshold - 2) {
      return 'pending_review';
    } else {
      return 'needs_revision';
    }
  }

  /**
   * Get rate limit status from Claude client
   */
  getRateLimitStatus() {
    return this.claudeClient.getRateLimitStatus();
  }

  /**
   * Get rate limiter metrics
   */
  getRateLimiterMetrics() {
    return this.claudeClient.getRateLimiterMetrics();
  }
}

/**
 * Singleton instance for convenience
 */
let serviceInstance: ConversationGenerationService | null = null;

/**
 * Get or create singleton conversation generation service
 */
export function getConversationGenerationService(): ConversationGenerationService {
  if (!serviceInstance) {
    serviceInstance = new ConversationGenerationService();
  }
  return serviceInstance;
}

/**
 * Reset singleton instance (useful for testing)
 */
export function resetConversationGenerationService(): void {
  serviceInstance = null;
}

