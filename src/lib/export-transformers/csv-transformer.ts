import { IExportTransformer } from './types';
import {
  Conversation,
  ConversationTurn,
  ExportConfig,
} from '../../../@/lib/types';
import { stringify } from 'csv-stringify/sync';

/**
 * Flattened CSV row structure (one turn per row)
 */
interface CSVRow {
  conversation_id: string;
  title: string;
  status: string;
  tier: string;
  turn_number: number;
  role: string;
  content: string;
  quality_score?: number;
  persona?: string;
  emotion?: string;
  topic?: string;
  created_at?: string;
  updated_at?: string;
  token_count?: number;
  parent_id?: string;
  parent_type?: string;
}

/**
 * CSVTransformer
 * Transforms conversations to CSV format with one turn per row (flattened structure)
 * Includes UTF-8 BOM for Excel compatibility
 * Uses csv-stringify library for proper escaping of quotes, commas, newlines
 */
export class CSVTransformer implements IExportTransformer {
  /**
   * Transform conversations to CSV format
   */
  async transform(
    conversations: Conversation[],
    turns: Map<string, ConversationTurn[]>,
    config: ExportConfig
  ): Promise<string> {
    // Flatten conversations into rows
    const rows = this.flattenConversations(conversations, turns, config);

    // Generate headers dynamically based on config
    const headers = this.generateHeaders(config);

    // Convert to CSV using csv-stringify
    const csvContent = stringify(rows, {
      header: true,
      columns: headers,
      quoted: true, // Quote all fields for safety
      quoted_string: true, // Quote string fields
      escape: '"', // Escape quotes with double quotes
      record_delimiter: '\n', // Use newline as record delimiter
    });

    // Prepend UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    return BOM + csvContent;
  }

  /**
   * Flatten conversations into array of CSVRow objects
   * One row per turn, with conversation metadata repeated
   */
  private flattenConversations(
    conversations: Conversation[],
    turns: Map<string, ConversationTurn[]>,
    config: ExportConfig
  ): CSVRow[] {
    const rows: CSVRow[] = [];

    for (const conversation of conversations) {
      try {
        const conversationTurns = turns.get(conversation.id) || [];

        // Create one row per turn
        for (let i = 0; i < conversationTurns.length; i++) {
          const turn = conversationTurns[i];
          const row: CSVRow = {
            conversation_id: conversation.id,
            title: conversation.title || '',
            status: conversation.status,
            tier: conversation.tier,
            turn_number: i + 1,
            role: turn.role,
            content: turn.content,
          };

          // Add optional fields based on config
          if (config.includeQualityScores && conversation.qualityScore !== undefined) {
            row.quality_score = conversation.qualityScore;
          }

          if (config.includeMetadata) {
            row.persona = conversation.persona;
            row.emotion = conversation.emotion;
            row.topic = conversation.topic;
          }

          if (config.includeTimestamps) {
            row.created_at = conversation.createdAt;
            row.updated_at = conversation.updatedAt;
          }

          if (turn.tokenCount !== undefined) {
            row.token_count = turn.tokenCount;
          }

          if (config.includeParentReferences) {
            row.parent_id = conversation.parentId;
            row.parent_type = conversation.parentType;
          }

          rows.push(row);
        }
      } catch (error) {
        console.error(
          `Error flattening conversation ${conversation.id}:`,
          error
        );
        // Continue processing other conversations
      }
    }

    return rows;
  }

  /**
   * Generate column headers dynamically based on config
   */
  private generateHeaders(config: ExportConfig): Record<string, string> {
    const headers: Record<string, string> = {
      conversation_id: 'Conversation ID',
      title: 'Title',
      status: 'Status',
      tier: 'Tier',
      turn_number: 'Turn Number',
      role: 'Role',
      content: 'Content',
    };

    if (config.includeQualityScores) {
      headers.quality_score = 'Quality Score';
    }

    if (config.includeMetadata) {
      headers.persona = 'Persona';
      headers.emotion = 'Emotion';
      headers.topic = 'Topic';
    }

    if (config.includeTimestamps) {
      headers.created_at = 'Created At';
      headers.updated_at = 'Updated At';
    }

    headers.token_count = 'Token Count';

    if (config.includeParentReferences) {
      headers.parent_id = 'Parent ID';
      headers.parent_type = 'Parent Type';
    }

    return headers;
  }

  /**
   * Validate CSV output format
   */
  validateOutput(output: string): boolean {
    if (!output) {
      throw new Error('Empty output');
    }

    // Check for UTF-8 BOM
    if (!output.startsWith('\uFEFF')) {
      throw new Error('Missing UTF-8 BOM for Excel compatibility');
    }

    // Remove BOM for parsing
    const withoutBOM = output.slice(1);
    const lines = withoutBOM.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    // Validate header row exists
    const headerRow = lines[0];
    if (!headerRow.includes('Conversation ID') || !headerRow.includes('Content')) {
      throw new Error('CSV header row missing required columns');
    }

    // Basic validation that we have data rows
    const dataRowCount = lines.length - 1; // Subtract header
    if (dataRowCount === 0) {
      throw new Error('CSV has no data rows');
    }

    return true;
  }

  getFileExtension(): string {
    return 'csv';
  }

  getMimeType(): string {
    return 'text/csv; charset=utf-8';
  }
}

