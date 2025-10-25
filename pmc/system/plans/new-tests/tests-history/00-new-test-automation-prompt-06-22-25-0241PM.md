# New Panel New Task Automation Prompt

## Instructions for AI Agent

You are tasked with setting up a new panel new test workflow using the automated system. Follow these steps precisely:

### Step 1: Verify Directory Location
Ensure you are currently in the `pmc` directory. If not, navigate there immediately:

```bash
cd ..
cd pmc
```

### Step 2: Run the New Panel Automation Script

Execute the automation script to create new timestamped panel files:

```bash
node system\management\new-panel-new-test.js
```
This automation script will:
a. Archive any existing new-tests files to the tests-history directory
b. Create new versions of the new task prompts.

### Step 3: Confirm Successful Script Execution

After successful execution, you should see:
- ✅ Confirmation message that the script completed successfully
- 📄 Path to the new task file: system\plans\new-tests\01-new-test-carry-prompt-06-22-25-0241PM.md
- 📄 Path to the new conductor file: system\plans\new-tests\04-new-test-conductor-prompt-06-22-25-0241PM.md

### Step 4: Run the New Context Prompt

Execute the new context prompt in system\plans\new-tests\01-new-test-carry-prompt-06-22-25-0241PM.md
Wait for 120 seconds to make sure the prompt has finished executing. You must check that the information in: 

Then check that the output in:
system\plans\new-tests\02-new-test-carry-context-06-22-25-0241PM.md and system\plans\new-tests\03-new-test-active-test-2-enhanced-06-22-25-0241PM.md
have been updated with content relevant to this task and test.

If it has not run successfully re-run it. Almost always when it fails it is because you ran it from the wrong directory. So make sure you run it from the proper directory: by going to project root and then using cd pmc. When the files are confirmed updated with current informaton you can proceed to the next step. 

### Step 5: Run the Test Conductor Customization Prompt 

Execute the test conductor prompt in system\plans\new-tests\04-new-test-conductor-prompt-06-22-25-0241PM.md to customize the new test conductor prompt. 
Wait for 60 seconds to make sure the prompt has finished executing. 

Check that the output in {{NEW_TEST_CONDUCTOR_OUTPUT}} 
has been updated with content relevant to this task and test.

If it has not run successfully re-run it. Almost always when it fails it is because you ran it from the wrong directory. So make sure you run it from the proper directory: by going to project root and then using cd pmc. When the files are confirmed updated with current informaton you can proceed to the next step. 

## Error Handling

If you encounter any errors:

1. **Directory not found error**: All folders already exist. So if you get directory not found error make sure you are in the correct directory by going to project root and then using cd pmc.
2. **Template not found error**: Verify that the template files exist at their expected locations. All templates already exist, so if not found you must not be in pmc

## Important Notes

- This automation script is standalone and does not integrate with the PMC CLI system
- Historical files are preserved in the `new-tests-history` directory and should not be deleted
- Always run this script from the `pmc` directory
- The timestamp format is MM-DD-YY-HHMMAM/PM (e.g., 12-25-25-0330PM)

## Next Steps
The human will copy the {{NEW_TEST_CONDUCTOR_OUTPUT}} into the next ai testing agent panel.
