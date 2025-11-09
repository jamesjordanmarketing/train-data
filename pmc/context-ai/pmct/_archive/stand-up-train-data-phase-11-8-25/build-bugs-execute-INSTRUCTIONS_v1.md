# Build Error Fix - Execution Instructions

**Date**: November 5, 2025
**Status**: Ready for Execution
**Total Segments**: 3 (E01, E02, E03)
**Estimated Total Time**: 12-18 hours
**Source Document**: `build-bugs-architecture_v2.md`

---

## What Was Created

I've transformed the large architectural specification (`build-bugs-architecture_v2.md`) into **3 executable prompt files** that you can copy/paste directly into Claude Sonnet 4.5 Thinking with 200k context in Cursor.

### Files Created

1. **`build-bugs-execute-prompt-E01_v1.md`** - Type System Consolidation
   - DatabaseError pattern fixes (29 instances)
   - Conversation type import fixes (4 instances)
   - Baseline establishment
   - **Time**: 4-6 hours
   - **Removes**: 33 type casts

2. **`build-bugs-execute-prompt-E02_v1.md`** - Component & Schema Alignment
   - Component type fixes (10 instances)
   - Schema validation alignment (2 instances)
   - Export log enhancements (7 instances + migration)
   - **Time**: 5-7 hours
   - **Removes**: 19 type casts

3. **`build-bugs-execute-prompt-E03_v1.md`** - Service Standardization & Cleanup
   - Template service fixes (3 instances)
   - Template test baseline (1 instance)
   - Pre-commit hook establishment
   - Final documentation
   - **Time**: 3-5 hours
   - **Removes**: 4 type casts

---

## How to Execute

### Prerequisites

Before starting:
- [ ] Ensure you're in the working directory: `C:\Users\james\Master\BrightHub\brun\train-data`
- [ ] Ensure `npm run type-check` and `npm run build` work
- [ ] Have access to Supabase for migrations (E02 requires one SQL migration)
- [ ] Have Cursor IDE open with Claude Sonnet 4.5 Thinking enabled

### Execution Sequence

**IMPORTANT**: Execute in order: E01 → E02 → E03

Each segment is independent but builds on the previous one's foundation.

---

## Segment 1: E01 (Type System Consolidation)

### Step 1: Open E01 File

Open: `build-bugs-execute-prompt-E01_v1.md`

### Step 2: Locate the Prompt

Scroll to the section marked with:
```
========================
```

### Step 3: Copy the Prompt

Select everything between:
- **Start**: `========================` (line after the separator)
- **End**: `++++++++++++++++++` (line before the separator)

This is the complete, self-contained prompt.

### Step 4: Paste into Cursor

1. Open Cursor IDE
2. Ensure you're using Claude Sonnet 4.5 Thinking (200k context)
3. Paste the entire prompt
4. Press Enter

### Step 5: Let Claude Execute

Claude will:
1. Create baseline and validation scripts
2. Fix 29 DatabaseError instances
3. Fix 4 Conversation import issues
4. Run validation
5. Create git commits

**Estimated Time**: 4-6 hours

### Step 6: Verify Success

Check acceptance criteria in the file. All should be ✅:
- [ ] All 29 DatabaseError instances fixed
- [ ] 4 type casts removed
- [ ] Type check passes
- [ ] Build succeeds
- [ ] ~33 fewer casts than baseline

### Step 7: Take a Break

Before proceeding to E02, verify everything works:
```bash
npm run type-check
npm run build
```

---

## Segment 2: E02 (Component & Schema Alignment)

### Prerequisites for E02

- [ ] E01 completed successfully
- [ ] Build is passing
- [ ] You have Supabase database access

### Step 1: Open E02 File

Open: `build-bugs-execute-prompt-E02_v1.md`

### Step 2: Locate the Prompt

Find the section marked with:
```
========================
```

### Step 3: Copy the Prompt

Select everything between the separators (same as E01).

### Step 4: **IMPORTANT - Database Migration**

E02 includes a database migration. You'll need to:

1. The prompt will create: `supabase/migrations/20251105_add_export_download_count.sql`
2. **You** need to execute this SQL in Supabase Dashboard:
   - Open Supabase SQL Editor
   - Run the migration
   - Verify success

The prompt will guide you through this.

### Step 5: Paste into Cursor

1. Start a **new Cursor session** (200k context)
2. Paste the E02 prompt
3. Press Enter

### Step 6: Let Claude Execute

Claude will:
1. Add missing properties to Conversation type
2. Remove 10 component type casts
3. Align EdgeCase schemas
4. Add ExportLog.downloaded_count field
5. Create database migration (you execute it)
6. Run validation

**Estimated Time**: 5-7 hours

### Step 7: Execute Database Migration

When prompted, run the SQL migration in Supabase.

### Step 8: Verify Success

- [ ] Zero casts in ConversationMetadataPanel
- [ ] EdgeCase schemas aligned
- [ ] Database migration successful
- [ ] Type check passes
- [ ] Build succeeds

### Step 9: Manual Testing

Test the component:
```bash
npm run dev
# Navigate to conversations
# Open metadata panel
# Verify chunk context displays
```

---

## Segment 3: E03 (Final Cleanup & Prevention)

### Prerequisites for E03

- [ ] E01 and E02 completed successfully
- [ ] Build is passing
- [ ] Husky installed (for pre-commit hooks)

### Step 1: Open E03 File

Open: `build-bugs-execute-prompt-E03_v1.md`

### Step 2: Copy the Prompt

Same process: find `========================` markers and copy content between them.

### Step 3: Paste into Cursor

1. Start a **new Cursor session** (200k context)
2. Paste the E03 prompt
3. Press Enter

### Step 4: Let Claude Execute

Claude will:
1. Fix template service field omission (3 casts)
2. Fix template test baseline (1 cast)
3. Create pre-commit hook
4. Create documentation (ADR + summary)
5. Run final validation
6. Create git tag

**Estimated Time**: 3-5 hours

### Step 5: Test Pre-commit Hook

Verify the hook works:
```bash
# Try to commit a file with 'as any'
echo "const test = {} as any;" > test.ts
git add test.ts
git commit -m "test"
# Should be blocked!
```

### Step 6: Final Verification

- [ ] Zero production type casts
- [ ] Pre-commit hook operational
- [ ] Documentation created
- [ ] Type safety = 95%
- [ ] Build passes
- [ ] All manual tests pass

---

## Important Notes

### Prompt Format

Each prompt is marked with:
- **Start**: `========================` (with 3 blank lines after)
- **End**: `++++++++++++++++++` (with 3 blank lines after)

**Copy only the content between these markers.**

### Independent Execution

Each prompt is fully self-contained with:
- Complete context about the product
- Technical background
- Existing code patterns
- Step-by-step instructions
- Acceptance criteria
- Validation procedures

You don't need to reference the v2 architecture document when executing.

### New Context per Segment

Start a **fresh Cursor session** for each segment (E01, E02, E03). This ensures:
- Clean 200k context window
- No carryover confusion
- Clear separation of concerns

### Rollback Procedures

Each segment includes rollback instructions if something fails. All changes are committed incrementally, so you can easily revert.

---

## Validation After Each Segment

After completing each segment, verify:

```bash
# Type check
npm run type-check

# Build
npm run build

# Count remaining casts
grep -rn "as any" src --include="*.ts" --include="*.tsx" \
  --exclude-dir="__tests__" | wc -l
```

---

## Expected Timeline

| Segment | Focus | Time | Casts Removed |
|---------|-------|------|---------------|
| E01 | Error handling + imports | 4-6 hours | 33 |
| E02 | Components + schemas | 5-7 hours | 19 |
| E03 | Services + prevention | 3-5 hours | 4 |
| **Total** | **Full consolidation** | **12-18 hours** | **56** |

---

## Success Metrics

After completing all 3 segments:

**Quantitative**:
- Production type casts: 0 (down from 52)
- Type safety: 95% (up from 40%)
- Build errors: 0

**Qualitative**:
- ✅ All error handling type-safe
- ✅ All components fully typed
- ✅ All schemas aligned with database
- ✅ Pre-commit hook preventing regression
- ✅ Complete documentation

---

## Troubleshooting

### If Type Check Fails

1. Read the error message carefully
2. Check if line numbers shifted (prompts reference approximate lines)
3. Use rollback procedure in that segment's file
4. Review acceptance criteria to ensure all steps completed

### If Build Fails

1. Clear build cache: `rm -rf .next dist node_modules/.cache`
2. Retry build: `npm run build`
3. Check for syntax errors introduced
4. Use git to review changes: `git diff`

### If Pre-commit Hook Blocks Valid Code

Edit `.husky/pre-commit` to exclude specific patterns if needed.

### If Database Migration Fails

Check:
- Column doesn't already exist
- Table name is correct (`export_logs`)
- You have sufficient permissions

---

## After Completion

Once all 3 segments are done:

1. **Share with Team**: Review documentation created in E03
2. **Train Team**: Explain Beta architecture standards
3. **Monitor**: Watch for pre-commit hook issues
4. **Archive**: Consider moving `train-wireframe` to separate repo
5. **Celebrate**: Major architectural consolidation complete! 🎉

---

## Files Reference

**Execution Prompts**:
- `build-bugs-execute-prompt-E01_v1.md` - Start here
- `build-bugs-execute-prompt-E02_v1.md` - Then this
- `build-bugs-execute-prompt-E03_v1.md` - Finally this

**Source Documentation**:
- `build-bugs-architecture_v1.md` - Original analysis
- `build-bugs-architecture_v2.md` - Complete solution with unwinding procedures

**Generated Documentation** (created by E03):
- `docs/ADR-001-type-consolidation.md` - Architecture decision record
- `docs/TYPE-CONSOLIDATION-SUMMARY.md` - Migration summary

---

## Questions?

If you encounter issues:
1. Check the segment's "Rollback Procedures" section
2. Review the acceptance criteria
3. Check git history: `git log --oneline`
4. Verify baseline state can be restored

**Ready to begin?** Start with E01!
