#!/usr/bin/env node

/**
 * E05 SQL Implementation Checker - Detailed Schema Analysis
 * 
 * Checks the implementation status of tables, indexes, triggers, and constraints
 * from the E05 execution file (04-FR-wireframes-execution-E05.md)
 * 
 * Expected SQL from E05 (lines 273-342):
 * - export_logs table
 * - Indexes for performance
 * - RLS policies for security
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

// Tables from E05 SQL script (lines 273-342 in execution file)
const E05_TABLES = {
  'export_logs': {
    description: 'Track all export operations for audit trail and compliance',
    expectedColumns: [
      'id', 'export_id', 'user_id', 'timestamp', 'format', 'config',
      'conversation_count', 'file_size', 'status', 'file_url', 'expires_at',
      'error_message', 'created_at', 'updated_at'
    ],
    expectedIndexes: [
      'idx_export_logs_user_id',
      'idx_export_logs_timestamp',
      'idx_export_logs_status',
      'idx_export_logs_format',
      'idx_export_logs_expires_at'
    ],
    expectedConstraints: [
      'UNIQUE(export_id)',
      'CHECK(format IN (\'json\', \'jsonl\', \'csv\', \'markdown\'))',
      'CHECK(status IN (\'queued\', \'processing\', \'completed\', \'failed\', \'expired\'))',
      'FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE'
    ],
    criticalFields: [
      'id', 'export_id', 'user_id', 'format', 'config', 
      'conversation_count', 'status', 'timestamp'
    ]
  }
};

// Expected RLS policies
const EXPECTED_RLS_POLICIES = {
  'export_logs': [
    'Users can view own export logs',
    'Users can create own export logs',
    'Users can update own export logs'
  ]
};

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
      recommendation: `Run SQL script from E05 execution file (lines 273-342) to create the ${tableName} table`,
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
  let md = `# E05 SQL Implementation Status Report\n\n`;
  md += `**Generated:** ${timestamp}\n`;
  md += `**Source:** 04-FR-wireframes-execution-E05.md (lines 273-342)\n\n`;
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
      md += `- Impact: ${!r.exists ? 'Export System completely non-functional - all export operations will FAIL' : 'Missing critical fields - data integrity at risk'}\n`;
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
      md += `-- See 04-FR-wireframes-execution-E05.md lines 273-342\n`;
      md += `-- for complete SQL script to create export_logs table\n`;
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
    md += `### URGENT (Before E05 Implementation Can Begin)\n\n`;
    critical.forEach((r, i) => {
      md += `${i + 1}. **Fix ${r.table}:**\n`;
      md += `   - ${r.recommendation}\n`;
      md += `   - Estimated time: ${!r.exists ? '10 minutes' : '30 minutes'}\n`;
      md += `   - Impact: ${!r.exists ? 'Export feature completely broken' : 'Data integrity issues'}\n\n`;
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
    md += `All expected tables are implemented correctly. You can proceed with E05 implementation prompts.\n\n`;
  }
  
  md += `---\n\n`;
  md += `## Additional Verification Needed\n\n`;
  md += `The following items require manual verification in Supabase SQL Editor:\n\n`;
  
  md += `### 1. Indexes\n\n`;
  Object.entries(E05_TABLES).forEach(([tableName, spec]) => {
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
  
  md += `### 2. RLS Policies\n\n`;
  md += `\`\`\`sql\n`;
  md += `SELECT tablename, policyname, cmd, qual, with_check \n`;
  md += `FROM pg_policies \n`;
  md += `WHERE schemaname = 'public' \n`;
  md += `AND tablename = 'export_logs'\n`;
  md += `ORDER BY policyname;\n`;
  md += `\`\`\`\n\n`;
  md += `**Expected policies:**\n`;
  Object.entries(EXPECTED_RLS_POLICIES).forEach(([table, policies]) => {
    md += `- **${table}:** ${policies.length} policies\n`;
    policies.forEach(p => md += `  - ${p}\n`);
  });
  md += `\n`;
  
  md += `### 3. Foreign Key Constraints\n\n`;
  md += `\`\`\`sql\n`;
  md += `SELECT conname, contype, pg_get_constraintdef(oid) as definition\n`;
  md += `FROM pg_constraint\n`;
  md += `WHERE conrelid = 'export_logs'::regclass\n`;
  md += `ORDER BY contype, conname;\n`;
  md += `\`\`\`\n\n`;
  md += `**Expected constraints:**\n`;
  md += `- UNIQUE(export_id) - Ensures each export has unique identifier\n`;
  md += `- CHECK(format IN ('json', 'jsonl', 'csv', 'markdown')) - Valid export formats\n`;
  md += `- CHECK(status IN ('queued', 'processing', 'completed', 'failed', 'expired')) - Valid statuses\n`;
  md += `- FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE - User association\n\n`;
  
  md += `### 4. Table Structure\n\n`;
  md += `Verify the complete table structure:\n\n`;
  md += `\`\`\`sql\n`;
  md += `SELECT \n`;
  md += `  column_name, \n`;
  md += `  data_type, \n`;
  md += `  is_nullable,\n`;
  md += `  column_default\n`;
  md += `FROM information_schema.columns\n`;
  md += `WHERE table_name = 'export_logs'\n`;
  md += `ORDER BY ordinal_position;\n`;
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
  md += `## Notes from E05 Execution File\n\n`;
  md += `### Context\n\n`;
  md += `The E05 execution implements the **Export System** for the Interactive LoRA Conversation Generation Module with:\n`;
  md += `- Export conversations in multiple formats (JSONL, JSON, CSV, Markdown)\n`;
  md += `- Comprehensive audit trail for all export operations\n`;
  md += `- User attribution and filter state tracking\n`;
  md += `- Export lifecycle management (queued → processing → completed/failed/expired)\n`;
  md += `- File URL storage and expiration tracking\n`;
  md += `- RLS policies ensuring users can only access their own exports\n\n`;
  
  md += `### Key Features of the Schema\n\n`;
  md += `**export_logs table:**\n`;
  md += `- UUID primary key with unique export_id for external reference\n`;
  md += `- Foreign key to auth.users for user attribution\n`;
  md += `- Format field: json, jsonl, csv, markdown (CHECK constraint)\n`;
  md += `- Status lifecycle: queued → processing → completed/failed/expired\n`;
  md += `- JSONB config field storing ExportConfig (scope, format, options)\n`;
  md += `- conversation_count tracking for metrics\n`;
  md += `- file_size in bytes for storage monitoring\n`;
  md += `- file_url for download links\n`;
  md += `- expires_at timestamp for automated cleanup\n`;
  md += `- error_message for debugging failed exports\n`;
  md += `- Timestamps: timestamp (operation time), created_at, updated_at\n\n`;
  
  md += `### Indexes for Performance\n\n`;
  md += `- idx_export_logs_user_id: Fast queries by user\n`;
  md += `- idx_export_logs_timestamp: Export history sorted by date (DESC)\n`;
  md += `- idx_export_logs_status: Filter by status (queued, processing, etc.)\n`;
  md += `- idx_export_logs_format: Filter by export format\n`;
  md += `- idx_export_logs_expires_at (partial): Cleanup job optimization (WHERE status = 'completed')\n\n`;
  
  md += `---\n\n`;
  md += `## SQL Script Location\n\n`;
  md += `The complete SQL script can be found in:\n`;
  md += `- \`pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E05.md\` (lines 273-342)\n\n`;
  
  md += `Run the SQL in Supabase SQL Editor to create the table, indexes, constraints, and RLS policies.\n\n`;
  
  md += `---\n\n`;
  md += `## E05 Implementation Dependencies\n\n`;
  md += `The export_logs table is the foundation for:\n\n`;
  md += `**Prompt 1: Database Foundation and Export Service Layer**\n`;
  md += `- ExportService class with CRUD operations\n`;
  md += `- createExportLog(), getExportLog(), listExportLogs(), updateExportLog()\n`;
  md += `- Type definitions: ExportLog, CreateExportLogInput, UpdateExportLogInput\n\n`;
  
  md += `**Prompt 4: Export API Endpoints**\n`;
  md += `- POST /api/export/conversations - Creates export log entry\n`;
  md += `- GET /api/export/status/:id - Queries export log by export_id\n`;
  md += `- GET /api/export/download/:id - Retrieves export file\n`;
  md += `- GET /api/export/history - Lists user's export logs\n\n`;
  
  md += `**Prompt 6: Operations, Monitoring, and File Cleanup**\n`;
  md += `- Export metrics collection (queries export_logs)\n`;
  md += `- File cleanup job (marks expired exports)\n`;
  md += `- Audit log cleanup job (deletes old export_logs)\n\n`;
  
  md += `⚠️  **Without this table, E05 implementation cannot proceed!**\n\n`;
  
  md += `---\n\n`;
  md += `*Report generated by check-e05-sql-detailed.js*\n`;
  md += `*Timestamp: ${timestamp}*\n`;
  
  return md;
}

async function main() {
  console.log('🔍 E05 SQL Implementation Check');
  console.log('================================\n');
  console.log('Checking tables from 04-FR-wireframes-execution-E05.md');
  console.log('Expected tables: export_logs\n');
  
  const results = [];
  
  for (const [tableName, tableSpec] of Object.entries(E05_TABLES)) {
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
    console.log(`\n❌ CRITICAL ISSUES - Must fix before E05 implementation:`);
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
  const outputPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E05-sql-check.md');
  
  const markdownReport = formatMarkdownReport(results, timestamp);
  fs.writeFileSync(outputPath, markdownReport);
  
  console.log(`\n💾 Report saved to: ${outputPath}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);

