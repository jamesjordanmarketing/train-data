## BUILD PROMPT #5: RUN MANAGEMENT & POLISH

**CONTEXT FOR AI:** The core functionality is complete. Now add run management, regeneration, and final polish to make this production-ready.

**YOUR TASK:**

### Part A: Run Comparison Interface

Create `src/components/chunks/RunComparison.tsx`:

**Requirements:**
- Accept multiple run_ids as input (2-5 runs)
- Display side-by-side table with one run per column
- Highlight differences in cell background colors:
  - Green (`bg-green-100`): Value improved vs previous run
  - Red (`bg-red-100`): Value degraded vs previous run
  - Yellow (`bg-yellow-100`): Value changed but unclear if better
- Add "Export Comparison" button (CSV format)
- Include diff statistics at top (X fields changed, Y improved, Z degraded)

**Key Functions:**
```typescript
function compareRuns(runs: ChunkDimensions[]): ComparisonResult {
  // Compare dimension values across runs
  // Calculate improvement/degradation
  // Return differences and statistics
}

function getDifferenceColor(oldValue: any, newValue: any, field: string): string {
  // Determine if change is positive, negative, or neutral
  // Special logic for confidence scores (higher = better)
  // Return appropriate color class
}
```

**Implementation Notes:**
- For confidence scores: higher is always better (green)
- For cost: lower is better (green)
- For duration: lower is better (green)
- For content fields: any change is neutral (yellow) unless null â†’ value (green)

### Part B: Regeneration Capability

Add to `src/app/chunks/[documentId]/page.tsx`:

**Requirements:**
- Add "Regenerate Dimensions" button to each chunk card header
- On click, show modal with options:
  - Regenerate selected chunks only
  - Regenerate all chunks in document
  - Select which prompt templates to use (checkboxes)
  - Option to use different AI parameters (temperature, model)
- Create new run_id for regeneration
- Preserve all historical runs (never delete old data)
- Show progress indicator during regeneration
- Refresh dashboard automatically when complete
- Display toast notification: "Regeneration complete! View new run."

**API Endpoint:**

Create `src/app/api/chunks/regenerate/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { DimensionGenerator } from '../../../../lib/dimension-generation/generator';
import { userService } from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { documentId, chunkIds, templateIds } = await request.json();
    
    // Validate inputs
    if (!documentId) {
      return NextResponse.json({ error: 'documentId required' }, { status: 400 });
    }
    
    // Get current user
    const user = await userService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Generate dimensions for specified chunks
    const generator = new DimensionGenerator();
    const runId = await generator.generateDimensionsForDocument({
      documentId,
      userId: user.id,
      chunkIds,  // Optional: specific chunks only
      templateIds,  // Optional: specific templates only
    });
    
    return NextResponse.json({
      success: true,
      runId,
      message: 'Regeneration complete',
    });
    
  } catch (error: any) {
    console.error('Regeneration error:', error);
    return NextResponse.json(
      { error: error.message || 'Regeneration failed' },
      { status: 500 }
    );
  }
}
```

**Update DimensionGenerator:**

Modify `generateDimensionsForDocument` method to accept optional parameters:
```typescript
async generateDimensionsForDocument(params: {
  documentId: string;
  userId: string;
  chunkIds?: string[];  // NEW: Optional filter
  templateIds?: string[];  // NEW: Optional filter
}): Promise<string>
```

### Part C: Polish & Testing Checklist

**Loading States to Add:**
- [ ] Document list: Skeleton loader while fetching (`<Skeleton className="h-20 w-full" />`)
- [ ] Chunk extraction: Progress bar with percentage (`<Progress value={percentage} />`)
- [ ] Dimension generation: Animated spinner with "Analyzing chunk X of Y" text
- [ ] Spreadsheet: Table skeleton while loading data
- [ ] Run comparison: Loading overlay with "Comparing runs..." message

**Error Boundaries to Add:**
- [ ] Wrap `/chunks/[documentId]` page with ErrorBoundary component
- [ ] Wrap ChunkSpreadsheet component with ErrorBoundary
- [ ] Wrap RunComparison component with ErrorBoundary
- [ ] Add fallback UI for each boundary:
  ```typescript
  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
    <h3 className="text-red-800 font-medium">Something went wrong</h3>
    <p className="text-red-600 text-sm mt-2">{error.message}</p>
    <Button onClick={reset} className="mt-4">Try Again</Button>
  </div>
  ```

**Toast Notifications to Add (using sonner or react-hot-toast):**
- [ ] Chunk extraction started: `toast.info("Extracting chunks...")`
- [ ] Chunk extraction complete: `toast.success("Extracted X chunks successfully")`
- [ ] Dimension generation started: `toast.info("Generating dimensions...")`
- [ ] Dimension generation complete: `toast.success("Generated X dimensions in Y seconds")`
- [ ] Regeneration complete: `toast.success("Regeneration complete! View new run.")`
- [ ] Export success: `toast.success("Data exported to downloads folder")`
- [ ] Errors: `toast.error(error.message)` with retry option

**End-to-End Test Script:**

Create `test-workflow.md` documenting this test sequence:

```markdown
## Chunk Alpha Module - E2E Test Script

### Phase 1: Extraction
1. Start with categorized document
2. Click "Chunks" button on document card
3. ✓ Verify extraction progress updates in real-time
4. ✓ Verify chunks appear in database (check chunk count)
5. ✓ Verify navigation to chunk dashboard

### Phase 2: Dimension Generation
6. ✓ Verify dimension generation starts automatically
7. ✓ Verify progress indicator shows "Generating dimensions..."
8. ✓ Verify dimensions saved with confidence scores (check database)
9. ✓ Verify confidence scores are between 1-10

### Phase 3: Dashboard Display
10. ✓ Verify chunk dashboard displays three-section layout
11. ✓ Verify "Things We Know" section shows high-confidence dimensions (>=8)
12. ✓ Verify "Things We Need to Know" shows low-confidence (<8)
13. ✓ Verify confidence displayed as percentage (score × 10)
14. ✓ Verify color coding: green for high, orange for low
15. ✓ Verify only 3 items shown per section

### Phase 4: Spreadsheet View
16. Click "Detail View" button on a chunk
17. ✓ Verify spreadsheet opens with all dimensions
18. ✓ Verify column sorting works (click headers)
19. ✓ Verify filtering works (search input)
20. ✓ Verify preset view buttons work (Quality, Cost, Content, Risk)
21. ✓ Verify all columns display correctly

### Phase 5: Run Comparison
22. Regenerate dimensions for same chunk (create 2nd run)
23. Select both runs in comparison view
24. ✓ Verify side-by-side comparison displays
25. ✓ Verify differences are highlighted (green/red/yellow)
26. ✓ Verify statistics show at top

### Phase 6: Regeneration
27. Click "Regenerate" button on chunk card
28. Select specific templates to run
29. ✓ Verify new run created (check database)
30. ✓ Verify old runs preserved (history intact)
31. ✓ Verify dashboard updates with new data

### Phase 7: Export
32. Click "Export" button in spreadsheet
33. ✓ Verify CSV file downloads
34. ✓ Verify all data included in export
35. ✓ Verify formatting is correct

### Phase 8: Error Handling
36. Disconnect internet, try to generate dimensions
37. ✓ Verify error toast displays
38. ✓ Verify error boundary catches failure
39. ✓ Verify "Try Again" button works

### Success Criteria
- All 39 checkpoints pass ✓
- No console errors
- No network failures (except intentional test #36)
- Data persists correctly in database
- UI matches wireframe design exactly
```

**Bug Fixes to Verify:**
- [ ] Confidence scores never null in database
- [ ] Helper functions handle missing dimensions gracefully
- [ ] Color scheme matches wireframe exactly
- [ ] Progressive disclosure works (3 items → Detail View)
- [ ] All icons imported from lucide-react
- [ ] Typography scale consistent throughout
- [ ] Spacing and padding matches design spec

**COMPLETION CRITERIA:**
✅ Run comparison working with color-coded differences  
✅ Regeneration functional with template selection  
✅ All loading states implemented  
✅ Error boundaries catching failures  
✅ Toast notifications for all user actions  
✅ E2E test script passes all 39 checkpoints  
✅ No critical bugs or console errors  
✅ Code documented with inline comments
