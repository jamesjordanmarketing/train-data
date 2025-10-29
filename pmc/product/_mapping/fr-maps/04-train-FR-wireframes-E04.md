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


## 4. Generation Workflows

### 4.1 Batch Generation

- **FR4.1.1:** Generate All Tiers Workflow
  * Description: Sequential generation of all conversations across all tiers
  * Impact Weighting: Core Functionality / Efficiency
  * Priority: High
  * User Stories: US3.1.1
  * Tasks: [T-4.1.1]
  * User Story Acceptance Criteria:
    - "Generate All" button in header
    - Modal shows generation plan: Tier 1 (30 conversations), Tier 2 (40), Tier 3 (20)
    - Estimated cost displayed before confirmation
    - Estimated time displayed (e.g., "~45 minutes")
    - Confirmation required to start
    - Progress modal shows: current tier, conversations completed/total, progress bar, elapsed time
    - Cancel button to stop generation (completes current conversation)
    - Completion summary: total generated, successful, failed, total cost
  * Functional Requirements Acceptance Criteria:
    - Generate All button must be in DashboardView header
      Code Reference: `train-wireframe/src/components/dashboard/DashboardView.tsx`
    - Modal must use BatchGenerationModal component
      Code Reference: `train-wireframe/src/components/generation/BatchGenerationModal.tsx`
    - Generation plan must calculate from tier definitions
      Code Reference: `train-wireframe/src/lib/types.ts:85-95` (Template tiers)
    - Cost estimation must use rate: $0.015 per 1K tokens (input) + $0.075 per 1K tokens (output)
    - Time estimation must use average: 20 seconds per conversation + API rate limits
    - Confirmation must require explicit "Start Generation" button click
    - Progress must be tracked via BatchJob state
      Code Reference: `train-wireframe/src/lib/types.ts:130-141` (BatchJob type)
    - Progress bar must show percentage: (completedCount / totalConversations) * 100
    - Cancel button must set BatchJob status to 'cancelled'
    - Completion summary must aggregate results from all tiers
    - Failed generations must be logged with error messages
    - Success toast must show final statistics

- **FR4.1.2:** Tier-Specific Batch Generation
  * Description: Generate all conversations for a single tier
  * Impact Weighting: Flexibility / Workflow Optimization
  * Priority: Medium
  * User Stories: US3.1.2
  * Tasks: [T-4.1.2]
  * User Story Acceptance Criteria:
    - Tier selector in generation modal: Template, Scenario, Edge Case
    - "Generate Tier" button
    - Progress shows only selected tier statistics
    - Option to regenerate failed conversations from previous batch
    - Option to generate only missing conversations (fill gaps)
    - Tier completion badge in UI: "Tier 1: 30/30 complete ✓"
  * Functional Requirements Acceptance Criteria:
    - Tier selector must use Select component
      Code Reference: `train-wireframe/src/components/ui/select.tsx`
    - Generate Tier must filter templates by selectedTier
      Code Reference: `train-wireframe/src/lib/types.ts:69` (Template tier field)
    - Progress must track only selected tier conversations
    - Regenerate failed option must query conversations with status 'failed'
    - Fill gaps option must calculate missing conversation_ids per tier
    - Completion badge must show count: conversations with tier X / total tier X templates
    - Badge must use Badge component with variant based on completion %
      Code Reference: `train-wireframe/src/components/ui/badge.tsx`
    - Generation API must accept tier filter parameter

### 4.2 Single Conversation Generation

- **FR4.2.1:** Manual Single Generation
  * Description: Generate a single conversation with custom parameters
  * Impact Weighting: Flexibility / Testing
  * Priority: Medium
  * User Stories: US3.2.1
  * Tasks: [T-4.2.1]
  * User Story Acceptance Criteria:
    - "Generate Single" button opens form
    - Form fields: Template (dropdown), Persona (dropdown), Emotion (dropdown), Custom parameters (optional)
    - Preview resolved prompt template
    - "Generate" button triggers single API call
    - Loading state shows "Generating conversation..."
    - Success displays conversation preview with option to save
    - Error displays message with retry option
  * Functional Requirements Acceptance Criteria:
    - Generate Single button must open SingleGenerationForm modal
      Code Reference: `train-wireframe/src/components/generation/SingleGenerationForm.tsx`
    - Template dropdown must list active templates
      Code Reference: `train-wireframe/src/lib/types.ts:64-73`
    - Persona dropdown must list available personas
      Code Reference: `train-wireframe/src/lib/types.ts:257-265` (Persona definitions)
    - Emotion dropdown must list emotion options
    - Custom parameters must allow key-value pair entry
    - Preview must resolve template with selected parameters
    - Generate button must call conversation generation API endpoint
    - Loading state must disable form and show spinner
    - Success must display ConversationPreview component
    - Error must show error message with retry button
    - Save option must persist conversation to database
    - Modal must support cancel/close actions

- **FR4.2.2:** Regenerate Existing Conversation
  * Description: Regenerate conversation while preserving metadata and context
  * Impact Weighting: Quality Improvement / Iteration
  * Priority: Medium
  * User Stories: US3.2.2
  * Tasks: [T-4.2.2]
  * User Story Acceptance Criteria:
    - Regenerate action in dropdown menu
    - Modal pre-fills parameters from existing conversation
    - Option to modify parameters before regenerating
    - Old conversation archived (status: 'archived')
    - New conversation linked to original via parentId
    - Version history displayed in conversation detail view
    - Toast notification: "Conversation regenerated. Previous version archived."
  * Functional Requirements Acceptance Criteria:
    - Regenerate action must be available in conversation dropdown
      Code Reference: `train-wireframe/src/components/dashboard/ConversationTable.tsx`
    - Modal must pre-populate form with existing conversation metadata
      Code Reference: `train-wireframe/src/lib/types.ts:44` (parameters field)
    - Parameters must be editable before regeneration
    - Original conversation status must update to 'archived'
    - New conversation must set parentId to original conversation_id
      Code Reference: `train-wireframe/src/lib/types.ts:45-46`
    - Version history query must follow parentId chain
    - Conversation detail must display version number and link to previous versions
    - Toast must confirm successful regeneration
    - API endpoint must support regeneration with archival logic

---
