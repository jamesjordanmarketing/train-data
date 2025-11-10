/**
 * Example usage of the Supabase Agent Ops library
 * 
 * Before running:
 * 1. Set environment variables:
 *    export SUPABASE_URL=https://your-project.supabase.co
 *    export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 * 
 * 2. Link the library:
 *    npm link supa-agent-ops
 * 
 * 3. Run:
 *    node example-usage.js
 */

const { agentImportTool, agentPreflight, analyzeImportErrors } = require('supa-agent-ops');

async function main() {
  console.log('🚀 Supabase Agent Ops - Example Usage\n');

  // Example 1: Preflight check
  console.log('Step 1: Running preflight checks...');
  const preflight = await agentPreflight({ 
    table: 'conversations',
    mode: 'upsert'
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

  // Example 2: Import with apostrophes and special characters
  console.log('Step 2: Importing data with special characters...');
  
  const testRecords = [
    { 
      id: 'test-1', 
      persona: "Marcus - The Overwhelmed Avoider",
      parameters: { 
        note: "don't worry about apostrophes",
        strategy: "It's working perfectly!"
      }
    },
    { 
      id: 'test-2', 
      persona: "Sarah - Detail Seeker",
      parameters: { 
        quote: 'She said "Hello" with a smile',
        emoji: "Great work! 😊🎉"
      }
    },
    {
      id: 'test-3',
      persona: "Alex - The Pragmatist",
      parameters: {
        path: "C:\\Users\\Documents\\data.json",
        multiline: "Line 1\nLine 2\nLine 3"
      }
    }
  ];

  const result = await agentImportTool({
    source: testRecords,
    table: 'conversations',
    mode: 'upsert',
    onConflict: 'id'
  });

  console.log(result.summary);
  console.log(`\n📊 Results:`);
  console.log(`  Total: ${result.totals.total}`);
  console.log(`  Success: ${result.totals.success}`);
  console.log(`  Failed: ${result.totals.failed}`);
  console.log(`  Duration: ${(result.totals.durationMs / 1000).toFixed(2)}s`);

  // Check for errors
  if (!result.success) {
    console.log('\n❌ Import had errors');
    console.log(`Error report: ${result.reportPaths.errors}`);

    // Analyze errors
    const analysis = await analyzeImportErrors(result);
    console.log('\n🔍 Recovery steps:');
    analysis.recoverySteps.forEach(step => {
      console.log(`\n[${step.priority}] ${step.description}`);
      console.log(`  Affected: ${step.affectedCount} records`);
      if (step.automatable) {
        console.log('  ✅ Can be automatically fixed');
      }
      if (step.example) {
        console.log(`  Example:\n${step.example}`);
      }
    });
  } else {
    console.log('\n✅ Import successful!');
  }

  // Check next actions
  if (result.nextActions.length > 0) {
    console.log('\n📋 Recommended actions:');
    result.nextActions.forEach(action => {
      console.log(`  [${action.priority}] ${action.description}`);
    });
  }

  console.log(`\n📁 Reports saved to: ${result.reportPaths.summary}`);
}

// Run the example
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

