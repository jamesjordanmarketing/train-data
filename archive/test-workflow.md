# Chunk Alpha Module - E2E Test Script

## Overview
This document provides a comprehensive end-to-end testing workflow for the Chunk Alpha Module. Follow these steps in sequence to verify all functionality is working correctly.

---

## Prerequisites
- Database connection established
- At least one categorized document in the system
- User authenticated
- Chrome/Edge browser recommended for testing

---

## Phase 1: Extraction
**Goal:** Verify chunk extraction from documents works correctly

### Test Steps

1. **Navigate to document list**
   - Go to dashboard
   - ✓ Verify categorized documents are displayed

2. **Initiate chunk extraction**
   - Click "Chunks" button on a document card
   - ✓ Verify navigation to `/chunks/[documentId]` route

3. **Monitor extraction progress**
   - ✓ Verify extraction progress updates in real-time (if extraction not yet complete)
   - ✓ Verify progress percentage displayed
   - ✓ Verify loading skeleton shows during initial load

4. **Verify chunks in database**
   - Check database: `SELECT COUNT(*) FROM chunks WHERE document_id = '[id]'`
   - ✓ Verify chunk count > 0
   - ✓ Verify chunk_type values are valid (Chapter_Sequential, Instructional_Unit, CER, Example_Scenario)

5. **Verify chunk dashboard rendering**
   - ✓ Verify document title displayed at top
   - ✓ Verify "Auto-Generated Chunks" section shows
   - ✓ Verify chunk cards render with proper styling

---

## Phase 2: Dimension Generation
**Goal:** Verify AI dimension generation works and saves correctly

### Test Steps

6. **Trigger dimension generation**
   - If not auto-started, click "Regenerate All" button
   - ✓ Verify toast notification: "Starting regeneration..."
   - ✓ Verify modal shows progress indicator

7. **Monitor generation progress**
   - ✓ Verify progress indicator shows "Generating dimensions..."
   - ✓ Verify spinner animation active
   - ✓ Verify page doesn't freeze during generation

8. **Verify dimensions saved**
   - Check database: `SELECT * FROM chunk_dimensions WHERE chunk_id IN (SELECT id FROM chunks WHERE document_id = '[id]')`
   - ✓ Verify dimension records created
   - ✓ Verify generation_confidence_accuracy IS NOT NULL
   - ✓ Verify generation_confidence_precision IS NOT NULL

9. **Verify confidence scores valid**
   - ✓ Verify all confidence scores are between 1-10
   - ✓ Verify generation_cost_usd > 0
   - ✓ Verify generation_duration_ms > 0

---

## Phase 3: Dashboard Display
**Goal:** Verify chunk dashboard displays dimensions correctly

### Test Steps

10. **Verify dashboard layout**
    - ✓ Verify three-section layout in each chunk card:
      - Chunk Metadata (neutral background)
      - Things We Know (green background)
      - Things We Need to Know (orange background)

11. **Verify "Things We Know" section**
    - ✓ Verify section shows dimensions with confidence >= 8
    - ✓ Verify confidence displayed as percentage (score × 10)
    - ✓ Verify green color scheme (bg-green-50, border-green-200)
    - ✓ Verify CheckCircle icon displayed

12. **Verify "Things We Need to Know" section**
    - ✓ Verify section shows dimensions with confidence < 8
    - ✓ Verify orange color scheme (bg-orange-50, border-orange-200)
    - ✓ Verify AlertCircle icon displayed
    - ✓ Verify "Detail View" button present

13. **Verify confidence display format**
    - ✓ Verify confidence shown as "80% confidence" (not "8")
    - ✓ Verify color coding: green for high (>=80%), orange for low (<80%)

14. **Verify progressive disclosure**
    - ✓ Verify only 3 items shown per section by default
    - ✓ Verify "Detail View" button for full data
    - ✓ Verify item count badge shows total (e.g., "Things We Know (12)")

15. **Verify chunk metadata section**
    - ✓ Verify chars, tokens, page, type displayed
    - ✓ Verify neutral background color
    - ✓ Verify Hash icon displayed

---

## Phase 4: Spreadsheet View
**Goal:** Verify detail spreadsheet works correctly

### Test Steps

16. **Open spreadsheet view**
    - Click "Detail View" button on a chunk card
    - ✓ Verify navigation to spreadsheet view
    - ✓ Verify loading states show while fetching data

17. **Verify spreadsheet structure**
    - ✓ Verify all dimensions displayed in table format
    - ✓ Verify column headers are readable (no underscores)
    - ✓ Verify "Run" column shows run identifier

18. **Test column sorting**
    - Click various column headers
    - ✓ Verify ascending sort works (arrow icon changes)
    - ✓ Verify descending sort works (click again)
    - ✓ Verify null values sort to bottom

19. **Test filtering**
    - Type text in search input
    - ✓ Verify rows filter in real-time
    - ✓ Verify "Showing X of Y" count updates
    - ✓ Verify case-insensitive search

20. **Test preset view buttons**
    - Click "Quality View" button
    - ✓ Verify only quality-related columns show
    - Click "Cost View" button
    - ✓ Verify only cost-related columns show
    - Click "Content View" button
    - ✓ Verify only content-related columns show
    - Click "Risk View" button
    - ✓ Verify only risk-related columns show
    - Click "All Dimensions" button
    - ✓ Verify all columns restored

21. **Verify all columns display correctly**
    - ✓ Verify text fields truncated with ellipsis if > 100 chars
    - ✓ Verify array fields show "X items" badge
    - ✓ Verify number fields formatted correctly (4 decimal places)
    - ✓ Verify boolean fields show ✓/✗
    - ✓ Verify null/undefined show "—"

---

## Phase 5: Run Comparison
**Goal:** Verify run comparison functionality

### Test Steps

22. **Create second run**
    - Click "Regenerate" button on a chunk
    - Select different templates (optional)
    - ✓ Verify regeneration starts
    - ✓ Verify toast notification shows progress
    - ✓ Verify new run created with different run_id

23. **Access comparison view**
    - Navigate to run comparison interface
    - Select 2+ runs to compare
    - ✓ Verify run selection UI works

24. **Verify side-by-side comparison**
    - ✓ Verify runs displayed in columns
    - ✓ Verify field names in first column
    - ✓ Verify run badges show run names/IDs

25. **Verify difference highlighting**
    - ✓ Verify improved values: green background (bg-green-100)
    - ✓ Verify degraded values: red background (bg-red-100)
    - ✓ Verify neutral changes: yellow background (bg-yellow-100)
    - ✓ Verify unchanged values: white background
    - ✓ Verify icons: TrendingUp (green), TrendingDown (red), Minus (yellow)

26. **Verify statistics display**
    - ✓ Verify "Total Fields" count correct
    - ✓ Verify "Changed" count correct
    - ✓ Verify "Improved" count correct
    - ✓ Verify "Degraded" count correct
    - ✓ Verify "Neutral" count correct

27. **Verify comparison logic**
    - For confidence scores:
      - ✓ Verify higher = green (improved)
      - ✓ Verify lower = red (degraded)
    - For cost:
      - ✓ Verify lower = green (improved)
      - ✓ Verify higher = red (degraded)
    - For duration:
      - ✓ Verify lower = green (improved)
      - ✓ Verify higher = red (degraded)
    - For content fields:
      - ✓ Verify null → value = green (improved)
      - ✓ Verify value → null = red (degraded)
      - ✓ Verify value → different value = yellow (neutral)

28. **Test "Changes Only" filter**
    - Click "Changes Only" button
    - ✓ Verify only rows with changes displayed
    - ✓ Verify unchanged rows hidden

29. **Test export comparison**
    - Click "Export Comparison" button
    - ✓ Verify CSV file downloads
    - ✓ Verify file named correctly (run-comparison-[timestamp].csv)
    - ✓ Verify all comparison data included
    - ✓ Verify headers formatted correctly

---

## Phase 6: Regeneration
**Goal:** Verify regeneration creates new runs without deleting old data

### Test Steps

30. **Open regeneration modal**
    - Click "Regenerate" button on a chunk card
    - ✓ Verify modal opens with title "Regenerate Dimensions"
    - ✓ Verify options displayed:
      - Template selection checkboxes
      - Info box about preserving history

31. **Select regeneration options**
    - Check specific templates (optional)
    - ✓ Verify checkboxes toggle correctly
    - ✓ Verify template names and types shown

32. **Execute regeneration**
    - Click "Regenerate" button in modal
    - ✓ Verify button shows loading state (spinner + "Regenerating...")
    - ✓ Verify toast: "Starting regeneration..."
    - ✓ Verify modal stays open during processing

33. **Verify new run created**
    - Check database: `SELECT * FROM chunk_runs ORDER BY started_at DESC LIMIT 1`
    - ✓ Verify new run_id created
    - ✓ Verify run_name contains timestamp
    - ✓ Verify status = 'completed'

34. **Verify old runs preserved**
    - Check database: `SELECT COUNT(*) FROM chunk_dimensions WHERE chunk_id = '[id]'`
    - ✓ Verify count increased (not replaced)
    - ✓ Verify old run_id records still exist
    - ✓ Verify old generated_at timestamps unchanged

35. **Verify dashboard updates**
    - ✓ Verify page refreshes automatically
    - ✓ Verify toast: "Regeneration complete! Created run: [runId]..."
    - ✓ Verify new dimensions displayed (latest run shown first)

36. **Test "Regenerate All" button**
    - Click "Regenerate All" button (top right)
    - ✓ Verify modal shows "Regenerate dimensions for all X chunks"
    - ✓ Verify all chunks regenerated
    - ✓ Verify progress feedback provided

---

## Phase 7: Export
**Goal:** Verify CSV export functionality

### Test Steps

37. **Navigate to spreadsheet view**
    - Open any chunk's detail view
    - Click "Export" button
    - ✓ Verify button shows loading state (spinner + "Exporting...")
    - ✓ Verify toast: "Preparing export..."

38. **Verify CSV file download**
    - ✓ Verify file downloads to browser's download folder
    - ✓ Verify filename format: `chunk-[chunk_id]-dimensions.csv`
    - ✓ Verify file size > 0 bytes

39. **Verify CSV content**
    - Open downloaded CSV in spreadsheet app
    - ✓ Verify headers row present and correct
    - ✓ Verify all visible columns included
    - ✓ Verify data rows match screen display
    - ✓ Verify special characters escaped properly (quotes, commas)
    - ✓ Verify arrays shown as semicolon-separated (e.g., "item1; item2; item3")

40. **Verify export respects filters**
    - Apply filter in spreadsheet
    - Click export
    - ✓ Verify only filtered rows exported
    - Switch to "Quality View"
    - Click export
    - ✓ Verify only quality columns exported

41. **Test export toast notifications**
    - ✓ Verify toast: "Data exported successfully!" on success
    - Simulate error (disconnect network during export)
    - ✓ Verify toast: "Export failed: [error]" on error

---

## Phase 8: Error Handling
**Goal:** Verify error boundaries and graceful degradation

### Test Steps

42. **Test network failure during load**
    - Disconnect internet
    - Navigate to chunk dashboard
    - ✓ Verify error toast displays: "Error loading data: [message]"
    - ✓ Verify error message in console
    - ✓ Verify page doesn't crash (shows error state)

43. **Test dimension generation failure**
    - Disconnect internet
    - Try to regenerate dimensions
    - ✓ Verify toast: "Regeneration failed: [error]"
    - ✓ Verify error logged to console
    - ✓ Verify modal closes
    - ✓ Verify page state recovers

44. **Test error boundary**
    - Cause React component error (modify code to throw error in render)
    - ✓ Verify error boundary catches failure
    - ✓ Verify fallback UI displays:
      - Red card with alert icon
      - Error message displayed
      - "Try Again" button present
    - ✓ Verify stack trace shown in development mode only

45. **Test "Try Again" button**
    - Click "Try Again" in error boundary
    - ✓ Verify page reloads
    - ✓ Verify error cleared
    - ✓ Verify functionality restored

46. **Test API error handling**
    - API returns 401 Unauthorized
    - ✓ Verify toast: "Unauthorized - please sign in"
    - ✓ Verify user redirected to login (if configured)
    - API returns 500 Internal Server Error
    - ✓ Verify toast: "Regeneration failed: [error message]"
    - ✓ Verify error details logged to console

---

## Phase 9: Loading States
**Goal:** Verify all loading states provide good UX

### Test Steps

47. **Test document list loading**
    - Navigate to dashboard with slow network
    - ✓ Verify skeleton loaders show for document cards
    - ✓ Verify skeletons have proper dimensions
    - ✓ Verify smooth transition when data loads

48. **Test chunk dashboard loading**
    - Navigate to `/chunks/[documentId]` with slow network
    - ✓ Verify skeleton shows for:
      - Document title (centered, 8h w-64)
      - Document header card (6h w-48)
      - Chunk cards (3 skeletons, h-64)
      - Summary card (4 stat skeletons, h-20)

49. **Test dimension generation loading**
    - Trigger regeneration
    - ✓ Verify progress indicators:
      - Animated spinner (RefreshCw with animate-spin)
      - "Regenerating..." text
      - Modal button disabled during operation
      - Toast notification shows progress

50. **Test spreadsheet loading**
    - Open spreadsheet view with slow network
    - ✓ Verify table skeleton shows while loading
    - ✓ Verify loading overlay with message
    - ✓ Verify smooth transition when data appears

51. **Test run comparison loading**
    - Open comparison with slow network
    - ✓ Verify loading overlay: "Comparing runs..."
    - ✓ Verify spinner animation
    - ✓ Verify UI disabled during load

52. **Test export loading**
    - Click export button
    - ✓ Verify button shows loading state immediately
    - ✓ Verify button disabled during export
    - ✓ Verify loading state clears on completion

---

## Phase 10: UI/UX Polish
**Goal:** Verify design matches specifications exactly

### Test Steps

53. **Verify color scheme**
    - "Things We Know" section:
      - ✓ bg-green-50
      - ✓ border-green-200
      - ✓ text-green-800 (headings)
    - "Things We Need to Know" section:
      - ✓ bg-orange-50
      - ✓ border-orange-200
      - ✓ text-orange-800 (headings)
    - Comparison improvements:
      - ✓ bg-green-100
    - Comparison degradations:
      - ✓ bg-red-100
    - Comparison neutral changes:
      - ✓ bg-yellow-100

54. **Verify typography**
    - ✓ Document title: font-bold
    - ✓ Section headings: text-xl font-medium
    - ✓ Card titles: font-medium
    - ✓ Body text: default size
    - ✓ Small text (meta): text-xs or text-sm
    - ✓ Muted text: text-muted-foreground

55. **Verify icons**
    - ✓ All icons from lucide-react
    - ✓ CheckCircle: high confidence items
    - ✓ AlertCircle: low confidence items
    - ✓ RefreshCw: regeneration buttons
    - ✓ Loader2: loading spinners
    - ✓ Download: export buttons
    - ✓ ExternalLink: detail view buttons
    - ✓ ArrowRight: list items
    - ✓ Hash: metadata sections

56. **Verify spacing and padding**
    - ✓ Container: mx-auto px-4 py-6
    - ✓ Card spacing: space-y-6
    - ✓ Section spacing: space-y-4
    - ✓ Card padding: p-3 for subsections
    - ✓ Consistent gap-2, gap-3, gap-4 usage

57. **Verify responsive design**
    - Test on mobile viewport (375px)
    - ✓ Verify cards stack properly
    - ✓ Verify buttons don't overflow
    - ✓ Verify text wraps correctly
    - Test on tablet viewport (768px)
    - ✓ Verify 2-column layouts work
    - Test on desktop (1440px)
    - ✓ Verify 4-column stats layout
    - ✓ Verify max-width containers

58. **Verify accessibility**
    - ✓ All buttons have aria-labels or title attributes
    - ✓ Color contrast meets WCAG AA standards
    - ✓ Keyboard navigation works (Tab, Enter, Esc)
    - ✓ Screen reader text for icons
    - ✓ Focus indicators visible

---

## Success Criteria

### ✅ All Tests Pass
- All 58 checkpoints completed with ✓
- No console errors (except intentional error tests)
- No network failures (except intentional failure tests)
- Data persists correctly in database
- UI matches wireframe design exactly

### Performance Benchmarks
- Page load < 2 seconds (cached)
- Dimension generation < 30 seconds per chunk
- Spreadsheet renders < 500ms for 100 rows
- Export completes < 3 seconds for 1000 rows
- Run comparison < 1 second for 5 runs

### Code Quality
- No TypeScript errors
- No linter warnings
- All components documented with inline comments
- Error handling implemented for all async operations
- Loading states for all user-triggered actions

---

## Bug Tracking

### Critical Bugs (Must Fix)
- [ ] None found

### High Priority (Should Fix)
- [ ] None found

### Low Priority (Nice to Have)
- [ ] None found

---

## Test Environment

- **Date Tested:** [YYYY-MM-DD]
- **Tested By:** [Name]
- **Browser:** Chrome/Edge [Version]
- **OS:** Windows/Mac/Linux [Version]
- **Database:** Supabase PostgreSQL
- **Node Version:** [Version]
- **Next.js Version:** 14.2.33

---

## Notes

### Known Limitations
- Regeneration with 100+ chunks may take several minutes
- Large CSV exports (>10MB) may cause browser memory warnings
- Comparison limited to 5 runs maximum for performance

### Future Enhancements
- Real-time progress updates via WebSocket
- Batch export multiple chunks
- Advanced comparison filters (date range, confidence threshold)
- Confidence score trend visualization
- AI model comparison across runs

---

## Sign-Off

**QA Engineer:** ____________________  **Date:** ____________

**Product Manager:** ____________________  **Date:** ____________

**Tech Lead:** ____________________  **Date:** ____________

---

*End of Test Script*

