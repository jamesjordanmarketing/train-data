/**
 * Scenario Validation Schemas
 * Zod schemas for validating Scenario API requests
 */

import { z } from 'zod';

/**
 * Generation Status Enum
 */
export const generationStatusSchema = z.enum(['draft', 'queued', 'generating', 'completed', 'failed'], {
  errorMap: () => ({ message: 'Invalid generation status' }),
});

/**
 * Create Scenario Schema
 */
export const createScenarioSchema = z.object({
  templateId: z.string().uuid('Invalid template ID format'),
  name: z.string().min(1, 'Scenario name is required').max(200, 'Name cannot exceed 200 characters'),
  description: z.string().optional(),
  variableValues: z.record(z.string(), z.any()).default({}),
  contextNotes: z.string().optional(),
  targetComplexity: z.number().min(1, 'Complexity must be at least 1').max(10, 'Complexity cannot exceed 10').default(5),
  expectedOutcome: z.string().optional(),
  generationStatus: generationStatusSchema.default('draft'),
  generatedConversation: z.string().optional(),
  qualityScore: z.number().min(0).max(10).optional(),
  generationMetadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Update Scenario Schema (all fields optional)
 */
export const updateScenarioSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  variableValues: z.record(z.string(), z.any()).optional(),
  contextNotes: z.string().optional(),
  targetComplexity: z.number().min(1).max(10).optional(),
  expectedOutcome: z.string().optional(),
  generationStatus: generationStatusSchema.optional(),
  generatedConversation: z.string().optional(),
  qualityScore: z.number().min(0).max(10).optional(),
  generationMetadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Scenario Query Filters Schema
 */
export const scenarioFiltersSchema = z.object({
  templateId: z.string().uuid().optional(),
  generationStatus: generationStatusSchema.optional(),
  minQualityScore: z.number().min(0).max(10).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'generationStatus', 'qualityScore', 'createdAt', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

/**
 * Bulk Create Scenarios Schema
 */
export const bulkCreateScenariosSchema = z.object({
  scenarios: z.array(createScenarioSchema).min(1, 'At least one scenario is required').max(50, 'Cannot create more than 50 scenarios at once'),
});

