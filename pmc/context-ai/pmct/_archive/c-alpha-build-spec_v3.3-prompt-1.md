## BUILD PROMPT #1: DATABASE SCHEMA & INFRASTRUCTURE

**MODULE CONTEXT:**

This is Phase 1 of building the Chunk Alpha Module - a comprehensive chunk dimension testing environment that extends the existing document categorization module. Understanding the bigger picture will help you make better architectural decisions:

**What This Module Does:**
- Extracts 4 types of chunks from categorized documents (Chapter_Sequential, Instructional_Unit, CER, Example_Scenario)
- Generates 60+ AI dimensions per chunk using Claude Sonnet 4.5
- Displays all data in a spreadsheet-like interface for analysis
- Enables testing and refinement of AI prompts for LoRA training data creation

**Why This Module Exists:**
Small business owners need to convert their proprietary knowledge into LoRA training data. This module helps test and refine the AI prompts that extract structured dimensions from unstructured content.

**Your Role in This Phase:**
You are building the database foundation that will:
- Store extracted chunks with mechanical metadata (chars, tokens, positions)
- Store AI-generated dimensions with confidence scores
- Track multiple generation runs for comparison
- Enable iterative prompt testing and refinement

**Architecture Decisions You Should Know:**
- Integration: This extends the existing `chunks-alpha` codebase (not greenfield)
- Processing: Batch processing with background jobs (not real-time)
- Storage: Supabase PostgreSQL with unlimited run history
- UI Pattern: Following the existing dashboard wireframe design

---

**CONTEXT FOR AI:** You are building the foundation for a chunk dimension testing environment that extends an existing document categorization module. The database schema has been set up by the human, and your job is to create the TypeScript services and types to interact with this schema.

**YOUR TASK:**

### Part A: Create Type Definitions

Create `src/types/chunks.ts` with complete TypeScript types for all chunk-related entities:

```typescript
// Core chunk types
export type ChunkType = 'Chapter_Sequential' | 'Instructional_Unit' | 'CER' | 'Example_Scenario';

export type Chunk = {
  id: string;
  chunk_id: string;  // Format: DOC_ID#C001
  document_id: string;
  chunk_type: ChunkType;
  section_heading: string | null;
  page_start: number | null;
  page_end: number | null;
  char_start: number;
  char_end: number;
  token_count: number;
  overlap_tokens: number;
  chunk_handle: string | null;
  chunk_text: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type ChunkDimensions = {
  id: string;
  chunk_id: string;
  run_id: string;
  
  // Previously generated
  doc_id: string | null;
  doc_title: string | null;
  doc_version: string | null;
  source_type: string | null;
  source_url: string | null;
  author: string | null;
  doc_date: string | null;
  primary_category: string | null;
  
  // Content dimensions
  chunk_summary_1s: string | null;
  key_terms: string[] | null;
  audience: string | null;
  intent: string | null;
  tone_voice_tags: string[] | null;
  brand_persona_tags: string[] | null;
  domain_tags: string[] | null;
  
  // Task dimensions
  task_name: string | null;
  preconditions: string | null;
  inputs: string | null;
  steps_json: any | null;
  expected_output: string | null;
  warnings_failure_modes: string | null;
  
  // CER dimensions
  claim: string | null;
  evidence_snippets: string[] | null;
  reasoning_sketch: string | null;
  citations: string[] | null;
  factual_confidence_0_1: number | null;
  
  // Scenario dimensions
  scenario_type: string | null;
  problem_context: string | null;
  solution_action: string | null;
  outcome_metrics: string | null;
  style_notes: string | null;
  
  // Training dimensions
  prompt_candidate: string | null;
  target_answer: string | null;
  style_directives: string | null;
  
  // Risk dimensions
  safety_tags: string[] | null;
  coverage_tag: string | null;
  novelty_tag: string | null;
  ip_sensitivity: string | null;
  pii_flag: boolean;
  compliance_flags: string[] | null;
  
  // Training metadata
  embedding_id: string | null;
  vector_checksum: string | null;
  label_source_auto_manual_mixed: string | null;
  label_model: string | null;
  labeled_by: string | null;
  label_timestamp_iso: string | null;
  review_status: string;
  include_in_training_yn: boolean;
  data_split_train_dev_test: string | null;
  augmentation_notes: string | null;
  
  // Meta-dimensions
  generation_confidence_precision: number | null;
  generation_confidence_accuracy: number | null;
  generation_cost_usd: number | null;
  generation_duration_ms: number | null;
  prompt_template_id: string | null;
  
  generated_at: string;
};

export type ChunkRun = {
  id: string;
  run_id: string;
  document_id: string;
  run_name: string;
  total_chunks: number | null;
  total_dimensions: number | null;
  total_cost_usd: number | null;
  total_duration_ms: number | null;
  ai_model: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  created_by: string | null;
};

export type PromptTemplate = {
  id: string;
  template_name: string;
  template_type: string;
  prompt_text: string;
  response_schema: any;
  applicable_chunk_types: ChunkType[];
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};

export type ChunkExtractionJob = {
  id: string;
  document_id: string;
  status: 'pending' | 'extracting' | 'generating_dimensions' | 'completed' | 'failed';
  progress_percentage: number;
  current_step: string | null;
  total_chunks_extracted: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
};
```

### Part B: Create Database Services

Create `src/lib/chunk-service.ts` with comprehensive CRUD operations:

```typescript
import { supabase } from './supabase';
import { Chunk, ChunkDimensions, ChunkRun, PromptTemplate, ChunkExtractionJob, ChunkType } from '../types/chunks';

export const chunkService = {
  // Create a new chunk
  async createChunk(chunk: Omit<Chunk, 'id' | 'created_at' | 'updated_at'>): Promise<Chunk> {
    const { data, error } = await supabase
      .from('chunks')
      .insert(chunk)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all chunks for a document
  async getChunksByDocument(documentId: string): Promise<Chunk[]> {
    const { data, error } = await supabase
      .from('chunks')
      .select('*')
      .eq('document_id', documentId)
      .order('char_start', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get single chunk by ID
  async getChunkById(chunkId: string): Promise<Chunk | null> {
    const { data, error } = await supabase
      .from('chunks')
      .select('*')
      .eq('id', chunkId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Delete all chunks for a document (for regeneration)
  async deleteChunksByDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('chunks')
      .delete()
      .eq('document_id', documentId);
    
    if (error) throw error;
  }
};

export const chunkDimensionService = {
  // Create dimension record
  async createDimensions(dimensions: Omit<ChunkDimensions, 'id' | 'generated_at'>): Promise<ChunkDimensions> {
    const { data, error } = await supabase
      .from('chunk_dimensions')
      .insert(dimensions)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get dimensions for a specific chunk and run
  async getDimensionsByChunkAndRun(chunkId: string, runId: string): Promise<ChunkDimensions | null> {
    const { data, error } = await supabase
      .from('chunk_dimensions')
      .select('*')
      .eq('chunk_id', chunkId)
      .eq('run_id', runId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get all dimensions for a run
  async getDimensionsByRun(runId: string): Promise<ChunkDimensions[]> {
    const { data, error } = await supabase
      .from('chunk_dimensions')
      .select('*')
      .eq('run_id', runId)
      .order('generated_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};

export const chunkRunService = {
  // Create a new run
  async createRun(run: Omit<ChunkRun, 'id' | 'run_id' | 'started_at'>): Promise<ChunkRun> {
    const { data, error } = await supabase
      .from('chunk_runs')
      .insert({
        ...run,
        run_id: crypto.randomUUID()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all runs for a document
  async getRunsByDocument(documentId: string): Promise<ChunkRun[]> {
    const { data, error } = await supabase
      .from('chunk_runs')
      .select('*')
      .eq('document_id', documentId)
      .order('started_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Update run status and metrics
  async updateRun(runId: string, updates: Partial<ChunkRun>): Promise<ChunkRun> {
    const { data, error } = await supabase
      .from('chunk_runs')
      .update(updates)
      .eq('run_id', runId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const promptTemplateService = {
  // Get active templates for a chunk type
  async getActiveTemplates(chunkType?: ChunkType): Promise<PromptTemplate[]> {
    let query = supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_active', true);
    
    if (chunkType) {
      query = query.contains('applicable_chunk_types', [chunkType]);
    }
    
    const { data, error } = await query.order('template_type');
    
    if (error) throw error;
    return data || [];
  },

  // Get template by name
  async getTemplateByName(templateName: string): Promise<PromptTemplate | null> {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('template_name', templateName)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

export const chunkExtractionJobService = {
  // Create extraction job
  async createJob(documentId: string, userId: string): Promise<ChunkExtractionJob> {
    const { data, error } = await supabase
      .from('chunk_extraction_jobs')
      .insert({
        document_id: documentId,
        created_by: userId,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update job status
  async updateJob(jobId: string, updates: Partial<ChunkExtractionJob>): Promise<ChunkExtractionJob> {
    const { data, error } = await supabase
      .from('chunk_extraction_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get job by document
  async getJobByDocument(documentId: string): Promise<ChunkExtractionJob | null> {
    const { data, error } = await supabase
      .from('chunk_extraction_jobs')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};
```

### Part C: Update Database Service

Add chunk-related services to `src/lib/database.ts`:

```typescript
// Add these exports at the end of the file
export { chunkService, chunkDimensionService, chunkRunService, promptTemplateService, chunkExtractionJobService } from './chunk-service';
```

### Part D: Update Document Dashboard

Modify `src/components/server/DocumentSelectorServer.tsx` to show "Chunks" button:

1. Import the chunk service
2. For each document, check if categorization is complete
3. If complete, show "Chunks" button
4. Button links to `/chunks/[documentId]`

**KEY REQUIREMENTS:**
- Button only appears after categorization workflow is completed
- Button shows loading state while checking chunk status
- Button displays "Start Chunking" if no chunks exist, "View Chunks" if chunks exist

### Part E: Verification

Create a simple test page at `src/app/test-chunks/page.tsx` that:
1. Connects to database
2. Queries prompt_templates table
3. Displays count of templates
4. Confirms services are working

**COMPLETION CRITERIA:**
✅ All TypeScript types defined  
✅ All database services created  
✅ Services successfully query Supabase  
✅ "Chunks" button appears on dashboard  
✅ Test page confirms database connectivity
