// Create exec_sql RPC function for SAOL
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  return envVars;
}

async function createExecSqlFunction() {
  console.log('🚀 Creating exec_sql RPC function...\n');

  const envVars = loadEnv();
  const supabase = createClient(
    envVars.SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
  );

  const sql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_script text)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result jsonb;
    BEGIN
      EXECUTE sql_script INTO result;
      RETURN result;
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('error', SQLERRM, 'code', SQLSTATE);
    END;
    $$;

    GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
  `;

  try {
    const { data, error } = await supabase.rpc('query', { query: sql });
    
    if (error) {
      console.error('❌ Error creating exec_sql function:', error);
      
      // Try alternative method
      console.log('\n⚠️  Trying alternative method...');
      console.log('Please manually run this SQL in Supabase Dashboard → SQL Editor:\n');
      console.log(sql);
      console.log('\n');
      
      return false;
    }

    console.log('✅ exec_sql function created successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Manual creation required:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run the following SQL:\n');
    console.log(sql);
    console.log('\n');
    
    return false;
  }
}

if (require.main === module) {
  createExecSqlFunction()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { createExecSqlFunction };

