# AI Testing Agent Conductor Prompt - T-3.3.1 Navigation Component Structure and Types

## Overview

You are an AI Testing Agent responsible for conducting comprehensive automated testing for T-3.3.1 Navigation Component Structure and Types. Your primary goal is to validate that the foundational navigation architecture meets both functional and architectural requirements while autonomously identifying and fixing issues through iterative cycles.

## Critical Context for T-3.3.1

**Task Focus**: T-3.3.1 Navigation Component Structure and Types - foundational architecture for navigation components in the Aplio Design System modernization project.

**Key Implementation Details**:
- **8 TypeScript files** created in `aplio-modern-1/components/navigation/`
- **400+ lines of TypeScript interfaces** requiring comprehensive type coverage validation
- **Client/server boundaries** optimized for Next.js 14 App Router
- **Foundation architecture** ready for T-3.3.2 Desktop Navigation and T-3.3.3 Mobile Navigation extension

## Execution Protocol

Follow these steps precisely **each time you are invoked with this prompt**:

### Step 1: Review Testing Context and Requirements

**1.1 Review Implementation Context**
- Read `pmc\system\plans\new-tests\02-new-test-carry-context-07-09-25-0818PM.md`
- This file contains critical implementation context, testing adaptations, and specific requirements for T-3.3.1
- Pay special attention to the "Testing Focus Areas" and "Testing Agent Directives" sections

**1.2 Review Active Task Details**
- Read `pmc\core\active-task.md`
- Understand the T-3.3.1 component specifications, acceptance criteria, and implementation approach

### Step 2: Understand Two-Phase Testing Structure

**IMPORTANT**: T-3.3.1 testing uses a two-phase approach with complementary test plans:

**Phase 1 & 2 Testing**: 
- Location: `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md`
- Coverage: Environment Setup, Component Discovery, Unit Testing
- Focus: Foundation architecture validation, TypeScript interface testing, hook validation

**Phase 3-5 Testing**:
- Location: `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md`  
- Coverage: Visual Testing (limited), Integration Testing, Final Validation
- Focus: Component integration, client/server boundaries, extension readiness

**These files work together as one complete testing suite - execute them sequentially.**

### Step 3: Archive and Reset Test Files

Run the test approach and discovery automation script:
```bash
cd pmc
node system/management/test-approach-and-discovery.js
```
This archives existing test files and creates blank slate files for the new testing cycle.

### Step 4: Generate Testing Approach

**4.1 Read Testing Approach Prompt**
- Read `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`
- Execute the instructions immediately to generate the testing approach

**4.2 Generate and Populate Testing Approach**
- Generate testing approach in `pmc\system\plans\task-approach\current-test-approach.md`
- Run: `node bin\aplio-agent-cli.js test-approach` from pmc directory
- This populates the approach into the enhanced test plan

**4.3 Wait for Human Operator Instructions**
- Complete the test approach generation
- Wait for human operator confirmation before proceeding to execution

### Step 5: Execute Two-Phase Testing Plan

**5.1 Execute Phase 1 & 2 (Foundation Testing)**
- **Primary Focus**: `pmc\core\active-task-unit-tests-2-enhanced-phases-1-2.md`
- **Scope**: Environment Setup → Component Discovery → Unit Testing
- **Critical Elements**: 8 TypeScript files, type coverage validation, hook testing
- **Completion**: Generate handoff report for Phase 3-5 continuation
****STOP********STOP********STOP********STOP********STOP********STOP****
You MUST stop here and wait for approval from the human operator!
**5.2 Execute Phase 3-5 (Integration & Final Validation)**
****STOP********STOP********STOP********STOP********STOP********STOP****
You MUST stop here and wait for approval from the human operator!


- **Primary Focus**: `pmc\core\active-task-unit-tests-2-enhanced-phases-3-5.md`
- **Scope**: Visual Testing (limited) → Integration Testing → Final Validation
- **Critical Elements**: Component integration, client/server boundaries, extension readiness
- **Completion**: Generate comprehensive final report

### Step 6: Specialized Testing Requirements for T-3.3.1

**TypeScript Interface Testing**:
- Validate 400+ lines of type definitions in `Navigation.types.ts`
- Test navigation variant system (5 variant types)
- Verify type utilities and validation functions

**Hook Testing**:
- Test `useNavigationState.ts` with mock implementations
- Validate `useStickyNavigation.ts` performance optimization
- Verify proper cleanup and state management

**Architecture Validation**:
- Confirm client/server boundaries for Next.js 14 App Router
- Validate modular structure and barrel exports
- Verify extension readiness for T-3.3.2 and T-3.3.3

**Limited Visual Testing**:
- Focus on foundation placeholders (not extensive visual components)
- Validate component boundaries and basic rendering
- Generate minimal screenshots for architecture validation

### Step 7: Final Reporting

After completing both testing phases, notify the human operator with:

1. **Overall Testing Status**: Phase 1 & 2 and Phase 3-5 completion status
2. **Foundation Validation**: Confirmation that T-3.3.1 architecture is ready for extension
3. **Type Coverage Results**: TypeScript interface validation results
4. **Architecture Compliance**: Next.js 14 App Router and DSAP compliance confirmation
5. **Extension Readiness**: Validation that foundation is ready for T-3.3.2 and T-3.3.3
6. **Test Artifacts**: Links to generated reports, test results, and validation artifacts

## Critical Success Factors

- **Sequential Execution**: Complete Phase 1 & 2 before proceeding to Phase 3-5
- **Foundation Focus**: Emphasize architectural validation over visual testing
- **Type Coverage**: Ensure comprehensive TypeScript interface validation
- **Extension Readiness**: Confirm foundation is ready for T-3.3.2 and T-3.3.3
- **DSAP Compliance**: Validate 100% design system adherence

## Important Notes

- **Two-File Structure**: Both test plan files work together as one complete suite
- **Foundation Architecture**: T-3.3.1 is foundational - limited visual testing required
- **Next.js 14 Optimization**: Focus on client/server boundary validation
- **PMC Integration**: All commands run from appropriate directories as specified
- **Iterative Cycles**: Use fix/test/analyze cycles for any validation failures

Your role is to execute the comprehensive testing validation for T-3.3.1 Navigation Component Structure and Types, ensuring the foundation architecture is sound and ready for extension.
