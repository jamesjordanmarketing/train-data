/**
 * JSON Validation Utilities
 * 
 * Provides helpers for validating JSON structures
 * for import/export operations
 */

import { z } from 'zod';

/**
 * Validation result type
 */
export interface ValidationResult<T = any> {
  valid: boolean;
  data?: T;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  value?: any;
}

/**
 * Validate JSON string
 */
export function validateJSON(json: string): ValidationResult<any> {
  try {
    const data = JSON.parse(json);
    return {
      valid: true,
      data,
      errors: [],
    };
  } catch (error: any) {
    return {
      valid: false,
      errors: [
        {
          path: 'root',
          message: `Invalid JSON: ${error.message}`,
        },
      ],
    };
  }
}

/**
 * Validate JSONL string
 */
export function validateJSONL(jsonl: string): ValidationResult<any[]> {
  const lines = jsonl.split('\n').filter(line => line.trim());
  const data: any[] = [];
  const errors: ValidationError[] = [];
  
  lines.forEach((line, index) => {
    try {
      const obj = JSON.parse(line);
      data.push(obj);
    } catch (error: any) {
      errors.push({
        path: `line-${index + 1}`,
        message: `Invalid JSON: ${error.message}`,
        value: line,
      });
    }
  });
  
  return {
    valid: errors.length === 0,
    data,
    errors,
  };
}

/**
 * Validate against Zod schema
 */
export function validateWithSchema<T>(
  data: any,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return {
      valid: true,
      data: validated,
      errors: [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          value: e.code,
        })),
      };
    }
    return {
      valid: false,
      errors: [
        {
          path: 'root',
          message: 'Unknown validation error',
        },
      ],
    };
  }
}

/**
 * Validate array of items against schema
 */
export function validateArray<T>(
  items: any[],
  schema: z.ZodSchema<T>
): {
  valid: T[];
  invalid: Array<{ item: any; errors: ValidationError[] }>;
} {
  const valid: T[] = [];
  const invalid: Array<{ item: any; errors: ValidationError[] }> = [];
  
  items.forEach((item, index) => {
    const result = validateWithSchema(item, schema);
    if (result.valid && result.data) {
      valid.push(result.data);
    } else {
      invalid.push({
        item,
        errors: result.errors.map(e => ({
          ...e,
          path: `[${index}].${e.path}`,
        })),
      });
    }
  });
  
  return { valid, invalid };
}

/**
 * Validate import file format
 */
export function validateImportFormat(
  content: string,
  format: 'json' | 'jsonl'
): ValidationResult<any> {
  if (format === 'json') {
    return validateJSON(content);
  }
  if (format === 'jsonl') {
    return validateJSONL(content);
  }
  return {
    valid: false,
    errors: [
      {
        path: 'root',
        message: 'Unsupported format',
      },
    ],
  };
}

/**
 * Validate export data structure
 */
export function validateExportData(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Check if it's an array or has a data property
  const items = Array.isArray(data) ? data : data.data;
  
  if (!items || !Array.isArray(items)) {
    errors.push({
      path: 'root',
      message: 'Export data must be an array or contain a data array',
    });
  }
  
  if (items && items.length === 0) {
    errors.push({
      path: 'data',
      message: 'Export data is empty',
    });
  }
  
  return {
    valid: errors.length === 0,
    data: items || [],
    errors,
  };
}

/**
 * Sanitize imported data
 */
export function sanitizeImportData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item));
  }
  return sanitizeObject(data);
}

/**
 * Sanitize object for import
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip internal properties
    if (key.startsWith('_')) continue;
    
    // Convert snake_case to camelCase for consistency
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    
    // Recursively sanitize nested objects
    if (Array.isArray(value)) {
      sanitized[camelKey] = value.map(item => sanitizeObject(item));
    } else if (typeof value === 'object' && value !== null) {
      sanitized[camelKey] = sanitizeObject(value);
    } else {
      sanitized[camelKey] = value;
    }
  }
  
  return sanitized;
}

/**
 * Check for duplicate names in array
 */
export function findDuplicates(
  items: any[],
  key: string = 'name'
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  
  for (const item of items) {
    const value = item[key];
    if (value && seen.has(value)) {
      duplicates.add(value);
    } else if (value) {
      seen.add(value);
    }
  }
  
  return Array.from(duplicates);
}

/**
 * Normalize export data for consistency
 */
export function normalizeExportData(
  data: any[],
  metadata?: Record<string, any>
): any {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    count: data.length,
    ...metadata,
    data,
  };
}

