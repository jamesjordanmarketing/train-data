/**
 * Service Layer Types
 * 
 * Common types used across service implementations
 */

// ============================================================================
// Service Response Types
// ============================================================================

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface BulkOperationResult {
  successCount: number;
  failedCount: number;
  successfulIds: string[];
  failedIds: string[];
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// ============================================================================
// Query Builder Types
// ============================================================================

export interface QueryOptions {
  includeRelated?: boolean;
  includeTurns?: boolean;
  includeMetrics?: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
}

export interface CachedResult<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

