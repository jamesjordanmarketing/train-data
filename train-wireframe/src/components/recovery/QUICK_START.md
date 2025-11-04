# Recovery Wizard - Quick Start Guide

## Overview

The Recovery Wizard automatically detects and helps users recover lost data from browser crashes, network interruptions, and other failures.

## 5-Minute Setup

### 1. Import the RecoveryWizard

Add to your main App component:

```typescript
import { RecoveryWizard } from '@/components/recovery';

function App() {
  return (
    <>
      {/* Your app content */}
      
      {/* Recovery wizard - auto-detects on load */}
      <RecoveryWizard autoOpen={true} />
    </>
  );
}
```

**That's it!** The wizard will automatically:
- Detect recoverable data on app load
- Open if items are found
- Guide users through recovery

### 2. Add Manual Recovery (Optional)

Add a button to Settings or Help menu:

```typescript
import { detectRecoverableData } from '@/lib/recovery/detection';
import { toast } from 'sonner';

async function handleManualRecovery() {
  const items = await detectRecoverableData();
  
  if (items.length > 0) {
    toast.success(`Found ${items.length} recoverable items!`);
  } else {
    toast.info('No recoverable data found');
  }
}

// In your UI:
<Button onClick={handleManualRecovery}>
  Scan for Recoverable Data
</Button>
```

## What Gets Recovered?

### ✅ Draft Conversations
- Unsaved edits from browser crashes
- Partially completed conversations
- Auto-saved drafts less than 7 days old

### ✅ Incomplete Batches
- Interrupted batch generations
- Jobs stopped due to network errors
- Batches paused by user

### ✅ Available Backups
- Pre-delete backups
- Scheduled backups
- Manual backups not yet expired

### ✅ Failed Exports
- Exports that failed due to network issues
- Retryable export errors
- Recent export failures (< 24 hours)

## User Flow

### Step 1: Detection
The wizard automatically scans for recoverable data when the app loads.

### Step 2: Selection
Users see a list of recoverable items with:
- Item type and description
- How long ago it was created
- Priority badge (High Priority for important items)

Users can:
- Select/deselect individual items
- Select all / Deselect all
- Skip recovery entirely

### Step 3: Recovery
The wizard shows real-time progress:
- Overall progress bar (0-100%)
- Item-by-item status (Pending, Recovering, Success, Failed)
- Success/Failed/In Progress counts

### Step 4: Summary
Shows final results:
- Total items recovered
- Success/Failed/Skipped counts
- Next steps and recommendations
- Option to view failure details

## Configuration

### Auto-Open Behavior

```typescript
// Always auto-open when items found (default)
<RecoveryWizard autoOpen={true} />

// Never auto-open (manual trigger only)
<RecoveryWizard autoOpen={false} />
```

### Completion Callback

```typescript
<RecoveryWizard 
  autoOpen={true} 
  onComplete={() => {
    console.log('Recovery complete');
    // Refresh data, show notification, etc.
  }}
/>
```

## Testing

### Test Detection

```typescript
import { detectRecoverableData } from '@/lib/recovery/detection';

const items = await detectRecoverableData();
console.log('Recoverable items:', items);
```

### Test Recovery

```typescript
import { recoverItems } from '@/lib/recovery/executor';

const summary = await recoverItems(items, (item, progress) => {
  console.log(`Progress: ${progress}%`);
});

console.log('Summary:', summary);
```

## Common Scenarios

### Scenario 1: Browser Crash During Editing

**What happens:**
1. User is editing a conversation
2. Browser crashes or tab closes
3. Draft is auto-saved to IndexedDB

**Recovery:**
1. User reopens app
2. Recovery wizard automatically appears
3. Shows draft with "Just now" timestamp
4. User clicks "Recover Selected"
5. Draft is restored to editor

### Scenario 2: Network Failure During Batch

**What happens:**
1. User starts batch generation of 100 conversations
2. Network drops after 50 are complete
3. Checkpoint is saved with 50% progress

**Recovery:**
1. User reopens app or network reconnects
2. Recovery wizard shows "Batch: 50% complete"
3. User clicks "Recover Selected"
4. Batch resumes from checkpoint
5. Remaining 50 conversations are generated

### Scenario 3: Accidental Bulk Delete

**What happens:**
1. User accidentally deletes 20 conversations
2. System creates automatic backup
3. Backup is stored with 7-day expiration

**Recovery:**
1. User realizes mistake
2. Opens Settings → Data Recovery
3. Clicks "Scan for Recoverable Data"
4. Sees "Backup: 20 conversations (Pre-delete backup)"
5. Restores backup

## Accessibility

The Recovery Wizard is fully accessible:

- ✅ **Keyboard Navigation**: Tab through all controls
- ✅ **Screen Reader**: ARIA labels on all elements
- ✅ **Focus Management**: Focus trapped in dialog
- ✅ **High Contrast**: Supports high contrast mode
- ✅ **Mobile Friendly**: Responsive design

### Keyboard Shortcuts

- `Tab` / `Shift+Tab` - Navigate between items
- `Space` / `Enter` - Toggle item selection
- `Escape` - Close wizard (on summary step)

## Troubleshooting

### Wizard Doesn't Appear

**Checklist:**
- ✅ `autoOpen` is set to `true`
- ✅ There are actually recoverable items
- ✅ Check browser console for errors
- ✅ Verify IndexedDB is not disabled

### Recovery Fails

**Common Causes:**
- Network connectivity issues
- Insufficient storage space
- Corrupted data in IndexedDB
- Missing dependencies

**Solutions:**
1. Check network connection
2. Clear browser cache and try again
3. Check browser console for specific errors
4. Contact support with error logs

### Items Missing from List

**Possible Reasons:**
- Items are too old (drafts > 7 days)
- Items have already been recovered
- Items were manually deleted
- Filters are applied

**Solutions:**
1. Check age of items
2. Review recovery logs
3. Manually check IndexedDB/database

## Best Practices

### For Developers

1. **Test Failure Scenarios**: Simulate browser crashes, network failures
2. **Handle Partial Recovery**: Some items may fail, handle gracefully
3. **Log Everything**: Use `errorLogger` for debugging
4. **Show Progress**: Use progress callbacks to keep users informed
5. **Test Accessibility**: Test with keyboard and screen reader

### For Users

1. **Don't Skip Recovery**: Review items carefully before skipping
2. **Check Priority**: High priority items usually have more work
3. **Review Summary**: Check failure details if some items fail
4. **Contact Support**: If recovery consistently fails, report issue

## Examples

### Basic Integration

```typescript
// App.tsx
import { RecoveryWizard } from '@/components/recovery';

export default function App() {
  return (
    <div>
      <YourApp />
      <RecoveryWizard autoOpen={true} />
    </div>
  );
}
```

### Custom Completion Handler

```typescript
<RecoveryWizard 
  autoOpen={true}
  onComplete={() => {
    // Refresh conversations list
    refetchConversations();
    
    // Show success notification
    toast.success('Recovery complete!');
    
    // Log analytics
    analytics.track('recovery_completed');
  }}
/>
```

### Manual Trigger with Loading State

```typescript
const [isScanning, setIsScanning] = useState(false);

async function handleScan() {
  setIsScanning(true);
  
  try {
    const items = await detectRecoverableData();
    
    if (items.length > 0) {
      toast.success(`Found ${items.length} recoverable items!`);
      // Open wizard
    } else {
      toast.info('No recoverable data found');
    }
  } catch (error) {
    toast.error('Scan failed. Please try again.');
  } finally {
    setIsScanning(false);
  }
}
```

## Next Steps

1. ✅ Complete 5-minute setup
2. ✅ Test with sample failure scenarios
3. ✅ Add manual recovery button (optional)
4. ✅ Review accessibility features
5. ✅ Monitor recovery logs

## Related Documentation

- [Full Recovery System Documentation](../../lib/recovery/README.md)
- [Error Handling System](../errors/README.md)
- [Auto-Save System](../../lib/auto-save/README.md)

## Support

Need help? Check:
1. Browser console for errors
2. `error_logs` table in database
3. Recovery system tests for examples
4. Contact development team

