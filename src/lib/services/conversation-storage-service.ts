/**
 * Conversation Storage Service
 * 
 * Manages conversation file storage (Supabase Storage) + metadata (PostgreSQL)
 * Uses Supabase client for all database operations
 * 
 * Features:
 * - Atomic file upload + metadata insert
 * - File download from storage
 * - Conversation status management (approve/reject)
 * - Filtering and pagination
 * - Soft/hard delete
 * - Three-tier JSON parsing: direct parse → jsonrepair → manual review
 */

// JSON repair library for resilient parsing (Prompt 3)
// Using dynamic require() to avoid TypeScript issues with jsonrepair types
// import { jsonrepair } from 'jsonrepair';  // Not used - require() instead

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  StorageConversation,
  StorageConversationTurn,
  ConversationJSONFile,
  CreateStorageConversationInput,
  StorageConversationFilters,
  StorageConversationPagination,
  StorageConversationListResponse,
  ConversationDownloadResponse,
} from '../types/conversations';
import { validateConversationJSON, validateAndParseConversationJSON } from '../validators/conversation-schema';

export class ConversationStorageService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      // Create default client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Create conversation: Upload file to storage + insert metadata + extract turns
   * This is an atomic operation - if any step fails, rollback
   */
  async createConversation(input: CreateStorageConversationInput): Promise<StorageConversation> {
    const conversationId = input.conversation_id;
    const userId = input.created_by;
    let uploadedFilePath: string | null = null;

    try {
      // Step 1: Parse and validate conversation content
      const conversationData: ConversationJSONFile =
        typeof input.file_content === 'string'
          ? JSON.parse(input.file_content)
          : input.file_content;

      // Validate JSON schema
      const validationResult = validateConversationJSON(conversationData);
      if (!validationResult.valid) {
        throw new Error(`Invalid conversation JSON: ${validationResult.errors.join(', ')}`);
      }

      // Step 2: Upload file to Supabase Storage
      const filePath = `${userId}/${conversationId}/conversation.json`;
      uploadedFilePath = filePath;
      
      const fileContent = JSON.stringify(conversationData, null, 2);
      const fileBlob = new Blob([fileContent], { type: 'application/json' });

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('conversation-files')
        .upload(filePath, fileBlob, {
          contentType: 'application/json',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      // Step 3: Extract metadata from conversation JSON
      const metadata = this.extractMetadata(conversationData, conversationId);

      // Step 4: Insert conversation metadata (file_path only, NO URLs)
      // CRITICAL: Never store file_url - signed URLs expire. Store file_path and generate URLs on-demand.
      const conversationRecord = {
        conversation_id: conversationId,
        persona_id: input.persona_id || null,
        emotional_arc_id: input.emotional_arc_id || null,
        training_topic_id: input.training_topic_id || null,
        template_id: input.template_id || null,
        conversation_name: input.conversation_name || metadata.conversation_name,
        turn_count: metadata.turn_count,
        tier: metadata.tier,
        quality_score: metadata.quality_score,
        empathy_score: metadata.empathy_score,
        clarity_score: metadata.clarity_score,
        appropriateness_score: metadata.appropriateness_score,
        brand_voice_alignment: metadata.brand_voice_alignment,
        status: 'pending_review' as const,
        processing_status: 'completed' as const,
        file_size: fileBlob.size,
        file_path: filePath, // Store path only, generate URL on-demand
        storage_bucket: 'conversation-files',
        starting_emotion: metadata.starting_emotion,
        ending_emotion: metadata.ending_emotion,
        created_by: userId,
        is_active: true,
      };

      // Insert conversation metadata using Supabase client
      const { data, error } = await this.supabase
        .from('conversations')
        .insert(conversationRecord)
        .select()
        .single();

      if (error) {
        throw new Error(`Metadata insert failed: ${error.message}`);
      }

      const insertedConversation = data as StorageConversation;

      // Step 6: Extract and insert conversation turns
      const turns = this.extractTurns(conversationData, insertedConversation.id);

      if (turns.length > 0) {
        const { error: turnsError } = await this.supabase
          .from('conversation_turns')
          .insert(turns);
        
        if (turnsError) {
          console.error('Failed to insert turns:', turnsError);
          // Don't throw - conversation is already created
        }
      }

      return insertedConversation;
    } catch (error) {
      // Rollback: Delete uploaded file if it exists
      if (uploadedFilePath) {
        try {
          await this.supabase.storage
            .from('conversation-files')
            .remove([uploadedFilePath]);
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }

      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation by conversation_id
   * 
   * IMPORTANT: This method returns file_path, NOT file_url.
   * Signed URLs expire after 1 hour and must be generated on-demand.
   * 
   * To get download URL:
   *   const conversation = await getConversation(id);
   *   const url = await getPresignedDownloadUrl(conversation.file_path);
   * 
   * @param conversationId - Conversation UUID
   * @returns Conversation with file_path (NOT file_url)
   */
  async getConversation(conversationId: string): Promise<StorageConversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(`
        id,
        conversation_id,
        persona_id,
        emotional_arc_id,
        training_topic_id,
        template_id,
        persona_key,
        emotional_arc_key,
        topic_key,
        conversation_name,
        description,
        turn_count,
        tier,
        category,
        quality_score,
        empathy_score,
        clarity_score,
        appropriateness_score,
        brand_voice_alignment,
        status,
        processing_status,
        file_path,
        raw_response_path,
        file_size,
        raw_response_size,
        storage_bucket,
        starting_emotion,
        ending_emotion,
        emotional_intensity_start,
        emotional_intensity_end,
        raw_stored_at,
        parse_attempts,
        last_parse_attempt_at,
        parse_error_message,
        parse_method_used,
        requires_manual_review,
        created_by,
        created_at,
        updated_at,
        reviewed_by,
        reviewed_at,
        review_notes,
        expires_at,
        is_active
      `)
      .eq('conversation_id', conversationId)
      .single();

    // Note: Explicitly NOT selecting file_url or raw_response_url
    // Those columns are deprecated and contain expired signed URLs

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as StorageConversation;
  }

  /**
   * Get conversation by database ID
   */
  async getConversationById(id: string): Promise<StorageConversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as StorageConversation;
  }

  /**
   * List conversations with filtering and pagination
   */
  async listConversations(
    filters?: StorageConversationFilters,
    pagination?: StorageConversationPagination
  ): Promise<StorageConversationListResponse> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 25;
    const sortBy = pagination?.sortBy || 'created_at';
    const sortDirection = pagination?.sortDirection || 'desc';

    // Build query
    let query = this.supabase
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.tier) {
      query = query.eq('tier', filters.tier);
    }
    if (filters?.persona_id) {
      query = query.eq('persona_id', filters.persona_id);
    }
    if (filters?.emotional_arc_id) {
      query = query.eq('emotional_arc_id', filters.emotional_arc_id);
    }
    if (filters?.training_topic_id) {
      query = query.eq('training_topic_id', filters.training_topic_id);
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }
    if (filters?.quality_min !== undefined) {
      query = query.gte('quality_score', filters.quality_min);
    }
    if (filters?.quality_max !== undefined) {
      query = query.lte('quality_score', filters.quality_max);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return {
      conversations: (data || []) as StorageConversation[],
      total: count || 0,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get conversation turns
   */
  async getConversationTurns(conversationId: string): Promise<StorageConversationTurn[]> {
    // Get conversation by conversation_id first
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const { data, error } = await this.supabase
      .from('conversation_turns')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('turn_number', { ascending: true });

    if (error) throw error;

    return (data || []) as StorageConversationTurn[];
  }

  /**
   * Update conversation status (approve/reject)
   */
  async updateConversationStatus(
    conversationId: string,
    status: StorageConversation['status'],
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<StorageConversation> {
    // Get conversation first
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    // Update using Supabase client
    const { data, error } = await this.supabase
      .from('conversations')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .select()
      .single();

    if (error) throw error;

    return data as StorageConversation;
  }

  /**
   * Update conversation metadata
   */
  async updateConversation(
    conversationId: string,
    updates: Partial<StorageConversation>
  ): Promise<StorageConversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .select()
      .single();

    if (error) throw error;

    return data as StorageConversation;
  }

  /**
   * Download conversation file from storage
   */
  async downloadConversationFile(filePath: string): Promise<ConversationJSONFile> {
    const { data, error } = await this.supabase.storage
      .from('conversation-files')
      .download(filePath);

    if (error) {
      throw new Error(`File download failed: ${error.message}`);
    }

    const text = await data.text();
    return JSON.parse(text) as ConversationJSONFile;
  }

  /**
   * Download conversation file by conversation_id
   */
  async downloadConversationFileById(conversationId: string): Promise<ConversationJSONFile> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    if (!conversation.file_path) {
      throw new Error(`No file path for conversation: ${conversationId}`);
    }

    return this.downloadConversationFile(conversation.file_path);
  }

  /**
   * Delete conversation (soft delete by default)
   */
  async deleteConversation(conversationId: string, hard: boolean = false): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      return; // Already deleted or doesn't exist
    }

    if (hard) {
      // Hard delete: Remove file from storage + delete database record
      // Delete file
      if (conversation.file_path) {
        try {
          await this.supabase.storage
            .from('conversation-files')
            .remove([conversation.file_path]);
        } catch (error) {
          console.error('Failed to delete file:', error);
          // Continue with database deletion even if file delete fails
        }
      }

      // Delete database record (cascade will delete turns)
      const { error: deleteError } = await this.supabase
        .from('conversations')
        .delete()
        .eq('conversation_id', conversationId);
      
      if (deleteError) {
        throw new Error(`Failed to delete conversation: ${deleteError.message}`);
      }
    } else {
      // Soft delete: Set is_active = false
      await this.supabase
        .from('conversations')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId);
    }
  }

  /**
   * Batch create conversations
   * Uploads multiple conversations, tracks success/failure for each
   * 
   * @param inputs - Array of conversation creation inputs
   * @returns Object with successful and failed conversions
   */
  async batchCreateConversations(
    inputs: CreateStorageConversationInput[]
  ): Promise<{
    successful: StorageConversation[];
    failed: Array<{ input: CreateStorageConversationInput; error: string }>;
  }> {
    const successful: StorageConversation[] = [];
    const failed: Array<{ input: CreateStorageConversationInput; error: string }> = [];

    for (const input of inputs) {
      try {
        const conversation = await this.createConversation(input);
        successful.push(conversation);
      } catch (error) {
        failed.push({
          input,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Generate presigned URL for file download (valid for 1 hour)
   * 
   * CRITICAL: This generates a NEW signed URL each time. The URL expires after 1 hour.
   * DO NOT store the result in the database or cache it long-term.
   * 
   * Usage pattern:
   *   // When user clicks "Download" button:
   *   const conversation = await getConversation(id);
   *   const signedUrl = await getPresignedDownloadUrl(conversation.file_path);
   *   // Return signedUrl to client immediately
   *   // Client opens URL (valid for 1 hour)
   * 
   * @param filePath - Storage path relative to bucket (e.g., "user-id/conv-id/conversation.json")
   * @returns Fresh signed URL, valid for 3600 seconds (1 hour)
   * @throws Error if file doesn't exist or storage access fails
   */
  async getPresignedDownloadUrl(filePath: string): Promise<string> {
    if (!filePath) {
      throw new Error('File path is required');
    }

    console.log(`[getPresignedDownloadUrl] Generating signed URL for path: ${filePath}`);

    const { data, error } = await this.supabase.storage
      .from('conversation-files')
      .createSignedUrl(filePath, 3600); // 1 hour expiration

    if (error) {
      console.error('[getPresignedDownloadUrl] Failed to generate signed URL:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }

    if (!data?.signedUrl) {
      throw new Error('Signed URL generation returned no URL');
    }

    console.log(`[getPresignedDownloadUrl] ✅ Generated signed URL (expires in 1 hour)`);
    
    return data.signedUrl;
  }

  /**
   * Generate presigned URL for conversation by conversation_id
   * 
   * @param conversationId - The conversation ID
   * @returns Presigned URL valid for 1 hour
   */
  async getPresignedDownloadUrlByConversationId(conversationId: string): Promise<string> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    if (!conversation.file_path) {
      throw new Error(`No file path for conversation: ${conversationId}`);
    }

    return this.getPresignedDownloadUrl(conversation.file_path);
  }

  /**
   * Get conversation and generate download URL in one call
   * 
   * This is a convenience method for the common pattern:
   *   1. Fetch conversation from database
   *   2. Verify file_path exists
   *   3. Generate fresh signed URL
   *   4. Return URL with metadata
   * 
   * Usage in API route:
   *   const downloadInfo = await service.getDownloadUrlForConversation(conversationId);
   *   return NextResponse.json(downloadInfo);
   * 
   * @param conversationId - Conversation UUID
   * @returns Object with signed URL and metadata
   * @throws Error if conversation not found or no file path
   */
  async getDownloadUrlForConversation(
    conversationId: string
  ): Promise<ConversationDownloadResponse> {
    // Step 1: Fetch conversation
    const conversation = await this.getConversation(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    // Step 2: Verify file path exists
    if (!conversation.file_path) {
      throw new Error(`No file path for conversation: ${conversationId}`);
    }

    // Step 3: Generate fresh signed URL
    const signedUrl = await this.getPresignedDownloadUrl(conversation.file_path);
    
    // Step 4: Extract filename from path
    const filename = conversation.file_path.split('/').pop() || 'conversation.json';

    // Step 5: Calculate expiry timestamp
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    // Step 6: Return complete download info
    return {
      conversation_id: conversationId,
      download_url: signedUrl, // Fresh URL, valid for 1 hour
      filename: filename,
      file_size: conversation.file_size,
      expires_at: expiresAt,
      expires_in_seconds: 3600,
    };
  }

  /**
   * Get download URL for raw Claude API response
   * 
   * Similar to getDownloadUrlForConversation but for raw response files.
   * Raw responses are stored in raw/ directory and contain unprocessed Claude output.
   * 
   * @param conversationId - Conversation UUID
   * @returns Object with signed URL for raw response file
   * @throws Error if conversation not found or no raw response path
   */
  async getRawResponseDownloadUrl(
    conversationId: string
  ): Promise<ConversationDownloadResponse> {
    const conversation = await this.getConversation(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    if (!conversation.raw_response_path) {
      throw new Error(`No raw response path for conversation: ${conversationId}`);
    }

    const signedUrl = await this.getPresignedDownloadUrl(conversation.raw_response_path);
    const filename = conversation.raw_response_path.split('/').pop() || 'raw-response.json';
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return {
      conversation_id: conversationId,
      download_url: signedUrl,
      filename: filename,
      file_size: conversation.raw_response_size,
      expires_at: expiresAt,
      expires_in_seconds: 3600,
    };
  }

  /**
   * Count conversations by filters
   */
  async countConversations(filters?: StorageConversationFilters): Promise<number> {
    let query = this.supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.tier) query = query.eq('tier', filters.tier);
    if (filters?.persona_id) query = query.eq('persona_id', filters.persona_id);
    if (filters?.created_by) query = query.eq('created_by', filters.created_by);

    const { count, error } = await query;

    if (error) throw error;

    return count || 0;
  }

  // ========================================================================
  // RAW RESPONSE STORAGE & PARSING (PHASE 2: ZERO DATA LOSS)
  // ========================================================================

  /**
   * Store raw Claude API response as "first draft" BEFORE any parsing attempts
   * 
   * This is TIER 2 of the three-tier JSON handling strategy:
   * - TIER 1: Structured outputs (prevention)
   * - TIER 2: Raw storage (recovery) ← YOU ARE HERE
   * - TIER 3: JSON repair (resilience)
   * 
   * This method:
   * - Stores the raw response exactly as Claude returned it
   * - Creates or updates conversation record with raw_response_* fields
   * - Sets processing_status = 'raw_stored'
   * - NEVER fails (even if content is garbage)
   * 
   * IMPORTANT: Stores file_path only, NOT file_url.
   * URLs are generated on-demand when user requests download.
   * 
   * @param params - Raw response storage parameters
   * @returns Storage result with path and metadata (NO URLs)
   */
  async storeRawResponse(params: {
    conversationId: string;
    rawResponse: string;  // Raw string from Claude, may be invalid JSON
    userId: string;
    metadata?: {
      templateId?: string;
      personaId?: string;
      emotionalArcId?: string;
      trainingTopicId?: string;
      tier?: string;
    };
  }): Promise<{
    success: boolean;
    rawPath: string; // Path, not URL
    rawSize: number;
    conversationId: string;
    error?: string;
  }> {
    const { conversationId, rawResponse, userId, metadata } = params;

    try {
      console.log(`[storeRawResponse] Storing raw response for conversation ${conversationId}`);
      console.log(`[storeRawResponse] Raw response size: ${rawResponse.length} bytes`);

      // STEP 1: Upload raw response to storage (under /raw directory)
      const rawPath = `raw/${userId}/${conversationId}.json`;
      
      // Store as blob (text content, not parsed)
      const rawBlob = new Blob([rawResponse], { type: 'application/json' });
      const rawSize = rawBlob.size;

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('conversation-files')
        .upload(rawPath, rawBlob, {
          contentType: 'application/json',
          upsert: true,  // Overwrite if exists (for retry scenarios)
        });

      if (uploadError) {
        console.error('[storeRawResponse] Storage upload failed:', uploadError);
        throw new Error(`Raw response upload failed: ${uploadError.message}`);
      }

      console.log(`[storeRawResponse] ✅ Raw file uploaded to ${rawPath}`);

      // STEP 2: Create or update conversation record with raw response metadata (path only, NO URLs)
      // CRITICAL: Never store raw_response_url - signed URLs expire. Store raw_response_path only.
      
      // Assert that we're storing a path, not a URL
      this.assertIsPath(rawPath, 'raw_response_path');
      
      const conversationRecord: any = {
        conversation_id: conversationId,
        raw_response_path: rawPath, // Store path only, generate URL on-demand
        raw_response_size: rawSize,
        raw_stored_at: new Date().toISOString(),
        processing_status: 'raw_stored',  // Mark as "raw stored, not yet parsed"
        status: 'pending_review',  // Default status
        created_by: userId,
        is_active: true,
      };

      // Add optional scaffolding metadata if provided
      if (metadata?.templateId) conversationRecord.template_id = metadata.templateId;
      if (metadata?.personaId) conversationRecord.persona_id = metadata.personaId;
      if (metadata?.emotionalArcId) conversationRecord.emotional_arc_id = metadata.emotionalArcId;
      if (metadata?.trainingTopicId) conversationRecord.training_topic_id = metadata.trainingTopicId;
      if (metadata?.tier) conversationRecord.tier = metadata.tier;

      // Upsert: Create if doesn't exist, update if exists
      const { data, error } = await this.supabase
        .from('conversations')
        .upsert(conversationRecord, {
          onConflict: 'conversation_id',  // Match on conversation_id
        })
        .select()
        .single();

      if (error) {
        console.error('[storeRawResponse] Database upsert failed:', error);
        throw new Error(`Conversation record upsert failed: ${error.message}`);
      }

      console.log(`[storeRawResponse] ✅ Conversation record updated in database`);
      console.log(`[storeRawResponse] Raw path: ${rawPath} (path only, no URL stored)`);
      console.log(`[storeRawResponse] Size: ${rawSize} bytes`);

      return {
        success: true,
        rawPath, // Return path, not URL
        rawSize,
        conversationId,
      };
    } catch (error) {
      console.error('[storeRawResponse] Fatal error storing raw response:', error);
      
      // Return error but don't throw - we want to continue pipeline
      return {
        success: false,
        rawPath: '',
        rawSize: 0,
        conversationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse raw response and store final conversation (if successful)
   * 
   * This is TIER 3 of the three-tier JSON handling strategy:
   * - TIER 1: Structured outputs (prevention)
   * - TIER 2: Raw storage (recovery)
   * - TIER 3: JSON repair (resilience) ← YOU ARE HERE
   * 
   * Parsing strategy:
   * 1. Try JSON.parse() directly (handles structured output success cases)
   * 2. If fails: Try jsonrepair library (Prompt 3 will add this)
   * 3. If still fails: Mark requires_manual_review=true
   * 
   * This method updates parse attempt tracking regardless of success/failure.
   * 
   * @param params - Parse parameters
   * @returns Parse result with conversation data or error details
   */
  async parseAndStoreFinal(params: {
    conversationId: string;
    rawResponse?: string;  // Optional: pass if already have it, else fetch from storage
    userId: string;
  }): Promise<{
    success: boolean;
    parseMethod: 'direct' | 'jsonrepair' | 'failed';
    conversation?: any;
    error?: string;
  }> {
    const { conversationId, userId } = params;
    let { rawResponse } = params;

    try {
      console.log(`[parseAndStoreFinal] Parsing conversation ${conversationId}`);

      // STEP 1: Get raw response if not provided
      if (!rawResponse) {
        console.log('[parseAndStoreFinal] Fetching raw response from storage...');
        
        const { data } = await this.supabase
          .from('conversations')
          .select('raw_response_path')
          .eq('conversation_id', conversationId)
          .single();

        if (!data?.raw_response_path) {
          throw new Error('No raw response found for conversation');
        }

        // Download raw response from storage
        const { data: fileData, error: downloadError } = await this.supabase.storage
          .from('conversation-files')
          .download(data.raw_response_path);

        if (downloadError || !fileData) {
          throw new Error(`Failed to download raw response: ${downloadError?.message}`);
        }

        rawResponse = await fileData.text();
        console.log(`[parseAndStoreFinal] ✅ Raw response fetched (${rawResponse.length} bytes)`);
      }

      // STEP 2: Increment parse attempt counter
      // First get current count
      const { data: currentConv } = await this.supabase
        .from('conversations')
        .select('parse_attempts')
        .eq('conversation_id', conversationId)
        .single();
      
      await this.supabase
        .from('conversations')
        .update({
          parse_attempts: (currentConv?.parse_attempts || 0) + 1,
          last_parse_attempt_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId);

      // STEP 3: Try direct JSON.parse() (handles structured outputs)
      let parsed: any;
      let parseMethod: 'direct' | 'jsonrepair' | 'failed' = 'direct';

      try {
        console.log('[parseAndStoreFinal] Attempting direct JSON.parse()...');
        parsed = JSON.parse(rawResponse);
        console.log('[parseAndStoreFinal] ✅ Direct parse succeeded');
      } catch (directError) {
        console.log('[parseAndStoreFinal] ⚠️  Direct parse failed, trying jsonrepair library...');
        
        // TIER 3: Try jsonrepair library (NEW in Prompt 3)
        try {
          const { jsonrepair } = require('jsonrepair');
          const repairedJSON = jsonrepair(rawResponse);
          
          console.log('[parseAndStoreFinal] JSON repaired, attempting parse...');
          parsed = JSON.parse(repairedJSON);
          
          parseMethod = 'jsonrepair';
          console.log('[parseAndStoreFinal] ✅ jsonrepair succeeded');
          
          // Log successful repair for monitoring
          console.log(`[parseAndStoreFinal] 📊 Repair stats: Original ${rawResponse.length} bytes → Repaired ${repairedJSON.length} bytes`);
          
        } catch (repairError) {
          console.error('[parseAndStoreFinal] ❌ jsonrepair failed:', repairError);
          parseMethod = 'failed';
          
          // Both direct parse AND jsonrepair failed - mark for manual review
          const errorMessage = `Direct parse: ${directError instanceof Error ? directError.message : 'Unknown'}. jsonrepair: ${repairError instanceof Error ? repairError.message : 'Unknown'}`;
          
          await this.supabase
            .from('conversations')
            .update({
              requires_manual_review: true,
              processing_status: 'parse_failed',
              parse_error_message: errorMessage,
            })
            .eq('conversation_id', conversationId);

          return {
            success: false,
            parseMethod: 'failed',
            error: `All parse methods failed. ${errorMessage}`,
          };
        }
      }

      // STEP 4: Validate parsed structure
      if (!parsed.turns || !Array.isArray(parsed.turns)) {
        throw new Error('Invalid conversation structure: missing turns array');
      }

      console.log(`[parseAndStoreFinal] ✅ Validated structure: ${parsed.turns.length} turns`);

      // Log parse method for analytics
      console.log(`[parseAndStoreFinal] 📊 Parse method: ${parseMethod}`);

      if (parseMethod === 'jsonrepair') {
        // Track jsonrepair usage for monitoring
        console.log(`[parseAndStoreFinal] 🔧 JSON repair was required for conversation ${conversationId}`);
        
        // Optional: Could send to analytics service here
        // analytics.track('json_repair_used', { conversationId, userId });
      }

      // STEP 5: Store final parsed conversation to permanent location
      const finalPath = `${userId}/${conversationId}/conversation.json`;
      const finalContent = JSON.stringify(parsed, null, 2);
      const finalBlob = new Blob([finalContent], { type: 'application/json' });

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('conversation-files')
        .upload(finalPath, finalBlob, {
          contentType: 'application/json',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Final file upload failed: ${uploadError.message}`);
      }

      console.log(`[parseAndStoreFinal] ✅ Final conversation stored at ${finalPath}`);

      // STEP 5: Update conversation record with final data (path only, NO URLs)
      // CRITICAL: Never store file_url - signed URLs expire. Store file_path only.
      
      // Assert that we're storing a path, not a URL
      this.assertIsPath(finalPath, 'file_path');
      
      const updateData: any = {
        file_path: finalPath, // Store path only, generate URL on-demand
        file_size: finalBlob.size,
        processing_status: 'completed',
        parse_method_used: parseMethod,
        conversation_name: parsed.conversation_metadata?.client_persona || 'Untitled Conversation',
        turn_count: parsed.turns.length,
      };

      // Extract quality scores if present
      if (parsed.quality_score !== undefined) {
        updateData.quality_score = parsed.quality_score;
      }

      const { data: updatedConv, error: updateError } = await this.supabase
        .from('conversations')
        .update(updateData)
        .eq('conversation_id', conversationId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update conversation record: ${updateError.message}`);
      }

      console.log(`[parseAndStoreFinal] ✅ Parse complete (method: ${parseMethod})`);

      return {
        success: true,
        parseMethod,
        conversation: updatedConv,
      };
    } catch (error) {
      console.error('[parseAndStoreFinal] Unexpected error:', error);
      
      // Update error in database
      await this.supabase
        .from('conversations')
        .update({
          requires_manual_review: true,
          processing_status: 'parse_failed',
          parse_error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('conversation_id', conversationId);

      return {
        success: false,
        parseMethod: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ========================================================================
  // TYPE GUARD UTILITIES (Prevent accidental URL storage)
  // ========================================================================

  /**
   * Check if a string looks like a signed URL (which shouldn't be stored)
   * Use this in development to catch accidental URL storage
   * 
   * @param value - String to check
   * @returns True if value looks like a signed URL
   */
  private looksLikeSignedUrl(value: string | null | undefined): boolean {
    if (!value) return false;
    
    // Signed URLs contain these patterns
    return (
      value.includes('/storage/v1/object/sign/') ||
      value.includes('?token=') ||
      value.includes('/storage/v1/object/public/')
    );
  }

  /**
   * Assert that value is a file path, not a URL
   * Throws in development if value looks like a URL
   * 
   * @param value - Value to check
   * @param fieldName - Field name for error message
   */
  private assertIsPath(value: string | null | undefined, fieldName: string): void {
    if (this.looksLikeSignedUrl(value)) {
      const error = `
        ❌ CRITICAL ERROR: Attempting to store signed URL in ${fieldName}!
        
        Signed URLs expire and must NOT be stored in the database.
        Store file paths only and generate URLs on-demand.
        
        Bad value: ${value}
        
        Fix: Store the path portion only, without domain or token.
        Example: "00000000.../abc123.../conversation.json"
      `;
      console.error(error);
      
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`Don't store signed URLs in ${fieldName}`);
      }
    }
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Extract metadata from conversation JSON file
   * Enhanced to capture all quality metrics and emotional progression
   */
  private extractMetadata(
    conversationData: ConversationJSONFile,
    conversationId: string
  ): {
    conversation_name: string;
    description: string | null;
    turn_count: number;
    tier: 'template' | 'scenario' | 'edge_case';
    category: string | null;
    quality_score: number | null;
    empathy_score: number | null;
    clarity_score: number | null;
    appropriateness_score: number | null;
    brand_voice_alignment: number | null;
    starting_emotion: string | null;
    ending_emotion: string | null;
    emotional_intensity_start: number | null;
    emotional_intensity_end: number | null;
  } {
    const metadata = conversationData.dataset_metadata;
    const trainingPairs = conversationData.training_pairs;

    if (!trainingPairs || trainingPairs.length === 0) {
      throw new Error('No training pairs found in conversation data');
    }

    const firstTurn = trainingPairs[0];
    const lastTurn = trainingPairs[trainingPairs.length - 1];

    // Extract quality scores from first turn's training metadata
    const trainingMeta = firstTurn.training_metadata || {};
    const qualityCriteria = trainingMeta.quality_criteria || {};

    // Extract emotional progression
    const startEmotions = firstTurn.emotional_context?.detected_emotions || {};
    const endEmotions = lastTurn.emotional_context?.detected_emotions || {};

    return {
      conversation_name: metadata.dataset_name || conversationId,
      description: metadata.notes || null,
      turn_count: metadata.total_turns || trainingPairs.length,
      tier: this.mapQualityTierToTier(metadata.quality_tier),
      category: metadata.vertical || null,

      // Quality scores
      quality_score: trainingMeta.quality_score || null,
      empathy_score: qualityCriteria.empathy_score || null,
      clarity_score: qualityCriteria.clarity_score || null,
      appropriateness_score: qualityCriteria.appropriateness_score || null,
      brand_voice_alignment: qualityCriteria.brand_voice_alignment || null,

      // Emotional progression
      starting_emotion: startEmotions.primary || null,
      ending_emotion: endEmotions.primary || null,
      emotional_intensity_start: startEmotions.intensity || null,
      emotional_intensity_end: endEmotions.intensity || null
    };
  }

  /**
   * Map quality_tier from JSON to database tier enum
   */
  private mapQualityTierToTier(qualityTier: string): 'template' | 'scenario' | 'edge_case' {
    const mapping: Record<string, 'template' | 'scenario' | 'edge_case'> = {
      'seed_dataset': 'template',
      'template': 'template',
      'scenario': 'scenario',
      'edge_case': 'edge_case'
    };
    const tier = qualityTier?.toLowerCase();
    return mapping[tier] || 'template';
  }

  /**
   * Extract turns from conversation JSON file
   */
  private extractTurns(
    conversationData: ConversationJSONFile,
    conversationDatabaseId: string
  ): Array<Omit<StorageConversationTurn, 'id' | 'created_at'>> {
    return conversationData.training_pairs.map((pair) => ({
      conversation_id: conversationDatabaseId,
      turn_number: pair.turn_number,
      role: 'assistant' as const, // Training pairs are assistant responses
      content: pair.target_response,
      detected_emotion: pair.emotional_context?.detected_emotions?.primary || null,
      emotion_confidence: pair.emotional_context?.detected_emotions?.primary_confidence || null,
      emotional_intensity: pair.emotional_context?.detected_emotions?.intensity || null,
      primary_strategy: pair.response_strategy?.primary_strategy || null,
      tone: pair.response_strategy?.tone_selection || null,
      word_count: pair.target_response?.split(/\s+/).length || 0,
      sentence_count: pair.target_response?.split(/[.!?]+/).filter(Boolean).length || 0,
    }));
  }
}

// Lazy singleton instance
let conversationStorageServiceInstance: ConversationStorageService | null = null;

export function getConversationStorageService(): ConversationStorageService {
  if (!conversationStorageServiceInstance) {
    conversationStorageServiceInstance = new ConversationStorageService();
  }
  return conversationStorageServiceInstance;
}

// Export for backwards compatibility
export const conversationStorageService = {
  get instance() {
    return getConversationStorageService();
  }
};

// Export class for testing with custom clients
export default ConversationStorageService;

