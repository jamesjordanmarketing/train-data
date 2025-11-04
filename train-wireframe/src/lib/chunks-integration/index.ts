/**
 * Chunks Integration Module
 * 
 * Provides service layer for integrating with chunks-alpha module:
 * - ChunksService: Query chunks and dimensions with caching
 * - DimensionParser: Parse 60-dimension data into semantic categories
 * - ChunkCache: LRU cache with TTL support
 * 
 * Usage:
 *   import { chunksService, dimensionParser, chunkCache } from '@/lib/chunks-integration';
 *   
 *   const chunk = await chunksService.getChunkById('chunk-id');
 *   const parsed = dimensionParser.parse(dimensions, confidence);
 *   const metrics = chunkCache.getMetrics();
 */

// Export services
export { ChunksService, chunksService } from './chunks-service';
export type { ChunkWithDimensions, ChunkQueryOptions } from './chunks-service';

export { DimensionParser, dimensionParser } from './dimension-parser';

export { ChunkCache, chunkCache } from './chunk-cache';
export type { CacheMetrics } from './chunk-cache';

// Re-export relevant types from parent types module
export type { ChunkReference, DimensionSource } from '../types';

