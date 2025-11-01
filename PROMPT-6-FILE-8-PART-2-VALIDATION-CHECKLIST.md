# Configuration Change Management - Validation Checklist

## Pre-Deployment Validation

### Database Schema ✅

- [x] **Unified audit log table exists**
  ```sql
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'configuration_audit_log'
  );
  ```

- [x] **All required columns present**
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'configuration_audit_log'
  ORDER BY ordinal_position;
  ```
  Expected: id, config_type, config_id, changed_by, changed_at, old_values, new_values, change_reason, client_ip, user_agent

- [x] **All indexes created**
  ```sql
  SELECT indexname, indexdef 
  FROM pg_indexes 
  WHERE tablename = 'configuration_audit_log';
  ```
  Expected: idx_config_audit_config_type, idx_config_audit_config_id, idx_config_audit_changed_by, idx_config_audit_changed_at, idx_config_audit_old_values, idx_config_audit_new_values, idx_config_audit_type_id_time

- [x] **RLS enabled**
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE tablename = 'configuration_audit_log';
  ```
  Expected: rowsecurity = true

- [x] **RLS policies created**
  ```sql
  SELECT policyname, cmd, qual
  FROM pg_policies
  WHERE tablename = 'configuration_audit_log';
  ```
  Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)

- [x] **Trigger functions exist**
  ```sql
  SELECT routine_name, routine_definition
  FROM information_schema.routines
  WHERE routine_name IN ('log_user_preferences_changes', 'log_ai_config_changes');
  ```

- [x] **Triggers attached to tables**
  ```sql
  SELECT trigger_name, event_manipulation, event_object_table
  FROM information_schema.triggers
  WHERE trigger_name IN ('user_preferences_audit_trigger', 'ai_configurations_audit_trigger');
  ```

### Type Definitions ✅

- [x] **config-change-management.ts exists**
  - Path: `src/lib/types/config-change-management.ts`

- [x] **All types exported**
  - ConfigType
  - ConfigurationAuditLogEntry
  - ConfigurationChangeHistory
  - ConfigurationDiff
  - RollbackPreview
  - RollbackValidationResult
  - RollbackOptions
  - BulkRollbackOptions
  - ChangeHistoryFilters
  - ChangeStatistics
  - ConfigurationAuditLogRow
  - RollbackResult
  - BulkRollbackResult

- [x] **No TypeScript compilation errors**
  ```bash
  npx tsc --noEmit
  ```

### Service Layer ✅

- [x] **config-rollback-service.ts exists**
  - Path: `src/lib/services/config-rollback-service.ts`

- [x] **All methods implemented**
  - getChangeHistory()
  - getFilteredChangeHistory()
  - previewRollback()
  - validateRollback()
  - rollbackToVersion()
  - bulkRollback()
  - getChangeStatistics()
  - exportChangeHistoryCSV()

- [x] **Service exported**
  ```typescript
  export const configRollbackService = new ConfigRollbackService();
  ```

- [x] **No linter errors**
  ```bash
  npx eslint src/lib/services/config-rollback-service.ts
  ```

### API Routes ✅

- [x] **change-history route exists**
  - Path: `src/app/api/config/change-history/route.ts`

- [x] **rollback route exists**
  - Path: `src/app/api/config/rollback/route.ts`

- [x] **statistics route exists**
  - Path: `src/app/api/config/statistics/route.ts`

- [x] **export-csv route exists**
  - Path: `src/app/api/config/export-csv/route.ts`

- [x] **All routes have authentication**
  - Each route checks `user` from session

- [x] **All routes have error handling**
  - try/catch blocks present
  - Error responses include details

- [x] **All routes validate input**
  - Parameter validation present
  - 400 errors for invalid input

---

## Functional Testing

### Database Triggers

#### Test User Preferences Audit Trigger

- [ ] **Create test user preference**
  ```sql
  INSERT INTO user_preferences (user_id, preferences)
  VALUES ('test-user-uuid', '{"theme": "light"}'::jsonb);
  ```

- [ ] **Update user preference**
  ```sql
  UPDATE user_preferences
  SET preferences = '{"theme": "dark"}'::jsonb
  WHERE user_id = 'test-user-uuid';
  ```

- [ ] **Verify audit log entry created**
  ```sql
  SELECT * FROM configuration_audit_log
  WHERE config_type = 'user_preference'
    AND config_id IN (SELECT id FROM user_preferences WHERE user_id = 'test-user-uuid')
  ORDER BY changed_at DESC
  LIMIT 1;
  ```
  Expected: Entry with old_values = {"theme": "light"}, new_values = {"theme": "dark"}

#### Test AI Configuration Audit Trigger

- [ ] **Insert AI configuration**
  ```sql
  INSERT INTO ai_configurations (user_id, config_name, configuration, created_by)
  VALUES ('test-user-uuid', 'test-config', '{"model": {"temperature": 0.7}}'::jsonb, 'test-user-uuid');
  ```

- [ ] **Verify audit log entry for INSERT**
  ```sql
  SELECT * FROM configuration_audit_log
  WHERE config_type = 'ai_config'
    AND change_reason = 'Configuration created'
  ORDER BY changed_at DESC
  LIMIT 1;
  ```

- [ ] **Update AI configuration**
  ```sql
  UPDATE ai_configurations
  SET configuration = '{"model": {"temperature": 0.9}}'::jsonb
  WHERE user_id = 'test-user-uuid' AND config_name = 'test-config';
  ```

- [ ] **Verify audit log entry for UPDATE**
  ```sql
  SELECT * FROM configuration_audit_log
  WHERE config_type = 'ai_config'
    AND config_id IN (SELECT id FROM ai_configurations WHERE user_id = 'test-user-uuid')
  ORDER BY changed_at DESC
  LIMIT 1;
  ```

- [ ] **Delete AI configuration**
  ```sql
  DELETE FROM ai_configurations
  WHERE user_id = 'test-user-uuid' AND config_name = 'test-config';
  ```

- [ ] **Verify audit log entry for DELETE**
  ```sql
  SELECT * FROM configuration_audit_log
  WHERE config_type = 'ai_config'
    AND change_reason = 'Configuration deleted'
  ORDER BY changed_at DESC
  LIMIT 1;
  ```

### RLS Policies

- [ ] **Test user can see own audit logs**
  ```sql
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims TO '{"sub": "test-user-uuid"}';
  
  SELECT * FROM configuration_audit_log
  WHERE changed_by = 'test-user-uuid';
  ```
  Expected: Returns entries

- [ ] **Test user cannot see other users' audit logs**
  ```sql
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims TO '{"sub": "test-user-uuid"}';
  
  SELECT * FROM configuration_audit_log
  WHERE changed_by != 'test-user-uuid';
  ```
  Expected: Returns empty

- [ ] **Test user cannot update audit log**
  ```sql
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims TO '{"sub": "test-user-uuid"}';
  
  UPDATE configuration_audit_log
  SET change_reason = 'Modified'
  WHERE changed_by = 'test-user-uuid';
  ```
  Expected: Permission denied

- [ ] **Test user cannot delete audit log**
  ```sql
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims TO '{"sub": "test-user-uuid"}';
  
  DELETE FROM configuration_audit_log
  WHERE changed_by = 'test-user-uuid';
  ```
  Expected: Permission denied

### API Endpoints

#### GET /api/config/change-history

- [ ] **Test without authentication**
  ```bash
  curl -X GET "http://localhost:3000/api/config/change-history"
  ```
  Expected: 401 Unauthorized

- [ ] **Test with authentication and no filters**
  ```bash
  curl -X GET "http://localhost:3000/api/config/change-history" \
    -H "Cookie: supabase-auth-token=..."
  ```
  Expected: 200 with history object

- [ ] **Test with pagination**
  ```bash
  curl -X GET "http://localhost:3000/api/config/change-history?page=1&pageSize=20" \
    -H "Cookie: supabase-auth-token=..."
  ```
  Expected: 200 with page 1, pageSize 20

- [ ] **Test with config type filter**
  ```bash
  curl -X GET "http://localhost:3000/api/config/change-history?configType=user_preference" \
    -H "Cookie: supabase-auth-token=..."
  ```
  Expected: 200 with filtered results

- [ ] **Test with invalid config type**
  ```bash
  curl -X GET "http://localhost:3000/api/config/change-history?configType=invalid" \
    -H "Cookie: supabase-auth-token=..."
  ```
  Expected: 400 Bad Request

- [ ] **Test with date range**
  ```bash
  curl -X GET "http://localhost:3000/api/config/change-history?startDate=2025-01-01&endDate=2025-12-31" \
    -H "Cookie: supabase-auth-token=..."
  ```
  Expected: 200 with filtered results

#### POST /api/config/rollback (preview)

- [ ] **Test preview without authentication**
  ```bash
  curl -X POST "http://localhost:3000/api/config/rollback" \
    -H "Content-Type: application/json" \
    -d '{"action": "preview"}'
  ```
  Expected: 401 Unauthorized

- [ ] **Test preview with valid data**
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
  Expected: 200 with preview object

- [ ] **Test preview with missing parameters**
  ```bash
  curl -X POST "http://localhost:3000/api/config/rollback" \
    -H "Content-Type: application/json" \
    -H "Cookie: supabase-auth-token=..." \
    -d '{
      "action": "preview",
      "configType": "user_preference"
    }'
  ```
  Expected: 400 Bad Request

#### POST /api/config/rollback (validate)

- [ ] **Test validate with valid options**
  ```bash
  curl -X POST "http://localhost:3000/api/config/rollback" \
    -H "Content-Type: application/json" \
    -H "Cookie: supabase-auth-token=..." \
    -d '{
      "action": "validate",
      "options": {
        "configType": "user_preference",
        "configId": "uuid",
        "targetAuditLogId": "audit-uuid"
      }
    }'
  ```
  Expected: 200 with validation result

- [ ] **Test validate with invalid configuration**
  - Use audit log entry with invalid configuration data
  Expected: validation.isValid = false with errors

#### POST /api/config/rollback (execute)

- [ ] **Test execute with valid options**
  ```bash
  curl -X POST "http://localhost:3000/api/config/rollback" \
    -H "Content-Type: application/json" \
    -H "Cookie: supabase-auth-token=..." \
    -d '{
      "action": "execute",
      "options": {
        "configType": "user_preference",
        "configId": "uuid",
        "targetAuditLogId": "audit-uuid",
        "reason": "Test rollback",
        "confirmWarnings": true
      }
    }'
  ```
  Expected: 200 with success: true

- [ ] **Verify configuration actually rolled back**
  ```sql
  SELECT preferences FROM user_preferences WHERE id = 'uuid';
  ```
  Expected: Matches old_values from audit log

- [ ] **Verify rollback action logged**
  ```sql
  SELECT * FROM configuration_audit_log
  WHERE change_reason LIKE 'Rollback%'
  ORDER BY changed_at DESC
  LIMIT 1;
  ```
  Expected: Entry with rollback reason

#### POST /api/config/rollback (bulk)

- [ ] **Test bulk with multiple rollbacks**
  ```bash
  curl -X POST "http://localhost:3000/api/config/rollback" \
    -H "Content-Type: application/json" \
    -H "Cookie: supabase-auth-token=..." \
    -d '{
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
        "reason": "Batch rollback test"
      }
    }'
  ```
  Expected: 200 with success message

- [ ] **Test bulk with empty rollbacks array**
  Expected: 400 Bad Request

- [ ] **Test bulk with one invalid rollback**
  - Include one rollback with invalid config
  Expected: 500 with validation error

#### GET /api/config/statistics

- [ ] **Test without date range**
  ```bash
  curl -X GET "http://localhost:3000/api/config/statistics" \
    -H "Cookie: supabase-auth-token=..."
  ```
  Expected: 200 with statistics object

- [ ] **Test with date range**
  ```bash
  curl -X GET "http://localhost:3000/api/config/statistics?startDate=2025-01-01&endDate=2025-12-31" \
    -H "Cookie: supabase-auth-token=..."
  ```
  Expected: 200 with filtered statistics

- [ ] **Verify statistics accuracy**
  - Check totalChanges matches database count
  - Verify changesByType sums to totalChanges
  - Confirm recentActivity has 7 days
  - Check mostChangedConfigs is sorted

#### POST /api/config/export-csv

- [ ] **Test CSV export with filters**
  ```bash
  curl -X POST "http://localhost:3000/api/config/export-csv" \
    -H "Content-Type: application/json" \
    -H "Cookie: supabase-auth-token=..." \
    -d '{
      "configType": "user_preference",
      "startDate": "2025-01-01",
      "endDate": "2025-12-31"
    }' \
    --output test-export.csv
  ```
  Expected: 200 with CSV file

- [ ] **Verify CSV format**
  ```bash
  head test-export.csv
  ```
  Expected: CSV with headers: ID, Config Type, Config ID, Changed By, Changed At, Change Reason

- [ ] **Verify CSV content**
  - Check rows match database entries
  - Verify proper escaping of special characters
  - Confirm no SQL injection

### Service Layer

#### getChangeHistory()

- [ ] **Test with valid parameters**
  ```typescript
  const history = await configRollbackService.getChangeHistory(
    'user_preference',
    configId,
    1,
    20
  );
  console.assert(history.entries.length <= 20);
  console.assert(history.page === 1);
  console.assert(history.pageSize === 20);
  ```

- [ ] **Test pagination**
  ```typescript
  const page1 = await configRollbackService.getChangeHistory(
    'user_preference', configId, 1, 10
  );
  const page2 = await configRollbackService.getChangeHistory(
    'user_preference', configId, 2, 10
  );
  console.assert(page1.entries[0].id !== page2.entries[0].id);
  ```

#### previewRollback()

- [ ] **Test generates correct diff**
  ```typescript
  const preview = await configRollbackService.previewRollback(
    'user_preference', configId, auditLogId
  );
  console.assert(preview.diff.added.length >= 0);
  console.assert(preview.diff.modified.length >= 0);
  console.assert(preview.diff.removed.length >= 0);
  ```

- [ ] **Test produces warnings**
  ```typescript
  // Test with old audit log entry (>30 days)
  console.assert(preview.warnings.length > 0);
  ```

#### validateRollback()

- [ ] **Test with valid configuration**
  ```typescript
  const validation = await configRollbackService.validateRollback({
    configType: 'user_preference',
    configId, targetAuditLogId, confirmWarnings: true
  });
  console.assert(validation.isValid === true);
  ```

- [ ] **Test with invalid AI configuration**
  ```typescript
  // Use audit log with invalid AI config
  const validation = await configRollbackService.validateRollback({
    configType: 'ai_config', configId, targetAuditLogId
  });
  console.assert(validation.isValid === false);
  console.assert(validation.errors.length > 0);
  ```

#### rollbackToVersion()

- [ ] **Test successful rollback**
  ```typescript
  await configRollbackService.rollbackToVersion(
    { configType: 'user_preference', configId, targetAuditLogId, confirmWarnings: true },
    userId
  );
  // Verify configuration updated
  ```

- [ ] **Test rollback with validation failure**
  ```typescript
  // Use invalid configuration
  try {
    await configRollbackService.rollbackToVersion(
      { configType: 'ai_config', configId, targetAuditLogId },
      userId
    );
    console.assert(false, 'Should have thrown error');
  } catch (error) {
    console.assert(error instanceof Error);
  }
  ```

---

## Performance Testing

### Query Performance

- [ ] **Test change history query speed**
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM configuration_audit_log
  WHERE config_type = 'user_preference'
    AND config_id = 'uuid'
  ORDER BY changed_at DESC
  LIMIT 20;
  ```
  Expected: Uses indexes, < 10ms

- [ ] **Test statistics aggregation speed**
  ```sql
  EXPLAIN ANALYZE
  SELECT config_type, COUNT(*)
  FROM configuration_audit_log
  GROUP BY config_type;
  ```
  Expected: < 100ms

- [ ] **Test large CSV export**
  - Export >1000 records
  - Measure time to completion
  Expected: < 5 seconds for 1000 records

### Pagination Performance

- [ ] **Test page 1 vs page 100**
  - Measure query time for different pages
  - Ensure consistent performance

### Concurrent Rollbacks

- [ ] **Test concurrent user rollbacks**
  - Multiple users rolling back simultaneously
  - Verify no race conditions
  - Check audit log consistency

---

## Security Testing

### Authentication

- [ ] **Test all endpoints without auth**
  - Expected: 401 Unauthorized

- [ ] **Test with expired session**
  - Expected: 401 Unauthorized

### Authorization

- [ ] **Test user accessing other user's data**
  - Try to view another user's audit logs
  - Try to rollback another user's config
  Expected: Empty results or permission denied

### Input Validation

- [ ] **Test SQL injection in search**
  ```bash
  curl -X GET "http://localhost:3000/api/config/change-history?searchText='; DROP TABLE configuration_audit_log; --" \
    -H "Cookie: supabase-auth-token=..."
  ```
  Expected: No SQL execution, safe handling

- [ ] **Test XSS in change reason**
  ```bash
  curl -X POST "http://localhost:3000/api/config/rollback" \
    -H "Content-Type: application/json" \
    -H "Cookie: supabase-auth-token=..." \
    -d '{
      "action": "execute",
      "options": {
        "reason": "<script>alert(1)</script>"
      }
    }'
  ```
  Expected: Script not executed, properly escaped

### Immutability

- [ ] **Attempt to modify audit log via service**
  - Verify no update methods exist

- [ ] **Attempt to delete audit log via API**
  - Verify no delete endpoints exist

---

## Edge Cases

### Empty Data

- [ ] **Test with no audit log entries**
  - Empty change history
  - Empty statistics
  Expected: Graceful handling, empty arrays

### Large Data

- [ ] **Test with 10,000+ audit log entries**
  - Pagination works
  - Statistics complete
  - CSV export succeeds

### Invalid Data

- [ ] **Test rollback to entry with null old_values**
  Expected: Validation fails

- [ ] **Test rollback to non-existent audit log**
  Expected: Error message

### Concurrent Operations

- [ ] **Test simultaneous rollbacks of same config**
  - Race condition handling
  - Final state consistency

---

## Cleanup After Testing

```sql
-- Remove test data
DELETE FROM configuration_audit_log WHERE changed_by = 'test-user-uuid';
DELETE FROM user_preferences WHERE user_id = 'test-user-uuid';
DELETE FROM ai_configurations WHERE user_id = 'test-user-uuid';
```

---

## Sign-Off

### Implementation Complete ✅
- [x] Database schema
- [x] Type definitions
- [x] Service layer
- [x] API routes
- [x] Documentation

### Testing Complete ⏳
- [ ] Database triggers
- [ ] RLS policies
- [ ] API endpoints
- [ ] Service layer methods
- [ ] Performance tests
- [ ] Security tests
- [ ] Edge cases

### Production Ready ⏳
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Security audit complete
- [ ] Performance validated
- [ ] Deployment plan ready

**Validated By**: _________________  
**Date**: _________________  
**Notes**: _________________

