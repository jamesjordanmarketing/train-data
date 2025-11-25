require('../load-env.js');
const saol = require('../supa-agent-ops/dist/index.js');

async function testSaol() {
    console.log('1. Starting SAOL Test...');
    console.log('   Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('   Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');

    try {
        console.log('2. Calling agentQuery...');

        // Set a timeout to detect hanging
        const timeout = setTimeout(() => {
            console.error('❌ TIMEOUT: SAOL call took longer than 10 seconds.');
            process.exit(1);
        }, 10000);

        const result = await saol.agentQuery({
            table: 'batch_jobs',
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            limit: 1,
            transport: 'supabase' // Explicitly use supabase transport first
        });

        clearTimeout(timeout);

        console.log('3. SAOL Result received.');
        if (result.success) {
            console.log('✅ SAOL Working. Data:', result.data ? result.data.length : 0, 'records');
        } else {
            console.error('❌ SAOL Error:', result);
        }

    } catch (error) {
        console.error('❌ Exception:', error);
    } finally {
        console.log('4. Test completed.');
    }
}

testSaol();
