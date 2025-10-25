-- =====================================================
-- CHUNK ALPHA MODULE - DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: chunks
-- Stores extracted chunks with mechanical metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_id TEXT NOT NULL UNIQUE,  -- Format: DOC_ID#C001
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Mechanical dimensions (generated during extraction)
    chunk_type TEXT NOT NULL CHECK (chunk_type IN ('Chapter_Sequential', 'Instructional_Unit', 'CER', 'Example_Scenario')),
    section_heading TEXT,
    page_start INTEGER,
    page_end INTEGER,
    char_start INTEGER NOT NULL,
    char_end INTEGER NOT NULL,
    token_count INTEGER NOT NULL,
    overlap_tokens INTEGER DEFAULT 0,
    chunk_handle TEXT,  -- URL-safe slug
    chunk_text TEXT NOT NULL,  -- The actual chunk content
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Indexes for performance
    CONSTRAINT idx_chunks_document FOREIGN KEY (document_id) REFERENCES documents(id)
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_type ON chunks(chunk_type);
CREATE INDEX IF NOT EXISTS idx_chunks_handle ON chunks(chunk_handle);

-- =====================================================
-- TABLE: chunk_dimensions
-- Stores AI-generated dimensions for each chunk run
-- =====================================================
CREATE TABLE IF NOT EXISTS chunk_dimensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_id UUID NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
    run_id UUID NOT NULL,  -- Groups dimensions from the same generation run
    
    -- Previously generated (inherited from document)
    doc_id TEXT,
    doc_title TEXT,
    doc_version TEXT,
    source_type TEXT,
    source_url TEXT,
    author TEXT,
    doc_date DATE,
    primary_category TEXT,
    
    -- AI-generated content dimensions
    chunk_summary_1s TEXT,  -- <= 240 chars
    key_terms TEXT[],
    audience TEXT,
    intent TEXT,
    tone_voice_tags TEXT[],
    brand_persona_tags TEXT[],
    domain_tags TEXT[],
    
    -- Task/Instructional dimensions (for Instructional_Unit chunks)
    task_name TEXT,
    preconditions TEXT,
    inputs TEXT,
    steps_json JSONB,
    expected_output TEXT,
    warnings_failure_modes TEXT,
    
    -- CER dimensions (for CER chunks)
    claim TEXT,
    evidence_snippets TEXT[],
    reasoning_sketch TEXT,
    citations TEXT[],
    factual_confidence_0_1 DECIMAL(3,2),
    
    -- Example/Scenario dimensions (for Example_Scenario chunks)
    scenario_type TEXT,
    problem_context TEXT,
    solution_action TEXT,
    outcome_metrics TEXT,
    style_notes TEXT,
    
    -- Training generation dimensions
    prompt_candidate TEXT,
    target_answer TEXT,
    style_directives TEXT,
    
    -- Risk & compliance dimensions
    safety_tags TEXT[],
    coverage_tag TEXT,
    novelty_tag TEXT,
    ip_sensitivity TEXT,
    pii_flag BOOLEAN DEFAULT false,
    compliance_flags TEXT[],
    
    -- Training metadata
    embedding_id TEXT,
    vector_checksum TEXT,
    label_source_auto_manual_mixed TEXT,
    label_model TEXT,
    labeled_by TEXT,
    label_timestamp_iso TIMESTAMPTZ,
    review_status TEXT DEFAULT 'unreviewed',
    include_in_training_yn BOOLEAN DEFAULT true,
    data_split_train_dev_test TEXT,
    augmentation_notes TEXT,
    
    -- Meta-dimensions for evaluation
    generation_confidence_precision INTEGER CHECK (generation_confidence_precision >= 1 AND generation_confidence_precision <= 10),
    generation_confidence_accuracy INTEGER CHECK (generation_confidence_accuracy >= 1 AND generation_confidence_accuracy <= 10),
    generation_cost_usd DECIMAL(10,4),
    generation_duration_ms INTEGER,
    prompt_template_id UUID,
    
    -- Timestamps
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT idx_chunk_dims_chunk FOREIGN KEY (chunk_id) REFERENCES chunks(id)
);

-- Indexes for chunk_dimensions
CREATE INDEX IF NOT EXISTS idx_chunk_dims_run ON chunk_dimensions(run_id);
CREATE INDEX IF NOT EXISTS idx_chunk_dims_chunk_id ON chunk_dimensions(chunk_id);

-- =====================================================
-- TABLE: chunk_runs
-- Tracks generation runs for comparison
-- =====================================================
CREATE TABLE IF NOT EXISTS chunk_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    run_name TEXT NOT NULL,  -- e.g., "Chapter 1 - 2025-10-05 14:30:15"
    
    -- Run metadata
    total_chunks INTEGER,
    total_dimensions INTEGER,
    total_cost_usd DECIMAL(10,2),
    total_duration_ms INTEGER,
    ai_model TEXT DEFAULT 'claude-sonnet-4.5',
    
    -- Status tracking
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_chunk_runs_document ON chunk_runs(document_id);
CREATE INDEX IF NOT EXISTS idx_chunk_runs_status ON chunk_runs(status);

-- =====================================================
-- TABLE: prompt_templates
-- Stores AI prompt templates for dimension generation
-- =====================================================
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT NOT NULL UNIQUE,
    template_type TEXT NOT NULL,  -- e.g., 'content_analysis', 'task_extraction', 'cer_analysis'
    prompt_text TEXT NOT NULL,
    response_schema JSONB,  -- JSON Schema for structured responses
    applicable_chunk_types TEXT[],
    
    -- Version control
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    notes TEXT
);

-- =====================================================
-- TABLE: chunk_extraction_jobs
-- Background job tracking for chunk extraction
-- =====================================================
CREATE TABLE IF NOT EXISTS chunk_extraction_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Job status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'extracting', 'generating_dimensions', 'completed', 'failed')),
    progress_percentage INTEGER DEFAULT 0,
    current_step TEXT,
    
    -- Results
    total_chunks_extracted INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_extraction_jobs_document ON chunk_extraction_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_extraction_jobs_status ON chunk_extraction_jobs(status);

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_chunks_updated_at BEFORE UPDATE ON chunks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Initial Prompt Templates
-- =====================================================
INSERT INTO prompt_templates (template_name, template_type, prompt_text, response_schema, applicable_chunk_types, notes)
VALUES 
(
    'content_analysis_v1',
    'content_analysis',
    'Analyze the following content chunk and extract key metadata.

CHUNK TYPE: {chunk_type}
DOCUMENT TITLE: {doc_title}
DOCUMENT CATEGORY: {primary_category}
CHUNK TEXT:
---
{chunk_text}
---

Extract and return the following dimensions in JSON format:
- chunk_summary_1s: One sentence summary (<= 240 characters)
- key_terms: Array of 3-5 salient terms
- audience: Intended reader/user persona
- intent: Primary intent (educate|instruct|persuade|inform|narrate|summarize|compare|evaluate)
- tone_voice_tags: Array of style/voice descriptors
- brand_persona_tags: Array of brand identity traits
- domain_tags: Array of topic/domain taxonomy labels

Return ONLY valid JSON with these exact keys.',
    '{"type": "object", "properties": {"chunk_summary_1s": {"type": "string", "maxLength": 240}, "key_terms": {"type": "array", "items": {"type": "string"}}, "audience": {"type": "string"}, "intent": {"type": "string", "enum": ["educate", "instruct", "persuade", "inform", "narrate", "summarize", "compare", "evaluate"]}, "tone_voice_tags": {"type": "array", "items": {"type": "string"}}, "brand_persona_tags": {"type": "array", "items": {"type": "string"}}, "domain_tags": {"type": "array", "items": {"type": "string"}}}, "required": ["chunk_summary_1s", "key_terms", "audience", "intent"]}'::jsonb,
    ARRAY['Chapter_Sequential', 'Instructional_Unit', 'CER', 'Example_Scenario'],
    'Basic content analysis applicable to all chunk types'
),
(
    'task_extraction_v1',
    'task_extraction',
    'Extract task/procedure information from the following instructional chunk.

CHUNK TEXT:
---
{chunk_text}
---

Extract and return the following in JSON format:
- task_name: Name of the primary task/procedure
- preconditions: Requirements before executing
- inputs: Required inputs/resources
- steps_json: Array of step objects with "step" and "details" keys
- expected_output: What success looks like
- warnings_failure_modes: Known pitfalls

Return ONLY valid JSON with these exact keys.',
    '{"type": "object", "properties": {"task_name": {"type": "string"}, "preconditions": {"type": "string"}, "inputs": {"type": "string"}, "steps_json": {"type": "array", "items": {"type": "object", "properties": {"step": {"type": "string"}, "details": {"type": "string"}}}}, "expected_output": {"type": "string"}, "warnings_failure_modes": {"type": "string"}}, "required": ["task_name", "expected_output"]}'::jsonb,
    ARRAY['Instructional_Unit'],
    'Extracts procedural/task information from instructional chunks'
),
(
    'cer_analysis_v1',
    'cer_analysis',
    'Analyze the following chunk for Claims, Evidence, and Reasoning.

CHUNK TEXT:
---
{chunk_text}
---

Extract and return the following in JSON format:
- claim: Main assertion stated
- evidence_snippets: Array of quoted/paraphrased evidence
- reasoning_sketch: High-level rationale (concise)
- citations: Array of sources/links/DOIs
- factual_confidence_0_1: Confidence score for factuality (0.0-1.0)

Return ONLY valid JSON with these exact keys.',
    '{"type": "object", "properties": {"claim": {"type": "string"}, "evidence_snippets": {"type": "array", "items": {"type": "string"}}, "reasoning_sketch": {"type": "string"}, "citations": {"type": "array", "items": {"type": "string"}}, "factual_confidence_0_1": {"type": "number", "minimum": 0, "maximum": 1}}, "required": ["claim", "reasoning_sketch"]}'::jsonb,
    ARRAY['CER'],
    'Extracts claim-evidence-reasoning structure from CER chunks'
),
(
    'scenario_extraction_v1',
    'scenario_extraction',
    'Extract scenario/example information from the following chunk.

CHUNK TEXT:
---
{chunk_text}
---

Extract and return the following in JSON format:
- scenario_type: Type (case_study|dialogue|Q&A|walkthrough|anecdote)
- problem_context: Real-world context
- solution_action: Action taken
- outcome_metrics: Measured results/KPIs
- style_notes: Narrative/style attributes to mimic

Return ONLY valid JSON with these exact keys.',
    '{"type": "object", "properties": {"scenario_type": {"type": "string", "enum": ["case_study", "dialogue", "Q&A", "walkthrough", "anecdote"]}, "problem_context": {"type": "string"}, "solution_action": {"type": "string"}, "outcome_metrics": {"type": "string"}, "style_notes": {"type": "string"}}, "required": ["scenario_type", "problem_context"]}'::jsonb,
    ARRAY['Example_Scenario'],
    'Extracts scenario/example structure from example chunks'
),
(
    'risk_assessment_v1',
    'risk_assessment',
    'Assess risk and compliance factors for the following chunk.

CHUNK TEXT:
---
{chunk_text}
---

Assess and return the following in JSON format:
- safety_tags: Array of sensitive-topic flags (if any)
- coverage_tag: Centrality to domain (core|supporting|edge)
- novelty_tag: Content uniqueness (novel|common|disputed)
- ip_sensitivity: Confidentiality level (Public|Internal|Confidential|Trade_Secret)
- pii_flag: Contains personal data (true|false)
- compliance_flags: Array of regulatory flags (if any)

Return ONLY valid JSON with these exact keys.',
    '{"type": "object", "properties": {"safety_tags": {"type": "array", "items": {"type": "string"}}, "coverage_tag": {"type": "string", "enum": ["core", "supporting", "edge"]}, "novelty_tag": {"type": "string", "enum": ["novel", "common", "disputed"]}, "ip_sensitivity": {"type": "string", "enum": ["Public", "Internal", "Confidential", "Trade_Secret"]}, "pii_flag": {"type": "boolean"}, "compliance_flags": {"type": "array", "items": {"type": "string"}}}, "required": ["coverage_tag", "novelty_tag", "ip_sensitivity", "pii_flag"]}'::jsonb,
    ARRAY['Chapter_Sequential', 'Instructional_Unit', 'CER', 'Example_Scenario'],
    'Assesses risk and compliance factors for all chunk types'
);

-- =====================================================
-- Add "Chunks" button capability to documents
-- Add new status tracking
-- =====================================================
ALTER TABLE documents ADD COLUMN IF NOT EXISTS chunk_extraction_status TEXT DEFAULT 'not_started' 
    CHECK (chunk_extraction_status IN ('not_started', 'ready', 'extracting', 'completed', 'failed'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS total_chunks_extracted INTEGER DEFAULT 0;

-- =====================================================
-- COMPLETED: Database schema setup
-- =====================================================