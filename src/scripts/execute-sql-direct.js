#!/usr/bin/env node

/**
 * Direct SQL Execution for Mock Data Population
 *
 * This script uses the pg (PostgreSQL) client to execute the generated SQL files directly.
 * This is the most reliable method for inserting data with complex JSONB fields.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// ============================================================================
// Load Environment Variables
// ============================================================================

function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');

  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env.local file not found');
    console.error(`   Expected location: ${envPath}`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes

    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  return envVars;
}

// ============================================================================
// Database Connection
// ============================================================================

async function createDbClient(envVars) {
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  }

  // Parse Supabase URL to extract connection parameters
  // Supabase URL format: https://[project-ref].supabase.co
  // Database URL format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

  const url = new URL(supabaseUrl);
  const projectRef = url.hostname.split('.')[0];
  const dbHost = `db.${projectRef}.supabase.co`;

  // Get database password from service role key or ask user
  const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('\n📡 Database Connection Info:');
  console.log(`   Project: ${projectRef}`);
  console.log(`   Host: ${dbHost}`);
  console.log(`   Database: postgres`);
  console.log(`   User: postgres`);

  // Construct connection string from DATABASE_URL if available
  const databaseUrl = envVars.DATABASE_URL;

  if (databaseUrl) {
    console.log('   ✅ Using DATABASE_URL from environment\n');
    return new Client({ connectionString: databaseUrl });
  }

  // If no DATABASE_URL, we need the database password
  console.log('\n⚠️  DATABASE_URL not found in .env.local');
  console.log('   To execute SQL directly, you need database credentials.');
  console.log('\n   Please use one of these methods instead:');
  console.log('   1. Supabase SQL Editor (Dashboard → SQL Editor)');
  console.log('   2. Add DATABASE_URL to .env.local');
  console.log('   3. Use supabase link and supabase db push commands\n');

  throw new Error('Database connection not configured');
}

// ============================================================================
// SQL Execution
// ============================================================================

async function executeSqlFile(client, filePath, description) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📄 ${description}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`File: ${path.basename(filePath)}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const fileSize = (fs.statSync(filePath).size / 1024).toFixed(2);
  console.log(`Size: ${fileSize} KB`);

  // Count INSERT statements
  const insertCount = (sql.match(/INSERT INTO/gi) || []).length;
  console.log(`Statements: ${insertCount} INSERTs\n`);

  try {
    console.log('⏳ Executing SQL...');
    const startTime = Date.now();

    // Execute the entire SQL file as a single transaction
    await client.query('BEGIN');

    try {
      const result = await client.query(sql);
      await client.query('COMMIT');

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`✅ Success!`);
      console.log(`   Duration: ${duration}s`);
      console.log(`   Rows affected: ${result.rowCount || insertCount}`);

      return { success: true, rowCount: result.rowCount || insertCount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.log(`❌ Failed!`);
    console.log(`   Error: ${error.message}`);

    // Show more context for SQL errors
    if (error.position) {
      const position = parseInt(error.position);
      const context = sql.substring(Math.max(0, position - 100), position + 100);
      console.log(`\n   Error context:`);
      console.log(`   ${context}`);
    }

    throw error;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 MOCK DATA POPULATION - SQL EXECUTION');
  console.log('='.repeat(70));

  const startTime = Date.now();

  try {
    // Load environment variables
    console.log('\n📋 Loading environment variables...');
    const envVars = loadEnv();
    console.log('   ✅ Environment loaded');

    // Check if we can connect to database
    let client;
    let canConnectDirectly = false;

    try {
      client = await createDbClient(envVars);
      await client.connect();
      console.log('   ✅ Database connected');
      canConnectDirectly = true;
    } catch (error) {
      console.log(`   ⚠️  Direct connection not available`);
      canConnectDirectly = false;
    }

    if (canConnectDirectly && client) {
      // Execute SQL files
      const results = [];

      // Execute templates first (might be referenced by conversations)
      results.push(await executeSqlFile(
        client,
        path.join(__dirname, 'generated-sql/insert-templates-schema-corrected.sql'),
        'INSERTING TEMPLATES'
      ));

      // Execute conversations
      results.push(await executeSqlFile(
        client,
        path.join(__dirname, 'generated-sql/insert-conversations-fixed.sql'),
        'INSERTING CONVERSATIONS'
      ));

      // Close connection
      await client.end();

      // Summary
      console.log(`\n${'='.repeat(70)}`);
      console.log('📊 EXECUTION SUMMARY');
      console.log(`${'='.repeat(70)}`);
      const totalRows = results.reduce((sum, r) => sum + (r.rowCount || 0), 0);
      console.log(`Total rows inserted: ${totalRows}`);
      console.log(`Templates: ${results[0].rowCount || 'N/A'}`);
      console.log(`Conversations: ${results[1].rowCount || 'N/A'}`);

    } else {
      // Provide manual execution instructions
      console.log(`\n${'='.repeat(70)}`);
      console.log('📖 MANUAL EXECUTION REQUIRED');
      console.log(`${'='.repeat(70)}`);
      console.log(`
Direct database connection is not configured. Please execute the SQL files manually.

METHOD 1: Supabase SQL Editor (Recommended)
------------------------------------------------------------
1. Go to: https://supabase.com/dashboard/project/[your-project]/sql
2. Open file: scripts/generated-sql/insert-templates.sql
3. Copy entire contents and paste into SQL Editor
4. Click "Run" to execute
5. Repeat for: scripts/generated-sql/insert-conversations.sql

METHOD 2: Using psql Command Line
------------------------------------------------------------
If you have psql installed and database credentials:

psql "postgresql://postgres:[password]@[host]:5432/postgres" \\
  -f "scripts/generated-sql/insert-templates.sql"

psql "postgresql://postgres:[password]@[host]:5432/postgres" \\
  -f "scripts/generated-sql/insert-conversations.sql"

METHOD 3: Using Database Client (DBeaver, TablePlus, etc.)
------------------------------------------------------------
1. Connect to your Supabase PostgreSQL database
2. Open SQL editor
3. Load and execute insert-templates.sql
4. Load and execute insert-conversations.sql

FILE LOCATIONS:
------------------------------------------------------------
Templates: ${path.resolve(__dirname, 'generated-sql/insert-templates.sql')}
Conversations: ${path.resolve(__dirname, 'generated-sql/insert-conversations.sql')}

After manual execution, run verification:
node scripts/verify-data-insertion.js
`);
    }

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n⏱️  Total execution time: ${duration}s`);
  console.log('='.repeat(70));
}

// Run if executed directly
if (require.main === module) {
  main().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}

module.exports = { executeSqlFile };
