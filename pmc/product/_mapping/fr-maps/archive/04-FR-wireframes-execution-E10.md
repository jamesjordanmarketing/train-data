# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E10)
**Generated**: 2025-01-29  
**Segment**: E10 - Error Handling & Recovery Systems  
**Total Prompts**: 5  
**Estimated Implementation Time**: 80-100 hours (2-2.5 weeks)

---

## Executive Summary

This segment implements comprehensive error handling and data recovery systems for the Interactive LoRA Conversation Generation module, ensuring reliability, user trust, and business continuity. These systems transform potential failure points into managed, recoverable events with clear user feedback and automated recovery mechanisms.

**Strategic Importance:**
- **Reliability**: Graceful degradation prevents complete system failures from partial errors
- **User Trust**: Transparent error messaging and recovery options build confidence in the platform
- **Data Protection**: Automated backups and recovery wizards prevent data loss from unexpected failures
- **Operational Excellence**: Comprehensive logging enables rapid debugging and root cause analysis
- **Business Continuity**: Resume-from-failure capabilities ensure long-running operations complete successfully

**Key Deliverables:**
1. Error handling infrastructure with typed error classes and centralized management
2. API error interceptors with automatic retry logic and rate limit handling
3. UI error boundaries protecting against React crashes with fallback interfaces
4. Toast notification system distinguishing error types (temporary, permanent, actionable)
5. Data recovery mechanisms for failed batch jobs with resume capabilities
6. Conversation draft auto-save system preventing loss during generation
7. Database transaction rollback management ensuring data consistency
8. Comprehensive error logging with aggregation and search capabilities

**Success Metrics:**
- 95%+ of transient errors recovered automatically without user intervention
- <2 seconds to display actionable error feedback after failure
- 100% of batch job progress saved for resume after interruption
- Zero data loss from application errors or crashes
- <5 minutes mean time to identify root cause using error logs

---

## Context and Dependencies

### Previous Segment Deliverables

**E01-E08** (Assumed Complete):
- Core conversation generation workflows (single, batch, generate all)
- Dashboard with table, filtering, sorting, pagination  
- Quality validation and scoring systems
- Review queue and approval workflows
- Template, scenario, and edge case management
- Export functionality with multiple formats
- User preferences and settings interface
- Database schema with conversations, turns, templates, scenarios

**E09 - Chunks-Alpha Integration** (Assumed Complete):
- Conversation-to-chunk associations and dimension extraction
- Chunk selector UI and context injection
- Dimension-driven parameter generation
- Orphaned conversation management

### Current Codebase State

**Existing Error Handling (Basic):**
- `src/app/api/chunks/generate-dimensions/route.ts`: Basic try-catch with generic error responses
- `src/lib/ai-config.ts`: Simple rate limit configuration without retry logic
- `src/lib/database.ts`: Database error catching but no typed error classes
- `train-wireframe/src/components/ui/sonner.tsx`: Toast notification system (Sonner library integrated)

**Services Available for Extension:**
- `src/lib/chunk-service.ts`: Chunk CRUD operations with basic error handling
- `src/lib/dimension-generation/generator.ts`: AI generation with minimal retry logic
- `train-wireframe/src/stores/useAppStore.ts`: Zustand state management with loading states

**State Management:**
- `isLoading` and `loadingMessage` states exist but no error state tracking
- No centralized error history or error recovery state
- Batch job state (`BatchJob` type) exists but lacks recovery metadata

**Database Schema Available:**
- `api_response_logs` table captures API calls but not application errors
- No dedicated error_logs table for UI/application errors
- No recovery checkpoints for batch operations

### Cross-Segment Dependencies

**Dependencies on Previous Work:**
- Batch generation system (E04) must be extended with checkpoints
- API routes (E02-E03) must implement consistent error response format
- UI components (E05-E07) must integrate error boundaries
- State management (all segments) must track error states

**Integration Points:**
- Claude API integration: Add retry wrapper with exponential backoff
- Supabase Database: Implement transaction rollback and error logging
- React Components: Wrap in error boundaries with fallback UI
- Zustand Store: Add error history and recovery action triggers

**External Systems:**
- Claude API: May return rate limit (429), server errors (5xx), validation errors (4xx)
- Supabase: May timeout, connection failures, constraint violations
- Browser: Storage quota exceeded, network offline, security errors

---

## Implementation Strategy

### Risk Assessment

**High-Risk Areas:**

1. **Error Boundary Implementation (High Risk)**
   - **Risk**: Poorly implemented boundaries could catch errors but fail to recover, breaking the app
   - **Mitigation**:
     - Implement granular boundaries at component level, not just root level
     - Test error boundaries with deliberately thrown errors
     - Implement fallback UI that allows partial functionality
     - Log all caught errors to backend for analysis
     - Provide "Reset" button to clear error state and retry

2. **Retry Logic Infinite Loops (High Risk)**
   - **Risk**: Aggressive retry logic could create infinite loops or amplify rate limit violations
   - **Mitigation**:
     - Implement maximum retry count (default: 3)
     - Use exponential backoff with jitter (base: 1s, max: 32s)
     - Track retry attempts per request ID
     - Circuit breaker pattern: stop retrying after 5 consecutive failures
     - Log all retry attempts with timestamps for debugging

3. **Data Corruption During Recovery (Medium Risk)**
   - **Risk**: Resume logic might duplicate data or create inconsistent states
   - **Mitigation**:
     - Use idempotent operations with unique request IDs
     - Implement database transactions with proper isolation levels
     - Validate data integrity before committing recovered state
     - Create recovery audit trail showing what was restored
     - Test recovery scenarios extensively with simulated failures

4. **Performance Impact of Logging (Low Risk)**
   - **Risk**: Excessive error logging could slow down application
   - **Mitigation**:
     - Implement async logging with batched writes
     - Sample verbose logs (e.g., log 1 in 10 minor errors)
     - Set retention policies (30 days for debug logs, 180 days for errors)
     - Use log levels appropriately (ERROR for critical, WARN for recoverable)
     - Monitor logging system performance metrics

### Prompt Sequencing Logic

**Prompt 1: Error Handling Infrastructure**
- Establishes foundation with typed error classes and utilities
- Must complete first as all subsequent prompts depend on error types
- Low complexity, high impact
- Estimated: 12-16 hours

**Prompt 2: API Error Management & Retry Logic**
- Implements retry wrapper for Claude API and database operations
- Depends on Prompt 1 for error types
- Medium complexity, critical for reliability
- Estimated: 16-20 hours

**Prompt 3: UI Error Boundaries & User Feedback**
- Protects React components and implements toast notifications
- Depends on Prompt 1 for error classification
- Medium complexity, high user visibility
- Estimated: 12-16 hours

**Prompt 4: Data Recovery & Resume Capabilities**
- Implements batch job resume, draft auto-save, and recovery wizard
- Depends on Prompts 1 and 2
- Highest complexity, most business value
- Estimated: 24-30 hours

**Prompt 5: Error Monitoring & Logging System**
- Centralizes error aggregation with search and analysis tools
- Can develop in parallel with Prompts 2-4
- Medium complexity, operational value
- Estimated: 16-20 hours

**Total Estimated Time: 80-102 hours implementation + 10-15 hours testing/refinement = 90-117 hours**

### Quality Assurance Approach

**Error Scenario Testing:**
- Simulate Claude API rate limits and verify backoff behavior
- Force database connection failures and verify transaction rollback
- Trigger React errors and verify error boundary fallback UI
- Interrupt batch generation mid-process and verify resume capability
- Test network offline scenarios and verify graceful degradation

**Integration Testing:**
- End-to-end error handling across API → Service → UI layers
- Recovery workflow: failure → error display → user action → recovery → success
- Multi-user scenarios: concurrent errors don't interfere
- Performance under error load: system remains responsive during high error rates

**User Acceptance Testing:**
- Non-technical users can understand error messages
- Recovery options are clearly presented and actionable
- System state remains consistent after recovery actions
- No data loss occurs during any failure scenario

---

## Database Setup Instructions

### Required SQL Operations

Execute the following SQL in Supabase SQL Editor before implementation:

========================

```sql
-- E10: Error Handling & Recovery Database Schema Extensions
-- Version: 1.0
-- Date: 2025-01-29

-- ============================================================================
-- 1. ERROR LOGS TABLE
-- ============================================================================
-- Centralized logging for application and UI errors

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Error classification
  error_type VARCHAR(50) NOT NULL, -- 'api', 'database', 'ui', 'network', 'validation', 'generation'
  error_code VARCHAR(100), -- HTTP status code or custom error code
  error_message TEXT NOT NULL,
  error_stack TEXT, -- Full stack trace for debugging
  
  -- Context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  request_id VARCHAR(255), -- For correlating related errors
  
  -- Location
  component_name VARCHAR(255), -- React component or API route
  file_path VARCHAR(500),
  line_number INTEGER,
  
  -- Request details
  http_method VARCHAR(10),
  endpoint VARCHAR(500),
  request_payload JSONB,
  response_payload JSONB,
  
  -- Metadata
  severity VARCHAR(20) NOT NULL DEFAULT 'error', -- 'debug', 'info', 'warn', 'error', 'critical'
  environment VARCHAR(20) DEFAULT 'production', -- 'development', 'staging', 'production'
  user_agent TEXT,
  ip_address INET,
  
  -- Recovery info
  is_recoverable BOOLEAN DEFAULT false,
  recovery_attempted BOOLEAN DEFAULT false,
  recovery_successful BOOLEAN,
  recovery_details JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for efficient querying
CREATE INDEX idx_error_logs_type_severity ON error_logs(error_type, severity);
CREATE INDEX idx_error_logs_user_created ON error_logs(user_id, created_at DESC);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_request_id ON error_logs(request_id) WHERE request_id IS NOT NULL;
CREATE INDEX idx_error_logs_unresolved ON error_logs(created_at DESC) WHERE resolved_at IS NULL;

-- ============================================================================
-- 2. RECOVERY CHECKPOINTS TABLE
-- ============================================================================
-- Store checkpoints for resuming failed batch operations

CREATE TABLE IF NOT EXISTS recovery_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Operation identification
  operation_type VARCHAR(100) NOT NULL, -- 'batch_generation', 'bulk_approve', 'bulk_export', etc.
  operation_id UUID NOT NULL, -- References batch_job or operation-specific ID
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Progress tracking
  total_items INTEGER NOT NULL,
  completed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  skipped_items INTEGER NOT NULL DEFAULT 0,
  
  -- State snapshot
  checkpoint_data JSONB NOT NULL, -- Serialized state for resume
  last_processed_id VARCHAR(255), -- ID of last successfully processed item
  pending_item_ids JSONB, -- Array of remaining item IDs
  
  -- Configuration
  operation_config JSONB, -- Original operation parameters for resume
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'paused', 'failed', 'completed', 'resumed'
  
  -- Error tracking
  last_error TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ -- Auto-cleanup after expiration
);

-- Indexes
CREATE INDEX idx_recovery_checkpoints_operation ON recovery_checkpoints(operation_type, operation_id);
CREATE INDEX idx_recovery_checkpoints_user_status ON recovery_checkpoints(user_id, status);
CREATE INDEX idx_recovery_checkpoints_expires ON recovery_checkpoints(expires_at) WHERE expires_at IS NOT NULL;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recovery_checkpoint_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recovery_checkpoint_timestamp
BEFORE UPDATE ON recovery_checkpoints
FOR EACH ROW
EXECUTE FUNCTION update_recovery_checkpoint_timestamp();

-- ============================================================================
-- 3. CONVERSATION DRAFTS TABLE
-- ============================================================================
-- Auto-save incomplete conversations during generation

CREATE TABLE IF NOT EXISTS conversation_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Linking
  conversation_id VARCHAR(255) NOT NULL, -- Temporary ID during generation
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Generation parameters
  template_id UUID,
  chunk_id UUID,
  generation_params JSONB NOT NULL, -- Persona, emotion, topic, etc.
  
  -- Partial content
  draft_content JSONB, -- Partial conversation turns generated so far
  turn_count INTEGER DEFAULT 0,
  
  -- Progress
  generation_status VARCHAR(50) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'paused', 'error', 'completed'
  progress_percentage INTEGER DEFAULT 0,
  
  -- Metadata
  api_request_id VARCHAR(255), -- For correlating with API logs
  last_api_response JSONB,
  error_message TEXT,
  
  -- Auto-save tracking
  save_count INTEGER NOT NULL DEFAULT 0,
  last_saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours' -- Auto-cleanup
);

-- Indexes
CREATE UNIQUE INDEX idx_conversation_drafts_conversation_id ON conversation_drafts(conversation_id);
CREATE INDEX idx_conversation_drafts_user_status ON conversation_drafts(user_id, generation_status);
CREATE INDEX idx_conversation_drafts_expires ON conversation_drafts(expires_at);

-- Auto-update updated_at timestamp
CREATE TRIGGER trigger_update_conversation_draft_timestamp
BEFORE UPDATE ON conversation_drafts
FOR EACH ROW
EXECUTE FUNCTION update_recovery_checkpoint_timestamp(); -- Reuse function

-- ============================================================================
-- 4. EXTEND CONVERSATIONS TABLE FOR ERROR TRACKING
-- ============================================================================

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS last_error TEXT,
ADD COLUMN IF NOT EXISTS error_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_recovering BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recovery_attempts INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_conversation_id UUID; -- For retry/regenerate tracking

-- Index for error tracking
CREATE INDEX IF NOT EXISTS idx_conversations_error_tracking 
ON conversations(error_count, last_error_at DESC) 
WHERE error_count > 0;

-- ============================================================================
-- 5. CLEANUP POLICIES
-- ============================================================================

-- Auto-delete expired recovery checkpoints (7 days old)
CREATE OR REPLACE FUNCTION cleanup_expired_recovery_checkpoints()
RETURNS void AS $$
BEGIN
  DELETE FROM recovery_checkpoints
  WHERE expires_at < NOW() - INTERVAL '7 days'
  OR (status = 'completed' AND completed_at < NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Auto-delete expired conversation drafts (24 hours + 7 days grace period)
CREATE OR REPLACE FUNCTION cleanup_expired_conversation_drafts()
RETURNS void AS $$
BEGIN
  DELETE FROM conversation_drafts
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Auto-delete old error logs (180 days retention for errors, 30 days for warnings)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM error_logs
  WHERE (severity IN ('error', 'critical') AND created_at < NOW() - INTERVAL '180 days')
  OR (severity IN ('warn', 'info', 'debug') AND created_at < NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_drafts ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own data
CREATE POLICY error_logs_user_policy ON error_logs
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY recovery_checkpoints_user_policy ON recovery_checkpoints
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY conversation_drafts_user_policy ON conversation_drafts
  FOR ALL USING (auth.uid() = user_id);

-- Admin policy (requires custom auth.is_admin() function - optional)
-- CREATE POLICY error_logs_admin_policy ON error_logs
--   FOR ALL USING (auth.is_admin() = true);

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to log errors from application code
CREATE OR REPLACE FUNCTION log_application_error(
  p_error_type VARCHAR,
  p_error_code VARCHAR,
  p_error_message TEXT,
  p_error_stack TEXT,
  p_user_id UUID,
  p_component_name VARCHAR,
  p_severity VARCHAR,
  p_request_payload JSONB DEFAULT NULL,
  p_is_recoverable BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_error_id UUID;
BEGIN
  INSERT INTO error_logs (
    error_type, error_code, error_message, error_stack,
    user_id, component_name, severity, request_payload, is_recoverable
  )
  VALUES (
    p_error_type, p_error_code, p_error_message, p_error_stack,
    p_user_id, p_component_name, p_severity, p_request_payload, p_is_recoverable
  )
  RETURNING id INTO v_error_id;
  
  RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create/update recovery checkpoint
CREATE OR REPLACE FUNCTION save_recovery_checkpoint(
  p_operation_type VARCHAR,
  p_operation_id UUID,
  p_user_id UUID,
  p_total_items INTEGER,
  p_completed_items INTEGER,
  p_checkpoint_data JSONB,
  p_operation_config JSONB
)
RETURNS UUID AS $$
DECLARE
  v_checkpoint_id UUID;
BEGIN
  INSERT INTO recovery_checkpoints (
    operation_type, operation_id, user_id, total_items, completed_items,
    checkpoint_data, operation_config, expires_at
  )
  VALUES (
    p_operation_type, p_operation_id, p_user_id, p_total_items, p_completed_items,
    p_checkpoint_data, p_operation_config, NOW() + INTERVAL '7 days'
  )
  ON CONFLICT (operation_type, operation_id) DO UPDATE
  SET 
    completed_items = EXCLUDED.completed_items,
    checkpoint_data = EXCLUDED.checkpoint_data,
    updated_at = NOW()
  RETURNING id INTO v_checkpoint_id;
  
  RETURN v_checkpoint_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('error_logs', 'recovery_checkpoints', 'conversation_drafts');

-- Verify indexes created
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('error_logs', 'recovery_checkpoints', 'conversation_drafts');

-- Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('error_logs', 'recovery_checkpoints', 'conversation_drafts');

```

++++++++++++++++++

**Post-Execution Verification:**
1. Run verification queries at end of SQL script
2. Confirm all 3 new tables exist with correct columns
3. Verify indexes created (should see 10+ indexes)
4. Confirm RLS enabled on all tables
5. Test helper functions with sample data
6. Verify cleanup functions execute without errors

---

## Implementation Prompts

### Prompt 1: Error Handling Infrastructure & Typed Error Classes
**Scope**: Create foundational error handling utilities, typed error classes, and centralized error management  
**Dependencies**: Database schema (above SQL) must be executed first  
**Estimated Time**: 12-16 hours  
**Risk Level**: Low

========================

You are a senior full-stack developer implementing comprehensive error handling infrastructure for the Interactive LoRA Conversation Generation platform. This foundation will be used by all subsequent error handling implementations.

**CONTEXT AND REQUIREMENTS:**

The application currently has basic try-catch error handling but lacks:
- Typed error classes for consistent error handling across the codebase
- Centralized error management and logging
- Error classification system (temporary vs permanent, recoverable vs non-recoverable)
- Structured error responses with actionable user messaging
- Error history tracking for debugging

Your task is to build a robust error handling infrastructure that enables:
1. Type-safe error handling throughout the application
2. Consistent error logging with appropriate detail levels
3. Automatic error classification and routing
4. Actionable error messages for end users
5. Comprehensive error tracking for debugging

**CURRENT CODEBASE STATE:**

**Existing Pattern** (`src/app/api/chunks/generate-dimensions/route.ts` lines 50-60):
```typescript
try {
  // API logic
} catch (error) {
  console.error('Error generating dimensions:', error);
  return NextResponse.json(
    { error: 'Failed to generate dimensions' },
    { status: 500 }
  );
}
```

**Problem**: Generic error handling provides no context, classification, or recovery guidance.

**Existing Services**:
- `src/lib/database.ts`: Database operations with basic error catching
- `src/lib/ai-config.ts`: Claude API configuration
- `train-wireframe/src/stores/useAppStore.ts`: State management with loading states

**IMPLEMENTATION TASKS:**

### Task 1: Create Typed Error Classes (3-4 hours)

Create `src/lib/errors/error-types.ts`:

```typescript
/**
 * Base error class for all application errors
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly severity: ErrorSeverity;
  abstract readonly isRecoverable: boolean;
  readonly timestamp: Date;
  readonly context?: Record<string, any>;

  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  abstract toJSON(): ErrorResponse;
  abstract getUserMessage(): string;
}

export type ErrorSeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface ErrorResponse {
  code: string;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  isRecoverable: boolean;
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
}

/**
 * API-related errors (network, timeouts, rate limits)
 */
export class APIError extends AppError {
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly isRecoverable: boolean;
  readonly statusCode?: number;
  readonly endpoint?: string;

  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string,
    context?: Record<string, any>
  ) {
    super(message, context);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    
    // Auto-classify based on status code
    if (statusCode === 429) {
      this.code = 'RATE_LIMIT_EXCEEDED';
      this.severity = 'warn';
      this.isRecoverable = true;
    } else if (statusCode && statusCode >= 500) {
      this.code = 'API_SERVER_ERROR';
      this.severity = 'error';
      this.isRecoverable = true;
    } else if (statusCode && statusCode >= 400) {
      this.code = 'API_CLIENT_ERROR';
      this.severity = 'error';
      this.isRecoverable = false;
    } else {
      this.code = 'API_ERROR';
      this.severity = 'error';
      this.isRecoverable = true;
    }
  }

  getUserMessage(): string {
    if (this.statusCode === 429) {
      return 'Too many requests. The system will automatically retry in a moment.';
    } else if (this.statusCode && this.statusCode >= 500) {
      return 'The service is temporarily unavailable. Please try again in a few moments.';
    } else if (this.statusCode === 401 || this.statusCode === 403) {
      return 'Authentication required. Please log in and try again.';
    }
    return 'An error occurred while communicating with the service. Please try again.';
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.getUserMessage(),
      severity: this.severity,
      isRecoverable: this.isRecoverable,
      timestamp: this.timestamp.toISOString(),
      context: {
        ...this.context,
        statusCode: this.statusCode,
        endpoint: this.endpoint
      },
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

/**
 * Database-related errors
 */
export class DatabaseError extends AppError {
  readonly code: string;
  readonly severity: ErrorSeverity = 'error';
  readonly isRecoverable: boolean;
  readonly operation?: string;
  readonly table?: string;

  constructor(
    message: string,
    operation?: string,
    table?: string,
    context?: Record<string, any>
  ) {
    super(message, context);
    this.operation = operation;
    this.table = table;
    
    // Classify based on error message patterns
    if (message.includes('unique constraint') || message.includes('duplicate')) {
      this.code = 'DATABASE_DUPLICATE';
      this.isRecoverable = false;
    } else if (message.includes('foreign key')) {
      this.code = 'DATABASE_CONSTRAINT_VIOLATION';
      this.isRecoverable = false;
    } else if (message.includes('timeout') || message.includes('connection')) {
      this.code = 'DATABASE_CONNECTION_ERROR';
      this.isRecoverable = true;
    } else {
      this.code = 'DATABASE_ERROR';
      this.isRecoverable = true;
    }
  }

  getUserMessage(): string {
    if (this.code === 'DATABASE_DUPLICATE') {
      return 'This record already exists. Please use a different identifier.';
    } else if (this.code === 'DATABASE_CONSTRAINT_VIOLATION') {
      return 'This operation violates data integrity rules. Please check your input.';
    } else if (this.code === 'DATABASE_CONNECTION_ERROR') {
      return 'Database connection issue. The system will retry automatically.';
    }
    return 'A database error occurred. Please try again or contact support if the issue persists.';
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.getUserMessage(),
      severity: this.severity,
      isRecoverable: this.isRecoverable,
      timestamp: this.timestamp.toISOString(),
      context: {
        ...this.context,
        operation: this.operation,
        table: this.table
      },
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

/**
 * Generation-specific errors (AI/Claude API)
 */
export class GenerationError extends AppError {
  readonly code: string;
  readonly severity: ErrorSeverity = 'error';
  readonly isRecoverable: boolean = true;
  readonly conversationId?: string;
  readonly templateId?: string;

  constructor(
    message: string,
    conversationId?: string,
    templateId?: string,
    context?: Record<string, any>
  ) {
    super(message, context);
    this.conversationId = conversationId;
    this.templateId = templateId;
    
    if (message.includes('timeout')) {
      this.code = 'GENERATION_TIMEOUT';
    } else if (message.includes('parse') || message.includes('invalid response')) {
      this.code = 'GENERATION_INVALID_RESPONSE';
    } else if (message.includes('quality')) {
      this.code = 'GENERATION_QUALITY_FAILURE';
    } else {
      this.code = 'GENERATION_ERROR';
    }
  }

  getUserMessage(): string {
    if (this.code === 'GENERATION_TIMEOUT') {
      return 'Generation took too long. Please try again or use a simpler template.';
    } else if (this.code === 'GENERATION_INVALID_RESPONSE') {
      return 'Generated content was invalid. The system will retry with different parameters.';
    } else if (this.code === 'GENERATION_QUALITY_FAILURE') {
      return 'Generated conversation did not meet quality standards. Please regenerate.';
    }
    return 'Conversation generation failed. Please try again.';
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.getUserMessage(),
      severity: this.severity,
      isRecoverable: this.isRecoverable,
      timestamp: this.timestamp.toISOString(),
      context: {
        ...this.context,
        conversationId: this.conversationId,
        templateId: this.templateId
      },
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

/**
 * Validation errors (user input, configuration)
 */
export class ValidationError extends AppError {
  readonly code: string = 'VALIDATION_ERROR';
  readonly severity: ErrorSeverity = 'warn';
  readonly isRecoverable: boolean = false;
  readonly field?: string;
  readonly validationErrors?: Record<string, string>;

  constructor(
    message: string,
    field?: string,
    validationErrors?: Record<string, string>,
    context?: Record<string, any>
  ) {
    super(message, context);
    this.field = field;
    this.validationErrors = validationErrors;
  }

  getUserMessage(): string {
    if (this.field) {
      return `Invalid input for ${this.field}: ${this.message}`;
    }
    return `Validation failed: ${this.message}`;
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.getUserMessage(),
      severity: this.severity,
      isRecoverable: this.isRecoverable,
      timestamp: this.timestamp.toISOString(),
      context: {
        ...this.context,
        field: this.field,
        validationErrors: this.validationErrors
      },
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

/**
 * UI/Component errors (React errors, rendering issues)
 */
export class UIError extends AppError {
  readonly code: string = 'UI_ERROR';
  readonly severity: ErrorSeverity = 'error';
  readonly isRecoverable: boolean = true;
  readonly componentName?: string;

  constructor(
    message: string,
    componentName?: string,
    context?: Record<string, any>
  ) {
    super(message, context);
    this.componentName = componentName;
  }

  getUserMessage(): string {
    return 'An interface error occurred. Please refresh the page or try again.';
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.getUserMessage(),
      severity: this.severity,
      isRecoverable: this.isRecoverable,
      timestamp: this.timestamp.toISOString(),
      context: {
        ...this.context,
        componentName: this.componentName
      },
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

/**
 * Network errors (offline, connectivity issues)
 */
export class NetworkError extends AppError {
  readonly code: string = 'NETWORK_ERROR';
  readonly severity: ErrorSeverity = 'warn';
  readonly isRecoverable: boolean = true;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }

  getUserMessage(): string {
    return 'Network connection issue. Please check your internet connection and try again.';
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.getUserMessage(),
      severity: this.severity,
      isRecoverable: this.isRecoverable,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}
```

**Implementation Checklist**:
- [ ] Create `src/lib/errors/` directory
- [ ] Implement all error classes with proper inheritance
- [ ] Add JSDoc documentation for each class
- [ ] Ensure TypeScript strict mode compliance
- [ ] Test error serialization with `toJSON()`
- [ ] Verify user messages are non-technical and actionable

### Task 2: Create Error Management Service (4-5 hours)

Create `src/lib/errors/error-manager.ts`:

```typescript
import { AppError, ErrorResponse, ErrorSeverity } from './error-types';
import { createClient } from '@/lib/supabase';

/**
 * Centralized error management service
 */
export class ErrorManager {
  private static instance: ErrorManager;
  private errorHistory: AppError[] = [];
  private readonly maxHistorySize = 100;

  private constructor() {}

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  /**
   * Handle error with logging and optional user notification
   */
  async handleError(
    error: Error | AppError,
    componentName?: string,
    userId?: string
  ): Promise<ErrorResponse> {
    // Convert to AppError if needed
    const appError = this.normalizeError(error, componentName);

    // Add to history
    this.addToHistory(appError);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${appError.severity.toUpperCase()}] ${appError.code}:`, {
        message: appError.message,
        context: appError.context,
        stack: appError.stack
      });
    }

    // Log to database
    try {
      await this.logToDatabase(appError, userId);
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }

    // Return error response
    return appError.toJSON();
  }

  /**
   * Convert any error to AppError
   */
  private normalizeError(error: Error | AppError, componentName?: string): AppError {
    if (error instanceof AppError) {
      return error;
    }

    // Convert standard Error to UIError
    const { UIError } = require('./error-types');
    return new UIError(error.message, componentName, {
      originalError: error.name,
      stack: error.stack
    });
  }

  /**
   * Log error to database
   */
  private async logToDatabase(error: AppError, userId?: string): Promise<void> {
    const supabase = createClient();
    
    const { error: dbError } = await supabase
      .from('error_logs')
      .insert({
        error_type: this.getErrorType(error),
        error_code: error.code,
        error_message: error.message,
        error_stack: error.stack,
        user_id: userId || null,
        component_name: this.getComponentName(error),
        severity: error.severity,
        is_recoverable: error.isRecoverable,
        request_payload: error.context || null,
        environment: process.env.NODE_ENV || 'production'
      });

    if (dbError) {
      console.error('Database logging failed:', dbError);
    }
  }

  /**
   * Get error type for database classification
   */
  private getErrorType(error: AppError): string {
    const errorClass = error.constructor.name;
    return errorClass.replace('Error', '').toLowerCase();
  }

  /**
   * Extract component name from error context
   */
  private getComponentName(error: AppError): string | null {
    if ('componentName' in error && error.componentName) {
      return error.componentName as string;
    }
    if (error.context && error.context.component) {
      return error.context.component as string;
    }
    return null;
  }

  /**
   * Add error to in-memory history
   */
  private addToHistory(error: AppError): void {
    this.errorHistory.unshift(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop();
    }
  }

  /**
   * Get recent errors from history
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorHistory.slice(0, count);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errorHistory.filter(e => e.severity === severity);
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byType: Record<string, number>;
    recoverable: number;
    nonRecoverable: number;
  } {
    const stats = {
      total: this.errorHistory.length,
      bySeverity: {} as Record<ErrorSeverity, number>,
      byType: {} as Record<string, number>,
      recoverable: 0,
      nonRecoverable: 0
    };

    this.errorHistory.forEach(error => {
      // Count by severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;

      // Count by type
      const type = error.constructor.name;
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Count recoverability
      if (error.isRecoverable) {
        stats.recoverable++;
      } else {
        stats.nonRecoverable++;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const errorManager = ErrorManager.getInstance();

/**
 * Convenience function for error handling
 */
export async function handleError(
  error: Error | AppError,
  componentName?: string,
  userId?: string
): Promise<ErrorResponse> {
  return errorManager.handleError(error, componentName, userId);
}
```

**Implementation Checklist**:
- [ ] Implement singleton pattern correctly
- [ ] Add error history with size limits
- [ ] Implement database logging with error handling
- [ ] Add error statistics calculation
- [ ] Test with various error types
- [ ] Verify database insert performance (<100ms)

### Task 3: Create Error Utility Functions (2-3 hours)

Create `src/lib/errors/error-utils.ts`:

```typescript
import { AppError, APIError, DatabaseError, GenerationError, ValidationError, NetworkError, UIError } from './error-types';

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard for specific error types
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

export function isGenerationError(error: unknown): error is GenerationError {
  return error instanceof GenerationError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isUIError(error: unknown): error is UIError {
  return error instanceof UIError;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isRecoverable;
  }
  return false;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.getUserMessage();
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Extract error code from various error types
 */
export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  if (error instanceof Error) {
    return error.name;
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Parse fetch errors into typed errors
 */
export function parseFetchError(error: unknown, endpoint?: string): AppError {
  if (error instanceof TypeError) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return new NetworkError('Network request failed', { endpoint });
    }
  }
  
  if (error instanceof Error) {
    return new APIError(error.message, undefined, endpoint, {
      originalError: error.name
    });
  }

  return new APIError('Request failed', undefined, endpoint);
}

/**
 * Parse response errors
 */
export async function parseResponseError(response: Response, endpoint?: string): Promise<AppError> {
  let errorMessage = `Request failed with status ${response.status}`;
  
  try {
    const errorData = await response.json();
    if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.error) {
      errorMessage = errorData.error;
    }
  } catch {
    // Failed to parse error response, use status text
    errorMessage = response.statusText || errorMessage;
  }

  return new APIError(errorMessage, response.status, endpoint);
}

/**
 * Parse database errors from Supabase
 */
export function parseDatabaseError(error: any, operation?: string, table?: string): DatabaseError {
  let message = 'Database operation failed';
  
  if (error.message) {
    message = error.message;
  } else if (error.details) {
    message = error.details;
  } else if (error.hint) {
    message = error.hint;
  }

  return new DatabaseError(message, operation, table, {
    code: error.code,
    details: error.details,
    hint: error.hint
  });
}

/**
 * Retry helper with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 32000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if non-recoverable
      if (isAppError(error) && !error.isRecoverable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
      const delay = exponentialDelay + jitter;

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Sanitize error for logging (remove sensitive data)
 */
export function sanitizeError(error: AppError): AppError {
  const sanitized = { ...error };
  
  // Remove sensitive context fields
  if (sanitized.context) {
    const { password, token, apiKey, secret, ...safeContext } = sanitized.context;
    sanitized.context = safeContext;
  }

  // Remove full stack trace in production
  if (process.env.NODE_ENV === 'production') {
    delete sanitized.stack;
  }

  return sanitized;
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: unknown): {
  title: string;
  message: string;
  action?: string;
} {
  if (isAppError(error)) {
    return {
      title: error.code.split('_').map(word => 
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' '),
      message: error.getUserMessage(),
      action: error.isRecoverable ? 'Retry' : 'Contact Support'
    };
  }

  return {
    title: 'Error',
    message: getErrorMessage(error),
    action: 'Retry'
  };
}
```

**Implementation Checklist**:
- [ ] Implement all type guards
- [ ] Add error parsing functions for fetch, Response, Supabase
- [ ] Implement retry logic with exponential backoff and jitter
- [ ] Add sanitization function to remove sensitive data
- [ ] Test retry logic with simulated failures
- [ ] Verify error formatting for user display

### Task 4: Extend Zustand Store for Error State (2-3 hours)

Update `train-wireframe/src/stores/useAppStore.ts`:

```typescript
// Add to existing store interface
interface AppStore {
  // ... existing state ...
  
  // Error state
  currentError: ErrorResponse | null;
  errorHistory: ErrorResponse[];
  showErrorDialog: boolean;
  
  // Error actions
  setError: (error: ErrorResponse) => void;
  clearError: () => void;
  clearErrorHistory: () => void;
  showError: (error: ErrorResponse) => void;
  hideError: () => void;
  getErrorStats: () => {
    totalErrors: number;
    criticalErrors: number;
    recoverableErrors: number;
  };
}

// Add to store implementation
export const useAppStore = create<AppStore>((set, get) => ({
  // ... existing state ...
  
  // Error state
  currentError: null,
  errorHistory: [],
  showErrorDialog: false,
  
  // Error actions
  setError: (error) => set((state) => ({
    currentError: error,
    errorHistory: [error, ...state.errorHistory].slice(0, 50) // Keep last 50
  })),
  
  clearError: () => set({ currentError: null }),
  
  clearErrorHistory: () => set({ errorHistory: [], currentError: null }),
  
  showError: (error) => set({
    currentError: error,
    showErrorDialog: true,
    errorHistory: [error, ...get().errorHistory].slice(0, 50)
  }),
  
  hideError: () => set({
    showErrorDialog: false
  }),
  
  getErrorStats: () => {
    const history = get().errorHistory;
    return {
      totalErrors: history.length,
      criticalErrors: history.filter(e => e.severity === 'critical' || e.severity === 'error').length,
      recoverableErrors: history.filter(e => e.isRecoverable).length
    };
  }
}));
```

**Implementation Checklist**:
- [ ] Add error state fields to store interface
- [ ] Implement error action methods
- [ ] Add error history management (limit to 50)
- [ ] Implement error statistics calculation
- [ ] Test state updates with multiple errors
- [ ] Verify TypeScript types are correct

**ACCEPTANCE CRITERIA:**

1. **Typed Error Classes**:
   - [ ] All 6 error types implemented (API, Database, Generation, Validation, UI, Network)
   - [ ] Each error class has proper inheritance from AppError
   - [ ] Error classification logic works correctly (tested with 10+ scenarios)
   - [ ] User messages are non-technical and actionable
   - [ ] toJSON() serialization includes all required fields

2. **Error Manager**:
   - [ ] Singleton pattern implemented correctly
   - [ ] Database logging succeeds within 100ms
   - [ ] Error history limited to 100 most recent errors
   - [ ] Statistics calculation works for all error types
   - [ ] No errors are lost during logging failures (fallback to console)

3. **Error Utilities**:
   - [ ] All type guards return correct boolean values
   - [ ] Retry logic implements exponential backoff with jitter
   - [ ] Non-recoverable errors don't trigger retries
   - [ ] Error sanitization removes sensitive fields (password, token, apiKey)
   - [ ] Error formatting produces user-friendly titles and messages

4. **State Management**:
   - [ ] Error state persists in Zustand store
   - [ ] Error history maintains chronological order
   - [ ] Error dialog can be shown/hidden programmatically
   - [ ] Error statistics calculated correctly from history
   - [ ] TypeScript compilation passes with strict mode

5. **Integration**:
   - [ ] Error types can be imported throughout codebase
   - [ ] Error manager accessible via singleton
   - [ ] Utility functions work with all error types
   - [ ] Store actions can be called from any component

**TECHNICAL SPECIFICATIONS:**

**File Structure**:
```
src/lib/errors/
├── error-types.ts (500-600 lines)
├── error-manager.ts (250-300 lines)
├── error-utils.ts (300-350 lines)
└── index.ts (exports)
```

**TypeScript Configuration**:
- Strict mode enabled
- No implicit any
- Strict null checks
- No unused variables

**Performance Requirements**:
- Error creation: <1ms
- Error logging to database: <100ms
- Error serialization: <5ms
- State updates: <10ms

**VALIDATION REQUIREMENTS:**

1. **Unit Tests** (create `src/lib/errors/__tests__/`):
   - Test each error class constructor and methods
   - Test error manager singleton and logging
   - Test retry logic with simulated failures
   - Test sanitization with sensitive data
   - Achieve 90% code coverage

2. **Integration Tests**:
   - Throw various errors and verify logging
   - Test error state updates in Zustand store
   - Verify database inserts to error_logs table
   - Test retry behavior with real API calls

3. **Manual Testing**:
   - Trigger each error type from UI
   - Verify user messages are appropriate
   - Check error dialog displays correctly
   - Confirm error history populates

**DELIVERABLES:**

1. `src/lib/errors/error-types.ts` - All typed error classes
2. `src/lib/errors/error-manager.ts` - Centralized error management
3. `src/lib/errors/error-utils.ts` - Helper functions and type guards
4. `src/lib/errors/index.ts` - Barrel export file
5. Updated `train-wireframe/src/stores/useAppStore.ts` - Error state management
6. `src/lib/errors/__tests__/` - Unit test files (optional but recommended)

Implement this infrastructure completely, ensuring all error types, utilities, and state management are production-ready. This foundation will be used by all subsequent error handling implementations.

++++++++++++++++++

---

### Prompt 2: API Error Management & Automatic Retry Logic
**Scope**: Implement retry wrappers for Claude API and database operations with rate limit handling  
**Dependencies**: Prompt 1 (Error Infrastructure) must be complete  
**Estimated Time**: 16-20 hours  
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing comprehensive API error management with automatic retry logic for the Interactive LoRA Conversation Generation platform. This system will handle transient failures gracefully and ensure reliable communication with external services.

**CONTEXT AND REQUIREMENTS:**

The application currently makes API calls to:
1. Claude AI API for conversation generation
2. Supabase database for data persistence
3. Internal API routes for various operations

Current problems:
- No retry logic for transient failures (network issues, rate limits, temporary server errors)
- Rate limit errors (429) cause complete failures instead of automatic recovery
- Database connection timeouts result in data loss
- No circuit breaker pattern to prevent cascading failures
- Unclear error messages when API calls fail

Your task is to implement:
1. Retry wrapper with exponential backoff for Claude API calls
2. Database operation retry with transaction rollback on failure
3. Rate limit detection and automatic backoff
4. Circuit breaker pattern to prevent overwhelming failing services
5. Comprehensive error logging for all API operations

**CURRENT CODEBASE STATE:**

**Existing Claude API Integration** (`src/lib/dimension-generation/generator.ts` lines 100-150):
```typescript
// Current implementation (no retry logic)
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4000,
  temperature: 0.5,
  messages: [{ role: 'user', content: prompt }]
});
```

**Existing Database Operations** (`src/lib/database.ts`):
```typescript
// Current implementation (no retry logic)
export async function createDocument(data: Partial<Document>) {
  const { data: document, error } = await supabase
    .from('documents')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return document;
}
```

**Existing AI Config** (`src/lib/ai-config.ts`):
```typescript
export const AI_CONFIG = {
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.5,
  max_tokens: 4000
};
```

**IMPLEMENTATION TASKS:**

### Task 1: Create Retry Wrapper Service (6-8 hours)

Create `src/lib/retry/retry-service.ts`:

```typescript
import { isRecoverableError, APIError } from '@/lib/errors';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  exponentialBase: number;
  jitterFactor: number; // 0-1 for randomization
  retryableStatusCodes: number[];
  retryableErrorCodes: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 32000,
  exponentialBase: 2,
  jitterFactor: 0.3,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrorCodes: ['RATE_LIMIT_EXCEEDED', 'API_SERVER_ERROR', 'NETWORK_ERROR', 'DATABASE_CONNECTION_ERROR']
};

export interface RetryContext {
  attemptNumber: number;
  lastError?: Error;
  totalDelay: number;
  startTime: Date;
}

export type RetryCallback = (context: RetryContext) => void;

export class RetryService {
  private config: RetryConfig;
  private activeRetries: Map<string, RetryContext> = new Map();

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    options?: {
      requestId?: string;
      onRetry?: RetryCallback;
      config?: Partial<RetryConfig>;
    }
  ): Promise<T> {
    const config = { ...this.config, ...(options?.config || {}) };
    const requestId = options?.requestId || this.generateRequestId();
    const context: RetryContext = {
      attemptNumber: 0,
      totalDelay: 0,
      startTime: new Date()
    };

    this.activeRetries.set(requestId, context);

    try {
      return await this.executeWithRetry(fn, config, context, options?.onRetry);
    } finally {
      this.activeRetries.delete(requestId);
    }
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig,
    context: RetryContext,
    onRetry?: RetryCallback
  ): Promise<T> {
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      context.attemptNumber = attempt + 1;

      try {
        return await fn();
      } catch (error) {
        context.lastError = error as Error;

        // Check if we should retry
        if (!this.shouldRetry(error, attempt, config)) {
          throw error;
        }

        // Last attempt - don't wait, just throw
        if (attempt === config.maxRetries) {
          throw new APIError(
            `Operation failed after ${config.maxRetries + 1} attempts: ${(error as Error).message}`,
            undefined,
            undefined,
            { attempts: config.maxRetries + 1, lastError: (error as Error).message }
          );
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt, config);
        context.totalDelay += delay;

        // Call retry callback if provided
        if (onRetry) {
          onRetry(context);
        }

        console.log(`Retry attempt ${attempt + 1}/${config.maxRetries + 1} after ${delay}ms delay`);

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw context.lastError!;
  }

  /**
   * Determine if error is retryable
   */
  private shouldRetry(error: unknown, attempt: number, config: RetryConfig): boolean {
    // Don't retry if max attempts reached
    if (attempt >= config.maxRetries) {
      return false;
    }

    // Check if it's a known recoverable error
    if (isRecoverableError(error)) {
      return true;
    }

    // Check if it's an API error with retryable status code
    if (error instanceof APIError) {
      if (error.statusCode && config.retryableStatusCodes.includes(error.statusCode)) {
        return true;
      }
      if (config.retryableErrorCodes.includes(error.code)) {
        return true;
      }
    }

    // Check for specific error patterns
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('econnreset') ||
        message.includes('econnrefused')
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    // Exponential backoff
    const exponentialDelay = config.baseDelay * Math.pow(config.exponentialBase, attempt);
    
    // Cap at max delay
    const cappedDelay = Math.min(exponentialDelay, config.maxDelay);
    
    // Add jitter (randomization)
    const jitter = Math.random() * config.jitterFactor * cappedDelay;
    
    return Math.round(cappedDelay + jitter);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active retry contexts
   */
  getActiveRetries(): Map<string, RetryContext> {
    return new Map(this.activeRetries);
  }

  /**
   * Get retry statistics
   */
  getRetryStats(): {
    activeCount: number;
    contexts: RetryContext[];
  } {
    return {
      activeCount: this.activeRetries.size,
      contexts: Array.from(this.activeRetries.values())
    };
  }
}

// Export singleton instance
export const retryService = new RetryService();

/**
 * Convenience function for executing with retry
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options?: {
    requestId?: string;
    onRetry?: RetryCallback;
    config?: Partial<RetryConfig>;
  }
): Promise<T> {
  return retryService.execute(fn, options);
}
```

**Implementation Checklist**:
- [ ] Implement exponential backoff with jitter calculation
- [ ] Add retry decision logic based on error types
- [ ] Track active retries with context
- [ ] Implement retry callbacks for progress tracking
- [ ] Add request ID generation for correlation
- [ ] Test retry logic with simulated failures

### Task 2: Create Circuit Breaker Pattern (4-5 hours)

Create `src/lib/retry/circuit-breaker.ts`:

```typescript
import { APIError } from '@/lib/errors';

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, rejecting requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // Milliseconds to wait before half-open
  monitoringWindow: number; // Milliseconds to track failures
}

export const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
  monitoringWindow: 120000 // 2 minutes
};

interface FailureRecord {
  timestamp: Date;
  error: Error;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: FailureRecord[] = [];
  private successes: number = 0;
  private nextAttemptTime: Date | null = null;
  private config: CircuitBreakerConfig;
  private readonly serviceName: string;

  constructor(serviceName: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.serviceName = serviceName;
    this.config = { ...DEFAULT_CIRCUIT_CONFIG, ...config };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionToHalfOpen();
      } else {
        throw new APIError(
          `Circuit breaker is OPEN for ${this.serviceName}. Service is temporarily unavailable.`,
          503,
          this.serviceName,
          {
            state: this.state,
            nextAttemptTime: this.nextAttemptTime,
            recentFailures: this.failures.length
          }
        );
      }
    }

    // Execute function
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  /**
   * Record successful execution
   */
  private onSuccess(): void {
    this.clearOldFailures();

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      console.log(`Circuit breaker ${this.serviceName}: Success ${this.successes}/${this.config.successThreshold}`);
      
      if (this.successes >= this.config.successThreshold) {
        this.transitionToClosed();
      }
    }
  }

  /**
   * Record failed execution
   */
  private onFailure(error: Error): void {
    this.failures.push({
      timestamp: new Date(),
      error
    });

    this.clearOldFailures();

    console.error(`Circuit breaker ${this.serviceName}: Failure recorded (${this.failures.length}/${this.config.failureThreshold})`);

    // Check if we should open circuit
    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open state opens circuit
      this.transitionToOpen();
    } else if (this.state === CircuitState.CLOSED) {
      if (this.failures.length >= this.config.failureThreshold) {
        this.transitionToOpen();
      }
    }
  }

  /**
   * Transition to CLOSED state (normal operation)
   */
  private transitionToClosed(): void {
    console.log(`Circuit breaker ${this.serviceName}: Transitioning to CLOSED`);
    this.state = CircuitState.CLOSED;
    this.failures = [];
    this.successes = 0;
    this.nextAttemptTime = null;
  }

  /**
   * Transition to OPEN state (rejecting requests)
   */
  private transitionToOpen(): void {
    console.error(`Circuit breaker ${this.serviceName}: Transitioning to OPEN`);
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = new Date(Date.now() + this.config.timeout);
    this.successes = 0;
  }

  /**
   * Transition to HALF_OPEN state (testing recovery)
   */
  private transitionToHalfOpen(): void {
    console.log(`Circuit breaker ${this.serviceName}: Transitioning to HALF_OPEN`);
    this.state = CircuitState.HALF_OPEN;
    this.successes = 0;
  }

  /**
   * Check if enough time has passed to attempt reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.nextAttemptTime) {
      return false;
    }
    return Date.now() >= this.nextAttemptTime.getTime();
  }

  /**
   * Remove failures outside monitoring window
   */
  private clearOldFailures(): void {
    const cutoff = Date.now() - this.config.monitoringWindow;
    this.failures = this.failures.filter(f => f.timestamp.getTime() > cutoff);
  }

  /**
   * Get current circuit breaker status
   */
  getStatus(): {
    state: CircuitState;
    failures: number;
    successes: number;
    nextAttemptTime: Date | null;
  } {
    return {
      state: this.state,
      failures: this.failures.length,
      successes: this.successes,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  /**
   * Force circuit to specific state (for testing)
   */
  forceState(state: CircuitState): void {
    this.state = state;
    if (state === CircuitState.CLOSED) {
      this.failures = [];
      this.successes = 0;
      this.nextAttemptTime = null;
    }
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.transitionToClosed();
  }
}

/**
 * Circuit breaker registry for managing multiple services
 */
export class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  getBreaker(serviceName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, new CircuitBreaker(serviceName, config));
    }
    return this.breakers.get(serviceName)!;
  }

  getAllStatuses(): Record<string, ReturnType<CircuitBreaker['getStatus']>> {
    const statuses: Record<string, ReturnType<CircuitBreaker['getStatus']>> = {};
    this.breakers.forEach((breaker, name) => {
      statuses[name] = breaker.getStatus();
    });
    return statuses;
  }

  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset());
  }
}

// Export singleton registry
export const circuitBreakerRegistry = new CircuitBreakerRegistry();
```

**Implementation Checklist**:
- [ ] Implement three-state circuit breaker (CLOSED, OPEN, HALF_OPEN)
- [ ] Add failure threshold detection
- [ ] Implement automatic reset timeout
- [ ] Add monitoring window for failure tracking
- [ ] Create registry for managing multiple services
- [ ] Test state transitions with simulated failures

### Task 3: Wrap Claude API with Retry Logic (3-4 hours)

Create `src/lib/api/claude-api-wrapper.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { retryService } from '@/lib/retry/retry-service';
import { circuitBreakerRegistry } from '@/lib/retry/circuit-breaker';
import { APIError, GenerationError } from '@/lib/errors';
import { errorManager } from '@/lib/errors/error-manager';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export interface ClaudeRequestOptions {
  model: string;
  max_tokens: number;
  temperature: number;
  messages: Anthropic.MessageParam[];
  system?: string;
}

export interface ClaudeResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  stopReason: string;
  model: string;
}

/**
 * Wrapper for Claude API with retry logic and circuit breaker
 */
export class ClaudeAPIWrapper {
  private circuitBreaker = circuitBreakerRegistry.getBreaker('claude-api', {
    failureThreshold: 5,
    timeout: 60000
  });

  /**
   * Generate content with Claude API
   */
  async generateContent(
    options: ClaudeRequestOptions,
    context?: {
      requestId?: string;
      conversationId?: string;
      userId?: string;
    }
  ): Promise<ClaudeResponse> {
    const requestId = context?.requestId || `claude_${Date.now()}`;

    return this.circuitBreaker.execute(async () => {
      return retryService.execute(
        async () => {
          try {
            const response = await anthropic.messages.create({
              model: options.model,
              max_tokens: options.max_tokens,
              temperature: options.temperature,
              messages: options.messages,
              system: options.system
            });

            // Parse response
            const content = response.content
              .filter(block => block.type === 'text')
              .map(block => (block as Anthropic.TextBlock).text)
              .join('\n');

            return {
              content,
              usage: {
                input_tokens: response.usage.input_tokens,
                output_tokens: response.usage.output_tokens
              },
              stopReason: response.stop_reason || 'unknown',
              model: response.model
            };
          } catch (error) {
            // Transform error to typed error
            const apiError = this.parseClaudeError(error, context?.conversationId);
            
            // Log error
            await errorManager.handleError(apiError, 'ClaudeAPIWrapper', context?.userId);
            
            throw apiError;
          }
        },
        {
          requestId,
          config: {
            maxRetries: 3,
            retryableStatusCodes: [429, 500, 502, 503, 504]
          },
          onRetry: (retryContext) => {
            console.log(`Retrying Claude API request (attempt ${retryContext.attemptNumber})`);
          }
        }
      );
    });
  }

  /**
   * Parse Claude API errors into typed errors
   */
  private parseClaudeError(error: unknown, conversationId?: string): APIError | GenerationError {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return new APIError(
          'Rate limit exceeded. Please wait before retrying.',
          429,
          'claude-api',
          { conversationId }
        );
      } else if (error.status && error.status >= 500) {
        return new APIError(
          `Claude API server error: ${error.message}`,
          error.status,
          'claude-api',
          { conversationId }
        );
      } else {
        return new GenerationError(
          `Claude API error: ${error.message}`,
          conversationId,
          undefined,
          { statusCode: error.status }
        );
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return new GenerationError(
          'Claude API request timed out',
          conversationId
        );
      }
      return new GenerationError(
        error.message,
        conversationId
      );
    }

    return new GenerationError(
      'Unknown Claude API error',
      conversationId
    );
  }

  /**
   * Get circuit breaker status
   */
  getStatus() {
    return this.circuitBreaker.getStatus();
  }
}

// Export singleton instance
export const claudeAPI = new ClaudeAPIWrapper();
```

**Implementation Checklist**:
- [ ] Wrap Claude API calls with retry service
- [ ] Integrate circuit breaker for protection
- [ ] Parse Claude API errors into typed errors
- [ ] Add usage tracking (tokens)
- [ ] Implement retry callbacks for progress
- [ ] Test with simulated rate limits

### Task 4: Wrap Database Operations with Retry (3-4 hours)

Update `src/lib/database.ts`:

```typescript
import { createClient } from '@/lib/supabase';
import { retryService } from '@/lib/retry/retry-service';
import { circuitBreakerRegistry } from '@/lib/retry/circuit-breaker';
import { DatabaseError } from '@/lib/errors';
import { errorManager } from '@/lib/errors/error-manager';

const circuitBreaker = circuitBreakerRegistry.getBreaker('supabase-database', {
  failureThreshold: 10,
  timeout: 30000
});

/**
 * Execute database operation with retry logic
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  tableName?: string
): Promise<T> {
  return circuitBreaker.execute(async () => {
    return retryService.execute(
      async () => {
        try {
          return await operation();
        } catch (error) {
          const dbError = new DatabaseError(
            (error as Error).message,
            operationName,
            tableName
          );
          await errorManager.handleError(dbError, 'DatabaseService');
          throw dbError;
        }
      },
      {
        config: {
          maxRetries: 2,
          baseDelay: 500,
          retryableErrorCodes: ['DATABASE_CONNECTION_ERROR', 'DATABASE_ERROR']
        }
      }
    );
  });
}

/**
 * Create document with retry
 */
export async function createDocument(data: Partial<Document>) {
  return executeWithRetry(
    async () => {
      const supabase = createClient();
      const { data: document, error } = await supabase
        .from('documents')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return document;
    },
    'create',
    'documents'
  );
}

/**
 * Update document with retry
 */
export async function updateDocument(id: string, data: Partial<Document>) {
  return executeWithRetry(
    async () => {
      const supabase = createClient();
      const { data: document, error } = await supabase
        .from('documents')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return document;
    },
    'update',
    'documents'
  );
}

/**
 * Delete document with retry
 */
export async function deleteDocument(id: string) {
  return executeWithRetry(
    async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    'delete',
    'documents'
  );
}

/**
 * Get documents with retry
 */
export async function getDocuments(filters?: Record<string, any>) {
  return executeWithRetry(
    async () => {
      const supabase = createClient();
      let query = supabase.from('documents').select('*');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    'select',
    'documents'
  );
}
```

**Implementation Checklist**:
- [ ] Wrap all database CRUD operations with retry
- [ ] Add circuit breaker for database connections
- [ ] Parse Supabase errors into typed DatabaseError
- [ ] Configure retry parameters for database operations
- [ ] Test with simulated connection failures
- [ ] Verify transaction rollback on error

**ACCEPTANCE CRITERIA:**

1. **Retry Service**:
   - [ ] Exponential backoff calculated correctly with jitter
   - [ ] Retry decision logic classifies errors correctly
   - [ ] Max retries respected (no infinite loops)
   - [ ] Non-recoverable errors don't trigger retries
   - [ ] Retry callbacks invoked at correct times
   - [ ] Active retry tracking works across concurrent requests

2. **Circuit Breaker**:
   - [ ] Three states (CLOSED, OPEN, HALF_OPEN) transition correctly
   - [ ] Failure threshold opens circuit after N failures
   - [ ] Circuit auto-resets after timeout period
   - [ ] Half-open state requires success threshold to close
   - [ ] Circuit status accessible for monitoring
   - [ ] Multiple service circuits managed independently

3. **Claude API Wrapper**:
   - [ ] Retry logic integrated correctly
   - [ ] Circuit breaker protects against cascading failures
   - [ ] Rate limit errors (429) trigger automatic backoff
   - [ ] Server errors (5xx) are retried
   - [ ] Client errors (4xx) are not retried
   - [ ] Usage tracking captures token counts
   - [ ] All errors logged to database

4. **Database Operations**:
   - [ ] All CRUD operations wrapped with retry
   - [ ] Connection timeouts trigger retry
   - [ ] Constraint violations don't trigger retry
   - [ ] Circuit breaker prevents overwhelming database
   - [ ] Transaction rollback works on failure
   - [ ] Query performance maintained (<100ms additional overhead)

5. **Integration**:
   - [ ] Retry service and circuit breaker work together
   - [ ] Error manager receives all failures
   - [ ] Error logging doesn't fail on database issues
   - [ ] Multiple concurrent operations don't interfere
   - [ ] Performance acceptable (<50ms overhead per retry)

**TECHNICAL SPECIFICATIONS:**

**Retry Configuration Defaults**:
- Max retries: 3
- Base delay: 1000ms
- Max delay: 32000ms
- Jitter factor: 0.3 (30%)
- Retryable status codes: [408, 429, 500, 502, 503, 504]

**Circuit Breaker Configuration**:
- Claude API: 5 failures, 60s timeout
- Database: 10 failures, 30s timeout
- Monitoring window: 2 minutes

**Performance Requirements**:
- Retry decision: <5ms
- Circuit state check: <1ms
- Retry overhead: <50ms per attempt
- No memory leaks from active retry tracking

**VALIDATION REQUIREMENTS:**

1. **Unit Tests**:
   - Test retry logic with simulated failures
   - Test circuit breaker state transitions
   - Test exponential backoff calculation
   - Test error classification
   - Achieve 85% code coverage

2. **Integration Tests**:
   - Test Claude API with real rate limits
   - Test database with connection interruptions
   - Test circuit breaker with cascading failures
   - Verify error logging works end-to-end

3. **Load Testing**:
   - Test 100 concurrent requests with retry
   - Verify circuit breaker prevents overwhelming services
   - Monitor memory usage with active retries
   - Confirm no deadlocks or race conditions

**DELIVERABLES:**

1. `src/lib/retry/retry-service.ts` - Retry logic with exponential backoff
2. `src/lib/retry/circuit-breaker.ts` - Circuit breaker pattern implementation
3. `src/lib/api/claude-api-wrapper.ts` - Claude API with retry/circuit breaker
4. Updated `src/lib/database.ts` - Database operations with retry
5. `src/lib/retry/__tests__/` - Unit tests (optional but recommended)

Implement comprehensive API error management ensuring all external service calls are protected with retry logic and circuit breakers. This will dramatically improve system reliability.

++++++++++++++++++

---

### Prompt 3: UI Error Boundaries & User Feedback System
**Scope**: Implement React error boundaries and comprehensive user feedback (toasts, dialogs, fallback UI)  
**Dependencies**: Prompt 1 (Error Infrastructure) must be complete  
**Estimated Time**: 12-16 hours  
**Risk Level**: Medium

For full implementation details of Prompt 3, create error boundary components, notification system, error dialog, and integrate with layout. See FR10.1.1 for complete specifications.

**Key Deliverables**:
- ErrorBoundary component with app/route/component levels
- Error notification system using Sonner
- Error dialog with detailed information
- Fallback UI components
- Integration with Zustand store and layout

---

### Prompt 4: Data Recovery & Resume Capabilities
**Scope**: Implement batch job resume, conversation draft auto-save, and recovery wizard  
**Dependencies**: Prompts 1 and 2 must be complete  
**Estimated Time**: 24-30 hours  
**Risk Level**: High

For full implementation details of Prompt 4, create checkpoint service, draft auto-save, resume logic, and recovery wizard. See FR10.1.2 for complete specifications.

**Key Deliverables**:
- Checkpoint service for batch operations
- Draft auto-save every 5 seconds
- Resume logic for interrupted jobs
- Transaction rollback utilities
- Recovery wizard UI
- Orphan detection and cleanup

---

### Prompt 5: Error Monitoring & Centralized Logging
**Scope**: Implement error aggregation dashboard, search interface, and analytics  
**Dependencies**: Prompt 1 must be complete  
**Estimated Time**: 16-20 hours  
**Risk Level**: Low

For full implementation details of Prompt 5, create error log service, dashboard UI, table with search, and analytics. See operational excellence requirements.

**Key Deliverables**:
- Error log service with queries
- Dashboard with statistics cards
- Error log table with search/filter
- Error detail view
- Export functionality
- Critical error alerting

---

## Quality Validation Checklist

### Post-Implementation Verification

#### Error Handling Infrastructure (Prompt 1)
- [ ] All 6 error types created and tested
- [ ] Error manager logs to database successfully  
- [ ] Error history maintains 100-item limit
- [ ] Type guards return correct booleans
- [ ] Retry logic implements exponential backoff
- [ ] Sanitization removes sensitive data

#### API Error Management (Prompt 2)
- [ ] Retry service handles max retry limit
- [ ] Circuit breaker transitions between states
- [ ] Claude API wrapper retries on 429 and 5xx
- [ ] Database operations use retry wrapper
- [ ] Performance overhead <50ms per retry

#### UI Error Handling (Prompt 3)
- [ ] App-level error boundary catches all errors
- [ ] Error notifications display with correct severity
- [ ] Error dialog shows all details
- [ ] Fallback UI maintains functionality
- [ ] No white screen of death

#### Data Recovery (Prompt 4)
- [ ] Checkpoints save every 5 items
- [ ] Resume picks up from last checkpoint
- [ ] Drafts auto-save every 5 seconds
- [ ] No data loss on browser close
- [ ] Recovery wizard guides users

#### Error Monitoring (Prompt 5)
- [ ] Dashboard displays accurate statistics
- [ ] Error log table supports filtering
- [ ] Query performance <500ms with 10K+ logs
- [ ] Export generates complete CSV
- [ ] Critical error alerts trigger

### Cross-Prompt Consistency
- [ ] All error types use consistent classification
- [ ] Error messages are non-technical and actionable
- [ ] Retry logic consistent across API calls
- [ ] Logging captures all required fields
- [ ] TypeScript types align across modules
- [ ] Performance requirements met

### Integration Testing
- [ ] End-to-end error flow: generation → failure → retry → success
- [ ] Recovery flow: batch start → interrupt → resume → complete
- [ ] Circuit breaker flow: failures → open → timeout → close
- [ ] Error logging to dashboard pipeline works

### Performance Validation
- [ ] Error creation: <1ms
- [ ] Error logging: <100ms
- [ ] Retry decision: <5ms
- [ ] Checkpoint save: <200ms
- [ ] Error log query: <500ms
- [ ] No memory leaks

### User Acceptance Testing
- [ ] Users understand error messages
- [ ] Recovery options clearly presented
- [ ] System state remains consistent
- [ ] Progress never lost unexpectedly
- [ ] Error feedback within 2 seconds

### Security & Compliance
- [ ] Error logs don't contain passwords/API keys
- [ ] Sensitive data sanitized
- [ ] RLS policies prevent cross-user access
- [ ] Stack traces hidden in production
- [ ] Audit trail complete
- [ ] 180-day retention enforced

---

## Next Segment Preparation

**Information needed for E11 (Performance & Optimization)**:
- Error handling performance metrics
- Database query optimization needs
- Retry overhead measurements
- Circuit breaker impact on latency
- Bottleneck identification from error logs

**Dependencies for Future Segments**:
- E11 may optimize error logging for high-throughput
- E12 (Testing) will create error test suites
- E13 (Documentation) will document error patterns
- E14 (Deployment) will configure production monitoring

---

**Document Status:** Complete  
**Total Prompts:** 5  
**Implementation Time:** 80-100 hours (2-2.5 weeks)  
**Review Required:** Technical Lead, QA Engineer


