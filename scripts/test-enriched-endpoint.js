/**
 * Simple Test: Call enriched download endpoint
 * Run dev server first: npm run dev
 * Then run: node scripts/test-enriched-endpoint.js
 */

require('dotenv').config({ path: '.env.local' });

const CONVERSATION_ID = '4acf22d3-e8e5-4293-88d6-db03de41675a';
const ENDPOINT_URL = `http://localhost:3000/api/conversations/${CONVERSATION_ID}/download/enriched`;

async function testEndpoint() {
  console.log('🧪 Testing Enriched Download Endpoint\n');
  console.log('URL:', ENDPOINT_URL, '\n');
  console.log('⚠️  Note: Make sure dev server is running (npm run dev)\n');

  try {
    // Make request (no auth for now, will test full flow separately)
    console.log('Calling endpoint...');
    const response = await fetch(ENDPOINT_URL);
    
    console.log('Response status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('\nResponse body:', JSON.stringify(data, null, 2));

    if (response.status === 401) {
      console.log('\n✅ Expected: Endpoint requires authentication');
      console.log('   Next: Test with authenticated request in browser');
    } else if (response.ok && data.download_url) {
      console.log('\n✅ Success: Got download URL');
      console.log('   Trying to download file...');
      
      const fileResponse = await fetch(data.download_url);
      if (fileResponse.ok) {
        const text = await fileResponse.text();
        console.log('   ✅ File downloaded:', text.length, 'bytes');
        console.log('   Valid JSON:', text.startsWith('{'));
      } else {
        console.log('   ❌ File download failed:', fileResponse.status);
      }
    } else {
      console.log('\n❌ Unexpected response');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEndpoint();
