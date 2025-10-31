# Quick Start: Bulk Actions & Keyboard Navigation

**Goal**: Learn to use bulk operations and keyboard shortcuts to efficiently manage conversations.

**Time to Complete**: 5 minutes  
**Difficulty**: Easy

---

## Table of Contents
1. [Using Bulk Actions](#using-bulk-actions)
2. [Keyboard Shortcuts](#keyboard-shortcuts)
3. [Table Navigation](#table-navigation)
4. [Common Workflows](#common-workflows)
5. [Tips & Tricks](#tips--tricks)

---

## Using Bulk Actions

### Basic Selection

**With Mouse:**
1. Click checkboxes next to conversations you want to select
2. Bulk actions toolbar appears at bottom of screen
3. Shows count: "3 selected"

**With Keyboard:**
1. Press `Cmd+A` (Mac) or `Ctrl+A` (Windows) to select all
2. Or navigate with `↓` and press `Space` to select individual rows

### Available Bulk Actions

The toolbar shows 4 action buttons:

#### 1. Approve All
- **What it does**: Changes status to "approved" for all selected
- **Use case**: Quickly approve multiple quality conversations
- **Confirmation**: Yes (shows count)
- **Toast**: "Successfully approved X conversation(s)"

#### 2. Reject All
- **What it does**: Changes status to "rejected" for all selected
- **Use case**: Bulk reject low-quality conversations
- **Confirmation**: Yes (permanent action)
- **Toast**: "Successfully rejected X conversation(s)"

#### 3. Export
- **What it does**: Opens export modal with selected conversations
- **Use case**: Export specific subset of conversations
- **Confirmation**: No (opens modal)
- **Shortcut**: `Cmd+E` / `Ctrl+E`

#### 4. Delete
- **What it does**: Permanently removes selected conversations
- **Use case**: Clean up unwanted conversations
- **Confirmation**: Yes (warning about permanent deletion)
- **Toast**: "Successfully deleted X conversation(s)"
- **⚠️ Warning**: This cannot be undone!

### Clearing Selections

Three ways to clear:
1. Click "Clear" button on toolbar
2. Press `Cmd+D` / `Ctrl+D`
3. Press `ESC` key

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action | When to Use |
|----------|--------|-------------|
| `Cmd+A` / `Ctrl+A` | Select all visible conversations | Bulk operations on entire page |
| `Cmd+D` / `Ctrl+D` | Deselect all | Clear selections quickly |
| `Cmd+E` / `Ctrl+E` | Export selected | Export with keyboard |
| `ESC` | Clear selection / Close modals | Quick escape |
| `?` | Show keyboard shortcuts help | Learn/remember shortcuts |

### View Switching

| Key | View | Description |
|-----|------|-------------|
| `1` | Dashboard | Main conversations view |
| `2` | Templates | Template conversations |
| `3` | Scenarios | Scenario conversations |
| `4` | Edge Cases | Edge case conversations |
| `5` | Review Queue | Pending review items |

### Table Navigation

| Shortcut | Action | Description |
|----------|--------|-------------|
| `↑` | Move up | Navigate to previous row |
| `↓` | Move down | Navigate to next row |
| `Space` | Toggle selection | Select/deselect focused row |
| `Enter` | Open details | View conversation details |

### Modal Navigation

| Shortcut | Action | Description |
|----------|--------|-------------|
| `ESC` | Close | Close any open modal |
| `←` `→` | Navigate | Previous/next conversation (in detail view) |

---

## Table Navigation

### Visual Feedback

When navigating with keyboard:

1. **Focus Ring**: Blue outline shows which row is focused
   ```
   [Checkbox] CONV-123  Template  Approved  ← Blue ring around row
   ```

2. **Selected State**: Gray background shows selected rows
   ```
   [✓] CONV-123  Template  Approved  ← Gray background
   ```

3. **Hover State**: Light gray on mouse hover
   ```
   [Checkbox] CONV-124  Scenario  Pending  ← Light gray on hover
   ```

### Navigation Flow

```
1. Press ↓           → Focus first row (blue ring)
2. Press Space       → Select row (checkbox checked, gray bg)
3. Press ↓ ↓ ↓      → Navigate to 4th row (blue ring moves)
4. Press Space       → Select 4th row
5. Press Cmd+A       → Select all visible rows
6. Bulk toolbar appears with count
7. Press Enter       → Opens focused row's details
8. Press ESC         → Closes details modal
```

---

## Common Workflows

### Workflow 1: Approve High-Quality Conversations

**Goal**: Quickly approve all conversations with quality score > 8

**Steps**:
1. Apply quality filter: Min 8.0
2. Press `Cmd+A` to select all filtered conversations
3. Click "Approve All" or use toolbar
4. Confirm action
5. ✅ Done! All high-quality conversations approved

**Time**: ~10 seconds

---

### Workflow 2: Delete Draft Conversations

**Goal**: Clean up old draft conversations

**Steps**:
1. Filter by status: "Draft"
2. Review list to ensure correct items
3. Press `Cmd+A` to select all
4. Click "Delete" button
5. Read confirmation carefully
6. Click "Continue"
7. ✅ Drafts deleted

**Time**: ~15 seconds

---

### Workflow 3: Export Edge Cases for Review

**Goal**: Export all edge case conversations for external review

**Steps**:
1. Filter by tier: "Edge Case"
2. Filter by status: "Pending Review"
3. Select conversations:
   - Method A: `Cmd+A` for all
   - Method B: Navigate with `↓` and `Space` to select specific ones
4. Press `Cmd+E` (or click Export button)
5. Configure export options in modal
6. ✅ Export ready

**Time**: ~20 seconds

---

### Workflow 4: Keyboard-Only Review

**Goal**: Review and approve/reject without using mouse

**Steps**:
1. Press `↓` to focus first conversation
2. Press `Enter` to open details
3. Review conversation content
4. Press `ESC` to close
5. If good: Press `Space` to select, continue to next
6. If bad: Press `↓` to skip
7. After reviewing several: Press `Cmd+E` for export
8. Or: Click "Approve All" for bulk approve
9. ✅ Completed without touching mouse

**Time**: ~2-3 minutes for 10 conversations

---

## Tips & Tricks

### Productivity Tips

#### 1. Learn One Shortcut Per Day
Start with the most useful:
- Day 1: `Cmd+A` (select all)
- Day 2: `↓` / `↑` (navigate)
- Day 3: `Space` (toggle selection)
- Day 4: `Enter` (open details)
- Day 5: `Cmd+E` (export)

#### 2. Use ? Key Often
Press `?` anytime to see all available shortcuts.

#### 3. Combine Filters + Bulk Actions
- Filter to narrow down scope
- Select all filtered results
- Apply bulk action
- Very powerful for large datasets!

#### 4. Visual Scan Before Bulk Operations
- Always review what's selected before bulk actions
- Look at the count: "25 selected"
- Scan selected rows (gray background)
- Better safe than sorry!

#### 5. Keyboard + Mouse Hybrid
Don't force keyboard-only:
- Use keyboard for navigation: `↓` `↑`
- Use mouse for complex selections
- Use keyboard for actions: `Cmd+A`, `Cmd+E`

### Power User Techniques

#### Rapid Review Pattern
```
↓ ↓ ↓           Navigate quickly
Space Space     Select good ones
Enter           Open if unsure
ESC             Close and continue
Cmd+E           Export when done
```

#### Quality-Based Filtering
```
1. Filter: Quality 8-10, Status: Pending
2. Cmd+A to select all
3. Approve All
4. Filter: Quality 0-4, Status: Pending
5. Cmd+A
6. Reject All
```

#### Progressive Selection
```
1. Navigate with ↓
2. Press Space for good conversations
3. Keep count in mind (toolbar shows "X selected")
4. Apply action when ready
5. Continue with next batch
```

---

## Troubleshooting

### Shortcuts Not Working?

**Problem**: Pressing `Cmd+A` but conversations not selecting

**Solution**: Make sure you're not typing in an input field
- Click outside search box
- Press `ESC` to clear focus
- Try shortcut again

---

### Accidental Selection?

**Problem**: Selected too many conversations

**Solution**: 
- Press `Cmd+D` to clear all
- Or: Press `Cmd+A` then click individual checkboxes to deselect specific ones

---

### Can't See Focused Row?

**Problem**: Pressed `↓` but can't see which row is focused

**Solution**: Look for blue ring outline around row
- If not visible, row may be off-screen
- It will scroll into view automatically
- Try pressing `↓` a few more times

---

### Toolbar Not Appearing?

**Problem**: Selected conversations but toolbar not showing

**Solution**:
- Check if any conversations actually selected (checkboxes checked?)
- Try clicking a checkbox manually
- Refresh page if still not working

---

## Keyboard Shortcuts Cheat Sheet

### Print this for your desk! 📋

```
╔═══════════════════════════════════════════════════════════╗
║         KEYBOARD SHORTCUTS CHEAT SHEET                    ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  SELECTION                                                ║
║  ─────────────────────────────────────────────────       ║
║  Cmd/Ctrl + A        Select all conversations            ║
║  Cmd/Ctrl + D        Deselect all                        ║
║  Space              Toggle row selection                 ║
║                                                            ║
║  NAVIGATION                                               ║
║  ─────────────────────────────────────────────────       ║
║  ↑ / ↓              Navigate table rows                  ║
║  Enter              Open conversation details            ║
║  ESC                Close modal / Clear selection        ║
║  1-5                Switch between views                 ║
║                                                            ║
║  ACTIONS                                                  ║
║  ─────────────────────────────────────────────────       ║
║  Cmd/Ctrl + E        Export selected conversations       ║
║  ?                   Show keyboard shortcuts help        ║
║                                                            ║
║  MODAL                                                    ║
║  ─────────────────────────────────────────────────       ║
║  ← / →              Previous / Next conversation         ║
║  ESC                Close modal                          ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Next Steps

Now that you know the basics:

1. **Practice**: Try keyboard navigation on your conversations
2. **Experiment**: Test different bulk actions (start with small selections)
3. **Customize**: Combine filters + bulk actions for your workflow
4. **Share**: Teach teammates the `?` shortcut for help

**Related Guides**:
- [Quick Start: Conversations Dashboard](./QUICK-START-CONVERSATIONS-DASHBOARD.md)
- [Quick Start: Conversation Detail View](./QUICK-START-CONVERSATION-DETAIL.md)
- [Implementation Summary](./PROMPT-5-IMPLEMENTATION-SUMMARY.md)

---

**Need Help?**
- Press `?` to see keyboard shortcuts anytime
- Check [PROMPT-5-DELIVERABLES.md](./PROMPT-5-DELIVERABLES.md) for full documentation
- Review [Testing Checklist](#testing-checklist) in deliverables doc

**Happy Bulk Editing! 🚀**

