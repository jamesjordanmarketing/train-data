# Export Transformers

## Overview

The Export Transformers module provides a flexible, extensible system for converting conversation data into multiple export formats. It implements the Strategy pattern to allow format-specific transformation logic while maintaining a consistent API.

## Architecture

### Strategy Pattern

Each export format implements the `IExportTransformer` interface:

```typescript
interface IExportTransformer {
  transform(conversations, turns, config): Promise<string>
  validateOutput(output: string): boolean
  getFileExtension(): string
  getMimeType(): string
}
```

### Supported Formats

1. **JSONL** - Newline-delimited JSON for LoRA training
2. **JSON** - Pretty-printed structured JSON for analysis
3. **CSV** - Comma-separated values for Excel/Google Sheets (Prompt 3) ✅
4. **Markdown** - Human-readable documentation (Prompt 3) ✅

## Usage

### Basic Usage

```typescript
import { getTransformer } from './lib/export-transformers';
import { Conversation, ConversationTurn, ExportConfig } from './lib/types';

// Get transformer for desired format
const transformer = getTransformer('jsonl');

// Prepare data
const conversations: Conversation[] = [...];
const turns = new Map<string, ConversationTurn[]>();
// ... populate turns map

// Configure export
const config: ExportConfig = {
  scope: 'all',
  format: 'jsonl',
  includeMetadata: true,
  includeQualityScores: true,
  includeTimestamps: true,
  includeApprovalHistory: false,
  includeParentReferences: true,
  includeFullContent: true,
};

// Transform and validate
const output = await transformer.transform(conversations, turns, config);
transformer.validateOutput(output);

// Save to file
const extension = transformer.getFileExtension();
const mimeType = transformer.getMimeType();
```

### Factory Function

The `getTransformer()` factory function returns the appropriate transformer instance:

```typescript
const jsonlTransformer = getTransformer('jsonl'); // JSONLTransformer instance
const jsonTransformer = getTransformer('json');   // JSONTransformer instance
const csvTransformer = getTransformer('csv');     // CSVTransformer instance
const mdTransformer = getTransformer('markdown'); // MarkdownTransformer instance
```

## Format Specifications

### JSONL Format

**Purpose**: LoRA fine-tuning with OpenAI and Anthropic APIs

**Structure**:
- One JSON object per line
- Newline-delimited (no commas between objects)
- Each line is a complete, valid JSON object

**Required Fields**:
- `messages` (array): Array of message objects
  - `role` (string): 'system', 'user', or 'assistant'
  - `content` (string): Message text

**Optional Fields**:
- `metadata` (object): Additional conversation information

**Example**:
```jsonl
{"messages":[{"role":"user","content":"Hello"},{"role":"assistant","content":"Hi there!"}],"metadata":{"conversation_id":"test-001"}}
{"messages":[{"role":"user","content":"Goodbye"},{"role":"assistant","content":"See you!"}],"metadata":{"conversation_id":"test-002"}}
```

**MIME Type**: `application/x-ndjson`

**File Extension**: `.jsonl`

### JSON Format

**Purpose**: Structured data export for analysis and debugging

**Structure**:
- Single JSON object containing all conversations
- Pretty-printed with 2-space indentation
- Includes metadata and summary statistics

**Schema**:
```typescript
{
  version: string;              // Schema version (e.g., "1.0")
  export_date: string;          // ISO 8601 timestamp
  conversation_count: number;   // Total number of conversations
  conversations: [              // Array of conversation objects
    {
      conversation_id: string;
      title: string;
      status: string;
      tier: string;
      turns: [
        {
          role: 'user' | 'assistant';
          content: string;
          token_count?: number;
        }
      ];
      metadata?: {
        persona?: string;
        emotion?: string;
        topic?: string;
        category?: string[];
        total_turns: number;
        token_count: number;
        quality_score?: number;
        created_at?: string;
        updated_at?: string;
        review_history?: any[];
        parent_id?: string;
        parent_type?: string;
        parameters?: Record<string, any>;
      };
    }
  ];
  summary?: {
    total_turns: number;
    average_quality_score?: number;
    tier_distribution?: Record<string, number>;
  };
}
```

**MIME Type**: `application/json`

**File Extension**: `.json`

### CSV Format

**Purpose**: Data export for Excel, Google Sheets, and data analysis tools

**Structure**:
- One row per conversation turn (flattened structure)
- Header row with column names
- UTF-8 BOM for Excel compatibility
- Proper escaping via csv-stringify library

**Columns** (dynamic based on config):
- `Conversation ID` - Unique conversation identifier
- `Title` - Conversation title
- `Status` - Conversation status (approved, pending_review, etc.)
- `Tier` - Template, scenario, or edge_case
- `Turn Number` - Sequential turn number within conversation
- `Role` - user or assistant
- `Content` - Turn content (properly escaped)
- `Quality Score` - Optional quality metric
- `Persona` - Optional persona metadata
- `Emotion` - Optional emotion metadata
- `Topic` - Optional topic metadata
- `Created At` - Optional timestamp
- `Updated At` - Optional timestamp
- `Token Count` - Optional token count per turn
- `Parent ID` - Optional parent template/scenario ID
- `Parent Type` - Optional parent type

**Special Character Handling**:
- Quotes: Escaped as `""` (double quotes)
- Commas: Preserved within quoted fields
- Newlines: Preserved within quoted fields
- UTF-8 BOM: `\uFEFF` prepended for Excel compatibility

**Example**:
```csv
"Conversation ID","Title","Status","Tier","Turn Number","Role","Content","Quality Score"
"conv-001","Getting Started","approved","template","1","user","Can you explain?","8.5"
"conv-001","Getting Started","approved","template","2","assistant","Sure! Here's how...","8.5"
```

**MIME Type**: `text/csv; charset=utf-8`

**File Extension**: `.csv`

**Excel Compatibility**: ✅ Includes UTF-8 BOM for proper character encoding

### Markdown Format

**Purpose**: Human-readable conversation review and documentation

**Structure**:
- Document header with export metadata
- Each conversation as H2 section
- Metadata as bulleted list
- Dialogue as blockquotes
- Horizontal rules between conversations

**Formatting Elements**:
- `# H1` - Document title
- `## H2` - Conversation sections
- `### H3` - Dialogue sections
- `**Bold**` - Role labels and metadata labels
- `> Blockquote` - Turn content
- `---` - Horizontal rules (separators)
- `*Italic*` - Token counts

**Example**:
```markdown
# Training Conversations Export

**Export Date:** 2025-10-31T19:09:59.295Z
**Total Conversations:** 2

---

## Conversation: Getting Started with LoRA Training

**Metadata:**
- **ID:** conv-001
- **Tier:** template
- **Status:** approved
- **Persona:** Technical Expert
- **Quality Score:** 8.50
- **Created:** Oct 29, 2025, 03:30 AM

### Dialogue

**User:**
> Can you explain what LoRA training is?
*Tokens: 10*

**Assistant:**
> LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique...
*Tokens: 50*

---
```

**MIME Type**: `text/markdown; charset=utf-8`

**File Extension**: `.md`

**Compatibility**: ✅ GitHub, VS Code, and standard Markdown renderers

## Configuration Options

The `ExportConfig` object controls what data is included in the export:

| Field | Type | Description |
|-------|------|-------------|
| `scope` | `'selected' \| 'filtered' \| 'all'` | Which conversations to export |
| `format` | `'json' \| 'jsonl' \| 'csv' \| 'markdown'` | Output format |
| `includeMetadata` | `boolean` | Include conversation metadata |
| `includeQualityScores` | `boolean` | Include quality metrics |
| `includeTimestamps` | `boolean` | Include created/updated dates |
| `includeApprovalHistory` | `boolean` | Include review history |
| `includeParentReferences` | `boolean` | Include parent template/scenario references |
| `includeFullContent` | `boolean` | Include complete turn content |

### Configuration Examples

**Minimal Export (Training Only)**:
```typescript
const minimalConfig: ExportConfig = {
  scope: 'all',
  format: 'jsonl',
  includeMetadata: false,
  includeQualityScores: false,
  includeTimestamps: false,
  includeApprovalHistory: false,
  includeParentReferences: false,
  includeFullContent: true,
};
```

**Full Export (Analysis and Debugging)**:
```typescript
const fullConfig: ExportConfig = {
  scope: 'all',
  format: 'json',
  includeMetadata: true,
  includeQualityScores: true,
  includeTimestamps: true,
  includeApprovalHistory: true,
  includeParentReferences: true,
  includeFullContent: true,
};
```

## Error Handling

### Transformation Errors

Individual conversation errors do not stop the entire export:

```typescript
for (const conversation of conversations) {
  try {
    // Transform conversation
  } catch (error) {
    console.error(`Error transforming conversation ${conversation.conversation_id}:`, error);
    // Continue processing other conversations
  }
}
```

### Validation Errors

Validation throws descriptive errors with specific details:

```typescript
try {
  transformer.validateOutput(output);
} catch (error) {
  // Error message includes:
  // - Line number (for JSONL)
  // - Field name
  // - Specific problem
  console.error(error.message);
  // Example: "Line 5: Invalid role: moderator"
}
```

## Performance Considerations

### Memory Management

- **Small exports (<100 conversations)**: Process in memory
- **Medium exports (100-1000)**: Use batching (not yet implemented)
- **Large exports (>1000)**: Use streaming (not yet implemented)

### Current Implementation

The current implementation loads all data into memory. For production use with large datasets:

1. Implement streaming with Node.js `stream` module
2. Process conversations in batches of 100
3. Write output incrementally to avoid memory pressure

### Performance Benchmarks

Based on testing with sample data:

| Dataset Size | Format | Output Size | Processing Time |
|--------------|--------|-------------|-----------------|
| 100 conversations | JSONL | ~150 KB | <100ms |
| 100 conversations | JSON | ~200 KB | <100ms |
| 1000 conversations | JSONL | ~1.5 MB | <500ms |
| 1000 conversations | JSON | ~2 MB | <500ms |

## Testing

### Running Tests

```bash
# Run test script
npx tsx src/lib/export-transformers/test-transformers.ts
```

### Test Coverage

The test script validates:

1. **Format Compliance**: Output matches format specification
2. **Metadata Filtering**: Config flags control output correctly
3. **Error Handling**: Individual errors don't break entire export
4. **Validation**: Invalid output is detected with specific errors
5. **Large Datasets**: Performance with 100+ conversations
6. **Factory Function**: Correct transformer returned for each format

### Sample Output Files

- `sample-exports/test-output.jsonl` - Example JSONL export with metadata
- `sample-exports/test-output.json` - Example JSON export with full structure
- `sample-exports/test-output.csv` - Example CSV export with special characters
- `sample-exports/test-output.md` - Example Markdown export with formatting

## API Integration

### Using in API Routes

```typescript
// pages/api/export.ts
import { getTransformer } from '@/lib/export-transformers';

export default async function handler(req, res) {
  const { format, config } = req.body;
  
  // Fetch data from database
  const conversations = await fetchConversations();
  const turns = await fetchTurns(conversations);
  
  // Transform
  const transformer = getTransformer(format);
  const output = await transformer.transform(conversations, turns, config);
  
  // Validate
  transformer.validateOutput(output);
  
  // Return with appropriate headers
  res.setHeader('Content-Type', transformer.getMimeType());
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="export.${transformer.getFileExtension()}"`
  );
  res.send(output);
}
```

## Extending with New Formats

To add a new export format:

1. **Create transformer class** implementing `IExportTransformer`
2. **Add format to factory** in `index.ts`
3. **Update ExportConfig type** to include new format
4. **Add tests** to test script
5. **Document format** in this README

Example:

```typescript
// csv-transformer.ts
export class CSVTransformer implements IExportTransformer {
  async transform(conversations, turns, config): Promise<string> {
    // CSV transformation logic
  }
  
  validateOutput(output: string): boolean {
    // CSV validation logic
  }
  
  getFileExtension(): string {
    return 'csv';
  }
  
  getMimeType(): string {
    return 'text/csv';
  }
}

// index.ts
export function getTransformer(format: ExportConfig['format']): IExportTransformer {
  switch (format) {
    case 'jsonl': return new JSONLTransformer();
    case 'json': return new JSONTransformer();
    case 'csv': return new CSVTransformer(); // New format
    default: throw new Error(`Unknown format: ${format}`);
  }
}
```

## Troubleshooting

### Common Issues

**Issue**: "Missing or invalid messages array"
- **Cause**: Conversation has no turns or turns map is empty
- **Solution**: Verify turns are properly loaded and mapped to conversation_id

**Issue**: "Invalid role: moderator"
- **Cause**: Turn has role other than 'system', 'user', or 'assistant'
- **Solution**: Check database schema and ensure roles are normalized

**Issue**: "Conversation count mismatch"
- **Cause**: JSON export count doesn't match array length
- **Solution**: Check for filtering errors in transform logic

### Debug Mode

Enable detailed logging:

```typescript
// Set before transformation
process.env.DEBUG_TRANSFORMERS = 'true';

// Transformer will log:
// - Conversation processing progress
// - Metadata inclusion decisions
// - Validation steps
```

## OpenAI Fine-tuning Integration

### Preparing JSONL for Fine-tuning

1. Export with minimal config (messages only)
2. Validate format with OpenAI's tools:
   ```bash
   openai tools fine_tunes.prepare_data -f export.jsonl
   ```
3. Upload and create fine-tuning job:
   ```bash
   openai api fine_tunes.create -t export.jsonl -m gpt-3.5-turbo
   ```

### Best Practices

- **Message Count**: Aim for 50-200 conversations per fine-tune
- **Quality**: Export only approved conversations with high quality scores
- **Diversity**: Include varied personas, emotions, and topics
- **Testing**: Hold out 10-20% of conversations for validation

## License

Part of the Interactive LoRA Conversation Generation Module.

