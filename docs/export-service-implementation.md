# Export Service Layer Implementation

## Overview

The Export Service Layer provides a robust foundation for managing export operations in the Interactive LoRA Conversation Generation Module. It implements CRUD operations for export logs with proper error handling, type safety, and audit trail capabilities.

## Implementation Status

✅ **COMPLETED** - Database Foundation and Export Service Layer

### Deliverables

1. ✅ Export Service Layer (`src/lib/export-service.ts`)
2. ✅ TypeScript Type Definitions (`train-wireframe/src/lib/types.ts`)
3. ✅ Database Verification Script (`scripts/verify-export-logs-table.sql`)
4. ✅ Test Script (`scripts/test-export-service.ts`)
5. ✅ Comprehensive Documentation

## Architecture

### Database Schema

**Table**: `export_logs`

| Column              | Type                     | Nullable | Default        | Description                        |
|---------------------|--------------------------|----------|----------------|------------------------------------|
| id                  | uuid                     | NO       | gen_random_uuid() | Primary key                     |
| export_id           | uuid                     | NO       | -              | Unique export identifier           |
| user_id             | uuid                     | NO       | -              | FK to auth.users                   |
| timestamp           | timestamptz              | NO       | -              | Export timestamp                   |
| format              | text                     | NO       | -              | Export format (json/jsonl/csv/md)  |
| config              | jsonb                    | NO       | -              | Export configuration               |
| conversation_count  | integer                  | NO       | -              | Number of conversations            |
| file_size           | bigint                   | YES      | -              | File size in bytes                 |
| status              | text                     | NO       | 'queued'       | Export status                      |
| file_url            | text                     | YES      | -              | Download URL                       |
| expires_at          | timestamptz              | YES      | -              | Link expiration timestamp          |
| error_message       | text                     | YES      | -              | Error details if failed            |
| created_at          | timestamptz              | NO       | now()          | Record creation timestamp          |
| updated_at          | timestamptz              | NO       | now()          | Record update timestamp            |

**Indexes**:
- `export_logs_pkey` - Primary key on `id`
- `idx_export_logs_export_id` - Unique index on `export_id`
- `idx_export_logs_user_id` - Index on `user_id`
- `idx_export_logs_timestamp` - Index on `timestamp DESC`
- `idx_export_logs_status` - Index on `status`
- `idx_export_logs_format` - Index on `format`
- `idx_export_logs_expires_at` - Index on `expires_at`

**Foreign Keys**:
- `export_logs_user_id_fkey` - Foreign key to `auth.users(id)` with CASCADE delete

**RLS Policies**:
- `Users can select own exports` - SELECT where `user_id = auth.uid()`
- `Users can insert own exports` - INSERT with check `user_id = auth.uid()`
- `Users can update own exports` - UPDATE where `user_id = auth.uid()`

### Service Layer

**Class**: `ExportService`

The service layer abstracts database operations and provides a clean API for export log management.

#### Methods

| Method                | Parameters                                      | Returns                              | Description                           |
|-----------------------|-------------------------------------------------|--------------------------------------|---------------------------------------|
| `createExportLog`     | `CreateExportLogInput`                          | `Promise<ExportLog>`                 | Create new export log                 |
| `getExportLog`        | `export_id: string`                             | `Promise<ExportLog \| null>`         | Get export by ID                      |
| `listExportLogs`      | `user_id, filters?, pagination?`                | `Promise<{logs, total}>`             | List exports with filters             |
| `updateExportLog`     | `export_id: string, updates`                    | `Promise<ExportLog>`                 | Update export log                     |
| `deleteExportLog`     | `export_id: string`                             | `Promise<void>`                      | Delete export log (admin only)        |
| `markExpiredExports`  | -                                               | `Promise<number>`                    | Mark expired exports (cleanup job)    |

#### Error Classes

- **`ExportNotFoundError`** - Thrown when attempting to access non-existent export
- **`ExportPermissionError`** - Thrown when RLS blocks access

### Type Definitions

**Core Types**:

```typescript
export interface ExportLog {
  id: string;
  export_id: string;
  user_id: string;
  timestamp: string;
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  config: ExportConfig;
  conversation_count: number;
  file_size: number | null;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  file_url: string | null;
  expires_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExportLogInput {
  user_id: string;
  format: ExportLog['format'];
  config: ExportConfig;
  conversation_count: number;
  status?: ExportLog['status'];
}

export interface UpdateExportLogInput {
  status?: ExportLog['status'];
  file_size?: number;
  file_url?: string;
  expires_at?: string;
  error_message?: string;
}
```

## Usage Examples

### Basic Usage

```typescript
import { createClient } from '@supabase/supabase-js';
import { createExportService } from './lib/export-service';

const supabase = createClient(url, key);
const exportService = createExportService(supabase);

// Create an export log
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

console.log('Export created:', log.export_id);
```

### Export Processing Workflow

```typescript
// 1. Create export log (queued)
const exportLog = await exportService.createExportLog({
  user_id: userId,
  format: 'jsonl',
  config: exportConfig,
  conversation_count: 100
});

// 2. Mark as processing
await exportService.updateExportLog(exportLog.export_id, {
  status: 'processing'
});

try {
  // 3. Generate export file...
  const fileData = await generateExportFile(exportConfig);
  
  // 4. Upload to storage...
  const fileUrl = await uploadToStorage(fileData);
  
  // 5. Mark as completed
  await exportService.updateExportLog(exportLog.export_id, {
    status: 'completed',
    file_size: fileData.length,
    file_url: fileUrl,
    expires_at: new Date(Date.now() + 86400000).toISOString() // 24 hours
  });
} catch (error) {
  // Mark as failed
  await exportService.updateExportLog(exportLog.export_id, {
    status: 'failed',
    error_message: error.message
  });
}
```

### List Exports with Filters

```typescript
// Get recent JSONL exports
const { logs, total } = await exportService.listExportLogs(
  userId,
  {
    format: 'jsonl',
    status: 'completed',
    dateFrom: '2025-01-01T00:00:00Z'
  },
  {
    page: 1,
    limit: 25
  }
);

console.log(`Found ${total} exports, showing ${logs.length}`);
logs.forEach(log => {
  console.log(`${log.export_id}: ${log.status} (${log.conversation_count} conversations)`);
});
```

### Cleanup Job

```typescript
// Run periodically to mark expired exports
async function cleanupExpiredExports() {
  const count = await exportService.markExpiredExports();
  console.log(`Marked ${count} exports as expired`);
}

// Run daily
setInterval(cleanupExpiredExports, 86400000); // 24 hours
```

## Verification

### Database Verification

Run the verification script in Supabase SQL Editor:

```bash
# Located at: scripts/verify-export-logs-table.sql
```

This script checks:
1. ✅ Table structure (14 columns)
2. ✅ Indexes (7 indexes including PK)
3. ✅ Foreign key constraints
4. ✅ RLS enabled
5. ✅ RLS policies (3 policies)
6. ✅ Basic insert/select test

### Service Testing

Run the automated test suite:

```bash
# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-anon-key"

# Run tests
ts-node scripts/test-export-service.ts
```

The test suite validates:
- ✅ Create export log
- ✅ Get export log by ID
- ✅ Get non-existent export (returns null)
- ✅ Update export log (processing)
- ✅ Update export log (completed)
- ✅ List export logs
- ✅ List with filters (format, status)
- ✅ Mark expired exports
- ✅ Error handling (ExportNotFoundError)
- ✅ Delete export log

## Acceptance Criteria

### Database Verification ✅

- ✅ Export_logs table exists with all required columns
- ✅ All indexes created (user_id, timestamp, status, format, expires_at)
- ✅ Foreign key constraint to auth.users(id) exists
- ✅ RLS enabled with correct policies (SELECT, INSERT, UPDATE)
- ✅ Can query: `SELECT * FROM export_logs LIMIT 1;` without error

### ExportService Implementation ✅

- ✅ ExportService class created with all CRUD methods
- ✅ createExportLog() generates unique export_id and creates record
- ✅ getExportLog() retrieves by export_id, returns null if not found
- ✅ listExportLogs() supports filtering (format, status, date range) and pagination
- ✅ updateExportLog() updates status and metadata fields
- ✅ deleteExportLog() removes record (admin function)
- ✅ markExpiredExports() bulk updates expired exports
- ✅ All methods have proper error handling with try-catch
- ✅ All methods return properly typed results (ExportLog interface)

### Type Safety ✅

- ✅ ExportLog interface matches database schema exactly
- ✅ CreateExportLogInput type enforces required fields
- ✅ UpdateExportLogInput type allows partial updates
- ✅ Custom error classes (ExportNotFoundError, ExportPermissionError) defined
- ✅ TypeScript strict mode passes with no errors

### Error Handling ✅

- ✅ Database errors caught and logged
- ✅ User-friendly error messages returned
- ✅ ExportNotFoundError thrown when export_id doesn't exist
- ✅ ExportPermissionError thrown when RLS blocks access
- ✅ Null returns for legitimate "not found" cases (getExportLog)

### Code Quality ✅

- ✅ JSDoc comments on all public methods
- ✅ Consistent naming conventions (camelCase for methods)
- ✅ Follows existing service layer pattern from database.ts
- ✅ No console.log (only console.error for errors)
- ✅ DRY principle applied (no duplicated query logic)

## File Locations

| File                                         | Purpose                                  |
|----------------------------------------------|------------------------------------------|
| `src/lib/export-service.ts`                  | ExportService class implementation       |
| `train-wireframe/src/lib/types.ts`           | TypeScript type definitions              |
| `scripts/verify-export-logs-table.sql`       | Database verification script             |
| `scripts/test-export-service.ts`             | Automated test suite                     |
| `docs/export-service-implementation.md`      | This documentation                       |

## Next Steps

This implementation completes the database foundation for the Export System. The next prompts will build upon this layer:

1. **Prompt 2** - Export API endpoints (create, status, download)
2. **Prompt 3** - Export processing logic (format converters)
3. **Prompt 4** - Export history UI component
4. **Prompt 5** - Integration with conversations dashboard
5. **Prompt 6** - Testing and validation

## Dependencies

- **Supabase**: PostgreSQL database with RLS
- **TypeScript**: Strict mode enabled
- **@supabase/supabase-js**: Client library for database operations

## Security Considerations

1. **Row Level Security (RLS)**: All queries are protected by RLS policies
2. **User Attribution**: All exports are tied to authenticated users
3. **Data Isolation**: Users can only access their own exports
4. **Audit Trail**: Complete history of all export operations
5. **Expiration**: Download links expire after 24 hours (configurable)

## Performance Considerations

1. **Indexes**: Optimized for common queries (user_id, timestamp, status)
2. **Pagination**: Built-in support for efficient large result sets
3. **JSONB Config**: Fast querying and flexible configuration storage
4. **Bulk Operations**: markExpiredExports() handles cleanup efficiently

## Support

For issues or questions:
1. Check the test script output for detailed error messages
2. Run the verification script to ensure database is set up correctly
3. Review the JSDoc comments in the service file for method documentation
4. Check the examples in this document for common use cases

---

**Implementation Date**: 2025-10-31  
**Version**: 1.0.0  
**Status**: Complete ✅

