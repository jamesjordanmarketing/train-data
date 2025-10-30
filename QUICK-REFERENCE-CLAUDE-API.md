# Quick Reference: Claude API Integration

## Quick Start

### Single Generation

```typescript
// POST /api/conversations/generate
const response = await fetch('/api/conversations/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'uuid-here',
    persona: 'Anxious Investor',
    emotion: 'Fear',
    topic: 'market volatility',
    tier: 'template',
    parameters: {}
  })
});

const { data } = await response.json();
console.log(`Generated: ${data.conversationId}`);
console.log(`Quality: ${data.qualityScore}/10`);
console.log(`Cost: $${data.actualCostUsd.toFixed(4)}`);
```

### Batch Generation

```typescript
// POST /api/conversations/generate-batch
const response = await fetch('/api/conversations/generate-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requests: [
      { templateId: 'uuid-1', persona: 'A', emotion: 'B', topic: 'C', tier: 'template', parameters: {} },
      { templateId: 'uuid-2', persona: 'D', emotion: 'E', topic: 'F', tier: 'scenario', parameters: {} }
    ],
    options: { concurrency: 3 }
  })
});

const { data } = await response.json();
console.log(`Success: ${data.summary.successful}/${data.summary.total}`);
console.log(`Total cost: $${data.summary.totalCost.toFixed(2)}`);
```

### Programmatic Usage

```typescript
import { ConversationGenerator } from '@/lib/conversation-generator';

const generator = new ConversationGenerator({
  rateLimitConfig: {
    windowMs: 60000,
    maxRequests: 50,
    enableQueue: true
  }
});

// Generate
const conversation = await generator.generateSingle({
  templateId: 'uuid',
  persona: 'Investor',
  emotion: 'Curious',
  topic: 'ETFs',
  tier: 'template',
  parameters: {}
});

// Check status
const status = generator.getRateLimitStatus();
console.log(`Remaining: ${status.remaining}/${status.used + status.remaining}`);
```

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional
ANTHROPIC_API_BASE_URL=https://api.anthropic.com/v1
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Rate Limiting Defaults

- Window: 60 seconds
- Max Requests: 50
- Pause Threshold: 90%
- Queue: Enabled

### Retry Defaults

- Max Attempts: 3
- Base Delay: 1 second
- Max Delay: 5 minutes
- Jitter: 0-1000ms

## Cost Reference

### Pricing (Claude 3.5 Sonnet)
- Input: $0.003 per 1K tokens
- Output: $0.015 per 1K tokens

### Example Costs

| Tokens (In/Out) | Cost |
|----------------|------|
| 1000 / 1000 | $0.018 |
| 1500 / 2000 | $0.035 |
| 2000 / 3000 | $0.051 |
| 3000 / 4000 | $0.069 |

## Quality Scoring

### Scoring Criteria

| Criterion | Optimal | Points |
|-----------|---------|--------|
| Turn Count | 8-16 turns | 3 |
| Turn Length | 100-400 chars | 3 |
| Structure | Valid alternation | 4 |
| **Total** | | **10** |

### Status Assignment

- Score ≥ 6: `generated` (ready)
- Score < 6: `needs_revision` (review)

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 201 | Success | N/A |
| 400 | Bad request | Fix input |
| 422 | Validation failed | Check conversation structure |
| 429 | Rate limited | Wait (see Retry-After header) |
| 500 | Internal error | Retry |
| 502 | API error | Check Claude status |

## Common Operations

### Check Rate Limit

```typescript
const status = await fetch('/api/conversations/generate').then(r => r.json());
console.log(status.data); // { used, remaining, resetAt, ... }
```

### Calculate Cost

```typescript
import { calculateCost } from '@/lib/types/generation';
const cost = calculateCost(1500, 2000); // $0.0345
```

### Estimate Tokens

```typescript
import { estimateTokens } from '@/lib/types/generation';
const tokens = estimateTokens('Your text here'); // ~1.3 tokens per word
```

### Get Generation Logs

```typescript
import { generationLogService } from '@/lib/generation-log-service';

// By conversation
const logs = await generationLogService.getByConversation(convId);

// By batch
const batchLogs = await generationLogService.getByRunId(runId);

// Cost summary
const summary = await generationLogService.getCostSummary(
  new Date('2025-01-01'),
  new Date('2025-01-31')
);
console.log(`Total: $${summary.totalCost.toFixed(2)}`);
```

## Troubleshooting

### Rate Limit Issues

```typescript
// Check status
const status = generator.getRateLimitStatus();
if (status.remaining === 0) {
  const waitMs = status.resetAt.getTime() - Date.now();
  console.log(`Wait ${waitMs}ms before retrying`);
}
```

### API Errors

```typescript
try {
  const result = await generator.generateSingle(params);
} catch (error) {
  if (error instanceof ClaudeAPIError) {
    console.error(`Claude API error ${error.status}:`, error.message);
    if (error.isRetryable) {
      console.log('Will retry automatically');
    }
  }
}
```

### Quality Issues

```typescript
// Lower temperature for more consistent output
const params = {
  ...baseParams,
  temperature: 0.6  // Default is 0.7
};

// Increase max tokens if truncated
const params = {
  ...baseParams,
  maxTokens: 4096  // Default is 2048
};
```

## Best Practices

1. **Use batch generation** for multiple conversations
2. **Set concurrency to 3-5** for optimal throughput
3. **Monitor rate limits** before large batches
4. **Review low-quality** conversations (score < 6)
5. **Track costs** with generation logs
6. **Set temperature 0.6-0.8** for consistency
7. **Use templates** for reproducible results

## Links

- Full Guide: `IMPLEMENTATION-GUIDE-CLAUDE-API.md`
- Implementation Summary: `IMPLEMENTATION-SUMMARY-PROMPT-2.md`
- Validation Script: `scripts/validate-claude-integration.ts`
- Tests: `src/lib/__tests__/*.test.ts`

## Support

Check these in order:
1. Error logs in `generation_logs` table
2. Rate limit status endpoint
3. Template configuration
4. Environment variables
5. Claude API status page

