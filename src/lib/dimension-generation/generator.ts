import Anthropic from '@anthropic-ai/sdk';
import { AI_CONFIG } from '../ai-config';
import { 
  chunkService, 
  chunkDimensionService, 
  chunkRunService, 
  promptTemplateService,
  documentCategoryService,
  apiResponseLogService
} from '../database';
import { ChunkDimensions, Chunk, PromptTemplate, ChunkType } from '../../types/chunks';

// Configuration for API response logging
const ENABLE_API_LOGGING = true; // Set to false to disable logging

export class DimensionGenerator {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: AI_CONFIG.apiKey,
    });
  }

  /**
   * Log Claude API response to database for debugging and auditing
   * Non-blocking - failures will not interrupt dimension generation
   */
  private async logClaudeResponse(logData: {
    chunkId: string;
    runId: string;
    template: PromptTemplate;
    prompt: string;
    chunkTextPreview: string;
    documentCategory: string;
    aiParams: { temperature: number; model: string };
    claudeMessage: any;
    parsedDimensions: Partial<ChunkDimensions>;
    parseError: string | null;
    cost: number;
    inputTokens: number;
    outputTokens: number;
  }): Promise<void> {
    // Skip if logging is disabled
    if (!ENABLE_API_LOGGING) {
      return;
    }

    try {
      await apiResponseLogService.createLog({
        chunk_id: logData.chunkId,
        run_id: logData.runId,
        template_type: logData.template.template_type,
        template_name: logData.template.template_name,
        model: logData.aiParams.model,
        temperature: logData.aiParams.temperature,
        max_tokens: 2048,
        prompt: logData.prompt,
        chunk_text_preview: logData.chunkTextPreview.substring(0, 200),
        document_category: logData.documentCategory,
        claude_response: logData.claudeMessage,
        parsed_successfully: logData.parseError === null,
        extraction_error: logData.parseError,
        dimensions_extracted: logData.parsedDimensions,
        input_tokens: logData.inputTokens,
        output_tokens: logData.outputTokens,
        estimated_cost_usd: logData.cost,
      });
      
      console.log(`✅ Logged API response: ${logData.template.template_type}`);
    } catch (error) {
      // Log error but don't throw - logging failures should not break dimension generation
      console.error('⚠️ Failed to log Claude API response:', error);
    }
  }

  /**
   * Generate all dimensions for all chunks in a document
   * Supports optional filtering for regeneration use cases
   */
  async generateDimensionsForDocument(params: {
    documentId: string;
    userId: string | null;
    chunkIds?: string[];  // Optional: only regenerate specific chunks
    templateIds?: string[];  // Optional: only use specific templates
    aiParams?: {  // Optional: override AI parameters
      temperature?: number;
      model?: string;
    };
  }): Promise<string> {  // Returns run_id
    const { documentId, userId, chunkIds, templateIds, aiParams } = params;

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
      error_message: null,
      completed_at: null,
      created_by: userId,
    });

    const startTime = Date.now();
    let totalCost = 0;

    try {
      // Get chunks (filtered if chunkIds provided)
      let chunks = await chunkService.getChunksByDocument(documentId);
      
      // Filter to specific chunks if requested (for regeneration)
      if (chunkIds && chunkIds.length > 0) {
        chunks = chunks.filter(chunk => chunkIds.includes(chunk.id));
      }
      
      // Update run with chunk count
      await chunkRunService.updateRun(run.run_id, {
        total_chunks: chunks.length,
      });

      // Get document metadata for inheritance
      const docCategory = await documentCategoryService.getDocumentCategory(documentId);
      
      // Get full document details for previously generated dimensions
      const document = await chunkService.getDocumentById(documentId);
      const documentMetadata = {
        title: document?.title || 'Untitled Document',
        author: document?.authorId || null,  // TODO: Map authorId to human-readable name
        sourceType: document?.source_type || null,
        sourceUrl: document?.source_url || null,
        docDate: document?.doc_date || document?.createdAt || null,
        docVersion: document?.doc_version || null,
      };

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
              documentMetadata,  // Pass document metadata
              templateIds,  // Pass template filter
              aiParams,  // Pass AI params override
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
    documentMetadata: {
      title: string;
      author: string | null;
      sourceType: string | null;
      sourceUrl: string | null;
      docDate: string | null;
      docVersion: string | null;
    };
    templateIds?: string[];  // Optional: filter to specific templates
    aiParams?: {
      temperature?: number;
      model?: string;
    };
  }): Promise<number> {  // Returns cost
    const { chunk, runId, documentCategory, documentMetadata, templateIds, aiParams } = params;

    const startTime = Date.now();
    let totalCost = 0;

    // Deterministic hash function for consistent split assignment
    const hashCode = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    };

    // Calculate deterministic split based on chunk ID
    const hash = hashCode(chunk.id);
    const splitValue = hash % 10; // Get value 0-9
    const split = splitValue === 9 ? 'test' : splitValue === 8 ? 'dev' : 'train';
    // Result: 0-7 = train (80%), 8 = dev (10%), 9 = test (10%)

    // Initialize dimension record with mechanical data
    const dimensions: Partial<ChunkDimensions> = {
      chunk_id: chunk.id,
      run_id: runId,
      
      // Previously generated dimensions (inherited from document)
      doc_id: chunk.document_id,
      doc_title: documentMetadata.title,
      doc_version: documentMetadata.docVersion,
      source_type: documentMetadata.sourceType,
      source_url: documentMetadata.sourceUrl,
      author: documentMetadata.author,
      doc_date: documentMetadata.docDate,
      primary_category: documentCategory,
      
      // Initialize defaults
      pii_flag: false,
      review_status: 'unreviewed',
      include_in_training_yn: true,
      data_split_train_dev_test: split,
      
      // Labeling metadata for provenance tracking
      label_source_auto_manual_mixed: 'auto',
      label_model: AI_CONFIG.model,
      labeled_by: 'system',
      label_timestamp_iso: new Date().toISOString(),
      
      // Meta-dimensions - will be calculated after dimension generation
      generation_confidence_precision: null,
      generation_confidence_accuracy: null,
      generation_cost_usd: null,
      generation_duration_ms: null,
    };

    // Get applicable prompt templates
    let templates = await promptTemplateService.getActiveTemplates(chunk.chunk_type);
    
    // Filter to specific templates if requested (for regeneration)
    if (templateIds && templateIds.length > 0) {
      templates = templates.filter(t => templateIds.includes(t.id));
    }

    // Execute prompts sequentially to build up dimensions
    for (const template of templates) {
      const result = await this.executePromptTemplate({
        template,
        chunk,
        documentCategory,
        runId,
        aiParams,  // Pass AI params for potential override
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
    runId: string;
    aiParams?: {
      temperature?: number;
      model?: string;
    };
  }): Promise<{ dimensions: Partial<ChunkDimensions>; cost: number }> {
    const { template, chunk, documentCategory, runId, aiParams } = params;

    // Build prompt by replacing placeholders
    const prompt = template.prompt_text
      .replace('{chunk_type}', chunk.chunk_type)
      .replace('{doc_title}', 'Document')  // TODO: Get actual title
      .replace('{primary_category}', documentCategory)
      .replace('{chunk_text}', chunk.chunk_text);

    // Extract model and temperature for logging
    const modelToUse = aiParams?.model || AI_CONFIG.model;
    const temperatureToUse = aiParams?.temperature !== undefined ? aiParams.temperature : 0.5;

    // Call Claude API (with optional parameter overrides)
    const message = await this.client.messages.create({
      model: modelToUse,
      max_tokens: 2048,
      temperature: temperatureToUse,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    // Extract response
    let responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
    
    // Strip markdown code blocks if present (Claude often wraps JSON in ```json ... ```)
    responseText = responseText.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/,'').trim();
    
    // Parse JSON response
    let dimensions: Partial<ChunkDimensions> = {};
    let parseError: string | null = null;

    try {
      const parsed = JSON.parse(responseText);
      
      // Map response to dimension fields based on template type
      dimensions = this.mapResponseToDimensions(parsed, template.template_type);
      
    } catch (error) {
      parseError = error instanceof Error ? error.message : String(error);
      console.error(`Failed to parse response for template ${template.template_name}:`, error);
      console.error(`Response was: ${responseText.substring(0, 200)}`);
    }

    // Calculate cost (approximate)
    const inputTokens = Math.ceil(prompt.length / 4);  // Rough estimate
    const outputTokens = Math.ceil(responseText.length / 4);
    const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015);  // Claude pricing

    // Log API response (non-blocking, will not throw errors)
    await this.logClaudeResponse({
      chunkId: chunk.id,
      runId: runId,
      template,
      prompt,
      chunkTextPreview: chunk.chunk_text,
      documentCategory,
      aiParams: {
        model: modelToUse,
        temperature: temperatureToUse,
      },
      claudeMessage: message,
      parsedDimensions: dimensions,
      parseError,
      cost,
      inputTokens,
      outputTokens,
    });

    return { dimensions, cost };
  }

  /**
   * Map AI response to dimension fields
   */
  private mapResponseToDimensions(response: any, templateType: string): Partial<ChunkDimensions> {
    // Helper function to ensure value is a proper array for PostgreSQL array columns
    const ensureArray = (value: any): string[] | undefined => {
      if (value === null || value === undefined) return undefined;
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        // If it's a string, try to parse as JSON or split by delimiters
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [String(value)];
        } catch {
          // If parsing fails, split by common delimiters and clean up
          return value.split(/[,|]/).map(s => s.trim()).filter(s => s.length > 0);
        }
      }
      // For any other type, wrap in array
      return [String(value)];
    };

    const mapping: Record<string, Partial<ChunkDimensions>> = {
      'content_analysis': {
        chunk_summary_1s: response.chunk_summary_1s,
        key_terms: ensureArray(response.key_terms),
        audience: response.audience,
        intent: response.intent,
        tone_voice_tags: ensureArray(response.tone_voice_tags),
        brand_persona_tags: ensureArray(response.brand_persona_tags),
        domain_tags: ensureArray(response.domain_tags),
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
        evidence_snippets: ensureArray(response.evidence_snippets),
        reasoning_sketch: response.reasoning_sketch,
        citations: ensureArray(response.citations),
        factual_confidence_0_1: response.factual_confidence_0_1,
      },
      'scenario_extraction': {
        scenario_type: response.scenario_type,
        problem_context: response.problem_context,
        solution_action: response.solution_action,
        outcome_metrics: response.outcome_metrics,
        style_notes: response.style_notes,
      },
      'training_pair_generation': {
        prompt_candidate: response.prompt_candidate,
        target_answer: response.target_answer,
        style_directives: response.style_directives,
      },
      'risk_assessment': {
        safety_tags: ensureArray(response.safety_tags),
        coverage_tag: response.coverage_tag,
        novelty_tag: response.novelty_tag,
        ip_sensitivity: response.ip_sensitivity,
        pii_flag: response.pii_flag,
        compliance_flags: ensureArray(response.compliance_flags),
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

