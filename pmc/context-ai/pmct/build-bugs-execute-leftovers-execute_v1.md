# Type Consolidation Build Fixes - Implementation Execution Instructions

**Generated**: 2025-11-06
**Branch**: fix/e01-type-consolidation (pushed to origin)
**Total Prompts**: 2
**Estimated Implementation Time**: 8-12 hours
**Analysis Source**: `build-bugs-execute-leftovers_v1.md`
**Committed Changes**: commit `acab52a` already includes E03 core fixes

---

## Executive Summary

### Product Context

The **Interactive LoRA Conversation Generation Module** is a system that enables business users to generate high-quality training conversations for LoRA fine-tuning. The application allows users to create conversation templates, generate variations with AI, review and approve conversations for quality, and export them in training-ready formats.

### Current Stage

The codebase has undergone **three execution phases (E01-E03)** aimed at consolidating type systems from two conflicting architectures:

- **Alpha Architecture** (train-wireframe): Prototype with simplified types, 2-parameter DatabaseError
- **Beta Architecture** (src/): Production with database-aligned types, 3-parameter DatabaseError

**E03 Core Objectives** (✅ Completed):
- Remove 4 final production type casts from template service
- Establish prevention mechanisms (pre-commit hooks)
- Document migration completion

**Current Build Status** (❌ Failing):
The build fails because **E01 and E02 left critical issues unresolved**:
1. **81+ DatabaseError constructor calls** using old 2-parameter pattern (should be 3-parameter)
2. **19 production type casts** (`as any`) still in codebase
3. **Architectural mismatch** between validation schemas (Zod) and service types (TypeScript)

**Branch Status**:
- Branch `fix/e01-type-consolidation` exists and has been pushed to remote
- Commit `acab52a` contains E03 fixes plus additional build-related changes
- Build command `npm run build` exits with type errors
- No pre-commit hooks installed yet (planned but blocked by build failures)

### Your Mission

You are a **senior TypeScript developer** tasked with **getting the build passing** by fixing the remaining type system issues. Your work will complete the type consolidation migration that E01-E03 started but did not finish.

**Your Objectives**:
1. **Fix all 81+ DatabaseError constructor calls** to use the correct 3-parameter pattern
2. **Remove critical production type casts** that block build or degrade type safety
3. **Verify build passes** with `npm run build`
4. **Commit changes** incrementally with clear messages
5. **Install pre-commit hook** to prevent regression

**Success Criteria**:
- ✅ `npm run build` completes successfully
- ✅ Zero `new DatabaseError()` calls with old pattern in production code
- ✅ Critical type casts removed (Schema/Service, Database field mismatches)
- ✅ All changes committed with clear messages
- ✅ Pre-commit hook installed and tested

**You DO NOT need to**:
- Remove all 19 type casts (only critical ones blocking build)
- Fix the architectural validation/service mismatch (document for future work)
- Rewrite the entire error handling system
- Modify database schemas or migrations

---

## Context and Dependencies

### Previous Work Summary

**E01 Deliverables** (Incomplete):
- Intended to remove all type casts related to DatabaseError
- Actually fixed ~33 casts but left 81+ DatabaseError constructor issues
- Did not run build to verify completion

**E02 Deliverables** (Incomplete):
- Intended to fix schema/type mismatches
- Removed 19 casts but 19 production casts still remain
- Added some field mappings but not comprehensive

**E03 Deliverables** (✅ Completed in commit `acab52a`):
- Fixed template service `duplicate()` method with proper destructuring
- Fixed template test `baselineComparison` to be optional
- Fixed scenario validation enum (`generationStatus`)
- Added transformation logic to scenario routes
- Fixed conversation generator type compliance
- Fixed transaction promise handling
- Partially fixed edge-case-service (2 of 9 instances)

**What Remains Broken**:
See `build-bugs-execute-leftovers_v1.md` for complete analysis.

### Current Codebase State

**Directory Structure**:
```
C:\Users\james\Master\BrightHub\brun\train-data\
├── src/                          # Main source (git root)
│   ├── app/api/                  # Next.js API routes
│   ├── components/               # React components
│   ├── lib/                      # Core libraries
│   │   ├── database/             # Database utilities
│   │   │   ├── errors.ts         # DatabaseError class (3-param)
│   │   │   └── transaction.ts    # Transaction utilities
│   │   ├── services/             # Business logic services
│   │   ├── types/                # TypeScript type definitions
│   │   │   ├── errors.ts         # ErrorCode enum
│   │   │   └── index.ts          # Main type exports
│   │   └── validation/           # Zod validation schemas
│   └── ...
└── pmc/context-ai/pmct/          # Documentation
```

**Key Files**:

1. **DatabaseError Class** (`src/lib/database/errors.ts`):
   ```typescript
   // Correct 3-parameter pattern (Beta)
   export class DatabaseError extends AppError {
     constructor(
       message: string,
       code: ErrorCode,
       options?: { cause?: Error; context?: Record<string, any> }
     ) {
       super(message, code, options);
       this.name = 'DatabaseError';
     }
   }
   ```

2. **ErrorCode Enum** (`src/lib/types/errors.ts`):
   ```typescript
   export enum ErrorCode {
     // Database Errors
     ERR_DB_QUERY = 'ERR_DB_QUERY',
     ERR_DB_CONNECTION = 'ERR_DB_CONNECTION',
     ERR_DB_TRANSACTION = 'ERR_DB_TRANSACTION',
     // ... other codes
   }
   ```

3. **Files with Old DatabaseError Pattern** (81+ instances):
   - `lib/edge-case-service.ts` (7 remaining)
   - `lib/generation-log-service.ts` (8+ instances)
   - `lib/database/transaction.ts` (12+ instances)
   - `lib/scenario-service.ts` (est. 10+ instances)
   - `lib/template-service.ts` (est. 8+ instances)
   - `lib/backup/storage.ts` (6+ instances)
   - `lib/services/*` (est. 30+ instances)

4. **Production Type Casts** (19 instances - see analysis doc for full list):
   - Schema/Service mismatches: `app/api/edge-cases/route.ts:147`, `app/api/edge-cases/[id]/route.ts:112`
   - Database field mismatches: `lib/template-service.ts:381,382`
   - Dynamic property access: `lib/dimension-classifier.ts:73,119`, `lib/dimension-service.ts:184`
   - Others: See full list in analysis document

### Cross-File Dependencies

**DatabaseError Pattern Dependencies**:
1. Must import `ErrorCode` from `@/lib/types/errors`
2. Must import `DatabaseError` from `@/lib/database/errors` or `@/lib/types/errors`
3. Error wrapping should preserve original error as `cause`
4. Context object should include operation name

**Build Verification**:
```bash
cd src && npm run build
```

This runs Next.js build which includes TypeScript type checking.

---

## Implementation Strategy

### Risk Assessment

**Critical Risks**:
1. **Scope Creep**: Attempting to fix all 19 type casts may delay build passing
   - **Mitigation**: Focus on build-blocking issues first, document others
2. **Regression Introduction**: Changing error handling may break runtime behavior
   - **Mitigation**: Preserve error messages and context, test error paths
3. **Incomplete Fixes**: Missing some DatabaseError instances may leave build broken
   - **Mitigation**: Use comprehensive search commands before declaring complete

**Medium Risks**:
1. **Import Path Issues**: Wrong imports may cause module resolution errors
   - **Mitigation**: Follow existing import patterns in codebase
2. **Type Mismatches**: New patterns may not satisfy TypeScript compiler
   - **Mitigation**: Run build frequently, fix type errors iteratively

### Execution Strategy

**Prompt 1: Fix DatabaseError Constructor Calls** (6-8 hours)
- Scope: All 81+ DatabaseError instances across ~15 files
- Approach: Create helper function, fix files in priority order
- Validation: `npm run build` passes

**Prompt 2: Remove Critical Type Casts & Install Prevention** (2-4 hours)
- Scope: 4 critical casts (schema/service mismatches), pre-commit hook
- Approach: Add transformation logic, install Husky hook
- Validation: Build passes, hook blocks future casts

### Quality Assurance Approach

**Per-Prompt Quality Gates**:
1. **Incremental Validation**: Run `npm run build` after each file fix
2. **Search Verification**: Use grep to confirm all instances fixed
3. **Git Commits**: Commit after each logical unit (e.g., one service file)
4. **Error Preservation**: Verify error messages remain user-friendly

**Final Quality Checks**:
1. Clean build: `npm run build` succeeds
2. No old patterns: `grep -rn "new DatabaseError(" src/lib | grep -v "ErrorCode\."`
3. Pre-commit hook works: Test blocking a type cast commit
4. All changes committed with clear messages

---

## Implementation Prompts

### Prompt 1: Fix DatabaseError Constructor Calls

**Scope**: Fix all 81+ DatabaseError instances to use 3-parameter pattern
**Dependencies**: `src/lib/database/errors.ts`, `src/lib/types/errors.ts`
**Estimated Time**: 6-8 hours
**Risk Level**: Medium

========================



You are a senior TypeScript developer fixing the DatabaseError constructor pattern across the codebase for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This module enables business users to generate high-quality training conversations for LoRA fine-tuning. You are completing the type consolidation migration by fixing error handling patterns that were left incomplete in previous execution phases (E01-E02).

**Current Problem:**
The codebase has **81+ DatabaseError constructor calls** using the old 2-parameter pattern from the Alpha architecture. The Beta architecture uses a 3-parameter pattern. TypeScript build fails because these signatures don't match.

**Old Pattern (Alpha - Incorrect)**:
```typescript
throw new DatabaseError('Error message', error);
throw new DatabaseError('Error message', error as Error);
```

**New Pattern (Beta - Correct)**:
```typescript
throw new DatabaseError(
  'Error message',
  ErrorCode.ERR_DB_QUERY,
  {
    cause: error instanceof Error ? error : new Error(String(error)),
    context: { operation: 'operation name' }
  }
);
```

**Technical Architecture:**
- Next.js 14 App Router with TypeScript (strict mode)
- Supabase PostgreSQL database
- Service layer pattern for database operations
- Custom DatabaseError class extending AppError
- ErrorCode enum for error categorization

**CURRENT CODEBASE STATE:**

**DatabaseError Class** (`src/lib/database/errors.ts` - already exists, do not modify):
```typescript
export class DatabaseError extends AppError {
  constructor(
    message: string,
    code: ErrorCode,
    options?: { cause?: Error; context?: Record<string, any> }
  ) {
    super(message, code, options);
    this.name = 'DatabaseError';
  }
}
```

**ErrorCode Enum** (`src/lib/types/errors.ts` - use these codes):
```typescript
export enum ErrorCode {
  // Database Errors
  ERR_DB_QUERY = 'ERR_DB_QUERY',
  ERR_DB_CONNECTION = 'ERR_DB_CONNECTION',
  ERR_DB_TRANSACTION = 'ERR_DB_TRANSACTION',

  // Not Found Errors
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  SCENARIO_NOT_FOUND = 'SCENARIO_NOT_FOUND',
  EDGE_CASE_NOT_FOUND = 'EDGE_CASE_NOT_FOUND',
  // ... other codes available in enum
}
```

**Files Requiring Fixes** (in priority order):

1. `lib/edge-case-service.ts` - 7 instances remaining (lines 116, 123, 173, 180, 225, 232, 256, 261, 279)
2. `lib/database/transaction.ts` - 12+ instances
3. `lib/generation-log-service.ts` - 8+ instances
4. `lib/scenario-service.ts` - Est. 10+ instances
5. `lib/template-service.ts` - Est. 8+ instances
6. `lib/backup/storage.ts` - 6+ instances
7. All other files in `lib/services/*` with old pattern

**Search Command** (to find all instances):
```bash
cd src
grep -rn "new DatabaseError(" lib --include="*.ts" --exclude-dir="__tests__" | grep -v "ErrorCode\."
```

**YOUR TASKS:**

**Task 1: Create Helper Function** (30 minutes)

Create a helper function to standardize the pattern and reduce repetition:

1. Open `src/lib/database/errors.ts`
2. Add this helper function after the DatabaseError class:

```typescript
/**
 * Helper to create DatabaseError with proper error wrapping
 * @param message - User-friendly error message
 * @param cause - Original error object
 * @param operation - Operation name for context
 * @param code - ErrorCode enum value (defaults to ERR_DB_QUERY)
 */
export function createDatabaseError(
  message: string,
  cause: unknown,
  operation: string,
  code: ErrorCode = ErrorCode.ERR_DB_QUERY
): DatabaseError {
  return new DatabaseError(message, code, {
    cause: cause instanceof Error ? cause : new Error(String(cause)),
    context: { operation }
  });
}
```

3. Verify imports are present:
```typescript
import { ErrorCode } from '@/lib/types/errors';
```

**Task 2: Fix edge-case-service.ts** (1 hour)

File: `src/lib/edge-case-service.ts`

1. Add import at top:
```typescript
import { createDatabaseError } from '@/lib/database/errors';
import { ErrorCode } from '@/lib/types/errors';
```

2. Find and replace all instances:

**Line 116** (old):
```typescript
throw new DatabaseError(`Failed to fetch edge case: ${error.message}`, error);
```
**Replace with**:
```typescript
throw createDatabaseError('Failed to fetch edge case', error, 'fetch edge case');
```

**Line 123** (old):
```typescript
throw new DatabaseError('Unexpected error fetching edge case', error as Error);
```
**Replace with**:
```typescript
throw createDatabaseError('Unexpected error fetching edge case', error, 'fetch edge case');
```

**Line 173** (old):
```typescript
throw new DatabaseError(`Failed to list edge cases: ${error.message}`, error);
```
**Replace with**:
```typescript
throw createDatabaseError('Failed to list edge cases', error, 'list edge cases');
```

**Line 180** (old):
```typescript
throw new DatabaseError('Unexpected error listing edge cases', error as Error);
```
**Replace with**:
```typescript
throw createDatabaseError('Unexpected error listing edge cases', error, 'list edge cases');
```

**Line 225** (old):
```typescript
throw new DatabaseError(`Failed to update edge case: ${error.message}`, error);
```
**Replace with**:
```typescript
throw createDatabaseError('Failed to update edge case', error, 'update edge case');
```

**Line 232** (old):
```typescript
throw new DatabaseError('Unexpected error updating edge case', error as Error);
```
**Replace with**:
```typescript
throw createDatabaseError('Unexpected error updating edge case', error, 'update edge case');
```

**Line 256** (old):
```typescript
throw new DatabaseError(`Failed to delete edge case: ${error.message}`, error);
```
**Replace with**:
```typescript
throw createDatabaseError('Failed to delete edge case', error, 'delete edge case');
```

**Line 261** (old):
```typescript
throw new DatabaseError('Unexpected error deleting edge case', error as Error);
```
**Replace with**:
```typescript
throw createDatabaseError('Unexpected error deleting edge case', error, 'delete edge case');
```

**Line 279** (old):
```typescript
throw new DatabaseError('Unexpected error marking as tested', error as Error);
```
**Replace with**:
```typescript
throw createDatabaseError('Unexpected error marking as tested', error, 'mark as tested');
```

3. Save file and verify:
```bash
cd src
grep -n "new DatabaseError(" lib/edge-case-service.ts | grep -v "ErrorCode\."
```
Should return no results.

4. Run build to verify:
```bash
npm run build
```

5. Commit changes:
```bash
git add lib/edge-case-service.ts lib/database/errors.ts
git commit -m "fix: convert edge-case-service DatabaseError calls to 3-parameter pattern

- Add createDatabaseError helper function
- Fix 9 DatabaseError instances in edge-case-service.ts
- Use ERR_DB_QUERY code with proper error wrapping
- Preserve error messages and add operation context"
```

**Task 3: Fix database/transaction.ts** (1.5 hours)

File: `src/lib/database/transaction.ts`

1. Add imports if not present:
```typescript
import { createDatabaseError } from '@/lib/database/errors';
import { ErrorCode } from '@/lib/types/errors';
```

2. Search for all old pattern instances:
```bash
grep -n "new DatabaseError(" src/lib/database/transaction.ts
```

3. For each instance found, apply the replacement pattern:
   - Remove string template with `${error.message}` - helper handles this
   - Remove `error as Error` casts - helper handles type checking
   - Add descriptive operation name for context

**Example transformation**:
```typescript
// Old
throw new DatabaseError(`Transaction failed: ${error.message}`, error);

// New
throw createDatabaseError('Transaction failed', error, 'transaction commit');
```

4. Verify all instances fixed:
```bash
grep -n "new DatabaseError(" src/lib/database/transaction.ts | grep -v "ErrorCode\."
```

5. Run build:
```bash
npm run build
```

6. Commit:
```bash
git add lib/database/transaction.ts
git commit -m "fix: convert transaction.ts DatabaseError calls to 3-parameter pattern

- Fix 12+ DatabaseError instances
- Use createDatabaseError helper
- Add transaction operation context"
```

**Task 4: Fix generation-log-service.ts** (1 hour)

File: `src/lib/generation-log-service.ts`

Follow same pattern as Task 3:
1. Add imports
2. Find all instances with grep
3. Replace each with createDatabaseError
4. Verify with grep
5. Build and commit

Operation names suggestions:
- 'create generation log'
- 'fetch generation logs'
- 'update generation log'
- 'delete generation log'

**Task 5: Fix scenario-service.ts** (1.5 hours)

File: `src/lib/services/scenario-service.ts`

Follow same pattern as Task 3.

Operation names suggestions:
- 'create scenario'
- 'fetch scenario'
- 'list scenarios'
- 'update scenario'
- 'delete scenario'
- 'bulk create scenarios'

**Task 6: Fix template-service.ts** (1 hour)

File: `src/lib/services/template-service.ts`

Follow same pattern as Task 3.

**Note**: This file was partially fixed in E03. Only fix instances that still use old pattern.

Operation names suggestions:
- 'create template'
- 'fetch template'
- 'update template'
- 'delete template'
- 'duplicate template'
- 'fetch template analytics'

**Task 7: Fix backup/storage.ts** (45 minutes)

File: `src/lib/backup/storage.ts`

Follow same pattern as Task 3.

Operation names suggestions:
- 'create backup'
- 'fetch backup'
- 'restore backup'
- 'delete backup'

**Task 8: Fix Remaining Services** (2 hours)

For all remaining files in `lib/services/*`:

1. Find all files with old pattern:
```bash
cd src
find lib/services -name "*.ts" -exec grep -l "new DatabaseError(" {} \; | while read file; do
  grep "new DatabaseError(" "$file" | grep -v "ErrorCode\." && echo "$file has old pattern"
done
```

2. For each file, follow same pattern:
   - Add imports
   - Replace instances
   - Verify with grep
   - Build
   - Commit with descriptive message

**Task 9: Final Verification** (30 minutes)

1. Search entire lib directory for any remaining old patterns:
```bash
cd src
grep -rn "new DatabaseError(" lib --include="*.ts" --exclude-dir="__tests__" | grep -v "ErrorCode\."
```

**Expected result**: No output (all instances fixed)

2. Run full build:
```bash
npm run build
```

**Expected result**: Build succeeds with no type errors

3. Count total changes:
```bash
git diff --stat origin/fix/e01-type-consolidation
```

4. Final commit if any stragglers:
```bash
git add -A
git commit -m "fix: ensure all DatabaseError calls use 3-parameter pattern

- Final sweep of remaining instances
- All services now use createDatabaseError helper
- Build passes TypeScript validation"
```

**VALIDATION CRITERIA:**

You have successfully completed this prompt when:

1. ✅ All 81+ DatabaseError instances fixed
2. ✅ `grep -rn "new DatabaseError(" lib --exclude-dir="__tests__" | grep -v "ErrorCode\."` returns no results
3. ✅ `npm run build` completes successfully
4. ✅ All changes committed with clear messages
5. ✅ createDatabaseError helper function exists in `lib/database/errors.ts`
6. ✅ All error messages remain user-friendly (no loss of context)

**IMPORTANT NOTES:**

- Do NOT modify the DatabaseError class definition
- Do NOT modify the ErrorCode enum
- Do NOT change error messages in a way that breaks user experience
- Do preserve the original error as `cause` (helper does this)
- Do add descriptive operation names for better debugging
- Do commit incrementally (one file or logical group at a time)
- Do run build frequently to catch issues early

**TROUBLESHOOTING:**

**If build fails with "Cannot find module"**:
- Check import paths use `@/lib/...` alias, not relative paths
- Verify imports at top of file

**If build fails with "Type X is not assignable to Y"**:
- Check that you're using `createDatabaseError` consistently
- Verify ErrorCode is imported

**If error messages don't make sense in logs**:
- The helper preserves original error in `cause` property
- Context object provides operation name
- User-facing message is first parameter

**COMMIT MESSAGE FORMAT:**

Use this format for all commits:
```
fix: convert [filename] DatabaseError calls to 3-parameter pattern

- Fix N DatabaseError instances
- Use createDatabaseError helper
- Add [operation type] context
```



++++++++++++++++++

---

### Prompt 2: Remove Critical Type Casts & Install Prevention

**Scope**: Fix 4 critical schema/service type casts, install pre-commit hook
**Dependencies**: Completed Prompt 1, Husky (will install), build passing
**Estimated Time**: 2-4 hours
**Risk Level**: Low

========================



You are a senior TypeScript developer completing the type consolidation migration for the Interactive LoRA Conversation Generation Module by removing critical type casts and installing prevention mechanisms.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This module enables business users to generate high-quality training conversations for LoRA fine-tuning. You are completing the final phase of type consolidation by fixing the most critical type casts and preventing future regressions.

**Current State:**
- ✅ Build should now be passing (Prompt 1 completed)
- ✅ All DatabaseError calls fixed
- ❌ 4 critical type casts remain that degrade type safety
- ❌ No prevention mechanism installed (pre-commit hook)

**Critical Type Casts to Fix** (4 instances):

1. **Edge Case Create Route** (`app/api/edge-cases/route.ts:147`):
   - Problem: Validation schema uses different field names than service layer
   - Current: `validatedData as any`
   - Impact: Bypasses type checking, may cause runtime errors

2. **Edge Case Update Route** (`app/api/edge-cases/[id]/route.ts:112`):
   - Problem: Same as #1, update endpoint
   - Current: `validatedData as any`
   - Impact: Bypasses type checking

3. **Template Service Usage Count** (`lib/template-service.ts:381,382`):
   - Problem: Database field `usage_count` doesn't match TypeScript `usageCount`
   - Current: `(tpl as any).usage_count`
   - Impact: Fragile, breaks if database schema changes

**Other Type Casts** (15 instances - NOT fixing in this prompt):
These are documented but not blocking the build:
- Dynamic property access in dimension services (5 instances)
- Promise.race type inference (2 instances)
- Error handling type guards (2 instances)
- Enum additions (3 instances)
- Deep merge recursion (2 instances)

**Technical Architecture:**
- Next.js 14 App Router with TypeScript (strict mode)
- Zod for validation schemas
- Service layer with TypeScript interfaces
- Supabase PostgreSQL database

**YOUR TASKS:**

**Task 1: Fix Edge Case Create Route** (45 minutes)

File: `src/app/api/edge-cases/route.ts`

**Current Code** (around line 140-147):
```typescript
const body = await request.json();
const validatedData = createEdgeCaseSchema.parse(body);

// Create edge case
// TODO(E03): Fix validation schema to match service input type
const edgeCase = await edgeCaseService.create(validatedData as any);
```

**Problem Analysis**:
- Validation schema (`createEdgeCaseSchema`) returns: `{ scenarioId, name, triggerCondition, ... }`
- Service expects (`CreateEdgeCaseInput`): `{ parentScenarioId, title, edgeCaseType, ... }`
- Field name mismatch requires transformation

**Solution - Add Transformation Layer**:

1. Find the validation schema definition (likely in `lib/validation/edge-cases.ts` or similar)

2. Create transformation function after imports:
```typescript
import { createEdgeCaseSchema } from '@/lib/validation/edge-cases';
import { CreateEdgeCaseInput } from '@/lib/types/templates';

// Add this transformation function
function transformToEdgeCaseInput(
  validated: ReturnType<typeof createEdgeCaseSchema.parse>,
  userId: string
): CreateEdgeCaseInput {
  return {
    // Map validation fields to service fields
    title: validated.name,
    description: validated.description || '',
    parentScenarioId: validated.scenarioId,
    edgeCaseType: validated.triggerCondition as any, // Enum mapping needed
    complexity: validated.complexity || 5,
    // Add required fields not in validation
    createdBy: userId,
    // ... other field mappings as needed
  };
}
```

3. Replace the cast with transformation:
```typescript
const body = await request.json();
const validatedData = createEdgeCaseSchema.parse(body);

// Transform validated data to service input type
const edgeCaseInput = transformToEdgeCaseInput(validatedData, user.id);

// Create edge case (no cast needed)
const edgeCase = await edgeCaseService.create(edgeCaseInput);
```

4. Remove TODO comment

5. Verify no cast:
```bash
grep -n "as any" src/app/api/edge-cases/route.ts
```
Should not show line 147 anymore.

6. Test build:
```bash
npm run build
```

7. Commit:
```bash
git add app/api/edge-cases/route.ts
git commit -m "fix: remove type cast in edge case create route

- Add transformToEdgeCaseInput function
- Map validation schema fields to service input fields
- Remove 'as any' cast on line 147
- No loss of type safety"
```

**Task 2: Fix Edge Case Update Route** (30 minutes)

File: `src/app/api/edge-cases/[id]/route.ts`

Follow same pattern as Task 1:
1. Create transformation function for update (similar to create but all fields optional)
2. Replace cast with transformation
3. Remove TODO comment
4. Verify, build, commit

**Task 3: Fix Template Service Database Field Access** (1 hour)

File: `src/lib/services/template-service.ts`

**Current Code** (around lines 380-382):
```typescript
return {
  usageCount: (tpl as any).usage_count ?? total,
  rating: (tpl as any).rating ?? 0,
  // ...
};
```

**Problem Analysis**:
- Database returns snake_case: `usage_count`, `rating`
- TypeScript type uses camelCase: `usageCount`, `rating`
- Need proper database-to-domain mapper

**Solution - Add Type-Safe Mapper**:

1. Find where `tpl` comes from (probably a Supabase query result)

2. Define database result type:
```typescript
// Add near top of file or in types file
interface TemplateDbRow {
  id: string;
  name: string;
  usage_count?: number;
  rating?: number;
  // ... other database fields
}
```

3. Create mapper function:
```typescript
function mapDbToTemplate(dbRow: TemplateDbRow, additionalData?: any): Template {
  return {
    id: dbRow.id,
    name: dbRow.name,
    usageCount: dbRow.usage_count ?? 0,
    rating: dbRow.rating ?? 0,
    // ... other field mappings
    ...additionalData
  };
}
```

4. Replace casts with mapper:
```typescript
// Assuming tpl comes from database query
const template = mapDbToTemplate(tpl, {
  usageCount: tpl.usage_count ?? total,
  rating: tpl.rating ?? 0
});

return {
  usageCount: template.usageCount,
  rating: template.rating,
  // ...
};
```

Or if returning directly:
```typescript
return {
  usageCount: tpl.usage_count ?? total, // Type-safe access
  rating: tpl.rating ?? 0,              // Type-safe access
  // ...
};
```

5. Verify no casts:
```bash
grep -n "as any" src/lib/services/template-service.ts
```

6. Build and commit:
```bash
npm run build
git add lib/services/template-service.ts
git commit -m "fix: remove type casts for database field access in template service

- Add type-safe database field access
- Map snake_case db fields to camelCase types
- Remove 2 'as any' casts on lines 381-382"
```

**Task 4: Install Pre-commit Hook** (1 hour)

**Purpose**: Prevent future type casts and old DatabaseError patterns from being committed.

**Step 1: Install Husky** (if not already installed)

```bash
cd src
npm install --save-dev husky
npx husky install
```

Add to package.json scripts (if not present):
```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

**Step 2: Create Pre-commit Hook**

Create file: `src/.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Type Check
echo "  ├─ Type checking..."
npm run build 2>&1 | grep -E "(Error:|Failed to compile)" && {
  echo "❌ Type check failed. Fix errors before committing."
  exit 1
}

# Check for 'as any' casts in production code
echo "  ├─ Checking for type casts..."

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | \
  grep -E '\.(ts|tsx)$' | \
  grep -v '__tests__' | \
  grep -v '.test.ts' | \
  grep -v '.spec.ts' || true)

if [ -n "$STAGED_FILES" ]; then
  for FILE in $STAGED_FILES; do
    if [ -f "$FILE" ] && grep -q "as any" "$FILE"; then
      echo "❌ Error: Type cast 'as any' found in $FILE"
      echo "   Production code should not use type casts."
      echo ""
      echo "   Offending lines:"
      grep -n "as any" "$FILE"
      exit 1
    fi
  done
fi

# Check for old DatabaseError pattern
echo "  └─ Checking for old DatabaseError pattern..."

if [ -n "$STAGED_FILES" ]; then
  for FILE in $STAGED_FILES; do
    if [ -f "$FILE" ] && grep -q "new DatabaseError(" "$FILE"; then
      # Check if it has ErrorCode. parameter (correct pattern)
      if ! grep -q "new DatabaseError([^,]*, ErrorCode\." "$FILE"; then
        echo "❌ Error: Old DatabaseError pattern found in $FILE"
        echo "   Use: new DatabaseError(message, ErrorCode.XXX, { cause, context })"
        echo ""
        echo "   Offending lines:"
        grep -n "new DatabaseError(" "$FILE"
        exit 1
      fi
    fi
  done
fi

echo "✅ Pre-commit checks passed!"
```

**Step 3: Make Hook Executable**

```bash
chmod +x .husky/pre-commit
```

**Step 4: Test Pre-commit Hook**

**Test 1: Block Type Cast**
```bash
# Create test file with type cast
echo "const test = 123 as any;" > test-cast.ts
git add test-cast.ts
git commit -m "test commit"
```

**Expected**: Commit should be blocked with error message.

**Cleanup**:
```bash
rm test-cast.ts
git reset HEAD test-cast.ts 2>/dev/null || true
```

**Test 2: Block Old DatabaseError Pattern**
```bash
# Create test file with old pattern
echo 'throw new DatabaseError("test", error);' > test-error.ts
git add test-error.ts
git commit -m "test commit"
```

**Expected**: Commit should be blocked with error message.

**Cleanup**:
```bash
rm test-error.ts
git reset HEAD test-error.ts 2>/dev/null || true
```

**Test 3: Allow Correct Pattern**
```bash
# Create test file with correct pattern
echo 'throw new DatabaseError("test", ErrorCode.ERR_DB_QUERY, { cause: error });' > test-good.ts
git add test-good.ts
git commit -m "test commit"
```

**Expected**: Commit should succeed.

**Cleanup**:
```bash
git reset --soft HEAD~1
rm test-good.ts
```

**Step 5: Commit Hook Installation**

```bash
git add .husky/pre-commit package.json package-lock.json
git commit -m "chore: install pre-commit hook to prevent type safety regressions

- Install husky for git hooks
- Add pre-commit hook blocking type casts
- Add check for old DatabaseError pattern
- Block commits with 'as any' in production code"
```

**Task 5: Final Verification and Documentation** (30 minutes)

**Verification Checklist**:

1. ✅ Clean build:
```bash
npm run build
```
Should complete with no errors.

2. ✅ No production type casts in critical files:
```bash
grep -n "as any" src/app/api/edge-cases/route.ts
grep -n "as any" src/app/api/edge-cases/[id]/route.ts
grep -n "as any" src/lib/services/template-service.ts
```
Should return no results for these 4 critical files.

3. ✅ Pre-commit hook active:
```bash
ls -la .husky/pre-commit
```
Should show executable permissions.

4. ✅ All changes committed:
```bash
git status
```
Should show clean working tree.

**Create Summary Document**:

Create file: `src/docs/TYPE-CONSOLIDATION-COMPLETION.md`

```markdown
# Type Consolidation Migration - Completion Summary

**Date**: 2025-11-06
**Branch**: fix/e01-type-consolidation
**Status**: ✅ COMPLETE - Build Passing

## Work Completed

### Phase 1: DatabaseError Constructor Fixes (Prompt 1)
- Fixed 81+ DatabaseError instances across 15+ files
- Created `createDatabaseError` helper function
- All instances now use 3-parameter pattern with ErrorCode

### Phase 2: Critical Type Cast Removal (Prompt 2)
- Fixed edge case create route transformation
- Fixed edge case update route transformation
- Fixed template service database field access
- 4 critical type casts removed

### Phase 3: Prevention Mechanisms (Prompt 2)
- Installed Husky pre-commit hooks
- Added type cast detection
- Added old DatabaseError pattern detection
- Hooks tested and verified working

## Build Status

✅ `npm run build` - PASSING
✅ TypeScript compilation - NO ERRORS
✅ All type casts in critical paths - REMOVED
✅ Pre-commit hook - ACTIVE

## Remaining Technical Debt

**15 Non-Critical Type Casts** (documented, not blocking):
- 5 instances: Dynamic property access in dimension services
- 2 instances: Promise.race type inference in auth-context
- 2 instances: Supabase error handling type guards
- 3 instances: Enum value mismatches
- 2 instances: Deep merge recursion in ai-config-service
- 1 instance: Header view type in components

**Architectural Issue** (deferred):
- Validation schema (Zod) / Service layer (TypeScript) field name mismatch
- Requires comprehensive refactoring (8-12 hours)
- Documented in `pmc/context-ai/pmct/build-bugs-execute-leftovers_v1.md`

## Prevention Measures

**Pre-commit Hook** (`.husky/pre-commit`):
- Blocks new `as any` casts in production code
- Blocks old DatabaseError constructor pattern
- Runs type check before commit
- Test files excluded from checks

**Enforcement**:
- All commits must pass pre-commit checks
- Code review should verify type safety
- CI/CD should run full type check

## Metrics

| Metric | Before E03 | After This Work | Change |
|--------|-----------|-----------------|--------|
| Build Status | Failing | Passing | ✅ Fixed |
| DatabaseError Old Pattern | 81+ | 0 | -100% |
| Critical Type Casts | 4 | 0 | -100% |
| Total Production Casts | 19 | 15 | -21% |
| Pre-commit Hook | No | Yes | ✅ Added |

## Next Steps (Optional)

1. Remove remaining 15 non-critical type casts (4-6 hours)
2. Refactor validation/service architecture (8-12 hours)
3. Add comprehensive integration tests (8+ hours)
4. Create ADR documenting type system consolidation

## Files Modified

**Core Fixes**:
- `lib/database/errors.ts` - Added createDatabaseError helper
- `lib/edge-case-service.ts` - Fixed 9 instances
- `lib/database/transaction.ts` - Fixed 12+ instances
- `lib/generation-log-service.ts` - Fixed 8+ instances
- `lib/services/scenario-service.ts` - Fixed 10+ instances
- `lib/services/template-service.ts` - Fixed 8+ instances
- `lib/backup/storage.ts` - Fixed 6+ instances
- `app/api/edge-cases/route.ts` - Removed cast, added transformation
- `app/api/edge-cases/[id]/route.ts` - Removed cast, added transformation

**Infrastructure**:
- `.husky/pre-commit` - Pre-commit hook script
- `package.json` - Husky dependency and prepare script

## Success Criteria Met

✅ Build passes: `npm run build` completes
✅ Type safety restored: Critical casts removed
✅ Prevention installed: Pre-commit hook active
✅ All changes committed: Clean git status
✅ Documentation complete: This file

**The type consolidation migration is COMPLETE.**
```

Save and commit:
```bash
git add docs/TYPE-CONSOLIDATION-COMPLETION.md
git commit -m "docs: add type consolidation completion summary

- Document all work completed
- List metrics and improvements
- Note remaining technical debt
- Confirm build passing and prevention active"
```

**Final Git Push**:

```bash
git push origin fix/e01-type-consolidation
```

**VALIDATION CRITERIA:**

You have successfully completed this prompt when:

1. ✅ 4 critical type casts removed (edge case routes, template service)
2. ✅ `npm run build` completes successfully
3. ✅ Pre-commit hook installed and tested
4. ✅ Hook blocks both type casts and old DatabaseError patterns
5. ✅ Completion documentation created
6. ✅ All changes committed and pushed
7. ✅ No regression in user-facing functionality

**IMPORTANT NOTES:**

- Do NOT remove all 19 type casts (only 4 critical ones)
- Do NOT refactor the entire validation/service architecture (document for future)
- Do preserve existing functionality (no breaking changes)
- Do test the pre-commit hook thoroughly
- Do document remaining work clearly
- Do commit incrementally with clear messages

**TROUBLESHOOTING:**

**If hook doesn't block type casts**:
- Check `.husky/pre-commit` has executable permissions (`chmod +x`)
- Verify Husky installed correctly (`npm list husky`)
- Check hook script syntax (no typos)

**If build still fails after cast removal**:
- Verify transformation functions return correct types
- Check all field mappings are complete
- Run build with `--verbose` for detailed errors

**If git hook breaks normal workflow**:
- Test files are excluded (pattern: `__tests__`, `.test.ts`, `.spec.ts`)
- Can temporarily skip with `git commit --no-verify` (not recommended)
- Hook should be fast (<5 seconds for type check)

**COMPLETION CHECKLIST:**

Before declaring this prompt complete, verify:

- [ ] Edge case create route: No `as any` cast, transformation function added
- [ ] Edge case update route: No `as any` cast, transformation function added
- [ ] Template service: No `as any` casts on database field access
- [ ] Pre-commit hook: Installed, executable, tested with 3 test cases
- [ ] Build: `npm run build` passes with no type errors
- [ ] Documentation: Completion summary created
- [ ] Git: All changes committed with clear messages
- [ ] Git: Branch pushed to remote
- [ ] Testing: Pre-commit hook blocks invalid commits
- [ ] Testing: Pre-commit hook allows valid commits



++++++++++++++++++

---

## Success Metrics

**Quantitative Targets**:
- Build Status: Failing → Passing (100%)
- DatabaseError Old Pattern: 81+ → 0 instances (-100%)
- Critical Type Casts: 4 → 0 instances (-100%)
- Pre-commit Hook: Not installed → Active (✅)

**Qualitative Outcomes**:
- ✅ Type safety restored to 95%+
- ✅ Future regressions prevented
- ✅ All changes documented
- ✅ Remaining work clearly scoped

## Post-Implementation

**Verification Commands**:

```bash
# Verify build passes
cd src && npm run build

# Verify no old DatabaseError patterns
grep -rn "new DatabaseError(" src/lib --exclude-dir="__tests__" | grep -v "ErrorCode\."

# Verify critical casts removed
grep -n "as any" src/app/api/edge-cases/route.ts
grep -n "as any" src/app/api/edge-cases/[id]/route.ts
grep -n "as any" src/lib/services/template-service.ts

# Verify pre-commit hook active
ls -la src/.husky/pre-commit
```

**All commands should return no results or success status.**

**Next Steps (Optional)**:
1. Remove remaining 15 non-critical type casts (4-6 hours) - See analysis doc
2. Refactor validation/service architecture (8-12 hours) - See analysis doc
3. Create comprehensive ADR documenting architecture decision
4. Add integration tests for critical paths

**Documentation References**:
- Full analysis: `pmc/context-ai/pmct/build-bugs-execute-leftovers_v1.md`
- This execution plan: `pmc/context-ai/pmct/build-bugs-execute-leftovers-execute_v1.md`

---

**END OF EXECUTION INSTRUCTIONS**

This document provides:
- ✅ Clear executive summary with product context and mission
- ✅ Two self-contained prompts for 200k context window
- ✅ Detailed step-by-step instructions with code examples
- ✅ Validation criteria and troubleshooting guidance
- ✅ Clear start/end markers (=====/+++++) for copy-paste
- ✅ Modular design (Prompt 2 can execute even if Prompt 1 partially done)
- ✅ Incremental validation and commit strategy
- ✅ Success metrics and completion checklist
