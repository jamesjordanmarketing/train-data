/**
 * Schema validation utilities (basic implementation)
 * For more advanced validation, users can provide their own zod/jsonschema validators
 */

/**
 * Basic schema validation interface
 */
export interface SchemaValidator {
  validate(data: any): { valid: boolean; errors: string[] };
}

/**
 * Creates a simple validator from a JSON schema-like object
 */
export function createValidator(schema: Record<string, any>): SchemaValidator {
  return {
    validate(data: any): { valid: boolean; errors: string[] } {
      const errors: string[] = [];

      // Check required fields
      if (schema.required && Array.isArray(schema.required)) {
        for (const field of schema.required) {
          if (!(field in data) || data[field] === null || data[field] === undefined) {
            errors.push(`Missing required field: ${field}`);
          }
        }
      }

      // Check properties types
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties as Record<string, any>)) {
          if (!(key in data)) continue;

          const value = data[key];
          const expectedType = propSchema.type;

          if (expectedType && !checkType(value, expectedType)) {
            errors.push(`Field "${key}" expected type ${expectedType}, got ${typeof value}`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    }
  };
}

/**
 * Type checking helper
 */
function checkType(value: any, expectedType: string): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'null':
      return value === null;
    default:
      return true;
  }
}

/**
 * Validates an array of records against a schema
 */
export function validateRecords(
  records: Record<string, any>[],
  validator: SchemaValidator
): { valid: boolean; errors: Array<{ index: number; errors: string[] }> } {
  const allErrors: Array<{ index: number; errors: string[] }> = [];

  records.forEach((record, index) => {
    const result = validator.validate(record);
    if (!result.valid) {
      allErrors.push({
        index,
        errors: result.errors
      });
    }
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
}

