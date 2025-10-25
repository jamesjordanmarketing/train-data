# AI Coding Conductor Prompt - Optimized for T-1.2.2

Your primary mission is to execute T-1.2.2 (Primary Category Selection Enhancement) defined within the Project Memory Core (PMC) system. Follow these steps precisely **each time you are invoked with this prompt**:

## Step 1: Generate Task Approach

1. **Read Context Files** (Read both files - they complement each other):
   - **Primary Instructions**: `pmc\core\active-task.md` - Contains detailed T-1.2.2 task specifications, acceptance criteria, and phase-based execution steps
   - **Critical Context**: `system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md` - Provides essential context from T-1.2.1 implementation including enhanced design patterns, validation infrastructure, and existing StepB component analysis

2. **Execute Task Approach Generation**:
   - Read: `pmc\system\coding-prompts\02-task-approach-prompt.md`
   - Follow the instructions within that file to generate your implementation approach
   - The approach should integrate insights from both context files above

## Step 2: Integrate Task Approach

1. **Navigate to PMC Directory** (if not already there):
   ```bash
   cd pmc
   ```

2. **Run Integration Command**:
   ```bash
   node bin\aplio-agent-cli.js task-approach
   ```

3. **Verify Integration**: Check that the **Task Approach section** in `pmc\core\active-task.md` contains an "Added:" notation. If missing, stop and request human assistance.

## Step 3: Execute Active Task

**CRITICAL CONTEXT UNDERSTANDING:**
- The `active-task.md` file contains your **primary execution roadmap** (phases, steps, acceptance criteria)
- The `carry-context` file provides **essential T-1.2.1 context** about enhanced design patterns, validation infrastructure, and existing StepB component analysis
- These files are **complementary** - use both to understand the full picture, but follow the execution steps in `active-task.md`

**Task Execution:**
1. Execute all phases in `pmc\core\active-task.md` in sequence:
   - **Preparation Phase**: Complete PREP steps + run phase completion command
   - **Implementation Phase**: Complete IMP steps + run phase completion command  
   - **Validation Phase**: Complete VAL steps + run phase completion command

2. **Important Notes for T-1.2.2**:
   - Current task is an **enhancement task** - improve existing StepB component, don't create from scratch
   - **CRITICAL**: Existing StepB component is at `4-categories-wf/src/components/client/StepBClient.tsx`
   - T-1.2.1 enhanced design patterns are available as reference - leverage them for consistency
   - All T-1.2.1 validation infrastructure remains available for testing T-1.2.2 enhancements

3. **Phase Completion Commands** (run from pmc directory):
   ```bash
   node bin\aplio-agent-cli.js update-phase-stage T-1.2.2 "PREP" "complete"
   node bin\aplio-agent-cli.js update-phase-stage T-1.2.2 "IMP" "complete" 
   node bin\aplio-agent-cli.js update-phase-stage T-1.2.2 "VAL" "complete"
   ```

## Step 4: Unit Testing Checkpoint

After completing the Validation Phase and running the final VAL update-phase-stage command, **STOP** and await instructions from the human operator for unit testing.

Unit testing instructions are in: `pmc\core\active-task-unit-tests-2.md`

---

## Key Operational Guidelines for T-1.2.2

- **Context Files Relationship**: `active-task.md` = what to do, `carry-context.md` = critical T-1.2.1 context that affects T-1.2.2
- **Current Task Nature**: Enhancement of existing functional StepB component, not creation from scratch  
- **Enhancement-First Approach**: Build upon existing `StepBClient.tsx` component rather than replacing it
- **Critical Reference**: T-1.2.1 established sophisticated design patterns - use them for consistency
- **Validation Tools Available**: Use T-1.2.1 validation patterns and adapt them for T-1.2.2
- **Command Location**: All PMC commands run from `pmc` directory
- **Terminal Fix**: Append ` | cat` to bash commands if terminals hang
- **Stay Focused**: Follow the explicit path in `active-task.md` while incorporating critical context from `carry-context.md`

## T-1.2.2 Specific Context

**What Makes T-1.2.2 Critical:**
- T-1.2.1 validated sophisticated design patterns that should be leveraged for consistency
- Existing StepB component has functional category selection but needs enhanced business value indicators
- T-1.2.2 must enhance user experience while building upon T-1.2.1 visual design patterns
- All enhancements must work seamlessly with existing workflow progression

**Key Enhancement Priorities:**
1. **Enhanced Category Cards**: Improve existing category presentation with T-1.2.1-inspired visual design
2. **Sophisticated Business Value Indicators**: Transform basic badges into comprehensive value displays
3. **Progressive Disclosure**: Add expandable descriptions using T-1.2.1 tooltip/popover patterns
4. **Analytics Integration**: Leverage comprehensive usage analytics data for sophisticated displays

This optimized prompt eliminates confusion by clearly defining the relationship between context files and emphasizing the enhancement nature of T-1.2.2 while highlighting the valuable foundation provided by T-1.2.1 design patterns.

## Implementation Success Indicators

- [ ] Both context files read and understood as complementary
- [ ] Task approach successfully integrated with "Added:" notation
- [ ] Existing StepBClient.tsx component analyzed before enhancement
- [ ] Progressive enhancement approach applied (preserve existing functionality)
- [ ] T-1.2.1 design patterns leveraged for visual consistency
- [ ] All phase completion commands executed successfully
- [ ] Enhanced UI maintains category selection and workflow progression capabilities
