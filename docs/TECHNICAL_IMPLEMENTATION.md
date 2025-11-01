# Technical Implementation: Import/Export & Variable Substitution

## Architecture Overview

This document details the technical implementation of the import/export system and variable substitution engine.

## Module Structure

```
src/
├── app/api/
│   ├── export/
│   │   ├── templates/route.ts
│   │   ├── scenarios/route.ts
│   │   └── edge-cases/route.ts
│   ├── import/
│   │   ├── templates/route.ts
│   │   ├── scenarios/route.ts
│   │   └── edge-cases/route.ts
│   └── templates/
│       └── preview/route.ts
├── components/
│   ├── import-export/
│   │   ├── ExportModal.tsx
│   │   ├── ImportModal.tsx
│   │   └── index.ts
│   └── templates/
│       └── TemplatePreviewPanel.tsx
└── lib/
    ├── template-engine/
    │   ├── parser.ts
    │   ├── substitution.ts
    │   └── index.ts
    └── utils/
        ├── csv-converter.ts
        ├── json-validator.ts
        └── import-export.ts
```

## Template Engine Design

### Parser Architecture

The `TemplateParser` class implements a simple tokenizer that converts template strings into structured tokens.

#### Token Types

```typescript
type TemplateToken = {
  type: 'text' | 'variable' | 'conditional';
  value: string;
  modifier?: 'optional' | 'default';
  defaultValue?: string;
  path?: string[];
};
```

#### Parsing Algorithm

1. **Position Tracking**: Maintain current position in template string
2. **Lookahead**: Peek 2 characters to detect `{{` sequences
3. **Token Extraction**: Extract content between `{{` and `}}`
4. **Syntax Analysis**: Parse variable syntax (modifiers, defaults, paths)
5. **Text Segments**: Capture literal text between variables

#### Example Parse Flow

```
Input: "Hello {{user.name:Guest}}!"

Tokens:
[
  { type: 'text', value: 'Hello ' },
  { 
    type: 'variable',
    value: 'user.name',
    modifier: 'default',
    defaultValue: 'Guest',
    path: ['user', 'name']
  },
  { type: 'text', value: '!' }
]
```

### Substitution Engine

The `TemplateSubstitution` class resolves tokens against a context object.

#### Resolution Algorithm

1. **Token Iteration**: Process each token sequentially
2. **Text Passthrough**: Return text tokens unchanged
3. **Variable Resolution**: 
   - Navigate object path
   - Apply modifiers (optional, default)
   - Return value or placeholder
4. **Conditional Evaluation**: Simple truthy check
5. **Concatenation**: Join all resolved values

#### Path Navigation

```typescript
getValue(['user', 'profile', 'name'], context)
// Navigates: context.user.profile.name
```

Handles:
- Nested objects
- Array access
- Null/undefined gracefully

#### Modifier Logic

```typescript
// Optional: Return empty string if undefined
if (modifier === 'optional' && value === undefined) {
  return '';
}

// Default: Return default value if undefined
if (modifier === 'default' && value === undefined) {
  return defaultValue || '';
}

// Standard: Keep placeholder if undefined
if (value === undefined) {
  return `{{${variableName}}}`;
}
```

## Export Implementation

### Format Converters

#### JSON Export
- Returns object with metadata
- Pretty-printed for readability
- Includes export timestamp and count

```typescript
{
  data: [...],
  exportedAt: ISO_TIMESTAMP,
  count: NUMBER
}
```

#### JSONL Export
- One object per line
- Efficient for large datasets
- Streamable format

```typescript
{"id":"1",...}\n
{"id":"2",...}\n
```

#### CSV Export
- Flat structure (no nested objects)
- Arrays converted to comma-separated strings
- Objects serialized as JSON
- Proper escaping for quotes and commas

```typescript
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
```

### Response Headers

```typescript
{
  'Content-Type': 'text/csv',
  'Content-Disposition': 'attachment; filename="export.csv"'
}
```

Triggers browser download automatically.

## Import Implementation

### Validation Pipeline

```
File Upload
    ↓
Parse Format (JSON/JSONL)
    ↓
Schema Validation (Zod)
    ↓
Business Logic Validation
    ↓
Duplicate Detection
    ↓
Foreign Key Validation
    ↓
[Preview/Import]
```

#### Schema Validation

Uses Zod schemas from validation modules:

```typescript
import { createTemplateSchema } from '@/lib/validation/templates';

const importSchema = z.object({
  templates: z.array(createTemplateSchema),
  overwriteExisting: z.boolean().default(false),
  validateOnly: z.boolean().default(false),
});
```

#### Business Logic Validation

Custom validation rules:

```typescript
// Variable-placeholder consistency
const placeholders = extractPlaceholders(template.structure);
const variables = template.variables.map(v => v.name);
const missing = placeholders.filter(p => !variables.includes(p));

if (missing.length > 0) {
  errors.push(`Missing variables: ${missing.join(', ')}`);
}
```

#### Duplicate Detection

```typescript
const duplicateInBatch = items
  .filter(item => item.name === currentItem.name)
  .length > 1;
```

### Import Strategy

1. **Validation Phase**: Validate all items first
2. **Error Reporting**: Return validation errors if any
3. **Import Phase**: Process valid items only
4. **Existence Check**: Query database for existing items
5. **Overwrite Logic**: Update or skip based on flag
6. **Error Collection**: Collect errors without stopping
7. **Result Summary**: Return import statistics

```typescript
{
  success: true,
  imported: 8,
  failed: 2,
  results: {
    imported: [...],
    errors: [...]
  }
}
```

## Preview API

### Debouncing Strategy

Client-side debouncing prevents excessive API calls:

```typescript
useEffect(() => {
  const debounce = setTimeout(() => {
    generatePreview();
  }, 300);
  
  return () => clearTimeout(debounce);
}, [template, variables]);
```

### Response Format

```typescript
{
  resolved: string,        // Substituted template
  validation: {
    valid: boolean,
    missing: string[]      // Missing variable names
  }
}
```

## UI Components

### ExportModal

**State Management:**
```typescript
const [format, setFormat] = useState<'json' | 'jsonl' | 'csv'>('json');
const [exportAll, setExportAll] = useState(true);
const [isExporting, setIsExporting] = useState(false);
```

**Download Trigger:**
```typescript
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
document.body.appendChild(a);
a.click();
window.URL.revokeObjectURL(url);
document.body.removeChild(a);
```

### ImportModal

**Multi-step Flow:**
1. File selection
2. Validation preview
3. Import execution
4. Result display

**State Tracking:**
```typescript
const [file, setFile] = useState<File | null>(null);
const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
const [importResult, setImportResult] = useState<any>(null);
```

**File Parsing:**
```typescript
const content = await file.text();

if (file.name.endsWith('.json')) {
  data = JSON.parse(content);
} else if (file.name.endsWith('.jsonl')) {
  data = content
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
}
```

### TemplatePreviewPanel

**Real-time Updates:**
- 300ms debounce on input changes
- Loading state during API call
- Validation feedback

**Visual Feedback:**
```typescript
{validation.valid ? (
  <Alert className="border-green-200 bg-green-50">
    <CheckCircle className="text-green-600" />
    All variables resolved
  </Alert>
) : (
  <Alert variant="destructive">
    <AlertCircle />
    Missing variables: {validation.missing.join(', ')}
  </Alert>
)}
```

## Utility Functions

### CSV Converter

**Key Features:**
- Configurable delimiter/quote characters
- Proper escaping for special characters
- Type-aware value formatting
- Bidirectional conversion (CSV ↔ Objects)

**Value Formatting:**
```typescript
function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.join(',');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
```

### JSON Validator

**Validation Functions:**
- `validateJSON()`: Parse and validate JSON string
- `validateJSONL()`: Parse line-delimited JSON
- `validateWithSchema()`: Zod schema validation
- `validateArray()`: Batch validation with error collection
- `validateImportFormat()`: Format detection and validation

**Error Reporting:**
```typescript
interface ValidationError {
  path: string;        // JSON path to error
  message: string;     // Error description
  value?: any;         // Invalid value
}
```

## Performance Optimizations

### Export

1. **Streaming**: For large datasets (1000+ items)
2. **Lazy Loading**: Don't load all data into memory
3. **Format Selection**: CSV is most compact

### Import

1. **Batch Processing**: Process 100 items at a time
2. **Early Validation**: Validate before database operations
3. **Transaction Management**: Use database transactions for atomicity

### Preview

1. **Debouncing**: 300ms delay reduces API calls
2. **Client-side Caching**: Cache parsed templates
3. **Memoization**: Memoize expensive operations

### Recommendations

```typescript
// Large exports: Use streaming
app.get('/export/stream', async (req, res) => {
  const stream = db.templates.stream();
  stream.pipe(JSONStream.stringify()).pipe(res);
});

// Import batching
async function importBatch(items: any[], batchSize = 100) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processBatch(batch);
  }
}
```

## Error Handling

### API Level

```typescript
try {
  // Operation
} catch (error: any) {
  if (error.name === 'ZodError') {
    return NextResponse.json({
      error: 'Validation failed',
      details: error.errors,
    }, { status: 400 });
  }
  
  console.error('Operation error:', error);
  return NextResponse.json({
    error: 'Operation failed',
    details: error.message,
  }, { status: 500 });
}
```

### UI Level

```typescript
try {
  // API call
  toast.success('Operation successful');
} catch (error: any) {
  console.error('Error:', error);
  toast.error(`Operation failed: ${error.message}`);
}
```

## Security Considerations

### Input Sanitization

```typescript
function sanitizeImportData(data: any): any {
  // Remove internal properties
  // Validate against schema
  // Escape special characters
  // Limit string lengths
}
```

### SQL Injection Prevention

Using Supabase ORM with parameterized queries:

```typescript
// Safe
await supabase
  .from('templates')
  .select()
  .eq('id', userId); // Parameterized

// Unsafe (avoid)
await supabase.rpc('raw_query', { 
  query: `SELECT * FROM templates WHERE id = '${userId}'` 
});
```

### Rate Limiting

```typescript
// Implement rate limiting middleware
import rateLimit from 'express-rate-limit';

const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 imports per window
  message: 'Too many imports, please try again later',
});
```

### File Size Limits

```typescript
// Middleware
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

## Testing Strategy

### Unit Tests

```typescript
// Parser tests
describe('TemplateParser', () => {
  it('should parse simple variables', () => {
    const parser = new TemplateParser('{{name}}');
    const tokens = parser.parse();
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({
      type: 'variable',
      value: 'name',
    });
  });
  
  it('should parse nested variables', () => {
    const parser = new TemplateParser('{{user.name}}');
    const tokens = parser.parse();
    expect(tokens[0].path).toEqual(['user', 'name']);
  });
});

// Substitution tests
describe('TemplateSubstitution', () => {
  it('should substitute variables', () => {
    const sub = new TemplateSubstitution({ name: 'Alice' });
    const result = sub.substitute('Hello {{name}}');
    expect(result).toBe('Hello Alice');
  });
  
  it('should handle defaults', () => {
    const sub = new TemplateSubstitution({});
    const result = sub.substitute('Hello {{name:Guest}}');
    expect(result).toBe('Hello Guest');
  });
});
```

### Integration Tests

```typescript
// Export API tests
describe('Export API', () => {
  it('should export as JSON', async () => {
    const response = await fetch('/api/export/templates?format=json');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('count');
  });
  
  it('should export as CSV', async () => {
    const response = await fetch('/api/export/templates?format=csv');
    expect(response.headers.get('Content-Type')).toBe('text/csv');
  });
});

// Import API tests
describe('Import API', () => {
  it('should validate import data', async () => {
    const response = await fetch('/api/import/templates', {
      method: 'POST',
      body: JSON.stringify({
        templates: [validTemplate],
        validateOnly: true,
      }),
    });
    const result = await response.json();
    expect(result.summary.validCount).toBe(1);
  });
});
```

### E2E Tests

```typescript
// Playwright/Cypress tests
describe('Import/Export Flow', () => {
  it('should export and re-import data', () => {
    // Export
    cy.visit('/templates');
    cy.get('[data-testid="export-button"]').click();
    cy.get('[data-testid="format-json"]').click();
    cy.get('[data-testid="confirm-export"]').click();
    
    // Import
    cy.get('[data-testid="import-button"]').click();
    cy.get('[data-testid="file-input"]').attachFile('export.json');
    cy.get('[data-testid="validate"]').click();
    cy.get('[data-testid="confirm-import"]').click();
    
    // Verify
    cy.contains('Successfully imported');
  });
});
```

## Monitoring & Logging

### API Logging

```typescript
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Operation
    
    console.log({
      operation: 'import',
      entityType: 'templates',
      itemCount: items.length,
      duration: Date.now() - startTime,
      status: 'success',
    });
  } catch (error) {
    console.error({
      operation: 'import',
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime,
      status: 'error',
    });
  }
}
```

### Metrics

Track:
- Export/import frequency
- File sizes
- Processing times
- Error rates
- Validation failure patterns

## Maintenance

### Code Organization

- Keep parsers/validators modular
- Separate concerns (API/UI/Logic)
- Document complex algorithms
- Use TypeScript for type safety

### Version Compatibility

```typescript
// Include version in exports
{
  version: '1.0',
  data: [...],
}

// Check version on import
if (importData.version !== CURRENT_VERSION) {
  // Apply migrations or show warning
}
```

### Migration Strategy

When schema changes:
1. Update validation schemas
2. Create migration functions
3. Support multiple versions during transition
4. Deprecate old versions with warning period

```typescript
function migrateV1ToV2(data: any): any {
  // Transform data structure
  return {
    ...data,
    newField: deriveFromOldFields(data),
  };
}
```

## Future Improvements

1. **Streaming Exports**: For massive datasets
2. **Compression**: Gzip exports for faster downloads
3. **Incremental Imports**: Resume interrupted imports
4. **Conflict Resolution UI**: Let users choose how to handle conflicts
5. **Import History**: Track what was imported when
6. **Undo Imports**: Ability to rollback imports
7. **Template Versioning**: Track template changes over time
8. **Advanced Conditionals**: Full template language (loops, filters)
9. **Custom Validators**: Plugin system for custom validation
10. **Background Processing**: Queue large imports

## References

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Zod Validation](https://zod.dev/)
- [Supabase Client](https://supabase.com/docs/reference/javascript)
- [CSV Specification](https://tools.ietf.org/html/rfc4180)
- [JSONL Format](http://jsonlines.org/)

