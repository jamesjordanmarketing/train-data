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

// ============================================================================
// Schema Operations Types (v1.1)
// ============================================================================

export type SchemaOperationType = 
  | 'introspect'
  | 'ddl'
  | 'index_create'
  | 'index_drop'
  | 'constraint_add'
  | 'constraint_drop';

/**
 * Base result interface for agent operations
 */
export interface AgentOperationResult {
  success: boolean;
  summary: string;
  executionTimeMs: number;
  nextActions: NextAction[];
  operation?: string;
}

/**
 * Column information from schema introspection
 */
export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyTable?: string;
  foreignKeyColumn?: string;
}

/**
 * Index information from schema introspection
 */
export interface IndexInfo {
  name: string;
  table: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
  indexDef: string;
  sizeBytes?: number;
}

/**
 * Constraint information from schema introspection
 */
export interface ConstraintInfo {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  definition: string;
  columns?: string[];
}

/**
 * RLS Policy information from schema introspection
 */
export interface PolicyInfo {
  name: string;
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  roles: string[];
  definition: string;
  using?: string;
  withCheck?: string;
}

/**
 * Table schema information
 */
export interface TableSchema {
  name: string;
  exists: boolean;
  rowCount: number;
  sizeBytes?: number;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
  policies: PolicyInfo[];
  rlsEnabled: boolean;
}

/**
 * Parameters for schema introspection
 */
export interface SchemaIntrospectParams {
  table?: string;
  includeColumns?: boolean;
  includeIndexes?: boolean;
  includeConstraints?: boolean;
  includePolicies?: boolean;
  includeStats?: boolean;
  transport?: Transport;
}

/**
 * Result from schema introspection
 */
export interface SchemaIntrospectResult extends AgentOperationResult {
  tables: TableSchema[];
}

/**
 * Parameters for DDL execution
 */
export interface DDLExecuteParams {
  sql: string;
  dryRun?: boolean;
  transaction?: boolean;
  validateOnly?: boolean;
  transport?: Transport;
}

/**
 * Result from DDL execution
 */
export interface DDLExecuteResult extends AgentOperationResult {
  executed: boolean;
  statements: number;
  affectedObjects: string[];
  warnings?: string[];
}

/**
 * Parameters for index management
 */
export interface IndexManageParams {
  table: string;
  action: 'create' | 'drop' | 'list' | 'analyze';
  indexName?: string;
  columns?: string[];
  indexType?: 'btree' | 'hash' | 'gist' | 'gin' | 'brin';
  concurrent?: boolean;
  unique?: boolean;
  where?: string;
  dryRun?: boolean;
  transport?: Transport;
}

/**
 * Result from index management
 */
export interface IndexManageResult extends AgentOperationResult {
  indexes: IndexInfo[];
  operation?: string;
}

/**
 * Parameters for RPC execution
 */
export interface RPCExecuteParams {
  functionName: string;
  params?: Record<string, any>;
  timeout?: number;
}

/**
 * Result from RPC execution
 */
export interface RPCExecuteResult extends AgentOperationResult {
  data: any;
  rowCount?: number;
}

/**
 * Parameters for SQL execution
 */
export interface SQLExecuteParams {
  sql: string;
  transport?: 'rpc' | 'pg';
  transaction?: boolean;
  dryRun?: boolean;
  timeout?: number;
}

/**
 * Result from SQL execution
 */
export interface SQLExecuteResult extends AgentOperationResult {
  rows?: any[];
  rowCount?: number;
  command?: string;
}

/**
 * Parameters for schema operation preflight
 */
export interface SchemaOperationParams {
  operation: SchemaOperationType;
  table?: string;
  transport?: Transport;
}

// ============================================================================
// Query Operations Types (v1.2 - Prompt 2)
// ============================================================================

/**
 * Query filter operators
 */
export type QueryOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'is';

/**
 * Query filter definition
 */
export interface QueryFilter {
  column: string;
  operator: QueryOperator;
  value: any;
}

/**
 * Order specification for queries
 */
export interface OrderSpec {
  column: string;
  asc: boolean;
}

/**
 * Aggregation specification
 */
export interface AggregateSpec {
  function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
  column: string;
  alias?: string;
}

/**
 * Parameters for advanced queries
 */
export interface QueryParams {
  table: string;
  select?: string[];
  where?: QueryFilter[];
  orderBy?: OrderSpec[];
  limit?: number;
  offset?: number;
  count?: boolean;
  aggregate?: AggregateSpec[];
}

/**
 * Result from query operations
 */
export interface QueryResult extends AgentOperationResult {
  data: any[];
  count?: number;
  aggregates?: Record<string, any>;
}

/**
 * Parameters for count operations
 */
export interface CountParams {
  table: string;
  where?: QueryFilter[];
  distinct?: string;
}

/**
 * Result from count operations
 */
export interface CountResult extends AgentOperationResult {
  count: number;
}

// ============================================================================
// Export Operations Types (v1.2 - Prompt 2)
// ============================================================================

/**
 * Supported export formats
 */
export type ExportFormat = 'json' | 'jsonl' | 'csv' | 'markdown';

/**
 * Export configuration
 */
export interface ExportConfig {
  format: ExportFormat;
  includeMetadata: boolean;
  includeTimestamps: boolean;
  filters?: QueryFilter[];
}

/**
 * Parameters for export operations
 */
export interface ExportParams {
  table: string;
  destination?: string;
  config: ExportConfig;
  filters?: QueryFilter[];
  columns?: string[];
}

/**
 * Result from export operations
 */
export interface ExportResult extends AgentOperationResult {
  recordCount: number;
  fileSize: number;
  filePath?: string;
}

// ============================================================================
// Delete Operations Types (v1.2 - Prompt 2)
// ============================================================================

/**
 * Parameters for delete operations
 */
export interface DeleteParams {
  table: string;
  where: QueryFilter[];
  cascade?: boolean;
  dryRun?: boolean;
  confirm?: boolean;
}

/**
 * Result from delete operations
 */
export interface DeleteResult extends AgentOperationResult {
  deletedCount: number;
  affectedTables?: string[];
  previewRecords?: any[];
}

// ============================================================================
// Maintenance Operations Types (v1.3 - Prompt 3)
// ============================================================================

/**
 * Parameters for VACUUM operations
 */
export interface VacuumParams {
  table?: string;
  full?: boolean;
  analyze?: boolean;
  dryRun?: boolean;
}

/**
 * Result from VACUUM operations
 */
export interface VacuumResult extends AgentOperationResult {
  tablesProcessed: string[];
  spaceReclaimed?: number;
  operation: string;
}

/**
 * Parameters for ANALYZE operations
 */
export interface AnalyzeParams {
  table?: string;
  columns?: string[];
}

/**
 * Parameters for REINDEX operations
 */
export interface ReindexParams {
  target: 'table' | 'index' | 'schema';
  name: string;
  concurrent?: boolean;
}

// ============================================================================
// Verification Types (v1.3 - Prompt 3)
// ============================================================================

/**
 * Column specification for verification
 */
export interface ColumnSpec {
  name: string;
  type: string;
  required?: boolean;
}

/**
 * Constraint specification for verification
 */
export interface ConstraintSpec {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  columns: string[];
}

/**
 * Parameters for table verification
 */
export interface TableVerifyParams {
  table: string;
  expectedColumns?: ColumnSpec[];
  expectedIndexes?: string[];
  expectedConstraints?: ConstraintSpec[];
  generateFixSQL?: boolean;
}

/**
 * Verification issue details
 */
export interface VerificationIssue {
  type: 'missing_column' | 'missing_index' | 'missing_constraint' | 'type_mismatch' | 'missing_table';
  severity: 'warning' | 'error' | 'critical';
  description: string;
  fixSQL?: string;
}

/**
 * Result from table verification
 */
export interface TableVerifyResult extends AgentOperationResult {
  exists: boolean;
  issues: VerificationIssue[];
  fixSQL?: string;
  category: 1 | 2 | 3 | 4; // 1=OK, 2=Warning, 3=Critical, 4=Blocking
  canProceed: boolean;
  operation: string;
}

// ============================================================================
// Performance Types (v1.3 - Prompt 3)
// ============================================================================

/**
 * Index usage information
 */
export interface IndexUsageInfo {
  tableName: string;
  indexName: string;
  scans: number;
  tuplesRead: number;
  tuplesReturned: number;
  sizeBytes: number;
  unused: boolean;
}

/**
 * Parameters for index usage analysis
 */
export interface IndexUsageParams {
  table?: string;
  minScans?: number;
}

/**
 * Result from index usage analysis
 */
export interface IndexUsageResult extends AgentOperationResult {
  indexes: IndexUsageInfo[];
  recommendations: string[];
  operation: string;
}

