-- Database Migration Script: Master Data Population
-- Date: 2025-09-21
-- Purpose: Populate missing categories and tags from mock data to database
-- This script adds all missing categories and tags to match the UI expectations

-- ==========================================
-- PHASE 1: INSERT MISSING CATEGORIES
-- ==========================================

-- Insert missing categories (8 total) - starting from UUID 550e8400-e29b-41d4-a716-446655440013
-- Note: complete-systems and proprietary-strategies already exist (IDs 001 and 002)

INSERT INTO categories (id, name, description, examples, is_high_value, impact_description, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440013', 'Process Documentation & Workflows', 'Step-by-step processes, standard operating procedures, and workflow documentation', ARRAY['Standard operating procedures', 'Quality assurance processes', 'Approval workflows', 'Daily operational checklists', 'Incident response procedures'], false, 'Medium training value - provides operational knowledge and process understanding', 3),

('550e8400-e29b-41d4-a716-446655440014', 'Customer Insights & Case Studies', 'Customer success stories, case studies, testimonials, and customer research insights', ARRAY['Customer success stories', 'Implementation case studies', 'Customer feedback analysis', 'User research findings', 'Customer testimonials'], true, 'High training value - provides real-world application examples and customer perspective', 4),

('550e8400-e29b-41d4-a716-446655440015', 'Market Research & Competitive Intelligence', 'Market analysis, competitive research, industry insights, and business intelligence', ARRAY['Market analysis reports', 'Competitive research', 'Industry trend analysis', 'Market positioning studies', 'Competitor battle cards'], true, 'High training value - provides market context and competitive landscape understanding', 5),

('550e8400-e29b-41d4-a716-446655440016', 'Sales Enablement & Customer-Facing Content', 'Materials designed to support sales processes and customer interactions', ARRAY['Sales presentations', 'Proposal templates', 'ROI calculators', 'Battle cards', 'Demo scripts'], false, 'Medium training value - provides customer interaction patterns and value messaging', 6),

('550e8400-e29b-41d4-a716-446655440017', 'Training Materials & Educational Content', 'Educational content, training guides, and learning materials for team development', ARRAY['Employee training guides', 'Skill development materials', 'Certification programs', 'Onboarding documentation', 'Best practices guides'], false, 'Medium training value - builds training capabilities and knowledge transfer methods', 7),

('550e8400-e29b-41d4-a716-446655440018', 'Knowledge Base & Reference Materials', 'Reference materials, knowledge articles, and informational content for ongoing use', ARRAY['Technical specifications', 'Product documentation', 'FAQ collections', 'Help articles', 'Reference guides'], false, 'Medium training value - builds foundational knowledge and reference capabilities', 8),

('550e8400-e29b-41d4-a716-446655440019', 'Communication Templates & Messaging', 'Email templates, communication frameworks, and messaging guidelines', ARRAY['Email templates', 'Communication protocols', 'Messaging frameworks', 'Social media guidelines', 'Internal announcements'], false, 'Low training value - primarily template-based content with limited strategic insight', 9),

('550e8400-e29b-41d4-a716-446655440020', 'Project Artifacts & Deliverables', 'Project-specific documents, deliverables, and milestone documentation', ARRAY['Project reports', 'Milestone deliverables', 'Implementation artifacts', 'Project timelines', 'Status updates'], false, 'Medium training value - provides project execution patterns and deliverable examples', 10);

-- ==========================================
-- PHASE 2: INSERT MISSING TAG DIMENSIONS
-- ==========================================

-- Insert missing tag dimensions (3 total) - continuing UUID sequence
-- Note: authorship, format, disclosure-risk, intended-use already exist (IDs 003-006)

INSERT INTO tag_dimensions (id, name, description, multi_select, required, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440021', 'Evidence Type', 'Types of evidence and proof points contained in the document', true, false, 5),

('550e8400-e29b-41d4-a716-446655440022', 'Audience Level', 'Target audience and accessibility level', true, false, 6),

('550e8400-e29b-41d4-a716-446655440023', 'Gating Level', 'Access control and sharing restrictions', false, false, 7);

-- ==========================================
-- PHASE 3: INSERT MISSING TAGS
-- ==========================================

-- Insert missing tags for existing dimensions first
-- Note: Existing tags are IDs 007-011

-- AUTHORSHIP DIMENSION (550e8400-e29b-41d4-a716-446655440003) - Missing 3 tags
INSERT INTO tags (id, dimension_id, name, description, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440003', 'Customer', 'Created by or with customers', 3),
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440003', 'Mixed/Collaborative', 'Collaborative effort between multiple parties', 4),
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440003', 'Third-Party', 'Created by external parties or vendors', 5);

-- CONTENT FORMAT DIMENSION (550e8400-e29b-41d4-a716-446655440004) - Missing 10 tags
INSERT INTO tags (id, dimension_id, name, description, icon, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440004', 'How-to Guide', 'Step-by-step instructional content', 'BookOpen', 1),
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440004', 'Strategy Note', 'Strategic thinking and planning documents', 'Target', 2),
('550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440004', 'Case Study', 'Detailed analysis of specific examples', 'FileText', 3),
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440004', 'Story/Narrative', 'Narrative-based content and storytelling', 'MessageSquare', 4),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440004', 'Sales Page', 'Sales-focused marketing content', 'ShoppingCart', 5),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440004', 'Email', 'Email communications and templates', 'Mail', 6),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440004', 'Transcript', 'Meeting or call transcriptions', 'Mic', 7),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440004', 'Presentation Slide', 'Presentation slides and decks', 'Presentation', 8),
('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440004', 'Whitepaper', 'In-depth technical or business analysis', 'FileCheck', 9),
('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440004', 'Brief/Summary', 'Concise summaries and executive briefs', 'FileText', 10);

-- DISCLOSURE RISK DIMENSION (550e8400-e29b-41d4-a716-446655440005) - Missing 4 tags
INSERT INTO tags (id, dimension_id, name, description, risk_level, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440005', 'Level 2 - Low Risk', 'Some competitive insights but generally safe for sharing', 2, 2),
('550e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440005', 'Level 3 - Moderate Risk', 'Contains business strategies or customer information', 3, 3),
('550e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440005', 'Level 4 - High Risk', 'Proprietary methods, financial data, or sensitive strategies', 4, 4),
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440005', 'Level 5 - Critical Risk', 'Highly confidential strategic or competitive information', 5, 5);

-- INTENDED USE DIMENSION (550e8400-e29b-41d4-a716-446655440006) - Missing 4 tags
INSERT INTO tags (id, dimension_id, name, description, icon, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440006', 'Sales Enablement', 'Supporting sales processes and conversions', 'Users', 3),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440006', 'Delivery/Operations', 'Service delivery and operational excellence', 'Cog', 4),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440006', 'Investor Relations', 'Investor communications and reporting', 'TrendingUp', 5),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440006', 'Legal/Compliance', 'Legal documentation and regulatory compliance', 'Scale', 6);

-- EVIDENCE TYPE DIMENSION (550e8400-e29b-41d4-a716-446655440021) - New 6 tags
INSERT INTO tags (id, dimension_id, name, description, icon, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440021', 'Metrics/KPIs', 'Quantitative data and performance metrics', 'BarChart3', 1),
('550e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440021', 'Quotes/Testimonials', 'Customer quotes and testimonials', 'Quote', 2),
('550e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440021', 'Before/After Results', 'Transformation and improvement examples', 'TrendingUp', 3),
('550e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440021', 'Screenshots/Visuals', 'Visual evidence and demonstrations', 'Image', 4),
('550e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440021', 'Data Tables', 'Structured data and analysis tables', 'Table', 5),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440021', 'External References', 'Citations and external validation', 'ExternalLink', 6);

-- AUDIENCE LEVEL DIMENSION (550e8400-e29b-41d4-a716-446655440022) - New 5 tags
INSERT INTO tags (id, dimension_id, name, description, icon, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440022', 'Public', 'General public and website visitors', 'Globe', 1),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440022', 'Lead', 'Prospects and potential customers', 'UserPlus', 2),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440022', 'Customer', 'Existing customers and clients', 'UserCheck', 3),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440022', 'Internal', 'Internal team members and employees', 'Building', 4),
('550e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440022', 'Executive', 'Senior leadership and decision makers', 'Crown', 5);

-- GATING LEVEL DIMENSION (550e8400-e29b-41d4-a716-446655440023) - New 6 tags
INSERT INTO tags (id, dimension_id, name, description, icon, sort_order) VALUES 
('550e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440023', 'Public', 'Freely accessible content', 'Unlock', 1),
('550e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440023', 'Ungated Email', 'Email signup required for access', 'Mail', 2),
('550e8400-e29b-41d4-a716-446655440058', '550e8400-e29b-41d4-a716-446655440023', 'Soft Gated', 'Basic contact information required', 'Key', 3),
('550e8400-e29b-41d4-a716-446655440059', '550e8400-e29b-41d4-a716-446655440023', 'Hard Gated', 'Detailed qualification required', 'Lock', 4),
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440023', 'Internal Only', 'Internal team access only', 'Shield', 5),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440023', 'NDA Only', 'Non-disclosure agreement required', 'ShieldCheck', 6);

-- ==========================================
-- PHASE 4: VERIFICATION QUERIES
-- ==========================================

-- Verify category count (should be 10)
SELECT 'Categories' as table_name, COUNT(*) as total_count FROM categories;

-- Verify tag dimensions count (should be 7)
SELECT 'Tag Dimensions' as table_name, COUNT(*) as total_count FROM tag_dimensions;

-- Verify tags count (should be ~43)
SELECT 'Tags' as table_name, COUNT(*) as total_count FROM tags;

-- Verify tag distribution by dimension
SELECT td.name as dimension, COUNT(t.id) as tag_count 
FROM tag_dimensions td 
LEFT JOIN tags t ON td.id = t.dimension_id 
GROUP BY td.name 
ORDER BY td.sort_order;

-- Show all categories with their IDs for API mapping
SELECT id, name, is_high_value 
FROM categories 
ORDER BY sort_order;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================
SELECT 'Master data migration completed successfully! 
- Added 8 categories (total: 10)
- Added 3 tag dimensions (total: 7) 
- Added ~38 tags (total: ~43)
All data now matches UI expectations.' as migration_result;
