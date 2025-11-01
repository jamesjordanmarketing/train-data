# Quick Start: Template Testing & Analytics

Quick reference guide for using the template testing and analytics features.

---

## Template Testing

### How to Test a Template

1. **Navigate to Templates View**
   - Go to the main Templates page
   - You'll see a list of all your templates

2. **Select a Template to Test**
   - Click the "..." menu button on any template row
   - Select "Test Template"

3. **Fill in Test Parameters**
   - Enter values for each template variable
   - **OR** click "🎲 Auto-Generate" for sample data

4. **Review Resolved Template** (Optional)
   - Check the "Show Resolved Template Preview" checkbox
   - Verify placeholders are filled correctly

5. **Execute Test**
   - Click "▶ Execute Test"
   - Wait for results (typically 2-5 seconds)

6. **Review Results**
   - **Overall Score**: Pass/fail status and quality percentage
   - **Quality Breakdown**: Detailed metrics for each dimension
   - **Baseline Comparison**: How this compares to past results
   - **API Response**: Full Claude API response

### Understanding Test Results

**Quality Metrics** (0-100%):
- **Relevance**: How well the response addresses the prompt
- **Accuracy**: Correctness of information
- **Naturalness**: How human-like the language is
- **Methodology**: Quality of explanations and examples
- **Coherence**: Logical flow and structure
- **Uniqueness**: Originality of the response

**Confidence Levels**:
- 🟢 **HIGH**: Score ≥ 85%
- 🟡 **MEDIUM**: Score 70-84%
- 🔴 **LOW**: Score < 70%

**Training Value**:
- 🟢 **HIGH**: Detailed with examples
- 🟡 **MEDIUM**: Structured but basic
- 🔴 **LOW**: Short or incomplete

**Baseline Comparison**:
- **Positive deviation**: Current test performed better than average
- **Negative deviation**: Current test performed worse than average

### Test Result Actions

✅ **If test passes** (score ≥ threshold):
- Template is ready for use
- Consider activating if currently inactive

⚠️ **If test fails** (score < threshold):
- Review the quality breakdown to identify issues
- Adjust template structure or parameters
- Retest until quality improves

---

## Template Analytics

### How to View Analytics

1. **Open Analytics Dashboard**
   - Click the "Analytics" button in the top-right corner
   - Dashboard opens in full-screen overlay

2. **View Summary Statistics**
   - **Total Templates**: Count of all templates
   - **Total Usage**: Number of conversations generated
   - **Avg Quality Score**: Overall quality across templates
   - **Best Performer**: Highest-scoring template

3. **Explore Visualizations**
   - **Usage by Tier**: Pie chart showing usage distribution
   - **Quality by Tier**: Bar chart comparing quality across tiers

4. **Review Top Performers**
   - See the top 5 highest-quality templates
   - Rankings include usage count and trend

### Using Analytics Filters

**Search**:
- Type in the search box to filter by template name

**Tier Filter**:
- Select "All Tiers", "Templates", "Scenarios", or "Edge Cases"

**Sort Options**:
- Usage Count
- Quality Score
- Approval Rate

**Sort Order**:
- Click "↑ Ascending" or "↓ Descending" to toggle

### Understanding Analytics

**Trend Indicators**:
- 📈 **Improving**: Quality increasing over time (>5% improvement)
- ➡️ **Stable**: Quality consistent (±5% range)
- 📉 **Declining**: Quality decreasing over time (>5% decline)

**Approval Rate**:
- Percentage of generated conversations that were approved
- Higher is better (indicates consistent quality)

**Success Rate**:
- Similar to approval rate
- Includes both approved and successfully generated conversations

**Top Parameters**:
- Most frequently used parameters for each template
- Helps identify popular use cases

### Exporting Data

1. **Export to CSV**
   - Click the "Export CSV" button
   - File downloads automatically
   - Includes all filtered/sorted data

2. **CSV Contents**:
   - Template Name
   - Tier
   - Usage Count
   - Avg Quality Score
   - Approval Rate
   - Success Rate
   - Trend
   - Last Used

---

## Best Practices

### Testing Best Practices

1. **Test Before Activation**
   - Always test new templates before setting them active
   - Ensures quality meets threshold

2. **Use Realistic Parameters**
   - Test with actual use-case parameters
   - Don't just use sample/default values

3. **Compare with Baseline**
   - Enable baseline comparison for templates with history
   - Helps identify regression or improvement

4. **Iterate on Failures**
   - If test fails, review quality breakdown
   - Focus on lowest-scoring dimensions
   - Adjust and retest

5. **Test Edge Cases**
   - Test with boundary values
   - Test with empty/minimal parameters (if allowed)
   - Test with complex/long parameters

### Analytics Best Practices

1. **Review Regularly**
   - Check analytics weekly to identify trends
   - Look for declining templates that need attention

2. **Optimize Low Performers**
   - Focus on templates with low quality scores
   - Review and improve structure
   - Consider retiring consistently poor performers

3. **Learn from Top Performers**
   - Analyze what makes top templates successful
   - Apply those patterns to other templates

4. **Track Over Time**
   - Export CSV periodically to track progress
   - Compare month-over-month improvements

5. **Balance Quality and Usage**
   - High-usage, low-quality templates need immediate attention
   - Low-usage, high-quality templates might need better promotion

---

## Troubleshooting

### Testing Issues

**Problem**: "Claude API error" message
- **Solution**: Verify `ANTHROPIC_API_KEY` is configured
- **Workaround**: System will use mock responses for testing

**Problem**: "Failed to resolve template" error
- **Solution**: Check that all required parameters are provided
- **Solution**: Verify template syntax (placeholders use `{{variable}}`)

**Problem**: Test taking too long
- **Solution**: Claude API typically responds in 2-5 seconds
- **Solution**: Check network connection
- **Solution**: Verify API key has sufficient quota

**Problem**: Quality score seems wrong
- **Solution**: Quality metrics use heuristics; review breakdown
- **Solution**: Ensure template generates substantial responses
- **Solution**: Check if response addresses the prompt properly

### Analytics Issues

**Problem**: No data showing in analytics
- **Solution**: Ensure templates have been used (generated conversations)
- **Solution**: Verify conversations are linked to templates via `parent_id`

**Problem**: Charts not rendering
- **Solution**: Refresh the page
- **Solution**: Check browser console for errors
- **Solution**: Verify `recharts` library is installed

**Problem**: CSV export is empty
- **Solution**: Ensure filters haven't excluded all templates
- **Solution**: Check that analytics data loaded successfully

**Problem**: Analytics loading slowly
- **Solution**: Expected for large datasets (1000+ templates)
- **Solution**: Use tier filter to narrow results
- **Solution**: Consider adding database indices

---

## Keyboard Shortcuts

Currently, the system doesn't have dedicated keyboard shortcuts, but standard browser shortcuts work:

- **Ctrl/Cmd + F**: Search in table (when focused)
- **Escape**: Close modal
- **Tab**: Navigate between form fields
- **Enter**: Submit form (in test modal)

---

## Tips & Tricks

### Testing Tips

1. **Auto-Generate Smart Defaults**
   - The auto-generate feature uses contextual logic
   - Fields named "name" get realistic names
   - Fields named "email" get email addresses
   - Fields named "product" get product names

2. **Preview Before Testing**
   - Always check the resolved template preview
   - Ensures parameters are injecting correctly
   - Catches placeholder typos before wasting API calls

3. **Test Multiple Scenarios**
   - Test with different parameter combinations
   - Helps identify which parameters affect quality
   - Builds confidence in template robustness

### Analytics Tips

1. **Use Search + Filter**
   - Combine search with tier filter for precision
   - Example: Search "customer" + filter "scenario"

2. **Sort by Different Metrics**
   - Sort by usage to find most popular
   - Sort by quality to find best/worst
   - Sort by approval rate to find reliability

3. **Watch Trends**
   - Focus on templates showing 📉 declining trends
   - These need urgent attention
   - Catch quality issues before they impact production

4. **Export for Reporting**
   - Use CSV export for stakeholder reports
   - Import into Excel/Google Sheets for further analysis
   - Track improvements over time

---

## API Integration

For programmatic access:

### Test a Template via API

```bash
curl -X POST http://localhost:3000/api/templates/test \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "your-template-id",
    "parameters": {
      "variable1": "value1",
      "variable2": "value2"
    },
    "compareToBaseline": true
  }'
```

### Get Analytics via API

```bash
# All templates
curl http://localhost:3000/api/templates/analytics

# Filter by tier
curl http://localhost:3000/api/templates/analytics?tier=template

# Specific template
curl http://localhost:3000/api/templates/analytics?templateId=your-template-id
```

---

## Next Steps

After testing and reviewing analytics:

1. **Activate High-Quality Templates**
   - Templates that consistently pass tests
   - Set `isActive: true`

2. **Retire Poor Performers**
   - Templates with consistently low scores
   - Archive or delete if not improving

3. **Iterate on Medium Performers**
   - Test and improve templates scoring 70-85%
   - Small changes can have big impact

4. **Scale Winners**
   - Use top-performing templates as blueprints
   - Create variations for different use cases

5. **Monitor Continuously**
   - Set a schedule to review analytics
   - Weekly or monthly depending on usage volume

---

## Need Help?

- **Documentation**: See `IMPLEMENTATION-COMPLETE-PROMPT-5.md` for technical details
- **Support**: Create an issue in the repository
- **Feedback**: Suggestions for improvements are welcome

---

**Last Updated**: 2024-10-30  
**Version**: 1.0

