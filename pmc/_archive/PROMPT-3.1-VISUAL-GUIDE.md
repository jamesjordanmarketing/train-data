# PROMPT 3.1 VISUAL GUIDE
## Dimension Validation Spreadsheet UI - Visual Reference

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│           DIMENSION VALIDATION SPREADSHEET UI                │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Validation  │ │  Spreadsheet │ │   Dashboard  │
    │     Page     │ │  Component   │ │    Update    │
    └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 📁 File Structure

```
src/
├── app/
│   └── chunks/
│       └── [documentId]/
│           ├── page.tsx (UPDATED - added button)
│           └── dimensions/
│               └── [chunkId]/
│                   └── page.tsx (NEW - validation page)
│
└── components/
    └── chunks/
        └── DimensionValidationSheet.tsx (NEW - spreadsheet component)
```

---

## 🎨 Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  DIMENSION VALIDATION PAGE                                   │
│  /chunks/[documentId]/dimensions/[chunkId]                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ← Back    Document Title                  [Regenerate] ↻   │
│           Chunk Name • Run Timestamp                         │
│           Dimension Validation - 60 Total Dimensions         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STATISTICS                           Run: [Dropdown ▼]      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                    │
│  │  📊  │  │  📈  │  │  📈  │  │  ⚠️  │                    │
│  │ 85%  │  │ 8.2  │  │ 8.8  │  │  5   │                    │
│  │ Pop  │  │ Prec │  │ Accu │  │Review│                    │
│  └──────┘  └──────┘  └──────┘  └──────┘                    │
│                                                              │
│  Type Distribution:  [35 AI] [17 Mechanical] [8 Prior]      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  DIMENSION DETAILS                                           │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [🔍 Search...] [Type ▼] [Confidence ▼] [Size ▼] [💾]│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Dimension | Value | Type | Prec | Accu | Desc | ... │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ doc_id    | DOC1  | Prior| 10.0 | 10.0 | Unique... │    │
│  │ chunk_id  | #C001 | Mech | 10.0 | 10.0 | Stable... │    │
│  │ summary   | Text  | AI   | 8.5  | 9.0  | One-se... │    │
│  │ ...       | ...   | ...  | ...  | ...  | ...       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Showing 60 of 60 • Populated: 51/60 • High Conf: 45        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Hierarchy

```
DimensionValidationPage
    │
    ├─► Header
    │   ├─ Back Button
    │   ├─ Document Title
    │   ├─ Chunk Name + Timestamp
    │   └─ Regenerate Button
    │
    ├─► Statistics Card
    │   ├─ Card Header
    │   │   ├─ Title: "Statistics"
    │   │   └─ Run Selector Dropdown
    │   │
    │   └─ Card Content
    │       ├─ 4 Metrics Grid
    │       │   ├─ Populated %
    │       │   ├─ Avg Precision
    │       │   ├─ Avg Accuracy
    │       │   └─ Need Review Count
    │       │
    │       └─ Type Distribution Badges
    │
    └─► Dimension Details Card
        ├─ Card Header
        │   └─ Title: "Dimension Details"
        │
        └─ Card Content
            └─ DimensionValidationSheet
                ├─ Filter Controls
                │   ├─ Text Search Input
                │   ├─ Type Filter Dropdown
                │   ├─ Confidence Filter Dropdown
                │   ├─ Column Size Dropdown
                │   └─ Export CSV Button
                │
                ├─ Dimension Table
                │   ├─ Sticky Header (8 columns)
                │   └─ Table Body (60 rows)
                │
                └─ Summary Footer
```

---

## 📊 Spreadsheet Structure

### Table Layout
```
┌──────────────┬─────────────┬──────┬──────┬──────┬─────────┬──────┬────────┐
│   Chunk      │  Generated  │ Type │ Prec │ Accu │  Desc   │ Data │ Allowed│
│  Dimension ↕ │    Value    │  ↕   │  ↕   │  ↕   │         │ Type │ Format │
├──────────────┼─────────────┼──────┼──────┼──────┼─────────┼──────┼────────┤
│ doc_id       │ DOC_2025_01 │Prior │ 10.0 │ 10.0 │ Unique..│string│        │
│ doc_title    │ My Document │Prior │ 10.0 │ 10.0 │ Human...│string│        │
│ chunk_id     │ DOC#C001    │Mech  │ 10.0 │ 10.0 │ Stable..│string│        │
│ chunk_summ.. │ Explains... │ AI   │ 8.5  │ 9.0  │ One-sen.│string│<=240ch │
│ key_terms    │ LoRA, AI    │ AI   │ 8.0  │ 8.5  │ Pipe-...│list  │comma   │
│ ...          │ ...         │ ...  │ ...  │ ...  │ ...     │ ...  │ ...    │
└──────────────┴─────────────┴──────┴──────┴──────┴─────────┴──────┴────────┘
  ↑ Sortable     Standard    Badge  Color  Color   Truncate  Code   Muted
                             Code   +Icon  +Icon   +Hover    Style  
```

### Column Details
```
Column 1: Chunk Dimension (w-48 medium)
├─ Field name in camelCase
├─ Sortable (click header)
├─ Font: medium weight
└─ Example: "chunk_summary_1s"

Column 2: Generated Value (w-64 medium)
├─ Formatted display value
├─ Arrays: comma-separated
├─ Booleans: Yes/No
├─ Objects: JSON string
├─ Nulls: "-" (muted)
└─ Long text: truncated + hover

Column 3: Type (w-32 medium)
├─ Generation type badge
├─ Sortable + Filterable
├─ Colors:
│   ├─ AI: Purple (bg-purple-100)
│   ├─ Mechanical: Blue (bg-blue-100)
│   └─ Prior: Gray (bg-gray-100)
└─ Labels: "AI", "Mechanical", "Prior"

Column 4: Precision (w-32 medium)
├─ Confidence score (0-10)
├─ Sortable (click header)
├─ Color-coded:
│   ├─ ≥8.0: Green + CheckCircle
│   ├─ 6.0-7.9: Yellow + AlertCircle
│   └─ <6.0: Orange + AlertCircle
└─ Format: "8.5" (1 decimal)

Column 5: Accuracy (w-32 medium)
├─ Confidence score (0-10)
├─ Sortable (click header)
├─ Color-coded (same as precision)
└─ Format: "8.5" (1 decimal)

Column 6: Description (w-64 medium)
├─ Field description from metadata
├─ Truncated at 80 chars
├─ Full text on hover
└─ Font: xs, muted

Column 7: Data Type (w-32 medium)
├─ Type from metadata
├─ Code style formatting
└─ Example: "string", "enum", "list[string]"

Column 8: Allowed Format (w-32 medium)
├─ Validation rules
├─ Truncated if long
├─ Font: xs, muted
└─ Example: "<=240 chars", "0.0-1.0"
```

---

## 🎨 Color System

### Confidence Scoring
```
High Confidence (≥8.0)
┌─────────────────────┐
│ ✅ 8.5              │  ← Green background
│                     │     Green text
└─────────────────────┘     CheckCircle icon

Medium Confidence (6.0-7.9)
┌─────────────────────┐
│ ⚠️  7.2             │  ← Yellow background
│                     │     Yellow text
└─────────────────────┘     AlertCircle icon

Low Confidence (<6.0)
┌─────────────────────┐
│ ⚠️  5.8             │  ← Orange background
│                     │     Orange text
└─────────────────────┘     AlertCircle icon

CSS Classes:
├─ Green: "text-green-600 bg-green-50"
├─ Yellow: "text-yellow-600 bg-yellow-50"
└─ Orange: "text-orange-600 bg-orange-50"
```

### Generation Type Badges
```
AI Generated
┌─────┐
│ AI  │  ← Purple: bg-purple-100 text-purple-800
└─────┘

Mechanically Generated
┌────────────┐
│ Mechanical │  ← Blue: bg-blue-100 text-blue-800
└────────────┘

Prior Generated
┌───────┐
│ Prior │  ← Gray: bg-gray-100 text-gray-800
└───────┘
```

### Statistics Cards
```
Populated %          Avg Precision        Avg Accuracy         Need Review
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 📊 Blue      │    │ 📈 Green     │    │ 📈 Purple    │    │ ⚠️  Orange   │
│              │    │              │    │              │    │              │
│ 85%          │    │ 8.2          │    │ 8.8          │    │ 5            │
│ Populated    │    │ Avg Precision│    │ Avg Accuracy │    │ Need Review  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
bg-blue-50           bg-green-50          bg-purple-50         bg-orange-50
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER ACTIONS                            │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Filter     │ │     Sort     │ │    Export    │
    │   Change     │ │    Change    │ │     CSV      │
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ▼
                    ┌──────────────┐
                    │   useMemo    │
                    │   Recalc     │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Filtered   │
                    │   & Sorted   │
                    │     Rows     │
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Render     │
                    │    Table     │
                    └──────────────┘
```

### Detailed Flow: Page Load
```
Component Mount
    │
    ├─► useEffect (mount)
    │       │
    │       └─► dimensionService.getRunsForChunk(chunkId)
    │               │
    │               ├─► Fetch chunk to get document_id
    │               ├─► Fetch all runs for document
    │               ├─► Check which runs have data for this chunk
    │               └─► Return: Array<{ run, hasData }>
    │
    ├─► setAvailableRuns(runs)
    ├─► setSelectedRunId(mostRecentRun.run_id)
    │
    ├─► useEffect (selectedRunId change)
    │       │
    │       └─► dimensionService.getDimensionValidationData(chunkId, runId)
    │               │
    │               ├─► Fetch chunk
    │               ├─► Fetch dimensions
    │               ├─► Fetch run
    │               ├─► Fetch document
    │               ├─► Build dimensionRows (60 enriched rows)
    │               ├─► Calculate statistics
    │               └─► Return: DimensionValidationData
    │
    └─► setData(validationData)
            │
            └─► Render Page
                    │
                    ├─► Statistics Card
                    └─► DimensionValidationSheet
```

### Detailed Flow: Run Selection
```
User Selects Different Run
    │
    └─► handleRunChange(newRunId)
            │
            ├─► setSelectedRunId(newRunId)
            │
            └─► useEffect Triggered
                    │
                    ├─► setLoading(true)
                    │
                    ├─► dimensionService.getDimensionValidationData(chunkId, newRunId)
                    │       │
                    │       └─► Fetch data for new run
                    │
                    ├─► setData(newData)
                    │
                    ├─► setLoading(false)
                    │
                    └─► Render Updates
                            │
                            ├─► Statistics recalculate
                            └─► Spreadsheet refreshes
```

---

## 📱 Responsive Breakpoints

### Desktop (≥1024px)
```
┌─────────────────────────────────────────────────────────────┐
│  Full Width Layout                                           │
├─────────────────────────────────────────────────────────────┤
│  [Back]  Document Title              [Regenerate]            │
├─────────────────────────────────────────────────────────────┤
│  Statistics                                Run: [Dropdown]   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ Metric │ │ Metric │ │ Metric │ │ Metric │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│  [Badge] [Badge] [Badge]                                    │
├─────────────────────────────────────────────────────────────┤
│  Dimension Details                                          │
│  [Filters Row]                                              │
│  [─────────────────── Table ───────────────────]            │
│  All 8 columns visible                                      │
└─────────────────────────────────────────────────────────────┘
```

### Tablet (768px-1023px)
```
┌──────────────────────────────────────────┐
│  Condensed Layout                         │
├──────────────────────────────────────────┤
│  [Back]  Doc Title  [Regenerate]         │
├──────────────────────────────────────────┤
│  Statistics          Run: [Dropdown]     │
│  ┌────────┐ ┌────────┐                  │
│  │ Metric │ │ Metric │                  │
│  └────────┘ └────────┘                  │
│  ┌────────┐ ┌────────┐                  │
│  │ Metric │ │ Metric │                  │
│  └────────┘ └────────┘                  │
│  [Badge] [Badge] [Badge]                 │
├──────────────────────────────────────────┤
│  Dimension Details                       │
│  [Filters Wrap]                          │
│  [───── Table (scroll) ─────]            │
│  Horizontal scroll for all columns       │
└──────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────┐
│  Mobile Layout        │
├──────────────────────┤
│  [←] Doc Title  [↻]  │
├──────────────────────┤
│  Statistics          │
│  Run: [Dropdown]     │
│  ┌────────┐          │
│  │ Metric │          │
│  └────────┘          │
│  ┌────────┐          │
│  │ Metric │          │
│  └────────┘          │
│  ┌────────┐          │
│  │ Metric │          │
│  └────────┘          │
│  ┌────────┐          │
│  │ Metric │          │
│  └────────┘          │
│  [Badge]             │
│  [Badge]             │
│  [Badge]             │
├──────────────────────┤
│  Dimension Details   │
│  [Search]            │
│  [Type ▼]            │
│  [Conf ▼]            │
│  [Size ▼] [💾]       │
│  [─ Table (H-scroll) │
│  Full scroll needed  │
└──────────────────────┘
```

---

## 🎯 Interactive Elements

### Sortable Column Header
```
Normal State:
┌──────────────────────┐
│ Chunk Dimension ↕    │  ← cursor: pointer
└──────────────────────┘     hover: bg-muted/50

After Click (Ascending):
┌──────────────────────┐
│ Chunk Dimension ↑    │  ← sorted asc
└──────────────────────┘

After Second Click (Descending):
┌──────────────────────┐
│ Chunk Dimension ↓    │  ← sorted desc
└──────────────────────┘
```

### Filter Controls
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Search...  │ Type ▼  │ Confidence ▼ │ Size ▼ │ 💾  │
└─────────────────────────────────────────────────────────┘
     │              │           │            │        │
     ▼              ▼           ▼            ▼        ▼
  Text Input   Dropdown    Dropdown     Dropdown   Button
  (real-time)  (instant)   (instant)   (instant)  (loading)
```

### Run Selector
```
Statistics Card Header:
┌─────────────────────────────────────────────────────────┐
│ Statistics                    Run: [Dropdown ▼]          │
└─────────────────────────────────────────────────────────┘

Dropdown Open:
┌────────────────────────────────────────┐
│ 10/7/2025, 2:30 PM - gpt-4-turbo      │ ← Selected
│ 10/6/2025, 10:15 AM - gpt-4-turbo     │
│ 10/5/2025, 3:45 PM - claude-3-opus    │
└────────────────────────────────────────┘
```

### Export Button States
```
Normal:
┌─────────────┐
│ 💾 Export   │
└─────────────┘

Loading:
┌─────────────────┐
│ ⏳ Exporting... │  ← disabled
└─────────────────┘
```

---

## 📊 Statistics Calculations

### Visual Formula Display
```
Populated Percentage:
┌────────────────────────────────────┐
│  Populated Dimensions              │
│  ─────────────────── × 100 = 85%   │
│  Total Dimensions (60)             │
└────────────────────────────────────┘

Average Precision (AI Only):
┌────────────────────────────────────┐
│  Sum(AI Precision Scores)          │
│  ──────────────────────── = 8.2    │
│  Count(AI Dimensions) (35)         │
└────────────────────────────────────┘

Average Accuracy (AI Only):
┌────────────────────────────────────┐
│  Sum(AI Accuracy Scores)           │
│  ──────────────────────── = 8.8    │
│  Count(AI Dimensions) (35)         │
└────────────────────────────────────┘

Need Review Count:
┌────────────────────────────────────┐
│  Count(Dimensions with             │
│        Accuracy < 8.0) = 5         │
└────────────────────────────────────┘
```

---

## 🔍 Filter Combinations

### Example 1: High Quality AI Dimensions
```
Filters Applied:
├─ Type: AI Generated
└─ Confidence: High (≥8.0)

Result:
┌──────────────────────────────────┐
│ Showing 30 of 60 dimensions      │
│ Populated: 30/60                 │
│ High Confidence: 30              │
└──────────────────────────────────┘

Table Shows:
├─ Only AI Generated dimensions
└─ Only those with both precision & accuracy ≥8.0
```

### Example 2: Search + Filter
```
Filters Applied:
├─ Search: "task"
└─ Type: AI Generated

Result:
┌──────────────────────────────────┐
│ Showing 6 of 60 dimensions       │
│ Populated: 4/60                  │
│ High Confidence: 3               │
└──────────────────────────────────┘

Table Shows:
├─ task_name
├─ preconditions
├─ inputs
├─ steps_json
├─ expected_output
└─ warnings_failure_modes
```

---

## 📤 CSV Export Process

```
User Clicks Export
    │
    ▼
┌─────────────────────┐
│ setExporting(true)  │
│ Show Loading State  │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Build CSV Headers   │
│ (9 columns)         │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Map Filtered Rows   │
│ to CSV Format       │
│ (escape quotes)     │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Create Blob         │
│ type: text/csv      │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Create Download     │
│ Link + Click        │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Show Success Toast  │
│ setExporting(false) │
└─────────────────────┘
```

---

## 🎯 User Interaction Flows

### Flow 1: Review Low Confidence Dimensions
```
START
  │
  ├─► Navigate to dimension validation page
  │
  ├─► Check statistics: "5 Need Review"
  │
  ├─► Apply filter: Confidence → Low (<8.0)
  │
  ├─► Table shows 5 low-confidence dimensions
  │
  ├─► Review each dimension's value and description
  │
  ├─► Decide which need regeneration
  │
  └─► Export CSV for documentation
END
```

### Flow 2: Compare Runs
```
START
  │
  ├─► Open dimension validation page (defaults to latest run)
  │
  ├─► Note statistics: 85% populated, 8.2 precision, 8.8 accuracy
  │
  ├─► Select different run from dropdown
  │
  ├─► Page reloads data
  │
  ├─► Compare new statistics: 80% populated, 7.9 precision, 8.5 accuracy
  │
  ├─► Conclusion: Latest run has better quality
  │
  └─► Use latest run's data
END
```

### Flow 3: Find Specific Information
```
START
  │
  ├─► Open dimension validation page
  │
  ├─► Type "claim" in search box
  │
  ├─► Table filters to show claim, evidence_snippets, reasoning_sketch, citations
  │
  ├─► Check confidence scores for CER dimensions
  │
  ├─► Sort by precision (ascending) to see lowest first
  │
  └─► Review lowest confidence CER dimensions
END
```

---

## 🎨 Style Guide

### Typography
```
Page Title:        text-2xl font-bold
Subtitle:          text-sm text-muted-foreground
Card Title:        text-lg font-semibold
Metric Value:      text-2xl font-bold
Metric Label:      text-sm
Table Header:      text-sm font-medium
Table Cell:        text-sm
Description:       text-xs text-muted-foreground
```

### Spacing
```
Page Container:    px-4 py-8 space-y-6
Card Padding:      p-4 (header), p-6 (content)
Table Cell:        py-2 px-4 (compact)
Button:            px-3 py-2 (small)
Gap between items: gap-2, gap-3, gap-4
```

### Borders & Rounding
```
Cards:            rounded-lg border
Table:            rounded-lg border
Badges:           rounded-md
Buttons:          rounded-md
Inputs:           rounded-md border
```

---

**Visual Guide Complete! 📊**

Use this guide to understand the UI structure, layouts, and visual design patterns.

