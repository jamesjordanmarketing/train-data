# Quick Start: Conversation Detail Modal

A concise guide for using and customizing the Conversation Detail Modal component.

---

## 🚀 Basic Usage

### Opening the Modal

The modal automatically opens when clicking a conversation row in the table:

```typescript
// Already implemented in ConversationTable.tsx
<TableRow onClick={() => openConversationDetail(conversation.id)}>
  ...
</TableRow>
```

### Programmatic Access

```typescript
import { useConversationStore } from '@/stores/conversation-store';

function MyComponent() {
  const openDetail = useConversationStore((state) => state.openConversationDetail);
  const closeDetail = useConversationStore((state) => state.closeConversationDetail);
  
  return (
    <Button onClick={() => openDetail('conversation-id')}>
      View Details
    </Button>
  );
}
```

---

## 🎯 Key Features

### 1. Turn-by-Turn Display
- Chat-like interface with avatars
- Color-coded by role (blue = user, purple = assistant)
- Shows turn number and token count

### 2. Metadata Panels
- **Basic Info**: Status, tier, turn count, timestamps
- **Context**: Persona, emotion, topic, intent, tone
- **Quality Metrics**: Visual progress bars for each metric
- **Review History**: Timeline of all review actions

### 3. Review Actions
```typescript
// Three action buttons available:
1. Approve → Sets status to 'approved'
2. Request Revision → Sets status to 'needs_revision'
3. Reject → Sets status to 'rejected'

// All actions support optional comments
```

### 4. Navigation
```typescript
// Navigate between conversations:
- Click "Previous" / "Next" buttons
- Press Left/Right arrow keys
- ESC key closes modal
```

---

## 🎨 Component Structure

```
ConversationDetailModal (Root)
├── Dialog wrapper
├── Loading state (Skeleton)
├── Error state (Alert)
└── ConversationDetailView
    ├── Navigation header
    │   ├── Conversation ID
    │   ├── Position indicator
    │   └── Previous/Next buttons
    ├── Left column (66%)
    │   └── ConversationTurns
    │       └── Turn bubbles
    └── Right column (33%)
        ├── ConversationMetadataPanel
        │   ├── Basic Info card
        │   ├── Context card
        │   ├── Quality Metrics card
        │   └── Review History card
        └── ConversationReviewActions
            ├── Comment textarea
            └── Action buttons
```

---

## 🔧 Customization Examples

### Modify Column Width

```typescript
// In ConversationDetailView.tsx
<div className="grid grid-cols-4 gap-6">
  {/* 75% width for turns */}
  <div className="col-span-3">
    <ConversationTurns turns={turns} />
  </div>
  
  {/* 25% width for metadata */}
  <div>
    <ConversationMetadataPanel conversation={conversation} />
  </div>
</div>
```

### Add Custom Metadata Field

```typescript
// In ConversationMetadataPanel.tsx
{conversation.customField && (
  <div>
    <span className="text-xs font-medium text-muted-foreground">
      Custom Field
    </span>
    <p className="mt-1 text-sm">{conversation.customField}</p>
  </div>
)}
```

### Add Custom Review Action

```typescript
// In ConversationReviewActions.tsx
<Button
  onClick={() => handleReviewAction('custom_action', 'Custom Action', 'custom_status')}
  className="w-full"
  variant="outline"
>
  <CustomIcon className="h-4 w-4 mr-2" />
  Custom Action
</Button>
```

### Change Turn Colors

```typescript
// In ConversationTurns.tsx
<div className={cn(
  "rounded-lg p-4",
  turn.role === 'user' 
    ? 'bg-green-50 border-green-200'  // Changed from blue
    : 'bg-orange-50 border-orange-200' // Changed from purple
)}>
```

---

## 📊 Data Requirements

### Minimum Required Data

```typescript
// Conversation must have:
{
  id: string;
  conversationId: string;
  status: ConversationStatus;
  tier: TierType;
  turnCount: number;
  createdAt: string;
  updatedAt: string;
}

// Turns must have:
{
  id: string;
  turnNumber: number;
  role: 'user' | 'assistant';
  content: string;
}
```

### Optional Enhancement Data

```typescript
// These enhance the display but are not required:
{
  persona?: string;
  emotion?: string;
  topic?: string;
  intent?: string;
  tone?: string;
  qualityMetrics?: QualityMetrics;
  reviewHistory?: ReviewAction[];
  turns?: ConversationTurn[];
}
```

---

## 🐛 Troubleshooting

### Modal Doesn't Open

```typescript
// Check 1: Is the store action being called?
const openDetail = useConversationStore((state) => state.openConversationDetail);
console.log('Opening conversation:', id);
openDetail(id);

// Check 2: Is the modal component rendered?
// Make sure ConversationDetailModal is in your component tree
<ConversationDashboard />
  └── <ConversationDetailModal /> // Must be present
```

### Data Not Loading

```typescript
// Check 1: Verify the API endpoint
// Modal calls: GET /api/conversations/:id?includeTurns=true

// Check 2: Check React Query DevTools
// Look for query key: ['conversations', 'detail', conversationId]

// Check 3: Check console for errors
const { data, error } = useConversation(conversationId);
console.log('Data:', data);
console.log('Error:', error);
```

### Navigation Not Working

```typescript
// Check 1: Is useFilteredConversations returning data?
const { conversations } = useFilteredConversations();
console.log('Available conversations:', conversations.length);

// Check 2: Is the conversation in the filtered list?
const currentIndex = conversations.findIndex(c => c.id === conversation.id);
console.log('Current index:', currentIndex); // Should be >= 0
```

### Review Actions Not Saving

```typescript
// Check 1: Is the mutation being called?
const updateMutation = useUpdateConversation();
console.log('Mutation state:', updateMutation.status);

// Check 2: Check the API endpoint
// Modal calls: PATCH /api/conversations/:id

// Check 3: Verify the update payload
console.log('Update payload:', {
  id: conversation.id,
  updates: { status, reviewHistory }
});
```

---

## ⚡ Performance Tips

### 1. Prefetch Next Conversation

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { conversationKeys } from '@/hooks/use-conversations';

// In ConversationDetailView.tsx
const queryClient = useQueryClient();

useEffect(() => {
  // Prefetch next conversation
  if (hasNext) {
    const nextId = conversations[currentIndex + 1].id;
    queryClient.prefetchQuery({
      queryKey: conversationKeys.detail(nextId),
      queryFn: () => fetchConversationById(nextId),
    });
  }
}, [currentIndex, hasNext]);
```

### 2. Virtualize Long Conversations

```typescript
// For conversations with 100+ turns, consider virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

// In ConversationTurns.tsx
const parentRef = useRef<HTMLDivElement>(null);

const rowVirtualizer = useVirtualizer({
  count: turns.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 150, // Estimated height per turn
});
```

### 3. Lazy Load Review History

```typescript
// Only fetch review history when metadata panel is visible
const { data: reviewHistory } = useQuery({
  queryKey: ['review-history', conversation.id],
  queryFn: () => fetchReviewHistory(conversation.id),
  enabled: !!conversation.id && isMetadataPanelVisible,
});
```

---

## 📚 Additional Resources

- **Type Definitions**: `src/lib/types/conversations.ts`
- **Store Documentation**: `src/stores/conversation-store.ts`
- **Hook Documentation**: `src/hooks/use-conversations.ts`
- **Component Files**: `src/components/conversations/`

---

## 🎯 Common Use Cases

### Use Case 1: Quick Review Workflow

```typescript
1. Click conversation in table
2. Scan turns for quality issues
3. Check quality metrics
4. Click "Approve" or "Reject"
5. (Optional) Add comment
6. Press Enter or click button
7. Modal auto-closes
8. Next conversation
```

### Use Case 2: Detailed Analysis

```typescript
1. Click conversation in table
2. Read each turn carefully
3. Check metadata for context
4. Review quality metrics
5. Add detailed comment
6. Click "Request Revision" with specific feedback
7. Navigate to next with arrow key
```

### Use Case 3: Bulk Review Session

```typescript
1. Open first conversation
2. Make quick review decision
3. Press Right Arrow to next
4. Repeat for each conversation
5. ESC to exit when done
```

---

## ✅ Checklist for Integration

- [ ] ConversationDetailModal component added to dashboard
- [ ] Store actions (openConversationDetail, closeConversationDetail) working
- [ ] API endpoint `/api/conversations/:id?includeTurns=true` returns data
- [ ] API endpoint `PATCH /api/conversations/:id` accepts updates
- [ ] Table rows call `openConversationDetail` on click
- [ ] Toast notifications configured (sonner)
- [ ] React Query provider configured
- [ ] All shadcn/ui components installed

---

**Need help?** Check the full documentation in `PROMPT-4-DELIVERABLES.md`

