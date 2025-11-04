# Chunk Selector Integration Guide

## Quick Start

### 1. Basic Usage

```typescript
import { ChunkSelector } from '@/components/chunks';
import { ChunkWithDimensions } from '@/lib/chunks-integration';

function MyComponent() {
  const [selectedChunkId, setSelectedChunkId] = useState<string>();

  const handleChunkSelect = (chunkId: string, chunk: ChunkWithDimensions) => {
    setSelectedChunkId(chunkId);
    console.log('Chunk selected:', chunk);
  };

  return (
    <div style={{ height: '600px' }}>
      <ChunkSelector
        onSelect={handleChunkSelect}
        selectedChunkId={selectedChunkId}
      />
    </div>
  );
}
```

### 2. Integration with Conversation Form

Add chunk selection to an existing conversation creation form:

```typescript
import { useState } from 'react';
import { ChunkSelector } from '@/components/chunks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function CreateConversationForm() {
  const [formData, setFormData] = useState({
    title: '',
    persona: '',
    emotion: '',
    linkedChunkId: undefined as string | undefined
  });

  const [showChunkSelector, setShowChunkSelector] = useState(false);

  const handleChunkSelect = (chunkId: string, chunk: ChunkWithDimensions) => {
    setFormData(prev => ({
      ...prev,
      linkedChunkId: chunkId
    }));
    setShowChunkSelector(false);
  };

  const handleSubmit = async () => {
    // Save conversation with linked chunk
    await createConversation({
      ...formData,
      parentChunkId: formData.linkedChunkId
    });
  };

  return (
    <div>
      <form>
        {/* Other form fields */}
        <input 
          type="text" 
          placeholder="Title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
        
        {/* Chunk Selection Section */}
        <Card className="p-4 mt-4">
          <h3>Link Source Chunk (Optional)</h3>
          <Button onClick={() => setShowChunkSelector(!showChunkSelector)}>
            {formData.linkedChunkId ? 'Change Chunk' : 'Select Chunk'}
          </Button>
          
          {showChunkSelector && (
            <div className="mt-4 h-[500px]">
              <ChunkSelector
                onSelect={handleChunkSelect}
                selectedChunkId={formData.linkedChunkId}
              />
            </div>
          )}
        </Card>

        <Button onClick={handleSubmit}>Create Conversation</Button>
      </form>
    </div>
  );
}
```

### 3. Integration with Dialog/Modal

Use in a modal for better UX:

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChunkSelector } from '@/components/chunks';

function ChunkSelectorDialog({ 
  open, 
  onOpenChange, 
  onSelect 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (chunkId: string, chunk: ChunkWithDimensions) => void;
}) {
  const handleSelect = (chunkId: string, chunk: ChunkWithDimensions) => {
    onSelect(chunkId, chunk);
    onOpenChange(false); // Close dialog after selection
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Source Chunk</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ChunkSelector onSelect={handleSelect} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Usage
function ParentComponent() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        Select Chunk
      </Button>

      <ChunkSelectorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={(id, chunk) => console.log('Selected:', id)}
      />
    </>
  );
}
```

## Service Layer Integration

### Verifying Service Connection

Before using the ChunkSelector, verify the chunks service is properly configured:

```typescript
import { chunksService } from '@/lib/chunks-integration';

// Test connection
async function verifyChunksService() {
  if (!chunksService) {
    console.error('Chunks service not initialized. Check environment variables:');
    console.error('- VITE_SUPABASE_URL');
    console.error('- VITE_SUPABASE_ANON_KEY');
    return false;
  }

  const isConnected = await chunksService.testConnection();
  if (!isConnected) {
    console.error('Failed to connect to chunks database');
    return false;
  }

  console.log('✓ Chunks service connected successfully');
  return true;
}

// Run verification
verifyChunksService();
```

### Service Methods Used

The ChunkSelector integrates with these service methods:

1. **searchChunks** - Search chunks by content
```typescript
const results = await chunksService.searchChunks(query, {
  limit: 50,
  minQuality: 6,
  includeContent: true
});
```

2. **getChunksByDocument** - Get all chunks for a document
```typescript
const chunks = await chunksService.getChunksByDocument(documentId, {
  limit: 100,
  minQuality: 6,
  sortBy: 'page'
});
```

3. **getChunkById** - Get single chunk by ID
```typescript
const chunk = await chunksService.getChunkById(chunkId);
```

## Data Flow

### Selection Flow
```
User Action (Click/Enter)
  ↓
ChunkSelector handleChunkClick()
  ↓
onSelect callback with (chunkId, chunk)
  ↓
Parent component receives data
  ↓
Update local state
  ↓
Save to database (API call)
  ↓
Update UI (show success)
```

### Search Flow
```
User types in search input
  ↓
Debounce 300ms
  ↓
debouncedSearch() called
  ↓
fetchChunks(query, filters)
  ↓
chunksService.searchChunks()
  ↓
Results returned
  ↓
Update chunks state
  ↓
Re-render ChunkCard list
```

## Database Schema Integration

### Conversation Schema
Update your conversation schema to link chunks:

```typescript
interface Conversation {
  id: string;
  title: string;
  // ... other fields
  
  // Chunk reference fields
  parentChunkId?: string;           // ID of linked chunk
  chunkContext?: string;            // Cached chunk content
  dimensionSource?: DimensionSource; // Dimension metadata
}
```

### Saving Chunk Reference

```typescript
async function createConversationWithChunk(
  conversationData: Partial<Conversation>,
  chunkId: string,
  chunk: ChunkWithDimensions
) {
  const conversation: Conversation = {
    ...conversationData,
    id: generateId(),
    parentChunkId: chunkId,
    chunkContext: chunk.content,
    dimensionSource: chunk.dimensions
  };

  // Save to database
  await supabase
    .from('conversations')
    .insert(conversation);

  return conversation;
}
```

## API Integration

If you're using an API layer:

```typescript
// API endpoint: POST /api/conversations
async function createConversation(data: {
  title: string;
  persona: string;
  emotion: string;
  chunkId?: string;
}) {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }

  return response.json();
}

// Usage in component
const handleSubmit = async (formData) => {
  try {
    const conversation = await createConversation({
      title: formData.title,
      persona: formData.persona,
      emotion: formData.emotion,
      chunkId: formData.linkedChunkId
    });

    toast.success('Conversation created successfully');
  } catch (error) {
    toast.error('Failed to create conversation');
  }
};
```

## State Management Integration

### Using Zustand Store

```typescript
import { create } from 'zustand';

interface ConversationStore {
  selectedChunk: ChunkWithDimensions | null;
  setSelectedChunk: (chunk: ChunkWithDimensions | null) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  selectedChunk: null,
  setSelectedChunk: (chunk) => set({ selectedChunk: chunk }),
}));

// Usage in component
function ConversationForm() {
  const { selectedChunk, setSelectedChunk } = useConversationStore();

  const handleChunkSelect = (chunkId: string, chunk: ChunkWithDimensions) => {
    setSelectedChunk(chunk);
  };

  return (
    <ChunkSelector
      onSelect={handleChunkSelect}
      selectedChunkId={selectedChunk?.id}
    />
  );
}
```

### Using React Context

```typescript
import { createContext, useContext, useState } from 'react';

const ChunkContext = createContext<{
  selectedChunk: ChunkWithDimensions | null;
  selectChunk: (chunk: ChunkWithDimensions) => void;
} | null>(null);

export function ChunkProvider({ children }) {
  const [selectedChunk, setSelectedChunk] = useState<ChunkWithDimensions | null>(null);

  return (
    <ChunkContext.Provider 
      value={{ 
        selectedChunk, 
        selectChunk: setSelectedChunk 
      }}
    >
      {children}
    </ChunkContext.Provider>
  );
}

export function useChunk() {
  const context = useContext(ChunkContext);
  if (!context) throw new Error('useChunk must be used within ChunkProvider');
  return context;
}
```

## Acceptance Criteria Verification

### ✅ Functional Requirements

1. **FR9.1.1 - Display searchable list**
   - ✅ Implemented with debounced search input
   - ✅ Results displayed in scrollable list

2. **FR9.1.2 - Show chunk preview**
   - ✅ ChunkCard displays title, snippet, metadata
   - ✅ ChunkDetailPanel shows full content

3. **FR9.1.3 - Support filtering**
   - ✅ Document filter (dropdown)
   - ✅ Quality score filter (slider)
   - ✅ Category filter (architecture in place)

4. **FR9.1.4 - Highlight selected chunk**
   - ✅ Visual indicator with border and background
   - ✅ "Selected" badge shown

5. **FR9.1.5 - Display chunk metadata**
   - ✅ Quality score badge
   - ✅ Document title and page range
   - ✅ Dimensions in detail panel

6. **FR9.1.6 - Handle loading states**
   - ✅ Skeleton placeholders during load
   - ✅ Empty state for no results

7. **FR9.1.7 - Keyboard navigation**
   - ✅ Arrow keys (↑↓)
   - ✅ Enter to select
   - ✅ Escape to close

8. **FR9.1.8 - Single-select mode**
   - ✅ Only one chunk selected at a time

## Testing the Integration

### Manual Test Script

```typescript
// 1. Test search functionality
console.log('Test 1: Search functionality');
// - Type "investment" in search box
// - Wait 300ms
// - Verify results appear
// - Type more characters
// - Verify results update

// 2. Test filters
console.log('Test 2: Filter functionality');
// - Adjust quality slider to 8
// - Verify only high-quality chunks shown
// - Clear filters
// - Verify all chunks shown again

// 3. Test selection
console.log('Test 3: Selection');
// - Click on a chunk
// - Verify detail panel opens
// - Verify chunk highlighted
// - Click "Select This Chunk"
// - Verify onSelect callback triggered

// 4. Test keyboard navigation
console.log('Test 4: Keyboard navigation');
// - Press ↓ arrow key
// - Verify focus moves down
// - Press Enter
// - Verify detail panel opens
// - Press Escape
// - Verify detail panel closes

console.log('✓ All tests completed');
```

### Automated Testing (Future)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChunkSelector } from '@/components/chunks';

describe('ChunkSelector', () => {
  it('renders search input', () => {
    render(<ChunkSelector onSelect={jest.fn()} />);
    expect(screen.getByPlaceholderText(/search chunks/i)).toBeInTheDocument();
  });

  it('calls onSelect when chunk clicked', async () => {
    const handleSelect = jest.fn();
    render(<ChunkSelector onSelect={handleSelect} />);
    
    // Wait for chunks to load
    await waitFor(() => {
      expect(screen.getByText(/chunk title/i)).toBeInTheDocument();
    });

    // Click chunk
    fireEvent.click(screen.getByText(/chunk title/i));
    
    // Verify callback
    expect(handleSelect).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Issue: "Chunks service not initialized"

**Solution:**
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# If missing, add to .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Issue: No chunks displayed

**Solution:**
```typescript
// Verify database has chunks
const count = await chunksService.getChunkCount('all');
console.log('Total chunks:', count);

// If count is 0, import chunks from chunks-alpha module
```

### Issue: Search not working

**Solution:**
```typescript
// Check search is debouncing correctly
console.log('Search query:', searchQuery);
console.log('Debounce timer:', debounceTimerRef.current);

// Verify chunksService.searchChunks exists
console.log('searchChunks method:', chunksService?.searchChunks);
```

## Best Practices

1. **Always handle errors** - Wrap service calls in try-catch
2. **Show loading states** - Use skeleton placeholders
3. **Debounce user input** - Prevent excessive API calls
4. **Cache results** - Use service layer caching
5. **Provide feedback** - Show success/error messages
6. **Support keyboard** - Ensure accessibility
7. **Test thoroughly** - Follow test script above

## Next Steps

1. Add to your conversation creation form
2. Test with real chunk data
3. Customize styling to match your design system
4. Add analytics tracking for chunk selection
5. Implement chunk usage statistics

