# Claude API Integration Implementation Guide

## Overview

This document provides a comprehensive guide to the Claude API integration with rate limiting, retry logic, and cost tracking for the Interactive LoRA Conversation Generation platform.

## Architecture

### Components

1. **Rate Limiter** (`src/lib/rate-limiter.ts`)
   - Sliding window algorithm
   - Configurable limits and thresholds
   - Request queuing
   - Multi-key support

2. **Retry Manager** (`src/lib/retry-manager.ts`)
   - Exponential backoff with jitter
   - Retryable error detection
   - Configurable retry attempts

3. **Conversation Generator** (`src/lib/conversation-generator.ts`)
   - Core generation engine
   - Claude API integration
   - Quality scoring
   - Database persistence

4. **API Routes**
   - `/api/conversations/generate` - Single generation
   - `/api/conversations/generate-batch` - Batch generation

## Usage Examples

### Single Conversation Generation

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
    parameters: {
      scenario: 'market_downturn',
      complexity: 'medium'
    },
    temperature: 0.7,
    maxTokens: 2048
  })
});

const result = await response.json();
console.log(result.data); // Generated conversation
console.log(result.metadata); // Quality score, cost, duration
```

### Batch Generation

```typescript
// POST /api/conversations/generate-batch
const response = await fetch('/api/conversations/generate-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requests: [
      {
        templateId: 'uuid-1',
        persona: 'Anxious Investor',
        emotion: 'Fear',
        topic: 'retirement planning',
        tier: 'template',
        parameters: {}
      },
      {
        templateId: 'uuid-2',
        persona: 'Confident Advisor',
        emotion: 'Calm',
        topic: 'portfolio diversification',
        tier: 'scenario',
        parameters: {}
      }
      // ... up to 100 requests
    ],
    options: {
      concurrency: 3,
      stopOnError: false
    }
  })
});

const result = await response.json();
console.log(`Generated ${result.data.summary.successful}/${result.data.summary.total} conversations`);
console.log(`Total cost: $${result.data.summary.totalCost.toFixed(2)}`);
```

### Programmatic Usage

```typescript
import { ConversationGenerator } from '@/lib/conversation-generator';

const generator = new ConversationGenerator({
  rateLimitConfig: {
    windowMs: 60000, // 1 minute
    maxRequests: 50,
    enableQueue: true,
    pauseThreshold: 0.9
  }
});

// Generate single conversation
const conversation = await generator.generateSingle({
  templateId: 'uuid-here',
  persona: 'Anxious Investor',
  emotion: 'Fear',
  topic: 'market volatility',
  tier: 'template',
  parameters: {}
});

// Check rate limit status
const status = generator.getRateLimitStatus();
console.log(`${status.remaining} requests remaining`);
```

## Configuration

### Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional (with defaults)
ANTHROPIC_API_BASE_URL=https://api.anthropic.com/v1
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Rate Limiting

Default configuration:
- Window: 60 seconds (60000ms)
- Max requests: 50
- Pause threshold: 90%
- Queue enabled: Yes

To customize:

```typescript
const generator = new ConversationGenerator({
  rateLimitConfig: {
    windowMs: 120000,     // 2 minutes
    maxRequests: 100,     // 100 requests per window
    enableQueue: true,
    pauseThreshold: 0.85  // Pause at 85%
  }
});
```

### Retry Logic

Default configuration:
- Max attempts: 3
- Base delay: 1000ms
- Max delay: 300000ms (5 minutes)
- Jitter: 0-1000ms

Retryable errors:
- 429 (Rate Limit)
- 408, 504 (Timeout)
- 5xx (Server errors)
- Network errors

Non-retryable errors:
- 400, 401, 403, 404 (Client errors)
- Validation errors

## Quality Scoring

Conversations are scored 1-10 based on:

### Turn Count (0-3 points)
- **3 points**: 8-16 turns (optimal)
- **2 points**: 6-20 turns (good)
- **1 point**: 4+ turns (acceptable)

### Average Turn Length (0-3 points)
- **3 points**: 100-400 characters (optimal)
- **2 points**: 50-600 characters (good)
- **1 point**: 20+ characters (acceptable)

### Structure (0-4 points)
- **4 points**: Valid role alternation (user → assistant → user...)
- **0 points**: Invalid structure

Total score determines status:
- **Score ≥ 6**: Status = `generated` (ready for review)
- **Score < 6**: Status = `needs_revision` (requires manual review)

## Cost Tracking

### Pricing (Claude 3.5 Sonnet)
- Input: $0.003 per 1K tokens
- Output: $0.015 per 1K tokens

### Example Calculation

```typescript
// Input: 1500 tokens, Output: 2000 tokens
const inputCost = (1500 / 1000) * 0.003;   // $0.0045
const outputCost = (2000 / 1000) * 0.015;  // $0.03
const totalCost = inputCost + outputCost;  // $0.0345
```

### Cost Logging

All costs are tracked in the `generation_logs` table:
- Per-conversation costs
- Per-batch summaries
- Cumulative totals

Query cost summary:

```typescript
import { generationLogService } from '@/lib/generation-log-service';

const summary = await generationLogService.getCostSummary(
  new Date('2025-01-01'),
  new Date('2025-01-31')
);

console.log(`Total cost: $${summary.totalCost.toFixed(2)}`);
console.log(`Avg per request: $${summary.avgCostPerRequest.toFixed(4)}`);
```

## Error Handling

### Error Types

1. **ClaudeAPIError** - Claude API failures
   ```typescript
   {
     status: 429,
     details: { ... },
     message: "Rate limit exceeded"
   }
   ```

2. **RateLimitError** - Local rate limit exceeded
   ```typescript
   {
     retryAfter: 5000 // milliseconds
   }
   ```

3. **ParseError** - Response parsing failed
   ```typescript
   {
     message: "No JSON found in response",
     content: "..." // Raw response
   }
   ```

4. **GenerationValidationError** - Invalid conversation structure
   ```typescript
   {
     message: "Invalid role sequence",
     details: { ... }
   }
   ```

### HTTP Status Codes

- **201** - Success
- **400** - Validation error
- **422** - Generation validation error
- **429** - Rate limit exceeded (includes Retry-After header)
- **500** - Internal error
- **502** - Claude API error

## Performance Metrics

### Rate Limit Status

```typescript
// GET /api/conversations/generate
const status = await fetch('/api/conversations/generate').then(r => r.json());

console.log(status.data);
// {
//   used: 25,
//   remaining: 25,
//   resetAt: "2025-01-01T12:35:00Z",
//   queueLength: 0,
//   isPaused: false
// }
```

### Generation Metrics

Monitor via `generation_logs`:
- Success rate
- Average duration
- P50, P95, P99 latencies
- Cost per conversation
- Retry attempts

## Testing

### Unit Tests

```bash
npm test src/lib/__tests__/rate-limiter.test.ts
npm test src/lib/__tests__/retry-manager.test.ts
npm test src/lib/__tests__/conversation-generator.test.ts
```

### Manual Testing

1. **Rate Limiting Test**
   ```typescript
   // Generate 20 requests simultaneously
   const promises = Array(20).fill(null).map(() =>
     fetch('/api/conversations/generate', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ ... })
     })
   );
   
   const results = await Promise.allSettled(promises);
   // All should succeed, some queued
   ```

2. **Retry Logic Test**
   ```typescript
   // Simulate API failure by using invalid API key temporarily
   // Should retry 3 times with exponential backoff
   ```

3. **Cost Calculation Test**
   ```typescript
   const { calculateCost } = require('./src/lib/types/generation');
   
   const cost = calculateCost(1500, 2000);
   console.assert(
     Math.abs(cost - 0.0345) < 0.0001,
     'Cost calculation correct'
   );
   ```

## Best Practices

1. **Always use batch generation** for multiple conversations (more efficient)
2. **Monitor rate limit status** before large generation runs
3. **Set appropriate concurrency** (3-5 for most cases)
4. **Log all generations** for debugging and cost tracking
5. **Review low-quality conversations** (score < 6) manually
6. **Set budget alerts** for cost tracking
7. **Use templates** instead of raw prompts for consistency

## Troubleshooting

### Rate Limit Exceeded

**Symptom**: 429 errors or requests queuing

**Solution**:
- Reduce concurrency in batch generation
- Increase `windowMs` or `maxRequests` if you have higher API limits
- Spread generation over time

### Generation Quality Issues

**Symptom**: Low quality scores (< 6)

**Solutions**:
- Adjust temperature (0.6-0.8 for more consistent output)
- Refine template prompts
- Increase maxTokens if conversations are truncated
- Review and improve template structure

### Cost Overruns

**Symptom**: Higher costs than expected

**Solutions**:
- Use shorter templates to reduce input tokens
- Set lower maxTokens limits
- Pre-estimate costs before large batches
- Review and optimize prompts

### Timeout Errors

**Symptom**: Requests timing out

**Solutions**:
- Check network connectivity
- Verify API key is valid
- Reduce maxTokens to speed up generation
- Check Claude API status

## Production Checklist

- [ ] `ANTHROPIC_API_KEY` configured in environment
- [ ] Rate limits configured appropriately
- [ ] Error logging set up
- [ ] Cost tracking monitored
- [ ] Generation logs reviewed regularly
- [ ] Quality thresholds validated
- [ ] Batch size limits enforced
- [ ] API timeout handling tested
- [ ] Retry logic validated
- [ ] Database indexes optimized for queries

## Support

For issues or questions:
1. Check error logs in `generation_logs` table
2. Review rate limit status
3. Verify template configuration
4. Check Claude API status page
5. Review cost tracking for anomalies

---

**Last Updated**: January 2025
**Version**: 1.0.0

