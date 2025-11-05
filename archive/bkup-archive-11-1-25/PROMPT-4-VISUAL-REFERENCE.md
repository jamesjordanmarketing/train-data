# Conversation Detail Modal - Visual Reference

Quick visual guide to the implemented interface structure.

---

## 🖼️ Modal Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Conversation Details                                              [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CONV-2024-001                           [< Previous] [Next >]         │
│  1 of 25 conversations                                                  │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ┌──────────────────────────┬────────────────────────────────────┐    │
│  │                          │                                    │    │
│  │  CONVERSATION TURNS      │  METADATA & ACTIONS                │    │
│  │  (66% width)             │  (33% width)                       │    │
│  │                          │                                    │    │
│  │  ┌────────────────────┐  │  ┌──────────────────────────────┐ │    │
│  │  │ 👤 User             │  │  │ Basic Information            │ │    │
│  │  │ Turn 1              │  │  │ Status: [Pending Review]     │ │    │
│  │  │ ─────────────────── │  │  │ Tier: [Template]             │ │    │
│  │  │ [Blue bubble]       │  │  │ Total Turns: 8               │ │    │
│  │  │ User message here   │  │  │ Created: Oct 31, 2025        │ │    │
│  │  └────────────────────┘  │  └──────────────────────────────┘ │    │
│  │                          │                                    │    │
│  │  ┌────────────────────┐  │  ┌──────────────────────────────┐ │    │
│  │  │ 🤖 Assistant        │  │  │ Context                      │ │    │
│  │  │ Turn 2 • 150 tokens │  │  │ Persona: Technical Expert    │ │    │
│  │  │ ─────────────────── │  │  │ Emotion: Helpful             │ │    │
│  │  │ [Purple bubble]     │  │  │ Topic: API Integration       │ │    │
│  │  │ Assistant response  │  │  └──────────────────────────────┘ │    │
│  │  └────────────────────┘  │                                    │    │
│  │                          │  ┌──────────────────────────────┐ │    │
│  │  ┌────────────────────┐  │  │ Quality Metrics              │ │    │
│  │  │ 👤 User             │  │  │ Overall Score: 8.5           │ │    │
│  │  │ Turn 3              │  │  │                              │ │    │
│  │  │ ─────────────────── │  │  │ Relevance: 9.0/10            │ │    │
│  │  │ [Blue bubble]       │  │  │ ████████████████░░ 90%       │ │    │
│  │  │ Follow-up question  │  │  │                              │ │    │
│  │  └────────────────────┘  │  │ Accuracy: 8.5/10             │ │    │
│  │                          │  │ ████████████████░ 85%        │ │    │
│  │  [More turns...]        │  │                              │ │    │
│  │  ↓ Scroll              │  │  Coherence: 8.0/10           │ │    │
│  │                          │  │ ███████████████░░ 80%        │ │    │
│  │                          │  └──────────────────────────────┘ │    │
│  │                          │                                    │    │
│  │                          │  ┌──────────────────────────────┐ │    │
│  │                          │  │ Review Actions               │ │    │
│  │                          │  │                              │ │    │
│  │                          │  │ Comment (optional):          │ │    │
│  │                          │  │ ┌──────────────────────────┐ │ │    │
│  │                          │  │ │ Add comment...            │ │ │    │
│  │                          │  │ └──────────────────────────┘ │ │    │
│  │                          │  │                              │ │    │
│  │                          │  │ [✓ Approve]                  │ │    │
│  │                          │  │ [⟳ Request Revision]         │ │    │
│  │                          │  │ [✗ Reject]                   │ │    │
│  │                          │  │                              │ │    │
│  │                          │  │ Review actions are permanent │ │    │
│  │                          │  └──────────────────────────────┘ │    │
│  │                          │  ↓ Scroll                         │    │
│  └──────────────────────────┴────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Coding

### User Messages
```
┌────────────────────────────┐
│ 👤 User                    │  ← Blue avatar (bg-blue-500)
│ Turn 1 • 45 tokens         │
│ ────────────────────────── │
│ ┌────────────────────────┐ │
│ │ Message content here   │ │  ← Blue bubble (bg-blue-50)
│ │ with proper wrapping   │ │     Blue border (border-blue-200)
│ └────────────────────────┘ │
└────────────────────────────┘
```

### Assistant Messages
```
┌────────────────────────────┐
│                    🤖 Assistant │  ← Purple avatar (bg-purple-500)
│         Turn 2 • 150 tokens    │
│ ──────────────────────────── │
│ ┌────────────────────────┐ │
│ │ Response content here  │ │  ← Purple bubble (bg-purple-50)
│ │ aligned to the right   │ │     Purple border (border-purple-200)
│ └────────────────────────┘ │
└────────────────────────────┘
```

---

## 📊 Quality Metrics Display

```
┌──────────────────────────────┐
│ Quality Metrics              │
├──────────────────────────────┤
│                              │
│ Overall Score           8.5  │  ← Large, bold, green
│                              │
│ Relevance         9.0/10     │
│ ████████████████░░ 90%       │  ← Progress bar
│                              │
│ Accuracy          8.5/10     │
│ ███████████████░░ 85%        │
│                              │
│ Naturalness       8.0/10     │
│ ███████████████░ 80%         │
│                              │
│ Coherence         7.5/10     │
│ ██████████████░░░ 75%        │
│                              │
│ Confidence        [HIGH]     │  ← Badge
│                              │
└──────────────────────────────┘
```

---

## 🏷️ Status Badges

```
Status Badge Variants:

[Approved]         ← Green (default variant)
[Rejected]         ← Red (destructive variant)
[Pending Review]   ← Yellow (secondary variant)
[Draft]            ← Gray (outline variant)
[Needs Revision]   ← Orange (outline variant)
```

---

## 🎯 Review Action Buttons

```
┌──────────────────────────────┐
│ Review Actions               │
├──────────────────────────────┤
│                              │
│ Comment (optional):          │
│ ┌──────────────────────────┐ │
│ │ [Textarea for comments]  │ │
│ │                          │ │
│ │                          │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  ✓  Approve              │ │  ← Green button
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  ⟳  Request Revision     │ │  ← Outline button
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  ✗  Reject               │ │  ← Red button
│ └──────────────────────────┘ │
│                              │
│ Review actions are permanent │
│ and will be logged.          │
│                              │
└──────────────────────────────┘
```

---

## 🔄 Navigation Controls

```
Top Navigation Bar:
┌─────────────────────────────────────────────────────┐
│ CONV-2024-001                 [< Previous] [Next >] │
│ 1 of 25 conversations                               │
└─────────────────────────────────────────────────────┘

States:
- Previous button disabled when on first conversation
- Next button disabled when on last conversation
- Position indicator shows current/total
- Keyboard shortcuts: ← → arrows
```

---

## 📱 Responsive Behavior

### Desktop (Large Screens)
```
Modal: 1024px wide (max-w-5xl)
Layout: 66% turns + 33% metadata
Grid: 3 columns (2 + 1)
Height: 90vh maximum
```

### Tablet (Medium Screens)
```
Modal: Still 2 columns
Turns column: Slightly larger
Metadata: Scrollable
Navigation: Full buttons visible
```

### Mobile (Small Screens - Future Enhancement)
```
Suggested: Single column layout
- Turn display at top
- Metadata cards below
- Fixed action bar at bottom
```

---

## 🎭 State Variations

### Loading State
```
┌─────────────────────────────┐
│ Conversation Details    [X] │
├─────────────────────────────┤
│                             │
│ [Skeleton line]             │  ← Animated skeleton
│ [Skeleton block]            │
│ [Skeleton block]            │
│                             │
└─────────────────────────────┘
```

### Error State
```
┌─────────────────────────────┐
│ Conversation Details    [X] │
├─────────────────────────────┤
│                             │
│ ⚠️  Error                   │
│ Failed to load conversation │
│ details. [error message]    │
│                             │
└─────────────────────────────┘
```

### Empty State (No Turns)
```
┌─────────────────────────────┐
│ Left Column                 │
├─────────────────────────────┤
│                             │
│                             │
│   No conversation turns     │
│   available                 │
│                             │
│                             │
└─────────────────────────────┘
```

---

## ⌨️ Keyboard Shortcuts

```
Global Shortcuts (when modal is open):

←  (Left Arrow)   → Previous conversation
→  (Right Arrow)  → Next conversation
Esc               → Close modal

Future Enhancements:
A                 → Approve
R                 → Reject
V                 → Request Revision
/                 → Focus comment field
```

---

## 🎯 Interactive Elements

### Hover States
```
Buttons:
- Default: Solid color
- Hover: Slightly darker + shadow
- Active: Pressed appearance
- Disabled: Faded opacity

Rows (Table):
- Default: White background
- Hover: Light gray background
- Selected: Slightly darker gray
- Click: Opens modal
```

### Focus States
```
All interactive elements have:
- Visible focus ring
- Keyboard accessible
- Tab order follows visual layout
```

---

## 📐 Spacing System

```
Spacing Scale:
- xs: 0.5rem (8px)   → Small gaps
- sm: 0.75rem (12px) → Compact spacing
- md: 1rem (16px)    → Default spacing
- lg: 1.5rem (24px)  → Section gaps (space-y-6)
- xl: 2rem (32px)    → Major sections

Applied:
- Between columns: gap-6 (24px)
- Between cards: space-y-4 (16px)
- Card padding: p-4 (16px)
- Button padding: py-2 px-4
```

---

## 🎨 Typography

```
Hierarchy:

Modal Title:        text-lg font-semibold
Section Headers:    text-base font-medium
Labels:             text-xs font-medium text-muted-foreground
Body Text:          text-sm
Metadata Values:    text-sm
Button Text:        text-sm font-medium
Code/IDs:           font-mono text-sm
```

---

## 🌊 Scroll Behavior

```
Modal Content:
┌─────────────────────────────────┐
│ [Header - Fixed]                │
├─────────────────────────────────┤
│ ┌─────────┬──────────┐          │
│ │ Turns   │ Metadata │          │
│ │ ↓ Scroll│ ↓ Scroll │          │  ← Independent scrolling
│ │         │          │          │
│ │         │          │          │
│ └─────────┴──────────┘          │
└─────────────────────────────────┘

Both columns scroll independently
Header stays fixed at top
Proper overflow handling
```

---

## 🎉 Success States

### After Approval
```
1. Button shows loading spinner
2. Toast notification appears:
   "✓ Conversation approved"
3. Modal closes with fade animation
4. Table row updates status badge
```

### After Navigation
```
1. Content fades out
2. New data loads
3. Content fades in
4. Position indicator updates
5. Button states update (enabled/disabled)
```

---

## 📊 Component Hierarchy

```
ConversationDetailModal
└── Dialog
    ├── DialogHeader
    │   └── DialogTitle
    └── DialogContent
        ├── Skeleton (loading)
        ├── Alert (error)
        └── ConversationDetailView
            ├── Navigation Header
            │   ├── Conversation ID
            │   ├── Position Indicator
            │   └── Nav Buttons
            ├── Grid Layout
            │   ├── Left Column (col-span-2)
            │   │   └── ConversationTurns
            │   │       └── Turn Items
            │   │           ├── Avatar
            │   │           └── Message Bubble
            │   └── Right Column (col-span-1)
            │       ├── ConversationMetadataPanel
            │       │   ├── Basic Info Card
            │       │   ├── Context Card
            │       │   ├── Quality Metrics Card
            │       │   └── Review History Card
            │       └── ConversationReviewActions
            │           ├── Comment Textarea
            │           └── Action Buttons
```

---

## 🎨 Design Tokens

```css
/* Colors */
--user-bg: bg-blue-50
--user-border: border-blue-200
--user-avatar: bg-blue-500
--assistant-bg: bg-purple-50
--assistant-border: border-purple-200
--assistant-avatar: bg-purple-500

/* Sizes */
--modal-max-width: max-w-5xl (1024px)
--modal-max-height: max-h-[90vh]
--avatar-size: h-10 w-10 (40px)
--card-padding: p-4 (16px)
--column-gap: gap-6 (24px)

/* Borders */
--border-radius: rounded-lg (8px)
--border-width: border (1px)
--border-color: border-gray-200

/* Shadows */
--card-shadow: shadow-sm
--button-shadow: shadow
--modal-shadow: shadow-lg
```

---

This visual reference provides a comprehensive view of the implemented interface design and user experience patterns.

