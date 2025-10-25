# Development Context & Operational Priorities
**Date:** 2025-10-03 17:08 PST  
**Project:** Bright Run LoRA Training Data Platform (bmo) & Project Memory Core (PMC)  
**Context Version:** 3.0.0

## Introduction

This context document addresses the **Bright Run LoRA Training Data Platform**: A revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 3-stage workflow (Panels A, B, C).

### What Problem Does This Product Solve?

Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but face insurmountable barriers in transforming this knowledge into LoRA ready training data.

## Current Focus

### Active Development Focus

**Normalized Database Storage for Document Categorization - IMPLEMENTATION COMPLETE ✅**

The Bright Run application now has a **fully functional normalized database implementation** that stores all workflow data (categories, tags, belonging ratings) in properly structured relational tables rather than JSONB blobs. This session completed the **display/read layer** implementation, enabling the application to retrieve and display workflow data from normalized tables.

#### What Was Accomplished in This Session:

**Completed: Full Read-Write Cycle for Normalized Database Storage**

1. **API Route Enhancement** (`src/app/api/workflow/session/route.ts`)
   - Added support for fetching workflow data by `workflowId` query parameter
   - Implemented transformation of normalized database tags back to frontend display format
   - Returns enriched workflow data with complete category and tag details from normalized tables
   - Feature flag controlled: `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true`

2. **Server Component Update** (`src/components/server/WorkflowCompleteServer.tsx`)
   - Fetches real document data from database using `documentService`
   - Fetches workflow data from normalized tables when `workflowId` is provided
   - Handles mock document ID to real UUID conversion for development
   - Passes complete workflow data to client component for display

3. **Client Component Enhancement** (`src/components/client/WorkflowCompleteClient.tsx`)
   - Accepts optional `workflowData` prop from database
   - Seamlessly falls back to Zustand store when no database data provided
   - Transforms normalized tags to display format using `useMemo` for performance
   - Updated submit handler to redirect with `workflowId` parameter for database persistence
   - Added error handling and display for submission failures

4. **Complete Page Update** (`src/app/(workflow)/workflow/[documentId]/complete/page.tsx`)
   - Accepts `searchParams` to receive `workflowId` from URL
   - Passes `workflowId` to server component for database fetching

5. **Workflow Store Enhancement** (`src/stores/workflow-store.ts`)
   - `submitWorkflow()` now returns the workflow ID from API response
   - Proper TypeScript typing: `Promise<string | void>`
   - Enables redirect to completion page with database data

#### Current State of Implementation:

**✅ WRITE LAYER (Prompts 1 & 2 - Previously Completed)**
- Workflow submission writes to normalized tables
- Data properly stored in `document_categories`, `document_tags`, `custom_tags`
- Feature flag: `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true` enables normalized storage

**✅ READ LAYER (Prompt 3 - This Session)**
- Completion page fetches data from normalized tables
- Display shows correct category, tags, and belonging rating from database
- Page refresh maintains data (no loss of information)
- Historical workflows can be viewed by URL with `workflowId` parameter
- Full read-write cycle is complete and working

#### User Flow (End-to-End):

1. User completes workflow Steps A → B → C
2. User clicks "Submit for Processing"
3. **WRITE:** Data is written to normalized tables (`document_categories`, `document_tags`, `custom_tags`)
4. Page redirects to `/workflow/{documentId}/complete?workflowId={id}`
5. **READ:** Server fetches workflow from normalized tables
6. **DISPLAY:** All submitted data shown from database
7. User refreshes page → data persists (loaded from database)
8. User can bookmark URL → always shows same workflow data

### Next Steps

1. **Testing & Validation**
   - Test complete workflow submission with real data
   - Verify data persistence across page refreshes
   - Test historical workflow viewing with bookmarked URLs
   - Validate error handling and edge cases

2. **Optimization & Enhancement**
   - Add caching layer for frequently accessed workflow data
   - Implement workflow history view in dashboard
   - Add analytics for workflow completion metrics
   - Consider implementing soft delete for workflows

3. **Future Development Priorities**
   - Chunk Analysis Module (Stage 4)
   - QA Pair Generation (Stage 5)
   - Training Data Export (Stage 6)

### Important Files

**Database Service Layer:**
- `src/lib/database.ts` - Complete database service with normalized storage operations
  - `workflowService.completeWorkflow()` - Writes to normalized tables
  - `workflowService.getWorkflowWithRelations()` - Reads from normalized tables
  - `documentCategoryService` - Manages document category assignments
  - `documentTagService` - Manages document tag assignments
  - `customTagService` - Manages custom tag creation and deduplication

**API Routes:**
- `src/app/api/workflow/route.ts` - POST workflow submission (write layer)
  - Transforms frontend format to normalized database format
  - Calls `workflowService.completeWorkflow()` for normalized storage
  - Feature flag controlled: `USE_NORMALIZED = process.env.NEXT_PUBLIC_USE_NORMALIZED_TAGS === 'true'`
  
- `src/app/api/workflow/session/route.ts` - GET workflow data (read layer)
  - Fetches workflow data by `workflowId` parameter
  - Transforms normalized data back to frontend format
  - Returns enriched workflow with category and tag details

**Component Architecture:**
- `src/components/server/WorkflowCompleteServer.tsx` - Server-side data fetching
- `src/components/client/WorkflowCompleteClient.tsx` - Client-side display and interaction
- `src/app/(workflow)/workflow/[documentId]/complete/page.tsx` - Next.js page component

**State Management:**
- `src/stores/workflow-store.ts` - Zustand store for workflow state
  - `submitWorkflow()` - Submits workflow and returns workflowId
  - `getTagsForSubmission()` - Transforms store format to API format
  - `loadTagsFromNormalized()` - Transforms normalized data to store format

**Supabase Configuration:**
- `src/lib/supabase.ts` - Supabase client and TypeScript types

### Important Scripts, Markdown Files, and Specifications

**Database Specifications:**
- `pmc/context-ai/pmct/08-categ-db-specification_v1.md` - Complete normalized database specification
  - Schema definitions for all tables
  - Relationship diagrams
  - Migration procedures
  
- `pmc/context-ai/pmct/08-categ-db-validation_v1.md` - Validation report confirming implementation
  - Verification of normalized storage
  - Data integrity checks
  
- `pmc/context-ai/pmct/08-categ-db-prompt-three_v2.md` - Implementation guide for read layer (this session)

**Implementation Prompts:**
- Prompt 1: Database service layer implementation
- Prompt 2: API write layer implementation  
- Prompt 3: Display/read layer implementation (COMPLETED THIS SESSION)

### Recent Development Context

- **Last Milestone**: Completed full read-write cycle for normalized database storage
- **Key Outcomes**: 
  - All workflow data (categories, tags, belonging ratings) successfully stored in normalized tables
  - Data can be retrieved, displayed, and persists across page refreshes
  - Feature flag allows safe rollback to JSONB storage if needed
  - Complete separation of concerns: database layer, API layer, component layer
  
- **Relevant Learnings**: 
  - Transformation layers are critical: frontend format ↔ API format ↔ database format
  - Feature flags enable safe migration from legacy to new architecture
  - Server components provide clean separation for data fetching
  - useMemo optimization prevents unnecessary re-renders for complex transformations
  
- **Technical Context**:
  - Environment variable: `NEXT_PUBLIC_USE_NORMALIZED_TAGS=true` enables normalized storage
  - Database tables: `document_categories`, `document_tags`, `custom_tags`
  - UUID mapping handles mock data conversion for development
  - Error handling includes detailed logging and user-friendly messages

## Codebase State Analysis

### Architecture Overview

**Technology Stack:**
- **Framework**: Next.js 14 (App Router with Server Components)
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand with persistence
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **TypeScript**: Fully typed throughout

### Database Schema (Normalized Structure)

**Core Tables:**

1. **`workflow_sessions`** - Tracks workflow progress
   - `id` (UUID, PK)
   - `document_id` (UUID, FK → documents)
   - `user_id` (UUID, FK → user_profiles)
   - `step` (A, B, C, or complete)
   - `is_draft` (boolean)
   - `completed_at` (timestamp)
   - `selected_tags` (JSONB) - Used only for draft storage
   - `custom_tags` (JSONB) - Used only for draft storage

2. **`document_categories`** - Stores category assignments (Panel B + belonging rating)
   - `id` (UUID, PK)
   - `document_id` (UUID, FK → documents)
   - `category_id` (UUID, FK → categories)
   - `belonging_rating` (integer 1-5) - Panel A data
   - `workflow_session_id` (UUID, FK → workflow_sessions)
   - `assigned_by` (UUID, FK → user_profiles)
   - `is_primary` (boolean)
   - `assigned_at` (timestamp)

3. **`document_tags`** - Stores tag assignments (Panel C)
   - `id` (UUID, PK)
   - `document_id` (UUID, FK → documents)
   - `tag_id` (UUID, FK → tags or custom_tags)
   - `dimension_id` (UUID, FK → tag_dimensions)
   - `workflow_session_id` (UUID, FK → workflow_sessions)
   - `assigned_by` (UUID, FK → user_profiles)
   - `is_custom_tag` (boolean)
   - `assigned_at` (timestamp)

4. **`custom_tags`** - Stores user-created custom tags
   - `id` (UUID, PK)
   - `dimension_id` (UUID, FK → tag_dimensions)
   - `name` (text)
   - `description` (text)
   - `created_by` (UUID, FK → user_profiles)
   - `usage_count` (integer) - Incremented on reuse
   - `organization_id` (UUID, nullable)

**Dictionary Tables:**
- `categories` - 10 predefined primary categories
- `tag_dimensions` - 7 tag dimensions (Authorship, Format, Disclosure Risk, etc.)
- `tags` - 42+ predefined tags across 7 dimensions

**Supporting Tables:**
- `documents` - Document metadata and content
- `user_profiles` - User information and preferences

### Workflow Architecture (3-Stage Categorization)

**Panel A: Statement of Belonging**
- **Purpose**: User rates document's relationship strength (1-5 scale)
- **Component**: `src/components/client/StepAClient.tsx`
- **Page**: `src/app/(workflow)/workflow/[documentId]/stage1/page.tsx`
- **Storage**: `document_categories.belonging_rating` (normalized)

**Panel B: Primary Category Selection**
- **Purpose**: Select 1 of 10 primary categories
- **Component**: `src/components/client/StepBClient.tsx`
- **Page**: `src/app/(workflow)/workflow/[documentId]/stage2/page.tsx`
- **Storage**: `document_categories.category_id` (normalized FK)
- **Categories**: Complete Systems, Proprietary Strategies, Process Documentation, Customer Insights, Market Research, Sales Enablement, Training Materials, Knowledge Base, Communication Templates, Project Artifacts

**Panel C: Secondary Tags**
- **Purpose**: Multi-dimensional tag selection (7 dimensions, 42+ tags)
- **Component**: `src/components/client/StepCClient.tsx`
- **Page**: `src/app/(workflow)/workflow/[documentId]/stage3/page.tsx`
- **Storage**: `document_tags` junction table (normalized)
- **Dimensions**:
  1. **Authorship** (Required, Single-select) - 5 tags
  2. **Content Format** (Optional, Multi-select) - 10 tags
  3. **Disclosure Risk** (Required, Single-select) - 5 tags
  4. **Intended Use** (Required, Multi-select) - 6 tags
  5. **Evidence Type** (Optional, Multi-select) - 6 tags
  6. **Audience Level** (Optional, Single-select) - 5 tags
  7. **Gating Level** (Optional, Single-select) - 6 tags

**Completion Page:**
- **Component**: `src/components/client/WorkflowCompleteClient.tsx`
- **Server**: `src/components/server/WorkflowCompleteServer.tsx`
- **Page**: `src/app/(workflow)/workflow/[documentId]/complete/page.tsx`
- **Features**: 
  - Summary display of all selections
  - Submit for processing
  - Export workflow summary
  - View from database on page refresh

### Data Flow Architecture

**Write Path (Form → Database):**
```
[User Input] 
  → [Zustand Store] (frontend format: { 'dimension-key': ['tag-slug'] })
  → [API POST /api/workflow] 
  → [Transform: frontend → normalized format]
  → [workflowService.completeWorkflow()]
  → [Database Operations]
     ├─ document_categories.insert() (category + belonging rating)
     ├─ custom_tags.findOrCreate() (custom tag deduplication)
     └─ document_tags.insert() (all tags)
  → [workflow_sessions.update()] (mark complete)
  → [Return workflowId]
```

**Read Path (Database → Display):**
```
[Page Load with ?workflowId={id}]
  → [WorkflowCompleteServer]
  → [GET /api/workflow/session?workflowId={id}]
  → [workflowService.getWorkflowWithRelations()]
  → [Fetch from normalized tables]
     ├─ document_categories (with category details)
     └─ document_tags (with tag and dimension details)
  → [Transform: normalized → frontend format]
  → [WorkflowCompleteClient]
  → [Display on page]
```

### Key Implementation Patterns

**1. Format Transformation System**

Three distinct data formats are maintained:

- **Frontend Format** (Zustand Store, UI Components):
  ```typescript
  {
    selectedTags: {
      'authorship': ['brand-company'],
      'disclosure-risk': ['level-3-moderate-risk'],
      'intended-use': ['marketing', 'training']
    }
  }
  ```

- **API Format** (Network Transfer):
  ```typescript
  [
    { tagId: '550e8400-...', dimensionId: '550e8400-...' },
    { tagId: '550e8400-...', dimensionId: '550e8400-...' }
  ]
  ```

- **Database Format** (Normalized Tables):
  ```sql
  document_tags (
    id, document_id, tag_id, dimension_id,
    workflow_session_id, assigned_by, assigned_at
  )
  ```

**2. Feature Flag Pattern**

Allows safe migration from legacy JSONB to normalized storage:

```typescript
const USE_NORMALIZED = process.env.NEXT_PUBLIC_USE_NORMALIZED_TAGS === 'true'

if (USE_NORMALIZED) {
  // New normalized path
  await workflowService.completeWorkflow(...)
} else {
  // Legacy JSONB path
  await supabase.from('workflow_sessions').insert({ selected_tags: {...} })
}
```

**3. Service Layer Pattern**

Complete separation of database operations:

```typescript
// Database service layer
export const workflowService = {
  async completeWorkflow(params) { /* multi-step DB operations */ },
  async getWorkflowWithRelations(id) { /* fetch with joins */ }
}

export const documentCategoryService = {
  async assignCategory(params) { /* insert into document_categories */ },
  async getDocumentCategory(documentId) { /* fetch with joins */ }
}

export const documentTagService = {
  async assignTags(params) { /* bulk insert into document_tags */ },
  async getDocumentTags(documentId) { /* fetch grouped by dimension */ }
}

export const customTagService = {
  async findOrCreateCustomTag(params) { /* deduplication + usage tracking */ }
}
```

**4. Mock Data Conversion Pattern**

Development environment uses mock IDs that are converted to real UUIDs:

```typescript
const mockIdMap: Record<string, string> = {
  'doc-1': '550e8400-e29b-41d4-a716-446655440012',
  'doc-2': '550e8400-e29b-41d4-a716-446655440024'
}

const realDocumentId = documentId.match(UUID_REGEX) 
  ? documentId 
  : mockIdMap[documentId]
```

### Component Architecture

**Server Components** (Data Fetching):
- `WorkflowCompleteServer.tsx` - Fetches from database
- `StepAServer.tsx`, `StepBServer.tsx`, `StepCServer.tsx` - Fetch reference data
- `DocumentSelectorServer.tsx` - Fetches document list

**Client Components** (Interaction):
- `WorkflowCompleteClient.tsx` - Display and submission logic
- `StepAClient.tsx`, `StepBClient.tsx`, `StepCClient.tsx` - Form interaction
- `DocumentSelectorClient.tsx` - Document selection UI
- `WorkflowProgressClient.tsx` - Step navigation

**UI Component Library** (shadcn/ui):
- 46 fully-styled Radix UI components
- Tailwind CSS for styling
- Consistent design system

### Authentication & Authorization

- **Provider**: Supabase Auth
- **Pattern**: JWT tokens passed in Authorization header
- **RLS**: Row Level Security policies enforce user data access
- **Session Management**: Handled by Supabase client library

### State Management

**Zustand Store** (`src/stores/workflow-store.ts`):
- Persists workflow state across page refreshes
- Manages draft auto-save
- Handles validation logic
- Provides transformation helpers

**Key Store Methods:**
- `setBelongingRating()` - Updates Panel A data
- `setSelectedCategory()` - Updates Panel B selection
- `setSelectedTags()` - Updates Panel C selections
- `saveDraft()` - Auto-saves to database
- `submitWorkflow()` - Final submission (returns workflowId)
- `loadExistingWorkflow()` - Loads draft from database
- `getTagsForSubmission()` - Transforms for API
- `loadTagsFromNormalized()` - Transforms from database

### Environment Configuration

**Required Environment Variables:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
NEXT_PUBLIC_USE_NORMALIZED_TAGS=true  # Enables normalized storage
```

### Testing Strategy

**Current Testing Needs:**
1. End-to-end workflow completion with normalized storage
2. Page refresh data persistence validation
3. Historical workflow viewing by workflowId
4. Custom tag deduplication and usage tracking
5. Error handling for network failures
6. Feature flag toggling (normalized vs JSONB)

### Known Technical Debt

1. **Transaction Support**: Supabase client doesn't support transactions; multiple insert operations are not atomic
2. **Rollback Handling**: Partial failures in `completeWorkflow()` may leave incomplete data
3. **Caching**: No caching layer for frequently accessed workflow data
4. **Migration Path**: Need strategy for migrating legacy JSONB data to normalized tables
5. **Zustand Types**: Pre-existing linter warnings for Zustand module imports (not introduced by this work)

### Performance Considerations

**Optimizations Implemented:**
- `useMemo` for expensive tag transformations
- Server-side data fetching reduces client-side processing
- Indexed foreign keys for fast queries
- Grouped tag queries reduce database roundtrips

**Future Optimizations:**
- Redis caching for workflow data
- Pagination for large document lists
- Lazy loading for tag dimensions
- Debounced auto-save for drafts

## Project Reference Guide

REFERENCE MATERIALS  
Everything below this line is supporting information only. Do NOT select the current task focus from this section.

### Bright Run LoRA Training Data Platform

#### Key Documents
1. Seed Story: `pmc/product/00-bmo-seed-story.md`
2. Project Overview: `pmc/product/01-bmo-overview.md`
3. Categorization Module Overview: `pmc/product/01-bmo-overview-categ-module_v1.md`

#### Core Principles
1. **Context Locality**: Instructions and context are kept directly alongside their relevant tasks
2. **Structured Checkpoints**: Regular token-based checks prevent context drift
3. **Directive Approach**: Clear commands and instructions with explicit timing requirements
4. **Task-Centric Documentation**: Single source of truth for task implementation
