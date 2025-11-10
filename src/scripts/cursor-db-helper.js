#!/usr/bin/env node

/**
 * Cursor Database Helper
 * 
 * This script provides easy database querying for Cursor AI.
 * Run from the src directory: node scripts/cursor-db-helper.js [command] [args]
 * 
 * Examples:
 *   node scripts/cursor-db-helper.js list-tables
 *   node scripts/cursor-db-helper.js query conversations --limit 5
 *   node scripts/cursor-db-helper.js query chunks --where "title LIKE '%test%'"
 *   node scripts/cursor-db-helper.js describe conversations
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

const AVAILABLE_TABLES = [
  'conversations', 'chunks', 'scenarios', 'templates',
  'documents', 'categories', 'tags', 'workflow_sessions',
  'document_categories', 'document_tags', 'custom_tags', 'tag_dimensions'
];

async function listTables() {
  console.log('📋 Available Tables in Supabase:');
  console.log('================================');
  AVAILABLE_TABLES.forEach((table, index) => {
    console.log(`${index + 1}. ${table}`);
  });
}

async function listAllTables() {
  console.log('🔍 Discovering ALL tables in Supabase public schema:');
  console.log('===================================================');
  
  // Comprehensive list of possible table names to test
  const possibleTables = [
    // Core application tables
    'conversations', 'chunks', 'scenarios', 'templates',
    'users', 'profiles', 'documents', 'categories', 'tags',
    'workflow_sessions', 'document_categories', 'document_tags',
    'custom_tags', 'tag_dimensions', 'exports', 'imports',
    
    // Auth tables (Supabase default)
    'auth.users', 'auth.sessions', 'auth.refresh_tokens',
    'auth.instances', 'auth.audit_log_entries', 'auth.flow_state',
    'auth.identities', 'auth.mfa_amr_claims', 'auth.mfa_challenges',
    'auth.mfa_factors', 'auth.one_time_tokens', 'auth.saml_providers',
    'auth.saml_relay_states', 'auth.schema_migrations', 'auth.sso_domains',
    'auth.sso_providers',
    
    // Storage tables (Supabase default)
    'storage.buckets', 'storage.objects', 'storage.migrations',
    
    // Realtime tables (Supabase default)
    'realtime.schema_migrations', 'realtime.subscription',
    'realtime.messages',
    
    // Common application tables
    'posts', 'comments', 'likes', 'follows', 'notifications',
    'settings', 'permissions', 'roles', 'user_roles',
    'sessions', 'tokens', 'logs', 'analytics', 'metrics',
    'files', 'uploads', 'media', 'images', 'attachments',
    'projects', 'tasks', 'assignments', 'teams', 'organizations',
    'subscriptions', 'payments', 'invoices', 'plans',
    'feedback', 'reviews', 'ratings', 'surveys',
    'events', 'activities', 'history', 'audit_logs'
  ];
  
  console.log('Testing', possibleTables.length, 'possible table names...\n');
  
  const existingTables = [];
  const nonExistingTables = [];
  
  for (const tableName of possibleTables) {
    try {
      const { data, error } = await client.from(tableName).select('*').limit(1);
      
      if (!error) {
        existingTables.push(tableName);
        console.log(`✅ ${tableName}`);
      } else {
        nonExistingTables.push({ name: tableName, error: error.message });
        // Only show errors for tables we expect to exist
        if (['conversations', 'chunks', 'scenarios', 'templates', 'users', 'profiles'].includes(tableName)) {
          console.log(`❌ ${tableName} (${error.message})`);
        }
      }
    } catch (err) {
      nonExistingTables.push({ name: tableName, error: err.message });
    }
  }
  
  console.log('\n📋 COMPLETE TABLE INVENTORY:');
  console.log('============================');
  console.log('✅ EXISTING TABLES:');
  existingTables.forEach((table, index) => {
    console.log(`   ${index + 1}. ${table}`);
  });
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   • Total existing tables: ${existingTables.length}`);
  console.log(`   • Total tested names: ${possibleTables.length}`);
  console.log(`   • Success rate: ${((existingTables.length / possibleTables.length) * 100).toFixed(1)}%`);
}

async function describeTable(tableName) {
  if (!AVAILABLE_TABLES.includes(tableName)) {
    console.error(`❌ Table '${tableName}' not found. Available: ${AVAILABLE_TABLES.join(', ')}`);
    return;
  }

  console.log(`📊 Table Structure: ${tableName}`);
  console.log('='.repeat(30 + tableName.length));
  
  try {
    // Get a sample record to understand structure
    const { data, error } = await client.from(tableName).select('*').limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      const sample = data[0];
      console.log('Columns:');
      Object.keys(sample).forEach(column => {
        const value = sample[column];
        const type = typeof value;
        console.log(`  • ${column}: ${type} ${value === null ? '(nullable)' : ''}`);
      });
    } else {
      console.log('No data found in table');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function queryTable(tableName, options = {}) {
  if (!AVAILABLE_TABLES.includes(tableName)) {
    console.error(`❌ Table '${tableName}' not found. Available: ${AVAILABLE_TABLES.join(', ')}`);
    return;
  }

  console.log(`🔍 Querying: ${tableName}`);
  console.log('='.repeat(20 + tableName.length));

  try {
    let query = client.from(tableName).select('*');
    
    if (options.limit) {
      query = query.limit(parseInt(options.limit));
    }
    
    if (options.where) {
      // Simple where clause support (extend as needed)
      console.log(`Filter: ${options.where}`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`Found ${data.length} records:`);
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function countRecords(tableName) {
  if (!AVAILABLE_TABLES.includes(tableName)) {
    console.error(`❌ Table '${tableName}' not found. Available: ${AVAILABLE_TABLES.join(', ')}`);
    return;
  }

  try {
    const { count, error } = await client.from(tableName).select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`📊 ${tableName}: ${count} records`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function runSql(sqlQuery) {
  const q = sqlQuery.trim();

  const countMatch = q.match(/^SELECT\s+COUNT\(\*\)\s+FROM\s+(\w+)/i);
  if (countMatch) {
    const table = countMatch[1];
    const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    console.log(`${table}: ${count}`);
    return;
  }

  if (/SELECT\s+status,\s*COUNT\(\*\)\s+FROM\s+conversations\s+GROUP\s+BY\s+status/i.test(q)) {
    const { data, error } = await client.from('conversations').select('status');
    if (error) return console.error('❌ Error:', error.message);
    const total = data.length;
    const counts = {};
    data.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
      const pct = ((count / total) * 100).toFixed(2);
      console.log(`${status}\t${count}\t${pct}%`);
    });
    return;
  }

  if (/SELECT\s+tier,\s*COUNT\(\*\)\s+FROM\s+conversations\s+GROUP\s+BY\s+tier/i.test(q)) {
    const { data, error } = await client.from('conversations').select('tier,quality_score');
    if (error) return console.error('❌ Error:', error.message);
    const byTier = {};
    data.forEach(r => {
      const t = r.tier || 'NULL';
      const arr = byTier[t] || [];
      arr.push(r.quality_score || 0);
      byTier[t] = arr;
    });
    Object.entries(byTier).sort((a, b) => b[1].length - a[1].length).forEach(([tier, arr]) => {
      const count = arr.length;
      const avg = arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(2) : 'N/A';
      console.log(`${tier}\t${count}\tavg_quality=${avg}`);
    });
    return;
  }

  if (/SELECT\s+AVG\(quality_score\).*FROM\s+conversations/i.test(q)) {
    const { data, error } = await client.from('conversations').select('quality_score').not('quality_score', 'is', null);
    if (error) return console.error('❌ Error:', error.message);
    const scores = data.map(r => r.quality_score);
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    console.log(`avg_quality=${avg}\tmin=${min}\tmax=${max}`);
    return;
  }

  const recentMatch = q.match(/ORDER\s+BY\s+created_at\s+DESC\s+LIMIT\s+(\d+)/i);
  if (recentMatch && /FROM\s+conversations/i.test(q)) {
    const limit = parseInt(recentMatch[1], 10);
    const { data, error } = await client
      .from('conversations')
      .select('id,conversation_id,persona,emotion,status,tier,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return console.error('❌ Error:', error.message);
    data.forEach(r => console.log(JSON.stringify(r)));
    return;
  }

  if (/FROM\s+templates/i.test(q)) {
    const limMatch = q.match(/LIMIT\s+(\d+)/i);
    const limit = limMatch ? parseInt(limMatch[1], 10) : 5;
    const { data, error } = await client
      .from('templates')
      .select('id,template_name,category,tier,usage_count,is_active')
      .limit(limit);
    if (error) return console.error('❌ Error:', error.message);
    data.forEach(r => console.log(JSON.stringify(r)));
    return;
  }

  if (/JOIN\s+templates/i.test(q) && /FROM\s+conversations/i.test(q)) {
    const { data, error } = await client
      .from('conversations')
      .select('conversation_id,parent_id,parent_type')
      .eq('parent_type', 'template')
      .limit(10);
    if (error) return console.error('❌ Error:', error.message);
    const ids = [...new Set(data.map(r => r.parent_id).filter(Boolean))];
    if (ids.length) {
      const { data: tdata, error: terr } = await client.from('templates').select('id,template_name').in('id', ids);
      if (terr) return console.error('❌ Error:', terr.message);
      const nameMap = Object.fromEntries(tdata.map(t => [t.id, t.template_name]));
      data.forEach(r => {
        console.log(`${r.conversation_id}\t${r.parent_id}\t${nameMap[r.parent_id] || 'UNKNOWN'}`);
      });
    } else {
      console.log('No template-linked conversations found.');
    }
    return;
  }

  if (/jsonb_typeof\s*\(\s*parameters\s*\)/i.test(q)) {
    const { data, error } = await client.from('conversations').select('id,parameters,review_history').limit(5);
    if (error) return console.error('❌ Error:', error.message);
    data.forEach(r => {
      const paramsType = r.parameters && typeof r.parameters === 'object' ? 'object' : typeof r.parameters;
      const reviewType = Array.isArray(r.review_history) ? 'array' : (r.review_history && typeof r.review_history);
      console.log(`${r.id}\tparams_type=${paramsType}\treview_type=${reviewType}`);
    });
    return;
  }

  if (/id\s*!~\s*'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\$'/i.test(q)) {
    const { data, error } = await client.from('conversations').select('id,conversation_id').limit(50);
    if (error) return console.error('❌ Error:', error.message);
    const bad = data.filter(r => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(r.id));
    bad.slice(0, 5).forEach(r => console.log(`${r.id}\t${r.conversation_id}`));
    if (bad.length === 0) console.log('No invalid UUIDs found.');
    return;
  }

  if (/created_at\s*>\s*updated_at/i.test(q)) {
    const { data, error } = await client.from('conversations').select('id,created_at,updated_at').limit(50);
    if (error) return console.error('❌ Error:', error.message);
    const invalid = data.filter(r => new Date(r.created_at) > new Date(r.updated_at));
    invalid.slice(0, 5).forEach(r => console.log(`${r.id}\tcreated_at=${r.created_at}\tupdated_at=${r.updated_at}`));
    if (invalid.length === 0) console.log('All timestamps valid.');
    return;
  }

  console.log('⚠️ Unsupported SQL pattern for helper. Try built-in commands or Supabase SQL Editor.');
}

// Main command handler
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'list-tables':
      await listTables();
      break;
      
    case 'list-all-tables':
      await listAllTables();
      break;
      
    case 'describe':
      const describeTable_name = args[1];
      if (!describeTable_name) {
        console.error('❌ Please specify a table name');
        return;
      }
      await describeTable(describeTable_name);
      break;
      
    case 'query':
      const queryTableName = args[1];
      if (!queryTableName) {
        console.error('❌ Please specify a table name');
        return;
      }
      
      const options = {};
      for (let i = 2; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];
        if (flag === '--limit') options.limit = value;
        if (flag === '--where') options.where = value;
      }
      
      await queryTable(queryTableName, options);
      break;
      
    case 'count':
      const countTableName = args[1];
      if (!countTableName) {
        console.error('❌ Please specify a table name');
        return;
      }
      await countRecords(countTableName);
      break;
      
    case 'sql':
      const sqlQuery = args.slice(1).join(' ');
      if (!sqlQuery) {
        console.error('❌ Please provide a SQL SELECT query string in quotes');
        return;
      }
      await runSql(sqlQuery);
      break;
      
    default:
      console.log('🔧 Cursor Database Helper');
      console.log('========================');
      console.log('Available commands:');
      console.log('  list-tables                    - List known available tables');
      console.log('  list-all-tables               - Discover ALL tables in database');
      console.log('  describe <table>               - Show table structure');
      console.log('  query <table> [--limit N]      - Query table data');
      console.log('  count <table>                  - Count records in table');
      console.log('  sql \"SELECT ...\"               - Run supported SELECT queries');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/cursor-db-helper.js list-tables');
      console.log('  node scripts/cursor-db-helper.js list-all-tables');
      console.log('  node scripts/cursor-db-helper.js describe conversations');
      console.log('  node scripts/cursor-db-helper.js query chunks --limit 5');
      console.log('  node scripts/cursor-db-helper.js count templates');
  }
}

main().catch(console.error);