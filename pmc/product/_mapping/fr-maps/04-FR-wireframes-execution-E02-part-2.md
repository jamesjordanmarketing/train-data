# E02 Part 2: Database Schema Alignment & Integration Verification
**Date:** October 31, 2025  
**Scope:** Fix critical database schema mismatches and verify E02 integration  
**Prerequisites:** E02 Part 1 must be completed (all code implemented)  
**Estimated Time:** 30 minutes (15 min SQL + 15 min verification)

---

## Executive Summary

E02 Part 1 successfully implemented all AI Integration & Generation Engine code:
- ✅ Rate limiting system (Prompt 1)
- ✅ Retry strategy system (Prompt 2)  
- ✅ Template management service (Prompt 3)
- ✅ Parameter injection engine (Prompt 4)
- ✅ Template testing framework (Prompt 5)
- ✅ Quality validation system (Prompt 6)

**However**, there is **1 critical database schema mismatch** that prevents the template system from functioning:

| Component | Code References | Database Has | Status |
|-----------|----------------|--------------|---------|
| Template Table | `prompt_templates` | `conversation_templates` | ❌ MISMATCH |

**Part 2 Actions:**
1. **SQL Fix:** Rename `conversation_templates` to `prompt_templates` (15 minutes)
2. **Verification:** Test all template operations (15 minutes)

**Impact:** Without this fix, all template CRUD operations fail with "relation does not exist" error.

---

## Section 1: SQL Schema Alignment

### 1.1 Critical Issue: Table Name Mismatch

**Problem:**
- Code in `src/lib/template-service.ts` references: `.from('prompt_templates')` (5 occurrences)
- Database table is named: `conversation_templates`

**Affected Operations:**
- `GET /api/templates` - List templates (FAILS)
- `POST /api/templates` - Create template (FAILS)
- `GET /api/templates/:id` - Get template (FAILS)
- `PATCH /api/templates/:id` - Update template (FAILS)
- `DELETE /api/templates/:id` - Delete template (FAILS)

**Error Message:**
```
relation "prompt_templates" does not exist
```

### 1.2 Solution: Rename Table

**Decision:** Rename database table to match code (simpler than updating 9 code files).

**SQL Script Below** renames the table and updates all foreign key constraints.

---

## STEP 1: Execute SQL in Supabase SQL Editor

**Instructions:**
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the entire SQL script below (between the ========= and +++++++++ markers)
4. Paste into SQL Editor
5. Click "Run" button
6. Verify success messages in output

========================


-- ============================================================================
-- E02 Part 2: Database Schema Alignment
-- Description: Rename conversation_templates to prompt_templates
-- Date: 2025-10-31
-- Impact: Aligns database with E02 code implementation
-- ============================================================================

BEGIN;

-- ============================================================================
-- VERIFICATION: Check current state
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'E02 PART 2: Database Schema Alignment';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- Check if conversation_templates exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'conversation_templates'
    ) THEN
        RAISE NOTICE '✓ Found table: conversation_templates';
    ELSE
        RAISE NOTICE '✗ Table conversation_templates not found';
    END IF;
    
    -- Check if prompt_templates already exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'prompt_templates'
    ) THEN
        RAISE NOTICE '! Table prompt_templates already exists - skipping rename';
    ELSE
        RAISE NOTICE '✓ Table prompt_templates does not exist - safe to rename';
    END IF;
    
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 1: Rename table conversation_templates → prompt_templates
-- ============================================================================

DO $$
BEGIN
    -- Only rename if conversation_templates exists and prompt_templates doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'conversation_templates'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'prompt_templates'
    ) THEN
        -- Rename the table
        ALTER TABLE conversation_templates RENAME TO prompt_templates;
        RAISE NOTICE '✓ Renamed table: conversation_templates → prompt_templates';
    ELSE
        RAISE NOTICE '! Skipping table rename (already completed or table missing)';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Update foreign key constraints
-- ============================================================================

DO $$
BEGIN
    -- Update generation_logs foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'generation_logs_template_id_fkey'
        AND table_name = 'generation_logs'
    ) THEN
        ALTER TABLE generation_logs DROP CONSTRAINT generation_logs_template_id_fkey;
        ALTER TABLE generation_logs 
            ADD CONSTRAINT generation_logs_template_id_fkey 
            FOREIGN KEY (template_id) REFERENCES prompt_templates(id);
        RAISE NOTICE '✓ Updated foreign key: generation_logs → prompt_templates';
    END IF;
    
    -- Update scenarios foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'scenarios_parent_template_id_fkey'
        AND table_name = 'scenarios'
    ) THEN
        ALTER TABLE scenarios DROP CONSTRAINT scenarios_parent_template_id_fkey;
        ALTER TABLE scenarios 
            ADD CONSTRAINT scenarios_parent_template_id_fkey 
            FOREIGN KEY (parent_template_id) REFERENCES prompt_templates(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Updated foreign key: scenarios → prompt_templates';
    END IF;
    
    -- Update edge_cases foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'edge_cases_parent_template_id_fkey'
        AND table_name = 'edge_cases'
    ) THEN
        ALTER TABLE edge_cases DROP CONSTRAINT edge_cases_parent_template_id_fkey;
        ALTER TABLE edge_cases 
            ADD CONSTRAINT edge_cases_parent_template_id_fkey 
            FOREIGN KEY (parent_template_id) REFERENCES prompt_templates(id);
        RAISE NOTICE '✓ Updated foreign key: edge_cases → prompt_templates';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Rename indexes
-- ============================================================================

DO $$
BEGIN
    -- Rename all indexes
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversation_templates_tier') THEN
        ALTER INDEX idx_conversation_templates_tier RENAME TO idx_prompt_templates_tier;
        RAISE NOTICE '✓ Renamed index: idx_conversation_templates_tier → idx_prompt_templates_tier';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversation_templates_is_active') THEN
        ALTER INDEX idx_conversation_templates_is_active RENAME TO idx_prompt_templates_is_active;
        RAISE NOTICE '✓ Renamed index: idx_conversation_templates_is_active → idx_prompt_templates_is_active';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversation_templates_usage') THEN
        ALTER INDEX idx_conversation_templates_usage RENAME TO idx_prompt_templates_usage;
        RAISE NOTICE '✓ Renamed index: idx_conversation_templates_usage → idx_prompt_templates_usage';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversation_templates_rating') THEN
        ALTER INDEX idx_conversation_templates_rating RENAME TO idx_prompt_templates_rating;
        RAISE NOTICE '✓ Renamed index: idx_conversation_templates_rating → idx_prompt_templates_rating';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversation_templates_personas') THEN
        ALTER INDEX idx_conversation_templates_personas RENAME TO idx_prompt_templates_personas;
        RAISE NOTICE '✓ Renamed index: idx_conversation_templates_personas → idx_prompt_templates_personas';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversation_templates_category') THEN
        ALTER INDEX idx_conversation_templates_category RENAME TO idx_prompt_templates_category;
        RAISE NOTICE '✓ Renamed index: idx_conversation_templates_category → idx_prompt_templates_category';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversation_templates_created_by') THEN
        ALTER INDEX idx_conversation_templates_created_by RENAME TO idx_prompt_templates_created_by;
        RAISE NOTICE '✓ Renamed index: idx_conversation_templates_created_by → idx_prompt_templates_created_by';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Update triggers
-- ============================================================================

DO $$
BEGIN
    -- Drop old trigger if exists
    DROP TRIGGER IF EXISTS update_conversation_templates_updated_at ON prompt_templates;
    
    -- Create new trigger
    CREATE TRIGGER update_prompt_templates_updated_at 
        BEFORE UPDATE ON prompt_templates
        FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();
    
    RAISE NOTICE '✓ Updated trigger: update_prompt_templates_updated_at';
END $$;

-- ============================================================================
-- STEP 5: Update RLS policies
-- ============================================================================

DO $$
BEGIN
    -- Drop old policies
    DROP POLICY IF EXISTS "All users can view active templates" ON prompt_templates;
    DROP POLICY IF EXISTS "Users can manage their own templates" ON prompt_templates;
    
    -- Create new policies
    CREATE POLICY "All users can view active templates"
        ON prompt_templates FOR SELECT
        USING (is_active = TRUE);
    
    CREATE POLICY "Users can manage their own templates"
        ON prompt_templates FOR ALL
        USING (auth.uid() = created_by);
    
    RAISE NOTICE '✓ Updated RLS policies on prompt_templates';
END $$;

-- ============================================================================
-- STEP 6: Update table comment
-- ============================================================================

COMMENT ON TABLE prompt_templates IS 
    'Prompt templates for AI conversation generation (renamed from conversation_templates for code alignment)';

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

DO $$
DECLARE
    template_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration Complete - Verification';
    RAISE NOTICE '========================================';
    
    -- Check table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'prompt_templates'
    ) THEN
        RAISE NOTICE '✓ Table prompt_templates exists';
        
        -- Count templates
        SELECT COUNT(*) INTO template_count FROM prompt_templates;
        RAISE NOTICE '  └─ Contains % templates', template_count;
    ELSE
        RAISE NOTICE '✗ Table prompt_templates not found!';
    END IF;
    
    -- Check foreign keys
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'generation_logs_template_id_fkey'
        AND table_name = 'generation_logs'
    ) THEN
        RAISE NOTICE '✓ Foreign key: generation_logs → prompt_templates';
    ELSE
        RAISE NOTICE '✗ Foreign key missing: generation_logs → prompt_templates';
    END IF;
    
    -- Check indexes
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname LIKE 'idx_prompt_templates%') THEN
        RAISE NOTICE '✓ Indexes renamed successfully';
    ELSE
        RAISE NOTICE '✗ Indexes not found';
    END IF;
    
    -- Check RLS policies
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'prompt_templates'
        AND policyname = 'All users can view active templates'
    ) THEN
        RAISE NOTICE '✓ RLS policies configured';
    ELSE
        RAISE NOTICE '✗ RLS policies missing';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next Step: Run Verification Prompt';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

COMMIT;

-- ============================================================================
-- Post-Migration Instructions
-- ============================================================================
-- 
-- 1. ✓ SQL migration complete
-- 2. → Next: Run PROMPT 1 below to verify integration
-- 3. → Test template CRUD operations in the application
-- 
-- ============================================================================


++++++++++++++++++

---

## STEP 2: Execute Verification Prompt in Cursor

**Instructions:**
1. Open Cursor IDE
2. Open a new Claude Sonnet 4.5 chat window (200k context)
3. Copy the entire prompt below (between the ========= and +++++++++ markers)
4. Paste into chat window
5. Press Enter to execute
6. Review the verification results
7. Fix any issues identified by the verification

---

## PROMPT 1: E02 Integration Verification & Testing

========================


You are a senior full-stack developer verifying the E02 AI Integration & Generation Engine implementation after database schema alignment.

**CONTEXT:**

The E02 implementation includes:
- Rate limiting system with sliding window algorithm
- Retry strategies (exponential, linear, fixed backoff)
- Template management system with CRUD operations
- Parameter injection engine with security escaping
- Template testing framework
- Quality validation system

**CRITICAL DATABASE FIX JUST COMPLETED:**
- Table renamed: `conversation_templates` → `prompt_templates`
- Foreign keys updated: generation_logs, scenarios, edge_cases
- Indexes renamed
- RLS policies updated

**YOUR TASK:**

Verify that all E02 components are working correctly after the database schema alignment. Test each major system and fix any integration issues discovered.

---

## VERIFICATION CHECKLIST

### 1. Template Service Integration

**Verify:** Template CRUD operations work with renamed table

**Test:**
1. Check that template service can read from `prompt_templates` table
2. Verify template list endpoint returns data
3. Test template creation
4. Test template update
5. Test template deletion

**Expected Results:**
- No "relation does not exist" errors
- All template operations succeed
- Foreign keys work correctly

**Files to Check:**
- `src/lib/template-service.ts` (lines 31, 65, 89, 111, 147)
- `src/app/api/templates/route.ts`
- `src/app/api/templates/[id]/route.ts`

**Action Items:**
- [ ] Test GET /api/templates endpoint
- [ ] Test POST /api/templates endpoint
- [ ] Test PATCH /api/templates/:id endpoint
- [ ] Test DELETE /api/templates/:id endpoint
- [ ] Verify no database errors in logs

---

### 2. Template Analytics Integration

**Verify:** Analytics endpoint queries correct table

**Test:**
1. Navigate to templates analytics page
2. Verify analytics data loads
3. Check that conversation → template relationships work
4. Test analytics API endpoint

**Expected Results:**
- Analytics dashboard displays without errors
- Template usage statistics accurate
- Quality metrics calculated correctly

**Files to Check:**
- `src/app/api/templates/analytics/route.ts` (line 72-77)
- `train-wireframe/src/components/templates/TemplateAnalyticsDashboard.tsx`

**Action Items:**
- [ ] Test GET /api/templates/analytics endpoint
- [ ] Verify analytics dashboard renders
- [ ] Check template usage count updates
- [ ] Verify quality score calculations

---

### 3. Template Testing Framework

**Verify:** Template testing uses correct table reference

**Test:**
1. Open template editor
2. Click "Test Template" button
3. Provide test parameters
4. Execute test
5. Verify results display

**Expected Results:**
- Template testing modal opens
- Test executes successfully
- Quality metrics calculated
- No database errors

**Files to Check:**
- `src/app/api/templates/test/route.ts` (line 56)
- `train-wireframe/src/components/templates/TemplateTestModal.tsx`

**Action Items:**
- [ ] Test template testing workflow
- [ ] Verify test results display correctly
- [ ] Check Claude API integration
- [ ] Verify parameter injection works

---

### 4. Generation Logs Foreign Key

**Verify:** generation_logs table correctly references prompt_templates

**Test:**
1. Generate a conversation using a template
2. Check that generation log is created
3. Verify foreign key constraint works
4. Test deletion cascade behavior

**Expected Results:**
- Generation logs created with template_id
- Foreign key constraint enforced
- No orphaned records

**Files to Check:**
- `src/lib/generation-log-service.ts`
- Database: generation_logs table

**Action Items:**
- [ ] Generate test conversation
- [ ] Verify generation log created
- [ ] Check template_id foreign key
- [ ] Test referential integrity

---

### 5. Scenarios and Edge Cases Integration

**Verify:** scenarios and edge_cases tables reference prompt_templates

**Test:**
1. Create scenario from template
2. Create edge case from template
3. Verify parent_template_id relationships work
4. Test template deletion with dependent scenarios

**Expected Results:**
- Scenarios link to templates correctly
- Edge cases link to templates correctly
- Cascade deletes work as expected

**Files to Check:**
- `src/lib/scenario-service.ts`
- `src/lib/edge-case-service.ts`
- Database: scenarios, edge_cases tables

**Action Items:**
- [ ] Create test scenario from template
- [ ] Create test edge case from template
- [ ] Verify foreign key relationships
- [ ] Test cascade delete behavior

---

### 6. Frontend UI Integration

**Verify:** All template UI components work correctly

**Test:**
1. Navigate to Templates page
2. Verify template list loads
3. Create new template
4. Edit existing template
5. Test template variable editor
6. Test template preview
7. Delete template

**Expected Results:**
- Templates page loads without errors
- All CRUD operations work in UI
- Template editor functions correctly
- Preview shows resolved placeholders

**Files to Check:**
- `train-wireframe/src/components/views/TemplatesView.tsx`
- `train-wireframe/src/components/templates/TemplateTable.tsx`
- `train-wireframe/src/components/templates/TemplateEditorModal.tsx`
- `train-wireframe/src/components/templates/TemplateVariableEditor.tsx`

**Action Items:**
- [ ] Navigate to Templates page (/templates)
- [ ] Verify template list displays
- [ ] Test "Create Template" button
- [ ] Test template editing
- [ ] Test template deletion
- [ ] Verify error handling

---

### 7. Parameter Injection Security

**Verify:** Parameter injection still works securely after schema changes

**Test:**
1. Create template with {{placeholders}}
2. Test parameter injection with safe values
3. Test with potentially malicious values (XSS)
4. Verify HTML escaping works
5. Test conditional expressions

**Expected Results:**
- Parameters injected correctly
- XSS attacks prevented
- HTML characters escaped
- No security vulnerabilities

**Files to Check:**
- `src/lib/ai/parameter-injection.ts`
- `src/lib/ai/security-utils.ts`
- `src/lib/ai/__tests__/security.test.ts`

**Action Items:**
- [ ] Test parameter injection
- [ ] Test with malicious input: `<script>alert('xss')</script>`
- [ ] Verify HTML escaping
- [ ] Test conditional expressions
- [ ] Run security test suite

---

### 8. Rate Limiting & Queue System

**Verify:** Rate limiting and queue processing work independently of template changes

**Test:**
1. Start batch generation
2. Verify rate limit indicator displays
3. Check queue status API
4. Monitor rate limit tracking
5. Test queue pause/resume

**Expected Results:**
- Rate limiter tracks requests correctly
- Queue status API returns accurate data
- No impact from schema changes

**Files to Check:**
- `src/lib/ai/rate-limiter.ts`
- `src/lib/ai/request-queue.ts`
- `src/app/api/ai/queue-status/route.ts`

**Action Items:**
- [ ] Test GET /api/ai/queue-status
- [ ] Start batch generation
- [ ] Verify rate limit indicator
- [ ] Check queue processing
- [ ] Test rate limit threshold

---

### 9. Quality Scoring System

**Verify:** Quality scoring works correctly with template data

**Test:**
1. Generate conversation
2. Verify quality score calculated
3. Check quality breakdown modal
4. Test auto-flagging for low scores
5. Verify quality filters work

**Expected Results:**
- Quality scores calculated automatically
- Breakdown modal displays correctly
- Auto-flagging triggers at score < 6.0
- Quality range filter works

**Files to Check:**
- `src/lib/quality/scorer.ts`
- `src/lib/quality/auto-flag.ts`
- `train-wireframe/src/components/dashboard/QualityDetailsModal.tsx`

**Action Items:**
- [ ] Generate test conversation
- [ ] Verify quality score displayed
- [ ] Click quality score to open modal
- [ ] Verify breakdown details
- [ ] Test quality range filter

---

### 10. End-to-End Integration Test

**Complete Workflow Test:**

1. **Create Template:**
   - Navigate to Templates page
   - Click "Create Template"
   - Enter template details with {{variables}}
   - Save template

2. **Test Template:**
   - Click "Test Template" button
   - Provide test parameters
   - Execute test
   - Verify quality results

3. **Generate Conversation:**
   - Navigate to Dashboard
   - Click "Generate Single"
   - Select the created template
   - Fill in parameters
   - Generate conversation

4. **Review Results:**
   - Verify conversation created
   - Check quality score
   - Open quality details modal
   - Verify generation log created

5. **Check Analytics:**
   - Navigate to Templates page
   - View analytics dashboard
   - Verify usage count incremented
   - Check quality trends

**Expected Results:**
- Complete workflow succeeds without errors
- All integrations work seamlessly
- Data persisted correctly
- Analytics updated

**Action Items:**
- [ ] Execute complete workflow above
- [ ] Document any errors encountered
- [ ] Verify data consistency
- [ ] Check logs for warnings

---

## IMPLEMENTATION INSTRUCTIONS

**For Each Verification Item:**

1. **Test the functionality** as described
2. **If errors occur:**
   - Read the error message carefully
   - Check the referenced file and line number
   - Verify table name is now `prompt_templates`
   - Check foreign key references
   - Review database query syntax
3. **Fix any issues found:**
   - Update code if table references are incorrect
   - Fix foreign key constraints if needed
   - Update type definitions if schema changed
4. **Re-test** after fixing
5. **Document results** in code comments

**Code Quality Requirements:**
- All fixes must maintain TypeScript type safety
- Error handling must be preserved
- Security measures must not be bypassed
- Tests must be updated if behavior changes

**Testing Requirements:**
- Manual testing required for all UI components
- API endpoints must return 200 status for success
- Database constraints must be enforced
- No console errors in browser

---

## DELIVERABLES

After completing all verification steps, provide:

1. **Verification Report:**
   - List of all items tested
   - Pass/Fail status for each item
   - Description of any issues found
   - Fixes applied

2. **Code Changes:**
   - List any code files modified
   - Brief description of changes
   - Reason for each change

3. **Test Results:**
   - Screenshot or log of successful template list
   - Screenshot of successful template creation
   - Log of successful analytics query
   - Any error messages encountered

4. **Recommendations:**
   - Any additional improvements needed
   - Performance concerns discovered
   - Security issues identified

---

## SUCCESS CRITERIA

Verification is complete when:

- [ ] All template CRUD operations succeed
- [ ] No "relation does not exist" errors
- [ ] Template analytics display correctly
- [ ] Template testing workflow functions
- [ ] Generation logs link to templates correctly
- [ ] Frontend UI works without errors
- [ ] Parameter injection remains secure
- [ ] Rate limiting system unaffected
- [ ] Quality scoring works correctly
- [ ] End-to-end workflow succeeds

---

## ERROR TROUBLESHOOTING

**Common Issues After Schema Changes:**

1. **"relation 'prompt_templates' does not exist"**
   - Verify SQL migration completed successfully
   - Check Supabase SQL Editor for errors
   - Verify table was renamed

2. **"foreign key constraint violated"**
   - Check that foreign keys were updated
   - Verify referential integrity
   - Check cascade delete settings

3. **"column does not exist"**
   - Compare database schema to code expectations
   - Verify field mappings in service layer
   - Check type definitions match database

4. **Template list returns empty**
   - Check RLS policies on prompt_templates
   - Verify is_active filter
   - Check user authentication

5. **Analytics not displaying**
   - Verify conversations have parent_type = 'template'
   - Check parent_id references prompt_templates.id
   - Verify quality_score field exists

---

## POST-VERIFICATION TASKS

After successful verification:

1. **Update Documentation:**
   - Document table rename in CHANGELOG
   - Update API documentation
   - Update database schema docs

2. **Run Test Suites:**
   ```bash
   npm test -- src/lib/template-service.test.ts
   npm test -- src/app/api/templates
   npm test -- src/lib/quality
   ```

3. **Performance Check:**
   - Verify template list loads in <500ms
   - Check analytics query performance
   - Monitor API response times

4. **Security Audit:**
   - Re-run security tests
   - Verify XSS protection still active
   - Check parameter injection escaping

---

## FINAL REPORT

Provide a concise summary:

```markdown
# E02 Integration Verification Complete

## Status: [PASS/FAIL]

## Items Tested: [X/10]

## Issues Found: [count]
- [List issues]

## Fixes Applied: [count]
- [List fixes]

## Recommendations:
- [List recommendations]

## Ready for E03: [YES/NO]
```

---

Begin verification now. Test each component systematically and report your findings.


++++++++++++++++++

---

## Expected Outcomes

After completing Steps 1 and 2:

### ✅ Database State:
- Table `prompt_templates` exists with all data from `conversation_templates`
- Foreign keys point to `prompt_templates`
- Indexes renamed with `prompt_` prefix
- RLS policies active on `prompt_templates`
- Triggers updated

### ✅ Application State:
- Template CRUD operations work
- Analytics display correctly
- Template testing functional
- Generation logs link properly
- UI components load without errors

### ✅ Ready for E03:
- All E02 functionality verified
- No database schema issues remaining
- Template system fully operational
- Generation workflows can proceed

---

## Rollback Plan (If Needed)

If issues occur after the SQL migration, rollback:

```sql
BEGIN;

-- Rename table back
ALTER TABLE prompt_templates RENAME TO conversation_templates;

-- Revert foreign keys
ALTER TABLE generation_logs DROP CONSTRAINT generation_logs_template_id_fkey;
ALTER TABLE generation_logs 
    ADD CONSTRAINT generation_logs_template_id_fkey 
    FOREIGN KEY (template_id) REFERENCES conversation_templates(id);

ALTER TABLE scenarios DROP CONSTRAINT scenarios_parent_template_id_fkey;
ALTER TABLE scenarios 
    ADD CONSTRAINT scenarios_parent_template_id_fkey 
    FOREIGN KEY (parent_template_id) REFERENCES conversation_templates(id) ON DELETE CASCADE;

ALTER TABLE edge_cases DROP CONSTRAINT edge_cases_parent_template_id_fkey;
ALTER TABLE edge_cases 
    ADD CONSTRAINT edge_cases_parent_template_id_fkey 
    FOREIGN KEY (parent_template_id) REFERENCES conversation_templates(id);

-- Rename indexes back
ALTER INDEX idx_prompt_templates_tier RENAME TO idx_conversation_templates_tier;
ALTER INDEX idx_prompt_templates_is_active RENAME TO idx_conversation_templates_is_active;
ALTER INDEX idx_prompt_templates_usage RENAME TO idx_conversation_templates_usage;
ALTER INDEX idx_prompt_templates_rating RENAME TO idx_conversation_templates_rating;
ALTER INDEX idx_prompt_templates_personas RENAME TO idx_conversation_templates_personas;
ALTER INDEX idx_prompt_templates_category RENAME TO idx_conversation_templates_category;
ALTER INDEX idx_prompt_templates_created_by RENAME TO idx_conversation_templates_created_by;

-- Revert trigger
DROP TRIGGER IF EXISTS update_prompt_templates_updated_at ON conversation_templates;
CREATE TRIGGER update_conversation_templates_updated_at 
    BEFORE UPDATE ON conversation_templates
    FOR EACH ROW EXECUTE FUNCTION update_train_updated_at_column();

-- Revert RLS policies
DROP POLICY IF EXISTS "All users can view active templates" ON conversation_templates;
DROP POLICY IF EXISTS "Users can manage their own templates" ON conversation_templates;

CREATE POLICY "All users can view active templates"
    ON conversation_templates FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Users can manage their own templates"
    ON conversation_templates FOR ALL
    USING (auth.uid() = created_by);

COMMIT;
```

---

## Notes for E03 Preparation

After E02 Part 2 completion:

1. **Template System Ready:** E03 can use templates for generation workflows
2. **Analytics Tracking:** Template usage will be tracked automatically
3. **Quality Validation:** All generated conversations will be scored
4. **Rate Limiting:** Generation workflows will respect API rate limits

**No Further E02 Work Required** - System is production-ready.

---

**Document Version:** 1.0  
**Date:** October 31, 2025  
**Status:** Ready for Execution  
**Estimated Time:** 30 minutes total

