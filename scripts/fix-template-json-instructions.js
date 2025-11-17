#!/usr/bin/env node

/**
 * Fix Template JSON Output Instructions
 * 
 * Updates the template to include clearer JSON formatting instructions
 * to prevent Claude from generating malformed JSON.
 */

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in your environment or .env.local file');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('🔍 Checking template JSON instructions...\n');

  // Get the template that's causing issues
  const templateId = 'c06809f4-a165-4e5a-a866-80997c152ea9';
  
  const { data: template, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) {
    console.error('❌ Error fetching template:', error);
    return;
  }

  console.log(`Template: ${template.template_name}`);
  console.log(`Length: ${template.template_text.length} characters\n`);

  // Check if template has proper JSON instructions
  const hasJSONInstructions = template.template_text.includes('JSON') || 
                              template.template_text.includes('json');
  
  console.log(`Has JSON instructions: ${hasJSONInstructions ? '✅' : '❌'}`);

  // Show last 800 chars (where output instructions usually are)
  console.log('\n=== LAST 800 CHARACTERS (OUTPUT FORMAT SECTION) ===\n');
  console.log(template.template_text.slice(-800));
  console.log('\n=== END ===\n');

  // Suggest improvements
  console.log('\n💡 RECOMMENDED JSON OUTPUT INSTRUCTIONS:\n');
  console.log(`
CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanations, no code fences.

Your response must be a JSON object with this EXACT structure:
{
  "title": "Brief conversation title (5-8 words)",
  "turns": [
    {
      "role": "user",
      "content": "First user message here"
    },
    {
      "role": "assistant", 
      "content": "First assistant response here"
    }
  ]
}

IMPORTANT JSON RULES:
1. Use double quotes (") for all strings, never single quotes (')
2. Escape all quotes inside content: use \\" not "
3. Escape all newlines inside content: use \\n not actual newlines
4. No trailing commas after last items in arrays or objects
5. No comments (// or /* */)
6. Content must be a single string, not multiple lines

Example of properly escaped content:
"content": "I understand your concern.\\n\\nLet me explain: \\"financial planning\\" means..."
  `);

  console.log('\n❓ Would you like to update this template? (Manual update recommended)\n');
}

main().catch(console.error);
