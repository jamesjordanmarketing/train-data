/**
 * TrainingFileService
 * 
 * Manages LoRA training files (aggregated JSON + JSONL pairs).
 * Handles:
 * - Creating new training files
 * - Adding conversations to existing files
 * - Aggregating individual JSONs into full JSON format
 * - Generating JSONL from full JSON
 * - Storing files in Supabase Storage
 * - Tracking metadata and scaffolding distribution
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Type Definitions
// ============================================================================

export interface TrainingFile {
  id: string;
  name: string;
  description: string | null;
  json_file_path: string;
  jsonl_file_path: string;
  storage_bucket: string;
  conversation_count: number;
  total_training_pairs: number;
  json_file_size: number | null;
  jsonl_file_size: number | null;
  avg_quality_score: number | null;
  min_quality_score: number | null;
  max_quality_score: number | null;
  human_reviewed_count: number;
  scaffolding_distribution: ScaffoldingDistribution;
  status: 'active' | 'archived' | 'processing' | 'failed';
  last_updated_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScaffoldingDistribution {
  personas: Record<string, number>;      // persona_key -> count
  emotional_arcs: Record<string, number>; // emotional_arc_key -> count
  training_topics: Record<string, number>; // topic_key -> count
}

export interface TrainingFileConversation {
  id: string;
  training_file_id: string;
  conversation_id: string;
  added_at: string;
  added_by: string | null;
}

export interface CreateTrainingFileInput {
  name: string;
  description?: string;
  conversation_ids: string[];  // Initial conversations to add
  created_by: string;
}

export interface AddConversationsInput {
  training_file_id: string;
  conversation_ids: string[];
  added_by: string;
}

export interface FullTrainingJSON {
  training_file_metadata: {
    file_name: string;
    version: string;
    created_date: string;
    last_updated: string;
    format_spec: string;
    target_model: string;
    vertical: string;
    total_conversations: number;
    total_training_pairs: number;
    quality_summary: {
      avg_quality_score: number;
      min_quality_score: number;
      max_quality_score: number;
      human_reviewed_count: number;
      human_reviewed_percentage: number;
    };
    scaffolding_distribution: ScaffoldingDistribution;
  };
  consultant_profile: {
    name: string;
    business: string;
    expertise: string;
    years_experience: number;
    core_philosophy: Record<string, string>;
    communication_style: {
      tone: string;
      techniques: string[];
      avoid: string[];
    };
  };
  conversations: any[]; // Array of conversation objects from individual JSONs
}

// ============================================================================
// TrainingFileService Class
// ============================================================================

export class TrainingFileService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create a new training file with initial conversations
   */
  async createTrainingFile(input: CreateTrainingFileInput): Promise<TrainingFile> {
    try {
      // 1. Resolve IDs to canonical conversation_ids (handles PK vs Business Key)
      const canonicalIds = await this.resolveToConversationIds(input.conversation_ids);

      if (canonicalIds.length === 0 && input.conversation_ids.length > 0) {
        throw new Error('Conversation validation failed: No conversations found (ID resolution failed)');
      }

      // 2. Validate conversations exist and are eligible (using canonical IDs)
      const validationResult = await this.validateConversationsForTraining(canonicalIds);
      if (!validationResult.isValid) {
        throw new Error(`Conversation validation failed: ${validationResult.errors.join(', ')}`);
      }

      // 3. Fetch enriched JSON files for all conversations (using canonical IDs)
      const conversations = await this.fetchEnrichedConversations(canonicalIds);
      
      // 3. Build full training JSON
      const fullJSON = await this.aggregateConversationsToFullJSON(
        conversations,
        input.name,
        input.description
      );
      
      // 4. Generate JSONL from full JSON
      const jsonlContent = this.convertFullJSONToJSONL(fullJSON);
      
      // 5. Upload both files to Supabase Storage
      const fileId = uuidv4();
      const jsonPath = `${fileId}/training.json`;
      const jsonlPath = `${fileId}/training.jsonl`;
      
      await this.uploadToStorage(jsonPath, JSON.stringify(fullJSON, null, 2));
      await this.uploadToStorage(jsonlPath, jsonlContent);
      
      // 6. Calculate metadata
      const metadata = this.calculateMetadata(fullJSON, conversations);
      
      // 7. Create database record
      const { data: trainingFile, error } = await this.supabase
        .from('training_files')
        .insert({
          name: input.name,
          description: input.description || null,
          json_file_path: jsonPath,
          jsonl_file_path: jsonlPath,
          storage_bucket: 'training-files',
          conversation_count: conversations.length,
          total_training_pairs: metadata.totalTrainingPairs,
          json_file_size: Buffer.byteLength(JSON.stringify(fullJSON)),
          jsonl_file_size: Buffer.byteLength(jsonlContent),
          avg_quality_score: metadata.avgQualityScore,
          min_quality_score: metadata.minQualityScore,
          max_quality_score: metadata.maxQualityScore,
          human_reviewed_count: metadata.humanReviewedCount,
          scaffolding_distribution: metadata.scaffoldingDistribution,
          status: 'active',
          last_updated_at: new Date().toISOString(),
          created_by: input.created_by,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // 8. Add conversation associations (using canonical IDs)
      const associations = canonicalIds.map(conv_id => ({
        training_file_id: trainingFile.id,
        conversation_id: conv_id,
        added_by: input.created_by,
      }));
      
      const { error: assocError } = await this.supabase
        .from('training_file_conversations')
        .insert(associations);
      
      if (assocError) throw assocError;
      
      return trainingFile as TrainingFile;
      
    } catch (error) {
      console.error('Error creating training file:', error);
      throw error;
    }
  }

  /**
   * Add conversations to an existing training file
   */
  async addConversationsToTrainingFile(input: AddConversationsInput): Promise<TrainingFile> {
    try {
      // 1. Resolve IDs to canonical conversation_ids (handles PK vs Business Key)
      const canonicalIds = await this.resolveToConversationIds(input.conversation_ids);

      if (canonicalIds.length === 0 && input.conversation_ids.length > 0) {
        throw new Error('Validation failed: No conversations found (ID resolution failed)');
      }

      // 2. Check for duplicates (using canonical IDs)
      const { data: existing } = await this.supabase
        .from('training_file_conversations')
        .select('conversation_id')
        .eq('training_file_id', input.training_file_id);
      
      if (existing && existing.length > 0) {
        const existingIds = existing.map(e => e.conversation_id);
        const duplicates = canonicalIds.filter(id => existingIds.includes(id));
        if (duplicates.length > 0) {
          throw new Error(`Conversations already in training file: ${duplicates.join(', ')}`);
        }
      }
      
      // 3. Validate new conversations (using canonical IDs)
      const validationResult = await this.validateConversationsForTraining(canonicalIds);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // 4. Get existing training file
      const { data: existingFile } = await this.supabase
        .from('training_files')
        .select('*')
        .eq('id', input.training_file_id)
        .single();
      
      if (!existingFile) throw new Error('Training file not found');
      
      // 5. Download existing JSON file
      const existingJSON = await this.downloadJSONFile(existingFile.json_file_path);
      
      // 6. Fetch new conversations (using canonical IDs)
      const newConversations = await this.fetchEnrichedConversations(canonicalIds);
      
      // 7. Merge conversations into existing JSON
      const updatedJSON = this.mergeConversationsIntoFullJSON(existingJSON, newConversations);
      
      // 8. Regenerate JSONL
      const updatedJSONL = this.convertFullJSONToJSONL(updatedJSON);
      
      // 9. Upload updated files
      await this.uploadToStorage(existingFile.json_file_path, JSON.stringify(updatedJSON, null, 2));
      await this.uploadToStorage(existingFile.jsonl_file_path, updatedJSONL);
      
      // 10. Recalculate metadata (using canonical IDs)
      const allConversationIds = [
        ...(existing?.map(e => e.conversation_id) || []),
        ...canonicalIds
      ];
      const allConversations = await this.fetchEnrichedConversations(allConversationIds);
      const metadata = this.calculateMetadata(updatedJSON, allConversations);
      
      // 11. Update database record (using canonical IDs count)
      const { data: updated, error } = await this.supabase
        .from('training_files')
        .update({
          conversation_count: existingFile.conversation_count + canonicalIds.length,
          total_training_pairs: metadata.totalTrainingPairs,
          json_file_size: Buffer.byteLength(JSON.stringify(updatedJSON)),
          jsonl_file_size: Buffer.byteLength(updatedJSONL),
          avg_quality_score: metadata.avgQualityScore,
          min_quality_score: metadata.minQualityScore,
          max_quality_score: metadata.maxQualityScore,
          human_reviewed_count: metadata.humanReviewedCount,
          scaffolding_distribution: metadata.scaffoldingDistribution,
          last_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.training_file_id)
        .select()
        .single();
      
      if (error) throw error;
      
      // 12. Add new conversation associations (using canonical IDs)
      const associations = canonicalIds.map(conv_id => ({
        training_file_id: input.training_file_id,
        conversation_id: conv_id,
        added_by: input.added_by,
      }));
      
      await this.supabase
        .from('training_file_conversations')
        .insert(associations);
      
      return updated as TrainingFile;
      
    } catch (error) {
      console.error('Error adding conversations to training file:', error);
      throw error;
    }
  }

  /**
   * List all training files
   */
  async listTrainingFiles(filters?: {
    status?: TrainingFile['status'];
    created_by?: string;
  }): Promise<TrainingFile[]> {
    let query = this.supabase
      .from('training_files')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data as TrainingFile[];
  }

  /**
   * Get training file by ID
   */
  async getTrainingFile(id: string): Promise<TrainingFile | null> {
    const { data, error } = await this.supabase
      .from('training_files')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data as TrainingFile;
  }

  /**
   * Get conversations in a training file
   */
  async getTrainingFileConversations(training_file_id: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('training_file_conversations')
      .select('conversation_id')
      .eq('training_file_id', training_file_id);
    
    if (error) throw error;
    
    return data.map(item => item.conversation_id);
  }

  /**
   * Generate signed download URL for JSON or JSONL file
   */
  async getDownloadUrl(
    file_path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('training-files')
      .createSignedUrl(file_path, expiresIn);
    
    if (error) throw error;
    if (!data?.signedUrl) throw new Error('Failed to generate signed URL');
    
    return data.signedUrl;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Resolves mixed IDs (PK or Business Key) to canonical conversation_ids.
   * Matches the pattern from bulk-enrich endpoint for consistency.
   * 
   * This handles a legacy bug where the UI sometimes sends the database row ID (id)
   * instead of the business key (conversation_id). Once the UI is fixed, this fallback
   * can be removed.
   */
  private async resolveToConversationIds(mixedIds: string[]): Promise<string[]> {
    if (!mixedIds || mixedIds.length === 0) return [];

    // DEBUG: Log what IDs we received
    console.log(`[TrainingFileService] 🔍 Resolving ${mixedIds.length} IDs:`, JSON.stringify(mixedIds));

    // Try conversation_id first (correct field)
    const { data: byConvId, error: convIdError } = await this.supabase
      .from('conversations')
      .select('conversation_id')
      .in('conversation_id', mixedIds);

    if (convIdError) {
      console.error('[TrainingFileService] Error querying by conversation_id:', convIdError);
      throw new Error(`Database error: ${convIdError.message}`);
    }

    console.log(`[TrainingFileService] Found ${byConvId?.length || 0} by conversation_id`);

    const foundConvIds = new Set(byConvId?.map(r => r.conversation_id) || []);

    // For IDs not found by conversation_id, try by id (PK) as fallback
    const notFoundByConvId = mixedIds.filter(id => !foundConvIds.has(id));

    if (notFoundByConvId.length > 0) {
      console.warn(`[TrainingFileService] ⚠️ ${notFoundByConvId.length} IDs not found by conversation_id, trying by id (PK)...`);
      console.log(`[TrainingFileService] IDs to try by PK:`, JSON.stringify(notFoundByConvId));

      const { data: byId, error: idError } = await this.supabase
        .from('conversations')
        .select('id, conversation_id')
        .in('id', notFoundByConvId);

      if (idError) {
        console.error('[TrainingFileService] Error querying by id:', idError);
        throw new Error(`Database error: ${idError.message}`);
      }

      console.log(`[TrainingFileService] Found ${byId?.length || 0} by id (PK)`);

      if (byId && byId.length > 0) {
        byId.forEach(r => {
          foundConvIds.add(r.conversation_id);
          console.log(`[TrainingFileService] ✅ Resolved PK ${r.id} → conversation_id: ${r.conversation_id}`);
        });
      } else {
        console.error(`[TrainingFileService] ❌ NO CONVERSATIONS FOUND for these IDs:`, JSON.stringify(notFoundByConvId));
      }
    }

    const result = Array.from(foundConvIds);
    console.log(`[TrainingFileService] Final resolution: ${result.length} conversation_ids`, JSON.stringify(result));

    return result;
  }

  private async validateConversationsForTraining(
    conversation_ids: string[]
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Fetch conversations
    const { data: conversations, error } = await this.supabase
      .from('conversations')
      .select('conversation_id, enrichment_status, enriched_file_path')
      .in('conversation_id', conversation_ids);
    
    if (error) {
      errors.push(`Database error: ${error.message}`);
      return { isValid: false, errors };
    }
    
    if (!conversations || conversations.length === 0) {
      errors.push('No conversations found');
      return { isValid: false, errors };
    }
    
    // Check each conversation
    for (const conv of conversations) {
      if (conv.enrichment_status !== 'completed') {
        errors.push(`Conversation ${conv.conversation_id}: enrichment_status must be 'completed' (currently: ${conv.enrichment_status})`);
      }
      if (!conv.enriched_file_path) {
        errors.push(`Conversation ${conv.conversation_id}: enriched_file_path is null`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async fetchEnrichedConversations(conversation_ids: string[]): Promise<any[]> {
    // Fetch conversation metadata from database
    // Note: persona_key, emotional_arc_key, topic_key DB columns may be null
    // The actual scaffolding data is in scaffolding_snapshot JSONB
    const { data: conversations, error } = await this.supabase
      .from('conversations')
      .select(`
        conversation_id,
        enriched_file_path,
        persona_key,
        emotional_arc_key,
        topic_key,
        quality_score,
        empathy_score,
        clarity_score,
        appropriateness_score,
        brand_voice_alignment,
        created_at,
        tier,
        scaffolding_snapshot
      `)
      .in('conversation_id', conversation_ids);
    
    if (error) throw error;
    
    // Download enriched JSON files from storage
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const jsonContent = await this.downloadEnrichedJSONFile(conv.enriched_file_path);
        return {
          metadata: conv,
          json: jsonContent,
        };
      })
    );
    
    return enrichedConversations;
  }

  private async downloadJSONFile(file_path: string): Promise<any> {
    const { data, error } = await this.supabase.storage
      .from('training-files')
      .download(file_path);
    
    if (error) throw error;
    
    const text = await data.text();
    return JSON.parse(text);
  }

  private async downloadEnrichedJSONFile(file_path: string): Promise<any> {
    const { data, error } = await this.supabase.storage
      .from('conversation-files')
      .download(file_path);
    
    if (error) throw error;
    
    const text = await data.text();
    return JSON.parse(text);
  }

  private async uploadToStorage(file_path: string, content: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from('training-files')
      .upload(file_path, content, {
        contentType: file_path.endsWith('.json') ? 'application/json' : 'application/x-ndjson',
        upsert: true,
      });
    
    if (error) throw error;
  }

  private aggregateConversationsToFullJSON(
    conversations: any[],
    fileName: string,
    description?: string
  ): FullTrainingJSON {
    // Build full JSON following v4.0 schema
    const now = new Date();
    const fullJSON: FullTrainingJSON = {
      training_file_metadata: {
        file_name: fileName,
        version: '4.0.0',
        created_date: now.toISOString(),
        last_updated: now.toISOString(),
        format_spec: 'brightrun-lora-v4',
        target_model: 'claude-sonnet-4-5',
        vertical: 'financial_planning_consultant',
        total_conversations: conversations.length,
        total_training_pairs: 0, // Calculated below
        quality_summary: {
          avg_quality_score: 0,
          min_quality_score: 0,
          max_quality_score: 0,
          human_reviewed_count: 0,
          human_reviewed_percentage: 0,
        },
        scaffolding_distribution: {
          personas: {},
          emotional_arcs: {},
          training_topics: {},
        },
      },
      consultant_profile: {
        name: 'Elena Morales, CFP',
        business: 'Pathways Financial Planning',
        expertise: 'fee-only financial planning for mid-career professionals',
        years_experience: 15,
        core_philosophy: {
          principle_1: 'Money is emotional - always acknowledge feelings before facts',
          principle_2: 'Create judgment-free space - normalize struggles explicitly',
          principle_3: 'Education-first - teach the why not just the what',
          principle_4: 'Progress over perfection - celebrate small wins',
          principle_5: 'Values-aligned decisions - personal context over generic rules',
        },
        communication_style: {
          tone: 'warm, professional, never condescending',
          techniques: [
            'acknowledge emotions explicitly',
            'use metaphors and stories for complex concepts',
            'provide specific numbers over abstractions',
            'ask permission before educating',
            'celebrate progress and small wins',
          ],
          avoid: [
            'financial jargon without explanation',
            'assumptions about knowledge level',
            'judgment of past financial decisions',
            'overwhelming with too many options',
            'generic platitudes without specifics',
          ],
        },
      },
      conversations: [],
    };
    
    let totalPairs = 0;
    const qualityScores: number[] = [];
    
    // Aggregate each conversation
    for (const conv of conversations) {
      const enrichedJSON = conv.json;
      const metadata = conv.metadata;
      
      // Extract training_pairs from enriched JSON
      const trainingPairs = enrichedJSON.training_pairs || [];
      totalPairs += trainingPairs.length;
      
      // Extract scaffolding keys from scaffolding_snapshot JSONB (primary) or fall back to DB columns
      // DB columns (persona_key, emotional_arc_key, topic_key) are often null
      const scaffoldingSnapshot = metadata.scaffolding_snapshot || {};
      const personaKey = metadata.persona_key || scaffoldingSnapshot?.persona?.persona_key || '';
      const emotionalArcKey = metadata.emotional_arc_key || scaffoldingSnapshot?.emotional_arc?.arc_key || '';
      const topicKey = metadata.topic_key || scaffoldingSnapshot?.training_topic?.topic_key || '';
      
      // Track scaffolding distribution using extracted keys
      if (personaKey) {
        fullJSON.training_file_metadata.scaffolding_distribution.personas[personaKey] = 
          (fullJSON.training_file_metadata.scaffolding_distribution.personas[personaKey] || 0) + 1;
      }
      if (emotionalArcKey) {
        fullJSON.training_file_metadata.scaffolding_distribution.emotional_arcs[emotionalArcKey] = 
          (fullJSON.training_file_metadata.scaffolding_distribution.emotional_arcs[emotionalArcKey] || 0) + 1;
      }
      if (topicKey) {
        fullJSON.training_file_metadata.scaffolding_distribution.training_topics[topicKey] = 
          (fullJSON.training_file_metadata.scaffolding_distribution.training_topics[topicKey] || 0) + 1;
      }
      
      // Track quality scores - prefer DB column, fall back to enriched JSON training pairs
      if (metadata.quality_score !== null && metadata.quality_score !== undefined) {
        qualityScores.push(metadata.quality_score);
      } else {
        // Extract quality scores from training pairs in enriched JSON
        for (const pair of trainingPairs) {
          if (pair.training_metadata?.quality_score !== null && pair.training_metadata?.quality_score !== undefined) {
            qualityScores.push(pair.training_metadata.quality_score);
          }
        }
      }
      
      // Extract persona name, emotional arc, and training topic from scaffolding_snapshot or first training pair
      const firstPair = trainingPairs[0];
      const personaName = scaffoldingSnapshot?.persona?.name || firstPair?.conversation_metadata?.client_persona || '';
      const emotionalArcName = scaffoldingSnapshot?.emotional_arc?.name || firstPair?.conversation_metadata?.emotional_arc || '';
      const trainingTopicName = scaffoldingSnapshot?.training_topic?.name || firstPair?.conversation_metadata?.training_topic || '';
      
      // Calculate quality tier from training pairs if DB quality_score is null
      let qualityTier = this.mapQualityTier(metadata.quality_score);
      if (!metadata.quality_score && trainingPairs.length > 0) {
        const pairScores = trainingPairs
          .filter((p: any) => p.training_metadata?.quality_score != null)
          .map((p: any) => p.training_metadata.quality_score);
        if (pairScores.length > 0) {
          const avgScore = pairScores.reduce((a: number, b: number) => a + b, 0) / pairScores.length;
          qualityTier = this.mapQualityTier(avgScore);
        }
      }
      
      // Add conversation to conversations array with properly populated scaffolding keys
      fullJSON.conversations.push({
        conversation_metadata: {
          conversation_id: metadata.conversation_id,
          source_file: `fp_conversation_${metadata.conversation_id}.json`,
          created_date: metadata.created_at.split('T')[0],
          total_turns: trainingPairs.length,
          quality_tier: qualityTier,
          scaffolding: {
            persona_key: personaKey,
            persona_name: personaName,
            emotional_arc_key: emotionalArcKey,
            emotional_arc: emotionalArcName,
            training_topic_key: topicKey,
            training_topic: trainingTopicName,
          },
        },
        training_pairs: trainingPairs,
      });
    }
    
    // Calculate summary statistics
    fullJSON.training_file_metadata.total_training_pairs = totalPairs;
    
    if (qualityScores.length > 0) {
      fullJSON.training_file_metadata.quality_summary.avg_quality_score = 
        qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
      fullJSON.training_file_metadata.quality_summary.min_quality_score = Math.min(...qualityScores);
      fullJSON.training_file_metadata.quality_summary.max_quality_score = Math.max(...qualityScores);
    }
    
    return fullJSON;
  }

  private mergeConversationsIntoFullJSON(
    existingJSON: FullTrainingJSON,
    newConversations: any[]
  ): FullTrainingJSON {
    // Clone existing JSON
    const mergedJSON = JSON.parse(JSON.stringify(existingJSON)) as FullTrainingJSON;
    
    let totalPairs = existingJSON.training_file_metadata.total_training_pairs;
    const qualityScores: number[] = [];
    
    // Extract existing quality scores
    for (const conv of existingJSON.conversations) {
      const score = this.reverseMapQualityTier(conv.conversation_metadata.quality_tier);
      if (score) qualityScores.push(score);
    }
    
    // Add new conversations
    for (const conv of newConversations) {
      const enrichedJSON = conv.json;
      const metadata = conv.metadata;
      const trainingPairs = enrichedJSON.training_pairs || [];
      
      totalPairs += trainingPairs.length;
      
      // Extract scaffolding keys from scaffolding_snapshot JSONB (primary) or fall back to DB columns
      const scaffoldingSnapshot = metadata.scaffolding_snapshot || {};
      const personaKey = metadata.persona_key || scaffoldingSnapshot?.persona?.persona_key || '';
      const emotionalArcKey = metadata.emotional_arc_key || scaffoldingSnapshot?.emotional_arc?.arc_key || '';
      const topicKey = metadata.topic_key || scaffoldingSnapshot?.training_topic?.topic_key || '';
      
      // Update scaffolding distribution using extracted keys
      if (personaKey) {
        mergedJSON.training_file_metadata.scaffolding_distribution.personas[personaKey] = 
          (mergedJSON.training_file_metadata.scaffolding_distribution.personas[personaKey] || 0) + 1;
      }
      if (emotionalArcKey) {
        mergedJSON.training_file_metadata.scaffolding_distribution.emotional_arcs[emotionalArcKey] = 
          (mergedJSON.training_file_metadata.scaffolding_distribution.emotional_arcs[emotionalArcKey] || 0) + 1;
      }
      if (topicKey) {
        mergedJSON.training_file_metadata.scaffolding_distribution.training_topics[topicKey] = 
          (mergedJSON.training_file_metadata.scaffolding_distribution.training_topics[topicKey] || 0) + 1;
      }
      
      // Track quality scores - prefer DB column, fall back to enriched JSON training pairs
      if (metadata.quality_score !== null && metadata.quality_score !== undefined) {
        qualityScores.push(metadata.quality_score);
      } else {
        // Extract quality scores from training pairs in enriched JSON
        for (const pair of trainingPairs) {
          if (pair.training_metadata?.quality_score !== null && pair.training_metadata?.quality_score !== undefined) {
            qualityScores.push(pair.training_metadata.quality_score);
          }
        }
      }
      
      // Extract names from scaffolding_snapshot or first training pair
      const firstPair = trainingPairs[0];
      const personaName = scaffoldingSnapshot?.persona?.name || firstPair?.conversation_metadata?.client_persona || '';
      const emotionalArcName = scaffoldingSnapshot?.emotional_arc?.name || firstPair?.conversation_metadata?.emotional_arc || '';
      const trainingTopicName = scaffoldingSnapshot?.training_topic?.name || firstPair?.conversation_metadata?.training_topic || '';
      
      // Calculate quality tier from training pairs if DB quality_score is null
      let qualityTier = this.mapQualityTier(metadata.quality_score);
      if (!metadata.quality_score && trainingPairs.length > 0) {
        const pairScores = trainingPairs
          .filter((p: any) => p.training_metadata?.quality_score != null)
          .map((p: any) => p.training_metadata.quality_score);
        if (pairScores.length > 0) {
          const avgScore = pairScores.reduce((a: number, b: number) => a + b, 0) / pairScores.length;
          qualityTier = this.mapQualityTier(avgScore);
        }
      }
      
      mergedJSON.conversations.push({
        conversation_metadata: {
          conversation_id: metadata.conversation_id,
          source_file: `fp_conversation_${metadata.conversation_id}.json`,
          created_date: metadata.created_at.split('T')[0],
          total_turns: trainingPairs.length,
          quality_tier: qualityTier,
          scaffolding: {
            persona_key: personaKey,
            persona_name: personaName,
            emotional_arc_key: emotionalArcKey,
            emotional_arc: emotionalArcName,
            training_topic_key: topicKey,
            training_topic: trainingTopicName,
          },
        },
        training_pairs: trainingPairs,
      });
    }
    
    // Update metadata
    mergedJSON.training_file_metadata.total_conversations = mergedJSON.conversations.length;
    mergedJSON.training_file_metadata.total_training_pairs = totalPairs;
    mergedJSON.training_file_metadata.last_updated = new Date().toISOString();
    
    if (qualityScores.length > 0) {
      mergedJSON.training_file_metadata.quality_summary.avg_quality_score = 
        qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
      mergedJSON.training_file_metadata.quality_summary.min_quality_score = Math.min(...qualityScores);
      mergedJSON.training_file_metadata.quality_summary.max_quality_score = Math.max(...qualityScores);
    }
    
    return mergedJSON;
  }

  private convertFullJSONToJSONL(fullJSON: FullTrainingJSON): string {
    const lines: string[] = [];
    
    // Optional metadata header
    lines.push(JSON.stringify({
      _meta: {
        file_name: fullJSON.training_file_metadata.file_name,
        total_pairs: fullJSON.training_file_metadata.total_training_pairs,
        version: fullJSON.training_file_metadata.version,
      },
    }));
    
    // Convert each training pair to JSONL line
    for (const conversation of fullJSON.conversations) {
      for (const pair of conversation.training_pairs) {
        // Skip pairs without target_response (turn 1 often has null target)
        if (pair.target_response === null) continue;
        
        const jsonlLine = {
          id: `${pair.id}_${conversation.conversation_metadata.conversation_id.substring(0, 8)}`,
          conversation_id: conversation.conversation_metadata.conversation_id,
          turn_number: pair.turn_number,
          conversation_metadata: pair.conversation_metadata,
          system_prompt: pair.system_prompt,
          conversation_history: pair.conversation_history,
          current_user_input: pair.current_user_input,
          emotional_context: pair.emotional_context,
          target_response: pair.target_response,
          training_metadata: pair.training_metadata,
        };
        
        lines.push(JSON.stringify(jsonlLine));
      }
    }
    
    return lines.join('\n');
  }

  private calculateMetadata(fullJSON: FullTrainingJSON, conversations: any[]): {
    totalTrainingPairs: number;
    avgQualityScore: number;
    minQualityScore: number;
    maxQualityScore: number;
    humanReviewedCount: number;
    scaffoldingDistribution: ScaffoldingDistribution;
  } {
    const qualityScores = conversations
      .map(c => c.metadata.quality_score)
      .filter(s => s !== null && s !== undefined);
    
    return {
      totalTrainingPairs: fullJSON.training_file_metadata.total_training_pairs,
      avgQualityScore: qualityScores.length > 0 
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
        : 0,
      minQualityScore: qualityScores.length > 0 ? Math.min(...qualityScores) : 0,
      maxQualityScore: qualityScores.length > 0 ? Math.max(...qualityScores) : 0,
      humanReviewedCount: 0, // TODO: Track human reviews
      scaffoldingDistribution: fullJSON.training_file_metadata.scaffolding_distribution,
    };
  }

  private mapQualityTier(quality_score: number | null): string {
    if (!quality_score) return 'experimental';
    if (quality_score >= 4.5) return 'seed_dataset';
    if (quality_score >= 3.5) return 'production';
    if (quality_score >= 2.5) return 'experimental';
    return 'rejected';
  }

  private reverseMapQualityTier(tier: string): number | null {
    switch (tier) {
      case 'seed_dataset': return 4.5;
      case 'production': return 3.5;
      case 'experimental': return 3.0;
      case 'rejected': return 2.0;
      default: return null;
    }
  }
}

// Export singleton creator
export const createTrainingFileService = (supabase: SupabaseClient) => {
  return new TrainingFileService(supabase);
};

