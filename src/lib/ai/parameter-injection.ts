/**
 * Parameter Injection Engine
 * 
 * Resolves template placeholders ({{variableName}}) with actual values.
 * Supports:
 * - Simple placeholders: {{name}}
 * - Dot notation: {{user.name}}
 * - Ternary conditionals: {{condition ? 'yes' : 'no'}}
 * 
 * SECURITY: All values are escaped and validated before injection.
 */

import { Template, TemplateVariable } from '../../lib/types';
import { escapeHtml, isSafeTemplateString, logSecurityEvent } from './security-utils';
import {
  validateAllParameters,
  applyDefaultValues,
  preGenerationValidation,
  ValidationReport,
  formatValidationErrors,
} from './parameter-validation';

/**
 * Result of parameter injection
 */
export interface ResolvedTemplate {
  /** Original template string */
  original: string;
  
  /** Fully resolved template with parameters injected */
  resolved: string;
  
  /** Parameters that were used */
  parameters: Record<string, any>;
  
  /** Required parameters that were missing */
  missingRequired: string[];
  
  /** Validation errors encountered */
  errors: ParameterError[];
  
  /** Whether resolution was successful */
  success: boolean;
  
  /** Warnings (non-fatal issues) */
  warnings: string[];
}

/**
 * Parameter error details
 */
export interface ParameterError {
  parameterName: string;
  error: string;
  expectedType: string;
  actualValue: any;
}

/**
 * Options for parameter injection
 */
export interface InjectionOptions {
  /** Whether to escape HTML in parameter values (default: true) */
  escapeHtml?: boolean;
  
  /** Whether to throw on missing required parameters (default: false) */
  throwOnMissing?: boolean;
  
  /** Whether to log security events (default: true) */
  auditLog?: boolean;
  
  /** User ID for audit logging */
  userId?: string;
  
  /** Template ID for audit logging */
  templateId?: string;
}

/**
 * Extracts all placeholder names from a template string
 * 
 * @param template - Template string with {{placeholders}}
 * @returns Array of unique placeholder names
 */
export function extractPlaceholders(template: string): string[] {
  const placeholders = new Set<string>();
  const regex = /\{\{([^}]+)\}\}/g;
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    const expression = match[1].trim();
    
    // For simple variables, add directly
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression)) {
      placeholders.add(expression);
    }
    // For dot notation, add the root variable
    else if (/^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression)) {
      const rootVar = expression.split('.')[0];
      placeholders.add(rootVar);
    }
    // For ternary, extract the condition variable
    else if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*\?/.test(expression)) {
      const conditionVar = expression.split('?')[0].trim();
      placeholders.add(conditionVar);
    }
  }
  
  return Array.from(placeholders);
}

/**
 * Resolves a simple placeholder like {{name}}
 * 
 * @param variableName - Name of the variable
 * @param parameters - Parameter values
 * @param escapeOutput - Whether to escape HTML
 * @returns Resolved value or placeholder if not found
 */
function resolveSimplePlaceholder(
  variableName: string,
  parameters: Record<string, any>,
  escapeOutput: boolean
): string {
  const value = parameters[variableName];
  
  if (value === undefined || value === null) {
    // Return original placeholder to make it obvious something is missing
    return `{{${variableName}}}`;
  }
  
  const stringValue = String(value);
  return escapeOutput ? escapeHtml(stringValue) : stringValue;
}

/**
 * Resolves dot notation like {{user.name}}
 * 
 * @param expression - Dot notation expression
 * @param parameters - Parameter values
 * @param escapeOutput - Whether to escape HTML
 * @returns Resolved value or placeholder if not found
 */
function resolveDotNotation(
  expression: string,
  parameters: Record<string, any>,
  escapeOutput: boolean
): string {
  const parts = expression.split('.');
  let value: any = parameters;
  
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      return `{{${expression}}}`;
    }
  }
  
  if (value === undefined || value === null) {
    return `{{${expression}}}`;
  }
  
  const stringValue = String(value);
  return escapeOutput ? escapeHtml(stringValue) : stringValue;
}

/**
 * Evaluates a ternary conditional like {{condition ? 'yes' : 'no'}}
 * 
 * SECURITY: Only simple ternaries with string literals allowed.
 * No nested expressions or function calls.
 * 
 * @param expression - Ternary expression
 * @param parameters - Parameter values
 * @param escapeOutput - Whether to escape HTML
 * @returns Resolved value or placeholder if invalid
 */
function evaluateTernary(
  expression: string,
  parameters: Record<string, any>,
  escapeOutput: boolean
): string {
  // Parse: condition ? 'trueValue' : 'falseValue'
  const ternaryRegex = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\?\s*'([^']*)'\s*:\s*'([^']*)'$/;
  const match = expression.match(ternaryRegex);
  
  if (!match) {
    // Invalid ternary syntax
    return `{{${expression}}}`;
  }
  
  const [, condition, trueValue, falseValue] = match;
  const conditionValue = parameters[condition];
  
  // Evaluate condition as truthy/falsy
  const result = conditionValue ? trueValue : falseValue;
  
  return escapeOutput ? escapeHtml(result) : result;
}

/**
 * Resolves a single placeholder expression
 * 
 * @param expression - The expression inside {{ }}
 * @param parameters - Parameter values
 * @param escapeOutput - Whether to escape HTML
 * @returns Resolved value
 */
function resolvePlaceholder(
  expression: string,
  parameters: Record<string, any>,
  escapeOutput: boolean
): string {
  expression = expression.trim();
  
  // Simple variable: {{name}}
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression)) {
    return resolveSimplePlaceholder(expression, parameters, escapeOutput);
  }
  
  // Dot notation: {{user.name}}
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression)) {
    return resolveDotNotation(expression, parameters, escapeOutput);
  }
  
  // Ternary conditional: {{condition ? 'yes' : 'no'}}
  if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*\?/.test(expression)) {
    return evaluateTernary(expression, parameters, escapeOutput);
  }
  
  // Unknown expression format - return as-is
  return `{{${expression}}}`;
}

/**
 * Main function: Injects parameters into template
 * 
 * @param template - Template string with placeholders
 * @param variables - Template variable definitions
 * @param parameterValues - Actual parameter values
 * @param options - Injection options
 * @returns Resolved template result
 */
export function injectParameters(
  template: string,
  variables: TemplateVariable[],
  parameterValues: Record<string, any>,
  options: InjectionOptions = {}
): ResolvedTemplate {
  const {
    escapeHtml: shouldEscape = true,
    throwOnMissing = false,
    auditLog = true,
    userId,
    templateId,
  } = options;
  
  const result: ResolvedTemplate = {
    original: template,
    resolved: template,
    parameters: { ...parameterValues },
    missingRequired: [],
    errors: [],
    success: false,
    warnings: [],
  };
  
  const securityViolations: string[] = [];
  
  try {
    // 1. Security: Validate template structure
    if (!isSafeTemplateString(template)) {
      const error = 'Template contains unsafe expressions or code injection attempts';
      securityViolations.push(error);
      result.errors.push({
        parameterName: '_template',
        error,
        expectedType: 'safe_template',
        actualValue: template,
      });
      
      if (auditLog) {
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          action: 'template_validation',
          userId,
          templateId,
          securityViolations,
          success: false,
        });
      }
      
      return result;
    }
    
    // 2. Apply default values for optional parameters
    const parametersWithDefaults = applyDefaultValues(variables, parameterValues);
    result.parameters = parametersWithDefaults;
    
    // 3. Validate all parameters
    const validation = preGenerationValidation(variables, parametersWithDefaults);
    
    if (!validation.valid) {
      result.missingRequired = validation.missingRequired;
      result.errors = validation.errors.map(e => ({
        parameterName: e.parameterName,
        error: e.error || 'Validation failed',
        expectedType: e.expectedType,
        actualValue: e.actualValue,
      }));
      result.warnings = validation.warnings;
      
      if (throwOnMissing) {
        const errorMessages = formatValidationErrors(validation);
        throw new Error(`Parameter validation failed:\n${errorMessages.join('\n')}`);
      }
      
      // Log validation failure
      if (auditLog) {
        logSecurityEvent({
          timestamp: new Date().toISOString(),
          action: 'parameter_injection',
          userId,
          templateId,
          parameters: parametersWithDefaults,
          securityViolations: result.errors.map(e => e.error),
          success: false,
        });
      }
      
      return result;
    }
    
    // 4. Resolve all placeholders
    result.resolved = template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      return resolvePlaceholder(expression, parametersWithDefaults, shouldEscape);
    });
    
    // 5. Check if any placeholders remain unresolved
    const unresolvedPlaceholders = result.resolved.match(/\{\{([^}]+)\}\}/g);
    if (unresolvedPlaceholders) {
      result.warnings.push(
        `Unresolved placeholders: ${unresolvedPlaceholders.join(', ')}`
      );
    }
    
    // 6. Success!
    result.success = true;
    
    // Log successful injection
    if (auditLog) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        action: 'parameter_injection',
        userId,
        templateId,
        parameters: parametersWithDefaults,
        success: true,
      });
    }
    
  } catch (error) {
    result.errors.push({
      parameterName: '_system',
      error: error instanceof Error ? error.message : String(error),
      expectedType: 'unknown',
      actualValue: null,
    });
    
    if (auditLog) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        action: 'parameter_injection',
        userId,
        templateId,
        parameters: parameterValues,
        securityViolations: [error instanceof Error ? error.message : String(error)],
        success: false,
      });
    }
  }
  
  return result;
}

/**
 * Generates a preview of the resolved template
 * 
 * This is a convenience function for UI preview purposes.
 * 
 * @param template - Template to preview
 * @param variables - Variable definitions
 * @param parameterValues - Current parameter values
 * @returns Preview text and validation status
 */
export function generatePreview(
  template: Template,
  parameterValues: Record<string, any>
): { preview: string; valid: boolean; errors: string[] } {
  const result = injectParameters(
    template.structure,
    template.variables,
    parameterValues,
    {
      escapeHtml: true,
      throwOnMissing: false,
      auditLog: false, // Don't log preview generations
    }
  );
  
  return {
    preview: result.resolved,
    valid: result.success,
    errors: formatValidationErrors({
      valid: result.success,
      errors: result.errors.map(e => ({
        parameterName: e.parameterName,
        valid: false,
        error: e.error,
        expectedType: e.expectedType,
        actualValue: e.actualValue,
      })),
      missingRequired: result.missingRequired,
      warnings: result.warnings,
    }),
  };
}

/**
 * Validates that template can be resolved without actually resolving it
 * 
 * Useful for pre-flight checks before batch generation.
 * 
 * @param template - Template to validate
 * @param parameterValues - Parameter values to validate
 * @returns Validation status and errors
 */
export function validateTemplateResolution(
  template: Template,
  parameterValues: Record<string, any>
): { valid: boolean; errors: string[]; warnings: string[] } {
  // Security check on template structure
  if (!isSafeTemplateString(template.structure)) {
    return {
      valid: false,
      errors: ['Template contains unsafe expressions'],
      warnings: [],
    };
  }
  
  // Validate parameters
  const validation = preGenerationValidation(template.variables, parameterValues);
  
  return {
    valid: validation.valid,
    errors: formatValidationErrors(validation),
    warnings: validation.warnings,
  };
}

/**
 * Batch resolves multiple templates with different parameter sets
 * 
 * @param template - Template to resolve
 * @param parameterSets - Array of parameter value sets
 * @param options - Injection options (applied to all)
 * @returns Array of resolved templates
 */
export function batchInjectParameters(
  template: Template,
  parameterSets: Record<string, any>[],
  options: InjectionOptions = {}
): ResolvedTemplate[] {
  return parameterSets.map(params =>
    injectParameters(template.structure, template.variables, params, options)
  );
}

/**
 * Creates sample parameter values based on template variable definitions
 * 
 * Useful for UI auto-fill or testing.
 * 
 * @param variables - Template variable definitions
 * @returns Sample parameter values
 */
export function generateSampleParameters(
  variables: TemplateVariable[]
): Record<string, any> {
  const samples: Record<string, any> = {};
  
  for (const variable of variables) {
    if (variable.defaultValue) {
      samples[variable.name] = variable.defaultValue;
    } else {
      switch (variable.type) {
        case 'text':
          samples[variable.name] = `Sample ${variable.name}`;
          break;
        case 'number':
          samples[variable.name] = 42;
          break;
        case 'dropdown':
          samples[variable.name] = variable.options?.[0] || '';
          break;
      }
    }
  }
  
  return samples;
}

