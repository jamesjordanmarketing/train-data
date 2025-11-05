/**
 * Conversation Service
 * 
 * Database service layer for conversations with full CRUD operations,
 * transaction support, and advanced querying capabilities.
 * 
 * This is the foundational data access layer for the Interactive LoRA 
 * Conversation Generation platform.
 */

import { supabase } from '../supabase';
import type { 
  Conversation, 
  ConversationTurn,
  ConversationStatus,
  ReviewAction,
  FilterConfig,
  TierType
} from '../../../@/lib/types';

/**
 * Conversation Service
 * 
 * Provides CRUD operations and advanced queries for conversations
 * with transaction support for conversation + turns creation.
 */
export const conversationService = {
  /**
   * Create a new conversation with turns in a transaction
   * 
   * @param conversation - Partial conversation data
   * @param turns - Array of conversation turns
   * @returns Created conversation with embedded turns
   * 
   * @example
   * ```typescript
   * const conversation = await conversationService.create(
   *   {
   *     persona: 'Anxious Investor',
   *     emotion: 'Fear',
   *     tier: 'template',
   *     status: 'generated',
   *     createdBy: userId
   *   },
   *   [
   *     { role: 'user', content: '...', timestamp: new Date().toISOString(), tokenCount: 50 },
   *     { role: 'assistant', content: '...', timestamp: new Date().toISOString(), tokenCount: 150 }
   *   ]
 * );
   * ```
   */
  async create(conversation: Partial<Conversation>, turns: ConversationTurn[]): Promise<Conversation> {
    try {
      // Calculate metrics from turns
      const turnCount = turns.length;
      const totalTokens = turns.reduce((sum, turn) => sum + (turn.tokenCount || 0), 0);

      // Step 1: Insert conversation
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: conversation.title || `${conversation.persona} - ${conversation.emotion}`,
          persona: conversation.persona,
          emotion: conversation.emotion,
          tier: conversation.tier,
          category: conversation.category || [],
          status: conversation.status || 'draft',
          quality_score: conversation.qualityScore || 0,
          quality_metrics: conversation.qualityMetrics || {},
          turn_count: turnCount,
          total_tokens: totalTokens,
          parent_id: conversation.parentId,
          parent_type: conversation.parentType,
          parameters: conversation.parameters || {},
          review_history: conversation.reviewHistory || [],
          created_by: conversation.createdBy,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Step 2: Insert turns
      if (turns.length > 0) {
        const turnRecords = turns.map((turn, index) => ({
          conversation_id: convData.id,
          turn_number: index + 1,
          role: turn.role,
          content: turn.content,
          token_count: turn.tokenCount || 0,
        }));

        const { error: turnsError } = await supabase
          .from('conversation_turns')
          .insert(turnRecords);

        if (turnsError) {
          // Rollback: delete conversation if turns insertion fails
          await supabase.from('conversations').delete().eq('id', convData.id);
          throw turnsError;
        }
      }

      // Return conversation with turns embedded
      return {
        id: convData.id,
        title: convData.title,
        persona: convData.persona,
        emotion: convData.emotion,
        tier: convData.tier,
        category: convData.category || [],
        status: convData.status,
        qualityScore: convData.quality_score,
        qualityMetrics: convData.quality_metrics,
        createdAt: convData.created_at,
        updatedAt: convData.updated_at,
        createdBy: convData.created_by,
        turns,
        totalTurns: turnCount,
        totalTokens,
        parentId: convData.parent_id,
        parentType: convData.parent_type,
        parameters: convData.parameters || {},
        reviewHistory: convData.review_history || [],
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  /**
   * Get conversation by ID with optional turns
   * 
   * @param id - Conversation UUID
   * @param includeTurns - Whether to include turns (default: true)
   * @returns Conversation with turns or null if not found
   * 
   * @example
   * ```typescript
   * const conversation = await conversationService.getById(id, true);
   * if (conversation) {
   *   console.log(`Conversation has ${conversation.turns.length} turns`);
   * }
   * ```
   */
  async getById(id: string, includeTurns: boolean = true): Promise<Conversation | null> {
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      // Fetch turns if requested
      let turns: ConversationTurn[] = [];
      if (includeTurns) {
        const { data: turnsData, error: turnsError } = await supabase
          .from('conversation_turns')
          .select('*')
          .eq('conversation_id', id)
          .order('turn_number', { ascending: true });

        if (turnsError) throw turnsError;

        turns = (turnsData || []).map(turn => ({
          role: turn.role,
          content: turn.content,
          timestamp: turn.created_at,
          tokenCount: turn.token_count,
        }));
      }

      return {
        id: conversation.id,
        title: conversation.title,
        persona: conversation.persona,
        emotion: conversation.emotion,
        tier: conversation.tier,
        category: conversation.category || [],
        status: conversation.status,
        qualityScore: conversation.quality_score,
        qualityMetrics: conversation.quality_metrics,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        createdBy: conversation.created_by,
        turns,
        totalTurns: conversation.turn_count,
        totalTokens: conversation.total_tokens,
        parentId: conversation.parent_id,
        parentType: conversation.parent_type,
        parameters: conversation.parameters || {},
        reviewHistory: conversation.review_history || [],
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  /**
   * Get all conversations with filters and pagination
   * 
   * @param filters - Filter configuration
   * @returns Array of conversations (without full turns for performance)
   * 
   * @example
   * ```typescript
   * const conversations = await conversationService.getAll({
   *   tier: ['template'],
   *   status: ['pending_review'],
   *   qualityScoreMin: 6
   * });
   * ```
   */
  async getAll(filters?: FilterConfig): Promise<Conversation[]> {
    try {
      let query = supabase
        .from('conversations')
        .select('*');

      // Apply filters
      if (filters?.tier && filters.tier.length > 0) {
        query = query.in('tier', filters.tier);
      }

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.qualityScoreMin !== undefined) {
        query = query.gte('quality_score', filters.qualityScoreMin);
      }

      if (filters?.qualityScoreMax !== undefined) {
        query = query.lte('quality_score', filters.qualityScoreMax);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters?.categories && filters.categories.length > 0) {
        query = query.overlaps('category', filters.categories);
      }

      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,persona.ilike.%${filters.searchQuery}%,emotion.ilike.%${filters.searchQuery}%`
        );
      }

      // Default ordering
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(conv => ({
        id: conv.id,
        title: conv.title,
        persona: conv.persona,
        emotion: conv.emotion,
        tier: conv.tier,
        category: conv.category || [],
        status: conv.status,
        qualityScore: conv.quality_score,
        qualityMetrics: conv.quality_metrics,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
        createdBy: conv.created_by,
        turns: [], // Not included for performance
        totalTurns: conv.turn_count,
        totalTokens: conv.total_tokens,
        parentId: conv.parent_id,
        parentType: conv.parent_type,
        parameters: conv.parameters || {},
        reviewHistory: conv.review_history || [],
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  /**
   * Update a conversation
   * 
   * @param id - Conversation UUID
   * @param updates - Partial conversation updates (cannot update turns here)
   * @returns Updated conversation
   * 
   * @example
   * ```typescript
   * const updated = await conversationService.update(id, {
   *   status: 'approved',
   *   qualityScore: 8.5,
   *   reviewerNotes: 'Excellent quality'
   * });
   * ```
   */
  async update(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    try {
      const updateData: any = {};

      // Map updates to database fields
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.persona !== undefined) updateData.persona = updates.persona;
      if (updates.emotion !== undefined) updateData.emotion = updates.emotion;
      if (updates.tier !== undefined) updateData.tier = updates.tier;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.qualityScore !== undefined) updateData.quality_score = updates.qualityScore;
      if (updates.qualityMetrics !== undefined) updateData.quality_metrics = updates.qualityMetrics;
      if (updates.parameters !== undefined) updateData.parameters = updates.parameters;
      if (updates.reviewHistory !== undefined) updateData.review_history = updates.reviewHistory;
      if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;
      if (updates.parentType !== undefined) updateData.parent_type = updates.parentType;

      // Auto-update timestamp
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        persona: data.persona,
        emotion: data.emotion,
        tier: data.tier,
        category: data.category || [],
        status: data.status,
        qualityScore: data.quality_score,
        qualityMetrics: data.quality_metrics,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by,
        turns: [],
        totalTurns: data.turn_count,
        totalTokens: data.total_tokens,
        parentId: data.parent_id,
        parentType: data.parent_type,
        parameters: data.parameters || {},
        reviewHistory: data.review_history || [],
      };
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  },

  /**
   * Delete a conversation (soft delete by setting status to 'archived')
   * 
   * @param id - Conversation UUID
   * @param hardDelete - If true, permanently delete the conversation
   * 
   * @example
   * ```typescript
   * await conversationService.delete(id); // Soft delete
   * await conversationService.delete(id, true); // Hard delete
   * ```
   */
  async delete(id: string, hardDelete: boolean = false): Promise<void> {
    try {
      if (hardDelete) {
        // Hard delete - cascade will delete turns automatically
        const { error } = await supabase
          .from('conversations')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } else {
        // Soft delete - set status to 'archived'
        const { error } = await supabase
          .from('conversations')
          .update({ status: 'rejected' as ConversationStatus })
          .eq('id', id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  /**
   * Search conversations by query string
   * 
   * @param query - Search query
   * @returns Array of matching conversations (limited to 50)
   * 
   * @example
   * ```typescript
   * const results = await conversationService.searchConversations('investment');
   * ```
   */
  async searchConversations(query: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(
          `title.ilike.%${query}%,persona.ilike.%${query}%,emotion.ilike.%${query}%,topic.ilike.%${query}%`
        )
        .limit(50)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(conv => ({
        id: conv.id,
        title: conv.title,
        persona: conv.persona,
        emotion: conv.emotion,
        tier: conv.tier,
        category: conv.category || [],
        status: conv.status,
        qualityScore: conv.quality_score,
        qualityMetrics: conv.quality_metrics,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
        createdBy: conv.created_by,
        turns: [],
        totalTurns: conv.turn_count,
        totalTokens: conv.total_tokens,
        parentId: conv.parent_id,
        parentType: conv.parent_type,
        parameters: conv.parameters || {},
        reviewHistory: conv.review_history || [],
      }));
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  },

  /**
   * Get conversations by status
   * 
   * @param status - Conversation status
   * @returns Array of conversations with the specified status
   * 
   * @example
   * ```typescript
   * const pendingReview = await conversationService.getConversationsByStatus('pending_review');
   * ```
   */
  async getConversationsByStatus(status: ConversationStatus): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(conv => ({
        id: conv.id,
        title: conv.title,
        persona: conv.persona,
        emotion: conv.emotion,
        tier: conv.tier,
        category: conv.category || [],
        status: conv.status,
        qualityScore: conv.quality_score,
        qualityMetrics: conv.quality_metrics,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
        createdBy: conv.created_by,
        turns: [],
        totalTurns: conv.turn_count,
        totalTokens: conv.total_tokens,
        parentId: conv.parent_id,
        parentType: conv.parent_type,
        parameters: conv.parameters || {},
        reviewHistory: conv.review_history || [],
      }));
    } catch (error) {
      console.error('Error fetching conversations by status:', error);
      throw error;
    }
  },

  /**
   * Update conversation status with review action
   * 
   * @param id - Conversation UUID
   * @param status - New status
   * @param reviewAction - Optional review action to append to history
   * @returns Updated conversation
   * 
   * @example
   * ```typescript
   * const reviewAction = {
   *   id: 'review_123',
   *   action: 'approved',
   *   performedBy: userId,
   *   timestamp: new Date().toISOString(),
   *   comment: 'Great quality'
   * };
   * await conversationService.updateStatus(id, 'approved', reviewAction);
   * ```
   */
  async updateStatus(
    id: string, 
    status: ConversationStatus, 
    reviewAction?: ReviewAction
  ): Promise<Conversation> {
    try {
      // Get current conversation to append to review history
      const current = await this.getById(id, false);
      if (!current) {
        throw new Error(`Conversation ${id} not found`);
      }

      const reviewHistory = [...current.reviewHistory];
      if (reviewAction) {
        reviewHistory.push(reviewAction);
      }

      const updateData: any = {
        status,
        review_history: reviewHistory,
        updated_at: new Date().toISOString(),
      };

      // Set approval fields if approved
      if (status === 'approved' && reviewAction) {
        updateData.approved_by = reviewAction.performedBy;
        updateData.approved_at = reviewAction.timestamp;
      }

      const { data, error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        persona: data.persona,
        emotion: data.emotion,
        tier: data.tier,
        category: data.category || [],
        status: data.status,
        qualityScore: data.quality_score,
        qualityMetrics: data.quality_metrics,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by,
        turns: [],
        totalTurns: data.turn_count,
        totalTokens: data.total_tokens,
        parentId: data.parent_id,
        parentType: data.parent_type,
        parameters: data.parameters || {},
        reviewHistory: data.review_history || [],
      };
    } catch (error) {
      console.error('Error updating conversation status:', error);
      throw error;
    }
  },
};

