### PROMPT E03: Test Application and Verify Functionality

**Scope:** Start the application and verify all pages work with populated data
**Dependencies:** Successful completion of PROMPT E02
**Estimated Time:** 30-45 minutes
**Risk Level:** Low
**Output:** Verified working application with functional pages and features

========================

You are tasked with starting the train-data application and verifying that all conversation-related pages function correctly with the newly populated mock data.

## Context

You should have completed PROMPT E02 which populated:
- `conversations` table with training conversation data
- `templates` table with template records

**Application Details:**
- Framework: Next.js 14
- Port: Default 3000 (or next available)
- Working Directory: `C:\Users\james\Master\BrightHub\BRun\train-data`

## Your Tasks

### Task 1: Start the Development Server

1. **Navigate to project directory:**
   ```bash
   cd C:\Users\james\Master\BrightHub\BRun\train-data
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Verify server starts successfully:**
   - Check console output for "Ready on http://localhost:3000"
   - Note any errors or warnings
   - Confirm build completes without errors

### Task 2: Test /conversations Dashboard Page

Navigate to: `http://localhost:3000/conversations`

**Verify Page Loads:**
- [ ] Page renders without errors
- [ ] No console errors in browser DevTools
- [ ] Loading skeleton shows briefly then content appears

**Verify Dashboard Stats Cards:**
- [ ] "Total Conversations" shows correct count
- [ ] "Approval Rate" shows calculated percentage
- [ ] "Avg Quality Score" shows average quality
- [ ] "Pending Review" shows count of pending items

**Verify Conversation Table:**
- [ ] Table displays conversation records
- [ ] Columns render correctly:
  - Conversation ID
  - Persona
  - Emotion
  - Status badge (with appropriate color)
  - Tier badge
  - Quality Score
  - Turn Count
  - Created Date
  - Actions (view/edit icons)
- [ ] At least 10 conversations visible
- [ ] Pagination controls appear if > 25 records
- [ ] Data matches database records

**Verify Filtering:**
1. **Status Filter:**
   - [ ] Click status filter dropdown
   - [ ] Select "Approved" - table updates to show only approved
   - [ ] Select "Pending Review" - table updates correctly
   - [ ] Clear filter - all conversations return

2. **Tier Filter:**
   - [ ] Click tier filter dropdown
   - [ ] Select "Template" - table updates
   - [ ] Select "Scenario" - table updates
   - [ ] Clear filter

3. **Quality Range Filter:**
   - [ ] Adjust quality score slider
   - [ ] Table filters to matching quality scores
   - [ ] Clear filter

4. **Search:**
   - [ ] Type persona name in search box
   - [ ] Table filters to matching conversations
   - [ ] Type emotion keyword
   - [ ] Table updates dynamically
   - [ ] Clear search

**Verify Conversation Detail Modal:**
- [ ] Click on a conversation row
- [ ] Modal opens displaying conversation details
- [ ] All metadata fields populated correctly
- [ ] Conversation turns display (if implemented)
- [ ] Quality metrics shown
- [ ] Review history visible (if available)
- [ ] Close modal button works

**Verify Bulk Actions:**
- [ ] Select multiple conversations (checkboxes)
- [ ] Bulk actions toolbar appears
- [ ] "Select All" works
- [ ] "Deselect All" works
- [ ] Bulk actions menu shows options

### Task 3: Test Review Queue

Navigate to: `http://localhost:3000/conversations/review-queue`

**Note:** This page may need to be created if it doesn't exist yet.

**If Page Exists:**
- [ ] Page loads without errors
- [ ] Shows only conversations with status "pending_review" or "needs_revision"
- [ ] Queue is sortable by priority/date
- [ ] Review actions available (approve/reject/request changes)

**If Page Doesn't Exist:**
Document this and note it needs implementation. The data is ready for it.

### Task 4: Test Templates Page

Navigate to: `http://localhost:3000/conversations/templates`

**Note:** This page may need to be created if it doesn't exist yet.

**If Page Exists:**
- [ ] Page loads without errors
- [ ] Template list displays
- [ ] Template cards show:
  - Template name
  - Category
  - Description
  - Usage count
  - Active status
- [ ] Can click to view template details
- [ ] Template usage statistics display

**If Page Doesn't Exist:**
Document this and note it needs implementation. The data is ready for it.

### Task 5: Test API Endpoints

Use browser DevTools Network tab or manual API testing:

1. **GET /api/conversations:**
   ```bash
   # Using curl or Postman
   GET http://localhost:3000/api/conversations
   ```
   - [ ] Returns JSON array of conversations
   - [ ] Includes all expected fields
   - [ ] Pagination works if implemented

2. **GET /api/conversations/[id]:**
   - [ ] Returns single conversation detail
   - [ ] Includes all metadata
   - [ ] Returns 404 for invalid ID

3. **GET /api/templates:**
   - [ ] Returns template list
   - [ ] Templates properly formatted

4. **GET /api/conversations/stats:**
   - [ ] Returns statistics object
   - [ ] Stats match dashboard display

### Task 6: Test State Management

**Verify Zustand Store:**
- [ ] Filter selections persist when navigating away and back
- [ ] Selected conversations persist (if applicable)
- [ ] View preferences saved to localStorage
- [ ] Store hydrates correctly on page reload

### Task 7: Performance Testing

**Check Performance:**
- [ ] Page load time < 3 seconds
- [ ] Table rendering smooth with 25+ records
- [ ] Filtering responsive (updates < 500ms)
- [ ] Sorting works efficiently
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Smooth scrolling on long lists

### Task 8: Data Integrity Verification

**Cross-Reference UI with Database:**

1. **Pick 3 random conversations from UI**
2. **Query database for each:**
   ```sql
   SELECT * FROM conversations WHERE id = 'CONVERSATION_UUID';
   ```
3. **Verify all fields match:**
   - [ ] Persona matches
   - [ ] Emotion matches
   - [ ] Status matches
   - [ ] Quality score matches
   - [ ] Turn count matches
   - [ ] Timestamps match

**Check Template Relationships:**
1. **Find conversations linked to templates (parentType='template')**
2. **Verify parent template exists:**
   ```sql
   SELECT c.conversation_id, c.parent_id, t.template_name
   FROM conversations c
   JOIN templates t ON c.parent_id = t.id
   WHERE c.parent_type = 'template';
   ```
3. **Confirm relationship displays correctly in UI**

### Task 9: Error Handling Testing

**Test Error States:**
- [ ] Disconnect internet - verify offline message
- [ ] Invalid filter combinations - verify graceful handling
- [ ] Database timeout simulation - verify error message
- [ ] Empty result sets - verify "no results" message
- [ ] Malformed query params - verify validation

### Task 10: Create Test Report

Create a comprehensive test report: `pmc/context-ai/pmct/mock-data-testing-report_v1.md`

Include:

**Summary:**
- Date and time of testing
- Application version / commit hash
- Database state (record counts)
- Overall test pass/fail status

**Detailed Results:**
- ✅ Passing tests with evidence
- ❌ Failing tests with screenshots/error messages
- ⚠️ Warnings or issues encountered
- 📝 Notes and observations

**Page-by-Page Results:**
For each page tested:
- Load time
- Errors encountered
- Features working
- Features not working
- Screenshots (key pages)

**Performance Metrics:**
- Average page load time
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

**Data Verification:**
- Sample data spot-checks
- Relationship integrity
- Calculation accuracy

**Recommendations:**
- Issues to fix
- Performance improvements
- Feature enhancements
- Documentation needs

## Acceptance Criteria

✅ Development server starts without errors
✅ /conversations page loads and displays data
✅ Dashboard stats calculations correct
✅ Table displays all conversation records
✅ Filtering functionality works for all filters
✅ Search functionality works
✅ Sorting works (if implemented)
✅ Pagination works (if applicable)
✅ Conversation detail modal works
✅ Review queue accessible (or documented as needed)
✅ Templates page accessible (or documented as needed)
✅ API endpoints return correct data
✅ State management persists correctly
✅ Performance meets acceptable standards
✅ Data integrity verified across UI and database
✅ Error states handled gracefully
✅ Test report created and comprehensive

## Deliverables

1. **Test Report:**
   - File: `pmc/context-ai/pmct/mock-data-testing-report_v1.md`
   - Comprehensive results of all tests
   - Screenshots of key pages
   - Performance metrics

2. **Bug List (if any):**
   - File: `pmc/context-ai/pmct/mock-data-bugs-found_v1.md`
   - List of bugs discovered
   - Steps to reproduce
   - Expected vs actual behavior
   - Severity ratings

3. **Feature Gap Analysis:**
   - File: `pmc/context-ai/pmct/mock-data-feature-gaps_v1.md`
   - Pages that need to be created
   - Features that need implementation
   - Enhancement opportunities

4. **Screenshots:**
   - Directory: `pmc/context-ai/pmct/screenshots/`
   - Dashboard with populated data
   - Table with filters applied
   - Conversation detail modal
   - Any error states encountered

## Troubleshooting Common Issues

### Issue: Page loads but no data displays
**Solution:**
- Check browser console for errors
- Verify API is returning data: `curl http://localhost:3000/api/conversations`
- Check Supabase connection
- Verify RLS policies allow data access

### Issue: "No conversations" empty state shows
**Solution:**
- Query database directly: `SELECT COUNT(*) FROM conversations`
- Check if data filtered out by default filters
- Verify user authentication (conversations may be user-scoped)

### Issue: Statistics show 0 or incorrect values
**Solution:**
- Check calculation logic in `use-computed-conversation-stats` hook
- Verify database fields have correct data types
- Check for NULL values affecting calculations

### Issue: Filters not working
**Solution:**
- Check Zustand store updates
- Verify filter logic in `use-filtered-conversations` hook
- Check if filters applied to correct fields
- Verify Supabase query builder syntax

### Issue: Modal not opening
**Solution:**
- Check browser console for errors
- Verify modal state management
- Check if modal component properly imported
- Verify conversation ID passed correctly

## Next Steps After Testing

After successful testing:

1. **Document Working Features:**
   - Update README with features list
   - Create user guide if needed

2. **Address Critical Bugs:**
   - Fix any show-stopper issues
   - Create tickets for non-critical bugs

3. **Implement Missing Features:**
   - Create review queue page if needed
   - Create templates page if needed
   - Implement any missing API endpoints

4. **Performance Optimization:**
   - Address any performance issues found
   - Implement caching if needed
   - Optimize database queries

5. **Production Readiness:**
   - Add proper error boundaries
   - Implement loading states
   - Add analytics tracking
   - Set up monitoring
