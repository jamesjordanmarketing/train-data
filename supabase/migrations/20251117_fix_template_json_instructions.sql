-- Fix Template JSON Output Instructions
-- Bug Fix #7: Add strict JSON formatting instructions to prevent Claude from generating malformed JSON
-- Date: 2025-11-17
-- Issue: Claude returning JSON with unescaped quotes, newlines, causing parse errors at position 8698

-- Target template: Shame → Acceptance (c06809f4-a165-4e5a-a866-80997c152ea9)
-- This template is experiencing JSON parsing failures in production

UPDATE prompt_templates
SET 
  template_text = template_text || E'\n\n' || 
'================================================================================
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
      "content": "I''m drowning in credit card debt. I keep telling myself I''ll stop spending, but then I justify just one more purchase. How do I break this cycle?"
    },
    {
      "role": "assistant",
      "content": "I hear the frustration in your words, and I want you to know: you''re not alone in this struggle.\\n\\nMany people find themselves in exactly this pattern. Let me share three key insights:\\n\\n1. **Recognition is the first step** - You''re already ahead by identifying the pattern\\n2. **Self-compassion matters** - Beating yourself up makes it harder to change\\n3. **Small wins build momentum** - You don''t have to fix everything at once\\n\\nWhat specific situation tends to trigger these purchases for you?"
    }
  ]
}

WRONG EXAMPLES (DO NOT DO THIS):
❌ "content": "She said "I''m worried" about this"  // Unescaped quotes
❌ "content": "First line
    Second line"  // Actual newlines instead of \\n
❌ {"role": "user",}  // Trailing comma
❌ ```json
   { "title": "..." }
   ```  // Markdown code fences

Remember: Your entire response must be valid JSON that can be parsed by JSON.parse().
NO additional text, explanations, or formatting - ONLY the JSON object.

================================================================================',
  updated_at = NOW()
WHERE id = 'c06809f4-a165-4e5a-a866-80997c152ea9'
  AND NOT template_text LIKE '%CRITICAL OUTPUT FORMAT%'; -- Prevent duplicate updates

-- Verify the update
SELECT 
  id,
  template_name,
  LENGTH(template_text) as text_length,
  updated_at,
  CASE 
    WHEN template_text LIKE '%CRITICAL OUTPUT FORMAT%' THEN '✅ JSON instructions added'
    ELSE '❌ Update may have failed'
  END as status
FROM prompt_templates
WHERE id = 'c06809f4-a165-4e5a-a866-80997c152ea9';
