/**
 * Generation Module Index
 * 
 * Central export point for chunk integration and dimension-driven generation
 */

// Core services
export { chunksService, dimensionParser } from './chunks-integration';
export { promptContextBuilder } from './prompt-context-builder';
export { dimensionParameterMapper } from './dimension-parameter-mapper';

// Types
export type {
  ChunkReference,
  DimensionSource,
  SemanticDimensions,
  PromptContext,
  ChunkAwareGenerationParams,
  MultiChunkContext,
} from './types';

export type {
  ParameterSuggestions,
} from './dimension-parameter-mapper';

// Type converters
export { toChunkReference, toDimensionSource } from './types';

// Re-export classes for advanced usage
export { PromptContextBuilder } from './prompt-context-builder';
export { DimensionParameterMapper } from './dimension-parameter-mapper';
export { ChunksIntegrationService, DimensionParser } from './chunks-integration';

