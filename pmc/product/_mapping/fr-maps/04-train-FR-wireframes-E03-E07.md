# Training Data Conversation Generation Module - Consolidated Wireframe Specification (E03-E07)

**Version:** 1.0
**Date:** January 2025
**Module:** Training Data Generation - Core UI & Features
**Sections Consolidated:** E03 (Core UI), E04 (Generation), E05 (Dashboard), E06 (Review), E07 (Architecture)

## Overview

This consolidated specification covers all UI components and features for the Training Data Conversation Generation platform, spanning from core UI infrastructure through the complete three-tier conversation architecture (Templates → Scenarios → Edge Cases). The platform enables users to generate, manage, review, and export high-quality AI training conversations with minimal manual effort.

## Module Scope

This specification encompasses:
- **Core UI Components & Layouts** (E03): Dashboard structure, navigation, loading states, error handling, confirmation dialogs
- **Generation Features** (E04): Single and batch conversation generation with progress monitoring
- **Data Organization** (E05): Conversation tables, bulk actions, filtering, search, coverage analysis
- **Review & Approval System** (E06): Conversation preview, quality assessment, approval workflows
- **Three-Tier Architecture** (E07): Template, Scenario, and Edge Case tier interfaces with navigation

## Key User Personas

1. **Business Owner** (Primary): Focuses on generating training data efficiently, monitoring quality, and understanding coverage
2. **Domain Expert** (Secondary): Requires detailed control over conversation parameters, quality validation, and methodology preservation
3. **Data Manager** (Tertiary): Manages bulk operations, exports, and data organization

## Core UI Architecture

### 1. Main Dashboard Layout (E03, E05)

**Components:**
- **Header Section**
  - Application title and logo
  - Global navigation menu
  - User profile dropdown
  - Notifications bell icon
  - Quick actions toolbar (New Conversation, Batch Generate)

- **Sidebar Navigation**
  - Dashboard (home)
  - Templates (tier 1)
  - Scenarios (tier 2)
  - Edge Cases (tier 3)
  - Review Queue
  - Analytics & Coverage
  - Settings
  - Collapsible with icon-only mode

- **Main Content Area**
  - Dynamic content based on current view
  - Breadcrumb navigation at top
  - Action toolbar contextual to current view
  - Primary content display (tables, forms, previews)

- **Status Bar** (Bottom)
  - Processing status indicators
  - Active jobs counter
  - Quick stats summary
  - System notifications

### 2. Conversation Table View (E05)

**Primary Features:**
- **Data Table with Columns:**
  - Conversation ID
  - Title/Topic
  - Tier (Template/Scenario/Edge Case)
  - Category/Tag
  - Status (Draft/Generated/Approved/Rejected)
  - Quality Score
  - Created Date
  - Actions menu (dropdown)

- **Table Controls:**
  - Column visibility toggle
  - Column reordering (drag-and-drop)
  - Sorting (ascending/descending) on all columns
  - Row selection checkboxes
  - Pagination controls (items per page, page numbers)
  - Compact/comfortable/spacious density toggle

- **Filtering System:**
  - Quick filters (preset combinations)
  - Advanced filter builder
  - Filter by tier, status, date range, quality score
  - Tag-based filtering with multi-select
  - Save filter presets
  - Clear all filters button

- **Search Functionality:**
  - Global search bar
  - Search across conversation content
  - Search by metadata (title, tags, author)
  - Search suggestions/autocomplete
  - Recent searches history

- **Bulk Actions Toolbar:**
  - "Select All" / "Select None" / "Select Filtered"
  - Selected count indicator: "12 conversations selected"
  - Bulk action dropdown:
    * Generate variations
    * Add tags
    * Change status
    * Export selected
    * Delete selected (with confirmation)
    * Move to review queue

### 3. Single Conversation Generation Interface (E04)

**Form Layout:**
- **Generation Parameters Section:**
  - Tier selector (Template/Scenario/Edge Case)
  - Template selection dropdown (if Scenario/Edge Case tier)
  - Topic/context input (text area, 500 chars)
  - Target audience selector
  - Complexity level slider (1-10)
  - Conversation length target (turns/tokens)
  - Style/tone selector (formal, casual, technical, etc.)
  - Custom parameters (collapsible advanced section)

- **Preview Section:**
  - Real-time parameter summary
  - Estimated generation time
  - Token/cost estimate
  - Similar existing conversations (if any)

- **Action Buttons:**
  - [Generate Conversation] (primary CTA)
  - [Save as Draft] (secondary)
  - [Reset Form] (tertiary)
  - [Cancel] (return to dashboard)

- **Generation Progress Modal:**
  - Progress spinner with percentage
  - Status text: "Generating conversation..."
  - Estimated time remaining
  - [Cancel Generation] button
  - Success state with preview snippet
  - Error state with retry option

### 4. Batch Generation Interface (E04)

**Bulk Generation Controls:**
- **Input Methods:**
  - CSV upload for bulk parameters
  - Template-based batch creation
  - Manual row entry (spreadsheet-like interface)
  - Clone from existing conversation set

- **Batch Configuration:**
  - Shared parameters for all (tier, style, complexity)
  - Per-item overrides in table format
  - Variation count per base conversation
  - Processing priority selector

- **Processing Queue Dashboard:**
  - Queue table with columns:
    * Position in queue
    * Conversation topic/title
    * Parameters summary
    * Status (Queued/Processing/Complete/Failed)
    * Progress indicator
    * Estimated time
    * Actions (pause, cancel, move)
  - Overall progress: "Processing 3 of 25..."
  - Batch progress bar
  - Concurrent processing slots indicator
  - [Pause All] / [Resume All] / [Cancel All]

- **Completion Summary:**
  - Success count / Failed count / Total count
  - Time elapsed
  - Average quality score
  - [View Results] button
  - [Export Batch] button
  - [Generate Report] button

### 5. Review & Approval Interface (E06)

**Conversation Preview Panel:**
- **Header Section:**
  - Conversation title (editable)
  - Metadata badges (tier, category, status)
  - Quality score visualization
  - Created date and author
  - Version history dropdown (if multiple versions)

- **Conversation Display:**
  - Turn-by-turn conversation layout
  - User/Assistant labels with avatars
  - Syntax highlighting for code blocks
  - Collapsible long responses
  - Timestamp for each turn
  - Token count per turn
  - Copy button for each turn or entire conversation

- **Quality Metrics Sidebar:**
  - Overall quality score gauge
  - Dimension scores:
    * Relevance
    * Accuracy
    * Naturalness
    * Methodology preservation
    * Coherence
  - AI confidence indicators
  - Uniqueness score
  - Training value assessment

- **Approval Actions:**
  - [Approve] button (green, prominent)
  - [Request Revisions] button (yellow)
  - [Reject] button (red, with confirmation)
  - Comment/feedback text area
  - Revision request reason checkboxes:
    * Factual inaccuracy
    * Poor quality
    * Off-topic
    * Style inconsistency
    * Missing key concepts
    * Other (specify)

- **Review Queue Navigation:**
  - [Previous] / [Next] conversation buttons
  - Queue position indicator: "3 of 47"
  - [Skip] button (move to end of queue)
  - [Back to Queue] button
  - Keyboard shortcuts displayed

### 6. Three-Tier Architecture Navigation (E07)

**Template Tier Interface:**
- **Template Library Grid:**
  - Template cards with:
    * Template name
    * Description preview
    * Usage count badge
    * Last modified date
    * Quality rating (stars)
    * Actions dropdown
  - Grid/list view toggle
  - Sort options (name, usage, date, rating)
  - Filter by category
  - [New Template] button

- **Template Editor:**
  - Template name input
  - Description text area
  - Base conversation structure definition
  - Parameter placeholders with syntax highlighting
  - Variable definition section
  - Style guidelines input
  - [Save Template] / [Save as New] / [Cancel]

**Scenario Tier Interface:**
- **Scenario Builder:**
  - Parent template selector
  - Scenario name and description
  - Context/situation definition
  - Parameter value assignments
  - Variation generation controls:
    * Number of variations
    * Variation dimensions (tone, complexity, approach)
    * Randomization seed
  - [Generate Scenarios] button
  - Preview panel for generated scenarios

- **Scenario Management Table:**
  - Columns: Scenario name, Parent template, Variations count, Status
  - Bulk actions: Generate variations, Export, Delete
  - Filter by parent template
  - Group by template with collapsible sections

**Edge Case Tier Interface:**
- **Edge Case Collection:**
  - Edge case cards displaying:
    * Edge case title
    * Parent scenario reference
    * Complexity indicator
    * Test status (passed/failed)
    * Actions menu
  - Category filter (error handling, boundary conditions, unusual inputs, etc.)
  - [New Edge Case] / [Auto-generate Edge Cases]

- **Edge Case Generator:**
  - Parent scenario selector
  - Edge case type selector:
    * Error conditions
    * Boundary values
    * Unusual user inputs
    * Complex combinations
    * Failure scenarios
  - Generation quantity slider
  - [Generate Edge Cases] button
  - Validation test runner

**Tier Navigation:**
- **Visual Hierarchy Display:**
  - Breadcrumb trail: Template > Scenario > Edge Case
  - Tree view in sidebar showing parent-child relationships
  - "View Parent" / "View Children" navigation links
  - Relationship diagram (modal or panel) showing full hierarchy

- **Tier Switcher:**
  - Tab-like interface: Templates | Scenarios | Edge Cases
  - Active tier highlighted
  - Count badges on each tier (e.g., "Templates (23)")

### 7. Coverage Analysis & Analytics (E05)

**Coverage Dashboard:**
- **Metrics Overview Cards:**
  - Total conversations generated
  - Templates/Scenarios/Edge Cases breakdown
  - Approval rate percentage
  - Average quality score
  - Coverage completeness gauge

- **Topic Coverage Visualization:**
  - Heatmap or bubble chart showing:
    * Topics covered
    * Conversation density per topic
    * Quality distribution
    * Gap identification (under-covered topics)
  - Interactive: click to filter conversations by topic

- **Quality Distribution Charts:**
  - Histogram of quality scores
  - Trend line over time
  - Tier comparison (template vs scenario vs edge case quality)
  - Outlier identification

- **Gap Analysis Panel:**
  - "Underrepresented Topics" list
  - "Low-quality Areas" highlighting
  - "Missing Edge Cases" alerts
  - [Generate for Gaps] quick action

### 8. Export Functionality (E05)

**Export Modal/Panel:**
- **Format Selection:**
  - JSON (structured data)
  - JSONL (line-delimited for training)
  - CSV (metadata only)
  - Markdown (readable format)
  - Custom format (template-based)

- **Export Options:**
  - Include metadata checkbox
  - Include quality scores checkbox
  - Include timestamps checkbox
  - Filter by tier/status/date range
  - Selected conversations only vs entire dataset

- **Export Actions:**
  - [Preview Export] (shows sample)
  - [Download Export] (direct download)
  - [Schedule Export] (recurring exports)
  - [Send to Integration] (API/webhook)

- **Export History:**
  - Table of previous exports
  - Download links
  - Regenerate option

### 9. Core UI Patterns (E03)

**Loading States:**
- Skeleton screens for table loading
- Spinner overlays for actions
- Progress bars for long operations
- "Loading..." text with animation
- Inline spinners for button actions (generating, saving, etc.)

**Error Handling:**
- Toast notifications (top-right) for:
  * Success messages (green)
  * Error messages (red)
  * Warning messages (yellow)
  * Info messages (blue)
- Inline field validation errors
- Page-level error messages with retry
- Network error detection with reconnect prompt

**Confirmation Dialogs:**
- Modal dialogs for destructive actions:
  * Delete confirmation: "Are you sure? This cannot be undone."
  * Bulk delete: "You are about to delete 12 conversations."
  * Rejection with reason required
  * Cancel generation with progress loss warning
- [Confirm] / [Cancel] buttons
- Checkbox: "Don't ask again for this session"

**Empty States:**
- No conversations generated yet:
  * Illustration or icon
  * Helpful message: "Get started by generating your first conversation"
  * [Generate Conversation] CTA button
  * "Learn How" link to documentation
- No search results:
  * "No conversations match your search"
  * Search term displayed
  * [Clear Search] button
  * Suggestion to broaden filters
- Empty tier (no templates/scenarios/edge cases):
  * "No templates created yet"
  * [Create First Template] button

**Keyboard Shortcuts:**
- Global shortcuts displayed in tooltips and help menu:
  * `Ctrl+K` or `Cmd+K` - Quick search/command palette
  * `Ctrl+N` or `Cmd+N` - New conversation
  * `Ctrl+B` or `Cmd+B` - Toggle sidebar
  * `Ctrl+,` or `Cmd+,` - Settings
  * `Esc` - Close modal/dialog
  * `Ctrl+Enter` or `Cmd+Enter` - Submit form
- Context-specific shortcuts:
  * `A` - Approve (in review mode)
  * `R` - Reject (in review mode)
  * `N` - Next (in review mode)
  * `P` - Previous (in review mode)
  * Arrow keys for navigation in tables/lists

**Responsive Design Considerations:**
- Desktop-first design (primary use case)
- Tablet support with collapsible sidebars
- Mobile: Read-only view, limited generation capabilities
- Breakpoints: <768px (mobile), 768-1024px (tablet), >1024px (desktop)

## Acceptance Criteria Summary (UI-Relevant Only)

### E03 - Core UI Components

**FR3.1: Dashboard Layout**
- AC: Dashboard displays header with navigation, logo, and user menu
- AC: Sidebar shows main navigation items with icons and labels
- AC: Main content area adjusts based on selected view
- AC: Layout is responsive and adapts to screen sizes
- AC: Empty states provide clear guidance and CTAs

**FR3.2: Loading States**
- AC: All asynchronous operations show loading indicators
- AC: Skeleton screens appear during initial data loading
- AC: Progress bars show percentage for long operations
- AC: Loading states can be cancelled where appropriate

**FR3.3: Error Handling**
- AC: Errors display as toast notifications with appropriate severity colors
- AC: Error messages are user-friendly and actionable
- AC: Network errors prompt reconnection attempts
- AC: Form validation errors appear inline near relevant fields

**FR3.4: Confirmation Dialogs**
- AC: Destructive actions require confirmation before execution
- AC: Confirmation dialogs clearly state consequences
- AC: Users can cancel or proceed with confirmation
- AC: Optional "don't ask again" checkbox for repeated actions

**FR3.5: Keyboard Navigation**
- AC: All interactive elements are keyboard accessible
- AC: Keyboard shortcuts are documented and consistent
- AC: Tab order follows logical visual flow
- AC: Focus indicators are clearly visible

### E04 - Generation Features

**FR4.1: Single Conversation Generation**
- AC: Form displays all required generation parameters
- AC: Parameter validation occurs before generation
- AC: Generate button triggers conversation creation
- AC: Progress modal appears during generation with status updates
- AC: Success state shows preview of generated conversation
- AC: Generated conversation appears in dashboard table

**FR4.2: Batch Generation**
- AC: Batch interface accepts multiple conversation specifications
- AC: Users can upload CSV or enter rows manually
- AC: Processing queue displays all queued conversations
- AC: Individual progress indicators show per-conversation status
- AC: Overall batch progress bar shows aggregate completion
- AC: Users can pause, resume, or cancel individual items or entire batch
- AC: Completion summary provides success/failure counts

**FR4.3: Progress Monitoring**
- AC: Real-time status updates appear during processing
- AC: Estimated time remaining is displayed and updates dynamically
- AC: Completed conversations are immediately accessible
- AC: Failed generations show error details with retry option

### E05 - Dashboard & Data Organization

**FR5.1: Conversation Table**
- AC: Table displays all conversations with relevant metadata columns
- AC: Columns are sortable (ascending/descending)
- AC: Column visibility can be toggled
- AC: Table density can be adjusted (compact/comfortable/spacious)
- AC: Pagination controls allow navigation through large datasets

**FR5.2: Filtering & Search**
- AC: Filter controls allow filtering by tier, status, date, quality
- AC: Filters can be combined (AND logic)
- AC: Active filters are clearly displayed with remove option
- AC: Search bar enables full-text search across conversations
- AC: Search results update in real-time as user types
- AC: Filter presets can be saved and recalled

**FR5.3: Bulk Actions**
- AC: Row selection checkboxes enable multi-select
- AC: Select all/none controls work across filtered results
- AC: Selected count displays prominently
- AC: Bulk actions menu shows available operations for selection
- AC: Bulk operations show confirmation before executing
- AC: Bulk operation progress appears for long-running actions

**FR5.4: Coverage Analysis**
- AC: Coverage dashboard displays metrics cards with key stats
- AC: Visualizations show topic distribution and density
- AC: Quality charts display score distributions
- AC: Gap analysis highlights underrepresented areas
- AC: Clicking visualization elements filters main table

**FR5.5: Export Functionality**
- AC: Export button opens export configuration modal
- AC: Multiple export formats are available (JSON, JSONL, CSV, MD)
- AC: Export options allow customization of included data
- AC: Export preview shows sample of output format
- AC: Export generates downloadable file
- AC: Export history tracks previous exports with re-download option

### E06 - Review & Approval System

**FR6.1: Conversation Preview**
- AC: Preview panel displays full conversation with all turns
- AC: Metadata section shows conversation details and quality metrics
- AC: Each conversation turn is clearly labeled (User/Assistant)
- AC: Code blocks and formatting are properly rendered
- AC: Copy functionality available for individual turns and full conversation

**FR6.2: Quality Assessment**
- AC: Quality scores display for overall and dimensional metrics
- AC: Visual indicators (gauges, stars, colors) show quality levels
- AC: AI confidence scores appear alongside quality metrics
- AC: Low-quality indicators trigger alerts or warnings

**FR6.3: Approval Workflow**
- AC: Approve button marks conversation as approved
- AC: Request Revisions button allows feedback submission
- AC: Reject button marks conversation as rejected with reason
- AC: Comment field enables detailed feedback
- AC: Status updates reflect in dashboard table immediately
- AC: Approval actions are logged for audit trail

**FR6.4: Review Queue Management**
- AC: Review queue displays conversations requiring review
- AC: Queue position indicator shows progress (e.g., "3 of 47")
- AC: Previous/Next navigation moves through queue
- AC: Skip option moves current item to end of queue
- AC: Keyboard shortcuts enable rapid review workflow

### E07 - Three-Tier Architecture

**FR7.1: Template Tier**
- AC: Template library displays all templates in grid or list view
- AC: Template cards show name, description, usage count, rating
- AC: New Template button opens template editor
- AC: Template editor provides fields for all template components
- AC: Templates can be saved, duplicated, and deleted
- AC: Template usage metrics track how often templates are used

**FR7.2: Scenario Tier**
- AC: Scenario builder allows selection of parent template
- AC: Parameter configuration interface enables scenario customization
- AC: Variation generation controls specify number and dimensions
- AC: Generated scenarios appear in scenario management table
- AC: Scenarios display parent template relationship
- AC: Bulk scenario operations (export, delete) are available

**FR7.3: Edge Case Tier**
- AC: Edge case collection displays all edge cases with metadata
- AC: Edge case type selector categorizes edge cases
- AC: Auto-generation creates edge cases from parent scenarios
- AC: Edge cases show parent scenario references
- AC: Testing interface validates edge case behavior

**FR7.4: Tier Navigation**
- AC: Breadcrumb navigation shows current position in hierarchy
- AC: Tier switcher tabs enable quick tier changes
- AC: Tree view sidebar displays parent-child relationships
- AC: View Parent/View Children links provide relationship navigation
- AC: Relationship diagram visualizes full conversation hierarchy

## Page/Screen Inventory

This module requires the following screens/pages:

1. **Main Dashboard** - Central hub with conversation table and navigation
2. **Single Generation Form** - Form for creating individual conversations
3. **Batch Generation Interface** - Bulk conversation creation with queue
4. **Review Queue** - List of conversations awaiting review
5. **Conversation Preview/Review** - Detailed view for approval workflow
6. **Template Library** - Grid/list of all templates
7. **Template Editor** - Create/edit template interface
8. **Scenario Management** - Table of scenarios with bulk actions
9. **Scenario Builder** - Create/configure scenarios
10. **Edge Case Collection** - Grid/list of edge cases
11. **Edge Case Generator** - Auto-generate edge cases interface
12. **Coverage Analytics** - Visualizations and gap analysis
13. **Export Configuration** - Export options and history
14. **Settings** - User preferences and system configuration

## Non-UI Acceptance Criteria (Backend/Logic)

These criteria require backend implementation but may have UI implications:

- Conversation generation algorithm using AI models
- Quality scoring engine for generated conversations
- Template inheritance and parameter substitution logic
- Batch processing queue management and concurrency control
- Export format generation and file creation
- Search indexing and full-text search
- Filter query construction and execution
- Approval workflow state machine
- Coverage calculation algorithms
- Gap analysis identification logic
- Auto-save for forms and editors
- Version control for templates and conversations
- Audit logging for all user actions
- User authentication and authorization
- Role-based access control (RBAC)
- API rate limiting and throttling
- Database query optimization
- Caching strategies for performance

## Design System Notes

**Color Palette:**
- Primary action: Blue (#2563EB)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error/Danger: Red (#EF4444)
- Neutral: Gray scale (#F9FAFB to #111827)

**Typography:**
- Headings: Inter or similar sans-serif
- Body: System default stack (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)
- Monospace (code): Fira Code or Consolas

**Spacing:**
- Base unit: 4px or 0.25rem
- Common spacing: 8px, 12px, 16px, 24px, 32px, 48px

**Interactive Elements:**
- Buttons: 8px border radius, 12px padding
- Inputs: 6px border radius, 10px padding
- Cards: 8px border radius, 16px padding
- Modals: 12px border radius, 24px padding

**Icons:**
- Use consistent icon library (Heroicons, Lucide, or Feather)
- 20px or 24px standard size
- 16px for compact/inline icons

## Success Metrics for UI

The UI is successful when:
- Users can generate their first conversation within 2 minutes of landing on platform
- Batch generation of 50+ conversations is intuitive and progress is clear
- Review workflow enables approval of 10+ conversations in under 5 minutes
- Coverage analysis clearly identifies gaps without external analysis
- Navigation between tiers is seamless with clear hierarchy understanding
- Zero UI-related support tickets after initial launch period
- 95%+ task completion rate for primary workflows
- Average time to approve conversation: <30 seconds
- User satisfaction score (SUS): >70

---

**End of Consolidated Specification**
