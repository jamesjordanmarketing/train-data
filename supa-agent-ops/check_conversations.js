require('dotenv').config();
const { agentQuery, agentIntrospectSchema } = require('./dist/index.js');

async function checkConversations() {
    const ids = [
        '05caac4b-3c7f-4de9-a7f4-7b956a889c87',
        'c0d90885-a02a-4402-8fe7-94fcf2528472',
        '4b73b5aa-3749-4a6c-b13c-796c015c4516'
    ];

    console.log('Checking for conversations:', ids);

    try {
        const result = await agentQuery({
            table: 'conversations',
            where: [
                { column: 'conversation_id', operator: 'in', value: ids }
            ]
        });

        console.log('Found conversations:', result.data);
        const count = result.data ? result.data.length : 0;
        console.log(`\n*** COUNT IS [${count}] ***\n`);

        if (result.data) {
            result.data.forEach(c => {
                console.log(`ID: ${c.conversation_id}, Status: ${c.enrichment_status}, FilePath: ${c.enriched_file_path}`);
            });
        }

        console.log('\nIntrospecting conversations table schema...');
        const schema = await agentIntrospectSchema({
            table: 'conversations',
            includeColumns: true,
            includeConstraints: true
        });

        if (schema.tables && schema.tables.length > 0) {
            const table = schema.tables[0];
            console.log('Primary Key:', table.constraints.find(c => c.type === 'PRIMARY KEY'));
            console.log('Columns:', table.columns.map(c => `${c.name} (${c.type})`).join(', '));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkConversations();
