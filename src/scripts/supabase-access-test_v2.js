/**
 * Supabase Access Verification Test Script v2
 *
 * Tests read/write/edit access to Supabase from scripts directory
 * Usage:
 *   node supabase-access-test_v2.js read
 *   node supabase-access-test_v2.js write
 *   node supabase-access-test_v2.js edit
 *   node supabase-access-test_v2.js cleanup
 */

require('dotenv').config({ path: '../../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ HARD BLOCK: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('Check .env.local at: C:\\Users\\james\\Master\\BrightHub\\BRun\\train-data\\.env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test data
const TEST_CREATOR = 'access_test';
const TEST_TEMPLATE_NAME = 'Access Test Template';

/**
 * READ TEST - Count templates and conversations
 */
async function testRead() {
  console.log('\n📖 READ TEST - Counting records...\n');

  try {
    // Count templates
    const { count: templateCount, error: templateError } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true });

    if (templateError) {
      console.error('❌ Error counting templates:', templateError.message);
      return false;
    }

    console.log(`✅ Templates count: ${templateCount}`);

    // Count conversations
    const { count: conversationCount, error: conversationError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    if (conversationError) {
      console.error('❌ Error counting conversations:', conversationError.message);
      return false;
    }

    console.log(`✅ Conversations count: ${conversationCount}`);

    // Try to read a few templates
    const { data: templates, error: readError } = await supabase
      .from('templates')
      .select('id, template_name, created_at')
      .limit(3);

    if (readError) {
      console.error('❌ Error reading templates:', readError.message);
      return false;
    }

    console.log(`\n✅ Successfully read ${templates?.length || 0} template records`);
    if (templates && templates.length > 0) {
      console.log('Sample template:', templates[0].template_name);
    }

    console.log('\n✅ READ TEST PASSED\n');
    return true;

  } catch (err) {
    console.error('❌ READ TEST FAILED:', err.message);
    return false;
  }
}

/**
 * WRITE TEST - Insert a test row
 */
async function testWrite() {
  console.log('\n✍️  WRITE TEST - Inserting test record...\n');

  try {
    // Get count before insert
    const { count: countBefore, error: countBeforeError } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true });

    if (countBeforeError) {
      console.error('❌ Error counting templates before insert:', countBeforeError.message);
      return false;
    }

    console.log(`Templates count before insert: ${countBefore}`);

    // Create test template record
    const testTemplate = {
      id: uuidv4(),
      template_name: TEST_TEMPLATE_NAME,
      description: 'Test template for access verification',
      category: 'test',
      tier: 'template',
      template_text: 'Test prompt',
      structure: 'simple',
      variables: [],
      tone: 'neutral',
      complexity_baseline: 1,
      usage_count: 0,
      rating: 0,
      success_rate: 0,
      version: 1,
      created_by: null,
      last_modified_by: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_modified: new Date().toISOString()
    };

    const { data: insertedData, error: insertError } = await supabase
      .from('templates')
      .insert(testTemplate)
      .select();

    if (insertError) {
      console.error('❌ Error inserting test template:', insertError.message);
      console.error('Error details:', insertError);
      return false;
    }

    console.log(`✅ Successfully inserted test template with ID: ${insertedData[0].id}`);

    // Get count after insert
    const { count: countAfter, error: countAfterError } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true });

    if (countAfterError) {
      console.error('❌ Error counting templates after insert:', countAfterError.message);
      return false;
    }

    console.log(`Templates count after insert: ${countAfter}`);
    console.log(`Count difference: ${countAfter - countBefore}`);

    if (countAfter === countBefore + 1) {
      console.log('\n✅ WRITE TEST PASSED\n');
      return true;
    } else {
      console.error('❌ Count mismatch - expected +1, got', countAfter - countBefore);
      return false;
    }

  } catch (err) {
    console.error('❌ WRITE TEST FAILED:', err.message);
    console.error('Stack trace:', err.stack);
    return false;
  }
}

/**
 * EDIT TEST - Update a test row
 */
async function testEdit() {
  console.log('\n✏️  EDIT TEST - Updating test record...\n');

  try {
    // Find test template
    const { data: testTemplates, error: findError } = await supabase
      .from('templates')
      .select('*')
      .eq('template_name', TEST_TEMPLATE_NAME)
      .limit(1);

    if (findError) {
      console.error('❌ Error finding test template:', findError.message);
      return false;
    }

    if (!testTemplates || testTemplates.length === 0) {
      console.error('❌ No test template found. Run write test first.');
      return false;
    }

    const testTemplate = testTemplates[0];
    console.log(`Found test template: ${testTemplate.id}`);
    console.log(`Current description: "${testTemplate.description}"`);

    // Update description
    const newDescription = `Updated test description at ${new Date().toISOString()}`;
    const { data: updatedData, error: updateError } = await supabase
      .from('templates')
      .update({
        description: newDescription,
        updated_at: new Date().toISOString()
      })
      .eq('id', testTemplate.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating test template:', updateError.message);
      return false;
    }

    console.log(`✅ Successfully updated template`);
    console.log(`New description: "${updatedData[0].description}"`);

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('templates')
      .select('description')
      .eq('id', testTemplate.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError.message);
      return false;
    }

    if (verifyData.description === newDescription) {
      console.log('\n✅ EDIT TEST PASSED - Update verified\n');
      return true;
    } else {
      console.error('❌ Update verification failed');
      return false;
    }

  } catch (err) {
    console.error('❌ EDIT TEST FAILED:', err.message);
    return false;
  }
}

/**
 * CLEANUP - Delete all test records
 */
async function testCleanup() {
  console.log('\n🧹 CLEANUP - Removing test records...\n');

  try {
    // Find all test templates
    const { data: testTemplates, error: findError } = await supabase
      .from('templates')
      .select('id, template_name')
      .eq('template_name', TEST_TEMPLATE_NAME);

    if (findError) {
      console.error('❌ Error finding test templates:', findError.message);
      return false;
    }

    if (!testTemplates || testTemplates.length === 0) {
      console.log('ℹ️  No test templates found to clean up');
      console.log('\n✅ CLEANUP COMPLETE\n');
      return true;
    }

    console.log(`Found ${testTemplates.length} test template(s) to delete:`);
    testTemplates.forEach(t => console.log(`  - ${t.id}: ${t.template_name}`));

    // Delete test templates
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .eq('template_name', TEST_TEMPLATE_NAME);

    if (deleteError) {
      console.error('❌ Error deleting test templates:', deleteError.message);
      return false;
    }

    console.log(`\n✅ Successfully deleted ${testTemplates.length} test template(s)`);

    // Verify deletion
    const { count: remainingCount, error: countError } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true })
      .eq('template_name', TEST_TEMPLATE_NAME);

    if (countError) {
      console.error('❌ Error verifying cleanup:', countError.message);
      return false;
    }

    if (remainingCount === 0) {
      console.log('✅ Cleanup verified - no test records remain');
      console.log('\n✅ CLEANUP COMPLETE\n');
      return true;
    } else {
      console.error(`❌ Cleanup incomplete - ${remainingCount} test records still exist`);
      return false;
    }

  } catch (err) {
    console.error('❌ CLEANUP FAILED:', err.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2];

  console.log('═══════════════════════════════════════════════════');
  console.log('  Supabase Access Verification Test v2');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Service Role Key: ${serviceRoleKey ? '✅ Configured' : '❌ Missing'}`);
  console.log('═══════════════════════════════════════════════════');

  let result;

  switch (command) {
    case 'read':
      result = await testRead();
      break;
    case 'write':
      result = await testWrite();
      break;
    case 'edit':
      result = await testEdit();
      break;
    case 'cleanup':
      result = await testCleanup();
      break;
    default:
      console.error('\n❌ Invalid command');
      console.log('\nUsage:');
      console.log('  node supabase-access-test_v2.js read     - Test read operations');
      console.log('  node supabase-access-test_v2.js write    - Test write operations');
      console.log('  node supabase-access-test_v2.js edit     - Test edit operations');
      console.log('  node supabase-access-test_v2.js cleanup  - Remove test records\n');
      process.exit(1);
  }

  if (result) {
    console.log('═══════════════════════════════════════════════════');
    console.log('  ✅ TEST PASSED');
    console.log('═══════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.log('═══════════════════════════════════════════════════');
    console.log('  ❌ TEST FAILED');
    console.log('═══════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

// Run main function
main().catch(err => {
  console.error('\n❌ FATAL ERROR:', err.message);
  console.error('Stack trace:', err.stack);
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ⛔ HARD BLOCK - Cannot proceed');
  console.log('═══════════════════════════════════════════════════\n');
  process.exit(1);
});
