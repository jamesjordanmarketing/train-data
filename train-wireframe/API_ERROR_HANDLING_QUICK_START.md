# API Error Handling - Quick Start Guide

Get started with API error handling and retry logic in 5 minutes.

## Installation

No installation needed! All modules are already integrated.

## Basic Usage

### 1. Make an API Call with Automatic Rate Limiting

```typescript
import apiClient from '@/lib/api/client';

// Simple call - rate limiting applied automatically
const response = await apiClient.generateConversation(
  'Generate a customer service conversation',
  { conversationId: 'conv_123' }
);

console.log(response.content);
```

### 2. Add Automatic Retry

```typescript
import apiClient from '@/lib/api/client';
import { withRetry } from '@/lib/api/retry';

// Automatically retries on failure (3 attempts with exponential backoff)
const response = await withRetry(
  () => apiClient.generateConversation(prompt),
  { maxAttempts: 3 }
);
```

### 3. Handle Errors Gracefully

```typescript
import { classifyGenerationError } from '@/lib/generation/errors';

try {
  await apiClient.generateConversation(prompt);
} catch (error) {
  const classification = classifyGenerationError(error);
  
  // Show user-friendly message
  showError(classification.message);
  
  // Take recovery action
  if (classification.action === RecoveryAction.REDUCE_CONTENT) {
    showPromptEditor();
  }
}
```

### 4. Monitor Rate Limits

```typescript
import apiClient from '@/lib/api/client';

// Check current status
const status = apiClient.getRateLimitStatus();

console.log(`Remaining: ${status.remainingCapacity}/50`);
console.log(`Active: ${status.activeRequests}`);
```

## Common Patterns

### API Route Handler

```typescript
import apiClient from '@/lib/api/client';
import { withRetry } from '@/lib/api/retry';
import { classifyGenerationError } from '@/lib/generation/errors';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    const response = await withRetry(
      () => apiClient.generateConversation(prompt),
      { maxAttempts: 3 }
    );
    
    return Response.json({ success: true, data: response });
    
  } catch (error) {
    const classification = classifyGenerationError(error);
    
    return Response.json(
      { 
        success: false, 
        error: classification.message 
      },
      { status: 500 }
    );
  }
}
```

### React Component

```typescript
import { useState } from 'react';
import apiClient from '@/lib/api/client';
import { withRetry } from '@/lib/api/retry';
import { classifyGenerationError } from '@/lib/generation/errors';

function ConversationGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function generate(prompt: string) {
    setLoading(true);
    setError(null);
    
    try {
      const response = await withRetry(
        () => apiClient.generateConversation(prompt),
        { maxAttempts: 3 }
      );
      
      // Handle success...
      
    } catch (err) {
      const classification = classifyGenerationError(err);
      setError(classification.message);
      
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={() => generate('...')} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
}
```

### Rate Limit Display

```typescript
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';

function RateLimitIndicator() {
  const [status, setStatus] = useState({ remainingCapacity: 50 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(apiClient.getRateLimitStatus());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <span>API Capacity: {status.remainingCapacity}/50</span>
      {status.remainingCapacity < 10 && (
        <span className="warning">⚠️ Low capacity</span>
      )}
    </div>
  );
}
```

### Batch Generation

```typescript
import apiClient from '@/lib/api/client';
import { withRetry } from '@/lib/api/retry';

async function batchGenerate(prompts: string[]) {
  const results = [];
  
  for (const prompt of prompts) {
    try {
      const response = await withRetry(
        () => apiClient.generateConversation(prompt),
        { maxAttempts: 3 }
      );
      
      results.push({ success: true, data: response });
      
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}
```

## Configuration

### Environment Variables

Create `.env.local`:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional (defaults shown)
ANTHROPIC_RATE_LIMIT=50
ANTHROPIC_MAX_CONCURRENT=3
ANTHROPIC_TIMEOUT=60000
```

### Custom Configuration

```typescript
import { APIClient } from '@/lib/api/client';

const customClient = new APIClient({
  apiKey: 'sk-ant-...',
  model: 'claude-sonnet-4-5-20250929',
  rateLimiter: {
    requestsPerMinute: 100,  // Higher tier
    maxConcurrent: 5,
  },
  timeout: 120000,  // 2 minutes
});
```

## Error Types & Recovery

| Error Type | User Message | Recovery Action | Automatic? |
|------------|--------------|-----------------|------------|
| Rate Limit | "Too many requests. Retrying..." | RETRY | ✅ Yes |
| Token Limit | "Prompt too long. Reduce content." | REDUCE_CONTENT | ❌ No |
| Content Policy | "Content violates policy. Modify prompt." | MODIFY_PROMPT | ❌ No |
| Timeout | "Request timed out. Retrying..." | RETRY | ✅ Yes |
| Server Error | "Server error. Retrying..." | RETRY | ✅ Yes |
| Invalid Response | "Invalid response. Retrying..." | RETRY | ✅ Yes |

## Token Validation

```typescript
import { isLikelyToExceedTokenLimit, estimateTokenCount } from '@/lib/generation/errors';

// Check before generation
if (isLikelyToExceedTokenLimit(prompt, 4096)) {
  const tokens = estimateTokenCount(prompt);
  throw new Error(`Prompt too long: ~${tokens} tokens`);
}
```

## Testing

### Run Tests

```bash
# All API tests
npm test src/lib/api/__tests__

# Generation error tests
npm test src/lib/generation/__tests__

# All tests
npm test
```

### Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '@/lib/api/retry';

describe('Retry Logic', () => {
  it('should retry on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValueOnce('Success');
    
    const result = await withRetry(fn, { maxAttempts: 2 });
    
    expect(result).toBe('Success');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
```

## Next Steps

### Learn More
- 📖 [API Documentation](src/lib/api/README.md) - Complete API reference
- 📖 [Generation Errors Guide](src/lib/generation/README.md) - Error handling details
- 📖 [Integration Examples](examples/api-route-integration.ts) - More examples

### Key Concepts
1. **Rate Limiting** - Automatic throttling (50 req/min)
2. **Retry Logic** - Exponential backoff (1s, 2s, 4s, 8s, 16s)
3. **Error Classification** - User-friendly messages
4. **Timeout Handling** - 60 second default

### Common Tasks

**Check API status:**
```typescript
const status = apiClient.getRateLimitStatus();
console.log(status);
```

**Classify an error:**
```typescript
const classification = classifyGenerationError(error);
console.log(classification.message);
```

**Create custom retry:**
```typescript
await withRetry(fn, {
  maxAttempts: 5,
  initialDelay: 2000,
  maxDelay: 30000,
});
```

**Handle specific error type:**
```typescript
if (classification.type === GenerationErrorType.TOKEN_LIMIT) {
  showPromptReducer();
}
```

## Troubleshooting

### Rate limit exceeded
**Solution**: Lower `ANTHROPIC_RATE_LIMIT` or add delays between requests

### Timeout too short
**Solution**: Increase `ANTHROPIC_TIMEOUT` in environment variables

### Retry not working
**Solution**: Check error is retryable with `isRetryable(error)`

### Token limit errors
**Solution**: Use `isLikelyToExceedTokenLimit()` before generation

## Support

- 💬 Check [API README](src/lib/api/README.md) for detailed docs
- 🐛 Review test files for usage examples
- 📝 See [Implementation Summary](API_ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md)

---

**That's it!** You're ready to use the API error handling system. Start with simple calls and add complexity as needed.

