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
import { ClaudeAPIClient, getClaudeAPIClient, type ClaudeAPIResponse } from './claude-api-client';
import { TemplateResolver, getTemplateResolver } from './template-resolver';
import { QualityValidator, getQualityValidator } from './quality-validator';
import { ConversationStorageService } from './conversation-storage-service';
import { conversationService } from './conversation-service';
import { generationLogService } from './generation-log-service';
import { getFailedGenerationService, type CreateFailedGenerationInput } from './failed-generation-service';
import { detectTruncatedContent, detectTruncatedTurns } from '../utils/truncation-detection';
import { AI_CONFIG } from '../ai-config';
import type {
  Conversation,
  ConversationTurn,
  ConversationStatus,
  TierType,
} from '@/lib/types';

/**
 * Custom error for truncated responses
 */
export class TruncatedResponseError extends Error {
  constructor(
    message: string,
    public stopReason: string | null,
    public pattern: string | null
  ) {
    super(message);
    this.name = 'TruncatedResponseError';
  }
}

/**
 * Custom error for unexpected stop reasons
 */
export class UnexpectedStopReasonError extends Error {
  constructor(
    message: string,
    public stopReason: string
  ) {
    super(message);
    this.name = 'UnexpectedStopReasonError';
  }
}

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

  /** Scaffolding IDs (UUIDs) for provenance tracking */
  scaffoldingIds?: {
    personaId?: string;
    emotionalArcId?: string;
    trainingTopicId?: string;
  };
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

      // NEW: Step 2.5: Validate API response BEFORE storage
      try {
        this.validateAPIResponse(apiResponse, generationId);
      } catch (validationError) {
        console.error(`[${generationId}] ❌ Response validation failed:`, validationError);
        
        // Store as failed generation for analysis
        await this.storeFailedGeneration(
          validationError as Error,
          {
            prompt: resolvedTemplate.resolvedPrompt,
            apiResponse,
            params,
          },
          generationId
        );
        
        // Re-throw to prevent production storage
        throw validationError;
      }

      // TIER 2: Store raw response BEFORE any parsing (ONLY if validation passed)
      console.log(`[${generationId}] Step 3: Storing raw response...`);
      const rawStorageResult = await this.storageService.storeRawResponse({
        conversationId: generationId,
        rawResponse: apiResponse.content,
        userId: params.userId,
        metadata: {
          templateId: params.templateId,
          tier: params.tier,
          // Use scaffoldingIds (UUIDs) if provided, fallback to parameters (for backwards compat)
          personaId: params.scaffoldingIds?.personaId || params.parameters?.persona_id,
          emotionalArcId: params.scaffoldingIds?.emotionalArcId || params.parameters?.emotional_arc_id,
          trainingTopicId: params.scaffoldingIds?.trainingTopicId || params.parameters?.training_topic_id,
        },
      });

      if (!rawStorageResult.success) {
        console.error(`[${generationId}] ❌ Failed to store raw response:`, rawStorageResult.error);
        // Don't throw - continue to parse attempt
      }

      console.log(`[${generationId}] ✅ Raw response stored at ${rawStorageResult.rawPath}`);

      // ENRICHMENT PIPELINE: Now triggered separately via /api/conversations/[id]/enrich
      // This ensures enrichment runs in its own serverless function invocation with full execution time
      // Fire-and-forget async enrichment doesn't work in Vercel serverless (gets killed after HTTP response)
      console.log(`[${generationId}] ℹ️ Enrichment will be triggered by client after generation completes`);

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
        
        // Create minimal Conversation object with all required fields
        const failedConversation: Conversation = {
          id: generationId,
          title: `Parse Failed: ${generationId}`,
          status: 'pending_review',
          persona: params.parameters.persona || 'unknown',
          emotion: params.parameters.emotion || 'unknown',
          tier: params.tier,
          category: [],
          qualityScore: 0,
          turns: [],
          totalTurns: 0,
          totalTokens: 0,
          parameters: params.parameters,
          reviewHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: params.userId,
        };
        
        return {
          conversation: failedConversation,
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
   * Validate Claude API response for completeness
   * Checks stop_reason and content truncation patterns
   * 
   * @param apiResponse - Response from Claude API
   * @param generationId - ID for logging
   * @throws TruncatedResponseError if content is truncated
   * @throws UnexpectedStopReasonError if stop_reason is not 'end_turn'
   * @private
   */
  private validateAPIResponse(
    apiResponse: ClaudeAPIResponse,
    generationId: string
  ): void {
    console.log(`[${generationId}] Validating API response...`);

    // VALIDATION 1: Check stop_reason
    if (apiResponse.stop_reason !== 'end_turn') {
      console.warn(`[${generationId}] ⚠️ Unexpected stop_reason: ${apiResponse.stop_reason}`);
      throw new UnexpectedStopReasonError(
        `Generation failed: stop_reason was '${apiResponse.stop_reason}' instead of 'end_turn'`,
        apiResponse.stop_reason
      );
    }

    // VALIDATION 2: Check content for truncation patterns (on raw JSON)
    const truncationCheck = detectTruncatedContent(apiResponse.content);
    
    if (truncationCheck.isTruncated) {
      console.warn(`[${generationId}] ⚠️ Content appears truncated: ${truncationCheck.details}`);
      console.warn(`[${generationId}] Pattern: ${truncationCheck.pattern}, Confidence: ${truncationCheck.confidence}`);
      
      throw new TruncatedResponseError(
        `Generation failed: content truncated (${truncationCheck.pattern})`,
        apiResponse.stop_reason,
        truncationCheck.pattern
      );
    }

    // VALIDATION 3: Check individual turn content for truncation (CRITICAL FIX)
    // Structured outputs guarantee valid JSON structure, but content INSIDE turns may be truncated
    try {
      const parsed = JSON.parse(apiResponse.content);
      
      if (parsed.turns && Array.isArray(parsed.turns)) {
        const truncatedTurns = detectTruncatedTurns(parsed.turns);
        
        if (truncatedTurns.length > 0) {
          const details = truncatedTurns
            .map(t => `Turn ${t.turnIndex}: ${t.result.pattern}`)
            .join(', ');
          
          console.warn(`[${generationId}] ⚠️ Truncated turns detected: ${details}`);
          
          throw new TruncatedResponseError(
            `Content truncated in ${truncatedTurns.length} turn(s): ${details}`,
            apiResponse.stop_reason,
            truncatedTurns[0].result.pattern
          );
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, we'll catch it later in the pipeline
      // Don't throw here - let the normal parse error handling deal with it
      if (parseError instanceof TruncatedResponseError) {
        throw parseError;  // Re-throw TruncatedResponseError
      }
      // Log but don't throw for other parse errors - they'll be handled downstream
      console.warn(`[${generationId}] Could not parse content for turn-level validation: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    console.log(`[${generationId}] ✓ Response validation passed`);
  }

  /**
   * Store failed generation with full diagnostic context
   * Creates RAW Error File Report and database record
   * 
   * @param error - The error that caused failure
   * @param context - Generation context (prompt, config, response)
   * @param generationId - ID for tracking
   * @private
   */
  private async storeFailedGeneration(
    error: Error,
    context: {
      prompt: string;
      apiResponse: ClaudeAPIResponse;
      params: GenerationParams;
    },
    generationId: string
  ): Promise<void> {
    try {
      console.log(`[${generationId}] Storing as failed generation...`);

      const failedGenService = getFailedGenerationService();

      // Determine failure type and details
      let failureType: 'truncation' | 'parse_error' | 'api_error' | 'validation_error' = 'api_error';
      let truncationPattern: string | null = null;
      let truncationDetails: string | null = null;

      if (error instanceof TruncatedResponseError) {
        failureType = 'truncation';
        truncationPattern = error.pattern;
        truncationDetails = error.message;
      } else if (error instanceof UnexpectedStopReasonError) {
        failureType = 'truncation';  // Unexpected stop_reason treated as truncation
        truncationPattern = 'unexpected_stop_reason';
        truncationDetails = `stop_reason was '${error.stopReason}' instead of 'end_turn'`;
      }

      // Build failed generation input
      const input: CreateFailedGenerationInput = {
        conversation_id: generationId,
        run_id: context.params.runId,
        
        prompt: context.prompt,
        model: context.apiResponse.model,
        max_tokens: context.params.maxTokens || AI_CONFIG.maxTokens,
        temperature: context.params.temperature || AI_CONFIG.temperature,
        structured_outputs_enabled: true,
        
        raw_response: {
          id: context.apiResponse.id,
          model: context.apiResponse.model,
          stop_reason: context.apiResponse.stop_reason,
          usage: context.apiResponse.usage,
          cost: context.apiResponse.cost,
          durationMs: context.apiResponse.durationMs,
        },
        response_content: context.apiResponse.content,
        
        stop_reason: context.apiResponse.stop_reason,
        input_tokens: context.apiResponse.usage.input_tokens,
        output_tokens: context.apiResponse.usage.output_tokens,
        
        failure_type: failureType,
        truncation_pattern: truncationPattern,
        truncation_details: truncationDetails,
        
        error_message: error.message,
        error_stack: error.stack,
        
        created_by: context.params.userId,
        
        persona_id: context.params.scaffoldingIds?.personaId,
        emotional_arc_id: context.params.scaffoldingIds?.emotionalArcId,
        training_topic_id: context.params.scaffoldingIds?.trainingTopicId,
        template_id: context.params.templateId,
      };

      await failedGenService.storeFailedGeneration(input);

      console.log(`[${generationId}] ✅ Failed generation stored for analysis`);
    } catch (storeError) {
      console.error(`[${generationId}] ❌ Error storing failed generation:`, storeError);
      // Don't throw - we already have the original error to throw
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

