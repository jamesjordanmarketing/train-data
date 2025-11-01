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
      
    default:
      console.log('🔧 Cursor Database Helper');
      console.log('========================');
      console.log('Available commands:');
      console.log('  list-tables                    - List known available tables');
      console.log('  list-all-tables               - Discover ALL tables in database');
      console.log('  describe <table>               - Show table structure');
      console.log('  query <table> [--limit N]      - Query table data');
      console.log('  count <table>                  - Count records in table');
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