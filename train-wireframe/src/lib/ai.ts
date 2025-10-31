import { Template, TemplateVariable } from './types';

/**
 * Generate a preview of the template with parameters filled in
 */
export function generatePreview(
  template: Template,
  parameters: Record<string, any>
): { preview: string; errors: string[] } {
  const errors: string[] = [];
  let preview = template.structure;

  // Track which placeholders haven't been filled
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  const allPlaceholders = new Set<string>();
  let match;
  
  while ((match = placeholderRegex.exec(template.structure)) !== null) {
    allPlaceholders.add(match[1]);
  }

  // Replace each variable in the template
  template.variables.forEach(variable => {
    const paramValue = parameters[variable.name];
    const placeholder = `{{${variable.name}}}`;
    
    if (paramValue !== undefined && paramValue !== null && paramValue !== '') {
      // Replace all instances of this placeholder
      preview = preview.replace(new RegExp(placeholder, 'g'), String(paramValue));
      allPlaceholders.delete(variable.name);
    } else if (!variable.defaultValue || variable.defaultValue === '') {
      // Required field is missing
      errors.push(`Required parameter "${variable.name}" is missing`);
    } else {
      // Use default value
      preview = preview.replace(new RegExp(placeholder, 'g'), variable.defaultValue);
      allPlaceholders.delete(variable.name);
    }
  });

  // Check for any remaining unfilled placeholders
  if (allPlaceholders.size > 0) {
    allPlaceholders.forEach(placeholder => {
      errors.push(`Unknown placeholder "{{${placeholder}}}" found in template`);
    });
  }

  return { preview, errors };
}

/**
 * Generate sample parameter values for testing
 */
export function generateSampleParameters(variables: TemplateVariable[]): Record<string, any> {
  const samples: Record<string, any> = {};
  
  variables.forEach(variable => {
    if (variable.defaultValue) {
      samples[variable.name] = variable.defaultValue;
    } else {
      // Generate sample based on type
      switch (variable.type) {
        case 'text':
          samples[variable.name] = `Sample ${variable.name}`;
          break;
        case 'number':
          samples[variable.name] = 42;
          break;
        case 'dropdown':
          samples[variable.name] = variable.options?.[0] || 'Option 1';
          break;
        default:
          samples[variable.name] = 'Sample value';
      }
    }
  });
  
  return samples;
}

/**
 * Get list of required parameters from template
 */
export function getRequiredParameters(template: Template): string[] {
  return template.variables
    .filter(v => !v.defaultValue || v.defaultValue === '')
    .map(v => v.name);
}

/**
 * Validate that all required parameters are filled
 */
export function validateParameters(
  template: Template,
  parameters: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const required = getRequiredParameters(template);
  
  required.forEach(paramName => {
    const value = parameters[paramName];
    if (value === undefined || value === null || value === '') {
      errors.push(`Required parameter "${paramName}" is missing`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Predefined persona options
 */
export const PERSONA_OPTIONS = [
  'Young professional',
  'Mid-career professional',
  'Senior executive',
  'Small business owner',
  'Freelancer',
  'Student',
  'Recent graduate',
  'Stay-at-home parent',
  'Retiree',
  'Technical expert',
  'Non-technical user',
  'Budget-conscious individual',
  'High-income earner',
  'First-time user',
  'Power user',
] as const;

/**
 * Predefined emotion options
 */
export const EMOTION_OPTIONS = [
  'Curious',
  'Confused',
  'Frustrated',
  'Excited',
  'Worried',
  'Confident',
  'Overwhelmed',
  'Satisfied',
  'Anxious',
  'Hopeful',
  'Neutral',
  'Determined',
  'Skeptical',
  'Relieved',
] as const;

/**
 * Predefined intent options
 */
export const INTENT_OPTIONS = [
  'Learn',
  'Troubleshoot',
  'Compare options',
  'Get recommendation',
  'Understand concept',
  'Solve problem',
  'Make decision',
  'Explore features',
  'Get started',
  'Optimize process',
] as const;

/**
 * Predefined tone options
 */
export const TONE_OPTIONS = [
  'Professional',
  'Casual',
  'Formal',
  'Friendly',
  'Technical',
  'Empathetic',
  'Direct',
  'Educational',
  'Consultative',
  'Enthusiastic',
] as const;

