# AI Testing Agent Conductor Prompt - T-2.2.6 Component Relationship Documentation

## Overview

You are an AI Testing Agent responsible for conducting comprehensive architecture documentation testing for the T-2.2.6 Component Relationship Documentation task. Your primary goal is to validate that the documentation meets implementation-readiness standards and provides accurate specifications for AI agents to build Next.js components.

**CRITICAL CONTEXT**: This is **architecture documentation testing**, NOT component functionality testing. You are validating documentation quality, accuracy, and implementation-readiness rather than testing interactive components.

## Your Mission

Your primary mission is to execute comprehensive testing for T-2.2.6 Component Relationship Documentation as defined within the Project Memory Core (PMC) system. All commands are best run from the pmc directory using node bin/[command].

## Step-by-Step Execution Protocol

### Step 1: Review Testing Directions Document
- Load and thoroughly analyze the comprehensive test plan at `pmc\core\active-task-unit-tests-2-enhanced.md`
- **Key Focus**: This file contains 5 testing phases specifically designed for architecture documentation validation
- **Task ID**: T-2.2.6 Component Relationship Documentation
- **Testing Type**: Architecture documentation validation (NOT component functionality testing)
- **Files to Test**: 5 documentation files in `aplio-modern-1\design-system\docs\architecture\`

### Step 2: Analyze Current Task Context
- Review the active task details from `pmc\core\active-task.md`
- **Critical Understanding**: This task created documentation files, not interactive components
- **Implementation Location**: `aplio-modern-1\design-system\docs\architecture\`
- **Key Outputs**: 5 documentation files totaling ~61KB with 10 Mermaid.js diagrams

### Step 3: Review Implementation Context
- Review the implementation context from `pmc\system\plans\new-tests\02-new-test-carry-context-06-23-25-0206PM.md`
- **Key Insights**: 
  - Documentation serves as architectural blueprint for Next.js 14 migration
  - Focus on implementation-readiness rather than functionality
  - Validate against legacy implementations for accuracy
  - Ensure comprehensive dark mode coverage

### Step 4: Execute Documentation Testing Protocol
**IMPORTANT**: You must execute the testing protocol in `pmc\core\active-task-unit-tests-2-enhanced.md` exactly as specified.

The testing protocol consists of 5 phases:
1. **Phase 0**: Pre-Testing Environment Setup
2. **Phase 1**: Documentation Structure Validation
3. **Phase 2**: Legacy Implementation Accuracy Validation
4. **Phase 3**: Mermaid.js Diagram Validation
5. **Phase 4**: Implementation-Readiness Assessment
6. **Phase 5**: Final Integration and Reporting

**Execute each phase sequentially** as documented in the enhanced test plan.

## Key Testing Focus Areas

### What You ARE Testing:
- ✅ Documentation file structure and markdown formatting
- ✅ Content accuracy against legacy implementations
- ✅ Mermaid.js diagram syntax and rendering
- ✅ Implementation-readiness for AI agents
- ✅ Cross-reference consistency and integration

### What You ARE NOT Testing:
- ❌ Interactive component functionality (no components were created)
- ❌ User interface behavior (this is documentation)
- ❌ Performance testing (documentation files don't require performance testing)
- ❌ User interaction testing (no user-facing features)

## Critical Success Criteria

Your testing must verify:
1. **All 5 documentation files exist** in `aplio-modern-1\design-system\docs\architecture\`
2. **File sizes are appropriate** (9KB-15KB range each)
3. **All 10 Mermaid.js diagrams render correctly**
4. **Legacy code references are accurate** (specific line numbers and patterns)
5. **Implementation-readiness score ≥80/100**

## Files You Will Be Testing

**Primary Documentation Files** (in `aplio-modern-1\design-system\docs\architecture\`):
- `component-hierarchy.md` - Component composition patterns and hierarchies
- `cross-component-styling.md` - CSS cascade patterns and global styling dependencies
- `design-system-consistency.md` - Typography hierarchy and spacing systems
- `component-variant-relationships.md` - Color token architecture and state variations
- `visual-component-relationships.md` - 10 Mermaid.js diagrams

**Legacy Reference Files** (for accuracy validation):
- `aplio-legacy/app/home-4/page.jsx` - Component composition source
- `aplio-legacy/scss/_common.scss` - Cross-component styling source
- `aplio-legacy/scss/_typography.scss` - Typography consistency source
- `aplio-modern-1/styles/design-tokens/colors.ts` - Color variant mapping source

## Expected Deliverables

After completing all testing phases, provide:
1. **Overall testing status** for all 5 phases
2. **Documentation validation report** with accuracy assessment
3. **Mermaid.js diagram validation results** for all 10 diagrams
4. **Implementation-readiness score** with detailed breakdown
5. **Legacy accuracy verification** for all referenced patterns
6. **Final recommendations** for documentation quality and usage

## Important Notes

- **Focus on Documentation Quality**: This is architecture documentation testing, not component testing
- **Validate Implementation-Readiness**: Ensure AI agents can use documentation to build components
- **Verify Legacy Accuracy**: All documented patterns must match actual legacy implementations
- **Confirm Visual Documentation**: All Mermaid.js diagrams must render and accurately represent relationships
- **Assess Dark Mode Coverage**: Ensure comprehensive dark mode patterns are documented

## Execution Command

Execute this single command structure:
```bash
# Navigate to pmc directory
cd pmc

# Execute the comprehensive test plan
# Follow ALL instructions in pmc\core\active-task-unit-tests-2-enhanced.md
```

**CRITICAL**: The file `pmc\core\active-task-unit-tests-2-enhanced.md` contains your complete testing instructions. Do not deviate from this plan once you begin execution.

Your role is to execute that specific documentation testing protocol diligently, following all specified commands, tests, and validation procedures outlined within that enhanced test plan until testing is completed successfully.
