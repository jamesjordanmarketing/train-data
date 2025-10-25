# New Panel New Task Automation Prompt

## Instructions for AI Agent

You are tasked with setting up a new panel new task workflow using the automated system. Follow these steps precisely:

### Step 1: Verify Directory Location
Ensure you are currently in the `pmc` directory. If not, navigate there immediately:

```bash
cd pmc
```

### Step 2: Run the New Panel Automation Script

Execute the automation script to create new timestamped panel files:

```bash
node system/management/new-panel-new-task.js
```
This automation script will:
a. Check for any existing files in `pmc/system/plans/new-panels/` that match these patterns:
- `new-panel-new-task-[MM-DD-YY-12-hour-Timestamp-[AM or PM]].md`
- `new-panel-new-task-conductor-[MM-DD-YY-12-hour-Timestamp-[AM or PM]].md`

b. Archive any existing new-panel files to the history directory
c. Copy `pmc\system\templates\new-panel-new-task-template.md` to `system/plans/new-panels/new-panel-new-task-[timestamp].md`
d. Copy `pmc\system\templates\new-panel-new-task-conductor-template.md` to `system/plans/new-panels/new-panel-new-task-conductor-[timestamp].md`

### Step 3: Confirm Successful Script Execution

After successful execution, you should see:
- ✅ Confirmation message that automation completed successfully
- 📄 Path to the new task file
- 📄 Path to the new conductor file

### Step 4: Run the New Context Prompt

Execute the new context prompt in new task context file from above (i.e. pmc\system\plans\new-panels\new-panel-new-task-DATETIMESTAMP.md ) 
Wait for 20 seconds to make sure the prompt has finished executing. Then check the output in  the automation script has completed successfully, you can proceed with your assigned development task using the newly created files.

### Step 5: Run the New Conductor Prompt 

Run the new conductor prompt in new task context file from above (i.e. pmc\system\plans\new-panels\new-panel-new-task-DATETIMESTAMP.md ) 
Wait for 20 seconds to make sure the prompt has finished executing. Then check the output in  the automation script has completed successfully, you can proceed with your assigned development task using the newly created files.


## Error Handling

If you encounter any errors:

1. **Directory not found error**: Ensure you are in the correct directory (`pmc`)
2. **Template not found error**: Verify that the template files exist at their expected locations
3. **Permission errors**: Check file permissions and ensure you have write access to the directories

## Important Notes

- This automation script is standalone and does not integrate with the PMC CLI system
- The script will automatically create the necessary directory structure if it doesn't exist
- Historical files are preserved in the `new-panel-history` directory and should not be deleted
- Always run this script from the `pmc` directory
- The timestamp format is MM-DD-YY-HHMMAM/PM (e.g., 12-25-25-0330PM)

## Next Steps

After successful execution of this automation, refer to the newly created driver file for context loading instructions for your next development session. 