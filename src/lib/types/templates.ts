/**
 * Type Definitions for Templates, Scenarios, and Edge Cases
 */

import { z } from 'zod';
import { TierType } from './conversations';

// ============================================================================
// Template Types
// ============================================================================

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'dropdown';
  defaultValue: string;
  helpText?: string;
  options?: string[]; // For dropdown type
}

export interface Template {
  id: string;
  templateName: string;
  description?: string;
  category?: string;
  tier?: TierType;
  
  // Template Content
  templateText: string;
  structure?: string; // With {{placeholder}} syntax
  variables: TemplateVariable[];
  
  // Configuration
  tone?: string;
  complexityBaseline?: number;
  styleNotes?: string;
  exampleConversation?: string;
  
  // Quality Control
  qualityThreshold?: number;
  requiredElements?: string[];
  
  // Applicability
  applicablePersonas?: string[];
  applicableEmotions?: string[];
  applicableTopics?: string[];
  
  // Analytics
  usageCount: number;
  rating: number;
  successRate: number;
  
  // Version Control
  version: number;
  isActive: boolean;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface CreateTemplateInput {
  templateName: string;
  description?: string;
  category?: string;
  tier?: TierType;
  templateText: string;
  structure?: string;
  variables?: TemplateVariable[];
  tone?: string;
  complexityBaseline?: number;
  styleNotes?: string;
  exampleConversation?: string;
  qualityThreshold?: number;
  requiredElements?: string[];
  applicablePersonas?: string[];
  applicableEmotions?: string[];
  applicableTopics?: string[];
  createdBy: string;
}

export interface UpdateTemplateInput {
  templateName?: string;
  description?: string;
  category?: string;
  tier?: TierType;
  templateText?: string;
  structure?: string;
  variables?: TemplateVariable[];
  tone?: string;
  complexityBaseline?: number;
  styleNotes?: string;
  exampleConversation?: string;
  qualityThreshold?: number;
  requiredElements?: string[];
  applicablePersonas?: string[];
  applicableEmotions?: string[];
  applicableTopics?: string[];
  isActive?: boolean;
  lastModifiedBy?: string;
}

export interface TemplateFilter {
  tier?: TierType;
  category?: string;
  isActive?: boolean;
  minRating?: number;
  minUsageCount?: number;
}

export interface TemplateStats {
  usageCount: number;
  rating: number;
  successRate: number;
  avgQualityScore?: number;
  conversationsGenerated: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================================================
// Scenario Types
// ============================================================================

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  parentTemplateId?: string;
  
  // Context
  context: string;
  topic?: string;
  persona?: string;
  emotionalArc?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  emotionalContext?: string;
  
  // Parameters
  parameterValues: Record<string, any>;
  tags?: string[];
  
  // Analytics
  variationCount: number;
  qualityScore?: number;
  
  // Status
  status: 'draft' | 'active' | 'archived';
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateScenarioInput {
  name: string;
  description?: string;
  parentTemplateId?: string;
  context: string;
  topic?: string;
  persona?: string;
  emotionalArc?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  emotionalContext?: string;
  parameterValues?: Record<string, any>;
  tags?: string[];
  status?: 'draft' | 'active' | 'archived';
  createdBy: string;
}

export interface UpdateScenarioInput {
  name?: string;
  description?: string;
  parentTemplateId?: string;
  context?: string;
  topic?: string;
  persona?: string;
  emotionalArc?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  emotionalContext?: string;
  parameterValues?: Record<string, any>;
  tags?: string[];
  variationCount?: number;
  qualityScore?: number;
  status?: 'draft' | 'active' | 'archived';
}

export interface ScenarioFilter {
  parentTemplateId?: string;
  status?: 'draft' | 'active' | 'archived';
  complexity?: 'simple' | 'moderate' | 'complex';
  persona?: string;
}

// ============================================================================
// Edge Case Types
// ============================================================================

export interface EdgeCase {
  id: string;
  name: string;
  description: string;
  category?: string;
  
  // Trigger Conditions
  triggerCondition: string;
  expectedBehavior: string;
  
  // Risk Assessment
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  priority?: number;
  
  // Testing
  testScenario?: string;
  validationCriteria?: string[];
  tested: boolean;
  lastTestedAt?: string;
  
  // Relationships
  relatedScenarioIds?: string[];
  parentTemplateId?: string;
  
  // Status
  status: 'active' | 'resolved' | 'deprecated';
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateEdgeCaseInput {
  name: string;
  description: string;
  category?: string;
  triggerCondition: string;
  expectedBehavior: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  priority?: number;
  testScenario?: string;
  validationCriteria?: string[];
  relatedScenarioIds?: string[];
  parentTemplateId?: string;
  status?: 'active' | 'resolved' | 'deprecated';
  createdBy: string;
}

export interface UpdateEdgeCaseInput {
  name?: string;
  description?: string;
  category?: string;
  triggerCondition?: string;
  expectedBehavior?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  priority?: number;
  testScenario?: string;
  validationCriteria?: string[];
  tested?: boolean;
  lastTestedAt?: string;
  relatedScenarioIds?: string[];
  parentTemplateId?: string;
  status?: 'active' | 'resolved' | 'deprecated';
}

export interface EdgeCaseFilter {
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'active' | 'resolved' | 'deprecated';
  tested?: boolean;
  parentTemplateId?: string;
  category?: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

export const TemplateVariableSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['text', 'number', 'dropdown']),
  defaultValue: z.string(),
  helpText: z.string().optional(),
  options: z.array(z.string()).optional(),
});

export const CreateTemplateSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  tier: z.enum(['template', 'scenario', 'edge_case']).optional(),
  templateText: z.string().min(1, 'Template text is required'),
  structure: z.string().optional(),
  variables: z.array(TemplateVariableSchema).optional(),
  tone: z.string().optional(),
  complexityBaseline: z.number().int().min(1).max(10).optional(),
  styleNotes: z.string().optional(),
  exampleConversation: z.string().optional(),
  qualityThreshold: z.number().min(0).max(10).optional(),
  requiredElements: z.array(z.string()).optional(),
  applicablePersonas: z.array(z.string()).optional(),
  applicableEmotions: z.array(z.string()).optional(),
  applicableTopics: z.array(z.string()).optional(),
  createdBy: z.string().uuid(),
});

export const UpdateTemplateSchema = CreateTemplateSchema.partial().omit({ createdBy: true });

export const CreateScenarioSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentTemplateId: z.string().uuid().optional(),
  context: z.string().min(1, 'Context is required'),
  topic: z.string().optional(),
  persona: z.string().optional(),
  emotionalArc: z.string().optional(),
  complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
  emotionalContext: z.string().optional(),
  parameterValues: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  createdBy: z.string().uuid(),
});

export const UpdateScenarioSchema = CreateScenarioSchema.partial().omit({ createdBy: true });

export const CreateEdgeCaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  triggerCondition: z.string().min(1, 'Trigger condition is required'),
  expectedBehavior: z.string().min(1, 'Expected behavior is required'),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  priority: z.number().int().min(1).max(10).optional(),
  testScenario: z.string().optional(),
  validationCriteria: z.array(z.string()).optional(),
  relatedScenarioIds: z.array(z.string().uuid()).optional(),
  parentTemplateId: z.string().uuid().optional(),
  status: z.enum(['active', 'resolved', 'deprecated']).optional(),
  createdBy: z.string().uuid(),
});

export const UpdateEdgeCaseSchema = CreateEdgeCaseSchema.partial().omit({ createdBy: true });

