/**
 * Database Introspection Script v3 - Supabase Client Method
 *
 * Works without DATABASE_URL by using Supabase client to probe tables directly
 * Verifies templates and conversations tables for E02 module
 *
 * Usage: node introspect-db-objects_v3.js
 * Output: src/scripts/generated-sql/db-introspection.md
 */

require('dotenv').config({ path: '../../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

let report = [];

/**
 * Add section to report
 */
function addSection(title, content) {
  report.push(`\n## ${title}\n`);
  report.push(content);
}

/**
 * Probe a table to see if it exists and get sample data
 */
async function probeTable(tableName) {
  console.log(`🔍 Probing ${tableName}...`);

  try {
    // Try to get one row to verify table exists
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: false })
      .limit(1);

    if (error) {
      return { exists: false, error: error.message };
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    // Extract column names from sample data
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

    return {
      exists: true,
      rowCount: totalCount || 0,
      columns: columns,
      sampleData: data && data.length > 0 ? data[0] : null
    };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

/**
 * Analyze column types from sample data
 */
function analyzeColumns(sampleData) {
  if (!sampleData) return [];

  const columns = [];

  for (const [key, value] of Object.entries(sampleData)) {
    let type = 'unknown';
    let nullable = value === null;

    if (value === null) {
      type = 'NULL (type unknown)';
    } else if (typeof value === 'string') {
      // Check if it's a UUID
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        type = 'uuid';
      } else if (Date.parse(value) && value.includes('T')) {
        type = 'timestamp';
      } else {
        type = `text (max ${value.length})`;
      }
    } else if (typeof value === 'number') {
      type = Number.isInteger(value) ? 'integer' : 'numeric';
    } else if (typeof value === 'boolean') {
      type = 'boolean';
    } else if (Array.isArray(value)) {
      type = 'array';
    } else if (typeof value === 'object') {
      type = 'jsonb';
    }

    columns.push({
      name: key,
      inferredType: type,
      nullable: nullable,
      sampleValue: value === null ? 'NULL' : JSON.stringify(value).substring(0, 50)
    });
  }

  return columns;
}

/**
 * Format columns as markdown table
 */
function formatColumnsTable(columns) {
  if (!columns || columns.length === 0) {
    return '*No columns found*\n';
  }

  let table = '| Column Name | Inferred Type | Nullable | Sample Value |\n';
  table += '| --- | --- | --- | --- |\n';

  columns.forEach(col => {
    table += `| ${col.name} | ${col.inferredType} | ${col.nullable ? 'YES' : 'NO'} | ${col.sampleValue} |\n`;
  });

  return table;
}

/**
 * Test insert capability
 */
async function testInsertCapability(tableName, testData) {
  console.log(`✍️  Testing insert capability for ${tableName}...`);

  try {
    // Try to insert test data
    const { data, error } = await supabase
      .from(tableName)
      .insert(testData)
      .select();

    if (error) {
      return {
        canInsert: false,
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details
      };
    }

    // If successful, delete the test row
    if (data && data.length > 0) {
      const testId = data[0].id;
      await supabase
        .from(tableName)
        .delete()
        .eq('id', testId);
    }

    return {
      canInsert: true,
      message: 'Insert test successful (row created and deleted)'
    };
  } catch (err) {
    return {
      canInsert: false,
      error: err.message
    };
  }
}

/**
 * Analyze table for E02 compatibility
 */
async function analyzeE02Table(tableName, requiredColumns) {
  console.log(`📋 Analyzing ${tableName} for E02 compatibility...`);

  const result = await probeTable(tableName);

  if (!result.exists) {
    addSection(`${tableName.toUpperCase()} - ❌ NOT FOUND`,
      `**Error**: ${result.error}\n\n⛔ **HARD BLOCK**: Table does not exist in database\n`);
    return { compatible: false, reason: 'Table not found' };
  }

  // Add basic info
  addSection(`${tableName.toUpperCase()} - ✅ EXISTS`,
    `**Row Count**: ${result.rowCount}\n\n**Column Count**: ${result.columns.length}\n`);

  // Analyze columns
  const columnAnalysis = analyzeColumns(result.sampleData);
  addSection(`Columns (inferred from sample data)`, formatColumnsTable(columnAnalysis));

  // Check required columns
  const missingColumns = requiredColumns.filter(req => !result.columns.includes(req));

  if (missingColumns.length > 0) {
    addSection(`Required Columns Check`,
      `⚠️ **Missing columns**: ${missingColumns.join(', ')}\n\n` +
      `Present columns: ${result.columns.join(', ')}\n`);
    return { compatible: false, reason: `Missing columns: ${missingColumns.join(', ')}` };
  } else {
    addSection(`Required Columns Check`,
      `✅ All required columns present: ${requiredColumns.join(', ')}\n`);
  }

  // Add sample data
  if (result.sampleData) {
    addSection(`Sample Record`,
      '```json\n' + JSON.stringify(result.sampleData, null, 2) + '\n```\n');
  }

  return { compatible: true, columns: result.columns, rowCount: result.rowCount };
}

/**
 * Discover all tables
 */
async function discoverTables() {
  console.log('🔎 Discovering tables...');

  const knownTables = [
    'templates', 'conversations', 'scenarios', 'edge_cases',
    'turns', 'reviews', 'categories', 'personas', 'emotions', 'topics',
    'conversation_templates', 'template_scenarios', 'scenario_edge_cases',
    'export_logs', 'ai_configs', 'settings',
    'documents', 'chunks', 'tags', 'workflow_sessions',
    'document_categories', 'document_tags', 'custom_tags', 'tag_dimensions'
  ];

  const foundTables = [];

  for (const table of knownTables) {
    const { data, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      foundTables.push(table);
      console.log(`  ✅ ${table}`);
    }
  }

  return foundTables;
}

/**
 * Main execution
 */
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Database Introspection Script v3');
  console.log('  Method: Supabase Client Direct Probing');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Service Role: ✅ Configured`);
  console.log('═══════════════════════════════════════════════════\n');

  // Initialize report
  report.push('# Database Introspection Report\n');
  report.push(`**Generated**: ${new Date().toISOString()}\n`);
  report.push(`**Method**: Supabase Client Direct Probing\n`);
  report.push(`**Database**: ${supabaseUrl}\n`);
  report.push(`\n*Note: This method infers schema from actual data. Types are approximate.*\n`);

  try {
    // Discover all tables
    const allTables = await discoverTables();

    addSection('Discovered Tables',
      `Found **${allTables.length}** accessible tables:\n\n` +
      allTables.map(t => `- ${t}`).join('\n') + '\n');

    report.push('\n---\n');

    // E02 Required columns
    const e02Requirements = {
      templates: ['id', 'template_name', 'description', 'category', 'tier', 'template_text'],
      conversations: ['id', 'template_id', 'scenario_id', 'conversation_data', 'status']
    };

    // Analyze templates table
    report.push('\n# TEMPLATES TABLE ANALYSIS\n');
    const templatesResult = await analyzeE02Table('templates', e02Requirements.templates);

    report.push('\n---\n');

    // Analyze conversations table
    report.push('\n# CONVERSATIONS TABLE ANALYSIS\n');
    const conversationsResult = await analyzeE02Table('conversations', e02Requirements.conversations);

    report.push('\n---\n');

    // E02 Compatibility Summary
    report.push('\n# E02 COMPATIBILITY SUMMARY\n');

    let summary = '\n';

    if (templatesResult.compatible && conversationsResult.compatible) {
      summary += '## ✅ FULLY COMPATIBLE\n\n';
      summary += 'Both `templates` and `conversations` tables exist with all required columns.\n\n';
      summary += '**Ready for E02 mock data insertion**\n\n';
      summary += `- Templates table: ${templatesResult.rowCount} rows, ${templatesResult.columns.length} columns\n`;
      summary += `- Conversations table: ${conversationsResult.rowCount} rows, ${conversationsResult.columns.length} columns\n`;
    } else {
      summary += '## ❌ COMPATIBILITY ISSUES DETECTED\n\n';
      if (!templatesResult.compatible) {
        summary += `⛔ **Templates**: ${templatesResult.reason}\n\n`;
      }
      if (!conversationsResult.compatible) {
        summary += `⛔ **Conversations**: ${conversationsResult.reason}\n\n`;
      }
      summary += '**HARD BLOCK**: Cannot proceed with E02 mock data insertion until issues are resolved.\n';
    }

    addSection('E02 Readiness', summary);

    // Write report
    const outputPath = path.join(__dirname, 'generated-sql', 'db-introspection.md');
    fs.writeFileSync(outputPath, report.join('\n'));

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  ✅ Introspection Complete');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\nReport saved to: ${outputPath}\n`);

    // Print summary
    console.log('SUMMARY:');
    console.log(`- Total accessible tables: ${allTables.length}`);
    console.log(`- Templates table: ${templatesResult.compatible ? '✅ Compatible' : '❌ Issues found'}`);
    console.log(`- Conversations table: ${conversationsResult.compatible ? '✅ Compatible' : '❌ Issues found'}`);

    if (templatesResult.compatible && conversationsResult.compatible) {
      console.log('\n✅ NO BLOCKING ISSUES - Ready for E02 mock data insertion\n');
    } else {
      console.log('\n⛔ HARD BLOCK - Schema compatibility issues detected\n');
      process.exit(1);
    }

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Run
main().catch(err => {
  console.error('\n❌ FATAL ERROR:', err.message);
  process.exit(1);
});
