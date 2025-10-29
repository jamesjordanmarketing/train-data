# Training Data Platform - Feature & Function Task Inventory (Generated 2025-01-29)
## FR7.1.1, FR7.1.2, FR7.1.3 - Template Management, Scenarios, and Edge Cases

**Product**: Interactive LoRA Conversation Generation Module  
**Scope**: Transform wireframe UI into production-ready template management system with live data integration  
**Wireframe Base**: `train-wireframe/src/components/views/`  
**Target Completion**: 8 weeks

---

## 1. Foundation & Infrastructure

### T-1.1.0: Database Schema - Templates, Scenarios & Edge Cases
- **FR Reference**: FR7.1.1, FR7.1.2, FR7.1.3
- **Impact Weighting**: System Architecture / Data Integrity
- **Implementation Location**: Database migrations, `src/lib/database.ts`
- **Pattern**: Normalized relational database with hierarchical relationships
- **Dependencies**: None (foundation task)
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Implement complete database schema for templates, scenarios, edge cases with proper relationships and constraints
- **Testing Tools**: Supabase SQL testing, migration testing
- **Test Coverage Requirements**: 100% schema validation
- **Completes Component?**: Yes - database foundation complete

**Functional Requirements Acceptance Criteria**:
- Templates table created with fields: id (UUID), name, description, category, structure (text with {{placeholders}}), variables (JSONB), tone, complexityBaseline, styleNotes, exampleConversation, qualityThreshold, requiredElements (array), usageCount, rating, lastModified, createdBy
- Scenarios table created with fields: id, name, description, parentTemplateId (FK), parentTemplateName, context, parameterValues (JSONB), variationCount, status (enum: draft/active/archived), qualityScore, createdAt, createdBy, topic, persona, emotionalArc, generationStatus (enum: not_generated/generated/error), conversationId (FK nullable), errorMessage
- EdgeCases table created with fields: id, title, description, parentScenarioId (FK), parentScenarioName, edgeCaseType (enum: error_condition/boundary_value/unusual_input/complex_combination/failure_scenario), complexity (int 1-10), testStatus (enum: not_tested/passed/failed), testResults (JSONB), createdAt, createdBy
- Foreign key constraints: scenarios.parentTemplateId → templates.id, edgeCases.parentScenarioId → scenarios.id, scenarios.conversationId → conversations.id
- Indexes: templates (category, rating, usageCount), scenarios (parentTemplateId, status, generationStatus), edgeCases (parentScenarioId, testStatus, edgeCaseType)
- Cascading rules: template deletion cascades check (prevent if scenarios exist), scenario deletion cascades check (prevent if edge cases exist)
- RLS policies: user-scoped access for multi-tenancy
- JSON schema validation: variables array structure, parameterValues object structure, testResults object structure

#### T-1.1.1: Templates Table Implementation
- **Parent Task**: T-1.1.0
- **Implementation Location**: Database migration file, `src/lib/types.ts`
- **Dependencies**: None
- **Estimated Work Hours**: 4-5 hours
- **Description**: Create templates table with all required fields, proper constraints, and TypeScript type definitions

**Components/Elements**:
- [T-1.1.1:ELE-1] Templates table schema: UUID primary key, text fields for metadata, JSONB for variables array
  - Code Location: `supabase/migrations/YYYYMMDD_create_templates.sql`
- [T-1.1.1:ELE-2] TypeScript Template type definition
  - Code Location: `src/lib/types.ts:57-74` (already exists in wireframe, verify schema match)
- [T-1.1.1:ELE-3] Template variables schema validation (TemplateVariable type)
  - Code Location: `src/lib/types.ts:76-82` (already exists)
- [T-1.1.1:ELE-4] Database indexes for performance
  - Code Location: Migration file indexes section

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review Template type definition in wireframe (implements ELE-2)
   - [PREP-2] Design JSONB structure for variables array with validation constraints
2. Implementation Phase:
   - [IMP-1] Write CREATE TABLE migration with all fields (implements ELE-1)
   - [IMP-2] Add CHECK constraints for enums and ranges (implements ELE-1)
   - [IMP-3] Create indexes on category, rating, usageCount, createdBy (implements ELE-4)
   - [IMP-4] Set up RLS policies for user isolation (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test migration up/down (validates ELE-1)
   - [VAL-2] Insert test data and verify constraints (validates ELE-1, ELE-3)
   - [VAL-3] Test index usage with EXPLAIN ANALYZE (validates ELE-4)

#### T-1.1.2: Scenarios Table Implementation
- **Parent Task**: T-1.1.0
- **Implementation Location**: Database migration file
- **Dependencies**: T-1.1.1 (templates table must exist for foreign key)
- **Estimated Work Hours**: 4-5 hours
- **Description**: Create scenarios table with foreign key to templates, generation status tracking, and parameter storage

**Components/Elements**:
- [T-1.1.2:ELE-1] Scenarios table schema with FK to templates
  - Code Location: `supabase/migrations/YYYYMMDD_create_scenarios.sql`
- [T-1.1.2:ELE-2] Generation status enum type (not_generated, generated, error)
  - Code Location: Migration file enum definition
- [T-1.1.2:ELE-3] Relationship constraint preventing template deletion if scenarios exist
  - Code Location: Migration file FK constraint with ON DELETE RESTRICT
- [T-1.1.2:ELE-4] Indexes on foreign keys and status fields
  - Code Location: Migration file indexes section

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review Scenario type in `src/lib/types.ts:97-104` (implements ELE-1)
   - [PREP-2] Define generation status enum values
2. Implementation Phase:
   - [IMP-1] Create enum types for status and generationStatus (implements ELE-2)
   - [IMP-2] Create scenarios table with FK to templates (implements ELE-1, ELE-3)
   - [IMP-3] Add indexes on parentTemplateId, status, generationStatus (implements ELE-4)
   - [IMP-4] Add JSONB fields for parameterValues with validation
3. Validation Phase:
   - [VAL-1] Test foreign key constraint (validates ELE-3)
   - [VAL-2] Verify generation status transitions (validates ELE-2)
   - [VAL-3] Test cascade prevention on template delete (validates ELE-3)

#### T-1.1.3: Edge Cases Table Implementation
- **Parent Task**: T-1.1.0
- **Implementation Location**: Database migration file
- **Dependencies**: T-1.1.2 (scenarios table must exist)
- **Estimated Work Hours**: 3-4 hours
- **Description**: Create edge cases table with relationship to scenarios and test result tracking

**Components/Elements**:
- [T-1.1.3:ELE-1] EdgeCases table schema with FK to scenarios
  - Code Location: `supabase/migrations/YYYYMMDD_create_edge_cases.sql`
- [T-1.1.3:ELE-2] Edge case type enum (5 types)
  - Code Location: Migration file enum definition
- [T-1.1.3:ELE-3] Test results JSONB structure
  - Code Location: Migration file with JSON schema validation
- [T-1.1.3:ELE-4] Indexes on type, status, parent scenario
  - Code Location: Migration file indexes section

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review EdgeCase type in `src/lib/types.ts:109-116`
2. Implementation Phase:
   - [IMP-1] Create edgeCaseType enum (implements ELE-2)
   - [IMP-2] Create edge_cases table (implements ELE-1)
   - [IMP-3] Add testResults JSONB field with validation (implements ELE-3)
   - [IMP-4] Create indexes (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test cascade rules from scenarios (validates ELE-1)
   - [VAL-2] Verify test result structure (validates ELE-3)

---

### T-1.2.0: API Service Layer - Data Access Objects
- **FR Reference**: FR7.1.1, FR7.1.2, FR7.1.3
- **Impact Weighting**: Code Quality / Type Safety
- **Implementation Location**: `src/lib/services/`
- **Pattern**: Service layer pattern with TypeScript strict typing
- **Dependencies**: T-1.1.0 (database schema must exist)
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Create service layer classes for templates, scenarios, and edge cases with complete CRUD operations
- **Testing Tools**: Jest, Supertest for API testing
- **Test Coverage Requirements**: 80%+ code coverage
- **Completes Component?**: Yes - service layer complete with full CRUD

**Functional Requirements Acceptance Criteria**:
- TemplateService class created with methods: getAll(), getById(), create(), update(), delete(), duplicate(), search(), getByCategory(), incrementUsageCount(), updateRating()
- ScenarioService class with methods: getAll(), getByTemplateId(), getById(), create(), update(), delete(), updateGenerationStatus(), bulkCreate()
- EdgeCaseService class with methods: getAll(), getByScenarioId(), getById(), create(), update(), delete(), updateTestStatus(), getByType()
- All methods return typed results matching TypeScript interfaces
- Error handling with custom error types (NotFoundError, ValidationError, DatabaseError)
- Transaction support for operations affecting multiple tables
- Query optimization with selective field loading and joins
- Pagination support for list methods (offset/limit or cursor-based)
- Soft delete option where appropriate
- Audit logging for create/update/delete operations

#### T-1.2.1: Template Service Implementation
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/lib/services/template-service.ts`
- **Dependencies**: T-1.1.1
- **Estimated Work Hours**: 6-8 hours
- **Description**: Implement complete template service with all CRUD operations and business logic

**Components/Elements**:
- [T-1.2.1:ELE-1] TemplateService class with Supabase client injection
  - Stubs: New file to be created
- [T-1.2.1:ELE-2] CRUD methods (get, create, update, delete)
  - Stubs: Service methods to be implemented
- [T-1.2.1:ELE-3] Business logic methods (duplicate, search, category filter)
  - Stubs: Advanced query methods
- [T-1.2.1:ELE-4] Usage tracking (increment count, update rating)
  - Stubs: Metrics update methods

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing database service patterns in `src/lib/database.ts` (implements ELE-1)
   - [PREP-2] Define method signatures based on Template type
2. Implementation Phase:
   - [IMP-1] Create TemplateService class with constructor (implements ELE-1)
   - [IMP-2] Implement getAll() with optional filters (implements ELE-2)
   - [IMP-3] Implement create() with validation (implements ELE-2)
   - [IMP-4] Implement update() with partial updates (implements ELE-2)
   - [IMP-5] Implement delete() with cascade check (implements ELE-2)
   - [IMP-6] Implement duplicate() to copy template (implements ELE-3)
   - [IMP-7] Implement search() with text matching (implements ELE-3)
   - [IMP-8] Implement incrementUsageCount() (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Unit tests for each CRUD method (validates ELE-2)
   - [VAL-2] Test cascade prevention on delete (validates ELE-2)
   - [VAL-3] Test search functionality (validates ELE-3)

#### T-1.2.2: Scenario Service Implementation
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/lib/services/scenario-service.ts`
- **Dependencies**: T-1.1.2, T-1.2.1
- **Estimated Work Hours**: 6-8 hours
- **Description**: Implement scenario service with template relationships and generation status management

**Components/Elements**:
- [T-1.2.2:ELE-1] ScenarioService class
  - Stubs: New service file
- [T-1.2.2:ELE-2] CRUD methods with template FK handling
  - Stubs: Service methods
- [T-1.2.2:ELE-3] Generation status update methods
  - Stubs: Status management methods
- [T-1.2.2:ELE-4] Bulk operations for batch scenario creation
  - Stubs: Bulk methods

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review Scenario type and relationships
2. Implementation Phase:
   - [IMP-1] Create ScenarioService class (implements ELE-1)
   - [IMP-2] Implement getByTemplateId() with join (implements ELE-2)
   - [IMP-3] Implement create() with FK validation (implements ELE-2)
   - [IMP-4] Implement updateGenerationStatus() (implements ELE-3)
   - [IMP-5] Implement bulkCreate() for batch operations (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test FK constraint enforcement (validates ELE-2)
   - [VAL-2] Test status transitions (validates ELE-3)
   - [VAL-3] Test bulk operations (validates ELE-4)

#### T-1.2.3: Edge Case Service Implementation
- **Parent Task**: T-1.2.0
- **Implementation Location**: `src/lib/services/edge-case-service.ts`
- **Dependencies**: T-1.1.3, T-1.2.2
- **Estimated Work Hours**: 4-5 hours
- **Description**: Implement edge case service with test result tracking

**Components/Elements**:
- [T-1.2.3:ELE-1] EdgeCaseService class
  - Stubs: New service file
- [T-1.2.3:ELE-2] CRUD methods with scenario FK
  - Stubs: Service methods
- [T-1.2.3:ELE-3] Test status and results management
  - Stubs: Test tracking methods
- [T-1.2.3:ELE-4] Type-based filtering
  - Stubs: Query methods

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review EdgeCase type definition
2. Implementation Phase:
   - [IMP-1] Create EdgeCaseService (implements ELE-1)
   - [IMP-2] Implement getByScenarioId() (implements ELE-2)
   - [IMP-3] Implement updateTestStatus() with results (implements ELE-3)
   - [IMP-4] Implement getByType() filter (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test scenario relationship (validates ELE-2)
   - [VAL-2] Test result structure validation (validates ELE-3)

---

### T-1.3.0: API Routes - RESTful Endpoints
- **FR Reference**: FR7.1.1, FR7.1.2, FR7.1.3
- **Impact Weighting**: Integration / External Access
- **Implementation Location**: `src/app/api/`
- **Pattern**: Next.js App Router API routes with RESTful design
- **Dependencies**: T-1.2.0 (services must exist)
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Create RESTful API endpoints for templates, scenarios, and edge cases
- **Testing Tools**: Postman, Jest with Supertest
- **Test Coverage Requirements**: 90%+ endpoint coverage
- **Completes Component?**: Yes - complete API surface area

**Functional Requirements Acceptance Criteria**:
- Templates API: GET /api/templates (list), GET /api/templates/[id] (single), POST /api/templates (create), PATCH /api/templates/[id] (update), DELETE /api/templates/[id] (delete), POST /api/templates/[id]/duplicate (copy)
- Scenarios API: GET /api/scenarios (list), GET /api/scenarios/[id] (single), POST /api/scenarios (create), PATCH /api/scenarios/[id] (update), DELETE /api/scenarios/[id] (delete), GET /api/templates/[id]/scenarios (by template)
- Edge Cases API: GET /api/edge-cases (list), GET /api/edge-cases/[id] (single), POST /api/edge-cases (create), PATCH /api/edge-cases/[id] (update), DELETE /api/edge-cases/[id] (delete), GET /api/scenarios/[id]/edge-cases (by scenario)
- All endpoints return proper HTTP status codes (200, 201, 400, 404, 500)
- Request validation with Zod schemas
- Error responses in consistent JSON format
- Authentication checks on all endpoints
- Rate limiting for create/update/delete operations
- Response includes pagination metadata for list endpoints
- CORS configuration for cross-origin requests
- API versioning strategy (URL-based or header-based)

#### T-1.3.1: Templates API Routes
- **Parent Task**: T-1.3.0
- **Implementation Location**: `src/app/api/templates/`
- **Dependencies**: T-1.2.1
- **Estimated Work Hours**: 5-6 hours
- **Description**: Create all template-related API endpoints with proper validation and error handling

**Components/Elements**:
- [T-1.3.1:ELE-1] GET /api/templates route with filtering
  - Stubs: `src/app/api/templates/route.ts` GET handler
- [T-1.3.1:ELE-2] GET /api/templates/[id] route
  - Stubs: `src/app/api/templates/[id]/route.ts` GET handler
- [T-1.3.1:ELE-3] POST /api/templates route with validation
  - Stubs: `src/app/api/templates/route.ts` POST handler
- [T-1.3.1:ELE-4] PATCH /api/templates/[id] route
  - Stubs: `src/app/api/templates/[id]/route.ts` PATCH handler
- [T-1.3.1:ELE-5] DELETE /api/templates/[id] route
  - Stubs: `src/app/api/templates/[id]/route.ts` DELETE handler
- [T-1.3.1:ELE-6] POST /api/templates/[id]/duplicate route
  - Stubs: `src/app/api/templates/[id]/duplicate/route.ts` POST handler

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define Zod validation schemas for template requests
   - [PREP-2] Review Next.js App Router API patterns
2. Implementation Phase:
   - [IMP-1] Create GET list endpoint with query params (implements ELE-1)
   - [IMP-2] Create GET single endpoint (implements ELE-2)
   - [IMP-3] Create POST endpoint with Zod validation (implements ELE-3)
   - [IMP-4] Create PATCH endpoint (implements ELE-4)
   - [IMP-5] Create DELETE endpoint with cascade check (implements ELE-5)
   - [IMP-6] Create duplicate endpoint (implements ELE-6)
3. Validation Phase:
   - [VAL-1] API tests for each endpoint (validates all ELEs)
   - [VAL-2] Test error responses (validates error handling)
   - [VAL-3] Test authentication enforcement (validates security)

#### T-1.3.2: Scenarios API Routes
- **Parent Task**: T-1.3.0
- **Implementation Location**: `src/app/api/scenarios/`
- **Dependencies**: T-1.2.2
- **Estimated Work Hours**: 4-5 hours
- **Description**: Create scenario API endpoints with template relationship handling

**Components/Elements**:
- [T-1.3.2:ELE-1] Standard CRUD endpoints for scenarios
  - Stubs: `src/app/api/scenarios/` route files
- [T-1.3.2:ELE-2] GET /api/templates/[id]/scenarios nested route
  - Stubs: `src/app/api/templates/[id]/scenarios/route.ts`
- [T-1.3.2:ELE-3] PATCH generation status update endpoint
  - Stubs: Status update handler

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define scenario validation schemas
2. Implementation Phase:
   - [IMP-1] Create standard CRUD routes (implements ELE-1)
   - [IMP-2] Create nested template scenarios route (implements ELE-2)
   - [IMP-3] Add generation status update logic (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test template relationship (validates ELE-2)
   - [VAL-2] Test status updates (validates ELE-3)

#### T-1.3.3: Edge Cases API Routes
- **Parent Task**: T-1.3.0
- **Implementation Location**: `src/app/api/edge-cases/`
- **Dependencies**: T-1.2.3
- **Estimated Work Hours**: 3-4 hours
- **Description**: Create edge case API endpoints with test result management

**Components/Elements**:
- [T-1.3.3:ELE-1] Standard CRUD endpoints
  - Stubs: `src/app/api/edge-cases/` route files
- [T-1.3.3:ELE-2] GET /api/scenarios/[id]/edge-cases nested route
  - Stubs: Nested route file
- [T-1.3.3:ELE-3] Test result update endpoint
  - Stubs: Test result handler

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define edge case schemas
2. Implementation Phase:
   - [IMP-1] Create CRUD routes (implements ELE-1)
   - [IMP-2] Create nested scenario route (implements ELE-2)
   - [IMP-3] Add test result updates (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test scenario relationship (validates ELE-2)
   - [VAL-2] Test result validation (validates ELE-3)

---

## 2. User Interface Components

### T-2.1.0: Templates View - Complete UI Implementation
- **FR Reference**: FR7.1.1
- **Impact Weighting**: User Experience / Core Feature
- **Implementation Location**: `train-wireframe/src/components/views/TemplatesView.tsx`
- **Pattern**: Card-based grid layout with CRUD modals
- **Dependencies**: T-1.3.1 (API routes must exist)
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Transform wireframe template view into fully functional CRUD interface
- **Testing Tools**: React Testing Library, Playwright for E2E
- **Test Coverage Requirements**: 85%+ component coverage
- **Completes Component?**: Yes - complete template management UI

**Functional Requirements Acceptance Criteria**:
- Card grid displays all templates with name, description, category, rating, usage count
- "New Template" button opens creation modal
- Template card actions: View Details, Edit, Delete (with confirmation)
- Template creation form includes: name (required), description, category dropdown, structure textarea with placeholder highlighting, variables array builder, tone selector, complexity baseline slider, style notes, example conversation, quality threshold, required elements tags
- Template editing preserves existing data and supports partial updates
- Template deletion shows confirmation dialog and checks for dependent scenarios
- Template duplication creates copy with "(Copy)" suffix
- Search/filter bar filters by name, category, rating
- Sort options: name, usage count, rating, last modified
- Variables array builder: add/remove variables, specify type (text/number/dropdown), set default value, add help text
- Structure textarea highlights {{placeholders}} with syntax validation
- Export template as JSON for backup
- Import template from JSON file
- Keyboard shortcuts: N (new), E (edit focused), D (delete focused)

#### T-2.1.1: Template Card Component Enhancement
- **Parent Task**: T-2.1.0
- **Implementation Location**: `train-wireframe/src/components/views/TemplatesView.tsx:52-104`
- **Dependencies**: None (wireframe exists)
- **Estimated Work Hours**: 4-5 hours
- **Description**: Enhance existing template card with full functionality and API integration

**Components/Elements**:
- [T-2.1.1:ELE-1] Template card layout (already implemented in wireframe)
  - Stubs: Lines 52-104 in TemplatesView.tsx
- [T-2.1.1:ELE-2] Dropdown menu actions (View, Edit, Delete)
  - Stubs: Lines 58-81 in TemplatesView.tsx (currently showing toast stubs)
- [T-2.1.1:ELE-3] Delete confirmation dialog integration
  - Stubs: Lines 18-26 using useAppStore.showConfirm
- [T-2.1.1:ELE-4] Rating display with stars
  - Stubs: Lines 92-95 (static display)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing card component structure
   - [PREP-2] Design state management for template operations
2. Implementation Phase:
   - [IMP-1] Connect View action to template detail modal (implements ELE-2)
   - [IMP-2] Connect Edit action to edit modal (implements ELE-2)
   - [IMP-3] Implement delete with API call (implements ELE-2, ELE-3)
   - [IMP-4] Add loading states during operations (implements ELE-1)
   - [IMP-5] Implement error handling with toasts (implements ELE-2)
3. Validation Phase:
   - [VAL-1] Test all card actions (validates ELE-2)
   - [VAL-2] Test delete confirmation (validates ELE-3)
   - [VAL-3] Test error scenarios (validates error handling)

#### T-2.1.2: Template Creation Modal
- **Parent Task**: T-2.1.0
- **Implementation Location**: New modal component file
- **Dependencies**: T-1.3.1 (API endpoints)
- **Estimated Work Hours**: 6-8 hours
- **Description**: Create comprehensive template creation form with validation

**Components/Elements**:
- [T-2.1.2:ELE-1] Modal dialog component
  - Stubs: New file to create
- [T-2.1.2:ELE-2] Form with all template fields
  - Stubs: Form component
- [T-2.1.2:ELE-3] Variables array builder interface
  - Stubs: Dynamic form section
- [T-2.1.2:ELE-4] Structure textarea with placeholder highlighting
  - Stubs: Custom textarea component
- [T-2.1.2:ELE-5] Form validation with React Hook Form + Zod
  - Stubs: Validation logic

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design form layout and field organization
   - [PREP-2] Create Zod validation schema matching API requirements
2. Implementation Phase:
   - [IMP-1] Create modal shell with open/close logic (implements ELE-1)
   - [IMP-2] Build form with all fields (implements ELE-2)
   - [IMP-3] Implement variables array builder (implements ELE-3)
   - [IMP-4] Add structure textarea with {{}} highlighting (implements ELE-4)
   - [IMP-5] Integrate validation (implements ELE-5)
   - [IMP-6] Connect to create API endpoint
3. Validation Phase:
   - [VAL-1] Test form validation rules (validates ELE-5)
   - [VAL-2] Test successful creation (validates API integration)
   - [VAL-3] Test error handling (validates error states)

#### T-2.1.3: Template Edit Modal
- **Parent Task**: T-2.1.0
- **Implementation Location**: Reuse creation modal with edit mode
- **Dependencies**: T-2.1.2
- **Estimated Work Hours**: 3-4 hours
- **Description**: Adapt creation modal for editing existing templates

**Components/Elements**:
- [T-2.1.3:ELE-1] Edit mode flag in modal
  - Stubs: Modal state management
- [T-2.1.3:ELE-2] Data loading for existing template
  - Stubs: API fetch logic
- [T-2.1.3:ELE-3] Update API integration
  - Stubs: PATCH endpoint call

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review creation modal structure
2. Implementation Phase:
   - [IMP-1] Add edit mode to modal (implements ELE-1)
   - [IMP-2] Load template data on open (implements ELE-2)
   - [IMP-3] Connect to update endpoint (implements ELE-3)
   - [IMP-4] Handle partial updates
3. Validation Phase:
   - [VAL-1] Test data loading (validates ELE-2)
   - [VAL-2] Test update operation (validates ELE-3)

#### T-2.1.4: Template Detail View Modal
- **Parent Task**: T-2.1.0
- **Implementation Location**: New modal component
- **Dependencies**: T-1.3.1
- **Estimated Work Hours**: 3-4 hours
- **Description**: Read-only template detail view with full information display

**Components/Elements**:
- [T-2.1.4:ELE-1] Detail modal layout
  - Stubs: New modal component
- [T-2.1.4:ELE-2] Complete template information display
  - Stubs: Read-only fields
- [T-2.1.4:ELE-3] Usage statistics display
  - Stubs: Stats section
- [T-2.1.4:ELE-4] Quick actions (Edit, Duplicate, Delete)
  - Stubs: Action buttons

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design detail view layout
2. Implementation Phase:
   - [IMP-1] Create detail modal (implements ELE-1)
   - [IMP-2] Display all template fields (implements ELE-2)
   - [IMP-3] Add usage statistics (implements ELE-3)
   - [IMP-4] Add action buttons (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test data display (validates ELE-2)
   - [VAL-2] Test action buttons (validates ELE-4)

---

### T-2.2.0: Scenarios View - Complete UI Implementation
- **FR Reference**: FR7.1.2
- **Impact Weighting**: User Experience / Core Feature
- **Implementation Location**: `train-wireframe/src/components/views/ScenariosView.tsx`
- **Pattern**: Table-based layout with generation status tracking
- **Dependencies**: T-1.3.2 (API routes)
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Complete scenarios management interface with generation workflow
- **Testing Tools**: React Testing Library, Playwright
- **Test Coverage Requirements**: 85%+
- **Completes Component?**: Yes - complete scenario management

**Functional Requirements Acceptance Criteria**:
- Table displays scenarios with: checkbox, name, persona, topic, emotional arc, generation status, actions
- "New Scenario" button opens creation form
- Bulk selection with "Generate Selected" batch operation
- Individual "Generate" button per scenario
- Generation status badges: Not Generated (gray), Generated (green), Error (red)
- Error scenarios show error message tooltip
- Generated scenarios show link to conversation
- Scenario creation form: name, parent template selector, persona dropdown, topic, emotional arc, context textarea, parameter values (dynamic based on template)
- Template parameter values auto-populate from template variables
- Scenario editing supports all fields
- Bulk scenario import from CSV
- Filter by: template, generation status, persona, topic
- Sort by: name, creation date, generation status, quality score

#### T-2.2.1: Scenarios Table Component Enhancement
- **Parent Task**: T-2.2.0
- **Implementation Location**: `train-wireframe/src/components/views/ScenariosView.tsx:120-194`
- **Dependencies**: None (wireframe exists)
- **Estimated Work Hours**: 4-5 hours
- **Description**: Complete scenarios table with API integration and generation workflow

**Components/Elements**:
- [T-2.2.1:ELE-1] Table structure (already exists in wireframe)
  - Stubs: Lines 120-194 in ScenariosView.tsx
- [T-2.2.1:ELE-2] Bulk selection logic
  - Stubs: Lines 20-35 (state management exists)
- [T-2.2.1:ELE-3] Generation status badges
  - Stubs: Lines 50-74 (getGenerationStatusBadge function)
- [T-2.2.1:ELE-4] Generate button per row
  - Stubs: Lines 179-187

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review table component structure
   - [PREP-2] Plan generation API integration
2. Implementation Phase:
   - [IMP-1] Connect table to API data source (implements ELE-1)
   - [IMP-2] Implement bulk generation workflow (implements ELE-2)
   - [IMP-3] Connect generate buttons to API (implements ELE-4)
   - [IMP-4] Add loading states during generation (implements ELE-4)
   - [IMP-5] Implement status polling for active generations (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test bulk selection (validates ELE-2)
   - [VAL-2] Test generation workflow (validates ELE-4)
   - [VAL-3] Test status updates (validates ELE-3)

#### T-2.2.2: Scenario Creation Form
- **Parent Task**: T-2.2.0
- **Implementation Location**: New modal component
- **Dependencies**: T-1.3.2, T-2.1.0 (needs template data)
- **Estimated Work Hours**: 6-8 hours
- **Description**: Create scenario form with template relationship and parameter inheritance

**Components/Elements**:
- [T-2.2.2:ELE-1] Modal form component
  - Stubs: New file
- [T-2.2.2:ELE-2] Template selector dropdown
  - Stubs: Dropdown populated from templates API
- [T-2.2.2:ELE-3] Dynamic parameter fields based on selected template
  - Stubs: Dynamic form generation
- [T-2.2.2:ELE-4] Persona and topic selectors
  - Stubs: Dropdown components
- [T-2.2.2:ELE-5] Emotional arc input
  - Stubs: Text or dropdown field

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design form flow: template selection → parameter inputs
   - [PREP-2] Create validation schema
2. Implementation Phase:
   - [IMP-1] Create modal shell (implements ELE-1)
   - [IMP-2] Add template selector with data loading (implements ELE-2)
   - [IMP-3] Implement dynamic parameter form generation (implements ELE-3)
   - [IMP-4] Add persona/topic/emotional arc fields (implements ELE-4, ELE-5)
   - [IMP-5] Connect to create API endpoint
3. Validation Phase:
   - [VAL-1] Test template selection (validates ELE-2)
   - [VAL-2] Test dynamic fields (validates ELE-3)
   - [VAL-3] Test scenario creation (validates API integration)

#### T-2.2.3: Bulk Scenario Generation Workflow
- **Parent Task**: T-2.2.0
- **Implementation Location**: Extend ScenariosView + new progress modal
- **Dependencies**: T-2.2.1
- **Estimated Work Hours**: 5-6 hours
- **Description**: Implement bulk generation with progress tracking and error handling

**Components/Elements**:
- [T-2.2.3:ELE-1] Bulk generation API endpoint
  - Stubs: Backend batch processing endpoint
- [T-2.2.3:ELE-2] Progress modal component
  - Stubs: New modal showing real-time progress
- [T-2.2.3:ELE-3] Error recovery UI
  - Stubs: Failed scenarios retry interface
- [T-2.2.3:ELE-4] Completion summary
  - Stubs: Results dialog

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design batch generation API flow
   - [PREP-2] Plan progress tracking mechanism (polling vs WebSocket)
2. Implementation Phase:
   - [IMP-1] Create batch generation API (implements ELE-1)
   - [IMP-2] Build progress modal with live updates (implements ELE-2)
   - [IMP-3] Add retry logic for failed scenarios (implements ELE-3)
   - [IMP-4] Create completion summary dialog (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test batch generation (validates ELE-1)
   - [VAL-2] Test progress updates (validates ELE-2)
   - [VAL-3] Test error recovery (validates ELE-3)

---

### T-2.3.0: Edge Cases View - Complete UI Implementation
- **FR Reference**: FR7.1.3
- **Impact Weighting**: User Experience / Quality Assurance
- **Implementation Location**: `train-wireframe/src/components/views/EdgeCasesView.tsx`
- **Pattern**: Card-based grid with test status tracking
- **Dependencies**: T-1.3.3 (API routes)
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Complete edge case management interface with testing workflow
- **Testing Tools**: React Testing Library, Playwright
- **Test Coverage Requirements**: 85%+
- **Completes Component?**: Yes - complete edge case management

**Functional Requirements Acceptance Criteria**:
- Card grid displays edge cases with: title, description, type badge, complexity, parent scenario, test status icon
- "New Edge Case" button opens creation form
- "Auto-Generate Edge Cases" button triggers AI-based edge case suggestion
- Type filter buttons: All, Error Conditions, Boundary Values, Unusual Inputs, Complex Combinations, Failure Scenarios
- Test status indicators: Not Tested, Passed (green checkmark), Failed (red X)
- Click card opens detail view with test results
- Edge case creation form: title, description, parent scenario selector, type dropdown, complexity slider (1-10), trigger condition, expected behavior
- Test execution interface: run test button, expected vs actual behavior comparison, pass/fail selection, test date recording
- Test history timeline per edge case
- Coverage report: percentage of edge cases tested, by type breakdown

#### T-2.3.1: Edge Cases Card Grid Enhancement
- **Parent Task**: T-2.3.0
- **Implementation Location**: `train-wireframe/src/components/views/EdgeCasesView.tsx:49-84`
- **Dependencies**: None (wireframe exists)
- **Estimated Work Hours**: 4-5 hours
- **Description**: Complete edge case cards with API integration and test status

**Components/Elements**:
- [T-2.3.1:ELE-1] Card grid layout (exists in wireframe)
  - Stubs: Lines 49-84 in EdgeCasesView.tsx
- [T-2.3.1:ELE-2] Type-specific badge colors
  - Stubs: Lines 8-14 (edgeCaseTypeColors object)
- [T-2.3.1:ELE-3] Test status icons
  - Stubs: Lines 55-63 (status conditionals)
- [T-2.3.1:ELE-4] Click handler to open detail view
  - Stubs: Card onClick handler

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review card component structure
2. Implementation Phase:
   - [IMP-1] Connect cards to API data (implements ELE-1)
   - [IMP-2] Verify badge color logic (implements ELE-2)
   - [IMP-3] Add test status logic (implements ELE-3)
   - [IMP-4] Implement detail view modal trigger (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test card display (validates ELE-1)
   - [VAL-2] Test status indicators (validates ELE-3)

#### T-2.3.2: Edge Case Creation Form
- **Parent Task**: T-2.3.0
- **Implementation Location**: New modal component
- **Dependencies**: T-1.3.3, T-2.2.0 (needs scenario data)
- **Estimated Work Hours**: 5-6 hours
- **Description**: Create edge case form with scenario relationship

**Components/Elements**:
- [T-2.3.2:ELE-1] Modal form component
  - Stubs: New file
- [T-2.3.2:ELE-2] Scenario selector
  - Stubs: Dropdown from scenarios API
- [T-2.3.2:ELE-3] Edge case type selector
  - Stubs: Dropdown with 5 types
- [T-2.3.2:ELE-4] Complexity slider (1-10)
  - Stubs: Slider component
- [T-2.3.2:ELE-5] Trigger condition and expected behavior fields
  - Stubs: Textarea fields

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design form layout
   - [PREP-2] Create validation schema
2. Implementation Phase:
   - [IMP-1] Create modal shell (implements ELE-1)
   - [IMP-2] Add scenario selector (implements ELE-2)
   - [IMP-3] Add type dropdown (implements ELE-3)
   - [IMP-4] Add complexity slider (implements ELE-4)
   - [IMP-5] Add trigger/behavior fields (implements ELE-5)
   - [IMP-6] Connect to create API
3. Validation Phase:
   - [VAL-1] Test form validation (validates all ELEs)
   - [VAL-2] Test creation (validates API integration)

#### T-2.3.3: Test Execution Interface
- **Parent Task**: T-2.3.0
- **Implementation Location**: New test execution modal
- **Dependencies**: T-2.3.1
- **Estimated Work Hours**: 5-6 hours
- **Description**: Interface for recording test results for edge cases

**Components/Elements**:
- [T-2.3.3:ELE-1] Test execution modal
  - Stubs: New modal component
- [T-2.3.3:ELE-2] Expected vs actual behavior comparison
  - Stubs: Side-by-side text areas
- [T-2.3.3:ELE-3] Pass/fail selector with notes
  - Stubs: Radio buttons and textarea
- [T-2.3.3:ELE-4] Test history timeline
  - Stubs: Timeline component showing past tests

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design test recording UI
2. Implementation Phase:
   - [IMP-1] Create test modal (implements ELE-1)
   - [IMP-2] Add comparison view (implements ELE-2)
   - [IMP-3] Add pass/fail selection (implements ELE-3)
   - [IMP-4] Add test history (implements ELE-4)
   - [IMP-5] Connect to update test status API
3. Validation Phase:
   - [VAL-1] Test result recording (validates ELE-3)
   - [VAL-2] Test history display (validates ELE-4)

---

## 3. Advanced Features

### T-3.1.0: Template Variable System
- **FR Reference**: FR7.1.1
- **Impact Weighting**: Flexibility / Code Generation
- **Implementation Location**: `src/lib/template-engine/`
- **Pattern**: Template engine with variable substitution
- **Dependencies**: T-1.2.1, T-2.1.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Implement template variable parsing and substitution engine
- **Testing Tools**: Jest for unit testing
- **Test Coverage Requirements**: 95%+
- **Completes Component?**: Yes - template engine complete

**Functional Requirements Acceptance Criteria**:
- Parse template structure to identify {{placeholder}} variables
- Validate all placeholders have corresponding variable definitions
- Substitute variables with actual values from scenario parameters
- Support nested variables: {{persona.name}}, {{context.location}}
- Support conditional variables: {{persona ? 'text' : 'alternative'}}
- Support default values: {{variable || 'default text'}}
- Highlight missing required variables during template validation
- Preview resolved template before scenario creation
- Variable type coercion (text, number, boolean)
- Escape special characters in variable values

#### T-3.1.1: Template Parser Implementation
- **Parent Task**: T-3.1.0
- **Implementation Location**: `src/lib/template-engine/parser.ts`
- **Dependencies**: None
- **Estimated Work Hours**: 4-5 hours
- **Description**: Create template parsing engine to extract variables and structure

**Components/Elements**:
- [T-3.1.1:ELE-1] Regex-based variable extraction
  - Stubs: New parser module
- [T-3.1.1:ELE-2] Variable type inference
  - Stubs: Type detection logic
- [T-3.1.1:ELE-3] Validation logic
  - Stubs: Missing variable detection

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design regex patterns for {{}} extraction
   - [PREP-2] Define variable object structure
2. Implementation Phase:
   - [IMP-1] Implement variable extraction (implements ELE-1)
   - [IMP-2] Add type inference (implements ELE-2)
   - [IMP-3] Add validation (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test various template patterns (validates ELE-1)
   - [VAL-2] Test validation logic (validates ELE-3)

#### T-3.1.2: Variable Substitution Engine
- **Parent Task**: T-3.1.0
- **Implementation Location**: `src/lib/template-engine/substitution.ts`
- **Dependencies**: T-3.1.1
- **Estimated Work Hours**: 4-5 hours
- **Description**: Implement variable value substitution with type coercion

**Components/Elements**:
- [T-3.1.2:ELE-1] Substitution algorithm
  - Stubs: New substitution module
- [T-3.1.2:ELE-2] Conditional logic support
  - Stubs: Ternary operator parsing
- [T-3.1.2:ELE-3] Default value support
  - Stubs: || operator parsing
- [T-3.1.2:ELE-4] Type coercion
  - Stubs: Type conversion functions

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design substitution algorithm
2. Implementation Phase:
   - [IMP-1] Implement basic substitution (implements ELE-1)
   - [IMP-2] Add conditional support (implements ELE-2)
   - [IMP-3] Add default values (implements ELE-3)
   - [IMP-4] Add type coercion (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test substitution (validates all ELEs)
   - [VAL-2] Test edge cases

---

### T-3.2.0: Import/Export Functionality
- **FR Reference**: FR7.1.1, FR7.1.2, FR7.1.3
- **Impact Weighting**: Data Portability / Backup
- **Implementation Location**: UI components + API routes
- **Pattern**: File upload/download with validation
- **Dependencies**: T-2.1.0, T-2.2.0, T-2.3.0
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Implement JSON/CSV import and export for templates, scenarios, edge cases
- **Testing Tools**: File validation testing
- **Test Coverage Requirements**: 80%+
- **Completes Component?**: Yes - import/export complete

**Functional Requirements Acceptance Criteria**:
- Export templates to JSON with all fields and metadata
- Export scenarios to JSON or CSV with template references
- Export edge cases to JSON with scenario references
- Import templates from JSON with validation
- Import scenarios from CSV bulk upload
- Import validation: check required fields, data types, FK references
- Import preview: show data to be imported before confirmation
- Import conflict resolution: skip, overwrite, or merge duplicates
- Export file naming: `templates_YYYY-MM-DD.json`
- Export includes timestamp and user metadata

#### T-3.2.1: Template Export
- **Parent Task**: T-3.2.0
- **Implementation Location**: `src/app/api/templates/export/route.ts` + UI button
- **Dependencies**: T-2.1.0
- **Estimated Work Hours**: 2-3 hours
- **Description**: Export templates to JSON format

**Components/Elements**:
- [T-3.2.1:ELE-1] Export API endpoint
  - Stubs: New route file
- [T-3.2.1:ELE-2] Export button in templates view
  - Stubs: Button in TemplatesView
- [T-3.2.1:ELE-3] JSON formatting with metadata
  - Stubs: Export formatter

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define JSON export schema
2. Implementation Phase:
   - [IMP-1] Create export endpoint (implements ELE-1)
   - [IMP-2] Add export button (implements ELE-2)
   - [IMP-3] Format JSON output (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test export output (validates ELE-3)
   - [VAL-2] Test file download (validates integration)

#### T-3.2.2: Template Import
- **Parent Task**: T-3.2.0
- **Implementation Location**: `src/app/api/templates/import/route.ts` + UI modal
- **Dependencies**: T-2.1.0
- **Estimated Work Hours**: 4-5 hours
- **Description**: Import templates from JSON with validation

**Components/Elements**:
- [T-3.2.2:ELE-1] Import API endpoint with validation
  - Stubs: New route file
- [T-3.2.2:ELE-2] File upload UI component
  - Stubs: File input modal
- [T-3.2.2:ELE-3] Import preview dialog
  - Stubs: Preview modal
- [T-3.2.2:ELE-4] Conflict resolution logic
  - Stubs: Duplicate handling

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define import validation rules
2. Implementation Phase:
   - [IMP-1] Create import endpoint (implements ELE-1)
   - [IMP-2] Add file upload UI (implements ELE-2)
   - [IMP-3] Add preview (implements ELE-3)
   - [IMP-4] Handle conflicts (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test validation (validates ELE-1)
   - [VAL-2] Test conflict resolution (validates ELE-4)

#### T-3.2.3: Scenario CSV Import
- **Parent Task**: T-3.2.0
- **Implementation Location**: `src/app/api/scenarios/import/route.ts`
- **Dependencies**: T-2.2.0
- **Estimated Work Hours**: 4-5 hours
- **Description**: Bulk import scenarios from CSV format

**Components/Elements**:
- [T-3.2.3:ELE-1] CSV parser
  - Stubs: CSV parsing library integration
- [T-3.2.3:ELE-2] Bulk import API
  - Stubs: Batch insert endpoint
- [T-3.2.3:ELE-3] CSV template download
  - Stubs: Template generation endpoint
- [T-3.2.3:ELE-4] Import progress tracking
  - Stubs: Batch job tracking

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define CSV format specification
   - [PREP-2] Create CSV template file
2. Implementation Phase:
   - [IMP-1] Implement CSV parser (implements ELE-1)
   - [IMP-2] Create bulk import endpoint (implements ELE-2)
   - [IMP-3] Add template download (implements ELE-3)
   - [IMP-4] Track import progress (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test CSV parsing (validates ELE-1)
   - [VAL-2] Test bulk import (validates ELE-2)

---

### T-3.3.0: Auto-Generate Edge Cases (AI-Powered)
- **FR Reference**: FR7.1.3
- **Impact Weighting**: Productivity / Quality
- **Implementation Location**: `src/lib/ai-generation/` + API route
- **Pattern**: Claude API integration for edge case generation
- **Dependencies**: T-2.3.0, AI configuration
- **Estimated Human Work Hours**: 10-12 hours
- **Description**: AI-powered edge case suggestion based on scenarios
- **Testing Tools**: AI output validation
- **Test Coverage Requirements**: 70%+
- **Completes Component?**: Yes - auto-generation feature complete

**Functional Requirements Acceptance Criteria**:
- "Auto-Generate Edge Cases" button triggers AI analysis
- Analyze scenario to identify potential edge cases
- Generate 5-10 edge case suggestions per scenario
- Suggestions include: title, description, type, expected behavior, complexity estimate
- User can review suggestions before accepting
- Batch accept selected suggestions
- AI uses scenario context and template structure for relevant edge cases
- Error handling for AI API failures
- Rate limiting to prevent excessive API usage
- Cost estimation before generation

#### T-3.3.1: Edge Case Generation Prompt Engineering
- **Parent Task**: T-3.3.0
- **Implementation Location**: `src/lib/ai-generation/edge-case-prompts.ts`
- **Dependencies**: None
- **Estimated Work Hours**: 4-5 hours
- **Description**: Design and test prompts for edge case generation

**Components/Elements**:
- [T-3.3.1:ELE-1] Prompt template for edge case analysis
  - Stubs: New prompt file
- [T-3.3.1:ELE-2] Context preparation from scenario data
  - Stubs: Context builder
- [T-3.3.1:ELE-3] Response parser for AI output
  - Stubs: JSON parser

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Research edge case patterns
   - [PREP-2] Design prompt structure
2. Implementation Phase:
   - [IMP-1] Create prompt template (implements ELE-1)
   - [IMP-2] Build context preparation (implements ELE-2)
   - [IMP-3] Implement response parser (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test with sample scenarios (validates prompt quality)
   - [VAL-2] Validate output structure (validates ELE-3)

#### T-3.3.2: Auto-Generation API Endpoint
- **Parent Task**: T-3.3.0
- **Implementation Location**: `src/app/api/edge-cases/auto-generate/route.ts`
- **Dependencies**: T-3.3.1, AI config
- **Estimated Work Hours**: 4-5 hours
- **Description**: API endpoint for triggering edge case auto-generation

**Components/Elements**:
- [T-3.3.2:ELE-1] POST endpoint accepting scenario ID
  - Stubs: New route file
- [T-3.3.2:ELE-2] Claude API integration
  - Stubs: AI client wrapper
- [T-3.3.2:ELE-3] Response formatting
  - Stubs: Output formatter
- [T-3.3.2:ELE-4] Error handling and rate limiting
  - Stubs: Error handlers

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review Claude API configuration
2. Implementation Phase:
   - [IMP-1] Create endpoint (implements ELE-1)
   - [IMP-2] Integrate Claude API (implements ELE-2)
   - [IMP-3] Format responses (implements ELE-3)
   - [IMP-4] Add error handling (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test generation (validates integration)
   - [VAL-2] Test rate limiting (validates ELE-4)

#### T-3.3.3: Edge Case Suggestion Review UI
- **Parent Task**: T-3.3.0
- **Implementation Location**: New modal component
- **Dependencies**: T-3.3.2
- **Estimated Work Hours**: 3-4 hours
- **Description**: UI for reviewing and accepting AI-generated edge case suggestions

**Components/Elements**:
- [T-3.3.3:ELE-1] Suggestion review modal
  - Stubs: New modal component
- [T-3.3.3:ELE-2] Suggestion list with checkboxes
  - Stubs: List component
- [T-3.3.3:ELE-3] Batch accept button
  - Stubs: Bulk action button
- [T-3.3.3:ELE-4] Edit suggestion before accepting
  - Stubs: Inline edit capability

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design review UI layout
2. Implementation Phase:
   - [IMP-1] Create modal (implements ELE-1)
   - [IMP-2] Display suggestions (implements ELE-2)
   - [IMP-3] Add batch accept (implements ELE-3)
   - [IMP-4] Add inline editing (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test review flow (validates all ELEs)
   - [VAL-2] Test batch operations (validates ELE-3)

---

## 4. Quality Assurance & Testing

### T-4.1.0: Comprehensive Test Suite
- **FR Reference**: FR7.1.1, FR7.1.2, FR7.1.3
- **Impact Weighting**: Reliability / Maintainability
- **Implementation Location**: `tests/` directory
- **Pattern**: Unit, integration, E2E testing strategy
- **Dependencies**: All implementation tasks
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Complete test coverage for templates, scenarios, edge cases
- **Testing Tools**: Jest, React Testing Library, Playwright
- **Test Coverage Requirements**: 85%+ overall
- **Completes Component?**: Yes - comprehensive test suite

**Functional Requirements Acceptance Criteria**:
- Unit tests for all service methods (85%+ coverage)
- Unit tests for template parser and substitution engine (95%+ coverage)
- Integration tests for all API endpoints (90%+ coverage)
- Component tests for all UI components (80%+ coverage)
- E2E tests for complete workflows: create template → create scenario → generate conversation
- E2E tests for import/export workflows
- E2E tests for edge case generation and testing
- Performance tests for database queries (< 100ms for indexed lookups)
- Load tests for batch operations (100+ scenarios)
- Error scenario tests (API failures, validation errors, FK violations)

#### T-4.1.1: Service Layer Unit Tests
- **Parent Task**: T-4.1.0
- **Implementation Location**: `tests/unit/services/`
- **Dependencies**: T-1.2.0
- **Estimated Work Hours**: 6-8 hours
- **Description**: Unit tests for template, scenario, and edge case services

**Components/Elements**:
- [T-4.1.1:ELE-1] TemplateService test suite
  - Stubs: `tests/unit/services/template-service.test.ts`
- [T-4.1.1:ELE-2] ScenarioService test suite
  - Stubs: `tests/unit/services/scenario-service.test.ts`
- [T-4.1.1:ELE-3] EdgeCaseService test suite
  - Stubs: `tests/unit/services/edge-case-service.test.ts`
- [T-4.1.1:ELE-4] Mock Supabase client
  - Stubs: `tests/mocks/supabase.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up Jest configuration
   - [PREP-2] Create Supabase mocks
2. Implementation Phase:
   - [IMP-1] Write template service tests (implements ELE-1)
   - [IMP-2] Write scenario service tests (implements ELE-2)
   - [IMP-3] Write edge case service tests (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Verify 85%+ coverage (validates all ELEs)
   - [VAL-2] Test error scenarios

#### T-4.1.2: API Integration Tests
- **Parent Task**: T-4.1.0
- **Implementation Location**: `tests/integration/api/`
- **Dependencies**: T-1.3.0
- **Estimated Work Hours**: 6-8 hours
- **Description**: Integration tests for all API endpoints

**Components/Elements**:
- [T-4.1.2:ELE-1] Templates API test suite
  - Stubs: `tests/integration/api/templates.test.ts`
- [T-4.1.2:ELE-2] Scenarios API test suite
  - Stubs: `tests/integration/api/scenarios.test.ts`
- [T-4.1.2:ELE-3] Edge cases API test suite
  - Stubs: `tests/integration/api/edge-cases.test.ts`
- [T-4.1.2:ELE-4] Test database setup/teardown
  - Stubs: `tests/helpers/db-setup.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up test database
   - [PREP-2] Configure Supertest
2. Implementation Phase:
   - [IMP-1] Write templates API tests (implements ELE-1)
   - [IMP-2] Write scenarios API tests (implements ELE-2)
   - [IMP-3] Write edge cases API tests (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Verify all endpoints tested (validates all ELEs)
   - [VAL-2] Test error responses

#### T-4.1.3: E2E Workflow Tests
- **Parent Task**: T-4.1.0
- **Implementation Location**: `tests/e2e/`
- **Dependencies**: T-2.0.0 (all UI components)
- **Estimated Work Hours**: 6-8 hours
- **Description**: End-to-end tests for complete user workflows

**Components/Elements**:
- [T-4.1.3:ELE-1] Template creation workflow test
  - Stubs: `tests/e2e/template-workflow.spec.ts`
- [T-4.1.3:ELE-2] Scenario creation and generation workflow test
  - Stubs: `tests/e2e/scenario-workflow.spec.ts`
- [T-4.1.3:ELE-3] Edge case testing workflow test
  - Stubs: `tests/e2e/edge-case-workflow.spec.ts`
- [T-4.1.3:ELE-4] Import/export workflow test
  - Stubs: `tests/e2e/import-export.spec.ts`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up Playwright configuration
   - [PREP-2] Create test fixtures
2. Implementation Phase:
   - [IMP-1] Write template workflow test (implements ELE-1)
   - [IMP-2] Write scenario workflow test (implements ELE-2)
   - [IMP-3] Write edge case workflow test (implements ELE-3)
   - [IMP-4] Write import/export test (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Run all E2E tests (validates complete workflows)
   - [VAL-2] Verify UI interactions

---

### T-4.2.0: Performance Optimization
- **FR Reference**: FR7.1.1, FR7.1.2, FR7.1.3
- **Impact Weighting**: User Experience / Scalability
- **Implementation Location**: Database indexes, query optimization, caching
- **Pattern**: Performance profiling and optimization
- **Dependencies**: All implementation complete
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Optimize database queries, API responses, and UI rendering
- **Testing Tools**: Lighthouse, React Profiler, Database EXPLAIN ANALYZE
- **Test Coverage Requirements**: Meet all performance targets
- **Completes Component?**: Yes - performance optimization complete

**Functional Requirements Acceptance Criteria**:
- Database query performance < 100ms for indexed lookups
- API response times < 500ms for list endpoints
- UI initial render < 2 seconds
- Template list loads < 300ms
- Scenario table loads < 500ms with 100+ rows
- Edge case cards load < 300ms
- Search/filter operations < 200ms
- Modal open animations < 150ms
- Pagination changes < 100ms
- Lighthouse performance score > 90

#### T-4.2.1: Database Query Optimization
- **Parent Task**: T-4.2.0
- **Implementation Location**: Database schema, service layer
- **Dependencies**: T-1.1.0, T-1.2.0
- **Estimated Work Hours**: 4-5 hours
- **Description**: Optimize database queries with proper indexing and query analysis

**Components/Elements**:
- [T-4.2.1:ELE-1] Index creation for frequently queried fields
  - Stubs: Migration file with indexes
- [T-4.2.1:ELE-2] Query plan analysis
  - Stubs: EXPLAIN ANALYZE tests
- [T-4.2.1:ELE-3] Selective field loading
  - Stubs: Service method optimizations
- [T-4.2.1:ELE-4] Join optimization
  - Stubs: Query restructuring

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Profile slow queries
   - [PREP-2] Analyze query plans
2. Implementation Phase:
   - [IMP-1] Add missing indexes (implements ELE-1)
   - [IMP-2] Optimize queries (implements ELE-3, ELE-4)
   - [IMP-3] Test performance improvements
3. Validation Phase:
   - [VAL-1] Verify query times (validates all ELEs)
   - [VAL-2] Test with large datasets

#### T-4.2.2: API Response Optimization
- **Parent Task**: T-4.2.0
- **Implementation Location**: API routes, caching layer
- **Dependencies**: T-1.3.0
- **Estimated Work Hours**: 3-4 hours
- **Description**: Optimize API response times with caching and pagination

**Components/Elements**:
- [T-4.2.2:ELE-1] Response caching
  - Stubs: Cache middleware
- [T-4.2.2:ELE-2] Pagination implementation
  - Stubs: Offset/limit or cursor-based
- [T-4.2.2:ELE-3] Field selection
  - Stubs: Query param for field selection
- [T-4.2.2:ELE-4] Response compression
  - Stubs: Compression middleware

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Identify cacheable endpoints
2. Implementation Phase:
   - [IMP-1] Add caching (implements ELE-1)
   - [IMP-2] Implement pagination (implements ELE-2)
   - [IMP-3] Add field selection (implements ELE-3)
   - [IMP-4] Add compression (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test response times (validates all ELEs)
   - [VAL-2] Test cache invalidation

#### T-4.2.3: UI Rendering Optimization
- **Parent Task**: T-4.2.0
- **Implementation Location**: UI components
- **Dependencies**: T-2.0.0 (all UI)
- **Estimated Work Hours**: 3-4 hours
- **Description**: Optimize React component rendering with memoization and lazy loading

**Components/Elements**:
- [T-4.2.3:ELE-1] React.memo for expensive components
  - Stubs: Component optimizations
- [T-4.2.3:ELE-2] useMemo/useCallback hooks
  - Stubs: Hook optimizations
- [T-4.2.3:ELE-3] Lazy loading for modals
  - Stubs: Dynamic imports
- [T-4.2.3:ELE-4] Virtual scrolling for large lists
  - Stubs: Virtual list implementation

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Profile component renders
2. Implementation Phase:
   - [IMP-1] Add memoization (implements ELE-1, ELE-2)
   - [IMP-2] Add lazy loading (implements ELE-3)
   - [IMP-3] Add virtual scrolling (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test render performance (validates all ELEs)
   - [VAL-2] Run Lighthouse audit

---

## 5. Documentation & Training

### T-5.1.0: User Documentation
- **FR Reference**: FR7.1.1, FR7.1.2, FR7.1.3
- **Impact Weighting**: Adoption / Support
- **Implementation Location**: `docs/` directory
- **Pattern**: Markdown documentation with screenshots
- **Dependencies**: All features complete
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Comprehensive user documentation for template management features
- **Testing Tools**: Documentation review, usability testing
- **Test Coverage Requirements**: Cover all features
- **Completes Component?**: Yes - complete user documentation

**Functional Requirements Acceptance Criteria**:
- Getting Started guide for templates, scenarios, and edge cases
- Template management guide: create, edit, delete, duplicate, import/export
- Variable system documentation with examples
- Scenario creation guide with template parameter inheritance
- Edge case management guide with testing workflow
- Auto-generate edge cases feature guide
- Import/export file format specifications
- Troubleshooting common issues guide
- Video tutorials for key workflows (5-7 minutes each)
- Embedded help tooltips in UI
- Keyboard shortcuts reference

#### T-5.1.1: Getting Started Guide
- **Parent Task**: T-5.1.0
- **Implementation Location**: `docs/templates-scenarios-edge-cases/getting-started.md`
- **Dependencies**: None
- **Estimated Work Hours**: 4-5 hours
- **Description**: Create comprehensive getting started guide for new users

**Components/Elements**:
- [T-5.1.1:ELE-1] Overview of template system
  - Stubs: Introduction section
- [T-5.1.1:ELE-2] Step-by-step first template creation
  - Stubs: Tutorial with screenshots
- [T-5.1.1:ELE-3] Creating scenarios from template
  - Stubs: Tutorial section
- [T-5.1.1:ELE-4] Edge case testing workflow
  - Stubs: Tutorial section

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Outline guide structure
   - [PREP-2] Capture screenshots
2. Implementation Phase:
   - [IMP-1] Write overview (implements ELE-1)
   - [IMP-2] Write template tutorial (implements ELE-2)
   - [IMP-3] Write scenario tutorial (implements ELE-3)
   - [IMP-4] Write edge case tutorial (implements ELE-4)
3. Validation Phase:
   - [VAL-1] User testing with docs (validates clarity)
   - [VAL-2] Technical review

#### T-5.1.2: Feature-Specific Guides
- **Parent Task**: T-5.1.0
- **Implementation Location**: `docs/templates-scenarios-edge-cases/` (multiple files)
- **Dependencies**: T-5.1.1
- **Estimated Work Hours**: 6-8 hours
- **Description**: Detailed guides for each feature area

**Components/Elements**:
- [T-5.1.2:ELE-1] Template management guide
  - Stubs: `templates-guide.md`
- [T-5.1.2:ELE-2] Scenario management guide
  - Stubs: `scenarios-guide.md`
- [T-5.1.2:ELE-3] Edge case management guide
  - Stubs: `edge-cases-guide.md`
- [T-5.1.2:ELE-4] Import/export guide
  - Stubs: `import-export-guide.md`

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Organize features by guide
2. Implementation Phase:
   - [IMP-1] Write templates guide (implements ELE-1)
   - [IMP-2] Write scenarios guide (implements ELE-2)
   - [IMP-3] Write edge cases guide (implements ELE-3)
   - [IMP-4] Write import/export guide (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Review for completeness (validates all ELEs)
   - [VAL-2] Update screenshots

#### T-5.1.3: Video Tutorials
- **Parent Task**: T-5.1.0
- **Implementation Location**: Video hosting + embedded in docs
- **Dependencies**: T-5.1.2
- **Estimated Work Hours**: 4-6 hours
- **Description**: Create video tutorials for key workflows

**Components/Elements**:
- [T-5.1.3:ELE-1] Template creation video (5 min)
  - Stubs: Screen recording + narration
- [T-5.1.3:ELE-2] Scenario bulk creation video (5 min)
  - Stubs: Screen recording
- [T-5.1.3:ELE-3] Edge case generation video (5 min)
  - Stubs: Screen recording
- [T-5.1.3:ELE-4] Import/export workflow video (5 min)
  - Stubs: Screen recording

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Write video scripts
   - [PREP-2] Set up recording environment
2. Implementation Phase:
   - [IMP-1] Record template video (implements ELE-1)
   - [IMP-2] Record scenario video (implements ELE-2)
   - [IMP-3] Record edge case video (implements ELE-3)
   - [IMP-4] Record import/export video (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Review videos (validates quality)
   - [VAL-2] Embed in documentation

---

### T-5.2.0: Technical Documentation
- **FR Reference**: FR7.1.1, FR7.1.2, FR7.1.3
- **Impact Weighting**: Maintainability / Developer Onboarding
- **Implementation Location**: `docs/technical/`
- **Pattern**: API documentation, architecture diagrams, code comments
- **Dependencies**: All implementation complete
- **Estimated Human Work Hours**: 8-10 hours
- **Description**: Technical documentation for developers and maintainers
- **Testing Tools**: Documentation linter, code comment coverage
- **Test Coverage Requirements**: All public APIs documented
- **Completes Component?**: Yes - complete technical documentation

**Functional Requirements Acceptance Criteria**:
- Database schema documentation with ER diagram
- API reference for all endpoints (OpenAPI/Swagger format)
- Service layer architecture documentation
- Template engine technical specification
- Type definitions documentation (TypeScript interfaces)
- Testing strategy and guidelines
- Deployment and environment configuration
- Security and authentication documentation
- Performance tuning guide
- Troubleshooting and debugging guide

#### T-5.2.1: API Reference Documentation
- **Parent Task**: T-5.2.0
- **Implementation Location**: `docs/api/` + OpenAPI spec
- **Dependencies**: T-1.3.0
- **Estimated Work Hours**: 4-5 hours
- **Description**: Generate comprehensive API reference documentation

**Components/Elements**:
- [T-5.2.1:ELE-1] OpenAPI specification file
  - Stubs: `openapi.yaml`
- [T-5.2.1:ELE-2] API reference generation
  - Stubs: Swagger UI or similar
- [T-5.2.1:ELE-3] Request/response examples
  - Stubs: Example payloads
- [T-5.2.1:ELE-4] Authentication documentation
  - Stubs: Auth guide

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Set up OpenAPI tooling
2. Implementation Phase:
   - [IMP-1] Write OpenAPI spec (implements ELE-1)
   - [IMP-2] Generate API docs (implements ELE-2)
   - [IMP-3] Add examples (implements ELE-3)
   - [IMP-4] Document auth (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Validate spec (validates ELE-1)
   - [VAL-2] Test examples (validates ELE-3)

#### T-5.2.2: Architecture Documentation
- **Parent Task**: T-5.2.0
- **Implementation Location**: `docs/architecture/`
- **Dependencies**: All implementation
- **Estimated Work Hours**: 4-5 hours
- **Description**: Document system architecture and design decisions

**Components/Elements**:
- [T-5.2.2:ELE-1] System architecture diagram
  - Stubs: Diagram file (Mermaid or similar)
- [T-5.2.2:ELE-2] Database ER diagram
  - Stubs: ER diagram
- [T-5.2.2:ELE-3] Service layer design doc
  - Stubs: Design documentation
- [T-5.2.2:ELE-4] Template engine specification
  - Stubs: Technical spec

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Choose diagramming tool
2. Implementation Phase:
   - [IMP-1] Create architecture diagram (implements ELE-1)
   - [IMP-2] Create ER diagram (implements ELE-2)
   - [IMP-3] Document service layer (implements ELE-3)
   - [IMP-4] Document template engine (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Technical review (validates accuracy)
   - [VAL-2] Update diagrams as needed

---

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2) - Database & Services
- **Tasks**: T-1.1.0, T-1.2.0
- **Deliverables**: Database schema, service layer, basic API endpoints
- **Milestones**: Can create/read/update/delete templates, scenarios, edge cases via API

### Phase 2: Core UI (Weeks 3-4) - Basic CRUD Interfaces
- **Tasks**: T-1.3.0, T-2.1.0 (T-2.1.1, T-2.1.2), T-2.2.0 (T-2.2.1, T-2.2.2), T-2.3.0 (T-2.3.1, T-2.3.2)
- **Deliverables**: Templates view with CRUD, scenarios view with creation, edge cases view with creation
- **Milestones**: Users can manage templates, scenarios, and edge cases through UI

### Phase 3: Advanced Features (Weeks 5-6) - Enhancement & Integration
- **Tasks**: T-2.1.3, T-2.1.4, T-2.2.3, T-2.3.3, T-3.1.0, T-3.2.0
- **Deliverables**: Edit/detail modals, bulk generation, test execution, template variables, import/export
- **Milestones**: Complete feature set operational

### Phase 4: AI & Automation (Week 7) - Auto-Generation
- **Tasks**: T-3.3.0
- **Deliverables**: AI-powered edge case generation
- **Milestones**: Auto-generate feature working

### Phase 5: Quality & Documentation (Week 8) - Testing & Docs
- **Tasks**: T-4.1.0, T-4.2.0, T-5.1.0, T-5.2.0
- **Deliverables**: Test suite, performance optimization, user and technical documentation
- **Milestones**: Production-ready with comprehensive documentation

---

## Summary

**Total Tasks**: 50+ granular tasks organized into 15 main task groups  
**Total Estimated Hours**: 180-220 hours  
**Completion Timeline**: 8 weeks with dedicated developer(s)  
**Test Coverage Target**: 85%+ overall  
**Documentation Coverage**: Complete user and technical docs

**Key Dependencies**:
1. Database schema must be completed first
2. Service layer requires database schema
3. API routes require service layer
4. UI components require API routes
5. Advanced features require core UI
6. Testing requires all implementation complete

**Risk Mitigation**:
- Modular task structure allows parallel development where possible
- Comprehensive acceptance criteria ensure quality
- Testing integrated throughout development
- Documentation created alongside features

**Production Readiness Checklist**:
- ✅ Database schema normalized and indexed
- ✅ Service layer with 85%+ test coverage
- ✅ RESTful API endpoints fully tested
- ✅ UI components with accessibility compliance
- ✅ Template variable system operational
- ✅ Import/export functionality complete
- ✅ AI auto-generation feature working
- ✅ Performance targets met
- ✅ User documentation complete
- ✅ Technical documentation complete

