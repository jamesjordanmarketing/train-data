# Quick Start: Generate a New Conversation

**Goal:** Generate a new AI-powered training conversation in under 5 minutes

---

## Fastest Method: Interactive Script

### Step 1: Run the Script

```bash
cd "C:\Users\james\Master\BrightHub\BRun\train-data"
node src/scripts/generate-conversation-easy.js
```

### Step 2: Follow the Prompts

The script will:
1. Show you all available templates
2. Ask you to choose one
3. Ask for conversation parameters:
   - **Persona** (e.g., "Sales Manager")
   - **Emotion** (e.g., "Frustrated")
   - **Topic** (e.g., "Contract Renewal")
   - **Temperature** (optional, press Enter for 0.7)
4. Generate the conversation (takes 15-60 seconds)
5. Show you the results

### Step 3: View Your Conversation

Open: https://train-data-three.vercel.app/conversations
- Sort by "Updated" (most recent first)
- Your new conversation will be at the top

---

## Example Session

```
═══════════════════════════════════════════════════════════════════════════════
  Easy Conversation Generator
═══════════════════════════════════════════════════════════════════════════════

📋 Fetching available templates...

Available Templates:
═══════════════════════════════════════════════════════════════════════════════
1. Financial Planning Triumph
   ID: abc-123-def-456
   Tier: template
   Description: Template for triumph emotional arc

2. Customer Success Scenario
   ID: xyz-789-uvw-012
   Tier: scenario
   Description: Customer success interaction patterns

═══════════════════════════════════════════════════════════════════════════════

Enter template number (or "q" to quit): 1

✅ Selected: Financial Planning Triumph

Enter conversation parameters:

Persona (e.g., "Sales Manager"): Account Executive
Emotion (e.g., "Frustrated"): Determined
Topic (e.g., "Contract Renewal"): Closing Q4 Deal
Temperature (0-1, press Enter for 0.7): [Enter]

🚀 Generating conversation...

Parameters:
  Template: abc-123-def-456
  Persona: Account Executive
  Emotion: Determined
  Topic: Closing Q4 Deal
  Temperature: 0.7

This will take 15-60 seconds...

═══════════════════════════════════════════════════════════════════════════════
  ✅ SUCCESS!
═══════════════════════════════════════════════════════════════════════════════

Conversation Details:
  ID: new-conv-uuid-here
  Title: Account Executive - Closing Q4 Deal
  Turns: 12
  Tokens: 2847
  Quality Score: 8.5/10
  Status: generated
  Cost: $0.0234

📊 View in dashboard:
  https://train-data-three.vercel.app/conversations

💡 Tip: Sort by "Updated" to see your new conversation at the top!

═══════════════════════════════════════════════════════════════════════════════
```

---

## Alternative: Browser Console Method

1. Open: https://train-data-three.vercel.app/conversations
2. Press **F12** (Developer Tools)
3. Go to **Console** tab
4. **Get template ID:**

```javascript
fetch('/api/templates').then(r => r.json()).then(t => {
  console.table(t.map(x => ({id: x.id, name: x.template_name})));
  window.tid = t[0].id; // Save first template
});
```

5. **Generate conversation** (replace values):

```javascript
fetch('/api/conversations/generate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    templateId: window.tid,
    parameters: {
      persona: 'Sales Rep',
      emotion: 'Excited',
      topic: 'Product Demo'
    },
    tier: 'template'
  })
}).then(r => r.json()).then(result => {
  console.log('✅ Success!', result.conversation.id);
  setTimeout(() => location.reload(), 2000); // Refresh to see it
});
```

6. **Wait 15-60 seconds** for generation
7. Page will refresh automatically
8. Your conversation appears in the table

---

## Parameter Ideas

### Personas
- "Sales Development Rep"
- "Account Executive"
- "Customer Success Manager"
- "Account Manager"
- "Sales Manager"
- "VP of Sales"

### Emotions
- "Excited"
- "Frustrated"
- "Determined"
- "Optimistic"
- "Concerned"
- "Confident"
- "Curious"
- "Overwhelmed"

### Topics
- "Product Demo"
- "Contract Renewal"
- "Pricing Discussion"
- "Feature Request"
- "Support Escalation"
- "Implementation Timeline"
- "Upsell Opportunity"
- "Cold Outreach"
- "Discovery Call"
- "Closing Deal"

---

## What Happens During Generation?

1. **Template Resolution** - Your parameters fill the template placeholders
2. **Claude API Call** - Prompt sent to Claude API (15-60 seconds)
3. **Response Parsing** - Conversation turns extracted
4. **Quality Scoring** - Automatic 0-10 quality score
5. **Database Save** - Conversation and turns saved to Supabase
6. **Auto-Flag** - If quality < 6, flagged for review

---

## Viewing Results

**Dashboard:** https://train-data-three.vercel.app/conversations

**What you'll see:**
- Conversation title: `{Persona} - {Topic}`
- Quality score (0-10 scale)
- Status badge (generated/needs_revision)
- Turn count
- Token count
- Timestamps

**Click to view:**
- Full conversation (turn by turn)
- Metadata panel
- Review actions (approve/reject)
- Export options

---

## Troubleshooting

**Script won't run:**
- Make sure you're in the correct directory
- Check Node.js is installed: `node --version`

**"No templates found":**
- Check database has templates
- Run: `node src/scripts/cursor-db-helper.js query templates`

**Generation fails:**
- Check ANTHROPIC_API_KEY in `.env.local`
- Verify API key is valid
- Check network connection

**Can't find conversation:**
- Refresh dashboard page
- Clear filters
- Sort by "Updated" column
- Check console for errors

---

## Full Documentation

For complete details, see:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\current-training-tutorial-alpha_v1.0.md`

---

**Happy Generating! 🚀**
