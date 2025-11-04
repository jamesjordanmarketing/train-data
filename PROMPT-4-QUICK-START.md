# Prompt 4 Quick Start Guide: Chunk-Aware Generation

**For Developers**: Get started with context-aware conversation generation in 5 minutes

---

## Installation (Already Complete)

The module has been implemented and is ready to use. No additional installation needed.

**Location**: `src/lib/generation/`

---

## Basic Usage

### 1. Simple Chunk-Aware Generation

```typescript
import { ConversationGenerator } from '@/lib/conversation-generator';

const generator = new ConversationGenerator({
  rateLimitConfig: {
    windowMs: 60000,
    maxRequests: 50,
    enableQueue: true,
  },
});

// Generate conversation linked to a chunk
const result = await generator.generateSingle({
  templateId: 'your-template-id',
  persona: 'professional',  // Fallback if no dimensions
  emotion: 'neutral',       // Fallback if no dimensions
  topic: 'API documentation',
  tier: 'template',
  chunkId: 'chunk-abc-123', // 🔗 Link to chunk
  createdBy: userId,
});

console.log('Generated:', result.id);
console.log('Quality Score:', result.qualityScore);
console.log('Dimension Confidence:', result.qualityBreakdown.dimensionConfidence);
```

**That's it!** The system will automatically:
- ✅ Fetch chunk content and dimensions
- ✅ Inject chunk into prompt
- ✅ Auto-populate parameters (persona, emotion, turns)
- ✅ Adjust quality scoring

---

## Common Use Cases

### Use Case 1: Let Dimensions Drive Everything

```typescript
// Minimal config - dimensions do the work
await generator.generateSingle({
  templateId: 'template-id',
  persona: 'professional', // Only used if no dimensions
  emotion: 'neutral',      // Only used if no dimensions
  topic: 'Your topic',
  tier: 'template',
  chunkId: 'chunk-id',     // Magic happens here ✨
  createdBy: userId,
});

// Result:
// - Persona: "technical" (from dimensions)
// - Emotion: "neutral" (from dimensions)
// - Target Turns: 12 (from complexity: 0.6)
// - Temperature: 0.65 (technical domain)
// - Max Tokens: 1950 (calculated)
```

### Use Case 2: Manual Parameters with Chunk Context

```typescript
// You control params, but get chunk context
await generator.generateSingle({
  templateId: 'template-id',
  persona: 'friendly',    // Your choice
  emotion: 'excited',     // Your choice
  topic: 'Getting started',
  tier: 'template',
  chunkId: 'chunk-id',    // Context still injected ✨
  parameters: {
    explicitParams: true, // Disable auto-population
  },
  temperature: 0.8,       // Your choice
  maxTokens: 2048,        // Your choice
  createdBy: userId,
});
```

### Use Case 3: Check Before Generating

```typescript
import { chunksService, dimensionParser } from '@/lib/generation';

// Check if chunk exists and has dimensions
const hasDims = await chunksService.hasDimensions('chunk-id');

if (hasDims) {
  // Get preview of what parameters will be used
  const { chunk, dimensions } = await chunksService.getChunkWithDimensions('chunk-id');
  const suggestions = dimensionParameterMapper.mapDimensionsToParameters(dimensions);
  
  console.log('Will use:', suggestions);
  // { persona: 'professional', emotion: 'neutral', targetTurns: 12, ... }
  
  // Proceed with generation
  await generator.generateSingle({ chunkId: 'chunk-id', ... });
} else {
  console.warn('No dimensions - using fallback parameters');
}
```

---

## Advanced Usage

### Multi-Chunk Context (Up to 3 chunks)

```typescript
import { promptContextBuilder, chunksService } from '@/lib/generation';

// Fetch multiple related chunks
const chunks = await chunksService.getChunksByIds([
  'intro-chunk',
  'details-chunk',
  'example-chunk',
]);

// Get dimensions from primary chunk
const dimensions = await chunksService.getDimensionsForChunk('intro-chunk');

// Build combined prompt
const enrichedPrompt = promptContextBuilder.buildMultiChunkPrompt(
  'Your template with {{chunk_content}} and {{chunk_metadata}}',
  chunks,
  0, // Primary chunk index
  dimensions
);

// Use enriched prompt in generation...
```

### Custom Template with Placeholders

```typescript
// Your template in database
const templateText = `
Generate a technical conversation about the following content:

{{chunk_content}}

Document Information:
{{chunk_metadata}}

Guidance:
{{dimension_context}}

Ensure the conversation is appropriate for the suggested personas and complexity level.
`;

// The system will automatically replace:
// - {{chunk_content}} → actual chunk text (truncated if needed)
// - {{chunk_metadata}} → "Document: X | Section: Y | Pages: Z"
// - {{dimension_context}} → "Suggested Personas: A, B\nComplexity: 7.5/10\n..."
```

### Direct Access to Components

```typescript
import {
  chunksService,
  dimensionParser,
  promptContextBuilder,
  dimensionParameterMapper,
} from '@/lib/generation';

// Manual workflow (if you need fine-grained control)

// 1. Fetch chunk
const chunk = await chunksService.getChunkById('chunk-id');

// 2. Fetch dimensions
const dimensions = await chunksService.getDimensionsForChunk('chunk-id');

// 3. Validate dimensions
if (!dimensionParser.isValid(dimensions)) {
  console.error('Invalid dimensions');
  return;
}

// 4. Get parameter suggestions
const suggestions = dimensionParameterMapper.mapDimensionsToParameters(dimensions);

// 5. Build enriched prompt
const enrichedPrompt = promptContextBuilder.buildPrompt(
  yourTemplate,
  chunk,
  dimensions
);

// 6. Use in your custom generation logic
const response = await yourCustomGenerator(enrichedPrompt, suggestions);
```

---

## Configuration

### Adjust Chunk Truncation Length

```typescript
import { promptContextBuilder } from '@/lib/generation';

// Default: 5000 chars
promptContextBuilder.setMaxChunkLength(10000); // Increase to 10k

const prompt = promptContextBuilder.buildPrompt(template, chunk, dimensions);
```

### Override Dimension Mapping

```typescript
// Get base suggestions
const suggestions = dimensionParameterMapper.mapDimensionsToParameters(dimensions);

// Override specific params
suggestions.persona = 'custom-persona';
suggestions.targetTurns = 20; // Force 20 turns

// Use in generation
await generator.generateSingle({
  persona: suggestions.persona,
  // ...
  parameters: {
    targetTurns: suggestions.targetTurns,
    explicitParams: true, // Prevent re-override
  },
});
```

---

## Debugging

### Enable Detailed Logging

The system logs chunk/dimension usage automatically:

```typescript
// Generation logs will show:
{
  "conversationId": "conv-123",
  "parameters": {
    "chunkId": "chunk-456",
    "chunkType": "Instructional_Unit",
    "dimensionConfidence": 0.85,
    "dimensionDriven": true,
    "targetTurns": 12,
    "complexity": 0.65
  },
  "requestPayload": {
    "hasChunkContext": true,
    "hasDimensions": true
  }
}
```

### Check What Happened

```typescript
const result = await generator.generateSingle({ chunkId: 'chunk-id', ... });

// Check dimension usage
console.log('Dimension Confidence:', result.qualityBreakdown.dimensionConfidence);

// Check if auto-flagged
if (result.qualityBreakdown.autoFlagged) {
  console.warn('Conversation flagged - check dimension confidence');
}

// Check parameters used (in result.parameters)
console.log('Used Parameters:', result.parameters);
```

### Dimension Confidence Issues

```typescript
// If quality scores are unexpectedly low:
const dimensions = await chunksService.getDimensionsForChunk('chunk-id');

if (dimensions.confidence < 0.5) {
  console.warn('Low dimension confidence:', dimensions.confidence);
  console.log('Suggestion: Re-generate dimensions or use explicit params');
}

// Get detailed dimension info
console.log(dimensionParser.getSummary(dimensions));
// "Confidence: 45% | Complexity: 6.0/10 | Personas: professional | ..."
```

---

## Error Handling

### Graceful Degradation

The system handles missing chunks/dimensions gracefully:

```typescript
// If chunk doesn't exist
await generator.generateSingle({
  chunkId: 'invalid-chunk-id', // ❌ Doesn't exist
  // ...
});
// ✅ Logs warning, proceeds with normal generation (no chunk context)

// If chunk exists but no dimensions
await generator.generateSingle({
  chunkId: 'chunk-without-dimensions', // ⚠️ No dimensions
  // ...
});
// ✅ Logs warning, injects chunk content but uses fallback parameters
```

### Explicit Error Checking

```typescript
try {
  // Pre-check
  const chunk = await chunksService.getChunkById('chunk-id');
  if (!chunk) {
    throw new Error('Chunk not found');
  }
  
  const hasDims = await chunksService.hasDimensions('chunk-id');
  if (!hasDims) {
    console.warn('No dimensions - will use fallbacks');
  }
  
  // Generate
  const result = await generator.generateSingle({ chunkId: 'chunk-id', ... });
  
} catch (error) {
  console.error('Generation failed:', error);
}
```

---

## Testing Your Integration

### Test 1: Verify Chunk Context Injection

```typescript
// Generate with chunk
const result = await generator.generateSingle({
  chunkId: 'test-chunk-id',
  // ...
});

// Check if chunk context was used
const logs = await generationLogService.getByConversationId(result.id);
console.log('Has Chunk Context:', logs.requestPayload.hasChunkContext);
console.log('Has Dimensions:', logs.requestPayload.hasDimensions);
```

### Test 2: Verify Parameter Auto-Population

```typescript
// Before generation
const dimensions = await chunksService.getDimensionsForChunk('chunk-id');
const expected = dimensionParameterMapper.mapDimensionsToParameters(dimensions);
console.log('Expected Turns:', expected.targetTurns);

// Generate
const result = await generator.generateSingle({ chunkId: 'chunk-id', ... });

// Verify
console.log('Actual Turns:', result.turnCount);
console.log('Match:', Math.abs(result.turnCount - expected.targetTurns) <= 2);
```

### Test 3: Verify Quality Adjustment

```typescript
// Generate with high-confidence dimensions
const highConf = await generator.generateSingle({
  chunkId: 'high-confidence-chunk', // confidence: 0.95
  // ...
});

// Generate with low-confidence dimensions
const lowConf = await generator.generateSingle({
  chunkId: 'low-confidence-chunk', // confidence: 0.35
  // ...
});

console.log('High Conf Score:', highConf.qualityScore); // Should be higher
console.log('Low Conf Score:', lowConf.qualityScore);   // Should be lower
console.log('Low Conf Flagged:', lowConf.qualityBreakdown.autoFlagged); // Should be true
```

---

## Performance Tips

### 1. Batch Operations

```typescript
// Get all chunks for a document
const chunks = await chunksService.getChunksForDocument('doc-id');

// Generate conversations in parallel (with concurrency limit)
const results = await generator.generateBatch(
  chunks.map(chunk => ({
    templateId: 'template-id',
    chunkId: chunk.id,
    // ...
  })),
  { concurrency: 3 }
);
```

### 2. Cache Dimensions

```typescript
// Cache dimensions for reuse
const dimensionsCache = new Map();

async function getCachedDimensions(chunkId: string) {
  if (!dimensionsCache.has(chunkId)) {
    const dims = await chunksService.getDimensionsForChunk(chunkId);
    dimensionsCache.set(chunkId, dims);
  }
  return dimensionsCache.get(chunkId);
}

// Use in generation
const dimensions = await getCachedDimensions('chunk-id');
```

### 3. Pre-check Availability

```typescript
// Filter chunks that have dimensions
const chunksWithDims = await Promise.all(
  chunkIds.map(async (id) => ({
    id,
    hasDims: await chunksService.hasDimensions(id),
  }))
);

const validChunks = chunksWithDims.filter(c => c.hasDims).map(c => c.id);

// Only generate for chunks with dimensions
// ...
```

---

## Quick Reference

### Import Statements

```typescript
// Main generator
import { ConversationGenerator } from '@/lib/conversation-generator';

// Generation module
import {
  chunksService,
  dimensionParser,
  promptContextBuilder,
  dimensionParameterMapper,
} from '@/lib/generation';

// Types (if needed)
import type {
  ChunkReference,
  DimensionSource,
  ParameterSuggestions,
} from '@/lib/generation';
```

### Key Methods

| Service | Method | Purpose |
|---------|--------|---------|
| `chunksService` | `.getChunkById(id)` | Fetch chunk as ChunkReference |
| `chunksService` | `.getDimensionsForChunk(id)` | Fetch latest dimensions |
| `chunksService` | `.getChunkWithDimensions(id)` | Fetch both together |
| `chunksService` | `.hasDimensions(id)` | Check if dimensions exist |
| `dimensionParser` | `.isValid(dims)` | Validate dimensions |
| `dimensionParser` | `.getSummary(dims)` | Get human-readable summary |
| `promptContextBuilder` | `.buildPrompt(template, chunk, dims)` | Inject chunk context |
| `dimensionParameterMapper` | `.mapDimensionsToParameters(dims)` | Get param suggestions |

---

## Next Steps

1. **Try it**: Generate a conversation with `chunkId` parameter
2. **Monitor**: Check generation logs for chunk/dimension usage
3. **Tune**: Adjust chunk length, override mappings if needed
4. **Scale**: Use batch operations for multiple chunks
5. **Optimize**: Cache dimensions for repeated use

---

## Need Help?

- **Full Documentation**: `src/lib/generation/README.md`
- **Implementation Summary**: `PROMPT-4-IMPLEMENTATION-SUMMARY.md`
- **Code Examples**: See test cases in `__tests__/` directory
- **Troubleshooting**: Check "Troubleshooting Guide" in README

---

**Happy Generating! 🎉**

