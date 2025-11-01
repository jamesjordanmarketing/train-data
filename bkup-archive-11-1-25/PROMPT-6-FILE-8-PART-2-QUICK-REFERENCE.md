# Configuration Change Management - Quick Reference

## API Endpoints

### 1. Get Change History
```bash
GET /api/config/change-history?configType=user_preference&configId=uuid&page=1&pageSize=20
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20, max: 100)
- `configType` - 'user_preference' or 'ai_config'
- `configId` - Configuration UUID
- `changedBy` - User UUID filter
- `startDate` - ISO 8601 date
- `endDate` - ISO 8601 date
- `searchText` - Search in change reasons

### 2. Preview Rollback
```bash
POST /api/config/rollback
Content-Type: application/json

{
  "action": "preview",
  "configType": "user_preference",
  "configId": "uuid",
  "targetAuditLogId": "audit-uuid"
}
```

### 3. Validate Rollback
```bash
POST /api/config/rollback
Content-Type: application/json

{
  "action": "validate",
  "options": {
    "configType": "user_preference",
    "configId": "uuid",
    "targetAuditLogId": "audit-uuid",
    "reason": "Rollback reason"
  }
}
```

### 4. Execute Rollback
```bash
POST /api/config/rollback
Content-Type: application/json

{
  "action": "execute",
  "options": {
    "configType": "user_preference",
    "configId": "uuid",
    "targetAuditLogId": "audit-uuid",
    "reason": "Rollback reason",
    "confirmWarnings": true
  }
}
```

### 5. Bulk Rollback
```bash
POST /api/config/rollback
Content-Type: application/json

{
  "action": "bulk",
  "options": {
    "rollbacks": [
      {
        "configType": "user_preference",
        "configId": "uuid1",
        "targetAuditLogId": "audit-uuid1"
      },
      {
        "configType": "ai_config",
        "configId": "uuid2",
        "targetAuditLogId": "audit-uuid2"
      }
    ],
    "reason": "Batch rollback"
  }
}
```

### 6. Get Statistics
```bash
GET /api/config/statistics?startDate=2025-01-01&endDate=2025-12-31
```

### 7. Export CSV
```bash
POST /api/config/export-csv
Content-Type: application/json

{
  "configType": "ai_config",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

---

## Service Layer Usage

### Import
```typescript
import { configRollbackService } from '@/lib/services/config-rollback-service';
```

### Get Change History
```typescript
const history = await configRollbackService.getChangeHistory(
  'user_preference',
  configId,
  1,  // page
  20  // pageSize
);

console.log(`Total changes: ${history.totalCount}`);
console.log(`Showing page ${history.page} of ${Math.ceil(history.totalCount / history.pageSize)}`);
history.entries.forEach(entry => {
  console.log(`${entry.changedAt}: ${entry.changeReason || 'No reason'}`);
});
```

### Get Filtered History
```typescript
const history = await configRollbackService.getFilteredChangeHistory(
  {
    configType: 'ai_config',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    searchText: 'model change'
  },
  1,
  50
);
```

### Preview Rollback
```typescript
const preview = await configRollbackService.previewRollback(
  'user_preference',
  configId,
  auditLogId
);

console.log('Current:', preview.currentValues);
console.log('Target:', preview.targetValues);
console.log('Diff:', preview.diff);
console.log('Warnings:', preview.warnings);
```

### Validate Rollback
```typescript
const validation = await configRollbackService.validateRollback({
  configType: 'ai_config',
  configId: configId,
  targetAuditLogId: auditLogId,
  reason: 'Reverting bad config',
  confirmWarnings: true
});

if (!validation.isValid) {
  console.error('Validation failed:', validation.errors);
} else if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

### Execute Rollback
```typescript
try {
  await configRollbackService.rollbackToVersion(
    {
      configType: 'user_preference',
      configId: configId,
      targetAuditLogId: auditLogId,
      reason: 'User requested rollback to previous theme',
      confirmWarnings: true
    },
    userId
  );
  console.log('Rollback successful');
} catch (error) {
  console.error('Rollback failed:', error);
}
```

### Bulk Rollback
```typescript
await configRollbackService.bulkRollback(
  {
    rollbacks: [
      { configType: 'user_preference', configId: 'uuid1', targetAuditLogId: 'audit1' },
      { configType: 'ai_config', configId: 'uuid2', targetAuditLogId: 'audit2' }
    ],
    reason: 'Incident recovery rollback'
  },
  userId
);
```

### Get Statistics
```typescript
const stats = await configRollbackService.getChangeStatistics(
  '2025-01-01',  // startDate
  '2025-12-31'   // endDate
);

console.log('Total changes:', stats.totalChanges);
console.log('By type:', stats.changesByType);
console.log('By user:', stats.changesByUser);
console.log('Recent activity:', stats.recentActivity);
console.log('Most changed configs:', stats.mostChangedConfigs);
```

### Export CSV
```typescript
const csv = await configRollbackService.exportChangeHistoryCSV({
  configType: 'ai_config',
  startDate: '2025-01-01',
  endDate: '2025-12-31'
});

// Save to file or return to client
```

---

## Database Queries

### View Audit Log
```sql
SELECT 
  id,
  config_type,
  config_id,
  changed_by,
  changed_at,
  change_reason
FROM configuration_audit_log
WHERE config_type = 'user_preference'
  AND config_id = 'your-config-uuid'
ORDER BY changed_at DESC
LIMIT 20;
```

### Count Changes by Type
```sql
SELECT 
  config_type,
  COUNT(*) as change_count
FROM configuration_audit_log
WHERE changed_at >= NOW() - INTERVAL '30 days'
GROUP BY config_type;
```

### Most Changed Configurations
```sql
SELECT 
  config_type,
  config_id,
  COUNT(*) as change_count
FROM configuration_audit_log
GROUP BY config_type, config_id
ORDER BY change_count DESC
LIMIT 10;
```

### Recent Activity
```sql
SELECT 
  DATE(changed_at) as date,
  COUNT(*) as changes
FROM configuration_audit_log
WHERE changed_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(changed_at)
ORDER BY date;
```

---

## TypeScript Types

### ConfigType
```typescript
type ConfigType = 'user_preference' | 'ai_config';
```

### ConfigurationAuditLogEntry
```typescript
interface ConfigurationAuditLogEntry {
  id: string;
  configType: ConfigType;
  configId: string;
  changedBy: string;
  changedAt: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  changeReason?: string;
  clientIp?: string;
  userAgent?: string;
}
```

### ConfigurationDiff
```typescript
interface ConfigurationDiff {
  added: Array<{ path: string; value: any }>;
  modified: Array<{ path: string; oldValue: any; newValue: any }>;
  removed: Array<{ path: string; value: any }>;
}
```

### RollbackOptions
```typescript
interface RollbackOptions {
  configType: ConfigType;
  configId: string;
  targetAuditLogId: string;
  reason?: string;
  confirmWarnings?: boolean;
}
```

---

## Common Patterns

### Safe Rollback Pattern
```typescript
// 1. Preview
const preview = await configRollbackService.previewRollback(
  configType,
  configId,
  auditLogId
);

// 2. Show user the diff
console.log('Changes to be made:', preview.diff);

// 3. Get user confirmation
if (!confirm(`Rollback will make ${preview.diff.modified.length} changes. Continue?`)) {
  return;
}

// 4. Validate
const validation = await configRollbackService.validateRollback({
  configType,
  configId,
  targetAuditLogId: auditLogId,
  confirmWarnings: true
});

if (!validation.isValid) {
  console.error('Cannot rollback:', validation.errors);
  return;
}

// 5. Execute
await configRollbackService.rollbackToVersion(
  {
    configType,
    configId,
    targetAuditLogId: auditLogId,
    reason: 'User confirmed rollback',
    confirmWarnings: true
  },
  userId
);

console.log('Rollback complete!');
```

### Change History UI Pattern
```typescript
const [history, setHistory] = useState<ConfigurationChangeHistory | null>(null);
const [page, setPage] = useState(1);

useEffect(() => {
  async function fetchHistory() {
    const response = await fetch(
      `/api/config/change-history?configType=${configType}&configId=${configId}&page=${page}&pageSize=20`
    );
    const { history } = await response.json();
    setHistory(history);
  }
  fetchHistory();
}, [configType, configId, page]);

return (
  <div>
    {history?.entries.map(entry => (
      <div key={entry.id}>
        <span>{new Date(entry.changedAt).toLocaleString()}</span>
        <span>{entry.changeReason || 'No reason'}</span>
        <button onClick={() => handleRollback(entry.id)}>Rollback</button>
      </div>
    ))}
    <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
    <button disabled={!history?.hasMore} onClick={() => setPage(page + 1)}>Next</button>
  </div>
);
```

---

## Error Handling

### API Errors
```typescript
const response = await fetch('/api/config/rollback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* ... */ })
});

if (!response.ok) {
  const error = await response.json();
  console.error('API error:', error.error);
  if (error.details) {
    console.error('Details:', error.details);
  }
  return;
}

const data = await response.json();
```

### Service Layer Errors
```typescript
try {
  await configRollbackService.rollbackToVersion(options, userId);
} catch (error) {
  if (error instanceof Error) {
    console.error('Rollback failed:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## Performance Tips

1. **Use Pagination**: Always paginate large result sets
2. **Cache Statistics**: Statistics queries can be expensive, cache results
3. **Filter Wisely**: Use specific filters to reduce data size
4. **Batch Operations**: Use bulk rollback for multiple configurations
5. **Async Export**: For large CSV exports, consider background jobs

---

## Security Checklist

- [ ] User authenticated before API access
- [ ] RLS policies prevent cross-user data access
- [ ] Audit log is immutable (no updates/deletes)
- [ ] Configuration validation before rollback
- [ ] Rollback actions logged to audit trail
- [ ] API input validation for all parameters
- [ ] Error messages don't leak sensitive info

---

## Testing Commands

### Test Change History API
```bash
curl -X GET "http://localhost:3000/api/config/change-history?configType=user_preference&configId=uuid" \
  -H "Cookie: supabase-auth-token=..."
```

### Test Rollback Preview
```bash
curl -X POST "http://localhost:3000/api/config/rollback" \
  -H "Content-Type: application/json" \
  -H "Cookie: supabase-auth-token=..." \
  -d '{
    "action": "preview",
    "configType": "user_preference",
    "configId": "uuid",
    "targetAuditLogId": "audit-uuid"
  }'
```

### Test Statistics
```bash
curl -X GET "http://localhost:3000/api/config/statistics?startDate=2025-01-01" \
  -H "Cookie: supabase-auth-token=..."
```

### Test CSV Export
```bash
curl -X POST "http://localhost:3000/api/config/export-csv" \
  -H "Content-Type: application/json" \
  -H "Cookie: supabase-auth-token=..." \
  -d '{
    "configType": "ai_config",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  }' \
  --output config-history.csv
```

---

## Common Issues & Solutions

### Issue: "Unauthorized" error
**Solution**: Ensure user is authenticated with valid session

### Issue: Audit log entries not appearing
**Solution**: Check that database triggers are attached to tables
```sql
\d+ user_preferences  -- Check for triggers
\d+ ai_configurations -- Check for triggers
```

### Issue: Rollback validation fails
**Solution**: Check validation errors in response, ensure configuration is valid

### Issue: Cannot see other users' audit logs
**Solution**: This is expected - RLS policies prevent cross-user access

### Issue: Rollback doesn't update configuration
**Solution**: Verify target audit log entry exists and contains old_values

---

## Quick Troubleshooting

```sql
-- Check if audit log table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'configuration_audit_log'
);

-- Check if triggers exist
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%audit%';

-- Check RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'configuration_audit_log';

-- View recent audit log entries
SELECT * FROM configuration_audit_log
ORDER BY changed_at DESC
LIMIT 10;
```

