# Auto-Save Quick Reference Guide

Quick reference for using the auto-save system in your components.

---

## 🚀 Quick Start (5 minutes)

### 1. Add to Your Editor Component

```typescript
import { useAutoSave } from '@/hooks/useAutoSave';
import { SaveStatusIndicator } from '@/components/auto-save';
import { saveDraft } from '@/lib/auto-save';

function MyEditor({ itemId }) {
  const [content, setContent] = useState('');
  
  const { status, lastSaved } = useAutoSave(
    { id: itemId, content },
    async (data) => {
      await saveDraft('conversation', data.id, data);
    }
  );
  
  return (
    <div>
      <SaveStatusIndicator status={status} lastSaved={lastSaved} />
      <textarea value={content} onChange={e => setContent(e.target.value)} />
    </div>
  );
}
```

### 2. Add Recovery Dialog to App Layout

```typescript
import { RecoveryDialog } from '@/components/auto-save';

function AppLayout({ children }) {
  return (
    <>
      <RecoveryDialog />
      {children}
    </>
  );
}
```

**Done!** Your app now has auto-save and recovery. 🎉

---

## 📚 Common Patterns

### Pattern 1: Basic Auto-Save

```typescript
const { status, lastSaved } = useAutoSave(
  data,
  async (data) => await saveDraft('conversation', id, data)
);
```

### Pattern 2: Custom Configuration

```typescript
const { status, lastSaved, saveDraft } = useAutoSave(
  data,
  async (data) => await saveDraft('conversation', id, data),
  {
    interval: 60000,        // Save every 60 seconds
    debounceDelay: 5000,    // Wait 5s after typing
    maxRetries: 5,          // Retry 5 times on failure
  }
);
```

### Pattern 3: Server + Local Saves

```typescript
const { status, lastSaved } = useAutoSave(
  data,
  async (data) => {
    // Save locally first (fast)
    await saveDraft('conversation', id, data);
    
    // Then try server (best effort)
    try {
      await api.saveToServer(data);
    } catch (err) {
      console.warn('Server save failed, saved locally');
    }
  }
);
```

### Pattern 4: Manual Save Button

```typescript
const { status, lastSaved, saveDraft } = useAutoSave(data, onSave);

return (
  <div>
    <SaveStatusIndicator status={status} lastSaved={lastSaved} />
    <button onClick={saveDraft}>Save Now</button>
  </div>
);
```

### Pattern 5: Disable Auto-Save Conditionally

```typescript
const { status } = useAutoSave(
  data,
  onSave,
  {
    enabled: user.isLoggedIn  // Only auto-save for logged-in users
  }
);
```

### Pattern 6: Recovery with Navigation

```typescript
<RecoveryDialog
  onRecover={(item, data) => {
    const id = item.id.split('_')[1];
    router.push(`/conversations/${id}`);
    loadDataIntoEditor(data);
  }}
/>
```

### Pattern 7: Conflict Resolution

```typescript
<RecoveryDialog
  getServerData={async (itemId, type) => {
    const id = itemId.split('_')[1];
    const serverData = await fetchFromServer(id);
    return {
      data: serverData,
      updatedAt: new Date(serverData.updatedAt),
    };
  }}
  onRecover={(item, data) => {
    // User chose draft or server data
    loadData(data);
  }}
/>
```

---

## 🎨 UI Components

### SaveStatusIndicator

Shows current save status with icon and text.

```typescript
<SaveStatusIndicator 
  status={status}           // 'idle' | 'saving' | 'saved' | 'error'
  lastSaved={lastSaved}     // Date | null
  error={error}             // Error | null
  className="my-2"          // Optional custom classes
/>
```

**Displays:**
- `idle` → "Not saved" or "Saved 5m ago"
- `saving` → "Saving..." (with spinner)
- `saved` → "Saved Just now" (with checkmark)
- `error` → "Failed to save" (with alert icon)

---

## 🔧 Configuration Options

```typescript
{
  interval: 30000,          // Auto-save interval in ms
  debounceDelay: 2000,      // Debounce delay in ms
  maxRetries: 3,            // Max retry attempts
  enabled: true,            // Enable/disable auto-save
  saveOnUnmount: true,      // Save when component unmounts
}
```

---

## 📦 Storage API

### Save Draft

```typescript
import { saveDraft } from '@/lib/auto-save';

await saveDraft(
  'conversation',  // type: 'conversation' | 'batch' | 'template' | 'other'
  '123',           // id: string
  { content }      // data: any
);
```

### Load Draft

```typescript
import { loadDraft } from '@/lib/auto-save';

const data = await loadDraft<DataType>('conversation', '123');
if (data) {
  setContent(data.content);
}
```

### Check for Drafts

```typescript
import { checkForRecoverableDrafts } from '@/lib/auto-save';

const items = await checkForRecoverableDrafts();
console.log(`Found ${items.length} drafts`);
```

### Discard Draft

```typescript
import { discardDraft } from '@/lib/auto-save';

await discardDraft('conversation_123');
```

---

## 🎯 Hook Return Values

```typescript
const {
  status,        // 'idle' | 'saving' | 'saved' | 'error'
  lastSaved,     // Date | null
  error,         // Error | null
  saveDraft,     // () => Promise<void>
  clearDraft,    // () => Promise<void>
  resetError,    // () => void
} = useAutoSave(data, onSave, config);
```

---

## 🐛 Troubleshooting

### Drafts not saving?
- Check console for errors
- Verify `enabled: true`
- Check browser storage quota

### Recovery dialog not showing?
- Ensure RecoveryDialog is in layout
- Check if drafts expired (24 hours)
- Verify checkForRecoverableDrafts() returns items

### Saves happening too often?
- Increase `debounceDelay` (e.g., 5000 for 5s)
- Increase `interval` (e.g., 60000 for 1 min)

### Saves not happening often enough?
- Decrease `interval` (e.g., 10000 for 10s)
- Decrease `debounceDelay` (e.g., 1000 for 1s)

---

## 💡 Tips & Best Practices

### ✅ Do's

- Use descriptive draft IDs: `conversation_abc123`
- Save to local storage first, then server
- Show save status to users
- Allow manual save option
- Handle server failures gracefully

### ❌ Don'ts

- Don't store sensitive data (passwords, tokens)
- Don't save too frequently (< 1 second)
- Don't assume drafts persist forever (24h limit)
- Don't block UI while saving
- Don't save unchanged data (hook handles this)

---

## 📋 Checklist for New Features

When adding auto-save to a new editor:

- [ ] Import `useAutoSave` hook
- [ ] Import `SaveStatusIndicator` component
- [ ] Define what data to save
- [ ] Choose appropriate draft type
- [ ] Add SaveStatusIndicator to UI
- [ ] Test auto-save after 2s of inactivity
- [ ] Test interval saves (30s)
- [ ] Test manual save button (if added)
- [ ] Test recovery after browser close
- [ ] Test with network failure

---

## 🔗 More Information

- **Full Documentation**: `src/lib/auto-save/README.md`
- **Implementation Summary**: `AUTO_SAVE_IMPLEMENTATION_SUMMARY.md`
- **Tests**: `src/**/__tests__/*.test.{ts,tsx}`

---

*Happy auto-saving! 💾*

