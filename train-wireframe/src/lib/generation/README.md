# Generation Error Handling

Generation-specific error classification, recovery strategies, and user-friendly error messages for Claude API conversation generation.

## Overview

This module provides:
- **Error Classification** - Categorize generation errors into actionable types
- **Recovery Strategies** - Recommend appropriate recovery actions
- **User-Friendly Messages** - Business-user-friendly error messages
- **Token Estimation** - Rough token counting for prompt validation
- **Helper Functions** - Quick error creation utilities

## Quick Start

### Basic Error Classification

```typescript
import { classifyGenerationError } from '@/lib/generation/errors';

try {
  await generateConversation(prompt);
} catch (error) {
  const classification = classifyGenerationError(error);
  
  console.log(`Error Type: ${classification.type}`);
  console.log(`Recovery Action: ${classification.action}`);
  console.log(`User Message: ${classification.message}`);
}
```

### Display Error to User

```typescript
import { classifyGenerationError, getDetailedErrorMessage } from '@/lib/generation/errors';

try {
  await generateConversation(prompt);
} catch (error) {
  const classification = classifyGenerationError(error);
  
  // Show user-friendly message with recovery suggestions
  const detailedMessage = getDetailedErrorMessage(
    classification.type,
    true  // Include recovery suggestions
  );
  
  showErrorModal(classification.message, detailedMessage);
}
```

## Error Types

### Rate Limit Errors

**Type**: `GenerationErrorType.RATE_LIMIT`  
**Recovery**: `RecoveryAction.RETRY`  
**Automatic Handling**: Yes (retry with backoff)

```typescript
// Error is automatically retried by withRetry wrapper
const response = await withRetry(
  () => apiClient.generateConversation(prompt)
);
```

### Token Limit Errors

**Type**: `GenerationErrorType.TOKEN_LIMIT`  
**Recovery**: `RecoveryAction.REDUCE_CONTENT`  
**Automatic Handling**: No (requires user action)

```typescript
import { isLikelyToExceedTokenLimit, estimateTokenCount } from '@/lib/generation/errors';

// Check before generation
if (isLikelyToExceedTokenLimit(prompt, 4096)) {
  const tokens = estimateTokenCount(prompt);
  showWarning(`Prompt too long (~${tokens} tokens). Please reduce.`);
  return;
}

// Generate conversation
await generateConversation(prompt);
```

### Content Policy Violations

**Type**: `GenerationErrorType.CONTENT_POLICY`  
**Recovery**: `RecoveryAction.MODIFY_PROMPT`  
**Automatic Handling**: No (requires user action)

```typescript
try {
  await generateConversation(prompt);
} catch (error) {
  const classification = classifyGenerationError(error);
  
  if (classification.type === GenerationErrorType.CONTENT_POLICY) {
    showError('Content violates AI policy. Please modify your prompt.');
    highlightProblematicContent();
  }
}
```

### Timeout Errors

**Type**: `GenerationErrorType.TIMEOUT`  
**Recovery**: `RecoveryAction.RETRY`  
**Automatic Handling**: Yes (retry with backoff)

```typescript
// Automatically retried by withRetry
// If persists, suggest reducing complexity
```

### Server Errors

**Type**: `GenerationErrorType.SERVER_ERROR`  
**Recovery**: `RecoveryAction.CONTACT_SUPPORT`  
**Automatic Handling**: Partial (retry limited times)

### Invalid Response Errors

**Type**: `GenerationErrorType.INVALID_RESPONSE`  
**Recovery**: `RecoveryAction.RETRY`  
**Automatic Handling**: Yes (retry with backoff)

## Recovery Actions

### RETRY

**When**: Transient errors (rate limit, timeout, server error)  
**Action**: Automatically retry with exponential backoff

```typescript
// Handled automatically by withRetry wrapper
const response = await withRetry(
  () => apiClient.generateConversation(prompt),
  { maxAttempts: 3 }
);
```

### REDUCE_CONTENT

**When**: Token limit exceeded  
**Action**: Show UI to reduce prompt size

```typescript
import { estimateTokenCount } from '@/lib/generation/errors';

function PromptEditor() {
  const [prompt, setPrompt] = useState('');
  const tokens = estimateTokenCount(prompt);
  const maxTokens = 4096;
  
  return (
    <div>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <p>
        Estimated tokens: {tokens} / {maxTokens}
        {tokens > maxTokens * 0.8 && (
          <span className="warning">⚠️ Approaching token limit</span>
        )}
      </p>
    </div>
  );
}
```

### MODIFY_PROMPT

**When**: Content policy violation  
**Action**: Show guidance to modify prompt

```typescript
function handleContentPolicyError() {
  showModal({
    title: 'Content Policy Violation',
    message: 'Your prompt contains restricted content.',
    suggestions: [
      'Avoid topics related to violence or harm',
      'Use neutral, professional language',
      'Remove any sensitive personal information',
    ],
  });
}
```

### SKIP

**When**: Non-critical errors in batch operations  
**Action**: Continue with other items

```typescript
async function batchGenerate(prompts: string[]) {
  const results = [];
  
  for (const prompt of prompts) {
    try {
      const result = await generateConversation(prompt);
      results.push({ success: true, data: result });
    } catch (error) {
      const classification = classifyGenerationError(error);
      
      if (classification.action === RecoveryAction.SKIP) {
        results.push({ success: false, error: classification.message });
        continue;  // Skip and continue with next
      }
      
      throw error;  // Re-throw for other error types
    }
  }
  
  return results;
}
```

### CONTACT_SUPPORT

**When**: Persistent server errors, unknown errors  
**Action**: Show support contact information

```typescript
function handleSupportNeededError(error: unknown) {
  const classification = classifyGenerationError(error);
  
  showModal({
    title: 'Support Needed',
    message: classification.message,
    actions: [
      {
        label: 'Contact Support',
        onClick: () => window.open('/support', '_blank'),
      },
      {
        label: 'Check API Status',
        onClick: () => window.open('https://status.anthropic.com', '_blank'),
      },
    ],
  });
}
```

## Token Estimation

### Estimate Token Count

```typescript
import { estimateTokenCount } from '@/lib/generation/errors';

const prompt = 'Generate a conversation about...';
const tokens = estimateTokenCount(prompt);

console.log(`Estimated tokens: ${tokens}`);
```

**Note**: This is a rough estimation (~4 characters per token). For accurate counts, use a proper tokenizer library like `tiktoken`.

### Check Token Limit

```typescript
import { isLikelyToExceedTokenLimit } from '@/lib/generation/errors';

if (isLikelyToExceedTokenLimit(prompt, 4096)) {
  showWarning('Prompt may exceed token limit');
}
```

**Threshold**: Uses 80% of max tokens as threshold for safety.

### Create Token Limit Error

```typescript
import { createTokenLimitError } from '@/lib/generation/errors';

if (promptTooLong) {
  throw createTokenLimitError(prompt, 4096);
}
```

## Error Creation Helpers

### Content Policy Error

```typescript
import { createContentPolicyError } from '@/lib/generation/errors';

if (containsRestrictedContent(prompt)) {
  throw createContentPolicyError('Prompt contains violence references');
}
```

### Timeout Error

```typescript
import { createTimeoutError } from '@/lib/generation/errors';

// After timeout threshold
throw createTimeoutError(60000);  // 60 second timeout
```

### Invalid Response Error

```typescript
import { createInvalidResponseError } from '@/lib/generation/errors';

if (!response.content || response.content.length === 0) {
  throw createInvalidResponseError('Missing content in response');
}
```

## Integration Examples

### Complete Generation Flow

```typescript
import apiClient from '@/lib/api/client';
import { withRetry } from '@/lib/api/retry';
import {
  classifyGenerationError,
  isLikelyToExceedTokenLimit,
  estimateTokenCount,
  RecoveryAction,
} from '@/lib/generation/errors';

async function generateConversation(prompt: string) {
  // 1. Validate prompt length
  if (isLikelyToExceedTokenLimit(prompt, 4096)) {
    const tokens = estimateTokenCount(prompt);
    throw new Error(`Prompt too long: ~${tokens} tokens (max 4096)`);
  }
  
  try {
    // 2. Generate with automatic retry
    const response = await withRetry(
      () => apiClient.generateConversation(prompt, {
        conversationId: crypto.randomUUID(),
        maxTokens: 4096,
      }),
      { maxAttempts: 3 }
    );
    
    // 3. Validate response
    if (!response.content || response.content.length === 0) {
      throw createInvalidResponseError('Empty response from AI');
    }
    
    return response;
    
  } catch (error) {
    // 4. Classify and handle error
    const classification = classifyGenerationError(error);
    
    switch (classification.action) {
      case RecoveryAction.RETRY:
        // Already retried by withRetry
        throw new Error(`Generation failed after retries: ${classification.message}`);
        
      case RecoveryAction.REDUCE_CONTENT:
        throw new Error(`Reduce prompt size: ${classification.message}`);
        
      case RecoveryAction.MODIFY_PROMPT:
        throw new Error(`Modify prompt: ${classification.message}`);
        
      case RecoveryAction.CONTACT_SUPPORT:
        throw new Error(`Support needed: ${classification.message}`);
        
      default:
        throw error;
    }
  }
}
```

### React Component with Error Handling

```typescript
import { useState } from 'react';
import {
  classifyGenerationError,
  getDetailedErrorMessage,
  estimateTokenCount,
  GenerationErrorType,
} from '@/lib/generation/errors';

function ConversationGenerator() {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const tokens = estimateTokenCount(prompt);
  const maxTokens = 4096;
  
  async function handleGenerate() {
    setError(null);
    setLoading(true);
    
    try {
      await generateConversation(prompt);
      // Success handling...
      
    } catch (err) {
      const classification = classifyGenerationError(err);
      const detailedMessage = getDetailedErrorMessage(
        classification.type,
        true  // Include suggestions
      );
      
      setError(detailedMessage);
      
      // Log for monitoring
      errorLogger.error('Generation failed', err, {
        errorType: classification.type,
        recoveryAction: classification.action,
      });
      
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt..."
      />
      
      <div className="token-counter">
        Tokens: {tokens} / {maxTokens}
        {tokens > maxTokens * 0.8 && (
          <span className="warning">⚠️ Approaching limit</span>
        )}
      </div>
      
      {error && (
        <div className="error-panel">
          <pre>{error}</pre>
        </div>
      )}
      
      <button
        onClick={handleGenerate}
        disabled={loading || tokens > maxTokens}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
}
```

### API Route with Full Error Handling

```typescript
import { NextResponse } from 'next/server';
import apiClient from '@/lib/api/client';
import { withRetry } from '@/lib/api/retry';
import {
  classifyGenerationError,
  isLikelyToExceedTokenLimit,
  createTokenLimitError,
  RecoveryAction,
} from '@/lib/generation/errors';

export async function POST(request: Request) {
  try {
    const { prompt, conversationId } = await request.json();
    
    // Validate token limit
    if (isLikelyToExceedTokenLimit(prompt, 4096)) {
      throw createTokenLimitError(prompt, 4096);
    }
    
    // Generate with retry
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
    const classification = classifyGenerationError(error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          type: classification.type,
          message: classification.message,
          action: classification.action,
        },
      },
      {
        status: classification.action === RecoveryAction.RETRY ? 503 : 400,
      }
    );
  }
}
```

## Error Messages

### Predefined Messages

```typescript
import { ERROR_MESSAGES, GenerationErrorType } from '@/lib/generation/errors';

// Access predefined messages
const rateLimitMsg = ERROR_MESSAGES[GenerationErrorType.RATE_LIMIT];
const tokenLimitMsg = ERROR_MESSAGES[GenerationErrorType.TOKEN_LIMIT];
```

### Detailed Messages with Suggestions

```typescript
import { getDetailedErrorMessage } from '@/lib/generation/errors';

// Get message without suggestions
const simpleMessage = getDetailedErrorMessage(
  GenerationErrorType.CONTENT_POLICY,
  false
);

// Get message with recovery suggestions
const detailedMessage = getDetailedErrorMessage(
  GenerationErrorType.CONTENT_POLICY,
  true
);
// Returns:
// "The content violates AI usage policies...
//  
//  Suggestions:
//  • Review prompt for sensitive content
//  • Avoid topics like violence, hate speech...
//  • Use more neutral language"
```

## Testing

Run tests:

```bash
npm test src/lib/generation/__tests__
```

### Test Coverage

- ✅ Error classification for all error types
- ✅ Recovery action mapping
- ✅ Token estimation
- ✅ Token limit checking
- ✅ Error creation helpers
- ✅ Detailed message generation

## Best Practices

1. **Always validate token limit before generation**
   ```typescript
   if (isLikelyToExceedTokenLimit(prompt, 4096)) {
     showWarning('Prompt too long');
     return;
   }
   ```

2. **Classify errors for user-friendly display**
   ```typescript
   const classification = classifyGenerationError(error);
   showError(classification.message);
   ```

3. **Use recovery actions to guide user**
   ```typescript
   switch (classification.action) {
     case RecoveryAction.REDUCE_CONTENT:
       showPromptEditor();
       break;
     case RecoveryAction.MODIFY_PROMPT:
       showContentGuidelines();
       break;
   }
   ```

4. **Show detailed messages for complex errors**
   ```typescript
   const detailed = getDetailedErrorMessage(classification.type, true);
   showModal(detailed);
   ```

5. **Log errors for monitoring**
   ```typescript
   errorLogger.error('Generation failed', error, {
     errorType: classification.type,
     prompt: prompt.substring(0, 100),  // First 100 chars
   });
   ```

## Related Modules

- [API Client](../api/README.md) - HTTP client with retry
- [Error Infrastructure](../errors/README.md) - Base error classes
- [Retry Logic](../api/retry.ts) - Automatic retry with backoff

## Support

For issues or questions:
1. Review [test files](./__tests__/) for usage examples
2. Check [API documentation](../api/README.md)
3. See [Error Infrastructure docs](../errors/README.md)

