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

  // Chunk Integration (from chunks-alpha module)
  chunkContext?: string;
  dimensionSource?: DimensionSource;

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

/**
 * Dimension metadata from chunks-alpha semantic analysis
 * Used for parameter selection and quality scoring
 */
export interface DimensionSource {
  chunkId: string;
  dimensions: Record<string, number>; // dimension_name: value (0-1)
  confidence: number; // overall confidence score (0-1)
  extractedAt: string; // ISO 8601 timestamp
  semanticDimensions?: {
    persona?: string[];
    emotion?: string[];
    complexity?: number;
    domain?: string[];
  };
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
  parameters: z.record(z.string(), z.any()).optional(),
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
  parameters: z.record(z.string(), z.any()).optional(),
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

// ============================================================================
// CONVERSATION STORAGE SYSTEM TYPES (File Storage + Metadata)
// ============================================================================
// These types support the conversation storage service that manages
// file storage in Supabase Storage + metadata in PostgreSQL

/**
 * Storage-enabled conversation record matching database schema
 * 
 * CRITICAL: This type does NOT include deprecated URL fields (file_url, raw_response_url)
 * because signed URLs expire. Always use file_path and generate URLs on-demand via:
 * ConversationStorageService.getPresignedDownloadUrl(file_path)
 */
export interface StorageConversation {
  id: string;
  conversation_id: string;

  // Scaffolding references
  persona_id: string | null;
  emotional_arc_id: string | null;
  training_topic_id: string | null;
  template_id: string | null;

  // Scaffolding keys
  persona_key: string | null;
  emotional_arc_key: string | null;
  topic_key: string | null;

  // Metadata
  conversation_name: string | null;
  description: string | null;
  turn_count: number;
  tier: 'template' | 'scenario' | 'edge_case';
  category: string | null;

  // Quality scores
  quality_score: number | null;
  empathy_score: number | null;
  clarity_score: number | null;
  appropriateness_score: number | null;
  brand_voice_alignment: number | null;

  // Processing status
  status: 'pending_review' | 'approved' | 'rejected' | 'archived';
  processing_status: 'queued' | 'processing' | 'completed' | 'failed';

  // File storage - PATHS ONLY, NEVER URLS
  /**
   * Storage path for final conversation JSON
   * Use ConversationStorageService.getPresignedDownloadUrl(file_path) to get download URL
   */
  file_path: string | null;
  file_size: number | null;
  storage_bucket: string; // Always "conversation-files"

  // DEPRECATED FIELDS - Removed from type to prevent usage
  // file_url: REMOVED - signed URLs expire, use file_path + generate on-demand
  // raw_response_url: REMOVED - signed URLs expire, use raw_response_path + generate on-demand

  // Raw response storage (for zero data loss)
  /**
   * Storage path for raw Claude API response
   * Use ConversationStorageService.getPresignedDownloadUrl(raw_response_path) to get download URL
   */
  raw_response_path: string | null;
  raw_response_size: number | null;
  raw_stored_at: string | null;
  parse_attempts: number;
  last_parse_attempt_at: string | null;
  parse_error_message: string | null;
  parse_method_used: string | null;
  requires_manual_review: boolean;

  // Emotional progression
  starting_emotion: string | null;
  ending_emotion: string | null;
  emotional_intensity_start: number | null;
  emotional_intensity_end: number | null;

  // Usage tracking
  usage_count: number;
  last_exported_at: string | null;
  export_count: number;

  // Audit
  created_by: string | null;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;

  // Retention
  expires_at: string | null;
  is_active: boolean;

  // Enrichment pipeline tracking
  enrichment_status: 'not_started' | 'validation_failed' | 'validated' | 'enrichment_in_progress' | 'enriched' | 'normalization_failed' | 'completed';
  validation_report: ValidationResult | null;
  enriched_file_path: string | null;
  enriched_file_size: number | null;
  enriched_at: string | null;
  enrichment_version: string;
  enrichment_error: string | null;
}

/**
 * Individual conversation turn record (normalized storage)
 */
export interface StorageConversationTurn {
  id: string;
  conversation_id: string;
  turn_number: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  detected_emotion: string | null;
  emotion_confidence: number | null;
  emotional_intensity: number | null;
  primary_strategy: string | null;
  tone: string | null;
  word_count: number | null;
  sentence_count: number | null;
  created_at: string;
}

/**
 * Conversation JSON file structure (matches seed dataset format)
 * This is the format stored in Supabase Storage
 */
export interface ConversationJSONFile {
  dataset_metadata: {
    dataset_name: string;
    version: string;
    created_date: string;
    vertical: string;
    consultant_persona: string;
    target_use: string;
    conversation_source: string;
    quality_tier: string;
    total_conversations: number;
    total_turns: number;
    notes: string;
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
  training_pairs: Array<{
    id: string;
    conversation_id: string;
    turn_number: number;
    conversation_metadata?: any;
    system_prompt: string;
    conversation_history: any[];
    current_user_input: string;
    emotional_context: any;
    response_strategy: any;
    target_response: string;
    response_breakdown: any;
    expected_user_response_patterns: any;
    training_metadata: any;
  }>;
}

/**
 * Input for creating a new conversation with file upload
 */
export interface CreateStorageConversationInput {
  conversation_id: string;
  persona_id?: string;
  emotional_arc_id?: string;
  training_topic_id?: string;
  template_id?: string;
  conversation_name?: string;
  file_content: ConversationJSONFile | string;
  created_by: string;
}

/**
 * Filters for querying conversations
 */
export interface StorageConversationFilters {
  status?: StorageConversation['status'];
  tier?: StorageConversation['tier'];
  persona_id?: string;
  emotional_arc_id?: string;
  training_topic_id?: string;
  created_by?: string;
  quality_min?: number;
  quality_max?: number;
}

/**
 * Pagination options
 */
export interface StorageConversationPagination {
  page?: number;
  limit?: number;
  sortBy?: keyof StorageConversation;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Response for list conversations query
 */
export interface StorageConversationListResponse {
  conversations: StorageConversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Response type for download endpoint
 * Contains temporary signed URL generated on-demand
 */
export interface ConversationDownloadResponse {
  conversation_id: string;
  download_url: string; // Signed URL, valid for 1 hour
  filename: string;
  file_size: number | null;
  expires_at: string; // ISO timestamp when signed URL expires
  expires_in_seconds: number; // Always 3600 (1 hour)
}

// ============================================================================
// ENRICHMENT PIPELINE TYPES
// ============================================================================

/**
 * Validation result from ConversationValidationService
 */
export interface ValidationResult {
  isValid: boolean;              // Can enrichment proceed?
  hasBlockers: boolean;          // Are there blocking errors?
  hasWarnings: boolean;          // Are there non-blocking warnings?
  blockers: ValidationIssue[];   // Issues that prevent enrichment
  warnings: ValidationIssue[];   // Issues that don't prevent enrichment
  conversationId: string;
  validatedAt: string;           // ISO 8601 timestamp
  summary: string;               // Human-readable summary
}

/**
 * Individual validation issue (blocker or warning)
 */
export interface ValidationIssue {
  code: string;                  // e.g., "MISSING_REQUIRED_FIELD"
  severity: 'blocker' | 'warning';
  field: string;                 // e.g., "turns[2].emotional_context.primary_emotion"
  message: string;               // Human-readable description
  suggestion?: string;           // How to fix (optional)
}

// ============================================================================
// ENRICHMENT PIPELINE TYPES (Data Enrichment Service)
// ============================================================================

/**
 * Enriched conversation structure (Target format for training data)
 * This is the complete format after enrichment but BEFORE AI analysis fields
 */
export interface EnrichedConversation {
  dataset_metadata: DatasetMetadata;
  consultant_profile: ConsultantProfile;
  training_pairs: TrainingPair[];
  input_parameters?: {
    persona_id: string;
    persona_name: string;
    persona_key: string;
    persona_archetype?: string;
    emotional_arc_id: string;
    emotional_arc_name: string;
    emotional_arc_key: string;
    training_topic_id: string;
    training_topic_name: string;
    training_topic_key: string;
  };
}

/**
 * Dataset-level metadata (top of JSON file)
 */
export interface DatasetMetadata {
  dataset_name: string;           // e.g., "fp_conversation_abc123"
  version: string;                // "1.0.0"
  created_date: string;           // ISO 8601 date
  vertical: string;               // "financial_planning_consultant"
  consultant_persona: string;     // "Elena Morales, CFP - Pathways Financial Planning"
  target_use: string;             // "LoRA fine-tuning for emotionally intelligent chatbot"
  conversation_source: string;    // "synthetic_platform_generated"
  quality_tier: string;           // Mapped from quality_score: "seed_dataset" | "production" | "experimental"
  total_conversations: number;    // Always 1 (single conversation per file)
  total_turns: number;            // From minimal JSON turns.length
  notes: string;                  // e.g., "Generated via template: X"
}

/**
 * Consultant profile (static configuration)
 */
export interface ConsultantProfile {
  name: string;
  business: string;
  expertise: string;
  years_experience: number;
  core_philosophy: {
    principle_1: string;
    principle_2: string;
    principle_3: string;
    principle_4: string;
    principle_5: string;
  };
  communication_style: {
    tone: string;
    techniques: string[];
    avoid: string[];
  };
}

/**
 * Individual training pair (one per turn from minimal JSON)
 */
export interface TrainingPair {
  id: string;                     // e.g., "fp_confusion_to_clarity_turn1"
  conversation_id: string;        // e.g., "fp_confusion_to_clarity"
  turn_number: number;
  
  conversation_metadata: {
    client_persona: string;       // From minimal JSON
    persona_archetype?: string;   // ENRICHED from input_parameters (for LoRA training context)
    client_background: string;    // ENRICHED from personas table or constructed
    emotional_arc?: string;       // ENRICHED from input_parameters (e.g., "Fear → Confidence")
    emotional_arc_key?: string;   // ENRICHED from input_parameters (e.g., "fear_to_confidence")
    training_topic?: string;      // ENRICHED from input_parameters (e.g., "Accelerated Mortgage Payoff")
    training_topic_key?: string;  // ENRICHED from input_parameters (e.g., "mortgage_payoff_strategy")
    session_context: string;      // From minimal JSON
    conversation_phase: string;   // From minimal JSON
    expected_outcome: string;     // From minimal JSON
  };
  
  system_prompt: string;          // ENRICHED from generation_logs or reconstructed
  conversation_history: ConversationHistoryTurn[];  // ENRICHED (built from previous turns)
  current_user_input: string;     // From minimal JSON (user content or previous user for assistant turns)
  
  emotional_context: {
    detected_emotions: {
      primary: string;            // From minimal JSON
      primary_confidence: number; // ENRICHED (default 0.8)
      secondary?: string;          // From minimal JSON
      secondary_confidence?: number; // ENRICHED (default 0.7)
      intensity: number;          // From minimal JSON
      valence: string;            // ENRICHED (calculated from primary emotion)
    };
  };
  
  target_response: string | null; // From minimal JSON (content if role=assistant, else null)
  
  training_metadata: {
    difficulty_level: string;                 // ENRICHED from topic complexity
    key_learning_objective: string;           // ENRICHED from template
    demonstrates_skills: string[];            // ENRICHED from template
    conversation_turn: number;                // From minimal JSON turn_number
    emotional_progression_target: string;     // ENRICHED from emotional_arc
    quality_score: number;                    // ENRICHED from conversations table
    quality_criteria: {                       // ENRICHED (breakdown from quality_score)
      empathy_score: number;
      clarity_score: number;
      appropriateness_score: number;
      brand_voice_alignment: number;
    };
    human_reviewed: boolean;                  // DEFAULT: false
    reviewer_notes: string | null;            // DEFAULT: null
    use_as_seed_example: boolean;             // DEFAULT: false
    generate_variations_count: number;        // DEFAULT: 0
  };
}

/**
 * Conversation history turn (for building context)
 */
export interface ConversationHistoryTurn {
  turn: number;
  role: 'user' | 'assistant';
  content: string;
  emotional_state: {
    primary: string;
    secondary?: string;
    intensity: number;
  };
}

/**
 * Database metadata fetched for enrichment
 */
export interface DatabaseEnrichmentMetadata {
  conversation_id: string;
  created_at: string;
  quality_score: number;
  turn_count: number;
  persona: {
    name: string;
    archetype?: string;
    demographics?: string;
    financial_background?: string;
  } | null;
  emotional_arc: {
    name: string;
    starting_emotion: string;
    ending_emotion: string;
    transformation_pattern?: string;
  } | null;
  training_topic: {
    name: string;
    complexity_level?: string;
  } | null;
  template: {
    name: string;
    code?: string;
    description?: string;
    learning_objectives?: string[];
    skills?: string[];
  } | null;
  generation_log: {
    system_prompt?: string;
  } | null;
}

// ============================================================================
// UI-SPECIFIC TYPES FOR ENRICHMENT PIPELINE
// ============================================================================

/**
 * Validation report API response
 */
export interface ValidationReportResponse {
  conversation_id: string;
  enrichment_status: string;
  processing_status: string;
  validation_report: ValidationResult | null;
  enrichment_error: string | null;
  timeline: {
    raw_stored_at: string | null;
    enriched_at: string | null;
    last_updated: string | null;
  };
  pipeline_stages: PipelineStages;
}

/**
 * Pipeline stages status
 */
export interface PipelineStages {
  stage_1_generation: PipelineStage;
  stage_2_validation: PipelineStage;
  stage_3_enrichment: PipelineStage;
  stage_4_normalization: PipelineStage;
}

/**
 * Individual pipeline stage
 */
export interface PipelineStage {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completed_at: string | null;
}

/**
 * Download URL response
 */
export interface DownloadUrlResponse {
  conversation_id: string;
  download_url: string;
  filename: string;
  file_size: number | null;
  expires_at: string;
  expires_in_seconds: number;
}

