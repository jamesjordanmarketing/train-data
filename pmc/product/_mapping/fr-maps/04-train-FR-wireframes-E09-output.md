# Interactive LoRA Conversation Generation - Feature & Function Task Inventory (Generated 2025-01-29)

**Module:** Chunks-Alpha Integration (FR9)  
**Scope:** Conversation to Chunk Association and Dimension-Driven Generation  
**Version:** 1.0.0  
**Generated From:**
- Source FR Document: `04-train-FR-wireframes-E09.md`
- Product Overview: `01-train-overview.md`
- Functional Requirements: `03-train-functional-requirements.md`
- Wireframe Implementation: `train-wireframe/src/`

---

## Executive Summary

This task inventory provides a complete roadmap for implementing the Chunks-Alpha Module Integration features (FR9.1.1 and FR9.1.2), which enable conversations to be linked to source document chunks and use semantic dimensions to drive intelligent conversation generation.

**Key Deliverables:**
- Conversation-to-Chunk association system
- Chunk selector UI component
- Dimension-driven parameter selection
- Context injection into generation prompts
- Quality scoring enhanced with dimension confidence
- Complete audit trail for chunk linkage

**Total Tasks:** 58  
**Estimated Duration:** 6-8 weeks  
**Complexity:** Medium-High

---

## 1. Foundation & Infrastructure

### T-1.1.0: Database Schema for Chunk Integration
- **FR Reference**: FR9.1.1
- **Impact Weighting**: System Architecture / Data Integrity
- **Implementation Location**: Database migrations, `src/lib/database.ts`
- **Pattern**: Foreign key relationships with cascading updates
- **Dependencies**: None (Foundation task)
- **Estimated Human Work Hours**: 8-12 hours
- **Description**: Implement database schema changes to support conversation-to-chunk linking with referential integrity
- **Testing Tools**: Supabase SQL tests, Jest unit tests
- **Test Coverage Requirements**: 100% schema migration coverage
- **Completes Component?**: Yes - Database foundation for chunk integration

**Functional Requirements Acceptance Criteria**:
- Conversations table must include `parent_chunk_id` column (UUID, nullable, foreign key to chunks.id)
- Conversations table must include `chunk_context` column (TEXT, nullable) for cached chunk content
- Conversations table must include `dimension_source` column (JSONB, nullable) for dimension metadata
- Foreign key constraint must reference `chunks.id` with ON DELETE SET NULL (preserve conversation if chunk deleted)
- Index must be created on `parent_chunk_id` for efficient chunk-to-conversation lookups
- Migration must be reversible with proper down() function
- Schema must support multiple conversations linking to same chunk (one-to-many relationship)
- Orphaned conversation flag query must be performant (<100ms for 10,000 conversations)

#### T-1.1.1: Create Database Migration for Chunk Association
- **FR Reference**: FR9.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/20250129_add_chunk_association.sql`
- **Pattern**: Supabase migration pattern with up/down functions
- **Dependencies**: Chunks-alpha module database schema must exist
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Create SQL migration to add chunk association columns and constraints to conversations table

**Components/Elements**:
- [T-1.1.1:ELE-1] Migration File Structure: SQL file with transaction wrapper
  - Stubs and Code Location(s): `supabase/migrations/` directory pattern
- [T-1.1.1:ELE-2] ADD COLUMN Statements: parent_chunk_id, chunk_context, dimension_source
  - Stubs and Code Location(s): ALTER TABLE conversations statements
- [T-1.1.1:ELE-3] Foreign Key Constraint: FK to chunks.id with SET NULL
  - Stubs and Code Location(s): ALTER TABLE ADD CONSTRAINT statement
- [T-1.1.1:ELE-4] Index Creation: btree index on parent_chunk_id
  - Stubs and Code Location(s): CREATE INDEX statement
- [T-1.1.1:ELE-5] Down Migration: Rollback script removing columns
  - Stubs and Code Location(s): Reverse ALTER TABLE statements

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review chunks-alpha schema to understand chunks table structure (implements ELE-1)
   - [PREP-2] Verify foreign key reference path between databases (implements ELE-3)
   - [PREP-3] Plan column data types matching type definitions (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Write up migration with ADD COLUMN statements (implements ELE-2)
   - [IMP-2] Add foreign key constraint with ON DELETE SET NULL (implements ELE-3)
   - [IMP-3] Create index on parent_chunk_id for query performance (implements ELE-4)
   - [IMP-4] Write down migration for rollback capability (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test migration on local development database (validates ELE-1, ELE-2, ELE-3, ELE-4)
   - [VAL-2] Test rollback migration to ensure reversibility (validates ELE-5)
   - [VAL-3] Verify foreign key constraint behavior with test data (validates ELE-3)

#### T-1.1.2: Update TypeScript Types for Chunk Association
- **FR Reference**: FR9.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `train-wireframe/src/lib/types.ts`, `src/lib/types.ts`
- **Pattern**: TypeScript interface extension
- **Dependencies**: T-1.1.1 (database schema must be defined first)
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Extend Conversation type definition to include chunk association fields

**Components/Elements**:
- [T-1.1.2:ELE-1] Conversation Type Extension: Add parentChunkId, chunkContext, dimensionSource fields
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:26-46`, `src/lib/types.ts`
- [T-1.1.2:ELE-2] ChunkReference Type: New type defining chunk metadata structure
  - Stubs and Code Location(s): New type definition after Conversation type
- [T-1.1.2:ELE-3] DimensionSource Type: Structure for dimension metadata from chunks
  - Stubs and Code Location(s): New type definition in types.ts
- [T-1.1.2:ELE-4] Type Synchronization: Ensure main and wireframe types match
  - Stubs and Code Location(s): Both `src/lib/types.ts` and `train-wireframe/src/lib/types.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing Conversation type structure (implements ELE-1)
   - [PREP-2] Review chunks-alpha types to understand chunk data structure (implements ELE-2)
   - [PREP-3] Identify dimension metadata format from chunks-alpha module (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Add parentChunkId?: string to Conversation type (implements ELE-1)
   - [IMP-2] Add chunkContext?: string to Conversation type (implements ELE-1)
   - [IMP-3] Add dimensionSource?: DimensionSource to Conversation type (implements ELE-1)
   - [IMP-4] Create ChunkReference type with id, title, content, documentId fields (implements ELE-2)
   - [IMP-5] Create DimensionSource type with chunkId, dimensions, confidence, extractedAt (implements ELE-3)
   - [IMP-6] Synchronize types across main and wireframe codebases (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Run TypeScript compiler to verify type safety (validates ELE-1, ELE-2, ELE-3)
   - [VAL-2] Verify type import paths work in both codebases (validates ELE-4)
   - [VAL-3] Check that existing code still type-checks with new optional fields (validates ELE-1)

#### T-1.1.3: Update Database Service Layer for Chunk Queries
- **FR Reference**: FR9.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `src/lib/database.ts`
- **Pattern**: Service layer abstraction with TypeScript types
- **Dependencies**: T-1.1.1, T-1.1.2
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Extend database service to support chunk association queries and updates

**Components/Elements**:
- [T-1.1.3:ELE-1] Get Conversations by Chunk: Query all conversations linked to specific chunk
  - Stubs and Code Location(s): New method in database service class
- [T-1.1.3:ELE-2] Get Orphaned Conversations: Query conversations without chunk links
  - Stubs and Code Location(s): New method in database service class
- [T-1.1.3:ELE-3] Update Conversation Chunk Link: Update parent_chunk_id field
  - Stubs and Code Location(s): Extend existing updateConversation method
- [T-1.1.3:ELE-4] Batch Link Conversations: Efficiently link multiple conversations to chunks
  - Stubs and Code Location(s): New method for bulk operations

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing database service methods for query patterns (implements ELE-1)
   - [PREP-2] Identify performance requirements for chunk queries (implements ELE-1, ELE-2)
2. Implementation Phase:
   - [IMP-1] Add getConversationsByChunk(chunkId: string) method (implements ELE-1)
   - [IMP-2] Add getOrphanedConversations() method with efficient query (implements ELE-2)
   - [IMP-3] Extend updateConversation to handle chunk fields (implements ELE-3)
   - [IMP-4] Add batchLinkConversationsToChunks(links: Array) method (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test query performance with sample data (validates ELE-1, ELE-2)
   - [VAL-2] Verify proper type safety on method signatures (validates ELE-3, ELE-4)
   - [VAL-3] Test batch operations with multiple records (validates ELE-4)

---

## 2. Chunks-Alpha Integration Layer

### T-2.1.0: Chunks Data Access Service
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Data Integration / System Architecture
- **Implementation Location**: `src/lib/chunks-integration/`
- **Pattern**: Service layer with caching and error handling
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Create service layer to query and integrate with chunks-alpha module data
- **Testing Tools**: Jest, Supabase client mocks
- **Test Coverage Requirements**: 85% code coverage
- **Completes Component?**: Yes - Complete chunks data access layer

**Functional Requirements Acceptance Criteria**:
- Service must query chunks from chunks-alpha database tables
- Chunk queries must include semantic dimensions (60-dimension analysis)
- Service must support filtering chunks by document, category, quality threshold
- Caching layer must reduce redundant chunk queries
- Error handling must gracefully handle missing chunks or connection issues
- Service must retrieve dimension metadata for chunk-linked conversations
- Performance target: <200ms for single chunk retrieval with dimensions
- Batch queries must efficiently fetch multiple chunks (max 50 per query)

#### T-2.1.1: Create ChunksService Class
- **FR Reference**: FR9.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/chunks-integration/chunks-service.ts`
- **Pattern**: Singleton service with dependency injection
- **Dependencies**: T-1.1.3
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Implement service class for querying chunks and dimensions from chunks-alpha module

**Components/Elements**:
- [T-2.1.1:ELE-1] ChunksService Class: Singleton pattern with Supabase client injection
  - Stubs and Code Location(s): New file `src/lib/chunks-integration/chunks-service.ts`
- [T-2.1.1:ELE-2] getChunkById Method: Fetch single chunk with full metadata
  - Stubs and Code Location(s): Class method in ChunksService
- [T-2.1.1:ELE-3] getChunksByDocument Method: Fetch all chunks for document
  - Stubs and Code Location(s): Class method in ChunksService
- [T-2.1.1:ELE-4] getDimensionsForChunk Method: Fetch 60-dimension analysis data
  - Stubs and Code Location(s): Class method in ChunksService with join to chunk_dimensions table
- [T-2.1.1:ELE-5] searchChunks Method: Full-text search across chunk content
  - Stubs and Code Location(s): Class method with text search capabilities

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review chunks-alpha database schema (implements ELE-1)
   - [PREP-2] Identify chunk_dimensions table structure for dimension queries (implements ELE-4)
   - [PREP-3] Research Supabase full-text search capabilities (implements ELE-5)
2. Implementation Phase:
   - [IMP-1] Create ChunksService class with constructor and Supabase client (implements ELE-1)
   - [IMP-2] Implement getChunkById with proper type casting (implements ELE-2)
   - [IMP-3] Implement getChunksByDocument with filtering options (implements ELE-3)
   - [IMP-4] Implement getDimensionsForChunk with LEFT JOIN to dimensions table (implements ELE-4)
   - [IMP-5] Implement searchChunks with text search and ranking (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Unit test each method with mock data (validates ELE-2, ELE-3, ELE-4, ELE-5)
   - [VAL-2] Integration test with actual chunks-alpha database (validates ELE-1)
   - [VAL-3] Performance test query response times (validates all elements)

#### T-2.1.2: Implement Dimension Retrieval and Parsing
- **FR Reference**: FR9.1.2
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/chunks-integration/dimension-parser.ts`
- **Pattern**: Parser/transformer with validation
- **Dependencies**: T-2.1.1
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Parse and validate 60-dimension analysis data from chunks for conversation generation

**Components/Elements**:
- [T-2.1.2:ELE-1] DimensionParser Class: Parse raw dimension data into typed structure
  - Stubs and Code Location(s): New file `src/lib/chunks-integration/dimension-parser.ts`
- [T-2.1.2:ELE-2] Semantic Dimension Extraction: Extract persona-relevant dimensions
  - Stubs and Code Location(s): Method extractSemanticDimensions()
- [T-2.1.2:ELE-3] Complexity Scoring: Calculate complexity from dimension values
  - Stubs and Code Location(s): Method calculateComplexityScore()
- [T-2.1.2:ELE-4] Confidence Validation: Ensure dimension confidence meets threshold
  - Stubs and Code Location(s): Method validateDimensionConfidence()
- [T-2.1.2:ELE-5] Domain Tag Extraction: Extract category tags from domain dimensions
  - Stubs and Code Location(s): Method extractDomainTags()

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Document 60-dimension schema from chunks-alpha (implements ELE-1)
   - [PREP-2] Map semantic dimensions to persona/emotion parameters (implements ELE-2)
   - [PREP-3] Define complexity scoring algorithm (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create DimensionParser with parse() method (implements ELE-1)
   - [IMP-2] Implement extractSemanticDimensions returning persona-relevant data (implements ELE-2)
   - [IMP-3] Implement calculateComplexityScore with weighted formula (implements ELE-3)
   - [IMP-4] Implement validateDimensionConfidence with threshold checking (implements ELE-4)
   - [IMP-5] Implement extractDomainTags from category dimensions (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Unit test parser with various dimension data (validates ELE-1)
   - [VAL-2] Validate semantic extraction accuracy (validates ELE-2)
   - [VAL-3] Test complexity scoring with known complexity chunks (validates ELE-3)

#### T-2.1.3: Implement Caching Layer for Chunk Data
- **FR Reference**: FR9.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/chunks-integration/chunk-cache.ts`
- **Pattern**: LRU cache with TTL expiration
- **Dependencies**: T-2.1.1
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Implement in-memory caching to reduce redundant chunk queries

**Components/Elements**:
- [T-2.1.3:ELE-1] ChunkCache Class: LRU cache with configurable size and TTL
  - Stubs and Code Location(s): New file `src/lib/chunks-integration/chunk-cache.ts`
- [T-2.1.3:ELE-2] Cache Key Generation: Consistent keys for chunk lookups
  - Stubs and Code Location(s): Method generateCacheKey()
- [T-2.1.3:ELE-3] Cache Invalidation: Invalidate on chunk updates
  - Stubs and Code Location(s): Method invalidateChunk()
- [T-2.1.3:ELE-4] Cache Metrics: Track hit/miss rates for monitoring
  - Stubs and Code Location(s): Method getCacheMetrics()

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research LRU cache implementations in Node.js (implements ELE-1)
   - [PREP-2] Define cache size limits and TTL values (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create ChunkCache class with LRU eviction policy (implements ELE-1)
   - [IMP-2] Implement generateCacheKey with consistent hashing (implements ELE-2)
   - [IMP-3] Implement cache get/set with TTL tracking (implements ELE-1)
   - [IMP-4] Implement invalidateChunk and invalidateAll methods (implements ELE-3)
   - [IMP-5] Add cache metrics tracking (hit rate, miss rate, size) (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test cache eviction with size limits (validates ELE-1)
   - [VAL-2] Test TTL expiration behavior (validates ELE-1)
   - [VAL-3] Verify cache key uniqueness (validates ELE-2)

---

## 3. UI Components for Chunk Selection

### T-3.1.0: Chunk Selector UI Component
- **FR Reference**: FR9.1.1
- **Impact Weighting**: User Experience / Workflow Efficiency
- **Implementation Location**: `train-wireframe/src/components/chunks/`
- **Pattern**: React component with search and filtering
- **Dependencies**: T-2.1.0
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Build interactive UI component for selecting and linking chunks to conversations
- **Testing Tools**: Jest, React Testing Library
- **Test Coverage Requirements**: 80% component coverage
- **Completes Component?**: Yes - Complete chunk selection UI

**Functional Requirements Acceptance Criteria**:
- Component must display searchable list of available chunks from chunks-alpha
- Chunk preview must show title, content snippet, document source
- Filtering by document, category, quality score must be supported
- Selected chunk must be highlighted with visual indicator
- Component must support both single-select and multi-select modes
- Chunk metadata (dimensions, quality) must be displayed in detail panel
- Component must handle loading states and empty results gracefully
- Keyboard navigation must be fully supported (arrow keys, Enter, Escape)

#### T-3.1.1: Create ChunkSelector Component
- **FR Reference**: FR9.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/chunks/ChunkSelector.tsx`
- **Pattern**: Controlled component with local state
- **Dependencies**: T-2.1.1
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Create primary chunk selection component with search and preview

**Components/Elements**:
- [T-3.1.1:ELE-1] ChunkSelector Component: Main component with search input and list
  - Stubs and Code Location(s): New file `train-wireframe/src/components/chunks/ChunkSelector.tsx`
- [T-3.1.1:ELE-2] Search Input: Debounced text search for chunks
  - Stubs and Code Location(s): Input component from `train-wireframe/src/components/ui/input.tsx`
- [T-3.1.1:ELE-3] Chunk List: Virtualized list of chunk cards
  - Stubs and Code Location(s): ScrollArea component from `train-wireframe/src/components/ui/scroll-area.tsx`
- [T-3.1.1:ELE-4] Chunk Card: Individual chunk display with metadata
  - Stubs and Code Location(s): Card component from `train-wireframe/src/components/ui/card.tsx`
- [T-3.1.1:ELE-5] Selection State: Track selected chunk ID
  - Stubs and Code Location(s): useState hook in component

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design component props interface (implements ELE-1)
   - [PREP-2] Review shadcn/ui components for UI building blocks (implements ELE-2, ELE-3, ELE-4)
2. Implementation Phase:
   - [IMP-1] Create ChunkSelector component skeleton with props (implements ELE-1)
   - [IMP-2] Add search input with debounce (300ms) (implements ELE-2)
   - [IMP-3] Implement chunk list rendering with ScrollArea (implements ELE-3)
   - [IMP-4] Create ChunkCard sub-component showing title and snippet (implements ELE-4)
   - [IMP-5] Add selection state management with useState (implements ELE-5)
   - [IMP-6] Connect to ChunksService for data fetching (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test search functionality with various queries (validates ELE-2)
   - [VAL-2] Test chunk list rendering with many items (validates ELE-3)
   - [VAL-3] Test selection behavior (click, keyboard) (validates ELE-5)

#### T-3.1.2: Implement Chunk Filtering Controls
- **FR Reference**: FR9.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/chunks/ChunkFilters.tsx`
- **Pattern**: Filter panel with form controls
- **Dependencies**: T-3.1.1
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Add filtering controls for document, category, and quality score

**Components/Elements**:
- [T-3.1.2:ELE-1] ChunkFilters Component: Filter panel with dropdowns and sliders
  - Stubs and Code Location(s): New file `train-wireframe/src/components/chunks/ChunkFilters.tsx`
- [T-3.1.2:ELE-2] Document Filter: Dropdown to filter by source document
  - Stubs and Code Location(s): Select component from UI library
- [T-3.1.2:ELE-3] Category Filter: Multi-select for chunk categories
  - Stubs and Code Location(s): Multi-select or Combobox component
- [T-3.1.2:ELE-4] Quality Score Filter: Slider for minimum quality threshold
  - Stubs and Code Location(s): Slider component from `train-wireframe/src/components/ui/slider.tsx`
- [T-3.1.2:ELE-5] Clear Filters Button: Reset all filters to defaults
  - Stubs and Code Location(s): Button component

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define filter state interface (implements ELE-1)
   - [PREP-2] Identify unique documents from chunks for dropdown (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create ChunkFilters component with filter state (implements ELE-1)
   - [IMP-2] Add document dropdown populated from chunks data (implements ELE-2)
   - [IMP-3] Add category multi-select with checkboxes (implements ELE-3)
   - [IMP-4] Add quality score slider (0-10 range) (implements ELE-4)
   - [IMP-5] Add clear filters button resetting to defaults (implements ELE-5)
   - [IMP-6] Emit filter changes to parent ChunkSelector (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test filter combinations update chunk list (validates ELE-1)
   - [VAL-2] Test clear filters resets all controls (validates ELE-5)

#### T-3.1.3: Create Chunk Detail Preview Panel
- **FR Reference**: FR9.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/chunks/ChunkDetailPanel.tsx`
- **Pattern**: Side panel with tabbed content
- **Dependencies**: T-3.1.1, T-2.1.2
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Display detailed chunk information including dimensions and metadata

**Components/Elements**:
- [T-3.1.3:ELE-1] ChunkDetailPanel Component: Sliding panel with chunk details
  - Stubs and Code Location(s): New file using Sheet component from UI library
- [T-3.1.3:ELE-2] Content Tab: Full chunk content with formatting
  - Stubs and Code Location(s): Tab panel showing markdown-rendered content
- [T-3.1.3:ELE-3] Dimensions Tab: Display 60-dimension analysis
  - Stubs and Code Location(s): Tab panel with dimension visualization
- [T-3.1.3:ELE-4] Metadata Tab: Show document source, categories, quality scores
  - Stubs and Code Location(s): Tab panel with metadata table
- [T-3.1.3:ELE-5] Action Buttons: Select chunk, view document, copy ID
  - Stubs and Code Location(s): Button group at panel footer

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design panel layout and tab structure (implements ELE-1)
   - [PREP-2] Identify dimension visualization approach (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create ChunkDetailPanel using Sheet component (implements ELE-1)
   - [IMP-2] Add Tabs component with three tabs (implements ELE-2, ELE-3, ELE-4)
   - [IMP-3] Implement content tab with syntax highlighting (implements ELE-2)
   - [IMP-4] Implement dimensions tab with bar chart visualization (implements ELE-3)
   - [IMP-5] Implement metadata tab with key-value pairs (implements ELE-4)
   - [IMP-6] Add action buttons for selection and navigation (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test panel opens/closes smoothly (validates ELE-1)
   - [VAL-2] Test tab switching and content display (validates ELE-2, ELE-3, ELE-4)
   - [VAL-3] Test action buttons trigger correct callbacks (validates ELE-5)

---

## 4. Generation Integration with Chunk Context

### T-4.1.0: Context Injection into Generation Prompts
- **FR Reference**: FR9.1.1
- **Impact Weighting**: AI Quality / Contextual Relevance
- **Implementation Location**: `src/lib/generation/`
- **Pattern**: Prompt template with dynamic context insertion
- **Dependencies**: T-2.1.0, T-3.1.0
- **Estimated Human Work Hours**: 10-14 hours
- **Description**: Automatically inject chunk content and metadata into conversation generation prompts
- **Testing Tools**: Jest, Claude API mocks
- **Test Coverage Requirements**: 90% coverage for prompt generation
- **Completes Component?**: Yes - Complete context-aware generation

**Functional Requirements Acceptance Criteria**:
- Chunk content must be inserted into generation prompt at designated placeholder
- Chunk metadata (document title, category) must be included in prompt context
- Prompt must instruct AI to maintain fidelity to chunk content
- Long chunks must be truncated intelligently (preserve first/last paragraphs)
- Multiple chunk references must be supported (up to 3 chunks per conversation)
- Context injection must not exceed Claude's context window limits
- Generated conversations must reference chunk content appropriately
- Audit log must record which chunks were used in generation

#### T-4.1.1: Create PromptContextBuilder Class
- **FR Reference**: FR9.1.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/lib/generation/prompt-context-builder.ts`
- **Pattern**: Builder pattern with fluent interface
- **Dependencies**: T-2.1.1
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Build class responsible for assembling prompt with chunk context

**Components/Elements**:
- [T-4.1.1:ELE-1] PromptContextBuilder Class: Builder with fluent methods
  - Stubs and Code Location(s): New file `src/lib/generation/prompt-context-builder.ts`
- [T-4.1.1:ELE-2] addChunkContext Method: Insert chunk content at placeholder
  - Stubs and Code Location(s): Method in builder class
- [T-4.1.1:ELE-3] addDimensionContext Method: Add dimension metadata
  - Stubs and Code Location(s): Method in builder class
- [T-4.1.1:ELE-4] truncateContent Method: Intelligently truncate long chunks
  - Stubs and Code Location(s): Utility method in builder
- [T-4.1.1:ELE-5] build Method: Assemble final prompt string
  - Stubs and Code Location(s): Terminal method returning string

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing prompt templates (implements ELE-1)
   - [PREP-2] Define chunk context placeholder syntax (implements ELE-2)
   - [PREP-3] Research Claude context window limits (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Create PromptContextBuilder class with constructor (implements ELE-1)
   - [IMP-2] Implement addChunkContext with placeholder replacement (implements ELE-2)
   - [IMP-3] Implement addDimensionContext formatting dimension data (implements ELE-3)
   - [IMP-4] Implement truncateContent with smart paragraph preservation (implements ELE-4)
   - [IMP-5] Implement build method assembling final prompt (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Unit test builder with various chunk sizes (validates ELE-2, ELE-4)
   - [VAL-2] Test dimension context formatting (validates ELE-3)
   - [VAL-3] Verify built prompts are valid and complete (validates ELE-5)

#### T-4.1.2: Integrate Context Builder into Generation Service
- **FR Reference**: FR9.1.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/lib/generation/conversation-generator.ts`
- **Pattern**: Service integration with dependency injection
- **Dependencies**: T-4.1.1
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Update conversation generation service to use chunk context when available

**Components/Elements**:
- [T-4.1.2:ELE-1] Generator Update: Inject PromptContextBuilder into ConversationGenerator
  - Stubs and Code Location(s): Update existing `src/lib/generation/conversation-generator.ts`
- [T-4.1.2:ELE-2] Chunk Detection Logic: Check if conversation has parentChunkId
  - Stubs and Code Location(s): Conditional logic in generate method
- [T-4.1.2:ELE-3] Context Assembly: Call context builder when chunk present
  - Stubs and Code Location(s): Use PromptContextBuilder in generation flow
- [T-4.1.2:ELE-4] Fallback Handling: Generate without context if chunk unavailable
  - Stubs and Code Location(s): Graceful degradation logic

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review current conversation generation flow (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Add PromptContextBuilder dependency to constructor (implements ELE-1)
   - [IMP-2] Add check for parentChunkId in conversation metadata (implements ELE-2)
   - [IMP-3] Fetch chunk and build context when ID present (implements ELE-3)
   - [IMP-4] Preserve existing generation logic as fallback (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test generation with chunk-linked conversation (validates ELE-2, ELE-3)
   - [VAL-2] Test generation without chunk link (validates ELE-4)

---

## 5. Dimension-Driven Parameter Selection

### T-5.1.0: Automatic Parameter Selection from Dimensions
- **FR Reference**: FR9.1.2
- **Impact Weighting**: AI Quality / Automation
- **Implementation Location**: `src/lib/generation/dimension-parameter-mapper.ts`
- **Pattern**: Mapping service with heuristic rules
- **Dependencies**: T-2.1.2
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Automatically select conversation parameters (persona, emotion, etc.) based on chunk dimensions
- **Testing Tools**: Jest with dimension fixtures
- **Test Coverage Requirements**: 85% coverage
- **Completes Component?**: Yes - Complete dimension-driven automation

**Functional Requirements Acceptance Criteria**:
- Semantic dimensions must inform persona selection (map dimensions to persona types)
- Emotion dimensions must inform emotional arc selection
- Complexity dimension must determine target turn count (simple: 6-8, complex: 12-16)
- Domain dimensions must auto-tag conversations with relevant categories
- Confidence scores must be factored into quality scoring (low confidence → needs_revision)
- Mapping must be configurable via rules engine (not hard-coded)
- Dimension analysis must be logged in generation audit
- Users must be able to override dimension-suggested parameters

#### T-5.1.1: Create DimensionParameterMapper Service
- **FR Reference**: FR9.1.2
- **Parent Task**: T-5.1.0
- **Implementation Location**: `src/lib/generation/dimension-parameter-mapper.ts`
- **Pattern**: Strategy pattern with configurable mappings
- **Dependencies**: T-2.1.2
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Service that maps dimension values to conversation generation parameters

**Components/Elements**:
- [T-5.1.1:ELE-1] DimensionParameterMapper Class: Main mapping service
  - Stubs and Code Location(s): New file `src/lib/generation/dimension-parameter-mapper.ts`
- [T-5.1.1:ELE-2] mapPersona Method: Map semantic dimensions to persona
  - Stubs and Code Location(s): Method analyzing semantic dimensions
- [T-5.1.1:ELE-3] mapEmotion Method: Map emotion dimensions to emotional arc
  - Stubs and Code Location(s): Method analyzing emotion dimensions
- [T-5.1.1:ELE-4] mapComplexity Method: Calculate turn count from complexity
  - Stubs and Code Location(s): Method converting complexity score to turn range
- [T-5.1.1:ELE-5] mapCategories Method: Extract categories from domain dimensions
  - Stubs and Code Location(s): Method analyzing domain/topic dimensions

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Document dimension-to-parameter mapping rules (implements ELE-1)
   - [PREP-2] Create mapping configuration structure (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create DimensionParameterMapper class with config (implements ELE-1)
   - [IMP-2] Implement mapPersona using semantic dimension thresholds (implements ELE-2)
   - [IMP-3] Implement mapEmotion using emotion dimension values (implements ELE-3)
   - [IMP-4] Implement mapComplexity with turn count formula (implements ELE-4)
   - [IMP-5] Implement mapCategories extracting top N domain tags (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Unit test each mapping method with known dimensions (validates ELE-2, ELE-3, ELE-4, ELE-5)
   - [VAL-2] Test mapping with various dimension profiles (validates ELE-1)

#### T-5.1.2: Integrate Dimension Mapper into Generation Flow
- **FR Reference**: FR9.1.2
- **Parent Task**: T-5.1.0
- **Implementation Location**: `src/lib/generation/conversation-generator.ts`
- **Pattern**: Service orchestration
- **Dependencies**: T-5.1.1, T-4.1.2
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Use dimension mapper to auto-populate parameters before generation

**Components/Elements**:
- [T-5.1.2:ELE-1] Parameter Auto-Population: Call mapper when chunk dimensions available
  - Stubs and Code Location(s): Logic in ConversationGenerator.generate()
- [T-5.1.2:ELE-2] Parameter Override Support: Allow user parameters to override suggestions
  - Stubs and Code Location(s): Merge logic preferring user input
- [T-5.1.2:ELE-3] Dimension Audit Logging: Record dimension source in generation log
  - Stubs and Code Location(s): Add to generation_logs table entry

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Plan parameter merge strategy (user vs. dimension) (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Check for chunk dimensions in conversation metadata (implements ELE-1)
   - [IMP-2] Call DimensionParameterMapper if dimensions present (implements ELE-1)
   - [IMP-3] Merge suggested parameters with user-provided parameters (implements ELE-2)
   - [IMP-4] Log dimension source and suggested parameters (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test auto-population with dimension data (validates ELE-1)
   - [VAL-2] Test user override preserves user choices (validates ELE-2)
   - [VAL-3] Verify audit logging includes dimension metadata (validates ELE-3)

---

## 6. Quality Scoring Enhancement

### T-6.1.0: Dimension Confidence Integration into Quality Scoring
- **FR Reference**: FR9.1.2
- **Impact Weighting**: Quality Assurance / Data Integrity
- **Implementation Location**: `src/lib/quality/quality-scorer.ts`
- **Pattern**: Composite scoring with weighted factors
- **Dependencies**: T-2.1.2, T-5.1.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Incorporate dimension confidence scores into conversation quality assessment
- **Testing Tools**: Jest with quality scoring fixtures
- **Test Coverage Requirements**: 90% coverage
- **Completes Component?**: Yes - Complete quality scoring with dimension integration

**Functional Requirements Acceptance Criteria**:
- Quality score must include dimension confidence as factor (weight: 15%)
- Low dimension confidence (<0.5) must flag conversation for needs_revision status
- Quality metrics object must include dimension confidence field
- Scoring formula must be documented and configurable
- Quality score must recalculate when dimension data updated
- Dashboard must display dimension confidence in quality breakdown
- Quality reports must segment by dimension confidence levels

#### T-6.1.1: Update QualityScorer with Dimension Confidence
- **FR Reference**: FR9.1.2
- **Parent Task**: T-6.1.0
- **Implementation Location**: `src/lib/quality/quality-scorer.ts`
- **Pattern**: Extend existing scorer with new factor
- **Dependencies**: T-2.1.2
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Add dimension confidence as weighted factor in quality scoring algorithm

**Components/Elements**:
- [T-6.1.1:ELE-1] Confidence Score Factor: New scoring component for dimension confidence
  - Stubs and Code Location(s): Method in QualityScorer class
- [T-6.1.1:ELE-2] Weight Configuration: Configurable weight for confidence factor
  - Stubs and Code Location(s): Configuration object in scorer
- [T-6.1.1:ELE-3] Quality Metrics Update: Add confidence to QualityMetrics type
  - Stubs and Code Location(s): Update `train-wireframe/src/lib/types.ts:14-24`
- [T-6.1.1:ELE-4] Low Confidence Flagging: Auto-flag conversations with low confidence
  - Stubs and Code Location(s): Logic setting needs_revision status

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review current quality scoring formula (implements ELE-1)
   - [PREP-2] Determine appropriate weight for confidence factor (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Add calculateConfidenceScore method (implements ELE-1)
   - [IMP-2] Add CONFIDENCE_WEIGHT to configuration (default 0.15) (implements ELE-2)
   - [IMP-3] Update QualityMetrics type with confidence field (implements ELE-3)
   - [IMP-4] Integrate confidence score into overall quality calculation (implements ELE-1)
   - [IMP-5] Add flagging logic for confidence < 0.5 threshold (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test quality score changes with different confidence values (validates ELE-1)
   - [VAL-2] Test low confidence triggers needs_revision (validates ELE-4)
   - [VAL-3] Verify quality metrics object includes confidence (validates ELE-3)

---

## 7. UI Enhancements for Chunk Integration

### T-7.1.0: Conversation Detail View Chunk Display
- **FR Reference**: FR9.1.1
- **Impact Weighting**: User Experience / Transparency
- **Implementation Location**: `train-wireframe/src/components/conversation/`
- **Pattern**: Enhanced detail view with linked data
- **Dependencies**: T-3.1.3
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Display linked chunk metadata in conversation detail modal
- **Testing Tools**: React Testing Library
- **Test Coverage Requirements**: 75% component coverage
- **Completes Component?**: Yes - Complete conversation-chunk display

**Functional Requirements Acceptance Criteria**:
- Conversation detail must show linked chunk card (if chunk linked)
- Chunk card must display chunk title, snippet, and document source
- Click on chunk card must open chunk detail panel
- Unlink button must allow removing chunk association
- Orphaned conversation indicator must be visible when no chunk linked
- Dimension data must be visible in metadata section
- Link chunk button must open chunk selector modal

#### T-7.1.1: Add Chunk Reference Section to Conversation Detail
- **FR Reference**: FR9.1.1
- **Parent Task**: T-7.1.0
- **Implementation Location**: `train-wireframe/src/components/conversation/ConversationDetailModal.tsx`
- **Pattern**: Conditional rendering based on chunk presence
- **Dependencies**: T-3.1.3
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Add section showing linked chunk in conversation detail view

**Components/Elements**:
- [T-7.1.1:ELE-1] Chunk Reference Section: Collapsible section in detail modal
  - Stubs and Code Location(s): New section in existing ConversationDetailModal
- [T-7.1.1:ELE-2] Linked Chunk Card: Mini card showing chunk info
  - Stubs and Code Location(s): Card component with chunk metadata
- [T-7.1.1:ELE-3] Unlink Button: Remove chunk association action
  - Stubs and Code Location(s): Button triggering unlink API call
- [T-7.1.1:ELE-4] Orphaned Indicator: Badge showing "No Source Chunk"
  - Stubs and Code Location(s): Conditional Badge component

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design chunk reference section layout (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Add "Source Chunk" collapsible section to detail modal (implements ELE-1)
   - [IMP-2] Conditionally render chunk card when parentChunkId present (implements ELE-2)
   - [IMP-3] Add unlink button with confirmation dialog (implements ELE-3)
   - [IMP-4] Show orphaned indicator when no chunk linked (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test display with chunk-linked conversation (validates ELE-2)
   - [VAL-2] Test display with orphaned conversation (validates ELE-4)
   - [VAL-3] Test unlink action removes association (validates ELE-3)

#### T-7.1.2: Add "Link Chunk" Action to Conversation Table
- **FR Reference**: FR9.1.1
- **Parent Task**: T-7.1.0
- **Implementation Location**: `train-wireframe/src/components/dashboard/ConversationTable.tsx`
- **Pattern**: Dropdown menu item action
- **Dependencies**: T-3.1.1
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Add menu item to link/change chunk from conversation table dropdown

**Components/Elements**:
- [T-7.1.2:ELE-1] Link Chunk Menu Item: New action in conversation dropdown
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/ConversationTable.tsx:275-305`
- [T-7.1.2:ELE-2] Chunk Selector Modal: Open ChunkSelector on action click
  - Stubs and Code Location(s): Modal state management
- [T-7.1.2:ELE-3] Link Update: Update conversation with selected chunk ID
  - Stubs and Code Location(s): API call to update conversation

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review dropdown menu structure (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Add "Link to Chunk" menu item in dropdown (implements ELE-1)
   - [IMP-2] Add modal state for chunk selector (implements ELE-2)
   - [IMP-3] Open ChunkSelector modal on action click (implements ELE-2)
   - [IMP-4] Handle chunk selection and update conversation (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test menu item opens chunk selector (validates ELE-2)
   - [VAL-2] Test chunk selection updates conversation (validates ELE-3)

### T-7.2.0: Dashboard Chunk Linkage Statistics
- **FR Reference**: FR9.1.1
- **Impact Weighting**: Visibility / Workflow Monitoring
- **Implementation Location**: `train-wireframe/src/components/dashboard/DashboardView.tsx`
- **Pattern**: Stats card with metrics
- **Dependencies**: T-1.1.3
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Add dashboard stat card showing chunk linkage completion
- **Testing Tools**: React Testing Library
- **Test Coverage Requirements**: 70% component coverage
- **Completes Component?**: Yes - Dashboard chunk stats

**Functional Requirements Acceptance Criteria**:
- Stats card must show "Chunk Linkage" metric
- Display percentage of conversations with chunk links
- Show count: "X of Y conversations linked"
- Color-code based on completeness (red <50%, yellow 50-80%, green >80%)
- Click card to filter dashboard to orphaned conversations
- Tooltip must explain importance of chunk linking

#### T-7.2.1: Add Chunk Linkage Stat Card
- **FR Reference**: FR9.1.1
- **Parent Task**: T-7.2.0
- **Implementation Location**: `train-wireframe/src/components/dashboard/DashboardView.tsx:104-161`
- **Pattern**: Stat card component
- **Dependencies**: T-1.1.3
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Create new stat card in dashboard showing chunk linkage percentage

**Components/Elements**:
- [T-7.2.1:ELE-1] Stat Card Component: Card showing chunk linkage metric
  - Stubs and Code Location(s): New Card in stats grid
- [T-7.2.1:ELE-2] Linkage Calculation: Calculate linked vs. orphaned count
  - Stubs and Code Location(s): useMemo hook computing statistics
- [T-7.2.1:ELE-3] Click Handler: Filter to orphaned conversations on click
  - Stubs and Code Location(s): onClick handler setting filter state

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review stats card structure in dashboard (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Add new stat card to grid (5th card) (implements ELE-1)
   - [IMP-2] Calculate linked/orphaned counts from conversations (implements ELE-2)
   - [IMP-3] Display percentage and counts in card (implements ELE-1)
   - [IMP-4] Add color coding based on percentage (implements ELE-1)
   - [IMP-5] Add click handler filtering to orphaned (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test stat calculation with various data (validates ELE-2)
   - [VAL-2] Test click filters correctly (validates ELE-3)

---

## 8. API Endpoints

### T-8.1.0: Chunk Association API Endpoints
- **FR Reference**: FR9.1.1
- **Impact Weighting**: Backend Functionality / Integration
- **Implementation Location**: `src/app/api/conversations/chunks/`
- **Pattern**: Next.js API routes with validation
- **Dependencies**: T-1.1.0, T-2.1.0
- **Estimated Human Work Hours**: 10-12 hours
- **Description**: Create API endpoints for chunk association operations
- **Testing Tools**: Postman, Jest integration tests
- **Test Coverage Requirements**: 85% endpoint coverage
- **Completes Component?**: Yes - Complete chunk association API

**Functional Requirements Acceptance Criteria**:
- POST /api/conversations/:id/link-chunk endpoint to create association
- DELETE /api/conversations/:id/unlink-chunk endpoint to remove association
- GET /api/conversations/by-chunk/:chunkId endpoint to query conversations by chunk
- GET /api/conversations/orphaned endpoint to list conversations without chunks
- All endpoints must validate chunk existence before linking
- Endpoints must return updated conversation with chunk metadata
- Error handling must provide clear messages for invalid operations
- Endpoints must enforce authentication and authorization

#### T-8.1.1: Create Link Chunk Endpoint
- **FR Reference**: FR9.1.1
- **Parent Task**: T-8.1.0
- **Implementation Location**: `src/app/api/conversations/[id]/link-chunk/route.ts`
- **Pattern**: Next.js API route with POST handler
- **Dependencies**: T-1.1.3, T-2.1.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Endpoint to link conversation to chunk

**Components/Elements**:
- [T-8.1.1:ELE-1] POST Handler: Handle link chunk request
  - Stubs and Code Location(s): New route file
- [T-8.1.1:ELE-2] Request Validation: Validate chunk ID and conversation ID
  - Stubs and Code Location(s): Zod schema validation
- [T-8.1.1:ELE-3] Chunk Existence Check: Verify chunk exists before linking
  - Stubs and Code Location(s): ChunksService.getChunkById()
- [T-8.1.1:ELE-4] Database Update: Update conversation with chunk ID
  - Stubs and Code Location(s): Database service updateConversation()
- [T-8.1.1:ELE-5] Response: Return updated conversation with chunk metadata
  - Stubs and Code Location(s): JSON response with 200 status

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define request/response schemas (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create route file with POST handler (implements ELE-1)
   - [IMP-2] Add Zod schema validating chunkId (implements ELE-2)
   - [IMP-3] Check chunk exists using ChunksService (implements ELE-3)
   - [IMP-4] Update conversation with parent_chunk_id (implements ELE-4)
   - [IMP-5] Fetch and return updated conversation with chunk (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test valid link request succeeds (validates ELE-4, ELE-5)
   - [VAL-2] Test invalid chunk ID returns 404 (validates ELE-3)
   - [VAL-3] Test authentication required (validates ELE-1)

#### T-8.1.2: Create Unlink Chunk Endpoint
- **FR Reference**: FR9.1.1
- **Parent Task**: T-8.1.0
- **Implementation Location**: `src/app/api/conversations/[id]/unlink-chunk/route.ts`
- **Pattern**: Next.js API route with DELETE handler
- **Dependencies**: T-1.1.3
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Endpoint to remove chunk association from conversation

**Components/Elements**:
- [T-8.1.2:ELE-1] DELETE Handler: Handle unlink request
  - Stubs and Code Location(s): New route file
- [T-8.1.2:ELE-2] Database Update: Set parent_chunk_id to NULL
  - Stubs and Code Location(s): Database service updateConversation()
- [T-8.1.2:ELE-3] Response: Return updated conversation
  - Stubs and Code Location(s): JSON response with 200 status

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review conversation update patterns (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create route file with DELETE handler (implements ELE-1)
   - [IMP-2] Update conversation setting parent_chunk_id to null (implements ELE-2)
   - [IMP-3] Return updated conversation object (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test unlink removes association (validates ELE-2)
   - [VAL-2] Test response includes updated conversation (validates ELE-3)

#### T-8.1.3: Create Get Conversations by Chunk Endpoint
- **FR Reference**: FR9.1.1
- **Parent Task**: T-8.1.0
- **Implementation Location**: `src/app/api/conversations/by-chunk/[chunkId]/route.ts`
- **Pattern**: Next.js API route with GET handler
- **Dependencies**: T-1.1.3
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Endpoint to retrieve all conversations linked to specific chunk

**Components/Elements**:
- [T-8.1.3:ELE-1] GET Handler: Handle query by chunk ID
  - Stubs and Code Location(s): New route file
- [T-8.1.3:ELE-2] Database Query: Query conversations with matching parent_chunk_id
  - Stubs and Code Location(s): Database service getConversationsByChunk()
- [T-8.1.3:ELE-3] Response: Return array of conversations
  - Stubs and Code Location(s): JSON array response

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Verify database query method exists (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create route file with GET handler (implements ELE-1)
   - [IMP-2] Call getConversationsByChunk with chunk ID (implements ELE-2)
   - [IMP-3] Return conversations array (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test returns correct conversations (validates ELE-2)
   - [VAL-2] Test empty array for chunk with no conversations (validates ELE-3)

#### T-8.1.4: Create Get Orphaned Conversations Endpoint
- **FR Reference**: FR9.1.1
- **Parent Task**: T-8.1.0
- **Implementation Location**: `src/app/api/conversations/orphaned/route.ts`
- **Pattern**: Next.js API route with GET handler
- **Dependencies**: T-1.1.3
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Endpoint to retrieve conversations without chunk links

**Components/Elements**:
- [T-8.1.4:ELE-1] GET Handler: Handle orphaned query
  - Stubs and Code Location(s): New route file
- [T-8.1.4:ELE-2] Database Query: Query conversations with NULL parent_chunk_id
  - Stubs and Code Location(s): Database service getOrphanedConversations()
- [T-8.1.4:ELE-3] Response: Return array of orphaned conversations
  - Stubs and Code Location(s): JSON array response

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Verify orphaned query method exists (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create route file with GET handler (implements ELE-1)
   - [IMP-2] Call getOrphanedConversations() (implements ELE-2)
   - [IMP-3] Return orphaned conversations array (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test returns only orphaned conversations (validates ELE-2)
   - [VAL-2] Test performance with large dataset (validates ELE-2)

---

## 9. Testing & Quality Assurance

### T-9.1.0: Unit Tests for Chunk Integration
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Quality Assurance / Reliability
- **Implementation Location**: `src/__tests__/`, `train-wireframe/src/__tests__/`
- **Pattern**: Jest unit tests with mocks
- **Dependencies**: All previous tasks
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Comprehensive unit test suite for chunk integration features
- **Testing Tools**: Jest, React Testing Library
- **Test Coverage Requirements**: 85% overall coverage
- **Completes Component?**: Yes - Complete test coverage

**Functional Requirements Acceptance Criteria**:
- All service classes must have unit tests (ChunksService, DimensionParser, etc.)
- All React components must have component tests
- All API endpoints must have integration tests
- Tests must cover success and error scenarios
- Tests must validate type safety and data integrity
- Mock data must represent realistic chunk/dimension structures
- Test suite must run in under 2 minutes
- All tests must pass before merging

#### T-9.1.1: Write ChunksService Unit Tests
- **FR Reference**: FR9.1.1
- **Parent Task**: T-9.1.0
- **Implementation Location**: `src/__tests__/chunks-integration/chunks-service.test.ts`
- **Pattern**: Jest test suite with Supabase mocks
- **Dependencies**: T-2.1.1
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Test all ChunksService methods

**Components/Elements**:
- [T-9.1.1:ELE-1] Test Suite Setup: Mock Supabase client
  - Stubs and Code Location(s): beforeEach setup with mocks
- [T-9.1.1:ELE-2] getChunkById Tests: Test single chunk retrieval
  - Stubs and Code Location(s): Test cases for success and not found
- [T-9.1.1:ELE-3] getChunksByDocument Tests: Test document filtering
  - Stubs and Code Location(s): Test cases with various filters
- [T-9.1.1:ELE-4] getDimensionsForChunk Tests: Test dimension queries
  - Stubs and Code Location(s): Test cases verifying dimension data
- [T-9.1.1:ELE-5] searchChunks Tests: Test text search
  - Stubs and Code Location(s): Test cases with search queries

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Create mock chunk data fixtures (implements ELE-1)
   - [PREP-2] Set up Supabase client mock (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Write getChunkById test cases (implements ELE-2)
   - [IMP-2] Write getChunksByDocument test cases (implements ELE-3)
   - [IMP-3] Write getDimensionsForChunk test cases (implements ELE-4)
   - [IMP-4] Write searchChunks test cases (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Run tests and verify all pass (validates all elements)
   - [VAL-2] Check coverage meets 85% threshold (validates all elements)

#### T-9.1.2: Write DimensionParser Unit Tests
- **FR Reference**: FR9.1.2
- **Parent Task**: T-9.1.0
- **Implementation Location**: `src/__tests__/chunks-integration/dimension-parser.test.ts`
- **Pattern**: Jest test suite with dimension fixtures
- **Dependencies**: T-2.1.2
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Test dimension parsing and extraction logic

**Components/Elements**:
- [T-9.1.2:ELE-1] parse Tests: Test dimension data parsing
  - Stubs and Code Location(s): Test cases with various dimension structures
- [T-9.1.2:ELE-2] extractSemanticDimensions Tests: Test semantic extraction
  - Stubs and Code Location(s): Test cases verifying correct persona mapping
- [T-9.1.2:ELE-3] calculateComplexityScore Tests: Test complexity calculation
  - Stubs and Code Location(s): Test cases with known complexity values
- [T-9.1.2:ELE-4] validateDimensionConfidence Tests: Test confidence validation
  - Stubs and Code Location(s): Test cases with various confidence levels

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Create dimension data fixtures (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Write parse test cases (implements ELE-1)
   - [IMP-2] Write extractSemanticDimensions test cases (implements ELE-2)
   - [IMP-3] Write calculateComplexityScore test cases (implements ELE-3)
   - [IMP-4] Write validateDimensionConfidence test cases (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Run tests and verify all pass (validates all elements)

#### T-9.1.3: Write ChunkSelector Component Tests
- **FR Reference**: FR9.1.1
- **Parent Task**: T-9.1.0
- **Implementation Location**: `train-wireframe/src/__tests__/components/chunks/ChunkSelector.test.tsx`
- **Pattern**: React Testing Library component tests
- **Dependencies**: T-3.1.1
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Test ChunkSelector component behavior

**Components/Elements**:
- [T-9.1.3:ELE-1] Rendering Tests: Test component renders correctly
  - Stubs and Code Location(s): Test cases verifying UI elements
- [T-9.1.3:ELE-2] Search Tests: Test search input and debounce
  - Stubs and Code Location(s): Test cases simulating user input
- [T-9.1.3:ELE-3] Selection Tests: Test chunk selection behavior
  - Stubs and Code Location(s): Test cases clicking chunks
- [T-9.1.3:ELE-4] Filter Tests: Test filter interactions
  - Stubs and Code Location(s): Test cases using filters

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up React Testing Library utilities (implements ELE-1)
   - [PREP-2] Create component test fixtures (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Write rendering test cases (implements ELE-1)
   - [IMP-2] Write search test cases with debounce (implements ELE-2)
   - [IMP-3] Write selection test cases (implements ELE-3)
   - [IMP-4] Write filter interaction test cases (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Run component tests and verify all pass (validates all elements)

#### T-9.1.4: Write API Endpoint Integration Tests
- **FR Reference**: FR9.1.1
- **Parent Task**: T-9.1.0
- **Implementation Location**: `src/__tests__/api/conversations/chunks.test.ts`
- **Pattern**: API integration tests with test database
- **Dependencies**: T-8.1.0
- **Estimated Human Work Hours**: 5-6 hours
- **Description**: Test chunk association API endpoints

**Components/Elements**:
- [T-9.1.4:ELE-1] Link Chunk Endpoint Tests: Test POST link-chunk
  - Stubs and Code Location(s): Test cases for successful and failed links
- [T-9.1.4:ELE-2] Unlink Chunk Endpoint Tests: Test DELETE unlink-chunk
  - Stubs and Code Location(s): Test cases for unlinking
- [T-9.1.4:ELE-3] Get by Chunk Endpoint Tests: Test GET by-chunk
  - Stubs and Code Location(s): Test cases querying conversations
- [T-9.1.4:ELE-4] Get Orphaned Endpoint Tests: Test GET orphaned
  - Stubs and Code Location(s): Test cases for orphaned query

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up test database with fixtures (implements ELE-1)
   - [PREP-2] Configure API testing utilities (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Write link-chunk endpoint tests (implements ELE-1)
   - [IMP-2] Write unlink-chunk endpoint tests (implements ELE-2)
   - [IMP-3] Write by-chunk endpoint tests (implements ELE-3)
   - [IMP-4] Write orphaned endpoint tests (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Run integration tests against test database (validates all elements)
   - [VAL-2] Verify database state after operations (validates ELE-1, ELE-2)

### T-9.2.0: End-to-End Testing
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Quality Assurance / User Experience
- **Implementation Location**: `e2e/chunks-integration/`
- **Pattern**: Playwright E2E tests
- **Dependencies**: All previous tasks
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: End-to-end user workflow tests for chunk integration
- **Testing Tools**: Playwright
- **Test Coverage Requirements**: Critical user paths covered
- **Completes Component?**: Yes - Complete E2E test coverage

**Functional Requirements Acceptance Criteria**:
- Test complete workflow: select chunk → link to conversation → generate
- Test chunk selector UI interactions
- Test orphaned conversation flagging
- Test dimension-driven parameter auto-population
- Test quality score changes with dimension confidence
- Tests must run in headless mode
- Tests must pass on CI/CD pipeline
- Tests must include screenshot capture on failure

#### T-9.2.1: Create Chunk Selection E2E Test
- **FR Reference**: FR9.1.1
- **Parent Task**: T-9.2.0
- **Implementation Location**: `e2e/chunks-integration/chunk-selection.spec.ts`
- **Pattern**: Playwright test spec
- **Dependencies**: T-3.1.0
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Test end-to-end chunk selection workflow

**Components/Elements**:
- [T-9.2.1:ELE-1] Search and Select Test: Test searching and selecting chunk
  - Stubs and Code Location(s): Playwright test steps
- [T-9.2.1:ELE-2] Link Chunk Test: Test linking chunk to conversation
  - Stubs and Code Location(s): Playwright test steps
- [T-9.2.1:ELE-3] View Linked Chunk Test: Test viewing chunk from conversation
  - Stubs and Code Location(s): Playwright test steps
- [T-9.2.1:ELE-4] Unlink Chunk Test: Test unlinking chunk
  - Stubs and Code Location(s): Playwright test steps

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up Playwright configuration (implements ELE-1)
   - [PREP-2] Create test data fixtures (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Write search and select test (implements ELE-1)
   - [IMP-2] Write link chunk test (implements ELE-2)
   - [IMP-3] Write view linked chunk test (implements ELE-3)
   - [IMP-4] Write unlink chunk test (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Run E2E tests in headed mode (validates all elements)
   - [VAL-2] Run E2E tests in CI/CD pipeline (validates all elements)

---

## 10. Documentation & Training

### T-10.1.0: Technical Documentation
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Knowledge Transfer / Maintainability
- **Implementation Location**: `docs/chunks-integration/`
- **Pattern**: Markdown documentation
- **Dependencies**: All previous tasks
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Comprehensive technical documentation for chunk integration features
- **Testing Tools**: Documentation review
- **Test Coverage Requirements**: All features documented
- **Completes Component?**: Yes - Complete technical documentation

**Functional Requirements Acceptance Criteria**:
- Architecture overview documenting chunk integration design
- API reference for all chunk-related endpoints
- Database schema documentation with ER diagrams
- Component documentation for UI elements
- Integration guide for dimension-driven generation
- Troubleshooting guide for common issues
- Code examples for developers
- Documentation must be reviewed and approved

#### T-10.1.1: Write Architecture Documentation
- **FR Reference**: FR9.1.1, FR9.1.2
- **Parent Task**: T-10.1.0
- **Implementation Location**: `docs/chunks-integration/architecture.md`
- **Pattern**: Technical architecture document
- **Dependencies**: All previous tasks
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Document system architecture for chunk integration

**Components/Elements**:
- [T-10.1.1:ELE-1] System Overview: High-level architecture diagram
  - Stubs and Code Location(s): Mermaid diagram in markdown
- [T-10.1.1:ELE-2] Data Flow: Document data flow from chunks to conversations
  - Stubs and Code Location(s): Sequence diagrams
- [T-10.1.1:ELE-3] Component Descriptions: Describe each major component
  - Stubs and Code Location(s): Component sections in document
- [T-10.1.1:ELE-4] Integration Points: Document integration with chunks-alpha
  - Stubs and Code Location(s): Integration section

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Gather system diagrams and component info (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create system overview with diagram (implements ELE-1)
   - [IMP-2] Document data flow with sequence diagrams (implements ELE-2)
   - [IMP-3] Write component descriptions (implements ELE-3)
   - [IMP-4] Document integration points (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Technical review by engineering team (validates all elements)

#### T-10.1.2: Write User Guide
- **FR Reference**: FR9.1.1
- **Parent Task**: T-10.1.0
- **Implementation Location**: `docs/chunks-integration/user-guide.md`
- **Pattern**: User-facing documentation
- **Dependencies**: All UI tasks
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Guide for users on linking chunks to conversations

**Components/Elements**:
- [T-10.1.2:ELE-1] Getting Started: Introduction to chunk linking
  - Stubs and Code Location(s): Getting started section
- [T-10.1.2:ELE-2] Step-by-Step Guide: How to select and link chunks
  - Stubs and Code Location(s): Tutorial with screenshots
- [T-10.1.2:ELE-3] Best Practices: Recommendations for chunk selection
  - Stubs and Code Location(s): Best practices section
- [T-10.1.2:ELE-4] FAQ: Common questions and troubleshooting
  - Stubs and Code Location(s): FAQ section

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Take screenshots of chunk selector UI (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Write getting started section (implements ELE-1)
   - [IMP-2] Create step-by-step tutorial with screenshots (implements ELE-2)
   - [IMP-3] Document best practices (implements ELE-3)
   - [IMP-4] Compile FAQ (implements ELE-4)
3. Validation Phase:
   - [VAL-1] User testing with documentation (validates all elements)

---

## 11. Deployment & Release

### T-11.1.0: Production Deployment
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Operational Readiness
- **Implementation Location**: CI/CD pipeline, production environment
- **Pattern**: Staged deployment with validation
- **Dependencies**: All previous tasks
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Deploy chunk integration features to production
- **Testing Tools**: Smoke tests, monitoring tools
- **Test Coverage Requirements**: All critical paths tested in production
- **Completes Component?**: Yes - Production deployment complete

**Functional Requirements Acceptance Criteria**:
- Database migrations run successfully on production
- All API endpoints accessible and functional
- UI components render correctly in production
- Performance metrics within acceptable ranges
- No breaking changes to existing functionality
- Rollback plan documented and tested
- Feature flags enabled for gradual rollout
- Monitoring and alerting configured

#### T-11.1.1: Run Database Migrations
- **FR Reference**: FR9.1.1
- **Parent Task**: T-11.1.0
- **Implementation Location**: Production database
- **Pattern**: Staged migration with backup
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Execute database schema changes in production

**Components/Elements**:
- [T-11.1.1:ELE-1] Database Backup: Full backup before migration
  - Stubs and Code Location(s): Backup script
- [T-11.1.1:ELE-2] Migration Execution: Run migration script
  - Stubs and Code Location(s): Supabase migration command
- [T-11.1.1:ELE-3] Validation: Verify schema changes
  - Stubs and Code Location(s): SQL query verification
- [T-11.1.1:ELE-4] Rollback Test: Test rollback capability
  - Stubs and Code Location(s): Down migration test

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Schedule maintenance window (implements ELE-1)
   - [PREP-2] Notify stakeholders (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Execute full database backup (implements ELE-1)
   - [IMP-2] Run migration script (implements ELE-2)
   - [IMP-3] Verify schema changes with SQL queries (implements ELE-3)
   - [IMP-4] Test rollback script (do not execute) (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Query new tables and columns (validates ELE-3)
   - [VAL-2] Verify foreign keys and indexes (validates ELE-3)

#### T-11.1.2: Deploy Application Code
- **FR Reference**: FR9.1.1, FR9.1.2
- **Parent Task**: T-11.1.0
- **Implementation Location**: Production deployment
- **Pattern**: Blue-green deployment
- **Dependencies**: T-11.1.1, all code tasks
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Deploy updated application with chunk integration features

**Components/Elements**:
- [T-11.1.2:ELE-1] Build Production Bundle: Compile and optimize code
  - Stubs and Code Location(s): Build script
- [T-11.1.2:ELE-2] Deploy to Staging: Test in staging environment
  - Stubs and Code Location(s): Deployment script
- [T-11.1.2:ELE-3] Smoke Tests: Run critical path tests
  - Stubs and Code Location(s): Smoke test suite
- [T-11.1.2:ELE-4] Production Deployment: Deploy to production
  - Stubs and Code Location(s): Production deployment script
- [T-11.1.2:ELE-5] Monitor: Watch for errors and performance issues
  - Stubs and Code Location(s): Monitoring dashboard

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review deployment checklist (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Build production bundle (implements ELE-1)
   - [IMP-2] Deploy to staging environment (implements ELE-2)
   - [IMP-3] Run smoke tests in staging (implements ELE-3)
   - [IMP-4] Deploy to production using blue-green (implements ELE-4)
   - [IMP-5] Monitor error rates and performance (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Verify all features functional in production (validates ELE-4)
   - [VAL-2] Check monitoring dashboards (validates ELE-5)

---

## Summary

**Total Tasks:** 58 tasks (11 main tasks, 47 sub-tasks)

**Task Breakdown by Category:**
- Foundation & Infrastructure: 3 main tasks, 9 sub-tasks
- Chunks-Alpha Integration: 2 main tasks, 9 sub-tasks
- UI Components: 3 main tasks, 8 sub-tasks
- Generation Integration: 1 main task, 2 sub-tasks
- Dimension-Driven Features: 1 main task, 2 sub-tasks
- Quality Scoring: 1 main task, 1 sub-task
- API Endpoints: 1 main task, 4 sub-tasks
- Testing: 2 main tasks, 8 sub-tasks
- Documentation: 1 main task, 2 sub-tasks
- Deployment: 1 main task, 2 sub-tasks

**Estimated Timeline:**
- Foundation & Infrastructure: 2 weeks
- Integration Layer & UI: 3 weeks
- Generation & Quality: 1.5 weeks
- Testing & QA: 1.5 weeks
- Documentation & Deployment: 1 week
- **Total: 9 weeks (allowing for overlap and parallelization)**

**Critical Path Dependencies:**
1. T-1.1.0 (Database Schema) → T-2.1.0 (Chunks Service) → T-3.1.0 (UI Components)
2. T-2.1.0 → T-4.1.0 (Context Injection) → T-5.1.0 (Dimension Mapping)
3. All development → T-9.1.0 (Testing) → T-11.1.0 (Deployment)

**Risk Mitigation:**
- Early integration testing to catch interface issues
- Incremental feature flag rollout for safer production deployment
- Comprehensive test coverage before production
- Clear rollback procedures documented

**Success Criteria:**
- All 58 tasks completed and validated
- 85%+ test coverage achieved
- Production deployment successful
- No P1/P2 bugs in first week post-launch
- User feedback positive on chunk integration workflow
- Performance targets met (query times, page load times)

This comprehensive task inventory provides a complete roadmap for implementing FR9.1.1 (Conversation to Chunk Association) and FR9.1.2 (Dimension-Driven Generation), transforming the wireframe implementation into a production-ready system with full chunks-alpha module integration.

