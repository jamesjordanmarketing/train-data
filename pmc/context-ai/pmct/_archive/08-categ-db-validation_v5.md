```sql
-- ============================================================================
-- CATEGORY MODULE - COMPLETE SUBMISSION VERIFICATION QUERY v5
-- Displays ALL results from the most recent workflow submission
-- Shows data from BOTH normalized tables AND legacy JSONB storage
-- Includes: Panels A, B, C + Legacy JSONB tags + Custom tags
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
    ws.selected_tags,     -- JSONB legacy storage
    ws.custom_tags,       -- JSONB custom tags
    d.title         AS document_title,
    d.summary       AS document_summary,
    d.status        AS document_status
  FROM public.workflow_sessions ws
  JOIN public.documents d ON d.id = ws.document_id
  WHERE ws.is_draft = false
  ORDER BY ws.completed_at DESC NULLS LAST
  LIMIT 1
),

-- Extract tags from JSONB legacy storage
legacy_tags AS (
  SELECT 
    lw.workflow_id,
    lw.document_id,
    dimension_key,
    tag_value,
    'LEGACY JSONB' as storage_type
  FROM latest_workflow lw,
  LATERAL jsonb_each_text(COALESCE(lw.selected_tags, '{}'::jsonb)) AS tags(dimension_key, tag_array),
  LATERAL jsonb_array_elements_text(tag_array::jsonb) AS tag_value
  WHERE lw.selected_tags IS NOT NULL
),

-- Extract custom tags from JSONB storage
custom_tags_jsonb AS (
  SELECT 
    lw.workflow_id,
    lw.document_id,
    custom_tag->>'dimensionId' as dimension_key,
    custom_tag->>'name' as tag_value,
    'CUSTOM JSONB' as storage_type,
    custom_tag->>'description' as tag_description
  FROM latest_workflow lw,
  LATERAL jsonb_array_elements(COALESCE(lw.custom_tags, '[]'::jsonb)) AS custom_tag
  WHERE lw.custom_tags IS NOT NULL
),

-- Get normalized tags from document_tags table
normalized_tags AS (
  SELECT 
    lw.workflow_id,
    lw.document_id,
    CASE dt.dimension_id
      WHEN '550e8400-e29b-41d4-a716-446655440003' THEN 'authorship'
      WHEN '550e8400-e29b-41d4-a716-446655440004' THEN 'format'
      WHEN '550e8400-e29b-41d4-a716-446655440005' THEN 'disclosure-risk'
      WHEN '550e8400-e29b-41d4-a716-446655440006' THEN 'intended-use'
      WHEN '550e8400-e29b-41d4-a716-446655440021' THEN 'evidence-type'
      WHEN '550e8400-e29b-41d4-a716-446655440022' THEN 'audience-level'
      WHEN '550e8400-e29b-41d4-a716-446655440023' THEN 'gating-level'
      ELSE dt.dimension_id::text
    END as dimension_key,
    COALESCE(t.name, ct.name, 'Unknown Tag') as tag_value,
    CASE 
      WHEN dt.is_custom_tag THEN 'NORMALIZED CUSTOM'
      ELSE 'NORMALIZED STANDARD'
    END as storage_type,
    COALESCE(t.description, ct.description, '') as tag_description
  FROM latest_workflow lw
  JOIN public.document_tags dt ON dt.workflow_session_id = lw.workflow_id
  LEFT JOIN public.tags t ON t.id = dt.tag_id AND dt.is_custom_tag = false
  LEFT JOIN public.custom_tags ct ON ct.id = dt.tag_id AND dt.is_custom_tag = true
),

-- Combine all tag sources
all_tags AS (
  SELECT workflow_id, document_id, dimension_key, tag_value, storage_type, NULL as tag_description
  FROM legacy_tags
  UNION ALL
  SELECT workflow_id, document_id, dimension_key, tag_value, storage_type, tag_description
  FROM custom_tags_jsonb
  UNION ALL
  SELECT workflow_id, document_id, dimension_key, tag_value, storage_type, tag_description
  FROM normalized_tags
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
LEFT JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true

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
  'Rating: ' || COALESCE(dc.belonging_rating::text, 'N/A') || '/5' AS col3,
  CASE 
    WHEN dc.belonging_rating >= 4 THEN '✅ Strong Belonging'
    WHEN dc.belonging_rating = 3 THEN '⚠️ Moderate Belonging'
    WHEN dc.belonging_rating IS NOT NULL THEN '❌ Weak Belonging'
    ELSE '❓ No Rating Found'
  END AS col4,
  NULL::text AS col5,
  NULL::text AS col6
FROM latest_workflow lw
LEFT JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true

UNION ALL

SELECT 
  '',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow

UNION ALL

SELECT 
  '=== PANEL B: PRIMARY CATEGORY ==='::text,
  lw.document_title,
  'Category: ' || COALESCE(c.name, 'No Category Found'),
  'Description: ' || COALESCE(SUBSTRING(c.description, 1, 50), 'N/A'),
  'ID: ' || COALESCE(c.id::text, 'N/A'),
  'High Value: ' || COALESCE(c.is_high_value::text, 'N/A')
FROM latest_workflow lw
LEFT JOIN public.document_categories dc ON dc.workflow_session_id = lw.workflow_id AND dc.is_primary = true
LEFT JOIN public.categories c ON c.id = dc.category_id

UNION ALL

SELECT 
  '',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow

UNION ALL

-- ============================================================================
-- TABLE 3: ALL TAGS FROM ALL SOURCES (NORMALIZED + LEGACY JSONB + CUSTOM)
-- ============================================================================
SELECT 
  '=== PANEL C: ALL TAGS (ALL SOURCES) ==='::text AS section,
  at.dimension_key || ' (' || at.storage_type || ')'  AS col2,
  at.tag_value  AS col3,
  CASE at.storage_type
    WHEN 'NORMALIZED STANDARD' THEN '📌 STANDARD (DB)'
    WHEN 'NORMALIZED CUSTOM' THEN '🏷️ CUSTOM (DB)'
    WHEN 'LEGACY JSONB' THEN '📦 LEGACY (JSONB)'
    WHEN 'CUSTOM JSONB' THEN '🏷️ CUSTOM (JSONB)'
    ELSE '❓ UNKNOWN'
  END AS col4,
  COALESCE(SUBSTRING(at.tag_description, 1, 50), 'N/A') AS col5,
  'Source: ' || at.storage_type AS col6
FROM all_tags at

UNION ALL

SELECT 
  '',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow

UNION ALL

-- ============================================================================
-- TABLE 4: TAG SUMMARY BY SOURCE
-- ============================================================================
SELECT 
  '=== TAG SUMMARY BY SOURCE ==='::text,
  'Total Tags: ' || COUNT(*)::text,
  'Normalized: ' || SUM(CASE WHEN storage_type LIKE 'NORMALIZED%' THEN 1 ELSE 0 END)::text,
  'Legacy JSONB: ' || SUM(CASE WHEN storage_type = 'LEGACY JSONB' THEN 1 ELSE 0 END)::text,
  'Custom JSONB: ' || SUM(CASE WHEN storage_type = 'CUSTOM JSONB' THEN 1 ELSE 0 END)::text,
  'Dimensions: ' || COUNT(DISTINCT dimension_key)::text
FROM all_tags

UNION ALL

SELECT 
  '',
  NULL, NULL, NULL, NULL, NULL
FROM latest_workflow

UNION ALL

-- ============================================================================
-- TABLE 5: EVIDENCE TYPES SPECIFICALLY (YOUR ISSUE)
-- ============================================================================
SELECT 
  '=== EVIDENCE TYPES BREAKDOWN ==='::text,
  'Evidence Type Tags Found:',
  NULL, NULL, NULL, NULL
FROM latest_workflow
WHERE EXISTS (SELECT 1 FROM all_tags WHERE dimension_key = 'evidence-type')

UNION ALL

SELECT 
  '',
  '• ' || tag_value,
  'Source: ' || storage_type,
  CASE 
    WHEN tag_value ILIKE '%before%after%' OR tag_value ILIKE '%before/after%' THEN '🎯 YOUR SELECTION!'
    ELSE ''
  END,
  NULL, NULL
FROM all_tags
WHERE dimension_key = 'evidence-type'

UNION ALL

-- No evidence types found message
SELECT 
  '=== NO EVIDENCE TYPES FOUND ==='::text,
  'No evidence-type tags found in any storage location'::text,
  'Check: document_tags table, workflow_sessions.selected_tags, workflow_sessions.custom_tags'::text,
  NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM all_tags WHERE dimension_key = 'evidence-type')

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
-- QUERY COMPLETE - COMPREHENSIVE TAG DISPLAY v5
-- ============================================================================
-- EXPECTED OUTPUT:
-- - Header: Document name and category assignment timestamp in a box
-- - Table 1: Document & workflow session information
-- - Table 2: Belonging rating (Panel A) and primary category (Panel B)
-- - Table 3: ALL tags from ALL sources (normalized + legacy JSONB + custom)
-- - Table 4: Tag summary by storage source
-- - Table 5: Evidence Types breakdown (highlighting your "Before/After Results")
-- - Fallback: No data messages if nothing found
-- ============================================================================

-- DEBUGGING NOTES:
-- If you still don't see your "Before / After Results" tag, check:
-- 1. workflow_sessions.selected_tags JSONB field
-- 2. workflow_sessions.custom_tags JSONB field  
-- 3. document_tags table with dimension_id = '550e8400-e29b-41d4-a716-446655440021'
-- 4. The tag might be stored with a different name/slug format
-- ============================================================================
```