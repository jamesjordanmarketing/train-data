# AI Testing Agent Conductor Prompt - T-2.4.6 Typography Documentation Testing

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for T-2.4.6 responsive typography documentation system. Your primary goal is to validate documentation accuracy, TypeScript compilation, WCAG 2.1 AA compliance, and coding agent usability through systematic testing cycles.

**Critical Context**: T-2.4.6 created comprehensive responsive typography documentation (91.3KB across 5 files) with claimed 100% legacy pattern accuracy. Your mission is to validate these claims and ensure the documentation is production-ready for coding agents.

## Testing Mission Protocol

Follow these steps precisely **each time you are invoked with this prompt**:

### 1. **Review Enhanced Testing Directions**
   - Load and thoroughly analyze the comprehensive test plan in `pmc\core\active-task-unit-tests-2-enhanced.md`
   - **Key Focus**: This is a documentation testing task, NOT component testing
   - **Testing Types**: Documentation accuracy, TypeScript compilation, accessibility compliance, agent usability
   - **Success Criteria**: 100% legacy pattern accuracy, WCAG 2.1 AA compliance, agent workflow success

### 2. **Analyze T-2.4.6 Implementation Context**
   - Review the completed task details from `pmc\core\active-task.md`
   - **Implementation Status**: COMPLETE - All phases (PREP, IMP, VAL) finished with high confidence
   - **Deliverables**: 5 typography documentation files totaling 91.3KB
   - **Key Patterns**: H1 (36px→64px), H2 (32px→36px), H3 (22px→24px), body text (Inter, leading-[1.75], -tracking-[0.3px])

### 3. **Review Implementation Context from Previous Agent**
   - Review the detailed implementation notes from `system\plans\new-tests\02-new-test-carry-context-06-26-25-1051AM.md`
   - **Critical Information**: Legacy reference validation requirements, WCAG compliance claims, TypeScript interface extraction needs
   - **Testing Focus Areas**: Legacy pattern accuracy, accessibility compliance, documentation usability, implementation guidance

### 4. **Archive and Reset Test Files**
   - Navigate to pmc directory
   - Run the test approach and discovery automation script:
   ```bash
   node system\management\test-approach-and-discovery.js
   ```
   - This archives existing test files and creates clean slate for T-2.4.6 testing cycle

### 5. **Generate T-2.4.6 Testing Approach**
   - Read `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`
   - Execute the instructions immediately, focusing on documentation testing requirements
   - Generate testing approach in `pmc\system\plans\task-approach\current-test-approach.md`
   - Run command to populate approach into test plan:
   ```bash
   node bin\aplio-agent-cli.js test-approach
   ```
   - **Wait for human operator instructions before proceeding to Step 6**

### 6. **Execute T-2.4.6 Documentation Testing Protocol**
   - **Primary Focus**: Execute testing described in `pmc\core\active-task-unit-tests-2-enhanced.md`
   - **Testing Phases**: 
     - Phase 0: Pre-Testing Environment Setup (navigate to aplio-modern-1, verify documentation files)
     - Phase 1: Documentation Content Analysis & Discovery (TypeScript interfaces, legacy patterns, WCAG claims)
     - Phase 2: Implementation Testing & Code Example Validation (Next.js 14 integration, font loading)
     - Phase 3: Documentation Usability Testing (coding agent workflow, cross-references, quality assessment)

## T-2.4.6 Specific Testing Requirements

### **Documentation Validation Focus**
- **Legacy Pattern Accuracy**: Validate 100% match against `aplio-legacy/scss/_typography.scss:16-31`
- **TypeScript Compilation**: All code examples must compile without errors in Next.js 14 environment
- **WCAG 2.1 AA Compliance**: Automated accessibility validation of documented standards
- **Agent Usability**: Simulate coding agent implementing components using only documentation

### **Key Files to Validate**
1. `aplio-modern-1/design-system/docs/responsive/typography/typography-definitions.md` (17KB)
2. `aplio-modern-1/design-system/docs/responsive/typography/typography-implementation-guidelines.md` (18KB)
3. `aplio-modern-1/design-system/docs/responsive/typography/typography-constraints-specifications.md` (15KB)
4. `aplio-modern-1/design-system/docs/responsive/typography/typography-testing-guide.md` (23KB)
5. `aplio-modern-1/design-system/docs/responsive/typography/typography-visual-reference.md` (18KB)

### **Success Gates**
- [ ] All legacy pattern validations pass with 100% accuracy
- [ ] All TypeScript compilation tests pass without errors
- [ ] All accessibility tests pass WCAG 2.1 AA standards
- [ ] All responsive scaling tests demonstrate correct behavior (H1: 36px→64px, H2: 32px→36px, H3: 22px→24px)
- [ ] Documentation usability test succeeds with coding agent workflow
- [ ] File completeness validated (91.3KB total across 5 files)

## Critical Instructions

### **Do NOT Deviate** 
Once you begin executing `pmc\core\active-task-unit-tests-2-enhanced.md`, follow ALL specified commands, tests, and instructions until testing is complete.

### **Documentation Testing vs Component Testing**
- This is **documentation testing** - you're validating content accuracy and usability
- NOT testing React components or UI functionality
- Focus on TypeScript compilation, pattern accuracy, and agent workflow simulation

### **Complementary File Relationship**
- `pmc\core\active-task.md` = Task context and implementation details
- `pmc\core\active-task-unit-tests-2-enhanced.md` = Detailed testing procedures
- These files work together - use task context to understand what was built, use enhanced test plan for how to validate it

## Final Reporting Requirements

After completing all tests, notify the human operator with:

1. **Overall Testing Status**: Pass/Fail with specific metrics
2. **Legacy Pattern Validation Results**: Exact accuracy percentage against `_typography.scss:16-31`
3. **TypeScript Compilation Results**: Success/failure of all code examples
4. **WCAG 2.1 AA Compliance Results**: Accessibility validation outcomes
5. **Agent Usability Test Results**: Workflow simulation success/failure
6. **Quality Assessment Report**: Documentation readiness for production use
7. **File Completeness Validation**: Confirmation of 91.3KB total across 5 files
8. **Recommendations**: Any issues requiring attention or manual review

**Testing Complete**: T-2.4.6 responsive typography documentation system validated for production use by coding agents.

---

**IMPORTANT**: This prompt is optimized specifically for T-2.4.6 documentation testing. The enhanced test plan in `pmc\core\active-task-unit-tests-2-enhanced.md` contains the detailed execution steps for validating the typography documentation system.
