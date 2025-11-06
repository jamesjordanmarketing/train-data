import { IExportTransformer } from './types';
import {
  Conversation,
  ConversationTurn,
  ExportConfig,
} from '@/lib/types';

/**
 * MarkdownTransformer
 * Transforms conversations to Markdown format for human-readable review
 * Uses headers, blockquotes, and proper formatting
 * Compatible with GitHub, VS Code, and other Markdown renderers
 */
export class MarkdownTransformer implements IExportTransformer {
  /**
   * Transform conversations to Markdown format
   */
  async transform(
    conversations: Conversation[],
    turns: Map<string, ConversationTurn[]>,
    config: ExportConfig
  ): Promise<string> {
    const sections: string[] = [];

    // Add document header
    sections.push('# Training Conversations Export\n');
    sections.push(`**Export Date:** ${new Date().toISOString()}\n`);
    sections.push(`**Total Conversations:** ${conversations.length}\n`);
    sections.push('---\n');

    // Format each conversation
    for (const conversation of conversations) {
      try {
        const conversationTurns = turns.get(conversation.id) || [];
        const markdown = this.formatConversation(
          conversation,
          conversationTurns,
          config
        );
        sections.push(markdown);
        sections.push('---\n'); // Horizontal rule between conversations
      } catch (error) {
        console.error(
          `Error formatting conversation ${conversation.id}:`,
          error
        );
        // Continue processing other conversations
      }
    }

    return sections.join('\n');
  }

  /**
   * Format a single conversation as Markdown
   */
  private formatConversation(
    conversation: Conversation,
    turns: ConversationTurn[],
    config: ExportConfig
  ): string {
    const sections: string[] = [];

    // Conversation title as H2
    sections.push(`## Conversation: ${conversation.title || 'Untitled'}\n`);

    // Format metadata
    if (config.includeMetadata) {
      sections.push(this.formatMetadata(conversation, config));
      sections.push(''); // Empty line for spacing
    }

    // Conversation content header
    sections.push('### Dialogue\n');

    // Format each turn
    for (const turn of turns) {
      sections.push(this.formatTurn(turn));
    }

    return sections.join('\n');
  }

  /**
   * Format conversation metadata as bullet list or table
   */
  private formatMetadata(
    conversation: Conversation,
    config: ExportConfig
  ): string {
    const metadata: string[] = [];

    metadata.push('**Metadata:**\n');
    metadata.push(`- **ID:** ${conversation.id}`);
    metadata.push(`- **Tier:** ${conversation.tier}`);
    metadata.push(`- **Status:** ${conversation.status}`);

    if (conversation.persona) {
      metadata.push(`- **Persona:** ${conversation.persona}`);
    }

    if (conversation.emotion) {
      metadata.push(`- **Emotion:** ${conversation.emotion}`);
    }

    if (conversation.topic) {
      metadata.push(`- **Topic:** ${conversation.topic}`);
    }

    if (config.includeQualityScores && conversation.qualityScore !== undefined) {
      metadata.push(`- **Quality Score:** ${conversation.qualityScore.toFixed(2)}`);
    }

    if (conversation.category && conversation.category.length > 0) {
      metadata.push(`- **Categories:** ${conversation.category.join(', ')}`);
    }

    if (config.includeTimestamps) {
      metadata.push(`- **Created:** ${this.formatDate(conversation.createdAt)}`);
      metadata.push(`- **Updated:** ${this.formatDate(conversation.updatedAt)}`);
    }

    if (config.includeParentReferences && conversation.parentId) {
      metadata.push(`- **Parent ID:** ${conversation.parentId}`);
      if (conversation.parentType) {
        metadata.push(`- **Parent Type:** ${conversation.parentType}`);
      }
    }

    // Add turn and token stats
    metadata.push(`- **Total Turns:** ${conversation.totalTurns}`);
    if (conversation.totalTokens) {
      metadata.push(`- **Total Tokens:** ${conversation.totalTokens}`);
    }

    return metadata.join('\n');
  }

  /**
   * Format a single conversation turn with role and blockquote
   */
  private formatTurn(turn: ConversationTurn): string {
    const sections: string[] = [];

    // Role as bold text
    const roleLabel = turn.role === 'user' ? '**User:**' : '**Assistant:**';
    sections.push(roleLabel);

    // Content as blockquote (each line prefixed with >)
    const contentLines = turn.content.split('\n');
    const blockquote = contentLines.map((line) => `> ${line}`).join('\n');
    sections.push(blockquote);

    // Token count if available
    if (turn.tokenCount !== undefined) {
      sections.push(`*Tokens: ${turn.tokenCount}*`);
    }

    sections.push(''); // Empty line for spacing

    return sections.join('\n');
  }

  /**
   * Format date string for display
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString; // Return original if parsing fails
    }
  }

  /**
   * Validate Markdown output format
   */
  validateOutput(output: string): boolean {
    if (!output) {
      throw new Error('Empty output');
    }

    // Check for document header
    if (!output.includes('# Training Conversations Export')) {
      throw new Error('Missing document header');
    }

    // Check for at least one conversation section
    if (!output.includes('## Conversation:')) {
      throw new Error('No conversation sections found');
    }

    // Check for dialogue content
    if (!output.includes('### Dialogue')) {
      throw new Error('No dialogue sections found');
    }

    // Check for turn markers (User or Assistant)
    if (!output.includes('**User:**') && !output.includes('**Assistant:**')) {
      throw new Error('No conversation turns found');
    }

    // Basic markdown structure validation
    const lines = output.split('\n');
    let hasBlockquote = false;
    for (const line of lines) {
      if (line.startsWith('> ')) {
        hasBlockquote = true;
        break;
      }
    }

    if (!hasBlockquote) {
      throw new Error('No blockquote content found');
    }

    return true;
  }

  getFileExtension(): string {
    return 'md';
  }

  getMimeType(): string {
    return 'text/markdown; charset=utf-8';
  }
}

