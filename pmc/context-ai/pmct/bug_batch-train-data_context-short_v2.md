# Bug Fix Context: Train-Data Module (Short Version)

**Version:** 2.0  
**Date:** November 12, 2025  
**Purpose:** Concise context for AI agents fixing bugs during functional testing

---

## Product Context

Bright Run transforms unstructured business knowledge into high-quality LoRA fine-tuning training data. The platform enables non-technical domain experts to convert proprietary knowledge into thousands of semantically diverse training conversation pairs.

**Core Workflow:** Upload documents → AI chunks content → Generate QA conversations → Review & approve → Expand synthetically → Export training data

**Three-Tier Architecture:** Template (foundational) → Scenario (contextual variations) → Edge Case (boundary conditions)

### Critical Documents

| Document | Purpose | Path |
|----------|---------|------|
| **Product Overview** | Full product vision, architecture, success criteria | `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-bmo-overview-train-data_v1.md` |
| **Functional Requirements** | Complete FR specs with wireframe integration | `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-train-functional-requirements-integrate-wireframe_v1.md` |

---

## Codebase Structure

**Primary Source:** `C:\Users\james\Master\BrightHub\brun\train-data\src`

```
src/
├── app/(dashboard)/          # Dashboard routes (conversations, upload, etc.)
├── app/api/chunks/           # Chunk processing API endpoints
├── components/ui/            # Shadcn UI components
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   ├── database.ts           # Supabase database service
│   ├── ai-config.ts          # Claude AI configuration
│   └── supabase.ts           # Supabase client
```

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Claude API

---

## Key Pages & Routes

| Route | File Path | Purpose |
|-------|-----------|---------|
| `/dashboard` | `C:\Users\james\Master\BrightHub\brun\train-data\src\app\(dashboard)\dashboard\page.tsx` | Overview dashboard |
| `/conversations` | `C:\Users\james\Master\BrightHub\brun\train-data\src\app\(dashboard)\conversations\page.tsx` | Main conversation table |
| `/conversations/generate` | `C:\Users\james\Master\BrightHub\brun\train-data\src\app\(dashboard)\conversations\generate\page.tsx` | Generation interface |
| `/upload` | `C:\Users\james\Master\BrightHub\brun\train-data\src\app\(dashboard)\upload\page.tsx` | Document upload |

**To Be Implemented:** `/conversations/review-queue`, `/conversations/templates`, `/conversations/scenarios`, `/conversations/edge-cases`

---

## Mock Data Locations

| Data Type | Location | Validation Method |
|-----------|----------|-------------------|
| Conversations | Supabase `conversations` table | Use SAOL `agentQuery` |
| Templates | Supabase `templates` table | Check tier, active status |
| Chunks | Supabase `chunks` table | Verify parent references |
| Test fixtures | `C:\Users\james\Master\BrightHub\brun\train-data\src\__tests__\fixtures\` | Check if exists |

---

## Supabase Agent Ops Library (SAOL)

**For all Supabase operations use the Supabase Agent Ops Library (SAOL).**

**Library location:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`  
**Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`

---

## Type System Reference

**Import from:** `C:\Users\james\Master\BrightHub\brun\train-data\src\lib\types.ts`

**Core Types:**
```typescript
interface Conversation {
  id: string;              // UUID
  conversation_id: string; // fp_[persona]_[###]
  status: ConversationStatus;
  tier: TierType;
  qualityScore?: number;   // 0-10
  totalTurns?: number;
  parameters?: Record<string, any>;  // JSONB
  parentId?: string;       // For regenerations
  reviewHistory?: ReviewAction[];
}

type ConversationStatus = 'draft' | 'generated' | 'pending_review' 
  | 'approved' | 'rejected' | 'needs_revision' | 'failed';

type TierType = 'template' | 'scenario' | 'edge_case';
```

---

## Debugging Workflow

1. **Reproduce** - Follow exact user steps, capture errors
2. **Identify Layer** - UI, API, Database, or AI layer
3. **Investigate Data** - Use SAOL to verify data integrity
4. **Fix & Validate** - Test with reproduction steps
5. **Document** - Note what broke and how fixed

---

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run type-check   # TypeScript validation
npm run lint         # Run linter
```

---

## Context Document Usage Guidelines

**For Bug Reports:**
1. State the bug clearly (2-3 sentences max)
2. Provide reproduction steps (numbered list)
3. Include error messages/screenshots
4. Reference this context doc
5. Dedicate 80% of prompt to the actual issue

**For Agents Fixing Bugs:**
1. Skim this document first (2 minutes)
2. Deep dive specific sections as needed
3. Always verify data integrity with SAOL first
4. Check type definitions match database reality
5. Test fix against functional requirements

---

**Full Context:** See `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\bug_batch-train-data_context-long_v2.md` for comprehensive details including user journeys, mock data validation, common bug patterns, and debugging approaches.

**Remember:** This is a reference, not a tutorial. Use SAOL for all database operations—never write raw SQL or manual escaping.
