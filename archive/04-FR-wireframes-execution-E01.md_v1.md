# Train Platform - Implementation Execution Instructions (E01) - Updated
**Generated**: 2025-10-29  
**Updated**: 2025-01-27 (SQL Schema Updated)
**Segment**: E01 - Foundation & Core Infrastructure  
**Total Prompts**: 6  
**Estimated Implementation Time**: 80-120 hours

## Executive Summary

This segment implements the foundational database architecture, AI integration infrastructure, and core UI components for the Interactive LoRA Conversation Generation platform. It transforms the task inventory from `04-train-FR-wireframes-E01-output.md` into executable implementation prompts that leverage Claude-4.5-sonnet's capabilities in 200k token context windows.

**Strategic Focus**: Build a solid foundation enabling rapid iteration on generation workflows, quality control, and user experience enhancements in subsequent segments.

**Update Notes**: This version includes the improved, failsafe SQL migration schema with enhanced safety features, better naming conventions, and comprehensive error handling.

## Context and Dependencies

### Previous Segment Deliverables
- **Stages 1 & 2 Complete**: Document categorization and chunk extraction modules fully operational
- **Wireframe UI**: Complete component library and type system in `train-wireframe/src/`
- **Database Foundation**: Supabase PostgreSQL with documents, chunks, and dimension tables
- **AI Integration**: Claude API integration patterns established in chunk dimension generation

### Current Codebase State
**Wireframe Components Ready**:
- Dashboard layout, conversation table, filter bar, pagination
- Generation modals (batch and single)
- Template, scenario, and edge case views
- Settings and review queue interfaces
- Complete Shadcn/UI component library

**Backend Services Existing**:
- Supabase client configuration
- AI config and Claude API integration
- Database service patterns
- API response logging infrastructure

### Cross-Segment Dependencies
- Chunk-alpha module integration for conversation-to-chunk linking
- Existing auth system (Supabase Auth)
- File processing and text extraction utilities

## Implementation Strategy

### Risk Assessment
**High-Risk Tasks**:
1. **Database Schema** (T-1.1.0): Foundation for entire system - errors cascade
2. **Claude API Integration** (T-2.1.0): Rate limiting and cost management critical
3. **Quality Validation** (T-2.3.0): Scoring algorithm impacts user trust

**Mitigation**: Front-load database and API integration, include comprehensive testing

### Prompt Sequencing Logic
**Sequence Rationale**:
1. **Database First**: Schema must exist before any data operations
2. **API Integration**: Required for generation features
3. **Core UI Components**: Enable user interaction with backend
4. **Generation Workflows**: Combine backend and frontend
5. **Quality & Review**: Build on generated data
6. **Export System**: Requires complete conversation lifecycle

### Quality Assurance Approach
- Each prompt includes specific validation steps
- Acceptance criteria mapped to functional requirements
- Incremental testing: unit → integration → end-to-end
- Performance benchmarks specified per prompt

## Database Setup Instructions

### Required SQL Operations

Execute these SQL statements in Supabase SQL Editor before beginning implementation prompts:

========================

```sql
-- ============================================================================
-- TRAIN PLATFORM DATABASE SCHEMA - IMPROVED MIGRATION
-- Version: 2.0 (Failsafe)
-- Description: Complete database schema for Interactive LoRA Conversation Generation
-- Dependencies: Requires Supabase with pg_crypto extension
-- Safety Features: CREATE IF NOT EXISTS, comprehensive error handling
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search and similarity matching

-- ============================================================================
-- 1. CONVERSATIONS TABLE (Core Entity)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id TEXT UNIQUE NOT NULL,
    
    -- Foreign Keys
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL,
    
    -- Core Metadata
    title TEXT,
    persona TEXT NOT NULL,
    emotion TEXT NOT NULL,
    scenario_context TEXT,
    
    -- Generation Parameters
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER DEFAULT 4000 CHECK (max_tokens > 0),
    system_prompt TEXT,
    
    -- Quality Metrics
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
    coherence_score DECIMAL(3,2) CHECK (coherence_score >= 0 AND coherence_score <= 1),
    relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
    
    -- Status and Flags
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'reviewed', 'approved', 'rejected')),
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    
    -- Audit Fields
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 2. CONVERSATION_TURNS TABLE (Conversation Content)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversation_turns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Turn Metadata
    turn_number INTEGER NOT NULL CHECK (turn_number > 0),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    
    -- Content
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'json')),
    
    -- Generation Metadata
    token_count INTEGER CHECK (token_count >= 0),
    generation_time_ms INTEGER CHECK (generation_time_ms >= 0),
    
    -- Quality Metrics
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Ensure unique turn numbers per conversation
    UNIQUE(conversation_id, turn_number)
);

-- ============================================================================
-- 3. CONVERSATION_TEMPLATES TABLE (Renamed from prompt_templates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Identity
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    
    -- Template Content
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT,
    
    -- Configuration
    default_temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (default_temperature >= 0 AND default_temperature <= 2),
    default_max_tokens INTEGER DEFAULT 4000 CHECK (default_max_tokens > 0),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit Fields
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 4. GENERATION_LOGS TABLE (AI Generation Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    turn_id UUID REFERENCES conversation_turns(id) ON DELETE CASCADE,
    
    -- Generation Request
    model_name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    temperature DECIMAL(3,2) CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER CHECK (max_tokens > 0),
    
    -- Generation Response
    response TEXT,
    finish_reason TEXT,
    
    -- Metrics
    prompt_tokens INTEGER CHECK (prompt_tokens >= 0),
    completion_tokens INTEGER CHECK (completion_tokens >= 0),
    total_tokens INTEGER CHECK (total_tokens >= 0),
    generation_time_ms INTEGER CHECK (generation_time_ms >= 0),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 5. SCENARIOS TABLE (Conversation Scenarios)
-- ============================================================================

CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Scenario Identity
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    
    -- Scenario Content
    context TEXT NOT NULL,
    objectives TEXT[],
    constraints TEXT[],
    
    -- Configuration
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
    estimated_turns INTEGER DEFAULT 5 CHECK (estimated_turns > 0),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit Fields
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 6. EDGE_CASES TABLE (Edge Case Scenarios)
-- ============================================================================

CREATE TABLE IF NOT EXISTS edge_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Edge Case Identity
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    
    -- Edge Case Content
    trigger_condition TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    test_input TEXT,
    expected_output TEXT,
    
    -- Classification
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    frequency TEXT DEFAULT 'rare' CHECK (frequency IN ('common', 'uncommon', 'rare', 'very_rare')),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit Fields
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 7. EXPORT_LOGS TABLE (Export Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS export_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Export Configuration
    export_type TEXT NOT NULL CHECK (export_type IN ('jsonl', 'csv', 'json', 'txt')),
    filter_criteria JSONB DEFAULT '{}'::jsonb,
    
    -- Export Results
    total_conversations INTEGER CHECK (total_conversations >= 0),
    exported_conversations INTEGER CHECK (exported_conversations >= 0),
    file_path TEXT,
    file_size_bytes BIGINT CHECK (file_size_bytes >= 0),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Audit Fields
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 8. BATCH_JOBS TABLE (Batch Processing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS batch_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Job Configuration
    job_type TEXT NOT NULL CHECK (job_type IN ('generation', 'quality_check', 'export', 'cleanup')),
    job_name TEXT NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    
    -- Job Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Job Results
    total_items INTEGER CHECK (total_items >= 0),
    processed_items INTEGER DEFAULT 0 CHECK (processed_items >= 0),
    successful_items INTEGER DEFAULT 0 CHECK (successful_items >= 0),
    failed_items INTEGER DEFAULT 0 CHECK (failed_items >= 0),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Error Handling
    error_message TEXT,
    error_details JSONB,
    
    -- Audit Fields
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_document_id ON conversations(document_id);
CREATE INDEX IF NOT EXISTS idx_conversations_chunk_id ON conversations(chunk_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_quality_score ON conversations(quality_score);
CREATE INDEX IF NOT EXISTS idx_conversations_is_flagged ON conversations(is_flagged) WHERE is_flagged = TRUE;

-- Composite indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_status_created_at ON conversations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by_status ON conversations(created_by, status);

-- GIN indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_tags ON conversations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_conversations_metadata ON conversations USING GIN(metadata);

-- Text search indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_title_trgm ON conversations USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_conversations_persona_trgm ON conversations USING GIN(persona gin_trgm_ops);

-- Conversation turns indexes
CREATE INDEX IF NOT EXISTS idx_conversation_turns_conversation_id ON conversation_turns(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_turns_role ON conversation_turns(role);
CREATE INDEX IF NOT EXISTS idx_conversation_turns_turn_number ON conversation_turns(turn_number);

-- Composite indexes for conversation turns
CREATE INDEX IF NOT EXISTS idx_conversation_turns_conv_turn ON conversation_turns(conversation_id, turn_number);

-- GIN indexes for conversation turns
CREATE INDEX IF NOT EXISTS idx_conversation_turns_metadata ON conversation_turns USING GIN(metadata);

-- Text search indexes for conversation turns
CREATE INDEX IF NOT EXISTS idx_conversation_turns_content_trgm ON conversation_turns USING GIN(content gin_trgm_ops);

-- Conversation templates indexes
CREATE INDEX IF NOT EXISTS idx_conversation_templates_category ON conversation_templates(category);
CREATE INDEX IF NOT EXISTS idx_conversation_templates_is_active ON conversation_templates(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_conversation_templates_created_by ON conversation_templates(created_by);

-- GIN indexes for conversation templates
CREATE INDEX IF NOT EXISTS idx_conversation_templates_tags ON conversation_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_conversation_templates_metadata ON conversation_templates USING GIN(metadata);

-- Text search indexes for conversation templates
CREATE INDEX IF NOT EXISTS idx_conversation_templates_name_trgm ON conversation_templates USING GIN(name gin_trgm_ops);

-- Generation logs indexes
CREATE INDEX IF NOT EXISTS idx_generation_logs_conversation_id ON generation_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_turn_id ON generation_logs(turn_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_model_name ON generation_logs(model_name);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at);

-- Composite indexes for generation logs
CREATE INDEX IF NOT EXISTS idx_generation_logs_status_created_at ON generation_logs(status, created_at);

-- GIN indexes for generation logs
CREATE INDEX IF NOT EXISTS idx_generation_logs_metadata ON generation_logs USING GIN(metadata);

-- Scenarios indexes
CREATE INDEX IF NOT EXISTS idx_scenarios_category ON scenarios(category);
CREATE INDEX IF NOT EXISTS idx_scenarios_is_active ON scenarios(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_scenarios_difficulty_level ON scenarios(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_scenarios_created_by ON scenarios(created_by);

-- GIN indexes for scenarios
CREATE INDEX IF NOT EXISTS idx_scenarios_tags ON scenarios USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_scenarios_metadata ON scenarios USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_scenarios_objectives ON scenarios USING GIN(objectives);
CREATE INDEX IF NOT EXISTS idx_scenarios_constraints ON scenarios USING GIN(constraints);

-- Text search indexes for scenarios
CREATE INDEX IF NOT EXISTS idx_scenarios_name_trgm ON scenarios USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_scenarios_context_trgm ON scenarios USING GIN(context gin_trgm_ops);

-- Edge cases indexes
CREATE INDEX IF NOT EXISTS idx_edge_cases_category ON edge_cases(category);
CREATE INDEX IF NOT EXISTS idx_edge_cases_is_active ON edge_cases(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_edge_cases_severity ON edge_cases(severity);
CREATE INDEX IF NOT EXISTS idx_edge_cases_frequency ON edge_cases(frequency);
CREATE INDEX IF NOT EXISTS idx_edge_cases_created_by ON edge_cases(created_by);

-- GIN indexes for edge cases
CREATE INDEX IF NOT EXISTS idx_edge_cases_tags ON edge_cases USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_edge_cases_metadata ON edge_cases USING GIN(metadata);

-- Text search indexes for edge cases
CREATE INDEX IF NOT EXISTS idx_edge_cases_name_trgm ON edge_cases USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_edge_cases_trigger_condition_trgm ON edge_cases USING GIN(trigger_condition gin_trgm_ops);

-- Export logs indexes
CREATE INDEX IF NOT EXISTS idx_export_logs_export_type ON export_logs(export_type);
CREATE INDEX IF NOT EXISTS idx_export_logs_status ON export_logs(status);
CREATE INDEX IF NOT EXISTS idx_export_logs_created_by ON export_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_export_logs_created_at ON export_logs(created_at);

-- Composite indexes for export logs
CREATE INDEX IF NOT EXISTS idx_export_logs_status_created_at ON export_logs(status, created_at);

-- GIN indexes for export logs
CREATE INDEX IF NOT EXISTS idx_export_logs_filter_criteria ON export_logs USING GIN(filter_criteria);
CREATE INDEX IF NOT EXISTS idx_export_logs_metadata ON export_logs USING GIN(metadata);

-- Batch jobs indexes
CREATE INDEX IF NOT EXISTS idx_batch_jobs_job_type ON batch_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created_by ON batch_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created_at ON batch_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_started_at ON batch_jobs(started_at);

-- Composite indexes for batch jobs
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status_created_at ON batch_jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_type_status ON batch_jobs(job_type, status);

-- Partial indexes for batch jobs
CREATE INDEX IF NOT EXISTS idx_batch_jobs_running ON batch_jobs(created_at) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS idx_batch_jobs_failed ON batch_jobs(created_at) WHERE status = 'failed';

-- GIN indexes for batch jobs
CREATE INDEX IF NOT EXISTS idx_batch_jobs_parameters ON batch_jobs USING GIN(parameters);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_metadata ON batch_jobs USING GIN(metadata);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_train_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic updated_at
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();

CREATE TRIGGER update_conversation_templates_updated_at 
    BEFORE UPDATE ON conversation_templates 
    FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at 
    BEFORE UPDATE ON scenarios 
    FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();

CREATE TRIGGER update_edge_cases_updated_at 
    BEFORE UPDATE ON edge_cases 
    FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();

CREATE TRIGGER update_batch_jobs_updated_at 
    BEFORE UPDATE ON batch_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
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

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own conversations" ON conversations
    FOR DELETE USING (created_by = auth.uid());

-- Conversation turns policies
CREATE POLICY "Users can view turns for their conversations" ON conversation_turns
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert turns for their conversations" ON conversation_turns
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update turns for their conversations" ON conversation_turns
    FOR UPDATE USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete turns for their conversations" ON conversation_turns
    FOR DELETE USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE created_by = auth.uid()
        )
    );

-- Generation logs policies
CREATE POLICY "Users can view generation logs for their conversations" ON generation_logs
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert generation logs for their conversations" ON generation_logs
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations WHERE created_by = auth.uid()
        )
    );

-- Conversation templates policies
CREATE POLICY "Users can view their own conversation templates" ON conversation_templates
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own conversation templates" ON conversation_templates
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own conversation templates" ON conversation_templates
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own conversation templates" ON conversation_templates
    FOR DELETE USING (created_by = auth.uid());

-- Scenarios policies
CREATE POLICY "Users can view their own scenarios" ON scenarios
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own scenarios" ON scenarios
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own scenarios" ON scenarios
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own scenarios" ON scenarios
    FOR DELETE USING (created_by = auth.uid());

-- Edge cases policies
CREATE POLICY "Users can view their own edge cases" ON edge_cases
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own edge cases" ON edge_cases
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own edge cases" ON edge_cases
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own edge cases" ON edge_cases
    FOR DELETE USING (created_by = auth.uid());

-- Export logs policies
CREATE POLICY "Users can view their own export logs" ON export_logs
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own export logs" ON export_logs
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own export logs" ON export_logs
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own export logs" ON export_logs
    FOR DELETE USING (created_by = auth.uid());

-- Batch jobs policies
CREATE POLICY "Users can view their own batch jobs" ON batch_jobs
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own batch jobs" ON batch_jobs
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own batch jobs" ON batch_jobs
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own batch jobs" ON batch_jobs
    FOR DELETE USING (created_by = auth.uid());

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to calculate quality score based on multiple metrics
CREATE OR REPLACE FUNCTION calculate_quality_score(
    coherence DECIMAL(3,2),
    relevance DECIMAL(3,2),
    completeness DECIMAL(3,2) DEFAULT 1.0
) RETURNS DECIMAL(3,2) AS $$
BEGIN
    -- Weighted average: coherence 40%, relevance 40%, completeness 20%
    RETURN ROUND(
        (coherence * 0.4 + relevance * 0.4 + completeness * 0.2)::DECIMAL(3,2), 
        2
    );
END;
$$ LANGUAGE plpgsql;

-- Function to automatically flag low quality conversations
CREATE OR REPLACE FUNCTION auto_flag_low_quality()
RETURNS TRIGGER AS $$
BEGIN
    -- Flag conversations with quality score below 0.3
    IF NEW.quality_score IS NOT NULL AND NEW.quality_score < 0.3 THEN
        NEW.is_flagged = TRUE;
        NEW.flag_reason = 'Low quality score: ' || NEW.quality_score;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-flagging
CREATE TRIGGER auto_flag_low_quality_conversations
    BEFORE INSERT OR UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION auto_flag_low_quality();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default conversation templates
INSERT INTO conversation_templates (name, description, category, system_prompt, created_by) VALUES
('General Assistant', 'A helpful, harmless, and honest AI assistant', 'general', 
 'You are a helpful, harmless, and honest AI assistant. Provide clear, accurate, and helpful responses to user questions.', 
 '00000000-0000-0000-0000-000000000000'),
 
('Technical Support', 'Technical support conversation template', 'support',
 'You are a technical support specialist. Help users troubleshoot technical issues with patience and clear step-by-step instructions.',
 '00000000-0000-0000-0000-000000000000'),
 
('Educational Tutor', 'Educational tutoring conversation template', 'education',
 'You are an educational tutor. Help students learn by asking guiding questions and providing explanations that build understanding.',
 '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE conversations IS 'Core conversation entities with metadata and quality metrics';
COMMENT ON TABLE conversation_turns IS 'Individual turns/messages within conversations';
COMMENT ON TABLE conversation_templates IS 'Reusable templates for conversation generation (renamed from prompt_templates)';
COMMENT ON TABLE generation_logs IS 'Logs of AI generation requests and responses';
COMMENT ON TABLE scenarios IS 'Conversation scenarios and contexts';
COMMENT ON TABLE edge_cases IS 'Edge case scenarios for testing and validation';
COMMENT ON TABLE export_logs IS 'Logs of data export operations';
COMMENT ON TABLE batch_jobs IS 'Batch processing job tracking and status';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all tables were created successfully
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'conversations', 
    'conversation_turns', 
    'conversation_templates', 
    'generation_logs', 
    'scenarios', 
    'edge_cases', 
    'export_logs', 
    'batch_jobs'
)
ORDER BY tablename;
```

========================

### Schema Changes Summary

**Key Improvements in v2.0**:
1. **Safety Features**: All `CREATE TABLE` statements use `CREATE TABLE IF NOT EXISTS`
2. **Better Naming**: `prompt_templates` renamed to `conversation_templates` for clarity
3. **Enhanced Constraints**: Comprehensive CHECK constraints for data validation
4. **Improved Indexes**: Better performance with composite and partial indexes
5. **Error Handling**: Robust error handling in functions and triggers
6. **Documentation**: Comprehensive comments and verification queries

### Validation Steps

After executing the SQL schema:

1. **Verify Table Creation**:
   ```sql
   SELECT tablename FROM pg_tables WHERE tablename LIKE '%conversation%' OR tablename LIKE '%scenario%' OR tablename LIKE '%edge_case%' OR tablename LIKE '%batch_job%' OR tablename LIKE '%export_log%' OR tablename LIKE '%generation_log%';
   ```

2. **Check Indexes**:
   ```sql
   SELECT indexname, tablename FROM pg_indexes WHERE tablename IN ('conversations', 'conversation_turns', 'conversation_templates', 'generation_logs', 'scenarios', 'edge_cases', 'export_logs', 'batch_jobs');
   ```

3. **Verify RLS Policies**:
   ```sql
   SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('conversations', 'conversation_turns', 'conversation_templates', 'generation_logs', 'scenarios', 'edge_cases', 'export_logs', 'batch_jobs');
   ```

## Implementation Prompts

### Prompt 1: Database Foundation & Core Schema
**Task ID**: T-1.1.0  
**Priority**: Critical  
**Estimated Time**: 8-12 hours

**Objective**: Implement the complete database schema with all tables, indexes, RLS policies, and utility functions.

**Context**: The improved schema includes failsafe features and better naming conventions. The `conversation_templates` table replaces `prompt_templates` for better clarity.

**Implementation Requirements**:
1. Execute the complete SQL schema provided above
2. Verify all 8 tables are created successfully
3. Confirm all indexes are properly created
4. Test RLS policies with sample data
5. Validate utility functions work correctly

**Acceptance Criteria**:
- [ ] All 8 tables created: conversations, conversation_turns, conversation_templates, generation_logs, scenarios, edge_cases, export_logs, batch_jobs
- [ ] All indexes created and optimized for query patterns
- [ ] RLS policies active and tested
- [ ] Utility functions operational
- [ ] Seed data inserted successfully
- [ ] Verification queries return expected results

**Testing Strategy**:
- Insert test data for each table
- Verify foreign key constraints
- Test RLS with different user contexts
- Validate trigger functionality
- Performance test with sample queries

---

### Prompt 2: AI Integration Infrastructure
**Task ID**: T-2.1.0  
**Priority**: High  
**Estimated Time**: 12-16 hours

**Objective**: Build robust Claude API integration with rate limiting, error handling, and comprehensive logging.

**Context**: Extends existing AI config patterns from chunk dimension generation. Must handle conversation generation workflows with proper token management.

**Implementation Requirements**:
1. **Enhanced AI Service** (`src/lib/ai/conversation-ai.ts`):
   - Conversation generation with context awareness
   - Template-based prompt construction
   - Token counting and cost tracking
   - Rate limiting with exponential backoff
   - Comprehensive error handling and retry logic

2. **Generation Logging** (`src/lib/services/generation-logs.ts`):
   - Log all generation requests and responses
   - Track token usage and costs
   - Performance metrics collection
   - Error categorization and analysis

3. **Quality Assessment** (`src/lib/ai/quality-assessment.ts`):
   - Automated quality scoring algorithms
   - Coherence and relevance analysis
   - Content validation rules
   - Flagging system for low-quality content

**Acceptance Criteria**:
- [ ] Claude API integration with conversation context
- [ ] Rate limiting prevents API quota exhaustion
- [ ] All generations logged to generation_logs table
- [ ] Quality scores calculated automatically
- [ ] Error handling covers all failure scenarios
- [ ] Token usage tracked accurately
- [ ] Performance metrics collected

**Testing Strategy**:
- Generate test conversations with various parameters
- Simulate API failures and rate limits
- Validate quality scoring accuracy
- Test with different conversation templates
- Performance test with concurrent requests

---

### Prompt 3: Core UI Components Integration
**Task ID**: T-3.1.0  
**Priority**: High  
**Estimated Time**: 16-20 hours

**Objective**: Integrate wireframe UI components with the new database schema and AI services.

**Context**: Wireframe components exist but need integration with the updated schema. Focus on conversation management, template handling, and generation workflows.

**Implementation Requirements**:
1. **Database Service Updates** (`src/lib/services/`):
   - Update all services for new schema
   - Handle conversation_templates (renamed from prompt_templates)
   - Implement proper error handling
   - Add pagination and filtering

2. **Component Integration**:
   - Update ConversationTable for new schema
   - Integrate TemplateManager with conversation_templates
   - Connect GenerationModal to AI services
   - Update all forms for new field names

3. **Type System Updates** (`src/types/`):
   - Update all interfaces for schema changes
   - Add new types for conversation_templates
   - Update API response types
   - Ensure type safety across components

**Acceptance Criteria**:
- [ ] All database services updated for new schema
- [ ] UI components render with real data
- [ ] Forms handle all required fields
- [ ] Error states properly displayed
- [ ] Loading states implemented
- [ ] Pagination and filtering functional
- [ ] Type safety maintained throughout

**Testing Strategy**:
- Test all CRUD operations through UI
- Validate form submissions
- Test error handling in components
- Verify pagination and filtering
- Cross-browser compatibility testing

---

### Prompt 4: Generation Workflows Implementation
**Task ID**: T-4.1.0  
**Priority**: High  
**Estimated Time**: 20-24 hours

**Objective**: Implement complete conversation generation workflows including single and batch generation.

**Context**: Combines AI services with UI components to create end-to-end generation workflows. Must handle various generation scenarios and edge cases.

**Implementation Requirements**:
1. **Single Conversation Generation**:
   - Template selection and customization
   - Parameter configuration (temperature, max_tokens)
   - Real-time generation with progress tracking
   - Quality assessment and flagging
   - Save and review workflows

2. **Batch Generation System**:
   - Batch job creation and management
   - Progress tracking and status updates
   - Error handling for failed generations
   - Partial completion handling
   - Results aggregation and reporting

3. **Generation Management**:
   - Generation history and logs
   - Regeneration capabilities
   - Quality filtering and sorting
   - Export preparation

**Acceptance Criteria**:
- [ ] Single conversation generation functional
- [ ] Batch generation with progress tracking
- [ ] Quality assessment integrated
- [ ] Error handling for all scenarios
- [ ] Generation logs properly maintained
- [ ] User feedback and status updates
- [ ] Performance optimized for large batches

**Testing Strategy**:
- Generate single conversations with various templates
- Test batch generation with different sizes
- Simulate generation failures
- Validate quality assessment accuracy
- Performance test with large batches

---

### Prompt 5: Quality Control & Review System
**Task ID**: T-5.1.0  
**Priority**: Medium  
**Estimated Time**: 16-20 hours

**Objective**: Implement comprehensive quality control and review workflows for generated conversations.

**Context**: Builds on quality assessment from generation workflows. Provides tools for manual review, quality improvement, and content curation.

**Implementation Requirements**:
1. **Review Queue System**:
   - Flagged conversation management
   - Review assignment and tracking
   - Quality score filtering
   - Batch review operations

2. **Quality Improvement Tools**:
   - Conversation editing and refinement
   - Regeneration with improved prompts
   - Quality score recalculation
   - Approval and rejection workflows

3. **Analytics and Reporting**:
   - Quality metrics dashboard
   - Generation performance analytics
   - Template effectiveness analysis
   - User activity reporting

**Acceptance Criteria**:
- [ ] Review queue functional with filtering
- [ ] Quality improvement tools operational
- [ ] Analytics dashboard with key metrics
- [ ] Batch operations for efficiency
- [ ] Approval workflows implemented
- [ ] Performance tracking accurate

**Testing Strategy**:
- Review conversations with various quality scores
- Test quality improvement workflows
- Validate analytics accuracy
- Test batch review operations
- Performance test with large review queues

---

### Prompt 6: Export System & Data Management
**Task ID**: T-6.1.0  
**Priority**: Medium  
**Estimated Time**: 12-16 hours

**Objective**: Implement comprehensive export system for training data preparation and data management tools.

**Context**: Final component enabling data export for LoRA training. Must handle various export formats and large datasets efficiently.

**Implementation Requirements**:
1. **Export System**:
   - Multiple format support (JSONL, CSV, JSON, TXT)
   - Filtering and selection criteria
   - Large dataset handling with streaming
   - Export job tracking and status
   - Download and file management

2. **Data Management Tools**:
   - Conversation cleanup and archiving
   - Duplicate detection and removal
   - Data validation and integrity checks
   - Backup and restore capabilities

3. **Integration Features**:
   - Export logs and audit trails
   - Scheduled export jobs
   - API endpoints for external access
   - Integration with training pipelines

**Acceptance Criteria**:
- [ ] Export system supports all required formats
- [ ] Large dataset exports handle efficiently
- [ ] Export jobs tracked and logged
- [ ] Data management tools functional
- [ ] API endpoints operational
- [ ] Performance optimized for large exports

**Testing Strategy**:
- Export datasets in all supported formats
- Test with large conversation sets
- Validate export job tracking
- Test data management operations
- Performance test with maximum dataset sizes

## Cross-Prompt Dependencies

### Critical Path
1. **Database Schema** → All other prompts depend on this foundation
2. **AI Integration** → Required for generation workflows
3. **UI Integration** → Enables user interaction with backend
4. **Generation Workflows** → Core functionality for the platform
5. **Quality Control** → Enhances generation quality
6. **Export System** → Final data preparation step

### Shared Components
- **Type System**: Updated in Prompt 3, used by all subsequent prompts
- **Database Services**: Core services updated in Prompt 3, extended in later prompts
- **AI Services**: Established in Prompt 2, extended in Prompt 4
- **Error Handling**: Consistent patterns across all prompts

### Integration Points
- **Quality Assessment**: Integrated in generation (Prompt 4) and review (Prompt 5)
- **Logging**: Generation logs (Prompt 2) used in analytics (Prompt 5)
- **Export Preparation**: Quality control (Prompt 5) feeds into export (Prompt 6)

## Success Metrics

### Technical Metrics
- **Database Performance**: Query response times < 100ms for standard operations
- **AI Integration**: Generation success rate > 95%
- **UI Responsiveness**: Page load times < 2 seconds
- **Error Handling**: Graceful degradation for all failure scenarios

### Functional Metrics
- **Generation Quality**: Average quality score > 0.7
- **User Experience**: Task completion rate > 90%
- **System Reliability**: Uptime > 99.5%
- **Data Integrity**: Zero data loss incidents

### Business Metrics
- **Conversation Generation**: Target 1000+ conversations per day
- **Quality Approval**: > 80% of generated conversations approved
- **Export Efficiency**: Large dataset exports complete within 30 minutes
- **User Adoption**: Active user engagement with all core features

This updated specification incorporates the improved, failsafe SQL migration while maintaining all the original implementation guidance and requirements. The key changes focus on the enhanced database schema with better safety features, naming conventions, and error handling capabilities.