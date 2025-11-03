-- ============================================================================
-- E07: Template Management System - Database Migration
-- Upgrades existing schema to match E07 requirements
-- ============================================================================
-- 
-- CHANGES:
-- 1. Rename conversation_templates → templates
-- 2. Drop and recreate scenarios with E07-compliant schema
-- 3. Drop and recreate edge_cases with correct FK to scenarios (not templates)
-- 4. Add E07 indexes, triggers, RLS policies, helper functions
--
-- WARNING: This will drop existing scenarios and edge_cases data
-- ============================================================================

-- Step 1: Drop existing tables (order matters due to FK constraints)
DROP TABLE IF EXISTS public.edge_cases CASCADE;
DROP TABLE IF EXISTS public.scenarios CASCADE;

-- Step 2: Rename conversation_templates to templates
ALTER TABLE IF EXISTS public.conversation_templates RENAME TO templates;

-- Step 3: Ensure templates table has all required E07 fields
-- (Only add if conversation_templates was missing them)

-- Add missing columns to templates if they don't exist
DO $$ 
BEGIN
    -- Add structure column if missing (E07 uses 'structure', old schema might use different name)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'structure') THEN
        ALTER TABLE templates ADD COLUMN structure TEXT;
    END IF;
    
    -- Add variables column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'variables') THEN
        ALTER TABLE templates ADD COLUMN variables JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add category column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'category') THEN
        ALTER TABLE templates ADD COLUMN category TEXT;
    END IF;
    
    -- Add tone column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'tone') THEN
        ALTER TABLE templates ADD COLUMN tone TEXT DEFAULT 'professional';
    END IF;
    
    -- Add complexity_baseline column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'complexity_baseline') THEN
        ALTER TABLE templates ADD COLUMN complexity_baseline INTEGER DEFAULT 5;
    END IF;
    
    -- Add style_notes column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'style_notes') THEN
        ALTER TABLE templates ADD COLUMN style_notes TEXT;
    END IF;
    
    -- Add example_conversation column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'example_conversation') THEN
        ALTER TABLE templates ADD COLUMN example_conversation TEXT;
    END IF;
    
    -- Add quality_threshold column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'quality_threshold') THEN
        ALTER TABLE templates ADD COLUMN quality_threshold NUMERIC(3,1) DEFAULT 6.0;
    END IF;
    
    -- Add required_elements column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'required_elements') THEN
        ALTER TABLE templates ADD COLUMN required_elements TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    -- Add usage_count column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'usage_count') THEN
        ALTER TABLE templates ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add rating column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'rating') THEN
        ALTER TABLE templates ADD COLUMN rating NUMERIC(3,2) DEFAULT 0.0;
    END IF;
    
    -- Add last_modified column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'templates' AND column_name = 'last_modified') THEN
        ALTER TABLE templates ADD COLUMN last_modified TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    END IF;
END $$;

-- Add E07 indexes for templates
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_rating ON public.templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_templates_usage_count ON public.templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON public.templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON public.templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_variables_gin ON public.templates USING GIN(variables);

-- Add last_modified trigger for templates
CREATE OR REPLACE FUNCTION public.update_templates_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_templates_last_modified ON public.templates;
CREATE TRIGGER trigger_update_templates_last_modified
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_templates_last_modified();

-- Enable RLS for templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Templates are viewable by all authenticated users" ON public.templates;
DROP POLICY IF EXISTS "Users can insert their own templates" ON public.templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.templates;

-- Create E07 RLS policies for templates
CREATE POLICY "Templates are viewable by all authenticated users"
    ON public.templates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own templates"
    ON public.templates FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
    ON public.templates FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates"
    ON public.templates FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);


-- Step 4: Create E07-compliant scenarios table
CREATE TABLE public.scenarios (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Fields
    name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
    description TEXT,
    
    -- Template Relationship
    parent_template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE RESTRICT,
    parent_template_name TEXT NOT NULL,
    
    -- Context
    context TEXT NOT NULL CHECK (length(context) BETWEEN 1 AND 5000),
    parameter_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Variation Tracking
    variation_count INTEGER DEFAULT 0 CHECK (variation_count >= 0),
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    quality_score NUMERIC(3,1) DEFAULT 0.0 CHECK (quality_score BETWEEN 0 AND 10),
    
    -- Conversation Generation (E07 additions)
    topic TEXT NOT NULL CHECK (length(topic) BETWEEN 1 AND 100),
    persona TEXT NOT NULL CHECK (length(persona) BETWEEN 1 AND 100),
    emotional_arc TEXT NOT NULL CHECK (length(emotional_arc) BETWEEN 1 AND 100),
    generation_status TEXT DEFAULT 'not_generated' CHECK (generation_status IN ('not_generated', 'generated', 'error')),
    conversation_id UUID,
    error_message TEXT,
    
    -- Audit Fields
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT scenario_parameter_values_is_object CHECK (jsonb_typeof(parameter_values) = 'object')
);

-- Indexes for scenarios
CREATE INDEX idx_scenarios_parent_template ON public.scenarios(parent_template_id);
CREATE INDEX idx_scenarios_status ON public.scenarios(status);
CREATE INDEX idx_scenarios_generation_status ON public.scenarios(generation_status);
CREATE INDEX idx_scenarios_persona ON public.scenarios(persona);
CREATE INDEX idx_scenarios_topic ON public.scenarios(topic);
CREATE INDEX idx_scenarios_created_by ON public.scenarios(created_by);
CREATE INDEX idx_scenarios_created_at ON public.scenarios(created_at DESC);
CREATE INDEX idx_scenarios_template_status ON public.scenarios(parent_template_id, generation_status);
CREATE INDEX idx_scenarios_parameter_values_gin ON public.scenarios USING GIN(parameter_values);

-- Enable RLS for scenarios
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scenarios
CREATE POLICY "Scenarios are viewable by all authenticated users"
    ON public.scenarios FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own scenarios"
    ON public.scenarios FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own scenarios"
    ON public.scenarios FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own scenarios"
    ON public.scenarios FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);


-- Step 5: Create E07-compliant edge_cases table (CORRECT hierarchy: references scenarios)
CREATE TABLE public.edge_cases (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Fields
    title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 2000),
    
    -- Scenario Relationship (CORRECT: references scenarios, not templates)
    parent_scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE RESTRICT,
    parent_scenario_name TEXT NOT NULL,
    
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

-- Indexes for edge_cases
CREATE INDEX idx_edge_cases_parent_scenario ON public.edge_cases(parent_scenario_id);
CREATE INDEX idx_edge_cases_type ON public.edge_cases(edge_case_type);
CREATE INDEX idx_edge_cases_test_status ON public.edge_cases(test_status);
CREATE INDEX idx_edge_cases_complexity ON public.edge_cases(complexity DESC);
CREATE INDEX idx_edge_cases_created_by ON public.edge_cases(created_by);
CREATE INDEX idx_edge_cases_created_at ON public.edge_cases(created_at DESC);
CREATE INDEX idx_edge_cases_scenario_status ON public.edge_cases(parent_scenario_id, test_status);
CREATE INDEX idx_edge_cases_test_results_gin ON public.edge_cases USING GIN(test_results);

-- Enable RLS for edge_cases
ALTER TABLE public.edge_cases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for edge_cases
CREATE POLICY "Edge cases are viewable by all authenticated users"
    ON public.edge_cases FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own edge cases"
    ON public.edge_cases FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own edge cases"
    ON public.edge_cases FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own edge cases"
    ON public.edge_cases FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);


-- Step 6: Helper functions for E07
CREATE OR REPLACE FUNCTION public.get_template_scenario_count(template_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.scenarios WHERE parent_template_id = template_id);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.get_scenario_edge_case_count(scenario_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.edge_cases WHERE parent_scenario_id = scenario_id);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.safe_delete_template(template_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    scenario_count INTEGER;
BEGIN
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

CREATE OR REPLACE FUNCTION public.safe_delete_scenario(scenario_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    edge_case_count INTEGER;
BEGIN
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


-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 
-- VERIFICATION CHECKLIST:
-- □ conversation_templates renamed to templates
-- □ templates has all E07 fields
-- □ scenarios table created with E07 schema
-- □ edge_cases table created with CORRECT FK to scenarios
-- □ All indexes created
-- □ All RLS policies enabled
-- □ All helper functions created
-- 
-- HIERARCHY: templates ← scenarios ← edge_cases (3-tier complete)
-- ============================================================================

