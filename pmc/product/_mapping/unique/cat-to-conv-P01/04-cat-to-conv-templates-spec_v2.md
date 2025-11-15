# Regarding: The Templates Implementation Spec here: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\04-categories-to-conversation-templates_spec_v1.md`

Read the current overview for a full context:
C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\04-categories-to-conversation-strategic-overview_v1.md
Then read the connections and changes we made here: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\04-categories-to-conversation-pipeline_spec_v1.md`. This is complete and coded.

Fully understand the codebase of this application located here:

* `C:\Users\james\Master\BrightHub\brun\train-data\src\`

So we need to update: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\04-categories-to-conversation-templates_spec_v1.md` to map to the current code implementation and include some important additional requirements.

---

## Important Additional Requirements

### 1. Prompt Templates

We don't actually have our prompt templates. We need to build them. Lets do this with high quality BEFORE we implement the Templates functionality build.
They are to be derived and extrapolated from: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`

What do we need to do:
a. Produce the exact prompts with the resilient format/location/structure and the variables placeholders in all appropriate places in the location to allow the Conversation Generation engine to populate a template and then use that specific prompt to submit to the Claude api.
b. Determine the actual architecture and implementation needed for the storage and interfaces of the actual templates.

* Is the table prompt_templates intended to contain the actual prompt templates too? Should it? Is it appropriate?
* If not where? Let's define this for a reliable solution

The prompt instances during a project need to have the Claude API return the Conversation files in a way that they can me routed to their proper Supabase Storage Blog location which persists in access to the system.
These Emotionally Intelligent Conversation JSON file deliverables will be large. Can easily be over 10,000 lines of JSON.
The file output specification is a separate spec. However design the prompt responses as a robust reliable hand off to the file output system.

---

### 2. Current Input Variables

Let's first check if the current prompts (and by extension the JSON Conversations Output data) only require the following inputs:

* Personas (Marcus-type, Jennifer-type, David-type with full profiles) - `personas` - Store persona definitions from seed data
* Emotional Arcs (Confusion→Clarity, Shame→Acceptance, etc.) - `emotional_arcs` - Store emotional transformation templates
* Training Topics (HSA vs FSA, Roth IRA conversion, etc.) - `training_topics` - Store conversation topic catalog
* Response Strategies (Only one option now: Elena Morales methodology guidelines)
* Tiers (Template, Scenario, Edge Case)

You can determine the full inputs require more than that by:
Reading the current prompts in: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`
Reviewing the current data set schema: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-JSON-format_v3.json`
Reviewing the current data set data: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json`

If the current input data requirements are sufficient, then  implement a version of the prompts that have VARIABLE PLACEHOLDERS everywhere in the prompt that is needed. This will activate training that uses data input only from our 5 core questions and is defined as our Conversation Scaffolds Data.

If more variables are needed, let me know now and build in some placeholders and static demo information in the variable JSON

These will be collected on the [https://train-data-three.vercel.app/conversations/generate](https://train-data-three.vercel.app/conversations/generate) page (stubs exist already)
And actually before we make this decision, I am making it now because I think those are the only ones the current output (& hence the prompts) need. Is that true?
If there are other important input variables let me know. If not finish this build with the core 3.

**Execution Instructions Output**
Output a new specification here: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\04-cat-to-conv-templates-execution-E01.md'`

At the end of this coding I expect that we will be able to generate a conversation from the available input (though we have not defined where to store it yet)

---

## 2. Generated Conversation Storage Spec

Right now in our proof of concept setup we are hosting on Vercel with the Supabase back end.
So the output JSON files that are generated need to be stored as Blobs in Supabase Storage (integrated with our existing Supabase)

* Supabase provides an S3-compatible object storage service called Storage
* We create buckets, set policies, and upload files there
* Files can be public or private and accessed via signed URLs
* We need to be able to export the JSON files whole from the Supabase Storage

So we need to develop this into the current app with a persistent table that shows all conversations, with filtering, processing status view, an export functionality. The UI for this is already built and is here: [https://train-data-three.vercel.app/conversations](https://train-data-three.vercel.app/conversations). We will need to hook up all of these functions with the actual Conversations.

This will be separate specification in a separate file. The spec will be built and executed after the Templates implementation.
You can create a first draft of this spec here:

`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\01-cat-to-conv-conversation-storage-spec_v1.md'`

For both of the specifications developed in this prompt use the following Execution Plan Creation Instructions:

---

### Execution Plan Creation Instructions

1. Your job is to create the execution instructions to implement this specification in a sequence of 3 prompts, each of which will be submitted to a new contextless `Claude-4.5-sonnet Thinking LLM`input. This specification merits 3 prompts in specific unique sequential prompts.

2. **Include prompts** to submit to the `Claude-4.5-sonnet Thinking LLM` to execute the product build and coding changes.

   * You must be able to cut and paste these prompts into a **200k Claude-4.5-sonnet Thinking context window in Cursor**.
   * The prompts must be directive.

3. Make sure you **do not leave any context or instructions outside of the prompts**.
   The building agent will only see what is in the prompt(s).

4. **Organize successive prompts** so that each one can be executed in a new 200k token context window.
   Each should be modular — the next prompt should not need to finish the previous component.

5. **Avoid duplication.**
   Do not include the same code/query/details outside the prompt sections if that information is already inside the prompts.

6. **Formatting requirement for copy-paste sections:**

   * At the **beginning** of any cut-and-paste block, insert:

     ```
     ========================     


     ```
   * At the **end** of any cut-and-paste block, insert:

     ```
     +++++++++++++++++



     ```

7. When you create this specification You **must** take into account the actual state of the database and code. This means before building this specification you must validate all assumptions and facts by reading the relevant codebase and database.

8. For all Supabase operations use the Supabase Agent Ops Library (SAOL):
   **Library location:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
   **Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`

9. Use this file: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05.md` as an example and a template of a good execution file.
