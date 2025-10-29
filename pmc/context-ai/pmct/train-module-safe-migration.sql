-- ============================================================================
-- TRAIN MODULE SAFE DATABASE MIGRATION V1.0
-- Description: Creates conversation generation tables without conflicts
-- Date: 2025-10-29
-- Dependencies: Requires existing user_profiles, documents, chunks tables
-- ============================================================================

-- Enable required extensions (safe - won't fail if already exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- 1. CONVERSATIONS TABLE (Core Entity)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id TEXT UNIQUE NOT NULL,
    
    -- Foreign Keys (using existing tables)
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL,
    
    -- Core Metadata
    title TEXT,
    persona TEXT NOT NULL,
    emotion TEXT NOT NULL,
    topic TEXT,
    intent TEXT,
    tone TEXT,
    
    -- Classification
    tier TEXT NOT NULL CHECK (tier IN ('template', 'scenario', 'edge_case')),
    status TEXT NOT NULL CHECK (status IN ('draft', 'generated', 'pending_review', 'approved', 'rejected', 'needs_revision', 'none', 'failed')),
    category TEXT[] DEFAULT '{}',
    
    -- Quality Metrics
    quality_score DECIMAL(3,1) CHECK (quality_score >= 0 AND quality_score <= 10),
    quality_metrics JSONB DEFAULT '{}',
    confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
    
    -- Conversation Stats
    turn_count INTEGER DEFAULT 0 CHECK (turn_count >= 0),
    total_tokens INTEGER DEFAULT 0 CHECK (total_tokens >= 0),
    
    -- Cost Tracking
    estimated_cost_usd DECIMAL(10,4),
    actual_cost_usd DECIMAL(10,4),
    generation_duration_ms INTEGER,
    
    -- Approval Tracking (using user_profiles instead of auth.users)
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMPTZ,
    reviewer_notes TEXT,
    
    -- Relationships
    parent_id UUID REFERENCES conversations(id),
    parent_type TEXT CHECK (parent_type IN ('template', 'scenario', 'conversation')),
    
    -- Flexible Metadata
    parameters JSONB DEFAULT '{}',
    review_history JSONB DEFAULT '[]',
    
    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for conversations table (safe - will skip if exists)
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_tier ON conversations(tier);
CREATE INDEX IF NOT EXISTS idx_conversations_quality_score ON conversations(quality_score);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_persona ON conversations(persona);
CREATE INDEX IF NOT EXISTS idx_conversations_emotion ON conversations(emotion);
CREATE INDEX IF NOT EXISTS idx_conversations_chunk_id ON conversations(chunk_id);
CREATE INDEX IF NOT EXISTS idx_conversations_parent_id ON conversations(parent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_document_id ON conversations(document_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_status_quality ON conversations(status, quality_score);
CREATE INDEX IF NOT EXISTS idx_conversations_tier_status ON conversations(tier, status, created_at DESC);

-- GIN indexes for JSONB and array fields
CREATE INDEX IF NOT EXISTS idx_conversations_category_gin ON conversations USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_conversations_parameters_gin ON conversations USING GIN(parameters jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_conversations_quality_metrics_gin ON conversations USING GIN(quality_metrics jsonb_path_ops);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_conversations_text_search ON conversations USING GIN(
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(persona, '') || ' ' || COALESCE(emotion, ''))
);

-- Partial index for review queue (high performance)
CREATE INDEX IF NOT EXISTS idx_conversations_pending_review ON conversations(quality_score, created_at) 
WHERE status = 'pending_review';

-- ============================================================================
-- 2. CONVERSATION TURNS TABLE (Normalized)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversation_turns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Turn Metadata
    turn_number INTEGER NOT NULL CHECK (turn_number > 0),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    
    -- Metrics
    token_count INTEGER DEFAULT 0,
    char_count INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure sequential turn numbers per conversation
    CONSTRAINT unique_conversation_turn UNIQUE(conversation_id, turn_number)
);

-- Indexes for turns table
CREATE INDEX IF NOT EXISTS idx_turns_conversation_id ON conversation_turns(conversation_id);
CREATE INDEX IF NOT EXISTS idx_turns_conversation_turn ON conversation_turns(conversation_id, turn_number);
CREATE INDEX IF NOT EXISTS idx_turns_role ON conversation_turns(role);

-- ============================================================================
-- 3. CONVERSATION TEMPLATES TABLE
-- (RENAMED from prompt_templates to avoid conflict with existing table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Metadata
    template_name TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    tier TEXT CHECK (tier IN ('template', 'scenario', 'edge_case')),
    
    -- Template Content
    template_text TEXT NOT NULL,
    structure TEXT, -- With {{placeholder}} syntax
    variables JSONB DEFAULT '[]', -- TemplateVariable[]
    
    -- Configuration
    tone TEXT,
    complexity_baseline INTEGER CHECK (complexity_baseline BETWEEN 1 AND 10),
    style_notes TEXT,
    example_conversation TEXT,
    
    -- Quality Control
    quality_threshold DECIMAL(3,1),
    required_elements TEXT[],
    
    -- Applicability
    applicable_personas TEXT[],
    applicable_emotions TEXT[],
    applicable_topics TEXT[],
    
    -- Analytics
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Version Control
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    last_modified_by UUID REFERENCES user_profiles(id)
);

-- Indexes for conversation_templates
CREATE INDEX IF NOT EXISTS idx_conversation_templates_tier ON conversation_templates(tier);
CREATE INDEX IF NOT EXISTS idx_conversation_templates_is_active ON conversation_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_conversation_templates_usage ON conversation_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_templates_rating ON conversation_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_templates_personas ON conversation_templates USING GIN(applicable_personas);
CREATE INDEX IF NOT EXISTS idx_conversation_templates_category ON conversation_templates(category);
CREATE INDEX IF NOT EXISTS idx_conversation_templates_created_by ON conversation_templates(created_by);

-- ============================================================================
-- 4. GENERATION LOGS TABLE (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    run_id UUID, -- Batch job identifier
    template_id UUID REFERENCES conversation_templates(id),
    
    -- Request/Response
    request_payload JSONB NOT NULL,
    response_payload JSONB,
    model_used TEXT,
    
    -- Parameters
    parameters JSONB DEFAULT '{}',
    temperature DECIMAL(3,2),
    max_tokens INTEGER,
    
    -- Cost Tracking
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,4),
    
    -- Performance
    duration_ms INTEGER,
    status TEXT CHECK (status IN ('success', 'failed', 'rate_limited', 'timeout')),
    
    -- Error Handling
    error_message TEXT,
    error_code TEXT,
    retry_attempt INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for generation logs
CREATE INDEX IF NOT EXISTS idx_generation_logs_conversation_id ON generation_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_run_id ON generation_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_template_id ON generation_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_by ON generation_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_generation_logs_model ON generation_logs(model_used);

-- ============================================================================
-- 5. SCENARIOS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Scenario Metadata
    name TEXT NOT NULL,
    description TEXT,
    parent_template_id UUID REFERENCES conversation_templates(id) ON DELETE CASCADE,
    
    -- Context
    context TEXT NOT NULL,
    topic TEXT,
    persona TEXT,
    emotional_arc TEXT,
    complexity TEXT CHECK (complexity IN ('simple', 'moderate', 'complex')),
    emotional_context TEXT,
    
    -- Parameters
    parameter_values JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Analytics
    variation_count INTEGER DEFAULT 0,
    quality_score DECIMAL(3,1),
    
    -- Status
    status TEXT CHECK (status IN ('draft', 'active', 'archived')),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for scenarios
CREATE INDEX IF NOT EXISTS idx_scenarios_parent_template ON scenarios(parent_template_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_status ON scenarios(status);
CREATE INDEX IF NOT EXISTS idx_scenarios_complexity ON scenarios(complexity);
CREATE INDEX IF NOT EXISTS idx_scenarios_tags ON scenarios USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_scenarios_created_by ON scenarios(created_by);
CREATE INDEX IF NOT EXISTS idx_scenarios_persona ON scenarios(persona);

-- ============================================================================
-- 6. EDGE CASES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS edge_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Edge Case Metadata
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    
    -- Trigger Conditions
    trigger_condition TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    
    -- Risk Assessment
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    priority INTEGER CHECK (priority BETWEEN 1 AND 10),
    
    -- Testing
    test_scenario TEXT,
    validation_criteria TEXT[],
    tested BOOLEAN DEFAULT FALSE,
    last_tested_at TIMESTAMPTZ,
    
    -- Relationships
    related_scenario_ids UUID[],
    parent_template_id UUID REFERENCES conversation_templates(id),
    
    -- Status
    status TEXT CHECK (status IN ('active', 'resolved', 'deprecated')),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for edge cases
CREATE INDEX IF NOT EXISTS idx_edge_cases_risk_level ON edge_cases(risk_level);
CREATE INDEX IF NOT EXISTS idx_edge_cases_status ON edge_cases(status);
CREATE INDEX IF NOT EXISTS idx_edge_cases_tested ON edge_cases(tested);
CREATE INDEX IF NOT EXISTS idx_edge_cases_parent_template ON edge_cases(parent_template_id);
CREATE INDEX IF NOT EXISTS idx_edge_cases_created_by ON edge_cases(created_by);
CREATE INDEX IF NOT EXISTS idx_edge_cases_category ON edge_cases(category);
CREATE INDEX IF NOT EXISTS idx_edge_cases_priority ON edge_cases(priority DESC);

-- ============================================================================
-- 7. EXPORT LOGS TABLE (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS export_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    export_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    
    -- User Attribution
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    
    -- Export Configuration
    scope TEXT CHECK (scope IN ('selected', 'filtered', 'all')),
    format TEXT CHECK (format IN ('json', 'jsonl', 'csv', 'markdown')),
    filter_state JSONB NOT NULL,
    
    -- Content
    conversation_ids UUID[],
    conversation_count INTEGER NOT NULL,
    
    -- File Details
    file_name TEXT,
    file_size_bytes BIGINT,
    file_path TEXT,
    compressed BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    quality_stats JSONB,
    tier_distribution JSONB,
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Configuration Flags
    include_metadata BOOLEAN DEFAULT TRUE,
    include_quality_scores BOOLEAN DEFAULT TRUE,
    include_timestamps BOOLEAN DEFAULT TRUE,
    include_approval_history BOOLEAN DEFAULT FALSE,
    
    -- Audit
    exported_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- File retention
    downloaded_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ
);

-- Indexes for export logs
CREATE INDEX IF NOT EXISTS idx_export_logs_user_id ON export_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_exported_at ON export_logs(exported_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_logs_status ON export_logs(status);
CREATE INDEX IF NOT EXISTS idx_export_logs_export_id ON export_logs(export_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_format ON export_logs(format);

-- ============================================================================
-- 8. BATCH JOBS TABLE (Async Processing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS batch_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Job Metadata
    job_type TEXT NOT NULL CHECK (job_type IN ('generation', 'export', 'validation', 'cleanup')),
    name TEXT,
    description TEXT,
    
    -- Configuration
    configuration JSONB DEFAULT '{}',
    target_tier TEXT CHECK (target_tier IN ('template', 'scenario', 'edge_case', 'all')),
    
    -- Progress Tracking
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
    total_items INTEGER NOT NULL DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    skipped_items INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Performance
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_completion_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Priority
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    
    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Results
    results JSONB DEFAULT '{}',
    summary TEXT,
    
    -- Concurrency
    concurrent_processing INTEGER DEFAULT 3,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for batch jobs
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_job_type ON batch_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created_at ON batch_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_priority ON batch_jobs(priority DESC);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created_by ON batch_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_target_tier ON batch_jobs(target_tier);

-- ============================================================================
-- 9. AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Create update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_train_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at (safe - will skip if exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
        CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
            FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversation_templates_updated_at') THEN
        CREATE TRIGGER update_conversation_templates_updated_at BEFORE UPDATE ON conversation_templates
            FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_scenarios_updated_at') THEN
        CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios
            FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_edge_cases_updated_at') THEN
        CREATE TRIGGER update_edge_cases_updated_at BEFORE UPDATE ON edge_cases
            FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_batch_jobs_updated_at') THEN
        CREATE TRIGGER update_batch_jobs_updated_at BEFORE UPDATE ON batch_jobs
            FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view turns for their conversations" ON conversation_turns;
DROP POLICY IF EXISTS "Users can insert turns for their conversations" ON conversation_turns;
DROP POLICY IF EXISTS "Users can view their own generation logs" ON generation_logs;
DROP POLICY IF EXISTS "Users can insert their own generation logs" ON generation_logs;
DROP POLICY IF EXISTS "All users can view active templates" ON conversation_templates;
DROP POLICY IF EXISTS "Users can manage their own templates" ON conversation_templates;
DROP POLICY IF EXISTS "Users can view their own export logs" ON export_logs;
DROP POLICY IF EXISTS "Users can create their own export logs" ON export_logs;
DROP POLICY IF EXISTS "Users can view their own batch jobs" ON batch_jobs;
DROP POLICY IF EXISTS "Users can manage their own batch jobs" ON batch_jobs;
DROP POLICY IF EXISTS "Users can view their own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can manage their own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can view their own edge cases" ON edge_cases;
DROP POLICY IF EXISTS "Users can manage their own edge cases" ON edge_cases;

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own conversations"
    ON conversations FOR DELETE
    USING (auth.uid() = created_by);

-- Conversation turns policies (inherit from conversations)
CREATE POLICY "Users can view turns for their conversations"
    ON conversation_turns FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = conversation_turns.conversation_id
        AND conversations.created_by = auth.uid()
    ));

CREATE POLICY "Users can insert turns for their conversations"
    ON conversation_turns FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = conversation_turns.conversation_id
        AND conversations.created_by = auth.uid()
    ));

-- Generation logs policies
CREATE POLICY "Users can view their own generation logs"
    ON generation_logs FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own generation logs"
    ON generation_logs FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Templates policies (shared resource with creator access)
CREATE POLICY "All users can view active templates"
    ON conversation_templates FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Users can manage their own templates"
    ON conversation_templates FOR ALL
    USING (auth.uid() = created_by);

-- Scenarios policies
CREATE POLICY "Users can view their own scenarios"
    ON scenarios FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their own scenarios"
    ON scenarios FOR ALL
    USING (auth.uid() = created_by);

-- Edge cases policies
CREATE POLICY "Users can view their own edge cases"
    ON edge_cases FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their own edge cases"
    ON edge_cases FOR ALL
    USING (auth.uid() = created_by);

-- Export logs policies
CREATE POLICY "Users can view their own export logs"
    ON export_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export logs"
    ON export_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Batch jobs policies
CREATE POLICY "Users can view their own batch jobs"
    ON batch_jobs FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their own batch jobs"
    ON batch_jobs FOR ALL
    USING (auth.uid() = created_by);

-- ============================================================================
-- 11. UTILITY FUNCTIONS
-- ============================================================================

-- Function to calculate conversation quality score
CREATE OR REPLACE FUNCTION calculate_quality_score(
    p_turn_count INTEGER,
    p_total_tokens INTEGER,
    p_quality_metrics JSONB
) RETURNS DECIMAL(3,1) AS $$
DECLARE
    v_score DECIMAL(3,1) := 0;
    v_turn_score DECIMAL(3,1);
    v_length_score DECIMAL(3,1);
    v_metrics_score DECIMAL(3,1);
BEGIN
    -- Turn count scoring (optimal: 8-16 turns)
    IF p_turn_count BETWEEN 8 AND 16 THEN
        v_turn_score := 10.0;
    ELSIF p_turn_count BETWEEN 6 AND 20 THEN
        v_turn_score := 7.0;
    ELSE
        v_turn_score := 4.0;
    END IF;
    
    -- Token length scoring (optimal: 1000-3000 tokens)
    IF p_total_tokens BETWEEN 1000 AND 3000 THEN
        v_length_score := 10.0;
    ELSIF p_total_tokens BETWEEN 500 AND 5000 THEN
        v_length_score := 7.0;
    ELSE
        v_length_score := 4.0;
    END IF;
    
    -- Quality metrics average
    IF p_quality_metrics IS NOT NULL THEN
        v_metrics_score := (
            COALESCE((p_quality_metrics->>'overall')::DECIMAL, 5.0) +
            COALESCE((p_quality_metrics->>'relevance')::DECIMAL, 5.0) +
            COALESCE((p_quality_metrics->>'accuracy')::DECIMAL, 5.0)
        ) / 3.0;
    ELSE
        v_metrics_score := 5.0;
    END IF;
    
    -- Weighted average
    v_score := (v_turn_score * 0.3) + (v_length_score * 0.2) + (v_metrics_score * 0.5);
    
    RETURN ROUND(v_score, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to auto-flag low quality conversations
CREATE OR REPLACE FUNCTION auto_flag_low_quality()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quality_score < 6.0 AND NEW.status = 'generated' THEN
        NEW.status := 'needs_revision';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-flagging (safe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_flag_quality') THEN
        CREATE TRIGGER trigger_auto_flag_quality BEFORE INSERT OR UPDATE ON conversations
            FOR EACH ROW EXECUTE FUNCTION auto_flag_low_quality();
    END IF;
END $$;

-- ============================================================================
-- 12. SEED DATA
-- ============================================================================

-- Insert default conversation templates (only if none exist)
INSERT INTO conversation_templates (template_name, description, category, tier, template_text, structure, tone, complexity_baseline, is_active)
SELECT * FROM (VALUES 
    ('Financial Planning Triumph', 'Conversation showing successful financial planning journey', 'Financial Planning', 'template',
     'Generate a conversation between a financial advisor and {{persona}} about {{topic}}, with emotional arc showing {{emotion}}.', 
     'Introduction → Problem Identification → Strategy Development → Implementation → Success', 
     'Professional yet empathetic', 7, TRUE),
     
    ('Investment Discovery', 'Client discovering investment opportunities', 'Investment Strategy', 'template',
     'Create a conversation where {{persona}} explores {{topic}} with growing {{emotion}}.', 
     'Curiosity → Exploration → Understanding → Confidence → Action', 
     'Educational and encouraging', 6, TRUE),
     
    ('Retirement Planning Anxiety to Relief', 'Addressing retirement concerns', 'Retirement Planning', 'template',
     'Develop a conversation showing {{persona}} transitioning from {{emotion}} to relief about {{topic}}.', 
     'Anxiety → Clarification → Planning → Reassurance → Confidence', 
     'Reassuring and methodical', 8, TRUE)
) AS seed_data (template_name, description, category, tier, template_text, structure, tone, complexity_baseline, is_active)
WHERE NOT EXISTS (SELECT 1 FROM conversation_templates LIMIT 1);

-- ============================================================================
-- 13. COMMENTS
-- ============================================================================

COMMENT ON TABLE conversations IS 'Core table storing all generated conversations with metadata and quality metrics';
COMMENT ON TABLE conversation_turns IS 'Normalized storage of individual conversation turns';
COMMENT ON TABLE generation_logs IS 'Audit trail of all AI generation requests and responses';
COMMENT ON TABLE conversation_templates IS 'Reusable templates for conversation generation (renamed from prompt_templates to avoid conflicts)';
COMMENT ON TABLE scenarios IS 'Specific scenarios derived from templates';
COMMENT ON TABLE edge_cases IS 'Edge cases and boundary conditions for testing';
COMMENT ON TABLE export_logs IS 'Audit trail of all data exports';
COMMENT ON TABLE batch_jobs IS 'Async job processing for generation, export, and cleanup';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verification queries
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('conversations', 'conversation_turns', 'conversation_templates', 
                       'scenarios', 'edge_cases', 'generation_logs', 'export_logs', 'batch_jobs');
    
    RAISE NOTICE 'Train module tables created: % of 8', table_count;
    
    IF table_count = 8 THEN
        RAISE NOTICE '✓ All train module tables created successfully';
    ELSE
        RAISE WARNING '⚠ Expected 8 tables, found %', table_count;
    END IF;
END $$;

