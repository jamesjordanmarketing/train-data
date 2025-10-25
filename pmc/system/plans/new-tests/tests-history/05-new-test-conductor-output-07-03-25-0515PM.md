# AI Coding Conductor Prompt - T-3.1.3 Button Icon Support and Extended Functionality

## Mission Statement
Your primary mission is to implement **T-3.1.3: Button Icon Support and Extended Functionality**, building upon the successfully completed T-3.1.2 Button Base Implementation. You will add icon support, loading states, accessibility enhancements, and performance optimizations while preserving the perfect foundation established in T-3.1.2.

## Critical Context Understanding

**COMPLEMENTARY DOCUMENTATION**: You must read and understand these two files as complementary sources:

1. **`pmc\core\active-task.md`** - Contains T-3.1.3 task requirements, elements, implementation phases, and DSAP protocol
2. **`system\plans\new-panels\02-new-task-carry-context-07-03-25-0244PM.md`** - Contains T-3.1.2 completion context, architectural decisions, and T-3.1.3 implementation constraints

**These files do NOT conflict** - the active-task.md provides the "what to implement" while the carryover context provides the "how to implement based on what was already built."

## T-3.1.3 Specific Initialization Protocol

Follow these steps precisely for T-3.1.3 implementation:

### Step 1: Context Integration and Task Approach
1. **Read Complementary Documentation:**
   - Read `pmc\core\active-task.md` to understand T-3.1.3 requirements (icon support, loading states, accessibility, performance)
   - Read `system\plans\new-panels\02-new-task-carry-context-07-03-25-0244PM.md` to understand T-3.1.2 foundation and implementation constraints

2. **Generate Task Approach:**
   - Read `pmc\system\coding-prompts\02-task-approach-prompt.md`
   - Execute those instructions to generate your implementation approach in `pmc\system\plans\task-approach\current-task-approach.md`

3. **Integrate Task Approach into Active Task:**
   - Navigate to `pmc` directory
   - Execute: `node bin\aplio-agent-cli.js task-approach`
   - Verify the Task Approach section in active-task.md shows "Added:" notation
   - If no "Added:" notation appears, stop and request human assistance

### Step 2: T-3.1.3 Implementation Execution

**CRITICAL FOUNDATION AWARENESS**: T-3.1.2 is COMPLETE with 100% success:
- Button.module.css (330 lines, 18 CSS classes) - production ready
- 5 variants × 3 sizes = 15 working combinations with perfect legacy fidelity
- Complete TypeScript integration and DSAP compliance
- Operational visual testing infrastructure at `/test-t311-button`

**T-3.1.3 IMPLEMENTATION CONSTRAINTS**:
- **PRESERVE ALL T-3.1.2 FUNCTIONALITY** - do not modify core button behavior
- **EXTEND EXISTING ARCHITECTURE** - add to Button.module.css, Button.types.ts, index.tsx
- **MAINTAIN CSS MODULE APPROACH** - use bracket notation, no new CSS variables
- **LEVERAGE EXISTING TESTING** - extend `/test-t311-button` scaffold and LLM Vision Analysis

**Execute T-3.1.3 Elements**:
1. **[T-3.1.3:ELE-1]** Icon support (left/right placement) - extend existing CSS module classes
2. **[T-3.1.3:ELE-2]** Loading state with spinner - use existing 500ms transition standards  
3. **[T-3.1.3:ELE-3]** Accessibility enhancements - ARIA attributes, keyboard navigation
4. **[T-3.1.3:ELE-4]** Performance optimization - React.memo, consistent height

**Follow Active Task Phases**:
- **PREP Phase**: Complete DSAP Step 1 (Documentation Discovery) + 3 preparation steps
- **IMP Phase**: Complete DSAP Step 2 (Compliance Implementation) + 4 implementation steps  
- **VAL Phase**: Complete DSAP Step 3 (Adherence Reporting) + 4 validation steps

**Use PMC Commands**:
- After PREP completion: `node bin/aplio-agent-cli.js update-phase-stage T-3.1.3 "PREP" "complete"`
- After IMP completion: `node bin/aplio-agent-cli.js update-phase-stage T-3.1.3 "IMP" "complete"`

### Step 3: T-3.1.3 Quality Assurance

**TESTING REQUIREMENTS**:
- Maintain 90% test coverage with new functionality
- Extend existing `/test-t311-button` visual scaffold with icon and loading examples
- Use proven LLM Vision Analysis system for visual validation
- Ensure all 15 existing button combinations continue working with new features

**COMPLETION CRITERIA**:
- All acceptance criteria in active-task.md met
- All T-3.1.2 functionality preserved and validated
- Icon placement working for left and right positions
- Loading state prevents interactions and shows spinner
- ARIA attributes properly implemented
- Performance optimizations applied without breaking existing behavior

### Step 4: Unit Testing Handoff

**AFTER VAL PHASE COMPLETION**: 
- Execute: `node bin/aplio-agent-cli.js update-phase-stage T-3.1.3 "VAL" "complete"`
- **STOP** and await human operator instructions for unit testing
- Unit testing is managed separately to maintain cognitive focus

## T-3.1.3 Implementation Success Factors

**Architecture Preservation**: The T-3.1.2 foundation is production-ready and validated. Your job is to carefully extend it, not rebuild it.

**CSS Module Mastery**: Continue the proven CSS module approach with bracket notation access and existing CSS variable consumption.

**DSAP Compliance**: Maintain 30px padding/border-radius, Inter font, 500ms animations, and responsive behavior standards.

**Visual Fidelity**: Use the operational LLM Vision Analysis system to ensure icon and loading state additions don't break existing visual design.

**Testing Infrastructure**: Leverage the ready-to-use visual testing scaffold at `/test-t311-button` and proven Playwright configuration.

## Key Success Indicators

✅ **Foundation Preserved**: All 15 existing button combinations continue working perfectly
✅ **New Features Functional**: Icon placement, loading states, accessibility enhancements working
✅ **Architecture Consistent**: CSS modules extended properly, TypeScript types updated correctly  
✅ **Testing Validated**: Visual tests passing, 90% coverage maintained
✅ **DSAP Compliant**: Design standards maintained for existing and new functionality

**Remember**: T-3.1.3 builds upon success, not from scratch. Work with the excellent foundation provided by T-3.1.2 completion.

---

**Execute with confidence knowing that T-3.1.2 provides a solid, validated foundation for T-3.1.3 implementation.**