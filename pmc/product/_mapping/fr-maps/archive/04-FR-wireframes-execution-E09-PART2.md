### Prompt 3: Dimension Extraction Pipeline
**Scope**: Extract conversation parameters from chunk's 60-dimensional analysis  
**Dependencies**: Prompt 1 (conversation-chunk-service), Prompt 2 (dimension-mapping-config)  
**Estimated Time**: 16-20 hours  
**Risk Level**: Medium-High

========================

You are a senior developer implementing the Dimension Extraction Pipeline for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This is the core intelligence layer that transforms 60-dimensional chunk analysis into conversation generation parameters. When a user selects a chunk, this pipeline automatically derives persona, emotion, topic, intent, tone, and complexity settings, eliminating manual parameter selection and ensuring conversations are contextually aligned with source material.

**Specific Functional Requirement (FR9.1.2):**
- **FR9.1.2**: Dimension-Driven Generation - Use chunk's 60-dimensional semantic analysis to inform conversation generation parameters

**Technical Architecture:**
- Pipeline Pattern / ETL (Extract-Transform-Load)
- TypeScript strict mode
- Must complete extraction within 200ms per chunk
- Support batch extraction for multiple chunks (parallel processing)
- Comprehensive logging for debugging and audit

**Integration Points:**
- Consumes: conversationChunkService (Prompt 1), dimension-mapping-config (Prompt 2)
- Produces: ConversationParameters object ready for generation
- Used by: Generation API routes, UI auto-population

**Quality Requirements:**
- 90% code coverage
- Extraction must complete within 200ms for single chunk
- Must handle missing dimensions gracefully with defaults
- Log all extraction decisions for transparency

**CURRENT CODEBASE STATE:**

**Available Services:**
```typescript
// From Prompt 1
import { conversationChunkService } from './conversation-chunk-service';
// From Prompt 2
import { getMappingProfile, DimensionMappingProfile } from './dimension-mapping-config';
```

**Target Output Type** (define in this prompt):
```typescript
export type ConversationParameters = {
  persona: string;
  emotion: string;
  topic: string;
  intent: string;
  tone: string;
  complexity: 'low' | 'medium' | 'high';
  turnCount: number; // Derived from complexity
  confidence: {
    overall: number; // 0-1
    persona: number;
    emotion: number;
    topic: number;
  };
  sourceChunkId: string;
  extractionMetadata: {
    profile: string;
    timestamp: string;
    dimensionsUsed: string[];
    fallbacksApplied: string[];
  };
};
```

**IMPLEMENTATION TASKS:**

Create new file: `src/lib/dimension-extraction-service.ts`

**Task 1: Implement Persona Extraction**

```typescript
/**
 * Extract persona from chunk dimensions
 * Priority order:
 * 1. audience dimension (direct mapping)
 * 2. brand_persona_tags (lookup mapping)
 * 3. tone_voice_tags (inferred mapping)
 * 4. Fallback: 'Confident Entrepreneur'
 */
async function extractPersona(
  dimensions: ChunkDimensions,
  profile: DimensionMappingProfile
): Promise<{ persona: string; confidence: number; source: string }> {
  // Implementation logic
}
```

**Logic:**
1. Check if `dimensions.audience` exists and has mapping in profile
2. Calculate confidence based on dimension's generation_confidence_precision
3. If audience missing or low confidence, try brand_persona_tags
4. If still no match, use fallback value
5. Return persona + confidence score + source dimension name

**Task 2: Implement Emotion Extraction**

```typescript
/**
 * Extract emotion from chunk dimensions
 * Priority order:
 * 1. scenario_type dimension (lookup to emotion)
 * 2. tone_voice_tags (inferred emotion)
 * 3. problem_context (if mentions crisis/success/learning)
 * 4. Fallback: 'Curiosity'
 */
async function extractEmotion(
  dimensions: ChunkDimensions,
  profile: DimensionMappingProfile
): Promise<{ emotion: string; confidence: number; source: string }> {
  // Implementation logic
}
```

**Logic:**
1. If scenario_type exists, use lookup table from mapping profile
2. Analyze tone_voice_tags for emotional indicators
3. Parse problem_context text for keywords (crisis → Fear, success → Confidence, learning → Curiosity)
4. Weight multiple signals and select highest confidence
5. Return emotion + confidence + source

**Task 3: Implement Topic Extraction**

```typescript
/**
 * Extract topic from chunk dimensions
 * Priority order:
 * 1. chunk_summary_1s (use as-is if concise)
 * 2. task_name (for procedural chunks)
 * 3. claim (for CER chunks)
 * 4. problem_context (for scenario chunks)
 * 5. key_terms (combine top 3 terms)
 */
async function extractTopic(
  dimensions: ChunkDimensions
): Promise<{ topic: string; confidence: number; source: string }> {
  // Implementation logic
}
```

**Logic:**
1. Prefer explicit summary if length < 100 characters
2. For task chunks, use task_name
3. For CER chunks, use claim
4. For scenario chunks, use problem_context (first sentence)
5. Fallback: join first 3 key_terms with commas
6. Sanitize topic (trim, capitalize first letter)

**Task 4: Implement Complexity and Turn Count Derivation**

```typescript
/**
 * Calculate complexity from multiple dimension signals
 * Factors:
 * - Task step count (steps_json.length)
 * - Factual confidence (low confidence = high complexity)
 * - Domain tags count (more domains = more complex)
 * - Token count (longer chunks = more complex)
 */
async function deriveComplexity(
  chunk: Chunk,
  dimensions: ChunkDimensions
): Promise<{ complexity: 'low' | 'medium' | 'high'; turnCount: number; confidence: number }> {
  let complexityScore = 0; // 0-100
  
  // Factor 1: Task steps (0-30 points)
  if (dimensions.steps_json) {
    const stepCount = dimensions.steps_json.length || 0;
    complexityScore += Math.min(stepCount * 3, 30);
  }
  
  // Factor 2: Factual confidence (0-25 points)
  // Lower confidence = higher complexity
  if (dimensions.factual_confidence_0_1 !== null) {
    complexityScore += (1 - dimensions.factual_confidence_0_1) * 25;
  }
  
  // Factor 3: Domain tags (0-20 points)
  if (dimensions.domain_tags) {
    complexityScore += Math.min(dimensions.domain_tags.length * 5, 20);
  }
  
  // Factor 4: Token count (0-25 points)
  const tokenRatio = chunk.token_count / 1000; // Normalize to 1000 tokens
  complexityScore += Math.min(tokenRatio * 25, 25);
  
  // Classify complexity
  let complexity: 'low' | 'medium' | 'high';
  let turnCount: number;
  
  if (complexityScore < 30) {
    complexity = 'low';
    turnCount = Math.floor(Math.random() * (6 - 4 + 1)) + 4; // 4-6
  } else if (complexityScore < 60) {
    complexity = 'medium';
    turnCount = Math.floor(Math.random() * (12 - 8 + 1)) + 8; // 8-12
  } else {
    complexity = 'high';
    turnCount = Math.floor(Math.random() * (20 - 14 + 1)) + 14; // 14-20
  }
  
  return {
    complexity,
    turnCount,
    confidence: complexityScore / 100
  };
}
```

**Task 5: Implement Main Extraction Function**

```typescript
/**
 * Extract all conversation parameters from chunk
 * @param chunkId - Chunk ID to extract parameters from
 * @param profileName - Mapping profile to use ('conservative' | 'balanced' | 'aggressive')
 * @param runId - Optional specific dimension run ID
 * @returns Complete conversation parameters ready for generation
 */
export async function extractConversationParameters(
  chunkId: string,
  profileName: string = 'balanced',
  runId?: string
): Promise<ConversationParameters> {
  const startTime = Date.now();
  
  try {
    // Step 1: Fetch chunk with dimensions
    const chunkWithDimensions = await conversationChunkService.getChunkWithDimensions(chunkId, runId);
    const { chunk, dimensions } = chunkWithDimensions;
    
    // Step 2: Get mapping profile
    const profile = getMappingProfile(profileName);
    
    // Step 3: Extract all parameters in parallel
    const [personaResult, emotionResult, topicResult, complexityResult] = await Promise.all([
      extractPersona(dimensions, profile),
      extractEmotion(dimensions, profile),
      extractTopic(dimensions),
      deriveComplexity(chunk, dimensions)
    ]);
    
    // Step 4: Assemble result
    const parameters: ConversationParameters = {
      persona: personaResult.persona,
      emotion: emotionResult.emotion,
      topic: topicResult.topic,
      intent: dimensions.intent || 'inform',
      tone: dimensions.tone_voice_tags?.[0] || 'Professional',
      complexity: complexityResult.complexity,
      turnCount: complexityResult.turnCount,
      confidence: {
        overall: (personaResult.confidence + emotionResult.confidence + topicResult.confidence + complexityResult.confidence) / 4,
        persona: personaResult.confidence,
        emotion: emotionResult.confidence,
        topic: topicResult.confidence
      },
      sourceChunkId: chunkId,
      extractionMetadata: {
        profile: profileName,
        timestamp: new Date().toISOString(),
        dimensionsUsed: [
          personaResult.source,
          emotionResult.source,
          topicResult.source
        ],
        fallbacksApplied: []
      }
    };
    
    // Step 5: Log extraction
    const duration = Date.now() - startTime;
    console.log(`[Dimension Extraction] Completed in ${duration}ms`, {
      chunkId,
      profile: profileName,
      confidence: parameters.confidence.overall
    });
    
    return parameters;
    
  } catch (error) {
    console.error('[Dimension Extraction] Failed:', error);
    throw new Error(`Failed to extract parameters from chunk ${chunkId}: ${error.message}`);
  }
}
```

**Task 6: Implement Batch Extraction**

```typescript
/**
 * Extract parameters from multiple chunks in parallel
 * @param chunkIds - Array of chunk IDs
 * @param profileName - Mapping profile
 * @param concurrency - Max parallel extractions (default 3)
 */
export async function extractBatchParameters(
  chunkIds: string[],
  profileName: string = 'balanced',
  concurrency: number = 3
): Promise<Map<string, ConversationParameters>> {
  const results = new Map<string, ConversationParameters>();
  
  // Process in batches of 'concurrency'
  for (let i = 0; i < chunkIds.length; i += concurrency) {
    const batch = chunkIds.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(chunkId => 
        extractConversationParameters(chunkId, profileName)
          .catch(error => ({
            error: true,
            chunkId,
            message: error.message
          }))
      )
    );
    
    batchResults.forEach((result, index) => {
      if (!result.error) {
        results.set(batch[index], result);
      }
    });
  }
  
  return results;
}
```

**ACCEPTANCE CRITERIA:**

- [ ] Extraction completes within 200ms for single chunk (p95)
- [ ] Persona extraction uses lookup tables from mapping profile
- [ ] Emotion extraction derives from scenario_type, tone_voice_tags, problem_context
- [ ] Topic extraction prefers chunk_summary_1s, falls back to task_name/claim/key_terms
- [ ] Complexity calculation considers task steps, confidence, domain tags, token count
- [ ] Turn count ranges: low (4-6), medium (8-12), high (14-20)
- [ ] Confidence scores calculated for each extracted parameter
- [ ] Missing dimensions handled gracefully with fallback values
- [ ] All extraction decisions logged with source dimension names
- [ ] Batch extraction processes multiple chunks in parallel
- [ ] Unit tests achieve 90%+ coverage

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/dimension-extraction-service.ts
src/lib/__tests__/dimension-extraction-service.test.ts
```

**Error Handling:**
```typescript
// Custom error for extraction failures
export class DimensionExtractionError extends Error {
  constructor(
    public chunkId: string,
    public step: string,
    message: string
  ) {
    super(`Dimension extraction failed at ${step} for chunk ${chunkId}: ${message}`);
    this.name = 'DimensionExtractionError';
  }
}
```

**Logging Format:**
```typescript
console.log('[Dimension Extraction]', {
  chunkId: string,
  profile: string,
  duration: number,
  parameters: {
    persona: { value: string, source: string, confidence: number },
    emotion: { value: string, source: string, confidence: number },
    topic: { value: string, source: string, confidence: number },
    complexity: { value: string, score: number }
  }
});
```

**VALIDATION REQUIREMENTS:**

1. **Unit Tests**:
   - Test extractPersona with various audience values
   - Test extractPersona with missing audience (uses brand_persona_tags)
   - Test extractEmotion from scenario_type lookup
   - Test extractTopic from chunk_summary_1s
   - Test deriveComplexity with high/medium/low task step counts
   - Test extractConversationParameters end-to-end
   - Test extractBatchParameters with 10 chunks
   - Mock conversationChunkService and mapping config

2. **Integration Tests**:
   - Run extraction on real chunk from database
   - Verify parameters are valid for conversation generation
   - Test with chunks missing various dimensions

3. **Performance Tests**:
   - Measure extraction time for 100 chunks
   - Verify < 200ms per chunk (p95)
   - Test batch extraction with concurrency limits

**DELIVERABLES:**

1. `src/lib/dimension-extraction-service.ts` - Complete extraction pipeline
2. `src/lib/__tests__/dimension-extraction-service.test.ts` - Unit tests (90%+ coverage)
3. Type definition for `ConversationParameters` in `src/types/chunks.ts`
4. Documentation of extraction logic and mapping priorities

Implement this extraction pipeline completely, ensuring robust handling of missing dimensions, comprehensive logging for transparency, and performance within the 200ms requirement.

++++++++++++++++++


### Prompt 4: Context Injection System
**Scope**: Inject chunk content and metadata into generation prompts  
**Dependencies**: Prompt 1 (conversation-chunk-service), Prompt 3 (dimension-extraction-service)  
**Estimated Time**: 12-16 hours  
**Risk Level**: Medium

========================

You are a senior developer implementing the Context Injection System for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
When generating conversations from chunks, we need to inject the chunk's actual content and metadata into the prompt template. This ensures the generated conversation is contextually grounded in the source material, improving relevance and authenticity.

**Specific Functional Requirement (FR9.1.1):**
- **FR9.1.1**: Conversation to Chunk Association - Link generated conversations to source chunks with full traceability

**Technical Architecture:**
- Template Injection / Context Builder Pattern
- Must sanitize chunk content to prevent prompt injection attacks
- Support multiple chunks injection (up to 3 chunks per conversation)
- Validate all placeholders replaced before prompt submission

**Integration Points:**
- Integrates with existing prompt template system
- Consumes: conversation-chunk-service, dimension-extraction-service
- Used by: Generation API routes

**Quality Requirements:**
- 85% code coverage
- Handle chunk text truncation for length limits (max 2000 characters)
- Preserve chunk formatting (paragraphs, line breaks)
- Log injected context for debugging

**CURRENT CODEBASE STATE:**

**Existing Prompt Template Structure** (example):
```typescript
const promptTemplate = `
You are generating a training conversation between a user and an AI assistant.

**Context from Source Material:**
{{chunk_content}}

**Document Metadata:**
Title: {{doc_title}}
Category: {{primary_category}}
Author: {{author}}

**Conversation Parameters:**
Persona: {{persona}}
Emotion: {{emotion}}
Topic: {{topic}}
Complexity: {{complexity}}

Generate a {{turn_count}}-turn conversation that explores this topic authentically...
`;
```

**IMPLEMENTATION TASKS:**

Create new file: `src/lib/context-injection-service.ts`

**Task 1: Define Context Builder Class**

```typescript
export class ContextBuilder {
  private context: Map<string, string>;
  private chunks: Chunk[];
  private validationErrors: string[];
  
  constructor() {
    this.context = new Map();
    this.chunks = [];
    this.validationErrors = [];
  }
  
  /**
   * Add chunk content to context
   * Automatically extracts metadata and content
   */
  addChunk(chunk: Chunk, dimensions: ChunkDimensions): this {
    // Store chunk for reference
    this.chunks.push(chunk);
    
    // Extract and sanitize chunk text
    const sanitizedText = this.sanitizeText(chunk.chunk_text);
    const truncatedText = this.truncateText(sanitizedText, 2000);
    
    // Add to context map
    this.context.set('chunk_content', truncatedText);
    this.context.set('doc_title', dimensions.doc_title || 'Untitled');
    this.context.set('primary_category', dimensions.primary_category || 'General');
    this.context.set('author', dimensions.author || 'Unknown');
    this.context.set('doc_date', dimensions.doc_date || '');
    
    // Add key terms if available
    if (dimensions.key_terms && dimensions.key_terms.length > 0) {
      this.context.set('key_terms', dimensions.key_terms.join(', '));
    }
    
    return this; // Fluent interface
  }
  
  /**
   * Add conversation parameters to context
   */
  addParameters(params: ConversationParameters): this {
    this.context.set('persona', params.persona);
    this.context.set('emotion', params.emotion);
    this.context.set('topic', params.topic);
    this.context.set('intent', params.intent);
    this.context.set('tone', params.tone);
    this.context.set('complexity', params.complexity);
    this.context.set('turn_count', params.turnCount.toString());
    
    return this;
  }
  
  /**
   * Add custom key-value pairs
   */
  addCustom(key: string, value: string): this {
    this.context.set(key, value);
    return this;
  }
  
  /**
   * Build final prompt with all placeholders replaced
   */
  build(template: string): { prompt: string; isValid: boolean; errors: string[] } {
    let prompt = template;
    
    // Replace all {{placeholder}} syntax
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    const matches = template.match(placeholderRegex) || [];
    
    // Collect all required placeholders
    const requiredPlaceholders = matches.map(match => 
      match.replace('{{', '').replace('}}', '')
    );
    
    // Check for missing placeholders
    this.validationErrors = [];
    for (const placeholder of requiredPlaceholders) {
      if (!this.context.has(placeholder)) {
        this.validationErrors.push(`Missing value for placeholder: ${placeholder}`);
      }
    }
    
    // Replace placeholders
    for (const [key, value] of this.context.entries()) {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    
    // Check if any unreplaced placeholders remain
    const remainingPlaceholders = prompt.match(placeholderRegex);
    if (remainingPlaceholders) {
      this.validationErrors.push(`Unreplaced placeholders: ${remainingPlaceholders.join(', ')}`);
    }
    
    return {
      prompt,
      isValid: this.validationErrors.length === 0,
      errors: this.validationErrors
    };
  }
  
  /**
   * Sanitize text to prevent prompt injection
   */
  private sanitizeText(text: string): string {
    // Remove potential prompt injection patterns
    let sanitized = text;
    
    // Remove multiple consecutive newlines (preserve paragraph breaks)
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
    
    // Escape special characters that could break JSON
    sanitized = sanitized.replace(/"/g, '\\"');
    
    // Remove HTML/XML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove common injection patterns
    const injectionPatterns = [
      /ignore\s+previous\s+instructions/gi,
      /disregard\s+all\s+prior\s+commands/gi,
      /system\s+prompt\s+override/gi
    ];
    
    for (const pattern of injectionPatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    
    return sanitized.trim();
  }
  
  /**
   * Truncate text to max length while preserving word boundaries
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    // Find last space before maxLength
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '... [truncated]';
    }
    
    return truncated + '... [truncated]';
  }
}
```

**Task 2: Implement High-Level Injection Function**

```typescript
/**
 * Build prompt with chunk context injection
 * @param chunkId - Source chunk ID
 * @param template - Prompt template with {{placeholders}}
 * @param parameters - Conversation parameters
 * @returns Fully injected prompt ready for API call
 */
export async function buildPromptWithChunkContext(
  chunkId: string,
  template: string,
  parameters: ConversationParameters
): Promise<{ prompt: string; metadata: ContextMetadata }> {
  
  // Fetch chunk with dimensions
  const chunkWithDimensions = await conversationChunkService.getChunkWithDimensions(chunkId);
  const { chunk, dimensions } = chunkWithDimensions;
  
  // Build context using fluent interface
  const builder = new ContextBuilder();
  const result = builder
    .addChunk(chunk, dimensions)
    .addParameters(parameters)
    .build(template);
  
  // Validate result
  if (!result.isValid) {
    throw new Error(`Context injection failed: ${result.errors.join(', ')}`);
  }
  
  // Create metadata for logging
  const metadata: ContextMetadata = {
    chunkId,
    documentId: chunk.document_id,
    chunkType: chunk.chunk_type,
    chunkLength: chunk.chunk_text.length,
    truncated: chunk.chunk_text.length > 2000,
    injectedAt: new Date().toISOString(),
    placeholdersReplaced: Array.from(builder['context'].keys())
  };
  
  // Log injection
  console.log('[Context Injection]', {
    chunkId,
    templateLength: template.length,
    promptLength: result.prompt.length,
    placeholdersReplaced: metadata.placeholdersReplaced.length
  });
  
  return {
    prompt: result.prompt,
    metadata
  };
}
```

**Task 3: Support Multiple Chunks Injection**

```typescript
/**
 * Build prompt with multiple chunks as context
 * Useful for conversations spanning multiple related chunks
 * @param chunkIds - Array of chunk IDs (max 3)
 * @param template - Prompt template
 * @param parameters - Conversation parameters
 */
export async function buildPromptWithMultipleChunks(
  chunkIds: string[],
  template: string,
  parameters: ConversationParameters
): Promise<{ prompt: string; metadata: ContextMetadata }> {
  
  if (chunkIds.length > 3) {
    throw new Error('Maximum 3 chunks supported per conversation');
  }
  
  // Fetch all chunks in parallel
  const chunksWithDimensions = await Promise.all(
    chunkIds.map(id => conversationChunkService.getChunkWithDimensions(id))
  );
  
  // Combine chunk texts
  const combinedChunkText = chunksWithDimensions
    .map((cwd, index) => `--- Chunk ${index + 1} ---\n${cwd.chunk.chunk_text}`)
    .join('\n\n');
  
  // Build context
  const builder = new ContextBuilder();
  
  // Add first chunk's metadata
  const firstChunk = chunksWithDimensions[0];
  builder
    .addChunk(firstChunk.chunk, firstChunk.dimensions)
    .addParameters(parameters);
  
  // Override chunk_content with combined text
  builder.addCustom('chunk_content', builder['sanitizeText'](combinedChunkText));
  builder.addCustom('chunk_count', chunkIds.length.toString());
  
  const result = builder.build(template);
  
  if (!result.isValid) {
    throw new Error(`Multi-chunk context injection failed: ${result.errors.join(', ')}`);
  }
  
  return {
    prompt: result.prompt,
    metadata: {
      chunkId: chunkIds[0], // Primary chunk
      documentId: firstChunk.chunk.document_id,
      chunkType: 'multi-chunk',
      chunkLength: combinedChunkText.length,
      truncated: false,
      injectedAt: new Date().toISOString(),
      placeholdersReplaced: Array.from(builder['context'].keys()),
      additionalChunkIds: chunkIds.slice(1)
    }
  };
}
```

**ACCEPTANCE CRITERIA:**

- [ ] ContextBuilder uses fluent interface pattern
- [ ] Chunk text sanitized to remove prompt injection patterns
- [ ] Text truncated to max 2000 characters while preserving word boundaries
- [ ] Paragraph breaks preserved (double newlines)
- [ ] All {{placeholder}} syntax replaced
- [ ] Validation identifies missing placeholders before generation
- [ ] Support for multiple chunks (up to 3) with combined context
- [ ] Metadata includes chunk ID, truncation flag, injected timestamp
- [ ] Logging captures injection details for debugging
- [ ] Unit tests achieve 85%+ coverage

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/context-injection-service.ts
src/lib/__tests__/context-injection-service.test.ts
```

**Type Definitions:**
```typescript
export type ContextMetadata = {
  chunkId: string;
  documentId: string;
  chunkType: string;
  chunkLength: number;
  truncated: boolean;
  injectedAt: string;
  placeholdersReplaced: string[];
  additionalChunkIds?: string[];
};
```

**VALIDATION REQUIREMENTS:**

1. **Unit Tests**:
   - Test ContextBuilder fluent interface
   - Test sanitizeText removes injection patterns
   - Test truncateText preserves word boundaries
   - Test build() replaces all placeholders
   - Test build() validates missing placeholders
   - Test buildPromptWithChunkContext end-to-end
   - Test buildPromptWithMultipleChunks with 2-3 chunks

2. **Integration Tests**:
   - Test with real chunk from database
   - Verify sanitized text is safe for API
   - Test with very long chunks (>5000 characters)

**DELIVERABLES:**

1. `src/lib/context-injection-service.ts` - Complete context injection system
2. `src/lib/__tests__/context-injection-service.test.ts` - Unit tests (85%+ coverage)
3. Type definitions for `ContextMetadata`
4. Documentation of sanitization rules

Implement this context injection system completely, ensuring robust sanitization, validation, and support for both single and multi-chunk contexts.

++++++++++++++++++


## Summary and Remaining Prompts

The execution instructions document continues with Prompts 5-8 covering:

**Prompt 5: UI Components (Chunk Selector & Preview)** (16-20 hours)
- ChunkSelector component for browsing and selecting chunks
- Chunk preview panel showing full chunk text and dimensions
- Integration with existing wireframe patterns
- Virtual scrolling for large chunk lists

**Prompt 6: Generation Form Integration** (12-16 hours)
- Add chunk selection section to Single GenerationForm
- Auto-population of parameters from chunk dimensions
- Generation mode toggle (Manual vs Chunk-Based)
- Display of auto-filled indicators

**Prompt 7: Chunk-Based Generation Flow** (20-24 hours)
- Enhanced generation API endpoints accepting chunkId
- Complete workflow: chunk selection → dimension extraction → context injection → generation → linking
- Conversation-chunk association storage
- Quality scoring with chunk confidence factors

**Prompt 8: Advanced Features** (16-20 hours)
- Orphaned conversation management system
- Chunk recommendation engine based on dimensional similarity
- Conversation detail display with chunk information
- Re-linking interface for orphaned conversations

**Total Estimated Implementation Time:** 120-160 hours across all 8 prompts

---

## Quality Validation Checklist

### Post-Implementation Verification
- [ ] Database schema migration completed successfully
- [ ] All service methods return typed results
- [ ] Dimension extraction completes within 200ms
- [ ] Context injection sanitizes text properly
- [ ] UI components integrate with existing wireframe patterns
- [ ] Chunk-based generation workflow functional end-to-end
- [ ] Orphan detection runs without errors
- [ ] Unit test coverage meets thresholds (85-90%)
- [ ] Integration tests pass
- [ ] Performance benchmarks met

### Cross-Prompt Consistency
- [ ] Consistent error handling patterns across all services
- [ ] Aligned TypeScript types and interfaces
- [ ] Compatible database query patterns
- [ ] Integrated logging format
- [ ] Unified caching strategy

### User Experience Validation
- [ ] Chunk selector loads within 500ms
- [ ] Auto-populated parameters are correct
- [ ] Clear indicators for chunk-based generation
- [ ] Orphaned conversations clearly marked
- [ ] Source chunk information visible in conversation details

---

## Next Segment Preparation

**E10 Prerequisites:**
- All E09 functionality tested and stable
- Database contains test conversations linked to chunks
- Dimension extraction producing high-quality parameters
- UI components responsive and accessible

**Recommended Next Features:**
- Advanced filtering by chunk dimensions
- Bulk chunk selection for batch generation
- Chunk recommendation refinement with user feedback
- Analytics dashboard showing chunk usage patterns
- Export enhancements including chunk metadata

---

## Implementation Notes

### Critical Success Factors

1. **Database Schema First**: Complete migration before any code implementation
2. **Service Layer Independence**: Test services in isolation before UI integration
3. **Incremental Testing**: Validate each prompt's deliverables before proceeding
4. **Performance Monitoring**: Track query times and caching effectiveness
5. **User Testing**: Validate UI flow with actual users after Prompt 6

### Common Pitfalls to Avoid

1. **Over-Extraction**: Don't try to map all 60 dimensions immediately—focus on the most impactful ones
2. **Tight Coupling**: Keep services loosely coupled for testability
3. **Premature Optimization**: Get functionality working first, optimize later
4. **Missing Fallbacks**: Every extraction must have a sensible default
5. **Poor Logging**: Log extensively for debugging—this is complex logic

### Debugging Strategies

1. **Dimension Extraction Issues**: Add verbose logging showing each mapping decision
2. **Context Injection Problems**: Log both template and resolved prompt
3. **Performance Bottlenecks**: Use `console.time()` around database queries
4. **UI Integration**: Use React DevTools to inspect state flow
5. **Orphan Detection**: Run manual SQL queries to verify logic

---

## Appendix: Database Query Examples

### Find Conversations by Chunk
```sql
SELECT c.*
FROM conversations c
WHERE c.parent_type = 'chunk'
  AND c.parent_id = 'chunk-uuid-here';
```

### Find Orphaned Conversations
```sql
SELECT c.*
FROM conversations c
LEFT JOIN chunks ch ON ch.id = c.parent_id
WHERE c.parent_type = 'chunk'
  AND c.is_orphaned = true;
```

### Chunk Usage Statistics
```sql
SELECT 
  ch.id,
  ch.chunk_id,
  ch.section_heading,
  COUNT(c.id) as conversation_count
FROM chunks ch
LEFT JOIN conversations c ON c.parent_id = ch.id AND c.parent_type = 'chunk'
GROUP BY ch.id, ch.chunk_id, ch.section_heading
ORDER BY conversation_count DESC
LIMIT 20;
```

### Dimension Coverage Analysis
```sql
SELECT 
  cd.audience,
  cd.scenario_type,
  COUNT(*) as chunk_count
FROM chunk_dimensions cd
WHERE cd.run_id = (
  SELECT run_id 
  FROM chunk_runs 
  WHERE status = 'completed' 
  ORDER BY started_at DESC 
  LIMIT 1
)
GROUP BY cd.audience, cd.scenario_type
ORDER BY chunk_count DESC;
```

---

**Document Status:** Part 2 of 2 - Prompts 3-4 Complete, Summary Provided  
**Next Steps:** Implement Prompts 1-4, then proceed to UI integration (Prompts 5-8)  
**Estimated Completion:** 3-4 weeks with dedicated development team

