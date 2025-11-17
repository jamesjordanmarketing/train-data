# Template Restoration & Testing Guide
**Date:** 2025-11-17
**Status:** Ready for Execution

---

## Current Situation

✅ **Diagnostic Test Completed Successfully**
- Simple JSON `{"status": "YES"}` parsed correctly
- Parser is working fine
- Problem confirmed: Complex JSON from full template has escaping issues

✅ **Robust JSON Parser Implemented**
- Multi-stage repair pipeline added
- Handles unescaped quotes, newlines, trailing commas
- Enhanced logging for debugging

⚠️ **Template Needs Restoration**
- Template `c06809f4-a165-4e5a-a866-80997c152ea9` is currently set to test prompt
- Current: `"Return ONLY this exact JSON with no modifications: {"status": "YES"}"`
- Need: Full 5,893 character prompt with conversation generation instructions

---

## Step 1: Check Current Template Status

```bash
cd c:/Users/james/Master/BrightHub/BRun/train-data
node scripts/check-template-content.js
```

**Expected Output:**
```
⚠️  Template is currently the TEST version
✅ This confirms the diagnostic test worked!
📝 You need to restore the original template content
```

---

## Step 2: Restore Original Template

You have **two options**:

### Option A: Restore from Backup (If You Have One)

If you have a backup of the original template text, use Supabase SQL editor:

```sql
-- Replace ORIGINAL_TEMPLATE_HERE with your backed-up template text
UPDATE prompt_templates
SET template_text = 'ORIGINAL_TEMPLATE_HERE'
WHERE id = 'c06809f4-a165-4e5a-a866-80997c152ea9';
```

### Option B: Use Standard Template Structure

If you don't have a backup, here's the template structure that should work:

```sql
UPDATE prompt_templates
SET template_text = 'You are Elena, an AI financial advisor with deep expertise in behavioral finance and emotional intelligence.

Your task is to generate a realistic financial advisory conversation following these parameters:

**Persona**: {{persona_name}} ({{persona_archetype}})
- Age: {{persona_age}}
- Career: {{persona_career}}
- Income: {{persona_income}}
- Financial Situation: {{persona_financial_situation}}
- Communication Style: {{persona_communication_style}}
- Emotional Baseline: {{persona_emotional_baseline}}
- Key Traits: {{persona_traits}}

**Emotional Journey**: {{emotional_arc_name}} ({{starting_emotion}} → {{ending_emotion}})
- Arc Type: {{emotional_arc_type}}
- Strategy: {{arc_strategy}}
- Key Principles: {{arc_key_principles}}

**Topic**: {{topic_name}}
- Category: {{topic_category}}
- Complexity: {{topic_complexity}}
- Key Questions: {{typical_questions}}
- Description: {{topic_description}}

**Generation Parameters**:
- Target Turns: {{target_turns}}
- Tier: {{tier}}

**CRITICAL OUTPUT REQUIREMENTS**:
1. Return VALID JSON ONLY (no markdown, no explanations)
2. Use this EXACT structure:
{
  "title": "Conversation title here",
  "turns": [
    {
      "role": "user",
      "content": "User message here"
    },
    {
      "role": "assistant", 
      "content": "Elena response here"
    }
  ]
}

3. ESCAPING RULES (CRITICAL):
   - Escape ALL quotes inside content: Use \" not "
   - Example WRONG: "I feel "anxious" about this"
   - Example RIGHT: "I feel \"anxious\" about this"
   - NO actual newlines in strings - use \\n instead
   - Escape backslashes: use \\\\ for literal backslash

4. Generate exactly {{target_turns}} turns (must be even number - alternating user/assistant)
5. First turn MUST be role: "user"
6. Follow the emotional arc from {{starting_emotion}} to {{ending_emotion}}
7. Stay true to the persona''s communication style and traits
8. Address the topic naturally and realistically

**Quality Standards**:
- Natural, realistic dialogue
- Emotional progression feels authentic
- Elena demonstrates deep financial and emotional expertise
- User''s personality and concerns are evident
- Conversation has clear purpose and resolution

Return ONLY the JSON object. No markdown fences, no explanations, just the raw JSON.'
WHERE id = 'c06809f4-a165-4e5a-a866-80997c152ea9';
```

---

## Step 3: Verify Template Restoration

```bash
node scripts/check-template-content.js
```

**Expected Output:**
```
✅ Template appears to have full content
📝 Template is ready for conversation generation
```

---

## Step 4: Test Conversation Generation

Now test with the restored template and enhanced parser:

### Via API (Recommended)

```bash
# Make sure dev server is running
cd c:/Users/james/Master/BrightHub/BRun/train-data/src
npm run dev

# In another terminal, test generation
curl -X POST http://localhost:3000/api/conversations/generate-with-scaffolding \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "persona_id": "YOUR_PERSONA_UUID",
    "emotional_arc_id": "YOUR_ARC_UUID",
    "training_topic_id": "YOUR_TOPIC_UUID",
    "tier": "template"
  }'
```

### Via Dashboard

1. Navigate to generation UI (if you have one)
2. Select persona, emotional arc, training topic, tier
3. Click "Generate Conversation"
4. Watch logs for parser output

---

## Step 5: Monitor Logs

Watch for these key log messages:

### ✅ Success Indicators
```
[parseClaudeResponse] Original content length: XXXX chars
[parseClaudeResponse] Applying JSON repair pipeline
[parseClaudeResponse] Attempting JSON.parse...
[parseClaudeResponse] ✓ JSON parsed successfully
[parseClaudeResponse] ✓ Valid structure with X turns
```

### ⚠️ Repair Activity (Good - means parser is fixing issues)
```
[repairQuoteEscaping] Repairing unescaped quotes
[repairNewlineEscaping] Repairing newline escaping
```

### ❌ Still Failing (Need to investigate)
```
Error parsing Claude response: SyntaxError...
[parseClaudeResponse] ✗ Missing turns array
```

---

## Troubleshooting

### Issue: "Missing turns array" error

**Check:**
1. Did template restore correctly? Run `check-template-content.js`
2. Is Claude returning empty or malformed response?
3. Check Vercel logs for actual Claude API response content

**Fix:**
- Ensure template has JSON output instructions
- Check Claude API key is valid
- Review template placeholders match parameter keys

### Issue: Still getting JSON parse errors

**Check Parser Logs:**
Look for the JSON error context in logs:
```
JSON error context (position XXXX):
...snippet of JSON around error...
```

**Possible Issues:**
1. **Nested quotes still failing**: May need more sophisticated escaping
2. **Control characters**: Template may have invalid characters
3. **JSON structure too complex**: May need to simplify template

**Advanced Fix:**
If parser still fails, we can implement fallback with `jsonrepair` library:

```bash
cd src
npm install jsonrepair
```

Then update parser to use library as last resort.

---

## Success Criteria

After template restoration and testing:

- ✅ Template content restored (5000+ characters)
- ✅ Conversation generation completes without errors
- ✅ Parser successfully repairs JSON (or JSON is valid from start)
- ✅ Response has valid `turns` array
- ✅ Conversation stored to database
- ✅ Conversation appears in dashboard

---

## What We Learned from Diagnostic Test

1. ✅ **Parser works perfectly with simple JSON**
2. ✅ **Template resolution working correctly**
3. ✅ **Claude API communication successful**
4. ✅ **Logging and error handling functional**
5. ⚠️ **Issue is with complex JSON from full prompts**

**Root Cause:** Claude returns valid JSON structure but with syntax errors (unescaped quotes/newlines)

**Solution Implemented:** Multi-stage JSON repair pipeline that fixes common issues before parsing

---

## Next Steps After Success

Once generation is working:

1. **Test with multiple parameter combinations**
2. **Monitor success rate (target: >95%)**
3. **Deploy to production**
4. **Update documentation with findings**
5. **Consider adding parser metrics/monitoring**

---

## Need Help?

If generation still fails after restoration:

1. Share the full error log (including Claude response snippet)
2. Run `node scripts/check-template-content.js` and share output
3. Check if template has all required placeholders
4. Verify environment variables are set correctly

---

**Status:** 🎯 Ready to restore template and test
**Confidence:** HIGH - Diagnostic test proved parser works
**Estimated Time:** 10-15 minutes for restoration + testing
