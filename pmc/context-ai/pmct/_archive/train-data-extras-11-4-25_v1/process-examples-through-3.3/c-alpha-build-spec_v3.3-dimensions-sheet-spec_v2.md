# Chunks Alpha - Dimensions Results Spreadsheet
## Complete Build Specification v2.0 (IMPROVED)

**Date:** October 7, 2025  
**Module:** Chunks Alpha - Dimension Validation Spreadsheet  
**Status:** Ready for Implementation  
**Target:** Claude Sonnet 4.5 (200k context)  
**Improvements:** Enhanced prompts with all necessary context, clear SQL/prompt delineation

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Requirements Analysis](#requirements-analysis)
3. [Database Architecture](#database-architecture)
4. [Component Specifications](#component-specifications)
5. [Build Strategy](#build-strategy)
6. [Human Tasks](#human-tasks)
7. [AI Build Prompts](#ai-build-prompts)
8. [Testing & Validation](#testing--validation)
9. [Appendices](#appendices)

---

## 🎯 EXECUTIVE SUMMARY

### Objective
Build a comprehensive dimension validation spreadsheet that displays all 60 dimensions for each chunk, enabling validation of AI-generated dimension values. The spreadsheet will serve as the primary interface for reviewing chunk dimension generation quality.

### Key Features
- ✅ Display ALL 60 dimensions as rows (dimensions-as-rows orientation)
- ✅ Show dimension metadata (Description, Type, Allowed_Values_Format)
- ✅ Classify generation type (AI Generated, Mechanically Generated, Prior Generated)
- ✅ Display confidence scores (Precision and Accuracy) as raw values (1-10)
- ✅ Run selector dropdown (per-chunk historical runs, NOT side-by-side)
- ✅ Sortable and filterable columns
- ✅ Compact spreadsheet styling (minimal spacing)
- ✅ Column width presets (Small/Medium/Large)
- ✅ CSV export functionality
- ✅ Unique page URLs (Document Name - Chunk Name - Run Timestamp)

### Current State
**~65% Complete**
- ✅ Database schema with all 60 dimension fields in `chunk_dimensions` table
- ✅ AI dimension generation pipeline operational (5 prompt templates)
- ✅ Run management and historical tracking working (`chunk_runs` table)
- ✅ API endpoints functional (`/api/chunks/dimensions`, `/api/chunks/runs`)
- ✅ Existing UI components (ChunkSpreadsheet shows ~23 dimensions in multi-run comparison view)
- ⚠️ Missing: Dimension metadata integration (Description, Type, Allowed_Values)
- ⚠️ Missing: Generation type classification (AI/Mechanical/Prior)
- ⚠️ Missing: Per-chunk 60-dimension validation view (dimensions as rows)

### Build Approach
**3 Modular Phases:**
1. **Phase 1 (Human):** Database schema updates (30-45 min)
2. **Phase 2 (AI):** Data layer + metadata integration (2-3 hours)
3. **Phase 3 (AI):** UI components + page implementation (3-4 hours)

**Total Estimated Time:** 6-8 hours (including testing)

---

## 📊 REQUIREMENTS ANALYSIS

### Dimension Breakdown

Based on the analysis of the three CSV files, dimensions are categorized by generation method:

#### **Prior Generated (8 dimensions)**
*Source: `document-metadata-dictionary-previously-generated_v1.csv`*
- Inherited from document upload or categorization module
- **No processing needed** during chunk generation

| Field | Description | Source |
|-------|-------------|--------|
| `Doc_ID` | Document identifier | Documents table |
| `Doc_Title` | Document title | Documents table |
| `Doc_Version` | Document version | Documents table |
| `Source_Type` | Document format | Documents table |
| `Source_URL` | Document URL/path | Documents table |
| `Author` | Document author | Documents table |
| `Doc_Date` | Publication date | Documents table |
| `Primary_Category` | Business category | Categorization module |

#### **Mechanically Generated (17 dimensions)**
*Source: `document-metadata-dictionary-mechanically-generated_v1.csv`*
- Calculated during chunk extraction without AI
- **Simple computation** or tracking

| Field | Description | Calculation Method |
|-------|-------------|-------------------|
| `Chunk_ID` | Unique chunk ID | Format: `{Doc_ID}#C{###}` |
| `Section_Heading` | Section title | Extracted from document structure |
| `Page_Start` | Start page | Parsed from chunk boundaries |
| `Page_End` | End page | Parsed from chunk boundaries |
| `Char_Start` | Character start index | Chunk extraction algorithm |
| `Char_End` | Character end index | Chunk extraction algorithm |
| `Token_Count` | Token count | tiktoken library |
| `Overlap_Tokens` | Overlapping tokens | Calculated from adjacent chunks |
| `Chunk_Handle` | URL-friendly slug | Generated from section heading |
| `Embedding_ID` | Vector embedding ID | Generated after embedding creation |
| `Vector_Checksum` | Embedding checksum | Calculated from embedding vector |
| `Label_Source_Auto_Manual_Mixed` | Label provenance | Set to 'auto' for this iteration |
| `Label_Model` | AI model name | Set to Claude model version |
| `Labeled_By` | Labeler identifier | Set to 'auto' |
| `Label_Timestamp_ISO` | Timestamp | Current timestamp |
| `Review_Status` | QA status | Default: 'unreviewed' |
| `Data_Split_Train_Dev_Test` | Dataset split | Default: 'train' |

#### **AI Generated (35 dimensions)**
*Source: `document-metadata-dictionary-gen-AI-processing-required_v1.csv`*
- Requires LLM analysis and generation
- **Needs AI reasoning** - the core value generation

**Grouped by prompt template:**

**1. Content Analysis (8 dimensions) - 1 prompt**
- `Chunk_Type` (Chapter_Sequential | Instructional_Unit | CER | Example_Scenario)
- `Chunk_Summary_1s` (One-sentence summary)
- `Key_Terms` (Salient terms array)
- `Audience` (Target reader/user)
- `Intent` (educate | instruct | persuade | inform | narrate | summarize | compare | evaluate)
- `Tone_Voice_Tags` (Style descriptors array)
- `Brand_Persona_Tags` (Brand identity traits array)
- `Domain_Tags` (Topic taxonomy array)

**2. Task Extraction (6 dimensions) - 1 prompt (Instructional_Unit only)**
- `Task_Name`
- `Preconditions`
- `Inputs`
- `Steps_JSON`
- `Expected_Output`
- `Warnings_Failure_Modes`

**3. CER Analysis (5 dimensions) - 1 prompt (CER chunks only)**
- `Claim`
- `Evidence_Snippets`
- `Reasoning_Sketch`
- `Citations`
- `Factual_Confidence_0_1`

**4. Scenario Extraction (5 dimensions) - 1 prompt (Example_Scenario only)**
- `Scenario_Type` (case_study | dialogue | Q&A | walkthrough | anecdote)
- `Problem_Context`
- `Solution_Action`
- `Outcome_Metrics`
- `Style_Notes`

**5. Training Pair Generation (3 dimensions) - 1 prompt**
- `Prompt_Candidate`
- `Target_Answer`
- `Style_Directives`

**6. Risk Assessment (6 dimensions) - 1 prompt**
- `Safety_Tags`
- `Coverage_Tag` (core | supporting | edge)
- `Novelty_Tag` (novel | common | disputed)
- `IP_Sensitivity` (Public | Internal | Confidential | Trade_Secret)
- `PII_Flag` (boolean)
- `Compliance_Flags`

**7. Training Metadata (2 dimensions) - Defaults, no AI needed**
- `Include_In_Training_YN` (default: true)
- `Augmentation_Notes` (default: null)

**Total: 8 Prior + 17 Mechanical + 35 AI = 60 dimensions**

### Reference CSV Layout

From `LoRA-dimensions_v2-full-output-table_v1.csv`, the spreadsheet columns are:

| Column | Description | Data Source |
|--------|-------------|-------------|
| **Chunk Dimension** | Field name (e.g., "Chunk_Summary_1s") | Fixed list of 60 fields |
| **Document Name (last run)** | "Doc Title - Chunk Name - Run Timestamp" | Composed from chunk + run data |
| **Generated Value** | Actual dimension value | `chunk_dimensions` table |
| **What Generated TYPE** | AI / Mechanical / Prior Generated | `dimension_metadata` table (new) |
| **Precision Confidence Level** | Raw score (1-10) | `chunk_dimensions.generation_confidence_precision` |
| **Accuracy Confidence Level** | Raw score (1-10) | `chunk_dimensions.generation_confidence_accuracy` |
| **Description** | Field description | `dimension_metadata` table (new) |
| **Type** | Data type (string, enum, list[string], etc.) | `dimension_metadata` table (new) |
| **Allowed_Values_Format** | Valid value formats | `dimension_metadata` table (new) |

### User Decisions (from Q&A)

| Question | User Decision |
|----------|---------------|
| **Q1: Orientation** | Dimensions as ROWS (Option A) ✅ |
| **Q2: Metadata Storage** | Database table + VIEW (Options A & C) ✅ |
| **Q3: Multi-Run Display** | Dropdown selector, NOT side-by-side ✅ |
| **Q4: CSV File** | `LoRA-dimensions_v2-full-output-table_v1.csv` ✅ |
| **Q5: Generation Type** | 8 Prior, 17 Mechanical, 35 AI (from CSV files) ✅ |
| **Q6: Page Header** | "Document Name - Chunk Name - Run Timestamp" ✅ |
| **Q7: Sort/Filter** | Approved as recommended ✅ |
| **Q8: Visual Density** | Compact with fixed row heights ✅ |
| **Q9: Column Resizing** | Preset templates (S/M/L) ✅ |
| **Q10: Export** | CSV export with all columns ✅ |

---

## 💾 DATABASE ARCHITECTURE

### Schema Changes Required

#### 1. New Table: `dimension_metadata`

**Purpose:** Store static metadata about each dimension field

```sql
CREATE TABLE dimension_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  data_type TEXT NOT NULL,  -- 'string', 'enum', 'list[string]', 'integer', 'float', 'boolean', 'json', 'datetime'
  allowed_values_format TEXT,  -- e.g., 'pdf | docx | html', '>=1', '0.0-1.0'
  generation_type TEXT NOT NULL,  -- 'Prior Generated' | 'Mechanically Generated' | 'AI Generated'
  example_value TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  display_order INTEGER,  -- For consistent ordering in UI
  category TEXT,  -- 'Document Metadata', 'Content', 'Task', 'CER', 'Scenario', 'Training', 'Risk', 'Metadata'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dimension_metadata_field_name ON dimension_metadata(field_name);
CREATE INDEX idx_dimension_metadata_generation_type ON dimension_metadata(generation_type);
CREATE INDEX idx_dimension_metadata_category ON dimension_metadata(category);
```

**Data Population:**
- Import from the 3 CSV files (8 Prior, 17 Mechanical, 35 AI)
- See SQL seed script in Appendix A

#### 2. New Database VIEW: `chunk_dimensions_full` (OPTIONAL)

**Purpose:** Join chunk dimensions with metadata for easy querying (if needed)

```sql
-- This VIEW is OPTIONAL - the build prompts use application-layer joining instead
-- Kept for reference if future optimizations are needed
CREATE OR REPLACE VIEW chunk_dimensions_full AS
SELECT 
  cd.id,
  cd.chunk_id,
  cd.run_id,
  c.chunk_handle,
  c.chunk_type,
  c.document_id,
  d.title as doc_title,
  cr.run_name,
  cr.started_at as run_timestamp,
  cr.ai_model,
  cr.status as run_status,
  cd.generation_confidence_precision,
  cd.generation_confidence_accuracy,
  cd.generation_cost_usd,
  cd.generation_duration_ms,
  cd.generated_at
FROM chunk_dimensions cd
LEFT JOIN chunks c ON c.id = cd.chunk_id
LEFT JOIN documents d ON d.id = c.document_id
LEFT JOIN chunk_runs cr ON cr.run_id = cd.run_id
ORDER BY cd.generated_at DESC;
```

#### 3. Schema Validation

**Check current `chunk_dimensions` table has all required fields:**

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chunk_dimensions' 
ORDER BY ordinal_position;
```

**Expected: 60+ dimension fields + metadata fields (id, chunk_id, run_id, generated_at, etc.)**

---

## 🏗️ COMPONENT SPECIFICATIONS

### Architecture Overview

```
src/
├── lib/
│   ├── dimension-metadata.ts           (NEW - Dimension metadata constants & utilities)
│   ├── dimension-classifier.ts         (NEW - Generation type classification logic)
│   └── dimension-service.ts            (NEW - Data access layer for dimensions + metadata)
├── components/chunks/
│   ├── DimensionValidationSheet.tsx    (NEW - Main spreadsheet component)
│   ├── ChunkSpreadsheet.tsx            (EXISTING - Keep for multi-run comparison)
│   └── RunComparison.tsx               (EXISTING - Keep for run diff)
└── app/chunks/[documentId]/
    ├── page.tsx                        (UPDATE - Add "View All Dimensions" button)
    └── dimensions/[chunkId]/
        └── page.tsx                    (NEW - Dimension validation page)
```

### 1. Dimension Metadata Constants (`src/lib/dimension-metadata.ts`)

**Purpose:** TypeScript constants for dimension metadata, imported from CSV data

```typescript
export interface DimensionMetadata {
  fieldName: string;
  description: string;
  dataType: 'string' | 'enum' | 'list[string]' | 'integer' | 'float' | 'boolean' | 'json' | 'datetime';
  allowedValuesFormat: string | null;
  generationType: 'Prior Generated' | 'Mechanically Generated' | 'AI Generated';
  exampleValue: string | null;
  isRequired: boolean;
  displayOrder: number;
  category: 'Document Metadata' | 'Content' | 'Task' | 'CER' | 'Scenario' | 'Training' | 'Risk' | 'Metadata';
}

export const DIMENSION_METADATA: Record<string, DimensionMetadata> = {
  // All 60 dimensions defined here...
};

export const DIMENSIONS_BY_TYPE = {
  'Prior Generated': [/* 8 fields */],
  'Mechanically Generated': [/* 17 fields */],
  'AI Generated': [/* 35 fields */]
};

export function getDimensionMetadata(fieldName: string): DimensionMetadata | null;
export function getAllDimensions(): DimensionMetadata[];
export function getDimensionsByType(type: string): DimensionMetadata[];
export function getDimensionsByCategory(category: string): DimensionMetadata[];
```

### 2. Dimension Classifier (`src/lib/dimension-classifier.ts`)

**Purpose:** Utility functions for dimension classification and confidence scoring

```typescript
export function getGenerationType(fieldName: string): string;
export function getConfidenceForDimension(fieldName: string, dimensions: ChunkDimensions): { precision: number; accuracy: number };
export function isPopulated(value: any): boolean;
export function getPopulatedPercentage(dimensions: ChunkDimensions): number;
export function getAverageConfidence(dimensions: ChunkDimensions): { averagePrecision: number; averageAccuracy: number };
```

### 3. Dimension Service (`src/lib/dimension-service.ts`)

**Purpose:** Data access layer for dimensions with metadata joined

```typescript
export interface DimensionRow {
  fieldName: string;
  value: any;
  generationType: string;
  precisionConfidence: number;
  accuracyConfidence: number;
  description: string;
  dataType: string;
  allowedValuesFormat: string | null;
  category: string;
  displayOrder: number;
}

export interface DimensionValidationData {
  chunk: Chunk;
  dimensions: ChunkDimensions;
  run: ChunkRun;
  document: any;
  dimensionRows: DimensionRow[];
  populatedPercentage: number;
  averagePrecision: number;
  averageAccuracy: number;
}

export const dimensionService = {
  async getDimensionValidationData(chunkId: string, runId: string): Promise<DimensionValidationData | null>;
  async getRunsForChunk(chunkId: string): Promise<Array<{ run: ChunkRun; hasData: boolean }>>;
};
```

### 4. Dimension Validation Sheet Component (`src/components/chunks/DimensionValidationSheet.tsx`)

**Purpose:** Main spreadsheet component displaying all 60 dimensions as rows

**Key Features:**
- Dimensions displayed as ROWS (not columns)
- Columns: Dimension, Value, Type, Precision, Accuracy, Description, Data Type, Allowed Format
- Sortable: Field Name, Generation Type, Precision, Accuracy
- Filterable: Generation Type, Confidence Level, Text Search
- Column width presets (Small, Medium, Large)
- CSV export
- Compact styling (text-sm, py-2)

### 5. Dimension Validation Page (`src/app/chunks/[documentId]/dimensions/[chunkId]/page.tsx`)

**Purpose:** Page component that wraps the validation sheet with header, run selector, and stats

**Key Features:**
- Page title: "{Document Name} - {Chunk Name} - {Run Timestamp}"
- Run selector dropdown (historical runs for THIS chunk only)
- Statistics card (Populated %, Avg Precision, Avg Accuracy, Needs Review count)
- Type distribution badges (AI/Mechanical/Prior counts)
- Integration with DimensionValidationSheet component

### 6. Update Chunk Dashboard (`src/app/chunks/[documentId]/page.tsx`)

**Purpose:** Add "View All Dimensions" button to each chunk card

**Changes:**
1. Add a button after the existing "Detail View" button
2. Link to `/chunks/[documentId]/dimensions/[chunkId]`

---

## 🚀 BUILD STRATEGY

### Overview

The build is segmented into **3 modular phases**:

1. **Phase 1 (Human):** Database schema setup - 30-45 minutes
2. **Phase 2 (AI):** Data layer implementation - 2-3 hours
3. **Phase 3 (AI):** UI components and pages - 3-4 hours

Each phase is **self-contained** and can be executed independently without breaking existing functionality.

### Phase Breakdown

| Phase | Type | Duration | Dependencies | Deliverables |
|-------|------|----------|--------------|--------------|
| **1** | Human (SQL) | 30-45 min | None | `dimension_metadata` table + seed data |
| **2** | AI (Code) | 2-3 hours | Phase 1 | Metadata constants + services |
| **3** | AI (Code) | 3-4 hours | Phase 2 | UI components + pages |

### Risk Mitigation

- ✅ **No modifications** to existing components (`ChunkSpreadsheet`, `RunComparison`)
- ✅ **New files only** (except one button add to chunk dashboard)
- ✅ **Database changes** are additive (no destructive operations)
- ✅ **Independent testing** possible at each phase
- ✅ **Rollback-friendly** (can revert SQL + delete new files)

---

## 👤 HUMAN TASKS

### Phase 1: Database Setup (30-45 minutes)

**Task 1.1: Create `dimension_metadata` Table**



====================================================================================



```sql
-- Connect to Supabase SQL Editor
-- Copy and paste this entire script

CREATE TABLE IF NOT EXISTS dimension_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  data_type TEXT NOT NULL,
  allowed_values_format TEXT,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('Prior Generated', 'Mechanically Generated', 'AI Generated')),
  example_value TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dimension_metadata_field_name ON dimension_metadata(field_name);
CREATE INDEX idx_dimension_metadata_generation_type ON dimension_metadata(generation_type);
CREATE INDEX idx_dimension_metadata_category ON dimension_metadata(category);
CREATE INDEX idx_dimension_metadata_display_order ON dimension_metadata(display_order);

-- Enable RLS (Row Level Security)
ALTER TABLE dimension_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (dimension metadata is static)
CREATE POLICY "Public read access for dimension_metadata" 
  ON dimension_metadata FOR SELECT 
  USING (true);
```



+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



**Task 1.2: Seed Dimension Metadata**

See **Appendix A** for full seed SQL (60 INSERT statements). 



====================================================================================



Copy the full SQL from Appendix A and paste into Supabase SQL Editor



+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



**Task 1.3: Verify Data**



====================================================================================



```sql
-- Check row count
SELECT COUNT(*) FROM dimension_metadata;
-- Expected: 60

-- Check generation type distribution
SELECT generation_type, COUNT(*) 
FROM dimension_metadata 
GROUP BY generation_type;
-- Expected: Prior Generated (8), Mechanically Generated (17), AI Generated (35)

-- View all dimensions ordered by display_order
SELECT field_name, generation_type, category, display_order 
FROM dimension_metadata 
ORDER BY display_order;
```



+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



**Checkpoint:** ✅ Database table created, seeded, and verified

---

## 🤖 AI BUILD PROMPTS

### Phase 2: Data Layer Implementation (2-3 hours)

**Status:** Ready to copy-paste into Claude Sonnet 4.5 Cursor

---

#### **PROMPT 2.1: Data Layer Implementation**



====================================================================================



CONTEXT:
You are building the data layer for a dimension validation spreadsheet feature in the Chunks Alpha module. The database schema has been updated with a new `dimension_metadata` table containing metadata for all 60 chunk dimensions.

CURRENT CODEBASE STATE:
- Existing service: `src/lib/chunk-service.ts` with `chunkService`, `chunkDimensionService`, `chunkRunService`
- Existing types: `src/types/chunks.ts` with `Chunk`, `ChunkDimensions`, `ChunkRun` interfaces
- Existing Supabase client: `src/lib/supabase.ts`
- ChunkDimensions interface has 60+ dimension fields already defined (doc_id, doc_title, chunk_summary_1s, key_terms, etc.)
- Database tables exist: `chunks`, `chunk_dimensions`, `chunk_runs`, `documents`, `dimension_metadata` (newly created)

OBJECTIVE:
Create the TypeScript data layer that:
1. Provides dimension metadata constants matching the database `dimension_metadata` table
2. Implements generation type classification logic
3. Builds a service layer to fetch and join dimension data with metadata

REQUIREMENTS:

1. Create `src/lib/dimension-metadata.ts`:
   - Define `DimensionMetadata` interface matching the database schema:
     ```typescript
     export interface DimensionMetadata {
       fieldName: string;           // Maps to field_name in DB
       description: string;          // Full description
       dataType: 'string' | 'enum' | 'list[string]' | 'integer' | 'float' | 'boolean' | 'json' | 'datetime';
       allowedValuesFormat: string | null;  // e.g., 'pdf | docx | html'
       generationType: 'Prior Generated' | 'Mechanically Generated' | 'AI Generated';
       exampleValue: string | null;
       isRequired: boolean;
       displayOrder: number;         // For consistent UI ordering
       category: 'Document Metadata' | 'Content' | 'Task' | 'CER' | 'Scenario' | 'Training' | 'Risk' | 'Metadata';
     }
     ```
   
   - Create `DIMENSION_METADATA` constant object with all 60 dimensions using data from these CSV files:
     * `system/chunks-alpha-data/document-metadata-dictionary-previously-generated_v1.csv` (8 Prior Generated)
     * `system/chunks-alpha-data/document-metadata-dictionary-mechanically-generated_v1.csv` (17 Mechanically Generated)
     * `system/chunks-alpha-data/document-metadata-dictionary-gen-AI-processing-required_v1.csv` (35 AI Generated)
   
   - The 60 dimensions are:
     
     **Prior Generated (8):** Doc_ID, Doc_Title, Doc_Version, Source_Type, Source_URL, Author, Doc_Date, Primary_Category
     
     **Mechanically Generated (17):** Chunk_ID, Section_Heading, Page_Start, Page_End, Char_Start, Char_End, Token_Count, Overlap_Tokens, Chunk_Handle, Embedding_ID, Vector_Checksum, Label_Source_Auto_Manual_Mixed, Label_Model, Labeled_By, Label_Timestamp_ISO, Review_Status, Data_Split_Train_Dev_Test
     
     **AI Generated (35):** Chunk_Type, Chunk_Summary_1s, Key_Terms, Audience, Intent, Tone_Voice_Tags, Brand_Persona_Tags, Domain_Tags, Task_Name, Preconditions, Inputs, Steps_JSON, Expected_Output, Warnings_Failure_Modes, Claim, Evidence_Snippets, Reasoning_Sketch, Citations, Factual_Confidence_0_1, Scenario_Type, Problem_Context, Solution_Action, Outcome_Metrics, Style_Notes, Prompt_Candidate, Target_Answer, Style_Directives, Safety_Tags, Coverage_Tag, Novelty_Tag, IP_Sensitivity, PII_Flag, Compliance_Flags, Include_In_Training_YN, Augmentation_Notes
   
   - Create `DIMENSIONS_BY_TYPE` constant:
     ```typescript
     export const DIMENSIONS_BY_TYPE = {
       'Prior Generated': [/* 8 field names */],
       'Mechanically Generated': [/* 17 field names */],
       'AI Generated': [/* 35 field names */]
     };
     ```
   
   - Implement helper functions:
     ```typescript
     export function getDimensionMetadata(fieldName: string): DimensionMetadata | null {
       return DIMENSION_METADATA[fieldName] || null;
     }
     
     export function getAllDimensions(): DimensionMetadata[] {
       return Object.values(DIMENSION_METADATA).sort((a, b) => a.displayOrder - b.displayOrder);
     }
     
     export function getDimensionsByType(type: string): DimensionMetadata[] {
       const fieldNames = DIMENSIONS_BY_TYPE[type as keyof typeof DIMENSIONS_BY_TYPE] || [];
       return fieldNames.map(name => DIMENSION_METADATA[name]).filter(Boolean);
     }
     
     export function getDimensionsByCategory(category: string): DimensionMetadata[] {
       return getAllDimensions().filter(dim => dim.category === category);
     }
     ```
   
   - IMPORTANT: For displayOrder, use this sequence:
     * Prior Generated: 1-8
     * Mechanically Generated (from chunks table): 9-17
     * AI Generated (Content): 18-25
     * AI Generated (Task): 26-31
     * AI Generated (CER): 32-36
     * AI Generated (Scenario): 37-41
     * AI Generated (Training): 42-44
     * AI Generated (Risk): 45-50
     * Mechanically Generated (Training Metadata): 51-60

2. Create `src/lib/dimension-classifier.ts`:
   - Import types:
     ```typescript
     import { DIMENSION_METADATA, DIMENSIONS_BY_TYPE } from './dimension-metadata';
     import { ChunkDimensions } from '../types/chunks';
     ```
   
   - Implement `getGenerationType(fieldName: string): string`:
     ```typescript
     export function getGenerationType(fieldName: string): string {
       const metadata = DIMENSION_METADATA[fieldName];
       return metadata?.generationType || 'Unknown';
     }
     ```
   
   - Implement `getConfidenceForDimension(fieldName: string, dimensions: ChunkDimensions)`:
     - RULE: Prior Generated and Mechanically Generated dimensions always have perfect confidence (10.0)
     - RULE: AI Generated dimensions use stored values from `generation_confidence_precision` and `generation_confidence_accuracy`
     ```typescript
     export function getConfidenceForDimension(
       fieldName: string,
       dimensions: ChunkDimensions
     ): { precision: number; accuracy: number } {
       const generationType = getGenerationType(fieldName);
       
       // Prior Generated and Mechanically Generated always have perfect confidence
       if (generationType !== 'AI Generated') {
         return { precision: 10.0, accuracy: 10.0 };
       }
       
       // AI Generated dimensions use stored confidence scores
       return {
         precision: dimensions.generation_confidence_precision || 0,
         accuracy: dimensions.generation_confidence_accuracy || 0
       };
     }
     ```
   
   - Implement `isPopulated(value: any): boolean`:
     ```typescript
     export function isPopulated(value: any): boolean {
       if (value === null || value === undefined) return false;
       if (typeof value === 'string' && value.trim() === '') return false;
       if (Array.isArray(value) && value.length === 0) return false;
       if (typeof value === 'object' && Object.keys(value).length === 0) return false;
       return true;
     }
     ```
   
   - Implement `getPopulatedPercentage(dimensions: ChunkDimensions): number`:
     ```typescript
     export function getPopulatedPercentage(dimensions: ChunkDimensions): number {
       const allDimensions = Object.keys(DIMENSION_METADATA);
       const populatedCount = allDimensions.filter(fieldName => {
         const value = (dimensions as any)[fieldName];
         return isPopulated(value);
       }).length;
       
       return Math.round((populatedCount / allDimensions.length) * 100);
     }
     ```
   
   - Implement `getAverageConfidence(dimensions: ChunkDimensions)`:
     - IMPORTANT: Only calculate average for AI Generated dimensions (35 fields)
     ```typescript
     export function getAverageConfidence(dimensions: ChunkDimensions): {
       averagePrecision: number;
       averageAccuracy: number;
     } {
       const aiDimensions = DIMENSIONS_BY_TYPE['AI Generated'];
       const confidences = aiDimensions.map(fieldName => 
         getConfidenceForDimension(fieldName, dimensions)
       );
       
       const avgPrecision = confidences.reduce((sum, c) => sum + c.precision, 0) / confidences.length;
       const avgAccuracy = confidences.reduce((sum, c) => sum + c.accuracy, 0) / confidences.length;
       
       return {
         averagePrecision: Math.round(avgPrecision * 10) / 10,
         averageAccuracy: Math.round(avgAccuracy * 10) / 10
       };
     }
     ```

3. Create `src/lib/dimension-service.ts`:
   - Import dependencies:
     ```typescript
     import { supabase } from './supabase';
     import { ChunkDimensions, Chunk, ChunkRun } from '../types/chunks';
     import { DIMENSION_METADATA, getAllDimensions } from './dimension-metadata';
     import { getGenerationType, getConfidenceForDimension } from './dimension-classifier';
     ```
   
   - Define interfaces:
     ```typescript
     export interface DimensionRow {
       fieldName: string;
       value: any;
       generationType: string;
       precisionConfidence: number;
       accuracyConfidence: number;
       description: string;
       dataType: string;
       allowedValuesFormat: string | null;
       category: string;
       displayOrder: number;
     }
     
     export interface DimensionValidationData {
       chunk: Chunk;
       dimensions: ChunkDimensions;
       run: ChunkRun;
       document: any;
       dimensionRows: DimensionRow[];
       populatedPercentage: number;
       averagePrecision: number;
       averageAccuracy: number;
     }
     ```
   
   - Implement `dimensionService.getDimensionValidationData(chunkId, runId)`:
     ```typescript
     export const dimensionService = {
       async getDimensionValidationData(
         chunkId: string,
         runId: string
       ): Promise<DimensionValidationData | null> {
         // 1. Fetch chunk
         const { data: chunk, error: chunkError } = await supabase
           .from('chunks')
           .select('*')
           .eq('id', chunkId)
           .single();
         
         if (chunkError || !chunk) return null;
         
         // 2. Fetch dimensions for this chunk and run
         const { data: dimensions, error: dimError } = await supabase
           .from('chunk_dimensions')
           .select('*')
           .eq('chunk_id', chunkId)
           .eq('run_id', runId)
           .single();
         
         if (dimError || !dimensions) return null;
         
         // 3. Fetch run
         const { data: run, error: runError } = await supabase
           .from('chunk_runs')
           .select('*')
           .eq('run_id', runId)
           .single();
         
         if (runError || !run) return null;
         
         // 4. Fetch document
         const { data: document, error: docError } = await supabase
           .from('documents')
           .select('*')
           .eq('id', chunk.document_id)
           .single();
         
         if (docError || !document) return null;
         
         // 5. Build dimension rows by joining dimension values with metadata
         const allDimensionMetadata = getAllDimensions();
         const dimensionRows: DimensionRow[] = allDimensionMetadata.map(meta => {
           const value = (dimensions as any)[meta.fieldName];
           const confidence = getConfidenceForDimension(meta.fieldName, dimensions);
           
           return {
             fieldName: meta.fieldName,
             value,
             generationType: meta.generationType,
             precisionConfidence: confidence.precision,
             accuracyConfidence: confidence.accuracy,
             description: meta.description,
             dataType: meta.dataType,
             allowedValuesFormat: meta.allowedValuesFormat,
             category: meta.category,
             displayOrder: meta.displayOrder
           };
         });
         
         // 6. Calculate statistics
         const populatedCount = dimensionRows.filter(row => 
           row.value !== null && row.value !== undefined && row.value !== ''
         ).length;
         const populatedPercentage = Math.round((populatedCount / dimensionRows.length) * 100);
         
         const aiRows = dimensionRows.filter(row => row.generationType === 'AI Generated');
         const avgPrecision = aiRows.reduce((sum, row) => sum + row.precisionConfidence, 0) / aiRows.length;
         const avgAccuracy = aiRows.reduce((sum, row) => sum + row.accuracyConfidence, 0) / aiRows.length;
         
         return {
           chunk,
           dimensions,
           run,
           document,
           dimensionRows,
           populatedPercentage,
           averagePrecision: Math.round(avgPrecision * 10) / 10,
           averageAccuracy: Math.round(avgAccuracy * 10) / 10
         };
       },
       
       // Get all runs for a specific chunk
       async getRunsForChunk(chunkId: string): Promise<Array<{ run: ChunkRun; hasData: boolean }>> {
         // 1. Get chunk to find its document
         const { data: chunk } = await supabase
           .from('chunks')
           .select('document_id')
           .eq('id', chunkId)
           .single();
         
         if (!chunk) return [];
         
         // 2. Get all runs for this document
         const { data: runs } = await supabase
           .from('chunk_runs')
           .select('*')
           .eq('document_id', chunk.document_id)
           .order('started_at', { ascending: false });
         
         if (!runs) return [];
         
         // 3. Check which runs have data for this specific chunk
         const runsWithStatus = await Promise.all(
           runs.map(async (run) => {
             const { data: dimData } = await supabase
               .from('chunk_dimensions')
               .select('id')
               .eq('chunk_id', chunkId)
               .eq('run_id', run.run_id)
               .limit(1);
             
             return {
               run,
               hasData: dimData && dimData.length > 0
             };
           })
         );
         
         // 4. Return only runs that have data for this chunk
         return runsWithStatus.filter(r => r.hasData);
       }
     };
     ```

4. IMPORTANT FIELD MAPPING:
   - Some dimension fields are stored in the `chunks` table, not `chunk_dimensions`:
     * Chunk_ID → Use chunk.id
     * Section_Heading → Use chunk.section_heading
     * Page_Start → Use chunk.page_start
     * Page_End → Use chunk.page_end
     * Char_Start → Use chunk.char_start
     * Char_End → Use chunk.char_end
     * Token_Count → Use chunk.token_count
     * Overlap_Tokens → Use chunk.overlap_tokens
     * Chunk_Handle → Use chunk.chunk_handle
   
   - Update `getDimensionValidationData` to pull these values from the `chunk` object when building dimensionRows

5. ERROR HANDLING:
   - Add try-catch blocks around all Supabase queries
   - Return null for getDimensionValidationData if any critical data is missing
   - Return empty array for getRunsForChunk if errors occur
   - Log errors to console for debugging

6. TYPESCRIPT:
   - Use strict mode
   - Add proper type annotations to all functions
   - Use existing types from `src/types/chunks.ts`
   - Add JSDoc comments for all exported functions

7. CODE STYLE:
   - Follow the patterns in `src/lib/chunk-service.ts`
   - Use async/await (not promises)
   - Use destructuring for Supabase responses
   - Use optional chaining and nullish coalescing where appropriate

CONSTRAINTS:
- Do NOT modify any existing files except to create these new ones
- Do NOT modify database schema (already done by human)
- Do NOT modify existing chunk services or API endpoints
- Do NOT modify types in `src/types/chunks.ts`
- Follow the existing code style and patterns

FILES TO CREATE:
1. src/lib/dimension-metadata.ts
2. src/lib/dimension-classifier.ts
3. src/lib/dimension-service.ts

SUCCESS CRITERIA:
- All 60 dimensions properly categorized by generation type
- Metadata correctly mapped from CSV files
- Services can fetch and join data without errors
- TypeScript compiles without errors
- Follows existing codebase patterns
- getDimensionValidationData returns complete data structure
- getRunsForChunk correctly filters to per-chunk runs
- Confidence scoring logic correctly differentiates AI vs non-AI dimensions

Begin implementation. Create all three files with complete, production-ready code.



+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



---

### Phase 3: UI Components & Pages (3-4 hours)

**Status:** Ready to copy-paste into Claude Sonnet 4.5 Cursor (execute AFTER Phase 2 is complete)

---

#### **PROMPT 3.1: Dimension Validation Spreadsheet UI**



====================================================================================



CONTEXT:
You are building the dimension validation spreadsheet UI for the Chunks Alpha module. The data layer has been implemented in Phase 2 with three new files:
- `src/lib/dimension-metadata.ts` (metadata constants and utilities)
- `src/lib/dimension-classifier.ts` (classification and confidence logic)
- `src/lib/dimension-service.ts` (data access layer)

These services are ready to use and provide all the data needed for the UI.

CURRENT CODEBASE STATE:
- Existing components: `src/components/chunks/ChunkSpreadsheet.tsx` (multi-run comparison view)
- Existing page: `src/app/chunks/[documentId]/page.tsx` (chunk dashboard)
- Existing UI components: shadcn/ui components in `src/components/ui/` (Table, Card, Button, Badge, Input, Select, Skeleton)
- Existing navigation: Next.js 13 app router with nested routes
- Styling: Tailwind CSS with shadcn/ui theme
- Toast notifications: `sonner` library (already installed)

OBJECTIVE:
Create the UI components and pages for the dimension validation spreadsheet that displays all 60 dimensions as rows with metadata columns.

REQUIREMENTS:

1. Create `src/components/chunks/DimensionValidationSheet.tsx`:
   
   COMPONENT PROPS:
   ```typescript
   interface DimensionValidationSheetProps {
     dimensionRows: DimensionRow[];        // From dimension-service
     documentName: string;                  // For display and export
     chunkName: string;                     // For display and export
     runTimestamp: string;                  // For display and export
   }
   ```
   
   DISPLAY STRUCTURE:
   - Dimensions as ROWS (not columns)
   - Each row represents ONE dimension field
   - Columns (left to right):
     1. Chunk Dimension (field name) - sortable
     2. Generated Value (actual value)
     3. Type (generation type badge) - sortable, filterable
     4. Precision (confidence score) - sortable, color-coded
     5. Accuracy (confidence score) - sortable, color-coded
     6. Description (from metadata)
     7. Data Type (string/enum/etc.)
     8. Allowed Format (validation rules)
   
   STYLING:
   - Use `<Table>` from shadcn/ui
   - Compact styling: `text-sm`, `py-2` for cells (not default py-4)
   - Fixed row height for consistency
   - Sticky header: `className="sticky top-0 bg-background z-10"`
   - Scrollable area: `max-h-[calc(100vh-300px)]` with `overflow-auto`
   - Border and rounded corners on table container
   
   SORTING:
   - Click column headers to sort
   - Sort by: Field Name, Generation Type, Precision Confidence, Accuracy Confidence
   - Toggle asc/desc on repeated clicks
   - Show ArrowUpDown icon from lucide-react on sortable columns
   - State: `const [sortField, setSortField] = useState<keyof DimensionRow>('displayOrder')`
   - State: `const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')`
   
   FILTERING:
   - Filter controls above the table
   - Text search: searches across field name, description, and value
     * `<Input>` with Search icon
     * State: `const [filterText, setFilterText] = useState('')`
   - Generation type filter:
     * `<Select>` dropdown with options: All, AI Generated, Mechanically Generated, Prior Generated
     * State: `const [filterType, setFilterType] = useState<string>('all')`
   - Confidence level filter:
     * `<Select>` dropdown with options: All, High (≥8.0), Low (<8.0)
     * State: `const [filterConfidence, setFilterConfidence] = useState<string>('all')`
   
   COLUMN WIDTH PRESETS:
   - `<Select>` dropdown with options: Small, Medium, Large
   - State: `const [columnSize, setColumnSize] = useState<'small' | 'medium' | 'large'>('medium')`
   - Width mappings:
     ```typescript
     const columnWidths = {
       small: { name: 'w-32', value: 'w-48', other: 'w-24' },
       medium: { name: 'w-48', value: 'w-64', other: 'w-32' },
       large: { name: 'w-64', value: 'w-96', other: 'w-40' }
     };
     ```
   - Apply to TableHead components dynamically
   
   VALUE FORMATTING:
   - Arrays: `value.join(', ')` - show as comma-separated
   - Booleans: Display as 'Yes' or 'No'
   - Objects: `JSON.stringify(value)` (for Steps_JSON, etc.)
   - Null/undefined: Show '-' in muted color
   - Long strings: Truncate with ellipsis and add title attribute for hover
   - Format function:
     ```typescript
     const formatValue = (value: any): string => {
       if (value === null || value === undefined) return '-';
       if (Array.isArray(value)) return value.join(', ');
       if (typeof value === 'boolean') return value ? 'Yes' : 'No';
       if (typeof value === 'object') return JSON.stringify(value);
       return String(value);
     };
     ```
   
   CONFIDENCE SCORE COLOR-CODING:
   - ≥8.0: Green background (`text-green-600 bg-green-50`)
   - 6.0-7.9: Yellow background (`text-yellow-600 bg-yellow-50`)
   - <6.0: Orange background (`text-orange-600 bg-orange-50`)
   - Display as: `8.5` (one decimal place)
   - Show CheckCircle icon for high confidence (≥8.0)
   - Show AlertCircle icon for low confidence (<8.0)
   
   GENERATION TYPE BADGES:
   - AI Generated: Purple badge (`bg-purple-100 text-purple-800`)
   - Mechanically Generated: Blue badge (`bg-blue-100 text-blue-800`)
   - Prior Generated: Gray badge (`bg-gray-100 text-gray-800`)
   - Show shortened label: "AI", "Mechanical", "Prior"
   
   CSV EXPORT:
   - Export button with Download icon
   - Loading state while exporting
   - CSV structure:
     * Headers: Chunk Dimension, Document Name (last run), Generated Value, What Generated TYPE, Precision Confidence Level, Accuracy Confidence Level, Description, Type, Allowed Values Format
     * Document Name format: "{documentName} - {chunkName} - {runTimestamp}"
     * Properly escape CSV values (quote strings, handle commas)
   - Download filename: `{chunkName}_dimensions_{timestamp}.csv`
   - Toast notification on success/failure
   - State: `const [exporting, setExporting] = useState(false)`
   
   SUMMARY FOOTER:
   - Show: "Showing X of Y dimensions"
   - Show: "Populated: X/60"
   - Show: "High Confidence (≥8.0): X"
   - Use muted text color
   
   RESPONSIVE DESIGN:
   - Horizontal scroll on mobile
   - Table container: `overflow-auto`
   - Min width for table to prevent column squashing

2. Create `src/app/chunks/[documentId]/dimensions/[chunkId]/page.tsx`:
   
   PAGE STRUCTURE:
   ```typescript
   'use client'
   
   import { useState, useEffect } from 'react';
   import { useRouter } from 'next/navigation';
   import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
   import { Button } from '../../../../../components/ui/button';
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
   import { Badge } from '../../../../../components/ui/badge';
   import { Skeleton } from '../../../../../components/ui/skeleton';
   import { ArrowLeft, RefreshCw, TrendingUp, Percent } from 'lucide-react';
   import { DimensionValidationSheet } from '../../../../../components/chunks/DimensionValidationSheet';
   import { dimensionService, DimensionValidationData } from '../../../../../lib/dimension-service';
   import { ChunkRun } from '../../../../../types/chunks';
   import { toast } from 'sonner';
   
   export default function DimensionValidationPage({ 
     params 
   }: { 
     params: { documentId: string; chunkId: string } 
   }) {
     // State management
     const router = useRouter();
     const [loading, setLoading] = useState(true);
     const [data, setData] = useState<DimensionValidationData | null>(null);
     const [availableRuns, setAvailableRuns] = useState<Array<{ run: ChunkRun; hasData: boolean }>>([]);
     const [selectedRunId, setSelectedRunId] = useState<string>('');
     
     // Load runs on mount
     useEffect(() => {
       loadRuns();
     }, [params.chunkId]);
     
     // Load data when run selected
     useEffect(() => {
       if (selectedRunId) {
         loadData(selectedRunId);
       }
     }, [selectedRunId]);
     
     // ... implementation
   }
   ```
   
   PAGE HEADER:
   - Title format: "{Document Name} - {Chunk Name} - {Run Timestamp}"
   - Back button (ArrowLeft icon) - navigates to `/chunks/${documentId}`
   - Subtitle: "Dimension Validation - 60 Total Dimensions"
   - Regenerate button (RefreshCw icon) - shows toast "Coming soon" for now
   
   RUN SELECTOR:
   - Fetch runs using `dimensionService.getRunsForChunk(chunkId)`
   - Default to most recent run (index 0)
   - `<Select>` dropdown with run options
   - Display format: "{Date/Time} - {AI Model}"
   - On change: reload data for selected run
   - Position: Inside statistics card header
   
   STATISTICS CARD:
   - Grid layout: 4 metrics in a row
   - Metric 1: Populated Percentage
     * Icon: Percent (blue background)
     * Label: "Populated"
     * Value: "{populatedPercentage}%"
   - Metric 2: Average Precision
     * Icon: TrendingUp (green background)
     * Label: "Avg Precision"
     * Value: "{averagePrecision}" (one decimal)
   - Metric 3: Average Accuracy
     * Icon: TrendingUp (purple background)
     * Label: "Avg Accuracy"
     * Value: "{averageAccuracy}" (one decimal)
   - Metric 4: Needs Review Count
     * Badge: Orange
     * Label: "{count} Need Review"
     * Count: dimensions with accuracy <8.0
   
   TYPE DISTRIBUTION BADGES:
   - Below statistics grid
   - Show counts for each generation type:
     * "{aiCount} AI Generated" - purple badge
     * "{mechanicalCount} Mechanical" - blue badge
     * "{priorCount} Prior" - gray badge
   - Calculate from dimensionRows
   
   DIMENSION SPREADSHEET INTEGRATION:
   - Pass props to DimensionValidationSheet:
     * dimensionRows={data.dimensionRows}
     * documentName={data.document.title}
     * chunkName={data.chunk.chunk_handle || `Chunk ${data.chunk.chunk_id}`}
     * runTimestamp={new Date(data.run.started_at).toLocaleString()}
   
   LOADING STATES:
   - Initial load: Show 3 Skeleton components
   - Run switch: Keep existing UI, just reload data
   - Use Skeleton for header, stats, and table areas
   
   ERROR HANDLING:
   - If no runs found: Show message "No dimension data found for this chunk"
   - If data fetch fails: Show message "Failed to load dimension data" with toast
   - If no data: Show empty state with "Back to Chunks" button
   
   PAGE LAYOUT:
   - Container: `className="container mx-auto px-4 py-8 space-y-6"`
   - Responsive: Stack on mobile, side-by-side on desktop

3. Update `src/app/chunks/[documentId]/page.tsx`:
   
   CHANGE REQUIRED:
   - Find the chunk cards section (around line 300-400 based on existing patterns)
   - Look for where "Detail View" button or similar navigation buttons exist
   - Add a new button AFTER the existing buttons:
   
   ```typescript
   <Button
     variant="outline"
     size="sm"
     onClick={() => router.push(`/chunks/${params.documentId}/dimensions/${chunk.id}`)}
   >
     <Grid3x3 className="h-4 w-4 mr-2" />
     View All Dimensions
   </Button>
   ```
   
   - Import Grid3x3 from lucide-react at top of file
   - DO NOT modify any other part of the chunk dashboard
   - DO NOT change existing navigation or routing

4. IMPORTANT UI PATTERNS TO FOLLOW:
   - Use existing shadcn/ui components (don't install new libraries)
   - Follow the styling patterns from ChunkSpreadsheet.tsx
   - Use Tailwind utility classes (no custom CSS)
   - Use lucide-react icons (already installed)
   - Use sonner for toast notifications (already installed)
   - Follow Next.js 13 app router conventions
   - Use 'use client' directive for interactive components
   - Use useRouter from 'next/navigation' (not 'next/router')

5. ACCESSIBILITY:
   - Add proper ARIA labels to buttons
   - Add title attributes for truncated text
   - Ensure keyboard navigation works (tab through controls)
   - Use semantic HTML (proper heading hierarchy)

6. PERFORMANCE:
   - Use useMemo for filtered/sorted data
   - Memoize formatValue function
   - Avoid unnecessary re-renders
   - Use React.memo if needed for DimensionValidationSheet

7. ERROR BOUNDARIES:
   - Wrap main content in try-catch where appropriate
   - Show user-friendly error messages
   - Log errors to console for debugging

CONSTRAINTS:
- Do NOT modify existing components (ChunkSpreadsheet.tsx, RunComparison.tsx)
- Do NOT modify existing API endpoints
- Do NOT modify database schema
- Minimal changes to existing chunk dashboard (only add one button)
- Do NOT install new dependencies
- Follow existing UI patterns from chunk dashboard
- Use existing shadcn/ui theme and components

FILES TO CREATE:
1. src/components/chunks/DimensionValidationSheet.tsx
2. src/app/chunks/[documentId]/dimensions/[chunkId]/page.tsx

FILES TO UPDATE:
1. src/app/chunks/[documentId]/page.tsx (add "View All Dimensions" button only)

SUCCESS CRITERIA:
- All 60 dimensions display correctly as rows
- Sorting works smoothly on all sortable columns
- Filtering works for text search, generation type, and confidence level
- Column width presets change column widths correctly
- Run selector switches data correctly without full page reload
- CSV export generates proper file with all columns
- Compact spreadsheet styling matches specification (text-sm, py-2, minimal spacing)
- Confidence scores are color-coded correctly (green/yellow/orange)
- Generation type badges are color-coded correctly (purple/blue/gray)
- Values format correctly (arrays as comma-separated, booleans as Yes/No, objects as JSON)
- Navigation from chunk dashboard works (button appears and navigates correctly)
- Page header shows correct title format
- Statistics card shows accurate metrics
- Loading states work smoothly
- Error handling provides user-friendly messages
- TypeScript compiles without errors
- No console errors in browser
- Responsive design works on mobile and desktop

DETAILED IMPLEMENTATION CHECKLIST:

DimensionValidationSheet.tsx:
- [ ] Component props interface defined
- [ ] State variables for sort, filter, column size, exporting
- [ ] Column width constants
- [ ] Filtered and sorted rows with useMemo
- [ ] handleSort function
- [ ] handleExport function with CSV generation
- [ ] formatValue function for display
- [ ] formatValueForCSV function for export
- [ ] getConfidenceColor function
- [ ] getTypeColor function
- [ ] Filter controls row (search, type dropdown, confidence dropdown, size dropdown, export button)
- [ ] Table with sticky header
- [ ] Sortable column headers with ArrowUpDown icon
- [ ] Table rows with proper formatting
- [ ] Confidence score color-coding with icons
- [ ] Generation type badges
- [ ] Summary footer
- [ ] Empty state handling
- [ ] Responsive design

DimensionValidationPage:
- [ ] Page props interface
- [ ] State variables for loading, data, runs, selectedRunId
- [ ] loadRuns function
- [ ] loadData function
- [ ] useEffect for initial load
- [ ] useEffect for run selection
- [ ] Loading skeleton
- [ ] Error handling states
- [ ] Page header with back button and title
- [ ] Regenerate button (placeholder)
- [ ] Statistics card with 4 metrics
- [ ] Run selector dropdown
- [ ] Type distribution badges
- [ ] DimensionValidationSheet integration
- [ ] Proper data passing
- [ ] Toast notifications

ChunkDashboard Update:
- [ ] Import Grid3x3 icon
- [ ] Add "View All Dimensions" button
- [ ] Button placed after existing navigation buttons
- [ ] Navigation to correct route
- [ ] No other changes to dashboard

Begin implementation. Create all components with complete, production-ready code. Test that all features work as specified.



+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



---

## ✅ TESTING & VALIDATION

### Manual Testing Checklist

**Phase 2 Testing (Data Layer):**
- [ ] `dimension-metadata.ts` exports all 60 dimensions
- [ ] `getDimensionMetadata()` returns correct metadata for each field
- [ ] `getDimensionsByType()` returns correct counts (8, 17, 35)
- [ ] `getConfidenceForDimension()` returns 10.0 for non-AI dimensions
- [ ] `getConfidenceForDimension()` returns stored values for AI dimensions
- [ ] `dimensionService.getDimensionValidationData()` successfully fetches and joins data
- [ ] `dimensionService.getRunsForChunk()` returns correct run list filtered to chunk
- [ ] Fields from `chunks` table (Chunk_ID, Section_Heading, etc.) are correctly pulled

**Phase 3 Testing (UI):**
- [ ] Navigate to `/chunks/[documentId]` and see "View All Dimensions" button
- [ ] Click button navigates to `/chunks/[documentId]/dimensions/[chunkId]`
- [ ] Page loads and displays all 60 dimensions as rows
- [ ] Run selector shows all available runs for THIS chunk only
- [ ] Selecting different run updates the spreadsheet
- [ ] Statistics card shows correct metrics (populated %, avg confidence for AI only)
- [ ] Type distribution shows correct counts
- [ ] Sort by Field Name works (asc/desc)
- [ ] Sort by Generation Type works (asc/desc)
- [ ] Sort by Precision Confidence works (asc/desc)
- [ ] Sort by Accuracy Confidence works (asc/desc)
- [ ] Filter by generation type (AI/Mechanical/Prior) works
- [ ] Filter by confidence level (High ≥8.0/Low <8.0) works
- [ ] Text search filters dimensions correctly (searches name, description, value)
- [ ] Column size selector (S/M/L) changes column widths
- [ ] CSV export downloads correct file with all columns
- [ ] CSV export has proper formatting (escaped quotes, commas handled)
- [ ] Confidence scores are color-coded correctly (green ≥8.0, yellow 6.0-7.9, orange <6.0)
- [ ] Generation type badges are color-coded correctly (purple/blue/gray)
- [ ] Values format correctly (arrays as comma-separated, booleans as Yes/No)
- [ ] Objects format correctly (JSON.stringify for Steps_JSON)
- [ ] Null/undefined values show as '-' in muted color
- [ ] Compact styling (small text, minimal padding, fixed row heights)
- [ ] Sticky header stays visible when scrolling
- [ ] Table scrolls properly (max-height enforced)
- [ ] Responsive on mobile (horizontal scroll works)
- [ ] No TypeScript errors in build
- [ ] No console errors in browser
- [ ] Loading states show Skeleton components
- [ ] Error states show user-friendly messages
- [ ] Toast notifications work (export success, errors)

### Database Verification Queries



====================================================================================



```sql
-- Verify dimension_metadata table
SELECT COUNT(*) FROM dimension_metadata;
-- Expected: 60

-- Check generation type counts
SELECT generation_type, COUNT(*) 
FROM dimension_metadata 
GROUP BY generation_type;
-- Expected: Prior Generated (8), Mechanically Generated (17), AI Generated (35)

-- Verify all dimensions have required fields
SELECT field_name 
FROM dimension_metadata 
WHERE description IS NULL 
   OR data_type IS NULL 
   OR generation_type IS NULL;
-- Expected: 0 rows (no nulls)

-- Check display_order sequence
SELECT field_name, display_order, generation_type, category
FROM dimension_metadata 
ORDER BY display_order;
-- Expected: Sequential order 1-60
```



+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



### Integration Testing

**End-to-End Workflow:**
1. Upload a document
2. Complete categorization
3. Click "Start Chunking"
4. Wait for dimension generation
5. Navigate to chunk dashboard
6. Click "View All Dimensions" on a chunk
7. Verify all 60 dimensions display
8. Select different run from dropdown
9. Verify data updates
10. Apply filters and sorting
11. Export CSV
12. Verify CSV contents match UI

---

## 📎 APPENDICES

### Appendix A: Dimension Metadata Seed SQL

**Full SQL script to populate `dimension_metadata` table:**



====================================================================================



```sql
-- Dimension Metadata Seed Data
-- 60 total dimensions: 8 Prior + 17 Mechanical + 35 AI

-- Prior Generated (8 dimensions)
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Doc_ID', 'Unique identifier for the source document.', 'string', NULL, 'Prior Generated', 'DOC_2025_001', true, 1, 'Document Metadata'),
('Doc_Title', 'Human-readable title of the document.', 'string', NULL, 'Prior Generated', 'Bright Run Playbook v2', true, 2, 'Document Metadata'),
('Doc_Version', 'Document version tag or semver.', 'string', NULL, 'Prior Generated', 'v1.3.0', false, 3, 'Document Metadata'),
('Source_Type', 'Ingest source format.', 'enum', 'pdf | docx | html | markdown | email | transcript | notion | spreadsheet | image+OCR', 'Prior Generated', 'pdf', true, 4, 'Document Metadata'),
('Source_URL', 'Canonical URL or file path for provenance.', 'string', NULL, 'Prior Generated', 'https://example.com/playbook.pdf', false, 5, 'Document Metadata'),
('Author', 'Document author or organization.', 'string', NULL, 'Prior Generated', 'BRAND Team', false, 6, 'Document Metadata'),
('Doc_Date', 'Date of original authorship or publication.', 'datetime', 'YYYY-MM-DD', 'Prior Generated', '2025-07-15', false, 7, 'Document Metadata'),
('Primary_Category', 'User-centric category (pick one) for business meaning.', 'enum', 'Core IP — Complete System | Core IP — Major System Component | Proprietary Strategy/Method | Proprietary Insight/Framework Fragment | Operational Playbook / Step-by-Step | Signature Story / Origin / Distinctive Narrative | Marketing Narrative — Benefits | Customer Conversation / Proof | External / Third-Party — Non-IP', 'Prior Generated', 'Operational Playbook / Step-by-Step (Author: BRAND)', false, 8, 'Document Metadata');

-- Mechanically Generated (17 dimensions)
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Chunk_ID', 'Stable unique ID for this chunk.', 'string', NULL, 'Mechanically Generated', 'DOC_2025_001#C032', true, 9, 'Document Metadata'),
('Section_Heading', 'Nearest section or heading title.', 'string', NULL, 'Mechanically Generated', 'Stage 2: Categorize Documents', false, 10, 'Document Metadata'),
('Page_Start', 'First page number covered by the chunk.', 'integer', '>=1', 'Mechanically Generated', '12', false, 11, 'Document Metadata'),
('Page_End', 'Last page number covered by the chunk.', 'integer', '>=Page_Start', 'Mechanically Generated', '13', false, 12, 'Document Metadata'),
('Char_Start', 'Character index start in the document (0-based).', 'integer', '>=0', 'Mechanically Generated', '8450', true, 13, 'Document Metadata'),
('Char_End', 'Character index end (exclusive).', 'integer', '>Char_Start', 'Mechanically Generated', '9875', true, 14, 'Document Metadata'),
('Token_Count', 'Model token count for the chunk text.', 'integer', '>=1', 'Mechanically Generated', '512', true, 15, 'Document Metadata'),
('Overlap_Tokens', 'Number of tokens overlapped with previous chunk.', 'integer', '>=0', 'Mechanically Generated', '64', false, 16, 'Document Metadata'),
('Chunk_Handle', 'Short slug/handle for referencing the chunk.', 'string', NULL, 'Mechanically Generated', 'stage2-categorize-overview', false, 17, 'Document Metadata'),
('Embedding_ID', 'Identifier for stored vector embedding.', 'string', NULL, 'Mechanically Generated', 'embed_3f9ac2', false, 52, 'Metadata'),
('Vector_Checksum', 'Checksum/hash for the vector payload.', 'string', NULL, 'Mechanically Generated', 'sha256:7b9...', false, 53, 'Metadata'),
('Label_Source_Auto_Manual_Mixed', 'Provenance of labels.', 'enum', 'auto | manual | mixed', 'Mechanically Generated', 'mixed', false, 54, 'Metadata'),
('Label_Model', 'Model name/version used for auto-labels.', 'string', NULL, 'Mechanically Generated', 'gpt-5-large-2025-09', false, 55, 'Metadata'),
('Labeled_By', 'Human labeler (name/initials) or auto.', 'string', NULL, 'Mechanically Generated', 'auto', false, 56, 'Metadata'),
('Label_Timestamp_ISO', 'Timestamp when labels were created.', 'datetime', 'YYYY-MM-DDThh:mm:ssZ', 'Mechanically Generated', '2025-09-28T15:20:11Z', false, 57, 'Metadata'),
('Review_Status', 'Human QA review status.', 'enum', 'unreviewed | approved | needs_changes | rejected', 'Mechanically Generated', 'unreviewed', false, 58, 'Metadata'),
('Data_Split_Train_Dev_Test', 'Dataset split allocation.', 'enum', 'train | dev | test', 'Mechanically Generated', 'train', false, 60, 'Metadata');

-- AI Generated (35 dimensions)
-- Content Analysis (8)
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Chunk_Type', 'Structural role of the chunk.', 'enum', 'Chapter_Sequential | Instructional_Unit | CER | Example_Scenario', 'AI Generated', 'Instructional_Unit', true, 18, 'Content'),
('Chunk_Summary_1s', 'One-sentence summary (<= 30 words).', 'string', '<= 240 chars', 'AI Generated', 'Explains how to label document chunks for LoRA training and compliance.', true, 19, 'Content'),
('Key_Terms', 'Pipe- or comma-separated salient terms.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'LoRA|brand voice|categorization|instruction-tuning', false, 20, 'Content'),
('Audience', 'Intended reader/user persona.', 'string', NULL, 'AI Generated', 'SMB Owners; Ops Managers', false, 21, 'Content'),
('Intent', 'Author primary intent for this chunk.', 'enum', 'educate | instruct | persuade | inform | narrate | summarize | compare | evaluate', 'AI Generated', 'instruct', false, 22, 'Content'),
('Tone_Voice_Tags', 'Style/voice descriptors.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'authoritative, pragmatic, clear', false, 23, 'Content'),
('Brand_Persona_Tags', 'Brand identity traits relevant to voice.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'trusted advisor, data-driven', false, 24, 'Content'),
('Domain_Tags', 'Topic/domain taxonomy labels.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'B2B Marketing, AI Ops', false, 25, 'Content');

-- Task Extraction (6)
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Task_Name', 'Primary task/procedure name captured by the chunk.', 'string', NULL, 'AI Generated', 'Create Document Categories', false, 26, 'Task'),
('Preconditions', 'Requirements before executing the task.', 'string', NULL, 'AI Generated', 'Access to the Categorization module; documents uploaded', false, 27, 'Task'),
('Inputs', 'Inputs/resources needed to perform the task.', 'string', NULL, 'AI Generated', 'Uploaded PDFs; taxonomy definitions', false, 28, 'Task'),
('Steps_JSON', 'Canonical steps in minimal JSON.', 'json', '[{"step":"...", "details":"..."}]', 'AI Generated', '[{"step":"Open Categorizer"},{"step":"Assign Primary Category"}]', false, 29, 'Task'),
('Expected_Output', 'What success looks like if steps are followed.', 'string', NULL, 'AI Generated', 'Each chunk labeled with Primary Category and Chunk Type', false, 30, 'Task'),
('Warnings_Failure_Modes', 'Known pitfalls and failure conditions.', 'string', NULL, 'AI Generated', 'Mislabeling CER as Example; missing citations', false, 31, 'Task');

-- CER Analysis (5)
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Claim', 'Main assertion stated in this chunk.', 'string', NULL, 'AI Generated', 'Structured chunk labels improve model faithfulness.', false, 32, 'CER'),
('Evidence_Snippets', 'Quoted or paraphrased evidence supporting the claim.', 'list[string]', 'comma/pipe delimited or JSON array', 'AI Generated', '"A/B tests showed 9% fewer hallucinations"', false, 33, 'CER'),
('Reasoning_Sketch', 'High-level rationale (concise; no verbose chain-of-thought).', 'string', NULL, 'AI Generated', 'Labels constrain retrieval and guide selection → more faithful answers.', false, 34, 'CER'),
('Citations', 'Sources/links/DOIs supporting evidence.', 'list[string]', 'comma/pipe delimited', 'AI Generated', 'https://example.com/whitepaper', false, 35, 'CER'),
('Factual_Confidence_0_1', 'Confidence score for factuality (0–1).', 'float', '0.0–1.0', 'AI Generated', '0.85', false, 36, 'CER');

-- Scenario Extraction (5)
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Scenario_Type', 'Type of example or application.', 'enum', 'case_study | dialogue | Q&A | walkthrough | anecdote', 'AI Generated', 'case_study', false, 37, 'Scenario'),
('Problem_Context', 'Real-world context of the example.', 'string', NULL, 'AI Generated', 'Local HVAC company launching a maintenance plan', false, 38, 'Scenario'),
('Solution_Action', 'Action taken in the example.', 'string', NULL, 'AI Generated', 'Applied categorizer; built instruction-tuning pairs', false, 39, 'Scenario'),
('Outcome_Metrics', 'Measured results or KPIs.', 'string', NULL, 'AI Generated', '+18% response rate; 2x faster drafting', false, 40, 'Scenario'),
('Style_Notes', 'Narrative/style attributes to mimic.', 'string', NULL, 'AI Generated', 'Conversational, concrete, with numbers', false, 41, 'Scenario');

-- Training Pair Generation (3)
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Prompt_Candidate', 'Potential user prompt distilled from the chunk.', 'string', NULL, 'AI Generated', 'Draft a step-by-step checklist to categorize documents.', false, 42, 'Training'),
('Target_Answer', 'Ideal answer (concise, brand-aligned).', 'string', NULL, 'AI Generated', 'A numbered checklist with compliance notes.', false, 43, 'Training'),
('Style_Directives', 'Formatting/voice directives for answers.', 'string', NULL, 'AI Generated', 'Use numbered steps; avoid jargon; keep to 150–250 words.', false, 44, 'Training');

-- Risk Assessment (6)
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Safety_Tags', 'Sensitive-topic flags for filtering/guardrails.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'medical_advice, legal_disclaimer', false, 45, 'Risk'),
('Coverage_Tag', 'How central this chunk is to the domain.', 'enum', 'core | supporting | edge', 'AI Generated', 'core', false, 46, 'Risk'),
('Novelty_Tag', 'Whether content is common or unique IP.', 'enum', 'novel | common | disputed', 'AI Generated', 'novel', false, 47, 'Risk'),
('IP_Sensitivity', 'Confidentiality level for IP handling.', 'enum', 'Public | Internal | Confidential | Trade_Secret', 'AI Generated', 'Confidential', false, 48, 'Risk'),
('PII_Flag', 'Indicates presence of personal data.', 'boolean', 'true | false', 'AI Generated', 'FALSE', false, 49, 'Risk'),
('Compliance_Flags', 'Regulatory or policy flags.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'copyright_third_party, trademark', false, 50, 'Risk');

-- Training Metadata (2)
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Include_In_Training_YN', 'Whether to use this chunk in training.', 'boolean', 'Y | N | true | false', 'AI Generated', 'Y', false, 59, 'Metadata'),
('Augmentation_Notes', 'Notes on paraphrase/style/noise augmentation.', 'string', NULL, 'AI Generated', 'Paraphrase x2; style-transfer to friendly', false, 61, 'Metadata');
```



+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



**Verification:**



====================================================================================



```sql
SELECT generation_type, COUNT(*) 
FROM dimension_metadata 
GROUP BY generation_type;

-- Expected output:
-- AI Generated          | 35
-- Mechanically Generated | 17
-- Prior Generated        |  8
```



+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



### Appendix B: File Structure After Implementation

```
chunks-alpha/
├── src/
│   ├── app/
│   │   └── chunks/
│   │       └── [documentId]/
│   │           ├── page.tsx                           (UPDATED - added button)
│   │           └── dimensions/
│   │               └── [chunkId]/
│   │                   └── page.tsx                   (NEW)
│   ├── components/
│   │   ├── chunks/
│   │   │   ├── ChunkSpreadsheet.tsx                   (EXISTING - unchanged)
│   │   │   ├── RunComparison.tsx                      (EXISTING - unchanged)
│   │   │   ├── ErrorBoundary.tsx                      (EXISTING - unchanged)
│   │   │   └── DimensionValidationSheet.tsx           (NEW)
│   │   └── ui/                                         (EXISTING - unchanged)
│   ├── lib/
│   │   ├── chunk-service.ts                            (EXISTING - unchanged)
│   │   ├── dimension-metadata.ts                       (NEW)
│   │   ├── dimension-classifier.ts                     (NEW)
│   │   └── dimension-service.ts                        (NEW)
│   └── types/
│       └── chunks.ts                                    (EXISTING - unchanged)
└── system/
    └── chunks-alpha-data/
        ├── document-metadata-dictionary.csv             (EXISTING)
        ├── document-metadata-dictionary-gen-AI-processing-required_v1.csv    (EXISTING)
        ├── document-metadata-dictionary-mechanically-generated_v1.csv        (EXISTING)
        └── document-metadata-dictionary-previously-generated_v1.csv          (EXISTING)
```

**New Files: 4**
**Updated Files: 1** (`src/app/chunks/[documentId]/page.tsx` - one button added)
**Unchanged Files:** All other existing files remain untouched

---

## 📝 SUMMARY

### What This Spec Delivers

✅ **Complete dimension validation spreadsheet** with all 60 dimensions displayed as rows  
✅ **Generation type classification** (8 Prior, 17 Mechanical, 35 AI)  
✅ **Dimension metadata integration** (Description, Type, Allowed_Values)  
✅ **Confidence scoring display** (Precision and Accuracy as raw values 1-10)  
✅ **Historical run management** (dropdown selector per chunk, NOT side-by-side comparison)  
✅ **Sorting and filtering** (by field name, type, confidence)  
✅ **Compact spreadsheet design** (minimal spacing, fixed row heights)  
✅ **Column width presets** (Small/Medium/Large)  
✅ **CSV export** (all columns, proper formatting)  
✅ **Modular implementation** (no breaking changes to existing code)  

### Implementation Phases

| Phase | Duration | Who | What |
|-------|----------|-----|------|
| 1 | 30-45 min | Human | Database: Create `dimension_metadata` table + seed data |
| 2 | 2-3 hours | AI | Code: Data layer (metadata, classifier, service) |
| 3 | 3-4 hours | AI | Code: UI components + pages |

**Total: 6-8 hours**

### Risk Management

- ✅ **Zero impact** on existing features (new components only)
- ✅ **Additive database changes** (no destructive operations)
- ✅ **Independent testing** at each phase
- ✅ **Easy rollback** (delete files + drop table)

### Next Steps

1. **Human:** Execute Phase 1 (database setup) - 30-45 minutes
2. **Verify:** Run SQL verification queries
3. **AI:** Execute Phase 2 prompt (data layer) - 2-3 hours
4. **Test:** Verify data layer works (fetch dimensions, metadata joins)
5. **AI:** Execute Phase 3 prompt (UI layer) - 3-4 hours
6. **Test:** Full end-to-end testing using checklist
7. **Deploy:** Merge to production

---

**END OF SPECIFICATION**

**Version:** 2.0 (IMPROVED)  
**Date:** October 7, 2025  
**Status:** Ready for Implementation  
**Improvements:**
- ✅ All necessary context embedded in prompts
- ✅ Clear SQL and prompt delineation with === and +++ markers
- ✅ Detailed codebase context included
- ✅ Specific implementation details for confidence scoring
- ✅ Field mapping instructions for chunks table vs chunk_dimensions table
- ✅ Run selector instructions clarified (per-chunk dropdown, not side-by-side)
- ✅ CSV structure and formatting details included
- ✅ Comprehensive success criteria and checklists

---

