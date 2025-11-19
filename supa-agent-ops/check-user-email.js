#!/usr/bin/env node
/**
 * Check User ID by Email
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const targetEmail = 'james+11-18-25@jamesjordanmarketing.com';

async function checkUser() {
  console.log('=================================================');
  console.log('Checking User ID for Email');
  console.log('=================================================\n');
  console.log(`Email: ${targetEmail}\n`);

  try {
    // Query auth.users table for this email
    const { data: result, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    const user = result.users.find(u => u.email === targetEmail);

    if (!user) {
      console.log('❌ User not found with this email\n');
      console.log('You may need to create a new test user.');
      return;
    }
    console.log('✅ User found!\n');
    console.log('User Details:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Created: ${user.created_at}`);
    console.log(`  Last Sign In: ${user.last_sign_in_at || 'Never'}`);
    console.log(`  Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);

    // Check conversations for this user
    console.log('\n-------------------------------------------------');
    console.log('Checking conversations for this user...\n');

    const { data: convs, error: convsError } = await supabase
      .from('conversations')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (convsError) {
      console.error('Error fetching conversations:', convsError);
      return;
    }

    console.log(`Found ${convs.length} conversation(s):\n`);
    
    convs.forEach((conv, idx) => {
      console.log(`[${idx + 1}] ${conv.conversation_id}`);
      console.log(`    Status: ${conv.processing_status}`);
      console.log(`    Created: ${conv.created_at}`);
      console.log(`    File path: ${conv.file_path || 'Not set'}`);
      console.log(`    Raw path: ${conv.raw_response_path || 'Not set'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUser();
