import { Conversation, ConversationTurn, ExportConfig } from '../../../@/lib/types';

/**
 * Base interface for all export transformers
 * Implements Strategy pattern for format-specific transformation
 */
export interface IExportTransformer {
  /**
   * Transform conversations to target format
   * @param conversations Array of conversations to export
   * @param turns Map of conversation_id to array of turns
   * @param config Export configuration controlling output
   * @returns Transformed data as string
   */
  transform(
    conversations: Conversation[],
    turns: Map<string, ConversationTurn[]>,
    config: ExportConfig
  ): Promise<string>;

  /**
   * Validate output conforms to format specification
   * @param output Generated export string
   * @returns True if valid, throws error with details if invalid
   */
  validateOutput(output: string): boolean;

  /**
   * Get file extension for this format
   */
  getFileExtension(): string;

  /**
   * Get MIME type for HTTP response
   */
  getMimeType(): string;
}

/**
 * Configuration for streaming large exports
 */
export interface StreamingConfig {
  batchSize: number; // Number of conversations per batch (default 100)
  enableStreaming: boolean; // Enable for >500 conversations
}

/**
 * OpenAI/Anthropic JSONL message format
 */
export interface TrainingMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TrainingConversation {
  messages: TrainingMessage[];
  metadata?: Record<string, any>;
}

