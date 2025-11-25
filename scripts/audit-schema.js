require('../load-env.js');
const saol = require('../supa-agent-ops/dist/index.js');

async function auditSchema() {
    console.log('Starting Schema Audit...');

    // Expected Schema Definition
    const expectedSchema = {
        batch_jobs: {
            columns: [
                'id', 'name', 'status', 'priority', 'total_items',
                'completed_items', 'failed_items', 'successful_items',
                'tier', 'shared_parameters', 'concurrent_processing',
                'error_handling', 'created_by', 'started_at',
                'completed_at', 'estimated_time_remaining', 'created_at', 'updated_at'
            ],
            types: {
                priority: 'character varying',
                shared_parameters: 'jsonb',
                concurrent_processing: 'integer'
            }
        },
        batch_items: {
            columns: [
                'id', 'batch_job_id', 'position', 'topic', 'tier',
                'parameters', 'status', 'progress', 'estimated_time',
                'conversation_id', 'error_message', 'created_at', 'updated_at'
            ]
        }
    };

    try {
        // 1. Audit batch_jobs
        console.log('\n--- Auditing batch_jobs ---');
        const jobsSchema = await saol.agentIntrospectSchema({
            table: 'batch_jobs',
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            transport: 'pg'
        });

        if (!jobsSchema || !jobsSchema.columns) {
            console.error('❌ Failed to introspect batch_jobs');
        } else {
            const existingCols = jobsSchema.columns.map(c => c.name);
            const missingCols = expectedSchema.batch_jobs.columns.filter(c => !existingCols.includes(c));

            if (missingCols.length > 0) {
                console.error('❌ MISSING COLUMNS:', missingCols.join(', '));
            } else {
                console.log('✅ All required columns present');
            }

            // Check types
            for (const [col, type] of Object.entries(expectedSchema.batch_jobs.types)) {
                const actual = jobsSchema.columns.find(c => c.name === col);
                if (actual && actual.type !== type) {
                    console.error(`❌ TYPE MISMATCH: ${col} is ${actual.type}, expected ${type}`);
                } else if (actual) {
                    console.log(`✅ Type check passed: ${col} (${actual.type})`);
                }
            }
        }

        // 2. Audit batch_items
        console.log('\n--- Auditing batch_items ---');
        const itemsSchema = await saol.agentIntrospectSchema({
            table: 'batch_items',
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            transport: 'pg'
        });

        if (!itemsSchema || !itemsSchema.columns) {
            console.error('❌ Failed to introspect batch_items');
        } else {
            const existingCols = itemsSchema.columns.map(c => c.name);
            const missingCols = expectedSchema.batch_items.columns.filter(c => !existingCols.includes(c));

            if (missingCols.length > 0) {
                console.error('❌ MISSING COLUMNS:', missingCols.join(', '));
            } else {
                console.log('✅ All required columns present');
            }
        }

    } catch (error) {
        console.error('Audit failed:', error);
    }
}

auditSchema();
