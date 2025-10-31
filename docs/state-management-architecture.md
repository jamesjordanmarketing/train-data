# State Management Architecture

## Overview

This application uses a hybrid state management approach that separates **server state** from **client state** for optimal performance, developer experience, and user experience.

## Architecture Principles

### 1. Separation of Concerns

- **Server State** (React Query): API data, caching, synchronization
- **Client State** (Zustand): UI state, selections, modals, filters

### 2. Single Source of Truth

- Server state is managed by React Query's cache
- Client state is managed by Zustand stores
- No duplication between the two

### 3. Optimistic Updates

- Mutations update the UI immediately
- Automatic rollback on errors
- Cache invalidation ensures consistency

## State Management Layers

```
┌─────────────────────────────────────────┐
│          React Components               │
│  (Dashboard, ConversationList, etc.)    │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌───────────┐     ┌──────────────┐
│  Zustand  │     │ React Query  │
│  Stores   │     │    Hooks     │
└───────────┘     └──────────────┘
    │                   │
    │                   ▼
    │            ┌──────────────┐
    │            │ Query Cache  │
    │            └──────────────┘
    │                   │
    └─────────┬─────────┘
              ▼
        ┌──────────┐
        │ Backend  │
        │   API    │
        └──────────┘
```

## File Structure

```
src/
├── stores/
│   ├── conversation-store.ts      # Client UI state (Zustand)
│   └── workflow-store.ts          # Workflow-specific state
├── hooks/
│   ├── use-conversations.ts       # Server state hooks (React Query)
│   └── use-filtered-conversations.ts # Computed state hooks
├── providers/
│   └── react-query-provider.tsx   # React Query setup
└── app/
    └── layout.tsx                 # Provider integration
```

## Usage Patterns

### 1. Fetching Conversations

```typescript
import { useConversations } from '@/hooks/use-conversations';
import { useFilterConfig } from '@/stores/conversation-store';

function ConversationList() {
  // Get current filter configuration from Zustand
  const filterConfig = useFilterConfig();
  
  // Fetch data with React Query
  const { data: conversations, isLoading, error } = useConversations(filterConfig);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {conversations.map((conv) => (
        <ConversationCard key={conv.id} conversation={conv} />
      ))}
    </div>
  );
}
```

### 2. Updating a Conversation

```typescript
import { useUpdateConversation } from '@/hooks/use-conversations';
import { useConversationStore } from '@/stores/conversation-store';

function ApproveButton({ conversationId }: { conversationId: string }) {
  const updateMutation = useUpdateConversation();
  const setLoading = useConversationStore((state) => state.setLoading);
  
  const handleApprove = async () => {
    try {
      setLoading(true, 'Approving conversation...');
      
      await updateMutation.mutateAsync({
        id: conversationId,
        updates: { status: 'approved' }
      });
      
      // UI updates automatically via optimistic update
      // Cache is invalidated after success
    } catch (error) {
      console.error('Failed to approve:', error);
      // Automatic rollback has already occurred
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleApprove} disabled={updateMutation.isPending}>
      {updateMutation.isPending ? 'Approving...' : 'Approve'}
    </button>
  );
}
```

### 3. Managing Selections

```typescript
import { useConversationStore, useSelectedConversationIds } from '@/stores/conversation-store';
import { useSelectedConversations } from '@/hooks/use-filtered-conversations';

function BulkActionsToolbar() {
  const selectedIds = useSelectedConversationIds();
  const selectedConversations = useSelectedConversations();
  const clearSelection = useConversationStore((state) => state.clearSelection);
  const openExportModal = useConversationStore((state) => state.openExportModal);
  
  if (selectedIds.length === 0) return null;
  
  return (
    <div className="toolbar">
      <span>{selectedIds.length} selected</span>
      <button onClick={openExportModal}>Export Selected</button>
      <button onClick={clearSelection}>Clear Selection</button>
    </div>
  );
}
```

### 4. Filtering Data

```typescript
import { useConversationStore } from '@/stores/conversation-store';
import { useFilteredConversations } from '@/hooks/use-filtered-conversations';

function FilterPanel() {
  const setFilterConfig = useConversationStore((state) => state.setFilterConfig);
  const resetFilters = useConversationStore((state) => state.resetFilters);
  const { conversations, isLoading } = useFilteredConversations();
  
  const handleTierFilter = (tiers: TierType[]) => {
    setFilterConfig({ tierTypes: tiers });
    // React Query automatically refetches with new filters
  };
  
  const handleStatusFilter = (statuses: ConversationStatus[]) => {
    setFilterConfig({ statuses });
  };
  
  return (
    <div>
      <TierFilterDropdown onChange={handleTierFilter} />
      <StatusFilterDropdown onChange={handleStatusFilter} />
      <button onClick={resetFilters}>Clear All Filters</button>
      <div>Showing {conversations.length} conversations</div>
    </div>
  );
}
```

### 5. Computed Statistics

```typescript
import { useComputedConversationStats, useQualityDistribution } from '@/hooks/use-filtered-conversations';

function StatsDashboard() {
  const stats = useComputedConversationStats();
  const qualityDist = useQualityDistribution();
  
  return (
    <div className="stats-grid">
      <StatCard title="Total" value={stats.total} />
      <StatCard title="Avg Quality" value={stats.avgQualityScore.toFixed(2)} />
      <StatCard title="Approval Rate" value={`${stats.approvalRate.toFixed(1)}%`} />
      <StatCard title="Pending Review" value={stats.pendingReview} />
      
      <QualityChart distribution={qualityDist} />
    </div>
  );
}
```

### 6. Modal Management

```typescript
import { useConversationStore, useModalState } from '@/stores/conversation-store';
import { useConversation } from '@/hooks/use-conversations';

function ConversationDetailModal() {
  const modalState = useModalState();
  const closeModal = useConversationStore((state) => state.closeConversationDetail);
  
  // Fetch conversation details only when modal is open
  const { data: conversation, isLoading } = useConversation(
    modalState.currentConversationId
  );
  
  if (!modalState.conversationDetailModalOpen) return null;
  
  return (
    <Dialog open={true} onOpenChange={closeModal}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ConversationDetails conversation={conversation} />
      )}
    </Dialog>
  );
}
```

### 7. Bulk Operations

```typescript
import { useBulkUpdateConversations } from '@/hooks/use-conversations';
import { useSelectedConversationIds, useConversationStore } from '@/stores/conversation-store';

function BulkApprovalButton() {
  const selectedIds = useSelectedConversationIds();
  const clearSelection = useConversationStore((state) => state.clearSelection);
  const bulkUpdate = useBulkUpdateConversations();
  
  const handleBulkApprove = async () => {
    try {
      const result = await bulkUpdate.mutateAsync({
        ids: selectedIds,
        updates: { status: 'approved' }
      });
      
      console.log(`Approved ${result.updated} conversations`);
      if (result.failed > 0) {
        console.warn(`Failed to approve ${result.failed} conversations`);
      }
      
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

## React Query Configuration

### Query Keys

Query keys follow a hierarchical structure for efficient cache invalidation:

```typescript
conversationKeys = {
  all: ['conversations'],                    // Invalidate all conversation queries
  lists: ['conversations', 'list'],          // Invalidate all list queries
  list: ['conversations', 'list', filters],  // Specific filtered list
  details: ['conversations', 'detail'],      // Invalidate all detail queries
  detail: ['conversations', 'detail', id],   // Specific conversation
  stats: ['conversations', 'stats'],         // Statistics query
}
```

### Caching Strategy

- **Lists**: 30 second stale time, refetch on window focus
- **Details**: 60 second stale time, no refetch on focus
- **Stats**: 60 second stale time, no refetch on focus

### Optimistic Updates

Mutations perform optimistic updates for instant UI feedback:

1. **onMutate**: Cancel ongoing queries, snapshot current data, update cache
2. **onError**: Rollback to snapshot if mutation fails
3. **onSettled**: Invalidate affected queries to ensure consistency

## Zustand Configuration

### Persistence

Only user preferences are persisted to localStorage:

- Filter configurations
- Sidebar collapsed state
- Current view

Session-specific state is NOT persisted:

- Selections
- Modal states
- Loading states

### DevTools

Zustand DevTools are enabled in development mode:

- View state changes in real-time
- Time-travel debugging
- Action names for better debugging

## Best Practices

### 1. Use Selector Hooks

Prefer specific selector hooks for better performance:

```typescript
// ❌ Avoid - subscribes to entire store
const store = useConversationStore();

// ✅ Better - subscribes only to needed state
const selectedIds = useSelectedConversationIds();
const filterConfig = useFilterConfig();
```

### 2. Optimistic Updates for Common Actions

Use optimistic updates for:

- Status changes
- Approval/rejection
- Single field updates

Skip optimistic updates for:

- Bulk operations (too complex)
- Operations with validation errors
- Operations that might fail frequently

### 3. Cache Invalidation Strategy

```typescript
// Invalidate specific query
queryClient.invalidateQueries({ queryKey: conversationKeys.detail(id) });

// Invalidate all lists but keep details
queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });

// Invalidate everything
queryClient.invalidateQueries({ queryKey: conversationKeys.all });
```

### 4. Error Handling

```typescript
const mutation = useUpdateConversation();

mutation.mutate(
  { id, updates },
  {
    onSuccess: (data) => {
      toast.success('Updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
      // Rollback already handled by mutation hook
    },
  }
);
```

### 5. Loading States

Coordinate loading states between React Query and Zustand:

```typescript
function MyComponent() {
  const { isLoading: queryLoading } = useConversations(filters);
  const { isLoading: storeLoading } = useLoadingState();
  
  const isLoading = queryLoading || storeLoading;
  
  // Show appropriate loading UI
}
```

## Performance Considerations

### 1. Memoization

Computed hooks use `useMemo` to prevent unnecessary recalculations:

```typescript
const stats = useMemo(() => {
  // Expensive calculations
  return { total, avgQuality, ... };
}, [conversations]);
```

### 2. Query Deduplication

React Query automatically deduplicates identical queries:

```typescript
// Both components will share the same query
function ComponentA() {
  const { data } = useConversations(filters);
}

function ComponentB() {
  const { data } = useConversations(filters); // Uses same query!
}
```

### 3. Prefetching

Prefetch data before it's needed:

```typescript
import { prefetchConversations } from '@/hooks/use-conversations';

// Prefetch on hover
onMouseEnter={() => {
  prefetchConversations(queryClient, newFilters);
}}
```

## Testing

### Testing Client State (Zustand)

```typescript
import { renderHook, act } from '@testing-library/react';
import { useConversationStore } from '@/stores/conversation-store';

test('toggles conversation selection', () => {
  const { result } = renderHook(() => useConversationStore());
  
  act(() => {
    result.current.toggleConversationSelection('conv-1');
  });
  
  expect(result.current.selectedConversationIds).toContain('conv-1');
});
```

### Testing Server State (React Query)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useConversations } from '@/hooks/use-conversations';

test('fetches conversations', async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  const { result } = renderHook(() => useConversations({}), { wrapper });
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

## Troubleshooting

### Query Not Updating

1. Check if query key includes all filter parameters
2. Verify cache invalidation is called after mutations
3. Check stale time configuration

### Optimistic Update Not Working

1. Ensure `onMutate` is canceling outgoing refetches
2. Verify query key matching in cache updates
3. Check if rollback is occurring (error in mutation)

### State Not Persisting

1. Check `partialize` configuration in Zustand
2. Verify localStorage is available
3. Check browser console for storage errors

### Performance Issues

1. Use selector hooks instead of full store access
2. Check for unnecessary re-renders with React DevTools
3. Verify `useMemo` in computed hooks
4. Review query refetch configuration

## Migration Guide

### From Mock Data to Live API

1. Replace mock data hooks with React Query hooks
2. Update components to handle loading/error states
3. Add optimistic updates for better UX
4. Test error scenarios thoroughly

### From Old State Management

1. Move API data to React Query hooks
2. Keep only UI state in Zustand
3. Remove any duplicated state
4. Update components to use new hooks

## Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Next.js App Router with React Query](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)

## Support

For questions or issues with state management:

1. Check this documentation first
2. Review the hook implementations in `src/hooks/`
3. Check store implementations in `src/stores/`
4. Use React Query DevTools in development mode
5. Use Zustand DevTools for client state debugging

