/**
 * Generation Integration Types
 * 
 * Type definitions that bridge chunks, dimensions, and conversation generation
 */

import { Chunk, ChunkDimensions } from '@/types/chunks';

// ============================================================================
// Chunk Reference Types (for Generation Context)
// ============================================================================

/**
 * Lightweight chunk reference for prompt injection
 * Contains essential chunk data without full database record
 */
export interface ChunkReference {
  id: string;
  chunkId: string;
  documentId: string;
  documentTitle?: string;
  content: string;
  sectionHeading?: string;
  pageStart?: number;
  pageEnd?: number;
  tokenCount: number;
  chunkType: string;
}

/**
 * Convert database Chunk to ChunkReference for generation
 */
export function toChunkReference(chunk: Chunk, documentTitle?: string): ChunkReference {
  return {
    id: chunk.id,
    chunkId: chunk.chunk_id,
    documentId: chunk.document_id,
    documentTitle,
    content: chunk.chunk_text,
    sectionHeading: chunk.section_heading || undefined,
    pageStart: chunk.page_start || undefined,
    pageEnd: chunk.page_end || undefined,
    tokenCount: chunk.token_count,
    chunkType: chunk.chunk_type,
  };
}

// ============================================================================
// Dimension Source Types (for Parameter Mapping)
// ============================================================================

/**
 * Semantic dimensions extracted from chunk content
 * Used to inform conversation generation parameters
 */
export interface SemanticDimensions {
  persona?: string[]; // Suggested personas from tone_voice_tags/brand_persona_tags
  emotion?: string[]; // Emotions from tone_voice_tags
  complexity?: number; // 0-1 scale derived from content analysis
  domain?: string[]; // Domain tags from chunk dimensions
  audience?: string; // Target audience
  intent?: string; // Communication intent
}

/**
 * Dimension source with confidence and metadata
 */
export interface DimensionSource {
  chunkId: string;
  runId: string;
  semanticDimensions: SemanticDimensions;
  confidence: number; // Overall dimension confidence (0-1)
  generationModel?: string;
  generatedAt: string;
}

/**
 * Convert database ChunkDimensions to DimensionSource
 */
export function toDimensionSource(dimensions: ChunkDimensions): DimensionSource {
  // Calculate complexity from various factors
  const complexity = calculateComplexity(dimensions);
  
  // Extract personas from tone/brand tags
  const personas = extractPersonas(dimensions);
  
  // Extract emotions from tone tags
  const emotions = extractEmotions(dimensions);
  
  // Calculate overall confidence from generation confidence metrics
  const confidence = calculateOverallConfidence(dimensions);

  return {
    chunkId: dimensions.chunk_id,
    runId: dimensions.run_id,
    semanticDimensions: {
      persona: personas,
      emotion: emotions,
      complexity,
      domain: dimensions.domain_tags || undefined,
      audience: dimensions.audience || undefined,
      intent: dimensions.intent || undefined,
    },
    confidence,
    generationModel: dimensions.label_model || undefined,
    generatedAt: dimensions.generated_at,
  };
}

/**
 * Calculate complexity score (0-1) from chunk dimensions
 */
function calculateComplexity(dimensions: ChunkDimensions): number {
  let complexityScore = 0.5; // Default medium complexity
  
  // Factor in key terms count (more terms = higher complexity)
  if (dimensions.key_terms && dimensions.key_terms.length > 0) {
    const termCount = dimensions.key_terms.length;
    // Scale: 1-3 terms = low (0.3), 4-7 terms = medium (0.5), 8+ terms = high (0.8)
    if (termCount <= 3) complexityScore = 0.3;
    else if (termCount <= 7) complexityScore = 0.5;
    else complexityScore = 0.8;
  }
  
  // Adjust for CER (more analytical = higher complexity)
  if (dimensions.factual_confidence_0_1 !== null) {
    // High factual confidence suggests complex analytical content
    complexityScore = Math.max(complexityScore, 0.7);
  }
  
  // Adjust for task instructions (procedural = medium-high complexity)
  if (dimensions.steps_json !== null) {
    const steps = Array.isArray(dimensions.steps_json) ? dimensions.steps_json : [];
    if (steps.length > 5) complexityScore = Math.max(complexityScore, 0.7);
  }
  
  return Math.min(1.0, Math.max(0.0, complexityScore));
}

/**
 * Extract persona suggestions from tone/brand tags
 */
function extractPersonas(dimensions: ChunkDimensions): string[] {
  const personas = new Set<string>();
  
  // From brand persona tags
  if (dimensions.brand_persona_tags) {
    dimensions.brand_persona_tags.forEach(tag => personas.add(tag));
  }
  
  // From tone/voice tags (map to personas)
  if (dimensions.tone_voice_tags) {
    dimensions.tone_voice_tags.forEach(tag => {
      const mapped = mapToneToPersona(tag);
      if (mapped) personas.add(mapped);
    });
  }
  
  // Default if none found
  if (personas.size === 0) {
    personas.add('professional');
  }
  
  return Array.from(personas);
}

/**
 * Extract emotion suggestions from tone tags
 */
function extractEmotions(dimensions: ChunkDimensions): string[] {
  const emotions = new Set<string>();
  
  if (dimensions.tone_voice_tags) {
    dimensions.tone_voice_tags.forEach(tag => {
      const mapped = mapToneToEmotion(tag);
      if (mapped) emotions.add(mapped);
    });
  }
  
  // Default if none found
  if (emotions.size === 0) {
    emotions.add('neutral');
  }
  
  return Array.from(emotions);
}

/**
 * Calculate overall confidence from dimension metrics
 */
function calculateOverallConfidence(dimensions: ChunkDimensions): number {
  const precisionConf = dimensions.generation_confidence_precision || 0.7;
  const accuracyConf = dimensions.generation_confidence_accuracy || 0.7;
  
  // Average precision and accuracy for overall confidence
  return (precisionConf + accuracyConf) / 2;
}

/**
 * Map tone tag to persona
 */
function mapToneToPersona(tone: string): string | null {
  const lowerTone = tone.toLowerCase();
  
  const mapping: Record<string, string> = {
    'formal': 'professional',
    'professional': 'professional',
    'casual': 'friendly',
    'friendly': 'friendly',
    'authoritative': 'expert',
    'expert': 'expert',
    'technical': 'technical',
    'educational': 'teacher',
    'empathetic': 'supportive',
    'supportive': 'supportive',
  };
  
  return mapping[lowerTone] || null;
}

/**
 * Map tone tag to emotion
 */
function mapToneToEmotion(tone: string): string | null {
  const lowerTone = tone.toLowerCase();
  
  const mapping: Record<string, string> = {
    'enthusiastic': 'excited',
    'excited': 'excited',
    'calm': 'neutral',
    'neutral': 'neutral',
    'urgent': 'concerned',
    'serious': 'serious',
    'playful': 'happy',
    'cheerful': 'happy',
    'empathetic': 'understanding',
    'concerned': 'concerned',
  };
  
  return mapping[lowerTone] || null;
}

// ============================================================================
// Conversation Context Types
// ============================================================================

/**
 * Extended generation params with chunk context
 */
export interface ChunkAwareGenerationParams {
  parentChunkId?: string;
  explicitParams?: boolean; // True if params manually set (don't override)
  promptTemplate?: string; // Template with placeholders
}

/**
 * Context data built for prompt injection
 */
export interface PromptContext {
  chunkContent: string;
  chunkMetadata: string;
  dimensionContext?: string;
}

/**
 * Multi-chunk support (FR requirement: up to 3 chunks per conversation)
 */
export interface MultiChunkContext {
  chunks: ChunkReference[];
  primaryChunkId: string;
  combinedContext: PromptContext;
}

