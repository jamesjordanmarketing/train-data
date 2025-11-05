/**
 * TypeScript type definitions for the Review Queue system
 * Manages conversation review workflows, quality feedback, and approval processes
 */

import type { ConversationStatus, ReviewAction, QualityMetrics, TierType } from '../../../@/lib/types';

// ============================================================================
// Review Queue Types
// ============================================================================

/**
 * Parameters for fetching the review queue
 */
export interface FetchReviewQueueParams {
  page?: number;
  limit?: number;
  sortBy?: 'quality_score' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  minQuality?: number;
  userId: string; // For auth validation
}

/**
 * Statistics about the review queue
 */
export interface QueueStatistics {
  totalPending: number;
  averageQuality: number;
  oldestPendingDate: string | null;
}

/**
 * Pagination metadata for review queue results
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Complete review queue fetch result
 */
export interface FetchReviewQueueResult {
  data: ConversationRecord[];
  pagination: PaginationMetadata;
  statistics: QueueStatistics;
}

/**
 * Database representation of a conversation (with snake_case fields)
 */
export interface ConversationRecord {
  id: string;
  conversation_id: string;
  title: string;
  status: ConversationStatus;
  tier: TierType;
  category: string[];
  quality_score?: number;
  quality_metrics?: QualityMetrics;
  total_turns: number;
  total_tokens: number;
  parent_id?: string;
  parent_type?: string;
  review_history?: ReviewAction[];
  parameters: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  reviewer_notes?: string;
}

// ============================================================================
// Review Action Types
// ============================================================================

/**
 * Valid review action types
 */
export type ReviewActionType = 'approved' | 'rejected' | 'revision_requested';

/**
 * Parameters for submitting a review action
 */
export interface SubmitReviewActionParams {
  conversationId: string;
  action: ReviewActionType;
  userId: string;
  comment?: string;
  reasons?: string[];
}

/**
 * Result of validating a review action
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  conversation?: ConversationRecord;
}

/**
 * Status mapping for review actions
 */
export const REVIEW_ACTION_STATUS_MAP: Record<ReviewActionType, ConversationStatus> = {
  approved: 'approved',
  rejected: 'rejected',
  revision_requested: 'needs_revision',
};

// ============================================================================
// Quality Feedback Types
// ============================================================================

/**
 * Time window options for feedback aggregation
 */
export type TimeWindow = '7d' | '30d' | 'all';

/**
 * Performance level classification
 */
export type PerformanceLevel = 'high' | 'medium' | 'low';

/**
 * Aggregated feedback for a single template
 */
export interface TemplateFeedback {
  template_id: string;
  template_name: string;
  tier: TierType;
  usage_count: number;
  avg_quality: number;
  approved_count: number;
  rejected_count: number;
  approval_rate: number;
  performance: PerformanceLevel;
}

/**
 * Overall statistics across all templates
 */
export interface OverallFeedbackStats {
  total_templates: number;
  low_performing_count: number;
  avg_approval_rate: number;
}

/**
 * Complete template feedback result
 */
export interface TemplateFeedbackAggregate {
  templates: TemplateFeedback[];
  overall_stats: OverallFeedbackStats;
}

/**
 * Parameters for feedback aggregation
 */
export interface AggregateFeedbackParams {
  timeWindow: TimeWindow;
  minUsageCount?: number;
}

/**
 * Feedback trends over time
 */
export interface FeedbackTrends {
  daily: Array<{
    date: string;
    approvalRate: number;
    avgQuality: number;
    count: number;
  }>;
  byTemplate: Record<string, {
    trend: 'improving' | 'stable' | 'declining';
    recentApprovalRate: number;
    historicalApprovalRate: number;
  }>;
}

// ============================================================================
// Database Function Types
// ============================================================================

/**
 * Parameters for the append_review_action database function
 */
export interface AppendReviewActionParams {
  p_conversation_id: string;
  p_action: ReviewActionType;
  p_performed_by: string;
  p_comment?: string;
  p_reasons?: string[];
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

/**
 * Success response for review action submission
 */
export interface ReviewActionResponse {
  success: boolean;
  conversation: ConversationRecord;
  message: string;
}

// ============================================================================
// Helper Functions for Type Guards
// ============================================================================

/**
 * Type guard to check if action is valid
 */
export function isValidReviewAction(action: string): action is ReviewActionType {
  return ['approved', 'rejected', 'revision_requested'].includes(action);
}

/**
 * Type guard to check if time window is valid
 */
export function isValidTimeWindow(window: string): window is TimeWindow {
  return ['7d', '30d', 'all'].includes(window);
}

/**
 * Calculate performance level based on metrics
 */
export function calculatePerformance(
  approvalRate: number,
  avgQuality: number
): PerformanceLevel {
  if (approvalRate >= 85 && avgQuality >= 8) {
    return 'high';
  }
  if (approvalRate < 70 || avgQuality < 6) {
    return 'low';
  }
  return 'medium';
}

/**
 * Convert time window to PostgreSQL interval
 */
export function timeWindowToInterval(window: TimeWindow): string {
  switch (window) {
    case '7d':
      return '7 days';
    case '30d':
      return '30 days';
    case 'all':
      return '100 years'; // Effectively all data
    default:
      return '30 days';
  }
}

