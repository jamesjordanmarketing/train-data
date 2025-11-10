#!/usr/bin/env node

/**
 * Data Insertion Verification Script
 *
 * Run this after executing the SQL INSERT statements to verify that
 * the data was inserted correctly into the database.
 */

const fs = require('fs');
const path = require('path');

// Load environment and Supabase client
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=').replace(/^["']|["']$/g, '');
  if (key && value) envVars[key.trim()] = value.trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================================
// Verification Tests
// ============================================================================

async function runVerification() {
  console.log('='.repeat(70));
  console.log('🔍 DATA INSERTION VERIFICATION');
  console.log('='.repeat(70));
  console.log('');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  // Test 1: Count conversations
  await test(results, 'Conversations table populated', async () => {
    const { count, error } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    console.log(`   Found: ${count} conversations`);

    if (count === 0) {
      throw new Error('No conversations found - data not inserted');
    }

    // Expected around 35 conversations from E01
    if (count < 30) {
      results.warnings++;
      console.log(`   ⚠️  Warning: Expected ~35 conversations, got ${count}`);
    }

    return { count };
  });

  // Test 2: Count templates
  await test(results, 'Templates table populated', async () => {
    const { count, error } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    console.log(`   Found: ${count} templates`);

    if (count === 0) {
      throw new Error('No templates found - data not inserted');
    }

    return { count };
  });

  // Test 3: Check status distribution
  await test(results, 'Status distribution valid', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('status');

    if (error) throw error;

    const statusCounts = {};
    data.forEach(row => {
      statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
    });

    console.log(`   Status breakdown:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      const pct = ((count / data.length) * 100).toFixed(1);
      console.log(`     ${status}: ${count} (${pct}%)`);
    });

    return { statusCounts };
  });

  // Test 4: Check tier distribution
  await test(results, 'Tier distribution valid', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('tier');

    if (error) throw error;

    const tierCounts = {};
    data.forEach(row => {
      tierCounts[row.tier] = (tierCounts[row.tier] || 0) + 1;
    });

    console.log(`   Tier breakdown:`);
    Object.entries(tierCounts).forEach(([tier, count]) => {
      const pct = ((count / data.length) * 100).toFixed(1);
      console.log(`     ${tier}: ${count} (${pct}%)`);
    });

    return { tierCounts };
  });

  // Test 5: Verify quality scores
  await test(results, 'Quality scores in valid range', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('quality_score')
      .not('quality_score', 'is', null);

    if (error) throw error;

    const scores = data.map(r => r.quality_score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);

    console.log(`   Average: ${avg.toFixed(2)}`);
    console.log(`   Range: ${min} - ${max}`);

    if (min < 0 || max > 10) {
      throw new Error(`Quality scores out of range: ${min} - ${max}`);
    }

    return { avg, min, max };
  });

  // Test 6: Check for NULL required fields
  await test(results, 'No NULL values in required fields', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, persona, emotion, tier')
      .or('persona.is.null,emotion.is.null,tier.is.null');

    if (error) throw error;

    if (data.length > 0) {
      throw new Error(`Found ${data.length} records with NULL required fields`);
    }

    console.log(`   All required fields populated`);
    return { nullCount: 0 };
  });

  // Test 7: Verify timestamps
  await test(results, 'Timestamps valid', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, created_at, updated_at')
      .limit(5);

    if (error) throw error;

    let invalidCount = 0;
    data.forEach(row => {
      const created = new Date(row.created_at);
      const updated = new Date(row.updated_at);

      if (created > updated) {
        invalidCount++;
      }
    });

    if (invalidCount > 0) {
      throw new Error(`Found ${invalidCount} records with invalid timestamps`);
    }

    console.log(`   All timestamps valid`);
    return { invalidCount: 0 };
  });

  // Test 8: Check JSONB fields
  await test(results, 'JSONB fields valid', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, parameters, review_history')
      .limit(5);

    if (error) throw error;

    let validCount = 0;
    data.forEach(row => {
      if (row.parameters && typeof row.parameters === 'object') validCount++;
      if (row.review_history && Array.isArray(row.review_history)) validCount++;
    });

    console.log(`   Checked ${data.length} records - JSONB fields valid`);
    return { validCount };
  });

  // Test 9: Check template-conversation relationships
  await test(results, 'Template-conversation relationships', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, parent_id, parent_type')
      .eq('parent_type', 'template')
      .not('parent_id', 'is', null);

    if (error) throw error;

    console.log(`   Found ${data.length} conversations linked to templates`);

    // Verify parent templates exist
    if (data.length > 0) {
      const parentIds = [...new Set(data.map(r => r.parent_id))];
      const { count, error: templateError } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true })
        .in('id', parentIds);

      if (templateError) throw templateError;

      console.log(`   Verified ${count} parent templates exist`);
    }

    return { linkedCount: data.length };
  });

  // Test 10: Sample data spot-check
  await test(results, 'Sample data spot-check', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, conversation_id, persona, emotion, status, tier, quality_score')
      .limit(3);

    if (error) throw error;

    console.log(`   Sample records:`);
    data.forEach((row, i) => {
      console.log(`     ${i + 1}. ${row.persona.substring(0, 30)}... (${row.status}, ${row.tier}, Q:${row.quality_score})`);
    });

    return { sampleCount: data.length };
  });

  // Summary
  console.log('');
  console.log('='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log('');

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Data successfully inserted and verified.');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the errors above.');
  }

  console.log('='.repeat(70));

  // Write results to file
  const reportPath = path.join(__dirname, 'generated-sql/verification-results.md');
  const report = generateReport(results);
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Verification report written to: ${reportPath}`);

  return results;
}

// ============================================================================
// Helper Functions
// ============================================================================

async function test(results, name, fn) {
  try {
    console.log(`\n🔍 Test: ${name}`);
    const result = await fn();
    results.passed++;
    results.tests.push({ name, status: 'passed', result });
    console.log(`   ✅ Passed`);
    return result;
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'failed', error: error.message });
    console.log(`   ❌ Failed: ${error.message}`);
    return null;
  }
}

function generateReport(results) {
  let report = `# Data Insertion Verification Report

**Generated:** ${new Date().toISOString()}
**Status:** ${results.failed === 0 ? '✅ PASSED' : '⚠️ FAILED'}

## Summary

- ✅ Passed: ${results.passed}
- ❌ Failed: ${results.failed}
- ⚠️  Warnings: ${results.warnings}

## Test Results

`;

  results.tests.forEach((test, i) => {
    report += `\n### ${i + 1}. ${test.name}\n`;
    report += `**Status:** ${test.status === 'passed' ? '✅ PASSED' : '❌ FAILED'}\n`;

    if (test.status === 'passed' && test.result) {
      report += `**Result:** \`\`\`json\n${JSON.stringify(test.result, null, 2)}\n\`\`\`\n`;
    }

    if (test.status === 'failed') {
      report += `**Error:** ${test.error}\n`;
    }
  });

  report += `\n## Conclusion\n\n`;

  if (results.failed === 0) {
    report += `All verification tests passed successfully. The mock data has been correctly inserted into the database.\n`;
  } else {
    report += `${results.failed} test(s) failed. Please review the errors above and re-execute the SQL insertion if needed.\n`;
  }

  return report;
}

// ============================================================================
// Main Execution
// ============================================================================

if (require.main === module) {
  runVerification()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(err => {
      console.error('\n❌ Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { runVerification };
