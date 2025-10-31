/**
 * Zod Validation Schemas for Export API Endpoints
 * 
 * Provides type-safe validation for all export-related API requests
 */

import { z } from 'zod';

/**
 * Export Config Schema
 * Validates the configuration object for exports
 */
export const ExportConfigSchema = z.object({
  scope: z.enum(['selected', 'filtered', 'all']),
  format: z.enum(['json', 'jsonl', 'csv', 'markdown']),
  includeMetadata: z.boolean().default(true),
  includeQualityScores: z.boolean().default(true),
  includeTimestamps: z.boolean().default(true),
  includeApprovalHistory: z.boolean().default(false),
  includeParentReferences: z.boolean().default(false),
  includeFullContent: z.boolean().default(true),
});

/**
 * Filter Config Schema
 * Validates filter parameters for 'filtered' scope exports
 */
export const FilterConfigSchema = z.object({
  tier: z.array(z.enum(['template', 'scenario', 'edge_case'])).optional(),
  status: z.array(z.enum([
    'draft', 
    'generated', 
    'pending_review', 
    'approved', 
    'rejected', 
    'needs_revision', 
    'none', 
    'failed'
  ])).optional(),
  qualityScoreMin: z.number().min(0).max(100).optional(),
  qualityScoreMax: z.number().min(0).max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  categories: z.array(z.string()).optional(),
  searchQuery: z.string().optional(),
});

/**
 * Export Request Body Schema
 * Validates POST /api/export/conversations request
 */
export const ExportRequestSchema = z.object({
  config: ExportConfigSchema,
  conversationIds: z.array(z.string().uuid()).optional(),
  filters: FilterConfigSchema.optional(),
}).refine(
  (data) => {
    // If scope is 'selected', conversationIds must be provided
    if (data.config.scope === 'selected') {
      return data.conversationIds && data.conversationIds.length > 0;
    }
    // If scope is 'filtered', filters should be provided
    if (data.config.scope === 'filtered') {
      return data.filters !== undefined;
    }
    return true;
  },
  {
    message: "Scope 'selected' requires conversationIds; scope 'filtered' requires filters",
    path: ['config', 'scope'],
  }
);

/**
 * Export History Query Params Schema
 * Validates GET /api/export/history query parameters
 */
export const ExportHistoryQuerySchema = z.object({
  format: z.enum(['json', 'jsonl', 'csv', 'markdown']).optional(),
  status: z.enum(['queued', 'processing', 'completed', 'failed', 'expired']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

/**
 * Type exports for TypeScript
 */
export type ExportConfigInput = z.infer<typeof ExportConfigSchema>;
export type FilterConfigInput = z.infer<typeof FilterConfigSchema>;
export type ExportRequestInput = z.infer<typeof ExportRequestSchema>;
export type ExportHistoryQueryInput = z.infer<typeof ExportHistoryQuerySchema>;

