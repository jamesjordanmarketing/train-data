/**
 * Parameter Validation Module
 * 
 * Validates template parameters against their defined types and constraints.
 * Ensures all required parameters are present and values meet validation rules.
 */

import { TemplateVariable } from '../../lib/types';
import { validateAndCoerceType, isSafeTemplateValue } from './security-utils';

/**
 * Error thrown when parameter validation fails
 */
export class ParameterValidationError extends Error {
  constructor(
    message: string,
    public parameterName: string,
    public expectedType: string,
    public actualValue: any
  ) {
    super(message);
    this.name = 'ParameterValidationError';
  }
}

/**
 * Validation result for a single parameter
 */
export interface ParameterValidationResult {
  parameterName: string;
  valid: boolean;
  error?: string;
  expectedType: string;
  actualValue: any;
  coercedValue?: any;
}

/**
 * Overall validation result for all parameters
 */
export interface ValidationReport {
  valid: boolean;
  errors: ParameterValidationResult[];
  missingRequired: string[];
  warnings: string[];
}

/**
 * Validates a single parameter value against its definition
 * 
 * @param variable - Template variable definition
 * @param value - Actual value provided
 * @param isRequired - Whether this parameter is required
 * @returns Validation result with coerced value if valid
 */
export function validateParameter(
  variable: TemplateVariable,
  value: any,
  isRequired: boolean = true
): ParameterValidationResult {
  const result: ParameterValidationResult = {
    parameterName: variable.name,
    valid: false,
    expectedType: variable.type,
    actualValue: value,
  };
  
  // Check if value is missing
  if (value === null || value === undefined || value === '') {
    if (isRequired) {
      result.error = `Parameter "${variable.name}" is required but was not provided`;
      return result;
    }
    
    // Use default value for optional parameters
    if (variable.defaultValue !== undefined && variable.defaultValue !== '') {
      result.coercedValue = variable.defaultValue;
      result.valid = true;
      return result;
    }
    
    // Optional parameter with no default - this is valid
    result.valid = true;
    result.coercedValue = '';
    return result;
  }
  
  try {
    // Type-specific validation
    switch (variable.type) {
      case 'text':
        result.coercedValue = validateTextParameter(value);
        break;
      
      case 'number':
        result.coercedValue = validateNumberParameter(value);
        break;
      
      case 'dropdown':
        result.coercedValue = validateDropdownParameter(value, variable.options || []);
        break;
      
      default:
        throw new Error(`Unknown parameter type: ${variable.type}`);
    }
    
    result.valid = true;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }
  
  return result;
}

/**
 * Validates text parameter
 * 
 * @param value - Value to validate
 * @returns Validated and sanitized text
 * @throws ParameterValidationError if invalid
 */
function validateTextParameter(value: any): string {
  const textValue = String(value);
  
  // Check length constraints
  if (textValue.length === 0) {
    throw new Error('Text parameter cannot be empty');
  }
  
  if (textValue.length > 10000) {
    throw new Error('Text parameter exceeds maximum length of 10,000 characters');
  }
  
  // Security validation
  if (!isSafeTemplateValue(textValue)) {
    throw new Error('Text parameter contains unsafe content');
  }
  
  return textValue;
}

/**
 * Validates number parameter
 * 
 * @param value - Value to validate
 * @returns Validated number
 * @throws ParameterValidationError if invalid
 */
function validateNumberParameter(value: any): number {
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    throw new Error(`"${value}" is not a valid number`);
  }
  
  if (!isFinite(numValue)) {
    throw new Error('Number parameter must be finite');
  }
  
  // Reasonable range constraints
  if (numValue < -1e15 || numValue > 1e15) {
    throw new Error('Number parameter is outside acceptable range');
  }
  
  return numValue;
}

/**
 * Validates dropdown parameter
 * 
 * @param value - Value to validate
 * @param options - Valid options for dropdown
 * @returns Validated dropdown value
 * @throws ParameterValidationError if invalid
 */
function validateDropdownParameter(value: any, options: string[]): string {
  const textValue = String(value);
  
  if (options.length === 0) {
    throw new Error('Dropdown parameter has no valid options defined');
  }
  
  if (!options.includes(textValue)) {
    throw new Error(
      `"${textValue}" is not a valid option. Valid options are: ${options.join(', ')}`
    );
  }
  
  return textValue;
}

/**
 * Validates all parameters for a template
 * 
 * @param variables - Template variable definitions
 * @param parameterValues - Actual parameter values provided
 * @param requiredParams - List of required parameter names (if not all)
 * @returns Complete validation report
 */
export function validateAllParameters(
  variables: TemplateVariable[],
  parameterValues: Record<string, any>,
  requiredParams?: string[]
): ValidationReport {
  const report: ValidationReport = {
    valid: true,
    errors: [],
    missingRequired: [],
    warnings: [],
  };
  
  // Determine which parameters are required
  const requiredSet = new Set(requiredParams || variables.map(v => v.name));
  
  // Validate each variable
  for (const variable of variables) {
    const isRequired = requiredSet.has(variable.name);
    const value = parameterValues[variable.name];
    
    const result = validateParameter(variable, value, isRequired);
    
    if (!result.valid) {
      report.valid = false;
      report.errors.push(result);
      
      if (isRequired && (value === null || value === undefined || value === '')) {
        report.missingRequired.push(variable.name);
      }
    }
  }
  
  // Check for extra parameters not in template definition
  const definedParams = new Set(variables.map(v => v.name));
  for (const key of Object.keys(parameterValues)) {
    if (!definedParams.has(key)) {
      report.warnings.push(
        `Parameter "${key}" is not defined in template and will be ignored`
      );
    }
  }
  
  return report;
}

/**
 * Checks if a parameter is required (has no default value)
 * 
 * @param variable - Template variable definition
 * @returns true if required, false if optional
 */
export function isRequiredParameter(variable: TemplateVariable): boolean {
  return !variable.defaultValue || variable.defaultValue === '';
}

/**
 * Gets list of all required parameters from template variables
 * 
 * @param variables - Template variable definitions
 * @returns Array of required parameter names
 */
export function getRequiredParameters(variables: TemplateVariable[]): string[] {
  return variables
    .filter(v => isRequiredParameter(v))
    .map(v => v.name);
}

/**
 * Gets list of all optional parameters from template variables
 * 
 * @param variables - Template variable definitions
 * @returns Array of optional parameter names
 */
export function getOptionalParameters(variables: TemplateVariable[]): string[] {
  return variables
    .filter(v => !isRequiredParameter(v))
    .map(v => v.name);
}

/**
 * Applies default values for missing optional parameters
 * 
 * @param variables - Template variable definitions
 * @param parameterValues - Current parameter values
 * @returns Parameter values with defaults applied
 */
export function applyDefaultValues(
  variables: TemplateVariable[],
  parameterValues: Record<string, any>
): Record<string, any> {
  const result = { ...parameterValues };
  
  for (const variable of variables) {
    // If parameter is missing and has a default, use it
    if (
      (result[variable.name] === undefined || result[variable.name] === null || result[variable.name] === '') &&
      variable.defaultValue !== undefined &&
      variable.defaultValue !== ''
    ) {
      result[variable.name] = variable.defaultValue;
    }
  }
  
  return result;
}

/**
 * Pre-generation validation check
 * 
 * Performs comprehensive validation before template generation,
 * including security checks and completeness verification.
 * 
 * @param variables - Template variable definitions
 * @param parameterValues - Parameter values to validate
 * @returns Validation report
 * @throws Error if critical security violations detected
 */
export function preGenerationValidation(
  variables: TemplateVariable[],
  parameterValues: Record<string, any>
): ValidationReport {
  // Apply defaults first
  const valuesWithDefaults = applyDefaultValues(variables, parameterValues);
  
  // Get required parameters
  const requiredParams = getRequiredParameters(variables);
  
  // Validate all parameters
  const report = validateAllParameters(variables, valuesWithDefaults, requiredParams);
  
  // Additional security validation
  for (const [key, value] of Object.entries(valuesWithDefaults)) {
    if (typeof value === 'string' && !isSafeTemplateValue(value)) {
      report.valid = false;
      report.errors.push({
        parameterName: key,
        valid: false,
        error: 'Parameter contains potentially dangerous content',
        expectedType: 'text',
        actualValue: value,
      });
    }
  }
  
  return report;
}

/**
 * Formats validation report as user-friendly error messages
 * 
 * @param report - Validation report
 * @returns Array of error message strings
 */
export function formatValidationErrors(report: ValidationReport): string[] {
  const messages: string[] = [];
  
  if (report.missingRequired.length > 0) {
    messages.push(
      `Missing required parameters: ${report.missingRequired.join(', ')}`
    );
  }
  
  for (const error of report.errors) {
    if (error.error) {
      messages.push(`${error.parameterName}: ${error.error}`);
    }
  }
  
  return messages;
}

