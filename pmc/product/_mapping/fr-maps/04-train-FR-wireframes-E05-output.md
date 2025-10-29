# Train Data Module - Feature & Function Task Inventory
**Generated:** 2025-10-28  
**Source FR Document:** `04-train-FR-wireframes-E05.md`  
**Scope:** Export System (FR5.1.1, FR5.1.2, FR5.2.1, FR5.2.2)  
**Wireframe Codebase:** `train-wireframe/src/`

---

## Executive Summary

This task inventory provides a comprehensive breakdown of all features and functions required to implement the Export System for the Interactive LoRA Conversation Generation Module. The system enables users to export training conversation data in multiple formats (JSONL, JSON, CSV, Markdown) with flexible filtering, background processing for large datasets, and complete audit trails for compliance.

### Scope Overview
- **Total Main Tasks:** 24
- **Total Sub-tasks:** 72
- **Estimated Total Hours:** 180-240 hours
- **Target Completion:** 6-8 weeks (2 engineers)

### Key Deliverables
1. Multi-format export system (JSONL, JSON, CSV, Markdown)
2. Advanced filtering and selection capabilities
3. Background processing for large exports (>500 conversations)
4. Complete audit trail and compliance reporting
5. Export history and retry functionality
6. Integration with conversation data model and quality metrics

---

## 1. Foundation & Infrastructure

### T-1.1.0: Export Database Schema
- **FR Reference**: FR5.2.2
- **Impact Weighting**: Data Integrity / Compliance
- **Implementation Location**: Database migrations, `src/lib/database.ts`
- **Pattern**: Normalized relational schema with audit logging
- **Dependencies**: None (foundation)
- **Estimated Human Work Hours**: 8-12 hours
- **Description**: Create database tables and indexes to support export operations, history tracking, and audit logging
- **Testing Tools**: PostgreSQL, Supabase migrations, Jest for integration tests
- **Test Coverage Requirements**: 90%+ coverage for data integrity
- **Completes Component?**: Yes - Provides persistent storage for all export metadata and audit trails

**Functional Requirements Acceptance Criteria**:
- Export_logs table with columns: id (UUID), export_id (UUID), user_id (UUID FK), timestamp (timestamptz), format (enum), config (JSONB), conversation_count (integer), file_size (bigint), status (enum), file_url (text), expires_at (timestamptz), error_message (text)
- Status enum values: 'queued', 'processing', 'completed', 'failed', 'expired'
- Format enum values: 'json', 'jsonl', 'csv', 'markdown'
- JSONB config field stores: scope, filters, sort order, include/exclude options
- Indexes on: user_id, timestamp (DESC), status, format, export_id
- Foreign key constraint: user_id references auth.users(id) ON DELETE CASCADE
- Row Level Security (RLS) policies: users can only access their own export logs
- Audit trail requirements: all log entries are append-only (no UPDATE/DELETE)
- Retention policy enforced via scheduled job: delete logs older than 30 days
- File URL field stores temporary signed URLs expiring after 24 hours

#### T-1.1.1: Create Export Logs Table Migration
- **FR Reference**: FR5.2.2
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/YYYYMMDD_create_export_logs.sql`
- **Pattern**: Supabase migration with up/down functions
- **Dependencies**: auth.users table must exist
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: SQL migration creating export_logs table with proper constraints, indexes, and RLS policies

**Components/Elements**:
- [T-1.1.1:ELE-1] Export logs table schema: DDL statement with all columns, constraints, and default values
  - Stubs and Code Location(s): `supabase/migrations/` (new file)
- [T-1.1.1:ELE-2] Indexes for query optimization: Btree indexes on frequently queried fields
  - Stubs and Code Location(s): Same migration file
- [T-1.1.1:ELE-3] RLS policies: User-scoped access control policies
  - Stubs and Code Location(s): Same migration file
- [T-1.1.1:ELE-4] Migration rollback: Down function to safely revert changes
  - Stubs and Code Location(s): Same migration file

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing database schema and naming conventions (implements ELE-1)
   - [PREP-2] Design export_logs table structure with all required fields (implements ELE-1)
   - [PREP-3] Identify query patterns for index optimization (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Write SQL migration creating export_logs table (implements ELE-1)
   - [IMP-2] Add btree indexes on user_id, timestamp, status, format (implements ELE-2)
   - [IMP-3] Create RLS policies for user-scoped access (implements ELE-3)
   - [IMP-4] Write down migration function for rollback (implements ELE-4)
   - [IMP-5] Test migration in development environment
3. Validation Phase:
   - [VAL-1] Verify table created with correct structure (validates ELE-1)
   - [VAL-2] Test index usage with EXPLAIN queries (validates ELE-2)
   - [VAL-3] Validate RLS policies prevent cross-user access (validates ELE-3)
   - [VAL-4] Test migration rollback functionality (validates ELE-4)

#### T-1.1.2: Implement Export Service Layer
- **FR Reference**: FR5.1.1, FR5.2.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `src/lib/export-service.ts` (new file)
- **Pattern**: Service layer abstraction with TypeScript interfaces
- **Dependencies**: T-1.1.1 (database schema)
- **Estimated Human Work Hours**: 5-8 hours
- **Description**: Create service layer providing CRUD operations for export logs with proper error handling

**Components/Elements**:
- [T-1.1.2:ELE-1] ExportService class: TypeScript class with methods for log operations
  - Stubs and Code Location(s): `src/lib/export-service.ts` (new file)
- [T-1.1.2:ELE-2] Type definitions: TypeScript interfaces matching database schema
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:181-194` (ExportConfig type reference)
- [T-1.1.2:ELE-3] Error handling: Custom error classes for export failures
  - Stubs and Code Location(s): `src/lib/export-service.ts`
- [T-1.1.2:ELE-4] Logging integration: Structured logging for all export operations
  - Stubs and Code Location(s): `src/lib/export-service.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define TypeScript interfaces for export log entities (implements ELE-2)
   - [PREP-2] Design service method signatures (createLog, getLog, listLogs, updateStatus) (implements ELE-1)
   - [PREP-3] Define custom error types (ExportNotFoundError, ExportFailedError) (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Implement ExportService class with Supabase client injection (implements ELE-1)
   - [IMP-2] Create methods: createExportLog, getExportLog, listExportLogs, updateExportStatus (implements ELE-1)
   - [IMP-3] Add error handling with try-catch and custom error throwing (implements ELE-3)
   - [IMP-4] Integrate structured logging for all operations (implements ELE-4)
   - [IMP-5] Add JSDoc documentation for all public methods
3. Validation Phase:
   - [VAL-1] Write unit tests for each service method (validates ELE-1)
   - [VAL-2] Test error scenarios (not found, permission denied, database error) (validates ELE-3)
   - [VAL-3] Verify logging output for audit trails (validates ELE-4)
   - [VAL-4] Test with TypeScript strict mode enabled (validates ELE-2)

---

## 2. Data Management & Processing

### T-2.1.0: Export Data Transformation Engine
- **FR Reference**: FR5.1.1
- **Impact Weighting**: Data Portability / Integration
- **Implementation Location**: `src/lib/export-transformers/` (new directory)
- **Pattern**: Strategy pattern for format-specific transformers
- **Dependencies**: T-1.1.2 (export service), conversation data model
- **Estimated Human Work Hours**: 20-28 hours
- **Description**: Implement format-specific transformers to convert conversation data into JSONL, JSON, CSV, and Markdown formats
- **Testing Tools**: Jest, snapshot testing for format consistency
- **Test Coverage Requirements**: 85%+ coverage for transformation logic
- **Completes Component?**: Yes - Provides complete data transformation pipeline for all supported export formats

**Functional Requirements Acceptance Criteria**:
- JSONL format: One conversation per line, newline-delimited JSON following OpenAI fine-tuning format
- JSON format: Array of conversation objects with complete metadata
- CSV format: Flattened structure with one turn per row, includes conversation metadata columns
- Markdown format: Human-readable dialogue format with headers and formatting
- All formats support configurable inclusion of: metadata, quality scores, timestamps, approval history, parent references
- Transformer interface: Consistent API across all format implementations
- Streaming support for large datasets (>1000 conversations) to manage memory
- Character encoding: UTF-8 with BOM for CSV compatibility
- Date formatting: ISO 8601 format for all timestamp fields
- Error handling: Graceful handling of malformed data with detailed error messages

#### T-2.1.1: Implement JSONL Transformer
- **FR Reference**: FR5.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/export-transformers/jsonl-transformer.ts` (new file)
- **Pattern**: Transformer class implementing IExportTransformer interface
- **Dependencies**: Conversation type definitions
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Transform conversation data into JSONL format suitable for LoRA training (OpenAI/Anthropic format)

**Components/Elements**:
- [T-2.1.1:ELE-1] JSONLTransformer class: Implements IExportTransformer interface
  - Stubs and Code Location(s): `src/lib/export-transformers/jsonl-transformer.ts` (new file)
- [T-2.1.1:ELE-2] Conversation-to-JSONL mapping: Transforms conversation turns into training format
  - Stubs and Code Location(s): Same file, transformConversation method
- [T-2.1.1:ELE-3] Streaming writer: Handles large datasets without loading all data into memory
  - Stubs and Code Location(s): Same file, using Node.js streams
- [T-2.1.1:ELE-4] Format validation: Ensures output conforms to JSONL specification
  - Stubs and Code Location(s): Same file, validation utility functions

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research OpenAI fine-tuning JSONL format specification (implements ELE-2)
   - [PREP-2] Define IExportTransformer interface (implements ELE-1)
   - [PREP-3] Design streaming architecture using Node.js streams (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create JSONLTransformer class implementing interface (implements ELE-1)
   - [IMP-2] Implement transformConversation method mapping turns to messages array (implements ELE-2)
   - [IMP-3] Add streaming writer using fs.createWriteStream (implements ELE-3)
   - [IMP-4] Implement format validation checking required fields (implements ELE-4)
   - [IMP-5] Add configuration support for includeMetadata, includeSystemPrompts flags
3. Validation Phase:
   - [VAL-1] Test with sample conversations verifying JSONL format (validates ELE-2)
   - [VAL-2] Test streaming with 1000+ conversations checking memory usage (validates ELE-3)
   - [VAL-3] Validate output against OpenAI/Anthropic format spec (validates ELE-4)
   - [VAL-4] Test error handling for malformed conversation data (validates ELE-1)

#### T-2.1.2: Implement JSON Transformer
- **FR Reference**: FR5.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/export-transformers/json-transformer.ts` (new file)
- **Pattern**: Transformer class implementing IExportTransformer interface
- **Dependencies**: Conversation type definitions
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Transform conversation data into structured JSON array format with complete metadata

**Components/Elements**:
- [T-2.1.2:ELE-1] JSONTransformer class: Implements IExportTransformer interface
  - Stubs and Code Location(s): `src/lib/export-transformers/json-transformer.ts` (new file)
- [T-2.1.2:ELE-2] Metadata inclusion logic: Conditional inclusion of metadata fields based on config
  - Stubs and Code Location(s): Same file, metadata filtering methods
- [T-2.1.2:ELE-3] Pretty printing option: Configurable JSON formatting for readability
  - Stubs and Code Location(s): Same file, JSON.stringify with spacing parameter
- [T-2.1.2:ELE-4] Schema versioning: Include schema version in export for future compatibility
  - Stubs and Code Location(s): Same file, metadata header

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define JSON output schema structure (implements ELE-1)
   - [PREP-2] Design metadata filtering configuration options (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create JSONTransformer class (implements ELE-1)
   - [IMP-2] Implement metadata filtering based on ExportConfig flags (implements ELE-2)
   - [IMP-3] Add pretty print option using JSON.stringify(data, null, 2) (implements ELE-3)
   - [IMP-4] Include schema version in export header (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test JSON output is valid and parseable (validates ELE-1)
   - [VAL-2] Verify metadata filtering excludes configured fields (validates ELE-2)
   - [VAL-3] Test pretty print vs minified output (validates ELE-3)
   - [VAL-4] Validate schema version is included (validates ELE-4)

#### T-2.1.3: Implement CSV Transformer
- **FR Reference**: FR5.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/export-transformers/csv-transformer.ts` (new file)
- **Pattern**: Transformer class implementing IExportTransformer interface
- **Dependencies**: Conversation type definitions, csv-stringify library
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Transform conversation data into CSV format with flattened structure (one turn per row)

**Components/Elements**:
- [T-2.1.3:ELE-1] CSVTransformer class: Implements IExportTransformer interface
  - Stubs and Code Location(s): `src/lib/export-transformers/csv-transformer.ts` (new file)
- [T-2.1.3:ELE-2] Data flattening logic: Converts nested conversation turns to flat rows
  - Stubs and Code Location(s): Same file, flattenConversation method
- [T-2.1.3:ELE-3] CSV formatting: Proper escaping of quotes, newlines, and commas
  - Stubs and Code Location(s): Using csv-stringify library
- [T-2.1.3:ELE-4] Header row generation: Dynamic headers based on included metadata fields
  - Stubs and Code Location(s): Same file, generateHeaders method

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design CSV schema with columns for conversation metadata and turn data (implements ELE-2)
   - [PREP-2] Research CSV escaping rules and edge cases (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create CSVTransformer class (implements ELE-1)
   - [IMP-2] Implement flattenConversation creating one row per turn (implements ELE-2)
   - [IMP-3] Integrate csv-stringify for proper formatting and escaping (implements ELE-3)
   - [IMP-4] Generate dynamic header row based on ExportConfig (implements ELE-4)
   - [IMP-5] Add UTF-8 BOM for Excel compatibility
3. Validation Phase:
   - [VAL-1] Test CSV output imports correctly into Excel and Google Sheets (validates ELE-3)
   - [VAL-2] Verify flattening creates correct number of rows (validates ELE-2)
   - [VAL-3] Test with special characters (quotes, newlines, commas) (validates ELE-3)
   - [VAL-4] Validate header row matches data columns (validates ELE-4)

#### T-2.1.4: Implement Markdown Transformer
- **FR Reference**: FR5.1.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/lib/export-transformers/markdown-transformer.ts` (new file)
- **Pattern**: Transformer class implementing IExportTransformer interface
- **Dependencies**: Conversation type definitions
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Transform conversation data into human-readable Markdown format for review

**Components/Elements**:
- [T-2.1.4:ELE-1] MarkdownTransformer class: Implements IExportTransformer interface
  - Stubs and Code Location(s): `src/lib/export-transformers/markdown-transformer.ts` (new file)
- [T-2.1.4:ELE-2] Markdown formatting: Proper headers, blockquotes, and code blocks
  - Stubs and Code Location(s): Same file, formatConversation method
- [T-2.1.4:ELE-3] Metadata rendering: Formatted table or list showing conversation metadata
  - Stubs and Code Location(s): Same file, renderMetadata method
- [T-2.1.4:ELE-4] Turn formatting: User/assistant differentiation with clear visual separation
  - Stubs and Code Location(s): Same file, formatTurn method

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design Markdown template for conversation display (implements ELE-2)
   - [PREP-2] Define metadata rendering format (table vs list) (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create MarkdownTransformer class (implements ELE-1)
   - [IMP-2] Implement formatConversation with headers and sections (implements ELE-2)
   - [IMP-3] Add renderMetadata creating markdown table (implements ELE-3)
   - [IMP-4] Implement formatTurn with user/assistant labels and blockquotes (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test markdown renders correctly in GitHub/VS Code (validates ELE-2)
   - [VAL-2] Verify metadata table formatting (validates ELE-3)
   - [VAL-3] Test turn formatting with long content (validates ELE-4)

---

## 3. User Interface Components

### T-3.1.0: Export Modal Component
- **FR Reference**: FR5.1.1, FR5.1.2
- **Impact Weighting**: User Experience / Workflow Efficiency
- **Implementation Location**: `train-wireframe/src/components/dashboard/ExportModal.tsx`
- **Pattern**: React component with Zustand state management
- **Dependencies**: FilterBar, ConversationTable, ExportConfig types
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Build complete export modal UI with format selection, filtering, preview, and download functionality
- **Testing Tools**: React Testing Library, Cypress for E2E
- **Test Coverage Requirements**: 80%+ coverage for user interactions
- **Completes Component?**: Yes - Provides complete user-facing export interface

**Functional Requirements Acceptance Criteria**:
- Modal opens when user clicks "Export" button in dashboard header
  Code Reference: `train-wireframe/src/components/dashboard/FilterBar.tsx:211-214`
- Export scope selector: radio group with options (Selected, Current Filters, All Approved, All Data)
  Code Reference: `train-wireframe/src/lib/types.ts:206` (ExportConfig scope type)
- Format selector: radio group or dropdown with descriptions for each format
  Code Reference: `train-wireframe/src/lib/types.ts:207` (format type)
- Advanced options panel: checkboxes for includeMetadata, includeQualityScores, includeTimestamps, includeApprovalHistory, includeParentReferences, includeFullContent
  Code Reference: `train-wireframe/src/lib/types.ts:208-213`
- Conversation count display: Dynamic count updating based on selected scope and filters
- Preview section: Shows first 3 conversations in selected format
- Download button: Triggers export generation and file download
- Loading state: Progress indicator during export generation
- Error handling: Clear error messages for failed exports
- Close/cancel button: Returns user to dashboard without exporting

#### T-3.1.1: Export Scope Selector
- **FR Reference**: FR5.1.2
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/export/ExportScopeSelector.tsx` (new component)
- **Pattern**: Radio group component with dynamic conversation counts
- **Dependencies**: useAppStore for conversation and selection state
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Radio group allowing users to select export scope with real-time conversation counts

**Components/Elements**:
- [T-3.1.1:ELE-1] ExportScopeSelector component: React functional component
  - Stubs and Code Location(s): New component file
- [T-3.1.1:ELE-2] Scope options: Selected, Current Filters, All Approved, All Data
  - Stubs and Code Location(s): Component JSX with RadioGroup
- [T-3.1.1:ELE-3] Dynamic count calculation: Real-time updates based on store state
  - Stubs and Code Location(s): useMemo hook calculating counts
- [T-3.1.1:ELE-4] Visual indicators: Badge showing count next to each option
  - Stubs and Code Location(s): Badge component from UI library

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define component props interface (onChange callback, value) (implements ELE-1)
   - [PREP-2] Design layout for radio group with labels and badges (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create ExportScopeSelector component (implements ELE-1)
   - [IMP-2] Implement radio group with 4 scope options (implements ELE-2)
   - [IMP-3] Add useMemo hooks calculating counts for each scope (implements ELE-3)
   - [IMP-4] Integrate Badge components showing counts (implements ELE-4)
   - [IMP-5] Connect onChange handler to parent modal state
3. Validation Phase:
   - [VAL-1] Test count updates when selection changes (validates ELE-3)
   - [VAL-2] Test count updates when filters change (validates ELE-3)
   - [VAL-3] Verify radio group selection behavior (validates ELE-2)
   - [VAL-4] Test accessibility (keyboard navigation, ARIA labels) (validates ELE-1)

#### T-3.1.2: Export Format Selector
- **FR Reference**: FR5.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/export/ExportFormatSelector.tsx` (new component)
- **Pattern**: Radio group with format descriptions
- **Dependencies**: ExportConfig types
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Radio group for selecting export format with helpful descriptions for each option

**Components/Elements**:
- [T-3.1.2:ELE-1] ExportFormatSelector component: React functional component
  - Stubs and Code Location(s): New component file
- [T-3.1.2:ELE-2] Format options with descriptions: JSONL (LoRA training), JSON (structured data), CSV (analysis), Markdown (review)
  - Stubs and Code Location(s): Component constants and JSX
- [T-3.1.2:ELE-3] Format icons: Visual indicators for each format
  - Stubs and Code Location(s): Lucide React icons
- [T-3.1.2:ELE-4] Recommended format indicator: Highlight JSONL as recommended for training
  - Stubs and Code Location(s): Badge or chip component

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design format option cards with icons and descriptions (implements ELE-2)
   - [PREP-2] Select appropriate icons for each format (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create ExportFormatSelector component (implements ELE-1)
   - [IMP-2] Implement radio group with 4 format options (implements ELE-2)
   - [IMP-3] Add icons from Lucide React (FileText, FileJson, FileSpreadsheet, FileType) (implements ELE-3)
   - [IMP-4] Add "Recommended" badge to JSONL option (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test radio group selection (validates ELE-1)
   - [VAL-2] Verify descriptions are clear and helpful (validates ELE-2)
   - [VAL-3] Test visual appearance across formats (validates ELE-3)

#### T-3.1.3: Export Options Panel
- **FR Reference**: FR5.1.2
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/export/ExportOptionsPanel.tsx` (new component)
- **Pattern**: Accordion panel with checkboxes
- **Dependencies**: ExportConfig types
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Collapsible panel with checkboxes for advanced export options

**Components/Elements**:
- [T-3.1.3:ELE-1] ExportOptionsPanel component: React functional component with Accordion
  - Stubs and Code Location(s): New component file
- [T-3.1.3:ELE-2] Option checkboxes: includeMetadata, includeQualityScores, includeTimestamps, includeApprovalHistory, includeParentReferences, includeFullContent
  - Stubs and Code Location(s): Checkbox components
- [T-3.1.3:ELE-3] Help text: Tooltip or description for each option
  - Stubs and Code Location(s): Tooltip components
- [T-3.1.3:ELE-4] Default presets: Button to reset to recommended defaults
  - Stubs and Code Location(s): Button component

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define default values for each option (implements ELE-2)
   - [PREP-2] Write help text explaining each option (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create ExportOptionsPanel component with Accordion (implements ELE-1)
   - [IMP-2] Add 6 checkbox options with labels (implements ELE-2)
   - [IMP-3] Integrate Tooltip components with help text (implements ELE-3)
   - [IMP-4] Add "Reset to Defaults" button (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test checkbox state management (validates ELE-2)
   - [VAL-2] Verify tooltips display correctly (validates ELE-3)
   - [VAL-3] Test reset to defaults functionality (validates ELE-4)

#### T-3.1.4: Export Preview Section
- **FR Reference**: FR5.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `train-wireframe/src/components/export/ExportPreview.tsx` (new component)
- **Pattern**: Code block with syntax highlighting
- **Dependencies**: react-syntax-highlighter or similar library
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: Preview section showing first 3 conversations in selected format before export

**Components/Elements**:
- [T-3.1.4:ELE-1] ExportPreview component: React functional component
  - Stubs and Code Location(s): New component file
- [T-3.1.4:ELE-2] Format-specific rendering: Different display logic for JSONL, JSON, CSV, Markdown
  - Stubs and Code Location(s): Conditional rendering based on format
- [T-3.1.4:ELE-3] Syntax highlighting: Color-coded display for JSON/JSONL formats
  - Stubs and Code Location(s): react-syntax-highlighter
- [T-3.1.4:ELE-4] Copy to clipboard: Button to copy preview content
  - Stubs and Code Location(s): Copy button with clipboard API

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Install and configure syntax highlighter library (implements ELE-3)
   - [PREP-2] Design preview layout with scroll container (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create ExportPreview component (implements ELE-1)
   - [IMP-2] Implement format-specific rendering logic (implements ELE-2)
   - [IMP-3] Integrate react-syntax-highlighter for JSON/JSONL (implements ELE-3)
   - [IMP-4] Add copy to clipboard button using navigator.clipboard API (implements ELE-4)
   - [IMP-5] Limit preview to first 3 conversations for performance
3. Validation Phase:
   - [VAL-1] Test preview updates when format changes (validates ELE-2)
   - [VAL-2] Verify syntax highlighting displays correctly (validates ELE-3)
   - [VAL-3] Test copy to clipboard functionality (validates ELE-4)
   - [VAL-4] Test with edge cases (empty data, single conversation) (validates ELE-1)

---

## 4. Feature Implementation

### T-4.1.0: Export API Endpoints
- **FR Reference**: FR5.1.1, FR5.1.2, FR5.2.1
- **Impact Weighting**: Core Functionality / Integration
- **Implementation Location**: `src/app/api/export/` (new directory)
- **Pattern**: Next.js API routes with server-side processing
- **Dependencies**: T-2.1.0 (transformers), T-1.1.2 (export service)
- **Estimated Human Work Hours**: 24-32 hours
- **Description**: Create API endpoints handling export requests, data filtering, transformation, and file generation
- **Testing Tools**: Jest, Supertest for API testing, Postman for manual testing
- **Test Coverage Requirements**: 85%+ coverage for business logic
- **Completes Component?**: Yes - Provides complete backend API for export functionality

**Functional Requirements Acceptance Criteria**:
- POST /api/export/conversations: Initiates export based on ExportConfig
- GET /api/export/status/:id: Returns current status of export job
- GET /api/export/download/:id: Returns download URL or file stream
- GET /api/export/history: Lists all exports for current user
- DELETE /api/export/:id: Cancels or deletes export
- Authentication required for all endpoints using Supabase auth
- Request validation using Zod schemas
- Rate limiting: Max 10 export requests per hour per user
- Response format: JSON with consistent error structure
- File storage: Temporary files in /tmp with cleanup after 24 hours

#### T-4.1.1: Create Export Request Endpoint
- **FR Reference**: FR5.1.1, FR5.1.2
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/app/api/export/conversations/route.ts` (new file)
- **Pattern**: Next.js API route handler (POST)
- **Dependencies**: Export transformers, conversation service
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: API endpoint accepting export configuration and initiating export process

**Components/Elements**:
- [T-4.1.1:ELE-1] Request validation: Zod schema validating ExportConfig
  - Stubs and Code Location(s): `src/app/api/export/conversations/route.ts`
- [T-4.1.1:ELE-2] Filter application: Apply scope and filters to query conversations
  - Stubs and Code Location(s): Same file, filtering logic
- [T-4.1.1:ELE-3] Small export handling: Synchronous processing for <500 conversations
  - Stubs and Code Location(s): Same file, conditional processing
- [T-4.1.1:ELE-4] Large export handling: Queue batch job for ≥500 conversations
  - Stubs and Code Location(s): Integration with BatchJob system
- [T-4.1.1:ELE-5] Export log creation: Create audit log entry
  - Stubs and Code Location(s): ExportService.createExportLog call

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define Zod schema for ExportConfig validation (implements ELE-1)
   - [PREP-2] Design query logic for different scopes (selected, filtered, all) (implements ELE-2)
   - [PREP-3] Determine threshold for small vs large exports (implements ELE-3, ELE-4)
2. Implementation Phase:
   - [IMP-1] Create POST route handler in route.ts (implements ELE-1)
   - [IMP-2] Implement request validation with Zod (implements ELE-1)
   - [IMP-3] Add authentication check using Supabase auth (implements ELE-1)
   - [IMP-4] Implement filter application logic (implements ELE-2)
   - [IMP-5] Add conditional processing: <500 = sync, ≥500 = queue (implements ELE-3, ELE-4)
   - [IMP-6] Create export log entry (implements ELE-5)
   - [IMP-7] Return export_id and status in response
3. Validation Phase:
   - [VAL-1] Test with valid ExportConfig (validates ELE-1)
   - [VAL-2] Test with invalid config expecting validation errors (validates ELE-1)
   - [VAL-3] Test filter application returns correct conversations (validates ELE-2)
   - [VAL-4] Test small export completes synchronously (validates ELE-3)
   - [VAL-5] Test large export creates batch job (validates ELE-4)
   - [VAL-6] Verify export log created with correct data (validates ELE-5)

#### T-4.1.2: Create Export Status Endpoint
- **FR Reference**: FR5.2.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/app/api/export/status/[id]/route.ts` (new file)
- **Pattern**: Next.js API route handler (GET)
- **Dependencies**: Export service
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: API endpoint returning current status of export job for progress tracking

**Components/Elements**:
- [T-4.1.2:ELE-1] Export status retrieval: Query export log by ID
  - Stubs and Code Location(s): `src/app/api/export/status/[id]/route.ts`
- [T-4.1.2:ELE-2] Progress calculation: Calculate percentage for batch jobs
  - Stubs and Code Location(s): Integration with BatchJob system
- [T-4.1.2:ELE-3] Authorization check: Ensure user owns export
  - Stubs and Code Location(s): RLS policy enforcement
- [T-4.1.2:ELE-4] Response formatting: Standardized status response
  - Stubs and Code Location(s): TypeScript interface for response

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define status response interface (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Create GET route handler (implements ELE-1)
   - [IMP-2] Retrieve export log by ID (implements ELE-1)
   - [IMP-3] Check user authorization (implements ELE-3)
   - [IMP-4] Calculate progress percentage for batch jobs (implements ELE-2)
   - [IMP-5] Return formatted status response (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test status retrieval for valid export_id (validates ELE-1)
   - [VAL-2] Test 404 error for invalid export_id (validates ELE-1)
   - [VAL-3] Test 403 error when user doesn't own export (validates ELE-3)
   - [VAL-4] Test progress calculation for batch jobs (validates ELE-2)

#### T-4.1.3: Create Export Download Endpoint
- **FR Reference**: FR5.2.1
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/app/api/export/download/[id]/route.ts` (new file)
- **Pattern**: Next.js API route handler (GET) with file streaming
- **Dependencies**: Export service, file storage
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: API endpoint providing download URL or file stream for completed exports

**Components/Elements**:
- [T-4.1.3:ELE-1] Export completion check: Verify export status is 'completed'
  - Stubs and Code Location(s): `src/app/api/export/download/[id]/route.ts`
- [T-4.1.3:ELE-2] File retrieval: Load export file from storage
  - Stubs and Code Location(s): File system or cloud storage integration
- [T-4.1.3:ELE-3] Signed URL generation: Create temporary download URL expiring in 24 hours
  - Stubs and Code Location(s): Supabase Storage signed URL
- [T-4.1.3:ELE-4] File streaming: Stream large files to client
  - Stubs and Code Location(s): Node.js ReadStream
- [T-4.1.3:ELE-5] Content-Disposition header: Set filename for download
  - Stubs and Code Location(s): Response headers

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design file naming convention (implements ELE-5)
   - [PREP-2] Choose storage solution (local /tmp vs Supabase Storage) (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create GET route handler (implements ELE-1)
   - [IMP-2] Check export status is 'completed' (implements ELE-1)
   - [IMP-3] Generate signed URL for Supabase Storage or stream file (implements ELE-3, ELE-4)
   - [IMP-4] Set Content-Disposition header with descriptive filename (implements ELE-5)
   - [IMP-5] Return signed URL or file stream
3. Validation Phase:
   - [VAL-1] Test download for completed export (validates ELE-2)
   - [VAL-2] Test error when export not completed (validates ELE-1)
   - [VAL-3] Test signed URL expires after 24 hours (validates ELE-3)
   - [VAL-4] Test file streaming for large files (validates ELE-4)
   - [VAL-5] Verify filename in Content-Disposition (validates ELE-5)

#### T-4.1.4: Create Export History Endpoint
- **FR Reference**: FR5.2.2
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/app/api/export/history/route.ts` (new file)
- **Pattern**: Next.js API route handler (GET) with pagination
- **Dependencies**: Export service
- **Estimated Human Work Hours**: 4-5 hours
- **Description**: API endpoint listing all exports for current user with pagination and filtering

**Components/Elements**:
- [T-4.1.4:ELE-1] User-scoped query: Retrieve only user's exports using RLS
  - Stubs and Code Location(s): `src/app/api/export/history/route.ts`
- [T-4.1.4:ELE-2] Pagination: Support page and limit query parameters
  - Stubs and Code Location(s): Query parameter parsing
- [T-4.1.4:ELE-3] Filtering: Support format, status, date range filters
  - Stubs and Code Location(s): Dynamic query building
- [T-4.1.4:ELE-4] Sorting: Sort by timestamp DESC (newest first)
  - Stubs and Code Location(s): ORDER BY clause

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define query parameters interface (implements ELE-2, ELE-3)
2. Implementation Phase:
   - [IMP-1] Create GET route handler (implements ELE-1)
   - [IMP-2] Parse pagination parameters (page, limit) (implements ELE-2)
   - [IMP-3] Parse filter parameters (format, status, dateFrom, dateTo) (implements ELE-3)
   - [IMP-4] Build dynamic query with filters (implements ELE-3)
   - [IMP-5] Add sorting by timestamp DESC (implements ELE-4)
   - [IMP-6] Return paginated results with total count
3. Validation Phase:
   - [VAL-1] Test retrieves only user's exports (validates ELE-1)
   - [VAL-2] Test pagination (page 1, page 2) (validates ELE-2)
   - [VAL-3] Test filtering by format (validates ELE-3)
   - [VAL-4] Test date range filtering (validates ELE-3)
   - [VAL-5] Verify sorting order (validates ELE-4)

---

## 5. Quality Assurance & Testing

### T-5.1.0: Unit Test Suite
- **FR Reference**: All FR5.x
- **Impact Weighting**: Quality / Reliability
- **Implementation Location**: `src/__tests__/` (new directory)
- **Pattern**: Jest unit tests with mocking
- **Dependencies**: All implementation tasks
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Comprehensive unit test suite covering all export functionality
- **Testing Tools**: Jest, React Testing Library
- **Test Coverage Requirements**: 85%+ line coverage, 80%+ branch coverage
- **Completes Component?**: Yes - Provides complete test coverage for export system

**Functional Requirements Acceptance Criteria**:
- Test coverage ≥85% for transformer classes
- Test coverage ≥80% for API endpoints
- Test coverage ≥80% for UI components
- All edge cases covered (empty data, malformed data, large datasets)
- Mock external dependencies (database, file system, API clients)
- Test error scenarios and error handling
- Performance tests for large datasets (>1000 conversations)
- Snapshot tests for UI components

#### T-5.1.1: Transformer Unit Tests
- **FR Reference**: FR5.1.1
- **Parent Task**: T-5.1.0
- **Implementation Location**: `src/__tests__/export-transformers/` (new directory)
- **Pattern**: Jest test suites for each transformer
- **Dependencies**: T-2.1.0 (transformers)
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Unit tests for JSONL, JSON, CSV, and Markdown transformers

**Components/Elements**:
- [T-5.1.1:ELE-1] JSONL transformer tests: Test conversation-to-JSONL transformation
  - Stubs and Code Location(s): `src/__tests__/export-transformers/jsonl-transformer.test.ts`
- [T-5.1.1:ELE-2] JSON transformer tests: Test JSON array output and metadata filtering
  - Stubs and Code Location(s): `src/__tests__/export-transformers/json-transformer.test.ts`
- [T-5.1.1:ELE-3] CSV transformer tests: Test flattening and escaping
  - Stubs and Code Location(s): `src/__tests__/export-transformers/csv-transformer.test.ts`
- [T-5.1.1:ELE-4] Markdown transformer tests: Test formatting and readability
  - Stubs and Code Location(s): `src/__tests__/export-transformers/markdown-transformer.test.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Create sample conversation fixtures (implements all ELE)
   - [PREP-2] Define test cases for each transformer (implements all ELE)
2. Implementation Phase:
   - [IMP-1] Write JSONL transformer tests (implements ELE-1)
   - [IMP-2] Write JSON transformer tests (implements ELE-2)
   - [IMP-3] Write CSV transformer tests (implements ELE-3)
   - [IMP-4] Write Markdown transformer tests (implements ELE-4)
   - [IMP-5] Add edge case tests (empty data, single conversation, large datasets)
3. Validation Phase:
   - [VAL-1] Run tests and verify 85%+ coverage (validates all ELE)
   - [VAL-2] Test with various conversation structures (validates all ELE)

### T-5.2.0: Integration Test Suite
- **FR Reference**: All FR5.x
- **Impact Weighting**: Quality / Reliability
- **Implementation Location**: `src/__tests__/integration/` (new directory)
- **Pattern**: Jest integration tests with test database
- **Dependencies**: All implementation tasks
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Integration tests verifying end-to-end export workflows
- **Testing Tools**: Jest, Supertest, test Supabase instance
- **Test Coverage Requirements**: All critical workflows tested
- **Completes Component?**: Yes - Validates complete export system integration

**Functional Requirements Acceptance Criteria**:
- Test complete export workflow from API request to file download
- Test with real database using test Supabase instance
- Test authentication and authorization
- Test rate limiting and error handling
- Test background job processing for large exports
- Test export audit trail creation
- Test file cleanup after expiration
- Test concurrent export requests

#### T-5.2.1: API Integration Tests
- **FR Reference**: FR5.1.1, FR5.1.2, FR5.2.1
- **Parent Task**: T-5.2.0
- **Implementation Location**: `src/__tests__/integration/export-api.test.ts` (new file)
- **Pattern**: Supertest integration tests
- **Dependencies**: T-4.1.0 (API endpoints)
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Integration tests for export API endpoints with test database

**Components/Elements**:
- [T-5.2.1:ELE-1] Export request tests: Test POST /api/export/conversations
  - Stubs and Code Location(s): `src/__tests__/integration/export-api.test.ts`
- [T-5.2.1:ELE-2] Status check tests: Test GET /api/export/status/:id
  - Stubs and Code Location(s): Same file
- [T-5.2.1:ELE-3] Download tests: Test GET /api/export/download/:id
  - Stubs and Code Location(s): Same file
- [T-5.2.1:ELE-4] History tests: Test GET /api/export/history
  - Stubs and Code Location(s): Same file

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up test Supabase instance (implements all ELE)
   - [PREP-2] Create test data fixtures (implements all ELE)
2. Implementation Phase:
   - [IMP-1] Write export request integration tests (implements ELE-1)
   - [IMP-2] Write status check integration tests (implements ELE-2)
   - [IMP-3] Write download integration tests (implements ELE-3)
   - [IMP-4] Write history integration tests (implements ELE-4)
   - [IMP-5] Add authentication tests
   - [IMP-6] Add authorization tests
3. Validation Phase:
   - [VAL-1] Run full integration test suite (validates all ELE)
   - [VAL-2] Verify database state after each test (validates all ELE)

---

## 6. Deployment & Operations

### T-6.1.0: Export System Monitoring
- **FR Reference**: FR5.2.1, FR5.2.2
- **Impact Weighting**: Reliability / Observability
- **Implementation Location**: `src/lib/monitoring/export-metrics.ts` (new file)
- **Pattern**: Application metrics with logging
- **Dependencies**: Logging infrastructure
- **Estimated Human Work Hours**: 8-12 hours
- **Description**: Implement monitoring and alerting for export system health and performance
- **Testing Tools**: Manual testing, observability platform (Sentry, Datadog)
- **Test Coverage Requirements**: N/A (operational)
- **Completes Component?**: Yes - Provides complete observability for export system

**Functional Requirements Acceptance Criteria**:
- Export success rate metric (percentage of successful exports)
- Average export duration metric (by format and size)
- Export failure alerts when failure rate >10%
- Large export queue depth metric
- File storage usage metric
- API endpoint response time metrics
- User export volume metrics
- Scheduled job for file cleanup monitoring

#### T-6.1.1: Export Metrics Collection
- **FR Reference**: FR5.2.1
- **Parent Task**: T-6.1.0
- **Implementation Location**: `src/lib/monitoring/export-metrics.ts` (new file)
- **Pattern**: Custom metrics with timers and counters
- **Dependencies**: API endpoints, transformers
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Collect and log metrics for export operations

**Components/Elements**:
- [T-6.1.1:ELE-1] Metric collection: Track export counts, durations, sizes
  - Stubs and Code Location(s): `src/lib/monitoring/export-metrics.ts`
- [T-6.1.1:ELE-2] Timer utilities: Measure export processing time
  - Stubs and Code Location(s): Same file
- [T-6.1.1:ELE-3] Counter utilities: Track success/failure counts
  - Stubs and Code Location(s): Same file
- [T-6.1.1:ELE-4] Log aggregation: Send metrics to logging platform
  - Stubs and Code Location(s): Integration with logging service

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define metric names and types (implements ELE-1)
   - [PREP-2] Choose logging platform (Sentry, Datadog, CloudWatch) (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Create ExportMetrics class (implements ELE-1)
   - [IMP-2] Add timer utility for duration measurement (implements ELE-2)
   - [IMP-3] Add counter utilities for success/failure (implements ELE-3)
   - [IMP-4] Integrate with logging platform SDK (implements ELE-4)
   - [IMP-5] Instrument API endpoints with metric collection
3. Validation Phase:
   - [VAL-1] Verify metrics are collected during exports (validates ELE-1)
   - [VAL-2] Test timer accuracy (validates ELE-2)
   - [VAL-3] Verify metrics appear in logging platform (validates ELE-4)

### T-6.2.0: File Cleanup Jobs
- **FR Reference**: FR5.2.1, FR5.2.2
- **Impact Weighting**: Operations / Cost Control
- **Implementation Location**: `src/lib/cron/export-cleanup.ts` (new file)
- **Pattern**: Scheduled job (cron or edge function)
- **Dependencies**: Export service, file storage
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Scheduled jobs for cleaning up expired export files and audit logs
- **Testing Tools**: Manual testing, cron simulator
- **Test Coverage Requirements**: N/A (operational)
- **Completes Component?**: Yes - Provides automated cleanup for export system

**Functional Requirements Acceptance Criteria**:
- Daily job deletes export files older than 24 hours
- Monthly job deletes audit logs older than 30 days
- Job logs deleted file counts for monitoring
- Job handles errors gracefully (continues on individual file errors)
- Job updates export log status to 'expired' for deleted files
- Configurable retention policies via environment variables

#### T-6.2.1: Export File Cleanup Job
- **FR Reference**: FR5.2.1
- **Parent Task**: T-6.2.0
- **Implementation Location**: `src/lib/cron/export-file-cleanup.ts` (new file)
- **Pattern**: Scheduled function deleting expired files
- **Dependencies**: Export service
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Daily job deleting export files older than 24 hours

**Components/Elements**:
- [T-6.2.1:ELE-1] Cleanup logic: Query expired exports and delete files
  - Stubs and Code Location(s): `src/lib/cron/export-file-cleanup.ts`
- [T-6.2.1:ELE-2] Status update: Mark exports as 'expired'
  - Stubs and Code Location(s): Same file
- [T-6.2.1:ELE-3] Error handling: Continue on individual failures
  - Stubs and Code Location(s): Same file
- [T-6.2.1:ELE-4] Logging: Report deleted file counts
  - Stubs and Code Location(s): Same file

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Determine scheduling mechanism (Vercel cron vs edge function) (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create cleanup function (implements ELE-1)
   - [IMP-2] Query exports with expires_at < now() (implements ELE-1)
   - [IMP-3] Delete files from storage (implements ELE-1)
   - [IMP-4] Update export log status to 'expired' (implements ELE-2)
   - [IMP-5] Add try-catch for individual file errors (implements ELE-3)
   - [IMP-6] Log total deleted files (implements ELE-4)
   - [IMP-7] Configure cron schedule (daily at 2am UTC)
3. Validation Phase:
   - [VAL-1] Test cleanup deletes expired files (validates ELE-1)
   - [VAL-2] Test status updated to 'expired' (validates ELE-2)
   - [VAL-3] Test error handling doesn't stop job (validates ELE-3)
   - [VAL-4] Verify logging output (validates ELE-4)

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Duration:** 2 weeks  
**Team:** 1 backend engineer  
**Goal:** Database schema and service layer complete

**Tasks:**
- T-1.1.1: Create Export Logs Table Migration (3-4 hours)
- T-1.1.2: Implement Export Service Layer (5-8 hours)
- T-2.1.1: Implement JSONL Transformer (6-8 hours)
- T-2.1.2: Implement JSON Transformer (4-6 hours)
- T-2.1.3: Implement CSV Transformer (6-8 hours)
- T-2.1.4: Implement Markdown Transformer (4-6 hours)

**Milestones:**
- ✅ Export logs table deployed to production
- ✅ Export service layer with 90%+ test coverage
- ✅ All 4 format transformers implemented and tested

**Acceptance Test:** Can manually create export log entry via service layer, transform sample conversations into all 4 formats, and verify output correctness.

### Phase 2: API Endpoints (Weeks 3-4)
**Duration:** 2 weeks  
**Team:** 1 backend engineer  
**Goal:** Complete export API functionality

**Tasks:**
- T-4.1.1: Create Export Request Endpoint (8-10 hours)
- T-4.1.2: Create Export Status Endpoint (3-4 hours)
- T-4.1.3: Create Export Download Endpoint (6-8 hours)
- T-4.1.4: Create Export History Endpoint (4-5 hours)
- T-5.2.1: API Integration Tests (6-8 hours)

**Milestones:**
- ✅ All 4 export API endpoints deployed
- ✅ Small exports (<500 conversations) work synchronously
- ✅ Large exports (≥500 conversations) queue batch jobs
- ✅ Integration tests passing with 80%+ coverage

**Acceptance Test:** Can export conversations via API in all 4 formats, check status, download files, and view export history. Test with small (10) and large (600) datasets.

### Phase 3: User Interface (Weeks 5-6)
**Duration:** 2 weeks  
**Team:** 1 frontend engineer  
**Goal:** Complete export modal UI

**Tasks:**
- T-3.1.1: Export Scope Selector (4-5 hours)
- T-3.1.2: Export Format Selector (3-4 hours)
- T-3.1.3: Export Options Panel (3-4 hours)
- T-3.1.4: Export Preview Section (4-5 hours)
- T-3.1.0 integration: Wire all components into ExportModal (6-8 hours)
- T-5.1.0: Unit tests for UI components (8-10 hours)

**Milestones:**
- ✅ Export modal fully functional in dashboard
- ✅ All scope and format options working
- ✅ Preview displays correctly for all formats
- ✅ Download triggers and completes successfully

**Acceptance Test:** User can open export modal, select scope/format/options, preview output, download file, and verify contents match expectations.

### Phase 4: Quality & Operations (Weeks 7-8)
**Duration:** 2 weeks  
**Team:** 1 backend engineer + 1 QA engineer  
**Goal:** Production-ready with monitoring and maintenance

**Tasks:**
- T-5.1.1: Transformer Unit Tests (8-10 hours)
- T-6.1.1: Export Metrics Collection (4-6 hours)
- T-6.2.1: Export File Cleanup Job (3-4 hours)
- Performance testing with large datasets (8-10 hours)
- Documentation (API docs, user guide) (6-8 hours)
- Security audit and penetration testing (8-10 hours)

**Milestones:**
- ✅ Overall test coverage ≥85%
- ✅ Monitoring dashboards showing export metrics
- ✅ Cleanup jobs running successfully
- ✅ Performance validated for 1000+ conversation exports
- ✅ Security audit passed with no critical issues

**Acceptance Test:** Complete end-to-end workflow with production data volume (1000 conversations), verify monitoring shows metrics, confirm cleanup job deletes expired files, and validate security posture.

---

## Success Criteria

### Functional Requirements Met
- ✅ All 4 export formats (JSONL, JSON, CSV, Markdown) working correctly
- ✅ Export scope options (Selected, Current Filters, All Approved, All Data) functional
- ✅ Advanced options (include metadata, quality scores, timestamps, etc.) applied correctly
- ✅ Background processing for large exports (≥500 conversations) implemented
- ✅ Export preview displays first 3 conversations in selected format
- ✅ Export history with sorting, filtering, and pagination working
- ✅ Complete audit trail for all export operations
- ✅ File cleanup jobs running on schedule

### Performance Targets
- ✅ Small exports (<100 conversations): Complete within 5 seconds
- ✅ Medium exports (100-500 conversations): Complete within 30 seconds
- ✅ Large exports (500-1000 conversations): Complete within 3 minutes (background)
- ✅ Very large exports (1000-5000 conversations): Complete within 15 minutes (background)
- ✅ Export status check API: <200ms response time
- ✅ Export history query: <500ms for 100 exports

### Quality Metrics
- ✅ Test coverage ≥85% for transformer logic
- ✅ Test coverage ≥80% for API endpoints
- ✅ Test coverage ≥80% for UI components
- ✅ Zero critical security vulnerabilities
- ✅ Export success rate ≥95% (excluding user errors)
- ✅ All edge cases handled gracefully

### User Experience
- ✅ Export modal loads within 500ms
- ✅ Format preview updates within 200ms of selection change
- ✅ Download triggers within 500ms of button click
- ✅ Clear error messages for all failure scenarios
- ✅ Progress indicator for background exports
- ✅ Download link valid for 24 hours

---

## Risk Analysis

### Technical Risks

#### Risk 1: Large File Memory Issues
**Probability:** Medium  
**Impact:** High  
**Description:** Exporting 5000+ conversations may exceed memory limits in serverless functions

**Mitigation Strategies:**
1. Implement streaming for all transformers (never load full dataset into memory)
2. Use Node.js streams (ReadStream, WriteStream) throughout pipeline
3. Paginate database queries (fetch 100 conversations at a time)
4. Monitor memory usage and add alerts for 70% threshold
5. Implement file splitting for very large exports (multiple files)

#### Risk 2: Export File Storage Costs
**Probability:** Medium  
**Impact:** Medium  
**Description:** Storing large export files temporarily may incur significant storage costs

**Mitigation Strategies:**
1. Use ephemeral /tmp directory in serverless functions when possible
2. Set aggressive cleanup schedule (24 hour expiration)
3. Monitor storage usage and set budget alerts
4. Implement file compression for CSV/JSON formats
5. Consider user-specific storage quotas if costs become issue

#### Risk 3: Batch Job Processing Failures
**Probability:** Low  
**Impact:** High  
**Description:** Background jobs may fail midway through large exports leaving incomplete state

**Mitigation Strategies:**
1. Implement robust error handling with transaction rollback
2. Use batch job status tracking with granular progress updates
3. Enable retry functionality from last successful checkpoint
4. Add comprehensive logging for debugging failed jobs
5. Implement dead letter queue for repeatedly failing exports

### Business Risks

#### Risk 4: User Confusion About Export Formats
**Probability:** Medium  
**Impact:** Low  
**Description:** Users may not understand which format to choose for their use case

**Mitigation Strategies:**
1. Add clear format descriptions with use cases in UI
2. Mark JSONL as "Recommended for LoRA training"
3. Provide preview before download so users can verify format
4. Include documentation links in export modal
5. Add tooltips explaining each format option

#### Risk 5: Export Rate Limiting Too Restrictive
**Probability:** Low  
**Impact:** Medium  
**Description:** 10 exports/hour limit may be too restrictive for power users

**Mitigation Strategies:**
1. Monitor export request patterns after launch
2. Implement tiered rate limits (e.g., 10/hour basic, 50/hour pro)
3. Add "retry after" messaging when rate limit hit
4. Consider raising limits if abuse is not observed
5. Allow manual override by admin for legitimate high-volume users

---

## Appendices

### A. Type Definitions Reference

```typescript
// Core Export Types (from train-wireframe/src/lib/types.ts)

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

export type ExportLog = {
  id: string; // UUID
  export_id: string; // UUID
  user_id: string; // FK to auth.users
  timestamp: string; // ISO timestamp
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  config: ExportConfig; // JSONB
  conversation_count: number;
  file_size: number; // bytes
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  file_url: string | null; // Signed URL
  expires_at: string | null; // ISO timestamp
  error_message: string | null;
};

export interface IExportTransformer {
  transform(conversations: Conversation[], config: ExportConfig): Promise<string>;
  validateOutput(output: string): boolean;
}
```

### B. Database Schema

```sql
-- Export Logs Table
CREATE TABLE export_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  export_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Indexes
CREATE INDEX idx_export_logs_user_id ON export_logs(user_id);
CREATE INDEX idx_export_logs_timestamp ON export_logs(timestamp DESC);
CREATE INDEX idx_export_logs_status ON export_logs(status);
CREATE INDEX idx_export_logs_format ON export_logs(format);
CREATE INDEX idx_export_logs_expires_at ON export_logs(expires_at) WHERE status = 'completed';

-- RLS Policies
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own export logs"
  ON export_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own export logs"
  ON export_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own export logs"
  ON export_logs FOR UPDATE
  USING (auth.uid() = user_id);
```

### C. API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| /api/export/conversations | POST | Initiate export with config | Yes |
| /api/export/status/:id | GET | Check export status | Yes |
| /api/export/download/:id | GET | Download completed export | Yes |
| /api/export/history | GET | List all user exports | Yes |
| /api/export/:id | DELETE | Cancel or delete export | Yes |

### D. Codebase File Structure

```
train-data/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── export/
│   │           ├── conversations/
│   │           │   └── route.ts         # T-4.1.1
│   │           ├── status/
│   │           │   └── [id]/
│   │           │       └── route.ts     # T-4.1.2
│   │           ├── download/
│   │           │   └── [id]/
│   │           │       └── route.ts     # T-4.1.3
│   │           └── history/
│   │               └── route.ts         # T-4.1.4
│   ├── lib/
│   │   ├── export-service.ts            # T-1.1.2
│   │   ├── export-transformers/
│   │   │   ├── jsonl-transformer.ts     # T-2.1.1
│   │   │   ├── json-transformer.ts      # T-2.1.2
│   │   │   ├── csv-transformer.ts       # T-2.1.3
│   │   │   └── markdown-transformer.ts  # T-2.1.4
│   │   ├── monitoring/
│   │   │   └── export-metrics.ts        # T-6.1.1
│   │   └── cron/
│   │       └── export-file-cleanup.ts   # T-6.2.1
│   └── __tests__/
│       ├── export-transformers/         # T-5.1.1
│       └── integration/
│           └── export-api.test.ts       # T-5.2.1
├── train-wireframe/
│   └── src/
│       └── components/
│           ├── dashboard/
│           │   └── ExportModal.tsx      # T-3.1.0
│           └── export/
│               ├── ExportScopeSelector.tsx      # T-3.1.1
│               ├── ExportFormatSelector.tsx     # T-3.1.2
│               ├── ExportOptionsPanel.tsx       # T-3.1.3
│               └── ExportPreview.tsx            # T-3.1.4
└── supabase/
    └── migrations/
        └── YYYYMMDD_create_export_logs.sql  # T-1.1.1
```

---

## Document Metadata

**Document Version:** 1.0  
**Generated Date:** 2025-10-28  
**Total Tasks:** 24 main tasks, 72 sub-tasks  
**Estimated Total Hours:** 180-240 hours  
**Target Completion:** 6-8 weeks with 2 engineers  
**Last Updated:** 2025-10-28  

**Approval Status:** Draft - Pending Review  
**Next Review Date:** TBD  
**Approvers Required:** Product Manager, Engineering Lead, QA Lead

---

*This task inventory provides a comprehensive roadmap for implementing the Export System (FR5.x) of the Interactive LoRA Conversation Generation Module. All tasks are production-ready with detailed acceptance criteria, code references, and validation approaches.*
