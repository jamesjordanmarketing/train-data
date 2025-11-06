/**
 * Shared Type Definitions for Services
 * 
 * Common types used across all service modules for consistency and reusability.
 * 
 * @module ServiceTypes
 */

import type {
  Template,
  Scenario,
  EdgeCase,
  TemplateVariable,
} from '@/lib/types';

// ============================================================================
// Template Service Types
// ============================================================================

/**
 * Input type for creating a new template
 * Omits auto-generated fields (id, usageCount, rating, lastModified)
 */
export type CreateTemplateInput = Omit<
  Template,
  'id' | 'usageCount' | 'rating' | 'lastModified'
>;

/**
 * Input type for updating an existing template
 * All fields are optional except id (which is passed separately)
 */
export type UpdateTemplateInput = Partial<
  Omit<Template, 'id' | 'usageCount' | 'rating' | 'createdBy'>
>;

/**
 * Filter options for querying templates
 */
export interface TemplateFilters {
  /** Filter by category name */
  category?: string;
  /** Filter by minimum rating (0-5) */
  minRating?: number;
  /** Search in name and description */
  search?: string;
  /** Filter by tier type */
  tier?: 'template' | 'scenario' | 'edge_case';
  /** Filter by active status */
  isActive?: boolean;
}

// ============================================================================
// Scenario Service Types
// ============================================================================

/**
 * Generation status for scenarios
 */
export type GenerationStatus = 'not_generated' | 'generated' | 'error';

/**
 * Input type for creating a new scenario
 * Omits auto-generated fields
 */
export type CreateScenarioInput = Omit<
  Scenario,
  | 'id'
  | 'variationCount'
  | 'qualityScore'
  | 'createdAt'
  | 'parentTemplateName'
  | 'generationStatus'
  | 'conversationId'
  | 'errorMessage'
>;

/**
 * Input type for updating an existing scenario
 * All fields are optional except id (which is passed separately)
 */
export type UpdateScenarioInput = Partial<
  Omit<Scenario, 'id' | 'createdAt' | 'createdBy' | 'parentTemplateName'>
>;

/**
 * Filter options for querying scenarios
 */
export interface ScenarioFilters {
  /** Filter by parent template ID */
  parentTemplateId?: string;
  /** Filter by status */
  status?: 'draft' | 'active' | 'archived';
  /** Filter by persona */
  persona?: string;
  /** Filter by topic */
  topic?: string;
  /** Filter by emotional arc */
  emotionalArc?: string;
  /** Filter by generation status */
  generationStatus?: GenerationStatus;
}

// ============================================================================
// Edge Case Service Types
// ============================================================================

/**
 * Edge case type classification
 */
export type EdgeCaseType =
  | 'error_condition'
  | 'boundary_value'
  | 'unusual_input'
  | 'complex_combination'
  | 'failure_scenario';

/**
 * Test status for edge cases
 */
export type TestStatus = 'not_tested' | 'passed' | 'failed';

/**
 * Test results structure
 */
export interface TestResults {
  /** What was expected to happen */
  expectedBehavior: string;
  /** What actually happened */
  actualBehavior: string;
  /** Whether the test passed */
  passed: boolean;
  /** When the test was performed */
  testDate: string;
}

/**
 * Input type for creating a new edge case
 * Omits auto-generated fields
 */
export type CreateEdgeCaseInput = Omit<
  EdgeCase,
  'id' | 'createdAt' | 'parentScenarioName' | 'testStatus' | 'testResults'
>;

/**
 * Input type for updating an existing edge case
 * All fields are optional except id (which is passed separately)
 */
export type UpdateEdgeCaseInput = Partial<
  Omit<EdgeCase, 'id' | 'createdAt' | 'createdBy' | 'parentScenarioName'>
>;

/**
 * Filter options for querying edge cases
 */
export interface EdgeCaseFilters {
  /** Filter by parent scenario ID */
  parentScenarioId?: string;
  /** Filter by edge case type */
  edgeCaseType?: EdgeCaseType;
  /** Filter by exact complexity */
  complexity?: number;
  /** Filter by minimum complexity (1-10) */
  minComplexity?: number;
  /** Filter by maximum complexity (1-10) */
  maxComplexity?: number;
  /** Filter by test status */
  testStatus?: TestStatus;
}

// ============================================================================
// Common Service Types
// ============================================================================

/**
 * Standard delete operation result
 */
export interface DeleteResult {
  /** Whether the delete was successful */
  success: boolean;
  /** Human-readable message about the result */
  message: string;
}

/**
 * Pagination options for list queries
 */
export interface PaginationOptions {
  /** Page number (0-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number (0-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult<T> {
  /** Successfully processed items */
  successful: T[];
  /** Failed items with error messages */
  failed: Array<{
    input: any;
    error: string;
  }>;
  /** Total number of items processed */
  total: number;
  /** Number of successful operations */
  successCount: number;
  /** Number of failed operations */
  failureCount: number;
}

/**
 * Service error structure
 */
export interface ServiceError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** HTTP status code */
  statusCode: number;
  /** Additional error details */
  details?: Record<string, any>;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Field validation error
 */
export interface FieldError {
  /** Field name that failed validation */
  field: string;
  /** Validation error message */
  message: string;
  /** Current value that failed validation */
  value?: any;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Array of validation errors */
  errors: FieldError[];
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if error is a ServiceError
 */
export function isServiceError(error: any): error is ServiceError {
  return (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    'statusCode' in error
  );
}

/**
 * Check if a value is a valid GenerationStatus
 */
export function isGenerationStatus(value: any): value is GenerationStatus {
  return ['not_generated', 'generated', 'error'].includes(value);
}

/**
 * Check if a value is a valid TestStatus
 */
export function isTestStatus(value: any): value is TestStatus {
  return ['not_tested', 'passed', 'failed'].includes(value);
}

/**
 * Check if a value is a valid EdgeCaseType
 */
export function isEdgeCaseType(value: any): value is EdgeCaseType {
  return [
    'error_condition',
    'boundary_value',
    'unusual_input',
    'complex_combination',
    'failure_scenario',
  ].includes(value);
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION: Required<PaginationOptions> = {
  page: 0,
  pageSize: 20,
  sortBy: 'created_at',
  sortOrder: 'desc',
};

/**
 * Maximum page size to prevent performance issues
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Valid edge case types
 */
export const EDGE_CASE_TYPES: EdgeCaseType[] = [
  'error_condition',
  'boundary_value',
  'unusual_input',
  'complex_combination',
  'failure_scenario',
];

/**
 * Valid test statuses
 */
export const TEST_STATUSES: TestStatus[] = ['not_tested', 'passed', 'failed'];

/**
 * Valid generation statuses
 */
export const GENERATION_STATUSES: GenerationStatus[] = [
  'not_generated',
  'generated',
  'error',
];

/**
 * Complexity range
 */
export const COMPLEXITY_RANGE = {
  MIN: 1,
  MAX: 10,
} as const;

/**
 * Rating range
 */
export const RATING_RANGE = {
  MIN: 0,
  MAX: 5,
} as const;

