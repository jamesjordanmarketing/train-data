# Context Carryover: Bulk Conversation Generation UI Implementation

**Date:** November 25, 2025  
**Phase:** Bulk Processing UI & Parameter Selection System  
**Status:** Specification complete, ready for implementation

---

## 🔍 Supabase Agent Ops Library (SAOL) Quick Reference

### Critical Rule
**ALL database operations MUST use SAOL** - Never use raw `supabase-js` directly.

### Quick Start
```typescript
import { createSaolClient } from '@/lib/supa-agent-ops';

const saol = createSaolClient();

// Query with filters
const result = await saol.query({
  table: 'personas',
  select: ['id', 'name', 'persona_key'],
  filters: [
    { field: 'is_active', operator: 'eq', value: true }
  ],
  orderBy: [{ field: 'name', direction: 'asc' }]
});

console.log(`Found ${result.data.length} personas`);
```

### Common Patterns
```typescript
// Query with multiple filters
const conversations = await saol.query({
  table: 'conversations',
  select: ['*'],
  filters: [
    { field: 'batch_job_id', operator: 'eq', value: jobId },
    { field: 'status', operator: 'eq', value: 'completed' },
    { field: 'quality_score', operator: 'gte', value: 7.0 }
  ],
  orderBy: [{ field: 'created_at', direction: 'desc' }],
  limit: 100
});

// Update record
const updateResult = await saol.update({
  table: 'training_topics',
  filters: [{ field: 'id', operator: 'eq', value: topicId }],
  data: { is_active: false }
});

// Insert record
const insertResult = await saol.insert({
  table: 'emotional_arcs',
  data: {
    name: 'Crisis → Referral',
    arc_key: 'crisis_to_referral',
    arc_type: 'edge_case',
    is_active: true
  }
});
```

### SAOL Location
- **Library Path:** `C:\Users\james\Master\BrightHub\BRun\train-data\supa-agent-ops\`
- **Documentation:** `supa-agent-ops/QUICK_START.md`
- **Troubleshooting:** `supa-agent-ops/TROUBLESHOOTING.md`

### Environment Setup Required
```env
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

---

## 📋 Project Context

### Application Overview

**Bright Run LoRA Training Data Platform** - A Next.js 14 application that generates AI training conversations for fine-tuning large language models (LLMs).

### Core Workflow
```
User Selects Parameters → Batch Job Creation → Sequential Generation 
(each conversation = 1 Claude API call) → Quality Validation → 
Storage (JSON + metadata) → Dashboard Review → Export (JSONL)
```

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Claude API (Anthropic)
- **UI**: Shadcn/UI + Tailwind CSS

### Database Schema (Relevant Tables)

```sql
-- Scaffolding Data
personas (
  id UUID PRIMARY KEY,
  name TEXT,
  persona_key TEXT,
  description TEXT,
  is_active BOOLEAN
)

emotional_arcs (
  id UUID PRIMARY KEY,
  name TEXT,
  arc_key TEXT,
  arc_type TEXT, -- 'core', 'edge_case'
  description TEXT,
  is_active BOOLEAN,
  suitable_personas TEXT[], -- Compatibility hints
  suitable_topics TEXT[]
)

training_topics (
  id UUID PRIMARY KEY,
  name TEXT,
  topic_key TEXT,
  description TEXT,
  is_active BOOLEAN,
  -- NEW COLUMN NEEDED: conversation_type TEXT (see below)
)

-- Batch Processing
batch_jobs (
  id UUID PRIMARY KEY,
  name TEXT,
  status TEXT, -- 'pending', 'in_progress', 'completed', 'failed'
  total_items INTEGER,
  completed_items INTEGER,
  failed_items INTEGER,
  parameters JSONB,
  created_at TIMESTAMP
)

-- Generated Conversations
conversations (
  id UUID PRIMARY KEY,
  batch_job_id UUID REFERENCES batch_jobs(id),
  persona_id UUID REFERENCES personas(id),
  emotional_arc_id UUID REFERENCES emotional_arcs(id),
  training_topic_id UUID REFERENCES training_topics(id),
  tier TEXT, -- 'template', 'scenario', 'edge_case'
  turns JSONB,
  quality_score DECIMAL,
  status TEXT, -- 'pending_review', 'approved', 'rejected'
  created_at TIMESTAMP
)
```

---

## 🎯 Active Development Focus

### Primary Task
**Build Bulk Conversation Generation UI with Parameter Selection System**

### What Changed from Previous Spec

**CRITICAL CLARIFICATION FROM USER:**

The previous specification (`iteration-1-bulk-processing-step-4_v1.md`) assumed we would:
1. Pre-generate 100 parameter combinations in a script
2. Submit them to the batch API
3. Monitor progress

**USER'S ACTUAL REQUIREMENT:**
1. Build a UI-driven parameter selection system
2. User selects combinations interactively
3. System generates all selected combinations in batch
4. **Priority is UI/UX for selection, not pre-scripted generation**

### User's Vision

**Goal:** Create 100 conversations (90 core + 10 edge cases) for HuggingFace dataset

**Math:**
- 3 personas × 5 emotional arcs × 6 topics = 90 core conversations
- 10 edge case conversations (parameters TBD)
- **Total:** 100 conversations

**UI Flow:**

```
┌──────────────────────────────────────────────────┐
│  Bulk Conversation Generator                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  Conversation Type:  ○ Core   ○ Edge            │
│                                                  │
│  ─────────────────────────────────────────────   │
│                                                  │
│  If "Core" selected:                             │
│                                                  │
│  Personas: (multi-select)                        │
│  ☑ Marcus Chen - The Overwhelmed Avoider         │
│  ☑ Jennifer Martinez - The Anxious Planner       │
│  ☑ David Thompson - The Pragmatic Optimist       │
│                                                  │
│  Emotional Arcs: (multi-select)                  │
│  ☑ Confusion → Clarity                           │
│  ☑ Anxiety → Relief                              │
│  ☑ Frustration → Resolution                      │
│  ☑ Shame → Acceptance                            │
│  ☑ Overwhelm → Confidence                        │
│                                                  │
│  Topics: (multi-select, max 20 topics shown)     │
│  ☑ 401k Basics                                   │
│  ☑ Retirement Planning                           │
│  ☑ Debt Management                               │
│  ... (17 more)                                   │
│                                                  │
│  Combinations to Generate: 90                    │
│  Estimated Time: ~30 minutes                     │
│  Estimated Cost: $45.00                          │
│                                                  │
│  [Generate Batch]                                │
│                                                  │
│  ─────────────────────────────────────────────   │
│                                                  │
│  If "Edge" selected:                             │
│                                                  │
│  Personas: (multi-select)                        │
│  ☑ Marcus Chen                                   │
│  ☑ Jennifer Martinez                             │
│  ☑ David Thompson                                │
│                                                  │
│  Edge Case Arcs: (multi-select)                  │
│  ☑ Crisis → Referral                             │
│  ☑ Hostility → Boundary                          │
│  ☑ Despair → Hope                                │
│                                                  │
│  Edge Topics: (multi-select)                     │
│  ☑ Financial Crisis                              │
│  ☑ Ethical Boundary Testing                      │
│  ☑ Multi-Issue Complexity                        │
│                                                  │
│  Combinations to Generate: 10                    │
│  Estimated Time: ~3 minutes                      │
│  Estimated Cost: $5.00                           │
│                                                  │
│  [Generate Batch]                                │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🚨 Critical User Decisions & Clarifications

### Decision 1: Quality Gate PASSED ✅
**User Decision:** "YES they meet the quality bar. We will not adjust the prompts now. These are good enough."

**Context:** Three example "scenario" conversations were reviewed:
- `pmc/product/_examples/marcus-complex-scenario-enriched.json`
- `pmc/product/_examples/jennifer-complex-scenario-enriched.json`
- `pmc/product/_examples/david-chen-scenario-enriched.json`

**Implication:** Current prompt parameters and templates are production-ready. No changes to `parameter-assembly-service.ts` or templates needed.

### Decision 2: Bulk Spec Foundation
**User Decision:** "You have already created the first draft here: `iteration-1-bulk-processing-step-4_v1.md`. This will be the foundation of our next action step."

**Action Required:** Enhance the spec to be "one spec that covers any conversation parameter changes needed AND the batch function implementation."

**Note:** Since quality gate passed, no parameter changes needed. Focus is on UI implementation.

### Decision 3: Topic Reduction
**User Decision:** "Let's reduce the number of topics to 20. We have 65 which is unwieldy."

**Action Required:**
1. Query current 65 topics from `training_topics` table
2. Select or randomly choose 20 topics
3. Set `is_active = false` for the 45 unused topics (preserve data)
4. User has already downloaded backup of all 65 topics

**Implementation Note:** Use SAOL for all topic updates:
```typescript
// Randomly select 20 topics to keep active
const allTopics = await saol.query({
  table: 'training_topics',
  select: ['id', 'name', 'topic_key'],
  filters: [{ field: 'is_active', operator: 'eq', value: true }]
});

// Randomly select 20
const selectedTopics = shuffle(allTopics.data).slice(0, 20);
const selectedIds = selectedTopics.map(t => t.id);

// Deactivate the rest
for (const topic of allTopics.data) {
  if (!selectedIds.includes(topic.id)) {
    await saol.update({
      table: 'training_topics',
      filters: [{ field: 'id', operator: 'eq', value: topic.id }],
      data: { is_active: false }
    });
  }
}
```

### Decision 4: Core vs Edge Terminology & Infrastructure

**USER'S QUESTIONS (NEED TO BE ADDRESSED):**

1. **"Perhaps we need a different word to differentiate between 'core' and 'edge'. Can you think of better terminology?"**
   - User notes that "conversation type" is already equivalent to "conversation INTENT" (a foundational concept)
   - Need alternative terminology for core vs edge distinction
   
2. **"Do we already have different infrastructure to differentiate between 'core' and 'edge'? I need to be educated."**
   - Need to clarify existing infrastructure
   
3. **"Are you saying none of our current conversation combinations will produce 'edge' type conversations?"**
   - Need to clarify if edge cases require special parameters or if they can emerge from existing combinations

**CURRENT UNDERSTANDING:**

From codebase investigation:
- `tier` column exists on `conversations` table with values: `'template'`, `'scenario'`, `'edge_case'`
- `arc_type` column exists on `emotional_arcs` table (could contain `'core'` or `'edge_case'`)
- **BUT:** These are currently just labels, not functional differentiators

**USER'S HYPOTHESIS:**
"I think obvious and egregious edge boundaries can be trained primarily by using extreme emotional arcs, correct? Just logically: ANY persona should be able to have an edge conversation and ANY topic could be the subject of an edge conversation correct?"

**USER'S PROPOSED SOLUTION:**
- Create specific edge case emotional arcs (e.g., "Crisis → Referral", "Hostility → Boundary")
- These arcs should be identified in the system to guarantee edge case generation
- Simple approach: Edge arcs + any persona + any topic = edge conversation
- Alternative (if user's hypothesis is wrong): Might need both edge arcs AND edge topics

**IMPLEMENTATION DECISION NEEDED FROM USER:**

Before implementing the UI, the next agent must clarify with the user:

1. **Terminology:** What should we call the grouping of  "core" & "edge"?
   - Meaning I would like a node name for this grouping. I don't want to call them "conversation types" because that is already used for something else.  
   - Options: Suggest some options.
   
2. **Database Schema:** Should we add a column to differentiate? Where?
   - Option A: Add `conversation_category` to `emotional_arcs` table (values: 'standard', 'edge_case')
   - Option B: Add `is_edge_case` boolean to `emotional_arcs` table
   - Option C: Use existing `arc_type` column on `emotional_arcs` (needs verification of current values)
   
3. **Edge Case Logic:** Is user's hypothesis correct?
   - If YES: Edge arc + any persona + any topic = guaranteed edge conversation
   - If NO: Need to define both edge arcs AND edge topics

4. **How many edge arcs exist or need to be created?**
   - User wants 10 edge case conversations
   - Need to know: Are there existing edge arcs, or do we need to create them?

---

## 📝 Implementation Specification

### Phase 1: Data Preparation (FIRST PRIORITY)

**Task 1.1: Clarify Edge Case Infrastructure with User**

Before any implementation, get user answers to:
1. Preferred terminology for core vs edge
2. Database schema approach (which column to use/add)
3. Confirmation of edge case logic (arcs only, or arcs + topics)
4. Current state of edge arcs (do they exist? need creation?)

**Task 1.2: Reduce Topics to 20 (Using SAOL)**

**File:** `src/scripts/reduce-topics-to-20.ts` (NEW)

```typescript
/**
 * Reduce active training topics from 65 to 20
 * Preserves all data by setting is_active = false
 * 
 * Usage: ts-node src/scripts/reduce-topics-to-20.ts
 */

import { createSaolClient } from '@/lib/supa-agent-ops';

async function main() {
  const saol = createSaolClient();
  
  console.log('🔍 Fetching all active topics...');
  
  const result = await saol.query({
    table: 'training_topics',
    select: ['id', 'name', 'topic_key', 'description'],
    filters: [{ field: 'is_active', operator: 'eq', value: true }],
    orderBy: [{ field: 'name', direction: 'asc' }]
  });
  
  console.log(`✅ Found ${result.data.length} active topics`);
  
  // Randomly select 20 topics
  const shuffled = result.data.sort(() => Math.random() - 0.5);
  const selectedTopics = shuffled.slice(0, 20);
  const selectedIds = selectedTopics.map(t => t.id);
  
  console.log('\n📋 Selected topics (20):');
  selectedTopics.forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.name} (${t.topic_key})`);
  });
  
  // Deactivate the rest
  console.log('\n⏳ Deactivating 45 topics...');
  
  let deactivatedCount = 0;
  for (const topic of result.data) {
    if (!selectedIds.includes(topic.id)) {
      await saol.update({
        table: 'training_topics',
        filters: [{ field: 'id', operator: 'eq', value: topic.id }],
        data: { is_active: false }
      });
      deactivatedCount++;
    }
  }
  
  console.log(`✅ Deactivated ${deactivatedCount} topics`);
  console.log(`✅ ${selectedTopics.length} topics remain active`);
  
  // Export selected topics list
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, 'selected-topics-20.json');
  fs.writeFileSync(outputPath, JSON.stringify(selectedTopics, null, 2));
  
  console.log(`\n📄 Selected topics saved to: ${outputPath}`);
}

main().catch(console.error);
```

**Task 1.3: Set Up Edge Case Infrastructure**

**WAIT FOR USER CLARIFICATION** before implementing this task.

Possible approaches based on user's decision:

**Option A: Use Existing `arc_type` on `emotional_arcs`**
```typescript
// Query to check current arc_type values
const arcs = await saol.query({
  table: 'emotional_arcs',
  select: ['id', 'name', 'arc_key', 'arc_type'],
  filters: [{ field: 'is_active', operator: 'eq', value: true }]
});

// Separate into core vs edge
const coreArcs = arcs.data.filter(a => a.arc_type !== 'edge_case');
const edgeArcs = arcs.data.filter(a => a.arc_type === 'edge_case');
```

**Option B: Add New Column `conversation_category`**
```sql
-- Migration needed
ALTER TABLE emotional_arcs 
ADD COLUMN conversation_category TEXT DEFAULT 'standard';

UPDATE emotional_arcs 
SET conversation_category = 'edge_case' 
WHERE arc_key IN ('crisis_to_referral', 'hostility_to_boundary', ...);
```

**Option C: Create Separate Edge Arcs**
```typescript
// Script to create edge case arcs
const edgeArcs = [
  {
    name: 'Crisis → Referral',
    arc_key: 'crisis_to_referral',
    arc_type: 'edge_case',
    description: 'Detect crisis (suicidal ideation) and provide 988 hotline referral',
    is_active: true
  },
  {
    name: 'Hostility → Boundary',
    arc_key: 'hostility_to_boundary',
    arc_type: 'edge_case',
    description: 'Handle hostile client and enforce professional boundaries',
    is_active: true
  },
  // ... more edge arcs
];

for (const arc of edgeArcs) {
  await saol.insert({
    table: 'emotional_arcs',
    data: arc
  });
}
```

---

### Phase 2: UI Implementation

**Task 2.1: Create Bulk Generator Page**

**File:** `src/app/(dashboard)/bulk-generator/page.tsx` (NEW)

**Requirements:**
1. Two-mode interface: Core vs Edge
2. Multi-select dropdowns for personas, arcs, topics
3. Real-time combination counter
4. Cost and time estimation
5. Batch submission
6. Progress monitoring

**Functional Requirements:**

**Mode Selection:**
- Radio buttons: "Core Conversations" vs "Edge Case Conversations"
- Mode switch changes available arcs/topics

**Core Mode:**
- Load all active personas (SAOL query)
- Load arcs where `arc_type != 'edge_case'` (or per user's decision)
- Load 20 active topics (after reduction script)
- Multi-select checkboxes for each
- Calculate: `selectedPersonas.length × selectedArcs.length × selectedTopics.length`
- Display: "Will generate X conversations"

**Edge Mode:**
- Load all active personas (same as core)
- Load arcs where `arc_type = 'edge_case'` (or per user's decision)
- Load edge topics if applicable (TBD based on user clarification)
- Multi-select checkboxes
- Calculate combinations
- Display: "Will generate X edge case conversations"

**Estimation Logic:**
```typescript
const estimateGeneration = (count: number) => {
  const avgTimePerConversation = 60; // seconds
  const concurrency = 3;
  const effectiveTime = (count / concurrency) * avgTimePerConversation;
  
  const avgCostPerConversation = 0.45; // USD
  const totalCost = count * avgCostPerConversation;
  
  return {
    timeMinutes: Math.ceil(effectiveTime / 60),
    costUSD: totalCost.toFixed(2)
  };
};
```

**Component Structure:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { createSaolClient } from '@/lib/supa-agent-ops';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface Persona {
  id: string;
  name: string;
  persona_key: string;
}

interface EmotionalArc {
  id: string;
  name: string;
  arc_key: string;
  arc_type: string;
}

interface TrainingTopic {
  id: string;
  name: string;
  topic_key: string;
}

export default function BulkGeneratorPage() {
  const [mode, setMode] = useState<'core' | 'edge'>('core');
  
  // Data from database
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [coreArcs, setCoreArcs] = useState<EmotionalArc[]>([]);
  const [edgeArcs, setEdgeArcs] = useState<EmotionalArc[]>([]);
  const [topics, setTopics] = useState<TrainingTopic[]>([]);
  
  // Selections
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedArcs, setSelectedArcs] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load data on mount
  useEffect(() => {
    loadScaffoldingData();
  }, []);
  
  const loadScaffoldingData = async () => {
    try {
      setLoading(true);
      const saol = createSaolClient();
      
      // Load personas
      const personasResult = await saol.query({
        table: 'personas',
        select: ['id', 'name', 'persona_key'],
        filters: [{ field: 'is_active', operator: 'eq', value: true }],
        orderBy: [{ field: 'name', direction: 'asc' }]
      });
      
      // Load arcs (separate core and edge)
      const arcsResult = await saol.query({
        table: 'emotional_arcs',
        select: ['id', 'name', 'arc_key', 'arc_type'],
        filters: [{ field: 'is_active', operator: 'eq', value: true }],
        orderBy: [{ field: 'name', direction: 'asc' }]
      });
      
      // Load topics (should be 20 after reduction script)
      const topicsResult = await saol.query({
        table: 'training_topics',
        select: ['id', 'name', 'topic_key'],
        filters: [{ field: 'is_active', operator: 'eq', value: true }],
        orderBy: [{ field: 'name', direction: 'asc' }]
      });
      
      setPersonas(personasResult.data);
      
      // TODO: Update this logic based on user's decision about edge case detection
      const core = arcsResult.data.filter(a => a.arc_type !== 'edge_case');
      const edge = arcsResult.data.filter(a => a.arc_type === 'edge_case');
      setCoreArcs(core);
      setEdgeArcs(edge);
      
      setTopics(topicsResult.data);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading(false);
    }
  };
  
  // Calculate total combinations
  const calculateCombinations = () => {
    return selectedPersonas.length * selectedArcs.length * selectedTopics.length;
  };
  
  const combinations = calculateCombinations();
  const { timeMinutes, costUSD } = estimateGeneration(combinations);
  
  // Generate parameter sets from selections
  const generateParameterSets = () => {
    const sets = [];
    
    for (const personaId of selectedPersonas) {
      for (const arcId of selectedArcs) {
        for (const topicId of selectedTopics) {
          sets.push({
            persona_id: personaId,
            emotional_arc_id: arcId,
            training_topic_id: topicId,
            tier: mode === 'edge' ? 'edge_case' : 'template'
          });
        }
      }
    }
    
    return sets;
  };
  
  // Submit batch job
  const handleSubmit = async () => {
    if (combinations === 0) {
      alert('Please select at least one persona, arc, and topic');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const parameterSets = generateParameterSets();
      
      const response = await fetch('/api/conversations/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${mode === 'core' ? 'Core' : 'Edge Case'} Batch - ${new Date().toISOString()}`,
          parameterSets,
          concurrentProcessing: 3,
          errorHandling: 'continue',
          userId: 'bulk-generator-user' // TODO: Replace with real auth
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit batch');
      }
      
      // Redirect to batch monitoring page
      window.location.href = `/batch-jobs/${result.jobId}`;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit batch');
      setSubmitting(false);
    }
  };
  
  const currentArcs = mode === 'core' ? coreArcs : edgeArcs;
  
  if (loading) {
    return <div>Loading scaffolding data...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bulk Conversation Generator</h1>
      
      {/* Mode Selection */}
      <Card className="p-6 mb-6">
        <Label className="text-lg font-semibold mb-4 block">Conversation Type</Label>
        <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'core' | 'edge')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="core" id="core" />
            <Label htmlFor="core">Core Conversations</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="edge" id="edge" />
            <Label htmlFor="edge">Edge Case Conversations</Label>
          </div>
        </RadioGroup>
      </Card>
      
      {/* Persona Selection */}
      <Card className="p-6 mb-6">
        <Label className="text-lg font-semibold mb-4 block">Personas ({personas.length} available)</Label>
        <div className="grid grid-cols-1 gap-3">
          {personas.map(persona => (
            <div key={persona.id} className="flex items-center space-x-2">
              <Checkbox
                id={persona.id}
                checked={selectedPersonas.includes(persona.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPersonas([...selectedPersonas, persona.id]);
                  } else {
                    setSelectedPersonas(selectedPersonas.filter(id => id !== persona.id));
                  }
                }}
              />
              <Label htmlFor={persona.id}>{persona.name}</Label>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Arc Selection */}
      <Card className="p-6 mb-6">
        <Label className="text-lg font-semibold mb-4 block">
          {mode === 'core' ? 'Emotional Arcs' : 'Edge Case Arcs'} ({currentArcs.length} available)
        </Label>
        <div className="grid grid-cols-1 gap-3">
          {currentArcs.map(arc => (
            <div key={arc.id} className="flex items-center space-x-2">
              <Checkbox
                id={arc.id}
                checked={selectedArcs.includes(arc.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedArcs([...selectedArcs, arc.id]);
                  } else {
                    setSelectedArcs(selectedArcs.filter(id => id !== arc.id));
                  }
                }}
              />
              <Label htmlFor={arc.id}>{arc.name}</Label>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Topic Selection */}
      <Card className="p-6 mb-6">
        <Label className="text-lg font-semibold mb-4 block">Training Topics ({topics.length} available)</Label>
        <div className="grid grid-cols-2 gap-3">
          {topics.map(topic => (
            <div key={topic.id} className="flex items-center space-x-2">
              <Checkbox
                id={topic.id}
                checked={selectedTopics.includes(topic.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTopics([...selectedTopics, topic.id]);
                  } else {
                    setSelectedTopics(selectedTopics.filter(id => id !== topic.id));
                  }
                }}
              />
              <Label htmlFor={topic.id}>{topic.name}</Label>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Summary & Submit */}
      <Card className="p-6 bg-blue-50">
        <div className="mb-4">
          <p className="text-2xl font-bold text-blue-900">
            {combinations} conversation{combinations !== 1 ? 's' : ''} will be generated
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Estimated time: ~{timeMinutes} minutes
          </p>
          <p className="text-sm text-blue-700">
            Estimated cost: ${costUSD}
          </p>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={submitting || combinations === 0}
          size="lg"
          className="w-full"
        >
          {submitting ? 'Submitting...' : 'Generate Batch'}
        </Button>
      </Card>
    </div>
  );
}

function estimateGeneration(count: number) {
  const avgTimePerConversation = 60; // seconds
  const concurrency = 3;
  const effectiveTime = (count / concurrency) * avgTimePerConversation;
  
  const avgCostPerConversation = 0.45; // USD
  const totalCost = count * avgCostPerConversation;
  
  return {
    timeMinutes: Math.ceil(effectiveTime / 60),
    costUSD: totalCost.toFixed(2)
  };
}
```

**Task 2.2: Create Batch Job Monitoring Page**

**File:** `src/app/(dashboard)/batch-jobs/[id]/page.tsx` (NEW)

**Requirements:**
1. Real-time progress display
2. Poll batch job status every 30 seconds
3. Show completed/failed/in-progress counts
4. Display errors if any
5. Link to conversations dashboard when complete

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface BatchJobStatus {
  jobId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: {
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
    pending: number;
  };
  timing: {
    startedAt: string;
    estimatedCompletion: string;
    elapsedSeconds: number;
  };
  cost: {
    estimatedTotal: number;
    actualCurrent: number;
  };
  errors: Array<{
    conversationIndex: number;
    error: string;
    retryScheduled: boolean;
  }>;
}

export default function BatchJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  
  const [status, setStatus] = useState<BatchJobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchStatus();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, [jobId]);
  
  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/conversations/batch/${jobId}/status`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }
      
      setStatus(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="container mx-auto p-6">Loading batch job status...</div>;
  }
  
  if (error) {
    return <div className="container mx-auto p-6">Error: {error}</div>;
  }
  
  if (!status) {
    return <div className="container mx-auto p-6">Batch job not found</div>;
  }
  
  const progressPercent = (status.progress.completed / status.progress.total) * 100;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Batch Job: {jobId}</h1>
      
      {/* Status Card */}
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <p className="text-lg font-semibold mb-2">
            Status: <span className="text-blue-600">{status.status}</span>
          </p>
          <Progress value={progressPercent} className="h-4" />
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-green-600">{status.progress.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">{status.progress.inProgress}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-600">{status.progress.failed}</p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-600">{status.progress.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </Card>
      
      {/* Timing Card */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Timing</h2>
        <div className="space-y-2">
          <p>Started: {new Date(status.timing.startedAt).toLocaleString()}</p>
          <p>Elapsed: {Math.floor(status.timing.elapsedSeconds / 60)} minutes</p>
          <p>Estimated Completion: {new Date(status.timing.estimatedCompletion).toLocaleString()}</p>
        </div>
      </Card>
      
      {/* Cost Card */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Cost</h2>
        <div className="space-y-2">
          <p>Current: ${status.cost.actualCurrent.toFixed(2)}</p>
          <p>Estimated Total: ${status.cost.estimatedTotal.toFixed(2)}</p>
        </div>
      </Card>
      
      {/* Errors Card (if any) */}
      {status.errors.length > 0 && (
        <Card className="p-6 mb-6 bg-red-50">
          <h2 className="text-xl font-semibold mb-4 text-red-900">Errors ({status.errors.length})</h2>
          <div className="space-y-2">
            {status.errors.map((err, idx) => (
              <div key={idx} className="p-3 bg-white rounded border border-red-200">
                <p className="font-semibold">Conversation #{err.conversationIndex}</p>
                <p className="text-sm text-red-700">{err.error}</p>
                <p className="text-xs text-gray-600">
                  {err.retryScheduled ? 'Retry scheduled' : 'Not retrying'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Actions */}
      {status.status === 'completed' && (
        <Button
          onClick={() => router.push('/conversations')}
          size="lg"
          className="w-full"
        >
          View Conversations
        </Button>
      )}
    </div>
  );
}
```

**Task 2.3: Verify Existing Batch API Endpoints**

**Existing Files (already implemented):**
- `src/app/api/conversations/generate-batch/route.ts` - Submit batch job
- `src/app/api/conversations/batch/[id]/status/route.ts` - Get job status
- `src/app/api/conversations/batch/[id]/route.ts` - Pause/resume/cancel job
- `src/lib/services/batch-generation-service.ts` - Batch orchestration
- `src/lib/conversation-generator.ts` - Core generation with batch support

**Action:** Review these files to ensure they support the UI requirements above. Key checks:
1. Does `parameterSets` array format match what UI sends?
2. Is status polling endpoint working?
3. Does concurrency control work (default 3)?
4. Is error handling robust (continue on failure)?

**If any issues found:** Update the existing files as needed.

---

### Phase 3: Integration & Testing

**Task 3.1: Add Navigation to Bulk Generator**

Update main navigation to include "Bulk Generator" link:

**File:** `src/components/dashboard-nav.tsx` (or wherever navigation is defined)

```typescript
<nav>
  <Link href="/conversations">Conversations</Link>
  <Link href="/bulk-generator">Bulk Generator</Link> {/* NEW */}
  <Link href="/batch-jobs">Batch Jobs</Link> {/* NEW */}
</nav>
```

**Task 3.2: Testing Checklist**

**Data Preparation Tests:**
- [ ] Run topic reduction script: `ts-node src/scripts/reduce-topics-to-20.ts`
- [ ] Verify 20 topics remain active (query database)
- [ ] Verify 45 topics set to `is_active = false`
- [ ] Backup of selected topics saved to `selected-topics-20.json`

**UI Tests:**
- [ ] Navigate to `/bulk-generator`
- [ ] Verify page loads without errors
- [ ] Test mode switching (Core ↔ Edge)
- [ ] Test persona selection (all 3 personas)
- [ ] Test arc selection (verify correct arcs shown per mode)
- [ ] Test topic selection (verify 20 topics shown)
- [ ] Verify combination counter updates correctly
- [ ] Test "Select All" for each category
- [ ] Test "Deselect All" for each category
- [ ] Verify estimation display (time, cost)
- [ ] Test submit with 0 selections (should show error)
- [ ] Test submit with valid selections

**Batch Generation Tests:**
- [ ] Submit small batch (e.g., 1 persona × 1 arc × 2 topics = 2 conversations)
- [ ] Verify redirect to batch job page
- [ ] Verify batch job status page loads
- [ ] Verify progress updates every 30 seconds
- [ ] Wait for completion
- [ ] Verify "View Conversations" button appears
- [ ] Navigate to conversations dashboard
- [ ] Verify new conversations appear

**Edge Case Tests:**
- [ ] Switch to Edge mode
- [ ] Verify only edge arcs shown (or appropriate arcs per user's decision)
- [ ] Submit edge case batch
- [ ] Verify conversations have `tier = 'edge_case'`

**Performance Tests:**
- [ ] Submit 90-conversation batch (3 personas × 5 arcs × 6 topics)
- [ ] Monitor progress
- [ ] Verify concurrency = 3 (check logs)
- [ ] Verify sequential generation (each conversation = 1 API call)
- [ ] Verify cost tracking accuracy
- [ ] Verify completion time (~30 minutes for 90 conversations)

---

## 🗂️ Important Files & Paths

### Files to Create (Phase 2)
- `src/scripts/reduce-topics-to-20.ts` (NEW) - Topic reduction script
- `src/app/(dashboard)/bulk-generator/page.tsx` (NEW) - Bulk generator UI
- `src/app/(dashboard)/batch-jobs/[id]/page.tsx` (NEW) - Batch monitoring UI
- `src/scripts/setup-edge-arcs.ts` (NEW, CONDITIONAL) - Edge arc creation if needed

### Files to Review (Existing)
- `src/lib/services/batch-generation-service.ts` - Verify batch orchestration
- `src/lib/conversation-generator.ts` - Verify sequential generation
- `src/app/api/conversations/generate-batch/route.ts` - Verify API endpoint
- `src/app/api/conversations/batch/[id]/status/route.ts` - Verify status endpoint
- `src/lib/services/conversation-generation-service.ts` - Generation logic
- `src/lib/services/parameter-assembly-service.ts` - Parameter assembly

### Documentation Files
- `pmc/context-ai/pmct/iteration-1-bulk-processing-step-4_v1.md` - Original spec (1677 lines)
- `pmc/context-ai/pmct/iteration-1-action-plan_v1.md` - Action plan (412 lines)
- `pmc/context-ai/pmct/iteration-1-philosophy_v1.md` - Architecture philosophy (1297 lines)
- `pmc/context-ai/pmct/iteration-1-product-positioning_v1.md` - Product positioning (2187 lines)

### Example Conversations (Quality Validated)
- `pmc/product/_examples/marcus-complex-scenario-enriched.json`
- `pmc/product/_examples/jennifer-complex-scenario-enriched.json`
- `pmc/product/_examples/david-chen-scenario-enriched.json`

### Database Tables
- `personas` - 3 personas (Marcus, Jennifer, David)
- `emotional_arcs` - Need to count core vs edge arcs
- `training_topics` - Currently 65, will be reduced to 20
- `batch_jobs` - Batch job tracking
- `conversations` - Generated conversations

---

## 🚧 Known Issues & Blockers

### BLOCKER 1: Edge Case Infrastructure Undefined ⚠️

**Status:** AWAITING USER CLARIFICATION

**Questions for User:**
1. **Terminology:** What should we call "core" | "edge" collectively?
   - Suggested alternatives: "conversation_category". Name a few other options.
   
2. **Database Schema:** Which column differentiates core from edge?
   - Option A: Use existing `arc_type` on `emotional_arcs` table
   - Option B: Add new `conversation_category` column
   
3. **Edge Case Logic:** Is user's hypothesis correct?
   - User believes: "Edge arc + any persona + any topic = edge conversation"
   - Alternative: Might need both edge arcs AND edge topics
   - Need confirmation
   
4. **Existing Edge Arcs:** Do they exist in the database?
   - Need to query: `SELECT * FROM emotional_arcs WHERE arc_type = 'edge_case'`
   - If none exist, need to create them
   - User wants 10 edge conversations total

**Impact:** Cannot implement edge case mode in UI until this is clarified.

**Workaround:** Implement core mode first, leave edge mode as placeholder.

---

### Issue 2: Authentication Placeholder

**Status:** KNOWN LIMITATION

**Current:** Using placeholder `x-user-id` header or hardcoded `userId`

**Impact:** No real user management, all batches created by same "user"

**Solution:** Deferred to later phase (not blocking bulk generator)

---

### Issue 3: Export Functionality Not Implemented

**Status:** DEFERRED

**Current:** "Export Selected" button in conversations dashboard is placeholder

**Impact:** Cannot export 100 conversations to JSONL yet

**Solution:** Will be implemented after bulk generation is working

**Note:** Spec for export is already in `iteration-1-bulk-processing-step-4_v1.md` (JSONL format, HuggingFace-ready)

---

## 📚 Key Architectural Decisions

### Decision 1: UI-Driven Parameter Selection (Not Pre-Scripted)
**Rationale:** User wants interactive control over which combinations to generate, not automated scripting.

### Decision 2: Sequential Generation with Concurrency = 3
**Rationale:** Each conversation must be its own Claude API call to avoid context overflow. Concurrency of 3 balances speed with rate limits.

### Decision 3: Topic Reduction from 65 to 20
**Rationale:** 65 topics is unwieldy in UI. 20 is manageable. Math: 3 personas × 5 arcs × 6 topics = 90 conversations (but having 20 topics gives flexibility).

### Decision 4: Edge Cases via Emotional Arcs (User's Hypothesis)
**Rationale:** User believes extreme emotional arcs (e.g., "Crisis → Referral") are sufficient to create edge cases. Any persona + any topic can have an edge conversation if the arc is extreme.

**PENDING:** User confirmation needed.

### Decision 5: Preserving Deactivated Data
**Rationale:** Setting `is_active = false` preserves all 65 topics for potential future use, rather than deleting.

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- ✅ User has answered all edge case infrastructure questions
- ✅ 20 topics are active, 45 are deactivated
- ✅ Edge case arcs are identified or created (if needed)
- ✅ Database schema for core/edge differentiation is confirmed

### Phase 2 Complete When:
- ✅ Bulk generator page loads and displays all scaffolding data
- ✅ User can select personas, arcs, topics via checkboxes
- ✅ Combination counter updates in real-time
- ✅ Cost and time estimation displays correctly
- ✅ Batch submission redirects to monitoring page
- ✅ Monitoring page polls status every 30 seconds
- ✅ Progress displays correctly (completed/failed/in-progress)
- ✅ Navigation to conversations dashboard works after completion

### Phase 3 Complete When:
- ✅ 90-conversation batch generates successfully
- ✅ 10 edge case conversations generate successfully
- ✅ Total of 100 conversations in database
- ✅ All conversations have `quality_score >= 7.0` (based on quality gate)
- ✅ User can approve/reject conversations in dashboard
- ✅ Export to JSONL is ready (Phase 4 task, but verify setup)

---

## 🔄 Next Agent Instructions

### Step 1: Read This Document Fully
- Understand the context shift from pre-scripted generation to UI-driven selection
- Note the user's clarification questions (edge case infrastructure)
- Review the UI wireframe and requirements

### Step 2: Clarify Edge Case Infrastructure with User
**ASK USER THESE EXACT QUESTIONS:**

> "Before I implement the bulk generator UI, I need clarification on edge case infrastructure:
> 
> **1. Database Column:** Which column should differentiate core from edge?
>    - Option A: Use existing `arc_type` column on `emotional_arcs` table
>    - Option B: Add new column like `conversation_category`
>    - Option C: Add boolean `is_edge_case` to arcs
> 
> **2. Edge Case Logic Confirmation:** You hypothesized that 'extreme emotional arcs + any persona + any topic = edge conversation'. Is this correct?
>    - If YES: We only need to identify/create edge case arcs
>    - If NO: Do we also need to define edge case topics?
> 
> **3. Existing Edge Arcs:** Do edge case emotional arcs already exist in the database, or do I need to create them?
>    - I'll query the database to check
>    - If they don't exist, please provide 10 edge case arc names/descriptions to create"

### Step 3: Execute Phase 1 (Data Preparation)
1. Run topic reduction script (Task 1.2)
2. Verify 20 topics remain active
3. Based on user's answers, set up edge case infrastructure (Task 1.3)

### Step 4: Implement Phase 2 (UI)
1. Create bulk generator page (Task 2.1)
2. Create batch monitoring page (Task 2.2)
3. Review existing batch API endpoints (Task 2.3)
4. Add navigation links (Task 3.1)

### Step 5: Test Thoroughly (Phase 3)
1. Follow testing checklist
2. Test with small batch first (2-5 conversations)
3. Then test with full 90-conversation batch
4. Verify all quality criteria

### Step 6: Report Results to User
Provide summary:
- ✅ What was completed
- ⏳ What's in progress (if any)
- 🚧 What's blocked (if any)
- 📊 Test results
- 💡 Recommendations for next steps

---

## 💡 User's Key Insights to Remember

### "Intent is Crucial"
The user has repeatedly emphasized that **INTENT** is the foundation of the entire system. The bulk generator must respect this by allowing flexible parameter combinations.

### "Simple Over Complex"
User quote: "I don't like 'if this if then that logic' built into code."

**Implication:** Keep the UI simple. Don't overcomplicate edge case detection with complex compatibility logic. If the user selects an edge arc, trust it will produce an edge conversation.

### "Test the Selection Functionality"
User quote: "I DO want to test the ability to 'select' conversations for the batch."

**Implication:** The UI interaction (selecting parameters) is as important as the batch generation itself. Make the UX smooth and intuitive.

### "Edge Cases Can Be Trained with Extreme Arcs"
User quote: "I think obvious and egregious edge boundaries can be trained primarily by using extreme emotional arcs, correct?"

**Implication:** If user confirms this hypothesis, we don't need to complicate edge case logic. Just identify the extreme arcs and let the user select them.

---

## 📞 Questions to Ask User During Implementation

1. **After Topic Reduction:** "I've reduced topics to 20. Here's the list [show selected-topics-20.json]. Do these look good, or would you like me to swap any?"

2. **Edge Arc Discovery:** "I found X emotional arcs with `arc_type = 'edge_case'` in the database. Are these the edge arcs you want to use, or should I create new ones?"

3. **UI Feedback:** "Here's a screenshot of the bulk generator page. Does the layout match your vision? Any changes needed?"

4. **Estimation Accuracy:** "The cost estimation assumes $0.45 per conversation. Does this match your actual costs? Should I adjust?"

5. **Batch Size Limit:** "Should I add a maximum batch size limit (e.g., 100 conversations) to prevent accidental huge batches?"

---

## 🎓 Educational Notes for Next Agent

### Why 3 Personas × 5 Arcs × 6 Topics = 90?
User's math for generating 90 core conversations. This assumes:
- All 3 personas are selected
- 5 core emotional arcs are selected
- 6 topics are selected
- Cartesian product: 3 × 5 × 6 = 90 unique combinations

### Why Reduce Topics from 65 to 20?
UI usability. 65 checkboxes is overwhelming. 20 is manageable. Also, 20 topics still provides plenty of coverage:
- 3 personas × 5 arcs × 20 topics = 300 possible combinations
- User only needs 90, so 20 topics gives flexibility

### Why Sequential Generation (Not Bulk API Call)?
Claude API context window limitations. If we tried to generate 100 conversations in one API call:
- Prompt would be massive (100 × prompt template)
- Response would be massive (100 × conversation JSON)
- Context overflow likely
- Error recovery difficult (one failure = all 100 fail)

Sequential generation means:
- Each conversation = 1 API call
- Manageable prompt/response size
- Error isolation (one failure doesn't affect others)
- Progress tracking possible

### Why Concurrency = 3?
Balance between:
- Speed (more concurrency = faster)
- Rate limits (Claude API has rate limits)
- Token-per-minute limits (too many concurrent = hit limits)
- Cost visibility (easier to track with lower concurrency)

3 concurrent conversations is a sweet spot based on previous testing.

---

## 📁 Files to Reference

### Specification Documents (Read These)
1. `pmc/context-ai/pmct/iteration-1-bulk-processing-step-4_v1.md` (1677 lines)
   - Original bulk processing spec
   - JSONL export format
   - Quality validation framework
   - **Note:** Written before user clarified UI-driven approach, so adapt as needed

2. `pmc/context-ai/pmct/iteration-1-action-plan_v1.md` (412 lines)
   - Previous action plan (now superseded by this document)

3. `pmc/context-ai/pmct/iteration-1-philosophy_v1.md` (1297 lines)
   - Architectural philosophy
   - Chunk-Alpha vs Train-Data disconnect analysis

### Existing Services (Review These)
1. `src/lib/services/batch-generation-service.ts`
   - Batch orchestration logic
   - Verify `parameterSets` format matches UI

2. `src/lib/conversation-generator.ts`
   - Core generation with batch support
   - Verify concurrency control works

3. `src/lib/services/conversation-generation-service.ts`
   - Single conversation generation
   - Called by batch generator for each conversation

### Example API Payloads (Use These as Reference)
```json
// POST /api/conversations/generate-batch
{
  "name": "Core Batch - 2025-11-25",
  "parameterSets": [
    {
      "persona_id": "uuid-persona-1",
      "emotional_arc_id": "uuid-arc-1",
      "training_topic_id": "uuid-topic-1",
      "tier": "template"
    },
    {
      "persona_id": "uuid-persona-1",
      "emotional_arc_id": "uuid-arc-1",
      "training_topic_id": "uuid-topic-2",
      "tier": "template"
    }
    // ... more parameter sets
  ],
  "concurrentProcessing": 3,
  "errorHandling": "continue",
  "userId": "bulk-generator-user"
}
```

---

## ✅ Final Checklist Before Starting Implementation

- [ ] Read this entire carryover document
- [ ] Understand the shift from pre-scripted to UI-driven approach
- [ ] Review the UI wireframe and requirements
- [ ] Read `iteration-1-bulk-processing-step-4_v1.md` for JSONL export specs
- [ ] Ask user the 4 clarification questions about edge case infrastructure
- [ ] Wait for user's answers before implementing edge case mode
- [ ] Confirm access to SAOL library and environment variables
- [ ] Verify database access (can query personas, arcs, topics)
- [ ] Test existing batch API endpoints (if not already tested)
- [ ] Prepare for ~2-3 day implementation timeline

---

**Good luck! The user is excited about this bulk generator UI and ready to generate 100 conversations for HuggingFace. The quality gate passed, so the focus is purely on the UI/UX for parameter selection and batch submission. Keep it simple, use SAOL for all database operations, and ask for clarification on edge cases before implementing that mode.**

---

**Last Updated:** November 25, 2025  
**Prepared By:** Previous Context Agent  
**For:** Next Implementation Agent

