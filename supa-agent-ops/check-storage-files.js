/**
 * Check if files actually exist in Supabase Storage
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkStorageFiles() {
  console.log('=================================================');
  console.log('Checking Supabase Storage for Conversation Files');
  console.log('=================================================\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Check 1: List files in the user's directory
    console.log('Check 1: Listing files in user directory...');
    const userId = '79c81162-6399-41d4-a968-996e0ca0df0c';
    const conversationId = '4158a61c-8eab-4d6d-9708-b4bbd0dcad9d';

    const { data: files, error: listError } = await supabase
      .storage
      .from('conversation-files')
      .list(userId, {
        limit: 100,
        offset: 0,
      });

    if (listError) {
      console.error('❌ Error listing files:', listError);
    } else {
      console.log(`✓ Found ${files.length} items in ${userId}/`);
      files.forEach((file, idx) => {
        console.log(`  [${idx + 1}] ${file.name} (${file.metadata?.size || 0} bytes)`);
      });
      console.log();
    }

    // Check 2: Try to get the specific conversation file
    console.log('Check 2: Checking for conversation file...');
    const conversationPath = `${userId}/${conversationId}/conversation.json`;
    
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('conversation-files')
      .download(conversationPath);

    if (fileError) {
      console.error(`❌ File NOT found: ${conversationPath}`);
      console.error(`   Error: ${fileError.message}`);
      console.log();
    } else {
      console.log(`✓ File EXISTS: ${conversationPath}`);
      console.log(`  Size: ${fileData.size} bytes`);
      console.log();
    }

    // Check 3: Try to get the raw response file
    console.log('Check 3: Checking for raw response file...');
    const rawPath = `raw/${userId}/${conversationId}.json`;
    
    const { data: rawData, error: rawError } = await supabase
      .storage
      .from('conversation-files')
      .download(rawPath);

    if (rawError) {
      console.error(`❌ File NOT found: ${rawPath}`);
      console.error(`   Error: ${rawError.message}`);
      console.log();
    } else {
      console.log(`✓ File EXISTS: ${rawPath}`);
      console.log(`  Size: ${rawData.size} bytes`);
      console.log();
    }

    // Check 4: List ALL files in the bucket (to see what's actually there)
    console.log('Check 4: Listing ALL top-level directories...');
    const { data: topLevel, error: topError } = await supabase
      .storage
      .from('conversation-files')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (topError) {
      console.error('❌ Error listing top-level:', topError);
    } else {
      console.log(`✓ Found ${topLevel.length} top-level items:`);
      topLevel.forEach((item, idx) => {
        console.log(`  [${idx + 1}] ${item.name}`);
      });
      console.log();
    }

    console.log('=================================================');
    console.log('Diagnosis');
    console.log('=================================================');
    console.log('If the files are NOT found in storage:');
    console.log('  → The storage upload failed during generation');
    console.log('  → Database was updated but files were never uploaded');
    console.log('  → This is a storage service bug');
    console.log('');
    console.log('If the files ARE found in storage:');
    console.log('  → The download URL generation is using wrong path');
    console.log('  → This is a path formatting bug');
    console.log('=================================================');

  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error);
    process.exit(1);
  }
}

// Run check
checkStorageFiles();
