# Training Data Generator - Error Handling & Recovery Task Inventory
**Generated:** 2025-01-29  
**Scope:** FR10.1.X Error Handling & Recovery Module  
**Product:** Interactive LoRA Conversation Generation Platform

---

## 1. Foundation & Infrastructure

### T-1.1.0: Error Handling Infrastructure Setup
- **FR Reference**: FR10.1.1
- **Impact Weighting**: System Reliability / User Trust
- **Implementation Location**: `train-wireframe/src/lib/errors/`
- **Pattern**: Centralized error handling with type-safe error classes
- **Dependencies**: None (foundation task)
- **Estimated Human Work Hours**: 8-12 hours
- **Description**: Create centralized error handling infrastructure with custom error classes, error codes, and type-safe error handling utilities
- **Testing Tools**: Vitest, React Testing Library
- **Test Coverage Requirements**: 90%+
- **Completes Component?**: Yes - provides foundation for all error handling

**Functional Requirements Acceptance Criteria**:
- Custom error class hierarchy must differentiate between recoverable and non-recoverable errors
- Error codes must be standardized and documented (e.g., ERR_API_RATE_LIMIT, ERR_NETWORK_TIMEOUT)
- Error messages must be user-friendly while preserving technical details for logging
- Error classes must support error chaining for debugging complex error flows
- Type-safe error guards must enable TypeScript narrowing (e.g., isAPIError, isNetworkError)
- Error serialization must support JSON for logging and network transmission
- Stack traces must be preserved for debugging while sanitizing sensitive information
- Error context must capture relevant metadata (timestamp, user_id, request_id, component)

#### T-1.1.1: Custom Error Classes
- **FR Reference**: FR10.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `train-wireframe/src/lib/errors/error-classes.ts`
- **Pattern**: Class inheritance with TypeScript discriminated unions
- **Dependencies**: None
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Implement typed error class hierarchy covering all application error scenarios

**Components/Elements**:
- [T-1.1.1:ELE-1] AppError base class: Base error extending Error with code, context, isRecoverable properties
  - Stubs and Code Location(s): New file `train-wireframe/src/lib/errors/error-classes.ts`
- [T-1.1.1:ELE-2] APIError: HTTP/API errors with status codes and response data
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/error-classes.ts`
- [T-1.1.1:ELE-3] NetworkError: Connection and timeout errors
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/error-classes.ts`
- [T-1.1.1:ELE-4] ValidationError: Input validation failures
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/error-classes.ts`
- [T-1.1.1:ELE-5] GenerationError: AI generation failures with retry info
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/error-classes.ts`
- [T-1.1.1:ELE-6] DatabaseError: Database operation failures
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/error-classes.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Create error classes file structure (implements ELE-1)
   - [PREP-2] Define error code constants enum (implements ELE-1)
   - [PREP-3] Design error context type interfaces (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Implement AppError base class with serialization (implements ELE-1)
   - [IMP-2] Implement API-specific error classes (implements ELE-2)
   - [IMP-3] Implement network error classes (implements ELE-3)
   - [IMP-4] Implement validation error classes (implements ELE-4)
   - [IMP-5] Implement generation error classes (implements ELE-5)
   - [IMP-6] Implement database error classes (implements ELE-6)
3. Validation Phase:
   - [VAL-1] Unit tests for each error class constructor and methods (validates ELE-1-6)
   - [VAL-2] Test error serialization and deserialization (validates ELE-1)
   - [VAL-3] Verify TypeScript type safety and narrowing (validates ELE-1-6)

#### T-1.1.2: Error Type Guards and Utilities
- **FR Reference**: FR10.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `train-wireframe/src/lib/errors/error-guards.ts`
- **Pattern**: TypeScript type predicates
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Type-safe error detection and handling utilities

**Components/Elements**:
- [T-1.1.2:ELE-1] Type guard functions: isAPIError, isNetworkError, isValidationError, etc.
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/error-guards.ts`
- [T-1.1.2:ELE-2] Error classification utility: categorizeError(error) returning error category
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/error-guards.ts`
- [T-1.1.2:ELE-3] Retry eligibility checker: isRetryable(error) boolean
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/error-guards.ts`
- [T-1.1.2:ELE-4] User message extractor: getUserMessage(error) returning friendly message
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/error-guards.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define type predicate signatures (implements ELE-1)
   - [PREP-2] Document error categorization logic (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement type guards with runtime checks (implements ELE-1)
   - [IMP-2] Implement error categorization (implements ELE-2)
   - [IMP-3] Implement retry logic (implements ELE-3)
   - [IMP-4] Implement message extraction with sanitization (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test type guards with various error types (validates ELE-1)
   - [VAL-2] Verify TypeScript narrowing in IDE (validates ELE-1)
   - [VAL-3] Test retry eligibility for all error types (validates ELE-3)

#### T-1.1.3: Error Logging Service
- **FR Reference**: FR10.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `train-wireframe/src/lib/errors/error-logger.ts`
- **Pattern**: Centralized logging with log levels and destinations
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Structured error logging with console, API, and external service integration

**Components/Elements**:
- [T-1.1.3:ELE-1] ErrorLogger class: Singleton with log, warn, error, critical methods
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/error-logger.ts`
- [T-1.1.3:ELE-2] Console destination: Pretty-printed logs for development
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/destinations/console.ts`
- [T-1.1.3:ELE-3] API destination: POST logs to backend endpoint
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/destinations/api.ts`
- [T-1.1.3:ELE-4] Sentry integration: Optional external error tracking
  - Stubs and Code Location(s): `train-wireframe/src/lib/errors/destinations/sentry.ts`
- [T-1.1.3:ELE-5] Log aggregation API: Backend endpoint to receive and store logs
  - Stubs and Code Location(s): `src/app/api/errors/log/route.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design log entry structure (implements ELE-1)
   - [PREP-2] Configure log levels and filtering (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Implement ErrorLogger singleton (implements ELE-1)
   - [IMP-2] Implement console destination with formatting (implements ELE-2)
   - [IMP-3] Implement API destination with batching (implements ELE-3)
   - [IMP-4] Implement Sentry integration (implements ELE-4)
   - [IMP-5] Create backend log aggregation endpoint (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test logging at different levels (validates ELE-1)
   - [VAL-2] Verify log batching and async processing (validates ELE-3)
   - [VAL-3] Test sensitive data sanitization (validates ELE-1)

---

## 2. API Error Handling

### T-2.1.0: API Error Interceptor and Handler
- **FR Reference**: FR10.1.1
- **Impact Weighting**: Reliability / User Experience
- **Implementation Location**: `train-wireframe/src/lib/api/`
- **Pattern**: Axios/Fetch interceptors with error transformation
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Centralized API error handling with automatic retries and user-friendly messaging
- **Testing Tools**: MSW (Mock Service Worker), Vitest
- **Test Coverage Requirements**: 85%+
- **Completes Component?**: Yes - handles all API communication errors

**Functional Requirements Acceptance Criteria**:
- HTTP status codes must be mapped to appropriate error classes (401→AuthError, 429→RateLimitError, etc.)
- Rate limit errors (429) must trigger automatic retry with exponential backoff
- Network timeouts must be configurable per endpoint (default 30s)
- Server errors (5xx) must be logged with full request context
- User-friendly messages must replace technical error messages for common scenarios
- Request/response logging must be configurable (development vs production)
- Retry attempts must be tracked and included in error context
- API errors must preserve response data for debugging

#### T-2.1.1: HTTP Client Wrapper
- **FR Reference**: FR10.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `train-wireframe/src/lib/api/client.ts`
- **Pattern**: Wrapper around fetch with interceptors
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Type-safe HTTP client with automatic error handling

**Components/Elements**:
- [T-2.1.1:ELE-1] APIClient class: Wrapper with get, post, put, delete methods
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/client.ts`
- [T-2.1.1:ELE-2] Request interceptor: Add auth headers, logging, timing
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/interceptors/request.ts`
- [T-2.1.1:ELE-3] Response interceptor: Transform responses, handle errors
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/interceptors/response.ts`
- [T-2.1.1:ELE-4] Timeout handler: AbortController integration
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/timeout.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design APIClient interface (implements ELE-1)
   - [PREP-2] Configure interceptor pipeline (implements ELE-2, ELE-3)
2. Implementation Phase:
   - [IMP-1] Implement APIClient with type-safe methods (implements ELE-1)
   - [IMP-2] Implement request interceptor (implements ELE-2)
   - [IMP-3] Implement response interceptor with error mapping (implements ELE-3)
   - [IMP-4] Implement timeout handling (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test successful API calls (validates ELE-1)
   - [VAL-2] Test error scenarios (4xx, 5xx, timeout, network) (validates ELE-3)
   - [VAL-3] Verify request/response logging (validates ELE-2, ELE-3)

#### T-2.1.2: Retry Logic with Exponential Backoff
- **FR Reference**: FR10.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `train-wireframe/src/lib/api/retry.ts`
- **Pattern**: Retry decorator with configurable backoff
- **Dependencies**: T-2.1.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Automatic retry for transient failures with exponential backoff

**Components/Elements**:
- [T-2.1.2:ELE-1] RetryStrategy class: Configurable retry logic
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/retry.ts`
- [T-2.1.2:ELE-2] Backoff calculator: Exponential with jitter
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/retry.ts:calculateBackoff()`
- [T-2.1.2:ELE-3] Retry decorator: withRetry(fn, config)
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/retry.ts:withRetry()`
- [T-2.1.2:ELE-4] Retry config: maxAttempts, initialDelay, maxDelay, retryableErrors
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/retry.ts:RetryConfig`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define retry configuration schema (implements ELE-4)
   - [PREP-2] Design backoff algorithm (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement RetryStrategy class (implements ELE-1)
   - [IMP-2] Implement backoff calculation with jitter (implements ELE-2)
   - [IMP-3] Implement retry decorator (implements ELE-3)
   - [IMP-4] Integrate with APIClient (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test retry attempts for rate limit errors (validates ELE-1)
   - [VAL-2] Verify exponential backoff timing (validates ELE-2)
   - [VAL-3] Test max retry limit (validates ELE-1)
   - [VAL-4] Verify non-retryable errors fail immediately (validates ELE-1)

#### T-2.1.3: Rate Limit Handler
- **FR Reference**: FR10.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `train-wireframe/src/lib/api/rate-limit.ts`
- **Pattern**: Token bucket or sliding window rate limiting
- **Dependencies**: T-2.1.1
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Client-side rate limit detection and handling

**Components/Elements**:
- [T-2.1.3:ELE-1] RateLimiter class: Track API usage per endpoint
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/rate-limit.ts`
- [T-2.1.3:ELE-2] Rate limit parser: Extract from 429 response headers (Retry-After, X-RateLimit-*)
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/rate-limit.ts:parseRateLimit()`
- [T-2.1.3:ELE-3] Delay calculator: Calculate wait time before retry
  - Stubs and Code Location(s): `train-wireframe/src/lib/api/rate-limit.ts:calculateDelay()`
- [T-2.1.3:ELE-4] UI notification: Toast showing "Rate limited, retrying in 30s..."
  - Stubs and Code Location(s): `train-wireframe/src/components/ui/rate-limit-toast.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research API rate limit headers (implements ELE-2)
   - [PREP-2] Design rate limit state management (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Implement RateLimiter class (implements ELE-1)
   - [IMP-2] Parse rate limit headers (implements ELE-2)
   - [IMP-3] Calculate retry delay from headers (implements ELE-3)
   - [IMP-4] Create rate limit toast component (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test 429 response handling (validates ELE-2, ELE-3)
   - [VAL-2] Verify automatic retry after delay (validates ELE-1)
   - [VAL-3] Test toast notification display (validates ELE-4)

### T-2.2.0: Generation Error Handling
- **FR Reference**: FR10.1.1
- **Impact Weighting**: Core Functionality / Reliability
- **Implementation Location**: `train-wireframe/src/lib/generation/`
- **Pattern**: Specialized error handling for AI generation
- **Dependencies**: T-2.1.0
- **Estimated Human Work Hours**: 5-7 hours
- **Description**: Handle Claude API errors, partial generations, and validation failures
- **Testing Tools**: Vitest, Mock API responses
- **Test Coverage Requirements**: 80%+
- **Completes Component?**: Yes - handles all generation-specific errors

**Functional Requirements Acceptance Criteria**:
- Claude API errors must be categorized (rate limit, content policy, token limit, server error)
- Partial generation responses must be saved with 'failed' status for review
- Token limit errors must provide estimated tokens and suggest content reduction
- Content policy violations must display specific policy guidance
- Generation timeout must be configurable (default 60s)
- Failed generations must preserve prompt and parameters for debugging
- Retry must use fresh parameters to avoid repeating same error
- User must receive actionable error messages with next steps

#### T-2.2.1: Generation Error Classifier
- **FR Reference**: FR10.1.1
- **Parent Task**: T-2.2.0
- **Implementation Location**: `train-wireframe/src/lib/generation/errors.ts`
- **Pattern**: Error classification with recovery recommendations
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Classify generation errors and provide recovery guidance

**Components/Elements**:
- [T-2.2.1:ELE-1] GenerationErrorType enum: RATE_LIMIT, TOKEN_LIMIT, CONTENT_POLICY, TIMEOUT, SERVER_ERROR
  - Stubs and Code Location(s): `train-wireframe/src/lib/generation/errors.ts`
- [T-2.2.1:ELE-2] classifyGenerationError(error): Returns error type and recovery action
  - Stubs and Code Location(s): `train-wireframe/src/lib/generation/errors.ts`
- [T-2.2.1:ELE-3] RecoveryAction type: RETRY, REDUCE_CONTENT, MODIFY_PROMPT, SKIP, CONTACT_SUPPORT
  - Stubs and Code Location(s): `train-wireframe/src/lib/generation/errors.ts`
- [T-2.2.1:ELE-4] Error message templates: User-friendly messages per error type
  - Stubs and Code Location(s): `train-wireframe/src/lib/generation/error-messages.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Document Claude API error responses (implements ELE-1)
   - [PREP-2] Define recovery actions per error type (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Implement error type enum (implements ELE-1)
   - [IMP-2] Implement classification logic (implements ELE-2)
   - [IMP-3] Create recovery action recommendations (implements ELE-3)
   - [IMP-4] Write error message templates (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test classification for each error type (validates ELE-2)
   - [VAL-2] Verify recovery actions are appropriate (validates ELE-3)
   - [VAL-3] Review user messages for clarity (validates ELE-4)

#### T-2.2.2: Partial Generation Saver
- **FR Reference**: FR10.1.1, FR10.1.2
- **Parent Task**: T-2.2.0
- **Implementation Location**: `train-wireframe/src/lib/generation/partial-save.ts`
- **Pattern**: Auto-save failed generation attempts
- **Dependencies**: T-2.2.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Save partial generation data when errors occur

**Components/Elements**:
- [T-2.2.2:ELE-1] savePartialGeneration(conversation, error): Save to database with 'failed' status
  - Stubs and Code Location(s): `train-wireframe/src/lib/generation/partial-save.ts`
- [T-2.2.2:ELE-2] Database schema extension: Add error_details JSONB column to conversations
  - Stubs and Code Location(s): Database migration file
- [T-2.2.2:ELE-3] Failed generation viewer: UI to review failed generations
  - Stubs and Code Location(s): `train-wireframe/src/components/generation/FailedGenerations.tsx`
- [T-2.2.2:ELE-4] Retry from failed: Button to retry with original or modified parameters
  - Stubs and Code Location(s): `train-wireframe/src/components/generation/RetryGeneration.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design error_details schema (implements ELE-2)
   - [PREP-2] Plan failed generation recovery flow (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Implement savePartialGeneration function (implements ELE-1)
   - [IMP-2] Create database migration for error_details (implements ELE-2)
   - [IMP-3] Build failed generations viewer component (implements ELE-3)
   - [IMP-4] Implement retry button with parameter editing (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test partial save on various error types (validates ELE-1)
   - [VAL-2] Verify data is retrievable (validates ELE-3)
   - [VAL-3] Test retry workflow (validates ELE-4)

---

## 3. React Error Boundaries

### T-3.1.0: Global Error Boundary
- **FR Reference**: FR10.1.1
- **Impact Weighting**: User Experience / Application Stability
- **Implementation Location**: `train-wireframe/src/components/errors/`
- **Pattern**: React Error Boundary with fallback UI
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Catch unhandled React errors and display user-friendly fallback
- **Testing Tools**: React Testing Library, Vitest
- **Test Coverage Requirements**: 75%+
- **Completes Component?**: Yes - provides top-level error catching

**Functional Requirements Acceptance Criteria**:
- Error boundary must catch all React render errors in child components
- Fallback UI must display user-friendly error message with optional details
- Error must be logged to ErrorLogger with component stack trace
- "Reload Page" button must clear error state and reload
- "Report Issue" button must pre-populate error details in support form
- Error boundary must be reset when navigating to different route
- Development mode must show detailed error information
- Production mode must show generic message with error ID for support

#### T-3.1.1: ErrorBoundary Component
- **FR Reference**: FR10.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/errors/ErrorBoundary.tsx`
- **Pattern**: React class component with getDerivedStateFromError
- **Dependencies**: T-1.1.3
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Core error boundary implementation

**Components/Elements**:
- [T-3.1.1:ELE-1] ErrorBoundary class component: Implements componentDidCatch
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ErrorBoundary.tsx`
- [T-3.1.1:ELE-2] Error state: hasError, error, errorInfo, errorId
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ErrorBoundary.tsx`
- [T-3.1.1:ELE-3] getDerivedStateFromError: Update state on error
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ErrorBoundary.tsx`
- [T-3.1.1:ELE-4] componentDidCatch: Log error and component stack
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ErrorBoundary.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review React error boundary API (implements ELE-1)
   - [PREP-2] Design error state structure (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create ErrorBoundary class component (implements ELE-1)
   - [IMP-2] Implement getDerivedStateFromError (implements ELE-3)
   - [IMP-3] Implement componentDidCatch with logging (implements ELE-4)
   - [IMP-4] Generate unique error ID for support (implements ELE-2)
3. Validation Phase:
   - [VAL-1] Test error catching with intentional errors (validates ELE-3, ELE-4)
   - [VAL-2] Verify error logging (validates ELE-4)
   - [VAL-3] Test error ID generation (validates ELE-2)

#### T-3.1.2: Error Fallback UI
- **FR Reference**: FR10.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/errors/ErrorFallback.tsx`
- **Pattern**: Informative fallback component with recovery actions
- **Dependencies**: T-3.1.1
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: User-friendly error display with recovery options

**Components/Elements**:
- [T-3.1.2:ELE-1] ErrorFallback component: Displays error message and actions
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ErrorFallback.tsx`
- [T-3.1.2:ELE-2] Error details toggle: Show/hide technical details
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ErrorDetails.tsx`
- [T-3.1.2:ELE-3] Reload button: Clear error and reload page
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ErrorFallback.tsx`
- [T-3.1.2:ELE-4] Report issue button: Open support dialog with pre-filled error
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ReportError.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design fallback UI layout (implements ELE-1)
   - [PREP-2] Write user-friendly error messages (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create ErrorFallback component (implements ELE-1)
   - [IMP-2] Implement error details collapsible section (implements ELE-2)
   - [IMP-3] Implement reload button (implements ELE-3)
   - [IMP-4] Create report issue dialog (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test fallback UI rendering (validates ELE-1)
   - [VAL-2] Verify reload functionality (validates ELE-3)
   - [VAL-3] Test report issue workflow (validates ELE-4)

### T-3.2.0: Feature-Specific Error Boundaries
- **FR Reference**: FR10.1.1
- **Impact Weighting**: Isolation / Resilience
- **Implementation Location**: `train-wireframe/src/components/*/`
- **Pattern**: Granular error boundaries per feature
- **Dependencies**: T-3.1.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Isolate errors to specific features without crashing entire app
- **Testing Tools**: React Testing Library
- **Test Coverage Requirements**: 70%+
- **Completes Component?**: Yes - provides feature isolation

**Functional Requirements Acceptance Criteria**:
- Each major feature (Dashboard, Templates, Batch Generation, Export) must have its own error boundary
- Feature error must not crash entire application
- Feature-specific fallback must allow navigation to other features
- Error boundary must reset when user navigates away from feature
- Feature errors must be logged with feature context
- Fallback UI must suggest alternative workflows when feature fails

#### T-3.2.1: Dashboard Error Boundary
- **FR Reference**: FR10.1.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `train-wireframe/src/components/dashboard/DashboardErrorBoundary.tsx`
- **Pattern**: Feature-scoped error boundary
- **Dependencies**: T-3.1.1
- **Estimated Human Work Hours**: 1-2 hours
- **Description**: Isolate dashboard rendering errors

**Components/Elements**:
- [T-3.2.1:ELE-1] DashboardErrorBoundary: Wraps DashboardView
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/DashboardErrorBoundary.tsx`
- [T-3.2.1:ELE-2] Dashboard fallback: "Dashboard unavailable" with link to templates
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/DashboardFallback.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Identify dashboard error scenarios (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create DashboardErrorBoundary component (implements ELE-1)
   - [IMP-2] Create DashboardFallback component (implements ELE-2)
   - [IMP-3] Wrap DashboardView in App.tsx (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test dashboard error isolation (validates ELE-1)
   - [VAL-2] Verify fallback rendering (validates ELE-2)

#### T-3.2.2: Generation Error Boundary
- **FR Reference**: FR10.1.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `train-wireframe/src/components/generation/GenerationErrorBoundary.tsx`
- **Pattern**: Feature-scoped error boundary
- **Dependencies**: T-3.1.1
- **Estimated Human Work Hours**: 1-2 hours
- **Description**: Isolate generation modal errors

**Components/Elements**:
- [T-3.2.2:ELE-1] GenerationErrorBoundary: Wraps generation modals
  - Stubs and Code Location(s): `train-wireframe/src/components/generation/GenerationErrorBoundary.tsx`
- [T-3.2.2:ELE-2] Generation fallback: "Generation failed" with close button
  - Stubs and Code Location(s): `train-wireframe/src/components/generation/GenerationFallback.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Identify generation error scenarios (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create GenerationErrorBoundary component (implements ELE-1)
   - [IMP-2] Create GenerationFallback component (implements ELE-2)
   - [IMP-3] Wrap modal components (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test generation error isolation (validates ELE-1)
   - [VAL-2] Verify modal closes on error (validates ELE-2)

---

## 4. Database Error Handling

### T-4.1.0: Database Transaction Management
- **FR Reference**: FR10.1.2
- **Impact Weighting**: Data Integrity / Reliability
- **Implementation Location**: `src/lib/database/`
- **Pattern**: Transaction wrapper with automatic rollback
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Ensure database operations are atomic with automatic error recovery
- **Testing Tools**: Vitest, Supabase local testing
- **Test Coverage Requirements**: 80%+
- **Completes Component?**: Yes - handles all database transactions

**Functional Requirements Acceptance Criteria**:
- Multi-step database operations must use transactions
- Failed transactions must rollback automatically
- Database errors must be logged with SQL query context (sanitized)
- Deadlock errors must trigger automatic retry (max 3 attempts)
- Constraint violations must provide user-friendly messages
- Connection errors must be retried with exponential backoff
- Queries must timeout after configurable duration (default 30s)
- Transaction isolation level must be configurable per operation

#### T-4.1.1: Transaction Wrapper
- **FR Reference**: FR10.1.2
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/lib/database/transaction.ts`
- **Pattern**: Higher-order function for transactional operations
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Wrap database operations in transactions with automatic rollback

**Components/Elements**:
- [T-4.1.1:ELE-1] withTransaction(fn): Execute function in transaction context
  - Stubs and Code Location(s): `src/lib/database/transaction.ts`
- [T-4.1.1:ELE-2] TransactionContext: Type-safe transaction client
  - Stubs and Code Location(s): `src/lib/database/transaction.ts`
- [T-4.1.1:ELE-3] Rollback handler: Automatic rollback on error
  - Stubs and Code Location(s): `src/lib/database/transaction.ts`
- [T-4.1.1:ELE-4] Commit handler: Commit on success
  - Stubs and Code Location(s): `src/lib/database/transaction.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research Supabase transaction API (implements ELE-1)
   - [PREP-2] Design transaction context interface (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement withTransaction wrapper (implements ELE-1)
   - [IMP-2] Create TransactionContext type (implements ELE-2)
   - [IMP-3] Implement rollback logic (implements ELE-3)
   - [IMP-4] Implement commit logic (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test successful transaction commit (validates ELE-4)
   - [VAL-2] Test automatic rollback on error (validates ELE-3)
   - [VAL-3] Test nested transaction behavior (validates ELE-1)

#### T-4.1.2: Database Error Classifier
- **FR Reference**: FR10.1.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/lib/database/errors.ts`
- **Pattern**: Postgres error code mapping
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Classify database errors and provide recovery guidance

**Components/Elements**:
- [T-4.1.2:ELE-1] PostgresErrorCode enum: Common error codes (23505, 40P01, etc.)
  - Stubs and Code Location(s): `src/lib/database/errors.ts`
- [T-4.1.2:ELE-2] classifyDatabaseError(error): Returns error type and recovery action
  - Stubs and Code Location(s): `src/lib/database/errors.ts`
- [T-4.1.2:ELE-3] User message mapper: Friendly messages for constraint violations
  - Stubs and Code Location(s): `src/lib/database/error-messages.ts`
- [T-4.1.2:ELE-4] Retry eligibility: Determine if error is retryable (deadlock, timeout)
  - Stubs and Code Location(s): `src/lib/database/errors.ts:isRetryable()`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Document Postgres error codes (implements ELE-1)
   - [PREP-2] Map error codes to recovery actions (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement error code enum (implements ELE-1)
   - [IMP-2] Implement classification logic (implements ELE-2)
   - [IMP-3] Write user-friendly messages (implements ELE-3)
   - [IMP-4] Implement retry eligibility check (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test classification for each error type (validates ELE-2)
   - [VAL-2] Verify retry eligibility logic (validates ELE-4)
   - [VAL-3] Review user messages for clarity (validates ELE-3)

#### T-4.1.3: Database Health Monitor
- **FR Reference**: FR10.1.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/lib/database/health.ts`
- **Pattern**: Periodic health checks with alerting
- **Dependencies**: T-1.1.3
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Monitor database connection and performance

**Components/Elements**:
- [T-4.1.3:ELE-1] DatabaseHealthCheck: Periodic connection test
  - Stubs and Code Location(s): `src/lib/database/health.ts`
- [T-4.1.3:ELE-2] Health metrics: Connection pool status, query latency
  - Stubs and Code Location(s): `src/lib/database/health.ts:getHealthMetrics()`
- [T-4.1.3:ELE-3] Alert on degradation: Toast when database slow or unavailable
  - Stubs and Code Location(s): `train-wireframe/src/components/system/DatabaseHealthAlert.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design health check queries (implements ELE-1)
   - [PREP-2] Define health thresholds (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement health check function (implements ELE-1)
   - [IMP-2] Collect health metrics (implements ELE-2)
   - [IMP-3] Create health alert component (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test health check execution (validates ELE-1)
   - [VAL-2] Verify metrics collection (validates ELE-2)
   - [VAL-3] Test alert display (validates ELE-3)

---

## 5. Data Recovery & Backup

### T-5.1.0: Auto-Save for Draft Conversations
- **FR Reference**: FR10.1.2
- **Impact Weighting**: Data Protection / User Experience
- **Implementation Location**: `train-wireframe/src/lib/auto-save/`
- **Pattern**: Debounced auto-save with conflict resolution
- **Dependencies**: T-4.1.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Automatically save conversation drafts to prevent data loss
- **Testing Tools**: Vitest, React Testing Library
- **Test Coverage Requirements**: 75%+
- **Completes Component?**: Yes - prevents draft data loss

**Functional Requirements Acceptance Criteria**:
- Conversation drafts must auto-save every 30 seconds (configurable)
- Auto-save must be debounced to avoid excessive database writes
- Auto-save indicator must show "Saving...", "Saved", or "Failed to save"
- Failed auto-saves must retry with exponential backoff (max 3 attempts)
- Drafts must be recoverable if user closes browser
- Conflict resolution when multiple tabs edit same conversation
- Auto-saved data must not overwrite manually saved data
- User must be prompted to recover unsaved changes on page load

#### T-5.1.1: Auto-Save Hook
- **FR Reference**: FR10.1.2
- **Parent Task**: T-5.1.0
- **Implementation Location**: `train-wireframe/src/hooks/useAutoSave.ts`
- **Pattern**: React hook with debounced save
- **Dependencies**: None
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Custom hook for automatic draft saving

**Components/Elements**:
- [T-5.1.1:ELE-1] useAutoSave hook: Track changes and save automatically
  - Stubs and Code Location(s): `train-wireframe/src/hooks/useAutoSave.ts`
- [T-5.1.1:ELE-2] Debounce logic: Wait for idle before saving
  - Stubs and Code Location(s): `train-wireframe/src/hooks/useAutoSave.ts:useDebouncedSave()`
- [T-5.1.1:ELE-3] Save status: 'idle' | 'saving' | 'saved' | 'error'
  - Stubs and Code Location(s): `train-wireframe/src/hooks/useAutoSave.ts`
- [T-5.1.1:ELE-4] Manual save trigger: saveDraft() function
  - Stubs and Code Location(s): `train-wireframe/src/hooks/useAutoSave.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design hook interface (implements ELE-1)
   - [PREP-2] Configure debounce timing (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement useAutoSave hook (implements ELE-1)
   - [IMP-2] Add debounce logic (implements ELE-2)
   - [IMP-3] Implement save status tracking (implements ELE-3)
   - [IMP-4] Add manual save trigger (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test auto-save triggering (validates ELE-1, ELE-2)
   - [VAL-2] Verify debouncing behavior (validates ELE-2)
   - [VAL-3] Test manual save (validates ELE-4)

#### T-5.1.2: Draft Recovery System
- **FR Reference**: FR10.1.2
- **Parent Task**: T-5.1.0
- **Implementation Location**: `train-wireframe/src/lib/auto-save/recovery.ts`
- **Pattern**: Browser storage with server sync
- **Dependencies**: T-5.1.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Recover unsaved drafts after browser close or crash

**Components/Elements**:
- [T-5.1.2:ELE-1] Draft storage: IndexedDB for local draft persistence
  - Stubs and Code Location(s): `train-wireframe/src/lib/auto-save/storage.ts`
- [T-5.1.2:ELE-2] Draft recovery: Check for unsaved drafts on page load
  - Stubs and Code Location(s): `train-wireframe/src/lib/auto-save/recovery.ts:checkForDrafts()`
- [T-5.1.2:ELE-3] Recovery dialog: "You have unsaved changes. Recover?" modal
  - Stubs and Code Location(s): `train-wireframe/src/components/auto-save/RecoveryDialog.tsx`
- [T-5.1.2:ELE-4] Conflict resolver: Handle conflicts when draft differs from server
  - Stubs and Code Location(s): `train-wireframe/src/lib/auto-save/conflict-resolver.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design IndexedDB schema for drafts (implements ELE-1)
   - [PREP-2] Plan conflict resolution strategy (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Implement IndexedDB draft storage (implements ELE-1)
   - [IMP-2] Implement draft recovery on page load (implements ELE-2)
   - [IMP-3] Create recovery dialog component (implements ELE-3)
   - [IMP-4] Implement conflict resolution (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test draft persistence across browser sessions (validates ELE-1)
   - [VAL-2] Test recovery dialog triggering (validates ELE-3)
   - [VAL-3] Test conflict resolution scenarios (validates ELE-4)

### T-5.2.0: Batch Job Resume
- **FR Reference**: FR10.1.2
- **Impact Weighting**: Data Protection / Efficiency
- **Implementation Location**: `train-wireframe/src/lib/batch/`
- **Pattern**: Checkpoint-based resume with idempotency
- **Dependencies**: T-4.1.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Resume failed batch jobs from last successful checkpoint
- **Testing Tools**: Vitest, Integration tests
- **Test Coverage Requirements**: 80%+
- **Completes Component?**: Yes - enables batch job recovery

**Functional Requirements Acceptance Criteria**:
- Batch jobs must save checkpoint after each successful conversation
- Failed batch jobs must be resumable from last checkpoint
- Resume must skip already-completed conversations
- User must be prompted to resume incomplete batches on page load
- Batch job state must persist across browser sessions
- Resume must use original batch configuration
- User must be able to modify batch configuration before resuming
- Batch completion must clean up checkpoint data

#### T-5.2.1: Batch Checkpoint System
- **FR Reference**: FR10.1.2
- **Parent Task**: T-5.2.0
- **Implementation Location**: `train-wireframe/src/lib/batch/checkpoint.ts`
- **Pattern**: Incremental state persistence
- **Dependencies**: T-4.1.1
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Save batch job progress incrementally

**Components/Elements**:
- [T-5.2.1:ELE-1] saveCheckpoint(jobId, completedItemIds): Save progress to database
  - Stubs and Code Location(s): `train-wireframe/src/lib/batch/checkpoint.ts`
- [T-5.2.1:ELE-2] loadCheckpoint(jobId): Retrieve checkpoint from database
  - Stubs and Code Location(s): `train-wireframe/src/lib/batch/checkpoint.ts`
- [T-5.2.1:ELE-3] Checkpoint schema: batch_checkpoints table (job_id, completed_items, timestamp)
  - Stubs and Code Location(s): Database migration
- [T-5.2.1:ELE-4] Checkpoint cleanup: Delete checkpoints for completed jobs
  - Stubs and Code Location(s): `train-wireframe/src/lib/batch/checkpoint.ts:cleanupCheckpoints()`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design checkpoint data structure (implements ELE-3)
   - [PREP-2] Plan checkpoint frequency (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create batch_checkpoints table migration (implements ELE-3)
   - [IMP-2] Implement saveCheckpoint function (implements ELE-1)
   - [IMP-3] Implement loadCheckpoint function (implements ELE-2)
   - [IMP-4] Implement checkpoint cleanup (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test checkpoint saving during batch (validates ELE-1)
   - [VAL-2] Test checkpoint loading (validates ELE-2)
   - [VAL-3] Test cleanup after completion (validates ELE-4)

#### T-5.2.2: Batch Resume UI
- **FR Reference**: FR10.1.2
- **Parent Task**: T-5.2.0
- **Implementation Location**: `train-wireframe/src/components/batch/ResumeDialog.tsx`
- **Pattern**: Resume confirmation dialog
- **Dependencies**: T-5.2.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: User interface for resuming incomplete batches

**Components/Elements**:
- [T-5.2.2:ELE-1] ResumeDialog component: Display incomplete batches on page load
  - Stubs and Code Location(s): `train-wireframe/src/components/batch/ResumeDialog.tsx`
- [T-5.2.2:ELE-2] Batch summary: Show completed/failed/pending counts
  - Stubs and Code Location(s): `train-wireframe/src/components/batch/BatchSummary.tsx`
- [T-5.2.2:ELE-3] Resume button: Resume batch with original or modified config
  - Stubs and Code Location(s): `train-wireframe/src/components/batch/ResumeDialog.tsx`
- [T-5.2.2:ELE-4] Discard button: Delete checkpoint and abandon batch
  - Stubs and Code Location(s): `train-wireframe/src/components/batch/ResumeDialog.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design resume dialog UI (implements ELE-1)
   - [PREP-2] Plan batch summary display (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create ResumeDialog component (implements ELE-1)
   - [IMP-2] Implement batch summary display (implements ELE-2)
   - [IMP-3] Implement resume button logic (implements ELE-3)
   - [IMP-4] Implement discard button logic (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test dialog display on page load (validates ELE-1)
   - [VAL-2] Test resume workflow (validates ELE-3)
   - [VAL-3] Test discard workflow (validates ELE-4)

#### T-5.2.3: Idempotent Batch Processing
- **FR Reference**: FR10.1.2
- **Parent Task**: T-5.2.0
- **Implementation Location**: `train-wireframe/src/lib/batch/processor.ts`
- **Pattern**: Idempotent operations with duplicate detection
- **Dependencies**: T-5.2.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Ensure batch resume doesn't duplicate completed work

**Components/Elements**:
- [T-5.2.3:ELE-1] isItemCompleted(itemId): Check if item already processed
  - Stubs and Code Location(s): `train-wireframe/src/lib/batch/processor.ts`
- [T-5.2.3:ELE-2] filterPendingItems(batchItems, checkpoint): Return only unprocessed items
  - Stubs and Code Location(s): `train-wireframe/src/lib/batch/processor.ts`
- [T-5.2.3:ELE-3] Duplicate detection: Prevent processing same item twice
  - Stubs and Code Location(s): `train-wireframe/src/lib/batch/processor.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design completion tracking (implements ELE-1)
   - [PREP-2] Plan duplicate prevention (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Implement completion check (implements ELE-1)
   - [IMP-2] Implement pending items filter (implements ELE-2)
   - [IMP-3] Add duplicate detection (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test resume skips completed items (validates ELE-2)
   - [VAL-2] Test duplicate prevention (validates ELE-3)

### T-5.3.0: Backup Export Before Bulk Delete
- **FR Reference**: FR10.1.2
- **Impact Weighting**: Data Protection / Safety
- **Implementation Location**: `train-wireframe/src/lib/backup/`
- **Pattern**: Pre-delete backup with confirmation
- **Dependencies**: T-2.1.0
- **Estimated Human Work Hours**: 5-7 hours
- **Description**: Automatically backup data before destructive operations
- **Testing Tools**: Vitest, Integration tests
- **Test Coverage Requirements**: 75%+
- **Completes Component?**: Yes - prevents accidental data loss

**Functional Requirements Acceptance Criteria**:
- Bulk delete operations must offer backup option before execution
- Backup must be created automatically if confirmed
- Backup must be downloadable immediately
- Backup must be stored temporarily for 7 days
- User must confirm delete after reviewing backup availability
- Backup must include all conversation data and metadata
- Backup format must be JSON for easy import
- Failed backups must prevent delete operation

#### T-5.3.1: Pre-Delete Backup Dialog
- **FR Reference**: FR10.1.2
- **Parent Task**: T-5.3.0
- **Implementation Location**: `train-wireframe/src/components/backup/PreDeleteBackup.tsx`
- **Pattern**: Multi-step confirmation dialog
- **Dependencies**: None
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Confirmation dialog with backup option

**Components/Elements**:
- [T-5.3.1:ELE-1] PreDeleteBackupDialog: Multi-step confirmation
  - Stubs and Code Location(s): `train-wireframe/src/components/backup/PreDeleteBackup.tsx`
- [T-5.3.1:ELE-2] Backup option checkbox: "Create backup before deleting"
  - Stubs and Code Location(s): `train-wireframe/src/components/backup/PreDeleteBackup.tsx`
- [T-5.3.1:ELE-3] Backup progress: "Creating backup... 50%"
  - Stubs and Code Location(s): `train-wireframe/src/components/backup/BackupProgress.tsx`
- [T-5.3.1:ELE-4] Delete confirmation: Final confirmation after backup
  - Stubs and Code Location(s): `train-wireframe/src/components/backup/PreDeleteBackup.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design dialog flow (implements ELE-1)
   - [PREP-2] Plan backup progress tracking (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create PreDeleteBackupDialog component (implements ELE-1)
   - [IMP-2] Add backup option checkbox (implements ELE-2)
   - [IMP-3] Implement backup progress display (implements ELE-3)
   - [IMP-4] Add final confirmation step (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test dialog flow (validates ELE-1)
   - [VAL-2] Test backup creation (validates ELE-3)
   - [VAL-3] Test delete after backup (validates ELE-4)

#### T-5.3.2: Backup Storage and Retrieval
- **FR Reference**: FR10.1.2
- **Parent Task**: T-5.3.0
- **Implementation Location**: `src/lib/backup/storage.ts`
- **Pattern**: Temporary file storage with expiration
- **Dependencies**: T-5.3.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Store and manage backup files

**Components/Elements**:
- [T-5.3.2:ELE-1] createBackup(conversationIds): Generate JSON backup file
  - Stubs and Code Location(s): `src/lib/backup/storage.ts`
- [T-5.3.2:ELE-2] storeBackup(file, userId): Upload to temporary storage
  - Stubs and Code Location(s): `src/lib/backup/storage.ts`
- [T-5.3.2:ELE-3] Backup metadata table: backup_files (id, user_id, file_path, created_at, expires_at)
  - Stubs and Code Location(s): Database migration
- [T-5.3.2:ELE-4] Cleanup job: Delete expired backups daily
  - Stubs and Code Location(s): `src/lib/backup/cleanup.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design backup file format (implements ELE-1)
   - [PREP-2] Plan storage location and expiration (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement backup generation (implements ELE-1)
   - [IMP-2] Implement backup storage (implements ELE-2)
   - [IMP-3] Create backup_files table (implements ELE-3)
   - [IMP-4] Implement cleanup job (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test backup generation (validates ELE-1)
   - [VAL-2] Test backup storage and retrieval (validates ELE-2)
   - [VAL-3] Test cleanup job (validates ELE-4)

---

## 6. User Notifications & Feedback

### T-6.1.0: Toast Notification System Enhancement
- **FR Reference**: FR10.1.1
- **Impact Weighting**: User Experience / Feedback
- **Implementation Location**: `train-wireframe/src/lib/notifications/`
- **Pattern**: Centralized notification management with queuing
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Enhanced toast notifications with error-specific styling and actions
- **Testing Tools**: React Testing Library, Vitest
- **Test Coverage Requirements**: 70%+
- **Completes Component?**: Yes - provides comprehensive user feedback

**Functional Requirements Acceptance Criteria**:
- Toasts must differentiate error types (temporary, permanent, action required) with colors
- Temporary errors must auto-dismiss after 5 seconds
- Permanent errors must require manual dismissal
- Action-required toasts must include action button (e.g., "Retry", "Report")
- Multiple toasts must stack without overlapping
- Toast queue must prevent duplicate messages
- Toasts must be accessible (screen reader announcements)
- Toast must support custom icons per error type

#### T-6.1.1: Notification Manager
- **FR Reference**: FR10.1.1
- **Parent Task**: T-6.1.0
- **Implementation Location**: `train-wireframe/src/lib/notifications/manager.ts`
- **Pattern**: Centralized notification queue with deduplication
- **Dependencies**: T-1.1.2
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Manage toast notifications with queuing and deduplication

**Components/Elements**:
- [T-6.1.1:ELE-1] NotificationManager: Singleton managing toast queue
  - Stubs and Code Location(s): `train-wireframe/src/lib/notifications/manager.ts`
- [T-6.1.1:ELE-2] showError(error, options): Display error toast with appropriate styling
  - Stubs and Code Location(s): `train-wireframe/src/lib/notifications/manager.ts`
- [T-6.1.1:ELE-3] Deduplication: Prevent duplicate toasts within 5 seconds
  - Stubs and Code Location(s): `train-wireframe/src/lib/notifications/manager.ts`
- [T-6.1.1:ELE-4] Priority queue: Display high-priority toasts immediately
  - Stubs and Code Location(s): `train-wireframe/src/lib/notifications/manager.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design notification queue structure (implements ELE-1)
   - [PREP-2] Plan deduplication logic (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Implement NotificationManager singleton (implements ELE-1)
   - [IMP-2] Implement showError method (implements ELE-2)
   - [IMP-3] Add deduplication logic (implements ELE-3)
   - [IMP-4] Implement priority queue (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test notification display (validates ELE-2)
   - [VAL-2] Test deduplication (validates ELE-3)
   - [VAL-3] Test priority handling (validates ELE-4)

#### T-6.1.2: Error-Specific Toast Components
- **FR Reference**: FR10.1.1
- **Parent Task**: T-6.1.0
- **Implementation Location**: `train-wireframe/src/components/notifications/`
- **Pattern**: Specialized toast components per error type
- **Dependencies**: T-6.1.1
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Custom toast components for different error scenarios

**Components/Elements**:
- [T-6.1.2:ELE-1] RateLimitToast: Displays rate limit error with countdown timer
  - Stubs and Code Location(s): `train-wireframe/src/components/notifications/RateLimitToast.tsx`
- [T-6.1.2:ELE-2] NetworkErrorToast: Shows network error with retry button
  - Stubs and Code Location(s): `train-wireframe/src/components/notifications/NetworkErrorToast.tsx`
- [T-6.1.2:ELE-3] ValidationErrorToast: Lists validation errors
  - Stubs and Code Location(s): `train-wireframe/src/components/notifications/ValidationErrorToast.tsx`
- [T-6.1.2:ELE-4] GenerationErrorToast: Generation failure with "View Details" link
  - Stubs and Code Location(s): `train-wireframe/src/components/notifications/GenerationErrorToast.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design toast component interfaces (implements ELE-1-4)
   - [PREP-2] Create toast styling variants (implements ELE-1-4)
2. Implementation Phase:
   - [IMP-1] Create RateLimitToast component (implements ELE-1)
   - [IMP-2] Create NetworkErrorToast component (implements ELE-2)
   - [IMP-3] Create ValidationErrorToast component (implements ELE-3)
   - [IMP-4] Create GenerationErrorToast component (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test each toast component rendering (validates ELE-1-4)
   - [VAL-2] Test action buttons (validates ELE-2, ELE-4)
   - [VAL-3] Test accessibility (validates ELE-1-4)

### T-6.2.0: Error Details Modal
- **FR Reference**: FR10.1.1
- **Impact Weighting**: Transparency / Debugging
- **Implementation Location**: `train-wireframe/src/components/errors/`
- **Pattern**: Modal dialog with technical details
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Detailed error information modal for advanced users
- **Testing Tools**: React Testing Library
- **Test Coverage Requirements**: 70%+
- **Completes Component?**: Yes - provides error transparency

**Functional Requirements Acceptance Criteria**:
- "View Details" link in toasts must open error details modal
- Modal must display user-friendly summary and technical details tabs
- Technical details must include: error code, stack trace, request/response data
- Modal must support copy-to-clipboard for error details
- Sensitive data must be sanitized from technical details
- Modal must include "Report Issue" button
- Modal must be dismissible with ESC key
- Modal must support search within error details for large errors

#### T-6.2.1: ErrorDetailsModal Component
- **FR Reference**: FR10.1.1
- **Parent Task**: T-6.2.0
- **Implementation Location**: `train-wireframe/src/components/errors/ErrorDetailsModal.tsx`
- **Pattern**: Tabbed modal dialog
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 2-3 hours
- **Description**: Main error details modal component

**Components/Elements**:
- [T-6.2.1:ELE-1] ErrorDetailsModal: Tabbed modal with Summary and Technical tabs
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ErrorDetailsModal.tsx`
- [T-6.2.1:ELE-2] Summary tab: User-friendly error description
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ErrorSummary.tsx`
- [T-6.2.1:ELE-3] Technical tab: Stack trace, request/response, error code
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/ErrorTechnical.tsx`
- [T-6.2.1:ELE-4] Copy button: Copy error details to clipboard
  - Stubs and Code Location(s): `train-wireframe/src/components/errors/CopyErrorButton.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design modal layout (implements ELE-1)
   - [PREP-2] Plan tab content (implements ELE-2, ELE-3)
2. Implementation Phase:
   - [IMP-1] Create ErrorDetailsModal component (implements ELE-1)
   - [IMP-2] Implement Summary tab (implements ELE-2)
   - [IMP-3] Implement Technical tab (implements ELE-3)
   - [IMP-4] Add copy button (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test modal opening and closing (validates ELE-1)
   - [VAL-2] Test tab switching (validates ELE-2, ELE-3)
   - [VAL-3] Test copy functionality (validates ELE-4)

---

## 7. Recovery Wizard

### T-7.1.0: Data Recovery Wizard
- **FR Reference**: FR10.1.2
- **Impact Weighting**: Data Recovery / User Guidance
- **Implementation Location**: `train-wireframe/src/components/recovery/`
- **Pattern**: Multi-step wizard with recovery options
- **Dependencies**: T-5.1.0, T-5.2.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Guide users through data recovery after failures or crashes
- **Testing Tools**: React Testing Library, Vitest
- **Test Coverage Requirements**: 75%+
- **Completes Component?**: Yes - provides guided recovery process

**Functional Requirements Acceptance Criteria**:
- Wizard must detect recoverable data on page load
- Step 1 must list all recoverable items (drafts, failed batches, incomplete exports)
- Step 2 must allow selection of items to recover
- Step 3 must show recovery progress with success/failure per item
- Step 4 must display recovery summary with next steps
- Wizard must be dismissible with option to recover later
- Recovery must be logged for audit trail
- Wizard must provide guidance on non-recoverable data

#### T-7.1.1: Recovery Detection
- **FR Reference**: FR10.1.2
- **Parent Task**: T-7.1.0
- **Implementation Location**: `train-wireframe/src/lib/recovery/detection.ts`
- **Pattern**: Multi-source recovery detection
- **Dependencies**: T-5.1.2, T-5.2.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Detect all recoverable data sources

**Components/Elements**:
- [T-7.1.1:ELE-1] detectRecoverableData(): Scan for drafts, batches, exports
  - Stubs and Code Location(s): `train-wireframe/src/lib/recovery/detection.ts`
- [T-7.1.1:ELE-2] RecoverableItem type: { type, id, timestamp, description, data }
  - Stubs and Code Location(s): `train-wireframe/src/lib/recovery/types.ts`
- [T-7.1.1:ELE-3] Priority scoring: Prioritize recent items
  - Stubs and Code Location(s): `train-wireframe/src/lib/recovery/detection.ts:calculatePriority()`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Identify all recovery sources (implements ELE-1)
   - [PREP-2] Design RecoverableItem interface (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement detectRecoverableData (implements ELE-1)
   - [IMP-2] Define RecoverableItem type (implements ELE-2)
   - [IMP-3] Implement priority scoring (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test detection of drafts (validates ELE-1)
   - [VAL-2] Test detection of failed batches (validates ELE-1)
   - [VAL-3] Test priority ordering (validates ELE-3)

#### T-7.1.2: Recovery Wizard UI
- **FR Reference**: FR10.1.2
- **Parent Task**: T-7.1.0
- **Implementation Location**: `train-wireframe/src/components/recovery/RecoveryWizard.tsx`
- **Pattern**: Multi-step wizard with progress tracking
- **Dependencies**: T-7.1.1
- **Estimated Human Work Hours**: 5-6 hours
- **Description**: User interface for guided recovery

**Components/Elements**:
- [T-7.1.2:ELE-1] RecoveryWizard: Multi-step wizard component
  - Stubs and Code Location(s): `train-wireframe/src/components/recovery/RecoveryWizard.tsx`
- [T-7.1.2:ELE-2] Step 1: List recoverable items with checkboxes
  - Stubs and Code Location(s): `train-wireframe/src/components/recovery/RecoverableItemList.tsx`
- [T-7.1.2:ELE-3] Step 2: Recovery progress with item-level status
  - Stubs and Code Location(s): `train-wireframe/src/components/recovery/RecoveryProgress.tsx`
- [T-7.1.2:ELE-4] Step 3: Summary with success/failure counts
  - Stubs and Code Location(s): `train-wireframe/src/components/recovery/RecoverySummary.tsx`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design wizard steps and flow (implements ELE-1)
   - [PREP-2] Plan item selection UI (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create RecoveryWizard component (implements ELE-1)
   - [IMP-2] Implement item list step (implements ELE-2)
   - [IMP-3] Implement recovery progress step (implements ELE-3)
   - [IMP-4] Implement summary step (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test wizard navigation (validates ELE-1)
   - [VAL-2] Test item selection (validates ELE-2)
   - [VAL-3] Test recovery execution (validates ELE-3)
   - [VAL-4] Test summary display (validates ELE-4)

---

## 8. Testing & Validation

### T-8.1.0: Error Handling Test Suite
- **FR Reference**: FR10.1.1
- **Impact Weighting**: Quality Assurance / Reliability
- **Implementation Location**: `train-wireframe/src/__tests__/errors/`
- **Pattern**: Comprehensive error scenario testing
- **Dependencies**: All error handling tasks
- **Estimated Human Work Hours**: 10-12 hours
- **Description**: Complete test coverage for all error handling scenarios
- **Testing Tools**: Vitest, React Testing Library, MSW
- **Test Coverage Requirements**: 85%+
- **Completes Component?**: Yes - validates all error handling

**Functional Requirements Acceptance Criteria**:
- Unit tests must cover all error class constructors and methods
- Integration tests must cover API error handling end-to-end
- Component tests must verify error boundary catching and fallback rendering
- E2E tests must simulate network failures, rate limits, and timeouts
- Tests must verify error logging occurs correctly
- Tests must verify retry logic executes with correct timing
- Tests must verify user sees appropriate error messages
- Performance tests must ensure error handling doesn't degrade performance

#### T-8.1.1: Unit Tests for Error Classes
- **FR Reference**: FR10.1.1
- **Parent Task**: T-8.1.0
- **Implementation Location**: `train-wireframe/src/__tests__/errors/error-classes.test.ts`
- **Pattern**: Unit testing with Vitest
- **Dependencies**: T-1.1.1
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Test all error class functionality

**Components/Elements**:
- [T-8.1.1:ELE-1] Test error class construction with various parameters
- [T-8.1.1:ELE-2] Test error serialization and deserialization
- [T-8.1.1:ELE-3] Test error chaining and context preservation
- [T-8.1.1:ELE-4] Test type guards with different error instances

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Plan test cases for each error class
2. Implementation Phase:
   - [IMP-1] Write constructor tests (implements ELE-1)
   - [IMP-2] Write serialization tests (implements ELE-2)
   - [IMP-3] Write chaining tests (implements ELE-3)
   - [IMP-4] Write type guard tests (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Verify 100% coverage of error classes
   - [VAL-2] Run tests in CI pipeline

#### T-8.1.2: Integration Tests for API Error Handling
- **FR Reference**: FR10.1.1
- **Parent Task**: T-8.1.0
- **Implementation Location**: `train-wireframe/src/__tests__/api/error-handling.test.ts`
- **Pattern**: Integration testing with MSW (Mock Service Worker)
- **Dependencies**: T-2.1.0
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Test end-to-end API error handling

**Components/Elements**:
- [T-8.1.2:ELE-1] Mock API responses for various error codes (400, 401, 403, 404, 429, 500)
- [T-8.1.2:ELE-2] Test retry logic with rate limit errors
- [T-8.1.2:ELE-3] Test timeout handling
- [T-8.1.2:ELE-4] Test error transformation and logging

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up MSW mock server
   - [PREP-2] Create mock error responses
2. Implementation Phase:
   - [IMP-1] Write error code handling tests (implements ELE-1)
   - [IMP-2] Write retry logic tests (implements ELE-2)
   - [IMP-3] Write timeout tests (implements ELE-3)
   - [IMP-4] Write logging tests (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Verify all error codes handled correctly
   - [VAL-2] Verify retry timing with fake timers

#### T-8.1.3: Component Tests for Error Boundaries
- **FR Reference**: FR10.1.1
- **Parent Task**: T-8.1.0
- **Implementation Location**: `train-wireframe/src/__tests__/components/error-boundary.test.tsx`
- **Pattern**: Component testing with React Testing Library
- **Dependencies**: T-3.1.0
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Test error boundary behavior

**Components/Elements**:
- [T-8.1.3:ELE-1] Test error boundary catches render errors
- [T-8.1.3:ELE-2] Test fallback UI displays correctly
- [T-8.1.3:ELE-3] Test error logging occurs
- [T-8.1.3:ELE-4] Test error boundary reset on navigation

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Create error-throwing test components
2. Implementation Phase:
   - [IMP-1] Write error catching tests (implements ELE-1)
   - [IMP-2] Write fallback rendering tests (implements ELE-2)
   - [IMP-3] Write logging verification tests (implements ELE-3)
   - [IMP-4] Write reset tests (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Verify error boundary prevents app crash
   - [VAL-2] Verify user sees fallback UI

---

## Implementation Summary

### Total Estimated Hours
- **Foundation & Infrastructure**: 18-24 hours
- **API Error Handling**: 18-24 hours
- **React Error Boundaries**: 10-14 hours
- **Database Error Handling**: 12-16 hours
- **Data Recovery & Backup**: 19-25 hours
- **User Notifications & Feedback**: 7-10 hours
- **Recovery Wizard**: 8-10 hours
- **Testing & Validation**: 10-12 hours

**Total: 102-135 hours**

### Implementation Order

**Phase 1: Foundation (Week 1-2)**
1. T-1.1.0: Error Handling Infrastructure Setup
2. T-1.1.1: Custom Error Classes
3. T-1.1.2: Error Type Guards and Utilities
4. T-1.1.3: Error Logging Service

**Phase 2: API & React Errors (Week 3-4)**
1. T-2.1.0: API Error Interceptor and Handler
2. T-2.1.1: HTTP Client Wrapper
3. T-2.1.2: Retry Logic with Exponential Backoff
4. T-2.1.3: Rate Limit Handler
5. T-3.1.0: Global Error Boundary
6. T-3.1.1: ErrorBoundary Component
7. T-3.1.2: Error Fallback UI

**Phase 3: Generation & Database Errors (Week 5-6)**
1. T-2.2.0: Generation Error Handling
2. T-2.2.1: Generation Error Classifier
3. T-2.2.2: Partial Generation Saver
4. T-4.1.0: Database Transaction Management
5. T-4.1.1: Transaction Wrapper
6. T-4.1.2: Database Error Classifier
7. T-4.1.3: Database Health Monitor

**Phase 4: Data Recovery (Week 7-8)**
1. T-5.1.0: Auto-Save for Draft Conversations
2. T-5.1.1: Auto-Save Hook
3. T-5.1.2: Draft Recovery System
4. T-5.2.0: Batch Job Resume
5. T-5.2.1: Batch Checkpoint System
6. T-5.2.2: Batch Resume UI
7. T-5.2.3: Idempotent Batch Processing

**Phase 5: User Experience & Testing (Week 9-10)**
1. T-6.1.0: Toast Notification System Enhancement
2. T-6.1.1: Notification Manager
3. T-6.1.2: Error-Specific Toast Components
4. T-6.2.0: Error Details Modal
5. T-7.1.0: Data Recovery Wizard
6. T-7.1.1: Recovery Detection
7. T-7.1.2: Recovery Wizard UI
8. T-8.1.0: Error Handling Test Suite
9. T-8.1.1: Unit Tests for Error Classes
10. T-8.1.2: Integration Tests for API Error Handling
11. T-8.1.3: Component Tests for Error Boundaries

### Dependencies Visualization

```
T-1.1.0 (Foundation)
├─> T-1.1.1 (Error Classes)
│   ├─> T-2.1.1 (API Client)
│   ├─> T-2.2.1 (Generation Errors)
│   ├─> T-4.1.1 (Database Transactions)
│   └─> T-3.1.1 (Error Boundary)
├─> T-1.1.2 (Type Guards)
│   └─> T-6.1.1 (Notification Manager)
└─> T-1.1.3 (Error Logger)
    └─> T-4.1.3 (Database Health)

T-2.1.0 (API Errors)
├─> T-2.1.1 (HTTP Client)
│   ├─> T-2.1.2 (Retry Logic)
│   └─> T-2.1.3 (Rate Limit)
└─> T-2.2.0 (Generation Errors)
    ├─> T-2.2.1 (Error Classifier)
    └─> T-2.2.2 (Partial Save)

T-4.1.0 (Database Errors)
├─> T-4.1.1 (Transactions)
│   └─> T-5.2.1 (Batch Checkpoint)
├─> T-4.1.2 (Error Classifier)
└─> T-4.1.3 (Health Monitor)

T-5.1.0 (Auto-Save)
├─> T-5.1.1 (Auto-Save Hook)
└─> T-5.1.2 (Draft Recovery)
    └─> T-7.1.1 (Recovery Detection)

T-5.2.0 (Batch Resume)
├─> T-5.2.1 (Checkpoint)
├─> T-5.2.2 (Resume UI)
└─> T-5.2.3 (Idempotency)
```

### Success Criteria

**Phase 1 Complete When:**
- All error classes implemented and tested
- Error logging service operational
- Type guards working with TypeScript

**Phase 2 Complete When:**
- API errors caught and transformed correctly
- Retry logic working with exponential backoff
- Error boundaries catching React errors
- Fallback UI rendering

**Phase 3 Complete When:**
- Generation errors classified and handled
- Partial generations saved
- Database transactions rollback on error
- Database health monitoring active

**Phase 4 Complete When:**
- Draft auto-save working
- Drafts recoverable after browser close
- Batch jobs resumable from checkpoint
- Idempotent batch processing verified

**Phase 5 Complete When:**
- Toast notifications enhanced with error types
- Error details modal working
- Recovery wizard guiding users through recovery
- 85%+ test coverage achieved
- All acceptance criteria met

---

## Appendix

### Error Code Reference

**API Errors (ERR_API_*)**
- `ERR_API_RATE_LIMIT`: Rate limit exceeded (429)
- `ERR_API_UNAUTHORIZED`: Authentication failed (401)
- `ERR_API_FORBIDDEN`: Authorization failed (403)
- `ERR_API_NOT_FOUND`: Resource not found (404)
- `ERR_API_VALIDATION`: Request validation failed (400)
- `ERR_API_SERVER`: Server error (500)
- `ERR_API_TIMEOUT`: Request timeout

**Network Errors (ERR_NET_*)**
- `ERR_NET_OFFLINE`: No internet connection
- `ERR_NET_TIMEOUT`: Network timeout
- `ERR_NET_ABORT`: Request aborted
- `ERR_NET_UNKNOWN`: Unknown network error

**Generation Errors (ERR_GEN_*)**
- `ERR_GEN_TOKEN_LIMIT`: Token limit exceeded
- `ERR_GEN_CONTENT_POLICY`: Content policy violation
- `ERR_GEN_TIMEOUT`: Generation timeout
- `ERR_GEN_INVALID_RESPONSE`: Invalid API response
- `ERR_GEN_RATE_LIMIT`: Generation rate limited

**Database Errors (ERR_DB_*)**
- `ERR_DB_CONNECTION`: Connection failed
- `ERR_DB_QUERY`: Query execution failed
- `ERR_DB_CONSTRAINT`: Constraint violation
- `ERR_DB_DEADLOCK`: Deadlock detected
- `ERR_DB_TIMEOUT`: Query timeout

**Validation Errors (ERR_VAL_*)**
- `ERR_VAL_REQUIRED`: Required field missing
- `ERR_VAL_FORMAT`: Invalid format
- `ERR_VAL_RANGE`: Value out of range
- `ERR_VAL_TYPE`: Incorrect data type

### Testing Checklist

- [ ] Error classes instantiate correctly
- [ ] Error serialization preserves all data
- [ ] Type guards work with TypeScript narrowing
- [ ] Error logging captures all required context
- [ ] API errors trigger correct handlers
- [ ] Retry logic executes with correct timing
- [ ] Rate limit errors pause and resume correctly
- [ ] Error boundaries catch render errors
- [ ] Fallback UI displays appropriately
- [ ] Database transactions rollback on error
- [ ] Auto-save persists drafts correctly
- [ ] Draft recovery prompts user on page load
- [ ] Batch jobs resume from checkpoint
- [ ] Idempotent processing prevents duplicates
- [ ] Toast notifications display correctly
- [ ] Error details modal shows technical information
- [ ] Recovery wizard guides user through recovery
- [ ] All user-facing error messages are friendly
- [ ] Sensitive data sanitized from logs
- [ ] 85%+ test coverage achieved

---

**Document Status:** Complete  
**Ready for Implementation:** Yes  
**Estimated Project Duration:** 10 weeks (102-135 hours)  
**Priority:** High  
**Dependencies:** Wireframe codebase, Database schema, API infrastructure

