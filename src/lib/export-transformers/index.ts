import type { IExportTransformer } from './types';
import { JSONLTransformer } from './jsonl-transformer';
import { JSONTransformer } from './json-transformer';
import { CSVTransformer } from './csv-transformer';
import { MarkdownTransformer } from './markdown-transformer';
import { ExportConfig } from '@/lib/types';

/**
 * Factory function to get appropriate transformer for format
 */
export function getTransformer(format: ExportConfig['format']): IExportTransformer {
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

// Re-export for convenience
export type { IExportTransformer } from './types';
export { JSONLTransformer, JSONTransformer, CSVTransformer, MarkdownTransformer };
export * from './types';

