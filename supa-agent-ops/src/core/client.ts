/**
 * Client initialization for Supabase and PostgreSQL
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Client as PgClient } from 'pg';
import { loadEnvironmentConfig, validateEnvironmentConfig } from './config';

let supabaseClientInstance: SupabaseClient | null = null;
let pgClientInstance: PgClient | null = null;

/**
 * Initializes and returns a Supabase client with Service Role key
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const env = loadEnvironmentConfig();
  
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error(
      'Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  supabaseClientInstance = createClient(
    env.supabaseUrl,
    env.supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

  return supabaseClientInstance;
}

/**
 * Initializes and returns a PostgreSQL client
 */
export async function getPgClient(): Promise<PgClient> {
  if (pgClientInstance && (pgClientInstance as any)._connected) {
    return pgClientInstance;
  }

  const env = loadEnvironmentConfig();

  if (!env.databaseUrl) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }

  pgClientInstance = new PgClient({
    connectionString: env.databaseUrl,
    ssl: env.databaseUrl.includes('sslmode=require') 
      ? { rejectUnauthorized: false }
      : undefined
  });

  await pgClientInstance.connect();
  return pgClientInstance;
}

/**
 * Closes the PostgreSQL client connection
 */
export async function closePgClient(): Promise<void> {
  if (pgClientInstance) {
    await pgClientInstance.end();
    pgClientInstance = null;
  }
}

/**
 * Resets all client instances (useful for testing)
 */
export function resetClients(): void {
  supabaseClientInstance = null;
  if (pgClientInstance) {
    pgClientInstance.end().catch(() => {});
    pgClientInstance = null;
  }
}

/**
 * Checks if environment is properly configured for the given transport
 */
export function isConfigured(transport: 'supabase' | 'pg' | 'auto'): boolean {
  const env = loadEnvironmentConfig();
  const validation = validateEnvironmentConfig(env, transport);
  return validation.valid;
}

