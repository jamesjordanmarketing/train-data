/**
 * Conversation Validation Service
 * 
 * Validates minimal JSON structure before enrichment pipeline.
 * Distinguishes between blocking errors (prevent enrichment) and warnings (log but continue).
 * 
 * Validation Rules:
 * BLOCKING:
 * - Invalid JSON syntax
 * - Missing required top-level keys (conversation_metadata, turns)
 * - Missing required metadata fields
 * - Empty or invalid turns array
 * - Missing required turn fields
 * - Invalid role values
 * - Missing emotional context
 * 
 * WARNING:
 * - Turn numbering anomalies
 * - Non-alternating roles
 * - Short content (<10 chars)
 * - Extreme intensity values (0.0 or 1.0)
 * - Missing optional fields
 */

import type { ValidationResult, ValidationIssue } from '../types/conversations';

/**
 * Minimal conversation JSON structure (from Claude)
 */
interface MinimalConversation {
  conversation_metadata: {
    client_persona: string;
    session_context: string;
    conversation_phase: string;
    expected_outcome?: string;
  };
  turns: MinimalTurn[];
}

interface MinimalTurn {
  turn_number: number;
  role: 'user' | 'assistant';
  content: string;
  emotional_context: {
    primary_emotion: string;
    secondary_emotion?: string;
    intensity: number;
  };
}

export class ConversationValidationService {
  /**
   * Validate minimal JSON structure
   * 
   * @param rawJson - Raw JSON string from Claude (stored at raw_response_path)
   * @param conversationId - Conversation ID for tracking
   * @returns ValidationResult with blockers and warnings
   */
  async validateMinimalJson(
    rawJson: string,
    conversationId: string
  ): Promise<ValidationResult> {
    const blockers: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    
    let parsed: any;
    
    // STEP 1: JSON Syntax Validation (BLOCKING)
    try {
      parsed = JSON.parse(rawJson);
    } catch (error) {
      blockers.push({
        code: 'INVALID_JSON_SYNTAX',
        severity: 'blocker',
        field: 'root',
        message: `JSON syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'Ensure JSON is well-formed with proper quotes, commas, and brackets'
      });
      
      return this.buildResult(conversationId, blockers, warnings);
    }
    
    // STEP 2: Top-Level Structure Validation (BLOCKING)
    if (!parsed.conversation_metadata) {
      blockers.push({
        code: 'MISSING_CONVERSATION_METADATA',
        severity: 'blocker',
        field: 'conversation_metadata',
        message: 'Missing required top-level key: conversation_metadata',
        suggestion: 'Add conversation_metadata object with required fields'
      });
    }
    
    if (!parsed.turns || !Array.isArray(parsed.turns)) {
      blockers.push({
        code: 'MISSING_TURNS_ARRAY',
        severity: 'blocker',
        field: 'turns',
        message: 'Missing or invalid turns array',
        suggestion: 'Add turns array with at least 2 turn objects'
      });
    } else if (parsed.turns.length < 2) {
      blockers.push({
        code: 'INSUFFICIENT_TURNS',
        severity: 'blocker',
        field: 'turns',
        message: `Turns array has ${parsed.turns.length} turn(s), minimum 2 required`,
        suggestion: 'Ensure conversation has at least one user and one assistant turn'
      });
    }
    
    // STEP 3: Conversation Metadata Validation (BLOCKING for required fields)
    if (parsed.conversation_metadata) {
      const metadata = parsed.conversation_metadata;
      
      if (!metadata.client_persona || typeof metadata.client_persona !== 'string' || metadata.client_persona.trim() === '') {
        blockers.push({
          code: 'MISSING_CLIENT_PERSONA',
          severity: 'blocker',
          field: 'conversation_metadata.client_persona',
          message: 'client_persona is required and must be non-empty string',
          suggestion: 'Provide client persona name and archetype'
        });
      }
      
      if (!metadata.session_context || typeof metadata.session_context !== 'string' || metadata.session_context.trim() === '') {
        blockers.push({
          code: 'MISSING_SESSION_CONTEXT',
          severity: 'blocker',
          field: 'conversation_metadata.session_context',
          message: 'session_context is required and must be non-empty string',
          suggestion: 'Provide context about when/why this conversation is happening'
        });
      }
      
      if (!metadata.conversation_phase || typeof metadata.conversation_phase !== 'string' || metadata.conversation_phase.trim() === '') {
        blockers.push({
          code: 'MISSING_CONVERSATION_PHASE',
          severity: 'blocker',
          field: 'conversation_metadata.conversation_phase',
          message: 'conversation_phase is required and must be non-empty string',
          suggestion: 'Specify conversation phase (e.g., initial_disclosure, strategy_planning)'
        });
      }
      
      // expected_outcome is OPTIONAL but recommended
      if (!metadata.expected_outcome || typeof metadata.expected_outcome !== 'string' || metadata.expected_outcome.trim() === '') {
        warnings.push({
          code: 'MISSING_EXPECTED_OUTCOME',
          severity: 'warning',
          field: 'conversation_metadata.expected_outcome',
          message: 'expected_outcome is recommended but missing',
          suggestion: 'Add expected_outcome for better training data quality'
        });
      }
    }
    
    // STEP 4: Turns Array Validation (BLOCKING for structure, WARNING for anomalies)
    if (parsed.turns && Array.isArray(parsed.turns) && parsed.turns.length >= 2) {
      const turns = parsed.turns;
      let previousRole: string | null = null;
      
      for (let i = 0; i < turns.length; i++) {
        const turn = turns[i];
        const turnNum = i + 1;
        
        // Validate turn_number exists and is numeric
        if (typeof turn.turn_number !== 'number') {
          blockers.push({
            code: 'INVALID_TURN_NUMBER',
            severity: 'blocker',
            field: `turns[${i}].turn_number`,
            message: `Turn ${i} has invalid or missing turn_number`,
            suggestion: 'Ensure turn_number is a number'
          });
        } else {
          // Check turn_number sequence (WARNING, not blocking)
          if (turn.turn_number !== turnNum) {
            warnings.push({
              code: 'TURN_NUMBER_MISMATCH',
              severity: 'warning',
              field: `turns[${i}].turn_number`,
              message: `Turn ${i} has turn_number ${turn.turn_number}, expected ${turnNum}`,
              suggestion: 'Turn numbers should be sequential starting from 1'
            });
          }
        }
        
        // Validate role (BLOCKING)
        if (!turn.role || (turn.role !== 'user' && turn.role !== 'assistant')) {
          blockers.push({
            code: 'INVALID_ROLE',
            severity: 'blocker',
            field: `turns[${i}].role`,
            message: `Turn ${turnNum} has invalid or missing role: "${turn.role}"`,
            suggestion: 'Role must be "user" or "assistant"'
          });
        } else {
          // Check role alternation (WARNING, not blocking - could be intentional)
          if (previousRole && previousRole === turn.role) {
            warnings.push({
              code: 'ROLE_NOT_ALTERNATING',
              severity: 'warning',
              field: `turns[${i}].role`,
              message: `Turn ${turnNum} has same role as previous turn (${turn.role})`,
              suggestion: 'Turns typically alternate between user and assistant'
            });
          }
          previousRole = turn.role;
        }
        
        // Validate content (BLOCKING)
        if (!turn.content || typeof turn.content !== 'string' || turn.content.trim() === '') {
          blockers.push({
            code: 'MISSING_CONTENT',
            severity: 'blocker',
            field: `turns[${i}].content`,
            message: `Turn ${turnNum} has missing or empty content`,
            suggestion: 'Each turn must have non-empty content string'
          });
        } else {
          // Check content length (WARNING)
          if (turn.content.trim().length < 10) {
            warnings.push({
              code: 'SHORT_CONTENT',
              severity: 'warning',
              field: `turns[${i}].content`,
              message: `Turn ${turnNum} has very short content (${turn.content.trim().length} characters)`,
              suggestion: 'Consider whether content is complete'
            });
          }
        }
        
        // Validate emotional_context (BLOCKING for required fields)
        if (!turn.emotional_context || typeof turn.emotional_context !== 'object') {
          blockers.push({
            code: 'MISSING_EMOTIONAL_CONTEXT',
            severity: 'blocker',
            field: `turns[${i}].emotional_context`,
            message: `Turn ${turnNum} is missing emotional_context object`,
            suggestion: 'Add emotional_context with primary_emotion and intensity'
          });
        } else {
          const ec = turn.emotional_context;
          
          // Validate primary_emotion (BLOCKING)
          if (!ec.primary_emotion || typeof ec.primary_emotion !== 'string' || ec.primary_emotion.trim() === '') {
            blockers.push({
              code: 'MISSING_PRIMARY_EMOTION',
              severity: 'blocker',
              field: `turns[${i}].emotional_context.primary_emotion`,
              message: `Turn ${turnNum} is missing primary_emotion`,
              suggestion: 'Add primary_emotion string (e.g., "anxiety", "hope")'
            });
          }
          
          // Validate intensity (BLOCKING)
          if (typeof ec.intensity !== 'number') {
            blockers.push({
              code: 'MISSING_INTENSITY',
              severity: 'blocker',
              field: `turns[${i}].emotional_context.intensity`,
              message: `Turn ${turnNum} is missing or has invalid intensity`,
              suggestion: 'Add intensity as number between 0 and 1'
            });
          } else {
            // Check intensity range (BLOCKING)
            if (ec.intensity < 0 || ec.intensity > 1) {
              blockers.push({
                code: 'INTENSITY_OUT_OF_RANGE',
                severity: 'blocker',
                field: `turns[${i}].emotional_context.intensity`,
                message: `Turn ${turnNum} has intensity ${ec.intensity}, must be between 0 and 1`,
                suggestion: 'Set intensity to value between 0.0 and 1.0'
              });
            }
            
            // Check extreme intensity values (WARNING)
            if (ec.intensity === 0 || ec.intensity === 1) {
              warnings.push({
                code: 'EXTREME_INTENSITY',
                severity: 'warning',
                field: `turns[${i}].emotional_context.intensity`,
                message: `Turn ${turnNum} has extreme intensity value (${ec.intensity})`,
                suggestion: 'Consider if 0.0 or 1.0 is truly accurate'
              });
            }
          }
          
          // Check for secondary_emotion (WARNING if missing)
          if (!ec.secondary_emotion) {
            warnings.push({
              code: 'MISSING_SECONDARY_EMOTION',
              severity: 'warning',
              field: `turns[${i}].emotional_context.secondary_emotion`,
              message: `Turn ${turnNum} is missing secondary_emotion`,
              suggestion: 'Consider adding secondary_emotion for richer emotional context'
            });
          }
        }
      }
    }
    
    return this.buildResult(conversationId, blockers, warnings);
  }
  
  /**
   * Build final validation result
   */
  private buildResult(
    conversationId: string,
    blockers: ValidationIssue[],
    warnings: ValidationIssue[]
  ): ValidationResult {
    const hasBlockers = blockers.length > 0;
    const hasWarnings = warnings.length > 0;
    const isValid = !hasBlockers;
    
    let summary: string;
    if (!isValid) {
      summary = `Validation failed: ${blockers.length} blocking error(s)`;
    } else if (hasWarnings) {
      summary = `Validation passed with ${warnings.length} warning(s)`;
    } else {
      summary = 'Validation passed: No issues detected';
    }
    
    return {
      isValid,
      hasBlockers,
      hasWarnings,
      blockers,
      warnings,
      conversationId,
      validatedAt: new Date().toISOString(),
      summary
    };
  }
}

// Export factory function for convenience
export function createValidationService(): ConversationValidationService {
  return new ConversationValidationService();
}

// Export singleton instance
let validationServiceInstance: ConversationValidationService | null = null;

export function getValidationService(): ConversationValidationService {
  if (!validationServiceInstance) {
    validationServiceInstance = new ConversationValidationService();
  }
  return validationServiceInstance;
}

