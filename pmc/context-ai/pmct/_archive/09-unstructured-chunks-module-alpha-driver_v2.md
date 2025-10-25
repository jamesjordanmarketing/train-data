# Chunk Alpha Detailed Specs

## Introduction
This task is to take all of this module's unstructured specifications that are currently in unstructured format, across several files, and even contained within a the codebase and write up one final specification that will take everything we have documented in the various files and build one detailed and comprehensive specification which will build the new chunk-alpha module.

## Task Driver
This document is the driver of this specification creation.  It's only purpose is to provide a roadmap to reading the unstructured specifications that are contained in the file paths within this document.
You MUST read every file in this document as well as you MUST read EVERY file that the specs in these file paths. Reading all of them slowly and a high level of attention to detail is the ONLY way you will be able to produce the comprehensive structured specification we need. 

## Foundational Documentations

First read the foundational documentations for this project:

I need you to read the product overview here:
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\product\01-bmo-overview.md`

and then read the current Category module overview here:
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\product\01-bmo-overview-categ-module_v1.md`

Then become intimately related to the code base of the module we are building on top of:
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\src`

Then read the src for the UI that we will be using for the document chunk dashboard. That codebase is here: `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\chunks-alpha-dashboard\src`
This codebase is extremely important as it contains the human interface design for the module dashboard. This is a VITE application, so use it only to understand the UI. Build the actual components in Next.js 14 just like the core module in `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src`


g. The `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\pmc\context-ai\pmct\09-unstructured-chunks-module-alpha_v2.md` is the main origin of the the specification thinking and contains the specific deliverables required. Combine it with the details from the codebases and the clarifying details in the files in this driver to understand the entire picture of  what needs to be done to the 

## 1. Existing Specs

Here is the full unstructured specification for this module here:
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\09-unstructured-chunks-module-alpha_v2.md`
We have a review analysis of this spec here:
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\08-chunk-build-analysis-01.md`

## 2. New Dimension Breakdown Data Dictionary Files

`C:\Users\james\Master\BrightHub\brun\chunks-alpha\system\chunks-alpha-data\document-metadata-dictionary-gen-AI-processing-required_v1.csv`
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\system\chunks-alpha-data\document-metadata-dictionary-mechanically-generated_v1.csv`
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\system\chunks-alpha-data\document-metadata-dictionary-previously-generated_v1.csv`

Here are the original dimensions in one file :
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\system\chunks-alpha-data\document-metadata-dictionary.csv`

**Requirement:** ALL of these dimensions must be displayed on the output web page spreadsheet from this module version.

## 3. Directions on How We Must Use These New Data Dimensions and Engineering

`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-data-dimensions-segmenting_v1.md`

## Final Specification Request

Now I need you to generate a final specification that the AI coding agent will use to develop this module.

**This task specification must:**

a. Include the steps to have the human cut and paste all of the needed SQL into the Supabase SQL Editor
b Include the prompt(s) will use the Claude-4.5-sonnet Thinking LLM to execute the product build and coding changes. I must be able to cut and paste these prompts into a 200k Claude-4.5-sonnet Thinking context window in Cursor.
c. Organize the successive prompts so that each one builds on the previous ones and can be executed in a new 200k token context window
d. Remember All chunk metadata, referential data, factual data, tags, labels, and generated dimensions content should be saved to well structured, normalized, human readable named and organized Supabase tables.
e. The specification prompts you write must be highly directive and detailed. The prompts must both tell the coding agent exactly what to do, and why to do it.
f. Your job is to take all of these disparate and unstructured specifications and turn them into one specification file. 


## Deliverable Path

Ok please create the detailed new step by step build spec and put it here:
`C:\Users\james\Master\BrightHub\brun\chunks-alpha\pmc\context-ai\pmct\c-alpha-build-spec_v3.md`
