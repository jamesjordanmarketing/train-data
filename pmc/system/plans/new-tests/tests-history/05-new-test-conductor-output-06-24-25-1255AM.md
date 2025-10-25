# AI Testing Agent Conductor Prompt - T-2.3.3: Scroll-Based Animation Pattern Documentation

## Overview

You are an AI Testing Agent responsible for conducting comprehensive validation testing for T-2.3.3: Scroll-Based Animation Pattern Documentation. Your primary goal is to validate that the 5-file documentation suite meets all production requirements including 100% legacy reference accuracy, 60+ dark mode specifications, and WCAG 2.1 accessibility compliance.

## Mission Critical Context

**Task:** T-2.3.3: Scroll-Based Animation Pattern Documentation  
**Status:** Implementation COMPLETED (96/100 readiness score)  
**Testing Focus:** Documentation validation, legacy reference accuracy, dark mode coverage verification  
**Critical Requirement:** 100% legacy reference accuracy (Any inaccuracy fails entire test suite)

## Step-by-Step Execution Protocol

Follow these steps precisely **each time you are invoked with this prompt**:

### Step 1: Review T-2.3.3 Testing Directions
- **You MUST load and thoroughly analyze:** `pmc\core\active-task-unit-tests-2-enhanced.md`
- **This file contains:** T-2.3.3-specific testing protocol with 5 phases (Pre-Testing Setup, File Discovery, Legacy Reference Validation, Dark Mode Coverage, Final Assessment)
- **Key Requirements:** 100% legacy reference accuracy (CRITICAL), 60+ dark mode specifications, WCAG 2.1 compliance
- **Expected Outcomes:** All 5 documentation files validated for production readiness

### Step 2: Analyze T-2.3.3 Implementation Context
- **Review implementation details from:** `pmc\core\active-task.md`
- **Key Context:** Task COMPLETED with 96/100 score, 5 files created (~120KB total), exceeds all minimum requirements
- **Implementation Location:** `aplio-modern-1\design-system\docs\animations\scroll\`
- **Files to Validate:** scroll-triggered-animations.md, parallax-effects.md, progressive-reveal.md, performance-optimization.md, implementation-guide.md

### Step 3: Review Implementation Handoff Notes
- **Load implementation context from:** `system\plans\new-tests\02-new-test-carry-context-06-24-25-1255AM.md`
- **Critical Information:** Legacy reference file paths, dark mode coverage details, accessibility implementation notes
- **Implementation Quality:** Intersection Observer integration, GPU acceleration patterns, mobile optimization
- **Testing Priorities:** Legacy accuracy (CRITICAL), dark mode coverage (60+ specs), accessibility compliance

### Step 4: Archive and Reset Test Environment
```bash
# Navigate to pmc directory
cd pmc

# Archive existing test files and create fresh environment
node system\management\test-approach-and-discovery.js
```
**Expected Outcome:** Clean test environment ready for T-2.3.3 validation

### Step 5: Generate T-2.3.3 Testing Approach
- **Read testing approach instructions from:** `pmc\system\coding-prompts\03-test-approach-prompt-v2-beta.md`
- **Execute the instructions immediately** to generate T-2.3.3-specific testing approach
- **Focus Areas:** Documentation validation, legacy reference accuracy, dark mode coverage counting
- **Output Location:** `pmc\system\plans\task-approach\current-test-approach.md`

```bash
# After generating test approach, integrate it
node bin\aplio-agent-cli.js test-approach
```

**YOU MUST WAIT for human operator confirmation before proceeding to Step 6**

### Step 6: Execute T-2.3.3 Validation Testing
- **Primary Testing Document:** `pmc\core\active-task-unit-tests-2-enhanced.md`
- **Testing Protocol:** 5-phase validation (Setup → Discovery → Legacy Validation → Dark Mode → Assessment)
- **Critical Gates:** 
  - Legacy reference accuracy: 100% required (CRITICAL failure point)
  - Dark mode coverage: 60+ specifications minimum
  - File integrity: All 5 files with correct sizes
  - Accessibility: WCAG 2.1 Level AA compliance

## T-2.3.3 Specific Testing Requirements

### Critical Success Criteria
1. **File Discovery:** All 5 documentation files exist in `aplio-modern-1\design-system\docs\animations\scroll\`
2. **Legacy Reference Accuracy:** 100% validation of all file paths and line numbers (CRITICAL)
3. **Dark Mode Coverage:** Minimum 60+ specifications confirmed across all files
4. **Documentation Quality:** Technical accuracy and implementation readiness verified
5. **Accessibility Compliance:** WCAG 2.1 patterns validated

### Testing Approach Alignment
- **Documentation Focus:** T-2.3.3 produces documentation files, not interactive components
- **Validation Strategy:** Content accuracy testing rather than runtime component testing  
- **Legacy Integration:** Critical requirement - any reference inaccuracy fails entire test suite
- **Quality Standards:** Must meet T-2.3.2 success benchmarks (98/100 target)

### Failure Handling Protocol
- **Critical Failures:** Legacy reference inaccuracy → STOP ALL TESTING → Report failure
- **Major Issues:** Dark mode coverage below 60 → Continue testing but document deficiency
- **Minor Issues:** Accessibility gaps or formatting issues → Document in final report

## Expected Deliverables

Upon completion, provide:
1. **Overall Testing Status:** PASS/FAIL with specific criteria results
2. **Legacy Reference Validation Report:** 100% accuracy confirmation or specific failures
3. **Dark Mode Coverage Analysis:** Exact count and coverage areas
4. **Accessibility Compliance Assessment:** WCAG 2.1 validation results  
5. **Production Readiness Recommendation:** Approve/reject for production use
6. **Detailed Test Results:** Complete validation report with evidence

## Important Notes

- **Task Type:** Documentation validation (not interactive component testing)
- **Critical Requirement:** 100% legacy reference accuracy is non-negotiable
- **Quality Standard:** Must meet exceptional standards set by T-2.3.2 success
- **Testing Philosophy:** Validate implementation quality against stated requirements
- **Documentation Location:** All test results in `test/validation-results/T-2.3.3/`

**Remember:** T-2.3.3 has already achieved 96/100 implementation readiness. Your role is to validate this quality claim through comprehensive testing and provide production approval or identify specific issues requiring remediation.