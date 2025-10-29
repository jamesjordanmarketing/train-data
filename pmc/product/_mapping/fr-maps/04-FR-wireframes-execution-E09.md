# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E09)

**Generated**: 2025-01-29  
**Segment**: E09 - Chunks-Alpha Module Integration  
**Total Prompts**: 6  
**Estimated Implementation Time**: 32-40 hours

## Executive Summary

This execution segment implements the critical integration between the conversation generation system and the chunks-alpha module, enabling conversations to be linked to source document chunks and leveraging the 60-dimension semantic analysis to drive intelligent conversation generation. This integration transforms the conversation generation system from standalone operation to a context-aware, dimension-driven platform that produces higher quality, more relevant training conversations.

**Strategic Importance:**
- **Traceability**: Every conversation can be traced back to its source document chunk, enabling audit trails and content verification
- **Quality Enhancement**: Semantic dimensions inform persona selection, emotion arcs, and complexity levels, improving conversation relevance
- **Automation**: Dimension-driven parameter selection reduces manual configuration while increasing contextual accuracy
- **Scalability**: Chunk-based generation enables systematic processing of large document corpora

**Key Deliverables:**
1. Database schema extensions for conversation-chunk associations
2. Chunks integration service layer with caching
3. Chunk selector UI component with search and filtering
4. Context injection into generation prompts
5. Dimension-driven parameter mapping
6. Enhanced quality scoring with dimension confidence
7. API endpoints for chunk association operations
8. Comprehensive testing and documentation

## Context and Dependencies

### Previous Segment Deliverables

**E08 Segment (Assumed Complete):**
Based on the execution prompt template reference, E08 likely implemented:
- Core conversation generation workflow
- Template management system
- Single and batch generation capabilities
- Quality validation framework
- Basic dashboard and review interfaces

**Foundation Established:**
- Conversations table with metadata fields
- Conversation generation API endpoints
- Template-based prompt system
- Quality scoring engine
- UI components for conversation management

### Current Codebase State

**Existing Infrastructure:**
```
train-wireframe/src/
├── components/
│   ├── dashboard/         # ConversationTable, FilterBar, DashboardView
│   ├── generation/        # BatchGenerationModal, SingleGenerationForm
│   ├── views/            # TemplatesView, ScenariosView, ReviewQueueView
│   └── ui/               # Shadcn/UI component library
├── stores/
│   └── useAppStore.ts    # Zustand state management
└── lib/
    └── types.ts          # TypeScript type definitions

src/lib/
├── chunk-service.ts          # Existing chunk data access
├── dimension-service.ts      # Existing dimension data access
├── database.ts               # Supabase database service
└── dimension-generation/
    └── generator.ts         # Dimension generation logic
```

**Key Existing Types:**
- `Conversation` (types.ts:29-46) - Core conversation entity with parentId field
- `QualityMetrics` (types.ts:14-24) - Quality assessment structure
- `Template` (types.ts:64-73) - Template structure with variables
- Existing chunk and dimension services in main codebase

### Cross-Segment Dependencies

**External Module Dependencies:**
1. **Chunks-Alpha Module**: Must query chunks table, chunk_dimensions table
2. **Document Categorization**: Conversations link to documents via chunks
3. **Dimension Generation**: Leverages existing 60-dimension analysis

**Internal Dependencies:**
1. **Database Layer**: Extend conversations table with chunk association fields
2. **Generation Engine**: Modify prompt building to inject chunk context
3. **Quality System**: Extend scoring to include dimension confidence
4. **UI Components**: Enhance existing dashboard with chunk selector

## Implementation Strategy

### Risk Assessment

**High-Risk Areas:**
1. **Database Schema Changes** (Risk: Medium)
   - Mitigation: Use migrations with rollback capability, test on staging first
   - Impact: Foreign key relationships must not break existing conversations

2. **Chunk Data Access Performance** (Risk: Medium)
   - Mitigation: Implement caching layer, use database indexes
   - Impact: Slow chunk queries could delay generation workflows

3. **Dimension Mapping Logic** (Risk: Low-Medium)
   - Mitigation: Extensive testing with sample dimensions, configurable mapping rules
   - Impact: Incorrect mappings could produce poor quality conversations

4. **Integration Complexity** (Risk: Medium)
   - Mitigation: Incremental integration, extensive testing at each stage
   - Impact: Multiple system touchpoints require careful coordination

### Prompt Sequencing Logic

**Prompt 1: Foundation - Database Schema & Type Extensions**
- **Why First**: All subsequent work depends on database structure and TypeScript types
- **Complexity**: Low-Medium (well-defined schema changes)
- **Risk**: Medium (database changes require careful migration)

**Prompt 2: Chunks Integration Service Layer**
- **Why Second**: Service layer must exist before UI or generation integration
- **Complexity**: Medium (service classes, caching, error handling)
- **Risk**: Medium (performance and reliability critical)

**Prompt 3: Chunk Selector UI Component**
- **Why Third**: UI allows manual testing of service layer
- **Complexity**: Medium-High (complex UI with search, filtering, preview)
- **Risk**: Low (isolated component, primarily UI logic)

**Prompt 4: Generation Integration & Context Injection**
- **Why Fourth**: Core value delivery, builds on service layer
- **Complexity**: Medium (prompt template modification, parameter injection)
- **Risk**: Medium (impacts conversation quality)

**Prompt 5: Dimension-Driven Parameters & Quality Enhancement**
- **Why Fifth**: Advanced features that enhance but don't break base functionality
- **Complexity**: Medium-High (mapping logic, quality algorithm updates)
- **Risk**: Low-Medium (can be iterated based on results)

**Prompt 6: API Endpoints, Testing & Documentation**
- **Why Last**: Integration layer, testing validates all prior work
- **Complexity**: Medium (API routes, test suites, documentation)
- **Risk**: Low (mostly integration and validation work)

### Quality Assurance Approach

**Per-Prompt Validation:**
1. TypeScript compilation must pass with zero errors
2. Manual testing of implemented features before proceeding
3. Database queries must perform within specified limits (<200ms)
4. UI components must render correctly with sample data

**Cross-Prompt Integration Testing:**
1. End-to-end workflow: select chunk → link to conversation → generate with context
2. Performance testing: chunk selection with 1000+ chunks, generation with dimension mapping
3. Edge case testing: orphaned conversations, missing chunks, low dimension confidence

**Acceptance Gates:**
1. All functional requirements acceptance criteria met
2. No breaking changes to existing conversation generation
3. Chunk selection UI usable and performant
4. Dimension-driven generation produces measurably better quality

## Database Setup Instructions

### Required SQL Operations

Execute these SQL statements in Supabase SQL Editor before beginning implementation:

========================

```sql
-- ============================================
-- E09 Chunks-Alpha Integration Schema
-- Generated: 2025-01-29
-- Purpose: Add chunk association and dimension metadata to conversations
-- ============================================

-- Step 1: Add chunk association columns to conversations table
ALTER TABLE conversations
  ADD COLUMN parent_chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL,
  ADD COLUMN chunk_context TEXT,
  ADD COLUMN dimension_source JSONB;

-- Step 2: Create index on parent_chunk_id for efficient chunk-to-conversation lookups
CREATE INDEX idx_conversations_parent_chunk_id 
  ON conversations(parent_chunk_id)
  WHERE parent_chunk_id IS NOT NULL;

-- Step 3: Create GIN index on dimension_source for JSONB queries
CREATE INDEX idx_conversations_dimension_source 
  ON conversations USING GIN(dimension_source)
  WHERE dimension_source IS NOT NULL;

-- Step 4: Add comment documentation
COMMENT ON COLUMN conversations.parent_chunk_id IS 
  'Foreign key to chunks.id - links conversation to source document chunk';
COMMENT ON COLUMN conversations.chunk_context IS 
  'Cached chunk content for generation - denormalized for performance';
COMMENT ON COLUMN conversations.dimension_source IS 
  'Metadata from chunk dimensions: {chunkId, dimensions, confidence, extractedAt}';

-- Step 5: Create helper view for orphaned conversations
CREATE OR REPLACE VIEW orphaned_conversations AS
SELECT 
  c.id,
  c.conversation_id,
  c.title,
  c.status,
  c.created_at
FROM conversations c
WHERE c.parent_chunk_id IS NULL
  AND c.status NOT IN ('draft', 'archived');

-- Step 6: Create helper function to get conversations by chunk
CREATE OR REPLACE FUNCTION get_conversations_by_chunk(chunk_uuid UUID)
RETURNS TABLE (
  id UUID,
  conversation_id TEXT,
  title TEXT,
  status TEXT,
  quality_score NUMERIC,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.conversation_id,
    c.title,
    c.status::TEXT,
    c.quality_score,
    c.created_at
  FROM conversations c
  WHERE c.parent_chunk_id = chunk_uuid
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Verification queries
-- Run these to verify schema changes:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'conversations' 
--   AND column_name IN ('parent_chunk_id', 'chunk_context', 'dimension_source');

-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'conversations' 
--   AND indexname LIKE '%chunk%';
```

**Migration Rollback (if needed):**
```sql
-- Rollback script - use only if migration needs to be reversed
DROP VIEW IF EXISTS orphaned_conversations;
DROP FUNCTION IF EXISTS get_conversations_by_chunk;
DROP INDEX IF EXISTS idx_conversations_dimension_source;
DROP INDEX IF EXISTS idx_conversations_parent_chunk_id;
ALTER TABLE conversations
  DROP COLUMN IF EXISTS dimension_source,
  DROP COLUMN IF EXISTS chunk_context,
  DROP COLUMN IF EXISTS parent_chunk_id;
```

++++++++++++++++++


## Implementation Prompts

### Prompt 1: Foundation - Database Schema & TypeScript Type Extensions
**Scope**: Extend database schema and TypeScript types to support chunk associations and dimension metadata  
**Dependencies**: Database setup SQL must be executed first  
**Estimated Time**: 3-4 hours  
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing the foundation for Chunks-Alpha module integration in the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The conversation generation platform creates synthetic training conversations for LoRA fine-tuning. This segment integrates with the chunks-alpha module which performs semantic chunking and 60-dimension analysis of source documents. By linking conversations to source chunks and leveraging dimensional analysis, we enable:
1. Traceability: Track which document chunks informed each conversation
2. Context-aware generation: Inject chunk content into conversation prompts
3. Dimension-driven parameters: Use semantic dimensions to auto-select persona, emotion, complexity
4. Enhanced quality scoring: Factor dimension confidence into conversation quality metrics

**Functional Requirements (FR9.1.1 - Conversation to Chunk Association):**
- Conversations must store parentId referencing chunk_id
- Chunk context must be cached for generation performance
- Dimension metadata must be stored for parameter selection
- Multiple conversations can link to same chunk
- Foreign key constraints must maintain referential integrity
- Queries must perform efficiently (<100ms for lookups)

**CURRENT CODEBASE STATE:**

**Existing Type Definitions (`train-wireframe/src/lib/types.ts`):**
```typescript
// Lines 29-46: Current Conversation type
export interface Conversation {
  id: string;
  conversationId: string;
  title: string;
  status: ConversationStatus;
  tier?: TierType;
  category: string[];
  qualityScore?: number;
  metadata?: {
    topic?: string;
    persona?: string;
    emotion?: string;
  };
  turns?: ConversationTurn[];
  totalTurns?: number;
  tokenCount?: number;
  parentId?: string;  // Currently exists but not fully utilized
  parentType?: 'template' | 'scenario';
  reviewHistory?: ReviewAction[];
  parameters?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}
```

**Existing Database Service (`src/lib/database.ts`):**
- Basic CRUD operations for documents and conversations
- Supabase client integration established
- Type-safe query patterns

**IMPLEMENTATION TASKS:**

**Task T-1.1.2: Update TypeScript Types for Chunk Association**

1. **Extend Conversation Type** (`train-wireframe/src/lib/types.ts`):
   - Add `parentChunkId?: string` field
   - Add `chunkContext?: string` field (cached chunk content)
   - Add `dimensionSource?: DimensionSource` field (dimension metadata)

2. **Create New Type Definitions** (add after Conversation type):
   ```typescript
   // Chunk reference metadata
   export interface ChunkReference {
     id: string;
     title: string;
     content: string;
     documentId: string;
     documentTitle?: string;
     sectionHeading?: string;
     pageStart?: number;
     pageEnd?: number;
   }

   // Dimension metadata from chunks-alpha
   export interface DimensionSource {
     chunkId: string;
     dimensions: Record<string, number>;  // dimension_name: value (0-1)
     confidence: number;  // overall confidence score
     extractedAt: string;  // timestamp
     semanticDimensions?: {
       persona?: string[];
       emotion?: string[];
       complexity?: number;
       domain?: string[];
     };
   }
   ```

3. **Update QualityMetrics Type** (enhance existing type at lines 14-24):
   - Add `dimensionConfidence?: number` field (0-1 scale)
   - This will be used in quality scoring

4. **Synchronize Types Across Codebases**:
   - Ensure `src/lib/types.ts` (if exists) matches wireframe types
   - If types are only in wireframe, document that as source of truth

**Task T-1.1.3: Update Database Service Layer**

5. **Extend Database Service** (`src/lib/database.ts`):
   
   Add new methods for chunk association queries:

   ```typescript
   // Get conversations linked to specific chunk
   async getConversationsByChunk(chunkId: string): Promise<Conversation[]> {
     const { data, error } = await supabase
       .from('conversations')
       .select('*')
       .eq('parent_chunk_id', chunkId)
       .order('created_at', { ascending: false });
     
     if (error) throw error;
     return data || [];
   }

   // Get orphaned conversations (no chunk link)
   async getOrphanedConversations(): Promise<Conversation[]> {
     const { data, error } = await supabase
       .from('conversations')
       .select('*')
       .is('parent_chunk_id', null)
       .not('status', 'in', '(draft,archived)')
       .order('created_at', { ascending: false });
     
     if (error) throw error;
     return data || [];
   }

   // Update conversation with chunk association
   async linkConversationToChunk(
     conversationId: string,
     chunkId: string,
     chunkContext?: string,
     dimensionSource?: DimensionSource
   ): Promise<void> {
     const { error } = await supabase
       .from('conversations')
       .update({
         parent_chunk_id: chunkId,
         chunk_context: chunkContext,
         dimension_source: dimensionSource,
         updated_at: new Date().toISOString()
       })
       .eq('id', conversationId);
     
     if (error) throw error;
   }

   // Remove chunk association
   async unlinkConversationFromChunk(conversationId: string): Promise<void> {
     const { error } = await supabase
       .from('conversations')
       .update({
         parent_chunk_id: null,
         chunk_context: null,
         dimension_source: null,
         updated_at: new Date().toISOString()
       })
       .eq('id', conversationId);
     
     if (error) throw error;
   }
   ```

**ACCEPTANCE CRITERIA:**

1. ✅ TypeScript types extended with chunk association fields
2. ✅ `ChunkReference` and `DimensionSource` types created with proper structure
3. ✅ `QualityMetrics` type includes `dimensionConfidence` field
4. ✅ Database service includes four new methods: `getConversationsByChunk`, `getOrphanedConversations`, `linkConversationToChunk`, `unlinkConversationFromChunk`
5. ✅ All methods properly typed with TypeScript interfaces
6. ✅ Error handling implemented for all database operations
7. ✅ TypeScript compilation passes with zero errors
8. ✅ Types synchronized between wireframe and main codebase

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- Primary: `train-wireframe/src/lib/types.ts` (lines 29-60 for Conversation extensions)
- Database: `src/lib/database.ts` (append new methods to existing service)

**Data Type Constraints:**
- `parentChunkId`: UUID string, nullable
- `chunkContext`: TEXT, nullable, max 5000 characters
- `dimensionSource`: JSONB object matching DimensionSource interface
- `confidence`: number between 0 and 1
- All timestamps: ISO 8601 format strings

**Error Handling:**
- Database errors must throw with original error message
- Type validation at compile-time via TypeScript
- Runtime validation for dimension confidence (0-1 range)

**Coding Standards:**
- Use TypeScript strict mode
- Follow existing codebase naming conventions (camelCase for fields)
- Add JSDoc comments for new types and methods
- Use async/await for all database operations

**VALIDATION REQUIREMENTS:**

Manual Testing Steps:
1. Run TypeScript compiler: `npm run typecheck` (or `tsc --noEmit`)
2. Verify no compilation errors in types.ts or database.ts
3. Test database methods in development:
   ```typescript
   // Test orphaned conversations query
   const orphaned = await db.getOrphanedConversations();
   console.log('Orphaned:', orphaned.length);

   // Test chunk linking
   await db.linkConversationToChunk(
     'test-conv-id',
     'test-chunk-id',
     'Test chunk content',
     {
       chunkId: 'test-chunk-id',
       dimensions: { semantic_clarity: 0.85 },
       confidence: 0.75,
       extractedAt: new Date().toISOString()
     }
   );
   ```
4. Verify database foreign key constraint works (link to non-existent chunk should fail gracefully)
5. Check query performance: SELECT with parent_chunk_id filter should use index (<50ms)

**DELIVERABLES:**

1. Updated `train-wireframe/src/lib/types.ts` with:
   - Extended Conversation interface (3 new fields)
   - New ChunkReference interface (~8 fields)
   - New DimensionSource interface (~5 fields)
   - Extended QualityMetrics interface (1 new field)

2. Updated `src/lib/database.ts` with:
   - `getConversationsByChunk()` method
   - `getOrphanedConversations()` method
   - `linkConversationToChunk()` method
   - `unlinkConversationFromChunk()` method
   - JSDoc comments for each new method

3. Verification:
   - TypeScript compilation output (zero errors)
   - Test execution results showing methods work correctly

Implement these changes completely, ensuring type safety and database query efficiency.

++++++++++++++++++


### Prompt 2: Chunks Integration Service Layer with Caching
**Scope**: Create service classes to query chunks-alpha data with caching and dimension parsing  
**Dependencies**: Prompt 1 (types and database schema must be complete)  
**Estimated Time**: 6-8 hours  
**Risk Level**: Medium

========================

You are a senior backend developer implementing the service layer for integrating with the chunks-alpha module in the conversation generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The chunks-alpha module stores semantically chunked document content with 60-dimension analysis. Our service layer must efficiently query this data, parse dimensions, and cache results to minimize database load during conversation generation workflows.

**Functional Requirements (FR9.1.1, FR9.1.2):**
- Query chunks from chunks-alpha database tables
- Retrieve 60-dimension analysis data
- Support filtering by document, category, quality threshold
- Implement caching to reduce redundant queries
- Parse semantic dimensions for persona/emotion mapping
- Calculate complexity scores from dimension values
- Handle missing chunks and connection errors gracefully
- Performance target: <200ms for single chunk retrieval with dimensions

**CURRENT CODEBASE STATE:**

**Existing Chunk Service (`src/lib/chunk-service.ts`):**
- Basic chunk CRUD operations already exist
- Supabase client integration established
- May need extension for dimension queries

**Existing Dimension Service (`src/lib/dimension-service.ts`):**
- Dimension generation logic exists
- 60-dimension schema already defined
- Needs integration with conversation parameter mapping

**Type Definitions (from Prompt 1):**
```typescript
// train-wireframe/src/lib/types.ts
interface ChunkReference {
  id: string;
  title: string;
  content: string;
  documentId: string;
  documentTitle?: string;
  sectionHeading?: string;
  pageStart?: number;
  pageEnd?: number;
}

interface DimensionSource {
  chunkId: string;
  dimensions: Record<string, number>;
  confidence: number;
  extractedAt: string;
  semanticDimensions?: {
    persona?: string[];
    emotion?: string[];
    complexity?: number;
    domain?: string[];
  };
}
```

**IMPLEMENTATION TASKS:**

**Task T-2.1.1: Create ChunksService Class**

1. **Create Service File** (`src/lib/chunks-integration/chunks-service.ts`):

The ChunksService must provide methods to:
- Fetch single chunk by ID with dimensions
- Fetch all chunks for a document with filtering
- Query dimensions for a chunk
- Search chunks by content

Key implementation requirements:
- Use Supabase client with proper error handling
- Join chunks table with chunk_dimensions table
- Transform database results to TypeScript types
- Return null for not found (don't throw)
- Log errors for debugging

2. **Integrate Caching** (use ChunkCache from Task T-2.1.3):
- Check cache before database query
- Cache successful results with 5-minute TTL
- Invalidate cache on updates

**Task T-2.1.2: Implement Dimension Parser**

3. **Create Parser Class** (`src/lib/chunks-integration/dimension-parser.ts`):

The DimensionParser must analyze 60-dimension data to extract:
- Relevant personas (authoritative, supportive, analytical, casual)
- Emotions (anxious, confident, curious, frustrated)
- Complexity score (0-1) for turn count determination
- Domain tags (financial, technical, healthcare, legal)

Mapping logic:
- Use threshold-based matching (>0.6 for personas)
- Map specific dimensions to semantic categories
- Return arrays of matched categories
- Provide default values when dimensions unclear

**Task T-2.1.3: Implement Caching Layer**

4. **Create Cache Class** (`src/lib/chunks-integration/chunk-cache.ts`):

The ChunkCache must provide:
- LRU eviction when size limit reached (100 entries)
- TTL-based expiration (5-minute default)
- Key generation for consistent caching
- Cache metrics (hits, misses, hit rate)
- Prefix-based invalidation for bulk updates

**ACCEPTANCE CRITERIA:**

1. ✅ ChunksService created with methods: getChunkById, getChunksByDocument, getDimensionsForChunk, searchChunks
2. ✅ DimensionParser created with methods: parse, extractPersonas, extractEmotions, calculateComplexity, extractDomainTags
3. ✅ ChunkCache created with LRU eviction and TTL expiration
4. ✅ All methods include comprehensive error handling
5. ✅ Caching integrated into ChunksService queries
6. ✅ Performance target met: <200ms for cached chunk retrieval
7. ✅ Dimension confidence validation implemented
8. ✅ Cache metrics tracking functional
9. ✅ All files export singleton instances for easy import

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/chunks-integration/
├── chunks-service.ts      # ~300 lines - Main service class
├── dimension-parser.ts    # ~200 lines - Dimension parsing logic
├── chunk-cache.ts         # ~150 lines - LRU cache implementation
└── index.ts              # Barrel export: export { chunksService, dimensionParser, chunkCache }
```

**ChunksService Methods:**
```typescript
class ChunksService {
  constructor(supabaseUrl: string, supabaseKey: string)
  async getChunkById(chunkId: string): Promise<ChunkWithDimensions | null>
  async getChunksByDocument(documentId: string, options?: ChunkQueryOptions): Promise<ChunkWithDimensions[]>
  async getDimensionsForChunk(chunkId: string): Promise<DimensionSource | null>
  async searchChunks(searchQuery: string, options?: ChunkQueryOptions): Promise<ChunkWithDimensions[]>
}
```

**DimensionParser Methods:**
```typescript
class DimensionParser {
  parse(rawDimensions: Record<string, number>, confidence: number): DimensionSource
  extractPersonas(dimensions: Record<string, number>): string[]
  extractEmotions(dimensions: Record<string, number>): string[]
  calculateComplexity(dimensions: Record<string, number>): number
  extractDomainTags(dimensions: Record<string, number>): string[]
  validateConfidence(confidence: number, minThreshold?: number): boolean
}
```

**ChunkCache Methods:**
```typescript
class ChunkCache {
  constructor(maxSize: number, defaultTTL: number)
  generateKey(prefix: string, id: string): string
  get<T>(key: string): T | null
  set<T>(key: string, data: T, ttl?: number): void
  invalidate(key: string): void
  invalidateByPrefix(prefix: string): void
  clear(): void
  getMetrics(): CacheMetrics
}
```

**Performance Requirements:**
- Chunk retrieval with cache hit: <50ms
- Chunk retrieval with cache miss: <200ms
- Cache size: 100 entries maximum
- Cache TTL: 5 minutes default
- Cache hit rate target: >70% during generation workflows

**Database Query Patterns:**
```sql
-- Chunk with dimensions join
SELECT 
  c.id, c.title, c.content, c.document_id, c.section_heading,
  cd.dimensions, cd.confidence_score, cd.created_at,
  d.title as document_title
FROM chunks c
LEFT JOIN chunk_dimensions cd ON cd.chunk_id = c.id
LEFT JOIN documents d ON d.id = c.document_id
WHERE c.id = $1;
```

**Error Handling:**
- Database connection errors: return null, log error
- Missing chunks: return null with warning log
- Invalid dimension data: return default values (neutral persona, 0.5 complexity)
- Cache errors: bypass cache, continue with database query
- Never throw errors that break generation workflow

**VALIDATION REQUIREMENTS:**

**Manual Testing Script:**
```typescript
// Test file: src/test-chunks-integration.ts
import { chunksService, dimensionParser, chunkCache } from '@/lib/chunks-integration';

async function testChunksIntegration() {
  console.log('Testing Chunks Integration Service...\n');

  // Test 1: Fetch chunk by ID
  console.log('Test 1: Fetch chunk by ID');
  const chunkId = 'YOUR_TEST_CHUNK_UUID';
  const chunk = await chunksService.getChunkById(chunkId);
  console.log('Chunk title:', chunk?.title || 'Not found');
  console.log('Has dimensions:', !!chunk?.dimensions);

  // Test 2: Cache performance
  console.log('\nTest 2: Cache performance');
  const start1 = Date.now();
  await chunksService.getChunkById(chunkId); // Cache miss
  const time1 = Date.now() - start1;
  
  const start2 = Date.now();
  await chunksService.getChunkById(chunkId); // Cache hit
  const time2 = Date.now() - start2;
  
  console.log(`First call (miss): ${time1}ms`);
  console.log(`Second call (hit): ${time2}ms`);
  console.log(`Cache speedup: ${(time1 / time2).toFixed(1)}x`);

  // Test 3: Dimension parsing
  console.log('\nTest 3: Dimension parsing');
  const dims = await chunksService.getDimensionsForChunk(chunkId);
  if (dims) {
    const parsed = dimensionParser.parse(dims.dimensions, dims.confidence);
    console.log('Extracted personas:', parsed.semanticDimensions?.persona);
    console.log('Extracted emotions:', parsed.semanticDimensions?.emotion);
    console.log('Complexity score:', parsed.semanticDimensions?.complexity);
    console.log('Domain tags:', parsed.semanticDimensions?.domain);
  }

  // Test 4: Cache metrics
  console.log('\nTest 4: Cache metrics');
  const metrics = chunkCache.getMetrics();
  console.log('Cache hits:', metrics.hits);
  console.log('Cache misses:', metrics.misses);
  console.log('Hit rate:', (metrics.hitRate * 100).toFixed(1) + '%');
  console.log('Cache size:', metrics.size);

  // Test 5: Search chunks
  console.log('\nTest 5: Search chunks');
  const results = await chunksService.searchChunks('investment', { limit: 5 });
  console.log(`Found ${results.length} chunks matching "investment"`);

  console.log('\n✅ All tests completed');
}

testChunksIntegration().catch(console.error);
```

Run test with: `npx ts-node src/test-chunks-integration.ts`

**Expected Results:**
- Test 1: Should return chunk with title and dimensions
- Test 2: Second call should be <50ms (cache hit)
- Test 3: Should extract at least one persona and emotion
- Test 4: Hit rate should be >50% after multiple operations
- Test 5: Should return relevant chunks based on search term

**DELIVERABLES:**

1. **src/lib/chunks-integration/chunks-service.ts** (approx. 300 lines)
   - ChunksService class with 4 main methods
   - Integrated caching logic
   - Error handling for all database operations
   - TypeScript types for all parameters and returns

2. **src/lib/chunks-integration/dimension-parser.ts** (approx. 200 lines)
   - DimensionParser class with 6 methods
   - Persona/emotion dimension mappings
   - Complexity calculation algorithm
   - Domain tag extraction logic

3. **src/lib/chunks-integration/chunk-cache.ts** (approx. 150 lines)
   - ChunkCache class with LRU eviction
   - TTL-based expiration
   - Cache metrics tracking
   - Prefix-based invalidation

4. **src/lib/chunks-integration/index.ts** (barrel export)
   - Export all singleton instances
   - Export types for external use

5. **Test results** showing:
   - Cache hit rate >70%
   - Query performance <200ms (uncached), <50ms (cached)
   - Dimension parsing produces valid results

6. **TypeScript compilation** with zero errors

Implement this service layer completely with production-ready error handling, caching, and performance optimization. The code should be maintainable, well-documented, and thoroughly tested.

++++++++++++++++++


### Prompt 3: Chunk Selector UI Component
**Scope**: Build interactive UI component for searching, filtering, and selecting chunks  
**Dependencies**: Prompt 2 (chunks service layer must be complete)  
**Estimated Time**: 8-10 hours  
**Risk Level**: Low-Medium

========================

You are a senior frontend developer implementing the Chunk Selector UI component for the conversation generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
Users need to link conversations to source document chunks to establish traceability and enable context-aware generation. The Chunk Selector provides an intuitive interface to browse, search, and select chunks from the chunks-alpha module.

**Functional Requirements (FR9.1.1):**
- Display searchable list of available chunks
- Show chunk preview with title, content snippet, document source
- Support filtering by document, category, quality score
- Highlight selected chunk with visual indicator
- Display chunk metadata (dimensions, quality) in detail panel
- Handle loading states and empty results gracefully
- Support keyboard navigation (arrow keys, Enter, Escape)
- Single-select mode (one chunk per conversation)

**User Experience Goals:**
- Fast, responsive search (debounced input)
- Clear visual hierarchy showing chunk structure
- Easy-to-scan list with relevant metadata
- Smooth transitions and loading states
- Accessible keyboard navigation

**CURRENT CODEBASE STATE:**

**Existing UI Components (`train-wireframe/src/components/ui/`):**
- Shadcn/UI component library available:
  - `input.tsx` - Text input with variants
  - `button.tsx` - Button component
  - `card.tsx` - Card layout component
  - `scroll-area.tsx` - Scrollable container
  - `dialog.tsx` or `sheet.tsx` - Modal/drawer patterns
  - `badge.tsx` - Badge for metadata display
  - `skeleton.tsx` - Loading state placeholders
  - `select.tsx` - Dropdown selector
  - `slider.tsx` - Range slider for filtering

**Existing Dashboard Pattern:**
Reference `train-wireframe/src/components/dashboard/` for:
- Table/list rendering patterns
- Filter implementation approach
- Search input with debounce
- Loading state handling

**Service Layer (from Prompt 2):**
```typescript
import { chunksService } from '@/lib/chunks-integration';

// Available methods:
await chunksService.getChunkById(chunkId);
await chunksService.getChunksByDocument(documentId, options);
await chunksService.searchChunks(searchQuery, options);
```

**IMPLEMENTATION TASKS:**

**Task T-3.1.1: Create ChunkSelector Component**

1. **Component File** (`train-wireframe/src/components/chunks/ChunkSelector.tsx`):

Structure:
```
ChunkSelector (main container)
├── Search Input (debounced, 300ms)
├── Filters Panel
│   ├── Document Filter (dropdown)
│   ├── Quality Score Filter (slider)
│   └── Clear Filters Button
├── Chunk List (scrollable)
│   ├── ChunkCard (repeating)
│   │   ├── Title
│   │   ├── Content Snippet (truncated)
│   │   ├── Metadata (document, pages, quality badge)
│   │   └── Select Button
└── Loading/Empty States
```

Component Props:
```typescript
interface ChunkSelectorProps {
  onSelect: (chunkId: string, chunk: ChunkReference) => void;
  selectedChunkId?: string;
  documentId?: string; // Optional pre-filter to specific document
  className?: string;
}
```

State Management:
- `searchQuery: string` - Current search term
- `chunks: ChunkWithDimensions[]` - Loaded chunks
- `isLoading: boolean` - Loading state
- `selectedId: string | null` - Currently selected chunk
- `filters: ChunkFilters` - Active filters (document, quality)

Key Features:
- Debounced search input (300ms delay)
- Fetch chunks on mount or when filters change
- Display results in scrollable list
- Click handler to select chunk and call `onSelect`
- Empty state when no results
- Loading skeleton during fetch

2. **Implement Search with Debounce:**
```typescript
import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash'; // or custom implementation

const debouncedSearch = useCallback(
  debounce(async (query: string) => {
    setIsLoading(true);
    const results = await chunksService.searchChunks(query, {
      limit: 50,
      qualityThreshold: filters.minQuality
    });
    setChunks(results);
    setIsLoading(false);
  }, 300),
  [filters]
);

useEffect(() => {
  if (searchQuery) {
    debouncedSearch(searchQuery);
  }
}, [searchQuery, debouncedSearch]);
```

**Task T-3.1.2: Implement Chunk Filters**

3. **Filter Controls:**

```typescript
interface ChunkFilters {
  documentId?: string;
  minQuality?: number;
  categories?: string[];
}
```

Filter UI:
- Document dropdown: List of available documents
- Quality slider: 0-10 range, default 6
- Clear all filters button

Apply filters when changed:
```typescript
const applyFilters = async () => {
  setIsLoading(true);
  const results = await chunksService.getChunksByDocument(
    filters.documentId || 'all',
    {
      qualityThreshold: filters.minQuality,
      categoryFilter: filters.categories,
      limit: 100
    }
  );
  setChunks(results);
  setIsLoading(false);
};
```

**Task T-3.1.3: Create Chunk Detail Preview Panel**

4. **Detail Panel Component** (`train-wireframe/src/components/chunks/ChunkDetailPanel.tsx`):

Display when chunk is selected or hovered:
- Full chunk content (scrollable if long)
- Document metadata (title, author, date)
- Dimension visualization (bar chart or badges)
- Quality score with color coding
- Select/Close buttons

Use Sheet or Dialog component from shadcn/ui:
```typescript
<Sheet open={!!selectedChunk} onOpenChange={onClose}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>{selectedChunk?.title}</SheetTitle>
      <SheetDescription>
        Document: {selectedChunk?.documentTitle}
      </SheetDescription>
    </SheetHeader>
    
    <div className="space-y-4">
      {/* Chunk content */}
      <div className="max-h-96 overflow-y-auto">
        <p className="text-sm">{selectedChunk?.content}</p>
      </div>
      
      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2">
        <Badge>Pages: {selectedChunk?.pageStart}-{selectedChunk?.pageEnd}</Badge>
        <Badge variant={getQualityVariant(selectedChunk?.dimensionConfidence)}>
          Quality: {(selectedChunk?.dimensionConfidence * 10).toFixed(1)}/10
        </Badge>
      </div>
      
      {/* Dimensions preview */}
      {selectedChunk?.dimensions && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Semantic Dimensions</h4>
          {/* Render top 5 dimensions as progress bars */}
        </div>
      )}
    </div>
    
    <SheetFooter>
      <Button onClick={() => onSelect(selectedChunk)}>
        Select This Chunk
      </Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

**ACCEPTANCE CRITERIA:**

1. ✅ ChunkSelector component renders with search input and chunk list
2. ✅ Search input debounced at 300ms, triggers chunk query
3. ✅ Chunk list displays results with title, snippet, metadata
4. ✅ Selected chunk highlighted with different background color
5. ✅ Click on chunk calls onSelect callback with chunk data
6. ✅ Filters functional: document dropdown, quality slider
7. ✅ Clear filters button resets to defaults
8. ✅ Loading state shows skeleton placeholders
9. ✅ Empty state displays helpful message when no results
10. ✅ ChunkDetailPanel shows full chunk content and metadata
11. ✅ Keyboard navigation supported (Tab, Enter, Escape)
12. ✅ Component responsive and works on various screen sizes

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/components/chunks/
├── ChunkSelector.tsx        # ~300 lines - Main selector component
├── ChunkCard.tsx           # ~100 lines - Individual chunk display
├── ChunkFilters.tsx        # ~150 lines - Filter controls
├── ChunkDetailPanel.tsx    # ~200 lines - Detail view modal
└── index.ts               # Barrel export
```

**Component Architecture:**
```typescript
// ChunkSelector.tsx
export function ChunkSelector({ onSelect, selectedChunkId, documentId }: ChunkSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chunks, setChunks] = useState<ChunkWithDimensions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<ChunkFilters>({});
  const [selectedChunk, setSelectedChunk] = useState<ChunkWithDimensions | null>(null);

  // Debounced search effect
  // Filter change effect
  // Initial load effect

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="mb-4">
        <Input
          placeholder="Search chunks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filters */}
      <ChunkFilters filters={filters} onFiltersChange={setFilters} />

      {/* Chunk List */}
      <ScrollArea className="flex-1 mt-4">
        {isLoading ? (
          <ChunkListSkeleton count={5} />
        ) : chunks.length > 0 ? (
          chunks.map(chunk => (
            <ChunkCard
              key={chunk.id}
              chunk={chunk}
              isSelected={chunk.id === selectedChunkId}
              onClick={() => {
                setSelectedChunk(chunk);
                onSelect(chunk.id, chunk);
              }}
            />
          ))
        ) : (
          <EmptyState message="No chunks found matching your search" />
        )}
      </ScrollArea>

      {/* Detail Panel */}
      <ChunkDetailPanel
        chunk={selectedChunk}
        onClose={() => setSelectedChunk(null)}
        onSelect={onSelect}
      />
    </div>
  );
}
```

**Styling Guidelines:**
- Use Tailwind CSS utility classes
- Follow existing dashboard component patterns
- Chunk cards: `p-4 border rounded-lg hover:bg-muted cursor-pointer`
- Selected state: `bg-primary/10 border-primary`
- Loading skeleton: Use Skeleton component from ui library
- Empty state: Center-aligned with icon and message

**Keyboard Navigation:**
```typescript
// Add keyboard event handlers
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedChunk(null);
    }
    // Add arrow key navigation through chunk list
    // Add Enter key to select highlighted chunk
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedChunk, chunks]);
```

**Performance Considerations:**
- Virtualize long lists if >100 chunks (optional enhancement)
- Memoize expensive operations with useMemo
- Debounce search to avoid excessive API calls
- Cache chunk list for 5 minutes (handled by service layer)

**VALIDATION REQUIREMENTS:**

**Manual Testing Steps:**

1. **Search Functionality:**
   - Type "investment" in search box
   - Wait 300ms and verify API call made
   - Verify results displayed
   - Type more characters and verify search updates
   - Clear search and verify all chunks shown

2. **Filter Testing:**
   - Select document from dropdown, verify filtered results
   - Adjust quality slider, verify only high-quality chunks shown
   - Click "Clear Filters", verify reset to all chunks

3. **Selection Testing:**
   - Click on chunk card
   - Verify selected state applied (different background)
   - Verify onSelect callback triggered
   - Verify detail panel opens with chunk content

4. **Loading States:**
   - Initial load should show skeleton
   - Search should show skeleton during query
   - Empty search should show "No results" message

5. **Keyboard Navigation:**
   - Press Tab to focus search input
   - Type search term
   - Press Tab to navigate through chunk cards
   - Press Enter on highlighted chunk to select
   - Press Escape to close detail panel

**Expected Behavior:**
- Search debounce prevents lag during fast typing
- Filter changes immediately update visible chunks
- Selected chunk visually distinct from others
- Detail panel displays full chunk information
- Loading states prevent confusion during async operations
- Empty states provide clear next actions

**DELIVERABLES:**

1. **train-wireframe/src/components/chunks/ChunkSelector.tsx** (~300 lines)
   - Main component with search, filters, chunk list
   - State management for search, chunks, loading
   - Debounced search implementation
   - Integration with chunksService

2. **train-wireframe/src/components/chunks/ChunkCard.tsx** (~100 lines)
   - Individual chunk display component
   - Title, snippet, metadata layout
   - Selected state styling
   - Click handler

3. **train-wireframe/src/components/chunks/ChunkFilters.tsx** (~150 lines)
   - Document dropdown filter
   - Quality score slider
   - Clear filters button
   - Filter state management

4. **train-wireframe/src/components/chunks/ChunkDetailPanel.tsx** (~200 lines)
   - Sheet/Dialog component for chunk details
   - Full content display
   - Dimension visualization
   - Select button

5. **train-wireframe/src/components/chunks/index.ts** (barrel export)
   - Export all chunk components

6. **Demonstration** showing:
   - Search working with debounce
   - Filters updating chunk list
   - Selection highlighting
   - Detail panel displaying chunk info
   - Keyboard navigation functional

Implement this UI component with attention to user experience, accessibility, and performance. The component should feel responsive and intuitive for users linking chunks to conversations.

++++++++++++++++++


### Prompt 4: Generation Integration & Context Injection  
**Scope**: Integrate chunk context into conversation generation prompts and dimension-driven parameter selection  
**Dependencies**: Prompts 1, 2, 3 (types, services, and UI must be complete)  
**Estimated Time**: 6-8 hours  
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing context-aware conversation generation using chunk content and semantic dimensions.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
When a conversation is linked to a chunk, we must inject the chunk's content into the generation prompt to create contextually relevant conversations. Additionally, semantic dimensions from the chunk should inform parameter selection (persona, emotion, complexity, turn count).

**Functional Requirements (FR9.1.1, FR9.1.2):**
- Chunk content automatically injected into generation prompt at designated placeholder
- Chunk metadata (document title, section) included in prompt context
- Dimension-driven parameter selection: personas, emotions, complexity, domain tags
- Long chunks truncated intelligently (preserve key content)
- Dimension confidence factored into quality scoring
- Generation audit logs record chunk and dimension usage
- Multiple chunk references supported (up to 3 chunks per conversation)

**IMPLEMENTATION TASKS:**

**Task T-4.1.1: Create Prompt Context Builder**

1. **File**: `src/lib/generation/prompt-context-builder.ts`

```typescript
import type { ChunkReference, DimensionSource } from '@/lib/types';

interface PromptContext {
  chunkContent: string;
  chunkMetadata: string;
  dimensionContext?: string;
}

export class PromptContextBuilder {
  private maxChunkLength: number = 5000; // characters

  /**
   * Build enriched prompt with chunk context
   * @param template - Base prompt template
   * @param chunk - Chunk to inject
   * @param dimensions - Optional dimension data
   * @returns Resolved prompt string
   */
  buildPrompt(
    template: string,
    chunk?: ChunkReference,
    dimensions?: DimensionSource
  ): string {
    if (!chunk) {
      return template;
    }

    const context = this.buildContext(chunk, dimensions);
    
    // Replace placeholders: {{chunk_content}}, {{chunk_metadata}}, {{dimension_context}}
    let prompt = template
      .replace('{{chunk_content}}', context.chunkContent)
      .replace('{{chunk_metadata}}', context.chunkMetadata);
    
    if (context.dimensionContext) {
      prompt = prompt.replace('{{dimension_context}}', context.dimensionContext);
    }

    return prompt;
  }

  /**
   * Build context object from chunk and dimensions
   */
  private buildContext(
    chunk: ChunkReference,
    dimensions?: DimensionSource
  ): PromptContext {
    // Truncate content if too long
    const chunkContent = this.truncateContent(chunk.content);

    // Build metadata string
    const chunkMetadata = [
      `Document: ${chunk.documentTitle || chunk.documentId}`,
      chunk.sectionHeading && `Section: ${chunk.sectionHeading}`,
      chunk.pageStart && `Pages: ${chunk.pageStart}-${chunk.pageEnd}`
    ].filter(Boolean).join(' | ');

    // Build dimension context if available
    let dimensionContext: string | undefined;
    if (dimensions?.semanticDimensions) {
      const { persona, emotion, complexity, domain } = dimensions.semanticDimensions;
      dimensionContext = [
        persona && `Suggested Personas: ${persona.join(', ')}`,
        emotion && `Detected Emotions: ${emotion.join(', ')}`,
        complexity && `Complexity Level: ${(complexity * 10).toFixed(1)}/10`,
        domain && domain.length > 0 && `Domain: ${domain.join(', ')}`
      ].filter(Boolean).join('\n');
    }

    return { chunkContent, chunkMetadata, dimensionContext };
  }

  /**
   * Intelligently truncate long chunk content
   * Preserves first and last paragraphs, indicates truncation
   */
  private truncateContent(content: string): string {
    if (content.length <= this.maxChunkLength) {
      return content;
    }

    const paragraphs = content.split('\n\n');
    if (paragraphs.length <= 2) {
      // Single long paragraph - hard truncate
      return content.slice(0, this.maxChunkLength) + '\n\n[... content truncated for brevity ...]';
    }

    // Keep first and last paragraphs
    const first = paragraphs[0];
    const last = paragraphs[paragraphs.length - 1];
    const truncated = `${first}\n\n[... middle content omitted ...]\n\n${last}`;

    if (truncated.length > this.maxChunkLength) {
      // Still too long, hard truncate
      return truncated.slice(0, this.maxChunkLength) + '...';
    }

    return truncated;
  }
}

export const promptContextBuilder = new PromptContextBuilder();
```

**Task T-4.1.2: Integrate Context Builder into Generation Service**

2. **Update** `src/lib/generation/conversation-generator.ts` (or similar file):

Add chunk context detection and injection:

```typescript
import { chunksService, dimensionParser } from '@/lib/chunks-integration';
import { promptContextBuilder } from './prompt-context-builder';

// In ConversationGenerator class or generate function:
async function generateConversation(conversationConfig: ConversationConfig): Promise<Conversation> {
  // Check if conversation has chunk association
  if (conversationConfig.parentChunkId) {
    // Fetch chunk and dimensions
    const chunk = await chunksService.getChunkById(conversationConfig.parentChunkId);
    const dimensions = chunk?.dimensions 
      ? await chunksService.getDimensionsForChunk(conversationConfig.parentChunkId)
      : null;

    // Build enriched prompt
    if (chunk) {
      conversationConfig.prompt = promptContextBuilder.buildPrompt(
        conversationConfig.promptTemplate,
        chunk,
        dimensions
      );

      // Auto-populate parameters from dimensions if not explicitly set
      if (dimensions?.semanticDimensions && !conversationConfig.explicitParams) {
        conversationConfig.persona = conversationConfig.persona || dimensions.semanticDimensions.persona?.[0];
        conversationConfig.emotion = conversationConfig.emotion || dimensions.semanticDimensions.emotion?.[0];
        
        // Adjust turn count based on complexity
        if (dimensions.semanticDimensions.complexity) {
          const complexity = dimensions.semanticDimensions.complexity;
          conversationConfig.targetTurns = Math.round(8 + (complexity * 8)); // 8-16 turns based on complexity
        }
      }
    }
  }

  // Proceed with regular generation
  const result = await callClaudeAPI(conversationConfig.prompt);
  
  // Store chunk context in conversation
  if (conversationConfig.parentChunkId) {
    result.parentChunkId = conversationConfig.parentChunkId;
    result.chunkContext = chunk?.content?.slice(0, 5000);
    result.dimensionSource = dimensions;
  }

  return result;
}
```

**Task T-5.1.1 & T-5.1.2: Dimension-Driven Parameter Mapping**

3. **Create Mapper Service** `src/lib/generation/dimension-parameter-mapper.ts`:

```typescript
import type { DimensionSource } from '@/lib/types';

interface ParameterSuggestions {
  persona?: string;
  emotion?: string;
  targetTurns: number;
  categories: string[];
  qualityModifier: number; // Adjustment based on dimension confidence
}

export class DimensionParameterMapper {
  /**
   * Map dimensions to conversation generation parameters
   */
  mapDimensionsToParameters(dimensions: DimensionSource): ParameterSuggestions {
    const semantic = dimensions.semanticDimensions;
    
    return {
      persona: semantic?.persona?.[0] || 'neutral',
      emotion: semantic?.emotion?.[0] || 'neutral',
      targetTurns: this.calculateTargetTurns(semantic?.complexity || 0.5),
      categories: semantic?.domain || [],
      qualityModifier: this.calculateQualityModifier(dimensions.confidence)
    };
  }

  /**
   * Calculate target turn count from complexity
   * Simple: 6-8 turns, Complex: 12-16 turns
   */
  private calculateTargetTurns(complexity: number): number {
    // Map 0-1 complexity to 6-16 turn range
    return Math.round(6 + (complexity * 10));
  }

  /**
   * Calculate quality score modifier based on dimension confidence
   */
  private calculateQualityModifier(confidence: number): number {
    // Low confidence (<0.5) reduces quality score by up to 2 points
    // High confidence (>0.8) adds up to 1 point
    if (confidence < 0.5) {
      return -2 * (0.5 - confidence) * 2; // Max -2 at confidence=0
    } else if (confidence > 0.8) {
      return (confidence - 0.8) * 5; // Max +1 at confidence=1
    }
    return 0;
  }
}

export const dimensionParameterMapper = new DimensionParameterMapper();
```

**Task T-6.1.1: Update Quality Scorer with Dimension Confidence**

4. **Extend Quality Scoring** `src/lib/quality/quality-scorer.ts`:

```typescript
import type { QualityMetrics, DimensionSource } from '@/lib/types';

// In QualityScorer class or scoring function:
function calculateQualityScore(
  conversation: Conversation,
  dimensionSource?: DimensionSource
): QualityMetrics {
  const scores = {
    turnCount: scoreTurnCount(conversation.totalTurns),
    length: scoreLength(conversation),
    structure: scoreStructure(conversation),
    dimensionConfidence: dimensionSource?.confidence || 0.7 // Default if no dimensions
  };

  // Weighted quality score
  const WEIGHTS = {
    turnCount: 0.30,
    length: 0.25,
    structure: 0.30,
    dimensionConfidence: 0.15 // 15% weight for dimension confidence
  };

  const overallScore = (
    scores.turnCount * WEIGHTS.turnCount +
    scores.length * WEIGHTS.length +
    scores.structure * WEIGHTS.structure +
    scores.dimensionConfidence * 10 * WEIGHTS.dimensionConfidence
  );

  // Flag as needs_revision if dimension confidence < 0.5
  const needsRevision = dimensionSource ? dimensionSource.confidence < 0.5 : false;

  return {
    overall: overallScore,
    turnCount: scores.turnCount,
    length: scores.length,
    structure: scores.structure,
    dimensionConfidence: scores.dimensionConfidence,
    confidence: needsRevision ? 'low' : scores.dimensionConfidence > 0.8 ? 'high' : 'medium'
  };
}
```

**ACCEPTANCE CRITERIA:**

1. ✅ PromptContextBuilder creates enriched prompts with chunk content
2. ✅ Chunk metadata injected into generation context
3. ✅ Long chunks truncated intelligently (first/last paragraphs preserved)
4. ✅ Generation service detects chunk associations and fetches data
5. ✅ Dimension-driven parameter suggestions implemented
6. ✅ Quality scoring includes dimension confidence (15% weight)
7. ✅ Low dimension confidence (<0.5) flags conversation for review
8. ✅ Audit logs record chunk and dimension usage

**VALIDATION REQUIREMENTS:**

Manual Testing:
1. Link conversation to chunk, trigger generation
2. Verify prompt includes chunk content
3. Verify parameters auto-populated from dimensions
4. Check quality score reflects dimension confidence
5. Confirm audit log shows chunk and dimension IDs

**DELIVERABLES:**

1. `src/lib/generation/prompt-context-builder.ts` (~150 lines)
2. `src/lib/generation/dimension-parameter-mapper.ts` (~100 lines)
3. Updated `src/lib/generation/conversation-generator.ts` (add chunk detection)
4. Updated `src/lib/quality/quality-scorer.ts` (add dimension confidence)
5. Test results showing context injection and parameter mapping work correctly

Implement complete integration ensuring chunk context enhances conversation relevance and quality.

++++++++++++++++++


### Prompt 5: API Endpoints & Dashboard Integration  
**Scope**: Create API endpoints for chunk linking operations and integrate chunk selector into dashboard  
**Dependencies**: Prompts 1-4 complete  
**Estimated Time**: 4-6 hours  
**Risk Level**: Low

========================

You are a senior full-stack developer implementing API endpoints and dashboard integration for chunk linking features.

**IMPLEMENTATION TASKS:**

**Task T-8.1.1-T-8.1.4: API Endpoints**

1. **Create API Routes** (`src/app/api/conversations/[id]/`):

**Link Chunk Endpoint** (`link-chunk/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { linkConversationToChunk } from '@/lib/database';
import { chunksService } from '@/lib/chunks-integration';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { chunkId } = body;

    // Validate chunk exists
    const chunk = await chunksService.getChunkById(chunkId);
    if (!chunk) {
      return NextResponse.json({ error: 'Chunk not found' }, { status: 404 });
    }

    // Link conversation to chunk
    await linkConversationToChunk(
      params.id,
      chunkId,
      chunk.content?.slice(0, 5000),
      chunk.dimensions ? {
        chunkId,
        dimensions: chunk.dimensions,
        confidence: chunk.dimensionConfidence || 0.7,
        extractedAt: new Date().toISOString()
      } : undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link chunk error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Unlink Chunk Endpoint** (`unlink-chunk/route.ts`):
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await unlinkConversationFromChunk(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Get by Chunk Endpoint** (`src/app/api/conversations/by-chunk/[chunkId]/route.ts`):
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { chunkId: string } }
) {
  const conversations = await getConversationsByChunk(params.chunkId);
  return NextResponse.json(conversations);
}
```

**Orphaned Conversations Endpoint** (`src/app/api/conversations/orphaned/route.ts`):
```typescript
export async function GET(request: NextRequest) {
  const orphaned = await getOrphanedConversations();
  return NextResponse.json(orphaned);
}
```

**Task T-7.1.1-T-7.2.1: Dashboard Integration**

2. **Add Chunk Linking to Conversation Table**:

Update `train-wireframe/src/components/dashboard/ConversationTable.tsx`:
- Add "Link to Chunk" action in dropdown menu
- Open ChunkSelector modal on click
- Call link-chunk API on chunk selection

3. **Add Chunk Display in Conversation Detail**:

Update conversation detail view to show linked chunk:
```typescript
{conversation.parentChunkId && (
  <div className="mt-4 p-4 border rounded">
    <h4 className="font-semibold mb-2">Source Chunk</h4>
    <p className="text-sm text-muted-foreground">
      {conversation.chunkContext?.slice(0, 200)}...
    </p>
    <Button variant="outline" size="sm" onClick={() => viewChunkDetail()}>
      View Full Chunk
    </Button>
    <Button variant="ghost" size="sm" onClick={() => unlinkChunk()}>
      Unlink
    </Button>
  </div>
)}
```

4. **Add Orphaned Conversations Filter**:

Add quick filter in FilterBar:
```typescript
<Badge
  variant={activeFilter === 'orphaned' ? 'default' : 'outline'}
  className="cursor-pointer"
  onClick={() => setActiveFilter('orphaned')}
>
  Orphaned ({orphanedCount})
</Badge>
```

**DELIVERABLES:**

1. Four API endpoints created and tested
2. ChunkSelector integrated into conversation table dropdown
3. Chunk information displayed in conversation detail
4. Orphaned conversations filter added
5. All integration points functional end-to-end

Implement complete API layer and dashboard integration for seamless chunk linking workflow.

++++++++++++++++++


### Prompt 6: Testing, Documentation & Final Integration  
**Scope**: Comprehensive testing, documentation, and final integration verification  
**Dependencies**: Prompts 1-5 complete  
**Estimated Time**: 4-6 hours  
**Risk Level**: Low

========================

You are completing the Chunks-Alpha integration with comprehensive testing and documentation.

**IMPLEMENTATION TASKS:**

**Task T-9.1.1-T-9.1.4: Unit & Integration Tests**

1. **ChunksService Tests** (`src/__tests__/chunks-integration/chunks-service.test.ts`):
- Mock Supabase client
- Test getChunkById with valid/invalid IDs
- Test cache hit/miss scenarios
- Test search functionality

2. **DimensionParser Tests** (`src/__tests__/chunks-integration/dimension-parser.test.ts`):
- Test persona extraction with sample dimensions
- Test complexity calculation
- Test confidence validation

3. **Component Tests** (`train-wireframe/src/__tests__/components/chunks/`):
- ChunkSelector rendering and search
- ChunkFilters state management
- ChunkDetailPanel display

4. **API Endpoint Tests** (`src/__tests__/api/conversations/chunks.test.ts`):
- Test link/unlink operations
- Test orphaned query
- Test error handling

**Task T-9.2.1: End-to-End Workflow Test**

5. **E2E Test Scenario**:
```typescript
// Test file: e2e/chunks-integration/workflow.spec.ts
test('Complete chunk linking workflow', async () => {
  // 1. Navigate to conversations dashboard
  // 2. Click "Link to Chunk" on a conversation
  // 3. Search for chunks in ChunkSelector
  // 4. Select a chunk
  // 5. Verify conversation shows linked chunk
  // 6. Generate conversation with chunk context
  // 7. Verify quality score includes dimension confidence
  // 8. Unlink chunk and verify removal
});
```

**Task T-10.1.1-T-10.1.2: Documentation**

6. **Architecture Documentation** (`docs/chunks-integration/architecture.md`):
- System overview with component diagram
- Data flow diagrams
- Integration points with chunks-alpha module

7. **User Guide** (`docs/chunks-integration/user-guide.md`):
- How to link conversations to chunks
- Understanding dimension-driven parameters
- Best practices for chunk selection

8. **API Reference** (`docs/chunks-integration/api-reference.md`):
- Document all four API endpoints
- Request/response schemas
- Error codes and handling

**ACCEPTANCE CRITERIA:**

1. ✅ All unit tests pass (85%+ code coverage)
2. ✅ Integration tests verify API endpoints work
3. ✅ E2E test validates complete workflow
4. ✅ Documentation complete and reviewed
5. ✅ No TypeScript errors or linter warnings
6. ✅ All functional requirements acceptance criteria met

**DELIVERABLES:**

1. Complete test suites with passing results
2. E2E test demonstrating full workflow
3. Three documentation files (architecture, user guide, API reference)
4. Test coverage report showing >85% coverage
5. Final verification checklist completed

Implement comprehensive testing and documentation ensuring production readiness and maintainability.

++++++++++++++++++


## Quality Validation Checklist

### Post-Implementation Verification

After completing all six prompts, verify the following:

**Database & Types:**
- [ ] Database schema migration applied successfully
- [ ] All TypeScript types compile without errors
- [ ] Database queries use indexes efficiently (<100ms)
- [ ] Foreign key constraints working correctly

**Service Layer:**
- [ ] ChunksService fetches chunks with dimensions
- [ ] DimensionParser extracts personas/emotions correctly
- [ ] ChunkCache achieves >70% hit rate
- [ ] Cache metrics tracking functional
- [ ] Error handling prevents generation workflow breaks

**UI Components:**
- [ ] ChunkSelector renders and functions correctly
- [ ] Search debounce working (300ms delay)
- [ ] Filters update chunk list appropriately
- [ ] Selected chunk highlighted visually
- [ ] Detail panel displays chunk content and metadata
- [ ] Keyboard navigation functional (Tab, Enter, Escape)

**Generation Integration:**
- [ ] Chunk content injected into prompts correctly
- [ ] Dimension-driven parameters auto-populated
- [ ] Long chunks truncated intelligently
- [ ] Quality scoring includes dimension confidence
- [ ] Low confidence conversations flagged for review
- [ ] Generation audit logs record chunk/dimension usage

**API Endpoints:**
- [ ] POST /api/conversations/:id/link-chunk works
- [ ] DELETE /api/conversations/:id/unlink-chunk works
- [ ] GET /api/conversations/by-chunk/:chunkId returns correct conversations
- [ ] GET /api/conversations/orphaned returns conversations without chunks
- [ ] All endpoints handle errors gracefully

**Dashboard Integration:**
- [ ] "Link to Chunk" action available in conversation dropdown
- [ ] ChunkSelector modal opens and functions
- [ ] Linked chunk displayed in conversation detail
- [ ] Unlink button removes chunk association
- [ ] Orphaned filter shows conversations without chunks

**Testing & Documentation:**
- [ ] All unit tests pass with >85% coverage
- [ ] Integration tests verify API endpoints
- [ ] E2E test validates complete workflow
- [ ] Architecture documentation complete
- [ ] User guide written and reviewed
- [ ] API reference documents all endpoints

### Cross-Prompt Consistency

- [ ] Consistent naming conventions across all files
- [ ] TypeScript types aligned between frontend and backend
- [ ] Error handling patterns consistent
- [ ] API request/response formats standardized
- [ ] Component styling follows existing patterns
- [ ] Database queries follow established patterns

### Performance Validation

- [ ] Chunk retrieval <200ms (uncached)
- [ ] Chunk retrieval <50ms (cached)
- [ ] ChunkSelector search responsive (no lag)
- [ ] Generation with chunk context completes normally
- [ ] Dashboard performance not degraded by integration
- [ ] Database queries optimized with proper indexes

### Security & Data Integrity

- [ ] Database foreign key constraints enforced
- [ ] API endpoints require authentication
- [ ] Chunk IDs validated before linking
- [ ] No SQL injection vulnerabilities
- [ ] Error messages don't expose sensitive data
- [ ] Audit logs capture all chunk linking operations

## Next Segment Preparation

**For E10 Segment (if applicable):**

This E09 segment completes the Chunks-Alpha integration. Future segments may focus on:

1. **Advanced Features:**
   - Multi-chunk conversations (up to 3 chunks)
   - Chunk relationship visualization
   - Advanced dimension filtering
   - Bulk chunk linking operations

2. **Optimization:**
   - Virtual scrolling for large chunk lists
   - Advanced caching strategies
   - Background chunk preloading
   - Dimension analysis refinement

3. **Analytics:**
   - Chunk usage statistics
   - Dimension mapping effectiveness metrics
   - Quality improvement tracking
   - User workflow analytics

**Integration Dependencies:**
- Chunks-alpha module must remain stable
- Dimension schema (60 dimensions) should not change
- Database schema established here becomes foundation
- Service layer patterns can be extended for future features

**Technical Debt to Address:**
- Consider implementing virtual scrolling for >100 chunks
- Optimize dimension parsing for very large dimension sets
- Add WebSocket support for real-time chunk updates (if needed)
- Enhance error recovery for network failures during generation

---

## Implementation Complete

This execution plan provides comprehensive, step-by-step instructions for implementing Chunks-Alpha module integration into the conversation generation platform. Each prompt is self-contained yet builds upon previous work to create a cohesive, production-ready feature set.

**Total Estimated Time:** 32-40 hours across 6 strategic prompts
**Risk Level:** Medium overall (database changes and integration complexity)
**Success Criteria:** All acceptance criteria met, tests pass, documentation complete

The implementation enables:
- ✅ Traceable conversations linked to source document chunks
- ✅ Context-aware generation using chunk content
- ✅ Dimension-driven parameter selection for higher quality
- ✅ Enhanced quality scoring with dimension confidence
- ✅ Intuitive UI for chunk selection and management
- ✅ Complete API layer for chunk association operations

Execute these prompts sequentially, validating each before proceeding to ensure solid foundation for subsequent work.

