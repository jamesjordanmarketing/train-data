# Iteration 1: Bulk Processing Execution Plan (Step 5)
**Version:** 1.0  
**Date:** November 25, 2025  
**Purpose:** Execution instructions for implementing the Bulk Conversation Generation UI with Parameter Selection System  
**Total Prompts:** 3  
**Estimated Implementation Time:** 6-10 hours

---

## Executive Summary

This execution plan provides complete, sequential prompts for implementing a UI-driven Bulk Conversation Generator for the Bright Run LoRA Training Data Platform. The goal is to enable users to interactively select parameter combinations (personas, emotional arcs, topics) and generate 100 training conversations (90 core + 10 edge cases) for a HuggingFace dataset.

### Current Database State (Validated)

**Personas (3 active):**
| ID | Name | Persona Key |
|----|------|-------------|
| `5a4a6042-5bb7-4da6-b2e2-119b6f97be6f` | Marcus Chen | `overwhelmed_avoider` |
| `74b5a919-d2e5-416a-b432-02b1751c989e` | Jennifer Martinez | `anxious_planner` |
| `aa514346-cd61-42ac-adad-498934975402` | David Chen | `pragmatic_optimist` |

**Emotional Arcs (5 active - ALL are "core", NO edge arcs exist):**
| ID | Name | Arc Key | Tier |
|----|------|---------|------|
| `53583301-5758-4781-99df-57b9c5fc1949` | Confusion → Clarity | `confusion_to_clarity` | template |
| `33d2ac3e-3f92-44a5-a53d-788fdece2545` | Couple Conflict → Alignment | `couple_conflict_to_alignment` | template |
| `4d2efafa-1df5-42de-9568-dc41b3839d7b` | Fear → Confidence | `fear_to_confidence` | template |
| `1cb3c7a2-77e7-48d2-90f3-bd91e4fd4f51` | Overwhelm → Empowerment | `overwhelm_to_empowerment` | template |
| `d2466485-d5a0-4c54-b9c4-d5ce3cf47ad3` | Shame → Acceptance | `shame_to_acceptance` | template |

**Training Topics:** 65 active (need reduction to 20)
- Categories: career, cash_flow, debt, education, estate, family, insurance, investment, organization, relationships, retirement, tax

---

## Architectural Decisions (Made)

### Decision 1: Terminology
**Chosen:** `conversation_category` with values `core` | `edge`

### Decision 2: Database Schema  
**Chosen:** Add `conversation_category` column to `emotional_arcs` table
- Type: VARCHAR(20)
- Default: 'core'
- Values: 'core', 'edge'
- Rationale: This keeps the categorization at the arc level (user's hypothesis confirmed - edge arcs drive edge conversations)

### Decision 3: Edge Case Logic
**Confirmed:** User's hypothesis is correct: **Edge emotional arc + any persona + any topic = edge conversation**
- Rationale: The emotional arc is the driver of conversation intensity/boundaries. Any persona can experience a crisis, and any topic can be the subject of an edge conversation.
- **NO edge topics needed** - the arc determines the conversation category

### Decision 4: Edge Arcs to Create (3)
Based on user requirement of 10 edge conversations, we need 3-4 edge arcs to mix with personas/topics:

1. **Crisis → Referral** (`crisis_to_referral`)
   - Starting: Despair/Crisis
   - Ending: Referred
   - Strategy: Detect crisis indicators, provide immediate 988 hotline referral, transition to safety
   - Use Case: Suicidal ideation, severe financial distress causing mental health crisis

2. **Hostility → Boundary** (`hostility_to_boundary`)
   - Starting: Hostility/Anger
   - Ending: Professional boundary set
   - Strategy: Stay calm, acknowledge frustration, set clear limits
   - Use Case: Client demanding specific investment advice, aggressive behavior

3. **Overwhelm → Triage** (`overwhelm_to_triage`)
   - Starting: Severe overwhelm
   - Ending: Prioritized action list
   - Strategy: Emergency prioritization, identify single next step
   - Use Case: Multiple simultaneous financial emergencies, "everything is falling apart"

---

## Implementation Roadmap

| Prompt | Focus | Key Deliverables |
|--------|-------|------------------|
| 1 | Data Preparation | Add conversation_category column, create 3 edge arcs, reduce topics to 20 |
| 2 | Bulk Generator UI | Page component, multi-select controls, combination counter, API integration |
| 3 | Batch Monitoring & Testing | Batch status page, testing workflow, validation |

---

## Prompt 1: Data Preparation

========================

You are a senior full-stack developer implementing data preparation for the Bulk Conversation Generator feature in the Bright Run LoRA Training Data Platform. This prompt handles database schema updates and data seeding.

## CRITICAL: USE SAOL FOR ALL DATABASE OPERATIONS

**Supabase Agent Ops Library (SAOL) Location:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
**Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\QUICK_START.md`

**SAOL Usage Pattern:**
```javascript
// Load environment variables
require('dotenv').config({ path: '../.env.local' });
const saol = require('supa-agent-ops');

// Query example
const result = await saol.agentQuery({
  table: 'emotional_arcs',
  where: [{ column: 'is_active', operator: 'eq', value: true }],
  limit: 100
});

// Update example
const updateResult = await saol.agentUpsert({
  table: 'emotional_arcs',
  records: [{ id: 'uuid', conversation_category: 'edge' }],
  onConflict: 'id'
});
```

## CONTEXT

### Project Overview
Bright Run is a Next.js 14 application that generates AI training conversations for LoRA fine-tuning. We're building a Bulk Conversation Generator UI that lets users select parameter combinations and generate conversations in batch.

### Technology Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: Supabase (PostgreSQL)
- AI: Claude API (Anthropic)
- UI: Shadcn/UI + Tailwind CSS

### Current Database State
**Project ID:** `hqhtbxlgzysfbekexwku`

**Personas (3 active):**
- Marcus Chen (`overwhelmed_avoider`) - ID: `5a4a6042-5bb7-4da6-b2e2-119b6f97be6f`
- Jennifer Martinez (`anxious_planner`) - ID: `74b5a919-d2e5-416a-b432-02b1751c989e`
- David Chen (`pragmatic_optimist`) - ID: `aa514346-cd61-42ac-adad-498934975402`

**Emotional Arcs (5 active - ALL core, NO edge arcs):**
- Confusion → Clarity (`confusion_to_clarity`) - ID: `53583301-5758-4781-99df-57b9c5fc1949`
- Couple Conflict → Alignment (`couple_conflict_to_alignment`) - ID: `33d2ac3e-3f92-44a5-a53d-788fdece2545`
- Fear → Confidence (`fear_to_confidence`) - ID: `4d2efafa-1df5-42de-9568-dc41b3839d7b`
- Overwhelm → Empowerment (`overwhelm_to_empowerment`) - ID: `1cb3c7a2-77e7-48d2-90f3-bd91e4fd4f51`
- Shame → Acceptance (`shame_to_acceptance`) - ID: `d2466485-d5a0-4c54-b9c4-d5ce3cf47ad3`

**Training Topics:** 65 active (need reduction to 20)
- Categories: career, cash_flow, debt, education, estate, family, insurance, investment, organization, relationships, retirement, tax

### Workspace Path
`C:\Users\james\Master\BrightHub\brun\train-data`

## TASKS TO IMPLEMENT

### Task 1: Add `conversation_category` Column to `emotional_arcs` Table

**Migration needed:** Add column to distinguish core vs edge emotional arcs.

**SQL Migration to apply via Supabase MCP or SQL Editor:**
```sql
-- Add conversation_category column to emotional_arcs
ALTER TABLE emotional_arcs 
ADD COLUMN IF NOT EXISTS conversation_category VARCHAR(20) DEFAULT 'core';

-- Add check constraint
ALTER TABLE emotional_arcs 
ADD CONSTRAINT check_conversation_category 
CHECK (conversation_category IN ('core', 'edge'));

-- Update existing arcs to 'core' (they're all core)
UPDATE emotional_arcs 
SET conversation_category = 'core' 
WHERE conversation_category IS NULL;

-- Add comment
COMMENT ON COLUMN emotional_arcs.conversation_category IS 'Categorizes arc as core (standard emotional journeys) or edge (boundary/crisis scenarios)';
```

**Verification Query:**
```sql
SELECT id, name, arc_key, conversation_category FROM emotional_arcs WHERE is_active = true;
```

### Task 2: Create 3 Edge Case Emotional Arcs

Create a script at `src/scripts/create-edge-arcs.ts` that uses SAOL to insert 3 edge case arcs:

**Edge Arc 1: Crisis → Referral**
```javascript
{
  arc_key: 'crisis_to_referral',
  name: 'Crisis → Referral',
  starting_emotion: 'despair',
  starting_intensity_min: 0.8,
  starting_intensity_max: 1.0,
  ending_emotion: 'referred',
  ending_intensity_min: 0.3,
  ending_intensity_max: 0.5,
  arc_strategy: 'detect_crisis_provide_immediate_referral',
  key_principles: [
    'Prioritize client safety above all',
    'Detect crisis indicators immediately (suicidal ideation, severe distress)',
    'Provide 988 Suicide & Crisis Lifeline number',
    'Do NOT attempt to provide financial advice during crisis',
    'Express genuine care and concern',
    'Follow up with professional referral'
  ],
  characteristic_phrases: [
    'I hear how much pain you\'re in right now',
    'Your safety is my first priority',
    'I want to make sure you have the right support',
    'The 988 Lifeline is available 24/7',
    'This is beyond what I can help with, and that\'s okay'
  ],
  response_techniques: [
    'Active listening without interruption',
    'Validate emotional state without judgment',
    'Provide concrete crisis resources',
    'Express care and concern explicitly',
    'Set clear expectations for follow-up'
  ],
  avoid_tactics: [
    'Minimizing or dismissing feelings',
    'Offering financial solutions during crisis',
    'Rushing to fix the situation',
    'Making promises you can\'t keep'
  ],
  typical_turn_count_min: 4,
  typical_turn_count_max: 6,
  complexity_baseline: 10,
  tier: 'edge_case',
  conversation_category: 'edge',
  suitable_personas: ['overwhelmed_avoider', 'anxious_planner', 'pragmatic_optimist'],
  suitable_topics: [], // Any topic can become a crisis
  is_active: true
}
```

**Edge Arc 2: Hostility → Boundary**
```javascript
{
  arc_key: 'hostility_to_boundary',
  name: 'Hostility → Boundary',
  starting_emotion: 'anger',
  starting_intensity_min: 0.7,
  starting_intensity_max: 1.0,
  ending_emotion: 'acceptance',
  ending_intensity_min: 0.3,
  ending_intensity_max: 0.6,
  arc_strategy: 'stay_calm_acknowledge_set_limits',
  key_principles: [
    'Remain calm and professional under pressure',
    'Acknowledge the client\'s frustration without agreeing with inappropriate demands',
    'Set clear professional boundaries',
    'Explain what you CAN help with vs what you cannot',
    'Offer to continue when client is ready for productive conversation'
  ],
  characteristic_phrases: [
    'I understand you\'re frustrated',
    'I\'m here to help, and I want to be clear about what that looks like',
    'I can\'t provide specific investment recommendations, but I can...',
    'Let me explain the boundaries of my role',
    'I\'m not able to continue if the conversation becomes disrespectful'
  ],
  response_techniques: [
    'De-escalation through calm tone',
    'Broken record technique for boundaries',
    'Redirect to what IS possible',
    'Offer pause and reconvene option'
  ],
  avoid_tactics: [
    'Matching the client\'s emotional intensity',
    'Being defensive or argumentative',
    'Apologizing for appropriate boundaries',
    'Giving in to inappropriate demands'
  ],
  typical_turn_count_min: 4,
  typical_turn_count_max: 8,
  complexity_baseline: 9,
  tier: 'edge_case',
  conversation_category: 'edge',
  suitable_personas: ['overwhelmed_avoider', 'anxious_planner', 'pragmatic_optimist'],
  suitable_topics: [],
  is_active: true
}
```

**Edge Arc 3: Overwhelm → Triage**
```javascript
{
  arc_key: 'overwhelm_to_triage',
  name: 'Overwhelm → Triage',
  starting_emotion: 'panic',
  starting_intensity_min: 0.8,
  starting_intensity_max: 1.0,
  ending_emotion: 'focused',
  ending_intensity_min: 0.4,
  ending_intensity_max: 0.6,
  arc_strategy: 'emergency_prioritization_single_next_step',
  key_principles: [
    'Acknowledge the overwhelming nature of multiple crises',
    'Help identify the ONE most urgent issue',
    'Provide a single, achievable next step',
    'Defer non-urgent items explicitly',
    'Create breathing room through prioritization'
  ],
  characteristic_phrases: [
    'That\'s a lot to carry all at once',
    'Let\'s slow down and focus on what needs attention first',
    'Right now, the most important thing is...',
    'Everything else can wait until we handle this',
    'What\'s one thing you can do in the next 24 hours?'
  ],
  response_techniques: [
    'Emergency triage framework',
    'Simplification through prioritization',
    'One-step-at-a-time approach',
    'Permission to defer non-urgent items'
  ],
  avoid_tactics: [
    'Trying to solve everything at once',
    'Adding to the to-do list',
    'Overwhelming with options',
    'Dismissing the severity of the situation'
  ],
  typical_turn_count_min: 5,
  typical_turn_count_max: 8,
  complexity_baseline: 8,
  tier: 'edge_case',
  conversation_category: 'edge',
  suitable_personas: ['overwhelmed_avoider', 'anxious_planner', 'pragmatic_optimist'],
  suitable_topics: [],
  is_active: true
}
```

**Script Location:** `src/scripts/create-edge-arcs.ts`

### Task 3: Reduce Training Topics from 65 to 20

Create a script at `src/scripts/reduce-topics-to-20.ts` that:

1. Queries all 65 active topics
2. Selects 20 topics with balanced category representation (try to get at least 1-2 from each category)
3. Sets `is_active = false` for the remaining 45 topics
4. Saves the selected 20 topics to `src/scripts/selected-topics-20.json` for reference

**Selection Strategy (balanced by category):**
- career: 2 topics
- cash_flow: 2 topics
- debt: 2 topics
- education: 2 topics
- estate: 1 topic
- family: 2 topics
- insurance: 2 topics
- investment: 2 topics
- organization: 1 topic
- relationships: 1 topic
- retirement: 2 topics
- tax: 1 topic

**Script Structure:**
```typescript
/**
 * Reduce active training topics from 65 to 20
 * Maintains balanced category representation
 * Sets is_active = false for deactivated topics (preserves data)
 * 
 * Usage: npx ts-node src/scripts/reduce-topics-to-20.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load SAOL
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
const saol = require('../../supa-agent-ops');

interface Topic {
  id: string;
  name: string;
  topic_key: string;
  category: string;
  is_active: boolean;
}

const TOPICS_PER_CATEGORY: Record<string, number> = {
  career: 2,
  cash_flow: 2,
  debt: 2,
  education: 2,
  estate: 1,
  family: 2,
  insurance: 2,
  investment: 2,
  organization: 1,
  relationships: 1,
  retirement: 2,
  tax: 1
};

async function main() {
  console.log('🔍 Fetching all active topics...');
  
  // Query all active topics grouped by category
  const result = await saol.agentQuery({
    table: 'training_topics',
    where: [{ column: 'is_active', operator: 'eq', value: true }],
    orderBy: [{ column: 'category', direction: 'asc' }, { column: 'name', direction: 'asc' }]
  });
  
  const allTopics: Topic[] = result.data;
  console.log(`✅ Found ${allTopics.length} active topics`);
  
  // Group by category
  const byCategory: Record<string, Topic[]> = {};
  for (const topic of allTopics) {
    if (!byCategory[topic.category]) {
      byCategory[topic.category] = [];
    }
    byCategory[topic.category].push(topic);
  }
  
  // Select topics per category
  const selectedTopics: Topic[] = [];
  const deactivatedTopics: Topic[] = [];
  
  for (const [category, count] of Object.entries(TOPICS_PER_CATEGORY)) {
    const categoryTopics = byCategory[category] || [];
    // Randomly shuffle then take first N
    const shuffled = categoryTopics.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    const notSelected = shuffled.slice(count);
    
    selectedTopics.push(...selected);
    deactivatedTopics.push(...notSelected);
    
    console.log(`📁 ${category}: Selected ${selected.length}/${categoryTopics.length}`);
  }
  
  console.log(`\n📋 Selected ${selectedTopics.length} topics to keep active`);
  console.log(`📋 Will deactivate ${deactivatedTopics.length} topics`);
  
  // Deactivate topics
  console.log('\n⏳ Deactivating topics...');
  for (const topic of deactivatedTopics) {
    await saol.agentUpsert({
      table: 'training_topics',
      records: [{ id: topic.id, is_active: false }],
      onConflict: 'id'
    });
  }
  
  console.log(`✅ Deactivated ${deactivatedTopics.length} topics`);
  
  // Save selected topics to JSON
  const outputPath = path.join(__dirname, 'selected-topics-20.json');
  fs.writeFileSync(outputPath, JSON.stringify(selectedTopics, null, 2));
  console.log(`\n📄 Saved selected topics to: ${outputPath}`);
  
  // Print summary
  console.log('\n📊 Final Selection:');
  for (const topic of selectedTopics.sort((a, b) => a.category.localeCompare(b.category))) {
    console.log(`   ${topic.category}: ${topic.name}`);
  }
}

main().catch(console.error);
```

### Task 4: Verify Data State

After running the scripts, verify the database state:

**Verification Queries:**
```sql
-- Check emotional arcs with new column
SELECT id, name, arc_key, conversation_category, tier, is_active 
FROM emotional_arcs 
WHERE is_active = true 
ORDER BY conversation_category, name;

-- Should show: 5 core arcs + 3 edge arcs

-- Check topic count
SELECT COUNT(*) as active_topics FROM training_topics WHERE is_active = true;
-- Should show: 20

-- Check topic distribution by category
SELECT category, COUNT(*) as count 
FROM training_topics 
WHERE is_active = true 
GROUP BY category 
ORDER BY category;
```

## DELIVERABLES

1. **Database Migration Applied:**
   - `conversation_category` column added to `emotional_arcs` table
   - Existing arcs set to 'core'

2. **Scripts Created:**
   - `src/scripts/create-edge-arcs.ts` - Creates 3 edge case arcs
   - `src/scripts/reduce-topics-to-20.ts` - Reduces topics to 20

3. **Scripts Executed:**
   - 3 edge arcs inserted with `conversation_category = 'edge'`
   - 45 topics deactivated (is_active = false)
   - `src/scripts/selected-topics-20.json` created

4. **Verification Complete:**
   - 8 active emotional arcs (5 core + 3 edge)
   - 20 active training topics (balanced by category)
   - 3 active personas (unchanged)

## ACCEPTANCE CRITERIA

- [ ] Migration applied: `conversation_category` column exists on `emotional_arcs`
- [ ] 3 edge arcs created: crisis_to_referral, hostility_to_boundary, overwhelm_to_triage
- [ ] All edge arcs have `conversation_category = 'edge'`
- [ ] All existing arcs have `conversation_category = 'core'`
- [ ] Topics reduced to exactly 20 active
- [ ] At least 1 topic per category remains active
- [ ] Deactivated topics still exist (is_active = false), not deleted
- [ ] selected-topics-20.json saved with final selection

++++++++++++++++++




## Prompt 2: Bulk Generator UI Implementation

========================

You are a senior full-stack developer implementing the Bulk Conversation Generator UI for the Bright Run LoRA Training Data Platform. This is a Next.js 14 application with TypeScript, Shadcn/UI, and Tailwind CSS.

## CRITICAL: USE SAOL FOR ALL DATABASE OPERATIONS

**Supabase Agent Ops Library (SAOL) Location:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
**Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\QUICK_START.md`

## CONTEXT

### Project Overview
Bright Run generates AI training conversations for LoRA fine-tuning. We're building a Bulk Conversation Generator UI where users can:
1. Select conversation category (Core or Edge)
2. Multi-select personas, emotional arcs, and topics
3. See real-time combination count
4. View cost/time estimates
5. Submit batch generation job

### Technology Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: Supabase (PostgreSQL)
- AI: Claude API (Anthropic)
- UI: Shadcn/UI + Tailwind CSS

### Workspace Path
`C:\Users\james\Master\BrightHub\brun\train-data`

### Database State (After Prompt 1)
**Personas (3):** Marcus Chen, Jennifer Martinez, David Chen
**Emotional Arcs (8):**
- 5 core arcs (conversation_category = 'core')
- 3 edge arcs (conversation_category = 'edge')

**Training Topics (20):** Balanced across categories

### Existing Batch API Endpoints
The batch generation API already exists:

**POST `/api/conversations/generate-batch`**
```typescript
{
  name: string;                    // Batch job name
  parameterSets: Array<{
    templateId: string;            // Template UUID (use a default template)
    parameters: {
      persona_id: string;
      emotional_arc_id: string;
      training_topic_id: string;
    };
    tier: 'template' | 'scenario' | 'edge_case';
  }>;
  concurrentProcessing?: number;   // Default: 3
  errorHandling?: 'stop' | 'continue'; // Default: 'continue'
  userId: string;
}
```

**GET `/api/conversations/batch/[id]/status`**
Returns batch job progress.

### Existing Services
- `src/lib/services/batch-generation-service.ts` - Batch orchestration
- `src/lib/services/scaffolding-data-service.ts` - Scaffolding data CRUD
- `src/lib/services/conversation-generation-service.ts` - Generation logic

## UI WIREFRAME

```
┌──────────────────────────────────────────────────────────────────┐
│  Bulk Conversation Generator                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Conversation Category                                           │
│  ○ Core Conversations (standard emotional journeys)              │
│  ○ Edge Case Conversations (boundary/crisis scenarios)           │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  Personas (3 available)                           [Select All]   │
│  ☑ Marcus Chen - The Overwhelmed Avoider                         │
│  ☑ Jennifer Martinez - The Anxious Planner                       │
│  ☑ David Chen - The Pragmatic Optimist                           │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  Emotional Arcs (5/8 available based on category)  [Select All]  │
│  ☑ Confusion → Clarity                                           │
│  ☑ Fear → Confidence                                             │
│  ☑ Overwhelm → Empowerment                                       │
│  ☑ Shame → Acceptance                                            │
│  ☑ Couple Conflict → Alignment                                   │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  Training Topics (20 available)                    [Select All]  │
│  ☑ 401k Basics                    ☑ Debt Management              │
│  ☑ Retirement Planning            ☑ Emergency Fund               │
│  ☐ Insurance Decisions            ☐ Tax Strategy                 │
│  ... (scrollable)                                                │
│                                                                  │
│  ══════════════════════════════════════════════════════════════  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  📊 Batch Summary                                           │ │
│  │                                                             │ │
│  │  Conversations to Generate:  90                             │ │
│  │  Formula: 3 personas × 5 arcs × 6 topics                    │ │
│  │                                                             │ │
│  │  Estimated Time: ~30 minutes                                │ │
│  │  Estimated Cost: $40.50                                     │ │
│  │                                                             │ │
│  │  [Cancel]                              [Generate Batch]     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## TASKS TO IMPLEMENT

### Task 1: Create Types for Bulk Generator

**File:** `src/lib/types/bulk-generator.types.ts`

```typescript
export interface Persona {
  id: string;
  name: string;
  persona_key: string;
  is_active: boolean;
}

export interface EmotionalArc {
  id: string;
  name: string;
  arc_key: string;
  conversation_category: 'core' | 'edge';
  tier: string;
  is_active: boolean;
}

export interface TrainingTopic {
  id: string;
  name: string;
  topic_key: string;
  category: string;
  is_active: boolean;
}

export interface BatchEstimate {
  conversationCount: number;
  formula: string;
  estimatedTimeMinutes: number;
  estimatedCostUSD: number;
}

export interface BulkGeneratorState {
  category: 'core' | 'edge';
  selectedPersonaIds: string[];
  selectedArcIds: string[];
  selectedTopicIds: string[];
}

export interface ParameterSet {
  templateId: string;
  parameters: {
    persona_id: string;
    emotional_arc_id: string;
    training_topic_id: string;
  };
  tier: 'template' | 'scenario' | 'edge_case';
}
```

### Task 2: Create Data Fetching Hooks

**File:** `src/hooks/use-scaffolding-data.ts`

Create a hook that fetches scaffolding data using the existing scaffolding data service or direct API calls:

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { Persona, EmotionalArc, TrainingTopic } from '@/lib/types/bulk-generator.types';

interface ScaffoldingData {
  personas: Persona[];
  coreArcs: EmotionalArc[];
  edgeArcs: EmotionalArc[];
  topics: TrainingTopic[];
  loading: boolean;
  error: string | null;
}

export function useScaffoldingData(): ScaffoldingData {
  const [data, setData] = useState<ScaffoldingData>({
    personas: [],
    coreArcs: [],
    edgeArcs: [],
    topics: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch from API endpoints
        const [personasRes, arcsRes, topicsRes] = await Promise.all([
          fetch('/api/scaffolding/personas'),
          fetch('/api/scaffolding/emotional-arcs'),
          fetch('/api/scaffolding/topics')
        ]);

        const personas = await personasRes.json();
        const arcs = await arcsRes.json();
        const topics = await topicsRes.json();

        // Separate core and edge arcs
        const coreArcs = arcs.filter((a: EmotionalArc) => a.conversation_category === 'core');
        const edgeArcs = arcs.filter((a: EmotionalArc) => a.conversation_category === 'edge');

        setData({
          personas,
          coreArcs,
          edgeArcs,
          topics,
          loading: false,
          error: null
        });
      } catch (err) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load data'
        }));
      }
    }

    fetchData();
  }, []);

  return data;
}
```

### Task 3: Create Scaffolding API Endpoints (if not exist)

Check if these endpoints exist. If not, create them:

**File:** `src/app/api/scaffolding/personas/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('personas')
    .select('id, name, persona_key, is_active')
    .eq('is_active', true)
    .order('name');
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

**File:** `src/app/api/scaffolding/emotional-arcs/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('emotional_arcs')
    .select('id, name, arc_key, conversation_category, tier, is_active')
    .eq('is_active', true)
    .order('name');
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

**File:** `src/app/api/scaffolding/topics/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('training_topics')
    .select('id, name, topic_key, category, is_active')
    .eq('is_active', true)
    .order('category')
    .order('name');
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

### Task 4: Create Bulk Generator Page

**File:** `src/app/(dashboard)/bulk-generator/page.tsx`

```typescript
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, AlertTriangle } from 'lucide-react';
import { useScaffoldingData } from '@/hooks/use-scaffolding-data';
import type { ParameterSet, BulkGeneratorState } from '@/lib/types/bulk-generator.types';

// Cost estimation constants
const AVG_COST_PER_CONVERSATION = 0.45; // USD
const AVG_TIME_PER_CONVERSATION = 60; // seconds
const CONCURRENCY = 3;

export default function BulkGeneratorPage() {
  const router = useRouter();
  const { personas, coreArcs, edgeArcs, topics, loading, error } = useScaffoldingData();
  
  // State
  const [category, setCategory] = useState<'core' | 'edge'>('core');
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [selectedArcIds, setSelectedArcIds] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get arcs based on category
  const availableArcs = category === 'core' ? coreArcs : edgeArcs;

  // Reset arc selection when category changes
  const handleCategoryChange = (newCategory: 'core' | 'edge') => {
    setCategory(newCategory);
    setSelectedArcIds([]); // Clear arc selection
  };

  // Calculate estimates
  const estimate = useMemo(() => {
    const count = selectedPersonaIds.length * selectedArcIds.length * selectedTopicIds.length;
    const effectiveTime = (count / CONCURRENCY) * AVG_TIME_PER_CONVERSATION;
    
    return {
      conversationCount: count,
      formula: `${selectedPersonaIds.length} personas × ${selectedArcIds.length} arcs × ${selectedTopicIds.length} topics`,
      estimatedTimeMinutes: Math.ceil(effectiveTime / 60),
      estimatedCostUSD: count * AVG_COST_PER_CONVERSATION
    };
  }, [selectedPersonaIds.length, selectedArcIds.length, selectedTopicIds.length]);

  // Generate parameter sets
  const generateParameterSets = (): ParameterSet[] => {
    const sets: ParameterSet[] = [];
    
    // Get a default template ID (first active template)
    // You may need to fetch this or use a hardcoded default
    const defaultTemplateId = '00000000-0000-0000-0000-000000000000'; // Replace with actual
    
    for (const personaId of selectedPersonaIds) {
      for (const arcId of selectedArcIds) {
        for (const topicId of selectedTopicIds) {
          sets.push({
            templateId: defaultTemplateId,
            parameters: {
              persona_id: personaId,
              emotional_arc_id: arcId,
              training_topic_id: topicId
            },
            tier: category === 'edge' ? 'edge_case' : 'template'
          });
        }
      }
    }
    
    return sets;
  };

  // Submit batch
  const handleSubmit = async () => {
    if (estimate.conversationCount === 0) {
      setSubmitError('Please select at least one persona, arc, and topic');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const parameterSets = generateParameterSets();
      
      const response = await fetch('/api/conversations/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${category === 'core' ? 'Core' : 'Edge Case'} Batch - ${new Date().toLocaleString()}`,
          parameterSets,
          concurrentProcessing: CONCURRENCY,
          errorHandling: 'continue',
          userId: '00000000-0000-0000-0000-000000000000' // TODO: Use real auth
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit batch');
      }

      // Redirect to batch monitoring page
      router.push(`/batch-jobs/${result.jobId}`);
      
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit batch');
      setSubmitting(false);
    }
  };

  // Toggle helpers
  const togglePersona = (id: string) => {
    setSelectedPersonaIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleArc = (id: string) => {
    setSelectedArcIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleTopic = (id: string) => {
    setSelectedTopicIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllPersonas = () => {
    setSelectedPersonaIds(personas.map(p => p.id));
  };

  const selectAllArcs = () => {
    setSelectedArcIds(availableArcs.map(a => a.id));
  };

  const selectAllTopics = () => {
    setSelectedTopicIds(topics.map(t => t.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading scaffolding data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <span className="ml-2 text-destructive">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Conversation Generator</h1>
        <p className="text-muted-foreground mt-2">
          Select parameters to generate multiple training conversations at once.
        </p>
      </div>

      {/* Conversation Category */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Conversation Category</CardTitle>
          <CardDescription>
            Choose the type of conversations to generate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={category} 
            onValueChange={(v) => handleCategoryChange(v as 'core' | 'edge')}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="core" id="core" />
              <div>
                <Label htmlFor="core" className="font-medium">Core Conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Standard emotional journeys (Confusion → Clarity, Fear → Confidence, etc.)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="edge" id="edge" />
              <div>
                <Label htmlFor="edge" className="font-medium">Edge Case Conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Boundary and crisis scenarios (Crisis → Referral, Hostility → Boundary, etc.)
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Personas */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personas</CardTitle>
            <CardDescription>{personas.length} available</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={selectAllPersonas}>
            Select All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {personas.map(persona => (
              <div key={persona.id} className="flex items-center space-x-3">
                <Checkbox
                  id={persona.id}
                  checked={selectedPersonaIds.includes(persona.id)}
                  onCheckedChange={() => togglePersona(persona.id)}
                />
                <Label htmlFor={persona.id} className="cursor-pointer">
                  {persona.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emotional Arcs */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {category === 'core' ? 'Emotional Arcs' : 'Edge Case Arcs'}
            </CardTitle>
            <CardDescription>{availableArcs.length} available</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={selectAllArcs}>
            Select All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableArcs.map(arc => (
              <div key={arc.id} className="flex items-center space-x-3">
                <Checkbox
                  id={arc.id}
                  checked={selectedArcIds.includes(arc.id)}
                  onCheckedChange={() => toggleArc(arc.id)}
                />
                <Label htmlFor={arc.id} className="cursor-pointer">
                  {arc.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Topics */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Training Topics</CardTitle>
            <CardDescription>{topics.length} available</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={selectAllTopics}>
            Select All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
            {topics.map(topic => (
              <div key={topic.id} className="flex items-center space-x-3">
                <Checkbox
                  id={topic.id}
                  checked={selectedTopicIds.includes(topic.id)}
                  onCheckedChange={() => toggleTopic(topic.id)}
                />
                <Label htmlFor={topic.id} className="cursor-pointer text-sm">
                  {topic.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batch Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Batch Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Conversations to Generate</p>
              <p className="text-3xl font-bold">{estimate.conversationCount}</p>
              <p className="text-xs text-muted-foreground mt-1">{estimate.formula}</p>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Time</p>
                <p className="font-semibold">~{estimate.estimatedTimeMinutes} minutes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="font-semibold">${estimate.estimatedCostUSD.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {submitError}
            </div>
          )}

          <Separator />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitting || estimate.conversationCount === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Generate {estimate.conversationCount} Conversations</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Task 5: Add Navigation Link

Update the dashboard navigation to include the Bulk Generator link. Find the navigation component (likely in `src/components/` or within a layout) and add:

```tsx
<Link href="/bulk-generator">
  <Button variant="ghost">Bulk Generator</Button>
</Link>
```

## DELIVERABLES

1. **Types:** `src/lib/types/bulk-generator.types.ts`
2. **Hook:** `src/hooks/use-scaffolding-data.ts`
3. **API Endpoints:** (if not exist)
   - `src/app/api/scaffolding/personas/route.ts`
   - `src/app/api/scaffolding/emotional-arcs/route.ts`
   - `src/app/api/scaffolding/topics/route.ts`
4. **Page:** `src/app/(dashboard)/bulk-generator/page.tsx`
5. **Navigation:** Updated nav with link to `/bulk-generator`

## ACCEPTANCE CRITERIA

- [ ] Page loads at `/bulk-generator` without errors
- [ ] Category switcher shows correct arcs (5 core OR 3 edge)
- [ ] Personas display correctly (3 personas)
- [ ] Topics display correctly (20 topics)
- [ ] "Select All" buttons work for each section
- [ ] Combination counter updates in real-time
- [ ] Cost and time estimates calculate correctly
- [ ] Submit button is disabled when no selections
- [ ] Successful submit redirects to `/batch-jobs/[jobId]`
- [ ] Errors display in UI

++++++++++++++++++




## Prompt 3: Batch Monitoring & Testing

========================

You are a senior full-stack developer implementing the Batch Monitoring UI and testing the Bulk Conversation Generator for the Bright Run LoRA Training Data Platform.

## CONTEXT

### Project Overview
We've built a Bulk Conversation Generator (Prompt 2) that submits batch generation jobs. Now we need:
1. A batch monitoring page to track job progress
2. Testing to verify the full workflow

### Technology Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: Supabase (PostgreSQL)
- UI: Shadcn/UI + Tailwind CSS

### Workspace Path
`C:\Users\james\Master\BrightHub\brun\train-data`

### Existing API Endpoint
**GET `/api/conversations/batch/[id]/status`**
```typescript
// Response shape
{
  jobId: string;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    percentage: number;
  };
  estimatedTimeRemaining?: number; // seconds
  startedAt?: string;
  completedAt?: string;
}
```

**PATCH `/api/conversations/batch/[id]`**
Supports actions: pause, resume, cancel

## TASKS TO IMPLEMENT

### Task 1: Create Batch Job Monitoring Page

**File:** `src/app/(dashboard)/batch-jobs/[id]/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Pause, 
  Play, 
  Ban,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface BatchJobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    percentage: number;
  };
  estimatedTimeRemaining?: number;
  startedAt?: string;
  completedAt?: string;
}

export default function BatchJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [status, setStatus] = useState<BatchJobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/conversations/batch/${jobId}/status`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }

      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchStatus();

    // Poll every 10 seconds while job is active
    const interval = setInterval(() => {
      if (status?.status === 'processing' || status?.status === 'queued') {
        fetchStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [jobId, status?.status]);

  // Job control actions
  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/conversations/batch/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} job`);
      }

      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} job`);
    } finally {
      setActionLoading(false);
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'processing': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  // Format time remaining
  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return 'Calculating...';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error Loading Batch Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/bulk-generator')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Generator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!status) return null;

  const isActive = status.status === 'processing' || status.status === 'queued';
  const isCompleted = status.status === 'completed';
  const isFailed = status.status === 'failed';

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/bulk-generator')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Batch Job</h1>
          <p className="text-sm text-muted-foreground font-mono">{jobId}</p>
        </div>
        <Badge className={`${getStatusColor(status.status)} text-white`}>
          {status.status.toUpperCase()}
        </Badge>
      </div>

      {/* Progress Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{status.progress.completed} / {status.progress.total} completed</span>
              <span>{Math.round(status.progress.percentage)}%</span>
            </div>
            <Progress value={status.progress.percentage} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{status.progress.successful}</p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{status.progress.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {status.progress.total - status.progress.completed}
              </p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{status.progress.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Time Estimate */}
          {isActive && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated time remaining: {formatTimeRemaining(status.estimatedTimeRemaining)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          {status.status === 'processing' && (
            <Button 
              variant="outline" 
              onClick={() => handleAction('pause')}
              disabled={actionLoading}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          {status.status === 'paused' && (
            <Button 
              onClick={() => handleAction('resume')}
              disabled={actionLoading}
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
          {isActive && (
            <Button 
              variant="destructive" 
              onClick={() => handleAction('cancel')}
              disabled={actionLoading}
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={fetchStatus}
            disabled={actionLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Completion Actions */}
      {isCompleted && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Batch Complete!
            </CardTitle>
            <CardDescription>
              Successfully generated {status.progress.successful} conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={() => router.push('/conversations')}>
                View Conversations
              </Button>
              <Button variant="outline" onClick={() => router.push('/bulk-generator')}>
                Generate More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failure Notice */}
      {isFailed && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Batch Failed
            </CardTitle>
            <CardDescription>
              {status.progress.failed} conversations failed to generate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/bulk-generator')}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Task 2: Create Batch Jobs List Page (Optional)

**File:** `src/app/(dashboard)/batch-jobs/page.tsx`

A simple page to list all batch jobs:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface BatchJob {
  id: string;
  name: string;
  status: string;
  total_items: number;
  completed_items: number;
  created_at: string;
}

export default function BatchJobsListPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('/api/batch-jobs');
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Batch Jobs</h1>
        <Button onClick={() => router.push('/bulk-generator')}>
          New Batch
        </Button>
      </div>

      <div className="space-y-4">
        {jobs.map(job => (
          <Card 
            key={job.id} 
            className="cursor-pointer hover:border-primary"
            onClick={() => router.push(`/batch-jobs/${job.id}`)}
          >
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{job.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.completed_items}/{job.total_items} completed
                  </p>
                </div>
                <Badge>{job.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Task 3: Testing Workflow

After implementing, test the full workflow:

**Test 1: Small Batch (Core)**
1. Navigate to `/bulk-generator`
2. Select "Core Conversations"
3. Select 1 persona, 1 arc, 2 topics (= 2 conversations)
4. Click "Generate 2 Conversations"
5. Verify redirect to `/batch-jobs/[id]`
6. Wait for completion
7. Verify "View Conversations" button works
8. Verify 2 new conversations exist

**Test 2: Small Batch (Edge)**
1. Navigate to `/bulk-generator`
2. Select "Edge Case Conversations"
3. Verify only edge arcs are shown (3 arcs)
4. Select 1 persona, 1 edge arc, 1 topic (= 1 conversation)
5. Click "Generate 1 Conversation"
6. Wait for completion
7. Verify conversation has `tier = 'edge_case'`

**Test 3: Full Batch (90 Core + 10 Edge)**
1. Generate 90 core: 3 personas × 5 arcs × 6 topics
2. Generate 10 edge: 3 personas × 3 edge arcs × variable topics (pick enough to make 10)
3. Verify 100 total conversations
4. Spot check quality scores

## DELIVERABLES

1. **Batch Monitoring Page:** `src/app/(dashboard)/batch-jobs/[id]/page.tsx`
2. **Batch Jobs List (Optional):** `src/app/(dashboard)/batch-jobs/page.tsx`
3. **Testing Completed:** Document test results

## ACCEPTANCE CRITERIA

- [ ] Batch monitoring page loads correctly
- [ ] Progress updates every 10 seconds (when active)
- [ ] Status badge shows correct color
- [ ] Pause/Resume/Cancel buttons work
- [ ] "View Conversations" appears when complete
- [ ] Small batch test passes (2 conversations generated)
- [ ] Edge case test passes (tier = 'edge_case')
- [ ] Navigation works throughout

++++++++++++++++++




---

## Summary

This execution plan provides 3 sequential prompts to implement the Bulk Conversation Generator:

| Prompt | Focus | Est. Time |
|--------|-------|-----------|
| 1 | Data Preparation (schema, edge arcs, topic reduction) | 2-3 hours |
| 2 | Bulk Generator UI (page, components, API) | 3-4 hours |
| 3 | Batch Monitoring & Testing | 1-2 hours |

**Total Estimated Time:** 6-10 hours

**Key Deliverables:**
- `conversation_category` column on `emotional_arcs`
- 3 edge case emotional arcs
- 20 active training topics (reduced from 65)
- Bulk Generator page at `/bulk-generator`
- Batch Monitoring page at `/batch-jobs/[id]`
- Tested workflow for generating 100 conversations

**Success Criteria:**
- User can generate 90 core conversations (3 × 5 × 6)
- User can generate 10 edge conversations
- Total of 100 conversations ready for HuggingFace export

---

**End of Execution Plan**

**Document Path:** `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\iteration-1-bulk-processing-execution-plan-step-5_v1.md`


