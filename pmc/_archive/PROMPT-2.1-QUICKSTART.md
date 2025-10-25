# PROMPT 2.1 QUICKSTART
## Dimensions Spreadsheet Data Layer - Quick Reference

---

## 📦 What Was Built

Three TypeScript modules providing the complete data layer for chunk dimension validation:

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/dimension-metadata.ts` | Metadata constants for all 60 dimensions | 925 |
| `src/lib/dimension-classifier.ts` | Classification & confidence logic | 162 |
| `src/lib/dimension-service.ts` | Service layer to fetch & join data | 305 |

---

## 🎯 60 Dimensions Breakdown

```
📋 Prior Generated:        8 dimensions (Document metadata)
⚙️  Mechanically Generated: 17 dimensions (Chunk metadata)
🤖 AI Generated:           35 dimensions (AI processing required)
                           ├─ Content: 8
                           ├─ Task: 6
                           ├─ CER: 5
                           ├─ Scenario: 5
                           ├─ Training: 3
                           └─ Risk: 6
                              + Other: 2
```

---

## 🚀 Quick Start

### 1. Import the modules
```typescript
// Metadata
import { 
  DIMENSION_METADATA, 
  getAllDimensions, 
  getDimensionsByType 
} from './lib/dimension-metadata';

// Classification
import { 
  getGenerationType, 
  getConfidenceForDimension,
  getPopulatedPercentage 
} from './lib/dimension-classifier';

// Service
import { dimensionService } from './lib/dimension-service';
```

### 2. Get dimension metadata
```typescript
// Get all dimensions sorted by display order
const allDims = getAllDimensions(); // 60 dimensions

// Get dimensions by generation type
const aiDims = getDimensionsByType('AI Generated'); // 35 dimensions
const priorDims = getDimensionsByType('Prior Generated'); // 8 dimensions
const mechDims = getDimensionsByType('Mechanically Generated'); // 17 dimensions

// Get metadata for a specific dimension
const meta = DIMENSION_METADATA['chunk_summary_1s'];
console.log(meta.description); // "One-sentence summary (<= 30 words)."
console.log(meta.generationType); // "AI Generated"
console.log(meta.displayOrder); // 19
```

### 3. Classify dimensions and check confidence
```typescript
// Get generation type
const type = getGenerationType('doc_title'); // "Prior Generated"

// Get confidence (Prior/Mechanical = 10.0, AI = stored values)
const conf = getConfidenceForDimension('chunk_summary_1s', dimensions);
console.log(conf); // { precision: 8.5, accuracy: 9.0 }

// Check if populated
const populated = isPopulated(dimensions.chunk_summary_1s); // true/false

// Get percentage populated
const percent = getPopulatedPercentage(dimensions); // 0-100
```

### 4. Fetch validation data
```typescript
// Get complete validation data for a chunk
const data = await dimensionService.getDimensionValidationData(
  chunkId,
  runId
);

if (data) {
  console.log('Chunk:', data.chunk.chunk_id);
  console.log('Document:', data.document.title);
  console.log('Run:', data.run.run_name);
  console.log('Populated:', data.populatedPercentage + '%');
  console.log('Avg Precision:', data.averagePrecision);
  console.log('Avg Accuracy:', data.averageAccuracy);
  
  // Access dimension rows
  data.dimensionRows.forEach(row => {
    console.log(
      `${row.fieldName}: ${row.value}`,
      `(${row.generationType}, P:${row.precisionConfidence})`
    );
  });
}
```

### 5. Get runs for a chunk
```typescript
// Get all runs with data for this chunk
const runs = await dimensionService.getRunsForChunk(chunkId);

runs.forEach(({ run, hasData }) => {
  console.log(`Run: ${run.run_name}`);
  console.log(`Model: ${run.ai_model}`);
  console.log(`Status: ${run.status}`);
  console.log(`Has Data: ${hasData}`);
});
```

---

## 🔑 Key Concepts

### Generation Types
- **Prior Generated (8):** Document metadata created before chunking - always 10.0 confidence
- **Mechanically Generated (17):** Metadata created during chunking - always 10.0 confidence
- **AI Generated (35):** Requires AI processing - uses stored confidence values

### Confidence Scoring
```typescript
// Prior Generated and Mechanically Generated
{ precision: 10.0, accuracy: 10.0 }  // Always perfect

// AI Generated
{ 
  precision: dimensions.generation_confidence_precision,  // 0-10
  accuracy: dimensions.generation_confidence_accuracy     // 0-10
}
```

### Field Storage
```typescript
// From chunks table (9 fields)
chunk_id, section_heading, page_start, page_end, char_start, 
char_end, token_count, overlap_tokens, chunk_handle

// From chunk_dimensions table (51 fields)
All other dimensions + confidence scores
```

---

## 📊 Data Structures

### DimensionMetadata
```typescript
{
  fieldName: 'chunk_summary_1s',
  description: 'One-sentence summary (<= 30 words).',
  dataType: 'string',
  allowedValuesFormat: '<= 240 chars',
  generationType: 'AI Generated',
  exampleValue: 'Explains how to label document chunks...',
  isRequired: false,
  displayOrder: 19,
  category: 'Content'
}
```

### DimensionRow
```typescript
{
  fieldName: 'chunk_summary_1s',
  value: 'This chunk explains the categorization process...',
  generationType: 'AI Generated',
  precisionConfidence: 8.5,
  accuracyConfidence: 9.0,
  description: 'One-sentence summary (<= 30 words).',
  dataType: 'string',
  allowedValuesFormat: '<= 240 chars',
  category: 'Content',
  displayOrder: 19
}
```

### DimensionValidationData
```typescript
{
  chunk: Chunk,                    // Chunk metadata
  dimensions: ChunkDimensions,     // Raw dimension data
  run: ChunkRun,                   // Run metadata
  document: any,                   // Document metadata
  dimensionRows: DimensionRow[],   // 60 enriched dimension rows
  populatedPercentage: 85,         // % of populated dimensions
  averagePrecision: 8.2,           // Avg AI precision (0-10)
  averageAccuracy: 8.8             // Avg AI accuracy (0-10)
}
```

---

## 🎨 Display Order Groups

```
Group 1  (1-8):    Prior Generated - Document Metadata
Group 2  (9-17):   Mechanically Generated - Chunks Table
Group 3  (18-25):  AI Generated - Content
Group 4  (26-31):  AI Generated - Task
Group 5  (32-36):  AI Generated - CER
Group 6  (37-41):  AI Generated - Scenario
Group 7  (42-44):  AI Generated - Training
Group 8  (45-50):  AI Generated - Risk
Group 9  (51-60):  Mechanically Generated - Training Metadata
```

---

## 🔍 Common Patterns

### Pattern 1: Display all dimensions with metadata
```typescript
const allDims = getAllDimensions();

allDims.forEach(meta => {
  const value = dimensions[meta.fieldName];
  const conf = getConfidenceForDimension(meta.fieldName, dimensions);
  
  console.log(`${meta.fieldName}:`, value);
  console.log(`  Type: ${meta.generationType}`);
  console.log(`  Confidence: P:${conf.precision} A:${conf.accuracy}`);
  console.log(`  Category: ${meta.category}`);
});
```

### Pattern 2: Filter populated AI dimensions
```typescript
const aiDims = getDimensionsByType('AI Generated');

const populated = aiDims.filter(meta => {
  const value = dimensions[meta.fieldName];
  return isPopulated(value);
});

console.log(`${populated.length} / ${aiDims.length} AI dimensions populated`);
```

### Pattern 3: Calculate statistics by category
```typescript
const categories = ['Content', 'Task', 'CER', 'Scenario', 'Training', 'Risk'];

categories.forEach(category => {
  const dims = getDimensionsByCategory(category);
  const populated = dims.filter(meta => 
    isPopulated(dimensions[meta.fieldName])
  );
  
  console.log(`${category}: ${populated.length}/${dims.length} populated`);
});
```

### Pattern 4: Build dimension table rows
```typescript
const data = await dimensionService.getDimensionValidationData(chunkId, runId);

const tableData = data.dimensionRows.map(row => ({
  field: row.fieldName,
  value: row.value ?? '—',
  type: row.generationType,
  confidence: `P:${row.precisionConfidence} A:${row.accuracyConfidence}`,
  category: row.category
}));

// Now use tableData in your UI component
```

---

## 🛠️ Helper Functions Reference

### dimension-metadata.ts
| Function | Returns | Purpose |
|----------|---------|---------|
| `getDimensionMetadata(fieldName)` | `DimensionMetadata \| null` | Get metadata for one dimension |
| `getAllDimensions()` | `DimensionMetadata[]` | Get all 60, sorted by displayOrder |
| `getDimensionsByType(type)` | `DimensionMetadata[]` | Filter by generation type |
| `getDimensionsByCategory(category)` | `DimensionMetadata[]` | Filter by category |

### dimension-classifier.ts
| Function | Returns | Purpose |
|----------|---------|---------|
| `getGenerationType(fieldName)` | `string` | Get generation type |
| `getConfidenceForDimension(fieldName, dims)` | `{precision, accuracy}` | Get confidence scores |
| `isPopulated(value)` | `boolean` | Check if value is populated |
| `getPopulatedPercentage(dims)` | `number` | % of populated dimensions |
| `getAverageConfidence(dims)` | `{averagePrecision, averageAccuracy}` | Avg AI confidence |
| `getPopulationStatsByType(dims)` | `object` | Stats by generation type |

### dimension-service.ts
| Function | Returns | Purpose |
|----------|---------|---------|
| `getDimensionValidationData(chunkId, runId)` | `DimensionValidationData \| null` | Complete validation data |
| `getRunsForChunk(chunkId)` | `Array<{run, hasData}>` | Runs with data for chunk |
| `getDimensionsByRun(runId)` | `DimensionValidationData[]` | All chunks in a run |
| `getRunStatistics(runId)` | `object \| null` | Summary stats for run |

---

## ✅ Validation Checklist

- [x] All 60 dimensions defined with complete metadata
- [x] Metadata correctly mapped from CSV files
- [x] Generation types properly categorized (8 + 17 + 35)
- [x] Display order follows specification (1-60)
- [x] Confidence scoring differentiates AI vs non-AI
- [x] Service layer fetches and joins data correctly
- [x] Field mapping handles chunks table vs chunk_dimensions table
- [x] Error handling with try-catch and logging
- [x] TypeScript compiles without errors
- [x] Follows existing codebase patterns
- [x] No modifications to existing files

---

## 📖 Documentation

- **Completion Summary:** `PROMPT-2.1-COMPLETION-SUMMARY.md` (detailed implementation notes)
- **Visual Guide:** `PROMPT-2.1-VISUAL-GUIDE.md` (architecture diagrams and examples)
- **This File:** `PROMPT-2.1-QUICKSTART.md` (quick reference)

---

## 🎯 Next Steps

This data layer provides the foundation for:

1. **UI Components (PROMPT 2.2)** - React components to display spreadsheet
2. **Validation Rules** - Business logic for dimension validation
3. **Export Features** - Export to CSV/Excel
4. **Edit Interface** - Update dimension values
5. **Bulk Operations** - Batch updates across chunks

---

## 💡 Tips

1. **Always use getAllDimensions()** for consistent ordering (by displayOrder)
2. **Check generation type** before assuming confidence values
3. **Handle null values** - use optional chaining: `dimensions?.field_name`
4. **AI confidence only** - Don't include Prior/Mechanical in averages
5. **Field storage** - Remember some fields are in chunks table
6. **Error handling** - Services return null/empty array on errors

---

**Ready to use! 🚀**

Import the modules and start building your dimension validation UI.

