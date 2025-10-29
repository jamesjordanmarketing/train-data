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


## 8. Settings & Administration

### 8.1 User Preferences

- **FR8.1.1:** Customizable User Settings
  * Description: Allow users to configure their workspace preferences
  * Impact Weighting: User Experience / Personalization
  * Priority: Low
  * User Stories: US11.3.1
  * Tasks: [T-8.1.1]
  * Functional Requirements Acceptance Criteria:
    - Settings view must be accessible from user menu
      Code Reference: `train-wireframe/src/components/views/SettingsView.tsx`
    - User preferences type must include all configurable options
      Code Reference: `train-wireframe/src/lib/types.ts:207-224` (UserPreferences type)
    - Theme selection must support: light, dark, system
    - Default filters must be configurable and applied on load
    - Items per page must be selectable: 10, 25, 50, 100
    - Notification preferences must control toast, email, in-app notifications
    - Keyboard shortcuts must be customizable
    - Export preferences must set default format and options
    - Settings must auto-save on change
    - Reset to defaults option must be available

### 8.2 System Configuration

- **FR8.2.1:** AI Generation Settings
  * Description: Configure Claude API parameters for generation
  * Impact Weighting: Quality Control / Cost Management
  * Priority: Medium
  * User Stories: US8.1.1
  * Tasks: [T-8.2.1]
  * Functional Requirements Acceptance Criteria:
    - AI config must specify model, temperature, max tokens, top_p
      Code Reference: `src/lib/ai-config.ts`
    - Rate limiting must be configurable: requests per minute, concurrent requests
    - Retry strategy must be configurable: max retries, backoff strategy
    - Cost budget alerts must be configurable per day/week/month
    - API key rotation must be supported
    - Model selection must include: Claude-3.5-Sonnet, Claude-3-Opus, Claude-3-Haiku
    - Generation timeout must be configurable

- **FR8.2.2:** Database Maintenance
  * Description: Tools for database health and optimization
  * Impact Weighting: System Health / Performance
  * Priority: Low
  * User Stories: US8.2.1
  * Tasks: [T-8.2.2]
  * Functional Requirements Acceptance Criteria:
    - Database stats dashboard must show: table sizes, index health, query performance
      Code Reference: `src/lib/database.ts`
    - Manual vacuum and analyze operations must be triggerable
    - Backup and restore functionality must be available
    - Archive old conversations based on retention policy
    - Audit log cleanup must be scheduled (configurable retention)
    - Connection pool monitoring must display active/idle connections

---
