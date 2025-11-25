const saol = require('../supa-agent-ops/dist/index.js');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251125_add_missing_columns_to_batch_jobs.sql');
    console.log(`Reading migration file: ${migrationPath}`);

    try {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('SQL to execute:');
        console.log(sql);

        console.log('\nAttempting to execute via SAOL...');

        if (typeof saol.agentExecuteSQL === 'function') {
            const result = await saol.agentExecuteSQL({
                query: sql,
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
                supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                transport: 'pg'
            });
            console.log('Execution result:', result);
        } else {
            console.error('agentExecuteSQL function not found in SAOL.');
        }

    } catch (error) {
        console.error('Error applying migration:', error);
    }
}

applyMigration();
