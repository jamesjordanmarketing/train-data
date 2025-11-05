import {
  IExportTransformer,
  TrainingConversation,
  TrainingMessage,
} from './types';
import {
  Conversation,
  ConversationTurn,
  ExportConfig,
} from '../../../@/lib/types';

/**
 * JSONLTransformer
 * Transforms conversations to JSONL format for LoRA training
 * Format: One JSON object per line, newline-delimited
 * Compatible with OpenAI and Anthropic fine-tuning APIs
 */
export class JSONLTransformer implements IExportTransformer {
  /**
   * Transform conversations to JSONL format
   */
  async transform(
    conversations: Conversation[],
    turns: Map<string, ConversationTurn[]>,
    config: ExportConfig
  ): Promise<string> {
    const lines: string[] = [];

    for (const conversation of conversations) {
      try {
        const conversationTurns = turns.get(conversation.conversation_id) || [];
        const trainingConversation = this.convertToTrainingFormat(
          conversation,
          conversationTurns,
          config
        );

        // Each conversation becomes one line
        const line = JSON.stringify(trainingConversation);
        lines.push(line);
      } catch (error) {
        console.error(
          `Error transforming conversation ${conversation.conversation_id}:`,
          error
        );
        // Continue processing other conversations
      }
    }

    return lines.join('\n');
  }

  /**
   * Convert conversation to OpenAI/Anthropic training format
   */
  private convertToTrainingFormat(
    conversation: Conversation,
    turns: ConversationTurn[],
    config: ExportConfig
  ): TrainingConversation {
    // Build messages array
    const messages: TrainingMessage[] = turns.map((turn) => ({
      role: turn.role,
      content: turn.content,
    }));

    // Build training conversation object
    const trainingConversation: TrainingConversation = {
      messages,
    };

    // Add metadata if requested
    if (config.includeMetadata) {
      trainingConversation.metadata = this.buildMetadata(conversation, config);
    }

    return trainingConversation;
  }

  /**
   * Build metadata object based on config
   */
  private buildMetadata(
    conversation: Conversation,
    config: ExportConfig
  ): Record<string, any> {
    const metadata: Record<string, any> = {
      conversation_id: conversation.conversation_id,
      title: conversation.title,
      tier: conversation.tier,
    };

    if (config.includeQualityScores) {
      metadata.quality_score = conversation.qualityScore;
    }

    if (config.includeTimestamps) {
      metadata.created_at = conversation.createdAt;
      metadata.updated_at = conversation.updatedAt;
    }

    if (config.includeApprovalHistory && conversation.reviewHistory) {
      metadata.review_history = conversation.reviewHistory;
    }

    if (
      config.includeParentReferences &&
      (conversation.parentId || conversation.parentType)
    ) {
      metadata.parent_id = conversation.parentId;
      metadata.parent_type = conversation.parentType;
    }

    // Add persona, emotion, topic if present
    if (conversation.persona) metadata.persona = conversation.persona;
    if (conversation.emotion) metadata.emotion = conversation.emotion;
    if (conversation.topic) metadata.topic = conversation.topic;

    return metadata;
  }

  /**
   * Validate JSONL output format
   */
  validateOutput(output: string): boolean {
    if (!output) {
      throw new Error('Empty output');
    }

    const lines = output.split('\n').filter((line) => line.trim());

    if (lines.length === 0) {
      throw new Error('No valid lines in JSONL output');
    }

    // Validate each line is valid JSON
    for (let i = 0; i < lines.length; i++) {
      try {
        const parsed = JSON.parse(lines[i]);

        // Verify has messages array
        if (!parsed.messages || !Array.isArray(parsed.messages)) {
          throw new Error(`Line ${i + 1}: Missing or invalid messages array`);
        }

        // Verify each message has role and content
        for (const message of parsed.messages) {
          if (!message.role || !message.content) {
            throw new Error(
              `Line ${i + 1}: Message missing role or content`
            );
          }
          if (!['system', 'user', 'assistant'].includes(message.role)) {
            throw new Error(`Line ${i + 1}: Invalid role: ${message.role}`);
          }
        }
      } catch (error) {
        throw new Error(`Line ${i + 1}: Invalid JSON - ${(error as Error).message}`);
      }
    }

    return true;
  }

  getFileExtension(): string {
    return 'jsonl';
  }

  getMimeType(): string {
    return 'application/x-ndjson'; // Newline-delimited JSON
  }
}

