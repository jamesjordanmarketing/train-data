/**
 * Supabase Agent Ops Library
 * Main entry point
 */

// Core exports
export * from './core/types';
export * from './core/config';

// Main agent tools
export { agentImportTool, analyzeImportErrors, generateDollarQuotedInsert } from './operations/import';
export { agentPreflight, detectPrimaryKey } from './preflight/checks';

// Utility exports (for advanced usage)
export { sanitizeRecord, validateAndSanitize, detectProblematicCharacters } from './validation/sanitize';
export { normalizeRecord, validateRequiredFields, coerceTypes } from './validation/normalize';
export { createValidator, validateRecords } from './validation/schema';
export { mapDatabaseError, isTransientError, ERROR_MAPPINGS } from './errors/codes';
export { generateRecoverySteps, suggestNextActions } from './errors/handlers';
export { logger, Logger } from './utils/logger';

// Version
export const VERSION = '1.0.0';

