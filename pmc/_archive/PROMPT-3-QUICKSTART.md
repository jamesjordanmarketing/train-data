# AI Dimension Generation - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Verify Configuration ✅

Check that your environment is ready:

```bash
# Navigate to src directory
cd src

# Start the development server
npm run dev
```

Open browser to: `http://localhost:3000/test-chunks`

**Look for:**
- ✅ Green "Database Connection Successful"
- ✅ AI Configuration shows "Configured"
- ✅ Template Count > 0
- ✅ DimensionGenerator service listed

### Step 2: Test Dimension Generation 🧪

Use either method:

#### Method A: Automatic (Recommended)
Dimensions are generated automatically during chunk extraction:

```bash
curl -X POST http://localhost:3000/api/chunks/extract \
  -H "Content-Type: application/json" \
  -d '{"documentId": "YOUR_DOCUMENT_ID"}'
```

#### Method B: Manual
Generate dimensions for existing chunks:

```bash
curl -X POST http://localhost:3000/api/chunks/generate-dimensions \
  -H "Content-Type: application/json" \
  -d '{"documentId": "YOUR_DOCUMENT_ID"}'
```

### Step 3: Verify Results 📊

Check the database for generated dimensions:

```sql
-- See latest run
SELECT * FROM chunk_runs 
ORDER BY started_at DESC 
LIMIT 1;

-- See generated dimensions for a document
SELECT cd.* 
FROM chunk_dimensions cd
JOIN chunks c ON c.id = cd.chunk_id
WHERE c.document_id = 'YOUR_DOCUMENT_ID'
ORDER BY cd.generated_at DESC;

-- Check confidence scores
SELECT 
  cd.chunk_id,
  cd.generation_confidence_precision,
  cd.generation_confidence_accuracy,
  cd.generation_cost_usd
FROM chunk_dimensions cd
WHERE cd.run_id = 'YOUR_RUN_ID';
```

---

## 📚 Key Concepts

### What Gets Generated?
For each chunk, the system generates **60+ dimensions** across 5 categories:
1. **Content Analysis:** Summary, key terms, audience, intent, tone
2. **Task Extraction:** Steps, inputs, outputs, warnings
3. **CER Analysis:** Claims, evidence, reasoning, citations
4. **Scenario Extraction:** Problem/solution patterns, metrics
5. **Risk Assessment:** Safety, compliance, IP sensitivity

### How Long Does It Take?
- **Per Chunk:** 5-10 seconds
- **10 Chunks:** 50-100 seconds
- **Batching:** 3 chunks processed in parallel

### How Much Does It Cost?
- **Per Chunk:** ~$0.005-0.010
- **Per Document (10 chunks):** ~$0.05-0.10
- Costs tracked automatically in `chunk_runs.total_cost_usd`

### What Are Confidence Scores?

**Precision (1-10):** How complete are the dimensions?
- **8-10:** "Things We Know" - Ready for dashboard
- **1-7:** "Things We Need to Know" - Needs review

**Accuracy (1-10):** How correct are the dimensions?
- MVP: Based on precision + variance
- Future: AI self-assessment or human review

---

## 🔧 Troubleshooting

### "AI Key Not Configured"
**Fix:** Add to `src/.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-api-...
```

### "Template Count: 0"
**Fix:** Run database migration to populate `prompt_templates` table:
```sql
-- Check templates exist
SELECT COUNT(*) FROM prompt_templates;
```

### "Generation Failed"
**Check:**
1. API key is valid
2. Chunks exist for document
3. Network connectivity to Anthropic API
4. Check console logs for specific error

### "Slow Performance"
**Optimize:**
1. Increase batch size (edit `generator.ts` line 58)
2. Reduce max_tokens if responses are long
3. Check network latency to Anthropic API

---

## 💡 Usage Patterns

### Pattern 1: Upload → Extract → Generate (Automatic)
```typescript
// User uploads document
const doc = await uploadDocument(file);

// Extract chunks (automatically generates dimensions)
const result = await fetch('/api/chunks/extract', {
  method: 'POST',
  body: JSON.stringify({ documentId: doc.id })
});

// Result includes runId for tracking
const { chunksExtracted, runId } = await result.json();
```

### Pattern 2: Regenerate Dimensions
```typescript
// Generate new dimensions for existing chunks
const result = await fetch('/api/chunks/generate-dimensions', {
  method: 'POST',
  body: JSON.stringify({ documentId: doc.id })
});

// New run created with updated dimensions
const { success, runId } = await result.json();
```

### Pattern 3: Monitor Progress
```typescript
// Track run status
const run = await chunkRunService.getRunsByDocument(documentId);

console.log(`Status: ${run[0].status}`);
console.log(`Progress: ${run[0].total_dimensions} dimensions`);
console.log(`Cost: $${run[0].total_cost_usd}`);
console.log(`Duration: ${run[0].total_duration_ms}ms`);
```

---

## 📖 API Reference

### POST /api/chunks/generate-dimensions

**Request:**
```json
{
  "documentId": "DOC_123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "runId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response (Error):**
```json
{
  "error": "documentId is required"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request (missing documentId)
- `401`: Unauthorized (not logged in)
- `500`: Server error (check logs)

---

## 🎯 Best Practices

### 1. Always Track Run IDs
```typescript
const { runId } = await generateDimensions(documentId);
// Store runId for later reference
await saveToDatabase({ documentId, runId, timestamp: new Date() });
```

### 2. Monitor Costs
```typescript
const runs = await chunkRunService.getRunsByDocument(documentId);
const totalCost = runs.reduce((sum, run) => sum + run.total_cost_usd, 0);
console.log(`Total spend on document: $${totalCost.toFixed(4)}`);
```

### 3. Handle Errors Gracefully
```typescript
try {
  await generateDimensions(documentId);
} catch (error) {
  // Log error
  console.error('Dimension generation failed:', error);
  
  // Notify user
  showToast('Generation failed. Please try again.');
  
  // Check run status
  const run = await getLatestRun(documentId);
  if (run.status === 'failed') {
    console.log('Error details:', run.error_message);
  }
}
```

### 4. Use Confidence Scores
```typescript
// Filter for high-confidence dimensions
const dimensions = await chunkDimensionService.getDimensionsByRun(runId);
const highConfidence = dimensions.filter(d => 
  d.generation_confidence_precision >= 8
);

console.log(`${highConfidence.length} high-confidence chunks`);
```

---

## 🔗 Related Documentation

- **PROMPT-3-COMPLETION-SUMMARY.md** - Full technical details
- **src/types/chunks.ts** - TypeScript type definitions
- **src/lib/dimension-generation/generator.ts** - Implementation
- **src/app/api/chunks/generate-dimensions/route.ts** - API endpoint

---

## 📞 Need Help?

### Common Questions

**Q: Can I customize the prompts?**  
A: Yes! Edit templates in the `prompt_templates` database table.

**Q: Can I use a different AI model?**  
A: Yes! Set `ANTHROPIC_MODEL` environment variable to any supported Claude model.

**Q: How do I reduce costs?**  
A: 1) Use smaller max_tokens, 2) Optimize prompts, 3) Batch more documents together.

**Q: Can I skip certain templates?**  
A: Yes! Mark templates as `is_active = false` in the database.

**Q: How do I add custom dimensions?**  
A: 1) Add fields to `chunk_dimensions` table, 2) Create new prompt template, 3) Update `mapResponseToDimensions()`.

---

## 🎉 You're Ready!

The AI dimension generation system is now operational. Start generating dimensions and building your training data corpus!

**Next:** Build the dashboard UI to visualize and interact with generated dimensions.

