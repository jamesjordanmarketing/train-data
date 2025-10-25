# AI Testing Agent Conductor Prompt - T-2.2.5 Documentation Testing

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for the T-2.2.5: Accordion and FAQ Component Visual Documentation task. Your primary goal is to validate that documentation components meet both content accuracy and implementation readiness requirements while autonomously identifying and fixing issues through iterative cycles.

## Critical Understanding

**This is a Documentation Testing Task** - Unlike typical component testing, T-2.2.5 created documentation files rather than functional React components. Your testing approach must validate documentation quality, legacy implementation accuracy, and specification completeness.

## Primary Mission

Execute the comprehensive documentation testing protocol for T-2.2.5 as defined in the Project Memory Core (PMC) system. Follow these steps precisely:

### Step 1: Review Testing Context and Requirements
1. **Load the Implementation Context**
   - Review `pmc/system/plans/new-tests/02-new-test-carry-context-06-22-25-0508PM.md` for critical testing context and implementation details
   - Understand that T-2.2.5 created documentation for accordion and FAQ components based on legacy FaqItem.jsx and CustomFAQ.jsx analysis

2. **Understand Task Specifications**
   - Review `pmc/core/active-task.md` to understand the original task requirements
   - Note the four elements: ELE-1 (Accordion design), ELE-2 (FAQ layout), ELE-3 (Interactions), ELE-4 (Accessibility)
   - Understand the implementation location: `design-system/docs/components/interactive/accordion/`

### Step 2: Execute Comprehensive Testing Protocol
**Execute the complete testing protocol defined in** `pmc/core/active-task-unit-tests-2-enhanced.md`

This file contains your complete testing instructions with 4 comprehensive phases:
- **Phase 0**: Pre-Testing Environment Setup (navigation, directory creation, file verification)
- **Phase 1**: Documentation Discovery & Validation (file cataloging, content coverage, format validation)
- **Phase 2**: Legacy Reference Validation (extract legacy specs, compare documentation accuracy)
- **Phase 3**: Implementation Readiness Testing (validate guidance quality, animation specifications)
- **Phase 4**: Comprehensive Testing Report Generation (final testing report, validation check)

### Key Testing Requirements for T-2.2.5

**You must validate:**
1. All documentation files exist in `design-system/docs/components/interactive/accordion/`
2. Documentation content matches legacy implementations (FaqItem.jsx and CustomFAQ.jsx)
3. All four elements (ELE-1 through ELE-4) are comprehensively documented
4. Animation specifications include timing and transition details
5. Accessibility documentation covers keyboard navigation and ARIA requirements
6. Dark mode variants are documented for all visual states
7. Documentation provides implementation-ready specifications

### Testing Execution Protocol

1. **Navigate to Testing Environment**
   ```bash
   cd aplio-modern-1
   ```

2. **Execute Sequential Testing Phases**
   - Run Phase 0 through Phase 4 as defined in `pmc/core/active-task-unit-tests-2-enhanced.md`
   - Each phase builds on the previous phase's results
   - Follow all bash commands and validation steps exactly as specified

3. **Document All Results**
   - Generate comprehensive test reports in `test/reports/T-2.2.5/`
   - Create validation results in `test/validation-results/T-2.2.5/`
   - Archive legacy comparison data in `test/legacy-comparison/T-2.2.5/`

### Critical Success Gates

**You shall not declare testing complete until:**
- [ ] All documentation files confirmed to exist in correct directory structure
- [ ] Documentation content validated against legacy component implementations
- [ ] All four elements (ELE-1 through ELE-4) comprehensively tested
- [ ] Animation specifications confirmed complete and accurate
- [ ] Accessibility documentation validated for completeness
- [ ] Dark mode variants confirmed documented
- [ ] Implementation readiness report generated with pass/fail status
- [ ] Final comprehensive testing report created with recommendations

### File Structure Understanding

**Task Implementation Files:**
- `pmc/core/active-task.md` - Original task requirements and specifications
- `pmc/system/plans/new-tests/02-new-test-carry-context-06-22-25-0508PM.md` - Implementation context and testing adaptations

**Testing Protocol File:**
- `pmc/core/active-task-unit-tests-2-enhanced.md` - Complete testing protocol with all phases and commands

**Legacy Reference Files:**
- `aplio-legacy/components/shared/FaqItem.jsx` - Primary accordion implementation reference
- `aplio-legacy/components/home-4/CustomFAQ.jsx` - FAQ section layout reference

**Documentation Output Location:**
- `design-system/docs/components/interactive/accordion/` - Target documentation directory

### Execution Directive

**Begin immediately with Phase 0 of the testing protocol** as defined in `pmc/core/active-task-unit-tests-2-enhanced.md`. Execute each phase sequentially and completely before proceeding to the next phase.

**Do not deviate from the testing protocol.** Your role is to execute the specific documentation testing procedures for T-2.2.5 exactly as outlined.

### Final Reporting Requirements

After completing all phases, provide the human operator with:
1. **Overall Testing Status**: PASS/FAIL for entire T-2.2.5 testing protocol
2. **Documentation Validation Results**: File existence, content accuracy, format compliance
3. **Legacy Implementation Compliance**: Comparison results against FaqItem.jsx and CustomFAQ.jsx
4. **Implementation Readiness Assessment**: Quality of documentation for component implementation
5. **Recommendations**: Any required fixes or enhancements to documentation
6. **Test Report Locations**: Links to all generated test reports and validation results

**Remember:** This is documentation testing, not functional component testing. Your validation focuses on documentation accuracy, completeness, and implementation readiness rather than runtime behavior.
