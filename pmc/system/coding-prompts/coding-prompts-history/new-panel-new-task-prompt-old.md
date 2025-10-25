# New Panel New Task Automation Prompt

## Instructions for AI Agent

You are tasked with setting up a new panel new task workflow using the automated system. Follow these steps precisely:

### Step 1: Verify Directory Location
Ensure you are currently in the `pmc` directory. If not, navigate there immediately:

```bash
cd pmc
```

### Step 2: Archive Existing Files
Before running the automation script, check for any existing files in `pmc/system/plans/new-panels/` that match these patterns:
- `new-panel-new-task-[MM-DD-YY-12-hour-Timestamp-[AM or PM]].md`
- `new-panel-new-task-driver-[MM-DD-YY-12-hour-Timestamp-[AM or PM]].md`

If such files exist, they will be automatically archived to `pmc/system/plans/new-panels/new-panel-history/` by the automation script.

### Step 3: Run the New Panel Automation Script
Execute the automation script to create new timestamped panel files:

```bash
node system/management/new-panel-new-task.js
```

### Step 4: Verify Script Execution
The script will:
1. Archive any existing new-panel files to the history directory
2. Copy `system/templates/new-panel-new-task.md` to `system/plans/new-panels/new-panel-new-task-[timestamp].md`
3. Copy `system/templates/new-panel-new-task-driver.md` to `system/plans/new-panels/new-panel-new-task-driver-[timestamp].md`
4. Replace the `{{NEW_PANEL_NEW_TASK_PATH}}` variable in the first file with its actual file path
5. Replace the `{{NEW_PANEL_NEW_TASK_DRIVER_PATH}}` variable in the second file with its actual file path

### Step 5: Confirm Success
After successful execution, you should see:
- ✅ Confirmation message that automation completed successfully
- 📄 Path to the new task file
- 📄 Path to the new driver file

### Step 6: Proceed with Task
Once the automation script has completed successfully, you can proceed with your assigned development task using the newly created files.

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