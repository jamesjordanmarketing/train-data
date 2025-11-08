# Normalizing the 100 Training Conversations: Structure Explanation
**Version:** 1.0  
**Date:** October 27, 2025  
**Purpose:** Explain the three-tier conversation structure and provide normalization strategy for UI implementation

---

## Executive Summary

You're correct that there's complexity in how conversations are organized, but it's intentional and serves different training purposes. Here's the key insight: **all conversations share core metadata (persona, emotion, topic, turn count), but each TIER has additional specialized metadata** that guides its specific generation approach.

---

## 1. Understanding the Three "Types" (Tiers)

### What Makes Each Tier Different?

The three tiers are NOT about different "types" of conversations from a data structure perspective—they're about **different generation methodologies** that produce conversations with different training value.

#### Tier 1: Template-Driven Conversations
**What it is:** Conversations following **predefined emotional arc templates** (5 templates: Confusion→Clarity, Shame→Acceptance, Couple Conflict→Alignment, Anxiety→Confidence, Grief/Loss→Healing)

**Generation Approach:**
- Use a **structural template** defining turn sequence and emotional progression
- Parameters injected: {persona}, {emotion}, {topic}, but structure is fixed
- Think of it like a Mad Libs: fill in the blanks but story structure is predetermined

**Why this type exists:**
- **Efficiency:** Fastest to generate because structure is proven
- **Consistency:** Same emotional arc pattern across multiple scenarios
- **Foundation:** Teaches AI basic emotional progression patterns

**Metadata Unique to Tier 1:**
- `template_type`: Which of 5 emotional arc templates (A, B, C, D, E)
- Example: "Template A: Confusion→Clarity" or "Template B: Shame→Acceptance"

**Does it have a "prompt template"?**
YES! Each Template Type (A-E) has a specific prompt template that defines:
- Turn sequence (Turn 1: User expresses confusion, Turn 2: Elena validates...)
- Emotional progression pattern (Start: 0.70-0.85 Confusion, End: 0.70-0.80 Clarity)
- Response strategy patterns (normalize → educate → celebrate progress)

#### Tier 2: Scenario-Based Conversations
**What it is:** Conversations based on **real-world customer scenarios** derived from your actual business documents (chunk content)

**Generation Approach:**
- Use **custom scenario descriptions** (2-3 sentences) describing complex situation
- Scenarios pulled from semantic chunks: "Military discharge financial transition", "First-generation wealth guilt", etc.
- More flexible emotional arcs—not following a fixed template
- Parameters: {persona}, {emotion}, {topic}, {scenario_description}, {chunk_content}

**Why this type exists:**
- **Realism:** Reflects actual customer situations from your business
- **Complexity:** Multi-dimensional problems (cultural + financial + family dynamics)
- **Authenticity:** Incorporates domain expertise from your source documents

**Metadata Unique to Tier 2:**
- `scenario_name`: Descriptive name (e.g., "Elderly Immigrant Parent Support")
- `complexity_level`: High/Medium/Low
- `topic_category`: Broader category (e.g., "Family Finance + Cultural")
- `special_considerations`: Cultural, legal, therapeutic flags
- `expert_review_required`: Which experts (Finance/Therapy/Legal)

**Does it have a "prompt template"?**
YES, but it's more flexible! Tier 2 has a **scenario-based prompt template** that includes:
- Scenario description injection: {scenario_description}
- Chunk context: {chunk_content}
- Flexible emotional arc based on scenario complexity
- Guidance: "Create custom emotional progression appropriate to scenario"

The prompt template is **less prescriptive** than Tier 1 because scenarios vary widely.

#### Tier 3: Edge Case Conversations
**What it is:** Conversations testing **boundary conditions, extreme states, and AI limitations**

**Generation Approach:**
- Use **edge case prompts** that deliberately stress-test the system
- Test: extreme emotions, conflicting advice requests, crisis situations, ethical dilemmas
- Parameters: {persona}, {emotion}, {edge_case_type}, {boundary_description}
- Often require **referrals** to specialists (attorneys, therapists, crisis lines)

**Why this type exists:**
- **Robustness:** Ensure AI doesn't break under unusual conditions
- **Safety:** Teach AI when to escalate beyond its capabilities
- **Boundaries:** Demonstrate appropriate limitations and referral protocols

**Metadata Unique to Tier 3:**
- `edge_case_type`: Crisis Response, Legal Boundary, Ethical Boundary, etc.
- `boundary_being_tested`: Mental health emergency, legal advice scope, etc.
- `referral_type`: What specialist to refer to (e.g., "988 Suicide Hotline + Therapist")
- `crisis_level`: High/Medium/Low
- `legal_review_required`: Yes/No

**Does it have a "prompt template"?**
YES! Tier 3 has an **edge case prompt template** that includes:
- Boundary maintenance emphasis: "Recognize boundary immediately in Turn 1"
- Referral language templates: "You need to speak with a bankruptcy attorney"
- Crisis protocol integration: "Immediate mental health referral"
- Safety-first guidelines: "Do NOT continue financial discussion"

The prompt focuses on **boundary recognition and appropriate referral** rather than solving the problem.

---

## 2. Why Three Tiers? (Strategic Reasoning)

### The Training Data Strategy

**Tier 1 (40 conversations):** Foundation
- Teaches AI **basic emotional patterns** that work reliably
- High approval rate (90%+) because structure is proven
- Fast generation (efficient use of API costs)
- Coverage: 5 emotional arcs × 8 permutations = 40 conversations

**Tier 2 (35 conversations):** Realism
- Teaches AI **complex real-world scenarios** from your business
- Moderate approval rate (80%+) due to complexity
- Slower generation (requires more context)
- Coverage: 35 unique scenarios selected from document analysis

**Tier 3 (15 conversations):** Safety & Boundaries
- Teaches AI **when NOT to give advice** (ethical boundaries)
- Lower approval rate (70%+) because boundaries are harder to test
- Requires expert review (attorney, therapist)
- Coverage: 15 edge cases across crisis/legal/therapeutic boundaries

**Why this distribution (40/35/15)?**
- 40% foundational (Template) provides reliable base
- 35% realistic (Scenario) provides business-specific context
- 15% edge cases (Edge) provides safety guardrails

This mirrors the Pareto principle: 80% of conversations follow patterns (Tiers 1-2), 20% test boundaries (Tier 3).

---

## 3. Normalization Strategy for UI

### Core Insight: Shared Columns + Tier-Specific Columns

All 100 conversations share **core metadata** that makes them "a conversation":
- `conversation_id`: Unique identifier (1-100)
- `persona`: User persona (Anxious Investor, Confident Planner, etc.)
- `emotion`: Primary emotional state (Fear, Excitement, Confusion, etc.)
- `topic`: Financial topic (Retirement Planning, Debt Management, etc.)
- `tier`: Template / Scenario / Edge Case
- `turn_count`: Number of conversation turns (3-6 typical)
- `status`: Not Generated / Generating / Generated / Approved / Rejected / Failed
- `quality_score`: 1-10 score based on validation criteria
- `generated_date`: When conversation was created

But each tier has **additional specialized fields**:

#### Tier 1 Additional Fields:
- `template_type`: A / B / C / D / E (emotional arc template)
- `emotional_start`: Starting emotion (e.g., "Confusion (0.80)")
- `emotional_end`: Ending emotion (e.g., "Clarity (0.70)")
- `key_learning_objective`: What this conversation teaches AI

#### Tier 2 Additional Fields:
- `scenario_name`: Descriptive scenario title
- `complexity_level`: High / Medium / Low
- `topic_category`: Broader category grouping
- `primary_emotions`: Multiple emotions (comma-separated)
- `special_considerations`: Cultural/Legal/Therapeutic flags
- `expert_review_required`: Finance / Therapy / Legal

#### Tier 3 Additional Fields:
- `edge_case_type`: Crisis Response / Legal Boundary / Ethical Boundary
- `boundary_being_tested`: Specific boundary description
- `referral_type`: Who to refer to (therapist, attorney, hotline)
- `crisis_level`: High / Medium / Low
- `legal_review_required`: Yes / No

---

## 4. Normalized Table Structure (For UI)

### Approach: Union Schema with Nullable Tier-Specific Columns

Create ONE table with ALL columns, where tier-specific columns are NULL for conversations not in that tier.

**Normalized Columns (27 total):**

**Core Columns (9)** - All conversations have these:
1. `conversation_id` (integer, 1-100)
2. `persona` (string)
3. `persona_age` (integer, nullable)
4. `persona_income` (integer, nullable)
5. `emotion` (string)
6. `topic` (string)
7. `tier` (enum: Template / Scenario / Edge Case)
8. `turn_count` (integer, 3-6)
9. `key_learning_objective` (string)

**Generation Tracking Columns (6)** - System state:
10. `status` (enum: Not Generated / Generating / Generated / Approved / Rejected / Failed)
11. `quality_score` (integer, 1-10, nullable until generated)
12. `generated_date` (datetime, nullable)
13. `approved_by` (user_id, nullable)
14. `approved_at` (datetime, nullable)
15. `reviewer_notes` (text, nullable)

**Tier 1 Specific Columns (3)** - NULL for Tiers 2 & 3:
16. `template_type` (enum: A / B / C / D / E, nullable)
17. `emotional_start` (string, nullable)
18. `emotional_end` (string, nullable)

**Tier 2 Specific Columns (5)** - NULL for Tiers 1 & 3:
19. `scenario_name` (string, nullable)
20. `complexity_level` (enum: High / Medium / Low, nullable)
21. `topic_category` (string, nullable)
22. `primary_emotions` (string, comma-separated, nullable)
23. `special_considerations` (string, nullable)

**Tier 3 Specific Columns (4)** - NULL for Tiers 1 & 2:
24. `edge_case_type` (string, nullable)
25. `boundary_being_tested` (string, nullable)
26. `referral_type` (string, nullable)
27. `crisis_level` (enum: High / Medium / Low, nullable)

**Expert Review Columns (1)** - Applies to Tiers 2 & 3:
28. `expert_review_required` (string, comma-separated, e.g., "Finance,Therapy,Legal")

**Notes Column (1)** - All tiers:
29. `notes` (text, nullable)

---

## 5. Handling in the UI

### Display Strategy: Conditional Column Visibility

**Dashboard Table View:**
- Show **core columns always** (conversation_id, persona, emotion, topic, tier, status, quality_score)
- Show **tier-specific columns conditionally** based on filter or tier

**Example User Workflow:**
1. User opens dashboard → sees all 100 conversations with core columns
2. User filters by "Tier: Template" → table shows Tier 1 specific columns (template_type, emotional_start, emotional_end)
3. User filters by "Tier: Scenario" → table shows Tier 2 specific columns (scenario_name, complexity_level, topic_category)
4. User filters by "Tier: Edge Case" → table shows Tier 3 specific columns (edge_case_type, boundary_being_tested, referral_type)

**Conversation Preview Panel:**
- Always shows core metadata in top section
- Shows tier-specific metadata in collapsible "Advanced Details" section
- Labels clearly indicate which tier the metadata belongs to

### CSV Export Strategy:

**Option A: Wide Format (All Columns)**
- Export ONE CSV with 29 columns
- Tier-specific columns are empty (NULL) for non-applicable conversations
- Pros: Complete data, easy to import into database
- Cons: Lots of empty cells, harder to read

**Option B: Narrow Format (Core + Dynamic)**
- Export CSV with core columns + one "tier_metadata" JSON column
- Tier-specific data stored as JSON object in `tier_metadata` column
- Pros: Clean structure, no empty columns
- Cons: JSON parsing required

**Recommendation:** Use **Option A (Wide Format)** because:
- Database systems handle NULL efficiently
- Users can hide empty columns in Excel/Google Sheets
- Import/export to database is straightforward
- No JSON parsing complexity

---

## 6. What Variables Differentiate Each Conversation?

### The "Identity" of a Conversation

A conversation is **uniquely identified** by the combination of:

**Minimum Required (All Tiers):**
1. `conversation_id` (1-100) - Unique numeric identifier
2. `persona` - Who is speaking (user type)
3. `emotion` - Primary emotional state
4. `topic` - Financial subject matter
5. `tier` - Template / Scenario / Edge Case

**Tier 1 Additional:**
6. `template_type` (A-E) - Which emotional arc template

**Tier 2 Additional:**
7. `scenario_name` - Unique scenario title

**Tier 3 Additional:**
8. `edge_case_type` - Which boundary being tested

### Permutations Logic

**Total Conversations = 100** (predetermined distribution):
- Tier 1 (Template): 40 conversations
  - 5 templates (A-E) × 8 permutations each = 40
  - Permutations vary: persona age, income, specific topic, emotional intensity
  
- Tier 2 (Scenario): 35 conversations
  - 35 unique scenarios (each scenario appears once)
  - Scenarios are unique by definition (different combinations of life situations)
  
- Tier 3 (Edge Case): 15 conversations
  - 15 unique edge cases (each appears once)
  - Edge cases test different boundaries (crisis types, legal situations, therapeutic needs)

**Key Insight:** The 100 is NOT all possible permutations—it's a **carefully curated subset** selected for:
- Balanced coverage across taxonomy (persona × emotion × topic)
- Representation of common scenarios (Tier 1-2)
- Coverage of critical boundaries (Tier 3)
- Avoidance of redundancy (no duplicate combinations)

If you generated ALL permutations:
- 10 personas × 15 emotions × 20 topics × 3 tiers = **9,000 possible conversations**

But we're generating **100 strategically selected conversations** that provide:
- Representative coverage of the taxonomy
- High-quality training signal
- Efficient use of API costs

---

## 7. Database Schema Implementation

### Recommended Structure: Single Table with Discriminator

**Table: `conversations`**

```sql
CREATE TABLE conversations (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id INTEGER UNIQUE NOT NULL, -- 1-100
  
  -- Core metadata (all tiers)
  persona VARCHAR(100) NOT NULL,
  persona_age INTEGER,
  persona_income INTEGER,
  emotion VARCHAR(100) NOT NULL,
  topic VARCHAR(200) NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('Template', 'Scenario', 'Edge Case')),
  turn_count INTEGER CHECK (turn_count BETWEEN 2 AND 16),
  key_learning_objective TEXT,
  
  -- Generation tracking
  status VARCHAR(20) NOT NULL DEFAULT 'Not Generated' 
    CHECK (status IN ('Not Generated', 'Generating', 'Generated', 'Approved', 'Rejected', 'Failed')),
  quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
  generated_date TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  
  -- Tier 1 specific (Template)
  template_type VARCHAR(1) CHECK (template_type IN ('A', 'B', 'C', 'D', 'E')),
  emotional_start VARCHAR(100),
  emotional_end VARCHAR(100),
  
  -- Tier 2 specific (Scenario)
  scenario_name VARCHAR(200),
  complexity_level VARCHAR(10) CHECK (complexity_level IN ('High', 'Medium', 'Low')),
  topic_category VARCHAR(200),
  primary_emotions VARCHAR(300), -- Comma-separated
  special_considerations VARCHAR(500),
  
  -- Tier 3 specific (Edge Case)
  edge_case_type VARCHAR(100),
  boundary_being_tested VARCHAR(300),
  referral_type VARCHAR(300),
  crisis_level VARCHAR(10) CHECK (crisis_level IN ('High', 'Medium', 'Low')),
  
  -- Expert review
  expert_review_required VARCHAR(100), -- Comma-separated: Finance, Therapy, Legal
  
  -- Audit
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_tier ON conversations(tier);
CREATE INDEX idx_conversations_persona ON conversations(persona);
CREATE INDEX idx_conversations_emotion ON conversations(emotion);
CREATE INDEX idx_conversations_quality_score ON conversations(quality_score);
CREATE INDEX idx_conversations_generated_date ON conversations(generated_date DESC);
```

### Validation Logic

**Database Constraints:**
- If `tier = 'Template'`, then `template_type` must NOT be NULL
- If `tier = 'Scenario'`, then `scenario_name` must NOT be NULL
- If `tier = 'Edge Case'`, then `edge_case_type` must NOT be NULL

**Application-Level Validation:**
```typescript
function validateConversation(conversation: Conversation): ValidationResult {
  // Core fields required for all
  if (!conversation.conversation_id || !conversation.persona || !conversation.emotion || !conversation.topic || !conversation.tier) {
    return { valid: false, error: "Missing required core fields" };
  }
  
  // Tier-specific validation
  if (conversation.tier === 'Template' && !conversation.template_type) {
    return { valid: false, error: "Template tier requires template_type" };
  }
  
  if (conversation.tier === 'Scenario' && !conversation.scenario_name) {
    return { valid: false, error: "Scenario tier requires scenario_name" };
  }
  
  if (conversation.tier === 'Edge Case' && !conversation.edge_case_type) {
    return { valid: false, error: "Edge Case tier requires edge_case_type" };
  }
  
  return { valid: true };
}
```

---

## 8. UI Implementation Recommendations

### Filtering Logic

**Scenario: User filters by "Tier: Template"**
1. Query: `SELECT * FROM conversations WHERE tier = 'Template'`
2. Display columns: conversation_id, persona, emotion, topic, **template_type**, **emotional_start**, **emotional_end**, status, quality_score
3. Hide Tier 2/3 specific columns (scenario_name, edge_case_type, etc.)

**Scenario: User filters by "Tier: Scenario"**
1. Query: `SELECT * FROM conversations WHERE tier = 'Scenario'`
2. Display columns: conversation_id, persona, emotion, topic, **scenario_name**, **complexity_level**, **topic_category**, status, quality_score
3. Hide Tier 1/3 specific columns

**Scenario: User filters by "Tier: Edge Case"**
1. Query: `SELECT * FROM conversations WHERE tier = 'Edge Case'`
2. Display columns: conversation_id, persona, emotion, topic, **edge_case_type**, **boundary_being_tested**, **crisis_level**, status, quality_score
3. Hide Tier 1/2 specific columns

**Scenario: User views ALL tiers (no filter)**
1. Query: `SELECT * FROM conversations ORDER BY conversation_id`
2. Display columns: conversation_id, persona, emotion, topic, **tier**, status, quality_score
3. Show tier-specific columns only on row expand or in preview panel

### Column Configuration

**Default Table Columns (Always Visible):**
- conversation_id
- persona
- emotion
- topic
- tier
- status
- quality_score

**Conditionally Visible Columns (Based on Tier Filter):**
- **Tier 1:** template_type, emotional_start, emotional_end
- **Tier 2:** scenario_name, complexity_level, topic_category
- **Tier 3:** edge_case_type, boundary_being_tested, crisis_level

**Hidden in Table, Visible in Preview Panel:**
- persona_age, persona_income
- turn_count
- key_learning_objective
- expert_review_required
- generated_date, approved_by, approved_at
- reviewer_notes
- notes

---

## 9. Summary: Answers to Your Questions

### Q1: "What is the difference between Template, Scenario, Edge Cases?"

**Answer:** They are **different generation methodologies**, not different data structures:

- **Template:** Uses predefined emotional arc templates (structure is fixed, parameters vary)
- **Scenario:** Uses custom scenario descriptions (structure is flexible, scenarios unique)
- **Edge Case:** Uses boundary-testing prompts (structure focused on referrals/safety)

All three have prompt templates, but with different levels of prescriptiveness:
- Template prompts: Highly structured (turn sequence defined)
- Scenario prompts: Moderately flexible (emotional arc custom)
- Edge Case prompts: Boundary-focused (emphasize recognition and referral)

### Q2: "How can I label the parts of a conversation so all 100 can be listed in one table?"

**Answer:** Use a **union schema** with:
- **Core columns** (9) shared by all conversations
- **Tier-specific columns** (12 total: 3 for Tier 1, 5 for Tier 2, 4 for Tier 3) that are NULL for non-applicable tiers
- **Generation tracking columns** (6) for system state
- **Total: 29 columns** in normalized table

### Q3: "What variables differentiate each conversation?"

**Answer:** Minimum required identity:
1. `conversation_id` (1-100)
2. `persona` (user type)
3. `emotion` (primary emotional state)
4. `topic` (financial subject)
5. `tier` (Template / Scenario / Edge Case)

Plus tier-specific identifier:
- Tier 1: `template_type` (A-E)
- Tier 2: `scenario_name`
- Tier 3: `edge_case_type`

### Q4: "Why don't Scenarios and Edge Cases have prompt templates?"

**Answer:** **They DO have prompt templates!** All three tiers use prompt templates, but:
- **Tier 1 templates** are highly structured (turn-by-turn sequence)
- **Tier 2 templates** are flexible (scenario description + chunk context)
- **Tier 3 templates** are boundary-focused (referral language + crisis protocols)

The confusion comes from the spec document describing Tier 1 as "template-driven" (meaning it follows structured emotional arc templates), while Tiers 2-3 use different kinds of templates (scenario-based prompts and edge case prompts).

**All 100 conversations are generated using prompt templates—just different kinds of templates for different purposes.**

---

## 10. Next Steps

1. **Review the normalized CSV** (master-conversations-list-normalized-100_v1.csv) to see all 100 conversations in one table
2. **Implement the database schema** with the union structure (29 columns)
3. **Build the UI filtering logic** with conditional column visibility based on tier
4. **Create the generation API** that selects the appropriate prompt template based on tier
5. **Implement validation** ensuring tier-specific fields are populated correctly

The normalized structure provides maximum flexibility for the UI while maintaining complete data integrity and traceability back to the original tier-specific specifications.

