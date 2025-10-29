=== BEGIN PROMPT FR: FR5.1.0 ===

Title
- FR FR5.1.0 Wireframes — Stage 5 — User Experience and Interface

Context Summary
- Design a guided, step-by-step workflow that enables non-technical users to create LoRA training datasets with confidence.
- The interface must surface progress, milestones, contextual help, validation, and error remediation while allowing save/resume and undo/redo.
- Optimize for accessibility, responsiveness, and clarity to minimize abandonment and ensure users complete multi-stage flows.

Wireframe Goals
- Provide a visual wizard across workflow stages with clear instructions and smart defaults.
- Show granular progress: percent complete, current stage, ETA, and milestone checkpoints.
- Offer context-sensitive help (inline tips, help drawer, examples) at every step.
- Prevent misconfiguration via intelligent validation; show actionable error messages.
- Support save/resume and undo/redo to reduce anxiety and allow safe exploration.

Explicit UI Requirements (from acceptance criteria)
- Step-by-step wizard with: step header, breadcrumb/stepper, next/back, save draft, restart.
- Progress indicators: percent complete, current stage chip, ETA, progress bar; milestone timeline with “Completed/Current/Upcoming”.
- Context-sensitive help: inline info icons, expandable help drawer with examples and best practices per step.
- Validation UX: disabled Next until required inputs valid; inline field errors; pre-submit summary; blocking modals for critical issues.
- Error handling: error banner with remediation steps; link to help; retry action; copy error details.
- Save and resume: persistent drafts; “Resume where you left off” banner on landing; autosave indicator.
- State persistence: restore wizard state after browser/device change; draft badge on project card.
- Smart defaults: prefilled fields based on content type/user prefs; “Reset to defaults”.
- Undo/redo: floating toolbar or keyboard hints; per-step history chips.
- Workflow templates: “Start from template” dialog; template descriptions and use cases.
- Accessibility: full keyboard navigation, focus order, visible focus, ARIA labels for steps, errors, and progress; text alternatives for icons.
- Mobile responsiveness: stacked layouts, sticky progress bar, bottom action bar.
- Analytics (UI surface): privacy notice and toggle for UX analytics; non-blocking.
- Quick restart: “Modify parameters and regenerate” CTA on completion and step summaries.

Interactions and Flows
- New Project → Choose Template or Blank → Wizard Step 1 … Step N → Review & Validate → Complete.
- Resume Flow: Landing shows “Resume Draft” with last step; click to continue.
- Validation Flow: Attempt Next with invalid inputs shows inline errors and disabled Next until resolved.
- Error Flow: On processing failure, show banner with retry and “Open Help”.
- Help Flow: Open contextual help drawer; deep links to examples; does not navigate away.
- Undo/Redo Flow: Tap undo/redo to revert/apply the last change on the current step.

Visual Feedback
- Global progress bar with ETA; per-milestone status chips.
- Inline validation states: default, focus, error, success.
- System toasts: saved, resumed, settings applied, restart complete.
- Loading spinners/skeletons for long operations; empty states with guidance.

Accessibility Guidance
- Provide labels and instructions programmatically associated with inputs.
- Announce step changes and validation errors via ARIA live regions.

---

# E05 Analysis: Figma Integration Strategy for BMO Wireframe Prompts

## Executive Summary

After analyzing the Stage 4 wireframe prompts (FR4.1.1-4.1.3) and examining the existing wireframe implementations, **Figma MAKE files will be highly beneficial rather than conflicting** with NextAdmin + shadcn/ui development. The key is strategic integration rather than direct translation.

## Current Wireframe Implementation Analysis

### What We Have Now
The existing wireframes (FR-4.1-Bright-Run) demonstrate:
- **React + TypeScript** foundation with Supabase integration
- **Component-based architecture** with clear separation of concerns
- **Tailwind CSS** styling (compatible with both NextAdmin and shadcn/ui)
- **Modern UI patterns** including multi-step workflows, real-time validation, and progressive disclosure
- **Complex state management** for content adaptation workflows

### Implementation Quality Assessment
```typescript
// Example from StyleToneConfigurator.tsx
const STYLE_OPTIONS = [
  { id: 'formal', label: 'Formal', description: 'Professional and structured language' },
  { id: 'casual', label: 'Casual', description: 'Relaxed and conversational tone' },
  // ... sophisticated option handling
]
```

The wireframes show **production-ready component patterns** that align well with modern React development practices.

## Figma MAKE Integration Strategy

### 1. **Complementary Rather Than Conflicting**

**Figma MAKE files will ENHANCE development by:**
- **Visual Reference**: Providing pixel-perfect design specifications
- **Component Mapping**: Showing exact spacing, typography, and color schemes
- **Interaction Patterns**: Demonstrating micro-interactions and state transitions
- **Design System Validation**: Ensuring consistency across all Stage 4 features

**They will NOT conflict because:**
- NextAdmin + shadcn/ui provides the **functional foundation**
- Figma provides the **visual specification**
- Both use Tailwind CSS as the common styling language

### 2. **Strategic Implementation Workflow**

#### Phase 1: Design System Extraction (Week 1)
```bash
# Extract design tokens from Figma
- Colors, typography, spacing from Figma MAKE files
- Map to Tailwind config for NextAdmin + shadcn/ui
- Create shared design token library
```

#### Phase 2: Component Specification (Week 2)
```bash
# Use Figma as component specification
- Rich text editor layouts → NextAdmin editor + custom styling
- Multi-dimensional tagging UI → shadcn/ui Command + custom logic
- Analytics dashboards → NextAdmin charts + Figma styling
```

#### Phase 3: Interaction Refinement (Week 3)
```bash
# Implement Figma interaction patterns
- Micro-animations from Figma → Framer Motion integration
- State transitions → React state + Figma timing specifications
- Progressive disclosure → Figma flow + React component logic
```

### 3. **Specific Integration Points**

#### FR4.1.1 - Question Generation Interface
**Figma MAKE Value:**
- **Parameter Control Layout**: Exact positioning of difficulty sliders, cognitive type selectors
- **Question Card Design**: Typography hierarchy, spacing, quality indicator styling
- **Progress Visualization**: Animation timing, color transitions, completion states

**Implementation Approach:**
```typescript
// Use Figma specs for NextAdmin form layouts
<FormField>
  <Label className="figma-label-specs">Difficulty Level</Label>
  <Slider className="figma-slider-styling" />
</FormField>
```

#### FR4.1.2 - Answer Customization System
**Figma MAKE Value:**
- **Side-by-Side Layout**: Exact column widths, synchronization indicators
- **Diff Visualization**: Color coding specifications, annotation positioning
- **Rich Text Editor**: Toolbar layout, formatting button states

**Implementation Approach:**
```typescript
// Combine NextAdmin editor with Figma styling
<RichTextEditor 
  className="figma-editor-layout"
  toolbar={figmaToolbarConfig}
  diffHighlight={figmaDiffColors}
/>
```

#### FR4.1.3 - Metadata & Categorization
**Figma MAKE Value:**
- **Multi-Dimensional Tagging**: Tag chip design, color coding system
- **Hierarchical Display**: Tree structure styling, expansion animations
- **Analytics Dashboard**: Chart styling, metric card layouts

**Implementation Approach:**
```typescript
// Use shadcn/ui components with Figma specifications
<Command className="figma-tag-selector">
  <CommandInput placeholder={figmaPlaceholderStyle} />
  <CommandList className="figma-hierarchy-tree" />
</Command>
```

## Benefits Analysis

### 1. **Development Acceleration**
- **Reduced Design Decisions**: Figma provides exact specifications
- **Faster Iteration**: Visual reference eliminates guesswork
- **Quality Assurance**: Pixel-perfect implementation validation

### 2. **Consistency Assurance**
- **Design System Compliance**: Figma enforces visual consistency
- **Component Reusability**: Shared design patterns across features
- **Brand Alignment**: Professional appearance matching design intent

### 3. **Team Collaboration**
- **Designer-Developer Handoff**: Clear specifications reduce miscommunication
- **Stakeholder Validation**: Visual prototypes for approval before development
- **Documentation**: Figma serves as living design documentation

## Risk Mitigation

### Potential Conflicts and Solutions

#### 1. **Over-Specification Risk**
**Problem**: Figma designs too rigid for responsive implementation
**Solution**: Use Figma for desktop specifications, adapt responsively with Tailwind

#### 2. **Component Mismatch Risk**
**Problem**: Figma components don't map to NextAdmin/shadcn patterns
**Solution**: Extract design tokens (colors, spacing) rather than exact components

#### 3. **Maintenance Overhead Risk**
**Problem**: Keeping Figma and code in sync
**Solution**: Use Figma as source of truth for design tokens, not implementation details

## Implementation Recommendations

### 1. **Use Figma for Design Specification, Not Code Generation**
```bash
# DO: Extract design tokens
colors: {
  primary: figma.colors.primary,
  secondary: figma.colors.secondary
}

# DON'T: Auto-generate components from Figma
# Manual implementation with NextAdmin + shadcn/ui is more maintainable
```

### 2. **Establish Clear Handoff Process**
```bash
# Design Phase
1. Create Figma wireframes with detailed specifications
2. Extract design tokens and component specifications
3. Document interaction patterns and micro-animations

# Development Phase
1. Implement with NextAdmin + shadcn/ui foundation
2. Apply Figma styling specifications
3. Validate against Figma designs
```

### 3. **Prioritize Component Mapping**
```typescript
// High Priority: Direct mapping
Button → shadcn/ui Button + Figma styling
Input → NextAdmin Input + Figma specifications
Card → shadcn/ui Card + Figma layout

// Medium Priority: Hybrid approach
RichTextEditor → NextAdmin base + Figma customization
DataTable → NextAdmin table + Figma styling

// Low Priority: Custom implementation
ComplexCharts → Custom with Recharts + Figma design
AdvancedAnimations → Framer Motion + Figma timing
```

## Success Metrics

### Design-Development Alignment
- **Visual Accuracy**: 95%+ match between Figma and implementation
- **Component Reusability**: 80%+ of components follow design system
- **Development Speed**: 30% faster than pure custom development

### Quality Assurance
- **Design Review Approval**: First-pass approval rate >90%
- **User Testing Consistency**: Consistent experience across all Stage 4 features
- **Maintenance Efficiency**: Design updates implementable within 1 sprint

## Conclusion

**Figma MAKE files will significantly ENHANCE rather than conflict with the NextAdmin + shadcn/ui strategy.** The key is using Figma as a **design specification tool** rather than a code generation tool.

### Final Recommendation

1. **Proceed with Figma wireframe creation** for all Stage 4 features
2. **Extract design tokens and specifications** from Figma MAKE files
3. **Implement using NextAdmin + shadcn/ui** with Figma styling guidance
4. **Establish clear handoff process** between design and development
5. **Use Figma as validation tool** for implementation quality

This approach provides the **best of both worlds**: the rapid development capabilities of NextAdmin + shadcn/ui with the design precision and consistency of professional Figma specifications.

**Total Impact**: The combination will result in **higher quality, faster development, and better user experience** than either approach alone.
- Maintain 4.5:1 color contrast; visible focus ring; trap focus in dialogs.
- Ensure all actions reachable via keyboard; include skip-to-content.

Information Architecture
- Top: header with project name, help, save status.
- Left: stepper navigation with milestones.
- Main: step content with form controls, previews.
- Right: contextual help drawer (toggle) and validation summary.
- Footer: primary/secondary actions, progress, undo/redo.

Page Plan
- 1) New Project & Template Picker — start from template or blank; shows recent drafts.
- 2) Wizard Step (Happy Path) — standard step with instructions, form, help drawer, progress.
- 3) Wizard Step (Validation & Error States) — same step showing inline errors, disabled Next, error banner.
- 4) Review & Confirm — summary of choices with editable sections; validation summary; finalize.
- 5) Resume & History — list of drafts with last-updated time; “Resume” CTA; per-step history and undo/redo examples.

Annotations (Mandatory)
- Attach notes to each component citing the acceptance criterion it fulfills (e.g., “FR5.1.0 AC: Progress indicators with ETA”). Include a “Mapping Table” frame: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
- Visual step-by-step wizard; source: US3.1.1/FR5.1.0; screens: 2,3,4; components: stepper, header, next/back; states: default, disabled; notes: step names must be descriptive.
- Progress indicators with percent/current/ETA; source: US3.1.1/FR5.1.0; screens: 2,3,4; components: progress bar, ETA chip; states: loading, in-progress; notes: show ETA tooltip.
- Milestone tracking; source: FR5.1.0; screens: 2,3; components: timeline, status chips; states: completed/current/upcoming; notes: clickable to view details.
- Context-sensitive help; source: US3.1.1/FR5.1.0; screens: 2,3; components: help icons, drawer; states: collapsed/expanded; notes: step-specific content.
- Intelligent validation; source: FR5.1.0; screens: 3; components: form fields, validation summary; states: error/success; notes: disable Next until valid.
- Error handling with remediation; source: US3.1.1/FR5.1.0; screens: 3; components: error banner, retry; states: error; notes: link to relevant help article.
- Save and resume; source: US3.1.1/FR5.1.0; screens: 1,5; components: autosave indicator, Resume banner; states: saved/draft; notes: show last-saved time.
- State persistence (UI hint); source: FR5.1.0; screens: 1,5; components: draft badge; states: persisted; notes: cross-device continuity message.
- Smart defaults; source: FR5.1.0; screens: 2; components: prefilled inputs, reset defaults; states: default/applied; notes: clarify why a default is chosen.
- Undo/redo; source: FR5.1.0; screens: 2,3,5; components: toolbar; states: available/unavailable; notes: label with action target (e.g., “Undo threshold change”).
- Workflow templates; source: FR5.1.0; screens: 1; components: template cards; states: selected/hover; notes: include use-case tags.
- Accessibility compliance; source: FR5.1.0; screens: all; components: focus ring, ARIA; states: focus; notes: test with keyboard-only flow.
- Mobile responsiveness; source: FR5.1.0; screens: representative mobile variants; components: stacked layout; states: compact; notes: sticky bottom action bar.
- Workflow analytics (UI notice); source: FR5.1.0; screens: 1; components: privacy toggle; states: on/off; notes: non-blocking.
- Quick restart; source: FR5.1.0; screens: 4; components: restart CTA; states: default/hover; notes: confirmation modal before reset.

Non-UI Acceptance Criteria
- Workflow state persistence across sessions/devices — impacts storage/session; UI hint: “Resume Draft” banner and draft badge.
- Workflow analytics to improve interface — impacts telemetry; UI hint: optional privacy toggle and link to policy.

Estimated Page Count
- 5 — Covers start, typical step, validation/error, review/finalize, and resume/history to demonstrate core states and flows.

=== END PROMPT FR: FR5.1.0 ===

=== BEGIN PROMPT FR: FR5.2.0 ===

Title
- FR FR5.2.0 Wireframes — Stage 5 — User Experience and Interface

Context Summary
- Create a browsable Template and Example Library that accelerates project setup via industry-specific starting points.
- Users must preview examples, customize parameters, leverage community contributions, and find items quickly with search/filters.
- The UI should surface documentation, versioning, validation results, and quality/review signals while remaining simple for non-technical users.

Wireframe Goals
- Enable quick discovery with search, categories, tags, and advanced filters.
- Provide rich template previews with sample outputs and config options.
- Support customization and personalization flows with clear defaults and save-as-new.
- Facilitate community contribution with rating/review and publish validation feedback.
- Allow import/export and version rollback where appropriate.

Explicit UI Requirements (from acceptance criteria)
- Library home: search bar, filters (industry, use case, complexity, tags), sort (popular, latest, rating), “Recommended for you”.
- Template cards: title, industry/category chips, brief description, quality score, rating, usage count.
- Template preview: sample outputs, parameter list with tooltips, “Use Template” CTA.
- Customization flow: editable parameters/styles/generation settings; “Save as Custom Template”.
- Personalization surface: “Recommended” rail with explanation tooltip (“Based on your activity”).
- Community: contribute flow with submit form; rating and review components; author profile snippet.
- Versioning: version dropdown, changelog link, “Rollback” CTA with confirm modal.
- Validation status: pre-publication checks summary (pass/warn/fail) with details.
- Documentation: details tab with description, use cases, configuration guidance, examples.
- Categories & tags: left nav and chips for industry/use case/complexity/content type.
- Import/Export: modal to import (.json/.zip) and export (JSON/JSONL/Template bundle); success and error states.
- Recommendation surface: badges like “Trending”, “Popular this week”; carousel.
- Analytics surface: popularity metrics and effectiveness indicators; privacy notice.

Interactions and Flows
- Discover: Search or filter → browse list → open detail → preview → Use Template.
- Customize: From detail → adjust parameters → save as custom or start project.
- Contribute: “Publish Template” → fill form → validation results → submit; show review and rating after publish.
- Versioning: Open version menu → view changelog → rollback with confirm → success toast.
- Import/Export: Open modal → select format → import/export → show success/error and next steps.

Visual Feedback
- Loading skeletons for list and detail; empty states for “no results”.
- Toasters for save, publish, rollback, import/export success/failure.
- Status chips: Validated, Warnings, Needs Review; badges for Trending/Popular.

Accessibility Guidance
- Search and filter controls fully labeled; ARIA live updates for result count.
- Keyboard navigable grid/cards with clear focus outlines.
- Reviews and ratings announced with accessible text; sufficient contrast.

Information Architecture
- Left: filters and categories; Top: search and sort; Main: cards grid; Right/Modal: preview/config.
- Detail page: tabs for Preview, Details/Docs, Versions, Reviews.

Page Plan
- 1) Library Home & Discovery — search, filters, recommended rail, cards with key signals.
- 2) Template Detail & Preview — sample outputs, parameters, docs, validation status, “Use Template”.
- 3) Customize Template — parameter editor with save-as, reset defaults, validation.
- 4) Community Publish & Reviews — submit form, validation results, rating/review UI.
- 5) Import/Export & Versioning — modal interactions, version dropdown, changelog, rollback.

Annotations (Mandatory)
- Attach notes to elements citing specific criteria (e.g., “US3.2.1: Template customization”). Include a “Mapping Table” frame: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
- Industry-specific templates; source: US3.2.1/FR5.2.0; screens: 1; components: filters, category chips; states: default/selected; notes: show multiple industries.
- Example datasets with best practices; source: US3.2.1/FR5.2.0; screens: 2; components: Preview tab; states: sample loaded/empty; notes: link to examples.
- Template customization; source: US3.2.1/FR5.2.0; screens: 3; components: parameter editor; states: default/edited/validated; notes: save-as-new.
- Personalization; source: FR5.2.0; screens: 1; components: Recommended rail; states: populated/empty; notes: explanation tooltip.
- Community contributions; source: US3.2.1/FR5.2.0; screens: 4; components: publish form; states: draft/validated/submitted; notes: review & rating UI.
- Search & filtering; source: US3.2.1/FR5.2.0; screens: 1; components: search input, filter panel; states: active/cleared; notes: show result count.
- Template preview; source: FR5.2.0; screens: 2; components: sample outputs, Use Template CTA; states: loading/ready; notes: parameter tooltip.
- Versioning & rollback; source: FR5.2.0; screens: 5; components: version select, changelog; states: selected/confirm; notes: rollback confirmation.
- Validation before publication; source: FR5.2.0; screens: 4; components: validation summary; states: pass/warn/fail; notes: block submit on fail.
- Usage analytics (surface only); source: FR5.2.0; screens: 1; components: popularity metrics; states: visible; notes: privacy note.
- Template documentation; source: FR5.2.0; screens: 2; components: Details/Docs tab; states: default; notes: include configuration guidance.
- Categories organization; source: FR5.2.0; screens: 1; components: left nav; states: expanded/collapsed; notes: industry/use case/complexity/content type.
- Import/Export; source: FR5.2.0; screens: 5; components: modal; states: success/error; notes: supported formats listed.
- Recommendation engine (UI hint); source: FR5.2.0; screens: 1; components: badges/carousel; states: populated; notes: “Based on your objectives”.
- Template quality scoring (UI hint); source: FR5.2.0; screens: 1,2; components: quality score chip; states: high/medium/low; notes: tooltip definition.

Non-UI Acceptance Criteria
- Personalization engine adapts based on preferences/history — algorithmic; UI hint: “Recommended for you” rail.
- Validation pipeline ensures template quality/compatibility before publication — back-end; UI hint: validation summary.
- Recommendation engine suggests templates based on content/objectives — algorithmic; UI hint: badges/carousel.
- Usage analytics track popularity/effectiveness — telemetry; UI hint: popularity metrics.
- Domain coverage across industries — content scope; UI hint: industry chips.

Estimated Page Count
- 5 — Discovery, detail/preview, customization, community publish/reviews, and import/export/versioning cover the end-to-end flow and states.

=== END PROMPT FR: FR5.2.0 ===

=== BEGIN PROMPT FR: FR5.3.0 ===

Title
- FR FR5.3.0 Wireframes — Stage 5 — User Experience and Interface

Context Summary
- Provide a comprehensive Project Dashboard that surfaces status, quality, performance, timelines, costs, and collaboration for training-data projects.
- The dashboard must be customizable, real-time, and exportable, enabling managers to monitor progress, act on alerts, and coordinate teams.
- Keep visualizations legible, comparable, and actionable with clear drill-down paths.

Wireframe Goals
- Summarize project health at a glance with clear progress and milestone indicators.
- Visualize quality metrics (fidelity, diversity, bias) and performance/resource utilization with trends.
- Manage timelines with Gantt and alerts; support collaboration and assignments.
- Enable customization of widgets and export of reports.

Explicit UI Requirements (from acceptance criteria)
- Overview: status chip, overall progress %, key milestones, recent activity.
- Quality metrics: cards/charts for fidelity scores, semantic diversity, bias detection with trend lines.
- Performance indicators: processing speed, system efficiency, historical comparisons.
- Timeline & milestones: Gantt view; add/edit milestones; deadline alerts.
- Resources & costs: CPU/memory/storage/API usage; cost projections; filters by time range.
- Collaboration: task assignment panel, assignees, comments/updates, share progress.
- Project templates: start from dashboard; template picker for project types.
- Customization: add/remove/reorder widgets; save layout per role.
- Real-time updates surface: live indicator; auto-refresh toggle.
- Export: report generation (PDF/Excel/Slides) with selected sections.
- Comparison: side-by-side compare two or more projects with aligned metrics.
- Alerts: threshold breach notifications, deadline warnings; notifications panel and toasts.
- Archive: “Archive Project” action with confirm; badge on archived items; restore flow.
- Integrations surface: settings to connect external PM tools; status indicator.

Interactions and Flows
- Overview Drill-Down: click widget → open detail view (quality, performance, timeline, resources).
- Timeline Management: add milestone → set date/owner → alert rules → save; overdue highlights.
- Collaboration: assign task → notify assignee → status update reflected in activity feed.
- Comparison: open Compare → select projects → view side-by-side charts; export comparison.
- Export: choose format/sections → generate → download; show success/error.
- Customization: enter edit mode → drag/reorder → save layout; role-based presets.

Visual Feedback
- Real-time “Live” pill; updated timestamps.
- Trend arrows and color-coded statuses (good/warn/critical) with legends.
- Toasts for assignments, exports, integration success/failure.
- Empty/loading states for widgets; skeletons on load.

Accessibility Guidance
- Charts with accessible summaries and data tables; ARIA descriptions.
- Keyboard navigation for all controls and Gantt interactions.
- High contrast color palettes; avoid color-only encoding; include patterns/labels.

Information Architecture
- Top: project switcher, status, export, customize.
- Left: navigation (Overview, Quality, Performance, Timeline, Resources, Collaboration, Compare, Settings).
- Main: widgets grid; drill-down pages per area.
- Right: notifications/activity panel.

Page Plan
- 1) Project Overview — status/progress, key milestones, recent activity, alerts.
- 2) Quality Metrics — fidelity/diversity/bias dashboards with trends and filters.
- 3) Timeline & Milestones — Gantt with create/edit milestone and alert rules.
- 4) Resources & Costs — usage charts, cost breakdowns, projections.
- 5) Collaboration — assignments, comments, share progress.
- 6) Compare & Export — project comparison view and export report flow.

Annotations (Mandatory)
- Attach notes citing each criterion (e.g., “US3.2.2: Project overview with progress”). Include a “Mapping Table” frame: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
- Project overview with status/progress; source: US3.2.2/FR5.3.0; screens: 1; components: status chip, progress bar; states: normal/warn/critical; notes: tooltip explains thresholds.
- Quality metrics (fidelity/diversity/bias) with trends; source: US3.2.2/FR5.3.0; screens: 2; components: charts/cards; states: loading/empty; notes: filter by time range.
- Performance indicators; source: FR5.3.0; screens: 2; components: speed/utilization widgets; states: normal/warn; notes: compare to baseline.
- Timeline management with Gantt and alerts; source: US3.2.2/FR5.3.0; screens: 3; components: Gantt, alert rules modal; states: upcoming/overdue; notes: keyboard operations.
- Resource usage monitoring & cost projections; source: US3.2.2/FR5.3.0; screens: 4; components: charts, tables; states: live/historic; notes: time range filters.
- Cost tracking breakdowns; source: FR5.3.0; screens: 4; components: cost table; states: grouped; notes: export to CSV.
- Collaboration (assignments, sharing, comms); source: US3.2.2/FR5.3.0; screens: 5; components: task list, assignee picker, comments; states: open/in-progress/done; notes: mentions and activity feed.
- Project templates from dashboard; source: FR5.3.0; screens: 1; components: template picker; states: modal; notes: link to templates library.
- Dashboard customization; source: FR5.3.0; screens: 1; components: edit mode, drag handles; states: editing/saved; notes: role-based presets.
- Real-time updates surface (UI hint); source: FR5.3.0; screens: all; components: Live pill, auto-refresh toggle; states: on/off; notes: updated timestamp.
- Export reports; source: FR5.3.0; screens: 6; components: export wizard; states: selecting/generating/success/error; notes: include selected widgets.
- Project comparison tools; source: FR5.3.0; screens: 6; components: compare picker, side-by-side charts; states: selected; notes: sync axes.
- Alerts system; source: FR5.3.0; screens: 1,3; components: notifications panel, toasts; states: unread/resolved; notes: link to source widget.
- Archive/backup (UI hint); source: FR5.3.0; screens: 1; components: Archive action; states: confirm/archived; notes: restore flow.
- External PM integration (UI hint); source: FR5.3.0; screens: Settings; components: integrations list; states: connected/disconnected; notes: sync status.

Non-UI Acceptance Criteria
- Real-time updates infrastructure — data streaming/back-end; UI hint: “Live” pill and updated timestamps.
- Project archiving and backup — storage/retention; UI hint: archive/restore flows and badges.
- External project management integrations — connectors; UI hint: integration settings and sync status.

Estimated Page Count
- 6 — Captures overview, quality, timeline, resources/costs, collaboration, and compare/export to fulfill the dashboard scope and states.

=== END PROMPT FR: FR5.3.0 ===

=== BEGIN PROMPT FR: FR5.1.1 ===

Title
- FR FR5.1.1 Wireframes — Stage 5 — Quality Control and Review Workflow

Context Summary
- Collaborative Review Management system enables efficient team-based quality control of training data through intelligent workload assignment, progress tracking, and bulk operations. The interface supports Quality Reviewers, Team Leads, and Subject Matter Experts in maintaining quality standards while preserving audit trails and providing resolution workflows for disagreements. This system ensures training data meets 95% approval rates with <5 minutes per pair review time.

Journey Integration
- Stage 5 user goals: Quality validation, Review workflow coordination, Approval process management, Team collaboration, Audit trail maintenance
- Key emotions: Confidence in quality standards, Efficiency in review process, Trust in team coordination, Satisfaction with bulk operations
- Progressive disclosure levels:
  * Basic: Simple approve/reject workflow with basic diff viewing
  * Advanced: Team coordination, workload balancing, conflict resolution
  * Expert: Performance analytics, audit trails, custom workflows
- Persona adaptations: Quality Reviewer dashboard, Team Lead coordination view, Expert validation interface

### Journey-Informed Design Elements
- User Goals: Quality validation, Review workflow, Approval process, Team coordination, Performance tracking
- Emotional Requirements: Quality confidence, Decision efficiency, Team trust, Progress visibility
- Progressive Disclosure:
  * Basic: Individual review interface with approve/reject
  * Advanced: Team assignment and progress monitoring
  * Expert: Performance metrics and audit capabilities
- Success Indicators: Quality maintained, Reviews completed, Team coordinated, Deadlines met

Wireframe Goals
- Enable efficient individual review workflow with clear quality assessment tools
- Provide team coordination dashboard for managing assignments and progress
- Support bulk operations for high-quality content to improve efficiency
- Maintain complete audit trails for all review decisions and team actions
- Facilitate conflict resolution workflow for reviewer disagreements

Explicit UI Requirements (from acceptance criteria)
- Assignment Dashboard: QA pair assignment interface with reviewer selection, workload balancing indicators, expertise matching suggestions
- Progress Tracking: Real-time status dashboard showing pending/in-progress/completed reviews per team member with completion percentages
- Deadline Management: Review target setting interface, automated reminder notifications, overdue item escalation with customizable schedules
- Performance Metrics: Review speed tracking, quality consistency scoring, approval rate analytics with trend analysis and benchmarking
- Conflict Resolution: Disagreement workflow interface with escalation paths, expert consultation routing, final arbitration process
- Workload Balancing: Automatic redistribution interface when reviewers unavailable, fair algorithm display, manual override capabilities
- Bulk Operations: Multi-select approval/rejection interface with quality threshold filtering, pattern-based selection tools
- Quality Filtering: Configurable quality score thresholds for bulk approval, safety check confirmations, manual override options
- Feedback Templates: Standardized rejection reason interface with customizable categories, improvement suggestion templates
- Review Statistics: Efficiency report generation showing throughput, quality trends, reviewer performance comparisons with exportable dashboards
- Audit Trail: Complete history tracking of assignments, decisions, modifications with timestamp and user attribution
- Notification System: Customizable alerts for assignments, deadlines, conflicts, status changes via email and in-app messaging
- Reviewer Calibration: Consistency training tools with quality benchmarking exercises, training material access
- Collaborative Workspace: Reviewer communication interface with integrated messaging, consultation features, shared decision-making tools

Interactions and Flows
- Assignment Flow: Team Lead accesses assignment dashboard → Selects QA pairs → Chooses reviewers → Sets deadlines → Confirms assignment → Notifications sent
- Review Flow: Reviewer accesses assigned items → Reviews content → Makes approve/reject decision → Adds comments if needed → Submits review
- Bulk Approval Flow: Reviewer filters by quality score → Selects multiple items → Bulk approve action → Safety confirmation → Audit log updated
- Conflict Resolution Flow: Disagreement detected → Escalation notification → Expert consultation → Final arbitration → Resolution recorded
- Progress Monitoring Flow: Team Lead checks dashboard → Views individual progress → Identifies bottlenecks → Redistributes workload → Monitors improvement

Visual Feedback
- Progress indicators: Completion percentages, status chips (pending/in-progress/completed), workload balance meters
- Quality indicators: Color-coded quality scores, approval rate trends, consistency scoring
- Status notifications: Real-time assignment alerts, deadline warnings, conflict resolution updates
- Performance metrics: Review speed charts, efficiency trends, comparison benchmarks

Accessibility Guidance
- ARIA labels for all assignment and review controls
- Keyboard navigation for bulk selection and operations
- Screen reader announcements for status changes and notifications
- High contrast indicators for quality scores and status
- Focus management in modal dialogs and complex interfaces

Information Architecture
- Left Navigation: Review Queue, Assignments, Team Dashboard, Performance Reports, Settings
- Main Content: Assignment table/grid, review interface, bulk operation controls
- Right Panel: Progress tracking, notifications, team communication
- Top Bar: Search/filter controls, bulk action buttons, notification center

Page Plan
- 1) Team Assignment Dashboard — Overview of team capacity, assignment interface, workload balancing controls, progress monitoring
- 2) Individual Review Interface — QA pair review with approve/reject workflow, quality assessment tools, comment interface
- 3) Bulk Operations Dashboard — Multi-select interface, quality filtering, batch approval/rejection, audit confirmation
- 4) Conflict Resolution Interface — Disagreement management, escalation workflow, expert consultation, arbitration tools
- 5) Performance Analytics — Team metrics, efficiency reports, quality trends, reviewer comparison dashboard

Annotations (Mandatory)
- Attach notes on elements citing the acceptance criterion they fulfill and include a "Mapping Table" frame in Figma: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
- Intelligent assignment algorithm with workload balancing; source: FR5.1.1; screens: 1; components: assignment interface, workload meters; states: balanced/overloaded; notes: Show algorithm recommendations
- Progress dashboard with real-time status; source: US5.1.1/FR5.1.1; screens: 1,5; components: progress cards, status indicators; states: pending/in-progress/completed; notes: Auto-refresh enabled
- Deadline management with reminders; source: FR5.1.1; screens: 1; components: deadline picker, notification settings; states: upcoming/overdue; notes: Customizable reminder intervals
- Performance metrics tracking; source: FR5.1.1; screens: 5; components: metrics dashboard, trend charts; states: normal/warning; notes: Benchmarking against team averages
- Conflict resolution workflow; source: US5.1.1/FR5.1.1; screens: 4; components: escalation interface, consultation routing; states: open/escalated/resolved; notes: Clear escalation paths
- Workload redistribution when reviewers unavailable; source: FR5.1.1; screens: 1; components: reassignment interface, availability status; states: available/unavailable; notes: Fair algorithm display
- Batch operations with multi-select; source: US5.1.3/FR5.1.1; screens: 3; components: selection checkboxes, bulk action bar; states: none/partial/all selected; notes: Pattern-based selection tools
- Quality threshold filtering for bulk approval; source: US5.1.3/FR5.1.1; screens: 3; components: quality filter slider, threshold display; states: filtered/unfiltered; notes: Safety check confirmations
- Standardized feedback templates; source: FR5.1.1; screens: 2,3; components: template dropdown, custom message field; states: template/custom; notes: Categorized rejection reasons
- Review statistics with exportable dashboards; source: US5.1.3/FR5.1.1; screens: 5; components: stats dashboard, export button; states: viewing/exporting; notes: Multiple export formats
- Complete audit trail system; source: FR5.1.1; screens: all; components: audit log viewer, attribution display; states: chronological/filtered; notes: Timestamp and user tracking
- Customizable notification system; source: FR5.1.1; screens: 1,2; components: notification center, alert settings; states: unread/read; notes: Email and in-app options
- Reviewer calibration tools; source: FR5.1.1; screens: 1; components: training access, benchmark tests; states: calibrated/needs-training; notes: Quality consistency scoring
- Collaborative workspace features; source: FR5.1.1; screens: 1,2,4; components: messaging interface, consultation tools; states: active/idle; notes: Shared decision-making support

Non-UI Acceptance Criteria
- Intelligent algorithm for reviewer assignment based on expertise and availability — impacts assignment logic; UI hint: assignment recommendations and expertise matching
- Automated workload redistribution when reviewers become unavailable — impacts scheduling system; UI hint: availability tracking and reassignment notifications
- Reviewer calibration algorithms ensuring consistency across team members — impacts quality scoring; UI hint: calibration status and training recommendations
- Performance tracking algorithms for review speed and quality metrics — impacts analytics; UI hint: metrics dashboard and trend analysis
- Notification delivery system for assignments, deadlines, and conflicts — impacts messaging infrastructure; UI hint: notification center and alert preferences

Estimated Page Count
- 5 — Covers team assignment dashboard, individual review interface, bulk operations, conflict resolution, and performance analytics to demonstrate complete collaborative review workflow

=== END PROMPT FR: FR5.1.1 ===

=== BEGIN PROMPT FR: FR5.1.2 ===

Title
- FR FR5.1.2 Wireframes — Stage 5 — Quality Control and Review Workflow

Context Summary
- Quality Review and Validation Interface provides sophisticated review capabilities with advanced diff visualization, side-by-side comparison, in-line editing, and comprehensive workflow management. The interface enables Quality Reviewers and Subject Matter Experts to efficiently assess training data quality while maintaining complete change tracking and expert validation workflows. This system ensures 95% approval rates with <5 minutes per pair review time while preserving methodology and voice consistency.

Journey Integration
- Stage 5 user goals: Quality validation, Review workflow efficiency, Expert approval process, Change tracking, Final validation
- Key emotions: Confidence in quality assessment, Decision efficiency, Trust in review process, Achievement in maintaining standards  
- Progressive disclosure levels:
  * Basic: Simple approve/reject interface with basic diff viewing
  * Advanced: In-line editing with version control and quality scoring
  * Expert: Complete audit trails with expert sign-off and validation checkpoints
- Persona adaptations: Quality Reviewer focused interface, Expert validation workflow, Team coordination view

### Journey-Informed Design Elements
- User Goals: Quality validation, Review workflow, Approval process, Change tracking, Expert validation
- Emotional Requirements: Quality confidence, Decision efficiency, Trust building, Achievement celebration
- Progressive Disclosure:
  * Basic: Clear diff visualization with approve/reject workflow
  * Advanced: In-line editing with quality scoring and filtering
  * Expert: Complete version control with expert sign-off capabilities
- Success Indicators: Quality confirmed, Review completed, Approval granted, Changes tracked

Wireframe Goals
- Provide clear visual diff interface showing original vs refined content with precise change highlighting
- Enable efficient review workflow with quality scoring, filtering, and approval/rejection capabilities
- Support in-line editing during review process with real-time preview and version control
- Facilitate expert validation with sign-off workflow and quality assurance checkpoints
- Maintain complete audit trail with change tracking, timestamps, and rationale capture

Explicit UI Requirements (from acceptance criteria)
- Advanced Diff Visualization: Color-coded line-by-line comparison interface with word-level highlighting, intuitive visual indicators for additions/deletions/modifications
- Side-by-Side Comparison: Original and refined content display with synchronized scrolling, expandable sections for detailed comparison, responsive layout adaptation
- Quality Scoring Dashboard: Improvement metrics display showing uniqueness increase, depth enhancement, methodology integration scores with visual progress indicators
- Approval Workflow Interface: Clear accept/reject buttons with mandatory comment fields for rejections, optional enhancement suggestions, workflow status tracking
- Multi-Criteria Filtering System: Search and filter by reviewer assignment, approval status, quality score ranges, content categories with saved filter presets
- In-Line Editing Capabilities: Direct editing within review interface with rich text formatting, real-time preview, auto-save functionality every 10 seconds
- Version Control System: Complete edit history with branching for reviewer suggestions, merge conflict resolution, rollback capabilities with change attribution
- Change Tracking Display: Highlighted modifications with user attribution, timestamps, rationale capture, detailed change annotations with color coding
- Expert Sign-Off Workflow: Digital signature requirement, final quality validation checkpoints, expert approval routing with notification system
- Quality Assurance Checkpoints: Content accuracy validation, methodology alignment verification, voice consistency scoring before final approval
- Expert Comment System: Detailed rationale capture for edits, improvement suggestions, methodology validation notes with rich text formatting
- Review Interface Optimization: Keyboard shortcuts for efficiency, bulk action capabilities, customizable layout options with user preference storage
- Quality Metrics Display: Before/after comparison with quantitative improvement measures, value addition scoring, semantic enhancement tracking
- Integration Validation: Training data format requirement checking, export specification compliance, compatibility verification with downstream systems

Interactions and Flows
- Review Flow: Access assigned review → View diff visualization → Assess quality scoring → Make inline edits if needed → Add comments → Approve/reject → Submit decision
- Edit Flow: Select text for editing → Make changes with rich text editor → Preview changes in real-time → Save changes → Review diff → Continue with approval workflow
- Version Control Flow: View edit history → Select version to compare → Review changes with attribution → Rollback if needed → Merge conflicting suggestions
- Expert Validation Flow: Access final review queue → Review all changes and comments → Validate methodology alignment → Digital sign-off → Final approval confirmation
- Filter/Search Flow: Apply multi-criteria filters → Sort by priority/quality score → Select items for bulk operations → Execute bulk actions with confirmation

Visual Feedback
- Change indicators: Color-coded additions (green), deletions (red), modifications (blue) with intensity showing confidence levels
- Quality scoring: Progress bars and numerical scores with improvement indicators, trend arrows showing quality enhancement
- Status indicators: Review status chips (pending/in-progress/completed), approval states with color coding and icons
- Version control: Timeline visualization of changes, branching indicators for multiple reviewer suggestions
- Workflow progress: Step indicators showing review progress, completion percentages, milestone achievements

Accessibility Guidance
- ARIA labels for all diff visualization elements and change indicators
- Keyboard navigation for inline editing and approval workflows with clear focus management
- Screen reader announcements for quality score changes and approval status updates
- High contrast color palettes for diff visualization that work without color dependency
- Focus management in complex editing interfaces with logical tab order

Information Architecture
- Left Panel: Review queue with filtering controls, quality score filtering, status indicators
- Main Content: Side-by-side diff interface with inline editing capabilities, quality metrics display
- Right Panel: Comments and rationale capture, version history, expert sign-off controls
- Top Bar: Approval/rejection controls, bulk action buttons, search and filter interface
- Bottom Bar: Navigation controls, progress indicators, save status display

Page Plan
- 1) Review Queue Dashboard — Filterable list of items requiring review with quality scores, status indicators, assignment information, bulk selection capabilities
- 2) Detailed Review Interface — Side-by-side diff visualization with quality scoring, inline editing, comment system, approval workflow controls
- 3) Version Control & History — Edit history timeline, change attribution, rollback capabilities, merge conflict resolution interface
- 4) Expert Sign-Off Workflow — Final validation interface with quality assurance checkpoints, methodology verification, digital signature capabilities
- 5) Bulk Operations Interface — Multi-select review interface with bulk approval/rejection, quality filtering, batch comment capabilities

Annotations (Mandatory)
- Attach notes on elements citing the acceptance criterion they fulfill and include a "Mapping Table" frame in Figma: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
- Advanced diff visualization with color coding and word-level highlighting; source: US5.1.2/FR5.1.2; screens: 2; components: diff viewer, change indicators; states: additions/deletions/modifications; notes: Intuitive visual indicators with accessibility support
- Side-by-side comparison with synchronized scrolling; source: US5.1.2/FR5.1.2; screens: 2; components: split-pane interface, scroll sync; states: original/refined view; notes: Expandable sections for detailed comparison
- Quality scoring dashboard with improvement metrics; source: US5.1.2/FR5.1.2; screens: 2; components: metrics cards, progress indicators; states: scoring/improved; notes: Visual progress with trend arrows
- Approval workflow with accept/reject and comments; source: US5.1.2/FR5.1.2; screens: 2,4; components: approval buttons, comment fields; states: pending/approved/rejected; notes: Mandatory comments for rejections
- Multi-criteria filtering by reviewer, status, quality score; source: FR5.1.2; screens: 1; components: filter panel, search interface; states: active/cleared filters; notes: Saved filter presets for efficiency
- In-line editing with real-time preview capabilities; source: US5.1.4/FR5.1.2; screens: 2; components: rich text editor, preview pane; states: editing/preview/saved; notes: Auto-save every 10 seconds
- Version control with complete edit history; source: US5.1.4/FR5.1.2; screens: 3; components: history timeline, version selector; states: current/historical; notes: Branching for reviewer suggestions
- Change tracking with attribution and timestamps; source: FR5.1.2; screens: 2,3; components: change annotations, user attribution; states: tracked/attributed; notes: Detailed rationale capture
- Expert sign-off workflow with digital signatures; source: US5.1.4/FR5.1.2; screens: 4; components: signature interface, validation checklist; states: pending/signed; notes: Final quality validation required
- Quality assurance checkpoints for methodology alignment; source: FR5.1.2; screens: 4; components: validation checklist, methodology scoring; states: validated/needs-review; notes: Voice consistency verification
- Expert comment system for detailed rationale; source: US5.1.4/FR5.1.2; screens: 2,4; components: comment interface, rationale capture; states: draft/submitted; notes: Rich text formatting support
- Review interface optimization with keyboard shortcuts; source: FR5.1.2; screens: 2; components: shortcut overlay, customizable layout; states: default/customized; notes: User preference storage
- Quality metrics with before/after comparisons; source: FR5.1.2; screens: 2; components: comparison charts, improvement metrics; states: baseline/improved; notes: Quantitative value measures
- Integration validation for training data format; source: FR5.1.2; screens: 4; components: validation summary, compliance checker; states: valid/invalid; notes: Export specification compliance

Non-UI Acceptance Criteria
- Advanced diff algorithms for accurate change detection — impacts comparison engine; UI hint: precise visual diff highlighting with confidence indicators
- Quality scoring algorithms for improvement measurement — impacts metrics calculation; UI hint: numerical scores and improvement percentages
- Version control system for edit history management — impacts data storage; UI hint: timeline visualization and rollback capabilities  
- Digital signature infrastructure for expert validation — impacts security system; UI hint: signature interface and authentication workflow
- Integration validation for downstream compatibility — impacts format checking; UI hint: compliance verification and validation summary

Estimated Page Count
- 5 — Covers review queue, detailed review interface, version control, expert sign-off workflow, and bulk operations to demonstrate complete quality review and validation workflow

=== END PROMPT FR: FR5.1.2 ===