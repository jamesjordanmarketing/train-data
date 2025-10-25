# PROMPT 6 - PART 1: Visual Guide
## Document Selector & Navigation Updates

**Date:** October 10, 2025  
**Module:** Document Upload & Processing - Workflow Integration

---

## 📸 Visual Changes Overview

### Before Part 1
- Document selector shows all documents
- No way to distinguish uploaded vs seed documents
- No filter for document source
- No workflow navigation utilities

### After Part 1
- ✅ "Uploaded" badge on documents with files
- ✅ Source filter dropdown (All/Uploaded/Seed)
- ✅ Complete workflow navigation utility library
- ✅ Ready for workflow integration

---

## 🎨 UI Changes: Document Selector

### 1. Filter Bar - NEW SOURCE FILTER

**Location:** Document selector page, below search bar

```
┌─────────────────────────────────────────────────────────────┐
│ Search Documents                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search by title or summary...                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Filter by Status          Filter by Source [NEW]            │
│ ┌──────────────────┐      ┌──────────────────┐             │
│ │ All Documents ▼  │      │ All Sources   ▼  │             │
│ └──────────────────┘      └──────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

**Source Filter Options:**
- **All Sources** - Shows all documents (uploaded + seed)
- **Uploaded Only** - Shows only documents with files
- **Seed Data Only** - Shows only database seed documents

### 2. Document List Item - NEW BADGE

**Location:** In document card metadata row

```
BEFORE (Part 0):
┌─────────────────────────────────────────────────────────────┐
│ 📄 Introduction to Machine Learning                         │
│                                                               │
│    📅 2024-09-15    👤 james@example.com                    │
│                                                               │
│    This comprehensive guide covers fundamental concepts...   │
│                                                               │
│    [🟢 Completed]                    [Start Workflow →]     │
└─────────────────────────────────────────────────────────────┘

AFTER (Part 1):
┌─────────────────────────────────────────────────────────────┐
│ 📄 Introduction to Machine Learning                         │
│                                                               │
│    📅 2024-09-15    👤 james@example.com    [Uploaded]      │
│                                           ↑                   │
│    This comprehensive guide covers...    NEW BADGE          │
│                                                               │
│    [🟢 Completed]                    [Start Workflow →]     │
└─────────────────────────────────────────────────────────────┘
```

**Badge Details:**
- **Label:** "Uploaded"
- **Style:** Secondary variant (gray background)
- **Size:** Extra small (text-xs)
- **Condition:** Only shows if `document.file_path` exists
- **Position:** After date and author info

### 3. Filter Combinations

**Example 1: Show only uploaded completed documents**
```
Filter by Status: Completed
Filter by Source: Uploaded Only

Result: Shows documents that are:
✓ Status = 'completed'
✓ file_path IS NOT NULL
```

**Example 2: Show only seed documents pending categorization**
```
Filter by Status: Pending
Filter by Source: Seed Data Only

Result: Shows documents that are:
✓ Status = 'pending'
✓ file_path IS NULL
```

**Example 3: Search + filters**
```
Search: "machine learning"
Filter by Status: All
Filter by Source: Uploaded Only

Result: Shows documents that:
✓ Title or summary contains "machine learning"
✓ file_path IS NOT NULL
```

---

## 🛠️ Code Changes

### File 1: `src/lib/workflow-navigation.ts` (NEW)

**Purpose:** Utility functions for workflow navigation

```typescript
// Key Functions

getWorkflowUrl(documentId, status)
→ Returns: '/workflow/{id}/stage1'

isReadyForWorkflow(status)
→ Returns: true if status is 'completed', 'categorizing', or 'pending'

getWorkflowReadinessMessage(status)
→ Returns: User-friendly message about workflow availability

getNextActionLabel(status)
→ Returns: Button text like "Start Workflow" or "Resume Workflow"
```

**Example Usage:**
```typescript
import { getWorkflowUrl, isReadyForWorkflow } from '@/lib/workflow-navigation'

// Check if document is ready
if (isReadyForWorkflow(document.status)) {
  // Navigate to workflow
  const url = getWorkflowUrl(document.id, document.status)
  router.push(url) // → /workflow/abc-123/stage1
}
```

### File 2: `src/components/client/DocumentSelectorClient.tsx` (MODIFIED)

**Changes:**

**1. Extended Interface**
```typescript
interface DocumentWithChunkStatus extends Document {
  hasChunks?: boolean
  chunkCount?: number
  file_path?: string | null  // ← ADDED
}
```

**2. New State Variable**
```typescript
const [sourceFilter, setSourceFilter] = useState<'all' | 'uploaded' | 'seed'>('all')
```

**3. Updated Filter Logic**
```typescript
const filteredDocuments = initialData.documents.filter(doc => {
  const matchesSearch = /* ... */
  const matchesStatus = /* ... */
  
  // NEW: Apply source filter
  let matchesSource = true
  if (sourceFilter === 'uploaded') {
    matchesSource = doc.file_path !== null && doc.file_path !== undefined
  } else if (sourceFilter === 'seed') {
    matchesSource = !doc.file_path
  }
  
  return matchesSearch && matchesStatus && matchesSource
})
```

**4. New UI Element - Source Filter**
```typescript
<div className="w-full sm:w-48">
  <label className="text-sm font-medium mb-2 block">Filter by Source</label>
  <Select value={sourceFilter} onValueChange={(value: any) => setSourceFilter(value)}>
    <SelectTrigger>
      <FileText className="h-4 w-4 mr-2" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Sources</SelectItem>
      <SelectItem value="uploaded">Uploaded Only</SelectItem>
      <SelectItem value="seed">Seed Data Only</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**5. New UI Element - Badge**
```typescript
{document.file_path && (
  <Badge variant="secondary" className="text-xs">
    Uploaded
  </Badge>
)}
```

### File 3: `src/components/DocumentSelector.tsx` (MODIFIED)

**Before:** Empty file

**After:** Convenience re-exports
```typescript
export { DocumentSelectorServer as DocumentSelector } from './server/DocumentSelectorServer';
export { DocumentSelectorClient } from './client/DocumentSelectorClient';
```

**Purpose:** Makes imports cleaner for other parts of the codebase

---

## 🔄 Data Flow

### Document Fetch → Display → Filter

```
1. Database Query
   ↓
   documentService.getAll()
   SELECT * FROM documents
   (includes file_path column)

2. Server Component
   ↓
   DocumentSelectorServer
   - Fetches documents
   - Checks chunk status
   - Calculates stats
   - Passes to client

3. Client Component
   ↓
   DocumentSelectorClient
   - Receives document data
   - Applies filters:
     • Search term
     • Status filter
     • Source filter (NEW)
   - Renders UI:
     • Document cards
     • "Uploaded" badge (NEW)
     • Action buttons

4. User Interaction
   ↓
   - User changes source filter
   - Component re-filters documents
   - UI updates immediately
   - Only matching documents shown
```

---

## 🧪 Testing Scenarios

### Scenario 1: View Uploaded Documents

**Steps:**
1. Go to document selector page (`/dashboard`)
2. Click "Filter by Source" dropdown
3. Select "Uploaded Only"
4. Observe results

**Expected:**
- Only documents with "Uploaded" badge show
- Documents without badge are hidden
- Filter persists until changed

### Scenario 2: Distinguish Document Sources

**Steps:**
1. Upload a new document via `/upload`
2. Wait for processing to complete
3. Navigate to document selector
4. Locate your uploaded document

**Expected:**
- Your document appears in list
- "Uploaded" badge is visible
- Badge appears after author info
- Badge has gray/secondary styling

### Scenario 3: Combined Filtering

**Steps:**
1. Set Status filter to "Completed"
2. Set Source filter to "Uploaded Only"
3. Enter search term "report"

**Expected:**
- Only completed, uploaded documents with "report" in title/summary show
- All three filters applied simultaneously
- Empty state shown if no matches

### Scenario 4: Navigate to Workflow

**Steps:**
1. Find a completed document (uploaded or seed)
2. Click "Start Workflow" button
3. Observe navigation

**Expected:**
- Redirected to `/workflow/{document-id}/stage1`
- Workflow page loads
- Document data available in workflow

---

## 📊 Component Architecture

```
DocumentSelector (re-export)
  ↓
DocumentSelectorServer (RSC)
  ├── Fetches data from database
  ├── Checks chunk status
  ├── Calculates statistics
  └── Passes props to client
      ↓
      DocumentSelectorClient (Interactive)
        ├── State Management
        │   ├── searchTerm
        │   ├── statusFilter
        │   └── sourceFilter (NEW)
        │
        ├── Filtering Logic
        │   ├── matchesSearch
        │   ├── matchesStatus
        │   └── matchesSource (NEW)
        │
        └── UI Components
            ├── Filter Bar
            │   ├── Search Input
            │   ├── Status Dropdown
            │   └── Source Dropdown (NEW)
            │
            └── Document List
                ├── Statistics Cards
                └── Document Cards
                    ├── Title & Metadata
                    ├── "Uploaded" Badge (NEW)
                    ├── Status Badge
                    └── Action Buttons
```

---

## 🎯 Key Distinctions

### Uploaded Document
- ✅ Has `file_path` in database
- ✅ Shows "Uploaded" badge
- ✅ Was created via upload API
- ✅ Has actual file in storage
- ✅ Status progression: uploaded → processing → completed

### Seed Document
- ❌ No `file_path` (NULL)
- ❌ No "Uploaded" badge
- ❌ Created via database seed/migration
- ❌ No file in storage (content in DB only)
- ❌ Status: usually 'pending' or 'completed'

---

## 🔧 Utility Functions Reference

### `workflow-navigation.ts` Functions

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `getWorkflowStage` | `status: WorkflowStatus` | `string` | Returns stage path (e.g., 'stage1') |
| `isReadyForWorkflow` | `status: WorkflowStatus` | `boolean` | Checks if document can enter workflow |
| `getWorkflowUrl` | `documentId: string, status: WorkflowStatus` | `string` | Full workflow URL path |
| `getWorkflowReadinessMessage` | `status: WorkflowStatus` | `string` | User-friendly status message |
| `getWorkflowReadyDocuments` | `documents: T[]` | `T[]` | Filter array to workflow-ready only |
| `getNextActionLabel` | `status: WorkflowStatus` | `string` | Button text for current status |

### Usage Examples

**Example 1: Check readiness**
```typescript
import { isReadyForWorkflow } from '@/lib/workflow-navigation'

if (isReadyForWorkflow(document.status)) {
  console.log('Ready for workflow!')
} else {
  console.log('Processing not complete')
}
```

**Example 2: Get URL**
```typescript
import { getWorkflowUrl } from '@/lib/workflow-navigation'

const url = getWorkflowUrl('abc-123', 'completed')
// → '/workflow/abc-123/stage1'
router.push(url)
```

**Example 3: Bulk filter**
```typescript
import { getWorkflowReadyDocuments } from '@/lib/workflow-navigation'

const allDocs = [...] // Array of documents
const readyDocs = getWorkflowReadyDocuments(allDocs)
// → Only documents with status: completed, categorizing, or pending
```

**Example 4: Dynamic button**
```typescript
import { getNextActionLabel } from '@/lib/workflow-navigation'

const label = getNextActionLabel(document.status)
// status='completed' → 'Start Workflow'
// status='categorizing' → 'Resume Workflow'
// status='processing' → 'Processing...'
```

---

## 🚀 Integration Points for Part 2

These utilities will be used in Part 2:

1. **Upload Queue Component**
   - Add "Start Workflow" button using `getWorkflowUrl()`
   - Show readiness with `isReadyForWorkflow()`
   - Display message with `getWorkflowReadinessMessage()`

2. **Bulk Actions Component**
   - Filter eligible documents with `getWorkflowReadyDocuments()`
   - Batch navigate using `getWorkflowUrl()`
   - Show count of ready documents

3. **Document Status Badge**
   - Use `getNextActionLabel()` for action button text
   - Use `isReadyForWorkflow()` to enable/disable buttons

---

## ✅ Verification Checklist

### Visual Verification
- [ ] Document selector page loads without errors
- [ ] Source filter dropdown appears in filter bar
- [ ] Source filter has three options: All/Uploaded/Seed
- [ ] "Uploaded" badge appears on uploaded documents
- [ ] "Uploaded" badge does NOT appear on seed documents
- [ ] Badge styling is consistent with design system

### Functional Verification
- [ ] "All Sources" filter shows all documents
- [ ] "Uploaded Only" filter shows only documents with files
- [ ] "Seed Data Only" filter shows only documents without files
- [ ] Source filter works with status filter
- [ ] Source filter works with search
- [ ] Badge visibility based on file_path is correct

### Code Verification
- [ ] No TypeScript errors in modified files
- [ ] No linter warnings or errors
- [ ] All imports resolve correctly
- [ ] workflow-navigation.ts functions are properly typed
- [ ] Component props and state are properly typed

### Integration Verification
- [ ] Can import from workflow-navigation.ts
- [ ] Server component passes file_path to client
- [ ] Document interface includes file_path field
- [ ] Filtering logic works correctly

---

## 📝 Summary

**What Changed:**
1. ✅ Added workflow navigation utility library
2. ✅ Added source filter to document selector
3. ✅ Added "Uploaded" badge to document cards
4. ✅ Extended document interface with file_path
5. ✅ Created convenience re-exports

**What Stayed the Same:**
- ✨ Existing workflow system unchanged
- ✨ Database schema unchanged (already had file_path)
- ✨ Server/client component pattern unchanged
- ✨ Document fetching logic unchanged

**Ready for Part 2:**
- ✅ Workflow navigation utilities ready for use
- ✅ Document source distinction working
- ✅ Filter UI complete and functional
- ✅ All TypeScript types defined

---

**Status:** ✅ PART 1 COMPLETE

**Next:** Continue with PROMPT6_b.md (Part 2 of 3) to add workflow action buttons and bulk processing.

