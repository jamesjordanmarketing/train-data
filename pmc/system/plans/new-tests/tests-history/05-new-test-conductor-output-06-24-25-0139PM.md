# AI Testing Agent Conductor Prompt - T-2.3.5 Accessibility Documentation Testing

## Overview

You are an AI Testing Agent responsible for conducting comprehensive **documentation validation testing** for T-2.3.5: Accessibility and Reduced Motion Documentation. Your primary goal is to validate that accessibility documentation meets WCAG 2.1 Level AA standards, maintains legacy reference accuracy, and provides production-ready code examples.

**CRITICAL UNDERSTANDING**: T-2.3.5 creates **accessibility documentation files**, NOT React components. Your testing focus must be on documentation quality, code example compilation, and accessibility compliance - NOT component render testing.

## Mission Statement

Your primary mission is to execute the **Enhanced Documentation Testing Protocol** for T-2.3.5 as defined in the Project Memory Core (PMC) system. Follow these steps precisely:

### Step 1: Review T-2.3.5 Testing Context
- **Load primary instructions**: `pmc\core\active-task-unit-tests-2-enhanced.md`
- **Load implementation context**: `pmc\system\plans\new-tests\02-new-test-carry-context-06-24-25-0139PM.md`
- **Understand task scope**: T-2.3.5 created 5 accessibility documentation files, NOT React components
- **Note testing type**: Documentation validation, code compilation, WCAG compliance (NOT component testing)

### Step 2: Understand Documentation-Focused Testing
**YOU MUST UNDERSTAND**:
- **Testing Target**: 5 accessibility documentation files in `aplio-modern-1/design-system/docs/animations/accessibility/`
- **Testing Approach**: File structure validation, code example compilation, legacy reference accuracy
- **Success Criteria**: WCAG 2.1 Level AA compliance, 100% legacy reference accuracy, TypeScript strict mode compilation
- **NOT TESTING**: React components, user interactions, component rendering, or visual UI elements

### Step 3: Archive and Reset Test Artifacts
Execute the test preparation automation:
```bash
node system\management\test-approach-and-discovery.js
```
This archives previous test files and creates clean workspace for T-2.3.5 documentation testing.

### Step 4: Generate T-2.3.5 Testing Approach
- **Read**: `pmc\system\coding-prompts\03-test-approach-prompt-v2-beta.md`
- **Execute**: Generate testing approach specifically for accessibility documentation validation
- **Populate**: `pmc\system\plans\task-approach\current-test-approach.md`
- **Run PMC Command**: `node bin\aplio-agent-cli.js test-approach` from pmc directory
- **Wait**: For human operator confirmation before proceeding to execution

### Step 5: Execute T-2.3.5 Documentation Testing Protocol
**Primary Instructions**: `pmc\core\active-task-unit-tests-2-enhanced.md`

**YOU SHALL execute these 7 validation phases sequentially**:

1. **Phase 0**: Environment Setup & File Verification (5 accessibility files confirmed present)
2. **Phase 1**: Documentation Structure Validation (markdown structure, required sections)
3. **Phase 2**: TypeScript Code Example Compilation (strict mode compliance testing)
4. **Phase 3**: Legacy Reference Accuracy Validation (100% accuracy to animation.js)
5. **Phase 4**: WCAG 2.1 Level AA Compliance Validation (accessibility standards compliance)
6. **Phase 5**: Motion Preference Detection Testing (CSS media queries, JavaScript utilities)
7. **Phase 6**: Cross-Reference Integration Validation (T-2.3.4 integration, internal links)
8. **Phase 7**: Final Validation and Reporting (comprehensive test report generation)

## Critical Adaptations for T-2.3.5

### REMOVE These Testing Approaches (Not Applicable)
- ❌ React component discovery and validation
- ❌ Interactive component state testing
- ❌ User event simulation
- ❌ Component lifecycle testing
- ❌ Props validation testing
- ❌ Visual component rendering tests

### FOCUS On These Testing Approaches (T-2.3.5 Specific)
- ✅ Markdown file structure validation
- ✅ TypeScript code example compilation with strict mode
- ✅ Legacy animation.js reference accuracy verification
- ✅ WCAG 2.1 Level AA compliance checking
- ✅ CSS media query syntax validation
- ✅ JavaScript motion detection method testing
- ✅ Cross-reference link integrity validation
- ✅ Dark mode accessibility pattern verification

## Success Criteria for Completion

**Report PASS status when ALL criteria met**:
1. **File Completeness**: All 5 accessibility documentation files validated
2. **Code Compilation**: All TypeScript examples compile with strict mode
3. **Legacy Accuracy**: 100% accuracy verified against animation.js source
4. **WCAG Compliance**: All patterns meet Level AA accessibility standards
5. **Cross-References**: All internal links and T-2.3.4 integrations functional
6. **Motion Detection**: CSS and JavaScript utilities validated across browsers
7. **Dark Mode**: All accessibility patterns maintain proper contrast ratios

## Implementation Context Integration

**Reference Files**:
- **Primary Testing Protocol**: `pmc\core\active-task-unit-tests-2-enhanced.md`
- **Implementation Context**: `pmc\system\plans\new-tests\02-new-test-carry-context-06-24-25-0139PM.md`
- **Active Task Details**: `pmc\core\active-task.md`

**These files are complementary and provide**:
- Enhanced protocol provides detailed testing phases and bash commands
- Implementation context explains what was built and critical testing adaptations
- Active task details provide original requirements and acceptance criteria

## Final Reporting Requirements

After completing all 7 validation phases, provide:

1. **Overall Testing Status**: PASS/FAIL with detailed justification
2. **Phase Results Summary**: Status for each of the 7 validation phases
3. **Critical Issues Found**: Documentation of any accessibility compliance failures
4. **Code Compilation Report**: Results of TypeScript strict mode testing
5. **Legacy Reference Report**: Verification of 100% accuracy to animation.js
6. **WCAG Compliance Report**: Level AA accessibility standards assessment
7. **Integration Validation**: T-2.3.4 cross-references and internal link status
8. **Recommendations**: Any manual review needed for identified issues

## Important Notes

- **Documentation Focus**: Remember T-2.3.5 is about accessibility documentation, not component implementation
- **Production Ready**: All code examples must compile and be SSR-safe for Next.js
- **Accessibility First**: WCAG 2.1 Level AA compliance is mandatory, not optional
- **Legacy Accuracy**: 100% accuracy to legacy animation.js patterns is required
- **Comprehensive Coverage**: All 5 accessibility files must pass validation
- **Cross-Browser**: Motion detection utilities must work across Chrome, Firefox, Safari, Edge

**Execute the Enhanced Documentation Testing Protocol thoroughly and autonomously, focusing on accessibility compliance, code quality, and documentation completeness for T-2.3.5.**
