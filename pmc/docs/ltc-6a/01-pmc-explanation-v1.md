# 00-generate-seed-story.js - Detailed Analysis
**Version:** 1.0.0  
**Date:** January 2025

## 1. Purpose and Function

### What does `00-generate-seed-story.js` do?

This script is a **prompt generator**, not a file generator. Its primary purpose is to:

- **Generate AI prompts** that users copy and paste into Cursor or other AI coding assistants
- **Create two specific prompts**: Seed Narrative Prompt and Seed Story Prompt
- **Facilitate high-quality documentation** through example-based prompt generation
- **Maintain consistency** by using templates and placeholders

**Key Point**: The script does NOT create output files - it creates prompts displayed in the terminal that users manually copy and use in AI assistants.

### Historical Context
The script was designed to bridge the gap between project documentation templates and AI-assisted content generation, ensuring that AI assistants have proper context and file references when generating project documentation.

## 2. Configuration File Creation

### Is `seed-story-config.json` created automatically?

**No**, the configuration file is NOT created automatically. The script expects this file to exist and will fail if it doesn't find it.

### Information Needed to Create `seed-story-config.json`

To create the configuration file, you need to specify:

1. **Template file paths** - Paths to the prompt template files
2. **Required placeholders** - Variables that will be replaced in templates:
   - `PROJECT_NAME` - Text type, uses project name
   - File paths for various reference documents
3. **Conditional sections** - Optional sections that can be enabled/disabled:
   - `current_status` - For codebase review inclusion
4. **Path variable mappings** - Variables used in conditional sections

The configuration structure defines:
- Which template files to use for each prompt type
- What placeholders need to be replaced
- What conditional content can be included
- How file paths should be resolved

## 3. User-Provided Reference Files - EXACT Details

### What are the "User-Provided Reference Files"?

The **exact files** depend on what's defined in the missing `seed-story-config.json`, but based on the script's logic, these are:

#### For Seed Narrative Generation:
- **Project documentation** files (examples, templates, existing specs)
- **Codebase status files** (if codebase review is enabled)
- **Reference examples** from previous projects
- **Template files** for guidance

#### For Seed Story Generation:
- **Seed narrative file** (the output from the narrative generation)
- **Story template files**
- **Example story files** from other projects
- **Reference documentation**

### Historical Purpose of User-Provided Reference Files

The historical purpose was to:
1. **Provide context** to AI assistants about existing project patterns
2. **Ensure consistency** with previous project documentation
3. **Include relevant examples** that guide AI generation
4. **Reference existing codebase** when needed for current status assessment
5. **Maintain quality standards** by providing good examples to follow

The script prompts users for these file paths interactively and caches them for reuse.

## 4. Output Files from the Script

### Actual Output Files

The script produces **NO direct output files**. Instead, it creates:

#### Terminal Display Output:
1. **Seed Narrative Prompt** - Displayed in terminal for copy/paste
2. **Seed Story Prompt** - Displayed in terminal for copy/paste

#### Cache/Progress Files (side effects):
1. **`.seed-story-[project-abbrev]-progress.json`** - Progress tracking
2. **`.seed-story-[project-abbrev]-paths-cache.json`** - Cached file paths for reuse

### What Users Do With the Output

Users manually:
1. Copy the generated prompts from the terminal
2. Paste them into Cursor or another AI assistant
3. The AI assistant then generates the actual project documentation files
4. Users save the AI-generated content to appropriate files

## 5. LLM Prompt Usage

### Does the script use LLM prompts to generate output files?

**No and Yes - It's more nuanced:**

- **No**: The script itself does NOT use LLM prompts or call any AI services
- **Yes**: The script GENERATES LLM prompts that are designed to be used by AI assistants

### How LLM Prompts Are Involved

1. **Template Processing**: Script reads prompt template files (markdown files with placeholders)
2. **Placeholder Replacement**: Replaces `{PLACEHOLDER}` with actual file paths and project info
3. **Conditional Processing**: Includes/excludes sections based on user choices
4. **Output Formatting**: Formats the final prompt for AI assistant consumption
5. **Manual Transfer**: User copies the prompt and pastes it into an AI assistant

The generated prompts are specifically crafted to provide AI assistants with:
- Clear instructions
- File path references (in backticks)
- Project context
- Example references

## 6. Input to Output Manipulation Process

### Exact Process Flow

1. **Input Reading Phase**:
   - Reads `seed-narrative-v1.md` to extract project name and abbreviation
   - Loads `seed-story-config.json` to understand requirements
   - Prompts user for reference file paths
   - Caches user-provided paths

2. **Template Processing Phase**:
   - Reads template files specified in config:
     - `00-seed-narrative-template.md`
     - `00-seed-story-template.md`
   - Loads template content into memory

3. **Placeholder Replacement Phase**:
   - Replaces `{PROJECT_NAME}` with actual project name
   - Replaces `{*_PATH}` placeholders with file paths (wrapped in backticks)
   - Converts file paths to LLM-friendly format

4. **Conditional Section Processing**:
   - Processes `[[ if condition.enabled ]]...content...[[ endif ]]` blocks
   - Includes or excludes content based on user choices
   - Replaces path variables within conditional content

5. **Output Generation Phase**:
   - Formats the final prompts with proper structure
   - Displays prompts in terminal with clear delimiters
   - Provides copy-friendly formatting

### Transformation Details

**Input**: Raw template with placeholders like:
```
# Generate documentation for {PROJECT_NAME}
Please read the narrative file: {SEED_NARRATIVE_PATH}
[[ if current_status.enabled ]]
Also review the codebase: {CURRENT_STATUS_PATH}
[[ endif ]]
```

**Output**: Processed prompt like:
```
# Generate documentation for Next.js 14 Modernization for Aplio Design System
Please read the narrative file: `pmc/product/_seeds/seed-narrative-v1.md`
Also review the codebase: `aplio-new/app/layout.jsx`
```

### Key Manipulations

1. **Path Normalization**: Converts various path formats to consistent LLM-friendly format
2. **Placeholder Substitution**: Simple string replacement with validation
3. **Conditional Logic**: Basic if/endif processing for optional content
4. **Caching Logic**: Saves user choices for future runs
5. **Progress Tracking**: Maintains state across interrupted sessions

The script essentially acts as a **template engine** that prepares prompts for AI assistants, ensuring they have proper context and file references to generate high-quality project documentation. 