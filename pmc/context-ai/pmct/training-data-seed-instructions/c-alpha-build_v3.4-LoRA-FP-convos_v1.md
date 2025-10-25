# Financial Planner Emotional Intelligence Dataset
## First 10 Conversations Generation Prompt

**Document Purpose:** This document provides (1) actions James must complete before generation, and (2) a unified prompt for Claude Sonnet 4.5 to generate the first batch of 10 emotionally intelligent financial planner conversations for review.

**Created:** 2025-10-21  
**Version:** 1.0  
**Related Files:**
- JSON Format v2: `pmc/context-ai/pmct/c-alpha-build_v3.4_emotional-dataset-JSON-format_v2.json`
- Marcus Demo (Seed): `pmc/context-ai/pmct/c-alpha-build_v3.4_emotional-dataset-JSON-demo-marcus_v1.json`
- Financial Planner Seed Document: `system/chunks-alpha-data/financial-planner-demo-conversation-and-metadata_v1.txt`

---

## SECTION 1: JAMES' ACTION STEPS

Complete these actions before running the generation prompt. These are prerequisites that will improve generation quality.

### Action 1: Verify Seed Documents Are Accessible
**What:** Confirm you have access to these source files that the prompt references:
- `system/chunks-alpha-data/financial-planner-demo-conversation-and-metadata_v1.txt` (financial planner persona and sample conversations)
- `pmc/context-ai/pmct/c-alpha-build_v3.4_emotional-dataset-JSON-demo-marcus_v1.json` (complete annotated example)
- `pmc/context-ai/pmct/c-alpha-build_v3.4_emotional-dataset-JSON-format_v2.json` (updated JSON structure)

**Why:** The prompt instructs Claude to read these files. If they're inaccessible, generation will be incomplete.

### Action 2: Decide on Scenario Distribution for 10 Conversations
**What:** Choose how to distribute the 10 conversations across variables:

**Option A - Balanced Distribution:**
- 3 conversations with Marcus persona (Overwhelmed Avoider)
- 3 conversations with Jennifer persona (Anxious Planner)  
- 3 conversations with David persona (Pragmatic Optimist)
- 1 conversation with a fourth persona (new archetype to expand coverage)

**Option B - Focus on Diversity:**
- 2 conversations per persona (6 total)
- 4 conversations with new personas representing: young single professional, pre-retiree, single parent, small business owner

**Option C - Marcus-Heavy (Safest):**
- 5 conversations with Marcus variations (different topics, emotions, scenarios)
- 3 Jennifer conversations
- 2 David conversations

**Recommendation:** Option C for first batch - iterate on proven Marcus structure before expanding.

**Action Required:** Choose A, B, or C and note it when running the prompt.f

**Choice Documentation:** we will choose C: "Marcus-Heavy"

### Action 3: Define Quality Acceptance Criteria
**What:** Before reviewing the 10 conversations, define what "good enough to proceed to 100" means.

**Suggested Criteria:*
- [Yes] All emotional progressions feel authentic (no jarring emotional jumps)
- [Yes] Elena's voice is consistent across all conversations  
- [Yes] Response strategies are appropriately matched to user emotional states
- [Yes] At least 8/10 conversations have quality_score of 4 or 5
- [Yes] Financial advice is accurate (no mathematical errors or dangerous recommendations)
- [Yes] Diverse emotional coverage (not just anxiety/shame in all 10)

**Action Required:** Review and modify criteria above, check boxes during review phase.

### Action 4: Prepare Review Environment
**What:** Set up how you'll review the generated conversations.

**Recommended Setup:**
1. Create a review spreadsheet or document with columns:
   - Conversation ID
   - Persona
   - Primary Emotions Covered
   - Quality Score (1-5)
   - Issues Found
   - Keep/Revise/Discard Decision
**Spreadsheet Created:** here: `https://docs.google.com/spreadsheets/d/1rJHlxvYm2h_AUbPgV0KLEq5CwiV9beEwVRN3fOWjCRg/edit?usp=sharing`

2. Plan 2-3 hours for review (approximately 15-20 minutes per conversation)

3. Consider recruiting a reviewer with financial planning or counseling expertise for validation

**Action Required:** Create review template before generation.

### Action 5: Plan for Iteration
**What:** Decide how you'll handle issues found in the first 10.

**Decision Points:**
- If < 5 conversations are acceptable quality → revise prompt significantly and regenerate all 10
- If 5-7 are acceptable → regenerate only the weak ones with refined instructions  
- If 8+ are acceptable → proceed to generating remaining 90 with minor refinements

**Action Required:** Note your quality threshold for proceeding vs. re-generating.

---

## SECTION 2: UNIFIED GENERATION PROMPT FOR CLAUDE SONNET 4.5

**Instructions for James:** Copy everything from "BEGIN PROMPT" to "END PROMPT" below and paste into Claude Sonnet 4.5. If using Claude with extended thinking mode, enable it for best results.

---

**BEGIN PROMPT**

---


# Prompt Task: Generate 10 Emotionally Intelligent Financial Planner Training Conversations

## Context & Purpose

You are generating training data for a LoRA fine-tuning dataset that will teach modern LLMs to conduct emotionally intelligent conversations in a financial planning context. This is the first batch of 10 conversations for human review before scaling to 100+ conversations.

**Quality Standard:** These must be production-ready training examples that demonstrate frontier emotional intelligence in customer service AI. Each conversation must meet the quality bar established by the Marcus seed example (referenced below).

**Business Vertical:** Financial planning consultant serving mid-career professionals  
**Consultant Persona:** Elena Morales, CFP® - Pathways Financial Planning  
**Output Format:** JSON following the structure in `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4_emotional-dataset-JSON-format_v2.json`

---

## Required Reading - DO NOT SKIP

Before generating any conversations, you MUST thoroughly read and internalize these source documents:

### 1. The Complete Seed Example
**File:** `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4_emotional-dataset-JSON-demo-marcus_v1.json`

**What it contains:**
- A complete 4-turn conversation with Marcus Thompson
- Full emotional annotation at every turn
- Detailed response strategy selection and rationale
- Sentence-by-sentence breakdown of why each response works
- Training metadata and quality scoring4UU

**Why it matters:** This is your GOLD STANDARD. Every conversation you generate must match or exceed this level of:
- Emotional granularity in the `emotional_context` section
- Strategic thinking in the `response_strategy` section  
- Detailed analysis in the `response_breakdown` section
- Practical insight in the `training_metadata` section

**Study specifically:**
- How emotional indicators are identified from text cues
- How response strategies are selected based on emotional states
- How word choices are analyzed and justified
- How emotional progression is tracked across turns

### 2. The Consultant & Client Personas
**File:** `C:\Users\james\Master\BrightHub\brun\chunks-alpha\system\chunks-alpha-data\V2-LoRA-customer-emotions-financial-planner-seed_v1.txt`

**What it contains:**
- Elena Morales' complete background, philosophy, and communication style
- Three client personas: Marcus (Overwhelmed Avoider), Jennifer (Anxious Planner), David (Pragmatic Optimist)
- Sample conversations showing emotional patterns and response strategies
- The emotional range and response strategies that define Elena's approach

**Why it matters:** Elena's voice must be PERFECTLY consistent across all 10 conversations. Study:
- Her core principles (emotion-first, judgment-free, education-focused, progress over perfection)
- Her specific techniques (acknowledge emotions explicitly, use metaphors, celebrate small wins, normalize struggles)
- What she avoids (jargon, assumptions, judgment, overwhelming with options)
- How she adapts her approach to different emotional states

### 3. The JSON Format Structure
**File:** `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4_emotional-dataset-JSON-format_v2.json`

**What it contains:**
- Complete JSON schema with all required fields
- Descriptions of what each field represents
- Implementation notes and guidance
- Format improvements from earlier versions

**Why it matters:** You must populate ALL fields correctly. This is a training dataset - every field teaches the model something.

---

## Conversation Requirements

### Structural Requirements

**Number of Conversations:** 10 complete conversations  
**Turns per Conversation:** 3-5 turns (user and assistant alternating)  
**Starting Point:** All conversations start with user's first message  
**Conversation Length:** Each conversation should show a complete emotional arc with resolution or clear next steps

### Emotional Coverage Requirements

**CRITICAL:** The 10 conversations MUST collectively demonstrate diverse emotional territory. Do NOT generate 10 variations of shame/anxiety.

**Required Emotional States to Cover (spread across the 10):**
- Shame/embarrassment (1-2 conversations)
- Anxiety/worry (2-3 conversations, but different subtypes)
- Overwhelm/confusion (1-2 conversations)
- Relief/hope (as outcomes in 4-5 conversations)
- Regret (1 conversation)
- Excitement mixed with concern (1 conversation)  
- Determination/empowerment (as outcome in 2-3 conversations)
- Fear of judgment (1 conversation)
- Frustration/anger (1 conversation)
- Guilt (1 conversation)

**Secondary Emotional States to Include:**
- Self-doubt
- Vulnerability (breakthrough moments where user reveals deep concern)
- Skepticism
- Grief (financial loss context)
- Inadequacy (comparing to others)

**Emotional Progression:** Every conversation must show clear emotional progression. Map starting emotion → intermediate states → ending emotion.

### Scenario & Topic Coverage Requirements

**Financial Topics to Cover (each conversation focuses on 1-2):**
1. 401(k)/retirement planning basics
2. Emergency fund planning
3. Debt management (credit cards, student loans)
4. First-time home buying
5. Life insurance and protection planning
6. Divorce financial recovery
7. Career transition financial planning
8. Inheritance decisions
9. Investment choice paralysis
10. Balancing multiple financial goals

**Situational Contexts:**
- First-time chat interactions (trust building)
- Follow-up questions (building on previous context)
- Late night stress interactions (timestamps matter)
- Decision point conversations (user ready to act)
- Breakthrough moments (user reveals deep fear)

### Persona Distribution

**Marcus-Heavy - Recommended for First Batch:**
- 5 conversations with Marcus variations (different scenarios, emotions, topics)
- 3 conversations with Jennifer
- 2 conversations with David

**Why:** Marcus' structure is proven. Creating variations teaches the model his pattern deeply before expanding.


**Why:** Marcus' structure is proven. Creating variations teaches the model his pattern deeply before expanding.

**Variations on Marcus:** Same core persona (software engineer, avoidant pattern, shame-prone) but different scenarios:
- Turn 1: 401k confusion (existing seed)
- Turn 2: Stock options don't understand
- Turn 3: Emergency fund never started  
- Turn 4: Wife wants to buy house but he's scared
- Turn 5: Inherited money, feels guilty

**Jennifer Variations:** Anxious planner, divorce recovery
- Over-researching emergency fund amount
- Afraid to invest after financial betrayal
- Second-guessing insurance decisions

**David Variations:** Pragmatic optimist, teacher
- Balancing wedding costs with debt payoff
- House down payment strategy

### Response Strategy Requirements

**Each conversation must demonstrate 2-4 response strategies clearly.** Strategies to include across the 10:

**Core Strategies (must appear multiple times):**
- Empathic validation
- Normalize struggle
- Reframe to positive
- Break down complexity
- Quantify opportunity cost
- Provide concrete steps

**Advanced Strategies (include several):**
- Validate then correct catastrophic thinking
- Separate objective from subjective feelings
- Redirect from past regret to future action  
- Temporal reframing (can't change past, can change future)
- Offer education before giving it (ask permission)
- Name psychological patterns (choice paralysis, etc.)

**Avoid repeating the exact same strategic pattern across all 10.** For example, don't have every conversation follow: validate → reframe → provide numbers → offer steps. Mix up the patterns based on emotional states and conversation flow.

---

## Quality Standards & Annotation Depth

### Level of Detail Required

Your annotations must match the Marcus demo in depth and insight. This is NOT a surface-level exercise.

**For each turn, you must provide:**

1. **Emotional Context Analysis:**
   - Identify 2-3 detected emotions with confidence scores
   - List 4-6 specific textual indicators that reveal each emotion
   - Assess behavioral state (risk level, engagement readiness, knowledge level, trust level)
   - Create prioritized client needs hierarchy (3-4 needs with rationales)
   - Identify red flags if present (with implications and handling)
   - Track emotional progression from previous turn (turns 2+)

2. **Response Strategy Selection:**
   - Name primary strategy with detailed rationale (2-3 sentences explaining WHY)
   - List 2-3 secondary strategies
   - Specify tone selection with rationale
   - Define 5-8 tactical choices (what to do/avoid)
   - Optionally: provide 2-3 specific technique explanations

3. **Response Breakdown:**
   - Analyze EVERY sentence in the response
   - For each sentence: function, emotional purpose, technique, teaches_model, word_choice_rationale (3-5 key words/phrases explained)
   - Include psychological principles where relevant
   - Note stylistic choices (italics, bullets, paragraph breaks)

4. **Training Metadata:**
   - Define key learning objective (what should model learn from this example)
   - List 4-6 demonstrated skills
   - Set emotional progression target
   - Assign quality scores (empathy, clarity, appropriateness, brand voice)
   - Write reviewer notes (2-3 sentences of expert assessment)
   - Decide if this should be a seed example for variations

### Quality Calibration

**Use this calibration for quality_score:**
- **5 (Exceptional):** Gold standard example, use as seed, showcases multiple advanced skills, perfect emotional attunement
- **4 (Strong):** Highly effective, minor areas for improvement, demonstrates core skills well
- **3 (Adequate):** Meets requirements, but lacks sophistication or has noticeable weaknesses
- **2 (Weak):** Significant issues in emotional intelligence, strategy selection, or execution
- **1 (Poor):** Does not meet minimum standards

**Aim for:**
- 6-7 conversations scored as 5 (exceptional)
- 2-3 conversations scored as 4 (strong)  
- 0-1 conversations scored as 3 (adequate)

**Do not generate anything below 3.** If you find yourself creating a weak example, stop and revise it.

### Authenticity Standards

**Emotional Authenticity:**
- Emotions must progress naturally based on the assistant's responses
- No jarring emotional leaps (shame → joy in one turn is unrealistic)
- Mixed emotions are normal and expected (regret + motivation, anxiety + hope)
- Emotional intensity should modulate realistically

**Conversational Authenticity:**
- Users speak like real people (sentence fragments, "I don't know," uncertainty, typos optional but realistic)
- Users reveal information gradually, not all at once
- Users have realistic knowledge gaps and misconceptions
- Users show personality (Marcus' self-deprecation, Jennifer's hypervigilance, David's enthusiasm)

**Financial Authenticity:**
- All financial advice must be sound and accurate
- Numbers should be realistic for the personas' income/situation
- Tax and legal implications should be handled appropriately (with disclaimers)
- No dangerous advice (e.g., "take out a loan to invest in crypto")

---

## Specific Generation Instructions

### Step 1: Plan the Portfolio
Before writing any conversations, create a planning matrix:

| Conversation | Persona | Financial Topic | Primary Emotions | Starting Emotion | Ending Emotion | Key Strategies | Turns |
|--------------|---------|-----------------|------------------|------------------|----------------|----------------|-------|
| 1 | Marcus | 401k basics | Shame, anxiety | Shame (0.75) | Relief (0.55) | Validate, reframe, simplify | 4 |
| 2 | Marcus | Stock options | Overwhelm, fear | Overwhelm (0.80) | Clarity (0.60) | Break down, normalize, educate | 3 |
| ... | ... | ... | ... | ... | ... | ... | ... |

**Ensure diversity across:**
- Emotions (no more than 2 conversations starting with same emotion)
- Topics (no duplicates)
- Turn counts (mix of 3, 4, and 5 turn conversations)
- Conversation phases (some trust building, some breakthrough moments, some action planning)

### Step 2: Generate Each Conversation Sequentially

**For each conversation:**

1. **Review the persona** from the seed document
2. **Imagine the scenario** - What brought this user to chat? What time of day? What's their emotional state?
3. **Write the user's first message** - Make it authentic to the persona and emotional state
4. **Analyze the emotional context** - What cues reveal their emotions? What do they need?
5. **Select response strategy** - What approach fits their emotional state and needs?
6. **Write Elena's response** - Channel her voice, principles, and style
7. **Break down the response** - Analyze every sentence, word choice, technique
8. **Continue for remaining turns** - Show emotional progression, strategy adaptation
9. **Complete all metadata** - Quality scores, learning objectives, reviewer notes

### Step 3: Review for Elena Voice Consistency

After generating all 10, review for consistency:

**Elena's voice must always:**
- Acknowledge emotions explicitly and early
- Normalize struggles with phrases like "incredibly common," "makes complete sense"
- Use concrete numbers over abstractions  
- Break complex topics into simple steps
- Celebrate existing positive actions
- Ask permission before educating
- End with safety/no judgment reassurance

**Elena never:**
- Uses jargon without explaining it
- Assumes the user "should know" something
- Rushes to solutions before addressing emotions
- Provides multiple options without guidance
- Uses formal/distant language

**Check:** If you removed the name "Elena" and read all 10 conversations, would you recognize them as the same person? They should have a unified voice.

### Step 4: Verify Diversity

**Create a diversity checklist:**
- [ ] At least 7 different primary emotions across the 10 opening messages
- [ ] At least 8 different financial topics
- [ ] Mix of conversation lengths (3-5 turns)
- [ ] Range of emotional intensities (0.4 to 0.9)
- [ ] Both simple and complex scenarios
- [ ] Both first-time interactions and follow-ups
- [ ] Multiple response strategies demonstrated (not just 3-4 repeated)

---

## Output Format & Structure

### File Organization

**We will use: Option A - Single File (Recommended for Review):**
Create one JSON file with this structure:

```json
{
  "dataset_metadata": {
    "dataset_name": "financial_planning_emotional_intelligence_first_batch",
    "version": "1.0.0",
    "created_date": "2025-10-21",
    "vertical": "financial_planning_consultant",
    "consultant_persona": "Elena Morales, CFP - Pathways Financial Planning",
    "target_use": "LoRA fine-tuning for emotionally intelligent chatbot",
    "conversation_source": "synthetic_expert_authored",
    "quality_tier": "seed_dataset_first_batch",
    "total_conversations": 10,
    "total_turns": 38
  },
  
  "consultant_profile": {
    [Elena's full profile - copy from Marcus demo]
  },
  
  "conversations": [
    {
      "conversation_metadata": {
        "conversation_id": "fp_marcus_002",
        "conversation_number": 1,
        "persona": "Marcus Thompson - The Overwhelmed Avoider",
        "scenario": "Stock options confusion from recent promotion",
        "total_turns": 3
      },
      "training_pairs": [
        [Turn 1 complete structure],
        [Turn 2 complete structure],
        [Turn 3 complete structure]
      ]
    },
    [... 9 more conversations ...]
  ]
}
```

### Naming Conventions

**Conversation IDs:**
- Format: `fp_[persona_shortname]_[number]`
- Examples: `fp_marcus_002`, `fp_jennifer_001`, `fp_david_003`

**Turn IDs:**
- Format: `[conversation_id]_turn[number]`  
- Examples: `fp_marcus_002_turn1`, `fp_marcus_002_turn2`

### Required Fields - Do Not Skip

Every turn must include ALL of these sections:
- `id`
- `conversation_id`
- `turn_number`
- `conversation_metadata`
- `system_prompt`
- `conversation_history`
- `current_user_input`
- `emotional_context` (with all subsections)
- `response_strategy` (with all subsections)
- `target_response`
- `response_breakdown` (with all sentences analyzed)
- `expected_user_response_patterns`
- `training_metadata` (with all quality scores)

**Optional but recommended:**
- `emotional_progression` (for turns 2+)
- `specific_techniques` in response_strategy
- `psychological_principle` in sentence analysis
- `variation_guidance` in training_metadata

---

## Emotional Intelligence Framework Reference

### Goleman's Emotional Intelligence Components

Use these as your framework for emotional analysis:

**Self-Awareness:**
- Emotional self-awareness
- Accurate self-assessment  
- Self-confidence

**Self-Regulation:**
- Self-control
- Trustworthiness
- Conscientiousness
- Adaptability

**Social Awareness:**
- Empathy (critical for this project)
- Service orientation
- Organizational awareness

**Relationship Management:**
- Developing others
- Influence
- Communication
- Conflict management

### Emotion Labels - Use Consistently

**Primary Emotions (use these labels):**
- shame
- anxiety
- fear
- overwhelm
- confusion
- frustration
- anger
- regret
- guilt
- sadness
- grief
- relief
- hope
- excitement
- determination
- empowerment
- gratitude
- confidence
- clarity
- motivation

**Emotional Intensities:**
- 0.0-0.3: Low intensity
- 0.4-0.6: Moderate intensity
- 0.7-0.8: High intensity
- 0.9-1.0: Extreme intensity

**Valence Descriptors:**
- negative
- mixed_negative (mostly negative with hints of positive)
- neutral
- mixed_positive (mostly positive with hints of concern)
- positive

---

## Common Pitfalls to Avoid

### Emotional Intelligence Mistakes

❌ **Surface-level emotion detection:** "User seems frustrated"
✅ **Deep emotion detection:** "Primary: frustration (0.75), evidenced by time pressure language ('already wasted'), self-blame ('I should have'), and urgency markers. Secondary: shame (0.60) from self-deprecating language."

❌ **Generic validation:** "I understand you're stressed"
✅ **Specific validation:** "That fear of making an irreversible mistake makes complete sense—and I want to acknowledge that what you're describing (freezing when faced with too many options) is incredibly common."

❌ **Strategy mismatch:** User expresses deep shame, assistant jumps to education
✅ **Strategy alignment:** User expresses shame, assistant validates immediately, normalizes explicitly, THEN offers education

### Response Quality Mistakes

❌ **Telling without asking:** "Here's what you should do..."
✅ **Asking permission:** "Would it be helpful if I explained what a company match actually means in real dollars for you?"

❌ **Multiple options causing paralysis:** "You could do A, B, or C, depending on..."
✅ **Simplified choice:** "Here's the simplest answer for most people your age: Look for the Target Date 2050 fund. That's it. One fund. No complexity."

❌ **Abstract advice:** "You should increase your emergency fund"
✅ **Concrete advice:** "You have 8 months saved right now, which is excellent—better than 85% of Americans."

### Annotation Mistakes

❌ **Vague teaching notes:** "This validates the user"
✅ **Specific teaching notes:** "teaches_model: when_user_says_'stupid'_immediately_contradict_with_'no_stupid_questions'"

❌ **Missing rationales:** Lists word choices without explaining why
✅ **Complete rationales:** "Word choice: 'actually ahead' - introduces surprising positive fact that contradicts user's negative self-assessment"

❌ **Incomplete sentence breakdown:** Only analyzes 2-3 sentences when response has 6
✅ **Complete sentence breakdown:** Analyzes every single sentence with function, emotional purpose, technique, and word choice rationale

---

## Final Quality Check

Before submitting your 10 conversations, verify:

### Completeness Check
- [ ] All 10 conversations are complete
- [ ] Every turn has all required fields populated  
- [ ] No placeholder text or "TODO" markers
- [ ] All JSON is valid (proper quotes, commas, brackets)
- [ ] Every sentence in target_response is analyzed in response_breakdown

### Diversity Check
- [ ] At least 7 different starting emotions across the 10
- [ ] At least 8 different financial topics
- [ ] Mix of 3, 4, and 5-turn conversations
- [ ] Multiple response strategies demonstrated (not just 3-4 repeated)
- [ ] Range of emotional intensities (not all high-anxiety)

### Quality Check  
- [ ] 6+ conversations scored as quality_score 5
- [ ] 2-3 conversations scored as quality_score 4
- [ ] 0-1 conversations scored as quality_score 3
- [ ] Zero conversations scored below 3
- [ ] All reviewer_notes are substantive (2-3 sentences of expert assessment)

### Elena Voice Check
- [ ] Consistent philosophy across all 10 (emotion-first, judgment-free, education-focused)
- [ ] Consistent techniques (normalize, concrete numbers, celebrate progress, ask permission)
- [ ] Consistent tone (warm but professional, never condescending)
- [ ] No instances of jargon without explanation
- [ ] No instances of rushing to solutions before emotions

### Authenticity Check
- [ ] All emotional progressions feel natural (no jarring leaps)
- [ ] All user messages sound like real people (not AI-generated)
- [ ] All financial advice is accurate and safe
- [ ] All numbers are realistic for the personas' situations
- [ ] Mixed emotions appear naturally (regret + motivation, anxiety + hope)

---

## Output Delivery

**When complete, provide:**

1. **The JSON file(s)** with all 10 conversations following the format in `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4_emotional-dataset-JSON-format_v2.json`

2. **A summary table** with this format:

| # | ID | Persona | Topic | Start Emotion | End Emotion | Turns | Quality | Notable Features |
|---|----|---------| ------|---------------|-------------|-------|---------|------------------|
| 1 | fp_marcus_002 | Marcus | Stock options | Overwhelm (0.80) | Clarity (0.60) | 3 | 5 | Excellent normalization of complexity, concrete breakdown |
| 2 | ... | ... | ... | ... | ... | ... | ... | ... |

3. **A brief reflection (3-5 paragraphs)** addressing:
   - What emotional territory is well-covered in these 10?
   - What emotional territory is still missing?
   - What worked well in the generation process?
   - What should be adjusted when scaling to the next 90?
   - Any concerns or questions about the format or approach?


4. **Write the file to:** `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-convo-10-first_v1.json` 
For any addendums, strategy, or follow up write to `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-convo-10-first_v1-documentation.md` 
---

**END PROMPT**


---

## SECTION 3: POST-GENERATION REVIEW GUIDE

Use this after Claude generates the 10 conversations.

### Review Process

**Phase 1: Structural Review (30 minutes)**
1. Validate JSON syntax (use a JSON validator)
2. Check all required fields are present
3. Verify conversation IDs and turn numbering are sequential
4. Confirm no placeholder text remains

**Phase 2: Quality Review (90-120 minutes)**  
For each conversation:

1. **Read the user messages** - Do they sound authentic? Is the persona consistent?

2. **Read Elena's responses** - Is her voice consistent? Does she follow her principles?

3. **Check emotional progression** - Does it flow naturally from turn to turn?

4. **Verify financial accuracy** - Are numbers realistic? Is advice sound?

5. **Assess annotation depth** - Is the emotional_context and response_breakdown as detailed as the Marcus demo?

6. **Score overall** - Does this meet the quality bar? Keep/Revise/Discard?

### Decision Matrix

**If 8-10 conversations are quality score 4-5:**
→ ✅ Proceed to generating the next 90 conversations  
→ Use learnings from any weak conversations to refine prompts

**If 5-7 conversations are quality score 4-5:**
→ ⚠️ Regenerate the weak conversations with specific improvements noted  
→ Review the pattern of what worked vs. what didn't
→ Refine prompt sections that led to weaker outputs

**If fewer than 5 conversations are quality score 4-5:**
→ ❌ Do not proceed - significant prompt revision needed
→ Analyze root causes: Was emotional analysis shallow? Was Elena's voice inconsistent? Were scenarios unrealistic?
→ Revise the prompt with more specific guidance on problem areas  
→ Regenerate all 10 with revised prompt

### Common Issues & Fixes

**Issue:** Emotional annotations are shallow (just naming emotions without analysis)  
**Fix:** In next generation, emphasize the Marcus demo sentence: "Study specifically how emotional indicators are identified from text cues"

**Issue:** Elena's voice is inconsistent (sometimes too formal, sometimes uses jargon)
**Fix:** Add to prompt: "Before writing each response, re-read Elena's communication style section"

**Issue:** Response breakdowns don't analyze every sentence  
**Fix:** Add explicit instruction: "Count the sentences in target_response. Your response_breakdown must have exactly that many sentence objects."

**Issue:** Financial advice has errors  
**Fix:** Add validation step: "After writing financial numbers, verify calculations. Show your math."

**Issue:** Scenarios feel repetitive (all shame/anxiety about retirement)
**Fix:** More explicit diversity requirements in the planning matrix step

---

## APPENDIX: Quick Reference Checklist

**Before Running Generation:**
- [ ] Verified all seed documents are accessible
- [ ] Decided on persona distribution (Option A, B, or C)
- [ ] Defined quality acceptance criteria  
- [ ] Created review template/spreadsheet
- [ ] Allocated 3-4 hours for generation review

**While Reviewing Output:**
- [ ] JSON validates syntactically
- [ ] All required fields present and populated
- [ ] 10 conversations total, each with 3-5 turns
- [ ] Diverse emotions (at least 7 different starting emotions)
- [ ] Diverse topics (at least 8 different financial topics)
- [ ] Elena's voice is consistent
- [ ] Emotional progressions feel natural
- [ ] Financial advice is accurate
- [ ] Annotation depth matches Marcus demo
- [ ] Quality scores: 6+ rated as 5, 2-3 rated as 4

**Decision Point:**
- [ ] Keep count: ____/10 conversations
- [ ] Revise count: ____/10 conversations  
- [ ] Discard count: ____/10 conversations
- [ ] **Overall decision:** Proceed to 90 / Regenerate weak ones / Major revision needed

---

**End of Document**

**Next Steps After Review:**
1. Document learnings from first 10 in a review summary
2. Refine prompt based on issues found
3. Generate next batch (suggest 20-30 at a time for quality control)
4. Repeat review and refinement process
5. After 40-50 high-quality conversations, consider synthetic expansion of best examples

