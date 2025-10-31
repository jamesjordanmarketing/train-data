# Export Transformers - Visual Reference

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Export Transformers                       │
│                   (Strategy Pattern)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │      IExportTransformer Interface      │
        │  ────────────────────────────────────  │
        │  + transform()                         │
        │  + validateOutput()                    │
        │  + getFileExtension()                  │
        │  + getMimeType()                       │
        └───────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│ JSONLTransformer │                  │ JSONTransformer  │
│ ──────────────── │                  │ ──────────────── │
│ • One line/conv  │                  │ • Pretty JSON    │
│ • OpenAI format  │                  │ • With summary   │
│ • Training ready │                  │ • For analysis   │
└──────────────────┘                  └──────────────────┘
        │                                       │
        │                                       │
        ▼                                       ▼
   *.jsonl file                            *.json file
```

## Data Flow

```
┌──────────────┐
│  API Request │
│   (format)   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  getTransformer()    │
│  Factory Function    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐       ┌──────────────────┐
│   Fetch Data from    │──────▶│  Conversations   │
│      Database        │       │    + Turns       │
└──────┬───────────────┘       └──────────────────┘
       │
       ▼
┌──────────────────────┐       ┌──────────────────┐
│   Build Turns Map    │──────▶│ Map<id, turns[]> │
│ conversation_id →    │       │                  │
│   turns[]            │       └──────────────────┘
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐       ┌──────────────────┐
│  transformer         │──────▶│  Formatted       │
│   .transform()       │       │  String Output   │
└──────┬───────────────┘       └──────────────────┘
       │
       ▼
┌──────────────────────┐
│  transformer         │
│   .validateOutput()  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Return File        │
│  (download/API)      │
└──────────────────────┘
```

## JSONL Format Structure

```
Line 1:  {"messages":[{...},{...}],"metadata":{...}}
Line 2:  {"messages":[{...},{...}],"metadata":{...}}
Line 3:  {"messages":[{...},{...}],"metadata":{...}}
...

Each line:
{
  "messages": [
    {
      "role": "user",
      "content": "Question text"
    },
    {
      "role": "assistant",
      "content": "Response text"
    }
  ],
  "metadata": {                    // Optional
    "conversation_id": "conv-001",
    "title": "...",
    "tier": "template",
    "quality_score": 8.5,
    "created_at": "2025-10-29T...",
    "persona": "...",
    "emotion": "...",
    "topic": "..."
  }
}
```

## JSON Format Structure

```json
{
  "version": "1.0",
  "export_date": "2025-10-31T00:00:00.000Z",
  "conversation_count": 2,
  "conversations": [
    {
      "conversation_id": "conv-001",
      "title": "...",
      "status": "approved",
      "tier": "template",
      "turns": [
        {
          "role": "user",
          "content": "...",
          "token_count": 15
        },
        {
          "role": "assistant",
          "content": "...",
          "token_count": 25
        }
      ],
      "metadata": {              // Optional
        "persona": "...",
        "emotion": "...",
        "topic": "...",
        "category": ["..."],
        "total_turns": 4,
        "token_count": 500,
        "quality_score": 8.5,
        "created_at": "...",
        "updated_at": "...",
        "review_history": [...],
        "parent_id": "...",
        "parent_type": "...",
        "parameters": {...}
      }
    }
  ],
  "summary": {                   // Optional
    "total_turns": 10,
    "average_quality_score": 8.85,
    "tier_distribution": {
      "template": 1,
      "generated": 1
    }
  }
}
```

## Configuration Impact

```
ExportConfig                    Output Impact
─────────────                  ───────────────

format: 'jsonl'          →     One line per conversation
format: 'json'           →     Pretty-printed JSON object

includeMetadata: true    →     Adds metadata object
includeMetadata: false   →     Messages only

includeQualityScores     →     metadata.quality_score
includeTimestamps        →     metadata.created_at, updated_at
includeApprovalHistory   →     metadata.review_history
includeParentReferences  →     metadata.parent_id, parent_type
```

## File Size Comparison

```
Example: 100 conversations, 4 turns each, ~500 tokens/conv

JSONL (minimal):
  ~120 KB    Messages only, no metadata

JSONL (full):
  ~150 KB    With complete metadata

JSON (minimal):
  ~140 KB    Messages + structure, no metadata

JSON (full):
  ~200 KB    Complete structure + metadata + summary

Performance:
  <100ms     Processing time for 100 conversations
  <500ms     Processing time for 1000 conversations
```

## Error Handling Flow

```
┌─────────────────┐
│ Start Transform │
└────────┬────────┘
         │
         ▼
    ┌────────────┐
    │ For each   │◀──────┐
    │conversation│       │
    └────┬───────┘       │
         │               │
         ▼               │
    ┌────────────┐       │
    │   Try      │       │
    │ transform  │       │
    └────┬───────┘       │
         │               │
     ┌───┴───┐           │
     │ Error?│           │
     └───┬───┘           │
         │               │
    ┌────┴────┐          │
    │  Yes    │  No      │
    │         │          │
    ▼         ▼          │
┌────────┐ ┌─────────┐  │
│  Log   │ │  Add to │  │
│ Error  │ │ Output  │  │
└───┬────┘ └────┬────┘  │
    │           │        │
    └───────┬───┘        │
            │            │
            └────────────┘ More conversations?
                 │
                 ▼ No more
         ┌──────────────┐
         │ Return Output│
         │ (partial OK) │
         └──────────────┘
```

## Validation Flow

```
┌──────────────┐
│ validateOutput│
└──────┬───────┘
       │
   ┌───┴────┐
   │ JSONL? │
   └───┬────┘
       │
  ┌────┴─────┐
  │   Yes    │   No (JSON)
  │          │
  ▼          ▼
┌────────┐ ┌────────┐
│ Split  │ │ Parse  │
│ lines  │ │  JSON  │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌─────────┐
│ For    │ │ Check   │
│ each   │ │ version │
│ line   │ │ export_ │
└───┬────┘ │ date    │
    │      └────┬────┘
    ▼           │
┌─────────┐    ▼
│ Parse   │ ┌─────────┐
│ JSON    │ │ Check   │
└───┬─────┘ │ conv_   │
    │       │ count   │
    ▼       └────┬────┘
┌─────────┐     │
│ Check   │     ▼
│messages │ ┌──────────┐
│ array   │ │ For each │
└───┬─────┘ │conv check│
    │       │ required │
    ▼       │ fields   │
┌─────────┐ └────┬─────┘
│ Check   │      │
│ role &  │      ▼
│ content │ ┌──────────┐
└───┬─────┘ │ For each │
    │       │turn check│
    │       │ role &   │
    │       │ content  │
    │       └────┬─────┘
    │            │
    └────┬───────┘
         │
         ▼
    ┌─────────┐
    │ Return  │
    │  true   │
    └─────────┘
```

## Integration Points

```
┌────────────────────────────────────────────────┐
│            Application Layer                    │
├────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐      ┌──────────────┐       │
│  │  UI Button   │      │ API Endpoint │       │
│  │  "Export"    │──┐   │ /api/export  │       │
│  └──────────────┘  │   └──────┬───────┘       │
│                    │          │                │
└────────────────────┼──────────┼────────────────┘
                     │          │
                     ▼          ▼
┌────────────────────────────────────────────────┐
│            Service Layer                        │
├────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         Export Service                    │  │
│  │  • createExportLog()                      │  │
│  │  • updateExportLog()                      │  │
│  └────────────────┬─────────────────────────┘  │
│                   │                             │
│                   ▼                             │
│  ┌──────────────────────────────────────────┐  │
│  │       getTransformer(format)             │  │
│  │  • JSONLTransformer                      │  │
│  │  • JSONTransformer                       │  │
│  └────────────────┬─────────────────────────┘  │
│                   │                             │
└───────────────────┼─────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────┐
│            Data Layer                           │
├────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐      ┌──────────────┐       │
│  │ Conversations│      │    Turns     │       │
│  │   Table      │      │   Table      │       │
│  └──────────────┘      └──────────────┘       │
│                                                 │
└────────────────────────────────────────────────┘
```

## File Extension Mapping

```
Format   │ Extension │ MIME Type
─────────┼───────────┼──────────────────────────
JSONL    │  .jsonl   │ application/x-ndjson
JSON     │  .json    │ application/json
CSV      │  .csv     │ text/csv (Prompt 3)
Markdown │  .md      │ text/markdown (Prompt 3)
```

## Usage Example (Visual)

```typescript
// 1. Import
import { getTransformer } from '@/lib/export-transformers';

// 2. Prepare
const conversations = [...];
const turns = new Map();

// 3. Configure
const config = {
  format: 'jsonl',
  includeMetadata: true,
  // ...
};

// 4. Transform
const transformer = getTransformer('jsonl');
const output = await transformer.transform(conversations, turns, config);

// 5. Validate
transformer.validateOutput(output);

// 6. Use
res.send(output);
```

## Performance Characteristics

```
Dataset Size       Memory      Time        Recommendation
─────────────────────────────────────────────────────────
< 100 convs        < 1 MB      < 100ms     ✅ Use as-is
100-500 convs      1-5 MB      100-300ms   ✅ Use as-is
500-1000 convs     5-10 MB     300-500ms   ⚠️  Consider batching
> 1000 convs       > 10 MB     > 500ms     ❌ Use streaming (Prompt 7)
```

## Type Hierarchy

```
IExportTransformer (interface)
│
├── transform(conversations, turns, config) → Promise<string>
│   │
│   ├── Input: Conversation[]
│   │   └── Contains: id, conversation_id, title, status, etc.
│   │
│   ├── Input: Map<string, ConversationTurn[]>
│   │   └── Key: conversation_id
│   │   └── Value: Array of turns (role, content)
│   │
│   └── Input: ExportConfig
│       └── Controls: metadata inclusion, format, scope
│
├── validateOutput(output) → boolean | throws Error
│   └── Checks format compliance and required fields
│
├── getFileExtension() → string
│   └── Returns: 'jsonl' | 'json' | 'csv' | 'md'
│
└── getMimeType() → string
    └── Returns: MIME type for HTTP headers
```

## Summary: Key Decision Points

```
┌─────────────────────────────────────────────────┐
│ When should I use which format?                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ JSONL when:                                      │
│  ✓ Training AI models (OpenAI, Anthropic)       │
│  ✓ Need streaming/line-by-line processing       │
│  ✓ Want minimal file size                       │
│  ✓ Need independent records                     │
│                                                  │
│ JSON when:                                       │
│  ✓ Data analysis and exploration                │
│  ✓ Need summary statistics                      │
│  ✓ Want human-readable format                   │
│  ✓ Need complete metadata                       │
│                                                  │
└─────────────────────────────────────────────────┘
```

