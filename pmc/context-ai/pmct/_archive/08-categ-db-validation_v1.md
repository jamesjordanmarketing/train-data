# Validation & Testing Protocol: Normalized Database Implementation

···············································································································
**VALIDATION PROMPT START**
···············································································································

## Context

You are validating the completed implementation of Prompts 1, 2, and 3 for the normalized database structure. The system should now write ALL workflow form inputs to normalized Supabase tables (`document_categories`, `document_tags`, `custom_tags`) and display that data from the database on the webpage.

## Your Role

Act as a QA testing agent. Execute the test scenarios below and **document all findings** in the test results file.

## Test Results Documentation

**IMPORTANT:** As you complete each test, document your findings in this file:

**File Path:** `pmc\context-ai\pmct\08-categ-db-validation-test-results_v1.md`

- Create this file at the start of testing
- Update it after completing each test scenario
- Include all evidence (SQL results, screenshots, observations)
- Use the Test Result Report Format provided at the end of this prompt
- Keep this file updated throughout the testing process

## Prerequisites Verification

Before testing, verify these are in place:

1. ✅ Environment variable `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true` is set
2. ✅ Database tables exist: `document_categories`, `document_tags`, `custom_tags`
3. ✅ Application compiles without TypeScript errors
4. ✅ Development server is running

## Test Scenarios

### Test 1: Complete Workflow Submission (Write to Normalized Tables)

**Objective:** Verify all form inputs are written to normalized database tables

**Steps:**
1. Navigate to workflow start page
2. Select a document for categorization
3. **Step A:** Select a belonging rating (1-5)
4. **Step B:** Select a primary category
5. **Step C:** Select tags from at least 3 dimensions including:
   - Authorship (required)
   - Disclosure-risk (required)
   - Intended-use (required)
   - Plus 2-3 optional dimensions
6. Click "Submit for Processing"

**Validation Points:**

Open Supabase SQL Editor and run these queries:

```sql
-- Get the most recent workflow submission
SELECT 
    ws.id as workflow_id,
    ws.document_id,
    ws.step,
    ws.is_draft,
    ws.completed_at,
    d.title as document_title
FROM workflow_sessions ws
LEFT JOIN documents d ON d.id = ws.document_id
ORDER BY ws.created_at DESC
LIMIT 1;
```

**Expected Result:** 
- `step` = 'complete'
- `is_draft` = false
- `completed_at` is populated

```sql
-- Check document_categories table
SELECT 
    dc.id,
    dc.belonging_rating,
    c.name as category_name,
    dc.is_primary
FROM document_categories dc
LEFT JOIN categories c ON c.id = dc.category_id
WHERE dc.workflow_session_id = 'YOUR_WORKFLOW_ID_FROM_ABOVE'
ORDER BY dc.assigned_at DESC;
```

**Expected Result:**
- One row exists
- `belonging_rating` matches what you selected (1-5)
- `category_name` matches selected category
- `is_primary` = true

```sql
-- Check document_tags table
SELECT 
    dt.id,
    t.name as tag_name,
    td.name as dimension_name,
    dt.is_custom_tag
FROM document_tags dt
LEFT JOIN tags t ON t.id = dt.tag_id
LEFT JOIN tag_dimensions td ON td.id = dt.dimension_id
WHERE dt.workflow_session_id = 'YOUR_WORKFLOW_ID_FROM_ABOVE'
ORDER BY td.sort_order, t.name;
```

**Expected Result:**
- Number of rows matches number of tags you selected
- All dimension names appear (authorship, disclosure-risk, intended-use, etc.)
- All tag names match your selections
- `is_custom_tag` = false for standard tags

**✅ Pass Criteria:**
- [ ] All form inputs appear in normalized tables
- [ ] Belonging rating is correct
- [ ] Category is correct
- [ ] All tags are recorded
- [ ] Foreign key relationships are intact
- [ ] Timestamps are populated

**❌ Fail Indicators:**
- Missing data in any table
- Null foreign keys
- Wrong values stored
- Database constraint violations

---

### Test 2: Display Data from Normalized Tables (Read & Display)

**Objective:** Verify the completion page displays data fetched from normalized database tables

**Steps:**
1. After completing Test 1, observe the URL in the browser
2. Note the URL should include `?workflowId={some-uuid}`
3. Verify the completion page displays:
   - Document title
   - Belonging rating (e.g., "4/5 - Strong relationship")
   - Primary category name
   - All selected tags grouped by dimension
   - Tag counts per dimension

**Validation Points:**

Compare displayed data against database:

```sql
-- Get complete workflow data for display verification
SELECT 
    -- Category data
    c.name as displayed_category,
    dc.belonging_rating as displayed_rating,
    -- Tags data
    (SELECT COUNT(*) FROM document_tags WHERE workflow_session_id = 'YOUR_WORKFLOW_ID') as total_tags,
    (SELECT COUNT(DISTINCT dimension_id) FROM document_tags WHERE workflow_session_id = 'YOUR_WORKFLOW_ID') as dimension_count
FROM workflow_sessions ws
LEFT JOIN document_categories dc ON dc.workflow_session_id = ws.id
LEFT JOIN categories c ON c.id = dc.category_id
WHERE ws.id = 'YOUR_WORKFLOW_ID';
```

**Expected Result:**
- Category name on page matches `displayed_category` from query
- Rating on page matches `displayed_rating` from query
- Tag count on page matches `total_tags` from query
- Dimension count matches `dimension_count` from query

**✅ Pass Criteria:**
- [ ] Category displayed correctly
- [ ] Belonging rating displayed correctly
- [ ] All tags display in correct dimensions
- [ ] Tag counts are accurate
- [ ] No "undefined" or null values shown
- [ ] Data is from database, not in-memory store

**❌ Fail Indicators:**
- Display shows different data than database
- Missing tags or categories
- Showing mock data instead of real data
- "Loading..." stuck or errors

---

### Test 3: Page Refresh Persistence

**Objective:** Verify data persists after page refresh (proving it's from database, not memory)

**Steps:**
1. From Test 2, note all displayed data (category, rating, tags)
2. Press F5 or Ctrl+R to refresh the page
3. Wait for page to reload completely
4. Compare displayed data after refresh

**✅ Pass Criteria:**
- [ ] All data remains identical after refresh
- [ ] No loss of information
- [ ] Page loads successfully
- [ ] Same workflow ID in URL
- [ ] No errors in browser console

**❌ Fail Indicators:**
- Data disappears after refresh
- Page shows different/mock data
- Console errors appear
- Redirect to different page

---

### Test 4: Feature Flag Toggle

**Objective:** Verify backward compatibility with JSONB storage

**Steps:**
1. Set `NEXT_PUBLIC_USE_NORMALIZED_TAGS=false` in `.env.local`
2. Restart development server
3. Complete a new workflow (Steps A → B → C)
4. Submit workflow

**Validation Points:**

Check that data is written to JSONB fields:

```sql
-- Check JSONB storage (legacy mode)
SELECT 
    id,
    step,
    is_draft,
    selected_category_id,
    selected_tags,  -- Should be populated (JSONB)
    custom_tags,    -- Should be populated (JSONB)
    belonging_rating
FROM workflow_sessions
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- `selected_tags` is populated with JSONB data
- `custom_tags` is populated (if custom tags used)
- Data is NOT in `document_categories` or `document_tags` tables

**Then:**
5. Set `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true` again
6. Restart development server
7. Complete another workflow
8. Verify data goes to normalized tables (repeat Test 1 queries)

**✅ Pass Criteria:**
- [ ] Legacy mode writes to JSONB fields
- [ ] Normalized mode writes to junction tables
- [ ] Feature flag controls behavior correctly
- [ ] No errors in either mode
- [ ] System works in both modes

**❌ Fail Indicators:**
- Feature flag has no effect
- Errors when toggling modes
- Data written to wrong location
- Partial writes (some JSONB, some normalized)

---

### Test 5: Custom Tags Creation

**Objective:** Verify custom tags are created as first-class entities

**Steps:**
1. Complete workflow Steps A → B
2. In Step C, create a custom tag:
   - Select a dimension (e.g., "Evidence Type")
   - Click "Add Custom Tag"
   - Enter name: "Test Custom Tag XYZ"
   - Enter description: "Testing custom tag functionality"
   - Save and add to selection
3. Complete workflow and submit

**Validation Points:**

```sql
-- Check custom_tags table
SELECT 
    ct.id,
    ct.name,
    ct.description,
    td.name as dimension,
    ct.usage_count,
    ct.created_at
FROM custom_tags ct
LEFT JOIN tag_dimensions td ON td.id = ct.dimension_id
WHERE ct.name = 'Test Custom Tag XYZ'
ORDER BY ct.created_at DESC
LIMIT 1;
```

**Expected Result:**
- Custom tag exists in `custom_tags` table
- Name and description match what you entered
- `usage_count` = 1 (or incremented if reused)
- Dimension is correct

```sql
-- Check custom tag assignment
SELECT 
    dt.id,
    dt.is_custom_tag,
    ct.name as custom_tag_name
FROM document_tags dt
LEFT JOIN custom_tags ct ON ct.id = dt.tag_id
WHERE dt.is_custom_tag = true
AND dt.workflow_session_id = 'YOUR_WORKFLOW_ID'
ORDER BY dt.assigned_at DESC;
```

**Expected Result:**
- Row exists in `document_tags`
- `is_custom_tag` = true
- Custom tag name appears

**✅ Pass Criteria:**
- [ ] Custom tag created in `custom_tags` table
- [ ] Custom tag linked in `document_tags` table
- [ ] `is_custom_tag` flag is true
- [ ] Custom tag displays on completion page
- [ ] Usage count increments if reused

**❌ Fail Indicators:**
- Custom tag not saved
- Not appearing in either table
- Stored as JSONB instead of normalized
- Display shows "undefined"

---

### Test 6: Error Handling

**Objective:** Verify system handles errors gracefully

**Test 6A: Invalid Workflow ID**

**Steps:**
1. Navigate to: `/workflow/doc-1/complete?workflowId=invalid-uuid-123`
2. Observe behavior

**Expected Result:**
- Error message displayed or redirect to safe page
- No application crash
- Console shows appropriate error log
- User can navigate away

**Test 6B: Missing Authentication**

**Steps:**
1. Sign out of application
2. Try to access workflow completion URL
3. Observe behavior

**Expected Result:**
- Redirect to login page
- Or "Authentication required" message
- No data exposure

**Test 6C: Incomplete Form Submission**

**Steps:**
1. Start workflow but skip required fields
2. Try to submit
3. Observe validation

**Expected Result:**
- Validation errors shown
- Cannot proceed without required fields
- No partial data written to database

**✅ Pass Criteria:**
- [ ] Invalid workflow ID handled gracefully
- [ ] Missing auth redirects appropriately
- [ ] Validation prevents incomplete submissions
- [ ] Appropriate error messages shown
- [ ] No application crashes

**❌ Fail Indicators:**
- Application crashes or white screen
- Exposed error stack traces to user
- Partial/corrupted data in database
- No validation on required fields

---

### Test 7: Data Consistency Check

**Objective:** Verify data integrity across all tables

**Validation Query:**

```sql
-- Comprehensive data consistency check
WITH workflow_data AS (
  SELECT 
    ws.id as workflow_id,
    ws.document_id,
    ws.user_id,
    ws.step,
    ws.is_draft
  FROM workflow_sessions ws
  WHERE ws.step = 'complete' 
  AND ws.is_draft = false
  ORDER BY ws.created_at DESC
  LIMIT 5
)
SELECT 
  wd.workflow_id,
  wd.document_id,
  -- Check category exists
  CASE WHEN dc.id IS NOT NULL THEN '✓' ELSE '✗' END as has_category,
  -- Check tags exist
  CASE WHEN tag_count > 0 THEN '✓' ELSE '✗' END as has_tags,
  -- Check required dimensions covered
  CASE WHEN required_dims >= 3 THEN '✓' ELSE '✗' END as required_dims_ok,
  -- Counts
  COALESCE(tag_count, 0) as total_tags,
  COALESCE(required_dims, 0) as required_dimension_count
FROM workflow_data wd
LEFT JOIN document_categories dc ON dc.workflow_session_id = wd.workflow_id
LEFT JOIN (
  SELECT 
    workflow_session_id,
    COUNT(*) as tag_count,
    COUNT(DISTINCT CASE WHEN td.required = true THEN dt.dimension_id END) as required_dims
  FROM document_tags dt
  LEFT JOIN tag_dimensions td ON td.id = dt.dimension_id
  GROUP BY workflow_session_id
) tag_summary ON tag_summary.workflow_session_id = wd.workflow_id
ORDER BY wd.workflow_id DESC;
```

**Expected Result:**
- All workflows show '✓' for has_category
- All workflows show '✓' for has_tags
- All workflows show '✓' for required_dims_ok
- No orphaned records
- All foreign keys valid

**✅ Pass Criteria:**
- [ ] All completed workflows have categories
- [ ] All completed workflows have tags
- [ ] Required dimensions are filled
- [ ] No orphaned records
- [ ] Foreign key integrity maintained

**❌ Fail Indicators:**
- Missing categories or tags
- Orphaned records (FK violations)
- Required dimensions not covered
- Data inconsistencies

---

## Test Result Report Format

**WRITE YOUR TEST RESULTS TO:** `pmc\context-ai\pmct\08-categ-db-validation-test-results_v1.md`

After completing all tests, document results in the file above using this format:

```markdown
# Normalized Database Implementation - Test Results

**Date:** [Current Date]
**Tester:** [Your Name/AI Agent]
**Environment:** [Development/Staging]
**Feature Flag:** `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true`

## Summary

- Total Tests: 7
- Passed: X
- Failed: Y
- Warnings: Z

## Test Results

### ✅ Test 1: Complete Workflow Submission
- Status: PASS/FAIL
- Findings: [Brief description]
- Evidence: [SQL query results or screenshot reference]

### ✅ Test 2: Display Data from Normalized Tables
- Status: PASS/FAIL
- Findings: [Brief description]
- Evidence: [Comparison of displayed vs database data]

### ✅ Test 3: Page Refresh Persistence
- Status: PASS/FAIL
- Findings: [Brief description]

### ✅ Test 4: Feature Flag Toggle
- Status: PASS/FAIL
- Findings: [Brief description]
- Evidence: [JSONB vs normalized data comparison]

### ✅ Test 5: Custom Tags Creation
- Status: PASS/FAIL
- Findings: [Brief description]
- Evidence: [Custom tag database records]

### ✅ Test 6: Error Handling
- Status: PASS/FAIL
- Findings: [Brief description]

### ✅ Test 7: Data Consistency Check
- Status: PASS/FAIL
- Findings: [Brief description]
- Evidence: [Consistency query results]

## Critical Issues

[List any blocking issues that prevent release]

## Non-Critical Issues

[List minor issues or improvements needed]

## Recommendations

[Provide recommendations for:
- Production readiness
- Additional testing needed
- Performance considerations
- Migration of historical data]

## Sign-off

- [ ] All critical tests passed
- [ ] No data loss or corruption
- [ ] Performance is acceptable
- [ ] Ready for production deployment

**Approved by:** _______________
**Date:** _______________
```

## Important Notes for Testing Agent

1. **Create Results File First:** Before starting tests, create the file `pmc\context-ai\pmct\08-categ-db-validation-test-results_v1.md` and copy the report format template into it

2. **Update After Each Test:** After completing each test scenario, immediately update the results file with your findings

3. **Replace Placeholders:** Throughout testing, replace `YOUR_WORKFLOW_ID` with actual workflow IDs from your test runs

4. **Document Everything:** Include SQL results, screenshots references, and observations in the results file

5. **Test Incrementally:** Complete one test before moving to the next

6. **Check Console:** Always monitor browser console for JavaScript errors and document any errors in the results file

7. **Check Server Logs:** Monitor Next.js server output for backend errors and document in results file

8. **Database State:** After each test, verify database state with provided SQL queries and paste results into the results file

9. **Clean Test Data:** Consider starting with a fresh database or clearly mark test records

10. **Multiple Workflows:** Run at least 2-3 complete workflows to test consistency

11. **Evidence Required:** For each test, include concrete evidence in the results file (SQL output, error messages, data comparisons)

## Success Definition

Implementation is considered **COMPLETE AND VALIDATED** when:

✅ All 7 test scenarios pass  
✅ No critical issues identified  
✅ Data writes correctly to normalized tables  
✅ Display shows data from database  
✅ Page refresh maintains all data  
✅ Feature flag works correctly  
✅ Custom tags function properly  
✅ Error handling is graceful  
✅ Data consistency maintained  

Implementation is considered **NOT READY** if:

❌ Any critical test fails  
❌ Data loss occurs  
❌ Display shows mock/wrong data  
❌ Page refresh loses information  
❌ Database constraints violated  
❌ Application crashes  

---

## Final Deliverable

Upon completion of all testing, ensure the test results file `pmc\context-ai\pmct\08-categ-db-validation-test-results_v1.md` contains:

1. ✅ Complete test results for all 7 scenarios
2. ✅ Pass/Fail status for each test
3. ✅ Evidence (SQL results, observations, error messages)
4. ✅ Summary of critical and non-critical issues
5. ✅ Recommendations for production readiness
6. ✅ Sign-off section completed

The test results file is the **official record** of validation and will be used to determine if the implementation is ready for production deployment.

···············································································································
**VALIDATION PROMPT END**
···············································································································

---

## Production Verification Query

**Purpose:** Display complete results of the latest Category Module submission  
**Date Added:** October 3, 2025  
**Usage:** Copy and paste into Supabase SQL Editor to verify workflow submission data

This query displays the most recent completed workflow submission across 3 organized output tables:
- **Table 1:** Document & Workflow Session Information
- **Table 2:** Panel A (Belonging Rating) & Panel B (Primary Category)
- **Table 3:** Panel C (All Tags by Dimension)

```sql
-- ============================================================================
-- CATEGORY MODULE - LATEST SUBMISSION VERIFICATION QUERY
-- Displays complete results from the most recent workflow submission
-- Shows all data from Panels A, B, and C in organized output tables
-- ============================================================================

-- ============================================================================
-- TABLE 1: DOCUMENT & WORKFLOW SESSION INFORMATION
-- ============================================================================
WITH latest_workflow AS (
  SELECT 
    ws.id           AS workflow_id,
    ws.document_id,
    ws.user_id,
    ws.step,
    ws.is_draft,
    ws.completed_at,
    ws.created_at,
    ws.updated_at,
    d.title         AS document_title,
    d.summary       AS document_summary,
    d.status        AS document_status
  FROM public.workflow_sessions ws
  JOIN public.documents d ON d.id = ws.document_id
  WHERE ws.is_draft = false
  ORDER BY ws.completed_at DESC NULLS LAST
  LIMIT 1
)

SELECT 
  '=== DOCUMENT & SESSION INFO ==='::text AS section,
  lw.document_title                       AS document_title,
  lw.document_summary                     AS document_summary,
  lw.workflow_id::text                    AS workflow_id,
  lw.user_id::text                        AS user_id,
  to_char(lw.completed_at, 'YYYY-MM-DD HH24:MI:SS') AS completed_at,
  lw.step::text                           AS final_step,
  lw.document_status::text                AS document_status
FROM latest_workflow lw

UNION ALL

SELECT 
  '=== NO DATA ==='::text,
  'No completed workflows found'::text,
  'Submit a workflow to see results'::text,
  NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM latest_workflow);

-- ============================================================================
-- TABLE 2: PANEL A (BELONGING RATING) & PANEL B (PRIMARY CATEGORY)
-- ============================================================================
WITH latest_workflow AS (
  SELECT 
    ws.id           AS workflow_id,
    ws.document_id,
    d.title         AS document_title
  FROM public.workflow_sessions ws
  JOIN public.documents d ON d.id = ws.document_id
  WHERE ws.is_draft = false
  ORDER BY ws.completed_at DESC NULLS LAST
  LIMIT 1
)

SELECT 
  '=== PANEL A: BELONGING RATING ==='::text AS section,
  lw.document_title                         AS document,
  'Rating: ' || dc.belonging_rating || '/5' AS panel_a_data,
  CASE 
    WHEN dc.belonging_rating >= 4 THEN '✅ Strong Belonging'
    WHEN dc.belonging_rating = 3 THEN '⚠️ Moderate Belonging'
    ELSE '❌ Weak Belonging'
  END AS assessment,
  NULL::text AS extra_info
FROM latest_workflow lw
JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true

UNION ALL

SELECT 
  '=== PANEL B: PRIMARY CATEGORY ==='::text,
  lw.document_title,
  'Category: ' || c.name,
  'Slug: ' || c.slug,
  'ID: ' || c.id::text
FROM latest_workflow lw
JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true
JOIN public.categories c ON c.id = dc.category_id

UNION ALL

SELECT 
  '=== NO DATA ==='::text,
  'No completed workflows found'::text,
  NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM latest_workflow);

-- ============================================================================
-- TABLE 3: PANEL C (ALL TAGS BY DIMENSION)
-- ============================================================================
WITH latest_workflow AS (
  SELECT 
    ws.id           AS workflow_id,
    ws.document_id,
    d.title         AS document_title
  FROM public.workflow_sessions ws
  JOIN public.documents d ON d.id = ws.document_id
  WHERE ws.is_draft = false
  ORDER BY ws.completed_at DESC NULLS LAST
  LIMIT 1
)

SELECT 
  '=== PANEL C: TAGS & METADATA ==='::text AS section,
  td.name || ' (' || td.key || ')'        AS dimension,
  COALESCE(t.name, ct.name, '(unknown)')  AS tag_name,
  CASE 
    WHEN dt.is_custom_tag THEN '🏷️ CUSTOM TAG'
    ELSE '📌 STANDARD TAG'
  END AS tag_type,
  COALESCE(t.slug, ct.slug, 'N/A')        AS tag_slug,
  COALESCE(t.id::text, ct.id::text, 'N/A') AS tag_id
FROM latest_workflow lw
JOIN public.document_tags dt ON dt.workflow_session_id = lw.workflow_id
JOIN public.tag_dimensions td ON td.id = dt.dimension_id
LEFT JOIN public.tags t ON t.id = dt.tag_id AND dt.is_custom_tag = false
LEFT JOIN public.custom_tags ct ON ct.id = dt.tag_id AND dt.is_custom_tag = true

UNION ALL

-- Tag count summary
SELECT 
  '=== TAG SUMMARY ==='::text,
  'Total Tags Assigned: ' || COUNT(*)::text,
  'Standard Tags: ' || SUM(CASE WHEN dt.is_custom_tag = false THEN 1 ELSE 0 END)::text,
  'Custom Tags: ' || SUM(CASE WHEN dt.is_custom_tag = true THEN 1 ELSE 0 END)::text,
  'Dimensions Used: ' || COUNT(DISTINCT dt.dimension_id)::text,
  NULL
FROM latest_workflow lw
JOIN public.document_tags dt ON dt.workflow_session_id = lw.workflow_id

UNION ALL

SELECT 
  '=== NO DATA ==='::text,
  'No completed workflows found'::text,
  NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM latest_workflow)
  AND NOT EXISTS (
    SELECT 1 FROM latest_workflow lw
    JOIN public.document_tags dt ON dt.workflow_session_id = lw.workflow_id
  )

ORDER BY section DESC, dimension, tag_name;

-- ============================================================================
-- QUERY COMPLETE
-- ============================================================================
-- EXPECTED OUTPUT:
-- - Table 1: Document title, workflow ID, completion timestamp
-- - Table 2: Belonging rating (1-5) and primary category assignment
-- - Table 3: All tags grouped by dimension with tag type indicators
-- ============================================================================
```

### Query Features

✅ **Comprehensive Coverage:** Shows all data from Category Module Panels A, B, and C  
✅ **Organized Output:** Three distinct result tables for easy reading  
✅ **Handles Empty State:** Shows informative message if no completed workflows exist  
✅ **Visual Indicators:** Uses emoji markers for tag types and belonging assessment  
✅ **Detailed Metadata:** Includes IDs, slugs, and timestamps for debugging  
✅ **Tag Summary:** Provides count breakdown of standard vs custom tags

### How to Use

1. Copy the entire SQL query above
2. Open Supabase SQL Editor
3. Paste and execute
4. Review the three output tables in the Results grid

### Expected Results Structure

**Table 1 - Document & Session Info:**
- Document title and summary
- Workflow ID and user ID
- Completion timestamp
- Document status

**Table 2 - Panels A & B:**
- Panel A: Belonging rating with assessment
- Panel B: Primary category selection with details

**Table 3 - Panel C:**
- All assigned tags organized by dimension
- Tag type indicators (standard vs custom)
- Tag slugs and IDs
- Summary statistics

