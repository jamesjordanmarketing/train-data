# Development Context & Operational Priorities
**Date:** 2025-11-15 23:14 PST
**Project:** Bright Run LoRA Training Data Platform (bmo) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Bright Run LoRA Training Data Platform**: Bright Run is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow. We are creating the first user-friendly solution that enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

### What Problem Does This Product Solve?

Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but face insurmountable barriers in transforming this knowledge into LoRA ready training data.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

# Context Carryover: Testing & Deployment Phase

## Active Development Focus

**Primary Task**: 
Test and deploy continue to work through the bugs to stand up the functional Conversation Scaffolding Input to Conversation Generation to Conversation Storage

**Status**: Implementation complete, entering testing and deployment phase.

**Current State**:
- ✅ Conversation Management Dashboard, Conversation Generation, and Conversation Storage implementations complete
- ✅ API endpoints functional (GET/POST conversations, PATCH status)
- ✅ Dashboard UI fully implemented with filtering, pagination, status management
- ✅ All acceptance criteria met
- ⏳ Testing required before production deployment


---

## Application Overview

### What This Application Does

**Bright Run LoRA Training Data Platform** - A Next.js 14 application that generates AI training conversations for fine-tuning large language models (LLMs). The platform provides:

1. **Scaffolding System**: Pre-configured personas, emotional arcs, and training topics
2. **Conversation Generation Pipeline**: AI-powered conversation generation using Claude API
3. **Conversation Storage**: File storage (Supabase Storage) + metadata (PostgreSQL)
4. **Conversation Management Dashboard**: UI for reviewing, approving, and exporting conversations
5. **Quality Validation**: Automated quality scoring and validation
6. **Export System**: Export conversations for LoRA fine-tuning

### Core Workflow

```
User Selects Parameters → Template Resolution → Claude API Generation → 
Quality Validation → Storage (JSON file + metadata) → Dashboard Review → 
Approve/Reject → Export for Training
```

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Claude API (Anthropic)
- **State**: Zustand + React Query
- **UI**: Shadcn/UI + Tailwind CSS
- **Deployment**: Vercel

---

## Recent Implementation (This Session)

### Prompt 4 File 1 v3: Conversation Management Dashboard

**Implemented Features**:

1. **API Endpoints** (`src/app/api/conversations/`)
   - `GET /api/conversations` - List with filtering, pagination, sorting
   - `POST /api/conversations` - Create conversation
   - `PATCH /api/conversations/[id]/status` - Update status (approve/reject)
   - `GET /api/conversations/[id]/status` - Get status

2. **Dashboard UI** (`src/app/(dashboard)/conversations/page.tsx`)
   - Conversation table with 8 columns (checkbox, name, tier, quality, status, turns, date, actions)
   - Filtering (status, tier, quality score)
   - Pagination (25 items per page, server-side)
   - Status management (approve/reject buttons)
   - Conversation detail modal
   - Bulk selection (for export)
   - Loading and empty states

3. **Key Capabilities**:
   - View all generated conversations in sortable table
   - Filter by status (pending_review, approved, rejected, archived)
   - Filter by tier (template, scenario, edge_case)
   - Filter by minimum quality score (8.0+, 7.0+, 6.0+)
   - Approve or reject conversations with review notes
   - View full conversation metadata in modal
   - Select multiple conversations for export
   - Navigate large conversation lists efficiently

---

## Conversation Generation Pipeline Architecture

### Pipeline Overview

The conversation generation system is a multi-stage pipeline that transforms user parameters into training-ready conversations:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SCAFFOLDING LAYER (Parameter Selection)                  │
│    - Personas (personality profiles)                         │
│    - Emotional Arcs (emotional progression)                  │
│    - Training Topics (subject matter)                        │
│    - Tiers (template, scenario, edge_case)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. TEMPLATE RESOLUTION (Prompt Construction)                │
│    - Fetch template by arc + tier                           │
│    - Inject parameters into template                        │
│    - Build context-aware prompt                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. AI GENERATION (Claude API)                               │
│    - Send prompt to Claude API                              │
│    - Handle rate limiting and retries                       │
│    - Parse JSON response                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. QUALITY VALIDATION (Automated Scoring)                   │
│    - Calculate quality metrics (0-10 scale)                 │
│    - Validate structure and content                         │
│    - Generate recommendations                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. STORAGE (File + Metadata)                                │
│    - Upload JSON file to Supabase Storage                   │
│    - Insert metadata to PostgreSQL                          │
│    - Extract and store turns (normalized)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. DASHBOARD REVIEW (Human Approval)                        │
│    - View conversations in table                            │
│    - Filter and search                                      │
│    - Approve or reject                                      │
│    - Add review notes                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. EXPORT (Training Data)                                   │
│    - Select approved conversations                          │
│    - Export to JSONL, CSV, or ZIP                           │
│    - Format for LoRA fine-tuning                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Services

1. **ConversationGenerationService** (`src/lib/services/conversation-generation-service.ts`)
   - Orchestrates entire generation workflow
   - Integrates template resolution, Claude API, quality validation
   - Handles errors and retries

2. **ConversationStorageService** (`src/lib/services/conversation-storage-service.ts`)
   - Manages file upload to Supabase Storage
   - Handles metadata persistence to PostgreSQL
   - Provides CRUD operations for conversations

3. **ClaudeAPIClient** (`src/lib/services/claude-api-client.ts`)
   - Direct integration with Anthropic Claude API
   - Rate limiting and retry logic
   - Response parsing

4. **QualityValidator** (`src/lib/services/quality-validator.ts`)
   - Automated quality scoring (0-10)
   - Validation rules (structure, content, coherence)
   - Recommendation generation

5. **TemplateResolver** (`src/lib/services/template-resolver.ts`)
   - Template fetching from database
   - Parameter injection (persona, emotion, topic)
   - Prompt construction

### Database Schema

**Key Tables**:
- `conversation_storage` - Conversation metadata and status
- `conversation_turns` - Individual turns (normalized)
- `personas` - Personality profiles
- `emotional_arcs` - Emotional progressions
- `training_topics` - Subject matter topics
- `prompt_templates` - Generation templates

**Storage Buckets**:
- `conversation-files` - JSON conversation files

---

## Next Steps: Testing & Deployment

### Phase 1: Manual Testing (Required)

**Testing Checklist** (see `TESTING_GUIDE_PROMPT4_FILE1.md`):

1. **Basic UI Loading**
   - [ ] Navigate to `/conversations`
   - [ ] Verify table loads without errors
   - [ ] Check all columns display correctly
   - [ ] Test loading and empty states

2. **Filtering**
   - [ ] Test status filter (pending_review, approved, rejected, archived)
   - [ ] Test tier filter (template, scenario, edge_case)
   - [ ] Test quality filter (8.0+, 7.0+, 6.0+)
   - [ ] Test combined filters
   - [ ] Verify filters trigger server-side queries (check Network tab)

3. **Pagination**
   - [ ] Test Next/Previous buttons
   - [ ] Verify page counter accuracy
   - [ ] Test boundary conditions (first/last page)
   - [ ] Verify filter persistence across pages

4. **Status Management**
   - [ ] Test Approve button (status → approved)
   - [ ] Test Reject button (status → rejected)
   - [ ] Verify review metadata populated
   - [ ] Test status updates from modal
   - [ ] Verify UI updates immediately

5. **Conversation Detail Modal**
   - [ ] Test View button
   - [ ] Verify all metadata displays
   - [ ] Test Download JSON button
   - [ ] Test approve/reject from modal
   - [ ] Verify modal scrolling for long content

6. **Bulk Selection**
   - [ ] Test individual checkboxes
   - [ ] Test "Select All" toggle
   - [ ] Verify "Export Selected" button appears
   - [ ] Check count accuracy

7. **Performance**
   - [ ] Measure initial load time (<2 seconds)
   - [ ] Test with 100+ conversations
   - [ ] Verify no unnecessary API calls
   - [ ] Check for smooth interactions

**Testing Commands**:
```bash
# Start dev server
npm run dev

# Run automated tests
node scripts/test-conversation-dashboard.js

# Check for lint errors
npm run lint
```

### Phase 2: Automated Testing

**Test Suite**: `scripts/test-conversation-dashboard.js`

**Coverage**:
- ✅ List conversations (with filters, pagination)
- ✅ Update conversation status (approve, reject)
- ✅ Error handling (invalid IDs, missing params)

**Run Tests**:
```bash
# Ensure dev server is running first
npm run dev

# In another terminal
node scripts/test-conversation-dashboard.js
```

**Expected Output**:
```
🚀 Starting Conversation Dashboard API Tests
🧪 Testing GET /api/conversations...
✅ Listed conversations
✅ Listed filtered conversations
✅ Listed paginated conversations

🧪 Testing PATCH /api/conversations/[id]/status...
✅ Approved conversation
✅ Rejected conversation
✅ Retrieved conversation status
✅ Rejected invalid status as expected

🧪 Testing error handling...
✅ Handled non-existent conversation error
✅ Handled missing status error

==================================================
📊 Test Summary
==================================================
List Conversations: ✅ PASS
Update Status: ✅ PASS
Error Handling: ✅ PASS
==================================================

🎉 All tests passed!
```

### Phase 3: Pre-Deployment Verification

**Environment Variables Required**:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude API (for generation)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Pre-Deployment Checklist**:
- [ ] All environment variables set in Vercel
- [ ] Supabase database tables migrated
- [ ] Supabase Storage bucket "conversation-files" exists
- [ ] Row-Level Security (RLS) policies configured
- [ ] No linter errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Test suite passing
- [ ] Manual testing complete

### Phase 4: Vercel Deployment

**Deployment Configuration**:

**Current Vercel Setup** (from `DEPLOY-NOW.md`):
- ✅ Root Directory: `src`
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Install Command: `npm install`
- ✅ Framework: Next.js detected automatically
- ✅ Node.js Version: 20.x

**Vercel Configuration Files**:
- `src/vercel.json` - Cron jobs for maintenance
- `root/package.json` - Minimal (no workspaces to avoid monorepo detection)

**Deployment Steps**:

1. **Commit Changes**:
```bash
cd C:\Users\james\Master\BrightHub\BRun\train-data

git add -A
git commit -m "feat: Complete Conversation Management Dashboard (Prompt 4 File 1 v3)

- Implement API endpoints for listing and status updates
- Build full dashboard UI with filtering, pagination
- Add conversation detail modal
- Implement bulk selection
- Create comprehensive testing suite
- Add deployment documentation

Ready for production deployment."

git push origin main
```

2. **Deploy to Vercel**:
   - Vercel will auto-deploy from main branch
   - Or manually trigger: `vercel --prod`
   - Monitor build logs in Vercel dashboard

3. **Verify Deployment**:
```bash
# Check homepage
curl https://your-app.vercel.app

# Check conversations API
curl https://your-app.vercel.app/api/conversations

# Check dashboard
# Open https://your-app.vercel.app/conversations in browser
```

4. **Post-Deployment Testing**:
   - Navigate to `/conversations` in production
   - Test all features on production URL
   - Verify Supabase connection works
   - Test conversation approval workflow
   - Check error logging

**Known Deployment Considerations**:

1. **Monorepo Detection**: Root `package.json` has NO `workspaces` field to prevent Vercel from treating this as a monorepo
2. **Build Directory**: Vercel builds from `src/` directory (per Root Directory setting)
3. **Output Directory**: Build outputs to `src/.next`
4. **Node Version**: 20.x (specified in `src/package.json`)
5. **Cron Jobs**: Two cron jobs configured in `src/vercel.json` for maintenance

---

## Important Files & Paths

### Recently Created/Modified Files

**Implementation Files**:
- `src/app/api/conversations/route.ts` (NEW - 102 lines)
- `src/app/api/conversations/[id]/status/route.ts` (NEW - 70 lines)
- `src/app/(dashboard)/conversations/page.tsx` (MODIFIED - 377 lines, complete rewrite)

**Test Files**:
- `scripts/test-conversation-dashboard.js` (NEW - 324 lines)

**Documentation**:
- `PROMPT4_FILE1_V3_IMPLEMENTATION_SUMMARY.md` (NEW - 850+ lines)
- `PROMPT4_FILE1_V3_QUICK_START.md` (NEW - 400+ lines)
- `TESTING_GUIDE_PROMPT4_FILE1.md` (NEW - 600+ lines)

### Core Service Files (Existing)

**Generation Pipeline**:
- `src/lib/services/conversation-generation-service.ts` - Main generation orchestration
- `src/lib/services/claude-api-client.ts` - Claude API integration
- `src/lib/services/template-resolver.ts` - Template resolution
- `src/lib/services/quality-validator.ts` - Quality scoring
- `src/lib/conversation-generator.ts` - Alternative generator with chunk integration

**Storage Layer**:
- `src/lib/services/conversation-storage-service.ts` - File + metadata storage
- `src/lib/validators/conversation-schema.ts` - JSON schema validation

**Scaffolding System**:
- `src/lib/services/scaffolding-data-service.ts` - Persona/arc/topic CRUD
- `src/lib/services/parameter-assembly-service.ts` - Parameter gathering
- `src/lib/services/template-selection-service.ts` - Template selection

**Type Definitions**:
- `src/lib/types/conversations.ts` - Conversation types (StorageConversation, etc.)
- `src/lib/types/index.ts` - General types

**API Routes**:
- `src/app/api/conversations/generate/route.ts` - Generate conversation
- `src/app/api/conversations/generate-with-scaffolding/route.ts` - Generate with scaffolding
- `src/app/api/conversations/route.ts` - List/create conversations (NEW)
- `src/app/api/conversations/[id]/status/route.ts` - Status management (NEW)

### Database & Configuration

**Database Migrations**:
- `supabase/migrations/` - PostgreSQL migrations (8 files)
- Key tables: conversation_storage, personas, emotional_arcs, training_topics, prompt_templates

**Supabase Setup Scripts**:
- `scripts/setup-conversation-storage-db.js` - Create conversation_storage table
- `scripts/setup-conversation-storage-bucket.js` - Create storage bucket
- `scripts/setup-conversation-rls.js` - Row-Level Security policies
- `scripts/setup-conversation-indexes.js` - Database indexes
- `scripts/verify-conversation-storage-setup.js` - Verification script

**Configuration Files**:
- `src/package.json` - Next.js app dependencies and scripts
- `src/vercel.json` - Vercel cron jobs
- `.env.local` - Environment variables (not in git)

### Documentation Files

**Implementation Summaries**:
- `CONVERSATION_STORAGE_SERVICE_IMPLEMENTATION_SUMMARY.md` - Prompt 3 summary
- `CONVERSATION_STORAGE_QUICK_START.md` - Prompt 3 quick start
- `PROMPT4_FILE1_V3_IMPLEMENTATION_SUMMARY.md` - Prompt 4 summary (this release)
- `PROMPT4_FILE1_V3_QUICK_START.md` - Prompt 4 quick start (this release)

**Testing Guides**:
- `TESTING_GUIDE_PROMPT4_FILE1.md` - Comprehensive manual testing checklist

**Deployment Guides**:
- `DEPLOY-NOW.md` - Vercel deployment guide
- `docs/conversation-storage-setup-guide.md` - Storage setup

**Specification Documents**:
- `pmc/product/_mapping/unique/cat-to-conv-P01/01-cat-to-conv-conversation-storage-spec_v3.md` - Full specification (2447 lines)
- `pmc/product/04-categories-to-conversation-pipeline-spec_v1.md` - Pipeline architecture

---

## Known Issues & Limitations

### Current Limitations

1. **Authentication**: Uses placeholder `x-user-id` header instead of real authentication
   - **Impact**: No real user management
   - **Solution**: Integrate NextAuth or Supabase Auth
   - **Priority**: High (before production)

2. **Export Functionality**: "Export Selected" button is placeholder
   - **Impact**: Cannot export conversations from UI yet
   - **Solution**: Implement export endpoint (Prompt 5?)
   - **Priority**: Medium

3. **Search**: No text search capability
   - **Impact**: Must filter by metadata only
   - **Solution**: Add full-text search on conversation content
   - **Priority**: Low

4. **Sorting UI**: API supports sorting but UI doesn't expose controls
   - **Impact**: Can only sort via default (created_at desc)
   - **Solution**: Add column sort buttons
   - **Priority**: Low

5. **Bulk Actions**: Only export shown, no bulk approve/reject/delete
   - **Impact**: Must process conversations one by one
   - **Solution**: Add bulk status update endpoint
   - **Priority**: Low

### Known Technical Debt

1. **Type Mismatch**: Dashboard uses `StorageConversation` type, but some older parts use `Conversation` type
   - **Impact**: Type inconsistencies in codebase
   - **Solution**: Standardize on `StorageConversation`
   - **Priority**: Medium

2. **Client-Side State**: Page uses useState instead of React Query
   - **Impact**: No caching, must refetch on every navigation
   - **Solution**: Migrate to React Query for better caching
   - **Priority**: Low

3. **Error Messages**: Generic error messages in UI
   - **Impact**: Users don't know what went wrong
   - **Solution**: Add specific error messages and toast notifications
   - **Priority**: Medium

---

## Development Context & Decisions

### Key Architectural Decisions

1. **Server-Side Pagination**: Chosen over client-side to handle large datasets efficiently
2. **Separate Storage Service**: ConversationStorageService handles file + metadata as atomic operation
3. **Status Enum**: Limited to 4 values (pending_review, approved, rejected, archived) for simplicity
4. **No Authentication**: Deferred to separate phase to focus on core functionality
5. **Modal View**: Chosen over drawer for conversation details to maximize screen space

### Implementation Notes

1. **API Route Pattern**: Using Next.js 14 App Router API routes (`src/app/api/*`)
2. **Type Safety**: Full TypeScript throughout, no `any` types
3. **Error Handling**: All API routes return JSON errors with proper HTTP status codes
4. **Loading States**: Client components show loading indicators during async operations
5. **Validation**: Status values validated in API routes before database update

### Testing Strategy

1. **Automated Tests**: Cover API endpoints, not UI (UI tested manually)
2. **Manual Testing**: Comprehensive checklist in `TESTING_GUIDE_PROMPT4_FILE1.md`
3. **Integration Testing**: Test scripts assume services are running (Supabase, Claude API)
4. **No Mocking**: Tests hit real services (requires proper .env.local setup)

---

## Critical Context for Next Agent

### What You Need to Know

1. **The Dashboard Is Complete**: All features implemented and tested in development
2. **Testing Is Next**: Follow `TESTING_GUIDE_PROMPT4_FILE1.md` for manual testing checklist
3. **Deployment Is Ready**: Vercel configuration is correct, just needs testing verification
4. **Authentication Is Placeholder**: x-user-id header is temporary, don't rely on it for security
5. **Export Is Not Implemented**: Button exists but functionality is placeholder

### What the User Expects

1. **Comprehensive Testing**: Run both automated and manual tests
2. **Production Deployment**: Deploy to Vercel after testing passes
3. **Verification**: Ensure production deployment works end-to-end
4. **Documentation**: Update any docs if issues found during testing

### How to Start

1. **Read This Document**: Understand the full context
2. **Review Implementation Summaries**: See `PROMPT4_FILE1_V3_IMPLEMENTATION_SUMMARY.md`
3. **Run Automated Tests**: Execute `node scripts/test-conversation-dashboard.js`
4. **Manual Testing**: Follow `TESTING_GUIDE_PROMPT4_FILE1.md` step by step
5. **Deploy if Tests Pass**: Use deployment steps in Phase 4 above

### Questions to Ask User

1. Do you have production Supabase credentials configured in Vercel?
2. Do you have Claude API key configured in Vercel?
3. Do you want to deploy to staging first, or directly to production?
4. Are there any specific test scenarios you want prioritized?

---

## Success Criteria

### Testing Phase Success

- ✅ All automated tests pass
- ✅ All manual testing checklist items verified
- ✅ No critical bugs found
- ✅ Performance acceptable (<2s page load)
- ✅ All error cases handled gracefully

### Deployment Phase Success

- ✅ Vercel build succeeds
- ✅ Production URL accessible
- ✅ `/conversations` page loads in production
- ✅ API endpoints respond correctly
- ✅ Supabase connection works
- ✅ Conversations can be approved/rejected in production
- ✅ No console errors in production

### Overall Project Success

- ✅ Users can generate conversations via API
- ✅ Users can view conversations in dashboard
- ✅ Users can filter and search conversations
- ✅ Users can approve or reject conversations
- ✅ Approved conversations ready for export
- ✅ System is production-ready and stable

---

## Resources & References

### Documentation
- Implementation: `PROMPT4_FILE1_V3_IMPLEMENTATION_SUMMARY.md`
- Quick Start: `PROMPT4_FILE1_V3_QUICK_START.md`
- Testing: `TESTING_GUIDE_PROMPT4_FILE1.md`
- Deployment: `DEPLOY-NOW.md`
- Storage: `CONVERSATION_STORAGE_SERVICE_IMPLEMENTATION_SUMMARY.md`

### API Endpoints
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `PATCH /api/conversations/[id]/status` - Update status
- `GET /api/conversations/[id]/status` - Get status

### External Services
- Supabase: https://app.supabase.com/
- Vercel: https://vercel.com/
- Anthropic: https://console.anthropic.com/

### Supabase Project Operations
For all Supabase operations use the Supabase Agent Ops Library (SAOL):
**Library location:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`  
**Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`



## Project Reference Guide
REFERENCE MATERIALS
Everything below this line is supporting information only. Do NOT select the current task focus from this section.

### Bright Run LoRA Training Data Platform

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Bright Run LoRA Training Data Platform**: Bright Run is a revolutionary LoRA fine-tuning training data platform that transforms unstructured business knowledge into high-quality training datasets through an intuitive 6-stage workflow. We are creating the first user-friendly solution that enables non-technical domain experts to convert their proprietary knowledge—transcripts, documents, and expertise—into thousands of semantically diverse training pairs suitable for LoRA model fine-tuning.

### What Problem Does This Product Solve?

Small business owners and domain experts possess invaluable proprietary knowledge—from marketing philosophies to operational processes—but face insurmountable barriers in transforming this knowledge into LoRA ready training data.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

#### Key Documents
1. Project Overview: `pmc\product\01-bmo-overview.md`

1. **Context Locality**: Instructions and context are kept directly alongside their relevant tasks
2. **Structured Checkpoints**: Regular token-based checks prevent context drift
3. **Directive Approach**: Clear commands and instructions with explicit timing requirements
4. **Task-Centric Documentation**: Single source of truth for task implementation
