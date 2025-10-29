=== BEGIN PROMPT FR: FR6.1.0 ===

Title
- FR FR6.1.0 Wireframes — Stage 6 — Quality Assurance and Validation

Context Summary
- Visual Quality Assessment enables non-technical reviewers to validate training data quality quickly and confidently. The interface provides side-by-side comparison, explainable quality scoring with drill-downs, efficient sampling tools, trend and benchmark views, and integrated feedback/annotations for continuous improvement. Prioritize clarity, accessibility, and comprehensive states (loading, empty, error, success) across all screens. Real-time monitoring surfaces in-progress assessments without blocking core review flows.

Wireframe Goals
- Provide a clear split-view comparison with synchronized navigation and concept/diff highlighting
- Present quality scores with explanations and actionable recommendations (drill-down)
- Enable efficient sampling (random, stratified, targeted) and review queues
- Visualize trends, heatmaps, and benchmark comparisons to understand quality over time
- Support annotations, feedback capture, exports, and real-time status indicators

Explicit UI Requirements (from acceptance criteria)
- Side-by-side comparison
  - Components: Left panel (Source), Right panel (Generated), Sync Scroll toggle, Mode toggle (Unified Diff / Split / Overlay), Legend for color coding
  - States: Loading skeletons, No selection/Empty, Comparing, Error (fetch/render), Highlight toggles on/off
- Difference and concept highlighting
  - Components: Diff highlighter (Preserved=green, Modified=yellow, New=blue), Concept highlighter (entities, relationships) with filter chips and legend
  - States: Disabled (no analysis yet), Active, Hover/focus emphasis, Dense content overflow handling
- Quality score visualization with explanations
  - Components: KPI score cards, Overall score radial chart, Breakdown bar/stacked chart, “View Details” drill-down panel/modal with Examples and Recommendations
  - States: Loading, Ready, Drill-down open, Error, Empty (no metrics yet)
- Explainable metrics
  - Components: Factors table (Weight, Contribution, Evidence), Example snippets, “Why this score?” expandable sections
  - States: Collapsed/Expanded, Copy-to-clipboard, Print-friendly view
- Sampling tools for efficient manual review
  - Components: Method selector (Random / Stratified / Targeted), Criteria builder (dimensions, ranges), Run Sample CTA, Results table, Save as Review Queue
  - States: Configuring (disabled Run), In-progress (spinner/progress), Results (sortable/paginable), Error, Empty (no matches)
- Quality trend visualization
  - Components: Time range selector, Line/area trend chart, Baseline overlay, Anomaly markers
  - States: Loading, Rendered, Updating (skeleton), Error, Empty (insufficient history)
- Interactive filtering
  - Components: Global filter bar (Dimensions, Content Types, Score Ranges), Saved filter presets, Clear-all
  - States: Filters applied (chips), No filters, Invalid criteria error
- Annotation and feedback
  - Components: Annotation toolbar (comment, issue, suggestion), Pin markers in panels, Threaded comments with resolve state, Feedback rating control
  - States: Viewing, Editing, Saving, Resolved, Error, Permission-restricted (disabled)
- Comparison modes
  - Components: Mode toggle group (Unified / Split / Overlay), Transition animation, Secondary controls (diff granularity)
  - States: Mode switching, Persist last choice per user
- Quality heatmaps
  - Components: Matrix heatmap (by content section × metric), Zoom/pan, Tooltip with value/explanation
  - States: Loading, Rendered, Filtering, Error
- Export capabilities
  - Components: Export dialog (PDF / CSV-Excel / JSON options), Section selectors (Scores, Trends, Heatmap, Annotations), Generate & Download with progress bar
  - States: Configuring, Generating (progress), Ready, Error, Success toast
- Benchmark comparison
  - Components: Benchmark selector (Industry / Historical), Delta chip (+/−%), Threshold indicators
  - States: No benchmark configured, Benchmark applied, Warning (below threshold)
- Real-time monitoring
  - Components: Live status banner (In-progress/Idle), Activity feed (recent analyses), Auto-refresh toggle
  - States: Live updating, Paused, Error reconnect

Interactions and Flows
- Overview → Compare: From dashboard cards or “Compare Content” CTA, open split-view with current filters applied
- Compare → Drill-down: Click score widget to open “Score Details” overlay with factor explanations and examples
- Compare → Annotate: Select text range or segment; add comment/issue; see pins and resolve threads
- Overview/Sampling → Run Sample → Review Queue: Configure method, run sample, view results, open items in Compare, bulk mark reviewed
- Overview/Trends → Export: Open Export dialog, choose formats/sections, generate and download; success/error toasts
- Trends → Benchmarks: Toggle benchmark overlay; see deltas and threshold warnings
- Global: Filters persist across screens; navigation via left rail; modals trap focus; ESC closes overlays

Visual Feedback
- Status chips for score health (Good/Warning/Poor), deltas vs baseline, and benchmark status
- Progress indicators for long operations (sampling, export, analysis refresh)
- Skeleton loaders for charts/tables; empty-state illustrations with next-step guidance
- Toasts for success, non-blocking warnings, and recoverable errors; inline error banners for blocking issues

Accessibility Guidance
- Keyboard support for navigation, toggles, tabs, drill-downs; visible focus rings
- ARIA labels/roles for charts (summaries), annotations (describedby), and mode toggles
- High color contrast (≥ 4.5:1); do not rely on color alone—use patterns/icons/labels in legends
- Modal focus trap; restore focus on close; announce live updates politely (aria-live="polite")

Information Architecture
- Left navigation: Overview, Compare, Sampling, Trends, Reports
- Top bar: Project selector, Global filters, Export, Real-time status
- Primary content regions per screen with consistent headers, action bars, and chart/panel layout grids
- Right-side contextual drawer for drill-down details and annotations when opened

Page Plan
- Quality Assessment Overview: Landing dashboard with scores, breakdown, quick filters, recent activity, benchmark chip
- Content Comparison (Split View): Side-by-side panels with diff/concept highlighting, mode toggle, annotation tools
- Score Details & Explanations: Dedicated screen/overlay for factor breakdowns, examples, and recommendations
- Sampling & Review Queue: Configure sampling, run, see results list, open items, bulk actions
- Trends & Benchmarks: Time-series charts, heatmap, benchmark overlays, anomaly markers
- Reports & Export: Configure report sections/formats and generate downloadable outputs

Annotations (Mandatory)
- Attach notes on key elements citing the acceptance criterion they fulfill and include a “Mapping Table” frame in Figma: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
- Side-by-side comparison of source and generated content (US4.2.1)
  - Screens: Content Comparison
  - Components: Source/Generated panels, Sync Scroll, Mode toggle
  - States: Loading, Comparing, Error
- Visual highlighting of key concepts and relationships (US4.2.1)
  - Screens: Content Comparison
  - Components: Concept highlighter with legend and filters
  - States: Active/Disabled, Hover tooltips
- Quality score visualization with explanations (US4.2.1)
  - Screens: Overview, Score Details
  - Components: KPI cards, Breakdown chart, Details overlay
  - States: Loading, Ready, Drill-down open, Error
- Sampling tools for efficient manual review (US4.2.1)
  - Screens: Sampling & Review Queue
  - Components: Method selector, Criteria builder, Results table
  - States: Configuring, In-progress, Results, Error, Empty
- Feedback integration for quality improvement (US4.2.1)
  - Screens: Content Comparison, Sampling & Review Queue
  - Components: Annotation toolbar, Comment threads, Feedback rating
  - States: Editing, Saving, Resolved, Error
- Side-by-side interface with synchronized navigation and highlighting (FR6.1.0)
  - Screens: Content Comparison
  - Components: Sync Scroll, Linked selection/highlight
  - States: Sync on/off, Error
- Difference highlighting with color coding and annotations (FR6.1.0)
  - Screens: Content Comparison
  - Components: Diff highlighter, Legend, Annotation pins
  - States: Preserved/Modified/New styles, Selection focus
- Concept highlighting identifies key ideas/entities/relationships (FR6.1.0)
  - Screens: Content Comparison
  - Components: Concept chips, Tooltip details
  - States: Filtered, Dense-content handling
- Visual quality score presentation and detailed breakdowns (FR6.1.0)
  - Screens: Overview, Score Details
  - Components: Charts, Tables, Explanations
  - States: Loading, Ready, Error
- Explainable metrics with examples and recommendations (FR6.1.0)
  - Screens: Score Details
  - Components: Factors table, Example snippets, Recommendation list
  - States: Expanded/Collapsed, Copyable
- Sampling tools: random/stratified/targeted (FR6.1.0)
  - Screens: Sampling & Review Queue
  - Components: Method selector, Criteria builder, Run Sample
  - States: Configuring, Running, Results, Error
- Quality trend visualization over time with statistics (FR6.1.0)
  - Screens: Trends & Benchmarks
  - Components: Trend chart, Time-range controls, Anomaly markers
  - States: Loading, Updating, Error
- Interactive filtering by dimension/type/score (FR6.1.0)
  - Screens: All (global)
  - Components: Filter bar, Chips, Presets
  - States: Applied, Cleared, Invalid
- Annotation tools for issues/comments/suggestions (FR6.1.0)
  - Screens: Content Comparison
  - Components: Annotation toolbar, Threads, Resolve control
  - States: Viewing, Editing, Saving, Resolved
- Feedback integration captures assessments (FR6.1.0)
  - Screens: Content Comparison, Overview
  - Components: Feedback rating, Comment forms
  - States: Submitted, Error
- Comparison modes: unified/split/overlay (FR6.1.0)
  - Screens: Content Comparison
  - Components: Mode toggle, Transition
  - States: Switching, Persisted
- Quality heatmaps across sections/parameters (FR6.1.0)
  - Screens: Trends & Benchmarks
  - Components: Heatmap matrix, Zoom/pan
  - States: Loading, Rendered, Filtering
- Export capabilities for reports with visualizations and analysis (FR6.1.0)
  - Screens: Reports & Export (dialog), Overview (entry)
  - Components: Format selector, Section toggles, Generate
  - States: Configuring, Generating, Ready, Error, Success
- Benchmark comparison against standards/baselines (FR6.1.0)
  - Screens: Trends & Benchmarks, Overview (chip)
  - Components: Benchmark selector, Delta chips, Threshold lines
  - States: Not set, Applied, Warning
- Real-time quality monitoring immediate feedback (FR6.1.0)
  - Screens: Overview (banner), Activity feed
  - Components: Live status, Auto-refresh toggle
  - States: Live, Paused, Error reconnect

Non-UI Acceptance Criteria
- Algorithmic feedback integration into quality improvement models
  - Impact: Requires backend learning pipeline; UI captures feedback and displays improved results over time
- Statistical significance in trend analysis
  - Impact: Backend computation; UI shows confidence markers/tooltips
- Benchmark dataset management and baseline calculation
  - Impact: Data management feature; UI presents selected benchmark and deltas
- Real-time monitoring data stream
  - Impact: Event pipeline; UI subscribes to and presents live status and recent activity

Estimated Page Count
- 6 screens (Overview, Compare, Score Details, Sampling, Trends/Benchmarks, Reports/Export) to fulfill all UI-relevant criteria while keeping flows clear and scoped; export handled as a dedicated screen/dialog due to complexity.

=== END PROMPT FR: FR6.1.0 ===
