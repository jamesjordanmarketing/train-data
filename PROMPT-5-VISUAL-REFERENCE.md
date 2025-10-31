# Prompt 5: Visual Reference - Bulk Actions & Keyboard Navigation

**Visual guide** to understand the UI components and interactions for bulk actions and keyboard shortcuts.

---

## 1. Bulk Actions Toolbar

### Location & Appearance

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                  Conversations Dashboard                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] CONV-001  Template    Approved   8.5   ...      │   │
│  │ [✓] CONV-002  Scenario    Pending    7.2   ...      │   │
│  │ [ ] CONV-003  Edge Case   Draft      6.1   ...      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│                        ↓↓↓                                   │
│                                                               │
│              ┌──────────────────────────────┐               │
│              │  🔵 2 selected   [Clear ✕]  │               │
│              │  ────────────────────────────│               │
│              │  [✓ Approve] [✕ Reject]     │               │
│              │  [↓ Export]  [🗑 Delete]     │               │
│              └──────────────────────────────┘               │
│                  ↑ Floating Toolbar                          │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

```
┌────────────────────────────────────────────────────┐
│  Badge: "2 selected"    Button: "Clear"           │  ← Left Section
├────────────────────────────────────────────────────┤
│  Vertical Divider                                  │  ← Separator
├────────────────────────────────────────────────────┤
│  [✓ Approve All] [✕ Reject All]                  │  ← Action Buttons
│  [↓ Export]      [🗑 Delete]                       │
└────────────────────────────────────────────────────┘
```

### States

#### Default State (No Selection)
- Toolbar **hidden** (not rendered)

#### Active State (Items Selected)
```
┌──────────────────────────────────────────────┐
│  🟦 5 selected  [Clear ✕]  │  [Buttons...]  │
└──────────────────────────────────────────────┘
    ↑ Badge              ↑ Clear    ↑ Actions
```

#### Processing State (Operation in Progress)
```
┌──────────────────────────────────────────────┐
│  🟦 5 selected  [Clear ✕]  │  [⌛ Loading...]│
└──────────────────────────────────────────────┘
                               ↑ Disabled buttons
```

---

## 2. Table with Keyboard Navigation

### Focus States

#### Unfocused Row
```
[ ] CONV-001  Template  Approved  8.5  3  Oct 31
    ↑ Normal state, no ring
```

#### Focused Row (Keyboard Navigation)
```
╔═══════════════════════════════════════════════════╗
║ [ ] CONV-001  Template  Approved  8.5  3  Oct 31 ║
╚═══════════════════════════════════════════════════╝
 ↑ Blue ring (ring-2 ring-primary)
```

#### Selected Row
```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓ [✓] CONV-001  Template  Approved  8.5  3  Oct 31 ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 ↑ Gray background (bg-muted)
```

#### Focused + Selected Row
```
╔═══════════════════════════════════════════════════╗
║▓ [✓] CONV-001  Template  Approved  8.5  3  Oct 31▓║
╚═══════════════════════════════════════════════════╝
 ↑ Blue ring + Gray background (both applied)
```

#### Hovered Row
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░ [ ] CONV-001  Template  Approved  8.5  3  Oct 31 ░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 ↑ Light gray background (hover:bg-muted/50)
```

### Navigation Flow

```
Start
  ↓
Press ↓ (Arrow Down)
  ↓
┌─────────────────────────┐
│ Row 1 [FOCUSED] ←─────┐ │  ← Blue ring appears
└─────────────────────────┘ │
                            │
Press ↓ again              │
  ↓                         │
┌─────────────────────────┐ │
│ Row 2 [FOCUSED] ←───────┤  ← Focus moves down
└─────────────────────────┘
  ↓
Press Space
  ↓
┌─────────────────────────┐
│ Row 2 [FOCUSED+SELECTED]│  ← Checkbox checked
└─────────────────────────┘      Gray bg + Blue ring
  ↓
Press Enter
  ↓
┌─────────────────────────┐
│  Detail Modal Opens     │
└─────────────────────────┘
```

---

## 3. Keyboard Shortcuts Help Dialog

### Layout

```
┌──────────────────────────────────────────────────────┐
│  Keyboard Shortcuts                              [✕] │
│  Boost your productivity with these shortcuts        │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Navigation                                          │
│  ─────────────────────────────────────────────       │
│  Navigate table rows            [↑] [↓]             │
│  Open conversation details      [Enter]              │
│  Switch between views           [1-5]                │
│  Close modal / Clear selection  [ESC]                │
│                                                       │
│  Selection                                           │
│  ─────────────────────────────────────────────       │
│  Toggle row selection           [Space]              │
│  Select all conversations       [Cmd] + [A]          │
│  Deselect all                   [Cmd] + [D]          │
│                                                       │
│  Actions                                             │
│  ─────────────────────────────────────────────       │
│  Export selected conversations  [Cmd] + [E]          │
│  Show keyboard shortcuts        [?]                  │
│                                                       │
│  Modal Navigation                                    │
│  ─────────────────────────────────────────────       │
│  Previous/Next conversation     [←] [→]              │
│  Close modal                    [ESC]                │
│                                                       │
├──────────────────────────────────────────────────────┤
│  Press [?] anytime to open this dialog               │
└──────────────────────────────────────────────────────┘
```

### Key Badge Style

```
Individual Key:
┌─────┐
│ Cmd │  ← Badge variant="secondary", monospace font
└─────┘

Key Combination:
┌─────┐   ┌───┐
│ Cmd │ + │ A │
└─────┘   └───┘
   ↑       ↑
 Badge    Badge
```

---

## 4. Confirmation Dialog

### Approve All Confirmation

```
┌────────────────────────────────────────────┐
│  ⚠️  Approve Conversations                 │
├────────────────────────────────────────────┤
│                                             │
│  Are you sure you want to approve          │
│  3 conversation(s)? This action will       │
│  move them to the approved state.          │
│                                             │
├────────────────────────────────────────────┤
│              [Cancel] [Continue]           │
└────────────────────────────────────────────┘
```

### Delete Confirmation (Destructive)

```
┌────────────────────────────────────────────┐
│  🛑 Delete Conversations                   │
├────────────────────────────────────────────┤
│                                             │
│  Are you sure you want to delete           │
│  5 conversation(s)? This action            │
│  CANNOT BE UNDONE and will permanently     │
│  remove these conversations.               │
│                                             │
├────────────────────────────────────────────┤
│              [Cancel] [Continue]           │
└────────────────────────────────────────────┘
```

---

## 5. Toast Notifications

### Success Toast

```
┌──────────────────────────────────────┐
│  ✅  Successfully approved           │
│      3 conversation(s)               │
└──────────────────────────────────────┘
   ↑ Green checkmark, auto-dismiss
```

### Error Toast

```
┌──────────────────────────────────────┐
│  ❌  Failed to approve conversations │
└──────────────────────────────────────┘
   ↑ Red X, stays visible longer
```

### Info Toast

```
┌──────────────────────────────────────┐
│  ℹ️  Duplicate functionality         │
│     coming soon                      │
└──────────────────────────────────────┘
   ↑ Blue info icon
```

---

## 6. Complete User Flow Example

### Scenario: Bulk Approve High-Quality Conversations

```
Step 1: Start at Dashboard
┌─────────────────────────────────────────────────────┐
│  Conversations Dashboard                            │
│  ┌───────────────────────────────────────────────┐ │
│  │ [ ] CONV-001  Template  Pending  9.2  ...    │ │
│  │ [ ] CONV-002  Scenario  Pending  8.7  ...    │ │
│  │ [ ] CONV-003  Template  Pending  8.1  ...    │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘


Step 2: Press Cmd+A (Select All)
┌─────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────┐ │
│  │ [✓] CONV-001  Template  Pending  9.2  ...    │ │ ← Selected
│  │ [✓] CONV-002  Scenario  Pending  8.7  ...    │ │ ← Selected
│  │ [✓] CONV-003  Template  Pending  8.1  ...    │ │ ← Selected
│  └───────────────────────────────────────────────┘ │
│                                                      │
│            ┌──────────────────────────┐            │
│            │  🔵 3 selected  [Clear]  │            │ ← Toolbar appears
│            │  [✓ Approve] [✕ Reject] │            │
│            └──────────────────────────┘            │
└─────────────────────────────────────────────────────┘


Step 3: Click "Approve All"
┌────────────────────────────────────────────┐
│  ⚠️  Approve Conversations                 │ ← Confirmation dialog
├────────────────────────────────────────────┤
│  Are you sure you want to approve          │
│  3 conversation(s)?                        │
├────────────────────────────────────────────┤
│              [Cancel] [Continue]           │
└────────────────────────────────────────────┘


Step 4: Click "Continue"
┌──────────────────────────────────────┐
│  ✅  Successfully approved           │ ← Toast notification
│      3 conversation(s)               │
└──────────────────────────────────────┘

Toolbar disappears (selections cleared)


Step 5: Result
┌─────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────┐ │
│  │ [ ] CONV-001  Template  Approved ✓  9.2 ... │ │ ← Status changed
│  │ [ ] CONV-002  Scenario  Approved ✓  8.7 ... │ │ ← Status changed
│  │ [ ] CONV-003  Template  Approved ✓  8.1 ... │ │ ← Status changed
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 7. Keyboard Navigation Example

### Scenario: Review and Select Conversations

```
Initial State:
┌─────────────────────────────────────────────────────┐
│  [ ] CONV-001  Template  Pending  9.2  ...         │
│  [ ] CONV-002  Scenario  Pending  8.7  ...         │
│  [ ] CONV-003  Template  Pending  8.1  ...         │
│  [ ] CONV-004  Edge Case Pending  6.5  ...         │
└─────────────────────────────────────────────────────┘


Press ↓ (Focus first row):
┌─────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════╗ │
│  ║ [ ] CONV-001  Template  Pending  9.2  ...    ║ │ ← Blue ring
│  ╚═══════════════════════════════════════════════╝ │
│  [ ] CONV-002  Scenario  Pending  8.7  ...         │
│  [ ] CONV-003  Template  Pending  8.1  ...         │
└─────────────────────────────────────────────────────┘


Press Space (Select row):
┌─────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════╗ │
│  ║▓[✓] CONV-001  Template  Pending  9.2  ...   ▓║ │ ← Ring + Gray bg
│  ╚═══════════════════════════════════════════════╝ │
│  [ ] CONV-002  Scenario  Pending  8.7  ...         │
└─────────────────────────────────────────────────────┘

Toolbar appears: "1 selected"


Press ↓ ↓ (Navigate down 2 rows):
┌─────────────────────────────────────────────────────┐
│  ▓▓[✓] CONV-001  Template  Pending  9.2  ...▓▓    │ ← Still selected
│  [ ] CONV-002  Scenario  Pending  8.7  ...         │
│  ╔═══════════════════════════════════════════════╗ │
│  ║ [ ] CONV-003  Template  Pending  8.1  ...    ║ │ ← Focused
│  ╚═══════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────┘


Press Space (Select another):
┌─────────────────────────────────────────────────────┐
│  ▓▓[✓] CONV-001  Template  Pending  9.2  ...▓▓    │
│  [ ] CONV-002  Scenario  Pending  8.7  ...         │
│  ╔═══════════════════════════════════════════════╗ │
│  ║▓[✓] CONV-003  Template  Pending  8.1  ...   ▓║ │
│  ╚═══════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────┘

Toolbar updates: "2 selected"


Press Enter (Open details):
┌────────────────────────────────────────────┐
│  Conversation Details                 [✕]  │
├────────────────────────────────────────────┤
│  CONV-003                                   │
│  Template Conversation                      │
│                                             │
│  [Full details displayed here...]          │
└────────────────────────────────────────────┘
```

---

## 8. Color Coding Reference

### Status Colors

```
Draft            🔵  Gray     bg-gray-100 text-gray-700
Generated        🔵  Blue     bg-blue-100 text-blue-700
Pending Review   🟡  Yellow   bg-yellow-100 text-yellow-700
Approved         🟢  Green    bg-green-100 text-green-700
Rejected         🔴  Red      bg-red-100 text-red-700
Needs Revision   🟠  Orange   bg-orange-100 text-orange-700
```

### Tier Colors

```
Template         🟣  Purple   bg-purple-100 text-purple-700
Scenario         🔵  Blue     bg-blue-100 text-blue-700
Edge Case        🟠  Orange   bg-orange-100 text-orange-700
```

### UI Element Colors

```
Focus Ring       🔵  Blue     ring-2 ring-primary
Selected BG      ⚪  Gray     bg-muted
Hover BG         ⚪  Light    bg-muted/50
Toolbar BG       ⚪  White    bg-background
Button Primary   🔵  Blue     (default variant)
Button Outline   ⚪  Gray     (outline variant)
Button Delete    🔴  Red      (destructive variant)
```

---

## 9. Responsive Behavior

### Desktop (1920px)
```
┌────────────────────────────────────────────────────────────┐
│  Full toolbar with all buttons visible                     │
│  [Badge + Clear]  │  [Approve] [Reject] [Export] [Delete] │
└────────────────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌──────────────────────────────────────────────┐
│  Toolbar buttons stack if needed             │
│  [Badge + Clear]  │  [Approve] [Reject]     │
│                   │  [Export]  [Delete]     │
└──────────────────────────────────────────────┘
```

### Mobile (375px)
```
┌────────────────────────────┐
│  Compact toolbar           │
│  [Badge + Clear]           │
│  [Approve] [Reject]        │
│  [Export]  [Delete]        │
└────────────────────────────┘
```

**Note**: Current implementation optimized for desktop. Mobile optimization may be added in future.

---

## 10. Animation & Transitions

### Toolbar Entrance
```
Hidden → Slide Up + Fade In
Duration: 200ms
Easing: ease-out
```

### Focus Ring Movement
```
Row 1 → Row 2
Instant transition (no animation)
Smooth scroll if off-screen
```

### Toast Notifications
```
Slide In from Top Right
Duration: 300ms
Auto-dismiss: 3 seconds (success)
Auto-dismiss: 5 seconds (error)
```

### Confirmation Dialog
```
Fade In Background
Scale In Dialog
Duration: 200ms
```

---

## Summary

This visual reference shows:
1. ✅ **Bulk Actions Toolbar** - Floating, contextual, with clear actions
2. ✅ **Table Focus States** - Blue ring for focus, gray for selection
3. ✅ **Keyboard Help Dialog** - Organized, discoverable with `?` key
4. ✅ **Confirmation Dialogs** - Clear warnings for destructive actions
5. ✅ **Toast Notifications** - Success/error feedback
6. ✅ **Complete User Flows** - Step-by-step visual examples
7. ✅ **Color Coding** - Consistent status and tier colors
8. ✅ **Responsive Design** - Adapts to screen sizes

All visual elements follow the app's design system and provide clear, immediate feedback to users.

---

**Related Documentation**:
- [PROMPT-5-DELIVERABLES.md](./PROMPT-5-DELIVERABLES.md) - Full implementation details
- [PROMPT-5-IMPLEMENTATION-SUMMARY.md](./PROMPT-5-IMPLEMENTATION-SUMMARY.md) - Technical summary
- [QUICK-START-BULK-ACTIONS.md](./QUICK-START-BULK-ACTIONS.md) - User guide

