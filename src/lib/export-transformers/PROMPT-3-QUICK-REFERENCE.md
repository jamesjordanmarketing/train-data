# CSV and Markdown Transformers - Quick Reference

## Overview
CSV and Markdown export transformers for flattening conversations (CSV) and creating human-readable documentation (Markdown).

---

## CSV Transformer

### Basic Usage
```typescript
import { getTransformer } from './lib/export-transformers';

const transformer = getTransformer('csv');
const output = await transformer.transform(conversations, turns, config);
// Output includes UTF-8 BOM for Excel compatibility
```

### Output Format
- **Structure**: One row per turn (flattened)
- **Headers**: Conversation ID, Title, Status, Tier, Turn Number, Role, Content, Quality Score, ...
- **Escaping**: Automatic via csv-stringify library
- **Excel**: UTF-8 BOM ensures proper encoding

### Special Character Handling
| Character | Handling | Example |
|-----------|----------|---------|
| Quotes | Escaped as `""` | `She said "Hello"` → `"She said ""Hello"""` |
| Commas | Preserved in quoted field | `Hello, World` → `"Hello, World"` |
| Newlines | Preserved in quoted field | `Line 1\nLine 2` → `"Line 1\nLine 2"` |

### Configuration Options
```typescript
const config: ExportConfig = {
  format: 'csv',
  includeMetadata: true,        // Adds persona, emotion, topic columns
  includeQualityScores: true,   // Adds quality_score column
  includeTimestamps: true,      // Adds created_at, updated_at columns
  includeParentReferences: true, // Adds parent_id, parent_type columns
  // ... other options
};
```

### Sample Output
```csv
"Conversation ID","Title","Status","Tier","Turn Number","Role","Content"
"conv-001","Getting Started","approved","template","1","user","Question here"
"conv-001","Getting Started","approved","template","2","assistant","Answer here"
```

---

## Markdown Transformer

### Basic Usage
```typescript
import { getTransformer } from './lib/export-transformers';

const transformer = getTransformer('markdown');
const output = await transformer.transform(conversations, turns, config);
// Output is GitHub/VS Code compatible Markdown
```

### Output Format
- **Structure**: Document header → Conversations → Dialogue
- **Headers**: # (H1), ## (H2), ### (H3)
- **Content**: Blockquotes (>) for turn content
- **Metadata**: Bullet lists with bold labels
- **Separators**: Horizontal rules (---) between conversations

### Sample Output
```markdown
# Training Conversations Export

**Export Date:** 2025-10-31T19:09:59.295Z
**Total Conversations:** 2

---

## Conversation: Getting Started

**Metadata:**
- **ID:** conv-001
- **Tier:** template
- **Quality Score:** 8.50

### Dialogue

**User:**
> Can you explain what LoRA training is?
*Tokens: 10*

**Assistant:**
> LoRA (Low-Rank Adaptation) is a parameter-efficient...
*Tokens: 50*

---
```

### Configuration Options
```typescript
const config: ExportConfig = {
  format: 'markdown',
  includeMetadata: true,        // Shows metadata section
  includeQualityScores: true,   // Shows quality score in metadata
  includeTimestamps: true,      // Shows created/updated dates
  includeParentReferences: true, // Shows parent ID/type
  // ... other options
};
```

---

## Factory Function

### Get Transformer by Format
```typescript
import { getTransformer } from './lib/export-transformers';

// Available formats: 'jsonl', 'json', 'csv', 'markdown'
const jsonlTransformer = getTransformer('jsonl');
const jsonTransformer = getTransformer('json');
const csvTransformer = getTransformer('csv');
const mdTransformer = getTransformer('markdown');
```

---

## Common Patterns

### Export with All Metadata
```typescript
const config: ExportConfig = {
  scope: 'all',
  format: 'csv', // or 'markdown'
  includeMetadata: true,
  includeQualityScores: true,
  includeTimestamps: true,
  includeApprovalHistory: true,
  includeParentReferences: true,
  includeFullContent: true,
};
```

### Export Minimal Data
```typescript
const config: ExportConfig = {
  scope: 'selected',
  format: 'csv',
  includeMetadata: false,
  includeQualityScores: false,
  includeTimestamps: false,
  includeApprovalHistory: false,
  includeParentReferences: false,
  includeFullContent: true, // Always include turn content
};
```

### Validate Output
```typescript
const output = await transformer.transform(conversations, turns, config);
try {
  transformer.validateOutput(output);
  console.log('✅ Valid output');
} catch (error) {
  console.error('❌ Invalid output:', error.message);
}
```

---

## File Metadata

### CSV Transformer
- **Extension**: `.csv`
- **MIME Type**: `text/csv; charset=utf-8`
- **Encoding**: UTF-8 with BOM

### Markdown Transformer
- **Extension**: `.md`
- **MIME Type**: `text/markdown; charset=utf-8`
- **Encoding**: UTF-8

---

## Testing

### Run Tests
```bash
cd src
npx tsx lib/export-transformers/test-transformer-output.ts
```

### Expected Output
```
✅ CSV export saved to: sample-exports/test-output.csv
✅ CSV validation passed
✅ Markdown export saved to: sample-exports/test-output.md
✅ Markdown validation passed
✅ Factory function tests passed
```

---

## Error Handling

### Common Validation Errors

#### CSV Transformer
- `Empty output` - No conversations provided
- `Missing UTF-8 BOM` - BOM not prepended
- `CSV has no data rows` - Only header, no data

#### Markdown Transformer
- `Empty output` - No conversations provided
- `Missing document header` - No H1 header
- `No conversation sections found` - No H2 headers
- `No blockquote content found` - No turn content

### Example Error Handling
```typescript
try {
  const output = await transformer.transform(conversations, turns, config);
  transformer.validateOutput(output);
  return output;
} catch (error) {
  console.error('Export failed:', error);
  // Handle error appropriately
  throw error;
}
```

---

## Performance Notes

- **CSV**: ~2ms per conversation (with 5 turns)
- **Markdown**: ~1ms per conversation (with 5 turns)
- **Large Exports**: Consider streaming for 1000+ conversations
- **Memory**: Both transformers build complete output in memory

---

## Integration Points

### API Endpoints (Prompt 4)
```typescript
// POST /api/export
app.post('/api/export', async (req, res) => {
  const { format, conversations, turns, config } = req.body;
  const transformer = getTransformer(format);
  const output = await transformer.transform(conversations, turns, config);
  
  res.setHeader('Content-Type', transformer.getMimeType());
  res.setHeader('Content-Disposition', `attachment; filename="export.${transformer.getFileExtension()}"`);
  res.send(output);
});
```

### UI Export Dialog (Prompt 5)
```typescript
const handleExport = async (format: 'csv' | 'markdown') => {
  const transformer = getTransformer(format);
  const output = await transformer.transform(conversations, turns, config);
  
  // Trigger download
  const blob = new Blob([output], { type: transformer.getMimeType() });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export.${transformer.getFileExtension()}`;
  a.click();
};
```

---

## Troubleshooting

### CSV not opening correctly in Excel
- **Issue**: Special characters display incorrectly
- **Solution**: Verify UTF-8 BOM is present (`\uFEFF` at start)
- **Check**: `csvOutput.charCodeAt(0) === 0xFEFF`

### Markdown not rendering properly
- **Issue**: Blockquotes or headers not displaying
- **Solution**: Verify proper newline spacing between elements
- **Check**: View in GitHub or VS Code Markdown preview

### Special characters not escaped
- **Issue**: Quotes or commas breaking CSV structure
- **Solution**: Ensure using csv-stringify library (not manual escaping)
- **Check**: Run validation test

---

## Dependencies

- **csv-stringify** - Robust CSV generation with proper escaping
- **TypeScript** - Type safety
- **Node.js fs/path** - File operations (for testing)

---

## Related Documentation

- [Export Transformers README](./README.md)
- [Implementation Summary](./PROMPT-3-IMPLEMENTATION-SUMMARY.md)
- [Export Service Architecture](../../../EXPORT-SERVICE-ARCHITECTURE.md)
- [Visual Reference](./VISUAL-REFERENCE.md)

