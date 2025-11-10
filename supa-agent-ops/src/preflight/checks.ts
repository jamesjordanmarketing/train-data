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

