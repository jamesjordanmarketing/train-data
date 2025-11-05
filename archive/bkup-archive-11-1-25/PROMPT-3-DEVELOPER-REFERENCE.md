# Dashboard Developer Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies
cd src
npm install

# Run development server
npm run dev

# Visit dashboard
http://localhost:3000/conversations
```

---

## 📂 File Locations

```
Core Dashboard Components:
src/app/(dashboard)/conversations/page.tsx          # Route entry point
src/components/conversations/ConversationDashboard.tsx  # Main dashboard
src/components/conversations/DashboardLayout.tsx    # Layout wrapper
src/components/conversations/Header.tsx              # Navigation header
src/components/conversations/ConversationTable.tsx   # Data table
src/components/conversations/FilterBar.tsx           # Filter controls
src/components/conversations/Pagination.tsx          # Pagination UI

State Management:
src/stores/conversation-store.ts                    # Zustand client state
src/hooks/use-conversations.ts                      # React Query hooks
src/hooks/use-filtered-conversations.ts             # Filtered data hook

Types:
src/lib/types/conversations.ts                      # TypeScript types

Utilities:
src/lib/utils.ts                                    # Helper functions
```

---

## 🎣 Hook Usage

### Fetch Conversations

```tsx
import { useFilteredConversations } from '@/hooks/use-filtered-conversations';

function MyComponent() {
  const { conversations, isLoading, error, refetch } = useFilteredConversations();
  
  // conversations: Filtered array based on current filterConfig
  // isLoading: Boolean for loading state
  // error: Error object if failed
  // refetch: Function to manually refetch
}
```

### Update Conversation

```tsx
import { useUpdateConversation } from '@/hooks/use-conversations';
import { toast } from 'sonner';

function MyComponent() {
  const updateMutation = useUpdateConversation();
  
  const handleApprove = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ 
        id, 
        updates: { status: 'approved' } 
      });
      toast.success('Approved!');
    } catch (error) {
      toast.error('Failed to approve');
    }
  };
}
```

### Delete Conversation

```tsx
import { useDeleteConversation } from '@/hooks/use-conversations';

function MyComponent() {
  const deleteMutation = useDeleteConversation();
  
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    // Optimistic update + cache invalidation happens automatically
  };
}
```

### Conversation Stats

```tsx
import { useComputedConversationStats } from '@/hooks/use-filtered-conversations';

function MyComponent() {
  const stats = useComputedConversationStats();
  
  // stats.total - Total count
  // stats.avgQualityScore - Average score
  // stats.approvalRate - Percentage approved
  // stats.pendingReview - Count pending
  // stats.byStatus - Object with counts per status
  // stats.byTier - Object with counts per tier
}
```

---

## 🗄️ Store Usage

### Access Store State

```tsx
import { useConversationStore } from '@/stores/conversation-store';

function MyComponent() {
  // Get specific state
  const selectedIds = useConversationStore((state) => state.selectedConversationIds);
  const filterConfig = useConversationStore((state) => state.filterConfig);
  const isLoading = useConversationStore((state) => state.isLoading);
  
  // Get actions
  const { 
    toggleConversationSelection,
    setFilterConfig,
    resetFilters,
    showConfirm,
    openConversationDetail
  } = useConversationStore();
}
```

### Update Filters

```tsx
import { useConversationStore } from '@/stores/conversation-store';

function MyComponent() {
  const setFilterConfig = useConversationStore((state) => state.setFilterConfig);
  
  // Partial update (merges with existing)
  setFilterConfig({ 
    tierTypes: ['template'],
    statuses: ['approved']
  });
  
  // Clear all filters
  const resetFilters = useConversationStore((state) => state.resetFilters);
  resetFilters();
}
```

### Show Confirmation Dialog

```tsx
import { useConversationStore } from '@/stores/conversation-store';

function MyComponent() {
  const showConfirm = useConversationStore((state) => state.showConfirm);
  
  const handleDangerousAction = () => {
    showConfirm(
      'Delete Item',                    // Title
      'This cannot be undone.',        // Message
      () => {                          // onConfirm callback
        // Do the dangerous thing
      },
      () => {                          // onCancel callback (optional)
        // Handle cancel
      }
    );
  };
}
```

### Open Modal

```tsx
import { useConversationStore } from '@/stores/conversation-store';

function MyComponent() {
  const openExportModal = useConversationStore((state) => state.openExportModal);
  const openBatchGeneration = useConversationStore((state) => state.openBatchGenerationModal);
  const openDetail = useConversationStore((state) => state.openConversationDetail);
  
  // Open modals
  openExportModal();
  openBatchGeneration();
  openDetail('conversation-id-123');
}
```

---

## 🎨 Component Patterns

### Table Row with Actions

```tsx
<TableRow 
  key={item.id}
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => openDetail(item.id)}
>
  <TableCell onClick={(e) => e.stopPropagation()}>
    {/* Checkbox - prevent row click */}
    <Checkbox checked={selected} onChange={handleSelect} />
  </TableCell>
  
  <TableCell>{item.name}</TableCell>
  
  <TableCell onClick={(e) => e.stopPropagation()}>
    {/* Actions menu - prevent row click */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleEdit(item.id)}>
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </TableCell>
</TableRow>
```

### Loading Skeleton

```tsx
{isLoading ? (
  <div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
) : (
  <div>{/* Actual content */}</div>
)}
```

### Empty State

```tsx
{conversations.length === 0 && !isLoading && (
  <div className="flex flex-col items-center justify-center h-96 space-y-4">
    <FileText className="h-16 w-16 text-muted-foreground" />
    <h2 className="text-2xl font-semibold">No items found</h2>
    <p className="text-muted-foreground">Get started by creating one.</p>
    <Button onClick={onCreate}>Create New</Button>
  </div>
)}
```

### Status Badge

```tsx
const statusColors = {
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

<Badge className={statusColors[status]}>
  {status.replace('_', ' ')}
</Badge>
```

---

## 🔧 Common Tasks

### Add New Filter

1. **Update FilterConfig type** (`src/lib/types/conversations.ts`):
```tsx
export interface FilterConfig {
  // ... existing filters
  myNewFilter?: string;  // Add this
}
```

2. **Update Store Initial State** (`src/stores/conversation-store.ts`):
```tsx
filterConfig: {
  // ... existing filters
  myNewFilter: undefined,
}
```

3. **Update FilterBar Component** (`src/components/conversations/FilterBar.tsx`):
```tsx
// Add UI control
<Select
  value={filterConfig.myNewFilter || 'all'}
  onValueChange={(value) => {
    setFilterConfig({ myNewFilter: value === 'all' ? undefined : value });
  }}
>
  <SelectItem value="all">All</SelectItem>
  <SelectItem value="option1">Option 1</SelectItem>
</Select>

// Add badge display
{filterConfig.myNewFilter && (
  <Badge variant="secondary" className="gap-1">
    My Filter: {filterConfig.myNewFilter}
    <X onClick={() => setFilterConfig({ myNewFilter: undefined })} />
  </Badge>
)}
```

4. **Update API Query** (`src/hooks/use-conversations.ts`):
```tsx
// Add to fetchConversations params
if (filters.myNewFilter) {
  params.append('myNewFilter', filters.myNewFilter);
}
```

---

### Add New Column to Table

1. **Add TableHead**:
```tsx
<TableHead className="cursor-pointer" onClick={() => handleSort('myField')}>
  <div className="flex items-center gap-2">
    My Column
    {getSortIcon('myField')}
  </div>
</TableHead>
```

2. **Add TableCell** (in map):
```tsx
<TableCell>{conversation.myField}</TableCell>
```

3. **Update Sort Type** (if needed):
```tsx
const [sortColumn, setSortColumn] = useState<keyof Conversation>('myField');
```

---

### Add New Action to Dropdown

```tsx
<DropdownMenuItem onClick={() => handleMyAction(conversation.id)}>
  <MyIcon className="h-4 w-4 mr-2" />
  My Action
</DropdownMenuItem>
```

Implementation:
```tsx
const handleMyAction = async (id: string) => {
  try {
    await updateMutation.mutateAsync({ 
      id, 
      updates: { /* ... */ } 
    });
    toast.success('Action completed!');
  } catch (error) {
    toast.error('Action failed');
  }
};
```

---

### Add New Stat Card

```tsx
<Card className="p-4">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-sm text-muted-foreground">My Metric</p>
      <p className="text-3xl font-bold mt-1">{stats.myMetric}</p>
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <span>Description</span>
      </div>
    </div>
    <MyIcon className="h-8 w-8 text-primary" />
  </div>
</Card>
```

Calculate metric in `useComputedConversationStats`:
```tsx
// In useMemo
const myMetric = conversations.filter(c => /* condition */).length;

return {
  // ... existing stats
  myMetric,
};
```

---

## 🎯 Type Definitions

### Conversation

```tsx
interface Conversation {
  id: string;
  conversationId: string;
  
  // Metadata
  title?: string;
  persona: string;
  emotion: string;
  topic?: string;
  intent?: string;
  tone?: string;
  
  // Classification
  tier: 'template' | 'scenario' | 'edge_case';
  status: 'draft' | 'generated' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision';
  category: string[];
  
  // Quality
  qualityScore?: number;
  qualityMetrics?: QualityMetrics;
  
  // Stats
  turnCount: number;
  totalTokens: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Optional
  turns?: ConversationTurn[];
}
```

### FilterConfig

```tsx
interface FilterConfig {
  tierTypes?: TierType[];
  statuses?: ConversationStatus[];
  qualityRange?: { min: number; max: number };
  dateRange?: { from: string; to: string };
  categories?: string[];
  personas?: string[];
  emotions?: string[];
  searchQuery?: string;
  parentId?: string;
  createdBy?: string;
}
```

---

## 🚨 Common Errors & Fixes

### Error: "Cannot read property 'x' of undefined"

**Cause**: Data not loaded yet  
**Fix**: Add optional chaining and loading check

```tsx
// ❌ Bad
{conversations.map(c => ...)}

// ✅ Good
{conversations?.map(c => ...)}

// ✅ Better
{isLoading ? <Skeleton /> : conversations.map(c => ...)}
```

---

### Error: "Cannot update component while rendering a different component"

**Cause**: Setting state during render  
**Fix**: Move to useEffect or event handler

```tsx
// ❌ Bad
function MyComponent() {
  if (condition) {
    setState(newValue);  // During render!
  }
}

// ✅ Good
function MyComponent() {
  useEffect(() => {
    if (condition) {
      setState(newValue);
    }
  }, [condition]);
}
```

---

### Error: "Maximum update depth exceeded"

**Cause**: Infinite loop in useEffect  
**Fix**: Add correct dependencies

```tsx
// ❌ Bad
useEffect(() => {
  setState(data);  // data changes, triggers useEffect again
}, [data]);

// ✅ Good
useEffect(() => {
  setState(data);
}, []);  // Empty deps - run once
```

---

## 📚 Useful Code Snippets

### Debounced Search

```tsx
import { useState, useEffect } from 'react';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 300);

useEffect(() => {
  // Trigger search with debouncedSearch
}, [debouncedSearch]);
```

---

### Copy to Clipboard

```tsx
import { toast } from 'sonner';

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  } catch (error) {
    toast.error('Failed to copy');
  }
};
```

---

### Format Date Relative

```tsx
function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
```

---

## 🔍 Debugging Tips

### React Query DevTools

```tsx
// Already included in ReactQueryProvider
// Press Ctrl+Shift+Q to toggle

// View:
// - Active queries
// - Query cache
// - Mutation status
// - Refetch manually
```

### Zustand DevTools

```tsx
// Already configured in conversation-store
// Open Redux DevTools extension

// View:
// - State tree
// - Action history
// - State diffs
// - Time travel debugging
```

### Log Render Cycles

```tsx
import { useEffect, useRef } from 'react';

function useWhyDidYouUpdate(name: string, props: any) {
  const previousProps = useRef<any>();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: any = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  });
}

// Usage
useWhyDidYouUpdate('MyComponent', { prop1, prop2 });
```

---

## 🎓 Best Practices

### ✅ DO

- Use TypeScript types for all props and state
- Add loading states for async operations
- Show error messages to users
- Use optimistic updates for mutations
- Memoize expensive calculations
- Add keyboard navigation
- Handle empty states gracefully
- Write semantic HTML

### ❌ DON'T

- Fetch data in render (use hooks)
- Mutate state directly (use setState)
- Ignore TypeScript errors
- Skip error handling
- Forget loading states
- Use `any` type
- Hardcode strings (use constants)
- Nest ternaries deeply

---

## 📞 Support

- **Codebase Issues**: Check `PROMPT-3-IMPLEMENTATION-SUMMARY.md`
- **Testing**: See `PROMPT-3-TESTING-GUIDE.md`
- **Type Errors**: Review `src/lib/types/conversations.ts`
- **State Issues**: Check Zustand DevTools
- **Query Issues**: Check React Query DevTools

---

**Last Updated**: October 30, 2025  
**Version**: 1.0.0  
**Status**: Production Ready

