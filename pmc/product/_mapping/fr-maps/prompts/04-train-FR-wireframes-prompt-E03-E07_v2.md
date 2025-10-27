# Training Data Conversation Generation Module — Consolidated Figma Wireframe Prompt (E03-E07)

=== BEGIN PROMPT TRAIN: E03-E07-CONSOLIDATED ===

## Title
Training Data Conversation Generation Platform — Complete UI System (E03-E07 Consolidated)

## Context Summary
Comprehensive training data conversation generation platform featuring a three-tier architecture (Templates → Scenarios → Edge Cases) with complete generation, review, approval, and analytics workflows. Enables business owners and domain experts to create high-quality AI training conversations through intuitive single and batch generation interfaces, robust data organization with filtering and bulk operations, structured review workflows, and coverage gap analysis — all while maintaining quality standards and preserving proprietary methodologies. This consolidated prompt covers Core UI Infrastructure (E03), Generation Features (E04), Data Organization (E05), Review & Approval (E06), and Three-Tier Architecture Navigation (E07).

## Journey Integration
- **User Stage:** Full platform usage from onboarding through scaled production
- **Key emotions:** Control confidence, efficiency satisfaction, quality assurance trust, scale achievement pride
- **Progressive disclosure levels:**
  * **Basic:** Simple conversation generation, table view, basic review workflow
  * **Advanced:** Batch generation, filtering, coverage analysis, tier navigation
  * **Expert:** Custom templates, bulk operations, quality tuning, gap optimization
- **Persona adaptations:**
  * **Business Owner** (primary) - Streamlined workflows with clear value demonstration
  * **Domain Expert** (secondary) - Detailed controls and quality metrics
  * **Data Manager** (tertiary) - Bulk operations and export management

## Journey-Informed Design Elements

### User Goals Across Tiers
- **Tier 1 (Templates):** Create reusable conversation foundations, establish baseline quality
- **Tier 2 (Scenarios):** Generate contextual variations, scale conversation production
- **Tier 3 (Edge Cases):** Ensure comprehensive coverage, handle unusual situations

### Emotional Requirements
- **Getting Started:** Excitement tempered by learning curve anxiety
- **First Generation:** Anticipation for results, validation of understanding
- **Batch Processing:** Efficiency satisfaction, control confidence
- **Review Phase:** Quality assurance trust, approval decision clarity
- **Coverage Analysis:** Completeness confidence, gap identification relief
- **Scale Achievement:** Production success pride, ROI realization

### Progressive Disclosure
- **Basic (First-time users):**
  * Single conversation generation form
  * Simple conversation table view
  * One-click approval workflow
  * Dashboard home with quick actions

- **Advanced (Regular users):**
  * Batch generation with queue management
  * Advanced filtering and search
  * Quality metrics and scoring
  * Coverage gap visualization
  * Template creation and editing

- **Expert (Power users):**
  * Custom parameter fine-tuning
  * Bulk operations across tiers
  * Export automation and scheduling
  * Quality threshold configuration
  * Cross-tier relationship management

### Success Indicators
- First conversation generated within 2 minutes
- Batch of 50+ conversations running smoothly
- Review queue processing at 10+ conversations per 5 minutes
- Coverage gaps clearly identified
- Quality standards consistently met
- Three-tier hierarchy intuitive and navigable

## Wireframe Goals

### Primary Objectives
1. **Unified Dashboard Experience** - Single command center for all conversation management activities
2. **Intuitive Generation Workflows** - Clear paths for both single and batch conversation creation
3. **Efficient Data Organization** - Powerful table views with filtering, search, and bulk operations
4. **Structured Review System** - Streamlined approval workflows with quality assessment
5. **Clear Tier Hierarchy** - Visual and navigational clarity of template→scenario→edge case relationships
6. **Actionable Analytics** - Coverage and quality insights that drive generation decisions
7. **Consistent UI Patterns** - Reusable components across all views (loading, errors, empty states)

### Specific Feature Goals
- Enable rapid single conversation generation with parameter validation
- Support bulk generation with visual queue management and progress tracking
- Provide comprehensive conversation table with advanced filtering and search
- Facilitate efficient review with keyboard shortcuts and batch approval
- Visualize three-tier architecture with clear parent-child relationships
- Display coverage gaps and quality metrics in actionable dashboards
- Ensure all destructive actions have confirmation safeguards
- Maintain consistent loading, error, and empty state patterns

## Explicit UI Requirements (from acceptance criteria)

### Global UI Infrastructure (E03)

**Dashboard Layout:**
- Header section with:
  * Application logo and title "Training Data Generator"
  * Global navigation menu (horizontal tabs or dropdown)
  * User profile dropdown (avatar, name, settings, logout)
  * Notifications bell icon with unread count badge
  * Quick action buttons: [New Conversation] [Batch Generate]

- Top navigation with:
  * Dashboard (home icon)
  * Templates (template icon + count badge)
  * Scenarios (scenario icon + count badge)
  * Edge Cases (edge case icon + count badge)
  * Review Queue (checkmark icon + count badge)
  * Analytics (chart icon)
  * Settings (gear icon)
  * Collapse toggle button at bottom

- Main content area:
  * Breadcrumb trail at top showing current location
  * Page title (h1) with optional subtitle
  * Contextual action toolbar (right-aligned)
  * Primary content display area
  * Pagination controls at bottom (if applicable)

- Status bar (bottom of viewport):
  * Active processing jobs indicator
  * Quick stats (total conversations, approvals today)
  * System notifications or updates

**Loading States:**
- Skeleton screens for table rows during initial data fetch
- Inline button spinners during actions (saving, generating)
- Full-page loading overlay with spinner for page transitions
- Progress bars with percentage for long-running operations
- Estimated time remaining for batch processes
- [Cancel] button where cancellation is possible

**Error Handling:**
- Toast notifications (top-right corner, auto-dismiss after 5s):
  * Success: Green background, checkmark icon, "Conversation generated successfully"
  * Error: Red background, X icon, "Failed to generate conversation" + reason
  * Warning: Yellow background, alert icon, "Quality score below threshold"
  * Info: Blue background, info icon, "Export ready for download"
- Inline field validation errors (red text below input, red border on field)
- Page-level error messages with retry button for critical failures
- Network disconnection banner with auto-reconnect attempt

**Confirmation Dialogs:**
- Modal dialogs for destructive actions:
  * Dialog overlay (semi-transparent dark background)
  * Dialog card (white, centered, max-width 500px)
  * Title: "Confirm Deletion" or similar
  * Body: "You are about to delete 12 conversations. This cannot be undone."
  * Checkbox: "Don't ask me again for this session" (optional)
  * Action buttons: [Cancel] (secondary) [Confirm Delete] (danger red)
  * Close X in top-right corner
  * Escape key to dismiss

**Empty States:**
- No conversations yet:
  * Centered empty state illustration (friendly graphic)
  * Heading: "No Conversations Yet"
  * Description: "Get started by generating your first training conversation"
  * [Generate Conversation] primary CTA button
  * Optional: "Learn How" secondary link to documentation

- No search results:
  * Search icon illustration
  * "No conversations match your search"
  * Display search term: "Results for: '[search query]'"
  * [Clear Search] button
  * Suggestion: "Try broadening your filters"

- Empty tier (no templates):
  * Template illustration
  * "No Templates Created"
  * [Create First Template] CTA button

### Conversation Table View (E05)

**Data Table Component:**
- Table header row with sortable columns:
  * [Checkbox] select all
  * ID (sortable, with sort indicator arrows)
  * Title/Topic (sortable, truncated with tooltip on hover)
  * Tier (badge: Template/Scenario/Edge Case)
  * Category/Tags (colored tag chips, expandable if multiple)
  * Status (status badge: Draft/Generated/Approved/Rejected with colors)
  * Quality Score (number + visual bar, sortable)
  * Created Date (sortable, relative time "2 hours ago" + tooltip with full date)
  * Actions (three-dot menu dropdown)

- Table body rows:
  * Row selection checkbox
  * All column data as specified above
  * Row hover state (light gray background)
  * Click row to open preview (except checkbox/actions)
  * "Generate" which generates the conversation JSON from that specific scenario and associated prompt
  * Actions dropdown menu items:
    - View Details
    - Edit
    - Duplicate
    - Move to Review
    - Export
    - Delete (with confirmation)

- Table controls toolbar (above table):
  * Column visibility dropdown: "Columns ⏷" (checkboxes for show/hide)
  * Density toggle: Icons for Compact | Comfortable | Spacious
  * Rows per page selector: dropdown (10, 25, 50, 100)
  * Total count display: "Showing 1-25 of 247 conversations"

- Pagination controls (below table):
  * [First] [Previous] [1] [2] [3] ... [10] [Next] [Last]
  * Current page highlighted
  * Page jump input: "Go to page: [input]"

**Filtering System:**
- Quick filters (pill buttons, toggleable):
  * All (default)
  * Templates Only
  * Scenarios Only
  * Edge Cases Only
  * Needs Review
  * Approved
  * High Quality (score >8)

**Bulk Actions Toolbar:** (NOT IMPLEMENTED)
- Activated when rows selected, replaces normal action toolbar:
  * Selection summary: "12 conversations selected"
  * [Select All] button (selects all in current view)
  * [Select None] button (clears selection)
  * [Select All Filtered] button (selects all matching current filters, across pages)
  * Bulk action dropdown: "Actions ⏷"
    - Generate Variations
    - Add Tags (opens tag selector modal)
    - Change Status (opens status selector)
    - Move to Review Queue
    - Export Selected (opens export modal)
    - Delete Selected (requires confirmation with count)
  * [X] Close bulk mode button

### Single Conversation Generation (E04) (NOT IMPLEMENTED)

**Generation Form Interface:**
- Form container (centered, max-width 800px):

  **Section 1: Tier Selection**
  - Radio button group (large cards, visual):
    * [Template] - "Start from scratch" (description text)
    * [Scenario] - "Based on existing template" (requires template selection)
    * [Edge Case] - "Test unusual situations" (requires scenario selection)
  - Help text: "Choose the tier for your conversation"

  **Section 2: Context Parameters**
  - If Scenario or Edge Case selected:
    * Parent Template/Scenario dropdown selector (searchable)
    * Shows: Name, description preview, usage count

  - Topic/Context Input:
    * Label: "Conversation Topic or Context" (required indicator *)
    * Text area (500 character limit, counter shown)
    * Placeholder: "Describe what this conversation should cover..."
    * Help text: "Be specific about the context, goals, and key concepts"

  - Target Audience Selector:
    * Dropdown: Beginner | Intermediate | Advanced | Expert
    * Help tooltip explaining each level

  - Complexity Level:
    * Slider (1-10 range)
    * Visual labels at ends: "Simple" | "Complex"
    * Current value display: "Complexity: 7"

  - Conversation Length:
    * Radio buttons: Short (5-10 turns) | Medium (10-20 turns) | Long (20+ turns)
    * Token estimate shown: "Estimated: ~2000 tokens"

  - Style/Tone:
    * Dropdown: Formal | Professional | Conversational | Technical | Educational | Other
    * If "Other" selected: text input appears

  - Advanced Parameters (collapsed by default):
    * [▸ Show Advanced Options] expandable section
    * When expanded:
      - Temperature slider (0.0-1.0, 0.1 increments)
      - Max tokens input (number)
      - Custom system prompt text area
      - Seed input (for reproducibility)

  **Section 3: Preview & Estimation**
  - Parameter summary card:
    * "Your Configuration:" heading
    * Bulleted list of selected parameters
    * Estimated generation time: "~15 seconds"
    * Estimated cost: "$0.03" (if applicable)

  - Similar conversations panel (if any exist):
    * "Similar Conversations:" heading
    * List of 3-5 similar existing conversations
    * Click to view details

  **Section 4: Actions**
  - Button group (right-aligned):
    * [Cancel] tertiary button (gray)
    * [Save as Draft] secondary button (outline)
    * [Generate Conversation] primary button (blue, prominent)

**Generation Progress Modal:**
- Modal overlay (semi-transparent)
- Modal card (centered, max-width 500px):
  * Progress spinner (animated)
  * Progress percentage: "42% Complete"
  * Status text: "Generating conversation..."
  * Estimated time remaining: "~8 seconds remaining"
  * Progress bar (visual, matching percentage)
  * [Cancel Generation] button (below progress)

- **Success State:**
  * Success icon (green checkmark animation)
  * "Conversation Generated Successfully!"
  * Preview snippet (first 2 turns of conversation)
  * Actions:
    - [View Full Conversation] primary button
    - [Generate Another] secondary button
    - [Close] tertiary button

- **Error State:**
  * Error icon (red X)
  * "Generation Failed"
  * Error message: [specific error reason]
  * Actions:
    - [Retry] primary button
    - [Edit Parameters] secondary button
    - [Cancel] tertiary button

### Batch Generation Interface (E04)

**Batch Setup Screen:**
- Page title: "Batch Conversation Generation"
- Subtitle: "Generate multiple conversations at once"

**Input Methods Tabs:**
- Tab selector:
  * [CSV Upload] | [Manual Entry] | [Template-Based] | [Clone Existing]

- **CSV Upload Tab:**
  * Drag-and-drop upload zone:
    - "Drag CSV file here or click to browse"
    - File icon illustration
    - Accepted format note: "CSV with columns: tier, topic, audience, complexity, length, style"
    - [Download Sample CSV] link
  * Upload progress bar (when uploading)
  * Preview table showing first 10 rows after upload
  * [Import All Rows] button

- **Manual Entry Tab:**
  * Spreadsheet-like table interface:
    - Columns: Tier | Topic | Audience | Complexity | Length | Style | [Actions]
    - [+ Add Row] button adds new row
    - Inline editing in cells
    - [X] delete row button per row
    - [Import from CSV] button above table
  * [Add Multiple Rows] button adds 5 rows at once

- **Template-Based Tab:**
  * Template selector dropdown
  * Topic/context variations text area:
    - "Enter one topic per line"
    - Multi-line input (20 lines visible)
  * Shared parameters for all:
    - Audience dropdown
    - Complexity slider
    - Style dropdown
  * [Generate from Template] button

- **Clone Existing Tab:**
  * Existing conversation selector (searchable dropdown)
  * Number of variations input: "Create [5] variations"
  * Variation dimensions (checkboxes):
    - [ ] Vary complexity
    - [ ] Vary tone
    - [ ] Vary approach
    - [ ] Add edge cases
  * [Clone with Variations] button

**Batch Configuration Panel (below input):**
- Shared settings card:
  * "Settings Applied to All:" heading
  * Override toggles:
    - [ ] Override audience (dropdown if checked)
    - [ ] Override complexity (slider if checked)
    - [ ] Override style (dropdown if checked)

- Processing settings:
  * Priority selector: High | Normal | Low
  * Concurrent processing: "Process [3] conversations at a time"
  * Error handling: Continue on error | Stop on first error (radio buttons)

**Batch Actions:**
- [Preview Batch] button - shows confirmation modal with item count
- [Start Batch Generation] primary button (blue, prominent)
- [Save Batch as Draft] secondary button
- [Cancel] tertiary button

**Processing Queue Dashboard (appears after starting batch):**
- Full-page interface:

  **Header:**
  - "Batch Processing: 'Marketing Scenarios Batch'" (batch name)
  - Overall progress bar: "Processing 7 of 25 (28%)"
  - Time elapsed: "2m 34s elapsed"
  - Estimated time remaining: "~6m 15s remaining"

  **Control Buttons:**
  - [Pause All] button
  - [Resume All] button (if paused)
  - [Cancel All] button (requires confirmation)
  - [Minimize to Background] button (hides queue, shows status in header bar)

  **Queue Table:**
  - Columns:
    * Position (# in queue)
    * Topic/Title
    * Tier badge
    * Parameters summary (truncated, tooltip on hover)
    * Status (Queued/Processing/Complete/Failed badge)
    * Progress bar (for currently processing)
    * Estimated time (for queued items)
    * Actions dropdown per row:
      - View Details
      - Move to Top
      - Pause (for queued)
      - Cancel
      - Retry (for failed)

  - Visual indicators:
    * Currently processing rows highlighted (light blue background)
    * Completed rows have green checkmark
    * Failed rows have red X icon with error tooltip
    * Queued rows are standard styling

  **Resource Monitor (sidebar):**
  - Concurrent processing slots:
    * Visual slots showing "Slot 1: Processing 'Healthcare Scenario'"
    * "Slot 2: Processing 'Finance Scenario'"
    * "Slot 3: Available"
  - Resource usage:
    * API calls made / remaining
    * Cost so far: "$1.23"

**Batch Completion Summary (when all done):**
- Summary card (centered):
  * Success icon (large green checkmark)
  * "Batch Generation Complete"
  * Statistics:
    - Total processed: 25
    - Successful: 23 (green)
    - Failed: 2 (red)
    - Average quality score: 8.3/10
    - Total time: 8m 42s
    - Total cost: $2.15

  * Actions:
    - [View All Results] (navigates to filtered table)
    - [View Failed Items] (shows only failed)
    - [Export Batch] (download results)
    - [Generate Report] (PDF summary)
    - [Start New Batch] (returns to batch setup)

### Review & Approval Interface (E06)

**Review Queue Page:**
- Page title: "Review Queue"
- Subtitle: "23 conversations awaiting review"

**Queue Table (simplified):**
- Columns focused on review priorities:
  * [Checkbox] for bulk selection
  * Title/Topic
  * Tier badge
  * Quality Score (sortable, visual bar)
  * Generated Date (relative)
  * Priority indicator (High/Normal/Low flag)
  * [Review] button per row

- Sorting controls:
  * Default sort: Priority (High first)
  * Alt sorts: Quality (low first), Date (oldest first)

- Bulk review actions:
  * [Approve Selected] button
  * [Reject Selected] button

**Conversation Preview/Review Screen (full-page):**

**Layout:**
- Split view: 60% conversation display (left), 40% metadata/actions (right)
- Can be toggled to full-width conversation view (hide right panel)

**Left Panel - Conversation Display:**

- **Header Section:**
  * Conversation title (editable inline, click to edit)
  * Tier badge (Template/Scenario/Edge Case)
  * Category/tags (editable, click to add/remove tags)
  * Version dropdown (if multiple versions exist): "Version 1 of 3 ⏷"
  * Status badge: Current status

- **Conversation Content:**
  * Turn-by-turn layout:
    - Avatar icon (User vs Assistant)
    - Label: "User" or "Assistant"
    - Message bubble containing text
    - Timestamp: "2:34 PM"
    - Token count: "~150 tokens"
    - [Copy] button (copies this turn)

  * Code blocks formatted with syntax highlighting

  * Long responses have [Show More] / [Show Less] toggle

  * Each turn has hover actions:
    - [Edit Turn] pencil icon
    - [Delete Turn] trash icon
    - [Flag Issue] flag icon

  * Bottom of conversation:
    - Total turns: "8 turns"
    - Total tokens: "~1,200 tokens"
    - [Copy Full Conversation] button

**Right Panel - Metadata & Actions:**

- **Quality Metrics Section:**
  * Overall quality score:
    - Large circular gauge (0-10 scale)
    - Score number in center: "8.3"
    - Color-coded: Red <5, Yellow 5-7, Green >7

  * Dimensional scores (with visual bars):
    - Relevance: 8.5/10 [==========-]
    - Accuracy: 8.0/10 [========---]
    - Naturalness: 9.0/10 [==========-]
    - Methodology: 8.5/10 [==========-]
    - Coherence: 8.0/10 [========---]

  * AI Confidence: "High" (badge)

  * Uniqueness Score: 7.8/10 (with info tooltip)

  * Training Value: "High" badge (green)

  * [View Detailed Analysis] expandable section:
    - When expanded, shows paragraph explaining scores
    - Highlights strengths and weaknesses

- **Approval Actions Section:**
  * Large action buttons (full width):
    - [✓ Approve] button (green, prominent)
    - [⟲ Request Revisions] button (yellow)
    - [✗ Reject] button (red, requires confirmation)

  * Comment/Feedback:
    - Label: "Add Comment (optional for approval, required for revision/rejection)"
    - Text area (500 chars max)
    - Placeholder: "Provide feedback or reason..."

  * Revision Request Reasons (shown if Request Revisions clicked):
    - Checkboxes:
      [ ] Factual inaccuracy
      [ ] Poor quality or clarity
      [ ] Off-topic or not aligned with parameters
      [ ] Style inconsistency
      [ ] Missing key concepts
      [ ] Other (specify in comment)

- **Metadata Display:**
  * Created date and time
  * Created by: User name
  * Parent template/scenario (if applicable, with [View Parent] link)
  * Generation parameters summary (collapsible list)

- **Action History:**
  * Timeline of actions on this conversation:
    - "Generated by John Doe - 2 hours ago"
    - "Quality score assigned - 2 hours ago"
    - "Moved to review queue - 1 hour ago"
  * [View Full History] link

**Review Navigation:**
- Navigation bar (top of screen, sticky):
  * [← Previous] button (keyboard shortcut: P or ←)
  * Queue position: "Reviewing 3 of 23"
  * [Next →] button (keyboard shortcut: N or →)
  * [Skip] button (moves to end of queue)
  * [Back to Queue] button (returns to queue table)

- Keyboard shortcuts displayed in tooltips and help panel:
  * `A` - Approve
  * `R` - Request Revisions / Reject
  * `C` - Focus comment field
  * `N` or `→` - Next
  * `P` or `←` - Previous
  * `S` - Skip
  * `Q` - Back to queue

**Bulk Approval Mode (when multiple selected from queue):**
- Modal overlay:
  * "Bulk Approve 8 Conversations"
  * List of conversation titles
  * Optional comment: "Apply comment to all (optional)"
  * [Confirm Approve All] button
  * [Cancel] button
- Toast notification on completion: "8 conversations approved"

### Three-Tier Architecture Navigation (E07)

**Tier Switcher (Global Navigation):**
- Tab bar (below main header):
  * [Templates (23)] tab
  * [Scenarios (145)] tab
  * [Edge Cases (67)] tab
  * Active tab highlighted (blue underline, bold text)
  * Count badges show totals per tier
  * Clicking tab navigates to that tier's main view

**Template Tier Interface:**

- **Template Library (main view):**
  * Page title: "Templates"
  * Subtitle: "Reusable conversation foundations"
  * [New Template] button (top-right, primary CTA)

  * View toggle:
    - [Grid View] icon button
    - [List View] icon button

  * Sort dropdown: "Sort by: ⏷"
    - Most Used
    - Recently Modified
    - Alphabetical
    - Highest Rated

  * Filter dropdown: "Filter: ⏷"
    - All Templates
    - My Templates
    - Shared Templates
    - By Category (sub-menu)

  * **Grid View (default):**
    - Template cards (3-4 per row):
      * Template name (heading)
      * Description preview (2 lines, truncated)
      * Usage count badge: "Used 23 times"
      * Last modified: "Updated 2 days ago"
      * Quality rating: ★★★★☆ (stars)
      * Category tags (colored chips)
      * Actions dropdown (three-dot menu):
        - Edit Template
        - Duplicate
        - View Scenarios (generated from this template)
        - Export
        - Delete
      * Hover effect: Card raises with shadow

  * **List View (alternative):**
    - Table with columns:
      * Name (sortable)
      * Description (truncated)
      * Usage Count (sortable, badge)
      * Last Modified (sortable, date)
      * Rating (sortable, stars)
      * Actions dropdown

- **Template Editor (modal or full page):**
  * Modal overlay or dedicated page
  * Form sections:

    **Section 1: Basic Info**
    - Template Name: Text input (required)
    - Description: Text area (required, 500 chars)
    - Category: Dropdown (select or create new)

    **Section 2: Conversation Structure**
    - Base conversation layout: Text area with syntax highlighting
    - Parameter placeholders: `{{topic}}`, `{{audience}}`, `{{complexity}}`
    - Variable definitions:
      * Table showing: Variable Name | Type | Default Value | [Actions]
      * [+ Add Variable] button

    **Section 3: Style Guidelines**
    - Tone: Dropdown
    - Complexity baseline: Slider
    - Style notes: Text area
    - Example conversation: Text area (optional, for reference)

    **Section 4: Quality Rules**
    - Minimum quality threshold: Slider (0-10)
    - Required elements: Checkboxes
      - [ ] Must include examples
      - [ ] Must include code blocks (if technical)
      - [ ] Must follow established patterns

  * Actions:
    - [Preview Template] button (shows how it will render)
    - [Save Template] primary button
    - [Save as New] secondary button
    - [Cancel] tertiary button

  * Validation:
    - Real-time validation of syntax
    - Error messages for missing required fields
    - Warning if parameter placeholders are invalid

**Scenario Tier Interface:**

- **Scenario Management (main view):**
  * Page title: "Scenarios"
  * Subtitle: "Contextual conversation variations"
  * [New Scenario] button

  * Parent template filter:
    - "Show scenarios from: ⏷"
    - Dropdown listing all templates
    - Option: "All Templates" (default)

  * Table view (primary):
    - Columns:
      * [Checkbox] for bulk selection
      * Scenario Name
      * Parent Template (with [View Parent] link)
      * Variations Count badge
      * Status (Draft/Active/Archived)
      * Quality Score
      * Created Date
      * Actions dropdown

    - Grouping option:
      * "Group by Parent Template" toggle
      * When enabled, table groups scenarios under parent template headers
      * Collapsible groups (click to expand/collapse)

  * Bulk actions (when rows selected):
    - Generate Variations
    - Move to Review
    - Export
    - Delete

- **Scenario Builder (form page):**
  * Page title: "Create New Scenario" or "Edit Scenario: [name]"
  * Breadcrumb: Templates > [Parent Template Name] > New Scenario

  * Form sections:

    **Section 1: Parent Template**
    - Parent template selector: Searchable dropdown
    - Shows: Template name, description preview, usage count
    - [View Full Template] link
    - Preview panel shows template structure with parameter placeholders

    **Section 2: Scenario Definition**
    - Scenario name: Text input (required)
    - Description: Text area
    - Context/Situation: Text area (required)
      * "Describe the specific context for this scenario"
      * Placeholder inherits from template if applicable

    **Section 3: Parameter Values**
    - Dynamic fields based on parent template variables
    - For each parameter:
      * Parameter name (from template)
      * Input field (text, number, dropdown based on type)
      * Help text from template
    - Example: If template has `{{topic}}`:
      * Topic: "Healthcare diagnosis workflow"

    **Section 4: Variation Generation**
    - Number of variations: Number input or slider (1-100)
    - Variation dimensions (checkboxes):
      [ ] Vary complexity (generates easier and harder versions)
      [ ] Vary tone (generates different style versions)
      [ ] Vary approach (generates different methodological approaches)
      [ ] Randomize examples (uses different examples in each variation)
    - Randomization seed: Number input (optional, for reproducibility)
    - [Generate Preview] button - shows sample of 1-2 variations

  * Actions:
    - [Generate Scenarios] primary button (creates all variations)
    - [Save as Draft] secondary button
    - [Cancel] tertiary button

  * Preview panel (right sidebar, appears after Generate Preview):
    - Shows first turn or two of sample variations
    - "Variation 1 (Complexity: 6)"
    - "Variation 2 (Complexity: 8)"
    - Highlights differences between variations

**Edge Case Tier Interface:**

- **Edge Case Collection (main view):**
  * Page title: "Edge Cases"
  * Subtitle: "Unusual situations and boundary conditions"
  * [New Edge Case] button
  * [Auto-Generate Edge Cases] button (secondary CTA)

  * Category filter:
    - Quick filter pills:
      * All | Error Conditions | Boundary Values | Unusual Inputs | Complex Combinations | Failure Scenarios

  * Grid or table view:

    **Grid View (default):**
    - Edge case cards:
      * Edge case title
      * Parent scenario link: "Based on: [Scenario Name]"
      * Edge case type badge: "Error Condition"
      * Complexity indicator: Visual icon or number
      * Test status badge: "Tested ✓" or "Untested"
      * Description preview (2 lines)
      * Actions dropdown:
        - View Details
        - Edit
        - Run Test
        - Duplicate
        - Delete

    **Table View:**
    - Columns:
      * Title
      * Parent Scenario (link)
      * Edge Case Type (badge)
      * Complexity (number)
      * Test Status (badge with icon)
      * Created Date
      * Actions

- **Edge Case Generator (modal or page):**
  * Modal title: "Auto-Generate Edge Cases"

  * Form:

    **Section 1: Source Selection**
    - Parent scenario selector: Searchable dropdown
    - Shows scenario name and description

    **Section 2: Edge Case Types**
    - "Select edge case types to generate:" (checkboxes)
      [ ] Error conditions (invalid inputs, system failures)
      [ ] Boundary values (minimum, maximum, zero, negative)
      [ ] Unusual user inputs (unexpected formats, mixed languages, special characters)
      [ ] Complex combinations (multiple conditions at once)
      [ ] Failure scenarios (what happens when things go wrong)

    **Section 3: Generation Settings**
    - Quantity per type: Number input (default: 5)
    - Total edge cases to generate: Display (calculated: 5 types × 5 = 25)
    - Complexity range: Dual slider (e.g., 6-9 on 1-10 scale)

  * Actions:
    - [Generate Edge Cases] primary button
    - [Cancel] button

  * Progress modal (appears during generation):
    - "Generating 25 edge cases..."
    - Progress bar
    - [Cancel] button

  * Completion modal:
    - "Edge Cases Generated"
    - Summary: "25 edge cases created from 'Healthcare Scenario'"
    - [View Edge Cases] button
    - [Generate More] button

- **Edge Case Testing Interface:**
  * Test panel (within edge case detail view):
    - Test status: "Not Tested" | "Passed" | "Failed"
    - [Run Test] button (triggers test execution)
    - Test results display:
      * If passed: Green checkmark, "Edge case handled correctly"
      * If failed: Red X, "Unexpected behavior detected"
      * Test details: Expected vs Actual output comparison
    - Test history: Timeline of past test runs

**Tier Relationship Visualization:**

- **Breadcrumb Navigation (on all pages):**
  * Shows current position in hierarchy
  * Examples:
    - "Templates"
    - "Templates > Healthcare Template"
    - "Templates > Healthcare Template > Diagnosis Scenario"
    - "Templates > Healthcare Template > Diagnosis Scenario > Invalid Input Edge Case"
  * Each segment is clickable (navigates to that level)

- **Relationship Tree View (sidebar, collapsible):**
  * Hierarchical tree structure:
    - ▸ Healthcare Template (23 scenarios)
      ▸ Diagnosis Scenario (12 edge cases)
        • Invalid Symptoms Edge Case
        • Missing Data Edge Case
        • Complex Comorbidity Edge Case
      ▸ Treatment Scenario (8 edge cases)
    - ▸ Finance Template (45 scenarios)
  * Click to expand/collapse branches
  * Click item name to navigate to it
  * Active item highlighted

- **View Parent / View Children Links:**
  * On Scenario pages:
    - [← View Parent Template] button (top)
    - [View Child Edge Cases (12) →] button (bottom)

  * On Edge Case pages:
    - [← View Parent Scenario] button (top)
    - "No children (edge cases are leaf nodes)" message

- **Relationship Diagram (modal):**
  * Triggered by [View Hierarchy] button
  * Modal with visual diagram:
    - Top: Template node (blue box)
    - Middle: Scenario nodes (green boxes) with lines to template
    - Bottom: Edge Case nodes (orange boxes) with lines to scenarios
    - Current item highlighted with bold border
    - Clickable nodes navigate to that item
    - Zoom controls: [+] [-] [Fit]
    - [Export Diagram] button (PNG or SVG)

### Coverage Analytics Dashboard (E05)

**Analytics Page:**
- Page title: "Coverage & Quality Analytics"
- Subtitle: "Understanding your training data landscape"

**Metrics Overview Cards (top of page):**
- Row of stat cards (4-5 cards):

  * **Total Conversations:**
    - Large number: "247"
    - Trend indicator: "+23 this week" (green up arrow)

  * **Templates/Scenarios/Edge Cases:**
    - Stacked number display:
      - Templates: 12
      - Scenarios: 145
      - Edge Cases: 90
    - Visual mini bar chart showing proportions

  * **Approval Rate:**
    - Large percentage: "87%"
    - Subtitle: "215 of 247 approved"
    - Color: Green (if >80%), Yellow (if 60-80%), Red (if <60%)

  * **Average Quality Score:**
    - Large number: "8.3"
    - Out of 10 scale
    - Visual mini gauge or star rating
    - Trend: "+0.4 from last month"

  * **Coverage Completeness:**
    - Percentage: "73%"
    - Subtitle: "of identified topics covered"
    - Progress ring visual
    - [View Gaps] link

**Topic Coverage Visualization:**
- Section title: "Topic Coverage Heatmap"
- Subtitle: "Conversation density across topics"

- **Heatmap Display:**
  * Grid of topic cells (like a GitHub contribution graph)
  * X-axis: Topics (categorical)
  * Y-axis: Time periods (days/weeks) OR Complexity levels
  * Cell color intensity: Number of conversations
    - Light color = few conversations
    - Dark color = many conversations
  * Legend: Color scale with number ranges
  * Hover on cell: Tooltip showing:
    - Topic name
    - Conversation count: "23 conversations"
    - Average quality: "8.1/10"
    - [View Conversations] link (filters main table)
  * Click cell: Filters main conversation table to that topic

- **Alternative View: Bubble Chart**
  * X-axis: Complexity
  * Y-axis: Quality Score
  * Bubble size: Number of conversations
  * Bubble color: Topic category
  * Hover: Tooltip with topic details
  * Click: Filters table

**Quality Distribution Charts:**
- Section title: "Quality Distribution & Trends"

- **Quality Score Histogram:**
  * Bar chart showing distribution:
    - X-axis: Quality score bins (0-2, 2-4, 4-6, 6-8, 8-10)
    - Y-axis: Count of conversations
    - Bars color-coded: Red (low), Yellow (medium), Green (high)
  * Vertical line showing mean: "Mean: 8.3"
  * Click bar: Filters table to that score range

- **Quality Trend Line (time series):**
  * Line chart:
    - X-axis: Time (days/weeks/months)
    - Y-axis: Average quality score
    - Line showing average quality over time
    - Shaded area showing min-max range
  * Annotations for significant events:
    - "New template introduced" (marker on timeline)
  * Toggle: Show by tier (3 lines: Template, Scenario, Edge Case)

- **Tier Quality Comparison:**
  * Grouped bar chart:
    - X-axis: Tiers (Template, Scenario, Edge Case)
    - Y-axis: Average quality score
    - Bars showing average quality per tier
    - Error bars or confidence intervals
  * Insights text: "Scenarios have highest average quality (8.5/10)"

**Gap Analysis Panel:**
- Section title: "Coverage Gaps & Opportunities"
- Subtitle: "Areas needing more training data"

- **Underrepresented Topics List:**
  * Table showing:
    - Topic Name
    - Current Conversation Count (sortable)
    - Target Count (suggested)
    - Gap (difference)
    - Priority indicator (High/Medium/Low flag)
    - [Generate for This Topic] quick action button
  * Sort options: Gap size (default), Priority, Alphabetical

- **Low-Quality Areas:**
  * List of topics with below-threshold quality:
    - Topic Name
    - Average Quality Score (red or yellow highlighted)
    - Conversation Count
    - [Review Conversations] button

- **Missing Edge Cases Alert:**
  * Alert box (yellow background):
    - Icon: Warning triangle
    - Message: "12 scenarios have no edge cases generated"
    - [View Scenarios] button
    - [Auto-Generate Edge Cases] button

- **Quick Actions:**
  * [Generate for Gaps] button - opens batch generation pre-filled with gap topics
  * [Export Gap Report] button - downloads CSV or PDF

**Filtering Integration:**
- All visualizations have [Filter Table by This] functionality
- Clicking any chart element applies corresponding filter to main conversation table
- Active filters from table also filter analytics visualizations
- Bidirectional filtering for exploratory analysis

### Export Functionality (E05)

**Export Button/Menu:**
- Located on conversation table page
- [Export] button (or "Export ⏷" dropdown)
- Opens export modal or panel

**Export Configuration Modal:**
- Modal title: "Export Conversations"
- Modal max-width: 600px

**Section 1: Export Scope**
- Radio buttons:
  * ( ) Selected conversations only (12 selected)
  * ( ) All conversations matching current filters (247)
  * ( ) Entire dataset (247 total)

**Section 2: Format Selection**
- Radio buttons with format descriptions:
  * ( ) **JSON** - Structured data for programmatic access
  * ( ) **JSONL** - Line-delimited JSON, ideal for training pipelines
  * ( ) **CSV** - Spreadsheet-compatible, metadata only
  * ( ) **Markdown** - Human-readable formatted text
  * ( ) **Custom** - Use custom template (shows template selector)

**Section 3: Export Options**
- Checkboxes for optional data:
  [ ] Include metadata (tags, status, dates)
  [ ] Include quality scores and metrics
  [ ] Include timestamps for each turn
  [ ] Include approval history and comments
  [ ] Include parent template/scenario references
  [ ] Include full conversation content (uncheck for metadata-only)

- If filtered data:
  * Info message: "Export includes only conversations matching: [active filter description]"
  * [Clear Filters] link to export all

**Section 4: Preview**
- [Preview Export] button
- When clicked, shows preview panel:
  * Code block with first 50 lines of export
  * "Showing first 50 lines of 1,234..."
  * Syntax highlighting based on format
  * [Copy Preview] button

**Section 5: Actions**
- Button group:
  * [Download Export] primary button (blue)
    - Triggers file download immediately
    - Filename: "conversations-export-2025-01-15.jsonl" (format and date)

  * [Schedule Export] secondary button (outline)
    - Opens scheduling sub-modal:
      * Frequency: Daily | Weekly | Monthly
      * Time of day: Time picker
      * Email results to: Email input
      * [Save Schedule] button

  * [Send to Integration] secondary button (outline)
    - Opens integration sub-modal:
      * Integration selector: Dropdown (Zapier, Webhook, S3, etc.)
      * Configuration fields (API key, endpoint, etc.)
      * [Test Connection] button
      * [Send Now] button

  * [Cancel] tertiary button (closes modal)

**Export History Panel (collapsible section below config):**
- [▸ View Export History] expandable
- When expanded, shows table:
  * Columns:
    - Export Date
    - Format
    - Scope (e.g., "All", "Filtered", "Selected (12)")
    - File Size
    - Actions:
      - [Download Again] (if still available)
      - [Regenerate] (creates new export with same config)
  * "Showing last 10 exports" (with [View All History] link)

**Export Progress (for large exports):**
- If export takes >2 seconds:
  * Progress modal appears:
    - "Preparing Export..."
    - Progress spinner
    - "Processed 123 of 247 conversations..."
    - [Cancel] button
  * On completion:
    - Success message: "Export Ready"
    - [Download File] button
    - Auto-download begins (browser-dependent)

## Interactions and Flows

### Primary User Flows

**Flow 1: First-Time User — Generate First Conversation**
1. User lands on empty dashboard with empty state
2. Clicks [Generate Conversation] from empty state or header
3. Single generation form appears
4. User selects Template tier (default)
5. Fills topic text area: "Customer support best practices"
6. Selects audience: "Intermediate"
7. Adjusts complexity slider to 6
8. Selects length: "Medium"
9. Reviews parameter summary in preview panel
10. Clicks [Generate Conversation] button
11. Progress modal appears with spinner and "Generating..."
12. After ~15 seconds, success modal shows with conversation preview
13. User clicks [View Full Conversation] to see complete result
14. Conversation appears in preview interface with quality metrics
15. User clicks [Approve] to mark it ready
16. Success toast appears: "Conversation approved successfully"
17. User returns to dashboard, sees conversation in table

**Flow 2: Experienced User — Batch Generation for Coverage Gap**
1. User navigates to Analytics page
2. Reviews coverage heatmap, identifies gap in "Healthcare" topic
3. Clicks [Generate for Gaps] button from gap analysis panel
4. Batch generation page opens with pre-filled topic: "Healthcare"
5. User switches to Template-Based tab
6. Selects "Medical Consultation" template from dropdown
7. Enters 10 topic variations, one per line:
   - "Diagnosing common cold"
   - "Managing chronic pain"
   - "Pediatric fever assessment"
   - (etc., 10 total)
8. Sets shared complexity to 7
9. Sets processing priority to "High"
10. Clicks [Start Batch Generation]
11. Processing queue dashboard appears
12. 3 conversations process simultaneously (slots visual shows this)
13. User watches progress bars incrementing in real-time
14. One conversation fails with error tooltip: "API rate limit"
15. User clicks retry on failed item
16. After 5 minutes, batch completion summary appears
17. Shows 10/10 successful (after retry)
18. User clicks [View All Results]
19. Navigates to conversation table filtered to batch results
20. Reviews quality scores in table (all 8.0+)
21. User bulk-selects all 10 conversations
22. Clicks [Move to Review Queue] from bulk actions toolbar

**Flow 3: Reviewer — Rapid Approval Workflow**
1. User navigates to Review Queue page
2. Sees 23 conversations awaiting review
3. Clicks [Review] on first conversation
4. Preview interface loads with conversation on left, metrics on right
5. User reads first 2-3 turns, conversation is high quality
6. Quality score shows 8.5/10 (green)
7. User presses `A` keyboard shortcut to approve
8. Success toast appears, next conversation auto-loads
9. Second conversation appears, quality score 6.2/10 (yellow)
10. User reads full conversation, identifies unclear language
11. Clicks [Request Revisions] button
12. Checks "Poor quality or clarity" checkbox
13. Enters comment: "Please clarify the explanation in turn 4"
14. Clicks [Submit Request]
15. Conversation marked for revision, next conversation loads
16. User presses `N` key to go to next (or it auto-loaded)
17. Continues reviewing with keyboard shortcuts `A`, `N`, `P`
18. After 15 approvals, queue position shows "18 of 23"
19. User presses `Q` to return to queue
20. Queue table shows remaining 5 conversations
21. User bulk-selects all 5 (similar topics, already spot-checked)
22. Clicks [Approve Selected]
23. Bulk approval confirmation modal appears
24. User clicks [Confirm Approve All]
25. Success toast: "5 conversations approved"
26. Review queue now empty, shows empty state: "All caught up!"

**Flow 4: Template Creator — Building Scenario Hierarchy**
1. User navigates to Templates page
2. Clicks [New Template] button
3. Template editor modal opens
4. User enters name: "Sales Objection Handling"
5. Enters description: "Template for handling customer objections in sales scenarios"
6. Selects category: "Sales & Marketing"
7. In conversation structure field, enters template with placeholders:
   ```
   User: I'm concerned about {{objection_type}}.
   Assistant: I understand your concern about {{objection_type}}. Let me address that by {{resolution_approach}}.
   ```
8. Adds variables:
   - Variable: "objection_type" | Type: Text | Default: "pricing"
   - Variable: "resolution_approach" | Type: Text | Default: "explaining value proposition"
9. Sets tone: "Professional"
10. Sets complexity baseline: 6
11. Clicks [Preview Template] to see rendered example
12. Preview looks good, clicks [Save Template]
13. Success toast: "Template created successfully"
14. Template appears in template library grid
15. User clicks on new template card
16. Template detail view loads
17. User clicks [Create Scenario from This Template]
18. Scenario builder opens with parent template pre-selected
19. User enters scenario name: "Pricing Objection - Enterprise Client"
20. Fills context: "Client is concerned about enterprise pricing tier"
21. Sets parameter values:
    - objection_type: "enterprise pricing being too high"
    - resolution_approach: "demonstrating ROI calculation and case studies"
22. Sets variations to generate: 5
23. Checks variation dimensions: [✓] Vary complexity [✓] Vary tone
24. Clicks [Generate Preview]
25. Preview panel shows 2 sample variations with different complexity levels
26. Satisfied, clicks [Generate Scenarios]
27. Progress modal shows generation
28. 5 scenarios created, shown in scenario management table
29. User clicks one scenario
30. Scenario detail view loads
31. User clicks [Auto-Generate Edge Cases]
32. Edge case generator modal opens with scenario pre-selected
33. Checks edge case types: [✓] Error conditions [✓] Unusual inputs
34. Sets quantity per type: 3
35. Clicks [Generate Edge Cases]
36. 6 edge cases created (3 × 2 types)
37. User clicks [View Edge Cases]
38. Edge case collection shows 6 new cards
39. User selects one: "Pricing Objection - Invalid Budget Input"
40. Edge case detail loads
41. User clicks [Run Test]
42. Test executes, shows "Passed ✓" status
43. User navigates back to Templates tab
44. Sees template now shows "5 scenarios" in usage count
45. Clicks template card, then [View Scenarios]
46. Scenario table filtered to this template, shows all 5 scenarios
47. Hierarchy is established: 1 Template → 5 Scenarios → 6 Edge Cases

**Flow 5: Data Manager — Bulk Export for Training Pipeline**
1. User navigates to dashboard/conversation table
2. Applies filters:
   - Status: Approved
   - Quality Score: >7.5
   - Tier: All
3. Table shows 187 matching conversations
4. User clicks [Export] button
5. Export modal opens
6. Selects scope: "All conversations matching current filters (187)"
7. Selects format: "JSONL"
8. Checks options:
   [✓] Include metadata
   [✓] Include quality scores
   [✗] Include timestamps (not needed)
   [✓] Include full conversation content
9. Clicks [Preview Export]
10. Preview panel shows first 50 lines of JSONL format
11. Format looks correct for training pipeline
12. Clicks [Download Export]
13. File downloads: "conversations-export-2025-01-15.jsonl"
14. User also clicks [Schedule Export]
15. Scheduling modal opens
16. Sets frequency: "Weekly"
17. Sets day: "Monday"
18. Sets time: "9:00 AM"
19. Enters email: "data-team@company.com"
20. Clicks [Save Schedule]
21. Success toast: "Export scheduled for every Monday at 9:00 AM"
22. Export history panel now shows this export in list
23. User can regenerate or download again from history

### Secondary Interactions

**Dynamic Filtering Interactions:**
- User types in search bar → Results update in real-time (debounced)
- User clicks quick filter pill → Pill highlights, table filters instantly
- User adds advanced filter condition → Filter chip appears above table
- User clicks X on filter chip → Filter removed, table updates
- User saves filter preset → Added to "My Filters" dropdown
- User sorts column → Sort arrow changes direction, table reorders
- User changes rows per page → Table pagination resets to page 1 with new count

**Navigation & Breadcrumb Interactions:**
- User clicks breadcrumb segment → Navigates to that level, maintains context
- User clicks sidebar item → Main content area updates, breadcrumb updates
- User collapses sidebar → Sidebar shows icon-only, main content expands
- User clicks tier tab → Switches to tier view, updates URL, breadcrumb changes
- User uses browser back button → Returns to previous view, state restored

**Modal & Overlay Interactions:**
- User clicks outside modal → Modal closes (if not blocking/required)
- User presses Escape → Current modal closes
- User clicks [X] in modal corner → Modal closes
- User submits form in modal → Success: Modal closes + toast, Error: Inline errors show + modal stays open
- Nested modals (rare): Second modal opens over first, closing second returns to first

**Table Row Interactions:**
- User hovers row → Background lightens, actions become visible
- User clicks row (not checkbox/actions) → Navigation to detail view or preview modal
- User clicks row checkbox → Row highlights (selected state), bulk toolbar appears
- User double-clicks row → Quick action (e.g., open in edit mode)
- User right-clicks row → Context menu appears (if supported)

**Form & Input Interactions:**
- User focuses input field → Border color changes, label animates (if floating label)
- User types in text area → Character counter updates in real-time
- User moves slider → Value display updates immediately
- User selects dropdown option → Dropdown closes, selected value displays, dependent fields update
- User clicks collapsible section → Section expands with smooth animation, icon rotates
- User triggers validation error → Field border turns red, error message appears below field
- User corrects error → Error message disappears, border returns to normal
- User tabs through form → Focus moves logically, skip links available

**Chart & Visualization Interactions:**
- User hovers chart element → Tooltip appears with detailed data
- User clicks chart element → Filters table to that subset (e.g., click quality bar → shows conversations in that quality range)
- User drags slider in date range selector → Chart updates in real-time
- User toggles legend item → Corresponding data series hides/shows
- User clicks [Export Chart] → Downloads as PNG or SVG

**Drag-and-Drop Interactions:**
- User drags CSV file into upload zone → Zone highlights, file processes on drop
- User drags table column header → Column reorders, other columns shift
- User drags queue item → Item reorders in queue, position numbers update
- User drags template card to organize → If enabled, card moves to new position in grid

## Visual Feedback

### Interactive Element States

**Buttons:**
- **Default:** Solid color (primary: blue, secondary: outline, tertiary: text)
- **Hover:** Darkens 10%, cursor changes to pointer, slight scale (1.02×) or lift shadow
- **Active/Click:** Depresses slightly (scale 0.98×), darker color
- **Disabled:** Grayed out (opacity 0.5), cursor: not-allowed, no hover effect
- **Loading:** Spinner icon inside button, button stays same size, text may say "Generating..." or hide

**Form Inputs:**
- **Default:** Light border (gray), white background
- **Focus:** Border color changes to primary blue, subtle glow/shadow
- **Filled:** Border slightly darker to indicate has content
- **Error:** Red border, red error message text below
- **Success:** Green checkmark icon appears (inline or after field)
- **Disabled:** Gray background, lighter text, cursor: not-allowed

**Table Rows:**
- **Default:** White background, subtle border between rows
- **Hover:** Light gray background (#F9FAFB), subtle transition (0.2s)
- **Selected:** Light blue background (#E0F2FE), checkmark in checkbox
- **Active (current in preview):** Blue left border (4px), slightly darker background

**Cards:**
- **Default:** White background, subtle border, slight shadow
- **Hover:** Shadow increases (lift effect), scale 1.02×, border color intensifies
- **Selected/Active:** Blue border, blue shadow glow
- **Disabled:** Opacity 0.6, no hover effects

**Modals & Overlays:**
- **Entrance:** Fade in (0.3s), scale from 0.9× to 1× (subtle zoom)
- **Exit:** Fade out (0.2s), scale to 0.95× (subtle shrink)
- **Overlay background:** Dark semi-transparent (#000 at 0.5 opacity), blurs background if supported

### Status Indicators

**Badges:**
- **Draft:** Gray background, dark gray text
- **Generated:** Blue background, white text
- **Pending Review:** Yellow background, dark text
- **Approved:** Green background, white text
- **Rejected:** Red background, white text
- **Failed:** Red background with alert icon
- All badges have rounded corners (full height border-radius), padding: 4px 8px, font-size: 12px

**Quality Scores:**
- **High (8-10):** Green color, green progress bar, ★★★★★ stars (if using stars)
- **Medium (5-7.9):** Yellow/orange color, yellow progress bar, ★★★☆☆ stars
- **Low (0-4.9):** Red color, red progress bar, ★★☆☆☆ stars, warning icon
- Scores display as "8.3/10" with visual gauge or bar alongside

**Progress Bars:**
- **In Progress:** Animated gradient moving left-to-right (like loading shimmer)
- **Paused:** Static gray bar at current percentage
- **Complete:** Green fill, checkmark at end
- **Failed:** Red fill up to failure point, X icon at failure point

**Icons & Indicators:**
- **Success:** Green circle with white checkmark (✓)
- **Error:** Red circle with white X (✗)
- **Warning:** Yellow triangle with exclamation mark (!)
- **Info:** Blue circle with "i"
- **Processing:** Animated spinner (rotating circle or dots)
- **New/Updated:** Blue dot badge (notification indicator)

### Animations & Transitions

**Page Transitions:**
- Smooth fade (0.3s) when navigating between pages
- Content slides in from right (0.4s) for forward navigation
- Content slides out to right (0.4s) for back navigation

**List/Table Updates:**
- New rows fade in from top (0.5s)
- Deleted rows fade out and collapse (0.3s)
- Reordering: Smooth position transitions (0.4s ease-in-out)
- Filtering: Rows that don't match filter fade out and collapse (0.3s)

**Modal Behaviors:**
- Overlay fades in (0.3s)
- Modal scales from 0.95× to 1× while fading in (0.3s)
- Modal shakes (horizontal vibration) if validation error on submit
- Success state: Checkmark animates with scale pulse (0.5s)

**Loading States:**
- Skeleton screens: Pulsing gray gradients (1.5s loop)
- Spinners: Smooth rotation (1s per revolution)
- Progress bars: Indeterminate mode (wave animation) when percentage unknown
- Button spinners: Small rotating circle next to or replacing button text

**Interactive Feedback:**
- Button clicks: Ripple effect from click point (Material Design style) (0.4s)
- Hover effects: Smooth color transitions (0.2s)
- Focus rings: Fade in when focused (0.1s)
- Drag-and-drop: Dragged item has shadow, drop zones highlight, drop animates snap (0.3s)

**Success Celebrations:**
- Batch completion: Confetti animation (2s), optional
- First conversation generated: Gentle checkmark bounce animation (0.5s)
- Quality threshold exceeded: Sparkle effect around score (1s)
- All reviews complete: "All caught up!" message with happy icon

**Error & Warning Animations:**
- Form validation error: Input field shakes horizontally (0.3s)
- Critical error: Error icon bounces or pulses to draw attention
- Warning banners: Slide down from top (0.4s)
- Error toasts: Slide in from top-right corner (0.3s)

### Real-Time Updates

**Processing Status:**
- Generation progress: Percentage updates every 0.5s, smooth number transition
- Queue position: Updates immediately when item completes
- Estimated time remaining: Recalculates and updates every 2s
- Active job count in status bar: Updates in real-time

**Collaborative Indicators (if multi-user):**
- "User X is editing this conversation" banner (appears when detected)
- Avatar indicator showing who's viewing (if real-time presence)
- Auto-refresh when external changes detected (with toast notification)

**Notification Indicators:**
- Notification bell badge: Number increases with animation (scale pulse)
- New item in review queue: Count badge updates, slight pulse animation
- Status changes: Affected rows in table update background color briefly (flash effect)

## Accessibility Guidance

### Keyboard Accessibility

**Keyboard Navigation:**
- All interactive elements must be reachable via Tab key
- Tab order follows visual left-to-right, top-to-bottom flow
- Shift+Tab moves focus backward
- Arrow keys navigate within components (tables, lists, dropdowns, tabs)
- Enter or Space activates buttons and links
- Escape closes modals, dropdowns, tooltips

**Focus Indicators:**
- Visible focus ring (2px blue outline with slight offset) on all focusable elements
- Focus ring never hidden with outline: none (CSS)
- Focus ring contrasts with background (minimum 3:1 ratio)
- Focus persists during interactions (doesn't disappear prematurely)

**Keyboard Shortcuts:**
- All documented shortcuts must have alternatives (no keyboard-trap)
- Shortcuts indicated in tooltips and help documentation
- Shortcuts work globally where appropriate (e.g., Ctrl/Cmd+K for search)
- Shortcuts contextual to current page (e.g., A for approve only on review page)
- Users can see active shortcuts via help overlay (e.g., press "?" to see shortcuts)

**Skip Links:**
- "Skip to main content" link at very top of page (visible on focus)
- "Skip to navigation" for quick sidebar access
- "Skip to search" for immediate search access
- Skip links absolute-positioned at top, styled to be obvious when focused

### Screen Reader Support

**Semantic HTML:**
- Use proper heading hierarchy: h1 for page title, h2 for section titles, etc.
- Use `<nav>` for navigation regions
- Use `<main>` for main content area
- Use `<aside>` for sidebars
- Use `<article>` for independent content (conversation cards)
- Use `<section>` for thematic groupings

**ARIA Labels & Descriptions:**
- All icons have aria-label (e.g., `aria-label="Search"` on magnifying glass icon)
- Buttons with only icons have descriptive aria-label
- Form inputs have associated labels (explicit `<label for="id">`)
- Complex widgets (tabs, accordions, modals) use appropriate ARIA attributes:
  * `role="tablist"`, `role="tab"`, `role="tabpanel"` for tabs
  * `role="dialog"`, `aria-modal="true"` for modals
  * `aria-expanded` for collapsible sections
  * `aria-selected` for selected items
  * `aria-current` for current page in navigation
  * `aria-describedby` linking inputs to help text
  * `aria-live` regions for dynamic updates

**Status Announcements:**
- Toast notifications use `aria-live="polite"` or `"assertive"` for errors
- Loading states announced: "Loading conversations, please wait"
- Completion announcements: "25 conversations generated successfully"
- Error messages announced immediately
- Progress updates announced periodically (not constantly, to avoid spam)
- Page title updates to reflect current context (e.g., "Review Queue (23) - Training Data Generator")

**Table Accessibility:**
- Tables use `<thead>`, `<tbody>`, `<th>`, `<td>` properly
- Column headers have `scope="col"` attribute
- Row headers (if any) have `scope="row"` attribute
- Complex tables use `aria-describedby` to explain structure
- Sortable columns announce sort direction
- Filtered tables announce filter count: "Showing 12 of 247 conversations"

### Visual Accessibility

**Color Contrast:**
- Text on background: Minimum 4.5:1 contrast ratio (WCAG AA)
- Large text (18px+): Minimum 3:1 contrast ratio
- Interactive elements: Minimum 3:1 contrast ratio for focus indicators
- Status colors (red/yellow/green) also have text labels, not color-only
- Links underlined or otherwise distinguishable beyond color alone

**Text & Typography:**
- Minimum font size: 14px for body text (16px preferred)
- Line height: 1.5× font size for readability
- Maximum line length: ~70 characters for blocks of text
- Font choices: Sans-serif for UI (Inter, Roboto, system fonts)
- Text resizable up to 200% without breaking layout
- No justified text alignment (can create awkward spacing)

**Responsive & Zoom:**
- Layout works at 200% zoom without horizontal scrolling
- Touch targets on mobile/tablet: Minimum 44×44px
- Adequate spacing between interactive elements (8px+ margin)
- Responsive breakpoints don't hide critical functionality

**Motion & Animation:**
- Respect `prefers-reduced-motion` media query
- If user has reduced motion preference:
  * Disable decorative animations
  * Reduce transition durations (instant or very fast)
  * Keep essential feedback (loading spinners) but simplified
- Provide settings toggle: "Enable animations" checkbox in settings

### Form Accessibility

**Labels & Instructions:**
- Every input has visible, associated label
- Required fields marked with asterisk (*) and text "(required)"
- Help text available for complex inputs (via aria-describedby)
- Placeholder text not used as sole label (placeholders disappear on input)
- Field instructions appear before input, not after (better for screen readers)

**Error Handling:**
- Error messages associated with fields via aria-describedby
- Errors announced when they appear (aria-live)
- Error messages descriptive: Not just "Error" but "Password must be at least 8 characters"
- Errors persist until corrected (not immediately hidden)
- Form-level errors listed at top with links to problem fields
- Focus moved to first error field on submit failure

**Autocomplete & Suggestions:**
- Autocomplete dropdowns announce number of results
- Selected option announced when navigating with arrows
- Escape key closes autocomplete without clearing input
- Selected option submitted with Enter key

## Information Architecture

### Site Map Structure

```
Training Data Conversation Generation Platform
│
├── Dashboard (Home)
│   ├── Quick Stats Cards
│   ├── Conversation Table (primary view)
│   ├── Quick Actions (New Conversation, Batch Generate)
│   └── Recent Activity Feed
│
├── Templates (Tier 1)
│   ├── Template Library (grid/list view)
│   ├── Template Editor (modal/page)
│   ├── Template Detail View
│   └── Template Analytics
│
├── Scenarios (Tier 2)
│   ├── Scenario Management Table
│   ├── Scenario Builder (form/wizard)
│   ├── Scenario Detail View
│   └── Scenario Variation Generator
│
├── Edge Cases (Tier 3)
│   ├── Edge Case Collection (grid/list)
│   ├── Edge Case Generator (auto-gen modal)
│   ├── Edge Case Detail View
│   └── Edge Case Testing Interface
│
├── Review Queue
│   ├── Review Queue Table
│   ├── Conversation Preview/Review (full-page)
│   └── Bulk Approval Interface
│
├── Analytics & Coverage
│   ├── Metrics Overview Dashboard
│   ├── Topic Coverage Heatmap
│   ├── Quality Distribution Charts
│   ├── Gap Analysis Panel
│   └── Export Analytics Reports
│
├── Generation
│   ├── Single Conversation Form
│   ├── Batch Generation Setup
│   ├── Processing Queue Dashboard
│   └── Generation History
│
├── Settings
│   ├── User Profile
│   ├── Preferences (UI, notifications, shortcuts)
│   ├── Quality Thresholds Configuration
│   ├── Integration Setup (API keys, webhooks)
│   └── Export Scheduling
│
└── Help & Documentation
    ├── Getting Started Guide
    ├── Keyboard Shortcuts Reference
    ├── Video Tutorials
    └── API Documentation
```

### Navigation Hierarchy

**Primary Navigation (Sidebar):**
1. Dashboard - Home base, conversation table
2. Templates - Tier 1 management
3. Scenarios - Tier 2 management
4. Edge Cases - Tier 3 management
5. Review Queue - Approval workflows
6. Analytics - Coverage and quality insights
7. Settings - Configuration and preferences

**Secondary Navigation (Contextual):**
- Tier tabs (Templates | Scenarios | Edge Cases) - Quick tier switching
- Breadcrumbs - Hierarchical position and navigation
- View Parent / View Children - Relationship navigation
- Action menus (three-dot) - Item-specific actions

**Tertiary Navigation (In-page):**
- Table column headers (sorting)
- Filter controls (data subsetting)
- Search bar (content finding)
- Pagination (data set navigation)
- Tabs within pages (e.g., Manual Entry vs CSV Upload tabs)

### Layout Patterns

**Standard Page Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Header: Logo | Nav | User | Notifications | Actions │
├──────────┬──────────────────────────────────────────┤
│          │ Breadcrumb Trail                         │
│          ├──────────────────────────────────────────┤
│ Sidebar  │ Page Title & Subtitle                    │
│          ├──────────────────────────────────────────┤
│ Nav      │ Contextual Action Toolbar (right-aligned)│
│ Items    ├──────────────────────────────────────────┤
│          │                                           │
│          │ Main Content Area                         │
│          │ (Table, Form, Dashboard, etc.)            │
│          │                                           │
│          │                                           │
│          ├──────────────────────────────────────────┤
│          │ Pagination / Footer Actions               │
├──────────┴──────────────────────────────────────────┤
│ Status Bar: Jobs | Stats | Notifications            │
└─────────────────────────────────────────────────────┘
```

**Split View Layout (e.g., Review Interface):**
```
┌─────────────────────────────────────────────────────┐
│ Header: Logo | Nav | User | Notifications | Actions │
├─────────────────────────────────┬───────────────────┤
│ Review Navigation               │ Metadata Panel    │
│ [← Prev] 3 of 23 [Next →]      │                   │
├─────────────────────────────────┤ Quality Scores   │
│ Conversation Display (Left)     │                   │
│                                  │ Dimensions        │
│ Turn 1: User message...         │                   │
│ Turn 2: Assistant response...   │ Actions           │
│ Turn 3: User message...         │                   │
│ Turn 4: Assistant response...   │ [Approve]         │
│                                  │ [Request Rev.]    │
│                                  │ [Reject]          │
│                                  │                   │
│                                  │ Comment Field     │
│                                  │                   │
│                                  │ History           │
└─────────────────────────────────┴───────────────────┘
```

**Modal Overlay Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [Dimmed Background with Blurred Content]            │
│                                                      │
│    ┌──────────────────────────────────────────┐    │
│    │ Modal Title                         [X]  │    │
│    ├──────────────────────────────────────────┤    │
│    │                                          │    │
│    │ Modal Content Area                       │    │
│    │ (Forms, Messages, Confirmations, etc.)   │    │
│    │                                          │    │
│    ├──────────────────────────────────────────┤    │
│    │ [Cancel]                    [Primary CTA]│    │
│    └──────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Content Organization Principles

**Chunking & Grouping:**
- Related fields grouped in form sections with section headings
- Table data organized with logical column order (ID, Name, Status, Date, Actions)
- Dashboard metrics grouped by category (generation stats, quality stats, coverage stats)

**Progressive Disclosure:**
- Advanced options collapsed by default, expandable on demand
- Detailed metadata hidden behind hover tooltips or expandable panels
- Complexity increases with user expertise (onboarding hides advanced features)

**Consistency:**
- Action buttons always right-aligned in forms (Cancel left, Primary CTA rightmost)
- Destructive actions always require confirmation (never immediate delete)
- Status indicators always use same colors (green=success, red=error, yellow=warning, blue=info)
- Navigation patterns consistent across all pages (breadcrumbs always in same place)

**Scannability:**
- Clear headings establish page structure
- White space separates distinct sections
- Important information emphasized with bold, color, or size
- Tables use alternating row colors or subtle borders for easy row scanning
- F-pattern layout: Important information top and left

## Page Plan

This comprehensive module requires the following screens/wireframes for complete coverage:

### Core Infrastructure Pages (E03)
1. **Main Dashboard** - Central hub with conversation table, filters, search, bulk actions
   - States: Empty (no conversations), Populated (with data), Filtered
2. **Loading State Examples** - Various skeleton screens and progress indicators
3. **Error State Examples** - Toast notifications, inline errors, page-level errors
4. **Confirmation Dialog Examples** - Delete confirmation, bulk action confirmation

### Generation Feature Pages (E04)
5. **Single Conversation Generation Form** - Parameter input interface
6. **Generation Progress Modal** - Loading, success, error states
7. **Batch Generation Setup** - CSV upload, manual entry, template-based, clone tabs
8. **Batch Processing Queue Dashboard** - Real-time queue monitoring
9. **Batch Completion Summary** - Results and statistics

### Data Organization Pages (E05)
10. **Conversation Table (Detailed View)** - Full table with all controls, filters, search
11. **Filter Builder Interface** - Advanced filter construction modal
12. **Coverage Analytics Dashboard** - Metrics cards, heatmap, quality charts, gap analysis
13. **Export Configuration Modal** - Format selection, options, preview, history

### Review & Approval Pages (E06)
14. **Review Queue Table** - List of conversations awaiting review
15. **Conversation Preview/Review Split View** - Full-page review interface with metadata
16. **Bulk Approval Interface** - Multi-select approval flow
17. **Approval Action States** - Approve, Request Revisions, Reject modals/flows

### Three-Tier Architecture Pages (E07)
18. **Template Library Grid View** - Template cards with filters and sorting
19. **Template Editor** - Form for creating/editing templates
20. **Scenario Management Table** - Scenarios with parent template grouping
21. **Scenario Builder Form** - Parameter configuration and variation generation
22. **Edge Case Collection Grid** - Edge cases with category filters
23. **Edge Case Generator Modal** - Auto-generation configuration
24. **Edge Case Testing Interface** - Test execution and results display
25. **Tier Relationship Visualization** - Breadcrumbs, tree view, relationship diagram

### Supporting Pages
26. **Settings Page** - User preferences, quality thresholds, integrations
27. **Empty States Collection** - Various empty states (no templates, no scenarios, etc.)
28. **Help/Documentation Overlay** - Keyboard shortcuts reference, getting started guide

### Estimated Total Page Count
**28 distinct wireframe pages/screens** covering all states, flows, and feature areas from E03-E07.

Each page should include:
- Desktop layout (primary)
- Tablet layout (if significantly different)
- Mobile layout (if functionality is supported)
- Key interactive states (hover, focus, active, disabled)
- Data states (empty, loading, error, populated)

## Annotations (Mandatory)

For each wireframe page, attach notes citing:
1. **Acceptance Criterion Fulfilled** - Which AC from which FR this element satisfies
2. **Source Section** - E03, E04, E05, E06, or E07
3. **User Persona** - Primary persona using this feature (Business Owner, Domain Expert, Data Manager)
4. **Priority** - Must-have (MVP), Should-have (Phase 2), Nice-to-have (Future)

**Mapping Table Format** (include as separate frame in Figma):
```
┌──────────────────┬────────┬──────────────┬────────────────┬──────────┬──────────┐
│ Acceptance       │ Source │ Screen/Page  │ Component(s)   │ State(s) │ Priority │
│ Criterion        │ (E##)  │              │                │          │          │
├──────────────────┼────────┼──────────────┼────────────────┼──────────┼──────────┤
│ Dashboard shows  │ E03    │ Main         │ Header         │ Display  │ Must-    │
│ header with      │ (FR3.1)│ Dashboard    │ Component      │          │ have     │
│ navigation       │        │              │                │          │          │
├──────────────────┼────────┼──────────────┼────────────────┼──────────┼──────────┤
│ Table displays   │ E05    │ Main         │ Conversation   │ Display  │ Must-    │
│ conversations    │ (FR5.1)│ Dashboard    │ Table          │          │ have     │
│ with metadata    │        │              │                │          │          │
├──────────────────┼────────┼──────────────┼────────────────┼──────────┼──────────┤
│ Generate button  │ E04    │ Single Gen   │ Form Submit    │ Interact │ Must-    │
│ triggers         │ (FR4.1)│ Form         │ Button         │ ive      │ have     │
│ conversation     │        │              │                │          │          │
├──────────────────┼────────┼──────────────┼────────────────┼──────────┼──────────┤
│ Review shows     │ E06    │ Conversation │ Quality        │ Display  │ Must-    │
│ quality metrics  │ (FR6.2)│ Preview      │ Metrics Panel  │          │ have     │
├──────────────────┼────────┼──────────────┼────────────────┼──────────┼──────────┤
│ Tier navigation  │ E07    │ All Tier     │ Tab Bar        │ Interact │ Must-    │
│ via tabs         │ (FR7.4)│ Pages        │                │ ive      │ have     │
├──────────────────┼────────┼──────────────┼────────────────┼──────────┼──────────┤
│ ...continue for all acceptance criteria...                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Acceptance Criteria → UI Component Mapping (Consolidated)

### E03 - Core UI Components & Layouts

**FR3.1: Dashboard Layout**
- Dashboard displays header with navigation → Main Dashboard → Header Component → Display → Must-have
- Sidebar shows navigation items with icons → Main Dashboard → Sidebar Nav → Display → Must-have
- Main content area adjusts to selected view → All Pages → Main Content → Dynamic → Must-have
- Layout is responsive → All Pages → Layout Grid → Responsive → Must-have
- Empty states provide guidance and CTAs → Dashboard Empty State → Empty State Component → Display → Must-have

**FR3.2: Loading States**
- Async operations show loading indicators → All Pages → Loading Spinners → Active → Must-have
- Skeleton screens during data loading → Dashboard Table → Skeleton Rows → Loading → Must-have
- Progress bars for long operations → Batch Queue Dashboard → Progress Bars → Active → Must-have
- Loading states can be cancelled → Batch Queue → Cancel Button → Interactive → Should-have

**FR3.3: Error Handling**
- Errors display as toast notifications → All Pages → Toast Component → Error State → Must-have
- Error messages are actionable → Error Toast → Message Text + Action → Display → Must-have
- Network errors prompt reconnection → All Pages → Network Error Banner → Error State → Must-have
- Form validation errors inline → All Forms → Field Error Messages → Error State → Must-have

**FR3.4: Confirmation Dialogs**
- Destructive actions require confirmation → Delete Actions → Confirmation Modal → Interactive → Must-have
- Dialogs clearly state consequences → Confirmation Modal → Body Text → Display → Must-have
- Users can cancel or proceed → Confirmation Modal → Button Group → Interactive → Must-have
- Optional "don't ask again" checkbox → Confirmation Modal → Checkbox → Interactive → Should-have

**FR3.5: Keyboard Navigation**
- All elements keyboard accessible → All Pages → All Interactive Elements → Interactive → Must-have
- Shortcuts documented and consistent → Help Overlay → Shortcut Reference → Display → Should-have
- Tab order follows logical flow → All Pages → Focus Order → Interactive → Must-have
- Focus indicators clearly visible → All Pages → Focus Rings → Active → Must-have

### E04 - Generation Features

**FR4.1: Single Conversation Generation**
- Form displays all parameters → Single Gen Form → Form Fields → Display → Must-have
- Parameter validation before generation → Single Gen Form → Validation Logic → Interactive → Must-have
- Generate button triggers creation → Single Gen Form → Generate Button → Interactive → Must-have
- Progress modal during generation → Generation Progress Modal → Modal Component → Active → Must-have
- Success state shows preview → Success Modal → Preview Snippet → Display → Must-have
- Generated conversation in table → Main Dashboard → Table Row (new) → Display → Must-have

**FR4.2: Batch Generation**
- Batch interface accepts multiple specs → Batch Setup → Input Tabs → Interactive → Must-have
- CSV upload or manual entry → Batch Setup → CSV Upload / Manual Table → Interactive → Must-have
- Processing queue displays all items → Batch Queue Dashboard → Queue Table → Display → Must-have
- Individual progress indicators → Batch Queue Dashboard → Progress Bars per Row → Active → Must-have
- Overall batch progress bar → Batch Queue Dashboard → Overall Progress Bar → Active → Must-have
- Pause, resume, cancel controls → Batch Queue Dashboard → Control Buttons → Interactive → Must-have
- Completion summary with counts → Batch Completion → Summary Card → Display → Must-have

**FR4.3: Progress Monitoring**
- Real-time status updates → Batch Queue → Table Updates → Dynamic → Must-have
- Estimated time remaining displayed → Batch Queue / Progress Modal → Time Display → Display → Must-have
- Completed conversations accessible → Batch Queue / Dashboard Table → Linked Rows → Interactive → Must-have
- Failed generations show errors with retry → Batch Queue → Error Tooltips + Retry Button → Error State → Must-have

### E05 - Dashboard & Data Organization

**FR5.1: Conversation Table**
- Table displays conversations with metadata → Main Dashboard → Conversation Table → Display → Must-have
- Columns sortable → Dashboard Table → Column Headers (sortable) → Interactive → Must-have
- Column visibility toggleable → Dashboard Table → Column Visibility Dropdown → Interactive → Should-have
- Table density adjustable → Dashboard Table → Density Toggle → Interactive → Nice-to-have
- Pagination controls → Dashboard Table → Pagination Component → Interactive → Must-have

**FR5.2: Filtering & Search**
- Filter by tier, status, date, quality → Dashboard Table → Filter Controls → Interactive → Must-have
- Filters combinable → Advanced Filter Builder → Filter Conditions → Interactive → Must-have
- Active filters displayed with remove → Dashboard Table → Filter Chips → Display + Interactive → Must-have
- Search bar for full-text search → Dashboard Table → Search Bar → Interactive → Must-have
- Real-time search results → Dashboard Table → Table Rows → Dynamic → Must-have
- Filter presets saved and recalled → Dashboard Table → Filter Preset Dropdown → Interactive → Should-have

**FR5.3: Bulk Actions**
- Row selection checkboxes → Dashboard Table → Checkbox Column → Interactive → Must-have
- Select all/none controls → Dashboard Table → Header Checkbox + Buttons → Interactive → Must-have
- Selected count displays → Bulk Actions Toolbar → Count Display → Display → Must-have
- Bulk actions menu → Bulk Actions Toolbar → Actions Dropdown → Interactive → Must-have
- Confirmation before executing → Bulk Confirmation Modal → Modal Component → Interactive → Must-have
- Bulk operation progress → Batch Queue Dashboard → Progress Indicators → Active → Should-have

**FR5.4: Coverage Analysis**
- Coverage dashboard with metrics → Analytics Page → Metrics Cards → Display → Must-have
- Visualizations show topic distribution → Analytics Page → Heatmap / Bubble Chart → Display → Must-have
- Quality charts display scores → Analytics Page → Quality Charts → Display → Must-have
- Gap analysis highlights underrepresented → Analytics Page → Gap Analysis Panel → Display → Must-have
- Clicking visualization filters table → Analytics Page → Chart Elements → Interactive → Should-have

**FR5.5: Export Functionality**
- Export button opens config modal → Dashboard Table → Export Button → Interactive → Must-have
- Multiple formats available → Export Modal → Format Selection → Interactive → Must-have
- Export options customize data → Export Modal → Option Checkboxes → Interactive → Must-have
- Export preview shows sample → Export Modal → Preview Panel → Display → Should-have
- Export generates downloadable file → Export Modal → Download Button → Interactive → Must-have
- Export history tracks previous → Export Modal → History Table → Display → Should-have

### E06 - Review & Approval System

**FR6.1: Conversation Preview**
- Preview displays full conversation → Conversation Preview → Conversation Display → Display → Must-have
- Metadata section shows details → Conversation Preview → Metadata Panel → Display → Must-have
- Turns clearly labeled → Conversation Preview → Turn Labels → Display → Must-have
- Formatting properly rendered → Conversation Preview → Formatted Content → Display → Must-have
- Copy functionality available → Conversation Preview → Copy Buttons → Interactive → Should-have

**FR6.2: Quality Assessment**
- Quality scores display overall & dimensional → Conversation Preview → Quality Metrics Panel → Display → Must-have
- Visual indicators show quality levels → Conversation Preview → Gauges / Bars / Stars → Display → Must-have
- AI confidence scores appear → Conversation Preview → Confidence Badge → Display → Must-have
- Low-quality indicators trigger alerts → Conversation Preview → Warning Badges → Display → Should-have

**FR6.3: Approval Workflow**
- Approve button marks as approved → Conversation Preview → Approve Button → Interactive → Must-have
- Request Revisions allows feedback → Conversation Preview → Request Revisions Button + Form → Interactive → Must-have
- Reject button with reason → Conversation Preview → Reject Button + Reason Checkboxes → Interactive → Must-have
- Comment field for detailed feedback → Conversation Preview → Comment Text Area → Interactive → Must-have
- Status updates in dashboard immediately → Dashboard Table → Status Badge (updated) → Dynamic → Must-have
- Actions logged for audit → Backend (non-UI) → Audit Log → Data → Must-have

**FR6.4: Review Queue Management**
- Review queue displays conversations → Review Queue Page → Queue Table → Display → Must-have
- Queue position indicator → Conversation Preview → Position Display → Display → Must-have
- Previous/Next navigation → Conversation Preview → Nav Buttons → Interactive → Must-have
- Skip option → Conversation Preview → Skip Button → Interactive → Should-have
- Keyboard shortcuts for rapid review → Conversation Preview → Keyboard Handlers → Interactive → Should-have

### E07 - Three-Tier Architecture

**FR7.1: Template Tier**
- Template library displays all templates → Template Library → Template Cards / Table → Display → Must-have
- Cards show name, description, usage, rating → Template Card → Card Content → Display → Must-have
- New Template button opens editor → Template Library → New Template Button → Interactive → Must-have
- Editor provides template component fields → Template Editor → Form Sections → Interactive → Must-have
- Templates can be saved, duplicated, deleted → Template Editor / Card Actions → Action Buttons → Interactive → Must-have
- Usage metrics track usage → Template Card → Usage Count Badge → Display → Should-have

**FR7.2: Scenario Tier**
- Scenario builder selects parent template → Scenario Builder → Template Selector → Interactive → Must-have
- Parameter configuration interface → Scenario Builder → Parameter Fields → Interactive → Must-have
- Variation generation controls → Scenario Builder → Variation Settings → Interactive → Must-have
- Generated scenarios in table → Scenario Management → Table Rows → Display → Must-have
- Scenarios display parent relationship → Scenario Table → Parent Link → Display → Must-have
- Bulk scenario operations available → Scenario Table → Bulk Actions Toolbar → Interactive → Must-have

**FR7.3: Edge Case Tier**
- Edge case collection displays all → Edge Case Collection → Card Grid / Table → Display → Must-have
- Type selector categorizes edge cases → Edge Case Collection → Category Filter → Interactive → Must-have
- Auto-generation creates from scenarios → Edge Case Generator Modal → Generate Button → Interactive → Must-have
- Edge cases show parent references → Edge Case Card → Parent Link → Display → Must-have
- Testing interface validates behavior → Edge Case Detail → Test Panel → Interactive → Should-have

**FR7.4: Tier Navigation**
- Breadcrumb shows position → All Pages → Breadcrumb Trail → Display → Must-have
- Tier switcher tabs enable quick changes → All Pages → Tab Bar → Interactive → Must-have
- Tree view displays parent-child → Sidebar → Relationship Tree → Display → Should-have
- View Parent/Children links → Detail Views → Navigation Links → Interactive → Must-have
- Relationship diagram visualizes hierarchy → Relationship Diagram Modal → Visual Diagram → Display → Nice-to-have

## Non-UI Acceptance Criteria (Backend/Logic)

These criteria require backend/system implementation but have UI touchpoints:

### Generation & Processing (E04)
- Conversation generation algorithm (AI model integration)
- Quality scoring engine (calculates scores displayed in UI)
- Batch processing queue management (manages queue displayed in UI)
- Concurrency control for parallel processing (affects UI progress display)
- Template parameter substitution logic (renders in scenario preview)

### Data Management (E05)
- Search indexing and full-text search (powers search bar results)
- Filter query construction and execution (powers filter controls)
- Export format generation and file creation (triggered by export button)
- Coverage calculation algorithms (powers analytics charts)
- Gap analysis identification logic (populates gap analysis panel)

### Review & Approval (E06)
- Quality scoring per conversation (displayed in quality panel)
- Approval workflow state machine (manages status transitions)
- Audit logging for actions (backend tracking, affects history display)
- Review queue prioritization algorithm (orders queue table)

### Architecture & Templates (E07)
- Template inheritance and parameter resolution (affects scenario generation)
- Variation generation algorithm (creates scenario variations)
- Edge case generation logic (auto-generates edge cases)
- Relationship graph data structure (powers hierarchy visualization)

### Infrastructure (E03)
- User authentication and session management (affects header user display)
- Role-based access control (affects which UI elements are shown)
- Real-time update mechanism (affects live table updates)
- Notification delivery system (triggers UI toast notifications)

### Performance & Optimization
- Database query optimization (affects table loading speed)
- Caching strategies (affects page load performance)
- API rate limiting (may trigger UI error messages)
- Pagination backend logic (powers pagination UI component)

## Design System & Visual Specifications

### Color Palette
- **Primary (Actions):** #2563EB (blue)
- **Success:** #10B981 (green)
- **Warning:** #F59E0B (yellow/orange)
- **Error/Danger:** #EF4444 (red)
- **Info:** #3B82F6 (light blue)
- **Neutral Grays:** #F9FAFB (lightest) to #111827 (darkest)
- **Backgrounds:** White (#FFFFFF), Light gray (#F9FAFB), Dark overlay (#00000080)

### Typography
- **Font Family:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif
- **Monospace:** "Fira Code", Consolas, Monaco, "Courier New", monospace
- **Headings:**
  * H1: 32px, 700 weight
  * H2: 24px, 600 weight
  * H3: 20px, 600 weight
  * H4: 18px, 600 weight
- **Body:** 16px, 400 weight
- **Small:** 14px, 400 weight
- **Caption:** 12px, 400 weight
- **Line Height:** 1.5× for body, 1.2× for headings

### Spacing Scale
- Base: 4px (0.25rem)
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Border Radius
- Small (inputs, pills): 6px
- Medium (buttons, cards): 8px
- Large (modals, panels): 12px
- Full (badges, avatars): 9999px

### Shadows
- Small: 0 1px 2px rgba(0,0,0,0.05)
- Medium: 0 4px 6px rgba(0,0,0,0.1)
- Large: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)

### Icon Library
- Use: Heroicons, Lucide Icons, or Feather Icons (consistency across all icons)
- Size: 20px standard, 24px large, 16px small

## Success Metrics for UI

The UI successfully meets requirements if:

1. **First-Time User Success:**
   - 90%+ of users generate first conversation within 3 minutes
   - Zero critical errors during onboarding flow
   - Help/documentation accessed by <30% (indicates intuitive design)

2. **Generation Efficiency:**
   - Single conversation generation: <5 clicks from dashboard
   - Batch setup for 50 conversations: <10 minutes setup time
   - Processing queue clearly understood by 95%+ users (survey)

3. **Review Workflow Speed:**
   - Average review time per conversation: <45 seconds
   - Keyboard shortcut usage: 60%+ of power users
   - Review queue cleared daily by 80%+ users

4. **Data Organization Effectiveness:**
   - Users find specific conversation in <15 seconds (search/filter)
   - Advanced filtering used by 40%+ users
   - Export completion success rate: 98%+

5. **Architecture Comprehension:**
   - Users understand 3-tier hierarchy after 5 minutes exploration
   - Template reuse rate: 70%+ of scenarios use templates
   - Navigation errors (getting lost): <5% of sessions

6. **Overall Satisfaction:**
   - System Usability Scale (SUS) score: >75 (excellent)
   - Net Promoter Score (NPS): >40
   - Task completion rate: 95%+ for primary workflows
   - Support tickets related to UI confusion: <5% of total tickets

7. **Performance Benchmarks:**
   - Table load time (1000 rows): <2 seconds
   - Search results appear: <500ms
   - Page transitions: <300ms
   - No UI jank or freezing during normal operations

=== END PROMPT TRAIN: E03-E07-CONSOLIDATED ===
