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


## 5. Export System

### 5.1 Export Configuration

- **FR5.1.1:** Flexible Export Formats
  * Description: Export conversations in multiple formats for different use cases
  * Impact Weighting: Data Portability / Integration
  * Priority: High
  * User Stories: US5.1.1
  * Tasks: [T-5.1.1]
  * User Story Acceptance Criteria:
    - Export formats: JSONL (LoRA training), JSON (structured data), CSV (analysis), Markdown (human review)
    - Format selector with descriptions
    - Preview export structure before download
    - Format-specific options (e.g., JSONL: include system prompts, flatten conversations)
    - File naming convention: train-data-{tier}-{date}-{count}.{ext}
    - Automatic compression for large exports (>1000 conversations)
  * Functional Requirements Acceptance Criteria:
    - Export modal must use ExportModal component
      Code Reference: `train-wireframe/src/components/export/ExportModal.tsx`
    - Format selector must use radio group or dropdown
    - Export formats must match ExportConfig type
      Code Reference: `train-wireframe/src/lib/types.ts:181-194`
    - JSONL format must output one conversation per line
    - JSON format must output array of conversation objects
    - CSV format must flatten conversations into rows (one turn per row)
    - Markdown format must format conversations as readable dialogue
    - Format descriptions must explain use case for each format
    - Preview must show first 3 conversations in selected format
    - File naming must use template: {prefix}-{tier}-{YYYY-MM-DD}-{count}.{extension}
    - Compression must trigger automatically if conversation count > 1000
    - Compressed files must use .zip format

- **FR5.1.2:** Export Filtering and Selection
  * Description: Export specific subsets of conversations based on filters or selection
  * Impact Weighting: Precision / Efficiency
  * Priority: High
  * User Stories: US5.1.2
  * Tasks: [T-5.1.2]
  * User Story Acceptance Criteria:
    - Export options: Selected conversations, Current filters, All approved, All data
    - Conversation count displayed for each option
    - Apply additional filters in export modal
    - Option to exclude archived/rejected conversations
    - Option to include/exclude metadata fields
    - Sort order selection for export
  * Functional Requirements Acceptance Criteria:
    - Export scope selector must use radio group
    - Selected conversations option must use selectedConversationIds
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:41`
    - Current filters option must apply active filterConfig
      Code Reference: `train-wireframe/src/stores/useAppStore.ts:42`
    - All approved option must filter by status: 'approved'
    - All data option must export without filters
    - Conversation count must be calculated dynamically per option
    - Additional filters must be available in export modal
    - Exclude options must use checkboxes for status types
    - Metadata inclusion must use checklist of fields
    - Sort order must match table sort options (created_at, quality_score, etc.)
    - Export API must accept filter parameters

### 5.2 Export Execution

- **FR5.2.1:** Background Export Processing
  * Description: Handle large exports without blocking UI
  * Impact Weighting: Performance / User Experience
  * Priority: Medium
  * User Stories: US5.2.1
  * Tasks: [T-5.2.1]
  * User Story Acceptance Criteria:
    - Export starts in background for large datasets (>500 conversations)
    - Toast notification: "Export started. You'll be notified when complete."
    - Export progress visible in notification panel
    - Download link appears in notification when complete
    - Export history accessible from settings
    - Retry failed exports
  * Functional Requirements Acceptance Criteria:
    - Large export threshold must be 500 conversations
    - Background processing must use BatchJob system
      Code Reference: `train-wireframe/src/lib/types.ts:130-141`
    - Toast notification must confirm export initiation
    - Progress must be tracked in BatchJob with percentage
    - Notification panel must list active and completed exports
    - Completed export must generate download URL
    - Download link must expire after 24 hours
    - Export history must be stored in database with retention policy (30 days)
    - Retry must reuse original export configuration
      Code Reference: `train-wireframe/src/lib/types.ts:181-194` (ExportConfig)
    - Failed exports must log error message

- **FR5.2.2:** Export Audit Trail
  * Description: Track all export operations for compliance and auditing
  * Impact Weighting: Security / Compliance
  * Priority: Low
  * User Stories: US5.2.2
  * Tasks: [T-5.2.2]
  * User Story Acceptance Criteria:
    - Export log records: timestamp, user, format, filter criteria, conversation count, file size
    - Export history view with sortable columns
    - Filter export history by date range, user, format
    - Download previous export files (if retained)
    - Export log CSV for compliance reporting
  * Functional Requirements Acceptance Criteria:
    - Export audit must create log entry in export_logs table
    - Log fields must include: id, timestamp, user_id, format, config, count, file_size, status
      Code Reference: `src/lib/database.ts` (Audit log pattern)
    - Export history view must be accessible from settings
    - History table must support sorting by timestamp, user, format, count
    - Filter must support date range picker and multi-select for format
    - Previous export files must be retrievable if within retention period (7 days)
    - Compliance report must export logs as CSV
    - Log entries must be immutable (append-only)

---
