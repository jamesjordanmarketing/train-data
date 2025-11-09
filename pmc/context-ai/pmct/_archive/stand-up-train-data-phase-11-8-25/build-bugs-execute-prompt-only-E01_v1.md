## Implementation Prompt

========================



You are a senior TypeScript developer tasked with fixing critical architectural issues in the Interactive LoRA Conversation Generation Module. You are executing **Phase 0-1: Baseline Establishment and DatabaseError Pattern Fix**.

## CONTEXT

**Product**: System for generating training conversations for LoRA fine-tuning
**Problem**: Codebase stuck between two architectures (Alpha and Beta), causing 40+ type errors and 80+ `as any` casts
**Your Mission**: Fix foundational error handling pattern (29 instances) and establish baseline for subsequent fixes

## TECHNICAL BACKGROUND

**DatabaseError Constructor Signature** (from `src/lib/types/errors.ts`):
```typescript
export class DatabaseError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.DATABASE_ERROR,
    options?: {
      cause?: Error;
      context?: any;
      statusCode?: number;
    }
  ) {
    // Implementation
  }
}
```

**Current Problem**: 29 instances incorrectly pass `error as any` as second parameter where `ErrorCode` is expected. The error object should go in `options.cause`.

**Example of Problem**:
```typescript
// ❌ File: src/lib/conversation-service.ts, Line 96
throw new DatabaseError(
  `Failed to create conversation: ${error.message}`,
  error as any  // WRONG: error object where ErrorCode expected
);
```

**Correct Pattern**:
```typescript
// ✅ Correct
throw new DatabaseError(
  `Failed to create conversation: ${error.message}`,
  ErrorCode.DATABASE_ERROR,
  { cause: error }
);
```

## IMPLEMENTATION TASKS

### PHASE 0: Establish Baseline (30 minutes)

**Task 0.1: Create Rollback Point**

Execute these commands in your terminal:

```bash
# Create baseline tag
git tag before-e01-fixes

# Create feature branch
git checkout -b fix/e01-type-consolidation

# Commit current state
git add -A
git commit -m "Baseline before E01: Type consolidation fixes"
```

**Task 0.2: Count Current Type Casts**

```bash
# Count non-test type casts
grep -rn "as any" src --include="*.ts" --include="*.tsx" \
  --exclude-dir="__tests__" | wc -l

# Save baseline
echo "Baseline cast count: [YOUR COUNT HERE]" > e01-baseline.txt
```

**Task 0.3: Create Validation Script**

Create file `scripts/validate-e01.sh`:

```bash
#!/bin/bash
set -e

echo "🔍 Phase 1: Type checking..."
npm run type-check

echo "🔍 Phase 2: Building..."
npm run build

echo "🔍 Phase 3: Counting remaining casts..."
CAST_COUNT=$(grep -rn "as any" src --include="*.ts" --include="*.tsx" \
  --exclude-dir="__tests__" | wc -l)
echo "Remaining non-test casts: $CAST_COUNT"

echo "✅ E01 validation complete!"
```

Make executable:
```bash
chmod +x scripts/validate-e01.sh
```

### PHASE 1: Fix DatabaseError Pattern (2-3 hours)

**Task 1.1: Fix conversation-service.ts (29 instances)**

**Step 1**: Open `src/lib/conversation-service.ts`

**Step 2**: Find all 29 instances of this pattern:
```typescript
throw new DatabaseError([MESSAGE], error as any);
```

**Step 3**: Replace each with:
```typescript
throw new DatabaseError([MESSAGE], ErrorCode.DATABASE_ERROR, { cause: error });
```

**Affected Lines** (verify these line numbers, they may have shifted):
- Line 96
- Line 103
- Line 133
- Line 147
- Line 235
- Line 253
- Line 318
- Line 325
- Line 355
- Line 360
- Line 413
- Line 420
- Line 461
- Line 468
- Line 495
- Line 502
- Line 562
- Line 589
- Line 620
- Line 700
- Line 768
- Line 795
- Line 817
- Line 836
- Line 843
- Line 872
- Line 888
- Line 916
- Line 932

**Automated Fix Option** (if you prefer):

```bash
# Create fix script
cat > scripts/fix-database-errors.sh << 'EOF'
#!/bin/bash

FILE="src/lib/conversation-service.ts"

# Replace pattern: error as any → ErrorCode.DATABASE_ERROR, { cause: error }
sed -i 's/throw new DatabaseError(\([^,]*\), error as any)/throw new DatabaseError(\1, ErrorCode.DATABASE_ERROR, { cause: error })/g' "$FILE"

echo "✅ Fixed DatabaseError casts in $FILE"
EOF

chmod +x scripts/fix-database-errors.sh
./scripts/fix-database-errors.sh
```

**Step 4**: Verify all instances fixed

```bash
# Should return 0 results
grep -n "DatabaseError.*error as any" src/lib/conversation-service.ts
```

**Step 5**: Add import if missing

Ensure this import exists at top of file:
```typescript
import { ErrorCode } from '@/lib/types/errors';
```

**Step 6**: Test

```bash
npm run type-check
```

**Expected**: Type check should pass for this file

**Task 1.2: Commit DatabaseError Fixes**

```bash
git add src/lib/conversation-service.ts
git commit -m "fix(e01): correct DatabaseError constructor calls in conversation-service

- Replace 'error as any' with ErrorCode.DATABASE_ERROR
- Move error objects to options.cause parameter
- Fixes 29 instances

Impact: Restores proper error handling type safety"
```

### PHASE 2: Fix Conversation Type Imports (1-2 hours)

**Task 2.1: Fix conversation-generator.ts**

**Step 1**: Open `src/lib/conversation-generator.ts`

**Step 2**: Update imports (around line 1-10):

Find:
```typescript
import type { Conversation, Template, ConversationTurn } from '@/lib/types';
```

Replace with:
```typescript
import type { Conversation, ConversationTurn } from '@/lib/types/conversations';
import type { Template } from '@/lib/types';
```

**Step 3**: Remove type casts

Find (around line 270):
```typescript
conversationId: (saved as any).conversationId || saved.id,
```

Replace with:
```typescript
conversationId: saved.conversationId || saved.id,
```

Find (around line 278):
```typescript
    } as any;
```

Replace with:
```typescript
    };
```

**Step 4**: Verify

```bash
npm run type-check
grep -n "as any" src/lib/conversation-generator.ts
```

**Expected**: No type casts remaining in this file

**Task 2.2: Fix generate route**

**Step 1**: Open `src/app/api/conversations/generate/route.ts`

**Step 2**: Update import:

Find:
```typescript
import type { Conversation } from '@/lib/types';
```

Replace with:
```typescript
import type { Conversation } from '@/lib/types/conversations';
```

**Step 3**: Remove type casts

Find (around line 81):
```typescript
cost: (result.conversation as any).actualCostUsd,
```

Replace with:
```typescript
cost: result.conversation.actualCostUsd,
```

Find (around line 86):
```typescript
durationMs: (result.conversation as any).generationDurationMs,
```

Replace with:
```typescript
durationMs: result.conversation.generationDurationMs,
```

**Step 4**: Verify

```bash
npm run type-check
grep -n "as any" src/app/api/conversations/generate/route.ts
```

**Expected**: No type casts remaining in this file

**Task 2.3: Commit Import Fixes**

```bash
git add src/lib/conversation-generator.ts \
        src/app/api/conversations/generate/route.ts

git commit -m "fix(e01): use correct Conversation type from conversations.ts

- Update imports to use @/lib/types/conversations
- Remove unnecessary type casts on conversationId, actualCostUsd, generationDurationMs
- Properties exist in Beta type definition

Impact: Eliminates 4 type casts, aligns with database schema"
```

### FINAL VALIDATION

**Task 3.1: Run Full Validation**

```bash
./scripts/validate-e01.sh
```

**Expected Results**:
- ✅ Type check passes
- ✅ Build succeeds
- ✅ Cast count reduced by ~33 (from baseline)

**Task 3.2: Manual Verification**

Count remaining production casts:
```bash
grep -rn "as any" src --include="*.ts" --include="*.tsx" \
  --exclude-dir="__tests__" | wc -l
```

Compare to baseline in `e01-baseline.txt`. Should be ~33 fewer.

**Task 3.3: Final Commit**

```bash
git add -A
git commit -m "chore(e01): validation complete - type consolidation phase 1

Summary:
- 29 DatabaseError constructor fixes
- 4 Conversation import/cast fixes
- Total: 33 type casts removed
- Type safety partially restored

Validation:
- ✅ Type check passes
- ✅ Build succeeds
- ✅ Error handling functional

Next: E02 - Component fixes and schema alignment"
```

## ACCEPTANCE CRITERIA

Verify all criteria are met before proceeding:

- [ ] All 29 DatabaseError instances fixed in conversation-service.ts
- [ ] Zero `error as any` patterns remain in conversation-service.ts
- [ ] ErrorCode.DATABASE_ERROR import added
- [ ] conversation-generator.ts imports from @/lib/types/conversations
- [ ] 4 type casts removed from conversation-generator.ts and generate route
- [ ] `npm run type-check` passes without errors
- [ ] `npm run build` completes successfully
- [ ] Production cast count reduced by ~33 from baseline
- [ ] Git commits created with descriptive messages
- [ ] Validation script created and executable

## ROLLBACK PROCEDURE

If anything fails:

```bash
# Return to baseline
git reset --hard before-e01-fixes

# Clean working directory
git clean -fd

# Verify baseline restored
npm run type-check
```

## SUCCESS METRICS

**Quantitative**:
- Production casts removed: 33
- Type safety improvement: +20% (from 40% to 60%)
- Build errors: 0

**Qualitative**:
- ✅ Error handling type-safe
- ✅ Conversation types aligned with database
- ✅ Foundation for E02 and E03 established

## NEXT STEPS

After completing E01:
1. Verify all acceptance criteria met
2. Test error handling works (trigger a database error)
3. Document any issues encountered
4. Proceed to E02: Component Fixes and Schema Alignment