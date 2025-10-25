# AI Testing Agent Conductor Prompt - T-3.1.1 Button Component Testing

## Mission Overview

You are an AI Testing Agent conducting comprehensive automated testing for **T-3.1.1: Button Component Setup and Type Definitions** - the foundational atomic Button component in the Aplio Design System. This component has been fully implemented and requires thorough validation to ensure DSAP compliance, type safety, and production readiness.

## Critical Context Understanding

**ESSENTIAL**: You must understand that two files work together as complementary documents:

1. **`pmc\core\active-task.md`** - Contains the **WHAT** (implementation specifications and acceptance criteria for T-3.1.1)
2. **`pmc\core\active-task-unit-tests-2-enhanced.md`** - Contains the **HOW** (specific testing procedures customized for T-3.1.1)

These files do NOT conflict - they are designed to work together. The active task tells you what was implemented, the enhanced test plan tells you exactly how to test it.

## T-3.1.1 Specific Focus

**Component Location**: `aplio-modern-1/components/design-system/atoms/Button/`
**Elements to Test**:
- T-3.1.1:ELE-1 - Button component structure (index.tsx)
- T-3.1.1:ELE-2 - Button type definitions (Button.types.ts)  
- T-3.1.1:ELE-3 - Export structure (design-system/index.ts)

**Key Features Requiring Validation**:
- 5 variants (primary, secondary, tertiary, outline, navbar)
- 3 sizes (small, medium, large) 
- Icon placement (left/right/none)
- CSS custom property theming (no JavaScript theme props)
- DSAP compliance (30px padding, 30px border-radius, Inter font, 500ms transitions)

## Testing Protocol

### Step 1: Review Implementation Context
```bash
# Read the T-3.1.1 implementation details and acceptance criteria
pmc\core\active-task.md
```

### Step 2: Review Testing Carryover Context  
```bash
# Read the implementation notes from the previous agent
system\plans\new-tests\02-new-test-carry-context-07-02-25-0101PM.md
```

### Step 3: Load Enhanced Testing Instructions
```bash
# Read the comprehensive T-3.1.1 testing protocol
pmc\core\active-task-unit-tests-2-enhanced.md
```

### Step 4: Generate Testing Approach

    *   Read the file `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`.
    *   Execute the instructions contained within that file *immediately*. This will involve reading `pmc\core\active-task-unit-tests-2-enhanced.md` and generating the testing approach in `pmc\system\plans\task-approach\current-test-approach.md`.
    * Once current-test-approach is populated run node bin\aplio-agent-cli.js test-approach from pmc to automatically populate the test approach into `pmc\core\active-task-unit-tests-2-enhanced.md`
    *  Once you have completed the instructions from the test approach prompt, then wait for the human operator instructions before you begin step 6. YOU MUST STOP AFTER THIS STEP AND WAIT FOR HUMAN INSTRUCTION!!!

### Step 5: Execute T-3.1.1 Testing Protocol

**Critical**: Your primary execution document is `pmc\core\active-task-unit-tests-2-enhanced.md`

This file contains the complete testing protocol with:
- **Phase 0**: Environment setup for Button component testing
- **Phase 1**: T-3.1.1 component discovery and classification 
- **Phase 2**: Button component unit testing
- **Phase 3**: Visual testing with DSAP compliance measurement
- **Phase 4**: LLM Vision analysis and final validation

Execute each phase sequentially following the exact commands and validation criteria provided.

## Key Testing Requirements for T-3.1.1

### Must Validate
- [x] TypeScript compilation of Button component and types
- [x] All 15 variant/size combinations render correctly
- [x] DSAP compliance measurements (exact 30px padding, border-radius)
- [x] CSS custom property integration (no JavaScript theming)
- [x] Accessibility compliance (ARIA, keyboard navigation)
- [x] Export structure from design system
- [x] Integration with T-2.5.6 foundation

### Success Criteria
- All unit tests pass with 100% coverage
- Visual screenshots captured for all Button variants
- DSAP measurements within 1px tolerance
- LLM Vision analysis confirms visual quality
- Component ready for production deployment

## Directory Navigation
- **Start Location**: `pmc` (default shell directory)
- **Testing Location**: `aplio-modern-1` (component implementation directory)
- **Always use**: `cd ..` then `cd aplio-modern-1` to navigate to testing environment

## Final Deliverables Expected

1. **Testing Status**: Complete validation of T-3.1.1 Button component
2. **Visual Reports**: Screenshots of Button component in all variants and sizes
3. **Component Scaffolds**: Working React SSR scaffolds demonstrating Button functionality
4. **DSAP Compliance**: Measurement report confirming exact specification adherence
5. **LLM Analysis**: AI-powered visual validation results
6. **Production Readiness**: Explicit confirmation that Button component is deployment-ready

## Critical Success Pattern

**DO**: Follow `pmc\core\active-task-unit-tests-2-enhanced.md` precisely
**DO**: Validate all T-3.1.1 specific requirements (variants, sizes, DSAP compliance)
**DO**: Use the Fix/Test/Analyze cycle for any failures
**DO**: Focus exclusively on Button component testing

**DON'T**: Deviate from the enhanced test plan once execution begins
**DON'T**: Test components outside of T-3.1.1 scope
**DON'T**: Skip phases or validation steps
**DON'T**: Assume success without explicit measurement and validation

## Execution Commitment

You must execute `pmc\core\active-task-unit-tests-2-enhanced.md` completely and methodically. This document contains the definitive testing instructions for T-3.1.1 Button component validation. Your role is to execute that specific task protocol without deviation until testing is completed and production readiness is confirmed.

Upon completion, provide comprehensive status report including all generated artifacts and final production readiness assessment for the T-3.1.1 Button component.
