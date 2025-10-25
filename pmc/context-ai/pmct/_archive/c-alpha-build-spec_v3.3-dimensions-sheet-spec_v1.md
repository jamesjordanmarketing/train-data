# Chunks Alpha - Dimensions Results Spreadsheet
## Complete Build Specification v1.0

**Date:** October 7, 2025  
**Module:** Chunks Alpha - Dimension Validation Spreadsheet  
**Status:** Ready for Implementation  
**Target:** Claude Sonnet 4.5 (200k context)

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
- ✅ Database schema with all 60 dimension fields
- ✅ AI dimension generation pipeline operational
- ✅ Run management and historicaltracking working
- ✅ API endpoints functional
- ⚠️ Missing: Dimension metadata integration
- ⚠️ Missing: Generation type classification
- ⚠️ Missing: Per-chunk 60-dimension validation view

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

**1. Content Analysis (7 dimensions) - 1 prompt**
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

**7. Training Metadata (3 dimensions) - Defaults, no AI needed**
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

#### 2. New Database VIEW: `chunk_dimensions_full`

**Purpose:** Join chunk dimensions with metadata for easy querying

```sql
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
  
  -- Dimensions with metadata (using json_build_object for each field)
  json_build_object(
    'field_name', 'Doc_ID',
    'value', cd.doc_id,
    'generation_type', dm_doc_id.generation_type,
    'precision_confidence', CASE WHEN dm_doc_id.generation_type = 'AI Generated' 
                                 THEN cd.generation_confidence_precision ELSE 10.0 END,
    'accuracy_confidence', CASE WHEN dm_doc_id.generation_type = 'AI Generated' 
                                THEN cd.generation_confidence_accuracy ELSE 10.0 END,
    'description', dm_doc_id.description,
    'data_type', dm_doc_id.data_type,
    'allowed_values_format', dm_doc_id.allowed_values_format
  ) as doc_id_meta,
  
  -- Repeat for all 60 dimensions...
  -- (Full SQL in Appendix A)
  
  cd.generation_cost_usd,
  cd.generation_duration_ms,
  cd.generated_at
FROM chunk_dimensions cd
LEFT JOIN chunks c ON c.id = cd.chunk_id
LEFT JOIN documents d ON d.id = c.document_id
LEFT JOIN chunk_runs cr ON cr.run_id = cd.run_id
LEFT JOIN dimension_metadata dm_doc_id ON dm_doc_id.field_name = 'Doc_ID'
-- Repeat LEFT JOINs for all dimension_metadata records
ORDER BY cd.generated_at DESC;
```

**Note:** The full VIEW SQL is complex (60 joins). Alternative approach: Query data in application layer and join in TypeScript/React.

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
  // Prior Generated (8)
  Doc_ID: {
    fieldName: 'Doc_ID',
    description: 'Unique identifier for the source document.',
    dataType: 'string',
    allowedValuesFormat: null,
    generationType: 'Prior Generated',
    exampleValue: 'DOC_2025_001',
    isRequired: true,
    displayOrder: 1,
    category: 'Document Metadata'
  },
  // ... (all 60 dimensions)
};

export const DIMENSIONS_BY_TYPE = {
  'Prior Generated': [
    'Doc_ID', 'Doc_Title', 'Doc_Version', 'Source_Type', 
    'Source_URL', 'Author', 'Doc_Date', 'Primary_Category'
  ],
  'Mechanically Generated': [
    'Chunk_ID', 'Section_Heading', 'Page_Start', 'Page_End',
    'Char_Start', 'Char_End', 'Token_Count', 'Overlap_Tokens',
    'Chunk_Handle', 'Embedding_ID', 'Vector_Checksum',
    'Label_Source_Auto_Manual_Mixed', 'Label_Model', 'Labeled_By',
    'Label_Timestamp_ISO', 'Review_Status', 'Data_Split_Train_Dev_Test'
  ],
  'AI Generated': [
    // Content Analysis
    'Chunk_Type', 'Chunk_Summary_1s', 'Key_Terms', 'Audience',
    'Intent', 'Tone_Voice_Tags', 'Brand_Persona_Tags', 'Domain_Tags',
    // Task Extraction
    'Task_Name', 'Preconditions', 'Inputs', 'Steps_JSON',
    'Expected_Output', 'Warnings_Failure_Modes',
    // CER Analysis
    'Claim', 'Evidence_Snippets', 'Reasoning_Sketch', 'Citations',
    'Factual_Confidence_0_1',
    // Scenario Extraction
    'Scenario_Type', 'Problem_Context', 'Solution_Action',
    'Outcome_Metrics', 'Style_Notes',
    // Training Pair Generation
    'Prompt_Candidate', 'Target_Answer', 'Style_Directives',
    // Risk Assessment
    'Safety_Tags', 'Coverage_Tag', 'Novelty_Tag', 'IP_Sensitivity',
    'PII_Flag', 'Compliance_Flags',
    // Training Metadata
    'Include_In_Training_YN', 'Augmentation_Notes'
  ]
};

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

### 2. Dimension Classifier (`src/lib/dimension-classifier.ts`)

**Purpose:** Utility functions for dimension classification and confidence scoring

```typescript
import { DIMENSION_METADATA, DIMENSIONS_BY_TYPE } from './dimension-metadata';
import { ChunkDimensions } from '../types/chunks';

export function getGenerationType(fieldName: string): string {
  const metadata = DIMENSION_METADATA[fieldName];
  return metadata?.generationType || 'Unknown';
}

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

export function isPopulated(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
}

export function getPopulatedPercentage(dimensions: ChunkDimensions): number {
  const allDimensions = Object.keys(DIMENSION_METADATA);
  const populatedCount = allDimensions.filter(fieldName => {
    const value = (dimensions as any)[fieldName];
    return isPopulated(value);
  }).length;
  
  return Math.round((populatedCount / allDimensions.length) * 100);
}

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

### 3. Dimension Service (`src/lib/dimension-service.ts`)

**Purpose:** Data access layer for dimensions with metadata joined

```typescript
import { supabase } from './supabase';
import { ChunkDimensions, Chunk, ChunkRun } from '../types/chunks';
import { DIMENSION_METADATA, getAllDimensions } from './dimension-metadata';
import { getGenerationType, getConfidenceForDimension } from './dimension-classifier';

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
  // Get full dimension validation data for a chunk and run
  async getDimensionValidationData(
    chunkId: string,
    runId: string
  ): Promise<DimensionValidationData | null> {
    // Get chunk
    const { data: chunk, error: chunkError } = await supabase
      .from('chunks')
      .select('*')
      .eq('id', chunkId)
      .single();
    
    if (chunkError || !chunk) return null;
    
    // Get dimensions for this chunk and run
    const { data: dimensions, error: dimError } = await supabase
      .from('chunk_dimensions')
      .select('*')
      .eq('chunk_id', chunkId)
      .eq('run_id', runId)
      .single();
    
    if (dimError || !dimensions) return null;
    
    // Get run
    const { data: run, error: runError } = await supabase
      .from('chunk_runs')
      .select('*')
      .eq('run_id', runId)
      .single();
    
    if (runError || !run) return null;
    
    // Get document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', chunk.document_id)
      .single();
    
    if (docError || !document) return null;
    
    // Build dimension rows
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
    
    // Calculate statistics
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
    const { data: chunk } = await supabase
      .from('chunks')
      .select('document_id')
      .eq('id', chunkId)
      .single();
    
    if (!chunk) return [];
    
    // Get all runs for this document
    const { data: runs } = await supabase
      .from('chunk_runs')
      .select('*')
      .eq('document_id', chunk.document_id)
      .order('started_at', { ascending: false });
    
    if (!runs) return [];
    
    // Check which runs have data for this chunk
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
    
    return runsWithStatus.filter(r => r.hasData);
  }
};
```

### 4. Dimension Validation Sheet Component (`src/components/chunks/DimensionValidationSheet.tsx`)

**Purpose:** Main spreadsheet component displaying all 60 dimensions as rows

```typescript
'use client'

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  ArrowUpDown, Search, Filter, Download, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { DimensionRow } from '../../lib/dimension-service';
import { toast } from 'sonner';

interface DimensionValidationSheetProps {
  dimensionRows: DimensionRow[];
  documentName: string;
  chunkName: string;
  runTimestamp: string;
}

export function DimensionValidationSheet({ 
  dimensionRows, 
  documentName, 
  chunkName, 
  runTimestamp 
}: DimensionValidationSheetProps) {
  const [sortField, setSortField] = useState<keyof DimensionRow>('displayOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [columnSize, setColumnSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [exporting, setExporting] = useState(false);

  // Column width presets
  const columnWidths = {
    small: { name: 'w-32', value: 'w-48', other: 'w-24' },
    medium: { name: 'w-48', value: 'w-64', other: 'w-32' },
    large: { name: 'w-64', value: 'w-96', other: 'w-40' }
  };

  // Filtered and sorted rows
  const processedRows = useMemo(() => {
    let filtered = [...dimensionRows];

    // Filter by text search
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      filtered = filtered.filter(row =>
        row.fieldName.toLowerCase().includes(searchLower) ||
        row.description.toLowerCase().includes(searchLower) ||
        String(row.value).toLowerCase().includes(searchLower)
      );
    }

    // Filter by generation type
    if (filterType !== 'all') {
      filtered = filtered.filter(row => row.generationType === filterType);
    }

    // Filter by confidence level
    if (filterConfidence === 'high') {
      filtered = filtered.filter(row => row.accuracyConfidence >= 8);
    } else if (filterConfidence === 'low') {
      filtered = filtered.filter(row => row.accuracyConfidence < 8);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [dimensionRows, sortField, sortDirection, filterText, filterType, filterConfidence]);

  const handleSort = (field: keyof DimensionRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Build CSV
      const headers = [
        'Chunk Dimension',
        'Document Name (last run)',
        'Generated Value',
        'What Generated TYPE',
        'Precision Confidence Level',
        'Accuracy Confidence Level',
        'Description',
        'Type',
        'Allowed Values Format'
      ];
      
      const documentInfo = `${documentName} - ${chunkName} - ${runTimestamp}`;
      
      const rows = processedRows.map(row => [
        row.fieldName,
        documentInfo,
        formatValueForCSV(row.value),
        row.generationType,
        row.precisionConfidence,
        row.accuracyConfidence,
        row.description,
        row.dataType,
        row.allowedValuesFormat || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chunkName}_dimensions_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const formatValueForCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.join(' | ');
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 8) return 'text-green-600 bg-green-50';
    if (confidence >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getTypeColor = (type: string): string => {
    if (type === 'AI Generated') return 'bg-purple-100 text-purple-800';
    if (type === 'Mechanically Generated') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dimensions..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="AI Generated">AI Generated</SelectItem>
            <SelectItem value="Mechanically Generated">Mechanically Generated</SelectItem>
            <SelectItem value="Prior Generated">Prior Generated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterConfidence} onValueChange={setFilterConfidence}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by confidence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Confidence Levels</SelectItem>
            <SelectItem value="high">High (≥80%)</SelectItem>
            <SelectItem value="low">Low (<80%)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={columnSize} onValueChange={(val) => setColumnSize(val as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Column size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleExport} disabled={exporting} variant="outline">
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export CSV
        </Button>
      </div>

      {/* Spreadsheet */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          <Table className="text-sm">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="border-b-2">
                <TableHead 
                  className={`${columnWidths[columnSize].name} cursor-pointer hover:bg-muted/50`}
                  onClick={() => handleSort('fieldName')}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    Chunk Dimension
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className={columnWidths[columnSize].value}>
                  Generated Value
                </TableHead>
                <TableHead 
                  className={`${columnWidths[columnSize].other} cursor-pointer hover:bg-muted/50`}
                  onClick={() => handleSort('generationType')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className={`${columnWidths[columnSize].other} cursor-pointer hover:bg-muted/50`}
                  onClick={() => handleSort('precisionConfidence')}
                >
                  <div className="flex items-center gap-2">
                    Precision
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className={`${columnWidths[columnSize].other} cursor-pointer hover:bg-muted/50`}
                  onClick={() => handleSort('accuracyConfidence')}
                >
                  <div className="flex items-center gap-2">
                    Accuracy
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className={columnWidths[columnSize].value}>
                  Description
                </TableHead>
                <TableHead className={columnWidths[columnSize].other}>
                  Data Type
                </TableHead>
                <TableHead className={columnWidths[columnSize].other}>
                  Allowed Format
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No dimensions found matching filters
                  </TableCell>
                </TableRow>
              ) : (
                processedRows.map((row) => (
                  <TableRow key={row.fieldName} className="hover:bg-muted/50">
                    <TableCell className="font-medium py-2">
                      {row.fieldName}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="truncate max-w-full" title={formatValue(row.value)}>
                        {formatValue(row.value)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className={getTypeColor(row.generationType)}>
                        {row.generationType.split(' ')[0]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(row.precisionConfidence)}`}>
                        {row.precisionConfidence.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(row.accuracyConfidence)}`}>
                        {row.accuracyConfidence.toFixed(1)}
                        {row.accuracyConfidence >= 8 && <CheckCircle className="h-3 w-3" />}
                        {row.accuracyConfidence < 8 && <AlertCircle className="h-3 w-3" />}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      <div className="truncate max-w-full" title={row.description}>
                        {row.description}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs">
                      {row.dataType}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {row.allowedValuesFormat || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {processedRows.length} of {dimensionRows.length} dimensions
        </span>
        <div className="flex items-center gap-4">
          <span>
            Populated: {dimensionRows.filter(r => r.value !== null && r.value !== undefined && r.value !== '').length}/{dimensionRows.length}
          </span>
          <span>
            High Confidence (≥8.0): {dimensionRows.filter(r => r.accuracyConfidence >= 8).length}
          </span>
        </div>
      </div>
    </div>
  );
}
```

### 5. Dimension Validation Page (`src/app/chunks/[documentId]/dimensions/[chunkId]/page.tsx`)

**Purpose:** Page component that wraps the validation sheet with header, run selector, and stats

```typescript
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Badge } from '../../../../../components/ui/badge';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { DimensionValidationSheet } from '../../../../../components/chunks/DimensionValidationSheet';
import { dimensionService, DimensionValidationData } from '../../../../../lib/dimension-service';
import { ChunkRun } from '../../../../../types/chunks';
import { toast } from 'sonner';

export default function DimensionValidationPage({ 
  params 
}: { 
  params: { documentId: string; chunkId: string } 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DimensionValidationData | null>(null);
  const [availableRuns, setAvailableRuns] = useState<Array<{ run: ChunkRun; hasData: boolean }>>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');

  useEffect(() => {
    loadRuns();
  }, [params.chunkId]);

  useEffect(() => {
    if (selectedRunId) {
      loadData(selectedRunId);
    }
  }, [selectedRunId]);

  const loadRuns = async () => {
    try {
      const runs = await dimensionService.getRunsForChunk(params.chunkId);
      setAvailableRuns(runs);
      
      // Select the most recent run by default
      if (runs.length > 0) {
        setSelectedRunId(runs[0].run.run_id);
      } else {
        toast.error('No dimension data found for this chunk');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading runs:', error);
      toast.error('Failed to load runs');
      setLoading(false);
    }
  };

  const loadData = async (runId: string) => {
    setLoading(true);
    try {
      const validationData = await dimensionService.getDimensionValidationData(
        params.chunkId,
        runId
      );
      
      if (validationData) {
        setData(validationData);
      } else {
        toast.error('Failed to load dimension data');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dimension data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    toast.info('Regeneration feature coming soon');
    // TODO: Implement regeneration API call
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">No dimension data available</p>
              <Button 
                onClick={() => router.push(`/chunks/${params.documentId}`)} 
                className="mt-4"
              >
                Back to Chunks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { chunk, dimensions, run, document, dimensionRows, populatedPercentage, averagePrecision, averageAccuracy } = data;
  
  const pageTitle = `${document.title} - ${chunk.chunk_handle || `Chunk ${chunk.chunk_id}`} - ${new Date(run.started_at).toLocaleString()}`;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push(`/chunks/${params.documentId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dimension Validation - {dimensionRows.length} Total Dimensions
            </p>
          </div>
        </div>
        
        <Button onClick={handleRegenerate} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
      </div>

      {/* Run Selector + Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Run Selection & Statistics</CardTitle>
            <Select value={selectedRunId} onValueChange={setSelectedRunId}>
              <SelectTrigger className="w-[400px]">
                <SelectValue placeholder="Select a run" />
              </SelectTrigger>
              <SelectContent>
                {availableRuns.map(({ run }) => (
                  <SelectItem key={run.run_id} value={run.run_id}>
                    {new Date(run.started_at).toLocaleString()} - {run.ai_model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Percent className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Populated</div>
                <div className="text-2xl font-bold">{populatedPercentage}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Precision</div>
                <div className="text-2xl font-bold">{averagePrecision.toFixed(1)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Accuracy</div>
                <div className="text-2xl font-bold">{averageAccuracy.toFixed(1)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  {dimensionRows.filter(r => r.accuracyConfidence < 8).length} Need Review
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              {dimensionRows.filter(r => r.generationType === 'AI Generated').length} AI Generated
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {dimensionRows.filter(r => r.generationType === 'Mechanically Generated').length} Mechanical
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              {dimensionRows.filter(r => r.generationType === 'Prior Generated').length} Prior
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Spreadsheet */}
      <Card>
        <CardHeader>
          <CardTitle>All Dimensions</CardTitle>
        </CardHeader>
        <CardContent>
          <DimensionValidationSheet
            dimensionRows={dimensionRows}
            documentName={document.title}
            chunkName={chunk.chunk_handle || `Chunk ${chunk.chunk_id}`}
            runTimestamp={new Date(run.started_at).toLocaleString()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. Update Chunk Dashboard (`src/app/chunks/[documentId]/page.tsx`)

**Purpose:** Add "View All Dimensions" button to each chunk card

**Changes:**
1. Add a button after the existing "Detail View" button
2. Link to `/chunks/[documentId]/dimensions/[chunkId]`

```typescript
// Add this button in the chunk card actions section (around line 390-400)
<Button
  variant="outline"
  size="sm"
  onClick={() => router.push(`/chunks/${params.documentId}/dimensions/${chunk.id}`)}
>
  <Grid3x3 className="h-4 w-4 mr-2" />
  View All Dimensions
</Button>
```

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

**Task 1.2: Seed Dimension Metadata**

See **Appendix A** for full seed SQL (60 INSERT statements). Copy and paste into Supabase SQL Editor.

**Task 1.3: Verify Data**

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

**Checkpoint:** ✅ Database table created, seeded, and verified

---

## 🤖 AI BUILD PROMPTS

### Phase 2: Data Layer Implementation (2-3 hours)

**Status:** Ready to copy-paste into Claude Sonnet 4.5 Cursor

---

#### **PROMPT 2.1: Data Layer Implementation**

```
CONTEXT:
You are building the data layer for a dimension validation spreadsheet feature in the Chunks Alpha module. The database schema has been updated with a new `dimension_metadata` table containing metadata for all 60 chunk dimensions.

OBJECTIVE:
Create the TypeScript data layer that:
1. Provides dimension metadata constants
2. Implements generation type classification logic
3. Builds a service layer to fetch and join dimension data with metadata

REQUIREMENTS:

1. Create `src/lib/dimension-metadata.ts`:
   - Define `DimensionMetadata` interface matching the database schema
   - Create `DIMENSION_METADATA` constant object with all 60 dimensions
   - Implement helper functions:
     - `getDimensionMetadata(fieldName: string): DimensionMetadata | null`
     - `getAllDimensions(): DimensionMetadata[]`
     - `getDimensionsByType(type: string): DimensionMetadata[]`
     - `getDimensionsByCategory(category: string): DimensionMetadata[]`

2. Dimension data structure (60 dimensions total):

   **Prior Generated (8):** Doc_ID, Doc_Title, Doc_Version, Source_Type, Source_URL, Author, Doc_Date, Primary_Category
   
   **Mechanically Generated (17):** Chunk_ID, Section_Heading, Page_Start, Page_End, Char_Start, Char_End, Token_Count, Overlap_Tokens, Chunk_Handle, Embedding_ID, Vector_Checksum, Label_Source_Auto_Manual_Mixed, Label_Model, Labeled_By, Label_Timestamp_ISO, Review_Status, Data_Split_Train_Dev_Test
   
   **AI Generated (35):** Chunk_Type, Chunk_Summary_1s, Key_Terms, Audience, Intent, Tone_Voice_Tags, Brand_Persona_Tags, Domain_Tags, Task_Name, Preconditions, Inputs, Steps_JSON, Expected_Output, Warnings_Failure_Modes, Claim, Evidence_Snippets, Reasoning_Sketch, Citations, Factual_Confidence_0_1, Scenario_Type, Problem_Context, Solution_Action, Outcome_Metrics, Style_Notes, Prompt_Candidate, Target_Answer, Style_Directives, Safety_Tags, Coverage_Tag, Novelty_Tag, IP_Sensitivity, PII_Flag, Compliance_Flags, Include_In_Training_YN, Augmentation_Notes

3. Import metadata from `system/chunks-alpha-data/document-metadata-dictionary.csv` for descriptions, types, and allowed_values_format.

4. Create `src/lib/dimension-classifier.ts`:
   - Implement `getGenerationType(fieldName: string): string`
   - Implement `getConfidenceForDimension(fieldName: string, dimensions: ChunkDimensions)`:
     - Return {precision: 10.0, accuracy: 10.0} for Prior/Mechanical
     - Return stored confidence scores for AI Generated
   - Implement `isPopulated(value: any): boolean`
   - Implement `getPopulatedPercentage(dimensions: ChunkDimensions): number`
   - Implement `getAverageConfidence(dimensions: ChunkDimensions)` (only for AI dimensions)

5. Create `src/lib/dimension-service.ts`:
   - Define `DimensionRow` interface (fieldName, value, generationType, precisionConfidence, accuracyConfidence, description, dataType, allowedValuesFormat, category, displayOrder)
   - Define `DimensionValidationData` interface (chunk, dimensions, run, document, dimensionRows[], populatedPercentage, averagePrecision, averageAccuracy)
   - Implement `dimensionService.getDimensionValidationData(chunkId, runId)`:
     - Fetch chunk, dimensions, run, and document from Supabase
     - Build dimensionRows array by iterating through all 60 dimensions
     - Join each dimension value with its metadata
     - Calculate statistics (populated %, avg confidence)
   - Implement `dimensionService.getRunsForChunk(chunkId)`:
     - Get all runs for the chunk's document
     - Check which runs have data for this specific chunk
     - Return runs with hasData flag

6. Use existing Supabase client from `src/lib/supabase.ts`
7. Use existing types from `src/types/chunks.ts`
8. Follow TypeScript strict mode
9. Include proper error handling and null checks
10. Add JSDoc comments for all public functions

CONSTRAINTS:
- Do NOT modify any existing files except to create these new ones
- Do NOT modify database schema (already done by human)
- Do NOT modify existing chunk services or API endpoints
- Follow the existing code style and patterns in `src/lib/chunk-service.ts`

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

Begin implementation. Create all three files with complete, production-ready code.
```

---

### Phase 3: UI Components & Pages (3-4 hours)

**Status:** Ready to copy-paste into Claude Sonnet 4.5 Cursor (execute AFTER Phase 2 is complete)

---

#### **PROMPT 3.1: Dimension Validation Spreadsheet UI**

```
CONTEXT:
You are building the dimension validation spreadsheet UI for the Chunks Alpha module. The data layer has been implemented in Phase 2 and is ready to use.

OBJECTIVE:
Create the UI components and pages for the dimension validation spreadsheet that displays all 60 dimensions as rows with metadata columns.

REQUIREMENTS:

1. Create `src/components/chunks/DimensionValidationSheet.tsx`:
   - Accept props: dimensionRows[], documentName, chunkName, runTimestamp
   - Display dimensions as ROWS (not columns)
   - Columns: Chunk Dimension, Generated Value, Type, Precision, Accuracy, Description, Data Type, Allowed Format
   - Fixed row height, compact styling (text-sm, py-2 for cells)
   - Sortable columns: Field Name, Generation Type, Precision, Accuracy
   - Filters:
     - Text search (searches field name, description, value)
     - Generation type dropdown (All, AI Generated, Mechanically Generated, Prior Generated)
     - Confidence level dropdown (All, High ≥8.0, Low <8.0)
   - Column width presets (Small, Medium, Large) via dropdown
   - CSV export button with loading state
   - Color-coded confidence scores:
     - ≥8.0: green background
     - 6.0-7.9: yellow background
     - <6.0: orange background
   - Color-coded generation type badges:
     - AI Generated: purple badge
     - Mechanically Generated: blue badge
     - Prior Generated: gray badge
   - Display value formatting:
     - Arrays: join with ', '
     - Booleans: 'Yes' / 'No'
     - Objects: JSON.stringify
     - Null/undefined: '-'
   - Summary footer showing filtered count and high confidence count

2. Create `src/app/chunks/[documentId]/dimensions/[chunkId]/page.tsx`:
   - Page header with back button and title
   - Title format: "{Document Name} - {Chunk Name} - {Run Timestamp}"
   - Run selector dropdown:
     - Fetch all runs for this chunk using `dimensionService.getRunsForChunk()`
     - Default to most recent run
     - onChange: reload data for selected run
   - Statistics card with 4 metrics:
     - Populated percentage (with Percent icon, blue)
     - Average Precision (with TrendingUp icon, green)
     - Average Accuracy (with TrendingUp icon, purple)
     - Needs Review count (with Badge, orange)
   - Type distribution badges (AI/Mechanical/Prior counts)
   - Regenerate button (shows toast "Coming soon" for now)
   - Loading skeletons for initial load
   - Error handling with friendly messages
   - Integration with DimensionValidationSheet component

3. Update `src/app/chunks/[documentId]/page.tsx`:
   - Add "View All Dimensions" button to each chunk card
   - Place after existing "Detail View" button
   - Icon: Grid3x3 from lucide-react
   - Navigate to `/chunks/${documentId}/dimensions/${chunk.id}`
   - Use existing Button and router imports

4. Use shadcn/ui components:
   - Table, TableHeader, TableRow, TableHead, TableBody, TableCell
   - Card, CardHeader, CardTitle, CardContent
   - Button, Badge, Input, Select
   - Skeleton for loading states
   - Use existing imports from components/ui

5. Import services:
   - `dimensionService` from `src/lib/dimension-service.ts`
   - Types from `src/types/chunks.ts`

6. Styling:
   - Compact table: text-sm, py-2 padding, fixed row heights
   - Sticky table header with z-10
   - Max height: calc(100vh-300px) for scrollable area
   - Hover effects on sortable columns
   - Responsive design (handle mobile with horizontal scroll)

7. Toast notifications using `sonner`:
   - Success: "CSV exported successfully"
   - Error: "Failed to load dimension data"
   - Info: "Regeneration feature coming soon"

CONSTRAINTS:
- Do NOT modify existing components (ChunkSpreadsheet.tsx, RunComparison.tsx)
- Do NOT modify existing API endpoints
- Do NOT modify database schema
- Minimal changes to existing chunk dashboard (only add one button)
- Follow existing UI patterns from chunk dashboard
- Use existing shadcn/ui theme and components

FILES TO CREATE:
1. src/components/chunks/DimensionValidationSheet.tsx
2. src/app/chunks/[documentId]/dimensions/[chunkId]/page.tsx
3. src/app/chunks/[documentId]/dimensions/[chunkId]/layout.tsx (if needed for page wrapper)

FILES TO UPDATE:
1. src/app/chunks/[documentId]/page.tsx (add "View All Dimensions" button)

SUCCESS CRITERIA:
- All 60 dimensions display correctly as rows
- Sorting and filtering work smoothly
- Run selector switches data correctly
- CSV export generates proper file
- Compact spreadsheet styling matches specification
- Navigation from chunk dashboard works
- TypeScript compiles without errors
- No console errors in browser

Begin implementation. Create all components with complete, production-ready code.
```

---

## ✅ TESTING & VALIDATION

### Manual Testing Checklist

**Phase 2 Testing (Data Layer):**
- [ ] `dimension-metadata.ts` exports all 60 dimensions
- [ ] `getDimensionMetadata()` returns correct metadata for each field
- [ ] `getDimensionsByType()` returns correct counts (8, 17, 35)
- [ ] `getConfidenceForDimension()` returns 10.0 for non-AI dimensions
- [ ] `dimensionService.getDimensionValidationData()` successfully fetches and joins data
- [ ] `dimensionService.getRunsForChunk()` returns correct run list

**Phase 3 Testing (UI):**
- [ ] Navigate to `/chunks/[documentId]` and see "View All Dimensions" button
- [ ] Click button navigates to `/chunks/[documentId]/dimensions/[chunkId]`
- [ ] Page loads and displays all 60 dimensions as rows
- [ ] Run selector shows all available runs
- [ ] Selecting different run updates the spreadsheet
- [ ] Statistics card shows correct metrics (populated %, avg confidence)
- [ ] Sort by Field Name works (asc/desc)
- [ ] Sort by Precision Confidence works (asc/desc)
- [ ] Sort by Accuracy Confidence works (asc/desc)
- [ ] Filter by generation type (AI/Mechanical/Prior) works
- [ ] Filter by confidence level (High/Low) works
- [ ] Text search filters dimensions correctly
- [ ] Column size selector (S/M/L) changes column widths
- [ ] CSV export downloads correct file
- [ ] Confidence scores are color-coded correctly (green/yellow/orange)
- [ ] Generation type badges are color-coded correctly
- [ ] Values format correctly (arrays, booleans, objects)
- [ ] Compact styling (small text, minimal padding)
- [ ] Responsive on mobile (horizontal scroll works)
- [ ] No TypeScript errors
- [ ] No console errors

### Database Verification Queries

```sql
-- Verify dimension_metadata table
SELECT COUNT(*) FROM dimension_metadata;
-- Expected: 60

-- Check generation type counts
SELECT generation_type, COUNT(*) 
FROM dimension_metadata 
GROUP BY generation_type;
-- Expected: Prior (8), Mechanical (17), AI (35)

-- Verify all dimensions have required fields
SELECT field_name 
FROM dimension_metadata 
WHERE description IS NULL 
   OR data_type IS NULL 
   OR generation_type IS NULL;
-- Expected: 0 rows (no nulls)
```

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
('Doc_Date', 'Date of original authorship or publication.', 'string', 'YYYY-MM-DD', 'Prior Generated', '2025-07-15', false, 7, 'Document Metadata'),
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
('Label_Timestamp_ISO', 'Timestamp when labels were created.', 'string', 'YYYY-MM-DDThh:mm:ssZ', 'Mechanically Generated', '2025-09-28T15:20:11Z', false, 57, 'Metadata'),
('Review_Status', 'Human QA review status.', 'enum', 'unreviewed | approved | needs_changes | rejected', 'Mechanically Generated', 'unreviewed', false, 58, 'Metadata'),
('Data_Split_Train_Dev_Test', 'Dataset split allocation.', 'enum', 'train | dev | test', 'Mechanically Generated', 'train', false, 60, 'Metadata');

-- AI Generated (35 dimensions)
-- Content Analysis
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Chunk_Type', 'Structural role of the chunk.', 'enum', 'Chapter_Sequential | Instructional_Unit | CER | Example_Scenario', 'AI Generated', 'Instructional_Unit', true, 18, 'Content'),
('Chunk_Summary_1s', 'One-sentence summary (<= 30 words).', 'string', '<= 240 chars', 'AI Generated', 'Explains how to label document chunks for LoRA training and compliance.', true, 19, 'Content'),
('Key_Terms', 'Pipe- or comma-separated salient terms.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'LoRA|brand voice|categorization|instruction-tuning', false, 20, 'Content'),
('Audience', 'Intended reader/user persona.', 'string', NULL, 'AI Generated', 'SMB Owners; Ops Managers', false, 21, 'Content'),
('Intent', 'Author primary intent for this chunk.', 'enum', 'educate | instruct | persuade | inform | narrate | summarize | compare | evaluate', 'AI Generated', 'instruct', false, 22, 'Content'),
('Tone_Voice_Tags', 'Style/voice descriptors.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'authoritative, pragmatic, clear', false, 23, 'Content'),
('Brand_Persona_Tags', 'Brand identity traits relevant to voice.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'trusted advisor, data-driven', false, 24, 'Content'),
('Domain_Tags', 'Topic/domain taxonomy labels.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'B2B Marketing, AI Ops', false, 25, 'Content');

-- Task Extraction
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Task_Name', 'Primary task/procedure name captured by the chunk.', 'string', NULL, 'AI Generated', 'Create Document Categories', false, 26, 'Task'),
('Preconditions', 'Requirements before executing the task.', 'string', NULL, 'AI Generated', 'Access to the Categorization module; documents uploaded', false, 27, 'Task'),
('Inputs', 'Inputs/resources needed to perform the task.', 'string', NULL, 'AI Generated', 'Uploaded PDFs; taxonomy definitions', false, 28, 'Task'),
('Steps_JSON', 'Canonical steps in minimal JSON.', 'json', '[{"step":"...", "details":"..."}]', 'AI Generated', '[{"step":"Open Categorizer"},{"step":"Assign Primary Category"}]', false, 29, 'Task'),
('Expected_Output', 'What success looks like if steps are followed.', 'string', NULL, 'AI Generated', 'Each chunk labeled with Primary Category and Chunk Type', false, 30, 'Task'),
('Warnings_Failure_Modes', 'Known pitfalls and failure conditions.', 'string', NULL, 'AI Generated', 'Mislabeling CER as Example; missing citations', false, 31, 'Task');

-- CER Analysis
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Claim', 'Main assertion stated in this chunk.', 'string', NULL, 'AI Generated', 'Structured chunk labels improve model faithfulness.', false, 32, 'CER'),
('Evidence_Snippets', 'Quoted or paraphrased evidence supporting the claim.', 'list[string]', 'comma/pipe delimited or JSON array', 'AI Generated', '"A/B tests showed 9% fewer hallucinations"', false, 33, 'CER'),
('Reasoning_Sketch', 'High-level rationale (concise; no verbose chain-of-thought).', 'string', NULL, 'AI Generated', 'Labels constrain retrieval and guide selection → more faithful answers.', false, 34, 'CER'),
('Citations', 'Sources/links/DOIs supporting evidence.', 'list[string]', 'comma/pipe delimited', 'AI Generated', 'https://example.com/whitepaper', false, 35, 'CER'),
('Factual_Confidence_0_1', 'Confidence score for factuality (0–1).', 'float', '0.0–1.0', 'AI Generated', '0.85', false, 36, 'CER');

-- Scenario Extraction
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Scenario_Type', 'Type of example or application.', 'enum', 'case_study | dialogue | Q&A | walkthrough | anecdote', 'AI Generated', 'case_study', false, 37, 'Scenario'),
('Problem_Context', 'Real-world context of the example.', 'string', NULL, 'AI Generated', 'Local HVAC company launching a maintenance plan', false, 38, 'Scenario'),
('Solution_Action', 'Action taken in the example.', 'string', NULL, 'AI Generated', 'Applied categorizer; built instruction-tuning pairs', false, 39, 'Scenario'),
('Outcome_Metrics', 'Measured results or KPIs.', 'string', NULL, 'AI Generated', '+18% response rate; 2x faster drafting', false, 40, 'Scenario'),
('Style_Notes', 'Narrative/style attributes to mimic.', 'string', NULL, 'AI Generated', 'Conversational, concrete, with numbers', false, 41, 'Scenario');

-- Training Pair Generation
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Prompt_Candidate', 'Potential user prompt distilled from the chunk.', 'string', NULL, 'AI Generated', 'Draft a step-by-step checklist to categorize documents.', false, 42, 'Training'),
('Target_Answer', 'Ideal answer (concise, brand-aligned).', 'string', NULL, 'AI Generated', 'A numbered checklist with compliance notes.', false, 43, 'Training'),
('Style_Directives', 'Formatting/voice directives for answers.', 'string', NULL, 'AI Generated', 'Use numbered steps; avoid jargon; keep to 150–250 words.', false, 44, 'Training');

-- Risk Assessment
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Safety_Tags', 'Sensitive-topic flags for filtering/guardrails.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'medical_advice, legal_disclaimer', false, 45, 'Risk'),
('Coverage_Tag', 'How central this chunk is to the domain.', 'enum', 'core | supporting | edge', 'AI Generated', 'core', false, 46, 'Risk'),
('Novelty_Tag', 'Whether content is common or unique IP.', 'enum', 'novel | common | disputed', 'AI Generated', 'novel', false, 47, 'Risk'),
('IP_Sensitivity', 'Confidentiality level for IP handling.', 'enum', 'Public | Internal | Confidential | Trade_Secret', 'AI Generated', 'Confidential', false, 48, 'Risk'),
('PII_Flag', 'Indicates presence of personal data.', 'boolean', 'true | false', 'AI Generated', 'FALSE', false, 49, 'Risk'),
('Compliance_Flags', 'Regulatory or policy flags.', 'list[string]', 'comma or pipe delimited', 'AI Generated', 'copyright_third_party, trademark', false, 50, 'Risk');

-- Training Metadata (defaults, minimal AI)
INSERT INTO dimension_metadata (field_name, description, data_type, allowed_values_format, generation_type, example_value, is_required, display_order, category) VALUES
('Include_In_Training_YN', 'Whether to use this chunk in training.', 'boolean', 'Y | N | true | false', 'AI Generated', 'Y', false, 59, 'Metadata'),
('Augmentation_Notes', 'Notes on paraphrase/style/noise augmentation.', 'string', NULL, 'AI Generated', 'Paraphrase x2; style-transfer to friendly', false, 61, 'Metadata');
```

**Verification:**
```sql
SELECT generation_type, COUNT(*) 
FROM dimension_metadata 
GROUP BY generation_type;

-- Expected output:
-- AI Generated          | 35
-- Mechanically Generated | 17
-- Prior Generated        |  8
```

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
✅ **Historical run management** (dropdown selector per chunk)  
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

**Version:** 1.0  
**Date:** October 7, 2025  
**Status:** Ready for Implementation  
**Approval:** Pending Human Review

---

