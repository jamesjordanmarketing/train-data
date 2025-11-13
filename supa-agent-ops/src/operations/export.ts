/**
 * Export Operations Module
 * Transform and export data to multiple formats: JSONL, JSON, CSV, Markdown
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  ExportParams, 
  ExportResult, 
  ExportConfig,
  ExportFormat,
  NextAction
} from '../core/types';
import { agentQuery } from './query';
import { logger } from '../utils/logger';
import { sanitizeRecord } from '../validation/sanitize';

/**
 * Interface for export format transformers
 */
export interface IExportTransformer {
  /**
   * Transform data records to target format
   */
  transform(data: any[], config: ExportConfig): Promise<string>;
  
  /**
   * Validate the transformed output
   */
  validateOutput(output: string): boolean;
  
  /**
   * Get file extension for this format
   */
  getFileExtension(): string;
  
  /**
   * Get MIME type for this format
   */
  getMimeType(): string;
}

/**
 * JSONL (JSON Lines) Transformer
 * Compatible with OpenAI/Anthropic training formats
 * Each line is a separate JSON object
 */
export class JSONLTransformer implements IExportTransformer {
  async transform(data: any[], config: ExportConfig): Promise<string> {
    const lines: string[] = [];
    
    for (const record of data) {
      // Optionally filter metadata
      let outputRecord = { ...record };
      
      if (!config.includeTimestamps) {
        delete outputRecord.created_at;
        delete outputRecord.updated_at;
      }
      
      if (!config.includeMetadata) {
        // Remove common metadata fields
        delete outputRecord.id;
        delete outputRecord.created_by;
        delete outputRecord.updated_by;
      }
      
      lines.push(JSON.stringify(outputRecord));
    }
    
    return lines.join('\n');
  }
  
  validateOutput(output: string): boolean {
    if (!output || output.trim().length === 0) {
      return true; // Empty output is valid
    }
    
    const lines = output.split('\n').filter(l => l.trim());
    return lines.every(line => {
      try {
        JSON.parse(line);
        return true;
      } catch {
        return false;
      }
    });
  }
  
  getFileExtension(): string {
    return 'jsonl';
  }
  
  getMimeType(): string {
    return 'application/x-ndjson';
  }
}

/**
 * JSON Transformer
 * Structured export with metadata
 */
export class JSONTransformer implements IExportTransformer {
  async transform(data: any[], config: ExportConfig): Promise<string> {
    const processedData = data.map(record => {
      let outputRecord = { ...record };
      
      if (!config.includeTimestamps) {
        delete outputRecord.created_at;
        delete outputRecord.updated_at;
      }
      
      return outputRecord;
    });
    
    const exportObj = {
      version: '1.0',
      export_date: new Date().toISOString(),
      format: 'json',
      count: data.length,
      data: processedData
    };
    
    return JSON.stringify(exportObj, null, 2);
  }
  
  validateOutput(output: string): boolean {
    try {
      const parsed = JSON.parse(output);
      return (
        parsed.version &&
        parsed.data &&
        Array.isArray(parsed.data)
      );
    } catch {
      return false;
    }
  }
  
  getFileExtension(): string {
    return 'json';
  }
  
  getMimeType(): string {
    return 'application/json';
  }
}

/**
 * CSV Transformer
 * Excel-compatible with UTF-8 BOM
 */
export class CSVTransformer implements IExportTransformer {
  async transform(data: any[], config: ExportConfig): Promise<string> {
    if (data.length === 0) {
      return '\uFEFF'; // Just BOM for empty data
    }
    
    // Use dynamic import to load csv-stringify
    const { stringify } = await import('csv-stringify/sync');
    
    // Process data
    const processedData = data.map(record => {
      let outputRecord = { ...record };
      
      if (!config.includeTimestamps) {
        delete outputRecord.created_at;
        delete outputRecord.updated_at;
      }
      
      if (!config.includeMetadata) {
        delete outputRecord.id;
        delete outputRecord.created_by;
        delete outputRecord.updated_by;
      }
      
      // Flatten nested objects to JSON strings
      for (const [key, value] of Object.entries(outputRecord)) {
        if (typeof value === 'object' && value !== null) {
          outputRecord[key] = JSON.stringify(value);
        }
      }
      
      return outputRecord;
    });
    
    // Generate CSV with proper escaping
    const csv = stringify(processedData, {
      header: true,
      quoted: true,
      escape: '"',
      record_delimiter: '\n'
    });
    
    // Add UTF-8 BOM for Excel compatibility
    return '\uFEFF' + csv;
  }
  
  validateOutput(output: string): boolean {
    return output.startsWith('\uFEFF') && output.includes('\n');
  }
  
  getFileExtension(): string {
    return 'csv';
  }
  
  getMimeType(): string {
    return 'text/csv; charset=utf-8';
  }
}

/**
 * Markdown Transformer
 * Human-readable format
 */
export class MarkdownTransformer implements IExportTransformer {
  async transform(data: any[], config: ExportConfig): Promise<string> {
    let md = `# Data Export\n\n`;
    md += `**Exported**: ${new Date().toISOString()}\n`;
    md += `**Records**: ${data.length}\n`;
    md += `**Format**: Markdown\n\n`;
    md += `---\n\n`;
    
    if (data.length === 0) {
      md += `*No records to display*\n`;
      return md;
    }
    
    data.forEach((record, idx) => {
      let outputRecord = { ...record };
      
      if (!config.includeTimestamps) {
        delete outputRecord.created_at;
        delete outputRecord.updated_at;
      }
      
      if (!config.includeMetadata) {
        delete outputRecord.id;
        delete outputRecord.created_by;
        delete outputRecord.updated_by;
      }
      
      md += `## Record ${idx + 1}\n\n`;
      
      // Display key fields as table if available
      const keys = Object.keys(outputRecord);
      if (keys.length > 0 && keys.length <= 5) {
        md += `| Field | Value |\n`;
        md += `|-------|-------|\n`;
        for (const [key, value] of Object.entries(outputRecord)) {
          const displayValue = typeof value === 'object' 
            ? JSON.stringify(value, null, 2).replace(/\n/g, ' ')
            : String(value).replace(/\|/g, '\\|').substring(0, 100);
          md += `| ${key} | ${displayValue} |\n`;
        }
        md += '\n';
      } else {
        // For complex objects, use code block
        md += '```json\n';
        md += JSON.stringify(outputRecord, null, 2);
        md += '\n```\n\n';
      }
    });
    
    return md;
  }
  
  validateOutput(output: string): boolean {
    return output.includes('# Data Export') && output.includes('**Records**');
  }
  
  getFileExtension(): string {
    return 'md';
  }
  
  getMimeType(): string {
    return 'text/markdown';
  }
}

/**
 * Get transformer instance for specified format
 * 
 * @param format - Export format (json, jsonl, csv, markdown)
 * @returns Transformer instance
 */
export function getTransformer(format: ExportFormat): IExportTransformer {
  switch (format) {
    case 'jsonl':
      return new JSONLTransformer();
    case 'json':
      return new JSONTransformer();
    case 'csv':
      return new CSVTransformer();
    case 'markdown':
      return new MarkdownTransformer();
    default:
      throw new Error(`Unknown export format: ${format}`);
  }
}

/**
 * Export data from table to file in specified format
 * 
 * @param params - Export parameters
 * @returns Export result with record count and file info
 * 
 * @example
 * ```typescript
 * // Export to JSONL for training
 * const result = await agentExportData({
 *   table: 'conversations',
 *   destination: './training-data.jsonl',
 *   config: { format: 'jsonl', includeMetadata: false }
 * });
 * 
 * // Export to CSV for Excel
 * const result = await agentExportData({
 *   table: 'conversations',
 *   destination: './data.csv',
 *   config: { format: 'csv', includeTimestamps: true },
 *   filters: [{ column: 'status', operator: 'eq', value: 'approved' }]
 * });
 * ```
 */
export async function agentExportData(params: ExportParams): Promise<ExportResult> {
  const startTime = Date.now();
  
  try {
    const {
      table,
      destination,
      config,
      filters = [],
      columns
    } = params;

    logger.info(`Starting export: ${table} to ${config.format} format`);

    // Step 1: Query data with filters
    const queryResult = await agentQuery({
      table,
      where: filters,
      select: columns
    });

    if (!queryResult.success) {
      throw new Error(`Query failed: ${queryResult.summary}`);
    }

    const data = queryResult.data;
    logger.info(`Retrieved ${data.length} records for export`);

    // Step 2: Get transformer for format
    const transformer = getTransformer(config.format);
    
    // Step 3: Transform data
    const output = await transformer.transform(data, config);
    
    // Step 4: Validate output
    const isValid = transformer.validateOutput(output);
    if (!isValid) {
      throw new Error(`Export validation failed for format: ${config.format}`);
    }

    const fileSize = Buffer.byteLength(output, 'utf8');
    logger.info(`Export transformation complete: ${fileSize} bytes`);

    // Step 5: Write to file if destination provided
    let filePath: string | undefined;
    if (destination) {
      // Ensure directory exists
      const dir = path.dirname(destination);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      await fs.promises.writeFile(destination, output, 'utf8');
      filePath = destination;
      logger.info(`Export written to: ${destination}`);
    }

    const executionTimeMs = Date.now() - startTime;

    const nextActions: NextAction[] = [];

    // Suggest validation for large exports
    if (data.length > 1000) {
      nextActions.push({
        action: 'VALIDATE_EXPORT',
        description: 'Validate large export file integrity',
        example: `Verify ${filePath || 'output'} contains ${data.length} records`,
        priority: 'MEDIUM'
      });
    }

    // Suggest compression for large files
    if (fileSize > 1024 * 1024) { // > 1MB
      nextActions.push({
        action: 'COMPRESS_FILE',
        description: `Large file (${(fileSize / 1024 / 1024).toFixed(2)}MB) - consider compression`,
        example: `gzip ${filePath}`,
        priority: 'LOW'
      });
    }

    return {
      success: true,
      summary: `Exported ${data.length} records to ${config.format} format${filePath ? ` at ${filePath}` : ''}`,
      executionTimeMs,
      recordCount: data.length,
      fileSize,
      filePath,
      nextActions
    };

  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error(`Export operation failed: ${error.message}`);

    const nextActions: NextAction[] = [{
      action: 'CHECK_TABLE',
      description: `Verify table '${params.table}' exists and has data`,
      example: 'agentCount({ table: "' + params.table + '" })',
      priority: 'HIGH'
    }];

    if (params.destination) {
      nextActions.push({
        action: 'CHECK_PERMISSIONS',
        description: 'Verify write permissions for destination path',
        example: `Check directory permissions: ${path.dirname(params.destination)}`,
        priority: 'HIGH'
      });
    }

    return {
      success: false,
      summary: `Export failed: ${error.message}`,
      executionTimeMs,
      recordCount: 0,
      fileSize: 0,
      nextActions
    };
  }
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use agentExportData instead
 */
export async function agentExportTool(params: {
  table: string;
  outputPath: string;
  format?: 'json' | 'ndjson' | 'csv';
  where?: Record<string, any>;
}): Promise<{ success: boolean; recordCount: number; filePath: string }> {
  // Map old format to new format
  const format: ExportFormat = params.format === 'ndjson' ? 'jsonl' : (params.format || 'json');
  
  // Convert old where format to new filters format
  const filters = params.where 
    ? Object.entries(params.where).map(([column, value]) => ({
        column,
        operator: 'eq' as const,
        value
      }))
    : [];
  
  const result = await agentExportData({
    table: params.table,
    destination: params.outputPath,
    config: {
      format,
      includeMetadata: true,
      includeTimestamps: true
    },
    filters
  });
  
  return {
    success: result.success,
    recordCount: result.recordCount,
    filePath: result.filePath || params.outputPath
  };
}
