# Batch Generation Modal - Testing Guide

## Overview
The Batch Generation Modal is a multi-step wizard for generating 90-100 conversations automatically. This document outlines how to test the complete workflow.

## Component Files Created

### Core Components
1. `src/components/generation/BatchGenerationModal.tsx` - Main modal with step management
2. `src/components/generation/BatchConfigStep.tsx` - Step 1: Configuration
3. `src/components/generation/BatchPreviewStep.tsx` - Step 2: Preview & Estimation
4. `src/components/generation/BatchProgressStep.tsx` - Step 3: Progress Tracking
5. `src/components/generation/BatchSummaryStep.tsx` - Step 4: Summary

### State Management
6. `src/stores/useAppStore.ts` - Updated with batch generation state

## Testing the Complete Workflow

### Step 1: Configuration
**To Test:**
1. Click "Batch Generate" button in the header
2. Verify modal opens at Step 1
3. Test tier selection dropdown:
   - All Tiers (100 conversations)
   - Template Only (30 conversations)
   - Scenario Only (40 conversations)
   - Edge Case Only (30 conversations)
4. Verify conversation count updates based on tier
5. Test error handling dropdown (Continue/Stop on Error)
6. Test concurrency slider (1-5 parallel)
7. Add shared parameters:
   - Enter key and value
   - Press Enter or click + button
   - Verify parameter appears in list
   - Test remove parameter (X button)
8. Click "Next: Preview"

**Expected Behavior:**
- All form fields are functional
- Conversation count displays correctly
- Parameters can be added/removed
- Navigation to Step 2 works

### Step 2: Preview & Estimation
**To Test:**
1. Verify loading state shows while fetching estimates
2. Check that estimated cost displays (e.g., $8.50)
3. Check that estimated time displays (e.g., ~45 minutes)
4. Verify configuration summary shows:
   - Selected tier
   - Error handling mode
   - Concurrency setting
   - Shared parameters (if any)
5. Click "Back" to return to Step 1
6. Click "Start Generation" to proceed

**Expected Behavior:**
- Loading spinner appears briefly
- Cost and time estimates display
- Fallback estimates work if API is unavailable
- Back/Start buttons work correctly

**API Requirements:**
```
POST /api/conversations/batch/estimate
Request: { tier, conversationCount, concurrency, sharedParameters }
Response: { 
  success: true,
  data: {
    estimatedCost: number,
    estimatedTimeMinutes: number,
    conversationCount: number,
    breakdown: { templates, scenarios, edgeCases }
  }
}
```

### Step 3: Progress Tracking
**To Test:**
1. Verify initial loading state ("Starting batch generation...")
2. Once started, verify:
   - Progress bar updates
   - Percentage displays (0-100%)
   - Success/Failed/Remaining counts show
   - Current item displays
   - Elapsed time updates
   - Estimated remaining time shows
3. Test "Cancel Generation" button
4. Verify auto-advance to Step 4 when complete

**Expected Behavior:**
- Progress updates every 3 seconds via polling
- Statistics update in real-time
- Cancel button is functional
- Modal can be closed during generation
- Generation continues in background if closed
- Confirmation dialog shows when closing during generation

**API Requirements:**
```
POST /api/conversations/generate-batch
Request: { name, tier, sharedParameters, concurrentProcessing, errorHandling, userId }
Response: { success: true, data: { jobId, status, estimatedCost, estimatedTime } }

GET /api/conversations/batch/:id/status
Response: { 
  success: true, 
  data: {
    jobId, status, progress, completedItems, failedItems, totalItems,
    elapsedTime, estimatedTimeRemaining, currentItem
  }
}

PATCH /api/conversations/batch/:id
Request: { action: 'cancel' | 'pause' | 'resume' }
Response: { success: true, data: { jobId, status } }
```

### Step 4: Summary
**To Test:**
1. Verify completion message displays
2. Check statistics:
   - Success rate percentage
   - Successful count
   - Failed count
   - Total cost (actual vs estimated)
   - Total time (actual vs estimated)
3. Test "View Errors" link (if failures)
4. Test "Regenerate Failed" button (if failures)
5. Test "Close" button
6. Test "View Conversations" button

**Expected Behavior:**
- All statistics display correctly
- Cost/time comparisons show variance
- Failed conversation warnings appear if applicable
- Success message shows for 100% completion
- Close resets modal to Step 1
- View Conversations navigates to dashboard

## Keyboard Navigation

- **Tab**: Move between form fields
- **Enter**: Submit forms, add parameters
- **ESC**: Close modal (with confirmation if generating)

## State Persistence

- Modal state is managed by Zustand store
- Batch jobs are added to `activeBatchJobs` array
- Generation continues if modal is closed
- Progress can be monitored from dashboard

## Error Handling

### Configuration Step
- Validates tier selection
- Validates parameter keys (no duplicates)
- Shows warning about API credit usage

### Preview Step
- Falls back to estimated calculations if API fails
- Shows warning message if using fallback
- Gracefully handles network errors

### Progress Step
- Polls every 3 seconds
- Handles API errors silently
- Shows appropriate status badges
- Supports pause/resume/cancel

### Summary Step
- Displays partial results if some failed
- Shows actionable items for failures
- Provides detailed cost/time analysis

## Integration Points

### Header Component
- "Batch Generate" button triggers `openBatchModal()`
- Located at: `src/components/layout/Header.tsx`

### App Component
- Modal is rendered globally
- Located at: `src/App.tsx` (line 59)

### Store Actions
- `openBatchModal()` - Opens modal
- `closeBatchModal()` - Closes modal
- `setBatchStep()` - Changes current step
- `setBatchConfig()` - Updates configuration
- `setBatchJobId()` - Sets active job ID
- `setBatchEstimates()` - Sets cost/time estimates
- `setBatchActuals()` - Sets actual cost/time
- `resetBatchGeneration()` - Resets to initial state

## Mock Testing (Without Backend)

If API endpoints are not available:

1. **Preview Step**: Uses fallback calculations
   - Cost: $0.085 per conversation
   - Time: ~27 seconds per conversation

2. **Progress Step**: Will show error starting batch
   - Modal gracefully handles this
   - Error messages are user-friendly

3. **To Mock APIs**: Create simple handlers that return expected structure

## Success Criteria

✅ Modal opens from "Generate All" button in dashboard header  
✅ Configuration step validates input before allowing next  
✅ Preview step shows accurate cost/time estimates (or fallbacks)  
✅ Progress step updates in real-time every 3 seconds  
✅ Cancel button stops generation gracefully  
✅ Summary step shows complete statistics  
✅ Modal state persists if user closes browser (job continues)  
✅ Keyboard navigation supported (Tab, Enter, ESC)  

## Known Limitations in Wireframe

- API endpoints need to be implemented for full functionality
- Mock data is used if endpoints unavailable
- Actual Claude API integration required for real generation
- Database persistence needed for production use

## Next Steps for Production

1. Implement all required API endpoints
2. Add database migrations for batch jobs table
3. Integrate with actual Claude API
4. Add retry logic and queue management
5. Implement error details viewer
6. Add regenerate failed functionality
7. Create dashboard widgets for active batches

