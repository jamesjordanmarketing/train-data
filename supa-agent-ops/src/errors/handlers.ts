/**
 * Error recovery strategies
 */

import { RecoveryStep } from '../core/types';
import { mapDatabaseError } from './codes';

/**
 * Analyzes multiple errors and generates recovery steps
 */
export function generateRecoverySteps(
  errors: Array<{ record: Record<string, any>; error: any }>
): RecoveryStep[] {
  // Group errors by code
  const errorGroups = new Map<string, number>();
  const errorDetails = new Map<string, { code: string; pgCode?: string; description: string; remediation: string; example?: string; automatable: boolean }>();

  for (const { error } of errors) {
    const mapped = mapDatabaseError(error);
    const count = errorGroups.get(mapped.code) || 0;
    errorGroups.set(mapped.code, count + 1);
    
    if (!errorDetails.has(mapped.code)) {
      errorDetails.set(mapped.code, mapped);
    }
  }

  // Convert to recovery steps
  const recoverySteps: RecoveryStep[] = [];

  for (const [code, count] of errorGroups.entries()) {
    const details = errorDetails.get(code)!;
    
    let action = 'REVIEW_ERRORS';
    if (details.automatable) {
      if (code === 'ERR_DB_UNIQUE_VIOLATION') {
        action = 'RETRY_WITH_UPSERT';
      } else if (code.startsWith('ERR_CHAR_')) {
        action = 'ENABLE_SANITIZATION';
      }
    } else {
      if (code === 'ERR_DB_FK_VIOLATION') {
        action = 'IMPORT_DEPENDENCIES_FIRST';
      } else if (code === 'ERR_DB_NOT_NULL_VIOLATION') {
        action = 'FIX_REQUIRED_FIELDS';
      }
    }

    recoverySteps.push({
      priority: count > errors.length * 0.5 ? 'HIGH' : count > 5 ? 'MEDIUM' : 'LOW',
      errorCode: code,
      affectedCount: count,
      action,
      description: details.remediation,
      example: details.example,
      automatable: details.automatable
    });
  }

  // Sort by priority (HIGH -> MEDIUM -> LOW) and affected count
  recoverySteps.sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.affectedCount - a.affectedCount;
  });

  return recoverySteps;
}

/**
 * Determines if errors can be automatically recovered
 */
export function canAutoRecover(errors: Array<{ record: Record<string, any>; error: any }>): boolean {
  return errors.every(({ error }) => {
    const mapped = mapDatabaseError(error);
    return mapped.automatable;
  });
}

/**
 * Suggests next actions based on import result
 */
export function suggestNextActions(
  success: boolean,
  hasWarnings: boolean,
  errors?: Array<{ record: Record<string, any>; error: any }>
): Array<{ action: string; description: string; example?: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }> {
  const actions: Array<{ action: string; description: string; example?: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }> = [];

  if (!success && errors && errors.length > 0) {
    // Add error-specific actions
    const recoverySteps = generateRecoverySteps(errors);
    for (const step of recoverySteps.slice(0, 3)) { // Top 3 recovery steps
      actions.push({
        action: step.action,
        description: step.description,
        example: step.example,
        priority: step.priority
      });
    }
  }

  if (hasWarnings) {
    actions.push({
      action: 'REVIEW_WARNINGS',
      description: 'Review sanitization warnings to ensure data integrity',
      example: 'Check summary report for details on character sanitization',
      priority: 'LOW'
    });
  }

  if (success && !hasWarnings && (!errors || errors.length === 0)) {
    actions.push({
      action: 'VERIFY_DATA',
      description: 'Import completed successfully. Verify data in database.',
      example: 'SELECT * FROM your_table LIMIT 10;',
      priority: 'LOW'
    });
  }

  return actions;
}

