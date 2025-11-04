# Chunk Selector UI Component

Interactive UI component for searching, filtering, and selecting document chunks from the chunks-alpha module.

## Overview

The Chunk Selector provides an intuitive interface for users to browse, search, and select chunks from the chunks-alpha database. It features debounced search, quality filtering, keyboard navigation, and detailed chunk previews.

## Components

### 1. ChunkSelector (Main Component)
**File:** `ChunkSelector.tsx` (~300 lines)

Main container component that orchestrates the entire chunk selection experience.

**Props:**
```typescript
interface ChunkSelectorProps {
  onSelect: (chunkId: string, chunk: ChunkWithDimensions) => void;
  selectedChunkId?: string;
  documentId?: string; // Optional pre-filter to specific document
  className?: string;
}
```

**Features:**
- Debounced search input (300ms delay)
- Real-time filtering
- Keyboard navigation (↑↓ arrows, Enter, Escape)
- Loading states with skeleton placeholders
- Empty state handling
- Error handling with user-friendly messages
- Integration with chunks service layer

**Usage:**
```typescript
import { ChunkSelector } from '@/components/chunks';

function MyComponent() {
  const handleChunkSelect = (chunkId: string, chunk: ChunkWithDimensions) => {
    console.log('Selected chunk:', chunkId, chunk);
    // Update your state or save to database
  };

  return (
    <div className="h-[600px]">
      <ChunkSelector
        onSelect={handleChunkSelect}
        selectedChunkId={currentChunkId}
      />
    </div>
  );
}
```

### 2. ChunkCard
**File:** `ChunkCard.tsx` (~120 lines)

Individual chunk display card shown in the list.

**Features:**
- Title and section heading display
- Content snippet with truncation
- Quality score badge (color-coded)
- Document and page metadata
- Selection state indicator
- Hover effects
- Keyboard accessibility

**Visual States:**
- Default: White background, gray border
- Hover: Light gray background
- Selected: Primary color border and background tint

### 3. ChunkFilters
**File:** `ChunkFilters.tsx` (~220 lines)

Filter controls for refining chunk search results.

**Features:**
- Document dropdown filter
- Quality score slider (0-10 range)
- Quick quality presets (High ≥8, Medium ≥6, Any)
- Clear all filters button
- Active filters display
- Collapsible UI

**Filter Options:**
```typescript
interface ChunkFilters {
  documentId?: string;      // Filter by specific document
  minQuality?: number;       // Minimum quality score (0-10)
  categories?: string[];     // Filter by categories (future)
}
```

### 4. ChunkDetailPanel
**File:** `ChunkDetailPanel.tsx` (~230 lines)

Sheet modal displaying comprehensive chunk information.

**Features:**
- Full chunk content (scrollable)
- Document metadata (title, pages)
- Quality score with visual indicator
- Top 5 semantic dimensions (bar chart)
- Semantic categories (persona, emotion, domain)
- Extraction timestamp
- Select button

**Display Sections:**
1. Header (title, document, page range, chunk ID)
2. Content (full text in scrollable area)
3. Quality Metrics (score, confidence, progress bar)
4. Semantic Dimensions (top 5 dimensions)
5. Semantic Categories (badges for personas, emotions)
6. Footer (Close and Select buttons)

## Installation & Setup

### Prerequisites
1. Chunks service layer must be configured (Prompt 2)
2. Environment variables set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Import
```typescript
// Import main component
import { ChunkSelector } from '@/components/chunks';

// Import individual components (if needed)
import { ChunkCard, ChunkFilters, ChunkDetailPanel } from '@/components/chunks';

// Import types
import type { ChunkFiltersType } from '@/components/chunks';
import type { ChunkWithDimensions } from '@/lib/chunks-integration';
```

## User Experience

### Search Flow
1. User types search query
2. Input debounces for 300ms
3. Loading skeleton appears
4. Results displayed in scrollable list
5. Empty state shown if no matches

### Selection Flow
1. User browses chunk list
2. Clicks on chunk card
3. Detail panel slides in from right
4. User reviews full content and metadata
5. Clicks "Select This Chunk"
6. Selection callback triggered
7. Chunk card shows selected state

### Keyboard Navigation
- **Tab**: Focus search input
- **↓**: Move down in chunk list
- **↑**: Move up in chunk list
- **Enter**: Select focused chunk
- **Escape**: Close detail panel

## Integration Examples

### Example 1: Conversation Form
```typescript
import { useState } from 'react';
import { ChunkSelector } from '@/components/chunks';
import { ChunkWithDimensions } from '@/lib/chunks-integration';

function ConversationForm() {
  const [linkedChunk, setLinkedChunk] = useState<ChunkWithDimensions | null>(null);

  const handleChunkSelect = (chunkId: string, chunk: ChunkWithDimensions) => {
    setLinkedChunk(chunk);
    // Save to database
    updateConversation({ 
      parentChunkId: chunkId,
      chunkContext: chunk.content 
    });
  };

  return (
    <div>
      <h2>Link Source Chunk</h2>
      <ChunkSelector 
        onSelect={handleChunkSelect}
        selectedChunkId={linkedChunk?.id}
      />
    </div>
  );
}
```

### Example 2: Pre-filtered by Document
```typescript
function DocumentChunkSelector({ documentId }: { documentId: string }) {
  return (
    <ChunkSelector
      documentId={documentId}
      onSelect={(id, chunk) => console.log('Selected:', chunk)}
    />
  );
}
```

### Example 3: Modal Integration
```typescript
import { Dialog, DialogContent } from '@/components/ui/dialog';

function ChunkSelectorModal({ open, onClose, onSelect }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <ChunkSelector onSelect={onSelect} />
      </DialogContent>
    </Dialog>
  );
}
```

## Styling

### Theme Integration
Components use Tailwind CSS and shadcn/ui design tokens:
- `primary` - Selection states
- `muted` - Hover states
- `destructive` - Error states
- `secondary` - Badges and metadata

### Customization
```typescript
<ChunkSelector 
  className="custom-styles"
  onSelect={handleSelect}
/>
```

## Performance

### Optimization Techniques
1. **Debounced Search**: 300ms delay prevents excessive API calls
2. **Caching**: Chunks service caches results (5-minute TTL)
3. **Lazy Loading**: Detail panel only renders when chunk selected
4. **Memoization**: Filter state memoized to prevent re-renders

### Performance Targets
- Search query: <200ms (with cache hit <50ms)
- Filter change: <300ms
- Chunk list render: <100ms for 50 chunks
- Detail panel open: <50ms

## Accessibility

### ARIA Labels
- Search input: `aria-label="Search chunks"`
- Chunk cards: `role="button"`, `aria-selected`
- Focus indicators for keyboard navigation

### Keyboard Support
Full keyboard navigation without mouse:
- Search input focus on load
- Arrow keys to navigate chunks
- Enter to select
- Escape to close detail panel

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for icons
- Status announcements for loading/empty states

## Error Handling

### Error States
1. **Service Not Initialized**: Environment variables missing
2. **Network Error**: API call failed
3. **Empty Results**: No chunks match filters
4. **Invalid Chunk**: Chunk data malformed

### Error Display
```typescript
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>{errorMessage}</AlertDescription>
</Alert>
```

## Testing

### Manual Testing Checklist
- [ ] Search updates results after 300ms
- [ ] Filter changes immediately update list
- [ ] Selected chunk highlighted correctly
- [ ] Detail panel shows all metadata
- [ ] Keyboard navigation works
- [ ] Loading states appear during async operations
- [ ] Empty state shows when no results
- [ ] Error state displays on service failure

### Test Scenarios
1. Search for "investment" → verify results
2. Adjust quality slider → verify filtering
3. Select document filter → verify document-specific chunks
4. Click chunk card → verify detail panel opens
5. Press Escape → verify detail panel closes
6. Use arrow keys → verify focus changes
7. Clear filters → verify reset to all chunks

## Troubleshooting

### Common Issues

**Issue: No chunks displayed**
- Check environment variables are set
- Verify chunks-alpha database has data
- Check browser console for errors
- Test chunks service connection: `chunksService.testConnection()`

**Issue: Search not working**
- Check debounce is functioning (300ms delay expected)
- Verify chunksService.searchChunks() is defined
- Check search query length (empty queries return no results)

**Issue: Detail panel not opening**
- Verify Sheet component imported correctly
- Check selectedChunk state is updating
- Ensure onClose handler is defined

**Issue: Filters not applying**
- Check filters state is updating
- Verify fetchChunks is called on filter change
- Check minimum quality score is valid (0-10)

## Future Enhancements

### Planned Features
1. **Pagination**: Load more than 100 chunks
2. **Virtual Scrolling**: Handle thousands of chunks efficiently
3. **Multi-select**: Select multiple chunks at once
4. **Recent Selections**: Show recently selected chunks
5. **Favorites**: Save frequently used chunks
6. **Advanced Search**: Full-text search with operators
7. **Sort Options**: Sort by relevance, date, quality
8. **Export**: Export chunk list to CSV/JSON

### API Enhancements
1. **Bulk Operations**: Load multiple chunks in single request
2. **Prefetching**: Preload dimensions for visible chunks
3. **Real-time Updates**: WebSocket for live chunk updates
4. **Search Highlighting**: Highlight search terms in content

## Support

For issues or questions:
1. Check this README
2. Review `ChunkSelectorDemo.tsx` for examples
3. Inspect browser console for errors
4. Verify chunks service integration (Prompt 2)

## Version History

- **v1.0** (Current): Initial implementation with search, filters, keyboard navigation

