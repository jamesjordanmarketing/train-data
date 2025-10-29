# FR6.1.1 — Wireframe Generator Prompt (v4)

# Feature & Function Task List Generation Prompt v1.0
**Purpose:** Generate comprehensive task inventories from requirements, wireframes, and overview documents  
**Scope:** Product-agnostic prompt for React-based applications  
**Date:** 01/20/2025

## Instructions

You are a senior technical product manager and software architect tasked with generating a comprehensive feature and function task inventory. Given product requirements, wireframes, and overview documentation, you will create a detailed list of ALL features and functions required to transform the FR wireframes into a production-ready application with live data integration.

## Input Requirements

You will be provided with:
1. **Product Overview Document** - Contains product vision, goals, architecture, and scope:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\01-train-overview.md`

2. **Functional Requirements Document** - Contains detailed feature specifications and acceptance criteria for the whole project and context:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\03-train-functional-requirements.md`

3. **Functional Requirements Scope Document** - Contains detailed feature specifications and acceptance criteria for FR1.X.Y that we are now building the task list for. We are ONLY building the task list for FR which are the requirements and acceptance criteria in this file: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E06.md`

4. **Wireframe/UI Documentation** - Contains visual designs and user interface specifications as displayed in the current implementation codebase `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src`

5. **Current Implementation** - This codebase: `C:\Users\james\Master\BrightHub\brun\train-data\train-wireframe\src` contains existing wireframe's codebase, layout specification, and complete UI details. Please read this entire codebase as it is the latest wireframe being used to build this module.

## Output File
Output the full task list here: 
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E06-output.md`

## Output Format

Generate a task list following this exact structure:

```
# [Product Name] - Feature & Function Task Inventory (Generated [ISO Date])

## 1. Foundation & Infrastructure
### T-1.1.0: [Infrastructure Component Name]
- **FR Reference**: [Functional Requirement ID]
- **Impact Weighting**: [Revenue Impact/Strategic Growth/Operational Efficiency]
- **Implementation Location**: [File/Directory Path]
- **Pattern**: [Architecture Pattern Reference]
- **Dependencies**: [Prerequisite Tasks]
- **Estimated Human Work Hours**: [Range]
- **Description**: [Brief description]
- **Testing Tools**: [Test frameworks/tools]
- **Test Coverage Requirements**: [Coverage percentage]
- **Completes Component?**: [Yes/No - completion description]

**Functional Requirements Acceptance Criteria**:
- [Bullet point list of specific, measurable criteria]
- [Each criterion should be testable and verifiable]
- [Include both user-facing and technical requirements]

#### T-1.1.1: [Sub-task Name]
- **FR Reference**: [Reference]
- **Parent Task**: T-1.1.0
- **Implementation Location**: [Specific file/component path]
- **Pattern**: [Specific pattern]
- **Dependencies**: [Direct dependencies]
- **Estimated Human Work Hours**: [Range]
- **Description**: [Detailed description of sub-task]

**Components/Elements**:
- [T-1.1.1:ELE-1] [Element name]: [Element description]
  - Stubs and Code Location(s): [Specific file references with line numbers if available]
- [T-1.1.1:ELE-2] [Element name]: [Element description]
  - Stubs and Code Location(s): [Specific file references]

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] [Preparation step] (implements ELE-X)
   - [PREP-2] [Preparation step] (implements ELE-X)
2. Implementation Phase:
   - [IMP-1] [Implementation step] (implements ELE-X)
   - [IMP-2] [Implementation step] (implements ELE-X)
3. Validation Phase:
   - [VAL-1] [Validation step] (validates ELE-X)
   - [VAL-2] [Validation step] (validates ELE-X)
```

## Task Organization Guidelines

### 1. Category Structure
Organize tasks into these primary categories:
- **Foundation & Infrastructure** - Core setup, authentication, database, APIs
- **Data Management & Processing** - Data models, processing pipelines, validation
- **User Interface Components** - Reusable UI components, design system
- **Feature Implementation** - Business logic, workflows, integrations
- **Quality Assurance & Testing** - Testing frameworks, validation, monitoring
- **Deployment & Operations** - CI/CD, monitoring, security, performance

### 2. Task Numbering System
- Main tasks: T-[Category].[Sequence].0 (e.g., T-1.1.0, T-2.3.0)
- Sub-tasks: T-[Category].[Sequence].[Sub] (e.g., T-1.1.1, T-1.1.2)
- Elements: T-[Task]:[ELE-[Number]] (e.g., T-1.1.1:ELE-1)

### 3. Task Ordering Priority
Order tasks for optimal development flow and user-centric testing:
1. **Foundation First** - Infrastructure that everything depends on
2. **Data Layer** - Database models, APIs, data processing
3. **Core Components** - Essential UI components and patterns
4. **User Workflows** - Complete user journeys from start to finish
5. **Advanced Features** - Enhancements and optimizations
6. **Integration & Deployment** - External integrations and production setup

## Analysis Framework

### Frontend Task Analysis
For each wireframe/UI element, identify:
- **Component Structure** - Atomic components, composite components, layouts
- **State Management** - Local state, global state, form state, async state
- **User Interactions** - Click handlers, form submissions, navigation
- **Data Requirements** - API calls, data transformations, caching
- **Responsive Design** - Mobile adaptations, breakpoint handling
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

### Backend Task Analysis
For each functional requirement, identify:
- **Data Models** - Database schemas, relationships, validation rules
- **API Endpoints** - CRUD operations, business logic endpoints, authentication
- **Business Logic** - Processing workflows, validation, calculations
- **Integrations** - Third-party services, external APIs, webhook handlers
- **Security** - Authentication, authorization, data protection
- **Performance** - Caching, optimization, scaling considerations

### Full-Stack Integration
Identify connection points requiring both frontend and backend work:
- **Authentication Flow** - Login/logout, session management, protected routes
- **Data Synchronization** - Real-time updates, optimistic updates, conflict resolution
- **File Handling** - Upload, processing, storage, retrieval
- **Search & Filtering** - Query interfaces, result processing, pagination
- **Notifications** - Real-time alerts, email notifications, push notifications

## Quality Standards

### Task Completeness Criteria
Each task must include:
- **Clear Scope** - Specific deliverables and boundaries
- **Testable Acceptance Criteria** - Measurable success conditions
- **Dependency Mapping** - Prerequisites and dependents
- **Implementation Guidance** - Specific patterns and approaches
- **Integration Points** - How it connects to other tasks

### Technical Requirements
Ensure all tasks cover:
- **Type Safety** - TypeScript definitions and strict typing
- **Error Handling** - Graceful failures and user feedback
- **Performance** - Loading states, optimization, caching
- **Security** - Input validation, authorization, data protection
- **Accessibility** - WCAG compliance, keyboard navigation
- **Testing** - Unit tests, integration tests, e2e tests

### Business Requirements
Ensure all tasks address:
- **User Value** - Clear user benefit and use case
- **Data Integrity** - Consistent and reliable data handling
- **Business Logic** - Correct implementation of business rules
- **Workflow Support** - Complete user journeys and edge cases
- **Reporting & Analytics** - Usage tracking and business metrics

## Special Considerations

### React Application Patterns
- **Server Components** - Identify static vs. interactive content
- **Client Boundaries** - Minimize client-side JavaScript where possible
- **Data Fetching** - Server-side data loading and caching strategies
- **State Management** - Component-level vs. application-level state
- **Performance** - Code splitting, lazy loading, bundle optimization

### Production Readiness
- **Monitoring** - Error tracking, performance monitoring, user analytics
- **Security** - Authentication, authorization, data protection, OWASP compliance
- **Scalability** - Database optimization, caching, CDN, auto-scaling
- **Reliability** - Error boundaries, fallback states, graceful degradation
- **Maintainability** - Code organization, documentation, testing coverage

### Database & Backend Integration
- **Data Architecture** - Relational vs. NoSQL considerations
- **API Design** - RESTful principles, GraphQL considerations, versioning
- **Real-time Features** - WebSocket connections, Server-Sent Events
- **Background Processing** - Job queues, scheduled tasks, batch processing
- **External Integrations** - Third-party APIs, webhooks, message queues

## Expected Deliverable

Generate a comprehensive task list containing:
- **50-200 tasks** depending on application complexity
- **Complete coverage** of all features shown in wireframes
- **Full-stack implementation** covering both frontend and backend
- **Production-ready scope** including testing, security, and deployment
- **User-centric ordering** enabling incremental testing and validation
- **Clear dependencies** showing optimal development sequence
- **Specific acceptance criteria** for each task and sub-task
- **Ouput File** the full task list here:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E06-output.md`

The resulting task list should serve as a complete development roadmap for `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E06.md`, enabling any development team to build the `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src` wireframes into a fully functional, production-ready application with live data integration.

# FR6.1.2 — Wireframe Generator Prompt (v4)

# Feature & Function Task List Generation Prompt v1.0
**Purpose:** Generate comprehensive task inventories from requirements, wireframes, and overview documents  
**Scope:** Product-agnostic prompt for React-based applications  
**Date:** 01/20/2025

## Instructions

You are a senior technical product manager and software architect tasked with generating a comprehensive feature and function task inventory. Given product requirements, wireframes, and overview documentation, you will create a detailed list of ALL features and functions required to transform the FR wireframes into a production-ready application with live data integration.

## Input Requirements

You will be provided with:
1. **Product Overview Document** - Contains product vision, goals, architecture, and scope:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\01-train-overview.md`

2. **Functional Requirements Document** - Contains detailed feature specifications and acceptance criteria for the whole project and context:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\03-train-functional-requirements.md`

3. **Functional Requirements Scope Document** - Contains detailed feature specifications and acceptance criteria for FR1.X.Y that we are now building the task list for. We are ONLY building the task list for FR which are the requirements and acceptance criteria in this file: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E06.md`

4. **Wireframe/UI Documentation** - Contains visual designs and user interface specifications as displayed in the current implementation codebase `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src`

5. **Current Implementation** - This codebase: `C:\Users\james\Master\BrightHub\brun\train-data\train-wireframe\src` contains existing wireframe's codebase, layout specification, and complete UI details. Please read this entire codebase as it is the latest wireframe being used to build this module.

## Output File
Output the full task list here: 
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E06-output.md`

## Output Format

Generate a task list following this exact structure:

```
# [Product Name] - Feature & Function Task Inventory (Generated [ISO Date])

## 1. Foundation & Infrastructure
### T-1.1.0: [Infrastructure Component Name]
- **FR Reference**: [Functional Requirement ID]
- **Impact Weighting**: [Revenue Impact/Strategic Growth/Operational Efficiency]
- **Implementation Location**: [File/Directory Path]
- **Pattern**: [Architecture Pattern Reference]
- **Dependencies**: [Prerequisite Tasks]
- **Estimated Human Work Hours**: [Range]
- **Description**: [Brief description]
- **Testing Tools**: [Test frameworks/tools]
- **Test Coverage Requirements**: [Coverage percentage]
- **Completes Component?**: [Yes/No - completion description]

**Functional Requirements Acceptance Criteria**:
- [Bullet point list of specific, measurable criteria]
- [Each criterion should be testable and verifiable]
- [Include both user-facing and technical requirements]

#### T-1.1.1: [Sub-task Name]
- **FR Reference**: [Reference]
- **Parent Task**: T-1.1.0
- **Implementation Location**: [Specific file/component path]
- **Pattern**: [Specific pattern]
- **Dependencies**: [Direct dependencies]
- **Estimated Human Work Hours**: [Range]
- **Description**: [Detailed description of sub-task]

**Components/Elements**:
- [T-1.1.1:ELE-1] [Element name]: [Element description]
  - Stubs and Code Location(s): [Specific file references with line numbers if available]
- [T-1.1.1:ELE-2] [Element name]: [Element description]
  - Stubs and Code Location(s): [Specific file references]

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] [Preparation step] (implements ELE-X)
   - [PREP-2] [Preparation step] (implements ELE-X)
2. Implementation Phase:
   - [IMP-1] [Implementation step] (implements ELE-X)
   - [IMP-2] [Implementation step] (implements ELE-X)
3. Validation Phase:
   - [VAL-1] [Validation step] (validates ELE-X)
   - [VAL-2] [Validation step] (validates ELE-X)
```

## Task Organization Guidelines

### 1. Category Structure
Organize tasks into these primary categories:
- **Foundation & Infrastructure** - Core setup, authentication, database, APIs
- **Data Management & Processing** - Data models, processing pipelines, validation
- **User Interface Components** - Reusable UI components, design system
- **Feature Implementation** - Business logic, workflows, integrations
- **Quality Assurance & Testing** - Testing frameworks, validation, monitoring
- **Deployment & Operations** - CI/CD, monitoring, security, performance

### 2. Task Numbering System
- Main tasks: T-[Category].[Sequence].0 (e.g., T-1.1.0, T-2.3.0)
- Sub-tasks: T-[Category].[Sequence].[Sub] (e.g., T-1.1.1, T-1.1.2)
- Elements: T-[Task]:[ELE-[Number]] (e.g., T-1.1.1:ELE-1)

### 3. Task Ordering Priority
Order tasks for optimal development flow and user-centric testing:
1. **Foundation First** - Infrastructure that everything depends on
2. **Data Layer** - Database models, APIs, data processing
3. **Core Components** - Essential UI components and patterns
4. **User Workflows** - Complete user journeys from start to finish
5. **Advanced Features** - Enhancements and optimizations
6. **Integration & Deployment** - External integrations and production setup

## Analysis Framework

### Frontend Task Analysis
For each wireframe/UI element, identify:
- **Component Structure** - Atomic components, composite components, layouts
- **State Management** - Local state, global state, form state, async state
- **User Interactions** - Click handlers, form submissions, navigation
- **Data Requirements** - API calls, data transformations, caching
- **Responsive Design** - Mobile adaptations, breakpoint handling
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

### Backend Task Analysis
For each functional requirement, identify:
- **Data Models** - Database schemas, relationships, validation rules
- **API Endpoints** - CRUD operations, business logic endpoints, authentication
- **Business Logic** - Processing workflows, validation, calculations
- **Integrations** - Third-party services, external APIs, webhook handlers
- **Security** - Authentication, authorization, data protection
- **Performance** - Caching, optimization, scaling considerations

### Full-Stack Integration
Identify connection points requiring both frontend and backend work:
- **Authentication Flow** - Login/logout, session management, protected routes
- **Data Synchronization** - Real-time updates, optimistic updates, conflict resolution
- **File Handling** - Upload, processing, storage, retrieval
- **Search & Filtering** - Query interfaces, result processing, pagination
- **Notifications** - Real-time alerts, email notifications, push notifications

## Quality Standards

### Task Completeness Criteria
Each task must include:
- **Clear Scope** - Specific deliverables and boundaries
- **Testable Acceptance Criteria** - Measurable success conditions
- **Dependency Mapping** - Prerequisites and dependents
- **Implementation Guidance** - Specific patterns and approaches
- **Integration Points** - How it connects to other tasks

### Technical Requirements
Ensure all tasks cover:
- **Type Safety** - TypeScript definitions and strict typing
- **Error Handling** - Graceful failures and user feedback
- **Performance** - Loading states, optimization, caching
- **Security** - Input validation, authorization, data protection
- **Accessibility** - WCAG compliance, keyboard navigation
- **Testing** - Unit tests, integration tests, e2e tests

### Business Requirements
Ensure all tasks address:
- **User Value** - Clear user benefit and use case
- **Data Integrity** - Consistent and reliable data handling
- **Business Logic** - Correct implementation of business rules
- **Workflow Support** - Complete user journeys and edge cases
- **Reporting & Analytics** - Usage tracking and business metrics

## Special Considerations

### React Application Patterns
- **Server Components** - Identify static vs. interactive content
- **Client Boundaries** - Minimize client-side JavaScript where possible
- **Data Fetching** - Server-side data loading and caching strategies
- **State Management** - Component-level vs. application-level state
- **Performance** - Code splitting, lazy loading, bundle optimization

### Production Readiness
- **Monitoring** - Error tracking, performance monitoring, user analytics
- **Security** - Authentication, authorization, data protection, OWASP compliance
- **Scalability** - Database optimization, caching, CDN, auto-scaling
- **Reliability** - Error boundaries, fallback states, graceful degradation
- **Maintainability** - Code organization, documentation, testing coverage

### Database & Backend Integration
- **Data Architecture** - Relational vs. NoSQL considerations
- **API Design** - RESTful principles, GraphQL considerations, versioning
- **Real-time Features** - WebSocket connections, Server-Sent Events
- **Background Processing** - Job queues, scheduled tasks, batch processing
- **External Integrations** - Third-party APIs, webhooks, message queues

## Expected Deliverable

Generate a comprehensive task list containing:
- **50-200 tasks** depending on application complexity
- **Complete coverage** of all features shown in wireframes
- **Full-stack implementation** covering both frontend and backend
- **Production-ready scope** including testing, security, and deployment
- **User-centric ordering** enabling incremental testing and validation
- **Clear dependencies** showing optimal development sequence
- **Specific acceptance criteria** for each task and sub-task
- **Ouput File** the full task list here:
`C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E06-output.md`

The resulting task list should serve as a complete development roadmap for `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-train-FR-wireframes-E06.md`, enabling any development team to build the `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src` wireframes into a fully functional, production-ready application with live data integration.
