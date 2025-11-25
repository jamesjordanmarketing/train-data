/**
 * Test SAOL functional API
 */

const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    process.env[key.trim()] = values.join('=').trim();
  }
});

async function testSAOLFunctional() {
  try {
    console.log('🔍 Testing SAOL Functional API...\n');

    const saolPath = path.join(__dirname, '..', 'supa-agent-ops', 'dist', 'index.js');
    const saol = require(saolPath);

    console.log('✅ SAOL loaded successfully\n');
    console.log('📋 SAOL exports functional API (not a class)\n');

    // Test 1: Schema introspection
    console.log('🧪 Test 1: agentIntrospectSchema');
    try {
      const schema = await saol.agentIntrospectSchema({
        table: 'batch_jobs',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        transport: 'pg'
      });

      console.log('✅ Schema introspection works!');
      console.log('   Columns found:', schema.columns.length);
      console.log('   Sample columns:');
      schema.columns.slice(0, 5).forEach(col => {
        console.log(`      - ${col.name} (${col.type})`);
      });
      
      // Check for error_handling column
      const hasErrorHandling = schema.columns.find(col => col.name === 'error_handling');
      console.log(`\n   ${hasErrorHandling ? '✅' : '❌'} error_handling column present`);
    } catch (err) {
      console.log('❌ Schema introspection failed:', err.message);
    }

    // Test 2: Query
    console.log('\n🧪 Test 2: agentQuery');
    try {
      const result = await saol.agentQuery({
        table: 'batch_jobs',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        limit: 1,
        transport: 'supabase'
      });

      console.log('✅ Query works!');
      console.log('   Records returned:', result.data?.length || 0);
    } catch (err) {
      console.log('❌ Query failed:', err.message);
    }

    // Test 3: Count
    console.log('\n🧪 Test 3: agentCount');
    try {
      const count = await saol.agentCount({
        table: 'batch_jobs',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        transport: 'supabase'
      });

      console.log('✅ Count works!');
      console.log('   Total batch_jobs:', count);
    } catch (err) {
      console.log('❌ Count failed:', err.message);
    }

    console.log('\n📝 CORRECT USAGE PATTERN:');
    console.log(`
const saol = require('./supa-agent-ops/dist/index.js');

// NOT a class - call functions directly with config
const result = await saol.agentQuery({
  table: 'your_table',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  where: [{ column: 'status', operator: 'eq', value: 'active' }],
  transport: 'supabase'
});
    `);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
  }
}

testSAOLFunctional().catch(console.error);
