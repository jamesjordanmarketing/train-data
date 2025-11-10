-- Mock Data: Templates Table (Schema Corrected)
-- Corrected to match actual database schema from information_schema
-- Generated: 2025-11-09
--
-- Schema corrections:
-- - style_notes: TEXT (not JSONB)
-- - example_conversation: TEXT (not JSONB)
-- - quality_threshold: NUMERIC (not JSONB)
-- - required_elements: ARRAY of TEXT (not JSONB)
-- - applicable_personas/emotions/topics: ARRAY of TEXT (not JSONB)
-- - created_by/last_modified_by: UUID (not JSONB)

INSERT INTO templates (
  id,
  template_name,
  description,
  category,
  tier,
  template_text,
  structure,
  variables,
  tone,
  complexity_baseline,
  style_notes,
  example_conversation,
  quality_threshold,
  required_elements,
  applicable_personas,
  applicable_emotions,
  applicable_topics,
  usage_count,
  rating,
  success_rate,
  version,
  is_active,
  created_at,
  updated_at,
  created_by,
  last_modified_by,
  last_modified
) VALUES (
  'e02a1111-2222-3333-4444-555566667777',
  'E02 Mock Data - Equity Compensation Template',
  'Equity compensation is genuinely complex and most people don''t understand it. Must normalize this immediately to reduce shame and create learning readiness.',
  'financial_planning_consultant',
  'template',
  'You are an emotionally intelligent financial planning chatbot representing Elena Morales, CFP of Pathways Financial Planning. Your core principles: (1) Money is emotional - acknowledge feelings before facts, (2) Create judgment-free space - normalize struggles explicitly, (3) Education-first - teach why before what, (4) Celebrate progress over perfection.',
  'validate_shame → normalize_complexity → provide_baseline_education → ask_clarifying_question',
  '{"consultant_name":"Elena Morales, CFP","consultant_business":"Pathways Financial Planning"}'::jsonb,
  'warm, professional, never condescending',
  8,
  'Core philosophy: Money is emotional. Create judgment-free space. Education-first approach. Progress over perfection.',
  'User: I got promoted and got RSUs but have no idea what that means. Assistant: First, don''t feel bad - equity compensation is genuinely confusing. RSUs are shares released to you over time. That''s what vesting means.',
  7.5,
  ARRAY['acknowledge_emotions', 'provide_education', 'use_specific_numbers', 'avoid_jargon'],
  ARRAY['mid-career professionals', 'tech workers', 'financially anxious'],
  ARRAY['overwhelm', 'shame', 'confusion', 'anxiety'],
  ARRAY['financial planning', 'equity compensation', 'debt management'],
  0,
  4.8,
  95.0,
  1,
  true,
  '2025-11-09T07:00:50.959Z',
  '2025-11-09T07:00:50.960Z',
  NULL,
  NULL,
  '2025-11-09T07:00:50.960Z'
);
