# Auto-Save & Draft Recovery System

Complete implementation of auto-save and draft recovery for the Interactive LoRA Conversation Generation platform.

## Overview

This system provides automatic draft saving with the following features:
- ✅ Automatic saving every 30 seconds (configurable)
- ✅ Debounced saves to avoid excessive writes while user is typing
- ✅ Retry logic with exponential backoff for failed saves
- ✅ IndexedDB storage with localStorage fallback
- ✅ Draft recovery on page load
- ✅ Conflict detection and resolution
- ✅ Save status indicators
- ✅ 24-hour draft expiration
- ✅ Automatic cleanup of expired drafts

## Architecture

### Components

```
train-wireframe/src/
├── hooks/
│   └── useAutoSave.ts              # React hook for auto-save
├── lib/auto-save/
│   ├── storage.ts                  # IndexedDB/localStorage wrapper
│   ├── recovery.ts                 # Recovery and conflict resolution
│   └── index.ts                    # Public API
└── components/auto-save/
    ├── RecoveryDialog.tsx          # Recovery UI component
    ├── SaveStatusIndicator.tsx     # Status indicator component
    └── index.ts                    # Public API
```

### Data Flow

```
User Edit
    ↓
useAutoSave Hook
    ↓ (debounced/interval)
onSave Callback
    ↓
draftStorage.save()
    ↓
IndexedDB / localStorage
    ↓
[Browser Close/Crash]
    ↓
Page Reload
    ↓
checkForRecoverableDrafts()
    ↓
RecoveryDialog
    ↓
recoverDraft()
    ↓
User's Data Restored
```

## Usage

### Basic Auto-Save Hook

```typescript
import { useAutoSave } from '@/hooks/useAutoSave';
import { SaveStatusIndicator } from '@/components/auto-save';
import { saveDraft } from '@/lib/auto-save';

function ConversationEditor({ conversation }) {
  const [content, setContent] = useState(conversation.content);
  const [persona, setPersona] = useState(conversation.persona);
  
  const { status, lastSaved, saveDraft: saveNow } = useAutoSave(
    {
      conversationId: conversation.id,
      content,
      persona,
    },
    async (data) => {
      // Save to IndexedDB
      await saveDraft('conversation', data.conversationId, {
        content: data.content,
        persona: data.persona,
      });
      
      // Optionally save to server (best effort)
      try {
        await api.saveConversation(data);
      } catch (err) {
        console.warn('Server save failed, draft saved locally');
      }
    },
    {
      interval: 30000,      // Auto-save every 30 seconds
      debounceDelay: 2000,  // Wait 2s after typing stops
      enabled: true,
      saveOnUnmount: true,
      maxRetries: 3,
    }
  );
  
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2>Edit Conversation</h2>
        <SaveStatusIndicator 
          status={status} 
          lastSaved={lastSaved} 
        />
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      
      <button onClick={saveNow}>Save Now</button>
    </div>
  );
}
```

### Recovery Dialog

Add to your app layout to enable automatic recovery:

```typescript
import { RecoveryDialog } from '@/components/auto-save';

function AppLayout({ children }) {
  const router = useRouter();
  
  return (
    <>
      <RecoveryDialog
        onRecover={(item, data) => {
          // Navigate to recovered item
          const id = item.id.split('_')[1];
          router.push(`/${item.type}s/${id}`);
          
          // Restore data in your state management
          restoreData(item.type, id, data);
        }}
        onDiscard={(item) => {
          console.log('Draft discarded:', item.id);
        }}
        getServerData={async (itemId, type) => {
          // Optional: Fetch server data for conflict detection
          const id = itemId.split('_')[1];
          const serverData = await api.get(`/${type}s/${id}`);
          return {
            data: serverData,
            updatedAt: new Date(serverData.updatedAt),
          };
        }}
      />
      
      {children}
    </>
  );
}
```

## API Reference

### `useAutoSave<T>(data, onSave, config)`

React hook for automatic draft saving.

**Parameters:**
- `data: T` - Data to auto-save (any serializable object)
- `onSave: (data: T) => Promise<void>` - Async save function
- `config: AutoSaveConfig` - Configuration options

**Returns:**
```typescript
{
  status: 'idle' | 'saving' | 'saved' | 'error',
  lastSaved: Date | null,
  error: Error | null,
  saveDraft: () => Promise<void>,
  clearDraft: () => Promise<void>,
  resetError: () => void,
}
```

**Configuration:**
```typescript
{
  interval?: number;         // Default: 30000 (30 seconds)
  debounceDelay?: number;    // Default: 2000 (2 seconds)
  maxRetries?: number;       // Default: 3
  enabled?: boolean;         // Default: true
  saveOnUnmount?: boolean;   // Default: true
}
```

### Storage API

```typescript
// Save draft
await saveDraft('conversation', '123', { content: 'test' });

// Load draft
const data = await loadDraft<DataType>('conversation', '123');

// Check for recoverable drafts
const items = await checkForRecoverableDrafts();

// Recover specific draft
const data = await recoverDraft('conversation_123');

// Discard draft
await discardDraft('conversation_123');
```

### Conflict Resolution

```typescript
import { detectConflict, resolveConflict, ConflictResolution } from '@/lib/auto-save';

// Detect conflict
const conflict = await detectConflict(
  'conversation_123',
  serverData,
  serverUpdatedAt
);

if (conflict) {
  // Resolve conflict
  const resolved = resolveConflict(
    conflict,
    ConflictResolution.USE_DRAFT  // or USE_SERVER
  );
}
```

## Draft ID Format

Draft IDs follow the pattern: `{type}_{id}`

Examples:
- `conversation_abc123`
- `batch_xyz789`
- `template_def456`

Supported types:
- `conversation`
- `batch`
- `template`
- `other`

## Storage

### IndexedDB Schema

```
Database: TrainingDataDrafts
ObjectStore: drafts
  - keyPath: id
  - Indexes:
    - expiresAt (for cleanup queries)
    - savedAt (for sorting)

Draft Structure:
{
  id: string,
  data: any,
  savedAt: string (ISO),
  expiresAt: string (ISO),
  version: number
}
```

### Fallback Strategy

1. **Modern browsers**: Uses IndexedDB
2. **Older browsers**: Falls back to localStorage
3. **Server-side**: Uses no-op storage (returns null)

## Features

### 1. Debounced Saving

Waits for user to stop typing before saving, reducing unnecessary saves:

```typescript
useAutoSave(data, onSave, {
  debounceDelay: 2000  // Wait 2s after last change
});
```

### 2. Interval-Based Saving

Saves at regular intervals even if user is still typing:

```typescript
useAutoSave(data, onSave, {
  interval: 30000  // Save every 30 seconds
});
```

### 3. Retry Logic

Automatically retries failed saves with exponential backoff:

```typescript
useAutoSave(data, onSave, {
  maxRetries: 3  // Retry up to 3 times
});
```

### 4. Save on Unmount

Saves data when component unmounts (best effort):

```typescript
useAutoSave(data, onSave, {
  saveOnUnmount: true
});
```

### 5. Conflict Detection

Detects when server data is newer than draft:

```typescript
const conflict = await detectConflict(
  draftId,
  serverData,
  serverUpdatedAt
);

if (conflict) {
  // Show conflict resolution UI
}
```

### 6. Automatic Cleanup

Expired drafts are automatically cleaned up every hour.

## Testing

### Unit Tests

```bash
npm test hooks/useAutoSave.test.ts
npm test lib/auto-save/storage.test.ts
npm test lib/auto-save/recovery.test.ts
npm test components/auto-save/RecoveryDialog.test.tsx
npm test components/auto-save/SaveStatusIndicator.test.tsx
```

### Integration Tests

```bash
npm test __tests__/auto-save.integration.test.ts
```

### Manual Testing Checklist

- [ ] Edit conversation, wait 2s, verify save triggered
- [ ] Edit conversation, wait 30s, verify interval save
- [ ] Close browser, reopen, verify recovery dialog
- [ ] Edit in multiple tabs, verify conflict detection
- [ ] Disconnect network, verify save retry
- [ ] Clear IndexedDB, verify localStorage fallback
- [ ] Wait 24+ hours, verify draft expired
- [ ] Manually save, verify auto-save doesn't overwrite

## Error Handling

All operations are logged using the ErrorLogger:

```typescript
// Successful saves
errorLogger.debug('Auto-save successful', { component, dataSize });

// Failed saves
errorLogger.error('Auto-save failed', error, { component, retries });

// Conflict detection
errorLogger.warn('Conflict detected', { draftId, timestamps });
```

## Performance Considerations

### Debouncing
- Prevents excessive saves during rapid typing
- Default: 2 second delay after last change

### Interval Limiting
- Ensures regular saves without overwhelming storage
- Default: 30 second intervals

### Storage Quota
- IndexedDB has larger quota than localStorage
- Automatic fallback to localStorage if IndexedDB fails

### Cleanup
- Expired drafts cleaned up hourly
- Reduces storage usage over time

## Browser Compatibility

- **IndexedDB**: Chrome 24+, Firefox 16+, Safari 10+, Edge 12+
- **localStorage**: All modern browsers
- **Server-side**: No-op storage (safe for SSR)

## Security Considerations

1. **Local Storage Only**: Drafts stored in browser, not transmitted
2. **Auto-Expiration**: Drafts expire after 24 hours
3. **User Control**: Users can discard drafts at any time
4. **No Sensitive Data**: Avoid storing passwords or tokens

## Troubleshooting

### Drafts Not Saving

1. Check console for errors
2. Verify `enabled: true` in config
3. Check browser storage quota
4. Ensure `onSave` function doesn't throw errors

### Recovery Dialog Not Showing

1. Verify `checkForRecoverableDrafts()` returns items
2. Check if drafts have expired (24 hours)
3. Ensure RecoveryDialog is mounted in app layout

### Conflicts Not Detected

1. Verify `getServerData` callback is provided
2. Check server timestamps are correct
3. Ensure draft ID format matches: `{type}_{id}`

## Future Enhancements

Potential improvements for v2:
- [ ] Merge strategy for conflict resolution
- [ ] Cross-device sync via server
- [ ] Diff visualization for conflicts
- [ ] Offline queue for failed saves
- [ ] Compression for large drafts
- [ ] Custom expiration per draft type

## License

Part of the Interactive LoRA Conversation Generation Platform.

