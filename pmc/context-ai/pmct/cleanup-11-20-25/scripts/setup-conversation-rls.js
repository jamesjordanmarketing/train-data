#!/usr/bin/env node
/**
 * Setup Conversation Storage RLS Policies
 * 
 * Enables Row Level Security and creates policies for conversations and conversation_turns tables using SAOL.
 * 
 * Usage: node scripts/setup-conversation-rls.js
 */

require('dotenv').config({ path: '.env.local' });
const saol = require('supa-agent-ops');

// Ensure environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

// Set SUPABASE_URL from NEXT_PUBLIC_SUPABASE_URL for SAOL
process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

async function setupConversationRLS() {
  console.log('===== SETTING UP RLS POLICIES =====\n');
  
  // Step 1: Enable RLS on tables
  console.log('1. Enabling Row Level Security...');
  
  const enableRLSSQL = `
    -- Enable RLS on conversations and conversation_turns
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;
  `;
  
  const enableRLS = await saol.agentExecuteDDL({
    sql: enableRLSSQL,
    transport: 'pg'
  });
  
  if (enableRLS.success) {
    console.log('✅ RLS enabled on conversations and conversation_turns');
    console.log(`   ${enableRLS.summary}`);
  } else {
    console.error('❌ Failed to enable RLS');
    console.error(`   ${enableRLS.summary}`);
    if (enableRLS.nextActions) {
      console.log('\n   Next actions:');
      enableRLS.nextActions.forEach((action, i) => {
        console.log(`   ${i + 1}. ${action}`);
      });
    }
    return false;
  }
  
  // Step 2: Create RLS policies
  console.log('\n2. Creating RLS policies...');
  
  const rlsPoliciesSQL = `
    -- Drop existing policies if they exist (to allow re-running the script)
    DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can create own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can view own conversation turns" ON conversation_turns;
    DROP POLICY IF EXISTS "Users can create own conversation turns" ON conversation_turns;
    
    -- RLS Policy: Users can view their own conversations
    CREATE POLICY "Users can view own conversations"
      ON conversations FOR SELECT
      USING (auth.uid() = created_by);
    
    -- RLS Policy: Users can create their own conversations
    CREATE POLICY "Users can create own conversations"
      ON conversations FOR INSERT
      WITH CHECK (auth.uid() = created_by);
    
    -- RLS Policy: Users can update their own conversations
    CREATE POLICY "Users can update own conversations"
      ON conversations FOR UPDATE
      USING (auth.uid() = created_by);
    
    -- RLS Policy: Users can delete their own conversations
    CREATE POLICY "Users can delete own conversations"
      ON conversations FOR DELETE
      USING (auth.uid() = created_by);
    
    -- RLS Policy: Users can view turns for their conversations
    CREATE POLICY "Users can view own conversation turns"
      ON conversation_turns FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM conversations
          WHERE conversations.id = conversation_turns.conversation_id
          AND conversations.created_by = auth.uid()
        )
      );
    
    -- RLS Policy: Users can create turns for their conversations
    CREATE POLICY "Users can create own conversation turns"
      ON conversation_turns FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM conversations
          WHERE conversations.id = conversation_turns.conversation_id
          AND conversations.created_by = auth.uid()
        )
      );
  `;
  
  const createPolicies = await saol.agentExecuteDDL({
    sql: rlsPoliciesSQL,
    transport: 'pg'
  });
  
  if (createPolicies.success) {
    console.log('✅ RLS policies created successfully');
    console.log(`   ${createPolicies.summary}`);
  } else {
    console.error('❌ Failed to create RLS policies');
    console.error(`   ${createPolicies.summary}`);
    if (createPolicies.nextActions) {
      console.log('\n   Next actions:');
      createPolicies.nextActions.forEach((action, i) => {
        console.log(`   ${i + 1}. ${action}`);
      });
    }
    return false;
  }
  
  // Step 3: Verify RLS policies
  console.log('\n3. Verifying RLS policies...');
  
  const verifyPoliciesSQL = `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('conversations', 'conversation_turns')
    ORDER BY tablename, policyname;
  `;
  
  try {
    // Use agentExecuteDDL for raw SQL query
    const verifyResult = await saol.agentExecuteDDL({
      sql: verifyPoliciesSQL,
      transport: 'pg'
    });
    
    if (verifyResult.success) {
      console.log('✅ RLS policies verified');
      console.log(`   ${verifyResult.summary}`);
    } else {
      // Try using agentQuery as alternative
      console.log('⚠️  Using alternative verification method...');
      
      // Check if policies exist by attempting to introspect
      const conversationsSchema = await saol.agentIntrospectSchema({
        table: 'conversations',
        includePolicies: true,
        transport: 'pg'
      });
      
      if (conversationsSchema.success) {
        console.log('✅ Conversations table policies verified');
        if (conversationsSchema.tables[0]?.policies) {
          console.log(`   Found ${conversationsSchema.tables[0].policies.length} policies`);
        }
      }
      
      const turnsSchema = await saol.agentIntrospectSchema({
        table: 'conversation_turns',
        includePolicies: true,
        transport: 'pg'
      });
      
      if (turnsSchema.success) {
        console.log('✅ Conversation_turns table policies verified');
        if (turnsSchema.tables[0]?.policies) {
          console.log(`   Found ${turnsSchema.tables[0].policies.length} policies`);
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Policy verification query not supported, but policies were created');
    console.log('   You can verify policies in Supabase Dashboard > Authentication > Policies');
  }
  
  console.log('\n===== RLS SETUP COMPLETE =====');
  console.log('\n📋 Summary:');
  console.log('   • RLS enabled on conversations and conversation_turns tables');
  console.log('   • 4 policies created on conversations (SELECT, INSERT, UPDATE, DELETE)');
  console.log('   • 2 policies created on conversation_turns (SELECT, INSERT)');
  console.log('   • All policies enforce user ownership via created_by column');
  console.log('\n📋 Verify in Supabase Dashboard:');
  console.log('   Database > Tables > conversations > Policies');
  console.log('   Database > Tables > conversation_turns > Policies');
  
  return true;
}

setupConversationRLS()
  .then((success) => {
    if (success) {
      console.log('\n✅ RLS setup completed successfully');
      process.exit(0);
    } else {
      console.error('\n❌ RLS setup completed with errors');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ RLS setup failed with exception:', error);
    console.error(error.stack);
    process.exit(1);
  });

