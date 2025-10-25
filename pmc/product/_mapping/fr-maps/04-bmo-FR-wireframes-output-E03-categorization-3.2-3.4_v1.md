=== BEGIN PROMPT FR: FR3.3.2-3.3.4 MERGED ===

Title
- FR FR3.3.2-3.3.4 Wireframes — Stage 3 — Complete Document Categorization Workflow System

Context Summary
- Design comprehensive guided three-step categorization workflow that transforms technical document categorization into accessible business process. This unified system includes Statement of Belonging assessment, 11 business-friendly primary category selection, and multi-dimensional secondary tagging. The interface focuses on business value and proprietary knowledge identification rather than technical AI terminology, maintaining professional presentation for mature business owners throughout the complete workflow.

Journey Integration
- Stage 3 user goals: Guided categorization, Document understanding, Progress completion, Category understanding, Accurate selection, Value identification, Metadata completion, Tag organization, Content enrichment
- Key emotions: Workflow confidence, Decision clarity, Achievement satisfaction, Clear understanding, Selection satisfaction, Organization clarity, Completion satisfaction, Detail confidence
- Progressive disclosure levels: Basic, Advanced, Expert
- Persona adaptations: Unified interface serving all personas with business-focused language and sophisticated metadata management

### Journey-Informed Design Elements
- User Goals: Complete categorization workflow with document understanding, accurate category selection, and comprehensive metadata application
- Emotional Requirements: Workflow confidence, decision clarity, achievement satisfaction, and organization clarity throughout the process
- Progressive Disclosure:
  * Basic: Step-by-step guidance with clear instructions, simple category options, and essential tag categories
  * Advanced: Contextual help, detailed explanations, all tag dimensions with detailed options
  * Expert: Quick workflow completion, tooltip references, custom tags and bulk operations
- Success Indicators: Steps completed, Categories selected, Tags applied, Metadata complete, Workflow finished
  
Wireframe Goals
- Guide users through unified three-step categorization process with seamless progression
- Implement Statement of Belonging assessment for document-expertise relationship evaluation
- Present 11 primary categories in clear business-friendly language with confidence-building selection
- Enable comprehensive secondary tags application across 7 metadata dimensions
- Maintain document context throughout workflow with persistent reference panel
- Provide intelligent suggestions and impact visualization for categorization decisions
- Support workflow navigation with data persistence, validation, and error recovery

Explicit UI Requirements (from acceptance criteria)
**Overall Workflow Structure:**
- Workflow navigation with numbered steps (A, B, C), progress bar, and completion indicators showing current position and overall progression
- Document content reference panel with formatted text, highlighting, and scrolling capabilities persistent throughout all steps
- Form validation ensuring required fields completed before progression with inline messages and disabled navigation
- Data persistence maintaining all selections across workflow steps and browser sessions with auto-save functionality
- Navigation controls supporting forward/backward movement with confirmation dialogs for unsaved changes
- Context preservation displaying document title and summary throughout workflow with persistent context panel
- Progress indicators showing completion status for each step with visual checkmarks and percentage completion
- Exit/save draft functionality allowing pause and return with clear save status indicators
- Error handling managing validation failures with clear recovery guidance and alternative paths

**Step A: Statement of Belonging Assessment:**
- Rating interface with "How close is this document to your own special voice and skill" question using intuitive rating scale or slider
- Clear assessment criteria explanation with business-friendly language
- Visual feedback showing relationship strength assessment
- Contextual help explaining the importance of this evaluation for training data quality

**Step B: Primary Category Selection (11 Business-Friendly Categories):**
- Category presentation with 11 options using radio button or card selection format with distinctive visual styling
- Category descriptions providing business-friendly explanations with examples and use cases relevant to domain expertise
- Selection interface supporting single-choice selection with clear visual feedback and immediate confirmation
- Tooltips and help text offering additional context for complex categories with expandable descriptions
- Visual hierarchy emphasizing high-value categories (complete systems, proprietary strategies) with priority styling
- Impact indicators showing how category selection affects document processing with explanation of effects
- Category validation ensuring selection made before progression with inline validation and error messaging

**Step C: Secondary Tags and Metadata Management (7 Dimensions):**
- Tag selection interface with organized tag categories using collapsible sections and clear category labeling
- Multi-select functionality supporting multiple tags per category with checkbox or multi-select dropdown interface
- Authorship tags (Brand, Team, Customer, Mixed, Third-Party) with clear selection indicators
- Format tags (How-to, Strategy Note, Case Study, Story, Sales Page, Email, Transcript, Slide, Whitepaper, Brief) with format-specific icons
- Disclosure Risk scoring using 1-5 scale with explanatory descriptions and visual risk indicators
- Evidence Type tags (Metrics, Quote, Before/After, Screenshot, Data Table, Reference) with evidence-specific validation
- Intended Use categories (Marketing, Sales Enablement, Delivery/Operations, Training, Investor, Legal) with use-case specific styling
- Audience levels (Public, Lead, Customer, Internal, Executive) with audience-appropriate visual indicators
- Gating Level options (Public, Ungated-Email, Soft-Gated, Hard-Gated, Internal-Only, NDA-Only) with security-level color coding
- Tag suggestion engine providing intelligent recommendations based on content analysis and primary category selection
- Custom tag creation supporting business-specific terminology with validation and duplicate prevention
- Tag impact display showing how tag combinations affect training data processing with algorithmic transparency

**Workflow Completion:**
- Final review summary showing all selections across all steps
- Workflow completion triggering backend processing with visual feedback and success confirmation
- Success celebration with achievement indicators and next steps guidance

Interactions and Flows
**Primary Workflow Navigation:**
- Navigate between three workflow steps with validation at each stage ensuring data completeness
- Complete Statement of Belonging assessment using intuitive slider or rating controls
- Select primary category from visual 11-option selection interface with detailed descriptions
- Apply secondary tags using multi-dimensional tagging system with intelligent suggestions
- Reference document content throughout process using persistent side panel with scroll and highlight
- Save progress and exit workflow with ability to resume exactly where left off
- Submit completed categorization and trigger backend processing with confirmation

**Step-Specific Interactions:**
- Step A: Adjust relationship rating with real-time feedback and impact explanation
- Step B: Browse through 11 category options, access detailed explanations, validate selection and understand processing impact
- Step C: Navigate through 7 tag category sections with expand/collapse, apply multiple tags per category, access intelligent suggestions, create custom tags, review tag impact on training data value

**Cross-Step Features:**
- Persistent document content referencing with synchronized highlighting
- Auto-save indicators showing data persistence status across all steps
- Forward/backward navigation with validation checkpoints
- Draft save and resume functionality with clear status communication

Visual Feedback
**Progress and Navigation Feedback:**
- Progress bar showing completion percentage across three steps with step indicators
- Step completion checkmarks and visual confirmation with smooth transitions
- Validation error messages with clear correction guidance and field highlighting
- Auto-save indicators showing data persistence status with subtle animations
- Loading states during backend processing submission with progress indication
- Success confirmation upon workflow completion with celebration elements

**Step-Specific Visual Feedback:**
- Step A: Rating scale visual feedback with relationship strength indicators
- Step B: Clear visual selection states with radio buttons or selected card styling, hover states showing additional information, selection confirmation with checkmarks, impact preview showing processing implications
- Step C: Section expand/collapse animations, tag selection states with checkmarks, tag suggestion highlights with confidence indicators, risk level color coding, tag impact preview showing processing implications

**System-Wide Visual Elements:**
- Document context panel with persistent content display
- Navigation breadcrumbs showing current step position
- Error state indicators with clear resolution guidance
- Success celebrations upon milestone and final completion

Accessibility Guidance
- Progressive form navigation with comprehensive keyboard support across all steps
- Clear focus indicators on all interactive elements with logical tab order
- Screen reader announcements for step progression, selection changes, and validation states
- Error message association with relevant form fields using ARIA labels
- Alt text for all visual progress indicators, category icons, and status badges
- Screen reader compatible descriptions and selection states for complex interfaces
- Keyboard navigation through collapsible sections and multi-select interfaces
- Color contrast meeting WCAG 2.1 AA standards for all status displays and interactive elements

Information Architecture
**Overall Workflow Layout:**
- Header with workflow title, document context, and overall progress indicator
- Step navigation showing current step and overall progression with breadcrumbs
- Main content area with step-specific interface and contextual instructions
- Document reference panel maintaining content context throughout workflow
- Navigation footer with back/next controls, save options, and completion actions
- Sidebar with workflow help, guidance information, and intelligent suggestions

**Step-Specific Architecture:**
- Step A: Assessment interface with rating controls and explanation panel
- Step B: Category selection grid with description panel, impact preview section, and help sidebar
- Step C: Collapsible tag category sections, suggestion panel, impact preview, custom tag creation interface

Page Plan
- **Step A: Statement of Belonging Assessment** - Document relationship evaluation interface with rating scale and impact explanation
- **Step B: Primary Category Selection** - 11 business-friendly category selection interface with descriptions, examples, and impact preview
- **Step C: Secondary Tags Application** - Multi-dimensional metadata tagging interface with 7 tag categories, suggestions, and custom tag creation
- **Workflow Completion Summary** - Final review and submission confirmation with comprehensive selection summary and success celebration
- **Supporting Modals/Panels:**
  - Category Detail Modal: Expanded information for complex categories
  - Custom Tag Creation Modal: Interface for creating specialized business tags
  - Tag Impact Preview Panel: Summary of tag combinations and processing effects

Annotations (Mandatory)
- Instruct: Attach notes on elements citing the acceptance criterion they fulfill and include a "Mapping Table" frame in Figma: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
**Workflow Structure & Navigation:**
- "Guide users through three distinct categorization steps" → All Step Pages → Step Navigation Component → Active/Completed/Disabled states
- "Maintain context and progress throughout workflow" → All Pages → Progress Tracker Component → Step progression states with percentage completion
- "Document content reference panel" → All Pages → Content Reference Panel → Persistent display state with highlighting capability
- "Enable workflow navigation with data persistence" → All Pages → Navigation Component → Enabled/Disabled states with validation and auto-save
- "Form validation before progression" → All Pages → Validation System Component → Error/Success states with inline messaging
- "Exit/save draft functionality" → All Pages → Draft Save Component → Save/Exit confirmation states

**Step A: Statement of Belonging:**
- "Step A: Statement of Belonging assessment" → Step A Page → Rating Scale Component → Interactive selection state with relationship strength feedback

**Step B: Primary Category Selection:**
- "Present 11 primary categories (a-k) in business language" → Step B Page → Category Grid Component → Display state with all 11 options and distinctive styling
- "Enable single-selection with visual selection indicators" → Step B Page → Radio Button/Card Component → Unselected/Selected/Hover states
- "Provide detailed descriptions and examples for each category" → Step B Page → Description Panel Component → Category-specific content states
- "Support selection with confidence indicators or tooltips" → Step B Page → Tooltip Component → Hover state with additional information
- "Display category selection impact on document processing" → Step B Page → Impact Preview Component → Category-specific impact states
- "Visual hierarchy emphasizing high-value categories" → Step B Page → Priority Styling Component → High/Medium/Low value states

**Step C: Secondary Tags and Metadata:**
- "Apply multiple secondary tags across different metadata dimensions" → Step C Page → Tag Category Sections → Expanded/Collapsed states with all 7 dimensions
- "Support multi-select tag application within each category" → Step C Page → Multi-select Components → Selected/Unselected states with multiple selections
- "Authorship tags with clear selection indicators" → Step C Page → Tag Selection Component → Author-specific selection states
- "Format tags with format-specific icons" → Step C Page → Tag Icons Component → Format-specific visual states
- "Disclosure Risk scoring with 1-5 scale and visual indicators" → Step C Page → Risk Scale Component → 1-5 risk level states
- "Tag suggestion engine with intelligent recommendations" → Step C Page → Suggestion Panel Component → Recommendation display states
- "Custom tag creation with validation" → Custom Tag Modal → Tag Creation Component → Create/Validate/Error states
- "Tag impact display with algorithmic transparency" → Step C Page → Impact Preview Component → Processing impact states

**Workflow Completion:**
- "Workflow completion triggering backend processing" → Completion Summary → Submission Component → Processing/Success states with confirmation

Non-UI Acceptance Criteria
- Integration with backend processing engine for complete categorization data submission
- Data persistence across browser sessions and workflow interruptions with reliable state management
- Workflow state management maintaining progress and all selections throughout the process
- Validation rules ensuring complete categorization across all steps before submission
- Category selection directly influences backend AI processing algorithms for content extraction optimization
- Secondary tags feed into backend processing algorithms for training data quality optimization
- Categories and tags reflect natural business thinking patterns rather than technical classification
- Business focus maintains professional language avoiding technical AI/ML terminology throughout

Estimated Page Count
- **4 primary pages minimum**: Step A (Statement of Belonging), Step B (Primary Category Selection), Step C (Secondary Tags Application), Workflow Completion Summary
- **3 supporting interfaces**: Category Detail Modal, Custom Tag Creation Modal, Tag Impact Preview Panel
- **Total: 7+ comprehensive interface components** providing complete workflow coverage with seamless integration and progression between all categorization elements

=== END PROMPT FR: FR3.3.2-3.3.4 MERGED ===
