/**
 * Supabase Agent Ops Library
 * Main entry point
 */

// Core exports
export * from './core/types';
export * from './core/config';

// Main agent tools (v1.0)
export { agentImportTool, analyzeImportErrors, generateDollarQuotedInsert } from './operations/import';
export { agentPreflight, detectPrimaryKey } from './preflight/checks';

// Schema and RPC operations (v1.1)
export { 
  agentIntrospectSchema, 
  agentExecuteDDL, 
  agentManageIndex 
} from './operations/schema';

export { 
  agentExecuteRPC, 
  agentExecuteSQL,
  executeWithTransaction 
} from './operations/rpc';

// Preflight for schema operations
export { preflightSchemaOperation } from './preflight/checks';

// Query, Export, and Delete operations (v1.2 - Prompt 2)
export { 
  agentQuery, 
  agentCount 
} from './operations/query';

export { 
  agentExportData,
  getTransformer,
  IExportTransformer,
  JSONLTransformer,
  JSONTransformer,
  CSVTransformer,
  MarkdownTransformer
} from './operations/export';

export { 
  agentDelete 
} from './operations/delete';

// Maintenance operations (v1.3 - Prompt 3)
export { 
  agentVacuum, 
  agentAnalyze, 
  agentReindex,
  VacuumParams,
  VacuumResult,
  AnalyzeParams,
  ReindexParams
} from './operations/maintenance';

// Verification operations (v1.3 - Prompt 3)
export { 
  agentVerifyTable,
  TableVerifyParams,
  TableVerifyResult,
  VerificationIssue,
  ColumnSpec,
  ConstraintSpec
} from './verification/structure';

// Performance monitoring (v1.3 - Prompt 3)
export { 
  agentAnalyzeIndexUsage,
  agentAnalyzeTableBloat,
  IndexUsageParams,
  IndexUsageResult,
  IndexUsageInfo
} from './verification/performance';

// Utility exports (for advanced usage)
export { sanitizeRecord, validateAndSanitize, detectProblematicCharacters } from './validation/sanitize';
export { normalizeRecord, validateRequiredFields, coerceTypes } from './validation/normalize';
export { createValidator, validateRecords } from './validation/schema';
export { mapDatabaseError, isTransientError, ERROR_MAPPINGS } from './errors/codes';
export { generateRecoverySteps, suggestNextActions } from './errors/handlers';
export { logger, Logger } from './utils/logger';

// Version
export const VERSION = '1.3.0';

