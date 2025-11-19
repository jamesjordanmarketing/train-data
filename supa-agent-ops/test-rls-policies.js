/**
 * Verify RLS Policies for Conversations Table
 * Check if RLS is configured correctly for user access
 */

require('dotenv').config();
const { agentExecuteSQL } = require('./dist/index');

async function checkRLSPolicies() {
  console.log('=================================================');
  console.log('RLS Policy Investigation for Conversations Table');
  console.log('=================================================\n');

  try {
    // Query 1: Check if RLS is enabled on conversations table
    console.log('Query 1: Checking if RLS is enabled...');
    const rlsCheckSQL = `
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE tablename = 'conversations';
    `;
    
    const rlsCheck = await agentExecuteSQL({ sql: rlsCheckSQL, transport: 'rpc' });
    
    if (rlsCheck.rows && rlsCheck.rows.length > 0) {
      const table = rlsCheck.rows[0];
      console.log(`✓ Table: ${table.schemaname}.${table.tablename}`);
      console.log(`  RLS Enabled: ${table.rls_enabled ? '✓ YES' : '✗ NO'}`);
    }
    console.log();

    // Query 2: List all policies on conversations table
    console.log('Query 2: Listing all RLS policies...');
    const policiesSQL = `
      SELECT 
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE tablename = 'conversations'
      ORDER BY policyname;
    `;
    
    const policies = await agentExecuteSQL({ sql: policiesSQL, transport: 'rpc' });
    
    if (policies.rows && policies.rows.length > 0) {
      console.log(`✓ Found ${policies.rows.length} policies:\n`);
      policies.rows.forEach((policy, idx) => {
        console.log(`[${idx + 1}] ${policy.policyname}`);
        console.log(`    Command: ${policy.cmd}`);
        console.log(`    Roles: ${policy.roles}`);
        console.log(`    Using (qual): ${policy.qual || 'N/A'}`);
        console.log(`    With check: ${policy.with_check || 'N/A'}`);
        console.log();
      });
    } else {
      console.log('⚠️  No RLS policies found!');
      console.log('   This means either:');
      console.log('   1. RLS is enabled but no policies exist (denies all access)');
      console.log('   2. All access goes through service role (bypasses RLS)');
      console.log();
    }

    // Query 3: Check what the current policies are checking
    console.log('Query 3: Analyzing policy logic...');
    console.log('Looking for policies that check created_by or auth.uid()...\n');
    
    const policyDetailsSQL = `
      SELECT 
        policyname,
        cmd,
        qual::text as qual_text,
        with_check::text as with_check_text
      FROM pg_policies 
      WHERE tablename = 'conversations'
        AND (qual::text LIKE '%created_by%' OR qual::text LIKE '%auth.uid()%'
             OR with_check::text LIKE '%created_by%' OR with_check::text LIKE '%auth.uid()%');
    `;
    
    const policyDetails = await agentExecuteSQL({ sql: policyDetailsSQL, transport: 'rpc' });
    
    if (policyDetails.rows && policyDetails.rows.length > 0) {
      console.log(`✓ Found ${policyDetails.rows.length} policies checking user ownership:\n`);
      policyDetails.rows.forEach((policy, idx) => {
        console.log(`[${idx + 1}] ${policy.policyname} (${policy.cmd})`);
        console.log(`    Qual: ${policy.qual_text || 'N/A'}`);
        console.log(`    With check: ${policy.with_check_text || 'N/A'}`);
        console.log();
      });
    } else {
      console.log('⚠️  No policies found checking user ownership!');
      console.log('   This could explain why users can\'t access their conversations.');
      console.log();
    }

    // Query 4: Check if service role bypasses RLS
    console.log('Query 4: Current query context...');
    console.log('Note: This query uses service role key, so it bypasses RLS.');
    console.log('Real user queries would be filtered by RLS policies.');
    console.log();

    // Query 5: Simulate what a real user would see
    console.log('Query 5: Testing user access scenario...');
    console.log('Scenario: User 79c81162-6399-41d4-a968-996e0ca0df0c tries to access conversation 501e3b87...');
    
    const userAccessSQL = `
      SELECT 
        id,
        conversation_id,
        created_by,
        CASE 
          WHEN created_by = '79c81162-6399-41d4-a968-996e0ca0df0c' THEN 'User OWNS this'
          WHEN created_by = '00000000-0000-0000-0000-000000000000' THEN 'System owns this (PROBLEM!)'
          ELSE 'Someone else owns this'
        END as ownership_status
      FROM conversations 
      WHERE conversation_id = '501e3b87-930e-4bbd-bcf2-1b71614b4d38';
    `;
    
    const userAccess = await agentExecuteSQL({ sql: userAccessSQL, transport: 'rpc' });
    
    if (userAccess.rows && userAccess.rows.length > 0) {
      const conv = userAccess.rows[0];
      console.log(`✓ Conversation found:`);
      console.log(`  id: ${conv.id}`);
      console.log(`  conversation_id: ${conv.conversation_id}`);
      console.log(`  created_by: ${conv.created_by}`);
      console.log(`  Status: ${conv.ownership_status}`);
      
      if (conv.created_by === '00000000-0000-0000-0000-000000000000') {
        console.log(`\n  ❌ ROOT CAUSE CONFIRMED!`);
        console.log(`  Conversation is owned by system user, not the real user.`);
        console.log(`  RLS policies filtering by created_by = auth.uid() will block access.`);
      }
    }
    console.log();

    console.log('=================================================');
    console.log('Summary & Recommendation');
    console.log('=================================================');
    console.log('');
    console.log('ISSUE: Conversations created with system user ID (00000000...)');
    console.log('SOLUTION: Update generation endpoint to use authenticated user ID');
    console.log('');
    console.log('After fix is deployed:');
    console.log('  ✓ New conversations will be owned by real users');
    console.log('  ✓ RLS policies will correctly filter by created_by');
    console.log('  ✓ Users can download their own conversations');
    console.log('');
    console.log('Old conversations (owned by system user):');
    console.log('  ⚠️  Will remain inaccessible unless manually migrated');
    console.log('  Option: Run UPDATE to reassign ownership if needed');
    console.log('=================================================');

  } catch (error) {
    console.error('\n❌ Error during investigation:');
    console.error(error);
    process.exit(1);
  }
}

// Run the investigation
checkRLSPolicies();
