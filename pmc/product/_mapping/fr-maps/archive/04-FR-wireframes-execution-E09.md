# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E09)
**Generated**: 2025-01-20  
**Segment**: E09 - Integration with Chunks-Alpha Module  
**Total Prompts**: 8  
**Estimated Implementation Time**: 120-160 hours (3-4 weeks)

---

## Executive Summary

This segment implements the integration between the Interactive LoRA Conversation Generation module and the existing Chunks-Alpha module, enabling conversations to be generated from source document chunks with full traceability and dimension-driven parameter selection. This integration completes the end-to-end pipeline from document upload → chunk extraction → dimension analysis → conversation generation → LoRA-ready training data.

**Strategic Importance:**
- **Traceability**: Every generated conversation links back to its source chunk, ensuring audit trails and content provenance
- **Context Enrichment**: Chunk content and metadata automatically inject into generation prompts, improving conversation quality and relevance
- **Intelligence**: 60-dimensional semantic analysis from chunks informs persona, emotion, topic, and complexity parameters
- **Coverage**: Dimension-based chunk recommendation ensures balanced representation across the semantic space
- **Quality**: Chunk confidence scores factor into conversation quality scoring, creating a quality chain from source to output

**Key Deliverables:**
1. Database schema extensions for conversation-to-chunk associations
2. Chunk service integration layer providing unified access to chunk data
3. Dimension extraction pipeline transforming 60 dimensions into conversation parameters
4. Context injection system enriching prompts with chunk content
5. UI components: chunk selector, preview panel, generation form integration
6. Chunk-based generation workflow with dimension-driven parameter defaults
7. Orphaned conversation management system
8. Chunk recommendation engine based on dimensional similarity

---

## Context and Dependencies

### Previous Segment Deliverables

**E08 and Earlier** (Assumed Complete):
- Core conversation generation workflow (single, batch, all tiers)
- Dashboard with conversation table, filtering, sorting, pagination
- Quality validation and scoring system
- Review queue and approval workflows
- Template, scenario, and edge case management
- Export functionality with multiple formats
- User preferences and settings

**Chunks-Alpha Module** (Fully Operational):
- Document upload and text extraction
- AI-powered semantic chunking (Chapter_Sequential, Instructional_Unit, CER, Example_Scenario)
- 60-dimensional analysis system with:
  - Prior Generated (8): doc_id, doc_title, doc_version, source_type, source_url, author, doc_date, primary_category
  - Mechanically Generated (17): chunk_id, section_heading, page boundaries, token counts
  - AI Generated (35): Content (8), Task (6), CER (5), Scenario (5), Training (3), Risk (6)
- Database tables: documents, chunks, chunk_dimensions, chunk_runs, prompt_templates
- Services: chunkService, chunkDimensionService, chunkRunService

### Current Codebase State

**Existing Services Available:**
- `src/lib/chunk-service.ts`: Complete CRUD operations for chunks, dimensions, runs
- `src/lib/dimension-generation/generator.ts`: AI-powered dimension generation
- `src/lib/dimension-metadata.ts`: Dimension definitions and metadata
- `src/types/chunks.ts`: TypeScript types for all chunk-related entities

**Wireframe Components to Extend:**
- `train-wireframe/src/components/generation/SingleGenerationForm.tsx`: Add chunk selection
- `train-wireframe/src/components/dashboard/ConversationTable.tsx`: Display chunk links
- `train-wireframe/src/lib/types.ts`: Conversation type already has `parentId` and `parentType` fields

**Database Schema Available:**
- `conversations` table with `parentId` (UUID, nullable) - ready for chunk_id reference
- `parentType` field supports 'template' | 'scenario' - needs extension for 'chunk'
- `parameters` JSONB field can store chunk metadata snapshot

### Cross-Segment Dependencies

**Dependencies on Chunks-Alpha:**
- Database access to: documents, chunks, chunk_dimensions, chunk_runs tables
- Read-only access required (no modifications to chunk data)
- Supabase RLS policies must permit cross-schema access

**Integration Points:**
- Generation API routes must accept optional `chunkId` parameter
- Quality scoring must incorporate chunk confidence scores
- Export metadata must include source chunk information
- Audit logs must track chunk associations

**External Systems:**
- Claude API (already integrated): No changes needed
- Supabase Database: Schema extensions required (migrations)
- Authentication: Uses existing auth context for user attribution

---

## Implementation Strategy

### Risk Assessment

**High-Risk Areas:**

1. **Database Schema Changes (High Risk)**
   - **Risk**: Migration failures or foreign key constraint violations
   - **Mitigation**: 
     - Test migrations in development environment first
     - Use nullable foreign keys to support existing conversations
     - Implement rollback scripts for every migration
     - Validate constraint behavior before production deployment

2. **Performance with Large Datasets (Medium Risk)**
   - **Risk**: Chunk queries may slow down with 1000+ chunks per document
   - **Mitigation**:
     - Implement indexes on chunk_id foreign keys
     - Use query result caching (5-minute TTL) for chunk metadata
     - Implement pagination for chunk selector (load 50 chunks at a time)
     - Monitor query performance with EXPLAIN ANALYZE

3. **Dimension Extraction Complexity (Medium Risk)**
   - **Risk**: Mapping 60 dimensions to conversation parameters is complex and error-prone
   - **Mitigation**:
     - Start with simple direct mappings (persona, emotion, topic)
     - Implement extensive unit tests for extraction logic
     - Create mapping configuration file for easy adjustments
     - Log all extraction decisions for debugging

4. **Orphaned Conversation Management (Low Risk)**
   - **Risk**: Chunk deletions could orphan many conversations
   - **Mitigation**:
     - Use soft delete pattern for chunks (add `deleted_at` timestamp)
     - Flag orphaned conversations but preserve data
     - Provide re-linking UI for recovery
     - Schedule orphan detection as background job

### Prompt Sequencing Logic

**Prompt 1: Database Foundation**
- Establishes schema extensions and foreign key relationships
- Must complete first to enable subsequent development
- Low complexity, high importance
- Estimated: 4-6 hours

**Prompt 2: Chunk Service Integration Layer**
- Creates abstraction layer for chunk data access
- Independent of UI, can be tested in isolation
- Medium complexity, enables both Prompt 3 and 4
- Estimated: 12-16 hours

**Prompt 3: Dimension Extraction Pipeline**
- Depends on Prompt 2 for chunk data access
- Complex business logic but isolated from UI
- Can be thoroughly unit tested
- Estimated: 16-20 hours

**Prompt 4: Context Injection System**
- Depends on Prompts 2 and 3
- Integrates with existing prompt template system
- Medium complexity, critical for quality
- Estimated: 12-16 hours

**Prompt 5: UI Components (Chunk Selector & Preview)**
- Depends on Prompt 2 for data access
- Can develop in parallel with Prompts 3-4
- Integrates with existing wireframe patterns
- Estimated: 16-20 hours

**Prompt 6: Generation Form Integration**
- Depends on Prompts 3, 4, 5
- Brings together all previous work
- High integration complexity
- Estimated: 12-16 hours

**Prompt 7: Chunk-Based Generation Flow**
- Depends on all previous prompts
- End-to-end feature implementation
- Highest complexity, most testing required
- Estimated: 20-24 hours

**Prompt 8: Advanced Features (Orphan Management & Recommendations)**
- Can be implemented after Prompt 7 is stable
- Lower priority, adds polish
- Medium complexity
- Estimated: 16-20 hours

**Total Estimated Time: 108-138 hours implementation + 12-22 hours testing/refinement = 120-160 hours**

### Quality Assurance Approach

**Unit Testing Requirements:**
- Dimension extraction functions: 90% code coverage
- Context injection logic: 85% code coverage
- Service layer methods: 80% code coverage
- Test files must be created alongside implementation

**Integration Testing:**
- End-to-end chunk selection → generation → conversation storage flow
- Chunk deletion → orphan detection → flagging workflow
- Dimension-based recommendation → parameter population flow
- Export with chunk metadata inclusion

**Performance Testing:**
- Chunk selector must render 100 chunks within 500ms
- Dimension extraction must complete within 200ms per chunk
- Generation with chunk context must complete within 45 seconds
- Database queries must utilize indexes (<100ms for lookups)

**Quality Gates:**
- All TypeScript types must be strictly typed (no `any` except in parameters JSONB)
- All API endpoints must include error handling with user-friendly messages
- All UI components must include loading and error states
- All database queries must be tested for performance with EXPLAIN

---

## Database Setup Instructions

### Required SQL Operations

Execute these SQL statements in Supabase SQL Editor **before** beginning implementation prompts.

```sql
========================

-- Migration: Add Chunk Integration Fields to Conversations Table
-- Version: E09-001
-- Date: 2025-01-20
-- Purpose: Enable linking conversations to source chunks from chunks-alpha module

BEGIN;

-- Extend parentType enum to include 'chunk'
-- Note: Supabase uses text type with constraints, not true enums
ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS conversations_parent_type_check;

ALTER TABLE conversations
  ADD CONSTRAINT conversations_parent_type_check 
  CHECK (parent_type IN ('template', 'scenario', 'chunk'));

-- Add chunk-specific metadata fields
-- Note: parentId already exists as UUID field, will be reused for chunk_id

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS chunk_metadata JSONB DEFAULT '{}'::jsonb
  COMMENT ON COLUMN conversations.chunk_metadata IS 'Snapshot of chunk data at generation time';

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS dimension_mappings JSONB DEFAULT '{}'::jsonb
  COMMENT ON COLUMN conversations.dimension_mappings IS 'Persona/emotion/topic derived from chunk dimensions';

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS chunk_dimension_scores JSONB DEFAULT '{}'::jsonb
  COMMENT ON COLUMN conversations.chunk_dimension_scores IS 'Relevance scores for dimensions used in generation';

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS is_orphaned BOOLEAN DEFAULT false
  COMMENT ON COLUMN conversations.is_orphaned IS 'True if linked chunk has been deleted';

-- Create indexes for efficient chunk-related queries
CREATE INDEX IF NOT EXISTS idx_conversations_parent_id_chunk 
  ON conversations(parent_id) 
  WHERE parent_type = 'chunk';

CREATE INDEX IF NOT EXISTS idx_conversations_is_orphaned 
  ON conversations(is_orphaned) 
  WHERE is_orphaned = true;

-- Create index on chunk_metadata for JSONB querying
CREATE INDEX IF NOT EXISTS idx_conversations_chunk_metadata_gin 
  ON conversations USING gin(chunk_metadata);

-- Add comments
COMMENT ON INDEX idx_conversations_parent_id_chunk IS 'Optimizes queries finding conversations by chunk_id';
COMMENT ON INDEX idx_conversations_is_orphaned IS 'Optimizes orphaned conversation detection';

-- Foreign key constraint referencing chunks table
-- NOTE: This assumes chunks table exists in the same schema
-- Adjust schema name if chunks are in different schema (e.g., chunks_alpha.chunks)

DO $$
BEGIN
  -- Add foreign key constraint
  ALTER TABLE conversations
    ADD CONSTRAINT fk_conversations_chunk_id
    FOREIGN KEY (parent_id)
    REFERENCES chunks(id)
    ON DELETE SET NULL
    NOT VALID;

  -- Validate constraint (can run later if data exists)
  -- ALTER TABLE conversations VALIDATE CONSTRAINT fk_conversations_chunk_id;
  
  RAISE NOTICE 'Foreign key constraint added successfully';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'chunks table not found in current schema - skipping foreign key';
  WHEN duplicate_object THEN
    RAISE NOTICE 'Foreign key constraint already exists';
END $$;

-- Create trigger function to set is_orphaned flag when chunk is deleted
CREATE OR REPLACE FUNCTION mark_conversations_orphaned()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET is_orphaned = true,
      updated_at = NOW()
  WHERE parent_id = OLD.id
    AND parent_type = 'chunk';
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on chunks table
DO $$
BEGIN
  CREATE TRIGGER trigger_mark_orphaned_conversations
    BEFORE DELETE ON chunks
    FOR EACH ROW
    EXECUTE FUNCTION mark_conversations_orphaned();
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'chunks table not found - skipping trigger creation';
  WHEN duplicate_object THEN
    RAISE NOTICE 'Trigger already exists';
END $$;

COMMIT;

-- Rollback script (save separately for emergencies)
-- BEGIN;
-- DROP TRIGGER IF EXISTS trigger_mark_orphaned_conversations ON chunks;
-- DROP FUNCTION IF EXISTS mark_conversations_orphaned();
-- ALTER TABLE conversations DROP CONSTRAINT IF EXISTS fk_conversations_chunk_id;
-- DROP INDEX IF EXISTS idx_conversations_chunk_metadata_gin;
-- DROP INDEX IF EXISTS idx_conversations_is_orphaned;
-- DROP INDEX IF EXISTS idx_conversations_parent_id_chunk;
-- ALTER TABLE conversations DROP COLUMN IF EXISTS is_orphaned;
-- ALTER TABLE conversations DROP COLUMN IF EXISTS chunk_dimension_scores;
-- ALTER TABLE conversations DROP COLUMN IF EXISTS dimension_mappings;
-- ALTER TABLE conversations DROP COLUMN IF EXISTS chunk_metadata;
-- ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_parent_type_check;
-- ALTER TABLE conversations ADD CONSTRAINT conversations_parent_type_check CHECK (parent_type IN ('template', 'scenario'));
-- COMMIT;

========================
```

**Post-Migration Validation:**

```sql
-- Verify schema changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('chunk_metadata', 'dimension_mappings', 'chunk_dimension_scores', 'is_orphaned');

-- Verify indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'conversations'
  AND indexname LIKE '%chunk%';

-- Verify constraints
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'conversations'
  AND con.conname LIKE '%chunk%';

-- Test trigger function
-- (Run DELETE test on a test chunk record and verify conversations get marked)
```

---

## Implementation Prompts

### Prompt 1: Chunk Service Integration Layer
**Scope**: Create service layer abstracting chunk data access for conversation generation  
**Dependencies**: Database migration completed (SQL above)  
**Estimated Time**: 12-16 hours  
**Risk Level**: Low

========================

You are a senior full-stack developer implementing the Chunk Service Integration Layer for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This platform enables small businesses to generate high-quality training conversations for LoRA fine-tuning. The chunks-alpha module has already extracted semantic chunks from documents with 60-dimensional analysis. Now we need to integrate these chunks into the conversation generation workflow, allowing users to select chunks as source material and automatically derive conversation parameters from chunk dimensions.

**Specific Functional Requirements (FR9.1.1, FR9.1.2):**
- **FR9.1.1**: Conversation to Chunk Association - Link generated conversations to source chunks with full traceability
- **FR9.1.2**: Dimension-Driven Generation - Use chunk's 60-dimensional semantic analysis to inform conversation generation parameters

**Technical Architecture:**
- Service Layer / Repository Pattern
- TypeScript strict mode enabled
- Supabase as database with existing chunk tables
- Existing services: `src/lib/chunk-service.ts` provides basic CRUD
- Need higher-level abstraction for conversation-specific chunk operations

**Integration Points:**
- Must work with existing `chunkService`, `chunkDimensionService` from `src/lib/chunk-service.ts`
- Will be consumed by dimension extraction pipeline (Prompt 3)
- Will be consumed by UI components for chunk selection (Prompt 5)

**Quality Requirements:**
- 85% code coverage for unit tests
- All methods must use TypeScript strict typing
- Comprehensive error handling with typed error responses
- Query caching (5-minute TTL) for chunk metadata to minimize database load

**CURRENT CODEBASE STATE:**

**Existing Chunk Service** (`src/lib/chunk-service.ts`):
- `chunkService.getChunkById(chunkId)`: Returns single chunk
- `chunkService.getChunksByDocument(documentId)`: Returns all chunks for document
- `chunkDimensionService.getDimensionsByChunkAndRun(chunkId, runId)`: Returns 60-dimension analysis

**Existing Types** (`src/types/chunks.ts`):
```typescript
export type Chunk = {
  id: string;
  chunk_id: string;
  document_id: string;
  chunk_type: ChunkType;
  section_heading: string | null;
  chunk_text: string;
  token_count: number;
  // ... other fields
};

export type ChunkDimensions = {
  id: string;
  chunk_id: string;
  run_id: string;
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
  // CER dimensions
  claim: string | null;
  evidence_snippets: string[] | null;
  reasoning_sketch: string | null;
  // Scenario dimensions
  scenario_type: string | null;
  problem_context: string | null;
  solution_action: string | null;
  // Training dimensions
  prompt_candidate: string | null;
  target_answer: string | null;
  // Risk dimensions
  safety_tags: string[] | null;
  coverage_tag: string | null;
  novelty_tag: string | null;
  // Meta-dimensions
  generation_confidence_precision: number | null;
  generation_confidence_accuracy: number | null;
  // ... 60 total dimensions
};
```

**IMPLEMENTATION TASKS:**

Create new file: `src/lib/conversation-chunk-service.ts`

**Task 1: Create Service Interface and Types**
1. Define `ChunkWithDimensions` type combining Chunk + ChunkDimensions
2. Define `ChunkNotFoundError` custom error class
3. Define `ConversationChunkLink` type for association records
4. Define service interface with methods (see below)

**Task 2: Implement Chunk Retrieval Methods**
1. `getChunkWithDimensions(chunkId: string, runId?: string): Promise<ChunkWithDimensions>`
   - Fetch chunk + dimensions in single query (JOIN)
   - If runId not provided, get latest run's dimensions
   - Throw ChunkNotFoundError if chunk doesn't exist
   - Cache result for 5 minutes

2. `getChunkDimensions(chunkId: string, runId?: string): Promise<ChunkDimensions>`
   - Fetch only dimensions array
   - Use caching
   - Return empty/default dimensions if none found

3. `searchChunks(filters: ChunkSearchFilters): Promise<Chunk[]>`
   - Support filtering by: documentId, chunkType, keywords (text search on chunk_text)
   - Support pagination (offset, limit)
   - Return ordered by char_start (sequential)

**Task 3: Implement Conversation-Chunk Association Methods**
1. `linkConversationToChunk(conversationId: string, chunkId: string, metadata: ChunkLinkMetadata): Promise<void>`
   - Update conversations table: set parent_id = chunkId, parent_type = 'chunk'
   - Store chunk snapshot in chunk_metadata JSONB
   - Store dimension mappings in dimension_mappings JSONB
   - Handle duplicate link errors gracefully

2. `getConversationChunks(conversationId: string): Promise<ChunkWithDimensions | null>`
   - Query conversation to get parent_id where parent_type = 'chunk'
   - Fetch chunk with dimensions
   - Return null if no chunk linked

3. `getChunkConversations(chunkId: string): Promise<string[]>`
   - Query conversations where parent_id = chunkId
   - Return array of conversation IDs
   - Useful for showing "X conversations use this chunk"

**Task 4: Implement Caching Layer**
1. Use simple in-memory cache with Map<string, {data: any, timestamp: number}>
2. TTL: 5 minutes (300000ms)
3. Cache key format: `chunk:${chunkId}:${runId || 'latest'}`
4. Include cache hit/miss logging for monitoring
5. Cache invalidation on chunk updates (optional, chunks rarely change)

**Task 5: Error Handling**
1. Create custom error types:
   - `ChunkNotFoundError extends Error`
   - `DimensionsNotFoundError extends Error`
   - `LinkConflictError extends Error`
2. All errors must include: chunkId, operation name, timestamp
3. Wrap database errors with user-friendly messages

**ACCEPTANCE CRITERIA:**

- [ ] Service exports all required methods with TypeScript types
- [ ] `getChunkWithDimensions()` returns chunk + dimensions in <100ms (cached) or <500ms (uncached)
- [ ] `searchChunks()` supports text search on chunk_text using PostgreSQL ILIKE
- [ ] `linkConversationToChunk()` stores complete chunk snapshot in chunk_metadata field
- [ ] Caching reduces database queries by 80%+ for repeated chunk access
- [ ] All errors are typed and include contextual information
- [ ] Service includes JSDoc comments for all public methods
- [ ] Unit tests achieve 85%+ code coverage
- [ ] No `any` types except in JSONB parameter fields

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/conversation-chunk-service.ts
src/lib/__tests__/conversation-chunk-service.test.ts (unit tests)
```

**Service Pattern:**
```typescript
export const conversationChunkService = {
  // Chunk retrieval
  async getChunkWithDimensions(chunkId: string, runId?: string): Promise<ChunkWithDimensions> { },
  async getChunkDimensions(chunkId: string, runId?: string): Promise<ChunkDimensions> { },
  async searchChunks(filters: ChunkSearchFilters): Promise<Chunk[]> { },
  
  // Association management
  async linkConversationToChunk(conversationId: string, chunkId: string, metadata: ChunkLinkMetadata): Promise<void> { },
  async getConversationChunks(conversationId: string): Promise<ChunkWithDimensions | null> { },
  async getChunkConversations(chunkId: string): Promise<string[]> { },
  
  // Utility
  clearCache(): void { },
};
```

**Supabase Query Examples:**
```typescript
// Get chunk with dimensions (JOIN)
const { data, error } = await supabase
  .from('chunks')
  .select(`
    *,
    chunk_dimensions!inner(*)
  `)
  .eq('id', chunkId)
  .eq('chunk_dimensions.run_id', runId)
  .single();

// Search chunks with text filter
const { data, error } = await supabase
  .from('chunks')
  .select('*')
  .eq('document_id', documentId)
  .ilike('chunk_text', `%${keyword}%`)
  .range(offset, offset + limit - 1);
```

**Error Handling Pattern:**
```typescript
if (error) {
  if (error.code === 'PGRST116') {
    throw new ChunkNotFoundError(`Chunk not found: ${chunkId}`);
  }
  throw new Error(`Failed to fetch chunk: ${error.message}`);
}
```

**VALIDATION REQUIREMENTS:**

1. **Unit Tests** (Create `src/lib/__tests__/conversation-chunk-service.test.ts`):
   - Test getChunkWithDimensions with valid chunkId
   - Test getChunkWithDimensions with invalid chunkId (expect ChunkNotFoundError)
   - Test caching behavior (first call uncached, second call cached)
   - Test linkConversationToChunk creates correct associations
   - Test searchChunks with various filters
   - Mock Supabase client for testing

2. **Integration Test** (Manual verification):
   - Call service methods from Node.js REPL
   - Verify database state matches expectations
   - Check cache TTL expiration behavior

3. **Performance Validation**:
   - Measure query time with `console.time()`
   - Verify cache reduces subsequent queries to <10ms

**DELIVERABLES:**

1. `src/lib/conversation-chunk-service.ts` - Complete service implementation
2. `src/lib/__tests__/conversation-chunk-service.test.ts` - Unit tests (85%+ coverage)
3. Update `src/types/chunks.ts` with new types:
   - `ChunkWithDimensions`
   - `ChunkSearchFilters`
   - `ChunkLinkMetadata`
4. JSDoc documentation for all public methods

Implement this service completely, ensuring type safety, comprehensive error handling, and efficient caching. The service will be the foundation for all chunk-conversation integration features.

++++++++++++++++++


### Prompt 2: Dimension Mapping Configuration System
**Scope**: Define mapping rules from chunk dimensions to conversation parameters  
**Dependencies**: None (standalone configuration)  
**Estimated Time**: 8-12 hours  
**Risk Level**: Medium

========================

You are a senior developer implementing the Dimension Mapping Configuration System for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The chunks-alpha module analyzes documents into semantic chunks with 60 dimensions across multiple categories (content, task, CER, scenario, training, risk). We need a configuration system that defines how these 60 dimensions map to conversation generation parameters (persona, emotion, topic, intent, tone, complexity).

**Specific Functional Requirement (FR9.1.2):**
- **FR9.1.2**: Dimension-Driven Generation - Use chunk's 60-dimensional semantic analysis to inform conversation generation parameters

**Technical Architecture:**
- Configuration / Strategy Pattern
- Pure data structures (no database dependencies)
- Export as JSON for version control
- Support multiple mapping profiles (conservative, balanced, aggressive)

**Integration Points:**
- Will be consumed by dimension extraction service (Prompt 3)
- Must align with existing persona/emotion/topic taxonomies from wireframe

**Quality Requirements:**
- 100% mapping rule coverage (all 60 dimensions mapped)
- Configuration must be exportable/importable as JSON
- Validation function ensures configuration completeness
- Support custom mapping rules per user organization (future)

**CURRENT CODEBASE STATE:**

**Existing Persona Types** (from `train-wireframe/src/lib/types.ts`):
```typescript
// Example personas (extend as needed)
const PERSONAS = [
  'Anxious Investor',
  'Confident Entrepreneur', 
  'Skeptical Analyst',
  'Enthusiastic Beginner',
  'Expert Consultant'
];
```

**Existing Emotion Types**:
```typescript
const EMOTIONS = [
  'Fear',
  'Confidence',
  'Curiosity',
  'Frustration',
  'Hope',
  'Satisfaction'
];
```

**Chunk Dimension Categories** (from `src/types/chunks.ts`):
- **Content (8 dimensions)**: chunk_summary_1s, key_terms, audience, intent, tone_voice_tags, brand_persona_tags, domain_tags, content (implicit)
- **Task (6 dimensions)**: task_name, preconditions, inputs, steps_json, expected_output, warnings_failure_modes
- **CER (5 dimensions)**: claim, evidence_snippets, reasoning_sketch, citations, factual_confidence_0_1
- **Scenario (5 dimensions)**: scenario_type, problem_context, solution_action, outcome_metrics, style_notes
- **Training (3 dimensions)**: prompt_candidate, target_answer, style_directives
- **Risk (6 dimensions)**: safety_tags, coverage_tag, novelty_tag, ip_sensitivity, pii_flag, compliance_flags

**IMPLEMENTATION TASKS:**

Create new file: `src/lib/dimension-mapping-config.ts`

**Task 1: Define Mapping Configuration Types**

```typescript
export type DimensionMappingRule = {
  sourceDimension: string; // e.g., 'audience'
  targetParameter: 'persona' | 'emotion' | 'topic' | 'intent' | 'tone' | 'complexity' | 'turn_count';
  mappingLogic: 'direct' | 'lookup' | 'calculated' | 'composite';
  lookupTable?: Record<string, string>; // For 'lookup' logic
  calculationFormula?: string; // For 'calculated' logic
  weight?: number; // For 'composite' logic (0-1)
  fallbackValue?: string;
  description: string;
};

export type DimensionMappingProfile = {
  profileName: string;
  description: string;
  rules: DimensionMappingRule[];
  confidenceThresholds: {
    high: number; // e.g., 0.8
    medium: number; // e.g., 0.5
    low: number; // e.g., 0.3
  };
};

export type DimensionMappingConfig = {
  version: string;
  profiles: {
    conservative: DimensionMappingProfile;
    balanced: DimensionMappingProfile;
    aggressive: DimensionMappingProfile;
  };
  defaultProfile: 'conservative' | 'balanced' | 'aggressive';
};
```

**Task 2: Define Default Mapping Rules**

Create comprehensive mapping rules for all 60 dimensions. Examples:

**Direct Mappings** (dimension value used directly):
- `audience` → `persona`: If audience="financial advisors", persona="Expert Consultant"
- `intent` → `intent`: Direct pass-through
- `tone_voice_tags` → `tone`: First element of array

**Lookup Mappings** (use lookup table):
- `scenario_type` → `emotion`:
  ```typescript
  lookupTable: {
    'problem_solving': 'Frustration',
    'success_story': 'Confidence',
    'learning_journey': 'Curiosity',
    'crisis_management': 'Fear',
    'celebration': 'Satisfaction'
  }
  ```

**Calculated Mappings** (derive from multiple dimensions):
- `complexity` (from task steps count, factual_confidence, domain_tags count):
  ```typescript
  calculationFormula: "if (steps > 10 || factual_confidence < 0.6) return 'high'; else if (steps > 5) return 'medium'; else return 'low';"
  ```

- `turn_count` (from complexity + content length):
  ```typescript
  calculationFormula: "complexity === 'high' ? 14-20 : complexity === 'medium' ? 8-12 : 4-6"
  ```

**Composite Mappings** (weighted combination):
- `persona` (from audience + brand_persona_tags + tone_voice_tags):
  ```typescript
  {
    sourceDimension: 'persona_composite',
    targetParameter: 'persona',
    mappingLogic: 'composite',
    weight: 1.0,
    description: 'Combine audience (0.5), brand_persona_tags (0.3), tone_voice_tags (0.2)'
  }
  ```

**Task 3: Define Three Mapping Profiles**

1. **Conservative Profile**:
   - High confidence thresholds (0.8+)
   - Strict mappings requiring exact matches
   - Default to safe fallback values
   - Use for production training data

2. **Balanced Profile**:
   - Medium confidence thresholds (0.5+)
   - Moderate mappings with some interpretation
   - Use for general purpose generation

3. **Aggressive Profile**:
   - Low confidence thresholds (0.3+)
   - Flexible mappings with more inference
   - Use for exploratory generation and testing

**Task 4: Implement Configuration Functions**

```typescript
export function getMappingProfile(profileName: string): DimensionMappingProfile {
  // Return requested profile or default
}

export function validateMappingConfig(config: DimensionMappingConfig): {
  valid: boolean;
  errors: string[];
} {
  // Check all 60 dimensions have mappings
  // Check lookup tables are complete
  // Check confidence thresholds are valid (0-1)
}

export function exportMappingConfig(config: DimensionMappingConfig): string {
  // Export as formatted JSON
}

export function importMappingConfig(json: string): DimensionMappingConfig {
  // Parse and validate JSON
}
```

**ACCEPTANCE CRITERIA:**

- [ ] Configuration defines mappings for all 60 chunk dimensions
- [ ] Three profiles implemented (conservative, balanced, aggressive) with different threshold values
- [ ] Persona mappings align with existing persona taxonomy
- [ ] Emotion mappings align with existing emotion taxonomy
- [ ] Complexity mapping derives turn count ranges (low: 4-6, medium: 8-12, high: 14-20)
- [ ] Configuration exportable as formatted JSON
- [ ] Validation function identifies missing or invalid mappings
- [ ] All mapping rules include description explaining the logic
- [ ] Fallback values defined for all optional dimensions

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/dimension-mapping-config.ts
src/lib/__tests__/dimension-mapping-config.test.ts
```

**Example Mapping Rules:**

```typescript
export const DEFAULT_DIMENSION_MAPPINGS: DimensionMappingRule[] = [
  // Content dimensions
  {
    sourceDimension: 'audience',
    targetParameter: 'persona',
    mappingLogic: 'lookup',
    lookupTable: {
      'financial advisors': 'Expert Consultant',
      'small business owners': 'Confident Entrepreneur',
      'investors': 'Anxious Investor',
      'beginners': 'Enthusiastic Beginner',
      'analysts': 'Skeptical Analyst'
    },
    fallbackValue: 'Confident Entrepreneur',
    description: 'Map audience type to appropriate persona'
  },
  {
    sourceDimension: 'intent',
    targetParameter: 'intent',
    mappingLogic: 'direct',
    fallbackValue: 'inform',
    description: 'Pass through intent value directly'
  },
  {
    sourceDimension: 'tone_voice_tags',
    targetParameter: 'tone',
    mappingLogic: 'lookup',
    lookupTable: {
      'formal': 'Professional',
      'casual': 'Conversational',
      'technical': 'Analytical',
      'friendly': 'Approachable',
      'authoritative': 'Assertive'
    },
    fallbackValue: 'Professional',
    description: 'Map first tone tag to conversation tone'
  },
  
  // Scenario dimensions
  {
    sourceDimension: 'scenario_type',
    targetParameter: 'emotion',
    mappingLogic: 'lookup',
    lookupTable: {
      'problem_solving': 'Frustration',
      'success_story': 'Confidence',
      'learning_journey': 'Curiosity',
      'crisis_management': 'Fear',
      'celebration': 'Satisfaction',
      'planning': 'Hope'
    },
    fallbackValue: 'Curiosity',
    description: 'Derive emotional context from scenario type'
  },
  
  // Task dimensions
  {
    sourceDimension: 'task_complexity',
    targetParameter: 'complexity',
    mappingLogic: 'calculated',
    calculationFormula: 'steps_json.length > 10 ? "high" : steps_json.length > 5 ? "medium" : "low"',
    fallbackValue: 'medium',
    description: 'Calculate complexity from task step count'
  },
  
  // Composite for turn count
  {
    sourceDimension: 'turn_count_composite',
    targetParameter: 'turn_count',
    mappingLogic: 'composite',
    calculationFormula: 'complexity === "high" ? rand(14,20) : complexity === "medium" ? rand(8,12) : rand(4,6)',
    fallbackValue: '10',
    description: 'Derive turn count from complexity level'
  }
];
```

**VALIDATION REQUIREMENTS:**

1. **Unit Tests**:
   - Test getMappingProfile returns correct profile
   - Test validateMappingConfig identifies missing mappings
   - Test validateMappingConfig identifies invalid threshold values
   - Test export/import roundtrip preserves configuration
   - Test all 60 dimensions have at least one mapping rule

2. **Configuration Validation**:
   - Run validation on default configuration
   - Ensure no TypeScript compilation errors
   - Verify JSON export is valid and formatted

**DELIVERABLES:**

1. `src/lib/dimension-mapping-config.ts` - Complete configuration system
2. `src/lib/__tests__/dimension-mapping-config.test.ts` - Unit tests
3. JSON export of default configuration for version control
4. Documentation of mapping logic for each dimension

Implement this configuration system completely, ensuring all 60 dimensions are mapped with clear, documented logic that can be easily adjusted as mapping strategies evolve.

++++++++++++++++++


