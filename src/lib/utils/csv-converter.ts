/**
 * CSV Conversion Utilities
 * 
 * Provides helpers for converting objects to CSV format
 * and CSV to objects
 */

export interface CSVOptions {
  delimiter?: string;
  quote?: string;
  escape?: string;
  headers?: string[];
}

/**
 * Convert array of objects to CSV string
 */
export function objectsToCSV(
  objects: Record<string, any>[],
  options: CSVOptions = {}
): string {
  if (objects.length === 0) return '';
  
  const {
    delimiter = ',',
    quote = '"',
    escape = '"',
    headers = Object.keys(objects[0]),
  } = options;
  
  // Create header row
  const headerRow = headers
    .map(h => escapeCSVValue(h, delimiter, quote, escape))
    .join(delimiter);
  
  // Create data rows
  const dataRows = objects.map(obj =>
    headers
      .map(header => {
        const value = obj[header];
        return escapeCSVValue(
          formatValue(value),
          delimiter,
          quote,
          escape
        );
      })
      .join(delimiter)
  );
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Convert CSV string to array of objects
 */
export function csvToObjects(
  csv: string,
  options: CSVOptions = {}
): Record<string, any>[] {
  const {
    delimiter = ',',
    quote = '"',
  } = options;
  
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Parse header
  const headers = parseCSVLine(lines[0], delimiter, quote);
  
  // Parse data rows
  const objects = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter, quote);
    const obj: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      obj[header] = parseValue(values[index] || '');
    });
    
    objects.push(obj);
  }
  
  return objects;
}

/**
 * Escape a value for CSV
 */
function escapeCSVValue(
  value: string,
  delimiter: string,
  quote: string,
  escape: string
): string {
  // Check if value needs quoting
  const needsQuotes =
    value.includes(delimiter) ||
    value.includes(quote) ||
    value.includes('\n') ||
    value.includes('\r');
  
  if (!needsQuotes) return value;
  
  // Escape quotes in value
  const escaped = value.replace(new RegExp(quote, 'g'), escape + quote);
  
  return `${quote}${escaped}${quote}`;
}

/**
 * Parse a CSV line into values
 */
function parseCSVLine(
  line: string,
  delimiter: string,
  quote: string
): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === quote) {
      if (inQuotes && nextChar === quote) {
        // Escaped quote
        current += quote;
        i += 2;
        continue;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }
    
    if (char === delimiter && !inQuotes) {
      // End of value
      values.push(current);
      current = '';
      i++;
      continue;
    }
    
    current += char;
    i++;
  }
  
  // Add last value
  values.push(current);
  
  return values;
}

/**
 * Format a value for CSV
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.join(',');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Parse a value from CSV string
 */
function parseValue(value: string): any {
  // Empty
  if (value === '') return null;
  
  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Number
  if (!isNaN(Number(value)) && value.trim() !== '') {
    return Number(value);
  }
  
  // JSON
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  
  // String
  return value;
}

/**
 * Convert templates to CSV format
 */
export function templatesToCSV(templates: any[]): string {
  return objectsToCSV(templates, {
    headers: [
      'id',
      'name',
      'description',
      'category',
      'structure',
      'tone',
      'complexity_baseline',
      'quality_threshold',
      'usage_count',
      'rating',
    ],
  });
}

/**
 * Convert scenarios to CSV format
 */
export function scenariosToCSV(scenarios: any[]): string {
  return objectsToCSV(scenarios, {
    headers: [
      'id',
      'name',
      'description',
      'template_id',
      'context',
      'expected_turns',
      'difficulty',
      'tags',
      'usage_count',
    ],
  });
}

/**
 * Convert edge cases to CSV format
 */
export function edgeCasesToCSV(edgeCases: any[]): string {
  return objectsToCSV(edgeCases, {
    headers: [
      'id',
      'name',
      'description',
      'scenario_id',
      'trigger_condition',
      'expected_behavior',
      'severity',
      'resolution_strategy',
      'test_coverage',
    ],
  });
}

