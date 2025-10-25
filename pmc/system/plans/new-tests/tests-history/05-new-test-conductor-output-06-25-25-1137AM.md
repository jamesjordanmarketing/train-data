# AI Testing Agent Conductor Prompt - T-2.4.2 Documentation Testing

## Overview

You are an AI Testing Agent responsible for conducting comprehensive documentation validation testing for **T-2.4.2 Responsive Layout Pattern Documentation**. Your primary goal is to validate that the production-certified documentation suite meets all enterprise deployment standards through systematic testing of cross-references, legacy pattern accuracy, TypeScript compilation, and content coverage.

## Critical Context for T-2.4.2

**Task Type**: Documentation Validation Testing (NOT React Component Testing)  
**Implementation Status**: PRODUCTION CERTIFIED ✅  
**Testing Focus**: Validate 84.6KB documentation suite with 5 interconnected files  
**Success Requirement**: 100% validation across all critical testing areas  

## Your Mission

Execute comprehensive documentation testing for T-2.4.2 following the specialized testing protocol designed for documentation validation. Follow these steps precisely:

### Step 1: Review T-2.4.2 Testing Context

You must first understand what you are testing by reading these files in this exact order:

1. **Implementation Context**: Read `pmc\system\plans\new-tests\02-new-test-carry-context-06-25-25-1137AM.md`
   - This contains critical T-2.4.2 implementation details
   - Documents what was accomplished and production certification status
   - Provides testing focus areas and requirements specific to documentation validation

2. **Active Task Details**: Review `pmc\core\active-task.md`
   - Understand T-2.4.2 specifications and acceptance criteria
   - Note implementation location and dependencies
   - Confirm production certification achievements

### Step 2: Understand Your Specialized Testing Approach

3. **Enhanced Testing Protocol**: Study `pmc\core\active-task-unit-tests-2-enhanced.md`
   - This contains the complete T-2.4.2-specific testing protocol
   - Adapted specifically for documentation testing (NOT React component testing)
   - Provides 6 phases of documentation validation testing
   - Contains directive instructions for cross-reference validation, legacy pattern accuracy, TypeScript compilation, and content coverage

**CRITICAL UNDERSTANDING**: The enhanced testing protocol has been specifically adapted for T-2.4.2 documentation testing:
- ❌ NO React component testing required
- ❌ NO interactive user interface testing needed
- ✅ Documentation file validation required
- ✅ Cross-reference link testing required
- ✅ Legacy pattern accuracy validation required
- ✅ TypeScript example compilation testing required

### Step 3: Archive and Reset Test Environment

4. **Prepare Testing Environment**:
   ```bash
   cd pmc
   node system\management\test-approach-and-discovery.js
   ```
   - This archives existing test files and creates clean environment for T-2.4.2 testing

### Step 4: Generate Testing Approach

5. **Create T-2.4.2 Testing Approach**:
   - Read `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`
   - Execute the instructions to generate testing approach in `pmc\system\plans\task-approach\current-test-approach.md`
   - Run: `node bin\aplio-agent-cli.js test-approach` from pmc
   - Wait for human operator instructions before proceeding

### Step 5: Execute T-2.4.2 Documentation Testing

6. **Execute Complete Documentation Validation**:
   - Follow `pmc\core\active-task-unit-tests-2-enhanced.md` exactly
   - Execute all 6 phases of documentation testing:
     - Phase 0: Environment Setup
     - Phase 1: Documentation Discovery
     - Phase 2: Cross-Reference Testing
     - Phase 3: Legacy Pattern Accuracy
     - Phase 4: TypeScript Compilation
     - Phase 5: Content Coverage Validation
     - Phase 6: Final Integration Testing

## T-2.4.2 Testing Success Criteria

You must achieve 100% success on:
- ✅ All 5 documentation files exist and are properly structured
- ✅ All 4 cross-references to T-2.4.1 breakpoint system are functional
- ✅ 100% accuracy match between documented patterns and actual legacy code
- ✅ All TypeScript examples compile successfully with strict mode
- ✅ All 4 acceptance criteria are fully documented
- ✅ Documentation quality meets production deployment standards

## Key Files for T-2.4.2 Testing

**Primary Testing Target**: `aplio-modern-1/design-system/docs/responsive/layouts/`
- `layout-definitions.md` (9.9KB, 346 lines)
- `layout-implementation-guidelines.md` (17KB, 630 lines)
- `layout-constraints-specifications.md` (18KB, 551 lines)
- `layout-testing-guide.md` (9.7KB, 325 lines)
- `layout-visual-reference.md` (30KB, 641 lines)

**Critical Dependencies**:
- `aplio-modern-1/design-system/docs/responsive/breakpoints/breakpoint-definitions.md` (T-2.4.1 system)
- `aplio-legacy/components/home-4/Feature.jsx` (legacy grid patterns)
- `aplio-legacy/components/navbar/PrimaryNavbar.jsx` (legacy mobile patterns)

## Important Testing Adaptations for T-2.4.2

**What Makes T-2.4.2 Different**:
- This is documentation testing, not component testing
- Focus on file validation, not UI testing
- Cross-reference functionality instead of user interactions
- TypeScript compilation instead of runtime behavior
- Content coverage instead of visual regression

**Testing Tools Adaptation**:
- Use file system testing for cross-reference validation
- Use TypeScript compiler for code example validation
- Use content analysis for documentation completeness
- Use pattern matching for legacy code accuracy

## Final Testing Report Requirements

After completing all testing phases, provide:
1. **Documentation Validation Status**: Complete validation results for all 5 files
2. **Cross-Reference Testing Results**: Functionality report for all T-2.4.1 links
3. **Legacy Pattern Accuracy Report**: 100% accuracy validation results
4. **TypeScript Compilation Report**: All code examples compilation status
5. **Content Coverage Report**: All 4 acceptance criteria validation
6. **Production Deployment Recommendation**: Final certification status

## Critical Success Path

1. ✅ Understand T-2.4.2 is documentation testing (not React components)
2. ✅ Read implementation context from carry-over file
3. ✅ Follow enhanced testing protocol exactly
4. ✅ Execute 6 phases of documentation validation
5. ✅ Achieve 100% success on all critical requirements
6. ✅ Confirm T-2.4.2 production certification through testing

**Your success depends on understanding that T-2.4.2 testing is fundamentally different from React component testing. Follow the enhanced protocol exactly - it has been specifically adapted for documentation validation.**
