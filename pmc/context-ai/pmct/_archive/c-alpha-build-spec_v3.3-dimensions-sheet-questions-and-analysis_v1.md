# Chunks Alpha - Dimensions Spreadsheet Feature Build
## Initial Analysis & Clarifying Questions

**Date:** October 7, 2025  
**Feature:** Dimensions Results Spreadsheet  
**Current Status:** Analysis Phase  
**Analyst:** AI Build Assistant

---

## 📋 EXECUTIVE SUMMARY

This document analyzes the requirements for building a comprehensive Dimensions Results spreadsheet feature for the Chunks Alpha module. After thorough examination of the codebase, specifications, and existing implementation, I've identified the current state, gaps, and critical questions that need clarification before proceeding with detailed build directives.

**Key Finding:** Approximately 60-70% of the infrastructure exists, but the specific "per-chunk dimension spreadsheet" view with all 61 dimensions is not yet fully implemented. The current implementation focuses on multi-run comparison rather than comprehensive single-chunk dimension validation.

---

## 🔍 CURRENT STATE ANALYSIS

### What EXISTS and Works Well ✅

#### 1. **Database Schema (100% Complete)**
- All 61+ dimension fields defined in `chunk_dimensions` table
- Run management system (`chunk_runs`) operational
- Historical preservation working (new `run_id` per regeneration)
- Proper foreign key relationships and indexes

#### 2. **Data Generation Pipeline (100% Complete)**
- AI-powered dimension generation using Claude Sonnet 4.5
- 5 prompt templates executing sequentially per chunk
- Batch processing (3 chunks in parallel)
- Confidence scoring system (precision + accuracy)
- Cost and duration tracking per chunk and per run

#### 3. **Existing UI Components (70% Complete)**

**ChunkDashboard** (`src/app/chunks/[documentId]/page.tsx`)
- ✅ Three-section chunk cards (metadata, high confidence, low confidence)
- ✅ Color-coded display (green ≥80%, orange <80%)
- ✅ Analysis summary statistics
- ✅ "Detail View" button per chunk
- ⚠️ **BUT:** Only shows ~16 dimensions (partial subset)

**ChunkSpreadsheet** (`src/components/chunks/ChunkSpreadsheet.tsx`)
- ✅ Multi-run comparison mode (rows = runs, columns = dimensions)
- ✅ Sortable columns, filter/search
- ✅ 5 preset views (All, Quality, Cost, Content, Risk)
- ✅ CSV export functionality
- ⚠️ **BUT:** Only displays ~23 dimensions in "All" view, not all 61

**RunComparison** (`src/components/chunks/RunComparison.tsx`)
- ✅ Side-by-side run diff with color-coded changes
- ✅ Statistics dashboard (improved, degraded, neutral)
- ✅ "All Fields" vs "Changes Only" modes
- ✅ CSV export of comparison

#### 4. **API Endpoints (100% Complete)**
- ✅ `/api/chunks/dimensions` - Get dimensions by chunk/run
- ✅ `/api/chunks/runs` - Get run history
- ✅ `/api/chunks/regenerate` - Create new runs
- ✅ `/api/chunks/templates` - Get template list

### What's MISSING or Incomplete ⚠️

#### 1. **Per-Chunk 61-Dimension Spreadsheet View (NEW)**
The spec describes a spreadsheet showing **ALL 61 dimensions** for each chunk with these columns:
- Dimension Name (fixed first column)
- Document Name (from last run)
- Generated Value
- What Generated TYPE (AI/Mechanical/Prior)
- Precision Confidence Level
- Accuracy Confidence Level  
- Description (from data dictionary)
- Type (from data dictionary)
- Allowed Values Format (from data dictionary)

**Current Gap:** The existing `ChunkSpreadsheet` component shows dimensions as columns with runs as rows. The spec seems to describe dimensions as ROWS with metadata as columns.

#### 2. **Dimension Metadata Dictionary Integration**
The CSV file `document-metadata-dictionary.csv` contains:
- Description for each dimension
- Type (string, enum, list[string], etc.)
- Allowed_Values_Format
- Examples

**Current Gap:** This metadata is NOT currently integrated into the UI. The database schema doesn't store dimension metadata—it only stores generated values.

#### 3. **Generation Type Classification**
Spec requires showing "What Generated TYPE":
- **AI Generated:** From Claude API (most dimensions)
- **Mechanically Generated:** Calculated fields (char_start, char_end, token_count, etc.)
- **Prior Generated:** From document categorization module (doc_title, author, primary_category, etc.)

**Current Gap:** No explicit field or logic to classify generation types.

#### 4. **Per-Chunk Historical View**
Spec states: "I must be able to look up and compare runs. The chunk selection should be on the 'per chunk level'. If I am looking at Chunk A page, I should only see historical lookups for Chunk A."

**Current Status:** 
- ✅ `RunComparison` component can compare runs
- ⚠️ **BUT:** It's not clear if it's filtered to single-chunk view or shows all chunks' dimensions

#### 5. **Run Selector with Timestamp Names**
Spec requires: "Each run can have chunk name & datetimestamp in the run name."

**Current Status:**
- ✅ `chunk_runs.run_name` exists (e.g., "Dimension Generation - 2025-10-06T10:00:00Z")
- ⚠️ **BUT:** No chunk-specific names, only document-level run names

#### 6. **Column Resizing**
Spec requires: "Must be able to resize the horizontal width of the column on the page"

**Current Status:** ❌ Not implemented in any component

---

## 🎯 INTERPRETATION QUESTIONS

### **CRITICAL QUESTIONS** (Must answer before building)

#### Q1: Dimension Display Orientation
**Question:** Should dimensions be displayed as ROWS or COLUMNS?

**Option A: Dimensions as ROWS** (My interpretation of spec)
```
| Dimension Name          | Value from Run 1      | Confidence | Type        | Description |
|-------------------------|-----------------------|------------|-------------|-------------|
| chunk_summary_1s        | "This chapter..."     | 9.2        | AI Generated| One-sentence summary |
| key_terms               | ["AI", "ML"]          | 8.5        | AI Generated| Salient terms |
| author                  | "BRAND Team"          | 10.0       | Prior Gen   | Document author |
| char_start              | 0                     | 10.0       | Mechanical  | Character start index |
```



**Option B: Dimensions as COLUMNS** (Current implementation)
```
| Run Name   | chunk_summary_1s | key_terms    | audience | ... (61 columns) |
|------------|------------------|--------------|----------|------------------|
| Run 1      | "This chapter..."| ["AI", "ML"] | "SMB"    | ...              |
| Run 2      | "This chapter..."| ["AI", "ML"] | "SMB"    | ...              |
```

**My Recommendation:** Option A (dimensions as rows) because:
1. The CSV file structure shows 61 dimensions as rows
2. Easier to show metadata (Description, Type, Allowed_Values) alongside each dimension
3. Better for mobile/responsive (61 columns is unwieldy)
4. Spec says "Each dimension must have a full row on the page"

**User Decision Needed:** Which orientation?
A1: The dimensions should be displayd as rows as you show here in Option A
---

#### Q2: "Display" Database Table
**Question:** The spec says "We can create a 'display' database table that can join all of the data for this output if it makes it simpler."

**Current Analysis:**
- The 61 dimensions are already normalized in `chunk_dimensions` table
- Metadata (Description, Type, Allowed_Values) is in CSV files, NOT in the database
- Creating a display table would require:
  - Adding dimension metadata to the database
  - Creating views or materialized views
  - Potentially duplicating data

**Options:**
- **Option A:** Add `dimension_metadata` table to database with Description, Type, Allowed_Values for each field
- **Option B:** Keep metadata in frontend as TypeScript constants (import from CSV)
- **Option C:** Create a database VIEW that joins `chunk_dimensions` + `chunks` + `documents` for easy querying

**My Recommendation:** Option B (frontend constants) for MVP because:
1. Dimension metadata is static and doesn't change per run
2. Avoids database schema changes
3. Faster to implement
4. Can migrate to database later if needed

**User Decision Needed:** Which approach for metadata storage?
A2: Use **Option A:** Add `dimension_metadata` table to database with Description, Type, Allowed_Values for each field
These will be critical for the production app, so we might as well do it now. Also Option C I think would not work without Option A too correct? You can use both Option A and Option C as needed. 
---

#### Q3: Multi-Run Display Per Chunk
**Question:** When viewing dimensions for Chunk A, should I see:
- **Option A:** Only the LATEST run's dimensions (simpler, focused validation)
- **Option B:** Dimensions from ALL historical runs side-by-side (comparison view)
- **Option C:** Latest run by default, with option to toggle comparison mode

**Current Implementation:** The `ChunkSpreadsheet` component shows multiple runs side-by-side.

**My Recommendation:** Option C because:
1. Validates current generation quality (primary use case)
2. Allows historical comparison when needed (secondary use case)
3. Reduces cognitive overload for validation task

**User Decision Needed:** Which multi-run display strategy?
A3:
Do NOT implement a side by side historical runs. 

 Use option A with adjustments. The adjustments: I envision that on each dimensions results page there will be small drop down at the top that allows selection of all the runs for that chunk. Selecting another run will show that data fully on the page. 

---

#### Q4: Missing CSV File
**Question:** The spec references `LoRA-dimensions_v2-full-output-table_v1.csv` which doesn't exist in the repo.

**What I Found Instead:**
- `document-metadata-dictionary.csv` (61 dimensions with descriptions)
- `document-metadata-dictionary-gen-AI-processing-required_v1.csv` (36 AI-generated dimensions)
- `document-metadata-dictionary-mechanically-generated_v1.csv` (assumed to exist but not found)
- `document-metadata-dictionary-previously-generated_v1.csv` (assumed to exist but not found)

**My Assumption:** The "document-metadata-dictionary.csv" file IS the reference for layout/format.

**User Clarification Needed:** 
1. Is `document-metadata-dictionary.csv` the correct reference?
2. Do the "mechanically-generated" and "previously-generated" CSV files exist somewhere?
3. Should I create sample data based on the existing CSVs?

A4: 
Oh here now is the correct dimensions results data reference: `C:\Users\james\Master\BrightHub\BRun\mock-data\chunks-alpha-data\LoRA-dimensions_v2-full-output-table_v1.csv`
It is there now and should answer a lot of questions these questions.
---

#### Q5: Generation Type Logic
**Question:** How should the system classify "What Generated TYPE" for each dimension?

**My Proposed Logic:**

**Mechanically Generated** (8 fields from `chunks` table):
- `chunk_id`, `chunk_type`, `section_heading`, `page_start`, `page_end`, `char_start`, `char_end`, `token_count`, `overlap_tokens`, `chunk_handle`

**Prior Generated** (8 fields from `documents` and categorization):
- `doc_id`, `doc_title`, `doc_version`, `source_type`, `source_url`, `author`, `doc_date`, `primary_category`

**AI Generated** (45 fields from dimension generation):
- All content, task, CER, scenario, training, risk, and metadata dimensions

**User Confirmation Needed:** Is this classification correct, or is there a different mapping?
There is a different mapping:
Read these two documents:
`pmc\context-ai\pmct\09-unstructured-chunks-module-alpha-driver_v2.md`
`pmc\context-ai\pmct\09-unstructured-chunks-module-alpha_v2.md`
Your response uncovers a gap in our current module. From your question it appears that we did not save generation type for each dimension in a normalized database. This is important to have. We need to build in this data point for each dimension (normalized). Check first that it has not already been done.
It also highlights:
a. We are not generating AI dimension values for 60+ dimensions. Only the 36 in this table: `C:\Users\james\Master\BrightHub\brun\chunks-alpha\system\chunks-alpha-data\document-metadata-dictionary-mechanically-generated_v1.csv`

b. Also read: the ## Efficiency Recommendations section of: `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\pmc\context-ai\pmct\c-alpha-data-dimensions-segmenting_v1.md`
This should already be de facto implemented by the Claude prompts the system submits to the API.
---

### **DESIGN QUESTIONS** (Important but not blockers)

#### Q6: Column Headers
The spec lists these column headers:
1. Chunk Dimension
2. Document Name (last run)
3. Generated Value
4. What Generated TYPE
5. Precision Confidence Level
6. Accuracy Confidence Level
7. Description
8. Type
9. Allowed_Values_Format

**Questions:**
- Should "Document Name (last run)" show the document title or the run name?.
- Should there be separate columns for each historical run if comparing?
- Should confidence levels show the raw score (1-10) or a badge (High/Medium/Low)?
A6: The chunk dimensions page can show the Document Name - Chunk Name - Run Datetimestamp so that each will be unique.
Do not implement a side by side historical run. I envision that on each dimensions results page there will be small drop down at the top that allows selection of all the runs for that chunk. Selecting another run will show that data fully on the page. 
Confidence levels should show the raw score. We must be able to short by the confidence level columns.


---

#### Q7: Filtering and Sorting
**Question:** Which columns should be sortable? Which should be filterable?

**My Recommendations:**
- **Sortable:** Dimension Name, Precision Confidence, Accuracy Confidence, Type
- **Filterable:** 
  - Generation Type (AI/Mechanical/Prior)
  - Confidence Threshold (≥80%, <80%)
  - Type (string, enum, list, etc.)
  - Populated/Empty values

**User Feedback Needed:** Are these the right sort/filter options?
A7: Yes these are good sort/filter options to start with.
---

#### Q8: Visual Density
Spec says: "Very much like a simple spreadsheet view with little space between rows or columns."

**Current Options:**
- Use shadcn/ui `<Table>` component with `compact` styling
- Custom CSS to reduce padding (e.g., `py-1 px-2` instead of default `py-4 px-6`)
- Fixed row height (e.g., 40px) for consistency

**My Recommendation:** Compact table with fixed row heights and `text-sm` font size.

**User Preference Needed:** How compact? (Show mockup samples)
A8: Yes, as you recommend. Implement as a compact table with fixed row heights and `text-sm` font size.

---

#### Q9: Column Resizing Implementation
**Question:** How should column resizing work?

**Options:**
- **Option A:** Use `react-table` library with built-in resizing (adds dependency)
- **Option B:** Custom implementation with draggable column borders (more work)
- **Option C:** Preset column width templates (Small/Medium/Large)

**My Recommendation:** Option C (preset templates) for MVP, can enhance later.

**User Decision Needed:** Which resizing approach?
A9: Option C (preset templates) for MVP, can enhance later.
---

#### Q10: Export Functionality
**Question:** The spec doesn't explicitly mention CSV export for this new dimensions view. Should it be included?

**Current Status:** `ChunkSpreadsheet` component has CSV export for multi-run comparison.

**My Recommendation:** Yes, include CSV export with all columns for validation/analysis.

**User Confirmation Needed:** Include export? What format (CSV, Excel, JSON)?
A10: Yes, include CSV export with all columns for validation/analysis.
---

## 🏗️ ARCHITECTURE RECOMMENDATIONS

### Proposed Component Structure

Based on the analysis, I recommend creating a **NEW** component separate from the existing `ChunkSpreadsheet`:

```
src/components/chunks/
├── ChunkSpreadsheet.tsx         (Existing - multi-run comparison)
├── RunComparison.tsx             (Existing - run diff)
└── DimensionValidationSheet.tsx  (NEW - 61-dimension validation view)
```

**Why a NEW component?**
1. Different data orientation (dimensions as rows vs. columns)
2. Different use case (validation vs. comparison)
3. Integration with dimension metadata dictionary
4. Avoid breaking existing functionality
Agreed.

### Proposed Page Structure

```
/chunks/[documentId]/dimensions/[chunkId]  (NEW page)
├── Header: Chunk metadata + run selector
├── Stats: Total dimensions, populated %, confidence distribution
├── Spreadsheet: All 61 dimensions as rows
└── Footer: Export + actions
```

### Database Changes Needed

**Option 1: No Database Changes** (Recommended for MVP)
- Keep dimension metadata in TypeScript constants
- Query existing tables (`chunks`, `chunk_dimensions`, `chunk_runs`)
- Join data in frontend

**Option 2: Add Metadata Table** (Future enhancement)
```sql
CREATE TABLE dimension_metadata (
  field_name TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  data_type TEXT NOT NULL,
  allowed_values_format TEXT,
  generation_type TEXT NOT NULL,  -- 'AI' | 'Mechanical' | 'Prior'
  example TEXT,
  is_required BOOLEAN DEFAULT FALSE
);
```

**My Recommendation:** Option 1 for MVP to avoid database migrations and keep metadata version-controlled in code.
I agree. use Option 1.

---

## 📊 COMPLETION ESTIMATE

### Current State: ~65% Complete

**What's Built (65%):**
- ✅ Database schema (15%)
- ✅ Dimension generation pipeline (20%)
- ✅ API endpoints (10%)
- ✅ Existing UI components (partial) (10%)
- ✅ Run management system (10%)

**What's Needed (35%):**
- ⚠️ Dimension metadata integration (10%)
- ⚠️ New validation spreadsheet component (15%)
- ⚠️ Generation type classification logic (3%)
- ⚠️ Column resizing (2%)
- ⚠️ Enhanced filtering/sorting (3%)
- ⚠️ Testing + polish (2%)

---

## 🎯 RECOMMENDED BUILD STRATEGY

### Phase 1: Pre-Work (Human Guide Tasks) - 1 hour
**No code changes, clarify requirements**

- [ ] User answers all CRITICAL questions (Q1-Q5)
- [ ] User provides missing CSV file or confirms data source
- [ ] User reviews and approves component architecture
- [ ] User confirms UI mockup/wireframe (if available)

### Phase 2: Data Layer Enhancement (Claude Prompt 1) - Estimated 90 minutes
**Modular: Dimension metadata + classification logic**

- [ ] Create TypeScript constants from CSV files
  - `src/lib/dimension-metadata.ts` with all 61 dimensions
  - Description, Type, Allowed_Values for each field
- [ ] Create classification utility
  - `src/lib/dimension-classifier.ts`
  - Function to determine generation type (AI/Mechanical/Prior)
- [ ] Create dimension service
  - `src/lib/dimension-service.ts`
  - Functions to get dimensions with metadata joined
- [ ] Unit tests for classification logic

**Why this is modular:**
- Self-contained, doesn't touch existing code
- Can be tested independently
- Provides foundation for UI layer
- Won't break if UI changes

### Phase 3: Validation Spreadsheet Component (Claude Prompt 2) - Estimated 2 hours
**Modular: New component + page, no modifications to existing components**

- [ ] Create `DimensionValidationSheet.tsx` component
  - All 61 dimensions as rows
  - Columns: Dimension, Value, Type, Confidence, Description, etc.
  - Sortable columns (Name, Confidence, Type)
  - Filterable by generation type and confidence
  - CSV export functionality
  - Column width presets (compact/normal/wide)
- [ ] Create new page `/chunks/[documentId]/dimensions/[chunkId]`
  - Header with chunk metadata
  - Run selector dropdown
  - Stats summary (populated %, avg confidence)
  - Integration with DimensionValidationSheet component
  - Error boundaries and loading states
- [ ] Add navigation from chunk dashboard
  - "View All Dimensions" button on each chunk card
  - Link to new dimensions page
- [ ] Responsive design (mobile/tablet/desktop)

**Why this is modular:**
- New files only, no edits to existing components
- Isolated feature that can be tested independently
- Easy to roll back if issues arise
- Doesn't impact current chunk dashboard or spreadsheet

### Phase 4: Polish & Enhancement (Claude Prompt 3) - Estimated 1 hour
**Modular: Enhancements to Phase 3 components only**

- [ ] Column resizing implementation (if user wants it)
- [ ] Advanced filtering options
  - Multi-select for generation type
  - Confidence range slider
  - Data type filters
  - Populated vs empty toggle
- [ ] Preset views (similar to existing spreadsheet)
  - "All Dimensions"
  - "High Confidence" (≥80%)
  - "Needs Review" (<80%)
  - "AI Generated Only"
  - "Required Fields"
- [ ] Visual polish
  - Hover states
  - Loading skeletons
  - Empty states
  - Toast notifications
- [ ] Keyboard shortcuts (optional)
  - Arrow keys for navigation
  - Tab for cell focus
  - Ctrl+F for search

**Why this is modular:**
- All enhancements to new components only
- Can be done in iterations (ship Phase 3, then add Phase 4)
- User can deprioritize features if needed
- Clear separation of MVP vs. nice-to-have

---

## 🚨 RISKS & MITIGATION

### Risk 1: Misunderstanding Spec Requirements
**Probability:** High (40%)  
**Impact:** High (rework needed)

**Mitigation:**
- ✅ Get answers to CRITICAL questions before coding
- ✅ Create visual mockup for user approval
- ✅ Build in small iterations with checkpoints

### Risk 2: Performance with 61 Columns
**Probability:** Medium (20%)  
**Impact:** Medium (slow rendering)

**Mitigation:**
- Use virtual scrolling for large tables (react-window)
- Implement column hiding/showing
- Lazy load non-visible data
- Optimize re-renders with React.memo

### Risk 3: CSV File Discrepancy
**Probability:** Medium (30%)  
**Impact:** Medium (wrong data structure)

**Mitigation:**
- ✅ Confirm CSV file structure with user
- Build data transformation layer to normalize inputs
- Add validation to catch schema mismatches

### Risk 4: Breaking Existing Features
**Probability:** Low (10%)  
**Impact:** High (rework + testing)

**Mitigation:**
- ✅ Create NEW components instead of modifying existing
- Keep existing routes and components unchanged
- Comprehensive testing before merging
- Feature flag to enable/disable new view

---

## 📝 FINAL RECOMMENDATIONS

### Immediate Next Steps (Human Guide):
1. **Review this analysis** and provide feedback
2. **Answer CRITICAL questions** (Q1-Q5) 
3. **Provide/confirm CSV file** for dimension metadata
4. **Approve component architecture** (new component vs. modify existing)
5. **Share UI wireframe/mockup** if available (or approve text description)

### Build Approach:
- **3 separate Claude prompts** (Phase 2, 3, 4)
- **Modular strategy:** Each prompt builds self-contained functionality
- **No modifications** to existing chunk dashboard or spreadsheet components
- **Total estimated time:** ~4.5 hours of LLM work + 1 hour human review

### Success Criteria:
- ✅ All 61 dimensions visible in spreadsheet format
- ✅ Dimensions displayed as rows with metadata columns
- ✅ Confidence levels clearly indicated
- ✅ Generation type classification working
- ✅ Sortable and filterable
- ✅ Responsive and performant
- ✅ CSV export functional
- ✅ Historical run comparison available
- ✅ Zero impact on existing features

---

## 🎯 QUESTIONS FOR USER

### Must Answer Before Building:
1. **Q1:** Dimensions as ROWS or COLUMNS?
2. **Q2:** Metadata storage approach (frontend constants vs. database)?
3. **Q3:** Multi-run display strategy (latest only, all runs, or toggle)?
4. **Q4:** Confirm CSV file source for dimension metadata
5. **Q5:** Confirm generation type classification logic

### Nice to Have (Can Assume Defaults):
6. **Q6:** Column header details and confidence display format
7. **Q7:** Sort/filter preferences
8. **Q8:** Visual density preference
9. **Q9:** Column resizing approach
10. **Q10:** Export functionality requirements

---

## 📎 APPENDICES

### Appendix A: Dimension Count Breakdown

**Total Fields in `chunk_dimensions` table: 61**

1. **Document Metadata (8 fields):**
   - doc_id, doc_title, doc_version, source_type, source_url, author, doc_date, primary_category

2. **Content Dimensions (7 fields):**
   - chunk_summary_1s, key_terms, audience, intent, tone_voice_tags, brand_persona_tags, domain_tags

3. **Task Dimensions (6 fields):**
   - task_name, preconditions, inputs, steps_json, expected_output, warnings_failure_modes

4. **CER Dimensions (5 fields):**
   - claim, evidence_snippets, reasoning_sketch, citations, factual_confidence_0_1

5. **Scenario Dimensions (5 fields):**
   - scenario_type, problem_context, solution_action, outcome_metrics, style_notes

6. **Training Dimensions (3 fields):**
   - prompt_candidate, target_answer, style_directives

7. **Risk Dimensions (6 fields):**
   - safety_tags, coverage_tag, novelty_tag, ip_sensitivity, pii_flag, compliance_flags

8. **Training Metadata (9 fields):**
   - embedding_id, vector_checksum, label_source_auto_manual_mixed, label_model, labeled_by, label_timestamp_iso, review_status, include_in_training_yn, data_split_train_dev_test, augmentation_notes

9. **Meta-dimensions (5 fields):**
   - generation_confidence_precision, generation_confidence_accuracy, generation_cost_usd, generation_duration_ms, prompt_template_id

10. **Additional Chunk Metadata (7 fields not in chunk_dimensions):**
    - chunk_id, chunk_type, section_heading, page_start, page_end, char_start, char_end, token_count, overlap_tokens, chunk_handle

**Total: 61 dimension fields** (not counting id, chunk_id, run_id, generated_at)

### Appendix B: Existing Component Capabilities

**ChunkSpreadsheet Component (`src/components/chunks/ChunkSpreadsheet.tsx`):**
- Displays ~23 dimensions (filtered subset)
- Multi-run comparison (rows = runs, columns = dimensions)
- 5 preset views (All, Quality, Cost, Content, Risk)
- Sortable columns (click header)
- Filter by text search
- CSV export
- Smart value formatting (arrays, booleans, numbers)

**Gaps vs. Spec:**
- ❌ Doesn't show all 61 dimensions
- ❌ Doesn't show dimension metadata (Description, Type, Allowed_Values)
- ❌ Doesn't classify generation type
- ❌ Wrong orientation (runs as rows vs. dimensions as rows)
- ❌ No column resizing

### Appendix C: Files to Create

**New Files (Phase 2):**
- `src/lib/dimension-metadata.ts` - Dimension metadata constants
- `src/lib/dimension-classifier.ts` - Generation type logic
- `src/lib/dimension-service.ts` - Data access layer

**New Files (Phase 3):**
- `src/components/chunks/DimensionValidationSheet.tsx` - Main component
- `src/app/chunks/[documentId]/dimensions/[chunkId]/page.tsx` - Page component

**Files to Update (Phase 3):**
- `src/app/chunks/[documentId]/page.tsx` - Add "View All Dimensions" button

**No modifications to:**
- `src/components/chunks/ChunkSpreadsheet.tsx` (keep existing)
- `src/components/chunks/RunComparison.tsx` (keep existing)
- `src/lib/chunk-service.ts` (use as-is)
- Database schema (no migrations needed)

---

**END OF ANALYSIS**

**Next Action:** Human guide reviews this document, answers CRITICAL questions, and approves build strategy. Once approved, I will generate the 3 detailed build prompts for Claude Sonnet 4.5.

