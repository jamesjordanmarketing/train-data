# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Chunks Alpha** is a document categorization and chunk dimension testing platform built with Next.js 14, TypeScript, and Supabase. It consists of three main modules:

1. **Document Categorization Workflow** (src/) - A 3-step guided workflow for categorizing business documents with Statement of Belonging assessment, 11 primary categories, and multi-dimensional secondary tagging
2. **Document Upload & Processing Module** (src/upload) - Handles file uploads, text extraction from multiple formats (PDF, DOCX, HTML, TXT, MD, RTF), and processing pipeline
3. **Chunk Dimension Testing System** (Phase 1 complete) - Extracts document chunks and generates 60+ AI metadata dimensions for training data optimization

There are also two standalone dashboard modules:
- `chunks-alpha-dashboard/` - Vite-based dashboard (separate from main app)
- `doc-module/` - Standalone document processing module (separate from main app)

## Development Commands

### Main Application (src/)
```bash
# Development server
npm run dev            # Starts Next.js dev server on http://localhost:3000

# Production build
npm run build          # Builds optimized production bundle

# Linting
npm run lint           # Runs Next.js linter
```

### Standalone Modules
```bash
# Dashboard module
cd chunks-alpha-dashboard && npm run dev    # Vite dev server
cd chunks-alpha-dashboard && npm run build  # Vite build

# Doc module
cd doc-module && npm run dev                # Vite dev server
cd doc-module && npm run build              # Vite build
```

## Architecture

### Tech Stack
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Storage:** Supabase Storage for document files
- **State Management:** Zustand with persistence
- **UI Components:** Radix UI (shadcn/ui) + Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** Sonner toast library

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   ├── (dashboard)/              # Dashboard route group
│   │   └── upload/               # Document upload page
│   ├── (workflow)/               # Categorization workflow routes
│   ├── api/                      # API routes
│   │   ├── assessment/           # Step A API
│   │   ├── categories/           # Step B API
│   │   ├── chunks/               # Chunk extraction API
│   │   ├── documents/            # Document management API
│   │   │   ├── upload/           # File upload endpoint
│   │   │   ├── process/          # Text extraction endpoint
│   │   │   └── status/           # Status polling endpoint
│   │   ├── export/               # Data export API
│   │   ├── tags/                 # Step C tags API
│   │   └── workflow/             # Workflow session API
│   ├── chunks/[id]/              # Chunk management page
│   └── test-chunks/              # Chunk system test page
├── components/
│   ├── auth/                     # Authentication components
│   ├── chunks/                   # Chunk-related components
│   ├── client/                   # Client-side components
│   ├── server/                   # Server-side components
│   ├── ui/                       # shadcn/ui base components (48 components)
│   ├── upload/                   # Upload module components
│   └── workflow/                 # Workflow step components
│       └── steps/                # StepA, StepB, StepC, WorkflowComplete
├── hooks/                        # Custom React hooks
│   └── use-document-status.ts    # Document status polling hook
├── lib/
│   ├── chunk-extraction/         # Chunk extraction logic
│   ├── dimension-generation/     # AI dimension generation
│   ├── file-processing/          # Text extraction services
│   │   ├── text-extractor.ts     # Multi-format text extraction
│   │   └── document-processor.ts # Processing orchestration
│   ├── types/                    # Shared type definitions
│   ├── ai-config.ts              # Claude API configuration
│   ├── chunk-service.ts          # Chunk database services (5 modules)
│   ├── database.ts               # Supabase database services
│   ├── dimension-classifier.ts   # AI dimension classification
│   ├── dimension-metadata.ts     # 60+ dimension definitions
│   ├── dimension-service.ts      # Dimension processing
│   ├── supabase.ts               # Supabase client (browser)
│   ├── supabase-server.ts        # Supabase client (server)
│   └── workflow-navigation.ts    # Workflow routing utilities
├── stores/
│   └── workflow-store.ts         # Zustand workflow state
└── types/
    └── chunks.ts                 # Chunk type definitions (5 types, 60+ fields)
```

### Database Schema (Supabase PostgreSQL)

**Core Tables:**
- `documents` - Document storage with metadata, processing status, and extracted content
- `categories` - 11 primary business categories
- `tag_dimensions` - 7 tag dimension definitions (Authorship, Format, Risk, Evidence, Use, Audience, Gating)
- `tags` - Individual tag definitions per dimension
- `workflow_sessions` - User workflow progress with draft/resume capability
- `document_categories` - Normalized category assignments
- `document_tags` - Normalized tag assignments
- `custom_tags` - User-created custom tags with usage tracking
- `user_profiles` - User and organization data

**Chunk Tables (Phase 1):**
- `chunks` - Document chunks with position/token info
- `chunk_dimensions` - AI-generated 60+ dimension metadata per chunk
- `chunk_runs` - Batch processing runs with cost/performance tracking
- `prompt_templates` - AI prompt templates for dimension generation
- `chunk_extraction_jobs` - Processing job queue and status

**Key Features:**
- Row Level Security (RLS) for multi-tenant data isolation
- JSONB columns for flexible metadata
- Full-text search capabilities
- Audit trails with timestamps

## Service Architecture

### Database Services Pattern

All database operations use a consistent service layer pattern:

**Location:** `src/lib/database.ts` and `src/lib/chunk-service.ts`

**Services Available:**
- `documentService` - Document CRUD operations
- `categoryService` - Category queries
- `tagService` - Tag and dimension queries
- `workflowService` - Workflow session management
- `documentCategoryService` - Category assignments
- `documentTagService` - Tag assignments
- `customTagService` - Custom tag creation with deduplication
- `analyticsService` - Workflow statistics
- `userService` - User profile and preferences
- `fileService` - File upload/download
- `chunkService` - Chunk CRUD and document operations
- `chunkDimensionService` - AI dimension storage/retrieval
- `chunkRunService` - Batch run tracking
- `promptTemplateService` - Prompt template management
- `chunkExtractionJobService` - Job queue management

**Pattern:**
```typescript
export const exampleService = {
  async getAll() {
    const { data, error } = await supabase.from('table').select('*');
    if (error) throw error;
    return data;
  },
  // ... more methods
};
```

### Text Extraction Pipeline

**Location:** `src/lib/file-processing/`

**Flow:**
1. Upload API (`/api/documents/upload`) receives file, stores in Supabase Storage
2. Document record created with status `uploaded`
3. Processing API (`/api/documents/process`) triggered automatically
4. `TextExtractor` extracts text based on file type (PDF/DOCX/HTML/TXT/MD/RTF)
5. `DocumentProcessor` orchestrates validation, progress tracking, error handling
6. Status updates: `uploaded` → `processing` → `completed` or `error`
7. Extracted text stored in `documents.content` field

**Supported Formats:**
- PDF (text-based only, no OCR)
- DOCX/DOC (via mammoth library)
- HTML (via html-to-text library)
- TXT, MD, RTF (direct text extraction)

**Key Files:**
- `text-extractor.ts` - Multi-format extraction with validation
- `document-processor.ts` - Processing orchestration with retry logic

### Workflow State Management

**Location:** `src/stores/workflow-store.ts`

Uses Zustand for client-side state with localStorage persistence:
- Current step (A, B, C, complete)
- Selected document, category, tags
- Draft saving and auto-save
- Step validation and navigation guards
- Progress tracking across browser sessions

## Important Implementation Notes

### Authentication & Security

- All API routes require authentication via Supabase Auth
- User authorization checked with `supabase.auth.getUser()`
- Document ownership verified before operations
- RLS policies enforce data isolation in database
- File uploads limited to 100MB
- Processing timeout: 5 minutes per document

### Client vs Server Components

- Use Server Components by default for data fetching
- Client Components marked with `'use client'` directive
- Server actions in `src/app/actions/`
- Supabase client selection:
  - Browser: `src/lib/supabase.ts`
  - Server: `src/lib/supabase-server.ts`

### Error Handling

- Services throw errors, components catch and display
- Toast notifications via Sonner for user feedback
- Processing errors stored in `documents.processing_error`
- Retry logic available for failed processing
- Detailed error types: CORRUPT_FILE, UNSUPPORTED_CONTENT, TIMEOUT, SERVER_ERROR

### Type Safety

- Strict TypeScript mode enabled
- Comprehensive type definitions in `src/types/`
- Chunk types: `src/types/chunks.ts` (5 main types with 60+ dimension fields)
- Database types inferred from Supabase schema
- All services return typed data

### Chunk Dimension System (Phase 1 Complete)

**Status:** Database foundation and services operational

**Key Types (src/types/chunks.ts):**
- `Chunk` - Document chunk with position and metadata
- `ChunkDimensions` - 60+ AI-generated dimension fields
- `ChunkRun` - Batch processing run tracking
- `PromptTemplate` - AI prompt templates
- `ChunkExtractionJob` - Job queue status

**60+ Dimensions Include:**
- Content: summary, key terms, audience, intent, tone, brand, domain
- Task: name, preconditions, inputs, steps, output, warnings
- CER (Claim-Evidence-Reasoning): claim, evidence, reasoning, citations, confidence
- Scenario: type, problem, solution, outcome, style
- Training: prompt candidate, target answer, style directives
- Risk: safety tags, coverage, novelty, IP sensitivity, PII, compliance
- Meta: confidence scores, cost tracking, generation metadata

**Integration Points:**
- Dashboard "Chunks" button appears on completed documents
- Test page at `/test-chunks` for database verification
- Service layer ready for Phase 2 (extraction UI)
- Navigation helper: `src/lib/workflow-navigation.ts`

## Testing

### Manual Testing Pages

- `/test-chunks` - Chunk system database connectivity and service verification
- Main dashboard - Document categorization workflow end-to-end testing

### Verification Checklist

After making changes:
1. Run `npm run build` - Check for TypeScript errors
2. Run `npm run lint` - Check for linting issues
3. Test in browser - Check for runtime errors
4. Verify Supabase connection - Check database queries
5. Test authentication flow - Verify user access control

## Common Development Patterns

### Adding a New Database Service

1. Define TypeScript types in relevant type file
2. Create service in `src/lib/database.ts` or create new service file
3. Export service from database.ts if creating new file
4. Follow async/await pattern with error handling
5. Use Supabase client from `src/lib/supabase.ts`

### Creating a New API Route

1. Create route.ts in `src/app/api/[route-name]/`
2. Export async functions: GET, POST, PUT, DELETE, PATCH
3. Set `export const maxDuration = 300` for long operations (max 5 minutes)
4. Verify authentication: `await supabase.auth.getUser()`
5. Return `NextResponse.json()` with appropriate status codes
6. Handle errors with try-catch and return error responses

### Adding New UI Components

1. Place in appropriate directory under `src/components/`
2. Use shadcn/ui components from `src/components/ui/` where possible
3. Mark as Client Component if using hooks/interactivity
4. Import from `@/components/...` using path aliases
5. Follow Tailwind CSS utility-first styling
6. Use Lucide React for icons

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
NEXT_PUBLIC_USE_NORMALIZED_TAGS=true
```

## Key Documentation Files

- `PHASE-1-README.md` - Chunk system Phase 1 overview and architecture
- `PHASE-1-COMPLETION-SUMMARY.md` - Technical implementation details
- `PHASE-1-QUICKSTART.md` - Verification and troubleshooting guide
- `pmc/context-ai/pmct/c-alpha-build-spec_v3.3_document_module-full-spec_v1-COMPLETE.md` - Complete document upload module specification (6-prompt series)
- `src/README.md` - Main application feature documentation
- Build completion summaries: `PROMPT-*-COMPLETION-SUMMARY.md` files

## Known Limitations

- PDF extraction: Text-based PDFs only, no OCR for scanned images
- File uploads: Sequential processing, 100MB limit per file
- Status updates: 2-second polling (no WebSockets)
- Processing timeout: 5 minutes maximum per document
- No document versioning or collaboration features

## Future Development

**Phase 2 (Next):** Chunk extraction UI and processing pipeline
**Phase 3:** AI dimension generation with Claude API
**Phase 4:** Spreadsheet-like dimension data display
**Phase 5:** Run comparison and refinement tools

**Planned Enhancements:**
- OCR integration for scanned PDFs
- WebSocket-based real-time updates
- Parallel upload processing
- Document versioning
- Collaborative editing
- Advanced analytics dashboard
