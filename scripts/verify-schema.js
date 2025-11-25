const saol = require('../supa-agent-ops/dist/index.js');

async function verifySchema() {
    console.log('Verifying schema changes...');

    try {
        // 1. Check batch_jobs columns
        console.log('Checking batch_jobs...');
        const jobResult = await saol.agentQuery({
            table: 'batch_jobs',
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            select: ['id', 'shared_parameters', 'concurrent_processing', 'tier', 'priority'],
            limit: 1,
            transport: 'supabase'
        });

        if (jobResult.success) {
            console.log('✅ batch_jobs columns exist (query successful)');
        } else {
            console.error('❌ batch_jobs check failed:', jobResult);
        }

        // 2. Check batch_items columns
        console.log('\nChecking batch_items...');
        const itemResult = await saol.agentQuery({
            table: 'batch_items',
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            select: ['id', 'tier', 'parameters'],
            limit: 1,
            transport: 'supabase'
        });

        if (itemResult.success) {
            console.log('✅ batch_items columns exist (query successful)');
        } else {
            console.error('❌ batch_items check failed:', itemResult);
        }

    } catch (error) {
        console.error('Error verifying schema:', error);
    }
}

verifySchema();
