/**
 * Core type definitions for supa-agent-ops library
 */

export type Transport = 'supabase' | 'pg' | 'auto';
export type ImportMode = 'insert' | 'upsert';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ErrorCategory = 'VALIDATION' | 'CHAR' | 'DB' | 'CAST' | 'AUTH' | 'FATAL';
export type UnicodeNormalization = 'NFC' | 'NFKC' | 'none';

export interface LibraryConfig {
  transport: Transport;
  batchSize: number;
  concurrency: number;
  retry: {
    maxAttempts: number;
    backoffMs: number;
  };
  validation: CharacterValidationConfig;
  outputDir: string;
}

export interface CharacterValidationConfig {
  allowApostrophes: boolean;
  allowQuotes: boolean;
  allowBackslashes: boolean;
  allowNewlines: boolean;
  allowTabs: boolean;
  allowEmoji: boolean;
  allowControlChars: boolean;
  normalizeUnicode: UnicodeNormalization;
  stripInvalidUtf8: boolean;
  maxFieldLength: number;
}

export interface AgentImportParams {
  source: string | Record<string, any>[];
  table: string;
  mode?: ImportMode;
  onConflict?: string | string[];
  outputDir?: string;
  batchSize?: number;
  concurrency?: number;
  dryRun?: boolean;
  retry?: { maxAttempts?: number; backoffMs?: number };
  validateCharacters?: boolean;
  sanitize?: boolean;
  normalization?: UnicodeNormalization;
  schema?: unknown;
  transport?: Transport;
}

export interface AgentImportResult {
  success: boolean;
  summary: string;
  totals: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
    durationMs: number;
  };
  reportPaths: {
    summary: string;
    errors?: string;
    success?: string;
  };
  nextActions: NextAction[];
}

export interface NextAction {
  action: string;
  description: string;
  example?: string;
  priority: Priority;
}

export interface ErrorMapping {
  code: string;
  pgCode?: string;
  patterns: string[];
  category: ErrorCategory;
  description: string;
  remediation: string;
  example?: string;
  automatable: boolean;
}

export interface PreflightResult {
  ok: boolean;
  issues: string[];
  recommendations: Recommendation[];
}

export interface Recommendation {
  description: string;
  example?: string;
  priority: Priority;
}

export interface RecoveryStep {
  priority: Priority;
  errorCode: string;
  affectedCount: number;
  action: string;
  description: string;
  example?: string;
  automatable: boolean;
}

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  warnings: string[];
}

export interface PreflightCheck {
  name: string;
  description: string;
  check: (params?: any) => Promise<boolean>;
  recommendation?: Recommendation;
}

export interface ErrorReport {
  runId: string;
  table: string;
  totalErrors: number;
  errorBreakdown: ErrorBreakdownItem[];
  failedRecords: FailedRecord[];
  recoverySteps: RecoveryStep[];
}

export interface ErrorBreakdownItem {
  code: string;
  pgCode?: string;
  count: number;
  percentage: number;
  description: string;
}

export interface FailedRecord {
  record: Record<string, any>;
  error: {
    code: string;
    pgCode?: string;
    message: string;
    detail?: string;
  };
}

export interface SummaryReport {
  runId: string;
  table: string;
  totals: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
    durationMs: number;
  };
  warnings: string[];
  config: {
    mode: ImportMode;
    onConflict?: string | string[];
    batchSize: number;
    concurrency: number;
    sanitize: boolean;
    normalization: UnicodeNormalization;
    transport: Transport;
  };
  nextActions: NextAction[];
}

export interface SuccessReport {
  runId: string;
  table: string;
  totalSuccess: number;
  records: Array<{ id?: string; [key: string]: any }>;
}

export interface BatchResult {
  success: boolean;
  recordCount: number;
  errors?: any[];
}

