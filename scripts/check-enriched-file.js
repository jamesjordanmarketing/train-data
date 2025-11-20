require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFile() {
  const path = '79c81162-6399-41d4-a968-996e0ca0df0c/3bc38a7b-232a-4908-9cf1-271ac2d25102/enriched.json';
  
  console.log(`Checking if file exists: ${path}`);
  
  const { data, error } = await supabase.storage
    .from('conversation-files')
    .download(path);

  if (error) {
    console.error('Error downloading:', error);
    process.exit(1);
  } else {
    console.log('✅ File exists!');
    console.log('File size:', data.size, 'bytes');
    process.exit(0);
  }
}

checkFile();
