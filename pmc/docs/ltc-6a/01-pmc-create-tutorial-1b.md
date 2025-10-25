# Seed Story Generator Tutorial
**Version:** 1.1.0  
**Date:** January 2025

## Introduction

This tutorial explains how to use the `00-generate-seed-story.js` script to generate seed narrative and seed story prompts for your project. This script creates prompts that you can copy and paste into Cursor or other AI coding assistants.

## Prerequisites

1. Node.js installed on your computer
2. Access to the pmc directory
3. Project details defined in the seed narrative file

## Required Files Setup

### 1. Seed Narrative File
**Location:** `pmc/product/_seeds/seed-narrative-v1.md`

This file must exist and contain:
- **Line 1:** Project name (with # heading format)
- **Line 2:** Product abbreviation in format: `Product Abbreviation: your-abbrev`

Example:
```markdown
# Next.js 14 Modernization for Aplio Design System
Product Abbreviation: aplio-mod-1
```

### 2. Missing Configuration File
**⚠️ Important:** The script expects a configuration file that doesn't exist:
**Location:** `pmc/product/_tools/seed-story-config.json`

You'll need to create this file with the following structure:
```json
{
  "seed-narrative": {
    "promptPath": "../../product/_templates/00-seed-narrative-template.md",
    "required_placeholders": {
      "PROJECT_NAME": {
        "type": "text",
        "default": "{{project_name}}"
      },
      "SEED_NARRATIVE_PATH": {
        "type": "seed_path",
        "default": "_seeds/seed-narrative-v1.md"
      }
    },
    "conditional_sections": {
      "current_status": {
        "path_variable": "CURRENT_STATUS_PATH"
      }
    }
  },
  "seed-story": {
    "promptPath": "../../product/_templates/00-seed-story-template.md",
    "required_placeholders": {
      "PROJECT_NAME": {
        "type": "text",
        "default": "{{project_name}}"
      },
      "SEED_NARRATIVE_PATH": {
        "type": "seed_path", 
        "default": "{{project_abbreviation}}-seed-narrative.md"
      },
      "SEED_STORY_TEMPLATE_PATH": {
        "type": "template_path",
        "default": "_templates/00-seed-story-template.md"
      }
    },
    "conditional_sections": {
      "current_status": {
        "path_variable": "CURRENT_STATUS_PATH"
      }
    }
  }
}
```

### 3. Template Files
Ensure these template files exist:
- **`pmc/product/_templates/00-seed-narrative-template.md`** ✅ (exists)
- **`pmc/product/_templates/00-seed-story-template.md`** ✅ (exists)

## How to Use the Script

### Step 1: Navigate to Tools Directory
```bash
cd pmc/product/_tools/
```

### Step 2: Create Missing Configuration
Create the `seed-story-config.json` file with the JSON structure shown above.

### Step 3: Run the Script
```bash
node 00-generate-seed-story.js
```

### Step 4: Follow Interactive Prompts

The script will:

1. **Read Project Details**
   - Automatically extracts project name and abbreviation from `seed-narrative-v1.md`
   - Displays the found project details

2. **Generate Seed Narrative Prompt**
   - Validates reference document paths
   - Asks for file paths for any missing references
   - For each file path request:
     - Press Enter to use the default path (shown)
     - Or type a custom path
     - Paths can be:
       * Absolute: `C:/full/path/to/file.md`
       * Relative to tools: `../my-file.md` 
       * Relative to project: `product/my-file.md`
       * Just filename: `my-file.md` (placed in default directory)

3. **Codebase Review Option**
   - Question: "Review Codebase? (y/n) [default: n]"
   - Answer 'y' to include codebase analysis in prompts
   - Answer 'n' or press Enter to skip

4. **Generate and Display Prompts**
   - Shows the complete seed narrative prompt
   - Asks if you want to continue with seed story prompt
   - Shows the complete seed story prompt

### Step 5: Copy and Use Prompts
- Copy the generated prompts from the terminal
- Paste them into Cursor or your AI coding assistant
- The prompts include file paths in backticks for easy AI reference

## File Paths and Caching

### Cache Files Created
The script creates cache files in `pmc/product/`:
- **`.seed-story-[project-abbrev]-progress.json`** - Tracks generation progress
- **`.seed-story-[project-abbrev]-paths-cache.json`** - Caches user-provided file paths

### Path Resolution
The script handles multiple path formats:
- **Absolute paths:** Full system paths
- **Relative to tools:** `../path/to/file`
- **Relative to project:** `product/path/to/file`
- **Project placeholders:** `{{project_abbreviation}}` and `{{project_name}}`

### Default Directories
Based on file type:
- **template_path:** `_templates/`
- **seed_path:** `_seeds/`
- **example_path:** `_examples/`
- **product_path:** Root product directory

## Generated Output

### Seed Narrative Prompt
- References your seed narrative file
- Includes project-specific placeholders
- Contains conditional sections based on codebase review choice

### Seed Story Prompt  
- References narrative and story templates
- Includes all validated file paths
- Ready to paste into AI assistant

## Troubleshooting

### Script Fails to Start
1. **Missing config file error**
   - Create `seed-story-config.json` as shown above
   - Verify JSON syntax is correct

2. **Cannot read seed narrative**
   - Ensure `seed-narrative-v1.md` exists in `_seeds/` directory
   - Check first two lines contain project name and abbreviation

### File Path Issues
1. **Path does not exist warnings**
   - Enter a valid path when prompted
   - Use Tab completion in terminal for path assistance
   - Check if referenced files actually exist

2. **Path resolution problems**
   - Use absolute paths if relative paths fail
   - Check working directory with `pwd` command

### Cache Issues
To clear cache and start fresh:
```bash
# Navigate to product directory
cd pmc/product/

# Remove cache files for your project
rm .seed-story-[your-project-abbrev]-*.json
```

## Best Practices

1. **Prepare Reference Documents**
   - Gather all example files and templates before running
   - Organize files in appropriate `_templates/`, `_seeds/`, `_examples/` directories

2. **Use Consistent Naming**
   - Keep project abbreviations short and consistent
   - Use hyphens instead of spaces in abbreviations

3. **Review Generated Prompts**
   - Check that all file paths are correct
   - Verify placeholders were replaced properly
   - Test prompts in your AI assistant

4. **Save Your Work**
   - Cache files allow resuming interrupted sessions
   - Keep the generated prompts for reference

## File Structure After Use

```
pmc/
├── product/
│   ├── _tools/
│   │   ├── 00-generate-seed-story.js
│   │   └── seed-story-config.json (you create this)
│   ├── _seeds/
│   │   └── seed-narrative-v1.md (required input)
│   ├── _templates/
│   │   ├── 00-seed-narrative-template.md (used by script)
│   │   └── 00-seed-story-template.md (used by script)
│   ├── .seed-story-[abbrev]-progress.json (generated)
│   └── .seed-story-[abbrev]-paths-cache.json (generated)
```

## Next Steps

After generating the prompts:
1. Use the seed narrative prompt to create your project narrative
2. Use the seed story prompt to create your project story
3. Save the generated content in appropriate files
4. Continue with other PMC tools for specifications and requirements

## Need Help?

If you encounter issues:
1. Check that all required files exist
2. Verify the configuration file syntax
3. Review file paths for typos
4. Check the script's console output for specific error messages
5. Clear cache files if you suspect corruption
