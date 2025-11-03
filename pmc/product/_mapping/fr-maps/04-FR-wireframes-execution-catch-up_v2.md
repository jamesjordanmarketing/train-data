# Task Specification

## Overview

For this task, you need to read the background files and understand the context fully.

---

## Background Files to Read

Read all of these:

- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\01-bmo-overview-train-data_v1.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-train-functional-requirements-integrate-wireframe_v1.md`

Then, read and fully understand the codebase of this application located here:

- `\src`

You will be asked to search it and find solutions.

---

## Problem Description

The problem we are solving is that the **database kept getting changed by later prompts in the sequence.**

- Tables are often taken over for another purpose than the one that the previous created.
- In addition, SQL was not always run for every step — sometimes it was forgotten.

As a result:

- The tables are out of step.
- It is unclear how to fix them.
- We do **not** want to fix them individually to meet the requirements of previous or subsequent steps, because they might be broken by another step.

---

## Supabase Object Audit Files

We did a full audit of all Supabase objects for each step. You must read all of these:

- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E01-sql-check.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E02-sql-check.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E03-sql-check.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E04-sql-check.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05-sql-check.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\E05-SQL-FIXES.sql`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05-rpc-results.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E06-sql-check.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E06-sql-check-results.json`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E07-sql-check.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E08-sql-check.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E09-sql-check.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E09-sql-only.md`

---

## Supabase Access Scripts

We also have a library of scripts that allow you to directly query the Supabase project.

- **Scripts directory:**  
  `C:\Users\james\Master\BrightHub\brun\train-data\src\scripts\`

- **Tutorial:**  
  `C:\Users\james\Master\BrightHub\brun\train-data\src\scripts\supabase-access-details_v1.md`

---

## Task Requirements

You must complete the following two line items:

---

### **A. Create the Final SQL and Prompts Specification**

Review all of the information from above and design a plan to create the **FINAL SQL tables, objects, and functionality** — one that:

- Takes into account all documentation.
- Uses the current source codebase.
- Produces a detailed, actionable, and directive markdown file with all SQL statements and prompts that must be run to normalize and make the Supabase interfaces functional.

#### Requirements for the Specification

1. **Include steps** for the human to cut and paste any needed SQL into the Supabase SQL Editor.
2. **Include prompts** to submit to the `Claude-4.5-sonnet Thinking LLM` to execute the product build and coding changes.  
   - You must be able to cut and paste these prompts into a **200k Claude-4.5-sonnet Thinking context window in Cursor**.
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
7. Use the Supabase SQL tools to **create custom versions** that let you see all of the project objects.  
   You **must** take into account the actual state of the database and code.
8. **Create a final execution file here:** `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product_mapping\fr-maps\04-FR-wireframes-execution-catch-up-output_v2`
If you cannot view and audit the actual Supabase objects, you must tell me and **cease this task**.

---

### **B. Prepare the Final Execution File**

Make sure the final execution file has the proper SQL and prompts needed so that the application is ready for execution at:
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\product_mapping\fr-maps\04-FR-wireframes-execution-E10.md`

---

## Reference Execution Prompt Files

These are the build execution prompt files with SQL inline that we have run so far.  
Use them as a **reference library** — read any or all when relevant.

- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E01.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E01-part-2.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E01-part-3.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E02.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E02-part-2.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E03.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E03b.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E04.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E05.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E06.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E07.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E07-part2.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E07-part3.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E07-part4.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E08.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E08-part2.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E08-part3.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E08-part4.md`
- `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E09.md`


