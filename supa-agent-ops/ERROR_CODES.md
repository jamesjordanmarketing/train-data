# Error Code Reference

This document provides a complete reference of all error codes in the Supabase Agent Ops library, along with remediation steps and examples.

## Error Categories

- **VALIDATION**: Data validation failures
- **CHAR**: Character/encoding issues
- **DB**: Database constraint violations
- **CAST**: Type casting failures
- **AUTH**: Authentication/permission issues
- **FATAL**: Unrecoverable errors

## Error Codes

### Database Constraint Errors

#### ERR_DB_UNIQUE_VIOLATION
- **PostgreSQL Code**: 23505
- **Description**: Duplicate key violates unique constraint
- **Automatable**: ✅ Yes
- **Remediation**: Re-run import with `mode: 'upsert'` and proper onConflict setting
- **Example**:
```typescript
await agentImportTool({ 
  ...params, 
  mode: 'upsert', 
  onConflict: 'id' 
});
```

#### ERR_DB_FK_VIOLATION
- **PostgreSQL Code**: 23503
- **Description**: Foreign key constraint violation
- **Automatable**: ❌ No
- **Remediation**: Import parent tables before child tables
- **Example**:
```typescript
// Step 1: Import templates first
await agentImportTool({ table: 'templates', ... });

// Step 2: Import conversations
await agentImportTool({ table: 'conversations', ... });
```

#### ERR_DB_NOT_NULL_VIOLATION
- **PostgreSQL Code**: 23502
- **Description**: NOT NULL constraint violation
- **Automatable**: ❌ No
- **Remediation**: Ensure required fields are populated in all records
- **Example**:
```typescript
// Check that all required fields have values
const record = { 
  id: '...', 
  required_field: 'value'  // Must not be null
};
```

#### ERR_DB_CHECK_VIOLATION
- **PostgreSQL Code**: 23514
- **Description**: CHECK constraint violation
- **Automatable**: ❌ No
- **Remediation**: Validate data against constraint rules before import

#### ERR_DB_TABLE_NOT_FOUND
- **PostgreSQL Code**: 42P01
- **Description**: Table does not exist
- **Automatable**: ❌ No
- **Remediation**: Verify table name is correct or create the table
- **Example**:
```typescript
// Check table name spelling
await agentImportTool({ table: 'conversations', ... });
```

#### ERR_DB_COLUMN_NOT_FOUND
- **PostgreSQL Code**: 42703
- **Description**: Column does not exist
- **Automatable**: ❌ No
- **Remediation**: Verify column names match table schema

### Type Casting Errors

#### ERR_CAST_INVALID_INPUT
- **PostgreSQL Code**: 22P02
- **Description**: Type casting failure
- **Automatable**: ❌ No
- **Remediation**: Check that data types match the table schema
- **Example**:
```typescript
// Ensure numeric fields contain numbers, not strings
const record = { 
  id: 1,        // number, not '1'
  count: 42     // number, not '42'
};
```

#### ERR_CAST_JSONB
- **PostgreSQL Code**: 22P02
- **Description**: Invalid JSONB format
- **Automatable**: ❌ No
- **Remediation**: Ensure JSONB fields contain valid JSON objects

### Character/Encoding Errors

#### ERR_CHAR_INVALID_UTF8
- **Description**: Invalid UTF-8 sequences
- **Automatable**: ✅ Yes
- **Remediation**: Enable automatic character sanitization
- **Example**:
```typescript
await agentImportTool({ 
  ...params, 
  validateCharacters: true, 
  sanitize: true 
});
```

#### ERR_CHAR_CONTROL
- **Description**: Invalid control characters detected
- **Automatable**: ✅ Yes
- **Remediation**: Enable sanitization to remove control characters
- **Example**:
```typescript
await agentImportTool({ 
  ...params, 
  sanitize: true 
});
```

### Authentication/Permission Errors

#### ERR_AUTH_RLS_DENIED
- **Description**: RLS policy denied access
- **Automatable**: ❌ No
- **Remediation**: Use Service Role key or adjust RLS policies
- **Example**:
```bash
# Ensure SUPABASE_SERVICE_ROLE_KEY is set
export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
```

#### ERR_AUTH_INVALID_KEY
- **Description**: Invalid or missing authentication key
- **Automatable**: ❌ No
- **Remediation**: Verify SUPABASE_SERVICE_ROLE_KEY is correct

### Validation Errors

#### ERR_VALIDATION_SCHEMA
- **Description**: Record does not match schema
- **Automatable**: ❌ No
- **Remediation**: Review schema validation errors and correct data

#### ERR_VALIDATION_REQUIRED
- **Description**: Required field missing
- **Automatable**: ❌ No
- **Remediation**: Ensure all required fields are present in records

### Fatal Errors

#### ERR_FATAL
- **Description**: Unknown or unrecoverable error
- **Automatable**: ❌ No
- **Remediation**: Review error details and consult documentation

## Error Report Format

When imports fail, an error report is generated with the following structure:

```json
{
  "runId": "20251109T143022Z",
  "table": "conversations",
  "totalErrors": 22,
  "errorBreakdown": [
    {
      "code": "ERR_DB_UNIQUE_VIOLATION",
      "pgCode": "23505",
      "count": 15,
      "percentage": 68.2,
      "description": "Duplicate key violates unique constraint"
    }
  ],
  "failedRecords": [
    {
      "record": { "id": "123", "..." },
      "error": {
        "code": "ERR_DB_UNIQUE_VIOLATION",
        "pgCode": "23505",
        "message": "duplicate key value violates unique constraint \"conversations_pkey\"",
        "detail": "Key (id)=(123) already exists."
      }
    }
  ],
  "recoverySteps": [
    {
      "priority": "HIGH",
      "errorCode": "ERR_DB_UNIQUE_VIOLATION",
      "affectedCount": 15,
      "action": "RETRY_WITH_UPSERT",
      "description": "Re-run import with mode: 'upsert' and proper onConflict setting",
      "example": "await agentImportTool({ ...params, mode: 'upsert', onConflict: 'id' });",
      "automatable": true
    }
  ]
}
```

## Using Error Analysis

```typescript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations'
});

if (!result.success) {
  // Read error report
  const analysis = await analyzeImportErrors(result);
  
  // Process recovery steps
  for (const step of analysis.recoverySteps) {
    console.log(`[${step.priority}] ${step.errorCode}: ${step.description}`);
    
    if (step.automatable) {
      console.log('This error can be automatically fixed');
      console.log(`Example: ${step.example}`);
    } else {
      console.log('Manual intervention required');
    }
  }
}
```

## Priority Levels

- **HIGH**: Critical issues that block most/all records (>50% affected)
- **MEDIUM**: Significant issues affecting multiple records (>5 records)
- **LOW**: Minor issues or recommendations

## Best Practices

1. **Always run preflight checks** before importing
2. **Review error reports** to understand failure patterns
3. **Apply automated fixes** when available (e.g., enable upsert)
4. **Follow recovery steps** in priority order
5. **Use dry-run mode** to validate before actual import

## See Also

- [README.md](./README.md) - Quick start guide
- [API.md](./API.md) - Complete API reference
- [EXAMPLES.md](./EXAMPLES.md) - Common use cases

