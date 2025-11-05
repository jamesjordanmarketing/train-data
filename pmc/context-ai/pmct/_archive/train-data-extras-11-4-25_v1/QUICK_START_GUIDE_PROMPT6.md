# Quick Start Guide: Batch Resume & Backup System

## 5-Minute Integration

### Step 1: Add Resume Dialog to App Layout

```tsx
// app/layout.tsx or _app.tsx
import { ResumeDialog } from '@/components/batch/ResumeDialog';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ResumeDialog
          onResume={(checkpoint) => {
            // Navigate to batch page or auto-resume
            console.log('Resume batch:', checkpoint.jobId);
          }}
        />
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Implement Batch Processing

```tsx
import { resumeBatchProcessing } from '@/lib/batch/processor';
import { BatchSummary } from '@/components/batch/BatchSummary';

function MyBatchPage() {
  const [progress, setProgress] = useState(null);

  async function runBatch() {
    const items = [
      { id: '1', topic: 'AI', parameters: {}, status: 'pending' },
      { id: '2', topic: 'ML', parameters: {}, status: 'pending' },
    ];

    await resumeBatchProcessing(
      'my-batch-job',
      items,
      async (item) => {
        // Your processing logic
        await processItem(item);
      },
      (update) => setProgress(update) // Progress callback
    );
  }

  return (
    <div>
      {progress && <BatchSummary progress={progress} />}
      <button onClick={runBatch}>Start Batch</button>
    </div>
  );
}
```

### Step 3: Add Pre-Delete Backup

```tsx
import { PreDeleteBackup } from '@/components/backup/PreDeleteBackup';

function MyListPage() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBackup, setShowBackup] = useState(false);

  return (
    <>
      <button onClick={() => setShowBackup(true)}>
        Delete ({selectedIds.length})
      </button>

      <PreDeleteBackup
        isOpen={showBackup}
        onClose={() => setShowBackup(false)}
        conversationIds={selectedIds}
        onConfirmDelete={async () => {
          await deleteItems(selectedIds);
        }}
      />
    </>
  );
}
```

### Step 4: Configure Environment

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Step 5: Deploy Database Tables

Tables should already exist from E10 setup:
- `batch_checkpoints`
- `backup_exports`

If not, run migrations from E10.

## Done! 🎉

Your app now has:
- ✅ Automatic batch resume on page load
- ✅ Checkpoint-based progress saving
- ✅ Pre-delete backup with 7-day retention
- ✅ Download capability for backups

## Common Use Cases

### Use Case 1: Resume After Browser Crash

**Problem:** User closes browser during batch processing.

**Solution:** Automatic!
1. User returns to app
2. `ResumeDialog` detects incomplete batch
3. User clicks "Resume"
4. Processing continues from last checkpoint

### Use Case 2: Bulk Delete with Safety

**Problem:** User wants to delete 100 conversations but might need them later.

**Solution:**
1. User selects conversations
2. Clicks "Delete"
3. `PreDeleteBackup` dialog appears
4. User creates backup (optional)
5. Downloads backup (optional)
6. Confirms delete
7. Backup retained for 7 days

### Use Case 3: Scheduled Backup Cleanup

**Problem:** Backups accumulate and use disk space.

**Solution:**
```typescript
// Add to your cron job / scheduled task
import { cleanupExpiredBackups } from '@/lib/backup/storage';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  const deleted = await cleanupExpiredBackups();
  console.log(`Cleaned up ${deleted} expired backups`);
});
```

## API Usage

### Create Backup Programmatically

```typescript
const response = await fetch('/api/backup/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    conversationIds: ['conv-1', 'conv-2'],
    reason: 'manual_backup',
  }),
});

const { backupId, expiresAt } = await response.json();
console.log(`Backup created: ${backupId}, expires: ${expiresAt}`);
```

### Download Backup

```typescript
// Simple download
window.open(`/api/backup/download/${backupId}`, '_blank');

// Or fetch and process
const response = await fetch(`/api/backup/download/${backupId}`);
const backupData = await response.json();
console.log('Backup contains:', backupData.conversations.length, 'conversations');
```

## Troubleshooting

### Issue: Resume Dialog Not Appearing

**Check:**
1. Is `ResumeDialog` mounted in app layout?
2. Are there incomplete checkpoints in database?
3. Check browser console for errors

**Fix:**
```sql
-- Check for incomplete checkpoints
SELECT * FROM batch_checkpoints WHERE progress_percentage < 100;
```

### Issue: Backup Creation Fails

**Check:**
1. Is Supabase service key configured?
2. Does backup directory exist and have write permissions?
3. Are conversation IDs valid?

**Fix:**
```bash
# Create backup directory
mkdir -p backups
chmod 755 backups
```

### Issue: Checkpoint Not Saving

**Check:**
1. Is transaction wrapper working? (from Prompt 4)
2. Check database connection
3. Verify `job_id` format

**Fix:**
```typescript
// Verify checkpoint save manually
import { saveCheckpoint } from '@/lib/batch/checkpoint';

await saveCheckpoint('test-job', ['item-1'], [], 10);
// Check database for new checkpoint
```

## Advanced Usage

### Custom Progress Display

```tsx
import { BatchProgress } from '@/lib/batch/checkpoint';

function CustomProgress({ progress }: { progress: BatchProgress }) {
  return (
    <div>
      <p>Completed: {progress.completedItems}/{progress.totalItems}</p>
      <p>Failed: {progress.failedItems}</p>
      <p>Success Rate: {(progress.completedItems / progress.totalItems * 100).toFixed(1)}%</p>
    </div>
  );
}
```

### Retry Failed Items

```typescript
import { loadCheckpoint } from '@/lib/batch/checkpoint';
import { resumeBatchProcessing } from '@/lib/batch/processor';

async function retryFailed(jobId: string) {
  const checkpoint = await loadCheckpoint(jobId);
  
  if (!checkpoint) return;

  // Get failed items
  const failedItemIds = checkpoint.failedItems.map(f => f.itemId);
  
  // Recreate items for retry
  const retryItems = failedItemIds.map(id => ({
    id,
    topic: 'Retry',
    parameters: {},
    status: 'pending' as const,
  }));

  // Clear failed items from checkpoint and retry
  // Note: You'll need to manually update checkpoint or create new job
  await resumeBatchProcessing(
    `${jobId}-retry`,
    retryItems,
    processItem
  );
}
```

### Custom Backup Format

```typescript
import { createBackup } from '@/lib/backup/storage';

// Backup with custom metadata
await createBackup(
  conversationIds,
  userId,
  'weekly_archive' // Custom reason
);

// Backup file will contain:
// {
//   version: "1.0",
//   createdAt: "...",
//   backupReason: "weekly_archive",
//   conversations: [...]
// }
```

## Performance Tips

1. **Large Batches (1000+ items):** Consider batching checkpoint saves:
   ```typescript
   // Save checkpoint every 10 items instead of every item
   if (completedCount % 10 === 0) {
     await saveCheckpoint(jobId, completed, failed, total);
   }
   ```

2. **Large Backups:** Compress before download:
   ```typescript
   import { gzip } from 'zlib';
   import { promisify } from 'util';
   
   const gzipAsync = promisify(gzip);
   const compressed = await gzipAsync(JSON.stringify(backupData));
   ```

3. **Database Load:** Schedule cleanup during off-peak hours:
   ```typescript
   // Run at 2 AM server time
   cron.schedule('0 2 * * *', cleanupExpiredBackups);
   ```

## Testing

### Test Batch Resume

```bash
# 1. Start batch (don't let it complete)
# 2. Kill process/close browser
# 3. Restart app
# 4. Verify ResumeDialog appears
# 5. Click Resume
# 6. Verify processing continues from checkpoint
```

### Test Backup Creation

```bash
# 1. Select conversations
# 2. Click Delete
# 3. Enable backup option
# 4. Verify progress bar
# 5. Download backup
# 6. Verify JSON structure
# 7. Confirm delete
# 8. Verify backup still available
```

## Migration from Non-Checkpoint System

If upgrading from a system without checkpoints:

```typescript
// 1. Add ResumeDialog to layout (won't affect existing code)
// 2. Replace batch processing:

// OLD:
for (const item of items) {
  await processItem(item);
}

// NEW:
await resumeBatchProcessing(jobId, items, processItem);
```

No other changes needed! The system is backward compatible.

## Support

- **Documentation:** See `train-wireframe/src/lib/batch/README.md`
- **Examples:** See `train-wireframe/src/examples/BatchGenerationExample.tsx`
- **Tests:** Run `npm test` to verify installation

## Next Steps

1. ✅ Integrate Resume Dialog
2. ✅ Update batch processing to use `resumeBatchProcessing()`
3. ✅ Add Pre-Delete Backup to delete operations
4. ✅ Schedule backup cleanup job
5. ✅ Test in staging environment
6. ✅ Monitor logs for errors
7. ✅ Deploy to production

Happy coding! 🚀

