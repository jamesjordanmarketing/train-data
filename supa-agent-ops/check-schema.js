const saol = require('.');

(async () => {
  try {
    console.log('Checking generation_logs table...\n');
    const genLogs = await saol.agentIntrospectSchema({
      table: 'generation_logs',
      transport: 'pg'
    });
    
    if (genLogs.tables && genLogs.tables[0]) {
      const convIdCol = genLogs.tables[0].columns.find(c => c.name === 'conversation_id');
      console.log('generation_logs.conversation_id:', JSON.stringify(convIdCol, null, 2));
    }
    
    console.log('\n---\n');
    console.log('Checking conversations table...\n');
    const conversations = await saol.agentIntrospectSchema({
      table: 'conversations',
      transport: 'pg'
    });
    
    if (conversations.tables && conversations.tables[0]) {
      const convIdCol = conversations.tables[0].columns.find(c => c.name === 'conversation_id');
      console.log('conversations.conversation_id:', JSON.stringify(convIdCol, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
