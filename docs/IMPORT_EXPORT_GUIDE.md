# Import/Export & Variable Substitution Guide

## Overview

This guide covers the advanced import/export functionality and variable substitution engine implemented for the Template Management System.

## Features

### 1. Export Functionality

Export templates, scenarios, and edge cases in multiple formats:

#### Supported Formats

- **JSON**: Structured format with metadata
- **JSONL**: Line-delimited JSON (one object per line)
- **CSV**: Spreadsheet-compatible format

#### API Endpoints

```typescript
GET /api/export/templates?format=json&ids=id1,id2
GET /api/export/scenarios?format=csv
GET /api/export/edge-cases?format=jsonl
```

#### Query Parameters

- `format`: `json` | `jsonl` | `csv` (default: `json`)
- `ids`: Comma-separated list of IDs (optional, exports all if omitted)

#### Example Usage

```typescript
// Export all templates as JSON
const response = await fetch('/api/export/templates?format=json');
const data = await response.json();
// { data: [...], exportedAt: "...", count: 10 }

// Export specific scenarios as CSV
const response = await fetch('/api/export/scenarios?format=csv&ids=id1,id2,id3');
const csv = await response.text();
```

### 2. Import Functionality

Import data with validation and preview capabilities.

#### API Endpoints

```typescript
POST /api/import/templates
POST /api/import/scenarios
POST /api/import/edge-cases
```

#### Request Body

```typescript
{
  "templates": [...],      // Array of items to import
  "overwriteExisting": false, // Whether to update existing items
  "validateOnly": false    // Preview mode (validation only)
}
```

#### Validation Features

- **Schema validation**: Ensures data matches required structure
- **Variable consistency**: Validates that all template variables match placeholders
- **Duplicate detection**: Identifies duplicate names in batch
- **Foreign key validation**: Checks that referenced IDs exist

#### Example Usage

```typescript
// Preview import (validation only)
const response = await fetch('/api/import/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templates: importData,
    validateOnly: true,
  }),
});

const validation = await response.json();
// {
//   valid: [...],
//   invalid: [...],
//   summary: { total: 10, validCount: 8, invalidCount: 2 }
// }

// Actual import
const response = await fetch('/api/import/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templates: validatedData,
    overwriteExisting: true,
    validateOnly: false,
  }),
});
```

### 3. Variable Substitution Engine

Advanced template processing with multiple syntax options.

#### Supported Syntax

##### Simple Variables
```
{{variable}}
```
Replaces with variable value or keeps placeholder if not found.

##### Nested Variables
```
{{user.profile.name}}
{{config.api.endpoint}}
```
Supports deep object access via dot notation.

##### Optional Variables
```
{{nickname?}}
```
Returns empty string if variable not found (no placeholder).

##### Default Values
```
{{nickname:Anonymous}}
{{count:0}}
```
Uses default value if variable not found.

##### Conditional (Basic)
```
{{#if premium}}
```
Simple truthy check (returns '[conditional-true]' or '[conditional-false]').

#### API Usage

```typescript
// Preview with substitution
const response = await fetch('/api/templates/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    template: 'Hello {{user.name:Guest}}! {{welcome_message?}}',
    variables: {
      user: { name: 'John' }
    }
  }),
});

const result = await response.json();
// {
//   resolved: "Hello John! ",
//   validation: { valid: true, missing: [] }
// }
```

#### Programmatic Usage

```typescript
import { TemplateSubstitution } from '@/lib/template-engine';

const substitution = new TemplateSubstitution({
  user: { name: 'Alice', age: 30 },
  greeting: 'Welcome',
});

// Substitute
const result = substitution.substitute(
  '{{greeting}}, {{user.name}}! You are {{user.age}} years old.'
);
// "Welcome, Alice! You are 30 years old."

// Validate
const validation = substitution.validate(template);
// { valid: true, missing: [] }
```

### 4. UI Components

#### ExportModal

Modal component for exporting data.

```typescript
import { ExportModal } from '@/components/import-export';

<ExportModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  entityType="templates"
  selectedIds={['id1', 'id2']}
/>
```

**Props:**
- `open`: boolean - Modal visibility
- `onClose`: () => void - Close handler
- `entityType`: 'templates' | 'scenarios' | 'edge-cases'
- `selectedIds?`: string[] - Optional IDs to export (exports all if omitted)

#### ImportModal

Modal component for importing data with validation preview.

```typescript
import { ImportModal } from '@/components/import-export';

<ImportModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onImportComplete={() => refetch()}
  entityType="templates"
/>
```

**Props:**
- `open`: boolean - Modal visibility
- `onClose`: () => void - Close handler
- `onImportComplete?`: () => void - Callback after successful import
- `entityType`: 'templates' | 'scenarios' | 'edge-cases'

#### TemplatePreviewPanel

Real-time template preview with variable substitution.

```typescript
import { TemplatePreviewPanel } from '@/components/templates/TemplatePreviewPanel';

<TemplatePreviewPanel
  template="Hello {{name}}! {{greeting:Welcome}}"
  variables={{ name: 'Alice' }}
/>
```

**Props:**
- `template`: string - Template string with placeholders
- `variables`: Record<string, any> - Variable values for substitution

**Features:**
- Real-time preview (300ms debounce)
- Validation status indicators
- Missing variable alerts
- Success feedback when all variables resolved

## Integration Examples

### Adding Export Button to Table

```typescript
import { ExportModal } from '@/components/import-export';

function TemplatesTable() {
  const [showExport, setShowExport] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  return (
    <>
      <Button onClick={() => setShowExport(true)}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      
      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        entityType="templates"
        selectedIds={selectedIds}
      />
    </>
  );
}
```

### Adding Import Button

```typescript
import { ImportModal } from '@/components/import-export';

function TemplatesPage() {
  const [showImport, setShowImport] = useState(false);
  const { refetch } = useTemplates();
  
  return (
    <>
      <Button onClick={() => setShowImport(true)}>
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
      
      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={() => refetch()}
        entityType="templates"
      />
    </>
  );
}
```

### Template Form with Preview

```typescript
import { TemplatePreviewPanel } from '@/components/templates/TemplatePreviewPanel';

function TemplateForm() {
  const [template, setTemplate] = useState('');
  const [variables, setVariables] = useState({});
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Template Structure</Label>
        <Textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
      </div>
      
      <TemplatePreviewPanel
        template={template}
        variables={variables}
      />
    </div>
  );
}
```

## Data Format Specifications

### JSON Export Format

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Template Name",
      "description": "Description",
      "category": "technical",
      "structure": "Template with {{variables}}",
      "tone": "professional",
      "complexityBaseline": 5,
      "qualityThreshold": 0.8,
      "usageCount": 10,
      "rating": 4.5,
      "variables": [
        {
          "name": "variables",
          "description": "Variable description",
          "required": true
        }
      ]
    }
  ],
  "exportedAt": "2025-10-31T12:00:00.000Z",
  "count": 1
}
```

### JSONL Export Format

```jsonl
{"id":"uuid","name":"Template 1",...}
{"id":"uuid","name":"Template 2",...}
{"id":"uuid","name":"Template 3",...}
```

### CSV Export Format

```csv
id,name,description,category,structure,tone,complexity_baseline,quality_threshold,usage_count,rating
uuid,"Template Name","Description",technical,"Template with {{variables}}",professional,5,0.8,10,4.5
```

## Validation Rules

### Templates

- ✅ Name is required (min 1 character)
- ✅ Structure is required (min 10 characters)
- ✅ All placeholders must have corresponding variables
- ✅ No duplicate names in batch

### Scenarios

- ✅ Name is required
- ✅ Template ID is required and must exist
- ✅ Context is required (min 10 characters)
- ✅ No duplicate names in batch

### Edge Cases

- ✅ Name is required
- ✅ Scenario ID is required and must exist
- ✅ Trigger condition is required
- ✅ Expected behavior is required
- ✅ No duplicate names in batch

## Error Handling

### Import Errors

```typescript
// Invalid data structure
{
  "error": "Validation failed",
  "details": [...]
}

// Duplicate names
{
  "error": "Some templates failed validation",
  "invalid": [
    {
      "template": "Template Name",
      "errors": ["Template already exists"]
    }
  ]
}

// Missing variables
{
  "error": "Some templates failed validation",
  "invalid": [
    {
      "template": "Template Name",
      "errors": ["Missing variables: var1, var2"]
    }
  ]
}
```

### Export Errors

```typescript
{
  "error": "Failed to export templates",
  "details": "Error message"
}
```

## Performance Considerations

### Export
- Large datasets are handled efficiently
- Streaming recommended for 1000+ items
- CSV format is most compact

### Import
- Batch imports process 100 items at a time
- Validation runs before import to prevent partial failures
- Preview mode doesn't write to database

### Preview
- 300ms debounce prevents excessive API calls
- Client-side validation reduces server load
- Caching recommended for repeated templates

## Security Considerations

1. **Input Validation**: All imports are validated against schemas
2. **SQL Injection**: Using parameterized queries via Supabase
3. **File Size Limits**: Enforce reasonable file size limits
4. **Rate Limiting**: Consider rate limiting import/export endpoints
5. **Authentication**: Ensure endpoints are protected with authentication

## Testing Checklist

- [ ] Export templates to JSON
- [ ] Export templates to CSV
- [ ] Export templates to JSONL
- [ ] Export with specific IDs
- [ ] Import valid data
- [ ] Import with validation errors
- [ ] Import with duplicates (overwrite disabled)
- [ ] Import with duplicates (overwrite enabled)
- [ ] Preview import before committing
- [ ] Simple variable substitution
- [ ] Nested variable substitution
- [ ] Optional variable substitution
- [ ] Default value substitution
- [ ] Template preview updates in real-time
- [ ] Missing variables highlighted in preview
- [ ] Round-trip (export → import) preserves data

## Troubleshooting

### Import fails with "Missing variables"
**Solution**: Ensure all `{{placeholders}}` in template structure have corresponding variable definitions.

### Export returns empty data
**Solution**: Check that items exist in database and authentication is valid.

### Preview not updating
**Solution**: Check browser console for errors. Ensure variables object is properly formatted.

### CSV export has garbled characters
**Solution**: Ensure proper character encoding (UTF-8). Excel may require BOM.

## Future Enhancements

1. **Advanced Conditionals**: Full if/else/elseif logic
2. **Loops**: `{{#each}}` syntax for arrays
3. **Filters**: `{{variable|uppercase}}`
4. **Bulk Operations**: Multi-entity export in single file
5. **Version Control**: Track import/export history
6. **Scheduled Exports**: Automatic backups
7. **Cloud Storage**: Export directly to S3/GCS
8. **Diff Viewer**: Compare imported data with existing

## Support

For issues or questions, please refer to:
- Technical documentation
- API reference
- Component storybook
- GitHub issues

