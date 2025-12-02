# New Production Full JSON & JSONL Files Page – Execution Plan Specification

---

## 1. Overview

The next spec we are creating is the new production full JSON & JSONL files page.

---

Ok now read the spec you just executed:
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-file-schema-spec_v1.md`

Then read the current full json file schemas here:

* This is for individual conversations:
  `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-individual-JSON-format_v4.json`
* This one for aggregated conversations:
  `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-full-JSON-format_v4.json`

The aggregated one is the one that we are building with our new functionality.

---

## 2. Functional Requirements (Informal Source)

Then read the functional requirements for the specification we are writing. Here are the functional requirements:

1. New column on conversations Batch ID.
2. We can sort and filter on the Batch ID field.
3. New page called LoRA Training JSON Files. This is the new production full JSON & JSONL files page.
4. This page will be empty to begin with.
5. On the conversations page there will be a "create training files" button. This button has the purpose of correctly adding all the files that have been checked in the table. By "adding" I mean correctly placing each conversation within the production full JSON tiering and node hierarchy.
6. Clicking on the create training files button will pop up a dropdown that shows all of the current full production JSON files (it does not show the JSONL files). Selecting one of the full JSON files will then add all the files that have been checked on the conversations table to that specific JSON file.
7. Properly adding the single conversation JSON files to the production full JSON and JSONL files must be done in robust fault tolerant way that allows the processing of dozens and dozens of files at a time. We may select up to 80 at a time to be added to the full file.
8. The JSONL file is ALWAYS generated alongside the JSON file. I think the easiest would be to just automatically convert the full JSON file to a JSONL file, correct?
9. On the new LoRA Training JSON Files page if you select a generated JSON file a drop down will allow you to choose to download either the JSON file or the JSONL file.

---

## 3. Execution Plan Creation Task

Your current task is to turn these functional requirements and the rest of the information here to create a detailed, precise, accurate & usable Execution Plan with 2 segmented prompts.

Use this file as an example and a template of a good execution file:
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05.md`

You will do this by:

* converting functional requirements above (lines 11-20) which are informal and unstructured:
* investigating the actual relevant codebase code
* investigating the current state of the database
* using the answers to the questions in the "Answers to Questions" content below (lines 71-150)
* internalizing and builing with the new production full JSON and JSONL files schemas

  * `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-individual-JSON-format_v4.json`
  * `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-full-JSON-format_v4.json`

After you truly understand what needs to be done write a robust, detailed, precise and accurate Execution Plan.

It must include all required context so that a new agent can execute this Execution Plan without any more context or background (you can refer to other specifications by including their full path).

You will create the Execution Plan and write it here:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-execution_v1.md`

When you write this Execution Plan you **must** take into account the actual state of the database and code.

**The Codebase**:
`C:\Users\james\Master\BrightHub\brun\train-data\src\`

---

## 4. Supabase Agent Ops Library (SAOL) Requirements

**CRITICAL: You MUST use the Supabase Agent Ops Library (SAOL) for ALL database operations.**
Do not use raw `supabase-js` or other scripts. SAOL is safe, robust, and handles edge cases for you.

**Library Path:**
`C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`

**Quick Start:**
`C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\QUICK_START.md` (READ THIS FIRST)

**Troubleshooting:**
`C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\TROUBLESHOOTING.md`

### 4.1 Key Rules

1. **Use Service Role Key:** Operations require admin privileges. Ensure `SUPABASE_SERVICE_ROLE_KEY` is loaded.
2. **Run Preflight:** Always run `agentPreflight({ table })` before modifying data.
3. **No Manual Escaping:** SAOL handles special characters automatically.

### 4.2 Quick Reference: One-Liner Commands

```bash
# Query conversations (Safe & Robust)
node -e "require('dotenv').config({path:'../.env.local'});const saol=require('supa-agent-ops');(async()=>{console.log(await saol.agentQuery({table:'conversations',limit:5}))})();"

# Check schema (Deep Introspection)
node -e "require('dotenv').config({path:'../.env.local'});const saol=require('supa-agent-ops');(async()=>{console.log(await saol.agentIntrospectSchema({table:'conversations',transport:'pg'}))})();"
```

### 4.3 Introspection

** Introspection:**
⚠️ **WARNING**: `agentIntrospectSchema` often requires `transport: 'pg'` and a direct `DATABASE_URL` connection string.

**Better Approach**: Use "Probe Queries" with `agentQuery` to check if columns exist.

If you CANNOT access the database tables and schema with the SAOL library, this is a blocker and you must STOP and notify the user of the situation.

Remember you are ONLY writing the Execution Plan and writing it here:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-files-generation-execution_v1.md`

---

## 5. Answers to Questions from the Previous Agent

### 5.1 Questions for Clarification

#### 1. Batch ID Column - Does it already exist?

I see that batch_items table has batch_job_id and conversation_id columns - meaning conversations are already linked to batch jobs through the batch_items table (as a many-to-many relationship). However, the conversations table itself does NOT have a direct batch_id column.

**Question:** Do you want to:

A) Add a new batch_id column directly to the conversations table (requires migration), OR
B) Query the batch ID via the existing batch_items join table relationship?

**Answer:** Ok, then as far as I know it does not currently exist. I will ask you as a senior Next application engineer and architect to architect it for high quality, resilience and fault tolerance. I will defer to you as to **WHERE* the Batch ID column should live. Do do an in depth review of all the related tables to make sure this new DB value is in the best normalized location. I am agnostic as long as the resulting functionality is resilient. If it is appropriate you can specific a new table altogether to hold this data in a normalized way.

#### 2. Training Files Table - New Database Table Required?

There is no training_files table in the database. The new "LoRA Training JSON Files" page needs to store/manage:

* Training file metadata (name, created date, conversation count, etc.)
* File paths (JSON and JSONL in Supabase Storage)
* Which conversations are included in each training file

**Question:** Should I include database migration specs for a new training_files table? I'm assuming yes, but want to confirm.

**Answer:** Yes if that is the new specification include the database migration specs for a new training_files table

#### 3. Storage Location for Training Files

Currently enriched JSON files are stored in Supabase Storage at paths like:
`<user_id>/<conversation_id>/enriched.json`

**Question:** Where should the full training JSON and JSONL files be stored?

A) A new bucket (e.g., training-files)
B) Same bucket with a different path structure (e.g., training-files/<file_id>/training.json)

**Answer:** I will ask you as a senior Next.js 14 application engineer and architect to architect it for high quality, resilience and fault tolerance. I will defer to you as to **WHERE* the full training JSON and JSONL files are stored. Use your expertise to specify the best architectural decision.

#### 4. "Create Training Files" Button - Create New vs Add to Existing

The current spec mentions selecting an existing full JSON file from a dropdown. But what about creating a new training file?

**Question:** Should the dropdown include:

A) Only existing training files (requires creating files elsewhere first)
B) Existing files PLUS an option to "Create New Training File" (with a name input)

**Answer:** As you suggest: The dropdown should include existing files PLUS an option to "Create New Training File" (with a name input)

#### 5. Conversation Selection Requirements

The spec mentions "checked" conversations.

**Question:** Should conversations have additional filter criteria before they can be added to a training file? For example:

* Must have enrichment_status = 'completed'
* Must have quality_score >= 2.5
* Must have a non-null enriched_file_path

**Answer:** Yes each selected file must have both of:

* enrichment_status = 'completed'
* a non-null enriched_file_path

(quality score is not a requirement)

The selection request should block non qualified files gracefully before the full JSON/JSONL job is submitted. I do not want it to submit, create the full JSON, and just omit the non qualified files.

#### 6. Duplicate Prevention

If a conversation is already in a training file and the user tries to add it again:

**Question:** Should the system:

A) Skip duplicates silently
B) Show a warning but allow re-adding (update timestamp)
C) Block the operation with an error message

**Answer:** The system should C) Block the operation with an error message

#### 7. JSONL Generation Timing

The spec says "JSONL file is ALWAYS generated alongside the JSON file."

**Question:** When exactly should JSONL be regenerated?

A) Every time conversations are added to the JSON file
B) On-demand when downloading (generate from JSON at download time)
C) Both (stored version + fresh generation option)

**Answer:** I do not know. I will ask you as a senior Next.js 14 application engineer and architect to architect it for high quality, resilience and fault tolerance. I will defer to you as to **WHEN* the full training JSONL files are created. Use your expertise to specify the best architectural decision.

#### 8. Existing Export Service

There's already an ExportService (export-service.ts) that handles exports to JSON, JSONL, CSV formats with logging.

**Question:** Should the new training file system:

A) Use/extend the existing ExportService
B) Create a new dedicated TrainingFileService
C) Hybrid (use ExportService for actual file generation, new service for training file management)

**Answer:** I do not know. I will ask you as a senior Next.js 14 application engineer and architect to architect it for high quality, resilience and fault tolerance. I will defer to you as to **WHAT** service file you use. Don't specify the easiest but less robust decision. Use your expertise to specify the best architectural decision.

---

## 6. Execution Plan Execution Instructions

1. Your job is to create the execution instructions to implement this specification in a sequence of 2 prompts, each of which will be submitted to a new contextless `Claude-4.5-sonnet Thinking LLM`input. This specification merits 3 prompts in specific unique sequential prompts.

2. **Include prompts** to submit to the `Claude-4.5-sonnet Thinking LLM` to execute the product build and coding changes.

   * You must be able to cut and paste these prompts into a **200k Claude-4.5-sonnet Thinking context window in Cursor**.
   * The prompts must be directive.

3. Make sure you **do not leave any context or instructions outside of the prompts**.
   The coding agent will only see what is in the prompt(s).

4. **Organize successive prompts** so that each one can be executed in a new 200k token context window.
   Each should be modular — the next prompt should not need to finish the previous component.

5. **Avoid duplication.**
   Do not include the same code/query/details outside the prompt sections if that information is already inside the prompts.

6. **Formatting requirement for copy-paste sections:**

   * At the **beginning** of any cut-and-paste block, insert:

     ```text
     ========================     


     ```
   * At the **end** of any cut-and-paste block, insert:

     ```text
     +++++++++++++++++



     ```

7. When you create this specification You **must** take into account the actual state of the database and code. This means before building this specification you must validate all assumptions and facts by reading the relevant codebase and database.
