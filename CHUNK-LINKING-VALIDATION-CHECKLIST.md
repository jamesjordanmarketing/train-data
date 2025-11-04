# Chunk Linking Feature - Validation Checklist

**Version:** 1.0  
**Date:** November 3, 2025  
**Purpose:** Comprehensive testing and validation checklist for chunk linking features

---

## Pre-Testing Setup

### Environment Requirements
- [ ] Development server running (`npm run dev`)
- [ ] Database accessible and populated with test data
- [ ] At least 5 test conversations in database
- [ ] At least 10 test chunks in chunks-alpha module
- [ ] Some conversations already linked to chunks
- [ ] Some conversations orphaned (no chunk association)
- [ ] Browser developer tools open (Console tab)

### Test Data Preparation
- [ ] Create 3 conversations with no chunk links (orphaned)
- [ ] Create 2 conversations with existing chunk links
- [ ] Verify chunks have dimension data
- [ ] Verify chunks have readable content
- [ ] Note down test conversation IDs
- [ ] Note down test chunk IDs

---

## API Endpoint Testing

### 1. Link Chunk Endpoint
**Endpoint:** `POST /api/conversations/{id}/link-chunk`

#### Test Case 1.1: Successful Link
- [ ] Send POST request with valid conversation ID and chunk ID
- [ ] Verify response status is 200
- [ ] Verify response body contains `{ "success": true }`
- [ ] Check database: conversation.parent_chunk_id is updated
- [ ] Check database: conversation.chunk_context is populated
- [ ] Check database: conversation.dimension_source is populated (if available)
- [ ] Check database: conversation.updated_at timestamp changed

#### Test Case 1.2: Missing Chunk ID
- [ ] Send POST request without chunkId in body
- [ ] Verify response status is 400
- [ ] Verify error message: "Chunk ID is required"

#### Test Case 1.3: Invalid Chunk ID
- [ ] Send POST request with non-existent chunk ID
- [ ] Verify response status is 404
- [ ] Verify error message: "Chunk not found"

#### Test Case 1.4: Invalid Conversation ID
- [ ] Send POST request with non-existent conversation ID
- [ ] Verify response status is 500 or appropriate error
- [ ] Verify error message is returned

#### Test Case 1.5: Already Linked Conversation
- [ ] Send POST request to link conversation that's already linked
- [ ] Verify it updates to new chunk (overwrites previous link)
- [ ] Verify old chunk context is replaced
- [ ] Verify dimension source is updated

---

### 2. Unlink Chunk Endpoint
**Endpoint:** `DELETE /api/conversations/{id}/unlink-chunk`

#### Test Case 2.1: Successful Unlink
- [ ] Send DELETE request with valid conversation ID (that has a link)
- [ ] Verify response status is 200
- [ ] Verify response body contains `{ "success": true }`
- [ ] Check database: conversation.parent_chunk_id is NULL
- [ ] Check database: conversation.chunk_context is NULL
- [ ] Check database: conversation.dimension_source is NULL
- [ ] Check database: conversation.updated_at timestamp changed

#### Test Case 2.2: Unlink Non-Linked Conversation
- [ ] Send DELETE request for conversation with no chunk link
- [ ] Verify response status is 200 (idempotent operation)
- [ ] Verify no errors occur

#### Test Case 2.3: Invalid Conversation ID
- [ ] Send DELETE request with non-existent conversation ID
- [ ] Verify appropriate error handling
- [ ] Verify error response returned

---

### 3. Get Conversations by Chunk Endpoint
**Endpoint:** `GET /api/conversations/by-chunk/{chunkId}`

#### Test Case 3.1: Chunk with Conversations
- [ ] Link 3 conversations to the same chunk
- [ ] Send GET request with that chunk ID
- [ ] Verify response status is 200
- [ ] Verify response is an array
- [ ] Verify array contains 3 conversation objects
- [ ] Verify conversations are sorted by created_at (descending)
- [ ] Verify each conversation has correct parent_chunk_id

#### Test Case 3.2: Chunk with No Conversations
- [ ] Send GET request with chunk ID that has no links
- [ ] Verify response status is 200
- [ ] Verify response is an empty array `[]`

#### Test Case 3.3: Invalid Chunk ID
- [ ] Send GET request with non-existent chunk ID
- [ ] Verify response status is 200
- [ ] Verify response is an empty array `[]`

---

### 4. Get Orphaned Conversations Endpoint
**Endpoint:** `GET /api/conversations/orphaned`

#### Test Case 4.1: Get Orphaned Conversations
- [ ] Ensure at least 2 conversations have no chunk link
- [ ] Send GET request
- [ ] Verify response status is 200
- [ ] Verify response is an array
- [ ] Verify array contains orphaned conversations
- [ ] Verify all returned conversations have parent_chunk_id = NULL
- [ ] Verify draft conversations are excluded
- [ ] Verify archived conversations are excluded
- [ ] Verify conversations are sorted by created_at (descending)

#### Test Case 4.2: No Orphaned Conversations
- [ ] Link all conversations to chunks
- [ ] Send GET request
- [ ] Verify response status is 200
- [ ] Verify response is an empty array `[]`

---

## UI Component Testing

### 5. ConversationTable - Dropdown Menu

#### Test Case 5.1: Menu Shows "Link to Chunk"
- [ ] Navigate to Conversations page
- [ ] Find conversation with no chunk link
- [ ] Click 3-dot menu (⋮)
- [ ] Verify "Link to Chunk" option appears
- [ ] Verify Link icon is displayed next to text
- [ ] Verify option is clickable

#### Test Case 5.2: Menu Shows "Unlink from Chunk"
- [ ] Find conversation with existing chunk link
- [ ] Click 3-dot menu (⋮)
- [ ] Verify "Unlink from Chunk" option appears
- [ ] Verify Link icon is displayed
- [ ] Verify "Link to Chunk" option is NOT shown
- [ ] Verify option is clickable

#### Test Case 5.3: Link to Chunk Opens Modal
- [ ] Click "Link to Chunk" option
- [ ] Verify modal opens
- [ ] Verify modal title is "Link Conversation to Chunk"
- [ ] Verify description text is present
- [ ] Verify ChunkSelector component is visible
- [ ] Verify search bar is present
- [ ] Verify chunks are loading/displayed

#### Test Case 5.4: Chunk Selection and Link
- [ ] Open Link to Chunk modal
- [ ] Search for a chunk using search bar
- [ ] Click on a chunk card to select it
- [ ] Verify modal closes automatically
- [ ] Verify success toast appears: "Chunk linked successfully"
- [ ] Verify conversation menu now shows "Unlink from Chunk"
- [ ] Verify no console errors

#### Test Case 5.5: Unlink from Dropdown
- [ ] Find linked conversation
- [ ] Click "Unlink from Chunk" from menu
- [ ] Verify success toast appears: "Chunk unlinked successfully"
- [ ] Verify menu now shows "Link to Chunk"
- [ ] Verify no console errors

#### Test Case 5.6: Modal Close Without Selection
- [ ] Open Link to Chunk modal
- [ ] Click outside modal or press Escape
- [ ] Verify modal closes
- [ ] Verify no link is created
- [ ] Verify no errors occur

---

### 6. ConversationMetadataPanel - Chunk Display

#### Test Case 6.1: Source Chunk Card Appears
- [ ] Open detail view for conversation with chunk link
- [ ] Scroll to metadata panel on right side
- [ ] Verify "Source Chunk" card appears
- [ ] Verify card shows Link2 icon in header
- [ ] Verify card is between Context and Quality Metrics

#### Test Case 6.2: Chunk ID Display
- [ ] In Source Chunk card, find Chunk ID field
- [ ] Verify chunk ID is displayed in monospace font
- [ ] Verify ID matches linked chunk ID
- [ ] Verify ID is readable and complete

#### Test Case 6.3: Context Preview Display
- [ ] Verify "Context Preview" section appears
- [ ] Verify text shows first 200 characters of chunk
- [ ] Verify text ends with "..."
- [ ] Verify text is in muted color
- [ ] Verify text has line-clamp-3 (max 3 lines)

#### Test Case 6.4: Dimension Confidence Display
- [ ] Verify "Dimension Confidence" section appears (if dimension data exists)
- [ ] Verify confidence shown as percentage (e.g., "87%")
- [ ] Verify displayed in a badge
- [ ] Verify percentage is calculated correctly (value * 100)

#### Test Case 6.5: Semantic Dimensions Display
- [ ] Verify "Semantic Dimensions" section appears (if data exists)
- [ ] Check **Personas** field:
  - [ ] Shows when dimension_source.semanticDimensions.persona exists
  - [ ] Displays comma-separated list
  - [ ] Shows all persona values
- [ ] Check **Emotions** field:
  - [ ] Shows when dimension_source.semanticDimensions.emotion exists
  - [ ] Displays comma-separated list
  - [ ] Shows all emotion values
- [ ] Check **Complexity** field:
  - [ ] Shows when dimension_source.semanticDimensions.complexity exists
  - [ ] Displays as "X/10" format
  - [ ] Value is correctly multiplied by 10

#### Test Case 6.6: View Full Chunk Button
- [ ] Locate "View Full Chunk" button
- [ ] Verify button has ExternalLink icon
- [ ] Click button
- [ ] Verify new tab opens
- [ ] Verify URL is `/chunks/{chunkId}`
- [ ] Verify chunk detail page loads (or appropriate response)

#### Test Case 6.7: Unlink Button in Detail View
- [ ] Locate "Unlink" button
- [ ] Verify button has X icon
- [ ] Click button
- [ ] Verify button is disabled during operation
- [ ] Verify success toast appears: "Chunk unlinked successfully"
- [ ] Verify Source Chunk card disappears
- [ ] Verify button re-enables after operation

#### Test Case 6.8: No Chunk - Card Hidden
- [ ] Open detail view for conversation with no chunk link
- [ ] Scroll through metadata panel
- [ ] Verify "Source Chunk" card does NOT appear
- [ ] Verify layout flows normally without gap

---

### 7. FilterBar - Orphaned Filter

#### Test Case 7.1: Orphaned Button Appears
- [ ] Navigate to Conversations page
- [ ] Find Quick Filters section
- [ ] Verify "Orphaned" button is present
- [ ] Verify button has LinkOff icon
- [ ] Verify button is in the quick filters row

#### Test Case 7.2: Orphaned Count Badge
- [ ] Ensure there are orphaned conversations in database
- [ ] Refresh the page
- [ ] Verify badge appears on Orphaned button
- [ ] Verify badge shows correct count
- [ ] Verify count matches API response
- [ ] Verify badge has appropriate styling

#### Test Case 7.3: No Orphaned - No Badge
- [ ] Link all conversations to chunks
- [ ] Refresh the page
- [ ] Verify Orphaned button still appears
- [ ] Verify badge does NOT appear (count = 0)
- [ ] Verify button is still clickable

#### Test Case 7.4: Click Orphaned Filter
- [ ] Click the Orphaned button
- [ ] Verify button becomes active (default variant)
- [ ] Verify toast appears: "Found X orphaned conversations"
- [ ] Verify console shows orphaned conversations array
- [ ] Verify no errors occur

#### Test Case 7.5: Orphaned Count Updates
- [ ] Note initial orphaned count
- [ ] Link one orphaned conversation to a chunk
- [ ] Refresh the page
- [ ] Verify orphaned count decreases by 1
- [ ] Verify badge updates correctly

---

## Integration Testing

### 8. End-to-End Workflows

#### Test Case 8.1: Complete Link Workflow
- [ ] Start with orphaned conversation
- [ ] Open conversation table
- [ ] Click dropdown menu on orphaned conversation
- [ ] Select "Link to Chunk"
- [ ] Search for chunk in modal
- [ ] Select chunk
- [ ] Verify success toast
- [ ] Open conversation detail
- [ ] Verify Source Chunk card appears
- [ ] Verify all chunk information displays correctly
- [ ] Return to table
- [ ] Verify dropdown now shows "Unlink from Chunk"
- [ ] Click Orphaned filter
- [ ] Verify orphaned count decreased

#### Test Case 8.2: Complete Unlink Workflow
- [ ] Start with linked conversation
- [ ] Open conversation detail
- [ ] Verify Source Chunk card is visible
- [ ] Click "Unlink" button in card
- [ ] Verify success toast
- [ ] Verify Source Chunk card disappears
- [ ] Return to conversation table
- [ ] Verify dropdown shows "Link to Chunk"
- [ ] Click Orphaned filter
- [ ] Verify orphaned count increased

#### Test Case 8.3: Multi-Conversation Link to Same Chunk
- [ ] Link conversation A to chunk X
- [ ] Link conversation B to chunk X
- [ ] Link conversation C to chunk X
- [ ] Call GET /api/conversations/by-chunk/X
- [ ] Verify returns 3 conversations
- [ ] Open each conversation detail
- [ ] Verify all show same chunk ID

#### Test Case 8.4: Re-Link Different Chunk
- [ ] Start with conversation linked to chunk A
- [ ] Open dropdown menu
- [ ] Click "Unlink from Chunk"
- [ ] Click "Link to Chunk"
- [ ] Select chunk B (different chunk)
- [ ] Verify success toast
- [ ] Open conversation detail
- [ ] Verify shows chunk B, not chunk A

---

## Error Handling & Edge Cases

### 9. Error Scenarios

#### Test Case 9.1: Network Error During Link
- [ ] Open browser DevTools Network tab
- [ ] Set network to "Offline"
- [ ] Try to link a chunk
- [ ] Verify error toast appears
- [ ] Verify console shows error
- [ ] Re-enable network
- [ ] Retry operation
- [ ] Verify succeeds

#### Test Case 9.2: API Returns 500 Error
- [ ] Use invalid conversation ID
- [ ] Try to link chunk
- [ ] Verify error toast appears: "Failed to link chunk"
- [ ] Verify console shows error details
- [ ] Verify modal remains open or closes gracefully

#### Test Case 9.3: Chunk Deleted Between Load and Select
- [ ] Open Link to Chunk modal
- [ ] (Manually) Delete chunk from database
- [ ] Try to select that chunk
- [ ] Verify appropriate error handling
- [ ] Verify error toast appears

#### Test Case 9.4: Very Long Chunk Content
- [ ] Link conversation to chunk with >10,000 chars
- [ ] Verify only first 5000 chars stored in chunk_context
- [ ] Verify detail view shows first 200 chars + "..."
- [ ] Verify no performance issues

#### Test Case 9.5: Chunk with No Dimension Data
- [ ] Link conversation to chunk without dimensions
- [ ] Open conversation detail
- [ ] Verify Source Chunk card still appears
- [ ] Verify Dimension Confidence section is hidden
- [ ] Verify Semantic Dimensions section is hidden
- [ ] Verify Chunk ID and Context still show

---

## Performance Testing

### 10. Performance Scenarios

#### Test Case 10.1: Large Number of Chunks
- [ ] Ensure database has 100+ chunks
- [ ] Open Link to Chunk modal
- [ ] Verify chunks load within 2 seconds
- [ ] Verify search is responsive (debounced 300ms)
- [ ] Verify scrolling is smooth

#### Test Case 10.2: Large Number of Conversations
- [ ] Ensure database has 500+ conversations
- [ ] Navigate to Conversations page
- [ ] Verify orphaned count loads quickly
- [ ] Verify page remains responsive
- [ ] Verify filter interactions are smooth

#### Test Case 10.3: Concurrent Link Operations
- [ ] Open multiple browser tabs
- [ ] Link different conversations in each tab
- [ ] Verify all operations succeed
- [ ] Verify no race conditions
- [ ] Verify database consistency

---

## Browser Compatibility

### 11. Cross-Browser Testing

#### Test Case 11.1: Chrome
- [ ] All UI tests pass
- [ ] All API tests pass
- [ ] No console errors
- [ ] Styling correct

#### Test Case 11.2: Firefox
- [ ] All UI tests pass
- [ ] All API tests pass
- [ ] No console errors
- [ ] Styling correct

#### Test Case 11.3: Safari
- [ ] All UI tests pass
- [ ] All API tests pass
- [ ] No console errors
- [ ] Styling correct

#### Test Case 11.4: Edge
- [ ] All UI tests pass
- [ ] All API tests pass
- [ ] No console errors
- [ ] Styling correct

---

## Accessibility Testing

### 12. Accessibility

#### Test Case 12.1: Keyboard Navigation
- [ ] Tab through dropdown menu
- [ ] Select "Link to Chunk" using Enter
- [ ] Navigate chunks in modal using arrow keys
- [ ] Select chunk using Enter
- [ ] Close modal using Escape
- [ ] All interactions work without mouse

#### Test Case 12.2: Screen Reader
- [ ] Enable screen reader (NVDA/JAWS/VoiceOver)
- [ ] Navigate to dropdown menu
- [ ] Verify "Link to Chunk" is announced
- [ ] Open modal
- [ ] Verify modal title is announced
- [ ] Verify chunk information is readable
- [ ] Verify all buttons are announced

#### Test Case 12.3: Focus Management
- [ ] Open modal
- [ ] Verify focus moves to modal
- [ ] Tab through elements
- [ ] Verify focus is trapped in modal
- [ ] Close modal
- [ ] Verify focus returns to trigger button

---

## Database Validation

### 13. Data Integrity

#### Test Case 13.1: Foreign Key Constraints
- [ ] Link conversation to chunk
- [ ] Verify parent_chunk_id references valid chunk
- [ ] Try to delete referenced chunk
- [ ] Verify appropriate constraint handling

#### Test Case 13.2: Null Handling
- [ ] Verify orphaned conversations have:
  - [ ] parent_chunk_id = NULL
  - [ ] chunk_context = NULL
  - [ ] dimension_source = NULL
- [ ] Verify NULL values don't cause errors

#### Test Case 13.3: Updated Timestamps
- [ ] Note conversation updated_at timestamp
- [ ] Link chunk to conversation
- [ ] Verify updated_at changed
- [ ] Unlink chunk
- [ ] Verify updated_at changed again

#### Test Case 13.4: JSON Field Validation
- [ ] Link chunk with dimension data
- [ ] Query database
- [ ] Verify dimension_source is valid JSON
- [ ] Verify structure matches DimensionSource type
- [ ] Verify can parse back to object

---

## Documentation Validation

### 14. Documentation

#### Test Case 14.1: Implementation Summary
- [ ] Read PROMPT-5-IMPLEMENTATION-SUMMARY.md
- [ ] Verify all features match implementation
- [ ] Verify file counts are accurate
- [ ] Verify line counts are reasonable

#### Test Case 14.2: Quick Start Guide
- [ ] Read CHUNK-LINKING-QUICK-START.md
- [ ] Follow instructions to link a chunk
- [ ] Verify all steps work as documented
- [ ] Verify screenshots/diagrams match UI

#### Test Case 14.3: This Checklist
- [ ] Verify all test cases are clear
- [ ] Verify all test cases are executable
- [ ] Add any missing test scenarios

---

## Security Testing

### 15. Security

#### Test Case 15.1: SQL Injection
- [ ] Try malicious chunk IDs: `'; DROP TABLE--`
- [ ] Verify proper parameterization prevents injection
- [ ] Verify no database errors

#### Test Case 15.2: XSS Prevention
- [ ] Link chunk with content containing `<script>alert('xss')</script>`
- [ ] View in conversation detail
- [ ] Verify script doesn't execute
- [ ] Verify content is escaped

#### Test Case 15.3: Authorization
- [ ] (If auth implemented) Try to link conversation as unauthorized user
- [ ] Verify proper authorization checks
- [ ] Verify appropriate error responses

---

## Final Validation

### 16. Sign-Off Criteria

- [ ] **All API endpoints** return correct responses
- [ ] **All UI components** display correctly
- [ ] **All user workflows** complete successfully
- [ ] **No console errors** in any scenario
- [ ] **No linter errors** in codebase
- [ ] **Performance** meets requirements (< 2s for most operations)
- [ ] **Accessibility** standards met (WCAG AA)
- [ ] **Documentation** complete and accurate
- [ ] **Database integrity** maintained
- [ ] **Error handling** graceful and informative

---

## Test Results Summary

| Category | Total Tests | Passed | Failed | Skipped |
|----------|-------------|--------|--------|---------|
| API Endpoints | 15 | | | |
| UI Components | 25 | | | |
| Integration | 4 | | | |
| Error Handling | 5 | | | |
| Performance | 3 | | | |
| Browser Compat | 4 | | | |
| Accessibility | 3 | | | |
| Database | 4 | | | |
| Documentation | 3 | | | |
| Security | 3 | | | |
| **TOTAL** | **69** | | | |

---

## Defects & Issues

### High Priority
| ID | Description | Status | Fix |
|----|-------------|--------|-----|
| | | | |

### Medium Priority
| ID | Description | Status | Fix |
|----|-------------|--------|-----|
| | | | |

### Low Priority
| ID | Description | Status | Fix |
|----|-------------|--------|-----|
| | | | |

---

## Notes

### Test Environment
- **Date:** _____________
- **Tester:** _____________
- **Environment:** _____________
- **Database Version:** _____________
- **Application Version:** _____________

### Additional Observations
_____________________________________________
_____________________________________________
_____________________________________________

---

## Approval

- [ ] **QA Lead:** _________________ Date: _______
- [ ] **Product Owner:** _________________ Date: _______
- [ ] **Tech Lead:** _________________ Date: _______

---

**Status: READY FOR TESTING** ✅

Test this checklist systematically to ensure comprehensive validation of all chunk linking features!

