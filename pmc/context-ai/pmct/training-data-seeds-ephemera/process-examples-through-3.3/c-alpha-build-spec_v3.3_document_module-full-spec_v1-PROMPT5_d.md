# PROMPT 5d: Metadata & Preview Features (Part 4 of 4)
**Module:** Document Upload & Processing  
**Phase:** Metadata Management & Content Preview  
**Estimated Time:** 3-4 hours total (this is part 4 - FINAL)  
**Prerequisites:** PROMPT5_a.md, PROMPT5_b.md, and PROMPT5_c.md completed

---

## CONTINUATION FROM PROMPT 5c

In the previous parts, you completed:
- ✅ STEP 1: Created Metadata Update API Endpoint (PROMPT5_a.md)
- ✅ STEP 2: Created Metadata Edit Form Component (PROMPT5_b.md)
- ✅ STEP 3: Created Content Preview Component (PROMPT5_c.md)
- ✅ STEP 4: Created Error Details Dialog (PROMPT5_c.md)

In this final part, you will:
- **STEP 5: Update Upload Queue with New Features** ← THIS PART
- **Complete PROMPT 5 COMPLETION CHECKLIST** ← THIS PART

---

## CONTEXT REMINDER

You have built all the individual components for metadata editing, content preview, and error details. Now you need to integrate them into the existing Upload Queue component to make them accessible to users.

### What's Available Now
✅ Metadata Update API (PATCH /api/documents/:id)  
✅ Metadata Edit Form Dialog  
✅ Content Preview Sheet  
✅ Error Details Dialog

### Your Current Task
Integrate all new components into the Upload Queue component so users can access them via action menus.

---



====================



## STEP 5: Update Upload Queue with New Features

**DIRECTIVE:** You shall update the Upload Queue component to integrate metadata editing, content preview, and error details features.

**Instructions:**
1. Open file: `src/components/upload/upload-queue.tsx`
2. Add the following imports at the top (after existing imports):

```typescript
import { MetadataEditDialog } from './metadata-edit-dialog';
import { ContentPreviewSheet } from './content-preview-sheet';
import { ErrorDetailsDialog } from './error-details-dialog';
import { Edit, FileText as FileTextIcon, AlertTriangle } from 'lucide-react';
```

3. Add state for the new dialogs inside the `UploadQueue` component (after existing state declarations):

```typescript
// Dialog state
const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
const [errorDialogOpen, setErrorDialogOpen] = useState(false);
const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
```

4. Add handler functions inside the component (after existing handlers):

```typescript
/**
 * Open metadata edit dialog
 */
const handleEditMetadata = (doc: Document) => {
  setSelectedDocument(doc);
  setMetadataDialogOpen(true);
};

/**
 * Open content preview
 */
const handlePreviewContent = (doc: Document) => {
  setSelectedDocument(doc);
  setPreviewSheetOpen(true);
};

/**
 * Open error details
 */
const handleViewError = (doc: Document) => {
  setSelectedDocument(doc);
  setErrorDialogOpen(true);
};

/**
 * Handle successful metadata save
 */
const handleMetadataSaveSuccess = () => {
  fetchDocuments(); // Refresh list
};
```

5. Update the actions dropdown menu items (replace the existing `DropdownMenuContent` section):

```typescript
<DropdownMenuContent align="end">
  <DropdownMenuItem onClick={() => handleView(doc.id)}>
    <Eye className="w-4 h-4 mr-2" />
    View Document
  </DropdownMenuItem>
  
  {doc.status === 'completed' && (
    <>
      <DropdownMenuItem onClick={() => handlePreviewContent(doc)}>
        <FileTextIcon className="w-4 h-4 mr-2" />
        Preview Content
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleEditMetadata(doc)}>
        <Edit className="w-4 h-4 mr-2" />
        Edit Metadata
      </DropdownMenuItem>
    </>
  )}
  
  {doc.status === 'error' && (
    <>
      <DropdownMenuItem onClick={() => handleViewError(doc)}>
        <AlertTriangle className="w-4 h-4 mr-2" />
        View Error Details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleRetry(doc.id)}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry Processing
      </DropdownMenuItem>
    </>
  )}
  
  <DropdownMenuItem 
    onClick={() => handleDelete(doc.id, doc.file_path)}
    className="text-red-600 dark:text-red-400"
  >
    <Trash2 className="w-4 h-4 mr-2" />
    Delete
  </DropdownMenuItem>
</DropdownMenuContent>
```

6. Add the dialog components before the closing `</div>` of the main return statement:

```typescript
      {/* Polling Indicator */}
      {isPolling && (
        <div className="text-xs text-muted-foreground text-center">
          Auto-refreshing status every 2 seconds...
        </div>
      )}

      {/* Metadata Edit Dialog */}
      <MetadataEditDialog
        document={selectedDocument}
        open={metadataDialogOpen}
        onOpenChange={setMetadataDialogOpen}
        onSaveSuccess={handleMetadataSaveSuccess}
      />

      {/* Content Preview Sheet */}
      <ContentPreviewSheet
        documentId={selectedDocument?.id || null}
        open={previewSheetOpen}
        onOpenChange={setPreviewSheetOpen}
      />

      {/* Error Details Dialog */}
      <ErrorDetailsDialog
        documentId={selectedDocument?.id || null}
        documentTitle={selectedDocument?.title || null}
        errorMessage={selectedDocument?.processing_error || null}
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        onRetry={handleRetry}
      />
    </div>
  );
}
```

**Verification:**
1. File compiles with no TypeScript errors
2. All new imports resolve correctly
3. Upload queue displays new menu options

**Note:** If you need to install the `date-fns` package for the Calendar component:
```bash
npm install date-fns
```



++++++++++++++++++++++++



## PROMPT 5 COMPLETION CHECKLIST

Before proceeding to Prompt 6, verify all items below:

### Components Created
- [ ] Metadata Update API: `src/app/api/documents/[id]/route.ts`
- [ ] Metadata Edit Dialog: `src/components/upload/metadata-edit-dialog.tsx`
- [ ] Content Preview Sheet: `src/components/upload/content-preview-sheet.tsx`
- [ ] Error Details Dialog: `src/components/upload/error-details-dialog.tsx`
- [ ] Updated Upload Queue: `src/components/upload/upload-queue.tsx` (modified)

### Build Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] All imports resolve correctly
- [ ] `date-fns` package installed (if needed)
- [ ] No console errors when starting dev server

### Metadata Editing Testing
- [ ] Navigate to upload queue
- [ ] Click actions dropdown on a completed document
- [ ] Click "Edit Metadata"
- [ ] Verify dialog opens with current values
- [ ] Edit title, verify validation (required field)
- [ ] Add version (e.g., "v2.0")
- [ ] Add source URL, test invalid URL (should show error)
- [ ] Add valid URL (e.g., "https://example.com")
- [ ] Select document date from calendar
- [ ] Click "Save Changes"
- [ ] Verify success toast appears
- [ ] Verify dialog closes
- [ ] Refresh queue, verify changes persisted

### API Endpoint Testing
- [ ] Test PATCH endpoint with curl or Postman:
  ```bash
  curl -X PATCH "http://localhost:3000/api/documents/DOC_ID" \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"New Title","doc_version":"v3.0"}'
  ```
- [ ] Verify 200 response with updated document
- [ ] Test with invalid URL, verify 400 error
- [ ] Test with empty title, verify 400 error
- [ ] Test with another user's document ID, verify 403 error

### Content Preview Testing
- [ ] Click actions dropdown on completed document
- [ ] Click "Preview Content"
- [ ] Verify side sheet opens from right
- [ ] Check statistics show correct counts
- [ ] Check quality indicators display
- [ ] Verify first 2000 characters of text shown
- [ ] Scroll through text preview
- [ ] Click "Copy" button, verify clipboard contains text
- [ ] Click "Download" button, verify .txt file downloads
- [ ] Close sheet, verify it closes properly

### Error Details Testing
- [ ] Upload a corrupt or empty file to create error
- [ ] Wait for processing to fail (status = 'error')
- [ ] Click actions dropdown on error document
- [ ] Click "View Error Details"
- [ ] Verify dialog opens with error information
- [ ] Check error type badge shows correct category
- [ ] Check suggested action is relevant
- [ ] Check common causes list displays
- [ ] Click "Copy Error Details", verify clipboard
- [ ] If recoverable error, verify "Retry Processing" button shows
- [ ] Click "Contact Support", verify email client opens with pre-filled info
- [ ] Close dialog

### UI/UX Testing
- [ ] Metadata edit form validates URL format
- [ ] Date picker works and displays correctly
- [ ] Content preview sheet scrolls smoothly
- [ ] Error dialog shows appropriate icons and colors
- [ ] All dialogs close via X button, Cancel button, or outside click
- [ ] Loading states show during API calls
- [ ] Toast notifications appear for all actions
- [ ] Mobile responsive (test on small screen)

### Integration Testing
- [ ] Edit metadata → Save → Verify in preview
- [ ] Preview content → Edit metadata → Preview again
- [ ] View error → Retry → Watch status change
- [ ] Delete document → Verify removed from queue
- [ ] Upload → Process → Edit metadata → Preview → Navigate to workflow

### Error Handling
- [ ] Edit metadata without auth token (should fail gracefully)
- [ ] Edit another user's document (should show 403)
- [ ] Save invalid data (empty title, bad URL format)
- [ ] Preview non-existent document (should show error)
- [ ] Network error during save (should show error toast)

### Performance Testing
- [ ] Metadata save completes in < 500ms
- [ ] Content preview loads in < 1 second
- [ ] Large documents (10,000+ words) preview smoothly
- [ ] Multiple dialogs can open/close without memory leaks
- [ ] No lag when scrolling through long content

### Manual Test Scenario

1. **Complete Metadata Workflow:**
   - Upload a PDF file
   - Wait for processing to complete
   - Open actions dropdown
   - Click "Edit Metadata"
   - Update all fields (title, version, URL, date)
   - Save changes
   - Click "Preview Content"
   - Verify updated metadata shows in preview
   - Close preview
   - Navigate to workflow page
   - Verify metadata displays correctly

2. **Error Handling Workflow:**
   - Create empty file: `touch empty.pdf`
   - Upload empty.pdf
   - Wait for processing to fail
   - Click "View Error Details"
   - Read error information
   - Copy error details
   - Click "Retry Processing"
   - Wait for retry to fail (expected)
   - View error details again
   - Note error persists

3. **Content Preview Workflow:**
   - Upload a document with substantial content (1000+ words)
   - Wait for completion
   - Click "Preview Content"
   - Review statistics (verify counts seem accurate)
   - Check quality score
   - Scroll through preview text
   - Click "Copy"
   - Open text editor, paste (verify copied)
   - Click "Download"
   - Open downloaded file (verify content matches)

**If all items checked:** ✅ Prompt 5 complete! Proceed to Prompt 6.

---

## What's Next

**Prompt 6** will build:
- Workflow integration (connect upload module to categorization workflow)
- Update Document Selector to include uploaded documents
- "Start Workflow" button in upload queue
- Bulk workflow processing capability
- End-to-end testing procedures
- Final documentation and completion summary

After Prompt 6, the document upload module will be **fully complete** with all features from the requirements specification!

---

## PROMPT 5 SUMMARY

**Congratulations!** You have completed all components for Prompt 5:

### Components Built
1. ✅ **Metadata Update API** - PATCH, GET, DELETE endpoints with validation
2. ✅ **Metadata Edit Dialog** - Form with title, version, URL, date fields
3. ✅ **Content Preview Sheet** - Statistics, quality indicators, copy/download
4. ✅ **Error Details Dialog** - Classification, suggested actions, support
5. ✅ **Updated Upload Queue** - Integrated all new features

### Features Delivered
- ✅ Users can edit document metadata after upload
- ✅ Metadata changes persist to database via API
- ✅ Content preview shows extracted text with statistics
- ✅ Error details provide actionable information
- ✅ All features integrate seamlessly with queue
- ✅ Form validation works correctly

### Lines of Code Added
- ~1,500 lines across 4 new components + API endpoint
- Full TypeScript type safety
- Comprehensive error handling
- Production-ready code

### Time Investment
- Estimated: 3-4 hours total
- Actual: Will vary based on testing thoroughness

---

**END OF PROMPT 5d (Part 4 of 4)**

**🎉 PROMPT 5 COMPLETE! 🎉**

**Next:** Proceed to PROMPT6.md for workflow integration and final completion.
