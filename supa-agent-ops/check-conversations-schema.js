const saol = require('.');

(async () => {
  try {
    // Try to query a few rows to see the data
    const result = await saol.agentQuery({
      table: 'conversations',
      limit: 1,
      transport: 'supabase'
    });
    
    console.log('Sample conversation row:');
    console.log(JSON.stringify(result.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
