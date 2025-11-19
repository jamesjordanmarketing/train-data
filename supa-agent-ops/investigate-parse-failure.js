#!/usr/bin/env node
/**
 * Investigate Parse Failure
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const conversationId = '50a702ac-4fbf-48df-992e-c22871725e2a';

async function investigateParseFailure() {
  console.log('=================================================');
  console.log('Investigating Parse Failure');
  console.log('=================================================\n');
  console.log(`Conversation ID: ${conversationId}\n`);

  try {
    // Get conversation record
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();

    if (convError || !conv) {
      console.error('Failed to fetch conversation:', convError);
      return;
    }

    console.log('Conversation Details:');
    console.log(`  Processing Status: ${conv.processing_status}`);
    console.log(`  Parse Attempts: ${conv.parse_attempts || 0}`);
    console.log(`  Parse Error: ${conv.parse_error_message || 'None'}`);
    console.log(`  Raw Path: ${conv.raw_response_path}`);
    console.log(`  Raw Size: ${conv.raw_response_size} bytes`);
    console.log('');

    // Download raw response
    console.log('Downloading raw response...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('conversation-files')
      .download(conv.raw_response_path);

    if (downloadError || !fileData) {
      console.error('Failed to download:', downloadError);
      return;
    }

    const rawContent = await fileData.text();
    console.log(`✅ Downloaded: ${rawContent.length} bytes\n`);

    // Show first and last 500 chars
    console.log('-------------------------------------------------');
    console.log('First 500 characters:');
    console.log('-------------------------------------------------');
    console.log(rawContent.substring(0, 500));
    console.log('\n...\n');
    console.log('-------------------------------------------------');
    console.log('Last 500 characters:');
    console.log('-------------------------------------------------');
    console.log(rawContent.substring(rawContent.length - 500));
    console.log('\n');

    // Try to identify the issue
    console.log('-------------------------------------------------');
    console.log('Diagnosis:');
    console.log('-------------------------------------------------');
    
    // Check if it's actually complete
    const openBraces = (rawContent.match(/{/g) || []).length;
    const closeBraces = (rawContent.match(/}/g) || []).length;
    const openBrackets = (rawContent.match(/\[/g) || []).length;
    const closeBrackets = (rawContent.match(/]/g) || []).length;

    console.log(`Open braces: ${openBraces}, Close braces: ${closeBraces}`);
    console.log(`Open brackets: ${openBrackets}, Close brackets: ${closeBrackets}`);
    
    if (openBraces !== closeBraces) {
      console.log(`\n❌ INCOMPLETE JSON: Missing ${Math.abs(openBraces - closeBraces)} closing brace(s)`);
    }
    if (openBrackets !== closeBrackets) {
      console.log(`\n❌ INCOMPLETE JSON: Missing ${Math.abs(openBrackets - closeBrackets)} closing bracket(s)`);
    }

    // Check for truncation
    if (!rawContent.trim().endsWith('}') && !rawContent.trim().endsWith(']')) {
      console.log('\n❌ JSON appears truncated (doesn\'t end with } or ])');
    }

    console.log('\n=================================================');
    console.log('Root Cause:');
    console.log('=================================================');
    console.log('Claude API response was likely truncated or incomplete.');
    console.log('This can happen if:');
    console.log('  1. Response hit max_tokens limit (2048 tokens)');
    console.log('  2. Network timeout during streaming');
    console.log('  3. API returned incomplete response');
    console.log('\nSolution: Increase max_tokens or check API logs');
    console.log('=================================================');

  } catch (error) {
    console.error('Error:', error);
  }
}

investigateParseFailure();
