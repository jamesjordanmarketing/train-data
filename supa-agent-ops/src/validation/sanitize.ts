/**
 * Character sanitization and validation
 */

import { CharacterValidationConfig, ValidationResult } from '../core/types';
import { DEFAULT_CHARACTER_VALIDATION_CONFIG } from '../core/config';

/**
 * Validates and sanitizes a string value according to configuration
 */
export function validateAndSanitize(
  value: string,
  config: CharacterValidationConfig = DEFAULT_CHARACTER_VALIDATION_CONFIG
): ValidationResult {
  const warnings: string[] = [];
  let sanitized = value;

  // Unicode normalization
  if (config.normalizeUnicode !== 'none') {
    const original = sanitized;
    sanitized = sanitized.normalize(config.normalizeUnicode);
    if (sanitized !== original) {
      warnings.push(`Applied ${config.normalizeUnicode} Unicode normalization`);
    }
  }

  // Strip invalid UTF-8 (replacement character)
  if (config.stripInvalidUtf8) {
    const original = sanitized;
    sanitized = sanitized.replace(/\uFFFD/g, '');
    if (sanitized !== original) {
      warnings.push('Removed invalid UTF-8 characters (replacement character)');
    }
  }

  // Control character handling
  if (!config.allowControlChars) {
    const original = sanitized;
    // Match control characters (0x00-0x1F) but preserve \t, \n, \r
    sanitized = sanitized.replace(/[\u0000-\u001F]/g, (match) => {
      if (match === '\t' || match === '\n' || match === '\r') {
        return match;
      }
      warnings.push(`Removed control character: 0x${match.charCodeAt(0).toString(16)}`);
      return '';
    });
    if (sanitized !== original) {
      // warnings already added above
    }
  }

  // Length check
  if (sanitized.length > config.maxFieldLength) {
    warnings.push(`Truncated field from ${sanitized.length} to ${config.maxFieldLength} chars`);
    sanitized = sanitized.substring(0, config.maxFieldLength);
  }

  // Check for disallowed characters (informational only, not removed)
  if (!config.allowApostrophes && sanitized.includes("'")) {
    warnings.push("Field contains apostrophes (not allowed by config, but preserved)");
  }
  if (!config.allowQuotes && (sanitized.includes('"') || sanitized.includes("'"))) {
    warnings.push("Field contains quotes (not allowed by config, but preserved)");
  }
  if (!config.allowBackslashes && sanitized.includes('\\')) {
    warnings.push("Field contains backslashes (not allowed by config, but preserved)");
  }

  return {
    valid: warnings.length === 0,
    sanitized,
    warnings
  };
}

/**
 * Sanitizes an entire record object
 */
export function sanitizeRecord(
  record: Record<string, any>,
  config: CharacterValidationConfig = DEFAULT_CHARACTER_VALIDATION_CONFIG
): { sanitized: Record<string, any>; warnings: string[] } {
  const sanitized: Record<string, any> = {};
  const allWarnings: string[] = [];

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string') {
      const result = validateAndSanitize(value, config);
      sanitized[key] = result.sanitized;
      if (result.warnings.length > 0) {
        allWarnings.push(`Field "${key}": ${result.warnings.join(', ')}`);
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item => {
          if (typeof item === 'string') {
            const result = validateAndSanitize(item, config);
            if (result.warnings.length > 0) {
              allWarnings.push(`Field "${key}[]": ${result.warnings.join(', ')}`);
            }
            return result.sanitized;
          }
          return item;
        });
      } else {
        const nestedResult = sanitizeRecord(value, config);
        sanitized[key] = nestedResult.sanitized;
        allWarnings.push(...nestedResult.warnings.map(w => `${key}.${w}`));
      }
    } else {
      sanitized[key] = value;
    }
  }

  return {
    sanitized,
    warnings: allWarnings
  };
}

/**
 * Checks if a string contains potentially problematic characters
 */
export function detectProblematicCharacters(value: string): {
  hasApostrophes: boolean;
  hasQuotes: boolean;
  hasBackslashes: boolean;
  hasNewlines: boolean;
  hasControlChars: boolean;
  hasEmoji: boolean;
} {
  return {
    hasApostrophes: value.includes("'"),
    hasQuotes: value.includes('"'),
    hasBackslashes: value.includes('\\'),
    hasNewlines: value.includes('\n') || value.includes('\r'),
    hasControlChars: /[\u0000-\u001F]/.test(value),
    hasEmoji: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(value)
  };
}

