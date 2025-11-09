# First 10 Conversations: Production Process Tutorial (v2)

Purpose: Generate and assemble the first 10 emotionally intelligent financial planning conversations with strict structure, full-path inputs, and clear begin/end prompt blocks.

## Quick Path Index (Absolute)
- Persona demo: `C:\Users\james\Master\BrightHub\brun\chunks-alpha\system\chunks-alpha-data\financial-planner-demo-conversation-and-metadata_v1.txt`
- Gold standard demo (Marcus JSON): `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4_emotional-dataset-JSON-demo-marcus_v1.json`
- JSON format v2: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds-ephemera\c-alpha-build_v3.4_emotional-dataset-JSON-format_v2.json`
- Strategies taxonomy: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds-ephemera\c-alpha-build_v3.4_emotional-dataset-response-strategies.md`
- Unified prompt (first 10 convos): `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-convos_v1.md`
- Process docs: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-convo-steps_v1.md`, `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-convo-steps_v2.md`
- Carryover doc: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-convo-steps-carryover_v1.md`
- Generation plan: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-generation_v3.md`
- Status: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\GENERATION-COMPLETE-STATUS.md`
- Conversation 10 summary: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-CONVERSATION-10-COMPLETION-SUMMARY.md`
- Reference outputs (per-conversation files):
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json`
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-02-complete.json`
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-03-complete.json`
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-04-complete.json`
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-05-complete.json`
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-06-complete.json`
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-07-complete.json`
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-08-complete.json`
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-09-complete.json`
  - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json`

---

## Prompt Block — Generate First 10 Conversations

=== BEGIN PROMPT FP: LoRA-FP-First-10 ===

Title
- LoRA FP — First 10 Conversations (Production Seed)

Context Summary
- Generate emotionally intelligent, multi-turn conversations for Elena Morales (CFP), with full emotional annotations, response strategies, and production-ready JSON per the v2 schema.
- Follow gold-standard quality (Marcus demo) and unified prompt requirements for coverage and consistency.

Inputs (Absolute Paths)
- Persona demo: `C:\Users\james\Master\BrightHub\brun\chunks-alpha\system\chunks-alpha-data\financial-planner-demo-conversation-and-metadata_v1.txt`
- Gold example: `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4_emotional-dataset-JSON-demo-marcus_v1.json`
- JSON format v2: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds-ephemera\c-alpha-build_v3.4_emotional-dataset-JSON-format_v2.json`
- Strategies taxonomy: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds-ephemera\c-alpha-build_v3.4_emotional-dataset-response-strategies.md`
- Unified prompt: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seed-instructions\c-alpha-build_v3.4-LoRA-FP-convos_v1.md`

Action Steps
1. Read persona demo, gold example, JSON v2, and strategies taxonomy. Purpose: set quality bar and ensure structure.
2. Open unified prompt and prepare scenario/persona mix. Purpose: enforce coverage, emotional progression, and strategy diversity.
3. For each conversation (01–10), generate 3–5 turns with full annotations. Purpose: produce training-ready pairs.
4. Save each conversation as a separate file under `training-data-seeds` (paths below). Purpose: respect line limits and pipeline consistency.
5. Validate against JSON v2 and QA checklist before marking complete. Purpose: ensure 5/5 production quality.

Output Files (Absolute Targets)
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-02-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-03-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-04-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-05-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-06-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-07-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-08-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-09-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json`

Final Output Format (Wrap JSON in explicit markers)

=== BEGIN OUTPUT FORMAT FP ===

```json
{
  "dataset_metadata": {
    "dataset_name": "financial_planning_emotional_intelligence_conversation_[N]",
    "version": "1.0.0",
    "created_date": "2025-10-22",
    "vertical": "financial_planning_consultant",
    "consultant_persona": "Elena Morales, CFP - Pathways Financial Planning",
    "target_use": "LoRA fine-tuning for emotionally intelligent chatbot",
    "conversation_source": "synthetic_expert_authored",
    "quality_tier": "seed_dataset",
    "total_conversations": 1,
    "total_turns": [NUMBER_OF_TURNS],
    "notes": "[conversation_id] - [topic description]"
  },
  "consultant_profile": { /* Elena profile and style */ },
  "training_pairs": [
    { /* turn 1 with full fields per v2 format */ },
    { /* turn 2 */ }
  ]
}
```

=== END OUTPUT FORMAT FP ===

=== END PROMPT FP: LoRA-FP-First-10 ===

---

## Prompt Block — Optional Extraction Correction (01–03 from Batch)

=== BEGIN PROMPT FP: Extract-01-03 ===

Title
- LoRA FP — Extract Conversations 1–3 into Single Files

Context Summary
- If conversations 1–3 are embedded in a batch file, split and save as single-conversation files to match the training pipeline and file size limits.

Source Files (Absolute Paths)
- Batch: `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-convo-10-first_v1.json`
- Overflow: `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-convo-03-part2.json`
- Template reference: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-04-complete.json`

Action Steps
1. Extract convo 1 and 2 fully from batch; save using targets below. Purpose: standardize per-conversation format.
2. Merge convo 3 turn 1 (batch) with turns 2–4 (overflow); save as single file. Purpose: restore completeness and consistency.
3. Validate against template reference for structure and fields. Purpose: ensure schema compliance.

Output Files (Absolute Targets)
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-02-complete.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-03-complete.json`

=== END PROMPT FP: Extract-01-03 ===

---

## QA Checklist (Run for each conversation)
- Structure matches v2 schema; all required fields present
- Emotional context and indicators documented; intensities set
- Strategy rationale explicit and appropriate to the turn
- Elena’s voice: warm, judgment-free, permission-based education
- Multi-turn coherence and emotional progression present
- File size ≤ 1,500 lines; naming convention correct
- Human review notes in `training_metadata`; zero placeholders