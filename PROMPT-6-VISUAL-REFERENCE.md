# Prompt 6: Single Generation & Regeneration - Visual Reference

## UI Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│ SingleGenerationForm Dialog (max-w-6xl)                             │
├─────────────────────────────────────────────────────────────────────┤
│ Header: "Generate New Conversation" / "Regenerate Conversation"     │
│ Description: Configure parameters message                            │
├────────────────────────────────┬────────────────────────────────────┤
│ LEFT COLUMN (Form Fields)     │ RIGHT COLUMN (Preview)            │
│                                │                                    │
│ [Template Dropdown]            │ ┌──────────────────────────────┐ │
│   └─ None / Template 1-5       │ │ Template Preview Card        │ │
│                                │ │                              │ │
│ ┌──────────────────────────┐  │ │ [Template Name & Category]   │ │
│ │ Template Parameters      │  │ │                              │ │
│ │ (if template selected)   │  │ │ Resolved Template:           │ │
│ │                          │  │ │ ┌────────────────────────┐   │ │
│ │ [Dynamic Fields...]      │  │ │ │ Live preview with      │   │ │
│ │ [Auto-fill Button]       │  │ │ │ {{placeholders}}       │   │ │
│ └──────────────────────────┘  │ │ │ highlighted in yellow  │   │ │
│                                │ │ └────────────────────────┘   │ │
│ ────────────────────────────   │ │                              │ │
│ Core Parameters                │ │ ❌ Validation Errors         │ │
│                                │ │                              │ │
│ [Persona Dropdown *]           │ │ Template Metadata:           │ │
│ [Emotion Dropdown *]           │ │ • Tone: Professional         │ │
│ [Topic Textarea * 500 chars]   │ │ • Complexity: 7/10           │ │
│ [Intent Dropdown *]            │ │ • Quality: 7.5               │ │
│ [Tone Dropdown *]              │ │ • Usage: 45 times            │ │
│                                │ └──────────────────────────────┘ │
│ ────────────────────────────   │                                    │
│ Custom Parameters (0)          │                                    │
│                                │                                    │
│ [Existing Parameters List]     │                                    │
│ [Key Input] [Value Input]      │                                    │
│ [+ Add Custom Parameter]       │                                    │
│                                │                                    │
│ ────────────────────────────   │                                    │
│ [Cancel] [Generate]            │                                    │
└────────────────────────────────┴────────────────────────────────────┘
```

## Generation Flow Diagram

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Open Generation     │
│ Modal               │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐      ┌──────────────────┐
│ Select Template?    │─YES─→│ Load Template    │
│ (Optional)          │      │ Parameters       │
└──────┬──────────────┘      └────────┬─────────┘
       │ NO                           │
       │                              │
       │◄─────────────────────────────┘
       │
       ▼
┌─────────────────────┐
│ Fill Core Params    │
│ • Persona           │
│ • Emotion           │
│ • Topic             │
│ • Intent            │
│ • Tone              │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Add Custom Params?  │─YES─→ [Add Key-Value Pairs]
│ (Optional)          │
└──────┬──────────────┘
       │ NO
       ▼
┌─────────────────────┐
│ Review Template     │
│ Preview (if used)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐      ┌──────────────────┐
│ Click "Generate"    │─────→│ Validate Form    │
└──────┬──────────────┘      └────────┬─────────┘
       │                              │
       │                       ┌──────┴──────┐
       │                       │  Invalid?   │
       │                       └──────┬──────┘
       │                              │ YES
       │                              ▼
       │                      [Show Error Toast]
       │                              │
       │◄─────────────────────────────┘
       │ Valid
       ▼
┌─────────────────────┐
│ GENERATING...       │
│ [Spinner]           │
│ 15-45 seconds       │
└──────┬──────────────┘
       │
   ┌───┴────┐
   │Success?│
   └───┬────┘
       │
    ┌──┴───┐
   YES     NO
    │       │
    │       ▼
    │  ┌─────────────┐
    │  │ Error Modal │
    │  │ [Retry Btn] │
    │  └─────────────┘
    │
    ▼
┌─────────────────────┐
│ Conversation        │
│ Preview Modal       │
│                     │
│ • Quality Score     │
│ • Turns Display     │
│ • Metrics           │
│ • [Save] [Regen]    │
└──────┬──────────────┘
       │
   ┌───┴────┐
   │ Action?│
   └───┬────┘
       │
    ┌──┴───────┬──────────┐
  SAVE      REGENERATE   CLOSE
    │           │           │
    ▼           ▼           ▼
[Add to DB] [Restart    [Close
 Toast]      Flow]       Modal]
    │
    ▼
  ┌──────┐
  │ END  │
  └──────┘
```

## Regeneration Flow Diagram

```
┌─────────────────────┐
│ Conversation Table  │
│ [Row with Actions]  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Click 3-Dot Menu    │
│ Select "Regenerate" │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Open Generation     │
│ Form Pre-filled     │
│ with Original Data  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User Modifies       │
│ Desired Parameters  │
│ (Any field)         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Click "Regenerate"  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ REGENERATING...     │
│ [Spinner]           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Conversation        │
│ Preview Modal       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Click "Save"        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ • Original → Status │
│   'archived'        │
│ • New Conversation  │
│   with parentId     │
│ • Toast Notification│
└──────┬──────────────┘
       │
       ▼
     ┌──────┐
     │ END  │
     └──────┘
```

## Loading State UI

```
┌────────────────────────────────────┐
│  Generating Conversation...        │
├────────────────────────────────────┤
│                                    │
│            ⟳                       │
│      (spinning icon)               │
│                                    │
│    Generating conversation...      │
│                                    │
│    This may take 15-45 seconds     │
│                                    │
└────────────────────────────────────┘
```

## Conversation Preview Modal Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ ✓ Conversation Generated Successfully                            │
│ Review your generated conversation below                         │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────┬────────────┬────────────┬────────────┐           │
│ │ 📈 Quality │ 💬 Turns   │ # Tokens   │ 👁 Status  │           │
│ │   8.5/10   │     4      │    145     │ Excellent  │           │
│ └────────────┴────────────┴────────────┴────────────┘           │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Title: JWT Authentication                                │   │
│ │ Tier: Template  Persona: Technical Expert                │   │
│ │ Emotion: Confident                                       │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ 📊 Quality Metrics                          GREEN        │   │
│ │ Relevance: 8.2 | Accuracy: 8.5 | Naturalness: 8.3       │   │
│ │ Coherence: 8.7 | Confidence: High | Training: High      │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Conversation Preview                            ▲ ▼      │   │
│ │ ┌────────────────────────────────────────────────────┐  │   │
│ │ │ 👤 USER (45 tokens)                  [BLUE BG]    │  │   │
│ │ │ "I need help with JWT authentication"            │  │   │
│ │ │                                                   │  │   │
│ │ │ 🤖 ASSISTANT (100 tokens)            [GRAY BG]    │  │   │
│ │ │ "I'd be happy to help you implement JWT..."      │  │   │
│ │ │                                                   │  │   │
│ │ │ 👤 USER (30 tokens)                  [BLUE BG]    │  │   │
│ │ │ "Can you show me an example?"                    │  │   │
│ │ │                                                   │  │   │
│ │ │ 🤖 ASSISTANT (85 tokens)             [GRAY BG]    │  │   │
│ │ │ "Certainly! Here's a practical example..."       │  │   │
│ │ │                                                   │  │   │
│ │ │ [👁 Show All 4 Turns]                            │  │   │
│ │ └────────────────────────────────────────────────────┘  │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ [Close]  [🔄 Regenerate]                    [💾 Save]           │
└──────────────────────────────────────────────────────────────────┘
```

## Error State UI

```
┌────────────────────────────────────┐
│ ⚠ Generation Failed                │
│ We encountered an error while      │
│ generating your conversation.      │
├────────────────────────────────────┤
│                                    │
│ Error: Generation service          │
│ temporarily unavailable            │
│                                    │
│ Please check your connection and   │
│ try again.                         │
│                                    │
│ [Cancel]           [Retry]         │
└────────────────────────────────────┘
```

## Template Preview States

### State 1: No Template Selected
```
┌─────────────────────────────────┐
│ 👁 Template Preview             │
│ Select a template to see a live │
│ preview                         │
└─────────────────────────────────┘
```

### State 2: Template Selected, No Parameters
```
┌─────────────────────────────────┐
│ 👁 Template Preview             │
│ Live preview with current       │
│ parameters                      │
├─────────────────────────────────┤
│ Template: Technical Support     │
│ Category: Support               │
│                                 │
│ Resolved Template:              │
│ ┌─────────────────────────────┐ │
│ │ Enter parameter values to   │ │
│ │ see preview...              │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### State 3: Partial Parameters (with errors)
```
┌─────────────────────────────────┐
│ 👁 Template Preview      ❌ 2   │
│ Live preview with current       │
│ parameters                      │
├─────────────────────────────────┤
│ Template: Technical Support     │
│ Category: Support               │
│                                 │
│ Resolved Template:              │
│ ┌─────────────────────────────┐ │
│ │ User: I need help with      │ │
│ │ {{issue_type}}              │ │ ← Yellow highlight
│ └─────────────────────────────┘ │
│                                 │
│ ⚠ Validation Errors:            │
│ • Required parameter            │
│   "issue_type" is missing       │
│ • Unknown placeholder           │
│   "{{undefined}}" found         │
└─────────────────────────────────┘
```

### State 4: All Parameters Filled
```
┌─────────────────────────────────┐
│ 👁 Template Preview      ✅     │
│ Live preview with current       │
│ parameters                Ready │
├─────────────────────────────────┤
│ Template: Technical Support     │
│ Category: Support               │
│                                 │
│ Resolved Template:              │
│ ┌─────────────────────────────┐ │
│ │ User: I need help with      │ │
│ │ password reset              │ │ ← Resolved
│ │                             │ │
│ │ Assistant: I understand     │ │
│ │ you need password reset...  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Metadata:                       │
│ • Tone: Professional            │
│ • Complexity: 5/10              │
│ • Quality: 7.0                  │
│ • Usage: 23 times               │
└─────────────────────────────────┘
```

## Conversation Table with Regenerate Action

```
┌─────────────────────────────────────────────────────────────────────┐
│ Conversations Dashboard                                             │
├───┬─────┬────────────────────┬───────────┬──────────┬─────┬────────┤
│ ☐ │ ID  │ Title              │ Persona   │ Emotion  │ ... │ Actions│
├───┼─────┼────────────────────┼───────────┼──────────┼─────┼────────┤
│ ☐ │ 11  │ Marcus-Roth...     │ Mid-ca... │ Confusi..│ ... │   ⋮    │
│   │     │                    │           │          │     │   │    │
│   │     │                    │           │          │     │   ▼    │
│   │     │                    │           │          │ ┌───┴──────┐│
│   │     │                    │           │          │ │👁 View   ││
│   │     │                    │           │          │ │✏️ Edit   ││
│   │     │                    │           │          │ │📋 Duplic ││
│   │     │                    │           │          │ │🔄 Regen  ││ ← NEW
│   │     │                    │           │          │ │👁 Review ││
│   │     │                    │           │          │ │📥 Export ││
│   │     │                    │           │          │ ├──────────┤
│   │     │                    │           │          │ │🗑️ Delete ││
│   │     │                    │           │          │ └──────────┘│
└───┴─────┴────────────────────┴───────────┴──────────┴─────┴────────┘
```

## Color Coding Reference

### Quality Scores
```
┌────────────────────────────────────┐
│ Quality Score Color Guide          │
├────────────────────────────────────┤
│ 8.0 - 10.0  🟢 Green  "Excellent"  │
│ 6.0 - 7.9   🟡 Yellow "Good/Fair"  │
│ 0.0 - 5.9   🔴 Red    "Needs Work" │
└────────────────────────────────────┘
```

### Status Colors
```
┌────────────────────────────────────┐
│ Status Color Guide                 │
├────────────────────────────────────┤
│ generated       🔵 Blue            │
│ pending_review  🟡 Yellow          │
│ approved        🟢 Green           │
│ rejected        🔴 Red             │
│ archived        ⚫ Gray            │
└────────────────────────────────────┘
```

### Tier Colors
```
┌────────────────────────────────────┐
│ Tier Color Guide                   │
├────────────────────────────────────┤
│ template        🟣 Purple          │
│ scenario        🔵 Blue            │
│ edge_case       🟠 Orange          │
└────────────────────────────────────┘
```

## Responsive Layout Breakpoints

```
Desktop (lg+): Side-by-side layout
┌──────────────┬──────────────┐
│   Form       │   Preview    │
│   Fields     │   Panel      │
└──────────────┴──────────────┘

Mobile (<lg): Stacked layout
┌──────────────┐
│   Form       │
│   Fields     │
├──────────────┤
│   Preview    │
│   Panel      │
└──────────────┘
```

## Icon Reference

```
Component Icons:
👤 User turn
🤖 Assistant turn
📈 Quality score
💬 Turn count
#️⃣ Token count
👁 View/Preview
✏️ Edit
📋 Duplicate
🔄 Regenerate
🗑️ Delete
📥 Export
💾 Save
✨ Auto-fill
➕ Add
❌ Remove/Close
⚙️ Settings
🔍 Search
📊 Analytics
⚠️ Warning/Error
✅ Success
❌ Validation Error
```

## Form Field Icons and Labels

```
Required Fields (marked with *):
├─ Persona *     [Dropdown: 15 options]
├─ Emotion *     [Dropdown: 14 options]
├─ Topic *       [Textarea: 500 chars]
├─ Intent *      [Dropdown: 10 options]
└─ Tone *        [Dropdown: 10 options]

Optional Fields:
├─ Template      [Dropdown: Templates list]
├─ Template Params [Dynamic fields]
└─ Custom Params  [Key-Value pairs]
```

## Animation States

```
Loading Spinner:
  ⟳ Continuous rotation
  
Button States:
  Default: [Generate]
  Hover: [Generate] (slight shadow)
  Active: [Generate] (pressed effect)
  Loading: [⟳ Generating...] (disabled)
  
Toast Notifications:
  Slide in from top-right
  Auto-dismiss after 3 seconds
  Success: Green border
  Error: Red border
  Info: Blue border
```

## Accessibility Features

```
ARIA Labels:
├─ Form fields: aria-label="Persona selection"
├─ Buttons: aria-label="Generate conversation"
├─ Modals: aria-modal="true"
├─ Loading: aria-busy="true"
└─ Errors: aria-invalid="true"

Keyboard Navigation:
├─ Tab: Navigate fields
├─ Enter: Submit form
├─ Esc: Close modal
└─ Arrow keys: Dropdown navigation

Screen Reader:
├─ Announces form errors
├─ Announces loading state
├─ Announces success/failure
└─ Describes quality scores
```

## Z-Index Hierarchy

```
1000 - Toast notifications
900  - Conversation Preview Modal
800  - Single Generation Form Modal
700  - Dropdown menus
600  - Quality Details Modal
500  - Sticky elements
1    - Base content
```

## Complete User Journey Map

```
Entry Point 1: New Generation
Dashboard → Generate Button → Form → Generate → Preview → Save → Dashboard

Entry Point 2: Regeneration
Dashboard → Row Menu → Regenerate → Form (pre-filled) → Regenerate → Preview → Save → Dashboard

Entry Point 3: Template-Based
Dashboard → Generate Button → Select Template → Fill Params → Preview Template → Generate → Preview Conversation → Save → Dashboard

Entry Point 4: Quick Test
Dashboard → Generate Button → Fill Core Params Only → Generate → Preview → Regenerate (if needed) → Save → Dashboard
```

---

## Screenshot Placeholders

(In production, actual screenshots would be placed here)

1. **Single Generation Form** - Full modal with left/right columns
2. **Template Preview** - Highlighted placeholders example
3. **Conversation Preview** - Full modal with quality metrics
4. **Regenerate Menu** - Dropdown showing regenerate option
5. **Loading State** - Spinning loader during generation
6. **Error State** - Error modal with retry button
7. **Custom Parameters** - Adding key-value pairs
8. **Mobile Layout** - Responsive stacked view

---

This visual reference provides a comprehensive guide to the UI/UX of the Single Generation and Regeneration workflow. Use it alongside the implementation docs and quick start guide for complete understanding.

