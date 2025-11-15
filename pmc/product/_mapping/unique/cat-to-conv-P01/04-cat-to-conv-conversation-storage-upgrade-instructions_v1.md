Storage Implementation

## Storage Implementation Upgrade Overview

First you must read: 
1 `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\01-cat-to-conv-conversation-storage-spec_v1.md` which is the core document we are updating. 

Read both:
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\04-categories-to-conversation-strategic-overview_v1.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\04-categories-to-conversation-pipeline-spec_v1.md`
So you have the full context of the current work.  The codebase may vary as implemented and the codebase is the final word for now.

fully internalize and understand the codebase of this application located here:
- `C:\Users\james\Master\BrightHub\brun\train-data\src\`


### Storage Implementation Upgrade Details
For this prompt you are going to: 

A. Update the storage spec which is currently here: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\01-cat-to-conv-conversation-storage-spec_v1.md`


We have implemented the full templates specification that we defined here: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\04-cat-to-conv-templates-spec_v2.md`
There may be some minor variations in how it was implemented in the codebase.

So I want you to review the storage spec, make sure it is applicable to the current codebase, and make any updates needed.

B. In the storage spec `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\01-cat-to-conv-conversation-storage-spec_v1.md` section: "### Required SQL Operations"
you say: "Execute these SQL statements in Supabase SQL Editor BEFORE implementing prompts"

Why didn't you implement the instructions to create the Supabase objects using the SAOL library?
This is a requirement. Is there blocker reason? If no blocker, you must rewrite the spec to implement all of the DB object manipulation in the spec to be executed within a prompt using the SAOL library tool.
The Supabase Agent Ops Library(SAOL):
**Library location:** 

- `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`                                                     
**Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`

Add the new Supabase instructions prompt as Prompt 1. Increment the number of all the other prompts in `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\04-cat-to-conv-execution-E01.md` to the next prompt number. I.e. there will be 4 prompts total: Prompt 1, Prompt 2, Prompt 3, Prompt 4.

C. Create a version 2 of `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\01-cat-to-conv-conversation-storage-spec_v1.md`  with the changes needed above. 

Name the new version: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\01-cat-to-conv-conversation-storage-spec_v2.md`. 

Version 2 MUST be complete. Include the full scope of `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\01-cat-to-conv-conversation-storage-spec_v1.md`, even sections that did not change. 

Write the entire new spec to: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\01-cat-to-conv-conversation-storage-spec_v2.md`

Use the following "### Execution Plan Execution Instructions" to implement this spec (it was already used to create `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\01-cat-to-conv-conversation-storage-spec_v1.md`)

Do not update any code or write to any other file but the output file `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\unique\cat-to-conv-P01\01-cat-to-conv-conversation-storage-spec_v2.md`


### Execution Plan Execution Instructions

1. Your job is to create the execution instructions to implement this specification in a sequence of 3 prompts, each of which will be submitted to a new contextless `Claude-4.5-sonnet Thinking LLM`input. This specification merits 3 prompts in specific unique sequential prompts.

2. **Include prompts** to submit to the `Claude-4.5-sonnet Thinking LLM` to execute the product build and coding changes.  
   - You must be able to cut and paste these prompts into a **200k Claude-4.5-sonnet Thinking context window in Cursor**.
   - The prompts must be directive.

3. Make sure you **do not leave any context or instructions outside of the prompts**.  
   The building agent will only see what is in the prompt(s).

4. **Organize successive prompts** so that each one can be executed in a new 200k token context window.  
   Each should be modular — the next prompt should not need to finish the previous component.

5. **Avoid duplication.**  
   Do not include the same code/query/details outside the prompt sections if that information is already inside the prompts.

6. **Formatting requirement for copy-paste sections:**

   - At the **beginning** of any cut-and-paste block, insert:
     ```
     ========================     
     

     ```
   - At the **end** of any cut-and-paste block, insert:
     ```
     +++++++++++++++++
     
     
     
     ```
7. When you create this specification You **must** take into account the actual state of the database and code. This means before building this specification you must validate all assumptions and facts by reading the relevant codebase and database.

8. For all Supabase operations use the Supabase Agent Ops Library (SAOL):
**Library location:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`  
**Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`

9. Use this file: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05.md` as an example and a template of a good execution file.