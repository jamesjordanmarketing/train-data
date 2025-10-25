# AI Testing Agent Conductor Prompt - T-3.1.3 Button Icon Support and Extended Functionality

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for T-3.1.3 Button Icon Support and Extended Functionality. Your mission is to validate that the T-3.1.3 implementation meets all functional, visual, and integration requirements through systematic testing phases.

## Enhanced Testing Structure Understanding

**CRITICAL**: T-3.1.3 uses a **Two-Phase Enhanced Testing Structure**:

1. **Phases 1 & 2**: `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md`
   - Pre-testing Environment Setup (Phase 0)
   - Component Discovery & Classification (Phase 1) 
   - Unit Testing (Phase 2)

2. **Phases 3-5**: `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md`
   - Visual Testing (Phase 3)
   - Integration Testing (Phase 4)
   - Final Validation & Reporting (Phase 5)

These files are **complementary and sequential** - complete Phases 1-2 before proceeding to Phases 3-5.

## Execution Protocol

Follow these steps precisely **each time you are invoked with this prompt**:

### Step 1: Context Review and Preparation
```bash
# Navigate to pmc directory
cd pmc

# Review the implementation context from previous agent
cat system/plans/new-tests/02-new-test-carry-context-07-03-25-1038PM.md

# Review current task details
cat core/active-task.md
```

### Step 2: Initialize Testing Environment
```bash
# Archive and reset test approach/discovery files
node system/management/test-approach-and-discovery.js
```

### Step 3: Generate Testing Approach
1. **Read**: `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`
2. **Execute**: Instructions within that file to generate testing approach
3. **Populate**: Run `node bin\aplio-agent-cli.js test-approach` to integrate approach
4. **WAIT**: For human operator approval before proceeding
YOU MUST WAIT FOR HUMAN APPROVAL BEFORE MOVING ON. STOP HERE

### Step 4: Execute Phases 1 & 2 Testing
**Primary Focus**: `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md`

Execute in sequence:
- **Phase 0**: Pre-Testing Environment Setup
- **Phase 1**: Component Discovery & Classification  
- **Phase 2**: Unit Testing

**Success Criteria for Phase 1 & 2**:
- [ ] All T-3.1.3 components discovered and validated
- [ ] Unit tests created with ≥90% coverage
- [ ] TypeScript compilation successful
- [ ] Component imports verified
- [ ] Handoff artifacts generated for Phases 3-5

### Step 5: Execute Phases 3-5 Testing
**Primary Focus**: `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md`

**Prerequisites Check**: Verify Phase 1 & 2 completion before starting
- Component discovery documentation exists
- Unit test coverage reports generated
- Development server accessible

Execute in sequence:
- **Phase 3**: Visual Testing (Screenshots + LLM Vision Analysis)
- **Phase 4**: Integration Testing (Form integration, multiple submission prevention)
- **Phase 5**: Final Validation & Reporting

## T-3.1.3 Specific Requirements

### Critical T-3.1.3 Features to Validate:
1. **Icon Support**: Left/right placement, accessibility attributes
2. **Loading States**: CSS spinner, interaction blocking, screen reader support
3. **Accessibility**: ARIA attributes, keyboard navigation
4. **Performance**: React.memo optimization, consistent heights
5. **Backward Compatibility**: All T-3.1.2 functionality preserved

### Required Test Outputs:
- Unit test coverage reports (≥90%)
- Visual screenshots with LLM Vision analysis
- Integration test results
- Final comprehensive test report
- DSAP compliance verification

### Implementation Status Context:
- **STATUS**: T-3.1.3 is FULLY IMPLEMENTED and functional
- **Test Scaffold**: Available at `app/test-t311-button/page.tsx`
- **Components**: Button component with icon and loading extensions
- **DSAP Report**: Available in test directory

## Error Handling & Recovery

If any phase fails:
1. **Document Issue**: Log specific error details and context
2. **Attempt Fix**: Apply automated correction if possible
3. **Re-run Test**: Execute failed step again
4. **Escalate**: Report to human operator if 3 attempts fail

## Completion Criteria

After executing both enhanced test plans:
1. **Overall Status**: Report PASS/FAIL for each phase
2. **Visual Evidence**: Links to screenshots and LLM Vision reports
3. **Test Artifacts**: Links to coverage reports and test files  
4. **Integration Results**: Form submission and interaction testing
5. **Final Assessment**: Recommendation for production approval

## Key Success Indicators

- ✅ All 6 T-3.1.3 acceptance criteria validated
- ✅ Unit test coverage ≥90% achieved
- ✅ Visual testing confirms design compliance
- ✅ Integration testing passes all scenarios
- ✅ Accessibility compliance verified
- ✅ Performance optimizations confirmed

**REMEMBER**: You are testing a **completed, functional implementation**. Your role is comprehensive validation, not development or fixes.
