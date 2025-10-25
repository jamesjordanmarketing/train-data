# PROMPT 4D: Integration & Testing (Part 4 of 4)
**Module:** Document Upload & Processing  
**Phase:** Real-Time Updates & Queue Interface  
**Estimated Time:** 1 hour (Step 7 + Testing)  
**Prerequisites:** PROMPT4_a.md, PROMPT4_b.md, and PROMPT4_c.md completed

---

## 📌 CONTEXT: This is Part 4 of 4 (FINAL)

This prompt file contains the final step of Prompt 4:
- **STEP 7:** Update Upload Page with Queue Management
- **Complete Testing Checklist**
- **What's Next** information

**Prerequisites:** You must have completed:
- **PROMPT4_a.md** - Status API & Hook
- **PROMPT4_b.md** - Status Badge & Statistics
- **PROMPT4_c.md** - Upload Filters & Queue

This is the final part. After completion, Prompt 4 will be complete!

---

## CONTEXT REMINDER

### What's Already Built
✅ **PROMPT4_a:** Status Polling API, Status Polling Hook  
✅ **PROMPT4_b:** Document Status Badge, Upload Statistics  
✅ **PROMPT4_c:** Upload Filters, Upload Queue

### Your Task in Prompt 4D (Step 7)
7. ✅ Update Upload Page to integrate all components

### Success Criteria for Part 4D
- Upload page has tabbed interface (Upload Files / Manage Queue)
- Statistics dashboard shows at top
- Queue tab displays full queue management
- All components work together seamlessly

---



====================



## STEP 7: Update Upload Page with Queue Management

**DIRECTIVE:** You shall update the existing upload page to integrate the new upload queue and statistics components.

**Instructions:**
1. Open file: `src/app/(dashboard)/upload/page.tsx`
2. Replace the entire file contents with the code below
3. Save and verify no TypeScript errors

**File:** `src/app/(dashboard)/upload/page.tsx`

```typescript
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '../../../components/upload/upload-dropzone';
import { UploadQueue } from '../../../components/upload/upload-queue';
import { UploadStats } from '../../../components/upload/upload-stats';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ArrowLeft, Upload as UploadIcon, ListFilter } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { UploadDocumentResponse } from '../../../lib/types/upload';

/**
 * Upload Page Component (Updated)
 * 
 * Enhanced upload page with:
 * - Two tabs: "Upload Files" and "Manage Queue"
 * - Upload dropzone in upload tab
 * - Full queue management in manage tab
 * - Statistics dashboard
 * - Real-time status updates
 */
export default function UploadPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('upload');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [queueRefreshKey, setQueueRefreshKey] = React.useState(0);

  /**
   * Handle files added from dropzone
   */
  const handleFilesAdded = async (files: File[]) => {
    await uploadFiles(files);
  };

  /**
   * Upload files to API sequentially
   */
  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required', {
          description: 'Please sign in to upload documents'
        });
        router.push('/signin');
        return;
      }

      const token = session.access_token;
      let completedCount = 0;
      let failedCount = 0;

      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        const progressPercent = Math.round(((i / files.length) * 100));
        setUploadProgress(progressPercent);

        try {
          // Create form data
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', file.name.replace(/\.[^/.]+$/, '')); // Remove extension

          // Call upload API
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          const data: UploadDocumentResponse = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Upload failed');
          }

          completedCount++;
          
          toast.success(`Uploaded: ${file.name}`, {
            description: 'Text extraction started automatically'
          });

        } catch (error) {
          failedCount++;
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`, {
            description: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Final progress
      setUploadProgress(100);

      // Show summary
      if (completedCount > 0) {
        toast.success('Upload complete', {
          description: `Successfully uploaded ${completedCount} of ${files.length} file(s)`
        });
        
        // Switch to queue tab and refresh
        setActiveTab('queue');
        setQueueRefreshKey(prev => prev + 1);
      }

      if (failedCount === files.length) {
        toast.error('All uploads failed', {
          description: 'Please check your files and try again'
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsUploading(false);
      // Keep progress at 100% for a moment before resetting
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Document Upload & Management</h1>
        <p className="text-muted-foreground">
          Upload documents for processing, monitor status, and manage your upload queue
        </p>
      </div>

      {/* Statistics Dashboard */}
      <div className="mb-6">
        <UploadStats refreshInterval={5000} />
      </div>

      {/* Tabs: Upload vs Queue Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upload" className="gap-2">
            <UploadIcon className="w-4 h-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-2">
            <ListFilter className="w-4 h-4" />
            Manage Queue
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <UploadDropzone
            onFilesAdded={handleFilesAdded}
            currentFileCount={0}
            maxFiles={100}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </TabsContent>

        {/* Queue Management Tab */}
        <TabsContent value="queue">
          <UploadQueue key={queueRefreshKey} autoRefresh={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Explanation:**
- **Tabbed Interface:** Upload tab for new uploads, Queue tab for management
- **Statistics:** Shows aggregate metrics at top
- **Auto-Switch:** After upload completes, switches to queue tab automatically
- **Real-Time Updates:** Queue uses status polling hook
- **Refresh Key:** Forces queue refresh after uploads complete
- **Responsive:** Full width container for better table visibility

**Verification:**
1. File compiles with no TypeScript errors
2. Tabs component exists at `src/components/ui/tabs.tsx`
3. All imports resolve correctly



++++++++++++++++++++++++



## PROMPT 4 COMPLETION CHECKLIST

Before proceeding to Prompt 5, verify all items below:

### Components Created
- [ ] Status Polling API: `src/app/api/documents/status/route.ts`
- [ ] Status Polling Hook: `src/hooks/use-document-status.ts`
- [ ] Status Badge Component: `src/components/upload/document-status-badge.tsx`
- [ ] Upload Statistics: `src/components/upload/upload-stats.tsx`
- [ ] Upload Filters: `src/components/upload/upload-filters.tsx`
- [ ] Upload Queue: `src/components/upload/upload-queue.tsx`
- [ ] Updated Upload Page: `src/app/(dashboard)/upload/page.tsx`

### Build Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] All imports resolve correctly
- [ ] No console errors when starting dev server
- [ ] Upload page loads at `/upload`

### Status Polling Testing
- [ ] Upload a PDF file
- [ ] Watch status badge change from "Queued" → "Processing" → "Completed"
- [ ] Verify status updates every 2 seconds without page refresh
- [ ] Verify polling stops when document reaches "Completed" state
- [ ] Check browser console for polling logs
- [ ] Switch to different tab, verify polling pauses (check console logs)
- [ ] Switch back to tab, verify polling resumes

### Queue Management Testing
- [ ] Navigate to "Manage Queue" tab
- [ ] Verify all uploaded documents appear in table
- [ ] Check statistics cards show correct counts
- [ ] Test status filter (select "Completed", verify filtering works)
- [ ] Test file type filter (select "PDF", verify filtering works)
- [ ] Test search (enter filename, verify filtering works)
- [ ] Test clear filters button
- [ ] Verify active filters display as badges
- [ ] Test actions dropdown (View, Retry, Delete)

### Real-Time Updates Testing
- [ ] Open two browser windows side-by-side
- [ ] Upload file in window 1
- [ ] Watch window 2 for real-time status updates
- [ ] Verify both windows show same status within 2 seconds

### Error Handling Testing
- [ ] Upload a corrupt PDF (create empty file with .pdf extension)
- [ ] Verify status changes to "Error"
- [ ] Verify error badge is red with X icon
- [ ] Click actions dropdown, verify "Retry Processing" option appears
- [ ] Click retry, verify processing restarts
- [ ] Verify error message stored in database

### Performance Testing
- [ ] Upload 10+ files at once
- [ ] Verify all files process without timeout
- [ ] Verify polling doesn't cause excessive network traffic
- [ ] Check Network tab: status API calls should be ~200ms or less
- [ ] Verify UI remains responsive during processing

### UI/UX Testing
- [ ] Status badges have correct colors (gray, blue, green, red)
- [ ] Progress bars animate smoothly
- [ ] Icons animate for "Processing" status (spinner rotates)
- [ ] Table is responsive on mobile
- [ ] Filters work on mobile
- [ ] Statistics cards stack properly on mobile
- [ ] Empty state displays when no documents
- [ ] Empty state displays when no filtered results

### Integration Testing
- [ ] Upload → View workflow (click "View Document", navigates to workflow)
- [ ] Upload → Process → Complete → Navigate to workflow
- [ ] Delete document, verify removed from queue
- [ ] Verify deleted document removed from storage (check Supabase)
- [ ] Upload, immediately switch to Queue tab, verify appears

### Manual Test Scenario

1. **Fresh Upload Test:**
   - Navigate to `/upload`
   - Upload 3 different file types (PDF, DOCX, TXT)
   - Verify statistics update (Total Files increases)
   - Verify "Queued" count increases
   - Wait 5-10 seconds
   - Verify "Processing" count increases, "Queued" decreases
   - Wait for completion
   - Verify "Completed" count increases, "Processing" decreases

2. **Queue Management Test:**
   - Switch to "Manage Queue" tab
   - Verify all 3 files appear in table
   - Filter by status: "Completed"
   - Verify only completed files show
   - Clear filter
   - Search for one filename
   - Verify only matching file shows
   - Click actions dropdown on a completed file
   - Click "View Document"
   - Verify navigation to workflow page

3. **Error Handling Test:**
   - Create empty file: `touch empty.pdf`
   - Upload empty.pdf
   - Watch it fail (status becomes "Error")
   - Click actions dropdown
   - Click "Retry Processing"
   - Verify retry attempted (will fail again, expected)
   - Click "Delete"
   - Confirm deletion
   - Verify document removed from queue

4. **Polling Behavior Test:**
   - Upload a large PDF (5-10 MB)
   - Open browser DevTools → Console
   - Watch for `[useDocumentStatus]` log messages
   - Verify polling starts
   - Minimize or switch to different tab
   - Check console: should see "Tab hidden, pausing polling"
   - Switch back to tab
   - Check console: should see "Tab visible, resuming polling"
   - Wait for document to complete
   - Check console: should see "All documents completed, stopping polling"

**If all items checked:** ✅ Prompt 4 complete! Proceed to Prompt 5.

---

## What's Next

**Prompt 5** will build:
- Metadata editing form (edit title, version, URL, date)
- Content preview component (show extracted text)
- Enhanced error details dialog
- Metadata update API endpoint (PATCH /api/documents/:id)

**Prompt 6** will build:
- Workflow integration (connect upload module to categorization workflow)
- Document selector updates (include uploaded documents)
- Bulk workflow processing
- End-to-end testing
- Final documentation

After Prompt 6, the document upload module will be **fully complete** with all features from the requirements specification.

---

## 🎉 CONGRATULATIONS!

You have successfully completed **PROMPT 4: Status Polling & Queue Management**!

### What You Built
- ✅ Real-time status updates (2-second polling)
- ✅ Comprehensive queue management interface
- ✅ Visual status indicators with colors and icons
- ✅ Filtering and search capabilities
- ✅ Statistics dashboard
- ✅ Document actions (view, retry, delete)

### Key Features Working
- Status updates automatically without page refresh
- Polling optimizations (pauses when tab hidden, stops when complete)
- Full CRUD operations on documents
- Responsive design for mobile and desktop
- Error handling with toast notifications

### Module Progress
- **Prompt 1:** ✅ Complete (Database & Upload API)
- **Prompt 2:** ✅ Complete (Upload UI)
- **Prompt 3:** ✅ Complete (Text Extraction)
- **Prompt 4:** ✅ Complete (Status Polling & Queue Management)
- **Prompt 5:** 🔜 Next (Metadata & Preview Features)
- **Prompt 6:** 🔜 Next (Workflow Integration & Testing)

### Ready for Production?
Almost! After completing Prompts 5 and 6, the module will be fully production-ready with:
- Metadata editing capabilities
- Content preview functionality
- Complete workflow integration
- Comprehensive end-to-end testing

---

**END OF PROMPT 4 (ALL PARTS COMPLETE)**

Proceed to Prompt 5 when ready to continue building!
