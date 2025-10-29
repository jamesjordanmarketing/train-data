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


## 7. Templates, Scenarios, and Edge Cases Management

### 7.1 Template Management

- **FR7.1.1:** Template CRUD Operations
  * Description: Create, read, update, delete conversation templates
  * Impact Weighting: Core Functionality / Flexibility
  * Priority: High
  * User Stories: US7.1.1
  * Tasks: [T-7.1.1]
  * Functional Requirements Acceptance Criteria:
    - Template view must display all templates in table format
      Code Reference: `train-wireframe/src/components/views/TemplatesView.tsx`
    - Create template form must include: name, tier, prompt, variables, active status
      Code Reference: `train-wireframe/src/lib/types.ts:64-73` (Template type)
    - Template variables must be defined with type, required flag, default value
      Code Reference: `train-wireframe/src/lib/types.ts:76-82` (TemplateVariable type)
    - Duplicate template function must copy all properties except ID
    - Delete template must require confirmation and check for dependencies
    - Import/export templates as JSON for backup and sharing

- **FR7.1.2:** Scenario Library
  * Description: Manage scenario definitions for Tier 2 conversations
  * Impact Weighting: Content Organization / Scalability
  * Priority: Medium
  * User Stories: US7.3.1
  * Tasks: [T-7.1.2]
  * Functional Requirements Acceptance Criteria:
    - Scenarios view must display all scenarios grouped by category
      Code Reference: `train-wireframe/src/components/views/ScenariosView.tsx`
    - Scenario type must include: name, category, context, complexity, emotionalContext
      Code Reference: `train-wireframe/src/lib/types.ts:97-104` (Scenario type)
    - Link scenarios to specific templates for guided generation
    - Scenario complexity levels must be: simple, moderate, complex
    - Scenarios must support tagging for cross-category relationships
    - Bulk import scenarios from CSV

- **FR7.1.3:** Edge Case Repository
  * Description: Manage edge case definitions for Tier 3 conversations
  * Impact Weighting: Robustness / Coverage
  * Priority: Medium
  * User Stories: US7.4.1
  * Tasks: [T-7.1.3]
  * Functional Requirements Acceptance Criteria:
    - Edge cases view must display all edge cases
      Code Reference: `train-wireframe/src/components/views/EdgeCasesView.tsx`
    - Edge case type must include: name, description, triggerCondition, expectedBehavior, riskLevel
      Code Reference: `train-wireframe/src/lib/types.ts:109-116` (EdgeCase type)
    - Risk levels must be: low, medium, high, critical
    - Edge cases must be linkable to scenarios they modify
    - Coverage report must show which edge cases have been tested
    - Version edge cases to track changes over time

---
