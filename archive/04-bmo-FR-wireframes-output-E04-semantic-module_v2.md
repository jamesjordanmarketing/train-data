=== BEGIN PROMPT FR: FR4.1.2 ===

Title
- FR FR4.1.2 Wireframes — Document Categorization & Semantic Labeling Workflow

Context Summary
- FR4.1.2 implements a comprehensive document categorization and semantic labeling workflow that transforms raw uploaded files into AI-analyzed, dimension-labeled knowledge assets ready for validation. This staged workflow provides actual file upload functionality, AI-powered multi-dimensional categorization (category, concepts, methods, frameworks), human review interfaces, and clear status tracking through multiple processing states. The system enables non-technical users to upload documents and guide them through an intelligent categorization wizard where AI suggestions can be validated or corrected before advancing to lesson creation.

Journey Integration
- Stage 2 user goals: Upload business documents, categorize knowledge assets, validate AI categorization, prepare for lesson creation
- Key emotions: Confidence in upload process, curiosity about AI analysis, satisfaction with categorization accuracy, control over labeling
- Progressive disclosure levels: Basic upload and auto-categorization, advanced dimension refinement, expert-level taxonomy customization
- Persona adaptations: Optimized for business owners and domain experts who need precise categorization control with AI assistance

### Journey-Informed Design Elements
- User Goals: Upload documents, Review AI categorization, Validate dimensions, Control semantic labeling
- Emotional Requirements: Upload confidence, Analysis transparency, Categorization control, Validation satisfaction
- Progressive Disclosure:
  * Basic: Simple upload with automatic categorization
  * Advanced: Dimension-by-dimension validation wizard
  * Expert: Custom dimension creation and taxonomy control
- Success Indicators: Files uploaded, Categorization completed, Dimensions validated, Ready for next stage

Wireframe Goals
- Create functional file upload interface with drag-and-drop and file selection capabilities for multiple document formats
- Provide staged workflow visualization showing clear step labels: Upload → AI Processing → Human Review → Validation Complete
- Enable comprehensive categorization wizard with separate steps for category, concepts, methods, and framework validation
- Display AI-generated dimension suggestions pre-populated in wizard for human approval or modification
- Offer dedicated review page for detailed dimension adjudication with evidence text and AI reasoning
- Support multiple file status states with visual indicators and progress tracking through the workflow

Explicit UI Requirements (from acceptance criteria)
- **File Upload Interface** with actual upload functionality supporting PDF, Word, text, HTML, and transcript formats with progress indicators
- **Staged Workflow Display** showing labeled steps: "1. Upload Files" → "2. AI Categorization" → "3. Human Review" → "4. Validation Complete"
- **File Status Table** displaying all uploaded files with current status: "New (Ready for Categorization)", "Processing (AI Analyzing)", "Review Required", "Validated (Ready for FR4.1.3)"
- **Categorization Wizard Interface** with separate screens for each dimension type:
  - Category Selection (Primary & Secondary categories)
  - Concept Identification (Up to 5 key concepts)
  - Method Recognition (Up to 5 methods)
  - Framework Classification (Up to 2 frameworks)
- **AI Pre-population Display** showing AI-suggested values for each dimension with confidence scores
- **Human Review Page** with comprehensive dimension adjudication interface including:
  - Dimension type label (left column)
  - Supporting text evidence from document (center column)
  - Editable AI summary/reasoning (right column)
- **Dimension Line Items** displaying 10+ dimensions per document:
  - 2 categories (1 primary, 1 secondary)
  - 5 important document concepts
  - 5 methods identified
  - 2 frameworks recognized
- **Mock Data Sets** for demonstration with files in each status state
- **Workflow Control Actions** allowing humans to advance files through stages manually

Interactions and Flows
- Upload files through drag-and-drop or file browser with format validation and size checking
- View uploaded files in status table with sorting and filtering by processing state
- Initiate categorization for "new" files triggering AI analysis and dimension extraction
- Monitor AI processing with real-time status updates and estimated completion times
- Access categorization wizard when files reach "review required" status
- Navigate through wizard steps reviewing and validating each dimension category
- Approve or modify AI suggestions with inline editing and dropdown selections
- View supporting evidence text highlighting why AI made specific categorization choices
- Edit AI reasoning summaries to better reflect human understanding
- Save progress and return to review later with draft status preservation
- Complete validation moving files to "validated" status ready for FR4.1.3
- Bulk process multiple files with similar characteristics using saved preferences

Visual Feedback
- Upload progress bars showing individual and batch upload completion percentages
- File format icons distinguishing document types (PDF, Word, text, HTML, transcript)
- Status badges with distinct colors: Blue (New), Orange (Processing), Yellow (Review Required), Green (Validated)
- Workflow progress visualization showing current stage with completed/pending step indicators
- AI confidence meters displaying certainty levels for each suggested dimension (0-100%)
- Evidence highlighting showing relevant text passages supporting categorization decisions
- Validation checkmarks appearing as each dimension is reviewed and approved
- Processing animations during AI analysis with spinning indicators and progress messages
- Success notifications when files advance to next workflow stage
- Warning indicators for files requiring additional review or having categorization conflicts

Accessibility Guidance
- ARIA labels for upload controls, wizard navigation, and dimension validation interfaces
- Keyboard navigation support for wizard steps, dimension editing, and workflow actions
- Screen reader announcements for status changes, upload progress, and validation completions
- High contrast support for status badges, evidence highlighting, and confidence indicators
- Focus management during wizard progression and dimension validation workflows
- Alternative text for file type icons, status indicators, and workflow visualizations
- Clear heading hierarchy for workflow stages, wizard steps, and review sections
- Skip navigation links for quickly accessing review sections and validation controls

Information Architecture
- Primary upload section with drag-and-drop zone, file browser, and format guidelines
- Secondary status management section with file table, filtering controls, and bulk actions
- Tertiary categorization wizard section with dimension-by-dimension validation screens
- Quaternary review interface section with comprehensive dimension adjudication tools
- Progress tracking section showing workflow completion and pending tasks
- Navigation breadcrumbs indicating current position in categorization workflow

Page Plan
- **File Upload & Status Dashboard**: Upload interface, file status table, and workflow visualization
- **Categorization Wizard**: Multi-step wizard for dimension validation with AI suggestions
- **Comprehensive Review Interface**: Dedicated page for detailed dimension adjudication with evidence and editing
- **Workflow Management**: Status tracking and file progression controls

Annotations (Mandatory)
- Attach notes on elements citing the acceptance criterion they fulfill and include a "Mapping Table" frame in Figma: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
- "Functional file upload with drag-and-drop and browser selection" → File Upload & Status Dashboard → Upload zone component → Drag-hover, uploading, complete states
- "Staged workflow with labeled steps" → File Upload & Status Dashboard → Workflow visualization → Step indicators with labels, active/complete/pending states
- "File status table with all processing states" → File Upload & Status Dashboard → Status table component → New, processing, review required, validated states
- "Categorization wizard with dimension steps" → Categorization Wizard → Step navigation → Category, concepts, methods, framework screens
- "AI pre-populated suggestions with confidence" → Categorization Wizard → Suggestion displays → Pre-filled values with confidence meters
- "Human review page with dimension adjudication" → Comprehensive Review Interface → Adjudication layout → Three-column display with edit capabilities
- "10+ dimension line items per document" → Comprehensive Review Interface → Dimension list → 2 categories, 5 concepts, 5 methods, 2 frameworks
- "Supporting evidence text display" → Comprehensive Review Interface → Evidence column → Highlighted text excerpts from documents
- "Editable AI reasoning summaries" → Comprehensive Review Interface → Summary column → Text areas with edit/save functionality
- "Mock data for each file state" → All screens → Sample files → Examples in new, processing, review, validated states
- "Manual workflow advancement controls" → Workflow Management → Action buttons → "Start Categorization", "Submit for Review", "Validate" actions

Non-UI Acceptance Criteria
- AI categorization engine analyzing documents for multi-dimensional labeling - Backend AI with UI suggestion display
- Dimension extraction algorithms identifying categories, concepts, methods, and frameworks - Backend processing with UI dimension presentation
- Evidence matching system linking text passages to categorization decisions - Backend analysis with UI evidence display
- Confidence scoring algorithms rating AI suggestion certainty - Backend scoring with UI confidence visualization
- Workflow state management tracking file progression through stages - Backend state machine with UI status updates

Estimated Page Count
- 4 pages required to satisfy all UI-relevant acceptance criteria: File Upload & Status Dashboard for upload and overview, Categorization Wizard for step-by-step dimension validation, Comprehensive Review Interface for detailed adjudication, Workflow Management for status tracking and progression control.

=== END PROMPT FR: FR4.1.2 ===

=== BEGIN PROMPT FR: FR4.1.2a ===

Title
- FR FR4.1.2a Wireframes — Advanced Categorization Review & Validation Interface

Context Summary
- FR4.1.2a extends the categorization workflow with a sophisticated review interface specifically designed for the critical "file ready for review by human" stage. This interface provides comprehensive dimension validation tools, evidence-based adjudication capabilities, and streamlined approval workflows that make the complex task of validating AI categorization as easy as possible while maintaining accuracy and completeness.

Journey Integration
- Stage 2 (continued) user goals: Efficiently review AI categorization, validate with evidence, approve for next stage
- Key emotions: Confidence in AI accuracy, satisfaction with evidence transparency, control over final categorization
- Progressive disclosure levels: Quick approval for accurate categorizations, detailed review for complex cases, expert override for edge cases
- Persona adaptations: Optimized for domain experts who need efficient yet thorough validation capabilities

### Journey-Informed Design Elements
- User Goals: Review efficiently, Validate accurately, Understand AI reasoning, Maintain quality
- Emotional Requirements: Review confidence, Evidence satisfaction, Control assurance, Efficiency achievement
- Progressive Disclosure:
  * Basic: Quick approve/reject with AI confidence indicators
  * Advanced: Evidence-based validation with inline editing
  * Expert: Complete dimension override and custom taxonomy
- Success Indicators: Reviews completed, Accuracy validated, Evidence understood, Files approved

Wireframe Goals
- Create dedicated review interface optimizing the most important and difficult validation work
- Provide comprehensive evidence display linking each dimension to source text
- Enable efficient validation workflow with bulk approval and quick edit capabilities
- Display AI confidence and reasoning transparency for trust building
- Offer flexible approval paths from quick validation to detailed refinement
- Support batch processing for similar documents with learned preferences

Explicit UI Requirements (from acceptance criteria)
- **Primary Review Dashboard** showing queue of files in "review required" status with priority indicators
- **Comprehensive Dimension Display** for each file showing all 10+ dimensions in organized layout:
  - Dimension type clearly labeled (Category, Concept, Method, Framework)
  - Non-editable evidence box showing source text supporting the dimension
  - Editable AI summary box for refining the interpretation
- **Evidence Highlighting System** showing relevant passages with:
  - Color-coded highlighting for different dimension types
  - Expandable context for viewing surrounding text
  - Link back to source document location
- **Validation Controls** for each dimension:
  - Approve button for accepting AI suggestion
  - Edit mode for modifying interpretation
  - Reject with replacement for incorrect dimensions
  - Add note for clarification or context
- **Batch Operations Interface** supporting:
  - Select multiple similar dimensions for bulk approval
  - Apply validated patterns to similar documents
  - Save validation preferences for future use
- **Quality Assurance Indicators**:
  - Completeness meter showing validation progress
  - Accuracy confidence score based on evidence strength
  - Consistency checker comparing similar documents
- **File State Transitions** with clear actions:
  - "Send Back for Reprocessing" for major issues
  - "Approve for Next Stage" when validation complete
  - "Save as Draft" for returning later

Interactions and Flows
- Access review dashboard from notification or status table showing priority queue
- Select file for review opening comprehensive dimension display
- Review each dimension with evidence and AI reasoning visible simultaneously
- Approve accurate dimensions with single click maintaining flow
- Edit interpretations inline without leaving review context
- Expand evidence text to see broader context when needed
- Add clarifying notes for complex or ambiguous categorizations
- Use batch operations for repetitive validations across similar content
- Monitor validation progress through completeness indicators
- Submit completed review advancing file to "validated" status
- Return to draft reviews maintaining all previous validation work

Visual Feedback
- Priority badges indicating review urgency (High/Medium/Low)
- Dimension confidence bars showing AI certainty levels
- Evidence highlighting with dimension-specific colors
- Validation status icons (Approved/Pending/Rejected/Modified)
- Progress rings showing percentage of dimensions validated
- Consistency indicators comparing to previously validated files
- Edit mode highlighting showing active modification areas
- Success animations for completed validations
- Warning dialogs for conflicting or inconsistent categorizations
- Tooltip explanations for AI reasoning and evidence connections

Accessibility Guidance
- ARIA labels for all validation controls and evidence displays
- Keyboard shortcuts for common actions (Approve: Enter, Edit: E, Next: Tab)
- Screen reader announcements for validation status changes
- High contrast mode for evidence highlighting and status indicators
- Focus management maintaining position during validation flow
- Alternative text for confidence visualizations and progress indicators
- Clear heading structure for dimension groups and evidence sections
- Skip links for navigating between dimensions quickly

Information Architecture
- Primary review queue section with filtering and sorting capabilities
- Secondary dimension validation section with evidence and controls
- Tertiary batch operations section with pattern management tools
- Quaternary progress tracking section with completeness metrics
- Navigation maintaining context between file reviews
- Breadcrumbs showing position in overall workflow

Page Plan
- **Review Queue Dashboard**: Priority-sorted list of files requiring validation with quick stats
- **Comprehensive Validation Interface**: Full dimension review with evidence and editing capabilities
- **Batch Processing Tools**: Interface for handling multiple similar validations efficiently

Annotations (Mandatory)
- Attach notes on elements citing the acceptance criterion they fulfill and include a "Mapping Table" frame in Figma: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
- "Dedicated review interface for critical validation work" → Comprehensive Validation Interface → Full review layout → Dimension display, evidence, controls
- "10+ dimensions with type labels and organization" → Comprehensive Validation Interface → Dimension list → Categories, concepts, methods, frameworks
- "Evidence text box showing supporting passages" → Comprehensive Validation Interface → Evidence column → Highlighted excerpts, expandable context
- "Editable AI summary for interpretation refinement" → Comprehensive Validation Interface → Summary column → Inline editing, save functionality
- "Efficient validation with bulk approval" → Batch Processing Tools → Batch controls → Multi-select, pattern application
- "Quality indicators for completeness and accuracy" → Review Queue Dashboard → Quality metrics → Progress bars, confidence scores
- "Clear state transition actions" → Comprehensive Validation Interface → Action bar → Approve, reject, save draft buttons

Non-UI Acceptance Criteria
- Validation tracking system maintaining review history and decisions - Backend tracking with UI history display
- Pattern learning algorithms improving future categorization suggestions - Backend ML with UI pattern application
- Evidence ranking system prioritizing most relevant text passages - Backend ranking with UI evidence ordering
- Consistency checking comparing categorizations across similar documents - Backend analysis with UI consistency alerts

Estimated Page Count
- 3 pages required for comprehensive review functionality: Review Queue Dashboard for file prioritization, Comprehensive Validation Interface for detailed dimension review, Batch Processing Tools for efficient multi-file validation.

=== END PROMPT FR: FR4.1.2a ===

=== BEGIN PROMPT FR: FR4.1.2b ===

Title
- FR FR4.1.2b Wireframes — File Processing Status & Observable Categorization Progress

Context Summary
- FR4.1.2b implements real-time processing visibility and observable categorization progress for files in the "being currently categorized by the engine" state. This interface provides transparency into the AI's analysis process, allowing users to monitor categorization progress, understand what the AI is discovering, and maintain confidence in the system's handling of their valuable business knowledge.

Journey Integration
- Stage 2 (processing phase) user goals: Monitor AI analysis, understand categorization progress, maintain confidence in system
- Key emotions: Curiosity about AI discoveries, confidence in processing quality, anticipation for results
- Progressive disclosure levels: Basic progress indicators, detailed analysis insights, expert-level processing metrics
- Persona adaptations: Designed for business owners who want transparency without technical complexity

### Journey-Informed Design Elements
- User Goals: Monitor progress, Understand AI analysis, See preliminary findings, Maintain confidence
- Emotional Requirements: Processing transparency, Discovery excitement, Quality assurance, Time awareness
- Progressive Disclosure:
  * Basic: Simple progress bars and status messages
  * Advanced: Preliminary findings and dimension discovery
  * Expert: Detailed processing metrics and analysis logs
- Success Indicators: Progress visible, Findings understood, Quality maintained, Completion anticipated

Wireframe Goals
- Create observable processing interface showing real-time AI categorization progress
- Provide transparency into dimension discovery as AI analyzes documents
- Enable monitoring of multiple files being processed simultaneously
- Display preliminary findings and emerging categorizations during analysis
- Offer estimated completion times and processing stage indicators
- Support processing intervention options for priority adjustments

Explicit UI Requirements (from acceptance criteria)
- **Processing Status Dashboard** showing all files currently being analyzed with:
  - Individual progress bars for each file
  - Current analysis stage indicators
  - Estimated time to completion
  - Processing priority levels
- **Observable Categorization View** displaying real-time discoveries:
  - Emerging categories being identified
  - Concepts being extracted as found
  - Methods being recognized during analysis
  - Frameworks being detected
- **Live Analysis Feed** showing:
  - Text snippets being analyzed
  - Preliminary dimension assignments
  - Confidence levels building in real-time
  - Key insights being discovered
- **Multi-File Processing Grid** supporting:
  - Simultaneous processing of multiple documents
  - Comparative progress tracking
  - Batch completion estimates
  - Resource allocation indicators
- **Processing Stage Visualization**:
  - Document parsing (25%)
  - Content analysis (50%)
  - Dimension extraction (75%)
  - Validation preparation (100%)
- **Preliminary Results Preview**:
  - Draft categorizations subject to change
  - Early concept identification
  - Initial method recognition
  - Tentative framework classification

Interactions and Flows
- View processing dashboard when files enter "AI analyzing" state
- Monitor individual file progress through stage indicators
- Observe live categorization discoveries appearing in real-time
- Preview preliminary findings before processing completes
- Adjust processing priority for urgent files if needed
- Expand processing details for deeper analysis insights
- Compare progress across multiple files being processed
- Receive notifications when processing milestones reached
- Access partial results if processing needs interruption
- Transition smoothly to review interface when processing completes

Visual Feedback
- Animated progress bars showing active processing
- Pulsing indicators for current analysis focus
- Emerging dimension badges appearing as discovered
- Confidence meters building as analysis progresses
- Stage completion checkmarks for processed sections
- Live text highlighting showing current analysis position
- Discovery animations for newly found dimensions
- Queue position indicators for waiting files
- Processing speed indicators (pages/minute)
- Completion celebration when analysis finishes

Accessibility Guidance
- ARIA live regions for progress updates and discoveries
- Screen reader announcements for stage completions
- Keyboard navigation for processing details and controls
- High contrast support for progress indicators
- Focus management for emerging discoveries
- Alternative text for processing visualizations
- Clear status messages for all processing states
- Audio cues option for milestone completions

Information Architecture
- Primary processing overview with all active files
- Secondary detailed view for individual file analysis
- Tertiary discovery feed showing emerging findings
- Quaternary processing metrics and performance data
- Navigation maintaining context during processing
- Quick access to completed files ready for review

Page Plan
- **Processing Status Dashboard**: Multi-file overview with progress tracking
- **Observable Categorization View**: Real-time discovery interface for individual files
- **Processing Analytics**: Detailed metrics and performance monitoring

Annotations (Mandatory)
- Attach notes on elements citing the acceptance criterion they fulfill and include a "Mapping Table" frame in Figma: Criterion → Screen → Component(s) → State(s).

Acceptance Criteria → UI Component Mapping
- "Observable view of categorization processing" → Observable Categorization View → Live analysis display → Real-time discoveries, progress indicators
- "Files in 'being categorized' state" → Processing Status Dashboard → File status display → Processing badge, progress bar
- "Real-time progress visibility" → Processing Status Dashboard → Progress tracking → Stage indicators, completion percentage
- "Preliminary findings display" → Observable Categorization View → Discovery feed → Emerging dimensions, draft categorizations
- "Multiple file processing support" → Processing Status Dashboard → Multi-file grid → Simultaneous processing, comparative progress
- "Processing stage indicators" → Observable Categorization View → Stage visualization → Parsing, analysis, extraction, validation prep

Non-UI Acceptance Criteria
- Real-time processing pipeline providing live updates - Backend streaming with UI live display
- Preliminary categorization algorithms generating draft dimensions - Backend analysis with UI preview display
- Progress tracking system calculating accurate completion estimates - Backend estimation with UI time display
- Processing priority management allowing user intervention - Backend queue management with UI priority controls

Estimated Page Count
- 3 pages for complete processing visibility: Processing Status Dashboard for multi-file overview, Observable Categorization View for detailed analysis monitoring, Processing Analytics for performance metrics.

=== END PROMPT FR: FR4.1.2b ===

=== UPDATED SEMANTIC MODULE IMPLEMENTATION SUMMARY ===

## Overview
This updated wireframe specification transforms FR4.1.2 into a comprehensive document categorization and semantic labeling workflow with actual file upload functionality, staged processing, and sophisticated human review capabilities. The module now provides complete visibility and control throughout the categorization process.

## Key Enhancements to FR4.1.2

### New Functional Requirements Added:

1. **FR4.1.2 - Main Categorization Workflow**
   - Actual file upload functionality with drag-and-drop
   - Staged workflow with clearly labeled steps
   - Categorization wizard for systematic dimension validation
   - Multiple file status states with visual tracking
   - AI pre-population with human validation capabilities

2. **FR4.1.2a - Advanced Review Interface** (NEW)
   - Dedicated interface for the critical human review stage
   - Comprehensive dimension adjudication with evidence display
   - Efficient batch processing for similar documents
   - Quality assurance indicators and validation controls

3. **FR4.1.2b - Processing Visibility** (NEW)
   - Observable categorization progress during AI analysis
   - Real-time discovery feed showing emerging dimensions
   - Multi-file processing dashboard with priority controls
   - Preliminary results preview before completion

## File Status States Implemented

The redesigned workflow now supports all requested file states:

1. **New File Ready for Categorization** - Files uploaded and waiting to begin AI analysis
2. **File Being Currently Categorized by Engine** - Active AI processing with observable progress (FR4.1.2b)
3. **File Ready for Review by Human** - Completed AI analysis requiring human validation (FR4.1.2a)
4. **Validated, Ready for Next Step FR4.1.3** - Approved categorization ready for lesson creation

## Categorization Dimensions

Each file receives comprehensive multi-dimensional categorization:
- **2 Categories**: Primary and Secondary business categories
- **5 Concepts**: Key document concepts identified
- **5 Methods**: Important methodologies discovered
- **2 Frameworks**: Business frameworks recognized

Total: 14 dimensions per document (exceeding the 10+ requirement)

## Mock Data Coverage

All screens include mock data examples for:
- Files in each status state
- AI-generated suggestions with varying confidence levels
- Evidence text excerpts supporting categorizations
- Validation workflows showing different approval scenarios
- Batch processing of similar documents

## Human Control Features

The workflow enables humans to:
- Upload files through intuitive drag-and-drop interface
- Monitor AI processing in real-time
- Review and validate all AI suggestions
- Edit and refine categorizations with evidence
- Advance files through workflow stages manually
- Perform batch operations on similar documents

## Technical Implementation Notes

The three FR sections work together to create a complete categorization pipeline:
- **FR4.1.2**: Core upload and workflow management
- **FR4.1.2a**: Human review and validation excellence
- **FR4.1.2b**: Processing transparency and monitoring

This comprehensive redesign transforms the document categorization stage from a simple upload interface into a sophisticated, human-centered workflow that provides complete control and transparency while maintaining the non-technical, business-friendly approach of the overall platform.

## Integration with Other FRs

- **Feeds into FR4.1.3**: Validated, categorized documents ready for lesson creation
- **Builds on FR4.1.1**: Uses project workspace created in initial setup
- **Prepares for FR4.1.4**: Establishes dimension framework for synthetic generation
- **Supports FR4.1.5**: Provides categorization metadata for final package

The enhanced FR4.1.2 specification now fully addresses all requirements for a staged, observable, and human-controlled categorization workflow while maintaining the semantic analysis module's focus on business-friendly, non-technical user experience.