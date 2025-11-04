# Database Resilience & Transaction Management

Complete database resilience infrastructure for the Training Data Generation platform with automatic transaction management, error classification, and health monitoring.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Health Monitoring](#health-monitoring)
- [Testing](#testing)
- [Best Practices](#best-practices)

## Overview

This module provides three core capabilities:

1. **Transaction Management** (`transaction.ts`) - Atomic multi-step operations with automatic rollback
2. **Error Classification** (`errors.ts`) - User-friendly error messages and recovery guidance
3. **Health Monitoring** (`health.ts`) - Proactive database performance monitoring

## Features

### Transaction Management
- ✅ Automatic BEGIN/COMMIT/ROLLBACK
- ✅ Configurable isolation levels
- ✅ Timeout enforcement (default 30s)
- ✅ Automatic deadlock retry (up to 3 attempts)
- ✅ Error logging and classification
- ✅ Transaction ID tracking

### Error Classification
- ✅ Postgres error code mapping
- ✅ User-friendly error messages
- ✅ Retryability determination
- ✅ Recovery action recommendations
- ✅ Constraint violation details

### Health Monitoring
- ✅ Real-time health status (HEALTHY, DEGRADED, UNHEALTHY, CRITICAL)
- ✅ Connection pool monitoring
- ✅ Query performance tracking
- ✅ Cache hit ratio analysis
- ✅ Automated recommendations
- ✅ Scheduled health checks

## Installation

### 1. Install SQL Functions

Run the SQL setup script in Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard → SQL Editor → New query
# Paste contents of setup-transaction-functions.sql
# Execute
```

Or use the CLI:

```bash
psql -h your-db-host -U your-user -d your-db -f src/lib/database/setup-transaction-functions.sql
```

### 2. Verify Installation

```sql
-- Check that functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%transaction%';

-- Should return:
-- begin_transaction
-- commit_transaction
-- rollback_transaction
```

### 3. Import in Your Code

```typescript
import { 
  withTransaction, 
  withTransactionRetry 
} from '@/lib/database';
```

## Quick Start

### Basic Transaction

```typescript
import { withTransaction } from '@/lib/database';

const result = await withTransaction(async (ctx) => {
  // Step 1: Insert conversation
  const { data: conversation, error: convError } = await ctx.client
    .from('conversations')
    .insert(conversationData)
    .select()
    .single();
  
  if (convError) throw convError;
  
  // Step 2: Insert turns (atomic with step 1)
  const { error: turnsError } = await ctx.client
    .from('conversation_turns')
    .insert(turnsData.map(t => ({ ...t, conversation_id: conversation.id })));
  
  if (turnsError) throw turnsError;
  
  return conversation;
  // Automatic rollback if any step fails!
});
```

### Error Handling

```typescript
import { classifyDatabaseError, getDatabaseErrorMessage } from '@/lib/database';

try {
  await createConversation(data);
} catch (error) {
  const classification = classifyDatabaseError(error);
  
  if (classification.isRetryable) {
    // Retry logic
    await retryOperation();
  } else {
    // Show user-friendly message
    toast.error(classification.userMessage);
    
    // Take recovery action
    if (classification.recoveryAction === 'FIX_DATA') {
      // Guide user to fix input
    }
  }
}
```

### Health Monitoring

```typescript
import { performHealthCheck, DatabaseHealthStatus } from '@/lib/database';

const healthCheck = await performHealthCheck();

if (healthCheck.status === DatabaseHealthStatus.CRITICAL) {
  // Alert administrators
  console.error(healthCheck.message);
  console.log('Recommendations:', healthCheck.recommendations);
}

console.log('Metrics:', healthCheck.metrics);
// {
//   connectionPoolUsage: 45.5,
//   avgQueryTime: 85,
//   cacheHitRatio: 95.2,
//   activeConnections: 45,
//   idleConnections: 10
// }
```

## API Reference

### Transaction Management

#### `withTransaction<T>(fn, config?): Promise<T>`

Execute a function within a database transaction.

**Parameters:**
- `fn: (context: TransactionContext) => Promise<T>` - Function to execute
- `config?: TransactionConfig` - Optional configuration
  - `isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE'` (default: 'READ COMMITTED')
  - `timeout?: number` - Timeout in milliseconds (default: 30000)
  - `retryDeadlocks?: boolean` - Auto-retry deadlocks (default: true)
  - `maxRetries?: number` - Max retry attempts (default: 3)

**Returns:** Result from function execution

**Throws:** `DatabaseError` on failure

#### `withTransactionRetry<T>(fn, config?): Promise<T>`

Execute a function within a transaction with automatic deadlock retry.

**Parameters:** Same as `withTransaction`

**Returns:** Result from function execution

**Example:**
```typescript
const result = await withTransactionRetry(async (ctx) => {
  // This will automatically retry on deadlocks
  const { data, error } = await ctx.client
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
});
```

### Error Classification

#### `classifyDatabaseError(error): DatabaseErrorClassification`

Classify a database error and provide recovery guidance.

**Parameters:**
- `error: unknown` - Error to classify

**Returns:**
```typescript
{
  category: DatabaseErrorCategory;
  isRetryable: boolean;
  recoveryAction: DatabaseRecoveryAction;
  userMessage: string;
  technicalMessage: string;
  constraint?: string;
  field?: string;
}
```

#### `isDatabaseErrorRetryable(error): boolean`

Check if an error can be retried.

#### `getDatabaseErrorMessage(error): string`

Get user-friendly error message.

#### `getDatabaseRecoveryAction(error): DatabaseRecoveryAction`

Get recommended recovery action.

### Health Monitoring

#### `performHealthCheck(thresholds?): Promise<DatabaseHealthCheck>`

Perform a database health check.

**Parameters:**
- `thresholds?: HealthThresholds` - Optional custom thresholds

**Returns:**
```typescript
{
  status: DatabaseHealthStatus;
  message: string;
  metrics: {
    connectionPoolUsage: number;
    avgQueryTime: number;
    cacheHitRatio: number;
    activeConnections: number;
    idleConnections: number;
  };
  recommendations: string[];
  lastChecked: string;
}
```

#### `scheduleHealthChecks(intervalMs, onStatusChange?): () => void`

Schedule periodic health checks.

**Parameters:**
- `intervalMs: number` - Check interval in milliseconds (default: 60000)
- `onStatusChange?: (check: DatabaseHealthCheck) => void` - Callback on status change

**Returns:** Cleanup function to stop checks

## Usage Examples

### Example 1: Conversation Creation with Turns

```typescript
import { withTransaction } from '@/lib/database';

class ConversationService {
  async createConversation(data: ConversationCreateInput) {
    return withTransaction(async (ctx) => {
      // Insert conversation
      const { data: conversation, error: convError } = await ctx.client
        .from('conversations')
        .insert({
          title: data.title,
          user_id: data.userId,
          status: 'active',
        })
        .select()
        .single();
      
      if (convError) throw convError;
      
      // Insert turns (atomic with conversation)
      if (data.turns && data.turns.length > 0) {
        const { error: turnsError } = await ctx.client
          .from('conversation_turns')
          .insert(
            data.turns.map(turn => ({
              ...turn,
              conversation_id: conversation.id,
            }))
          );
        
        if (turnsError) throw turnsError;
      }
      
      return conversation;
    });
  }
}
```

### Example 2: Batch Generation with Retry

```typescript
import { withTransactionRetry } from '@/lib/database';

class BatchGenerationService {
  async updateBatchStatus(batchId: string, status: string) {
    return withTransactionRetry(async (ctx) => {
      // Update batch
      const { data: batch, error: batchError } = await ctx.client
        .from('generation_batches')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', batchId)
        .select()
        .single();
      
      if (batchError) throw batchError;
      
      // Update associated conversations
      const { error: conversationsError } = await ctx.client
        .from('conversations')
        .update({ batch_status: status })
        .eq('batch_id', batchId);
      
      if (conversationsError) throw conversationsError;
      
      return batch;
    }, {
      isolationLevel: 'REPEATABLE READ', // Prevent concurrent updates
      maxRetries: 5, // More retries for batch operations
    });
  }
}
```

### Example 3: Error Handling with Classification

```typescript
import { classifyDatabaseError, DatabaseRecoveryAction } from '@/lib/database';

async function saveConversation(data: ConversationData) {
  try {
    await conversationService.create(data);
  } catch (error) {
    const classification = classifyDatabaseError(error);
    
    // Log for monitoring
    logger.error('Failed to save conversation', {
      category: classification.category,
      retryable: classification.isRetryable,
      action: classification.recoveryAction,
    });
    
    // Handle based on recovery action
    switch (classification.recoveryAction) {
      case DatabaseRecoveryAction.RETRY:
        // Automatic retry
        await retryWithBackoff(() => conversationService.create(data));
        break;
      
      case DatabaseRecoveryAction.FIX_DATA:
        // Show validation errors to user
        showValidationError(classification.userMessage);
        if (classification.field) {
          highlightField(classification.field);
        }
        break;
      
      case DatabaseRecoveryAction.CHECK_NETWORK:
        // Network issue
        showNetworkError();
        break;
      
      case DatabaseRecoveryAction.CHECK_PERMISSIONS:
        // Auth issue
        redirectToLogin();
        break;
      
      default:
        // Unknown error
        showGenericError(classification.userMessage);
    }
  }
}
```

### Example 4: Scheduled Health Monitoring

```typescript
import { scheduleHealthChecks, DatabaseHealthStatus } from '@/lib/database';

// In your app initialization
const stopHealthChecks = scheduleHealthChecks(
  60000, // Check every minute
  (check) => {
    console.log('Health status:', check.status);
    
    if (check.status === DatabaseHealthStatus.CRITICAL) {
      // Send alert to administrators
      alertAdmin({
        level: 'critical',
        message: check.message,
        metrics: check.metrics,
        recommendations: check.recommendations,
      });
    }
    
    if (check.status === DatabaseHealthStatus.DEGRADED) {
      // Log warning
      logger.warn('Database performance degraded', {
        metrics: check.metrics,
        recommendations: check.recommendations,
      });
    }
  }
);

// Clean up on app shutdown
process.on('SIGTERM', () => {
  stopHealthChecks();
});
```

## Error Handling

### Error Categories

| Category | Retryable | Common Causes | Recovery Action |
|----------|-----------|---------------|-----------------|
| CONSTRAINT_VIOLATION | ❌ | Unique key, foreign key, not null, check violations | FIX_DATA |
| CONNECTION_ERROR | ✅ | Network issues, database unavailable | CHECK_NETWORK |
| TRANSACTION_ERROR | ✅ | Deadlocks, serialization failures | RETRY |
| TIMEOUT_ERROR | ✅ | Slow queries, long-running operations | RETRY |
| PERMISSION_ERROR | ❌ | Expired JWT, insufficient permissions | CHECK_PERMISSIONS |
| QUERY_ERROR | ❌ | Invalid query, missing records | NONE |
| UNKNOWN | ❌ | Unexpected errors | CONTACT_ADMIN |

### Postgres Error Codes

The module automatically maps Postgres error codes:

```typescript
// Constraint violations
'23505' → UNIQUE_VIOLATION
'23503' → FOREIGN_KEY_VIOLATION
'23502' → NOT_NULL_VIOLATION
'23514' → CHECK_VIOLATION

// Transaction errors
'40P01' → DEADLOCK_DETECTED
'40001' → SERIALIZATION_FAILURE

// Connection errors
'08000' → CONNECTION_FAILURE
'08003' → CONNECTION_DOES_NOT_EXIST
'08006' → CONNECTION_FAILURE_SQLCLIENT

// Timeouts
'57014' → QUERY_CANCELED

// Supabase specific
'PGRST116' → NO_ROWS
'PGRST301' → JWT_EXPIRED
```

## Health Monitoring

### Health Status Levels

| Status | Description | Action Required |
|--------|-------------|-----------------|
| HEALTHY | All metrics within normal range | None |
| DEGRADED | Some metrics approaching limits | Monitor closely |
| UNHEALTHY | Performance degradation detected | Investigate and optimize |
| CRITICAL | Severe performance issues | Immediate action required |

### Default Thresholds

```typescript
{
  degraded: {
    connectionPoolUsage: 70,  // %
    avgQueryTime: 100,        // ms
    cacheHitRatio: 90,        // %
  },
  unhealthy: {
    connectionPoolUsage: 85,
    avgQueryTime: 250,
    cacheHitRatio: 80,
  },
  critical: {
    connectionPoolUsage: 95,
    avgQueryTime: 500,
    cacheHitRatio: 70,
  },
}
```

### Custom Thresholds

```typescript
const healthCheck = await performHealthCheck({
  degraded: {
    connectionPoolUsage: 60,
    avgQueryTime: 80,
    cacheHitRatio: 92,
  },
  unhealthy: {
    connectionPoolUsage: 75,
    avgQueryTime: 200,
    cacheHitRatio: 85,
  },
  critical: {
    connectionPoolUsage: 90,
    avgQueryTime: 400,
    cacheHitRatio: 75,
  },
});
```

## Testing

### Unit Tests

```bash
npm test src/lib/database/__tests__/transaction.test.ts
npm test src/lib/database/__tests__/errors.test.ts
npm test src/lib/database/__tests__/health.test.ts
```

### Integration Tests

```bash
# Requires running Supabase instance
npm test src/lib/database/__tests__/transaction.integration.test.ts
```

## Best Practices

### 1. Use Transactions for Multi-Step Operations

✅ **Good:**
```typescript
await withTransaction(async (ctx) => {
  await step1(ctx.client);
  await step2(ctx.client);
  await step3(ctx.client);
});
```

❌ **Bad:**
```typescript
await step1(supabase);
await step2(supabase); // If this fails, step1 is already committed!
await step3(supabase);
```

### 2. Choose Appropriate Isolation Levels

- **READ COMMITTED** (default): Most common, good for general use
- **REPEATABLE READ**: Prevent non-repeatable reads
- **SERIALIZABLE**: Maximum isolation, may cause more serialization failures

### 3. Handle Errors Gracefully

```typescript
try {
  await withTransaction(async (ctx) => {
    // Operations
  });
} catch (error) {
  const classification = classifyDatabaseError(error);
  
  if (classification.isRetryable) {
    // Retry
  } else {
    // Show user-friendly message
    toast.error(classification.userMessage);
  }
}
```

### 4. Set Appropriate Timeouts

```typescript
// Short timeout for simple operations
await withTransaction(operation, { timeout: 5000 });

// Longer timeout for complex batch operations
await withTransaction(batchOperation, { timeout: 60000 });
```

### 5. Monitor Health Proactively

```typescript
// Schedule health checks in production
scheduleHealthChecks(60000, (check) => {
  if (check.status !== DatabaseHealthStatus.HEALTHY) {
    alertTeam(check);
  }
});
```

### 6. Use Retry for Deadlock-Prone Operations

```typescript
// Operations that update frequently accessed records
await withTransactionRetry(async (ctx) => {
  await updatePopularRecord(ctx.client);
});
```

## Troubleshooting

### Transaction Functions Not Found

**Error:** `function begin_transaction does not exist`

**Solution:** Run the SQL setup script:
```bash
psql -f src/lib/database/setup-transaction-functions.sql
```

### Transaction Timeouts

**Error:** `Transaction timed out after 30000ms`

**Solution:** Increase timeout or optimize queries:
```typescript
await withTransaction(operation, { timeout: 60000 });
```

### Frequent Deadlocks

**Solution:** Use `withTransactionRetry` or reduce transaction scope:
```typescript
await withTransactionRetry(operation, { maxRetries: 5 });
```

### Health Check Failures

**Error:** `Failed to perform health check`

**Solution:** Ensure `DatabaseHealthService` is properly configured and database RPC functions are installed.

## Support

For issues or questions:
- Check the [test files](`./__tests__`) for usage examples
- Review the [implementation summary](../../../PROMPT-4-IMPLEMENTATION-SUMMARY.md)
- Contact the development team

## License

Part of the Training Data Generation Platform - Internal Use Only

