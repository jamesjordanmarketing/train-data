/**
 * Edge Case Validation Schemas
 * Zod schemas for validating Edge Case API requests
 */

import { z } from 'zod';

/**
 * Test Status Enum
 */
export const testStatusSchema = z.enum(['not_tested', 'tested', 'passed', 'failed'], {
  errorMap: () => ({ message: 'Invalid test status' }),
});

/**
 * Severity Enum
 */
export const severitySchema = z.enum(['low', 'medium', 'high', 'critical'], {
  errorMap: () => ({ message: 'Invalid severity level' }),
});

/**
 * Create Edge Case Schema
 */
export const createEdgeCaseSchema = z.object({
  scenarioId: z.string().uuid('Invalid scenario ID format'),
  name: z.string().min(1, 'Edge case name is required').max(200, 'Name cannot exceed 200 characters'),
  description: z.string().optional(),
  triggerCondition: z.string().min(1, 'Trigger condition is required'),
  expectedBehavior: z.string().min(1, 'Expected behavior is required'),
  testStatus: testStatusSchema.default('not_tested'),
  severity: severitySchema.default('medium'),
  actualResult: z.string().optional(),
  notes: z.string().optional(),
  testMetadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Update Edge Case Schema (all fields optional)
 */
export const updateEdgeCaseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  triggerCondition: z.string().min(1).optional(),
  expectedBehavior: z.string().min(1).optional(),
  testStatus: testStatusSchema.optional(),
  severity: severitySchema.optional(),
  actualResult: z.string().optional(),
  notes: z.string().optional(),
  testMetadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Edge Case Query Filters Schema
 */
export const edgeCaseFiltersSchema = z.object({
  scenarioId: z.string().uuid().optional(),
  testStatus: testStatusSchema.optional(),
  severity: severitySchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'testStatus', 'severity', 'createdAt', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

