/**
 * Type Definitions for Conversations
 * 
 * Matches database schema and provides input/output types for API
 */

import { z } from 'zod';

// ============================================================================
// Enums and Constants
// ============================================================================

export type TierType = 'template' | 'scenario' | 'edge_case';

export type ConversationStatus =
  | 'draft'
  | 'generated'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'needs_revision'
  | 'none'
  | 'failed';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type TrainingValue = 'high' | 'medium' | 'low';

// ============================================================================
// Core Types
// ============================================================================

export interface QualityMetrics {
  overall: number;
  relevance: number;
  accuracy: number;
  naturalness: number;
  methodology: number;
  coherence: number;
  confidence: ConfidenceLevel;
  uniqueness: number;
  trainingValue: TrainingValue;
}

export interface ConversationTurn {
  id: string;
  conversationId: string;
  turnNumber: number;
  role: 'user' | 'assistant';
  content: string;
  tokenCount: number;
  charCount: number;
  createdAt: string;
}

export interface ReviewAction {
  id: string;
  action: 'approved' | 'rejected' | 'revision_requested' | 'generated' | 'moved_to_review';
  performedBy: string;
  timestamp: string;
  comment?: string;
  reasons?: string[];
}

export interface Conversation {
  id: string;
  conversationId: string;
  
  // Foreign Keys
  documentId?: string;
  chunkId?: string;
  
  // Core Metadata
  title?: string;
  persona: string;
  emotion: string;
  topic?: string;
  intent?: string;
  tone?: string;
  
  // Classification
  tier: TierType;
  status: ConversationStatus;
  category: string[];
  
  // Quality Metrics
  qualityScore?: number;
  qualityMetrics?: QualityMetrics;
  confidenceLevel?: ConfidenceLevel;
  
  // Conversation Stats
  turnCount: number;
  totalTokens: number;
  
  // Cost Tracking
  estimatedCostUsd?: number;
  actualCostUsd?: number;
  generationDurationMs?: number;
  
  // Approval Tracking
  approvedBy?: string;
  approvedAt?: string;
  reviewerNotes?: string;
  
  // Relationships
  parentId?: string;
  parentType?: 'template' | 'scenario' | 'conversation';
  
  // Flexible Metadata
  parameters: Record<string, any>;
  reviewHistory: ReviewAction[];
  
  // Error Handling
  errorMessage?: string;
  retryCount: number;
  
  // Audit Fields
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Virtual fields (populated on request)
  turns?: ConversationTurn[];
}

// ============================================================================
// Input Types
// ============================================================================

export interface CreateConversationInput {
  conversationId?: string;
  
  // Foreign Keys (optional)
  documentId?: string;
  chunkId?: string;
  
  // Core Metadata
  title?: string;
  persona: string;
  emotion: string;
  topic?: string;
  intent?: string;
  tone?: string;
  
  // Classification
  tier: TierType;
  status?: ConversationStatus;
  category?: string[];
  
  // Quality Metrics (optional for drafts)
  qualityScore?: number;
  qualityMetrics?: Partial<QualityMetrics>;
  confidenceLevel?: ConfidenceLevel;
  
  // Relationships
  parentId?: string;
  parentType?: 'template' | 'scenario' | 'conversation';
  
  // Metadata
  parameters?: Record<string, any>;
  
  // User context (provided by API layer)
  createdBy: string;
}

export interface UpdateConversationInput {
  // Core Metadata
  title?: string;
  persona?: string;
  emotion?: string;
  topic?: string;
  intent?: string;
  tone?: string;
  
  // Classification
  status?: ConversationStatus;
  category?: string[];
  
  // Quality Metrics
  qualityScore?: number;
  qualityMetrics?: Partial<QualityMetrics>;
  confidenceLevel?: ConfidenceLevel;
  
  // Stats
  turnCount?: number;
  totalTokens?: number;
  
  // Cost Tracking
  estimatedCostUsd?: number;
  actualCostUsd?: number;
  generationDurationMs?: number;
  
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  reviewerNotes?: string;
  
  // Metadata
  parameters?: Record<string, any>;
  reviewHistory?: ReviewAction[];
  
  // Error Handling
  errorMessage?: string;
  retryCount?: number;
}

export interface CreateTurnInput {
  turnNumber: number;
  role: 'user' | 'assistant';
  content: string;
  tokenCount?: number;
  charCount?: number;
}

// ============================================================================
// Filter and Pagination Types
// ============================================================================

export interface FilterConfig {
  tierTypes?: TierType[];
  statuses?: ConversationStatus[];
  qualityRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    from: string;
    to: string;
  };
  categories?: string[];
  personas?: string[];
  emotions?: string[];
  searchQuery?: string;
  parentId?: string;
  createdBy?: string;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedConversations {
  data: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface ConversationStats {
  total: number;
  byTier: Record<TierType, number>;
  byStatus: Record<ConversationStatus, number>;
  avgQualityScore: number;
  totalTokens: number;
  totalCost: number;
  avgTurnsPerConversation: number;
  approvalRate: number;
  pendingReview: number;
}

export interface QualityDistribution {
  excellent: number; // 8-10
  good: number; // 6-7.9
  fair: number; // 4-5.9
  poor: number; // 0-3.9
}

// ============================================================================
// Validation Schemas (Zod)
// ============================================================================

export const TierTypeSchema = z.enum(['template', 'scenario', 'edge_case']);

export const ConversationStatusSchema = z.enum([
  'draft',
  'generated',
  'pending_review',
  'approved',
  'rejected',
  'needs_revision',
  'none',
  'failed',
]);

export const ConfidenceLevelSchema = z.enum(['high', 'medium', 'low']);

export const TrainingValueSchema = z.enum(['high', 'medium', 'low']);

export const QualityMetricsSchema = z.object({
  overall: z.number().min(0).max(10),
  relevance: z.number().min(0).max(10),
  accuracy: z.number().min(0).max(10),
  naturalness: z.number().min(0).max(10),
  methodology: z.number().min(0).max(10),
  coherence: z.number().min(0).max(10),
  confidence: ConfidenceLevelSchema,
  uniqueness: z.number().min(0).max(10),
  trainingValue: TrainingValueSchema,
});

export const CreateConversationSchema = z.object({
  conversationId: z.string().optional(),
  documentId: z.string().uuid().optional(),
  chunkId: z.string().uuid().optional(),
  title: z.string().optional(),
  persona: z.string().min(1, 'Persona is required'),
  emotion: z.string().min(1, 'Emotion is required'),
  topic: z.string().optional(),
  intent: z.string().optional(),
  tone: z.string().optional(),
  tier: TierTypeSchema,
  status: ConversationStatusSchema.optional(),
  category: z.array(z.string()).optional(),
  qualityScore: z.number().min(0).max(10).optional(),
  qualityMetrics: QualityMetricsSchema.partial().optional(),
  confidenceLevel: ConfidenceLevelSchema.optional(),
  parentId: z.string().uuid().optional(),
  parentType: z.enum(['template', 'scenario', 'conversation']).optional(),
  parameters: z.record(z.any()).optional(),
  createdBy: z.string().uuid(),
});

export const UpdateConversationSchema = z.object({
  title: z.string().optional(),
  persona: z.string().optional(),
  emotion: z.string().optional(),
  topic: z.string().optional(),
  intent: z.string().optional(),
  tone: z.string().optional(),
  status: ConversationStatusSchema.optional(),
  category: z.array(z.string()).optional(),
  qualityScore: z.number().min(0).max(10).optional(),
  qualityMetrics: QualityMetricsSchema.partial().optional(),
  confidenceLevel: ConfidenceLevelSchema.optional(),
  turnCount: z.number().int().min(0).optional(),
  totalTokens: z.number().int().min(0).optional(),
  estimatedCostUsd: z.number().min(0).optional(),
  actualCostUsd: z.number().min(0).optional(),
  generationDurationMs: z.number().int().min(0).optional(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),
  reviewerNotes: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  reviewHistory: z.array(z.any()).optional(),
  errorMessage: z.string().optional(),
  retryCount: z.number().int().min(0).optional(),
});

export const CreateTurnSchema = z.object({
  turnNumber: z.number().int().positive(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Content is required'),
  tokenCount: z.number().int().min(0).optional(),
  charCount: z.number().int().min(0).optional(),
});

export const FilterConfigSchema = z.object({
  tierTypes: z.array(TierTypeSchema).optional(),
  statuses: z.array(ConversationStatusSchema).optional(),
  qualityRange: z
    .object({
      min: z.number().min(0).max(10),
      max: z.number().min(0).max(10),
    })
    .optional(),
  dateRange: z
    .object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    })
    .optional(),
  categories: z.array(z.string()).optional(),
  personas: z.array(z.string()).optional(),
  emotions: z.array(z.string()).optional(),
  searchQuery: z.string().optional(),
  parentId: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
});

export const PaginationConfigSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(25),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
});

