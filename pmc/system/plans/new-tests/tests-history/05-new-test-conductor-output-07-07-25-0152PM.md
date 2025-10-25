# AI Testing Agent Conductor Prompt - T-3.2.3 Accordion Container Implementation

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for the **T-3.2.3 Accordion Container Implementation**. Your mission is to validate that the accordion container components meet both functional and visual requirements while maintaining compatibility with existing T-3.2.2 and T-3.2.1 components.

## Critical Context for T-3.2.3

**Task**: T-3.2.3 Accordion Container Implementation
**Status**: PRODUCTION READY - Implementation complete, ready for comprehensive testing
**Components**: Accordion.tsx, AccordionFocusManager.tsx, Accordion.module.css, updated index.tsx
**Focus**: Container orchestration, variant support, state management, focus coordination

## Testing Protocol - Execute These Steps Precisely

### Step 1: Review Testing Context (MANDATORY)
```bash
# Read the comprehensive testing context first
Read: pmc/system/plans/new-tests/02-new-test-carry-context-07-07-25-0152PM.md
```

This document contains:
- Complete T-3.2.3 implementation context
- Critical testing focus areas
- Modified testing approaches
- Integration requirements with T-3.2.2 and T-3.2.1
- Success criteria and testing agent directives

### Step 2: Review Enhanced Test Plans (COMPLEMENTARY EXECUTION)

**IMPORTANT**: The following two files work together as a complete testing suite:

#### Phase 1-2 Test Plan (Discovery & Unit Testing)
```bash
# Read: pmc/core/active-task-unit-tests-2-enhanced-phases-1-2.md
```
**Execute This First** - Covers:
- Environment setup (Phase 0)
- Component discovery & classification (Phase 1)
- Unit testing with Jest (Phase 2)
- Handoff preparation for Phase 3-5

#### Phase 3-5 Test Plan (Visual & Integration Testing)
```bash
# Read: pmc/core/active-task-unit-tests-2-enhanced-phases-3-5.md
```
**Execute This Second** - Covers:
- Visual testing with screenshots (Phase 3)
- Integration testing with T-3.2.2 components (Phase 4)
- LLM Vision analysis (Phase 4)
- Final validation & reporting (Phase 5)

### Step 3: Execute Complete Testing Cycle

**Phase 0-2 Execution**:
1. Navigate to `aplio-modern-1/` directory
2. Execute Phase 0: Environment setup
3. Execute Phase 1: Component discovery
4. Execute Phase 2: Unit testing
5. **Verify handoff section completion** before proceeding

**Phase 3-5 Execution**:
1. **Verify Phase 1-2 completion** using handoff checklist
2. Execute Phase 3: Visual testing
3. Execute Phase 4: Integration & LLM Vision analysis
4. Execute Phase 5: Final validation & reporting

### Step 4: T-3.2.3 Specific Validation

**Container Integration Testing**:
- Test coordination with multiple AccordionItem components (2-5 items)
- Validate single-open vs multiple-open variant behavior
- Test controlled vs uncontrolled state management patterns
- Verify focus management across multiple accordion items

**Integration Requirements**:
- Ensure T-3.2.2 AccordionItem components work without modification
- Preserve T-3.2.1 AccordionProvider context integration
- Maintain 300ms animation timing (±10ms tolerance)
- Validate accessibility compliance with ARIA patterns

## Success Criteria for T-3.2.3

### Functional Requirements
- [x] Container renders minimum 2-5 accordion items successfully
- [x] Single-open variant allows only one item open at a time
- [x] Multiple-open variant allows concurrent open items
- [x] Controlled mode respects value prop and onValueChange callback
- [x] Uncontrolled mode manages internal state with defaultOpen
- [x] Focus management coordinates between accordion items

### Technical Requirements
- [x] Server component optimization validated
- [x] Animation timing preserved (300ms ±10ms)
- [x] Integration with T-3.2.2 components maintained
- [x] Export integration maintains backward compatibility
- [x] Accessibility compliance with ARIA accordion patterns

### Testing Quality Gates
- **Unit Tests**: ≥90% code coverage on container components
- **Integration Tests**: 100% compatibility with T-3.2.2 and T-3.2.1
- **Visual Tests**: Professional presentation with clear component boundaries
- **LLM Vision**: ≥95% confidence scores for all components

## File Structure Reference

**Primary Implementation** (DO NOT MODIFY):
- `components/design-system/molecules/Accordion/Accordion.tsx`
- `components/design-system/molecules/Accordion/AccordionFocusManager.tsx`
- `components/design-system/molecules/Accordion/Accordion.module.css`
- `components/design-system/molecules/Accordion/index.tsx`

**Testing Artifacts** (TO BE CREATED):
- `test/unit-tests/task-3-2/T-3.2.3/Accordion.test.tsx`
- `test/scaffolds/T-3.2.3/` (4 enhanced scaffold files)
- `test/screenshots/T-3.2.3/` (4 screenshot files)
- `test/reports/T-3.2.3-testing-report.md`

## Key Testing Directives

1. **You must test container functionality** - Focus on orchestration, not individual item testing (T-3.2.2 already validated)
2. **You must test multi-item scenarios** - Use 2-5 accordion items in all test scenarios
3. **You must preserve existing functionality** - No modifications to T-3.2.2 or T-3.2.1 components
4. **You must validate integration** - Test coordination between container and items
5. **You must test accessibility** - Focus management and ARIA compliance critical
6. **You must generate visual artifacts** - Scaffolds, screenshots, and LLM Vision reports required

## Completion Notification

After completing all testing phases, notify the human operator with:

1. **Overall Testing Status**: Pass/Fail for each phase (0-5)
2. **Component Validation**: Status for all 4 T-3.2.3 components
3. **Integration Results**: T-3.2.2 and T-3.2.1 compatibility confirmation
4. **Visual Artifacts**: Links to scaffolds, screenshots, and LLM Vision reports
5. **Coverage Metrics**: Unit test coverage and quality scores
6. **Final Report**: Location of comprehensive testing report

## Important Notes

- **Two-Phase Execution**: Both enhanced test plan files must be executed sequentially
- **Integration Focus**: Emphasize container-item coordination over individual component testing
- **Accessibility Critical**: Focus management and ARIA compliance are high priority
- **No Code Changes**: Testing only - do not modify existing T-3.2.2 or T-3.2.1 components
- **Production Ready**: T-3.2.3 is complete and ready for comprehensive validation

**Execute both enhanced test plan files completely to ensure comprehensive T-3.2.3 validation.**
