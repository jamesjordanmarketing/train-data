/**
 * Test actual API response to see if enrichment_status is included
 */

require('dotenv').config({ path: '.env.local' });

async function testAPIResponse() {
  console.log('🧪 Testing /api/conversations endpoint response\n');

  try {
    const response = await fetch('http://localhost:3000/api/conversations?limit=2');
    
    if (!response.ok) {
      console.error('API returned error:', response.status);
      const text = await response.text();
      console.error(text);
      return;
    }

    const data = await response.json();
    console.log('API Response structure:');
    console.log('  Has "conversations" key:', 'conversations' in data);
    console.log('  Has "data" key:', 'data' in data);
    console.log('  Has "total" key:', 'total' in data);
    console.log('');

    const conversations = data.conversations || data.data || data;
    
    if (Array.isArray(conversations) && conversations.length > 0) {
      console.log(`Found ${conversations.length} conversations\n`);
      
      const first = conversations[0];
      console.log('First conversation fields:');
      console.log('  conversation_id:', first.conversation_id || first.conversationId);
      console.log('  enrichment_status:', first.enrichment_status);
      console.log('  raw_response_path:', first.raw_response_path ? 'present' : 'missing');
      console.log('  enriched_file_path:', first.enriched_file_path ? 'present' : 'missing');
      console.log('');
      
      console.log('ALL keys in first conversation:');
      console.log(Object.keys(first).sort());
      
      // Check if enrichment_status is actually present
      if ('enrichment_status' in first) {
        console.log('\n✅ enrichment_status IS present in API response');
        console.log('   Value:', first.enrichment_status);
        console.log('   Type:', typeof first.enrichment_status);
      } else {
        console.log('\n❌ enrichment_status is MISSING from API response');
      }
    } else {
      console.log('No conversations in response');
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\n⚠️  Make sure dev server is running: npm run dev');
  }
}

testAPIResponse();
