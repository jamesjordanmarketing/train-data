/**
 * Dimension Metadata
 * 
 * This module provides metadata for all 60 chunk dimensions, organized by generation type:
 * - Prior Generated (8): Document metadata created before chunking
 * - Mechanically Generated (17): Metadata created during chunking process
 * - AI Generated (35): Dimensions requiring AI model processing
 */

export interface DimensionMetadata {
  fieldName: string;           // Maps to field_name in DB
  description: string;          // Full description
  dataType: 'string' | 'enum' | 'list[string]' | 'integer' | 'float' | 'boolean' | 'json' | 'datetime';
  allowedValuesFormat: string | null;  // e.g., 'pdf | docx | html'
  generationType: 'Prior Generated' | 'Mechanically Generated' | 'AI Generated';
  exampleValue: string | null;
  isRequired: boolean;
  displayOrder: number;         // For consistent UI ordering
  category: 'Document Metadata' | 'Content' | 'Task' | 'CER' | 'Scenario' | 'Training' | 'Risk' | 'Metadata';
}

/**
 * Complete metadata for all 60 dimensions
 */
export const DIMENSION_METADATA: Record<string, DimensionMetadata> = {
  // ============================================================================
  // PRIOR GENERATED (8) - Display Order 1-8
  // Document metadata created before chunking
  // ============================================================================
  
  doc_id: {
    fieldName: 'doc_id',
    description: 'Unique identifier for the source document.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Prior Generated',
    exampleValue: 'DOC_2025_001',
    isRequired: true,
    displayOrder: 1,
    category: 'Document Metadata'
  },
  
  doc_title: {
    fieldName: 'doc_title',
    description: 'Human-readable title of the document.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Prior Generated',
    exampleValue: 'Bright Run Playbook v2',
    isRequired: true,
    displayOrder: 2,
    category: 'Document Metadata'
  },
  
  doc_version: {
    fieldName: 'doc_version',
    description: 'Document version tag or semver.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Prior Generated',
    exampleValue: 'v1.3.0',
    isRequired: false,
    displayOrder: 3,
    category: 'Document Metadata'
  },
  
  source_type: {
    fieldName: 'source_type',
    description: 'Ingest source format.',
    dataType: 'enum',
    allowedValuesFormat: 'pdf | docx | html | markdown | email | transcript | notion | spreadsheet | image+OCR',
    generationType: 'Prior Generated',
    exampleValue: 'pdf',
    isRequired: true,
    displayOrder: 4,
    category: 'Document Metadata'
  },
  
  source_url: {
    fieldName: 'source_url',
    description: 'Canonical URL or file path for provenance.',
    dataType: 'string',
    allowedValuesFormat: 'url|uri',
    generationType: 'Prior Generated',
    exampleValue: 'https://example.com/playbook.pdf',
    isRequired: false,
    displayOrder: 5,
    category: 'Document Metadata'
  },
  
  author: {
    fieldName: 'author',
    description: 'Document author or organization.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Prior Generated',
    exampleValue: 'BRAND Team',
    isRequired: false,
    displayOrder: 6,
    category: 'Document Metadata'
  },
  
  doc_date: {
    fieldName: 'doc_date',
    description: 'Date of original authorship or publication.',
    dataType: 'datetime',
    allowedValuesFormat: 'YYYY-MM-DD',
    generationType: 'Prior Generated',
    exampleValue: '2025-07-15',
    isRequired: false,
    displayOrder: 7,
    category: 'Document Metadata'
  },
  
  primary_category: {
    fieldName: 'primary_category',
    description: 'User-centric category (pick one) for business meaning.',
    dataType: 'enum',
    allowedValuesFormat: 'Core IP — Complete System (Author: BRAND) | Core IP — Major System Component (Author: BRAND) | Proprietary Strategy/Method (Author: BRAND) | Proprietary Insight/Framework Fragment (Author: BRAND) | Operational Playbook / Step-by-Step (Author: BRAND) | Signature Story / Origin / Distinctive Narrative (Author: BRAND) | Marketing Narrative — Benefits (Author: BRAND, non-divulgence) | Customer Conversation / Proof h-1 / h-2 / h-3 | External / Third-Party — Non-IP',
    generationType: 'Prior Generated',
    exampleValue: 'Operational Playbook / Step-by-Step (Author: BRAND)',
    isRequired: true,
    displayOrder: 8,
    category: 'Document Metadata'
  },
  
  // ============================================================================
  // MECHANICALLY GENERATED - CHUNKS TABLE (9) - Display Order 9-17
  // Metadata created during chunking process (stored in chunks table)
  // ============================================================================
  
  chunk_id: {
    fieldName: 'chunk_id',
    description: 'Stable unique ID for this chunk.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Mechanically Generated',
    exampleValue: 'DOC_2025_001#C032',
    isRequired: true,
    displayOrder: 9,
    category: 'Metadata'
  },
  
  section_heading: {
    fieldName: 'section_heading',
    description: 'Nearest section or heading title.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Mechanically Generated',
    exampleValue: 'Stage 2: Categorize Documents',
    isRequired: false,
    displayOrder: 10,
    category: 'Metadata'
  },
  
  page_start: {
    fieldName: 'page_start',
    description: 'First page number covered by the chunk.',
    dataType: 'integer',
    allowedValuesFormat: '>=1',
    generationType: 'Mechanically Generated',
    exampleValue: '12',
    isRequired: false,
    displayOrder: 11,
    category: 'Metadata'
  },
  
  page_end: {
    fieldName: 'page_end',
    description: 'Last page number covered by the chunk.',
    dataType: 'integer',
    allowedValuesFormat: '>=Page_Start',
    generationType: 'Mechanically Generated',
    exampleValue: '13',
    isRequired: false,
    displayOrder: 12,
    category: 'Metadata'
  },
  
  char_start: {
    fieldName: 'char_start',
    description: 'Character index start in the document (0-based).',
    dataType: 'integer',
    allowedValuesFormat: '>=0',
    generationType: 'Mechanically Generated',
    exampleValue: '8450',
    isRequired: true,
    displayOrder: 13,
    category: 'Metadata'
  },
  
  char_end: {
    fieldName: 'char_end',
    description: 'Character index end (exclusive).',
    dataType: 'integer',
    allowedValuesFormat: '>Char_Start',
    generationType: 'Mechanically Generated',
    exampleValue: '9875',
    isRequired: true,
    displayOrder: 14,
    category: 'Metadata'
  },
  
  token_count: {
    fieldName: 'token_count',
    description: 'Model token count for the chunk text.',
    dataType: 'integer',
    allowedValuesFormat: '>=1',
    generationType: 'Mechanically Generated',
    exampleValue: '512',
    isRequired: true,
    displayOrder: 15,
    category: 'Metadata'
  },
  
  overlap_tokens: {
    fieldName: 'overlap_tokens',
    description: 'Number of tokens overlapped with previous chunk.',
    dataType: 'integer',
    allowedValuesFormat: '>=0',
    generationType: 'Mechanically Generated',
    exampleValue: '64',
    isRequired: false,
    displayOrder: 16,
    category: 'Metadata'
  },
  
  chunk_handle: {
    fieldName: 'chunk_handle',
    description: 'Short slug/handle for referencing the chunk.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Mechanically Generated',
    exampleValue: 'stage2-categorize-overview',
    isRequired: false,
    displayOrder: 17,
    category: 'Metadata'
  },
  
  // ============================================================================
  // AI GENERATED - CONTENT (8) - Display Order 18-25
  // Content analysis dimensions requiring AI processing
  // ============================================================================
  
  chunk_type: {
    fieldName: 'chunk_type',
    description: 'Structural role of the chunk.',
    dataType: 'enum',
    allowedValuesFormat: 'Chapter_Sequential | Instructional_Unit | CER | Example_Scenario (extensible)',
    generationType: 'AI Generated',
    exampleValue: 'Instructional_Unit',
    isRequired: true,
    displayOrder: 18,
    category: 'Content'
  },
  
  chunk_summary_1s: {
    fieldName: 'chunk_summary_1s',
    description: 'One-sentence summary (<= 30 words).',
    dataType: 'string',
    allowedValuesFormat: '<= 240 chars',
    generationType: 'AI Generated',
    exampleValue: 'Explains how to label document chunks for LoRA training and compliance.',
    isRequired: false,
    displayOrder: 19,
    category: 'Content'
  },
  
  key_terms: {
    fieldName: 'key_terms',
    description: 'Pipe- or comma-separated salient terms.',
    dataType: 'list[string]',
    allowedValuesFormat: 'comma or pipe delimited',
    generationType: 'AI Generated',
    exampleValue: 'LoRA|brand voice|categorization|instruction-tuning',
    isRequired: false,
    displayOrder: 20,
    category: 'Content'
  },
  
  audience: {
    fieldName: 'audience',
    description: 'Intended reader/user persona.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'SMB Owners; Ops Managers',
    isRequired: false,
    displayOrder: 21,
    category: 'Content'
  },
  
  intent: {
    fieldName: 'intent',
    description: "Author's primary intent for this chunk.",
    dataType: 'enum',
    allowedValuesFormat: 'educate | instruct | persuade | inform | narrate | summarize | compare | evaluate',
    generationType: 'AI Generated',
    exampleValue: 'instruct',
    isRequired: false,
    displayOrder: 22,
    category: 'Content'
  },
  
  tone_voice_tags: {
    fieldName: 'tone_voice_tags',
    description: 'Style/voice descriptors.',
    dataType: 'list[string]',
    allowedValuesFormat: 'comma or pipe delimited',
    generationType: 'AI Generated',
    exampleValue: 'authoritative, pragmatic, clear',
    isRequired: false,
    displayOrder: 23,
    category: 'Content'
  },
  
  brand_persona_tags: {
    fieldName: 'brand_persona_tags',
    description: 'Brand identity traits relevant to voice.',
    dataType: 'list[string]',
    allowedValuesFormat: 'comma or pipe delimited',
    generationType: 'AI Generated',
    exampleValue: 'trusted advisor, data-driven',
    isRequired: false,
    displayOrder: 24,
    category: 'Content'
  },
  
  domain_tags: {
    fieldName: 'domain_tags',
    description: 'Topic/domain taxonomy labels.',
    dataType: 'list[string]',
    allowedValuesFormat: 'comma or pipe delimited',
    generationType: 'AI Generated',
    exampleValue: 'B2B Marketing, AI Ops',
    isRequired: false,
    displayOrder: 25,
    category: 'Content'
  },
  
  // ============================================================================
  // AI GENERATED - TASK (6) - Display Order 26-31
  // Task/procedure extraction dimensions
  // ============================================================================
  
  task_name: {
    fieldName: 'task_name',
    description: 'Primary task/procedure name captured by the chunk.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Create Document Categories',
    isRequired: false,
    displayOrder: 26,
    category: 'Task'
  },
  
  preconditions: {
    fieldName: 'preconditions',
    description: 'Requirements before executing the task.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Access to the Categorization module; documents uploaded',
    isRequired: false,
    displayOrder: 27,
    category: 'Task'
  },
  
  inputs: {
    fieldName: 'inputs',
    description: 'Inputs/resources needed to perform the task.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Uploaded PDFs; taxonomy definitions',
    isRequired: false,
    displayOrder: 28,
    category: 'Task'
  },
  
  steps_json: {
    fieldName: 'steps_json',
    description: 'Canonical steps in minimal JSON.',
    dataType: 'json',
    allowedValuesFormat: '[{"step":"...", "details":"..."}]',
    generationType: 'AI Generated',
    exampleValue: '[{"step":"Open Categorizer"},{"step":"Assign Primary Category"}]',
    isRequired: false,
    displayOrder: 29,
    category: 'Task'
  },
  
  expected_output: {
    fieldName: 'expected_output',
    description: 'What success looks like if steps are followed.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Each chunk labeled with Primary Category and Chunk Type',
    isRequired: false,
    displayOrder: 30,
    category: 'Task'
  },
  
  warnings_failure_modes: {
    fieldName: 'warnings_failure_modes',
    description: 'Known pitfalls and failure conditions.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Mislabeling CER as Example; missing citations',
    isRequired: false,
    displayOrder: 31,
    category: 'Task'
  },
  
  // ============================================================================
  // AI GENERATED - CER (5) - Display Order 32-36
  // Claim-Evidence-Reasoning extraction dimensions
  // ============================================================================
  
  claim: {
    fieldName: 'claim',
    description: 'Main assertion stated in this chunk.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Structured chunk labels improve model faithfulness.',
    isRequired: false,
    displayOrder: 32,
    category: 'CER'
  },
  
  evidence_snippets: {
    fieldName: 'evidence_snippets',
    description: 'Quoted or paraphrased evidence supporting the claim.',
    dataType: 'list[string]',
    allowedValuesFormat: 'comma/pipe delimited or JSON array',
    generationType: 'AI Generated',
    exampleValue: '"A/B tests showed 9% fewer hallucinations"',
    isRequired: false,
    displayOrder: 33,
    category: 'CER'
  },
  
  reasoning_sketch: {
    fieldName: 'reasoning_sketch',
    description: 'High-level rationale (concise; no verbose chain-of-thought).',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Labels constrain retrieval and guide selection → more faithful answers.',
    isRequired: false,
    displayOrder: 34,
    category: 'CER'
  },
  
  citations: {
    fieldName: 'citations',
    description: 'Sources/links/DOIs supporting evidence.',
    dataType: 'list[string]',
    allowedValuesFormat: 'comma/pipe delimited',
    generationType: 'AI Generated',
    exampleValue: 'https://example.com/whitepaper',
    isRequired: false,
    displayOrder: 35,
    category: 'CER'
  },
  
  factual_confidence_0_1: {
    fieldName: 'factual_confidence_0_1',
    description: 'Confidence score for factuality (0–1).',
    dataType: 'float',
    allowedValuesFormat: '0.0–1.0',
    generationType: 'AI Generated',
    exampleValue: '0.85',
    isRequired: false,
    displayOrder: 36,
    category: 'CER'
  },
  
  // ============================================================================
  // AI GENERATED - SCENARIO (5) - Display Order 37-41
  // Example/scenario extraction dimensions
  // ============================================================================
  
  scenario_type: {
    fieldName: 'scenario_type',
    description: 'Type of example or application.',
    dataType: 'enum',
    allowedValuesFormat: 'case_study | dialogue | Q&A | walkthrough | anecdote',
    generationType: 'AI Generated',
    exampleValue: 'case_study',
    isRequired: false,
    displayOrder: 37,
    category: 'Scenario'
  },
  
  problem_context: {
    fieldName: 'problem_context',
    description: 'Real-world context of the example.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Local HVAC company launching a maintenance plan',
    isRequired: false,
    displayOrder: 38,
    category: 'Scenario'
  },
  
  solution_action: {
    fieldName: 'solution_action',
    description: 'Action taken in the example.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Applied categorizer; built instruction-tuning pairs',
    isRequired: false,
    displayOrder: 39,
    category: 'Scenario'
  },
  
  outcome_metrics: {
    fieldName: 'outcome_metrics',
    description: 'Measured results or KPIs.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: '+18% response rate; 2x faster drafting',
    isRequired: false,
    displayOrder: 40,
    category: 'Scenario'
  },
  
  style_notes: {
    fieldName: 'style_notes',
    description: 'Narrative/style attributes to mimic.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Conversational, concrete, with numbers',
    isRequired: false,
    displayOrder: 41,
    category: 'Scenario'
  },
  
  // ============================================================================
  // AI GENERATED - TRAINING (3) - Display Order 42-44
  // Instruction-tuning pair dimensions
  // ============================================================================
  
  prompt_candidate: {
    fieldName: 'prompt_candidate',
    description: 'Potential user prompt distilled from the chunk.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Draft a step-by-step checklist to categorize documents.',
    isRequired: false,
    displayOrder: 42,
    category: 'Training'
  },
  
  target_answer: {
    fieldName: 'target_answer',
    description: 'Ideal answer (concise, brand-aligned).',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'A numbered checklist with compliance notes.',
    isRequired: false,
    displayOrder: 43,
    category: 'Training'
  },
  
  style_directives: {
    fieldName: 'style_directives',
    description: 'Formatting/voice directives for answers.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: 'Use numbered steps; avoid jargon; keep to 150–250 words.',
    isRequired: false,
    displayOrder: 44,
    category: 'Training'
  },
  
  // ============================================================================
  // AI GENERATED - RISK (6) - Display Order 45-50
  // Risk/compliance/sensitivity dimensions
  // ============================================================================
  
  safety_tags: {
    fieldName: 'safety_tags',
    description: 'Sensitive-topic flags for filtering/guardrails.',
    dataType: 'list[string]',
    allowedValuesFormat: 'comma or pipe delimited',
    generationType: 'AI Generated',
    exampleValue: 'medical_advice, legal_disclaimer',
    isRequired: false,
    displayOrder: 45,
    category: 'Risk'
  },
  
  coverage_tag: {
    fieldName: 'coverage_tag',
    description: 'How central this chunk is to the domain.',
    dataType: 'string',
    allowedValuesFormat: 'core | supporting | edge',
    generationType: 'AI Generated',
    exampleValue: 'core',
    isRequired: false,
    displayOrder: 46,
    category: 'Risk'
  },
  
  novelty_tag: {
    fieldName: 'novelty_tag',
    description: 'Whether content is common or unique IP.',
    dataType: 'string',
    allowedValuesFormat: 'novel | common | disputed',
    generationType: 'AI Generated',
    exampleValue: 'novel',
    isRequired: false,
    displayOrder: 47,
    category: 'Risk'
  },
  
  ip_sensitivity: {
    fieldName: 'ip_sensitivity',
    description: 'Confidentiality level for IP handling.',
    dataType: 'enum',
    allowedValuesFormat: 'Public | Internal | Confidential | Trade_Secret',
    generationType: 'AI Generated',
    exampleValue: 'Confidential',
    isRequired: false,
    displayOrder: 48,
    category: 'Risk'
  },
  
  pii_flag: {
    fieldName: 'pii_flag',
    description: 'Indicates presence of personal data.',
    dataType: 'boolean',
    allowedValuesFormat: 'true | false',
    generationType: 'AI Generated',
    exampleValue: 'false',
    isRequired: false,
    displayOrder: 49,
    category: 'Risk'
  },
  
  compliance_flags: {
    fieldName: 'compliance_flags',
    description: 'Regulatory or policy flags.',
    dataType: 'list[string]',
    allowedValuesFormat: 'comma or pipe delimited',
    generationType: 'AI Generated',
    exampleValue: 'copyright_third_party, trademark',
    isRequired: false,
    displayOrder: 50,
    category: 'Risk'
  },
  
  // ============================================================================
  // MECHANICALLY GENERATED - TRAINING METADATA (10) - Display Order 51-60
  // Training/labeling metadata (stored in chunk_dimensions table)
  // ============================================================================
  
  embedding_id: {
    fieldName: 'embedding_id',
    description: 'Identifier for stored vector embedding.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Mechanically Generated',
    exampleValue: 'embed_3f9ac2',
    isRequired: false,
    displayOrder: 51,
    category: 'Metadata'
  },
  
  vector_checksum: {
    fieldName: 'vector_checksum',
    description: 'Checksum/hash for the vector payload.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Mechanically Generated',
    exampleValue: 'sha256:7b9...',
    isRequired: false,
    displayOrder: 52,
    category: 'Metadata'
  },
  
  label_source_auto_manual_mixed: {
    fieldName: 'label_source_auto_manual_mixed',
    description: 'Provenance of labels.',
    dataType: 'enum',
    allowedValuesFormat: 'auto | manual | mixed',
    generationType: 'Mechanically Generated',
    exampleValue: 'mixed',
    isRequired: false,
    displayOrder: 53,
    category: 'Metadata'
  },
  
  label_model: {
    fieldName: 'label_model',
    description: 'Model name/version used for auto-labels.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Mechanically Generated',
    exampleValue: 'gpt-5-large-2025-09',
    isRequired: false,
    displayOrder: 54,
    category: 'Metadata'
  },
  
  labeled_by: {
    fieldName: 'labeled_by',
    description: "Human labeler (name/initials) or 'auto'.",
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Mechanically Generated',
    exampleValue: 'auto',
    isRequired: false,
    displayOrder: 55,
    category: 'Metadata'
  },
  
  label_timestamp_iso: {
    fieldName: 'label_timestamp_iso',
    description: 'Timestamp when labels were created.',
    dataType: 'datetime',
    allowedValuesFormat: 'YYYY-MM-DDThh:mm:ssZ',
    generationType: 'Mechanically Generated',
    exampleValue: '2025-09-28T15:20:11Z',
    isRequired: false,
    displayOrder: 56,
    category: 'Metadata'
  },
  
  review_status: {
    fieldName: 'review_status',
    description: 'Human QA review status.',
    dataType: 'enum',
    allowedValuesFormat: 'unreviewed | approved | needs_changes | rejected',
    generationType: 'Mechanically Generated',
    exampleValue: 'unreviewed',
    isRequired: false,
    displayOrder: 57,
    category: 'Metadata'
  },
  
  include_in_training_yn: {
    fieldName: 'include_in_training_yn',
    description: 'Whether to use this chunk in training.',
    dataType: 'boolean',
    allowedValuesFormat: 'Y | N | true | false',
    generationType: 'AI Generated',
    exampleValue: 'true',
    isRequired: false,
    displayOrder: 58,
    category: 'Training'
  },
  
  data_split_train_dev_test: {
    fieldName: 'data_split_train_dev_test',
    description: 'Dataset split allocation.',
    dataType: 'enum',
    allowedValuesFormat: 'train | dev | test',
    generationType: 'Mechanically Generated',
    exampleValue: 'train',
    isRequired: false,
    displayOrder: 59,
    category: 'Metadata'
  },
  
  augmentation_notes: {
    fieldName: 'augmentation_notes',
    description: 'Notes on paraphrase/style/noise augmentation.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'AI Generated',
    exampleValue: "Paraphrase x2; style-transfer to 'friendly'",
    isRequired: false,
    displayOrder: 60,
    category: 'Training'
  }
};

/**
 * Dimensions organized by generation type
 */
export const DIMENSIONS_BY_TYPE = {
  'Prior Generated': [
    'doc_id',
    'doc_title',
    'doc_version',
    'source_type',
    'source_url',
    'author',
    'doc_date',
    'primary_category'
  ],
  'Mechanically Generated': [
    'chunk_id',
    'section_heading',
    'page_start',
    'page_end',
    'char_start',
    'char_end',
    'token_count',
    'overlap_tokens',
    'chunk_handle',
    'embedding_id',
    'vector_checksum',
    'label_source_auto_manual_mixed',
    'label_model',
    'labeled_by',
    'label_timestamp_iso',
    'review_status',
    'data_split_train_dev_test'
  ],
  'AI Generated': [
    'chunk_type',
    'chunk_summary_1s',
    'key_terms',
    'audience',
    'intent',
    'tone_voice_tags',
    'brand_persona_tags',
    'domain_tags',
    'task_name',
    'preconditions',
    'inputs',
    'steps_json',
    'expected_output',
    'warnings_failure_modes',
    'claim',
    'evidence_snippets',
    'reasoning_sketch',
    'citations',
    'factual_confidence_0_1',
    'scenario_type',
    'problem_context',
    'solution_action',
    'outcome_metrics',
    'style_notes',
    'prompt_candidate',
    'target_answer',
    'style_directives',
    'safety_tags',
    'coverage_tag',
    'novelty_tag',
    'ip_sensitivity',
    'pii_flag',
    'compliance_flags',
    'include_in_training_yn',
    'augmentation_notes'
  ]
};

/**
 * Get metadata for a specific dimension field
 * @param fieldName - The dimension field name (camelCase)
 * @returns Dimension metadata or null if not found
 */
export function getDimensionMetadata(fieldName: string): DimensionMetadata | null {
  return DIMENSION_METADATA[fieldName] || null;
}

/**
 * Get all dimensions sorted by display order
 * @returns Array of all dimension metadata sorted by displayOrder
 */
export function getAllDimensions(): DimensionMetadata[] {
  return Object.values(DIMENSION_METADATA).sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Get dimensions filtered by generation type
 * @param type - Generation type: 'Prior Generated', 'Mechanically Generated', or 'AI Generated'
 * @returns Array of dimension metadata for the specified type
 */
export function getDimensionsByType(type: string): DimensionMetadata[] {
  const fieldNames = DIMENSIONS_BY_TYPE[type as keyof typeof DIMENSIONS_BY_TYPE] || [];
  return fieldNames.map(name => DIMENSION_METADATA[name]).filter(Boolean);
}

/**
 * Get dimensions filtered by category
 * @param category - Category: 'Document Metadata', 'Content', 'Task', 'CER', 'Scenario', 'Training', 'Risk', or 'Metadata'
 * @returns Array of dimension metadata for the specified category
 */
export function getDimensionsByCategory(category: string): DimensionMetadata[] {
  return getAllDimensions().filter(dim => dim.category === category);
}

