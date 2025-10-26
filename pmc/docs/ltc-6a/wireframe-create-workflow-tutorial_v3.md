# Wireframe FIGMA Prompt Generation Workflow Tutorial v3

## Overview

This tutorial explains how to generate FIGMA wireframe prompts for your project. The workflow involves generating functional requirement (FR) wireframe segments that create individual prompts for each FR, which can then be used in FIGMA Make AI to generate wireframes.

## Key Scripts and Their Purposes

### 1. `04-generate-FR-wireframe-segments_v4.js` ✅ CORRECT SCRIPT
**This is the script you want to use for wireframe generation.**

- **Purpose**: Generates wireframe prompts for FIGMA Make AI
- **Input**: `03-{project-abbreviation}-functional-requirements.md`
- **Template**: `04-FR-wireframes-prompt_v4.md`
- **Outputs to**: 
  - `pmc/product/_mapping/fr-maps/prompts/` (generator prompt files)
  - `pmc/product/_mapping/fr-maps/` (section files and outputs)

### 2. `04-generate-FR-prompt-segments.js` ❌ WRONG SCRIPT
**This is NOT the script for wireframes - it's for a different purpose.**

- **Purpose**: Generates UI functional requirements segments (different workflow)
- **Outputs to**: `pmc/product/_mapping/ui-functional-maps/` (outdated directory)
- **Template**: `04-{project-abbreviation}-ui-first-functional-requirements-prompt_v2.md` (doesn't exist for train)

## Correct Workflow

### Step 1: Verify Prerequisites

Before running the wireframe generation script, ensure you have:

1. **Functional Requirements File**: `pmc/product/03-{project-abbreviation}-functional-requirements.md`
2. **Wireframe Template**: `pmc/product/_prompt_engineering/04-FR-wireframes-prompt_v4.md` ✅ (exists)

### Step 2: Run the Wireframe Generation Script

```bash
cd pmc/product/_tools
node 04-generate-FR-wireframe-segments_v4.js "Interactive LoRA Conversation Generation" train
```

### Step 3: Generated Output Structure

The script creates:

#### A. Section Files in `pmc/product/_mapping/fr-maps/`:
- `04-train-FR-wireframes-E01.md` (Stage 1 requirements)
- `04-train-FR-wireframes-E02.md` (Stage 2 requirements)
- `04-train-FR-wireframes-E03.md` (Stage 3 requirements)
- etc.

#### B. Generator Prompt Files in `pmc/product/_mapping/fr-maps/prompts/`:
- `04-FR-wireframes-prompt-E01.md` (contains prompts for all FRs in Stage 1)
- `04-FR-wireframes-prompt-E02.md` (contains prompts for all FRs in Stage 2)
- `04-FR-wireframes-prompt-E03.md` (contains prompts for all FRs in Stage 3)
- etc.

#### C. Output Files (created when you run the prompts):
- `04-train-FR-wireframes-output-E01.md` (FIGMA prompt outputs for Stage 1)
- `04-train-FR-wireframes-output-E02.md` (FIGMA prompt outputs for Stage 2)
- etc.

### Step 4: Using the Generated Prompts

1. Open a generator prompt file (e.g., `04-FR-wireframes-prompt-E01.md`)
2. Each file contains multiple FR-specific prompts
3. Copy individual FR prompts and paste them into FIGMA Make AI
4. The generated wireframes will be appended to the corresponding output file

## Error Analysis: Why Your Command Failed

When you ran:
```bash
node 04-generate-FR-prompt-segments.js "Interactive LoRA Conversation Generation" train
```

You got this error:
```
Error: Prompt template not found at C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_prompt_engineering\04-train-ui-first-functional-requirements-prompt_v2.md
```

**Why it failed:**
1. You used the wrong script (`04-generate-FR-prompt-segments.js`)
2. This script looks for `04-train-ui-first-functional-requirements-prompt_v2.md` which doesn't exist
3. This script outputs to the outdated `ui-functional-maps` directory
4. This script is for a different workflow, not wireframe generation

## Correct File Relationships

Your understanding was partially correct:

✅ **Correct**: 
- `pmc/product/_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E01.md` (generator prompt)
- Uses `pmc/product/_mapping/fr-maps/04-bmo-FR-wireframes-E01.md` (section file)
- Produces `pmc/product/_mapping/fr-maps/04-bmo-FR-wireframes-output-E01.md` (FIGMA outputs)

❌ **Incorrect**: The script that generates these is `04-generate-FR-wireframe-segments_v4.js`, not `04-generate-FR-prompt-segments.js`

## Summary

**To generate wireframe FIGMA prompts:**

1. **Use**: `04-generate-FR-wireframe-segments_v4.js`
2. **Command**: `node 04-generate-FR-wireframe-segments_v4.js "Interactive LoRA Conversation Generation" train`
3. **Outputs**: Files in `pmc/product/_mapping/fr-maps/` and `pmc/product/_mapping/fr-maps/prompts/`
4. **Template**: Uses existing `04-FR-wireframes-prompt_v4.md`

**Avoid**: `04-generate-FR-prompt-segments.js` (different purpose, outputs to outdated directory)

The `ui-functional-maps` directory is indeed outdated and no longer used for the current wireframe generation workflow.