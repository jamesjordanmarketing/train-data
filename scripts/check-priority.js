const saol = require('../supa-agent-ops/dist/index.js');

async function checkPriorityColumn() {
    console.log('Checking priority column type...');

    try {
        // We can use a direct SQL query to check information_schema if agentIntrospectSchema is flaky
        const sql = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'batch_jobs' AND column_name = 'priority';
    `;

        if (typeof saol.agentExecuteSQL === 'function') {
            const result = await saol.agentExecuteSQL({
                query: sql,
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
                supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                transport: 'pg'
            });
            console.log('Column Info:', result);
        } else {
            console.log('agentExecuteSQL not available.');
        }

    } catch (error) {
        console.error('Error checking column:', error);
    }
}

checkPriorityColumn();
