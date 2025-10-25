## BUILD PROMPT #4: CHUNK DASHBOARD & SPREADSHEET INTERFACE

**CONTEXT FOR AI:** Data is being generated. Now create the chunk dashboard and spreadsheet interface following the existing wireframe design from `chunks-alpha-dashboard`.

**CRITICAL:** This prompt REQUIRES you to follow the **Dashboard Wireframe Design Reference** section above. Read it carefully before proceeding.

**VISUAL TARGET:** Refer to **Figure 1** in the Dashboard Wireframe Design Reference section above - your implementation must match this design exactly. Pay special attention to:
- The three-section card layout (metadata â†’ things we know â†’ things we need to know)
- Color coding: green for high confidence, orange for knowledge gaps, neutral for metadata
- Typography scale and spacing (compact text with generous padding)
- Icon placement and usage from lucide-react
- Analysis summary cards with colored backgrounds

---

## CRITICAL: EMBEDDED DESIGN PATTERNS YOU MUST IMPLEMENT

**IMPORTANT:** The complete design reference exists earlier in this document (lines 59-346), but to make this prompt self-contained, the essential patterns are embedded below. If you need additional context, refer to the full Dashboard Wireframe Design Reference section.

### Three-Section Card Layout (MANDATORY STRUCTURE)

Every chunk card MUST have this exact three-section structure:

**Section 1: Chunk Metadata (Neutral Background)**
```typescript
<div className="mb-4 p-3 bg-white/30 rounded border">
  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
    <Hash className="h-3 w-3" />
    Chunk Metadata
  </h5>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
    {/* Mechanical data: chars, tokens, page numbers */}
  </div>
</div>
```
**Purpose:** Display mechanical, objective chunk data  
**Color:** Neutral/white (`bg-white/30`)  
**Content:** Character count, token count, page numbers, chunk type

**Section 2: Things We Know (Green Background)**
```typescript
<div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
  <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-800">
    <CheckCircle className="h-3 w-3" />
    Things We Know ({highConfidenceCount})
  </h5>
  {/* Show dimensions where generation_confidence_accuracy >= 8 */}
  {/* Display top 3 highest confidence findings */}
  {/* Each finding shows: dimension name, confidence score (1-10 scale Ã— 10 for %), value */}
</div>
```
**Purpose:** Display high-confidence AI-generated dimensions  
**Color:** Green (`bg-green-50`, `border-green-200`)  
**Content:** Dimensions with `generation_confidence_accuracy >= 8`  
**Display Logic:** Show top 3 by confidence, sorted descending  
**Confidence Display:** Score is 1-10, display as `{score * 10}%` (e.g., score 8 â†’ "80% confidence")

**Section 3: Things We Need to Know (Orange Background)**
```typescript
<div className="p-3 bg-orange-50 rounded border border-orange-200">
  <div className="flex items-center justify-between mb-2">
    <h5 className="text-sm font-medium flex items-center gap-2 text-orange-800">
      <AlertCircle className="h-3 w-3" />
      Things We Need to Know ({lowConfidenceCount})
    </h5>
    <Button variant="outline" size="sm" className="text-xs h-6 px-2 border-orange-300 text-orange-700 hover:bg-orange-100">
      <ExternalLink className="h-3 w-3 mr-1" />
      Detail View
    </Button>
  </div>
  {/* Show dimensions where generation_confidence_accuracy < 8 */}
  {/* Display top 3 lowest confidence dimensions */}
</div>
```
**Purpose:** Display low-confidence dimensions needing review  
**Color:** Orange (`bg-orange-50`, `border-orange-200`)  
**Content:** Dimensions with `generation_confidence_accuracy < 8`  
**Display Logic:** Show top 3 by confidence, sorted ascending (lowest first)  
**Action:** "Detail View" button â†’ Navigate to `/chunks/[documentId]/spreadsheet/[chunkId]`

### Color Coding System

**Chunk Type Border/Background Colors:**
```typescript
function getChunkTypeColor(type: string): string {
  const colors = {
    'Chapter_Sequential': 'border-blue-200 bg-blue-50',
    'Instructional_Unit': 'border-purple-200 bg-purple-50',
    'CER': 'border-orange-200 bg-orange-50',
    'Example_Scenario': 'border-yellow-200 bg-yellow-50',
  };
  return colors[type] || 'border-gray-200 bg-gray-50';
}
```

**Confidence Threshold:**
- **High Confidence** (>=8): Appears in "Things We Know" (green section)
- **Low Confidence** (<8): Appears in "Things We Need to Know" (orange section)
- Display confidence as percentage: `{score * 10}%` (e.g., 8 â†’ 80%, 9 â†’ 90%)

### Icons from lucide-react

Required imports:
```typescript
import { 
  FileText,      // Document/chunk icon
  CheckCircle,   // High confidence indicator
  AlertCircle,   // Low confidence indicator  
  Hash,          // Metadata section icon
  ExternalLink,  // Detail view link
  ArrowRight,    // List item bullets
} from 'lucide-react';
```

### Typography Scale

- **Main heading:** `text-xl font-medium`
- **Card title:** `font-medium`
- **Section headings:** `text-sm font-medium`
- **Body text:** `text-xs`
- **Muted text:** `text-xs text-muted-foreground`

### Spacing and Padding

- **Container:** `container mx-auto px-4 py-6`
- **Section spacing:** `space-y-6` for main sections, `space-y-4` for chunk cards
- **Card content:** `pt-0` on CardContent to remove default top padding
- **Section boxes:** `p-3` for inner sections, `p-4` for summary cards
- **Grid gaps:** `gap-3` for metadata grid, `gap-4` for summary stats

### Progressive Disclosure Pattern

**Overview (Chunk Dashboard):**
- Show 3 items in "Things We Know"
- Show 3 items in "Things We Need to Know"
- Use `.slice(0, 3)` to limit display

**Detail View (Spreadsheet):**
- Show ALL dimensions in table format
- Triggered by "Detail View" button
- Navigate to `/chunks/[documentId]/spreadsheet/[chunkId]`

### Analysis Summary (Bottom of Page)

4-column stat cards:
```typescript
<div className="grid md:grid-cols-4 gap-4">
  <div className="text-center p-4 bg-blue-50 rounded">
    <div className="text-2xl font-medium text-blue-600">{totalChunks}</div>
    <div className="text-sm text-blue-800">Total Chunks</div>
  </div>
  {/* Repeat for: Analyzed (green), Dimensions (orange), Cost (purple) */}
</div>
```
**Colors:** Blue â†’ Green â†’ Orange â†’ Purple

---

**YOUR TASK:**

### Part A: Create Chunk Dashboard Page

Create `src/app/chunks/[documentId]/page.tsx`:

This is the main chunk overview page that **MUST match the design pattern from `DocumentChunksOverview.tsx`** in the wireframe.

**Required Layout Structure:**

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { 
  FileText, CheckCircle, AlertCircle, Hash, ExternalLink, ArrowRight 
} from 'lucide-react';

export default function ChunkDashboardPage({ params }: { params: { documentId: string } }) {
  // Fetch document and chunks
  // Fetch latest run dimensions
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 1. Filename Display - centered */}
      <div className="text-center">
        <h1 className="font-bold">{document.title}</h1>
      </div>
      
      {/* 2. Document Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                {document.title}
                <Badge variant="outline">{document.primary_category}</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {document.total_chunks_extracted} chunks extracted
              </p>
            </div>
            <div className="text-right">
              <Badge className="mb-2 bg-green-500">
                COMPLETED
              </Badge>
              <div className="text-sm text-muted-foreground">
                Analysis Progress: {analysisProgress}%
              </div>
              <Progress value={analysisProgress} className="w-32 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 3. Auto-Generated Chunks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Auto-Generated Chunks</h2>
          <Badge variant="secondary">
            {chunksWithDimensions} / {totalChunks} Analyzed
          </Badge>
        </div>

        {/* Individual chunk cards - FOLLOW THREE-SECTION PATTERN */}
        {chunks.map((chunk) => (
          <Card key={chunk.id} className={`transition-all ${getChunkTypeColor(chunk.chunk_type)} ${hasDimensions(chunk) ? 'ring-1 ring-green-200' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-lg bg-white/50 ${hasDimensions(chunk) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {hasDimensions(chunk) ? <CheckCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{chunk.chunk_handle || `Chunk ${chunk.chunk_id}`}</h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {chunk.chunk_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  <div>ID: {chunk.chunk_id}</div>
                  {hasDimensions(chunk) ? (
                    <Badge variant="default" className="bg-green-500 text-xs mt-1">Analyzed</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs mt-1">Pending</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* SECTION 1: Chunk Metadata (neutral background) */}
              <div className="mb-4 p-3 bg-white/30 rounded border">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  Chunk Metadata
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Chars:</span>
                    <div className="font-medium">{chunk.char_end - chunk.char_start}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tokens:</span>
                    <div className="font-medium">{chunk.token_count}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Page:</span>
                    <div className="font-medium">{chunk.page_start || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div className="font-medium">{chunk.chunk_type}</div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Things We Know (green background) */}
              <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-3 w-3" />
                  Things We Know ({getHighConfidenceDimensions(chunk).length})
                </h5>
                {getHighConfidenceDimensions(chunk).length > 0 ? (
                  <div className="space-y-2">
                    {getHighConfidenceDimensions(chunk).slice(0, 3).map((dim, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {dim.fieldName}
                          </Badge>
                          <span className="text-green-600 font-medium">
                            {dim.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-green-800">{truncate(dim.value, 100)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-green-700">No dimensions generated yet</p>
                )}
              </div>

              {/* SECTION 3: Things We Need to Know (orange background) */}
              <div className="p-3 bg-orange-50 rounded border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-3 w-3" />
                    Things We Need to Know ({getLowConfidenceDimensions(chunk).length})
                  </h5>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-6 px-2 border-orange-300 text-orange-700 hover:bg-orange-100"
                    onClick={() => navigateToSpreadsheet(chunk.id)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Detail View
                  </Button>
                </div>
                {getLowConfidenceDimensions(chunk).length > 0 ? (
                  <ul className="space-y-1">
                    {getLowConfidenceDimensions(chunk).slice(0, 3).map((dim, idx) => (
                      <li key={idx} className="text-xs text-orange-800 flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {dim.fieldName}: Low confidence ({dim.confidence}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-orange-700">All dimensions have high confidence</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 4. Analysis Summary (4-column stats) */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-medium text-blue-600">{totalChunks}</div>
              <div className="text-sm text-blue-800">Total Chunks</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-medium text-green-600">{chunksWithDimensions}</div>
              <div className="text-sm text-green-800">Analyzed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <div className="text-2xl font-medium text-orange-600">{totalDimensionsGenerated}</div>
              <div className="text-sm text-orange-800">Dimensions Generated</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-2xl font-medium text-purple-600">{totalCost.toFixed(2)}</div>
              <div className="text-sm text-purple-800">Total Cost ($)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getChunkTypeColor(type: string): string {
  switch (type) {
    case 'Chapter_Sequential': return 'border-blue-200 bg-blue-50';
    case 'Instructional_Unit': return 'border-purple-200 bg-purple-50';
    case 'CER': return 'border-orange-200 bg-orange-50';
    case 'Example_Scenario': return 'border-yellow-200 bg-yellow-50';
    default: return 'border-gray-200 bg-gray-50';
  }
}

interface DimensionWithConfidence {
  fieldName: string;
  value: any;
  confidence: number; // 1-10 scale from database
}

function getHighConfidenceDimensions(chunk: any): DimensionWithConfidence[] {
  // Get the latest dimension data for this chunk
  if (!chunk.dimensions || chunk.dimensions.length === 0) return [];
  
  const latestDim = chunk.dimensions[0]; // Assume sorted by generated_at DESC
  
  // Extract all dimensional fields with confidence scores
  const dimensionsWithScores: DimensionWithConfidence[] = [];
  
  // Add fields based on type - only include populated fields
  const fieldMappings = {
    chunk_summary_1s: latestDim.chunk_summary_1s,
    key_terms: latestDim.key_terms,
    audience: latestDim.audience,
    intent: latestDim.intent,
    tone_voice_tags: latestDim.tone_voice_tags,
    brand_persona_tags: latestDim.brand_persona_tags,
    domain_tags: latestDim.domain_tags,
    task_name: latestDim.task_name,
    preconditions: latestDim.preconditions,
    expected_output: latestDim.expected_output,
    claim: latestDim.claim,
    evidence_snippets: latestDim.evidence_snippets,
    reasoning_sketch: latestDim.reasoning_sketch,
    scenario_type: latestDim.scenario_type,
    problem_context: latestDim.problem_context,
    solution_action: latestDim.solution_action,
  };
  
  Object.entries(fieldMappings).forEach(([fieldName, value]) => {
    if (value !== null && value !== undefined && value !== '' && 
        !(Array.isArray(value) && value.length === 0)) {
      // Use accuracy score as primary confidence indicator (1-10 scale)
      const confidence = latestDim.generation_confidence_accuracy || 5;
      
      if (confidence >= 8) { // High confidence threshold
        dimensionsWithScores.push({ fieldName, value, confidence });
      }
    }
  });
  
  // Sort by confidence descending, return all (UI will slice to 3)
  return dimensionsWithScores.sort((a, b) => b.confidence - a.confidence);
}

function getLowConfidenceDimensions(chunk: any): DimensionWithConfidence[] {
  // Get the latest dimension data for this chunk
  if (!chunk.dimensions || chunk.dimensions.length === 0) return [];
  
  const latestDim = chunk.dimensions[0];
  
  const dimensionsWithScores: DimensionWithConfidence[] = [];
  
  // Same field mappings as above
  const fieldMappings = {
    chunk_summary_1s: latestDim.chunk_summary_1s,
    key_terms: latestDim.key_terms,
    audience: latestDim.audience,
    intent: latestDim.intent,
    tone_voice_tags: latestDim.tone_voice_tags,
    brand_persona_tags: latestDim.brand_persona_tags,
    domain_tags: latestDim.domain_tags,
    task_name: latestDim.task_name,
    preconditions: latestDim.preconditions,
    expected_output: latestDim.expected_output,
    claim: latestDim.claim,
    evidence_snippets: latestDim.evidence_snippets,
    reasoning_sketch: latestDim.reasoning_sketch,
    scenario_type: latestDim.scenario_type,
    problem_context: latestDim.problem_context,
    solution_action: latestDim.solution_action,
  };
  
  Object.entries(fieldMappings).forEach(([fieldName, value]) => {
    const confidence = latestDim.generation_confidence_accuracy || 5;
    
    // Include fields that are null/empty OR have low confidence
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0) || confidence < 8) {
      dimensionsWithScores.push({ 
        fieldName, 
        value: value || '(Not generated)', 
        confidence 
      });
    }
  });
  
  // Sort by confidence ascending (lowest first)
  return dimensionsWithScores.sort((a, b) => a.confidence - b.confidence);
}

function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function hasDimensions(chunk: any): boolean {
  return chunk.dimensions && chunk.dimensions.length > 0;
}
```

**Key Implementation Notes:**

1. **Color Coding**: Use exact color scheme from wireframe
2. **Three-Section Layout**: Every chunk card must have the three-section structure
3. **Confidence-Based Display**: 
   - "Things We Know" = dimensions with `generation_confidence_accuracy` >= 8 (on 1-10 scale)
   - "Things We Need to Know" = dimensions with < 8 confidence or NULL values
   - Display confidence as percentage: `{score * 10}%` (e.g., score 8 â†’ "80%")
4. **Progressive Disclosure**: Show 3 items in each section, button to see full spreadsheet
5. **Icons**: Use lucide-react icons exactly as shown in wireframe

### Part B: Create Full Spreadsheet Component

Create `src/components/chunks/ChunkSpreadsheet.tsx`:

Full-featured spreadsheet for detailed dimension analysis:

```typescript
'use client'

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  ArrowUpDown, Search, Filter, Download 
} from 'lucide-react';

interface ChunkSpreadsheetProps {
  chunk: Chunk;
  dimensions: ChunkDimensions[];
  runs: ChunkRun[];
}

export function ChunkSpreadsheet({ chunk, dimensions, runs }: ChunkSpreadsheetProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [activeView, setActiveView] = useState<'all' | 'quality' | 'cost' | 'content' | 'risk'>('all');

  // Define preset views
  const presetViews = {
    quality: ['generation_confidence_precision', 'generation_confidence_accuracy', 'factual_confidence_0_1', 'review_status'],
    cost: ['generation_cost_usd', 'generation_duration_ms', 'token_count'],
    content: ['chunk_summary_1s', 'key_terms', 'audience', 'intent', 'tone_voice_tags'],
    risk: ['ip_sensitivity', 'pii_flag', 'compliance_flags', 'safety_tags', 'coverage_tag'],
  };

  const visibleColumns = activeView === 'all' 
    ? getAllDimensionFields() 
    : presetViews[activeView];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant={activeView === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('all')}
          >
            All Dimensions
          </Button>
          <Button 
            variant={activeView === 'quality' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('quality')}
          >
            Quality View
          </Button>
          <Button 
            variant={activeView === 'cost' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('cost')}
          >
            Cost View
          </Button>
          <Button 
            variant={activeView === 'content' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('content')}
          >
            Content View
          </Button>
          <Button 
            variant={activeView === 'risk' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('risk')}
          >
            Risk View
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Filter..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="border rounded-lg overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-32">Run</TableHead>
              {visibleColumns.map(col => (
                <TableHead 
                  key={col} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-2">
                    {formatColumnName(col)}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dimensions.map(dim => (
              <TableRow key={dim.id}>
                <TableCell className="font-medium">
                  {formatRunName(dim.run_id, runs)}
                </TableCell>
                {visibleColumns.map(col => (
                  <TableCell key={col}>
                    {formatCellValue(dim[col as keyof ChunkDimensions])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">â€”</span>;
  if (Array.isArray(value)) return <Badge variant="secondary">{value.length} items</Badge>;
  if (typeof value === 'boolean') return value ? 'âœ“' : 'âœ—';
  if (typeof value === 'number') return value.toFixed(2);
  return String(value).substring(0, 100);
}
```

### Part C: Create Spreadsheet Detail Page

Create `src/app/chunks/[documentId]/spreadsheet/[chunkId]/page.tsx`:

Full-page spreadsheet view showing all runs for a specific chunk.

**COMPLETION CRITERIA:**
✅ Chunk dashboard matches wireframe design exactly  
✅ Three-section card layout implemented  
✅ Color-coded confidence display working  
✅ "Things We Know" / "Things We Need to Know" logic correct  
✅ Spreadsheet with sorting and filtering  
✅ Preset views functional  
✅ Progressive disclosure (3 items → full spreadsheet)
