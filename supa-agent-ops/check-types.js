const saol = require('.');

(async () => {
  try {
    // Check generation_logs.conversation_id type
    const genLogsQuery = await saol.agentRawQuery({
      sql: `
        SELECT column_name, data_type, is_nullable, udt_name
        FROM information_schema.columns 
        WHERE table_name = 'generation_logs' 
        AND column_name = 'conversation_id';
      `,
      transport: 'pg'
    });
    
    console.log('generation_logs.conversation_id:');
    console.log(JSON.stringify(genLogsQuery.rows, null, 2));
    
    // Check conversations.conversation_id type
    const conversationsQuery = await saol.agentRawQuery({
      sql: `
        SELECT column_name, data_type, is_nullable, udt_name
        FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'conversation_id';
      `,
      transport: 'pg'
    });
    
    console.log('\nconversations.conversation_id:');
    console.log(JSON.stringify(conversationsQuery.rows, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
})();
