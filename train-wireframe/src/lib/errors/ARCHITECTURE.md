# Error Handling Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
│  (Components, API Routes, Services, Database Operations)        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ throws custom errors
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Error Classes Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ APIError │  │NetworkErr│  │Validation│  │Generation│       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       └─────────────┴─────────────┴─────────────┘               │
│                       │                                          │
│                  ┌────▼─────┐                                   │
│                  │ AppError │ (Base Class)                      │
│                  └──────────┘                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ logged via
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Error Logger Layer                            │
│  ┌────────────────────────────────────────────────────┐         │
│  │              ErrorLogger (Singleton)                │         │
│  │  ┌──────────────┐              ┌──────────────┐   │         │
│  │  │   Console    │              │     API      │   │         │
│  │  │ Destination  │              │ Destination  │   │         │
│  │  │ (Dev Mode)   │              │  (Batched)   │   │         │
│  │  └──────────────┘              └──────────────┘   │         │
│  └────────────────────────────────────────────────────┘         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ sends to
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Storage/Monitoring Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Console    │  │  API Endpoint│  │   Supabase   │         │
│  │   (Browser)  │  │ /api/errors  │  │  (Database)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Error Class Hierarchy

```
Error (JavaScript built-in)
│
└── AppError (Base custom error)
    │
    ├── APIError
    │   ├── Properties: statusCode, responseData
    │   ├── Codes: ERR_API_*
    │   └── Auto-recoverable: 5xx, 429
    │
    ├── NetworkError
    │   ├── Properties: (inherits from AppError)
    │   ├── Codes: ERR_NET_*
    │   └── Auto-recoverable: all
    │
    ├── ValidationError
    │   ├── Properties: field, validationErrors
    │   ├── Codes: ERR_VAL_*
    │   └── Auto-recoverable: all
    │
    ├── GenerationError
    │   ├── Properties: retryable, estimatedTokens
    │   ├── Codes: ERR_GEN_*
    │   └── Auto-recoverable: configurable
    │
    └── DatabaseError
        ├── Properties: sqlCode, constraint
        ├── Codes: ERR_DB_*
        └── Auto-recoverable: deadlocks, timeouts
```

## Error Flow Diagram

```
┌─────────────┐
│  Operation  │
│   Fails     │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────┐
│   Throw Custom Error              │
│   - Select appropriate class      │
│   - Add error code                │
│   - Include context               │
│   - Chain original error          │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│   Error Caught in try-catch       │
└──────┬───────────────────────────┘
       │
       ├──────────────────────────┐
       │                          │
       ↓                          ↓
┌─────────────────┐     ┌────────────────────┐
│  Log Error      │     │  Handle Error      │
│  errorLogger    │     │  - Type guards     │
│  .error(...)    │     │  - getUserMessage  │
└─────────────────┘     │  - isRetryable     │
                        │  - Retry logic     │
                        │  - UI feedback     │
                        └────────────────────┘
```

## Error Logger Architecture

```
┌────────────────────────────────────────────────────────┐
│                ErrorLogger (Singleton)                  │
│                                                         │
│  ┌──────────────────────────────────────────────┐    │
│  │  Public Methods                               │    │
│  │  - debug(message, context)                    │    │
│  │  - info(message, context)                     │    │
│  │  - warn(message, error, context)              │    │
│  │  - error(message, error, context)             │    │
│  │  - critical(message, error, context)          │    │
│  └──────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────┐    │
│  │  Log Entry Creation                           │    │
│  │  - Generate unique ID                         │    │
│  │  - Add timestamp                              │    │
│  │  - Extract error code                         │    │
│  │  - Attach context                             │    │
│  └──────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────┐    │
│  │  Destinations Management                      │    │
│  │  ┌──────────────┐    ┌──────────────┐       │    │
│  │  │   Console    │    │     API      │       │    │
│  │  │ Destination  │    │ Destination  │       │    │
│  │  │              │    │              │       │    │
│  │  │ • Formats    │    │ • Batches    │       │    │
│  │  │ • Colors     │    │ • Queues     │       │    │
│  │  │ • Immediate  │    │ • Flushes    │       │    │
│  │  └──────────────┘    └──────────────┘       │    │
│  └──────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

## API Destination Batching

```
Log Entry 1 ──┐
              │
Log Entry 2 ──┤
              ├──► Queue (max 100)
Log Entry 3 ──┤
              │
Log Entry 4 ──┘
              │
              ↓
        ┌─────────────┐
        │  Flush on:  │
        │  • 10 items │
        │  • 5 sec    │
        │  • Critical │
        └─────┬───────┘
              │
              ↓
        ┌───────────────┐
        │  POST Request │
        │  /api/errors  │
        │    /log       │
        └───────┬───────┘
                │
      ┌─────────┴─────────┐
      │                   │
      ↓                   ↓
┌──────────┐       ┌───────────┐
│ Success  │       │  Failure  │
│ Clear    │       │  Re-queue │
│ Queue    │       │  (limit)  │
└──────────┘       └───────────┘
```

## Type Guard Flow

```
unknown error
      │
      ↓
┌──────────────────┐
│  isAppError()?   │
└────┬────────┬────┘
     │        │
    Yes       No
     │        │
     │        └──► Use generic handling
     │
     ↓
┌─────────────────────────────────┐
│  Narrow to specific error type  │
└────┬────┬────┬────┬────┬────┬───┘
     │    │    │    │    │    │
     │    │    │    │    │    └─► isDatabaseError
     │    │    │    │    └──────► isGenerationError
     │    │    │    └───────────► isValidationError
     │    │    └────────────────► isNetworkError
     │    └─────────────────────► isAPIError
     │
     ↓
Access type-specific properties
```

## Error Context Structure

```
┌─────────────────────────────────────────┐
│           ErrorContext                  │
├─────────────────────────────────────────┤
│  timestamp: "2025-11-03T10:30:45.123Z" │
│  userId: "user_abc123"                  │
│  requestId: "req_xyz789"                │
│  component: "ConversationGenerator"     │
│  metadata: {                            │
│    conversationId: "conv_123",          │
│    attempt: 3,                          │
│    duration: 5000,                      │
│    ... custom fields ...                │
│  }                                      │
└─────────────────────────────────────────┘
```

## Error Recovery Decision Tree

```
                    Error Thrown
                         │
                         ↓
                  ┌──────────────┐
                  │ isRetryable? │
                  └──┬────────┬──┘
                     │        │
                    Yes       No
                     │        │
                     │        └──► Show error message
                     │            │
                     │            └──► Log and exit
                     │
                     ↓
              ┌─────────────────┐
              │ isRateLimitErr? │
              └──┬──────────┬───┘
                 │          │
                Yes         No
                 │          │
                 │          └──► Exponential backoff
                 │              │
                 │              └──► Retry (max 3x)
                 │
                 └──► Fixed delay (5s)
                      │
                      └──► Retry
```

## Component Integration Pattern

```
┌──────────────────────────────────────────────────────┐
│                React Component                        │
│                                                       │
│  const handleSubmit = async () => {                  │
│    try {                                             │
│      await operation();                              │
│    } catch (error) {                                 │
│      ┌─────────────────────────────────────┐        │
│      │  1. Log Error                        │        │
│      │  errorLogger.error(...)              │        │
│      └─────────────────────────────────────┘        │
│                                                       │
│      ┌─────────────────────────────────────┐        │
│      │  2. Check Error Type                 │        │
│      │  if (isValidationError(error)) {...} │        │
│      └─────────────────────────────────────┘        │
│                                                       │
│      ┌─────────────────────────────────────┐        │
│      │  3. Show User Message                │        │
│      │  toast.error(getUserMessage(error))  │        │
│      └─────────────────────────────────────┘        │
│                                                       │
│      ┌─────────────────────────────────────┐        │
│      │  4. Update UI State                  │        │
│      │  setError(error)                     │        │
│      └─────────────────────────────────────┘        │
│    }                                                 │
│  };                                                  │
└──────────────────────────────────────────────────────┘
```

## API Route Integration Pattern

```
┌──────────────────────────────────────────────────────┐
│              API Route Handler                        │
│                                                       │
│  export async function POST(req: Request) {          │
│    try {                                             │
│      const data = await req.json();                  │
│      const result = await processData(data);         │
│      return Response.json({ data: result });         │
│                                                       │
│    } catch (error) {                                 │
│      ┌─────────────────────────────────────┐        │
│      │  1. Log Error                        │        │
│      │  errorLogger.error('API error',...)  │        │
│      └─────────────────────────────────────┘        │
│                                                       │
│      ┌─────────────────────────────────────┐        │
│      │  2. Sanitize Error                   │        │
│      │  const safe = sanitizeError(error)   │        │
│      └─────────────────────────────────────┘        │
│                                                       │
│      ┌─────────────────────────────────────┐        │
│      │  3. Return Safe Error                │        │
│      │  return Response.json(               │        │
│      │    { error: safe },                  │        │
│      │    { status: getStatusCode(error) }  │        │
│      │  )                                   │        │
│      └─────────────────────────────────────┘        │
│    }                                                 │
│  }                                                   │
└──────────────────────────────────────────────────────┘
```

## Data Flow: Error Creation to Storage

```
1. Error Occurs
   └─► Application throws custom error
       │
       └─► new APIError('msg', 429, ERR_API_RATE_LIMIT)
           │
           ├─► message: "Rate limit exceeded"
           ├─► code: ERR_API_RATE_LIMIT
           ├─► statusCode: 429
           ├─► isRecoverable: true
           └─► context: { timestamp, userId, ... }

2. Error Caught
   └─► try-catch block
       │
       └─► errorLogger.error('Operation failed', error, ctx)
           │
           └─► Creates LogEntry
               │
               ├─► id: "uuid"
               ├─► level: "error"
               ├─► message: "Operation failed"
               ├─► code: ERR_API_RATE_LIMIT
               ├─► error: { sanitized error object }
               ├─► context: { merged context }
               └─► timestamp: "ISO string"

3. Log Distribution
   └─► errorLogger.logToDestinations(entry)
       │
       ├─► Console Destination
       │   └─► console.error("[ERROR] 2025-11-03...")
       │
       └─► API Destination
           └─► Add to queue
               │
               └─► [When flushed]
                   └─► POST /api/errors/log
                       │
                       └─► Supabase INSERT
                           └─► errors table
```

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                Server-Side (Full Error)              │
│  • Complete stack traces                            │
│  • Internal error messages                          │
│  • Database query details                           │
│  • Sensitive context data                           │
└────────────────────┬────────────────────────────────┘
                     │
                     │ sanitizeError()
                     │ Removes:
                     │ • Stack traces
                     │ • Internal details
                     │ • Sensitive context
                     │ • SQL codes
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│              Client-Side (Sanitized Error)           │
│  • User-friendly message                            │
│  • Error code                                       │
│  • isRecoverable flag                               │
│  • Error category                                   │
└─────────────────────────────────────────────────────┘
```

## Performance Considerations

```
┌────────────────────────────────────────┐
│        Error Logger Performance        │
├────────────────────────────────────────┤
│  Batching:                             │
│  • Reduces API calls by 10x            │
│  • Batch size: 10 entries              │
│  • Flush interval: 5 seconds           │
│                                        │
│  Memory Management:                    │
│  • Queue limit: 100 entries            │
│  • Old entries dropped on overflow     │
│  • Automatic cleanup on destroy        │
│                                        │
│  Network Optimization:                 │
│  • Single POST per batch               │
│  • Gzip compression (via fetch)        │
│  • Retry on failure (limited)          │
│                                        │
│  Critical Error Handling:              │
│  • Immediate flush (no batching)       │
│  • Ensures visibility                  │
│  • No data loss risk                   │
└────────────────────────────────────────┘
```

## Extension Points

```
┌──────────────────────────────────────────────┐
│         Custom Error Classes                  │
│  Extend AppError or subclasses               │
│                                              │
│  class CustomError extends AppError {        │
│    constructor(...) {                        │
│      super(...);                            │
│    }                                        │
│    getUserMessage(): string { ... }         │
│  }                                          │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│         Custom Log Destinations              │
│  Implement LogDestination interface          │
│                                              │
│  class SentryDestination {                   │
│    async log(entry: LogEntry) {             │
│      Sentry.captureException(entry.error);  │
│    }                                        │
│  }                                          │
│                                              │
│  errorLogger.addDestination(new Sentry());   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│         Custom Type Guards                   │
│  Add application-specific checks             │
│                                              │
│  export function isCustomError(e: unknown) { │
│    return e instanceof CustomError;          │
│  }                                          │
└──────────────────────────────────────────────┘
```

## Testing Architecture

```
Unit Tests
├── error-classes.test.ts
│   ├── Constructor tests
│   ├── Property tests
│   ├── Method tests
│   ├── Inheritance tests
│   └── Serialization tests
│
├── error-guards.test.ts
│   ├── Type guard tests
│   ├── Utility function tests
│   ├── Edge case tests
│   └── TypeScript narrowing tests
│
└── error-logger.test.ts
    ├── Singleton tests
    ├── Log level tests
    ├── Destination tests
    ├── Batching tests
    └── Custom destination tests
```

## Monitoring and Observability

```
┌────────────────────────────────────────────┐
│         Error Metrics to Track              │
├────────────────────────────────────────────┤
│  • Error count by code                     │
│  • Error count by category                 │
│  • Error rate over time                    │
│  • Recoverable vs non-recoverable ratio    │
│  • Top error messages                      │
│  • Errors by component                     │
│  • Errors by user (if authenticated)       │
│  • Error response time impact              │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│         Alerting Thresholds                 │
├────────────────────────────────────────────┤
│  • Critical errors: Immediate alert        │
│  • Error rate spike: > 10x baseline        │
│  • Specific code frequency: > 100/hour     │
│  • Database errors: > 50/hour              │
│  • Authentication errors: > 10/min         │
└────────────────────────────────────────────┘
```

## Best Practices Summary

1. **Always use custom error classes** - Never throw raw Error
2. **Include rich context** - userId, requestId, component, metadata
3. **Log before throwing** - Ensure errors are captured
4. **Use type guards** - Leverage TypeScript type safety
5. **Sanitize for clients** - Remove sensitive data
6. **Implement retry logic** - Check isRetryable()
7. **Provide user feedback** - Use getUserMessage()
8. **Monitor error metrics** - Track categories and codes
9. **Test error paths** - Write tests for error scenarios
10. **Document error codes** - Keep error code list updated

