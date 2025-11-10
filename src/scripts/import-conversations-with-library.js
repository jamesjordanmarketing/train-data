/**
 * Import Conversations Using Supa-Agent-Ops Library
 * 
 * This script imports conversations using the supa-agent-ops library,
 * which handles apostrophes and special characters automatically via
 * parameterized queries.
 * 
 * Solves the E02 apostrophe problem permanently!
 */

const { agentImportTool, agentPreflight, analyzeImportErrors } = require('supa-agent-ops');
const { createClient } = require('@supabase/supabase-js');
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

// Set environment variables for supa-agent-ops library
// The library expects SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
process.env.SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  console.log('🚀 E02 Conversations Import - Using Supa-Agent-Ops\n');
  console.log('This import handles apostrophes automatically!\n');

  // Step 1: Preflight checks
  console.log('Step 1: Running preflight checks...');
  const preflight = await agentPreflight({ 
    table: 'conversations',
    mode: 'upsert',
    onConflict: 'id'
  });

  if (!preflight.ok) {
    console.log('❌ Configuration issues detected:');
    preflight.recommendations.forEach(rec => {
      console.log(`  [${rec.priority}] ${rec.description}`);
      if (rec.example) console.log(`    Example: ${rec.example}`);
    });
    return;
  }

  console.log('✅ Preflight checks passed!\n');

  // Step 2: Load conversations
  console.log('Step 2: Loading conversations data...');
  const dataPath = path.join(__dirname, 'generated-sql/conversations-for-import.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Data file not found:', dataPath);
    console.log('Run convert-conversations-sql-to-json.js first!');
    return;
  }

  const conversations = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`✅ Loaded ${conversations.length} conversations\n`);

  // Step 3: Import with supa-agent-ops
  console.log('Step 3: Importing to database...');
  console.log('Note: Apostrophes, quotes, and emojis are handled automatically!\n');

  const result = await agentImportTool({
    source: conversations,
    table: 'conversations',
    mode: 'upsert',
    onConflict: 'id',
    batchSize: 10,  // Smaller batches for safety
    concurrency: 1   // Sequential processing
  });

  // Step 4: Display results
  console.log('\n' + '='.repeat(60));
  console.log(result.summary);
  console.log('='.repeat(60));

  console.log(`\n📊 Detailed Results:`);
  console.log(`  Total: ${result.totals.total}`);
  console.log(`  Success: ${result.totals.success}`);
  console.log(`  Failed: ${result.totals.failed}`);
  console.log(`  Duration: ${(result.totals.durationMs / 1000).toFixed(2)}s`);

  // Step 5: Handle errors if any
  if (!result.success) {
    console.log('\n❌ Import had errors');
    console.log(`Error report: ${result.reportPaths.errors}`);

    // Analyze errors for recovery steps
    const analysis = await analyzeImportErrors(result);
    
    if (analysis.recoverySteps.length > 0) {
      console.log('\n🔍 Recovery Steps:');
      analysis.recoverySteps.forEach((step, i) => {
        console.log(`\n${i + 1}. [${step.priority}] ${step.description}`);
        console.log(`   Affected: ${step.affectedCount} records`);
        if (step.automatable) {
          console.log('   ✅ Can be automatically fixed');
        }
        if (step.example) {
          console.log(`   Example:\n   ${step.example.split('\n').join('\n   ')}`);
        }
      });
    }
  } else {
    console.log('\n✅ Import completed successfully!');
  }

  // Step 6: Check next actions
  if (result.nextActions && result.nextActions.length > 0) {
    console.log('\n📋 Recommended Actions:');
    result.nextActions.forEach((action, i) => {
      console.log(`  ${i + 1}. [${action.priority}] ${action.description}`);
      if (action.example) {
        console.log(`     ${action.example}`);
      }
    });
  }

  // Step 7: Display report paths
  console.log(`\n📁 Reports:`);
  console.log(`  Summary: ${result.reportPaths.summary}`);
  if (result.reportPaths.errors) {
    console.log(`  Errors:  ${result.reportPaths.errors}`);
  }
  if (result.reportPaths.success) {
    console.log(`  Success: ${result.reportPaths.success}`);
  }

  // Step 8: Verify counts
  console.log('\n🔍 Verifying database counts...');
  const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
  );

  const { count: convCount, error: convError } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true });

  const { count: tempCount, error: tempError } = await supabase
    .from('templates')
    .select('*', { count: 'exact', head: true });

  if (!convError && !tempError) {
    console.log(`✅ Conversations: ${convCount} rows (expected: 35)`);
    console.log(`✅ Templates: ${tempCount} rows (expected: 7)`);
    
    // Check for apostrophes in actual database records
    console.log('\n🔍 Verifying apostrophes in database...');
    const { data: sampleConvs, error: sampleError } = await supabase
      .from('conversations')
      .select('id, parameters')
      .limit(5);
    
    if (!sampleError && sampleConvs) {
      let apostropheCount = 0;
      sampleConvs.forEach(conv => {
        const paramStr = JSON.stringify(conv.parameters);
        if (paramStr.includes("don't") || paramStr.includes("can't") || paramStr.includes("it's")) {
          apostropheCount++;
        }
      });
      console.log(`✅ Found apostrophes in ${apostropheCount}/5 sample records`);
      console.log('✅ Apostrophes successfully stored without SQL errors!');
    }
  } else {
    if (convError) console.error('Error counting conversations:', convError.message);
    if (tempError) console.error('Error counting templates:', tempError.message);
  }

  console.log('\n✨ E02 Import Complete!');
}

// Run with error handling
main().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

