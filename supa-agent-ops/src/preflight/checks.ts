/**
 * Preflight checks for environment and database readiness
 */

import { PreflightResult, PreflightCheck, Recommendation } from '../core/types';
import { loadEnvironmentConfig, validateEnvironmentConfig } from '../core/config';
import { getSupabaseClient, getPgClient, closePgClient } from '../core/client';
import { logger } from '../utils/logger';

/**
 * Checks if required environment variables are set
 */
async function checkEnvironmentVariables(transport: 'supabase' | 'pg' | 'auto' = 'supabase'): Promise<{
  passed: boolean;
  recommendation?: Recommendation;
}> {
  const env = loadEnvironmentConfig();
  const validation = validateEnvironmentConfig(env, transport);

  if (!validation.valid) {
    const missingVars = validation.missingVars.join(', ');
    return {
      passed: false,
      recommendation: {
        description: `Missing required environment variables: ${missingVars}`,
        example: validation.missingVars.map(v => `export ${v}=your-value-here`).join('\n'),
        priority: 'HIGH'
      }
    };
  }

  return { passed: true };
}

/**
 * Checks if service role key is being used (not anon key)
 */
async function checkServiceRoleKey(): Promise<{
  passed: boolean;
  recommendation?: Recommendation;
}> {
  const env = loadEnvironmentConfig();
  
  if (!env.supabaseServiceRoleKey) {
    return { passed: false };
  }

  // Service role keys typically start with 'eyJ' and are much longer than anon keys
  // This is a heuristic check
  if (env.supabaseServiceRoleKey.includes('anon') || env.supabaseServiceRoleKey.length < 100) {
    return {
      passed: false,
      recommendation: {
        description: 'SUPABASE_SERVICE_ROLE_KEY appears to be an anon key, not a service role key',
        example: 'Use the service_role key from your Supabase project settings (not the anon key)',
        priority: 'HIGH'
      }
    };
  }

  return { passed: true };
}

/**
 * Checks if a table exists in the database
 */
async function checkTableExists(table: string, transport: 'supabase' | 'pg' | 'auto' = 'supabase'): Promise<{
  passed: boolean;
  recommendation?: Recommendation;
}> {
  try {
    if (transport === 'pg') {
      const client = await getPgClient();
      const result = await client.query(
        `SELECT EXISTS (
          SELECT FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = $1
        )`,
        [table]
      );
      
      if (!result.rows[0].exists) {
        return {
          passed: false,
          recommendation: {
            description: `Table "${table}" does not exist in the database`,
            example: `CREATE TABLE ${table} (...); -- Create the table first`,
            priority: 'HIGH'
          }
        };
      }
    } else {
      const supabase = getSupabaseClient();
      // Try to query the table with limit 0 to check existence
      const { error } = await supabase.from(table).select('*').limit(0);
      
      if (error && error.message.includes('does not exist')) {
        return {
          passed: false,
          recommendation: {
            description: `Table "${table}" does not exist in the database`,
            example: `CREATE TABLE ${table} (...); -- Create the table first`,
            priority: 'HIGH'
          }
        };
      }
    }

    return { passed: true };
  } catch (error: any) {
    logger.warn('Table existence check failed', { error: error.message });
    // If we can't check, assume it exists and let the import fail with a better error
    return { passed: true };
  }
}

/**
 * Checks if onConflict column exists and has a unique constraint
 */
async function checkUpsertReadiness(
  table: string,
  onConflict?: string | string[],
  transport: 'supabase' | 'pg' | 'auto' = 'supabase'
): Promise<{
  passed: boolean;
  recommendation?: Recommendation;
}> {
  if (!onConflict) {
    return {
      passed: false,
      recommendation: {
        description: 'Upsert mode requires onConflict to be specified',
        example: "await agentImportTool({ mode: 'upsert', onConflict: 'id', ... });",
        priority: 'MEDIUM'
      }
    };
  }

  try {
    if (transport === 'pg') {
      const client = await getPgClient();
      const columns = Array.isArray(onConflict) ? onConflict : [onConflict];
      
      // Check if columns exist and have unique constraint
      for (const column of columns) {
        const result = await client.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1 
            AND column_name = $2
          )`,
          [table, column]
        );
        
        if (!result.rows[0].exists) {
          return {
            passed: false,
            recommendation: {
              description: `Column "${column}" does not exist in table "${table}"`,
              example: `ALTER TABLE ${table} ADD COLUMN ${column} ...;`,
              priority: 'HIGH'
            }
          };
        }
      }
    }

    return { passed: true };
  } catch (error: any) {
    logger.warn('Upsert readiness check failed', { error: error.message });
    // If we can't check, assume it's ready
    return { passed: true };
  }
}

/**
 * Auto-detects the primary key column for a table
 */
export async function detectPrimaryKey(
  table: string,
  transport: 'supabase' | 'pg' | 'auto' = 'supabase'
): Promise<string | string[] | null> {
  try {
    if (transport === 'pg') {
      const client = await getPgClient();
      const result = await client.query(
        `SELECT a.attname
         FROM pg_index i
         JOIN pg_attribute a ON a.attrelid = i.indrelid
         AND a.attnum = ANY(i.indkey)
         WHERE i.indrelid = $1::regclass
         AND i.indisprimary`,
        [table]
      );
      
      if (result.rows.length > 0) {
        const columns = result.rows.map(r => r.attname);
        return columns.length === 1 ? columns[0] : columns;
      }
    }
    
    // Default to 'id' if can't detect
    return 'id';
  } catch (error: any) {
    logger.warn('Primary key detection failed', { error: error.message });
    return 'id';
  }
}

/**
 * Checks if an RPC function exists
 */
async function checkRPCExists(functionName: string): Promise<{
  passed: boolean;
  recommendation?: Recommendation;
}> {
  try {
    const client = await getPgClient();
    const result = await client.query(
      `SELECT EXISTS (
        SELECT FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = $1
      )`,
      [functionName]
    );
    
    if (!result.rows[0].exists) {
      return {
        passed: false,
        recommendation: {
          description: `RPC function "${functionName}" does not exist`,
          example: functionName === 'exec_sql' 
            ? `CREATE OR REPLACE FUNCTION exec_sql(sql_script text)
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

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;`
            : `Create the "${functionName}" function in Supabase SQL Editor`,
          priority: 'HIGH'
        }
      };
    }

    return { passed: true };
  } catch (error: any) {
    logger.warn('RPC existence check failed', { error: error.message });
    return { passed: true }; // Assume it exists if we can't check
  }
}

/**
 * Checks if user has permissions for schema modifications
 */
async function checkPermissions(permission: string): Promise<{
  passed: boolean;
  recommendation?: Recommendation;
}> {
  try {
    const client = await getPgClient();
    
    // Check if we can create/modify schema objects
    if (permission === 'schema_modify') {
      const result = await client.query(
        `SELECT has_schema_privilege(current_user, 'public', 'CREATE') as can_create`
      );
      
      if (!result.rows[0].can_create) {
        return {
          passed: false,
          recommendation: {
            description: 'Insufficient permissions to modify schema',
            example: 'Use service role key or grant CREATE privileges on schema public',
            priority: 'HIGH'
          }
        };
      }
    }

    return { passed: true };
  } catch (error: any) {
    logger.warn('Permission check failed', { error: error.message });
    return { passed: true }; // Assume permissions are OK if we can't check
  }
}

/**
 * Runs preflight checks for schema operations
 */
export async function preflightSchemaOperation(params: {
  operation: string;
  table?: string;
  transport?: 'supabase' | 'pg' | 'auto';
}): Promise<PreflightResult> {
  const { operation, table, transport = 'pg' } = params;
  const issues: string[] = [];
  const recommendations: Recommendation[] = [];

  logger.info('Running schema operation preflight checks', { operation, table, transport });

  // Check 1: Environment variables
  const envCheck = await checkEnvironmentVariables(transport);
  if (!envCheck.passed && envCheck.recommendation) {
    issues.push('Missing environment variables');
    recommendations.push(envCheck.recommendation);
  }

  // Check 2: Service role key
  const serviceRoleCheck = await checkServiceRoleKey();
  if (!serviceRoleCheck.passed && serviceRoleCheck.recommendation) {
    issues.push('Service role key issue');
    recommendations.push(serviceRoleCheck.recommendation);
  }

  // Check 3: RPC function exists (for operations that might use RPC)
  if (operation === 'introspect' || operation === 'ddl') {
    const rpcCheck = await checkRPCExists('exec_sql');
    if (!rpcCheck.passed && rpcCheck.recommendation) {
      // RPC is optional, so just add as recommendation
      recommendations.push({
        ...rpcCheck.recommendation,
        priority: 'MEDIUM'
      });
    }
  }

  // Check 4: Schema modification permissions
  if (operation === 'ddl' || operation.startsWith('index_')) {
    const permCheck = await checkPermissions('schema_modify');
    if (!permCheck.passed && permCheck.recommendation) {
      issues.push('Insufficient schema permissions');
      recommendations.push(permCheck.recommendation);
    }
  }

  // Check 5: Table exists (if table is specified)
  if (table) {
    const tableCheck = await checkTableExists(table, transport);
    if (!tableCheck.passed && tableCheck.recommendation) {
      // For introspection, table not existing is OK
      if (operation !== 'introspect') {
        issues.push(`Table "${table}" not found`);
        recommendations.push(tableCheck.recommendation);
      }
    }
  }

  // Close pg client if opened
  if (transport === 'pg') {
    await closePgClient();
  }

  const ok = issues.length === 0;
  
  logger.info('Schema operation preflight checks completed', { ok, issuesCount: issues.length });

  return {
    ok,
    issues,
    recommendations
  };
}

/**
 * Runs all preflight checks
 */
export async function agentPreflight(params: {
  table: string;
  mode?: 'insert' | 'upsert';
  onConflict?: string | string[];
  transport?: 'supabase' | 'pg' | 'auto';
}): Promise<PreflightResult> {
  const { table, mode = 'insert', onConflict, transport = 'supabase' } = params;
  const issues: string[] = [];
  const recommendations: Recommendation[] = [];

  logger.info('Running preflight checks', { table, mode, transport });

  // Check 1: Environment variables
  const envCheck = await checkEnvironmentVariables(transport);
  if (!envCheck.passed && envCheck.recommendation) {
    issues.push('Missing environment variables');
    recommendations.push(envCheck.recommendation);
  }

  // Check 2: Service role key (only for supabase transport)
  if (transport === 'supabase' || transport === 'auto') {
    const serviceRoleCheck = await checkServiceRoleKey();
    if (!serviceRoleCheck.passed && serviceRoleCheck.recommendation) {
      issues.push('Service role key issue');
      recommendations.push(serviceRoleCheck.recommendation);
    }
  }

  // Check 3: Table exists
  const tableCheck = await checkTableExists(table, transport);
  if (!tableCheck.passed && tableCheck.recommendation) {
    issues.push(`Table "${table}" not found`);
    recommendations.push(tableCheck.recommendation);
  }

  // Check 4: Upsert readiness (only if mode is upsert)
  if (mode === 'upsert') {
    const upsertCheck = await checkUpsertReadiness(table, onConflict, transport);
    if (!upsertCheck.passed && upsertCheck.recommendation) {
      issues.push('Upsert configuration incomplete');
      recommendations.push(upsertCheck.recommendation);
    }
  }

  // Close pg client if opened
  if (transport === 'pg') {
    await closePgClient();
  }

  const ok = issues.length === 0;
  
  logger.info('Preflight checks completed', { ok, issuesCount: issues.length });

  return {
    ok,
    issues,
    recommendations
  };
}

