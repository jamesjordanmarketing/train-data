# Database Resilience - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install SQL Functions (2 minutes)

```bash
# Open Supabase SQL Editor
# Copy and paste contents of setup-transaction-functions.sql
# Execute
```

Or via CLI:
```bash
psql -h your-db-host -U your-user -d your-db -f src/lib/database/setup-transaction-functions.sql
```

### Step 2: Import in Your Code (1 minute)

```typescript
import { withTransaction } from '@/lib/database';
```

### Step 3: Use Transactions (2 minutes)

```typescript
// Before: No transaction ❌
async createConversation(data) {
  const conv = await supabase.from('conversations').insert(data);
  const turns = await supabase.from('turns').insert(turnsData);
  // If turns fail, conversation is already created! 💥
}

// After: With transaction ✅
async createConversation(data) {
  return withTransaction(async (ctx) => {
    const { data: conv, error: convError } = await ctx.client
      .from('conversations')
      .insert(data)
      .select()
      .single();
    
    if (convError) throw convError;
    
    const { error: turnsError } = await ctx.client
      .from('turns')
      .insert(turnsData.map(t => ({ ...t, conversation_id: conv.id })));
    
    if (turnsError) throw turnsError;
    
    return conv;
    // Automatic rollback if anything fails! ✨
  });
}
```

## 🎯 Common Use Cases

### 1. Multi-Step Operations

```typescript
import { withTransaction } from '@/lib/database';

await withTransaction(async (ctx) => {
  // All operations succeed together or fail together
  await step1(ctx.client);
  await step2(ctx.client);
  await step3(ctx.client);
});
```

### 2. Error Handling

```typescript
import { classifyDatabaseError } from '@/lib/database';

try {
  await saveData();
} catch (error) {
  const classification = classifyDatabaseError(error);
  
  if (classification.isRetryable) {
    await retry();
  } else {
    toast.error(classification.userMessage);
  }
}
```

### 3. Health Monitoring

```typescript
import { performHealthCheck, DatabaseHealthStatus } from '@/lib/database';

const health = await performHealthCheck();

if (health.status === DatabaseHealthStatus.CRITICAL) {
  alertAdmin(health);
}
```

## 🔥 Common Patterns

### Atomic Updates

```typescript
await withTransaction(async (ctx) => {
  // Update parent
  await ctx.client
    .from('batches')
    .update({ status: 'completed' })
    .eq('id', batchId);
  
  // Update children atomically
  await ctx.client
    .from('conversations')
    .update({ batch_status: 'completed' })
    .eq('batch_id', batchId);
});
```

### Retry on Deadlock

```typescript
import { withTransactionRetry } from '@/lib/database';

// Automatically retries on deadlocks
await withTransactionRetry(async (ctx) => {
  // High-contention operations
  await updatePopularRecord(ctx.client);
});
```

### Constraint Violation Handling

```typescript
try {
  await createUser(email);
} catch (error) {
  const classification = classifyDatabaseError(error);
  
  if (classification.constraint === 'email') {
    toast.error('Email already exists');
    highlightField('email');
  }
}
```

## ⚡ Best Practices

### ✅ DO

- Use transactions for multi-step operations
- Handle errors with classifyDatabaseError
- Monitor health regularly
- Set appropriate timeouts
- Use withTransactionRetry for deadlock-prone ops

### ❌ DON'T

- Nest transactions (not supported)
- Use transactions for single operations (unnecessary overhead)
- Ignore error classifications
- Set timeouts too short for complex operations

## 🐛 Troubleshooting

### "function begin_transaction does not exist"

**Solution:** Run the SQL setup script
```bash
psql -f src/lib/database/setup-transaction-functions.sql
```

### "Transaction timed out"

**Solution:** Increase timeout
```typescript
await withTransaction(operation, { timeout: 60000 }); // 60 seconds
```

### Frequent Deadlocks

**Solution:** Use retry wrapper
```typescript
await withTransactionRetry(operation, { maxRetries: 5 });
```

## 📚 Next Steps

1. Read [README.md](./README.md) for complete documentation
2. Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details
3. Check [__tests__](./__tests__) for usage examples
4. Set up health monitoring in production

## 🆘 Support

- Check test files for examples
- Review README for detailed API docs
- Contact dev team for assistance

---

**Time to Production:** 5 minutes  
**Risk:** Low  
**Complexity:** Simple

Get started now! 🚀

