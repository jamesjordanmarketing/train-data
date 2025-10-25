# AI Testing Agent Conductor Prompt - T-3.3.2 Desktop Navigation Testing

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for T-3.3.2 Desktop Navigation Implementation. Your primary goal is to validate that the desktop navigation component meets both functional and visual requirements while autonomously identifying and fixing issues through iterative cycles.

Your primary mission is to orchestrate the complete 5-phase testing process for T-3.3.2 using the enhanced two-file testing methodology. All test system commands are best run from the aplio-modern-1 directory. Follow these steps precisely **each time you are invoked with this prompt**:

## CRITICAL CONTEXT: Two-Phase Testing Structure

**MANDATORY UNDERSTANDING**: T-3.3.2 testing uses a two-file enhanced methodology:

1. **Phase 1-2 File**: `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md`
   - Covers: Environment Setup, Component Discovery, Unit Testing
   - Focus: Foundation validation, component import, unit test execution
   - Completion: Creates comprehensive handoff report for Phase 3-5

2. **Phase 3-5 File**: `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md`
   - Covers: Visual Testing, LLM Vision Analysis, Final Validation
   - Focus: Screenshot capture, visual analysis, comprehensive reporting
   - Prerequisites: Phase 1-2 completion verification required

**These files are complementary and must be executed in sequence - they do not conflict.**

## Step-by-Step Testing Execution

### Step 1: Review Testing Context and Implementation Notes ⚠️ CRITICAL FIRST STEP
- **MANDATORY**: Load and thoroughly analyze `system\plans\new-tests\02-new-test-carry-context-07-10-25-1015PM.md`
- **Purpose**: Understand T-3.3.2 implementation details, foundation integration, and testing requirements
- **Key Focus**: T-3.3.2 builds on validated T-3.3.1 foundation architecture - do not recreate existing foundations
- **Implementation Context**: Complete desktop navigation with dropdown, mega menu, and accessibility features

### Step 2: Analyze Current Task Specifications
- **Primary Source**: Review `pmc\core\active-task.md` for T-3.3.2 specifications
- **Focus Areas**: Component specifications, acceptance criteria, and integration requirements
- **Foundation Integration**: Understand useNavigationState and useStickyNavigation hook usage

### Step 3: Archive and Reset Test Files
- **Purpose**: Create clean slate for T-3.3.2 testing cycle
- **Command**: Run from pmc directory
  ```bash
  node system/management/test-approach-and-discovery.js
  ```
- **Outcome**: Archives existing test files and creates blank versions for new testing cycle

### Step 4: Generate Testing Approach
- **Primary Source**: Read `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`
- **Action**: Execute instructions immediately to generate testing approach
- **Target**: Populate `pmc\system\plans\task-approach\current-test-approach.md`
- **Integration**: Run `node bin\aplio-agent-cli.js test-approach` from pmc
- **Wait**: Complete approach generation before proceeding to execution

### Step 5: Execute Phase 1-2 Testing (Environment + Unit Testing)
- **Primary Source**: `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md`
- **Execution Steps**:
  1. **Phase 0**: Pre-Testing Environment Setup
  2. **Phase 1**: Component Discovery & Classification
  3. **Phase 2**: Unit Testing with Enhanced T-3.3.2 Test Cases
- **Critical Requirements**:
  - Test server must be running on port 3333
  - Dashboard must be running on port 3334
  - All 4 T-3.3.2 elements must be discovered and classified
  - 15+ unit tests must pass with 90%+ coverage
  - Enhanced scaffolds must be generated for visual testing
- **Completion Criteria**: Phase 1-2 handoff report must be completed before proceeding
This ends the current processing. You will stop here and wait for human operator instruction.
***YOU MUST STOP HERE******YOU MUST STOP HERE******YOU MUST STOP HERE******YOU MUST STOP HERE***
### Step 6: Execute Phase 3-5 Testing (Visual + Analysis + Reporting)
- **Primary Source**: `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md`
- **Prerequisites**: MUST verify Phase 1-2 completion before starting
- **Execution Steps**:
  1. **Phase 3**: Visual Testing (Screenshot capture for all T-3.3.2 states)
  2. **Phase 4**: LLM Vision Analysis (95%+ confidence required)
  3. **Phase 5**: Validation & Reporting (Comprehensive final report)
- **Critical Requirements**:
  - Multiple screenshot states: default, hover, dropdown-open, mega-menu-open
  - LLM Vision analysis with 95%+ confidence scores
  - Component boundary validation (green for client, blue for utility)
  - Visual fidelity confirmation with legacy PrimaryNavbar
  - Comprehensive final testing report generation

## T-3.3.2 Specific Testing Focus

### High-Priority Testing Areas
- **DesktopNavigation Component**: Complete client component with dropdown and mega menu functionality
- **Foundation Integration**: Proper integration with T-3.3.1 hooks (useNavigationState, useStickyNavigation)
- **Visual Fidelity**: Exact match to legacy PrimaryNavbar styling and behavior
- **Animation Performance**: duration-500 timing validation at 60fps

### Medium-Priority Testing Areas
- **Accessibility Configuration**: NavigationAccessibilityConfig interface compliance
- **State Management**: Dropdown open/close behavior and outside click detection
- **Responsive Behavior**: Multi-breakpoint validation

### Low-Priority Testing Areas
- **cnUtility Function**: Basic class name concatenation functionality
- **TypeScript Interfaces**: Type safety validation

## Success Criteria for T-3.3.2

### Phase 1-2 Success Criteria
- ✅ All 4 T-3.3.2 elements discovered and classified
- ✅ 15+ unit tests pass with 90%+ coverage
- ✅ Enhanced scaffolds generated with proper boundaries
- ✅ TypeScript compilation with zero errors
- ✅ Foundation hooks integration validated

### Phase 3-5 Success Criteria
- ✅ 5+ high-quality screenshots captured
- ✅ LLM Vision analysis with 95%+ confidence
- ✅ Visual fidelity confirmed with legacy design
- ✅ Animation performance validated
- ✅ Comprehensive testing report generated

## Error Handling & Fix/Test/Analyze Cycle

For any failed validation step in ANY phase:
1. **Log Issue**: Document failure details and error messages
2. **Attempt Fix**: Apply automated correction if possible
3. **Re-run Test**: Execute the failed step again
4. **Evaluate Results**: Check if issue is resolved
5. **Update Artifacts**: Regenerate affected files (scaffolds, screenshots, reports)
6. **Repeat**: Continue until success or maximum iterations reached (default: 3 attempts)

## Final Deliverables

After completing all phases, provide:
1. **Overall Testing Status**: Phase-by-phase completion confirmation
2. **Visual Test Reports**: Links to generated screenshots and analysis
3. **Component Scaffolds**: Links to working component scaffolds
4. **Coverage Reports**: Unit test coverage metrics
5. **LLM Vision Results**: Confidence scores and analysis reports
6. **Final Report**: Comprehensive testing documentation
7. **Recommendations**: Any manual review requirements

## IMPORTANT EXECUTION NOTES

- **Do NOT deviate** from the instructions in the phase-specific files once you begin
- **Execute phases sequentially** - Phase 3-5 requires Phase 1-2 completion
- **Use Fix/Test/Analyze cycle** for any failures
- **Maintain 90%+ test coverage** throughout all phases
- **Ensure 95%+ LLM Vision confidence** for all components
- **Document all testing artifacts** for human validation

The two-phase testing structure ensures comprehensive validation while maintaining clear separation between foundation/unit testing and visual/integration testing. Both files work together to provide complete T-3.3.2 testing coverage.
