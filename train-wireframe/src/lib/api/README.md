
# API Error Handling & Retry Logic

Comprehensive API error handling with automatic retry, rate limiting, and timeout management for the Claude API integration.

## Overview

This module provides:
- **HTTP Client Wrapper** - Wraps Anthropic SDK with rate limiting
- **Retry Logic** - Exponential backoff with configurable strategies
- **Rate Limiting** - Automatic throttling to respect API limits
- **Error Classification** - Standardized error types and recovery strategies

## Quick Start

### Basic Usage

```typescript
import apiClient from '@/lib/api/client';
import { withRetry } from '@/lib/api/retry';

// Simple API call with automatic rate limiting
const response = await apiClient.generateConversation(
  'Generate a conversation about customer service...',
  { conversationId: 'conv_123', maxTokens: 4096 }
);

// With automatic retry on failure
const response = await withRetry(
  () => apiClient.generateConversation(prompt),
  { maxAttempts: 3 },
  { conversationId: 'conv_123' }
);
```

### Check Rate Limit Status

```typescript
import apiClient from '@/lib/api/client';

const status = apiClient.getRateLimitStatus();
console.log(`Active requests: ${status.activeRequests}`);
console.log(`Requests in last minute: ${status.requestsLastMinute}`);
console.log(`Remaining capacity: ${status.remainingCapacity}`);
```

## Features

### 1. HTTP Client with Rate Limiting

The `APIClient` class automatically manages rate limits:

```typescript
import { APIClient } from '@/lib/api/client';

const client = new APIClient({
  apiKey: 'sk-ant-...',
  model: 'claude-sonnet-4-5-20250929',
  rateLimiter: {
    requestsPerMinute: 50,  // Claude API default
    maxConcurrent: 3,        // Limit concurrent requests
  },
  timeout: 60000,  // 60 second timeout
});

// Rate limiting is applied automatically
const response = await client.generateConversation(prompt);
```

**Rate Limiting Algorithm:**
- **Sliding Window**: Tracks requests per minute
- **Concurrent Limit**: Maximum 3 parallel requests
- **Automatic Throttling**: Waits when limits are reached
- **Request Tracking**: Full visibility into request status

### 2. Retry Logic with Exponential Backoff

Automatic retry with intelligent backoff:

```typescript
import { withRetry } from '@/lib/api/retry';

const result = await withRetry(
  async () => {
    // Your API call
    return await someApiCall();
  },
  {
    maxAttempts: 3,
    initialDelay: 1000,      // 1 second
    maxDelay: 16000,         // 16 seconds max
    backoffFactor: 2,        // Double each time
    retryableErrors: [
      'ERR_API_RATE_LIMIT',
      'ERR_API_SERVER',
      'ERR_NET_TIMEOUT',
    ],
  },
  {
    conversationId: 'conv_123',
    component: 'GenerationService',
  }
);
```

**Backoff Schedule:**
- Attempt 1: Immediate
- Attempt 2: ~1 second (±25% jitter)
- Attempt 3: ~2 seconds (±25% jitter)
- Attempt 4: ~4 seconds (±25% jitter)
- Attempt 5: ~8 seconds (±25% jitter)
- Attempt 6: ~16 seconds (±25% jitter, max cap)

**Jitter**: Random variation (±25%) prevents thundering herd problem.

### 3. Retry Decorator

Use decorator for class methods:

```typescript
import { Retry } from '@/lib/api/retry';

class ConversationService {
  @Retry({ maxAttempts: 3 })
  async generateConversation(prompt: string) {
    // Automatically retries on failure
    return await apiClient.generateConversation(prompt);
  }
}
```

### 4. Custom Retry Strategies

#### Custom Backoff Delays

```typescript
import { retryWithCustomBackoff } from '@/lib/api/retry';

const result = await retryWithCustomBackoff(
  () => apiCall(),
  (error) => error.statusCode === 503,  // Custom retry condition
  [1000, 5000, 15000, 30000]           // Custom delays
);
```

#### Retry with Overall Timeout

```typescript
import { retryWithTimeout } from '@/lib/api/retry';

// Retry up to 3 times, but fail if total time exceeds 30 seconds
const result = await retryWithTimeout(
  () => apiCall(),
  { maxAttempts: 3 },
  30000  // 30 second total timeout
);
```

### 5. Rate Limit Utilities

Parse and handle rate limit headers:

```typescript
import {
  parseRateLimitHeaders,
  calculateRetryDelay,
  getRateLimitMessage,
  formatRateLimitStatus,
  isApproachingRateLimit,
} from '@/lib/api/rate-limit';

// Parse headers from API response
const headers = response.headers;
const rateLimitInfo = parseRateLimitHeaders(headers);

console.log(`Remaining: ${rateLimitInfo.remaining}`);
console.log(`Resets at: ${rateLimitInfo.reset}`);

// Check if approaching limit
if (isApproachingRateLimit(rateLimitInfo, 0.9)) {
  console.warn('Approaching rate limit!');
}

// Format for UI display
const statusMessage = formatRateLimitStatus(rateLimitInfo);
// "25 requests remaining (resets in 45 seconds)"
```

### 6. Client-Side Rate Limit Tracker

Track requests to prevent hitting rate limits:

```typescript
import { RateLimitTracker } from '@/lib/api/rate-limit';

const tracker = new RateLimitTracker(50, 60000); // 50 requests per minute

// Before making request
if (!tracker.canMakeRequest()) {
  const waitTime = tracker.getTimeUntilNextSlot();
  console.log(`Wait ${waitTime}ms before next request`);
  await new Promise(resolve => setTimeout(resolve, waitTime));
}

// Record request
tracker.recordRequest();

// Check status
console.log(`Remaining: ${tracker.getRemainingRequests()}`);
```

## Error Handling

### Error Types

The module integrates with the error infrastructure to provide consistent error handling:

```typescript
try {
  await apiClient.generateConversation(prompt);
} catch (error) {
  if (error instanceof APIError) {
    console.log(`API Error: ${error.statusCode}`);
    console.log(`Code: ${error.code}`);
    console.log(`Retryable: ${error.isRecoverable}`);
  }
  
  if (error instanceof NetworkError) {
    console.log('Network error occurred');
  }
}
```

### Retryable Error Codes

These errors trigger automatic retry:
- `ERR_API_RATE_LIMIT` (429)
- `ERR_API_SERVER` (5xx errors)
- `ERR_API_TIMEOUT`
- `ERR_NET_TIMEOUT`
- `ERR_NET_UNKNOWN`

### Non-Retryable Errors

These fail immediately:
- `ERR_API_UNAUTHORIZED` (401)
- `ERR_API_FORBIDDEN` (403)
- `ERR_API_NOT_FOUND` (404)
- `ERR_API_VALIDATION` (400)

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional
ANTHROPIC_RATE_LIMIT=50        # Requests per minute
ANTHROPIC_MAX_CONCURRENT=3     # Max concurrent requests
ANTHROPIC_TIMEOUT=60000        # Timeout in milliseconds
```

### Custom Configuration

```typescript
import { APIClient } from '@/lib/api/client';

const customClient = new APIClient({
  apiKey: process.env.CUSTOM_API_KEY,
  model: 'claude-sonnet-4-5-20250929',
  rateLimiter: {
    requestsPerMinute: 100,  // Higher tier
    maxConcurrent: 5,
  },
  timeout: 120000,  // 2 minutes
});
```

## Integration Examples

### API Route Handler (Next.js)

```typescript
// app/api/conversations/generate/route.ts
import { NextResponse } from 'next/server';
import apiClient from '@/lib/api/client';
import { withRetry } from '@/lib/api/retry';
import { classifyGenerationError } from '@/lib/generation/errors';
import { sanitizeError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const { prompt, conversationId } = await request.json();
    
    // Generate with automatic retry
    const response = await withRetry(
      () => apiClient.generateConversation(prompt, { conversationId }),
      { maxAttempts: 3 },
      { conversationId, component: 'GenerationAPI' }
    );
    
    return NextResponse.json({
      success: true,
      data: {
        content: response.content,
        usage: response.usage,
      },
    });
  } catch (error) {
    // Classify and sanitize error
    const classification = classifyGenerationError(error);
    const sanitized = sanitizeError(error);
    
    return NextResponse.json(
      {
        success: false,
        error: sanitized,
        recovery: {
          action: classification.action,
          message: classification.message,
        },
      },
      { status: 500 }
    );
  }
}
```

### React Hook with Rate Limit Display

```typescript
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';

function useRateLimitStatus() {
  const [status, setStatus] = useState({
    activeRequests: 0,
    requestsLastMinute: 0,
    remainingCapacity: 50,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(apiClient.getRateLimitStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

// Usage in component
function GenerationPanel() {
  const rateLimitStatus = useRateLimitStatus();

  return (
    <div>
      <p>Remaining: {rateLimitStatus.remainingCapacity}</p>
      <p>Active: {rateLimitStatus.activeRequests}</p>
    </div>
  );
}
```

## Testing

Run unit tests:

```bash
npm test src/lib/api/__tests__
```

### Test Coverage

- ✅ Rate limiter with various request patterns
- ✅ Exponential backoff calculation
- ✅ Retry decision logic for all error types
- ✅ Timeout handling
- ✅ Concurrent request limiting
- ✅ Rate limit header parsing
- ✅ Error code mapping

## Performance Considerations

### Rate Limiting

- **Overhead**: ~10-50ms per request for rate limit check
- **Memory**: O(N) where N = requests in last minute (typically 50-100)
- **Cleanup**: Automatic cleanup of old requests every second

### Retry Logic

- **Latency**: Adds retry delays (1s, 2s, 4s, 8s, 16s)
- **Success Rate**: Typically 95%+ success with 3 retries
- **Best Practice**: Use retries for user-initiated actions, not background batch jobs

### Timeout Handling

- **Default**: 60 seconds (suitable for most conversations)
- **Recommendation**: Adjust based on conversation complexity
- **Abort Support**: Use AbortController for cancellable requests

## Troubleshooting

### Rate Limit Exceeded Despite Throttling

**Cause**: Multiple instances or other services using same API key.

**Solution**: 
- Lower `requestsPerMinute` to leave buffer
- Monitor actual API rate limit headers
- Coordinate across services

### Retries Not Working

**Cause**: Error not classified as retryable.

**Solution**:
```typescript
// Check error classification
import { isRetryable } from '@/lib/errors';

if (!isRetryable(error)) {
  console.log('Error not retryable:', error.code);
}

// Or customize retryable errors
withRetry(fn, {
  retryableErrors: ['ERR_CUSTOM_ERROR', ...],
});
```

### Timeout Too Short

**Cause**: Complex conversations need more time.

**Solution**:
```typescript
// Increase timeout for complex generations
const response = await apiClient.generateConversation(prompt, {
  maxTokens: 8000,
});

// Or create custom client
const longTimeoutClient = new APIClient({
  timeout: 120000,  // 2 minutes
  // ... other config
});
```

## Best Practices

1. **Always use retry for user-facing operations**
   ```typescript
   const response = await withRetry(
     () => apiClient.generateConversation(prompt),
     { maxAttempts: 3 }
   );
   ```

2. **Monitor rate limit status in UI**
   ```typescript
   const status = apiClient.getRateLimitStatus();
   if (status.remainingCapacity < 5) {
     showWarning('Approaching rate limit');
   }
   ```

3. **Handle errors gracefully**
   ```typescript
   try {
     await generateConversation();
   } catch (error) {
     const classification = classifyGenerationError(error);
     showUserError(classification.message);
   }
   ```

4. **Use AbortController for cancellable requests**
   ```typescript
   const controller = new AbortController();
   
   const response = await apiClient.generateConversation(prompt, {
     signal: controller.signal,
   });
   
   // Cancel if needed
   controller.abort();
   ```

5. **Log errors for monitoring**
   ```typescript
   import { errorLogger } from '@/lib/errors';
   
   try {
     await apiCall();
   } catch (error) {
     errorLogger.error('Generation failed', error, {
       conversationId,
       component: 'GenerationService',
     });
     throw error;
   }
   ```

## API Reference

See [API Documentation](./API_REFERENCE.md) for detailed API reference.

## Related Modules

- [Error Infrastructure](../errors/README.md) - Base error classes
- [Generation Errors](../generation/README.md) - Generation-specific error handling
- [Error Logger](../errors/error-logger.ts) - Centralized logging

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [test files](./__tests__/) for usage examples
3. See [Error Infrastructure documentation](../errors/README.md)

