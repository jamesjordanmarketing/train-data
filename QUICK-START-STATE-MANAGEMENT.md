# State Management Quick Start Guide

## Installation Complete ✅

All dependencies are installed and configured. You can start using the state management layer immediately.

## Quick Reference

### Import Paths

```typescript
// Zustand Store (Client State)
import { useConversationStore, useFilterConfig, useSelectedConversationIds } from '@/stores/conversation-store';

// React Query Hooks (Server State)
import { 
  useConversations, 
  useConversation,
  useUpdateConversation,
  useDeleteConversation,
  useBulkUpdateConversations 
} from '@/hooks/use-conversations';

// Computed State Hooks
import { 
  useFilteredConversations,
  useSelectedConversations,
  useComputedConversationStats,
  useQualityDistribution 
} from '@/hooks/use-filtered-conversations';
```

## Common Use Cases

### 1. Display Conversation List

```typescript
'use client';

import { useFilteredConversations } from '@/hooks/use-filtered-conversations';

export function ConversationList() {
  const { conversations, isLoading, error } = useFilteredConversations();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {conversations.map(conv => (
        <div key={conv.id}>{conv.title}</div>
      ))}
    </div>
  );
}
```

### 2. Update Conversation Status

```typescript
'use client';

import { useUpdateConversation } from '@/hooks/use-conversations';

export function ApproveButton({ conversationId }: { conversationId: string }) {
  const updateMutation = useUpdateConversation();
  
  const handleApprove = () => {
    updateMutation.mutate({
      id: conversationId,
      updates: { status: 'approved' }
    });
    // UI updates instantly, reverts if error
  };
  
  return (
    <button 
      onClick={handleApprove}
      disabled={updateMutation.isPending}
    >
      {updateMutation.isPending ? 'Approving...' : 'Approve'}
    </button>
  );
}
```

### 3. Manage Selections

```typescript
'use client';

import { useConversationStore, useSelectedConversationIds } from '@/stores/conversation-store';
import { useSelectedConversations } from '@/hooks/use-filtered-conversations';

export function SelectionToolbar() {
  const selectedIds = useSelectedConversationIds();
  const selectedConversations = useSelectedConversations();
  const clearSelection = useConversationStore(state => state.clearSelection);
  
  if (selectedIds.length === 0) return null;
  
  return (
    <div>
      <span>{selectedIds.length} selected</span>
      <button onClick={clearSelection}>Clear</button>
    </div>
  );
}
```

### 4. Apply Filters

```typescript
'use client';

import { useConversationStore } from '@/stores/conversation-store';
import type { ConversationStatus } from '@/lib/types/conversations';

export function StatusFilter() {
  const setFilterConfig = useConversationStore(state => state.setFilterConfig);
  
  const handleStatusChange = (status: ConversationStatus) => {
    setFilterConfig({ statuses: [status] });
    // React Query automatically refetches with new filters
  };
  
  return (
    <select onChange={e => handleStatusChange(e.target.value as ConversationStatus)}>
      <option value="">All</option>
      <option value="approved">Approved</option>
      <option value="pending_review">Pending Review</option>
      <option value="rejected">Rejected</option>
    </select>
  );
}
```

### 5. Display Statistics

```typescript
'use client';

import { useComputedConversationStats } from '@/hooks/use-filtered-conversations';

export function StatsOverview() {
  const stats = useComputedConversationStats();
  
  return (
    <div>
      <div>Total: {stats.total}</div>
      <div>Avg Quality: {stats.avgQualityScore.toFixed(2)}</div>
      <div>Approval Rate: {stats.approvalRate.toFixed(1)}%</div>
      <div>Pending: {stats.pendingReview}</div>
    </div>
  );
}
```

### 6. Delete Conversation

```typescript
'use client';

import { useDeleteConversation } from '@/hooks/use-conversations';
import { useConversationStore } from '@/stores/conversation-store';

export function DeleteButton({ conversationId }: { conversationId: string }) {
  const deleteMutation = useDeleteConversation();
  const showConfirm = useConversationStore(state => state.showConfirm);
  
  const handleDelete = () => {
    showConfirm(
      'Delete Conversation',
      'Are you sure? This cannot be undone.',
      () => deleteMutation.mutate(conversationId)
    );
  };
  
  return (
    <button onClick={handleDelete}>
      Delete
    </button>
  );
}
```

### 7. Bulk Operations

```typescript
'use client';

import { useBulkUpdateConversations } from '@/hooks/use-conversations';
import { useSelectedConversationIds, useConversationStore } from '@/stores/conversation-store';

export function BulkApproveButton() {
  const selectedIds = useSelectedConversationIds();
  const bulkUpdate = useBulkUpdateConversations();
  const clearSelection = useConversationStore(state => state.clearSelection);
  
  const handleBulkApprove = async () => {
    try {
      await bulkUpdate.mutateAsync({
        ids: selectedIds,
        updates: { status: 'approved' }
      });
      clearSelection();
    } catch (error) {
      console.error('Bulk approval failed:', error);
    }
  };
  
  return (
    <button 
      onClick={handleBulkApprove}
      disabled={selectedIds.length === 0 || bulkUpdate.isPending}
    >
      Approve All ({selectedIds.length})
    </button>
  );
}
```

### 8. Modal Management

```typescript
'use client';

import { useConversationStore } from '@/stores/conversation-store';
import { useConversation } from '@/hooks/use-conversations';

export function ConversationDetailModal() {
  const modalState = useConversationStore(state => state.modalState);
  const closeModal = useConversationStore(state => state.closeConversationDetail);
  
  const { data: conversation, isLoading } = useConversation(
    modalState.currentConversationId
  );
  
  if (!modalState.conversationDetailModalOpen) return null;
  
  return (
    <dialog open>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h2>{conversation?.title}</h2>
          <button onClick={closeModal}>Close</button>
        </div>
      )}
    </dialog>
  );
}
```

## Store Actions Cheat Sheet

### Selection Actions
```typescript
const { 
  toggleConversationSelection,  // (id: string) => void
  selectAllConversations,        // (ids: string[]) => void
  clearSelection,                // () => void
} = useConversationStore();
```

### Filter Actions
```typescript
const { 
  setFilterConfig,    // (config: Partial<FilterConfig>) => void
  resetFilters,       // () => void
} = useConversationStore();
```

### Modal Actions
```typescript
const { 
  openExportModal,
  closeExportModal,
  openBatchGenerationModal,
  closeBatchGenerationModal,
  openConversationDetail,    // (id: string) => void
  closeConversationDetail,
  showConfirm,               // (title, message, onConfirm, onCancel?) => void
  hideConfirm,
} = useConversationStore();
```

### UI Actions
```typescript
const { 
  setLoading,        // (loading: boolean, message?: string) => void
  toggleSidebar,     // () => void
  setCurrentView,    // (view: ViewType) => void
} = useConversationStore();
```

## Selector Hooks (Optimized)

Use these for better performance instead of accessing the full store:

```typescript
import { 
  useSelectedConversationIds,
  useFilterConfig,
  useModalState,
  useLoadingState,
} from '@/stores/conversation-store';

const selectedIds = useSelectedConversationIds();     // string[]
const filterConfig = useFilterConfig();               // FilterConfig
const modalState = useModalState();                   // ModalState
const { isLoading, loadingMessage } = useLoadingState();
```

## React Query Hooks

### Query Hooks
```typescript
// Fetch conversations with filters
const { data, isLoading, error, refetch } = useConversations(filterConfig);

// Fetch single conversation
const { data: conversation } = useConversation(conversationId);

// Fetch stats
const { data: stats } = useConversationStats(filterConfig);
```

### Mutation Hooks
```typescript
// Update conversation
const updateMutation = useUpdateConversation();
updateMutation.mutate({ id, updates });

// Delete conversation
const deleteMutation = useDeleteConversation();
deleteMutation.mutate(conversationId);

// Bulk update
const bulkUpdate = useBulkUpdateConversations();
bulkUpdate.mutate({ ids, updates });

// Bulk delete
const bulkDelete = useBulkDeleteConversations();
bulkDelete.mutate(ids);
```

## Computed Hooks

```typescript
// Get filtered conversations
const { conversations, isLoading, error, total } = useFilteredConversations();

// Get selected conversations (full objects)
const selectedConversations = useSelectedConversations();

// Get computed stats
const stats = useComputedConversationStats();
// { total, byStatus, byTier, avgQualityScore, totalTokens, ... }

// Get quality distribution
const distribution = useQualityDistribution();
// { excellent, good, fair, poor }

// Group conversations
const byTier = useConversationsByTier();
const byStatus = useConversationsByStatus();
const byCategory = useConversationsByCategory();

// Get filter options
const options = useConversationFilterOptions();
// { personas, emotions, categories, intents, tones }

// Check for active filters
const hasFilters = useHasActiveFilters();

// Select all helper
const { allSelected, someSelected, handleSelectAll } = useSelectAll();

// Sorted conversations
const { conversations } = useSortedConversations('qualityScore', 'desc');
```

## DevTools

### React Query DevTools
- **Location**: Bottom-right corner (dev mode only)
- **View**: Query cache, mutations, fetching status
- **Actions**: Refetch, invalidate, clear cache

### Zustand DevTools
- **Requirement**: Install Redux DevTools browser extension
- **View**: State changes, action history
- **Actions**: Time-travel debugging

## Error Handling Pattern

```typescript
const mutation = useUpdateConversation();

const handleUpdate = async () => {
  try {
    await mutation.mutateAsync({ id, updates });
    // Success - UI already updated optimistically
    toast.success('Updated successfully');
  } catch (error) {
    // Error - automatic rollback already occurred
    toast.error(`Failed: ${error.message}`);
  }
};
```

## Testing Your Integration

1. **Open React Query DevTools** (bottom-right in dev mode)
2. **Make a query** - See it appear in DevTools
3. **Update something** - Watch optimistic update + refetch
4. **Check localStorage** - See persisted filters
5. **Refresh page** - Filters should be restored
6. **Cause an error** - See automatic rollback

## Need Help?

- **Full Documentation**: `docs/state-management-architecture.md`
- **Complete Example**: `src/examples/conversation-list-example.tsx`
- **Store Source**: `src/stores/conversation-store.ts`
- **Hooks Source**: `src/hooks/use-conversations.ts`

## Common Issues

### "Query not updating"
✅ Check that filter config is included in query key  
✅ Verify cache invalidation after mutations

### "State not persisting"
✅ Check `partialize` config in store  
✅ Verify localStorage is enabled in browser

### "Component re-rendering too much"
✅ Use selector hooks instead of full store  
✅ Use `useMemo` for derived data  
✅ Check React DevTools Profiler

### "Optimistic update not working"
✅ Verify `onMutate` is canceling queries  
✅ Check query key matching  
✅ Look for errors in mutation

---

**Ready to build!** Start with the dashboard overview (Prompt 3) using these patterns.

