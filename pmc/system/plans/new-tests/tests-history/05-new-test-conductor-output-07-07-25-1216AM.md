# AI Testing Agent Conductor Prompt - T-3.2.2 AccordionItem Implementation

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for the **T-3.2.2 AccordionItem Implementation**. Your mission is to execute the complete enhanced testing protocol covering discovery, unit testing, visual regression, integration testing, and final validation for the AccordionItem component with expand/collapse animations and accessibility features.

## Important: Dual Test Plan Structure

This testing cycle uses a **two-phase enhanced test plan structure**:

1. **Phases 1 & 2**: `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md`
   - Component discovery, classification, and comprehensive unit testing
   - Code coverage validation and accessibility compliance
   
2. **Phases 3-5**: `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md`
   - Visual regression testing with enhanced LLM vision analysis
   - Integration testing and final validation with comprehensive reporting

**CRITICAL**: These are complementary files that must be executed sequentially. Complete Phases 1-2 entirely before proceeding to Phases 3-5.

## Your Testing Mission for T-3.2.2

**Target Implementation**: AccordionItem component with four key elements:
- `AccordionItem.tsx` - Main client component with state management
- `AccordionItem.module.css` - Visual styling matching legacy FaqItem
- `AccordionIcon.tsx` - Icon component with state transitions
- `useAccordionAnimation.ts` - Animation timing and height management hook

**Success Criteria**: Validate all 6 acceptance criteria:
1. Visual fidelity to legacy implementation (≥95% LLM confidence)
2. Smooth expand/collapse animations (300ms ±10ms timing)
3. Icon transition synchronization with content state
4. Complete ARIA accordion pattern compliance
5. Keyboard navigation functionality (Enter/Space keys)
6. Variable height content handling capability

## Step-by-Step Execution Protocol

### Step 1: Review T-3.2.2 Context and Implementation Notes
```bash
# Navigate to pmc directory first
cd pmc
```

**Read in this exact order**:
1. **`pmc\core\active-task.md`** - T-3.2.2 task specifications and acceptance criteria
2. **`system\plans\new-tests\02-new-test-carry-context-07-07-25-1216AM.md`** - Critical implementation context from the development agent including:
   - COMPLETED implementation details with 98% DSAP compliance
   - 25-test comprehensive suite already created
   - Enhanced animation timing (320ms timeout vs 300ms CSS)
   - Visual fidelity requirements to legacy FaqItem component
   - Critical testing focus areas and success criteria

### Step 2: Execute Phases 1 & 2 Testing
**Load and execute**: `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md`

**Phase 1 - Discovery & Classification**:
- Navigate to aplio-modern-1 directory: `cd .. && cd aplio-modern-1`
- Create test infrastructure and directory structure
- Discover and validate all 4 T-3.2.2 components
- Generate component classification report

**Phase 2 - Unit Testing**:
- Execute comprehensive 25-test suite: `test/unit-tests/task-3-2/T-3.2.2/T-3.2.2-AccordionItem.test.tsx`
- Validate 90% code coverage requirement (expect 94% achievement)
- Confirm animation timing within 300ms ±10ms tolerance
- Validate accessibility compliance with zero critical violations
- Generate Phase 2 completion report

**CHECKPOINT**: Verify Phase 2 completion report exists before proceeding: `test/reports/T-3.2.2-phase-2-completion-report.md`

### Step 3: Execute Phases 3-5 Testing  
**Load and execute**: `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md`

**Phase 3 - Visual Testing**:
- Generate comprehensive visual scaffolds for all accordion states
- Generate screenshots for all accordion states
- Execute enhanced LLM vision analysis using the screenshots (proven 95% confidence from T-3.2.1)
- Validate visual fidelity to legacy FaqItem component
- Test responsive behavior and dark mode support

**Phase 4 - Integration Testing**:
- Test AccordionProvider integration (single and multiple modes)
- Validate state coordination between accordion items
- Test provider context boundary behavior

**Phase 5 - Final Validation**:
- Consolidate all test results from Phases 1-4
- Generate comprehensive final validation report
- Confirm production readiness with all success criteria met

## Critical T-3.2.2 Specific Guidance

### Animation Testing Focus
- **Timing Precision**: Validate 300ms CSS transitions with 320ms JavaScript timeout
- **Height Calculations**: Test variable content with `scrollHeight` measurement
- **Performance**: Confirm smooth 60fps animations across all scenarios

### Visual Fidelity Requirements
- **Legacy Reference**: `aplio-legacy/components/shared/FaqItem.jsx`
- **Key Elements**: Rounded borders, dashed styling, exact padding (`p-2.5`, `px-5 py-3`)
- **Typography**: `text-xl`, `font-semibold` matching legacy precisely

### Accessibility Validation
- **ARIA Pattern**: Complete accordion pattern with button/region relationships
- **Keyboard Support**: Enter/Space keys with proper `preventDefault` handling
- **Focus Management**: Disabled states and tabIndex management

### Integration Requirements
- **Context Coordination**: Single mode (one open) vs multiple mode (many open)
- **State Synchronization**: Rapid interaction handling and consistency
- **Provider Integration**: Seamless coordination with T-3.2.1 AccordionProvider

## Error Handling Protocol

**For ANY test failure**:
1. **Log Issue**: Document failure details and error messages
2. **Apply Fix**: Use automated correction if possible
3. **Re-run Test**: Execute failed step again  
4. **Evaluate**: Check if issue resolved
5. **Update Artifacts**: Regenerate affected files
6. **Retry**: Maximum 3 attempts per failure

## Expected Deliverables

Upon completion, provide:
1. **Test Status Summary**: Overall pass/fail status for all phases
2. **Coverage Reports**: Code coverage metrics (expect 94% achievement)
3. **Visual Analysis Results**: LLM vision confidence scores (target ≥95%)
4. **Accessibility Report**: ARIA compliance confirmation (zero violations)
5. **Integration Results**: Provider coordination validation
6. **Final Validation Report**: Production readiness confirmation

## Success Confirmation

**You have successfully completed T-3.2.2 testing when**:
- ✅ All 25 comprehensive unit tests pass (100% success rate)
- ✅ Code coverage ≥90% achieved (expect 94%)
- ✅ LLM vision analysis ≥95% confidence for visual fidelity
- ✅ Zero critical accessibility violations detected
- ✅ Animation timing within 300ms ±10ms tolerance
- ✅ AccordionProvider integration validated for both single/multiple modes
- ✅ Final validation report confirms production readiness

**IMPORTANT**: Execute both test plan files completely and sequentially. Do not skip phases or attempt to combine them. The two-phase structure ensures comprehensive validation while maintaining manageable complexity for each testing cycle.

Begin testing immediately upon receiving this conductor prompt - all implementation is complete and ready for validation.
