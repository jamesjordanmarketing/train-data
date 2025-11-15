# Prompt Templates Content Expansion Specification

**Created**: 2025-11-14
**Purpose**: Specification for completing the full expansion of `04-cat-to-conv-templates-execution-E01_v2.md`
**Status**: Partial - Prompt 0 complete, Prompts 1-3 need full expansion
**Target File**: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\04-cat-to-conv-templates-execution-E01_v2.md`

---

## Current Status

### ✅ Completed Work

1. **File Created**: `04-cat-to-conv-templates-execution-E01_v2.md` (855 lines)
   - Executive Summary updated with v2 changes
   - Context and Dependencies sections complete
   - Implementation Strategy updated for SAOL-first approach
   - **Prompt 0 fully written** (lines 213-726) - Database Schema Setup using SAOL

2. **Key Changes Implemented**:
   - Added new Prompt 0 for SAOL-based schema creation
   - Updated total prompts from 3 to 4
   - Updated estimated time from 40-60 hours to 48-68 hours
   - Removed manual SQL execution instructions
   - All schema operations now use `agentExecuteDDL()` with `transport: 'pg'`

3. **Prompt 0 Content Includes**:
   - Complete TypeScript script `setup-scaffolding-schema.ts`
   - DDL statements for all 4 tables (personas, emotional_arcs, training_topics, prompt_templates)
   - Dry-run validation step
   - DDL execution step
   - Schema verification using `agentIntrospectSchema()`
   - Table accessibility testing
   - Comprehensive acceptance criteria
   - Validation requirements with test commands
   - Troubleshooting section

### 🔨 Work Needed

**Prompts 1-3 need to be fully copied** from the original `04-cat-to-conv-templates-execution-E01.md` file.

Currently, the v2 file contains placeholders:
- Line 727-779: Prompt 1 placeholder says "(... rest of Prompt 1 content stays exactly the same as original file lines 478-978 ...)"
- Line 779-794: Prompt 2 placeholder says "(... Prompt 2 content stays exactly the same as original file lines 989-1364 ...)"
- Line 794-814: Prompt 3 placeholder says "(... Prompt 3 content stays exactly the same as original file lines 1375-1645 ...)"

---

## Completion Instructions

### Task: Expand Full Content of Prompts 1-3

**Objective**: Copy the complete content of Prompts 1, 2, and 3 from the original v1 file into the v2 file, replacing the placeholder text.

### Source File

**File**: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\04-cat-to-conv-templates-execution-E01.md`
**Total Lines**: 1683

### Target File

**File**: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\04-cat-to-conv-templates-execution-E01_v2.md`
**Current Lines**: 855
**Expected Final Lines**: ~1850-1900

---

## Step-by-Step Expansion Process

### Step 1: Read Source Content for Prompt 1

**Action**: Read lines 433-978 from original file
**Command**:
```bash
# Read Prompt 1 section
Read file: 04-cat-to-conv-templates-execution-E01.md
Offset: 432
Limit: 546
```

**Content to Extract**:
- Starts at line 433: "### Prompt 1: Scaffolding Data Foundation - Extract and Populate"
- Ends at line 978: "++++++++++++++++++"
- **Length**: ~546 lines

**Key Sections in Prompt 1**:
- Scope and dependencies
- Context and requirements
- Product overview
- Current codebase state
- Implementation tasks (T-1.1, T-1.2, T-1.3)
- Task T-1.1: Extract Persona Data (with full TypeScript extraction script)
- Task T-1.2: Extract Emotional Arc Data (with full TypeScript extraction script)
- Task T-1.3: Extract Training Topic Data
- Acceptance criteria (5 sections)
- Validation requirements (4 manual testing steps)

### Step 2: Read Source Content for Prompt 2

**Action**: Read lines 982-1364 from original file
**Command**:
```bash
# Read Prompt 2 section
Read file: 04-cat-to-conv-templates-execution-E01.md
Offset: 981
Limit: 383
```

**Content to Extract**:
- Starts at line 982: "### Prompt 2: Prompt Template Extraction & Templatization"
- Ends at line 1364: "++++++++++++++++++"
- **Length**: ~383 lines

**Key Sections in Prompt 2**:
- Scope and dependencies
- Context and requirements
- Template organization principle
- Source documents
- Current codebase state
- Implementation tasks (T-2.1, T-2.2)
- Task T-2.1: Extract Template A (Confusion → Clarity) - Full template definition with complete template_text
- Task T-2.2: Create Template Import Script (with full TypeScript script)
- Acceptance criteria (4 sections)
- Validation requirements (3 verification steps)

### Step 3: Read Source Content for Prompt 3

**Action**: Read lines 1367-1645 from original file
**Command**:
```bash
# Read Prompt 3 section
Read file: 04-cat-to-conv-templates-execution-E01.md
Offset: 1366
Limit: 279
```

**Content to Extract**:
- Starts at line 1367: "### Prompt 3: Template Selection Service Integration"
- Ends at line 1645: "++++++++++++++++++"
- **Length**: ~279 lines

**Key Sections in Prompt 3**:
- Scope and dependencies
- Context and requirements
- Product overview
- Selection logic (CRITICAL section)
- Current codebase state
- Implementation tasks (T-3.1, T-3.2, T-3.3)
- Task T-3.1: Update Template Selection Service (with full TypeScript service class)
- Task T-3.2: Enhance Template Resolver (with full TypeScript resolver class)
- Task T-3.3: Update /conversations/generate UI Integration
- Acceptance criteria (3 sections)
- Validation requirements (3 test scenarios)

### Step 4: Insert Content into v2 File

**Location in v2 File**:
- Replace line 727-779 with full Prompt 1 content
- Replace line 779-794 with full Prompt 2 content
- Replace line 794-814 with full Prompt 3 content

**Edit Strategy**:

1. **For Prompt 1**:
   - Find placeholder text: "(... rest of Prompt 1 content stays exactly the same as original file lines 478-978 ...)"
   - Replace with full Prompt 1 content from source lines 433-978
   - Keep section heading "### Prompt 1: Scaffolding Data Foundation - Extract and Populate"
   - Keep delimiters "========================" and "++++++++++++++++++"

2. **For Prompt 2**:
   - Find placeholder text: "(... Prompt 2 content stays exactly the same as original file lines 989-1364 ...)"
   - Replace with full Prompt 2 content from source lines 982-1364
   - Keep section heading "### Prompt 2: Prompt Template Extraction & Templatization"
   - Keep delimiters

3. **For Prompt 3**:
   - Find placeholder text: "(... Prompt 3 content stays exactly the same as original file lines 1375-1645 ...)"
   - Replace with full Prompt 3 content from source lines 1367-1645
   - Keep section heading "### Prompt 3: Template Selection Service Integration"
   - Keep delimiters

---

## Verification Steps

After expansion is complete, verify:

### 1. File Structure Check
```bash
# Count total lines (should be ~1850-1900)
wc -l 04-cat-to-conv-templates-execution-E01_v2.md

# Verify all 4 prompts exist
grep "^### Prompt" 04-cat-to-conv-templates-execution-E01_v2.md
```

**Expected Output**:
```
### Prompt 0: Database Schema Setup using SAOL
### Prompt 1: Scaffolding Data Foundation - Extract and Populate
### Prompt 2: Prompt Template Extraction & Templatization
### Prompt 3: Template Selection Service Integration
```

### 2. Prompt Delimiters Check
```bash
# Count prompt start delimiters (should be 4)
grep -c "^=======================$" 04-cat-to-conv-templates-execution-E01_v2.md

# Count prompt end delimiters (should be 4)
grep -c "^+++++++++++++++++$" 04-cat-to-conv-templates-execution-E01_v2.md
```

**Expected**: 4 of each

### 3. Content Completeness Check

**Prompt 1 Verification**:
```bash
# Check for persona extraction script
grep -c "function extractPersonasFromSeeds" 04-cat-to-conv-templates-execution-E01_v2.md
```
**Expected**: 1 occurrence

**Prompt 2 Verification**:
```bash
# Check for template definition
grep -c "CONFUSION_TO_CLARITY_TEMPLATE" 04-cat-to-conv-templates-execution-E01_v2.md
```
**Expected**: 2+ occurrences

**Prompt 3 Verification**:
```bash
# Check for template selection service
grep -c "class TemplateSelectionService" 04-cat-to-conv-templates-execution-E01_v2.md
```
**Expected**: 1 occurrence

### 4. SAOL References Check

Verify Prompt 1 still references SAOL for data import:
```bash
grep "agentImportTool" 04-cat-to-conv-templates-execution-E01_v2.md | head -n 3
```

Should show usage in Prompt 1 for importing personas, arcs, and topics.

### 5. No Placeholder Text Remaining
```bash
# Should return 0
grep -c "content stays exactly the same as original" 04-cat-to-conv-templates-execution-E01_v2.md
```

**Expected**: 0 (no placeholders remaining)

---

## Final Validation

### Content Integrity Checklist

- [ ] Prompt 0 (lines 213-726): Complete - Database schema setup with SAOL
- [ ] Prompt 1 (lines ~727-1273): Full content copied from original
- [ ] Prompt 2 (lines ~1274-1657): Full content copied from original
- [ ] Prompt 3 (lines ~1658-1936): Full content copied from original
- [ ] Success Criteria section: Complete
- [ ] Document metadata updated: Total Prompts = 4, Time = 48-68 hours
- [ ] All delimiters present: 4 x "========================" and 4 x "++++++++++++++++++"
- [ ] No placeholder text remaining
- [ ] All TypeScript code blocks preserved
- [ ] All bash command examples preserved
- [ ] All acceptance criteria preserved

### File Metadata Check

After completion, the file should have:
- **Total Lines**: ~1850-1900
- **Total Prompts**: 4
- **Estimated Time**: 48-68 hours
- **Version**: v2 - SAOL-first database operations

---

## Execution Prompt for Next Agent

**Copy this prompt to the next agent:**

```
Read the specification file at:
C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\04-cat-to-conv-templates-engine-prompts-spec_v1.md

Then complete the expansion by:

1. Read the source file: 04-cat-to-conv-templates-execution-E01.md
2. Read the target file: 04-cat-to-conv-templates-execution-E01_v2.md
3. Extract Prompt 1 content (source lines 433-978)
4. Extract Prompt 2 content (source lines 982-1364)
5. Extract Prompt 3 content (source lines 1367-1645)
6. Replace placeholder text in v2 file with full extracted content
7. Verify using the validation steps in the spec
8. Write the completed file back to 04-cat-to-conv-templates-execution-E01_v2.md

Use the Edit tool to replace the placeholder sections with full content.
```

---

## Notes

- **DO NOT modify Prompt 0** - It is already complete in v2
- **DO NOT modify** the Executive Summary, Context, Implementation Strategy sections - Already updated
- **ONLY expand** Prompts 1, 2, and 3 by copying from original file
- **Preserve exact formatting** including code blocks, bash commands, and acceptance criteria
- **No changes to content** - This is a copy operation, not an edit operation

---

**Specification Status**: Complete and ready for execution
**Next Action**: Have an agent execute the expansion using this specification
