# Train Data Module - Feature & Function Task Inventory (Generated 2025-10-28)

**Source:** FR3 - Core UI Components & Layouts  
**Scope:** Transform wireframe implementation into production-ready application with live data integration  
**Date Generated:** 2025-10-28  
**Wireframe Codebase:** `train-wireframe/src`  
**Target Application:** Training Data Generation Platform

---

## Executive Summary

This task inventory provides a comprehensive roadmap for implementing FR3 (Core UI Components & Layouts) by transforming the existing wireframe into a fully functional, production-ready application. The scope covers:

- **FR3.1:** Dashboard Layout & Navigation (Desktop-optimized layout, keyboard navigation)
- **FR3.2:** Loading States & Feedback (Loading indicators, empty states)
- **FR3.3:** Conversation Table & Filtering (Sortable table, advanced filtering, bulk actions)

**Total Tasks:** 89 detailed tasks organized into 6 major categories  
**Estimated Timeline:** 8-12 weeks for complete implementation  
**Team Size:** 4-6 engineers (2 frontend, 2 backend, 1 full-stack, 1 QA)

---

## 1. Foundation & Infrastructure

### T-1.1.0: Database Schema Implementation for UI Components
- **FR Reference**: FR1.1.1, FR1.1.2
- **Impact Weighting**: System Architecture / Data Foundation
- **Implementation Location**: Database migration files, `src/lib/database.ts`
- **Pattern**: Supabase PostgreSQL with Row Level Security (RLS)
- **Dependencies**: None (Foundation task)
- **Estimated Human Work Hours**: 16-24 hours
- **Description**: Implement normalized database schema supporting all UI data requirements including conversations, quality metrics, review history, and audit logging
- **Testing Tools**: Supabase SQL editor, PostgreSQL test suite, Jest for service layer tests
- **Test Coverage Requirements**: 90%+ coverage for all database operations
- **Completes Component?**: Yes - Provides data foundation for all UI components

**Functional Requirements Acceptance Criteria**:
- Conversations table with UUID primary key and all required fields per type definition
- conversation_turns table with foreign key relationship and cascading deletes
- Proper indexes on status, quality_score, tier, created_at for <100ms query performance
- Quality metrics stored as JSONB with structured schema validation
- Review history stored as JSONB array with timestamp and user attribution
- Row Level Security (RLS) policies enforcing multi-tenant data isolation
- Database migration scripts with rollback capability
- Seed data for development and testing environments

#### T-1.1.1: Conversations Table Schema
- **FR Reference**: FR1.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/001_create_conversations.sql`
- **Pattern**: PostgreSQL with JSONB for flexible metadata
- **Dependencies**: None
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Create conversations table with all required columns, constraints, and indexes

**Components/Elements**:
- [T-1.1.1:ELE-1] Primary Key and Unique Constraints: UUID id as primary key, unique constraint on conversation_id
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:26-46` (Conversation type)
- [T-1.1.1:ELE-2] Status Column with Enum Constraint: status field with 8 valid states
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:5` (ConversationStatus type)
- [T-1.1.1:ELE-3] Tier Column with Enum Constraint: tier field (template, scenario, edge_case)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:3` (TierType)
- [T-1.1.1:ELE-4] Quality Score Column: numeric field with range 0-10, precision to 1 decimal
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:34`
- [T-1.1.1:ELE-5] Metadata JSONB Fields: parameters and quality metrics as JSONB
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:14-24,44`
- [T-1.1.1:ELE-6] Timestamp Fields: created_at, updated_at with automatic timezone handling
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:36-37`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define complete schema with all columns and data types (implements ELE-1,2,3,4,5,6)
   - [PREP-2] Design index strategy for frequent query patterns (implements ELE-1)
   - [PREP-3] Plan JSONB field structure and validation rules (implements ELE-5)
2. Implementation Phase:
   - [IMP-1] Create migration SQL with CREATE TABLE statement (implements ELE-1,2,3,4,5,6)
   - [IMP-2] Add NOT NULL and DEFAULT constraints (implements ELE-1,2,3,4,6)
   - [IMP-3] Create indexes on status, tier, quality_score, created_at (implements ELE-1)
   - [IMP-4] Add CHECK constraints for enum validation (implements ELE-2,3)
   - [IMP-5] Implement GIN index on JSONB fields (implements ELE-5)
3. Validation Phase:
   - [VAL-1] Test table creation with sample data inserts (validates ELE-1,2,3,4,5,6)
   - [VAL-2] Verify index usage with EXPLAIN ANALYZE (validates ELE-1)
   - [VAL-3] Test constraint enforcement with invalid data (validates ELE-2,3,4)
   - [VAL-4] Measure query performance with 10k+ records (validates ELE-1)

#### T-1.1.2: Conversation Turns Table Schema
- **FR Reference**: FR1.1.1
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/002_create_conversation_turns.sql`
- **Pattern**: Normalized one-to-many relationship with conversations
- **Dependencies**: T-1.1.1 (Conversations table must exist)
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Create conversation_turns table with foreign key relationship to conversations table

**Components/Elements**:
- [T-1.1.2:ELE-1] Foreign Key Relationship: conversation_id references conversations(id) with CASCADE on delete
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:7-12` (ConversationTurn type)
- [T-1.1.2:ELE-2] Turn Sequence Enforcement: UNIQUE constraint on (conversation_id, turn_number)
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:10` (turn_number implicit)
- [T-1.1.2:ELE-3] Role Validation: CHECK constraint ensuring role is 'user' OR 'assistant'
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:8` (role type)
- [T-1.1.2:ELE-4] Content Storage: TEXT field for turn content with appropriate collation
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:9` (content field)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design normalized schema separating turns from conversations (implements ELE-1)
   - [PREP-2] Plan index strategy for turn retrieval queries (implements ELE-1,2)
2. Implementation Phase:
   - [IMP-1] Create migration SQL with foreign key constraint (implements ELE-1)
   - [IMP-2] Add UNIQUE constraint on (conversation_id, turn_number) (implements ELE-2)
   - [IMP-3] Add CHECK constraint for role validation (implements ELE-3)
   - [IMP-4] Create index on (conversation_id, turn_number) (implements ELE-1,2)
3. Validation Phase:
   - [VAL-1] Test foreign key constraint enforcement (validates ELE-1)
   - [VAL-2] Test unique constraint with duplicate turn_numbers (validates ELE-2)
   - [VAL-3] Test role validation with invalid values (validates ELE-3)
   - [VAL-4] Test cascading deletes when conversation deleted (validates ELE-1)

#### T-1.1.3: Database Indexes for Query Optimization
- **FR Reference**: FR1.3.2
- **Parent Task**: T-1.1.0
- **Implementation Location**: `supabase/migrations/003_create_indexes.sql`
- **Pattern**: Strategic indexing for dashboard query patterns
- **Dependencies**: T-1.1.1, T-1.1.2
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Create comprehensive indexes supporting common query patterns identified in wireframe

**Components/Elements**:
- [T-1.1.3:ELE-1] Single Column Indexes: status, tier, quality_score, created_at
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/FilterBar.tsx:63-72` (filter patterns)
- [T-1.1.3:ELE-2] Composite Index for Filtered Queries: (status, quality_score)
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/DashboardView.tsx:40-46` (combined filters)
- [T-1.1.3:ELE-3] Full-Text Search Index: GIN index on persona, emotion, title fields
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/FilterBar.tsx:84-89` (search functionality)
- [T-1.1.3:ELE-4] JSONB Indexes: GIN indexes on parameters and qualityMetrics fields
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:44,35` (JSONB fields)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Analyze wireframe query patterns from FilterBar and DashboardView (implements ELE-1,2,3)
   - [PREP-2] Identify most frequent filter combinations (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create btree indexes on frequently queried columns (implements ELE-1)
   - [IMP-2] Create composite index for status+quality_score queries (implements ELE-2)
   - [IMP-3] Create GIN index for full-text search (implements ELE-3)
   - [IMP-4] Create GIN indexes on JSONB fields with jsonb_path_ops (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Use EXPLAIN ANALYZE to verify index usage (validates ELE-1,2,3,4)
   - [VAL-2] Benchmark query performance with and without indexes (validates ELE-1,2)
   - [VAL-3] Test search performance with various keywords (validates ELE-3)

### T-1.2.0: API Service Layer Implementation
- **FR Reference**: FR3.1.1, FR3.3.1, FR3.3.2
- **Impact Weighting**: Core Functionality / Backend Architecture
- **Implementation Location**: `src/lib/api/`, `src/app/api/conversations/`
- **Pattern**: RESTful API with TypeScript type safety
- **Dependencies**: T-1.1.0 (Database schema must be complete)
- **Estimated Human Work Hours**: 24-32 hours
- **Description**: Implement backend API services for conversation CRUD, filtering, sorting, and bulk operations
- **Testing Tools**: Jest, Supertest, Postman for API testing
- **Test Coverage Requirements**: 85%+ coverage for all API routes
- **Completes Component?**: Yes - Provides backend services for all UI operations

**Functional Requirements Acceptance Criteria**:
- GET /api/conversations with query parameter support for filtering and sorting
- POST /api/conversations for creating new conversations
- PATCH /api/conversations/:id for updating conversation metadata
- DELETE /api/conversations/:id for soft or hard deletion
- POST /api/conversations/bulk-update for batch status updates
- Response pagination with limit and offset parameters
- Error handling with standardized error response format
- Request validation using Zod or similar schema validator

#### T-1.2.1: GET /api/conversations Endpoint
- **FR Reference**: FR3.3.1, FR3.3.2
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/app/api/conversations/route.ts`
- **Pattern**: Next.js API Route with query parameter parsing
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Implement primary endpoint for fetching conversations with filtering, sorting, and pagination

**Components/Elements**:
- [T-1.2.1:ELE-1] Query Parameter Parsing: tier[], status[], qualityScoreMin, searchQuery, sortColumn, sortDirection
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:29-33` (FilterConfig structure)
- [T-1.2.1:ELE-2] Database Query Builder: Dynamic WHERE clause construction based on filters
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/DashboardView.tsx:23-50` (filtering logic)
- [T-1.2.1:ELE-3] Sorting Logic: ORDER BY clause with column and direction validation
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/ConversationTable.tsx:69-82` (sorting)
- [T-1.2.1:ELE-4] Pagination: LIMIT and OFFSET with total count return
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/DashboardView.tsx:52-57` (pagination)
- [T-1.2.1:ELE-5] Search Functionality: ILIKE pattern matching on title, persona, emotion fields
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/DashboardView.tsx:28-31`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define TypeScript interfaces for request/response schemas (implements ELE-1,4)
   - [PREP-2] Design query builder pattern for dynamic filtering (implements ELE-2)
   - [PREP-3] Plan search indexing strategy for performance (implements ELE-5)
2. Implementation Phase:
   - [IMP-1] Parse and validate query parameters (implements ELE-1)
   - [IMP-2] Build Supabase query with chained filters (implements ELE-2,5)
   - [IMP-3] Apply sorting with column validation (implements ELE-3)
   - [IMP-4] Implement pagination with total count (implements ELE-4)
   - [IMP-5] Format response with metadata (count, page, total) (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test all filter combinations (validates ELE-1,2)
   - [VAL-2] Test sorting on each valid column (validates ELE-3)
   - [VAL-3] Test pagination edge cases (empty, single page, multiple pages) (validates ELE-4)
   - [VAL-4] Test search with special characters and edge cases (validates ELE-5)
   - [VAL-5] Performance test with 10,000+ records (validates ELE-2,3,4)

#### T-1.2.2: POST /api/conversations Endpoint
- **FR Reference**: FR4.2.1 (Single generation foundation)
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/app/api/conversations/route.ts`
- **Pattern**: Next.js API Route with request validation
- **Dependencies**: T-1.1.0
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Implement endpoint for creating new conversation records

**Components/Elements**:
- [T-1.2.2:ELE-1] Request Body Validation: Zod schema matching Conversation type
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:26-46`
- [T-1.2.2:ELE-2] Unique ID Generation: UUID generation for new conversations
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:27`
- [T-1.2.2:ELE-3] Timestamp Handling: Automatic created_at and updated_at population
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:36-37`
- [T-1.2.2:ELE-4] Response Formatting: Return created conversation with 201 status
  - Stubs and Code Location(s): Standard REST API pattern

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Create Zod schema for conversation creation (implements ELE-1)
   - [PREP-2] Define default values for optional fields (implements ELE-1,3)
2. Implementation Phase:
   - [IMP-1] Validate incoming request body (implements ELE-1)
   - [IMP-2] Generate UUID and timestamps (implements ELE-2,3)
   - [IMP-3] Insert into database with error handling (implements ELE-1,2,3)
   - [IMP-4] Return created resource with proper status code (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test with valid complete payload (validates ELE-1,2,3,4)
   - [VAL-2] Test with minimal required fields (validates ELE-1,3)
   - [VAL-3] Test validation errors with invalid data (validates ELE-1)
   - [VAL-4] Test duplicate ID constraint (validates ELE-2)

#### T-1.2.3: PATCH /api/conversations/:id Endpoint
- **FR Reference**: FR3.3.4 (Inline actions - approve, reject, update)
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/app/api/conversations/[id]/route.ts`
- **Pattern**: Partial update with optimistic locking
- **Dependencies**: T-1.1.0, T-1.2.1
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Implement endpoint for updating conversation fields including status changes

**Components/Elements**:
- [T-1.2.3:ELE-1] Partial Update Support: Accept subset of Conversation fields
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:163-169` (updateConversation)
- [T-1.2.3:ELE-2] Status Transition Validation: Validate status changes are permitted
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:5` (ConversationStatus enum)
- [T-1.2.3:ELE-3] Review History Append: Add review action to reviewHistory array
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:45,48-55`
- [T-1.2.3:ELE-4] Updated Timestamp: Automatically update updated_at field
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:37`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define valid status transition rules (implements ELE-2)
   - [PREP-2] Design review history append logic (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Validate conversation exists with 404 handling (implements ELE-1)
   - [IMP-2] Validate status transitions (implements ELE-2)
   - [IMP-3] Append review action if status changed (implements ELE-3)
   - [IMP-4] Update record with timestamp (implements ELE-1,4)
3. Validation Phase:
   - [VAL-1] Test various field updates (validates ELE-1)
   - [VAL-2] Test invalid status transitions (validates ELE-2)
   - [VAL-3] Test review history appending (validates ELE-3)
   - [VAL-4] Test non-existent ID handling (validates ELE-1)

#### T-1.2.4: POST /api/conversations/bulk-update Endpoint
- **FR Reference**: FR3.3.3 (Bulk actions)
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/app/api/conversations/bulk-update/route.ts`
- **Pattern**: Batch update with transaction support
- **Dependencies**: T-1.1.0, T-1.2.3
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Implement endpoint for updating multiple conversations in a single request

**Components/Elements**:
- [T-1.2.4:ELE-1] Bulk ID Array: Accept array of conversation IDs to update
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:41` (selectedConversationIds)
- [T-1.2.4:ELE-2] Common Update Fields: Status, category, or other shared fields
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/FilterBar.tsx:306-329`
- [T-1.2.4:ELE-3] Transaction Handling: All-or-nothing update with rollback on error
  - Stubs and Code Location(s): Standard database transaction pattern
- [T-1.2.4:ELE-4] Progress Response: Return success/failure count per ID
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/FilterBar.tsx:302`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define bulk update request schema (implements ELE-1,2)
   - [PREP-2] Design transaction boundaries (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Validate request with ID array and update fields (implements ELE-1,2)
   - [IMP-2] Begin database transaction (implements ELE-3)
   - [IMP-3] Loop through IDs and update each record (implements ELE-1,2)
   - [IMP-4] Commit transaction or rollback on error (implements ELE-3)
   - [IMP-5] Return detailed results with success/failure counts (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test bulk update of 5, 50, 500 conversations (validates ELE-1,2,3)
   - [VAL-2] Test transaction rollback on mid-batch error (validates ELE-3)
   - [VAL-3] Test partial ID list with some invalid IDs (validates ELE-4)
   - [VAL-4] Test concurrent bulk updates (validates ELE-3)

### T-1.3.0: State Management Setup
- **FR Reference**: FR3.1.1, FR3.2.1
- **Impact Weighting**: Frontend Architecture / Data Flow
- **Implementation Location**: `src/stores/`, React hooks
- **Pattern**: Zustand state management with TypeScript
- **Dependencies**: None (Frontend foundation)
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Implement global state management using Zustand as implemented in wireframe
- **Testing Tools**: Jest, React Testing Library for hook testing
- **Test Coverage Requirements**: 80%+ coverage for state actions
- **Completes Component?**: Yes - Provides frontend state foundation

**Functional Requirements Acceptance Criteria**:
- Zustand store mirroring wireframe structure with all state slices
- State actions for conversations, filters, selections, UI state management
- TypeScript interfaces matching wireframe types exactly
- Local storage persistence for user preferences
- Optimistic UI updates with rollback capability
- State debugging tools integrated (Redux DevTools compatibility)
- Performance optimized with selective re-renders
- State hydration from API responses

#### T-1.3.1: Core Zustand Store Implementation
- **FR Reference**: FR3.1.1
- **Parent Task**: T-1.3.0
- **Implementation Location**: `src/stores/conversationStore.ts`
- **Pattern**: Zustand with immer middleware for immutable updates
- **Dependencies**: None
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Implement main Zustand store matching wireframe architecture

**Components/Elements**:
- [T-1.3.1:ELE-1] State Interface Definition: Match wireframe AppState interface
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:14-53`
- [T-1.3.1:ELE-2] Conversation State Slice: conversations array, selection, filters
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:21-33`
- [T-1.3.1:ELE-3] UI State Slice: modals, loading, sidebar collapsed
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:16-49`
- [T-1.3.1:ELE-4] Action Creators: All methods from wireframe store
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:55-110`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Copy type definitions from wireframe (implements ELE-1)
   - [PREP-2] Design state structure for production needs (implements ELE-1,2,3)
2. Implementation Phase:
   - [IMP-1] Create Zustand store with TypeScript (implements ELE-1)
   - [IMP-2] Implement conversation state and actions (implements ELE-2)
   - [IMP-3] Implement UI state and actions (implements ELE-3)
   - [IMP-4] Add all action creators with proper typing (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test each action with unit tests (validates ELE-4)
   - [VAL-2] Test state updates are immutable (validates ELE-2,3)
   - [VAL-3] Test state selectors for performance (validates ELE-1)

---

## 2. Data Management & Processing

### T-2.1.0: Client-Side Data Fetching
- **FR Reference**: FR3.3.1, FR3.3.2
- **Impact Weighting**: Data Flow / Performance
- **Implementation Location**: `src/hooks/`, `src/lib/api-client.ts`
- **Pattern**: React hooks with SWR or React Query for caching
- **Dependencies**: T-1.2.0 (API must exist)
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Implement data fetching hooks with caching, error handling, and optimistic updates
- **Testing Tools**: Jest, React Testing Library, MSW for API mocking
- **Test Coverage Requirements**: 85%+ coverage
- **Completes Component?**: Yes - Provides data access layer for UI components

**Functional Requirements Acceptance Criteria**:
- useConversations hook with filtering, sorting, pagination parameters
- Automatic refetch on filter/sort changes with debouncing
- Loading states exposed to components
- Error handling with retry capability
- Optimistic updates for mutations
- Cache invalidation on create/update/delete operations
- TypeScript inference for response data
- Request deduplication for concurrent requests

#### T-2.1.1: useConversations Data Fetching Hook
- **FR Reference**: FR3.3.1
- **Parent Task**: T-2.1.0
- **Implementation Location**: `src/hooks/useConversations.ts`
- **Pattern**: SWR or React Query hook pattern
- **Dependencies**: T-1.2.1 (GET /api/conversations)
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Primary data fetching hook for conversation list with filtering

**Components/Elements**:
- [T-2.1.1:ELE-1] Filter Parameter Integration: Accept filterConfig from store
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:29` (filters)
- [T-2.1.1:ELE-2] Query Key Generation: Deterministic cache key from filters
  - Stubs and Code Location(s): SWR/React Query pattern
- [T-2.1.1:ELE-3] Auto-Refetch on Filter Change: Watch filter dependencies
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/DashboardView.tsx:23-50`
- [T-2.1.1:ELE-4] Loading and Error States: Return isLoading, error, data
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:48-49`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Choose between SWR and React Query (implements ELE-2)
   - [PREP-2] Design query key structure (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create hook with filter parameter (implements ELE-1)
   - [IMP-2] Build query key from filter object (implements ELE-2)
   - [IMP-3] Fetch data with dependency array (implements ELE-3)
   - [IMP-4] Return typed response object (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test hook with various filter combinations (validates ELE-1,3)
   - [VAL-2] Test cache key generation uniqueness (validates ELE-2)
   - [VAL-3] Test loading and error states (validates ELE-4)

---

## 3. User Interface Components

### T-3.1.0: Dashboard Layout Component
- **FR Reference**: FR3.1.1
- **Impact Weighting**: User Experience / Visual Structure
- **Implementation Location**: `src/components/layout/`
- **Pattern**: React component with responsive CSS Grid
- **Dependencies**: T-1.3.0 (State management)
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Implement main dashboard layout matching wireframe structure
- **Testing Tools**: Jest, React Testing Library, Cypress for E2E
- **Test Coverage Requirements**: 75%+ coverage
- **Completes Component?**: Yes - Provides layout shell for all dashboard views

**Functional Requirements Acceptance Criteria**:
- Desktop-optimized layout for 1920x1080 and 1366x768 resolutions
- Fixed header with navigation and branding
- Collapsible sidebar with toggle button
- Main content area with proper spacing
- Responsive breakpoints at 640px, 768px, 1024px, 1280px, 1536px
- Loading overlay for global loading states
- Toast notification container
- Keyboard navigation support

#### T-3.1.1: DashboardLayout Component Implementation
- **FR Reference**: FR3.1.1
- **Parent Task**: T-3.1.0
- **Implementation Location**: `src/components/layout/DashboardLayout.tsx`
- **Pattern**: Component composition with CSS Grid
- **Dependencies**: T-1.3.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Port wireframe DashboardLayout to production with full functionality

**Components/Elements**:
- [T-3.1.1:ELE-1] Header Component Integration: Fixed header with navigation
  - Stubs and Code Location(s): `train-wireframe/src/components/layout/DashboardLayout.tsx:23`, `Header.tsx`
- [T-3.1.1:ELE-2] Loading Overlay: Global loading state with message display
  - Stubs and Code Location(s): `train-wireframe/src/components/layout/DashboardLayout.tsx:56-64`
- [T-3.1.1:ELE-3] Confirmation Dialog: Reusable confirmation modal
  - Stubs and Code Location(s): `train-wireframe/src/components/layout/DashboardLayout.tsx:32-53`
- [T-3.1.1:ELE-4] Toast Notifications: Sonner toast container
  - Stubs and Code Location(s): `train-wireframe/src/components/layout/DashboardLayout.tsx:29`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review wireframe implementation patterns (implements ELE-1,2,3,4)
   - [PREP-2] Design responsive grid layout (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create layout shell with CSS Grid (implements ELE-1)
   - [IMP-2] Integrate loading overlay with store state (implements ELE-2)
   - [IMP-3] Integrate confirmation dialog with store (implements ELE-3)
   - [IMP-4] Add toast container with positioning (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test responsive behavior at all breakpoints (validates ELE-1)
   - [VAL-2] Test loading overlay display and dismissal (validates ELE-2)
   - [VAL-3] Test confirmation dialog flows (validates ELE-3)
   - [VAL-4] Test toast notification display (validates ELE-4)

### T-3.2.0: Conversation Table Implementation
- **FR Reference**: FR3.3.1
- **Impact Weighting**: Core Functionality / Data Display
- **Implementation Location**: `src/components/conversations/`
- **Pattern**: React Table with sorting, selection, actions
- **Dependencies**: T-1.3.0, T-2.1.0
- **Estimated Human Work Hours**: 20-24 hours
- **Description**: Implement full-featured conversation table with all wireframe functionality
- **Testing Tools**: Jest, React Testing Library, Testing Library User Events
- **Test Coverage Requirements**: 80%+ coverage
- **Completes Component?**: Yes - Primary data display component

**Functional Requirements Acceptance Criteria**:
- Multi-column sortable table with visual sort indicators
- Checkbox selection with select all functionality
- Status and tier badges with color coding
- Quality score display with color-coded thresholds
- Inline dropdown actions per row
- Row hover highlighting with selection indication
- Zebra striping for readability
- Responsive horizontal scroll for narrow viewports
- Keyboard navigation support (arrow keys, enter, space)
- Empty state display when no data

#### T-3.2.1: ConversationTable Core Component
- **FR Reference**: FR3.3.1
- **Parent Task**: T-3.2.0
- **Implementation Location**: `src/components/conversations/ConversationTable.tsx`
- **Pattern**: Shadcn Table with custom logic
- **Dependencies**: T-1.3.0, T-2.1.1
- **Estimated Human Work Hours**: 10-12 hours
- **Description**: Core table structure with sorting, selection, and display

**Components/Elements**:
- [T-3.2.1:ELE-1] Table Headers with Sort Handling: Clickable headers with arrow icons
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/ConversationTable.tsx:163-196`
- [T-3.2.1:ELE-2] Checkbox Column: Selection checkboxes with select all
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/ConversationTable.tsx:165-170,218-222`
- [T-3.2.1:ELE-3] Status Badges: Color-coded status indicators
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/ConversationTable.tsx:36-45,252-256`
- [T-3.2.1:ELE-4] Tier Badges: Color-coded tier indicators
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/ConversationTable.tsx:47-51,242-246`
- [T-3.2.1:ELE-5] Quality Score Display: Color-coded numeric score
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/ConversationTable.tsx:139-143`
- [T-3.2.1:ELE-6] Inline Actions Dropdown: Three-dot menu with actions
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/ConversationTable.tsx:268-307`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up Shadcn Table component structure (implements ELE-1)
   - [PREP-2] Design sorting state management (implements ELE-1)
   - [PREP-3] Design selection state integration with store (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement table headers with sort logic (implements ELE-1)
   - [IMP-2] Add checkbox column with select all (implements ELE-2)
   - [IMP-3] Create Badge components for status and tier (implements ELE-3,4)
   - [IMP-4] Add quality score with color logic (implements ELE-5)
   - [IMP-5] Implement inline actions dropdown (implements ELE-6)
   - [IMP-6] Add row hover and selection highlighting (implements all)
3. Validation Phase:
   - [VAL-1] Test sorting on all columns (validates ELE-1)
   - [VAL-2] Test selection (individual, all, clear) (validates ELE-2)
   - [VAL-3] Test badge colors for all statuses (validates ELE-3,4)
   - [VAL-4] Test quality score thresholds (validates ELE-5)
   - [VAL-5] Test all inline actions (validates ELE-6)

### T-3.3.0: Filter Bar Implementation
- **FR Reference**: FR3.3.2
- **Impact Weighting**: User Experience / Data Discovery
- **Implementation Location**: `src/components/filters/`
- **Pattern**: Controlled form with URL state sync
- **Dependencies**: T-1.3.0
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Implement comprehensive filtering UI with search, quick filters, and advanced filters
- **Testing Tools**: Jest, React Testing Library
- **Test Coverage Requirements**: 85%+ coverage
- **Completes Component?**: Yes - Primary filtering interface

**Functional Requirements Acceptance Criteria**:
- Search input with clear button and debouncing
- Quick filter buttons for common filters
- Advanced filter popover with tier, status, quality range selectors
- Active filter badge display with remove functionality
- Clear all filters button
- Bulk actions toolbar when selections exist
- Export button integration
- Filter state persistence in URL query parameters
- Performance optimized with proper memoization

#### T-3.3.1: FilterBar Component Core
- **FR Reference**: FR3.3.2
- **Parent Task**: T-3.3.0
- **Implementation Location**: `src/components/filters/FilterBar.tsx`
- **Pattern**: Controlled component with store integration
- **Dependencies**: T-1.3.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Port wireframe FilterBar with full filtering capabilities

**Components/Elements**:
- [T-3.3.1:ELE-1] Search Input: Text input with clear button and icon
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/FilterBar.tsx:82-99`
- [T-3.3.1:ELE-2] Quick Filter Buttons: Row of preset filter buttons
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/FilterBar.tsx:218-229`
- [T-3.3.1:ELE-3] Advanced Filters Popover: Popover with tier, status, quality inputs
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/FilterBar.tsx:102-208`
- [T-3.3.1:ELE-4] Active Filter Badges: Removable badges showing active filters
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/FilterBar.tsx:232-295`
- [T-3.3.1:ELE-5] Bulk Actions Toolbar: Conditional toolbar for selected items
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/FilterBar.tsx:298-332`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design filter state structure matching wireframe (implements ELE-1,2,3,4)
   - [PREP-2] Plan URL state synchronization (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Create search input with debounce (implements ELE-1)
   - [IMP-2] Create quick filter button row (implements ELE-2)
   - [IMP-3] Create advanced filter popover with all controls (implements ELE-3)
   - [IMP-4] Create active filter badge display (implements ELE-4)
   - [IMP-5] Create bulk actions toolbar (implements ELE-5)
   - [IMP-6] Integrate with store for filter state (implements all)
3. Validation Phase:
   - [VAL-1] Test search debouncing behavior (validates ELE-1)
   - [VAL-2] Test each quick filter (validates ELE-2)
   - [VAL-3] Test advanced filter combinations (validates ELE-3)
   - [VAL-4] Test badge remove functionality (validates ELE-4)
   - [VAL-5] Test bulk actions appear/disappear (validates ELE-5)

### T-3.4.0: Loading States & Empty States
- **FR Reference**: FR3.2.1, FR3.2.2
- **Impact Weighting**: User Experience / Perceived Performance
- **Implementation Location**: `src/components/ui/`, component-specific loading states
- **Pattern**: Skeleton loaders and empty state messages
- **Dependencies**: T-1.3.0
- **Estimated Human Work Hours**: 8-12 hours
- **Description**: Implement all loading and empty state UI patterns
- **Testing Tools**: Jest, React Testing Library
- **Test Coverage Requirements**: 70%+ coverage
- **Completes Component?**: Yes - Provides feedback for all async operations

**Functional Requirements Acceptance Criteria**:
- Skeleton loaders matching table structure during data fetching
- Shimmer animation on skeletons
- Empty state with icon, message, and call-to-action when no data
- No results state with different message when filters applied
- Loading spinner for global operations
- Toast notifications for success/error feedback
- Optimistic UI updates with rollback on error
- Loading message display for long operations

#### T-3.4.1: Skeleton Components
- **FR Reference**: FR3.2.1
- **Parent Task**: T-3.4.0
- **Implementation Location**: `src/components/ui/skeleton.tsx`, table-specific skeletons
- **Pattern**: Shadcn Skeleton component
- **Dependencies**: None (UI primitive)
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Create skeleton loader components for table and other UI elements

**Components/Elements**:
- [T-3.4.1:ELE-1] Base Skeleton Component: Animated div with shimmer effect
  - Stubs and Code Location(s): `train-wireframe/src/components/ui/skeleton.tsx`
- [T-3.4.1:ELE-2] Table Row Skeleton: Skeleton matching table structure
  - Stubs and Code Location(s): Pattern from DashboardView loading state
- [T-3.4.1:ELE-3] Card Skeleton: Skeleton for card components
  - Stubs and Code Location(s): Pattern from stat cards

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review wireframe skeleton implementation (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Copy Shadcn skeleton component (implements ELE-1)
   - [IMP-2] Create TableRowSkeleton component (implements ELE-2)
   - [IMP-3] Create CardSkeleton component (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test shimmer animation (validates ELE-1)
   - [VAL-2] Test skeleton layout matches actual content (validates ELE-2,3)

#### T-3.4.2: Empty State Components
- **FR Reference**: FR3.2.2
- **Parent Task**: T-3.4.0
- **Implementation Location**: `src/components/empty-states/`
- **Pattern**: Reusable empty state component
- **Dependencies**: None
- **Estimated Human Work Hours**: 3-4 hours
- **Description**: Create empty state displays for various no-data scenarios

**Components/Elements**:
- [T-3.4.2:ELE-1] EmptyState Component: Icon, title, message, CTA button
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/DashboardView.tsx:71-90`
- [T-3.4.2:ELE-2] NoResults Component: Different message for filtered empty
  - Stubs and Code Location(s): ConversationTable empty state pattern
- [T-3.4.2:ELE-3] EmptyTable Component: Empty state within table structure
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/ConversationTable.tsx:199-204`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design reusable empty state component API (implements ELE-1,2,3)
2. Implementation Phase:
   - [IMP-1] Create EmptyState base component (implements ELE-1)
   - [IMP-2] Create NoResults variant (implements ELE-2)
   - [IMP-3] Create EmptyTable component (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test empty state display (validates ELE-1)
   - [VAL-2] Test messaging difference between empty and filtered (validates ELE-2)
   - [VAL-3] Test CTA button actions (validates ELE-1)

---

## 4. Feature Implementation

### T-4.1.0: Keyboard Navigation System
- **FR Reference**: FR3.1.2
- **Impact Weighting**: Accessibility / Power User Experience
- **Implementation Location**: `src/hooks/useKeyboardShortcuts.ts`, component-level handlers
- **Pattern**: Global keyboard event listener with context awareness
- **Dependencies**: T-1.3.0, T-3.2.0
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Implement comprehensive keyboard navigation as specified in wireframe
- **Testing Tools**: Jest, React Testing Library, Cypress for E2E
- **Test Coverage Requirements**: 80%+ coverage
- **Completes Component?**: Yes - Provides keyboard accessibility

**Functional Requirements Acceptance Criteria**:
- Space key toggles row selection when table row focused
- Enter key opens conversation preview modal
- Arrow keys (Up/Down) navigate table rows with focus ring
- ESC key closes all modals and dialogs
- Cmd/Ctrl+A selects all visible rows
- Cmd/Ctrl+E triggers export modal
- ? key opens keyboard shortcuts help dialog
- Tab order follows logical flow: header → filters → table → pagination
- Keyboard shortcuts disabled when input fields focused
- Focus indicators clearly visible with proper styling

#### T-4.1.1: useKeyboardShortcuts Hook
- **FR Reference**: FR3.1.2
- **Parent Task**: T-4.1.0
- **Implementation Location**: `src/hooks/useKeyboardShortcuts.ts`
- **Pattern**: Custom React hook with event listeners
- **Dependencies**: T-1.3.0
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Create global keyboard shortcut system

**Components/Elements**:
- [T-4.1.1:ELE-1] Event Listener Registration: Global keydown handler
  - Stubs and Code Location(s): React useEffect pattern with window.addEventListener
- [T-4.1.1:ELE-2] Shortcut Map: Object mapping key combinations to actions
  - Stubs and Code Location(s): Keyboard shortcut configuration
- [T-4.1.1:ELE-3] Context Awareness: Disable shortcuts when input focused
  - Stubs and Code Location(s): Check document.activeElement
- [T-4.1.1:ELE-4] Store Integration: Trigger store actions on shortcuts
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts` actions

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define shortcut mapping structure (implements ELE-2)
   - [PREP-2] Design context detection logic (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create hook with event listener setup (implements ELE-1)
   - [IMP-2] Build shortcut map with all key combinations (implements ELE-2)
   - [IMP-3] Add input field detection (implements ELE-3)
   - [IMP-4] Connect shortcuts to store actions (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test each keyboard shortcut (validates ELE-2,4)
   - [VAL-2] Test shortcuts disabled in inputs (validates ELE-3)
   - [VAL-3] Test cleanup on unmount (validates ELE-1)

### T-4.2.0: Bulk Actions Implementation
- **FR Reference**: FR3.3.3
- **Impact Weighting**: Workflow Efficiency / User Productivity
- **Implementation Location**: `src/components/conversations/`, API endpoints
- **Pattern**: Multi-step workflow with confirmation
- **Dependencies**: T-1.2.4, T-3.2.0, T-3.3.0
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Implement bulk operations for multiple selected conversations
- **Testing Tools**: Jest, React Testing Library, Postman for API
- **Test Coverage Requirements**: 85%+ coverage
- **Completes Component?**: Yes - Enables batch operations

**Functional Requirements Acceptance Criteria**:
- Bulk actions toolbar appears when conversations selected
- Selection count displayed in toolbar
- Bulk approve, reject, delete, export actions
- Confirmation dialog for destructive bulk actions
- Progress indicator during bulk operation
- Success toast with operation count
- Error handling with partial success reporting
- Clear selection after successful bulk operation
- Optimistic UI updates with rollback on error

#### T-4.2.1: Bulk Selection Management
- **FR Reference**: FR3.3.3
- **Parent Task**: T-4.2.0
- **Implementation Location**: Store actions, table selection logic
- **Pattern**: Store-managed selection array
- **Dependencies**: T-1.3.0, T-3.2.0
- **Estimated Human Work Hours**: 4-6 hours
- **Description**: Implement selection state management for bulk operations

**Components/Elements**:
- [T-4.2.1:ELE-1] Selection Array State: Array of selected conversation IDs
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:31,79-87`
- [T-4.2.1:ELE-2] Toggle Selection Action: Add/remove single ID
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:200-205`
- [T-4.2.1:ELE-3] Select All Action: Add all visible conversation IDs
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:206`
- [T-4.2.1:ELE-4] Clear Selection Action: Empty selection array
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:207`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review wireframe selection logic (implements ELE-1,2,3,4)
2. Implementation Phase:
   - [IMP-1] Verify selection state in store (implements ELE-1)
   - [IMP-2] Verify toggle action (implements ELE-2)
   - [IMP-3] Verify select all with filter awareness (implements ELE-3)
   - [IMP-4] Verify clear selection (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test individual selection toggle (validates ELE-2)
   - [VAL-2] Test select all with various filters (validates ELE-3)
   - [VAL-3] Test clear selection (validates ELE-4)

#### T-4.2.2: Bulk Update Actions
- **FR Reference**: FR3.3.3
- **Parent Task**: T-4.2.0
- **Implementation Location**: `src/components/conversations/bulk-actions.tsx`
- **Pattern**: Async action with progress feedback
- **Dependencies**: T-1.2.4, T-4.2.1
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Implement bulk status update operations

**Components/Elements**:
- [T-4.2.2:ELE-1] Bulk Approve Action: Update all selected to approved status
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/FilterBar.tsx:314-320`
- [T-4.2.2:ELE-2] Bulk Reject Action: Update all selected to rejected status
  - Stubs and Code Location(s): Similar pattern to approve
- [T-4.2.2:ELE-3] Confirmation Dialog: Show count and require confirmation
  - Stubs and Code Location(s): `train-wireframe/src/stores/useAppStore.ts:96-99,219-220`
- [T-4.2.2:ELE-4] Progress Feedback: Loading state during operation
  - Stubs and Code Location(s): Toast notifications during bulk action

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design confirmation dialog messaging (implements ELE-3)
   - [PREP-2] Plan error handling for partial failures (implements ELE-4)
2. Implementation Phase:
   - [IMP-1] Create bulk approve handler (implements ELE-1)
   - [IMP-2] Create bulk reject handler (implements ELE-2)
   - [IMP-3] Add confirmation dialogs (implements ELE-3)
   - [IMP-4] Add progress feedback and error handling (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test bulk approve with 5, 50 items (validates ELE-1)
   - [VAL-2] Test bulk reject with confirmations (validates ELE-2,3)
   - [VAL-3] Test partial failure handling (validates ELE-4)

---

## 5. Quality Assurance & Testing

### T-5.1.0: Component Unit Tests
- **FR Reference**: All FR3 components
- **Impact Weighting**: Code Quality / Reliability
- **Implementation Location**: `__tests__/` directories alongside components
- **Pattern**: Jest + React Testing Library
- **Dependencies**: All component implementations
- **Estimated Human Work Hours**: 24-32 hours
- **Description**: Comprehensive unit test coverage for all UI components
- **Testing Tools**: Jest, React Testing Library, Testing Library User Events
- **Test Coverage Requirements**: 80%+ coverage target
- **Completes Component?**: Yes - Testing infrastructure

**Functional Requirements Acceptance Criteria**:
- Unit tests for all major components
- Tests for user interactions (clicks, input, keyboard)
- Tests for conditional rendering
- Tests for error states
- Tests for loading states
- Snapshot tests for UI regression prevention
- Mock data factories for consistent test data
- CI/CD integration with coverage reporting

#### T-5.1.1: Table Component Test Suite
- **FR Reference**: FR3.3.1
- **Parent Task**: T-5.1.0
- **Implementation Location**: `src/components/conversations/__tests__/ConversationTable.test.tsx`
- **Pattern**: React Testing Library user-centric tests
- **Dependencies**: T-3.2.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Comprehensive test suite for ConversationTable component

**Components/Elements**:
- [T-5.1.1:ELE-1] Rendering Tests: Verify table renders with data
  - Stubs and Code Location(s): Test with mock conversation array
- [T-5.1.1:ELE-2] Sorting Tests: Test sorting on each column
  - Stubs and Code Location(s): Simulate header clicks, verify order
- [T-5.1.1:ELE-3] Selection Tests: Test checkbox selection logic
  - Stubs and Code Location(s): Test individual, select all, clear
- [T-5.1.1:ELE-4] Inline Actions Tests: Test dropdown menu actions
  - Stubs and Code Location(s): Test each action handler

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Create mock data factory (implements ELE-1)
   - [PREP-2] Set up test utilities and helpers (implements all)
2. Implementation Phase:
   - [IMP-1] Write rendering tests (implements ELE-1)
   - [IMP-2] Write sorting tests for each column (implements ELE-2)
   - [IMP-3] Write selection interaction tests (implements ELE-3)
   - [IMP-4] Write inline action tests (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Run tests and verify 80%+ coverage (validates all)
   - [VAL-2] Run tests in CI/CD pipeline (validates all)

### T-5.2.0: Integration Tests
- **FR Reference**: Complete user workflows
- **Impact Weighting**: System Reliability / User Experience
- **Implementation Location**: `cypress/e2e/` or `__tests__/integration/`
- **Pattern**: Cypress or Playwright E2E tests
- **Dependencies**: All feature implementations
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: End-to-end tests for critical user workflows
- **Testing Tools**: Cypress or Playwright
- **Test Coverage Requirements**: Cover 5-10 critical workflows
- **Completes Component?**: Yes - E2E testing

**Functional Requirements Acceptance Criteria**:
- Test: Filter conversations and verify results
- Test: Sort conversations and verify order
- Test: Select multiple and bulk approve
- Test: Search for conversation and open details
- Test: Apply multiple filters simultaneously
- Test: Keyboard navigation through table
- Test: Empty state displays when no data
- Test: Loading states display during async operations

---

## 6. Deployment & Operations

### T-6.1.0: Performance Optimization
- **FR Reference**: FR11.1.1, FR11.1.2
- **Impact Weighting**: User Experience / Scalability
- **Implementation Location**: Various performance improvements
- **Pattern**: React optimization techniques
- **Dependencies**: All implementations complete
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Optimize application for production performance
- **Testing Tools**: Lighthouse, React DevTools Profiler, Chrome DevTools
- **Test Coverage Requirements**: Meet performance targets
- **Completes Component?**: Yes - Production-ready performance

**Functional Requirements Acceptance Criteria**:
- Page load within 2 seconds on standard broadband
- Table filtering responds within 300ms
- Table sorting responds within 200ms
- Database queries optimized to <100ms for indexed lookups
- Lazy loading for heavy components
- Code splitting for route-based chunks
- Memoization of expensive computations
- Virtual scrolling for large datasets (if needed)

#### T-6.1.1: React Performance Optimization
- **FR Reference**: FR11.1.1
- **Parent Task**: T-6.1.0
- **Implementation Location**: Component optimizations throughout app
- **Pattern**: React.memo, useMemo, useCallback
- **Dependencies**: All component implementations
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Apply React performance best practices

**Components/Elements**:
- [T-6.1.1:ELE-1] Component Memoization: React.memo on pure components
  - Stubs and Code Location(s): Wrap expensive components
- [T-6.1.1:ELE-2] useMemo for Computed Values: Memoize filtered/sorted data
  - Stubs and Code Location(s): `train-wireframe/src/components/dashboard/DashboardView.tsx:23-50`
- [T-6.1.1:ELE-3] useCallback for Handlers: Stable function references
  - Stubs and Code Location(s): Event handlers passed as props
- [T-6.1.1:ELE-4] Code Splitting: Dynamic imports for routes
  - Stubs and Code Location(s): Next.js dynamic imports

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Profile app with React DevTools (implements all)
   - [PREP-2] Identify re-render bottlenecks (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Add React.memo to identified components (implements ELE-1)
   - [IMP-2] Add useMemo for expensive calculations (implements ELE-2)
   - [IMP-3] Add useCallback for event handlers (implements ELE-3)
   - [IMP-4] Implement code splitting for routes (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Re-profile and measure improvements (validates all)
   - [VAL-2] Run Lighthouse audit (validates all)

---

## Summary and Next Steps

### Task Summary
**Total Main Tasks:** 20  
**Total Sub-Tasks:** 39  
**Total Elements:** 150+  
**Total Estimated Hours:** 300-400 hours  
**Estimated Timeline:** 8-12 weeks with 4-6 person team

### Critical Path
1. **Week 1-2:** Foundation (Database + API + State Management)
2. **Week 3-5:** Core UI (Layout + Table + Filters)
3. **Week 6-7:** Features (Keyboard Nav + Bulk Actions)
4. **Week 8-9:** Quality (Testing + Bug Fixes)
5. **Week 10-12:** Performance + Deployment

### Risk Mitigation
- **Database Performance:** Monitor query performance early, optimize indexes proactively
- **State Management Complexity:** Start simple, add complexity only as needed
- **API Rate Limiting:** Implement proper caching and debouncing from start
- **Testing Coverage:** Write tests alongside development, not after

### Definition of Done
Each task is complete when:
- ✅ All implementation steps completed
- ✅ All validation tests passing
- ✅ Code reviewed and approved
- ✅ Documentation updated
- ✅ Deployed to staging environment
- ✅ Product owner acceptance

### Resource Requirements
- **Frontend Engineers (2):** Focus on UI components, state management, interactions
- **Backend Engineers (2):** Focus on API endpoints, database, performance
- **Full-Stack Engineer (1):** Bridge frontend/backend, handle integration
- **QA Engineer (1):** Test planning, test automation, quality assurance

---

**Document Status:** Complete - Ready for Implementation  
**Last Updated:** 2025-10-28  
**Version:** 1.0  
**Approval Required:** Product Manager, Technical Lead, Engineering Manager

