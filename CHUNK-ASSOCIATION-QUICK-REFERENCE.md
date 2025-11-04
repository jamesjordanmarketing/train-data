# Chunk Association - Quick Reference Guide
## For Developers Integrating Chunks-Alpha Module

**Last Updated**: November 3, 2025  
**Implementation Status**: ✅ Complete  
**Test Status**: ✅ All tests passing (13/13)

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Type Definitions](#type-definitions)
3. [Database Service Methods](#database-service-methods)
4. [Common Use Cases](#common-use-cases)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Import Statements
```typescript
// Import database service
import { conversationChunkService } from '@/lib/database';

// Import type definitions
import type { 
  DimensionSource, 
  ChunkReference, 
  Conversation 
} from '@/train-wireframe/src/lib/types';
```

### Basic Usage
```typescript
// Link a conversation to a chunk
await conversationChunkService.linkConversationToChunk(
  'conversation-id',
  'chunk-id',
  'Chunk content...',
  dimensionSourceData
);

// Get conversations for a specific chunk
const conversations = await conversationChunkService.getConversationsByChunk('chunk-id');

// Find conversations without chunk associations
const orphaned = await conversationChunkService.getOrphanedConversations();

// Remove chunk association
await conversationChunkService.unlinkConversationFromChunk('conversation-id');
```

---

## Type Definitions

### DimensionSource
**Purpose**: Store semantic dimension analysis from chunks-alpha module

```typescript
interface DimensionSource {
  chunkId: string;                    // Reference to source chunk
  dimensions: Record<string, number>; // dimension_name: value (0-1 scale)
  confidence: number;                 // Overall confidence (0-1 scale)
  extractedAt: string;                // ISO 8601 timestamp
  semanticDimensions?: {              // Optional semantic mappings
    persona?: string[];               // Suggested personas
    emotion?: string[];               // Suggested emotions
    complexity?: number;              // Complexity score (1-10)
    domain?: string[];                // Topic domains
  };
}
```

**Example**:
```typescript
const dimensionSource: DimensionSource = {
  chunkId: 'chunk-abc-123',
  dimensions: {
    semantic_clarity: 0.85,
    technical_depth: 0.92,
    emotional_tone: 0.35,
    educational_value: 0.88
  },
  confidence: 0.81,
  extractedAt: new Date().toISOString(),
  semanticDimensions: {
    persona: ['technical-expert', 'educator'],
    emotion: ['informative', 'confident'],
    complexity: 8,
    domain: ['software-engineering', 'databases']
  }
};
```

### ChunkReference
**Purpose**: Provide traceability to source document chunks

```typescript
interface ChunkReference {
  id: string;              // Chunk unique identifier
  title: string;           // Chunk title
  content: string;         // Full chunk text
  documentId: string;      // Parent document ID
  documentTitle?: string;  // Parent document title
  sectionHeading?: string; // Document section/chapter
  pageStart?: number;      // Starting page number
  pageEnd?: number;        // Ending page number
}
```

**Example**:
```typescript
const chunkRef: ChunkReference = {
  id: 'chunk-abc-123',
  title: 'Database Normalization Principles',
  content: 'Database normalization is the process...',
  documentId: 'doc-xyz-789',
  documentTitle: 'Advanced Database Design',
  sectionHeading: 'Chapter 3: Schema Optimization',
  pageStart: 45,
  pageEnd: 52
};
```

### Conversation Extensions
**New Fields**:
```typescript
type Conversation = {
  // ... existing fields ...
  parentChunkId?: string;        // UUID of source chunk
  chunkContext?: string;         // Cached chunk content (max 5000 chars)
  dimensionSource?: DimensionSource; // Semantic metadata
};
```

### QualityMetrics Extension
**New Field**:
```typescript
type QualityMetrics = {
  // ... existing fields ...
  dimensionConfidence?: number;  // Confidence from dimension analysis (0-1)
};
```

---

## Database Service Methods

### 1. linkConversationToChunk()
**Purpose**: Create association between conversation and source chunk

```typescript
async linkConversationToChunk(
  conversationId: string,
  chunkId: string,
  chunkContext?: string,
  dimensionSource?: DimensionSource
): Promise<void>
```

**Parameters**:
- `conversationId` - Target conversation UUID
- `chunkId` - Source chunk UUID
- `chunkContext` - Optional cached chunk content (max 5000 chars)
- `dimensionSource` - Optional dimension metadata

**Example**:
```typescript
try {
  await conversationChunkService.linkConversationToChunk(
    'conv-12345',
    'chunk-67890',
    'This chunk discusses database optimization...',
    {
      chunkId: 'chunk-67890',
      dimensions: { technical_depth: 0.89 },
      confidence: 0.85,
      extractedAt: new Date().toISOString()
    }
  );
  console.log('✓ Conversation linked to chunk');
} catch (error) {
  console.error('Error linking conversation:', error);
}
```

**Performance**: <50ms (with proper indexing)

---

### 2. unlinkConversationFromChunk()
**Purpose**: Remove chunk association from conversation

```typescript
async unlinkConversationFromChunk(
  conversationId: string
): Promise<void>
```

**Parameters**:
- `conversationId` - Target conversation UUID

**Example**:
```typescript
try {
  await conversationChunkService.unlinkConversationFromChunk('conv-12345');
  console.log('✓ Chunk association removed');
} catch (error) {
  console.error('Error unlinking conversation:', error);
}
```

**Effect**: Sets `parentChunkId`, `chunkContext`, and `dimensionSource` to `null`

---

### 3. getConversationsByChunk()
**Purpose**: Query all conversations linked to a specific chunk

```typescript
async getConversationsByChunk(
  chunkId: string
): Promise<Conversation[]>
```

**Parameters**:
- `chunkId` - Source chunk UUID

**Returns**: Array of conversations (ordered by created_at DESC)

**Example**:
```typescript
const conversations = await conversationChunkService.getConversationsByChunk('chunk-67890');

console.log(`Found ${conversations.length} conversations for chunk`);
conversations.forEach(conv => {
  console.log(`- ${conv.title} (Quality: ${conv.qualityScore})`);
});
```

**Performance**: <50ms (with parent_chunk_id index)

---

### 4. getOrphanedConversations()
**Purpose**: Find conversations without chunk associations

```typescript
async getOrphanedConversations(): Promise<Conversation[]>
```

**Returns**: Array of conversations where `parentChunkId` is null  
**Filters**: Excludes `draft` and `archived` status

**Example**:
```typescript
const orphaned = await conversationChunkService.getOrphanedConversations();

console.log(`Found ${orphaned.length} orphaned conversations`);
orphaned.forEach(conv => {
  console.log(`- ${conv.title} (Status: ${conv.status})`);
});

// Optionally link them to chunks
for (const conv of orphaned) {
  const chunk = await findBestChunkForConversation(conv);
  if (chunk) {
    await conversationChunkService.linkConversationToChunk(conv.id, chunk.id);
  }
}
```

**Performance**: <100ms (with compound index on parent_chunk_id, status)

---

## Common Use Cases

### Use Case 1: Generate Conversation from Chunk
```typescript
async function generateConversationFromChunk(chunk: ChunkReference) {
  // 1. Extract dimensions from chunk
  const dimensions = await chunksAlphaService.analyzeDimensions(chunk.content);
  
  // 2. Use dimensions to select parameters
  const persona = selectBestPersona(dimensions.semanticDimensions.persona);
  const emotion = selectBestEmotion(dimensions.semanticDimensions.emotion);
  const complexity = dimensions.semanticDimensions.complexity;
  
  // 3. Generate conversation
  const conversation = await conversationService.generate({
    persona,
    emotion,
    complexity,
    context: chunk.content
  });
  
  // 4. Link conversation to chunk with metadata
  await conversationChunkService.linkConversationToChunk(
    conversation.id,
    chunk.id,
    chunk.content.substring(0, 5000), // Cache first 5000 chars
    {
      chunkId: chunk.id,
      dimensions: dimensions.raw,
      confidence: dimensions.confidence,
      extractedAt: new Date().toISOString(),
      semanticDimensions: dimensions.semanticDimensions
    }
  );
  
  return conversation;
}
```

---

### Use Case 2: Quality Scoring with Dimension Confidence
```typescript
async function calculateEnhancedQualityScore(conversation: Conversation) {
  // Get base quality metrics
  const baseMetrics = await qualityScorer.score(conversation);
  
  // Factor in dimension confidence if available
  let dimensionConfidence = 0.5; // default
  if (conversation.dimensionSource) {
    dimensionConfidence = conversation.dimensionSource.confidence;
  }
  
  // Calculate enhanced overall score
  const enhancedScore = {
    ...baseMetrics,
    dimensionConfidence,
    overall: (baseMetrics.overall * 0.8) + (dimensionConfidence * 0.2)
  };
  
  return enhancedScore;
}
```

---

### Use Case 3: Chunk-based Analytics
```typescript
async function analyzeChunkPerformance(chunkId: string) {
  // Get all conversations for chunk
  const conversations = await conversationChunkService.getConversationsByChunk(chunkId);
  
  // Calculate analytics
  const analytics = {
    totalConversations: conversations.length,
    avgQualityScore: conversations.reduce((sum, c) => sum + c.qualityScore, 0) / conversations.length,
    approvalRate: conversations.filter(c => c.status === 'approved').length / conversations.length,
    statusBreakdown: conversations.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  return analytics;
}
```

---

### Use Case 4: Bulk Chunk Association (Migration)
```typescript
async function linkExistingConversationsToChunks() {
  // 1. Get orphaned conversations
  const orphaned = await conversationChunkService.getOrphanedConversations();
  console.log(`Processing ${orphaned.length} orphaned conversations...`);
  
  // 2. Process in batches
  const batchSize = 50;
  for (let i = 0; i < orphaned.length; i += batchSize) {
    const batch = orphaned.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (conv) => {
      try {
        // Find best matching chunk (implement your logic)
        const chunk = await findBestChunkForConversation(conv);
        
        if (chunk) {
          // Get dimension analysis
          const dimensions = await chunksAlphaService.analyzeDimensions(chunk.content);
          
          // Link conversation to chunk
          await conversationChunkService.linkConversationToChunk(
            conv.id,
            chunk.id,
            chunk.content.substring(0, 5000),
            {
              chunkId: chunk.id,
              dimensions: dimensions.raw,
              confidence: dimensions.confidence,
              extractedAt: new Date().toISOString()
            }
          );
          
          console.log(`✓ Linked: ${conv.title} → ${chunk.title}`);
        }
      } catch (error) {
        console.error(`Error processing conversation ${conv.id}:`, error);
      }
    }));
    
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}`);
  }
}
```

---

## Best Practices

### 1. Performance Optimization
```typescript
// ✅ DO: Cache chunk context when linking
await conversationChunkService.linkConversationToChunk(
  convId,
  chunkId,
  chunk.content.substring(0, 5000), // Cache for fast access
  dimensionData
);

// ❌ DON'T: Leave chunk context empty if available
await conversationChunkService.linkConversationToChunk(
  convId,
  chunkId,
  null, // Missed optimization opportunity
  dimensionData
);
```

### 2. Error Handling
```typescript
// ✅ DO: Handle foreign key constraint errors
try {
  await conversationChunkService.linkConversationToChunk(convId, chunkId);
} catch (error) {
  if (error.code === '23503') { // Foreign key violation
    console.error('Chunk does not exist:', chunkId);
  } else {
    console.error('Unexpected error:', error);
  }
}

// ❌ DON'T: Ignore error types
try {
  await conversationChunkService.linkConversationToChunk(convId, chunkId);
} catch (error) {
  console.error('Error:', error); // Too generic
}
```

### 3. Data Validation
```typescript
// ✅ DO: Validate dimension confidence range
function validateDimensionSource(data: DimensionSource): boolean {
  if (data.confidence < 0 || data.confidence > 1) {
    throw new Error('Confidence must be between 0 and 1');
  }
  
  for (const [name, value] of Object.entries(data.dimensions)) {
    if (value < 0 || value > 1) {
      throw new Error(`Dimension ${name} value must be between 0 and 1`);
    }
  }
  
  return true;
}

// ❌ DON'T: Trust external data without validation
await conversationChunkService.linkConversationToChunk(
  convId,
  chunkId,
  null,
  externalDimensionData // No validation!
);
```

### 4. Chunk Context Truncation
```typescript
// ✅ DO: Truncate intelligently at word boundaries
function truncateChunkContext(content: string, maxLength: number = 5000): string {
  if (content.length <= maxLength) return content;
  
  const truncated = content.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

// ❌ DON'T: Hard cut mid-word
const context = chunk.content.substring(0, 5000); // May cut mid-word
```

---

## Troubleshooting

### Problem: "Foreign key violation" error when linking
**Cause**: Chunk ID doesn't exist in chunks table  
**Solution**: 
```typescript
// Verify chunk exists first
const chunkExists = await verifyChunkExists(chunkId);
if (!chunkExists) {
  console.error('Chunk not found:', chunkId);
  return;
}
await conversationChunkService.linkConversationToChunk(convId, chunkId);
```

---

### Problem: Slow query performance on getConversationsByChunk()
**Cause**: Missing database index on `parent_chunk_id`  
**Solution**: Run migration SQL:
```sql
CREATE INDEX idx_conversations_parent_chunk_id 
ON conversations(parent_chunk_id) 
WHERE parent_chunk_id IS NOT NULL;
```

---

### Problem: TypeScript error "Property 'dimensionSource' does not exist"
**Cause**: Types not imported correctly  
**Solution**:
```typescript
// Import from correct location
import type { Conversation, DimensionSource } from '@/train-wireframe/src/lib/types';

// NOT from:
// import type { Conversation } from '@/lib/types'; // Wrong path
```

---

### Problem: Orphaned conversations query returns drafts
**Cause**: Status filter not working  
**Solution**: 
```typescript
// The service method already filters, but if you need custom logic:
const orphaned = await conversationChunkService.getOrphanedConversations();
const filtered = orphaned.filter(c => 
  c.status !== 'draft' && 
  c.status !== 'archived'
);
```

---

## Performance Benchmarks

| Operation | Expected Time | With Index | Without Index |
|-----------|--------------|------------|---------------|
| linkConversationToChunk() | <50ms | ✓ | N/A |
| getConversationsByChunk() | <50ms | ✓ | ~500ms |
| getOrphanedConversations() | <100ms | ✓ | ~800ms |
| unlinkConversationFromChunk() | <50ms | N/A | N/A |

**Required Indexes**:
1. `idx_conversations_parent_chunk_id` on `parent_chunk_id`
2. Compound index on `(parent_chunk_id, status)` for orphaned query

---

## Additional Resources

- **Implementation Summary**: See `CHUNK-ASSOCIATION-IMPLEMENTATION-SUMMARY.md`
- **Test Suite**: `src/lib/__tests__/chunk-association.test.ts`
- **Type Definitions**: `train-wireframe/src/lib/types.ts`
- **Database Service**: `src/lib/database.ts`

---

## Support

**Questions?** Check the JSDoc comments in the source code  
**Issues?** Review the test suite for examples  
**Performance?** Verify database indexes are created

---

**Last Updated**: November 3, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅

