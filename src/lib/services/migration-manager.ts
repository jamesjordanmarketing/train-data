import { createClient } from '@/lib/supabase';
import { createHash } from 'crypto';

interface Migration {
  version: number;
  description: string;
  applied_at?: string;
  applied_by?: string;
  execution_time_ms?: number;
  checksum?: string;
}

interface MigrationScript {
  version: number;
  description: string;
  up: string;
  down: string;
}

export class MigrationManager {
  private supabase = createClient();

  /**
   * Get current schema version
   */
  async getCurrentVersion(): Promise<number> {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('version')
      .order('version', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Failed to get current version:', error);
      return 0;
    }

    return data?.[0]?.version || 0;
  }

  /**
   * Get all applied migrations
   */
  async getAppliedMigrations(): Promise<Migration[]> {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('*')
      .order('version', { ascending: true });

    if (error) {
      console.error('Failed to get applied migrations:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if migration has been applied
   */
  async isMigrationApplied(version: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('version')
      .eq('version', version)
      .single();

    return !!data && !error;
  }

  /**
   * Record migration as applied
   */
  async recordMigration(params: {
    version: number;
    description: string;
    executionTimeMs: number;
    checksum: string;
    appliedBy?: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('schema_migrations')
      .insert({
        version: params.version,
        description: params.description,
        execution_time_ms: params.executionTimeMs,
        checksum: params.checksum,
        applied_by: params.appliedBy,
      });

    if (error) {
      throw new Error(`Failed to record migration: ${error.message}`);
    }
  }

  /**
   * Remove migration record (for rollback)
   */
  async removeMigration(version: number): Promise<void> {
    const { error } = await this.supabase
      .from('schema_migrations')
      .delete()
      .eq('version', version);

    if (error) {
      throw new Error(`Failed to remove migration: ${error.message}`);
    }
  }

  /**
   * Calculate checksum of migration script
   */
  calculateChecksum(script: string): string {
    return createHash('md5').update(script).digest('hex');
  }

  /**
   * Validate migration script
   */
  validateMigration(migration: MigrationScript): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (migration.version <= 0) {
      errors.push('Version must be positive');
    }

    if (!migration.description) {
      errors.push('Description is required');
    }

    if (!migration.up || migration.up.trim().length === 0) {
      errors.push('Up migration script is required');
    }

    if (!migration.down || migration.down.trim().length === 0) {
      errors.push('Down migration script is required');
    }

    // Check for dangerous operations
    const dangerousPatterns = [
      /DROP\s+TABLE/i,
      /TRUNCATE/i,
      /DELETE\s+FROM.*WHERE\s+1=1/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(migration.up)) {
        errors.push(`Dangerous operation detected: ${pattern.source}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const migrationManager = new MigrationManager();

