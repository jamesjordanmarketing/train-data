First read both of these files:

`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-convo-steps_v1.md`
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-convo-steps-carryover_v1.md`

So you have the context of this project.

We need to execute Step S3 (which is shown below)
In order to do that we have to give the ai agent the full context of JSON, project specifics, customization,  who will create the standardized LLM prompts for each tier type.

I want you to write a full spec on HOW to write the prompts.
Meaning I need you to collect all the relevant context for this task.

We have created many files, and I am no longer sure what data exactly you need to produce the high quality reports. Here are more of the documents we have that may help you provide:

`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json` (most recent seed file of first "10")
system\chunks-alpha-data\financial-planner-demo-conversation-and-metadata_v1.txt (first persona profiles...do we need more personas first before the next dataset creation prompts?)
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4_emotional-dataset-emotional-taxonomy.md`
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-COMPLETE-DATASET-SUMMARY.md`
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-convos-plan-mode-doc_v1.md`
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\product\01-bmo-overview.md` (full product overview)
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-generation_v3.md`
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\GENERATION-COMPLETE-STATUS.md`
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-generation_history_v1.md`

So read all of these so you have ALL the context needed to create 1 document that will instruct the next agent to create all of the prompts as described above.
the instructions below are more of a summary. One of the files above should have a more robust description of all the prompt types.

Make sure to
1. Write the output file to `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`
2. Include the prompt(s) that I will submit to the Claude-4.5-sonnet Thinking LLM to execute the product build and coding changes. I must be able to cut and paste these prompts into a 200k Claude-4.5-sonnet Thinking context window in Cursor.

3. Make sure as you write the specification you don't leave any important context, direction, or instruction, outside of the prompts. Because the building agent will only see the information that is in the prompt(s)
Organize the successive prompts so that each one can be executed in a new 200k token context window

4. If more than one prompt(s) are needed to use the Claude-4.5-sonnet Thinking LLM to execute the product build and coding changes, I must be able to cut and paste these prompts into a 200k Claude-4.5-sonnet Thinking context window in Cursor. They should be modular, so that the subsequent prompt does not need to finish the prior component.

5. Do NOT include the same code/query/details outside the prompt sections if they same information is in the prompts. It gets confusing as to which blocks I am to copy and paste.

6. Make very clear what sections I must cut and paste (sql or prompt). At the beginning of what I must cut put a row of ======================== plus 3 new lines after the ====== line. At the end of what I must cut put a row of +++++++++++++++++ plus 3 new lines after the +++++++ line.

### Step S3: Generation Prompt Templates 

**Objective:** Create standardized LLM prompts for each tier type

**Prerequisites:**
- Step S2 complete
- Access to Phase 1 conversation quality examples
- Understanding of JSON format requirements

**Actions:**

1. **Create Tier 1 Template Prompts** (5 prompt files)
   - `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\tier1-template\tier1-template-A-prompt.txt` (Confusion→Clarity)
   - `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\tier1-template\tier1-template-B-prompt.txt` (Shame→Acceptance)
   - `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\tier1-template\tier1-template-C-prompt.txt` (Couple Conflict→Alignment)
   - `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\tier1-template\tier1-template-D-prompt.txt` (Anxiety→Confidence)
   - `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\tier1-template\tier1-template-E-prompt.txt` (Grief/Loss→Healing)
   
   **Each prompt includes:**
   - Reference to gold standard conversation from Phase 1
   - Structural pattern to follow (turn sequence)
   - Variable placeholders: [TOPIC], [PERSONA_AGE], [INCOME], [EMOTION_START]
   - Elena voice principles to maintain
   - Quality standards (annotation depth, sentence analysis)
   - Output format specification (JSON schema)

2. **Create Tier 2 Scenario Prompt Template**
   - `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\tier2-scenario\tier2-scenario-prompt-template.txt`
   - More flexible structure than Tier 1
   - Emphasis on custom emotional arc
   - Complexity handling guidelines
   - Expert consultation flags

3. **Create Tier 3 Edge Case Prompt Template**
   - `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\tier3-edge\tier3-edge-prompt-template.txt`
   - Boundary maintenance emphasis
   - Referral language templates
   - Crisis protocol integration
   - Legal/ethical guardrails

4. **Create Quality Checklist Document**
   - `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\quality-review\generation-quality-checklist.md`
   - All required fields listed
   - Annotation depth requirements
   - Elena voice consistency markers
   - Common errors to avoid

**Outputs:**
- ✅ 7 prompt template files created
- ✅ Quality checklist document
- ✅ Ready for repeatable generation

Remember to write the output file to: Write the output file to `C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`
