# Export Service Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Interactive LoRA Training Module                 │
│                     Export System - Database Foundation              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Future API Endpoints (Prompt 2)                                   │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │  POST   /api/exports         Create export              │      │
│   │  GET    /api/exports/:id     Get export status          │      │
│   │  GET    /api/exports         List exports               │      │
│   │  GET    /api/exports/:id/download  Download file        │      │
│   └─────────────────────────────────────────────────────────┘      │
│                              ▼                                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER                               │
│                       ✅ IMPLEMENTED (Prompt 1)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   src/lib/export-service.ts                                         │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │                    ExportService                            │    │
│   ├───────────────────────────────────────────────────────────┤    │
│   │  + constructor(supabase: SupabaseClient)                   │    │
│   ├───────────────────────────────────────────────────────────┤    │
│   │  + createExportLog(input): Promise<ExportLog>             │    │
│   │  + getExportLog(export_id): Promise<ExportLog | null>     │    │
│   │  + listExportLogs(...): Promise<{logs, total}>            │    │
│   │  + updateExportLog(...): Promise<ExportLog>               │    │
│   │  + deleteExportLog(export_id): Promise<void>              │    │
│   │  + markExpiredExports(): Promise<number>                  │    │
│   └───────────────────────────────────────────────────────────┘    │
│                              ▼                                        │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │              Supabase Client (Dependency)                  │    │
│   │  - from(), select(), insert(), update(), delete()          │    │
│   └───────────────────────────────────────────────────────────┘    │
│                              ▼                                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                │
│                       ✅ VERIFIED (Prompt 1)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Supabase PostgreSQL                                               │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │                    export_logs                             │    │
│   ├─────────────────────────────┬─────────────────────────────┤    │
│   │ Columns (14)                │ Indexes (7)                 │    │
│   ├─────────────────────────────┼─────────────────────────────┤    │
│   │ • id (PK)                   │ • export_logs_pkey          │    │
│   │ • export_id (UNIQUE)        │ • idx_export_id (UNIQUE)    │    │
│   │ • user_id (FK)              │ • idx_user_id               │    │
│   │ • timestamp                 │ • idx_timestamp (DESC)      │    │
│   │ • format                    │ • idx_status                │    │
│   │ • config (JSONB)            │ • idx_format                │    │
│   │ • conversation_count        │ • idx_expires_at            │    │
│   │ • file_size                 │                             │    │
│   │ • status                    │                             │    │
│   │ • file_url                  │                             │    │
│   │ • expires_at                │                             │    │
│   │ • error_message             │                             │    │
│   │ • created_at                │                             │    │
│   │ • updated_at                │                             │    │
│   └─────────────────────────────┴─────────────────────────────┘    │
│                              │                                        │
│   ┌──────────────────────────┴─────────────────────────────┐       │
│   │              Row Level Security (RLS)                   │       │
│   ├─────────────────────────────────────────────────────────┤       │
│   │  Policy: Users can select own exports                   │       │
│   │  Policy: Users can insert own exports                   │       │
│   │  Policy: Users can update own exports                   │       │
│   └─────────────────────────────────────────────────────────┘       │
│                              │                                        │
│   ┌──────────────────────────┴─────────────────────────────┐       │
│   │              Foreign Key Constraints                    │       │
│   ├─────────────────────────────────────────────────────────┤       │
│   │  user_id → auth.users(id) ON DELETE CASCADE             │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          TYPE SYSTEM                                 │
│                       ✅ IMPLEMENTED (Prompt 1)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   train-wireframe/src/lib/types.ts                                  │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │  export interface ExportLog {                             │    │
│   │    id: string;                                            │    │
│   │    export_id: string;                                     │    │
│   │    user_id: string;                                       │    │
│   │    timestamp: string;                                     │    │
│   │    format: 'json' | 'jsonl' | 'csv' | 'markdown';        │    │
│   │    config: ExportConfig;                                  │    │
│   │    conversation_count: number;                            │    │
│   │    file_size: number | null;                              │    │
│   │    status: 'queued' | 'processing' | ... ;                │    │
│   │    file_url: string | null;                               │    │
│   │    expires_at: string | null;                             │    │
│   │    error_message: string | null;                          │    │
│   │    created_at: string;                                    │    │
│   │    updated_at: string;                                    │    │
│   │  }                                                         │    │
│   └───────────────────────────────────────────────────────────┘    │
│                                                                       │
│   src/lib/export-service.ts                                         │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │  export interface CreateExportLogInput { ... }             │    │
│   │  export interface UpdateExportLogInput { ... }             │    │
│   │  export class ExportNotFoundError extends Error { ... }    │    │
│   │  export class ExportPermissionError extends Error { ... }  │    │
│   └───────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Create Export Flow

```
User Request
    │
    ▼
API Endpoint (Future)
    │
    ▼
exportService.createExportLog({
  user_id: "user-123",
  format: "jsonl",
  config: {...},
  conversation_count: 42
})
    │
    ▼
Generate UUID
    │
    ▼
INSERT INTO export_logs
    │
    ├─► RLS Check: user_id = auth.uid()? ✓
    │
    ▼
Database
    │
    ▼
Return ExportLog
    │
    ▼
Response to User
```

### Update Export Flow

```
Background Job
    │
    ▼
exportService.updateExportLog(export_id, {
  status: "completed",
  file_size: 1024000,
  file_url: "https://...",
  expires_at: "2025-11-01T00:00:00Z"
})
    │
    ▼
UPDATE export_logs
SET status = 'completed',
    file_size = 1024000,
    ...
WHERE export_id = ?
    │
    ├─► RLS Check: user_id = auth.uid()? ✓
    │
    ▼
Database
    │
    ▼
Return Updated ExportLog
```

### List Exports Flow

```
User Request
    │
    ▼
exportService.listExportLogs(user_id, {
  format: "jsonl",
  status: "completed"
}, {
  page: 1,
  limit: 25
})
    │
    ▼
SELECT * FROM export_logs
WHERE user_id = ?
  AND format = 'jsonl'
  AND status = 'completed'
ORDER BY timestamp DESC
LIMIT 25 OFFSET 0
    │
    ├─► RLS Check: user_id = auth.uid()? ✓
    │
    ▼
Database
    │
    ▼
Return { logs: ExportLog[], total: number }
```

## State Diagram

### Export Status Lifecycle

```
         ┌─────────┐
         │ queued  │ ◄─── Initial state (created)
         └────┬────┘
              │
              ▼
      ┌──────────────┐
      │  processing  │ ◄─── Export generation started
      └──────┬───────┘
             │
         ┌───┴────┐
         │        │
         ▼        ▼
   ┌───────────┐  ┌──────────┐
   │ completed │  │  failed  │
   └─────┬─────┘  └──────────┘
         │
         │ (After expires_at timestamp)
         │
         ▼
    ┌─────────┐
    │ expired │ ◄─── Cleanup job marks as expired
    └─────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION                              │
│  Supabase Auth: auth.uid() = user_id?                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ROW LEVEL SECURITY (RLS)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SELECT: WHERE user_id = auth.uid()                      │  │
│  │  INSERT: WITH CHECK (user_id = auth.uid())               │  │
│  │  UPDATE: WHERE user_id = auth.uid()                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE ACCESS                             │
│  User can ONLY see/modify their OWN exports                     │
└─────────────────────────────────────────────────────────────────┘
```

## Index Strategy

```
Query Pattern                     Index Used                  Performance
─────────────────────────────── ─────────────────────────── ──────────────
Get by export_id                 idx_export_logs_export_id   O(1)
List user's exports              idx_export_logs_user_id     O(log n)
Recent exports (ORDER BY)        idx_export_logs_timestamp   O(log n)
Filter by status                 idx_export_logs_status      O(log n)
Filter by format                 idx_export_logs_format      O(log n)
Cleanup expired exports          idx_export_logs_expires_at  O(log n)

Combined Filters: Uses multiple indexes with bitmap scan
```

## Error Handling Flow

```
Try Operation
    │
    ├─► Success ──────────────────────────────────► Return Result
    │
    └─► Error
        │
        ├─► PGRST116 (Not Found)
        │   └─► Return null (getExportLog)
        │   └─► Throw ExportNotFoundError (updateExportLog)
        │
        ├─► RLS Violation
        │   └─► Throw ExportPermissionError
        │
        └─► Database Error
            └─► console.error(error)
            └─► Throw Error
```

## File Organization

```
train-data/
│
├── src/lib/
│   ├── export-service.ts          ✅ Service implementation
│   └── supabase.ts                   (existing)
│
├── train-wireframe/src/lib/
│   └── types.ts                   ✅ Type definitions (updated)
│
├── scripts/
│   ├── test-export-service.ts     ✅ Automated tests
│   └── verify-export-logs-table.sql ✅ Database verification
│
├── docs/
│   └── export-service-implementation.md ✅ Full docs
│
├── supabase/migrations/
│   └── README-export-logs.md      ✅ Migration reference
│
└── Documentation (root)
    ├── EXPORT-SERVICE-QUICK-REFERENCE.md ✅
    ├── EXPORT-SERVICE-VALIDATION-CHECKLIST.md ✅
    ├── EXPORT-SERVICE-ARCHITECTURE.md ✅ (this file)
    └── PROMPT-1-E05-IMPLEMENTATION-SUMMARY.md ✅
```

## Integration Points

### Current Implementation (Prompt 1)

```
┌──────────────────────────┐
│   Database Foundation    │
│   ✅ export_logs table   │
│   ✅ Indexes             │
│   ✅ RLS Policies        │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│     Service Layer        │
│   ✅ ExportService       │
│   ✅ CRUD Operations     │
│   ✅ Error Handling      │
└──────────────────────────┘
```

### Future Integration (Prompts 2-6)

```
┌──────────────────────────┐         ┌──────────────────────────┐
│    API Endpoints         │◄────────│   Export Processing      │
│    (Prompt 2)            │         │   (Prompt 3)             │
└────────┬─────────────────┘         └──────────────────────────┘
         │                                      │
         │                                      │
         ▼                                      ▼
┌─────────────────────────────────────────────────────┐
│              ExportService (Prompt 1)                │
│   createExportLog, getExportLog, updateExportLog... │
└─────────────────────────────────────────────────────┘
         │                                      ▲
         │                                      │
         ▼                                      │
┌──────────────────────────┐         ┌──────────────────────────┐
│   Export History UI      │         │   Dashboard Integration  │
│   (Prompt 4)             │         │   (Prompt 5)             │
└──────────────────────────┘         └──────────────────────────┘
```

## Performance Characteristics

```
Operation                 Complexity    Response Time    Notes
──────────────────────── ───────────── ──────────────── ────────────────
createExportLog()         O(1)          ~10-50ms         Single INSERT
getExportLog()            O(1)          ~5-20ms          Indexed lookup
listExportLogs()          O(log n)      ~20-100ms        Indexed scan
updateExportLog()         O(1)          ~10-50ms         Indexed UPDATE
deleteExportLog()         O(1)          ~10-50ms         Indexed DELETE
markExpiredExports()      O(n)          ~50-500ms        Bulk UPDATE

n = number of matching records
All times assume reasonable database load (<1000 concurrent users)
```

## Testing Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                         TEST PYRAMID                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                        ┌───────────┐                            │
│                        │   Manual  │                            │
│                        │  Testing  │  ← User acceptance         │
│                        └───────────┘                            │
│                    ┌─────────────────┐                          │
│                    │   Integration   │                          │
│                    │     Tests       │  ← API endpoints         │
│                    └─────────────────┘                          │
│            ┌─────────────────────────────┐                      │
│            │      Unit Tests             │                      │
│            │  test-export-service.ts     │  ← Service layer    │
│            │  ✅ 11 test cases           │                      │
│            └─────────────────────────────┘                      │
│    ┌─────────────────────────────────────────┐                 │
│    │       Database Verification             │                 │
│    │  verify-export-logs-table.sql           │  ← Schema       │
│    │  ✅ 8 verification sections             │                 │
│    └─────────────────────────────────────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**Version**: 1.0.0  
**Created**: 2025-10-31  
**Status**: Complete ✅

