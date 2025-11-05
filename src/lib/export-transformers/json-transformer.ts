import { IExportTransformer } from './types';
import {
  Conversation,
  ConversationTurn,
  ExportConfig,
} from '../../../@/lib/types';

/**
 * Structured JSON export format
 */
interface ConversationExport {
  conversation_id: string;
  title: string;
  status: string;
  tier: string;
  turns: {
    role: 'user' | 'assistant';
    content: string;
    token_count?: number;
  }[];
  metadata?: Record<string, any>;
}

interface JSONExport {
  version: string; // Schema version for compatibility
  export_date: string;
  conversation_count: number;
  conversations: ConversationExport[];
  summary?: {
    total_turns: number;
    average_quality_score?: number;
    tier_distribution?: Record<string, number>;
  };
}

/**
 * JSONTransformer
 * Transforms conversations to structured JSON array format
 * Includes complete metadata and quality metrics
 * Pretty-printed for readability
 */
export class JSONTransformer implements IExportTransformer {
  /**
   * Transform conversations to JSON format
   */
  async transform(
    conversations: Conversation[],
    turns: Map<string, ConversationTurn[]>,
    config: ExportConfig
  ): Promise<string> {
    const conversationExports: ConversationExport[] = [];

    for (const conversation of conversations) {
      try {
        const conversationTurns = turns.get(conversation.conversation_id) || [];
        const exportData = this.convertConversation(
          conversation,
          conversationTurns,
          config
        );
        conversationExports.push(exportData);
      } catch (error) {
        console.error(
          `Error transforming conversation ${conversation.conversation_id}:`,
          error
        );
      }
    }

    // Build complete export object
    const exportObj: JSONExport = {
      version: '1.0',
      export_date: new Date().toISOString(),
      conversation_count: conversationExports.length,
      conversations: conversationExports,
    };

    // Add summary if metadata included
    if (config.includeMetadata) {
      exportObj.summary = this.buildSummary(conversations);
    }

    // Pretty print with 2-space indentation
    return JSON.stringify(exportObj, null, 2);
  }

  /**
   * Convert single conversation to export format
   */
  private convertConversation(
    conversation: Conversation,
    turns: ConversationTurn[],
    config: ExportConfig
  ): ConversationExport {
    const exportData: ConversationExport = {
      conversation_id: conversation.conversation_id,
      title: conversation.title,
      status: conversation.status,
      tier: conversation.tier,
      turns: turns.map((turn) => {
        const turnData: any = {
          role: turn.role,
          content: turn.content,
        };
        if (turn.tokenCount) {
          turnData.token_count = turn.tokenCount;
        }
        return turnData;
      }),
    };

    // Add metadata if requested
    if (config.includeMetadata) {
      exportData.metadata = {
        persona: conversation.persona,
        emotion: conversation.emotion,
        topic: conversation.topic,
        category: conversation.category,
        total_turns: conversation.totalTurns,
        token_count: conversation.tokenCount,
      };

      if (config.includeQualityScores) {
        exportData.metadata.quality_score = conversation.qualityScore;
      }

      if (config.includeTimestamps) {
        exportData.metadata.created_at = conversation.createdAt;
        exportData.metadata.updated_at = conversation.updatedAt;
      }

      if (config.includeApprovalHistory && conversation.reviewHistory) {
        exportData.metadata.review_history = conversation.reviewHistory;
      }

      if (
        config.includeParentReferences &&
        (conversation.parentId || conversation.parentType)
      ) {
        exportData.metadata.parent_id = conversation.parentId;
        exportData.metadata.parent_type = conversation.parentType;
      }

      // Add custom parameters
      if (conversation.parameters && Object.keys(conversation.parameters).length > 0) {
        exportData.metadata.parameters = conversation.parameters;
      }
    }

    return exportData;
  }

  /**
   * Build summary statistics
   */
  private buildSummary(conversations: Conversation[]): JSONExport['summary'] {
    const totalTurns = conversations.reduce(
      (sum, c) => sum + c.totalTurns,
      0
    );

    const qualityScores = conversations
      .map((c) => c.qualityScore)
      .filter((score) => score !== undefined && score !== null);
    const averageQualityScore =
      qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : undefined;

    const tierDistribution: Record<string, number> = {};
    for (const conversation of conversations) {
      tierDistribution[conversation.tier] = (tierDistribution[conversation.tier] || 0) + 1;
    }

    return {
      total_turns: totalTurns,
      average_quality_score: averageQualityScore,
      tier_distribution: tierDistribution,
    };
  }

  /**
   * Validate JSON output format
   */
  validateOutput(output: string): boolean {
    if (!output) {
      throw new Error('Empty output');
    }

    try {
      const parsed: JSONExport = JSON.parse(output);

      // Verify required fields
      if (!parsed.version) {
        throw new Error('Missing version field');
      }
      if (!parsed.export_date) {
        throw new Error('Missing export_date field');
      }
      if (parsed.conversation_count === undefined) {
        throw new Error('Missing conversation_count field');
      }
      if (!Array.isArray(parsed.conversations)) {
        throw new Error('conversations must be an array');
      }

      // Verify conversation count matches
      if (parsed.conversation_count !== parsed.conversations.length) {
        throw new Error(
          `Conversation count mismatch: declared ${parsed.conversation_count}, actual ${parsed.conversations.length}`
        );
      }

      // Verify each conversation has required fields
      for (let i = 0; i < parsed.conversations.length; i++) {
        const conv = parsed.conversations[i];
        if (!conv.conversation_id) {
          throw new Error(`Conversation ${i}: Missing conversation_id`);
        }
        if (!Array.isArray(conv.turns)) {
          throw new Error(`Conversation ${i}: turns must be an array`);
        }
        if (conv.turns.length === 0) {
          throw new Error(`Conversation ${i}: turns array is empty`);
        }

        // Verify each turn has role and content
        for (let j = 0; j < conv.turns.length; j++) {
          const turn = conv.turns[j];
          if (!turn.role || !turn.content) {
            throw new Error(
              `Conversation ${i}, Turn ${j}: Missing role or content`
            );
          }
        }
      }

      return true;
    } catch (error) {
      throw new Error(`Invalid JSON format: ${(error as Error).message}`);
    }
  }

  getFileExtension(): string {
    return 'json';
  }

  getMimeType(): string {
    return 'application/json';
  }
}

