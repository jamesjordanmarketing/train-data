#!/usr/bin/env node

/**
 * E03 SQL Implementation Checker - Detailed Schema Analysis
 * 
 * Checks the implementation status of tables, indexes, triggers, and constraints
 * from the E03 execution files:
 * - 04-FR-wireframes-execution-E03.md (lines 192-514)
 * - 04-FR-wireframes-execution-E03b.md (lines 192-514)
 * - 04-FR-wireframes-execution-E03-addendum-1.md
 * 
 * Expected SQL from E03:
 * - conversations table (with comprehensive schema)
 * - conversation_turns table (normalized)
 * - conversation_status enum
 * - tier_type enum
 * - Multiple indexes for optimization
 * - Triggers for auto-update
 * - RLS policies
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

// Tables from E03 SQL script (lines 192-514 in execution files)
const E03_TABLES = {
  'conversations': {
    description: 'Store conversation metadata and status with full quality tracking',
    expectedColumns: [
      'id', 'conversation_id', 'document_id', 'chunk_id',
      'persona', 'emotion', 'topic', 'intent', 'tone', 'category',
      'tier', 'status', 'quality_score', 'total_turns', 'token_count',
      'parameters', 'quality_metrics', 'review_history',
      'parent_id', 'parent_type',
      'created_at', 'updated_at',
      'approved_by', 'approved_at'
    ],
    expectedIndexes: [
      'idx_conversations_status',
      'idx_conversations_tier',
      'idx_conversations_quality_score',
      'idx_conversations_created_at',
      'idx_conversations_updated_at',
      'idx_conversations_status_quality',
      'idx_conversations_tier_status',
      'idx_conversations_pending_review', // partial index
      'idx_conversations_text_search', // GIN full-text
      'idx_conversations_parameters', // GIN JSONB
      'idx_conversations_quality_metrics', // GIN JSONB
      'idx_conversations_category', // GIN array
      'idx_conversations_document_id',
      'idx_conversations_chunk_id',
      'idx_conversations_parent_id'
    ],
    expectedTriggers: ['update_conversations_updated_at'],
    criticalFields: [
      'id', 'conversation_id', 'tier', 'status', 
      'quality_score', 'total_turns', 'created_at', 'updated_at'
    ],
    expectedEnums: ['conversation_status', 'tier_type']
  },
  'conversation_turns': {
    description: 'Store individual conversation turns (normalized)',
    expectedColumns: [
      'id', 'conversation_id', 'turn_number', 'role', 'content',
      'token_count', 'created_at'
    ],
    expectedIndexes: [
      'idx_conversation_turns_conversation_id'
    ],
    expectedConstraints: [
      'UNIQUE(conversation_id, turn_number)',
      'CHECK(turn_number > 0)',
      'CHECK(role IN (\'user\', \'assistant\'))'
    ],
    criticalFields: [
      'id', 'conversation_id', 'turn_number', 'role', 'content'
    ]
  }
};

// Expected RLS policies
const EXPECTED_RLS_POLICIES = {
  'conversations': [
    'Users can view conversations',
    'Users can insert conversations',
    'Users can update conversations',
    'Users can delete conversations'
  ],
  'conversation_turns': [
    'Users can view conversation turns',
    'Users can insert conversation turns'
  ]
};

// Expected functions
const EXPECTED_FUNCTIONS = [
  'update_updated_at_column'
];

async function checkTableExists(tableName) {
  try {
    const { data, error } = await client.from(tableName).select('*').limit(0);
    return !error;
  } catch (err) {
    return false;
  }
}

async function getTableColumns(tableName) {
  try {
    // Try to get one row to see structure
    const { data, error } = await client.from(tableName).select('*').limit(1);
    if (error) {
      // Table exists but might be empty or have RLS blocking
      const { error: emptyError } = await client.from(tableName).select('*').limit(0);
      if (!emptyError) {
        // Table exists but we can't read data
        return { exists: true, columns: [], rls_blocking: true };
      }
      return null;
    }
    
    if (data && data.length > 0) {
      return { exists: true, columns: Object.keys(data[0]), rls_blocking: false };
    }
    
    // Table exists but is empty
    return { exists: true, columns: [], rls_blocking: false };
  } catch (err) {
    return null;
  }
}

async function analyzeTable(tableName, tableSpec) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 Analyzing: ${tableName}`);
  console.log(`   Description: ${tableSpec.description}`);
  console.log(`${'='.repeat(80)}`);
  
  // Check if table exists
  const exists = await checkTableExists(tableName);
  
  if (!exists) {
    return {
      table: tableName,
      actualTableName: null,
      exists: false,
      category: 4,
      categoryDescription: "Table doesn't exist at all",
      status: '❌ CRITICAL',
      recommendation: `Run SQL script from E03 execution files to create the ${tableName} table`,
      details: {
        expectedColumns: tableSpec.expectedColumns,
        actualColumns: [],
        missingColumns: tableSpec.expectedColumns,
        criticalFieldsMissing: tableSpec.criticalFields
      }
    };
  }
  
  // Table exists - analyze structure
  const tableData = await getTableColumns(tableName);
  
  if (!tableData || tableData.rls_blocking || tableData.columns.length === 0) {
    // Table exists but we can't determine structure
    return {
      table: tableName,
      actualTableName: tableName,
      exists: true,
      category: 2,
      categoryDescription: "Table exists but structure cannot be determined (empty or RLS blocking)",
      status: '⚠️  WARNING',
      recommendation: `Verify ${tableName} structure manually using Supabase SQL Editor`,
      details: {
        expectedColumns: tableSpec.expectedColumns,
        actualColumns: tableData?.columns || [],
        cannotDetermineStructure: true,
        sqlToVerify: `SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = '${tableName}'
ORDER BY ordinal_position;`
      }
    };
  }
  
  // Compare columns
  const actualColumns = tableData.columns;
  const expectedColumns = tableSpec.expectedColumns;
  const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
  const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
  const criticalMissing = tableSpec.criticalFields 
    ? tableSpec.criticalFields.filter(col => !actualColumns.includes(col))
    : [];
  
  // Determine category and status
  let category;
  let categoryDescription;
  let status;
  
  if (criticalMissing.length > 0) {
    category = 2;
    categoryDescription = "Table exists but missing critical fields";
    status = '❌ CRITICAL';
  } else if (missingColumns.length > 0) {
    category = 2;
    categoryDescription = "Table exists but missing some expected fields";
    status = '⚠️  WARNING';
  } else if (extraColumns.length > 0 && missingColumns.length === 0) {
    category = 1;
    categoryDescription = "Already implemented with additional columns (acceptable)";
    status = '✅ OK';
  } else {
    category = 1;
    categoryDescription = "Already implemented as described (no changes needed)";
    status = '✅ OK';
  }
  
  // Build recommendation
  let recommendation = '';
  if (criticalMissing.length > 0) {
    recommendation = `Add missing critical columns: ${criticalMissing.join(', ')}`;
  } else if (missingColumns.length > 0) {
    recommendation = `Consider adding missing columns: ${missingColumns.join(', ')}`;
  } else {
    recommendation = 'No action needed';
  }
  
  return {
    table: tableName,
    actualTableName: tableName,
    exists: true,
    category,
    categoryDescription,
    status,
    recommendation,
    details: {
      expectedColumns: expectedColumns.length,
      actualColumns: actualColumns.length,
      missingColumns,
      extraColumns,
      criticalFieldsMissing: criticalMissing,
      columnComparison: {
        expected: expectedColumns,
        actual: actualColumns
      }
    }
  };
}

function formatMarkdownReport(results, timestamp) {
  let md = `# E03 SQL Implementation Status Report\n\n`;
  md += `**Generated:** ${timestamp}\n`;
  md += `**Source:** \n`;
  md += `- 04-FR-wireframes-execution-E03.md (lines 192-514)\n`;
  md += `- 04-FR-wireframes-execution-E03b.md (lines 192-514)\n`;
  md += `- 04-FR-wireframes-execution-E03-addendum-1.md\n\n`;
  md += `---\n\n`;
  
  md += `## Executive Summary\n\n`;
  
  const category1 = results.filter(r => r.category === 1);
  const category2 = results.filter(r => r.category === 2);
  const category3 = results.filter(r => r.category === 3);
  const category4 = results.filter(r => r.category === 4);
  
  const critical = results.filter(r => r.status === '❌ CRITICAL');
  const warnings = results.filter(r => r.status === '⚠️  WARNING');
  const ok = results.filter(r => r.status === '✅ OK');
  
  md += `**Overall Status:** ${critical.length > 0 ? '❌ CRITICAL ISSUES' : warnings.length > 0 ? '⚠️  NEEDS ATTENTION' : '✅ COMPLETE'}\n\n`;
  md += `- Total tables expected: ${results.length}\n`;
  md += `- ${ok.length} ✅ OK (no issues)\n`;
  md += `- ${warnings.length} ⚠️  WARNING (minor issues)\n`;
  md += `- ${critical.length} ❌ CRITICAL (blocking issues)\n\n`;
  
  if (critical.length > 0) {
    md += `### ⚠️  Critical Issues Requiring Immediate Action\n\n`;
    critical.forEach(r => {
      md += `**${r.table}:**\n`;
      md += `- Status: ${r.categoryDescription}\n`;
      md += `- Impact: ${!r.exists ? 'Table missing - all functionality will FAIL' : 'Missing critical fields - data integrity at risk'}\n`;
      md += `- Action: ${r.recommendation}\n\n`;
    });
  }
  
  md += `---\n\n`;
  md += `## Detailed Analysis by Category\n\n`;
  
  md += `### Category 1: Already Implemented ✅\n\n`;
  if (category1.length === 0) {
    md += `*No tables in this category*\n\n`;
  } else {
    category1.forEach(r => {
      md += `#### ${r.table}\n`;
      md += `- **Status:** ${r.status}\n`;
      md += `- **Description:** ${r.categoryDescription}\n`;
      md += `- **Columns:** ${r.details.actualColumns} actual vs ${r.details.expectedColumns} expected\n`;
      if (r.details.extraColumns && r.details.extraColumns.length > 0) {
        md += `- **Extra columns:** ${r.details.extraColumns.join(', ')}\n`;
      }
      md += `- **Recommendation:** ${r.recommendation}\n`;
      md += `\n`;
    });
  }
  
  md += `### Category 2: Table Exists But Needs Fields/Triggers ⚠️\n\n`;
  if (category2.length === 0) {
    md += `*No tables in this category*\n\n`;
  } else {
    category2.forEach(r => {
      md += `#### ${r.table}\n`;
      md += `- **Status:** ${r.status}\n`;
      md += `- **Description:** ${r.categoryDescription}\n`;
      md += `- **Columns:** ${r.details.actualColumns} actual vs ${r.details.expectedColumns} expected\n`;
      if (r.details.missingColumns && r.details.missingColumns.length > 0) {
        md += `- **Missing columns:** ${r.details.missingColumns.join(', ')}\n`;
      }
      if (r.details.criticalFieldsMissing && r.details.criticalFieldsMissing.length > 0) {
        md += `- **⚠️  Missing CRITICAL fields:** ${r.details.criticalFieldsMissing.join(', ')}\n`;
      }
      md += `- **Recommendation:** ${r.recommendation}\n`;
      if (r.details.sqlToVerify) {
        md += `\n**Verification SQL:**\n\`\`\`sql\n${r.details.sqlToVerify}\n\`\`\`\n`;
      }
      md += `\n`;
    });
  }
  
  md += `### Category 3: Table Exists For Different Purpose ⚠️\n\n`;
  if (category3.length === 0) {
    md += `*No tables in this category*\n\n`;
  } else {
    category3.forEach(r => {
      md += `#### ${r.table}\n`;
      md += `- **Status:** ${r.status}\n`;
      md += `- **Description:** ${r.categoryDescription}\n`;
      md += `- **Recommendation:** ${r.recommendation}\n\n`;
    });
  }
  
  md += `### Category 4: Table Doesn't Exist ❌\n\n`;
  if (category4.length === 0) {
    md += `*No tables in this category*\n\n`;
  } else {
    category4.forEach(r => {
      md += `#### ${r.table}\n`;
      md += `- **Status:** ${r.status}\n`;
      md += `- **Description:** ${r.categoryDescription}\n`;
      md += `- **Expected columns:** ${r.details.expectedColumns.length} columns\n`;
      md += `- **Critical fields:** ${r.details.criticalFieldsMissing.join(', ')}\n`;
      md += `- **Recommendation:** ${r.recommendation}\n\n`;
      
      md += `**SQL to Create:**\n`;
      md += `\`\`\`sql\n`;
      md += `-- See 04-FR-wireframes-execution-E03.md lines 192-514\n`;
      md += `-- or 04-FR-wireframes-execution-E03b.md lines 192-514\n`;
      md += `-- for complete SQL script\n`;
      md += `\`\`\`\n\n`;
    });
  }
  
  md += `---\n\n`;
  md += `## Summary Table\n\n`;
  md += `| Table | Status | Category | Issue | Action Required |\n`;
  md += `|-------|--------|----------|-------|----------------|\n`;
  results.forEach(r => {
    const issue = !r.exists ? 'Missing' :
                  (r.details.criticalFieldsMissing && r.details.criticalFieldsMissing.length > 0) ? 'Missing critical fields' :
                  (r.details.missingColumns && r.details.missingColumns.length > 0) ? 'Missing fields' :
                  r.details.cannotDetermineStructure ? 'Cannot verify structure' :
                  'None';
    const action = r.status === '✅ OK' ? 'None' : 
                   r.status === '❌ CRITICAL' ? 'URGENT' :
                   'Review';
    md += `| ${r.table} | ${r.status} | ${r.category} | ${issue} | ${action} |\n`;
  });
  
  md += `\n---\n\n`;
  md += `## Recommended Actions\n\n`;
  
  if (critical.length > 0) {
    md += `### URGENT (Must Fix to Enable Conversations Feature)\n\n`;
    critical.forEach((r, i) => {
      md += `${i + 1}. **Fix ${r.table}:**\n`;
      md += `   - ${r.recommendation}\n`;
      md += `   - Estimated time: ${!r.exists ? '10 minutes' : '30 minutes'}\n`;
      md += `   - Impact: ${!r.exists ? 'Feature completely broken' : 'Data integrity issues'}\n\n`;
    });
  }
  
  if (warnings.length > 0) {
    md += `### Warnings (Should Address Soon)\n\n`;
    warnings.forEach((r, i) => {
      md += `${i + 1}. **${r.table}:** ${r.recommendation}\n`;
    });
    md += `\n`;
  }
  
  if (ok.length === results.length) {
    md += `### ✅ All Clear!\n\n`;
    md += `All expected tables are implemented correctly. No SQL changes needed.\n\n`;
  }
  
  md += `---\n\n`;
  md += `## Additional Verification Needed\n\n`;
  md += `The following items require manual verification in Supabase SQL Editor:\n\n`;
  
  md += `### 1. Enums\n\n`;
  md += `Verify that custom enum types are created:\n\n`;
  md += `\`\`\`sql\n`;
  md += `SELECT t.typname, e.enumlabel\n`;
  md += `FROM pg_type t\n`;
  md += `JOIN pg_enum e ON t.oid = e.enumtypid\n`;
  md += `WHERE t.typname IN ('conversation_status', 'tier_type')\n`;
  md += `ORDER BY t.typname, e.enumsortorder;\n`;
  md += `\`\`\`\n\n`;
  md += `**Expected enums:**\n`;
  md += `- \`conversation_status\`: draft, generated, pending_review, approved, rejected, needs_revision, none, failed\n`;
  md += `- \`tier_type\`: template, scenario, edge_case\n\n`;
  
  md += `### 2. Indexes\n\n`;
  Object.entries(E03_TABLES).forEach(([tableName, spec]) => {
    if (spec.expectedIndexes) {
      md += `**${tableName}:**\n`;
      md += `\`\`\`sql\n`;
      md += `SELECT indexname, indexdef FROM pg_indexes \n`;
      md += `WHERE schemaname = 'public' AND tablename = '${tableName}'\n`;
      md += `ORDER BY indexname;\n`;
      md += `\`\`\`\n\n`;
      md += `**Expected indexes (${spec.expectedIndexes.length}):**\n`;
      spec.expectedIndexes.forEach(idx => {
        md += `- ${idx}\n`;
      });
      md += `\n`;
    }
  });
  
  md += `### 3. RLS Policies\n\n`;
  md += `\`\`\`sql\n`;
  md += `SELECT tablename, policyname, cmd, qual, with_check \n`;
  md += `FROM pg_policies \n`;
  md += `WHERE schemaname = 'public' \n`;
  md += `AND tablename IN ('conversations', 'conversation_turns')\n`;
  md += `ORDER BY tablename, policyname;\n`;
  md += `\`\`\`\n\n`;
  md += `**Expected policies:**\n`;
  Object.entries(EXPECTED_RLS_POLICIES).forEach(([table, policies]) => {
    md += `- **${table}:** ${policies.length} policies\n`;
    policies.forEach(p => md += `  - ${p}\n`);
  });
  md += `\n`;
  
  md += `### 4. Triggers\n\n`;
  md += `\`\`\`sql\n`;
  md += `SELECT trigger_name, event_manipulation, event_object_table, action_statement \n`;
  md += `FROM information_schema.triggers \n`;
  md += `WHERE trigger_schema = 'public'\n`;
  md += `AND event_object_table IN ('conversations', 'conversation_turns')\n`;
  md += `ORDER BY event_object_table, trigger_name;\n`;
  md += `\`\`\`\n\n`;
  md += `**Expected triggers:**\n`;
  md += `- \`update_conversations_updated_at\` on conversations table (BEFORE UPDATE)\n\n`;
  
  md += `### 5. Functions\n\n`;
  md += `\`\`\`sql\n`;
  md += `SELECT routine_name, routine_type, data_type\n`;
  md += `FROM information_schema.routines\n`;
  md += `WHERE routine_schema = 'public'\n`;
  md += `AND routine_name IN ('update_updated_at_column')\n`;
  md += `ORDER BY routine_name;\n`;
  md += `\`\`\`\n\n`;
  md += `**Expected functions:**\n`;
  md += `- \`update_updated_at_column()\` - Automatically updates updated_at timestamp\n\n`;
  
  md += `### 6. Constraints\n\n`;
  md += `\`\`\`sql\n`;
  md += `SELECT conname, contype, pg_get_constraintdef(oid) as definition\n`;
  md += `FROM pg_constraint\n`;
  md += `WHERE conrelid = 'conversations'::regclass\n`;
  md += `   OR conrelid = 'conversation_turns'::regclass\n`;
  md += `ORDER BY conrelid::text, contype, conname;\n`;
  md += `\`\`\`\n\n`;
  md += `**Expected constraints:**\n`;
  md += `- conversations: quality_score CHECK (0-10), total_turns CHECK (>= 0)\n`;
  md += `- conversation_turns: turn_number CHECK (> 0), role CHECK (IN 'user', 'assistant')\n`;
  md += `- conversation_turns: UNIQUE(conversation_id, turn_number)\n\n`;
  
  md += `---\n\n`;
  md += `## Notes from E03 Execution Files\n\n`;
  md += `### Context\n\n`;
  md += `The E03 execution implemented a **Conversation Management Dashboard** with:\n`;
  md += `- Full CRUD operations for conversations\n`;
  md += `- Quality tracking and review workflows\n`;
  md += `- Multi-dimensional filtering (tier, status, quality, persona, emotion)\n`;
  md += `- Normalized turn storage for conversation data\n`;
  md += `- Comprehensive indexing for dashboard performance\n\n`;
  
  md += `### Key Features of the Schema\n\n`;
  md += `**conversations table:**\n`;
  md += `- UUID primary key with text-based conversation_id for external reference\n`;
  md += `- Foreign keys to documents/chunks (chunks-alpha module integration)\n`;
  md += `- Rich metadata: persona, emotion, topic, intent, tone, category\n`;
  md += `- Tier system: template, scenario, edge_case\n`;
  md += `- Status workflow: draft → generated → pending_review → approved/rejected/needs_revision\n`;
  md += `- Quality tracking: quality_score (0-10) + JSONB quality_metrics\n`;
  md += `- JSONB fields: parameters, quality_metrics, review_history\n`;
  md += `- Version tracking: parent_id, parent_type\n`;
  md += `- Approval workflow: approved_by, approved_at\n\n`;
  
  md += `**conversation_turns table:**\n`;
  md += `- Normalized 1:many relationship with conversations\n`;
  md += `- turn_number + role (user/assistant) pattern\n`;
  md += `- Token counting for cost tracking\n`;
  md += `- UNIQUE constraint on (conversation_id, turn_number)\n`;
  md += `- CASCADE delete with parent conversation\n\n`;
  
  md += `---\n\n`;
  md += `## SQL Script Location\n\n`;
  md += `The complete SQL script can be found in:\n`;
  md += `- \`pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E03.md\` (lines 192-514)\n`;
  md += `- \`pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E03b.md\` (lines 192-514)\n\n`;
  
  md += `Both files contain identical SQL. Run the SQL in Supabase SQL Editor to create all tables, indexes, triggers, and policies.\n\n`;
  
  md += `---\n\n`;
  md += `*Report generated by check-e03-sql-detailed.js*\n`;
  md += `*Timestamp: ${timestamp}*\n`;
  
  return md;
}

async function main() {
  console.log('🔍 E03 SQL Implementation Check');
  console.log('================================\n');
  console.log('Checking tables from E03 execution files');
  console.log('Expected tables: conversations, conversation_turns\n');
  
  const results = [];
  
  for (const [tableName, tableSpec] of Object.entries(E03_TABLES)) {
    const result = await analyzeTable(tableName, tableSpec);
    results.push(result);
    
    console.log(`\n📊 Result:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Category: ${result.category} - ${result.categoryDescription}`);
    if (result.details.missingColumns && result.details.missingColumns.length > 0) {
      console.log(`   Missing ${result.details.missingColumns.length} columns: ${result.details.missingColumns.slice(0, 5).join(', ')}${result.details.missingColumns.length > 5 ? '...' : ''}`);
    }
    if (result.details.criticalFieldsMissing && result.details.criticalFieldsMissing.length > 0) {
      console.log(`   ❌ Missing CRITICAL fields: ${result.details.criticalFieldsMissing.join(', ')}`);
    }
    if (result.details.cannotDetermineStructure) {
      console.log(`   ℹ️  Structure cannot be determined automatically (table may be empty or have RLS)`);
    }
  }
  
  // Generate summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(80));
  
  const critical = results.filter(r => r.status === '❌ CRITICAL');
  const warnings = results.filter(r => r.status === '⚠️  WARNING');
  const ok = results.filter(r => r.status === '✅ OK');
  
  console.log(`\nTotal tables: ${results.length}`);
  console.log(`✅ OK: ${ok.length}`);
  console.log(`⚠️  WARNING: ${warnings.length}`);
  console.log(`❌ CRITICAL: ${critical.length}`);
  
  if (critical.length > 0) {
    console.log(`\n❌ CRITICAL ISSUES - Must fix before conversations feature works:`);
    critical.forEach(r => {
      console.log(`   • ${r.table}: ${r.categoryDescription}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS - Should verify:`);
    warnings.forEach(r => {
      console.log(`   • ${r.table}: ${r.categoryDescription}`);
    });
  }
  
  if (ok.length > 0) {
    console.log(`\n✅ OK - No issues:`);
    ok.forEach(r => {
      console.log(`   • ${r.table}`);
    });
  }
  
  // Save results
  const timestamp = new Date().toISOString();
  const outputPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E03-sql-check.md');
  
  const markdownReport = formatMarkdownReport(results, timestamp);
  fs.writeFileSync(outputPath, markdownReport);
  
  console.log(`\n💾 Report saved to: ${outputPath}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);

