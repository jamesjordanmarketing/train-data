# New Panel New Task Automation Prompt

## Instructions for AI Agent

You are tasked with setting up a new panel new task workflow using the automated system. Follow these steps precisely:

### Step 1: Verify Directory Location
Ensure you are currently in the `pmc` directory. If not, navigate there immediately:

```bash
cd ..
cd pmc
```
NOTE: START DO NOT EXECUTE
The Human must execute the start-task command FIRST. Then the human must execute the New Panel Automation Script before pasting this prompt into the chat panel.
```bash
node bin\aplio-agent-cli.js start-task "T-1.2.2"
node system\management\new-panel-new-task.js
```
This automation scripts will:
a. Archive any existing new-panel files to the history directory
b. Create new versions of the new task prompts.
Do NOT run it again in this prompt. This is a note only.
NOTE: END DO NOT EXECUTE

### Step 2: Confirm Successful Script Execution

After successful execution, you should see:
- ✅ Confirmation message that the script completed successfully
- 📄 Path to the new task file: system\plans\new-panels\01-new-panel-new-task-09-18-25-0855PM.md
- 📄 Path to the new conductor file: system\plans\new-panels\03-new-panel-new-task-conductor-09-18-25-0855PM.md

### Step 3: Run the New Context Prompt

Execute the new carry over context prompt system\plans\new-panels\01-new-panel-new-task-09-18-25-0855PM.md
Wait for 60 seconds to make sure the prompt has finished executing. 
You must check that the information in: system\plans\new-panels\02-new-task-carry-context-09-18-25-0855PM.md
has been updated with content relevant to this task and test.

If it has not run successfully re-run it. Almost always when it fails it is because you ran it from the wrong directory. So make sure you run it from the proper directory: by going to project root and then using cd pmc. When the files are confirmed updated with current informaton you can proceed to the next step. 

### Step 4: Run the New Conductor Prompt 

Execute the new conductor prompt in system\plans\new-panels\03-new-panel-new-task-conductor-09-18-25-0855PM.md
Wait for 60 seconds to make sure the prompt has finished executing. 

Check that the output in system\plans\new-panels\04-new-panel-new-task-conductor-output-09-18-25-0855PM.md 
has been updated with content relevant to this task and test.

If it has not run successfully re-run it. Almost always when it fails it is because you ran it from the wrong directory. So make sure you run it from the proper directory: by going to project root and then using cd pmc. When the files are confirmed updated with current informaton you can proceed to the next step. 

## Error Handling

If you encounter any errors:

1. **Directory not found error**: All folders already exist. So if you get directory not found error make sure you are in the correct directory by going to project root and then using cd pmc.
2. **Template not found error**: Verify that the template files exist at their expected locations. All templates already exist, so if not found you must not be in pmc


## Important Notes

- This automation script is standalone and does not integrate with the PMC CLI system
- Historical files are preserved in the `new-panel-history` directory and should not be deleted
- Always run this script from the `pmc` directory
- New bash shells ALWAYS open in pmc by default. Keep that in mind and navigate accordingly when you start a new shell.
- Always append ` | cat` to all bash terminal commands. The cat command reads all input and then terminates cleanly when the input stream closes. This ensures the command does not hang.
- The timestamp format is MM-DD-YY-HHMMAM/PM (e.g., 12-25-25-0330PM)


## Next Steps

The human will copy the system\plans\new-panels\04-new-panel-new-task-conductor-output-09-18-25-0855PM.md into the next ai testing agent panel.