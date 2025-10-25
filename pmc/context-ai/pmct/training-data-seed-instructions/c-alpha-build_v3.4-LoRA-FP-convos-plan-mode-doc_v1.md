# Generate 10 LoRA Financial Planning Training Conversations

## Overview

Create 10 complete, deeply-annotated conversations between Elena Morales (financial planner) and various clients, demonstrating frontier emotional intelligence. Each conversation must match the quality and depth of the Marcus seed example.

## Phase 1: Portfolio Planning & Architecture

### Design the 10-Conversation Portfolio

Before writing any conversations, create a strategic planning matrix covering:

**Diversity Requirements:**

- **Personas:** 5 Marcus variations, 3 Jennifer variations, 2 David variations
- **Topics:** 10 different financial topics (no duplicates)
- **Emotions:** 7+ different starting emotions, full range from shame to excitement
- **Turn counts:** Mix of 3-turn (3-4 convos), 4-turn (4-5 convos), 5-turn (2-3 convos)
- **Conversation phases:** Trust building, breakthrough moments, action planning
- **Response strategies:** 8+ different primary strategies demonstrated

**Planning Matrix Format:**

| # | ID | Persona | Topic | Start Emotion | End Emotion | Turns | Primary Strategy | Notable Feature |

**Key Files for Reference:**

- Marcus demo: `pmc\context-ai\pmct\c-alpha-build_v3.4_emotional-dataset-JSON-demo-marcus_v1.json`
- Persona details: Already read into context
- Format schema: Already read into context

## Phase 2: Generate Each Conversation

For each of the 10 conversations, follow this rigorous process:

### Per-Conversation Generation Steps

**Step 1: Setup & Context**

- Define client persona variation (background, income, specific situation)
- Establish session context (time of day, stress indicators, interaction history)
- Identify the core emotional territory to explore

**Step 2: Turn-by-Turn Development**

For each turn (3-5 turns per conversation):

**User Message Creation:**

- Write authentic user message matching persona voice
- Include realistic language patterns (fragments, uncertainty, typos if appropriate)
- Embed emotional indicators naturally in text
- Show emotional progression from previous turn

**Emotional Context Analysis:**

- Detect 2-3 emotions with confidence scores (0-1 scale)
- List 4-6 specific textual indicators for each emotion
- Assess behavioral state (risk level, engagement, knowledge, trust)
- Create prioritized needs hierarchy (3-4 needs with rationales)
- Identify red flags if present (with handling strategies)
- Track emotional progression from previous turn (turns 2+)

**Response Strategy Selection:**

- Choose primary strategy with detailed rationale (2-3 sentences)
- List 2-3 secondary strategies
- Select tone with rationale
- Define 5-8 tactical choices (what to do/avoid)
- Optionally add 2-3 specific technique explanations

**Elena's Response Creation:**

- Channel Elena's voice consistently (warm, professional, judgment-free)
- Implement selected strategies
- Use concrete numbers over abstractions
- Ask permission before educating
- Celebrate existing progress
- End with safety/support

**Response Breakdown:**

- Analyze EVERY sentence in the response
- For each sentence provide:
  - Function (what it does)
  - Emotional purpose (emotional goal)
  - Technique used
  - What it teaches the model
  - Word choice rationale (3-5 key words/phrases explained)
  - Optional: psychological principle, stylistic notes

**Training Metadata:**

- Define key learning objective
- List 4-6 demonstrated skills
- Set emotional progression target
- Assign quality scores (empathy, clarity, appropriateness, brand voice: 1-5 scale)
- Write substantive reviewer notes (2-3 sentences)
- Mark if seed example worthy

**Step 3: Conversation Assembly**

- Compile all turns into complete conversation structure
- Verify conversation_history builds correctly across turns
- Ensure emotional progression is realistic and trackable
- Confirm Elena's voice is consistent throughout

## Phase 3: Quality Assurance

### Conversation-Level Quality Checks

For each conversation:

- ✅ All required fields populated (no TODOs or placeholders)
- ✅ Every sentence in target_response analyzed in response_breakdown
- ✅ Emotional progression is natural (no jarring leaps)
- ✅ Financial advice is accurate and safe
- ✅ Numbers are realistic for persona's situation
- ✅ Elena's voice consistent with her core principles

### Portfolio-Level Quality Checks

Across all 10 conversations:

- ✅ At least 7 different starting emotions
- ✅ 10 different financial topics (no duplicates)
- ✅ 6+ conversations scored as quality 5 (exceptional)
- ✅ 2-3 conversations scored as quality 4 (strong)
- ✅ Mix of conversation lengths (3, 4, 5 turns)
- ✅ Multiple response strategies (not just 3-4 repeated)
- ✅ Range of emotional intensities (0.4 to 0.9)

### Elena Voice Consistency Check

- ✅ Always acknowledges emotions explicitly
- ✅ Always normalizes struggles
- ✅ Uses concrete numbers not abstractions
- ✅ Asks permission before educating
- ✅ Never uses jargon without explanation
- ✅ Never rushes to solutions before emotions

## Phase 4: Dataset Assembly & Documentation

### Create Final JSON File

**File:** `c-alpha-build_v3.4-LoRA-FP-convo-10-first_v1.json`

**Structure:**

```json
{
  "dataset_metadata": { ... },
  "consultant_profile": { ... },
  "conversations": [
    {
      "conversation_metadata": { ... },
      "training_pairs": [ ... ]
    }
    // ... 9 more conversations
  ]
}
```

### Create Documentation File

**File:** `c-alpha-build_v3.4-LoRA-FP-convo-10-first_v1-documentation.md`

**Contents:**

1. **Summary Table** with all 10 conversations showing:

   - ID, Persona, Topic, Start/End Emotions, Turns, Quality Score, Notable Features

2. **Diversity Analysis:**

   - Emotional coverage breakdown
   - Topic coverage list
   - Strategy distribution
   - Turn count distribution

3. **Reflection (3-5 paragraphs):**

   - What emotional territory is well-covered?
   - What emotional territory is still missing?
   - What worked well in the generation process?
   - What should be adjusted for the next 90?
   - Any concerns or questions?

4. **Quality Score Breakdown:**

   - How many 5s, 4s, 3s
   - Rationale for scoring decisions

## Key Success Criteria

**Quality Standards:**

- Match Marcus demo depth and insight throughout
- 6-7 conversations scored as 5 (exceptional)
- Zero conversations below quality 3
- All reviewer notes are substantive expert assessments

**Authenticity Standards:**

- All user messages sound like real people
- Emotional progressions are natural
- Financial advice is accurate
- Numbers realistic for personas

**Annotation Standards:**

- Every field has thoughtful, specific content
- Word choice rationales explain WHY specific words work
- Teaching notes identify clear patterns for model
- Psychological principles noted where relevant

## Implementation Notes

**Estimated Scope:**

- 10 conversations × average 4 turns = 40 complete training pairs
- Each training pair requires ~30-40 fields of detailed annotation
- Total: Approximately 1,200-1,600 individual data points to generate

**Elena's Voice Checklist (apply to every response):**

- ✅ Emotion acknowledged explicitly
- ✅ Struggle normalized with phrases like "incredibly common"
- ✅ Concrete numbers provided
- ✅ Complex topics broken into simple steps
- ✅ Existing actions celebrated
- ✅ Permission asked before educating
- ✅ Safety/no judgment reinforced

**Persona Voice Consistency:**

- **Marcus:** Apologetic, self-deprecating, technical mind blocked by shame
- **Jennifer:** Hypervigilant, over-researching, seeking reassurance
- **David:** Enthusiastic, direct, pragmatic, values-focused

This plan ensures production-ready training data that demonstrates frontier emotional intelligence in financial planning conversations.