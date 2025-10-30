# Conversations Components

This directory contains all UI components for the Interactive LoRA Conversation Generation platform's conversation management dashboard.

## Components

### DashboardView
Main client component that orchestrates the entire dashboard. Handles:
- State management for conversations, filters, pagination
- API integration for fetching and updating data
- URL state synchronization
- Bulk actions (approve, reject, delete)

**Props:**
- `initialConversations`: Server-side fetched conversations
- `initialPagination`: Initial pagination state
- `initialStats`: Initial statistics
- `initialFilters`: Initial filter state from URL

### ConversationTable
Sortable table component displaying conversations with inline actions.

**Features:**
- Column sorting (title, persona, tier, status, quality, turns, created date)
- Row selection (individual and bulk)
- Inline action menu (preview, approve, reject, export, delete)
- Loading and empty states

**Props:**
- `conversations`: Array of conversations to display
- `selectedIds`: Array of selected conversation IDs
- `onSelectionChange`: Callback for selection changes
- `onRefresh`: Callback to refresh data
- `isLoading`: Loading state flag

### FilterBar
Multi-dimensional filter controls with URL persistence.

**Features:**
- Quick filters (All, Needs Review, Approved, High Quality)
- Advanced filters popover (Status, Tier, Quality Range)
- Search input with debouncing
- Active filter badges with remove buttons
- Export functionality

**Props:**
- `filters`: Current filter configuration
- `stats`: Conversation statistics for filter counts
- `onChange`: Callback for filter changes
- `onExport`: Optional export callback

### Pagination
Pagination controls with page size selector.

**Features:**
- First/Previous/Next/Last page navigation
- Page number buttons with ellipsis for large page counts
- Rows per page selector (10, 25, 50, 100)
- Result count display

**Props:**
- `pagination`: Pagination configuration with total and totalPages
- `onPageChange`: Callback for page changes
- `onLimitChange`: Callback for page size changes

### StatsCards
Dashboard statistics cards displaying key metrics.

**Features:**
- Total conversations with tier breakdown
- Approved count with approval rate
- Pending review count
- Average quality score with high quality count
- Trend indicators

**Props:**
- `stats`: Conversation statistics object

### ConversationPreviewModal
Modal for previewing full conversation details and turns.

**Features:**
- Conversation metadata display
- Full conversation turns with role indicators
- Review history
- Approve/Reject actions
- Quality metrics and categories

**Props:**
- `conversationId`: ID of conversation to preview
- `onClose`: Callback to close modal
- `onApprove`: Optional approve callback
- `onReject`: Optional reject callback

## Usage Example

```typescript
import { DashboardView } from '@/components/conversations';

export default async function ConversationsPage({ searchParams }) {
  const filters = parseFilters(searchParams);
  const pagination = parsePagination(searchParams);
  
  const conversationService = new ConversationService();
  const [data, stats] = await Promise.all([
    conversationService.list(filters, pagination),
    conversationService.getStats(),
  ]);
  
  return (
    <DashboardView
      initialConversations={data.data}
      initialPagination={data.pagination}
      initialStats={stats}
      initialFilters={filters}
    />
  );
}
```

## State Management

The dashboard uses React state and URL synchronization for:
- **Filters**: Status, tier, quality range, search query
- **Pagination**: Page number, page size, sort field, sort direction
- **Selection**: Array of selected conversation IDs

All state changes update the URL, allowing:
- Shareable filtered views
- Browser back/forward navigation
- Page refresh preservation

## API Integration

Components integrate with these API endpoints:
- `GET /api/conversations` - List conversations with filters
- `GET /api/conversations/stats` - Get statistics
- `GET /api/conversations/:id` - Get single conversation
- `PATCH /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `POST /api/conversations/bulk-action` - Bulk approve/reject/delete

## Styling

All components use:
- **shadcn/ui** components for consistent design
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Sonner** for toast notifications

## Accessibility

Components include:
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Semantic HTML structure

