-- Fix Template JSON Output Instructions - STRONGER VERSION
-- Bug Fix #7b: Add even more explicit JSON formatting instructions
-- Date: 2025-11-17
-- Issue: Claude still generating unterminated strings at position 8580
-- Example error: not escaping quotes in phrases like "left out" or "left behind"

-- This updates the SAME template with STRONGER instructions
UPDATE prompt_templates
SET 
  template_text = REPLACE(
    template_text,
    'Remember: Your entire response must be valid JSON that can be parsed by JSON.parse().
NO additional text, explanations, or formatting - ONLY the JSON object.

================================================================================',
    'Remember: Your entire response must be valid JSON that can be parsed by JSON.parse().
NO additional text, explanations, or formatting - ONLY the JSON object.

⚠️ CRITICAL - COMMON MISTAKE TO AVOID:
If you write phrases in quotes like "left out" or "I''m worried" inside content,
you MUST escape the inner quotes with backslash:

WRONG: "content": "I feel "left out" when friends spend money"
RIGHT: "content": "I feel \\"left out\\" when friends spend money"

WRONG: "content": "She said "I''m anxious" about this"  
RIGHT: "content": "She said \\"I''m anxious\\" about this"

Every single quote character (") inside a content string MUST be preceded by backslash (\\).
This includes: "left out", "left behind", "I''m", "can''t", "won''t", etc.

If you fail to escape quotes, the JSON will be invalid and parsing will fail.

================================================================================'
  ),
  updated_at = NOW()
WHERE id = 'c06809f4-a165-4e5a-a866-80997c152ea9'
  AND template_text LIKE '%CRITICAL OUTPUT FORMAT%'; -- Only if first update was applied

-- Verify the update
SELECT 
  id,
  template_name,
  LENGTH(template_text) as text_length,
  updated_at,
  CASE 
    WHEN template_text LIKE '%COMMON MISTAKE TO AVOID%' THEN '✅ Stronger instructions added'
    ELSE '⚠️ Update may not have applied'
  END as status
FROM prompt_templates
WHERE id = 'c06809f4-a165-4e5a-a866-80997c152ea9';
