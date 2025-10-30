/**
 * AI Integration Module - Parameter Injection Engine
 * 
 * Main exports for parameter injection and security utilities.
 */

// Parameter Injection
export {
  injectParameters,
  generatePreview,
  validateTemplateResolution,
  batchInjectParameters,
  extractPlaceholders,
  generateSampleParameters,
  type ResolvedTemplate,
  type ParameterError,
  type InjectionOptions,
} from './parameter-injection';

// Parameter Validation
export {
  validateParameter,
  validateAllParameters,
  preGenerationValidation,
  isRequiredParameter,
  getRequiredParameters,
  getOptionalParameters,
  applyDefaultValues,
  formatValidationErrors,
  ParameterValidationError,
  type ParameterValidationResult,
  type ValidationReport,
} from './parameter-validation';

// Security Utilities
export {
  escapeHtml,
  containsDangerousPattern,
  sanitizeInput,
  isSafeTemplateValue,
  stripHtmlTags,
  isSafeTemplateString,
  logSecurityEvent,
  validateAndCoerceType,
  CSP_HEADERS,
  type SecurityAuditLog,
} from './security-utils';

