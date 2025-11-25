require('../load-env.js');
const saol = require('../supa-agent-ops/dist/index.js');

async function auditSchemaProbe() {
    console.log('Starting Schema Audit (Probe Method)...');

    const tables = {
        batch_jobs: {
            columns: [
                'id', 'name', 'status', 'priority', 'total_items',
                'completed_items', 'failed_items', 'successful_items',
                'tier', 'shared_parameters', 'concurrent_processing',
                'error_handling', 'created_by', 'started_at',
                'completed_at', 'estimated_time_remaining', 'created_at', 'updated_at'
            ],
            typeChecks: [
                { col: 'priority', val: 'normal', desc: 'String check' },
                { col: 'shared_parameters', val: {}, desc: 'JSON check' } // Might not work as filter, but selecting it works
            ]
        },
        batch_items: {
            columns: [
                'id', 'batch_job_id', 'position', 'topic', 'tier',
                'parameters', 'status', 'progress', 'estimated_time',
                'conversation_id', 'error_message', 'created_at', 'updated_at'
            ]
        }
    };

    for (const [tableName, config] of Object.entries(tables)) {
        console.log(`\n--- Auditing ${tableName} ---`);
        const missing = [];

        // 1. Check Column Existence
        // We check one by one to be precise, or in groups?
        // Checking one by one is safer to isolate errors.

        console.log('Checking columns...');
        for (const col of config.columns) {
            try {
                const result = await saol.agentQuery({
                    table: tableName,
                    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
                    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                    select: [col],
                    limit: 1,
                    transport: 'supabase'
                });

                if (!result.success) {
                    // Check error message
                    const msg = result.error?.message || JSON.stringify(result);
                    if (msg.includes('Could not find the') || msg.includes('does not exist')) {
                        console.error(`❌ Missing column: ${col}`);
                        missing.push(col);
                    } else {
                        console.error(`⚠️  Error checking ${col}: ${msg}`);
                    }
                } else {
                    // process.stdout.write('.');
                }
            } catch (e) {
                console.error(`❌ Exception checking ${col}:`, e.message);
            }
        }
        console.log('\nColumn check complete.');

        if (missing.length === 0) {
            console.log('✅ All columns present.');
        } else {
            console.log(`❌ MISSING ${missing.length} COLUMNS: ${missing.join(', ')}`);
        }

        // 2. Check Types (specifically priority)
        if (config.typeChecks) {
            console.log('Checking types...');
            for (const check of config.typeChecks) {
                try {
                    // Try to filter by the value. If type mismatches, it should error.
                    // e.g. priority = 'normal' on an INTEGER column -> Error 22P02
                    const result = await saol.agentQuery({
                        table: tableName,
                        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
                        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                        where: [{ column: check.col, operator: 'eq', value: check.val }],
                        limit: 1,
                        transport: 'supabase'
                    });

                    if (!result.success) {
                        const msg = result.error?.message || '';
                        if (msg.includes('invalid input syntax') || msg.includes('operator does not exist')) {
                            console.error(`❌ TYPE MISMATCH for ${check.col}: ${msg}`);
                        } else {
                            console.log(`✅ Type check passed for ${check.col} (or unrelated error: ${msg})`);
                        }
                    } else {
                        console.log(`✅ Type check passed for ${check.col}`);
                    }
                } catch (e) {
                    console.error(`❌ Exception checking type for ${check.col}:`, e.message);
                }
            }
        }
    }
}

auditSchemaProbe();
