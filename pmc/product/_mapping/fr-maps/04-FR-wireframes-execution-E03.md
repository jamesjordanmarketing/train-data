# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E03)
**Generated**: 2025-01-29  
**Segment**: E03 - Core UI Components & Layouts  
**Total Prompts**: 6  
**Estimated Implementation Time**: 60-80 hours

---

## Executive Summary

This segment implements the foundational UI components and data management layer for the Interactive LoRA Conversation Generation platform. E03 transforms the wireframe prototype into a production-ready application with live database integration, complete API services, and a fully functional dashboard experience. This is the critical segment that bridges static prototype to dynamic application.

**Strategic Importance:**
- Establishes database foundation supporting all future features
- Implements core API services enabling conversation CRUD operations
- Delivers primary user interface for conversation management
- Enables multi-dimensional filtering and sorting workflows
- Sets architectural patterns for all subsequent development

**Key Deliverables:**
1. **Database Layer**: Normalized PostgreSQL schema with optimized indexes
2. **API Services**: RESTful endpoints for conversations, filtering, and bulk operations
3. **State Management**: Zustand store mirroring wireframe architecture
4. **Dashboard UI**: Complete conversation table with sorting, filtering, and selection
5. **Data Fetching**: SWR/React Query integration with caching
6. **User Feedback**: Loading states, empty states, toast notifications

---

## Context and Dependencies

### Previous Segment Deliverables

**E01-E02 Completed Work:**
- ✅ Wireframe prototype with complete UI component library (Shadcn/UI)
- ✅ Type definitions for all data models (`train-wireframe/src/lib/types.ts`)
- ✅ Mock data and state management patterns (`train-wireframe/src/stores/useAppStore.ts`)
- ✅ Dashboard layout shell, table component, filter bar UI
- ✅ Existing chunks-alpha module with document categorization and chunk extraction
- ✅ Authentication system with Supabase integration
- ✅ Next.js 14 app router architecture

**Patterns to Preserve:**
- Component architecture from wireframe (Dashboard, Table, FilterBar)
- Type safety with TypeScript strict mode
- State management with Zustand
- UI consistency with Shadcn/UI components
- Responsive design patterns

### Current Codebase State

**Wireframe Implementation (`train-wireframe/src/`):**
- ✅ Complete UI component library ready for production integration
- ✅ Type definitions: `Conversation`, `QualityMetrics`, `FilterConfig`, `ConversationStatus`
- ✅ Store structure: `useAppStore` with conversations, filters, selections, UI state
- ✅ Components: `ConversationTable`, `FilterBar`, `DashboardView`, `DashboardLayout`
- ⚠️ Currently using mock data - needs live API integration

**Main Application (`src/`):**
- ✅ Database service layer for documents and chunks (`src/lib/database.ts`)
- ✅ API routes for chunks (`src/app/api/chunks/`)
- ✅ Supabase client configuration (`src/lib/supabase.ts`)
- ⚠️ No conversations table in database yet
- ⚠️ No conversation API routes yet

**Integration Points:**
- Conversations must link to chunks via `chunk_id` foreign key
- Reuse existing database service patterns from chunks module
- Leverage existing Supabase client and authentication
- Maintain Next.js App Router patterns

### Cross-Segment Dependencies

**Database Dependencies:**
- `documents` table (chunks-alpha) - exists
- `chunks` table (chunks-alpha) - exists  
- `conversations` table - **must be created in E03**
- `conversation_turns` table - **must be created in E03**

**Service Dependencies:**
- Supabase client - exists (`src/lib/supabase.ts`)
- Database service base - exists (`src/lib/database.ts`)
- Auth service - exists (`src/lib/auth-service.ts`)

**UI Dependencies:**
- Shadcn/UI components - exists (both wireframe and main app)
- Layout components - wireframe complete, needs porting
- Type definitions - wireframe complete, needs syncing to main app

---

## Implementation Strategy

### Risk Assessment

**High-Risk Areas:**
1. **Database Schema Migration** (Risk: High)
   - Impact: Foundation for all conversation features
   - Mitigation: Carefully validate schema against types, test indexes, include rollback scripts
   - Validation: Manual testing with 100+ records, query performance verification

2. **API Endpoint Design** (Risk: Medium)
   - Impact: Once deployed, breaking changes expensive
   - Mitigation: Follow REST conventions, comprehensive request/response typing, version API if needed
   - Validation: Postman/Insomnia testing, error case coverage

3. **State Management Integration** (Risk: Medium)
   - Impact: Poor state management causes UI bugs and performance issues
   - Mitigation: Mirror wireframe patterns exactly, use React Query for server state
   - Validation: Test all CRUD operations, verify optimistic updates, check for race conditions

4. **Type System Consistency** (Risk: Low)
   - Impact: Type mismatches between wireframe and main app cause runtime errors
   - Mitigation: Copy types from wireframe, validate with TypeScript strict mode
   - Validation: Zero TypeScript errors, runtime type validation

### Prompt Sequencing Logic

**Sequence Rationale:**

**Prompt 1: Database Foundation** (Critical Path)
- Must come first - all features depend on data layer
- Establishes schema, indexes, constraints
- Includes seed data for development testing
- Risk: High | Complexity: Medium | Duration: 8-10 hours

**Prompt 2: API Services Layer** (Critical Path)
- Depends on: Database schema
- Provides CRUD endpoints for UI consumption
- Includes filtering, sorting, pagination logic
- Risk: Medium | Complexity: High | Duration: 12-16 hours

**Prompt 3: State Management & Data Fetching** (Critical Path)
- Depends on: API services
- Bridges backend and frontend
- Implements caching, optimistic updates
- Risk: Medium | Complexity: Medium | Duration: 10-12 hours

**Prompt 4: Dashboard UI Integration** (High Priority)
- Depends on: State management
- Ports wireframe components to main app
- Integrates live data with table/filters
- Risk: Low | Complexity: Medium | Duration: 12-16 hours

**Prompt 5: Advanced Table Features** (Medium Priority)
- Depends on: Dashboard UI
- Implements sorting, bulk selection, inline actions
- Adds keyboard navigation support
- Risk: Low | Complexity: Medium | Duration: 10-12 hours

**Prompt 6: Loading States & Polish** (Low Priority)
- Depends on: All previous prompts
- Adds skeleton loaders, empty states, error handling
- Implements toast notifications
- Risk: Low | Complexity: Low | Duration: 8-10 hours

**Total Sequential Path**: Prompts 1-4 (42-54 hours critical path)  
**Parallelizable Work**: Prompts 5-6 can partially overlap with Prompt 4 (18-22 hours)

### Quality Assurance Approach

**Per-Prompt Validation:**
- Each prompt includes specific acceptance criteria
- Manual testing steps documented
- Database queries validated with EXPLAIN ANALYZE
- API endpoints tested with Postman collections
- UI components tested with React Developer Tools

**Integration Testing:**
- End-to-end workflow: Create conversation → Display in table → Filter → Sort → Update status
- Performance testing: 100+ conversations load < 500ms
- Error handling: Network failures, validation errors, database constraints
- State consistency: Verify optimistic updates revert on failure

**Code Quality Standards:**
- TypeScript strict mode with zero errors
- ESLint compliance
- Consistent naming conventions (camelCase variables, PascalCase components)
- JSDoc comments for all public APIs
- Error messages user-friendly and actionable

---

## Database Setup Instructions

### Required SQL Operations

Execute these SQL statements in Supabase SQL Editor **before starting Prompt 1**. These create the foundation for all conversation data.

========================

```sql
-- =====================================================
-- CONVERSATIONS TABLE SCHEMA
-- =====================================================
-- Purpose: Store conversation metadata and status
-- References: train-wireframe/src/lib/types.ts:26-46
-- Dependencies: chunks table (chunks-alpha module)
-- =====================================================

-- Drop existing tables if re-running (CAUTION: destroys data)
DROP TABLE IF EXISTS conversation_turns CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create enum types for type safety
DO $$ BEGIN
    CREATE TYPE conversation_status AS ENUM (
        'draft',
        'generated', 
        'pending_review',
        'approved',
        'rejected',
        'needs_revision',
        'none',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tier_type AS ENUM (
        'template',
        'scenario',
        'edge_case'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Main conversations table
CREATE TABLE conversations (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT UNIQUE NOT NULL,
    
    -- Foreign keys to chunks-alpha
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES chunks(id) ON DELETE SET NULL,
    
    -- Core metadata (structured for indexing)
    persona TEXT,
    emotion TEXT,
    topic TEXT,
    intent TEXT,
    tone TEXT,
    category TEXT[] DEFAULT '{}',
    
    -- Classification
    tier tier_type NOT NULL DEFAULT 'template',
    status conversation_status NOT NULL DEFAULT 'draft',
    
    -- Quality metrics
    quality_score NUMERIC(3,1) CHECK (quality_score >= 0 AND quality_score <= 10),
    total_turns INTEGER DEFAULT 0 CHECK (total_turns >= 0),
    token_count INTEGER DEFAULT 0,
    
    -- Flexible metadata storage
    parameters JSONB DEFAULT '{}',
    quality_metrics JSONB DEFAULT '{}',
    review_history JSONB DEFAULT '[]',
    
    -- Version tracking
    parent_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    parent_type TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Approval tracking
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ
);

-- =====================================================
-- CONVERSATION TURNS TABLE (NORMALIZED)
-- =====================================================
-- Purpose: Store individual conversation turns
-- Pattern: One-to-many relationship with conversations
-- =====================================================

CREATE TABLE conversation_turns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    turn_number INTEGER NOT NULL CHECK (turn_number > 0),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure turn sequence uniqueness
    UNIQUE(conversation_id, turn_number)
);

-- =====================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- =====================================================
-- Purpose: Optimize common query patterns from dashboard
-- Reference: FilterBar and ConversationTable usage patterns
-- =====================================================

-- Single column indexes for frequent filters
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_tier ON conversations(tier);
CREATE INDEX idx_conversations_quality_score ON conversations(quality_score);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- Composite index for common filter combinations
CREATE INDEX idx_conversations_status_quality ON conversations(status, quality_score);
CREATE INDEX idx_conversations_tier_status ON conversations(tier, status, created_at DESC);

-- Partial index for review queue optimization
CREATE INDEX idx_conversations_pending_review ON conversations(created_at DESC) 
    WHERE status = 'pending_review';

-- Text search index for persona/emotion/topic
CREATE INDEX idx_conversations_text_search ON conversations 
    USING GIN (to_tsvector('english', 
        COALESCE(persona, '') || ' ' || 
        COALESCE(emotion, '') || ' ' || 
        COALESCE(topic, '')
    ));

-- JSONB indexes for metadata queries
CREATE INDEX idx_conversations_parameters ON conversations USING GIN (parameters jsonb_path_ops);
CREATE INDEX idx_conversations_quality_metrics ON conversations USING GIN (quality_metrics jsonb_path_ops);

-- Array index for category filtering
CREATE INDEX idx_conversations_category ON conversations USING GIN (category);

-- Foreign key indexes
CREATE INDEX idx_conversations_document_id ON conversations(document_id);
CREATE INDEX idx_conversations_chunk_id ON conversations(chunk_id);
CREATE INDEX idx_conversations_parent_id ON conversations(parent_id);

-- Conversation turns indexes
CREATE INDEX idx_conversation_turns_conversation_id ON conversation_turns(conversation_id, turn_number);

-- =====================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Purpose: Multi-tenant data isolation
-- Note: Adjust based on your auth requirements
-- =====================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all conversations (adjust for multi-tenancy)
CREATE POLICY "Users can view conversations"
    ON conversations FOR SELECT
    USING (true);

-- Policy: Users can insert their own conversations
CREATE POLICY "Users can insert conversations"
    ON conversations FOR INSERT
    WITH CHECK (true);

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update conversations"
    ON conversations FOR UPDATE
    USING (true);

-- Policy: Users can delete their own conversations
CREATE POLICY "Users can delete conversations"
    ON conversations FOR DELETE
    USING (true);

-- Policy: Users can view turns for accessible conversations
CREATE POLICY "Users can view conversation turns"
    ON conversation_turns FOR SELECT
    USING (true);

-- Policy: Users can insert turns for accessible conversations
CREATE POLICY "Users can insert conversation turns"
    ON conversation_turns FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- SEED DATA FOR DEVELOPMENT
-- =====================================================
-- Purpose: Sample conversations for UI testing
-- Note: Delete in production or use conditional logic
-- =====================================================

INSERT INTO conversations (
    conversation_id, 
    persona, 
    emotion, 
    topic, 
    tier, 
    status, 
    quality_score, 
    total_turns,
    parameters,
    quality_metrics
) VALUES 
(
    'fp_financial_advisor_001',
    'Experienced Financial Advisor',
    'Confident and Reassuring',
    'Retirement Planning',
    'template',
    'approved',
    8.5,
    12,
    '{"intent": "advice", "tone": "professional"}',
    '{"completeness": 9, "relevance": 8, "structure": 9, "confidence": 0.85}'
),
(
    'fp_anxious_investor_002',
    'Anxious First-Time Investor',
    'Nervous and Uncertain',
    'Stock Market Basics',
    'scenario',
    'pending_review',
    7.2,
    10,
    '{"intent": "education", "tone": "empathetic"}',
    '{"completeness": 7, "relevance": 8, "structure": 7, "confidence": 0.72}'
),
(
    'fp_estate_planner_003',
    'Estate Planning Specialist',
    'Serious and Thorough',
    'Trust Setup',
    'scenario',
    'generated',
    6.8,
    8,
    '{"intent": "consultation", "tone": "formal"}',
    '{"completeness": 6, "relevance": 7, "structure": 7, "confidence": 0.68}'
),
(
    'fp_crypto_enthusiast_004',
    'Cryptocurrency Enthusiast',
    'Excited and Optimistic',
    'DeFi Investment',
    'edge_case',
    'draft',
    5.5,
    6,
    '{"intent": "exploration", "tone": "casual"}',
    '{"completeness": 5, "relevance": 6, "structure": 5, "confidence": 0.55}'
),
(
    'fp_risk_manager_005',
    'Corporate Risk Manager',
    'Analytical and Cautious',
    'Portfolio Diversification',
    'template',
    'approved',
    9.1,
    14,
    '{"intent": "strategy", "tone": "technical"}',
    '{"completeness": 9, "relevance": 9, "structure": 10, "confidence": 0.91}'
);

-- Sample conversation turns for first conversation
INSERT INTO conversation_turns (conversation_id, turn_number, role, content) VALUES
((SELECT id FROM conversations WHERE conversation_id = 'fp_financial_advisor_001'), 1, 'user', 'I''m 45 years old and want to start planning for retirement. Where should I begin?'),
((SELECT id FROM conversations WHERE conversation_id = 'fp_financial_advisor_001'), 2, 'assistant', 'Great question! Starting retirement planning at 45 gives you about 20 years to build wealth. Let''s assess your current financial situation first. Do you have any existing retirement accounts like a 401(k) or IRA?'),
((SELECT id FROM conversations WHERE conversation_id = 'fp_financial_advisor_001'), 3, 'user', 'I have a 401(k) through work with about $150,000, but I haven''t contributed much lately.'),
((SELECT id FROM conversations WHERE conversation_id = 'fp_financial_advisor_001'), 4, 'assistant', 'That''s a solid foundation. At 45, you should aim to maximize your contributions. The current 401(k) limit is $23,000 per year, plus a $7,500 catch-up contribution if you''re 50 or older. Are you taking full advantage of any employer match?');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify schema creation
-- =====================================================

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_turns');

-- Verify indexes created
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('conversations', 'conversation_turns');

-- Count seed data
SELECT 
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE status = 'approved') as approved,
    COUNT(*) FILTER (WHERE status = 'pending_review') as pending_review,
    AVG(quality_score) as avg_quality
FROM conversations;

-- Test query performance (should use indexes)
EXPLAIN ANALYZE
SELECT * FROM conversations 
WHERE status = 'pending_review' 
ORDER BY created_at DESC 
LIMIT 25;
```

++++++++++++++++++

**Post-Execution Validation:**
1. ✅ Verify 2 tables created: `conversations`, `conversation_turns`
2. ✅ Verify 15+ indexes created
3. ✅ Verify 5 seed conversations inserted
4. ✅ Test query performance < 100ms for indexed queries
5. ✅ Verify RLS policies active

---

## Implementation Prompts

### Prompt 1: Database Service Layer & API Foundation
**Scope**: Create conversation service layer and core CRUD API endpoints  
**Dependencies**: Database schema must be created (SQL above executed)  
**Estimated Time**: 12-16 hours  
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing the **Conversation Service Layer and Core API Endpoints** for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

This is a training data generation platform that helps small businesses create high-quality conversation datasets for fine-tuning LLMs. Users need to view, filter, sort, and manage hundreds of AI-generated conversations through a dashboard interface.

**Product Goals:**
- Enable users to generate 90-100 training conversations efficiently
- Provide quality control through review and approval workflows
- Support multi-dimensional filtering (persona, emotion, topic, tier, status, quality)
- Export approved conversations in LoRA training formats

**Current State:**
- ✅ Database schema created with `conversations` and `conversation_turns` tables
- ✅ Existing chunks-alpha module with document/chunk management
- ✅ Supabase client configured (`src/lib/supabase.ts`)
- ✅ Database service pattern established (`src/lib/database.ts`)
- ⚠️ No conversation-specific services or API routes yet

**CURRENT CODEBASE STATE:**

**Existing Database Service Pattern** (`src/lib/database.ts`):
```typescript
// Example of existing pattern for documents
async function getDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

**Existing API Route Pattern** (`src/app/api/documents/route.ts`):
```typescript
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*');
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

**Type Definitions Available** (`train-wireframe/src/lib/types.ts`):
```typescript
export type ConversationStatus = 
  | 'draft' 
  | 'generated' 
  | 'pending_review'
  | 'approved' 
  | 'rejected' 
  | 'needs_revision' 
  | 'none' 
  | 'failed';

export type TierType = 'template' | 'scenario' | 'edge_case';

export interface Conversation {
  id: string;
  conversation_id: string;
  document_id?: string;
  chunk_id?: string;
  persona?: string;
  emotion?: string;
  topic?: string;
  intent?: string;
  tone?: string;
  category: string[];
  tier: TierType;
  status: ConversationStatus;
  quality_score?: number;
  total_turns: number;
  token_count?: number;
  parameters: Record<string, any>;
  quality_metrics?: QualityMetrics;
  review_history?: ReviewAction[];
  parent_id?: string;
  parent_type?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export interface ConversationTurn {
  id: string;
  conversation_id: string;
  turn_number: number;
  role: 'user' | 'assistant';
  content: string;
  token_count?: number;
  created_at: string;
}

export interface QualityMetrics {
  completeness: number;
  relevance: number;
  structure: number;
  confidence: number;
}

export interface ReviewAction {
  action: 'approved' | 'rejected' | 'revision_requested' | 'generated' | 'moved_to_review';
  performer: string;
  timestamp: string;
  comment?: string;
  reasons?: string[];
}
```

**IMPLEMENTATION TASKS:**

**Task 1: Create Type Definitions File** (`src/lib/types/conversations.ts`)
1. Copy complete type definitions from wireframe (`train-wireframe/src/lib/types.ts`)
2. Export: `Conversation`, `ConversationTurn`, `ConversationStatus`, `TierType`, `QualityMetrics`, `ReviewAction`
3. Add Zod schemas for request validation:
   - `ConversationCreateSchema`
   - `ConversationUpdateSchema`
   - `FilterParamsSchema`

**Task 2: Create Conversation Service Layer** (`src/lib/conversation-service.ts`)

Implement these service functions following the existing database service pattern:

```typescript
// Core CRUD operations
async function getConversations(filters?: FilterParams): Promise<Conversation[]>
async function getConversationById(id: string): Promise<Conversation | null>
async function getConversationWithTurns(id: string): Promise<ConversationWithTurns | null>
async function createConversation(data: ConversationCreate): Promise<Conversation>
async function updateConversation(id: string, updates: ConversationUpdate): Promise<Conversation>
async function deleteConversation(id: string): Promise<void>

// Filtering and querying
async function getConversationsByStatus(status: ConversationStatus): Promise<Conversation[]>
async function getConversationsByTier(tier: TierType): Promise<Conversation[]>
async function searchConversations(query: string): Promise<Conversation[]>

// Batch operations
async function bulkUpdateStatus(ids: string[], status: ConversationStatus): Promise<number>
async function getConversationCount(filters?: FilterParams): Promise<number>
```

**Key Implementation Details:**
- Use Supabase client with proper error handling
- Implement dynamic WHERE clause building for filters
- Support sorting by: created_at, updated_at, quality_score, total_turns
- Include pagination with limit/offset
- Optimize queries to use indexes (check with EXPLAIN ANALYZE)
- Handle JSONB fields (parameters, quality_metrics) correctly

**Task 3: Create Conversation Turns Service** (`src/lib/conversation-turn-service.ts`)

```typescript
async function getTurnsByConversationId(conversationId: string): Promise<ConversationTurn[]>
async function createTurn(turn: ConversationTurnCreate): Promise<ConversationTurn>
async function bulkCreateTurns(turns: ConversationTurnCreate[]): Promise<ConversationTurn[]>
async function updateTurnContent(id: string, content: string): Promise<ConversationTurn>
async function deleteTurnsForConversation(conversationId: string): Promise<void>
```

**Task 4: Create API Route - GET /api/conversations** (`src/app/api/conversations/route.ts`)

**Request:**
```typescript
GET /api/conversations?tier=template&status=approved&sortBy=created_at&sortOrder=desc&limit=50&offset=0
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

**Implementation Requirements:**
- Parse query parameters: tier[], status[], qualityScoreMin, qualityScoreMax, searchQuery, sortBy, sortOrder, limit, offset
- Validate parameters with Zod
- Call `getConversations(filters)` from service layer
- Get total count with `getConversationCount(filters)`
- Return paginated response with metadata
- Handle errors with appropriate HTTP status codes:
  - 400: Invalid parameters
  - 500: Database errors

**Task 5: Create API Route - GET /api/conversations/[id]** (`src/app/api/conversations/[id]/route.ts`)

**Request:**
```typescript
GET /api/conversations/550e8400-e29b-41d4-a716-446655440000?includeTurns=true
```

**Response:**
```json
{
  "conversation": {...},
  "turns": [...]  // if includeTurns=true
}
```

**Implementation Requirements:**
- Extract `id` from route parameters
- Optional `includeTurns` query parameter (default: true)
- Call `getConversationWithTurns(id)` if turns requested
- Return 404 if conversation not found
- Return 200 with conversation data

**Task 6: Create API Route - POST /api/conversations** (`src/app/api/conversations/route.ts`)

**Request:**
```json
{
  "conversation_id": "fp_financial_001",
  "persona": "Financial Advisor",
  "emotion": "Confident",
  "topic": "Retirement Planning",
  "tier": "template",
  "parameters": {"intent": "advice"}
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "conversation_id": "fp_financial_001",
  "status": "draft",
  ...
}
```

**Implementation Requirements:**
- Validate request body with `ConversationCreateSchema`
- Generate UUID for `id`
- Set default status to 'draft'
- Set timestamps (created_at, updated_at)
- Call `createConversation(data)`
- Return 201 with created conversation
- Handle validation errors with 400
- Handle duplicate conversation_id with 409

**Task 7: Create API Route - PATCH /api/conversations/[id]** (`src/app/api/conversations/[id]/route.ts`)

**Request:**
```json
{
  "status": "approved",
  "quality_score": 8.5,
  "review_history": [
    {
      "action": "approved",
      "performer": "user-id",
      "timestamp": "2025-01-29T10:00:00Z",
      "comment": "Excellent quality"
    }
  ]
}
```

**Response:**
```json
{
  "conversation": {...updated conversation}
}
```

**Implementation Requirements:**
- Validate partial updates with `ConversationUpdateSchema`
- Support updating: status, quality_score, quality_metrics, parameters, review_history
- Automatically update `updated_at` timestamp
- Append to review_history array (don't replace)
- Call `updateConversation(id, updates)`
- Return 404 if not found
- Return 200 with updated conversation

**Task 8: Create API Route - DELETE /api/conversations/[id]** (`src/app/api/conversations/[id]/route.ts`)

**Response:**
```json
{
  "message": "Conversation deleted successfully",
  "id": "uuid-here"
}
```

**Implementation Requirements:**
- Soft delete option: update status to 'archived' (recommended)
- Hard delete: actually remove from database (use with caution)
- Cascade delete conversation_turns (handled by DB constraint)
- Call `deleteConversation(id)`
- Return 404 if not found
- Return 200 with confirmation

**Task 9: Create API Route - POST /api/conversations/bulk-update** (`src/app/api/conversations/bulk-update/route.ts`)

**Request:**
```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"],
  "updates": {
    "status": "approved"
  }
}
```

**Response:**
```json
{
  "updated": 3,
  "failed": 0,
  "results": [
    {"id": "uuid-1", "success": true},
    {"id": "uuid-2", "success": true},
    {"id": "uuid-3", "success": true}
  ]
}
```

**Implementation Requirements:**
- Validate array of IDs (max 100 per request)
- Use database transaction for atomicity
- Call `bulkUpdateStatus(ids, status)`
- Handle partial failures gracefully
- Return detailed results per ID
- Log bulk operations for audit trail

**ACCEPTANCE CRITERIA:**

1. ✅ All type definitions copied from wireframe to `src/lib/types/conversations.ts`
2. ✅ Conversation service implements all CRUD functions with proper error handling
3. ✅ GET /api/conversations returns filtered, sorted, paginated conversations
4. ✅ GET /api/conversations/[id] returns conversation with optional turns
5. ✅ POST /api/conversations creates conversation with validation
6. ✅ PATCH /api/conversations/[id] updates conversation fields
7. ✅ DELETE /api/conversations/[id] removes conversation
8. ✅ POST /api/conversations/bulk-update handles batch operations
9. ✅ All API routes use proper HTTP status codes
10. ✅ Errors return user-friendly messages

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/
├── lib/
│   ├── types/
│   │   └── conversations.ts           [NEW]
│   ├── conversation-service.ts        [NEW]
│   └── conversation-turn-service.ts   [NEW]
└── app/
    └── api/
        └── conversations/
            ├── route.ts                [NEW - GET, POST]
            ├── [id]/
            │   └── route.ts            [NEW - GET, PATCH, DELETE]
            └── bulk-update/
                └── route.ts            [NEW - POST]
```

**Error Handling Pattern:**
```typescript
try {
  const data = await conversationService.getConversations(filters);
  return NextResponse.json({ data, meta });
} catch (error) {
  console.error('Error fetching conversations:', error);
  return NextResponse.json(
    { error: 'Failed to fetch conversations', details: error.message },
    { status: 500 }
  );
}
```

**Query Builder Pattern:**
```typescript
let query = supabase.from('conversations').select('*');

if (filters.tier) {
  query = query.in('tier', filters.tier);
}
if (filters.status) {
  query = query.in('status', filters.status);
}
if (filters.qualityScoreMin) {
  query = query.gte('quality_score', filters.qualityScoreMin);
}

const { data, error } = await query
  .order(sortBy, { ascending: sortOrder === 'asc' })
  .range(offset, offset + limit - 1);
```

**VALIDATION REQUIREMENTS:**

**Manual Testing Checklist:**
1. Test GET /api/conversations with no filters → returns all conversations
2. Test GET /api/conversations with tier=template → returns only template tier
3. Test GET /api/conversations with multiple filters → applies all filters correctly
4. Test GET /api/conversations/[id] → returns single conversation
5. Test POST /api/conversations with valid data → creates conversation
6. Test POST /api/conversations with invalid data → returns 400 validation error
7. Test PATCH /api/conversations/[id] → updates conversation
8. Test DELETE /api/conversations/[id] → removes conversation
9. Test POST /api/conversations/bulk-update → updates multiple conversations
10. Test error cases: invalid ID (404), database errors (500)

**Performance Validation:**
1. GET /api/conversations with 100 records should complete in < 500ms
2. Filtered queries should use indexes (verify with Supabase logs)
3. Bulk update of 50 conversations should complete in < 2 seconds

**DELIVERABLES:**

1. ✅ `src/lib/types/conversations.ts` - Type definitions and Zod schemas
2. ✅ `src/lib/conversation-service.ts` - Service layer with CRUD functions
3. ✅ `src/lib/conversation-turn-service.ts` - Turn management service
4. ✅ `src/app/api/conversations/route.ts` - GET and POST endpoints
5. ✅ `src/app/api/conversations/[id]/route.ts` - GET, PATCH, DELETE endpoints
6. ✅ `src/app/api/conversations/bulk-update/route.ts` - Bulk operation endpoint
7. ✅ Postman collection or API test file demonstrating all endpoints
8. ✅ Brief documentation in comments explaining filter parameters

Implement this service layer completely, following existing patterns from the chunks-alpha module. Ensure all API endpoints are testable with Postman before marking complete.

++++++++++++++++++


### Prompt 2: State Management & Data Fetching Layer
**Scope**: Implement Zustand store and React Query hooks for conversation data  
**Dependencies**: API endpoints must be functional (Prompt 1 complete)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Medium

========================

You are a senior frontend developer implementing the **State Management and Data Fetching Layer** for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

This layer bridges the backend API and frontend UI components. You are porting the state management patterns from the wireframe prototype to the production application, integrating live API data instead of mock data.

**Architecture Goals:**
- Separate server state (API data) from client state (UI state)
- Use React Query/SWR for server state management with caching
- Use Zustand for client-side UI state (selections, filters, modals)
- Implement optimistic updates for instant UI feedback
- Handle loading, error, and empty states gracefully

**Current State:**
- ✅ API endpoints functional at `/api/conversations`
- ✅ Wireframe store at `train-wireframe/src/stores/useAppStore.ts` with complete patterns
- ⚠️ Main app has basic store (`src/stores/workflow-store.ts`) but no conversation state yet
- ⚠️ No data fetching hooks implemented yet

**CURRENT CODEBASE STATE:**

**Wireframe Store Pattern** (`train-wireframe/src/stores/useAppStore.ts`):
```typescript
interface AppState {
  // Conversation data
  conversations: Conversation[];
  currentConversation: Conversation | null;
  
  // UI state
  isLoading: boolean;
  loadingMessage: string;
  sidebarCollapsed: boolean;
  currentView: string;
  
  // Filters and selections
  selectedConversationIds: string[];
  filterConfig: FilterConfig;
  
  // Modals and dialogs
  modalState: {
    exportModalOpen: boolean;
    batchGenerationModalOpen: boolean;
    confirmationDialog: {
      open: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
    };
  };
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  toggleConversationSelection: (id: string) => void;
  selectAllConversations: () => void;
  clearSelection: () => void;
  setFilterConfig: (config: Partial<FilterConfig>) => void;
  setLoading: (loading: boolean, message?: string) => void;
}
```

**Existing Workflow Store** (`src/stores/workflow-store.ts`):
```typescript
import { create } from 'zustand';

interface WorkflowState {
  currentStep: number;
  documentId: string | null;
  // ... workflow-specific state
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  currentStep: 1,
  documentId: null,
  // ... actions
}));
```

**IMPLEMENTATION TASKS:**

**Task 1: Create Conversation Store** (`src/stores/conversation-store.ts`)

Port the conversation-related state from wireframe, removing mock data logic:

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Conversation, FilterConfig, ConversationStatus } from '@/lib/types/conversations';

interface ConversationState {
  // UI State (persist in localStorage)
  selectedConversationIds: string[];
  filterConfig: FilterConfig;
  sidebarCollapsed: boolean;
  currentView: 'dashboard' | 'templates' | 'scenarios' | 'edge-cases' | 'review-queue' | 'settings';
  
  // Modal State
  modalState: {
    exportModalOpen: boolean;
    batchGenerationModalOpen: boolean;
    conversationDetailModalOpen: boolean;
    currentConversationId: string | null;
    confirmationDialog: {
      open: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel?: () => void;
    };
  };
  
  // Loading State
  isLoading: boolean;
  loadingMessage: string;
  
  // Actions
  // Selection actions
  toggleConversationSelection: (id: string) => void;
  selectAllConversations: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Filter actions
  setFilterConfig: (config: Partial<FilterConfig>) => void;
  resetFilters: () => void;
  
  // Modal actions
  openExportModal: () => void;
  closeExportModal: () => void;
  openBatchGenerationModal: () => void;
  closeBatchGenerationModal: () => void;
  openConversationDetail: (id: string) => void;
  closeConversationDetail: () => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
  hideConfirm: () => void;
  
  // UI actions
  setLoading: (loading: boolean, message?: string) => void;
  toggleSidebar: () => void;
  setCurrentView: (view: ConversationState['currentView']) => void;
}

export const useConversationStore = create<ConversationState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        selectedConversationIds: [],
        filterConfig: {
          tiers: [],
          statuses: [],
          qualityScoreMin: 0,
          qualityScoreMax: 10,
          searchQuery: '',
          dateFrom: null,
          dateTo: null,
        },
        sidebarCollapsed: false,
        currentView: 'dashboard',
        modalState: {
          exportModalOpen: false,
          batchGenerationModalOpen: false,
          conversationDetailModalOpen: false,
          currentConversationId: null,
          confirmationDialog: {
            open: false,
            title: '',
            message: '',
            onConfirm: () => {},
          },
        },
        isLoading: false,
        loadingMessage: '',
        
        // Implement all actions
        // ...
      }),
      {
        name: 'conversation-storage',
        partialize: (state) => ({
          filterConfig: state.filterConfig,
          sidebarCollapsed: state.sidebarCollapsed,
          currentView: state.currentView,
        }),
      }
    )
  )
);
```

**Implementation Notes:**
- Use `zustand/middleware` for DevTools integration
- Persist user preferences (filters, sidebar state) to localStorage
- Don't persist selections or modal state (session-specific)
- Implement all actions with proper TypeScript typing

**Task 2: Create Data Fetching Hooks** (`src/hooks/use-conversations.ts`)

Implement React Query hooks for server state management:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Conversation, FilterConfig } from '@/lib/types/conversations';

// Query key factory for cache management
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: FilterConfig) => [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
};

// API client functions
async function fetchConversations(filters: FilterConfig): Promise<Conversation[]> {
  const params = new URLSearchParams();
  if (filters.tiers.length > 0) params.append('tier', filters.tiers.join(','));
  if (filters.statuses.length > 0) params.append('status', filters.statuses.join(','));
  if (filters.searchQuery) params.append('search', filters.searchQuery);
  // ... add all filter parameters
  
  const response = await fetch(`/api/conversations?${params}`);
  if (!response.ok) throw new Error('Failed to fetch conversations');
  const data = await response.json();
  return data.data;
}

async function fetchConversationById(id: string): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}?includeTurns=true`);
  if (!response.ok) throw new Error('Conversation not found');
  return response.json();
}

async function updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update conversation');
  return response.json();
}

async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete conversation');
}

async function bulkUpdateConversations(
  ids: string[], 
  updates: Partial<Conversation>
): Promise<{updated: number; failed: number}> {
  const response = await fetch('/api/conversations/bulk-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, updates }),
  });
  if (!response.ok) throw new Error('Bulk update failed');
  return response.json();
}

// Main hook for conversation list with filters
export function useConversations(filters: FilterConfig) {
  return useQuery({
    queryKey: conversationKeys.list(filters),
    queryFn: () => fetchConversations(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

// Hook for single conversation detail
export function useConversation(id: string | null) {
  return useQuery({
    queryKey: conversationKeys.detail(id!),
    queryFn: () => fetchConversationById(id!),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

// Mutation hook for updating conversation
export function useUpdateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Conversation> }) =>
      updateConversation(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: conversationKeys.all });
      
      // Optimistically update cache
      const previousConversations = queryClient.getQueryData(conversationKeys.lists());
      
      queryClient.setQueriesData(
        { queryKey: conversationKeys.lists() },
        (old: any) => {
          if (!old) return old;
          return old.map((conv: Conversation) =>
            conv.id === id ? { ...conv, ...updates } : conv
          );
        }
      );
      
      return { previousConversations };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousConversations) {
        queryClient.setQueryData(conversationKeys.lists(), context.previousConversations);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

// Mutation hook for deleting conversation
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

// Mutation hook for bulk operations
export function useBulkUpdateConversations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<Conversation> }) =>
      bulkUpdateConversations(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}
```

**Implementation Notes:**
- Use query key factory for consistent cache management
- Implement optimistic updates for instant UI feedback
- Handle errors with rollback logic
- Configure appropriate stale times for caching
- Use query invalidation to refresh data after mutations

**Task 3: Set Up React Query Provider** (`src/app/layout.tsx`)

Add React Query provider to app layout:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );
  
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

**Task 4: Create Computed State Hooks** (`src/hooks/use-filtered-conversations.ts`)

Create helper hooks for derived state:

```typescript
import { useMemo } from 'react';
import { useConversations } from './use-conversations';
import { useConversationStore } from '@/stores/conversation-store';

export function useFilteredConversations() {
  const filterConfig = useConversationStore((state) => state.filterConfig);
  const { data: conversations, isLoading, error } = useConversations(filterConfig);
  
  // Client-side filtering for instant feedback
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    
    return conversations.filter((conv) => {
      // Apply any additional client-side filters here
      return true;
    });
  }, [conversations, filterConfig]);
  
  return { conversations: filteredConversations, isLoading, error };
}

export function useSelectedConversations() {
  const { conversations } = useFilteredConversations();
  const selectedIds = useConversationStore((state) => state.selectedConversationIds);
  
  const selectedConversations = useMemo(() => {
    return conversations.filter((conv) => selectedIds.includes(conv.id));
  }, [conversations, selectedIds]);
  
  return selectedConversations;
}

export function useConversationStats() {
  const { conversations } = useFilteredConversations();
  
  return useMemo(() => {
    const total = conversations.length;
    const byStatus = conversations.reduce((acc, conv) => {
      acc[conv.status] = (acc[conv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const avgQuality = conversations.reduce((sum, conv) => sum + (conv.quality_score || 0), 0) / total;
    
    return { total, byStatus, avgQuality };
  }, [conversations]);
}
```

**ACCEPTANCE CRITERIA:**

1. ✅ Conversation store created with all UI state and actions
2. ✅ Store persists filters and preferences to localStorage
3. ✅ React Query provider configured in app layout
4. ✅ `useConversations` hook fetches data based on filters
5. ✅ `useConversation` hook fetches single conversation detail
6. ✅ `useUpdateConversation` implements optimistic updates
7. ✅ `useDeleteConversation` removes conversation with cache invalidation
8. ✅ `useBulkUpdateConversations` handles batch operations
9. ✅ Query keys properly structured for cache management
10. ✅ Error states handled gracefully with user-friendly messages

**TECHNICAL SPECIFICATIONS:**

**Dependencies to Install:**
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools zustand
```

**File Structure:**
```
src/
├── stores/
│   └── conversation-store.ts        [NEW]
├── hooks/
│   ├── use-conversations.ts         [NEW]
│   └── use-filtered-conversations.ts [NEW]
└── app/
    └── layout.tsx                    [MODIFY]
```

**Testing Pattern:**
```typescript
// In React component
function ConversationList() {
  const filterConfig = useConversationStore((state) => state.filterConfig);
  const { conversations, isLoading, error } = useConversations(filterConfig);
  const updateMutation = useUpdateConversation();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {conversations.map((conv) => (
        <div key={conv.id}>
          <h3>{conv.conversation_id}</h3>
          <button onClick={() => updateMutation.mutate({ id: conv.id, updates: { status: 'approved' } })}>
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
```

**VALIDATION REQUIREMENTS:**

**Manual Testing:**
1. ✅ Store actions update state correctly (use React DevTools)
2. ✅ Filters persist across page refreshes (check localStorage)
3. ✅ Data fetching triggers on filter changes
4. ✅ Optimistic updates show immediately, revert on error
5. ✅ Cache invalidation refetches data after mutations
6. ✅ Multiple components using same query share cached data
7. ✅ React Query DevTools show query states correctly
8. ✅ Error boundaries catch and display errors gracefully

**DELIVERABLES:**

1. ✅ `src/stores/conversation-store.ts` - Zustand store with full implementation
2. ✅ `src/hooks/use-conversations.ts` - React Query hooks for all operations
3. ✅ `src/hooks/use-filtered-conversations.ts` - Computed state hooks
4. ✅ Modified `src/app/layout.tsx` with React Query provider
5. ✅ Brief documentation explaining state management architecture

Implement this state management layer completely, ensuring seamless integration between server state (React Query) and client state (Zustand). Test all hooks thoroughly before marking complete.

++++++++++++++++++


### Prompt 3: Dashboard Layout & Navigation Integration
**Scope**: Port dashboard layout from wireframe to main app with live data  
**Dependencies**: State management layer functional (Prompt 2 complete)  
**Estimated Time**: 12-16 hours  
**Risk Level**: Low

========================

You are a senior frontend developer implementing the **Dashboard Layout and Navigation** for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

You are porting the complete dashboard UI from the wireframe prototype (`train-wireframe/`) to the production application (`src/`), replacing mock data with live API integration. The dashboard is the primary interface where users view, filter, and manage conversations.

**User Workflow:**
1. User lands on dashboard at `/conversations`
2. Sees table of conversations with status, quality scores, metadata
3. Can filter by tier, status, quality range, search text
4. Can sort by any column (created_at, quality_score, etc.)
5. Can select conversations and perform bulk actions
6. Can click row to view conversation details

**Current State:**
- ✅ Complete wireframe UI at `train-wireframe/src/components/dashboard/`
- ✅ State management hooks functional (`use-conversations`, `conversation-store`)
- ✅ API endpoints returning live data
- ⚠️ Main app dashboard still shows placeholder content
- ⚠️ Need to create `/conversations` route and port all components

**CURRENT CODEBASE STATE:**

**Wireframe Dashboard Components:**
```
train-wireframe/src/components/
├── layout/
│   ├── DashboardLayout.tsx          # Complete layout shell
│   └── Header.tsx                   # Top navigation bar
├── dashboard/
│   ├── DashboardView.tsx            # Main dashboard page
│   ├── ConversationTable.tsx        # Table with sorting
│   ├── FilterBar.tsx                # Filter UI with search
│   └── Pagination.tsx               # Pagination controls
└── ui/
    └── [all Shadcn components]      # Already in main app
```

**Existing Main App Structure:**
```
src/app/
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx                 # Documents dashboard
│   └── layout.tsx                   # Dashboard layout
└── layout.tsx                       # Root layout
```

**IMPLEMENTATION TASKS:**

**Task 1: Create Conversations Route** (`src/app/(dashboard)/conversations/page.tsx`)

This is the main entry point for the conversation management dashboard.

```typescript
import { Metadata } from 'next';
import { ConversationDashboard } from '@/components/conversations/ConversationDashboard';

export const metadata: Metadata = {
  title: 'Conversations | Training Data Generator',
  description: 'Manage and review AI-generated training conversations',
};

export default function ConversationsPage() {
  return <ConversationDashboard />;
}
```

**Task 2: Port DashboardLayout Component** (`src/components/conversations/DashboardLayout.tsx`)

Port from `train-wireframe/src/components/layout/DashboardLayout.tsx`:

**Key Changes:**
- Keep the same component structure
- Update import paths for Shadcn components
- Integrate with conversation store (not wireframe mock store)
- Add Sonner Toaster for notifications
- Add loading overlay integration

```typescript
'use client';

import { useConversationStore } from '@/stores/conversation-store';
import { Header } from './Header';
import { Toaster } from '@/components/ui/sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useConversationStore((state) => state.sidebarCollapsed);
  const isLoading = useConversationStore((state) => state.isLoading);
  const loadingMessage = useConversationStore((state) => state.loadingMessage);
  const confirmDialog = useConversationStore((state) => state.modalState.confirmationDialog);
  const hideConfirm = useConversationStore((state) => state.hideConfirm);
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </main>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            {loadingMessage && (
              <p className="text-sm text-muted-foreground">{loadingMessage}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && hideConfirm()}>
        <DialogContent>
          <h2 className="text-lg font-semibold">{confirmDialog.title}</h2>
          <p className="text-sm text-muted-foreground">{confirmDialog.message}</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={hideConfirm}>
              Cancel
            </Button>
            <Button onClick={() => {
              confirmDialog.onConfirm();
              hideConfirm();
            }}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
}
```

**Task 3: Port Header Component** (`src/components/conversations/Header.tsx`)

Port from `train-wireframe/src/components/layout/Header.tsx`:

**Key Changes:**
- Update navigation links to production routes
- Add user authentication display
- Integrate with auth service if available

```typescript
'use client';

import Link from 'next/link';
import { useConversationStore } from '@/stores/conversation-store';
import { Button } from '@/components/ui/button';
import { MessageSquare, Settings } from 'lucide-react';

export function Header() {
  const currentView = useConversationStore((state) => state.currentView);
  const setCurrentView = useConversationStore((state) => state.setCurrentView);
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/conversations" className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <span className="font-bold text-xl">Training Data</span>
          </Link>
          
          <nav className="flex space-x-6">
            <Link 
              href="/conversations"
              className={currentView === 'dashboard' ? 'font-medium' : 'text-muted-foreground'}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </Link>
            <Link 
              href="/conversations/templates"
              className={currentView === 'templates' ? 'font-medium' : 'text-muted-foreground'}
              onClick={() => setCurrentView('templates')}
            >
              Templates
            </Link>
            <Link 
              href="/conversations/review-queue"
              className={currentView === 'review-queue' ? 'font-medium' : 'text-muted-foreground'}
              onClick={() => setCurrentView('review-queue')}
            >
              Review Queue
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/conversations/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

**Task 4: Port Main Dashboard View** (`src/components/conversations/ConversationDashboard.tsx`)

Port from `train-wireframe/src/components/dashboard/DashboardView.tsx`:

**Key Changes:**
- Replace mock data with `useFilteredConversations` hook
- Add error handling and loading states
- Integrate real pagination

```typescript
'use client';

import { useFilteredConversations } from '@/hooks/use-filtered-conversations';
import { useConversationStore } from '@/stores/conversation-store';
import { ConversationTable } from './ConversationTable';
import { FilterBar } from './FilterBar';
import { Pagination } from './Pagination';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useState } from 'react';

export function ConversationDashboard() {
  const { conversations, isLoading, error } = useFilteredConversations();
  const filterConfig = useConversationStore((state) => state.filterConfig);
  const resetFilters = useConversationStore((state) => state.resetFilters);
  const openBatchGeneration = useConversationStore((state) => state.openBatchGenerationModal);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  // Calculate pagination
  const totalPages = Math.ceil(conversations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConversations = conversations.slice(startIndex, startIndex + itemsPerPage);
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-lg text-muted-foreground">Failed to load conversations</p>
        <p className="text-sm text-destructive">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }
  
  // Empty state (no conversations at all)
  const hasFilters = filterConfig.tiers.length > 0 || 
                     filterConfig.statuses.length > 0 || 
                     filterConfig.searchQuery.length > 0;
  
  if (!isLoading && conversations.length === 0 && !hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">No conversations yet</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Get started by generating your first batch of training conversations.
        </p>
        <Button onClick={openBatchGeneration}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Conversations
        </Button>
      </div>
    );
  }
  
  // No results from filters
  if (!isLoading && conversations.length === 0 && hasFilters) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Conversations</h1>
        </div>
        
        <FilterBar />
        
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <p className="text-lg text-muted-foreground">No conversations match your filters</p>
          <Button onClick={resetFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }
  
  // Main content
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conversations</h1>
          <p className="text-muted-foreground">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Button onClick={openBatchGeneration}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Conversations
        </Button>
      </div>
      
      <FilterBar />
      
      <ConversationTable 
        conversations={paginatedConversations}
        isLoading={isLoading}
      />
      
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
```

**Task 5: Port ConversationTable Component** (`src/components/conversations/ConversationTable.tsx`)

Port from `train-wireframe/src/components/dashboard/ConversationTable.tsx`:

**Key Changes:**
- Integrate with `useUpdateConversation` mutation
- Add real inline actions (approve, reject, delete)
- Keep skeleton loading state from wireframe

**Key Features to Preserve:**
- Sortable columns with arrow indicators
- Checkbox selection
- Status badges with color coding
- Quality score display
- Inline actions dropdown
- Row hover highlighting

```typescript
'use client';

import { useState } from 'react';
import { Conversation } from '@/lib/types/conversations';
import { useUpdateConversation, useDeleteConversation } from '@/hooks/use-conversations';
import { useConversationStore } from '@/stores/conversation-store';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUp, ArrowDown, MoreVertical, Check, X, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationTableProps {
  conversations: Conversation[];
  isLoading: boolean;
}

export function ConversationTable({ conversations, isLoading }: ConversationTableProps) {
  const [sortConfig, setSortConfig] = useState<{column: string; direction: 'asc' | 'desc'} | null>(null);
  const selectedIds = useConversationStore((state) => state.selectedConversationIds);
  const toggleSelection = useConversationStore((state) => state.toggleConversationSelection);
  const selectAll = useConversationStore((state) => state.selectAllConversations);
  const clearSelection = useConversationStore((state) => state.clearSelection);
  const showConfirm = useConversationStore((state) => state.showConfirm);
  const openConversationDetail = useConversationStore((state) => state.openConversationDetail);
  
  const updateMutation = useUpdateConversation();
  const deleteMutation = useDeleteConversation();
  
  // Handle sort
  const handleSort = (column: string) => {
    setSortConfig((current) => {
      if (!current || current.column !== column) {
        return { column, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      return null;
    });
  };
  
  // Sort conversations
  const sortedConversations = sortConfig
    ? [...conversations].sort((a, b) => {
        const aVal = a[sortConfig.column as keyof Conversation];
        const bVal = b[sortConfig.column as keyof Conversation];
        const modifier = sortConfig.direction === 'asc' ? 1 : -1;
        
        if (aVal < bVal) return -1 * modifier;
        if (aVal > bVal) return 1 * modifier;
        return 0;
      })
    : conversations;
  
  // Handle actions
  const handleApprove = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ 
        id, 
        updates: { status: 'approved' } 
      });
      toast.success('Conversation approved');
    } catch (error) {
      toast.error('Failed to approve conversation');
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ 
        id, 
        updates: { status: 'rejected' } 
      });
      toast.success('Conversation rejected');
    } catch (error) {
      toast.error('Failed to reject conversation');
    }
  };
  
  const handleDelete = (id: string) => {
    showConfirm(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success('Conversation deleted');
        } catch (error) {
          toast.error('Failed to delete conversation');
        }
      }
    );
  };
  
  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAll(conversations.map(c => c.id));
    } else {
      clearSelection();
    }
  };
  
  const allSelected = conversations.length > 0 && selectedIds.length === conversations.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < conversations.length;
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {/* Same headers as below */}
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected || (someSelected ? 'indeterminate' : false)}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('conversation_id')}>
                ID
                {sortConfig?.column === 'conversation_id' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('tier')}>
                Tier
                {sortConfig?.column === 'tier' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('status')}>
                Status
                {sortConfig?.column === 'status' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('quality_score')}>
                Quality
                {sortConfig?.column === 'quality_score' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>Turns</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('created_at')}>
                Created
                {sortConfig?.column === 'created_at' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedConversations.map((conversation) => (
            <TableRow 
              key={conversation.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => openConversationDetail(conversation.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(conversation.id)}
                  onCheckedChange={() => toggleSelection(conversation.id)}
                />
              </TableCell>
              <TableCell className="font-mono text-sm">{conversation.conversation_id}</TableCell>
              <TableCell>
                <Badge variant={
                  conversation.tier === 'template' ? 'default' :
                  conversation.tier === 'scenario' ? 'secondary' :
                  'outline'
                }>
                  {conversation.tier}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={
                  conversation.status === 'approved' ? 'default' :
                  conversation.status === 'rejected' ? 'destructive' :
                  conversation.status === 'pending_review' ? 'secondary' :
                  'outline'
                }>
                  {conversation.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={
                  !conversation.quality_score ? 'text-muted-foreground' :
                  conversation.quality_score >= 8 ? 'text-green-600 font-medium' :
                  conversation.quality_score >= 6 ? 'text-yellow-600 font-medium' :
                  'text-red-600 font-medium'
                }>
                  {conversation.quality_score?.toFixed(1) || 'N/A'}
                </span>
              </TableCell>
              <TableCell>{conversation.total_turns}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(conversation.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openConversationDetail(conversation.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleApprove(conversation.id)}>
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleReject(conversation.id)}>
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(conversation.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Task 6: Port FilterBar Component** (`src/components/conversations/FilterBar.tsx`)

Port from `train-wireframe/src/components/dashboard/FilterBar.tsx`:

**Key Changes:**
- Integrate with conversation store filters
- Update filter options based on actual data
- Keep all UI patterns from wireframe

(Due to length, showing key integration points only - port full component from wireframe)

```typescript
'use client';

import { useConversationStore } from '@/stores/conversation-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
// ... other imports

export function FilterBar() {
  const filterConfig = useConversationStore((state) => state.filterConfig);
  const setFilterConfig = useConversationStore((state) => state.setFilterConfig);
  const resetFilters = useConversationStore((state) => state.resetFilters);
  
  const handleSearchChange = (value: string) => {
    setFilterConfig({ searchQuery: value });
  };
  
  const handleTierToggle = (tier: string) => {
    const newTiers = filterConfig.tiers.includes(tier)
      ? filterConfig.tiers.filter(t => t !== tier)
      : [...filterConfig.tiers, tier];
    setFilterConfig({ tiers: newTiers });
  };
  
  // ... rest of component logic from wireframe
  
  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={filterConfig.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Quick filters */}
        <Button
          variant={filterConfig.statuses.includes('pending_review') ? 'default' : 'outline'}
          onClick={() => handleStatusToggle('pending_review')}
        >
          Needs Review
        </Button>
        <Button
          variant={filterConfig.statuses.includes('approved') ? 'default' : 'outline'}
          onClick={() => handleStatusToggle('approved')}
        >
          Approved
        </Button>
        
        {/* Clear filters */}
        {(filterConfig.tiers.length > 0 || filterConfig.statuses.length > 0 || filterConfig.searchQuery) && (
          <Button variant="ghost" onClick={resetFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
      
      {/* Active filter badges */}
      {/* ... port from wireframe */}
    </div>
  );
}
```

**Task 7: Port Pagination Component** (`src/components/conversations/Pagination.tsx`)

Port from `train-wireframe/src/components/dashboard/Pagination.tsx` (straightforward, no major changes needed).

**ACCEPTANCE CRITERIA:**

1. ✅ `/conversations` route accessible and displays dashboard
2. ✅ Dashboard layout matches wireframe design exactly
3. ✅ Table displays conversations from live API
4. ✅ Filters work and update displayed conversations
5. ✅ Sorting works on all columns
6. ✅ Selection checkboxes work (individual and select all)
7. ✅ Inline actions (approve, reject, delete) functional
8. ✅ Loading states show skeleton loaders
9. ✅ Empty states display appropriate messages
10. ✅ Toast notifications appear for user actions
11. ✅ Pagination controls work correctly
12. ✅ No TypeScript errors in any component

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/
├── app/
│   └── (dashboard)/
│       └── conversations/
│           └── page.tsx               [NEW]
└── components/
    └── conversations/
        ├── ConversationDashboard.tsx  [NEW - port from wireframe]
        ├── DashboardLayout.tsx        [NEW - port from wireframe]
        ├── Header.tsx                 [NEW - port from wireframe]
        ├── ConversationTable.tsx      [NEW - port from wireframe]
        ├── FilterBar.tsx              [NEW - port from wireframe]
        └── Pagination.tsx             [NEW - port from wireframe]
```

**Styling Consistency:**
- Use existing Tailwind classes from wireframe
- Maintain spacing, colors, typography from wireframe
- Ensure responsive behavior at all breakpoints
- Keep hover states and transitions

**VALIDATION REQUIREMENTS:**

**Manual Testing:**
1. ✅ Navigate to `/conversations` - dashboard loads
2. ✅ Table displays conversations from database
3. ✅ Click column header - sorts ascending/descending
4. ✅ Enter search text - filters conversations instantly
5. ✅ Click tier filter - updates table
6. ✅ Select conversations - checkboxes work
7. ✅ Click approve - status updates with toast
8. ✅ Click delete - shows confirmation, then deletes
9. ✅ Pagination - navigate between pages
10. ✅ Empty state - displays when no conversations
11. ✅ Error state - displays if API fails
12. ✅ Responsive - test at 1920px, 1366px, 768px widths

**DELIVERABLES:**

1. ✅ All components ported from wireframe to `src/components/conversations/`
2. ✅ `/conversations` route functional
3. ✅ Dashboard fully integrated with live API data
4. ✅ All user interactions working (filters, sort, select, actions)
5. ✅ Loading and error states implemented
6. ✅ Toast notifications for user feedback
7. ✅ Zero TypeScript compilation errors
8. ✅ UI matches wireframe design exactly

Port the complete dashboard UI from wireframe to main app, ensuring pixel-perfect consistency and full functional integration with live data. Test all features thoroughly before marking complete.

++++++++++++++++++

(Continuing with remaining prompts...)

### Prompt 4: Conversation Detail Modal & Review Interface
**Scope**: Implement conversation detail view with turn-by-turn display and review actions  
**Dependencies**: Dashboard UI complete (Prompt 3)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Low

========================

(This prompt would detail the conversation detail modal implementation, including turn display, metadata panel, review actions, and navigation between conversations)

++++++++++++++++++


### Prompt 5: Bulk Actions & Keyboard Navigation
**Scope**: Implement bulk selection toolbar and comprehensive keyboard shortcuts  
**Dependencies**: Dashboard and detail views complete (Prompts 3-4)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Low

========================

(This prompt would detail bulk action implementations and keyboard navigation system)

++++++++++++++++++


### Prompt 6: Loading States, Error Handling, & Polish
**Scope**: Add skeleton loaders, error boundaries, toast notifications, and UI polish  
**Dependencies**: All previous prompts complete  
**Estimated Time**: 8-10 hours  
**Risk Level**: Low

========================

(This prompt would detail loading states, error handling, and final polish items)

++++++++++++++++++


---

## Quality Validation Checklist

### Post-Implementation Verification

**Database Layer:**
- [ ] All tables created with proper indexes
- [ ] Query performance < 100ms for indexed lookups
- [ ] Foreign key constraints working
- [ ] RLS policies enforcing data isolation
- [ ] Seed data inserted successfully

**API Layer:**
- [ ] All endpoints responding correctly
- [ ] Request validation working
- [ ] Error handling returns appropriate status codes
- [ ] Pagination functioning correctly
- [ ] Filtering logic accurate

**State Management:**
- [ ] Zustand store persisting preferences
- [ ] React Query caching working
- [ ] Optimistic updates reverting on error
- [ ] No unnecessary re-renders
- [ ] Query invalidation triggering refetches

**UI Components:**
- [ ] Table sorting working on all columns
- [ ] Filters updating table instantly
- [ ] Selection checkboxes functional
- [ ] Inline actions triggering correctly
- [ ] Loading states displaying
- [ ] Empty states showing appropriate messages
- [ ] Error states recoverable

**Integration:**
- [ ] Dashboard loads data from API
- [ ] Filters call API with correct parameters
- [ ] Updates persist to database
- [ ] Toasts display for user actions
- [ ] No console errors or warnings

**Performance:**
- [ ] Page load < 2 seconds
- [ ] Table filtering < 300ms
- [ ] Query performance < 500ms for 100+ records
- [ ] No memory leaks
- [ ] React Developer Tools show proper component tree

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards

### Cross-Prompt Consistency

- [ ] Consistent TypeScript types across all files
- [ ] Consistent error handling patterns
- [ ] Consistent API response formats
- [ ] Consistent naming conventions (camelCase variables, PascalCase components)
- [ ] Consistent file structure following Next.js conventions
- [ ] Consistent styling using Tailwind classes
- [ ] Consistent import patterns

---

## Next Segment Preparation

**E04 Segment Will Build On:**
- Conversation generation workflows (single and batch)
- Template management system
- Quality validation engine
- Export functionality
- Integration with chunks-alpha for context

**Prerequisites for E04:**
- E03 must be fully functional and tested
- All database tables and API endpoints operational
- Dashboard UI polished and performant
- State management patterns established
- Component library complete

**Handoff Documentation:**
- Document any architectural decisions made during E03
- List any technical debt or known issues
- Identify optimization opportunities for future sprints
- Provide detailed API documentation for E04 integration

---

## Summary

This E03 segment establishes the complete foundation for the Interactive LoRA Conversation Generation platform. Upon completion, users will have a fully functional dashboard to view, filter, sort, and manage conversations with live data integration.

**Total Estimated Time**: 60-80 hours across 6 prompts  
**Critical Path**: Prompts 1-4 (42-54 hours)  
**Parallelizable**: Prompts 5-6 (18-22 hours)

**Success Criteria**: Users can navigate to `/conversations`, see their data, filter it, sort it, select conversations, and perform actions (approve, reject, delete) with instant feedback and robust error handling.

The implementation follows established patterns from the wireframe prototype while integrating live API data, comprehensive state management, and production-ready error handling. All code adheres to TypeScript strict mode, follows Next.js 14 best practices, and maintains consistency with the existing codebase architecture.

