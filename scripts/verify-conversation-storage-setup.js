#!/usr/bin/env node
/**
 * Verify Conversation Storage Setup
 * 
 * Verifies that all database tables, indexes, RLS policies, and storage bucket
 * are properly configured for the Conversation Storage Service.
 * 
 * Usage: node scripts/verify-conversation-storage-setup.js
 */

require('dotenv').config({ path: '.env.local' });
const saol = require('supa-agent-ops');
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Set SUPABASE_URL from NEXT_PUBLIC_SUPABASE_URL for SAOL
process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifySetup() {
  console.log('===== CONVERSATION STORAGE SETUP VERIFICATION =====\n');
  
  const results = {
    tablesExist: false,
    columnsOk: false,
    indexesOk: false,
    rlsEnabled: false,
    rlsPoliciesExist: false,
    storageBucketExists: false,
    overallSuccess: false
  };
  
  try {
    // 1. Verify Tables Exist
    console.log('1. Verifying tables exist...');
    
    const conversationsSchema = await saol.agentIntrospectSchema({
      table: 'conversations',
      includeColumns: true,
      transport: 'pg'
    });
    
    const turnsSchema = await saol.agentIntrospectSchema({
      table: 'conversation_turns',
      includeColumns: true,
      transport: 'pg'
    });
    
    const conversationsExists = conversationsSchema.tables[0]?.exists || false;
    const turnsExists = turnsSchema.tables[0]?.exists || false;
    
    if (conversationsExists && turnsExists) {
      console.log('✅ Both tables exist');
      console.log(`   conversations: ${conversationsSchema.tables[0].columns?.length || 0} columns`);
      console.log(`   conversation_turns: ${turnsSchema.tables[0].columns?.length || 0} columns`);
      results.tablesExist = true;
    } else {
      console.log('❌ One or more tables missing');
      console.log(`   conversations: ${conversationsExists ? 'EXISTS' : 'MISSING'}`);
      console.log(`   conversation_turns: ${turnsExists ? 'EXISTS' : 'MISSING'}`);
    }
    
    // 2. Verify Required Columns
    console.log('\n2. Verifying required columns...');
    
    const requiredConvColumns = [
      'file_url', 'file_size', 'file_path', 'storage_bucket',
      'conversation_id', 'persona_id', 'emotional_arc_id', 'training_topic_id',
      'quality_score', 'status', 'processing_status'
    ];
    
    const requiredTurnsColumns = [
      'conversation_id', 'turn_number', 'role', 'content',
      'detected_emotion', 'emotion_confidence', 'primary_strategy', 'tone'
    ];
    
    const convColumns = conversationsSchema.tables[0]?.columns?.map(c => c.name) || [];
    const turnsColumns = turnsSchema.tables[0]?.columns?.map(c => c.name) || [];
    
    const missingConvColumns = requiredConvColumns.filter(col => !convColumns.includes(col));
    const missingTurnsColumns = requiredTurnsColumns.filter(col => !turnsColumns.includes(col));
    
    if (missingConvColumns.length === 0 && missingTurnsColumns.length === 0) {
      console.log('✅ All required columns present');
      results.columnsOk = true;
    } else {
      console.log('❌ Missing required columns:');
      if (missingConvColumns.length > 0) {
        console.log(`   conversations: ${missingConvColumns.join(', ')}`);
      }
      if (missingTurnsColumns.length > 0) {
        console.log(`   conversation_turns: ${missingTurnsColumns.join(', ')}`);
      }
    }
    
    // 3. Verify Indexes
    console.log('\n3. Verifying indexes...');
    
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      const indexRes = await pool.query(`
        SELECT COUNT(*) as count
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename IN ('conversations', 'conversation_turns')
        AND indexname LIKE 'idx_%';
      `);
      
      const indexCount = parseInt(indexRes.rows[0].count);
      
      if (indexCount >= 13) {
        console.log(`✅ Found ${indexCount} indexes (minimum 13 required)`);
        results.indexesOk = true;
      } else {
        console.log(`⚠️  Found only ${indexCount} indexes (minimum 13 required)`);
      }
      
      await pool.end();
    } else {
      console.log('⚠️  DATABASE_URL not set, skipping index verification');
    }
    
    // 4. Verify RLS Enabled
    console.log('\n4. Verifying RLS enabled...');
    
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      const rlsRes = await pool.query(`
        SELECT 
          tablename,
          rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN ('conversations', 'conversation_turns');
      `);
      
      const rlsEnabled = rlsRes.rows.every(row => row.rowsecurity);
      
      if (rlsEnabled) {
        console.log('✅ RLS enabled on both tables');
        results.rlsEnabled = true;
      } else {
        console.log('❌ RLS not enabled on all tables');
        rlsRes.rows.forEach(row => {
          console.log(`   ${row.tablename}: ${row.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
        });
      }
      
      await pool.end();
    } else {
      console.log('⚠️  DATABASE_URL not set, skipping RLS verification');
    }
    
    // 5. Verify RLS Policies
    console.log('\n5. Verifying RLS policies...');
    
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      const policiesRes = await pool.query(`
        SELECT 
          tablename,
          COUNT(*) as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('conversations', 'conversation_turns')
        GROUP BY tablename;
      `);
      
      const convPolicies = policiesRes.rows.find(r => r.tablename === 'conversations');
      const turnsPolicies = policiesRes.rows.find(r => r.tablename === 'conversation_turns');
      
      const convPolicyCount = convPolicies ? parseInt(convPolicies.policy_count) : 0;
      const turnsPolicyCount = turnsPolicies ? parseInt(turnsPolicies.policy_count) : 0;
      
      if (convPolicyCount >= 4 && turnsPolicyCount >= 2) {
        console.log(`✅ RLS policies exist`);
        console.log(`   conversations: ${convPolicyCount} policies (minimum 4 required)`);
        console.log(`   conversation_turns: ${turnsPolicyCount} policies (minimum 2 required)`);
        results.rlsPoliciesExist = true;
      } else {
        console.log(`⚠️  Insufficient RLS policies`);
        console.log(`   conversations: ${convPolicyCount} policies (minimum 4 required)`);
        console.log(`   conversation_turns: ${turnsPolicyCount} policies (minimum 2 required)`);
      }
      
      await pool.end();
    } else {
      console.log('⚠️  DATABASE_URL not set, skipping RLS policy verification');
    }
    
    // 6. Verify Storage Bucket
    console.log('\n6. Verifying storage bucket...');
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Error listing buckets:', listError.message);
    } else {
      const conversationBucket = buckets.find(b => b.name === 'conversation-files');
      
      if (conversationBucket) {
        console.log('✅ conversation-files bucket exists');
        console.log(`   Public: ${conversationBucket.public}`);
        console.log(`   Created: ${conversationBucket.created_at}`);
        results.storageBucketExists = true;
      } else {
        console.log('❌ conversation-files bucket does not exist');
      }
    }
    
    // 7. Overall Status
    console.log('\n===== VERIFICATION SUMMARY =====\n');
    
    results.overallSuccess = 
      results.tablesExist &&
      results.columnsOk &&
      results.indexesOk &&
      results.rlsEnabled &&
      results.rlsPoliciesExist &&
      results.storageBucketExists;
    
    console.log(`Tables Exist:           ${results.tablesExist ? '✅' : '❌'}`);
    console.log(`Required Columns:       ${results.columnsOk ? '✅' : '❌'}`);
    console.log(`Indexes Created:        ${results.indexesOk ? '✅' : '❌'}`);
    console.log(`RLS Enabled:            ${results.rlsEnabled ? '✅' : '❌'}`);
    console.log(`RLS Policies Exist:     ${results.rlsPoliciesExist ? '✅' : '❌'}`);
    console.log(`Storage Bucket Exists:  ${results.storageBucketExists ? '✅' : '❌'}`);
    console.log('');
    
    if (results.overallSuccess) {
      console.log('✅ ALL VERIFICATION CHECKS PASSED');
      console.log('\nNext Steps:');
      console.log('  1. Create Storage RLS policies in Supabase Dashboard (see bucket setup output)');
      console.log('  2. Test conversation creation with conversation service');
      console.log('  3. Verify file upload and retrieval work correctly');
    } else {
      console.log('⚠️  SOME VERIFICATION CHECKS FAILED');
      console.log('\nRecommended Actions:');
      console.log('  1. Review failed checks above');
      console.log('  2. Re-run setup scripts as needed');
      console.log('  3. Check Supabase Dashboard for any issues');
    }
    
    return results.overallSuccess;
    
  } catch (error) {
    console.error('\n❌ Verification failed with exception:', error);
    console.error(error.stack);
    return false;
  }
}

verifySetup()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Verification script error:', error);
    process.exit(1);
  });

