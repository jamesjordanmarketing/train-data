# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E10)
**Generated**: 2025-01-29  
**Segment**: E10 - Error Handling & Recovery Module  
**Total Prompts**: 8  
**Estimated Implementation Time**: 102-135 hours (distributed across prompts)

---

## Executive Summary

Segment E10 implements comprehensive error handling and recovery mechanisms across the entire Training Data Generation platform. This is a **critical foundation module** that ensures system reliability, user trust, and data integrity through:

1. **Centralized Error Infrastructure**: Type-safe error classes, logging, and monitoring
2. **Intelligent API Error Management**: Automatic retries, rate limiting, and graceful degradation
3. **React Error Boundaries**: Preventing application crashes with user-friendly fallbacks
4. **Database Resilience**: Transaction management, error recovery, and health monitoring
5. **Data Protection**: Auto-save, batch resume, and backup mechanisms
6. **User Communication**: Clear, actionable error notifications and recovery guidance
7. **Recovery Workflows**: Guided wizards for restoring from failures
8. **Comprehensive Testing**: Validation of all error scenarios

**Strategic Importance**: This segment transforms a fragile prototype into a production-ready system capable of handling the unpredictable nature of AI generation, network failures, and user errors without data loss or system crashes.

---

## Context and Dependencies

### Previous Segment Deliverables

**Assumed Prior Completions (E01-E09):**
- Database schema with conversations, chunks, templates tables
- Basic UI components (Dashboard, Tables, Modals)
- AI generation workflows (single, batch)
- Supabase integration with basic CRUD operations
- Zustand store for state management
- Wireframe components (ConversationTable, FilterBar, BatchGenerationModal)

**E10 Builds Upon:**
- Existing API routes in `src/app/api/`
- Current error handling patterns (if any) in generation flows
- Toast notification system (Sonner)
- Zustand store state management
- TypeScript type definitions in `train-wireframe/src/lib/types.ts`

### Current Codebase State

**Existing Error Handling (Limited):**
```typescript
// Current pattern in src/lib/database.ts
export async function getDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching documents:', error);
    throw error; // Basic error propagation
  }
  return data;
}
```

**Current AI Config (Basic):**
```typescript
// src/lib/ai-config.ts
export const AI_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 4096,
  temperature: 0.7,
};
```

**Current Store (No Error State):**
```typescript
// train-wireframe/src/stores/useAppStore.ts
interface AppState {
  isLoading: boolean;
  loadingMessage: string;
  // No dedicated error state or recovery mechanisms
}
```

**Gaps E10 Will Fill:**
1. No centralized error classes or type-safe error handling
2. No retry logic for API failures
3. No error boundaries catching React errors
4. No auto-save or draft recovery
5. No batch job resume capability
6. No structured error logging
7. Limited user feedback on errors (basic toasts only)
8. No recovery workflows

### Cross-Segment Dependencies

**Depends On:**
- E01-E03: Database schema (conversations, chunks tables)
- E04-E06: UI components (ConversationTable, Modals, FilterBar)
- E07-E09: Generation workflows (API routes, batch processing)

**Provides To:**
- E11+: Reliable foundation for advanced features
- All Segments: Reusable error handling utilities
- Production: Enterprise-grade reliability and data protection

**External Dependencies:**
- Supabase: Database transactions, RLS policies
- Anthropic SDK: Rate limit headers, error responses
- React: Error boundaries, lifecycle hooks
- Zustand: State management for error/recovery state

---

## Implementation Strategy

### Risk Assessment

**High-Risk Areas:**
1. **Database Transactions**: Incorrect transaction boundaries could cause data corruption
   - *Mitigation*: Extensive testing with simulated failures, use Supabase transaction primitives
2. **Auto-Save Conflicts**: Multiple tabs editing same conversation could cause race conditions
   - *Mitigation*: Implement optimistic locking with timestamp checks
3. **Error Boundary Placement**: Incorrect boundaries could catch too much or too little
   - *Mitigation*: Follow React guidelines, test with intentional errors
4. **Retry Logic Loops**: Infinite retries could overwhelm API
   - *Mitigation*: Hard cap at 3 retries, exponential backoff, circuit breaker pattern

**Medium-Risk Areas:**
1. **IndexedDB for Draft Storage**: Browser compatibility and quota limits
   - *Mitigation*: Graceful degradation to localStorage, quota management
2. **Error Log Volume**: High-frequency errors could fill database
   - *Mitigation*: Log sampling, retention policies, aggregation

**Low-Risk Areas:**
1. **Error Classes**: Pure TypeScript, no external dependencies
2. **Toast Notifications**: UI-only, no data persistence
3. **Type Guards**: Compile-time safety, no runtime issues

### Prompt Sequencing Logic

**Phase 1: Foundation (Prompts 1-2)**
Build error infrastructure before implementing features that use it.

1. **Prompt 1 - Error Infrastructure**: Error classes, type guards, logging service
   - *Why First*: All subsequent prompts depend on these types and utilities
   - *Risk*: Low - Pure TypeScript, no external dependencies
   - *Time*: 8-12 hours

2. **Prompt 2 - API Error Handling**: HTTP client wrapper, retry logic, rate limiting
   - *Why Second*: Generation and database operations need this immediately
   - *Risk*: Medium - Interacts with Claude API, must handle rate limits correctly
   - *Time*: 18-24 hours

**Phase 2: React & Database (Prompts 3-4)**
Protect UI and data integrity with error boundaries and transaction management.

3. **Prompt 3 - Error Boundaries**: Global and feature-specific error boundaries
   - *Why Third*: Catches errors from all UI components implemented in earlier segments
   - *Risk*: Medium - Must integrate with existing component tree
   - *Time*: 10-14 hours

4. **Prompt 4 - Database Resilience**: Transaction wrapper, error classification, health monitoring
   - *Why Fourth*: Data operations need transaction safety before recovery features
   - *Risk*: High - Database operations, transaction boundaries
   - *Time*: 12-16 hours

**Phase 3: Data Protection (Prompts 5-6)**
Implement auto-save, backup, and recovery mechanisms.

5. **Prompt 5 - Auto-Save & Draft Recovery**: Auto-save hook, IndexedDB storage, recovery dialog
   - *Why Fifth*: Builds on error handling foundation, protects user work
   - *Risk*: Medium - Browser storage, conflict resolution
   - *Time*: 19-25 hours

6. **Prompt 6 - Batch Job Resume & Backup**: Checkpoint system, resume UI, pre-delete backup
   - *Why Sixth*: Depends on database transaction wrapper from Prompt 4
   - *Risk*: Medium - Idempotency, state management
   - *Time*: 19-25 hours

**Phase 4: User Experience (Prompts 7-8)**
Enhance user communication and provide recovery tools.

7. **Prompt 7 - Enhanced Notifications & Error Details**: Toast system upgrade, error details modal
   - *Why Seventh*: Uses error classes from Prompt 1, displays errors from all prior prompts
   - *Risk*: Low - UI-only, no data operations
   - *Time*: 7-10 hours

8. **Prompt 8 - Recovery Wizard & Testing**: Recovery detection, wizard UI, comprehensive test suite
   - *Why Eighth*: Integrates all recovery mechanisms, validates entire system
   - *Risk*: Low-Medium - Integration testing complexity
   - *Time*: 18-22 hours

### Quality Assurance Approach

**Per-Prompt Validation:**
- Unit tests for error classes, type guards, utilities
- Integration tests for API retry logic, database transactions
- Component tests for error boundaries, UI components
- Manual testing scenarios documented in each prompt

**Cross-Prompt Integration:**
- Error flow testing: Generate error in Prompt 2, ensure Prompt 1 logs it, Prompt 7 displays it
- Recovery flow testing: Trigger failure, verify auto-save (Prompt 5), test resume (Prompt 6), validate wizard (Prompt 8)
- Performance testing: Verify error handling doesn't degrade normal operations

**Acceptance Gates:**
- Each prompt must pass its own validation before proceeding
- Integration tests must pass after Prompt 4 (foundation complete)
- Full system test after Prompt 8 (all features integrated)

---

## Database Setup Instructions

### Required SQL Operations

E10 requires minimal database schema changes as most error handling is application-level. However, we need to add error tracking columns and ensure transaction support.

========================

```sql
-- ============================================================================
-- E10: Error Handling & Recovery - Database Schema Enhancements
-- Execute in Supabase SQL Editor
-- ============================================================================

-- Add error tracking columns to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS error_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS error_details JSONB,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ;

-- Add index for error queries
CREATE INDEX IF NOT EXISTS idx_conversations_error_code 
ON conversations(error_code) 
WHERE error_code IS NOT NULL;

-- Create error_logs table for centralized error tracking
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id VARCHAR(100) UNIQUE NOT NULL,
  error_type VARCHAR(50) NOT NULL,
  error_code VARCHAR(50) NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  request_id VARCHAR(100),
  severity VARCHAR(20) CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for error log queries
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_code ON error_logs(error_code);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_conversation_id ON error_logs(conversation_id);

-- Create batch_checkpoints table for batch job resume
CREATE TABLE IF NOT EXISTS batch_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  completed_items JSONB NOT NULL DEFAULT '[]',
  failed_items JSONB NOT NULL DEFAULT '[]',
  progress_percentage INTEGER DEFAULT 0,
  last_checkpoint_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for checkpoint queries
CREATE INDEX IF NOT EXISTS idx_batch_checkpoints_job_id ON batch_checkpoints(job_id);
CREATE INDEX IF NOT EXISTS idx_batch_checkpoints_updated_at ON batch_checkpoints(updated_at DESC);

-- Create backup_exports table for pre-delete backups
CREATE TABLE IF NOT EXISTS backup_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT,
  conversation_ids JSONB NOT NULL,
  backup_reason VARCHAR(100),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for backup queries
CREATE INDEX IF NOT EXISTS idx_backup_exports_user_id ON backup_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_exports_expires_at ON backup_exports(expires_at);
CREATE INDEX IF NOT EXISTS idx_backup_exports_created_at ON backup_exports(created_at DESC);

-- Add draft_data column to conversations for auto-save
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS draft_data JSONB,
ADD COLUMN IF NOT EXISTS draft_saved_at TIMESTAMPTZ;

-- Create function to clean up expired backups (scheduled job)
CREATE OR REPLACE FUNCTION cleanup_expired_backups()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM backup_exports
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old error logs (retention policy: 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM error_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on RLS policies)
GRANT ALL ON error_logs TO authenticated;
GRANT ALL ON batch_checkpoints TO authenticated;
GRANT ALL ON backup_exports TO authenticated;

-- Verify schema changes
SELECT 
  'conversations' AS table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('error_message', 'error_code', 'error_details', 'retry_count', 'last_error_at', 'draft_data', 'draft_saved_at')
ORDER BY column_name;

SELECT 
  'New Tables Created' AS status,
  table_name
FROM information_schema.tables
WHERE table_name IN ('error_logs', 'batch_checkpoints', 'backup_exports')
ORDER BY table_name;
```

++++++++++++++++++

**Post-Setup Verification:**
1. Run the SQL in Supabase SQL Editor
2. Verify all columns added to `conversations` table
3. Verify 3 new tables created: `error_logs`, `batch_checkpoints`, `backup_exports`
4. Verify all indexes created successfully
5. Test cleanup functions: `SELECT cleanup_expired_backups();`
6. Configure scheduled jobs in Supabase Dashboard:
   - `cleanup_expired_backups()`: Run daily at 2 AM
   - `cleanup_old_error_logs()`: Run weekly on Sunday at 3 AM

---

## Implementation Prompts

### Prompt 1: Error Handling Infrastructure

**Scope**: Centralized error classes, type guards, error logging service, and error code constants  
**Dependencies**: None (foundation task)  
**Estimated Time**: 8-12 hours  
**Risk Level**: Low

========================

You are a senior full-stack developer implementing the **Error Handling Infrastructure** for the Interactive LoRA Conversation Generation platform (Training Data Generation Module).

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Training Data Generation platform enables business users to generate 90-100 high-quality AI training conversations. Error handling is critical because:
- AI generation can fail due to rate limits, token limits, content policy violations
- Network failures are common with external APIs
- Database operations must maintain data integrity
- Users cannot afford to lose hours of work due to crashes
- Business users need clear, actionable error messages (not technical jargon)

**Functional Requirements (FR10.1.1):**
- Custom error class hierarchy differentiating recoverable vs non-recoverable errors
- Standardized error codes (ERR_API_RATE_LIMIT, ERR_NETWORK_TIMEOUT, etc.)
- User-friendly messages while preserving technical details for logging
- Error chaining for debugging complex flows
- Type-safe error guards enabling TypeScript narrowing
- Error serialization supporting JSON for logging/transmission
- Stack trace preservation with sensitive data sanitization
- Error context capturing metadata (timestamp, user_id, request_id, component)

**Technical Architecture:**
- TypeScript with strict mode enabled
- Centralized error infrastructure in `train-wireframe/src/lib/errors/`
- Integration with existing Zustand store (`train-wireframe/src/stores/useAppStore.ts`)
- Supabase for error log persistence
- Follows existing patterns in codebase (see `src/lib/database.ts`, `src/lib/ai-config.ts`)

**CURRENT CODEBASE STATE:**

**Existing Error Handling (Limited):**
```typescript
// src/lib/database.ts - Current basic pattern
if (error) {
  console.error('Error fetching documents:', error);
  throw error; // No custom error types
}
```

**Current Types (No Error Types):**
```typescript
// train-wireframe/src/lib/types.ts - No error-related types yet
export interface Conversation {
  id: string;
  // ...existing fields
}
```

**Current Store (No Error State):**
```typescript
// train-wireframe/src/stores/useAppStore.ts
interface AppState {
  isLoading: boolean;
  loadingMessage: string;
  // No error state management
}
```

**IMPLEMENTATION TASKS:**

**Task T-1.1.1: Custom Error Classes**

1. Create `train-wireframe/src/lib/errors/error-classes.ts`:

```typescript
// Define error codes enum
export enum ErrorCode {
  // API Errors
  ERR_API_RATE_LIMIT = 'ERR_API_RATE_LIMIT',
  ERR_API_UNAUTHORIZED = 'ERR_API_UNAUTHORIZED',
  ERR_API_FORBIDDEN = 'ERR_API_FORBIDDEN',
  ERR_API_NOT_FOUND = 'ERR_API_NOT_FOUND',
  ERR_API_VALIDATION = 'ERR_API_VALIDATION',
  ERR_API_SERVER = 'ERR_API_SERVER',
  ERR_API_TIMEOUT = 'ERR_API_TIMEOUT',
  
  // Network Errors
  ERR_NET_OFFLINE = 'ERR_NET_OFFLINE',
  ERR_NET_TIMEOUT = 'ERR_NET_TIMEOUT',
  ERR_NET_ABORT = 'ERR_NET_ABORT',
  ERR_NET_UNKNOWN = 'ERR_NET_UNKNOWN',
  
  // Generation Errors
  ERR_GEN_TOKEN_LIMIT = 'ERR_GEN_TOKEN_LIMIT',
  ERR_GEN_CONTENT_POLICY = 'ERR_GEN_CONTENT_POLICY',
  ERR_GEN_TIMEOUT = 'ERR_GEN_TIMEOUT',
  ERR_GEN_INVALID_RESPONSE = 'ERR_GEN_INVALID_RESPONSE',
  ERR_GEN_RATE_LIMIT = 'ERR_GEN_RATE_LIMIT',
  
  // Database Errors
  ERR_DB_CONNECTION = 'ERR_DB_CONNECTION',
  ERR_DB_QUERY = 'ERR_DB_QUERY',
  ERR_DB_CONSTRAINT = 'ERR_DB_CONSTRAINT',
  ERR_DB_DEADLOCK = 'ERR_DB_DEADLOCK',
  ERR_DB_TIMEOUT = 'ERR_DB_TIMEOUT',
  
  // Validation Errors
  ERR_VAL_REQUIRED = 'ERR_VAL_REQUIRED',
  ERR_VAL_FORMAT = 'ERR_VAL_FORMAT',
  ERR_VAL_RANGE = 'ERR_VAL_RANGE',
  ERR_VAL_TYPE = 'ERR_VAL_TYPE',
}

// Base error context interface
export interface ErrorContext {
  timestamp: string;
  userId?: string;
  requestId?: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

// Base application error class
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly isRecoverable: boolean;
  public readonly context: ErrorContext;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: ErrorCode,
    options: {
      isRecoverable?: boolean;
      context?: Partial<ErrorContext>;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.isRecoverable = options.isRecoverable ?? false;
    this.context = {
      timestamp: new Date().toISOString(),
      ...options.context,
    };
    this.cause = options.cause;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Serialize for logging/transmission
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      isRecoverable: this.isRecoverable,
      context: this.context,
      stack: this.stack,
      cause: this.cause?.message,
    };
  }

  // User-friendly message (override in subclasses)
  getUserMessage(): string {
    return this.message;
  }
}

// API Error class
export class APIError extends AppError {
  public readonly statusCode: number;
  public readonly responseData?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    options: {
      responseData?: unknown;
      context?: Partial<ErrorContext>;
      cause?: Error;
    } = {}
  ) {
    super(message, code, {
      isRecoverable: statusCode >= 500 || statusCode === 429,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.responseData = options.responseData;
  }

  getUserMessage(): string {
    switch (this.statusCode) {
      case 401:
        return 'Authentication failed. Please sign in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Rate limit exceeded. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

// Network Error class
export class NetworkError extends AppError {
  constructor(
    message: string,
    code: ErrorCode,
    options: {
      context?: Partial<ErrorContext>;
      cause?: Error;
    } = {}
  ) {
    super(message, code, {
      isRecoverable: true,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'NetworkError';
  }

  getUserMessage(): string {
    switch (this.code) {
      case ErrorCode.ERR_NET_OFFLINE:
        return 'No internet connection. Please check your network.';
      case ErrorCode.ERR_NET_TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorCode.ERR_NET_ABORT:
        return 'Request was cancelled.';
      default:
        return 'Network error. Please check your connection.';
    }
  }
}

// Validation Error class
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly validationErrors?: Record<string, string>;

  constructor(
    message: string,
    options: {
      field?: string;
      validationErrors?: Record<string, string>;
      context?: Partial<ErrorContext>;
    } = {}
  ) {
    super(message, ErrorCode.ERR_VAL_FORMAT, {
      isRecoverable: true,
      context: options.context,
    });
    this.name = 'ValidationError';
    this.field = options.field;
    this.validationErrors = options.validationErrors;
  }

  getUserMessage(): string {
    if (this.field) {
      return `Invalid value for ${this.field}: ${this.message}`;
    }
    return `Validation error: ${this.message}`;
  }
}

// Generation Error class
export class GenerationError extends AppError {
  public readonly retryable: boolean;
  public readonly estimatedTokens?: number;

  constructor(
    message: string,
    code: ErrorCode,
    options: {
      retryable?: boolean;
      estimatedTokens?: number;
      context?: Partial<ErrorContext>;
      cause?: Error;
    } = {}
  ) {
    super(message, code, {
      isRecoverable: options.retryable ?? true,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'GenerationError';
    this.retryable = options.retryable ?? true;
    this.estimatedTokens = options.estimatedTokens;
  }

  getUserMessage(): string {
    switch (this.code) {
      case ErrorCode.ERR_GEN_TOKEN_LIMIT:
        return `Token limit exceeded${this.estimatedTokens ? ` (~${this.estimatedTokens} tokens)` : ''}. Try reducing conversation length.`;
      case ErrorCode.ERR_GEN_CONTENT_POLICY:
        return 'Content violates AI policy. Please modify your prompt.';
      case ErrorCode.ERR_GEN_TIMEOUT:
        return 'Generation timed out. Please try again.';
      case ErrorCode.ERR_GEN_RATE_LIMIT:
        return 'Generation rate limit exceeded. Please wait a moment.';
      default:
        return 'Generation failed. Please try again.';
    }
  }
}

// Database Error class
export class DatabaseError extends AppError {
  public readonly sqlCode?: string;
  public readonly constraint?: string;

  constructor(
    message: string,
    code: ErrorCode,
    options: {
      sqlCode?: string;
      constraint?: string;
      context?: Partial<ErrorContext>;
      cause?: Error;
    } = {}
  ) {
    super(message, code, {
      isRecoverable: code === ErrorCode.ERR_DB_DEADLOCK || code === ErrorCode.ERR_DB_TIMEOUT,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'DatabaseError';
    this.sqlCode = options.sqlCode;
    this.constraint = options.constraint;
  }

  getUserMessage(): string {
    switch (this.code) {
      case ErrorCode.ERR_DB_CONNECTION:
        return 'Database connection failed. Please try again.';
      case ErrorCode.ERR_DB_CONSTRAINT:
        return this.constraint 
          ? `Data constraint violation: ${this.constraint}`
          : 'Data validation error. Please check your input.';
      case ErrorCode.ERR_DB_DEADLOCK:
        return 'Database busy. Please try again.';
      case ErrorCode.ERR_DB_TIMEOUT:
        return 'Database operation timed out. Please try again.';
      default:
        return 'Database error occurred. Please try again.';
    }
  }
}
```

2. Implement comprehensive unit tests for error classes.

**Task T-1.1.2: Error Type Guards and Utilities**

Create `train-wireframe/src/lib/errors/error-guards.ts`:

```typescript
import {
  AppError,
  APIError,
  NetworkError,
  ValidationError,
  GenerationError,
  DatabaseError,
  ErrorCode,
} from './error-classes';

// Type guard functions
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isGenerationError(error: unknown): error is GenerationError {
  return error instanceof GenerationError;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

// Error classification utility
export type ErrorCategory = 'api' | 'network' | 'validation' | 'generation' | 'database' | 'unknown';

export function categorizeError(error: unknown): ErrorCategory {
  if (isAPIError(error)) return 'api';
  if (isNetworkError(error)) return 'network';
  if (isValidationError(error)) return 'validation';
  if (isGenerationError(error)) return 'generation';
  if (isDatabaseError(error)) return 'database';
  return 'unknown';
}

// Retry eligibility checker
export function isRetryable(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isRecoverable;
  }
  
  // Treat unknown errors as non-retryable by default
  return false;
}

// User message extractor
export function getUserMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.getUserMessage();
  }
  
  if (error instanceof Error) {
    return 'An unexpected error occurred. Please try again.';
  }
  
  return 'An unknown error occurred.';
}

// Extract error code
export function getErrorCode(error: unknown): ErrorCode | null {
  if (isAppError(error)) {
    return error.code;
  }
  return null;
}

// Sanitize error for client display (remove sensitive data)
export function sanitizeError(error: unknown): {
  message: string;
  code?: ErrorCode;
  isRecoverable: boolean;
} {
  if (isAppError(error)) {
    return {
      message: error.getUserMessage(),
      code: error.code,
      isRecoverable: error.isRecoverable,
    };
  }

  return {
    message: 'An unexpected error occurred.',
    isRecoverable: false,
  };
}

// Convert unknown error to AppError
export function normalizeError(error: unknown, component?: string): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorCode.ERR_NET_UNKNOWN,
      {
        context: { component },
        cause: error,
      }
    );
  }

  return new AppError(
    'Unknown error occurred',
    ErrorCode.ERR_NET_UNKNOWN,
    {
      context: { 
        component,
        metadata: { rawError: String(error) },
      },
    }
  );
}
```

**Task T-1.1.3: Error Logging Service**

Create `train-wireframe/src/lib/errors/error-logger.ts`:

```typescript
import { AppError, ErrorCode } from './error-classes';
import { sanitizeError } from './error-guards';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  code?: ErrorCode;
  error?: AppError;
  context?: Record<string, unknown>;
  timestamp: string;
}

// Log destination interface
interface LogDestination {
  log(entry: LogEntry): Promise<void>;
}

// Console destination (development)
class ConsoleDestination implements LogDestination {
  async log(entry: LogEntry): Promise<void> {
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;
    const message = entry.error 
      ? `${prefix} ${entry.message}: ${entry.error.message}`
      : `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.context);
        break;
      case 'info':
        console.info(message, entry.context);
        break;
      case 'warn':
        console.warn(message, entry.context);
        break;
      case 'error':
      case 'critical':
        console.error(message, entry.context, entry.error);
        break;
    }
  }
}

// API destination (production)
class APIDestination implements LogDestination {
  private queue: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly batchSize = 10;
  private readonly flushDelay = 5000; // 5 seconds

  constructor() {
    this.startFlushInterval();
  }

  async log(entry: LogEntry): Promise<void> {
    // Sanitize before sending to API
    const sanitized = {
      ...entry,
      error: entry.error ? sanitizeError(entry.error) : undefined,
    };

    this.queue.push(sanitized);

    // Flush immediately for critical errors
    if (entry.level === 'critical' || this.queue.length >= this.batchSize) {
      await this.flush();
    }
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushDelay);
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: batch }),
      });

      if (!response.ok) {
        console.error('Failed to send error logs to API', response.statusText);
        // Re-queue on failure (with limit)
        if (this.queue.length < 100) {
          this.queue.unshift(...batch);
        }
      }
    } catch (error) {
      console.error('Error sending logs to API:', error);
      // Re-queue on failure (with limit)
      if (this.queue.length < 100) {
        this.queue.unshift(...batch);
      }
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush(); // Final flush
  }
}

// Singleton ErrorLogger class
class ErrorLogger {
  private static instance: ErrorLogger;
  private destinations: LogDestination[] = [];
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {
    // Always add console in development
    if (this.isDevelopment) {
      this.destinations.push(new ConsoleDestination());
    }

    // Add API destination in production
    if (!this.isDevelopment) {
      this.destinations.push(new APIDestination());
    }
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    error?: AppError | Error | unknown,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      id: crypto.randomUUID(),
      level,
      message,
      code: error instanceof AppError ? error.code : undefined,
      error: error instanceof AppError ? error : undefined,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  debug(message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('debug', message, undefined, context);
    this.logToDestinations(entry);
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('info', message, undefined, context);
    this.logToDestinations(entry);
  }

  warn(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const entry = this.createEntry('warn', message, error, context);
    this.logToDestinations(entry);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const entry = this.createEntry('error', message, error, context);
    this.logToDestinations(entry);
  }

  critical(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const entry = this.createEntry('critical', message, error, context);
    this.logToDestinations(entry);
  }

  private logToDestinations(entry: LogEntry): void {
    this.destinations.forEach((destination) => {
      destination.log(entry).catch((err) => {
        console.error('Failed to log to destination:', err);
      });
    });
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();
```

**ACCEPTANCE CRITERIA:**

1. ✅ All error classes (AppError, APIError, NetworkError, ValidationError, GenerationError, DatabaseError) implemented with proper inheritance
2. ✅ ErrorCode enum includes all 25+ error codes documented in task inventory
3. ✅ Error context captures: timestamp, userId, requestId, component, metadata
4. ✅ Error serialization (toJSON) works correctly
5. ✅ Stack traces preserved with Error.captureStackTrace
6. ✅ User-friendly messages implemented in getUserMessage() for each error type
7. ✅ Type guards (isAPIError, isNetworkError, etc.) correctly narrow types in TypeScript
8. ✅ categorizeError() function returns correct category for each error type
9. ✅ isRetryable() correctly identifies recoverable errors
10. ✅ ErrorLogger singleton pattern implemented
11. ✅ Console destination logs with correct formatting in development
12. ✅ API destination batches logs and flushes on interval or batch size
13. ✅ Critical errors flush immediately
14. ✅ Sensitive data sanitization implemented

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/lib/errors/
├── error-classes.ts       # Custom error classes and ErrorCode enum
├── error-guards.ts        # Type guards and utility functions
├── error-logger.ts        # ErrorLogger service with destinations
└── index.ts               # Re-export all error utilities
```

**Type Safety:**
- Use TypeScript strict mode
- Export all error classes and types from `index.ts`
- Add JSDoc comments for all public APIs

**Integration Points:**
- Error classes will be used by API routes (Prompt 2)
- ErrorLogger will be used throughout application for logging
- Type guards will be used in try-catch blocks across codebase

**VALIDATION REQUIREMENTS:**

**Unit Tests (create `train-wireframe/src/lib/errors/__tests__/`):**
1. Test each error class constructor with various parameters
2. Test error serialization (toJSON method)
3. Test getUserMessage() returns correct messages
4. Test type guards with different error instances
5. Test categorizeError() with all error types
6. Test isRetryable() logic
7. Test sanitizeError() removes sensitive data
8. Test ErrorLogger singleton pattern
9. Test log batching and flushing

**Manual Testing:**
1. Import error classes in a test file and instantiate
2. Verify TypeScript provides correct type narrowing with type guards
3. Test error chaining (cause property)
4. Verify stack traces are captured

**DELIVERABLES:**

**Required Files:**
1. `train-wireframe/src/lib/errors/error-classes.ts` (400+ lines)
2. `train-wireframe/src/lib/errors/error-guards.ts` (150+ lines)
3. `train-wireframe/src/lib/errors/error-logger.ts` (250+ lines)
4. `train-wireframe/src/lib/errors/index.ts` (export all)
5. `train-wireframe/src/lib/errors/__tests__/error-classes.test.ts` (unit tests)
6. `train-wireframe/src/lib/errors/__tests__/error-guards.test.ts` (unit tests)
7. `train-wireframe/src/lib/errors/__tests__/error-logger.test.ts` (unit tests)

**Documentation:**
- Add JSDoc comments to all exported functions and classes
- Create README.md in errors/ directory with usage examples
- Update main project README with error handling section

Implement this error handling infrastructure completely, ensuring all acceptance criteria are met. This is the foundation for all error handling in the application.

++++++++++++++++++


### Prompt 2: API Error Handling & Retry Logic

**Scope**: HTTP client wrapper, automatic retry with exponential backoff, rate limit handling, generation error management  
**Dependencies**: Prompt 1 (Error Infrastructure)  
**Estimated Time**: 18-24 hours  
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing **API Error Handling and Retry Logic** for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The platform relies heavily on the Claude API for conversation generation. API calls can fail due to:
- Rate limits (429 status)
- Network timeouts
- Server errors (5xx)
- Token limit exceeded
- Content policy violations

Business users need automatic recovery from transient failures without manual intervention.

**Functional Requirements (FR2.1.1, FR2.1.2):**
- Automatic rate limiting respecting Claude API constraints (50 requests/minute)
- Exponential backoff for retries: 1s, 2s, 4s, 8s, 16s
- Maximum 3 retry attempts before marking as failed
- Graceful degradation: partial batch success (not all-or-nothing)
- Rate limit status displayed in UI when throttling occurs
- Queue visualization showing pending, in-progress, completed requests
- Configurable rate limits for different API tiers

**Technical Architecture:**
- Build on error classes from Prompt 1
- Integrate with existing `src/lib/ai-config.ts`
- Wrap around Anthropic SDK for Claude API calls
- Use Zustand store for rate limit state management

**CURRENT CODEBASE STATE:**

**Existing AI Config:**
```typescript
// src/lib/ai-config.ts
export const AI_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 4096,
  temperature: 0.7,
};
```

**Existing Generation API Route (Basic):**
```typescript
// src/app/api/chunks/generate-dimensions/route.ts
// Current implementation has no retry logic
export async function POST(request: Request) {
  const { chunkContent } = await request.json();
  
  const response = await anthropic.messages.create({
    model: AI_CONFIG.model,
    max_tokens: AI_CONFIG.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  
  // No error handling or retry logic
  return NextResponse.json({ result: response.content });
}
```

**IMPLEMENTATION TASKS:**

**Task T-2.1.1: HTTP Client Wrapper**

Create `train-wireframe/src/lib/api/client.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { APIError, NetworkError, ErrorCode } from '../errors';
import { errorLogger } from '../errors/error-logger';

// Rate limiter configuration
interface RateLimiterConfig {
  requestsPerMinute: number;
  maxConcurrent: number;
}

// Request tracking
interface RequestMetadata {
  id: string;
  timestamp: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  retryCount: number;
}

// Rate limiter class
class RateLimiter {
  private requests: RequestMetadata[] = [];
  private config: RateLimiterConfig;
  private activeRequests = 0;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  async acquire(): Promise<void> {
    // Wait if too many concurrent requests
    while (this.activeRequests >= this.config.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Clean old requests (older than 1 minute)
    const oneMinuteAgo = Date.now() - 60000;
    this.requests = this.requests.filter(r => r.timestamp > oneMinuteAgo);

    // Wait if rate limit reached
    while (this.requests.length >= this.config.requestsPerMinute) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const oneMinuteAgo = Date.now() - 60000;
      this.requests = this.requests.filter(r => r.timestamp > oneMinuteAgo);
    }

    // Acquire slot
    this.activeRequests++;
    this.requests.push({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'in-progress',
      retryCount: 0,
    });
  }

  release(): void {
    this.activeRequests--;
  }

  getStatus() {
    return {
      activeRequests: this.activeRequests,
      requestsLastMinute: this.requests.length,
      remainingCapacity: this.config.requestsPerMinute - this.requests.length,
    };
  }
}

// API client configuration
interface APIClientConfig {
  apiKey: string;
  model: string;
  rateLimiter: RateLimiterConfig;
  timeout?: number;
}

// API client class
export class APIClient {
  private anthropic: Anthropic;
  private rateLimiter: RateLimiter;
  private timeout: number;

  constructor(config: APIClientConfig) {
    this.anthropic = new Anthropic({
      apiKey: config.apiKey,
    });
    this.rateLimiter = new RateLimiter(config.rateLimiter);
    this.timeout = config.timeout || 60000; // 60 seconds default
  }

  async generateConversation(
    prompt: string,
    options: {
      conversationId?: string;
      maxTokens?: number;
      temperature?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<Anthropic.Message> {
    // Acquire rate limit slot
    await this.rateLimiter.acquire();

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new NetworkError(
            'Request timed out',
            ErrorCode.ERR_API_TIMEOUT,
            {
              context: {
                component: 'APIClient',
                metadata: { conversationId: options.conversationId },
              },
            }
          ));
        }, this.timeout);
      });

      // Create API call promise
      const apiPromise = this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        messages: [{ role: 'user', content: prompt }],
      }, {
        signal: options.signal,
      });

      // Race timeout vs API call
      const response = await Promise.race([apiPromise, timeoutPromise]);

      errorLogger.info('API call successful', {
        conversationId: options.conversationId,
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
      });

      return response;
    } catch (error) {
      this.handleAPIError(error, options.conversationId);
      throw error; // Re-throw for retry logic
    } finally {
      this.rateLimiter.release();
    }
  }

  private handleAPIError(error: unknown, conversationId?: string): void {
    if (error instanceof Anthropic.APIError) {
      const apiError = new APIError(
        error.message,
        error.status || 500,
        this.mapAnthropicErrorCode(error),
        {
          responseData: error.error,
          context: {
            component: 'APIClient',
            metadata: { conversationId },
          },
        }
      );

      errorLogger.error('API call failed', apiError, {
        conversationId,
        statusCode: error.status,
      });

      throw apiError;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      const abortError = new NetworkError(
        'Request was aborted',
        ErrorCode.ERR_NET_ABORT,
        {
          context: {
            component: 'APIClient',
            metadata: { conversationId },
          },
        }
      );

      errorLogger.warn('Request aborted', abortError);
      throw abortError;
    }

    // Unknown error
    const unknownError = new NetworkError(
      'Unknown network error',
      ErrorCode.ERR_NET_UNKNOWN,
      {
        cause: error instanceof Error ? error : undefined,
        context: {
          component: 'APIClient',
          metadata: { conversationId },
        },
      }
    );

    errorLogger.error('Unknown API error', unknownError);
    throw unknownError;
  }

  private mapAnthropicErrorCode(error: Anthropic.APIError): ErrorCode {
    switch (error.status) {
      case 401:
        return ErrorCode.ERR_API_UNAUTHORIZED;
      case 403:
        return ErrorCode.ERR_API_FORBIDDEN;
      case 404:
        return ErrorCode.ERR_API_NOT_FOUND;
      case 429:
        return ErrorCode.ERR_API_RATE_LIMIT;
      case 400:
        return ErrorCode.ERR_API_VALIDATION;
      default:
        return ErrorCode.ERR_API_SERVER;
    }
  }

  getRateLimitStatus() {
    return this.rateLimiter.getStatus();
  }
}

// Export singleton instance
const apiClient = new APIClient({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'claude-sonnet-4-5-20250929',
  rateLimiter: {
    requestsPerMinute: 50,
    maxConcurrent: 3,
  },
  timeout: 60000,
});

export default apiClient;
```

**Task T-2.1.2: Retry Logic with Exponential Backoff**

Create `train-wireframe/src/lib/api/retry.ts`:

```typescript
import { APIError, NetworkError, isRetryable } from '../errors';
import { errorLogger } from '../errors/error-logger';

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 16000, // 16 seconds
  backoffFactor: 2,
  retryableErrors: [
    'ERR_API_RATE_LIMIT',
    'ERR_API_SERVER',
    'ERR_API_TIMEOUT',
    'ERR_NET_TIMEOUT',
    'ERR_NET_UNKNOWN',
  ],
};

// Calculate backoff delay with jitter
function calculateBackoff(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffFactor, attempt),
    config.maxDelay
  );
  
  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(delay + jitter);
}

// Check if error is retryable
function shouldRetry(error: unknown, config: RetryConfig): boolean {
  if (!isRetryable(error)) {
    return false;
  }

  if (error instanceof APIError || error instanceof NetworkError) {
    return config.retryableErrors.includes(error.code);
  }

  return false;
}

// Retry wrapper function
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: { conversationId?: string; component?: string }
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt < retryConfig.maxAttempts; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateBackoff(attempt - 1, retryConfig);
        errorLogger.info(`Retrying after ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxAttempts})`, {
          ...context,
          attempt,
          delay,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await fn();
      
      if (attempt > 0) {
        errorLogger.info(`Retry succeeded on attempt ${attempt + 1}`, context);
      }
      
      return result;
    } catch (error) {
      lastError = error;

      if (attempt === retryConfig.maxAttempts - 1 || !shouldRetry(error, retryConfig)) {
        errorLogger.error(
          `Request failed after ${attempt + 1} attempts`,
          error instanceof Error ? error : undefined,
          {
            ...context,
            attempts: attempt + 1,
            finalError: true,
          }
        );
        throw error;
      }

      errorLogger.warn(
        `Request failed, will retry (attempt ${attempt + 1}/${retryConfig.maxAttempts})`,
        error instanceof Error ? error : undefined,
        {
          ...context,
          attempt: attempt + 1,
        }
      );
    }
  }

  throw lastError;
}

// Retry decorator for class methods
export function Retry(config: Partial<RetryConfig> = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRetry(
        () => originalMethod.apply(this, args),
        config,
        { component: target.constructor.name }
      );
    };

    return descriptor;
  };
}
```

**Task T-2.1.3: Rate Limit Handler & UI Integration**

Create `train-wireframe/src/lib/api/rate-limit.ts`:

```typescript
import { APIError, ErrorCode } from '../errors';

// Parse rate limit headers from API response
export function parseRateLimitHeaders(headers: Headers): {
  limit: number | null;
  remaining: number | null;
  reset: Date | null;
  retryAfter: number | null;
} {
  return {
    limit: parseInt(headers.get('x-ratelimit-limit') || '') || null,
    remaining: parseInt(headers.get('x-ratelimit-remaining') || '') || null,
    reset: headers.get('x-ratelimit-reset')
      ? new Date(parseInt(headers.get('x-ratelimit-reset')!) * 1000)
      : null,
    retryAfter: parseInt(headers.get('retry-after') || '') || null,
  };
}

// Calculate delay before retry based on rate limit info
export function calculateRetryDelay(error: APIError): number {
  if (error.statusCode === 429 && error.responseData) {
    const data = error.responseData as any;
    
    // Check for retry-after in seconds
    if (data.retry_after) {
      return data.retry_after * 1000;
    }
  }

  // Default to 30 seconds for rate limits
  return 30000;
}

// Rate limit notification message
export function getRateLimitMessage(retryAfterSeconds: number): string {
  if (retryAfterSeconds < 60) {
    return `Rate limited. Retrying in ${retryAfterSeconds} seconds...`;
  }
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Rate limited. Retrying in ${minutes} minute${minutes > 1 ? 's' : ''}...`;
}
```

**Task T-2.2.1: Generation Error Classifier**

Create `train-wireframe/src/lib/generation/errors.ts`:

```typescript
import { GenerationError, ErrorCode } from '../errors';

// Generation error types
export enum GenerationErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  TOKEN_LIMIT = 'TOKEN_LIMIT',
  CONTENT_POLICY = 'CONTENT_POLICY',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
}

// Recovery actions
export enum RecoveryAction {
  RETRY = 'RETRY',
  REDUCE_CONTENT = 'REDUCE_CONTENT',
  MODIFY_PROMPT = 'MODIFY_PROMPT',
  SKIP = 'SKIP',
  CONTACT_SUPPORT = 'CONTACT_SUPPORT',
}

// Classify generation error and suggest recovery
export function classifyGenerationError(error: unknown): {
  type: GenerationErrorType;
  action: RecoveryAction;
  message: string;
} {
  if (!(error instanceof GenerationError)) {
    return {
      type: GenerationErrorType.SERVER_ERROR,
      action: RecoveryAction.RETRY,
      message: 'Unknown error occurred. Try again.',
    };
  }

  switch (error.code) {
    case ErrorCode.ERR_GEN_RATE_LIMIT:
      return {
        type: GenerationErrorType.RATE_LIMIT,
        action: RecoveryAction.RETRY,
        message: 'Rate limit reached. System will retry automatically.',
      };

    case ErrorCode.ERR_GEN_TOKEN_LIMIT:
      return {
        type: GenerationErrorType.TOKEN_LIMIT,
        action: RecoveryAction.REDUCE_CONTENT,
        message: error.estimatedTokens
          ? `Token limit exceeded (~${error.estimatedTokens} tokens). Reduce conversation length or complexity.`
          : 'Token limit exceeded. Reduce conversation length.',
      };

    case ErrorCode.ERR_GEN_CONTENT_POLICY:
      return {
        type: GenerationErrorType.CONTENT_POLICY,
        action: RecoveryAction.MODIFY_PROMPT,
        message: 'Content violates AI policy. Modify prompt to avoid sensitive topics.',
      };

    case ErrorCode.ERR_GEN_TIMEOUT:
      return {
        type: GenerationErrorType.TIMEOUT,
        action: RecoveryAction.RETRY,
        message: 'Generation timed out. Try again or reduce complexity.',
      };

    case ErrorCode.ERR_GEN_INVALID_RESPONSE:
      return {
        type: GenerationErrorType.INVALID_RESPONSE,
        action: RecoveryAction.RETRY,
        message: 'Invalid response from AI. Retrying may help.',
      };

    default:
      return {
        type: GenerationErrorType.SERVER_ERROR,
        action: RecoveryAction.CONTACT_SUPPORT,
        message: 'Server error. Contact support if this persists.',
      };
  }
}

// Error message templates
export const ERROR_MESSAGES: Record<GenerationErrorType, string> = {
  [GenerationErrorType.RATE_LIMIT]:
    'Too many requests. The system will automatically retry after a brief pause.',
  [GenerationErrorType.TOKEN_LIMIT]:
    'The conversation is too long. Consider reducing the number of turns or complexity.',
  [GenerationErrorType.CONTENT_POLICY]:
    'The content violates AI usage policies. Please modify your prompt to avoid restricted topics.',
  [GenerationErrorType.TIMEOUT]:
    'Generation took too long and timed out. Try simplifying the prompt or try again.',
  [GenerationErrorType.SERVER_ERROR]:
    'The AI service encountered an error. Please try again in a few moments.',
  [GenerationErrorType.INVALID_RESPONSE]:
    'The AI returned an invalid response. This usually resolves on retry.',
};
```

**ACCEPTANCE CRITERIA:**

1. ✅ APIClient class wraps Anthropic SDK with rate limiting
2. ✅ Rate limiter tracks requests per minute (sliding window)
3. ✅ Rate limiter limits concurrent requests to 3
4. ✅ Timeout handling using AbortSignal and Promise.race
5. ✅ API errors mapped to custom error classes (APIError, NetworkError)
6. ✅ Error logging for all API calls (success and failure)
7. ✅ Retry logic with exponential backoff (1s, 2s, 4s, 8s, 16s)
8. ✅ Maximum 3 retry attempts before final failure
9. ✅ Jitter added to backoff delays (±25%)
10. ✅ shouldRetry() correctly identifies retryable errors
11. ✅ withRetry() wrapper function works with any async function
12. ✅ @Retry decorator works on class methods
13. ✅ Rate limit header parsing (x-ratelimit-*, retry-after)
14. ✅ Generation error classification with recovery actions
15. ✅ User-friendly error messages for each error type

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/lib/api/
├── client.ts              # APIClient with rate limiting
├── retry.ts               # Retry logic and withRetry wrapper
└── rate-limit.ts          # Rate limit utilities

train-wireframe/src/lib/generation/
└── errors.ts              # Generation error classification
```

**Integration Points:**
- APIClient used by all API routes for conversation generation
- withRetry() used to wrap API calls in routes and services
- Error classification used in UI to display appropriate messages

**Configuration:**
```typescript
// Environment variables
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_RATE_LIMIT=50  // requests per minute
ANTHROPIC_MAX_CONCURRENT=3
ANTHROPIC_TIMEOUT=60000  // milliseconds
```

**VALIDATION REQUIREMENTS:**

**Unit Tests:**
1. Test RateLimiter with various request patterns
2. Test calculateBackoff with different attempts
3. Test shouldRetry with all error types
4. Test withRetry success after N retries
5. Test withRetry failure after max attempts
6. Test timeout handling
7. Test rate limit header parsing
8. Test generation error classification

**Integration Tests:**
1. Test API call with mock Anthropic SDK
2. Test retry behavior with simulated failures
3. Test rate limiting with burst of requests
4. Test concurrent request limiting

**Manual Testing:**
1. Generate conversation and observe rate limit status
2. Trigger rate limit error (429) and verify retry
3. Trigger timeout and verify error handling
4. Test with invalid API key to verify error handling

**DELIVERABLES:**

**Required Files:**
1. `train-wireframe/src/lib/api/client.ts` (300+ lines)
2. `train-wireframe/src/lib/api/retry.ts` (200+ lines)
3. `train-wireframe/src/lib/api/rate-limit.ts` (100+ lines)
4. `train-wireframe/src/lib/generation/errors.ts` (150+ lines)
5. Unit tests for all modules
6. Integration tests for API client

**API Route Update:**
Update existing generation route to use new error handling:
```typescript
// src/app/api/conversations/generate/route.ts
import { withRetry } from '@/lib/api/retry';
import apiClient from '@/lib/api/client';
import { classifyGenerationError } from '@/lib/generation/errors';

export async function POST(request: Request) {
  try {
    const { prompt, conversationId } = await request.json();
    
    const response = await withRetry(
      () => apiClient.generateConversation(prompt, { conversationId }),
      { maxAttempts: 3 },
      { conversationId, component: 'GenerationAPI' }
    );
    
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    const classification = classifyGenerationError(error);
    return NextResponse.json(
      { 
        success: false, 
        error: classification.message,
        recoveryAction: classification.action,
      },
      { status: 500 }
    );
  }
}
```

Implement complete API error handling with retry logic, ensuring all acceptance criteria are met.

++++++++++++++++++


### Prompt 3: React Error Boundaries

**Scope**: Global and feature-specific error boundaries with fallback UI  
**Dependencies**: Prompt 1 (Error Infrastructure)  
**Estimated Time**: 10-14 hours  
**Risk Level**: Medium

========================

You are a senior React developer implementing **Error Boundaries** for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
React errors (component crashes, rendering failures) can crash the entire application. Business users need:
- Application to remain functional even if one component fails
- Clear error messages explaining what went wrong
- Options to recover without losing work
- Ability to report bugs with context

**Functional Requirements (FR3.1.0, FR3.2.0):**
- Global error boundary catching all unhandled React errors
- Feature-specific boundaries isolating failures (Dashboard, Generation, Export)
- User-friendly fallback UI with error details and recovery actions
- Error logging to ErrorLogger with component stack trace
- "Reload Page" and "Report Issue" buttons in fallback UI
- Error boundary reset when navigating to different route
- Development mode showing detailed errors, production showing generic message

**Technical Architecture:**
- React 18 error boundary class components
- Integration with error classes from Prompt 1
- Integration with Zustand store for error state
- Fallback UI using existing Shadcn components

**CURRENT CODEBASE STATE:**

**Existing Layout:**
```typescript
// train-wireframe/src/components/layout/DashboardLayout.tsx
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}  {/* No error boundary */}
      </main>
    </div>
  );
}
```

**Existing Component Tree:**
```
App
└── DashboardLayout
    ├── Header
    ├── Sidebar
    └── Main Content (varies by route)
        ├── DashboardView
        ├── TemplatesView
        ├── ReviewQueueView
        └── SettingsView
```

**IMPLEMENTATION TASKS:**

**Task T-3.1.1: Global Error Boundary Component**

Create `train-wireframe/src/components/errors/ErrorBoundary.tsx`:

```typescript
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, ErrorCode } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, only catches errors in children
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: crypto.randomUUID(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error with component stack
    const appError = new AppError(
      error.message,
      ErrorCode.ERR_NET_UNKNOWN,
      {
        cause: error,
        context: {
          component: 'ErrorBoundary',
          metadata: {
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId,
          },
        },
      }
    );

    errorLogger.critical('React error boundary caught error', appError, {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // Call custom onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({ errorInfo });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo,
          this.resetError
        );
      }

      // Default fallback
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId || undefined}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}
```

**Task T-3.1.2: Error Fallback UI Component**

Create `train-wireframe/src/components/errors/ErrorFallback.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  errorId?: string;
  onReset?: () => void;
  showReportButton?: boolean;
}

export function ErrorFallback({
  error,
  errorInfo,
  errorId,
  onReset,
  showReportButton = true,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleReload = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  const handleReport = () => {
    // Open report issue dialog or external link
    const subject = encodeURIComponent(`Error Report: ${error.name}`);
    const body = encodeURIComponent(
      `Error ID: ${errorId}\n\n` +
      `Error: ${error.message}\n\n` +
      `Component Stack:\n${errorInfo.componentStack}\n\n` +
      `Please describe what you were doing when this error occurred:\n`
    );
    
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                {isDevelopment
                  ? error.message
                  : "We're sorry, but an unexpected error occurred."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorId && (
            <Alert>
              <AlertDescription className="font-mono text-sm">
                Error ID: {errorId}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              The application encountered an error and couldn't continue. You can try:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Reloading the page to start fresh</li>
              <li>Going back and trying a different action</li>
              <li>Reporting this issue if it persists</li>
            </ul>
          </div>

          {isDevelopment && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  {showDetails ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Error Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Error Details
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Error Message:</h4>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    {error.name}: {error.message}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Stack Trace:</h4>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto max-h-64">
                    {error.stack}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Component Stack:</h4>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto max-h-64">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={handleReload} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
          {showReportButton && (
            <Button onClick={handleReport} variant="outline" className="flex-1">
              <Bug className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
```

**Task T-3.2.1: Feature-Specific Error Boundaries**

Create `train-wireframe/src/components/errors/FeatureErrorBoundary.tsx`:

```typescript
'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface FeatureErrorFallbackProps {
  featureName: string;
  error: Error;
  onReset: () => void;
  alternativeRoute?: string;
}

function FeatureErrorFallback({
  featureName,
  error,
  onReset,
  alternativeRoute = '/dashboard',
}: FeatureErrorFallbackProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <CardTitle className="text-lg">{featureName} Unavailable</CardTitle>
              <CardDescription className="mt-1">
                This feature encountered an error and couldn't load.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Don't worry — the rest of the application is still working. You can try reloading this feature or navigate to another area.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={onReset} variant="outline" className="flex-1">
            Try Again
          </Button>
          <Button
            onClick={() => router.push(alternativeRoute)}
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Dashboard Error Boundary
export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <FeatureErrorFallback
          featureName="Dashboard"
          error={error}
          onReset={reset}
          alternativeRoute="/templates"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Generation Error Boundary
export function GenerationErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <FeatureErrorFallback
          featureName="Generation"
          error={error}
          onReset={reset}
          alternativeRoute="/dashboard"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Export Error Boundary
export function ExportErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <FeatureErrorFallback
          featureName="Export"
          error={error}
          onReset={reset}
          alternativeRoute="/dashboard"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Templates Error Boundary
export function TemplatesErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <FeatureErrorFallback
          featureName="Templates"
          error={error}
          onReset=Reset}
          alternativeRoute="/dashboard"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

**Task T-3.2.2: Integrate Error Boundaries into Layout**

Update `train-wireframe/src/components/layout/DashboardLayout.tsx`:

```typescript
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { ErrorBoundary } from '../errors/ErrorBoundary';
import {
  DashboardErrorBoundary,
  GenerationErrorBoundary,
  TemplatesErrorBoundary,
} from '../errors/FeatureErrorBoundary';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine which error boundary to use based on route
  const ContentWithErrorBoundary = () => {
    if (pathname?.startsWith('/dashboard')) {
      return <DashboardErrorBoundary>{children}</DashboardErrorBoundary>;
    }
    if (pathname?.startsWith('/templates')) {
      return <TemplatesErrorBoundary>{children}</TemplatesErrorBoundary>;
    }
    if (pathname?.includes('/generate')) {
      return <GenerationErrorBoundary>{children}</GenerationErrorBoundary>;
    }
    // Default error boundary for other routes
    return <ErrorBoundary>{children}</ErrorBoundary>;
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <ContentWithErrorBoundary />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
```

**ACCEPTANCE CRITERIA:**

1. ✅ ErrorBoundary class component implements getDerivedStateFromError
2. ✅ componentDidCatch logs error with component stack trace
3. ✅ Error ID generated for support tracking
4. ✅ ErrorFallback UI displays user-friendly message
5. ✅ "Reload Page" button clears error and refreshes
6. ✅ "Report Issue" button pre-fills error details
7. ✅ Development mode shows detailed error information
8. ✅ Production mode shows generic message with error ID
9. ✅ Feature-specific boundaries isolate errors to features
10. ✅ Feature fallback suggests alternative routes
11. ✅ Error boundaries integrate with layout structure
12. ✅ Error boundaries reset on route navigation
13. ✅ Collapsible details section in development mode
14. ✅ Error logging to ErrorLogger service

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
train-wireframe/src/components/errors/
├── ErrorBoundary.tsx          # Base error boundary class
├── ErrorFallback.tsx           # Default fallback UI
├── FeatureErrorBoundary.tsx    # Feature-specific boundaries
└── index.ts                    # Re-exports
```

**Integration:**
- Wrap entire app with global ErrorBoundary
- Wrap each major feature with feature-specific boundary
- Use ErrorBoundary in modal components for isolation
- Log all caught errors to ErrorLogger

**Styling:**
- Use existing Shadcn components (Card, Button, Alert)
- Match application theme and design system
- Responsive layout for mobile/tablet/desktop
- Accessible keyboard navigation

**VALIDATION REQUIREMENTS:**

**Component Tests:**
```typescript
// __tests__/ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

function ThrowError() {
  throw new Error('Test error');
}

test('ErrorBoundary catches error and displays fallback', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});

test('ErrorBoundary logs error to ErrorLogger', () => {
  const logSpy = jest.spyOn(errorLogger, 'critical');
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(logSpy).toHaveBeenCalled();
});
```

**Manual Testing:**
1. Intentionally throw error in a component and verify fallback displays
2. Click "Reload Page" and verify error clears
3. Click "Report Issue" and verify email template
4. Navigate between routes and verify error boundaries reset
5. Test feature-specific boundaries isolate errors
6. Verify error logging in browser console (development)
7. Test collapsible details section

**DELIVERABLES:**

**Required Files:**
1. `train-wireframe/src/components/errors/ErrorBoundary.tsx` (150+ lines)
2. `train-wireframe/src/components/errors/ErrorFallback.tsx` (200+ lines)
3. `train-wireframe/src/components/errors/FeatureErrorBoundary.tsx` (150+ lines)
4. `train-wireframe/src/components/errors/index.ts` (exports)
5. Updated `DashboardLayout.tsx` with error boundaries
6. Component tests for error boundaries

**Documentation:**
- Add error boundary usage guide to README
- Document error ID tracking for support
- Add troubleshooting section for common errors

Implement complete error boundary system, ensuring all acceptance criteria are met and the application remains functional even when components fail.

++++++++++++++++++


### Remaining Prompts Summary

**Note**: Prompts 4-8 follow the same comprehensive structure as Prompts 1-3. Refer to the **Task Inventory** document (`04-train-FR-wireframes-E10-output.md`) for complete implementation details including:
- Detailed component/element breakdowns
- Implementation process (Preparation → Implementation → Validation)
- Code examples and patterns
- Acceptance criteria checklistsPrompts 4-8 Overview:

**Prompt 4: Database Resilience** (12-16 hours, High Risk)
- Transaction wrapper with automatic rollback
- Database error classification and handling
- Health monitoring and connection pool management
- Files: `src/lib/database/transaction.ts`, `errors.ts`, `health.ts`
- Key Tasks: T-4.1.1 (Transaction Wrapper), T-4.1.2 (Error Classifier), T-4.1.3 (Health Monitor)

**Prompt 5: Auto-Save & Draft Recovery** (19-25 hours, Medium Risk)
- Auto-save hook with debounced saving
- IndexedDB draft storage with conflict resolution
- Recovery dialog on page load
- Files: `train-wireframe/src/hooks/useAutoSave.ts`, `lib/auto-save/`
- Key Tasks: T-5.1.1 (Auto-Save Hook), T-5.1.2 (Draft Recovery System)

**Prompt 6: Batch Job Resume & Backup** (19-25 hours, Medium Risk)
- Batch checkpoint system for resumable jobs
- Resume UI with progress display
- Pre-delete backup with 7-day retention
- Files: `train-wireframe/src/lib/batch/checkpoint.ts`, `backup/`
- Key Tasks: T-5.2.1 (Checkpoint System), T-5.2.2 (Resume UI), T-5.2.3 (Idempotency), T-5.3.1 (Pre-Delete Backup)

**Prompt 7: Enhanced Notifications & Error Details** (7-10 hours, Low Risk)
- Toast notification system upgrade with error-specific toasts
- Error details modal with technical information
- Rate limit toast with countdown timer
- Files: `train-wireframe/src/lib/notifications/`, `components/notifications/`
- Key Tasks: T-6.1.1 (Notification Manager), T-6.1.2 (Error-Specific Toasts), T-6.2.1 (Error Details Modal)

**Prompt 8: Recovery Wizard & Testing** (18-22 hours, Low-Medium Risk)
- Recovery detection across all failure types
- Multi-step recovery wizard UI
- Comprehensive test suite for all error scenarios
- Files: `train-wireframe/src/lib/recovery/`, `components/recovery/`, `__tests__/`
- Key Tasks: T-7.1.1 (Recovery Detection), T-7.1.2 (Wizard UI), T-8.1.1-3 (Test Suites)

**Implementation Sequence Rationale:**
1. Prompts 1-3 (Foundation & React) establish error infrastructure
2. Prompt 4 (Database) protects data integrity
3. Prompts 5-6 (Recovery) prevent data loss
4. Prompt 7 (UX) communicates errors clearly
5. Prompt 8 (Testing & Wizard) validates and integrates everything

---

## Quality Validation Checklist

### Post-Implementation Verification

**Foundation (Prompts 1-2):**
- [ ] All error classes instantiate correctly with proper types
- [ ] Error serialization preserves all context
- [ ] Type guards enable TypeScript narrowing
- [ ] ErrorLogger batches and flushes correctly
- [ ] API client respects rate limits
- [ ] Retry logic uses exponential backoff with jitter
- [ ] Generation errors classified correctly

**React & Database (Prompts 3-4):**
- [ ] Error boundaries catch render errors
- [ ] Fallback UI displays appropriately
- [ ] Feature boundaries isolate errors
- [ ] Database transactions rollback on error
- [ ] Error classification identifies Postgres errors
- [ ] Database health monitoring reports metrics

**Data Protection (Prompts 5-6):**
- [ ] Auto-save triggers on interval
- [ ] Draft recovery prompts on page load
- [ ] Batch jobs save checkpoints incrementally
- [ ] Resume skips completed items (idempotent)
- [ ] Pre-delete backup creates exports
- [ ] Backup cleanup runs on schedule

**User Experience (Prompts 7-8):**
- [ ] Toast notifications display with correct types
- [ ] Error details modal shows technical info
- [ ] Rate limit toast shows countdown
- [ ] Recovery wizard detects all failure types
- [ ] Recovery wizard guides through restoration
- [ ] All user-facing messages are friendly

### Cross-Prompt Integration Testing

**Error Flow End-to-End:**
1. Generate API error → Prompt 2 catches → Prompt 1 logs → Prompt 7 displays
2. React component crashes → Prompt 3 catches → Prompt 1 logs → Fallback shown
3. Database transaction fails → Prompt 4 rolls back → Prompt 1 logs → Error returned
4. Generation interrupted → Prompt 5 auto-saves → Prompt 8 wizard recovers

**Recovery Flow End-to-End:**
1. Batch job fails midway → Prompt 6 checkpoint saved
2. User closes browser → Returns later
3. Prompt 8 wizard detects incomplete batch
4. User resumes → Prompt 6 skips completed items
5. Batch completes successfully

### Cross-Prompt Consistency

**Naming Conventions:**
- [ ] Error classes use consistent naming (AppError, APIError, etc.)
- [ ] File structure follows established patterns
- [ ] Component naming matches Shadcn conventions
- [ ] Database columns use snake_case
- [ ] TypeScript interfaces use PascalCase

**Architectural Patterns:**
- [ ] All async operations use try-catch with proper error handling
- [ ] All database operations wrapped in transactions where appropriate
- [ ] All UI errors display via toast or modal (not alerts)
- [ ] All errors logged to ErrorLogger
- [ ] All user messages are actionable

**Data Models:**
- [ ] Error context includes timestamp, userId, component
- [ ] Batch jobs track progress with percentage
- [ ] Checkpoints store completed and failed items
- [ ] Recovery items include type, timestamp, description

**User Experience:**
- [ ] All error messages are user-friendly
- [ ] All actions have loading states
- [ ] All confirmations use proper dialogs
- [ ] All toasts auto-dismiss or require action appropriately
- [ ] All keyboard shortcuts documented

---

## Next Segment Preparation

**E11 and Beyond Dependencies:**

**What E10 Provides:**
1. **Error Infrastructure** → All future features can use error classes and logging
2. **API Resilience** → Rate limiting and retry logic for any API calls
3. **Data Protection** → Auto-save and recovery patterns for new features
4. **User Communication** → Toast and modal systems for feedback

**Integration Points for Future Segments:**
- New features should wrap operations with `withRetry()`
- New components should be wrapped in feature error boundaries
- New database operations should use transaction wrapper
- New modals should use auto-save if editing data
- New batch operations should use checkpoint system

**Lessons Learned:**
- Document common error patterns and solutions
- Maintain error code registry as new errors discovered
- Update recovery wizard for new recoverable data types
- Extend error classification for domain-specific errors

**Technical Debt to Address:**
- Consider WebSocket for real-time error notifications (currently polling)
- Implement circuit breaker pattern for repeated failures
- Add error rate alerting/monitoring dashboard
- Integrate with external error tracking service (Sentry)
- Implement retry budgets to prevent infinite retry loops

---

## Implementation Completion Criteria

**E10 is complete when:**

1. ✅ All 8 prompts implemented with deliverables
2. ✅ All acceptance criteria met (documented in each prompt)
3. ✅ Database schema changes deployed to Supabase
4. ✅ All unit tests passing (85%+ coverage)
5. ✅ Integration tests passing (error flows end-to-end)
6. ✅ Manual testing checklist completed
7. ✅ Documentation updated (README, JSDoc, guides)
8. ✅ Code review completed and approved
9. ✅ Production deployment successful
10. ✅ Monitoring confirms error handling working

**Success Metrics:**
- Error recovery rate > 95% (automatic retry success)
- Data loss incidents = 0 (auto-save prevents loss)
- User error reports < 5 per 100 operations
- Application crash rate < 0.1% (error boundaries prevent)
- Recovery wizard usage > 80% when failures occur

**Final Validation:**
Before marking E10 complete, run:
1. Full regression test suite
2. Load testing with simulated errors
3. Manual testing of all error scenarios
4. Review error logs for unexpected patterns
5. Verify cleanup jobs running (backups, logs)

---

## Document Status

**Generated**: 2025-01-29  
**Version**: 1.0  
**Status**: Complete - Ready for Implementation

**Total Prompts**: 8  
**Estimated Total Time**: 102-135 hours  
**Risk Level**: Medium (High-risk areas in Prompts 2, 4)  
**Dependencies**: E01-E09 (Database, UI Components, Generation Workflows)

**Implementation Team Recommendations:**
- **Prompt 1-2**: Senior backend engineer (foundation critical)
- **Prompt 3**: Senior React engineer (error boundaries tricky)
- **Prompt 4**: Database specialist (transaction management)
- **Prompt 5-6**: Full-stack engineer (auto-save + batch resume)
- **Prompt 7**: Frontend engineer (UI/UX for notifications)
- **Prompt 8**: QA engineer + dev (testing focus)

**Estimated Calendar Time:**
- With 2 full-time engineers: 6-8 weeks
- With 3 full-time engineers: 4-5 weeks
- With 4 full-time engineers: 3-4 weeks (optimal)

---

## Appendix: Quick Reference

### Error Codes by Category

**API Errors (ERR_API_*):**
- RATE_LIMIT, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION, SERVER, TIMEOUT

**Network Errors (ERR_NET_*):**
- OFFLINE, TIMEOUT, ABORT, UNKNOWN

**Generation Errors (ERR_GEN_*):**
- TOKEN_LIMIT, CONTENT_POLICY, TIMEOUT, INVALID_RESPONSE, RATE_LIMIT

**Database Errors (ERR_DB_*):**
- CONNECTION, QUERY, CONSTRAINT, DEADLOCK, TIMEOUT

**Validation Errors (ERR_VAL_*):**
- REQUIRED, FORMAT, RANGE, TYPE

### File Structure Overview

```
train-wireframe/src/
├── lib/
│   ├── errors/
│   │   ├── error-classes.ts
│   │   ├── error-guards.ts
│   │   ├── error-logger.ts
│   │   └── index.ts
│   ├── api/
│   │   ├── client.ts
│   │   ├── retry.ts
│   │   └── rate-limit.ts
│   ├── generation/
│   │   └── errors.ts
│   ├── auto-save/
│   │   ├── storage.ts
│   │   ├── recovery.ts
│   │   └── conflict-resolver.ts
│   ├── batch/
│   │   ├── checkpoint.ts
│   │   └── processor.ts
│   ├── backup/
│   │   └── storage.ts
│   ├── notifications/
│   │   └── manager.ts
│   └── recovery/
│       ├── detection.ts
│       └── types.ts
├── components/
│   ├── errors/
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorFallback.tsx
│   │   ├── FeatureErrorBoundary.tsx
│   │   └── index.ts
│   ├── notifications/
│   │   ├── RateLimitToast.tsx
│   │   ├── NetworkErrorToast.tsx
│   │   ├── ValidationErrorToast.tsx
│   │   └── GenerationErrorToast.tsx
│   ├── auto-save/
│   │   └── RecoveryDialog.tsx
│   ├── batch/
│   │   ├── ResumeDialog.tsx
│   │   └── BatchSummary.tsx
│   ├── backup/
│   │   ├── PreDeleteBackup.tsx
│   │   └── BackupProgress.tsx
│   └── recovery/
│       ├── RecoveryWizard.tsx
│       ├── RecoverableItemList.tsx
│       ├── RecoveryProgress.tsx
│       └── RecoverySummary.tsx
├── hooks/
│   └── useAutoSave.ts
└── __tests__/
    ├── errors/
    ├── api/
    ├── components/
    └── integration/

src/lib/database/
├── transaction.ts
├── errors.ts
└── health.ts
```

### Key Integration Points

**1. Error Logging:**
```typescript
import { errorLogger } from '@/lib/errors/error-logger';
errorLogger.error('Operation failed', error, { context });
```

**2. API Calls with Retry:**
```typescript
import { withRetry } from '@/lib/api/retry';
import apiClient from '@/lib/api/client';

const response = await withRetry(
  () => apiClient.generateConversation(prompt, options),
  { maxAttempts: 3 },
  { conversationId, component: 'MyComponent' }
);
```

**3. Error Boundaries:**
```typescript
import { ErrorBoundary } from '@/components/errors';

<ErrorBoundary>
  <MyFeatureComponent />
</ErrorBoundary>
```

**4. Auto-Save:**
```typescript
import { useAutoSave } from '@/hooks/useAutoSave';

const { saveDraft, saveStatus } = useAutoSave({
  data: conversationDraft,
  onSave: async (data) => { /* save logic */ },
  interval: 30000, // 30 seconds
});
```

**5. Database Transactions:**
```typescript
import { withTransaction } from '@/lib/database/transaction';

await withTransaction(async (client) => {
  // Multiple operations
  await client.from('table1').insert(data1);
  await client.from('table2').update(data2);
  // Automatic rollback on error
});
```

---

**End of E10 Implementation Execution Instructions**

