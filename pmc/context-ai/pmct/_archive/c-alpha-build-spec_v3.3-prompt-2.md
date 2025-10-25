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