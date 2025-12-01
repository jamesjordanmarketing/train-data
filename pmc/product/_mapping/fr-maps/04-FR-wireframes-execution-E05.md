# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E05)

**Generated**: 2025-10-29  
**Segment**: E05 - Export System Implementation  
**Total Prompts**: 6  
**Estimated Implementation Time**: 60-80 hours  
**Task Inventory Source**: `04-train-FR-wireframes-E05-output.md`  
**Functional Requirements**: FR5.1.1, FR5.1.2, FR5.2.1, FR5.2.2

---

## Executive Summary

The E05 segment implements the complete Export System for the Interactive LoRA Conversation Generation Module, enabling users to export training conversation data in multiple formats (JSONL, JSON, CSV, Markdown) with flexible filtering, background processing for large datasets, and complete audit trails for compliance.

This segment is **strategically critical** because:

1. **Completes the Pipeline**: Export is the final step connecting conversation generation to LoRA training workflows
2. **Format Flexibility**: Multi-format support enables integration with diverse training platforms (OpenAI, Anthropic, custom pipelines)
3. **Quality Control**: Export filtering ensures only approved, high-quality conversations enter training data
4. **Compliance**: Complete audit trail satisfies data governance and AI ethics requirements
5. **Scalability**: Background processing and file cleanup ensure system handles enterprise-scale datasets

**Key Deliverables:**
- Export database schema with audit logging
- Four format transformers (JSONL, JSON, CSV, Markdown)
- Export API endpoints with filtering and pagination
- Enhanced Export Modal UI with preview capability
- Background job processing for large exports
- Monitoring metrics and automated file cleanup

---

## Context and Dependencies

### Previous Segment Deliverables

**Prior segments (E01-E04) have established:**

1. **Database Foundation**:
   - Conversations table with status, quality_score, tier fields
   - Conversation_turns table with normalized turn storage
   - Review workflow with approval/rejection tracking
   - Supabase Row Level Security (RLS) for multi-tenant isolation
   - Reference: `src/lib/database.ts`

2. **UI Infrastructure**:
   - Dashboard layout with sidebar navigation
   - ConversationTable with filtering and sorting
   - FilterBar with multi-dimensional filters
   - Batch selection and bulk actions
   - Modal components (Dialog, Sheet) from Shadcn/UI
   - Reference: `train-wireframe/src/components/`

3. **State Management**:
   - Zustand store pattern for client state
   - Filter configuration state (FilterConfig type)
   - Selected conversation IDs tracking
   - Modal visibility management
   - Reference: `train-wireframe/src/stores/useAppStore.ts`

4. **Type System**:
   - Conversation type with all metadata fields
   - FilterConfig type for query construction
   - ExportConfig type (partially defined) needs completion
   - QualityMetrics type for score details
   - Reference: `train-wireframe/src/lib/types.ts`

5. **API Patterns**:
   - Next.js 14 App Router API routes
   - Supabase client integration
   - Error handling with try-catch
   - Response formatting with JSON
   - Reference: `src/app/api/chunks/generate-dimensions/route.ts`

**What E05 Builds Upon:**
- Extends database schema with export_logs table
- Leverages existing FilterConfig for export filtering
- Enhances existing ExportModal.tsx wireframe component
- Integrates with conversation query patterns from dashboard
- Follows established API route and service layer patterns

### Current Codebase State

**Existing Components to Integrate With:**

1. **`train-wireframe/src/components/dashboard/ExportModal.tsx`**:
   - Currently a wireframe/stub component
   - Provides basic modal structure
   - Needs full implementation of scope selector, format selector, options panel, preview

2. **`train-wireframe/src/lib/types.ts`** (Lines 205-214):
   ```typescript
   export type ExportConfig = {
     scope: 'selected' | 'filtered' | 'all';
     format: 'json' | 'jsonl' | 'csv' | 'markdown';
     includeMetadata: boolean;
     includeQualityScores: boolean;
     includeTimestamps: boolean;
     includeApprovalHistory: boolean;
     includeParentReferences: boolean;
     includeFullContent: boolean;
   };
   ```
   - Type already defined, ready to use

3. **`train-wireframe/src/components/dashboard/FilterBar.tsx`**:
   - Existing filter UI patterns to replicate for export scope
   - Badge display for filter chips
   - Multi-select dropdown patterns
   - Reference lines 45-75 for filter state management

4. **`src/lib/database.ts`**:
   - Database service pattern to extend
   - Query construction with filters
   - Error handling patterns
   - Reference lines 1-50 for service structure

5. **`src/lib/api-response-log-service.ts`**:
   - Logging service pattern to replicate for export audit
   - CRUD operations on audit tables
   - TypeScript interfaces for log entries

**Codebase Patterns to Follow:**
- Service layer abstraction for database operations
- TypeScript strict mode with explicit types
- Error handling with try-catch and user-friendly messages
- Component composition (small, focused components)
- Shadcn/UI components for consistent styling
- Zustand for client state, Supabase for server state

### Cross-Segment Dependencies

**Dependencies on Prior Work:**
1. **Conversation Data Model** (E01-E02): Export system queries conversations table
2. **Filtering System** (E03): Export reuses FilterConfig for scope definition
3. **Quality Scoring** (E03): Export includes quality metrics in metadata
4. **Review Workflow** (E04): Export respects approval status (status='approved')
5. **Authentication** (E01): Export logs track user_id for compliance

**External System Dependencies:**
1. **Supabase PostgreSQL**: Database for export_logs table
2. **Supabase Storage** (optional): File storage for large exports (alternative: temporary /tmp)
3. **Node.js Streams**: For streaming large file generation
4. **csv-stringify**: For CSV format transformation
5. **Next.js API Routes**: Serverless functions for export endpoints

**No Blocking Dependencies**: E05 can be implemented fully once E01-E04 are complete.

---

## Implementation Strategy

### Risk Assessment

#### High-Risk Areas

**Risk 1: Memory Limits with Large Exports**
- **Problem**: Exporting 1000+ conversations may exceed serverless function memory limits (256MB-1GB)
- **Mitigation**: 
  - Use Node.js streams (ReadStream, WriteStream) throughout pipeline
  - Fetch conversations in batches (100 at a time) vs loading all into memory
  - Implement streaming response for download endpoint
  - Set threshold: <500 = synchronous, ≥500 = background job

**Risk 2: File Storage Costs**
- **Problem**: Storing large export files temporarily may incur significant storage costs
- **Mitigation**:
  - Use ephemeral /tmp directory in serverless functions when possible
  - Set aggressive cleanup schedule (24 hour expiration for completed exports)
  - Monitor storage usage with metrics
  - Implement file compression for large datasets

**Risk 3: CSV Escaping Edge Cases**
- **Problem**: Conversation content may contain quotes, newlines, commas causing CSV malformation
- **Mitigation**:
  - Use battle-tested csv-stringify library (not manual string concatenation)
  - Test with conversations containing special characters
  - Add UTF-8 BOM for Excel compatibility
  - Validate CSV output can import into Excel and Google Sheets

#### Medium-Risk Areas

**Risk 4: Export Format Incompatibility**
- **Problem**: Generated JSONL may not match OpenAI/Anthropic training format specifications
- **Mitigation**:
  - Reference official OpenAI/Anthropic format documentation
  - Add format validation tests comparing output to specification
  - Include schema version in export header
  - Provide format examples in UI help text

**Risk 5: Audit Trail Completeness**
- **Problem**: Export operations may not be fully logged, causing compliance gaps
- **Mitigation**:
  - Make export log creation atomic with export generation
  - Use database transactions for log writes
  - Add unique export_id (UUID) for traceability
  - Include filter state serialization for reproducibility

### Prompt Sequencing Logic

**Sequence Rationale:**

**Prompt 1: Database Foundation**
- **Why First**: All other components depend on export_logs table schema
- **Scope**: Migration, service layer, type definitions
- **Output**: Working database schema with CRUD operations

**Prompt 2: Transformation Engine Core**
- **Why Second**: Business logic foundation for all export formats
- **Scope**: IExportTransformer interface, JSONL and JSON transformers
- **Output**: Working JSONL and JSON export generation

**Prompt 3: Additional Format Transformers**
- **Why Third**: CSV and Markdown are lower priority but needed for completeness
- **Scope**: CSV transformer with escaping, Markdown transformer for human review
- **Output**: All four format transformers complete

**Prompt 4: API Endpoints**
- **Why Fourth**: Backend integration connecting transformers to HTTP interface
- **Scope**: POST /api/export/conversations, GET status, GET download, GET history
- **Output**: Working API layer with filtering and pagination

**Prompt 5: UI Components**
- **Why Fifth**: User-facing interface depending on API availability
- **Scope**: ExportModal enhancement, scope selector, format selector, options panel, preview
- **Output**: Complete export modal with all UI elements

**Prompt 6: Operations and Monitoring**
- **Why Last**: Production readiness after core features complete
- **Scope**: Export metrics collection, file cleanup jobs, monitoring dashboards
- **Output**: Production-ready export system with observability

**Independence Strategy**: Each prompt is self-contained and can be executed in isolation if needed, though sequential execution is optimal.

### Quality Assurance Approach

**Quality Gates Per Prompt:**

1. **Functional Acceptance Criteria**: Each prompt includes explicit acceptance criteria from FR5.x mapped to implementation tasks
2. **Manual Testing**: Step-by-step validation procedures included in each prompt
3. **Edge Case Testing**: Special characters, large datasets, empty results, error conditions
4. **Integration Testing**: Verify integration with existing dashboard, filters, and API patterns
5. **Performance Validation**: Ensure exports complete within acceptable timeframes (<5s for 100, <30s for 500)

**Cross-Prompt Quality Checks:**

- **Type Safety**: All TypeScript types must match across service layer, API, and UI
- **Error Handling**: Consistent error messages and user-friendly error states
- **Accessibility**: Export modal must support keyboard navigation (Tab, Enter, Esc)
- **Responsive Design**: Export UI must work on 1366x768 and 1920x1080 displays
- **Audit Trail**: Every export must create log entry with user_id and timestamp

**Testing Strategy:**

- **Unit Tests** (Optional): Individual transformer functions with mock data
- **Integration Tests** (Required): API endpoints with test database
- **Manual Tests** (Required): Complete export workflow from UI through download
- **Edge Case Tests** (Required): Special characters, large datasets (100, 500, 1000 conversations), empty filters

---

## Database Setup Instructions

### Required SQL Operations

**Execute these SQL statements using the SAOL library BEFORE implementing prompts.**

This migration creates the `export_logs` table for audit trail and the `IExportTransformer` interface pattern.

========================

```sql
-- Migration: Create Export Logs Table
-- Date: 2025-10-29
-- Purpose: Track all export operations for audit trail and compliance

-- Create export_logs table
CREATE TABLE IF NOT EXISTS export_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  export_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  format TEXT NOT NULL CHECK (format IN ('json', 'jsonl', 'csv', 'markdown')),
  config JSONB NOT NULL,
  conversation_count INTEGER NOT NULL,
  file_size BIGINT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'expired')),
  file_url TEXT,
  expires_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_export_logs_user_id ON export_logs(user_id);
CREATE INDEX idx_export_logs_timestamp ON export_logs(timestamp DESC);
CREATE INDEX idx_export_logs_status ON export_logs(status);
CREATE INDEX idx_export_logs_format ON export_logs(format);
CREATE INDEX idx_export_logs_expires_at ON export_logs(expires_at) WHERE status = 'completed';

-- Add foreign key constraint (if auth.users table exists)
ALTER TABLE export_logs 
  ADD CONSTRAINT fk_export_logs_user 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own export logs
CREATE POLICY "Users can view own export logs"
  ON export_logs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own export logs
CREATE POLICY "Users can create own export logs"
  ON export_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own export logs
CREATE POLICY "Users can update own export logs"
  ON export_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE export_logs IS 'Audit trail for all export operations with user attribution and filter state';
COMMENT ON COLUMN export_logs.config IS 'JSONB storing ExportConfig: scope, format, includeMetadata, etc.';
COMMENT ON COLUMN export_logs.status IS 'Export lifecycle: queued → processing → completed/failed/expired';

-- Verify table created successfully
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'export_logs'
ORDER BY ordinal_position;
```

**Validation Steps:**
1. Run the migration in Supabase SQL Editor
2. Verify table created: `SELECT * FROM export_logs LIMIT 1;`
3. Verify indexes created: `SELECT indexname FROM pg_indexes WHERE tablename = 'export_logs';`
4. Verify RLS enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'export_logs';`
5. Test RLS policy by inserting a test row and verifying only that user can see it

++++++++++++++++++

---

## Implementation Prompts

### Prompt 1: Database Foundation and Export Service Layer

**Scope**: Create export_logs table migration (verification only, already executed above), implement ExportService class with CRUD operations, define TypeScript types  
**Dependencies**: Supabase database, auth.users table, existing `src/lib/database.ts` pattern  
**Estimated Time**: 6-8 hours  
**Risk Level**: Low

========================

You are a senior full-stack developer implementing the Database Foundation and Export Service Layer for the Interactive LoRA Conversation Generation Module Export System.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This module enables business users to generate high-quality training conversations for LoRA fine-tuning. The Export System (E05) is the final stage in the pipeline, transforming approved conversations into training-ready data formats. This prompt establishes the database and service layer foundation that all export operations will build upon.

**Functional Requirements Being Implemented:**
- **FR5.2.2**: Export Audit Trail - Track all export operations for compliance and auditing
- **FR1.2.3**: Export Audit Logging - Maintain complete history of data exports with user attribution

**Acceptance Criteria** (from FR5.2.2):
- Export log records: timestamp, user, format, filter criteria, conversation count, file size
- Export history view with sortable columns
- Filter export history by date range, user, format
- Download previous export files (if retained)
- Export log CSV for compliance reporting

**Technical Architecture:**
- Next.js 14 App Router with TypeScript
- Supabase PostgreSQL database with Row Level Security (RLS)
- Service layer pattern abstracting database operations
- Zustand for client state management
- Strict TypeScript mode enabled

**CURRENT CODEBASE STATE:**

**Existing Pattern - Database Service** (`src/lib/database.ts`):
```typescript
// Existing pattern to replicate
export class DatabaseService {
  constructor(private supabase: SupabaseClient) {}
  
  async getDocuments(filters?: any) {
    try {
      let query = this.supabase.from('documents').select('*');
      if (filters) {
        // Apply filters
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }
}
```

**Existing Pattern - API Response Log Service** (`src/lib/api-response-log-service.ts`):
```typescript
// Reference this pattern for export logs service
export interface ApiResponseLog {
  id: string;
  created_at: string;
  // ... other fields
}

export class ApiResponseLogService {
  constructor(private supabase: SupabaseClient) {}
  
  async createLog(logData: Partial<ApiResponseLog>) {
    // Insert log
  }
  
  async getLogs(filters?: any) {
    // Query logs
  }
}
```

**Existing Types** (`train-wireframe/src/lib/types.ts`):
```typescript
// Lines 205-214
export type ExportConfig = {
  scope: 'selected' | 'filtered' | 'all';
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  includeMetadata: boolean;
  includeQualityScores: boolean;
  includeTimestamps: boolean;
  includeApprovalHistory: boolean;
  includeParentReferences: boolean;
  includeFullContent: boolean;
};
```

**IMPLEMENTATION TASKS:**

**Task T-1.1.1: Create Export Logs Table Migration (VERIFICATION ONLY)**

The migration SQL has already been executed above in "Database Setup Instructions". Your task is to VERIFY it was created correctly:
**Use the SAOL library to confirm this information BEFORE implementing prompts.**
1. Check table exists with correct columns:
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'export_logs' 
   ORDER BY ordinal_position;
   ```

2. Verify indexes created:
   ```sql
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'export_logs';
   ```

3. Verify RLS policies:
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'export_logs';
   ```

4. Document verification results in a comment block at the top of the service file

**Task T-1.1.2: Implement Export Service Layer**

Create `src/lib/export-service.ts` with the following structure:

**Step 1**: Define TypeScript Interfaces

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

// ExportLog type matching database schema
export interface ExportLog {
  id: string;
  export_id: string;
  user_id: string;
  timestamp: string; // ISO timestamp
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  config: ExportConfig; // Import from types.ts
  conversation_count: number;
  file_size: number | null; // bytes
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  file_url: string | null;
  expires_at: string | null; // ISO timestamp
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Input type for creating export log (Partial with required fields)
export interface CreateExportLogInput {
  user_id: string;
  format: ExportLog['format'];
  config: ExportConfig;
  conversation_count: number;
  status?: ExportLog['status']; // Default 'queued'
}

// Input type for updating export log
export interface UpdateExportLogInput {
  status?: ExportLog['status'];
  file_size?: number;
  file_url?: string;
  expires_at?: string;
  error_message?: string;
}

// Custom error classes
export class ExportNotFoundError extends Error {
  constructor(export_id: string) {
    super(`Export not found: ${export_id}`);
    this.name = 'ExportNotFoundError';
  }
}

export class ExportPermissionError extends Error {
  constructor(export_id: string) {
    super(`Permission denied for export: ${export_id}`);
    this.name = 'ExportPermissionError';
  }
}
```

**Step 2**: Implement ExportService Class

```typescript
export class ExportService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create a new export log entry
   * @param input Export log data
   * @returns Created export log with generated export_id
   */
  async createExportLog(input: CreateExportLogInput): Promise<ExportLog> {
    try {
      const logData: Partial<ExportLog> = {
        export_id: crypto.randomUUID(), // Generate unique export_id
        user_id: input.user_id,
        format: input.format,
        config: input.config,
        conversation_count: input.conversation_count,
        status: input.status || 'queued',
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('export_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        console.error('Error creating export log:', error);
        throw new Error(`Failed to create export log: ${error.message}`);
      }

      return data as ExportLog;
    } catch (error) {
      console.error('Export service error:', error);
      throw error;
    }
  }

  /**
   * Get export log by export_id
   * @param export_id Unique export identifier
   * @returns Export log or null if not found
   */
  async getExportLog(export_id: string): Promise<ExportLog | null> {
    try {
      const { data, error } = await this.supabase
        .from('export_logs')
        .select('*')
        .eq('export_id', export_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data as ExportLog;
    } catch (error) {
      console.error('Error fetching export log:', error);
      throw error;
    }
  }

  /**
   * List export logs for a user with optional filters
   * @param user_id User identifier
   * @param filters Optional filters (format, status, date range)
   * @param pagination Page number and limit
   * @returns Array of export logs and total count
   */
  async listExportLogs(
    user_id: string,
    filters?: {
      format?: ExportLog['format'];
      status?: ExportLog['status'];
      dateFrom?: string;
      dateTo?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ logs: ExportLog[]; total: number }> {
    try {
      // Build query
      let query = this.supabase
        .from('export_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', user_id)
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters?.format) {
        query = query.eq('format', filters.format);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('timestamp', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('timestamp', filters.dateTo);
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 25;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        logs: (data || []) as ExportLog[],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error listing export logs:', error);
      throw error;
    }
  }

  /**
   * Update export log status and metadata
   * @param export_id Export identifier
   * @param updates Fields to update
   * @returns Updated export log
   */
  async updateExportLog(
    export_id: string,
    updates: UpdateExportLogInput
  ): Promise<ExportLog> {
    try {
      const updateData: Partial<ExportLog> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('export_logs')
        .update(updateData)
        .eq('export_id', export_id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ExportNotFoundError(export_id);
        }
        throw error;
      }

      return data as ExportLog;
    } catch (error) {
      console.error('Error updating export log:', error);
      throw error;
    }
  }

  /**
   * Delete export log (admin only, typically not used)
   * @param export_id Export identifier
   */
  async deleteExportLog(export_id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('export_logs')
        .delete()
        .eq('export_id', export_id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting export log:', error);
      throw error;
    }
  }

  /**
   * Mark expired exports (status: completed, expires_at < now)
   * Used by cleanup job
   */
  async markExpiredExports(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await this.supabase
        .from('export_logs')
        .update({ status: 'expired', updated_at: now })
        .eq('status', 'completed')
        .lt('expires_at', now)
        .select('id');

      if (error) {
        throw error;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error marking expired exports:', error);
      throw error;
    }
  }
}

// Export a singleton instance for convenience
export const createExportService = (supabase: SupabaseClient) => {
  return new ExportService(supabase);
};
```

**Step 3**: Add JSDoc Documentation

Add comprehensive JSDoc comments to all public methods explaining:
- Purpose of the method
- Parameter descriptions with types
- Return value description
- Example usage
- Error conditions

**Step 4**: Update Type Definitions

Add to `train-wireframe/src/lib/types.ts` (if not already present):

```typescript
// Export Log type (around line 215, after ExportConfig)
export interface ExportLog {
  id: string;
  export_id: string;
  user_id: string;
  timestamp: string;
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  config: ExportConfig;
  conversation_count: number;
  file_size: number | null;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  file_url: string | null;
  expires_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
```

**ACCEPTANCE CRITERIA:**

1. **Database Verification**:
   - ✅ Export_logs table exists with all required columns
   - ✅ All indexes created (user_id, timestamp, status, format, expires_at)
   - ✅ Foreign key constraint to auth.users(id) exists
   - ✅ RLS enabled with correct policies (SELECT, INSERT, UPDATE)
   - ✅ Can query: `SELECT * FROM export_logs LIMIT 1;` without error

2. **ExportService Implementation**:
   - ✅ ExportService class created with all CRUD methods
   - ✅ createExportLog() generates unique export_id and creates record
   - ✅ getExportLog() retrieves by export_id, returns null if not found
   - ✅ listExportLogs() supports filtering (format, status, date range) and pagination
   - ✅ updateExportLog() updates status and metadata fields
   - ✅ deleteExportLog() removes record (admin function)
   - ✅ markExpiredExports() bulk updates expired exports
   - ✅ All methods have proper error handling with try-catch
   - ✅ All methods return properly typed results (ExportLog interface)

3. **Type Safety**:
   - ✅ ExportLog interface matches database schema exactly
   - ✅ CreateExportLogInput type enforces required fields
   - ✅ UpdateExportLogInput type allows partial updates
   - ✅ Custom error classes (ExportNotFoundError, ExportPermissionError) defined
   - ✅ TypeScript strict mode passes with no errors

4. **Error Handling**:
   - ✅ Database errors caught and logged
   - ✅ User-friendly error messages returned
   - ✅ ExportNotFoundError thrown when export_id doesn't exist
   - ✅ ExportPermissionError thrown when RLS blocks access
   - ✅ Null returns for legitimate "not found" cases (getExportLog)

5. **Code Quality**:
   - ✅ JSDoc comments on all public methods
   - ✅ Consistent naming conventions (camelCase for methods)
   - ✅ Follows existing service layer pattern from database.ts
   - ✅ No console.log (only console.error for errors)
   - ✅ DRY principle applied (no duplicated query logic)

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- Migration verification: Check Supabase SQL Editor logs
- Service layer: `src/lib/export-service.ts` (new file)
- Type definitions: Update `train-wireframe/src/lib/types.ts` (add ExportLog interface)

**Component Architecture:**
- Service layer: ExportService class with dependency-injected Supabase client
- Error handling: Custom error classes extending Error
- Type safety: Strict TypeScript interfaces matching database schema
- Logging: Console.error for debugging, not user-facing messages

**Data Models:**
```typescript
// Primary Model
ExportLog {
  id: UUID (PK, auto-generated)
  export_id: UUID (unique, generated in app)
  user_id: UUID (FK to auth.users)
  timestamp: timestamptz
  format: enum('json', 'jsonl', 'csv', 'markdown')
  config: JSONB (ExportConfig object)
  conversation_count: integer
  file_size: bigint (nullable)
  status: enum('queued', 'processing', 'completed', 'failed', 'expired')
  file_url: text (nullable)
  expires_at: timestamptz (nullable)
  error_message: text (nullable)
  created_at: timestamptz (default NOW())
  updated_at: timestamptz (default NOW())
}
```

**API Specifications:**
Not applicable for this prompt (service layer only, no HTTP endpoints yet).

**Styling and UI Requirements:**
Not applicable for this prompt (backend service only).

**Error Handling:**
- Database connection errors: Log and throw generic error
- Row not found errors: Return null (getExportLog) or throw ExportNotFoundError (updateExportLog)
- RLS permission errors: Throw ExportPermissionError
- Invalid input: TypeScript will catch at compile time
- Network errors: Let Supabase client handle, log and re-throw

**VALIDATION REQUIREMENTS:**

**Manual Testing Steps:**

1. **Create Export Log Test:**
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   import { createExportService } from './export-service';

   const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
   const exportService = createExportService(supabase);

   // Test create
   const log = await exportService.createExportLog({
     user_id: 'test-user-id',
     format: 'jsonl',
     config: {
       scope: 'filtered',
       format: 'jsonl',
       includeMetadata: true,
       includeQualityScores: true,
       includeTimestamps: true,
       includeApprovalHistory: false,
       includeParentReferences: false,
       includeFullContent: true,
     },
     conversation_count: 42,
   });

   console.log('Created export log:', log.export_id);
   ```

2. **Get Export Log Test:**
   ```typescript
   const retrieved = await exportService.getExportLog(log.export_id);
   console.assert(retrieved?.export_id === log.export_id, 'Export IDs match');
   console.assert(retrieved?.conversation_count === 42, 'Count matches');
   ```

3. **List Export Logs Test:**
   ```typescript
   const { logs, total } = await exportService.listExportLogs('test-user-id', {
     format: 'jsonl',
   }, {
     page: 1,
     limit: 10,
   });

   console.assert(logs.length > 0, 'Logs returned');
   console.assert(total >= logs.length, 'Total count valid');
   ```

4. **Update Export Log Test:**
   ```typescript
   const updated = await exportService.updateExportLog(log.export_id, {
     status: 'completed',
     file_size: 1024000,
     file_url: 'https://storage.example.com/exports/test.jsonl',
     expires_at: new Date(Date.now() + 86400000).toISOString(), // 24 hours
   });

   console.assert(updated.status === 'completed', 'Status updated');
   console.assert(updated.file_size === 1024000, 'File size updated');
   ```

5. **Mark Expired Test:**
   ```typescript
   // Create export with past expiration
   const expiredLog = await exportService.createExportLog({
     user_id: 'test-user-id',
     format: 'json',
     config: { /* ... */ },
     conversation_count: 10,
   });

   await exportService.updateExportLog(expiredLog.export_id, {
     status: 'completed',
     expires_at: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
   });

   const markedCount = await exportService.markExpiredExports();
   console.assert(markedCount >= 1, 'At least one export marked expired');
   ```

6. **Error Handling Test:**
   ```typescript
   try {
     await exportService.getExportLog('non-existent-id');
     console.assert(false, 'Should return null for non-existent ID');
   } catch (error) {
     // Should not throw, should return null
   }

   try {
     await exportService.updateExportLog('non-existent-id', { status: 'completed' });
     console.assert(false, 'Should throw ExportNotFoundError');
   } catch (error) {
     console.assert(error instanceof ExportNotFoundError, 'Correct error type');
   }
   ```

**Database Verification Queries:**
**Use the SAOL library to confirm this information BEFORE implementing prompts.**
```sql
-- Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'export_logs'
ORDER BY ordinal_position;

-- Verify indexes
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'export_logs';

-- Verify RLS policies
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'export_logs';

-- Test data insert (manual)
INSERT INTO export_logs (user_id, format, config, conversation_count, status)
VALUES (
  auth.uid(),
  'jsonl',
  '{"scope":"all","format":"jsonl","includeMetadata":true}',
  100,
  'queued'
);

-- Verify insert worked
SELECT * FROM export_logs WHERE user_id = auth.uid();
```

**DELIVERABLES:**

1. **Database Verification**:
   - ✅ Screenshot or SQL output confirming export_logs table structure
   - ✅ Screenshot or SQL output confirming indexes created
   - ✅ Screenshot or SQL output confirming RLS policies
   - ✅ Test insert confirming RLS works correctly

2. **Source Files**:
   - ✅ `src/lib/export-service.ts` - ExportService class with all CRUD methods
   - ✅ Updated `train-wireframe/src/lib/types.ts` - ExportLog interface added

3. **Documentation**:
   - ✅ JSDoc comments on all public methods
   - ✅ Inline code comments explaining complex logic
   - ✅ README section (optional) documenting ExportService usage

4. **Testing Evidence**:
   - ✅ Manual test script results showing successful CRUD operations
   - ✅ Console output demonstrating error handling works correctly
   - ✅ Database query results showing logs created with correct data

Implement this foundation layer completely, ensuring all acceptance criteria are met and the implementation follows established patterns and best practices from the existing codebase.

++++++++++++++++++


### Prompt 2: Export Transformation Engine Core (JSONL and JSON)

**Scope**: Implement IExportTransformer interface, JSONL transformer for LoRA training format, JSON transformer for structured data  
**Dependencies**: Prompt 1 (ExportService and types), Conversation type definition, existing data model  
**Estimated Time**: 10-12 hours  
**Risk Level**: Medium (JSONL format compliance critical)

========================

You are a senior full-stack developer implementing the Export Transformation Engine Core for the Interactive LoRA Conversation Generation Module. This prompt focuses on the two primary export formats: JSONL (for LoRA training) and JSON (for structured data analysis).

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The transformation engine is the core business logic that converts conversation data from database format into training-ready formats. JSONL is the primary format for LoRA fine-tuning (OpenAI/Anthropic compatible), while JSON provides structured data for analysis and debugging.

**Functional Requirements Being Implemented:**
- **FR5.1.1**: Flexible Export Formats - Export conversations in multiple formats for different use cases
- Specific: JSONL format must output one conversation per line following OpenAI fine-tuning format
- Specific: JSON format must output array of conversation objects with complete metadata

**Acceptance Criteria** (from FR5.1.1):
- JSONL format: One conversation per line, newline-delimited JSON following OpenAI fine-tuning format
- JSON format: Array of conversation objects with complete metadata
- All formats support configurable inclusion of: metadata, quality scores, timestamps, approval history, parent references
- Transformer interface: Consistent API across all format implementations
- Streaming support for large datasets (>1000 conversations) to manage memory
- Character encoding: UTF-8 with BOM for CSV compatibility
- Date formatting: ISO 8601 format for all timestamp fields
- Error handling: Graceful handling of malformed data with detailed error messages

**Technical Architecture:**
- Strategy pattern: Each format implements IExportTransformer interface
- Streaming: Use Node.js streams to avoid loading entire dataset into memory
- Configuration-driven: ExportConfig determines which fields to include
- Type-safe: Explicit TypeScript interfaces for input/output

**CURRENT CODEBASE STATE:**

**Existing Types** (`train-wireframe/src/lib/types.ts`):
```typescript
// Lines 29-46: Conversation type
export interface Conversation {
  id: string;
  conversation_id: string;
  title: string;
  category: string[];
  status: ConversationStatus;
  qualityScore: number;
  persona?: string;
  emotion?: string;
  topic?: string;
  tier: TierType;
  totalTurns: number;
  tokenCount: number;
  parentId?: string;
  parentType?: 'template' | 'scenario';
  parameters: Record<string, any>;
  reviewHistory: ReviewAction[];
  createdAt: string;
  updatedAt: string;
}

// Lines 7-12: ConversationTurn type
export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  tokenCount?: number;
}

// Lines 14-24: QualityMetrics type
export interface QualityMetrics {
  score: number;
  completeness: number;
  coherence: number;
  relevance: number;
  technicalAccuracy: number;
  confidence: number;
}

// Lines 205-214: ExportConfig type
export type ExportConfig = {
  scope: 'selected' | 'filtered' | 'all';
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  includeMetadata: boolean;
  includeQualityScores: boolean;
  includeTimestamps: boolean;
  includeApprovalHistory: boolean;
  includeParentReferences: boolean;
  includeFullContent: boolean;
};
```

**Existing Service Pattern** (`src/lib/export-service.ts` from Prompt 1):
```typescript
export class ExportService {
  // CRUD operations for export logs
  async createExportLog(input: CreateExportLogInput): Promise<ExportLog>
  async listExportLogs(user_id: string, filters?: any, pagination?: any)
}
```

**OpenAI JSONL Training Format Specification:**
```jsonl
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Hello!"}, {"role": "assistant", "content": "Hi there!"}]}
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "What is 2+2?"}, {"role": "assistant", "content": "4"}]}
```

Each line is a complete JSON object with a `messages` array containing `role` and `content` fields.

**IMPLEMENTATION TASKS:**

**Task T-2.1.1: Define IExportTransformer Interface**

Create `src/lib/export-transformers/types.ts`:

```typescript
import { Conversation, ConversationTurn, ExportConfig } from '../../../train-wireframe/src/lib/types';

/**
 * Base interface for all export transformers
 * Implements Strategy pattern for format-specific transformation
 */
export interface IExportTransformer {
  /**
   * Transform conversations to target format
   * @param conversations Array of conversations to export
   * @param turns Map of conversation_id to array of turns
   * @param config Export configuration controlling output
   * @returns Transformed data as string
   */
  transform(
    conversations: Conversation[],
    turns: Map<string, ConversationTurn[]>,
    config: ExportConfig
  ): Promise<string>;

  /**
   * Validate output conforms to format specification
   * @param output Generated export string
   * @returns True if valid, throws error with details if invalid
   */
  validateOutput(output: string): boolean;

  /**
   * Get file extension for this format
   */
  getFileExtension(): string;

  /**
   * Get MIME type for HTTP response
   */
  getMimeType(): string;
}

/**
 * Configuration for streaming large exports
 */
export interface StreamingConfig {
  batchSize: number; // Number of conversations per batch (default 100)
  enableStreaming: boolean; // Enable for >500 conversations
}

/**
 * OpenAI/Anthropic JSONL message format
 */
export interface TrainingMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TrainingConversation {
  messages: TrainingMessage[];
  metadata?: Record<string, any>;
}
```

**Task T-2.1.2: Implement JSONL Transformer**

Create `src/lib/export-transformers/jsonl-transformer.ts`:

```typescript
import {
  IExportTransformer,
  TrainingConversation,
  TrainingMessage,
} from './types';
import {
  Conversation,
  ConversationTurn,
  ExportConfig,
} from '../../../train-wireframe/src/lib/types';

/**
 * JSONLTransformer
 * Transforms conversations to JSONL format for LoRA training
 * Format: One JSON object per line, newline-delimited
 * Compatible with OpenAI and Anthropic fine-tuning APIs
 */
export class JSONLTransformer implements IExportTransformer {
  /**
   * Transform conversations to JSONL format
   */
  async transform(
    conversations: Conversation[],
    turns: Map<string, ConversationTurn[]>,
    config: ExportConfig
  ): Promise<string> {
    const lines: string[] = [];

    for (const conversation of conversations) {
      try {
        const conversationTurns = turns.get(conversation.conversation_id) || [];
        const trainingConversation = this.convertToTrainingFormat(
          conversation,
          conversationTurns,
          config
        );

        // Each conversation becomes one line
        const line = JSON.stringify(trainingConversation);
        lines.push(line);
      } catch (error) {
        console.error(
          `Error transforming conversation ${conversation.conversation_id}:`,
          error
        );
        // Continue processing other conversations
      }
    }

    return lines.join('\n');
  }

  /**
   * Convert conversation to OpenAI/Anthropic training format
   */
  private convertToTrainingFormat(
    conversation: Conversation,
    turns: ConversationTurn[],
    config: ExportConfig
  ): TrainingConversation {
    // Build messages array
    const messages: TrainingMessage[] = turns.map((turn) => ({
      role: turn.role,
      content: turn.content,
    }));

    // Build training conversation object
    const trainingConversation: TrainingConversation = {
      messages,
    };

    // Add metadata if requested
    if (config.includeMetadata) {
      trainingConversation.metadata = this.buildMetadata(conversation, config);
    }

    return trainingConversation;
  }

  /**
   * Build metadata object based on config
   */
  private buildMetadata(
    conversation: Conversation,
    config: ExportConfig
  ): Record<string, any> {
    const metadata: Record<string, any> = {
      conversation_id: conversation.conversation_id,
      title: conversation.title,
      tier: conversation.tier,
    };

    if (config.includeQualityScores) {
      metadata.quality_score = conversation.qualityScore;
    }

    if (config.includeTimestamps) {
      metadata.created_at = conversation.createdAt;
      metadata.updated_at = conversation.updatedAt;
    }

    if (config.includeApprovalHistory && conversation.reviewHistory) {
      metadata.review_history = conversation.reviewHistory;
    }

    if (
      config.includeParentReferences &&
      (conversation.parentId || conversation.parentType)
    ) {
      metadata.parent_id = conversation.parentId;
      metadata.parent_type = conversation.parentType;
    }

    // Add persona, emotion, topic if present
    if (conversation.persona) metadata.persona = conversation.persona;
    if (conversation.emotion) metadata.emotion = conversation.emotion;
    if (conversation.topic) metadata.topic = conversation.topic;

    return metadata;
  }

  /**
   * Validate JSONL output format
   */
  validateOutput(output: string): boolean {
    if (!output) {
      throw new Error('Empty output');
    }

    const lines = output.split('\n').filter((line) => line.trim());

    if (lines.length === 0) {
      throw new Error('No valid lines in JSONL output');
    }

    // Validate each line is valid JSON
    for (let i = 0; i < lines.length; i++) {
      try {
        const parsed = JSON.parse(lines[i]);

        // Verify has messages array
        if (!parsed.messages || !Array.isArray(parsed.messages)) {
          throw new Error(`Line ${i + 1}: Missing or invalid messages array`);
        }

        // Verify each message has role and content
        for (const message of parsed.messages) {
          if (!message.role || !message.content) {
            throw new Error(
              `Line ${i + 1}: Message missing role or content`
            );
          }
          if (!['system', 'user', 'assistant'].includes(message.role)) {
            throw new Error(`Line ${i + 1}: Invalid role: ${message.role}`);
          }
        }
      } catch (error) {
        throw new Error(`Line ${i + 1}: Invalid JSON - ${error.message}`);
      }
    }

    return true;
  }

  getFileExtension(): string {
    return 'jsonl';
  }

  getMimeType(): string {
    return 'application/x-ndjson'; // Newline-delimited JSON
  }
}
```

**Task T-2.1.3: Implement JSON Transformer**

Create `src/lib/export-transformers/json-transformer.ts`:

```typescript
import { IExportTransformer } from './types';
import {
  Conversation,
  ConversationTurn,
  ExportConfig,
} from '../../../train-wireframe/src/lib/types';

/**
 * Structured JSON export format
 */
interface ConversationExport {
  conversation_id: string;
  title: string;
  status: string;
  tier: string;
  turns: {
    role: 'user' | 'assistant';
    content: string;
    token_count?: number;
  }[];
  metadata?: Record<string, any>;
}

interface JSONExport {
  version: string; // Schema version for compatibility
  export_date: string;
  conversation_count: number;
  conversations: ConversationExport[];
  summary?: {
    total_turns: number;
    average_quality_score?: number;
    tier_distribution?: Record<string, number>;
  };
}

/**
 * JSONTransformer
 * Transforms conversations to structured JSON array format
 * Includes complete metadata and quality metrics
 * Pretty-printed for readability
 */
export class JSONTransformer implements IExportTransformer {
  /**
   * Transform conversations to JSON format
   */
  async transform(
    conversations: Conversation[],
    turns: Map<string, ConversationTurn[]>,
    config: ExportConfig
  ): Promise<string> {
    const conversationExports: ConversationExport[] = [];

    for (const conversation of conversations) {
      try {
        const conversationTurns = turns.get(conversation.conversation_id) || [];
        const exportData = this.convertConversation(
          conversation,
          conversationTurns,
          config
        );
        conversationExports.push(exportData);
      } catch (error) {
        console.error(
          `Error transforming conversation ${conversation.conversation_id}:`,
          error
        );
      }
    }

    // Build complete export object
    const exportObj: JSONExport = {
      version: '1.0',
      export_date: new Date().toISOString(),
      conversation_count: conversationExports.length,
      conversations: conversationExports,
    };

    // Add summary if metadata included
    if (config.includeMetadata) {
      exportObj.summary = this.buildSummary(conversations);
    }

    // Pretty print with 2-space indentation
    return JSON.stringify(exportObj, null, 2);
  }

  /**
   * Convert single conversation to export format
   */
  private convertConversation(
    conversation: Conversation,
    turns: ConversationTurn[],
    config: ExportConfig
  ): ConversationExport {
    const exportData: ConversationExport = {
      conversation_id: conversation.conversation_id,
      title: conversation.title,
      status: conversation.status,
      tier: conversation.tier,
      turns: turns.map((turn) => {
        const turnData: any = {
          role: turn.role,
          content: turn.content,
        };
        if (turn.tokenCount) {
          turnData.token_count = turn.tokenCount;
        }
        return turnData;
      }),
    };

    // Add metadata if requested
    if (config.includeMetadata) {
      exportData.metadata = {
        persona: conversation.persona,
        emotion: conversation.emotion,
        topic: conversation.topic,
        category: conversation.category,
        total_turns: conversation.totalTurns,
        token_count: conversation.tokenCount,
      };

      if (config.includeQualityScores) {
        exportData.metadata.quality_score = conversation.qualityScore;
      }

      if (config.includeTimestamps) {
        exportData.metadata.created_at = conversation.createdAt;
        exportData.metadata.updated_at = conversation.updatedAt;
      }

      if (config.includeApprovalHistory && conversation.reviewHistory) {
        exportData.metadata.review_history = conversation.reviewHistory;
      }

      if (
        config.includeParentReferences &&
        (conversation.parentId || conversation.parentType)
      ) {
        exportData.metadata.parent_id = conversation.parentId;
        exportData.metadata.parent_type = conversation.parentType;
      }

      // Add custom parameters
      if (conversation.parameters && Object.keys(conversation.parameters).length > 0) {
        exportData.metadata.parameters = conversation.parameters;
      }
    }

    return exportData;
  }

  /**
   * Build summary statistics
   */
  private buildSummary(conversations: Conversation[]): JSONExport['summary'] {
    const totalTurns = conversations.reduce(
      (sum, c) => sum + c.totalTurns,
      0
    );

    const qualityScores = conversations
      .map((c) => c.qualityScore)
      .filter((score) => score !== undefined && score !== null);
    const averageQualityScore =
      qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : undefined;

    const tierDistribution: Record<string, number> = {};
    for (const conversation of conversations) {
      tierDistribution[conversation.tier] = (tierDistribution[conversation.tier] || 0) + 1;
    }

    return {
      total_turns: totalTurns,
      average_quality_score: averageQualityScore,
      tier_distribution: tierDistribution,
    };
  }

  /**
   * Validate JSON output format
   */
  validateOutput(output: string): boolean {
    if (!output) {
      throw new Error('Empty output');
    }

    try {
      const parsed: JSONExport = JSON.parse(output);

      // Verify required fields
      if (!parsed.version) {
        throw new Error('Missing version field');
      }
      if (!parsed.export_date) {
        throw new Error('Missing export_date field');
      }
      if (parsed.conversation_count === undefined) {
        throw new Error('Missing conversation_count field');
      }
      if (!Array.isArray(parsed.conversations)) {
        throw new Error('conversations must be an array');
      }

      // Verify conversation count matches
      if (parsed.conversation_count !== parsed.conversations.length) {
        throw new Error(
          `Conversation count mismatch: declared ${parsed.conversation_count}, actual ${parsed.conversations.length}`
        );
      }

      // Verify each conversation has required fields
      for (let i = 0; i < parsed.conversations.length; i++) {
        const conv = parsed.conversations[i];
        if (!conv.conversation_id) {
          throw new Error(`Conversation ${i}: Missing conversation_id`);
        }
        if (!Array.isArray(conv.turns)) {
          throw new Error(`Conversation ${i}: turns must be an array`);
        }
        if (conv.turns.length === 0) {
          throw new Error(`Conversation ${i}: turns array is empty`);
        }

        // Verify each turn has role and content
        for (let j = 0; j < conv.turns.length; j++) {
          const turn = conv.turns[j];
          if (!turn.role || !turn.content) {
            throw new Error(
              `Conversation ${i}, Turn ${j}: Missing role or content`
            );
          }
        }
      }

      return true;
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
  }

  getFileExtension(): string {
    return 'json';
  }

  getMimeType(): string {
    return 'application/json';
  }
}
```

**Task T-2.1.4: Create Transformer Factory**

Create `src/lib/export-transformers/index.ts`:

```typescript
import { IExportTransformer } from './types';
import { JSONLTransformer } from './jsonl-transformer';
import { JSONTransformer } from './json-transformer';
import { ExportConfig } from '../../../train-wireframe/src/lib/types';

/**
 * Factory function to get appropriate transformer for format
 */
export function getTransformer(format: ExportConfig['format']): IExportTransformer {
  switch (format) {
    case 'jsonl':
      return new JSONLTransformer();
    case 'json':
      return new JSONTransformer();
    case 'csv':
      throw new Error('CSV transformer not yet implemented (see Prompt 3)');
    case 'markdown':
      throw new Error('Markdown transformer not yet implemented (see Prompt 3)');
    default:
      throw new Error(`Unknown export format: ${format}`);
  }
}

// Re-export for convenience
export { IExportTransformer, JSONLTransformer, JSONTransformer };
export * from './types';
```

**ACCEPTANCE CRITERIA:**

1. **Interface Definition**:
   - ✅ IExportTransformer interface defined with transform(), validateOutput(), getFileExtension(), getMimeType()
   - ✅ Type definitions for TrainingMessage, TrainingConversation, StreamingConfig
   - ✅ All methods have JSDoc comments explaining parameters and return values

2. **JSONL Transformer**:
   - ✅ Implements IExportTransformer interface
   - ✅ Outputs one JSON object per line (newline-delimited)
   - ✅ Each line has `messages` array with role/content objects
   - ✅ Roles limited to 'system', 'user', 'assistant'
   - ✅ Optional metadata object included based on ExportConfig
   - ✅ Metadata includes: conversation_id, title, tier, quality_score (if enabled), timestamps (if enabled), review_history (if enabled), parent references (if enabled)
   - ✅ Error handling: Continues processing on individual conversation error
   - ✅ Validation: Checks each line is valid JSON with required fields

3. **JSON Transformer**:
   - ✅ Implements IExportTransformer interface
   - ✅ Outputs single JSON object with version, export_date, conversation_count, conversations array
   - ✅ Each conversation has conversation_id, title, status, tier, turns array
   - ✅ Turns array contains role and content for each turn
   - ✅ Optional metadata object per conversation based on ExportConfig
   - ✅ Summary statistics: total_turns, average_quality_score, tier_distribution (if metadata enabled)
   - ✅ Pretty-printed with 2-space indentation for readability
   - ✅ Validation: Checks conversation_count matches array length, all required fields present

4. **Factory Function**:
   - ✅ getTransformer() returns appropriate transformer instance for format
   - ✅ Throws error for CSV/Markdown (implemented in Prompt 3)
   - ✅ Throws error for unknown formats

5. **Type Safety**:
   - ✅ All TypeScript types match Conversation and ConversationTurn interfaces
   - ✅ ExportConfig properly typed with all flags
   - ✅ No use of `any` except for metadata Record<string, any>
   - ✅ Strict mode compilation passes

6. **Error Handling**:
   - ✅ Individual conversation errors don't stop entire export
   - ✅ Validation throws descriptive errors with line/field information
   - ✅ All errors logged to console.error for debugging

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
- Interface: `src/lib/export-transformers/types.ts`
- JSONL Transformer: `src/lib/export-transformers/jsonl-transformer.ts`
- JSON Transformer: `src/lib/export-transformers/json-transformer.ts`
- Factory: `src/lib/export-transformers/index.ts`

**Component Architecture:**
- Strategy Pattern: Each transformer implements common interface
- Composition: Transformers receive data and config, return string
- Dependency Injection: No hard dependencies on database or services
- Pure Functions: Transformers are stateless, side-effect free

**Data Flow:**
1. API endpoint fetches conversations and turns from database
2. API creates Map<conversation_id, turns[]> for efficient lookup
3. API calls getTransformer(format) to get transformer instance
4. API calls transformer.transform(conversations, turns, config)
5. Transformer iterates conversations, converts to target format
6. Transformer returns complete formatted string
7. API validates output with transformer.validateOutput()
8. API returns formatted string to client or saves to file

**VALIDATION REQUIREMENTS:**

**Manual Testing Steps:**

1. **JSONL Format Test:**
   ```typescript
   import { JSONLTransformer } from './export-transformers/jsonl-transformer';
   import { Conversation, ConversationTurn, ExportConfig } from '../types';

   const conversations: Conversation[] = [
     {
       conversation_id: 'test-001',
       title: 'Test Conversation',
       status: 'approved',
       tier: 'template',
       qualityScore: 8.5,
       persona: 'Anxious Investor',
       emotion: 'Fear',
       topic: 'Market Volatility',
       totalTurns: 4,
       tokenCount: 500,
       createdAt: '2025-10-29T10:00:00Z',
       updatedAt: '2025-10-29T11:00:00Z',
       reviewHistory: [],
       category: [],
       parameters: {},
     },
   ];

   const turns = new Map<string, ConversationTurn[]>();
   turns.set('test-001', [
     { role: 'user', content: 'I\'m worried about the market crash.' },
     { role: 'assistant', content: 'Let me help you understand the situation.' },
     { role: 'user', content: 'What should I do with my investments?' },
     { role: 'assistant', content: 'Here are some strategies to consider...' },
   ]);

   const config: ExportConfig = {
     scope: 'all',
     format: 'jsonl',
     includeMetadata: true,
     includeQualityScores: true,
     includeTimestamps: true,
     includeApprovalHistory: false,
     includeParentReferences: false,
     includeFullContent: true,
   };

   const transformer = new JSONLTransformer();
   const output = await transformer.transform(conversations, turns, config);

   console.log('JSONL Output:');
   console.log(output);

   // Verify format
   const lines = output.split('\n');
   console.assert(lines.length === 1, 'Should have 1 line');
   const parsed = JSON.parse(lines[0]);
   console.assert(parsed.messages.length === 4, 'Should have 4 messages');
   console.assert(parsed.messages[0].role === 'user', 'First message is user');
   console.assert(parsed.metadata?.conversation_id === 'test-001', 'Metadata included');

   // Validate output
   const isValid = transformer.validateOutput(output);
   console.assert(isValid, 'Output should be valid');
   ```

2. **JSON Format Test:**
   ```typescript
   import { JSONTransformer } from './export-transformers/json-transformer';

   const transformer = new JSONTransformer();
   const output = await transformer.transform(conversations, turns, config);

   console.log('JSON Output (pretty-printed):');
   console.log(output);

   // Verify format
   const parsed = JSON.parse(output);
   console.assert(parsed.version === '1.0', 'Version included');
   console.assert(parsed.conversation_count === 1, 'Count correct');
   console.assert(parsed.conversations.length === 1, 'One conversation');
   console.assert(parsed.conversations[0].turns.length === 4, 'Four turns');
   console.assert(parsed.summary !== undefined, 'Summary included');
   console.assert(parsed.summary.total_turns === 4, 'Total turns correct');

   // Validate output
   const isValid = transformer.validateOutput(output);
   console.assert(isValid, 'Output should be valid');
   ```

3. **Metadata Filtering Test:**
   ```typescript
   // Test with metadata disabled
   const minimalConfig: ExportConfig = {
     scope: 'all',
     format: 'jsonl',
     includeMetadata: false,
     includeQualityScores: false,
     includeTimestamps: false,
     includeApprovalHistory: false,
     includeParentReferences: false,
     includeFullContent: true,
   };

   const minimalOutput = await transformer.transform(conversations, turns, minimalConfig);
   const minimalParsed = JSON.parse(minimalOutput.split('\n')[0]);
   console.assert(minimalParsed.metadata === undefined, 'Metadata should not be included');
   ```

4. **Error Handling Test:**
   ```typescript
   // Test with invalid data
   const invalidConversations: Conversation[] = [
     {
       conversation_id: 'invalid-001',
       // Missing required fields
     } as any,
   ];

   try {
     await transformer.transform(invalidConversations, new Map(), config);
     // Should continue processing despite error
     console.log('Handled invalid conversation gracefully');
   } catch (error) {
     console.error('Should not throw on individual conversation error');
   }
   ```

5. **Validation Test:**
   ```typescript
   // Test validation with invalid JSONL
   try {
     transformer.validateOutput('not valid json\n{"incomplete":');
     console.assert(false, 'Should throw on invalid JSON');
   } catch (error) {
     console.assert(error.message.includes('Invalid JSON'), 'Correct error message');
   }

   // Test validation with missing messages field
   try {
     transformer.validateOutput('{"no_messages_field": true}');
     console.assert(false, 'Should throw on missing messages');
   } catch (error) {
     console.assert(error.message.includes('messages'), 'Correct error message');
   }
   ```

6. **Large Dataset Test:**
   ```typescript
   // Test with 100 conversations
   const largeConversations = Array.from({ length: 100 }, (_, i) => ({
     ...conversations[0],
     conversation_id: `test-${i.toString().padStart(3, '0')}`,
   }));

   const largeTurns = new Map<string, ConversationTurn[]>();
   largeConversations.forEach((conv) => {
     largeTurns.set(conv.conversation_id, turns.get('test-001')!);
   });

   const largeOutput = await transformer.transform(largeConversations, largeTurns, config);
   const largeLines = largeOutput.split('\n').filter((l) => l.trim());
   console.assert(largeLines.length === 100, 'Should have 100 lines');

   console.log(`Large export size: ${largeOutput.length} bytes`);
   console.log(`Average bytes per conversation: ${largeOutput.length / 100}`);
   ```

**DELIVERABLES:**

1. **Source Files**:
   - ✅ `src/lib/export-transformers/types.ts` - IExportTransformer interface and type definitions
   - ✅ `src/lib/export-transformers/jsonl-transformer.ts` - JSONL transformer implementation
   - ✅ `src/lib/export-transformers/json-transformer.ts` - JSON transformer implementation
   - ✅ `src/lib/export-transformers/index.ts` - Factory function and exports

2. **Documentation**:
   - ✅ JSDoc comments on all public methods and interfaces
   - ✅ Inline comments explaining transformation logic
   - ✅ Format specification comments (OpenAI JSONL format reference)

3. **Testing Evidence**:
   - ✅ Manual test script results for both transformers
   - ✅ Sample JSONL output showing correct format
   - ✅ Sample JSON output showing pretty-printed structure
   - ✅ Validation test results confirming error detection
   - ✅ Performance test results for 100+ conversations

4. **Format Examples**:
   - ✅ Sample JSONL file: `test-output.jsonl` (for reference)
   - ✅ Sample JSON file: `test-output.json` (for reference)

Implement these transformers completely, ensuring they handle edge cases gracefully and produce valid output for LoRA training pipelines.

++++++++++++++++++


### Prompt 3: CSV and Markdown Transformers

**Scope**: Implement CSV transformer with proper escaping for Excel compatibility, Markdown transformer for human-readable review format  
**Dependencies**: Prompt 2 (IExportTransformer interface established), csv-stringify library  
**Estimated Time**: 8-10 hours  
**Risk Level**: Medium (CSV escaping edge cases)

========================

You are a senior full-stack developer implementing CSV and Markdown export transformers for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

CSV format enables analysis in Excel/Google Sheets with one turn per row (flattened structure). Markdown format provides human-readable conversation review with proper formatting.

**Functional Requirements Being Implemented:**
- **FR5.1.1**: CSV format must flatten conversations into rows (one turn per row), Markdown format must format conversations as readable dialogue
- CSV must use proper escaping for quotes, newlines, commas
- CSV must include UTF-8 BOM for Excel compatibility
- Markdown must use headers, blockquotes, and formatting for readability

**IMPLEMENTATION TASKS:**

**Task T-2.1.5: Implement CSV Transformer**

Create `src/lib/export-transformers/csv-transformer.ts`:

Use `csv-stringify` library for proper escaping. Structure:
- Headers: conversation_id, title, status, tier, turn_number, role, content, quality_score, persona, emotion, topic, created_at
- One row per turn (flattened conversations)
- Conversation metadata repeated per row for filtering capabilities
- UTF-8 BOM: `\uFEFF` prepended to output
- Handle special characters: quotes escaped as `""`, newlines preserved within cells

Key methods:
- `flattenConversations()` - Convert nested conversations to flat row structure
- `generateHeaders()` - Dynamic headers based on ExportConfig
- `escapeCSVField()` - Proper quote/comma/newline escaping

**Task T-2.1.6: Implement Markdown Transformer**

Create `src/lib/export-transformers/markdown-transformer.ts`:

Format each conversation as:
```markdown
# Conversation: [title]

**Metadata:**
- ID: conversation_id
- Tier: template
- Quality Score: 8.5
- Created: 2025-10-29

## Conversation

**User:**
> First user message here

**Assistant:**
> First assistant response here

**User:**
> Second user message here

**Assistant:**
> Second assistant response here

---
```

Key methods:
- `formatConversation()` - Build markdown for single conversation
- `formatMetadata()` - Metadata as bullet list or table
- `formatTurn()` - User/Assistant with blockquote style

**ACCEPTANCE CRITERIA:**

1. **CSV Transformer**:
   - ✅ Implements IExportTransformer interface
   - ✅ One row per turn (flattened structure)
   - ✅ Headers row with all metadata fields
   - ✅ Proper CSV escaping using csv-stringify
   - ✅ UTF-8 BOM for Excel compatibility
   - ✅ Validates output imports correctly into Excel/Google Sheets

2. **Markdown Transformer**:
   - ✅ Implements IExportTransformer interface
   - ✅ Headers (# and ##) for structure
   - ✅ Blockquotes (>) for turn content
   - ✅ Metadata formatted as bullet list
   - ✅ Horizontal rules (---) between conversations
   - ✅ Validates renders correctly in GitHub/VS Code

3. **Integration**:
   - ✅ Factory function updated to return CSV/Markdown transformers
   - ✅ All four transformers complete and functional

**VALIDATION REQUIREMENTS:**

1. **CSV Export Test**: Export conversations, import into Excel, verify no formatting issues
2. **Special Characters Test**: Test with content containing quotes, commas, newlines
3. **Markdown Render Test**: View exported .md file in GitHub/VS Code, verify formatting
4. **Factory Test**: `getTransformer('csv')` and `getTransformer('markdown')` return correct instances

**DELIVERABLES:**
- ✅ `src/lib/export-transformers/csv-transformer.ts`
- ✅ `src/lib/export-transformers/markdown-transformer.ts`
- ✅ Updated `src/lib/export-transformers/index.ts` factory
- ✅ Sample exports: test-output.csv, test-output.md

++++++++++++++++++


### Prompt 4: Export API Endpoints

**Scope**: Implement API routes for export initiation, status checking, download, and history listing  
**Dependencies**: Prompts 1-3 (ExportService and transformers), existing Supabase database  
**Estimated Time**: 14-16 hours  
**Risk Level**: Medium (large file handling, background jobs)

========================

You are a senior full-stack developer implementing the Export API endpoints for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

API endpoints handle export requests, apply filters, transform data, generate files, and provide download links. Support both synchronous (<500 conversations) and background (≥500) processing.

**Functional Requirements Being Implemented:**
- **FR5.1.2**: Export Filtering and Selection - Apply scope (selected, filtered, all approved, all data)
- **FR5.2.1**: Background Export Processing - Handle large exports without blocking UI
- **FR5.2.2**: Export Audit Trail - Log all operations with user attribution

**IMPLEMENTATION TASKS:**

**Task T-4.1.1: Create Export Request Endpoint**

File: `src/app/api/export/conversations/route.ts`

POST `/api/export/conversations`

Request body:
```typescript
{
  config: ExportConfig,
  conversationIds?: string[], // For scope: 'selected'
  filters?: FilterConfig // For scope: 'filtered'
}
```

Logic:
1. Authenticate user (Supabase auth)
2. Parse and validate request body (Zod schema)
3. Apply scope filters:
   - 'selected': Use conversationIds array
   - 'filtered': Apply filters from FilterConfig
   - 'all': Filter by status='approved'
4. Fetch conversations and turns from database
5. Determine processing mode:
   - < 500: Synchronous processing
   - ≥ 500: Create BatchJob (background processing, return job_id)
6. Call transformer with conversations, turns, config
7. Generate file (save to /tmp or Supabase Storage)
8. Create export log via ExportService
9. Return export_id or job_id

**Task T-4.1.2: Create Export Status Endpoint**

File: `src/app/api/export/status/[id]/route.ts`

GET `/api/export/status/:id`

Returns:
```typescript
{
  export_id: string,
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired',
  progress?: number, // 0-100
  conversation_count: number,
  file_size?: number,
  file_url?: string,
  error_message?: string
}
```

**Task T-4.1.3: Create Export Download Endpoint**

File: `src/app/api/export/download/[id]/route.ts`

GET `/api/export/download/:id`

Logic:
1. Verify export status = 'completed'
2. Check user owns export (RLS)
3. Retrieve file from storage
4. Set Content-Disposition header with filename
5. Return file stream or redirect to signed URL

**Task T-4.1.4: Create Export History Endpoint**

File: `src/app/api/export/history/route.ts`

GET `/api/export/history?format=&status=&page=&limit=`

Returns paginated list of user's exports with filters.

**ACCEPTANCE CRITERIA:**

1. **Export Request Endpoint**:
   - ✅ Accepts ExportConfig, conversationIds, filters
   - ✅ Validates request with Zod
   - ✅ Applies correct scope filtering
   - ✅ Synchronous for <500, background for ≥500
   - ✅ Creates export log in database
   - ✅ Returns export_id and status

2. **Status Endpoint**:
   - ✅ Returns current export status
   - ✅ Includes progress for background jobs
   - ✅ Returns 404 for invalid export_id
   - ✅ Returns 403 if user doesn't own export

3. **Download Endpoint**:
   - ✅ Streams file to client
   - ✅ Sets correct Content-Type and Content-Disposition
   - ✅ Returns 404 if file not found
   - ✅ Returns 410 if export expired

4. **History Endpoint**:
   - ✅ Returns paginated exports
   - ✅ Supports filtering by format, status
   - ✅ Sorted by timestamp DESC
   - ✅ Only returns user's own exports (RLS)

5. **Error Handling**:
   - ✅ Authentication errors return 401
   - ✅ Validation errors return 400 with details
   - ✅ Database errors return 500 with safe message
   - ✅ Rate limit errors return 429

6. **Performance**:
   - ✅ Exports <100 conversations complete in <5s
   - ✅ Background jobs don't timeout serverless functions
   - ✅ File streaming handles large files (>10MB)

**TECHNICAL SPECIFICATIONS:**

**File Naming Convention:**
```
training-data-{tier}-{YYYY-MM-DD}-{count}.{extension}
```

**Response Headers:**
```
Content-Type: application/json | application/x-ndjson | text/csv | text/markdown
Content-Disposition: attachment; filename="training-data-template-2025-10-29-42.jsonl"
```

**Database Queries:**
Use ExportService for audit logs, direct Supabase client for conversations/turns with proper indexes.

**VALIDATION REQUIREMENTS:**

1. **API Test Suite**: Use Supertest or Thunder Client to test all endpoints
2. **Authentication Test**: Verify 401 without auth token
3. **Authorization Test**: Verify user can't access other user's exports
4. **Large Export Test**: Test with 600 conversations triggering background processing
5. **Filter Test**: Verify scope filters apply correctly (selected, filtered, all approved)

**DELIVERABLES:**
- ✅ `src/app/api/export/conversations/route.ts`
- ✅ `src/app/api/export/status/[id]/route.ts`
- ✅ `src/app/api/export/download/[id]/route.ts`
- ✅ `src/app/api/export/history/route.ts`
- ✅ API test results showing successful exports

++++++++++++++++++


### Prompt 5: Export Modal UI Enhancement

**Scope**: Enhance existing ExportModal.tsx with scope selector, format selector, options panel, and preview functionality  
**Dependencies**: Prompts 1-4 (API endpoints working), existing wireframe ExportModal component  
**Estimated Time**: 12-14 hours  
**Risk Level**: Low (UI implementation, well-defined patterns)

========================

You are a senior full-stack developer implementing the Export Modal UI for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

The ExportModal provides a user-friendly interface for configuring and initiating exports. It must support scope selection, format selection, advanced options, and preview capabilities.

**Functional Requirements Being Implemented:**
- **FR5.1.1**: Format selector with descriptions (JSONL, JSON, CSV, Markdown)
- **FR5.1.2**: Export scope selector (Selected, Current Filters, All Approved, All Data)
- Export options: metadata, quality scores, timestamps, approval history, parent references

**Current Codebase State:**

Existing: `train-wireframe/src/components/dashboard/ExportModal.tsx` (stub component)

Needs: Complete implementation with:
1. ExportScopeSelector sub-component
2. ExportFormatSelector sub-component
3. ExportOptionsPanel sub-component
4. ExportPreview sub-component
5. Integration with export API

**IMPLEMENTATION TASKS:**

**Task T-3.1.1: Implement ExportScopeSelector Component**

File: `train-wireframe/src/components/export/ExportScopeSelector.tsx`

RadioGroup with 4 options:
- Selected Conversations (N selected)
- Current Filters (N matching)
- All Approved (N approved)
- All Data (N total)

Dynamic counts calculated from: `selectedConversationIds.length`, `filteredConversations.length`, conversations filtered by status='approved', all conversations.

**Task T-3.1.2: Implement ExportFormatSelector Component**

File: `train-wireframe/src/components/export/ExportFormatSelector.tsx`

RadioGroup with 4 formats:
- JSONL - LoRA Training (Recommended) 📄
- JSON - Structured Data 🔧
- CSV - Analysis & Reporting 📊
- Markdown - Human Review 📝

Include descriptions explaining use case for each format.

**Task T-3.1.3: Implement ExportOptionsPanel Component**

File: `train-wireframe/src/components/export/ExportOptionsPanel.tsx`

Accordion panel with checkboxes:
- Include Metadata
- Include Quality Scores
- Include Timestamps
- Include Approval History
- Include Parent References
- Include Full Content

Tooltips explaining each option.

**Task T-3.1.4: Implement ExportPreview Component**

File: `train-wireframe/src/components/export/ExportPreview.tsx`

Shows first 3 conversations in selected format before download.

Format-specific rendering:
- JSONL: Syntax-highlighted JSON (one line visible)
- JSON: Pretty-printed JSON with collapsible sections
- CSV: Table preview (first 10 rows)
- Markdown: Rendered markdown

Include "Copy to Clipboard" button.

**Task T-3.1.5: Enhance Main ExportModal Component**

File: `train-wireframe/src/components/dashboard/ExportModal.tsx`

Modal structure:
```tsx
<Dialog open={isOpen}>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>Export Conversations</DialogTitle>
    </DialogHeader>
    
    <ExportScopeSelector value={scope} onChange={setScope} />
    <ExportFormatSelector value={format} onChange={setFormat} />
    <ExportOptionsPanel config={config} onChange={setConfig} />
    <ExportPreview conversations={previewConversations} format={format} />
    
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button onClick={handleExport} loading={isExporting}>
        Export {conversationCount} Conversations
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**ACCEPTANCE CRITERIA:**

1. **ExportScopeSelector**:
   - ✅ 4 radio options with dynamic counts
   - ✅ Counts update when filters/selection changes
   - ✅ Badge components showing counts
   - ✅ Accessible via keyboard (Tab, Arrow keys)

2. **ExportFormatSelector**:
   - ✅ 4 format options with icons and descriptions
   - ✅ JSONL marked as "Recommended"
   - ✅ Visual distinction for selected format
   - ✅ Tooltips with format details

3. **ExportOptionsPanel**:
   - ✅ Collapsible accordion
   - ✅ 6 checkbox options
   - ✅ Tooltips explaining each option
   - ✅ "Reset to Defaults" button

4. **ExportPreview**:
   - ✅ Shows first 3 conversations
   - ✅ Format-specific rendering
   - ✅ Syntax highlighting for JSON/JSONL
   - ✅ Copy to clipboard button

5. **Main Modal**:
   - ✅ Opens from dashboard "Export" button
   - ✅ State managed via Zustand store
   - ✅ Integrates all sub-components
   - ✅ Calls export API on submit
   - ✅ Shows loading state during export
   - ✅ Displays success toast with download link
   - ✅ Handles errors with clear messages

6. **Integration**:
   - ✅ Uses existing FilterConfig for scope='filtered'
   - ✅ Uses selectedConversationIds for scope='selected'
   - ✅ Respects user preferences for default format
   - ✅ Persists last used configuration

**VALIDATION REQUIREMENTS:**

1. **UI Test**: Open modal, select each scope, verify counts correct
2. **Format Test**: Select each format, verify preview updates
3. **Options Test**: Toggle options, verify reflected in export API call
4. **Export Test**: Complete export workflow, verify file downloads
5. **Keyboard Test**: Tab through all controls, Enter to select, Esc to close

**DELIVERABLES:**
- ✅ `train-wireframe/src/components/export/ExportScopeSelector.tsx`
- ✅ `train-wireframe/src/components/export/ExportFormatSelector.tsx`
- ✅ `train-wireframe/src/components/export/ExportOptionsPanel.tsx`
- ✅ `train-wireframe/src/components/export/ExportPreview.tsx`
- ✅ Updated `train-wireframe/src/components/dashboard/ExportModal.tsx`
- ✅ Screenshots showing complete export modal UI

++++++++++++++++++


### Prompt 6: Operations, Monitoring, and File Cleanup

**Scope**: Implement export metrics collection, monitoring dashboard integration, and automated file cleanup jobs  
**Dependencies**: Prompts 1-5 (complete export system operational)  
**Estimated Time**: 8-10 hours  
**Risk Level**: Low (operational enhancement)

========================

You are a senior full-stack developer implementing operational monitoring and maintenance for the Interactive LoRA Conversation Generation Module Export System.

**CONTEXT AND REQUIREMENTS:**

Production-ready export system requires metrics collection for monitoring, alerting for failures, and automated cleanup to control storage costs.

**Functional Requirements Being Implemented:**
- **FR5.2.1**: Export metrics collection (success rate, duration, file sizes)
- **FR5.2.2**: Automated file cleanup (delete exports older than 24 hours)
- Export failure alerts when failure rate >10%

**IMPLEMENTATION TASKS:**

**Task T-6.1.1: Implement Export Metrics Collection**

File: `src/lib/monitoring/export-metrics.ts`

Metrics to track:
- Export success rate (% of completed exports)
- Average export duration (by format and conversation count range)
- File sizes (average, max by format)
- Export volume (exports per day/hour)
- Format distribution (% of exports per format)
- User export activity (exports per user)

Collection points:
- After export completion: Log duration, file size, status
- On export failure: Log error type and message
- Aggregate hourly: Calculate rates and averages

Integration: Use console.log with structured JSON for log aggregation tools (Sentry, Datadog, CloudWatch).

**Task T-6.2.1: Implement File Cleanup Job**

File: `src/lib/cron/export-file-cleanup.ts`

Scheduled job (daily at 2am UTC) to:
1. Query exports with `status='completed' AND expires_at < NOW()`
2. Delete files from storage (Supabase Storage or /tmp)
3. Update export log status to 'expired'
4. Log deletion count for monitoring

Use Vercel Cron or Supabase Edge Function cron trigger.

Configuration:
```typescript
export const config = {
  schedule: '0 2 * * *', // Daily at 2am UTC
  retentionHours: 24,
};
```

**Task T-6.2.2: Implement Audit Log Cleanup Job**

File: `src/lib/cron/export-log-cleanup.ts`

Monthly job (first day of month) to:
1. Delete export logs older than 30 days
2. Compress and archive logs to S3 (optional)
3. Log cleanup summary

**ACCEPTANCE CRITERIA:**

1. **Metrics Collection**:
   - ✅ Metrics logged on every export completion/failure
   - ✅ Structured JSON format for parsing
   - ✅ Include: timestamp, export_id, user_id, format, duration_ms, file_size, status
   - ✅ Dashboard widget showing export metrics (optional)

2. **File Cleanup Job**:
   - ✅ Runs daily at 2am UTC
   - ✅ Deletes expired export files
   - ✅ Updates export log status to 'expired'
   - ✅ Logs deletion count
   - ✅ Handles errors gracefully (continues on individual failures)

3. **Audit Log Cleanup**:
   - ✅ Runs monthly
   - ✅ Deletes logs older than 30 days
   - ✅ Optional archival to S3
   - ✅ Logs cleanup summary

4. **Error Handling**:
   - ✅ Failed deletes don't stop job
   - ✅ Errors logged for debugging
   - ✅ Summary includes success/failure counts

**VALIDATION REQUIREMENTS:**

1. **Metrics Test**: Generate exports, verify metrics logged with correct data
2. **Cleanup Test**: Create expired exports, run cleanup job, verify deleted
3. **Status Update Test**: Verify export logs updated to 'expired' status
4. **Error Handling Test**: Simulate file delete failure, verify job continues

**DELIVERABLES:**
- ✅ `src/lib/monitoring/export-metrics.ts`
- ✅ `src/lib/cron/export-file-cleanup.ts`
- ✅ `src/lib/cron/export-log-cleanup.ts`
- ✅ Cron configuration (vercel.json or Supabase cron)
- ✅ Monitoring dashboard screenshot (if implemented)

++++++++++++++++++


## Quality Validation Checklist

### Post-Implementation Verification

After completing all 6 prompts, verify the following:

#### Functional Completeness
- [ ] **Database Schema**: Export_logs table exists with all columns, indexes, RLS policies
- [ ] **Service Layer**: ExportService implements all CRUD operations with error handling
- [ ] **Transformers**: All 4 formats (JSONL, JSON, CSV, Markdown) generate valid output
- [ ] **API Endpoints**: All 4 endpoints (create, status, download, history) functional
- [ ] **UI Components**: Export modal with scope, format, options, preview working
- [ ] **Operations**: Metrics collection and file cleanup jobs running

#### Integration Verification
- [ ] **End-to-End Export**: Can export conversations from UI through API to downloaded file
- [ ] **Filtering**: Scope filters (selected, filtered, all approved) apply correctly
- [ ] **Format Validation**: Each format passes validation and works with target systems
- [ ] **Authentication**: All endpoints respect RLS and user permissions
- [ ] **Error States**: Clear error messages for common failures (no conversations, invalid config)

#### Performance Requirements
- [ ] **Small Exports (<100)**: Complete within 5 seconds
- [ ] **Medium Exports (100-500)**: Complete within 30 seconds
- [ ] **Large Exports (≥500)**: Queue background job, status endpoint shows progress
- [ ] **Download Speed**: Files stream efficiently, no memory issues with large files
- [ ] **Query Performance**: Database queries use indexes, respond in <500ms

#### Quality Standards
- [ ] **TypeScript**: All code type-checks with strict mode enabled
- [ ] **Error Handling**: Try-catch blocks in all async operations
- [ ] **Logging**: Structured logging for debugging and monitoring
- [ ] **Documentation**: JSDoc comments on all public methods
- [ ] **Testing**: Manual test evidence for all major workflows

#### Security Considerations
- [ ] **Authentication**: All API endpoints require valid auth token
- [ ] **Authorization**: Users can only access their own exports (RLS)
- [ ] **Input Validation**: Zod schemas validate all API request bodies
- [ ] **SQL Injection**: Using parameterized queries via Supabase client
- [ ] **File Access**: Download endpoint validates user ownership before serving files

#### User Experience
- [ ] **Modal Accessibility**: Keyboard navigation (Tab, Enter, Esc) works
- [ ] **Loading States**: Spinners/progress indicators during async operations
- [ ] **Error Messages**: User-friendly, actionable error messages
- [ ] **Success Feedback**: Toast notifications confirm successful exports
- [ ] **Preview Accuracy**: Export preview matches actual downloaded file

### Cross-Prompt Consistency

#### Naming Conventions
- [ ] File names use kebab-case: `export-service.ts`, `jsonl-transformer.ts`
- [ ] Component names use PascalCase: `ExportModal`, `ExportScopeSelector`
- [ ] Function names use camelCase: `createExportLog`, `getTransformer`
- [ ] Database tables use snake_case: `export_logs`, `conversation_turns`

#### Architectural Patterns
- [ ] Service layer pattern used consistently (ExportService)
- [ ] Strategy pattern for transformers (IExportTransformer interface)
- [ ] Factory pattern for transformer instantiation (getTransformer)
- [ ] Repository pattern for database access (Supabase client abstraction)

#### Type Definitions
- [ ] All types defined in `train-wireframe/src/lib/types.ts` or local types.ts
- [ ] No use of `any` except for Record<string, any> metadata
- [ ] Interfaces preferred over types for extensibility
- [ ] Enums used for constrained string values (status, format)

#### Error Handling
- [ ] Custom error classes extend Error (ExportNotFoundError)
- [ ] Errors logged with console.error, not console.log
- [ ] API errors return appropriate HTTP status codes (400, 401, 403, 404, 500)
- [ ] User-facing errors don't expose internal details

### Deployment Readiness

#### Environment Configuration
- [ ] Environment variables documented (.env.example)
- [ ] Supabase URL and anon key configured
- [ ] File storage configuration (Supabase Storage or /tmp)
- [ ] Cron job schedule configured (vercel.json)

#### Database Migrations
- [ ] Export_logs table migration tested in staging
- [ ] Rollback script prepared for migration
- [ ] Indexes verified with EXPLAIN ANALYZE
- [ ] RLS policies tested with multiple users

#### Monitoring Setup
- [ ] Export metrics logged to monitoring system
- [ ] Failure alerts configured (>10% failure rate)
- [ ] Storage usage alerts configured
- [ ] Cron job execution monitored

#### Documentation
- [ ] API endpoints documented (request/response schemas)
- [ ] Export formats documented with examples
- [ ] User guide for export modal (optional)
- [ ] Troubleshooting guide for common issues

---

## Next Segment Preparation

### Dependencies for Future Segments

**E06 (if exists) may depend on:**
- Export history data for analytics
- Export logs for compliance reporting
- File storage patterns for other features

### Technical Debt to Address

1. **Streaming Optimization**: Current implementation loads all conversations into memory; future enhancement should use Node.js streams for very large datasets (>1000 conversations)
2. **File Compression**: Add automatic compression for large exports using gzip
3. **Format Versioning**: Add schema versioning to JSON exports for backward compatibility
4. **Export Templates**: Add saved export configurations (preset filters + format)
5. **Scheduled Exports**: Add ability to schedule recurring exports

### Monitoring and Metrics

**Track for 30 days post-launch:**
- Export success rate (target: >95%)
- Average export duration by format and size
- Storage costs (file size * retention time)
- User adoption (% of users using export feature)
- Format distribution (which formats are most popular)

**Alert Thresholds:**
- Export failure rate >10%: Investigate immediately
- Average export duration >60s for <100 conversations: Performance issue
- Storage usage >10GB: Consider shorter retention period

---

## Implementation Summary

**Total Prompts**: 6  
**Estimated Total Time**: 60-80 hours  
**Risk Level**: Medium (mostly low-risk tasks with some medium-risk areas)

**Prompt Breakdown:**
1. **Prompt 1** (6-8h): Database foundation and export service layer
2. **Prompt 2** (10-12h): JSONL and JSON transformers (core formats)
3. **Prompt 3** (8-10h): CSV and Markdown transformers (additional formats)
4. **Prompt 4** (14-16h): API endpoints (backend integration)
5. **Prompt 5** (12-14h): UI components (export modal enhancement)
6. **Prompt 6** (8-10h): Operations and monitoring (production readiness)

**Critical Success Factors:**
- JSONL format must match OpenAI/Anthropic specifications exactly
- CSV escaping must handle all edge cases (quotes, commas, newlines)
- Large exports (≥500) must use background processing to avoid timeouts
- RLS policies must prevent cross-user export access
- File cleanup must run reliably to control storage costs

**Quality Gates:**
- All TypeScript strict mode type checks pass
- All manual test cases execute successfully
- Export modal fully functional in UI
- API endpoints tested with Postman/Thunder Client
- Export files validated with target systems (Excel, LoRA training pipeline)

This implementation guide provides complete, executable instructions for building the Export System (E05) using Claude-4.5-sonnet in 200k token context windows. Each prompt is self-contained, includes comprehensive context, and specifies exact acceptance criteria and validation procedures.

---

**End of E05 Implementation Execution Instructions**


