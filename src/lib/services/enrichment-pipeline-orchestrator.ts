/**
 * Enrichment Pipeline Orchestrator
 * 
 * Coordinates the complete enrichment pipeline from raw minimal JSON to normalized enriched JSON:
 * 1. Fetch raw JSON from storage
 * 2. Validate structure (ConversationValidationService)
 * 3. If valid: Enrich with database metadata (ConversationEnrichmentService)
 * 4. Normalize encoding/format (ConversationNormalizationService)
 * 5. Store enriched JSON and update database
 * 6. Update enrichment_status throughout
 * 
 * Error Handling:
 * - Validation failures: Save report, set status to 'validation_failed', STOP
 * - Enrichment failures: Save error, set status to 'validated' (can retry), STOP
 * - Normalization failures: Save error, keep enriched file, set status to 'normalization_failed'
 * - Storage failures: Retry once, then fail with error message
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConversationValidationService } from './conversation-validation-service';
import { ConversationEnrichmentService } from './conversation-enrichment-service';
import { ConversationNormalizationService } from './conversation-normalization-service';
import { ConversationStorageService } from './conversation-storage-service';

export interface PipelineResult {
  success: boolean;
  conversationId: string;
  finalStatus: string;           // enrichment_status value
  stagesCompleted: string[];     // ['validation', 'enrichment', 'normalization']
  error?: string;
  validationReport?: any;
  enrichedPath?: string;
  enrichedSize?: number;
}

export class EnrichmentPipelineOrchestrator {
  private supabase: SupabaseClient;
  private validationService: ConversationValidationService;
  private enrichmentService: ConversationEnrichmentService;
  private normalizationService: ConversationNormalizationService;
  private storageService: ConversationStorageService;

  constructor(supabaseClient?: SupabaseClient) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    this.validationService = new ConversationValidationService();
    this.enrichmentService = new ConversationEnrichmentService(this.supabase);
    this.normalizationService = new ConversationNormalizationService();
    this.storageService = new ConversationStorageService(this.supabase);
  }

  /**
   * Run complete enrichment pipeline for a conversation
   * 
   * @param conversationId - Conversation ID
   * @param userId - User ID for file paths
   * @returns Pipeline result with final status and metadata
   */
  async runPipeline(conversationId: string, userId: string): Promise<PipelineResult> {
    console.log(`[Pipeline] Starting enrichment pipeline for ${conversationId}`);
    
    const stagesCompleted: string[] = [];

    try {
      // STAGE 1: Fetch raw JSON
      console.log(`[Pipeline] Stage 1: Fetching raw JSON`);
      const rawJson = await this.fetchRawJson(conversationId);
      if (!rawJson) {
        throw new Error('No raw response found for conversation');
      }

      // STAGE 2: Validate structure
      console.log(`[Pipeline] Stage 2: Validating structure`);
      const validationResult = await this.validationService.validateMinimalJson(rawJson, conversationId);
      
      // Store validation report
      await this.supabase
        .from('conversations')
        .update({
          validation_report: validationResult,
          enrichment_status: validationResult.isValid ? 'validated' : 'validation_failed',
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      if (!validationResult.isValid) {
        console.log(`[Pipeline] ❌ Validation failed with ${validationResult.blockers.length} blockers`);
        return {
          success: false,
          conversationId,
          finalStatus: 'validation_failed',
          stagesCompleted: [],
          error: `Validation failed: ${validationResult.summary}`,
          validationReport: validationResult
        };
      }

      stagesCompleted.push('validation');
      console.log(`[Pipeline] ✅ Validation passed (${validationResult.warnings.length} warnings)`);

      // STAGE 3: Enrich with database metadata
      console.log(`[Pipeline] Stage 3: Enriching with database metadata`);
      
      // Update status to in_progress
      await this.supabase
        .from('conversations')
        .update({
          enrichment_status: 'enrichment_in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      const parsedMinimal = JSON.parse(rawJson);
      const enriched = await this.enrichmentService.enrichConversation(conversationId, parsedMinimal);
      
      stagesCompleted.push('enrichment');
      console.log(`[Pipeline] ✅ Enrichment complete (${enriched.training_pairs.length} training pairs)`);

      // STAGE 4: Normalize JSON
      console.log(`[Pipeline] Stage 4: Normalizing JSON`);
      const enrichedJson = JSON.stringify(enriched, null, 2);
      const normalizationResult = await this.normalizationService.normalizeJson(enrichedJson);

      if (!normalizationResult.success) {
        // Normalization failed - store error but keep enriched file
        await this.supabase
          .from('conversations')
          .update({
            enrichment_status: 'normalization_failed',
            enrichment_error: normalizationResult.error || 'Normalization failed',
            updated_at: new Date().toISOString()
          })
          .eq('conversation_id', conversationId);

        return {
          success: false,
          conversationId,
          finalStatus: 'normalization_failed',
          stagesCompleted,
          error: `Normalization failed: ${normalizationResult.error}`
        };
      }

      stagesCompleted.push('normalization');
      console.log(`[Pipeline] ✅ Normalization complete (${normalizationResult.fileSize} bytes)`);

      // STAGE 5: Store enriched JSON
      console.log(`[Pipeline] Stage 5: Storing enriched JSON`);
      const storeResult = await this.storageService.storeEnrichedConversation(
        conversationId,
        userId,
        enriched
      );

      if (!storeResult.success) {
        // Storage failed - set error
        await this.supabase
          .from('conversations')
          .update({
            enrichment_error: storeResult.error || 'Storage failed',
            updated_at: new Date().toISOString()
          })
          .eq('conversation_id', conversationId);

        return {
          success: false,
          conversationId,
          finalStatus: 'enriched', // Enrichment succeeded, storage failed
          stagesCompleted,
          error: `Storage failed: ${storeResult.error}`
        };
      }

      console.log(`[Pipeline] ✅ Storage complete: ${storeResult.enrichedPath}`);

      // FINAL: Mark pipeline as completed
      await this.supabase
        .from('conversations')
        .update({
          enrichment_status: 'completed',
          processing_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      console.log(`[Pipeline] ✅✅✅ Pipeline complete for ${conversationId}`);

      return {
        success: true,
        conversationId,
        finalStatus: 'completed',
        stagesCompleted,
        enrichedPath: storeResult.enrichedPath,
        enrichedSize: storeResult.enrichedSize
      };

    } catch (error) {
      console.error(`[Pipeline] ❌ Pipeline failed:`, error);

      // Update with error
      await this.supabase
        .from('conversations')
        .update({
          enrichment_error: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      return {
        success: false,
        conversationId,
        finalStatus: 'not_started',
        stagesCompleted,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fetch raw JSON from storage
   */
  private async fetchRawJson(conversationId: string): Promise<string | null> {
    // Get raw_response_path from database
    const { data: conversation } = await this.supabase
      .from('conversations')
      .select('raw_response_path')
      .eq('conversation_id', conversationId)
      .single();

    if (!conversation?.raw_response_path) {
      return null;
    }

    // Download from storage
    const { data, error } = await this.supabase.storage
      .from('conversation-files')
      .download(conversation.raw_response_path);

    if (error || !data) {
      throw new Error(`Failed to download raw response: ${error?.message}`);
    }

    return await data.text();
  }

  /**
   * Retry failed enrichment pipeline
   * 
   * @param conversationId - Conversation ID
   * @param userId - User ID
   * @returns Pipeline result
   */
  async retryPipeline(conversationId: string, userId: string): Promise<PipelineResult> {
    console.log(`[Pipeline] Retrying enrichment pipeline for ${conversationId}`);

    // Reset enrichment_status to allow retry
    await this.supabase
      .from('conversations')
      .update({
        enrichment_status: 'not_started',
        enrichment_error: null,
        updated_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId);

    return this.runPipeline(conversationId, userId);
  }
}

// Export factory function
export function createPipelineOrchestrator(supabase?: SupabaseClient): EnrichmentPipelineOrchestrator {
  return new EnrichmentPipelineOrchestrator(supabase);
}

// Export singleton
let orchestratorInstance: EnrichmentPipelineOrchestrator | null = null;

export function getPipelineOrchestrator(): EnrichmentPipelineOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new EnrichmentPipelineOrchestrator();
  }
  return orchestratorInstance;
}


