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

