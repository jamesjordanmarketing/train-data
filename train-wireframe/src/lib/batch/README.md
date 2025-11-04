# Batch Job Resume & Backup System

## Overview

The Batch Job Resume & Backup System provides robust checkpoint-based processing for batch conversation generation and pre-delete backup functionality. This system ensures that users never lose progress due to interruptions and can safely recover from accidental deletions.

## Features

### Batch Resume
- ✅ Automatic checkpoint saving after each successful conversation generation
- ✅ Resume incomplete batches from last checkpoint
- ✅ Idempotent processing (no duplicate generations)
- ✅ Failed item tracking with retry capability
- ✅ Progress tracking with real-time updates
- ✅ Automatic cleanup of completed checkpoints

### Pre-Delete Backup
- ✅ Optional backup creation before bulk delete operations
- ✅ JSON export of conversation data with full structure preservation
- ✅ 7-day retention with automatic cleanup
- ✅ Downloadable backup files
- ✅ Failed backup prevents delete operation

## Architecture

### File Structure

```
train-wireframe/src/lib/batch/
├── checkpoint.ts              # Checkpoint save/load/cleanup
├── processor.ts               # Idempotent batch processing
└── __tests__/
    ├── checkpoint.test.ts
    └── processor.test.ts

train-wireframe/src/components/batch/
├── ResumeDialog.tsx           # Resume UI
└── BatchSummary.tsx           # Progress display

src/lib/backup/
└── storage.ts                 # Backup creation and cleanup

train-wireframe/src/components/backup/
├── PreDeleteBackup.tsx        # Pre-delete backup dialog
└── BackupProgress.tsx         # Backup progress indicator

src/app/api/backup/
├── create/route.ts            # POST /api/backup/create
└── download/[id]/route.ts     # GET /api/backup/download/:id
```

### Database Schema

#### batch_checkpoints
```sql
CREATE TABLE batch_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  completed_items JSONB NOT NULL DEFAULT '[]',
  failed_items JSONB NOT NULL DEFAULT '[]',
  progress_percentage INTEGER DEFAULT 0,
  last_checkpoint_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### backup_exports
```sql
CREATE TABLE backup_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT,
  conversation_ids JSONB NOT NULL,
  backup_reason VARCHAR(100),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Usage

### Batch Resume

#### 1. Integrate Resume Dialog

Add the `ResumeDialog` to your app layout to detect incomplete batches on page load:

```tsx
// app/layout.tsx or _app.tsx
import { ResumeDialog } from '@/components/batch/ResumeDialog';

export default function Layout({ children }) {
  const handleResume = (checkpoint: BatchCheckpoint) => {
    // Navigate to batch generation page with checkpoint
    router.push(`/batch/resume/${checkpoint.jobId}`);
  };

  return (
    <>
      <ResumeDialog onResume={handleResume} />
      {children}
    </>
  );
}
```

#### 2. Implement Batch Processing with Checkpoints

```tsx
import { resumeBatchProcessing } from '@/lib/batch/processor';
import { saveCheckpoint, cleanupCheckpoint } from '@/lib/batch/checkpoint';
import { BatchSummary } from '@/components/batch/BatchSummary';

function BatchGenerationPage() {
  const jobId = 'batch-' + Date.now();
  const [progress, setProgress] = useState<BatchProgress | null>(null);

  const items: BatchItem[] = [
    { id: '1', topic: 'AI Ethics', parameters: {}, status: 'pending' },
    { id: '2', topic: 'Machine Learning', parameters: {}, status: 'pending' },
    // ... more items
  ];

  async function startBatch() {
    try {
      const result = await resumeBatchProcessing(
        jobId,
        items,
        async (item) => {
          // Your conversation generation logic
          await generateConversation(item);
        },
        (progressUpdate) => {
          // Update UI with progress
          setProgress({
            totalItems: items.length,
            completedItems: progressUpdate.completed,
            failedItems: progressUpdate.failed,
            pendingItems: items.length - progressUpdate.completed - progressUpdate.failed,
            progressPercentage: Math.round((progressUpdate.completed / items.length) * 100),
          });
        }
      );

      // Cleanup checkpoint after completion
      await cleanupCheckpoint(jobId);

      toast.success(`Batch completed: ${result.completed.length} succeeded, ${result.failed.length} failed`);
    } catch (error) {
      console.error('Batch processing failed:', error);
      toast.error('Batch processing failed');
    }
  }

  return (
    <div>
      {progress && <BatchSummary progress={progress} />}
      <button onClick={startBatch}>Start Batch</button>
    </div>
  );
}
```

#### 3. Resume from Checkpoint

```tsx
import { loadCheckpoint } from '@/lib/batch/checkpoint';
import { resumeBatchProcessing } from '@/lib/batch/processor';

async function resumeExistingBatch(jobId: string) {
  // Load checkpoint
  const checkpoint = await loadCheckpoint(jobId);
  
  if (!checkpoint) {
    toast.error('Checkpoint not found');
    return;
  }

  // Resume processing (automatically skips completed items)
  const result = await resumeBatchProcessing(
    jobId,
    allItems,
    async (item) => await generateConversation(item),
    (progress) => updateUI(progress)
  );

  console.log(`Resumed batch: ${result.completed.length} total completed`);
}
```

### Pre-Delete Backup

#### 1. Integrate Backup Dialog

```tsx
import { PreDeleteBackup } from '@/components/backup/PreDeleteBackup';

function ConversationListPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBackupDialog, setShowBackupDialog] = useState(false);

  async function handleDelete() {
    // Perform actual delete operation
    await deleteConversations(selectedIds);
    setSelectedIds([]);
  }

  return (
    <div>
      {/* Conversation list with selection */}
      
      <button 
        onClick={() => setShowBackupDialog(true)}
        disabled={selectedIds.length === 0}
      >
        Delete Selected ({selectedIds.length})
      </button>

      <PreDeleteBackup
        isOpen={showBackupDialog}
        onClose={() => setShowBackupDialog(false)}
        conversationIds={selectedIds}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
}
```

#### 2. Create Backup via API

```typescript
// Client-side backup creation
async function createBackupManually(conversationIds: string[]) {
  try {
    const response = await fetch('/api/backup/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        conversationIds,
        reason: 'manual_backup',
      }),
    });

    if (!response.ok) {
      throw new Error('Backup creation failed');
    }

    const { backupId, expiresAt } = await response.json();
    
    toast.success(`Backup created: ${backupId}`);
    return backupId;
  } catch (error) {
    console.error('Backup creation failed:', error);
    throw error;
  }
}
```

#### 3. Download Backup

```typescript
function downloadBackup(backupId: string) {
  const downloadUrl = `/api/backup/download/${backupId}`;
  window.open(downloadUrl, '_blank');
}
```

#### 4. Schedule Backup Cleanup

Create a cron job or scheduled task to run daily:

```typescript
// src/lib/backup/cleanup-job.ts
import { cleanupExpiredBackups } from './storage';
import { errorLogger } from '../../train-wireframe/src/lib/errors/error-logger';

export async function runBackupCleanup() {
  try {
    const deletedCount = await cleanupExpiredBackups();
    errorLogger.info('Backup cleanup completed', { deletedCount });
    return deletedCount;
  } catch (error) {
    errorLogger.error('Backup cleanup failed', error);
    throw error;
  }
}

// Schedule with your preferred scheduler (e.g., node-cron, Vercel Cron)
// cron.schedule('0 2 * * *', runBackupCleanup); // Daily at 2 AM
```

## API Endpoints

### POST /api/backup/create

Creates a backup of specified conversations.

**Request:**
```json
{
  "conversationIds": ["conv-1", "conv-2", "conv-3"],
  "reason": "bulk_delete"
}
```

**Response:**
```json
{
  "backupId": "backup-1730720400123-abc123",
  "filePath": "/backups/backup-1730720400123-abc123.json",
  "expiresAt": "2025-11-11T10:00:00.000Z",
  "conversationCount": 3
}
```

### GET /api/backup/download/:backupId

Downloads a backup file.

**Response:** JSON file with backup data

**Backup File Format:**
```json
{
  "version": "1.0",
  "createdAt": "2025-11-04T10:00:00.000Z",
  "backupReason": "bulk_delete",
  "conversations": [
    {
      "id": "conv-1",
      "content": "Conversation content",
      "persona": "Expert",
      "conversation_turns": [
        {
          "id": "turn-1",
          "content": "Turn content",
          "role": "user",
          "sequence": 1
        }
      ]
    }
  ]
}
```

## Error Handling

All functions integrate with the ErrorLogger from Prompt 1:

```typescript
import { errorLogger } from '@/lib/errors/error-logger';
import { DatabaseError, ErrorCode } from '@/lib/errors';

// Errors are automatically logged with context
try {
  await saveCheckpoint(jobId, completedItems, failedItems, totalItems);
} catch (error) {
  // Error is already logged by saveCheckpoint
  // Handle error in UI
  toast.error('Failed to save checkpoint');
}
```

## Testing

### Unit Tests

Run unit tests:
```bash
npm test src/lib/batch/__tests__
npm test src/lib/backup/__tests__
```

### Integration Tests

Run integration tests:
```bash
npm test src/__tests__/integration/batch-resume.integration.test.ts
npm test src/__tests__/integration/backup-flow.integration.test.ts
```

### Manual Testing Checklist

**Batch Resume:**
- [ ] Start batch, interrupt midway, verify checkpoint saved
- [ ] Reload page, verify resume dialog appears
- [ ] Resume batch, verify skips completed items
- [ ] Complete batch, verify checkpoint cleaned up
- [ ] Test with failed items, verify retry on resume

**Backup:**
- [ ] Select conversations, initiate delete
- [ ] Verify backup dialog appears
- [ ] Create backup, verify progress indicator
- [ ] Download backup, verify file contents
- [ ] Complete delete, verify backup available
- [ ] Wait for expiration (or trigger cleanup), verify backup deleted

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Configure backup retention
BACKUP_RETENTION_DAYS=7
BACKUP_DIRECTORY=/var/backups
```

### Checkpoint Configuration

Checkpoints are automatically saved after each batch item. No configuration required.

### Backup Retention

Backups expire after 7 days by default. To change:

```typescript
// src/lib/backup/storage.ts
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 14); // Change to 14 days
```

## Performance Considerations

1. **Checkpoint Frequency**: Checkpoints are saved after each item to ensure minimal data loss. For very large batches (1000+ items), consider batching checkpoint saves (e.g., every 10 items).

2. **Backup File Size**: Large conversation sets (100+ conversations with many turns) can result in large backup files. Consider:
   - Compression for storage
   - Streaming for large downloads
   - Pagination for backup creation

3. **Database Cleanup**: Schedule `cleanupExpiredBackups()` during low-traffic hours to minimize impact.

## Troubleshooting

### Checkpoint Not Found After Resume

**Problem:** Resume dialog doesn't detect checkpoint.

**Solution:**
- Verify checkpoint was saved: Check `batch_checkpoints` table
- Verify `job_id` matches between save and load
- Check for transaction failures in logs

### Backup Creation Fails

**Problem:** Backup creation fails with database error.

**Solution:**
- Verify Supabase service role key is set
- Check conversation IDs are valid
- Verify backup directory has write permissions
- Check disk space

### Failed Items Not Retrying

**Problem:** Failed items remain failed on resume.

**Solution:**
- Failed items are intentionally skipped to prevent infinite retries
- To retry failed items, manually clear them from the checkpoint or create a new batch

## Migration Guide

If upgrading from a system without checkpoints:

1. Deploy database migrations (batch_checkpoints, backup_exports tables)
2. Deploy backend code (API endpoints, storage functions)
3. Deploy frontend code (dialogs, components)
4. Test resume flow with small batch
5. Test backup flow with test data
6. Schedule backup cleanup job
7. Monitor logs for errors

## Support

For issues or questions:
- Check logs via ErrorLogger
- Review integration tests for usage examples
- Refer to acceptance criteria in original prompt

