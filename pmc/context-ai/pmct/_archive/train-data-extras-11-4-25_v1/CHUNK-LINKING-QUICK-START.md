# Chunk Linking Quick Start Guide

**Version:** 1.0  
**Last Updated:** November 3, 2025

---

## Overview

This guide explains how to use the new chunk linking features in the Training Data Generation Platform. These features allow you to associate conversations with their source chunks from the chunks-alpha module, enabling better traceability and dimension-aware generation.

---

## Features at a Glance

1. **Link Conversations to Chunks** - Associate any conversation with a source chunk
2. **View Chunk Information** - See chunk context and semantic dimensions in conversation details
3. **Filter Orphaned Conversations** - Quickly find conversations without chunk associations
4. **Unlink Chunks** - Remove chunk associations when needed

---

## How to Link a Conversation to a Chunk

### From the Conversation Table

1. Navigate to the **Conversations** page
2. Find the conversation you want to link
3. Click the **3-dot menu** (⋮) in the Actions column
4. Select **"Link to Chunk"** from the dropdown menu
5. A modal will open with the **Chunk Selector**
6. Use the search bar to find your chunk by content
7. Or use filters to narrow down by document or quality
8. Click on a chunk card to select it
9. The conversation will be linked automatically
10. You'll see a success toast notification

**Visual Indicator:**
- Once linked, the menu option changes to **"Unlink from Chunk"**

---

## How to View Chunk Information

### In Conversation Detail View

1. Click on any conversation to open the detail view
2. Look for the **"Source Chunk"** card in the right panel
3. If a chunk is linked, you'll see:

   **Chunk ID**
   - The unique identifier of the source chunk

   **Context Preview**
   - First 200 characters of chunk content
   - Gives you a quick preview without leaving the page

   **Dimension Confidence**
   - Shows how confident the semantic analysis was (0-100%)

   **Semantic Dimensions** (if available)
   - **Personas:** List of applicable user personas
   - **Emotions:** List of emotional states
   - **Complexity:** Numerical complexity score (0-10)

4. **Action Buttons:**
   - **View Full Chunk:** Opens the complete chunk in a new tab
   - **Unlink:** Removes the chunk association

---

## How to Find Orphaned Conversations

### Using the Quick Filter

1. Go to the **Conversations** page
2. Look at the **Quick Filters** section below the search bar
3. Click the **"Orphaned"** button with the 🔗 icon
4. The system will fetch and display orphaned conversations
5. A badge shows the count of orphaned conversations (e.g., "Orphaned (12)")

**What are Orphaned Conversations?**
- Conversations that have no chunk association
- Excludes draft and archived conversations
- Useful for identifying conversations that need source attribution

---

## How to Unlink a Conversation from a Chunk

### Method 1: From the Dropdown Menu

1. Find the linked conversation in the table
2. Click the **3-dot menu** (⋮)
3. Select **"Unlink from Chunk"**
4. The association will be removed immediately
5. You'll see a success toast notification

### Method 2: From the Detail View

1. Open the conversation detail view
2. Scroll to the **"Source Chunk"** card
3. Click the **"Unlink"** button at the bottom
4. The button will be disabled briefly while unlinking
5. Success toast appears when complete

---

## API Endpoints

For developers building integrations or custom tools:

### Link a Chunk to a Conversation
```bash
POST /api/conversations/{conversationId}/link-chunk
Content-Type: application/json

{
  "chunkId": "chunk-id-here"
}
```

**Response:**
```json
{
  "success": true
}
```

### Unlink a Chunk from a Conversation
```bash
DELETE /api/conversations/{conversationId}/unlink-chunk
```

**Response:**
```json
{
  "success": true
}
```

### Get All Conversations for a Chunk
```bash
GET /api/conversations/by-chunk/{chunkId}
```

**Response:**
```json
[
  {
    "id": "conv-123",
    "title": "Customer Support Conversation",
    "parentChunkId": "chunk-id-here",
    // ... other conversation fields
  }
]
```

### Get All Orphaned Conversations
```bash
GET /api/conversations/orphaned
```

**Response:**
```json
[
  {
    "id": "conv-456",
    "title": "Unlinked Conversation",
    "parentChunkId": null,
    // ... other conversation fields
  }
]
```

---

## Use Cases

### 1. Quality Assurance
**Scenario:** You want to verify that all generated conversations have proper source attribution.

**Steps:**
1. Click the **"Orphaned"** filter
2. Review the list of conversations without chunks
3. For each orphaned conversation:
   - Click the dropdown menu
   - Select "Link to Chunk"
   - Find the appropriate source chunk
   - Link it

### 2. Dimension-Aware Generation
**Scenario:** You want to generate conversations that align with chunk's semantic dimensions.

**Steps:**
1. Link conversation to chunk first
2. Open conversation detail
3. Review the semantic dimensions (persona, emotion, complexity)
4. Use this information to guide generation parameters
5. Verify generated conversation matches dimension attributes

### 3. Traceability & Audit
**Scenario:** You need to trace which chunk was used to generate a conversation.

**Steps:**
1. Open the conversation detail view
2. Check the "Source Chunk" card
3. Note the Chunk ID
4. Click "View Full Chunk" to see original source material
5. Use this for compliance, quality checks, or debugging

### 4. Chunk Performance Analysis
**Scenario:** You want to see which chunks generate the most conversations.

**Steps:**
1. Use the API to get conversations by chunk ID
2. Count how many conversations each chunk has
3. Identify high-performing source chunks
4. Analyze characteristics of successful chunks

---

## Best Practices

### When to Link Chunks

✅ **DO link chunks when:**
- Generating conversations from specific source material
- You need dimension metadata for parameter selection
- You want traceability for compliance
- Building training datasets with provenance

❌ **DON'T link chunks when:**
- Creating purely synthetic conversations
- Testing templates without source material
- Conversations are manually authored
- Source is not from the chunks-alpha module

### Maintaining Data Quality

1. **Link Early:** Associate chunks during conversation creation, not after
2. **Verify Links:** Periodically check orphaned conversations
3. **Update Links:** If source material changes, update chunk associations
4. **Document Decisions:** Use conversation notes to explain why a chunk was chosen

### Performance Tips

1. **Batch Linking:** When creating multiple conversations, prepare chunk IDs in advance
2. **Use Filters:** Narrow down chunk search to specific documents for faster selection
3. **Cache Context:** The system automatically caches chunk content for performance
4. **Monitor Orphaned Count:** Keep this number low for better data quality

---

## Troubleshooting

### Problem: Can't find a chunk to link

**Solutions:**
- Check that the chunk exists in the database
- Verify chunk has been processed and extracted
- Use broader search terms
- Check document filters aren't too restrictive
- Ensure chunk quality score meets minimum threshold

### Problem: Link fails with error

**Solutions:**
- Verify the conversation ID is correct
- Check that the chunk ID exists
- Ensure you have necessary permissions
- Check browser console for detailed error messages
- Verify API endpoint is accessible

### Problem: Chunk information doesn't display

**Solutions:**
- Refresh the conversation detail page
- Check that chunk was linked successfully
- Verify chunk has dimension data available
- Check browser console for API errors
- Ensure dimension extraction has completed

### Problem: Orphaned count seems wrong

**Solutions:**
- Refresh the page to update the count
- Check that draft/archived conversations are excluded
- Verify conversations are being linked properly
- Check API endpoint is returning correct data
- Look for filtering issues in conversation list

---

## Keyboard Shortcuts

**In Chunk Selector Modal:**
- `↓` / `↑` - Navigate between chunks
- `Enter` - Select focused chunk
- `Esc` - Close modal without selecting

**In Conversation Detail:**
- `←` / `→` - Navigate between conversations

---

## Visual Guide

### Conversation Table with Link Action
```
┌─────────────────────────────────────────────────┐
│ ID  │ Title              │ ... │ Actions        │
├─────────────────────────────────────────────────┤
│ 123 │ Customer Support   │ ... │ [⋮]            │
│     │                    │     │  └─ View       │
│     │                    │     │  └─ Edit       │
│     │                    │     │  └─ Link to... │ ← New!
│     │                    │     │  └─ Delete     │
└─────────────────────────────────────────────────┘
```

### Conversation Detail with Chunk Info
```
┌─────────────────────────────┐
│ 📋 Basic Information        │
│ ├─ Status: Approved         │
│ └─ Tier: Template           │
├─────────────────────────────┤
│ 🔗 Source Chunk            │ ← New!
│ ├─ Chunk ID: chunk-xyz      │
│ ├─ Context: "Product desc..."│
│ ├─ Confidence: 87%          │
│ ├─ Personas: tech, casual   │
│ ├─ Emotions: curious        │
│ └─ [View] [Unlink]          │
├─────────────────────────────┤
│ 📊 Quality Metrics          │
│ └─ Overall: 8.5/10          │
└─────────────────────────────┘
```

### Filter Bar with Orphaned Button
```
┌────────────────────────────────────────────────────┐
│ [🔍 Search...]  [🎚️ Filters]  [📥 Export]        │
├────────────────────────────────────────────────────┤
│ [All] [Templates] [Scenarios] [Edge Cases]         │
│ [Needs Review] [Approved] [High Quality]           │
│ [🔗 Orphaned (12)]  ← New!                         │
└────────────────────────────────────────────────────┘
```

---

## Support & Feedback

**Questions?**
- Check the full implementation summary: `PROMPT-5-IMPLEMENTATION-SUMMARY.md`
- Review API documentation
- Contact the development team

**Found a bug?**
- Report in issue tracker
- Include conversation ID and chunk ID
- Provide steps to reproduce
- Attach screenshots if possible

**Feature requests?**
- Suggest improvements
- Describe use case
- Explain expected behavior

---

## Version History

**v1.0** (November 3, 2025)
- Initial implementation
- Link/unlink functionality
- Orphaned conversation filter
- Chunk information display in detail view

---

**Happy linking! 🚀**

