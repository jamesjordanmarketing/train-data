require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function downloadRawJson() {
  const { data, error } = await supabase.storage
    .from('conversation-files')
    .download('raw/79c81162-6399-41d4-a968-996e0ca0df0c/22c81ac0-781f-4dcf-ad01-b69a95a24d60.json');

  if (error) {
    console.error('Error downloading file:', error);
    process.exit(1);
  }

  const text = await data.text();
  
  // Save to file for inspection
  fs.writeFileSync('raw-conversation-debug.json', text);
  console.log('File downloaded to raw-conversation-debug.json');
  console.log('File size:', text.length, 'bytes');
  console.log('\nLast 200 characters:');
  console.log(text.slice(-200));
  
  process.exit(0);
}

downloadRawJson();
