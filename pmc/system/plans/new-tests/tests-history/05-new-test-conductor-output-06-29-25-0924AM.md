# AI Testing Agent Conductor Prompt - T-2.5.3 Design Token Mapping Implementation

## Overview

You are an AI Testing Agent responsible for conducting comprehensive validation testing for T-2.5.3 Design Token Mapping Implementation. Your primary mission is to validate that the semantic token system, Theme Switcher foundation, and T-2.5.2 integration are properly implemented and ready for production use and T-2.5.3a Theme Switcher Implementation.

## Critical Context

**Task**: T-2.5.3 Design Token Mapping Implementation (Enhanced for Theme Switcher Integration)
**Priority**: Theme Switcher foundation validation is HIGHEST priority for T-2.5.3a preparation
**Testing Approach**: Structural validation with integration testing focus
**Elements**: 5 elements (ELE-1 through ELE-5) with NEW ELE-5 Theme Switcher foundation

## Mission-Critical Directives

### Phase 1: Initialize Testing Context (MANDATORY)

1. **Load T-2.5.3 Testing Specifications**
   - **Primary**: Read `pmc\core\active-task-unit-tests-2-enhanced.md` - This contains your complete testing protocol with task-specific instructions
   - **Supporting**: Review `pmc\core\active-task.md` - Original task specification for implementation context
   - **Critical**: Study `system\plans\new-tests\02-new-test-carry-context-06-29-25-0924AM.md` - Implementation context from previous agent with critical testing guidance

2. **Understand T-2.5.3 Testing Priorities**
   - **HIGHEST PRIORITY**: ELE-5 Theme Switcher foundation validation (critical for T-2.5.3a)
   - **HIGH PRIORITY**: ELE-4 CSS custom properties T-2.5.2 integration
   - **MEDIUM PRIORITY**: ELE-1 & ELE-2 semantic token mappings
   - **SUPPORTING**: ELE-3 WCAG compliance validation

3. **Establish Testing Environment**
   - Navigate to `aplio-modern-1` directory (NOT pmc)
   - Verify all 6 T-2.5.3 implementation files exist in `styles/themes/`
   - Confirm test infrastructure is available

### Phase 2: Execute T-2.5.3 Validation Protocol (CRITICAL)

**You shall execute the complete testing protocol from `pmc\core\active-task-unit-tests-2-enhanced.md` WITHOUT deviation.**

**Key Testing Phases to Execute:**
1. **Phase 0**: Pre-Testing Environment Setup - Navigate to aplio-modern-1, verify files
2. **Phase 1**: T-2.5.3 Component Discovery - Classify all 5 elements
3. **Phase 2**: T-2.5.3 Testing Execution - Validate each element with priority focus
4. **Phase 3**: T-2.5.3 Integration & Completion - Validate complete system readiness

**Critical Validation Requirements:**
- ✅ **ELE-5 Theme Switcher Foundation**: Complete validation for T-2.5.3a readiness
- ✅ **T-2.5.2 Integration**: Confirm compatibility with theme provider
- ✅ **WCAG 2.1 AA Compliance**: Validate accessibility foundation
- ✅ **Cross-theme Compatibility**: Ensure tokens work in both light/dark themes

### Phase 3: Testing Execution Protocol

**You must follow the exact testing commands from `pmc\core\active-task-unit-tests-2-enhanced.md`:**

1. **Environment Setup**: Execute Phase 0 commands exactly as specified
2. **Element Validation**: Execute Phase 1 & 2 with focus on structural validation
3. **Integration Testing**: Execute Phase 3 complete system validation
4. **Report Generation**: Create comprehensive testing summary

**Testing Approach Specifics for T-2.5.3:**
- Use **structural validation** when precise value matching fails
- Focus on **integration testing** over isolated unit testing
- Prioritize **Theme Switcher foundation** validation above all else
- Apply **3-iteration fix/test/analyze cycle** for any failures

### Phase 4: Completion Validation

**You must confirm the following before considering T-2.5.3 testing complete:**

#### Mandatory Success Criteria
- [ ] All 5 elements (ELE-1 through ELE-5) structurally validated
- [ ] Theme Switcher foundation (ELE-5) complete and accessible
- [ ] T-2.5.2 theme provider compatibility maintained
- [ ] WCAG 2.1 AA accessibility foundation established
- [ ] Complete system exports available via `styles/themes/index.ts`

#### T-2.5.3a Readiness Validation
- [ ] Theme Switcher token foundation ready for UI implementation
- [ ] Cross-theme compatibility validated for all semantic tokens
- [ ] Integration utilities available for Theme Switcher development
- [ ] No breaking changes to existing theme system

## Critical Success Message

**Upon successful completion, you must confirm:**
> "T-2.5.3 Design Token Mapping Implementation testing complete. Theme Switcher foundation validated and ready for T-2.5.3a implementation."

## Important Notes

### File References
- **Testing Protocol**: `pmc\core\active-task-unit-tests-2-enhanced.md` (YOUR PRIMARY INSTRUCTION SET)
- **Implementation Context**: `system\plans\new-tests\02-new-test-carry-context-06-29-25-0924AM.md` (Critical context from implementer)
- **Task Specification**: `pmc\core\active-task.md` (Original requirements)

### Navigation Requirements
- **Start Location**: pmc directory (default shell location)
- **Testing Location**: aplio-modern-1 directory (navigate via `cd .. && cd aplio-modern-1`)
- **Implementation Location**: `aplio-modern-1/styles/themes/` (6 files to validate)

### Testing Environment Constraints
- Some test environment issues may occur - use structural validation approach
- Focus on integration testing rather than isolated unit testing
- DOM mocking may be required for reactive CSS property testing
- TypeScript compilation must be successful before testing

## Execution Checklist

**Before Starting:**
- [ ] Read `pmc\core\active-task-unit-tests-2-enhanced.md` completely
- [ ] Understand T-2.5.3 specific requirements from context file
- [ ] Navigate to aplio-modern-1 directory
- [ ] Verify all 6 implementation files exist

**During Testing:**
- [ ] Follow Phase 0, 1, 2, 3 execution exactly as specified
- [ ] Prioritize Theme Switcher foundation validation
- [ ] Use structural validation for environment complexities
- [ ] Document all results and issues

**Upon Completion:**
- [ ] Confirm all mandatory success criteria met
- [ ] Validate T-2.5.3a readiness
- [ ] Generate comprehensive testing summary
- [ ] Provide critical success confirmation message

**Your role is to execute the T-2.5.3 testing protocol with absolute precision, ensuring the Theme Switcher foundation is ready for T-2.5.3a implementation.**
