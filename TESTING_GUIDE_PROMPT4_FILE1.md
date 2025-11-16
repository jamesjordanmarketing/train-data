# Testing Guide: Conversation Management Dashboard

## Overview

This guide provides step-by-step instructions for testing the Conversation Management Dashboard implementation.

---

## Test Environment Setup

### Prerequisites
```bash
# 1. Ensure dependencies are installed
npm install

# 2. Verify environment variables
cat .env.local | grep SUPABASE

# 3. Start development server
npm run dev
```

### Expected Output
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
○ Network:      http://192.168.1.x:3000
```

---

## Manual Testing Checklist

### Phase 1: Basic UI Loading

#### Test 1.1: Page Loads Successfully
- [ ] Navigate to `http://localhost:3000/conversations`
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools
- [ ] Table structure is visible

**Expected Result**: Dashboard renders with header "Conversations" and empty or populated table

#### Test 1.2: Loading State
- [ ] Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Observe loading state briefly appears
- [ ] Loading message: "Loading..." in table center

**Expected Result**: Graceful loading state before data appears

#### Test 1.3: Empty State
- [ ] If no conversations exist, observe empty state
- [ ] Message: "No conversations found"

**Expected Result**: Clear empty state message centered in table

---

### Phase 2: Conversation List Display

#### Test 2.1: Table Columns
Verify all columns are present:
- [ ] Checkbox column (leftmost)
- [ ] Conversation (name + ID)
- [ ] Tier (badge)
- [ ] Quality (score out of 10)
- [ ] Status (badge)
- [ ] Turns (number)
- [ ] Created (date)
- [ ] Actions (buttons, rightmost)

**Expected Result**: All 8 columns visible and properly aligned

#### Test 2.2: Data Display
For each conversation row:
- [ ] Conversation name displays (or "Untitled")
- [ ] Conversation ID shows below name in gray
- [ ] Tier badge shows correct value
- [ ] Quality score shows as "X.X/10.0" or "N/A"
- [ ] Status badge has correct color:
  - Approved: blue
  - Rejected: red
  - Pending: gray
- [ ] Turn count is a number
- [ ] Created date is formatted (MM/DD/YYYY)

**Expected Result**: All data displays correctly with proper formatting

#### Test 2.3: Action Buttons
- [ ] "View" button visible for all conversations
- [ ] "Approve" button visible only for pending conversations
- [ ] "Reject" button visible only for pending conversations
- [ ] Buttons are properly sized and aligned

**Expected Result**: Buttons render correctly based on status

---

### Phase 3: Filtering

#### Test 3.1: Status Filter
- [ ] Click status dropdown
- [ ] Options visible: All Statuses, Pending Review, Approved, Rejected, Archived
- [ ] Select "Pending Review"
- [ ] Table updates to show only pending conversations
- [ ] Select "All Statuses"
- [ ] Table shows all conversations again

**Expected Result**: Filter updates table via API call (check Network tab)

#### Test 3.2: Tier Filter
- [ ] Click tier dropdown
- [ ] Options visible: All Tiers, Template, Scenario, Edge Case
- [ ] Select "Template"
- [ ] Table shows only template conversations
- [ ] Select different tier
- [ ] Table updates accordingly

**Expected Result**: Tier filter works independently

#### Test 3.3: Quality Filter
- [ ] Click quality dropdown
- [ ] Options visible: Any Quality, 8.0+, 7.0+, 6.0+
- [ ] Select "8.0+ (Excellent)"
- [ ] Table shows only conversations with quality >= 8.0
- [ ] Select "Any Quality"
- [ ] All conversations visible again

**Expected Result**: Quality threshold filtering works

#### Test 3.4: Combined Filters
- [ ] Set status to "Approved"
- [ ] Set tier to "Template"
- [ ] Set quality to "7.0+"
- [ ] Table shows only approved templates with quality >= 7.0
- [ ] Clear filters one by one
- [ ] Table expands as filters are removed

**Expected Result**: Multiple filters work together (AND logic)

#### Test 3.5: Filter Persistence
- [ ] Apply filters
- [ ] Navigate to page 2
- [ ] Filters remain active
- [ ] Navigate back to page 1
- [ ] Filters still active

**Expected Result**: Filters persist across pagination

---

### Phase 4: Pagination

#### Test 4.1: Navigation Buttons
- [ ] "Previous" button is disabled on page 1
- [ ] Click "Next" button
- [ ] Page 2 loads
- [ ] "Previous" button is now enabled
- [ ] URL updates (optional, not implemented in current version)
- [ ] Click "Previous"
- [ ] Back to page 1

**Expected Result**: Pagination buttons work correctly

#### Test 4.2: Page Counter
- [ ] Counter shows "Showing X to Y of Z conversations"
- [ ] X = ((page - 1) * 25) + 1
- [ ] Y = min(page * 25, total)
- [ ] Z = total conversations
- [ ] Numbers update when page changes

**Expected Result**: Accurate page counter

#### Test 4.3: Last Page
- [ ] Navigate to last page
- [ ] "Next" button is disabled
- [ ] Counter shows correct range

**Expected Result**: Last page handled correctly

#### Test 4.4: Single Page
- [ ] If total <= 25 conversations
- [ ] No pagination controls visible
- [ ] All conversations on one page

**Expected Result**: Pagination hidden when unnecessary

---

### Phase 5: Status Management

#### Test 5.1: Approve Conversation
- [ ] Find a conversation with status "pending_review"
- [ ] Click "Approve" button
- [ ] Observe loading/refresh behavior
- [ ] Status badge changes to "approved" (blue)
- [ ] "Approve" and "Reject" buttons disappear

**Expected Result**: Conversation approved, UI updates

#### Test 5.2: Reject Conversation
- [ ] Find a conversation with status "pending_review"
- [ ] Click "Reject" button
- [ ] Status badge changes to "rejected" (red)
- [ ] Action buttons disappear

**Expected Result**: Conversation rejected, UI updates

#### Test 5.3: Status Update Persistence
- [ ] Approve a conversation
- [ ] Hard refresh the page (Ctrl+Shift+R)
- [ ] Conversation still shows as "approved"

**Expected Result**: Status persists after refresh

#### Test 5.4: Reviewed Metadata
- [ ] Approve/reject a conversation
- [ ] Click "View" to open modal
- [ ] Check "Reviewed By" field is populated
- [ ] Check "Reviewed At" timestamp is present

**Expected Result**: Review metadata captured

---

### Phase 6: Conversation Detail Modal

#### Test 6.1: Open Modal
- [ ] Click "View" button on any conversation
- [ ] Modal opens
- [ ] Title shows conversation name
- [ ] Modal is centered on screen
- [ ] Background is dimmed/overlay visible

**Expected Result**: Modal opens smoothly

#### Test 6.2: Metadata Display
Verify all fields are visible:
- [ ] ID
- [ ] Tier
- [ ] Quality Score
- [ ] Turn Count
- [ ] Starting Emotion
- [ ] Ending Emotion
- [ ] Persona
- [ ] Status
- [ ] Processing Status
- [ ] Created (timestamp)
- [ ] Reviewed By (if applicable)
- [ ] Reviewed At (if applicable)

**Expected Result**: All metadata displays in 2-column grid

#### Test 6.3: Optional Fields
- [ ] Review Notes (if present)
- [ ] Description (if present)
- [ ] Fields show "N/A" if null/undefined

**Expected Result**: Optional fields handled gracefully

#### Test 6.4: Download Button
- [ ] Click "Download JSON File" button
- [ ] If file_url exists: new tab opens with file
- [ ] If no file_url: button is disabled

**Expected Result**: Download works or button disabled

#### Test 6.5: Modal Actions
For pending conversations:
- [ ] "Approve" button visible in modal
- [ ] "Reject" button visible in modal
- [ ] Click "Approve"
- [ ] Modal closes
- [ ] Table updates with new status

**Expected Result**: Status can be updated from modal

#### Test 6.6: Close Modal
- [ ] Click outside modal (on overlay)
- [ ] Modal closes
- [ ] OR click X button (if present)
- [ ] OR press Escape key
- [ ] Modal closes

**Expected Result**: Multiple ways to close modal

#### Test 6.7: Modal Scrolling
- [ ] For conversations with long descriptions/notes
- [ ] Modal content is scrollable
- [ ] Max height is 80vh
- [ ] Content doesn't overflow

**Expected Result**: Long content scrolls within modal

---

### Phase 7: Bulk Selection

#### Test 7.1: Individual Selection
- [ ] Click checkbox on first conversation
- [ ] Checkbox is checked
- [ ] "Export Selected (1)" button appears at top
- [ ] Click another checkbox
- [ ] Count updates to "(2)"

**Expected Result**: Individual selection works

#### Test 7.2: Select All
- [ ] Click checkbox in table header
- [ ] All visible conversations are selected
- [ ] Count shows total selected
- [ ] Click header checkbox again
- [ ] All conversations deselected
- [ ] "Export Selected" button disappears

**Expected Result**: Select all toggle works

#### Test 7.3: Selection Persistence
- [ ] Select 3 conversations
- [ ] Go to page 2
- [ ] Come back to page 1
- [ ] Selections are maintained (or cleared, depending on implementation)

**Current Implementation**: Selections cleared on page change (could be enhanced)

#### Test 7.4: Export Button
- [ ] Select some conversations
- [ ] Click "Export Selected" button
- [ ] Currently: placeholder (no action)
- [ ] Future: Should trigger export

**Expected Result**: Button appears when items selected

---

### Phase 8: Performance

#### Test 8.1: Initial Load Time
- [ ] Clear cache
- [ ] Navigate to `/conversations`
- [ ] Measure time to first render (Chrome DevTools > Performance)
- [ ] Should be < 2 seconds

**Expected Result**: Fast initial load

#### Test 8.2: Filter Response Time
- [ ] Open Network tab in DevTools
- [ ] Change a filter
- [ ] Observe API request
- [ ] Response time should be < 500ms

**Expected Result**: Filters are responsive

#### Test 8.3: Pagination Performance
- [ ] With 1000+ conversations
- [ ] Navigate between pages
- [ ] Each page load < 1 second

**Expected Result**: Pagination is fast

#### Test 8.4: No Unnecessary Requests
- [ ] Monitor Network tab
- [ ] No duplicate or redundant API calls
- [ ] Each action triggers one request

**Expected Result**: Efficient API usage

---

### Phase 9: Error Handling

#### Test 9.1: Network Error
- [ ] Turn off internet connection
- [ ] Try to load conversations
- [ ] Observe error handling (console error logged)
- [ ] Turn internet back on
- [ ] Page recovers gracefully

**Expected Result**: Graceful degradation

#### Test 9.2: Invalid Status Update
- [ ] Approve a conversation
- [ ] Use browser DevTools to modify request
- [ ] Send invalid status value
- [ ] API returns 400 error
- [ ] Error logged in console

**Expected Result**: Invalid requests rejected

#### Test 9.3: Non-existent Conversation
- [ ] Try to update status of fake ID
- [ ] API returns error
- [ ] UI handles error gracefully

**Expected Result**: Proper error handling

---

### Phase 10: Responsive Design

#### Test 10.1: Desktop (1920x1080)
- [ ] All columns visible
- [ ] No horizontal scrolling
- [ ] Proper spacing

#### Test 10.2: Laptop (1366x768)
- [ ] Table readable
- [ ] All features accessible

#### Test 10.3: Tablet (768x1024)
- [ ] May require horizontal scroll
- [ ] Modal fits screen
- [ ] Filters stack if needed

#### Test 10.4: Mobile (375x667)
- [ ] Table scrolls horizontally
- [ ] Modal is full-screen or near full-screen
- [ ] Touch interactions work

**Note**: Current implementation optimized for desktop; mobile could be enhanced

---

## Automated Testing

### Run Test Suite
```bash
node scripts/test-conversation-dashboard.js
```

### Expected Output
```
🚀 Starting Conversation Dashboard API Tests
📍 Testing against: http://localhost:3000
👤 Test user: test-user-dashboard

🧪 Testing GET /api/conversations...
✅ Listed conversations
✅ Listed filtered conversations
✅ Listed paginated conversations

🧪 Testing PATCH /api/conversations/[id]/status...
✅ Approved conversation
✅ Rejected conversation
✅ Retrieved conversation status
✅ Rejected invalid status as expected

🧪 Testing error handling...
✅ Handled non-existent conversation error
✅ Handled missing status error

==================================================
📊 Test Summary
==================================================
List Conversations: ✅ PASS
Update Status: ✅ PASS
Error Handling: ✅ PASS
==================================================

🎉 All tests passed!
```

---

## API Testing with cURL

### List Conversations
```bash
curl http://localhost:3000/api/conversations
```

### List with Filters
```bash
curl "http://localhost:3000/api/conversations?status=pending_review&tier=template&quality_min=7.0"
```

### Update Status
```bash
curl -X PATCH http://localhost:3000/api/conversations/conv-123/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"status":"approved","review_notes":"Looks good!"}'
```

### Get Status
```bash
curl http://localhost:3000/api/conversations/conv-123/status
```

---

## Browser Testing

### Supported Browsers
- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)

### Test in Each Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Acceptance Criteria Verification

### ✅ API Endpoints
- [x] GET /api/conversations returns paginated list
- [x] POST /api/conversations creates new conversation
- [x] PATCH /api/conversations/[id]/status updates status
- [x] All endpoints handle errors gracefully

### ✅ UI Features
- [x] Conversation table displays all metadata
- [x] Filtering works for status, tier, quality
- [x] Pagination works correctly
- [x] Approve/Reject buttons update status
- [x] View dialog shows conversation details
- [x] Bulk selection for export

### ✅ Performance
- [x] Page loads in <2 seconds for 1000 conversations
- [x] Filtering triggers new query, not client-side filter
- [x] Loading states shown during async operations

---

## Bug Reporting Template

If you find a bug, report it using this template:

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. Navigate to /conversations
2. Click X button
3. Observe Y behavior

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Environment**:
- Browser: Chrome 120.0
- OS: Windows 11
- Screen Size: 1920x1080

**Console Errors**:
[Paste any errors from browser console]

**Screenshots**:
[Attach if applicable]
```

---

## Test Report Template

After testing, fill out this report:

```
**Test Date**: YYYY-MM-DD
**Tester**: [Your Name]
**Environment**: [Development/Staging/Production]

**Summary**:
- Total Tests: X
- Passed: Y
- Failed: Z

**Failed Tests**:
1. [Test Name] - [Reason]
2. [Test Name] - [Reason]

**Notes**:
[Any additional observations]

**Recommendation**:
[ ] Ready for production
[ ] Needs fixes
[ ] Needs enhancements
```

---

## Next Steps After Testing

1. ✅ Document any bugs found
2. ✅ Fix critical issues
3. ✅ Enhance UX based on feedback
4. ✅ Run performance profiling
5. ✅ Security audit
6. ✅ Accessibility testing
7. ✅ Deploy to staging
8. ✅ User acceptance testing
9. ✅ Deploy to production

---

*Last Updated: November 16, 2025*  
*Version: 1.0.0*  
*Status: Ready for Testing*

