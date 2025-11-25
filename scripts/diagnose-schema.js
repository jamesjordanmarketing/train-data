const saol = require('../supa-agent-ops/dist/index.js');

async function checkSchema() {
    console.log('Checking batch_jobs schema...');

    try {
        // Introspect the schema
        const schema = await saol.agentIntrospectSchema({
            table: 'batch_jobs',
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            transport: 'pg' // Using pg transport for better schema details if available, or fallback to default
        });

        console.log('Current Columns in batch_jobs:');
        if (schema && schema.columns) {
            schema.columns.forEach(col => {
                console.log(`- ${col.name} (${col.type})`);
            });
        } else {
            console.log('Could not retrieve columns or table not found.');
            console.log('Raw schema response:', JSON.stringify(schema, null, 2));
        }

    } catch (error) {
        console.error('Error checking schema:', error);
    }
}

checkSchema();
