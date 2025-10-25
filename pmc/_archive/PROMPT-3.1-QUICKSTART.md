# PROMPT 3.1 QUICKSTART
## Dimension Validation Spreadsheet UI - Quick Reference

---

## 📦 What Was Built

A comprehensive spreadsheet UI for validating and reviewing all 60 chunk dimensions with filtering, sorting, and export capabilities.

| Component | Purpose | Lines |
|-----------|---------|-------|
| `DimensionValidationSheet.tsx` | Main spreadsheet component | 345 |
| `dimensions/[chunkId]/page.tsx` | Validation page with stats | 160 |
| `page.tsx` (updated) | Added navigation button | +10 |

---

## 🎯 Quick Start

### 1. Navigate to Dimension Validation

```
From Chunk Dashboard:
└─► Click "View All Dimensions" button on any chunk card
    └─► Opens: /chunks/[documentId]/dimensions/[chunkId]
```

### 2. View and Filter Dimensions

```typescript
// The page displays:
- Statistics card (4 metrics + type distribution)
- Run selector (switch between runs)
- Dimension spreadsheet (60 rows × 8 columns)
```

### 3. Use the Spreadsheet

```
Filter:
├─ Text Search: Type to search dimensions, values, descriptions
├─ Type Filter: All | AI Generated | Mechanically Generated | Prior Generated
└─ Confidence Filter: All | High (≥8.0) | Low (<8.0)

Sort:
├─ Click any sortable column header
└─ Click again to reverse direction

Customize:
├─ Column Size: Small | Medium | Large
└─ Export: Download filtered data as CSV

Summary:
└─ Shows: X of Y dimensions, X populated, X high confidence
```

---

## 📊 Spreadsheet Structure

### 8 Columns (Left to Right)

```
1. Chunk Dimension   → Field name (sortable)
2. Generated Value   → Actual dimension value
3. Type             → Generation type badge (sortable, filterable)
4. Precision        → Confidence score (sortable, color-coded)
5. Accuracy         → Confidence score (sortable, color-coded)
6. Description      → Field description from metadata
7. Data Type        → string, enum, list, etc.
8. Allowed Format   → Validation rules
```

### 60 Rows (Dimensions)

```
Display Order 1-60:
├─ 1-8:    Prior Generated (document metadata)
├─ 9-17:   Mechanically Generated (chunk metadata)
├─ 18-25:  AI Generated - Content
├─ 26-31:  AI Generated - Task
├─ 32-36:  AI Generated - CER
├─ 37-41:  AI Generated - Scenario
├─ 42-44:  AI Generated - Training
├─ 45-50:  AI Generated - Risk
└─ 51-60:  Mechanically Generated (training metadata)
```

---

## 🎨 Visual System

### Color Coding

**Confidence Scores:**
```
🟢 Green   (≥8.0)   → High confidence, ready to use
🟡 Yellow  (6.0-7.9) → Medium confidence, may need review
🟠 Orange  (<6.0)   → Low confidence, needs attention
```

**Generation Types:**
```
🟣 Purple → AI Generated (requires AI model processing)
🔵 Blue   → Mechanically Generated (automatic, deterministic)
⚫ Gray   → Prior Generated (pre-existing metadata)
```

**Statistics Cards:**
```
🔵 Blue   → Population metrics (Populated %)
🟢 Green  → Precision metrics (Avg Precision)
🟣 Purple → Accuracy metrics (Avg Accuracy)
🟠 Orange → Review warnings (Need Review)
```

---

## 🔍 Filtering Examples

### Example 1: Find low confidence AI dimensions
```
1. Type Filter: Select "AI Generated"
2. Confidence Filter: Select "Low (<8.0)"
Result: Shows only AI dimensions with confidence <8.0
```

### Example 2: Search for specific field
```
1. Text Search: Type "summary"
Result: Shows chunk_summary_1s and any other matching dimensions
```

### Example 3: View only populated mechanically generated fields
```
1. Type Filter: Select "Mechanically Generated"
2. Text Search: Look at populated values (non-empty)
Result: See all mechanical fields with values
```

---

## 📤 CSV Export

### Export Process
```
1. Apply filters (optional)
2. Click "Export CSV" button
3. Wait for generation (shows loading state)
4. CSV file downloads automatically

Filename format: {chunkName}_dimensions_{timestamp}.csv
```

### CSV Format
```csv
"Chunk Dimension","Document Name (last run)","Generated Value","What Generated TYPE",...

"chunk_summary_1s","My Doc - Chunk 1 - 10/7/2025","Explains process","AI Generated",...
"doc_title","My Doc - Chunk 1 - 10/7/2025","My Document","Prior Generated",...
```

**Features:**
- All filtered rows included
- Proper CSV escaping
- Readable timestamp format
- Document name includes chunk and run info

---

## 📊 Statistics Card Metrics

### Metric 1: Populated Percentage
```
Formula: (Populated dimensions / Total dimensions) × 100
Example: "85%" means 51 of 60 dimensions have values
Icon: Percent (blue)
```

### Metric 2: Average Precision
```
Formula: Average of AI Generated dimension precision scores
Example: "8.2" on scale of 0-10
Icon: TrendingUp (green)
Note: Excludes Prior/Mechanical (always 10.0)
```

### Metric 3: Average Accuracy
```
Formula: Average of AI Generated dimension accuracy scores
Example: "8.8" on scale of 0-10
Icon: TrendingUp (purple)
Note: Excludes Prior/Mechanical (always 10.0)
```

### Metric 4: Needs Review Count
```
Formula: Count of dimensions with accuracy < 8.0
Example: "5 Need Review"
Badge: Orange
Indicates: Low confidence dimensions requiring attention
```

---

## 🔄 Run Selector

### Purpose
View dimension data from different AI generation runs

### Usage
```
1. Open run selector dropdown (in statistics card header)
2. View available runs (sorted newest first)
3. Select a run
4. Page reloads data for that run
5. Statistics and spreadsheet update

Run Display Format: "{Date/Time} - {AI Model}"
Example: "10/7/2025, 2:30:00 PM - gpt-4-turbo"
```

---

## 🎯 Common Tasks

### Task 1: Find dimensions needing review
```
Steps:
1. Look at orange "Need Review" metric in statistics
2. Filter by "Low (<8.0)" confidence
3. Review each low-confidence dimension
4. Note which ones need regeneration
```

### Task 2: Export AI-generated dimensions only
```
Steps:
1. Filter by Type: "AI Generated"
2. Click "Export CSV"
3. CSV contains only AI dimensions (35 total)
```

### Task 3: Compare runs
```
Steps:
1. Note statistics for current run
2. Select different run from dropdown
3. Compare metrics (populated %, precision, accuracy)
4. Identify improvements or regressions
```

### Task 4: Search for specific information
```
Steps:
1. Type keyword in search box (e.g., "task", "claim")
2. Review matching dimensions
3. Check their values and confidence
```

### Task 5: Adjust view for readability
```
Steps:
1. Select column size: Small/Medium/Large
2. Scroll table horizontally if needed
3. Hover over truncated text for full value
```

---

## 🔧 Component Props

### DimensionValidationSheet
```typescript
interface DimensionValidationSheetProps {
  dimensionRows: DimensionRow[];     // Array of 60 enriched dimension rows
  documentName: string;               // For display and CSV export
  chunkName: string;                  // For display and CSV export
  runTimestamp: string;               // For display and CSV export
}

// Used like:
<DimensionValidationSheet
  dimensionRows={data.dimensionRows}
  documentName={data.document.title}
  chunkName={data.chunk.chunk_handle || `Chunk ${data.chunk.chunk_id}`}
  runTimestamp={new Date(data.run.started_at).toLocaleString()}
/>
```

---

## 📱 Responsive Behavior

### Desktop (≥768px)
```
✓ Full table visible
✓ All 8 columns displayed
✓ Side-by-side statistics
✓ Comfortable spacing
✓ No horizontal scroll needed
```

### Tablet (480px-767px)
```
✓ Table scrolls horizontally
✓ Statistics cards stack 2×2
✓ Controls wrap to multiple rows
✓ Touch-friendly buttons
```

### Mobile (<480px)
```
✓ Full horizontal scroll for table
✓ Statistics cards stack vertically
✓ Controls stack vertically
✓ Large touch targets
✓ Compact spacing
```

---

## ⚡ Performance

### Optimization Techniques
```
useMemo:
├─ Filtered and sorted data
├─ Calculated only when filters/sort change
└─ Prevents unnecessary re-renders

Memoized Functions:
├─ formatValue (display formatting)
└─ formatValueForCSV (export formatting)

Efficient Rendering:
├─ Browser handles table scrolling
└─ Only visible rows painted
```

### Expected Performance
```
60 dimensions:      Instant
600 dimensions:     <100ms
6000 dimensions:    <500ms (may need virtualization)
```

---

## 🐛 Troubleshooting

### Issue: No dimensions showing
```
Possible Causes:
1. No runs found for this chunk
2. Data fetch failed
3. Network error

Solutions:
- Check browser console for errors
- Verify chunk has dimension data
- Try refreshing the page
- Check network connectivity
```

### Issue: Filters not working
```
Possible Causes:
1. No dimensions match filter criteria
2. Multiple filters too restrictive

Solutions:
- Clear all filters and try again
- Use less restrictive filters
- Check summary footer for filtered count
```

### Issue: CSV export fails
```
Possible Causes:
1. Browser blocked download
2. Memory issue with large dataset
3. CSV generation error

Solutions:
- Check browser download settings
- Allow downloads from site
- Try with fewer dimensions (use filters)
- Check browser console for errors
```

### Issue: Run selector empty
```
Possible Causes:
1. No dimension data generated yet
2. Chunk not in any completed runs

Solutions:
- Generate dimensions first from chunk dashboard
- Verify chunk is included in run
- Check run status (should be "completed")
```

---

## 🎓 Best Practices

### 1. Regular Review Workflow
```
Weekly Review:
├─ Open each chunk's dimension validation
├─ Check "Need Review" count
├─ Filter to low confidence dimensions
├─ Export CSV for offline review
└─ Plan regeneration for low-quality dimensions
```

### 2. Quality Assurance
```
QA Process:
├─ Verify populated percentage >80%
├─ Ensure avg confidence >8.0
├─ Review dimensions with <6.0 confidence
├─ Validate format compliance
└─ Export audit trail (CSV)
```

### 3. Export Best Practices
```
When to Export:
├─ Before making changes (backup)
├─ After quality review (documentation)
├─ For offline analysis
└─ For sharing with team

What to Include:
├─ Apply relevant filters first
├─ Include timestamp in filename
├─ Document filter criteria used
└─ Store with chunk metadata
```

---

## 📚 Related Documentation

- **Data Layer:** `PROMPT-2.1-COMPLETION-SUMMARY.md` - Backend services
- **Visual Guide:** `PROMPT-3.1-VISUAL-GUIDE.md` - Architecture diagrams
- **Full Spec:** `PROMPT-3.1-COMPLETION-SUMMARY.md` - Complete implementation details

---

## 🎯 Key Shortcuts

```
Navigation:
├─ Back Button: Return to chunk dashboard
└─ Browser Back: Also returns to dashboard

Filtering:
├─ Text Search: Real-time as you type
├─ Type Dropdown: Instant filter
└─ Confidence Dropdown: Instant filter

Sorting:
├─ Click Header: Sort ascending
├─ Click Again: Sort descending
└─ Default: Display order (1-60)

Export:
└─ Export CSV Button: Download filtered data
```

---

## ✅ Quick Validation

Check these to ensure everything works:

- [ ] Navigate to dimension validation page
- [ ] See all 60 dimensions in table
- [ ] Statistics show correct values
- [ ] Run selector has options
- [ ] Text search filters results
- [ ] Type filter works
- [ ] Confidence filter works
- [ ] Sorting works on all sortable columns
- [ ] Column size preset changes widths
- [ ] CSV export downloads file
- [ ] Back button returns to dashboard

---

**Ready to Use! 🚀**

The dimension validation spreadsheet provides a comprehensive view of all chunk dimensions with powerful filtering, sorting, and export capabilities.

