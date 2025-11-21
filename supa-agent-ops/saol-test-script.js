require('dotenv').config({ path: '../.env.local' });
const saol = require('./dist/index.js');

async function testSaol() {
    console.log('--- Starting SAOL Test ---');

    try {
        // 1. Preflight
        console.log('\n1. Testing agentPreflight...');
        const preflight = await saol.agentPreflight({ table: 'conversations' });
        console.log('Preflight result:', JSON.stringify(preflight, null, 2));

        if (!preflight.ok) {
            console.error('Preflight failed!');
            return;
        }

        // 2. Query
        console.log('\n2. Testing agentQuery...');
        const queryResult = await saol.agentQuery({
            table: 'conversations',
            limit: 5
        });

        if (queryResult.success) {
            console.log(`Query success! Found ${queryResult.data.length} records.`);
            if (queryResult.data.length > 0) {
                console.log('Sample record ID:', queryResult.data[0].id);
            }
        } else {
            console.error('Query failed:', queryResult.summary);
            console.error('Next actions:', queryResult.nextActions);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
    console.log('\n--- SAOL Test Complete ---');
}

testSaol();
