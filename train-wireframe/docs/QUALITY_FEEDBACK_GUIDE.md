# Quality Feedback Dashboard - User Guide

## Overview

The Quality Feedback Dashboard helps you track template performance, identify low-performing templates, and get actionable recommendations for improvement.

---

## 🎯 Quick Start

### Accessing the Dashboard

**Method 1: From Main Navigation**
1. Click "Quality Feedback" in the header navigation
2. View full analytics dashboard

**Method 2: From Dashboard Widget**
1. View the Quality Feedback widget on the main dashboard
2. Click "View Full Dashboard" button

---

## 📊 Dashboard Features

### 1. Time Window Selector

Control the data range you're viewing:

- **Last 7 Days** - Recent short-term performance
- **Last 30 Days** - Monthly trends (default)
- **All Time** - Historical overview

💡 **Tip:** Use 7 days to identify recent issues, 30 days for monthly reporting.

---

### 2. Summary Statistics Cards

Four key metrics at a glance:

#### Total Reviews
- Number of conversations reviewed in the time period
- Shows platform activity level

#### Approval Rate
- Overall percentage of approved conversations
- Trend indicator (↗️ Improving, → Stable, ↘️ Declining)
- **Target:** ≥ 85%

#### Avg Quality Score
- Mean quality rating across all templates
- Scale: 0-10
- **Target:** ≥ 8.0

#### Templates Flagged
- Count of templates needing attention
- **Red alert:** Approval rate < 70%
- **Goal:** 0 flagged templates

---

### 3. Low-Performing Templates Alert

**What it shows:**
- Templates with approval rate < 70%
- Highlighted in red banner
- Quick-view badges with percentages

**What to do:**
1. Click on a template name to view details
2. Review the recommendations section below
3. Edit the template to address issues

---

### 4. Actionable Recommendations

Priority-based improvement suggestions:

#### 🔴 High Priority
- Approval rate significantly below target
- Immediate action required
- Detailed evidence provided

#### 🟡 Medium Priority
- Borderline performance
- Should be addressed soon
- Monitor for trends

#### 🟢 Low Priority
- Minor improvements
- Optional enhancements

**Each recommendation includes:**
- Template name
- Specific issue identified
- Suggested improvement
- Evidence supporting the recommendation

---

### 5. Template Performance Table

Detailed metrics for all templates:

#### Columns Explained

| Column | Description | Good Range |
|--------|-------------|------------|
| **Template** | Template name and tier | - |
| **Tier** | template/scenario/edge_case | - |
| **Usage** | Number of times used | Higher = more data |
| **Avg Quality** | Mean quality score | ≥ 8.5 |
| **Approval Rate** | % of conversations approved | ≥ 85% |
| **Performance** | Overall assessment | High |
| **Trend** | Quality direction | Improving/Stable |
| **Issues** | Feedback categories flagged | None |

#### Sorting

Click any column header to sort:
- **First click:** Ascending order
- **Second click:** Descending order
- **Active column:** Shows ↑ or ↓ arrow

---

## 🎨 Visual Indicators

### Color Coding

#### Quality Scores
- 🟢 **Green (8.5-10):** Excellent quality
- 🟡 **Yellow (7.0-8.4):** Good, room for improvement
- 🔴 **Red (<7.0):** Needs immediate attention

#### Performance Levels
- 🎯 **High:** Approval rate ≥ 85%
- ⚠️ **Medium:** Approval rate 70-84%
- 🔴 **Low:** Approval rate < 70%

#### Trends
- 📈 **Improving:** Quality increasing
- ➡️ **Stable:** Consistent performance
- 📉 **Declining:** Quality decreasing

---

## 📥 Exporting Data

### CSV Export

1. Click "Export CSV" button (top right)
2. File downloads automatically
3. Filename includes time window and date

**CSV Contents:**
- Template name, tier, usage count
- Average quality, approval rate
- Performance level, trend
- Useful for external reporting

---

## 🔄 Refreshing Data

### Manual Refresh
- Click "Refresh" button (top right)
- Shows loading animation
- Updates timestamp

### Auto-Refresh (Widget Only)
- Dashboard widget refreshes every 5 minutes
- Ensures current data without page reload

---

## 🚨 Common Scenarios

### Scenario 1: Template Below 70% Approval

**Steps to resolve:**
1. Identify template in red alert banner
2. Review recommendations section
3. Check "Issues" column for feedback categories
4. Edit template to address specific issues
5. Monitor next review cycle

### Scenario 2: Declining Trend

**Steps to investigate:**
1. Sort by "Trend" column
2. Find templates with 📉 declining indicator
3. Review recent conversations using this template
4. Compare with similar templates
5. Test template modifications

### Scenario 3: Low Usage High Quality

**Opportunity:**
- Template performs well but rarely used
- Consider promoting this template
- May work well for similar scenarios

### Scenario 4: High Usage Low Quality

**Priority action required:**
- Template is frequently used but problematic
- High impact on training data quality
- Review as high priority

---

## 💡 Best Practices

### Regular Review Schedule

**Daily:**
- Check dashboard widget on main page
- Note flagged template count

**Weekly:**
- Review full feedback dashboard
- Address high-priority recommendations
- Export data for team meetings

**Monthly:**
- Analyze trends over 30-day window
- Update templates based on patterns
- Document improvements

### Interpreting Feedback Categories

#### Content Accuracy Issues
- Factual errors in responses
- Outdated information
- Incorrect technical details
- **Fix:** Update template content, add fact-checking notes

#### Emotional Intelligence Issues
- Lacks empathy
- Inappropriate tone
- Doesn't acknowledge emotions
- **Fix:** Add empathetic language, soften responses

#### Turn Quality Issues
- Awkward conversation flow
- Abrupt transitions
- Doesn't follow naturally
- **Fix:** Restructure dialogue, add context

#### Format Issues
- Poor formatting
- Hard to read
- Inconsistent structure
- **Fix:** Apply style guide, add formatting rules

---

## 🎓 Tips & Tricks

### Tip 1: Compare Time Windows
Switch between 7d and 30d to identify:
- Recent changes in performance
- Short-term vs long-term trends
- Impact of recent template edits

### Tip 2: Focus on High-Usage Templates
Templates with higher usage have more impact:
- Sort by "Usage" column (descending)
- Prioritize improvements on top templates

### Tip 3: Use Evidence to Guide Edits
Recommendations include specific evidence:
- Number of rejections
- User feedback instances
- Common issues
- Use this to focus improvements

### Tip 4: Track Your Improvements
After editing a template:
1. Note the current approval rate
2. Wait for new reviews (7-14 days)
3. Compare new vs old performance
4. Document what worked

### Tip 5: Look for Patterns
Multiple templates with same issue:
- May indicate systemic problem
- Could be reviewer bias
- Might need training or guidelines update

---

## ❓ FAQ

### Q: How often is data updated?
**A:** Data reflects the latest reviews. Widget auto-refreshes every 5 minutes. Main dashboard refreshes on page load and manual refresh.

### Q: What if a template shows 0 usage?
**A:** Template exists but hasn't been used yet. No performance data available. Consider testing or archiving.

### Q: Why is approval rate different from quality score?
**A:** Quality score is algorithmic (0-10). Approval rate is human review (approved/total). Both matter but measure different things.

### Q: Can I drill down into specific conversations?
**A:** Currently no, but this is planned. For now, note the template ID and search in the main conversation table.

### Q: What causes "declining" trend?
**A:** Based on quality score changes. If avg quality < 7.5, trend shows declining. May need template review.

### Q: How many issues should trigger concern?
**A:** If any single feedback category exceeds 10 instances, it should be reviewed. Priority increases with count.

---

## 🔮 Coming Soon

Features planned for future releases:

- **Drill-down views:** Click template to see individual conversations
- **Historical charts:** Visual trend graphs
- **Comparison mode:** Compare multiple templates side-by-side
- **Automated alerts:** Email notifications for critical issues
- **Bulk actions:** Update multiple templates at once
- **Custom thresholds:** Set your own performance targets

---

## 📞 Need Help?

If you encounter issues or have questions:

1. Check this guide first
2. Review the implementation summary
3. Check component source code comments
4. Contact your platform administrator

---

## 🎉 Success Metrics

You're successfully using the feedback dashboard when:

- ✅ All templates above 70% approval rate
- ✅ No high-priority recommendations
- ✅ Upward or stable trends across templates
- ✅ Quality scores consistently ≥ 8.0
- ✅ Regular review schedule established
- ✅ Documented improvement patterns

---

**Remember:** The goal isn't perfection, it's continuous improvement. Use this dashboard to identify opportunities and track progress over time.

