/**
 * Error code definitions and mappings
 */

import { ErrorMapping } from '../core/types';

export const ERROR_MAPPINGS: ErrorMapping[] = [
  // Database constraint errors
  {
    code: 'ERR_DB_UNIQUE_VIOLATION',
    pgCode: '23505',
    patterns: ['duplicate key value violates unique constraint', 'unique constraint'],
    category: 'DB',
    description: 'Duplicate key violates unique constraint',
    remediation: "Re-run import with mode: 'upsert' and proper onConflict setting",
    example: "await agentImportTool({ ...params, mode: 'upsert', onConflict: 'id' });",
    automatable: true
  },
  {
    code: 'ERR_DB_FK_VIOLATION',
    pgCode: '23503',
    patterns: ['violates foreign key constraint', 'foreign key constraint'],
    category: 'DB',
    description: 'Foreign key constraint violation',
    remediation: 'Import parent tables before child tables (e.g., templates before conversations)',
    example: "// Import templates first\nawait agentImportTool({ table: 'templates', ... });\n// Then conversations\nawait agentImportTool({ table: 'conversations', ... });",
    automatable: false
  },
  {
    code: 'ERR_DB_NOT_NULL_VIOLATION',
    pgCode: '23502',
    patterns: ['null value in column', 'violates not-null constraint'],
    category: 'DB',
    description: 'NOT NULL constraint violation',
    remediation: 'Ensure required fields are populated in all records',
    example: "// Check that all required fields have values\nconst record = { id: '...', required_field: 'value' };",
    automatable: false
  },
  {
    code: 'ERR_DB_CHECK_VIOLATION',
    pgCode: '23514',
    patterns: ['violates check constraint', 'check constraint'],
    category: 'DB',
    description: 'CHECK constraint violation',
    remediation: 'Validate data against constraint rules before import',
    automatable: false
  },
  // Type casting errors
  {
    code: 'ERR_CAST_INVALID_INPUT',
    pgCode: '22P02',
    patterns: ['invalid input syntax', 'invalid text representation'],
    category: 'CAST',
    description: 'Type casting failure',
    remediation: 'Check that data types match the table schema',
    example: "// Ensure numeric fields contain numbers, not strings\nconst record = { id: 1, count: 42 }; // not '42'",
    automatable: false
  },
  {
    code: 'ERR_CAST_JSONB',
    pgCode: '22P02',
    patterns: ['invalid input syntax for type json', 'malformed json'],
    category: 'CAST',
    description: 'Invalid JSONB format',
    remediation: 'Ensure JSONB fields contain valid JSON objects',
    automatable: false
  },
  // Character/encoding errors
  {
    code: 'ERR_CHAR_INVALID_UTF8',
    patterns: ['invalid byte sequence for encoding "UTF8"', 'invalid utf8'],
    category: 'CHAR',
    description: 'Invalid UTF-8 sequences',
    remediation: 'Enable automatic character sanitization',
    example: "await agentImportTool({ ...params, validateCharacters: true, sanitize: true });",
    automatable: true
  },
  {
    code: 'ERR_CHAR_CONTROL',
    patterns: ['invalid control character', 'control character'],
    category: 'CHAR',
    description: 'Invalid control characters detected',
    remediation: 'Enable sanitization to remove control characters',
    example: "await agentImportTool({ ...params, sanitize: true });",
    automatable: true
  },
  // Authentication/Permission errors
  {
    code: 'ERR_AUTH_RLS_DENIED',
    patterns: ['row level security', 'permission denied', 'policy'],
    category: 'AUTH',
    description: 'RLS policy denied access',
    remediation: 'Use Service Role key or adjust RLS policies',
    example: "// Ensure SUPABASE_SERVICE_ROLE_KEY is set\nexport SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'",
    automatable: false
  },
  {
    code: 'ERR_AUTH_INVALID_KEY',
    patterns: ['invalid api key', 'unauthorized', 'authentication failed'],
    category: 'AUTH',
    description: 'Invalid or missing authentication key',
    remediation: 'Verify SUPABASE_SERVICE_ROLE_KEY is correct',
    automatable: false
  },
  // Validation errors
  {
    code: 'ERR_VALIDATION_SCHEMA',
    patterns: [],
    category: 'VALIDATION',
    description: 'Record does not match schema',
    remediation: 'Review schema validation errors and correct data',
    automatable: false
  },
  {
    code: 'ERR_VALIDATION_REQUIRED',
    patterns: ['required', 'missing'],
    category: 'VALIDATION',
    description: 'Required field missing',
    remediation: 'Ensure all required fields are present in records',
    automatable: false
  },
  // Table/column errors
  {
    code: 'ERR_DB_TABLE_NOT_FOUND',
    pgCode: '42P01',
    patterns: ['relation', 'does not exist', 'table'],
    category: 'DB',
    description: 'Table does not exist',
    remediation: 'Verify table name is correct or create the table',
    example: "// Check table name spelling\nawait agentImportTool({ table: 'conversations', ... });",
    automatable: false
  },
  {
    code: 'ERR_DB_COLUMN_NOT_FOUND',
    pgCode: '42703',
    patterns: ['column', 'does not exist'],
    category: 'DB',
    description: 'Column does not exist',
    remediation: 'Verify column names match table schema',
    automatable: false
  },
  // Schema operation errors (v1.1)
  {
    code: 'ERR_SCHEMA_ACCESS_DENIED',
    pgCode: '42501',
    patterns: ['permission denied for schema', 'must be owner of'],
    category: 'AUTH',
    description: 'Insufficient permissions to access schema',
    remediation: 'Use service role key or grant schema permissions',
    example: 'GRANT USAGE ON SCHEMA public TO your_role;',
    automatable: false
  },
  {
    code: 'ERR_RPC_NOT_FOUND',
    patterns: ['Could not find the function', 'function does not exist'],
    category: 'DB',
    description: 'RPC function does not exist',
    remediation: 'Create the RPC function in Supabase SQL Editor',
    example: `CREATE OR REPLACE FUNCTION exec_sql(sql_script text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE sql_script INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'code', SQLSTATE);
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;`,
    automatable: true
  },
  {
    code: 'ERR_DDL_SYNTAX',
    pgCode: '42601',
    patterns: ['syntax error at or near', 'syntax error'],
    category: 'VALIDATION',
    description: 'Invalid SQL syntax in DDL statement',
    remediation: 'Review and correct SQL syntax',
    example: 'Check PostgreSQL documentation for correct DDL syntax',
    automatable: false
  },
  {
    code: 'ERR_INDEX_EXISTS',
    pgCode: '42P07',
    patterns: ['already exists', 'relation'],
    category: 'DB',
    description: 'Index or relation already exists',
    remediation: 'Use DROP INDEX first, or use CREATE INDEX IF NOT EXISTS, or rename the index',
    example: 'DROP INDEX IF EXISTS index_name; CREATE INDEX index_name ON table(column);',
    automatable: true
  },
  {
    code: 'ERR_INDEX_NOT_FOUND',
    pgCode: '42704',
    patterns: ['does not exist', 'index'],
    category: 'DB',
    description: 'Index does not exist',
    remediation: 'Verify index name is correct',
    example: 'SELECT indexname FROM pg_indexes WHERE tablename = \'your_table\';',
    automatable: false
  },
  {
    code: 'ERR_RPC_TIMEOUT',
    patterns: ['timeout', 'statement timeout'],
    category: 'DB',
    description: 'RPC or SQL execution timed out',
    remediation: 'Increase timeout parameter or optimize query',
    example: 'await agentExecuteSQL({ sql: \'...\', timeout: 60000 });',
    automatable: false
  },
  {
    code: 'ERR_TRANSACTION_FAILED',
    pgCode: '25P02',
    patterns: ['current transaction is aborted', 'transaction'],
    category: 'DB',
    description: 'Transaction failed and was rolled back',
    remediation: 'Review transaction logic and fix errors',
    automatable: false
  }
];

/**
 * Maps a database error to a standardized error code
 */
export function mapDatabaseError(error: any): {
  code: string;
  pgCode?: string;
  description: string;
  remediation: string;
  example?: string;
  automatable: boolean;
} {
  // Prefer PG code when available
  if (error.code) {
    const mapping = ERROR_MAPPINGS.find(m => m.pgCode === error.code);
    if (mapping) {
      return {
        code: mapping.code,
        pgCode: mapping.pgCode,
        description: mapping.description,
        remediation: mapping.remediation,
        example: mapping.example,
        automatable: mapping.automatable
      };
    }
  }

  // Fallback to pattern matching
  const message = error.message || String(error);
  for (const mapping of ERROR_MAPPINGS) {
    if (mapping.patterns.some(pattern => message.toLowerCase().includes(pattern.toLowerCase()))) {
      return {
        code: mapping.code,
        pgCode: mapping.pgCode,
        description: mapping.description,
        remediation: mapping.remediation,
        example: mapping.example,
        automatable: mapping.automatable
      };
    }
  }

  // Unknown error
  return {
    code: 'ERR_FATAL',
    description: 'Unknown error',
    remediation: 'Review error details and consult documentation',
    automatable: false
  };
}

/**
 * Checks if an error is transient (retryable)
 */
export function isTransientError(error: any): boolean {
  const transientPatterns = [
    'connection',
    'timeout',
    'network',
    'econnreset',
    'enotfound',
    'etimedout'
  ];

  const message = (error.message || String(error)).toLowerCase();
  return transientPatterns.some(pattern => message.includes(pattern));
}

