/**
 * Services Index
 * 
 * Central export point for all service layer operations.
 * This module provides the foundational data access layer and
 * AI generation services for the Interactive LoRA Conversation
 * Generation platform.
 * 
 * @module services
 */

// Database Services
export { conversationService } from './conversation-service';
export { batchJobService } from './batch-job-service';
export { generationLogService } from './generation-log-service';

// AI Generation Services
export { 
  ClaudeAPIClient,
  getClaudeAPIClient,
  resetClaudeAPIClient,
  APIError,
} from './claude-api-client';

export {
  TemplateResolver,
  getTemplateResolver,
  resetTemplateResolver,
} from './template-resolver';

export {
  QualityValidator,
  getQualityValidator,
  resetQualityValidator,
} from './quality-validator';

export {
  ConversationGenerationService,
  getConversationGenerationService,
  resetConversationGenerationService,
} from './conversation-generation-service';

export {
  BatchGenerationService,
  getBatchGenerationService,
  resetBatchGenerationService,
} from './batch-generation-service';

// Re-export types for convenience
export type { 
  Conversation, 
  ConversationTurn,
  ConversationStatus,
  ReviewAction,
  FilterConfig,
  TierType,
  BatchJob,
  BatchItem,
  QualityMetrics,
} from '../../../train-wireframe/src/lib/types';

// AI Service Types
export type { 
  GenerationConfig,
  ClaudeAPIResponse,
} from './claude-api-client';

export type {
  ResolvedTemplate,
  ResolveParams,
} from './template-resolver';

export type {
  ValidationResult,
  ConversationForValidation,
} from './quality-validator';

export type {
  GenerationParams,
  GenerationResult,
} from './conversation-generation-service';

export type {
  BatchGenerationRequest,
  BatchJobStatus,
} from './batch-generation-service';
