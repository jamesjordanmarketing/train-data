# Quick Start: Conversations Dashboard

## 🚀 Access the Dashboard

Navigate to: **http://localhost:3000/conversations**

## 📋 Quick Actions

### View Conversations
- Navigate to `/conversations` to see all conversations
- Use quick filters: "All", "Needs Review", "Approved", "High Quality"

### Filter Conversations
1. Click "Filters" button
2. Select Status, Tier, or adjust Quality Score
3. Click "Apply Filters"
4. Use search box for text search

### Sort Conversations
- Click any column header (Title, Persona, Tier, Status, Quality, Turns, Created)
- Click again to reverse sort direction

### Preview Conversation
1. Click "..." menu on any row
2. Select "Preview"
3. View full conversation with turns
4. Approve or Reject from modal

### Approve/Reject Single Conversation
1. Click "..." menu on row
2. Select "Approve" or "Reject"
3. Status updates instantly

### Bulk Actions
1. Select multiple conversations using checkboxes
2. Use "Select All" to select entire page
3. Click bulk action buttons:
   - "Approve Selected"
   - "Reject Selected" (prompts for reason)
   - "Delete Selected" (requires confirmation)

### Export Conversations
- Click "Export" button to download all filtered conversations as JSON
- Or use "..." menu → "Export" for single conversation

### Change Page Size
- Use "Rows per page" dropdown (10, 25, 50, 100)

### Navigate Pages
- Use pagination controls at bottom
- First/Previous/Next/Last buttons
- Direct page number buttons

## 🔗 URL Parameters

You can share filtered views using URLs:

```bash
# View approved conversations
/conversations?status=approved

# View templates on page 2
/conversations?tier=template&page=2

# View high quality conversations
/conversations?qualityMin=8&qualityMax=10

# Search for specific content
/conversations?search=retirement

# Combine multiple filters
/conversations?status=pending_review&tier=scenario&qualityMin=7&page=1&limit=50
```

## 🎯 Common Workflows

### Review Workflow
1. Click "Needs Review" quick filter
2. Sort by Quality (highest first)
3. Preview each conversation
4. Approve or Reject directly from modal
5. Repeat until all reviewed

### Quality Control Workflow
1. Click "High Quality" quick filter
2. Select all conversations
3. Click "Approve Selected"
4. Filter by low quality (Quality slider 0-6)
5. Review individually

### Search Workflow
1. Type search term in search box
2. Results filter automatically after 500ms
3. Review matching conversations

### Batch Management
1. Apply filters to narrow down conversations
2. Select desired conversations
3. Apply bulk action
4. Verify action completed with toast notification

## 🛠️ Troubleshooting

### Dashboard not loading?
- Check if backend server is running
- Verify database connection
- Check browser console for errors

### Filters not working?
- Clear all filters and try again
- Check URL parameters are valid
- Refresh the page

### Actions failing?
- Check network tab for API errors
- Verify authentication is valid
- Ensure conversation IDs are correct

## 📊 Dashboard Components

### Stats Cards (Top)
- **Total Conversations**: All conversations with tier breakdown
- **Approved**: Approved count and approval rate
- **Pending Review**: Conversations awaiting review
- **Avg Quality Score**: Average quality with high-quality count

### Quick Filters (Below Stats)
- Pre-configured filter buttons with counts
- Click to instantly apply filter

### Advanced Filters (Filters Button)
- Status dropdown
- Tier dropdown
- Quality score slider
- Apply or Cancel

### Conversation Table
- Sortable columns
- Row selection checkboxes
- Action menu (...)
- Color-coded badges

### Pagination (Bottom)
- Page navigation
- Rows per page selector
- Result count display

## 🎨 Status Colors

- **Draft**: Gray outline
- **Generated**: Blue
- **Pending Review**: Yellow
- **Approved**: Green
- **Rejected**: Red
- **Needs Revision**: Orange

## 💡 Tips

1. **Use URL sharing**: Copy URL to share exact filtered view with team
2. **Bulk operations**: Select all → Apply action → Efficient workflow
3. **Sort by quality**: Find best/worst conversations quickly
4. **Preview before approve**: Always preview to verify quality
5. **Use search**: Quickly find conversations by keyword
6. **Refresh regularly**: Click refresh button to see latest data

## 🔐 Permissions

Current implementation uses placeholder user authentication. In production:
- Users need authentication to access dashboard
- Different roles may have different permissions
- Audit trail tracks who approved/rejected conversations

## 📞 Support

For issues or questions:
1. Check implementation summary: `IMPLEMENTATION-SUMMARY-PROMPT-3.md`
2. Review component documentation: `src/components/conversations/README.md`
3. Check API documentation: `src/lib/README-SERVICES.md`

---

**Happy Managing! 🎉**

