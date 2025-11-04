# Error Handling Infrastructure

Comprehensive error handling system for the Interactive LoRA Conversation Generation platform.

## Overview

This error handling infrastructure provides:

- **Custom Error Classes**: Specialized error types for different failure scenarios
- **Error Codes**: Standardized error identification across the application
- **Type Guards**: TypeScript-safe error type checking and narrowing
- **Error Logging**: Centralized logging with batching and multiple destinations
- **User-Friendly Messages**: Non-technical error messages for business users
- **Error Context**: Rich debugging information with tracing support
- **Error Recovery**: Clear indication of recoverable vs non-recoverable errors

## Quick Start

### Basic Usage

```typescript
import { APIError, ErrorCode, errorLogger, getUserMessage } from '@/lib/errors';

// Throwing an error
throw new APIError(
  'Rate limit exceeded',
  429,
  ErrorCode.ERR_API_RATE_LIMIT
);

// Handling errors
try {
  await fetchData();
} catch (error) {
  errorLogger.error('Data fetch failed', error);
  toast.error(getUserMessage(error));
}
```

## Error Classes

### AppError (Base Class)

The base error class that all other errors extend.

```typescript
import { AppError, ErrorCode } from '@/lib/errors';

throw new AppError(
  'Operation failed',
  ErrorCode.ERR_NET_UNKNOWN,
  {
    isRecoverable: false,
    context: {
      userId: 'user123',
      component: 'DataLoader',
      metadata: { attempt: 3 }
    },
    cause: originalError
  }
);
```

**Properties:**
- `message`: Technical error description
- `code`: ErrorCode enum value
- `isRecoverable`: Whether error is retryable
- `context`: Debugging metadata
- `cause`: Original error if wrapping another error

**Methods:**
- `toJSON()`: Serialize for logging/transmission
- `getUserMessage()`: Get user-friendly error message

### APIError

For HTTP/REST API errors with status codes.

```typescript
import { APIError, ErrorCode } from '@/lib/errors';

throw new APIError(
  'Resource not found',
  404,
  ErrorCode.ERR_API_NOT_FOUND,
  {
    responseData: { detail: 'User not found' },
    context: { endpoint: '/api/users/123' }
  }
);
```

**Auto-Recovery Rules:**
- 5xx errors → recoverable (server errors)
- 429 (rate limit) → recoverable
- 4xx errors → non-recoverable (client errors)

**User Messages:**
- 401: "Authentication failed. Please sign in again."
- 403: "You don't have permission to perform this action."
- 404: "The requested resource was not found."
- 429: "Rate limit exceeded. Please wait a moment and try again."
- 500: "Server error. Please try again later."

### NetworkError

For connectivity and network-related errors.

```typescript
import { NetworkError, ErrorCode } from '@/lib/errors';

throw new NetworkError(
  'Request timed out after 30s',
  ErrorCode.ERR_NET_TIMEOUT,
  {
    context: { url: 'https://api.example.com' }
  }
);
```

All network errors are recoverable by default.

**Available Codes:**
- `ERR_NET_OFFLINE`: No internet connection
- `ERR_NET_TIMEOUT`: Request timeout
- `ERR_NET_ABORT`: Request cancelled
- `ERR_NET_UNKNOWN`: Unknown network error

### ValidationError

For input validation and data validation failures.

```typescript
import { ValidationError } from '@/lib/errors';

// Single field error
throw new ValidationError(
  'Invalid email format',
  { field: 'email' }
);

// Multiple field errors
throw new ValidationError(
  'Validation failed',
  {
    validationErrors: {
      email: 'Must be a valid email address',
      password: 'Must be at least 8 characters',
      age: 'Must be 18 or older'
    }
  }
);
```

### GenerationError

For AI/LLM generation failures.

```typescript
import { GenerationError, ErrorCode } from '@/lib/errors';

throw new GenerationError(
  'Token limit exceeded',
  ErrorCode.ERR_GEN_TOKEN_LIMIT,
  {
    estimatedTokens: 8500,
    retryable: false,
    context: { conversationId: 'conv123' }
  }
);
```

**Available Codes:**
- `ERR_GEN_TOKEN_LIMIT`: Token/context limit exceeded
- `ERR_GEN_CONTENT_POLICY`: Content policy violation
- `ERR_GEN_TIMEOUT`: Generation timeout
- `ERR_GEN_INVALID_RESPONSE`: Malformed AI response
- `ERR_GEN_RATE_LIMIT`: AI API rate limit

### DatabaseError

For database operation failures.

```typescript
import { DatabaseError, ErrorCode } from '@/lib/errors';

throw new DatabaseError(
  'Unique constraint violation',
  ErrorCode.ERR_DB_CONSTRAINT,
  {
    sqlCode: '23505',
    constraint: 'conversations_pkey',
    context: { table: 'conversations' }
  }
);
```

**Recovery Rules:**
- Deadlocks → recoverable
- Timeouts → recoverable
- Other errors → non-recoverable

**Available Codes:**
- `ERR_DB_CONNECTION`: Connection failed
- `ERR_DB_QUERY`: Query execution failed
- `ERR_DB_CONSTRAINT`: Constraint violation
- `ERR_DB_DEADLOCK`: Deadlock detected
- `ERR_DB_TIMEOUT`: Operation timeout

## Error Codes

All error codes follow the pattern: `ERR_{CATEGORY}_{SPECIFIC_ERROR}`

### Complete Error Code List

```typescript
// API Errors
ERR_API_RATE_LIMIT
ERR_API_UNAUTHORIZED
ERR_API_FORBIDDEN
ERR_API_NOT_FOUND
ERR_API_VALIDATION
ERR_API_SERVER
ERR_API_TIMEOUT

// Network Errors
ERR_NET_OFFLINE
ERR_NET_TIMEOUT
ERR_NET_ABORT
ERR_NET_UNKNOWN

// Generation Errors
ERR_GEN_TOKEN_LIMIT
ERR_GEN_CONTENT_POLICY
ERR_GEN_TIMEOUT
ERR_GEN_INVALID_RESPONSE
ERR_GEN_RATE_LIMIT

// Database Errors
ERR_DB_CONNECTION
ERR_DB_QUERY
ERR_DB_CONSTRAINT
ERR_DB_DEADLOCK
ERR_DB_TIMEOUT

// Validation Errors
ERR_VAL_REQUIRED
ERR_VAL_FORMAT
ERR_VAL_RANGE
ERR_VAL_TYPE
```

## Type Guards

Type guards enable TypeScript type narrowing for safe error handling.

```typescript
import {
  isAppError,
  isAPIError,
  isNetworkError,
  isValidationError,
  isGenerationError,
  isDatabaseError,
} from '@/lib/errors';

try {
  await operation();
} catch (error) {
  if (isAPIError(error)) {
    // TypeScript knows error has statusCode property
    console.log('Status:', error.statusCode);
  }
  
  if (isNetworkError(error)) {
    // Handle network errors
    showOfflineMessage();
  }
  
  if (isValidationError(error)) {
    // Access validation-specific properties
    displayFieldErrors(error.validationErrors);
  }
}
```

### Utility Type Guards

```typescript
import {
  isRateLimitError,
  isTimeoutError,
  isAuthError,
  isValidationIssue,
} from '@/lib/errors';

if (isRateLimitError(error)) {
  // Implement backoff strategy
  await backoff(error);
}

if (isTimeoutError(error)) {
  // Adjust timeout settings
  increaseTimeout();
}

if (isAuthError(error)) {
  // Redirect to login
  redirectToLogin();
}
```

## Utility Functions

### getUserMessage

Get user-friendly error message (non-technical).

```typescript
import { getUserMessage } from '@/lib/errors';

try {
  await operation();
} catch (error) {
  toast.error(getUserMessage(error));
}
```

### categorizeError

Categorize error into predefined categories.

```typescript
import { categorizeError } from '@/lib/errors';

try {
  await operation();
} catch (error) {
  const category = categorizeError(error);
  // 'api' | 'network' | 'validation' | 'generation' | 'database' | 'unknown'
  
  analytics.trackError(category);
}
```

### isRetryable

Check if error is recoverable/retryable.

```typescript
import { isRetryable } from '@/lib/errors';

try {
  await operation();
} catch (error) {
  if (isRetryable(error) && retryCount < maxRetries) {
    retryCount++;
    await delay(1000);
    await operation();
  } else {
    throw error;
  }
}
```

### sanitizeError

Remove sensitive data from errors for client display.

```typescript
import { sanitizeError } from '@/lib/errors';

// API route
export async function POST(req: Request) {
  try {
    await operation();
  } catch (error) {
    const safeError = sanitizeError(error);
    return Response.json({ error: safeError }, { status: 500 });
  }
}
```

### normalizeError

Convert any error to AppError.

```typescript
import { normalizeError } from '@/lib/errors';

try {
  JSON.parse(invalidJson);
} catch (error) {
  const appError = normalizeError(error, 'JSONParser');
  errorLogger.error('Parse failed', appError);
}
```

### getErrorSummary

Generate comprehensive error summary for UI.

```typescript
import { getErrorSummary } from '@/lib/errors';

try {
  await operation();
} catch (error) {
  const summary = getErrorSummary(error);
  
  showErrorDialog({
    title: summary.title,
    message: summary.message,
    canRetry: summary.canRetry,
    suggestions: summary.suggestions,
  });
}
```

## Error Logger

Centralized logging service with batching and multiple destinations.

### Basic Logging

```typescript
import { errorLogger } from '@/lib/errors';

// Info logging
errorLogger.info('User signed in', { userId: 'user123' });

// Warning logging
errorLogger.warn('API response slow', undefined, { duration: 5000 });

// Error logging
try {
  await operation();
} catch (error) {
  errorLogger.error('Operation failed', error, { 
    component: 'DataLoader',
    conversationId: 'conv123'
  });
}

// Critical logging (triggers immediate flush)
errorLogger.critical('Database connection lost', error);
```

### Log Levels

- `debug`: Verbose development information
- `info`: General information messages
- `warn`: Warning messages (potential issues)
- `error`: Error messages (functionality affected)
- `critical`: Critical errors (immediate attention required)

### Destinations

The logger supports multiple destinations:

1. **Console Destination** (Development)
   - Logs to browser/Node console
   - Formatted with timestamps and levels

2. **API Destination** (Production)
   - Batches logs (10 per batch)
   - Flushes every 5 seconds
   - Immediate flush for critical errors
   - Automatic retry on failure

### Custom Destinations

```typescript
import { errorLogger } from '@/lib/errors';

// Create custom destination
class SentryDestination {
  async log(entry: LogEntry) {
    if (entry.level === 'error' || entry.level === 'critical') {
      Sentry.captureException(entry.error);
    }
  }
}

// Add to logger
errorLogger.addDestination(new SentryDestination());
```

## Common Patterns

### API Error Handling

```typescript
import { APIError, ErrorCode, errorLogger, getUserMessage } from '@/lib/errors';

async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new APIError(
        `API request failed: ${response.statusText}`,
        response.status,
        mapStatusToErrorCode(response.status),
        {
          responseData: await response.json(),
          context: { url }
        }
      );
    }
    
    return await response.json();
  } catch (error) {
    errorLogger.error('Fetch failed', error, { url });
    throw error;
  }
}

function mapStatusToErrorCode(status: number): ErrorCode {
  if (status === 401) return ErrorCode.ERR_API_UNAUTHORIZED;
  if (status === 403) return ErrorCode.ERR_API_FORBIDDEN;
  if (status === 404) return ErrorCode.ERR_API_NOT_FOUND;
  if (status === 429) return ErrorCode.ERR_API_RATE_LIMIT;
  if (status >= 500) return ErrorCode.ERR_API_SERVER;
  return ErrorCode.ERR_API_VALIDATION;
}
```

### Retry Logic with Exponential Backoff

```typescript
import { isRetryable, isRateLimitError, errorLogger } from '@/lib/errors';

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (!isRetryable(error) || attempt === maxRetries) {
        throw error;
      }
      
      const delay = isRateLimitError(error)
        ? 5000 // Fixed delay for rate limits
        : Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff
      
      errorLogger.warn(
        `Attempt ${attempt} failed, retrying in ${delay}ms`,
        error
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

### Form Validation

```typescript
import { ValidationError } from '@/lib/errors';

function validateUserInput(data: UserInput) {
  const errors: Record<string, string> = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Must be a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Must be at least 8 characters';
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', { validationErrors: errors });
  }
}

// Usage in form
try {
  validateUserInput(formData);
  await submitForm(formData);
} catch (error) {
  if (isValidationError(error)) {
    setFieldErrors(error.validationErrors);
  }
}
```

### Error Boundary Integration

```typescript
import { errorLogger, getErrorSummary } from '@/lib/errors';
import { Component, ErrorInfo } from 'react';

class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLogger.critical('React error boundary', error, {
      componentStack: errorInfo.componentStack,
    });
    
    const summary = getErrorSummary(error);
    this.setState({ errorSummary: summary });
  }
  
  render() {
    if (this.state.errorSummary) {
      return (
        <ErrorDisplay
          title={this.state.errorSummary.title}
          message={this.state.errorSummary.message}
          canRetry={this.state.errorSummary.canRetry}
          suggestions={this.state.errorSummary.suggestions}
        />
      );
    }
    
    return this.props.children;
  }
}
```

### Database Error Handling

```typescript
import { DatabaseError, ErrorCode, errorLogger } from '@/lib/errors';

async function saveConversation(data: Conversation) {
  try {
    const { data: result, error } = await supabase
      .from('conversations')
      .insert(data);
    
    if (error) {
      throw new DatabaseError(
        error.message,
        mapSupabaseError(error),
        {
          sqlCode: error.code,
          constraint: error.details,
          context: { table: 'conversations' }
        }
      );
    }
    
    return result;
  } catch (error) {
    errorLogger.error('Failed to save conversation', error);
    throw error;
  }
}

function mapSupabaseError(error: any): ErrorCode {
  if (error.code === '23505') return ErrorCode.ERR_DB_CONSTRAINT;
  if (error.code === '40P01') return ErrorCode.ERR_DB_DEADLOCK;
  if (error.message.includes('timeout')) return ErrorCode.ERR_DB_TIMEOUT;
  return ErrorCode.ERR_DB_QUERY;
}
```

## Testing

### Testing with Error Classes

```typescript
import { describe, it, expect } from 'vitest';
import { APIError, ErrorCode } from '@/lib/errors';

describe('API Client', () => {
  it('should throw APIError on 404', async () => {
    await expect(fetchUser('invalid-id')).rejects.toThrow(APIError);
    
    try {
      await fetchUser('invalid-id');
    } catch (error) {
      expect(error).toBeInstanceOf(APIError);
      expect((error as APIError).statusCode).toBe(404);
      expect((error as APIError).code).toBe(ErrorCode.ERR_API_NOT_FOUND);
    }
  });
});
```

### Mocking Error Logger

```typescript
import { vi } from 'vitest';
import { errorLogger } from '@/lib/errors';

describe('Component', () => {
  it('should log errors', async () => {
    const errorSpy = vi.spyOn(errorLogger, 'error');
    
    await component.handleError(new Error('Test'));
    
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('error'),
      expect.any(Error)
    );
  });
});
```

## Best Practices

1. **Always use custom error classes** - Don't throw raw Error objects
2. **Include context** - Add userId, requestId, component for debugging
3. **Use type guards** - Leverage TypeScript's type narrowing
4. **Log errors centrally** - Use errorLogger for all errors
5. **Provide user-friendly messages** - Use getUserMessage() for UI
6. **Handle retries properly** - Check isRetryable() before retrying
7. **Sanitize before sending** - Use sanitizeError() for API responses
8. **Preserve error chains** - Use cause property to maintain error history
9. **Test error scenarios** - Write tests for error handling paths
10. **Monitor error metrics** - Track error categories and codes

## Integration with Existing Code

### Zustand Store Integration

```typescript
import { getUserMessage, errorLogger } from '@/lib/errors';

interface AppState {
  error: string | null;
  setError: (error: unknown) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  error: null,
  
  setError: (error: unknown) => {
    errorLogger.error('Application error', error);
    set({ error: getUserMessage(error) });
  },
  
  clearError: () => set({ error: null }),
}));
```

### API Route Integration

```typescript
import { NextResponse } from 'next/server';
import { sanitizeError, errorLogger } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await processData(data);
    return NextResponse.json({ data: result });
  } catch (error) {
    errorLogger.error('API route error', error, {
      path: req.url,
    });
    
    const safeError = sanitizeError(error);
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    );
  }
}
```

## Troubleshooting

### Errors Not Logging

Check that errorLogger is initialized:

```typescript
import { errorLogger } from '@/lib/errors';

// Verify logger is working
errorLogger.info('Test log');
```

### Type Guards Not Working

Ensure you're importing from the correct module:

```typescript
// ✓ Correct
import { isAPIError } from '@/lib/errors';

// ✗ Wrong
import { isAPIError } from '@/lib/errors/error-guards';
```

### User Messages Not User-Friendly

Override getUserMessage() in custom error classes:

```typescript
class CustomError extends AppError {
  getUserMessage(): string {
    return 'User-friendly message here';
  }
}
```

## API Reference

See inline JSDoc comments in source files for complete API documentation:

- `error-classes.ts` - Error class definitions
- `error-guards.ts` - Type guards and utilities
- `error-logger.ts` - Logging service
- `index.ts` - Public API exports

## License

Part of the Interactive LoRA Conversation Generation platform.

