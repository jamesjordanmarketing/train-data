# Export Modal UI - Quick Reference Guide

**Version:** 1.0  
**Last Updated:** 2025-10-31

---

## Component Overview

| Component | Purpose | File | Lines |
|-----------|---------|------|-------|
| ExportScopeSelector | Select export scope | `export/ExportScopeSelector.tsx` | 121 |
| ExportFormatSelector | Choose file format | `export/ExportFormatSelector.tsx` | 134 |
| ExportOptionsPanel | Configure export options | `export/ExportOptionsPanel.tsx` | 150 |
| ExportPreview | Preview export data | `export/ExportPreview.tsx` | 423 |
| ExportModal | Main modal container | `dashboard/ExportModal.tsx` | 315 |

---

## Export Scopes

| Scope | Description | Count Source |
|-------|-------------|--------------|
| **Selected** | Only selected conversations | `selectedConversationIds.length` |
| **Filtered** | Conversations matching filters | `filteredConversations.length` |
| **Approved** | All approved conversations | `status === 'approved'` |
| **All** | Entire dataset | `conversations.length` |

---

## Export Formats

| Format | Icon | Use Case | Recommended |
|--------|------|----------|-------------|
| **JSONL** | 📄 | LoRA Training & ML Pipelines | ✅ Yes |
| **JSON** | 🔧 | Programmatic Access & APIs | No |
| **CSV** | 📊 | Spreadsheets & Analysis | No |
| **Markdown** | 📝 | Documentation & Review | No |

---

## Export Options

| Option | Default | Description | Fields Added |
|--------|---------|-------------|--------------|
| **Include Metadata** | ✅ | Conversation metadata | title, persona, emotion, category, tier, status |
| **Include Quality Scores** | ✅ | Quality metrics | qualityScore, qualityMetrics |
| **Include Timestamps** | ✅ | Date/time info | createdAt, updatedAt |
| **Include Approval History** | ❌ | Review actions | reviewHistory |
| **Include Parent References** | ❌ | Template/scenario links | parentId, parentType |
| **Include Full Content** | ✅ | All conversation turns | turns, totalTurns, totalTokens |

---

## API Integration

### Request Format

```typescript
POST /api/export/conversations
{
  "config": {
    "scope": "selected" | "filtered" | "all",
    "format": "jsonl" | "json" | "csv" | "markdown",
    "includeMetadata": boolean,
    "includeQualityScores": boolean,
    "includeTimestamps": boolean,
    "includeApprovalHistory": boolean,
    "includeParentReferences": boolean,
    "includeFullContent": boolean
  },
  "conversationIds": ["uuid", ...],  // For scope: 'selected'
  "filters": FilterConfig              // For scope: 'filtered'
}
```

### Response Format (Synchronous)

```typescript
{
  "export_id": "uuid",
  "status": "completed",
  "conversation_count": number,
  "file_size": number,
  "file_url": "https://...",
  "filename": "conversations-export-2025-10-31.jsonl",
  "expires_at": "ISO 8601 datetime"
}
```

### Response Format (Background)

```typescript
{
  "export_id": "uuid",
  "status": "queued",
  "conversation_count": number,
  "message": "Export queued for background processing"
}
```

---

## Common Usage Patterns

### Opening the Modal

```typescript
import { useAppStore } from '@/stores/useAppStore';

const { openExportModal } = useAppStore();

<Button onClick={openExportModal}>Export</Button>
```

### Custom Configuration

```typescript
const [scope, setScope] = useState<ExportScope>('approved');
const [format, setFormat] = useState<ExportFormat>('jsonl');
const [options, setOptions] = useState<ExportOptions>({
  includeMetadata: true,
  includeQualityScores: true,
  includeTimestamps: true,
  includeApprovalHistory: false,
  includeParentReferences: false,
  includeFullContent: true,
});
```

### Handling Export Response

```typescript
const response = await fetch('/api/export/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(exportRequest)
});

const result = await response.json();

if (result.status === 'completed') {
  // Download file immediately
  window.open(result.file_url, '_blank');
  toast.success(`Exported ${result.conversation_count} conversations`);
} else if (result.status === 'queued') {
  // Background processing
  toast.info('Export queued. You will be notified when ready.');
}
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between controls |
| `Shift + Tab` | Navigate backwards |
| `Arrow Up/Down` | Navigate radio options |
| `Space` | Toggle checkbox/radio |
| `Enter` | Activate button |
| `Esc` | Close modal |

---

## State Management

### Zustand Store Integration

```typescript
const {
  // Modal state
  showExportModal,
  closeExportModal,
  
  // Data state
  conversations,
  selectedConversationIds,
  filters,
  
  // Actions
  openExportModal,
} = useAppStore();
```

### Local State

```typescript
// Export configuration
const [scope, setScope] = useState<ExportScope>('all');
const [format, setFormat] = useState<ExportFormat>('jsonl');
const [options, setOptions] = useState<ExportOptions>({...});
const [isExporting, setIsExporting] = useState(false);

// Derived state (memoized)
const filteredConversations = useMemo(() => {...}, [conversations, filters]);
const approvedConversations = useMemo(() => {...}, [conversations]);
const conversationsToExport = useMemo(() => {...}, [scope, conversations]);
const counts = useMemo(() => {...}, [selectedConversationIds, filteredConversations]);
```

---

## Performance Considerations

| Aspect | Optimization | Benefit |
|--------|--------------|---------|
| **Filtering** | `useMemo` hooks | Prevents unnecessary recalculations |
| **Preview** | First 3 conversations only | Reduces DOM complexity |
| **Rendering** | Collapsible sections | Lazy rendering of content |
| **API** | Background processing for >500 | Prevents timeout errors |

---

## Error Handling

### Client-Side Validation

```typescript
if (conversationsToExport.length === 0) {
  toast.error('No conversations to export');
  return;
}
```

### API Error Handling

```typescript
try {
  const response = await fetch('/api/export/conversations', {...});
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Export failed');
  }
} catch (error) {
  toast.error('Failed to export conversations', {
    description: error.message
  });
}
```

---

## Testing Checklist

- [ ] Test each scope option
- [ ] Verify counts are accurate
- [ ] Test each format option
- [ ] Verify preview renders correctly
- [ ] Toggle all options on/off
- [ ] Test "Reset to Defaults"
- [ ] Complete full export flow
- [ ] Test with 0 conversations
- [ ] Test with empty selection
- [ ] Test keyboard navigation
- [ ] Test copy to clipboard
- [ ] Test API error scenarios

---

## Common Issues & Solutions

### Issue: Export button disabled
**Cause:** No conversations match selection  
**Solution:** Adjust filters or select conversations

### Issue: Preview not showing
**Cause:** Preview hidden or no data  
**Solution:** Click "Show Preview" or check data

### Issue: API returns 404
**Cause:** No conversations found  
**Solution:** Verify scope and filters

### Issue: Download blocked
**Cause:** Browser popup blocker  
**Solution:** Allow popups for this site

---

## Format-Specific Details

### JSONL Format
```jsonl
{"id":"1","title":"...","turns":[...]}
{"id":"2","title":"...","turns":[...]}
```
- One conversation per line
- Easy to stream
- Perfect for ML training

### JSON Format
```json
[
  {"id":"1","title":"...","turns":[...]},
  {"id":"2","title":"...","turns":[...]}
]
```
- Pretty-printed array
- Standard JSON structure
- Easy to parse

### CSV Format
```csv
id,title,persona,emotion,status,qualityScore
1,"Conversation 1","Expert","Neutral","approved",85
2,"Conversation 2","Beginner","Excited","pending",72
```
- Flat structure
- Excel-compatible
- Good for analysis

### Markdown Format
```markdown
# Conversation 1: Title

**Metadata:**
- Persona: Expert
- Emotion: Neutral

## Conversation
### Turn 1 (user)
Hello, how can I help?
```
- Human-readable
- GitHub-compatible
- Good for documentation

---

## Dependencies

```json
{
  "@radix-ui/react-accordion": "^1.2.3",
  "@radix-ui/react-checkbox": "^1.1.4",
  "@radix-ui/react-dialog": "^1.1.6",
  "@radix-ui/react-label": "^2.1.2",
  "@radix-ui/react-radio-group": "^1.2.3",
  "@radix-ui/react-scroll-area": "^1.2.3",
  "@radix-ui/react-separator": "^1.1.2",
  "@radix-ui/react-tooltip": "^1.1.8",
  "lucide-react": "^0.487.0",
  "sonner": "^2.0.3",
  "zustand": "*"
}
```

---

## File Locations

```
train-wireframe/src/components/
├── export/
│   ├── ExportScopeSelector.tsx
│   ├── ExportFormatSelector.tsx
│   ├── ExportOptionsPanel.tsx
│   ├── ExportPreview.tsx
│   └── index.ts
└── dashboard/
    └── ExportModal.tsx
```

---

## Type Definitions

```typescript
type ExportScope = 'selected' | 'filtered' | 'approved' | 'all';
type ExportFormat = 'jsonl' | 'json' | 'csv' | 'markdown';

interface ExportOptions {
  includeMetadata: boolean;
  includeQualityScores: boolean;
  includeTimestamps: boolean;
  includeApprovalHistory: boolean;
  includeParentReferences: boolean;
  includeFullContent: boolean;
}

interface Conversation {
  id: string;
  title: string;
  persona: string;
  emotion: string;
  tier: TierType;
  category: string[];
  status: ConversationStatus;
  qualityScore: number;
  qualityMetrics?: QualityMetrics;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  turns: ConversationTurn[];
  totalTurns: number;
  totalTokens: number;
  parentId?: string;
  parentType?: 'template' | 'scenario';
  parameters: Record<string, any>;
  reviewHistory: ReviewAction[];
}
```

---

**END OF QUICK REFERENCE**

