/**
 * Review Queue Service Layer
 * Business logic for managing conversation review queue operations
 * Handles fetching pending conversations, submitting review actions, and queue statistics
 */

import { supabase } from '../supabase';
import type {
  FetchReviewQueueParams,
  FetchReviewQueueResult,
  SubmitReviewActionParams,
  ConversationRecord,
  QueueStatistics,
  ValidationResult,
  REVIEW_ACTION_STATUS_MAP,
} from '../types/review.types';

// ============================================================================
// Review Queue Fetching
// ============================================================================

/**
 * Fetch conversations in the review queue with pagination and filtering
 * 
 * @param params - Query parameters including pagination, sorting, and filtering
 * @returns Paginated list of conversations with statistics
 * 
 * @example
 * ```typescript
 * const result = await fetchReviewQueue({
 *   page: 1,
 *   limit: 25,
 *   sortBy: 'quality_score',
 *   sortOrder: 'asc',
 *   minQuality: 5,
 *   userId: 'user-123'
 * });
 * ```
 */
export async function fetchReviewQueue(
  params: FetchReviewQueueParams
): Promise<FetchReviewQueueResult> {
  const {
    page = 1,
    limit = 25,
    sortBy = 'quality_score',
    sortOrder = 'asc',
    minQuality,
  } = params;

  try {
    // Build base query
    let query = supabase
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('status', 'pending_review');

    // Apply quality filter if specified
    if (minQuality !== undefined) {
      query = query.gte('quality_score', minQuality);
    }

    // Apply sorting - prioritize low quality and older conversations
    if (sortBy === 'quality_score') {
      query = query.order('quality_score', { ascending: sortOrder === 'asc' });
      // Secondary sort by created_at for consistent ordering
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch review queue: ${error.message}`);
    }

    // Get queue statistics
    const statistics = await getQueueStatistics();

    // Calculate pagination metadata
    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        pages,
      },
      statistics,
    };
  } catch (error) {
    console.error('Error in fetchReviewQueue:', error);
    throw error;
  }
}

/**
 * Get statistical information about the review queue
 * 
 * @returns Statistics including total pending, average quality, and oldest pending date
 */
export async function getQueueStatistics(): Promise<QueueStatistics> {
  try {
    // Get all pending conversations for statistics
    const { data, error } = await supabase
      .from('conversations')
      .select('quality_score, created_at')
      .eq('status', 'pending_review');

    if (error) {
      throw new Error(`Failed to fetch queue statistics: ${error.message}`);
    }

    const conversations = data || [];
    const totalPending = conversations.length;

    // Calculate average quality score
    const qualityScores = conversations
      .map((c) => c.quality_score)
      .filter((score): score is number => score !== null && score !== undefined);
    
    const averageQuality = qualityScores.length > 0
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      : 0;

    // Find oldest pending date
    const oldestPendingDate = conversations.length > 0
      ? conversations.reduce((oldest, current) => {
          return new Date(current.created_at) < new Date(oldest)
            ? current.created_at
            : oldest;
        }, conversations[0].created_at)
      : null;

    return {
      totalPending,
      averageQuality: Math.round(averageQuality * 10) / 10, // Round to 1 decimal
      oldestPendingDate,
    };
  } catch (error) {
    console.error('Error in getQueueStatistics:', error);
    throw error;
  }
}

// ============================================================================
// Review Action Submission
// ============================================================================

/**
 * Submit a review action for a conversation
 * This is an atomic operation that updates status, appends to review history,
 * and sets approval metadata
 * 
 * @param params - Review action parameters
 * @returns Updated conversation record
 * 
 * @example
 * ```typescript
 * const conversation = await submitReviewAction({
 *   conversationId: 'conv-123',
 *   action: 'approved',
 *   userId: 'user-123',
 *   comment: 'Excellent quality conversation',
 *   reasons: ['high_quality', 'meets_requirements']
 * });
 * ```
 */
export async function submitReviewAction(
  params: SubmitReviewActionParams
): Promise<ConversationRecord> {
  const { conversationId, action, userId, comment, reasons } = params;

  try {
    // Step 1: Validate the review action
    const validation = await validateReviewAction(conversationId, action);
    if (!validation.valid) {
      throw new Error(validation.error || 'Validation failed');
    }

    // Step 2: Determine new status based on action
    const statusMap: Record<string, string> = {
      approved: 'approved',
      rejected: 'rejected',
      revision_requested: 'needs_revision',
    };
    const newStatus = statusMap[action];

    if (!newStatus) {
      throw new Error(`Invalid action: ${action}`);
    }

    // Step 3: Use database function to append review action atomically
    const { data: appendResult, error: appendError } = await supabase.rpc(
      'append_review_action',
      {
        p_conversation_id: conversationId,
        p_action: action,
        p_performed_by: userId,
        p_comment: comment || null,
        p_reasons: reasons || null,
      }
    );

    if (appendError) {
      throw new Error(
        `Failed to append review action: ${appendError.message}`
      );
    }

    // Step 4: Update conversation status and metadata
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Set approval-specific fields
    if (action === 'approved') {
      updateData.approved_by = userId;
      updateData.approved_at = new Date().toISOString();
    }

    // Add reviewer notes if comment provided
    if (comment) {
      updateData.reviewer_notes = comment;
    }

    const { data: updatedConversation, error: updateError } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `Failed to update conversation status: ${updateError.message}`
      );
    }

    if (!updatedConversation) {
      throw new Error('No conversation returned after update');
    }

    return updatedConversation;
  } catch (error) {
    console.error('Error in submitReviewAction:', error);
    throw error;
  }
}

/**
 * Validate that a review action can be performed on a conversation
 * 
 * @param conversationId - ID of the conversation to validate
 * @param action - Review action to validate
 * @returns Validation result with error message if invalid
 */
export async function validateReviewAction(
  conversationId: string,
  action: string
): Promise<ValidationResult> {
  try {
    // Check if conversation exists
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      return {
        valid: false,
        error: 'Conversation not found',
      };
    }

    // Check if conversation is in a valid state for review
    const validStates = ['pending_review', 'needs_revision'];
    if (!validStates.includes(conversation.status)) {
      return {
        valid: false,
        error: `Conversation status '${conversation.status}' is not eligible for review`,
        conversation,
      };
    }

    // Check if action is valid
    const validActions = ['approved', 'rejected', 'revision_requested'];
    if (!validActions.includes(action)) {
      return {
        valid: false,
        error: `Invalid review action: ${action}`,
        conversation,
      };
    }

    return {
      valid: true,
      conversation,
    };
  } catch (error) {
    console.error('Error in validateReviewAction:', error);
    return {
      valid: false,
      error: 'Validation failed due to server error',
    };
  }
}

// ============================================================================
// Bulk Operations (Future Enhancement)
// ============================================================================

/**
 * Submit multiple review actions in batch
 * Note: This performs sequential operations, not a true database transaction
 * 
 * @param actions - Array of review actions to submit
 * @returns Results for each action (success or error)
 */
export async function submitBulkReviewActions(
  actions: SubmitReviewActionParams[]
): Promise<Array<{ conversationId: string; success: boolean; error?: string }>> {
  const results = [];

  for (const action of actions) {
    try {
      await submitReviewAction(action);
      results.push({
        conversationId: action.conversationId,
        success: true,
      });
    } catch (error) {
      results.push({
        conversationId: action.conversationId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Get review history for a specific conversation
 * 
 * @param conversationId - ID of the conversation
 * @returns Array of review actions
 */
export async function getReviewHistory(conversationId: string) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('review_history')
      .eq('id', conversationId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch review history: ${error.message}`);
    }

    return data?.review_history || [];
  } catch (error) {
    console.error('Error in getReviewHistory:', error);
    throw error;
  }
}

/**
 * Get conversations by status
 * 
 * @param status - Conversation status to filter by
 * @param limit - Maximum number of conversations to return
 * @returns Array of conversations
 */
export async function getConversationsByStatus(
  status: string,
  limit: number = 100
): Promise<ConversationRecord[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getConversationsByStatus:', error);
    throw error;
  }
}

