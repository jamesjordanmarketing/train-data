/**
 * Test SAOL functionality
 */

const path = require('path');
const fs = require('fs');

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    process.env[key.trim()] = values.join('=').trim();
  }
});

async function testSAOL() {
  try {
    console.log('🔍 Testing SAOL...\n');

    // Try to load SAOL
    const saolPath = path.join(__dirname, '..', 'supa-agent-ops', 'dist', 'index.js');
    console.log('📂 SAOL path:', saolPath);
    console.log('📂 Path exists:', fs.existsSync(saolPath));

    if (!fs.existsSync(saolPath)) {
      console.log('❌ SAOL dist/index.js not found!');
      console.log('\n📂 Checking supa-agent-ops directory...');
      const saolDir = path.join(__dirname, '..', 'supa-agent-ops');
      if (fs.existsSync(saolDir)) {
        const files = fs.readdirSync(saolDir);
        console.log('Files in supa-agent-ops:', files);
        
        if (fs.existsSync(path.join(saolDir, 'dist'))) {
          const distFiles = fs.readdirSync(path.join(saolDir, 'dist'));
          console.log('Files in supa-agent-ops/dist:', distFiles);
        }
      }
      return;
    }

    console.log('\n📦 Loading SAOL module...');
    const saolModule = require(saolPath);
    console.log('Module keys:', Object.keys(saolModule));
    console.log('Module type:', typeof saolModule);
    console.log('Full module:', saolModule);

    // Try different import patterns
    console.log('\n🧪 Testing different import patterns...\n');

    // Pattern 1: Named export
    if (saolModule.SupabaseAgentOpsLibrary) {
      console.log('✅ Pattern 1: Named export { SupabaseAgentOpsLibrary }');
      console.log('   Type:', typeof saolModule.SupabaseAgentOpsLibrary);
      
      try {
        const saol = new saolModule.SupabaseAgentOpsLibrary({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
        });
        console.log('   ✅ Constructor works!');
        console.log('   Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(saol)));
      } catch (err) {
        console.log('   ❌ Constructor failed:', err.message);
      }
    } else {
      console.log('❌ Pattern 1: SupabaseAgentOpsLibrary not found');
    }

    // Pattern 2: Default export
    if (saolModule.default) {
      console.log('\n✅ Pattern 2: Default export');
      console.log('   Type:', typeof saolModule.default);
      
      if (typeof saolModule.default === 'function') {
        try {
          const saol = new saolModule.default({
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
          });
          console.log('   ✅ Constructor works!');
        } catch (err) {
          console.log('   ❌ Constructor failed:', err.message);
        }
      }
    } else {
      console.log('❌ Pattern 2: No default export');
    }

    // Pattern 3: Direct function
    if (typeof saolModule === 'function') {
      console.log('\n✅ Pattern 3: Module is a function');
      try {
        const saol = new saolModule({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
        });
        console.log('   ✅ Constructor works!');
      } catch (err) {
        console.log('   ❌ Constructor failed:', err.message);
      }
    }

    // Pattern 4: Check for functional exports
    console.log('\n📋 Checking for functional exports...');
    const possibleMethods = ['agentQuery', 'agentIntrospectSchema', 'agentCount'];
    possibleMethods.forEach(method => {
      if (saolModule[method]) {
        console.log(`   ✅ ${method} exists (type: ${typeof saolModule[method]})`);
      } else {
        console.log(`   ❌ ${method} not found`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSAOL().catch(console.error);
