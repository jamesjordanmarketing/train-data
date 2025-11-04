# Recovery System

The Recovery System provides automatic detection and guided recovery of lost data across all failure types in the Training Data Generation platform.

## Overview

The recovery system consists of three main components:

1. **Detection System** (`detection.ts`) - Scans for recoverable data from multiple sources
2. **Execution System** (`executor.ts`) - Handles the actual recovery of items
3. **Recovery Wizard UI** (`components/recovery/`) - Provides guided recovery workflow

## Features

- **Automatic Detection**: Automatically scans for recoverable data on app load
- **Multi-Source Recovery**: Detects drafts, incomplete batches, backups, and failed exports
- **Priority Scoring**: Ranks items by recency and work amount (70% recency, 30% work)
- **Guided Workflow**: Step-by-step wizard for selecting and recovering items
- **Partial Recovery**: Handles scenarios where some items succeed and others fail
- **Progress Tracking**: Real-time progress updates during recovery
- **Audit Trail**: All recovery operations are logged

## Quick Start

### Basic Usage

The recovery wizard is automatically integrated into the application and will open when recoverable items are detected:

```typescript
import { RecoveryWizard } from '@/components/recovery';

// In your App component
<RecoveryWizard autoOpen={true} />
```

### Manual Recovery Trigger

Users can manually trigger recovery from the Settings page:

```typescript
import { detectRecoverableData } from '@/lib/recovery/detection';

async function checkForRecoverableData() {
  const items = await detectRecoverableData();
  
  if (items.length > 0) {
    // Show recovery wizard
    console.log(`Found ${items.length} recoverable items`);
  } else {
    console.log('No recoverable data found');
  }
}
```

## Recovery Item Types

### 1. Draft Conversations

Recovers unsaved or partially saved conversation edits stored in IndexedDB.

**Detection Criteria**:
- Drafts exist in IndexedDB
- Draft is less than 7 days old
- Draft has at least 1 turn

**Recovery Process**:
1. Load draft from IndexedDB
2. Restore to conversation editor
3. Delete draft from storage

**Priority Calculation**:
- High priority for recent drafts (< 1 hour)
- Medium priority for drafts with 5+ turns
- Low priority for old drafts (> 24 hours)

### 2. Incomplete Batches

Recovers batch generation jobs that were interrupted.

**Detection Criteria**:
- Checkpoint exists in database
- Progress < 100%
- Last checkpoint < 24 hours old

**Recovery Process**:
1. Load batch configuration
2. Resume from last checkpoint
3. Continue processing remaining items

**Priority Calculation**:
- High priority for batches with > 50% completion
- Medium priority for batches with 10-50% completion
- Low priority for batches with < 10% completion

### 3. Available Backups

Recovers from pre-delete or scheduled backups.

**Detection Criteria**:
- Backup exists in database
- Backup has not expired
- Backup contains at least 1 conversation

**Recovery Process**:
1. Load backup file from storage
2. Parse conversation data
3. Import into database

**Priority Calculation**:
- High priority for backups with 20+ conversations
- Medium priority for backups with 5-19 conversations
- Low priority for backups with < 5 conversations

### 4. Failed Exports

Retries exports that failed due to transient errors.

**Detection Criteria**:
- Export status is 'failed'
- Export is less than 24 hours old
- Export can be retried (not permanent failure)

**Recovery Process**:
1. Load export configuration
2. Retry export operation
3. Update export status

**Priority Calculation**:
- High priority for exports with 10+ conversations
- Medium priority for exports with 2-9 conversations
- Low priority for exports with 1 conversation

## Priority Scoring Algorithm

The priority score (0-100) is calculated using a weighted formula:

```typescript
Priority = (Recency Factor × 0.7) + (Work Factor × 0.3)

Where:
- Recency Factor = max(0, min(100, 100 - (age_hours / 1) × 10))
- Work Factor = (work_amount / max_work_amount) × 100
```

**Examples**:
- Draft created 30 minutes ago with 10 turns: Priority ≈ 95
- Batch from 2 hours ago with 60% completion: Priority ≈ 78
- Backup from 1 day ago with 50 conversations: Priority ≈ 30

## API Reference

### Detection Functions

#### `detectRecoverableData()`

Detects all recoverable data across all sources.

```typescript
async function detectRecoverableData(): Promise<RecoverableItem[]>
```

**Returns**: Array of recoverable items sorted by priority (highest first)

**Example**:
```typescript
const items = await detectRecoverableData();
console.log(`Found ${items.length} recoverable items`);
```

#### `filterItemsByType(items, type)`

Filters recoverable items by type.

```typescript
function filterItemsByType(
  items: RecoverableItem[],
  type: RecoverableItemType
): RecoverableItem[]
```

**Example**:
```typescript
const drafts = filterItemsByType(items, RecoverableItemType.DRAFT_CONVERSATION);
```

#### `getStatusCounts(items)`

Gets count of items by status.

```typescript
function getStatusCounts(
  items: RecoverableItem[]
): Record<RecoveryStatus, number>
```

**Example**:
```typescript
const counts = getStatusCounts(items);
console.log(`${counts.SUCCESS} items recovered successfully`);
```

### Execution Functions

#### `recoverItem(item)`

Recovers a single item.

```typescript
async function recoverItem(item: RecoverableItem): Promise<RecoveryResult>
```

**Example**:
```typescript
const result = await recoverItem(item);
if (result.success) {
  console.log('Item recovered successfully');
}
```

#### `recoverItems(items, onProgress?)`

Recovers multiple items with optional progress callback.

```typescript
async function recoverItems(
  items: RecoverableItem[],
  onProgress?: (item: RecoverableItem, progress: number) => void
): Promise<RecoverySummary>
```

**Example**:
```typescript
const summary = await recoverItems(items, (item, progress) => {
  console.log(`Recovering: ${progress}% complete`);
});

console.log(`Recovered ${summary.successCount} of ${summary.totalItems} items`);
```

## Types

### RecoverableItem

```typescript
interface RecoverableItem {
  id: string;                    // Unique identifier
  type: RecoverableItemType;     // Type of item
  timestamp: string;             // ISO date string
  description: string;           // User-friendly description
  priority: number;              // 0-100, higher = more important
  data: unknown;                 // Type-specific recovery data
  status: RecoveryStatus;        // Current status
  error?: string;                // Error message if recovery failed
}
```

### RecoveryStatus

```typescript
enum RecoveryStatus {
  PENDING = 'PENDING',           // Not yet processed
  RECOVERING = 'RECOVERING',     // Currently recovering
  SUCCESS = 'SUCCESS',           // Recovered successfully
  FAILED = 'FAILED',             // Recovery failed
  SKIPPED = 'SKIPPED',           // Skipped by user
}
```

### RecoverySummary

```typescript
interface RecoverySummary {
  totalItems: number;            // Total items processed
  successCount: number;          // Successfully recovered
  failedCount: number;           // Failed to recover
  skippedCount: number;          // Skipped by user
  results: RecoveryResult[];     // Detailed results
  timestamp: string;             // When recovery completed
}
```

## Error Handling

The recovery system uses the centralized error handling infrastructure:

```typescript
import { errorLogger } from '@/lib/errors/error-logger';

try {
  const items = await detectRecoverableData();
  // Process items...
} catch (error) {
  errorLogger.error('Recovery detection failed', error);
  // Show user-friendly error message
}
```

All recovery operations are automatically logged to the `error_logs` table for audit purposes.

## Testing

### Unit Tests

```bash
npm test train-wireframe/src/__tests__/recovery/detection.test.ts
npm test train-wireframe/src/__tests__/recovery/executor.test.ts
```

### Component Tests

```bash
npm test train-wireframe/src/__tests__/components/RecoveryWizard.test.tsx
```

### Integration Tests

```bash
npm test train-wireframe/src/__tests__/integration/recovery-flows.test.ts
```

## Configuration

Configure recovery behavior via environment variables:

```env
# Enable automatic recovery detection on app load
ENABLE_AUTO_RECOVERY=true

# How often to check for recoverable data (milliseconds)
RECOVERY_DETECTION_INTERVAL=300000  # 5 minutes

# How long to keep recovery logs (days)
RECOVERY_LOG_RETENTION_DAYS=90
```

## Troubleshooting

### Recovery Wizard Not Appearing

**Problem**: Wizard doesn't open even though there are recoverable items.

**Solution**:
1. Check that `autoOpen` prop is set to `true`
2. Verify no items are being filtered out
3. Check browser console for errors

### Recovery Fails Silently

**Problem**: Recovery appears to succeed but data is not restored.

**Solution**:
1. Check `error_logs` table for recovery errors
2. Verify the recovery functions are properly implemented
3. Check that the recovered data is being saved to the correct location

### High Priority Items Not Showing First

**Problem**: Items are not sorted by priority.

**Solution**:
1. Verify `detectRecoverableData()` is sorting items
2. Check that priority calculation is working correctly
3. Ensure no filters are changing the order

## Best Practices

1. **Always handle errors**: Wrap recovery operations in try-catch blocks
2. **Show progress**: Use the `onProgress` callback to keep users informed
3. **Log everything**: Use `errorLogger` for all recovery operations
4. **Test thoroughly**: Test with real failure scenarios, not just mocked data
5. **Handle partial recovery**: Always check `summary.failedCount` and handle failures gracefully

## Performance Considerations

- **Detection**: Runs in parallel across all sources (~500ms)
- **Recovery**: Processes items sequentially with 100ms delay between items
- **UI Updates**: Progress updates every 100ms via callback
- **Memory**: Minimal overhead, items processed one at a time

## Accessibility

The Recovery Wizard is fully accessible:

- **Keyboard Navigation**: All controls accessible via keyboard
- **Screen Reader Support**: ARIA labels on all interactive elements
- **Focus Management**: Proper focus trapping in dialog
- **High Contrast**: Supports high contrast mode

## Migration Guide

If you're upgrading from an older version without recovery:

1. Install dependencies (none required, uses existing infrastructure)
2. Add `<RecoveryWizard />` to your App component
3. Optionally add manual recovery trigger to Settings
4. Run database migrations (if any)
5. Test recovery flows with sample data

## Related Documentation

- [Error Handling System](../errors/README.md)
- [Auto-Save System](../auto-save/README.md)
- [Batch Processing](../batch/README.md)
- [Backup System](../../docs/backup-system.md)

## Support

For issues or questions:
- Check the [troubleshooting section](#troubleshooting)
- Review test files for usage examples
- Contact the development team

