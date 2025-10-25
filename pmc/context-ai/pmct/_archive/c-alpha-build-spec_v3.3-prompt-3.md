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
      
      // Meta-dimensions - will be calculated after dimension generation
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
    
    // CRITICAL: Calculate confidence scores for dashboard display
    // Dashboard uses these to separate "Things We Know" (>=8) from "Things We Need to Know" (<8)
    const precisionScore = this.calculatePrecisionScore(dimensions, chunk.chunk_type);
    const accuracyScore = this.calculateAccuracyScore(dimensions, chunk.chunk_type, precisionScore);
    
    dimensions.generation_confidence_precision = precisionScore;
    dimensions.generation_confidence_accuracy = accuracyScore;

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

  /**
   * Calculate precision score (1-10) based on field completeness
   * Used by dashboard to determine "Things We Know" (>=8) vs "Things We Need to Know" (<8)
   */
  private calculatePrecisionScore(
    dimensions: Partial<ChunkDimensions>,
    chunkType: ChunkType
  ): number {
    // Define expected fields based on chunk type
    const expectedFieldsByType: Record<ChunkType, string[]> = {
      'Chapter_Sequential': [
        'chunk_summary_1s',
        'key_terms',
        'audience',
        'intent',
        'tone_voice_tags',
        'brand_persona_tags',
        'domain_tags',
        'coverage_tag',
        'novelty_tag',
        'ip_sensitivity',
      ],
      'Instructional_Unit': [
        'chunk_summary_1s',
        'key_terms',
        'task_name',
        'preconditions',
        'inputs',
        'steps_json',
        'expected_output',
        'warnings_failure_modes',
        'audience',
        'coverage_tag',
      ],
      'CER': [
        'chunk_summary_1s',
        'claim',
        'evidence_snippets',
        'reasoning_sketch',
        'citations',
        'factual_confidence_0_1',
        'audience',
        'coverage_tag',
        'novelty_tag',
        'ip_sensitivity',
      ],
      'Example_Scenario': [
        'chunk_summary_1s',
        'scenario_type',
        'problem_context',
        'solution_action',
        'outcome_metrics',
        'style_notes',
        'audience',
        'key_terms',
        'coverage_tag',
        'novelty_tag',
      ],
    };

    const expectedFields = expectedFieldsByType[chunkType] || [];
    
    // Count populated fields
    let populatedCount = 0;
    expectedFields.forEach(fieldName => {
      const value = dimensions[fieldName as keyof ChunkDimensions];
      
      // Check if field is meaningfully populated
      if (this.isFieldPopulated(value)) {
        populatedCount++;
      }
    });

    // Calculate ratio and convert to 1-10 scale
    const ratio = expectedFields.length > 0 ? populatedCount / expectedFields.length : 0;
    const score = Math.round(ratio * 10);
    
    // Ensure score is between 1 and 10
    return Math.max(1, Math.min(10, score));
  }

  /**
   * Calculate accuracy score (1-10) using precision with variance
   * MVP version: Uses precision as baseline with controlled variance for realistic testing
   * 
   * FUTURE: Replace with AI self-assessment, human rating, or semantic validation
   */
  private calculateAccuracyScore(
    dimensions: Partial<ChunkDimensions>,
    chunkType: ChunkType,
    precisionScore: number
  ): number {
    // Start with precision score as baseline
    let score = precisionScore;
    
    // Add controlled variance to simulate quality assessment
    // This creates differentiation for testing purposes
    const variance = this.generateControlledVariance();
    score = score + variance;
    
    // Ensure score stays within 1-10 range
    return Math.max(1, Math.min(10, score));
  }

  /**
   * Helper: Check if a field value is meaningfully populated
   */
  private isFieldPopulated(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    return true;
  }

  /**
   * Generate controlled variance for accuracy testing
   * Returns: Integer between -2 and +2
   * 
   * Weighted to favor slight positive variance for realistic confidence distribution
   */
  private generateControlledVariance(): number {
    const random = Math.random();
    
    if (random < 0.1) return -2;      // 10% chance of -2
    if (random < 0.25) return -1;     // 15% chance of -1
    if (random < 0.65) return 0;      // 40% chance of 0 (same as precision)
    if (random < 0.9) return 1;       // 25% chance of +1
    return 2;                         // 10% chance of +2
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
