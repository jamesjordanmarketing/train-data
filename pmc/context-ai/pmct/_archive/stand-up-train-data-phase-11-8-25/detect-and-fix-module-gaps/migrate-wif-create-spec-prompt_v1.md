# Migration Analysis Prompt: train-wireframe to src Directory

## Context

You are analyzing the BrightHub train-data application to resolve a critical build failure. The Next.js application located at `C:\Users\james\Master\BrightHub\BRun\train-data\src\` is incorrectly importing code from a separate Vite application at `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\`, causing TypeScript compilation errors and blocking Vercel deployment.

**Current Build Status:**
- ✅ All E01-E04 build prompts executed successfully
- ✅ Database ready (24/29 tables, 1,117 test rows)
- ✅ Batch Generation Service fully implemented
- ❌ **Vercel build failing - deployment blocked**

**Root Cause:**
The Next.js app is using import paths like:
```typescript
import { errorLogger } from '@/../train-wireframe/src/lib/errors/error-logger';
import { AppError, ErrorCode } from '@/../train-wireframe/src/lib/errors';
```

These cross-application imports break the build because:
1. The Vite app structure is incompatible with Next.js 14
2. TypeScript cannot resolve paths outside the Next.js application root
3. The import syntax violates Next.js path resolution rules

## Your Task

Create a comprehensive migration report that documents **every single import** from the `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\` directory into the main `C:\Users\james\Master\BrightHub\BRun\train-data\src\` directory, along with detailed migration instructions.

### Report Requirements

The report must be saved to:
```
C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\deep-project-check_v5-train-build-bugs_v2.md
```

### Analysis Steps

#### Step 1: Import Discovery
Conduct an exhaustive search of the entire `C:\Users\james\Master\BrightHub\BRun\train-data\src\` directory to identify:

1. **All files** that contain imports from `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\`
2. **Exact import statements** being used
3. **What objects/modules** are being imported (functions, classes, types, constants, etc.)
4. **Source file locations** within `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\`

Search for patterns like:
- `from '@/../train-wireframe/`
- `from '../train-wireframe/`
- `from '../../train-wireframe/`
- `import(` statements that reference train-wireframe

#### Step 2: Source Code Analysis
For each discovered import, examine the source files in `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\` to understand:

1. **File structure** and organization
2. **Dependencies** the source file has (does it import other train-wireframe files?)
3. **Vite-specific code** that needs adaptation for Next.js 14
4. **TypeScript types** and interfaces used
5. **Environment-specific code** (Vite plugins, config, env variables)

#### Step 3: Migration Mapping
Create a detailed mapping for each imported module:

1. **Source Location:** Full Windows path in `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\`
2. **Target Location:** Full Windows path where it should live in `C:\Users\james\Master\BrightHub\BRun\train-data\src\` (respecting Next.js conventions)
3. **Import Objects:** List of all exports being used
4. **Dependencies:** Other train-wireframe files this module depends on
5. **Adaptation Required:** Specific changes needed for Next.js 14 compatibility

### Report Structure

Your report must follow this exact structure:

```markdown
# train-wireframe to src Migration Report
Generated: [timestamp]

## Executive Summary
- Total files importing from train-wireframe: [count]
- Total unique train-wireframe modules referenced: [count]
- Total imports to update: [count]
- Estimated migration complexity: [Low/Medium/High]

## Critical Issues Found
[List any TypeScript syntax errors, breaking changes, or high-risk migrations]

## Section 1: Complete Import Inventory

### 1.1 API Routes
[For each API route file importing from train-wireframe]

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\[path]\route.ts`
**Current Imports:**
```typescript
[exact import statements]
```

**Objects Used:**
- `errorLogger` (function)
- `AppError` (class)
- `ErrorCode` (enum)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts`
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-classes.ts`

---

### 1.2 Library Files
[Repeat pattern for lib files]

### 1.3 Component Files
[Repeat pattern for component files]

### 1.4 Other Files
[Repeat pattern for any other files]

## Section 2: Source Module Analysis

### 2.1 Error Handling Module
**Source Directory:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\`

**Files in Module:**
1. `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts`
   - **Exports:** errorLogger function, LogLevel enum
   - **Dependencies:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-classes.ts`, `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-guards.ts`
   - **Vite-specific code:** [list any]
   - **Required changes:** [specific adaptations needed]

2. `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-classes.ts`
   - **Exports:** AppError, ValidationError, NotFoundError, etc.
   - **Dependencies:** [list full Windows paths]
   - **Required changes:** [specific adaptations needed]

3. `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-guards.ts`
   - **Exports:** isAppError, isValidationError, etc.
   - **Dependencies:** [list full Windows paths]
   - **Required changes:** [specific adaptations needed]

[Continue for all discovered modules]

## Section 3: Migration Plan

### 3.1 Error Handling Module Migration

**Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\`
**Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\`

**Files to Migrate:**
1. ✅ `error-logger.ts`
   - **Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts`
   - **Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\error-logger.ts`
   - **Changes needed:**
     - Fix TypeScript syntax error on line 111 (remove trailing comma)
     - Update import paths to use `@/lib/errors/` alias
     - Verify Next.js compatibility of logging approach
   - **New import path:** `@/lib/errors/error-logger`

2. ✅ `error-classes.ts`
   - **Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-classes.ts`
   - **Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\error-classes.ts`
   - **Changes needed:**
     - Update internal imports to use `@/lib/` alias
     - Verify TypeScript types compile in Next.js environment
   - **New import path:** `@/lib/errors/error-classes`

3. ✅ `error-guards.ts`
   - **Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-guards.ts`
   - **Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\error-guards.ts`
   - **Changes needed:**
     - Update internal imports to use `@/lib/` alias
   - **New import path:** `@/lib/errors/error-guards`

**Migration Steps:**
1. Create directory: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\`
2. Copy files with adaptations
3. Update all internal cross-references
4. Test compilation

[Continue for all discovered modules]

## Section 4: Import Update Instructions

### 4.1 Files Requiring Import Updates

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\backup\create\route.ts`
**Lines to Update:** 4-5

**Current:**
```typescript
import { errorLogger } from '@/../train-wireframe/src/lib/errors/error-logger';
import { AppError, ErrorCode } from '@/../train-wireframe/src/lib/errors';
```

**Replace With:**
```typescript
import { errorLogger } from '@/lib/errors/error-logger';
import { AppError, ErrorCode } from '@/lib/errors';
```

**Verification:** Ensure `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\index.ts` exports all required objects

---

[Continue for every file needing updates]

## Section 5: Vite to Next.js 14 Conversion Guide

### 5.1 Import Alias Conversions
| Vite Pattern | Next.js 14 Pattern |
|--------------|-------------------|
| `@/` in `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\` | `@/` in `C:\Users\james\Master\BrightHub\BRun\train-data\src\` |
| `~/` references | Convert to `@/` |
| Relative paths | Convert to `@/` aliases |

### 5.2 TypeScript Configuration Differences
[Document any tsconfig differences that require code changes]

### 5.3 Environment Variable Access
[Document if any env variables need updating]

### 5.4 Build-Time vs Runtime Code
[Note any Vite-specific build-time code that needs adaptation]

## Section 6: Validation Checklist

After migration, verify:
- [ ] All train-wireframe imports removed from `C:\Users\james\Master\BrightHub\BRun\train-data\src\`
- [ ] All migrated files compile without errors
- [ ] All exports properly defined in index.ts files
- [ ] TypeScript types resolve correctly
- [ ] No circular dependencies introduced
- [ ] Next.js build completes successfully
- [ ] Vercel deployment succeeds

## Section 7: Risk Assessment

### High Risk Items
[List migrations that could break functionality]

### Medium Risk Items
[List migrations requiring careful testing]

### Low Risk Items
[List straightforward copy/paste migrations]

## Section 8: Dependency Graph

```
[Create a visual representation of how train-wireframe modules depend on each other]

Example:
C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts
  ├── depends on: C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-classes.ts
  ├── depends on: C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-guards.ts
  └── used by: [list all files in C:\Users\james\Master\BrightHub\BRun\train-data\src\]

C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-classes.ts
  ├── depends on: [none]
  └── used by: error-logger.ts, [other files with full paths]
```

## Section 9: Implementation Order

Based on dependencies, migrate in this order:
1. [Base modules with no dependencies]
2. [Modules depending on base modules]
3. [Top-level modules]
4. [Update all imports]

## Appendix A: Complete File Listing
[Exhaustive list of every file examined with full Windows paths]

## Appendix B: Search Patterns Used
[Document the search patterns used to find imports]
```

### Critical Requirements

1. **Be Exhaustive:** Find EVERY import, no matter how small
2. **Be Specific:** Include exact line numbers, full Windows file paths, import statements
3. **Be Actionable:** Provide step-by-step instructions for each change
4. **Be Clear:** Use code blocks, tables, and lists for readability
5. **Validate Compatibility:** Explicitly note Next.js 14 vs Vite differences
6. **Consider Dependencies:** Map out the entire dependency tree
7. **Provide Context:** Explain WHY each change is needed
8. **Use Full Windows Paths:** Every file path must be a complete Windows path starting from `C:\`

### Tools and Approach

Use filesystem analysis tools to:
1. Search for import statements across all TypeScript/JavaScript files in `C:\Users\james\Master\BrightHub\BRun\train-data\src\`
2. Read and analyze source files in `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\`
3. Understand the existing module structure
4. Identify dependencies between files

### Success Criteria

The report is complete when:
- ✅ Every train-wireframe import is documented with full Windows paths
- ✅ Every source file is analyzed with full Windows paths
- ✅ Every migration has a clear target location (full Windows path)
- ✅ Every required code change is specified
- ✅ Dependencies are mapped with full Windows paths
- ✅ Implementation order is defined
- ✅ Risk assessment is complete

Begin your analysis now and generate the complete migration report.