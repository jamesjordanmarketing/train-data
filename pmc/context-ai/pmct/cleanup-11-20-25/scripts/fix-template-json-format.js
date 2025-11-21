#!/usr/bin/env node

/**
 * Fix Template JSON Output Instructions
 * Updates the Shame → Acceptance template with strict JSON formatting rules
 */

const saol = require('../supa-agent-ops/dist/index.js');

// The template ID that's causing JSON parsing issues
const TEMPLATE_ID = 'c06809f4-a165-4e5a-a866-80997c152ea9';

// Strict JSON output instructions to append
const JSON_INSTRUCTIONS = `

================================================================================
CRITICAL OUTPUT FORMAT - READ CAREFULLY BEFORE RESPONDING
================================================================================

You MUST respond with ONLY valid, parseable JSON. No markdown, no code fences, no explanations.

REQUIRED JSON STRUCTURE:
{
  "title": "Brief conversation title (5-8 words)",
  "turns": [
    {"role": "user", "content": "message text here"},
    {"role": "assistant", "content": "response text here"}
  ]
}

MANDATORY JSON FORMATTING RULES:
1. Use ONLY double quotes (") for all property names and string values
2. Escape quotes inside content strings: \\" not "
3. Escape newlines inside content strings: \\n not actual line breaks
4. NO trailing commas after the last item in arrays or objects
5. NO comments (// or /* */)
6. Content must be ONE continuous string - use \\n for paragraph breaks

CORRECT EXAMPLE:
{
  "title": "Breaking the Lifestyle Debt Cycle",
  "turns": [
    {
      "role": "user",
      "content": "I'm drowning in credit card debt. I keep telling myself I'll stop spending, but then I justify just one more purchase. How do I break this cycle?"
    },
    {
      "role": "assistant",
      "content": "I hear the frustration in your words, and I want you to know: you're not alone in this struggle.\\n\\nMany people find themselves in exactly this pattern. Let me share three key insights:\\n\\n1. **Recognition is the first step** - You're already ahead by identifying the pattern\\n2. **Self-compassion matters** - Beating yourself up makes it harder to change\\n3. **Small wins build momentum** - You don't have to fix everything at once\\n\\nWhat specific situation tends to trigger these purchases for you?"
    }
  ]
}

WRONG EXAMPLES (DO NOT DO THIS):
❌ "content": "She said "I'm worried" about this"  // Unescaped quotes
❌ "content": "First line
    Second line"  // Actual newlines instead of \\n
❌ {"role": "user",}  // Trailing comma
❌ \`\`\`json
   { "title": "..." }
   \`\`\`  // Markdown code fences

Remember: Your entire response must be valid JSON that can be parsed by JSON.parse().
NO additional text, explanations, or formatting - ONLY the JSON object.

================================================================================
`;

async function main() {
  console.log('🔧 Fixing JSON format instructions in template...\n');

  // Step 1: Query current template
  console.log('📖 Step 1: Reading current template...');
  const queryResult = await saol.agentQuery({
    table: 'prompt_templates',
    where: [{ column: 'id', operator: 'eq', value: TEMPLATE_ID }],
    select: ['id', 'template_name', 'template_text', 'updated_at']
  });

  if (!queryResult.success || queryResult.data.length === 0) {
    console.error('❌ Error:', queryResult.summary);
    return;
  }

  const template = queryResult.data[0];
  console.log(`   Template: ${template.template_name}`);
  console.log(`   Current length: ${template.template_text.length} chars`);
  console.log(`   Last updated: ${template.updated_at}`);

  // Check if instructions already exist
  if (template.template_text.includes('CRITICAL OUTPUT FORMAT')) {
    console.log('\n⚠️  JSON instructions already exist in template!');
    console.log('   Skipping update to avoid duplication.');
    return;
  }

  // Step 2: Append JSON instructions
  console.log('\n✏️  Step 2: Appending strict JSON format instructions...');
  const updatedText = template.template_text + JSON_INSTRUCTIONS;
  console.log(`   New length: ${updatedText.length} chars (+${JSON_INSTRUCTIONS.length})`);

  // Step 3: Update template
  console.log('\n💾 Step 3: Updating template in database...');
  const updateResult = await saol.agentImportTool({
    source: [{
      id: TEMPLATE_ID,
      template_text: updatedText,
      updated_at: new Date().toISOString()
    }],
    table: 'prompt_templates',
    mode: 'upsert',
    onConflict: 'id'
  });

  if (!updateResult.success) {
    console.error('❌ Update failed:', updateResult.summary);
    if (updateResult.nextActions) {
      console.log('\n📋 Suggested actions:');
      updateResult.nextActions.forEach((action, i) => {
        console.log(`   ${i + 1}. ${action}`);
      });
    }
    return;
  }

  console.log('✅ Template updated successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Template ID: ${TEMPLATE_ID}`);
  console.log(`   Template: ${template.template_name}`);
  console.log(`   Added: ${JSON_INSTRUCTIONS.length} characters of JSON formatting instructions`);
  console.log(`   Total length: ${updatedText.length} characters`);
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Try generating a conversation again at /conversations/generate');
  console.log('   2. Claude should now return properly formatted JSON');
  console.log('   3. Monitor Vercel logs for any remaining parsing errors');
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
