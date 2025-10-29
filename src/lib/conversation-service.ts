/**
 * Conversation Service
 * 
 * Comprehensive service for managing conversations with CRUD operations,
 * bulk operations, status management, and analytics.
 */

import { supabase } from './supabase';
import {
  Conversation,
  ConversationTurn,
  CreateConversationInput,
  UpdateConversationInput,
  CreateTurnInput,
  FilterConfig,
  PaginationConfig,
  PaginatedConversations,
  ConversationStats,
  QualityDistribution,
  ConversationStatus,
  TierType,
  ReviewAction,
} from './types';
import {
  ConversationNotFoundError,
  DatabaseError,
  BulkOperationError,
  ValidationError,
} from './types/errors';

/**
 * ConversationService class
 * Provides all conversation-related database operations
 */
export class ConversationService {
  /**
   * Create a new conversation
   * 
   * @param data - Conversation creation data
   * @returns Created conversation
   * @throws ValidationError if input is invalid
   * @throws DatabaseError if database operation fails
   * 
   * @example
   * ```typescript
   * const conversation = await conversationService.create({
   *   persona: 'Anxious Investor',
   *   emotion: 'Fear',
   *   tier: 'template',
   *   status: 'draft',
   *   createdBy: userId
   * });
   * ```
   */
  async create(data: CreateConversationInput): Promise<Conversation> {
    try {
      // Generate conversation_id if not provided
      const conversationId = data.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const insertData = {
        conversation_id: conversationId,
        document_id: data.documentId,
        chunk_id: data.chunkId,
        title: data.title,
        persona: data.persona,
        emotion: data.emotion,
        topic: data.topic,
        intent: data.intent,
        tone: data.tone,
        tier: data.tier,
        status: data.status || 'draft',
        category: data.category || [],
        quality_score: data.qualityScore,
        quality_metrics: data.qualityMetrics || {},
        confidence_level: data.confidenceLevel,
        turn_count: 0,
        total_tokens: 0,
        parent_id: data.parentId,
        parent_type: data.parentType,
        parameters: data.parameters || {},
        review_history: [],
        retry_count: 0,
        created_by: data.createdBy,
      };

      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw new DatabaseError(`Failed to create conversation: ${error.message}`, error);
      }

      return this.mapDbToConversation(conversation);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error creating conversation:', error);
      throw new DatabaseError('Unexpected error creating conversation', error as Error);
    }
  }

  /**
   * Get conversation by ID
   * 
   * @param id - Conversation UUID
   * @param includeTurns - Whether to include conversation turns
   * @returns Conversation or null if not found
   * 
   * @example
   * ```typescript
   * const conversation = await conversationService.getById(id, true);
   * if (conversation) {
   *   console.log(`Conversation has ${conversation.turns?.length} turns`);
   * }
   * ```
   */
  async getById(id: string, includeTurns: boolean = false): Promise<Conversation | null> {
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching conversation:', error);
        throw new DatabaseError(`Failed to fetch conversation: ${error.message}`, error);
      }

      const mapped = this.mapDbToConversation(conversation);

      // Fetch turns if requested
      if (includeTurns) {
        mapped.turns = await this.getTurns(id);
      }

      return mapped;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error fetching conversation:', error);
      throw new DatabaseError('Unexpected error fetching conversation', error as Error);
    }
  }

  /**
   * List conversations with filters and pagination
   * 
   * @param filters - Filter configuration
   * @param pagination - Pagination configuration
   * @returns Paginated conversations
   * 
   * @example
   * ```typescript
   * const result = await conversationService.list({
   *   statuses: ['pending_review'],
   *   tierTypes: ['template'],
   *   qualityRange: { min: 0, max: 6 }
   * }, { page: 1, limit: 25 });
   * console.log(`Found ${result.pagination.total} conversations`);
   * ```
   */
  async list(
    filters: FilterConfig = {},
    pagination: PaginationConfig = { page: 1, limit: 25 }
  ): Promise<PaginatedConversations> {
    try {
      let query = supabase.from('conversations').select('*', { count: 'exact' });

      // Apply filters
      if (filters.tierTypes && filters.tierTypes.length > 0) {
        query = query.in('tier', filters.tierTypes);
      }

      if (filters.statuses && filters.statuses.length > 0) {
        query = query.in('status', filters.statuses);
      }

      if (filters.qualityRange) {
        query = query
          .gte('quality_score', filters.qualityRange.min)
          .lte('quality_score', filters.qualityRange.max);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.from)
          .lte('created_at', filters.dateRange.to);
      }

      if (filters.categories && filters.categories.length > 0) {
        query = query.overlaps('category', filters.categories);
      }

      if (filters.personas && filters.personas.length > 0) {
        query = query.in('persona', filters.personas);
      }

      if (filters.emotions && filters.emotions.length > 0) {
        query = query.in('emotion', filters.emotions);
      }

      if (filters.parentId) {
        query = query.eq('parent_id', filters.parentId);
      }

      if (filters.createdBy) {
        query = query.eq('created_by', filters.createdBy);
      }

      if (filters.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,persona.ilike.%${filters.searchQuery}%,emotion.ilike.%${filters.searchQuery}%,topic.ilike.%${filters.searchQuery}%`
        );
      }

      // Apply sorting
      const sortBy = pagination.sortBy || 'created_at';
      const sortDirection = pagination.sortDirection || 'desc';
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.range(offset, offset + pagination.limit - 1);

      const { data: conversations, error, count } = await query;

      if (error) {
        console.error('Error listing conversations:', error);
        throw new DatabaseError(`Failed to list conversations: ${error.message}`, error);
      }

      const mappedConversations = (conversations || []).map(this.mapDbToConversation);
      const totalPages = count ? Math.ceil(count / pagination.limit) : 0;

      return {
        data: mappedConversations,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: count || 0,
          totalPages,
        },
      };
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error listing conversations:', error);
      throw new DatabaseError('Unexpected error listing conversations', error as Error);
    }
  }

  /**
   * Update a conversation
   * 
   * @param id - Conversation UUID
   * @param updates - Partial conversation updates
   * @returns Updated conversation
   * @throws ConversationNotFoundError if conversation doesn't exist
   * 
   * @example
   * ```typescript
   * const updated = await conversationService.update(id, {
   *   status: 'approved',
   *   qualityScore: 8.5,
   *   approvedBy: userId
   * });
   * ```
   */
  async update(id: string, updates: UpdateConversationInput): Promise<Conversation> {
    try {
      // Check if conversation exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new ConversationNotFoundError(id);
      }

      const updateData: any = {};
      
      // Map camelCase to snake_case
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.persona !== undefined) updateData.persona = updates.persona;
      if (updates.emotion !== undefined) updateData.emotion = updates.emotion;
      if (updates.topic !== undefined) updateData.topic = updates.topic;
      if (updates.intent !== undefined) updateData.intent = updates.intent;
      if (updates.tone !== undefined) updateData.tone = updates.tone;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.qualityScore !== undefined) updateData.quality_score = updates.qualityScore;
      if (updates.qualityMetrics !== undefined) updateData.quality_metrics = updates.qualityMetrics;
      if (updates.confidenceLevel !== undefined) updateData.confidence_level = updates.confidenceLevel;
      if (updates.turnCount !== undefined) updateData.turn_count = updates.turnCount;
      if (updates.totalTokens !== undefined) updateData.total_tokens = updates.totalTokens;
      if (updates.estimatedCostUsd !== undefined) updateData.estimated_cost_usd = updates.estimatedCostUsd;
      if (updates.actualCostUsd !== undefined) updateData.actual_cost_usd = updates.actualCostUsd;
      if (updates.generationDurationMs !== undefined) updateData.generation_duration_ms = updates.generationDurationMs;
      if (updates.approvedBy !== undefined) updateData.approved_by = updates.approvedBy;
      if (updates.approvedAt !== undefined) updateData.approved_at = updates.approvedAt;
      if (updates.reviewerNotes !== undefined) updateData.reviewer_notes = updates.reviewerNotes;
      if (updates.parameters !== undefined) updateData.parameters = updates.parameters;
      if (updates.reviewHistory !== undefined) updateData.review_history = updates.reviewHistory;
      if (updates.errorMessage !== undefined) updateData.error_message = updates.errorMessage;
      if (updates.retryCount !== undefined) updateData.retry_count = updates.retryCount;

      const { data: conversation, error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating conversation:', error);
        throw new DatabaseError(`Failed to update conversation: ${error.message}`, error);
      }

      return this.mapDbToConversation(conversation);
    } catch (error) {
      if (error instanceof ConversationNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error updating conversation:', error);
      throw new DatabaseError('Unexpected error updating conversation', error as Error);
    }
  }

  /**
   * Delete a conversation
   * 
   * @param id - Conversation UUID
   * @throws ConversationNotFoundError if conversation doesn't exist
   * 
   * @example
   * ```typescript
   * await conversationService.delete(id);
   * ```
   */
  async delete(id: string): Promise<void> {
    try {
      // Check if conversation exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new ConversationNotFoundError(id);
      }

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting conversation:', error);
        throw new DatabaseError(`Failed to delete conversation: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof ConversationNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error deleting conversation:', error);
      throw new DatabaseError('Unexpected error deleting conversation', error as Error);
    }
  }

  /**
   * Bulk create conversations
   * 
   * @param conversations - Array of conversation creation data
   * @returns Array of created conversations
   * 
   * @example
   * ```typescript
   * const conversations = await conversationService.bulkCreate([
   *   { persona: 'Investor', emotion: 'Curious', tier: 'template', createdBy: userId },
   *   { persona: 'Advisor', emotion: 'Confident', tier: 'scenario', createdBy: userId }
   * ]);
   * ```
   */
  async bulkCreate(conversations: CreateConversationInput[]): Promise<Conversation[]> {
    try {
      const insertData = conversations.map((data) => ({
        conversation_id: data.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        document_id: data.documentId,
        chunk_id: data.chunkId,
        title: data.title,
        persona: data.persona,
        emotion: data.emotion,
        topic: data.topic,
        intent: data.intent,
        tone: data.tone,
        tier: data.tier,
        status: data.status || 'draft',
        category: data.category || [],
        quality_score: data.qualityScore,
        quality_metrics: data.qualityMetrics || {},
        confidence_level: data.confidenceLevel,
        turn_count: 0,
        total_tokens: 0,
        parent_id: data.parentId,
        parent_type: data.parentType,
        parameters: data.parameters || {},
        review_history: [],
        retry_count: 0,
        created_by: data.createdBy,
      }));

      const { data: createdConversations, error } = await supabase
        .from('conversations')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Error bulk creating conversations:', error);
        throw new DatabaseError(`Failed to bulk create conversations: ${error.message}`, error);
      }

      return (createdConversations || []).map(this.mapDbToConversation);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error bulk creating conversations:', error);
      throw new DatabaseError('Unexpected error bulk creating conversations', error as Error);
    }
  }

  /**
   * Bulk update conversations
   * 
   * @param ids - Array of conversation UUIDs
   * @param updates - Updates to apply to all conversations
   * @returns Number of updated conversations
   * 
   * @example
   * ```typescript
   * const count = await conversationService.bulkUpdate(
   *   ['id1', 'id2', 'id3'],
   *   { status: 'approved', approvedBy: userId }
   * );
   * console.log(`Updated ${count} conversations`);
   * ```
   */
  async bulkUpdate(ids: string[], updates: Partial<UpdateConversationInput>): Promise<number> {
    try {
      if (ids.length === 0) return 0;

      const updateData: any = {};
      
      // Map updates
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.qualityScore !== undefined) updateData.quality_score = updates.qualityScore;
      if (updates.approvedBy !== undefined) updateData.approved_by = updates.approvedBy;
      if (updates.approvedAt !== undefined) updateData.approved_at = updates.approvedAt;
      if (updates.reviewerNotes !== undefined) updateData.reviewer_notes = updates.reviewerNotes;
      if (updates.category !== undefined) updateData.category = updates.category;

      const { error, count } = await supabase
        .from('conversations')
        .update(updateData)
        .in('id', ids)
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.error('Error bulk updating conversations:', error);
        throw new DatabaseError(`Failed to bulk update conversations: ${error.message}`, error);
      }

      return count || 0;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error bulk updating conversations:', error);
      throw new DatabaseError('Unexpected error bulk updating conversations', error as Error);
    }
  }

  /**
   * Bulk delete conversations
   * 
   * @param ids - Array of conversation UUIDs
   * @returns Number of deleted conversations
   * 
   * @example
   * ```typescript
   * const count = await conversationService.bulkDelete(['id1', 'id2']);
   * console.log(`Deleted ${count} conversations`);
   * ```
   */
  async bulkDelete(ids: string[]): Promise<number> {
    try {
      if (ids.length === 0) return 0;

      const { error, count } = await supabase
        .from('conversations')
        .delete()
        .in('id', ids)
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.error('Error bulk deleting conversations:', error);
        throw new DatabaseError(`Failed to bulk delete conversations: ${error.message}`, error);
      }

      return count || 0;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error bulk deleting conversations:', error);
      throw new DatabaseError('Unexpected error bulk deleting conversations', error as Error);
    }
  }

  /**
   * Update conversation status with review action
   * 
   * @param id - Conversation UUID
   * @param status - New status
   * @param reviewer - Reviewer user ID
   * @param notes - Optional review notes
   * 
   * @example
   * ```typescript
   * await conversationService.updateStatus(
   *   conversationId,
   *   'approved',
   *   userId,
   *   'Excellent quality, ready for training'
   * );
   * ```
   */
  async updateStatus(
    id: string,
    status: ConversationStatus,
    reviewer?: string,
    notes?: string
  ): Promise<void> {
    try {
      const conversation = await this.getById(id);
      if (!conversation) {
        throw new ConversationNotFoundError(id);
      }

      // Create review action
      const reviewAction: ReviewAction = {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'moved_to_review',
        performedBy: reviewer || conversation.createdBy,
        timestamp: new Date().toISOString(),
        comment: notes,
      };

      const reviewHistory = [...(conversation.reviewHistory || []), reviewAction];

      const updates: UpdateConversationInput = {
        status,
        reviewHistory,
      };

      if (status === 'approved' && reviewer) {
        updates.approvedBy = reviewer;
        updates.approvedAt = new Date().toISOString();
        if (notes) updates.reviewerNotes = notes;
      }

      await this.update(id, updates);
    } catch (error) {
      if (error instanceof ConversationNotFoundError || error instanceof DatabaseError) throw error;
      console.error('Unexpected error updating status:', error);
      throw new DatabaseError('Unexpected error updating status', error as Error);
    }
  }

  /**
   * Bulk approve conversations
   * 
   * @param ids - Array of conversation UUIDs
   * @param reviewerId - Reviewer user ID
   * @returns Number of approved conversations
   * 
   * @example
   * ```typescript
   * const count = await conversationService.bulkApprove(selectedIds, userId);
   * ```
   */
  async bulkApprove(ids: string[], reviewerId: string): Promise<number> {
    try {
      const updates = {
        status: 'approved' as ConversationStatus,
        approvedBy: reviewerId,
        approvedAt: new Date().toISOString(),
      };

      return await this.bulkUpdate(ids, updates);
    } catch (error) {
      console.error('Error bulk approving conversations:', error);
      throw new DatabaseError('Failed to bulk approve conversations', error as Error);
    }
  }

  /**
   * Bulk reject conversations
   * 
   * @param ids - Array of conversation UUIDs
   * @param reviewerId - Reviewer user ID
   * @param reason - Rejection reason
   * @returns Number of rejected conversations
   * 
   * @example
   * ```typescript
   * const count = await conversationService.bulkReject(
   *   selectedIds,
   *   userId,
   *   'Quality score too low'
   * );
   * ```
   */
  async bulkReject(ids: string[], reviewerId: string, reason: string): Promise<number> {
    try {
      const updates = {
        status: 'rejected' as ConversationStatus,
        reviewerNotes: reason,
      };

      return await this.bulkUpdate(ids, updates);
    } catch (error) {
      console.error('Error bulk rejecting conversations:', error);
      throw new DatabaseError('Failed to bulk reject conversations', error as Error);
    }
  }

  /**
   * Get conversations by tier
   * 
   * @param tier - Tier type
   * @param filters - Optional additional filters
   * @returns Array of conversations
   */
  async getByTier(tier: TierType, filters?: FilterConfig): Promise<Conversation[]> {
    const result = await this.list(
      { ...filters, tierTypes: [tier] },
      { page: 1, limit: 1000 }
    );
    return result.data;
  }

  /**
   * Get conversations pending review
   * 
   * @param limit - Maximum number of conversations to return
   * @returns Array of conversations pending review
   */
  async getPendingReview(limit: number = 50): Promise<Conversation[]> {
    const result = await this.list(
      { statuses: ['pending_review'] },
      { page: 1, limit, sortBy: 'quality_score', sortDirection: 'asc' }
    );
    return result.data;
  }

  /**
   * Get conversations by quality score range
   * 
   * @param min - Minimum quality score
   * @param max - Maximum quality score
   * @returns Array of conversations
   */
  async getByQualityRange(min: number, max: number): Promise<Conversation[]> {
    const result = await this.list(
      { qualityRange: { min, max } },
      { page: 1, limit: 1000 }
    );
    return result.data;
  }

  /**
   * Search conversations
   * 
   * @param query - Search query
   * @returns Array of matching conversations
   */
  async search(query: string): Promise<Conversation[]> {
    const result = await this.list(
      { searchQuery: query },
      { page: 1, limit: 100 }
    );
    return result.data;
  }

  /**
   * Get conversation statistics
   * 
   * @returns Conversation statistics
   * 
   * @example
   * ```typescript
   * const stats = await conversationService.getStats();
   * console.log(`Total: ${stats.total}, Avg Quality: ${stats.avgQualityScore}`);
   * ```
   */
  async getStats(): Promise<ConversationStats> {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('tier, status, quality_score, total_tokens, actual_cost_usd, turn_count');

      if (error) {
        throw new DatabaseError(`Failed to get conversation stats: ${error.message}`, error);
      }

      const stats: ConversationStats = {
        total: conversations?.length || 0,
        byTier: {
          template: 0,
          scenario: 0,
          edge_case: 0,
        },
        byStatus: {
          draft: 0,
          generated: 0,
          pending_review: 0,
          approved: 0,
          rejected: 0,
          needs_revision: 0,
          none: 0,
          failed: 0,
        },
        avgQualityScore: 0,
        totalTokens: 0,
        totalCost: 0,
        avgTurnsPerConversation: 0,
        approvalRate: 0,
        pendingReview: 0,
      };

      if (!conversations || conversations.length === 0) return stats;

      let qualitySum = 0;
      let qualityCount = 0;
      let turnsSum = 0;
      let approvedCount = 0;
      let reviewedCount = 0;

      conversations.forEach((conv: any) => {
        // Count by tier
        if (conv.tier) stats.byTier[conv.tier as TierType]++;
        
        // Count by status
        if (conv.status) stats.byStatus[conv.status as ConversationStatus]++;
        
        // Sum quality scores
        if (conv.quality_score !== null && conv.quality_score !== undefined) {
          qualitySum += conv.quality_score;
          qualityCount++;
        }
        
        // Sum tokens and cost
        stats.totalTokens += conv.total_tokens || 0;
        stats.totalCost += conv.actual_cost_usd || 0;
        turnsSum += conv.turn_count || 0;
        
        // Count approval rate
        if (conv.status === 'approved') approvedCount++;
        if (conv.status === 'approved' || conv.status === 'rejected') reviewedCount++;
        if (conv.status === 'pending_review') stats.pendingReview++;
      });

      stats.avgQualityScore = qualityCount > 0 ? qualitySum / qualityCount : 0;
      stats.avgTurnsPerConversation = stats.total > 0 ? turnsSum / stats.total : 0;
      stats.approvalRate = reviewedCount > 0 ? approvedCount / reviewedCount : 0;

      return stats;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error getting stats:', error);
      throw new DatabaseError('Unexpected error getting stats', error as Error);
    }
  }

  /**
   * Get tier distribution
   * 
   * @returns Object with count per tier
   */
  async getTierDistribution(): Promise<Record<TierType, number>> {
    const stats = await this.getStats();
    return stats.byTier;
  }

  /**
   * Get quality distribution
   * 
   * @returns Quality distribution buckets
   */
  async getQualityDistribution(): Promise<QualityDistribution> {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('quality_score')
        .not('quality_score', 'is', null);

      if (error) {
        throw new DatabaseError(`Failed to get quality distribution: ${error.message}`, error);
      }

      const distribution: QualityDistribution = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      };

      conversations?.forEach((conv: any) => {
        const score = conv.quality_score;
        if (score >= 8) distribution.excellent++;
        else if (score >= 6) distribution.good++;
        else if (score >= 4) distribution.fair++;
        else distribution.poor++;
      });

      return distribution;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error getting quality distribution:', error);
      throw new DatabaseError('Unexpected error getting quality distribution', error as Error);
    }
  }

  /**
   * Get conversation turns
   * 
   * @param conversationId - Conversation UUID
   * @returns Array of conversation turns
   */
  async getTurns(conversationId: string): Promise<ConversationTurn[]> {
    try {
      const { data: turns, error } = await supabase
        .from('conversation_turns')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('turn_number', { ascending: true });

      if (error) {
        throw new DatabaseError(`Failed to get conversation turns: ${error.message}`, error);
      }

      return (turns || []).map(this.mapDbToTurn);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error getting turns:', error);
      throw new DatabaseError('Unexpected error getting turns', error as Error);
    }
  }

  /**
   * Create a conversation turn
   * 
   * @param conversationId - Conversation UUID
   * @param turn - Turn creation data
   * @returns Created turn
   */
  async createTurn(conversationId: string, turn: CreateTurnInput): Promise<ConversationTurn> {
    try {
      const insertData = {
        conversation_id: conversationId,
        turn_number: turn.turnNumber,
        role: turn.role,
        content: turn.content,
        token_count: turn.tokenCount || turn.content.split(/\s+/).length * 1.3, // Rough estimate
        char_count: turn.charCount || turn.content.length,
      };

      const { data: createdTurn, error } = await supabase
        .from('conversation_turns')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to create turn: ${error.message}`, error);
      }

      // Update conversation turn count and token count
      const turns = await this.getTurns(conversationId);
      const totalTokens = turns.reduce((sum, t) => sum + t.tokenCount, 0);
      
      await this.update(conversationId, {
        turnCount: turns.length,
        totalTokens,
      });

      return this.mapDbToTurn(createdTurn);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error creating turn:', error);
      throw new DatabaseError('Unexpected error creating turn', error as Error);
    }
  }

  /**
   * Bulk create conversation turns
   * 
   * @param conversationId - Conversation UUID
   * @param turns - Array of turn creation data
   * @returns Array of created turns
   */
  async bulkCreateTurns(conversationId: string, turns: CreateTurnInput[]): Promise<ConversationTurn[]> {
    try {
      const insertData = turns.map((turn) => ({
        conversation_id: conversationId,
        turn_number: turn.turnNumber,
        role: turn.role,
        content: turn.content,
        token_count: turn.tokenCount || turn.content.split(/\s+/).length * 1.3,
        char_count: turn.charCount || turn.content.length,
      }));

      const { data: createdTurns, error } = await supabase
        .from('conversation_turns')
        .insert(insertData)
        .select();

      if (error) {
        throw new DatabaseError(`Failed to bulk create turns: ${error.message}`, error);
      }

      // Update conversation stats
      const allTurns = await this.getTurns(conversationId);
      const totalTokens = allTurns.reduce((sum, t) => sum + t.tokenCount, 0);
      
      await this.update(conversationId, {
        turnCount: allTurns.length,
        totalTokens,
      });

      return (createdTurns || []).map(this.mapDbToTurn);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      console.error('Unexpected error bulk creating turns:', error);
      throw new DatabaseError('Unexpected error bulk creating turns', error as Error);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Map database record to Conversation type
   */
  private mapDbToConversation(dbRecord: any): Conversation {
    return {
      id: dbRecord.id,
      conversationId: dbRecord.conversation_id,
      documentId: dbRecord.document_id,
      chunkId: dbRecord.chunk_id,
      title: dbRecord.title,
      persona: dbRecord.persona,
      emotion: dbRecord.emotion,
      topic: dbRecord.topic,
      intent: dbRecord.intent,
      tone: dbRecord.tone,
      tier: dbRecord.tier,
      status: dbRecord.status,
      category: dbRecord.category || [],
      qualityScore: dbRecord.quality_score,
      qualityMetrics: dbRecord.quality_metrics,
      confidenceLevel: dbRecord.confidence_level,
      turnCount: dbRecord.turn_count,
      totalTokens: dbRecord.total_tokens,
      estimatedCostUsd: dbRecord.estimated_cost_usd,
      actualCostUsd: dbRecord.actual_cost_usd,
      generationDurationMs: dbRecord.generation_duration_ms,
      approvedBy: dbRecord.approved_by,
      approvedAt: dbRecord.approved_at,
      reviewerNotes: dbRecord.reviewer_notes,
      parentId: dbRecord.parent_id,
      parentType: dbRecord.parent_type,
      parameters: dbRecord.parameters || {},
      reviewHistory: dbRecord.review_history || [],
      errorMessage: dbRecord.error_message,
      retryCount: dbRecord.retry_count,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      createdBy: dbRecord.created_by,
    };
  }

  /**
   * Map database record to ConversationTurn type
   */
  private mapDbToTurn(dbRecord: any): ConversationTurn {
    return {
      id: dbRecord.id,
      conversationId: dbRecord.conversation_id,
      turnNumber: dbRecord.turn_number,
      role: dbRecord.role,
      content: dbRecord.content,
      tokenCount: dbRecord.token_count,
      charCount: dbRecord.char_count,
      createdAt: dbRecord.created_at,
    };
  }
}

// Export singleton instance
export const conversationService = new ConversationService();

