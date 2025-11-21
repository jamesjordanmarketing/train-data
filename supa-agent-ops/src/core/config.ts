/**
 * Configuration management for supa-agent-ops library
 */

import { LibraryConfig, CharacterValidationConfig } from './types';

export const DEFAULT_CHARACTER_VALIDATION_CONFIG: CharacterValidationConfig = {
  allowApostrophes: true,
  allowQuotes: true,
  allowBackslashes: true,
  allowNewlines: true,
  allowTabs: true,
  allowEmoji: true,
  allowControlChars: false,
  normalizeUnicode: 'NFC',
  stripInvalidUtf8: true,
  maxFieldLength: 1_000_000
};

export const DEFAULT_LIBRARY_CONFIG: LibraryConfig = {
  transport: 'supabase',
  batchSize: 200,
  concurrency: 2,
  retry: {
    maxAttempts: 2,
    backoffMs: 300
  },
  validation: DEFAULT_CHARACTER_VALIDATION_CONFIG,
  outputDir: './reports'
};

export interface EnvironmentConfig {
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  databaseUrl?: string;
}

/**
 * Loads configuration from environment variables
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  return {
    supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    databaseUrl: process.env.DATABASE_URL
  };
}

/**
 * Validates that required environment variables are present
 */
export function validateEnvironmentConfig(
  config: EnvironmentConfig,
  transport: 'supabase' | 'pg' | 'auto' = 'supabase'
): { valid: boolean; missingVars: string[] } {
  const missingVars: string[] = [];

  if (transport === 'supabase' || transport === 'auto') {
    if (!config.supabaseUrl) {
      missingVars.push('SUPABASE_URL');
    }
    if (!config.supabaseServiceRoleKey) {
      missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
    }
  }

  if (transport === 'pg') {
    if (!config.databaseUrl) {
      missingVars.push('DATABASE_URL');
    }
  }

  return {
    valid: missingVars.length === 0,
    missingVars
  };
}

/**
 * Merges user configuration with defaults
 */
export function mergeConfig(
  userConfig: Partial<LibraryConfig> = {}
): LibraryConfig {
  return {
    transport: userConfig.transport ?? DEFAULT_LIBRARY_CONFIG.transport,
    batchSize: userConfig.batchSize ?? DEFAULT_LIBRARY_CONFIG.batchSize,
    concurrency: userConfig.concurrency ?? DEFAULT_LIBRARY_CONFIG.concurrency,
    retry: {
      maxAttempts: userConfig.retry?.maxAttempts ?? DEFAULT_LIBRARY_CONFIG.retry.maxAttempts,
      backoffMs: userConfig.retry?.backoffMs ?? DEFAULT_LIBRARY_CONFIG.retry.backoffMs
    },
    validation: {
      ...DEFAULT_LIBRARY_CONFIG.validation,
      ...userConfig.validation
    },
    outputDir: userConfig.outputDir ?? DEFAULT_LIBRARY_CONFIG.outputDir
  };
}

