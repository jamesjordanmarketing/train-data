# AI Integration & Rate Limiting System

## Overview

This module provides the core infrastructure for AI-powered conversation generation, including:

- **Sliding Window Rate Limiter** - Prevents API throttling by tracking and limiting requests
- **Priority Request Queue** - Manages request processing order with priority support
- **Queue Processor** - Background worker for processing queued requests
- **Rate Limit UI Feedback** - Real-time status indicators and notifications

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (BatchGenerationModal, API Routes, Components)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI Configuration Layer                     │
│  (ai-config.ts - Model configs, rate limits, costs)         │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Rate Limiter │ │Request Queue │ │Queue Processor│
│              │ │              │ │              │
│ Sliding      │ │Priority-based│ │Background    │
│ Window       │ │FIFO ordering │ │Processing    │
│ Algorithm    │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
        │            │             │
        └────────────┴─────────────┘
                     │
                     ▼
           ┌─────────────────┐
           │  Claude API     │
           │  (Anthropic)    │
           └─────────────────┘
```

## Key Components

### 1. Rate Limiter (`rate-limiter.ts`)

Implements a sliding window algorithm to track API requests and enforce rate limits.

**Features:**
- Tracks requests within configurable time window (default: 60 seconds)
- Enforces rate limits based on API tier (Opus: 40, Sonnet: 50, Haiku: 60 req/min)
- Proactively queues requests at 90% threshold to prevent 429 errors
- Automatic cleanup of expired request timestamps
- Real-time utilization calculation and status reporting

**Usage:**
```typescript
import { getRateLimiter } from '@/lib/ai/rate-limiter';

const rateLimiter = getRateLimiter();

// Check if we can make a request
if (await rateLimiter.checkRateLimit('sonnet')) {
  // Make API call
  rateLimiter.addRequest('unique-request-id');
} else {
  // Queue the request
  console.log('Rate limit reached, queuing request...');
}

// Get current status
const status = rateLimiter.getStatus();
console.log(`Utilization: ${status.utilization}%`);
console.log(`Status: ${status.status}`); // 'healthy' | 'approaching' | 'throttled'
```

**Configuration:**
```typescript
interface RateLimitConfig {
  requestLimit: number;      // Max requests in window (default: 50)
  windowSeconds: number;     // Window duration (default: 60)
  threshold: number;         // Queue threshold 0-1 (default: 0.9)
  pauseMs: number;           // Pause duration on rate limit (default: 5000)
  maxConcurrentRequests: number; // Max concurrent (default: 3)
}
```

### 2. Request Queue (`request-queue.ts`)

Priority-based queue for managing AI generation requests.

**Features:**
- Three priority levels: high, normal, low
- FIFO ordering within same priority
- Metrics tracking (total enqueued, processed, failed)
- Queue statistics (peak size, average wait time)
- Item requeuing with retry count tracking
- Callback support for completion/error handling

**Usage:**
```typescript
import { getRequestQueue } from '@/lib/ai/request-queue';

const queue = getRequestQueue();

// Enqueue a request
const id = queue.enqueue(
  { conversation: 'data' },
  'high',
  {
    onComplete: (result) => console.log('Done!', result),
    onError: (error) => console.error('Failed:', error)
  }
);

// Process queue
while (!queue.isEmpty()) {
  const item = queue.dequeue();
  // Process item...
  queue.markCompleted(item.id);
}

// Get statistics
const stats = queue.getStats();
console.log(`Queue size: ${stats.currentSize}`);
console.log(`Peak: ${stats.peakSize}`);
console.log(`High priority: ${stats.itemsByPriority.high}`);
```

### 3. Queue Processor (`queue-processor.ts`)

Background processor that continuously processes queued requests while respecting rate limits.

**Features:**
- Automatic background processing with configurable polling interval
- Respects rate limiter and concurrency limits
- Automatic pause/resume on rate limit events
- 429 error handling with automatic requeue
- Graceful start/stop lifecycle management

**Usage:**
```typescript
import { getQueueProcessor } from '@/lib/ai/queue-processor';

const processor = getQueueProcessor({
  maxConcurrent: 3,
  pollInterval: 1000,
  autoStart: true
});

// Start processing
processor.start();

// Check status
const status = processor.getStatus();
console.log(`Running: ${status.isRunning}`);
console.log(`Active requests: ${status.activeRequests}/${status.maxConcurrent}`);

// Pause temporarily
processor.pause(5000); // Pause for 5 seconds

// Stop processing
processor.stop();
```

### 4. AI Configuration (`ai-config.ts`)

Centralized configuration for all AI-related settings.

**Model Configurations:**
```typescript
MODEL_CONFIGS = {
  opus: {
    name: 'claude-3-opus-20240229',
    rateLimit: 40,
    rateLimitWindow: 60,
    costPerMillionInputTokens: 15,
    costPerMillionOutputTokens: 75
  },
  sonnet: {
    name: 'claude-3-5-sonnet-20241022',
    rateLimit: 50,
    rateLimitWindow: 60,
    costPerMillionInputTokens: 3,
    costPerMillionOutputTokens: 15
  },
  haiku: {
    name: 'claude-3-haiku-20240307',
    rateLimit: 60,
    rateLimitWindow: 60,
    costPerMillionInputTokens: 0.25,
    costPerMillionOutputTokens: 1.25
  }
}
```

**Utility Functions:**
```typescript
import { getModelConfig, calculateCost } from '@/lib/ai-config';

// Get model configuration
const config = getModelConfig('sonnet');
console.log(`Rate limit: ${config.rateLimit} req/min`);

// Calculate costs
const cost = calculateCost('sonnet', 1000, 500);
console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

### 5. API Endpoint (`/api/ai/queue-status`)

Real-time queue and rate limit status endpoint.

**Response Format:**
```typescript
{
  queueSize: number;              // Current queue size
  currentUtilization: number;     // Rate limit utilization (0-100%)
  estimatedWaitTime: number;      // Estimated wait in milliseconds
  rateLimitStatus: 'healthy' | 'approaching' | 'throttled';
  isProcessing: boolean;          // Queue processor running
  isPaused: boolean;              // Processor paused
  activeRequests: number;         // Current concurrent requests
  maxConcurrent: number;          // Max concurrent limit
  totalProcessed: number;         // Total completed
  totalFailed: number;            // Total failed
  metrics: {
    requestsInWindow: number;
    requestLimit: number;
    windowSeconds: number;
    averageProcessingTime: number;
  }
}
```

**Usage:**
```typescript
// Fetch status
const response = await fetch('/api/ai/queue-status');
const status = await response.json();

console.log(`Queue: ${status.queueSize} items`);
console.log(`Rate: ${status.currentUtilization}%`);
console.log(`Status: ${status.rateLimitStatus}`);
```

## UI Integration

### Rate Limit Indicator Component

The `BatchGenerationModal` includes a visual rate limit indicator that:

- Shows real-time utilization percentage with color coding
  - 🟢 Green (0-70%): Healthy
  - 🟡 Yellow (70-90%): Approaching limit
  - 🔴 Red (90-100%): Throttled
- Displays progress bar with smooth animations
- Shows queue size and active request count
- Displays estimated wait time
- Auto-updates every 3 seconds via polling

### Toast Notifications

Automatic notifications for rate limit events:

```typescript
// Approaching limit (70-90%)
toast.warning('Generation slowing down - approaching API rate limit');

// Rate limited (90%+)
toast.error('Pausing generation for 30 seconds to respect API limits...');

// Resumed
toast.success('Generation resumed');
```

## Rate Limiting Algorithm

### Sliding Window Implementation

The rate limiter uses a **sliding window** algorithm (not fixed window) for accurate rate limiting:

1. **Track Timestamps**: Store timestamp for each request in an array
2. **Clean Expired**: Remove timestamps older than window size
3. **Count Active**: Count remaining timestamps in window
4. **Check Threshold**: Compare against limit × threshold (default: 90%)
5. **Update Status**: Calculate utilization and determine status

**Example:**
```
Window: 60 seconds
Limit: 50 requests
Threshold: 90% (45 requests)

Time: 10:00:00 - Request 1
Time: 10:00:02 - Request 2
...
Time: 10:00:45 - Request 45 (at threshold, start queuing)
Time: 10:01:01 - Request 1 expires, can accept new request
```

### Why Sliding Window?

- **More Accurate**: No burst allowance at window boundaries
- **Fairer**: Distributes capacity evenly over time
- **Predictable**: Consistent behavior regardless of timing

## Error Handling

### 429 Rate Limit Errors

```typescript
try {
  // Make API call
} catch (error) {
  if (error.message.includes('429')) {
    // Automatic handling:
    // 1. Pause queue processor for 30 seconds
    // 2. Requeue the failed request
    // 3. Log rate limit event
    // 4. Show user notification
  }
}
```

### Network Errors

```typescript
// Retry logic (to be implemented in Prompt 2)
{
  maxRetries: 3,
  backoffStrategy: 'exponential',
  maxBackoffMs: 30000
}
```

### Timeout Errors

```typescript
// Configure timeout in ai-config.ts
AI_CONFIG = {
  timeout: 60000, // 60 seconds
  // ...
}
```

## Testing

### Unit Tests

Run comprehensive test suites:

```bash
npm test src/lib/ai/__tests__/rate-limiter.test.ts
npm test src/lib/ai/__tests__/request-queue.test.ts
npm test src/app/api/ai/__tests__/queue-status.test.ts
```

### Manual Testing

1. **Rate Limit Simulation**:
   ```typescript
   // Fill rate limiter to threshold
   const rateLimiter = getRateLimiter();
   for (let i = 0; i < 45; i++) {
     rateLimiter.addRequest(`test${i}`);
   }
   // Observe UI changes to "throttled" state
   ```

2. **Queue Priority Testing**:
   ```typescript
   const queue = getRequestQueue();
   queue.enqueue({ data: 'low' }, 'low');
   queue.enqueue({ data: 'high' }, 'high');
   queue.enqueue({ data: 'normal' }, 'normal');
   
   console.log(queue.dequeue()?.payload.data); // 'high'
   console.log(queue.dequeue()?.payload.data); // 'normal'
   console.log(queue.dequeue()?.payload.data); // 'low'
   ```

3. **End-to-End Testing**:
   - Open BatchGenerationModal
   - Start generation with 50+ conversations
   - Observe rate limit indicator updating in real-time
   - Verify pause/resume behavior at 90% threshold
   - Check toast notifications appear at key events

## Performance Considerations

### Memory Management

- **Request Tracking**: Automatically cleans expired timestamps (max window size)
- **Event Log**: Caps at 100 events to prevent unbounded growth
- **Processing Times**: Keeps last 100 for average calculation

### Optimization Tips

1. **Adjust Polling Interval**: Increase from 3s to 5s for lower server load
2. **Batch Operations**: Process multiple items when below threshold
3. **Use Appropriate Priority**: Reserve 'high' for user-facing requests
4. **Monitor Metrics**: Use `getMetrics()` to identify bottlenecks

### Scalability

**Current (In-Memory):**
- Single server instance
- Lost on server restart
- Suitable for dev/staging

**Production (Redis):**
```typescript
// Future enhancement for distributed systems
class RedisRateLimiter extends RateLimiter {
  // Use Redis sorted set for distributed tracking
  // TTL handles automatic cleanup
  // Works across multiple server instances
}
```

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional
ANTHROPIC_API_BASE_URL=https://api.anthropic.com/v1
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

## Troubleshooting

### Rate limiter not initialized

**Error**: `RateLimiter not initialized. Provide config on first call.`

**Solution**: Ensure `ai-config.ts` is imported before using rate limiter:
```typescript
import '@/lib/ai-config'; // Initialize singleton
import { getRateLimiter } from '@/lib/ai/rate-limiter';
```

### Queue not processing

**Check**:
```typescript
const processor = getQueueProcessor();
console.log(processor.getStatus());

// If not running:
processor.start();
```

### High utilization but no requests

**Issue**: Old timestamps not being cleaned

**Solution**: Call `removeExpiredRequests()` or wait for next check:
```typescript
rateLimiter.removeExpiredRequests();
```

### UI not updating

**Check polling**:
- Verify modal is open (`showBatchModal === true`)
- Check browser console for fetch errors
- Verify API endpoint is running (check `/api/ai/queue-status`)

## Best Practices

1. **Always Check Before Queuing**: Use `canMakeRequest()` before adding to queue
2. **Use Appropriate Priorities**: High for interactive, normal for batch, low for background
3. **Handle Callbacks**: Always provide error handlers for queued items
4. **Monitor Metrics**: Regularly check `getMetrics()` for capacity planning
5. **Test Rate Limits**: Simulate high load to verify behavior
6. **Set Reasonable Concurrency**: Default 3 is safe, adjust based on API tier
7. **Clean Up on Unmount**: Stop processor when component unmounts

## Future Enhancements

- [ ] Redis-based distributed rate limiting
- [ ] Persistent queue (survive server restarts)
- [ ] Advanced retry strategies (exponential backoff, jitter)
- [ ] Rate limit prediction (ML-based capacity forecasting)
- [ ] Multi-tier rate limiting (per-user quotas)
- [ ] WebSocket-based real-time updates (replace polling)
- [ ] Rate limit analytics dashboard
- [ ] Automatic API tier detection and optimization

## References

- [Claude API Rate Limits](https://docs.anthropic.com/claude/reference/rate-limits)
- [Sliding Window Algorithm](https://en.wikipedia.org/wiki/Sliding_window_protocol)
- [Priority Queue Data Structure](https://en.wikipedia.org/wiki/Priority_queue)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review test files for usage examples
3. Check console logs in development mode
4. Refer to inline JSDoc comments in source code

---

**Last Updated**: Implementation complete as of Prompt 1 (AI Configuration & Rate Limiting Infrastructure)  
**Version**: 1.0.0  
**Maintainer**: Development Team

