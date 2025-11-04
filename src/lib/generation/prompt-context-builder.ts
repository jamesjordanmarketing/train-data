/**
 * Prompt Context Builder
 * 
 * Builds enriched prompts by injecting chunk context, metadata, and dimension data
 * into generation templates. Handles intelligent truncation for long chunks.
 */

import type { ChunkReference, DimensionSource, PromptContext } from './types';

export class PromptContextBuilder {
  private maxChunkLength: number = 5000; // characters

  /**
   * Build enriched prompt with chunk context
   * @param template - Base prompt template
   * @param chunk - Chunk to inject
   * @param dimensions - Optional dimension data
   * @returns Resolved prompt string
   */
  buildPrompt(
    template: string,
    chunk?: ChunkReference,
    dimensions?: DimensionSource
  ): string {
    if (!chunk) {
      return template;
    }

    const context = this.buildContext(chunk, dimensions);
    
    // Replace placeholders: {{chunk_content}}, {{chunk_metadata}}, {{dimension_context}}
    let prompt = template
      .replace('{{chunk_content}}', context.chunkContent)
      .replace('{{chunk_metadata}}', context.chunkMetadata);
    
    if (context.dimensionContext) {
      prompt = prompt.replace('{{dimension_context}}', context.dimensionContext);
    } else {
      // Remove placeholder if no dimension context
      prompt = prompt.replace('{{dimension_context}}', '');
    }

    return prompt;
  }

  /**
   * Build context object from chunk and dimensions
   */
  private buildContext(
    chunk: ChunkReference,
    dimensions?: DimensionSource
  ): PromptContext {
    // Truncate content if too long
    const chunkContent = this.truncateContent(chunk.content);

    // Build metadata string
    const metadataParts = [
      `Document: ${chunk.documentTitle || chunk.documentId}`,
      chunk.sectionHeading && `Section: ${chunk.sectionHeading}`,
      chunk.pageStart && chunk.pageEnd && `Pages: ${chunk.pageStart}-${chunk.pageEnd}`,
      `Chunk Type: ${chunk.chunkType}`,
      `Tokens: ${chunk.tokenCount}`,
    ].filter(Boolean);

    const chunkMetadata = metadataParts.join(' | ');

    // Build dimension context if available
    let dimensionContext: string | undefined;
    if (dimensions?.semanticDimensions) {
      const { persona, emotion, complexity, domain, audience, intent } = dimensions.semanticDimensions;
      
      const dimensionParts = [
        persona && persona.length > 0 && `Suggested Personas: ${persona.join(', ')}`,
        emotion && emotion.length > 0 && `Detected Emotions: ${emotion.join(', ')}`,
        complexity !== undefined && `Complexity Level: ${(complexity * 10).toFixed(1)}/10`,
        domain && domain.length > 0 && `Domain: ${domain.join(', ')}`,
        audience && `Audience: ${audience}`,
        intent && `Intent: ${intent}`,
        `Dimension Confidence: ${(dimensions.confidence * 100).toFixed(0)}%`,
      ].filter(Boolean);

      if (dimensionParts.length > 0) {
        dimensionContext = dimensionParts.join('\n');
      }
    }

    return { chunkContent, chunkMetadata, dimensionContext };
  }

  /**
   * Intelligently truncate long chunk content
   * Preserves first and last paragraphs, indicates truncation
   */
  private truncateContent(content: string): string {
    if (content.length <= this.maxChunkLength) {
      return content;
    }

    const paragraphs = content.split('\n\n');
    if (paragraphs.length <= 2) {
      // Single long paragraph - hard truncate
      return content.slice(0, this.maxChunkLength) + '\n\n[... content truncated for brevity ...]';
    }

    // Keep first and last paragraphs
    const first = paragraphs[0];
    const last = paragraphs[paragraphs.length - 1];
    const truncated = `${first}\n\n[... middle content omitted ...]\n\n${last}`;

    if (truncated.length > this.maxChunkLength) {
      // Still too long, hard truncate
      return truncated.slice(0, this.maxChunkLength) + '...';
    }

    return truncated;
  }

  /**
   * Build context from multiple chunks (up to 3)
   * Combines chunk content with separation markers
   */
  buildMultiChunkPrompt(
    template: string,
    chunks: ChunkReference[],
    primaryChunkIndex: number = 0,
    dimensions?: DimensionSource
  ): string {
    if (chunks.length === 0) {
      return template;
    }

    // If only one chunk, use regular single-chunk method
    if (chunks.length === 1) {
      return this.buildPrompt(template, chunks[0], dimensions);
    }

    // Combine multiple chunks with markers
    const combinedContent = chunks
      .map((chunk, index) => {
        const marker = index === primaryChunkIndex ? '[PRIMARY CHUNK]' : `[REFERENCE CHUNK ${index + 1}]`;
        const truncated = this.truncateContent(chunk.content);
        return `${marker}\n${truncated}`;
      })
      .join('\n\n---\n\n');

    // Build metadata for all chunks
    const metadataLines = chunks.map((chunk, index) => {
      const prefix = index === primaryChunkIndex ? 'Primary:' : `Ref ${index + 1}:`;
      return `${prefix} ${chunk.documentTitle || chunk.documentId} | ${chunk.sectionHeading || 'N/A'}`;
    });
    const combinedMetadata = metadataLines.join('\n');

    // Build dimension context (use dimensions from primary chunk)
    let dimensionContext: string | undefined;
    if (dimensions?.semanticDimensions) {
      const parts = this.buildContext(chunks[primaryChunkIndex], dimensions);
      dimensionContext = parts.dimensionContext;
    }

    // Replace placeholders
    let prompt = template
      .replace('{{chunk_content}}', combinedContent)
      .replace('{{chunk_metadata}}', combinedMetadata);
    
    if (dimensionContext) {
      prompt = prompt.replace('{{dimension_context}}', dimensionContext);
    } else {
      prompt = prompt.replace('{{dimension_context}}', '');
    }

    return prompt;
  }

  /**
   * Set maximum chunk length for truncation
   */
  setMaxChunkLength(length: number): void {
    this.maxChunkLength = length;
  }

  /**
   * Get current max chunk length
   */
  getMaxChunkLength(): number {
    return this.maxChunkLength;
  }
}

// Export singleton instance
export const promptContextBuilder = new PromptContextBuilder();

