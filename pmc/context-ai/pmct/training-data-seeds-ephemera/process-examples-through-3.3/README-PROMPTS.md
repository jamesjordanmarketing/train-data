# Chunk Alpha v3.3 - Prompt Files

## Quick Reference

**5 separate prompt files** have been extracted from `c-alpha-build-spec_v3.3.md` for easy copy-paste execution.

---

## Files Created

### Ready-to-Use Prompt Files

| # | File Name | What It Builds | Lines | Time |
|---|-----------|----------------|-------|------|
| **1** | [`c-alpha-build-spec_v3.3-prompt-1.md`](c-alpha-build-spec_v3.3-prompt-1.md) | Database Schema & Infrastructure | 441 | ~2 hrs |
| **2** | [`c-alpha-build-spec_v3.3-prompt-2.md`](c-alpha-build-spec_v3.3-prompt-2.md) | Chunk Extraction Engine | 554 | ~4 hrs |
| **3** | [`c-alpha-build-spec_v3.3-prompt-3.md`](c-alpha-build-spec_v3.3-prompt-3.md) | AI Dimension Generation | 468 | ~4 hrs |
| **4** | [`c-alpha-build-spec_v3.3-prompt-4.md`](c-alpha-build-spec_v3.3-prompt-4.md) | Chunk Dashboard & Spreadsheet | 657 | ~6 hrs |
| **5** | [`c-alpha-build-spec_v3.3-prompt-5.md`](c-alpha-build-spec_v3.3-prompt-5.md) | Run Management & Polish | 229 | ~4 hrs |

### Documentation Files

| File Name | Purpose |
|-----------|---------|
| [`c-alpha-build-spec_v3.3.md`](c-alpha-build-spec_v3.3.md) | Complete specification (source) |
| [`c-alpha-build-spec_v3.3-PROMPTS-GUIDE.md`](c-alpha-build-spec_v3.3-PROMPTS-GUIDE.md) | Detailed usage guide |
| [`README-PROMPTS.md`](README-PROMPTS.md) | This file (quick reference) |

---

## How to Use

### Simple 3-Step Process

1. **Open prompt file** (e.g., `c-alpha-build-spec_v3.3-prompt-1.md`)
2. **Select ALL content** (Ctrl+A / Cmd+A)
3. **Paste into Claude 4.5 Sonnet** in Cursor

Repeat for all 5 prompts in order.

### Execution Order

```
Prerequisites (SQL, API keys, npm install)
    ↓
Prompt #1 (Database) → Test completion criteria
    ↓
Prompt #2 (Extraction) → Test completion criteria
    ↓
Prompt #3 (AI Generation) → Test completion criteria
    ↓
Prompt #4 (Dashboard) → Test completion criteria
    ↓
Prompt #5 (Polish) → Final testing
    ↓
Done! ✅
```

---

## What Each Prompt Contains

### Prompt #1: Database Schema & Infrastructure
- TypeScript types for all entities
- Complete CRUD service layer
- "Chunks" button integration
- Test verification page

### Prompt #2: Chunk Extraction Engine
- AI-powered text analysis
- 4 chunk type identification
- Background job processing
- Progress tracking

### Prompt #3: AI Dimension Generation
- Claude 4.5 integration
- 5 prompt templates
- Batch processing
- Cost & performance tracking

### Prompt #4: Chunk Dashboard & Spreadsheet
- Wireframe-matching UI
- Three-section card layout
- Confidence-based display
- Full spreadsheet with views

### Prompt #5: Run Management & Polish
- Run comparison
- Regeneration
- Error handling
- Final polish

---

## Key Points

✅ **Each file is self-contained** - Just copy and paste the entire content  
✅ **No manual editing needed** - Files are ready to use as-is  
✅ **Execute in order** - Each builds on the previous  
✅ **Fresh context windows** - Use new chat for each prompt  
✅ **~20 hours total** - Spread across 5 prompts  

---

## Need Help?

📖 **Detailed Guide:** See [`c-alpha-build-spec_v3.3-PROMPTS-GUIDE.md`](c-alpha-build-spec_v3.3-PROMPTS-GUIDE.md)  
📋 **Full Spec:** See [`c-alpha-build-spec_v3.3.md`](c-alpha-build-spec_v3.3.md)  

---

## File Locations

All files are in:
```
pmc\context-ai\pmct\
```

Quick access:
- Prompt #1: `pmc\context-ai\pmct\c-alpha-build-spec_v3.3-prompt-1.md`
- Prompt #2: `pmc\context-ai\pmct\c-alpha-build-spec_v3.3-prompt-2.md`
- Prompt #3: `pmc\context-ai\pmct\c-alpha-build-spec_v3.3-prompt-3.md`
- Prompt #4: `pmc\context-ai\pmct\c-alpha-build-spec_v3.3-prompt-4.md`
- Prompt #5: `pmc\context-ai\pmct\c-alpha-build-spec_v3.3-prompt-5.md`

---

**Ready to build? Start with Prompt #1!** 🚀

