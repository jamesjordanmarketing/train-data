```sql
-- ============================================================================
-- CATEGORY MODULE - LATEST SUBMISSION VERIFICATION QUERY v4
-- Displays complete results from the most recent workflow submission
-- Shows all data from Panels A, B, and C in organized output tables
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

-- ============================================================================
-- HEADER: DOCUMENT NAME & TIMESTAMP
-- ============================================================================
SELECT 
  '╔════════════════════════════════════════════════════════════════════════════════╗'::text AS section,
  NULL::text AS col2,
  NULL::text AS col3,
  NULL::text AS col4,
  NULL::text AS col5,
  NULL::text AS col6
FROM latest_workflow

UNION ALL

SELECT 
  '║  📄 DOCUMENT: ' || lw.document_title || REPEAT(' ', GREATEST(0, 60 - LENGTH(lw.document_title))) || '║',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow lw

UNION ALL

SELECT 
  '║  🕒 CATEGORIZED: ' || to_char(dc.assigned_at, 'YYYY-MM-DD HH24:MI:SS') || REPEAT(' ', 36) || '║',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow lw
JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true

UNION ALL

SELECT 
  '╚════════════════════════════════════════════════════════════════════════════════╝',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow

UNION ALL

SELECT 
  '',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow

UNION ALL

-- ============================================================================
-- TABLE 1: DOCUMENT & WORKFLOW SESSION INFORMATION
-- ============================================================================
SELECT 
  '=== DOCUMENT & SESSION INFO ==='::text AS section,
  'Title: ' || lw.document_title          AS col2,
  'Summary: ' || COALESCE(SUBSTRING(lw.document_summary, 1, 50), 'N/A') AS col3,
  'Workflow ID: ' || lw.workflow_id::text AS col4,
  'User ID: ' || lw.user_id::text         AS col5,
  'Completed: ' || to_char(lw.completed_at, 'YYYY-MM-DD HH24:MI:SS') AS col6
FROM latest_workflow lw

UNION ALL

SELECT 
  '',
  'Step: ' || lw.step::text,
  'Status: ' || lw.document_status::text,
  'Created: ' || to_char(lw.created_at, 'YYYY-MM-DD HH24:MI:SS'),
  NULL,
  NULL
FROM latest_workflow lw

UNION ALL

SELECT 
  '',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow

UNION ALL

-- ============================================================================
-- TABLE 2: PANEL A (BELONGING RATING) & PANEL B (PRIMARY CATEGORY)
-- ============================================================================
SELECT 
  '=== PANEL A: BELONGING RATING ==='::text AS section,
  lw.document_title                         AS col2,
  'Rating: ' || dc.belonging_rating || '/5' AS col3,
  CASE 
    WHEN dc.belonging_rating >= 4 THEN '✅ Strong Belonging'
    WHEN dc.belonging_rating = 3 THEN '⚠️ Moderate Belonging'
    ELSE '❌ Weak Belonging'
  END AS col4,
  NULL::text AS col5,
  NULL::text AS col6
FROM latest_workflow lw
JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true

UNION ALL

SELECT 
  '',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow

UNION ALL

SELECT 
  '=== PANEL B: PRIMARY CATEGORY ==='::text,
  lw.document_title,
  'Category: ' || c.name,
  'Description: ' || COALESCE(SUBSTRING(c.description, 1, 50), 'N/A'),
  'ID: ' || c.id::text,
  'High Value: ' || c.is_high_value::text
FROM latest_workflow lw
JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true
JOIN public.categories c ON c.id = dc.category_id

UNION ALL

SELECT 
  '',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow

UNION ALL

-- ============================================================================
-- TABLE 3: PANEL C (ALL TAGS BY DIMENSION)
-- ============================================================================
SELECT 
  '=== PANEL C: TAGS & METADATA ==='::text AS section,
  td.name || ' (Sort: ' || td.sort_order::text || ')'  AS col2,
  COALESCE(t.name, ct.name, '(unknown)')  AS col3,
  CASE 
    WHEN dt.is_custom_tag THEN '🏷️ CUSTOM TAG'
    ELSE '📌 STANDARD TAG'
  END AS col4,
  COALESCE(
    SUBSTRING(t.description, 1, 50),
    SUBSTRING(ct.description, 1, 50),
    'N/A'
  ) AS col5,
  COALESCE(t.id::text, ct.id::text, 'N/A') AS col6
FROM latest_workflow lw
JOIN public.document_tags dt ON dt.workflow_session_id = lw.workflow_id
JOIN public.tag_dimensions td ON td.id = dt.dimension_id
LEFT JOIN public.tags t ON t.id = dt.tag_id AND dt.is_custom_tag = false
LEFT JOIN public.custom_tags ct ON ct.id = dt.tag_id AND dt.is_custom_tag = true

UNION ALL

SELECT 
  '',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow

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

-- No data fallback
SELECT 
  '=== NO DATA ==='::text,
  'No completed workflows found'::text,
  'Submit a workflow to see results'::text,
  NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM latest_workflow)

ORDER BY section DESC, col2, col3;

-- ============================================================================
-- QUERY COMPLETE
-- ============================================================================
-- EXPECTED OUTPUT:
-- - Header: Document name and category assignment timestamp in a box
-- - Table 1: Document & workflow session information
-- - Table 2: Belonging rating (Panel A) and primary category (Panel B)
-- - Table 3: All tags grouped by dimension with tag type indicators
-- - Summary: Tag counts and statistics
-- ============================================================================
```

