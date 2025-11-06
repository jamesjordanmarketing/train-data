#!/usr/bin/env tsx

import { migrationManager } from '@/lib/services/migration-manager';
import { createClient } from '@/lib/supabase/server';
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface CLIOptions {
  command: 'status' | 'up' | 'down' | 'create';
  version?: number;
  description?: string;
  steps?: number;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  switch (options.command) {
    case 'status':
      await showStatus();
      break;
    case 'up':
      await migrateUp(options.version);
      break;
    case 'down':
      await migrateDown(options.steps || 1);
      break;
    case 'create':
      await createMigration(options.description!);
      break;
    default:
      showHelp();
  }
}

async function showStatus() {
  console.log('Migration Status:\n');
  
  const currentVersion = await migrationManager.getCurrentVersion();
  console.log(`Current Version: ${currentVersion}\n`);
  
  const applied = await migrationManager.getAppliedMigrations();
  console.log('Applied Migrations:');
  if (applied.length === 0) {
    console.log('  No migrations applied yet');
  } else {
    applied.forEach(m => {
      console.log(`  ${m.version}: ${m.description} (${m.applied_at})`);
    });
  }
}

async function migrateUp(targetVersion?: number) {
  console.log('Running migrations...\n');
  
  const currentVersion = await migrationManager.getCurrentVersion();
  console.log(`Current version: ${currentVersion}`);
  
  // In a real implementation, you would:
  // 1. Read migration files from disk
  // 2. Filter migrations > currentVersion
  // 3. Sort by version
  // 4. Execute each migration
  // 5. Record in schema_migrations table
  
  // Example implementation:
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  
  if (!existsSync(migrationsDir)) {
    console.log('No migrations directory found at:', migrationsDir);
    return;
  }
  
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  console.log(`Found ${files.length} migration file(s)`);
  
  for (const file of files) {
    const version = parseInt(file.split('_')[0]);
    
    if (version > currentVersion && (!targetVersion || version <= targetVersion)) {
      console.log(`Would apply migration: ${file}`);
      // In production: execute SQL, record migration
    }
  }
  
  console.log('\nMigration complete!');
  console.log('Note: This is a simplified implementation.');
  console.log('In production, this would execute the SQL scripts and record them.');
}

async function migrateDown(steps: number) {
  console.log(`Rolling back ${steps} migration(s)...\n`);
  
  const applied = await migrationManager.getAppliedMigrations();
  const toRollback = applied.slice(-steps).reverse();
  
  console.log('Would rollback:');
  toRollback.forEach(m => {
    console.log(`  ${m.version}: ${m.description}`);
  });
  
  // In a real implementation, you would:
  // 1. Get last N applied migrations
  // 2. Execute down scripts in reverse order
  // 3. Remove from schema_migrations table
  
  console.log('\nRollback complete!');
  console.log('Note: This is a simplified implementation.');
  console.log('In production, this would execute the DOWN scripts and remove records.');
}

async function createMigration(description: string) {
  if (!description) {
    console.error('Error: Description is required');
    console.log('Usage: tsx src/scripts/migrate.ts create --description "Your migration description"');
    process.exit(1);
  }

  const version = Date.now(); // Use timestamp as version
  const filename = `${version}_${description.toLowerCase().replace(/\s+/g, '_')}.sql`;
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  
  // Ensure migrations directory exists
  if (!existsSync(migrationsDir)) {
    mkdirSync(migrationsDir, { recursive: true });
  }
  
  const filepath = join(migrationsDir, filename);
  
  console.log(`Creating migration: ${filename}`);
  
  // Generate migration template
  const { generateMigrationTemplate } = await import('@/lib/services/migration-utils');
  const template = generateMigrationTemplate({ version, description });
  
  // Write to file
  writeFileSync(filepath, template, 'utf8');
  
  console.log('Migration template generated at:', filepath);
  console.log('\nNext steps:');
  console.log('1. Edit the migration file with your SQL changes');
  console.log('2. Test in development: tsx src/scripts/migrate.ts up');
  console.log('3. Test rollback: tsx src/scripts/migrate.ts down --steps 1');
}

function parseArgs(args: string[]): CLIOptions {
  // Simple argument parsing (use a library like 'commander' in production)
  const command = args[0] as CLIOptions['command'];
  
  return {
    command,
    version: args.includes('--version') ? parseInt(args[args.indexOf('--version') + 1]) : undefined,
    description: args.includes('--description') ? args.slice(args.indexOf('--description') + 1).join(' ') : undefined,
    steps: args.includes('--steps') ? parseInt(args[args.indexOf('--steps') + 1]) : undefined,
  };
}

function showHelp() {
  console.log(`
Migration CLI Tool

Usage:
  tsx src/scripts/migrate.ts <command> [options]

Commands:
  status              Show current migration status
  up                  Run pending migrations
  down --steps N      Rollback N migrations
  create --description "Add new column"  Create new migration

Examples:
  tsx src/scripts/migrate.ts status
  tsx src/scripts/migrate.ts up
  tsx src/scripts/migrate.ts down --steps 1
  tsx src/scripts/migrate.ts create --description "Add user preferences"
  `);
}

main().catch(console.error);

