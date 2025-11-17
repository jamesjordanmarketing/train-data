/**
 * Check the current content of the template that we modified for testing
 * This will show us what needs to be restored
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const templateId = 'c06809f4-a165-4e5a-a866-80997c152ea9';

  console.log('📋 Checking template content...\n');

  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) {
    console.error('❌ Error fetching template:', error);
    return;
  }

  console.log('=== TEMPLATE INFO ===');
  console.log('ID:', data.id);
  console.log('Name:', data.name || data.title || 'N/A');
  console.log('\n=== TEMPLATE_TEXT ===');
  console.log('Length:', data.template_text?.length || 0, 'characters');
  console.log('Content preview (first 200 chars):');
  console.log(data.template_text?.substring(0, 200) || 'NULL');
  console.log('\n=== STRUCTURE ===');
  console.log('Length:', data.structure?.length || 0, 'characters');
  console.log('Content preview:');
  console.log(data.structure?.substring(0, 200) || 'NULL');
  console.log('\n=== VARIABLES ===');
  console.log('Type:', typeof data.variables);
  console.log('Content:', JSON.stringify(data.variables, null, 2));

  // Diagnostic
  console.log('\n\n=== DIAGNOSTIC ===');
  if (data.template_text?.length === 68) {
    console.log('⚠️  Template is currently the TEST version ("Return ONLY this exact JSON...")');
    console.log('✅ This confirms the diagnostic test worked!');
    console.log('📝 You need to restore the original template content');
  } else if (data.template_text?.length > 1000) {
    console.log('✅ Template appears to have full content');
    console.log('📝 Template is ready for conversation generation');
  } else {
    console.log('⚠️  Template length is unusual:', data.template_text?.length);
    console.log('📝 Please verify the template content is correct');
  }
}

main().catch(console.error);
