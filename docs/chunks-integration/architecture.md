# Chunks-Alpha Integration Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Integration Points](#integration-points)
5. [Database Schema](#database-schema)
6. [API Architecture](#api-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [Security Considerations](#security-considerations)

---

## System Overview

The Chunks-Alpha integration enables the conversation generation system to leverage semantic chunk data and 60-dimension analysis from the chunks-alpha module. This integration provides dimension-driven parameter injection, improving conversation quality and relevance.

### Key Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Interface Layer                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │  ChunkSelector   │  │  ChunkFilters    │  │ChunkDetailPanel││
│  │   Component      │  │   Component      │  │   Component    ││
│  └──────────────────┘  └──────────────────┘  └────────────────┘│
└────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────┴────────────────────────────────┐
│                      API Layer (Next.js)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ Link Chunk API  │  │ Unlink Chunk API│  │ Orphaned API     │ │
│  │ POST /[id]/link │  │ DELETE /[id]/un │  │ GET /orphaned    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────┴────────────────────────────────┐
│                      Service Layer                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ChunksIntegration│  │ ChunksService   │  │ DimensionParser  │ │
│  │    Service      │  │   (train-wire)  │  │                  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ ConversationSvc │  │  ChunkCache     │                       │
│  │                 │  │                 │                       │
│  └─────────────────┘  └─────────────────┘                       │
└────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────┴────────────────────────────────┐
│                      Data Layer (Supabase)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ conversations   │  │    chunks       │  │chunk_dimensions  │ │
│  │     table       │  │    table        │  │     table        │ │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │   documents     │  │   chunk_runs    │                       │
│  │     table       │  │     table       │                       │
│  └─────────────────┘  └─────────────────┘                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

#### 1. ChunkSelector Component
**Location**: `train-wireframe/src/components/chunks/ChunkSelector.tsx`

**Responsibilities**:
- Display searchable list of chunks
- Implement debounced search (300ms delay)
- Handle keyboard navigation
- Manage chunk selection state
- Integrate with filters and detail panel

**Props**:
```typescript
interface ChunkSelectorProps {
  onSelect: (chunkId: string, chunk: ChunkWithDimensions) => void;
  selectedChunkId?: string;
  documentId?: string; // Pre-filter to specific document
  className?: string;
}
```

**State Management**:
- Search query (local state)
- Chunk list (fetched from API)
- Selected chunk (local state)
- Filters (passed to child component)
- Loading/error states

#### 2. ChunkFilters Component
**Location**: `train-wireframe/src/components/chunks/ChunkFilters.tsx`

**Responsibilities**:
- Provide document dropdown filter
- Quality score slider (0-10 scale)
- Active filters display
- Clear filters functionality

**Props**:
```typescript
interface ChunkFiltersProps {
  filters: ChunkFilters;
  onFiltersChange: (filters: ChunkFilters) => void;
  availableDocuments?: Array<{ id: string; title: string }>;
  className?: string;
}
```

#### 3. ChunkDetailPanel Component
**Location**: `train-wireframe/src/components/chunks/ChunkDetailPanel.tsx`

**Responsibilities**:
- Display full chunk content
- Show quality metrics and confidence scores
- Visualize semantic dimensions
- Provide selection action

**Features**:
- Scrollable content area
- Quality score color-coding (green: ≥0.8, yellow: 0.6-0.8, orange: <0.6)
- Top 5 dimension visualization
- Semantic category badges

### Backend Services

#### 1. ChunksIntegrationService
**Location**: `src/lib/generation/chunks-integration.ts`

**Key Methods**:
```typescript
class ChunksIntegrationService {
  async getChunkById(chunkId: string): Promise<ChunkReference | null>
  async getChunksByIds(chunkIds: string[]): Promise<ChunkReference[]>
  async getDimensionsForChunk(chunkId: string): Promise<DimensionSource | null>
  async getChunkWithDimensions(chunkId: string): Promise<{chunk, dimensions} | null>
  async hasDimensions(chunkId: string): Promise<boolean>
  async getChunksForDocument(documentId: string): Promise<ChunkReference[]>
}
```

**Design Patterns**:
- Singleton pattern for service instance
- Async/await for all database operations
- Null object pattern for missing data
- Error handling with graceful degradation

#### 2. ChunksService (Train-Wireframe)
**Location**: `train-wireframe/src/lib/chunks-integration/chunks-service.ts`

**Key Features**:
- Supabase client integration
- In-memory caching (LRU cache)
- Performance optimizations:
  - Target: <200ms for single chunk retrieval
  - Cache hit target: <50ms
  - Batch operations support

**Key Methods**:
```typescript
class ChunksService {
  async getChunkById(chunkId: string): Promise<ChunkWithDimensions | null>
  async getChunksByDocument(documentId: string, options): Promise<ChunkWithDimensions[]>
  async getDimensionsForChunk(chunkId: string): Promise<DimensionSource | null>
  async searchChunks(query: string, options): Promise<ChunkWithDimensions[]>
  async getChunkCount(documentId: string): Promise<number>
  
  // Cache management
  invalidateChunkCache(chunkId: string): void
  clearCache(): void
  getCacheMetrics(): CacheMetrics
}
```

#### 3. DimensionParser
**Location**: `src/lib/generation/chunks-integration.ts`

**Key Methods**:
```typescript
class DimensionParser {
  isValid(dimensions: DimensionSource): boolean
  isHighConfidence(dimensions: DimensionSource): boolean  // ≥0.8
  isComplexContent(dimensions: DimensionSource): boolean  // ≥0.7
  getPrimaryPersona(dimensions: DimensionSource): string
  getPrimaryEmotion(dimensions: DimensionSource): string
  getSummary(dimensions: DimensionSource): string
}
```

---

## Data Flow

### 1. Chunk Linking Workflow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  Click   │────▶│  Fetch   │────▶│  Display │
│  Action  │     │  Link    │     │  Chunks  │     │  Modal   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                          │
                                                          ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Update  │◀────│  Link    │◀────│  Select  │◀────│  Search/ │
│   UI     │     │   API    │     │  Chunk   │     │  Filter  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

**Detailed Flow**:

1. **User Initiates Linking**
   - User clicks "Link to Chunk" button on conversation
   - Frontend opens ChunkSelector modal
   - Initial chunk list fetched from API

2. **Search and Filter**
   - User types in search box (debounced 300ms)
   - Or applies filters (quality, document)
   - ChunksService.searchChunks() called
   - Results displayed in scrollable list

3. **Chunk Selection**
   - User clicks on chunk card
   - ChunkDetailPanel opens with full details
   - User confirms selection
   - POST /api/conversations/[id]/link-chunk called

4. **API Processing**
   ```typescript
   // Pseudo-code
   1. Validate chunk exists: chunksService.getChunkById()
   2. Fetch dimensions: chunksService.getDimensionsForChunk()
   3. Link to conversation: conversationService.linkConversationToChunk()
   4. Return success response
   ```

5. **UI Update**
   - Modal closes
   - Conversation shows linked chunk indicator
   - Chunk title and metadata displayed

### 2. Conversation Generation with Chunks

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│Generate  │────▶│ Fetch    │────▶│ Inject   │────▶│  Call    │
│  Button  │     │ Linked   │     │ Params   │     │  AI API  │
└──────────┘     │ Chunk    │     └──────────┘     └──────────┘
                 └──────────┘           │                 │
                      │                 ▼                 ▼
                      │           ┌──────────┐     ┌──────────┐
                      │           │Dimension │     │Generated │
                      └──────────▶│  Data    │────▶│ Content  │
                                  └──────────┘     └──────────┘
```

**Generation Flow**:

1. **Retrieve Chunk Data**
   - Get linked chunk ID from conversation record
   - Fetch chunk content and dimensions
   - Parse semantic dimensions

2. **Parameter Injection**
   ```typescript
   // Extract dimension-driven parameters
   const persona = dimensionParser.getPrimaryPersona(dimensions);
   const emotion = dimensionParser.getPrimaryEmotion(dimensions);
   const complexity = dimensions.semanticDimensions.complexity;
   
   // Inject into generation prompt
   const prompt = buildPrompt({
     chunkContent: chunk.content,
     persona: persona,
     emotion: emotion,
     complexity: complexity,
     ...otherParams
   });
   ```

3. **Quality Score Calculation**
   - Base quality from AI generation
   - Enhanced with dimension confidence
   - Final score = (baseQuality * 0.7) + (dimensionConfidence * 0.3)

---

## Integration Points

### 1. Database Integration (Supabase)

**Connection Setup**:
```typescript
// Supabase client for chunks-alpha database
const chunksSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Main conversation database
const conversationSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

**Tables Used**:
- `chunks`: Chunk text content and metadata
- `chunk_dimensions`: 60-dimension analysis results
- `chunk_runs`: Dimension generation runs
- `documents`: Source documents
- `conversations`: Conversation records (includes chunk_id foreign key)

### 2. Conversation Service Integration

**Method**: `linkConversationToChunk()`

```typescript
async linkConversationToChunk(
  conversationId: string,
  chunkId: string,
  chunkContent: string,
  dimensions?: DimensionSource
): Promise<void> {
  await this.supabase
    .from('conversations')
    .update({
      chunk_id: chunkId,
      chunk_content_preview: chunkContent.slice(0, 500),
      dimension_confidence: dimensions?.confidence,
      semantic_dimensions: dimensions?.semanticDimensions,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);
}
```

### 3. Generation Pipeline Integration

**Injection Point**: Before AI API call

```typescript
// In conversation-generator.ts
if (conversation.chunk_id) {
  const chunkData = await chunksService.getChunkWithDimensions(conversation.chunk_id);
  
  if (chunkData) {
    // Inject chunk context
    promptParams.sourceContent = chunkData.chunk.content;
    
    // Inject dimension parameters
    if (chunkData.dimensions) {
      promptParams.persona = dimensionParser.getPrimaryPersona(chunkData.dimensions);
      promptParams.emotion = dimensionParser.getPrimaryEmotion(chunkData.dimensions);
      promptParams.complexity = chunkData.dimensions.semanticDimensions.complexity;
    }
  }
}
```

---

## Database Schema

### conversations Table Enhancement

```sql
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS chunk_id UUID REFERENCES chunks(id);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS chunk_content_preview TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS dimension_confidence DECIMAL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS semantic_dimensions JSONB;

CREATE INDEX idx_conversations_chunk_id ON conversations(chunk_id);
CREATE INDEX idx_conversations_orphaned ON conversations(chunk_id) WHERE chunk_id IS NULL;
```

### chunks Table (chunks-alpha module)

```sql
CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chunk_id TEXT NOT NULL UNIQUE,
  document_id UUID REFERENCES documents(id),
  chunk_type TEXT,
  section_heading TEXT,
  page_start INTEGER,
  page_end INTEGER,
  char_start INTEGER,
  char_end INTEGER,
  token_count INTEGER,
  overlap_tokens INTEGER,
  chunk_handle TEXT,
  chunk_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### chunk_dimensions Table

```sql
CREATE TABLE chunk_dimensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chunk_id UUID REFERENCES chunks(id),
  run_id UUID REFERENCES chunk_runs(id),
  
  -- Content dimensions
  chunk_summary_1s TEXT,
  key_terms TEXT[],
  audience TEXT,
  intent TEXT,
  tone_voice_tags TEXT[],
  brand_persona_tags TEXT[],
  domain_tags TEXT[],
  
  -- Task dimensions
  task_name TEXT,
  preconditions TEXT,
  inputs TEXT,
  steps_json JSONB,
  expected_output TEXT,
  
  -- CER dimensions
  claim TEXT,
  evidence_snippets TEXT[],
  reasoning_sketch TEXT,
  factual_confidence_0_1 DECIMAL,
  
  -- Meta dimensions
  generation_confidence_precision DECIMAL,
  generation_confidence_accuracy DECIMAL,
  
  generated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Architecture

### Endpoint Specifications

#### 1. POST /api/conversations/[id]/link-chunk

**Request**:
```typescript
{
  chunkId: string;
}
```

**Response (Success)**:
```typescript
{
  success: true;
}
```

**Response (Error)**:
```typescript
{
  error: string;
  details?: string;
}
```

**Status Codes**:
- 200: Success
- 400: Missing chunkId
- 404: Chunk not found
- 500: Internal server error

#### 2. DELETE /api/conversations/[id]/unlink-chunk

**Request**: No body

**Response**:
```typescript
{
  success: true;
}
```

**Status Codes**:
- 200: Success
- 500: Internal server error

#### 3. GET /api/conversations/orphaned

**Request**: No parameters

**Response**:
```typescript
Array<{
  id: string;
  title: string;
  created_at: string;
  status: string;
}>
```

**Status Codes**:
- 200: Success
- 500: Internal server error

---

## Frontend Architecture

### State Management

**Local Component State**:
- ChunkSelector: search query, selected chunk, loading/error
- ChunkFilters: filter values, show/hide state
- ChunkDetailPanel: modal open/close

**Server State (React Query)**:
- Chunk search results
- Chunk details
- Orphaned conversations list

**Cache Strategy**:
```typescript
// React Query configuration
{
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
}
```

### Performance Optimizations

1. **Debounced Search**: 300ms delay to reduce API calls
2. **Virtual Scrolling**: For large chunk lists (future enhancement)
3. **Lazy Loading**: Load chunk details only when selected
4. **Caching**: In-memory cache for frequently accessed chunks
5. **Optimistic Updates**: Update UI before API confirmation

### Error Handling

```typescript
// Error boundary for chunk components
<ErrorBoundary
  fallback={<ChunkErrorFallback />}
  onError={(error) => logError('ChunkSelector', error)}
>
  <ChunkSelector {...props} />
</ErrorBoundary>
```

---

## Security Considerations

### Authentication
- All API endpoints require authenticated user
- JWT token validation on server side
- Row-level security (RLS) policies in Supabase

### Authorization
- Users can only link chunks to their own conversations
- Read-only access to chunks-alpha database
- No direct writes to chunk tables from conversation module

### Data Validation
- Input sanitization on all API endpoints
- Chunk ID validation (UUID format)
- Content length limits (5000 chars for preview)

### Rate Limiting
- Search API: 100 requests/minute per user
- Link/Unlink API: 50 requests/minute per user
- Implemented using Next.js middleware

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│              Production Environment                  │
│                                                      │
│  ┌──────────────┐         ┌──────────────┐          │
│  │   Vercel     │         │   Supabase   │          │
│  │  (Next.js)   │◀───────▶│  (Postgres)  │          │
│  │              │         │              │          │
│  │  - API Routes│         │  - chunks DB │          │
│  │  - Frontend  │         │  - convos DB │          │
│  └──────────────┘         └──────────────┘          │
│         │                                            │
│         ▼                                            │
│  ┌──────────────┐         ┌──────────────┐          │
│  │   CDN        │         │   Redis      │          │
│  │  (Static)    │         │   (Cache)    │          │
│  └──────────────┘         └──────────────┘          │
└─────────────────────────────────────────────────────┘
```

### Environment Variables

```env
# Chunks-Alpha Database (Read-only)
VITE_SUPABASE_URL=https://chunks-alpha.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Main Application Database
NEXT_PUBLIC_SUPABASE_URL=https://main-app.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Feature Flags
ENABLE_CHUNK_LINKING=true
ENABLE_DIMENSION_PARSING=true

# Performance
CHUNK_CACHE_SIZE=1000
CHUNK_CACHE_TTL=300000  # 5 minutes
```

---

## Future Enhancements

1. **Real-time Dimension Updates**
   - WebSocket integration for live dimension generation
   - Progressive loading of dimension analysis

2. **Advanced Search**
   - Full-text search with PostgreSQL ts_vector
   - Semantic search using embeddings
   - Faceted search with multiple dimensions

3. **Batch Operations**
   - Link multiple conversations to same chunk
   - Bulk unlink operations
   - Chunk assignment recommendations

4. **Analytics Dashboard**
   - Most popular chunks
   - Dimension confidence distribution
   - Link/unlink patterns

5. **Version Control**
   - Track chunk dimension history
   - Compare dimension versions
   - Rollback to previous versions

---

## Conclusion

The Chunks-Alpha integration provides a robust, scalable architecture for leveraging semantic chunk data in conversation generation. The modular design ensures maintainability, while performance optimizations guarantee a smooth user experience.

For implementation details, see:
- [User Guide](./user-guide.md)
- [API Reference](./api-reference.md)

