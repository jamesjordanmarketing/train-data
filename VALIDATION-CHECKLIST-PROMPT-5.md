# Template Testing & Analytics - Validation Checklist

Use this checklist to validate that all features are working correctly.

---

## Pre-Deployment Validation

### Environment Setup ✓

- [ ] Node.js version >= 18
- [ ] Dependencies installed (`npm install`)
- [ ] Database migrations applied
- [ ] Environment variables configured:
  - [ ] `ANTHROPIC_API_KEY` (optional for testing, required for production)
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`

---

## API Endpoint Testing

### Template Testing API

**Test 1: Basic Template Test**
```bash
curl -X POST http://localhost:3000/api/templates/test \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "<valid-template-id>",
    "parameters": {}
  }'
```

**Expected**:
- [ ] Returns 200 OK
- [ ] Response includes `templateId`
- [ ] Response includes `qualityScore`
- [ ] Response includes `qualityBreakdown`
- [ ] Response includes `passedTest` boolean
- [ ] Response includes `executionTimeMs`
- [ ] Response includes `warnings` array
- [ ] Response includes `errors` array

**Test 2: Missing Template ID**
```bash
curl -X POST http://localhost:3000/api/templates/test \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected**:
- [ ] Returns 400 Bad Request
- [ ] Error message: "templateId is required"

**Test 3: Invalid Template ID**
```bash
curl -X POST http://localhost:3000/api/templates/test \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "non-existent-id",
    "parameters": {}
  }'
```

**Expected**:
- [ ] Returns 404 Not Found
- [ ] Error message: "Template not found"

**Test 4: With Baseline Comparison**
```bash
curl -X POST http://localhost:3000/api/templates/test \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "<valid-template-id>",
    "parameters": {},
    "compareToBaseline": true
  }'
```

**Expected**:
- [ ] Returns 200 OK
- [ ] Response includes `baselineComparison` object (if baseline exists)
- [ ] `baselineComparison.avgQualityScore` is a number
- [ ] `baselineComparison.deviation` is a number

---

### Analytics API

**Test 5: Get All Templates Analytics**
```bash
curl http://localhost:3000/api/templates/analytics
```

**Expected**:
- [ ] Returns 200 OK
- [ ] Response includes `summary` object
- [ ] Response includes `analytics` array
- [ ] Response includes `timestamp`
- [ ] `summary.totalTemplates` matches template count
- [ ] `summary.topPerformers` is an array
- [ ] `summary.bottomPerformers` is an array
- [ ] `summary.usageByTier` has template/scenario/edge_case keys
- [ ] `summary.qualityByTier` has template/scenario/edge_case keys

**Test 6: Filter by Tier**
```bash
curl http://localhost:3000/api/templates/analytics?tier=template
```

**Expected**:
- [ ] Returns 200 OK
- [ ] All templates in `analytics` array have `tier: "template"`
- [ ] Summary reflects filtered data

**Test 7: Get Specific Template Analytics**
```bash
curl http://localhost:3000/api/templates/analytics?templateId=<valid-id>
```

**Expected**:
- [ ] Returns 200 OK
- [ ] Response is a single analytics object (not array)
- [ ] Object includes all required fields (usageCount, avgQualityScore, etc.)

**Test 8: Invalid Template ID**
```bash
curl http://localhost:3000/api/templates/analytics?templateId=invalid
```

**Expected**:
- [ ] Returns 404 Not Found
- [ ] Error message: "Template not found"

---

## UI Component Testing

### Template Test Modal

**Test 9: Open Test Modal**
- [ ] Navigate to Templates view
- [ ] Click "..." menu on a template
- [ ] Click "Test Template"
- [ ] Modal opens with template name in header
- [ ] All template variables show as input fields
- [ ] "Auto-Generate" button is visible
- [ ] "Execute Test" button is visible

**Test 10: Parameter Inputs**
- [ ] Text inputs accept text
- [ ] Number inputs accept numbers
- [ ] Dropdown inputs show options
- [ ] Default values are pre-filled (if defined)

**Test 11: Auto-Generate**
- [ ] Click "Auto-Generate" button
- [ ] All inputs are filled with sample data
- [ ] Sample data is contextually appropriate
- [ ] Can edit auto-generated values

**Test 12: Preview**
- [ ] "Show Resolved Template Preview" checkbox works
- [ ] Preview updates when parameters change
- [ ] Placeholders are replaced with parameter values
- [ ] Preview is scrollable for long templates

**Test 13: Execute Test**
- [ ] Click "Execute Test" button
- [ ] Button shows loading state
- [ ] Button is disabled during execution
- [ ] Results appear after execution
- [ ] Loading spinner shows during execution

**Test 14: Test Results Display**
- [ ] Overall pass/fail status is clear
- [ ] Quality score percentage is displayed
- [ ] Quality breakdown shows all 6 metrics
- [ ] Each metric has a progress bar
- [ ] Progress bars are color-coded (green/yellow/red)
- [ ] Confidence level is displayed
- [ ] Training value is displayed
- [ ] Execution time is shown

**Test 15: Baseline Comparison (if enabled)**
- [ ] Baseline comparison section appears
- [ ] Average baseline score is shown
- [ ] Deviation percentage is shown
- [ ] Deviation is color-coded (green for positive, red for negative)

**Test 16: API Response Display**
- [ ] API response section is visible
- [ ] Model name is shown
- [ ] Token counts are shown (input/output)
- [ ] Response content is displayed
- [ ] Content is scrollable

**Test 17: Warnings Display**
- [ ] Warnings section appears if warnings exist
- [ ] Each warning is listed
- [ ] Warnings are styled appropriately (yellow)

**Test 18: Modal Close**
- [ ] Click X button to close
- [ ] Modal closes
- [ ] Click "Close" button at bottom
- [ ] Modal closes
- [ ] Modal state is reset when reopened

---

### Analytics Dashboard

**Test 19: Open Dashboard**
- [ ] Click "Analytics" button
- [ ] Dashboard opens in full-screen
- [ ] Close button is visible
- [ ] Export CSV button is visible
- [ ] Dashboard loads without errors

**Test 20: Summary Cards**
- [ ] "Total Templates" card shows count
- [ ] "Total Usage" card shows usage count
- [ ] "Avg Quality Score" card shows percentage
- [ ] "Best Performer" card shows template name
- [ ] All numbers are formatted correctly

**Test 21: Usage by Tier Chart**
- [ ] Pie chart renders
- [ ] Chart shows three segments (template/scenario/edge_case)
- [ ] Labels show tier names and values
- [ ] Colors are distinct
- [ ] Tooltip shows on hover

**Test 22: Quality by Tier Chart**
- [ ] Bar chart renders
- [ ] Chart shows three bars
- [ ] Y-axis shows 0-100 scale
- [ ] X-axis shows tier names
- [ ] Tooltip shows values on hover

**Test 23: Top Performers Section**
- [ ] Section shows up to 5 templates
- [ ] Templates are ranked #1-#5
- [ ] Each shows template name
- [ ] Each shows tier and usage count
- [ ] Each shows quality percentage
- [ ] Each shows trend indicator
- [ ] Trend indicators are correct (📈📉➡️)

**Test 24: Search Functionality**
- [ ] Type in search box
- [ ] Table filters in real-time
- [ ] Matching templates are shown
- [ ] Non-matching templates are hidden
- [ ] Clear search shows all templates again

**Test 25: Tier Filter**
- [ ] Select "All Tiers" - shows all
- [ ] Select "Templates" - shows only templates
- [ ] Select "Scenarios" - shows only scenarios
- [ ] Select "Edge Cases" - shows only edge cases
- [ ] Charts update to reflect filter

**Test 26: Sort Functionality**
- [ ] Select "Usage Count" - table sorts by usage
- [ ] Select "Quality Score" - table sorts by quality
- [ ] Select "Approval Rate" - table sorts by approval
- [ ] Click "↑ Ascending" - order reverses
- [ ] Click "↓ Descending" - order reverses

**Test 27: Analytics Table**
- [ ] All templates are listed
- [ ] Each row shows:
  - [ ] Template name
  - [ ] Tier badge (colored)
  - [ ] Usage count
  - [ ] Avg quality score (colored)
  - [ ] Approval rate percentage
  - [ ] Trend indicator
  - [ ] Last used date and time
- [ ] Top parameters show (if available)
- [ ] Table is scrollable

**Test 28: CSV Export**
- [ ] Click "Export CSV" button
- [ ] File downloads automatically
- [ ] File name includes date
- [ ] Open CSV file
- [ ] Headers are correct
- [ ] Data matches table
- [ ] All columns are included

**Test 29: Refresh**
- [ ] Click "Refresh" button
- [ ] Loading state shows
- [ ] Data reloads
- [ ] Changes are reflected

**Test 30: Close Dashboard**
- [ ] Click "Close" button
- [ ] Dashboard closes
- [ ] Returns to Templates view
- [ ] Can reopen without errors

---

## Integration Testing

### Template Testing Integration

**Test 31: End-to-End Template Test**
- [ ] Create a new template with variables
- [ ] Test the template
- [ ] Verify results are saved to database
- [ ] Test same template again
- [ ] Verify baseline comparison works

**Test 32: Claude API Integration**
- [ ] Configure valid API key
- [ ] Test a template
- [ ] Verify actual API call is made
- [ ] Check response contains Claude's output
- [ ] Verify token counts are tracked

**Test 33: Error Handling**
- [ ] Test with invalid API key
- [ ] Verify graceful error message
- [ ] Test with network timeout
- [ ] Verify appropriate error handling
- [ ] Test with malformed template
- [ ] Verify validation errors

---

### Analytics Integration

**Test 34: Analytics Calculation**
- [ ] Create test data (templates + conversations)
- [ ] Open analytics dashboard
- [ ] Verify calculated statistics are correct
- [ ] Verify trends are calculated correctly
- [ ] Verify aggregations are accurate

**Test 35: Performance**
- [ ] Load 100+ templates
- [ ] Open analytics dashboard
- [ ] Measure load time (should be <3 seconds)
- [ ] Verify UI remains responsive
- [ ] Test with 1000+ templates (if possible)
- [ ] Verify performance is acceptable (<5 seconds)

**Test 36: Real-time Updates**
- [ ] Open analytics dashboard
- [ ] Generate new conversation in another tab
- [ ] Click refresh
- [ ] Verify new data is shown

---

## Cross-Browser Testing

**Test 37: Browser Compatibility**
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work

**Test 38: Responsive Design**
- [ ] Desktop (1920x1080): UI looks good
- [ ] Laptop (1366x768): UI looks good
- [ ] Tablet (768x1024): UI adapts properly
- [ ] Mobile (375x667): UI is usable

---

## Security Testing

**Test 39: Parameter Injection Security**
- [ ] Test with HTML in parameters
- [ ] Verify HTML is escaped
- [ ] Test with script tags
- [ ] Verify scripts don't execute
- [ ] Test with SQL-like syntax
- [ ] Verify no SQL injection

**Test 40: API Security**
- [ ] Test API without authentication (if required)
- [ ] Verify proper error response
- [ ] Test with invalid tokens
- [ ] Verify proper error response

---

## Error Scenarios

**Test 41: Network Errors**
- [ ] Disconnect network
- [ ] Try to test template
- [ ] Verify error message is shown
- [ ] Try to load analytics
- [ ] Verify error message is shown

**Test 42: Database Errors**
- [ ] Stop database (if possible in test env)
- [ ] Try to load analytics
- [ ] Verify graceful error handling
- [ ] Verify user-friendly error message

**Test 43: Missing Data**
- [ ] Test template with no usage history
- [ ] Verify no errors occur
- [ ] Verify "N/A" or "0" is shown appropriately
- [ ] Test analytics with no templates
- [ ] Verify empty state is shown

---

## Performance Benchmarks

**Test 44: API Performance**
- [ ] Test API response time < 5 seconds (with Claude API)
- [ ] Analytics API response < 1 second (for <100 templates)
- [ ] Analytics API response < 5 seconds (for <1000 templates)
- [ ] No N+1 query problems

**Test 45: UI Performance**
- [ ] Modal opens < 100ms
- [ ] Dashboard loads < 1 second (with data)
- [ ] Charts render < 500ms
- [ ] Table sorting < 100ms
- [ ] Search filtering < 100ms
- [ ] CSV export < 1 second (for <1000 rows)

---

## Accessibility Testing

**Test 46: Keyboard Navigation**
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals
- [ ] Arrow keys work in dropdowns

**Test 47: Screen Reader**
- [ ] All buttons have labels
- [ ] Form inputs have labels
- [ ] Images have alt text
- [ ] Error messages are announced
- [ ] Loading states are announced

**Test 48: Visual Accessibility**
- [ ] Color contrast meets WCAG AA standards
- [ ] Text is readable at 200% zoom
- [ ] Focus indicators are visible
- [ ] Color is not the only indicator

---

## Documentation Validation

**Test 49: Documentation Completeness**
- [ ] All features documented
- [ ] API endpoints documented
- [ ] Code examples work
- [ ] Screenshots are current (if any)
- [ ] Installation steps are clear

**Test 50: Code Quality**
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] No console warnings in browser
- [ ] Code follows project conventions

---

## Production Readiness

**Final Checklist**:
- [ ] All tests above pass
- [ ] No critical bugs
- [ ] Performance is acceptable
- [ ] Security vulnerabilities addressed
- [ ] Documentation complete
- [ ] Error handling robust
- [ ] Logging configured
- [ ] Monitoring set up (if applicable)
- [ ] Backup plan exists
- [ ] Rollback plan exists

---

## Sign-off

**Tested By**: _______________  
**Date**: _______________  
**Version**: _______________  
**Environment**: _______________  

**Overall Status**: 
- [ ] ✅ Ready for Production
- [ ] ⚠️ Ready with Minor Issues
- [ ] ❌ Not Ready - Issues Found

**Notes**:
```
[Add any additional notes, issues, or observations here]
```

---

**Last Updated**: 2024-10-30

