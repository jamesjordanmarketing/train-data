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


## 9. Integration with Chunks-Alpha Module

### 9.1 Chunk Linking

- **FR9.1.1:** Conversation to Chunk Association
  * Description: Link generated conversations to source chunks from chunks-alpha
  * Impact Weighting: Traceability / Context
  * Priority: High
  * User Stories: US9.1.1
  * Tasks: [T-9.1.1]
  * Functional Requirements Acceptance Criteria:
    - Conversation must store parentId referencing chunk_id
      Code Reference: `train-wireframe/src/lib/types.ts:45-46`
    - Chunk selector must display available chunks from chunks-alpha module
      Code Reference: `01-bmo-overview-chunk-alpha_v2.md` (Chunks schema)
    - Chunk context must be automatically injected into generation prompt
    - Conversation detail must display linked chunk metadata
    - Chunk dimensions must be accessible for context enrichment
      Code Reference: `01-bmo-overview-chunk-alpha_v2.md` (60-dimension analysis)
    - Multiple conversations can link to same chunk
    - Orphaned conversations (no chunk link) must be flagged

- **FR9.1.2:** Dimension-Driven Generation
  * Description: Use chunk dimensions to inform conversation generation parameters
  * Impact Weighting: Quality / Contextual Relevance
  * Priority: Medium
  * User Stories: US9.1.2
  * Tasks: [T-9.1.2]
  * Functional Requirements Acceptance Criteria:
    - Chunk dimensions must be retrieved from chunks-alpha database
      Code Reference: `src/lib/dimension-generation/generator.ts`
    - Semantic dimensions must inform persona and emotion selection
    - Complexity dimension must influence conversation turn count
    - Domain dimensions must auto-tag conversations
    - Confidence scores must factor into quality scoring
      Code Reference: `train-wireframe/src/lib/types.ts:21` (confidence in QualityMetrics)
    - Dimension analysis must be logged in generation audit

---
