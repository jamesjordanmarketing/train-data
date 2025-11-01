import { Template } from '../types';

export interface CSVValidationError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CSVValidationResult {
  valid: boolean;
  errors: CSVValidationError[];
  warnings: CSVValidationError[];
  rowCount: number;
  validRowCount: number;
}

export interface ScenarioCSVRow {
  name: string;
  template_id: string;
  topic: string;
  persona: string;
  emotional_arc: string;
  description?: string;
  context?: string;
  status?: string;
  [key: string]: any; // For dynamic variable columns
}

const REQUIRED_COLUMNS = ['name', 'template_id', 'topic', 'persona', 'emotional_arc'];
const OPTIONAL_COLUMNS = ['description', 'context', 'status'];
const VALID_STATUSES = ['draft', 'active', 'archived'];
const MAX_ROWS = 100;
const MAX_NAME_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 2000;

/**
 * Validates CSV data for scenario bulk import
 */
export function validateScenarioCSV(
  data: ScenarioCSVRow[],
  templates: Template[]
): CSVValidationResult {
  const errors: CSVValidationError[] = [];
  const warnings: CSVValidationError[] = [];

  // Check if data is empty
  if (!data || data.length === 0) {
    errors.push({
      row: 0,
      column: 'all',
      message: 'CSV file is empty',
      severity: 'error',
    });
    return {
      valid: false,
      errors,
      warnings,
      rowCount: 0,
      validRowCount: 0,
    };
  }

  // Check row count limit
  if (data.length > MAX_ROWS) {
    errors.push({
      row: 0,
      column: 'all',
      message: `CSV contains ${data.length} rows. Maximum is ${MAX_ROWS}.`,
      severity: 'error',
    });
    return {
      valid: false,
      errors,
      warnings,
      rowCount: data.length,
      validRowCount: 0,
    };
  }

  // Check for required columns
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  const missingColumns = REQUIRED_COLUMNS.filter(col => !columns.includes(col));

  if (missingColumns.length > 0) {
    errors.push({
      row: 0,
      column: 'all',
      message: `Missing required columns: ${missingColumns.join(', ')}`,
      severity: 'error',
    });
  }

  // Validate each row
  const rowErrors = new Set<number>();
  const namesSeen = new Map<string, number[]>();

  data.forEach((row, index) => {
    const rowNumber = index + 1;
    let hasError = false;

    // Validate required fields
    REQUIRED_COLUMNS.forEach(col => {
      if (!row[col] || String(row[col]).trim() === '') {
        errors.push({
          row: rowNumber,
          column: col,
          message: `Missing required field: ${col}`,
          severity: 'error',
        });
        hasError = true;
      }
    });

    // Validate field lengths
    if (row.name && String(row.name).length > MAX_NAME_LENGTH) {
      errors.push({
        row: rowNumber,
        column: 'name',
        message: `Name exceeds ${MAX_NAME_LENGTH} characters`,
        severity: 'error',
      });
      hasError = true;
    }

    if (row.description && String(row.description).length > MAX_DESCRIPTION_LENGTH) {
      warnings.push({
        row: rowNumber,
        column: 'description',
        message: `Description exceeds ${MAX_DESCRIPTION_LENGTH} characters (will be truncated)`,
        severity: 'warning',
      });
    }

    if (row.context && String(row.context).length > MAX_CONTEXT_LENGTH) {
      warnings.push({
        row: rowNumber,
        column: 'context',
        message: `Context exceeds ${MAX_CONTEXT_LENGTH} characters (will be truncated)`,
        severity: 'warning',
      });
    }

    // Validate template exists
    const template = templates.find(t => t.id === row.template_id);
    if (!template && row.template_id) {
      errors.push({
        row: rowNumber,
        column: 'template_id',
        message: `Template ID "${row.template_id}" not found`,
        severity: 'error',
      });
      hasError = true;
    }

    // Validate status if provided
    if (row.status && !VALID_STATUSES.includes(row.status)) {
      errors.push({
        row: rowNumber,
        column: 'status',
        message: `Invalid status: ${row.status}. Must be one of: ${VALID_STATUSES.join(', ')}`,
        severity: 'error',
      });
      hasError = true;
    }

    // Check template variables if template exists
    if (template) {
      template.variables.forEach(variable => {
        const varKey = `var_${variable.name}`;
        if (!row[varKey] || String(row[varKey]).trim() === '') {
          errors.push({
            row: rowNumber,
            column: varKey,
            message: `Missing template variable: ${variable.name}`,
            severity: 'error',
          });
          hasError = true;
        }

        // Validate variable type
        if (row[varKey]) {
          const value = row[varKey];
          
          if (variable.type === 'number') {
            if (isNaN(Number(value))) {
              errors.push({
                row: rowNumber,
                column: varKey,
                message: `Variable "${variable.name}" must be a number`,
                severity: 'error',
              });
              hasError = true;
            }
          }

          if (variable.type === 'dropdown' && variable.options) {
            if (!variable.options.includes(String(value))) {
              errors.push({
                row: rowNumber,
                column: varKey,
                message: `Variable "${variable.name}" must be one of: ${variable.options.join(', ')}`,
                severity: 'error',
              });
              hasError = true;
            }
          }
        }
      });
    }

    // Track duplicate names
    if (row.name) {
      const name = String(row.name).trim();
      if (!namesSeen.has(name)) {
        namesSeen.set(name, []);
      }
      namesSeen.get(name)!.push(rowNumber);
    }

    if (hasError) {
      rowErrors.add(rowNumber);
    }
  });

  // Check for duplicate names
  namesSeen.forEach((rows, name) => {
    if (rows.length > 1) {
      rows.forEach(row => {
        warnings.push({
          row,
          column: 'name',
          message: `Duplicate name "${name}" found in rows: ${rows.join(', ')}`,
          severity: 'warning',
        });
      });
    }
  });

  const validRowCount = data.length - rowErrors.size;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    rowCount: data.length,
    validRowCount,
  };
}

/**
 * Checks if a CSV column name is a template variable
 */
export function isVariableColumn(columnName: string): boolean {
  return columnName.startsWith('var_');
}

/**
 * Extracts the variable name from a CSV column name
 */
export function extractVariableName(columnName: string): string {
  return columnName.replace(/^var_/, '');
}

/**
 * Generates a template column name for a variable
 */
export function generateVariableColumnName(variableName: string): string {
  return `var_${variableName}`;
}

/**
 * Extracts parameter values from a CSV row
 */
export function extractParameterValues(
  row: ScenarioCSVRow,
  template: Template
): Record<string, any> {
  const parameterValues: Record<string, any> = {};

  template.variables.forEach(variable => {
    const varKey = generateVariableColumnName(variable.name);
    if (row[varKey] !== undefined) {
      let value = row[varKey];
      
      // Convert to appropriate type
      if (variable.type === 'number') {
        value = Number(value);
      }
      
      parameterValues[variable.name] = value;
    }
  });

  return parameterValues;
}

/**
 * Validates a single scenario row
 */
export function validateScenarioRow(
  row: ScenarioCSVRow,
  rowNumber: number,
  template: Template | undefined
): { valid: boolean; errors: CSVValidationError[]; warnings: CSVValidationError[] } {
  const errors: CSVValidationError[] = [];
  const warnings: CSVValidationError[] = [];

  // Check required fields
  REQUIRED_COLUMNS.forEach(col => {
    if (!row[col] || String(row[col]).trim() === '') {
      errors.push({
        row: rowNumber,
        column: col,
        message: `Missing required field: ${col}`,
        severity: 'error',
      });
    }
  });

  // Check template exists
  if (!template) {
    errors.push({
      row: rowNumber,
      column: 'template_id',
      message: `Template not found`,
      severity: 'error',
    });
  }

  // Check status
  if (row.status && !VALID_STATUSES.includes(row.status)) {
    errors.push({
      row: rowNumber,
      column: 'status',
      message: `Invalid status`,
      severity: 'error',
    });
  }

  // Check template variables
  if (template) {
    template.variables.forEach(variable => {
      const varKey = generateVariableColumnName(variable.name);
      if (!row[varKey]) {
        errors.push({
          row: rowNumber,
          column: varKey,
          message: `Missing variable: ${variable.name}`,
          severity: 'error',
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

