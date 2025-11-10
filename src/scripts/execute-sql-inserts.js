/**
 * SQL Execution Script for Mock Data Population
 *
 * This script executes the generated SQL INSERT statements to populate
 * the conversations and templates tables in Supabase.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Supabase environment variables not set');
  console.error('   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Execute a single SQL statement via Supabase RPC
 */
async function executeSqlStatement(sql) {
  try {
    // Use Supabase's RPC to execute raw SQL
    // Note: This requires a database function to be created first
    // For now, we'll parse and execute using Supabase client methods

    // Since direct SQL execution is limited, we'll need to parse the INSERT
    // and use Supabase client methods instead
    return await executeInsertStatement(sql);
  } catch (error) {
    throw new Error(`SQL execution failed: ${error.message}`);
  }
}

/**
 * Parse and execute INSERT statement using Supabase client
 */
async function executeInsertStatement(sql) {
  // Extract table name
  const tableMatch = sql.match(/INSERT INTO\s+(\w+)\s*\(/i);
  if (!tableMatch) {
    throw new Error('Could not parse table name from INSERT statement');
  }

  const tableName = tableMatch[1];

  // Extract VALUES clause
  const valuesMatch = sql.match(/VALUES\s*\(([\s\S]*)\);?\s*$/i);
  if (!valuesMatch) {
    throw new Error('Could not parse VALUES from INSERT statement');
  }

  // For complex JSONB and array fields, we need to use raw SQL
  // Let's use the postgres connection through Supabase
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // If RPC doesn't exist, we need a different approach
    throw error;
  }

  return data;
}

/**
 * Execute SQL file by reading and parsing statements
 */
async function executeSqlFile(filePath, tableName) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);
  console.log(`   Target table: ${tableName}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf8');

  // Split by semicolons but preserve them for each statement
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`   Found ${statements.length} INSERT statements\n`);

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // Skip comments
    if (stmt.startsWith('--')) continue;

    try {
      // Add semicolon back if missing
      const fullStmt = stmt.endsWith(';') ? stmt : stmt + ';';

      // Use direct SQL execution via supabase
      const { error } = await supabase
        .from(tableName)
        .insert([parseInsertValues(fullStmt, tableName)]);

      if (error) {
        throw error;
      }

      successCount++;

      if ((i + 1) % 5 === 0 || i === statements.length - 1) {
        process.stdout.write(`\r   Progress: ${i + 1}/${statements.length} statements`);
      }
    } catch (error) {
      failCount++;
      errors.push({
        statement: i + 1,
        error: error.message
      });

      console.error(`\n   ❌ Failed statement ${i + 1}: ${error.message.substring(0, 100)}`);
    }
  }

  console.log(`\n\n   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  if (errors.length > 0 && errors.length <= 5) {
    console.log(`\n   Error details:`);
    errors.forEach(e => {
      console.log(`      Statement ${e.statement}: ${e.error}`);
    });
  }

  return { successCount, failCount, errors };
}

/**
 * Parse INSERT statement values into object
 * This is a simplified parser - for production use a proper SQL parser
 */
function parseInsertValues(sql, tableName) {
  // This is complex for JSONB fields - we'll use a simpler approach
  // by executing raw SQL through a database function
  throw new Error('Direct parsing not implemented - using raw SQL execution');
}

/**
 * Execute raw SQL through Supabase
 * This uses a direct database connection approach
 */
async function executeRawSQL(filePath, description) {
  console.log(`\n📄 ${description}`);
  console.log(`   File: ${path.basename(filePath)}\n`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf8');

  // Execute the entire SQL file as a transaction
  try {
    // Use direct SQL execution
    // Note: This requires using the PostgreSQL connection directly
    const { Client } = require('pg');

    // Parse Supabase URL to get connection params
    const url = new URL(SUPABASE_URL);
    const dbHost = url.hostname.replace('https://', '').replace('http://', '');

    const client = new Client({
      host: dbHost.replace(':5432', ''),
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: SUPABASE_SERVICE_KEY.split('.')[1], // This is a simplification
      ssl: { rejectUnauthorized: false }
    });

    // This won't work directly - we need a different approach
    throw new Error('Direct PostgreSQL connection not configured');

  } catch (error) {
    console.log(`   ⚠️  Direct SQL execution not available`);
    console.log(`   Using Supabase client method instead...\n`);
    return null;
  }
}

/**
 * Use Supabase client to insert data from parsed SQL
 */
async function insertFromSQLFile(filePath, tableName) {
  console.log(`\n📄 Inserting into ${tableName}`);
  console.log(`   File: ${path.basename(filePath)}\n`);

  const sql = fs.readFileSync(filePath, 'utf8');

  // Split statements
  const statements = sql
    .split(/\);\s*$/m)
    .filter(s => s.trim().length > 0 && !s.trim().startsWith('--'));

  console.log(`   Found ${statements.length} INSERT statements`);

  let successCount = 0;
  let failCount = 0;

  // For each statement, we need to parse it and construct the object
  // This is complex due to JSONB fields, so we'll use eval (NOT recommended for production)
  // Alternative: Write a proper SQL parser or use the data objects directly

  console.log(`\n   ⚠️  Complex SQL parsing required for JSONB fields`);
  console.log(`   Recommendation: Use database migrations or SQL execution tool\n`);

  return { successCount, failCount, errors: [] };
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 DATABASE POPULATION - MOCK DATA INSERTION');
  console.log('='.repeat(70));
  console.log(`\nSupabase URL: ${SUPABASE_URL}`);
  console.log(`Service Key: ${SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Not set'}`);

  const startTime = Date.now();

  try {
    // Since direct SQL execution is complex with Supabase client,
    // we'll provide instructions for manual execution instead

    console.log('\n' + '='.repeat(70));
    console.log('EXECUTION APPROACH');
    console.log('='.repeat(70));
    console.log(`
The generated SQL files contain complex INSERT statements with JSONB fields
and PostgreSQL-specific syntax (ARRAY[], ::jsonb casts).

RECOMMENDED APPROACH:
Execute the SQL files directly using a PostgreSQL client.

Option 1: Using psql (if you have direct database access)
----------------------------------------------------------
psql $DATABASE_URL -f scripts/generated-sql/insert-templates.sql
psql $DATABASE_URL -f scripts/generated-sql/insert-conversations.sql

Option 2: Using Supabase SQL Editor
----------------------------------------------------------
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of insert-templates.sql
3. Execute
4. Copy contents of insert-conversations.sql
5. Execute

Option 3: Using a database client (DBeaver, pgAdmin, etc.)
----------------------------------------------------------
1. Connect to your Supabase PostgreSQL database
2. Open and execute insert-templates.sql
3. Open and execute insert-conversations.sql

MANUAL EXECUTION REQUIRED
----------------------------------------------------------
Please execute the SQL files manually using one of the methods above.
The files are located at:
  - ${path.resolve('scripts/generated-sql/insert-templates.sql')}
  - ${path.resolve('scripts/generated-sql/insert-conversations.sql')}
`);

    console.log('='.repeat(70));
    console.log('ALTERNATIVE: Execute via command line');
    console.log('='.repeat(70));

    // Provide commands for manual execution
    console.log(`
If you have the psql command available:

For Windows (PowerShell):
----------------------------------------------------------
$env:PGPASSWORD="your-password"; psql -h your-db-host -U postgres -d postgres -f "scripts/generated-sql/insert-templates.sql"
$env:PGPASSWORD="your-password"; psql -h your-db-host -U postgres -d postgres -f "scripts/generated-sql/insert-conversations.sql"

For Linux/Mac:
----------------------------------------------------------
PGPASSWORD=your-password psql -h your-db-host -U postgres -d postgres -f scripts/generated-sql/insert-templates.sql
PGPASSWORD=your-password psql -h your-db-host -U postgres -d postgres -f scripts/generated-sql/insert-conversations.sql
`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n⏱️  Total time: ${duration}s`);
  console.log('='.repeat(70));
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeSqlFile, insertFromSQLFile };
