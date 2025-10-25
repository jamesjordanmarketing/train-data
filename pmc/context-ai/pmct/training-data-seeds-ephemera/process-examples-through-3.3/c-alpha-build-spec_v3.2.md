# Chunk Alpha Module - Build Specification v3.2
**Date:** October 5, 2025  
**Project:** Bright Run LoRA Training Data Platform  
**Module:** Chunk Dimension Testing Environment  
**AI Model:** Claude Sonnet 4.5 (200k context windows)

**Version 3.2 Updates:**
- 📸 Added visual reference screenshot from existing dashboard
- ✨ Enhanced Dashboard Wireframe Design Reference with actual UI screenshot
- 🎯 Added visual target reference in Build Prompt #4 for AI implementation

**Version 3.1 Updates:**
- ✨ Added Dashboard Wireframe Design Reference section
- ✨ Updated Build Prompt #4 with specific UI/UX patterns from existing dashboard
- ✨ Included detailed component structure and visual design guidelines

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Dashboard Wireframe Design Reference](#dashboard-wireframe-design-reference)
3. [Prerequisites & Human Setup](#prerequisites--human-setup)
4. [Build Prompt #1: Database Schema & Infrastructure](#build-prompt-1-database-schema--infrastructure)
5. [Build Prompt #2: Chunk Extraction Engine](#build-prompt-2-chunk-extraction-engine)
6. [Build Prompt #3: AI Dimension Generation](#build-prompt-3-ai-dimension-generation)
7. [Build Prompt #4: Chunk Dashboard & Spreadsheet Interface](#build-prompt-4-chunk-dashboard--spreadsheet-interface)
8. [Build Prompt #5: Run Management & Polish](#build-prompt-5-run-management--polish)
9. [Appendices](#appendices)

---

## EXECUTIVE SUMMARY

### Module Purpose
Transform the existing document categorization module into a comprehensive chunk dimension testing environment that:
- Extracts 4 types of chunks from categorized documents
- Generates 60+ dimensions per chunk using AI
- Displays all data in a spreadsheet-like interface
- Enables testing and refinement of AI prompts

### Build Strategy
Five sequential prompts, each completing a discrete module:
1. **Database & Infrastructure** (setup tables, API config)
2. **Chunk Extraction** (identify and extract 4 chunk types)
3. **AI Generation** (dimension generation with Claude 4.5)
4. **Spreadsheet UI** (data visualization and sorting)
5. **Run Management** (versioning, comparison, regeneration)

### Key Architectural Decisions
- **Integration:** Build into existing `chunks-alpha` codebase
- **Processing:** Batch processing with background jobs
- **AI Model:** Claude Sonnet 4.5 via structured JSON responses
- **Storage:** All data in Supabase with unlimited run history
- **UI:** Following existing dashboard wireframe design from `chunks-alpha-dashboard`

---

## DASHBOARD WIREFRAME DESIGN REFERENCE

### Overview

The UI design for this module **MUST follow the existing wireframe design** located at:
```
C:\Users\james\Master\BrightHub\BRun\chunks-alpha\chunks-alpha-dashboard\src
```

This is a **Vite React application** with established UI/UX patterns that must be replicated in the Next.js app.

### Visual Reference

**Dashboard Screenshot:**

![Chunk Dashboard Wireframe](https://p191.p3.n0.cdn.zight.com/items/7Kur9xl7/f61f84fd-2b70-407c-ac6a-cd8cbc85116f.png)

*Figure 1: Complete chunk dashboard showing the three-section card layout, color-coded confidence indicators, and analysis summary. This is the TARGET design that must be replicated in Next.js.*

**Key Visual Elements to Replicate:**
- Document header with metadata and progress indicator (top section)
- Individual chunk cards with type-based color coding (blue for Chapter, purple for Instructional, etc.)
- Three-section layout within each card:
  - **Chunk Metadata** (neutral/white background) - mechanical data like chars, tokens, page numbers
  - **Things We Know** (green background) - high-confidence AI findings with confidence percentages
  - **Things We Need to Know** (orange background) - low-confidence dimensions or knowledge gaps
- Color scheme consistency: neutral/white for metadata, green for high-confidence, orange for gaps
- Analysis summary stats with four-column colored layout at bottom
- Progressive disclosure: 3 items shown → "Detail View" button → full spreadsheet

### Key Design Patterns from DocumentChunksOverview.tsx

#### 1. Overall Layout Structure

```typescript
// Layout hierarchy
<div className="container mx-auto px-4 py-6 space-y-6">
  {/* Filename Display - centered at top */}
  <div className="text-center">
    <h1 className="font-bold">{document.filename}</h1>
  </div>
  
  {/* Document Header Card with metadata */}
  <Card>...</Card>
  
  {/* Document Overview Card with insights */}
  <Card>...</Card>
  
  {/* Auto-Generated Chunks section */}
  <div className="space-y-4">
    {/* Header with progress badge */}
    <div className="flex items-center justify-between">
      <h2>Auto-Generated Chunks</h2>
      <Badge>{analyzedChunks} / {totalChunks} Analyzed</Badge>
    </div>
    
    {/* Individual chunk cards */}
    {chunks.map(chunk => <Card key={chunk.id}>...</Card>)}
  </div>
  
  {/* Analysis Summary Card with stats */}
  <Card>...</Card>
</div>
```

#### 2. Individual Chunk Card Structure

**CRITICAL:** Each chunk card has a **three-section layout**:

```typescript
<Card className={`transition-all ${getCategoryColor(chunk.category)} ${chunk.isAnalyzed ? 'ring-1 ring-green-200' : ''}`}>
  <CardHeader>
    {/* Icon + Title + Badges + Chunk Number */}
  </CardHeader>
  
  <CardContent className="pt-0">
    {/* SECTION 1: Chunk Metadata (neutral background) */}
    <div className="mb-4 p-3 bg-white/30 rounded border">
      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Hash className="h-3 w-3" />
        Chunk Metadata
      </h5>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Lines, Words, Page, Read Time */}
      </div>
    </div>

    {/* SECTION 2: Things We Know (green background) */}
    <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
      <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-800">
        <CheckCircle className="h-3 w-3" />
        Things We Know ({chunk.aiFindings.thingsWeKnow.length})
      </h5>
      {chunk.aiFindings.thingsWeKnow.map(finding => (
        <div key={finding.id} className="text-xs">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{finding.category}</Badge>
            <span className="text-green-600 font-medium">{finding.confidence}% confidence</span>
          </div>
          <p className="text-green-800">{finding.finding}</p>
        </div>
      ))}
      
      {/* Semantic Tags */}
      <div className="mt-3 pt-2 border-t border-green-300">
        <div className="text-xs text-green-700 mb-1">Semantic Tags:</div>
        <div className="flex flex-wrap gap-1">
          {chunk.aiFindings.semanticTags.map((tag, index) => (
            <Badge key={index} className="text-xs bg-green-100 text-green-700">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>

    {/* SECTION 3: Things We Need to Know (orange background) */}
    <div className="p-3 bg-orange-50 rounded border border-orange-200">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-medium flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-3 w-3" />
          Things We Need to Know ({chunk.aiFindings.thingsWeNeedToKnow.length})
        </h5>
        <Button variant="outline" size="sm" className="text-xs h-6 px-2 border-orange-300 text-orange-700 hover:bg-orange-100">
          <ExternalLink className="h-3 w-3 mr-1" />
          Detail View
        </Button>
      </div>
      <ul className="space-y-1">
        {chunk.aiFindings.thingsWeNeedToKnow.map((gap, index) => (
          <li key={index} className="text-xs text-orange-800 flex items-start gap-2">
            <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
            {gap}
          </li>
        ))}
      </ul>
    </div>
  </CardContent>
</Card>
```

#### 3. Color Coding System

**Chunk Type Colors** (border and background):
```typescript
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Chapter_Sequential': return 'border-blue-200 bg-blue-50';
    case 'Instructional_Unit': return 'border-purple-200 bg-purple-50';
    case 'CER': return 'border-orange-200 bg-orange-50';
    case 'Example_Scenario': return 'border-yellow-200 bg-yellow-50';
    default: return 'border-gray-200 bg-gray-50';
  }
};
```

**Confidence/Complexity Badges**:
```typescript
const getComplexityColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-orange-600 bg-orange-100';
    case 'high': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};
```

#### 4. "Things We Know" Data Structure

```typescript
interface AIFinding {
  id: string;
  category: 'requirement' | 'process' | 'guideline' | 'standard' | 'definition' | 'example';
  finding: string;  // The actual finding text
  confidence: number; // 0-100
  evidence: string[];
}

// Display pattern: Show top 3 highest confidence findings
const topFindings = chunk.aiFindings.thingsWeKnow
  .sort((a, b) => b.confidence - a.confidence)
  .slice(0, 3);
```

#### 5. "Things We Need to Know" Pattern

```typescript
// Simple array of string questions
thingsWeNeedToKnow: string[]

// Display pattern: Show top 3 lowest confidence dimensions
// These are dimensions that AI couldn't confidently generate
```

#### 6. Analysis Summary (Bottom Stats)

```typescript
<Card>
  <CardHeader>
    <CardTitle>Analysis Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded">
        <div className="text-2xl font-medium text-blue-600">{totalChunks}</div>
        <div className="text-sm text-blue-800">Total Chunks</div>
      </div>
      <div className="text-center p-4 bg-green-50 rounded">
        <div className="text-2xl font-medium text-green-600">{analyzedChunks}</div>
        <div className="text-sm text-green-800">Analyzed</div>
      </div>
      <div className="text-center p-4 bg-orange-50 rounded">
        <div className="text-2xl font-medium text-orange-600">{totalFindings}</div>
        <div className="text-sm text-orange-800">AI Findings</div>
      </div>
      <div className="text-center p-4 bg-purple-50 rounded">
        <div className="text-2xl font-medium text-purple-600">{knowledgeGaps}</div>
        <div className="text-sm text-purple-800">Knowledge Gaps</div>
      </div>
    </div>
  </CardContent>
</Card>
```

#### 7. Icons Used

Import from `lucide-react`:
```typescript
import { 
  FileText,      // Document icon
  CheckCircle,   // Success/analyzed icon
  Clock,         // Time/duration
  ArrowRight,    // List bullets
  Eye,           // View/visibility
  Brain,         // AI/intelligence
  AlertCircle,   // Warnings/gaps
  Hash,          // Metadata
  Type,          // Text/content
  BookOpen,      // Instructions
  ExternalLink   // Detail view link
} from 'lucide-react';
```

### Design Principles to Follow

1. **Color-Coded Confidence**:
   - Green = High confidence (Things We Know)
   - Orange = Low confidence (Things We Need to Know)
   - Gray/White = Neutral metadata

2. **Progressive Disclosure**:
   - Overview shows 3 top items in each section
   - "Detail View" button expands to full spreadsheet

3. **Visual Hierarchy**:
   - Chunk metadata (functional data) at top
   - Positive findings (what AI knows) in middle
   - Knowledge gaps (what's missing) at bottom

4. **Consistency**:
   - Use shadcn/ui components consistently
   - Follow color system throughout
   - Use same icon set (lucide-react)

5. **Density vs. Readability**:
   - Compact text (text-xs, text-sm)
   - Generous padding (p-3, p-4)
   - Clear visual separation between sections

### Components to Reuse

From existing codebase:
- `src/components/ui/card.tsx` - Card, CardHeader, CardTitle, CardContent
- `src/components/ui/badge.tsx` - Badge component
- `src/components/ui/button.tsx` - Button component
- `src/components/ui/progress.tsx` - Progress bar
- All other shadcn/ui components

### Adaptation Notes

**From Vite to Next.js:**
- Vite app uses Zustand for state management → Adapt to Next.js server/client pattern
- Mock data structure provides perfect template → Use actual database data
- Component structure is reusable → Copy patterns, not implementation
- Visual design is the target → Match exactly

---

## PREREQUISITES & HUMAN SETUP

### Step 1: Supabase Database Setup

**ACTION REQUIRED:** Copy and run the following SQL in your Supabase SQL Editor:

```sql
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
    
    -- Indexes
    CONSTRAINT idx_chunk_dims_chunk FOREIGN KEY (chunk_id) REFERENCES chunks(id),
    CREATE INDEX IF NOT EXISTS idx_chunk_dims_run ON chunk_dimensions(run_id),
    CREATE INDEX IF NOT EXISTS idx_chunk_dims_chunk_id ON chunk_dimensions(chunk_id)
);

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
```

**VERIFICATION:** After running the SQL, verify all tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chunks', 'chunk_dimensions', 'chunk_runs', 'prompt_templates', 'chunk_extraction_jobs')
ORDER BY table_name;
```

You should see all 5 tables listed.

---

### Step 2: API Configuration

**ACTION REQUIRED:** Add Claude Sonnet 4.5 API credentials to your project.

1. Open: `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\.env.local`
2. Add these lines (replace with your actual key):

```env
# Claude Sonnet 4.5 API Configuration
ANTHROPIC_API_KEY=your-actual-api-key-here
ANTHROPIC_API_BASE_URL=https://api.anthropic.com/v1
ANTHROPIC_MODEL=claude-sonnet-4.5-20241022
```

3. Create a server-side API config file at: `src/lib/ai-config.ts`

```typescript
// Server-side only - never expose to client
export const AI_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  baseUrl: process.env.ANTHROPIC_API_BASE_URL || 'https://api.anthropic.com/v1',
  model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4.5-20241022',
  maxTokens: 4096,
  temperature: 0.7,
};

// Validate configuration on import
if (!AI_CONFIG.apiKey && process.env.NODE_ENV !== 'development') {
  console.warn('⚠️  ANTHROPIC_API_KEY not configured');
}
```

**VERIFICATION:** Restart your development server to load new environment variables.

---

### Step 3: Install Required Dependencies

**ACTION REQUIRED:** Run in your terminal:

```bash
cd C:\Users\james\Master\BrightHub\BRun\chunks-alpha
npm install @anthropic-ai/sdk
npm install tiktoken  # For token counting
npm install zustand immer  # State management (if not already installed)
```

---

## BUILD PROMPT #1: DATABASE SCHEMA & INFRASTRUCTURE

**CONTEXT FOR AI:** You are building the foundation for a chunk dimension testing environment that extends an existing document categorization module. The database schema has been set up by the human, and your job is to create the TypeScript services and types to interact with this schema.

**YOUR TASK:**

### Part A: Create Type Definitions

Create `src/types/chunks.ts` with complete TypeScript types for all chunk-related entities:

```typescript
// Core chunk types
export type ChunkType = 'Chapter_Sequential' | 'Instructional_Unit' | 'CER' | 'Example_Scenario';

export type Chunk = {
  id: string;
  chunk_id: string;  // Format: DOC_ID#C001
  document_id: string;
  chunk_type: ChunkType;
  section_heading: string | null;
  page_start: number | null;
  page_end: number | null;
  char_start: number;
  char_end: number;
  token_count: number;
  overlap_tokens: number;
  chunk_handle: string | null;
  chunk_text: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type ChunkDimensions = {
  id: string;
  chunk_id: string;
  run_id: string;
  
  // Previously generated
  doc_id: string | null;
  doc_title: string | null;
  doc_version: string | null;
  source_type: string | null;
  source_url: string | null;
  author: string | null;
  doc_date: string | null;
  primary_category: string | null;
  
  // Content dimensions
  chunk_summary_1s: string | null;
  key_terms: string[] | null;
  audience: string | null;
  intent: string | null;
  tone_voice_tags: string[] | null;
  brand_persona_tags: string[] | null;
  domain_tags: string[] | null;
  
  // Task dimensions
  task_name: string | null;
  preconditions: string | null;
  inputs: string | null;
  steps_json: any | null;
  expected_output: string | null;
  warnings_failure_modes: string | null;
  
  // CER dimensions
  claim: string | null;
  evidence_snippets: string[] | null;
  reasoning_sketch: string | null;
  citations: string[] | null;
  factual_confidence_0_1: number | null;
  
  // Scenario dimensions
  scenario_type: string | null;
  problem_context: string | null;
  solution_action: string | null;
  outcome_metrics: string | null;
  style_notes: string | null;
  
  // Training dimensions
  prompt_candidate: string | null;
  target_answer: string | null;
  style_directives: string | null;
  
  // Risk dimensions
  safety_tags: string[] | null;
  coverage_tag: string | null;
  novelty_tag: string | null;
  ip_sensitivity: string | null;
  pii_flag: boolean;
  compliance_flags: string[] | null;
  
  // Training metadata
  embedding_id: string | null;
  vector_checksum: string | null;
  label_source_auto_manual_mixed: string | null;
  label_model: string | null;
  labeled_by: string | null;
  label_timestamp_iso: string | null;
  review_status: string;
  include_in_training_yn: boolean;
  data_split_train_dev_test: string | null;
  augmentation_notes: string | null;
  
  // Meta-dimensions
  generation_confidence_precision: number | null;
  generation_confidence_accuracy: number | null;
  generation_cost_usd: number | null;
  generation_duration_ms: number | null;
  prompt_template_id: string | null;
  
  generated_at: string;
};

export type ChunkRun = {
  id: string;
  run_id: string;
  document_id: string;
  run_name: string;
  total_chunks: number | null;
  total_dimensions: number | null;
  total_cost_usd: number | null;
  total_duration_ms: number | null;
  ai_model: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  created_by: string | null;
};

export type PromptTemplate = {
  id: string;
  template_name: string;
  template_type: string;
  prompt_text: string;
  response_schema: any;
  applicable_chunk_types: ChunkType[];
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

export type ChunkExtractionJob = {
  id: string;
  document_id: string;
  status: 'pending' | 'extracting' | 'generating_dimensions' | 'completed' | 'failed';
  progress_percentage: number;
  current_step: string | null;
  total_chunks_extracted: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
};
```

### Part B: Create Database Services

Create `src/lib/chunk-service.ts` with comprehensive CRUD operations:

```typescript
import { supabase } from './supabase';
import { Chunk, ChunkDimensions, ChunkRun, PromptTemplate, ChunkExtractionJob, ChunkType } from '../types/chunks';

export const chunkService = {
  // Create a new chunk
  async createChunk(chunk: Omit<Chunk, 'id' | 'created_at' | 'updated_at'>): Promise<Chunk> {
    const { data, error } = await supabase
      .from('chunks')
      .insert(chunk)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all chunks for a document
  async getChunksByDocument(documentId: string): Promise<Chunk[]> {
    const { data, error } = await supabase
      .from('chunks')
      .select('*')
      .eq('document_id', documentId)
      .order('char_start', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get single chunk by ID
  async getChunkById(chunkId: string): Promise<Chunk | null> {
    const { data, error } = await supabase
      .from('chunks')
      .select('*')
      .eq('id', chunkId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Delete all chunks for a document (for regeneration)
  async deleteChunksByDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('chunks')
      .delete()
      .eq('document_id', documentId);
    
    if (error) throw error;
  }
};

export const chunkDimensionService = {
  // Create dimension record
  async createDimensions(dimensions: Omit<ChunkDimensions, 'id' | 'generated_at'>): Promise<ChunkDimensions> {
    const { data, error } = await supabase
      .from('chunk_dimensions')
      .insert(dimensions)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get dimensions for a specific chunk and run
  async getDimensionsByChunkAndRun(chunkId: string, runId: string): Promise<ChunkDimensions | null> {
    const { data, error } = await supabase
      .from('chunk_dimensions')
      .select('*')
      .eq('chunk_id', chunkId)
      .eq('run_id', runId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get all dimensions for a run
  async getDimensionsByRun(runId: string): Promise<ChunkDimensions[]> {
    const { data, error } = await supabase
      .from('chunk_dimensions')
      .select('*')
      .eq('run_id', runId)
      .order('generated_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};

export const chunkRunService = {
  // Create a new run
  async createRun(run: Omit<ChunkRun, 'id' | 'run_id' | 'started_at'>): Promise<ChunkRun> {
    const { data, error } = await supabase
      .from('chunk_runs')
      .insert({
        ...run,
        run_id: crypto.randomUUID()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all runs for a document
  async getRunsByDocument(documentId: string): Promise<ChunkRun[]> {
    const { data, error } = await supabase
      .from('chunk_runs')
      .select('*')
      .eq('document_id', documentId)
      .order('started_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Update run status and metrics
  async updateRun(runId: string, updates: Partial<ChunkRun>): Promise<ChunkRun> {
    const { data, error } = await supabase
      .from('chunk_runs')
      .update(updates)
      .eq('run_id', runId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const promptTemplateService = {
  // Get active templates for a chunk type
  async getActiveTemplates(chunkType?: ChunkType): Promise<PromptTemplate[]> {
    let query = supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_active', true);
    
    if (chunkType) {
      query = query.contains('applicable_chunk_types', [chunkType]);
    }
    
    const { data, error } = await query.order('template_type');
    
    if (error) throw error;
    return data || [];
  },

  // Get template by name
  async getTemplateByName(templateName: string): Promise<PromptTemplate | null> {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('template_name', templateName)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

export const chunkExtractionJobService = {
  // Create extraction job
  async createJob(documentId: string, userId: string): Promise<ChunkExtractionJob> {
    const { data, error } = await supabase
      .from('chunk_extraction_jobs')
      .insert({
        document_id: documentId,
        created_by: userId,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update job status
  async updateJob(jobId: string, updates: Partial<ChunkExtractionJob>): Promise<ChunkExtractionJob> {
    const { data, error } = await supabase
      .from('chunk_extraction_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get job by document
  async getJobByDocument(documentId: string): Promise<ChunkExtractionJob | null> {
    const { data, error } = await supabase
      .from('chunk_extraction_jobs')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};
```

### Part C: Update Database Service

Add chunk-related services to `src/lib/database.ts`:

```typescript
// Add these exports at the end of the file
export { chunkService, chunkDimensionService, chunkRunService, promptTemplateService, chunkExtractionJobService } from './chunk-service';
```

### Part D: Update Document Dashboard

Modify `src/components/server/DocumentSelectorServer.tsx` to show "Chunks" button:

1. Import the chunk service
2. For each document, check if categorization is complete
3. If complete, show "Chunks" button
4. Button links to `/chunks/[documentId]`

**KEY REQUIREMENTS:**
- Button only appears after categorization workflow is completed
- Button shows loading state while checking chunk status
- Button displays "Start Chunking" if no chunks exist, "View Chunks" if chunks exist

### Part E: Verification

Create a simple test page at `src/app/test-chunks/page.tsx` that:
1. Connects to database
2. Queries prompt_templates table
3. Displays count of templates
4. Confirms services are working

**COMPLETION CRITERIA:**
✅ All TypeScript types defined  
✅ All database services created  
✅ Services successfully query Supabase  
✅ "Chunks" button appears on dashboard  
✅ Test page confirms database connectivity  

---

## BUILD PROMPT #2: CHUNK EXTRACTION ENGINE

**CONTEXT FOR AI:** You have completed the database foundation. Now build the chunk extraction engine that analyzes document content and extracts 4 types of chunks with proper boundaries and metadata.

**YOUR TASK:**

### Part A: Create Chunk Extraction Utilities

Create `src/lib/chunk-extraction/` directory with these files:

#### File: `src/lib/chunk-extraction/types.ts`

Define extraction types:

```typescript
export type ExtractionCandidate = {
  type: 'Chapter_Sequential' | 'Instructional_Unit' | 'CER' | 'Example_Scenario';
  confidence: number;  // 0-1
  startIndex: number;
  endIndex: number;
  sectionHeading?: string;
  reasoning: string;  // Why this was identified as this chunk type
};

export type DocumentStructure = {
  totalChars: number;
  totalTokens: number;
  pageCount?: number;
  sections: Section[];
};

export type Section = {
  heading: string;
  level: number;  // 1=H1, 2=H2, etc.
  startIndex: number;
  endIndex: number;
  pageStart?: number;
  pageEnd?: number;
};
```

#### File: `src/lib/chunk-extraction/text-analyzer.ts`

Create text analysis utilities:

```typescript
import { encoding_for_model } from 'tiktoken';

export class TextAnalyzer {
  private tokenizer: any;

  constructor() {
    // Initialize tiktoken for Claude
    this.tokenizer = encoding_for_model('gpt-4'); // Close enough for token counting
  }

  /**
   * Count tokens in text
   */
  countTokens(text: string): number {
    const tokens = this.tokenizer.encode(text);
    return tokens.length;
  }

  /**
   * Detect document structure (headings, sections)
   */
  detectStructure(content: string): DocumentStructure {
    const sections: Section[] = [];
    
    // Regex patterns for common heading formats
    const patterns = [
      /^(Chapter|CHAPTER)\s+(\d+|[IVXLCDM]+)[\s:\-]+(.*?)$/gm,  // Chapter X: Title
      /^(Section|SECTION)\s+(\d+|[IVXLCDM]+)[\s:\-]+(.*?)$/gm,   // Section X: Title
      /^#{1,6}\s+(.+)$/gm,  // Markdown headings
      /^(.+)\n[=\-]{3,}$/gm,  // Underlined headings
      /^(\d+\.)\s+(.+)$/gm,  // 1. Numbered headings
    ];

    // Detect sections using patterns
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        sections.push({
          heading: match[0].trim(),
          level: this.detectHeadingLevel(match[0]),
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    });

    // Sort by position
    sections.sort((a, b) => a.startIndex - b.startIndex);

    // Calculate section boundaries
    sections.forEach((section, index) => {
      if (index < sections.length - 1) {
        section.endIndex = sections[index + 1].startIndex;
      } else {
        section.endIndex = content.length;
      }
    });

    return {
      totalChars: content.length,
      totalTokens: this.countTokens(content),
      sections,
    };
  }

  private detectHeadingLevel(heading: string): number {
    if (heading.startsWith('# ')) return 1;
    if (heading.startsWith('## ')) return 2;
    if (heading.startsWith('### ')) return 3;
    if (heading.match(/^(Chapter|CHAPTER)/)) return 1;
    if (heading.match(/^(Section|SECTION)/)) return 2;
    return 3;
  }

  /**
   * Detect instructional content patterns
   */
  detectInstructionalPatterns(text: string): boolean {
    const patterns = [
      /\b(how to|procedure|steps?|instructions?|guide|tutorial)\b/i,
      /^\s*\d+\.\s+/m,  // Numbered lists
      /^\s*[-*]\s+/m,   // Bulleted lists
      /\b(first|second|third|next|then|finally)\b/i,
    ];

    return patterns.some(pattern => pattern.test(text));
  }

  /**
   * Detect CER (Claim-Evidence-Reasoning) patterns
   */
  detectCERPatterns(text: string): boolean {
    const patterns = [
      /\b(claim|assert|argue|demonstrate|prove)\b/i,
      /\b(evidence|data|research|study|findings|results)\b/i,
      /\b(because|therefore|thus|hence|consequently)\b/i,
      /\b(shows that|indicates that|suggests that)\b/i,
      /\[\d+\]|\(\d{4}\)/,  // Citations [1] or (2024)
    ];

    return patterns.filter(pattern => pattern.test(text)).length >= 2;
  }

  /**
   * Detect example/scenario patterns
   */
  detectExamplePatterns(text: string): boolean {
    const patterns = [
      /\b(for example|for instance|case study|scenario)\b/i,
      /\b(imagine|consider|suppose)\b/i,
      /\b(customer|client|user) (said|asked|wanted)\b/i,
      /[""](.+?)[""].*said/i,  // Quoted dialogue
    ];

    return patterns.some(pattern => pattern.test(text));
  }
}
```

#### File: `src/lib/chunk-extraction/ai-chunker.ts`

Create AI-powered chunk identification:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { AI_CONFIG } from '../ai-config';
import { ExtractionCandidate, DocumentStructure } from './types';
import { TextAnalyzer } from './text-analyzer';

export class AIChunker {
  private client: Anthropic;
  private analyzer: TextAnalyzer;

  constructor() {
    this.client = new Anthropic({
      apiKey: AI_CONFIG.apiKey,
    });
    this.analyzer = new TextAnalyzer();
  }

  /**
   * Extract chunks from document using AI
   */
  async extractChunks(params: {
    documentId: string;
    documentTitle: string;
    documentContent: string;
    primaryCategory: string;
  }): Promise<ExtractionCandidate[]> {
    const { documentTitle, documentContent, primaryCategory } = params;

    // First, detect document structure
    const structure = this.analyzer.detectStructure(documentContent);

    // Call AI to identify chunk candidates
    const prompt = this.buildExtractionPrompt(documentTitle, documentContent, primaryCategory, structure);

    const message = await this.client.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: 0.3,  // Lower temperature for more consistent extraction
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    // Parse AI response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const candidates = this.parseExtractionResponse(responseText, documentContent);

    // Apply extraction limits
    const filtered = this.applyExtractionLimits(candidates);

    return filtered;
  }

  private buildExtractionPrompt(
    title: string,
    content: string,
    category: string,
    structure: DocumentStructure
  ): string {
    return `You are a document analysis expert. Your task is to identify and extract distinct chunks from a document for LoRA training data creation.

DOCUMENT TITLE: ${title}
DOCUMENT CATEGORY: ${category}
DOCUMENT LENGTH: ${structure.totalChars} characters, ${structure.totalTokens} tokens
SECTIONS DETECTED: ${structure.sections.length}

CHUNK TYPES TO IDENTIFY:

1. **Chapter_Sequential**: Top-level structural sections (chapters, major sections)
   - Look for: "Chapter X", "Section X", major headings
   - Maximum to extract: 15 most significant chapters

2. **Instructional_Unit**: Step-by-step procedures or tasks
   - Look for: numbered steps, how-to content, procedures, checklists
   - Maximum to extract: 5 most valuable instructional units

3. **CER** (Claim-Evidence-Reasoning): Arguments with supporting evidence
   - Look for: claims with citations, research findings, data-backed assertions
   - Maximum to extract: 10 most important claims

4. **Example_Scenario**: Case studies, examples, stories, dialogues
   - Look for: "for example", case studies, customer stories, scenarios
   - Maximum to extract: 5 most illustrative examples

DOCUMENT CONTENT:
---
${content.substring(0, 50000)}  // Limit to first 50k chars to stay within context
${content.length > 50000 ? '\n... (document truncated)' : ''}
---

TASK: Analyze this document and identify ALL candidate chunks. For each chunk, return:

1. chunk_type: The type (Chapter_Sequential, Instructional_Unit, CER, or Example_Scenario)
2. confidence: Your confidence score (0.0-1.0)
3. start_text: First 50 characters where chunk begins
4. end_text: Last 50 characters where chunk ends
5. section_heading: Heading/title of this chunk (if any)
6. reasoning: Brief explanation of why this qualifies as this chunk type

Return your analysis as a JSON array. Be thorough - identify MORE candidates than the limits; we'll rank and select the best ones.

Example format:
[
  {
    "chunk_type": "Instructional_Unit",
    "confidence": 0.95,
    "start_text": "Step 1: Open the categorization module...",
    "end_text": "...and click Submit to complete the process.",
    "section_heading": "Document Categorization Workflow",
    "reasoning": "Clear numbered steps with procedural instructions"
  }
]

Return ONLY valid JSON, no other text.`;
  }

  private parseExtractionResponse(response: string, fullContent: string): ExtractionCandidate[] {
    try {
      // Extract JSON from response (in case AI added extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Map to ExtractionCandidate with actual character positions
      return parsed.map((item: any) => {
        const startIndex = fullContent.indexOf(item.start_text);
        const endIndex = fullContent.lastIndexOf(item.end_text) + item.end_text.length;

        return {
          type: item.chunk_type,
          confidence: item.confidence,
          startIndex: startIndex >= 0 ? startIndex : 0,
          endIndex: endIndex > startIndex ? endIndex : startIndex + 1000,
          sectionHeading: item.section_heading,
          reasoning: item.reasoning,
        };
      });
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
      return [];
    }
  }

  private applyExtractionLimits(candidates: ExtractionCandidate[]): ExtractionCandidate[] {
    const limits = {
      'Chapter_Sequential': 15,
      'Instructional_Unit': 5,
      'CER': 10,
      'Example_Scenario': 5,
    };

    const filtered: ExtractionCandidate[] = [];

    Object.entries(limits).forEach(([type, limit]) => {
      const ofType = candidates
        .filter(c => c.type === type)
        .sort((a, b) => b.confidence - a.confidence)  // Sort by confidence descending
        .slice(0, limit);
      
      filtered.push(...ofType);
    });

    // Sort by position in document
    return filtered.sort((a, b) => a.startIndex - b.startIndex);
  }
}
```

#### File: `src/lib/chunk-extraction/extractor.ts`

Main extraction orchestrator:

```typescript
import { supabase } from '../supabase';
import { AIChunker } from './ai-chunker';
import { TextAnalyzer } from './text-analyzer';
import { chunkService, chunkExtractionJobService, documentService } from '../database';
import { Chunk, ChunkType } from '../../types/chunks';

export class ChunkExtractor {
  private aiChunker: AIChunker;
  private analyzer: TextAnalyzer;

  constructor() {
    this.aiChunker = new AIChunker();
    this.analyzer = new TextAnalyzer();
  }

  /**
   * Main extraction method - orchestrates the entire process
   */
  async extractChunksForDocument(documentId: string, userId: string): Promise<Chunk[]> {
    // Create extraction job
    const job = await chunkExtractionJobService.createJob(documentId, userId);

    try {
      // Update job status
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'extracting',
        started_at: new Date().toISOString(),
        current_step: 'Loading document',
        progress_percentage: 10,
      });

      // Get document with category data
      const document = await documentService.getById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Get document category
      const { data: categoryData } = await supabase
        .from('document_categories')
        .select(`
          *,
          categories (*)
        `)
        .eq('document_id', documentId)
        .eq('is_primary', true)
        .single();

      const primaryCategory = categoryData?.categories?.name || 'Unknown';

      // Update progress
      await chunkExtractionJobService.updateJob(job.id, {
        current_step: 'Analyzing document structure',
        progress_percentage: 30,
      });

      // Delete existing chunks (if regenerating)
      await chunkService.deleteChunksByDocument(documentId);

      // Extract chunk candidates using AI
      await chunkExtractionJobService.updateJob(job.id, {
        current_step: 'Identifying chunks with AI',
        progress_percentage: 50,
      });

      const candidates = await this.aiChunker.extractChunks({
        documentId,
        documentTitle: document.title,
        documentContent: document.content || '',
        primaryCategory,
      });

      // Create chunk records
      await chunkExtractionJobService.updateJob(job.id, {
        current_step: 'Creating chunk records',
        progress_percentage: 70,
      });

      const chunks: Chunk[] = [];
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        
        const chunk = await chunkService.createChunk({
          chunk_id: `${documentId}#C${String(i + 1).padStart(3, '0')}`,
          document_id: documentId,
          chunk_type: candidate.type,
          section_heading: candidate.sectionHeading || null,
          page_start: null,  // TODO: Calculate if we have page info
          page_end: null,
          char_start: candidate.startIndex,
          char_end: candidate.endIndex,
          token_count: this.analyzer.countTokens(document.content!.substring(candidate.startIndex, candidate.endIndex)),
          overlap_tokens: 0,  // TODO: Calculate overlap if needed
          chunk_handle: this.generateHandle(candidate.sectionHeading || `chunk-${i + 1}`),
          chunk_text: document.content!.substring(candidate.startIndex, candidate.endIndex),
          created_by: userId,
        });

        chunks.push(chunk);
      }

      // Update document status
      await supabase
        .from('documents')
        .update({
          chunk_extraction_status: 'completed',
          total_chunks_extracted: chunks.length,
        })
        .eq('id', documentId);

      // Complete job
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'completed',
        progress_percentage: 100,
        total_chunks_extracted: chunks.length,
        completed_at: new Date().toISOString(),
        current_step: 'Extraction complete',
      });

      return chunks;

    } catch (error: any) {
      // Mark job as failed
      await chunkExtractionJobService.updateJob(job.id, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString(),
      });
      throw error;
    }
  }

  private generateHandle(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
}
```

### Part B: Create API Endpoint

Create `src/app/api/chunks/extract/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ChunkExtractor } from '../../../../lib/chunk-extraction/extractor';
import { userService } from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await userService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Start extraction (runs in background)
    const extractor = new ChunkExtractor();
    const chunks = await extractor.extractChunksForDocument(documentId, user.id);

    return NextResponse.json({
      success: true,
      chunksExtracted: chunks.length,
      chunks,
    });

  } catch (error: any) {
    console.error('Chunk extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Extraction failed' },
      { status: 500 }
    );
  }
}
```

### Part C: Update Dashboard Button

Modify `src/components/server/DocumentSelectorServer.tsx`:

Add "Chunks" button that:
1. Checks if categorization is complete
2. Shows "Start Chunking" or "View Chunks" based on status
3. Triggers `/api/chunks/extract` when clicked
4. Navigates to `/chunks/[documentId]` after extraction

### Part D: Create Loading/Status Page

Create `src/app/chunks/[documentId]/page.tsx`:

Simple loading page that shows extraction status and redirects when complete.

**COMPLETION CRITERIA:**
✅ AI-powered chunk extraction working  
✅ 4 chunk types properly identified  
✅ Extraction limits enforced (15/5/10/5)  
✅ Chunks stored in database  
✅ "Chunks" button functional  
✅ Progress tracking visible to user  

---

## BUILD PROMPT #3: AI DIMENSION GENERATION

**CONTEXT FOR AI:** Chunks have been extracted. Now generate the 60+ dimensions for each chunk using Claude Sonnet 4.5 and prompt templates.

**YOUR TASK:**

### Part A: Create Dimension Generator

Create `src/lib/dimension-generation/generator.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { AI_CONFIG } from '../ai-config';
import { 
  chunkService, 
  chunkDimensionService, 
  chunkRunService, 
  promptTemplateService,
  documentCategoryService 
} from '../database';
import { ChunkDimensions, Chunk, PromptTemplate } from '../../types/chunks';

export class DimensionGenerator {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: AI_CONFIG.apiKey,
    });
  }

  /**
   * Generate all dimensions for all chunks in a document
   */
  async generateDimensionsForDocument(params: {
    documentId: string;
    userId: string;
  }): Promise<string> {  // Returns run_id
    const { documentId, userId } = params;

    // Create run
    const run = await chunkRunService.createRun({
      document_id: documentId,
      run_name: `Dimension Generation - ${new Date().toISOString()}`,
      total_chunks: 0,
      total_dimensions: 0,
      total_cost_usd: 0,
      total_duration_ms: 0,
      ai_model: AI_CONFIG.model,
      status: 'running',
      created_by: userId,
    });

    const startTime = Date.now();
    let totalCost = 0;

    try {
      // Get all chunks
      const chunks = await chunkService.getChunksByDocument(documentId);
      
      // Update run with chunk count
      await chunkRunService.updateRun(run.run_id, {
        total_chunks: chunks.length,
      });

      // Get document metadata for inheritance
      const docCategory = await documentCategoryService.getDocumentCategory(documentId);

      // Process chunks in batches of 3 for efficiency
      const batchSize = 3;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        
        // Process batch in parallel
        await Promise.all(
          batch.map(chunk => 
            this.generateDimensionsForChunk({
              chunk,
              runId: run.run_id,
              documentCategory: docCategory?.categories?.name || 'Unknown',
            }).then(cost => {
              totalCost += cost;
            })
          )
        );
      }

      // Complete run
      const duration = Date.now() - startTime;
      await chunkRunService.updateRun(run.run_id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_cost_usd: totalCost,
        total_duration_ms: duration,
        total_dimensions: chunks.length * 60,  // Approximate
      });

      return run.run_id;

    } catch (error: any) {
      // Mark run as failed
      await chunkRunService.updateRun(run.run_id, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Generate dimensions for a single chunk
   */
  private async generateDimensionsForChunk(params: {
    chunk: Chunk;
    runId: string;
    documentCategory: string;
  }): Promise<number> {  // Returns cost
    const { chunk, runId, documentCategory } = params;

    const startTime = Date.now();
    let totalCost = 0;

    // Initialize dimension record with mechanical data
    const dimensions: Partial<ChunkDimensions> = {
      chunk_id: chunk.id,
      run_id: runId,
      
      // Inherited from document/chunk
      doc_id: chunk.document_id,
      doc_title: null,  // TODO: Get from document
      primary_category: documentCategory,
      
      // Initialize defaults
      pii_flag: false,
      review_status: 'unreviewed',
      include_in_training_yn: true,
      
      // Meta-dimensions
      generation_confidence_precision: null,
      generation_confidence_accuracy: null,
      generation_cost_usd: null,
      generation_duration_ms: null,
    };

    // Get applicable prompt templates
    const templates = await promptTemplateService.getActiveTemplates(chunk.chunk_type);

    // Execute prompts sequentially to build up dimensions
    for (const template of templates) {
      const result = await this.executePromptTemplate({
        template,
        chunk,
        documentCategory,
      });

      // Merge results into dimensions
      Object.assign(dimensions, result.dimensions);
      totalCost += result.cost;
    }

    // Calculate final meta-dimensions
    dimensions.generation_cost_usd = totalCost;
    dimensions.generation_duration_ms = Date.now() - startTime;

    // Save to database
    await chunkDimensionService.createDimensions(dimensions as Omit<ChunkDimensions, 'id' | 'generated_at'>);

    return totalCost;
  }

  /**
   * Execute a single prompt template
   */
  private async executePromptTemplate(params: {
    template: PromptTemplate;
    chunk: Chunk;
    documentCategory: string;
  }): Promise<{ dimensions: Partial<ChunkDimensions>; cost: number }> {
    const { template, chunk, documentCategory } = params;

    // Build prompt by replacing placeholders
    const prompt = template.prompt_text
      .replace('{chunk_type}', chunk.chunk_type)
      .replace('{doc_title}', 'Document')  // TODO: Get actual title
      .replace('{primary_category}', documentCategory)
      .replace('{chunk_text}', chunk.chunk_text);

    // Call Claude API
    const message = await this.client.messages.create({
      model: AI_CONFIG.model,
      max_tokens: 2048,
      temperature: 0.5,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    // Extract response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
    
    // Parse JSON response
    let dimensions: Partial<ChunkDimensions> = {};
    try {
      const parsed = JSON.parse(responseText);
      
      // Map response to dimension fields based on template type
      dimensions = this.mapResponseToDimensions(parsed, template.template_type);
      
    } catch (error) {
      console.error(`Failed to parse response for template ${template.template_name}:`, error);
    }

    // Calculate cost (approximate)
    const inputTokens = Math.ceil(prompt.length / 4);  // Rough estimate
    const outputTokens = Math.ceil(responseText.length / 4);
    const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015);  // Claude pricing

    return { dimensions, cost };
  }

  /**
   * Map AI response to dimension fields
   */
  private mapResponseToDimensions(response: any, templateType: string): Partial<ChunkDimensions> {
    const mapping: Record<string, Partial<ChunkDimensions>> = {
      'content_analysis': {
        chunk_summary_1s: response.chunk_summary_1s,
        key_terms: response.key_terms,
        audience: response.audience,
        intent: response.intent,
        tone_voice_tags: response.tone_voice_tags,
        brand_persona_tags: response.brand_persona_tags,
        domain_tags: response.domain_tags,
      },
      'task_extraction': {
        task_name: response.task_name,
        preconditions: response.preconditions,
        inputs: response.inputs,
        steps_json: response.steps_json,
        expected_output: response.expected_output,
        warnings_failure_modes: response.warnings_failure_modes,
      },
      'cer_analysis': {
        claim: response.claim,
        evidence_snippets: response.evidence_snippets,
        reasoning_sketch: response.reasoning_sketch,
        citations: response.citations,
        factual_confidence_0_1: response.factual_confidence_0_1,
      },
      'scenario_extraction': {
        scenario_type: response.scenario_type,
        problem_context: response.problem_context,
        solution_action: response.solution_action,
        outcome_metrics: response.outcome_metrics,
        style_notes: response.style_notes,
      },
      'risk_assessment': {
        safety_tags: response.safety_tags,
        coverage_tag: response.coverage_tag,
        novelty_tag: response.novelty_tag,
        ip_sensitivity: response.ip_sensitivity,
        pii_flag: response.pii_flag,
        compliance_flags: response.compliance_flags,
      },
    };

    return mapping[templateType] || {};
  }
}
```

### Part B: Create API Endpoint

Create `src/app/api/chunks/generate-dimensions/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { DimensionGenerator } from '../../../../lib/dimension-generation/generator';
import { userService } from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await userService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate dimensions
    const generator = new DimensionGenerator();
    const runId = await generator.generateDimensionsForDocument({
      documentId,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      runId,
    });

  } catch (error: any) {
    console.error('Dimension generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
```

### Part C: Update Extraction Flow

Modify chunk extraction to automatically trigger dimension generation after chunks are created.

**COMPLETION CRITERIA:**
✅ AI dimension generation working  
✅ All 5 prompt templates executing  
✅ Dimensions saved to database  
✅ Run tracking functional  
✅ Cost and timing captured  
✅ Error handling robust  

---

## BUILD PROMPT #4: CHUNK DASHBOARD & SPREADSHEET INTERFACE

**CONTEXT FOR AI:** Data is being generated. Now create the chunk dashboard and spreadsheet interface following the existing wireframe design from `chunks-alpha-dashboard`.

**CRITICAL:** This prompt REQUIRES you to follow the **Dashboard Wireframe Design Reference** section above. Read it carefully before proceeding.

**VISUAL TARGET:** Refer to **Figure 1** in the Dashboard Wireframe Design Reference section above - your implementation must match this design exactly. Pay special attention to:
- The three-section card layout (metadata → things we know → things we need to know)
- Color coding: green for high confidence, orange for knowledge gaps, neutral for metadata
- Typography scale and spacing (compact text with generous padding)
- Icon placement and usage from lucide-react
- Analysis summary cards with colored backgrounds

**YOUR TASK:**

### Part A: Create Chunk Dashboard Page

Create `src/app/chunks/[documentId]/page.tsx`:

This is the main chunk overview page that **MUST match the design pattern from `DocumentChunksOverview.tsx`** in the wireframe.

**Required Layout Structure:**

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { 
  FileText, CheckCircle, AlertCircle, Hash, ExternalLink, ArrowRight 
} from 'lucide-react';

export default function ChunkDashboardPage({ params }: { params: { documentId: string } }) {
  // Fetch document and chunks
  // Fetch latest run dimensions
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 1. Filename Display - centered */}
      <div className="text-center">
        <h1 className="font-bold">{document.title}</h1>
      </div>
      
      {/* 2. Document Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                {document.title}
                <Badge variant="outline">{document.primary_category}</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {document.total_chunks_extracted} chunks extracted
              </p>
            </div>
            <div className="text-right">
              <Badge className="mb-2 bg-green-500">
                COMPLETED
              </Badge>
              <div className="text-sm text-muted-foreground">
                Analysis Progress: {analysisProgress}%
              </div>
              <Progress value={analysisProgress} className="w-32 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 3. Auto-Generated Chunks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Auto-Generated Chunks</h2>
          <Badge variant="secondary">
            {chunksWithDimensions} / {totalChunks} Analyzed
          </Badge>
        </div>

        {/* Individual chunk cards - FOLLOW THREE-SECTION PATTERN */}
        {chunks.map((chunk) => (
          <Card key={chunk.id} className={`transition-all ${getChunkTypeColor(chunk.chunk_type)} ${hasDimensions(chunk) ? 'ring-1 ring-green-200' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-lg bg-white/50 ${hasDimensions(chunk) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {hasDimensions(chunk) ? <CheckCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{chunk.chunk_handle || `Chunk ${chunk.chunk_id}`}</h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {chunk.chunk_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  <div>ID: {chunk.chunk_id}</div>
                  {hasDimensions(chunk) ? (
                    <Badge variant="default" className="bg-green-500 text-xs mt-1">Analyzed</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs mt-1">Pending</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* SECTION 1: Chunk Metadata (neutral background) */}
              <div className="mb-4 p-3 bg-white/30 rounded border">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  Chunk Metadata
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Chars:</span>
                    <div className="font-medium">{chunk.char_end - chunk.char_start}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tokens:</span>
                    <div className="font-medium">{chunk.token_count}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Page:</span>
                    <div className="font-medium">{chunk.page_start || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div className="font-medium">{chunk.chunk_type}</div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Things We Know (green background) */}
              <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-3 w-3" />
                  Things We Know ({getHighConfidenceDimensions(chunk).length})
                </h5>
                {getHighConfidenceDimensions(chunk).length > 0 ? (
                  <div className="space-y-2">
                    {getHighConfidenceDimensions(chunk).slice(0, 3).map((dim, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {dim.fieldName}
                          </Badge>
                          <span className="text-green-600 font-medium">
                            {dim.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-green-800">{truncate(dim.value, 100)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-green-700">No dimensions generated yet</p>
                )}
              </div>

              {/* SECTION 3: Things We Need to Know (orange background) */}
              <div className="p-3 bg-orange-50 rounded border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-3 w-3" />
                    Things We Need to Know ({getLowConfidenceDimensions(chunk).length})
                  </h5>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-6 px-2 border-orange-300 text-orange-700 hover:bg-orange-100"
                    onClick={() => navigateToSpreadsheet(chunk.id)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Detail View
                  </Button>
                </div>
                {getLowConfidenceDimensions(chunk).length > 0 ? (
                  <ul className="space-y-1">
                    {getLowConfidenceDimensions(chunk).slice(0, 3).map((dim, idx) => (
                      <li key={idx} className="text-xs text-orange-800 flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {dim.fieldName}: Low confidence ({dim.confidence}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-orange-700">All dimensions have high confidence</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 4. Analysis Summary (4-column stats) */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-medium text-blue-600">{totalChunks}</div>
              <div className="text-sm text-blue-800">Total Chunks</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-medium text-green-600">{chunksWithDimensions}</div>
              <div className="text-sm text-green-800">Analyzed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <div className="text-2xl font-medium text-orange-600">{totalDimensionsGenerated}</div>
              <div className="text-sm text-orange-800">Dimensions Generated</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-2xl font-medium text-purple-600">{totalCost.toFixed(2)}</div>
              <div className="text-sm text-purple-800">Total Cost ($)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getChunkTypeColor(type: string): string {
  switch (type) {
    case 'Chapter_Sequential': return 'border-blue-200 bg-blue-50';
    case 'Instructional_Unit': return 'border-purple-200 bg-purple-50';
    case 'CER': return 'border-orange-200 bg-orange-50';
    case 'Example_Scenario': return 'border-yellow-200 bg-yellow-50';
    default: return 'border-gray-200 bg-gray-50';
  }
}

function getHighConfidenceDimensions(chunk: any): DimensionWithConfidence[] {
  // Get dimensions with confidence >= 75%
  // Sort by confidence descending
  // Return top items
}

function getLowConfidenceDimensions(chunk: any): DimensionWithConfidence[] {
  // Get dimensions with confidence < 75%
  // Sort by confidence ascending
  // Return bottom items
}
```

**Key Implementation Notes:**

1. **Color Coding**: Use exact color scheme from wireframe
2. **Three-Section Layout**: Every chunk card must have the three-section structure
3. **Confidence-Based Display**: 
   - "Things We Know" = dimensions with `generation_confidence_accuracy` >= 75%
   - "Things We Need to Know" = dimensions with < 75% confidence or NULL values
4. **Progressive Disclosure**: Show 3 items in each section, button to see full spreadsheet
5. **Icons**: Use lucide-react icons exactly as shown in wireframe

### Part B: Create Full Spreadsheet Component

Create `src/components/chunks/ChunkSpreadsheet.tsx`:

Full-featured spreadsheet for detailed dimension analysis:

```typescript
'use client'

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  ArrowUpDown, Search, Filter, Download 
} from 'lucide-react';

interface ChunkSpreadsheetProps {
  chunk: Chunk;
  dimensions: ChunkDimensions[];
  runs: ChunkRun[];
}

export function ChunkSpreadsheet({ chunk, dimensions, runs }: ChunkSpreadsheetProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [activeView, setActiveView] = useState<'all' | 'quality' | 'cost' | 'content' | 'risk'>('all');

  // Define preset views
  const presetViews = {
    quality: ['generation_confidence_precision', 'generation_confidence_accuracy', 'factual_confidence_0_1', 'review_status'],
    cost: ['generation_cost_usd', 'generation_duration_ms', 'token_count'],
    content: ['chunk_summary_1s', 'key_terms', 'audience', 'intent', 'tone_voice_tags'],
    risk: ['ip_sensitivity', 'pii_flag', 'compliance_flags', 'safety_tags', 'coverage_tag'],
  };

  const visibleColumns = activeView === 'all' 
    ? getAllDimensionFields() 
    : presetViews[activeView];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant={activeView === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('all')}
          >
            All Dimensions
          </Button>
          <Button 
            variant={activeView === 'quality' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('quality')}
          >
            Quality View
          </Button>
          <Button 
            variant={activeView === 'cost' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('cost')}
          >
            Cost View
          </Button>
          <Button 
            variant={activeView === 'content' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('content')}
          >
            Content View
          </Button>
          <Button 
            variant={activeView === 'risk' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('risk')}
          >
            Risk View
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Filter..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="border rounded-lg overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-32">Run</TableHead>
              {visibleColumns.map(col => (
                <TableHead 
                  key={col} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-2">
                    {formatColumnName(col)}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dimensions.map(dim => (
              <TableRow key={dim.id}>
                <TableCell className="font-medium">
                  {formatRunName(dim.run_id, runs)}
                </TableCell>
                {visibleColumns.map(col => (
                  <TableCell key={col}>
                    {formatCellValue(dim[col as keyof ChunkDimensions])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  if (Array.isArray(value)) return <Badge variant="secondary">{value.length} items</Badge>;
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (typeof value === 'number') return value.toFixed(2);
  return String(value).substring(0, 100);
}
```

### Part C: Create Spreadsheet Detail Page

Create `src/app/chunks/[documentId]/spreadsheet/[chunkId]/page.tsx`:

Full-page spreadsheet view showing all runs for a specific chunk.

**COMPLETION CRITERIA:**
✅ Chunk dashboard matches wireframe design exactly  
✅ Three-section card layout implemented  
✅ Color-coded confidence display working  
✅ "Things We Know" / "Things We Need to Know" logic correct  
✅ Spreadsheet with sorting and filtering  
✅ Preset views functional  
✅ Progressive disclosure (3 items → full spreadsheet)  

---

## BUILD PROMPT #5: RUN MANAGEMENT & POLISH

**CONTEXT FOR AI:** The core functionality is complete. Now add run management, regeneration, and final polish.

**YOUR TASK:**

### Part A: Run Comparison

Add ability to:
1. Select 2+ runs for the same chunk
2. View side-by-side comparison
3. Highlight differences
4. Export comparison data

### Part B: Regeneration

Add "Regenerate" button that:
1. Creates new run
2. Re-generates dimensions for selected chunks
3. Preserves history
4. Updates dashboard

### Part C: Polish & Testing

1. Add loading states everywhere
2. Add error boundaries
3. Add toast notifications
4. Test full workflow end-to-end
5. Fix any bugs or issues

**COMPLETION CRITERIA:**
✅ Run comparison working  
✅ Regeneration functional  
✅ All UI polished  
✅ No critical bugs  
✅ Documentation complete  

---

## APPENDICES

### Appendix A: Data Dictionary Reference

All 60+ dimensions from:
- `document-metadata-dictionary-gen-AI-processing-required_v1.csv`
- `document-metadata-dictionary-mechanically-generated_v1.csv`
- `document-metadata-dictionary-previously-generated_v1.csv`

### Appendix B: Prompt Engineering Guidelines

For future prompt refinement:
1. Store prompts in markdown files at `pmc/prompts/`
2. Use utility to push to database
3. Version control all prompts
4. A/B test variations

### Appendix C: Cost Estimation

Estimated cost per document (20-30 chunks):
- Chunk extraction: $0.10 - $0.15
- Dimension generation: $0.25 - $0.35
- **Total: $0.35 - $0.50 per document**

### Appendix D: Performance Targets

- Chunk extraction: < 2 minutes
- Dimension generation: < 5 minutes
- Spreadsheet load: < 2 seconds
- Overall workflow: < 10 minutes per document

---

## CONCLUSION

This specification provides a complete, step-by-step build plan for the Chunk Alpha module. Each prompt is designed to be self-contained and executable in a 200k token context window.

**Total Build Time Estimate:** 20-30 hours across 5 prompts  
**Complexity Level:** High  
**Dependencies:** Supabase, Claude Sonnet 4.5, Next.js 14  
**Success Metric:** Ability to extract chunks, generate 60+ dimensions, and visualize all data in spreadsheet format for prompt testing and refinement.

**END OF SPECIFICATION**

