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


## 2. AI Integration & Generation Engine

### 2.1 Claude API Integration

- **FR2.1.1:** Automatic Rate Limiting
  * Description: Implement rate limiting respecting Claude API constraints with graceful degradation
  * Impact Weighting: System Reliability / User Experience
  * Priority: High
  * User Stories: US12.1.1
  * Tasks: [T-2.1.1]
  * User Story Acceptance Criteria:
    - Rate limiting respecting Claude API limits (e.g., 50 requests/minute)
    - Exponential backoff for retries: 1s, 2s, 4s, 8s, 16s
    - Maximum 3 retry attempts before marking as failed
    - Graceful degradation: partial batch success (not all-or-nothing)
    - Rate limit status displayed in UI when throttling occurs (e.g., "Rate limit: pausing for 30s...")
    - Queue visualization showing pending, in-progress, completed requests
    - Configurable rate limits for different API tiers
  * Functional Requirements Acceptance Criteria:
    - Rate limiter must track requests per minute using sliding window algorithm
      Code Reference: `src/lib/ai-config.ts` (AI configuration)
    - API calls must be queued when approaching rate limit threshold (90% of limit)
    - Retry logic must use exponential backoff with jitter to prevent thundering herd
    - Batch generation must process items with concurrency limit based on rate allowance
      Code Reference: `train-wireframe/src/lib/types.ts:142` (BatchJob concurrentProcessing)
    - Rate limit errors (429 status) must trigger automatic queue pause
    - UI must display real-time rate limit status with countdown timer
      Code Reference: `train-wireframe/src/components/generation/BatchGenerationModal.tsx`
    - Partial batch completion must update job status to show completed/failed/pending counts
      Code Reference: `train-wireframe/src/lib/types.ts:131-133` (BatchJob item counts)
    - Failed items must be retryable without reprocessing successful items
      Code Reference: `train-wireframe/src/lib/types.ts:147-157` (BatchItem with status tracking)
    - Configuration must support API tier selection (Opus, Sonnet, Haiku) with different rate limits
      Code Reference: `src/lib/ai-config.ts`
    - Rate limit metrics must be logged for capacity planning
    - Queue must prioritize high-priority batches when rate limited
      Code Reference: `train-wireframe/src/lib/types.ts:136` (BatchJob priority field)

- **FR2.1.2:** Retry Strategy Configuration
  * Description: Configurable retry behavior for different error types and use cases
  * Impact Weighting: Flexibility / Reliability
  * Priority: Low
  * User Stories: US12.1.2
  * Tasks: [T-2.1.2]
  * User Story Acceptance Criteria:
    - Configuration UI for: max retry attempts, backoff strategy, timeout duration
    - Retry strategies: exponential backoff, linear backoff, fixed delay
    - Per-error-type retry configuration (retry rate limits but not validation errors)
    - Test retry configuration with simulated failures
    - Default configuration optimized for Claude API
    - Override configuration per batch generation
  * Functional Requirements Acceptance Criteria:
    - Retry configuration must be stored in batch job settings
      Code Reference: `train-wireframe/src/lib/types.ts:139-143` (BatchJob configuration)
    - Error types must be categorized: retryable (rate limit, timeout, 5xx) vs non-retryable (validation, 4xx)
    - Exponential backoff formula: delay = base_delay * (2 ^ attempt_number) + random_jitter
    - Maximum backoff delay must be capped at 5 minutes
    - Timeout duration must be configurable per batch (default 60 seconds)
    - Error handling configuration must specify: 'continue' (skip failed items) or 'stop' (halt batch)
      Code Reference: `train-wireframe/src/lib/types.ts:143`
    - Settings UI must include retry simulation test button
      Code Reference: `train-wireframe/src/components/views/SettingsView.tsx`
    - Default retry policy must use 3 attempts with exponential backoff for Claude API
    - Per-batch override must be available in batch generation modal
      Code Reference: `train-wireframe/src/components/generation/BatchGenerationModal.tsx`
    - Retry metrics must be logged: total attempts, success rate per attempt number, time to success
    - Failed items after max retries must be marked with detailed error information
      Code Reference: `train-wireframe/src/lib/types.ts:156` (BatchItem error field)

### 2.2 Prompt Template System

- **FR2.2.1:** Template Storage and Version Control
  * Description: Database-backed prompt template management with version history
  * Impact Weighting: Template Quality / Iteration Speed
  * Priority: Medium
  * User Stories: US7.1.1
  * Tasks: [T-2.2.1]
  * User Story Acceptance Criteria:
    - Template management page accessible from admin navigation
    - List view showing all templates with: name, type, version, status (active/inactive), last updated
    - Create new template button opens template editor
    - Template editor with: name, description, template text, tier (Template/Scenario/Edge Case), applicable personas/emotions
    - Parameter placeholders highlighted: {persona}, {emotion}, {topic}, {intent}, {tone}
    - Preview pane showing resolved template with sample parameters
    - Version history showing all previous versions with diff view
    - Activate/deactivate toggle for each template
    - Delete template (requires confirmation)
  * Functional Requirements Acceptance Criteria:
    - Template entity must include all required fields per type definition
      Code Reference: `train-wireframe/src/lib/types.ts:58-74` (Template type)
    - Template structure field must support parameter placeholders with {{variable}} syntax
      Code Reference: `train-wireframe/src/lib/types.ts:62`
    - Variables array must define type, default value, help text, and options for dropdowns
      Code Reference: `train-wireframe/src/lib/types.ts:76-82` (TemplateVariable type)
    - Template management UI must be accessible from TemplatesView component
      Code Reference: `train-wireframe/src/components/views/TemplatesView.tsx`
    - List view must support sorting by: name, usage count, rating, last modified
      Code Reference: `train-wireframe/src/lib/types.ts:70-72`
    - Template editor must highlight placeholders with syntax validation
    - Preview pane must resolve placeholders with user-provided or sample values
    - Version history must show diffs using text-diff algorithm
    - Active/inactive status must control template availability in generation flows
    - Usage count must increment on each template application
      Code Reference: `train-wireframe/src/lib/types.ts:70`
    - Template deletion must require confirmation dialog and cascade to dependent scenarios
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:96-98` (Confirmation pattern)
    - Template quality threshold must be enforced for activation (minimum rating)
      Code Reference: `train-wireframe/src/lib/types.ts:68`

- **FR2.2.2:** Automatic Parameter Injection
  * Description: Dynamic parameter substitution from conversation metadata into templates
  * Impact Weighting: Data Quality / Automation
  * Priority: High
  * User Stories: US7.2.1
  * Tasks: [T-2.2.2]
  * User Story Acceptance Criteria:
    - Template uses placeholders: {persona}, {emotion}, {topic}, {intent}, {tone}, {chunk_content}
    - Parameters automatically populated from conversation metadata before API call
    - Pre-generation validation ensuring all required parameters present
    - Error message if template missing required parameter
    - Parameter preview showing resolved template before generation (debug mode)
    - Support for conditional parameters: {persona?optional_text}
    - Escape special characters in parameter values
  * Functional Requirements Acceptance Criteria:
    - Parameter injection must occur during template resolution phase
    - Template variables must support type-specific validation (text, number, dropdown)
      Code Reference: `train-wireframe/src/lib/types.ts:76-82` (TemplateVariable type)
    - Placeholders must use double curly brace syntax: {{variableName}}
    - Required parameters must be validated before generation starts
    - Missing parameter error must display variable name and expected type
    - Preview mode must show resolved template in single generation form
      Code Reference: `train-wireframe/src/components/generation/SingleGenerationForm.tsx`
    - Conditional parameters must use ternary syntax: {{persona ? 'text' : 'alternative'}}
    - HTML special characters must be escaped to prevent injection attacks
    - Parameter values from conversation metadata must be type-coerced appropriately
      Code Reference: `train-wireframe/src/lib/types.ts:44` (parameters Record type)
    - Default values must be applied when optional parameters are missing
      Code Reference: `train-wireframe/src/lib/types.ts:79` (TemplateVariable defaultValue)

- **FR2.2.3:** Template Validation and Testing
  * Description: Test prompt templates before activation to ensure quality
  * Impact Weighting: Quality Assurance / Risk Mitigation
  * Priority: Low
  * User Stories: US7.2.2
  * Tasks: [T-2.2.3]
  * User Story Acceptance Criteria:
    - "Test Template" button in template editor
    - Test dialog prompts for sample parameters or auto-generates test data
    - Preview shows resolved template with test parameters
    - "Send Test Request" calls Claude API with test prompt
    - Response displayed with quality score and validation results
    - Comparison with baseline template performance
    - Save as draft before activating
    - Require successful test before activation (optional)
  * Functional Requirements Acceptance Criteria:
    - Template editor must include test functionality button
      Code Reference: `train-wireframe/src/components/views/TemplatesView.tsx`
    - Test dialog must provide input fields for all template variables
      Code Reference: `train-wireframe/src/lib/types.ts:76-82` (Variable definitions)
    - Auto-generate test data must use realistic values based on variable types
    - Preview must show fully resolved template with all placeholders filled
    - Test API call must use same endpoint as production generation
      Code Reference: `src/app/api/chunks/generate-dimensions/route.ts`
    - Response must be validated against expected output schema
    - Quality assessment must check: completeness, format correctness, content relevance
    - Baseline comparison must use historical template performance metrics
      Code Reference: `train-wireframe/src/lib/types.ts:70-71` (usageCount, rating)
    - Draft mode must prevent template from being used in production
    - Activation guard must optionally require at least one successful test
    - Test results must be logged for template performance tracking

- **FR2.2.4:** Template Usage Analytics
  * Description: Track template performance metrics to identify best performers
  * Impact Weighting: Quality Improvement / Data-Driven Decisions
  * Priority: Low
  * User Stories: US7.1.2
  * Tasks: [T-2.2.4]
  * User Story Acceptance Criteria:
    - Usage statistics per template: conversations generated, average quality score, approval rate
    - Sort templates by: usage count, quality score, approval rate
    - Filter templates by tier or quality threshold
    - Trend chart showing quality over time per template
    - Comparison view: side-by-side template performance
    - Export usage analytics as CSV
    - Recommendation: "Use Template X for Tier 1 (highest approval rate: 92%)"
  * Functional Requirements Acceptance Criteria:
    - Usage count must increment on each template application
      Code Reference: `train-wireframe/src/lib/types.ts:70`
    - Average quality score must be calculated from linked conversation quality scores
      Code Reference: `train-wireframe/src/lib/types.ts:34` (Conversation qualityScore)
    - Approval rate formula: (approved conversations / total conversations) * 100
    - Template list must support multi-column sorting
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx:69-96` (Sorting pattern)
    - Filter UI must allow quality threshold slider and tier multi-select
    - Trend chart must use time-series data from generation logs
    - Comparison view must display metrics in side-by-side table format
    - CSV export must include: template_id, name, usage_count, avg_quality, approval_rate, tier
    - Recommendation engine must identify top performer per tier based on composite score
    - Analytics dashboard must refresh on navigation to templates view
      Code Reference: `train-wireframe/src/components/views/TemplatesView.tsx`
    - Historical data must be retained for trend analysis (minimum 90 days)

### 2.3 Quality Validation Engine

- **FR2.3.1:** Automated Quality Scoring
  * Description: Calculate quality scores based on structural criteria and conversation metrics
  * Impact Weighting: Quality Automation / Efficiency
  * Priority: Medium
  * User Stories: US4.3.1
  * Tasks: [T-2.3.1]
  * User Story Acceptance Criteria:
    - Quality score calculated automatically post-generation
    - Score based on: turn count (8-16 optimal), response length (appropriate for context), JSON validity, confidence score
    - Score displayed in table column with color coding: red (<6), yellow (6-7), green (8-10)
    - Quality badge includes icon: ⚠️ (low), ✓ (medium), ✓✓ (high)
    - Hover tooltip shows score breakdown (e.g., "Turn count: 5/5, Length: 4/5, Structure: 5/5")
    - Sort by quality score (ascending shows lowest first)
    - Filter by quality range (e.g., "Show only score < 6")
    - Automatic flagging for review if score < 6
  * Functional Requirements Acceptance Criteria:
    - Quality score must be calculated immediately after conversation generation
    - Overall score must be numeric 0-10 with 1 decimal precision
      Code Reference: `train-wireframe/src/lib/types.ts:34`
    - Quality metrics object must include detailed breakdown
      Code Reference: `train-wireframe/src/lib/types.ts:14-24` (QualityMetrics type)
    - Turn count scoring: optimal 8-16 turns (score 10), <4 or >20 turns (score ≤5)
      Code Reference: `train-wireframe/src/lib/types.ts:40` (totalTurns)
    - Response length must be validated against expected range per tier
    - JSON validity check must parse conversation structure successfully
    - Confidence level must be calculated: high (>0.8), medium (0.5-0.8), low (<0.5)
      Code Reference: `train-wireframe/src/lib/types.ts:21`
    - Color coding must be applied in table cell rendering
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx:139-143`
    - Quality badge must include appropriate icon based on score threshold
    - Tooltip must display component scores with labels and values
    - Table sorting must support quality_score column
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx:69-82`
    - Filter must use quality score range slider
      Code Reference: `train-wireframe/src/components/dashboard/FilterBar.tsx:183-198`
    - Auto-flagging must update conversation status to 'needs_revision' if score < 6

- **FR2.3.2:** Quality Criteria Details
  * Description: Detailed breakdown display showing why conversations received specific scores
  * Impact Weighting: Transparency / Learning
  * Priority: Medium
  * User Stories: US4.3.2
  * Tasks: [T-2.3.2]
  * User Story Acceptance Criteria:
    - Click quality score opens quality details dialog
    - Dialog shows breakdown: Turn Count Score, Length Score, Structure Score, Confidence Score
    - Each criterion shows: actual value, target range, score (1-10)
    - Visual indicator (progress bar or color) for each criterion
    - Explanation text for failed criteria (e.g., "Only 6 turns detected, optimal range is 8-16")
    - Recommendation for improvement (e.g., "Consider regenerating with adjusted prompt")
    - Close button to dismiss dialog
  * Functional Requirements Acceptance Criteria:
    - Quality score must be clickable in conversation table
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx`
    - Quality dialog must be modal with overlay backdrop
    - Breakdown display must iterate over quality metrics object
      Code Reference: `train-wireframe/src/lib/types.ts:14-24`
    - Each metric must show: name, actual_value, target_range, score (1-10), weight
    - Progress bar component must visualize score out of 10
      Code Reference: `train-wireframe/src/components/ui/progress.tsx`
    - Color coding must match table: red (<6), yellow (6-7), green (8-10)
    - Explanation text must be conditional based on which criteria failed
    - Recommendations must be specific and actionable per failure type
    - Dialog must support keyboard navigation (ESC to close, TAB to navigate)
    - Close button must clear dialog state and return focus to table
      Code Reference: `train-wireframe/src/stores/useAppStore.ts` (Modal state management)

---
