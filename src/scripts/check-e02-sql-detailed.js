#!/usr/bin/env node

/**
 * E02 SQL Implementation Checker - Detailed Schema Analysis
 * 
 * Checks the implementation status of tables, indexes, triggers, and constraints
 * from the E02 execution file (04-FR-wireframes-execution-E02.md)
 * 
 * Expected SQL from E02 (lines 242-548):
 * - prompt_templates table
 * - generation_logs table (enhanced from E01)
 * - template_analytics table
 * 
 * Known Issues (from E02-addendum-4.md):
 * - Database has 'conversation_templates' instead of 'prompt_templates'
 * - template_analytics table is missing
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

// Tables from E02 SQL script (lines 242-548 in execution file)
const E02_TABLES = {
  'prompt_templates': {
    description: 'Store conversation prompt templates with versioning',
    expectedColumns: [
      'id', 'template_name', 'version', 'template_text', 'template_type',
      'tier', 'variables', 'required_parameters', 'applicable_personas',
      'applicable_emotions', 'description', 'style_notes', 'example_conversation',
      'quality_threshold', 'is_active', 'usage_count', 'rating',
      'created_at', 'updated_at', 'created_by'
    ],
    expectedIndexes: [
      'idx_templates_active',
      'idx_templates_type',
      'idx_templates_tier',
      'idx_templates_usage',
      'idx_templates_rating',
      'idx_templates_created',
      'idx_templates_variables' // GIN index
    ],
    expectedTriggers: ['templates_updated_at'],
    alternateNames: ['conversation_templates'], // Known issue from audit
    criticalFields: ['template_name', 'version', 'template_text', 'variables']
  },
  'generation_logs': {
    description: 'Comprehensive audit log for all AI API calls',
    expectedColumns: [
      'id', 'conversation_id', 'run_id', 'template_id', 'request_payload',
      'response_payload', 'parameters', 'input_tokens', 'output_tokens',
      'cost_usd', 'duration_ms', 'status', 'error_message', 'error_type',
      'retry_attempt', 'model_name', 'api_version', 'created_at', 'created_by'
    ],
    expectedIndexes: [
      'idx_generation_logs_conversation',
      'idx_generation_logs_run',
      'idx_generation_logs_template',
      'idx_generation_logs_status',
      'idx_generation_logs_created',
      'idx_generation_logs_error_type',
      'idx_generation_logs_request', // GIN
      'idx_generation_logs_response', // GIN
      'idx_generation_logs_parameters' // GIN
    ],
    criticalFields: ['conversation_id', 'template_id', 'request_payload', 'status']
  },
  'template_analytics': {
    description: 'Aggregated performance metrics per template',
    expectedColumns: [
      'id', 'template_id', 'period_start', 'period_end', 'generation_count',
      'success_count', 'failure_count', 'avg_quality_score', 'min_quality_score',
      'max_quality_score', 'approval_count', 'rejection_count', 'approval_rate',
      'avg_duration_ms', 'avg_cost_usd', 'total_cost_usd', 'calculated_at'
    ],
    expectedIndexes: [
      'idx_analytics_template',
      'idx_analytics_period',
      'idx_analytics_calculated'
    ],
    criticalFields: ['template_id', 'period_start', 'period_end'],
    expectedConstraints: ['UNIQUE (template_id, period_start, period_end)']
  }
};

// Expected RLS policies
const EXPECTED_RLS_POLICIES = {
  'prompt_templates': [
    'Users can view active templates',
    'Users can create templates',
    'Users can update own templates',
    'Users can delete own templates'
  ],
  'generation_logs': [
    'Users can view own generation logs',
    'Users can create generation logs'
  ],
  'template_analytics': [
    'Users can view template analytics'
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
  
  // Check primary table name
  let exists = await checkTableExists(tableName);
  let actualTableName = tableName;
  let tableRenamed = false;
  
  // Check alternate names if primary doesn't exist
  if (!exists && tableSpec.alternateNames) {
    console.log(`\n⚠️  Table '${tableName}' not found, checking alternate names...`);
    for (const altName of tableSpec.alternateNames) {
      console.log(`   Checking: ${altName}...`);
      exists = await checkTableExists(altName);
      if (exists) {
        actualTableName = altName;
        tableRenamed = true;
        console.log(`   ✅ Found as: ${altName}`);
        break;
      }
    }
  }
  
  if (!exists) {
    return {
      table: tableName,
      actualTableName: null,
      exists: false,
      category: 4,
      categoryDescription: "Table doesn't exist at all",
      status: '❌ CRITICAL',
      recommendation: `Run SQL script to create the ${tableName} table`,
      details: {
        expectedColumns: tableSpec.expectedColumns,
        actualColumns: [],
        missingColumns: tableSpec.expectedColumns,
        criticalFieldsMissing: tableSpec.criticalFields
      }
    };
  }
  
  // Table exists - analyze structure
  const tableData = await getTableColumns(actualTableName);
  
  if (!tableData || tableData.rls_blocking || tableData.columns.length === 0) {
    // Table exists but we can't determine structure
    const status = tableRenamed ? '⚠️  WARNING' : '⚠️  WARNING';
    return {
      table: tableName,
      actualTableName: actualTableName,
      exists: true,
      renamed: tableRenamed,
      category: 2,
      categoryDescription: "Table exists but structure cannot be determined (empty or RLS blocking)",
      status: status,
      recommendation: `Verify ${actualTableName} structure manually using Supabase SQL Editor`,
      details: {
        expectedColumns: tableSpec.expectedColumns,
        actualColumns: tableData?.columns || [],
        cannotDetermineStructure: true,
        sqlToVerify: `SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = '${actualTableName}'
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
  
  if (tableRenamed) {
    category = 3;
    categoryDescription = `Table exists as '${actualTableName}' (WRONG NAME - code expects '${tableName}')`;
    status = '❌ CRITICAL';
  } else if (criticalMissing.length > 0) {
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
  if (tableRenamed) {
    recommendation = `CRITICAL: Rename table from '${actualTableName}' to '${tableName}' OR update all code references to use '${actualTableName}'.\n` +
      `SQL: ALTER TABLE ${actualTableName} RENAME TO ${tableName};`;
  } else if (criticalMissing.length > 0) {
    recommendation = `Add missing critical columns: ${criticalMissing.join(', ')}`;
  } else if (missingColumns.length > 0) {
    recommendation = `Consider adding missing columns: ${missingColumns.join(', ')}`;
  } else {
    recommendation = 'No action needed';
  }
  
  return {
    table: tableName,
    actualTableName: actualTableName,
    exists: true,
    renamed: tableRenamed,
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
  let md = `# E02 SQL Implementation Status Report\n\n`;
  md += `**Generated:** ${timestamp}\n`;
  md += `**Source:** 04-FR-wireframes-execution-E02.md (lines 242-548)\n\n`;
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
      md += `- Impact: ${r.renamed ? 'ALL code using this table will FAIL' : 'Missing functionality'}\n`;
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
      md += `- **Actual table name:** ${r.actualTableName}\n`;
      md += `- **Issue:** Code references \`${r.table}\` but database has \`${r.actualTableName}\`\n`;
      md += `- **Impact:** All CRUD operations will fail with "relation does not exist" errors\n`;
      md += `- **Recommendation:** ${r.recommendation}\n\n`;
      
      md += `**Affected Code Files:**\n`;
      if (r.table === 'prompt_templates') {
        md += `- \`src/lib/template-service.ts\` (5 references)\n`;
        md += `- \`src/app/api/templates/route.ts\`\n`;
        md += `- \`src/app/api/templates/[id]/route.ts\`\n`;
        md += `- All template UI components\n`;
      }
      md += `\n`;
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
      md += `-- See 04-FR-wireframes-execution-E02.md lines 242-548\n`;
      md += `-- for complete SQL script\n`;
      md += `\`\`\`\n\n`;
    });
  }
  
  md += `---\n\n`;
  md += `## Summary Table\n\n`;
  md += `| Table | Status | Category | Issue | Action Required |\n`;
  md += `|-------|--------|----------|-------|----------------|\n`;
  results.forEach(r => {
    const issue = r.renamed ? 'Wrong name' : 
                  !r.exists ? 'Missing' :
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
    md += `### URGENT (Before E03)\n\n`;
    critical.forEach((r, i) => {
      md += `${i + 1}. **Fix ${r.table}:**\n`;
      md += `   - ${r.recommendation}\n`;
      md += `   - Estimated time: ${r.renamed ? '15 minutes' : r.exists ? '30 minutes' : '45 minutes'}\n\n`;
    });
  }
  
  if (warnings.length > 0) {
    md += `### Low Priority (Can be addressed later)\n\n`;
    warnings.forEach((r, i) => {
      md += `${i + 1}. **${r.table}:** ${r.recommendation}\n`;
    });
    md += `\n`;
  }
  
  md += `---\n\n`;
  md += `## Additional Verification Needed\n\n`;
  md += `The following items require manual verification in Supabase SQL Editor:\n\n`;
  md += `### Indexes\n\n`;
  Object.entries(E02_TABLES).forEach(([tableName, spec]) => {
    if (spec.expectedIndexes) {
      md += `**${tableName}:**\n`;
      md += `\`\`\`sql\n`;
      md += `SELECT indexname, indexdef FROM pg_indexes \n`;
      md += `WHERE schemaname = 'public' AND tablename = '${tableName}';\n`;
      md += `\`\`\`\n`;
      md += `Expected: ${spec.expectedIndexes.join(', ')}\n\n`;
    }
  });
  
  md += `### RLS Policies\n\n`;
  md += `\`\`\`sql\n`;
  md += `SELECT tablename, policyname, cmd FROM pg_policies \n`;
  md += `WHERE schemaname = 'public' \n`;
  md += `AND tablename IN ('prompt_templates', 'generation_logs', 'template_analytics');\n`;
  md += `\`\`\`\n\n`;
  
  md += `### Triggers\n\n`;
  md += `\`\`\`sql\n`;
  md += `SELECT trigger_name, event_manipulation, event_object_table \n`;
  md += `FROM information_schema.triggers \n`;
  md += `WHERE trigger_schema = 'public'\n`;
  md += `AND event_object_table IN ('prompt_templates', 'generation_logs', 'template_analytics');\n`;
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
  md += `*Report generated by check-e02-sql-detailed.js*\n`;
  
  return md;
}

async function main() {
  console.log('🔍 E02 SQL Implementation Check');
  console.log('================================\n');
  console.log('Checking tables from 04-FR-wireframes-execution-E02.md');
  console.log('Expected tables: prompt_templates, generation_logs, template_analytics\n');
  
  const results = [];
  
  for (const [tableName, tableSpec] of Object.entries(E02_TABLES)) {
    const result = await analyzeTable(tableName, tableSpec);
    results.push(result);
    
    console.log(`\n📊 Result:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Category: ${result.category} - ${result.categoryDescription}`);
    if (result.renamed) {
      console.log(`   ⚠️  ACTUAL NAME: ${result.actualTableName}`);
    }
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
    console.log(`\n❌ CRITICAL ISSUES - Must fix before E03:`);
    critical.forEach(r => {
      console.log(`   • ${r.table}: ${r.categoryDescription}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS - Should address:`);
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
  const outputPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E02-sql-check.md');
  
  const markdownReport = formatMarkdownReport(results, timestamp);
  fs.writeFileSync(outputPath, markdownReport);
  
  console.log(`\n💾 Report saved to: ${outputPath}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);

