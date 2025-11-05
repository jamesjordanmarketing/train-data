# Database Services - Quick Reference Guide

## Import Services

```typescript
// Import all services
import { conversationService, batchJobService, generationLogService } from '@/lib/services'

// Or import types
import type { Conversation, BatchJob, ConversationStatus } from '@/lib/services'
```

---

## Conversation Service

### Create Conversation
```typescript
const conversation = await conversationService.create(
  {
    persona: 'Anxious Investor',
    emotion: 'Fear',
    tier: 'template',
    status: 'generated',
    createdBy: userId
  },
  [
    { role: 'user', content: '...', timestamp: '...', tokenCount: 50 },
    { role: 'assistant', content: '...', timestamp: '...', tokenCount: 150 }
  ]
)
```

### Get Conversation
```typescript
const conv = await conversationService.getById(id, true) // includeTurns=true
```

### Filter Conversations
```typescript
const conversations = await conversationService.getAll({
  tier: ['template'],
  status: ['pending_review'],
  qualityScoreMin: 6
})
```

### Update Status
```typescript
await conversationService.updateStatus(id, 'approved', {
  id: 'review_123',
  action: 'approved',
  performedBy: userId,
  timestamp: new Date().toISOString(),
  comment: 'Great quality'
})
```

### Search
```typescript
const results = await conversationService.searchConversations('investment')
```

---

## Batch Job Service

### Create Batch Job
```typescript
const job = await batchJobService.createJob(
  {
    name: 'Generate Templates Batch 1',
    priority: 'high',
    createdBy: userId,
    configuration: {
      tier: 'template',
      sharedParameters: {},
      concurrentProcessing: 3,
      errorHandling: 'continue'
    }
  },
  [
    { position: 1, topic: 'Investment', tier: 'template', parameters: {} },
    { position: 2, topic: 'Risk', tier: 'template', parameters: {} }
  ]
)
```

### Track Progress
```typescript
await batchJobService.incrementProgress(
  jobId,
  itemId,
  'completed',
  conversationId // optional
)
```

### Get Active Jobs
```typescript
const activeJobs = await batchJobService.getActiveJobs(userId)
```

### Cancel Job
```typescript
await batchJobService.cancelJob(jobId)
```

---

## Generation Log Service

### Log Generation
```typescript
await generationLogService.logGeneration({
  conversationId,
  runId: batchJobId,
  requestPayload: { prompt: '...', model: 'claude-sonnet-4' },
  responsePayload: { content: '...', usage: {} },
  modelUsed: 'claude-sonnet-4-5-20250929',
  inputTokens: 1500,
  outputTokens: 2500,
  durationMs: 3200,
  status: 'success',
  createdBy: userId
})
```

### Get Cost Summary
```typescript
const summary = await generationLogService.getCostSummary(
  '2025-01-01T00:00:00Z',
  '2025-01-31T23:59:59Z'
)

console.log(`Cost: $${summary.totalCost.toFixed(2)}`)
console.log(`Success: ${summary.successfulRequests}/${summary.totalRequests}`)
```

### Get Logs
```typescript
// By conversation
const logs = await generationLogService.getLogsByConversation(conversationId)

// By batch job
const logs = await generationLogService.getLogsByRunId(batchJobId)

// By date range
const logs = await generationLogService.getLogsByDateRange(from, to)
```

---

## Common Patterns

### Transaction Pattern (Create Conversation + Turns)
```typescript
try {
  // Insert conversation
  const conv = await supabase.from('conversations').insert({...})
  
  // Insert turns
  const turns = await supabase.from('conversation_turns').insert([...])
  
  // Rollback on failure
  if (turnsError) {
    await supabase.from('conversations').delete().eq('id', conv.id)
    throw turnsError
  }
} catch (error) {
  console.error('Transaction failed:', error)
  throw error
}
```

### Error Handling
```typescript
try {
  const result = await conversationService.create(...)
  return result
} catch (error) {
  console.error('Error creating conversation:', error)
  // Handle or re-throw
  throw error
}
```

### Filtering with Multiple Conditions
```typescript
const conversations = await conversationService.getAll({
  tier: ['template', 'scenario'],
  status: ['pending_review', 'generated'],
  qualityScoreMin: 6,
  dateFrom: '2025-01-01',
  searchQuery: 'investment'
})
```

---

## Type Definitions

```typescript
type ConversationStatus = 
  | 'draft' 
  | 'generated' 
  | 'pending_review' 
  | 'approved' 
  | 'rejected' 
  | 'needs_revision' 
  | 'failed'

type TierType = 'template' | 'scenario' | 'edge_case'

type BatchJobStatus = 
  | 'queued' 
  | 'processing' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'cancelled'

interface Conversation {
  id: string
  title: string
  persona: string
  emotion: string
  tier: TierType
  status: ConversationStatus
  qualityScore: number
  turns: ConversationTurn[]
  totalTurns: number
  totalTokens: number
  // ... more fields
}
```

---

## Performance Tips

1. **Exclude turns when not needed:**
   ```typescript
   const conversations = await conversationService.getAll() // No turns loaded
   ```

2. **Use indexed filters:**
   ```typescript
   // Fast (uses index)
   .getAll({ status: ['approved'], tier: ['template'] })
   
   // Slower (full text search, limited to 50 results)
   .searchConversations('investment')
   ```

3. **Batch operations:**
   ```typescript
   // Create multiple items at once
   await batchJobService.createJob(job, [item1, item2, item3, ...])
   ```

4. **Pagination:** Implement in production for large datasets

---

## Database Tables

- `conversations` - Main conversation records
- `conversation_turns` - Individual user/assistant turns
- `batch_jobs` - Batch generation jobs
- `batch_items` - Individual items in batch jobs
- `generation_logs` - AI API call logs and costs

---

## Files Location

```
src/lib/services/
├── conversation-service.ts     # Conversation CRUD + transactions
├── batch-job-service.ts        # Batch job management
├── generation-log-service.ts   # Generation logging + analytics
└── index.ts                    # Barrel exports
```

---

## Next Steps

1. **Manual Testing:** Run through test checklist in implementation doc
2. **Integration:** Use services in API routes and components
3. **Monitoring:** Track query performance with Supabase dashboard
4. **Optimization:** Add pagination for large datasets

---

**For detailed documentation, see:** `PROMPT-1-IMPLEMENTATION-COMPLETE.md`

