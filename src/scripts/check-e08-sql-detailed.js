#!/usr/bin/env node

/**
 * E08 SQL Table Checker - Settings & Administration Module
 * 
 * Checks implementation status of tables, triggers, indexes, and functions
 * for the Settings & Administration Module (E08)
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const { createClient } = require('@supabase/supabase-js');
const client = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

// Expected tables from E08 execution files
const E08_TABLES = {
  'user_preferences': {
    description: 'Stores user-specific preference settings with JSONB',
    source: 'E08 Prompt 1 - User Preferences Foundation',
    keyColumns: ['id', 'user_id', 'preferences', 'created_at', 'updated_at'],
    indexes: ['idx_user_preferences_user_id', 'idx_user_preferences_created_at', 'idx_user_preferences_jsonb'],
    constraints: ['user_preferences_user_id_unique'],
    triggers: ['update_user_preferences_updated_at', 'initialize_user_preferences_on_signup'],
    rlsPolicies: ['Users can view own preferences', 'Users can update own preferences', 'Users can insert own preferences']
  },
  'ai_configurations': {
    description: 'Stores AI generation configuration with user/org level overrides',
    source: 'E08 Prompt 2 - AI Configuration Foundation',
    keyColumns: ['id', 'user_id', 'organization_id', 'config_name', 'configuration', 'is_active', 'priority', 'created_at', 'updated_at', 'created_by'],
    indexes: ['idx_ai_configurations_user_id', 'idx_ai_configurations_org_id', 'idx_ai_configurations_is_active', 'idx_ai_configurations_jsonb', 'idx_ai_configurations_created_at'],
    constraints: ['ai_configurations_user_or_org_check', 'ai_configurations_user_config_name_unique', 'ai_configurations_org_config_name_unique'],
    triggers: ['update_ai_configurations_updated_at', 'ai_configuration_audit_trigger'],
    rlsPolicies: ['Users can view own AI configs', 'Users can update own AI configs', 'Users can insert own AI configs', 'Users can delete own AI configs']
  },
  'ai_configuration_audit': {
    description: 'Audit log for AI configuration changes',
    source: 'E08 Prompt 2 - AI Configuration Foundation',
    keyColumns: ['id', 'config_id', 'action', 'changed_by', 'old_values', 'new_values', 'change_reason', 'created_at'],
    indexes: ['idx_ai_config_audit_config_id', 'idx_ai_config_audit_changed_by', 'idx_ai_config_audit_created_at', 'idx_ai_config_audit_action'],
    constraints: [],
    triggers: [],
    rlsPolicies: ['Users can view AI config audit logs']
  },
  'maintenance_operations': {
    description: 'Tracks database maintenance operations (VACUUM, ANALYZE, REINDEX)',
    source: 'E08 Prompt 3 - Database Health Monitoring',
    keyColumns: ['id', 'operation_type', 'table_name', 'index_name', 'started_at', 'completed_at', 'duration_ms', 'status', 'initiated_by', 'error_message', 'options', 'created_at'],
    indexes: ['idx_maintenance_ops_table_name', 'idx_maintenance_ops_operation_type', 'idx_maintenance_ops_status', 'idx_maintenance_ops_started_at', 'idx_maintenance_ops_created_at'],
    constraints: [],
    triggers: [],
    rlsPolicies: ['Authenticated users can view maintenance operations', 'Admins can insert maintenance operations']
  },
  'configuration_audit_log': {
    description: 'Unified audit trail for all configuration changes',
    source: 'E08 Prompt 4 - Configuration Change Management',
    keyColumns: ['id', 'config_type', 'config_id', 'changed_by', 'changed_at', 'old_values', 'new_values', 'change_reason', 'client_ip', 'user_agent'],
    indexes: ['idx_config_audit_config_type', 'idx_config_audit_config_id', 'idx_config_audit_changed_by', 'idx_config_audit_changed_at', 'idx_config_audit_old_values', 'idx_config_audit_new_values'],
    constraints: ['config_audit_log_type_check'],
    triggers: ['user_preferences_audit_trigger'],
    rlsPolicies: ['Users can view own configuration audit logs', 'No updates to audit log', 'No deletes from audit log']
  }
};

// Expected database functions
const E08_FUNCTIONS = [
  {
    name: 'update_updated_at_column',
    description: 'Updates updated_at timestamp on row update',
    source: 'E08 Prompt 1 - User Preferences Foundation'
  },
  {
    name: 'initialize_user_preferences',
    description: 'Creates default preferences for new users',
    source: 'E08 Prompt 1 - User Preferences Foundation'
  },
  {
    name: 'log_ai_config_changes',
    description: 'Logs AI configuration changes to audit table',
    source: 'E08 Prompt 2 - AI Configuration Foundation'
  },
  {
    name: 'get_effective_ai_config',
    description: 'Gets effective AI config with fallback chain',
    source: 'E08 Prompt 2 - AI Configuration Foundation'
  },
  {
    name: 'log_user_preferences_changes',
    description: 'Logs user preference changes to audit log',
    source: 'E08 Prompt 4 - Configuration Change Management'
  }
];

async function checkTableExists(tableName) {
  try {
    const { data, error } = await client.from(tableName).select('*').limit(0);
    if (error) {
      if (error.message.includes('does not exist')) {
        return false;
      }
      // Other errors might indicate RLS or permissions, but table exists
      return true;
    }
    return true;
  } catch (err) {
    return false;
  }
}

async function checkIndexExists(indexName) {
  // Can't easily check indexes without RPC, return unknown
  return 'unknown';
}

async function checkFunctionExists(functionName) {
  // Can't easily check functions without RPC, return unknown
  return 'unknown';
}

async function analyzeTable(tableName, tableConfig) {
  const exists = await checkTableExists(tableName);
  
  if (!exists) {
    return {
      table: tableName,
      description: tableConfig.description,
      source: tableConfig.source,
      exists: false,
      category: 4,
      categoryDescription: "Table doesn't exist at all",
      expectedColumns: tableConfig.keyColumns,
      expectedIndexes: tableConfig.indexes,
      expectedTriggers: tableConfig.triggers,
      expectedRLS: tableConfig.rlsPolicies,
      recommendation: `Run the SQL migration from ${tableConfig.source}`,
      sqlLocation: 'See 04-FR-wireframes-execution-E08.md for SQL script'
    };
  }

  // Table exists, but we can't verify detailed structure without more complex queries
  return {
    table: tableName,
    description: tableConfig.description,
    source: tableConfig.source,
    exists: true,
    category: 2,
    categoryDescription: "Table exists but needs manual verification of fields/triggers",
    expectedColumns: tableConfig.keyColumns,
    expectedIndexes: tableConfig.indexes,
    expectedTriggers: tableConfig.triggers,
    expectedRLS: tableConfig.rlsPolicies,
    recommendation: `Manually verify table structure using SQL verification queries`,
    sqlVerification: generateVerificationSQL(tableName, tableConfig)
  };
}

function generateVerificationSQL(tableName, tableConfig) {
  return {
    columns: `
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = '${tableName}'
ORDER BY ordinal_position;`,
    indexes: `
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = '${tableName}';`,
    constraints: `
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = '${tableName}'::regclass;`,
    triggers: `
SELECT tgname, pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgrelid = '${tableName}'::regclass AND tgname NOT LIKE 'RI_%';`,
    rlsPolicies: `
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = '${tableName}';`
  };
}

async function main() {
  console.log('🔍 E08 SQL Implementation Check');
  console.log('Settings & Administration Module');
  console.log('='.repeat(80));
  console.log('NOTE: This script checks table existence. For detailed verification,');
  console.log('      use the provided SQL queries in the generated markdown report\n');
  console.log('='.repeat(80));
  
  const results = [];
  
  // Check tables
  console.log('\n📊 Checking Tables...\n');
  for (const [tableName, tableConfig] of Object.entries(E08_TABLES)) {
    console.log(`Checking: ${tableName}...`);
    const result = await analyzeTable(tableName, tableConfig);
    results.push(result);
    
    const status = result.exists ? '✅ EXISTS' : '❌ MISSING';
    console.log(`  Status: ${status}`);
    console.log(`  Category: ${result.category} - ${result.categoryDescription}`);
    console.log(`  Source: ${result.source}`);
  }
  
  // Check functions
  console.log('\n\n🔧 Database Functions to Verify:\n');
  const functionResults = [];
  for (const func of E08_FUNCTIONS) {
    console.log(`  - ${func.name}`);
    console.log(`    Description: ${func.description}`);
    console.log(`    Source: ${func.source}`);
    functionResults.push(func);
  }
  
  // Generate summary
  const existingTables = results.filter(r => r.exists);
  const missingTables = results.filter(r => !r.exists);
  
  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(80));
  console.log(`Total tables checked: ${results.length}`);
  console.log(`Tables that exist: ${existingTables.length}`);
  console.log(`Tables missing: ${missingTables.length}`);
  
  if (existingTables.length > 0) {
    console.log('\n✅ Existing tables (need verification):');
    existingTables.forEach(r => console.log(`   - ${r.table}`));
  }
  
  if (missingTables.length > 0) {
    console.log('\n❌ Missing tables (need to run SQL):');
    missingTables.forEach(r => console.log(`   - ${r.table}`));
  }
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(results, functionResults, {
    total: results.length,
    existing: existingTables.length,
    missing: missingTables.length
  });
  
  const outputPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E08-sql-check.md');
  fs.writeFileSync(outputPath, markdownReport);
  
  console.log(`\n💾 Detailed report saved to: ${outputPath}`);
}

function generateMarkdownReport(results, functionResults, summary) {
  let md = `# E08 SQL Implementation Check Report
**Generated**: ${new Date().toISOString()}  
**Module**: Settings & Administration Module (E08)  
**Total Tables**: ${summary.total}  
**Existing Tables**: ${summary.existing}  
**Missing Tables**: ${summary.missing}

---

## Executive Summary

This report analyzes the database implementation status for the Settings & Administration Module (E08). The module requires ${summary.total} core tables for user preferences, AI configuration, database monitoring, and audit trails.

`;

  // Category summary
  const category1 = results.filter(r => r.category === 1);
  const category2 = results.filter(r => r.category === 2);
  const category3 = results.filter(r => r.category === 3);
  const category4 = results.filter(r => r.category === 4);

  md += `### Implementation Status by Category

- **Category 1** (Fully Implemented): ${category1.length} tables
- **Category 2** (Exists, Needs Verification): ${category2.length} tables
- **Category 3** (Exists, Wrong Purpose): ${category3.length} tables
- **Category 4** (Missing Entirely): ${category4.length} tables

`;

  // Detailed table analysis
  md += `---

## Detailed Table Analysis

`;

  for (const result of results) {
    const statusIcon = result.exists ? '✅' : '❌';
    const categoryLabel = getCategoryLabel(result.category);
    
    md += `### ${statusIcon} \`${result.table}\`

**Status**: ${result.exists ? 'EXISTS' : 'MISSING'}  
**Category**: ${result.category} - ${categoryLabel}  
**Source**: ${result.source}  
**Description**: ${result.description}

`;

    if (result.exists) {
      md += `#### Expected Schema Components

**Columns** (${result.expectedColumns.length}):
\`\`\`
${result.expectedColumns.join(', ')}
\`\`\`

**Indexes** (${result.expectedIndexes.length}):
${result.expectedIndexes.map(idx => `- \`${idx}\``).join('\n')}

**Triggers** (${result.expectedTriggers.length}):
${result.expectedTriggers.map(trg => `- \`${trg}\``).join('\n')}

**RLS Policies** (${result.expectedRLS.length}):
${result.expectedRLS.map(pol => `- "${pol}"`).join('\n')}

#### Verification Queries

Run these queries in Supabase SQL Editor to verify implementation:

**Check Columns:**
\`\`\`sql
${result.sqlVerification.columns}
\`\`\`

**Check Indexes:**
\`\`\`sql
${result.sqlVerification.indexes}
\`\`\`

**Check Constraints:**
\`\`\`sql
${result.sqlVerification.constraints}
\`\`\`

**Check Triggers:**
\`\`\`sql
${result.sqlVerification.triggers}
\`\`\`

**Check RLS Policies:**
\`\`\`sql
${result.sqlVerification.rlsPolicies}
\`\`\`

`;
    } else {
      md += `#### Required Components

**Must Create**:
- Table: \`${result.table}\`
- ${result.expectedColumns.length} columns
- ${result.expectedIndexes.length} indexes
- ${result.expectedTriggers.length} triggers
- ${result.expectedRLS.length} RLS policies

**SQL Location**: ${result.sqlLocation}

**Migration Steps**:
1. Locate SQL script in execution document
2. Copy SQL to Supabase SQL Editor
3. Execute migration
4. Verify with queries above

`;
    }

    md += `**Recommendation**: ${result.recommendation}

---

`;
  }

  // Database functions section
  md += `## Database Functions

The following PostgreSQL functions are required:

`;

  for (const func of functionResults) {
    md += `### 🔧 \`${func.name}\`

**Description**: ${func.description}  
**Source**: ${func.source}

**Verification Query**:
\`\`\`sql
SELECT proname, pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = '${func.name}';
\`\`\`

---

`;
  }

  // Comprehensive verification script
  md += `## Comprehensive Verification Script

Run this complete script in Supabase SQL Editor to verify all E08 components:

\`\`\`sql
-- ============================================================================
-- E08 Settings & Administration Module - Comprehensive Verification
-- ============================================================================

-- TABLE EXISTENCE CHECK
SELECT 
  '1. TABLE EXISTENCE' as verification_section,
  ${Object.keys(E08_TABLES).map(t => `EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${t}') AS ${t}_exists`).join(',\n  ')};

-- COLUMN COUNT CHECK
${Object.entries(E08_TABLES).map(([table, config]) => `
SELECT 
  '2. ${table.toUpperCase()} COLUMNS' as verification_section,
  COUNT(*) as actual_columns,
  ${config.keyColumns.length} as expected_key_columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = '${table}';`).join('\n')}

-- INDEX CHECK
${Object.entries(E08_TABLES).map(([table, config]) => `
SELECT 
  '3. ${table.toUpperCase()} INDEXES' as verification_section,
  COUNT(*) as actual_indexes,
  ${config.indexes.length} as expected_indexes
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = '${table}';`).join('\n')}

-- RLS POLICIES CHECK
${Object.entries(E08_TABLES).map(([table, config]) => `
SELECT 
  '4. ${table.toUpperCase()} RLS POLICIES' as verification_section,
  COUNT(*) as actual_policies,
  ${config.rlsPolicies.length} as expected_policies
FROM pg_policies
WHERE schemaname = 'public' AND tablename = '${table}';`).join('\n')}

-- TRIGGER CHECK
${Object.entries(E08_TABLES).map(([table, config]) => `
SELECT 
  '5. ${table.toUpperCase()} TRIGGERS' as verification_section,
  COUNT(*) as actual_triggers,
  ${config.triggers.length} as expected_triggers
FROM pg_trigger
WHERE tgrelid = '${table}'::regclass AND tgname NOT LIKE 'RI_%';`).join('\n')}

-- FUNCTION CHECK
SELECT 
  '6. REQUIRED FUNCTIONS' as verification_section,
  ${functionResults.map(f => `EXISTS (SELECT FROM pg_proc WHERE proname = '${f.name}') AS ${f.name}_exists`).join(',\n  ')};

-- FINAL ASSESSMENT
SELECT 
  '7. 🎯 OVERALL STATUS' as verification_section,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (${Object.keys(E08_TABLES).map(t => `'${t}'`).join(', ')})) = ${Object.keys(E08_TABLES).length}
    THEN '✅ All tables exist'
    ELSE '❌ Some tables missing'
  END as table_status,
  CASE
    WHEN (SELECT COUNT(*) FROM pg_proc WHERE proname IN (${functionResults.map(f => `'${f.name}'`).join(', ')})) = ${functionResults.length}
    THEN '✅ All functions exist'
    ELSE '⚠️ Some functions missing'
  END as function_status;
\`\`\`

`;

  // Next steps
  md += `## Next Steps

`;

  if (summary.missing > 0) {
    md += `### ❌ Missing Tables (Priority: HIGH)

The following tables are completely missing and must be created:

${results.filter(r => !r.exists).map(r => `
#### ${r.table}
- **Source**: ${r.source}
- **Action**: Run SQL migration script
- **File**: \`04-FR-wireframes-execution-E08.md\`
`).join('\n')}

**Steps to Resolve**:
1. Open \`04-FR-wireframes-execution-E08.md\`
2. Locate SQL script for each missing table
3. Copy SQL to Supabase SQL Editor
4. Execute migration
5. Re-run this check script

`;
  }

  if (summary.existing > 0) {
    md += `### ✅ Existing Tables (Priority: MEDIUM)

The following tables exist but need detailed verification:

${results.filter(r => r.exists).map(r => `- \`${r.table}\` - Verify columns, indexes, triggers, and RLS policies`).join('\n')}

**Verification Steps**:
1. Use the SQL queries provided in each table section above
2. Compare actual implementation with expected schema
3. Check for missing columns, indexes, or triggers
4. Verify RLS policies are correctly configured
5. Test CRUD operations

`;
  }

  md += `## SQL Migration Reference

All SQL scripts are located in:
- **Main File**: \`pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E08.md\`
- **Part 2**: \`pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E08-part2.md\`
- **Part 3**: \`pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E08-part3.md\`
- **Part 4**: \`pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E08-part4.md\`

### Migration Order

Execute migrations in this order:
1. **user_preferences** table (lines 173-280 in E08.md)
2. **ai_configurations** table (lines 289-486 in E08.md)
3. **maintenance_operations** table (lines 495-538 in E08.md)
4. **configuration_audit_log** table (lines 547-629 in E08.md)

---

**Report Generated**: ${new Date().toLocaleString()}  
**Script**: \`src/scripts/check-e08-sql-detailed.js\`
`;

  return md;
}

function getCategoryLabel(category) {
  const labels = {
    1: 'Fully Implemented - No Changes Needed',
    2: 'Exists But Needs Verification/Completion',
    3: 'Exists For Different Purpose - Review Required',
    4: "Doesn't Exist - SQL Migration Required"
  };
  return labels[category] || 'Unknown';
}

main().catch(console.error);

