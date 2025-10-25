# Chunk Alpha Build Prompts - Usage Guide

**Source:** `c-alpha-build-spec_v3.3.md`  
**Created:** October 6, 2025

## Overview

The complete build specification has been extracted into **5 separate prompt files**. Each file contains ONLY the content you need to copy into a Claude 4.5 Sonnet chat window (200k context).

---

## The 5 Prompt Files

### 📄 Prompt #1: Database Schema & Infrastructure
**File:** `c-alpha-build-spec_v3.3-prompt-1.md`  
**Lines:** 441 lines  
**Estimated Time:** ~2 hours

**What This Builds:**
- TypeScript type definitions for all chunk entities
- Complete database service layer (CRUD operations)
- Integration with existing document dashboard
- "Chunks" button on document selector
- Test page to verify database connectivity

**Key Deliverables:**
- `src/types/chunks.ts` - All type definitions
- `src/lib/chunk-service.ts` - Database services
- Updated `DocumentSelectorServer.tsx` - With "Chunks" button
- `src/app/test-chunks/page.tsx` - Verification page

**Completion Criteria:**
✅ All TypeScript types defined  
✅ All database services created  
✅ Services successfully query Supabase  
✅ "Chunks" button appears on dashboard  
✅ Test page confirms database connectivity

---

### 📄 Prompt #2: Chunk Extraction Engine
**File:** `c-alpha-build-spec_v3.3-prompt-2.md`  
**Lines:** 554 lines  
**Estimated Time:** ~4 hours

**What This Builds:**
- AI-powered chunk identification system
- Text analysis utilities (token counting, structure detection)
- Extraction logic for 4 chunk types (Chapter, Instructional, CER, Example)
- Background job processing with progress tracking
- API endpoint for extraction

**Key Deliverables:**
- `src/lib/chunk-extraction/types.ts` - Extraction types
- `src/lib/chunk-extraction/text-analyzer.ts` - Text analysis
- `src/lib/chunk-extraction/ai-chunker.ts` - AI extraction logic
- `src/lib/chunk-extraction/extractor.ts` - Main orchestrator
- `src/app/api/chunks/extract/route.ts` - API endpoint

**Completion Criteria:**
✅ AI-powered chunk extraction working  
✅ 4 chunk types properly identified  
✅ Extraction limits enforced (15/5/10/5)  
✅ Chunks stored in database  
✅ "Chunks" button functional  
✅ Progress tracking visible to user

---

### 📄 Prompt #3: AI Dimension Generation
**File:** `c-alpha-build-spec_v3.3-prompt-3.md`  
**Lines:** 468 lines  
**Estimated Time:** ~4 hours

**What This Builds:**
- Dimension generation engine using Claude 4.5
- 5 prompt templates for different dimension types
- Batch processing (3 chunks at a time)
- Cost tracking and performance monitoring
- Confidence score calculation methodology

**Key Deliverables:**
- `src/lib/dimension-generation/generator.ts` - Main generator
- `src/app/api/chunks/generate-dimensions/route.ts` - API endpoint
- Automatic dimension generation after extraction
- Run tracking with metrics (cost, duration, confidence)

**Completion Criteria:**
✅ AI dimension generation working  
✅ All 5 prompt templates executing  
✅ Dimensions saved to database  
✅ Run tracking functional  
✅ Cost and timing captured  
✅ Error handling robust

---

### 📄 Prompt #4: Chunk Dashboard & Spreadsheet Interface
**File:** `c-alpha-build-spec_v3.3-prompt-4.md`  
**Lines:** 657 lines  
**Estimated Time:** ~6 hours

**What This Builds:**
- Main chunk dashboard with wireframe design
- Three-section card layout for each chunk
- "Things We Know" / "Things We Need to Know" sections
- Full spreadsheet component with sorting/filtering
- Preset views (Quality, Cost, Content, Risk)

**Key Deliverables:**
- `src/app/chunks/[documentId]/page.tsx` - Main dashboard
- `src/components/chunks/ChunkSpreadsheet.tsx` - Spreadsheet component
- `src/app/chunks/[documentId]/spreadsheet/[chunkId]/page.tsx` - Detail view
- Helper functions for confidence-based display
- Color-coded UI matching wireframe exactly

**Completion Criteria:**
✅ Chunk dashboard matches wireframe design exactly  
✅ Three-section card layout implemented  
✅ Color-coded confidence display working  
✅ "Things We Know" / "Things We Need to Know" logic correct  
✅ Spreadsheet with sorting and filtering  
✅ Preset views functional  
✅ Progressive disclosure (3 items → full spreadsheet)

---

### 📄 Prompt #5: Run Management & Polish
**File:** `c-alpha-build-spec_v3.3-prompt-5.md`  
**Lines:** 229 lines  
**Estimated Time:** ~4 hours

**What This Builds:**
- Run comparison interface (side-by-side)
- Chunk regeneration functionality
- UI polish and error handling
- Toast notifications
- Final testing and bug fixes

**Key Deliverables:**
- `src/components/chunks/RunComparison.tsx` - Comparison interface
- Run selector component
- Regeneration API and UI
- Loading states and error boundaries
- Toast notifications throughout

**Completion Criteria:**
✅ Run comparison working (side-by-side diff)  
✅ Regeneration functional (creates new runs)  
✅ All UI polished (loading states, errors)  
✅ No critical bugs  
✅ Documentation complete

---

## How to Use These Prompts

### Step-by-Step Execution

1. **Complete Prerequisites First**
   - Run SQL setup in Supabase (from main spec document)
   - Configure API keys in `.env.local`
   - Install dependencies (`npm install @anthropic-ai/sdk tiktoken`)

2. **Execute Prompts Sequentially**
   - Open Claude 4.5 Sonnet in Cursor (200k context window)
   - Open prompt file #1 in your editor
   - **Select ALL content** (Ctrl+A / Cmd+A)
   - Copy entire file content
   - Paste into Claude chat window
   - Wait for AI to complete implementation
   - Verify completion criteria before moving to next prompt

3. **Verify Each Phase**
   - After each prompt, test the completion criteria
   - Fix any issues before proceeding
   - Commit your changes to git

4. **Repeat for All 5 Prompts**
   - Each prompt builds on the previous one
   - They must be executed in order
   - Do not skip any prompts

### What to Copy

**⚠️ IMPORTANT:** Copy the **ENTIRE FILE CONTENT** from each prompt file. 

Each file contains:
- Context for the AI
- Complete implementation code
- Step-by-step instructions
- Completion criteria

Do NOT include:
- ❌ The main spec document header
- ❌ Table of contents
- ❌ Prerequisites section
- ❌ Other prompts

Just copy the single prompt file content entirely.

---

## File Sizes

| File | Lines | Size | Time |
|------|-------|------|------|
| `c-alpha-build-spec_v3.3-prompt-1.md` | 441 | ~28 KB | ~2 hrs |
| `c-alpha-build-spec_v3.3-prompt-2.md` | 554 | ~35 KB | ~4 hrs |
| `c-alpha-build-spec_v3.3-prompt-3.md` | 468 | ~30 KB | ~4 hrs |
| `c-alpha-build-spec_v3.3-prompt-4.md` | 657 | ~42 KB | ~6 hrs |
| `c-alpha-build-spec_v3.3-prompt-5.md` | 229 | ~15 KB | ~4 hrs |
| **Total** | **2,349** | **~150 KB** | **~20 hrs** |

All files are well within Claude 4.5 Sonnet's 200k token context window.

---

## Execution Checklist

Use this checklist to track your progress:

- [ ] Prerequisites completed (SQL, API keys, npm packages)
- [ ] **Prompt #1** - Database & Infrastructure ✅
  - [ ] Types defined
  - [ ] Services created
  - [ ] "Chunks" button shows
  - [ ] Test page works
- [ ] **Prompt #2** - Chunk Extraction ✅
  - [ ] Extraction working
  - [ ] 4 chunk types identified
  - [ ] Progress tracking visible
  - [ ] Chunks in database
- [ ] **Prompt #3** - AI Dimension Generation ✅
  - [ ] Dimensions generating
  - [ ] 5 templates executing
  - [ ] Cost tracking working
  - [ ] Runs tracked
- [ ] **Prompt #4** - Dashboard & Spreadsheet ✅
  - [ ] Dashboard matches wireframe
  - [ ] Three sections working
  - [ ] Confidence display correct
  - [ ] Spreadsheet functional
- [ ] **Prompt #5** - Run Management & Polish ✅
  - [ ] Run comparison works
  - [ ] Regeneration functional
  - [ ] UI polished
  - [ ] No critical bugs

---

## Tips for Success

1. **Read Each Prompt Before Pasting**
   - Understand what will be built
   - Review completion criteria
   - Check for any prerequisites

2. **Use Fresh Context Windows**
   - Each prompt is designed for a fresh 200k context
   - Don't try to run multiple prompts in same chat
   - Cursor will manage context automatically

3. **Verify Before Proceeding**
   - Test each completion criterion
   - Run the app and check functionality
   - Fix any errors before next prompt

4. **Track Issues**
   - Note any problems or questions
   - Document workarounds
   - Report bugs for fixing in Prompt #5

5. **Commit Frequently**
   - Git commit after each prompt completes
   - Makes it easy to roll back if needed
   - Provides clear progress markers

---

## Troubleshooting

**If a prompt fails or produces errors:**

1. Check completion criteria - what's missing?
2. Review the prompt requirements carefully
3. Try re-running the specific failing part
4. If needed, modify the prompt slightly and re-run
5. Document any changes you make

**If you need to regenerate:**

1. Keep the prompt file unchanged
2. Paste into fresh Claude chat
3. AI should produce same output

---

## Summary

✅ **5 prompt files created**  
✅ **Each file is self-contained and ready to use**  
✅ **Simply copy entire file content into Claude**  
✅ **Execute in order: 1 → 2 → 3 → 4 → 5**  
✅ **Total build time: ~20 hours across 5 prompts**

**You're ready to start building! Begin with Prompt #1.**

