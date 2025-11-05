# Development Context & Operational Priorities
**Date:** 2025-11-04 16:03 PST
**Project:** Bright Run LoRA Training Data Platform (bmo) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Bright Run LoRA Training Data Platform**: Bright Run is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow. We are creating the first user-friendly solution that enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

### What Problem Does This Product Solve?

Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but face insurmountable barriers in transforming this knowledge into LoRA ready training data.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### Active Development Focus

**PHASE:** Quality Testing Phase - Live Deployment Testing  
**STATUS:** ✅ Build Complete | ✅ Database Ready | ⚠️ Home Route 404 Issue  
**DATE UPDATED:** November 5, 2025 (00:15 PST)

#### ✅ BUILD PHASE COMPLETION SUMMARY

**What Was Accomplished:**
1. ✅ All E01-E04 build prompts executed successfully
2. ✅ Comprehensive codebase analysis completed (1,414 line report)
3. ✅ Deep database audit performed - 24/29 tables now exist
4. ✅ **batch_items table created successfully** (Nov 5, 2025)
5. ✅ Batch Generation Service fully implemented (matches E04 spec 100%)
6. ✅ All core services built and operational
7. ✅ Rich test data available (1,117 rows across 11 tables)

**Key Reports Generated:**
- `pmc/context-ai/pmct/deep-project-check_v5-train-analysis-E01.md` - Codebase analysis
- `pmc/context-ai/pmct/deep-project-check_v5-train-db-review_v1.md` - Database audit
- `database-audit-complete.json` - Raw database inspection data

**Database Status (COMPLETE):**
- ✅ **24 tables exist (83% completeness)** - All critical tables ready
- ✅ 11 tables with production data (1,117 rows)
- ✅ 12 tables empty but structured (ready for testing)
- ✅ **batch_items table created and verified**
- ⚪ 5 tables missing: Optional advanced features (defer to post-launch)

**Test Data Available:**
- 177 chunks for conversation generation
- 12 documents processed
- 5 conversation templates
- 6 prompt templates
- 43 tags across 7 dimensions
- 648 API call logs
- 165 workflow sessions

---

#### 🚀 QUALITY TESTING PHASE - CURRENT FOCUS

**Testing Approach:** Git Push → Vercel Auto-Deployment

We test via deployment to Vercel rather than local `npm run dev` unless a specific debugging need arises.

**Deployment Info:**
- **Live URL:** https://train-data-three.vercel.app/
- **Deployment Method:** Git push → Automatic Vercel build & deploy
- **Current Build Status:** ✅ Compiles successfully in Vercel
- **Known Issue:** ⚠️ **Home page returns 404** - this is the first issue to diagnose

---

#### 🎯 IMMEDIATE NEXT ACTION - Diagnose & Fix 404 Home Page

**Current Problem:**
Visiting https://train-data-three.vercel.app/ returns a 404 page despite successful compilation.

**Diagnosis Steps:**

1. **Check Next.js App Router Structure**
   - Verify `src/app/page.tsx` or `src/app/page.js` exists
   - Confirm proper default export
   - Check for any layout issues in `src/app/layout.tsx`

2. **Review Vercel Build Logs**
   - Check if routes are being generated correctly
   - Look for any build warnings about missing pages
   - Verify output file structure

3. **Verify Next.js Configuration**
   - Check `next.config.js` for any routing overrides
   - Ensure no conflicting rewrites/redirects
   - Confirm basePath and output settings

4. **Test Other Routes**
   - Try accessing known API routes (e.g., `/api/conversations`)
   - Try accessing other pages (e.g., `/templates`, `/conversations`)
   - Determine if only home route is broken or all routes

**Expected Root Cause (Most Likely):**
- Missing or misconfigured `src/app/page.tsx`
- Layout component not properly wrapping pages
- Next.js app router configuration issue

**Fix Strategy:**
1. Identify the root cause via the diagnosis steps
2. Make necessary code changes locally
3. Commit and push to trigger Vercel rebuild
4. Verify fix at https://train-data-three.vercel.app/
5. Document the issue in bug tracker

---

#### 📊 TESTING READINESS BY FEATURE

**All Features Ready for Testing After 404 Fix:**

| Feature | Database | Service Layer | UI | Test Data | Status |
|---------|----------|---------------|----|-----------| -------|
| Single Conversation Generation | ✅ | ✅ | ✅ | ✅ 177 chunks | **READY** |
| **Batch Generation** | ✅ | ✅ | ✅ | ✅ | **READY** |
| Template Management | ✅ | ✅ | ✅ | ✅ 5 templates | **READY** |
| Scenario Management | ✅ | ✅ | ✅ | ✅ | **READY** |
| Edge Case Management | ✅ | ✅ | ✅ | ✅ | **READY** |
| Review Queue | ✅ | ✅ | ✅ | ✅ | **READY** |
| Export System | ✅ | ✅ | ✅ | ✅ | **READY** |
| Quality Validation | ✅ | ✅ | ✅ | ✅ | **READY** |

---

#### 📋 QUALITY CHECK WORKFLOW (Post-404 Fix)

**Step 1: Fix Home Route 404 (Priority 0)**
- Diagnose the 404 issue
- Implement fix
- Git commit and push
- Verify on Vercel deployment

**Step 2: Systematic Feature Testing on Live Deployment**

Test each feature via the live Vercel URL after 404 is resolved:

A. **Template Management**
   - Navigate to Templates view
   - Create new template
   - Edit existing template
   - Test template variables
   - Verify template preview

B. **Single Conversation Generation**
   - Select a chunk from chunks list
   - Choose template
   - Generate conversation
   - Verify quality score calculated
   - Check conversation turns display

C. **Batch Generation** ✨ *Now fully ready with batch_items table*
   - Click "Generate Batch" button
   - Configure batch (tier, count, concurrency)
   - Start batch job
   - Monitor progress in real-time
   - Verify pause/resume/cancel work
   - Check completed conversations

D. **Scenario & Edge Cases**
   - Create scenario linked to template
   - Create edge case linked to scenario
   - Generate conversations from scenario
   - Verify inheritance of parameters

E. **Review Queue**
   - Navigate to review queue
   - Review pending conversations
   - Test approve/reject/request revision
   - Verify status updates
   - Test keyboard shortcuts (A/R/N/E)

F. **Export System**
   - Select conversations to export
   - Test each format: JSONL, JSON, CSV, Markdown
   - Verify file downloads
   - Check export logs created

**Step 3: Bug Documentation (Ongoing)**

For any bugs found, document in:
`pmc/context-ai/pmct/quality-check-bugs_v1.md`

Format:
```markdown
## Bug: [Short Description]
**Severity:** Critical | High | Medium | Low
**Feature:** [Feature name]
**Component:** [File path or component name]
**Steps to Reproduce:**
1. ...
2. ...
**Expected:** ...
**Actual:** ...
**Error Messages:** ...
**Recommendation:** ...
```

Start with the 404 issue:
```markdown
## Bug: Home Page Returns 404
**Severity:** Critical
**Feature:** Home/Landing Page
**Component:** [To be determined during diagnosis]
**Steps to Reproduce:**
1. Visit https://train-data-three.vercel.app/
**Expected:** Home page with application UI
**Actual:** 404 Not Found page
**Error Messages:** 404 - Page Not Found
**Recommendation:** [To be determined after diagnosis]
```

**Step 4: Generate Test Report**

After testing, create:
`pmc/context-ai/pmct/quality-check-report_v1.md`

Include:
- Test execution summary
- Pass/fail counts by feature
- Bug summary with severities
- Recommendation for production readiness

---

#### 🎯 SUCCESS CRITERIA FOR QUALITY PHASE

**MINIMUM (Go/No-Go):**
- [ ] Home route accessible (404 fixed)
- [ ] All major routes render without errors
- [ ] Single conversation generation works end-to-end
- [ ] Batch generation works end-to-end
- [ ] Template CRUD operations work
- [ ] Export produces valid files
- [ ] No critical bugs blocking core workflows

**IDEAL:**
- [ ] All P0 features work flawlessly on live deployment
- [ ] All P1 features work with minor bugs (documented)
- [ ] P2 features work or have documented gaps
- [ ] Less than 5 high-severity bugs
- [ ] Clear remediation plan for any bugs found
- [ ] Performance is acceptable under normal load

**Key Testing Priorities:**

**P0 - CRITICAL (Must Work):**
- ⚠️ **Home route (currently 404 - fix first)**
- Single conversation generation (API + UI)
- Template CRUD operations
- Conversation listing with filters
- Batch generation (now unblocked with batch_items table)

**P1 - HIGH (Should Work):**
- Scenario creation and management
- Edge case creation and management
- Review queue workflow
- Export to JSONL/CSV/JSON

**P2 - MEDIUM (Nice to Have):**
- Quality validation scoring
- Template analytics
- Generation log tracking

---

#### 💡 Testing Notes

**When to Use Local `npm run dev`:**
- Only if you need to debug specific issues with DevTools
- When you need to inspect API request/response in detail
- When Vercel logs don't provide enough information

**Standard Testing Flow:**
1. Make code changes locally
2. Test logic/syntax if needed
3. Git commit and push
4. Wait for Vercel auto-deployment (~2-3 min)
5. Test on live URL
6. Document results
7. Repeat

Do not deviate from this focus without explicit instruction.
All other information in this document is reference material only.

### Current Active Action 
[CONDITIONAL: Include ONLY if there is an active action in progress. Must include:
1. Task ID and title
2. Current phase (Preparation/Implementation/Validation)
3. Active element being worked on
4. Last recorded action
Remove section if no active action.]

### Bugs & Challenges in the Current Task
[CONDITIONAL: Include ONLY if there are active bugs or challenges. For each issue include:
1. Issue description
2. Current status
3. Attempted solutions
4. Blocking factors
Remove section if no active issues.]

The Current Open Task section and Bugs & Challenges in the Current Task are a subset of the Active Development Focus section.

### Next Steps 
[REQUIRED: List the next actions in order of priority. Each item must include:
1. Action identifier (task ID, file path, etc.)
2. Brief description
3. Dependencies or blockers
4. Expected outcome
Maximum 5 items, minimum 2 items.]
The Next Steps section is a subset of the Active Development Focus section.

### Important Dependencies
[CONDITIONAL: Include ONLY if there are critical dependencies for the next steps. Each dependency must specify:
1. Dependency identifier
2. Current status
3. Impact on next steps
Remove section if no critical dependencies.]
The Important Dependencies section is a subset of the Active Development Focus section.

### Important Files
[REQUIRED: List all files that are essential for the current context. Format as:
1. File path from workspace root
2. Purpose/role in current task
3. Current state (if modified)
Only include files directly relevant to current work.]
The Important Files section is a subset of the Active Development Focus section.

### Important Scripts, Markdown Files, and Specifications
[CONDITIONAL: Include ONLY if there are specific scripts, documentation, or specs needed for the next steps. Format as:
1. File path from workspace root
2. Purpose/role in current context
3. Key sections to review
Remove section if not directly relevant.]
The Important Scripts, Markdown Files, and Specifications section is a subset of the Active Development Focus section.

### Recent Development Context
[CONDITIONAL: Include only if the current task builds upon or relates to recent development work. Remove section if starting fresh or switching context.]

- **Last Milestone**: Brief description of the most recently completed significant work
- **Key Outcomes**: Critical results or implementations that inform current work
- **Relevant Learnings**: Insights or patterns discovered that may apply to current focus
- **Technical Context**: Any technical state or configurations that carry forward

Example:
Last Milestone: Implemented status transition validation
Key Outcomes: Status checks now enforce valid state sequences
Relevant Learnings: State machine pattern proved effective for validation
Technical Context: Validation logic centralized in StatusManager class

## Project Reference Guide
REFERENCE MATERIALS
Everything below this line is supporting information only. Do NOT select the current task focus from this section.

### Bright Run LoRA Training Data Platform

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Bright Run LoRA Training Data Platform**: Bright Run is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow. We are creating the first user-friendly solution that enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

### What Problem Does This Product Solve?

Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but face insurmountable barriers in transforming this knowledge into LoRA ready training data.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

#### Key Documents
1. Seed Story: `pmc/product/00-bmo-seed-story.md`
2. Project Overview: `pmc\product\01-bmo-overview.md`

1. **Context Locality**: Instructions and context are kept directly alongside their relevant tasks
2. **Structured Checkpoints**: Regular token-based checks prevent context drift
3. **Directive Approach**: Clear commands and instructions with explicit timing requirements
4. **Task-Centric Documentation**: Single source of truth for task implementation
