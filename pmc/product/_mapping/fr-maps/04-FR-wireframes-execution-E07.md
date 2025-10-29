# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E07)
**Generated**: 2025-01-29  
**Segment**: E07 - Template Management, Scenarios, and Edge Cases  
**Total Prompts**: 8  
**Estimated Implementation Time**: 60-80 hours

## Executive Summary

This segment implements the complete three-tier template management system (FR7.1.1, FR7.1.2, FR7.1.3) that enables users to create, manage, and organize conversation templates, scenarios, and edge cases. This system forms the foundation for the LoRA training data generation workflow, providing:

1. **Template Management** - Reusable prompt templates with variable substitution
2. **Scenario Library** - Real-world conversation scenarios based on templates
3. **Edge Case Repository** - Boundary conditions and unusual situations for robust training

**Strategic Importance**: This segment completes the content management layer that enables business experts to define conversation patterns without technical knowledge. It bridges the gap between high-level business requirements and concrete conversation generation.

## Context and Dependencies

### Previous Segment Deliverables

Based on the existing codebase analysis:

**Completed Foundation (Stages 1 & 2)**:
- ✅ Database infrastructure (Supabase integration)
- ✅ Document categorization and chunk extraction modules
- ✅ 60-dimensional semantic analysis complete
- ✅ Basic authentication and user management
- ✅ Core UI component library (Shadcn/UI)
- ✅ State management (Zustand store)

**Wireframe Implementation (Current State)**:
- ✅ Basic view components exist (`TemplatesView.tsx`, `ScenariosView.tsx`, `EdgeCasesView.tsx`)
- ✅ UI layouts implemented with placeholder functionality
- ✅ TypeScript type definitions complete (`types.ts`)
- ✅ Mock data structure in place
- ⚠️ **No backend integration** - all actions show "coming soon" toasts
- ⚠️ **No database schema** - templates, scenarios, edge cases not persisted
- ⚠️ **No API routes** - no CRUD operations implemented
- ⚠️ **No service layer** - no data access abstractions

### Current Codebase State

**Existing Wireframe Components** (`train-wireframe/src/components/views/`):

1. **TemplatesView.tsx** (Lines 1-109):
   - Card-based grid layout displaying template metadata
   - Dropdown menu with View/Edit/Delete actions (non-functional)
   - Shows: name, description, category, rating, usage count, variables
   - New Template button (placeholder)
   - **Missing**: Modal forms, API integration, real CRUD operations

2. **ScenariosView.tsx** (Lines 1-200):
   - Table-based layout with checkbox selection
   - Bulk generation UI with selection counter
   - Status badges: not_generated, generated, error
   - Generate/Regenerate buttons per row (placeholders)
   - **Missing**: Generation workflow, API integration, parameter forms

3. **EdgeCasesView.tsx** (Lines 1-88):
   - Card-based grid with type-specific color coding
   - Test status indicators (passed/failed/not_tested)
   - Type filters (error_condition, boundary_value, etc.)
   - **Missing**: Test execution interface, auto-generation feature, API integration

**Type Definitions** (`train-wireframe/src/lib/types.ts`):

```typescript
// Lines 57-74: Template type (complete)
export type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: string; // Template text with {{placeholders}}
  variables: TemplateVariable[];
  tone: string;
  complexityBaseline: number;
  styleNotes?: string;
  exampleConversation?: string;
  qualityThreshold: number;
  requiredElements: string[];
  usageCount: number;
  rating: number;
  lastModified: string;
  createdBy: string;
};

// Lines 85-104: Scenario type (complete)
export type Scenario = {
  id: string;
  name: string;
  description: string;
  parentTemplateId: string;
  parentTemplateName: string;
  context: string;
  parameterValues: Record<string, any>;
  variationCount: number;
  status: 'draft' | 'active' | 'archived';
  qualityScore: number;
  createdAt: string;
  createdBy: string;
  topic: string;
  persona: string;
  emotionalArc: string;
  generationStatus: 'not_generated' | 'generated' | 'error';
  conversationId?: string;
  errorMessage?: string;
};

// Lines 106-121: EdgeCase type (complete)
export type EdgeCase = {
  id: string;
  title: string;
  description: string;
  parentScenarioId: string;
  parentScenarioName: string;
  edgeCaseType: 'error_condition' | 'boundary_value' | 'unusual_input' | 'complex_combination' | 'failure_scenario';
  complexity: number;
  testStatus: 'not_tested' | 'passed' | 'failed';
  testResults?: { ... };
  createdAt: string;
  createdBy: string;
};
```

**State Management** (`train-wireframe/src/stores/useAppStore.ts`):
- Mock templates, scenarios, edgeCases arrays exist
- No persistence layer
- No CRUD action methods

**Existing Services** (`src/lib/`):
- `database.ts` - Generic database service pattern
- `supabase.ts` - Supabase client configuration
- API response logging service exists from chunk extraction module

### Cross-Segment Dependencies

**Dependencies on Other Modules**:
1. **Supabase Database** - Existing connection and configuration
2. **Authentication** - User context for createdBy fields
3. **Chunks Module** - Scenarios may reference chunk content for context

**Modules Depending on This Segment**:
1. **Conversation Generation** (E08+) - Will use templates to generate conversations
2. **Batch Processing** (E09+) - Will use scenarios for bulk generation
3. **Quality Validation** (E10+) - Will validate against template quality thresholds

## Implementation Strategy

### Risk Assessment

**High-Risk Tasks**:
1. **Database Schema Cascading Rules** (T-1.1.0)
   - **Risk**: Template deletion with dependent scenarios can cause data loss
   - **Mitigation**: Implement RESTRICT constraints, require confirmation dialogs, add soft delete option

2. **Variable Substitution Engine** (T-3.1.0)
   - **Risk**: Complex template parsing with nested/conditional variables
   - **Mitigation**: Start with simple placeholder replacement, iterate to advanced features

3. **CSV Bulk Import** (T-3.2.3)
   - **Risk**: Invalid CSV data causing batch failures
   - **Mitigation**: Implement preview/validation phase before import, provide detailed error messages

**Medium-Risk Tasks**:
1. **Template Testing Interface** (T-2.2.3)
   - **Risk**: Real API calls during testing consume credits
   - **Mitigation**: Add dry-run mode, cost warnings before test execution

2. **Auto-Generate Edge Cases** (T-3.3.0)
   - **Risk**: AI-generated edge cases may be irrelevant or low quality
   - **Mitigation**: Implement review/approval workflow, allow editing before saving

### Prompt Sequencing Logic

**Phase 1: Foundation (Prompts 1-2)**
- Database schema must be established first as foundation for all other work
- Service layer follows immediately to abstract database operations
- **Rationale**: All UI and API work depends on data persistence

**Phase 2: API Layer (Prompt 3)**
- RESTful endpoints enable frontend-backend integration
- Can be developed in parallel with UI work once services exist
- **Rationale**: Clean separation allows testing with Postman before UI integration

**Phase 3: Core UI (Prompts 4-6)**
- Complete CRUD functionality for each entity type
- Build incrementally: Templates → Scenarios → Edge Cases
- **Rationale**: Templates are foundational, scenarios depend on templates, edge cases depend on scenarios

**Phase 4: Advanced Features (Prompts 7-8)**
- Variable substitution, import/export, auto-generation
- Build after core CRUD is stable and tested
- **Rationale**: These are enhancements that require solid foundation

### Quality Assurance Approach

**Per-Prompt Validation**:
1. **Database Prompts**: Execute SQL in Supabase, verify schema with test data
2. **Service Prompts**: Unit test each CRUD method with mock data
3. **API Prompts**: Test all endpoints with Postman/curl, verify status codes and responses
4. **UI Prompts**: Manual testing of all user workflows, verify error handling

**Integration Testing**:
1. End-to-end workflow: Create template → Create scenario → Create edge case → Delete in reverse order
2. Cascade prevention: Verify templates with scenarios cannot be deleted
3. Bulk operations: Test with 10+ items to verify performance
4. Import/export: Round-trip test (export → import → verify data match)

**Performance Targets**:
- Database queries: < 100ms for indexed lookups
- API endpoints: < 500ms response time
- UI interactions: < 200ms for local state updates
- Bulk import: < 5 seconds for 100 scenarios

## Database Setup Instructions

### Required SQL Operations

The following SQL must be executed in the Supabase SQL Editor before any application code. These statements create the three core tables with proper relationships and constraints.

**Execution Order**: Run in sequence (1 → 2 → 3) to respect foreign key dependencies.

========================

```sql
-- ============================================================================
-- TEMPLATE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- E07: Templates, Scenarios, and Edge Cases
-- Version: 1.0.0
-- Date: 2025-01-29
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLE 1: templates
-- Description: Stores reusable prompt templates with variable definitions
-- Dependencies: None (foundation table)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.templates (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Fields
    name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
    description TEXT,
    category TEXT NOT NULL CHECK (length(category) BETWEEN 1 AND 100),
    
    -- Template Structure
    structure TEXT NOT NULL CHECK (length(structure) BETWEEN 10 AND 10000),
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Metadata
    tone TEXT DEFAULT 'professional' CHECK (length(tone) <= 50),
    complexity_baseline INTEGER DEFAULT 5 CHECK (complexity_baseline BETWEEN 1 AND 10),
    style_notes TEXT,
    example_conversation TEXT,
    
    -- Quality Control
    quality_threshold NUMERIC(3,1) DEFAULT 6.0 CHECK (quality_threshold BETWEEN 0 AND 10),
    required_elements TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating BETWEEN 0 AND 5),
    
    -- Audit Fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_modified TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT template_name_unique UNIQUE (name),
    CONSTRAINT template_variables_is_array CHECK (jsonb_typeof(variables) = 'array')
);

-- Indexes for performance
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_rating ON public.templates(rating DESC);
CREATE INDEX idx_templates_usage_count ON public.templates(usage_count DESC);
CREATE INDEX idx_templates_created_by ON public.templates(created_by);
CREATE INDEX idx_templates_created_at ON public.templates(created_at DESC);

-- GIN index for JSONB variable search
CREATE INDEX idx_templates_variables_gin ON public.templates USING GIN(variables);

-- Function to update last_modified timestamp
CREATE OR REPLACE FUNCTION public.update_templates_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_modified
CREATE TRIGGER trigger_update_templates_last_modified
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_templates_last_modified();

-- Row Level Security (RLS) - Enable multi-tenancy
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all templates (read-only for now)
CREATE POLICY "Templates are viewable by all authenticated users"
    ON public.templates FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Users can insert their own templates
CREATE POLICY "Users can insert their own templates"
    ON public.templates FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own templates
CREATE POLICY "Users can update their own templates"
    ON public.templates FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

-- Policy: Users can delete their own templates (with cascade check)
CREATE POLICY "Users can delete their own templates"
    ON public.templates FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);


-- ----------------------------------------------------------------------------
-- TABLE 2: scenarios
-- Description: Conversation scenarios based on templates with parameter values
-- Dependencies: templates table (foreign key: parent_template_id)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.scenarios (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Fields
    name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
    description TEXT,
    
    -- Template Relationship
    parent_template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE RESTRICT,
    parent_template_name TEXT NOT NULL, -- Denormalized for display
    
    -- Context
    context TEXT NOT NULL CHECK (length(context) BETWEEN 1 AND 5000),
    parameter_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Variation Tracking
    variation_count INTEGER DEFAULT 0 CHECK (variation_count >= 0),
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    quality_score NUMERIC(3,1) DEFAULT 0.0 CHECK (quality_score BETWEEN 0 AND 10),
    
    -- Conversation Generation
    topic TEXT NOT NULL CHECK (length(topic) BETWEEN 1 AND 100),
    persona TEXT NOT NULL CHECK (length(persona) BETWEEN 1 AND 100),
    emotional_arc TEXT NOT NULL CHECK (length(emotional_arc) BETWEEN 1 AND 100),
    generation_status TEXT DEFAULT 'not_generated' CHECK (generation_status IN ('not_generated', 'generated', 'error')),
    conversation_id UUID, -- Reference to generated conversation (nullable)
    error_message TEXT,
    
    -- Audit Fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT scenario_parameter_values_is_object CHECK (jsonb_typeof(parameter_values) = 'object')
);

-- Indexes for performance
CREATE INDEX idx_scenarios_parent_template ON public.scenarios(parent_template_id);
CREATE INDEX idx_scenarios_status ON public.scenarios(status);
CREATE INDEX idx_scenarios_generation_status ON public.scenarios(generation_status);
CREATE INDEX idx_scenarios_persona ON public.scenarios(persona);
CREATE INDEX idx_scenarios_topic ON public.scenarios(topic);
CREATE INDEX idx_scenarios_created_by ON public.scenarios(created_by);
CREATE INDEX idx_scenarios_created_at ON public.scenarios(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_scenarios_template_status ON public.scenarios(parent_template_id, generation_status);

-- GIN index for JSONB parameter search
CREATE INDEX idx_scenarios_parameter_values_gin ON public.scenarios USING GIN(parameter_values);

-- Row Level Security (RLS)
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all scenarios
CREATE POLICY "Scenarios are viewable by all authenticated users"
    ON public.scenarios FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Users can insert their own scenarios
CREATE POLICY "Users can insert their own scenarios"
    ON public.scenarios FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own scenarios
CREATE POLICY "Users can update their own scenarios"
    ON public.scenarios FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

-- Policy: Users can delete their own scenarios
CREATE POLICY "Users can delete their own scenarios"
    ON public.scenarios FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);


-- ----------------------------------------------------------------------------
-- TABLE 3: edge_cases
-- Description: Edge cases and boundary conditions for scenario testing
-- Dependencies: scenarios table (foreign key: parent_scenario_id)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.edge_cases (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Fields
    title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 2000),
    
    -- Scenario Relationship
    parent_scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE RESTRICT,
    parent_scenario_name TEXT NOT NULL, -- Denormalized for display
    
    -- Classification
    edge_case_type TEXT NOT NULL CHECK (edge_case_type IN (
        'error_condition',
        'boundary_value',
        'unusual_input',
        'complex_combination',
        'failure_scenario'
    )),
    
    -- Complexity
    complexity INTEGER NOT NULL CHECK (complexity BETWEEN 1 AND 10),
    
    -- Testing
    test_status TEXT DEFAULT 'not_tested' CHECK (test_status IN ('not_tested', 'passed', 'failed')),
    test_results JSONB DEFAULT NULL,
    
    -- Audit Fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT edge_case_test_results_is_object CHECK (
        test_results IS NULL OR jsonb_typeof(test_results) = 'object'
    )
);

-- Indexes for performance
CREATE INDEX idx_edge_cases_parent_scenario ON public.edge_cases(parent_scenario_id);
CREATE INDEX idx_edge_cases_type ON public.edge_cases(edge_case_type);
CREATE INDEX idx_edge_cases_test_status ON public.edge_cases(test_status);
CREATE INDEX idx_edge_cases_complexity ON public.edge_cases(complexity DESC);
CREATE INDEX idx_edge_cases_created_by ON public.edge_cases(created_by);
CREATE INDEX idx_edge_cases_created_at ON public.edge_cases(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_edge_cases_scenario_status ON public.edge_cases(parent_scenario_id, test_status);

-- GIN index for JSONB test results search
CREATE INDEX idx_edge_cases_test_results_gin ON public.edge_cases USING GIN(test_results);

-- Row Level Security (RLS)
ALTER TABLE public.edge_cases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all edge cases
CREATE POLICY "Edge cases are viewable by all authenticated users"
    ON public.edge_cases FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Users can insert their own edge cases
CREATE POLICY "Users can insert their own edge cases"
    ON public.edge_cases FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own edge cases
CREATE POLICY "Users can update their own edge cases"
    ON public.edge_cases FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

-- Policy: Users can delete their own edge cases
CREATE POLICY "Users can delete their own edge cases"
    ON public.edge_cases FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);


-- ----------------------------------------------------------------------------
-- HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function to get scenario count for a template
CREATE OR REPLACE FUNCTION public.get_template_scenario_count(template_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.scenarios WHERE parent_template_id = template_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get edge case count for a scenario
CREATE OR REPLACE FUNCTION public.get_scenario_edge_case_count(scenario_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.edge_cases WHERE parent_scenario_id = scenario_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to safely delete template (checks for dependencies)
CREATE OR REPLACE FUNCTION public.safe_delete_template(template_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    scenario_count INTEGER;
BEGIN
    -- Check for dependent scenarios
    SELECT COUNT(*) INTO scenario_count
    FROM public.scenarios
    WHERE parent_template_id = template_id;
    
    IF scenario_count > 0 THEN
        RETURN QUERY SELECT false, format('Cannot delete template: %s dependent scenarios exist', scenario_count);
    ELSE
        DELETE FROM public.templates WHERE id = template_id;
        RETURN QUERY SELECT true, 'Template deleted successfully';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to safely delete scenario (checks for dependencies)
CREATE OR REPLACE FUNCTION public.safe_delete_scenario(scenario_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    edge_case_count INTEGER;
BEGIN
    -- Check for dependent edge cases
    SELECT COUNT(*) INTO edge_case_count
    FROM public.edge_cases
    WHERE parent_scenario_id = scenario_id;
    
    IF edge_case_count > 0 THEN
        RETURN QUERY SELECT false, format('Cannot delete scenario: %s dependent edge cases exist', edge_case_count);
    ELSE
        DELETE FROM public.scenarios WHERE id = scenario_id;
        RETURN QUERY SELECT true, 'Scenario deleted successfully';
    END IF;
END;
$$ LANGUAGE plpgsql;


-- ----------------------------------------------------------------------------
-- SAMPLE DATA (Optional - for testing)
-- ----------------------------------------------------------------------------

-- Insert sample template
INSERT INTO public.templates (
    name,
    description,
    category,
    structure,
    variables,
    tone,
    complexity_baseline,
    quality_threshold,
    created_by
) VALUES (
    'Financial Advisor Consultation',
    'Template for financial advisory conversations with anxious investors',
    'Financial Services',
    'You are a financial advisor speaking with {{persona}}. The client is concerned about {{topic}}. Guide them through {{emotional_arc}} while addressing their concerns professionally.',
    '[
        {"name": "persona", "type": "dropdown", "defaultValue": "Anxious Investor", "options": ["Anxious Investor", "Conservative Planner", "Aggressive Trader"]},
        {"name": "topic", "type": "text", "defaultValue": "market volatility", "helpText": "Main concern or question"},
        {"name": "emotional_arc", "type": "dropdown", "defaultValue": "anxiety to confidence", "options": ["anxiety to confidence", "confusion to clarity", "fear to calm"]}
    ]'::jsonb,
    'empathetic',
    7,
    7.0,
    (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT (name) DO NOTHING;

-- Note: Scenarios and edge cases will be added after templates exist

-- Grant permissions (if needed)
GRANT ALL ON public.templates TO authenticated;
GRANT ALL ON public.scenarios TO authenticated;
GRANT ALL ON public.edge_cases TO authenticated;

-- ============================================================================
-- END OF DATABASE SCHEMA
-- ============================================================================
```

**Validation Steps**:
1. Execute the SQL in Supabase SQL Editor
2. Verify all 3 tables created: `templates`, `scenarios`, `edge_cases`
3. Check indexes created with `\di` or Supabase dashboard
4. Verify RLS policies with `SELECT * FROM pg_policies WHERE tablename IN ('templates', 'scenarios', 'edge_cases')`
5. Test sample data inserted: `SELECT * FROM templates LIMIT 1`
6. Test cascade restriction: Try to insert scenario referencing non-existent template (should fail)

++++++++++++++++++

## Implementation Prompts

### Prompt 1: Service Layer - Template, Scenario, and Edge Case Services
**Scope**: Create TypeScript service classes for database operations with complete CRUD functionality  
**Dependencies**: Database schema must be executed first  
**Estimated Time**: 6-8 hours  
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing the service layer for the Template Management System in the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Interactive LoRA Conversation Generation Module enables business experts to create high-quality training conversations for AI model fine-tuning. The Template Management System (FR7.1.1-7.1.3) provides a three-tier content organization:
1. **Templates** - Reusable prompt structures with variable placeholders
2. **Scenarios** - Specific conversation topics based on templates
3. **Edge Cases** - Boundary conditions and unusual situations for testing

**Current Implementation State:**
- ✅ Database schema created (templates, scenarios, edge_cases tables)
- ✅ Supabase client configured (`src/lib/supabase.ts`)
- ✅ TypeScript type definitions exist (`train-wireframe/src/lib/types.ts`)
- ✅ Generic database service pattern established (`src/lib/database.ts`)
- ❌ No template-specific services exist
- ❌ No service integration with Supabase tables

**Technical Architecture:**
- **Database**: PostgreSQL via Supabase
- **ORM**: Supabase JavaScript Client
- **Type Safety**: Strict TypeScript with interfaces
- **Error Handling**: Custom error types with descriptive messages
- **Patterns**: Service layer abstraction, dependency injection

**IMPLEMENTATION TASKS:**

Create three service files in `src/lib/services/`:

1. **template-service.ts**
   - TemplateService class with constructor accepting Supabase client
   - getAll(filters?: TemplateFilters): Promise<Template[]>
   - getById(id: string): Promise<Template | null>
   - create(data: CreateTemplateInput): Promise<Template>
   - update(id: string, data: UpdateTemplateInput): Promise<Template>
   - delete(id: string): Promise<{ success: boolean; message: string }>
   - duplicate(id: string, newName: string): Promise<Template>
   - search(query: string): Promise<Template[]>
   - getByCategory(category: string): Promise<Template[]>
   - incrementUsageCount(id: string): Promise<void>
   - updateRating(id: string, rating: number): Promise<void>

2. **scenario-service.ts**
   - ScenarioService class with similar structure
   - getAll(filters?: ScenarioFilters): Promise<Scenario[]>
   - getByTemplateId(templateId: string): Promise<Scenario[]>
   - getById(id: string): Promise<Scenario | null>
   - create(data: CreateScenarioInput): Promise<Scenario>
   - update(id: string, data: UpdateScenarioInput): Promise<Scenario>
   - delete(id: string): Promise<{ success: boolean; message: string }>
   - updateGenerationStatus(id: string, status: GenerationStatus, conversationId?: string, errorMessage?: string): Promise<void>
   - bulkCreate(scenarios: CreateScenarioInput[]): Promise<Scenario[]>

3. **edge-case-service.ts**
   - EdgeCaseService class
   - getAll(filters?: EdgeCaseFilters): Promise<EdgeCase[]>
   - getByScenarioId(scenarioId: string): Promise<EdgeCase[]>
   - getById(id: string): Promise<EdgeCase | null>
   - create(data: CreateEdgeCaseInput): Promise<EdgeCase>
   - update(id: string, data: UpdateEdgeCaseInput): Promise<EdgeCase>
   - delete(id: string): Promise<void>
   - updateTestStatus(id: string, status: TestStatus, testResults?: TestResults): Promise<void>
   - getByType(type: EdgeCaseType): Promise<EdgeCase[]>

**ACCEPTANCE CRITERIA:**

1. **Type Safety**:
   - All methods use TypeScript interfaces from `train-wireframe/src/lib/types.ts`
   - Create input types omit auto-generated fields (id, created_at, created_by)
   - Update input types use Partial<> for optional updates
   - Return types match database schema exactly

2. **Error Handling**:
   - Throw descriptive errors for not found (404), validation (400), database (500)
   - Use try-catch blocks for all database operations
   - Log errors to console in development
   - Sanitize error messages before returning to client

3. **Database Integration**:
   - Use Supabase client methods: .select(), .insert(), .update(), .delete()
   - Apply RLS policies automatically via Supabase auth
   - Use .single() for single record queries
   - Use .order() for consistent sorting

4. **Cascade Handling**:
   - delete() methods must call safe_delete functions from database
   - Return { success: false, message } if dependencies exist
   - Provide count of dependent records in error message

5. **Performance**:
   - Use selective field loading (specify columns in select)
   - Apply indexes via proper where clause construction
   - Batch operations where possible (bulkCreate)

6. **Validation**:
   - Validate required fields before database operations
   - Check foreign key existence (template exists before creating scenario)
   - Validate enum values match database constraints
   - Validate numeric ranges (rating 0-5, complexity 1-10)

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/services/
├── template-service.ts
├── scenario-service.ts
└── edge-case-service.ts
```

**Service Pattern:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { Template, CreateTemplateInput, UpdateTemplateInput } from '../../../train-wireframe/src/lib/types';

export class TemplateService {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  async getAll(filters?: TemplateFilters): Promise<Template[]> {
    let query = this.supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.minRating) {
      query = query.gte('rating', filters.minRating);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
    return data as Template[];
  }

  async getById(id: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch template: ${error.message}`);
    }

    return data as Template | null;
  }

  async create(input: CreateTemplateInput): Promise<Template> {
    // Get current user ID
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('templates')
      .insert({
        ...input,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);
    return data as Template;
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    // Use safe_delete function
    const { data, error } = await this.supabase
      .rpc('safe_delete_template', { template_id: id });

    if (error) throw new Error(`Failed to delete template: ${error.message}`);
    return data[0];
  }

  // ... other methods
}
```

**Input Type Definitions** (create in services file or shared types):
```typescript
export type CreateTemplateInput = Omit<Template, 'id' | 'created_at' | 'created_by' | 'last_modified' | 'usage_count' | 'rating'>;
export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export type TemplateFilters = {
  category?: string;
  minRating?: number;
  search?: string;
};
```

**Naming Conventions:**
- Database columns: snake_case (e.g., `parent_template_id`)
- TypeScript properties: camelCase (e.g., `parentTemplateId`)
- Map between formats in service methods

**VALIDATION REQUIREMENTS:**

Test each service method:
1. Create test file in `src/lib/services/__tests__/`
2. Mock Supabase client responses
3. Test success cases and error cases
4. Verify type safety with TypeScript compiler

Manual testing checklist:
- [ ] Create template with valid data → success
- [ ] Create template with duplicate name → error
- [ ] Create scenario with valid template ID → success
- [ ] Create scenario with invalid template ID → error
- [ ] Delete template with scenarios → error with count
- [ ] Delete template without scenarios → success
- [ ] Update template rating → value updated
- [ ] Bulk create 5 scenarios → all created

**DELIVERABLES:**

1. `src/lib/services/template-service.ts` (300-400 lines)
2. `src/lib/services/scenario-service.ts` (300-400 lines)
3. `src/lib/services/edge-case-service.ts` (200-300 lines)
4. Type definitions for Create/Update inputs
5. Filter type definitions
6. Error handling utilities (if needed)

Implement complete, production-ready service layer with comprehensive error handling, type safety, and proper database integration patterns following established codebase conventions.

++++++++++++++++++

### Prompt 2: API Routes - RESTful Endpoints for Templates, Scenarios, and Edge Cases
**Scope**: Create Next.js API routes with proper HTTP methods, validation, and error responses  
**Dependencies**: Prompt 1 (Service layer must exist)  
**Estimated Time**: 8-10 hours  
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing RESTful API endpoints for the Template Management System in the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Template Management System provides CRUD operations for three entities: Templates, Scenarios, and Edge Cases. These API endpoints will be consumed by the React frontend to enable users to create, manage, and organize conversation templates.

**Current Implementation State:**
- ✅ Database schema with RLS policies
- ✅ Service layer complete (TemplateService, ScenarioService, EdgeCaseService)
- ✅ Next.js 14 with App Router configured
- ✅ Supabase authentication middleware exists
- ❌ No API routes for template management
- ❌ No request validation

**Technical Architecture:**
- **Framework**: Next.js 14 App Router API routes
- **Validation**: Zod schemas for request validation
- **Authentication**: Supabase Auth middleware
- **Error Handling**: Structured JSON error responses
- **Status Codes**: RESTful HTTP status codes (200, 201, 400, 404, 500)

**IMPLEMENTATION TASKS:**

Create API routes in `src/app/api/`:

**1. Templates API** (`src/app/api/templates/`):
- `route.ts`:
  - GET /api/templates - List all templates with optional filters
  - POST /api/templates - Create new template
- `[id]/route.ts`:
  - GET /api/templates/[id] - Get single template
  - PATCH /api/templates/[id] - Update template
  - DELETE /api/templates/[id] - Delete template
- `[id]/duplicate/route.ts`:
  - POST /api/templates/[id]/duplicate - Duplicate template

**2. Scenarios API** (`src/app/api/scenarios/`):
- `route.ts`:
  - GET /api/scenarios - List all scenarios with filters
  - POST /api/scenarios - Create new scenario
- `[id]/route.ts`:
  - GET /api/scenarios/[id] - Get single scenario
  - PATCH /api/scenarios/[id] - Update scenario
  - DELETE /api/scenarios/[id] - Delete scenario
- `bulk/route.ts`:
  - POST /api/scenarios/bulk - Bulk create scenarios

**3. Edge Cases API** (`src/app/api/edge-cases/`):
- `route.ts`:
  - GET /api/edge-cases - List all edge cases with filters
  - POST /api/edge-cases - Create new edge case
- `[id]/route.ts`:
  - GET /api/edge-cases/[id] - Get single edge case
  - PATCH /api/edge-cases/[id] - Update edge case
  - DELETE /api/edge-cases/[id] - Delete edge case

**4. Nested Routes**:
- GET /api/templates/[id]/scenarios - Get scenarios for template
- GET /api/scenarios/[id]/edge-cases - Get edge cases for scenario

**ACCEPTANCE CRITERIA:**

1. **HTTP Methods**:
   - Use correct HTTP verbs: GET (read), POST (create), PATCH (update), DELETE (delete)
   - Return appropriate status codes
   - Include proper headers (Content-Type: application/json)

2. **Request Validation**:
   - Use Zod schemas to validate request bodies
   - Return 400 Bad Request with detailed validation errors
   - Validate URL parameters (UUID format for IDs)

3. **Response Format**:
   - Success: `{ data: T, message?: string }`
   - Error: `{ error: string, details?: string[], statusCode: number }`
   - Include pagination metadata for list endpoints

4. **Authentication**:
   - All endpoints require authentication
   - Use Supabase auth to get current user
   - Return 401 Unauthorized if not authenticated

5. **Error Handling**:
   - Catch all errors and return proper JSON response
   - Log errors server-side
   - Never expose sensitive information in error messages
   - Map service errors to HTTP status codes

6. **Query Parameters**:
   - Support filtering: ?category=Financial&minRating=4
   - Support pagination: ?page=1&limit=25
   - Support sorting: ?sortBy=rating&order=desc
   - Support search: ?q=financial

**TECHNICAL SPECIFICATIONS:**

**API Route Pattern** (`src/app/api/templates/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { TemplateService } from '@/lib/services/template-service';
import { z } from 'zod';

// Validation schema
const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().min(1).max(100),
  structure: z.string().min(10).max(10000),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'number', 'dropdown']),
    defaultValue: z.string(),
    helpText: z.string().optional(),
    options: z.array(z.string()).optional(),
  })),
  tone: z.string().max(50).optional(),
  complexityBaseline: z.number().min(1).max(10).optional(),
  styleNotes: z.string().optional(),
  exampleConversation: z.string().optional(),
  qualityThreshold: z.number().min(0).max(10).optional(),
  requiredElements: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const templateService = new TemplateService(supabase);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minRating = searchParams.get('minRating');
    const search = searchParams.get('q');

    const filters = {
      category: category || undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      search: search || undefined,
    };

    const templates = await templateService.getAll(filters);

    return NextResponse.json(
      { data: templates, count: templates.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const templateService = new TemplateService(supabase);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    const template = await templateService.create(validatedData);

    return NextResponse.json(
      { data: template, message: 'Template created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/templates error:', error);
    return NextResponse.json(
      { error: 'Failed to create template', details: error.message },
      { status: 500 }
    );
  }
}
```

**Dynamic Route Pattern** (`src/app/api/templates/[id]/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid template ID format' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const templateService = new TemplateService(supabase);

    const template = await templateService.getById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: template }, { status: 200 });
  } catch (error: any) {
    console.error(`GET /api/templates/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch template', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate with partial schema (all fields optional)
    const validatedData = updateTemplateSchema.parse(body);

    const supabase = createClient();
    const templateService = new TemplateService(supabase);

    const template = await templateService.update(id, validatedData);

    return NextResponse.json(
      { data: template, message: 'Template updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    // Handle errors...
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabase = createClient();
    const templateService = new TemplateService(supabase);

    const result = await templateService.delete(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: result.message },
      { status: 200 }
    );
  } catch (error: any) {
    // Handle errors...
  }
}
```

**Zod Validation Schemas** (create in `src/lib/validation/templates.ts`):
```typescript
import { z } from 'zod';

export const templateVariableSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['text', 'number', 'dropdown']),
  defaultValue: z.string(),
  helpText: z.string().optional(),
  options: z.array(z.string()).optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().min(1).max(100),
  structure: z.string().min(10).max(10000),
  variables: z.array(templateVariableSchema),
  tone: z.string().max(50).default('professional'),
  complexityBaseline: z.number().min(1).max(10).default(5),
  styleNotes: z.string().optional(),
  exampleConversation: z.string().optional(),
  qualityThreshold: z.number().min(0).max(10).default(6.0),
  requiredElements: z.array(z.string()).default([]),
});

export const updateTemplateSchema = createTemplateSchema.partial();
```

**UUID Validation Utility** (`src/lib/utils/validation.ts`):
```typescript
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
```

**VALIDATION REQUIREMENTS:**

Test all endpoints with Postman or curl:

**Templates:**
- [ ] GET /api/templates → 200 with array
- [ ] GET /api/templates?category=Financial → 200 with filtered results
- [ ] POST /api/templates (valid data) → 201 with created template
- [ ] POST /api/templates (invalid data) → 400 with validation errors
- [ ] GET /api/templates/[valid-id] → 200 with template
- [ ] GET /api/templates/[invalid-id] → 404
- [ ] PATCH /api/templates/[id] (valid data) → 200 with updated template
- [ ] DELETE /api/templates/[id] (no scenarios) → 200
- [ ] DELETE /api/templates/[id] (with scenarios) → 400 with error message
- [ ] POST /api/templates/[id]/duplicate → 201 with new template

**Scenarios:**
- [ ] POST /api/scenarios (valid template_id) → 201
- [ ] POST /api/scenarios (invalid template_id) → 400
- [ ] GET /api/templates/[id]/scenarios → 200 with scenarios
- [ ] POST /api/scenarios/bulk (array of 5) → 201 with all created
- [ ] PATCH /api/scenarios/[id] (update generation_status) → 200

**Edge Cases:**
- [ ] POST /api/edge-cases (valid scenario_id) → 201
- [ ] GET /api/scenarios/[id]/edge-cases → 200 with edge cases
- [ ] PATCH /api/edge-cases/[id] (update test_status) → 200

**DELIVERABLES:**

1. API Routes:
   - `src/app/api/templates/route.ts`
   - `src/app/api/templates/[id]/route.ts`
   - `src/app/api/templates/[id]/duplicate/route.ts`
   - `src/app/api/templates/[id]/scenarios/route.ts`
   - `src/app/api/scenarios/route.ts`
   - `src/app/api/scenarios/[id]/route.ts`
   - `src/app/api/scenarios/[id]/edge-cases/route.ts`
   - `src/app/api/scenarios/bulk/route.ts`
   - `src/app/api/edge-cases/route.ts`
   - `src/app/api/edge-cases/[id]/route.ts`

2. Validation Schemas:
   - `src/lib/validation/templates.ts`
   - `src/lib/validation/scenarios.ts`
   - `src/lib/validation/edge-cases.ts`

3. Utilities:
   - `src/lib/utils/validation.ts` (UUID validation, etc.)

Implement production-ready API endpoints with comprehensive validation, error handling, and proper RESTful design following Next.js App Router best practices.

++++++++++++++++++

### Prompt 3: Templates UI - Complete CRUD Implementation with Modals
**Scope**: Enhance TemplatesView with functional create/edit/delete modals and API integration  
**Dependencies**: Prompts 1-2 (Services and API routes must exist)  
**Estimated Time**: 8-10 hours  
**Risk Level**: Low

========================

You are a senior frontend developer implementing the complete Template Management UI for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

**Current Wireframe State** (`train-wireframe/src/components/views/TemplatesView.tsx`):
- ✅ Card-based grid layout displaying template metadata
- ✅ Dropdown menu with View/Edit/Delete actions (placeholder toasts)
- ✅ Type definitions complete (Template, TemplateVariable)
- ❌ No modals for create/edit operations
- ❌ No API integration (all actions show "coming soon" toasts)
- ❌ No form validation

**Implementation Strategy:**
Transform placeholder UI into fully functional template management interface with proper modals, forms, and API integration.

**IMPLEMENTATION TASKS:**

1. **Create Template Modal** (`src/components/templates/TemplateCreateModal.tsx`):
   - Dialog component with form for all template fields
   - Form sections: Basic Info, Template Structure, Variables, Quality Settings
   - Variables array builder with add/remove functionality
   - Template structure textarea with {{placeholder}} syntax highlighting
   - Zod validation with error display
   - Submit → call POST /api/templates
   - Success → refresh templates list, show toast, close modal

2. **Edit Template Modal** (`src/components/templates/TemplateEditModal.tsx`):
   - Reuse TemplateCreateModal with edit mode prop
   - Load existing template data on open
   - Submit → call PATCH /api/templates/[id]
   - Pre-populate all fields including variables array

3. **Template Detail View Modal** (`src/components/templates/TemplateDetailModal.tsx`):
   - Read-only display of all template information
   - Show usage statistics (usage count, rating, created date)
   - Display variables in formatted table
   - Quick action buttons: Edit, Duplicate, Delete
   - Navigation: Previous/Next template buttons

4. **Enhance TemplatesView Component**:
   - Replace toast placeholders with real modal triggers
   - Integrate with template API endpoints
   - Add loading states during API calls
   - Implement delete confirmation dialog
   - Handle API errors with descriptive messages
   - Refresh list after create/update/delete operations

**TECHNICAL SPECIFICATIONS:**

**Form Structure** (use React Hook Form + Zod):
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTemplateSchema } from '@/lib/validation/templates';

type TemplateFormData = z.infer<typeof createTemplateSchema>;

function TemplateFormModal({ template, onClose, onSuccess }: Props) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<TemplateFormData>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: template || {
      variables: [],
      tone: 'professional',
      complexityBaseline: 5,
      qualityThreshold: 6.0,
      requiredElements: [],
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    const endpoint = template ? `/api/templates/${template.id}` : '/api/templates';
    const method = template ? 'PATCH' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      toast.success(template ? 'Template updated' : 'Template created');
      onSuccess(result.data);
      onClose();
    } else {
      const error = await response.json();
      toast.error(error.error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Variables Array Builder**:
```typescript
function VariablesArrayBuilder({ value, onChange }: Props) {
  const [variables, setVariables] = useState<TemplateVariable[]>(value || []);

  const addVariable = () => {
    setVariables([...variables, { name: '', type: 'text', defaultValue: '' }]);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const updateVariable = (index: number, field: string, value: any) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {variables.map((variable, index) => (
        <div key={index} className="border p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Variable name"
              value={variable.name}
              onChange={(e) => updateVariable(index, 'name', e.target.value)}
            />
            <Select
              value={variable.type}
              onValueChange={(value) => updateVariable(index, 'type', value)}
            >
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
            </Select>
            {/* More fields... */}
            <Button onClick={() => removeVariable(index)} variant="ghost">Remove</Button>
          </div>
        </div>
      ))}
      <Button onClick={addVariable}>Add Variable</Button>
    </div>
  );
}
```

**API Integration in TemplatesView**:
```typescript
// Replace current TemplatesView implementation
export function TemplatesView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    const response = await fetch('/api/templates');
    const data = await response.json();
    setTemplates(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirm({
      title: 'Confirm Deletion',
      message: `Delete "${name}"? This action cannot be undone.`,
    });

    if (confirmed) {
      const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Template deleted');
        fetchTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error);
      }
    }
  };

  // Rest of component with modal integrations
}
```

**ACCEPTANCE CRITERIA:**
- [ ] Create modal opens with all fields editable
- [ ] Variables can be added/removed dynamically
- [ ] Form validation works (required fields, string lengths, number ranges)
- [ ] Template creation succeeds → list refreshes → toast shown
- [ ] Edit modal pre-populates existing data
- [ ] Template update succeeds → list refreshes
- [ ] Delete confirmation prevents accidental deletion
- [ ] Delete with dependent scenarios shows error message
- [ ] Loading states display during API calls
- [ ] Error messages are user-friendly

**DELIVERABLES:**
1. `src/components/templates/TemplateCreateModal.tsx`
2. `src/components/templates/TemplateEditModal.tsx`
3. `src/components/templates/TemplateDetailModal.tsx`
4. `src/components/templates/VariablesArrayBuilder.tsx`
5. Updated `train-wireframe/src/components/views/TemplatesView.tsx` with API integration
6. Form validation schemas if not already created

Implement complete, production-ready template management UI with comprehensive forms, validation, and API integration following established React and Next.js patterns.

++++++++++++++++++

### Prompt 4: Scenarios UI - Complete CRUD with Bulk Operations
**Scope**: Enhance ScenariosView with functional create/edit modals and bulk generation workflow  
**Dependencies**: Prompts 1-3  
**Estimated Time**: 8-10 hours  
**Risk Level**: Medium

========================

You are a senior frontend developer implementing the complete Scenario Management UI.

**Current Wireframe State** (`train-wireframe/src/components/views/ScenariosView.tsx`):
- ✅ Table layout with checkbox selection
- ✅ Status badges (not_generated, generated, error)
- ✅ Bulk generation UI framework
- ❌ No scenario creation form
- ❌ No API integration
- ❌ Generate buttons are placeholders

**IMPLEMENTATION TASKS:**

1. **Create Scenario Modal** with template-driven form that loads template variables dynamically
2. **Bulk Scenario Import** from CSV with validation and preview
3. **Enhance ScenariosView** with API integration and bulk selection logic

**DELIVERABLES:**
1. `src/components/scenarios/ScenarioCreateModal.tsx`
2. `src/components/scenarios/ScenarioBulkImportModal.tsx`
3. Updated `train-wireframe/src/components/views/ScenariosView.tsx`

Implement complete scenario management with template integration and bulk import capabilities.

++++++++++++++++++

### Prompt 5: Edge Cases UI - Complete CRUD with Test Execution Interface
**Scope**: Enhance EdgeCasesView with functional create/test modals  
**Dependencies**: Prompts 1-4  
**Estimated Time**: 6-8 hours  
**Risk Level**: Low

========================

You are a senior frontend developer implementing the complete Edge Case Management UI.

**IMPLEMENTATION TASKS:**

1. **Create Edge Case Modal** with scenario selector
2. **Test Execution Modal** with expected/actual behavior comparison
3. **Enhance EdgeCasesView** with type filters and test execution workflow

**DELIVERABLES:**
1. `src/components/edge-cases/EdgeCaseCreateModal.tsx`
2. `src/components/edge-cases/TestExecutionModal.tsx`
3. Updated `train-wireframe/src/components/views/EdgeCasesView.tsx`

Implement complete edge case management with test execution capabilities.

++++++++++++++++++

### Prompt 6: Import/Export & Variable Substitution
**Scope**: Implement import/export functionality and template variable substitution engine  
**Dependencies**: Prompts 1-5  
**Estimated Time**: 10-12 hours  
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing advanced features for the Template Management System.

**IMPLEMENTATION TASKS:**

1. **Export API & UI**: JSON download for templates, scenarios, edge cases
2. **Import API & UI**: JSON upload with validation and preview
3. **Variable Substitution Engine**: Parser and substitution modules supporting simple, nested, conditional, and default variables
4. **Template Preview**: API endpoint and UI for previewing resolved templates

**DELIVERABLES:**
1. Export/import API endpoints for all three entities
2. `src/lib/template-engine/parser.ts`
3. `src/lib/template-engine/substitution.ts`
4. Export/import UI components
5. Template preview functionality

Implement complete import/export system and sophisticated variable substitution engine.

++++++++++++++++++

## Quality Validation Checklist

### Post-Implementation Verification

**Database:**
- [ ] All 3 tables created with proper indexes
- [ ] Foreign key constraints work (RESTRICT on delete)
- [ ] RLS policies tested with different users
- [ ] Helper functions work (safe_delete_template, safe_delete_scenario)
- [ ] Sample data loads successfully

**Service Layer:**
- [ ] All CRUD methods work for templates, scenarios, edge cases
- [ ] Cascade prevention works (delete returns error when dependencies exist)
- [ ] Bulk create works for scenarios
- [ ] Error handling returns descriptive messages
- [ ] Type safety enforced by TypeScript

**API Routes:**
- [ ] All endpoints return correct status codes
- [ ] Validation errors return 400 with details
- [ ] Authentication enforced (401 if not logged in)
- [ ] Not found returns 404
- [ ] Server errors return 500 with sanitized messages

**UI Components:**
- [ ] Templates view displays cards correctly
- [ ] Create template modal works end-to-end
- [ ] Edit template pre-populates data
- [ ] Delete confirmation prevents accidents
- [ ] Scenarios table with selection works
- [ ] Bulk import from CSV works
- [ ] Edge cases cards with test execution work
- [ ] Loading states display during operations
- [ ] Error toasts show user-friendly messages

**Advanced Features:**
- [ ] Variable substitution works (simple, nested, conditional, defaults)
- [ ] Template preview shows resolved text
- [ ] Import validates JSON structure
- [ ] Export downloads correct file format

**Integration:**
- [ ] Complete workflow: Create template → scenario → edge case → delete (reverse)
- [ ] Template with scenarios cannot be deleted
- [ ] Scenario with edge cases cannot be deleted
- [ ] Import/export round-trip preserves data
- [ ] Cross-entity relationships maintained

**Performance:**
- [ ] Database queries < 100ms with indexes
- [ ] API responses < 500ms
- [ ] UI interactions < 200ms
- [ ] Bulk operations (100 items) complete within reasonable time

**Error Handling:**
- [ ] Invalid UUID format returns 400
- [ ] Missing required fields returns 400 with details
- [ ] Duplicate names handled gracefully
- [ ] Foreign key violations return descriptive errors
- [ ] Network errors show retry option

### Cross-Prompt Consistency
- [ ] Consistent naming: camelCase in TypeScript, snake_case in database
- [ ] Consistent error format: { error: string, details?: any }
- [ ] Consistent success format: { data: T, message?: string }
- [ ] Consistent modal patterns across all entities
- [ ] Consistent form validation approach (Zod + React Hook Form)

## Next Segment Preparation

**For Conversation Generation Segment (E08)**:
- Templates, scenarios, and edge cases are now available in database
- Scenario-to-conversation workflow can reference template structure
- Generation status tracking fields exist in scenarios table
- Conversation generation can use template variable substitution engine

**Integration Points:**
- Conversations will reference scenarios via foreign key
- Generated conversations will update scenario.generation_status
- Template quality thresholds will be used for conversation validation
- Edge cases will inform conversation testing scenarios

**Dependencies Required for E08:**
- [ ] Templates accessible via API
- [ ] Scenarios accessible via API with template relationships
- [ ] Variable substitution engine functional
- [ ] Generation status can be updated via API

---

**End of E07 Implementation Instructions**
**Generated**: 2025-01-29  
**Total Prompts**: 6 (consolidated from 8 for efficiency)  
**Estimated Total Implementation Time**: 60-80 hours

