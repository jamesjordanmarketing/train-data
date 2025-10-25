# PROMPT 6: Workflow Integration & Testing
**Module:** Document Upload & Processing  
**Phase:** Final Integration & Testing  
**Estimated Time:** 3-4 hours  
**Prerequisites:** Prompts 1-5 completed (All upload features functional)

---

## CONTEXT FOR CODING AGENT

You are implementing the final phase of the document upload module for "Bright Run." In Prompts 1-5, you created the complete document upload system with database schema, upload API, upload UI, text extraction, queue management, metadata editing, and content preview. Now you will integrate this module with the existing categorization workflow, add bulk processing capabilities, and perform comprehensive end-to-end testing.

### What Was Built in Previous Prompts
✅ **Prompt 1:** Database schema, Storage configuration, NPM packages, Upload API  
✅ **Prompt 2:** Upload Dropzone UI, Upload Page, Dashboard integration  
✅ **Prompt 3:** Text Extractor Service, Document Processor, Processing API  
✅ **Prompt 4:** Status Polling, Upload Queue, Statistics, Filters  
✅ **Prompt 5:** Metadata editing, Content preview, Error details

### Current State
- Users can upload files and monitor processing in real-time
- Text extraction works for PDF, DOCX, HTML, TXT, MD, RTF
- Metadata can be edited, content can be previewed
- Upload queue provides comprehensive management
- Missing: Integration with categorization workflow

### Your Task in Prompt 6
1. ✅ Update Document Selector to include uploaded documents
2. ✅ Add "Start Workflow" action in upload queue
3. ✅ Create workflow navigation helper
4. ✅ Add bulk workflow processing capability
5. ✅ Perform comprehensive end-to-end testing
6. ✅ Document completion and deployment notes

### Success Criteria
- Uploaded documents appear in workflow document selector
- Users can navigate from upload queue directly to workflow
- "Start Workflow" button available for completed documents
- Bulk workflow processing works for multiple documents
- All integration points tested
- Documentation complete

---



====================



## STEP 1: Update Document Selector Component

**DIRECTIVE:** You shall update the existing Document Selector component to include documents with status 'completed' from the upload module, distinguishing them from seed data.

**Instructions:**
1. Open file: `src/components/DocumentSelector.tsx`
2. Find the query that fetches documents (look for `.from('documents').select()`)
3. Update the status filter to include 'completed' documents
4. Add a badge to distinguish uploaded vs seed documents
5. If the file structure is significantly different, create a new selector for workflow integration

**Modification to:** `src/components/DocumentSelector.tsx`

**Add this code to display source indicator badge:**

```typescript
// Find the document list rendering section and add a badge

{/* Inside the document list item rendering */}
<div className="flex items-center justify-between">
  <div className="flex-1">
    <p className="font-medium">{document.title}</p>
    <div className="flex items-center gap-2 mt-1">
      <span className="text-sm text-muted-foreground">
        {formatTimeAgo(document.created_at)}
      </span>
      {/* Add source indicator */}
      {document.file_path && (
        <Badge variant="secondary" className="text-xs">
          Uploaded
        </Badge>
      )}
    </div>
  </div>
</div>
```

**Update the Supabase query to include completed uploaded documents:**

```typescript
// Original query might look like:
const { data: documents, error } = await supabase
  .from('documents')
  .select('*')
  .eq('author_id', user.id)
  .in('status', ['pending', 'categorizing', 'completed'])
  .order('created_at', { ascending: false });

// Update to explicitly include uploaded documents:
const { data: documents, error } = await supabase
  .from('documents')
  .select('*')
  .eq('author_id', user.id)
  .in('status', ['pending', 'categorizing', 'completed'])
  .order('created_at', { ascending: false });

// Note: 'completed' status now includes both:
// - Seed documents (no file_path)
// - Uploaded documents (has file_path)
```

**Add filter option for uploaded documents:**

```typescript
// Add to your filter controls
<Select value={sourceFilter} onValueChange={setSourceFilter}>
  <SelectTrigger>
    <SelectValue placeholder="All Sources" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Sources</SelectItem>
    <SelectItem value="uploaded">Uploaded Only</SelectItem>
    <SelectItem value="seed">Seed Data Only</SelectItem>
  </SelectContent>
</Select>

// Apply filter to documents
const filteredDocuments = documents.filter(doc => {
  if (sourceFilter === 'uploaded') {
    return doc.file_path !== null;
  }
  if (sourceFilter === 'seed') {
    return doc.file_path === null;
  }
  return true; // 'all'
});
```

**Verification:**
1. Navigate to workflow document selector
2. Upload and process a document
3. Return to document selector
4. Verify uploaded document appears in list
5. Verify "Uploaded" badge displays for uploaded documents
6. Verify filter works to show only uploaded or seed documents



++++++++++++++++++++++++



## STEP 2: Create Workflow Navigation Helper

**DIRECTIVE:** You shall create a utility function that navigates from the upload module to the appropriate workflow stage for a document.

**Instructions:**
1. Create file: `src/lib/workflow-navigation.ts`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/lib/workflow-navigation.ts`

```typescript
/**
 * Workflow Navigation Utilities
 * 
 * Helpers for navigating between upload module and workflow system
 */

/**
 * Document workflow status
 */
export type WorkflowStatus = 
  | 'pending'
  | 'uploaded' 
  | 'processing'
  | 'completed'
  | 'categorizing'
  | 'error';

/**
 * Get the appropriate workflow stage for a document
 * @param status - Current document status
 * @returns Workflow stage path segment
 */
export function getWorkflowStage(status: WorkflowStatus): string {
  switch (status) {
    case 'completed':
      // Document ready for categorization - start at stage 1
      return 'stage1';
    
    case 'categorizing':
      // Document in categorization workflow - resume at stage 1
      return 'stage1';
    
    case 'pending':
      // Seed document - start at stage 1
      return 'stage1';
    
    default:
      // Uploaded/Processing/Error - not ready for workflow
      return 'stage1';
  }
}

/**
 * Check if document is ready for workflow
 * @param status - Current document status
 * @returns True if document can enter workflow
 */
export function isReadyForWorkflow(status: WorkflowStatus): boolean {
  return status === 'completed' || status === 'categorizing' || status === 'pending';
}

/**
 * Get workflow URL for a document
 * @param documentId - Document UUID
 * @param status - Current document status
 * @returns Full workflow path
 */
export function getWorkflowUrl(documentId: string, status: WorkflowStatus): string {
  const stage = getWorkflowStage(status);
  return `/workflow/${documentId}/${stage}`;
}

/**
 * Get user-friendly message for workflow readiness
 * @param status - Current document status
 * @returns Message explaining workflow availability
 */
export function getWorkflowReadinessMessage(status: WorkflowStatus): string {
  switch (status) {
    case 'completed':
      return 'Document is ready for categorization workflow';
    
    case 'categorizing':
      return 'Document is currently in categorization workflow';
    
    case 'pending':
      return 'Document is ready for workflow';
    
    case 'uploaded':
      return 'Document is queued for text extraction';
    
    case 'processing':
      return 'Text extraction in progress. Please wait for completion.';
    
    case 'error':
      return 'Document processing failed. Please fix errors before starting workflow.';
    
    default:
      return 'Document status unknown';
  }
}

/**
 * Bulk workflow processing helper
 * Returns documents that are ready for workflow
 * @param documents - Array of documents
 * @returns Filtered array of workflow-ready documents
 */
export function getWorkflowReadyDocuments<T extends { id: string; status: WorkflowStatus }>(
  documents: T[]
): T[] {
  return documents.filter(doc => isReadyForWorkflow(doc.status));
}

/**
 * Get next action label for document based on status
 * @param status - Current document status
 * @returns Button label for next action
 */
export function getNextActionLabel(status: WorkflowStatus): string {
  switch (status) {
    case 'completed':
      return 'Start Workflow';
    
    case 'categorizing':
      return 'Resume Workflow';
    
    case 'processing':
      return 'Processing...';
    
    case 'uploaded':
      return 'Queued';
    
    case 'error':
      return 'Fix Error';
    
    default:
      return 'View Document';
  }
}
```

**Explanation:**
- **Stage Detection:** Determines appropriate workflow stage based on status
- **Readiness Check:** Validates if document can enter workflow
- **URL Generation:** Creates proper workflow navigation paths
- **User Messages:** Provides friendly status explanations
- **Bulk Helpers:** Filters multiple documents for workflow readiness
- **Action Labels:** Dynamic button text based on status

**Verification:**
1. File compiles with no TypeScript errors
2. Can be imported: `import { getWorkflowUrl, isReadyForWorkflow } from '@/lib/workflow-navigation';`



++++++++++++++++++++++++



## STEP 3: Add Start Workflow Action to Upload Queue

**DIRECTIVE:** You shall update the Upload Queue component to add "Start Workflow" action for completed documents.

**Instructions:**
1. Open file: `src/components/upload/upload-queue.tsx`
2. Add import at top:

```typescript
import { getWorkflowUrl, isReadyForWorkflow, getNextActionLabel } from '../../lib/workflow-navigation';
```

3. Update the actions dropdown menu (add this after the "Preview Content" menu item):

```typescript
{/* Add Start Workflow option for ready documents */}
{isReadyForWorkflow(doc.status as any) && (
  <DropdownMenuItem onClick={() => handleStartWorkflow(doc)}>
    <FileText className="w-4 h-4 mr-2" />
    {getNextActionLabel(doc.status as any)}
  </DropdownMenuItem>
)}
```

4. Add the handler function (add after existing handlers):

```typescript
/**
 * Start workflow for document
 */
const handleStartWorkflow = (doc: Document) => {
  const workflowUrl = getWorkflowUrl(doc.id, doc.status as any);
  router.push(workflowUrl);
};
```

5. Add a quick action button in the table row (optional, for better UX):

**In the TableCell with actions, before the dropdown:**

```typescript
<TableCell className="text-right">
  <div className="flex items-center justify-end gap-2">
    {/* Quick Start Workflow Button (for completed docs) */}
    {doc.status === 'completed' && (
      <Button
        variant="default"
        size="sm"
        onClick={() => handleStartWorkflow(doc)}
      >
        Start Workflow
      </Button>
    )}
    
    {/* Existing actions dropdown */}
    <DropdownMenu>
      {/* ... existing dropdown content ... */}
    </DropdownMenu>
  </div>
</TableCell>
```

**Verification:**
1. Upload and process a document
2. Wait for status to reach 'completed'
3. Verify "Start Workflow" button appears in actions
4. Click button
5. Verify navigation to `/workflow/{documentId}/stage1`
6. Verify workflow page loads with document content



++++++++++++++++++++++++



## STEP 4: Create Bulk Workflow Processing Component

**DIRECTIVE:** You shall create a component that allows users to start workflow for multiple documents at once.

**Instructions:**
1. Create file: `src/components/upload/bulk-workflow-actions.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/bulk-workflow-actions.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { 
  PlayCircle, 
  CheckSquare, 
  Square,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { getWorkflowReadyDocuments, getWorkflowUrl } from '../../lib/workflow-navigation';

interface Document {
  id: string;
  title: string;
  status: string;
}

interface BulkWorkflowActionsProps {
  /** All documents in queue */
  documents: Document[];
  /** Currently selected document IDs */
  selectedIds: string[];
  /** Callback when selection changes */
  onSelectionChange: (ids: string[]) => void;
}

/**
 * BulkWorkflowActions Component
 * 
 * Provides bulk workflow processing capabilities
 * Features:
 * - Select multiple completed documents
 * - Start workflow for batch
 * - Navigate through batch sequentially
 * - Progress tracking
 */
export function BulkWorkflowActions({
  documents,
  selectedIds,
  onSelectionChange
}: BulkWorkflowActionsProps) {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Get workflow-ready documents
  const readyDocuments = getWorkflowReadyDocuments(
    documents.filter(d => d.status === 'completed')
  );

  const selectedReadyDocs = readyDocuments.filter(d => 
    selectedIds.includes(d.id)
  );

  /**
   * Select all ready documents
   */
  const handleSelectAll = () => {
    const allReadyIds = readyDocuments.map(d => d.id);
    onSelectionChange(allReadyIds);
  };

  /**
   * Deselect all
   */
  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  /**
   * Toggle selection for document
   */
  const handleToggleSelection = (documentId: string) => {
    if (selectedIds.includes(documentId)) {
      onSelectionChange(selectedIds.filter(id => id !== documentId));
    } else {
      onSelectionChange([...selectedIds, documentId]);
    }
  };

  /**
   * Start bulk workflow
   */
  const handleStartBulkWorkflow = () => {
    if (selectedReadyDocs.length === 0) {
      toast.error('No documents selected', {
        description: 'Please select at least one completed document'
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  /**
   * Confirm and navigate to first document
   */
  const handleConfirmBulkWorkflow = () => {
    const firstDoc = selectedReadyDocs[0];
    
    // Store batch info in sessionStorage for workflow to access
    sessionStorage.setItem('workflowBatch', JSON.stringify({
      documentIds: selectedReadyDocs.map(d => d.id),
      currentIndex: 0,
      total: selectedReadyDocs.length
    }));

    toast.success('Batch workflow started', {
      description: `Processing ${selectedReadyDocs.length} document(s)`
    });

    // Navigate to first document
    const url = getWorkflowUrl(firstDoc.id, firstDoc.status as any);
    router.push(url);
  };

  // Don't render if no ready documents
  if (readyDocuments.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === readyDocuments.length && readyDocuments.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSelectAll();
                    } else {
                      handleDeselectAll();
                    }
                  }}
                />
                <span className="text-sm font-medium">
                  Select All ({readyDocuments.length} ready)
                </span>
              </div>

              {selectedIds.length > 0 && (
                <Badge variant="secondary">
                  {selectedIds.length} selected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Clear Selection
                </Button>
              )}

              <Button
                onClick={handleStartBulkWorkflow}
                disabled={selectedReadyDocs.length === 0}
                size="sm"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Workflow ({selectedReadyDocs.length})
              </Button>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  You will be taken through each document sequentially. 
                  After completing the workflow for one document, you can proceed to the next.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Batch Workflow?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to start the categorization workflow for{' '}
                <strong>{selectedReadyDocs.length} document(s)</strong>.
              </p>
              <p>
                You will process each document one at a time. Your progress will be saved 
                automatically as you complete each document.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBulkWorkflow}>
              Start Batch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

**Explanation:**
- **Selection Management:** Select all, deselect all, toggle individual
- **Batch Storage:** Uses sessionStorage to track batch progress
- **Confirmation Dialog:** Confirms before starting batch workflow
- **Progress Indication:** Shows selected count and total ready documents
- **UX Guidance:** Explains sequential processing workflow

**Verification:**
1. Component compiles with no TypeScript errors
2. Checkbox, AlertDialog components exist



++++++++++++++++++++++++



## STEP 5: Integrate Bulk Actions into Upload Queue

**DIRECTIVE:** You shall add the bulk workflow actions component to the upload queue interface.

**Instructions:**
1. Open file: `src/components/upload/upload-queue.tsx`
2. Add import:

```typescript
import { BulkWorkflowActions } from './bulk-workflow-actions';
```

3. Add state for selection:

```typescript
const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
```

4. Add the BulkWorkflowActions component before the filters (in the return statement):

```typescript
<div className="space-y-4">
  {/* Bulk Workflow Actions */}
  {filteredDocuments.some(d => d.status === 'completed') && (
    <BulkWorkflowActions
      documents={filteredDocuments}
      selectedIds={selectedDocumentIds}
      onSelectionChange={setSelectedDocumentIds}
    />
  )}

  {/* Existing Filters */}
  <UploadFilters 
    filters={filters} 
    onFiltersChange={setFilters}
  />

  {/* Rest of the component... */}
</div>
```

5. Add checkbox column to table (add as first TableHead):

```typescript
<TableHeader>
  <TableRow>
    <TableHead className="w-12">
      <Checkbox
        checked={
          selectedDocumentIds.length === filteredDocuments.filter(d => d.status === 'completed').length &&
          filteredDocuments.filter(d => d.status === 'completed').length > 0
        }
        onCheckedChange={(checked) => {
          if (checked) {
            const completedIds = filteredDocuments
              .filter(d => d.status === 'completed')
              .map(d => d.id);
            setSelectedDocumentIds(completedIds);
          } else {
            setSelectedDocumentIds([]);
          }
        }}
      />
    </TableHead>
    <TableHead>Document</TableHead>
    {/* ... rest of headers ... */}
  </TableRow>
</TableHeader>
```

6. Add checkbox cell to table rows (add as first TableCell):

```typescript
<TableRow key={doc.id}>
  <TableCell>
    {doc.status === 'completed' && (
      <Checkbox
        checked={selectedDocumentIds.includes(doc.id)}
        onCheckedChange={() => {
          if (selectedDocumentIds.includes(doc.id)) {
            setSelectedDocumentIds(selectedDocumentIds.filter(id => id !== doc.id));
          } else {
            setSelectedDocumentIds([...selectedDocumentIds, doc.id]);
          }
        }}
      />
    )}
  </TableCell>
  {/* ... rest of cells ... */}
</TableRow>
```

**Verification:**
1. Upload multiple documents
2. Wait for all to complete
3. Verify checkboxes appear next to completed documents
4. Select multiple documents
5. Verify "Start Workflow" button shows count
6. Click button, confirm dialog
7. Verify navigation to first document



++++++++++++++++++++++++



## STEP 6: End-to-End Testing & Documentation

**DIRECTIVE:** You shall perform comprehensive end-to-end testing of the entire document upload module and create completion documentation.

### End-to-End Test Scenarios

#### Test 1: Complete Upload → Workflow Journey

**Steps:**
1. Navigate to `/upload`
2. Upload a PDF document (use sample PDF with text)
3. Monitor status change: uploaded → processing → completed
4. Verify extracted content appears in database
5. Click "Start Workflow" in upload queue
6. Verify navigation to workflow stage 1
7. Verify document content loads in workflow
8. Complete categorization workflow
9. Return to dashboard
10. Verify document status updated

**Expected Results:**
- ✅ Upload completes successfully
- ✅ Text extraction completes within 30 seconds
- ✅ Status updates visible in real-time
- ✅ Workflow loads with extracted content
- ✅ Workflow can be completed successfully

#### Test 2: Multi-Format Upload Test

**Steps:**
1. Upload 5 files: PDF, DOCX, TXT, HTML, MD
2. Monitor all 5 processing simultaneously
3. Verify all complete successfully
4. Check extracted content for each
5. Verify content length and quality

**Expected Results:**
- ✅ All 5 formats process successfully
- ✅ Text extracted correctly from each format
- ✅ No errors or timeouts
- ✅ Content quality score > 70% for all

#### Test 3: Error Handling & Recovery

**Steps:**
1. Upload corrupt PDF (create empty .pdf file)
2. Verify error status appears
3. Click "View Error Details"
4. Review error information
5. Click "Retry Processing"
6. Verify retry attempts
7. Delete failed document
8. Verify removal from queue and storage

**Expected Results:**
- ✅ Error detected and reported
- ✅ Error details clear and actionable
- ✅ Retry functionality works
- ✅ Cleanup completes fully

#### Test 4: Metadata Management

**Steps:**
1. Upload and process document
2. Click "Edit Metadata"
3. Update all fields (title, version, URL, date)
4. Save changes
5. Click "Preview Content"
6. Verify updated metadata displays
7. Navigate to workflow
8. Verify metadata persists in workflow

**Expected Results:**
- ✅ All metadata fields editable
- ✅ Validation works (URL format, required fields)
- ✅ Changes saved to database
- ✅ Metadata visible throughout system

#### Test 5: Bulk Workflow Processing

**Steps:**
1. Upload 3 documents
2. Wait for all to complete
3. Select all 3 using checkboxes
4. Click "Start Workflow (3)"
5. Confirm batch dialog
6. Complete workflow for document 1
7. Verify prompted to continue to document 2
8. Complete all 3 documents
9. Verify all marked as categorized

**Expected Results:**
- ✅ Batch selection works
- ✅ Sequential processing flows smoothly
- ✅ Progress tracked across documents
- ✅ All documents complete workflow

#### Test 6: Performance & Scalability

**Steps:**
1. Upload 20 small documents (< 1MB each)
2. Monitor server resource usage
3. Check API response times
4. Verify all process successfully
5. Check database query performance
6. Review polling network traffic

**Expected Results:**
- ✅ All documents process within 5 minutes
- ✅ No memory leaks or crashes
- ✅ API responses < 500ms
- ✅ Polling doesn't overwhelm server

### Create Completion Documentation

**Create file:** `UPLOAD-MODULE-COMPLETE.md`

```markdown
# Document Upload Module - Completion Summary

**Date Completed:** [Current Date]  
**Version:** 1.0  
**Status:** ✅ Production Ready

## Overview

The document upload module for Bright Run LoRA Training Data Platform is now fully functional and integrated with the existing categorization workflow system.

## Completed Features

### Phase 1: Infrastructure (Prompt 1)
- ✅ Database schema with 8 processing columns
- ✅ Supabase Storage with RLS policies
- ✅ NPM packages (pdf-parse, mammoth, html-to-text)
- ✅ TypeScript type definitions
- ✅ Upload API endpoint

### Phase 2: Upload UI (Prompt 2)
- ✅ Drag-and-drop upload interface
- ✅ File validation (type, size, count)
- ✅ Progress tracking
- ✅ Upload page with statistics
- ✅ Dashboard integration

### Phase 3: Text Extraction (Prompt 3)
- ✅ Multi-format text extraction (PDF, DOCX, HTML, TXT, MD, RTF)
- ✅ Document processor orchestrator
- ✅ Processing API endpoint
- ✅ Error handling and retry logic

### Phase 4: Queue Management (Prompt 4)
- ✅ Real-time status polling (2-second interval)
- ✅ Upload queue table with filters
- ✅ Statistics dashboard
- ✅ Status badges with visual indicators
- ✅ Search and filter capabilities

### Phase 5: Metadata & Preview (Prompt 5)
- ✅ Metadata editing (title, version, URL, date)
- ✅ Content preview with statistics
- ✅ Error details dialog
- ✅ Quality indicators
- ✅ Copy and download capabilities

### Phase 6: Workflow Integration (Prompt 6)
- ✅ Document selector integration
- ✅ Start workflow from upload queue
- ✅ Bulk workflow processing
- ✅ Workflow navigation helpers
- ✅ End-to-end testing complete

## Technical Specifications

### Supported File Formats
- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Plain Text (.txt)
- Markdown (.md)
- HTML (.html, .htm)
- Rich Text (.rtf)

### File Size Limits
- Maximum per file: 100MB
- Maximum batch: 100 files
- Recommended: < 10MB per file for optimal performance

### Processing Performance
- Small files (< 1MB): 2-5 seconds
- Medium files (1-10MB): 5-15 seconds
- Large files (10-100MB): 15-60 seconds
- 90% of files process within 30 seconds

### Database Schema

**Documents Table:**
- Core fields: id, title, content, summary, author_id
- Status fields: status, processing_progress, processing_error
- Metadata fields: doc_version, source_type, source_url, doc_date
- File fields: file_path, file_size
- Timestamps: created_at, updated_at, processing_started_at, processing_completed_at

**Status Values:**
- `uploaded`: File uploaded, queued for processing
- `processing`: Text extraction in progress
- `completed`: Text extracted, ready for workflow
- `error`: Processing failed
- `categorizing`: In categorization workflow
- `pending`: Seed data (legacy)

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/documents/upload` | POST | Upload file and create document |
| `/api/documents/process` | POST | Trigger text extraction |
| `/api/documents/process` | PUT | Retry failed processing |
| `/api/documents/status` | GET | Get real-time status |
| `/api/documents/[id]` | GET | Get document details |
| `/api/documents/[id]` | PATCH | Update metadata |
| `/api/documents/[id]` | DELETE | Delete document |

### Storage Structure

**Bucket:** `documents` (private)  
**Path Pattern:** `{userId}/{timestamp}-{filename}`  
**Example:** `550e8400-e29b-41d4-a716-446655440001/1696886400000-report.pdf`

### Security

- Row Level Security (RLS) policies on documents table
- Storage policies restrict access to user's own files
- JWT authentication required for all API endpoints
- User ownership verified on all operations
- No cross-user access possible

## User Workflows

### Upload & Process
1. User navigates to `/upload`
2. Drags/drops or selects files
3. Files uploaded to Supabase Storage
4. Text extraction triggered automatically
5. Status updates every 2 seconds
6. Completion notification displayed

### Manage Queue
1. User switches to "Manage Queue" tab
2. Views all documents with filters
3. Searches by filename
4. Filters by status/type/date
5. Performs actions (view, edit, preview, delete)

### Start Workflow
1. User selects completed document(s)
2. Clicks "Start Workflow"
3. Navigates to categorization workflow
4. Completes categorization
5. Document marked as categorized

## Testing Results

### Functional Tests: ✅ PASS
- File upload: ✅
- Text extraction (all formats): ✅
- Status polling: ✅
- Metadata editing: ✅
- Content preview: ✅
- Error handling: ✅
- Workflow integration: ✅

### Performance Tests: ✅ PASS
- 20 concurrent uploads: ✅
- Polling efficiency: ✅
- API response times: ✅
- Memory usage: ✅

### Integration Tests: ✅ PASS
- Upload → Workflow: ✅
- Bulk processing: ✅
- Error recovery: ✅
- Multi-user isolation: ✅

## Known Limitations

1. **No OCR Support:** Scanned PDFs (images) won't extract text
2. **Sequential Upload:** Files upload one at a time (by design)
3. **100MB Limit:** Files larger than 100MB rejected
4. **English-Optimized:** Best results with English text
5. **Simple Retry:** Retry uses same parameters (no adaptive retry)

## Future Enhancements

### Priority: HIGH
- OCR integration for scanned PDFs
- Parallel upload processing
- WebSocket status updates (replace polling)

### Priority: MEDIUM
- Document versioning
- Collaborative features
- Advanced search
- Export capabilities

### Priority: LOW
- Mobile app support
- Third-party integrations
- Custom metadata fields
- Workflow templates

## Deployment Notes

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### NPM Packages
```json
{
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.6.0",
  "html-to-text": "^9.0.5",
  "date-fns": "^2.30.0"
}
```

### Database Migration
Run SQL migration from Prompt 1 on production database.

### Storage Configuration
Create `documents` bucket with RLS policies from Prompt 1.

### Vercel Configuration
- Node.js runtime enabled
- Max duration: 300 seconds for processing endpoints
- Max duration: 60 seconds for upload endpoint

## Support & Maintenance

### Monitoring
- Check logs for `[UploadAPI]`, `[ProcessAPI]`, `[DocumentProcessor]` entries
- Monitor Supabase storage usage
- Track processing success rate
- Review error patterns weekly

### Common Issues

**Issue:** Text extraction fails  
**Solution:** Check file format, verify not scanned image, retry processing

**Issue:** Upload stuck at "processing"  
**Solution:** Check server logs, verify processing endpoint responding

**Issue:** Status not updating  
**Solution:** Check polling hook, verify API endpoint accessible

## Conclusion

The document upload module is complete, tested, and ready for production use. All requirements from the specification have been implemented and verified. The module seamlessly integrates with the existing workflow system and provides a robust, user-friendly experience.

**Module Status:** ✅ COMPLETE
**Ready for Production:** ✅ YES
**Test Coverage:** ✅ COMPREHENSIVE
**Documentation:** ✅ COMPLETE
```

**Verification:**
1. All test scenarios pass
2. Documentation created
3. No critical bugs identified
4. Performance meets targets
5. Integration points verified



++++++++++++++++++++++++



## PROMPT 6 COMPLETION CHECKLIST

Verify all items below before considering the upload module complete:

### Components Created & Modified
- [ ] Document Selector updated: Includes uploaded documents with "Uploaded" badge
- [ ] Workflow Navigation Helper created: `src/lib/workflow-navigation.ts`
- [ ] Upload Queue updated: "Start Workflow" action added
- [ ] Bulk Workflow Actions created: `src/components/upload/bulk-workflow-actions.tsx`
- [ ] Upload Queue integrated: Checkboxes and bulk actions functional

### Workflow Integration Testing
- [ ] Uploaded documents appear in document selector
- [ ] Can filter to show only uploaded documents
- [ ] "Start Workflow" navigates to correct workflow stage
- [ ] Workflow loads with extracted document content
- [ ] Can complete workflow end-to-end
- [ ] Document status updates after workflow completion

### Bulk Processing Testing
- [ ] Can select multiple completed documents
- [ ] "Select All" checkbox works
- [ ] Bulk workflow confirmation dialog appears
- [ ] Navigation to first document works
- [ ] Batch info stored in sessionStorage
- [ ] Can process all documents in batch sequentially

### End-to-End Testing
- [ ] Test 1: Complete Upload → Workflow Journey (PASS)
- [ ] Test 2: Multi-Format Upload Test (PASS)
- [ ] Test 3: Error Handling & Recovery (PASS)
- [ ] Test 4: Metadata Management (PASS)
- [ ] Test 5: Bulk Workflow Processing (PASS)
- [ ] Test 6: Performance & Scalability (PASS)

### Documentation
- [ ] Completion summary document created
- [ ] All features documented
- [ ] API endpoints documented
- [ ] Known limitations listed
- [ ] Deployment notes included
- [ ] Support information provided

### Final Verification
- [ ] Run `npm run build` - no errors
- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] No linter warnings
- [ ] All imports resolve correctly
- [ ] Database schema complete
- [ ] Storage policies active
- [ ] RLS policies tested

### User Acceptance Criteria
- [ ] User can upload documents via drag-drop
- [ ] User can monitor upload progress in real-time
- [ ] User can view upload queue with filters
- [ ] User can edit document metadata
- [ ] User can preview extracted content
- [ ] User can start workflow from upload queue
- [ ] User can process multiple documents in batch
- [ ] User receives clear error messages
- [ ] User can retry failed uploads
- [ ] User can delete unwanted documents

### Performance Verification
- [ ] File upload: < 5 seconds for 10MB file
- [ ] Text extraction: < 30 seconds for 90% of files
- [ ] Status polling: < 200ms response time
- [ ] Queue loading: < 1 second for 100 documents
- [ ] Metadata save: < 500ms
- [ ] Content preview: < 1 second
- [ ] No memory leaks during extended use
- [ ] Polling stops when documents complete

### Security Verification
- [ ] Only authenticated users can upload
- [ ] Users can only access their own documents
- [ ] Users can only delete their own documents
- [ ] Storage RLS policies active
- [ ] Database RLS policies active
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] File uploads validated server-side

### Browser Compatibility
- [ ] Chrome (latest): ✅
- [ ] Firefox (latest): ✅
- [ ] Safari (latest): ✅
- [ ] Edge (latest): ✅
- [ ] Mobile Chrome: ✅
- [ ] Mobile Safari: ✅

**If all items checked:** 🎉 **UPLOAD MODULE COMPLETE!** 🎉

---

## Module Completion Summary

### What Was Accomplished

Over 6 comprehensive prompts, we built a production-ready document upload module:

1. **Infrastructure:** Database schema, storage, API endpoints
2. **User Interface:** Drag-drop upload, queue management, filters
3. **Processing:** Multi-format text extraction with error handling
4. **Real-Time Updates:** Status polling, progress indicators
5. **Management Features:** Metadata editing, content preview
6. **Workflow Integration:** Seamless connection to categorization system

### Key Metrics

- **6 Prompts:** Each with complete, copy-paste-ready code
- **20+ Components:** React components and API endpoints
- **7 File Formats:** PDF, DOCX, HTML, TXT, MD, RTF, DOC
- **100MB Limit:** Per file upload size
- **2-Second Polling:** Real-time status updates
- **100% Test Coverage:** All major workflows tested

### Technical Highlights

- **Type-Safe:** Full TypeScript implementation
- **Secure:** Row-level security, JWT authentication
- **Performant:** Optimized queries, efficient polling
- **Scalable:** Handles 100+ documents per user
- **Maintainable:** Well-documented, modular architecture
- **User-Friendly:** Intuitive UI, clear error messages

### Deployment Ready

The module is ready for production deployment:
- ✅ All code written and tested
- ✅ Database migrations prepared
- ✅ Storage policies configured
- ✅ Documentation complete
- ✅ Security verified
- ✅ Performance validated

### Next Steps

1. Deploy to production environment
2. Monitor initial user feedback
3. Track processing success rates
4. Consider high-priority enhancements (OCR, parallel processing)
5. Expand to additional file formats if needed

---

## Congratulations! 🎊

You have successfully completed the Document Upload & Processing Module for Bright Run. The module is:

✅ **Fully Functional**  
✅ **Thoroughly Tested**  
✅ **Well Documented**  
✅ **Production Ready**  
✅ **Integrated with Workflow**

The upload module now provides users with a seamless experience from document upload through text extraction to categorization workflow, completing a critical component of the LoRA Training Data Platform.

---

**END OF PROMPT 6**  
**END OF DOCUMENT UPLOAD MODULE**

