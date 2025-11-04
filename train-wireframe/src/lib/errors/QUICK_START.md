# Error Handling - Quick Start Guide

## Installation

```bash
cd train-wireframe
npm install
```

## Basic Usage

### 1. Import Error Classes

```typescript
import {
  APIError,
  NetworkError,
  ValidationError,
  GenerationError,
  DatabaseError,
  ErrorCode,
} from '@/lib/errors';
```

### 2. Throw Errors

```typescript
// API Error
throw new APIError(
  'Rate limit exceeded',
  429,
  ErrorCode.ERR_API_RATE_LIMIT
);

// Network Error
throw new NetworkError(
  'Connection timeout',
  ErrorCode.ERR_NET_TIMEOUT
);

// Validation Error
throw new ValidationError('Invalid email', {
  field: 'email',
  validationErrors: { email: 'Must be valid email' }
});

// Generation Error
throw new GenerationError(
  'Token limit exceeded',
  ErrorCode.ERR_GEN_TOKEN_LIMIT,
  { estimatedTokens: 8500 }
);

// Database Error
throw new DatabaseError(
  'Connection failed',
  ErrorCode.ERR_DB_CONNECTION
);
```

### 3. Handle Errors

```typescript
import { errorLogger, getUserMessage, isAPIError } from '@/lib/errors';

try {
  await operation();
} catch (error) {
  // Log error
  errorLogger.error('Operation failed', error);
  
  // Check error type
  if (isAPIError(error)) {
    console.log('Status:', error.statusCode);
  }
  
  // Show user-friendly message
  toast.error(getUserMessage(error));
}
```

### 4. Use Error Logger

```typescript
import { errorLogger } from '@/lib/errors';

// Different log levels
errorLogger.debug('Debug info', { data: 'value' });
errorLogger.info('Operation started');
errorLogger.warn('Slow response', undefined, { duration: 5000 });
errorLogger.error('Operation failed', error);
errorLogger.critical('System failure', error);
```

## Common Patterns

### Pattern 1: API Request with Error Handling

```typescript
import { APIError, ErrorCode, errorLogger } from '@/lib/errors';

async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new APIError(
        `Request failed: ${response.statusText}`,
        response.status,
        response.status === 404 
          ? ErrorCode.ERR_API_NOT_FOUND 
          : ErrorCode.ERR_API_SERVER,
        { context: { url } }
      );
    }
    
    return await response.json();
  } catch (error) {
    errorLogger.error('Fetch failed', error, { url });
    throw error;
  }
}
```

### Pattern 2: Form Validation

```typescript
import { ValidationError, isValidationError } from '@/lib/errors';

function validateForm(data: FormData) {
  const errors: Record<string, string> = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  }
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', { validationErrors: errors });
  }
}

// Usage
try {
  validateForm(formData);
  await submitForm(formData);
} catch (error) {
  if (isValidationError(error)) {
    setFieldErrors(error.validationErrors);
  }
}
```

### Pattern 3: Retry Logic

```typescript
import { isRetryable, errorLogger } from '@/lib/errors';

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryable(error) || attempt === maxRetries) {
        throw error;
      }
      
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      errorLogger.warn(`Retry attempt ${attempt}`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}
```

### Pattern 4: Error Boundary

```typescript
import { errorLogger, getErrorSummary } from '@/lib/errors';
import { Component } from 'react';

class ErrorBoundary extends Component {
  componentDidCatch(error: Error) {
    errorLogger.critical('React error', error);
    const summary = getErrorSummary(error);
    this.setState({ summary });
  }
  
  render() {
    if (this.state.summary) {
      return (
        <ErrorDisplay
          title={this.state.summary.title}
          message={this.state.summary.message}
        />
      );
    }
    return this.props.children;
  }
}
```

## Type Guards

```typescript
import {
  isAPIError,
  isNetworkError,
  isValidationError,
  isGenerationError,
  isDatabaseError,
} from '@/lib/errors';

function handleError(error: unknown) {
  if (isAPIError(error)) {
    // error.statusCode is available
    console.log(error.statusCode);
  }
  
  if (isNetworkError(error)) {
    showOfflineMessage();
  }
  
  if (isValidationError(error)) {
    // error.validationErrors is available
    displayErrors(error.validationErrors);
  }
  
  if (isGenerationError(error)) {
    // error.estimatedTokens is available
    console.log(error.estimatedTokens);
  }
  
  if (isDatabaseError(error)) {
    // error.sqlCode is available
    console.log(error.sqlCode);
  }
}
```

## Utility Functions

```typescript
import {
  getUserMessage,
  categorizeError,
  isRetryable,
  sanitizeError,
  getErrorSummary,
} from '@/lib/errors';

// Get user-friendly message
const message = getUserMessage(error);

// Categorize error
const category = categorizeError(error);
// Returns: 'api' | 'network' | 'validation' | 'generation' | 'database' | 'unknown'

// Check if retryable
const canRetry = isRetryable(error);

// Sanitize for client
const safeError = sanitizeError(error);

// Get error summary
const summary = getErrorSummary(error);
// Returns: { title, message, canRetry, code, suggestions }
```

## Error Codes Reference

### API Errors
- `ERR_API_RATE_LIMIT` - Rate limit exceeded
- `ERR_API_UNAUTHORIZED` - Authentication failed
- `ERR_API_FORBIDDEN` - Permission denied
- `ERR_API_NOT_FOUND` - Resource not found
- `ERR_API_SERVER` - Server error

### Network Errors
- `ERR_NET_OFFLINE` - No internet
- `ERR_NET_TIMEOUT` - Connection timeout
- `ERR_NET_ABORT` - Request cancelled

### Generation Errors
- `ERR_GEN_TOKEN_LIMIT` - Token limit exceeded
- `ERR_GEN_CONTENT_POLICY` - Content policy violation
- `ERR_GEN_RATE_LIMIT` - Generation rate limit

### Database Errors
- `ERR_DB_CONNECTION` - Connection failed
- `ERR_DB_QUERY` - Query failed
- `ERR_DB_CONSTRAINT` - Constraint violation

### Validation Errors
- `ERR_VAL_REQUIRED` - Required field
- `ERR_VAL_FORMAT` - Invalid format
- `ERR_VAL_RANGE` - Out of range

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Write Tests

```typescript
import { describe, it, expect } from 'vitest';
import { APIError, ErrorCode } from '@/lib/errors';

describe('MyComponent', () => {
  it('should throw APIError on failure', async () => {
    await expect(myFunction()).rejects.toThrow(APIError);
  });
  
  it('should have correct error code', async () => {
    try {
      await myFunction();
    } catch (error) {
      expect(error).toBeInstanceOf(APIError);
      expect((error as APIError).code).toBe(ErrorCode.ERR_API_NOT_FOUND);
    }
  });
});
```

## Next Steps

1. Read the full [README.md](./README.md) for comprehensive documentation
2. Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for details
3. Browse example code in the README
4. Run the tests to see examples in action

## Need Help?

- Check the [README.md](./README.md) for detailed examples
- Look at test files for usage patterns
- Read JSDoc comments in source files

