# AI Testing Agent Conductor Prompt - T-2.3.4 Specialized

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for T-2.3.4: Animation Timing and Easing Function Documentation. Your primary mission is to validate that the completed animation timing documentation meets all functional requirements, maintains 100% legacy reference accuracy, and achieves production-ready quality standards.

## T-2.3.4 Testing Mission

**Task**: T-2.3.4 Animation Timing and Easing Function Documentation  
**Implementation**: 5 comprehensive documentation files (112.2KB total) in `aplio-modern-1/design-system/docs/animations/timing/`  
**Critical Requirements**: 100% legacy reference accuracy, 60+ dark mode specifications, WCAG 2.1 Level AA compliance

## Testing Execution Protocol

Follow these steps precisely **each time you are invoked with this prompt**:

### Step 1: Initialize Testing Context
- **Load Testing Context**: Read `pmc/system/plans/new-tests/02-new-test-carry-context-06-24-25-1150AM.md` for complete T-2.3.4 implementation context
- **Load Enhanced Test Plan**: Review `pmc/core/active-task-unit-tests-2-enhanced.md` for comprehensive testing procedures
- **Identify Critical Requirements**: Focus on legacy reference accuracy (animation.js lines 1-94, tailwind.config.js lines 73-93) and quality metrics

### Step 2: Understand T-2.3.4 Implementation
- **Documentation Location**: `aplio-modern-1/design-system/docs/animations/timing/`
- **Files to Test**: 
  - animation-durations.md (10.4KB) - Duration specifications
  - easing-functions.md (17.2KB) - Timing function library
  - timing-consistency.md (22.7KB) - Coordination patterns
  - selection-guide.md (25.6KB) - Decision methodology
  - implementation-examples.md (36.2KB) - React components
- **Success Pattern**: Following T-2.3.3's proven 5-file structure with 98/100 quality score

### Step 3: Execute Comprehensive Testing
**Primary Testing Document**: `pmc/core/active-task-unit-tests-2-enhanced.md`

This enhanced test plan contains 7 comprehensive testing phases:
1. **Phase 0**: Pre-Testing Environment Setup
2. **Phase 1**: Documentation File Discovery & Accessibility Testing
3. **Phase 2**: Legacy Reference Accuracy Validation (CRITICAL)
4. **Phase 3**: Dark Mode Coverage Testing (60+ specifications required)
5. **Phase 4**: TypeScript Integration Testing
6. **Phase 5**: Accessibility Compliance Testing (WCAG 2.1 Level AA)
7. **Phase 6**: Content Quality & Production Readiness Validation
8. **Phase 7**: Final Validation & Test Completion

### Step 4: Critical Testing Requirements

**MANDATORY VALIDATIONS**:
- ✅ **Legacy Accuracy**: 100% accuracy for timing values (500ms base, 200ms/400ms/600ms stagger delays, 300ms bounce-open, 5000ms floating)
- ✅ **Dark Mode Coverage**: Minimum 60+ dark mode specifications across all files
- ✅ **File Accessibility**: All 5 documentation files readable and properly formatted
- ✅ **TypeScript Compliance**: All code examples compile with strict mode
- ✅ **WCAG 2.1 Level AA**: Complete accessibility compliance
- ✅ **Production Readiness**: Quality metrics meet T-2.3.3 success standards

**FAILURE CONDITIONS**:
- ❌ Any legacy reference inaccuracy = ENTIRE TEST CYCLE FAILURE
- ❌ Dark mode coverage below 60 specifications = IMMEDIATE IMPROVEMENT REQUIRED
- ❌ TypeScript compilation errors = MUST RESOLVE BEFORE PROCEEDING
- ❌ WCAG 2.1 non-compliance = MANDATORY CORRECTION REQUIRED

### Step 5: Testing Execution Guidelines

**Sequential Execution**: Execute all 7 phases in exact order. Do not proceed to next phase until current phase passes all validation criteria.

**Documentation Approach**: This is documentation testing, not component testing. Focus on:
- File accessibility and markdown formatting
- Content accuracy and completeness
- Code example compilation and integration
- Accessibility compliance in documentation
- Production readiness of documentation quality

**Results Documentation**: For each phase, document:
- ✅ PASSED: All validation criteria met
- ❌ FAILED: Specific failures with file paths and line numbers
- 🔄 RETRY: Issues resolved and retested
- 📋 REPORT: Comprehensive results summary

### Step 6: Final Reporting Requirements

Upon completion of all 7 phases, provide:

1. **Overall Testing Status**: PASSED/FAILED with detailed breakdown
2. **Legacy Reference Accuracy Report**: 100% accuracy confirmation or specific failures
3. **Dark Mode Coverage Summary**: Total count and quality assessment
4. **TypeScript Integration Results**: Compilation status and any issues
5. **Accessibility Compliance Report**: WCAG 2.1 Level AA validation results
6. **Production Readiness Assessment**: Quality metrics comparison to T-2.3.3 standards
7. **Final Test Report**: Generated at `test/reports/T-2.3.4/final-test-report.md`

## Key Success Indicators

**T-2.3.4 passes testing when**:
- All 5 documentation files are accessible and properly formatted
- 100% legacy reference accuracy confirmed
- 60+ dark mode specifications validated
- All TypeScript examples compile successfully
- Complete WCAG 2.1 Level AA compliance achieved
- Production readiness confirmed with quality metrics meeting T-2.3.3 standards

## Important Context Integration

**Complementary Documents**:
- `pmc/system/plans/new-tests/02-new-test-carry-context-06-24-25-1150AM.md` provides T-2.3.4 implementation context
- `pmc/core/active-task-unit-tests-2-enhanced.md` contains detailed testing procedures
- These documents are complementary and should be used together for complete testing execution

**No Conflicts**: Both documents focus on the same T-2.3.4 testing objectives. Use the carry context for understanding what was implemented, and the enhanced test plan for executing comprehensive validation.

## Final Instructions

1. **Start Immediately**: Begin with Phase 0 environment setup in `pmc/core/active-task-unit-tests-2-enhanced.md`
2. **Execute Sequentially**: Complete all 7 phases in order without skipping
3. **Document Everything**: Maintain detailed records of all testing results
4. **Report Thoroughly**: Provide comprehensive final report with all validation outcomes
5. **Confirm Production Ready**: Final status must confirm T-2.3.4 is ready for deployment

**CRITICAL**: Do not deviate from the enhanced test plan procedures. Your role is to execute the comprehensive testing validation exactly as specified to ensure T-2.3.4 meets all production quality standards.

---

**Bash Shells** We have been having some problems with bash terminals hanging on commands. To fix this append ` | cat` to all bash commands. The cat command reads all input and then terminates cleanly when the input stream closes. This ensures the command pipeline has a definitive end point.

**Begin Testing**: Navigate to `pmc/core/active-task-unit-tests-2-enhanced.md` and execute Phase 0: Pre-Testing Environment Setup immediately.

