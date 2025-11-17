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
import { ConversationStorageService } from './conversation-storage-service';
import { conversationService } from './conversation-service';
import { generationLogService } from './generation-log-service';
import type {
  Conversation,
  ConversationTurn,
  ConversationStatus,
  TierType,
} from '@/lib/types';

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
  private storageService: ConversationStorageService;

  constructor(
    claudeClient?: ClaudeAPIClient,
    templateResolver?: TemplateResolver,
    qualityValidator?: QualityValidator,
    storageService?: ConversationStorageService
  ) {
    this.claudeClient = claudeClient || getClaudeAPIClient();
    this.templateResolver = templateResolver || getTemplateResolver();
    this.qualityValidator = qualityValidator || getQualityValidator();
    this.storageService = storageService || new ConversationStorageService();
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
          useStructuredOutputs: true, // Enable structured outputs for guaranteed valid JSON
        }
      );

      console.log(
        `[${generationId}] ✓ API response received (${apiResponse.usage.output_tokens} tokens, $${apiResponse.cost.toFixed(4)})`
      );

      // TIER 2: Store raw response BEFORE any parsing (NEW)
      console.log(`[${generationId}] Step 3: Storing raw response...`);
      const rawStorageResult = await this.storageService.storeRawResponse({
        conversationId: generationId,
        rawResponse: apiResponse.content,
        userId: params.userId,
        metadata: {
          templateId: params.templateId,
          tier: params.tier,
          personaId: params.parameters?.persona_id,
          emotionalArcId: params.parameters?.emotional_arc_id,
          trainingTopicId: params.parameters?.training_topic_id,
        },
      });

      if (!rawStorageResult.success) {
        console.error(`[${generationId}] ❌ Failed to store raw response:`, rawStorageResult.error);
        // Don't throw - continue to parse attempt
      }

      console.log(`[${generationId}] ✅ Raw response stored at ${rawStorageResult.rawPath}`);

      // TIER 3: Parse and store final version (NEW)
      console.log(`[${generationId}] Step 4: Parsing and storing final version...`);
      const parseResult = await this.storageService.parseAndStoreFinal({
        conversationId: generationId,
        rawResponse: apiResponse.content,  // Pass raw response (already have it)
        userId: params.userId,
      });

      if (!parseResult.success) {
        console.warn(`[${generationId}] ⚠️  Parse failed, but raw response is saved`);
        console.warn(`[${generationId}] Error: ${parseResult.error}`);
        console.warn(`[${generationId}] Conversation marked for manual review`);
        
        // Return partial success - raw data is saved, parse failed
        const durationMs = Date.now() - startTime;
        return {
          conversation: {
            id: generationId,
            status: 'pending_review',
            processing_status: 'parse_failed',
            conversation_id: generationId,
          } as any,
          success: false,
          error: `Parse failed: ${parseResult.error}. Raw response saved for retry.`,
          metrics: {
            durationMs,
            cost: apiResponse.cost,
            totalTokens: apiResponse.usage.input_tokens + apiResponse.usage.output_tokens,
          },
        };
      }

      console.log(`[${generationId}] ✅ Final conversation stored (method: ${parseResult.parseMethod})`);

      // Step 5: Return success result
      const durationMs = Date.now() - startTime;

      return {
        conversation: parseResult.conversation,
        success: true,
        metrics: {
          durationMs,
          cost: apiResponse.cost,
          totalTokens: apiResponse.usage.input_tokens + apiResponse.usage.output_tokens,
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
      // Log original content length for diagnostics
      console.log(`[parseClaudeResponse] Original content length: ${content.length} chars`);
      
      // STAGE 1: Strip markdown code fences
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```')) {
        console.log('[parseClaudeResponse] Removing markdown code fences');
        cleanedContent = cleanedContent.replace(/^```(?:json)?\s*\n?/, '');
        cleanedContent = cleanedContent.replace(/\n?```\s*$/, '');
        cleanedContent = cleanedContent.trim();
      }

      // STAGE 2: Apply multi-stage JSON repair pipeline
      console.log('[parseClaudeResponse] Applying JSON repair pipeline');
      cleanedContent = this.repairJSON(cleanedContent);

      // STAGE 3: Attempt to parse JSON
      console.log('[parseClaudeResponse] Attempting JSON.parse...');
      const parsed = JSON.parse(cleanedContent);
      console.log('[parseClaudeResponse] ✓ JSON parsed successfully');

      // STAGE 4: Validate structure
      if (!parsed.turns || !Array.isArray(parsed.turns)) {
        console.log('[parseClaudeResponse] ❌ Missing turns array');
        console.log('[parseClaudeResponse] Parsed object keys:', Object.keys(parsed).join(', '));
        throw new Error('Invalid response structure: missing turns array');
      }
      
      console.log(`[parseClaudeResponse] ✓ Valid structure with ${parsed.turns.length} turns`);

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
      
      // Log a sample of the problematic content for debugging
      let contentToLog = content.trim();
      if (contentToLog.startsWith('```')) {
        contentToLog = contentToLog.replace(/^```(?:json)?\s*\n?/, '');
        contentToLog = contentToLog.replace(/\n?```\s*$/, '');
        contentToLog = contentToLog.trim();
      }
      // Note: Don't apply full repair pipeline here, just show raw content for debugging
      
      const errorPosition = error instanceof SyntaxError ? 
        error.message.match(/position (\d+)/)?.[1] : null;
      
      if (errorPosition) {
        const pos = parseInt(errorPosition);
        const start = Math.max(0, pos - 100);
        const end = Math.min(contentToLog.length, pos + 100);
        const snippet = contentToLog.substring(start, end);
        console.error(`JSON error context (position ${pos}):\n...${snippet}...`);
      }

      // If JSON parsing fails, try to extract as plain text
      if (content.includes('user:') || content.includes('assistant:')) {
        console.log('Attempting plain text fallback parsing...');
        return this.parseAsPlainText(content, params);
      }

      throw new Error(
        `Failed to parse Claude response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Multi-stage JSON repair pipeline
   * Handles common issues in Claude API responses:
   * - Unescaped quotes in strings
   * - Unescaped newlines
   * - Trailing commas
   * - BOM and invisible characters
   * @private
   */
  private repairJSON(json: string): string {
    // REPAIR STAGE 1: Basic cleanup
    json = this.cleanupBasics(json);
    
    // REPAIR STAGE 2: Fix quote escaping (THE CRITICAL FIX)
    json = this.repairQuoteEscaping(json);
    
    // REPAIR STAGE 3: Fix newline escaping
    json = this.repairNewlineEscaping(json);
    
    // REPAIR STAGE 4: Remove trailing commas
    json = this.removeTrailingCommas(json);
    
    return json;
  }

  /**
   * Stage 1: Basic cleanup - remove BOM, invisible chars
   * @private
   */
  private cleanupBasics(json: string): string {
    // Remove BOM
    json = json.replace(/^\uFEFF/, '');
    
    // Remove invisible characters
    json = json.replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    return json.trim();
  }

  /**
   * Stage 2: Fix unescaped quotes in content strings
   * This is the most critical repair for Claude responses
   * Uses character-by-character parsing to handle complex escaping scenarios
   * @private
   */
  private repairQuoteEscaping(json: string): string {
    try {
      console.log('[repairQuoteEscaping] Starting quote repair');
      let repairCount = 0;
      
      // Find all string values in JSON and repair them
      let result = '';
      let i = 0;
      let inString = false;
      let stringStart = -1;
      
      while (i < json.length) {
        if (!inString) {
          // Not in a string - look for opening quote
          if (json[i] === '"') {
            // Check if this is a property name or value
            // Property names are followed by : eventually
            // Find the matching closing quote first
            let j = i + 1;
            let isPropertyName = false;
            
            // Scan ahead to see if this looks like a property name
            while (j < json.length) {
              if (json[j] === '\\' && j + 1 < json.length) {
                j += 2; // Skip escaped character
                continue;
              }
              if (json[j] === '"') {
                // Found closing quote - check what comes after
                let k = j + 1;
                while (k < json.length && /\s/.test(json[k])) k++;
                if (k < json.length && json[k] === ':') {
                  isPropertyName = true;
                }
                break;
              }
              j++;
            }
            
            if (isPropertyName) {
              // This is a property name, copy as-is until closing quote
              result += json[i];
              i++;
              while (i < json.length) {
                result += json[i];
                if (json[i] === '\\' && i + 1 < json.length) {
                  i++;
                  result += json[i];
                  i++;
                  continue;
                }
                if (json[i] === '"') {
                  i++;
                  break;
                }
                i++;
              }
            } else {
              // This is a string value - enter string parsing mode
              inString = true;
              stringStart = i;
              result += '"';
              i++;
            }
          } else {
            result += json[i];
            i++;
          }
        } else {
          // In a string - parse carefully and escape unescaped quotes
          if (json[i] === '\\') {
            // Backslash - check what's being escaped
            if (i + 1 < json.length) {
              const next = json[i + 1];
              if (next === '"' || next === '\\' || next === 'n' || next === 'r' || next === 't' || next === '/' || next === 'b' || next === 'f') {
                // Already properly escaped
                result += json[i] + json[i + 1];
                i += 2;
                continue;
              }
            }
            // Lone backslash, keep it
            result += json[i];
            i++;
          } else if (json[i] === '"') {
            // Found a quote - is it the closing quote or an embedded quote?
            // Check what comes after (skip whitespace)
            let j = i + 1;
            while (j < json.length && /\s/.test(json[j])) j++;
            
            if (j >= json.length || json[j] === ',' || json[j] === '}' || json[j] === ']') {
              // This is the closing quote
              result += '"';
              i++;
              inString = false;
            } else {
              // Embedded unescaped quote - escape it
              result += '\\"';
              repairCount++;
              i++;
            }
          } else {
            // Regular character
            result += json[i];
            i++;
          }
        }
      }
      
      console.log(`[repairQuoteEscaping] Quote repair complete - fixed ${repairCount} unescaped quotes`);
      return result;
    } catch (error) {
      console.warn('[repairQuoteEscaping] Error during quote repair:', error);
      return json; // Return original if repair fails
    }
  }

  /**
   * Helper: Escape quotes that aren't already escaped
   * @private
   */
  private escapeUnescapedQuotes(str: string): string {
    let result = '';
    let i = 0;
    
    while (i < str.length) {
      if (str[i] === '\\') {
        // Found backslash - check what follows
        if (i + 1 < str.length) {
          const next = str[i + 1];
          if (next === '"' || next === '\\' || next === 'n' || next === 'r' || next === 't') {
            // Already escaped, keep both characters
            result += str[i] + str[i + 1];
            i += 2;
            continue;
          }
        }
        // Backslash but not escaping anything special, keep it
        result += str[i];
        i += 1;
      } else if (str[i] === '"') {
        // Unescaped quote - escape it!
        result += '\\"';
        i += 1;
      } else {
        // Regular character
        result += str[i];
        i += 1;
      }
    }
    
    return result;
  }

  /**
   * Stage 3: Fix unescaped newlines in content strings
   * @private
   */
  private repairNewlineEscaping(json: string): string {
    try {
      // Replace actual newlines inside content strings with \n
      // This is tricky - we only want to fix newlines inside strings
      // Not structural newlines in the JSON
      
      // Pattern to match content fields (using [\s\S] instead of dotAll flag for ES5 compatibility)
      const contentPattern = /"content"\s*:\s*"([\s\S]*?)"/g;
      
      json = json.replace(contentPattern, (match, capturedContent) => {
        // Replace actual newlines with \n escape sequences
        let fixed = capturedContent.replace(/\r\n/g, '\\n');
        fixed = fixed.replace(/\n/g, '\\n');
        fixed = fixed.replace(/\r/g, '\\r');
        return `"content": "${fixed}"`;
      });
      
      return json;
    } catch (error) {
      console.warn('[repairNewlineEscaping] Error during newline repair:', error);
      return json;
    }
  }

  /**
   * Stage 4: Remove trailing commas before closing braces/brackets
   * @private
   */
  private removeTrailingCommas(json: string): string {
    return json.replace(/,(\s*[}\]])/g, '$1');
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

