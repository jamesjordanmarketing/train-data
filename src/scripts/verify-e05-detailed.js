#!/usr/bin/env node

/**
 * E05 Detailed Table Verification
 * 
 * Runs SQL queries against Supabase to get detailed information about
 * the export_logs table structure, indexes, constraints, and RLS policies
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

// Use service role key for admin access
const client = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL, 
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function runQuery(description, query) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 ${description}`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    const { data, error } = await client.rpc('exec_sql', { sql: query });
    
    if (error) {
      console.log('❌ Error:', error.message);
      
      // Try alternative approach using direct query
      console.log('\nℹ️  Trying alternative query method...');
      return await runDirectQuery(query);
    }
    
    if (!data || data.length === 0) {
      console.log('ℹ️  No results returned');
      return [];
    }
    
    console.log(`✅ Found ${data.length} result(s)`);
    console.table(data);
    return data;
  } catch (err) {
    console.log('❌ Exception:', err.message);
    return [];
  }
}

async function runDirectQuery(query) {
  // For simple SELECT queries, try to parse and run directly
  if (query.includes('FROM export_logs')) {
    try {
      const { data, error } = await client
        .from('export_logs')
        .select('*')
        .limit(10);
      
      if (error) {
        console.log('❌ Direct query error:', error.message);
        return [];
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} rows via direct query`);
        console.log('Sample columns:', Object.keys(data[0]).join(', '));
        return data;
      }
      
      console.log('ℹ️  Table exists but is empty');
      return [];
    } catch (err) {
      console.log('❌ Direct query exception:', err.message);
      return [];
    }
  }
  
  return [];
}

async function checkTableStructure() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Checking export_logs Table Structure');
  console.log('='.repeat(80));
  
  // Try to query the table directly
  const { data, error, count } = await client
    .from('export_logs')
    .select('*', { count: 'exact' })
    .limit(1);
  
  if (error) {
    if (error.message.includes('does not exist')) {
      console.log('\n❌ Table does NOT exist');
      return { exists: false, columns: [], rowCount: 0 };
    }
    console.log('\n⚠️  Table exists but query error:', error.message);
    console.log('   This may be due to RLS policies blocking access');
    return { exists: true, columns: [], rowCount: count || 0, rls_blocking: true };
  }
  
  console.log('\n✅ Table EXISTS');
  console.log(`📊 Row count: ${count || 0}`);
  
  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log(`📋 Columns detected (${columns.length}):`);
    columns.forEach(col => console.log(`   - ${col}`));
    return { exists: true, columns, rowCount: count || 0, sample: data[0] };
  }
  
  console.log('ℹ️  Table is empty, cannot infer structure from data');
  return { exists: true, columns: [], rowCount: 0 };
}

async function checkIndexes() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Checking Indexes');
  console.log('='.repeat(80));
  
  const query = `
    SELECT 
      indexname, 
      indexdef
    FROM pg_indexes 
    WHERE schemaname = 'public' AND tablename = 'export_logs'
    ORDER BY indexname;
  `;
  
  return await runQuery('Indexes on export_logs', query);
}

async function checkRLSPolicies() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Checking RLS Policies');
  console.log('='.repeat(80));
  
  const query = `
    SELECT 
      tablename, 
      policyname, 
      cmd, 
      qual, 
      with_check 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'export_logs'
    ORDER BY policyname;
  `;
  
  return await runQuery('RLS Policies', query);
}

async function checkConstraints() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Checking Constraints');
  console.log('='.repeat(80));
  
  const query = `
    SELECT 
      conname AS constraint_name,
      CASE contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 't' THEN 'TRIGGER'
        WHEN 'x' THEN 'EXCLUSION'
        ELSE contype::text
      END AS constraint_type,
      pg_get_constraintdef(oid) AS definition
    FROM pg_constraint
    WHERE conrelid = 'export_logs'::regclass
    ORDER BY contype, conname;
  `;
  
  return await runQuery('Constraints', query);
}

function generateDetailedReport(structure, indexes, policies, constraints) {
  let report = `\n\n${'='.repeat(80)}\n`;
  report += `📋 DETAILED E05 SQL VERIFICATION REPORT\n`;
  report += `${'='.repeat(80)}\n\n`;
  
  // Table Status
  report += `## 1. Table Status\n\n`;
  if (!structure.exists) {
    report += `❌ **CRITICAL:** export_logs table does NOT exist\n`;
    report += `**Action Required:** Run the SQL script from 04-FR-wireframes-execution-E05.md (lines 273-342)\n\n`;
    return report;
  }
  
  report += `✅ Table: export_logs EXISTS\n`;
  report += `📊 Row count: ${structure.rowCount}\n`;
  if (structure.rls_blocking) {
    report += `⚠️  RLS may be blocking queries (expected behavior)\n`;
  }
  report += `\n`;
  
  // Column Analysis
  report += `## 2. Column Structure\n\n`;
  
  const expectedColumns = [
    'id', 'export_id', 'user_id', 'timestamp', 'format', 'config',
    'conversation_count', 'file_size', 'status', 'file_url', 'expires_at',
    'error_message', 'created_at', 'updated_at'
  ];
  
  if (structure.columns.length === 0) {
    report += `⚠️  Cannot determine column structure (table empty or RLS blocking)\n`;
    report += `\n**Expected columns (${expectedColumns.length}):**\n`;
    expectedColumns.forEach(col => {
      report += `   - ${col}\n`;
    });
    report += `\n**Verification needed:** Run this SQL in Supabase SQL Editor:\n`;
    report += `\`\`\`sql\n`;
    report += `SELECT column_name, data_type, is_nullable, column_default\n`;
    report += `FROM information_schema.columns\n`;
    report += `WHERE table_name = 'export_logs'\n`;
    report += `ORDER BY ordinal_position;\n`;
    report += `\`\`\`\n\n`;
  } else {
    const actualColumns = structure.columns;
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
    
    report += `**Actual columns (${actualColumns.length}):**\n`;
    actualColumns.forEach(col => {
      const isCritical = ['id', 'export_id', 'user_id', 'format', 'status', 'config'].includes(col);
      const marker = isCritical ? '⭐' : '  ';
      report += `${marker} ${col}\n`;
    });
    report += `\n`;
    
    if (missingColumns.length > 0) {
      report += `❌ **Missing columns (${missingColumns.length}):**\n`;
      missingColumns.forEach(col => report += `   - ${col}\n`);
      report += `\n`;
    } else {
      report += `✅ All expected columns present\n\n`;
    }
    
    if (extraColumns.length > 0) {
      report += `ℹ️  **Extra columns (${extraColumns.length}):**\n`;
      extraColumns.forEach(col => report += `   - ${col}\n`);
      report += `\n`;
    }
  }
  
  // Index Analysis
  report += `## 3. Indexes\n\n`;
  
  const expectedIndexes = [
    'idx_export_logs_user_id',
    'idx_export_logs_timestamp',
    'idx_export_logs_status',
    'idx_export_logs_format',
    'idx_export_logs_expires_at'
  ];
  
  if (!indexes || indexes.length === 0) {
    report += `⚠️  No indexes found or cannot query pg_indexes\n`;
    report += `\n**Expected indexes (${expectedIndexes.length}):**\n`;
    expectedIndexes.forEach(idx => report += `   - ${idx}\n`);
    report += `\n`;
  } else {
    const indexNames = indexes.map(i => i.indexname || i.index_name);
    const missingIndexes = expectedIndexes.filter(idx => !indexNames.includes(idx));
    
    report += `**Actual indexes (${indexes.length}):**\n`;
    indexes.forEach(idx => {
      const name = idx.indexname || idx.index_name;
      const isExpected = expectedIndexes.includes(name);
      const marker = isExpected ? '✅' : 'ℹ️ ';
      report += `${marker} ${name}\n`;
    });
    report += `\n`;
    
    if (missingIndexes.length > 0) {
      report += `❌ **Missing indexes (${missingIndexes.length}):**\n`;
      missingIndexes.forEach(idx => report += `   - ${idx}\n`);
      report += `\n`;
    } else {
      report += `✅ All expected indexes present\n\n`;
    }
  }
  
  // RLS Policy Analysis
  report += `## 4. RLS Policies\n\n`;
  
  const expectedPolicies = [
    'Users can view own export logs',
    'Users can create own export logs',
    'Users can update own export logs'
  ];
  
  if (!policies || policies.length === 0) {
    report += `⚠️  No RLS policies found or cannot query pg_policies\n`;
    report += `\n**Expected policies (${expectedPolicies.length}):**\n`;
    expectedPolicies.forEach(pol => report += `   - ${pol}\n`);
    report += `\n`;
  } else {
    report += `**Actual policies (${policies.length}):**\n`;
    policies.forEach(pol => {
      const name = pol.policyname || pol.policy_name;
      const cmd = pol.cmd || 'UNKNOWN';
      report += `   - ${name} (${cmd})\n`;
    });
    report += `\n`;
    
    if (policies.length < expectedPolicies.length) {
      report += `⚠️  Expected ${expectedPolicies.length} policies, found ${policies.length}\n\n`;
    } else {
      report += `✅ RLS policies are configured\n\n`;
    }
  }
  
  // Constraint Analysis
  report += `## 5. Constraints\n\n`;
  
  const expectedConstraintTypes = ['PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY', 'CHECK'];
  
  if (!constraints || constraints.length === 0) {
    report += `⚠️  No constraints found or cannot query pg_constraint\n`;
    report += `\n**Expected constraint types:**\n`;
    expectedConstraintTypes.forEach(type => report += `   - ${type}\n`);
    report += `\n`;
  } else {
    report += `**Actual constraints (${constraints.length}):**\n`;
    constraints.forEach(con => {
      const name = con.constraint_name || con.conname;
      const type = con.constraint_type || 'UNKNOWN';
      report += `   - ${name} (${type})\n`;
    });
    report += `\n`;
    
    const hasPK = constraints.some(c => (c.constraint_type || c.contype) === 'PRIMARY KEY' || c.contype === 'p');
    const hasFK = constraints.some(c => (c.constraint_type || c.contype) === 'FOREIGN KEY' || c.contype === 'f');
    const hasUnique = constraints.some(c => (c.constraint_type || c.contype) === 'UNIQUE' || c.contype === 'u');
    const hasCheck = constraints.some(c => (c.constraint_type || c.contype) === 'CHECK' || c.contype === 'c');
    
    if (!hasPK) report += `❌ Missing PRIMARY KEY constraint\n`;
    if (!hasFK) report += `⚠️  Missing FOREIGN KEY to auth.users\n`;
    if (!hasUnique) report += `⚠️  Missing UNIQUE constraint on export_id\n`;
    if (!hasCheck) report += `⚠️  Missing CHECK constraints for format/status\n`;
    
    if (hasPK && hasFK && hasUnique && hasCheck) {
      report += `✅ All expected constraint types present\n`;
    }
    report += `\n`;
  }
  
  // Final Summary
  report += `## 6. Overall Assessment\n\n`;
  
  let issues = [];
  let criticalIssues = [];
  
  if (!structure.exists) {
    criticalIssues.push('Table does not exist');
  }
  
  if (structure.columns.length > 0) {
    const expectedColumns = [
      'id', 'export_id', 'user_id', 'timestamp', 'format', 'config',
      'conversation_count', 'file_size', 'status', 'file_url', 'expires_at',
      'error_message', 'created_at', 'updated_at'
    ];
    const missingColumns = expectedColumns.filter(col => !structure.columns.includes(col));
    const criticalMissing = ['id', 'export_id', 'user_id', 'format', 'status'].filter(col => !structure.columns.includes(col));
    
    if (criticalMissing.length > 0) {
      criticalIssues.push(`Missing critical columns: ${criticalMissing.join(', ')}`);
    } else if (missingColumns.length > 0) {
      issues.push(`Missing ${missingColumns.length} non-critical columns`);
    }
  }
  
  if (criticalIssues.length > 0) {
    report += `❌ **CRITICAL ISSUES (${criticalIssues.length}):**\n`;
    criticalIssues.forEach(issue => report += `   • ${issue}\n`);
    report += `\n**Action Required:** Run SQL script from E05 execution file\n\n`;
  } else if (issues.length > 0) {
    report += `⚠️  **Warnings (${issues.length}):**\n`;
    issues.forEach(issue => report += `   • ${issue}\n`);
    report += `\n**Recommendation:** Verify and address warnings\n\n`;
  } else {
    report += `✅ **Table appears to be correctly implemented**\n\n`;
    report += `**Status:** Ready for E05 implementation\n`;
    report += `**Next Steps:**\n`;
    report += `   1. Verify indexes are created for performance\n`;
    report += `   2. Confirm RLS policies are working correctly\n`;
    report += `   3. Test CRUD operations with ExportService\n`;
    report += `   4. Proceed with Prompt 1: Database Foundation and Export Service Layer\n\n`;
  }
  
  return report;
}

async function main() {
  console.log('🔍 E05 Detailed Table Verification');
  console.log('===================================\n');
  console.log('This script will query Supabase to get detailed information about');
  console.log('the export_logs table structure, indexes, constraints, and RLS policies.\n');
  
  // Check table structure
  const structure = await checkTableStructure();
  
  // Check indexes (may fail if we don't have permissions)
  const indexes = await checkIndexes();
  
  // Check RLS policies
  const policies = await checkRLSPolicies();
  
  // Check constraints
  const constraints = await checkConstraints();
  
  // Generate report
  const report = generateDetailedReport(structure, indexes, policies, constraints);
  console.log(report);
  
  // Append to the markdown report
  const reportPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E05-sql-check.md');
  let existingReport = fs.readFileSync(reportPath, 'utf8');
  
  existingReport += `\n\n---\n\n`;
  existingReport += `## Detailed Verification Results\n\n`;
  existingReport += `**Timestamp:** ${new Date().toISOString()}\n\n`;
  existingReport += report.replace(/^/gm, '');
  
  fs.writeFileSync(reportPath, existingReport);
  
  console.log(`\n💾 Updated report saved to: ${reportPath}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);

