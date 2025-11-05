# Export Modal UI - Validation Checklist

**Version:** 1.0  
**Date:** 2025-10-31  
**Status:** Ready for Testing

---

## Pre-Testing Setup

- [ ] Server is running (`npm run dev` in train-wireframe)
- [ ] Database has sample conversation data
- [ ] Export API endpoint is accessible
- [ ] Browser console is open for debugging
- [ ] Test data includes various conversation states (draft, approved, rejected, etc.)

---

## Component Testing

### 1. ExportScopeSelector Testing ✅

#### Visual Testing
- [ ] Component renders correctly
- [ ] All 4 radio options are visible
- [ ] Icons display correctly (Users, Filter, CheckCircle, Database)
- [ ] Badges show correct counts
- [ ] Labels and descriptions are readable

#### Functional Testing
- [ ] Can select each scope option
- [ ] Selected option shows visual distinction (border, background, ring)
- [ ] Hover effects work on all options
- [ ] Disabled state works when no conversations selected
- [ ] Badge counts update dynamically

#### Count Accuracy
- [ ] **Selected count** matches `selectedConversationIds.length`
- [ ] **Filtered count** matches conversations after applying filters
- [ ] **Approved count** matches conversations with `status === 'approved'`
- [ ] **All count** matches total `conversations.length`

#### Keyboard Navigation
- [ ] Tab focuses on the radio group
- [ ] Arrow Up/Down navigates between options
- [ ] Space/Enter selects an option
- [ ] Selected state updates correctly

---

### 2. ExportFormatSelector Testing ✅

#### Visual Testing
- [ ] All 4 format options render
- [ ] Emojis display correctly (📄, 🔧, 📊, 📝)
- [ ] Icons display correctly (FileCode, FileJson, FileSpreadsheet, FileText)
- [ ] "Recommended" badge shows on JSONL
- [ ] Descriptions are visible and readable

#### Tooltip Testing
- [ ] Hover over each option shows tooltip
- [ ] Tooltip contains format name, description, and features
- [ ] Tooltip positioning is correct (doesn't overflow screen)
- [ ] Tooltip disappears on mouse leave

#### Functional Testing
- [ ] Can select each format option
- [ ] Selected format shows visual distinction
- [ ] Hover effects work correctly
- [ ] Preview updates when format changes

#### Keyboard Navigation
- [ ] Tab focuses on the radio group
- [ ] Arrow keys navigate between formats
- [ ] Space/Enter selects a format
- [ ] Tooltips can be triggered with keyboard (focus)

---

### 3. ExportOptionsPanel Testing ✅

#### Accordion Testing
- [ ] Accordion starts collapsed (or expanded based on design)
- [ ] Click trigger to expand/collapse
- [ ] Expand animation is smooth
- [ ] Shows "X / 6 enabled" count correctly

#### Options Testing
- [ ] All 6 checkboxes render correctly
- [ ] Default state matches expected values
  - [ ] Include Metadata: checked
  - [ ] Include Quality Scores: checked
  - [ ] Include Timestamps: checked
  - [ ] Include Approval History: unchecked
  - [ ] Include Parent References: unchecked
  - [ ] Include Full Content: checked

#### Tooltip Testing
- [ ] Help icon (ⓘ) visible for each option
- [ ] Hover shows detailed tooltip
- [ ] Tooltip text explains what each option does
- [ ] Tooltips position correctly

#### Functional Testing
- [ ] Can toggle each checkbox on/off
- [ ] "Recommended" tags show on key options
- [ ] "Reset to Defaults" button works
- [ ] Count in header updates when toggling
- [ ] Preview updates when options change

#### Keyboard Navigation
- [ ] Tab navigates through all checkboxes
- [ ] Space toggles checkbox state
- [ ] Enter activates "Reset to Defaults" button

---

### 4. ExportPreview Testing ✅

#### General Testing
- [ ] Preview renders for each format
- [ ] Shows "First 3 of N" count correctly
- [ ] Empty state shows when no conversations
- [ ] Show/Hide preview button works
- [ ] Copy button copies content to clipboard

#### JSONL Format Testing
- [ ] Renders line-by-line view
- [ ] Each line shows character count badge
- [ ] Lines can be expanded/collapsed
- [ ] Expanded view shows prettified JSON
- [ ] Color coding for different JSON elements

#### JSON Format Testing
- [ ] Renders array of objects
- [ ] Shows "Conversation N" with field count
- [ ] Objects can be expanded/collapsed
- [ ] Pretty-printed with proper indentation
- [ ] Syntax highlighting works

#### CSV Format Testing
- [ ] Renders as table with headers
- [ ] Shows first 10 rows
- [ ] Table is scrollable if needed
- [ ] Shows "Showing first 10 rows of N" message
- [ ] Cells are properly aligned

#### Markdown Format Testing
- [ ] Renders formatted markdown
- [ ] Headings display correctly (H1, H2, H3)
- [ ] Bold text renders
- [ ] Lists render with bullets
- [ ] Horizontal rules display
- [ ] Line breaks are preserved

#### Options Integration
- [ ] Preview reflects toggled options
- [ ] Unchecking "Include Metadata" removes metadata fields
- [ ] Unchecking "Include Full Content" removes turns
- [ ] All option combinations work correctly

#### Copy to Clipboard
- [ ] Click copy button
- [ ] Button shows "Copied!" feedback
- [ ] Success toast displays
- [ ] Paste clipboard - content matches preview
- [ ] Button resets after 2 seconds

---

### 5. ExportModal Integration Testing ✅

#### Modal Opening
- [ ] Modal opens when clicking "Export" button in dashboard
- [ ] Modal shows with proper animation
- [ ] Modal is centered on screen
- [ ] Backdrop overlay visible

#### State Initialization
- [ ] Default scope is "All Data"
- [ ] Default format is "JSONL"
- [ ] Default options match specification
- [ ] Counts are calculated correctly on open

#### Dynamic Updates
- [ ] Changing scope updates counts
- [ ] Changing scope updates preview
- [ ] Changing scope updates summary
- [ ] Changing format updates preview
- [ ] Toggling options updates preview
- [ ] All updates happen without lag

#### Export Summary Panel
- [ ] Shows correct conversation count
- [ ] Shows selected format
- [ ] Shows filename with current date
- [ ] Updates when settings change

#### Warning Alert
- [ ] Shows when conversationsToExport.length === 0
- [ ] Contains helpful message
- [ ] Uses appropriate icon
- [ ] Dismiss/hidden when conversations available

#### Modal Closing
- [ ] Click Cancel button closes modal
- [ ] Click X button closes modal
- [ ] Press Escape key closes modal
- [ ] Click backdrop closes modal
- [ ] State resets on close (or persists based on requirements)

---

## Export Workflow Testing

### Successful Export (Synchronous)

#### Test Case 1: Export Selected Conversations
- [ ] Select 5 conversations in dashboard
- [ ] Open export modal
- [ ] Verify "Selected" scope shows count of 5
- [ ] Select "Selected" scope
- [ ] Choose JSONL format
- [ ] Click "Export 5 Conversations"

**Expected Results:**
- [ ] Button shows loading state ("Exporting...")
- [ ] Button is disabled during export
- [ ] API call is made to `/api/export/conversations`
- [ ] Request payload includes `conversationIds` array
- [ ] Response status is "completed"
- [ ] Success toast displays with count and file size
- [ ] File download is triggered
- [ ] Modal closes automatically

#### Test Case 2: Export with Filters
- [ ] Apply filters (e.g., status=approved, qualityScore>80)
- [ ] Open export modal
- [ ] Verify "Filtered" scope shows correct count
- [ ] Select "Filtered" scope
- [ ] Choose JSON format
- [ ] Toggle some options
- [ ] Click Export

**Expected Results:**
- [ ] API request includes `filters` object
- [ ] Correct format in request (`format: "json"`)
- [ ] Options reflected in request config
- [ ] Export completes successfully
- [ ] Correct file format downloaded

#### Test Case 3: Export All Approved
- [ ] Open export modal
- [ ] Select "All Approved" scope
- [ ] Choose CSV format
- [ ] Click Export

**Expected Results:**
- [ ] Exports only approved conversations
- [ ] CSV file downloads
- [ ] File opens correctly in spreadsheet app

#### Test Case 4: Export All Data
- [ ] Open export modal
- [ ] Select "All Data" scope
- [ ] Choose Markdown format
- [ ] Click Export

**Expected Results:**
- [ ] Exports entire dataset
- [ ] Markdown file downloads
- [ ] File is human-readable

---

### Background Export (Large Dataset)

#### Test Case 5: Export >500 Conversations
- [ ] Ensure test data has >500 conversations
- [ ] Open export modal
- [ ] Configure export
- [ ] Click Export

**Expected Results:**
- [ ] API response status is "queued"
- [ ] Toast shows "Export queued for background processing"
- [ ] Message includes conversation count
- [ ] Modal closes
- [ ] No file downloads immediately

---

### Error Handling Testing

#### Test Case 6: No Conversations Selected
- [ ] Don't select any conversations
- [ ] Open export modal
- [ ] Try to select "Selected" scope

**Expected Results:**
- [ ] "Selected" option is disabled
- [ ] Cannot select disabled option
- [ ] Tooltip or message explains why

#### Test Case 7: Empty Selection
- [ ] Select "All Approved" when no approved conversations exist
- [ ] Click Export

**Expected Results:**
- [ ] Warning alert shows
- [ ] Export button is disabled
- [ ] Clear message explains issue

#### Test Case 8: API Error
- [ ] Stop backend server
- [ ] Attempt to export

**Expected Results:**
- [ ] Error toast displays
- [ ] Error message is clear and helpful
- [ ] Modal stays open
- [ ] Can retry after fixing issue

#### Test Case 9: Network Timeout
- [ ] Simulate slow/timeout network
- [ ] Attempt export

**Expected Results:**
- [ ] Loading state persists appropriately
- [ ] Eventually shows error
- [ ] User can retry

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements in order
- [ ] Shift+Tab navigates backwards
- [ ] Arrow keys work in radio groups
- [ ] Space toggles checkboxes
- [ ] Enter activates buttons
- [ ] Escape closes modal
- [ ] Focus indicators are visible

### Screen Reader Testing
- [ ] All interactive elements have labels
- [ ] Radio options are announced correctly
- [ ] Checkbox states are announced
- [ ] Button labels are descriptive
- [ ] Error messages are announced
- [ ] Success messages are announced

### Visual Accessibility
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators are visible
- [ ] Color is not sole indicator of state
- [ ] Text is readable at 200% zoom
- [ ] No content hidden by overflow at normal zoom

---

## Performance Testing

### Response Time
- [ ] Modal opens in <200ms
- [ ] Scope selection updates in <100ms
- [ ] Format change updates in <100ms
- [ ] Preview renders in <300ms
- [ ] Export initiates in <500ms

### Large Dataset
- [ ] Test with 100 conversations - smooth
- [ ] Test with 500 conversations - acceptable
- [ ] Test with 1000+ conversations - background processing triggers

### Memory Usage
- [ ] No memory leaks when opening/closing modal multiple times
- [ ] Preview doesn't load all conversations (only first 3)
- [ ] Filtering doesn't duplicate conversation arrays

---

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest) - all features work
- [ ] Firefox (latest) - all features work
- [ ] Safari (latest) - all features work
- [ ] Edge (latest) - all features work

### Mobile Browsers
- [ ] Chrome Mobile - responsive layout
- [ ] Safari Mobile - responsive layout
- [ ] Modal is scrollable on small screens
- [ ] Buttons are tappable (not too small)

---

## Edge Cases

### Data Edge Cases
- [ ] 0 conversations in database
- [ ] 1 conversation available
- [ ] All conversations same status
- [ ] No filters applied
- [ ] Complex filter combinations

### UI Edge Cases
- [ ] Very long conversation titles
- [ ] Very large conversation counts (>10,000)
- [ ] Very long option descriptions
- [ ] Small screen resolution (1024x768)
- [ ] Large screen resolution (2560x1440)

### Network Edge Cases
- [ ] Slow network (3G simulation)
- [ ] Intermittent connection
- [ ] Backend returns 4xx error
- [ ] Backend returns 5xx error
- [ ] Malformed API response

---

## Integration Testing

### Dashboard Integration
- [ ] Export button in FilterBar opens modal
- [ ] Modal uses correct Zustand store
- [ ] Selected conversations passed correctly
- [ ] Filters passed correctly
- [ ] Modal state persists during session

### API Integration
- [ ] Request format matches API schema
- [ ] All required fields included
- [ ] Optional fields handled correctly
- [ ] Response parsed correctly
- [ ] Error responses handled

---

## Regression Testing

### After Code Changes
- [ ] Re-run all functional tests
- [ ] Verify no visual regressions
- [ ] Check console for errors/warnings
- [ ] Test all keyboard shortcuts
- [ ] Verify tooltips still work

---

## User Acceptance Testing

### User Tasks
- [ ] Export my selected conversations
- [ ] Export all approved conversations
- [ ] Get conversations in different formats
- [ ] Preview before exporting
- [ ] Copy preview to clipboard
- [ ] Cancel export and close modal

### User Feedback
- [ ] UI is intuitive
- [ ] Labels are clear
- [ ] Feedback is immediate
- [ ] Error messages are helpful
- [ ] Loading states are clear

---

## Final Checks

### Code Quality
- [ ] No linter errors
- [ ] No console errors
- [ ] No console warnings
- [ ] TypeScript types are correct
- [ ] Code is well-commented

### Documentation
- [ ] Implementation summary complete
- [ ] Quick reference guide available
- [ ] Visual reference documented
- [ ] API integration documented
- [ ] Known issues documented

### Deployment Ready
- [ ] All tests passing
- [ ] No blocking bugs
- [ ] Performance acceptable
- [ ] Accessibility compliant
- [ ] Browser compatible

---

## Sign-off

### Testing Results

**Total Tests:** 150+  
**Tests Passed:** ___  
**Tests Failed:** ___  
**Blockers:** ___

### Test Environment

**Browser:** _______________  
**OS:** _______________  
**Screen Resolution:** _______________  
**Network:** _______________

### Tester Sign-off

**Tested By:** _______________  
**Date:** _______________  
**Status:** [ ] Pass [ ] Fail [ ] Conditional Pass  
**Notes:** _______________

---

## Known Issues (If Any)

| Issue ID | Description | Severity | Status |
|----------|-------------|----------|--------|
| ___ | ___ | ___ | ___ |

---

## Recommended Improvements (Future)

1. Export configuration templates
2. Export history view
3. Schedule recurring exports
4. Batch export multiple formats
5. Custom field selection
6. Export progress indicator for large datasets

---

**END OF VALIDATION CHECKLIST**

