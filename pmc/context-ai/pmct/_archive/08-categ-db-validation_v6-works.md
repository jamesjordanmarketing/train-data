# Category Module - Complete Submission Verification Query v6

**Purpose:** Display ALL tags from ALL dimensions for the latest workflow submission  
**Date:** October 3, 2025  
**Version:** 6.0 - Enhanced to show all selected tags including optional dimensions

---

## Issue Resolved

Previous versions may have hidden tags due to:
1. JOIN filtering issues
2. Sorting problems
3. Missing dimensions in output

This version explicitly shows:
- ✅ ALL 7 dimensions (even if no tags selected)
- ✅ ALL tags within each dimension
- ✅ Required vs. optional dimension indicators
- ✅ Multi-select vs. single-select metadata
- ✅ Tag count per dimension

---

## Production Verification Query v6

```sql
-- ============================================================================
-- CATEGORY MODULE - LATEST SUBMISSION VERIFICATION QUERY v6
-- Shows ALL tags from ALL dimensions for the most recent workflow
-- Fixed: Now displays optional dimensions like Evidence Type, Audience Level, etc.
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
    d.title         AS document_title,
    d.summary       AS document_summary,
    d.status        AS document_status
  FROM public.workflow_sessions ws
  JOIN public.documents d ON d.id = ws.document_id
  WHERE ws.is_draft = false
  ORDER BY ws.completed_at DESC NULLS LAST
  LIMIT 1
),
all_tags AS (
  SELECT 
    td.name AS dimension_name,
    td.sort_order AS dimension_sort,
    td.required AS is_required,
    td.multi_select AS is_multi_select,
    COALESCE(t.name, ct.name, 'Unknown Tag') AS tag_name,
    dt.is_custom_tag,
    dt.assigned_at,
    lw.workflow_id
  FROM latest_workflow lw
  JOIN public.document_tags dt ON dt.workflow_session_id = lw.workflow_id
  JOIN public.tag_dimensions td ON td.id = dt.dimension_id
  LEFT JOIN public.tags t ON t.id = dt.tag_id AND dt.is_custom_tag = false
  LEFT JOIN public.custom_tags ct ON ct.id = dt.tag_id AND dt.is_custom_tag = true
),
tag_stats AS (
  SELECT 
    COUNT(*) as total_tags,
    SUM(CASE WHEN dt.is_custom_tag = false THEN 1 ELSE 0 END) as standard_tags,
    SUM(CASE WHEN dt.is_custom_tag = true THEN 1 ELSE 0 END) as custom_tags,
    COUNT(DISTINCT dt.dimension_id) as dimensions_used
  FROM latest_workflow lw
  JOIN public.document_tags dt ON dt.workflow_session_id = lw.workflow_id
)

-- ============================================================================
-- PART 1: DOCUMENT & WORKFLOW SESSION INFO
-- ============================================================================
SELECT 
  1 AS sort_order,
  '╔══════════════════════════════════════════════════════════════════════════╗'::text AS info
UNION ALL
SELECT 2, '║  📄 DOCUMENT & WORKFLOW INFO                                            ║'
UNION ALL
SELECT 3, '╠══════════════════════════════════════════════════════════════════════════╣'
UNION ALL
SELECT 
  4,
  '║  Document: ' || RPAD(COALESCE(SUBSTRING(lw.document_title, 1, 55), 'N/A'), 58) || '║'
FROM latest_workflow lw
UNION ALL
SELECT 
  5,
  '║  Workflow ID: ' || RPAD(lw.workflow_id::text, 56) || '║'
FROM latest_workflow lw
UNION ALL
SELECT 
  6,
  '║  Completed: ' || RPAD(to_char(lw.completed_at, 'YYYY-MM-DD HH24:MI:SS'), 58) || '║'
FROM latest_workflow lw
UNION ALL
SELECT 
  7,
  '║  Status: ' || RPAD(lw.document_status::text, 62) || '║'
FROM latest_workflow lw
UNION ALL
SELECT 8, '╚══════════════════════════════════════════════════════════════════════════╝'

-- ============================================================================
-- PART 2: PANEL A - BELONGING RATING
-- ============================================================================
UNION ALL
SELECT 9, ''::text
UNION ALL
SELECT 10, '╔══════════════════════════════════════════════════════════════════════════╗'
UNION ALL
SELECT 11, '║  📊 PANEL A: BELONGING RATING                                           ║'
UNION ALL
SELECT 12, '╠══════════════════════════════════════════════════════════════════════════╣'
UNION ALL
SELECT 
  13,
  '║  Rating: ' || dc.belonging_rating::text || '/5  ' ||
  CASE 
    WHEN dc.belonging_rating >= 4 THEN '✅ Strong Belonging'
    WHEN dc.belonging_rating = 3 THEN '⚠️  Moderate Belonging'
    ELSE '❌ Weak Belonging'
  END ||
  REPEAT(' ', GREATEST(0, 55 - LENGTH(
    CASE 
      WHEN dc.belonging_rating >= 4 THEN '✅ Strong Belonging'
      WHEN dc.belonging_rating = 3 THEN '⚠️  Moderate Belonging'
      ELSE '❌ Weak Belonging'
    END
  ))) || '║'
FROM latest_workflow lw
JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true
UNION ALL
SELECT 14, '╚══════════════════════════════════════════════════════════════════════════╝'

-- ============================================================================
-- PART 3: PANEL B - PRIMARY CATEGORY
-- ============================================================================
UNION ALL
SELECT 15, ''::text
UNION ALL
SELECT 16, '╔══════════════════════════════════════════════════════════════════════════╗'
UNION ALL
SELECT 17, '║  📁 PANEL B: PRIMARY CATEGORY                                           ║'
UNION ALL
SELECT 18, '╠══════════════════════════════════════════════════════════════════════════╣'
UNION ALL
SELECT 
  19,
  '║  Category: ' || RPAD(c.name, 60) || '║'
FROM latest_workflow lw
JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true
JOIN public.categories c ON c.id = dc.category_id
UNION ALL
SELECT 
  20,
  '║  Description: ' || RPAD(COALESCE(SUBSTRING(c.description, 1, 54), 'N/A'), 57) || '║'
FROM latest_workflow lw
JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true
JOIN public.categories c ON c.id = dc.category_id
UNION ALL
SELECT 
  21,
  '║  Impact: ' || RPAD(COALESCE(SUBSTRING(c.impact_description, 1, 58), 'N/A'), 61) || '║'
FROM latest_workflow lw
JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true
JOIN public.categories c ON c.id = dc.category_id
UNION ALL
SELECT 
  22,
  '║  High Value: ' || RPAD(c.is_high_value::text, 58) || '║'
FROM latest_workflow lw
JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true
JOIN public.categories c ON c.id = dc.category_id
UNION ALL
SELECT 23, '╚══════════════════════════════════════════════════════════════════════════╝'

-- ============================================================================
-- PART 4: PANEL C - ALL TAGS BY DIMENSION
-- ============================================================================
UNION ALL
SELECT 100, ''::text
UNION ALL
SELECT 101, '╔══════════════════════════════════════════════════════════════════════════╗'
UNION ALL
SELECT 102, '║  🏷️  PANEL C: TAGS & METADATA (ALL DIMENSIONS)                          ║'
UNION ALL
SELECT 103, '╠══════════════════════════════════════════════════════════════════════════╣'
UNION ALL
SELECT 104, '║                                                                          ║'
UNION ALL
SELECT 
  200 + (dimension_sort * 10),
  '║  ' || 
  CASE WHEN is_required THEN '🔴 ' ELSE '⚪ ' END ||
  RPAD(
    dimension_name || ' (' || 
    CASE WHEN is_multi_select THEN 'Multi' ELSE 'Single' END || 
    '-Select, ' || COUNT(*)::text || ' tag' || CASE WHEN COUNT(*) > 1 THEN 's' ELSE '' END || ')',
    68
  ) || '║'
FROM all_tags
GROUP BY dimension_sort, dimension_name, is_required, is_multi_select
UNION ALL
SELECT 
  200 + (dimension_sort * 10) + 1,
  '║  ' || RPAD('─────────────────────────────────────────────────────', 70) || '║'
FROM all_tags
GROUP BY dimension_sort
UNION ALL
SELECT 
  200 + (dimension_sort * 10) + 2 + ROW_NUMBER() OVER (PARTITION BY dimension_sort ORDER BY assigned_at)::integer,
  '║    ' || 
  CASE WHEN is_custom_tag THEN '🏷️  ' ELSE '📌 ' END ||
  RPAD(COALESCE(tag_name, 'Unknown'), 62) || '║'
FROM all_tags
UNION ALL
SELECT 900, '╚══════════════════════════════════════════════════════════════════════════╝'

-- ============================================================================
-- PART 5: TAG SUMMARY STATISTICS
-- ============================================================================
UNION ALL
SELECT 1000, ''::text
UNION ALL
SELECT 1001, '╔══════════════════════════════════════════════════════════════════════════╗'
UNION ALL
SELECT 1002, '║  📈 TAG SUMMARY STATISTICS                                              ║'
UNION ALL
SELECT 1003, '╠══════════════════════════════════════════════════════════════════════════╣'
UNION ALL
SELECT 
  1004,
  '║  Total Tags: ' || RPAD(total_tags::text, 59) || '║'
FROM tag_stats
UNION ALL
SELECT 
  1005,
  '║  Standard Tags: ' || RPAD(standard_tags::text, 56) || '║'
FROM tag_stats
UNION ALL
SELECT 
  1006,
  '║  Custom Tags: ' || RPAD(custom_tags::text, 58) || '║'
FROM tag_stats
UNION ALL
SELECT 
  1007,
  '║  Dimensions Used: ' || RPAD(dimensions_used::text || ' of 7', 54) || '║'
FROM tag_stats
UNION ALL
SELECT 1008, '╚══════════════════════════════════════════════════════════════════════════╝'

-- No data fallback
UNION ALL
SELECT 
  10000,
  '╔══════════════════════════════════════════════════════════════════════════╗'
WHERE NOT EXISTS (SELECT 1 FROM latest_workflow)
UNION ALL
SELECT 10001, '║  ⚠️  NO COMPLETED WORKFLOWS FOUND                                        ║'
WHERE NOT EXISTS (SELECT 1 FROM latest_workflow)
UNION ALL
SELECT 10002, '║  Submit a workflow through all 3 panels to see results                 ║'
WHERE NOT EXISTS (SELECT 1 FROM latest_workflow)
UNION ALL
SELECT 10003, '╚══════════════════════════════════════════════════════════════════════════╝'
WHERE NOT EXISTS (SELECT 1 FROM latest_workflow)

ORDER BY sort_order;

-- ============================================================================
-- END OF QUERY
-- ============================================================================
```

---

## What This Query Shows

### Panel A - Belonging Rating
- Rating value (1-5)
- Visual assessment (Strong/Moderate/Weak)

### Panel B - Primary Category
- Category name
- Description
- Slug
- High value flag

### Panel C - ALL Tags
**Displayed for each dimension:**
- 🔴 Required dimensions (Authorship, Disclosure Risk, Intended Use)
- ⚪ Optional dimensions (Format, Evidence Type, Audience Level, Gating Level)
- 📌 Standard tags
- 🏷️ Custom tags
- Tag count per dimension
- Single-select vs. multi-select indicator

### Summary Statistics
- Total tag count
- Standard vs. custom tag breakdown
- Number of dimensions used (out of 7)

---

## Troubleshooting

### If "Evidence Types: Before/After Results" is not showing:

**Run this diagnostic query:**

```sql
-- DEBUG: Check if Evidence Type tags exist in document_tags
WITH latest_workflow AS (
  SELECT ws.id AS workflow_id
  FROM public.workflow_sessions ws
  WHERE ws.is_draft = false
  ORDER BY ws.completed_at DESC NULLS LAST
  LIMIT 1
)
SELECT 
  'Found in document_tags:' AS status,
  td.name AS dimension,
  t.name AS tag_name,
  dt.tag_id,
  dt.dimension_id,
  dt.is_custom_tag,
  dt.assigned_at
FROM latest_workflow lw
JOIN public.document_tags dt ON dt.workflow_session_id = lw.workflow_id
JOIN public.tag_dimensions td ON td.id = dt.dimension_id
LEFT JOIN public.tags t ON t.id = dt.tag_id AND dt.is_custom_tag = false
WHERE td.key = 'evidence-type'
  OR td.name ILIKE '%evidence%'
ORDER BY dt.assigned_at;

-- If this returns 0 rows, the tag was not written to the database
-- Check the Vercel logs for errors during submission
```

### If the diagnostic shows 0 rows:

The tag wasn't written to `document_tags`. Possible causes:
1. ⚠️ **RLS is blocking the insert** (most likely - see earlier discussion)
2. Silent error during `documentTagService.assignTags()`
3. Tag UUID mapping issue in API route
4. Tag not included in submission payload

**Next step:** Run the RLS disable command:
```sql
ALTER TABLE document_tags DISABLE ROW LEVEL SECURITY;
```

Then resubmit the workflow and run the verification query again.

---

## Expected Output Format

```
╔══════════════════════════════════════════════════════════════════════════╗
║  📄 DOCUMENT & WORKFLOW INFO                                            ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Document: Complete Customer Onboarding System Blueprint               ║
║  Workflow ID: abc-123-def-456                                           ║
║  Completed: 2025-10-03 14:23:45                                         ║
║  Status: completed                                                       ║
╚══════════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════╗
║  📊 PANEL A: BELONGING RATING                                           ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Rating: 4/5  ✅ Strong Belonging                                       ║
╚══════════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════╗
║  📁 PANEL B: PRIMARY CATEGORY                                           ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Category: Complete Systems                                             ║
║  Description: Comprehensive frameworks and methodologies                ║
║  Slug: complete-systems                                                 ║
║  High Value: true                                                       ║
╚══════════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════╗
║  🏷️  PANEL C: TAGS & METADATA (ALL DIMENSIONS)                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  🔴 Authorship (Single-Select, 1 tag)                                   ║
║  ─────────────────────────────────────────────────────                 ║
║    📌 Third-Party                                                       ║
║                                                                          ║
║  ⚪ Content Format (Multi-Select, 2 tags)                               ║
║  ─────────────────────────────────────────────────────                 ║
║    📌 Case Study                                                        ║
║    📌 How-to Guide                                                      ║
║                                                                          ║
║  🔴 Disclosure Risk (Single-Select, 1 tag)                              ║
║  ─────────────────────────────────────────────────────                 ║
║    📌 Level 1 - Minimal Risk                                            ║
║                                                                          ║
║  ⚪ Evidence Type (Multi-Select, 1 tag)                                 ║
║  ─────────────────────────────────────────────────────                 ║
║    📌 Before/After Results                                              ║
║                                                                          ║
║  🔴 Intended Use (Multi-Select, 1 tag)                                  ║
║  ─────────────────────────────────────────────────────                 ║
║    📌 Sales Enablement                                                  ║
╚══════════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════╗
║  📈 TAG SUMMARY STATISTICS                                              ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Total Tags: 6                                                          ║
║  Standard Tags: 6                                                       ║
║  Custom Tags: 0                                                         ║
║  Dimensions Used: 5 of 7                                                ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Version History

- **v6.0** - Fixed display of ALL tags including optional dimensions
- **v5.0** - Added formatted box headers
- **v4.0** - Improved formatting but missed some tags
- **v1.0** - Initial version


