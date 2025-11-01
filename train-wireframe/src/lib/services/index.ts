/**
 * Services Index
 * 
 * Central export point for all application services
 */

// Batch Generation Services
export {
  BatchGenerationService,
  batchGenerationService,
  type BatchGenerationConfig,
  type BatchJobStatus,
  type ProgressData,
  type BatchJobUpdate
} from './batch-generation-service';

export {
  BatchEstimator,
  batchEstimator,
  type CostEstimate,
  type TimeEstimate,
  type HistoricalStats,
  type BatchEstimateParams
} from './batch-estimator';

// User Preferences Service
export {
  UserPreferencesService,
  userPreferencesService,
  type ServiceResult
} from './user-preferences-service';

// Re-export types from main types file for convenience
export type {
  TierType,
  BatchJob,
  BatchItem,
  Conversation,
  ConversationStatus,
  ConversationTurn,
  UserPreferences,
  NotificationPreferences,
  DefaultFilterPreferences,
  ExportPreferences,
  KeyboardShortcuts,
  QualityThresholds,
  UserPreferencesRecord
} from '../types';

