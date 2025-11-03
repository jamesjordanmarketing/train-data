#!/usr/bin/env node

/**
 * Check ALL tables in the database to see what actually exists
 * This will help us understand the complete database structure
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

// Tables to check
const TABLES_TO_CHECK = [
  'conversations',
  'conversation_turns',
  'conversation_templates',
  'prompt_templates',
  'generation_logs',
  'template_analytics',
  'scenarios',
  'edge_cases',
  'export_logs',
  'batch_jobs',
  'user_profiles',
  'users',
  'profiles'
];

async function checkTableExists(tableName) {
  try {
    const { data, error } = await client.from(tableName).select('*').limit(0);
    return !error;
  } catch (err) {
    return false;
  }
}

async function getTableInfo(tableName) {
  try {
    // Try to get sample data
    const { data, error, count } = await client.from(tableName).select('*', { count: 'exact' }).limit(1);
    
    if (error) {
      return {
        exists: false,
        error: error.message
      };
    }
    
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    return {
      exists: true,
      rowCount: count || 0,
      columns: columns,
      sampleData: data && data.length > 0 ? data[0] : null
    };
  } catch (err) {
    return {
      exists: false,
      error: err.message
    };
  }
}

async function main() {
  console.log('🔍 Database Table Inspector\n');
  console.log('=' .repeat(80));
  console.log('Checking all relevant tables in the database...\n');
  
  const results = [];
  
  for (const tableName of TABLES_TO_CHECK) {
    process.stdout.write(`Checking ${tableName.padEnd(30)}... `);
    
    const info = await getTableInfo(tableName);
    results.push({
      table: tableName,
      ...info
    });
    
    if (info.exists) {
      console.log(`✅ EXISTS (${info.rowCount} rows, ${info.columns.length} columns)`);
    } else {
      console.log(`❌ NOT FOUND`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 DETAILED RESULTS\n');
  
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);
  
  console.log(`\n✅ EXISTING TABLES (${existing.length}):\n`);
  existing.forEach(r => {
    console.log(`${r.table}:`);
    console.log(`  Rows: ${r.rowCount}`);
    console.log(`  Columns: ${r.columns.length > 0 ? r.columns.join(', ') : 'Cannot determine (empty table or RLS)'}`);
    console.log('');
  });
  
  console.log(`\n❌ MISSING TABLES (${missing.length}):\n`);
  missing.forEach(r => {
    console.log(`  • ${r.table}`);
  });
  
  // Special focus on template tables
  console.log('\n' + '='.repeat(80));
  console.log('🎯 TEMPLATE TABLES ANALYSIS\n');
  
  const conversationTemplates = results.find(r => r.table === 'conversation_templates');
  const promptTemplates = results.find(r => r.table === 'prompt_templates');
  
  console.log('conversation_templates:');
  if (conversationTemplates && conversationTemplates.exists) {
    console.log(`  ✅ EXISTS`);
    console.log(`  Rows: ${conversationTemplates.rowCount}`);
    console.log(`  Columns (${conversationTemplates.columns.length}): ${conversationTemplates.columns.join(', ')}`);
  } else {
    console.log(`  ❌ DOES NOT EXIST`);
  }
  
  console.log('\nprompt_templates:');
  if (promptTemplates && promptTemplates.exists) {
    console.log(`  ✅ EXISTS`);
    console.log(`  Rows: ${promptTemplates.rowCount}`);
    console.log(`  Columns (${promptTemplates.columns.length}): ${promptTemplates.columns.join(', ')}`);
  } else {
    console.log(`  ❌ DOES NOT EXIST`);
  }
  
  if (conversationTemplates?.exists && promptTemplates?.exists) {
    console.log('\n⚠️  WARNING: Both conversation_templates AND prompt_templates exist!');
    console.log('   This may indicate a naming conflict or duplicate tables.');
  } else if (conversationTemplates?.exists && !promptTemplates?.exists) {
    console.log('\n📋 FINDING: Database has conversation_templates but NOT prompt_templates');
    console.log('   Code expects: prompt_templates');
    console.log('   Database has: conversation_templates');
    console.log('   Action: Rename table OR update code references');
  } else if (!conversationTemplates?.exists && promptTemplates?.exists) {
    console.log('\n✅ OK: Database has prompt_templates as expected by code');
  }
  
  // Save results
  const outputPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/database-table-inventory.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      existing: existing.length,
      missing: missing.length
    },
    tables: results
  }, null, 2));
  
  console.log(`\n\n💾 Results saved to: ${outputPath}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);

