# Batch Generation Services Documentation

## Overview

The Batch Generation Services provide robust orchestration for generating 90-100 conversations automatically with real-time progress tracking, error recovery, and cost estimation.

## Services

### 1. BatchGenerationService

Core orchestration service that manages parallel processing of conversation generation jobs.

#### Key Features

- **Concurrency Control**: Process 1-10 conversations in parallel (default: 3)
- **Real-time Progress Tracking**: Updates after each conversation completion
- **Pause/Resume**: Pause jobs and resume from where they left off
- **Error Handling**: Continue or stop on failures (configurable)
- **Job Lifecycle Management**: Complete state machine for job status

#### Usage Example

```typescript
import { batchGenerationService } from '@/lib/services';

// Start a batch generation job
const job = await batchGenerationService.startBatchGeneration({
  name: 'Generate Template Tier Conversations',
  tier: 'template',
  conversationIds: ['conv_1', 'conv_2', 'conv_3'],
  sharedParameters: {
    persona: 'Expert',
    emotion: 'Enthusiastic',
    topic: 'Technology'
  },
  concurrentProcessing: 3,
  errorHandling: 'continue',
  priority: 'normal',
  userId: 'user-123'
});

console.log('Job started:', job.id);

// Monitor progress
const status = await batchGenerationService.getJobStatus(job.id);
console.log(`Progress: ${status.progress}%`);
console.log(`Completed: ${status.completedItems}/${status.totalItems}`);
console.log(`Time remaining: ${status.estimatedTimeRemaining}`);

// Pause job
await batchGenerationService.pauseJob(job.id);

// Resume job
await batchGenerationService.resumeJob(job.id);

// Cancel job
await batchGenerationService.cancelJob(job.id);
```

#### API Reference

##### `startBatchGeneration(config: BatchGenerationConfig): Promise<BatchJob>`

Creates and starts a new batch generation job.

**Parameters:**
- `name`: Job name (required)
- `tier`: Tier to generate (optional, generates all tiers if not specified)
- `conversationIds`: Specific conversation IDs (optional)
- `templateId`: Template to use (optional)
- `sharedParameters`: Parameters applied to all conversations (required)
- `concurrentProcessing`: Number of parallel jobs (1-10, default: 3)
- `errorHandling`: 'continue' or 'stop' (default: 'continue')
- `priority`: 'high', 'normal', or 'low' (default: 'normal')
- `userId`: User ID (required)

**Returns:** BatchJob object with job ID and initial status

##### `processBatchJob(jobId: string): Promise<void>`

Processes a batch job with concurrency control. Called automatically by `startBatchGeneration`.

##### `pauseJob(jobId: string): Promise<BatchJob>`

Pauses a running job. In-progress conversations complete, but no new ones start.

##### `resumeJob(jobId: string): Promise<BatchJob>`

Resumes a paused job from where it left off.

##### `cancelJob(jobId: string): Promise<BatchJob>`

Cancels a job. In-progress conversations complete, remaining are marked cancelled.

##### `getJobStatus(jobId: string): Promise<BatchJobStatus>`

Gets current job status with progress data.

**Returns:**
- Job details
- Progress percentage
- Completed/failed/successful item counts
- Elapsed time
- Estimated time remaining
- Items per minute processing rate
- Currently processing items

##### `estimateBatch(config: BatchGenerationConfig): Promise<{ cost, time }>`

Provides cost and time estimates before starting a job.

---

### 2. BatchEstimator

Service for calculating cost and time estimates for batch generation jobs.

#### Key Features

- **Token-based Cost Calculation**: Uses Claude API pricing
- **Tier-specific Estimates**: Different token counts per tier
- **Rate Limit Awareness**: Factors in API rate limits
- **Variance Analysis**: Compare estimates vs actual results

#### Usage Example

```typescript
import { batchEstimator } from '@/lib/services';

// Estimate cost
const costEstimate = await batchEstimator.estimateBatchCost(100, 'scenario');
console.log(`Total cost: $${costEstimate.totalCost}`);
console.log(`Per conversation: $${costEstimate.costPerConversation}`);

// Estimate time
const timeEstimate = await batchEstimator.estimateBatchTime(100, 3, 50);
console.log(`Estimated time: ${timeEstimate.estimatedTimeFormatted}`);
console.log(`Processing rate: ${timeEstimate.itemsPerMinute} items/min`);

// Get comprehensive estimate
const estimate = await batchEstimator.getComprehensiveEstimate({
  conversationCount: 90,
  tier: 'scenario',
  concurrency: 3,
  rateLimit: 50,
  useHistoricalData: true
});

console.log('Summary:', estimate.summary);
```

#### API Reference

##### `estimateBatchCost(count: number, tier?: TierType): Promise<CostEstimate>`

Calculates cost estimate for a batch of conversations.

**Parameters:**
- `count`: Number of conversations
- `tier`: Tier type (optional, defaults to 'scenario')

**Returns:**
- `conversationCount`: Number of conversations
- `costPerConversation`: Cost per conversation
- `totalCost`: Total estimated cost
- `inputTokensPerConversation`: Average input tokens
- `outputTokensPerConversation`: Average output tokens
- `totalInputTokens`: Total input tokens
- `totalOutputTokens`: Total output tokens
- `breakdown`: Cost breakdown by input/output

**Token Estimates by Tier:**
- **Template**: 2,000 input + 3,000 output tokens (~$0.26/conversation)
- **Scenario**: 2,500 input + 4,000 output tokens (~$0.34/conversation)
- **Edge Case**: 3,000 input + 5,000 output tokens (~$0.42/conversation)

##### `estimateBatchTime(count: number, concurrency: number, rateLimit?: number): Promise<TimeEstimate>`

Calculates time estimate for a batch.

**Parameters:**
- `count`: Number of conversations
- `concurrency`: Parallel processing count
- `rateLimit`: API rate limit in requests/minute (default: 50)

**Returns:**
- `estimatedTimeSeconds`: Time in seconds
- `estimatedTimeMinutes`: Time in minutes
- `estimatedTimeHours`: Time in hours (if > 1 hour)
- `estimatedTimeFormatted`: Human-readable format
- `itemsPerMinute`: Processing rate
- `concurrency`: Actual concurrency (may be limited by rate limit)
- `rateLimitApplied`: Whether rate limiting affected concurrency

**Performance Assumptions:**
- Average generation time: 20 seconds per conversation
- Default rate limit: 50 requests per minute
- Overhead buffer: 10%

##### `getHistoricalAverage(tier?: TierType): Promise<HistoricalStats>`

Gets historical statistics for more accurate estimates.

**Returns:**
- `tier`: Tier type
- `avgInputTokens`: Average input tokens
- `avgOutputTokens`: Average output tokens
- `avgCostPerConversation`: Average cost
- `avgDurationSeconds`: Average duration
- `sampleSize`: Number of historical samples
- `confidenceLevel`: 'high', 'medium', or 'low'

##### `getComprehensiveEstimate(params: BatchEstimateParams): Promise<ComprehensiveEstimate>`

Gets comprehensive estimate with all data.

**Parameters:**
- `conversationCount`: Number of conversations (required)
- `tier`: Tier type (optional)
- `concurrency`: Parallel processing count (default: 3)
- `rateLimit`: API rate limit (default: 50)
- `useHistoricalData`: Include historical stats (default: false)

##### `calculateCostVariance(estimated: number, actual: number): VarianceResult`

Calculates variance between estimated and actual cost.

**Returns:**
- `variance`: Difference (actual - estimated)
- `percentageDiff`: Percentage difference
- `withinMargin`: Whether within 10% margin

##### `calculateTimeVariance(estimatedSeconds: number, actualSeconds: number): VarianceResult`

Calculates variance between estimated and actual time.

**Returns:**
- `variance`: Difference in seconds
- `percentageDiff`: Percentage difference
- `withinMargin`: Whether within 20% margin

---

## State Machine

### Job Status Flow

```
queued → processing → completed
              ↓
           paused → processing
              ↓
          cancelled

         failed (on error with errorHandling: 'stop')
```

### Item Status Flow

```
queued → processing → completed
              ↓
           failed (on error)
```

---

## Error Handling

### Error Handling Modes

1. **Continue Mode** (default)
   - Job continues processing remaining items
   - Failed items logged with error messages
   - Job completes with partial success

2. **Stop Mode**
   - Job stops on first error
   - Job status set to 'failed'
   - Remaining items stay 'queued'

### Error Recovery

- Individual conversation failures don't crash the entire job
- Failed items include error messages for debugging
- In-progress conversations complete before pause/cancel
- Job can be resumed after pause

---

## Concurrency Control

### Settings

- **Min Concurrency**: 1 (sequential)
- **Default Concurrency**: 3 (balanced)
- **Max Concurrency**: 10 (aggressive)

### Rate Limiting

The service automatically respects API rate limits:

- Default: 50 requests/minute
- Adjusts concurrency if rate limit would be exceeded
- Adds 10% overhead buffer for safety

### Recommendations

- **Template tier**: Concurrency 3-5
- **Scenario tier**: Concurrency 3
- **Edge case tier**: Concurrency 2-3
- **Mixed tiers**: Concurrency 3

---

## Progress Tracking

### Real-time Updates

- Progress updated after each conversation completes
- Elapsed time calculated from job start
- Estimated time remaining based on current rate
- Items per minute calculated dynamically

### Progress Data

```typescript
{
  progress: 45,                          // Percentage (0-100)
  completedItems: 45,                    // Total completed
  failedItems: 3,                        // Total failed
  successfulItems: 42,                   // Successful only
  totalItems: 100,                       // Total to process
  elapsedTime: "15 minutes",             // Time elapsed
  estimatedTimeRemaining: "18 minutes",  // Time remaining
  itemsPerMinute: 3.0                    // Processing rate
}
```

---

## Testing

### Running Tests

```bash
# Run all service tests
npm test src/lib/services/__tests__/

# Run specific test file
npm test batch-generation-service.test.ts
npm test batch-estimator.test.ts

# Watch mode
npm test -- --watch
```

### Test Coverage

- ✅ Batch job creation and initialization
- ✅ Parallel processing with concurrency control
- ✅ Progress tracking and updates
- ✅ Pause/resume functionality
- ✅ Cancellation handling
- ✅ Error handling (continue/stop modes)
- ✅ Cost estimation accuracy
- ✅ Time estimation accuracy
- ✅ Rate limiting behavior
- ✅ Edge cases and validation

---

## Integration with UI

### Example: Progress Display Component

```typescript
import { batchGenerationService } from '@/lib/services';
import { useState, useEffect } from 'react';

function BatchProgressDisplay({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const jobStatus = await batchGenerationService.getJobStatus(jobId);
      setStatus(jobStatus);

      if (jobStatus.status === 'completed' || jobStatus.status === 'cancelled') {
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [jobId]);

  if (!status) return <div>Loading...</div>;

  return (
    <div>
      <h3>{status.name}</h3>
      <div>Status: {status.status}</div>
      <div>Progress: {status.progress}%</div>
      <div>
        Completed: {status.successfulItems} / {status.totalItems}
        {status.failedItems > 0 && ` (${status.failedItems} failed)`}
      </div>
      <div>Elapsed: {status.elapsedTime}</div>
      <div>Remaining: {status.estimatedTimeRemaining}</div>
      <div>Rate: {status.itemsPerMinute} items/min</div>
      
      <div>
        {status.status === 'processing' && (
          <>
            <button onClick={() => batchGenerationService.pauseJob(jobId)}>
              Pause
            </button>
            <button onClick={() => batchGenerationService.cancelJob(jobId)}>
              Cancel
            </button>
          </>
        )}
        {status.status === 'paused' && (
          <button onClick={() => batchGenerationService.resumeJob(jobId)}>
            Resume
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Performance Benchmarks

### Typical Performance (Concurrency: 3)

| Conversations | Estimated Time | Estimated Cost | Actual Time* | Actual Cost* |
|--------------|----------------|----------------|--------------|--------------|
| 10           | ~4 minutes     | $2.55-4.20     | ~3-5 min     | Within 10%   |
| 30           | ~11 minutes    | $7.65-12.60    | ~10-13 min   | Within 10%   |
| 90           | ~33 minutes    | $23.40-37.80   | ~30-40 min   | Within 10%   |

*Actual performance may vary based on API response times and network conditions.

---

## Best Practices

### 1. Start Small
- Test with 5-10 conversations first
- Validate results before scaling up
- Monitor cost and time accuracy

### 2. Use Appropriate Concurrency
- Start with default (3)
- Increase for template tier
- Decrease for edge cases

### 3. Handle Errors Gracefully
- Use 'continue' mode for resilience
- Review failed items after completion
- Implement retry logic for critical failures

### 4. Monitor Progress
- Poll `getJobStatus` every 2-5 seconds
- Display progress to users
- Alert on prolonged failures

### 5. Cost Management
- Always run estimates before starting
- Set budget alerts
- Review actual vs estimated costs

---

## Troubleshooting

### Job Stuck in Processing

**Possible causes:**
- API rate limiting
- Network issues
- Individual conversation hanging

**Solutions:**
1. Check job status: `getJobStatus(jobId)`
2. Review currently processing items
3. Pause and resume if necessary
4. Check logs for errors

### High Failure Rate

**Possible causes:**
- Invalid parameters
- Template errors
- API quota exceeded

**Solutions:**
1. Review failed item error messages
2. Test template individually
3. Reduce concurrency
4. Check API status

### Slow Progress

**Possible causes:**
- Low concurrency
- Rate limiting
- Complex conversations

**Solutions:**
1. Increase concurrency (if not rate limited)
2. Check `itemsPerMinute` rate
3. Review API response times
4. Consider tier complexity

---

## Future Enhancements

- [ ] Priority queue processing
- [ ] Retry failed items automatically
- [ ] Real-time websocket updates
- [ ] Historical data analysis
- [ ] Cost optimization recommendations
- [ ] Scheduled batch jobs
- [ ] Parallel job execution

---

## Support

For issues or questions:
1. Check test files for usage examples
2. Review error messages in failed items
3. Monitor job status and progress
4. Consult API documentation

## License

Internal use only - BrightHub BRun Platform

