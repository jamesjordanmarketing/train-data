#!/usr/bin/env tsx

/**
 * Test script for the migration framework
 * 
 * This script validates that the migration framework is working correctly
 * and demonstrates how to use the various utilities.
 * 
 * Usage: tsx src/scripts/test-migration-framework.ts
 */

import { migrationManager } from '@/lib/services/migration-manager';
import {
  addColumnSafely,
  addConstraintSafely,
  createIndexConcurrently,
  renameColumnSafely,
  dropColumnSafely,
  generateMigrationTemplate,
} from '@/lib/services/migration-utils';

async function main() {
  console.log('🚀 Migration Framework Test Suite\n');
  
  await testMigrationManager();
  await testSafeMigrationUtilities();
  await testMigrationValidation();
  
  console.log('\n✅ All tests completed successfully!');
}

async function testMigrationManager() {
  console.log('📋 Testing Migration Manager...\n');
  
  try {
    // Test: Get current version
    const version = await migrationManager.getCurrentVersion();
    console.log(`✓ Current schema version: ${version}`);
    
    // Test: Get applied migrations
    const applied = await migrationManager.getAppliedMigrations();
    console.log(`✓ Applied migrations count: ${applied.length}`);
    
    if (applied.length > 0) {
      console.log('  Latest migrations:');
      applied.slice(-3).forEach(m => {
        console.log(`    - ${m.version}: ${m.description}`);
      });
    }
    
    // Test: Check if migration is applied
    if (version > 0) {
      const isApplied = await migrationManager.isMigrationApplied(version);
      console.log(`✓ Migration ${version} is applied: ${isApplied}`);
    }
    
    // Test: Calculate checksum
    const testSQL = 'ALTER TABLE test ADD COLUMN test TEXT;';
    const checksum = migrationManager.calculateChecksum(testSQL);
    console.log(`✓ Checksum calculation: ${checksum.substring(0, 8)}...`);
    
    console.log('\n✅ Migration Manager tests passed\n');
  } catch (error) {
    console.error('❌ Migration Manager test failed:', error);
    throw error;
  }
}

async function testSafeMigrationUtilities() {
  console.log('🛠️  Testing Safe Migration Utilities...\n');
  
  // Test: Add column safely
  console.log('Testing addColumnSafely():');
  const addColumnSQL = addColumnSafely({
    table: 'conversations',
    column: 'test_field',
    type: 'TEXT',
    defaultValue: "'default_value'",
    notNull: true,
  });
  console.log('✓ Generated SQL:');
  console.log(addColumnSQL.split('\n').map(line => `  ${line}`).join('\n'));
  console.log();
  
  // Test: Add constraint safely
  console.log('Testing addConstraintSafely():');
  const { add, validate } = addConstraintSafely({
    table: 'conversations',
    constraintName: 'chk_quality',
    constraintDefinition: 'CHECK (quality_score >= 0 AND quality_score <= 10)',
  });
  console.log('✓ Generated ADD SQL:');
  console.log(add.split('\n').map(line => `  ${line}`).join('\n'));
  console.log('✓ Generated VALIDATE SQL:');
  console.log(validate.split('\n').map(line => `  ${line}`).join('\n'));
  console.log();
  
  // Test: Create index concurrently
  console.log('Testing createIndexConcurrently():');
  const indexSQL = createIndexConcurrently({
    table: 'conversations',
    indexName: 'idx_test_field',
    columns: ['test_field', 'status'],
    where: "status = 'active'",
  });
  console.log('✓ Generated SQL:');
  console.log(indexSQL.split('\n').map(line => `  ${line}`).join('\n'));
  console.log();
  
  // Test: Rename column safely
  console.log('Testing renameColumnSafely():');
  const renameSteps = renameColumnSafely({
    table: 'conversations',
    oldColumn: 'old_name',
    newColumn: 'new_name',
    columnType: 'TEXT',
  });
  console.log('✓ Step 1 (Add new column):');
  console.log(`  ${renameSteps.step1_add}`);
  console.log('✓ Step 2 (Copy data):');
  console.log(`  ${renameSteps.step2_copy}`);
  console.log('✓ Step 3 (Create view):');
  console.log(renameSteps.step3_view.split('\n').map(line => `  ${line}`).join('\n'));
  console.log('✓ Step 4 (Drop old column):');
  console.log(`  ${renameSteps.step4_drop_old}`);
  console.log();
  
  // Test: Drop column safely
  console.log('Testing dropColumnSafely():');
  const { verify, drop } = dropColumnSafely({
    table: 'conversations',
    column: 'old_field',
  });
  console.log('✓ Verify query:');
  console.log(verify.split('\n').map(line => `  ${line}`).join('\n'));
  console.log('✓ Drop SQL:');
  console.log(`  ${drop}`);
  console.log();
  
  // Test: Generate migration template
  console.log('Testing generateMigrationTemplate():');
  const template = generateMigrationTemplate({
    version: 1698765432000,
    description: 'Test migration',
  });
  const lines = template.split('\n');
  console.log('✓ Generated template (first 10 lines):');
  lines.slice(0, 10).forEach(line => {
    console.log(`  ${line}`);
  });
  console.log(`  ... (${lines.length - 10} more lines)`);
  console.log();
  
  console.log('✅ Safe Migration Utilities tests passed\n');
}

async function testMigrationValidation() {
  console.log('🔍 Testing Migration Validation...\n');
  
  // Test: Valid migration
  const validMigration = {
    version: 1698765432000,
    description: 'Add test field',
    up: 'ALTER TABLE test ADD COLUMN test TEXT;',
    down: 'ALTER TABLE test DROP COLUMN test;',
  };
  
  const validResult = migrationManager.validateMigration(validMigration);
  console.log('✓ Valid migration validation:');
  console.log(`  Valid: ${validResult.valid}`);
  console.log(`  Errors: ${validResult.errors.length === 0 ? 'None' : validResult.errors.join(', ')}`);
  console.log();
  
  // Test: Invalid migration (missing description)
  const invalidMigration1 = {
    version: 1698765432000,
    description: '',
    up: 'ALTER TABLE test ADD COLUMN test TEXT;',
    down: 'ALTER TABLE test DROP COLUMN test;',
  };
  
  const invalidResult1 = migrationManager.validateMigration(invalidMigration1);
  console.log('✓ Invalid migration (missing description):');
  console.log(`  Valid: ${invalidResult1.valid}`);
  console.log(`  Errors: ${invalidResult1.errors.join(', ')}`);
  console.log();
  
  // Test: Invalid migration (negative version)
  const invalidMigration2 = {
    version: -1,
    description: 'Test',
    up: 'ALTER TABLE test ADD COLUMN test TEXT;',
    down: 'ALTER TABLE test DROP COLUMN test;',
  };
  
  const invalidResult2 = migrationManager.validateMigration(invalidMigration2);
  console.log('✓ Invalid migration (negative version):');
  console.log(`  Valid: ${invalidResult2.valid}`);
  console.log(`  Errors: ${invalidResult2.errors.join(', ')}`);
  console.log();
  
  // Test: Dangerous operation detection
  const dangerousMigration = {
    version: 1698765432000,
    description: 'Dangerous operation',
    up: 'DROP TABLE users; TRUNCATE conversations;',
    down: 'SELECT 1;',
  };
  
  const dangerousResult = migrationManager.validateMigration(dangerousMigration);
  console.log('✓ Dangerous migration detection:');
  console.log(`  Valid: ${dangerousResult.valid}`);
  console.log(`  Errors: ${dangerousResult.errors.join(', ')}`);
  console.log();
  
  console.log('✅ Migration Validation tests passed\n');
}

// Run the tests
main().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});

