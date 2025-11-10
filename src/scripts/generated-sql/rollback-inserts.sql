-- Rollback Script for Mock Data Insertion
-- This script removes all inserted mock data
--
-- CAUTION: This will delete all conversations and templates created by the mock data script
-- Mock User UUID: 12345678-1234-1234-1234-123456789012
--
-- Usage:
-- Execute this SQL in Supabase SQL Editor or via psql to rollback the insertions

-- ============================================================================
-- BACKUP RECOMMENDATION
-- ============================================================================
-- Before executing this rollback, consider creating a backup:
-- CREATE TABLE conversations_backup AS SELECT * FROM conversations;
-- CREATE TABLE templates_backup AS SELECT * FROM templates;

-- ============================================================================
-- Count Records Before Deletion
-- ============================================================================
SELECT 'BEFORE DELETION' as status;
SELECT COUNT(*) as conversations_count FROM conversations WHERE created_by = '12345678-1234-1234-1234-123456789012';
SELECT COUNT(*) as templates_count FROM templates WHERE created_by->>'id' = '12345678-1234-1234-1234-123456789012';

-- ============================================================================
-- Delete Mock Data
-- ============================================================================

-- Delete conversations created by mock user
DELETE FROM conversations
WHERE created_by = '12345678-1234-1234-1234-123456789012';

-- Delete templates created by mock user
DELETE FROM templates
WHERE created_by->>'id' = '12345678-1234-1234-1234-123456789012';

-- ============================================================================
-- Verify Deletion
-- ============================================================================
SELECT 'AFTER DELETION' as status;
SELECT COUNT(*) as conversations_remaining FROM conversations WHERE created_by = '12345678-1234-1234-1234-123456789012';
SELECT COUNT(*) as templates_remaining FROM templates WHERE created_by->>'id' = '12345678-1234-1234-1234-123456789012';

-- ============================================================================
-- Final Summary
-- ============================================================================
SELECT 'ROLLBACK COMPLETE' as status;
SELECT COUNT(*) as total_conversations FROM conversations;
SELECT COUNT(*) as total_templates FROM templates;
