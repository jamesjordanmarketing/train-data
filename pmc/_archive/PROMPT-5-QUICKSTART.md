# PROMPT 5 QUICKSTART GUIDE
## Test Metadata & Preview Features in 5 Minutes

---

## 🚀 QUICK START

### 1. Start the Development Server
```bash
cd src
npm run dev
```
Navigate to: `http://localhost:3000/upload`

---

## ✅ 3-MINUTE TEST SEQUENCE

### TEST 1: Metadata Editing (60 seconds)

1. **Upload a document** (any PDF, DOCX, or TXT file)
2. **Wait for "completed" status** (green badge)
3. **Click actions menu (⋮)** → "Edit Metadata"
4. **Update fields:**
   - Title: "Test Document"
   - Version: "v1.0"
   - URL: "https://example.com"
   - Date: Click calendar, select today
5. **Click "Save Changes"**
6. ✅ **Verify:** Success toast appears, dialog closes

**PASS:** If metadata saves without errors  
**FAIL:** If validation errors or save fails

---

### TEST 2: Content Preview (60 seconds)

1. **Click actions menu (⋮)** on same document → "Preview Content"
2. **Check side sheet opens** from right
3. **Verify displays:**
   - ✅ Statistics (characters, words, lines, paragraphs)
   - ✅ Quality score (0-100%)
   - ✅ Text preview scrolls
4. **Click "Copy"** button
5. **Paste in notepad** (Ctrl+V)
6. ✅ **Verify:** Full content copied
7. **Close sheet** (X or click outside)

**PASS:** If content displays and copy works  
**FAIL:** If sheet doesn't open or content missing

---

### TEST 3: Error Details (60 seconds)

1. **Create test file:**
   ```bash
   echo "" > empty.pdf
   ```
2. **Upload empty.pdf**
3. **Wait for "error" status** (red badge)
4. **Click actions menu (⋮)** → "View Error Details"
5. **Check dialog shows:**
   - ✅ Error type badge
   - ✅ Error message
   - ✅ Suggested action
   - ✅ Common causes list
6. **Click "Copy Error Details"**
7. ✅ **Verify:** Clipboard contains error info
8. **Close dialog**

**PASS:** If error details display correctly  
**FAIL:** If dialog doesn't open or info missing

---

## 🎯 SUCCESS CHECKLIST

After 3 tests above:
- [ ] Metadata edit dialog opens and saves
- [ ] Form validation works (try empty title → shows error)
- [ ] Content preview displays statistics and text
- [ ] Copy to clipboard works
- [ ] Error details dialog shows error information
- [ ] All dialogs close properly

**If all checked:** ✅ **PROMPT 5 COMPLETE!**

---

## 🔥 BONUS TESTS (Optional)

### Test Calendar Date Picker
1. Edit metadata → Click date field
2. Verify calendar opens
3. Click different dates → Verify selection works
4. Click outside → Calendar closes

### Test URL Validation
1. Edit metadata → Enter URL: "not-a-url"
2. Try to save
3. ✅ Verify: Error shows "Must be a valid HTTP or HTTPS URL"
4. Fix URL: "https://example.com"
5. ✅ Verify: Error clears, save succeeds

### Test Download
1. Preview content → Click "Download"
2. ✅ Verify: `.txt` file downloads
3. Open file → Content matches

### Test Conditional Menus
1. **Completed document** actions should show:
   - View Document
   - Preview Content ✓
   - Edit Metadata ✓
   - Delete
2. **Error document** actions should show:
   - View Document
   - View Error Details ✓
   - Retry Processing ✓
   - Delete

---

## 🐛 QUICK FIXES

### Calendar Doesn't Open
```bash
npm list react-day-picker
# Should show: react-day-picker@8.10.1
# If missing: npm install react-day-picker
```

### Date-fns Error
```bash
cd src
npm install date-fns
```

### TypeScript Errors
```bash
npm run build
# Check output for specific errors
```

---

## 📱 MOBILE TEST (30 seconds)

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Test:
   - ✅ Edit metadata dialog fits screen
   - ✅ Calendar picker works on mobile
   - ✅ Preview sheet slides from right
   - ✅ Error dialog readable on small screen

---

## 🎉 COMPLETION

**If all quick tests pass:**
✅ Metadata editing works  
✅ Content preview works  
✅ Error details works  
✅ API integration works  
✅ UI components render correctly  

**→ PROMPT 5 VERIFIED COMPLETE!**

**Next:** Proceed to **PROMPT 6** for workflow integration.

---

**Quick Reference:**
- Summary: `PROMPT-5-COMPLETION-SUMMARY.md`
- Visual Guide: `PROMPT-5-VISUAL-GUIDE.md` (if created)
- Full Testing: See "TESTING GUIDE" section in completion summary

**END OF QUICKSTART GUIDE**
