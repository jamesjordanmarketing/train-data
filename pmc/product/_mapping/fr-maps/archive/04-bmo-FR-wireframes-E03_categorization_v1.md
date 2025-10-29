# Bright Run LoRA Training Data Platform - Stage 3 Document Categorization Module Functional Requirements
**Version:** 1.0.0  
**Date:** 09/14/2025  
**Category:** LoRA Training Data Pipeline - Stage 3 (Document Categorization Interface)
**Product Abbreviation:** bmo
**Module Focus:** E03_categorization

**Source References:**
- Seed Story: `pmc\product\_seeds\seed-narrative-v1.md`
- Overview Document: `pmc\product\01-bmo-overview.md`
- User Stories: `pmc\product\02-bmo-user-stories.md`
- Template Reference: `pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-E01_v2.md`

## Stage 3 Overview - Document Categorization Module

This document defines the **Document Categorization Interface** for the Bright Run LoRA Training Data Platform. This module provides an intuitive, business-owner-friendly interface for categorizing uploaded documents according to their cognitive relationship to the user's brand and proprietary knowledge systems.

### Critical Components Included:
- **FR3.3.1** - Document Inventory Management Interface
- **FR3.3.2** - Individual Document Categorization Workflow  
- **FR3.3.3** - Primary Category Selection System (Cognitive Relationship to Brand)
- **FR3.3.4** - Secondary Tags and Metadata Management
- **FR3.3.5** - Categorization Progress and Status Tracking

### Module Vision:
Transform the technical LoRA training process into an accessible journey for non-technical business owners by providing sophisticated document categorization that mirrors their internal knowledge organization rather than technical AI concepts.

### Key Principle:
Business owners don't know or care about technical categorization methods. The interface focuses on "teaching my business wisdom to an AI assistant" rather than technical document processing terminology.

## 1. Document Inventory Management Interface

- **FR3.3.1:** Document Inventory Management Interface
  * Description: Implement a sophisticated document inventory interface that displays all uploaded files with elegant presentation suitable for mature business owners. Provides clear visibility of categorization status and intuitive access to begin the categorization process for individual documents.
  * Impact Weighting: Strategic Growth
  * Priority: Critical
  * User Stories: US3.3.1
  * Tasks: [T-3.3.1]
  * User Story Acceptance Criteria:
    - Display all files from the "uploaded" folder in an organized, professional interface
    - Show categorization status for each document (uncategorized, in-progress, completed)
    - Provide "Start Teaching Your Private AI Model" button to begin categorization process
    - Enable document selection and preview capabilities
    - Support file filtering and search functionality
    - Display file metadata (name, size, type, upload date) in user-friendly format
  * Functional Requirements Acceptance Criteria:
    - Document grid displays with professional styling suitable for mature business owners with sophisticated visual hierarchy
    - File status indicators show clear categorization progress using visual badges and progress indicators
    - Document preview functionality provides quick content overview without leaving inventory view using modal or drawer interface
    - File filtering supports status-based filtering (all, uncategorized, in-progress, completed) with intuitive filter controls
    - Search functionality enables filename and content-based document discovery with autocomplete and suggestions
    - Batch selection capabilities allow multiple document selection for bulk operations with checkbox selection interface
    - File metadata presentation includes size formatting, type icons, and relative timestamps with hover details
    - Navigation controls provide easy access to individual document categorization with clear call-to-action buttons
    - Loading states show file discovery and status checking progress with skeleton screens and progress indicators
    - Empty states provide guidance when no files are available with clear next steps and upload prompts
    - Error states handle file access issues with clear error messages and recovery options
    - **Integration Points**: Connects to Stage 1 document processing output and feeds categorized documents to Stage 4 training data generation
    - **Scope Focus**: Professional document management interface specifically for categorization workflow initiation

## 2. Individual Document Categorization Workflow

- **FR3.3.2:** Individual Document Categorization Workflow
  * Description: Implement a guided three-step categorization workflow that transforms technical document categorization into an accessible process focused on business value and proprietary knowledge identification. Each step builds understanding while maintaining user engagement.
  * Impact Weighting: Strategic Growth  
  * Priority: Critical
  * User Stories: US3.3.2
  * Tasks: [T-3.3.2]
  * User Story Acceptance Criteria:
    - Guide users through three distinct categorization steps with clear progression
    - Step A: Statement of Belonging - assess document's relationship to user's expertise
    - Step B: Primary category selection from 11 predefined business-friendly categories  
    - Step C: Secondary tags application for detailed metadata enrichment
    - Maintain context and progress throughout the workflow
    - Provide document content reference panel for informed decision making
    - Enable workflow navigation (back/forward) with data persistence
  * Functional Requirements Acceptance Criteria:
    - Workflow navigation provides clear step progression with numbered steps, progress bar, and completion indicators
    - Step A interface presents "How close is this document to describing your own special voice and skill" question with intuitive rating scale or slider
    - Document content panel displays formatted document text with highlighting and scrolling capabilities for reference during categorization
    - Form validation ensures required fields are completed before progression with inline validation messages and disabled navigation
    - Data persistence maintains user selections across workflow steps and browser sessions with auto-save functionality
    - Navigation controls support forward/backward movement with confirmation dialogs for unsaved changes
    - Context preservation displays document title and summary information throughout workflow with persistent document context panel
    - Progress indicators show completion status for each step with visual checkmarks and step completion status
    - Exit/save draft functionality allows users to pause and return later with clear save status indicators
    - Workflow completion triggers backend processing with visual feedback and success confirmation
    - Error handling manages validation failures and processing errors with clear recovery guidance
    - **Integration Points**: Receives document data from FR3.3.1 and outputs categorization data to backend processing engine
    - **User Experience Focus**: Sophisticated presentation maintaining professional business owner engagement throughout categorization process

## 3. Primary Category Selection System

- **FR3.3.3:** Primary Category Selection System (Cognitive Relationship to Brand)
  * Description: Implement the core categorization interface that presents 11 business-friendly categories representing documents' cognitive relationship to the user's brand. Categories are designed to be intuitive for business owners rather than technical, focusing on proprietary value and knowledge ownership.
  * Impact Weighting: Strategic Growth
  * Priority: Critical  
  * User Stories: US3.3.3
  * Tasks: [T-3.3.3]
  * User Story Acceptance Criteria:
    - Present 11 primary categories (a-k) in clear, understandable business language
    - Enable single-selection category choice with clear visual selection indicators
    - Provide detailed descriptions and examples for each category option
    - Support category selection with confidence indicators or explanatory tooltips
    - Display category selection impact on document processing and training value
    - Validate category selection before allowing workflow progression
  * Functional Requirements Acceptance Criteria:
    - Category presentation interface displays 11 options with clear radio button or card selection format and distinctive visual styling for each category
    - Category descriptions provide business-friendly explanations with examples and use cases relevant to domain expertise rather than technical terminology
    - Selection interface supports single-choice selection with clear visual feedback and immediate selection confirmation
    - Tooltips and help text offer additional context for complex categories with expandable descriptions and real-world examples
    - Visual hierarchy emphasizes high-value categories (complete systems, proprietary strategies) with priority styling and positioning
    - Category validation ensures selection is made before progression with inline validation and clear error messaging
    - Selection persistence maintains choice throughout workflow with visual confirmation and easy modification capability
    - Impact indicators show how category selection affects document processing with explanation of downstream effects
    - Category mapping displays relationship between business categories and technical processing with transparent processing notes
    - **Categories Include**: 
      * Complete proprietary system containing entire special methodology
      * Major system component with majority of proprietary process  
      * Portions of special knowledge without complete system
      * Proprietary strategies and unique approaches
      * Unique stories illustrating product/service benefits
      * Step-by-step instructional content
      * Marketing content describing benefits without revealing methodology
      * Customer conversations highlighting special value
      * Customer conversations describing problem-solving approaches  
      * Customer conversations containing feedback and testimonials
      * External content without proprietary wisdom
    - **Integration Points**: Category selection directly influences backend AI processing and content extraction algorithms
    - **Business Focus**: Categories reflect natural business thinking patterns rather than technical document classification

## 4. Secondary Tags and Metadata Management

- **FR3.3.4:** Secondary Tags and Metadata Management
  * Description: Implement comprehensive secondary tagging system that applies multiple metadata dimensions to documents including authorship, format, disclosure risk, evidence type, intended use, audience, and gating levels. Enables rich content organization and filtering for training data optimization.
  * Impact Weighting: Operational Efficiency
  * Priority: Critical
  * User Stories: US3.3.4  
  * Tasks: [T-3.3.4]
  * User Story Acceptance Criteria:
    - Apply multiple secondary tags across different metadata dimensions
    - Support tag categories: Authorship, Format, Disclosure Risk, Evidence Type, Intended Use, Audience, Gating Level
    - Enable multi-select tag application within each category
    - Provide tag suggestions based on document content and primary category selection
    - Display tag impact on document processing and training data value
    - Support custom tag creation for specialized business terminology
  * Functional Requirements Acceptance Criteria:
    - Tag selection interface presents organized tag categories with collapsible sections and clear category labeling
    - Multi-select functionality supports multiple tags per category with checkbox or multi-select dropdown interface
    - **Authorship tags**: Brand, Team, Customer, Mixed, Third-Party with clear selection indicators
    - **Format tags**: How-to, Strategy Note, Case Study, Story, Sales Page, Email, Transcript, Slide, Whitepaper, Brief with format-specific icons
    - **Disclosure Risk scoring**: 1-5 scale with explanatory descriptions (5 = exposes competitive advantage) and visual risk indicators
    - **Evidence Type tags**: Metrics, Quote, Before/After, Screenshot, Data Table, Reference with evidence-specific validation
    - **Intended Use categories**: Marketing, Sales Enablement, Delivery/Operations, Training, Investor, Legal with use-case specific styling
    - **Audience levels**: Public, Lead, Customer, Internal, Executive with audience-appropriate visual indicators
    - **Gating Level options**: Public, Ungated-Email, Soft-Gated, Hard-Gated, Internal-Only, NDA-Only with security-level color coding
    - Tag suggestion engine provides intelligent recommendations based on document content analysis and primary category selection
    - Custom tag creation supports business-specific terminology with tag validation and duplicate prevention
    - Tag impact display shows how tag combinations affect training data processing with algorithmic transparency
    - Bulk tag application enables applying common tag combinations with saved tag presets and quick application
    - Tag validation prevents conflicting combinations with logical validation rules and conflict resolution guidance
    - **Integration Points**: Secondary tags feed into backend processing algorithms for content extraction and training data optimization
    - **Business Value Focus**: Tag system reflects real business content organization patterns and supports training data quality optimization

## 5. Categorization Progress and Status Tracking

- **FR3.3.5:** Categorization Progress and Status Tracking  
  * Description: Implement comprehensive progress tracking and status management system that provides visibility into categorization completion, quality metrics, and processing status. Enables efficient workflow management and ensures complete document categorization coverage.
  * Impact Weighting: Operational Efficiency
  * Priority: Critical
  * User Stories: US3.3.5
  * Tasks: [T-3.3.5]  
  * User Story Acceptance Criteria:
    - Track categorization progress across all uploaded documents
    - Display completion statistics and remaining work indicators  
    - Show document processing status after categorization (queued, processing, completed, error)
    - Provide categorization quality indicators and validation status
    - Enable progress filtering and sorting for efficient workflow management
    - Support progress reporting and completion metrics
  * Functional Requirements Acceptance Criteria:
    - Progress dashboard displays overall categorization completion with percentage completion, documents remaining, and estimated time to completion
    - Document status tracking shows individual file progress through categorization workflow with status badges and progress indicators
    - Processing queue visibility displays backend processing status with queue position and estimated processing time
    - Quality metrics presentation shows categorization confidence scores and validation results with quality indicators and improvement suggestions  
    - Progress filtering supports status-based filtering (uncategorized, in-progress, completed, error) with advanced filter combinations
    - Batch progress operations enable bulk status updates and progress management with multi-select operations
    - Completion reporting generates progress summaries and completion metrics with exportable progress reports
    - Status notifications provide real-time updates on processing completion and error conditions with toast notifications and email updates
    - Progress persistence maintains status across browser sessions with reliable state management
    - Error tracking identifies and manages categorization errors with error resolution workflow and retry capabilities
    - Progress analytics display categorization efficiency metrics with time tracking and completion trends  
    - **Integration Points**: Status tracking integrates with backend processing pipeline and provides feedback to document inventory interface
    - **Workflow Optimization**: Progress tracking enables efficient categorization workflow management and quality assurance processes

## 6. Backend Processing Integration

### Processing Workflow After Categorization:
After user completes categorization for a document, the system triggers automated backend processing that:

1. **Secondary Category Assignment**: AI engine processes document using user-provided categories to assign additional secondary categories (Lesson, Process, Philosophy, Marketing Content, Wisdom, Special Sauce, Case Studies & Examples, Stories, Brand)

2. **Content Extraction**: Proprietary AI prompt analyzes document based on category tags to extract:
   - 5 Concepts per document
   - 5 Branded Chunks per document  
   - 5 Process elements per document
   - 5 Process steps per document
   - 5 Special Beliefs/Wisdom elements per document
   - 5 Example Case Studies per document

3. **Database Storage**: Structured data output stored in Supabase database with complete categorization context and extracted content elements

4. **Validation and Quality Scoring**: Content extraction quality assessment with validation flags and confidence scoring

## 7. User Experience Design Requirements

### Visual Design Principles:
- **Sophisticated Presentation**: Interface design reflects professional business environment suitable for mature business owners
- **Empathy and Intelligence**: UI conveys understanding of business expertise and respect for user knowledge
- **Progressive Disclosure**: Complex categorization concepts revealed gradually to prevent cognitive overload  
- **Business Language**: All terminology reflects natural business thinking rather than technical AI/ML concepts

### Interaction Design:
- **Guided Workflow**: Clear step-by-step progression with contextual help and guidance
- **Flexible Navigation**: Ability to move between steps while preserving work with clear save states
- **Visual Feedback**: Immediate response to user actions with appropriate loading states and confirmations
- **Error Prevention**: Input validation and guidance to prevent categorization mistakes

## 8. Integration Requirements

### Stage Integration Points:
- **Input from Stage 2**: Receives processed document content and metadata from document processing pipeline
- **Output to Stage 4**: Provides categorized documents with rich metadata for training data generation
- **Database Integration**: All categorization data stored in structured Supabase database for downstream processing

### API Integration Requirements:  
- Document content retrieval API for categorization interface
- Categorization data submission API for backend processing
- Progress tracking API for status updates and workflow management
- Content extraction API for backend AI processing pipeline

## 9. Success Criteria

### Module Completion Requirements:
- [ ] User can view all uploaded documents in sophisticated inventory interface
- [ ] User can categorize individual documents through guided 3-step workflow  
- [ ] Primary category selection covers all 11 business-friendly categories
- [ ] Secondary tags application supports all 7 metadata dimensions
- [ ] Progress tracking provides complete visibility into categorization status
- [ ] Backend processing integration triggers automatically after categorization
- [ ] All categorization data stored in structured database format

### User Experience Validation:
- [ ] Interface maintains professional presentation suitable for mature business owners
- [ ] Categorization workflow completed in under 10 minutes per document for typical business content
- [ ] User guidance prevents categorization errors and maintains workflow momentum
- [ ] Progress tracking enables efficient management of large document collections
- [ ] Integration with backend processing provides seamless transition to training data generation

### Quality Assurance Standards:
- [ ] Categorization accuracy validated through user feedback and processing results  
- [ ] Interface accessibility meets WCAG 2.1 AA standards for business users
- [ ] Performance optimization supports collections of 100+ documents
- [ ] Data integrity maintained throughout categorization and processing workflow
- [ ] Error handling provides clear recovery guidance for all failure scenarios

---

## Important Notes

**This specification focuses exclusively on the Document Categorization Interface described in the seed narrative:**

**Core Functionality:**
1. Sophisticated document inventory management
2. Guided 3-step categorization workflow (Statement of Belonging → Primary Category → Secondary Tags)
3. 11 business-friendly primary categories representing cognitive relationship to brand
4. 7 secondary tag dimensions for comprehensive metadata
5. Progress tracking and status management
6. Backend processing integration

**Key Design Principles:**
- Business owner-focused language and interface design
- Sophisticated presentation reflecting professional business environment
- Guided workflow preventing cognitive overload
- Integration with broader LoRA training data pipeline

**Integration Requirements:**
- Seamless connection to document processing pipeline (input)
- Structured data output for training data generation (output)  
- Real-time processing status and progress tracking
- Complete workflow state management and persistence

This document categorization module transforms the technical challenge of document classification into an intuitive business workflow that captures proprietary knowledge relationships while maintaining the sophisticated presentation required for mature business owners.
