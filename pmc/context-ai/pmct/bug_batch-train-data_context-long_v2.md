# Bug Fix Context: Train-Data Module Testing Cycle

**Version:** 2.0  
**Date:** November 12, 2025  
**Purpose:** Provide AI agents with essential context for fixing bugs during functional testing

---

## Document Overview

This document provides **concise functional and code context** for AI agents fixing bugs during human functional testing. Each bug report must dedicate most space to the actual issue—this context section ensures agents can quickly understand the system without lengthy explanations.

---

## Product Context

### What is Bright Run Train-Data Module?

Bright Run transforms unstructured business knowledge into high-quality LoRA fine-tuning training data through an intuitive workflow. The platform enables non-technical domain experts to convert proprietary knowledge—transcripts, documents, expertise—into thousands of semantically diverse training conversation pairs suitable for custom AI model fine-tuning.

**Core Workflow:** Upload documents → AI chunks content → Generate QA conversations → Review & approve → Expand synthetically → Export training data

**Three-Tier Architecture:**
- **Template Tier:** Foundational conversations establishing core patterns
- **Scenario Tier:** Contextual variations across business situations  
- **Edge Case Tier:** Boundary conditions and unusual cases

**Key Differentiator:** Voice preservation technology maintains business methodology and communication style across scaled generation (10-100x multiplication).

### Critical Documents

| Document | Purpose | Path |
|----------|---------|------|
| **Product Overview** | Full product vision, architecture, success criteria | `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-bmo-overview-train-data_v1.md` |
| **Functional Requirements** | Complete FR specs with wireframe integration | `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-train-functional-requirements-integrate-wireframe_v1.md` |

---

## Codebase Structure

### Primary Source Directory: `C:\Users\james\Master\BrightHub\brun\train-data\src`

**Key Directories:**
```
src/
├── app/
│   ├── (dashboard)/          # Dashboard routes
│   │   ├── conversations/    # Main conversations view
│   │   ├── dashboard/        # Overview dashboard
│   │   └── upload/           # Document upload
│   └── api/                  # API endpoints
│       └── chunks/           # Chunk processing APIs
├── components/
│   ├── ui/                   # Shadcn UI components
│   └── [feature-specific]/   # Feature components
└── lib/
    ├── types.ts              # TypeScript type definitions
    ├── database.ts           # Supabase database service
    ├── ai-config.ts          # Claude AI configuration
    └── supabase.ts           # Supabase client setup
```

### Key Technology Stack
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Node.js, Supabase (PostgreSQL), Claude API
- **UI Components:** Shadcn/UI, Lucide Icons
- **State Management:** Zustand (for wireframe reference)

---

## Key Pages & Routes

All routes are under the dashboard layout: `src/app/(dashboard)/`

| Route | File Path | Purpose |
|-------|-----------|---------|
| **`/dashboard`** | `src/app/(dashboard)/dashboard/page.tsx` | Overview dashboard with stats and metrics |
| **`/conversations`** | `src/app/(dashboard)/conversations/page.tsx` | Main conversation table view with filtering/sorting |
| **`/conversations/generate`** | `src/app/(dashboard)/conversations/generate/page.tsx` | Single/batch conversation generation interface |
| **`/upload`** | `src/app/(dashboard)/upload/page.tsx` | Document upload and processing |

**Additional Routes (To Be Implemented):**
- `/conversations/review-queue` - Review queue for pending conversations
- `/conversations/templates` - Template management interface
- `/conversations/scenarios` - Scenario library management
- `/conversations/edge-cases` - Edge case repository

**Route Verification:** Use `file_search` tool to find page components, then check implementation status.

---

## Module Human & Operational Functionality

### User Journey Overview

**Stage 1: Upload & Processing**
1. User uploads documents (PDF, transcripts, HTML, text)
2. System cleans and preprocesses content
3. AI chunks content into semantic segments
4. Chunks analyzed for 60-dimension metadata

**Stage 2: Conversation Generation**
1. User selects generation mode: Single or Batch (all tiers)
2. Templates are populated with chunk context and metadata
3. Claude API generates multi-turn conversations (8-16 turns optimal)
4. Quality scoring applied automatically (0-10 scale)

**Stage 3: Review & Quality Control**
1. Conversations enter review queue (status: `pending_review`)
2. Reviewer examines conversation quality, context accuracy
3. Actions: Approve, Reject, Request Revision
4. Low-quality conversations (<6 score) auto-flagged

**Stage 4: Synthetic Expansion**
1. Approved conversations used as templates
2. Synthetic variations generated (10-100x multiplication)
3. Voice consistency monitored
4. Quality maintained across variations

**Stage 5: Export**
1. Filter conversations by tier, status, quality
2. Export formats: JSONL (LoRA training), JSON, CSV, Markdown
3. Audit trail logged for compliance

### Key Status Workflow

```
draft → generated → pending_review → approved/rejected/needs_revision
                                   ↓
                                archived (on regeneration)
```

**Status Enum:** `draft | generated | pending_review | approved | rejected | needs_revision | failed`

---

## Mock Data & Test Data Validation

### When to Check Mock Data

**If the bug involves:**
- Conversations not displaying correctly
- Filters returning unexpected results  
- Quality scores appearing incorrect
- Export producing malformed output
- Generation failing with "invalid parameters"

**Then verify:**
1. **Database schema matches type definitions**
   - Check `src/lib/types.ts` for type definitions
   - Compare against Supabase table structure
   - Validate JSONB fields contain expected shape

2. **Sample data has valid structure**
   - All required fields present (id, conversation_id, status, tier)
   - Enum values match type constraints
   - Foreign keys reference existing records
   - Quality scores in valid range (0-10)

3. **Conversation turns are well-formed**
   - Sequential turn_number without gaps
   - Role alternates between 'user' and 'assistant'
   - Content is non-empty
   - Token counts are positive integers

### Mock Data Locations

| Data Type | Likely Location | Validation |
|-----------|----------------|------------|
| Conversations | Supabase `conversations` table | Use SAOL `agentQuery` to inspect |
| Templates | Supabase `templates` table | Check tier, active status, structure field |
| Chunks | Supabase `chunks` table (from chunks-alpha) | Verify parent references |
| Test fixtures | `src/__tests__/fixtures/` or similar | Check if exists during investigation |

---

## Supabase Agent Ops Library (SAOL)

**For all Supabase operations use the Supabase Agent Ops Library (SAOL).**

**Library location:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`  
**Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`

---

## Type System Reference

### Core Data Types

Import from: `src/lib/types.ts`

**Conversation:**
```typescript
interface Conversation {
  id: string;              // UUID
  conversation_id: string; // fp_[persona]_[###]
  status: ConversationStatus;
  tier: TierType;
  persona?: string;
  emotion?: string;
  topic?: string;
  intent?: string;
  tone?: string;
  title?: string;
  category?: string[];
  qualityScore?: number;   // 0-10 with 1 decimal
  totalTurns?: number;
  tokenCount?: number;
  created_at?: string;
  updated_at?: string;
  parameters?: Record<string, any>;  // JSONB
  parentId?: string;       // For regenerations
  parentType?: 'template' | 'scenario' | 'chunk';
  reviewHistory?: ReviewAction[];
}
```

**Key Enums:**
```typescript
type ConversationStatus = 
  | 'draft' | 'generated' | 'pending_review' 
  | 'approved' | 'rejected' | 'needs_revision' 
  | 'failed';

type TierType = 'template' | 'scenario' | 'edge_case';
```

**Quality Metrics:**
```typescript
interface QualityMetrics {
  overall: number;         // 0-10
  turnQuality: number;
  responseLength: number;
  structureValidity: number;
  emotionalIntelligence: number;
  contextRelevance: number;
  confidence: number;      // 0-1
}
```

---

## Common Bug Patterns & Debugging Approach

### Pattern 1: UI Not Displaying Data

**Check:**
1. Data exists in database (use SAOL `agentQuery`)
2. API endpoint returning data correctly
3. Component receiving props/state correctly
4. TypeScript types match database schema
5. Status filters not excluding data

### Pattern 2: Generation Failing

**Check:**
1. Claude API key configured correctly (`src/lib/ai-config.ts`)
2. Rate limiting not exceeded (check API response logs)
3. Template structure valid with all required parameters
4. Chunk context available and well-formed
5. Error logged in database (query `status: 'failed'`)

### Pattern 3: Filters Not Working

**Check:**
1. Filter state being updated correctly
2. Filter application logic matches database query
3. Enum values match between UI and database
4. Case sensitivity in string comparisons
5. Date range format compatible with database

### Pattern 4: Export Producing Bad Data

**Check:**
1. Export configuration matches expected format
2. Data serialization handling special characters
3. JSONL format: one object per line (no array wrapper)
4. CSV format: proper escaping of commas/quotes
5. Metadata fields included/excluded as configured

---

## Debugging Workflow

1. **Reproduce** - Follow exact user steps, capture errors
2. **Identify Layer** - UI, API, Database, or AI layer
3. **Investigate Data** - Use SAOL to verify data integrity
4. **Fix & Validate** - Test with reproduction steps
5. **Document** - Note what broke and how fixed

---

## Quick Reference: Essential Commands

### Database Operations
```bash
# Query conversations
node -e "const saol=require('supa-agent-ops');(async()=>{const r=await saol.agentQuery({table:'conversations',limit:10});console.log(r.data);})();"

# Check schema
node -e "const saol=require('supa-agent-ops');(async()=>{const r=await saol.agentIntrospectSchema({table:'conversations',transport:'pg'});console.log(r.tables[0].columns);})();"

# Count by status
node -e "const saol=require('supa-agent-ops');(async()=>{const r=await saol.agentCount({table:'conversations',where:[{column:'status',operator:'eq',value:'approved'}]});console.log('Count:',r.count);})();"
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run type check
npm run type-check

# Run linter
npm run lint
```

---

## When to Reference Full Documentation

| Scenario | Document | Section/Lines |
|----------|----------|---------------|
| Understanding product vision | `01-bmo-overview-train-data_v1.md` | Product Summary (lines 1-200) |
| Feature requirements | `03-train-functional-requirements-integrate-wireframe_v1.md` | Specific FR sections |
| Database schema details | `03-train-functional-requirements-integrate-wireframe_v1.md` | Section 1: Database Foundation |
| Type definitions | `src/lib/types.ts` | Import directly |
| API implementation | `src/app/api/` | Check route handlers |

---

## Context Document Usage Guidelines

**For Bug Reports:**
1. **State the bug clearly** (2-3 sentences maximum)
2. **Provide reproduction steps** (numbered list)
3. **Include error messages/screenshots** (actual errors)
4. **Reference this context** ("See bug context doc for system overview")
5. **Dedicate 80% of prompt to the actual issue** (not background)

**For Agents Fixing Bugs:**
1. **Skim this document first** (5 minutes maximum)
2. **Deep dive into specific sections** as needed
3. **Always verify data integrity** with SAOL before assuming code issues
4. **Check type definitions** match database reality
5. **Test fix against functional requirements** from FR doc

---

## Version History

**v2.0 (2025-11-12):** Updated with new SAOL quick start guide reference  
**v1.0 (2025-11-12):** Initial context document for testing cycle

---

**Remember:** This document is a **reference**, not a tutorial. Spend most of your debugging time on the actual issue, not reading documentation. Use SAOL for all database operations—never write raw SQL or manual escaping.
