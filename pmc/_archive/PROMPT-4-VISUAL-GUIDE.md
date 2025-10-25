# Visual Guide: Chunk Dashboard & Spreadsheet Interface

## 🎯 Overview

This guide shows you how to navigate and use the newly implemented Chunk Dashboard and Spreadsheet Interface.

---

## 📍 Navigation Path

```
Home → /chunks → Select Document → View Dashboard → Detail View
```

---

## 1️⃣ DOCUMENT LIST PAGE

**URL:** `http://localhost:3000/chunks`

### What You'll See:
```
┌─────────────────────────────────────────────────────┐
│ Chunk Dashboards                                    │
│ View chunk analysis and dimensions for documents    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 📄 Document Title          [Category]       │   │
│ │ 5 chunks | COMPLETED          [View Dashboard →]│
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 📄 Another Document        [Category]       │   │
│ │ 3 chunks | COMPLETED          [View Dashboard →]│
│ └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Features:
- **Document Cards**: Each document shows title, category, chunk count, and status
- **Status Badge**: Green for completed, gray for pending
- **View Dashboard Button**: Click to view detailed chunk analysis

---

## 2️⃣ CHUNK DASHBOARD PAGE

**URL:** `http://localhost:3000/chunks/[documentId]`

### Layout Structure:

#### A. Document Header
```
┌─────────────────────────────────────────────────────┐
│                  Document Title                     │
├─────────────────────────────────────────────────────┤
│ 📄 Document Title        [Category]                │
│ 5 chunks extracted                                  │
│                                    [COMPLETED]      │
│                              Analysis Progress: 80% │
│                              ██████████░░░░░        │
└─────────────────────────────────────────────────────┘
```

#### B. Individual Chunk Cards (Three-Section Layout)

```
┌─────────────────────────────────────────────────────┐
│ ✓ Chapter 1: Introduction    [Chapter Sequential]  │
│ ID: DOC123#C001                      [Analyzed]     │
├─────────────────────────────────────────────────────┤
│ ┌─ Chunk Metadata ─────────────────────────────┐   │
│ │ Chars: 1,234  Tokens: 350  Page: 1  Type: ... │  │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ ┌─ Things We Know (3) ──────────────────────────┐  │
│ │ ✓ [Audience] 90% confidence                    │ │
│ │   "Technical professionals with..."            │ │
│ │                                                 │ │
│ │ ✓ [Intent] 85% confidence                      │ │
│ │   "Introduce core concepts and..."             │ │
│ │                                                 │ │
│ │ ✓ [Key Terms] 80% confidence                   │ │
│ │   "API, REST, HTTP, JSON..."                   │ │
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ ┌─ Things We Need to Know (2) ──────────────────┐  │
│ │ ⚠ Tone Voice Tags: Low confidence (60%)        │ │
│ │ ⚠ Brand Persona Tags: Low confidence (50%)     │ │
│ │                         [Detail View →]        │ │
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

#### C. Analysis Summary
```
┌─────────────────────────────────────────────────────┐
│ Analysis Summary                                    │
├──────────┬──────────┬──────────┬────────────────────┤
│    5     │    4     │    28    │       $0.45        │
│  Total   │ Analyzed │   Dims   │    Total Cost      │
│  Chunks  │          │Generated │                    │
│  (Blue)  │ (Green)  │ (Orange) │     (Purple)       │
└──────────┴──────────┴──────────┴────────────────────┘
```

### Color Coding Guide:

| Section | Color | Meaning |
|---------|-------|---------|
| **Chunk Metadata** | Neutral (White/Gray) | Mechanical data (chars, tokens, pages) |
| **Things We Know** | Green | High confidence (>=8 on 1-10 scale = 80%+) |
| **Things We Need to Know** | Orange | Low confidence (<8 = <80%) or missing data |

### Chunk Type Colors:

| Type | Border/Background |
|------|------------------|
| **Chapter_Sequential** | Blue |
| **Instructional_Unit** | Purple |
| **CER** (Claim-Evidence-Reasoning) | Orange |
| **Example_Scenario** | Yellow |

---

## 3️⃣ SPREADSHEET DETAIL PAGE

**URL:** `http://localhost:3000/chunks/[documentId]/spreadsheet/[chunkId]`

### How to Access:
Click the **"Detail View"** button in the "Things We Need to Know" section of any chunk card.

### Layout:

#### A. Chunk Details Card
```
┌─────────────────────────────────────────────────────┐
│ [← Back to Chunks]                                  │
│                                                     │
│ 📄 Chapter 1: Introduction  [Chapter Sequential]   │
│ Document: My Document                               │
│ Chunk ID: DOC123#C001    3 dimension records       │
└─────────────────────────────────────────────────────┘
```

#### B. Chunk Preview
```
┌─────────────────────────────────────────────────────┐
│ Chunk Details                                       │
├─────────────────────────────────────────────────────┤
│ Characters: 1,234    Tokens: 350                    │
│ Page Range: 1-2      Section: Introduction          │
│                                                     │
│ Text Preview:                                       │
│ ┌─────────────────────────────────────────────┐   │
│ │ This chapter introduces the core concepts... │   │
│ │ (first 500 characters shown)                │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

#### C. Dimension Spreadsheet

**View Buttons:**
```
[All Dimensions] [Quality View] [Cost View] [Content View] [Risk View]
                                            [Filter...] [Export CSV]
```

**Spreadsheet Table:**
```
┌────────┬──────────────┬──────────┬──────────┬─────────┐
│ Run    │ Chunk        │ Key      │ Audience │ Intent  │
│        │ Summary      │ Terms    │          │         │
├────────┼──────────────┼──────────┼──────────┼─────────┤
│ Run-01 │ This intro...│ 5 items  │ Tech...  │ Teach...│
│ Run-02 │ Chapter 1... │ 6 items  │ Devs...  │ Guide...│
│ Run-03 │ Opening...   │ 4 items  │ Engs...  │ Intro...│
└────────┴──────────────┴──────────┴──────────┴─────────┘
```

### Preset Views:

| View | Columns Shown |
|------|--------------|
| **All Dimensions** | Every available dimension field |
| **Quality View** | Confidence scores, review status, factual confidence |
| **Cost View** | Generation cost, duration, summary |
| **Content View** | Summary, key terms, audience, intent, tone/voice tags |
| **Risk View** | IP sensitivity, PII flag, compliance, safety tags |

### Features:

1. **Sorting**: Click column headers to sort (↑↓)
2. **Filtering**: Type in search box to filter rows
3. **Export**: Download all data as CSV
4. **Multi-Run Comparison**: See how dimensions changed across runs

---

## 🎨 VISUAL INDICATORS

### Icons Guide

| Icon | Meaning |
|------|---------|
| ✓ (CheckCircle) | High confidence / Analyzed |
| ⚠ (AlertCircle) | Low confidence / Needs review |
| # (Hash) | Metadata section |
| 📄 (FileText) | Document/Chunk |
| → (ArrowRight) | List item bullet |
| ↗ (ExternalLink) | Navigate to detail view |
| ↑↓ (ArrowUpDown) | Sortable column |

### Badge Colors

| Color | Status |
|-------|--------|
| Green | Completed / Analyzed / High confidence |
| Orange | Pending / Low confidence |
| Gray | Not started / Neutral |
| Blue | Information / Total count |

---

## 💡 USAGE TIPS

### 1. Quick Analysis Workflow
```
1. Go to /chunks
2. Select document
3. Scan chunk cards for orange "Things We Need to Know" sections
4. Click "Detail View" on chunks with many low-confidence items
5. Review full spreadsheet to understand dimension quality
```

### 2. Quality Assessment
- **Green sections** = Trust the AI analysis
- **Orange sections** = Review and potentially re-generate
- **Confidence % display** = Multiply database score by 10 (8 = 80%)

### 3. Progressive Disclosure
- **Dashboard view** = Quick overview (3 items per section)
- **Spreadsheet view** = Deep dive (all dimensions, all runs)

### 4. Comparing Runs
- Spreadsheet shows all dimension records
- Each row = one generation run
- Compare values across runs to see consistency

### 5. Export & Analysis
- Use "Export CSV" for external analysis
- Open in Excel/Google Sheets
- Create pivot tables or charts

---

## 🔍 WHAT TO LOOK FOR

### High-Quality Chunks ✅
- Most dimensions in "Things We Know" (green)
- Few items in "Things We Need to Know" (orange)
- Confidence scores 80%+
- Consistent values across multiple runs

### Chunks Needing Review ⚠️
- Many items in "Things We Need to Know" (orange)
- Confidence scores below 70%
- Missing critical dimensions (audience, intent, etc.)
- Inconsistent values across runs

### Cost Optimization 💰
- Check "Total Cost" in analysis summary
- Use Cost View in spreadsheet to see per-chunk costs
- Identify expensive chunks for optimization

---

## 🎯 DESIGN PHILOSOPHY

### Three-Section Logic

1. **Chunk Metadata (Neutral)**
   - Mechanical, objective data
   - Always accurate (from extraction)
   - No AI confidence needed

2. **Things We Know (Green)**
   - High-confidence AI findings
   - Trustworthy for immediate use
   - Confidence >= 80%

3. **Things We Need to Know (Orange)**
   - Low-confidence or missing dimensions
   - Requires human review
   - Confidence < 80% or NULL

### Progressive Disclosure
- **Dashboard** = Bird's eye view (3 items max)
- **Spreadsheet** = Detailed analysis (all items, all runs)
- **Export** = External analysis (CSV format)

---

## 📊 METRICS EXPLAINED

### Analysis Summary Stats

1. **Total Chunks** (Blue)
   - Count of all extracted chunks
   - Shows extraction progress

2. **Analyzed** (Green)
   - Chunks with at least one dimension record
   - Percentage = (Analyzed / Total) × 100

3. **Dimensions Generated** (Orange)
   - Total number of populated dimension fields
   - Excludes NULL/empty values

4. **Total Cost** (Purple)
   - Sum of generation_cost_usd for all chunks
   - Helps track AI API spending

---

## 🚀 QUICK REFERENCE

### Keyboard Shortcuts (Spreadsheet)
- Type in filter box to search
- Click column headers to sort
- Scroll table for more data

### Color Meanings
- **Green** = Good, high confidence, success
- **Orange** = Caution, needs review, low confidence
- **Blue** = Information, neutral
- **Purple** = Cost, special metric

### Confidence Scale
```
Database Score → Display
10 → 100% ⭐⭐⭐⭐⭐
9  → 90%  ⭐⭐⭐⭐
8  → 80%  ⭐⭐⭐ (threshold for "Things We Know")
7  → 70%  ⭐⭐
6  → 60%  ⭐
5  → 50%  (median)
```

---

## ❓ TROUBLESHOOTING

### No documents showing?
- Check if documents are uploaded
- Verify database connection
- Visit `/test-chunks` to test connectivity

### No chunks for a document?
- Document may not have been processed yet
- Run chunk extraction via API
- Check document status badge

### No dimensions showing?
- Dimensions may not be generated yet
- Check if AI API key is configured
- Look for error messages in browser console

### Spreadsheet is empty?
- Click "Detail View" on a chunk with dimensions
- Verify chunk has analyzed badge
- Check network tab for API errors

---

## 🎓 EXAMPLE WORKFLOW

### Scenario: Reviewing a New Document

1. **Navigate to Chunks**
   ```
   http://localhost:3000/chunks
   ```

2. **Select Document**
   - Find your document in the list
   - Note the chunk count and status
   - Click "View Dashboard"

3. **Review Dashboard**
   - Check analysis progress (target: 100%)
   - Scan chunk cards for green vs. orange balance
   - Note overall confidence levels

4. **Identify Problem Chunks**
   - Look for chunks with many orange items
   - Check confidence percentages
   - Prioritize chunks with <70% confidence

5. **Deep Dive**
   - Click "Detail View" on problem chunks
   - Switch to Quality View
   - Check confidence scores across dimensions

6. **Take Action**
   - Export data for reporting
   - Flag chunks for re-generation
   - Document findings

7. **Monitor Progress**
   - Return to dashboard
   - Check if Analysis Summary improved
   - Verify cost is within budget

---

## 📝 BEST PRACTICES

1. **Regular Reviews**: Check dashboards after each dimension generation run
2. **Cost Monitoring**: Keep eye on Total Cost stat
3. **Quality Thresholds**: Set team standards (e.g., 85%+ confidence required)
4. **Documentation**: Export CSVs for audit trails
5. **Iterative Improvement**: Use insights to refine prompts and models

---

**Happy Analyzing! 🎉**

