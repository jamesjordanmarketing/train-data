# Prompt 6: Quick Reference Guide

**For:** Developers working with loading states, error handling, and polish features  
**Last Updated:** October 31, 2025

---

## 🎯 Quick Component Reference

### Skeleton Loaders

```tsx
import { TableSkeleton, DashboardSkeleton, ConversationDetailSkeleton } from '@/components/ui/skeletons';

// Table loading state
if (isLoading) return <TableSkeleton rows={10} />;

// Full dashboard loading
if (isLoading) return <DashboardSkeleton />;

// Detail view loading
if (isLoading) return <ConversationDetailSkeleton />;
```

---

### Empty States

```tsx
import { NoConversationsEmpty, NoSearchResultsEmpty, ErrorStateEmpty } from '@/components/empty-states';

// No data at all
if (isEmpty && !hasFilters) {
  return <NoConversationsEmpty onCreate={handleCreate} />;
}

// No search results
if (isEmpty && hasFilters) {
  return <NoSearchResultsEmpty onClear={clearFilters} />;
}

// Error loading data
if (error) {
  return <ErrorStateEmpty onRetry={refetch} />;
}
```

---

### Error Boundary

```tsx
import { ErrorBoundary, APIErrorFallback } from '@/components/error-boundary';

// Wrap entire app (in layout.tsx)
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Wrap specific component with custom fallback
<ErrorBoundary fallback={APIErrorFallback}>
  <DataComponent />
</ErrorBoundary>
```

---

### Toast Notifications

```tsx
import { toast } from 'sonner';

// Loading → Success pattern
const handleAction = async (id: string) => {
  const toastId = toast.loading('Processing...');
  try {
    await apiCall(id);
    toast.success('Success!', { id: toastId });
  } catch (error: any) {
    toast.error('Failed', {
      id: toastId,
      description: error?.message,
      action: { label: 'Retry', onClick: () => handleAction(id) }
    });
  }
};

// Simple notifications
toast.success('Saved!');
toast.error('Failed to save');
toast.info('Processing...');
```

---

### Progress Indicators

```tsx
import { ProgressIndicator, BulkOperationProgress } from '@/components/progress-indicator';

// Simple progress
<ProgressIndicator current={50} total={100} label="Loading..." />

// Bulk operation progress
<BulkOperationProgress 
  operation="Approving conversations" 
  completed={10} 
  total={50}
  failed={2}
/>

// In toast
const toastId = toast.loading(
  <BulkOperationProgress operation="Processing" completed={0} total={count} />
);
```

---

### Debouncing

```tsx
import { useDebounce } from '@/hooks/use-debounce';

const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 300);

useEffect(() => {
  // This runs 300ms after user stops typing
  performSearch(debouncedSearch);
}, [debouncedSearch]);

return (
  <Input 
    value={searchInput} 
    onChange={(e) => setSearchInput(e.target.value)} 
  />
);
```

---

### Offline Detection

```tsx
import { useOnlineStatus } from '@/hooks/use-online-status';

function MyComponent() {
  const isOnline = useOnlineStatus();
  
  const handleAction = () => {
    if (!isOnline) {
      toast.error('You are offline');
      return;
    }
    // Proceed with action
  };
}

// Banner automatically shown via OnlineStatusProvider in layout
```

---

## 🎨 CSS Utility Classes

### Focus States
All interactive elements automatically get focus indicators. No additional classes needed.

### Hover Effects
```tsx
<button className="hover:bg-accent transition-colors">
  Button
</button>
```

### Card Hover
```tsx
<Card className="card-hover">
  Content
</Card>
```

### No Print
```tsx
<div className="no-print">
  Won't appear when printing
</div>
```

---

## ⚡ Performance Patterns

### Memoize Components
```tsx
import React from 'react';

export const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* Component implementation */}</div>;
});
```

### Memoize Calculations
```tsx
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);
```

### Memoize Callbacks
```tsx
const handleClick = useCallback((id: string) => {
  performAction(id);
}, [performAction]);
```

---

## 🎯 Common Patterns

### Standard Component Structure with Loading/Error/Empty

```tsx
'use client';

import { TableSkeleton } from '@/components/ui/skeletons';
import { ErrorStateEmpty, NoDataEmpty } from '@/components/empty-states';

export function MyComponent() {
  const { data, isLoading, error } = useMyData();
  
  // Loading
  if (isLoading) return <TableSkeleton rows={5} />;
  
  // Error
  if (error) return <ErrorStateEmpty onRetry={refetch} />;
  
  // Empty
  if (data.length === 0) return <NoDataEmpty onCreate={openModal} />;
  
  // Success
  return <div>{/* Render data */}</div>;
}
```

---

### Action Handler with Toast

```tsx
const handleAction = useCallback(async (id: string) => {
  const toastId = toast.loading('Processing...');
  
  try {
    await mutation.mutateAsync(id);
    toast.success('Success!', { id: toastId });
  } catch (error: any) {
    toast.error('Failed', {
      id: toastId,
      description: error?.message || 'An error occurred',
      action: {
        label: 'Retry',
        onClick: () => handleAction(id)
      }
    });
  }
}, [mutation]);
```

---

### Bulk Operation with Progress

```tsx
const handleBulkAction = async (ids: string[]) => {
  setIsProcessing(true);
  const toastId = toast.loading(
    <BulkOperationProgress 
      operation="Processing items" 
      completed={0} 
      total={ids.length}
    />
  );
  
  try {
    await bulkMutation.mutateAsync(ids);
    toast.success(`Processed ${ids.length} items`, { id: toastId });
  } catch (error: any) {
    toast.error('Bulk operation failed', {
      id: toastId,
      description: error?.message
    });
  } finally {
    setIsProcessing(false);
  }
};
```

---

### Search with Debouncing

```tsx
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 300);

useEffect(() => {
  setFilters({ search: debouncedSearch });
}, [debouncedSearch]);

return (
  <Input 
    placeholder="Search..." 
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
  />
);
```

---

## 🐛 Debugging Tips

### Check Re-renders
```bash
# Open React DevTools → Profiler
# Start recording
# Perform action
# Stop recording
# Check "Why did this render?"
```

### Check Network Calls
```bash
# Chrome DevTools → Network
# Filter by "Fetch/XHR"
# Watch for duplicate calls
# Check request timing
```

### Check Bundle Size
```bash
npm run build
# Check dist/ folder sizes
```

### Check Performance
```bash
npx lighthouse http://localhost:3000 --view
```

---

## 🚨 Common Pitfalls

### ❌ Don't: Create skeleton in same file
```tsx
// Bad - hard to maintain
if (isLoading) {
  return (
    <div>
      <div className="animate-pulse">
        <div className="h-4 w-32 bg-gray-200" />
        <div className="h-4 w-24 bg-gray-200" />
      </div>
    </div>
  );
}
```

### ✅ Do: Use shared skeleton component
```tsx
// Good - reusable and consistent
if (isLoading) return <TableSkeleton rows={5} />;
```

---

### ❌ Don't: Forget to update toast ID
```tsx
// Bad - creates new toast instead of updating
const toastId = toast.loading('Loading...');
toast.success('Done!'); // Creates second toast
```

### ✅ Do: Update same toast
```tsx
// Good - updates same toast
const toastId = toast.loading('Loading...');
toast.success('Done!', { id: toastId });
```

---

### ❌ Don't: Debounce without local state
```tsx
// Bad - UI feels laggy
const debouncedValue = useDebounce(inputValue, 300);
return <Input value={debouncedValue} onChange={...} />;
```

### ✅ Do: Use local state for immediate UI update
```tsx
// Good - immediate UI, debounced API
const [input, setInput] = useState('');
const debouncedInput = useDebounce(input, 300);

useEffect(() => {
  apiCall(debouncedInput);
}, [debouncedInput]);

return <Input value={input} onChange={(e) => setInput(e.target.value)} />;
```

---

### ❌ Don't: Wrap everything in React.memo
```tsx
// Bad - premature optimization
export const SimpleComponent = React.memo(function SimpleComponent() {
  return <div>Hello</div>;
});
```

### ✅ Do: Only memo expensive components
```tsx
// Good - memoize components that render lists or do expensive calculations
export const ConversationTable = React.memo(function ConversationTable({ conversations }) {
  // Expensive rendering of 1000+ rows
});
```

---

## 📋 Checklist for New Features

When adding a new feature, ensure:

- [ ] Loading state uses skeleton loader
- [ ] Error state shows error boundary or empty state
- [ ] Empty state provides clear guidance
- [ ] Actions show loading toast
- [ ] Success shows success toast
- [ ] Errors show error toast with retry
- [ ] Long operations show progress
- [ ] Search inputs are debounced
- [ ] Expensive components are memoized
- [ ] Event handlers are memoized with useCallback
- [ ] Calculations are memoized with useMemo
- [ ] Focus indicators work with keyboard
- [ ] Works offline (shows appropriate error)

---

## 🎓 Learning Resources

### React Performance
- [React.memo documentation](https://react.dev/reference/react/memo)
- [useMemo documentation](https://react.dev/reference/react/useMemo)
- [useCallback documentation](https://react.dev/reference/react/useCallback)

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)

### Testing
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [React Testing Library](https://testing-library.com/react)

---

## 🆘 Need Help?

### Component not working?
1. Check imports are correct
2. Check component is wrapped in client component ('use client')
3. Check props are passed correctly
4. Check console for errors

### Performance issues?
1. Open React DevTools Profiler
2. Record interactions
3. Look for unnecessary re-renders
4. Add memoization where needed

### Accessibility concerns?
1. Tab through with keyboard
2. Check focus indicators visible
3. Test with screen reader if possible
4. Run Lighthouse accessibility audit

---

## 📞 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check

# Lighthouse audit
npx lighthouse http://localhost:3000/conversations --view

# Check bundle size
npm run build && du -sh dist/*
```

---

**Document Version:** 1.0  
**Last Updated:** October 31, 2025  
**Maintained By:** Development Team

