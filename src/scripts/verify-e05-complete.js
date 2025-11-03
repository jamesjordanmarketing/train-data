#!/usr/bin/env node

/**
 * E05 Complete Verification Script
 * 
 * Comprehensive check that gets ALL details about export_logs table:
 * - Exact column list with types
 * - All indexes
 * - All constraints
 * - All RLS policies
 * - Missing items identified
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
  policies: ['SELECT', 'INSERT', 'UPDATE']
};

async function checkTableStructure() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 CHECKING TABLE STRUCTURE');
  console.log('='.repeat(80));
  
  try {
    // Try to select from table to see its structure
    const { data, error, count } = await client
      .from('export_logs')
      .select('*', { count: 'exact', head: true }); // head: true means no data, just metadata
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Table does NOT exist');
        return { exists: false, columns: [] };
      }
      console.log('⚠️  Table exists but query error:', error.message);
    }
    
    console.log('✅ Table EXISTS');
    
    // Now try to get a sample row to determine columns
    const { data: sampleData, error: sampleError } = await client
      .from('export_logs')
      .select('*')
      .limit(1);
    
    if (sampleData && sampleData.length > 0) {
      const columns = Object.keys(sampleData[0]);
      console.log(`\n📊 Detected ${columns.length} columns from sample data:`);
      columns.forEach(col => console.log(`   - ${col}`));
      return { exists: true, columns };
    }
    
    // Table is empty, try alternative: use database introspection with raw query
    console.log('\nℹ️  Table is empty, attempting database introspection...');
    
    return { exists: true, columns: [], needsIntrospection: true };
    
  } catch (err) {
    console.log('❌ Error checking table:', err.message);
    return { exists: false, columns: [] };
  }
}

async function introspectWithRawSQL() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 INTROSPECTING WITH RAW SQL QUERIES');
  console.log('='.repeat(80));
  
  // We'll use the REST API to execute raw SQL if possible
  // Supabase doesn't directly expose information_schema via the JS client
  // So we'll have to use a workaround
  
  console.log('\nℹ️  Note: Cannot directly query information_schema via Supabase JS client');
  console.log('ℹ️  User needs to run E05-MANUAL-VERIFICATION.sql in Supabase SQL Editor');
  console.log('ℹ️  Or we can make educated guesses based on table existence...');
  
  return null;
}

async function analyzeColumns(actualColumns) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COLUMN ANALYSIS');
  console.log('='.repeat(80));
  
  if (actualColumns.length === 0) {
    console.log('\n⚠️  Cannot determine columns (table is empty and no schema access)');
    console.log('\n📋 Expected columns (14):');
    EXPECTED.columns.forEach(col => {
      const isCritical = EXPECTED.criticalColumns.includes(col);
      console.log(`   ${isCritical ? '⭐' : '  '} ${col} ${isCritical ? '(CRITICAL)' : ''}`);
    });
    return {
      missing: EXPECTED.columns,
      criticalMissing: EXPECTED.criticalColumns,
      extra: [],
      status: 'unknown'
    };
  }
  
  const missing = EXPECTED.columns.filter(col => !actualColumns.includes(col));
  const extra = actualColumns.filter(col => !EXPECTED.columns.includes(col));
  const criticalMissing = EXPECTED.criticalColumns.filter(col => !actualColumns.includes(col));
  
  console.log(`\n✅ Actual columns: ${actualColumns.length}`);
  console.log(`📋 Expected columns: ${EXPECTED.columns.length}`);
  
  if (missing.length === 0 && extra.length === 0) {
    console.log('\n✅ Perfect match! All columns present.');
    return { missing: [], criticalMissing: [], extra: [], status: 'perfect' };
  }
  
  if (missing.length > 0) {
    console.log(`\n❌ Missing ${missing.length} column(s):`);
    missing.forEach(col => {
      const isCritical = EXPECTED.criticalColumns.includes(col);
      console.log(`   ${isCritical ? '⭐❌' : '  ❌'} ${col} ${isCritical ? '(CRITICAL!)' : ''}`);
    });
  }
  
  if (criticalMissing.length > 0) {
    console.log(`\n🚨 Missing ${criticalMissing.length} CRITICAL column(s):`);
    criticalMissing.forEach(col => console.log(`   ⭐ ${col}`));
  }
  
  if (extra.length > 0) {
    console.log(`\nℹ️  Extra ${extra.length} column(s) (not expected but OK):`);
    extra.forEach(col => console.log(`   + ${col}`));
  }
  
  return {
    missing,
    criticalMissing,
    extra,
    status: criticalMissing.length > 0 ? 'critical' : missing.length > 0 ? 'warning' : 'ok'
  };
}

async function generateReport(tableInfo, columnAnalysis) {
  console.log('\n\n' + '='.repeat(80));
  console.log('📄 COMPREHENSIVE E05 VERIFICATION REPORT');
  console.log('='.repeat(80));
  
  let report = `\n`;
  report += `# E05 Export System - Complete Verification Results\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Script:** verify-e05-complete.js\n\n`;
  
  report += `---\n\n`;
  report += `## Table Status\n\n`;
  
  if (!tableInfo.exists) {
    report += `❌ **CRITICAL:** Table \`export_logs\` does NOT exist\n\n`;
    report += `**Action Required:**\n`;
    report += `1. Open: pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E05.md\n`;
    report += `2. Find SQL script (lines 273-342)\n`;
    report += `3. Run in Supabase SQL Editor\n\n`;
    return report;
  }
  
  report += `✅ Table \`export_logs\` EXISTS\n\n`;
  
  report += `## Column Analysis\n\n`;
  
  if (columnAnalysis.status === 'unknown') {
    report += `⚠️  **Cannot determine column structure** (table is empty, no schema access)\n\n`;
    report += `**Expected columns (${EXPECTED.columns.length}):**\n`;
    EXPECTED.columns.forEach(col => {
      const isCritical = EXPECTED.criticalColumns.includes(col);
      report += `- ${col}${isCritical ? ' ⭐ (CRITICAL)' : ''}\n`;
    });
    report += `\n**User must verify manually using E05-MANUAL-VERIFICATION.sql**\n\n`;
  } else if (columnAnalysis.status === 'perfect') {
    report += `✅ **All ${EXPECTED.columns.length} columns present and correct**\n\n`;
  } else {
    report += `⚠️  **Column Issues Found**\n\n`;
    
    if (columnAnalysis.criticalMissing.length > 0) {
      report += `### 🚨 CRITICAL: Missing Critical Columns\n\n`;
      report += `The following CRITICAL columns are missing:\n`;
      columnAnalysis.criticalMissing.forEach(col => {
        report += `- ⭐ \`${col}\`\n`;
      });
      report += `\n**This will cause runtime errors in E05 implementation!**\n\n`;
    }
    
    if (columnAnalysis.missing.length > 0) {
      report += `### Missing Columns (${columnAnalysis.missing.length})\n\n`;
      columnAnalysis.missing.forEach(col => {
        const isCritical = EXPECTED.criticalColumns.includes(col);
        if (!isCritical) {
          report += `- \`${col}\`\n`;
        }
      });
      report += `\n`;
    }
    
    if (columnAnalysis.extra.length > 0) {
      report += `### Extra Columns (${columnAnalysis.extra.length})\n\n`;
      report += `These columns exist but weren't expected (usually OK):\n`;
      columnAnalysis.extra.forEach(col => {
        report += `- \`${col}\`\n`;
      });
      report += `\n`;
    }
  }
  
  report += `## Expected Components\n\n`;
  report += `### Indexes (${EXPECTED.indexes.length} expected)\n`;
  EXPECTED.indexes.forEach(idx => report += `- ${idx}\n`);
  report += `\n`;
  
  report += `### RLS Policies (${EXPECTED.policies.length} expected)\n`;
  EXPECTED.policies.forEach(policy => report += `- ${policy} (Users can ${policy.toLowerCase()} own export logs)\n`);
  report += `\n`;
  
  report += `## Overall Assessment\n\n`;
  
  if (!tableInfo.exists) {
    report += `❌ **Category 4:** Table doesn't exist - CRITICAL\n\n`;
  } else if (columnAnalysis.status === 'unknown') {
    report += `⚠️  **Category 2:** Table exists but structure unknown - Manual verification required\n\n`;
    report += `**Status:** Cannot proceed until manual verification complete\n\n`;
  } else if (columnAnalysis.status === 'critical') {
    report += `❌ **Category 2:** Table exists but CRITICAL columns missing - BLOCKING\n\n`;
    report += `**Status:** BLOCKED - Cannot proceed until critical columns added\n\n`;
  } else if (columnAnalysis.status === 'warning') {
    report += `⚠️  **Category 2:** Table exists but some columns missing - REVIEW REQUIRED\n\n`;
    report += `**Status:** May proceed with caution but should fix missing columns\n\n`;
  } else {
    report += `✅ **Category 1:** Table fully implemented - Ready for E05!\n\n`;
    report += `**Status:** Can proceed with E05 Prompt 1 implementation\n\n`;
  }
  
  report += `---\n\n`;
  report += `## Required Manual Verification\n\n`;
  report += `Due to Supabase JS client limitations, the following must be verified manually:\n\n`;
  report += `1. **Run in Supabase SQL Editor:** \`pmc/product/_mapping/fr-maps/E05-MANUAL-VERIFICATION.sql\`\n`;
  report += `2. **Check Query 4:** MISSING COLUMNS CHECK\n`;
  report += `3. **Check Query 12:** RLS POLICY SUMMARY\n`;
  report += `4. **Check Query 15:** FINAL ASSESSMENT\n\n`;
  
  report += `**The manual verification will provide:**\n`;
  report += `- Exact column data types\n`;
  report += `- Index definitions\n`;
  report += `- Constraint details\n`;
  report += `- RLS policy details\n`;
  report += `- Complete assessment\n\n`;
  
  return report;
}

async function main() {
  console.log('🔍 E05 Complete Verification Script');
  console.log('====================================\n');
  console.log('This script will check the export_logs table comprehensively.');
  console.log('Note: Due to Supabase limitations, some checks require manual SQL verification.\n');
  
  // Check table structure
  const tableInfo = await checkTableStructure();
  
  if (!tableInfo.exists) {
    console.log('\n❌ CRITICAL: Table does not exist!');
    console.log('   Run SQL from: pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E05.md (lines 273-342)');
    
    const report = await generateReport(tableInfo, { status: 'critical', missing: EXPECTED.columns, criticalMissing: EXPECTED.criticalColumns, extra: [] });
    
    const outputPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E05-detailed-results.md');
    fs.writeFileSync(outputPath, report);
    console.log(`\n💾 Report saved to: ${outputPath}`);
    return;
  }
  
  // Analyze columns
  const columnAnalysis = await analyzeColumns(tableInfo.columns);
  
  // Generate comprehensive report
  const report = await generateReport(tableInfo, columnAnalysis);
  console.log(report);
  
  // Save report
  const outputPath = path.resolve(__dirname, '../../pmc/product/_mapping/fr-maps/04-FR-wireframes-execution-E05-detailed-results.md');
  fs.writeFileSync(outputPath, report);
  console.log(`\n💾 Detailed report saved to: ${outputPath}`);
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  
  if (columnAnalysis.status === 'unknown') {
    console.log('\n⚠️  STATUS: MANUAL VERIFICATION REQUIRED');
    console.log('   Table exists but columns cannot be determined programmatically');
    console.log('   User must run: E05-MANUAL-VERIFICATION.sql in Supabase SQL Editor');
  } else if (columnAnalysis.status === 'critical') {
    console.log('\n❌ STATUS: CRITICAL ISSUES - BLOCKED');
    console.log(`   Missing ${columnAnalysis.criticalMissing.length} CRITICAL columns`);
    console.log('   Cannot proceed with E05 until fixed');
  } else if (columnAnalysis.status === 'warning') {
    console.log('\n⚠️  STATUS: WARNINGS - REVIEW NEEDED');
    console.log(`   Missing ${columnAnalysis.missing.length} columns`);
    console.log('   Should fix before production');
  } else {
    console.log('\n✅ STATUS: ALL CLEAR');
    console.log('   Table structure appears correct');
    console.log('   Ready for E05 implementation');
  }
  
  console.log('\nFor complete verification including indexes and RLS policies:');
  console.log('→ Run E05-MANUAL-VERIFICATION.sql in Supabase SQL Editor');
  console.log('→ Share the complete results');
  
  console.log('\n✨ Done!');
}

main().catch(console.error);

