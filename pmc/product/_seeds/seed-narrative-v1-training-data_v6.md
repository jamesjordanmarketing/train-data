**4-Word Vision:**  
Interactive LoRA Conversation Generation

**One-Sentence Summary:**  
The Bright Run Training Data Generation Module transforms the manual, console-based process of creating LoRA training conversations into an intuitive, UI-driven workflow that enables non-technical users to generate, review, and manage high-quality conversation datasets through intelligent prompt templates, dimensional filtering, and real-time progress tracking.

## **Module Vision: The Conversation Generation Engine**

This seed narrative defines the foundational requirements for the Bright Run Training Data Generation Module. This module is one of the core modules in the SaaS platform Bright Run, which itself is part of the commercial-grade Software-as-a-Service (SaaS) platform Bright Mode. The Bright Mode platform delivers truly personalized AI for small businesses by creating LLMs that think with the customer's brain and speak with their unique voice.

The Training Data Generation Module receives categorized and chunked documents from the previous pipeline stages and enables users to generate synthetic conversation training data at scale through an interactive web interface. This replaces the current manual console-based approach where users must copy, paste, and execute JSON prompts individually.

The key insight: generating high-quality training conversations requires control, visibility, and flexibility—not just automation. Users need to select, filter, generate, and review conversations individually or in batches, with full transparency into the generation process.

## **The Core Problem:**

After categorizing documents and extracting semantic chunks, businesses need to generate hundreds of high-quality training conversations that reflect their unique expertise, tone, and customer interactions. The current approach requires:
- Manually copying and pasting JSON prompts into Claude
- Executing one prompt at a time in the console
- Manually saving each generated conversation to a file
- No visibility into generation progress or status
- No way to batch-generate multiple conversations
- No structured database to store and manage conversations
- No quality review or approval workflow

This manual process is error-prone, time-consuming, and does not scale to the 90-100 conversations needed per training dataset. Businesses need a sophisticated UI-driven system that automates generation while maintaining human oversight and control.

## **How Life Changes:**

Business experts log into the Bright Run platform and navigate to the Training Data Generation dashboard. They see a clean, organized table showing all potential conversation scenarios derived from their emotional taxonomy, persona profiles, and content categories. Each row represents one conversation to be generated.

Users can:
- Filter conversations by persona, emotion, topic, intent, and other dimensions
- Generate a single conversation by clicking "Generate" on any row
- Select multiple conversations and batch-generate them sequentially
- Click "Generate All" to process the entire dataset
- Watch real-time progress indicators showing which conversation is being generated
- Review generated conversations in a formatted preview panel
- Approve, reject, or flag conversations for editing
- Export approved conversations as JSON for LoRA training

The system handles all the technical complexity—prompt template management, parameter injection, API calls, response validation, database storage—while giving users complete visibility and control over the generation process.

## **Input/Output for this Module:**

This module is the third stage in the larger LoRA training data creation pipeline.

**Input:** 
- Categorized documents with metadata from Document Categorization module
- Semantic chunks with 60 dimensions from Chunk-Alpha module
- 10 seed conversations (already generated manually via console)
- Emotional taxonomy defining conversation dimensions
- Persona profiles with characteristics and traits
- Scenario templates for conversation contexts

**Output:** 
- 90-100 additional synthetic training conversations stored in Supabase
- Normalized database schema supporting:
  - Master conversation records
  - Individual dialogue turns
  - Conversation metadata and dimensions
  - Generation audit logs and history
- Structured JSON exports ready for LoRA training pipeline

---

## **System Context & Architecture Vision**

### **Current State: Console-Based Generation**

The current system (documented in `c-alpha-build_v3.4-LoRA-FP-100-spec.md`) requires:
1. User opens text editor with JSON prompt template
2. User manually replaces placeholders (persona, emotion, topic, etc.)
3. User copies entire prompt to Claude console
4. User waits for Claude to generate conversation
5. User copies response and saves to JSON file
6. User repeats 90 more times for complete dataset

This works but does not scale or provide quality controls.

### **Future State: UI-Driven Generation**

The new system will provide:
1. **Conversation Dashboard** - Table view of all conversation scenarios
2. **Dimensional Filters** - Multi-select controls for persona, emotion, content type, intent, tone, topic cluster, outcome type
3. **Generation Controls** - Single, batch, and "generate all" buttons
4. **Progress Monitoring** - Real-time status indicators and logs
5. **Review Interface** - Formatted conversation preview with approval workflow
6. **Database Management** - Normalized Supabase schema with full audit trail
7. **Export Capabilities** - Structured JSON export for training pipeline

### **Integration Points**

**Codebase Location:** `C:\Users\james\Master\BrightHub\brun\train-data\src`

The module will integrate into the existing Next.js 14 application using:
- Existing authentication and user management
- Shared UI component library (shadcn/ui)
- Consistent styling and design patterns
- Common database service layer (Supabase)
- Established API patterns and error handling

**Data Dependencies:**
- Must read document categories from `documents` and `document_categories` tables
- Must read chunk data from `chunks` and `chunk_dimensions` tables
- Must access persona profiles and emotional taxonomy data
- Must read and display 10 seed conversations as examples

---

## **Three-Tier Prompt Architecture**

The system uses a sophisticated three-tier approach to conversation generation:

### **Tier 1: Template-Driven Conversations (40 conversations)**
**Purpose:** Generate bulk dataset foundation using emotional arc templates

**Characteristics:**
- Based on 5 emotional arc templates (Triumph, Struggle-to-Success, Plateau-to-Breakthrough, Emergency-to-Calm, Exploratory)
- Each template defines emotional progression throughout conversation
- Parameters: persona type, starting emotion, ending emotion, topic category
- Highly structured and predictable format
- Ideal for foundational training data

**Example Scenario:**
- Persona: Anxious First-Time Investor
- Arc Template: Struggle-to-Success
- Starting Emotion: Fear/Uncertainty
- Ending Emotion: Confidence/Relief
- Topic: Initial Portfolio Setup

### **Tier 2: Scenario-Based Conversations (35 conversations)**
**Purpose:** Add domain realism through context-rich scenarios

**Characteristics:**
- Based on real-world customer situations
- Incorporates domain expertise and industry context
- Parameters: persona profile, scenario context, desired outcome, complexity level
- More nuanced and realistic than template-driven
- Captures authentic problem-solving interactions

**Example Scenario:**
- Persona: Mid-Career Professional
- Context: Inheritance windfall + career transition + retirement concerns
- Complexity: High (multiple interrelated financial decisions)
- Desired Outcome: Comprehensive financial plan with prioritized actions

### **Tier 3: Edge Case Conversations (15 conversations)**
**Purpose:** Test boundaries and handle unusual situations

**Characteristics:**
- Tests system robustness with unusual scenarios
- Handles edge cases, boundary conditions, extreme emotions
- Parameters: edge case type, stress factors, resolution strategy
- Ensures model can handle difficult conversations
- Validates broad capability coverage

**Example Scenario:**
- Persona: Recently Widowed + Financial Trauma
- Edge Case Type: Emotional overwhelm + urgent decisions
- Stress Factors: Grief, time pressure, financial confusion
- Resolution: Empathetic pacing + simplified action steps

---

## **Conversation Quality Framework**

Each generated conversation must meet quality standards across multiple dimensions:

### **Structural Requirements**
- **Turn Count:** 8-16 turns (4-8 exchanges between user and assistant)
- **Turn Length:** User messages 20-150 words, Assistant responses 50-250 words
- **Progression:** Clear beginning (problem statement) → middle (exploration/problem-solving) → end (resolution/next steps)
- **Pacing:** Natural conversation rhythm with appropriate pauses, acknowledgments, clarifications

### **Content Requirements**
- **Domain Accuracy:** Factually correct financial planning advice
- **Emotional Authenticity:** Realistic emotional expressions matching persona and arc
- **Persona Consistency:** Character traits and voice maintained throughout
- **Topic Coverage:** Stays focused on declared topic while allowing natural tangents
- **Outcome Achievement:** Reaches declared conversation goal or outcome

### **Dimensional Attributes**
Each conversation must have clearly defined:
- **Persona:** Primary character with defined traits (from persona profiles)
- **Emotion:** Starting and progression of emotional state
- **Content Category:** Financial planning domain (retirement, investment, insurance, etc.)
- **Intent:** User's primary goal (get advice, make decision, understand options, etc.)
- **Tone:** Conversation atmosphere (professional, casual, urgent, exploratory)
- **Topic Cluster:** Specific subject matter grouping
- **Outcome Type:** Result classification (resolved, action plan, referral, ongoing)

### **Metadata Requirements**
- **Generation Source:** Which tier and template/scenario produced it
- **Parameter Set:** All parameters used in generation
- **Quality Score:** Automated scoring (1-10) based on structural criteria
- **Review Status:** Unreviewed / Approved / Needs Edit / Rejected
- **Reviewer Notes:** Human feedback for quality improvement

---

## **Database Architecture Vision**

The system requires a normalized Supabase database structure to manage conversations at scale:

### **Core Tables**

**1. conversations** (Master Records)
- Stores one record per conversation
- Links to persona, emotional_arc, scenario
- Tracks generation parameters and metadata
- Records review status and quality scores

**2. conversation_turns** (Dialogue Content)
- Stores each individual message/turn
- Links to parent conversation
- Includes role (user/assistant), text, sequence order
- Supports flexible turn counts per conversation

**3. conversation_metadata** (Dimensional Attributes)
- Stores key-value pairs of conversation dimensions
- Persona type, emotion, content category, intent, tone, topic cluster, outcome
- Supports flexible metadata without schema changes
- Enables powerful filtering and querying

**4. personas** (Character Profiles)
- Stores detailed persona definitions
- Name, description, traits, communication style, background
- Referenced by conversations table

**5. emotional_arcs** (Journey Templates)
- Stores emotional arc definitions for Tier 1
- Arc name, progression curve, emotional milestones
- JSON or structured format for arc definition

**6. scenarios** (Context Templates)
- Stores scenario definitions for Tier 2
- Scenario title, context description, complexity level
- Seed prompt structure

**7. generation_queue** (Processing Management)
- Tracks batch generation jobs
- Status (pending, in_progress, completed, failed)
- Progress tracking (X of Y conversations generated)

**8. generation_logs** (Audit Trail)
- Logs all generation attempts
- Request parameters, response, errors
- Timestamp, duration, cost tracking

### **Data Migration Required**

The 10 seed conversations currently stored as JSON files must be migrated to the database:
- Parse JSON structure
- Extract conversation turns
- Populate metadata dimensions
- Link to appropriate personas and scenarios
- Set status as "seed" or "approved"

Files to migrate:
```
c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json
c-alpha-build_v3.4-LoRA-FP-convo-02-complete.json
...
c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json
```

---

## **User Interface Requirements**

### **Dashboard Experience**
The main conversation dashboard must provide:

**A. Conversation Table**
- One row per potential conversation (90-100 rows)
- Columns: ID, Persona, Emotion, Topic, Tier, Status, Last Updated, Actions
- Sortable by any column
- Multi-select checkboxes for batch operations
- Status badges (Not Generated / Generating / Generated / Approved / Rejected)

**B. Dimensional Filters** (Top 8 Dimensions)
- Multi-select dropdowns for each dimension
- Filters: Persona Type, Emotional State, Content Category, Intent, Tone, Topic Cluster, Outcome Type, Tier
- Real-time table filtering as selections change
- "Clear All Filters" button
- Selected filter badges with x-to-remove

**C. Generation Controls**
- **"Generate" button** per row - Generates single conversation
- **"Generate Selected" button** - Batch-generates all checked conversations
- **"Generate All" button** - Processes all conversations sequentially
- **"Stop" button** - Cancels generation queue without data loss
- Buttons disabled/enabled based on context (already generated, in progress, etc.)

**D. Progress Monitoring**
- Progress bar showing "X of Y conversations generated"
- Current operation indicator ("Generating Conversation #47: Anxious Investor - Retirement Planning")
- Estimated time remaining
- Error log with expandable details
- Success/failure counts

**E. Conversation Preview Panel**
- Triggered by clicking on conversation row
- Shows formatted conversation with turn-by-turn display
- Metadata sidebar showing all dimensions
- Generation parameters displayed
- Quality score visualization
- Approval/rejection buttons
- Edit notes textarea

**F. Export Interface**
- Select conversations for export (all approved, all generated, custom selection)
- Export format options (JSON, CSV metadata)
- Preview export structure
- Download button

### **Styling & UX Requirements**
- Modern, clean design using shadcn/ui components
- Consistent with existing Bright Run application style
- Responsive design (desktop primary, mobile-friendly)
- Loading states and skeletons during async operations
- Toast notifications for success/error feedback
- Confirmation dialogs for destructive actions

---

## **Prompt Template System**

The system requires a flexible, database-driven prompt template engine:

### **Template Structure**
Each prompt template includes:
- **Template Name:** Identifier (e.g., "Tier 1 - Triumph Arc")
- **Tier:** Which tier this template belongs to (1, 2, or 3)
- **Prompt Text:** Full Claude prompt with placeholders
- **Placeholders:** List of parameters to inject (${persona_name}, ${emotion_start}, ${topic}, etc.)
- **Response Schema:** Expected JSON structure for validation
- **Active/Inactive:** Toggle for testing new templates

### **Parameter Injection**
Before sending to Claude API:
1. Load appropriate template based on tier and configuration
2. Replace all placeholders with actual values from conversation parameters
3. Validate all required parameters are present
4. Format as proper Claude API request

### **Response Validation**
After receiving Claude response:
1. Parse JSON structure
2. Validate against expected schema
3. Check conversation meets quality criteria (turn count, length, etc.)
4. Calculate quality score
5. Store in database with validation results

---

## **Generation Workflow**

### **Single Conversation Generation**
1. User clicks "Generate" button on conversation row
2. System loads conversation parameters (persona, emotion, topic, etc.)
3. System selects appropriate prompt template based on tier
4. System injects parameters into template
5. System calls Claude API with constructed prompt
6. System validates response structure and quality
7. System parses conversation turns
8. System saves conversation and turns to database
9. System updates conversation status to "Generated"
10. System displays success notification
11. System refreshes table row to show new status

### **Batch Generation**
1. User selects multiple conversations (checkboxes)
2. User clicks "Generate Selected" button
3. System creates generation queue with selected conversations
4. System shows progress modal with live status
5. For each conversation in queue:
   - Generate conversation (same as single flow)
   - Update progress indicator
   - Log success/failure
   - Continue to next conversation
6. System shows completion summary (X succeeded, Y failed)
7. System updates table to show all new statuses

### **Generate All**
- Same as batch generation but includes all conversations in table
- Special confirmation dialog warning about cost and time
- Ability to resume if interrupted

---

## **Integration with Previous Modules**

### **From Document Categorization Module**
The system needs access to:
- Document primary categories (for content category dimension)
- Document secondary tags (for topic and intent dimensions)
- Document metadata (for context and relevance)

### **From Chunk-Alpha Module**
The system may reference:
- Chunk dimensions for conversation context
- High-quality chunks as example content
- Semantic patterns for conversation flow

### **Seed Conversations**
The 10 existing seed conversations serve as:
- Quality benchmarks for new generations
- Examples for prompt template development
- Training data for quality scoring models
- Reference material for users

---

## **Emotional Taxonomy & Persona Integration**

### **Emotional Taxonomy** (From: `c-alpha-build_v3.4_emotional-dataset-emotional-taxonomy.md`)
The system must incorporate the defined emotional dimensions:
- Starting emotional state
- Emotional progression/arc
- Emotional resolution
- Emotional intensity levels
- Emotional authenticity scoring

### **Persona Profiles** (From: `financial-planner-demo-conversation-and-metadata_v1.txt`)
The system must support diverse persona types:
- Demographics (age, career stage, life situation)
- Financial background (experience level, current situation)
- Personality traits (risk tolerance, decision style, communication preferences)
- Emotional baseline (anxious, confident, overwhelmed, curious)
- Goals and motivations

Example personas:
- Anxious First-Time Investor (young, inexperienced, fearful)
- Mid-Career Professional (established, proactive, analytical)
- Recent Retiree (transitioning, uncertain, cautious)
- Small Business Owner (complex needs, time-constrained, results-focused)

---

## **Technology Stack Requirements**

### **Frontend**
- **Next.js 14** with App Router for modern React architecture
- **TypeScript** for type-safe development
- **shadcn/ui** as primary UI component library
- **Tailwind CSS** for styling and responsive design
- **React Hook Form** for form management (if needed for filters/config)
- **TanStack Table** for advanced table functionality (sorting, filtering, selection)
- **Sonner** for toast notifications
- **Lucide React** for icons

### **Backend Services**
- **Supabase** for database and real-time subscriptions
- **PostgreSQL** as underlying database
- **Supabase Edge Functions** for serverless API endpoints (if needed)
- **Row Level Security (RLS)** for data isolation (future consideration)

### **AI Integration**
- **Claude Sonnet 4.5** as default LLM endpoint
- **Anthropic API** for conversation generation
- Configurable API endpoint (manual code configuration initially)
- API key management via environment variables

### **State Management**
- **React Context API** for global state
- **Zustand** for complex state management (if needed)
- **React Query** for server state and caching

---

## **Quality Assurance & Success Criteria**

### **Generation Quality Targets**
- **95% Success Rate:** 95 of 100 conversations meet quality standards on first generation
- **Structural Validity:** 100% of generated conversations parse as valid JSON
- **Turn Count Compliance:** 90%+ conversations have 8-16 turns
- **Length Compliance:** 85%+ turns meet length requirements (20-150 words user, 50-250 words assistant)
- **Persona Consistency:** Human review confirms persona traits maintained throughout

### **System Performance Targets**
- **Generation Speed:** Single conversation generated in 15-45 seconds
- **Batch Throughput:** 100 conversations completed in 30-60 minutes
- **UI Responsiveness:** All interactions respond within 200ms (excluding API calls)
- **Progress Accuracy:** Progress indicators update within 2 seconds of actual status
- **Error Recovery:** Failed generations logged and allow retry without data loss

### **User Experience Targets**
- **Dashboard Load Time:** Full table loads in under 3 seconds
- **Filter Responsiveness:** Table updates within 500ms of filter change
- **Preview Load Time:** Conversation preview displays within 1 second
- **Export Speed:** 100 conversations export in under 10 seconds
- **Clear Feedback:** All actions result in visible confirmation (toast, status change, etc.)

---

## **Out of Scope (For Initial Implementation)**

To maintain focus and ensure timely delivery, the following features are explicitly out of scope:

### **Not in Initial Scope**
- Manual conversation creation/editing interface (users cannot write conversations manually)
- Custom prompt template editor (templates are pre-defined and code-managed)
- Advanced analytics and reporting dashboards
- Multi-user collaboration features (comments, assignments)
- Version history and rollback for conversations
- A/B testing different prompt templates
- Cost optimization and API usage analytics
- Integration with other LLM providers (OpenAI, etc.)
- Automated quality scoring using separate ML model
- Real-time collaborative editing
- Conversation branching and variations
- Advanced search and semantic similarity matching

### **Future Enhancements (Phase 2+)**
- Custom persona creation interface
- Prompt template visual editor
- Conversation analytics dashboard
- Cost tracking and budgeting
- Quality improvement recommendations
- Automated conversation variations
- Integration with LoRA training pipeline
- Performance optimization and caching
- Advanced filtering (semantic search, similarity)
- Bulk import/export workflows

---

## **Key Reference Documents**

The following documents provide essential context and should be referenced during detailed specification development:

### **Process & Methodology**
- `c-alpha-build_v3.4-LoRA-FP-100-spec.md` - Original console-based generation spec
- `c-alpha-build_v3.4-LoRA-FP-generation_v3.md` - Generation process details
- `GENERATION-COMPLETE-STATUS.md` - Current generation status and learnings
- `c-alpha-build_v3.4-LoRA-FP-COMPLETE-DATASET-SUMMARY.md` - Dataset completeness criteria

### **Data Structures**
- `c-alpha-build_v3.4_emotional-dataset-emotional-taxonomy.md` - Emotional dimension definitions
- `financial-planner-demo-conversation-and-metadata_v1.txt` - Persona profiles
- `c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json` - Example seed conversation structure

### **Product Context**
- `01-bmo-overview-chunk-alpha_v2.md` - Overall product vision and architecture
- `03-bmo-functional-requirements.md` - Functional requirements template
- `04-bmo-FR-wireframes-output-E06.md` - FIGMA wireframe mapping example

---

## **Principles & Constraints**

### **Design Principles**
1. **Human Oversight:** Automation serves humans, not replaces them. Users must have visibility and control.
2. **Incremental Progress:** Users can generate one, some, or all conversations. System supports all workflows.
3. **Quality Over Speed:** Better to generate 90 high-quality conversations slowly than 100 mediocre ones quickly.
4. **Transparency:** Users always know what's happening, why, and what to do next.
5. **Fault Tolerance:** Failures don't lose data. Users can retry, skip, or continue.

### **Technical Constraints**
1. **API Rate Limits:** Claude API has rate limits. System must handle throttling gracefully.
2. **Cost Management:** Each conversation costs $0.02-0.05. Users should see cost estimates.
3. **Response Time:** Claude responses take 15-45 seconds. UI must show progress.
4. **Database Size:** 100 conversations with 8-16 turns each = 800-1600 turn records. Schema must be efficient.
5. **Browser Performance:** Table with 100 rows must remain responsive with filtering/sorting.

### **Business Constraints**
1. **Timeline:** Module should reach MVP within 2-3 development sprints
2. **Complexity:** Prioritize core workflows over edge cases and nice-to-haves
3. **Integration:** Must work seamlessly with existing application (no separate deployment)
4. **User Training:** UI must be intuitive enough to require minimal documentation
5. **Scalability:** Architecture must support 1000+ conversations in future iterations

---

## **Next Steps for Specification Development**

This seed narrative will be used to generate:

### **1. Detailed User Stories** (Using: `02-product-user-stories-prompt-template-v2-wf.md`)
User stories should cover:
- All stakeholder roles (business owner, domain expert, quality reviewer)
- All main workflows (filter, generate single, batch, review, export)
- All UI interactions (table, filters, buttons, preview panel)
- All quality and performance expectations
- All error handling and edge cases

### **2. Comprehensive Functional Requirements** (Using: `3a-preprocess-functional-requirements-prompt_v1.md`)
Functional requirements should specify:
- Exact database schema with all tables, columns, relationships
- Complete API endpoint definitions (request/response formats)
- Detailed UI component specifications (layout, controls, styling)
- Full prompt template structure and parameter injection logic
- Complete generation workflow with error handling
- Export functionality and format specifications
- Performance requirements and acceptance criteria

### **3. FIGMA Wireframe Specifications**
Using functional requirements to create detailed wireframes for:
- Main conversation dashboard with table and filters
- Generation controls and progress monitoring
- Conversation preview and review interface
- Export configuration screen
- All modal dialogs and notifications

---

## **Conclusion**

The Training Data Generation Module transforms the labor-intensive, error-prone process of manual conversation generation into an efficient, user-friendly workflow. By providing dimensional filtering, flexible generation modes (single, batch, all), real-time progress monitoring, and structured quality review, the module empowers non-technical business owners to create high-quality LoRA training datasets at scale.

The three-tier prompt architecture (Template-Driven, Scenario-Based, Edge Cases) ensures comprehensive coverage of training scenarios while maintaining quality and authenticity. The normalized database structure provides robust data management, audit trails, and export capabilities.

This seed narrative provides the foundational vision, requirements, and constraints needed to develop detailed user stories and functional specifications. The resulting module will be a critical component of the Bright Run platform, enabling small businesses to create custom AI models that truly reflect their unique expertise and voice.

---

**Document Version:** v6.0  
**Last Updated:** October 25, 2025  
**Status:** Seed Narrative for User Stories & Functional Requirements Generation  
**Module Dependencies:** Document Categorization (completed), Chunk-Alpha (completed)  
**Next Module:** Training Data Generation (this module - to be built)

