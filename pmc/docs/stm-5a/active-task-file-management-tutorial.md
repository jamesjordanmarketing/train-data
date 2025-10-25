# Active Task File Management Tutorial

## Investigation Results: File Backup Operations

This document details which scripts handle the various active-task file backup operations in the project memory core system.

### Summary of Findings

After investigating the three scripts mentioned, here are the results:

**📋 Scripts Investigated:**
- `pmc/system/management/new-panel-new-task.js`
- `pmc/system/management/new-panel-new-test.js` 
- `pmc/system/management/context-manager-v2.js` (start-task command)

### ✅ **ANSWER: context-manager-v2.js handles ALL the backup operations**

**The `start-task` command in `context-manager-v2.js` is responsible for ALL the file backup operations you asked about.**

Specifically, there are **TWO functions** in `context-manager-v2.js` that handle these operations:
1. `startTaskV2()` function (around line 2302)
2. `startTaskV2Enhanced()` function (around line 3474)

Both functions perform the same backup operations but `startTaskV2Enhanced` is the more advanced version.

---

## Detailed Breakdown of File Operations

### 🔄 **Operation 1: Archive active-task-unit-tests-2.md to task-history**
- **Script:** `context-manager-v2.js`
- **Function:** `startTaskV2()` and `startTaskV2Enhanced()`
- **Location in code:** Lines 2442-2450 (startTaskV2) and Lines 3610-3618 (startTaskV2Enhanced)
- **Operation:** Uses `archiveTaskFile()` function to copy `pmc/core/active-task-unit-tests-2.md` to `pmc/system/plans/task-history/` with Task ID and timestamp appended to filename
- **Example filename:** `active-task-unit-tests-2-T-1.2.3-01-15-25-1045PM.md`

### 🔄 **Operation 2: Archive active-task.md to task-history**
- **Script:** `context-manager-v2.js`
- **Function:** `startTaskV2()` and `startTaskV2Enhanced()`
- **Location in code:** Lines 2432-2440 (startTaskV2) and Lines 3600-3608 (startTaskV2Enhanced)
- **Operation:** Uses `archiveTaskFile()` function to copy `pmc/core/active-task.md` to `pmc/system/plans/task-history/` with Task ID and timestamp appended to filename
- **Example filename:** `active-task-T-1.2.3-01-15-25-1045PM.md`

### 🔄 **Operation 3: Copy active-task.md to previous-task.md**
- **Script:** `context-manager-v2.js`
- **Function:** `startTaskV2()` and `startTaskV2Enhanced()`
- **Location in code:** Lines 2475-2489 (startTaskV2) and Lines 3651-3665 (startTaskV2Enhanced)
- **Operation:** Direct file copy with content modification (changes "# Current Active" to "# Previous" in first line)
- **Source:** `pmc/core/active-task.md`
- **Destination:** `pmc/core/previous-task.md`

### 🔄 **Operation 4: Copy active-task-unit-tests-2.md to previous-task-unit-tests-2.md**
- **Script:** `context-manager-v2.js`
- **Function:** `startTaskV2Enhanced()` only
- **Location in code:** Lines 3637-3648
- **Operation:** Direct file copy without content modification
- **Source:** `pmc/core/active-task-unit-tests-2.md`
- **Destination:** `pmc/core/previous-task-unit-tests-2.md`
- **Note:** This operation is only performed by the Enhanced version

### 🔄 **Operation 5: Copy active-task-unit-tests-2-enhanced.md to previous-task-unit-tests-2-enhanced.md**
- **Script:** `context-manager-v2.js`
- **Function:** `startTaskV2Enhanced()` only
- **Location in code:** Lines 3624-3635
- **Operation:** Direct file copy without content modification
- **Source:** `pmc/core/active-task-unit-tests-2-enhanced.md`
- **Destination:** `pmc/core/previous-task-unit-tests-2-enhanced.md`
- **Note:** This operation is only performed by the Enhanced version

---

## 🚫 **Scripts That DON'T Handle These Operations**

### new-panel-new-task.js
- **Purpose:** Creates timestamped new panel task files from templates
- **Operations:** Template processing, file generation, archiving of new-panel files (NOT active-task files)
- **No involvement in:** Any of the active-task backup operations listed above

### new-panel-new-test.js  
- **Purpose:** Creates timestamped new test files from templates
- **Operations:** Template processing, file generation, archiving of new-test files (NOT active-task files)
- **No involvement in:** Any of the active-task backup operations listed above

---

## 🔧 **How to Trigger These Operations**

To execute the file backup operations, you need to run the `start-task` command from `context-manager-v2.js`:

```bash
# Using the CLI wrapper
node pmc/bin/aplio-agent-cli.js start-task <TASK_ID>

# Or calling the function directly
node -e "
import('./pmc/system/management/context-manager-v2.js')
  .then(module => module.startTaskV2Enhanced('T-X.Y.Z'))
  .then(result => console.log(result))
"
```

---

## 📁 **Archive Directory Structure**

The archived files are stored in:
```
pmc/system/plans/task-history/
├── active-task-T-1.2.3-01-15-25-1045PM.md
├── active-task-unit-tests-2-T-1.2.3-01-15-25-1045PM.md
├── active-task-unit-tests-2-enhanced-T-1.2.3-01-15-25-1045PM.md
└── [other archived files...]
```

## 🕒 **Timestamp Format**

The timestamp format used in archived filenames is:
- **Format:** `MM-DD-YY-HHmmAM/PM`
- **Example:** `01-15-25-1045PM` (January 15, 2025, 10:45 PM)
- **Generated by:** `generateArchiveTimestamp()` function in context-manager-v2.js

---

## 🎯 **Key Takeaway**

**ALL the active-task file backup operations you asked about are handled exclusively by the `start-task` command in `context-manager-v2.js`.** The other two scripts (`new-panel-new-task.js` and `new-panel-new-test.js`) are for creating new templated files and do not touch the core active-task files.
