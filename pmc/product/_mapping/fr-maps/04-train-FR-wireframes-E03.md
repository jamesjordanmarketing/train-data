# Interactive LoRA Conversation Generation - Functional Requirements
**Version:** 3.0.0 (Wireframe Integration)
**Date:** 10/28/2025  
**Category:** Training Data Generation Platform
**Product Abbreviation:** train

**Source References:**
- Seed Story: `pmc\product\00-train-seed-story.md`
- Overview Document: `pmc\product\01-train-overview.md`
- User Stories: `pmc\product\02-train-user-stories.md`
- User Journey: `pmc\product\02.5-train-user-journey.md`
- Previous Version: `pmc\product\03-train-functional-requirements-before-wireframe.md`
- Wireframe Codebase: `train-wireframe\src\`
- Main Codebase: `src\`

**Reorganization Notes:**
This document has been enhanced with insights from the implemented wireframe UI and main codebase integration. All functional requirements now include:
- Testable acceptance criteria based on actual implementation
- Direct codebase file path references for validation
- Enhanced UI/UX specifications from wireframe patterns
- Database schema validation from implemented models
- API endpoint specifications from actual routes

All FR numbers preserved from v2.0.0 for traceability. Original User Story (US) references maintained.

---

## Document Enhancement Summary

**Key Enhancements in v3.0.0:**
1. **UI Component Integration**: All UI requirements now reference actual wireframe components
2. **Database Validation**: Acceptance criteria validated against implemented Supabase schemas  
3. **API Specification**: Requirements include actual API endpoint paths and parameters
4. **State Management**: Requirements reference Zustand store implementation patterns
5. **Type Safety**: All data structures validated against TypeScript type definitions
6. **Testable Criteria**: Every acceptance criterion now includes validation approach

**Wireframe Components Integrated:**
- Dashboard with conversation table, filters, pagination (ConversationTable.tsx, FilterBar.tsx)
- Three-tier workflow (TemplatesView.tsx, ScenariosView.tsx, EdgeCasesView.tsx)
- Batch generation interface (BatchGenerationModal.tsx)
- Review queue system (ReviewQueueView.tsx)
- Export functionality (ExportModal.tsx)
- Quality metrics visualization (Dashboard stats cards)

---


## 3. Core UI Components & Layouts

### 3.1 Dashboard Layout & Navigation

- **FR3.1.1:** Desktop-Optimized Layout
  * Description: Responsive dashboard layout optimized for desktop workflows
  * Impact Weighting: User Experience / Accessibility
  * Priority: High
  * User Stories: US11.1.1
  * Tasks: [T-3.1.1]
  * User Story Acceptance Criteria:
    - Optimized for 1920x1080 and 1366x768 resolutions
    - Table responsive to screen width with horizontal scroll if needed
    - Side panel for conversation preview (not blocking table)
    - Filter panel collapsible to maximize content area
    - Font sizes readable without zooming
    - Keyboard shortcuts for power users (documented in help menu)
    - Tablet support optional (minimum 768px width)
  * Functional Requirements Acceptance Criteria:
    - Dashboard layout must use DashboardLayout component
      Code Reference: `train-wireframe/src/components/layout/DashboardLayout.tsx`
    - Viewport breakpoints must support: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
    - Table must have horizontal scroll for narrow viewports
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx`
    - Sidebar must be collapsible with toggle button
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:16,55` (sidebarCollapsed state)
    - Filter panel must collapse into modal on mobile views
    - Font sizes must follow Tailwind typography scale (text-sm, text-base, text-lg)
    - Keyboard shortcuts must be documented and accessible via '?' key
    - Minimum supported width must be 768px (tablet landscape)
    - Layout must use CSS Grid for main structure
    - Header must remain fixed during scroll
      Code Reference: `train-wireframe/src/components/layout/Header.tsx`
    - Navigation must highlight active view
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:17` (currentView state)

- **FR3.1.2:** Keyboard Navigation
  * Description: Comprehensive keyboard shortcuts for efficient navigation and actions
  * Impact Weighting: Productivity / Accessibility
  * Priority: Medium
  * User Stories: US11.1.2
  * Tasks: [T-3.1.2]
  * User Story Acceptance Criteria:
    - Keyboard shortcuts: Space (select row), Enter (open preview), Arrow keys (navigate preview)
    - ESC to close dialogs and panels
    - Cmd/Ctrl+A to select all visible rows
    - Cmd/Ctrl+E to export
    - Tab navigation through focusable elements in logical order
    - Focus indicators clearly visible
    - Shortcuts documented in help menu (? key)
    - Shortcuts customizable in user preferences
  * Functional Requirements Acceptance Criteria:
    - Keyboard event listeners must be registered at app root level
    - Space key must toggle row selection when table row focused
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx:169` (Checkbox handling)
    - Enter key must trigger conversation preview modal
    - Arrow keys (Up/Down) must navigate table rows with visible focus ring
    - ESC key must close all modals and dialogs
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:98-99` (hideConfirm action)
    - Cmd/Ctrl+A must select all visible rows (respecting current filters)
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:84-85` (selectAllConversations)
    - Cmd/Ctrl+E must trigger export modal
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:95-96` (openExportModal)
    - Tab order must follow logical flow: header → filters → table → pagination
    - Focus indicators must use visible outline (ring-2 ring-blue-500)
    - ? key must open shortcuts help dialog
    - User preferences must include keyboard shortcut customization
      Code Reference: `train-wireframe/src/lib/types.ts:222` (keyboardShortcutsEnabled)
    - Shortcuts must be disabled when input fields focused

### 3.2 Loading States & Feedback

- **FR3.2.1:** Loading Indicators
  * Description: Visual feedback during data fetching and long-running operations
  * Impact Weighting: User Confidence / Perceived Performance
  * Priority: Medium
  * User Stories: US11.2.1
  * Tasks: [T-3.2.1]
  * User Story Acceptance Criteria:
    - Loading spinner during data fetching
    - Skeleton screens for table while loading (preserves layout)
    - Shimmer effect on skeleton indicating loading
    - Toast notifications for: success (generated, approved, exported), error (failed)
    - Toast auto-dismiss after 5 seconds (user configurable)
    - Toast stack for multiple notifications
    - Progress indicators for long-running operations (batch generation)
    - Optimistic UI updates for instant feedback (revert on error)
  * Functional Requirements Acceptance Criteria:
    - Loading state must be managed via Zustand store
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:48-49` (isLoading, loadingMessage)
    - Spinner component must show during async operations
    - Skeleton component must match table structure
      Code Reference: `train-wireframe/src/components/ui/skeleton.tsx`
    - Shimmer animation must use CSS gradient animation
    - Toast notifications must use Sonner library
      Code Reference: `train-wireframe/src/components/ui/sonner.tsx`
    - Toast types must include: success, error, info, warning
    - Auto-dismiss duration must be configurable (default 5000ms)
    - Toast stack must position in bottom-right corner
    - Progress indicator must show percentage for batch jobs
      Code Reference: `train-wireframe/src/lib/types.ts:130-135` (BatchJob progress fields)
    - Optimistic updates must be applied immediately then confirmed/reverted
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:163-169` (updateConversation pattern)
    - Loading message must be displayed with spinner
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:101` (setLoading with message)

- **FR3.2.2:** Empty States and No Results
  * Description: Helpful messaging when no data exists or filters return empty results
  * Impact Weighting: User Experience / Guidance
  * Priority: Medium
  * User Stories: US11.2.2
  * Tasks: [T-3.2.2]
  * User Story Acceptance Criteria:
    - Empty state when no conversations exist: "No conversations yet. Click Generate All to get started."
    - No results state when filters return nothing: "No conversations match your filters. Try clearing some filters."
    - Illustration or icon in empty state
    - Clear call-to-action button (e.g., "Clear Filters" or "Generate Conversations")
    - Helpful tips in empty state (e.g., "Tip: Start with Template tier for foundational conversations")
  * Functional Requirements Acceptance Criteria:
    - Empty state must be rendered when conversations array length is 0
      Code Reference: `train-wireframe/src/components/dashboard/DashboardView.tsx:71-90`
    - No results state must be rendered when filteredConversations length is 0 but conversations exist
    - Empty state must include icon component (FileText icon)
      Code Reference: `train-wireframe/src/components/dashboard/DashboardView.tsx:76`
    - Messaging must differentiate between truly empty vs filtered empty
    - CTA button must trigger appropriate action (clear filters or open generation modal)
      Code Reference: `train-wireframe/src/components/dashboard/DashboardView.tsx:82-83`
    - Tips must be contextual based on user's current state
    - Empty state must be centered with adequate padding
    - Illustration must use consistent icon library (Lucide React)
    - Empty table state must show message in table body
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx:199-204`

### 3.3 Conversation Table & Filtering

- **FR3.3.1:** Multi-Column Sortable Table
  * Description: Table displaying all conversations with sortable columns
  * Impact Weighting: Usability / Navigation
  * Priority: High
  * User Stories: US2.1.1
  * Tasks: [T-3.3.1]
  * User Story Acceptance Criteria:
    - Columns: Checkbox, ID, Tier, Status, Quality Score, Turns, Created, Actions
    - Click column header to sort ascending/descending/unsorted
    - Visual indicator for sort direction (up/down arrow)
    - Default sort: created_at descending (newest first)
    - Row hover highlights entire row
    - Zebra striping for readability (alternating row colors)
    - Compact mode option to show more rows per page
    - Column resize draggable handles (optional)
  * Functional Requirements Acceptance Criteria:
    - Table component must use ConversationTable
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx`
    - Columns must match data model fields
      Code Reference: `train-wireframe/src/lib/types.ts:29-46` (Conversation type)
    - Sorting must be controlled by sortConfig state
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx:69-82`
    - Sort function must support string, number, and date comparisons
    - Arrow icons must indicate sort direction (ArrowUp, ArrowDown)
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx:89-91`
    - Default sort must be applied on initial render
    - Hover state must use Tailwind hover:bg-muted
    - Zebra striping optional via table variant prop
    - Compact mode must reduce row padding (py-2 instead of py-4)
    - Column headers must be sticky during vertical scroll
    - Table must use Shadcn Table component
      Code Reference: `train-wireframe/src/components/ui/table.tsx`

- **FR3.3.2:** Advanced Filtering System
  * Description: Comprehensive filters for finding specific conversations
  * Impact Weighting: Efficiency / Findability
  * Priority: High
  * User Stories: US2.2.1
  * Tasks: [T-3.3.2]
  * User Story Acceptance Criteria:
    - Quick filters: All, Needs Review, Approved, Rejected (badge counts)
    - Advanced filters panel: Tier (multi-select), Status (multi-select), Quality range (slider), Date range
    - Search by ID or content keywords
    - Clear all filters button
    - Applied filters displayed as removable chips
    - Filter count indicator: "3 filters applied"
    - Save filter presets (optional)
    - Filter state persisted in URL query params
  * Functional Requirements Acceptance Criteria:
    - Filter component must use FilterBar
      Code Reference: `train-wireframe/src/components/dashboard/FilterBar.tsx`
    - Quick filters must update filterConfig state
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:42,110` (filterConfig, setFilterConfig)
    - Quick filter badges must show conversation counts
      Code Reference: `train-wireframe/src/components/dashboard/FilterBar.tsx:45-55`
    - Tier filter must use multi-select dropdown
      Code Reference: `train-wireframe/src/components/ui/dropdown-menu.tsx`
    - Status filter must support multi-select with checkboxes
    - Quality range must use slider component with two handles
      Code Reference: `train-wireframe/src/components/ui/slider.tsx`
    - Date range picker must support from/to dates
    - Search input must filter by conversation_id or metadata fields
      Code Reference: `train-wireframe/src/components/dashboard/FilterBar.tsx:65-75`
    - Clear all must reset filterConfig to default state
    - Applied filters must render as Badge components with X icon
      Code Reference: `train-wireframe/src/components/ui/badge.tsx`
    - Filter count must be calculated from active filter properties
    - URL query params must sync with filter state for shareable links
    - Filter application must trigger table re-render with filtered data

- **FR3.3.3:** Bulk Actions
  * Description: Actions applicable to multiple selected conversations
  * Impact Weighting: Efficiency / Workflow Speed
  * Priority: Medium
  * User Stories: US2.3.1
  * Tasks: [T-3.3.3]
  * User Story Acceptance Criteria:
    - Select individual rows via checkboxes
    - Select all visible rows (respecting filters)
    - Selection count displayed: "12 selected"
    - Bulk actions toolbar appears when selections exist: Approve, Reject, Delete, Export
    - Confirmation dialog for destructive actions (delete, reject)
    - Bulk action progress indicator (e.g., "Approving 12 conversations...")
    - Success toast with count: "12 conversations approved"
    - Clear selection button
  * Functional Requirements Acceptance Criteria:
    - Checkbox column must use Checkbox component
      Code Reference: `train-wireframe/src/components/ui/checkbox.tsx`
    - Row selection must update selectedConversationIds array
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:41,79-87` (selectedConversationIds state)
    - Select all checkbox must be in table header
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx:107-114`
    - Selection count must be displayed in bulk actions toolbar
    - Bulk actions toolbar must be conditionally rendered when selections.length > 0
    - Approve bulk action must call API endpoint for each selected conversation
    - Reject bulk action must require confirmation dialog
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:96-99` (showConfirm action)
    - Delete bulk action must show confirmation with conversation count
    - Export bulk action must open export modal pre-filtered to selected IDs
    - Progress indicator must show during async bulk operations
    - Success toast must include count and action type
      Code Reference: `train-wireframe/src/components/ui/sonner.tsx`
    - Clear selection must reset selectedConversationIds to []
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:86-87`

- **FR3.3.4:** Inline Actions
  * Description: Quick actions available per row without selection
  * Impact Weighting: Convenience / Workflow Speed
  * Priority: Medium
  * User Stories: US2.3.2
  * Tasks: [T-3.3.4]
  * User Story Acceptance Criteria:
    - Actions column with dropdown menu icon (three dots)
    - Dropdown actions: Preview, Approve, Reject, Regenerate, Delete, Export Single
    - Preview opens modal with full conversation display
    - Approve/Reject updates status immediately with toast notification
    - Delete requires confirmation
    - Actions disabled based on status (can't approve already approved)
    - Keyboard accessible (Tab to focus, Enter to open menu, Arrow keys to navigate)
  * Functional Requirements Acceptance Criteria:
    - Actions column must use DropdownMenu component
      Code Reference: `train-wireframe/src/components/ui/dropdown-menu.tsx`
    - Menu trigger must be icon button with MoreVertical icon
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx:161-166`
    - Preview action must open conversation detail modal
    - Approve action must call updateConversation with status 'approved'
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:163-169`
    - Reject action must call updateConversation with status 'rejected'
    - Delete action must trigger confirmation dialog
    - Regenerate action must call generation API with existing conversation parameters
    - Export single must trigger download with single conversation JSON
    - Action items must be conditionally disabled based on current status
    - Dropdown must support keyboard navigation (Tab, Enter, Arrow keys, ESC)
    - Successful actions must display toast notification
    - Error actions must display error toast with message

---
