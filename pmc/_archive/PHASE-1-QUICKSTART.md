# Phase 1 Quick Start Guide

## Immediate Verification Steps

Follow these steps to verify Phase 1 is working correctly:

---

## Step 1: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
> chunks-alpha@0.1.0 dev
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

---

## Step 2: Test Database Connection

### Navigate to Test Page
Open browser to: **http://localhost:3000/test-chunks**

### What You Should See
✅ Large green checkmark with "Database Connection Successful"  
✅ "Prompt Templates" card showing:
   - Status: "Connected"
   - Template Count: (number > 0)

✅ "Chunks Table" card showing:
   - Status: "Accessible" or "Not Tested"
   - Service: chunkService

✅ Sample templates displayed (if templates exist in database)

✅ All 5 services with green checkmarks:
   - chunkService
   - chunkDimensionService
   - chunkRunService
   - promptTemplateService
   - chunkExtractionJobService

### Troubleshooting

**If you see "Database Connection Failed":**
1. Check Supabase credentials in `src/utils/supabase/info.ts`
2. Verify Supabase project is running
3. Check network connectivity
4. Review browser console for specific error messages

**If template count is 0:**
- This is OK if you haven't seeded the database yet
- Database connection is still working
- You'll add templates in Phase 2

---

## Step 3: Test Dashboard Integration

### Navigate to Dashboard
Go to: **http://localhost:3000** (or your dashboard route)

### Find a Completed Document

Look for documents with status: **✓ Completed** (green badge)

### Verify "Chunks" Button

For each completed document, you should see:

**If no chunks exist yet:**
```
[Review Categorization →]  [🔳 Start Chunking]
                           ↑ Secondary style (gray/outlined)
```

**If chunks already exist:**
```
[Review Categorization →]  [🔳 View Chunks (5)]
                           ↑ Primary style (filled/colored)
                           ↑ Shows actual count
```

### Verify Button Behavior

**For pending/categorizing documents:**
- NO "Chunks" button should appear
- Only "Start Categorization" button visible

**For completed documents:**
- Both buttons should appear
- "Chunks" button on the right

### Click Test

1. Click the "Chunks" button
2. Should navigate to `/chunks/[documentId]`
3. You'll see a 404 page (expected - Phase 2 will create this route)
4. Note the URL format: `/chunks/doc-id-here`

---

## Step 4: Verify TypeScript Compilation

### Check for Errors

In your terminal (where dev server is running), verify:

✅ No TypeScript errors  
✅ No compilation errors  
✅ No module resolution errors  

### VSCode Verification

If using VSCode:
1. Open `src/types/chunks.ts`
2. Hover over type names - should show IntelliSense
3. No red squiggly lines
4. No errors in "Problems" panel

---

## Step 5: Test Service Imports

### Browser Console Test

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to test page (`/test-chunks`)
4. Check for errors

**Should NOT see:**
- ❌ Module not found errors
- ❌ Cannot import errors
- ❌ Undefined function errors

**Should see:**
- ✅ Network requests to Supabase
- ✅ Successful data fetches
- ✅ No red error messages

---

## Step 6: Verify File Structure

### Check Files Exist

```bash
# From project root
ls src/types/chunks.ts
ls src/lib/chunk-service.ts
ls src/app/test-chunks/page.tsx
```

**All three should exist and show file paths**

### Check File Contents

```bash
# Verify types file has content
wc -l src/types/chunks.ts
# Should show: 150+ lines

# Verify service file has content
wc -l src/lib/chunk-service.ts
# Should show: 200+ lines

# Verify test page has content
wc -l src/app/test-chunks/page.tsx
# Should show: 200+ lines
```

---

## Complete Verification Checklist

Print this and check off each item:

### Database Layer
- [ ] Test page loads successfully
- [ ] Database connection shows "Successful"
- [ ] Prompt templates query works
- [ ] Chunks table is accessible
- [ ] All 5 services show as operational

### UI Integration
- [ ] Dashboard loads without errors
- [ ] Completed documents display correctly
- [ ] "Chunks" button appears on completed docs
- [ ] Button shows correct text (Start/View)
- [ ] Button shows correct variant (secondary/default)
- [ ] Button click navigates to correct URL

### Code Quality
- [ ] No TypeScript errors in terminal
- [ ] No linter errors in VSCode
- [ ] IntelliSense works for chunk types
- [ ] Imports resolve correctly
- [ ] No console errors in browser

### Files Created
- [ ] `src/types/chunks.ts` exists
- [ ] `src/lib/chunk-service.ts` exists
- [ ] `src/app/test-chunks/page.tsx` exists
- [ ] `PHASE-1-COMPLETION-SUMMARY.md` exists
- [ ] `PHASE-1-VISUAL-GUIDE.md` exists

---

## Common Issues & Solutions

### Issue: "Module not found" error for chunk-service

**Solution:**
```bash
# Restart TypeScript server in VSCode
# Press: Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)
# Type: "TypeScript: Restart TS Server"
# Press Enter
```

### Issue: Test page shows 404

**Problem:** Route not recognized

**Solution:**
1. Stop dev server (Ctrl+C)
2. Delete `.next` folder: `rm -rf .next`
3. Restart dev server: `npm run dev`

### Issue: Chunks button not appearing

**Check:**
1. Is document status = 'completed'?
2. Check database: `SELECT status FROM documents WHERE id = 'your-doc-id'`
3. Verify server component is being used (not client component)

### Issue: Database connection failed

**Check:**
1. Supabase project status at supabase.com
2. Environment variables in `.env.local`
3. Supabase credentials in `src/utils/supabase/info.ts`
4. Network connectivity

---

## Next Actions

Once all checklist items pass:

### You're Ready for Phase 2!

Phase 2 will include:
1. Creating the `/chunks/[documentId]` route
2. Building chunk extraction UI
3. Implementing chunk processing logic
4. Adding dimension generation interface

### Before Moving to Phase 2

1. ✅ Commit your Phase 1 changes
   ```bash
   git add src/types/chunks.ts
   git add src/lib/chunk-service.ts
   git add src/app/test-chunks/page.tsx
   git add src/components/server/DocumentSelectorServer.tsx
   git commit -m "Phase 1: Database schema & infrastructure complete"
   ```

2. ✅ Review the completion summary
   - Read `PHASE-1-COMPLETION-SUMMARY.md`
   - Understand the architecture decisions
   - Note the integration points

3. ✅ Test edge cases
   - Try with different document statuses
   - Test with 0 chunks, 1 chunk, many chunks
   - Test error handling (invalid document ID)

---

## Success Metrics

You've successfully completed Phase 1 if:

✅ All checklist items pass  
✅ Test page loads and shows green status  
✅ Dashboard shows chunks button correctly  
✅ No errors in terminal or browser console  
✅ TypeScript compilation succeeds  
✅ All 5 services are accessible  
✅ Documentation is complete  

---

## Support Resources

### Files to Reference
- `PHASE-1-COMPLETION-SUMMARY.md` - Detailed technical documentation
- `PHASE-1-VISUAL-GUIDE.md` - UI/UX reference
- `src/types/chunks.ts` - Type definitions
- `src/lib/chunk-service.ts` - Service implementations

### Code Examples
- Check existing services in `src/lib/database.ts` for patterns
- Review dashboard integration in `src/components/server/DocumentSelectorServer.tsx`
- Study test page implementation in `src/app/test-chunks/page.tsx`

---

**Estimated Completion Time:** 5-10 minutes  
**Difficulty Level:** Easy (just verification)  
**Prerequisites:** Working Next.js app, Supabase connection  

---

**Status:** Ready to verify! 🚀  
**Next Phase:** Phase 2 - Chunk Extraction UI  

