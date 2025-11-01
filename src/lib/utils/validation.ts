/**
 * Validation Utilities
 * Common validation functions for API routes
 */

/**
 * Validates UUID v4 format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validates positive integer
 */
export function isPositiveInteger(value: any): boolean {
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

/**
 * Sanitizes search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query.trim().replace(/[<>]/g, '');
}

/**
 * Parses numeric query parameter
 */
export function parseNumericParam(value: string | null, defaultValue?: number): number | undefined {
  if (value === null) return defaultValue;
  const parsed = parseFloat(value);
  return !isNaN(parsed) ? parsed : defaultValue;
}

/**
 * Parses integer query parameter
 */
export function parseIntParam(value: string | null, defaultValue?: number): number | undefined {
  if (value === null) return defaultValue;
  const parsed = parseInt(value, 10);
  return !isNaN(parsed) ? parsed : defaultValue;
}

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(page?: number, limit?: number): {
  page: number;
  limit: number;
  offset: number;
} {
  const validPage = page && page > 0 ? page : 1;
  const validLimit = limit && limit > 0 && limit <= 100 ? limit : 25;
  const offset = (validPage - 1) * validLimit;

  return {
    page: validPage,
    limit: validLimit,
    offset,
  };
}

/**
 * Validates sort order
 */
export function validateSortOrder(order?: string | null): 'asc' | 'desc' {
  return order?.toLowerCase() === 'asc' ? 'asc' : 'desc';
}

