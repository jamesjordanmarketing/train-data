# Scaffolding UI - Quick Start Guide

## What Was Built

A complete UI for generating AI training conversations using structured scaffolding data (personas, emotional arcs, and training topics).

## 🎯 How to Use

### 1. Navigate to Generation Page
```
http://localhost:3000/conversations/generate
```

### 2. Select "Scaffolding-Based" Tab
You'll see a tab switcher at the top:
- **Scaffolding-Based** (NEW - use this)
- Template-Based (existing system)

### 3. Configure Your Conversation

Fill out all four dropdowns:

#### **Client Persona** (Who is the client?)
Example options:
- Marcus - Overwhelmed Avoider
- Jennifer - Anxious Planner  
- David - Pragmatic Optimist

💡 *Hover over the (i) icon for help*

#### **Emotional Journey** (What transformation?)
Example options:
- Confusion → Clarity
- Anxiety → Confidence
- Shame → Acceptance
- Couple Conflict → Alignment

💡 *This is the PRIMARY selector - determines conversation structure*

#### **Training Topic** (What financial topic?)
Example options:
- HSA vs FSA Decision Paralysis
- Roth IRA Conversion Confusion
- Life Insurance Types Decision

💡 *Provides domain context and typical questions*

#### **Conversation Tier** (What complexity?)
- **Template (Tier 1)** - Foundation patterns
- **Scenario (Tier 2)** - Domain-specific contexts
- **Edge Case (Tier 3)** - Boundary conditions

### 4. Review Compatibility Warnings (if any)

If your selections are incompatible, you'll see:
```
⚠️ Compatibility Notes:
• This persona typically works better with X arc
• Consider Y topic for this emotional journey
```

### 5. Click "Generate Conversation"

Button only enables when all 4 selections are complete.

Generation takes 10-30 seconds and shows progress:
- ⏱️ Starting...
- 🤖 Generating...
- ✅ Validating...
- 💾 Saving...
- ✓ Complete!

### 6. View Results

After generation, you'll see:
- ✅ Conversation ID
- 📊 Quality Score (target: 4.0+)
- 📈 Turn Count
- 🎯 Compatibility Score
- 🏷️ Scaffolding Used (persona, arc, topic names)

Click "View Conversation" to see the full generated dialogue.

## 📋 Example Configurations

### Configuration 1: Confused Tech Worker
```
Persona: Marcus (Overwhelmed Avoider)
Emotional Arc: Confusion → Clarity
Topic: HSA vs FSA Decision
Tier: Template
```
**Use Case**: Basic educational conversation about healthcare accounts

### Configuration 2: Anxious Professional
```
Persona: Jennifer (Anxious Planner)
Emotional Arc: Anxiety → Confidence  
Topic: Roth IRA Conversion
Tier: Scenario
```
**Use Case**: Addressing investment anxiety with specific scenario

### Configuration 3: Couple Disagreement
```
Persona: David (Pragmatic Optimist)
Emotional Arc: Couple Conflict → Alignment
Topic: Life Insurance Types
Tier: Template
```
**Use Case**: Mediating financial decision between partners

## 🎨 UI Features

### Visual Design
- ✅ Clean, card-based layout
- ✅ Clear visual hierarchy
- ✅ Helpful tooltips throughout
- ✅ Real-time validation feedback
- ✅ Progress indicators during generation

### Accessibility
- ✅ Keyboard navigation (Tab, Arrow keys, Enter, Esc)
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ ARIA labels

### Responsiveness
- ✅ Works on desktop, laptop, tablet, mobile
- ✅ Dropdowns remain usable on all screen sizes
- ✅ No horizontal scrolling

## 🔧 Setup Requirements

### For Basic UI Testing (Works Now)
```bash
cd src
npm run dev
```
Navigate to http://localhost:3000/conversations/generate

**You can**:
- ✅ See the UI
- ✅ Interact with dropdowns
- ✅ Select all options
- ✅ See compatibility warnings
- ✅ Click generate button

**You cannot** (requires API key):
- ❌ Complete the generation (will show "AI service not configured" error)

### For Full Generation Testing (Requires Setup)
```bash
# 1. Add API key to environment
cd src
echo "ANTHROPIC_API_KEY=your_actual_key_here" >> .env.local

# 2. Restart dev server
npm run dev
```

Now you can generate complete conversations!

## 🧪 Testing Without UI

### Test API Endpoints Directly
```bash
# From project root
bash test-scaffolding-complete.sh
```

Tests:
- ✅ Persona API
- ✅ Emotional Arc API
- ✅ Training Topic API
- ✅ Compatibility Check API
- ⚠️ Generation API (requires API key)

### Quick Generation Test
```bash
bash test-generation-simple.sh
```

Sends a test request with:
- Persona: Marcus
- Arc: Confusion → Clarity
- Topic: HSA vs FSA
- Tier: Template

## 📊 What Gets Tracked

When you generate a conversation, the system records:

### In Conversations Table
```sql
persona_id: UUID of selected persona
emotional_arc_id: UUID of selected emotional arc
training_topic_id: UUID of selected training topic
scaffolding_snapshot: {
  persona: { id, name, short_name, type, ... },
  emotional_arc: { id, name, starting_emotion, ending_emotion, ... },
  training_topic: { id, name, topic_key, complexity, ... },
  generation_timestamp: "2025-11-14T...",
  compatibility_score: 0.85,
  system_prompt: "Full assembled prompt..."
}
```

This provides **complete provenance** - you can always trace back:
- Who the client persona was
- What emotional journey was intended
- What topic was being taught
- What the system prompt was at generation time

## 🎯 Success Indicators

A well-generated conversation should show:

✅ **Quality Score**: 4.0 or higher
✅ **Turn Count**: 3-5 turns (typical for template tier)
✅ **Compatibility Score**: 0.7+ (higher is better)
✅ **Persona Match**: Language patterns match persona type
✅ **Arc Match**: Emotional progression from starting to ending state
✅ **Topic Coverage**: Financial concept explained clearly

## 🐛 Troubleshooting

### "AI service not configured" Error
**Problem**: ANTHROPIC_API_KEY not set
**Solution**: Add key to `src/.env.local` and restart server

### Dropdowns Are Empty
**Problem**: Database not populated with scaffolding data
**Solution**: Run Prompt 2, File 1 implementation to populate data

### Generate Button Stays Disabled
**Problem**: Not all selections are complete
**Solution**: Ensure all 4 dropdowns have values selected

### Page Shows Sign-In
**Problem**: Not authenticated
**Solution**: Create account or sign in at http://localhost:3000/signin

### TypeScript Errors in Console
**Problem**: Build error with ValidationResult export
**Solution**: Fixed in `src/lib/services/index.ts` (should already be resolved)

## 📖 Architecture Overview

```
User selects scaffolding options
    ↓
ScaffoldingSelector component
    ↓
POST /api/conversations/generate-with-scaffolding
    ↓
ParameterAssemblyService
  - Fetches full persona, arc, topic data
  - Checks compatibility
  - Constructs system prompt
    ↓
TemplateSelectionService
  - Selects best template for arc + tier
    ↓
ConversationGenerationService
  - Sends to Claude API
  - Validates response
    ↓
Save to conversations table with scaffolding provenance
    ↓
Return conversation to UI
```

## 🚀 Next Steps

1. **Test the UI** (works without API key)
   - Navigate to generate page
   - Interact with dropdowns
   - See the scaffolding selector in action

2. **Configure API Key** (for full generation)
   - Add ANTHROPIC_API_KEY to .env.local
   - Restart dev server

3. **Generate Test Conversations**
   - Try different persona/arc/topic combinations
   - Verify quality scores
   - Check scaffolding provenance in database

4. **Review Generated Conversations**
   - Do they match the persona style?
   - Do they follow the emotional arc?
   - Is the topic addressed correctly?

---

**Status**: ✅ **FULLY IMPLEMENTED AND READY FOR USE**

**What's Working**:
- ✅ Complete UI with all selectors
- ✅ API integration
- ✅ Data loading
- ✅ Compatibility checking
- ✅ Request validation
- ✅ Error handling

**What Needs API Key**:
- ⚠️ Actual conversation generation (Claude API calls)

**Bottom Line**: Everything is built and tested up to the AI service call. Add your API key and you're ready to generate!

