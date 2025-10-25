# Project Memory Core - Document Generation Tutorial
**Version:** 1.0.0  
**Date:** 02-20-2025

## Introduction

This tutorial will teach you how to generate the core project documentation using the Project Memory Core (PMC) tools. We will create five essential documents:

1. Seed Narrative
2. Seed Story
3. Project Overview
4. User Stories
5. Functional Requirements

## Prerequisites

1. Node.js installed on your computer
2. Access to the pmc directory
3. Basic understanding of command line usage

## Step 1: Generate the Seed Story

### Setup
1. Open your terminal
2. Navigate to the tools directory:
   ```bash
   cd pmc/product/_tools/
   ```

### Running the Generator
1. Run the seed story generator:
   ```bash
   node 00-generate-seed-story.js
   ```

2. The generator will ask for:
   - Project name
   - Project abbreviation (letters, numbers, and hyphens only)
   - Reference document paths

3. For each file path request:
   - Type the path or press Enter to use the default
   - Paths can be:
     * Full path (e.g., `C:/projects/my-file.md`)
     * Relative to _tools (e.g., `../my-file.md`)
     * Just filename (will be placed in default directory)

4. For the "Review Codebase" question:
   - Answer 'y' if you want to include codebase review
   - Answer 'n' to skip (default)

### Cache Management
- Cache location: `.seed-story-[project-abbrev]-paths-cache.json`
- To clear cache:
  1. Navigate to `pmc/product/`
  2. Delete the cache file for your project

## Step 2: Generate Product Specifications

### Setup
1. Ensure you're in the tools directory:
   ```bash
   cd pmc/product/_tools/
   ```

### Running the Generator
1. Run the product specs generator:
   ```bash
   node 01-05-generate-product-specs.js "Project Name" project-abbrev
   ```
   Example:
   ```bash
   node 01-05-generate-product-specs.js "Next.js 14 Modernization" nextjs-mod
   ```

2. The generator will create:
   - Project Overview (01)
   - User Stories (02)
   - Architecture Document
   - Logging & Reporting Specs
   - Deployment Setup Guide

3. For each document:
   - Confirm file paths
   - Review generated content
   - Save progress before moving to next document

### Cache Management
- Cache location: `cache/[project-abbrev]-paths-cache.json`
- Progress location: `progress/[project-name]-[project-abbrev]-progress.json`
- To clear:
  1. Navigate to `pmc/product/_tools/`
  2. Delete both cache and progress files for your project

## Step 3: Generate Functional Requirements

### Setup
1. Ensure you're in the tools directory:
   ```bash
   cd pmc/product/_tools/
   ```

### Running the Generator
1. Run the FR generator:
   ```bash
   node 03-generate-FR-initial.js "Project Name" project-abbrev
   ```
   Example:
   ```bash
   node 03-generate-FR-initial.js "Next.js 14 Modernization" nextjs-mod
   ```

2. The generator will:
   - Read user stories from `02-[project-abbrev]-user-stories.md`
   - Create functional requirements in `03-[project-abbrev]-functional-requirements.md`
   - Map user stories to functional requirements
   - Generate acceptance criteria

### Cache Management
- No cache files for this generator
- Output is generated fresh each time
- To regenerate:
  1. Delete the existing FR document
  2. Run the generator again

## Step 4: Generate Tasks

### Setup
1. Ensure you're in the tools directory:
   ```bash
   cd pmc/product/_tools/
   ```

### Running the Generator
1. Run the task generator:
   ```bash
   node 06-generate-task-initial-v2.js "Project Name" project-abbrev
   ```
   Example:
   ```bash
   node 06-generate-task-initial-v2.js "Next.js 14 Modernization" nextjs-mod
   ```

2. The generator will:
   - Read functional requirements
   - Create tasks in `06-[project-abbrev]-tasks.md`
   - Map tasks to functional requirements
   - Generate task metadata

### Cache Management
- No cache files for this generator
- Output is generated fresh each time
- To regenerate:
  1. Delete the existing tasks document
  2. Run the generator again

## File Structure After Generation

```
pmc/
└── product/
    ├── 00-[project-abbrev]-seed-narrative.md
    ├── 00-[project-abbrev]-seed-story.md
    ├── 01-[project-abbrev]-overview.md
    ├── 02-[project-abbrev]-user-stories.md
    ├── 03-[project-abbrev]-functional-requirements.md
    └── 06-[project-abbrev]-tasks.md
```

## Troubleshooting

1. If a generator fails:
   - Check the error message
   - Verify all required files exist
   - Clear cache if needed
   - Try running the generator again

2. If files are not generated:
   - Check your current directory
   - Verify project name and abbreviation
   - Check file permissions
   - Look for error messages in the console

3. If content is incorrect:
   - Delete the generated file
   - Clear any cache files
   - Run the generator again

## Best Practices

1. Run generators in order:
   - Seed Story first
   - Product Specs second
   - Functional Requirements third
   - Tasks last

2. Review each document after generation

3. Keep cache files unless you need to start fresh

4. Use consistent project names and abbreviations

5. Save your work frequently

## Need Help?

If you encounter issues:
1. Check the error messages
2. Review this tutorial
3. Check the generator source code for requirements
4. Ask for help in the project chat
