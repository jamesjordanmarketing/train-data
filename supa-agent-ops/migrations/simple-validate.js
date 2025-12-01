/**
 * Simple Validation: Check if tables exist using raw Supabase client
 * Run with: node supa-agent-ops/migrations/simple-validate.js
 * 
 * This bypasses SAOL and uses direct Supabase client
 */

const path = require('path');
const fs = require('fs');

// Manually load .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
console.log(`Loading env from: ${envPath}`);

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    const match = trimmed.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (!process.env[key]) {
        process.env[key] = value.trim();
      }
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`\n🔍 Environment Check:`);
console.log(`  SUPABASE_URL: ${SUPABASE_URL ? '✅ ' + SUPABASE_URL : '❌ Missing'}`);
console.log(`  SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY ? '✅ Found (' + SERVICE_ROLE_KEY.substring(0, 20) + '...)' : '❌ Missing'}`);
console.log('');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  console.log('\n💡 Add to .env.local:');
  console.log('   SUPABASE_URL=https://your-project.supabase.co');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJ...');
  process.exit(1);
}

// Use raw Supabase client
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runValidation() {
  console.log('🚀 Starting Simple Validation\n');
  console.log('=' .repeat(60));
  
  // Test 1: training_files table
  console.log('\n📋 Testing training_files table...');
  try {
    const { data, error } = await supabase
      .from('training_files')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ FAIL:', error.message);
      return false;
    }
    
    console.log('✅ PASS - training_files table exists');
    console.log(`   Found ${data.length} records`);
  } catch (error) {
    console.error('❌ FAIL:', error.message);
    return false;
  }
  
  // Test 2: training_file_conversations table
  console.log('\n📋 Testing training_file_conversations table...');
  try {
    const { data, error } = await supabase
      .from('training_file_conversations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ FAIL:', error.message);
      return false;
    }
    
    console.log('✅ PASS - training_file_conversations table exists');
    console.log(`   Found ${data.length} records`);
  } catch (error) {
    console.error('❌ FAIL:', error.message);
    return false;
  }
  
  // Test 3: storage bucket
  console.log('\n📦 Testing training-files bucket...');
  try {
    const { data, error } = await supabase.storage
      .from('training-files')
      .list('', { limit: 1 });
    
    if (error) {
      console.error('❌ FAIL:', error.message);
      console.log('💡 Bucket may not exist. Run 02-create-training-files-bucket.sql');
      return false;
    }
    
    console.log('✅ PASS - training-files bucket exists');
  } catch (error) {
    console.error('❌ FAIL:', error.message);
    return false;
  }
  
  // Test 4: Check for conversations table
  console.log('\n📋 Testing conversations table (optional)...');
  try {
    const { count, error } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('enrichment_status', 'completed');
    
    if (error) {
      console.log('⚠️  Conversations table not accessible (this is OK if not created yet)');
    } else {
      console.log(`✅ Found ${count} enriched conversations`);
    }
  } catch (error) {
    console.log('⚠️  Conversations table not accessible');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Validation Complete!');
  console.log('\n📊 Summary:');
  console.log('  ✅ training_files table exists');
  console.log('  ✅ training_file_conversations table exists');
  console.log('  ✅ training-files storage bucket exists');
  console.log('\n🎉 System is ready to use!');
  console.log('\nNext steps:');
  console.log('  1. Test API: POST /api/training-files');
  console.log('  2. For detailed schema info, run validate-installation.sql in Supabase');
  console.log('');
  
  return true;
}

runValidation().catch(error => {
  console.error('\n❌ Validation failed:', error.message);
  process.exit(1);
});

