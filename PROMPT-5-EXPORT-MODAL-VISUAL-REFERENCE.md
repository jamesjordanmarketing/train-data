# Export Modal UI - Visual Reference

**Version:** 1.0  
**Last Updated:** 2025-10-31

---

## Modal Layout Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Export Conversations                                              [X]    │
│  Configure export settings and download your training data                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─ Export Scope ─────────────────────────────────────────────────────┐  │
│  │                                                                      │  │
│  │  ○ Selected Conversations                                    [42]   │  │
│  │     Export only conversations you have selected                     │  │
│  │                                                                      │  │
│  │  ● Current Filters                                          [156]   │  │
│  │     Export conversations matching active filters                    │  │
│  │                                                                      │  │
│  │  ○ All Approved                                             [423]   │  │
│  │     Export all approved conversations                               │  │
│  │                                                                      │  │
│  │  ○ All Data                                                 [892]   │  │
│  │     Export entire dataset                                           │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ─────────────────────────────────────────────────────────────────────    │
│                                                                            │
│  ┌─ Export Format ────────────────────────────────────────────────────┐  │
│  │                                                                      │  │
│  │  ● 📄 JSONL - LoRA Training                  [Recommended]         │  │
│  │     Line-delimited JSON format, ideal for machine learning          │  │
│  │                                                                      │  │
│  │  ○ 🔧 JSON - Structured Data                                        │  │
│  │     Standard JSON format with proper nesting                        │  │
│  │                                                                      │  │
│  │  ○ 📊 CSV - Analysis & Reporting                                    │  │
│  │     Comma-separated values for spreadsheet applications             │  │
│  │                                                                      │  │
│  │  ○ 📝 Markdown - Human Review                                       │  │
│  │     Human-readable markdown format with formatting                  │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ─────────────────────────────────────────────────────────────────────    │
│                                                                            │
│  ┌─ Advanced Export Options ───────────────────── 4 / 6 enabled ───▼──┐  │
│  │                                                                      │  │
│  │  ☑ Include Metadata [Recommended]                             ⓘ   │  │
│  │     Include conversation metadata such as title, persona...         │  │
│  │                                                                      │  │
│  │  ☑ Include Quality Scores [Recommended]                       ⓘ   │  │
│  │     Include quality metrics and detailed scoring breakdown          │  │
│  │                                                                      │  │
│  │  ☑ Include Timestamps [Recommended]                           ⓘ   │  │
│  │     Include creation and modification timestamps                    │  │
│  │                                                                      │  │
│  │  ☐ Include Approval History                                    ⓘ   │  │
│  │     Include complete review and approval history                    │  │
│  │                                                                      │  │
│  │  ☐ Include Parent References                                   ⓘ   │  │
│  │     Include references to parent templates and scenarios            │  │
│  │                                                                      │  │
│  │  ☑ Include Full Content [Recommended]                         ⓘ   │  │
│  │     Include complete conversation content with all turns            │  │
│  │                                                                      │  │
│  │  [ 🔄 Reset to Defaults ]                                           │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ─────────────────────────────────────────────────────────────────────    │
│                                                                            │
│  ┌─ Export Preview ──────────────────── First 3 of 156 ──[👁][📋]───┐  │
│  │                                                                      │  │
│  │  ▼ Line 1                                            [126 chars]   │  │
│  │    {"id":"abc123","title":"Getting Started Guide",...}             │  │
│  │                                                                      │  │
│  │  ▼ Line 2                                            [142 chars]   │  │
│  │    {"id":"def456","title":"Advanced Features",...}                 │  │
│  │                                                                      │  │
│  │  ▼ Line 3                                            [131 chars]   │  │
│  │    {"id":"ghi789","title":"Troubleshooting Tips",...}              │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─ Export Summary ───────────────────────────────────────────────────┐  │
│  │                                                                      │  │
│  │  Conversations: 156                Format: JSONL                    │  │
│  │  Filename: conversations-export-2025-10-31.jsonl                    │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│                    [ Cancel ]    [ 📥 Export 156 Conversations ]          │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. ExportScopeSelector

```
┌─ Export Scope ───────────────────────────────────┐
│                                                   │
│  ○ [Icon] Label                           [Badge]│
│     Description text                             │
│  ├─────────────────────────────────────────────┤ │
│  │ Border highlights on selection              │ │
│  │ Primary color for selected state            │ │
│  │ Hover effect for all options                │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
└───────────────────────────────────────────────────┘
```

**States:**
- **Default:** Gray border, white background
- **Hover:** Darker border, subtle background tint
- **Selected:** Primary border, primary background tint, ring effect
- **Disabled:** Opacity 50%, cursor-not-allowed

---

### 2. ExportFormatSelector

```
┌─ Export Format ──────────────────────────────────┐
│                                                   │
│  ○ [Emoji] [Icon] Label - Subtitle [Badge]       │
│     Description line (can be 2 lines)            │
│     ┌───────────────────────────────────────┐    │
│     │ Tooltip on hover:                     │    │
│     │ • Key Feature 1                       │    │
│     │ • Key Feature 2                       │    │
│     │ • Key Feature 3                       │    │
│     └───────────────────────────────────────┘    │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Format Options:**

| Format | Emoji | Icon | Recommended |
|--------|-------|------|-------------|
| JSONL  | 📄    | FileCode | ✅ Yes |
| JSON   | 🔧    | FileJson | No |
| CSV    | 📊    | FileSpreadsheet | No |
| Markdown| 📝   | FileText | No |

---

### 3. ExportOptionsPanel (Collapsed)

```
┌─ Advanced Export Options ───── 4 / 6 enabled ─▼─┐
└───────────────────────────────────────────────────┘
```

### ExportOptionsPanel (Expanded)

```
┌─ Advanced Export Options ───── 4 / 6 enabled ─▲─┐
│                                                   │
│  ☑ Label [Tag] ⓘ                                 │
│     Description text explaining the option       │
│  ├─────────────────────────────────────────────┤ │
│  │ Hover shows background tint                 │ │
│  │ Tooltip on ⓘ hover                          │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │ [ 🔄 Reset to Defaults ]                  │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Option States:**
- ☑ Checked (enabled)
- ☐ Unchecked (disabled)
- [Recommended] tag for suggested options

---

### 4. ExportPreview - JSONL Format

```
┌─ Export Preview ─────── First 3 of 156 ──[👁][📋]┐
│                                                   │
│  ▼ Line 1                            [126 chars] │
│    ┌──────────────────────────────────────────┐  │
│    │ {                                        │  │
│    │   "id": "abc123",                        │  │
│    │   "title": "Getting Started Guide",     │  │
│    │   "turns": [...]                         │  │
│    │ }                                        │  │
│    └──────────────────────────────────────────┘  │
│                                                   │
│  ▶ Line 2                            [142 chars] │
│  ▶ Line 3                            [131 chars] │
│                                                   │
└───────────────────────────────────────────────────┘
```

### ExportPreview - JSON Format

```
┌─ Export Preview ─────── First 3 of 156 ──[👁][📋]┐
│                                                   │
│  ▼ Conversation 1                    [15 fields] │
│    ┌──────────────────────────────────────────┐  │
│    │ {                                        │  │
│    │   "id": "abc123",                        │  │
│    │   "title": "Getting Started",            │  │
│    │   "qualityScore": 85,                    │  │
│    │   ...                                    │  │
│    │ }                                        │  │
│    └──────────────────────────────────────────┘  │
│                                                   │
│  ▶ Conversation 2                    [15 fields] │
│  ▶ Conversation 3                    [15 fields] │
│                                                   │
└───────────────────────────────────────────────────┘
```

### ExportPreview - CSV Format

```
┌─ Export Preview ─────── First 3 of 156 ──[👁][📋]┐
│                                                   │
│  ┌─────┬────────────┬─────────┬────────┬──────┐  │
│  │ id  │ title      │ persona │ status │ score│  │
│  ├─────┼────────────┼─────────┼────────┼──────┤  │
│  │ 001 │ Getting... │ Expert  │ appr...│  85  │  │
│  │ 002 │ Advanced...│ Begin.. │ pend...│  72  │  │
│  │ 003 │ Trouble... │ Inter.. │ appr...│  91  │  │
│  └─────┴────────────┴─────────┴────────┴──────┘  │
│                                                   │
│  Showing first 10 rows of 156                     │
│                                                   │
└───────────────────────────────────────────────────┘
```

### ExportPreview - Markdown Format

```
┌─ Export Preview ─────── First 3 of 156 ──[👁][📋]┐
│                                                   │
│  # Conversation 1: Getting Started Guide          │
│                                                   │
│  **Metadata:**                                    │
│  • Persona: Expert                                │
│  • Emotion: Neutral                               │
│  • Status: approved                               │
│                                                   │
│  **Quality Score:** 85/100                        │
│                                                   │
│  ## Conversation                                  │
│  ### Turn 1 (user)                                │
│  Hello, how can I help?                           │
│  *Tokens: 42*                                     │
│                                                   │
│  ─────────────────────────────────────────────    │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## Interactive States

### Loading State

```
┌──────────────────────────────────────────────────┐
│  Export Conversations                      [X]   │
├──────────────────────────────────────────────────┤
│                                                  │
│  [All components visible but content grayed]    │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  [ Cancel ]  [ ⟳ Exporting... ]  (disabled)     │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Empty State

```
┌──────────────────────────────────────────────────┐
│  Export Preview                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│               (empty box icon)                   │
│                                                  │
│  No conversations to preview.                    │
│  Select conversations or adjust filters          │
│  to see a preview.                               │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Warning Alert

```
┌──────────────────────────────────────────────────┐
│  ⚠ No conversations match your selection.        │
│     Please adjust your filters or selection.     │
└──────────────────────────────────────────────────┘
```

---

## Color Scheme

### Primary Colors
- **Primary:** `hsl(var(--primary))` - Blue for selected states
- **Background:** `hsl(var(--background))` - White/light gray
- **Muted:** `hsl(var(--muted))` - Light gray for secondary elements
- **Border:** `hsl(var(--border))` - Gray borders

### State Colors
- **Default Border:** `border-border`
- **Hover Border:** `border-muted-foreground/50`
- **Selected Border:** `border-primary`
- **Selected Background:** `bg-primary/5`
- **Selected Ring:** `ring-2 ring-primary/20`

### Text Colors
- **Primary Text:** `text-foreground`
- **Secondary Text:** `text-muted-foreground`
- **Disabled Text:** `text-gray-400`
- **Success:** `text-green-600`
- **Error:** `text-red-600`

---

## Typography

### Font Sizes
- **Title:** `text-3xl` (30px)
- **Subtitle:** `text-lg` (18px)
- **Label:** `text-sm` (14px) `font-semibold`
- **Body:** `text-sm` (14px)
- **Caption:** `text-xs` (12px)
- **Code:** `text-xs` (12px) `font-mono`

### Font Weights
- **Semibold:** Labels, section headers
- **Medium:** Selected items, important info
- **Normal:** Body text, descriptions

---

## Spacing & Layout

### Modal Dimensions
- **Width:** `max-w-4xl` (896px)
- **Max Height:** `max-h-[90vh]`
- **Padding:** `p-4` to `p-8`

### Component Spacing
- **Section Gap:** `space-y-6` (24px)
- **Item Gap:** `space-y-3` (12px)
- **Inner Gap:** `space-y-2` (8px)
- **Horizontal Gap:** `gap-2` (8px)

### Component Padding
- **Card Padding:** `p-4` (16px)
- **Option Padding:** `py-2 px-3` (8px 12px)
- **Button Padding:** Standard button sizes

---

## Transitions & Animations

### Hover Effects
```css
transition-all duration-200
hover:border-muted-foreground/50
hover:bg-muted/50
```

### Selection Effects
```css
border-primary bg-primary/5 ring-2 ring-primary/20
transition-all duration-200
```

### Loading Spinner
```css
<Loader2 className="h-4 w-4 animate-spin" />
```

### Collapse/Expand
```css
/* Accordion animation */
data-[state=open]:animate-accordion-down
data-[state=closed]:animate-accordion-up
```

---

## Responsive Behavior

### Desktop (>1024px)
- Full 4-column layout for preview
- All sections expanded by default
- Side-by-side summary layout

### Tablet (768px - 1024px)
- 2-column layout for preview
- Sections collapsible
- Stacked summary layout

### Mobile (<768px)
- Single column layout
- Scrollable modal
- Compressed preview
- Simplified options panel

---

## Icons Used

| Component | Icons | Source |
|-----------|-------|--------|
| Scope | Users, Filter, CheckCircle, Database | lucide-react |
| Format | FileCode, FileJson, FileSpreadsheet, FileText | lucide-react |
| Options | HelpCircle, RotateCcw | lucide-react |
| Preview | Copy, Check, Eye, EyeOff, ChevronDown, ChevronRight | lucide-react |
| Actions | Download, AlertCircle, Loader2 | lucide-react |

---

## Accessibility Features

### ARIA Labels
```tsx
<RadioGroupItem 
  value="selected" 
  id="selected"
  aria-label="Export selected conversations"
/>
```

### Tooltips
```tsx
<Tooltip>
  <TooltipTrigger>
    <HelpCircle aria-label="Help information" />
  </TooltipTrigger>
  <TooltipContent>Detailed explanation</TooltipContent>
</Tooltip>
```

### Keyboard Navigation
- Full Tab order support
- Arrow key navigation in radio groups
- Space to toggle checkboxes
- Enter to activate buttons
- Escape to close modal

---

## Component Hierarchy

```
Dialog (Modal Container)
└── DialogContent (max-w-4xl)
    ├── DialogHeader
    │   ├── DialogTitle
    │   └── DialogDescription
    │
    ├── Content Area (space-y-6)
    │   ├── ExportScopeSelector
    │   │   └── RadioGroup
    │   │       └── RadioGroupItem[] x4
    │   │
    │   ├── Separator
    │   │
    │   ├── ExportFormatSelector
    │   │   └── RadioGroup
    │   │       └── TooltipProvider
    │   │           └── RadioGroupItem[] x4
    │   │
    │   ├── Separator
    │   │
    │   ├── ExportOptionsPanel
    │   │   └── Accordion
    │   │       └── AccordionItem
    │   │           ├── AccordionTrigger
    │   │           └── AccordionContent
    │   │               ├── Checkbox[] x6
    │   │               └── Reset Button
    │   │
    │   ├── Separator
    │   │
    │   ├── ExportPreview
    │   │   ├── Header (with Show/Copy buttons)
    │   │   └── ScrollArea
    │   │       └── Format-specific renderer
    │   │
    │   ├── Alert (conditional)
    │   │
    │   └── Export Summary Panel
    │
    └── DialogFooter
        ├── Cancel Button
        └── Export Button (with loading state)
```

---

## User Flow Diagram

```
┌─────────────┐
│  Dashboard  │
│   [Export]  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Export Modal Opens                     │
│  • Default: scope='all', format='jsonl' │
│  • Show dynamic counts                  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  User Selects Scope                     │
│  • Counts update dynamically            │
│  • Preview updates                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  User Selects Format                    │
│  • Preview renders in selected format   │
│  • Summary updates                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  User Configures Options (optional)     │
│  • Toggle checkboxes                    │
│  • Preview reflects changes             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  User Reviews Preview                   │
│  • Expand/collapse sections             │
│  • Copy to clipboard (optional)         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  User Clicks "Export X Conversations"   │
│  • Button shows loading state           │
│  • API call initiated                   │
└──────┬──────────────────────────────────┘
       │
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
   Success       Queued        Error
       │             │             │
       ▼             ▼             ▼
  Download      Background     Error
   Starts       Processing     Toast
       │             │             │
       ▼             ▼             ▼
   Success      Notification   Stay
    Toast       Toast          Open
       │             │             │
       ▼             ▼             ▼
    Close         Close        (retry)
    Modal         Modal
```

---

## Best Practices

### Visual Hierarchy
1. Most important action (Export button) is primary color
2. Secondary actions (Cancel, Reset) use outline/ghost variants
3. Progressive disclosure (options in accordion)
4. Clear visual grouping with separators

### Interaction Patterns
1. Instant feedback on all interactions
2. Disabled states prevent errors
3. Loading states show progress
4. Success/error messaging is clear

### Performance
1. Preview limited to first 3 conversations
2. Memoized computations prevent re-renders
3. Lazy rendering of collapsed content
4. Efficient filtering algorithms

---

**END OF VISUAL REFERENCE**

