# PROMPT 6 - PART 2: Visual Guide
**Workflow Integration - Actions & Bulk Processing**

---

## 🎯 What Was Added

This part added the ability to start workflows directly from the upload queue, both for individual documents and in bulk batches.

---

## 📸 Key UI Elements

### 1. Bulk Selection Bar (NEW)
```
┌─────────────────────────────────────────────────────────────┐
│  ☑ Select All (5 ready)    [2 selected]                    │
│                                                              │
│  [Clear Selection]  [Start Workflow (2)]                    │
│  ℹ️ You will be taken through each document sequentially.   │
└─────────────────────────────────────────────────────────────┘
```

**Location:** Above the filters, appears when completed documents exist  
**Features:**
- Shows count of workflow-ready documents
- Shows count of selected documents
- Select/deselect all functionality
- Clear selection button
- Start workflow button with count

---

### 2. Enhanced Table with Checkboxes
```
┌──┬───────────────┬────────┬──────────┬──────┬──────┬──────────┬─────────────┐
│☑ │ Document      │ Status │ Progress │ Type │ Size │ Uploaded │ Actions     │
├──┼───────────────┼────────┼──────────┼──────┼──────┼──────────┼─────────────┤
│☑ │ Report.pdf    │ ✓ Done │ ✓ Done   │ PDF  │ 2 MB │ 2h ago   │[Start...][⋮]│
│☑ │ Invoice.pdf   │ ✓ Done │ ✓ Done   │ PDF  │ 1 MB │ 1h ago   │[Start...][⋮]│
│  │ Draft.pdf     │ 🔄 Proc │ ▓▓▓░░ 60%│ PDF  │ 3 MB │ 30m ago  │        [⋮]  │
└──┴───────────────┴────────┴──────────┴──────┴──────┴──────────┴─────────────┘
```

**Changes:**
- ✅ New checkbox column (first column)
- ✅ Checkboxes only for completed documents
- ✅ Header checkbox for select all
- ✅ "Start Workflow" quick action button
- ✅ Dropdown menu includes workflow option

---

### 3. Actions Dropdown Menu (ENHANCED)
```
┌────────────────────────┐
│ 👁️  View Document      │
│ 📄  Start Workflow     │  ← NEW
│ 👁️  Preview Content    │
│ ✏️  Edit Metadata      │
│ 🗑️  Delete             │
└────────────────────────┘
```

**For Completed Documents:**
- "Start Workflow" appears
- Uses smart label based on status

**Label Mapping:**
- `completed` → "Start Workflow"
- `categorizing` → "Resume Workflow"
- `processing` → Disabled
- `error` → "Fix Error"

---

### 4. Batch Confirmation Dialog
```
┌─────────────────────────────────────────────────┐
│  Start Batch Workflow?                          │
│                                                 │
│  You are about to start the categorization     │
│  workflow for 3 document(s).                   │
│                                                 │
│  You will process each document one at a time. │
│  Your progress will be saved automatically as  │
│  you complete each document.                   │
│                                                 │
│              [Cancel]  [Start Batch]           │
└─────────────────────────────────────────────────┘
```

**Triggers:** When clicking "Start Workflow (N)" with selected documents  
**Purpose:** Confirm batch processing before navigation

---

## 🔄 User Flows

### Flow 1: Start Workflow for Single Document
```
1. User uploads document
   └─→ Document appears in queue with status "processing"

2. Processing completes
   └─→ Status changes to "completed"
   └─→ "Start Workflow" button appears

3. User clicks "Start Workflow"
   └─→ Navigates to /workflow/{id}/stage1
   └─→ Workflow page loads with document
```

### Flow 2: Bulk Workflow Processing
```
1. User uploads multiple documents (3 documents)
   └─→ All documents process to "completed"

2. Bulk actions bar appears
   └─→ Shows "Select All (3 ready)"

3. User selects 2 documents
   ├─→ Clicks individual checkboxes
   └─→ Badge shows "2 selected"

4. User clicks "Start Workflow (2)"
   └─→ Confirmation dialog appears
   └─→ Dialog shows "3 document(s)"

5. User confirms
   ├─→ Batch info stored in sessionStorage
   ├─→ Toast: "Batch workflow started - Processing 2 documents"
   └─→ Navigates to first document

6. sessionStorage contains:
   {
     documentIds: ["doc1-id", "doc2-id"],
     currentIndex: 0,
     total: 2
   }
```

---

## 🎨 Visual States

### State: No Documents Selected
```
┌─────────────────────────────────────────────────┐
│  ☐ Select All (5 ready)                        │
│                                                 │
│  [Start Workflow (0)]  ← DISABLED              │
└─────────────────────────────────────────────────┘
```

### State: Some Documents Selected
```
┌─────────────────────────────────────────────────┐
│  ☐ Select All (5 ready)    [3 selected]       │
│                                                 │
│  [Clear Selection]  [Start Workflow (3)]       │
│  ℹ️ Sequential processing info...               │
└─────────────────────────────────────────────────┘
```

### State: All Documents Selected
```
┌─────────────────────────────────────────────────┐
│  ☑ Select All (5 ready)    [5 selected]       │
│                                                 │
│  [Clear Selection]  [Start Workflow (5)]       │
│  ℹ️ Sequential processing info...               │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Technical Details

### Component Hierarchy
```
UploadQueue
├── BulkWorkflowActions (NEW)
│   ├── Checkbox (Select All)
│   ├── Badge (Selection Count)
│   ├── Button (Clear Selection)
│   ├── Button (Start Workflow)
│   └── AlertDialog (Confirmation)
├── UploadFilters
└── Table
    ├── TableHeader
    │   └── Checkbox Column (NEW)
    └── TableBody
        └── TableRow
            ├── Checkbox Cell (NEW)
            └── Actions Cell (ENHANCED)
                ├── Button (Start Workflow) (NEW)
                └── DropdownMenu (ENHANCED)
```

### State Management
```typescript
// Upload Queue
const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

// BulkWorkflowActions receives:
- documents: Document[]
- selectedIds: string[]
- onSelectionChange: (ids: string[]) => void
```

### Navigation Logic
```typescript
// Single document
handleStartWorkflow(doc) {
  const url = getWorkflowUrl(doc.id, doc.status);
  router.push(url);
}

// Batch processing
handleConfirmBulkWorkflow() {
  sessionStorage.setItem('workflowBatch', JSON.stringify({
    documentIds: selectedDocs.map(d => d.id),
    currentIndex: 0,
    total: selectedDocs.length
  }));
  
  const firstDoc = selectedDocs[0];
  const url = getWorkflowUrl(firstDoc.id, firstDoc.status);
  router.push(url);
}
```

---

## ✅ Testing Checklist

### Individual Workflow Action
- [ ] Upload a document
- [ ] Wait for "completed" status
- [ ] Verify "Start Workflow" button visible
- [ ] Click button
- [ ] Verify navigation to workflow
- [ ] Verify document loads in workflow

### Bulk Selection
- [ ] Upload 3+ documents
- [ ] Wait for all to complete
- [ ] Verify checkboxes appear
- [ ] Click individual checkbox
- [ ] Verify selection count updates
- [ ] Click "Select All"
- [ ] Verify all selected
- [ ] Click "Clear Selection"
- [ ] Verify all deselected

### Bulk Workflow
- [ ] Select 2+ documents
- [ ] Click "Start Workflow (N)"
- [ ] Verify dialog shows correct count
- [ ] Click "Start Batch"
- [ ] Verify toast notification
- [ ] Verify navigation to first doc
- [ ] Open DevTools → Application → Session Storage
- [ ] Verify batch info stored correctly

### Edge Cases
- [ ] Try to start workflow with 0 selections
- [ ] Verify error toast appears
- [ ] Select only non-completed documents
- [ ] Verify no checkboxes appear
- [ ] Filter to show no completed docs
- [ ] Verify bulk actions bar hidden

---

## 🎯 Key Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Start Workflow Button | ✅ | Actions column |
| Dropdown Menu Option | ✅ | Actions dropdown |
| Checkbox Selection | ✅ | First column |
| Bulk Actions Bar | ✅ | Above filters |
| Select All | ✅ | Bulk actions bar |
| Clear Selection | ✅ | Bulk actions bar |
| Confirmation Dialog | ✅ | Modal overlay |
| Batch Storage | ✅ | sessionStorage |
| Toast Notifications | ✅ | Bottom-right |

---

## 📊 Before vs After

### Before (Part 1)
```
Upload Queue
├── Filters
└── Table
    └── Actions: View, Preview, Edit, Delete
```

### After (Part 2)
```
Upload Queue
├── Bulk Actions Bar ← NEW
│   ├── Select All
│   ├── Selection Count
│   └── Start Workflow Button
├── Filters
└── Table
    ├── Checkbox Column ← NEW
    └── Actions: Start Workflow ← NEW, View, Preview, Edit, Delete
```

---

## 🚀 What's Next (Part 3)

Part 3 will focus on:
- End-to-end testing
- Documentation
- Screenshots/recordings
- User guide
- Troubleshooting guide

---

**Status:** ✅ Part 2 Complete - Ready for Testing

