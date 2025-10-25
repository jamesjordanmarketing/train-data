# First Test Conductor Customization Prompt

## Overview
This prompt generates the customized conductor prompt that integrates context and enhanced test plan for the testing agent.
Execute all actions in sequence, ensuring each step completes before proceeding to the next.

## Create Customized Conductor Prompt

**Objective**: Generate testing agent conductor prompt that integrates context and enhanced test plan.

**Instructions**:
Read the following files:
- `pmc\system\coding-prompts\03-test-conductor-prompt-v5.md` (base conductor prompt)
- `system\plans\new-tests\02-new-test-carry-context-06-22-25-0139PM.md`
- `pmc\core\active-task-unit-tests-2-enhanced.md`

Create customized conductor prompt at: `system\plans\new-tests\05-new-test-conductor-output-06-22-25-0139PM.md`

**Customization Process**:

1. **Base Prompt Integration**: Start with the full text of `03-test-conductor-prompt-v5.md`

2. **Context Integration**: Add specific instructions for the testing agent to:
   - Read and understand `first-test-carry-context.md` first
   - Use context information to inform all testing decisions
   - Reference specific implementation details from context

3. **Enhanced Test Plan Integration**: Add instructions to:
   - Execute `active-task-unit-tests-2-enhanced.md` as the primary test specification
   - Follow all directive instructions exactly as written
   - Report results according to enhanced test plan requirements

4. **Complementary Usage**: Ensure the prompt clearly states:
   - Both files are required and complementary
   - Context provides background and specific requirements
   - Enhanced test plan provides step-by-step execution instructions
   - Any conflicts should be resolved by prioritizing the enhanced test plan

5. **Optimization Review**: Include this section in your prompt:
   ```
   "Here is what I plan to tell the next testing agent:
   [Full customized prompt text]
   
   This prompt guides the testing agent to understand both:
   - system\plans\new-tests\02-new-test-carry-context-06-22-25-0139PM.md
   - pmc\core\active-task-unit-tests-2-enhanced.md
   
   These files are complementary and should not conflict or confuse the testing agent."
   ```

**Quality Assurance**:
- Verify no conflicting instructions between context and test plan
- Ensure testing agent has clear priority hierarchy for instruction conflicts
- Confirm all file references are correct and accessible
- Validate that the prompt provides sufficient guidance for autonomous testing execution

**Completion Check**: Verify that `system\plans\new-tests\05-new-test-conductor-output-06-22-25-0139PM.md` exists, integrates all components, and provides clear guidance for testing agent execution.

---

## EXECUTION PROTOCOL

**Success Criteria**: The system\plans\new-tests\05-new-test-conductor-output-06-22-25-0139PM.md file is created successfully with no conflicting instructions and clear guidance for autonomous testing agent execution.
