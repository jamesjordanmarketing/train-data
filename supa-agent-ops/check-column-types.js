const saol = require('.');

(async () => {
  try {
    console.log('Checking generation_logs.conversation_id type...\n');
    
    // Use agentExecuteDDL for information_schema query
    const genLogsResult = await saol.agentExecuteDDL({
      sql: `SELECT column_name, data_type, udt_name, is_nullable FROM information_schema.columns WHERE table_name = 'generation_logs' AND column_name = 'conversation_id';`,
      transport: 'supabase'
    });
    
    console.log('Result:', JSON.stringify(genLogsResult, null, 2));
    
    console.log('\n---\n');
    console.log('Checking conversations.conversation_id type...\n');
    
    const conversationsResult = await saol.agentExecuteDDL({
      sql: `SELECT column_name, data_type, udt_name, is_nullable FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'conversation_id';`,
      transport: 'supabase'
    });
    
    console.log('Result:', JSON.stringify(conversationsResult, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
})();
