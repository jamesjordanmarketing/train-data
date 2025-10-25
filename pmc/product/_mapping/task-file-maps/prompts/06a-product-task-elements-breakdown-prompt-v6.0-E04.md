# IPDM Task Generation Prompt - Stage-Sequential, Step-Atomic Development
Version: 6.0-v5

## File Path Context for AI Agent
All file paths in this prompt are Windows paths. When accessing these files:
- Use Windows-style paths with backslashes: `C:\Users\james\...`
- Ensure backslashes are properly escaped in code: `C:\\Users\\james\\...`
- When displaying paths to the user, use standard Windows format
- All project files are located under the root directory: `C:\Users\james\Master\BrightHub\BRun\brun8\`

## CRITICAL OUTPUT REQUIREMENTS

**MANDATORY TEMPLATE REFERENCE**: You MUST use the file `pmc\product\_examples\6-aplio-mod-1-tasks-E01.md` as your EXACT FORMAT TEMPLATE for all output structure, formatting, numbering, naming, titling, and organization.
 
**OUTPUT FILE LOCATION**:
You MUST output the updated spec file to:  
C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_mapping\task-file-maps\6-bmo-tasks-output-E04.md.

### Template Usage Instructions:
1. **Structure**: Follow the EXACT hierarchical structure from the example file
2. **Numbering**: Use the EXACT numbering pattern (T-X.Y.Z format)
3. **Section Headers**: Use the EXACT header format and styling
4. **Metadata Format**: Use the EXACT metadata structure with all required fields
5. **Element Format**: Use the EXACT "Components/Elements" format with ELE-X numbering
6. **Implementation Process**: Use the EXACT "Implementation Process" format with PREP/IMP/VAL phases
7. **Content Organization**: Follow the EXACT task breakdown pattern shown in the example

### What to Replace from Template:
- Replace "Aplio Design System Modernization" with "Bright Run LoRA Training Product"
- Replace Aplio-specific content with BMO content from relevant source files
- Replace file paths to match BMO project structure
- Keep ALL formatting, structure, numbering, and organizational patterns IDENTICAL

## IPDM Methodology Foundation

This prompt implements the **Integrated Pipeline Development Methodology (IPDM)**. IPDM creates a **stage-sequential, step-atomic** development approach that builds **complete vertical slices** through the application stack, ensuring every backend feature has a corresponding frontend interface and user interaction.

### Core IPDM Principles Applied
1. **Vertical Integration**: Each task includes backend + frontend + testing as an atomic unit
2. **Sequential Pipeline Development**: Build stages in order, steps within stages in order
3. **Live Development Environment**: Build components in their production locations, not test scaffolds
4. **Cumulative Testing**: Each new step validates all previous functionality
5. **User-Centric Functionality**: Every backend feature has a corresponding user interaction
6. **Production Structure**: Build modules, components, and pages where they belong in production architecture

Each stage contains **specific steps** that are developed as **complete vertical slices**:
- Backend functionality (APIs, services, data models)
- Frontend interface (pages, components, user interactions)
- Integration testing (end-to-end validation)
- Cumulative validation (ensuring previous steps still work)

## Source Document Requirements

### Primary Input Files (MUST READ IN SEQUENCE)
1. **Current Major Task File **: `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_mapping\task-file-maps\6-bmo-tasks-E04.md`
   - Contains the major task and acceptance requirements that will be broken down
   - Defines the major task implementation workflow and technical requirements
   - Provides acceptance criteria mapped over from the functional versions

2. **Current Code Base **: `C:\Users\james\Master\BrightHub\BRun\brun8\4-categories-wf`
   - Contains the wireframe code that this task will be updating and testing
   - Add this codebase to your code knowledge for this task
   - The purpose of this project task is ONLY to update this codebase so it is complete

### Supporting Documentation
3. **Functional Requirements**: `C:\Users\james\Master\BrightHub\BRun\brun8\pmc\product\03-bmo-functional-requirements.md`
   - Contains comprehensive functional specifications for the project
   - Contains the original functional acceptance criteria

4. **User Journey**: `C:\Users\james\Master\BrightHub\BRun\brun8\pmc\product\_seeds\seed-narrative-v1.md`

## Task Generation Methodology

### IPDM Task Structure
Each task MUST be structured as a **complete vertical slice** containing:

#### Backend Components (2-3 hours)
- **API Routes**: Next.js 14 API endpoints in production locations
- **Services**: Business logic services in `src/lib/services/`
- **Data Models**: TypeScript interfaces and database schemas
- **Utilities**: Helper functions and shared logic

#### Frontend Components (2-3 hours)  
- **Pages**: Next.js 14 pages in production locations (`src/app/[path]/page.tsx`)
- **Components**: Reusable React components in `src/components/`
- **State Management**: Client-side state for user interactions
- **User Interface**: Visual elements, forms, displays, and feedback

#### Integration & Testing (1-2 hours)
- **API Integration**: Frontend connection to backend APIs
- **User Flow Testing**: Complete workflow validation
- **Cumulative Testing**: Ensure previous steps still function
- **Production Validation**: Test in actual production locations

### Task Numbering Convention
Use **IPDM-aligned numbering** that reflects the 6-stage pipeline:

**Format**: `T-[Stage].[Step].[Subtask]`

**Examples**:
- `T-1.1.1`: Stage 1, Step 1, Backend API
- `T-1.1.2`: Stage 1, Step 1, Frontend Page  
- `T-1.1.3`: Stage 1, Step 1, Integration Testing
- `T-2.3.1`: Stage 2, Step 3, Backend Service

### Element Design Principles

#### 1. Atomic Functionality
Each element (ELE-X) represents **2-4 hours** of focused development work and must:
- Implement a **single, cohesive functionality**
- Be **independently testable**
- Have **clear boundaries** without overlapping responsibilities
- Include **specific technical details** for implementation

#### 2. Next.js 14 Specific Patterns
Every element description MUST explicitly mention **Next.js 14** patterns:
- **App Router**: File-based routing with `src/app/` structure
- **Server/Client Components**: Clear boundaries between server and client code
- **Data Fetching**: Static vs. dynamic rendering strategies
- **Streaming**: Progressive enhancement with React 18 streaming
- **Metadata**: SEO and accessibility with Next.js 14 metadata APIs

#### 3. Production-First Development
All elements are built **in production locations**:
- **No test directories**: Build directly in `src/app/`, `src/components/`, `src/lib/`
- **Real data**: Use actual database connections and API endpoints
- **Real components**: No mock components or test scaffolds
- **Real testing**: Test in the actual browser at production URLs

### Task Analysis Process

#### Step 1: Pipeline Stage Mapping
For each functional requirement, map to the appropriate **IPDM stage and step**:

**Stage 1 - Knowledge Ingestion**: File upload, text input, format detection
**Stage 2 - Content Analysis**: Topic extraction, entity recognition, relationship mapping  
**Stage 3 - Knowledge Structure**: Concept clustering, Q&A generation, knowledge graphs
**Stage 4 - Semantic Variation**: Parameter configuration, variation generation, quality filtering
**Stage 5 - Quality Assessment**: Metrics display, review interface, improvement controls
**Stage 6 - Export**: Format selection, dataset generation, platform integration

#### Step 2: Vertical Slice Creation
For each step, create **complete vertical slices**:

**Backend Slice**:
- API endpoint at `/api/pipeline/stage[X]/[step]`
- Service class in `src/lib/services/pipeline/stage[X]/`
- Data models in TypeScript interfaces
- Error handling and validation

**Frontend Slice**:
- Page component at `src/app/(pipeline)/stage[X]/[step]/page.tsx`
- UI components in `src/components/pipeline/stage[X]/`
- State management for user interactions
- Visual feedback and loading states

**Integration Slice**:
- API connection from frontend to backend
- User workflow testing
- Error handling and edge cases
- Cumulative validation with previous steps

#### Step 3: UI-First Enhancement
Transform backend-focused requirements into **UI-first specifications**:

**Before**: "System processes documents"
**After**: "User sees drag-and-drop upload zone with file type indicators, real-time progress bars, and immediate preview of extracted content"

**Before**: "System analyzes content"  
**After**: "User views interactive knowledge graph with zoomable topic clusters, entity highlighting, and relationship visualization"

### Task Metadata Requirements

#### Required Fields for Each Subtask
```markdown
#### T-[Stage].[Step].[Subtask]: [Task Name]
- **FR Reference**: [FR-X.Y.Z from functional requirements]
- **Parent Task**: [Parent T-X.Y from task list]
- **Implementation Location**: [Exact file path: `C:\Users\james\Master\BrightHub\BRun\brun8\brightr\src\app\...`]
- **Pattern**: [Reference to implementation pattern from 05-bmo-implementation-patterns.md]
- **Dependencies**: [Previous tasks and resources needed]
- **Estimated Human Work Hours**: [2-4 hour estimate]
- **Description**: [Clear, specific task directive with IPDM focus]
- **Backend Location**: [API route or service location]
- **Frontend Location**: [Page or component location]
- **Test Location**: [Production URL for testing]
```

#### Element Documentation Format
```markdown
**Components/Elements**:
- [T-X.Y.Z:ELE-1] [Element Name]: [Specific implementation directive]
  - **Backend Component**: [API endpoint, service, or data model]
  - **Frontend Component**: [Page, component, or UI element]
  - **Integration Point**: [How frontend connects to backend]
  - **Production Location**: [Exact file path]
  - **Next.js 14 Pattern**: [Specific Next.js 14 implementation pattern]
  - **User Interaction**: [What the user sees and does]
  - **Validation**: [How to test this element]
```

### Processing Scope Instructions

#### Section-Based Processing
Process the Bright Run platform using **IPDM stage-sequential approach**:

1. **Stage 1 Focus**: Knowledge Ingestion & Document Processing
   - File upload interface and processing
   - Text input validation and preview
   - Content extraction and format detection

2. **Stage 2 Focus**: Content Analysis & Understanding
   - Topic extraction visualization
   - Entity recognition interface
   - Relationship mapping display

3. **Stage 3 Focus**: Knowledge Structure & Training Pair Generation
   - Concept clustering interface
   - Q&A pair creation controls
   - Knowledge graph visualization

4. **Stage 4 Focus**: Semantic Variation & Enhancement
   - Variation parameter configuration
   - Generation progress monitoring
   - Quality filtering interface

5. **Stage 5 Focus**: Quality Assessment
   - Metrics dashboard
   - Review and approval interface
   - Improvement suggestion controls

6. **Stage 6 Focus**: Export & Integration
   - Format selection interface
   - Dataset generation progress
   - Platform integration setup

#### Cross-Stage Dependencies
- **Sequential Validation**: Each stage validates all previous stages
- **Data Flow**: Ensure data persists between stages
- **User Journey**: Maintain consistent navigation and state
- **Error Recovery**: Handle failures gracefully across stages

## Quality Assurance Framework

### IPDM Quality Gates
Each task must pass these validation criteria:

1. **Backend Validation**:
   - [ ] API responds correctly to valid requests
   - [ ] Error handling provides clear messages
   - [ ] Data validation prevents invalid inputs
   - [ ] Performance meets requirements (<200ms response)

2. **Frontend Validation**:
   - [ ] UI renders correctly in production location
   - [ ] User interactions work smoothly
   - [ ] Loading and error states display properly
   - [ ] Responsive design works across devices

3. **Integration Validation**:
   - [ ] Frontend connects to backend APIs
   - [ ] Data flows correctly between components
   - [ ] User can complete the step workflow
   - [ ] Previous steps still function correctly

4. **Cumulative Validation**:
   - [ ] All previous stages work together
   - [ ] User can complete full pipeline flow
   - [ ] No regression in existing functionality
   - [ ] Production deployment ready

### Production Testing Requirements
- **Live Testing**: Test in actual production URLs
- **Real Data**: Use real datasets and scenarios
- **User Journey**: Test complete workflows end-to-end
- **Performance**: Validate under realistic load

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- Stage 1: Knowledge Ingestion pipeline
- Core file upload and text processing
- Basic UI scaffolding with production structure

### Phase 2: Analysis (Week 2)
- Stage 2: Content Analysis pipeline  
- Topic extraction and visualization
- Entity recognition interface

### Phase 3: Generation (Week 3)
- Stage 3: Knowledge Structure
- Training pair generation interface
- Knowledge graph visualization

### Phase 4: Enhancement (Week 4)
- Stage 4: Semantic Variation
- Quality controls and filtering
- Advanced configuration options

### Phase 5: Assessment (Week 5)
- Stage 5: Quality Assessment
- Metrics dashboard and review
- Final validation interface

### Phase 6: Export (Week 6)
- Stage 6: Export & Integration
- Dataset generation and download
- Platform integration setup

## Final Instructions

### Before Starting
1. **Read ALL source documents** in the specified sequence
3. **Understand the task** and its steps
4. **Review the template format** in 6-aplio-mod-1-tasks-E01.md

### During Processing
1. **Map each requirement** to specific stage and step
2. **Create complete vertical slices** for each task
3. **Build in production locations** with Next.js 14 patterns
4. **Maintain cumulative validation** throughout development
5. **Focus on user experience** in every implementation

### After Completion
1. **Validate cumulative functionality** across all stages
2. **Test end-to-end user workflows** in production
3. **Ensure production readiness** for all components
4. **Document any methodology refinements**