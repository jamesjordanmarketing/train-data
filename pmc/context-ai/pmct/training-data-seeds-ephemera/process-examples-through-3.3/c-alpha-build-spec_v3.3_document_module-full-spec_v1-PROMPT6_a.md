# PROMPT 6 (Part 1 of 3): Workflow Integration - Document Selector & Navigation
**Module:** Document Upload & Processing  
**Phase:** Final Integration & Testing (Part 1)  
**Estimated Time:** 1-1.5 hours  
**Prerequisites:** Prompts 1-5 completed (All upload features functional)

> **📋 CONTINUATION NOTE:** This is Part 1 of 3 of PROMPT 6. After completing this part, continue with PROMPT6_b.md which covers workflow actions and bulk processing. This part focuses on updating the document selector and creating navigation utilities.

---

## CONTEXT FOR CODING AGENT

You are implementing the first part of the final phase of the document upload module for "Bright Run." In Prompts 1-5, you created the complete document upload system with database schema, upload API, upload UI, text extraction, queue management, metadata editing, and content preview. Now you will begin integration with the existing categorization workflow.

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

### Your Task in This Part (1 of 3)
1. ✅ Update Document Selector to include uploaded documents
2. ✅ Create workflow navigation helper utilities

### Success Criteria for This Part
- Uploaded documents appear in workflow document selector
- "Uploaded" badge distinguishes uploaded from seed documents
- Workflow navigation utilities created and functional
- All TypeScript types compile correctly

---


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


## PART 1 COMPLETION CHECKLIST

Verify all items below before moving to Part 2:

### Components Created & Modified
- [ ] Document Selector updated: Includes uploaded documents
- [ ] "Uploaded" badge added to document list items
- [ ] Source filter (All/Uploaded/Seed) added
- [ ] Workflow Navigation Helper created: `src/lib/workflow-navigation.ts`

### Verification Tests
- [ ] Uploaded documents appear in document selector
- [ ] "Uploaded" badge displays correctly
- [ ] Filter works to show only uploaded documents
- [ ] Filter works to show only seed documents
- [ ] workflow-navigation.ts compiles without errors
- [ ] All imports resolve correctly
- [ ] No TypeScript errors in modified files

### Ready for Part 2?
- [ ] All items above are checked
- [ ] No console errors when viewing document selector
- [ ] Ready to implement workflow actions

---

**END OF PROMPT 6 - PART 1 OF 3**
