# Enrichment UI Components - Testing Guide

**Implementation Complete**: November 20, 2025  
**Components**: ValidationReportDialog, ConversationActions, Dashboard Integration

---

## 🚀 Quick Start

### 1. Start Your Development Server

```bash
npm run dev
# or
yarn dev
```

Navigate to your conversations dashboard (usually `/conversations` or `/dashboard`)

---

## 🧪 Testing Checklist

### ✅ Test 1: View Enrichment Status in Dashboard

**What to Test**: Enrichment status column in conversations table

**Steps**:
1. Open your conversations dashboard
2. Look for the "Enrichment" column (after "Turns" column)
3. Verify status badges display with appropriate colors:
   - 🟢 Green = Completed/Enriched
   - 🟡 Yellow = In Progress
   - 🔴 Red = Failed
   - ⚪ Gray = Pending/Not Started

**Expected Behavior**:
- Each conversation shows its current enrichment status
- Badge colors match the status
- Status text is readable (not snake_case)

**Screenshot**: Take a screenshot of the dashboard showing the enrichment column

---

### ✅ Test 2: View Validation Report

**What to Test**: ValidationReportDialog component

**Steps**:
1. Find a conversation in the table
2. Click the **Actions** dropdown (three dots icon)
3. Click **"View Validation Report"**
4. Observe the dialog that opens

**Expected Behavior**:
- Dialog opens with loading spinner initially
- Once loaded, you should see:
  - Overall pipeline status badge at the top
  - 4 pipeline stages with icons:
    - Stage 1: Generation
    - Stage 2: Validation
    - Stage 3: Enrichment
    - Stage 4: Normalization
  - Timeline section showing timestamps
  - If validation ran: blockers and/or warnings (or success message)
- **Refresh** button should reload the report
- **Close** button should close the dialog

**Test Edge Cases**:
- Try with a conversation that hasn't been enriched yet (should show "not_started")
- Try with a conversation that failed (should show error message)
- Try with a completed conversation (should show all stages completed)

**Screenshot**: Take a screenshot of the validation report dialog

---

### ✅ Test 3: Download Raw JSON

**What to Test**: Download raw minimal JSON functionality

**Steps**:
1. Find a conversation that has `raw_response_path` (most generated conversations should have this)
2. Click the **Actions** dropdown
3. Click **"Download Raw JSON"**

**Expected Behavior**:
- Toast notification appears: "Download started"
- A new browser tab opens with a signed URL
- JSON file downloads automatically
- File should contain the minimal conversation JSON structure

**Verify File Contents**:
Open the downloaded JSON file and check for:
```json
{
  "conversation_id": "...",
  "turns": [
    {
      "turn_number": 1,
      "role": "user",
      "content": "...",
      ...
    }
  ],
  ...
}
```

**Test Edge Cases**:
- Try with a conversation that doesn't have raw_response_path (button should be disabled)
- Check that the filename is meaningful (e.g., `conv-123-raw.json`)

---

### ✅ Test 4: Download Enriched JSON

**What to Test**: Download enriched JSON functionality (state-aware)

**Steps - For Not Enriched Conversation**:
1. Find a conversation with `enrichment_status = 'not_started'` or `'validation_failed'`
2. Click the **Actions** dropdown
3. Verify "Download Enriched JSON" is **disabled** (grayed out)
4. Hover over it to see status hint "(not ready)"

**Steps - For Enriched Conversation**:
1. Find a conversation with `enrichment_status = 'enriched'` or `'completed'`
2. Click the **Actions** dropdown
3. Click **"Download Enriched JSON"**

**Expected Behavior**:
- Toast notification appears: "Download started"
- A new browser tab opens with signed URL
- JSON file downloads automatically
- File should contain the **enriched** conversation structure

**Verify File Contents**:
Open the downloaded JSON file and check for:
```json
{
  "dataset_metadata": {
    "dataset_name": "...",
    "version": "1.0.0",
    "vertical": "financial_planning_consultant",
    ...
  },
  "consultant_profile": {
    "name": "Elena Morales",
    ...
  },
  "training_pairs": [
    {
      "id": "...",
      "conversation_id": "...",
      "turn_number": 1,
      "conversation_metadata": { ... },
      "system_prompt": "...",
      "conversation_history": [ ... ],
      "emotional_context": { ... },
      "target_response": "...",
      "training_metadata": { ... }
    }
  ]
}
```

**Test Edge Cases**:
- Try clicking "Download Enriched JSON" on a non-enriched conversation (should show error toast)
- Check that enriched files are larger than raw files (they contain more metadata)

---

### ✅ Test 5: Compact vs Full Mode

**What to Test**: ConversationActions in different modes

**Compact Mode (Table)**:
- Should appear as a dropdown menu (three dots icon)
- All three actions in dropdown: Download Raw, Download Enriched, View Report

**Full Mode (Detail View)**:
- Should appear as separate buttons side-by-side
- All three buttons visible: "Raw JSON", "Enriched JSON", "Validation Report"
- Button states should reflect enrichment status

**Steps**:
1. View actions in the table (compact mode) ✓
2. If you have a conversation detail page, check actions there (full mode)

---

### ✅ Test 6: Error Handling

**What to Test**: Graceful error handling

**Test Invalid Conversation ID**:
1. Manually edit URL or try with non-existent conversation
2. Expected: Error message displayed, retry button available

**Test Network Error**:
1. Disconnect from internet (or use dev tools to throttle network)
2. Try downloading or viewing report
3. Expected: Error toast with meaningful message

**Test Enriched Download When Not Ready**:
1. Click "Download Enriched JSON" on non-enriched conversation
2. Expected: Error toast explaining why it's not available

---

### ✅ Test 7: Loading States

**What to Test**: UI feedback during async operations

**Steps**:
1. Click "View Validation Report"
   - Expected: Loading spinner while fetching
2. Click download button
   - Expected: Button disabled while downloading
   - Expected: Re-enabled after download completes/fails
3. Click "Refresh" in validation report
   - Expected: Brief loading state

---

### ✅ Test 8: Responsive Design

**What to Test**: Components work on different screen sizes

**Steps**:
1. Open browser dev tools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on:
   - Mobile (iPhone 12 Pro, 390x844)
   - Tablet (iPad, 768x1024)
   - Desktop (1920x1080)

**Expected Behavior**:
- Table is horizontally scrollable on mobile
- Dialog adapts to screen size (max 85vh height)
- Buttons remain accessible on all screen sizes
- Text remains readable

---

### ✅ Test 9: Multiple Conversations

**What to Test**: Workflow with multiple conversations

**Steps**:
1. Generate 2-3 conversations
2. Watch enrichment status update (if auto-enrichment is enabled)
3. Check that statuses are independent for each conversation
4. Download raw/enriched JSON from different conversations
5. View validation reports for different conversations

**Expected Behavior**:
- Each conversation has independent enrichment status
- Downloads work for all conversations
- No cross-contamination between conversations

---

## 🐛 Known Issues & Workarounds

### Issue 1: Type Casting in Table
**Symptom**: You see `(conversation as any)` in the code  
**Impact**: None - works correctly  
**Reason**: Legacy type system vs newer storage types  
**Fix**: Optional - update type system to use `StorageConversation` everywhere

### Issue 2: Signed URLs Expire
**Symptom**: Download link doesn't work after 1 hour  
**Impact**: User needs to regenerate download link  
**Solution**: Click download button again to get fresh URL  
**Note**: This is by design for security

---

## 📊 Success Criteria

After testing, verify these criteria are met:

**Functionality**:
- [ ] Enrichment status column displays in dashboard
- [ ] Validation report dialog opens and shows all sections
- [ ] Download Raw JSON button works (when available)
- [ ] Download Enriched JSON button is disabled when not ready
- [ ] Download Enriched JSON button works when ready
- [ ] All three actions accessible from table dropdown
- [ ] Toast notifications appear for success/error

**Visual Quality**:
- [ ] Badge colors are correct and distinguishable
- [ ] Icons are properly aligned
- [ ] Dialog is scrollable with long content
- [ ] No layout shifts during loading
- [ ] Responsive design works on all screen sizes

**Error Handling**:
- [ ] Invalid conversation ID shows error message
- [ ] Network errors show meaningful messages
- [ ] Disabled buttons show tooltips/hints
- [ ] Retry button available after errors

**Performance**:
- [ ] Dialog opens quickly (< 1 second)
- [ ] Downloads start immediately
- [ ] No console errors
- [ ] No memory leaks

---

## 🔍 Debugging Tips

### Problem: "Enrichment column not showing"
**Check**:
```bash
# Check if API returns enrichment_status field
curl http://localhost:3000/api/conversations | jq '.[0].enrichment_status'
```

**Solution**: Verify database has `enrichment_status` column in `conversations` table

---

### Problem: "Download buttons don't work"
**Check**:
1. Open browser dev tools (F12) → Network tab
2. Click download button
3. Look for API call to `/api/conversations/[id]/download/raw` or `/download/enriched`
4. Check response status and body

**Common Causes**:
- 404: API endpoint not found (check route files exist)
- 500: Server error (check server logs)
- CORS: Check API CORS settings

---

### Problem: "Validation report shows error"
**Check**:
1. Open browser dev tools → Network tab
2. Look for call to `/api/conversations/[id]/validation-report`
3. Check response

**Common Causes**:
- Conversation not found
- Validation report not generated yet
- Database query error

---

### Problem: "Toast notifications not appearing"
**Check**:
- Is `sonner` installed? `npm list sonner`
- Is Toaster component rendered in layout?

**Solution**:
```bash
npm install sonner
```

Add to `app/layout.tsx`:
```tsx
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
```

---

## 📝 Test Report Template

After testing, fill out this report:

```markdown
# Enrichment UI Testing Report

**Date**: [Date]
**Tester**: [Your Name]
**Environment**: [Development/Staging/Production]

## Test Results

### ✅ Passed Tests
- [ ] View enrichment status in dashboard
- [ ] View validation report
- [ ] Download raw JSON
- [ ] Download enriched JSON (state-aware)
- [ ] Compact vs full mode
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Multiple conversations workflow

### ❌ Failed Tests
[List any failed tests with details]

### 🐛 Bugs Found
1. [Bug description]
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:
   - Screenshot: [link]

### 📸 Screenshots
- Dashboard with enrichment column: [link]
- Validation report dialog: [link]
- Download actions dropdown: [link]

### 💡 Suggestions
[Any UX improvements or feature suggestions]

## Overall Assessment
[Pass/Fail with notes]
```

---

## 🎯 Next Steps After Testing

If all tests pass:
1. ✅ Mark implementation as production-ready
2. 🚀 Deploy to staging environment
3. 📢 Notify team of new features
4. 📚 Update user documentation

If tests fail:
1. 🐛 Document bugs in testing report
2. 🔧 Fix critical issues
3. 🔁 Re-test after fixes
4. 📝 Update implementation summary with fixes

---

## 🆘 Need Help?

**Linter Errors**:
```bash
npm run lint
```

**TypeScript Errors**:
```bash
npm run type-check
# or
npx tsc --noEmit
```

**Component Not Rendering**:
1. Check browser console for errors (F12)
2. Verify import paths are correct
3. Check that all dependencies are installed
4. Restart dev server

**API Endpoints Not Working**:
1. Check server logs for errors
2. Verify API routes exist in `src/app/api/conversations/`
3. Test endpoints directly with curl or Postman
4. Check database connection

---

**Happy Testing! 🎉**

For detailed implementation information, see: `PROMPT5_FILE3_V2_IMPLEMENTATION_SUMMARY.md`

