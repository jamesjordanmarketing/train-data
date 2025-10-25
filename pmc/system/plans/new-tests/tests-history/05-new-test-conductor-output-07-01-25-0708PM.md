# AI Testing Agent Conductor Prompt - T-2.5.6 Styling System Integration

## Mission Statement
You are an AI Testing Agent responsible for conducting comprehensive automated testing for T-2.5.6: Styling System Integration with Components. Your mission is to validate the type-safe styled component system with CSS variable integration, discriminated union variants, style composition utilities, and mandatory DSAP compliance.

## Test Execution Protocol

### Step 1: Load T-2.5.6 Testing Specifications
**You must read and understand these complementary documents:**
- `pmc/core/active-task-unit-tests-2-enhanced.md` - Your primary testing directive with 8 phases of validation
- `pmc/system/plans/new-tests/02-new-test-carry-context-07-01-25-0708PM.md` - Critical implementation context from the development agent

**Key Understanding**: These documents work together - the context file explains WHAT was implemented, the enhanced test plan explains HOW to test it.

### Step 2: Understand T-2.5.6 Implementation Scope
**You are testing a comprehensive styled component system with:**
- Type-safe CSS variable integration (--aplio-* variables)
- Discriminated union variant types (ButtonVariant, CardVariant, InputVariant)  
- Style composition utilities enhancing T-2.5.4 system
- Design token usage patterns through CSS custom properties
- DSAP-compliant Button component (30px padding, 30px border-radius, Inter font, 500ms transitions)
- CSS-based theme switching (NO JavaScript theme props)

### Step 3: Navigate to Testing Environment
```bash
cd ..
cd aplio-modern-1
```
**All testing commands must be executed from the aplio-modern-1 directory.**

### Step 4: Execute T-2.5.6 Testing Protocol
**Follow pmc/core/active-task-unit-tests-2-enhanced.md exactly:**

**Phase 0**: Environment Setup - Create T-2.5.6 test directories, start test infrastructure
**Phase 1**: Component Discovery - Document the 4 implementation files in current-test-discovery.md
**Phase 2**: TypeScript Validation - Validate all type definitions and discriminated unions
**Phase 3**: CSS Integration Testing - Verify CSS variable references and availability
**Phase 4**: DSAP Compliance - Validate exact button specifications (30px padding, 30px radius)
**Phase 5**: Integration Testing - Confirm T-2.5.4 composition system compatibility  
**Phase 6**: Theme Switching - Validate CSS-based theming (no JavaScript theme props)
**Phase 7**: Visual Validation - Generate screenshots for visual consistency
**Phase 8**: Final Validation - Complete testing summary and reporting

### Step 5: Critical Success Criteria
**You must achieve ALL of these before declaring success:**
- ✅ All TypeScript files compile without errors
- ✅ All CSS custom properties (--aplio-*) correctly referenced  
- ✅ Discriminated union types resolve to appropriate CSS classes
- ✅ Button component meets exact DSAP specifications measured
- ✅ Theme switching occurs through CSS only (no component re-renders)
- ✅ Integration with existing T-2.5.4 composition system verified
- ✅ All 4 implementation files validated and functional

### Step 6: Implementation Files to Test
**Primary Test Targets:**
- `components/design-system/system/styled.tsx` - Core styled component system
- `components/design-system/system/Button.tsx` - DSAP-compliant Button example  
- `components/design-system/system/index.ts` - System exports
- `components/design-system/system/test-integration.tsx` - Integration validation

### Step 7: Error Handling Protocol
**For any test failure:**
1. Document the specific failure with error messages
2. Attempt automated correction if possible
3. Re-run the failed test
4. Continue until success or maximum 3 attempts
5. Report unresolved failures with detailed context

### Step 8: Completion Reporting
**Upon completion, provide:**
1. Overall testing status (PASS/FAIL for each phase)
2. Links to generated test artifacts in `test/reports/T-2.5.6-styled-component-testing-report.md`
3. TypeScript compilation results
4. CSS variable integration validation results
5. DSAP compliance measurement results  
6. Theme switching validation results
7. Any recommendations for manual review

## Critical Notes
- **No Partial Success**: All phases must pass completely
- **Directive Execution**: Follow pmc/core/active-task-unit-tests-2-enhanced.md exactly as written
- **CSS-Based Architecture**: Validate NO JavaScript theme props are used
- **DSAP Compliance**: Exact measurements required (30px padding, 30px border-radius)
- **Integration Focus**: Must work with existing T-2.5.4 composition system

## Success Declaration
Declare testing successful ONLY when all 8 phases pass and all success criteria are met. T-2.5.6 styled component system must be fully validated and ready for production use.
