# Step-by-Step Guide to Test the 06 Task Generation Process

## Script Commands and Prompts for Complete Workflow Testing

### Phase 1: Initial Task Generation

```bash
# Step 1: Run the initial task generator
node pmc/product/_tools/06a-generate-task-initial-v3.js "Aplio Design System Next.js Modernization" aplio-mod-1
```

### Phase 2: Task Reordering and Dependency Management

```bash
# Step 2: Run the task reordering script
node pmc/product/_tools/06b-generate-and-reorder-tasks.js aplio-mod-1
```

### Phase 3: Element Generation

```bash
# Step 3: Run the element ID generator
node pmc/product/_tools/06c-generate-ele-for-tasks.js aplio-mod-1
```

### Phase 4: Task Element Breakdown with AI Architect

```
# Step 4: Submit this prompt to the AI architect agent

Process tasks T-1.1.1 through T-1.3.4 in pmc/product/06-aplio-mod-1-tasks.md using the following prompt:

[PASTE CONTENT FROM: pmc/product/_prompt_engineering/06a-product-task-elements-breakdown-prompt-v5.md]
```

### Phase 5: Test Creation with AI Architect

```
# Step 5: Submit this prompt to the AI architect agent

Generate test requirements for tasks T-1.1.1 through T-1.3.4 in pmc/product/06-aplio-mod-1-tasks.md using the following prompt:

[PASTE CONTENT FROM: pmc/product/_prompt_engineering/06ab-product-task-test-creation-prompt-v2.md]
```

### Phase 6: Task File Splitting

```bash
# Step 6: Run the task splitting script
node product/_tools/06d-split-task-files.js pmc/product/06-aplio-mod-1-tasks.md pmc/product/tasks
```

### Phase 7: Task Validation

```bash
# Step 7: Run the task validation script
node pmc/bin/aplio-agent-cli.js validate-tasks aplio-mod-1
```

## Testing Workflow Instructions

1. Ensure the functional requirements file exists at `pmc/product/03-aplio-mod-1-functional-requirements.md`.

2. Verify the structure and implementation pattern files exist:
   - `pmc/product/04-aplio-mod-1-structure.md`
   - `pmc/product/05-aplio-mod-1-implementation-patterns.md`

3. Execute each step in the order shown above, verifying successful completion before moving to the next step.

4. After each step, check the output files for expected content and format:
   - After Step 1: Verify `pmc/product/06-aplio-mod-1-tasks.md` exists with basic structure
   - After Step 3: Verify element IDs have been added
   - After Step 5: Verify test requirements have been added to task elements
   - After Step 6: Verify individual task files have been created in the output directory

5. Document any errors or unexpected behavior that occurs during testing.

## Common Errors and Solutions

- If initial task generation fails, verify the functional requirements file exists and has the correct format.
- If element generation fails, check that the task file structure follows the expected format.
- If task splitting fails, verify the input file path and ensure the output directory is writable.
- If validation reports missing elements or traceability issues, review the AI architect's output for the affected tasks.

## Notes for Reviewers

- This workflow tests the complete task generation process from initial creation through validation for the Aplio Design System Next.js Modernization project.
- Pay special attention to the traceability between elements, implementation steps, and tests.
- Verify that all tasks maintain the 2-4 hour estimated work time guideline.
- Check that split task files maintain all metadata and formatting from the original file.
