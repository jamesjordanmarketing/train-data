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


## 6. Review & Quality Control

### 6.1 Review Queue

- **FR6.1.1:** Review Queue Interface
  * Description: Dedicated view for reviewing generated conversations that need attention
  * Impact Weighting: Quality Control / Workflow Efficiency
  * Priority: High
  * User Stories: US4.1.1
  * Tasks: [T-6.1.1]
  * Functional Requirements Acceptance Criteria:
    - Review queue must filter conversations with status 'needs_review'
      Code Reference: `train-wireframe/src/components/views/ReviewQueueView.tsx`
    - Queue must prioritize by quality score (lowest first) and creation date
    - Review interface must display conversation side-by-side with source chunk
      Code Reference: `train-wireframe/src/lib/types.ts:45-46` (parent references)
    - Review actions must include: Approve, Request Changes, Reject with comment
      Code Reference: `train-wireframe/src/lib/types.ts:25-28` (ReviewAction type)
    - Comments must support markdown formatting
    - Keyboard shortcuts must enable rapid review: A (approve), R (reject), N (next)
    - Batch review must allow selecting multiple and applying same action
    - Review history must be stored in reviewHistory array
      Code Reference: `train-wireframe/src/lib/types.ts:43`

- **FR6.1.2:** Quality Feedback Loop
  * Description: Capture reviewer feedback to improve generation quality
  * Impact Weighting: Continuous Improvement / Learning
  * Priority: Medium
  * User Stories: US4.1.2
  * Tasks: [T-6.1.2]
  * Functional Requirements Acceptance Criteria:
    - Feedback categories must include: Content Accuracy, Emotional Intelligence, Turn Quality, Format Issues
    - Feedback must be linked to specific template or scenario
    - Analytics must aggregate feedback by template to identify problem areas
    - Low-performing templates must be flagged for revision
      Code Reference: `train-wireframe/src/lib/types.ts:71` (Template rating)
    - Feedback trends must be displayed in dashboard widget
    - Reviewer inter-rater reliability metrics must be tracked

---
