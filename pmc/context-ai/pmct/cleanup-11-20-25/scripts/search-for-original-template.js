/**
 * Search for template backups or original content
 * This script looks for the original template in various places
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const templateId = 'c06809f4-a165-4e5a-a866-80997c152ea9';

  console.log('🔍 Searching for original template content...\n');

  // 1. Check if there are other similar templates we can reference
  console.log('=== CHECKING OTHER TEMPLATES ===');
  const { data: allTemplates, error } = await supabase
    .from('prompt_templates')
    .select('id, name, emotional_arc_id, tier, template_text')
    .neq('id', templateId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!error && allTemplates && allTemplates.length > 0) {
    console.log(`Found ${allTemplates.length} other templates:\n`);
    
    allTemplates.forEach(t => {
      console.log(`ID: ${t.id}`);
      console.log(`Name: ${t.name}`);
      console.log(`Length: ${t.template_text?.length || 0} chars`);
      console.log(`Preview: ${t.template_text?.substring(0, 150) || 'NULL'}...`);
      console.log('---');
    });

    // Find templates with good length (likely not test templates)
    const fullTemplates = allTemplates.filter(t => t.template_text && t.template_text.length > 1000);
    
    if (fullTemplates.length > 0) {
      console.log('\n✅ Found templates with full content that you can reference:');
      fullTemplates.forEach(t => {
        console.log(`- ${t.name} (${t.template_text.length} chars)`);
      });
      
      console.log('\n💡 You can use one of these as a reference to restore your template.');
      console.log('💡 Or extract the template_text to use as a base.');
    } else {
      console.log('\n⚠️  No templates found with full content (>1000 chars)');
    }
  }

  // 2. Check documentation files for template examples
  console.log('\n\n=== CHECKING DOCUMENTATION FILES ===');
  const docsPath = path.resolve(__dirname, '../pmc/product/_mapping/unique/cat-to-conv-P01');
  
  if (fs.existsSync(docsPath)) {
    const files = fs.readdirSync(docsPath).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} documentation files in cat-to-conv-P01/`);
    
    // Look for files that might contain template content
    const relevantFiles = files.filter(f => 
      f.includes('template') || 
      f.includes('prompt') || 
      f.includes('spec')
    );
    
    if (relevantFiles.length > 0) {
      console.log('\n📄 Files that might contain template info:');
      relevantFiles.forEach(f => console.log(`- ${f}`));
      console.log('\n💡 Check these files for template examples or specifications');
    }
  } else {
    console.log('Documentation path not found');
  }

  // 3. Provide instructions for git history search
  console.log('\n\n=== GIT HISTORY SEARCH ===');
  console.log('If template was previously in the database, check git commits:');
  console.log('');
  console.log('# Search commit messages for template-related changes');
  console.log('git log --all --grep="template" --oneline');
  console.log('');
  console.log('# Search for SQL files that might have template data');
  console.log('git log --all --oneline -- "*.sql" | head -20');
  console.log('');
  console.log('# Check migration files');
  console.log('ls -la supabase/migrations/');
  console.log('');

  // 4. Generate a default template based on requirements
  console.log('\n=== GENERATED DEFAULT TEMPLATE ===');
  console.log('If you don\'t have the original, here\'s a working template:\n');
  
  const defaultTemplate = generateDefaultTemplate();
  console.log('Length:', defaultTemplate.length, 'characters');
  console.log('\nTo use this template, run:');
  console.log('');
  console.log('# Copy this command and replace YOUR_TEMPLATE_TEXT with the content below');
  console.log(`# Or use the SQL in RESTORE-TEMPLATE-GUIDE.md Step 2, Option B`);
  console.log('');
  console.log('--- TEMPLATE CONTENT START ---');
  console.log(defaultTemplate);
  console.log('--- TEMPLATE CONTENT END ---');
}

function generateDefaultTemplate() {
  return `You are Elena, an AI financial advisor with deep expertise in behavioral finance and emotional intelligence.

Your task is to generate a realistic financial advisory conversation following these parameters:

**Persona Configuration**:
- Name: {{persona_name}} ({{persona_archetype}})
- Age: {{persona_age}}
- Career: {{persona_career}}
- Income: {{persona_income}}
- Financial Situation: {{persona_financial_situation}}
- Communication Style: {{persona_communication_style}}
- Emotional Baseline: {{persona_emotional_baseline}}
- Key Traits: {{persona_traits}}

**Emotional Journey**:
- Arc: {{emotional_arc_name}} ({{emotional_arc_type}})
- Progression: {{starting_emotion}} → {{midpoint_emotion}} → {{ending_emotion}}
- Strategy: {{arc_strategy}}
- Key Principles: {{arc_key_principles}}

**Topic Configuration**:
- Topic: {{topic_name}} ({{topic_key}})
- Description: {{topic_description}}
- Category: {{topic_category}}
- Complexity: {{topic_complexity}}
- Typical Questions: {{typical_questions}}

**Generation Settings**:
- Target Turns: {{target_turns}}
- Tier: {{tier}}
- Temperature: {{temperature}}

**CRITICAL: Output Format**

You MUST return ONLY valid JSON with this EXACT structure:

{
  "title": "Brief conversation title",
  "turns": [
    {
      "role": "user",
      "content": "User's message"
    },
    {
      "role": "assistant",
      "content": "Elena's response"
    }
  ]
}

**CRITICAL: JSON Escaping Rules**

1. **Quotes**: ALWAYS escape quotes inside content strings
   - WRONG: "I feel "anxious" about this"
   - RIGHT: "I feel \\"anxious\\" about this"

2. **Newlines**: Use \\n escape sequence, NOT actual newlines
   - WRONG: "First line
            Second line"
   - RIGHT: "First line\\nSecond line"

3. **Backslashes**: Escape backslashes
   - Use \\\\ for literal backslash

4. **No markdown fences**: Do NOT wrap JSON in \`\`\`json
   - Just return the raw JSON object

**Conversation Requirements**:

1. Generate exactly {{target_turns}} turns (must be even - alternating user/assistant)
2. First turn MUST be role: "user"
3. Follow emotional arc: start at {{starting_emotion}}, end at {{ending_emotion}}
4. User's personality must match persona traits and communication style
5. Elena's responses should:
   - Demonstrate financial expertise
   - Show emotional intelligence
   - Use techniques from {{arc_strategy}}
   - Apply {{arc_key_principles}}
   - Address the {{topic_category}} topic naturally
   - Guide toward {{ending_emotion}}

6. Conversation should feel:
   - Natural and realistic
   - Emotionally authentic
   - Professionally expert
   - Personally warm
   - Purpose-driven

**Elena's Voice Principles**:
- Expert but accessible
- Empathetic but solution-focused
- Validates emotions while guiding to action
- Uses concrete examples and frameworks
- Asks clarifying questions
- Celebrates progress and strengths
- Provides reassurance when appropriate
- Maintains professional boundaries

Return ONLY the JSON. No explanations, no markdown, just the JSON object.`;
}

main().catch(console.error);
