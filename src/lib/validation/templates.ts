/**
 * Template Validation Schemas
 * Zod schemas for validating Template API requests
 */

import { z } from 'zod';

/**
 * Template Variable Schema
 */
export const templateVariableSchema = z.object({
  name: z.string().min(1, 'Variable name is required'),
  type: z.enum(['text', 'number', 'dropdown'], {
    errorMap: () => ({ message: 'Type must be text, number, or dropdown' }),
  }),
  defaultValue: z.string(),
  helpText: z.string().optional(),
  options: z.array(z.string()).optional(),
});

/**
 * Create Template Schema
 */
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(200, 'Name cannot exceed 200 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required').max(100, 'Category cannot exceed 100 characters'),
  structure: z.string().min(10, 'Structure must be at least 10 characters').max(10000, 'Structure cannot exceed 10000 characters'),
  variables: z.array(templateVariableSchema).default([]),
  tone: z.string().max(50, 'Tone cannot exceed 50 characters').default('professional'),
  complexityBaseline: z.number().min(1, 'Complexity must be at least 1').max(10, 'Complexity cannot exceed 10').default(5),
  styleNotes: z.string().optional(),
  exampleConversation: z.string().optional(),
  qualityThreshold: z.number().min(0, 'Quality threshold must be at least 0').max(10, 'Quality threshold cannot exceed 10').default(6.0),
  requiredElements: z.array(z.string()).default([]),
});

/**
 * Update Template Schema (all fields optional)
 */
export const updateTemplateSchema = createTemplateSchema.partial();

/**
 * Template Query Filters Schema
 */
export const templateFiltersSchema = z.object({
  category: z.string().optional(),
  minRating: z.number().min(0).max(10).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'category', 'averageRating', 'usageCount', 'createdAt', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

/**
 * Duplicate Template Schema
 */
export const duplicateTemplateSchema = z.object({
  newName: z.string().min(1, 'New template name is required').max(200, 'Name cannot exceed 200 characters').optional(),
  includeScenarios: z.boolean().default(false),
});

