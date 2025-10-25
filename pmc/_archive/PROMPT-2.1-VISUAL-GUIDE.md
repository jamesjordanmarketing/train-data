# PROMPT 2.1 VISUAL GUIDE
## Dimensions Spreadsheet Data Layer Architecture

---

## 📊 Data Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  DIMENSION DATA LAYER                        │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Metadata    │ │  Classifier  │ │   Service    │
    │   Layer      │ │    Layer     │ │    Layer     │
    └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 📁 File Structure

```
src/lib/
├── dimension-metadata.ts      ← Metadata constants for all 60 dimensions
├── dimension-classifier.ts    ← Classification & confidence logic
└── dimension-service.ts       ← Service layer to fetch & join data
```

---

## 🎯 Dimension Organization (60 Total)

```
┌─────────────────────────────────────────────────────────────┐
│                    60 CHUNK DIMENSIONS                       │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │    Prior     │ │ Mechanically │ │      AI      │
    │  Generated   │ │  Generated   │ │  Generated   │
    │   (8 dims)   │ │  (17 dims)   │ │  (35 dims)   │
    └──────────────┘ └──────────────┘ └──────────────┘
         │                  │                  │
         │                  │                  │
         ▼                  ▼                  ▼
    
    Doc Metadata      Chunk Metadata      AI Processing
    • doc_id          • chunk_id          ├─ Content (8)
    • doc_title       • section_heading   ├─ Task (6)
    • doc_version     • page_start        ├─ CER (5)
    • source_type     • page_end          ├─ Scenario (5)
    • source_url      • char_start        ├─ Training (3)
    • author          • char_end          └─ Risk (6)
    • doc_date        • token_count           + Other (2)
    • primary_cat     • overlap_tokens
                      • chunk_handle
                      • embedding_id
                      • vector_checksum
                      • label_source
                      • label_model
                      • labeled_by
                      • label_timestamp
                      • review_status
                      • data_split
```

---

## 🔢 Display Order Sequence (1-60)

```
Order 1-8    │ Prior Generated (Document Metadata)
Order 9-17   │ Mechanically Generated (Chunks Table)
Order 18-25  │ AI Generated - Content
Order 26-31  │ AI Generated - Task
Order 32-36  │ AI Generated - CER
Order 37-41  │ AI Generated - Scenario
Order 42-44  │ AI Generated - Training
Order 45-50  │ AI Generated - Risk
Order 51-60  │ Mechanically Generated (Training Metadata)
```

---

## 🎨 Categories

```
Document Metadata  │ Prior Generated document info
Content           │ Content analysis (summary, terms, audience)
Task              │ Task/procedure extraction
CER               │ Claim-Evidence-Reasoning
Scenario          │ Example/case study extraction
Training          │ Instruction-tuning pairs
Risk              │ Safety, compliance, sensitivity
Metadata          │ Technical metadata & tracking
```

---

## 🔧 Confidence Scoring Logic

```
┌─────────────────────────────────────────────────────────────┐
│              DIMENSION CONFIDENCE RULES                      │
└─────────────────────────────────────────────────────────────┘

Prior Generated      │ ✅ Always 10.0 (Perfect)
Mechanically Gen     │ ✅ Always 10.0 (Perfect)
AI Generated         │ 📊 Uses stored confidence values
                     │    • generation_confidence_precision
                     │    • generation_confidence_accuracy
```

---

## 🗄️ Database Table Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                    TABLE RELATIONSHIPS                       │
└─────────────────────────────────────────────────────────────┘

documents
    │
    │ (1:N)
    ▼
chunks ─────────────────┐
    │                   │
    │ (1:N)             │
    ▼                   │
chunk_dimensions        │
    │                   │
    │ (N:1)             │ (N:1)
    ▼                   ▼
chunk_runs          chunk_runs
```

### Field Storage by Table

```
chunks table:
  • chunk_id
  • section_heading
  • page_start / page_end
  • char_start / char_end
  • token_count
  • overlap_tokens
  • chunk_handle

chunk_dimensions table:
  • All 51 other dimensions
  • generation_confidence_precision
  • generation_confidence_accuracy
```

---

## 📚 Key Interfaces

### DimensionMetadata
```typescript
interface DimensionMetadata {
  fieldName: string;              // camelCase field name
  description: string;            // Human-readable description
  dataType: DataType;             // string | enum | list | etc.
  allowedValuesFormat: string?;   // Format constraints
  generationType: GenType;        // Prior | Mechanical | AI
  exampleValue: string?;          // Example for reference
  isRequired: boolean;            // Required flag
  displayOrder: number;           // 1-60 for UI sorting
  category: Category;             // Grouping category
}
```

### DimensionRow
```typescript
interface DimensionRow {
  fieldName: string;              // Field identifier
  value: any;                     // Actual dimension value
  generationType: string;         // How it was generated
  precisionConfidence: number;    // 0-10 precision score
  accuracyConfidence: number;     // 0-10 accuracy score
  description: string;            // Field description
  dataType: string;               // Data type
  allowedValuesFormat: string?;   // Format constraints
  category: string;               // Category
  displayOrder: number;           // Sort order
}
```

### DimensionValidationData
```typescript
interface DimensionValidationData {
  chunk: Chunk;                   // Chunk metadata
  dimensions: ChunkDimensions;    // Raw dimension data
  run: ChunkRun;                  // Run metadata
  document: any;                  // Document metadata
  dimensionRows: DimensionRow[];  // Enriched dimension rows
  populatedPercentage: number;    // % populated (0-100)
  averagePrecision: number;       // Avg AI precision
  averageAccuracy: number;        // Avg AI accuracy
}
```

---

## 🔄 Data Flow

### Getting Validation Data
```
User Request
    │
    ▼
dimensionService.getDimensionValidationData(chunkId, runId)
    │
    ├─► 1. Fetch chunk from chunks table
    │       │
    │       ▼
    ├─► 2. Fetch dimensions from chunk_dimensions table
    │       │
    │       ▼
    ├─► 3. Fetch run from chunk_runs table
    │       │
    │       ▼
    ├─► 4. Fetch document from documents table
    │       │
    │       ▼
    ├─► 5. Join values with DIMENSION_METADATA
    │       │
    │       ▼
    ├─► 6. Calculate statistics
    │       • Populated percentage
    │       • Average precision (AI only)
    │       • Average accuracy (AI only)
    │
    ▼
Return DimensionValidationData
```

### Getting Runs for Chunk
```
User Request
    │
    ▼
dimensionService.getRunsForChunk(chunkId)
    │
    ├─► 1. Get chunk to find document_id
    │       │
    │       ▼
    ├─► 2. Get all runs for that document
    │       │
    │       ▼
    ├─► 3. Check which runs have data for this chunk
    │       │
    │       ▼
    └─► 4. Filter to runs with data
            │
            ▼
Return Array<{run, hasData}>
```

---

## 🎯 Helper Functions

### dimension-metadata.ts
```typescript
getDimensionMetadata(fieldName)
  → Returns metadata for single dimension

getAllDimensions()
  → Returns all 60 dimensions sorted by displayOrder

getDimensionsByType(type)
  → Filters by 'Prior Generated' | 'Mechanically Generated' | 'AI Generated'

getDimensionsByCategory(category)
  → Filters by category (Content, Task, CER, etc.)
```

### dimension-classifier.ts
```typescript
getGenerationType(fieldName)
  → Returns generation type for a dimension

getConfidenceForDimension(fieldName, dimensions)
  → Returns {precision, accuracy} confidence scores

isPopulated(value)
  → Checks if value is not null/empty

getPopulatedPercentage(dimensions)
  → Returns % of populated dimensions (0-100)

getAverageConfidence(dimensions)
  → Returns avg precision/accuracy for AI dimensions only

getPopulationStatsByType(dimensions)
  → Returns population stats by generation type
```

### dimension-service.ts
```typescript
dimensionService.getDimensionValidationData(chunkId, runId)
  → Complete validation data with enriched dimension rows

dimensionService.getRunsForChunk(chunkId)
  → All runs with data for this chunk

dimensionService.getDimensionsByRun(runId)
  → All dimension data for chunks in this run

dimensionService.getRunStatistics(runId)
  → Summary statistics for entire run
```

---

## 📊 Statistics Calculation

### Populated Percentage
```
Count dimensions with non-null/non-empty values
Divide by 60 (total dimensions)
Multiply by 100
Round to integer
```

### Average Confidence (AI Generated Only)
```
Filter to 35 AI Generated dimensions
Get confidence for each dimension
Calculate average precision
Calculate average accuracy
Round to 1 decimal place

NOTE: Prior Generated and Mechanically Generated
      dimensions are excluded (always 10.0)
```

---

## ✅ Validation Results

```
✓ Prior Generated:        8 dimensions (8 expected)
✓ Mechanically Generated: 17 dimensions (17 expected)
✓ AI Generated:           35 dimensions (35 expected)
✓ Total:                  60 dimensions (60 expected)
✓ No TypeScript errors
✓ No linter errors
✓ Follows codebase patterns
```

---

## 🚀 Usage Examples

### Example 1: Get all dimensions by type
```typescript
import { getDimensionsByType } from './lib/dimension-metadata';

const aiDims = getDimensionsByType('AI Generated');
console.log(aiDims.length); // 35

aiDims.forEach(dim => {
  console.log(`${dim.fieldName}: ${dim.description}`);
});
```

### Example 2: Check dimension confidence
```typescript
import { getConfidenceForDimension } from './lib/dimension-classifier';

// AI Generated dimension - uses stored confidence
const aiConf = getConfidenceForDimension('chunk_summary_1s', dimensions);
console.log(aiConf); // { precision: 8.5, accuracy: 9.0 }

// Mechanically Generated - always perfect
const mechConf = getConfidenceForDimension('chunk_id', dimensions);
console.log(mechConf); // { precision: 10.0, accuracy: 10.0 }
```

### Example 3: Fetch validation data
```typescript
import { dimensionService } from './lib/dimension-service';

const data = await dimensionService.getDimensionValidationData(
  'chunk-uuid-here',
  'run-uuid-here'
);

if (data) {
  console.log(`Populated: ${data.populatedPercentage}%`);
  console.log(`Precision: ${data.averagePrecision}`);
  console.log(`Accuracy: ${data.averageAccuracy}`);
  
  // Display dimension rows
  data.dimensionRows.forEach(row => {
    console.log(`${row.fieldName}: ${row.value}`);
  });
}
```

### Example 4: Get available runs
```typescript
import { dimensionService } from './lib/dimension-service';

const runs = await dimensionService.getRunsForChunk('chunk-uuid-here');

runs.forEach(({ run, hasData }) => {
  console.log(`${run.run_name}: ${run.ai_model}`);
  console.log(`Started: ${run.started_at}`);
  console.log(`Status: ${run.status}`);
});
```

---

## 🎨 Category Breakdown

```
Document Metadata (8)
├─ doc_id
├─ doc_title
├─ doc_version
├─ source_type
├─ source_url
├─ author
├─ doc_date
└─ primary_category

Content (8)
├─ chunk_type
├─ chunk_summary_1s
├─ key_terms
├─ audience
├─ intent
├─ tone_voice_tags
├─ brand_persona_tags
└─ domain_tags

Task (6)
├─ task_name
├─ preconditions
├─ inputs
├─ steps_json
├─ expected_output
└─ warnings_failure_modes

CER (5)
├─ claim
├─ evidence_snippets
├─ reasoning_sketch
├─ citations
└─ factual_confidence_0_1

Scenario (5)
├─ scenario_type
├─ problem_context
├─ solution_action
├─ outcome_metrics
└─ style_notes

Training (5)
├─ prompt_candidate
├─ target_answer
├─ style_directives
├─ include_in_training_yn
└─ augmentation_notes

Risk (6)
├─ safety_tags
├─ coverage_tag
├─ novelty_tag
├─ ip_sensitivity
├─ pii_flag
└─ compliance_flags

Metadata (17)
├─ chunk_id
├─ section_heading
├─ page_start
├─ page_end
├─ char_start
├─ char_end
├─ token_count
├─ overlap_tokens
├─ chunk_handle
├─ embedding_id
├─ vector_checksum
├─ label_source_auto_manual_mixed
├─ label_model
├─ labeled_by
├─ label_timestamp_iso
├─ review_status
└─ data_split_train_dev_test
```

---

**🎉 Data Layer Complete!**

Ready for UI component integration in PROMPT 2.2.

