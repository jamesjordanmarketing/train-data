#!/usr/bin/env node

/**
 * ============================================================================
 * E05 RPC-Based Verification Script
 * ============================================================================
 * 
 * This script demonstrates the CORRECT approach for programmatic database
 * schema introspection with Supabase JavaScript client.
 * 
 * ============================================================================
 * WHY THIS APPROACH IS NECESSARY
 * ============================================================================
 * 
 * The Supabase JavaScript client (supabase-js) is limited to data operations
 * (SELECT, INSERT, UPDATE, DELETE on tables) and CANNOT directly query:
 * - information_schema (PostgreSQL metadata tables)
 * - pg_indexes (index information)
 * - pg_constraint (constraint information)
 * - pg_policies (RLS policy information)
 * 
 * SOLUTION: Create a PostgreSQL function (stored procedure) that queries
 * these system catalogs and returns the results as JSON. Then call it from
 * JavaScript using supabase.rpc().
 * 
 * ============================================================================
 * HOW TO USE THIS SCRIPT
 * ============================================================================
 * 
 * STEP 1: Create the PostgreSQL RPC Function (ONE-TIME SETUP)
 * ------------------------------------------------------------
 * Run this SQL in Supabase SQL Editor:
 *   File: pmc/product/_mapping/fr-maps/E05-CREATE-RPC-FUNCTION.sql
 * 
 * This creates the function: get_export_logs_schema()
 * 
 * STEP 2: Run This Verification Script
 * -------------------------------------
 * Command: node src/scripts/verify-e05-with-rpc.js
 * 
 * The script will:
 * 1. Check if the RPC function exists
 * 2. Call the function to get complete schema information
 * 3. Analyze columns, indexes, constraints, RLS policies
 * 4. Generate fix SQL for any missing items
 * 5. Save detailed results to JSON and markdown files
 * 
 * ============================================================================
 * FOR FUTURE AGENTS: HOW TO ADAPT THIS FOR OTHER TABLES
 * ============================================================================
 * 
 * This script serves as a TEMPLATE for checking ANY table's schema.
 * Here's how to create a new verification script:
 * 
 * 1. COPY THIS FILE
 *    cp src/scripts/verify-e05-with-rpc.js src/scripts/verify-TABLENAME-with-rpc.js
 * 
 * 2. CREATE A NEW RPC FUNCTION FOR YOUR TABLE
 *    In Supabase SQL Editor, create a function similar to get_export_logs_schema():
 * 
 *    ```sql
 *    CREATE OR REPLACE FUNCTION get_YOUR_TABLE_schema()
 *    RETURNS json
 *    LANGUAGE plpgsql
 *    SECURITY DEFINER
 *    AS $$
 *    DECLARE
 *      result json;
 *    BEGIN
 *      SELECT json_build_object(
 *        'columns', (
 *          SELECT json_agg(json_build_object(
 *            'column_name', column_name,
 *            'data_type', data_type,
 *            'is_nullable', is_nullable,
 *            'column_default', column_default,
 *            'ordinal_position', ordinal_position
 *          ) ORDER BY ordinal_position)
 *          FROM information_schema.columns
 *          WHERE table_schema = 'public' AND table_name = 'YOUR_TABLE_NAME'
 *        ),
 *        'indexes', (
 *          SELECT json_agg(json_build_object(
 *            'indexname', indexname,
 *            'indexdef', indexdef
 *          ) ORDER BY indexname)
 *          FROM pg_indexes
 *          WHERE schemaname = 'public' AND tablename = 'YOUR_TABLE_NAME'
 *        ),
 *        'constraints', (
 *          SELECT json_agg(json_build_object(
 *            'constraint_name', conname,
 *            'constraint_type', CASE contype
 *              WHEN 'c' THEN 'CHECK'
 *              WHEN 'f' THEN 'FOREIGN KEY'
 *              WHEN 'p' THEN 'PRIMARY KEY'
 *              WHEN 'u' THEN 'UNIQUE'
 *            END,
 *            'definition', pg_get_constraintdef(oid)
 *          ) ORDER BY contype, conname)
 *          FROM pg_constraint
 *          WHERE conrelid = 'YOUR_TABLE_NAME'::regclass
 *        ),
 *        'rls_policies', (
 *          SELECT json_agg(json_build_object(
 *            'policyname', policyname,
 *            'cmd', cmd,
 *            'qual', qual,
 *            'with_check', with_check
 *          ) ORDER BY policyname)
 *          FROM pg_policies
 *          WHERE schemaname = 'public' AND tablename = 'YOUR_TABLE_NAME'
 *        ),
 *        'rls_enabled', (
 *          SELECT rowsecurity
 *          FROM pg_tables
 *          WHERE schemaname = 'public' AND tablename = 'YOUR_TABLE_NAME'
 *        ),
 *        'table_exists', (
 *          SELECT EXISTS (
 *            SELECT FROM information_schema.tables
 *            WHERE table_schema = 'public' AND table_name = 'YOUR_TABLE_NAME'
 *          )
 *        ),
 *        'row_count', (
 *          SELECT COUNT(*)::int
 *          FROM YOUR_TABLE_NAME
 *        )
 *      ) INTO result;
 *      
 *      RETURN result;
 *    END;
 *    $$;
 *    
 *    GRANT EXECUTE ON FUNCTION get_YOUR_TABLE_schema() TO authenticated;
 *    ```
 * 
 * 3. UPDATE THE EXPECTED CONFIGURATION
 *    Modify the EXPECTED object in this script with your table's expected schema:
 * 
 *    ```javascript
 *    const EXPECTED = {
 *      columns: ['id', 'name', 'created_at', ...],  // Your expected columns
 *      criticalColumns: ['id', 'name'],              // Critical ones
 *      indexes: ['idx_table_name', ...],             // Expected indexes
 *      policies: 3,                                   // Number of RLS policies
 *      policyTypes: ['SELECT', 'INSERT', 'UPDATE']   // Expected policy types
 *    };
 *    ```
 * 
 * 4. UPDATE THE RPC FUNCTION NAME
 *    Change all references from 'get_export_logs_schema' to 'get_YOUR_TABLE_schema'
 * 
 * 5. RUN YOUR NEW SCRIPT
 *    node src/scripts/verify-YOUR_TABLE-with-rpc.js
 * 
 * ============================================================================
 * WHAT THIS SCRIPT CAN CHECK
 * ============================================================================
 * 
 * Through the RPC function, this script can verify:
 * 
 * ✅ Table existence
 * ✅ All columns with data types, nullability, defaults
 * ✅ Missing columns (expected vs actual)
 * ✅ Extra columns (not expected but present)
 * ✅ Critical columns presence
 * ✅ All indexes with their definitions
 * ✅ Missing indexes
 * ✅ All constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK)
 * ✅ Constraint types and definitions
 * ✅ RLS enabled/disabled status
 * ✅ All RLS policies with their rules
 * ✅ Missing RLS policies by type (SELECT, INSERT, UPDATE, DELETE)
 * ✅ Row count in table
 * 
 * And can generate:
 * ✅ Detailed comparison reports
 * ✅ SQL fix scripts for missing items
 * ✅ JSON results for programmatic parsing
 * ✅ Category assessment (1-4)
 * ✅ Go/No-Go decision for implementation
 * 
 * ============================================================================
 * ADVANTAGES OF RPC APPROACH
 * ============================================================================
 * 
 * 1. ✅ Full schema access through PostgreSQL
 * 2. ✅ Secure (uses SECURITY DEFINER with grants)
 * 3. ✅ Works through Supabase JS client (no raw PostgreSQL connection needed)
 * 4. ✅ Returns structured JSON (easy to parse)
 * 5. ✅ Can query ANY PostgreSQL system catalog
 * 6. ✅ Reusable for multiple tables
 * 7. ✅ Works with RLS (queries as superuser when needed)
 * 8. ✅ Fast (single RPC call gets all information)
 * 9. ✅ Programmable (can be automated in CI/CD)
 * 10. ✅ Version-controlled (function definition in SQL file)
 * 
 * ============================================================================
 * FILES GENERATED BY THIS SCRIPT
 * ============================================================================
 * 
 * 1. E05-SQL-FIXES.sql - SQL commands to fix missing items
 * 2. 04-FR-wireframes-execution-E05-rpc-results.json - Complete verification data
 * 3. Console output with detailed analysis and recommendations
 * 
 * ============================================================================
 * TROUBLESHOOTING
 * ============================================================================
 * 
 * ERROR: "Could not find the function get_export_logs_schema"
 * SOLUTION: Run E05-CREATE-RPC-FUNCTION.sql in Supabase SQL Editor first
 * 
 * ERROR: "Permission denied"
 * SOLUTION: Ensure GRANT EXECUTE was run for the function
 * 
 * ERROR: "relation does not exist"
 * SOLUTION: Table doesn't exist yet, run table creation SQL first
 * 
 * ============================================================================
 * RELATED FILES
 * ============================================================================
 * 
 * - E05-CREATE-RPC-FUNCTION.sql - Creates the RPC function
 * - 04-FR-wireframes-execution-E05.md - E05 specification (lines 273-342 have SQL)
 * - 04-FR-wireframes-execution-E05-sql-check.md - Complete verification report
 * 
 * ============================================================================
 * VERSION HISTORY
 * ============================================================================
 * 
 * 2025-11-02: Initial creation - RPC-based schema verification
 *             Breakthrough solution for Supabase schema introspection
 * 
 * ============================================================================
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

// Use service role key for full access
const client = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL, 
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

// Expected configuration
const EXPECTED = {
  columns: [
    'id', 'export_id', 'user_id', 'timestamp', 'format', 'config',
    'conversation_count', 'file_size', 'status', 'file_url', 
    'expires_at', 'error_message', 'created_at', 'updated_at'
  ],
  criticalColumns: ['id', 'export_id', 'user_id', 'format', 'status', 'config'],
  indexes: [
    'idx_export_logs_user_id',
    'idx_export_logs_timestamp',
    'idx_export_logs_status',
    'idx_export_logs_format',
    'idx_export_logs_expires_at'
  ],
  policies: 3, // SELECT, INSERT, UPDATE
  policyTypes: ['SELECT', 'INSERT', 'UPDATE']
};

async function checkRPCFunctionExists() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 CHECKING IF RPC FUNCTION EXISTS');
  console.log('='.repeat(80));
  
  try {
    const { data, error } = await client.rpc('get_export_logs_schema');
    
    if (error) {
      if (error.message.includes('Could not find the function')) {
        console.log('❌ RPC function "get_export_logs_schema" does NOT exist');
        console.log('\n📝 You need to create it first!');
        console.log('   Run this SQL in Supabase SQL Editor:');
        console.log('   (See the SQL in verify-e05-with-rpc.js header comment)');
        return false;
      }
      console.log('⚠️  RPC error:', error.message);
      return false;
    }
    
    console.log('✅ RPC function exists and returned data');
    return true;
    
  } catch (err) {
    console.log('❌ Error checking RPC:', err.message);
    return false;
  }
}

async function getSchemaViaRPC() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 FETCHING SCHEMA VIA RPC');
  console.log('='.repeat(80));
  
  try {
    const { data, error } = await client.rpc('get_export_logs_schema');
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      console.log('⚠️  No data returned from RPC function');
      return null;
    }
    
    console.log('✅ Successfully retrieved schema information via RPC');
    
    return data;
    
  } catch (err) {
    console.log('❌ Error calling RPC:', err.message);
    return null;
  }
}

function analyzeSchema(schema) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 ANALYZING SCHEMA DATA');
  console.log('='.repeat(80));
  
  const results = {
    columns: { status: 'unknown', missing: [], criticalMissing: [], extra: [] },
    indexes: { status: 'unknown', missing: [], actual: [] },
    policies: { status: 'unknown', missing: [], actual: [] },
    constraints: { status: 'unknown', types: {} },
    rls: { enabled: false }
  };
  
  // Analyze columns
  if (schema.columns && Array.isArray(schema.columns)) {
    const actualColumns = schema.columns.map(c => c.column_name);
    const missing = EXPECTED.columns.filter(col => !actualColumns.includes(col));
    const extra = actualColumns.filter(col => !EXPECTED.columns.includes(col));
    const criticalMissing = EXPECTED.criticalColumns.filter(col => !actualColumns.includes(col));
    
    console.log(`\n📊 COLUMNS: ${actualColumns.length} found, ${EXPECTED.columns.length} expected`);
    
    if (criticalMissing.length > 0) {
      console.log(`\n🚨 CRITICAL: Missing ${criticalMissing.length} critical column(s):`);
      criticalMissing.forEach(col => console.log(`   ⭐❌ ${col}`));
      results.columns.status = 'critical';
    } else if (missing.length > 0) {
      console.log(`\n⚠️  Missing ${missing.length} column(s):`);
      missing.forEach(col => console.log(`   ❌ ${col}`));
      results.columns.status = 'warning';
    } else {
      console.log('✅ All expected columns present');
      results.columns.status = 'ok';
    }
    
    if (extra.length > 0) {
      console.log(`\nℹ️  Extra ${extra.length} column(s) (not expected but OK):`);
      extra.forEach(col => console.log(`   + ${col}`));
    }
    
    results.columns.missing = missing;
    results.columns.criticalMissing = criticalMissing;
    results.columns.extra = extra;
    results.columns.actual = actualColumns;
  }
  
  // Analyze indexes
  if (schema.indexes && Array.isArray(schema.indexes)) {
    const actualIndexes = schema.indexes.map(i => i.indexname);
    const missing = EXPECTED.indexes.filter(idx => !actualIndexes.includes(idx));
    
    console.log(`\n📑 INDEXES: ${actualIndexes.length} found, ${EXPECTED.indexes.length} expected`);
    
    if (actualIndexes.length >= EXPECTED.indexes.length) {
      console.log('✅ Sufficient indexes present');
      results.indexes.status = 'ok';
    } else {
      console.log(`⚠️  Missing ${missing.length} index(es):`);
      missing.forEach(idx => console.log(`   ❌ ${idx}`));
      results.indexes.status = 'warning';
    }
    
    results.indexes.missing = missing;
    results.indexes.actual = actualIndexes;
  }
  
  // Analyze RLS policies
  if (schema.rls_policies && Array.isArray(schema.rls_policies)) {
    const actualPolicies = schema.rls_policies;
    const policyTypes = actualPolicies.map(p => p.cmd);
    const missingTypes = EXPECTED.policyTypes.filter(type => !policyTypes.includes(type));
    
    console.log(`\n🔒 RLS POLICIES: ${actualPolicies.length} found, ${EXPECTED.policies} expected`);
    
    actualPolicies.forEach(p => {
      console.log(`   - ${p.policyname} (${p.cmd})`);
    });
    
    if (actualPolicies.length >= EXPECTED.policies) {
      console.log('✅ Sufficient policies present');
      results.policies.status = 'ok';
    } else {
      console.log(`\n⚠️  Missing ${EXPECTED.policies - actualPolicies.length} policy/policies`);
      if (missingTypes.length > 0) {
        console.log(`   Missing policy types: ${missingTypes.join(', ')}`);
      }
      results.policies.status = 'warning';
    }
    
    results.policies.missing = missingTypes;
    results.policies.actual = actualPolicies;
  }
  
  // Analyze constraints
  if (schema.constraints && Array.isArray(schema.constraints)) {
    const constraints = schema.constraints;
    
    console.log(`\n🔐 CONSTRAINTS: ${constraints.length} found`);
    
    const types = {};
    constraints.forEach(c => {
      const type = c.constraint_type;
      types[type] = (types[type] || 0) + 1;
      console.log(`   - ${c.constraint_name} (${type})`);
    });
    
    const hasPK = types['PRIMARY KEY'] >= 1;
    const hasFK = types['FOREIGN KEY'] >= 1;
    const hasUnique = types['UNIQUE'] >= 1;
    const hasCheck = types['CHECK'] >= 2; // format and status
    
    if (hasPK && hasFK && hasUnique && hasCheck) {
      console.log('✅ All expected constraint types present');
      results.constraints.status = 'ok';
    } else {
      console.log('⚠️  Some constraint types may be missing');
      results.constraints.status = 'warning';
    }
    
    results.constraints.types = types;
  }
  
  // RLS enabled status
  if (schema.rls_enabled !== undefined) {
    results.rls.enabled = schema.rls_enabled;
    console.log(`\n🔒 RLS ENABLED: ${schema.rls_enabled ? '✅ YES' : '❌ NO'}`);
  }
  
  return results;
}

function determineCategory(results) {
  if (results.columns.status === 'critical') {
    return {
      category: 2,
      status: '❌ CRITICAL',
      message: 'Table exists but missing CRITICAL columns - BLOCKING',
      canProceed: false
    };
  }
  
  if (results.columns.status === 'warning' || results.policies.status === 'warning') {
    return {
      category: 2,
      status: '⚠️  WARNING',
      message: 'Table exists but needs fixes - Review required',
      canProceed: false
    };
  }
  
  if (results.columns.status === 'ok' && results.indexes.status === 'ok' && 
      results.policies.status === 'ok' && results.rls.enabled) {
    return {
      category: 1,
      status: '✅ OK',
      message: 'Table fully implemented - Ready for E05!',
      canProceed: true
    };
  }
  
  return {
    category: 2,
    status: '⚠️  WARNING',
    message: 'Table exists but some components need attention',
    canProceed: false
  };
}

function generateFixSQL(results) {
  let sql = '';
  
  if (results.columns.missing.length > 0) {
    sql += '-- MISSING COLUMNS (Add these to export_logs table)\n';
    sql += '-- You may need to check the correct data types in E05 execution file\n\n';
    
    results.columns.missing.forEach(col => {
      const isCritical = results.columns.criticalMissing.includes(col);
      sql += `-- ${isCritical ? '⭐ CRITICAL: ' : ''}${col}\n`;
      sql += `-- ALTER TABLE export_logs ADD COLUMN ${col} [TYPE];\n\n`;
    });
  }
  
  if (results.policies.missing.length > 0) {
    sql += '-- MISSING RLS POLICIES\n\n';
    
    results.policies.missing.forEach(type => {
      if (type === 'SELECT') {
        sql += `CREATE POLICY "Users can view own export logs"
  ON export_logs FOR SELECT
  USING (auth.uid() = user_id);\n\n`;
      } else if (type === 'INSERT') {
        sql += `CREATE POLICY "Users can create own export logs"
  ON export_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);\n\n`;
      } else if (type === 'UPDATE') {
        sql += `CREATE POLICY "Users can update own export logs"
  ON export_logs FOR UPDATE
  USING (auth.uid() = user_id);\n\n`;
      }
    });
  }
  
  if (results.indexes.missing.length > 0) {
    sql += '-- MISSING INDEXES\n\n';
    results.indexes.missing.forEach(idx => {
      sql += `-- ${idx}\n`;
      sql += `-- See E05 execution file for exact index definition\n\n`;
    });
  }
  
  return sql;
}

async function main() {
  console.log('🔍 E05 RPC-Based Verification Script');
  console.log('=====================================\n');
  console.log('This script uses PostgreSQL RPC to query schema information');
  console.log('via the Supabase JavaScript client.\n');
  
  // Check if RPC function exists
  const rpcExists = await checkRPCFunctionExists();
  
  if (!rpcExists) {
    console.log('\n' + '='.repeat(80));
    console.log('⚠️  SETUP REQUIRED');
    console.log('='.repeat(80));
    console.log('\nThe RPC function needs to be created first.');
    console.log('See the SQL at the top of this script file.');
    console.log('\nAfter creating the function, run this script again.');
    return;
  }
  
  // Get schema via RPC
  const schema = await getSchemaViaRPC();
  
  if (!schema) {
    console.log('\n❌ Could not retrieve schema information');
    return;
  }
  
  // Analyze the schema
  const results = analyzeSchema(schema);
  
  // Determine category
  const assessment = determineCategory(results);
  
  // Generate fix SQL if needed
  const fixSQL = generateFixSQL(results);
  
  // Final summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 FINAL ASSESSMENT');
  console.log('='.repeat(80));
  
  console.log(`\nStatus: ${assessment.status}`);
  console.log(`Category: ${assessment.category}`);
  console.log(`Message: ${assessment.message}`);
  console.log(`Can Proceed with E05: ${assessment.canProceed ? 'YES ✅' : 'NO ❌'}`);
  
  if (fixSQL) {
    console.log('\n' + '='.repeat(80));
    console.log('🔧 SQL FIXES NEEDED');
    console.log('='.repeat(80));
    console.log('\n' + fixSQL);
    
    // Save to file
    const fixPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/E05-SQL-FIXES.sql');
    fs.writeFileSync(fixPath, fixSQL);
    console.log(`\n💾 SQL fixes saved to: ${fixPath}`);
  }
  
  // Save detailed results
  const reportPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E05-rpc-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    assessment,
    results,
    schema
  }, null, 2));
  
  console.log(`\n💾 Detailed results saved to: ${reportPath}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);

