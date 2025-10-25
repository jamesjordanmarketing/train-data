# PROMPT 6 - PART 1: Quick Start Guide
## Testing Document Selector & Navigation Updates

**Date:** October 10, 2025  
**Estimated Testing Time:** 5-10 minutes

---

## 🎯 What Was Built

Part 1 added three key features:

1. ✅ **"Uploaded" Badge** - Distinguishes uploaded files from seed data
2. ✅ **Source Filter** - Filter by "All", "Uploaded Only", or "Seed Data Only"
3. ✅ **Workflow Navigation Utilities** - Helper functions for Parts 2 & 3

---

## 🚀 Quick Test (5 Minutes)

### Step 1: View the Document Selector (1 min)

```bash
# Make sure your dev server is running
cd src
npm run dev
```

1. Navigate to: `http://localhost:3000/dashboard`
2. You should see the document selector page
3. Look for the **new filter dropdown** labeled "Filter by Source"

**Expected Result:**
- Filter bar shows three dropdowns: Search, Status, and **Source (NEW)**
- Source filter has options: "All Sources", "Uploaded Only", "Seed Data Only"

### Step 2: Test Source Filter (2 min)

**Test A: Show All Sources**
1. Select "All Sources" from source filter
2. Observe all documents appear

**Test B: Show Uploaded Only**
1. Select "Uploaded Only" from source filter
2. Observe only documents with "Uploaded" badge are shown
3. If no uploaded documents exist, you'll see empty state

**Test C: Show Seed Data Only**
1. Select "Seed Data Only" from source filter
2. Observe only documents WITHOUT "Uploaded" badge are shown
3. These are the original database seed documents

### Step 3: Verify "Uploaded" Badge (2 min)

If you have uploaded documents from Prompts 1-5:

1. Set filter to "All Sources"
2. Find a document you uploaded
3. Look at the metadata row (below title)
4. **Expected:** See gray "Uploaded" badge after date/author

If you don't have uploaded documents:

1. Go to `/upload`
2. Upload any document (PDF, DOCX, TXT)
3. Wait for processing to complete
4. Return to `/dashboard`
5. Find your document - it should have "Uploaded" badge

### Step 4: Test Combined Filters (1 min)

1. Set Status filter to "Completed"
2. Set Source filter to "Uploaded Only"
3. Observe only completed uploaded documents show
4. Try searching too: enter a search term
5. All three filters should work together

---

## ✅ Verification Checklist

Quick checklist to confirm everything works:

### Visual Elements
- [ ] Source filter dropdown appears in filter bar
- [ ] Source filter has three options
- [ ] "Uploaded" badge appears on uploaded documents (if any exist)
- [ ] Badge is gray with "secondary" styling
- [ ] Badge appears in metadata row after author info

### Filter Functionality
- [ ] "All Sources" shows all documents
- [ ] "Uploaded Only" shows only documents with badge
- [ ] "Seed Data Only" shows only documents without badge
- [ ] Source filter persists when changing other filters
- [ ] All filters (search + status + source) work together

### No Errors
- [ ] Page loads without console errors
- [ ] No React warnings in console
- [ ] Filter changes don't cause errors
- [ ] Smooth transition when filtering

---

## 🔧 Developer Verification

If you want to verify the code implementation:

### 1. Check Workflow Navigation Utilities

```bash
# Open the new utility file
code src/lib/workflow-navigation.ts
```

**Verify:**
- File exists
- Contains 6 exported functions
- TypeScript types are defined
- No linter errors

**Quick Test in Browser Console:**

```javascript
// On the dashboard page, open console and try:
import { isReadyForWorkflow } from '@/lib/workflow-navigation'

isReadyForWorkflow('completed')  // Should return: true
isReadyForWorkflow('processing') // Should return: false
```

### 2. Check Component Updates

```bash
# Open the modified component
code src/components/client/DocumentSelectorClient.tsx
```

**Verify Lines:**
- Line ~27: `file_path?: string | null` in interface
- Line ~46: `sourceFilter` state variable
- Line ~54-60: Source filter logic in `filteredDocuments`
- Line ~194-206: Source filter UI element
- Line ~290-294: "Uploaded" badge rendering

### 3. Check TypeScript Compilation

```bash
cd src
npm run build
```

**Expected Result:**
- No TypeScript errors
- Build completes successfully
- All types resolve correctly

---

## 🐛 Troubleshooting

### Issue 1: Source Filter Doesn't Appear

**Symptoms:**
- Filter bar only shows Search and Status filters
- No "Filter by Source" dropdown

**Cause:**
- Component might not have updated
- Browser cache issue

**Solution:**
```bash
# Hard refresh the page
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Or restart dev server
cd src
npm run dev
```

### Issue 2: No "Uploaded" Badge Appears

**Symptoms:**
- Uploaded documents don't show badge
- All documents look the same

**Possible Causes:**
1. **No uploaded documents exist**
   - Solution: Upload a document via `/upload` first

2. **Database doesn't have file_path**
   - Check: Look at document in database
   - Solution: Verify Prompt 1 schema changes were applied

3. **Component not receiving file_path**
   - Check: Browser DevTools → Components → DocumentSelectorClient
   - Solution: Verify server component passes file_path

### Issue 3: Filter Shows No Results

**Symptoms:**
- Selecting "Uploaded Only" shows empty state
- You know you have uploaded documents

**Cause:**
- Documents might not have completed processing yet
- Check document status in upload queue

**Solution:**
```bash
# Go to upload page to check status
http://localhost:3000/upload

# Wait for processing to complete
# Status should be 'completed' before showing in selector
```

### Issue 4: TypeScript Errors

**Symptoms:**
- Red underlines in IDE
- Build fails with type errors

**Solution:**
```bash
# Restart TypeScript server in VSCode
Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or rebuild
cd src
npm run build
```

---

## 📊 Expected Test Results

### Scenario 1: Fresh Installation (No Uploads)

**What You'll See:**
- Source filter works
- "All Sources" shows seed documents
- "Uploaded Only" shows empty state (no uploads yet)
- "Seed Data Only" shows all seed documents
- No "Uploaded" badges visible (none exist yet)

**Action:** Upload a document to test badge feature

### Scenario 2: After Uploading Documents

**What You'll See:**
- Source filter works
- "All Sources" shows both uploaded and seed docs
- "Uploaded Only" shows your uploaded documents with badges
- "Seed Data Only" shows only original seed documents
- "Uploaded" badges visible on uploaded documents

### Scenario 3: Multiple Uploads

**What You'll See:**
- Multiple documents with "Uploaded" badge
- Filter accurately shows only uploaded when selected
- Badge appears consistently on all uploaded docs
- Seed documents clearly distinguishable (no badge)

---

## 🧪 Advanced Testing

### Test Combined Filters

```
Test Case 1: Search + Source Filter
┌────────────────────────────────────┐
│ Search: "report"                   │
│ Status: All                        │
│ Source: Uploaded Only              │
│                                    │
│ Expected: Only uploaded documents  │
│ with "report" in title or summary │
└────────────────────────────────────┘

Test Case 2: All Filters
┌────────────────────────────────────┐
│ Search: "machine"                  │
│ Status: Completed                  │
│ Source: Seed Data Only             │
│                                    │
│ Expected: Only completed seed docs │
│ with "machine" in title or summary │
└────────────────────────────────────┘
```

### Test Edge Cases

1. **Empty Search**
   - Leave search blank
   - Change filters
   - Should work normally

2. **No Matches**
   - Search for nonsense: "xyzabc"
   - Should show empty state message

3. **Rapid Filter Changes**
   - Quickly change source filter multiple times
   - Should update smoothly without errors

---

## 📸 Visual Comparison

### Filter Bar (Before vs After)

**BEFORE Part 1:**
```
┌──────────────────────────────────────────────┐
│ Search Documents                             │
│ [🔍 Search...]  [Status Filter ▼]          │
└──────────────────────────────────────────────┘
```

**AFTER Part 1:**
```
┌────────────────────────────────────────────────────────┐
│ Search Documents                                       │
│ [🔍 Search...]  [Status Filter ▼]  [Source Filter ▼] │
│                                      ↑                 │
│                                     NEW                │
└────────────────────────────────────────────────────────┘
```

### Document Card (Before vs After)

**BEFORE Part 1:**
```
┌─────────────────────────────────────────┐
│ 📄 My Uploaded Document                │
│    📅 2024-10-10  👤 user@email.com    │
│    Summary text here...                 │
│    [Status Badge]    [Action Button]   │
└─────────────────────────────────────────┘
```

**AFTER Part 1:**
```
┌─────────────────────────────────────────┐
│ 📄 My Uploaded Document                │
│    📅 2024-10-10  👤 user@email.com    │
│    [Uploaded]  ← NEW BADGE             │
│    Summary text here...                 │
│    [Status Badge]    [Action Button]   │
└─────────────────────────────────────────┘
```

---

## 🎓 Understanding the Changes

### Why the "Uploaded" Badge?

**Problem:** Users couldn't tell which documents came from:
- File uploads (have actual files in storage)
- Database seeds (just text in database)

**Solution:** Badge shows at a glance which documents have files

**Use Case:** When managing documents, knowing source helps with:
- Troubleshooting processing issues
- Organizing content
- Understanding data provenance

### Why the Source Filter?

**Problem:** No way to view only uploaded or only seed documents

**Solution:** Filter dropdown to show specific document sources

**Use Case:** Helpful when:
- Testing upload functionality
- Reviewing only uploaded content
- Distinguishing test data from real data

### Why Workflow Navigation Utilities?

**Problem:** Need consistent way to navigate from upload to workflow

**Solution:** Centralized utility functions for workflow navigation

**Use Case:** Parts 2 & 3 will use these to:
- Add "Start Workflow" buttons
- Check document readiness
- Navigate to correct workflow stage

---

## ✅ Completion Criteria

You've successfully completed Part 1 testing if:

- [x] Source filter dropdown appears and works
- [x] "Uploaded" badge appears on uploaded documents
- [x] "Seed Data Only" filter hides uploaded documents
- [x] "Uploaded Only" filter hides seed documents
- [x] All filters work together harmoniously
- [x] No console errors or warnings
- [x] Page loads and functions smoothly

---

## 🚀 Next Steps

**You're ready for Part 2 if:**
- ✅ All Part 1 features work correctly
- ✅ No critical bugs found
- ✅ Visual elements render properly
- ✅ Filters function as expected

**Part 2 will add:**
- "Start Workflow" button on upload page
- Workflow action buttons in upload queue
- Bulk workflow processing
- Navigation from upload to workflow

---

## 📞 Support

If you encounter issues:

1. **Check Browser Console** - Look for errors or warnings
2. **Verify Database** - Ensure file_path column exists
3. **Check Processing** - Ensure documents completed processing
4. **Restart Dev Server** - Sometimes helps with cache issues

---

**Status:** ✅ PART 1 READY FOR TESTING

**Next:** After verifying Part 1 works, continue with PROMPT6_b.md (Part 2 of 3)

