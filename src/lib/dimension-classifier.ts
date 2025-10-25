/**
 * Dimension Classifier
 * 
 * This module provides classification and confidence logic for chunk dimensions.
 * It determines generation types, calculates confidence scores, and analyzes
 * population statistics for dimension data.
 */

import { DIMENSION_METADATA, DIMENSIONS_BY_TYPE } from './dimension-metadata';
import { ChunkDimensions } from '../types/chunks';

/**
 * Get the generation type for a dimension field
 * @param fieldName - The dimension field name (camelCase)
 * @returns Generation type: 'Prior Generated', 'Mechanically Generated', 'AI Generated', or 'Unknown'
 */
export function getGenerationType(fieldName: string): string {
  const metadata = DIMENSION_METADATA[fieldName];
  return metadata?.generationType || 'Unknown';
}

/**
 * Get confidence scores for a specific dimension
 * 
 * RULES:
 * - Prior Generated and Mechanically Generated dimensions always have perfect confidence (10.0)
 * - AI Generated dimensions use stored values from generation_confidence_precision and generation_confidence_accuracy
 * 
 * @param fieldName - The dimension field name (camelCase)
 * @param dimensions - The chunk dimensions data containing confidence values
 * @returns Object with precision and accuracy confidence scores (0-10 scale)
 */
export function getConfidenceForDimension(
  fieldName: string,
  dimensions: ChunkDimensions
): { precision: number; accuracy: number } {
  const generationType = getGenerationType(fieldName);
  
  // Prior Generated and Mechanically Generated always have perfect confidence
  if (generationType !== 'AI Generated') {
    return { precision: 10.0, accuracy: 10.0 };
  }
  
  // AI Generated dimensions use stored confidence scores
  // Note: Database stores values 0-10, so we use them directly
  return {
    precision: dimensions.generation_confidence_precision ?? 0,
    accuracy: dimensions.generation_confidence_accuracy ?? 0
  };
}

/**
 * Check if a dimension value is populated (not null/undefined/empty)
 * @param value - The dimension value to check
 * @returns true if the value is populated, false otherwise
 */
export function isPopulated(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
}

/**
 * Calculate the percentage of populated dimensions
 * @param dimensions - The chunk dimensions data
 * @returns Percentage of dimensions that are populated (0-100)
 */
export function getPopulatedPercentage(dimensions: ChunkDimensions): number {
  const allDimensions = Object.keys(DIMENSION_METADATA);
  const populatedCount = allDimensions.filter(fieldName => {
    const value = (dimensions as any)[fieldName];
    return isPopulated(value);
  }).length;
  
  return Math.round((populatedCount / allDimensions.length) * 100);
}

/**
 * Calculate average confidence across AI Generated dimensions only
 * 
 * IMPORTANT: Only AI Generated dimensions (35 fields) are included in this calculation.
 * Prior Generated and Mechanically Generated dimensions are excluded as they always have perfect confidence.
 * 
 * @param dimensions - The chunk dimensions data
 * @returns Object with averagePrecision and averageAccuracy (0-10 scale, rounded to 1 decimal)
 */
export function getAverageConfidence(dimensions: ChunkDimensions): {
  averagePrecision: number;
  averageAccuracy: number;
} {
  const aiDimensions = DIMENSIONS_BY_TYPE['AI Generated'];
  const confidences = aiDimensions.map(fieldName => 
    getConfidenceForDimension(fieldName, dimensions)
  );
  
  const avgPrecision = confidences.reduce((sum, c) => sum + c.precision, 0) / confidences.length;
  const avgAccuracy = confidences.reduce((sum, c) => sum + c.accuracy, 0) / confidences.length;
  
  return {
    averagePrecision: Math.round(avgPrecision * 10) / 10,
    averageAccuracy: Math.round(avgAccuracy * 10) / 10
  };
}

/**
 * Get statistics about populated dimensions by generation type
 * @param dimensions - The chunk dimensions data
 * @returns Object with counts for each generation type
 */
export function getPopulationStatsByType(dimensions: ChunkDimensions): {
  priorGenerated: { total: number; populated: number };
  mechanicallyGenerated: { total: number; populated: number };
  aiGenerated: { total: number; populated: number };
} {
  const countPopulated = (fieldNames: string[]) => {
    return fieldNames.filter(fieldName => {
      const value = (dimensions as any)[fieldName];
      return isPopulated(value);
    }).length;
  };
  
  return {
    priorGenerated: {
      total: DIMENSIONS_BY_TYPE['Prior Generated'].length,
      populated: countPopulated(DIMENSIONS_BY_TYPE['Prior Generated'])
    },
    mechanicallyGenerated: {
      total: DIMENSIONS_BY_TYPE['Mechanically Generated'].length,
      populated: countPopulated(DIMENSIONS_BY_TYPE['Mechanically Generated'])
    },
    aiGenerated: {
      total: DIMENSIONS_BY_TYPE['AI Generated'].length,
      populated: countPopulated(DIMENSIONS_BY_TYPE['AI Generated'])
    }
  };
}

