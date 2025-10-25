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

    console.log(`Starting chunk extraction for document: ${documentTitle}`);
    console.log(`Document length: ${documentContent.length} characters`);
    console.log(`Category: ${primaryCategory}`);

    // Check document size - Claude has context limits
    if (documentContent.length > 150000) {
      console.warn(`⚠️ Document is very large (${documentContent.length} chars). This may cause timeouts.`);
      console.warn(`⚠️ Consider splitting the document or increasing function timeout.`);
    }

    // First, detect document structure
    const structure = this.analyzer.detectStructure(documentContent);
    console.log(`Detected ${structure.sections.length} sections, ${structure.totalTokens} tokens`);

    // Call AI to identify chunk candidates
    const prompt = this.buildExtractionPrompt(documentTitle, documentContent, primaryCategory, structure);

    console.log(`📤 [AI Chunker] Sending request to Claude API...`);
    console.log(`📤 [AI Chunker] Prompt length: ${prompt.length} characters`);
    
    let message;
    try {
      // Add timeout wrapper for AI call
      const timeoutMs = 240000; // 4 minutes (slightly less than function timeout)
      message = await Promise.race([
        this.client.messages.create({
          model: AI_CONFIG.model,
          max_tokens: AI_CONFIG.maxTokens,
          temperature: 0.3,  // Lower temperature for more consistent extraction
          messages: [{
            role: 'user',
            content: prompt,
          }],
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI API call timed out after 4 minutes')), timeoutMs)
        )
      ]) as Anthropic.Messages.Message;
      
      console.log(`✅ [AI Chunker] Received response from Claude API`);
    } catch (error) {
      console.error(`❌ [AI Chunker] AI API call failed:`, error);
      throw new Error(`AI extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Parse AI response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log(`AI response length: ${responseText.length} characters`);
    console.log(`AI response preview: ${responseText.substring(0, 300)}`);
    
    const candidates = this.parseExtractionResponse(responseText, documentContent);
    console.log(`Parsed ${candidates.length} chunk candidates from AI response`);

    // Apply extraction limits
    const filtered = this.applyExtractionLimits(candidates);
    console.log(`After applying limits: ${filtered.length} chunks`);

    return filtered;
  }

  private buildExtractionPrompt(
    title: string,
    content: string,
    category: string,
    structure: DocumentStructure
  ): string {
    // Split content into lines for better boundary detection
    const lines = content.split('\n');
    
    // For large documents (>80KB), truncate to prevent timeouts
    let documentContent = content;
    let truncated = false;
    const maxChars = 80000; // ~20K tokens
    
    if (content.length > maxChars) {
      console.warn(`⚠️ [AI Chunker] Document too large (${content.length} chars), truncating to ${maxChars} chars`);
      documentContent = content.substring(0, maxChars) + '\n\n[... Document truncated due to size limits ...]';
      truncated = true;
    }
    
    return `You are a document analysis expert. Your task is to identify and extract distinct chunks from a document for LoRA training data creation.

DOCUMENT TITLE: ${title}
DOCUMENT CATEGORY: ${category}
DOCUMENT LENGTH: ${structure.totalChars} characters, ${structure.totalTokens} tokens, ${lines.length} lines
SECTIONS DETECTED: ${structure.sections.length}
${truncated ? 'NOTE: Document was truncated for analysis. Focus on visible content.' : ''}

CHUNK TYPES TO IDENTIFY:

1. **Chapter_Sequential**: Top-level structural sections (chapters, major sections)
   - Look for: "Chapter X", "Section X", major headings
   - Target: 12-15 most significant chapters (aim for comprehensive coverage)

2. **Instructional_Unit**: Step-by-step procedures or tasks
   - Look for: numbered steps, how-to content, procedures, checklists
   - Target: 5-8 most valuable instructional units

3. **CER** (Claim-Evidence-Reasoning): Arguments with supporting evidence
   - Look for: claims with citations, research findings, data-backed assertions
   - Target: 8-12 most important claims

4. **Example_Scenario**: Case studies, examples, stories, dialogues
   - Look for: "for example", case studies, customer stories, scenarios
   - Target: 5-8 most illustrative examples

IMPORTANT: The document has ${lines.length} lines total. Use LINE NUMBERS for precise boundaries.

DOCUMENT CONTENT:
---
${documentContent}
---

TASK: Analyze this COMPLETE document and identify ALL candidate chunks. 

**CRITICAL**: You MUST return MULTIPLE chunks (typically 12-35 chunks total across all types). Each major section, procedure, claim, or example should be its own chunk.

For each chunk, return:

1. chunk_type: The type (Chapter_Sequential, Instructional_Unit, CER, or Example_Scenario)
2. confidence: Your confidence score (0.0-1.0)
3. start_line: Line number where chunk begins (1-indexed, count from line 1)
4. end_line: Line number where chunk ends (inclusive, actual last line with content)
5. section_heading: Heading/title of this chunk (if any)
6. reasoning: Brief explanation of why this qualifies as this chunk type

**IMPORTANT INSTRUCTIONS:**
1. **Scan the ENTIRE document** from start to finish
2. **Return MANY chunks** - at least 10-20 chunks for a typical document
3. **Each distinct section** should be its own chunk (e.g., if there are 7 steps, return 7 chunks)
4. **Don't combine sections** - split them into separate chunks
5. **Be generous** with identification - identify MORE candidates than needed

Example format (note: this is just 2 examples, but you should return 10+ chunks):
[
  {
    "chunk_type": "Instructional_Unit",
    "confidence": 0.95,
    "start_line": 5,
    "end_line": 12,
    "section_heading": "Step 1: Discovery Mapping",
    "reasoning": "Procedural instructions for discovery process"
  },
  {
    "chunk_type": "Chapter_Sequential",
    "confidence": 0.90,
    "start_line": 14,
    "end_line": 22,
    "section_heading": "Step 2: Customization Planning",
    "reasoning": "Sequential section in the methodology"
  },
  {
    "chunk_type": "Instructional_Unit",
    "confidence": 0.92,
    "start_line": 24,
    "end_line": 30,
    "section_heading": "Step 3: Technical Setup",
    "reasoning": "Technical procedure with setup instructions"
  }
  ... (continue for ALL sections in the document)
]

**VALIDATION CHECKLIST:**
✓ Have you scanned the ENTIRE document?
✓ Have you returned at least 10 chunks?
✓ Is each major section its own chunk?
✓ Are chunks substantial (at least 5-10 lines each)?
✓ Do chunks cover the full document from beginning to end?

Return ONLY valid JSON array, no markdown, no other text.`;
  }

  private parseExtractionResponse(response: string, fullContent: string): ExtractionCandidate[] {
    try {
      console.log('🔍 [AI Chunker] Starting to parse AI response...');
      console.log('📝 [AI Chunker] Response length:', response.length);
      console.log('📝 [AI Chunker] Response preview:', response.substring(0, 200));
      
      // Extract JSON from response (handles both bare JSON and markdown-wrapped JSON)
      let jsonText = response.trim();

      // Check if response is wrapped in markdown code fences
      const markdownMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (markdownMatch) {
        console.log('✅ [AI Chunker] Detected markdown-wrapped JSON, extracting...');
        jsonText = markdownMatch[1].trim();
        console.log('📝 [AI Chunker] Extracted JSON length:', jsonText.length);
      } else {
        console.log('ℹ️ [AI Chunker] No markdown wrapping detected, using raw response');
      }

      // Now find the JSON array
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('❌ [AI Chunker] No JSON array found in AI response');
        console.error('❌ [AI Chunker] Full response:', response);
        console.error('❌ [AI Chunker] Processed jsonText:', jsonText);
        throw new Error('No JSON array found in response');
      }

      console.log('✅ [AI Chunker] Found JSON array, length:', jsonMatch[0].length);
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`✅ [AI Chunker] Successfully parsed ${parsed.length} chunk candidates`);
      
      // Split content into lines for line-based indexing
      const lines = fullContent.split('\n');
      
      // Map to ExtractionCandidate with actual character positions
      return parsed.map((item: any, index: number) => {
        // Convert line numbers (1-indexed) to character positions (0-indexed)
        const startLine = Math.max(0, (item.start_line || 1) - 1); // Convert to 0-indexed
        const endLine = Math.min(lines.length - 1, (item.end_line || startLine + 1) - 1); // Convert to 0-indexed
        
        // Calculate character positions
        let startIndex = 0;
        for (let i = 0; i < startLine; i++) {
          startIndex += lines[i].length + 1; // +1 for newline
        }
        
        let endIndex = startIndex;
        for (let i = startLine; i <= endLine; i++) {
          endIndex += lines[i].length + 1; // +1 for newline
        }
        
        // Validate chunk size (minimum 100 characters)
        const chunkSize = endIndex - startIndex;
        if (chunkSize < 100) {
          console.warn(`Chunk ${index + 1} too small (${chunkSize} chars), expanding to 500 chars minimum`);
          endIndex = Math.min(fullContent.length, startIndex + 500);
        }
        
        // Ensure we don't exceed document bounds
        startIndex = Math.max(0, Math.min(startIndex, fullContent.length - 1));
        endIndex = Math.max(startIndex + 100, Math.min(endIndex, fullContent.length));

        return {
          type: item.chunk_type,
          confidence: item.confidence || 0.5,
          startIndex,
          endIndex,
          sectionHeading: item.section_heading,
          reasoning: item.reasoning || 'No reasoning provided',
        };
      }).filter(candidate => {
        // Filter out invalid candidates
        const isValid = candidate.endIndex > candidate.startIndex && 
                       (candidate.endIndex - candidate.startIndex) >= 100;
        if (!isValid) {
          console.warn(`Filtering out invalid chunk: start=${candidate.startIndex}, end=${candidate.endIndex}`);
        }
        return isValid;
      });
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
      console.error('Response was:', response.substring(0, 500));
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

