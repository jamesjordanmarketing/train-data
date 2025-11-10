/**
 * Data normalization utilities
 */

/**
 * Normalizes a record by trimming whitespace and handling null/undefined
 */
export function normalizeRecord(record: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};

  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) {
      // Skip undefined values
      continue;
    }

    if (value === null) {
      normalized[key] = null;
    } else if (typeof value === 'string') {
      // Keep string as-is (don't trim, as whitespace might be intentional)
      normalized[key] = value;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively normalize nested objects
      normalized[key] = normalizeRecord(value);
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}

/**
 * Ensures a record has required fields
 */
export function validateRequiredFields(
  record: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!(field in record) || record[field] === null || record[field] === undefined) {
      missingFields.push(field);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Converts string values to appropriate types based on schema hints
 */
export function coerceTypes(
  record: Record<string, any>,
  schema?: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>
): Record<string, any> {
  if (!schema) return record;

  const coerced: Record<string, any> = { ...record };

  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in coerced)) continue;

    const value = coerced[key];

    switch (expectedType) {
      case 'number':
        if (typeof value === 'string') {
          const num = Number(value);
          if (!isNaN(num)) {
            coerced[key] = num;
          }
        }
        break;
      case 'boolean':
        if (typeof value === 'string') {
          if (value.toLowerCase() === 'true') {
            coerced[key] = true;
          } else if (value.toLowerCase() === 'false') {
            coerced[key] = false;
          }
        }
        break;
      case 'object':
        if (typeof value === 'string') {
          try {
            coerced[key] = JSON.parse(value);
          } catch {
            // Keep original value if parsing fails
          }
        }
        break;
    }
  }

  return coerced;
}

