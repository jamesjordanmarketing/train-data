# PROMPT 6 (Part 2 of 3): Workflow Integration - Actions & Bulk Processing
**Module:** Document Upload & Processing  
**Phase:** Final Integration & Testing (Part 2)  
**Estimated Time:** 1.5-2 hours  
**Prerequisites:** PROMPT6_a.md completed (Document Selector updated, Navigation Helper created)

> **📋 CONTINUATION NOTE:** This is Part 2 of 3 of PROMPT 6. You should have completed PROMPT6_a.md which updated the document selector and created workflow navigation utilities. This part adds workflow actions to the upload queue and implements bulk processing. After completing this part, continue with PROMPT6_c.md for testing and documentation.

---

## CONTEXT CONTINUATION

In Part 1 (PROMPT6_a.md), you:
✅ Updated Document Selector to include uploaded documents with badges
✅ Created workflow navigation helper utilities in `src/lib/workflow-navigation.ts`

### Your Task in This Part (2 of 3)
1. ✅ Add "Start Workflow" action to upload queue
2. ✅ Create bulk workflow processing component
3. ✅ Integrate bulk actions into upload queue

### Success Criteria for This Part
- "Start Workflow" button available for completed documents
- Users can navigate from upload queue directly to workflow
- Bulk selection and batch processing works
- All integration points functional

---



====================



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



## PART 2 COMPLETION CHECKLIST

Verify all items below before moving to Part 3:

### Components Created & Modified
- [ ] Upload Queue updated: "Start Workflow" action added
- [ ] Bulk Workflow Actions created: `src/components/upload/bulk-workflow-actions.tsx`
- [ ] Upload Queue integrated: Checkboxes and bulk selection functional
- [ ] State management added for document selection

### Individual Workflow Actions
- [ ] "Start Workflow" button appears for completed documents
- [ ] Clicking button navigates to workflow
- [ ] Navigation goes to correct stage (stage1)
- [ ] Document content loads in workflow

### Bulk Processing Features
- [ ] Checkboxes appear for completed documents
- [ ] "Select All" checkbox works
- [ ] Individual checkbox selection works
- [ ] Selected count badge displays
- [ ] "Start Workflow (N)" button shows correct count
- [ ] Confirmation dialog appears
- [ ] Batch info stored in sessionStorage
- [ ] Navigation to first document works

### Verification Tests
- [ ] No TypeScript errors
- [ ] All imports resolve correctly
- [ ] Can select and deselect documents
- [ ] Can start workflow for single document
- [ ] Can start batch workflow for multiple documents
- [ ] Toast notifications appear appropriately

### Ready for Part 3?
- [ ] All items above are checked
- [ ] No console errors in upload queue
- [ ] Ready to perform comprehensive testing

---

> **➡️ NEXT STEPS:** Continue with PROMPT6_c.md to perform comprehensive end-to-end testing, create completion documentation, and finalize the upload module.

---

**END OF PROMPT 6 - PART 2 OF 3**
