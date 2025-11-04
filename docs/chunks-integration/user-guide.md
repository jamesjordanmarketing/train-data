# Chunks-Alpha Integration User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Linking Conversations to Chunks](#linking-conversations-to-chunks)
4. [Understanding Dimension-Driven Parameters](#understanding-dimension-driven-parameters)
5. [Best Practices for Chunk Selection](#best-practices-for-chunk-selection)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Introduction

The Chunks-Alpha integration allows you to link conversations to semantic chunks from your document corpus, enabling dimension-driven conversation generation. This integration leverages 60-dimension analysis to automatically inject contextually appropriate parameters into your conversation generation process.

### Key Benefits

- **Context-Aware Generation**: Conversations are generated with specific chunk content as reference material
- **Automated Parameter Injection**: Persona, tone, complexity, and other parameters are automatically derived from chunk dimensions
- **Higher Quality**: Dimension confidence scores enhance conversation quality metrics
- **Semantic Search**: Find relevant chunks quickly using full-text search
- **Quality Filtering**: Filter chunks by confidence score to ensure high-quality source material

---

## Getting Started

### Prerequisites

1. **Access**: Ensure you have access to the conversation dashboard
2. **Chunks Available**: Your organization must have processed documents with chunk extraction
3. **Permissions**: You need edit permissions on conversations

### Quick Start

1. Navigate to the **Conversations Dashboard**
2. Find or create a conversation you want to enhance
3. Click the **"Link to Chunk"** button
4. Search and select a relevant chunk
5. Generate your conversation with enhanced context

---

## Linking Conversations to Chunks

### Step-by-Step Guide

#### Step 1: Access the Chunk Selector

1. From the Conversations Dashboard, locate the conversation you want to link
2. Hover over the conversation row to reveal action buttons
3. Click the **"Link to Chunk"** button (🔗 icon)

The Chunk Selector modal will open, displaying available chunks.

#### Step 2: Search for Relevant Chunks

**Search Bar**: Use the search input at the top to find chunks by content

```
Example searches:
- "API authentication"
- "database migration"
- "user permissions"
- "error handling patterns"
```

**Search Tips**:
- Search is debounced (300ms delay) to optimize performance
- Searches are case-insensitive
- Partial word matches are supported
- Results appear as you type

#### Step 3: Apply Filters (Optional)

Click the **"Filters"** button to refine your results:

**Quality Score Filter**:
- **Any (0)**: Shows all chunks regardless of quality
- **Medium (≥6)**: Shows chunks with moderate to high confidence
- **High (≥8)**: Shows only high-confidence chunks (recommended)

**Document Filter**:
- Select a specific source document to narrow results
- Useful when you know the source material

**Quick Presets**:
```
┌──────────┬──────────┬──────────┐
│ High ≥8  │ Medium ≥6│   Any    │
└──────────┴──────────┴──────────┘
```

#### Step 4: Review Chunk Details

When you find a potentially relevant chunk:

1. Click on the **chunk card** to open the detail panel
2. Review the following information:
   - **Full Content**: Complete chunk text (scrollable)
   - **Document Source**: Which document the chunk is from
   - **Page Range**: Location in source document
   - **Quality Score**: Confidence level (0-10 scale)
   - **Semantic Dimensions**: Top 5 dimension scores
   - **Semantic Categories**: Persona, emotion, complexity tags

**Quality Score Interpretation**:
```
 ✅ 8.0 - 10.0  = High Quality (Green)
 ⚠️  6.0 - 7.9  = Medium Quality (Yellow)
 ❌ 0.0 - 5.9   = Low Quality (Orange)
```

#### Step 5: Select and Confirm

1. If the chunk is appropriate, click **"Select This Chunk"**
2. The modal will close automatically
3. Your conversation now shows:
   - **Linked Chunk Indicator**: Green badge showing "Linked"
   - **Chunk Title**: Display name of the linked chunk
   - **Quick Preview**: First few lines of chunk content

#### Step 6: Generate with Context

1. Click the **"Generate"** button on your conversation
2. The system will automatically:
   - Include chunk content as source material
   - Extract persona from semantic dimensions
   - Set appropriate tone and emotion
   - Adjust complexity based on chunk analysis
   - Enhance quality score with dimension confidence

---

## Understanding Dimension-Driven Parameters

### What Are Dimensions?

Dimensions are semantic attributes extracted from chunks using AI analysis. The chunks-alpha module analyzes 60 different dimensions across four categories:

#### 1. Content Dimensions
- **Domain**: Subject area (e.g., "api-documentation", "user-guides")
- **Audience**: Target reader (e.g., "developers", "end-users")
- **Intent**: Purpose (e.g., "instruct", "reference", "explain")
- **Tone/Voice**: Style tags (e.g., "formal", "casual", "technical")
- **Complexity**: Content difficulty (0-1 scale)

#### 2. Task Dimensions
- **Task Name**: Type of instructional content
- **Preconditions**: Requirements before starting
- **Steps**: Procedural information
- **Expected Output**: Success criteria

#### 3. CER Dimensions (Claim-Evidence-Reasoning)
- **Claim**: Main assertion
- **Evidence**: Supporting data
- **Reasoning**: Logical connections
- **Factual Confidence**: Reliability score

#### 4. Scenario Dimensions
- **Scenario Type**: Category of example
- **Problem Context**: Situation description
- **Solution Action**: Resolution approach
- **Outcome Metrics**: Success measures

### How Dimensions Drive Generation

When you link a chunk with dimensions, the system automatically:

**Before Linking**:
```typescript
// Manual parameter entry required
{
  persona: "professional",      // Default
  tone: "neutral",              // Default
  complexity: 0.5,              // Default
  emotion: "neutral"            // Default
}
```

**After Linking** (with high-quality dimensions):
```typescript
// Automatically injected from chunk dimensions
{
  persona: "technical-expert",  // From chunk analysis
  tone: "formal",               // From tone_voice_tags
  complexity: 0.75,             // From complexity dimension
  emotion: "confident"          // From emotion dimension
  domain: ["api-documentation"] // Added context
}
```

### Dimension Confidence

The confidence score (0-1) indicates how certain the AI is about the dimensional analysis:

- **0.9 - 1.0**: Very High Confidence - Excellent source material
- **0.8 - 0.89**: High Confidence - Reliable parameters
- **0.6 - 0.79**: Medium Confidence - Generally usable
- **< 0.6**: Low Confidence - Review dimensions carefully

**Best Practice**: Use chunks with confidence ≥ 0.8 for production conversations.

---

## Best Practices for Chunk Selection

### 1. Choose High-Quality Chunks

✅ **DO**:
- Select chunks with quality score ≥ 8.0
- Review the full content before selecting
- Verify dimensions align with your conversation goals
- Check that source document is current/accurate

❌ **DON'T**:
- Select chunks solely based on title
- Ignore quality scores
- Link incomplete or truncated chunks
- Use chunks from outdated documents

### 2. Match Chunk to Conversation Intent

**For Instructional Conversations**:
- Look for chunks with task dimensions populated
- Prefer chunks from how-to guides or tutorials
- Check for step-by-step content

**For Reference Conversations**:
- Choose chunks from API docs or specification pages
- Look for high factual confidence scores
- Prefer chunks with citation support

**For Explanatory Conversations**:
- Select chunks with clear reasoning structures
- Look for CER dimensions (Claim-Evidence-Reasoning)
- Prefer chunks with moderate complexity

### 3. Leverage Search Effectively

**Search Strategy**:

```
1. Start Broad → Narrow Down
   "authentication" → "OAuth authentication" → "OAuth 2.0 flow"

2. Use Domain-Specific Terms
   Technical terms > Generic terms
   "JWT validation" > "check token"

3. Combine Multiple Queries
   Try variations if first search doesn't yield results
```

**Example Search Workflow**:
```
Step 1: Search "database"
  ↓ (Too many results)

Step 2: Apply filter → High Quality (≥8)
  ↓ (Manageable results)

Step 3: Search "database migration"
  ↓ (More specific)

Step 4: Filter by document → "Backend Guide"
  ↓ (Exact match found!)

Step 5: Select chunk ✓
```

### 4. Verify Semantic Dimensions

Before selecting a chunk, review its semantic categories:

**Persona Match**:
```
Your Goal: Generate for junior developers
Chunk Persona: ["technical-expert", "academic"]
Assessment: ❌ Mismatch - May be too advanced

Your Goal: Generate API reference
Chunk Persona: ["technical-writer", "educator"]
Assessment: ✅ Good match
```

**Emotion Match**:
```
Your Goal: Encouraging tutorial
Chunk Emotion: ["neutral", "precise"]
Assessment: ⚠️ Acceptable but not ideal

Your Goal: Technical specification
Chunk Emotion: ["neutral", "authoritative"]
Assessment: ✅ Perfect match
```

**Complexity Match**:
```
Your Goal: Beginner tutorial
Chunk Complexity: 0.85
Assessment: ❌ Too complex

Your Goal: Advanced deep-dive
Chunk Complexity: 0.45
Assessment: ❌ Too simple

Your Goal: Intermediate guide
Chunk Complexity: 0.60
Assessment: ✅ Good match
```

### 5. Handle Multiple Relevant Chunks

**When you find multiple good matches**:

1. **Compare Quality Scores**: Choose the highest
2. **Check Recency**: Prefer newer documents (check date)
3. **Review Completeness**: Choose more comprehensive content
4. **Consider Context**: Select the chunk that better fits your specific use case

**Pro Tip**: You can generate multiple conversations from different chunks and compare results.

### 6. Maintain Chunk Relevance

**Regular Maintenance**:
- Review linked chunks quarterly
- Unlink chunks from outdated documents
- Update links when new versions of documents are processed
- Monitor orphaned conversations (conversations without chunks)

**Check for Orphans**:
```
Dashboard → Filters → "Orphaned Conversations"
```

### 7. Use Chunks for Consistency

**Team Standardization**:
- Create a "golden chunk" list for common topics
- Document which chunks work best for specific conversation types
- Share successful chunk-conversation pairings with team
- Maintain chunk selection guidelines

---

## Troubleshooting

### Problem: No Search Results

**Possible Causes**:
1. No chunks have been extracted yet
2. Search terms too specific
3. Quality filter too restrictive
4. Documents not yet processed

**Solutions**:
- Try broader search terms
- Remove or lower quality filter (change to "Any")
- Check with admin if documents have been uploaded
- Verify you have access to the chunks database

### Problem: Chunk Selection Not Working

**Symptoms**: Click "Select This Chunk" but nothing happens

**Solutions**:
1. Check browser console for errors
2. Refresh the page and try again
3. Verify internet connection
4. Clear browser cache
5. Try a different browser

### Problem: Low Quality Scores

**If all chunks show low quality scores**:

1. **Check Source Documents**:
   - Are they properly formatted?
   - Are they complete (not corrupted)?
   - Do they have clear structure?

2. **Re-process Documents**:
   - Contact admin to regenerate dimensions
   - Use latest AI model for dimension extraction

3. **Use What's Available**:
   - Even low-quality chunks can provide useful context
   - Manually verify dimensions are reasonable
   - Consider manual parameter override if needed

### Problem: Linked Chunk Not Affecting Generation

**Verification Steps**:

1. **Check Link Status**:
   ```
   Conversation → Should show "Linked" badge
   ```

2. **Verify Chunk Has Dimensions**:
   - Open chunk detail panel
   - Look for "Semantic Dimensions" section
   - If empty, dimensions weren't generated

3. **Check Generation Logs**:
   - Review generation log for parameter injection
   - Should show chunk-derived parameters

4. **Test Isolation**:
   - Create new conversation
   - Link same chunk
   - Compare generation results

### Problem: Slow Search Performance

**If search takes >2 seconds**:

1. **Check Network**: Use browser DevTools Network tab
2. **Reduce Result Size**: Apply more specific filters
3. **Clear Cache**: Refresh page to clear local cache
4. **Report Issue**: If persistent, contact support

---

## FAQ

### General Questions

**Q: Can I link multiple chunks to one conversation?**  
A: Currently, each conversation can be linked to one chunk. This ensures clear dimension injection. For multi-chunk context, consider creating separate conversations.

**Q: Can multiple conversations share the same chunk?**  
A: Yes! Multiple conversations can link to the same chunk. This is useful for generating variations or different perspectives.

**Q: What happens if I delete a linked chunk?**  
A: The conversation becomes "orphaned" (no linked chunk). It will still exist but won't have chunk-driven parameters. You should link it to a new chunk or delete it.

**Q: Can I change the linked chunk after generation?**  
A: Yes. Unlink the current chunk and link a new one. You can then regenerate the conversation with the new chunk context.

### Dimension Questions

**Q: What if dimensions don't match my needs?**  
A: You can:
1. Choose a different chunk with better dimensions
2. Manually override parameters after linking
3. Request dimension regeneration (contact admin)

**Q: Are dimensions always accurate?**  
A: Dimensions are AI-generated and reflect confidence scores. Higher confidence (≥0.8) indicates more reliable dimensions. Always review dimensions before trusting them completely.

**Q: Can I edit dimensions?**  
A: No. Dimensions are read-only from the chunks-alpha module. If dimensions are incorrect, the source document may need reprocessing.

### Technical Questions

**Q: How often are chunks updated?**  
A: Chunks are updated when documents are reprocessed. Check with your admin for document processing schedules.

**Q: What's the difference between quality score and confidence?**  
A: 
- **Quality Score (0-10)**: Overall chunk quality for display purposes (confidence × 10)
- **Confidence (0-1)**: AI's certainty about dimensional analysis

**Q: Why do some chunks have no dimensions?**  
A: Possible reasons:
1. Chunk too short/incomplete
2. Dimension generation failed
3. Content couldn't be analyzed
4. Processing incomplete

**Q: Can I see dimension generation history?**  
A: Advanced users can access the chunks-alpha database directly to view dimension runs and history. Contact your admin for access.

### Workflow Questions

**Q: Should I link chunks before or after creating conversations?**  
A: Link chunks **before** generation for best results. This ensures dimension-driven parameters are used from the start.

**Q: Can I preview how dimensions will affect generation?**  
A: The chunk detail panel shows the dimensions that will be applied. Review persona, emotion, and complexity to predict tone and style.

**Q: What if I want to generate without chunk context?**  
A: Simply don't link a chunk, or unlink an existing one. The system will use default parameters.

**Q: How do I find the best chunk for my use case?**  
A: 
1. Start with specific search terms
2. Apply high-quality filter (≥8)
3. Review top 3-5 results
4. Check semantic categories match your intent
5. Select the best fit

---

## Advanced Tips

### Power User Shortcuts

**Keyboard Navigation**:
```
Arrow Down: Navigate to next chunk
Arrow Up: Navigate to previous chunk
Enter: Open detail panel
Escape: Close detail panel
```

**Search Operators** (if supported):
```
"exact phrase": Find exact matches
term1 term2: Find both terms (AND)
term1 | term2: Find either term (OR)
```

### Workflow Optimization

**For High-Volume Generation**:

1. **Create Chunk Favorites**:
   - Keep a list of high-quality chunk IDs
   - Directly search by chunk ID when known

2. **Batch Processing**:
   - Link multiple conversations to chunks before generating
   - Generate all at once for consistency

3. **Quality Assurance**:
   - Set minimum quality threshold (≥8)
   - Review dimension confidence before linking
   - Sample check generated conversations

### Integration with Existing Workflows

**Documentation Teams**:
```
1. Process documentation through chunks-alpha
2. Link conversations to relevant sections
3. Generate training materials
4. Export for publication
```

**Technical Writing**:
```
1. Extract chunks from technical specifications
2. Link conversations to API definitions
3. Generate code examples and explanations
4. Maintain version consistency
```

**Content Creation**:
```
1. Use chunks from style guides
2. Link to brand voice examples
3. Generate consistent messaging
4. Quality check against brand standards
```

---

## Getting Help

### Support Resources

- **Documentation**: Full technical docs at `/docs/chunks-integration/`
- **API Reference**: `/docs/chunks-integration/api-reference.md`
- **Architecture Guide**: `/docs/chunks-integration/architecture.md`

### Contact

- **Technical Support**: support@example.com
- **Bug Reports**: GitHub Issues
- **Feature Requests**: Product team via Slack #chunk-integration

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Basic chunk linking functionality
- Search and filter capabilities
- Dimension-driven parameter injection
- Quality score integration

### Upcoming Features
- Multi-chunk linking
- Batch operations
- Advanced search with embeddings
- Chunk recommendations
- Version history for dimensions

---

Thank you for using the Chunks-Alpha Integration! We hope this guide helps you create higher-quality, context-aware conversations.

