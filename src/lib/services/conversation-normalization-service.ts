/**
 * Conversation Normalization Service
 * 
 * Ensures enriched JSON is byte-valid, properly formatted, and schema-compliant.
 * Handles:
 * - UTF-8 encoding validation
 * - JSON formatting (proper indentation)
 * - Control character removal
 * - Size validation
 * - Basic schema compliance checks
 */

/**
 * Normalization result
 */
export interface NormalizationResult {
  success: boolean;
  normalizedJson: string;     // Normalized JSON string (empty if failed)
  issues: NormalizationIssue[];
  fileSize: number;           // Size in bytes
  error?: string;             // Error message if failed
}

/**
 * Individual normalization issue
 */
export interface NormalizationIssue {
  type: 'encoding' | 'formatting' | 'schema' | 'size';
  severity: 'info' | 'warning' | 'error';
  message: string;
  fixed: boolean;             // Was the issue auto-fixed?
}

export class ConversationNormalizationService {
  /**
   * Normalize enriched JSON
   * 
   * @param enrichedJson - Enriched JSON string
   * @returns Normalization result with normalized JSON or errors
   */
  async normalizeJson(enrichedJson: string): Promise<NormalizationResult> {
    const issues: NormalizationIssue[] = [];
    let normalizedJson = enrichedJson;

    try {
      // STEP 1: Parse to validate JSON syntax
      let parsed: any;
      try {
        parsed = JSON.parse(normalizedJson);
      } catch (error) {
        return {
          success: false,
          normalizedJson: '',
          issues: [{
            type: 'formatting',
            severity: 'error',
            message: `Invalid JSON syntax: ${error instanceof Error ? error.message : 'Unknown'}`,
            fixed: false
          }],
          fileSize: 0,
          error: `Invalid JSON syntax: ${error instanceof Error ? error.message : 'Unknown'}`
        };
      }

      // STEP 2: Re-serialize with proper formatting (2-space indentation)
      normalizedJson = JSON.stringify(parsed, null, 2);

      // STEP 3: Validate encoding (UTF-8, no control characters)
      const hasInvalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(normalizedJson);
      if (hasInvalidChars) {
        issues.push({
          type: 'encoding',
          severity: 'warning',
          message: 'Detected control characters in JSON - removing',
          fixed: true
        });
        // Remove control characters
        normalizedJson = normalizedJson.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      }

      // STEP 4: Validate size
      const fileSize = new Blob([normalizedJson], { type: 'application/json' }).size;

      if (fileSize < 1000) {
        issues.push({
          type: 'size',
          severity: 'warning',
          message: `File size suspiciously small: ${fileSize} bytes`,
          fixed: false
        });
      }

      if (fileSize > 100 * 1024 * 1024) { // 100MB
        issues.push({
          type: 'size',
          severity: 'error',
          message: `File size too large: ${fileSize} bytes (max 100MB)`,
          fixed: false
        });
        return {
          success: false,
          normalizedJson: '',
          issues,
          fileSize,
          error: 'File size exceeds 100MB limit'
        };
      }

      // STEP 5: Basic schema validation
      const schemaIssues = this.validateBasicSchema(parsed);
      issues.push(...schemaIssues);

      const hasErrors = issues.some(i => i.severity === 'error');

      return {
        success: !hasErrors,
        normalizedJson,
        issues,
        fileSize,
        ...(hasErrors && { error: 'Normalization found errors' })
      };

    } catch (error) {
      return {
        success: false,
        normalizedJson: '',
        issues: [{
          type: 'formatting',
          severity: 'error',
          message: `Normalization failed: ${error instanceof Error ? error.message : 'Unknown'}`,
          fixed: false
        }],
        fileSize: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate basic schema structure (enriched JSON)
   */
  private validateBasicSchema(parsed: any): NormalizationIssue[] {
    const issues: NormalizationIssue[] = [];

    // Check top-level keys for enriched format
    if (!parsed.dataset_metadata) {
      issues.push({
        type: 'schema',
        severity: 'error',
        message: 'Missing dataset_metadata (required for enriched format)',
        fixed: false
      });
    }

    if (!parsed.consultant_profile) {
      issues.push({
        type: 'schema',
        severity: 'warning',
        message: 'Missing consultant_profile',
        fixed: false
      });
    }

    if (!parsed.training_pairs || !Array.isArray(parsed.training_pairs)) {
      issues.push({
        type: 'schema',
        severity: 'error',
        message: 'Missing or invalid training_pairs array',
        fixed: false
      });
    } else if (parsed.training_pairs.length === 0) {
      issues.push({
        type: 'schema',
        severity: 'warning',
        message: 'training_pairs array is empty',
        fixed: false
      });
    }

    return issues;
  }
}

// Export factory function
export function createNormalizationService(): ConversationNormalizationService {
  return new ConversationNormalizationService();
}

// Export singleton
let normalizationServiceInstance: ConversationNormalizationService | null = null;

export function getNormalizationService(): ConversationNormalizationService {
  if (!normalizationServiceInstance) {
    normalizationServiceInstance = new ConversationNormalizationService();
  }
  return normalizationServiceInstance;
}

