# Export Service Layer - Quick Reference

## 🚀 Quick Start

### Import and Initialize

```typescript
import { createClient } from '@supabase/supabase-js';
import { createExportService } from './src/lib/export-service';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const exportService = createExportService(supabase);
```

## 📋 Common Operations

### 1. Create Export Log

```typescript
const log = await exportService.createExportLog({
  user_id: 'user-123',
  format: 'jsonl',
  config: {
    scope: 'filtered',
    format: 'jsonl',
    includeMetadata: true,
    includeQualityScores: true,
    includeTimestamps: true,
    includeApprovalHistory: false,
    includeParentReferences: false,
    includeFullContent: true
  },
  conversation_count: 42
});
```

### 2. Get Export by ID

```typescript
const log = await exportService.getExportLog('export-uuid-123');
if (log) {
  console.log('Status:', log.status);
} else {
  console.log('Not found');
}
```

### 3. Update Export Status

```typescript
// Mark as processing
await exportService.updateExportLog(exportId, {
  status: 'processing'
});

// Mark as completed
await exportService.updateExportLog(exportId, {
  status: 'completed',
  file_size: 1024000,
  file_url: 'https://storage.example.com/file.jsonl',
  expires_at: new Date(Date.now() + 86400000).toISOString()
});

// Mark as failed
await exportService.updateExportLog(exportId, {
  status: 'failed',
  error_message: 'Error details here'
});
```

### 4. List Exports

```typescript
// Get all exports for user
const { logs, total } = await exportService.listExportLogs(userId);

// With filters
const { logs, total } = await exportService.listExportLogs(
  userId,
  {
    format: 'jsonl',
    status: 'completed',
    dateFrom: '2025-01-01T00:00:00Z',
    dateTo: '2025-12-31T23:59:59Z'
  },
  {
    page: 1,
    limit: 25
  }
);
```

### 5. Cleanup Expired Exports

```typescript
const count = await exportService.markExpiredExports();
console.log(`Marked ${count} exports as expired`);
```

## 🔄 Complete Export Workflow

```typescript
async function processExport(userId: string, config: ExportConfig) {
  // 1. Create export log
  const log = await exportService.createExportLog({
    user_id: userId,
    format: config.format,
    config: config,
    conversation_count: 100
  });

  try {
    // 2. Mark as processing
    await exportService.updateExportLog(log.export_id, {
      status: 'processing'
    });

    // 3. Generate export file
    const fileData = await generateExportFile(config);

    // 4. Upload to storage
    const fileUrl = await uploadToStorage(fileData);

    // 5. Mark as completed
    await exportService.updateExportLog(log.export_id, {
      status: 'completed',
      file_size: fileData.length,
      file_url: fileUrl,
      expires_at: new Date(Date.now() + 86400000).toISOString()
    });

    return log.export_id;
  } catch (error) {
    // Mark as failed
    await exportService.updateExportLog(log.export_id, {
      status: 'failed',
      error_message: error.message
    });
    throw error;
  }
}
```

## 🎯 Export Statuses

| Status       | Description                                      |
|--------------|--------------------------------------------------|
| `queued`     | Export created, waiting to be processed          |
| `processing` | Export is being generated                        |
| `completed`  | Export successful, file available for download   |
| `failed`     | Export failed, check error_message               |
| `expired`    | Export completed but download link has expired   |

## 📊 Export Formats

| Format       | Extension | Description                              |
|--------------|-----------|------------------------------------------|
| `json`       | .json     | JSON array format                        |
| `jsonl`      | .jsonl    | JSON Lines (newline-delimited JSON)      |
| `csv`        | .csv      | Comma-separated values                   |
| `markdown`   | .md       | Markdown formatted conversations         |

## ⚠️ Error Handling

```typescript
import { ExportNotFoundError } from './src/lib/export-service';

try {
  const log = await exportService.updateExportLog(exportId, updates);
} catch (error) {
  if (error instanceof ExportNotFoundError) {
    console.error('Export not found:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 🔍 Filtering Options

### By Format

```typescript
const { logs } = await exportService.listExportLogs(userId, {
  format: 'jsonl'
});
```

### By Status

```typescript
const { logs } = await exportService.listExportLogs(userId, {
  status: 'completed'
});
```

### By Date Range

```typescript
const { logs } = await exportService.listExportLogs(userId, {
  dateFrom: '2025-10-01T00:00:00Z',
  dateTo: '2025-10-31T23:59:59Z'
});
```

### Combined Filters

```typescript
const { logs } = await exportService.listExportLogs(
  userId,
  {
    format: 'jsonl',
    status: 'completed',
    dateFrom: '2025-10-01T00:00:00Z'
  },
  {
    page: 1,
    limit: 10
  }
);
```

## 📄 Pagination

```typescript
// Page 1 (first 25 items)
const page1 = await exportService.listExportLogs(userId, {}, {
  page: 1,
  limit: 25
});

// Page 2 (next 25 items)
const page2 = await exportService.listExportLogs(userId, {}, {
  page: 2,
  limit: 25
});

// Calculate total pages
const totalPages = Math.ceil(page1.total / 25);
```

## 🧪 Testing

### Run Verification Script

```bash
# In Supabase SQL Editor
# Run: scripts/verify-export-logs-table.sql
```

### Run Test Suite

```bash
export SUPABASE_URL="your-url"
export SUPABASE_ANON_KEY="your-key"
ts-node scripts/test-export-service.ts
```

## 📂 File Locations

| Path                                      | Purpose                          |
|-------------------------------------------|----------------------------------|
| `src/lib/export-service.ts`               | Service implementation           |
| `train-wireframe/src/lib/types.ts`        | Type definitions                 |
| `scripts/verify-export-logs-table.sql`    | Database verification            |
| `scripts/test-export-service.ts`          | Automated tests                  |
| `docs/export-service-implementation.md`   | Full documentation               |

## 🔐 Security Notes

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own exports
- ✅ Foreign key constraints ensure data integrity
- ✅ All operations are audit-logged
- ✅ Download links expire after 24 hours

## 🎨 TypeScript Types

### ExportLog

```typescript
interface ExportLog {
  id: string;                    // Database PK
  export_id: string;              // Unique export ID (UUID)
  user_id: string;                // User who created export
  timestamp: string;              // ISO timestamp
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  config: ExportConfig;           // Export configuration
  conversation_count: number;     // Number of conversations
  file_size: number | null;       // File size in bytes
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  file_url: string | null;        // Download URL
  expires_at: string | null;      // Expiration timestamp
  error_message: string | null;   // Error details
  created_at: string;             // Record created
  updated_at: string;             // Record updated
}
```

### CreateExportLogInput

```typescript
interface CreateExportLogInput {
  user_id: string;
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  config: ExportConfig;
  conversation_count: number;
  status?: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
}
```

### UpdateExportLogInput

```typescript
interface UpdateExportLogInput {
  status?: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  file_size?: number;
  file_url?: string;
  expires_at?: string;
  error_message?: string;
}
```

## 💡 Tips

1. **Always handle errors**: Wrap service calls in try-catch blocks
2. **Check for null**: `getExportLog()` returns null if not found
3. **Use pagination**: Don't fetch all exports at once for large datasets
4. **Set expiration**: Always set `expires_at` when marking as completed
5. **Clean up**: Run `markExpiredExports()` periodically (daily recommended)

## 🐛 Troubleshooting

### Export not found

```typescript
// getExportLog returns null (not an error)
const log = await exportService.getExportLog(id);
if (!log) {
  console.log('Export not found');
}
```

### RLS permission denied

Check that the user_id matches the authenticated user:

```typescript
const { data: { user } } = await supabase.auth.getUser();
const log = await exportService.createExportLog({
  user_id: user.id,  // Must match authenticated user
  // ...
});
```

### Database connection error

Verify Supabase credentials:

```typescript
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

## 📚 Additional Resources

- [Full Documentation](docs/export-service-implementation.md)
- [Database Verification Script](scripts/verify-export-logs-table.sql)
- [Test Suite](scripts/test-export-service.ts)
- [Migration Reference](supabase/migrations/README-export-logs.md)

---

**Last Updated**: 2025-10-31  
**Version**: 1.0.0

