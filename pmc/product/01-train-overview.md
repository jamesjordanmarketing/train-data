# Interactive LoRA Conversation Generation Module - Product Overview
**Version:** 1.0  
**Date:** 10-26-2025  
**Category:** LoRA Fine-Tuning Training Data Generation Platform  
**Product Abbreviation:** train

**Source References:**
- Seed Story: `pmc/product/00-train-seed-story.md`
- Template: `pmc/product/_templates/01-overview-template.md`
- Example: `pmc/product/_examples/01-aplio-mod-1-overview.md`
- Current Codebase: `src/` (Document Categorization & Chunk Extraction Complete)

---

## Product Summary & Value Proposition

The Interactive LoRA Conversation Generation Module transforms the manual, console-based process of creating training conversations into an intuitive, UI-driven workflow that empowers non-technical business experts to generate, filter, review, and manage high-quality synthetic conversation datasets. This module completes the Bright Run platform's end-to-end pipeline from document upload to LoRA-ready training data.

### The Problem We Solve

After categorizing documents and extracting semantic chunks with 60 dimensions, businesses face a critical bottleneck: generating 90-100 high-quality training conversations that authentically reflect their unique expertise, customer interactions, and communication style. The current manual approach requires:

- Copying JSON prompts into Claude console one at a time
- Manually saving responses to individual files
- Tracking progress using external spreadsheets or paper notes
- Reviewing conversations by opening raw JSON files in text editors
- Manually consolidating approved files into training datasets
- No quality validation, confidence scoring, or audit trails
- No multi-dimensional filtering or organization capabilities

**This manual process is fundamentally unscalable for the 90-100 conversations needed per dataset**, taking weeks instead of hours and preventing effective quality control.

### Core Value Proposition

1. **Automation Over Manual Work**
   - Replace error-prone console-based generation with one-click batch processing
   - Automated API orchestration with rate limiting and error handling
   - Background processing allowing users to close browser without interruption
   - 95%+ time savings (weeks → hours)

2. **Quality Control Framework**
   - Automated structural validation (turn count, length, JSON format)
   - Confidence scoring flagging low-quality conversations for review
   - Human-in-the-loop approval workflow ensuring training data excellence
   - Three-tier architecture (Template, Scenario, Edge Case) for comprehensive coverage

3. **Complete Visibility**
   - Real-time progress tracking with status indicators
   - Detailed logs showing generation, review, and approval history
   - Cost tracking with pre-generation estimates and real-time monitoring
   - Complete audit trail for AI governance and compliance

4. **Business-Aligned Organization**
   - Multi-dimensional filtering by persona, emotion, topic, intent, tone, tier
   - Coverage analysis ensuring balanced representation across taxonomy
   - Centralized dashboard with sortable, filterable table view
   - Database-backed storage enabling version history and comparison

5. **Professional Export**
   - Industry-standard JSON format matching OpenAI/Anthropic training data specs
   - Export only approved conversations with quality statistics
   - Multiple format options for different LoRA pipelines
   - Immediate integration with standard fine-tuning workflows

### What Business Value Does It Deliver?

- **Immediate:** 95% time savings, zero technical knowledge required, complete workflow automation
- **Short-term:** Higher quality training datasets leading to better performing personalized AI models
- **Long-term:** Democratized access to custom AI, leveling the playing field for small businesses competing against larger enterprises

### How Does It Fit Into the Larger Ecosystem?

The Conversation Generation Module completes the three-stage Bright Run pipeline:
1. **Stage 1 (Complete):** Document Categorization - Upload, extract text, assign business value categories
2. **Stage 2 (Complete):** Chunk Extraction & Dimension Generation - AI-powered semantic chunking with 60-dimensional classification
3. **Stage 3 (This Module):** Conversation Generation - Transform chunks into LoRA-ready training conversations with quality control

---

## Target Audience & End Users

### Primary Users

#### 1. Small Business Owners & Domain Experts (Core Customer)
**Who They Are:**
- Business owners and subject matter experts (10-500 employees)
- Industries: Financial services, healthcare, legal, consulting, education
- Deep domain knowledge but limited technical skills
- Cannot afford dedicated AI engineering teams

**Key Responsibilities:**
- Strategic direction for AI personalization
- Quality assurance for brand voice and expertise
- Budget approval for AI training initiatives

**Technical Expertise Level:**
- Non-technical: Comfortable with business software (Excel, Salesforce, email)
- No prompt engineering or AI development experience
- Need intuitive UIs with clear guidance and feedback

**What Success Looks Like:**
- Generate complete 90-100 conversation dataset in 3-5 hours
- Maintain brand voice and expertise authenticity
- Control costs with transparent pricing and estimates
- Export ready-to-use training data for LoRA pipelines

#### 2. Content Managers & Knowledge Stewards (Daily Users)
**Who They Are:**
- Content managers, knowledge managers, business analysts
- Responsible for curating and managing company intellectual property
- Bridge gap between business experts and technical implementation

**Key Responsibilities:**
- Day-to-day management of conversation generation workflow
- Quality review and approval of generated conversations
- Dataset organization and balanced coverage analysis
- Export preparation and delivery to training pipelines

**Technical Expertise Level:**
- Moderately technical: Comfortable with databases, spreadsheets, analytics
- May have basic understanding of AI concepts
- Need powerful tools with clear organization and filtering

**What Success Looks Like:**
- Review 20-30 conversations per hour efficiently
- Identify low-quality conversations requiring regeneration
- Ensure balanced coverage across persona, emotion, topic dimensions
- Maintain complete audit trails for compliance

#### 3. AI Strategy Leaders & Technical Decision Makers (Influencers)
**Who They Are:**
- CTOs, AI strategists, technical leaders
- Evaluating platforms for custom LLM development
- Need to balance business accessibility with technical rigor

**Key Responsibilities:**
- Technical architecture decisions and platform evaluation
- Scalability and performance requirements
- Integration with existing AI/ML pipelines
- Compliance and governance oversight

**Technical Expertise Level:**
- Highly technical: Deep understanding of LLMs, fine-tuning, and AI architecture
- Evaluate technical sophistication, quality frameworks, and scalability
- Need transparency into system architecture and data lineage

**What Success Looks Like:**
- User-friendly UI maintaining technical sophistication
- Normalized database schema supporting thousands of conversations
- Complete audit trail with API response tracking
- Open JSON export format integrating with standard LoRA pipelines

### Pain Points

#### 1. Manual Console-Based Generation Workflow
- **Current State:** Copying JSON prompts into Claude console one at a time, manually saving responses
- **Impact:** Fundamentally unscalable for 90-100 conversations needed per dataset
- **Frustration:** Takes weeks instead of hours, error-prone, no automation
- **Risk:** Inconsistent quality, missing conversations, lost progress

#### 2. No Visibility or Progress Tracking
- **Current State:** Users have no way to see which conversations generated, in progress, or failed
- **Impact:** Anxiety about system state, cannot effectively plan workday
- **Frustration:** Constantly refreshing, checking files manually, using external tracking
- **Risk:** Duplicated effort, incomplete datasets, wasted API costs

#### 3. Missing Quality Review and Approval Workflow
- **Current State:** Generated conversations go directly into training data without human review
- **Impact:** No quality control, consistency checking, or ability to reject poor conversations
- **Frustration:** Training on low-quality data, no way to iterate and improve
- **Risk:** AI models trained on inappropriate or low-quality conversations

#### 4. No Database Storage or Organization System
- **Current State:** Conversations exist as individual JSON files scattered across file system
- **Impact:** No centralized storage, no metadata, no relationships, cannot query or analyze
- **Frustration:** Manual file management, no version control, no traceability
- **Risk:** Lost conversations, no audit trail, compliance issues

#### 5. Cannot Batch Generate or Process at Scale
- **Current State:** Must generate each conversation individually in manual sequence
- **Impact:** Impossible to leverage batch processing or automated workflows
- **Frustration:** Hours of repetitive manual work
- **Risk:** User burnout, project abandonment, competitive disadvantage

#### 6. Lack of Prompt Template Management System
- **Current State:** Prompt templates exist as static text files requiring manual editing
- **Impact:** No version control, no parameter injection, no A/B testing
- **Frustration:** Cannot iterate templates, no quality metrics per template
- **Risk:** Suboptimal prompts, inconsistent results, no improvement process

#### 7. Missing Dimensional Filtering Capabilities
- **Current State:** Cannot filter or organize conversations by business dimensions
- **Impact:** Impossible to ensure balanced coverage across taxonomy
- **Frustration:** Cannot analyze persona/emotion/topic distribution
- **Risk:** Unbalanced training datasets, missing critical scenarios

#### 8. No API Integration or Error Handling
- **Current State:** Manual console approach has no programmatic API integration
- **Impact:** No error handling, no retry logic, no response validation
- **Frustration:** Every failure requires manual intervention
- **Risk:** Wasted API costs, lost progress, incomplete datasets

### Solutions Provided

#### 1. Automated Batch Generation with Progress Tracking
- Single "Generate All" button processing entire dataset automatically
- Background processing allowing browser close without interruption
- Real-time progress updates (X of Y conversations, current persona/topic, time remaining)
- Email notifications when generation completes or fails
- Retry logic for failed conversations without losing batch progress

#### 2. Centralized Dashboard with Multi-Dimensional Filtering
- Table view showing all conversations (ID, Persona, Emotion, Topic, Status, Quality Score)
- Sortable columns and search functionality
- Multi-select filters across 8 dimensions (Persona, Emotion, Topic, Intent, Tone, Tier, Status, Quality)
- Coverage visualization showing distribution across taxonomy
- Filter state persistence across browser sessions

#### 3. Human-in-the-Loop Review & Approval Workflow
- Click conversation row to see formatted preview (not raw JSON)
- Turn-by-turn display with readable typography
- Approve/Reject buttons with optional reviewer notes
- Only approved conversations included in export
- Complete audit trail showing who approved/rejected when

#### 4. Automated Quality Validation & Scoring
- Turn count validation (8-16 turns optimal)
- Response length validation (appropriate for context)
- JSON structure validation (must parse correctly)
- Composite quality score (1-10) combining all checks
- Automatic flagging for review if score < 6

#### 5. Normalized Database Architecture
- Conversations table with metadata (persona, emotion, topic, status, quality_score)
- Conversation_turns table with foreign key (normalized structure)
- Indexes on frequently queried fields for performance
- Efficient query performance for 1000+ conversations (< 500ms load time)
- Foreign key constraints maintaining data integrity

#### 6. Cost Transparency and Control
- Pre-generation cost estimate before starting batch
- Real-time cost tracking during generation showing cumulative spend
- Post-generation summary showing actual cost vs. estimate
- Warning dialog if batch cost exceeds configured threshold
- Cost breakdown per conversation in detailed view

#### 7. Professional Export Functionality
- Export only approved conversations in LoRA-ready JSON format
- Multiple format options (OpenAI, Anthropic, generic JSON)
- Metadata header (export date, conversation count, quality stats)
- Descriptive filenames (e.g., training-data-2025-10-26-approved-87-conversations.json)
- Export preview showing sample structure before download

#### 8. Robust API Integration with Error Handling
- Automatic throttling respecting Claude API rate limits
- Exponential backoff for retries (1s, 2s, 4s, 8s, 16s)
- Maximum retry attempts configurable (default 3 attempts)
- Graceful degradation—partial batch success rather than all-or-nothing failure
- Detailed error logging with API response codes and messages

---

## Project Goals

### User Success Goals

#### Small Business Owners Must Be Able To:
1. Generate 90-100 high-quality conversations in 3-5 hours instead of 2-3 weeks
2. Review and approve every conversation before it becomes training data
3. See estimated costs before starting batch generation with real-time tracking
4. Export only approved conversations in standard LoRA training format
5. Ensure balanced coverage across personas, emotions, and topics
6. Trust that AI represents their brand voice and expertise authentically

**Success Metric:** 80%+ approval rate on first generation, < $2.00 per conversation, 95%+ time savings

#### Content Managers Must Be Able To:
1. See all conversations in centralized dashboard with filterable table view
2. Filter by multiple dimensions (persona, emotion, topic, intent, tone, quality)
3. Review 20-30 conversations per hour with formatted preview
4. Bulk approve/reject conversations efficiently
5. Identify low-quality conversations requiring regeneration
6. Track complete audit trail for compliance and governance

**Success Metric:** < 4 hours to review 100 conversations, 100% audit trail completeness

#### Technical Leaders Must Be Able To:
1. Trust normalized database architecture scales to thousands of conversations
2. Rely on robust rate limiting and error handling for production use
3. Access complete API logs and audit trails for debugging
4. Integrate exported JSON with standard LoRA pipelines seamlessly
5. Iterate prompt templates with version control and A/B testing
6. Monitor quality metrics and generation success rates

**Success Metric:** > 95% batch generation success rate, < 500ms database query performance

### Technical Goals

#### 1. Complete Conversation Generation Workflow
- Three-tier prompt architecture (Template, Scenario, Edge Case) implemented
- Single conversation generation with immediate feedback (15-45 seconds)
- Batch generation handling 90-100 conversations with rate limiting
- Real-time progress tracking with polling or WebSocket (updates every 2-5 seconds)
- Background processing supporting browser close/reopen

#### 2. Quality Validation Framework
- Automated structural validation (turn count, length, JSON format)
- Confidence scoring combining multiple quality signals
- Quality score display (1-10) with color coding (red < 6, yellow 6-8, green > 8)
- Automatic flagging for review if score < 6
- Human-in-the-loop approval workflow with reviewer notes

#### 3. Database Architecture & Performance
- Conversations table: id, conversation_id, persona, emotion, topic, status, quality_score, tier, created_at
- Conversation_turns table: id, conversation_id, turn_number, role (user/assistant), content
- Conversation_metadata table: id, conversation_id, key, value (JSONB for flexible metadata)
- Indexes on frequently queried fields (status, quality_score, persona, emotion, tier, created_at)
- Query performance < 500ms for filtered views with 1000+ conversations

#### 4. API Integration & Error Handling
- Claude API integration with Anthropic SDK
- Rate limiting respecting API constraints (e.g., 50 requests/minute)
- Exponential backoff for retries with configurable max attempts
- Granular error handling at conversation level (not batch level)
- Detailed error logging with request/response payloads

#### 5. Multi-Dimensional Filtering System
- Filter dropdowns for 8 dimensions: Persona, Emotion, Topic, Intent, Tone, Tier, Status, Quality
- Multiple filter combinations work together (AND logic)
- Selected filters display as removable badges
- Filter state persists in URL for bookmarking/sharing
- Conversation count updates dynamically as filters applied

#### 6. Export & Integration
- JSON export matching OpenAI/Anthropic standard training format
- Multiple format options configurable
- Export only approved conversations with quality filtering
- Metadata header with export date, count, quality statistics
- Export preview before download

### Business Success Goals

#### 1. Market Position & Competitive Advantage
- First platform offering UI-driven conversation generation for small businesses
- 95%+ time savings compared to manual console-based generation
- Complete integration with document categorization and chunk extraction modules
- Affordable pricing ($50-500/month vs. $5,000+ for enterprise platforms)
- Compelling demo converting 40%+ of prospects to trial

#### 2. User Adoption & Engagement
- 70%+ feature adoption within 3 months of launch
- 60%+ weekly active users of registered users
- 90%+ self-service completion rate without support intervention
- < 5 support tickets per 100 generations
- 4+ stars out of 5 for voice authenticity and quality

#### 3. Quality & Performance Standards
- 80%+ approval rate on first generation
- > 95% batch generation success rate (< 5% failure rate)
- < 500ms database query performance for filtered views
- 100% of rate limit errors recovered automatically
- 100% compliance audit pass rate (full audit trail)

#### 4. Revenue Impact & Efficiency
- Reduced development costs through automation
- Faster feature delivery with normalized architecture
- Improved code quality through TypeScript and validation
- Customer satisfaction driving retention and referrals
- Competitive differentiation enabling premium pricing

---

## Core Features & Functional Scope

### Primary Features

#### 1. Conversation Generation Engine
- **Single Conversation Generation:** Generate one conversation on-demand with immediate feedback
- **Batch Generation with Selection:** Select multiple conversations using checkboxes and generate as batch
- **Generate All with Confirmation:** One-click generation of entire dataset with cost/time estimates
- **Parameter Injection:** Automatic substitution of {persona}, {emotion}, {topic} placeholders in prompts
- **Background Processing:** Long-running operations continue if browser closed

#### 2. Progress Monitoring & Visibility
- **Multi-Level Progress Tracking:** Overall percentage, current conversation, estimated time remaining
- **Status Indicators:** Color-coded badges (Not Generated / Generating / Generated / Approved / Rejected / Failed)
- **Real-Time Updates:** Polling every 2-5 seconds or WebSocket for instant feedback
- **Error Visibility:** Clickable error badges showing detailed error messages and retry options
- **Progress Persistence:** State saved in database, resumes if user closes/reopens browser

#### 3. Dashboard & Table Management
- **Comprehensive Table View:** One row per conversation showing metadata columns
- **Sortable Columns:** Click column header to sort ascending/descending
- **Pagination:** 25/50/100 rows per page for large datasets
- **Search Functionality:** Text search filtering across all columns
- **Column Visibility Toggle:** Show/hide columns based on user preference

#### 4. Multi-Dimensional Filtering
- **8 Filter Dimensions:** Persona, Emotion, Topic, Intent, Tone, Tier, Status, Quality
- **Multiple Filter Combinations:** AND logic, selected filters display as removable badges
- **Clear All Filters:** Reset to full dataset with one click
- **Filter Persistence:** State persists in URL for bookmarking and sharing
- **Dynamic Conversation Count:** Updates as filters applied

#### 5. Review & Approval Workflow
- **Formatted Conversation Preview:** Click row opens side panel with turn-by-turn display
- **Readable Typography:** Proper spacing, USER:/ASSISTANT: labels, not raw JSON
- **Approve/Reject Buttons:** Simple actions with optional reviewer notes
- **Metadata Panel:** Shows persona, emotion, topic, intent, tone, quality score, generation date
- **Navigation:** Previous/Next buttons to move between conversations
- **Audit Trail:** Complete history of who approved/rejected when with timestamps

#### 6. Quality Validation & Scoring
- **Automated Validation:** Turn count (8-16 optimal), length, JSON structure, confidence score
- **Quality Score (1-10):** Composite score combining all validation checks
- **Color Coding:** Red < 6, yellow 6-8, green > 8 for quick scanning
- **Automatic Flagging:** Conversations with score < 6 flagged for review
- **Sort by Quality:** Ascending sort shows lowest quality first for prioritization

#### 7. Export Functionality
- **Export Approved Only:** Filter to approved conversations before export
- **Multiple Formats:** OpenAI, Anthropic, generic JSON, CSV options
- **Metadata Header:** Export date, conversation count, quality statistics
- **Descriptive Filenames:** e.g., training-data-2025-10-26-approved-87-conversations.json
- **Export Preview:** Sample structure shown before download

#### 8. Cost Tracking & Transparency
- **Pre-Generation Estimates:** Total API cost before starting batch
- **Real-Time Tracking:** Cumulative spend during generation with visual indicator
- **Post-Generation Summary:** Actual cost vs. estimate with breakdown
- **Per-Conversation Cost:** Detailed view showing cost for each conversation
- **Warning Thresholds:** Configurable spending limits with alerts at 50%, 75%, 90%

#### 9. Prompt Template Management
- **Template Storage:** Database-backed with version control
- **Parameter Injection:** Automatic replacement of placeholders with conversation metadata
- **Template Versioning:** Multiple versions coexist, activate/deactivate without deleting
- **Usage Tracking:** Which conversations used which template version
- **A/B Testing Support:** Multiple active templates with usage analytics

#### 10. Three-Tier Architecture
- **Tier 1 (Template):** 40 conversations following emotional arc templates (Triumph, Struggle-to-Success, Steady Confidence, Anxiety-to-Relief, Discovery)
- **Tier 2 (Scenario):** 35 conversations based on real-world customer scenarios derived from chunk content
- **Tier 3 (Edge Case):** 15 conversations testing boundary conditions, extreme emotional states, unusual situations
- **Configurable Distribution:** Default 40/35/15, adjustable to 50/30/20 or other ratios
- **Coverage Reporting:** Conversation count per tier with gap identification

### Scope Definition

#### In Scope

**Core Conversation Generation:**
- Single, batch, and "Generate All" conversation generation
- Three-tier architecture (Template, Scenario, Edge Case)
- Real-time progress tracking with status updates
- Automated API orchestration with Claude
- Rate limiting and error handling with retry logic

**Quality & Review:**
- Automated quality validation and scoring
- Human-in-the-loop approval workflow
- Formatted conversation preview with metadata
- Reviewer notes and audit trail
- Bulk approve/reject actions

**Organization & Filtering:**
- Multi-dimensional filtering across 8 dimensions
- Coverage analysis and balance checking
- Sortable, searchable table view
- Filter persistence and bookmarking
- Gap identification for missing combinations

**Database & Storage:**
- Normalized schema (conversations, conversation_turns, metadata)
- Indexed fields for query performance
- Complete audit logging
- Version history for conversations
- Training data split assignment (train/dev/test)

**Export & Integration:**
- LoRA-ready JSON export (OpenAI/Anthropic formats)
- Export approved conversations only
- Multiple format options
- Metadata and quality statistics
- Integration with existing chunk/dimension modules

**Cost & Transparency:**
- Pre-generation cost estimates
- Real-time cost tracking
- Post-generation summaries
- Per-conversation cost breakdown
- Configurable spending limits

#### Out of Scope

**Advanced AI Features (Future Enhancements):**
- Real-time conversation generation (requires WebSocket infrastructure)
- AI-powered conversation editing and refinement
- Automatic regeneration of low-quality conversations
- Sentiment analysis and emotional tone validation
- Multi-model comparison (Claude vs. GPT-4 vs. Qwen)

**Advanced Analytics (Future Enhancements):**
- Detailed usage analytics and metrics dashboards
- A/B testing framework for prompt templates
- Quality trend analysis over time
- User behavior tracking and heatmaps
- Performance benchmarking and optimization reports

**Third-Party Integrations (Future Enhancements):**
- Direct integration with LoRA training platforms (RunPod, Replicate)
- Webhook notifications for generation events
- Slack/Discord integration for team notifications
- Export to external data labeling platforms
- API endpoints for programmatic access

**User Management Features (Basic Auth Sufficient):**
- Role-based access control (RBAC)
- Team collaboration features (comments, assignments)
- Approval workflows with multi-level review
- User activity dashboards
- Organization-level analytics

**Content Management (Future):**
- Version control for conversations
- Branching and merging of conversation variants
- Bulk editing of conversation metadata
- Import conversations from external sources
- Conversation templates and cloning

---

## Product Architecture

### High-Level System Architecture

```
Interactive LoRA Conversation Generation Module
│
├── Frontend (Next.js 14 App Router)
│   ├── Dashboard Page
│   │   ├── Conversation Table (sortable, filterable, paginated)
│   │   ├── Multi-Dimensional Filters (8 dimensions)
│   │   ├── Progress Tracking (real-time updates)
│   │   └── Bulk Action Controls
│   │
│   ├── Conversation Preview Panel
│   │   ├── Turn-by-Turn Display (formatted, readable)
│   │   ├── Metadata Display (persona, emotion, topic, quality)
│   │   ├── Approve/Reject Controls (with notes)
│   │   └── Navigation (previous/next)
│   │
│   ├── Generation Controls
│   │   ├── Single Generate Button (per row)
│   │   ├── Generate Selected (batch with checkboxes)
│   │   ├── Generate All (with confirmation dialog)
│   │   └── Cost Estimation Display
│   │
│   └── Export Interface
│       ├── Format Selection (OpenAI, Anthropic, generic)
│       ├── Filter-Based Export (current filters)
│       ├── Preview (sample structure)
│       └── Download Button
│
├── Backend (Next.js API Routes)
│   ├── Conversation Generation API
│   │   ├── POST /api/conversations/generate (single)
│   │   ├── POST /api/conversations/generate-batch (multiple)
│   │   ├── POST /api/conversations/generate-all (entire dataset)
│   │   └── GET /api/conversations/status (progress tracking)
│   │
│   ├── Conversation Management API
│   │   ├── GET /api/conversations (list with filters)
│   │   ├── GET /api/conversations/:id (single with turns)
│   │   ├── PATCH /api/conversations/:id (update metadata, approval)
│   │   ├── DELETE /api/conversations/:id (delete)
│   │   └── POST /api/conversations/bulk-action (approve/reject/delete batch)
│   │
│   ├── Quality & Validation API
│   │   ├── POST /api/conversations/:id/validate (run quality checks)
│   │   ├── GET /api/conversations/quality-stats (aggregate metrics)
│   │   └── GET /api/conversations/coverage-analysis (dimensional distribution)
│   │
│   ├── Export API
│   │   ├── POST /api/export/conversations (generate export file)
│   │   ├── GET /api/export/preview (sample structure)
│   │   └── GET /api/export/history (past exports with metadata)
│   │
│   └── Template Management API
│       ├── GET /api/templates (list active templates)
│       ├── GET /api/templates/:id (single template with usage stats)
│       ├── POST /api/templates (create new template)
│       └── PATCH /api/templates/:id (update, activate/deactivate)
│
├── AI Generation Engine
│   ├── Claude API Integration (Anthropic SDK)
│   ├── Rate Limiter (50 requests/minute, configurable)
│   ├── Retry Logic (exponential backoff: 1s, 2s, 4s, 8s, 16s)
│   ├── Prompt Template Engine (parameter injection)
│   ├── Response Parser (JSON extraction, validation)
│   └── Quality Validator (turn count, length, structure)
│
├── Database (Supabase/PostgreSQL)
│   ├── conversations
│   │   ├── id (uuid, primary key)
│   │   ├── conversation_id (string, unique identifier)
│   │   ├── document_id (uuid, foreign key → documents)
│   │   ├── chunk_id (uuid, foreign key → chunks)
│   │   ├── persona (string, indexed)
│   │   ├── emotion (string, indexed)
│   │   ├── topic (string, indexed)
│   │   ├── intent (string)
│   │   ├── tone (string)
│   │   ├── tier (enum: template/scenario/edge_case, indexed)
│   │   ├── status (enum: not_generated/generating/generated/approved/rejected/failed, indexed)
│   │   ├── quality_score (integer 1-10, indexed)
│   │   ├── turn_count (integer)
│   │   ├── estimated_cost_usd (decimal)
│   │   ├── actual_cost_usd (decimal)
│   │   ├── generation_duration_ms (integer)
│   │   ├── approved_by (uuid, foreign key → users)
│   │   ├── approved_at (timestamp)
│   │   ├── reviewer_notes (text)
│   │   ├── error_message (text)
│   │   ├── created_at (timestamp, indexed)
│   │   └── updated_at (timestamp)
│   │
│   ├── conversation_turns
│   │   ├── id (uuid, primary key)
│   │   ├── conversation_id (uuid, foreign key → conversations)
│   │   ├── turn_number (integer, 1-based)
│   │   ├── role (enum: user/assistant)
│   │   ├── content (text)
│   │   ├── created_at (timestamp)
│   │   └── UNIQUE(conversation_id, turn_number)
│   │
│   ├── conversation_metadata
│   │   ├── id (uuid, primary key)
│   │   ├── conversation_id (uuid, foreign key → conversations)
│   │   ├── metadata (jsonb, flexible key-value storage)
│   │   └── created_at (timestamp)
│   │
│   ├── generation_logs
│   │   ├── id (uuid, primary key)
│   │   ├── conversation_id (uuid, foreign key → conversations)
│   │   ├── run_id (uuid)
│   │   ├── template_id (uuid, foreign key → prompt_templates)
│   │   ├── request_payload (jsonb)
│   │   ├── response_payload (jsonb)
│   │   ├── parameters (jsonb)
│   │   ├── cost_usd (decimal)
│   │   ├── input_tokens (integer)
│   │   ├── output_tokens (integer)
│   │   ├── duration_ms (integer)
│   │   ├── error_message (text)
│   │   └── created_at (timestamp, indexed)
│   │
│   ├── prompt_templates
│   │   ├── id (uuid, primary key)
│   │   ├── template_name (string, unique)
│   │   ├── template_type (enum: template/scenario/edge_case)
│   │   ├── template_text (text)
│   │   ├── tier (enum: template/scenario/edge_case)
│   │   ├── applicable_personas (array of strings, nullable)
│   │   ├── applicable_emotions (array of strings, nullable)
│   │   ├── version (integer)
│   │   ├── is_active (boolean, indexed)
│   │   ├── created_at (timestamp)
│   │   ├── updated_at (timestamp)
│   │   └── created_by (uuid, foreign key → users)
│   │
│   └── export_logs
│       ├── id (uuid, primary key)
│       ├── export_id (uuid, unique)
│       ├── user_id (uuid, foreign key → users)
│       ├── filter_state (jsonb)
│       ├── conversation_count (integer)
│       ├── format (enum: openai/anthropic/generic/csv)
│       ├── file_path (string)
│       ├── exported_at (timestamp, indexed)
│       └── metadata (jsonb)
│
└── Background Job Queue (Future: BullMQ or Supabase Edge Functions)
    ├── Generation Queue (process batch generations)
    ├── Validation Queue (run quality checks post-generation)
    └── Export Queue (generate large export files)
```

### Key Components

#### 1. Frontend Dashboard Component
**Responsibility:** Display all conversations in sortable, filterable table view

**Key Sub-Components:**
- ConversationTable: Renders table with pagination, sorting, column visibility
- FilterPanel: Multi-dimensional filters with dropdown selectors and badge display
- ProgressTracker: Real-time progress bar and status updates
- BulkActionControls: Checkboxes for multi-select, bulk action buttons

**Technologies:** Next.js 14 App Router, TypeScript, React Server Components, Tailwind CSS, Shadcn/UI

**Data Flow:**
1. Server Component fetches conversations with filters from database
2. Client Component handles user interactions (sorting, filtering, selection)
3. Optimistic UI updates for instant feedback
4. Polling every 2-5 seconds for status updates during generation

#### 2. Conversation Preview Panel
**Responsibility:** Display formatted conversation with turn-by-turn view and approval controls

**Key Sub-Components:**
- TurnDisplay: Renders USER: and ASSISTANT: messages with readable typography
- MetadataPanel: Shows persona, emotion, topic, quality score, generation details
- ApprovalControls: Approve/Reject buttons with optional notes textarea
- NavigationControls: Previous/Next buttons for efficient review workflow

**Technologies:** React Client Component, Shadcn Sheet/Dialog, Lucide icons

**Data Flow:**
1. Click conversation row opens side panel/modal
2. Fetch conversation turns and metadata from API
3. Display formatted conversation with metadata
4. Approve/Reject action updates database and refetches table data

#### 3. Generation Engine
**Responsibility:** Orchestrate conversation generation with Claude API, handle rate limiting, retries, errors

**Key Sub-Components:**
- ClaudeAPIClient: Wrapper around Anthropic SDK with rate limiting
- PromptTemplateEngine: Injects parameters into templates, formats prompts
- ResponseParser: Extracts JSON from Claude responses, validates structure
- QualityValidator: Checks turn count, length, format; calculates quality score
- RetryManager: Implements exponential backoff with configurable max attempts

**Technologies:** Node.js, Anthropic SDK, TypeScript

**Data Flow:**
1. Receive generation request (single, batch, or all)
2. Fetch prompt templates and conversation metadata
3. For each conversation:
   - Inject parameters into template
   - Call Claude API with rate limiting
   - Parse response and validate
   - Calculate quality score
   - Save conversation and turns to database
   - Log generation details
   - Update progress status
4. Handle errors with retry logic
5. Return generation results

#### 4. Database Service Layer
**Responsibility:** Abstract database operations, provide type-safe interfaces, handle transactions

**Key Services:**
- conversationService: CRUD operations for conversations
- conversationTurnService: CRUD for turns with batch insert
- generationLogService: Logging API requests/responses
- templateService: Prompt template management
- exportLogService: Track export history

**Technologies:** Supabase Client SDK, PostgreSQL, TypeScript

**Data Flow:**
1. Frontend/API calls service methods
2. Service constructs Supabase queries with filters, joins
3. Execute query with error handling
4. Return typed results
5. Log errors for debugging

#### 5. Quality Validation System
**Responsibility:** Automated quality checks and scoring for generated conversations

**Key Components:**
- TurnCountValidator: Checks 8-16 turn range (optimal)
- LengthValidator: Ensures responses appropriate length for context
- StructureValidator: Validates JSON format and required fields
- ConfidenceScorer: Combines validation results into 1-10 score

**Technologies:** TypeScript, custom validation logic

**Data Flow:**
1. After generation, run validation checks
2. Calculate individual scores for each criterion
3. Combine into composite quality score
4. Flag for review if score < 6
5. Store score and validation results in database

#### 6. Export Generation System
**Responsibility:** Generate LoRA-ready JSON files from approved conversations

**Key Components:**
- FormatConverter: Converts conversations to OpenAI/Anthropic/generic formats
- MetadataBuilder: Constructs export metadata header
- FileGenerator: Creates JSON file with proper structure
- ExportLogger: Tracks export history with filter state

**Technologies:** Node.js, JSON manipulation, file system

**Data Flow:**
1. Receive export request with filters and format
2. Fetch approved conversations matching filters
3. Convert to selected format (OpenAI, Anthropic, generic)
4. Add metadata header (export date, count, quality stats)
5. Generate file with descriptive filename
6. Log export details for audit trail
7. Return download link or file stream

### Data Flow

#### Generation Flow (Single Conversation)
```
User clicks "Generate" button
↓
Frontend sends POST /api/conversations/generate with conversation_id
↓
API fetches conversation metadata (persona, emotion, topic)
↓
API fetches applicable prompt template
↓
API injects parameters into template
↓
API calls Claude with rate limiting
↓
Claude returns response
↓
API parses JSON, validates structure
↓
API calculates quality score
↓
API saves conversation and turns to database
↓
API logs generation details
↓
API returns success/error to frontend
↓
Frontend updates conversation status in table
↓
Frontend shows success toast notification
```

#### Generation Flow (Batch / Generate All)
```
User clicks "Generate All" button
↓
Frontend shows confirmation dialog with cost/time estimate
↓
User confirms
↓
Frontend sends POST /api/conversations/generate-all
↓
API creates generation job with status "running"
↓
API processes conversations in batches of 3 (parallel)
↓
For each conversation:
  - Inject parameters into template
  - Call Claude API with rate limiting
  - Parse and validate response
  - Save to database
  - Update progress
  - Log details
↓
Handle errors with retry logic (max 3 attempts)
↓
Update job status to "completed" or "failed"
↓
Frontend polls /api/conversations/status every 2-5 seconds
↓
Frontend updates progress bar and current conversation display
↓
On completion, frontend shows summary notification
↓
Frontend refreshes table data
```

#### Review & Approval Flow
```
User clicks conversation row in table
↓
Frontend opens preview panel (side panel or modal)
↓
Frontend fetches conversation turns via GET /api/conversations/:id
↓
Frontend displays formatted turn-by-turn conversation
↓
Frontend displays metadata (persona, emotion, quality score)
↓
User reads conversation
↓
User clicks "Approve" button
↓
Frontend sends PATCH /api/conversations/:id with status="approved"
↓
API updates conversation status in database
↓
API records reviewer_id, approved_at timestamp, notes
↓
API returns updated conversation
↓
Frontend updates table row with green "Approved" badge
↓
Frontend shows success toast
↓
Frontend moves to next conversation (if Previous/Next used)
```

#### Filtering & Coverage Analysis Flow
```
User selects filters (Persona: Anxious Investor, Emotion: Fear)
↓
Frontend updates filter state in URL query params
↓
Frontend sends GET /api/conversations with filter params
↓
API constructs Supabase query with WHERE clauses
↓
API executes query with indexes for performance
↓
API returns filtered conversations
↓
Frontend updates table with filtered results
↓
Frontend updates conversation count display
↓
User clicks "Coverage Analysis" button
↓
Frontend sends GET /api/conversations/coverage-analysis with filters
↓
API groups conversations by persona, emotion, tier
↓
API calculates distribution percentages
↓
API identifies gaps (underrepresented combinations)
↓
API returns coverage data
↓
Frontend displays charts showing distribution
↓
Frontend highlights gaps for user attention
```

#### Export Flow
```
User clicks "Export" button
↓
Frontend shows format selection dialog (OpenAI, Anthropic, generic)
↓
User selects format and confirms
↓
Frontend sends POST /api/export/conversations with filters and format
↓
API fetches approved conversations matching filters
↓
API converts to selected format
↓
API adds metadata header (export date, count, quality stats)
↓
API generates JSON file
↓
API saves export log to database
↓
API returns download URL or file stream
↓
Frontend triggers browser download with descriptive filename
↓
Frontend shows success toast with export summary
```

---

## Core Technologies

### Technology Stack

#### Frontend
- **Next.js 14** - React framework with App Router, Server Components, API routes
- **TypeScript** - Type-safe development, interfaces, strict mode enabled
- **React 18** - UI library with hooks, context, suspense
- **Tailwind CSS** - Utility-first styling, responsive design
- **Shadcn/UI** - High-quality component library (Button, Dialog, Sheet, Table, Badge, Dropdown)
- **Lucide React** - Icon library for UI elements
- **Sonner** - Toast notifications for user feedback

#### Backend
- **Next.js API Routes** - Serverless functions for backend logic
- **Anthropic SDK** - Claude AI API integration for conversation generation
- **Supabase Client SDK** - Database queries, real-time subscriptions
- **Node.js** - Runtime environment

#### Database
- **Supabase** - Hosted PostgreSQL with real-time capabilities, authentication, storage
- **PostgreSQL** - Relational database with JSONB support, indexes, foreign keys
- **Row Level Security (RLS)** - Multi-tenant data isolation

#### State Management
- **Zustand** - Lightweight state management for client-side state
- **React Context** - Authentication and user context
- **URL State** - Filter state persistence in query parameters

#### Development Tools
- **ESLint** - Code linting and quality checks
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking and compilation

### External Dependencies

#### Core Dependencies (package.json)
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "@supabase/supabase-js": "^2.45.0",
    "@anthropic-ai/sdk": "^0.27.0",
    "zustand": "^4.5.0",
    "sonner": "^1.5.0",
    "lucide-react": "^0.441.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-table": "^0.1.0"
  }
}
```

#### Claude API Configuration
- **Model:** claude-3-5-sonnet-20241022 (or latest)
- **Temperature:** 0.5 (balanced creativity and consistency)
- **Max Tokens:** 2048 (sufficient for multi-turn conversations)
- **Pricing:** ~$3 per million input tokens, ~$15 per million output tokens
- **Rate Limits:** 50 requests/minute (configurable based on tier)

#### Supabase Configuration
- **Database:** PostgreSQL 15
- **Authentication:** Email/password, OAuth providers (Google, GitHub)
- **Storage:** File storage for exports (optional)
- **Real-time:** WebSocket subscriptions for live updates (optional)

---

## Success Criteria

### Performance Metrics

#### Generation Performance
- **Single Conversation:** 15-45 seconds average generation time
- **Batch of 100:** 30-60 minutes total time with rate limiting
- **Parallel Processing:** 3 conversations simultaneously (where API limits allow)
- **Progress Updates:** Every 2-5 seconds without lag

#### Database Performance
- **Query Performance:** < 500ms for filtered views with 1000+ conversations
- **Table Load:** < 500ms for 100 conversations with pagination
- **Insert Performance:** < 100ms for single conversation with turns
- **Index Usage:** All queries use indexes for frequently queried fields

#### UI Performance
- **Page Load:** < 2 seconds initial load
- **Filter Apply:** < 200ms to apply filters and update table
- **Sort:** < 200ms to sort table columns
- **Preview Open:** < 500ms to open conversation preview panel

### Quality Standards

#### Conversation Quality
- **Approval Rate:** 80%+ approved on first generation
- **Turn Count Compliance:** 90%+ conversations have 8-16 turns
- **Length Compliance:** 90%+ responses appropriate length for context
- **JSON Validity:** 100% responses parse correctly as JSON
- **Quality Score Distribution:** 70%+ conversations score >= 8

#### System Quality
- **Generation Success Rate:** > 95% (< 5% failure rate)
- **Rate Limit Handling:** 100% of rate limit errors recovered automatically
- **Error Recovery:** 100% of transient errors retried successfully
- **Data Integrity:** 100% foreign key constraints maintained
- **Audit Trail:** 100% of generation/approval actions logged

#### Code Quality
- **TypeScript Coverage:** 100% of code type-checked with strict mode
- **Linting:** Zero ESLint errors in production code
- **Testing:** 80%+ code coverage for critical paths (future)
- **Documentation:** All public interfaces documented with JSDoc

### Milestone Criteria

#### Milestone 1: Foundation (Weeks 1-3) - COMPLETE WHEN:
- ✅ Database schema implemented (conversations, conversation_turns, metadata, logs, templates)
- ✅ API routes scaffolded (generation, management, export, templates)
- ✅ Claude API integration working (single conversation generation end-to-end)
- ✅ Basic UI components built (table, preview panel, filters)
- ✅ Single conversation generation workflow functional

**Acceptance Test:** User can generate one conversation, see it in table, preview it, approve it, and export it.

#### Milestone 2: Batch Generation & Quality (Weeks 4-6) - COMPLETE WHEN:
- ✅ Batch generation with rate limiting and retry logic implemented
- ✅ Real-time progress tracking with polling working
- ✅ Quality validation and scoring fully functional
- ✅ Multi-dimensional filtering operational across all 8 dimensions
- ✅ Approval workflow with reviewer notes complete
- ✅ Bulk actions (approve, reject, regenerate) working

**Acceptance Test:** User can generate 100 conversations in batch, see real-time progress, filter by quality score, approve/reject in bulk, and ensure only approved conversations exported.

#### Milestone 3: Production Ready (Weeks 7-8) - COMPLETE WHEN:
- ✅ Three-tier architecture implemented (Template, Scenario, Edge Case)
- ✅ Cost estimation and tracking fully functional
- ✅ Export in multiple formats (OpenAI, Anthropic, generic JSON)
- ✅ Complete audit trail for compliance
- ✅ Error handling and recovery comprehensive
- ✅ Performance optimization complete (< 500ms queries)
- ✅ Documentation complete (user guide, API docs)

**Acceptance Test:** User can generate complete 90-100 conversation dataset across all three tiers, review quality metrics, ensure balanced coverage, export with cost transparency, and demonstrate complete audit trail for compliance.

---

## Current State & Development Phase

### Completed Features (Stages 1 & 2)

#### ✅ Stage 1: Document Categorization (COMPLETE)
- Document upload interface with drag-and-drop
- File validation (PDF, DOCX, DOC, TXT, MD, HTML, RTF)
- Text extraction from multiple formats
- Supabase storage integration
- User authentication and authorization
- Next.js 14 App Router architecture with TypeScript
- Shadcn/UI component library
- 11 business-friendly primary categories
- Multi-dimensional secondary tagging (7 dimensions)
- Statement of Belonging assessment
- Risk level classification (1-5 scale)
- Document reference panel with persistent context

#### ✅ Stage 2: Chunk Extraction & Dimension Generation (COMPLETE)
- AI-powered semantic chunk extraction from documents
- 60-dimensional classification system including:
  - **Prior Generated (8):** doc_id, doc_title, doc_version, source_type, source_url, author, doc_date, primary_category
  - **Mechanically Generated (17):** chunk_id, section_heading, page_start, page_end, char_start, char_end, token_count, overlap_tokens, chunk_handle, plus training metadata
  - **AI Generated (35):** Content (8), Task (6), CER (5), Scenario (5), Training (3), Risk (6), plus include_in_training_yn and augmentation_notes
- Chunk comparison across multiple AI generation runs
- Spreadsheet view for dimension analysis and quality review
- Confidence scoring (precision and accuracy) for quality assessment
- Database schema: documents, chunks, chunk_dimensions, chunk_runs, prompt_templates
- API response logging for debugging and auditing
- Batch processing with parallel execution (3 chunks at a time)
- Error handling with detailed logging
- Progress tracking for chunk extraction jobs

**Database Tables in Production:**
- ✅ documents
- ✅ chunks
- ✅ chunk_dimensions
- ✅ chunk_runs
- ✅ prompt_templates
- ✅ chunk_extraction_jobs
- ✅ api_response_logs
- ✅ categories
- ✅ document_categories
- ✅ users (Supabase Auth)

**Services Implemented:**
- ✅ chunkService (CRUD for chunks)
- ✅ chunkDimensionService (CRUD for dimensions)
- ✅ chunkRunService (run management)
- ✅ promptTemplateService (template management)
- ✅ chunkExtractionJobService (job tracking)
- ✅ apiResponseLogService (API logging)
- ✅ documentCategoryService (category management)
- ✅ authService (authentication)

**AI Integration:**
- ✅ Anthropic Claude SDK integration
- ✅ Prompt template parameter injection
- ✅ Response parsing and validation
- ✅ Quality scoring (precision and accuracy)
- ✅ Cost tracking and estimation
- ✅ Rate limiting and retry logic

### Pending Features (Stage 3: Conversation Generation)

#### ❌ Conversation Generation Module (TO BE BUILT)
This is the focus of this overview document. All features described in "Core Features & Functional Scope" section above.

**Key Components to Build:**

1. **Database Schema Extensions:**
   - ❌ conversations table
   - ❌ conversation_turns table
   - ❌ conversation_metadata table
   - ❌ generation_logs table (extend existing)
   - ❌ export_logs table

2. **API Routes:**
   - ❌ /api/conversations/generate (single)
   - ❌ /api/conversations/generate-batch (multiple)
   - ❌ /api/conversations/generate-all (entire dataset)
   - ❌ /api/conversations/status (progress tracking)
   - ❌ /api/conversations (list with filters)
   - ❌ /api/conversations/:id (single with turns)
   - ❌ /api/conversations/bulk-action (approve/reject/delete batch)
   - ❌ /api/export/conversations (generate export file)

3. **Frontend Components:**
   - ❌ ConversationDashboard page
   - ❌ ConversationTable component
   - ❌ FilterPanel component
   - ❌ ConversationPreviewPanel component
   - ❌ ProgressTracker component
   - ❌ BulkActionControls component
   - ❌ ExportDialog component
   - ❌ CostEstimator component

4. **Backend Services:**
   - ❌ conversationService (CRUD operations)
   - ❌ conversationTurnService (CRUD for turns)
   - ❌ conversationGenerationService (orchestrate generation)
   - ❌ qualityValidationService (automated scoring)
   - ❌ exportService (generate LoRA-ready JSON)
   - ❌ templateManagementService (extend existing)

5. **Generation Engine:**
   - ❌ ConversationGenerator class
   - ❌ PromptTemplateEngine (extend existing)
   - ❌ ResponseParser (extend existing)
   - ❌ QualityValidator
   - ❌ RetryManager

### Technical Debt

#### From Stages 1 & 2 (To Address Before Stage 3)
1. **Authentication:** Currently using basic Supabase auth, need to verify session handling for long-running generation jobs
2. **Error Handling:** Some API routes need more granular error types and user-friendly messages
3. **Type Safety:** A few any types need to be replaced with proper interfaces
4. **API Logging:** Currently logs to api_response_logs table, may need separate table for conversation generation logs
5. **Performance:** Chunk extraction jobs process 3 at a time, need to verify this rate for conversation generation

#### New Technical Debt to Manage (Stage 3)
1. **Real-Time Updates:** Currently using polling (2-5 seconds), consider WebSocket for instant updates (future)
2. **Background Jobs:** Long-running generation jobs may timeout on serverless functions, consider edge functions or job queue (future)
3. **Export Large Datasets:** Generating JSON files for 1000+ conversations may exceed API route memory limits, consider streaming or background processing (future)
4. **Cost Tracking:** Currently estimating costs based on token counts, consider integrating with Anthropic billing API for actual costs (future)
5. **Template Versioning:** Basic version control implemented, need to add template diff viewing and rollback capabilities (future)

---

## User Stories & Feature Mapping

### Customer Stories (Decision Makers)

#### CS1: Dataset Generation Time Savings
**As a** small business owner, **I want** to generate 90-100 high-quality conversations in 3-5 hours instead of 2-3 weeks **so that** I can launch my personalized AI quickly and achieve 95%+ time savings.

**Feature Mapping:**
- Generate All button with confirmation dialog
- Batch processing with rate limiting
- Background processing allowing browser close
- Real-time progress tracking
- Email notification on completion

**Acceptance Criteria:**
- Batch generation of 100 conversations completes in 30-60 minutes of active processing
- User setup and configuration time under 30 minutes
- Quality review time proportional to dataset size (avg 2-3 minutes per conversation)
- Total end-to-end time from start to LoRA-ready export: 3-5 hours

#### CS2: Quality Control and Brand Safety
**As a** small business owner, **I want** to review and approve every conversation before it becomes training data **so that** I ensure my AI represents my brand voice and expertise authentically without errors or inappropriate content.

**Feature Mapping:**
- Formatted conversation preview panel
- Approve/Reject buttons with optional reviewer notes
- Only approved conversations included in export
- Audit trail showing who approved/rejected when
- Quality score flagging conversations needing attention

**Acceptance Criteria:**
- Every generated conversation requires explicit approval before inclusion in export
- Preview interface shows formatted conversation (not raw JSON) for easy reading
- Approve/Reject buttons with optional reviewer notes
- Rejected conversations excluded from export but retained for analysis
- Audit trail showing who approved/rejected each conversation with timestamp

#### CS3: Cost Transparency and Control
**As a** small business owner, **I want** to see estimated costs before starting batch generation **so that** I can budget appropriately and avoid unexpected API charges.

**Feature Mapping:**
- Pre-generation cost estimation in confirmation dialog
- Real-time cost tracking during generation
- Post-generation summary with actual vs. estimated cost
- Per-conversation cost breakdown in detailed view
- Warning dialog if batch cost exceeds threshold

**Acceptance Criteria:**
- Pre-generation cost estimate showing total API cost for batch
- Real-time cost tracking during generation showing cumulative spend
- Post-generation summary showing actual cost vs. estimate
- Cost breakdown per conversation available in detailed view
- Warning dialog if batch cost exceeds configured threshold

### End-User Stories (Daily Users)

#### EU1: Real-Time Progress Visibility
**As a** content manager, **I want** to see real-time progress showing "X of Y conversations generated" with current conversation details **so that** I know exactly where the system is and can plan my workday accordingly.

**Feature Mapping:**
- Progress bar with percentage and count
- Current conversation display (persona + topic being generated)
- Estimated time remaining based on current rate
- Real-time updates via polling (2-5 seconds)
- Progress persistence across browser sessions

**Acceptance Criteria:**
- Progress bar showing percentage and count (e.g., "42 of 100 conversations generated - 42%")
- Current conversation display showing persona + topic being generated
- Estimated time remaining based on current generation rate
- Real-time updates without requiring page refresh (polling or WebSocket)
- Progress persists and resumes if user closes and reopens browser

#### EU2: Conversation Dashboard and Table View
**As a** content manager, **I want** a table view showing all conversations with ID, Persona, Emotion, Topic, Status, and Quality Score **so that** I can quickly scan the entire dataset and identify conversations needing attention.

**Feature Mapping:**
- ConversationTable component with pagination
- Sortable columns (click header to sort)
- Status badges with color coding
- Quality score column with visual indicator
- Search bar for text filtering

**Acceptance Criteria:**
- Table displays one row per conversation with key metadata columns
- Sortable columns (click header to sort ascending/descending)
- Status badges with color coding (Not Generated / Generating / Generated / Approved / Rejected)
- Quality score column with visual indicator (color-coded, threshold-based)
- Pagination for large datasets (25/50/100 rows per page)
- Search bar for quick filtering by text

#### EU3: Batch Selection and Actions
**As a** content manager, **I want** multi-select checkboxes and bulk actions (generate, approve, reject, delete) **so that** I can process multiple conversations efficiently without repetitive clicking.

**Feature Mapping:**
- Checkbox in table header (select/deselect all)
- Individual checkboxes per row
- Bulk action buttons (Generate Selected, Approve Selected, Reject Selected, Delete Selected)
- Confirmation dialog for destructive actions
- Success/error feedback showing results

**Acceptance Criteria:**
- Checkbox in table header selecting/deselecting all visible rows
- Checkbox in each row for individual selection
- Bulk action buttons appear when conversations are selected
- Confirmation dialog for destructive actions (delete, reject)
- Actions apply to all selected conversations
- Success/error feedback showing count of successful/failed operations

### Influencer Stories (Technical Leaders)

#### IS1: Scalable Database Architecture
**As a** technical leader, **I want** a normalized database schema storing conversations, turns, and metadata efficiently **so that** the system scales to thousands of conversations without performance degradation.

**Feature Mapping:**
- Conversations table with metadata
- Conversation_turns table with foreign key (normalized)
- Indexes on frequently queried fields
- Efficient query performance for 1000+ conversations
- Foreign key constraints maintaining data integrity

**Acceptance Criteria:**
- Conversations table with metadata (persona, emotion, topic, etc.)
- Conversation_turns table with foreign key to conversations (normalized structure)
- Indexes on frequently queried fields (status, quality_score, persona, emotion)
- Efficient query performance for 1000+ conversations (< 500ms load time)
- Foreign key constraints maintaining data integrity

#### IS2: Three-Tier Architecture Implementation
**As an** AI strategy leader, **I want** conversations distributed across three tiers (40 Template, 35 Scenario, 15 Edge Case) **so that** training datasets have balanced coverage across foundational, realistic, and boundary-testing scenarios.

**Feature Mapping:**
- Tier 1 (Template): 40 conversations following emotional arc templates
- Tier 2 (Scenario): 35 conversations based on real-world customer scenarios
- Tier 3 (Edge Case): 15 conversations testing boundary conditions
- Tier distribution configurable (default 40/35/15)
- Coverage report showing conversation count per tier

**Acceptance Criteria:**
- Tier 1 (Template): 40 conversations following emotional arc templates (Triumph, Struggle-to-Success, etc.)
- Tier 2 (Scenario): 35 conversations based on real-world customer scenarios
- Tier 3 (Edge Case): 15 conversations testing boundary conditions and unusual situations
- Tier distribution configurable (default 40/35/15, adjustable to 50/30/20, etc.)
- Coverage report showing conversation count per tier

---

## Potential Challenges & Risks

### Technical Challenges

#### Challenge 1: Claude API Rate Limiting and Cost Management
**Problem:** Generating 90-100 conversations in batch may hit API rate limits or incur unexpectedly high costs, causing batch failures or user sticker shock.

**Impact:**
- Batch generation failures midway through processing
- Users exceeding budgets without warning
- Poor user experience due to unpredictable completion times

**Mitigation Strategies:**
1. **Queue-Based Generation:** Implement queue with configurable rate limiting (default 50 requests/minute)
2. **Pre-Generation Estimates:** Show user expected cost and time before starting batch
3. **Real-Time Cost Tracking:** Display cumulative spend during generation with visual progress bar
4. **Spending Caps:** Configurable limits with warnings at 50%, 75%, 90% and automatic pause at 100%
5. **Pause/Resume:** Allow users to pause batch generation if costs exceed threshold, resume later

**Priority:** High  
**Owner:** Backend Engineering Team

#### Challenge 2: Conversation Quality Consistency
**Problem:** AI-generated conversations may vary significantly in quality, with some being too short, too long, off-topic, or missing required elements.

**Impact:**
- Low approval rates (< 80%) indicating poor quality
- Users frustrated by repetitive regeneration
- Training datasets with inconsistent quality harming AI model performance

**Mitigation Strategies:**
1. **Comprehensive Prompt Engineering:** Clear format requirements, examples, constraints in templates
2. **Automated Structural Validation:** Turn count (8-16), length (appropriate for context), JSON validity
3. **Confidence Scoring:** Flag low-quality conversations (score < 6) for automatic regeneration or review
4. **Human-in-the-Loop Approval:** Every conversation requires explicit approval before training data inclusion
5. **Template Iteration:** A/B test templates, measure approval rates, iterate based on feedback

**Priority:** High  
**Owner:** AI Engineering Team + Product Team

#### Challenge 3: Real-Time Progress Tracking at Scale
**Problem:** Tracking progress for 100+ conversations in real-time may cause performance issues or require complex infrastructure.

**Impact:**
- Slow or laggy UI during generation
- Polling overhead impacting database performance
- WebSocket infrastructure complexity if polling insufficient

**Mitigation Strategies:**
1. **Polling-Based Updates:** Start with simple polling every 2-5 seconds (simpler than WebSockets)
2. **Database-Backed Progress:** Store progress in conversations table with indexed status field
3. **Efficient Queries:** Use indexed fields for filtering, avoid N+1 queries
4. **Server-Side Progress Calculation:** Calculate percentage server-side to minimize client processing
5. **Background Processing:** Allow users to close browser, progress saved in database, resume on return

**Priority:** Medium  
**Owner:** Frontend + Backend Engineering Teams

#### Challenge 4: Database Performance with Large Datasets
**Problem:** As users generate thousands of conversations, database queries may slow down affecting user experience.

**Impact:**
- Slow table loading (> 500ms) frustrating users
- Filter and sort operations lagging
- Export generation timing out for large datasets

**Mitigation Strategies:**
1. **Normalized Schema:** Separate tables for conversations, turns, metadata reducing duplication
2. **Strategic Indexing:** Indexes on status, quality_score, persona, emotion, tier, created_at
3. **Pagination:** Limit table views to 25-100 rows per page
4. **Database-Side Filtering:** Execute filters in PostgreSQL, not client-side JavaScript
5. **Periodic Optimization:** Monitor query performance, optimize slow queries, rebuild indexes

**Priority:** Medium  
**Owner:** Backend Engineering Team + DBA

#### Challenge 5: Error Recovery and Partial Batch Failures
**Problem:** If batch generation fails midway through, users may lose progress and incur costs without getting results.

**Impact:**
- Wasted API costs for failed conversations
- Users frustrated by lost progress
- Lack of trust in batch generation reliability

**Mitigation Strategies:**
1. **Granular Error Handling:** Handle errors at conversation level, not batch level
2. **Partial Success Model:** Some conversations can fail while others succeed
3. **Retry Logic:** Exponential backoff (1s, 2s, 4s, 8s, 16s) with max 3 attempts per conversation
4. **Detailed Error Logging:** Capture exactly which conversations failed and why
5. **Resume Capability:** Allow users to regenerate only failed conversations without losing successful ones

**Priority:** High  
**Owner:** Backend Engineering Team

### User Experience Challenges

#### Challenge 6: Users Overwhelmed by Complexity
**Problem:** Despite UI improvements, users may find the workflow too complex or technical, leading to low adoption.

**Impact:**
- Low feature adoption (< 70% within 3 months)
- High support ticket volume (> 5 per 100 generations)
- Users reverting to manual console-based generation

**Mitigation Strategies:**
1. **Progressive Disclosure:** Show simple options first (Generate All), advanced options later (filters, bulk actions)
2. **Contextual Help:** Tooltips, help text, inline guidance explaining each feature
3. **Video Tutorials:** Embedded in UI showing step-by-step workflow
4. **Default Settings:** Optimize for typical use cases (80/20 rule), minimize required configuration
5. **Customer Success Onboarding:** 1-on-1 sessions for new users demonstrating workflow

**Priority:** Medium  
**Owner:** Product Team + Customer Success

#### Challenge 7: Low Approval Rates Indicating Quality Issues
**Problem:** If users reject > 30% of generated conversations, it indicates quality problems requiring prompt iteration.

**Impact:**
- Poor user experience requiring repetitive regeneration
- Low confidence in AI quality harming product reputation
- Training datasets with insufficient approved conversations

**Mitigation Strategies:**
1. **A/B Testing Framework:** Test multiple prompt templates simultaneously, measure approval rates
2. **Automated Quality Scoring:** Predict approval likelihood, flag low-quality before review
3. **Iterative Prompt Refinement:** Analyze rejection reasons, update templates based on feedback
4. **Feedback Loop:** Capture user notes on rejected conversations, identify patterns
5. **Quality Threshold Adjustments:** Allow users to set their own quality standards (e.g., score >= 7)

**Priority:** High  
**Owner:** AI Engineering Team + Product Team

### Business/Adoption Risks

#### Risk 1: Higher Than Expected API Costs
**Problem:** Claude API costs may exceed user expectations or budgets, causing churn or negative reviews.

**Impact:**
- User churn due to cost concerns
- Negative reviews citing unexpected charges
- Support tickets demanding refunds or explanations

**Mitigation Strategies:**
1. **Transparent Cost Estimation:** Show cost before starting batch with clear breakdown
2. **Real-Time Cost Tracking:** Visual indicators during generation showing spend vs. estimate
3. **Configurable Spending Limits:** Warnings at 50%, 75%, 90% and pause at 100%
4. **Model Selection Options:** Allow users to choose cheaper models for drafts, premium for final (future)
5. **Cost-Per-Conversation Metrics:** Help users optimize spending based on historical data

**Priority:** High  
**Owner:** Product Team + Finance

#### Risk 2: Slow User Adoption Due to Learning Curve
**Problem:** Users may not adopt the feature quickly enough, reducing ROI on development investment.

**Impact:**
- Low adoption rates (< 70% within 3 months)
- Wasted development investment
- Competitive disadvantage if competitors move faster

**Mitigation Strategies:**
1. **Guided Onboarding Wizard:** First-time user wizard showing key features step-by-step
2. **Pre-Configured Templates:** Default settings for common use cases requiring minimal configuration
3. **Customer Success Outreach:** Proactive outreach to active users encouraging trial
4. **Marketing Case Studies:** Success stories demonstrating time savings and quality
5. **Freemium Tier:** Allow users to try before committing (e.g., 10 free conversations)

**Priority:** Medium  
**Owner:** Product Team + Marketing + Customer Success

---

## Product Quality Standards

### Performance Standards

#### Generation Performance
- **Single Conversation:** 15-45 seconds average generation time
- **Batch of 100:** 30-60 minutes total time with rate limiting
- **Parallel Processing:** 3 conversations simultaneously (where API limits allow)
- **Progress Updates:** Every 2-5 seconds without lag
- **Background Processing:** Survives browser close/reopen without data loss

#### Database Performance
- **Query Performance:** < 500ms for filtered views with 1000+ conversations
- **Table Load:** < 500ms for 100 conversations with pagination
- **Insert Performance:** < 100ms for single conversation with turns
- **Index Usage:** All queries use indexes for frequently queried fields
- **Connection Pooling:** Efficient connection reuse for API routes

#### UI Performance
- **Page Load:** < 2 seconds initial load
- **Filter Apply:** < 200ms to apply filters and update table
- **Sort:** < 200ms to sort table columns
- **Preview Open:** < 500ms to open conversation preview panel
- **Optimistic Updates:** Instant UI feedback with server reconciliation

### Quality Standards

#### Conversation Quality
- **Approval Rate:** 80%+ approved on first generation
- **Turn Count Compliance:** 90%+ conversations have 8-16 turns
- **Length Compliance:** 90%+ responses appropriate length for context
- **JSON Validity:** 100% responses parse correctly as JSON
- **Quality Score Distribution:** 70%+ conversations score >= 8

#### System Quality
- **Generation Success Rate:** > 95% (< 5% failure rate)
- **Rate Limit Handling:** 100% of rate limit errors recovered automatically
- **Error Recovery:** 100% of transient errors retried successfully
- **Data Integrity:** 100% foreign key constraints maintained
- **Audit Trail:** 100% of generation/approval actions logged

### Development Standards

#### Code Quality
- **TypeScript Coverage:** 100% of code type-checked with strict mode
- **Linting:** Zero ESLint errors in production code
- **Code Review:** All pull requests reviewed by at least one engineer
- **Testing:** 80%+ code coverage for critical paths (future)
- **Documentation:** All public interfaces documented with JSDoc

#### Architecture Standards
- **Component Isolation:** Clear separation of concerns (presentation, business logic, data access)
- **Type Safety:** Strict TypeScript interfaces for all data structures
- **Error Handling:** Granular error types with user-friendly messages
- **Logging:** Comprehensive logging at debug, info, warn, error levels
- **Security:** Row Level Security (RLS) for multi-tenant data isolation

---

## Product Documentation Planning

### Required Documentation

#### 1. User Documentation
**Owner:** Product Team + Technical Writing

**Documents:**
- **Getting Started Guide:** Quick start for first-time users (15 minutes to first conversation)
- **Feature Guide:** Detailed explanation of all features with screenshots
- **Best Practices:** Recommendations for optimal workflow, quality control, cost management
- **Troubleshooting Guide:** Common issues and solutions (e.g., failed generations, low quality)
- **Video Tutorials:** Screen recordings demonstrating key workflows (5-10 minutes each)

**Target Audience:** Small business owners, content managers, domain experts  
**Format:** Markdown, embedded in application, hosted on docs site  
**Timeline:** Milestone 3 (Weeks 7-8)

#### 2. Technical Documentation
**Owner:** Engineering Team

**Documents:**
- **Architecture Overview:** High-level system architecture, component interactions, data flow
- **API Reference:** All API routes with request/response schemas, error codes, examples
- **Database Schema:** Table structures, indexes, foreign keys, constraints, sample queries
- **Integration Guide:** How to integrate with existing modules (chunks, dimensions, categories)
- **Deployment Guide:** Environment setup, configuration, monitoring, troubleshooting

**Target Audience:** Technical leaders, engineers, DevOps  
**Format:** Markdown, OpenAPI spec for API reference  
**Timeline:** Milestone 2 (Weeks 4-6) for initial, Milestone 3 for complete

#### 3. Developer Documentation
**Owner:** Engineering Team

**Documents:**
- **Component Documentation:** React component props, usage examples, styling
- **Service Layer Documentation:** Database service methods with type signatures
- **Prompt Template Guide:** How to create, test, and deploy new templates
- **Testing Guide:** How to write tests, run tests, interpret results (future)
- **Contributing Guide:** Code standards, review process, deployment workflow

**Target Audience:** Frontend/backend engineers  
**Format:** JSDoc, Markdown, Storybook (future)  
**Timeline:** Ongoing throughout development

#### 4. Business Documentation
**Owner:** Product Team + Marketing

**Documents:**
- **Product Requirements Document (PRD):** This overview document
- **User Story Map:** Visual representation of user journeys and features
- **Release Notes:** What's new in each release, bug fixes, improvements
- **Roadmap:** Future features and enhancements planned
- **Case Studies:** Success stories from early adopters (post-launch)

**Target Audience:** Product managers, executives, sales, marketing  
**Format:** Markdown, Google Docs, presentation slides  
**Timeline:** Ongoing throughout development and post-launch

### Documentation Responsibilities

| Document Type | Owner | Reviewer | Timeline | Format |
|--------------|-------|----------|----------|--------|
| Getting Started Guide | Product | Eng + CS | Milestone 3 | Markdown |
| Feature Guide | Product + TW | CS | Milestone 3 | Markdown + Screenshots |
| Architecture Overview | Eng Lead | CTO | Milestone 2 | Markdown + Diagrams |
| API Reference | Backend Eng | Eng Lead | Milestone 2 | OpenAPI + Markdown |
| Database Schema | Backend Eng | DBA | Milestone 1 | SQL + Markdown |
| Component Docs | Frontend Eng | Eng Lead | Ongoing | JSDoc + Storybook |
| User Stories | Product | Stakeholders | Milestone 1 | Markdown |
| Release Notes | Product + Eng | Marketing | Each Release | Markdown |

**Abbreviations:**
- TW = Technical Writer
- CS = Customer Success
- Eng = Engineering
- DBA = Database Administrator

---

## Next Steps & Execution Plan

### Immediate Actions (Before Development Starts)

#### 1. Finalize Requirements & Scope
**Owner:** Product Manager  
**Timeline:** Week 0 (1-2 days)

- [ ] Review this overview document with stakeholders (business owners, technical leaders, customer success)
- [ ] Validate user stories and acceptance criteria with representative users
- [ ] Confirm success metrics and quality standards with leadership
- [ ] Identify any missing requirements or edge cases
- [ ] Sign off on scope (in scope vs. out of scope)

#### 2. Technical Architecture Review
**Owner:** Engineering Lead + CTO  
**Timeline:** Week 0 (2-3 days)

- [ ] Review database schema for completeness and performance
- [ ] Validate API route design and data flow
- [ ] Assess scalability and performance risks
- [ ] Identify technical dependencies and blockers
- [ ] Confirm technology stack choices (Next.js, Anthropic SDK, Supabase)
- [ ] Plan testing strategy (unit, integration, end-to-end)

#### 3. Development Environment Setup
**Owner:** DevOps + Engineering Team  
**Timeline:** Week 1 (1-2 days)

- [ ] Set up development, staging, production environments
- [ ] Configure Supabase projects for each environment
- [ ] Set up Anthropic API keys and rate limits
- [ ] Configure CI/CD pipeline (GitHub Actions or similar)
- [ ] Set up monitoring and logging (Sentry, LogRocket, or similar)
- [ ] Create development branch and pull request template

---

### Phase 1: Foundation (Weeks 1-3)

**Goal:** Complete database schema, core API routes, basic UI components, and single conversation generation workflow.

#### Week 1: Database Schema & Core Infrastructure
**Owner:** Backend Engineering Team

**Tasks:**
- [ ] Create conversations table with indexes
- [ ] Create conversation_turns table with foreign keys
- [ ] Create conversation_metadata table with JSONB field
- [ ] Create generation_logs table (extend existing api_response_logs)
- [ ] Create export_logs table
- [ ] Extend prompt_templates table for conversation tiers
- [ ] Write database migrations with rollback scripts
- [ ] Set up Row Level Security (RLS) policies for multi-tenancy
- [ ] Seed database with sample prompt templates
- [ ] Test schema with sample data (10-20 conversations)

**Deliverables:**
- ✅ Database schema fully implemented and tested
- ✅ Migrations tested in staging environment
- ✅ RLS policies verified for data isolation
- ✅ Sample data inserted for development

**Acceptance Test:** Can manually insert conversation with turns, query efficiently (<100ms), enforce foreign key constraints, and isolate data by user_id.

#### Week 2: API Routes & Services
**Owner:** Backend Engineering Team

**Tasks:**
- [ ] Implement conversationService (CRUD operations)
- [ ] Implement conversationTurnService (CRUD with batch insert)
- [ ] Implement conversationGenerationService (orchestrate generation)
- [ ] Create POST /api/conversations/generate (single conversation)
- [ ] Create GET /api/conversations (list with basic filters)
- [ ] Create GET /api/conversations/:id (single with turns)
- [ ] Create PATCH /api/conversations/:id (update metadata, approval)
- [ ] Implement ConversationGenerator class with Claude API integration
- [ ] Add prompt template parameter injection
- [ ] Add response parsing and validation
- [ ] Write unit tests for services (if time permits)

**Deliverables:**
- ✅ All API routes implemented and manually tested with Postman/Insomnia
- ✅ Services tested with unit tests (critical paths)
- ✅ Single conversation generation working end-to-end
- ✅ Error handling with user-friendly messages

**Acceptance Test:** Can call POST /api/conversations/generate, receive conversation with turns, fetch via GET /api/conversations/:id, and approve via PATCH.

#### Week 3: Basic UI Components
**Owner:** Frontend Engineering Team

**Tasks:**
- [ ] Create ConversationDashboard page (/conversations)
- [ ] Implement ConversationTable component (basic table, no filters yet)
- [ ] Implement ConversationRow component with status badges
- [ ] Implement ConversationPreviewPanel component (side panel or modal)
- [ ] Add "Generate" button per conversation row
- [ ] Add formatted turn-by-turn display
- [ ] Add Approve/Reject buttons
- [ ] Integrate with API routes (generate, fetch, approve)
- [ ] Add loading states and error handling
- [ ] Add toast notifications for success/error feedback

**Deliverables:**
- ✅ Dashboard page accessible and functional
- ✅ Can generate single conversation from UI
- ✅ Can view conversation in formatted preview
- ✅ Can approve/reject conversation from UI
- ✅ Loading states and error messages display correctly

**Acceptance Test:** User can navigate to /conversations, see table of conversations, click "Generate" on a row, wait for generation (15-45 seconds), see updated status, click row to preview, and approve/reject.

**Milestone 1 Complete:** Single conversation generation workflow functional end-to-end.

---

### Phase 2: Batch Generation & Quality (Weeks 4-6)

**Goal:** Implement batch generation, real-time progress tracking, quality validation, multi-dimensional filtering, and bulk actions.

#### Week 4: Batch Generation & Progress Tracking
**Owner:** Backend + Frontend Engineering Teams

**Tasks:**
- [ ] Implement batch generation logic with rate limiting
- [ ] Create POST /api/conversations/generate-batch (multiple)
- [ ] Create POST /api/conversations/generate-all (entire dataset)
- [ ] Create GET /api/conversations/status (progress tracking)
- [ ] Add retry logic with exponential backoff
- [ ] Add error handling at conversation level (not batch level)
- [ ] Implement progress tracking with database-backed status
- [ ] Create ProgressTracker component (progress bar, current conversation, time remaining)
- [ ] Add polling mechanism (every 2-5 seconds)
- [ ] Add "Generate Selected" button with checkbox multi-select
- [ ] Add "Generate All" button with confirmation dialog

**Deliverables:**
- ✅ Batch generation working for 10+ conversations
- ✅ Real-time progress tracking updating every 2-5 seconds
- ✅ Error recovery with retry logic tested
- ✅ UI showing progress bar and current conversation

**Acceptance Test:** User can select 20 conversations, click "Generate Selected", see progress bar updating, see current conversation being generated, and verify all 20 completed successfully (or show specific failures).

#### Week 5: Quality Validation & Filtering
**Owner:** Backend + Frontend Engineering Teams

**Tasks:**
- [ ] Implement QualityValidator class (turn count, length, structure)
- [ ] Calculate quality score (1-10) combining validation checks
- [ ] Add quality_score column to conversations table
- [ ] Display quality score in ConversationTable with color coding
- [ ] Implement FilterPanel component (dropdowns for 8 dimensions)
- [ ] Add filter state management (URL query params)
- [ ] Implement database-side filtering with indexes
- [ ] Add "Clear All Filters" button
- [ ] Add filter badge display showing active filters
- [ ] Add dynamic conversation count updating with filters

**Deliverables:**
- ✅ Quality scoring working for all generated conversations
- ✅ Quality scores displayed in table with color coding (red < 6, yellow 6-8, green > 8)
- ✅ Filters working for all 8 dimensions
- ✅ Filter combinations work together (AND logic)
- ✅ Filter state persists in URL

**Acceptance Test:** User can filter by Persona: Anxious Investor + Emotion: Fear + Quality: < 6, see filtered results, verify conversation count updates, clear filters to see all conversations.

#### Week 6: Approval Workflow & Bulk Actions
**Owner:** Frontend + Backend Engineering Teams

**Tasks:**
- [ ] Add reviewer_notes field to conversations table
- [ ] Add audit trail (approved_by, approved_at, reviewer_notes)
- [ ] Enhance ConversationPreviewPanel with metadata display
- [ ] Add Previous/Next navigation buttons to preview panel
- [ ] Implement bulk selection with checkboxes
- [ ] Create POST /api/conversations/bulk-action (approve/reject/delete batch)
- [ ] Add BulkActionControls component (buttons for bulk actions)
- [ ] Add confirmation dialogs for destructive actions (delete, reject)
- [ ] Add success/error feedback showing counts
- [ ] Test bulk approve/reject with 50+ conversations

**Deliverables:**
- ✅ Approval workflow complete with audit trail
- ✅ Bulk actions working for approve, reject, delete
- ✅ Confirmation dialogs preventing accidental actions
- ✅ Success/error feedback showing results

**Acceptance Test:** User can select 30 conversations using checkboxes, click "Approve Selected", see confirmation dialog, confirm, and verify all 30 marked approved with audit trail showing user_id and timestamp.

**Milestone 2 Complete:** Batch generation, real-time progress tracking, quality validation, filtering, and bulk actions fully functional.

---

### Phase 3: Production Ready (Weeks 7-8)

**Goal:** Implement three-tier architecture, cost tracking, export functionality, complete audit trail, error handling, performance optimization, and documentation.

#### Week 7: Three-Tier Architecture & Cost Tracking
**Owner:** Backend + Frontend Engineering Teams

**Tasks:**
- [ ] Add tier column to conversations table (enum: template/scenario/edge_case)
- [ ] Create prompt templates for each tier (Template, Scenario, Edge Case)
- [ ] Implement tier-specific generation logic
- [ ] Add tier filter to FilterPanel
- [ ] Add coverage analysis API route (distribution across tiers)
- [ ] Implement cost estimation logic (input/output tokens × pricing)
- [ ] Add estimated_cost_usd and actual_cost_usd columns
- [ ] Create CostEstimator component (pre-generation dialog)
- [ ] Add real-time cost tracking during generation
- [ ] Add post-generation cost summary

**Deliverables:**
- ✅ Three-tier architecture implemented (40 Template, 35 Scenario, 15 Edge Case)
- ✅ Cost estimation and tracking fully functional
- ✅ Coverage analysis showing distribution across tiers
- ✅ Cost transparency meeting user expectations

**Acceptance Test:** User can generate conversations across all three tiers, see pre-generation cost estimate (e.g., $8.50 for 100 conversations), monitor real-time cost during generation, and verify post-generation summary showing actual vs. estimated cost.

#### Week 8: Export, Audit Trail & Documentation
**Owner:** Full Team (Backend, Frontend, Product)

**Tasks:**
- [ ] Implement exportService (generate LoRA-ready JSON)
- [ ] Create POST /api/export/conversations (export with filters)
- [ ] Add format conversion (OpenAI, Anthropic, generic JSON)
- [ ] Create ExportDialog component (format selection, preview, download)
- [ ] Add metadata header to exports (date, count, quality stats)
- [ ] Implement export_logs table tracking (user_id, filter_state, count)
- [ ] Verify complete audit trail for all actions (generation, approval, export)
- [ ] Performance optimization (query analysis, index tuning)
- [ ] Load testing (100+ conversations, 1000+ conversations)
- [ ] Write user documentation (Getting Started, Feature Guide)
- [ ] Write technical documentation (Architecture, API Reference, Database Schema)
- [ ] Create video tutorials (3-5 short videos)

**Deliverables:**
- ✅ Export functionality working with multiple formats
- ✅ Complete audit trail verified for compliance
- ✅ Performance meeting targets (< 500ms queries)
- ✅ User and technical documentation complete
- ✅ Video tutorials embedded in UI

**Acceptance Test:** User can filter to approved conversations only, click "Export", select OpenAI format, preview sample structure, download file (training-data-2025-10-26-approved-87-conversations.json), and verify JSON structure matches OpenAI fine-tuning format. Verify audit trail shows export event with user_id, filter_state, and timestamp.

**Milestone 3 Complete:** Production-ready conversation generation module with three-tier architecture, cost tracking, export, complete audit trail, performance optimization, and documentation.

---

### Resource Requirements

#### Engineering Team
- **Backend Engineers:** 2 full-time (database, API, generation engine)
- **Frontend Engineers:** 2 full-time (UI components, state management, integration)
- **AI Engineer:** 1 part-time (prompt engineering, quality validation)
- **DevOps Engineer:** 1 part-time (infrastructure, monitoring, deployment)
- **QA Engineer:** 1 part-time (testing, quality assurance) (optional Week 7-8)

#### External Resources
- **Anthropic Claude API Credits:** Estimate $500-1000 for development and testing
- **Supabase Hosting:** Pro plan ($25/month) or higher depending on usage
- **Monitoring Tools:** Sentry, LogRocket, or similar (~$100/month)

#### Infrastructure
- **Development Environment:** Separate Supabase project with seeded data
- **Staging Environment:** Supabase project mirroring production for final testing
- **Production Environment:** Supabase project with RLS, monitoring, backups

#### Timeline Summary
- **Week 0:** Requirements finalization and setup (1-2 days)
- **Weeks 1-3:** Foundation (Milestone 1)
- **Weeks 4-6:** Batch Generation & Quality (Milestone 2)
- **Weeks 7-8:** Production Ready (Milestone 3)
- **Total:** 8 weeks (2 months) to production-ready launch

---

## Summary

The Interactive LoRA Conversation Generation Module completes the Bright Run platform's end-to-end pipeline from document upload to LoRA-ready training data. By transforming manual, console-based generation into an intuitive UI-driven workflow, the module empowers non-technical business experts to generate 90-100 high-quality conversations in hours instead of weeks—achieving 95%+ time savings while maintaining rigorous quality control.

### Key Differentiators

1. **First-to-Market:** Only platform offering UI-driven conversation generation for small businesses
2. **Quality Framework:** Three-tier architecture + automated validation + human approval ensuring excellence
3. **Complete Integration:** Seamless workflow from document categorization → chunk extraction → conversation generation → LoRA export
4. **Scalable Architecture:** Normalized database + efficient querying supporting thousands of conversations
5. **Transparent Operations:** Real-time progress tracking + complete audit trails + cost visibility
6. **Business-Aligned:** Multi-dimensional filtering matching customer segmentation and emotional taxonomy

### Strategic Impact

- **Immediate:** 95% time savings, zero technical knowledge required, complete workflow automation
- **Short-term:** Higher quality training datasets leading to better performing personalized AI models
- **Long-term:** Democratized access to custom AI, leveling the playing field for small businesses competing against larger enterprises

### User Empowerment

Non-technical business owners gain independence and control over their AI training data creation—no longer dependent on consultants, engineers, or complex technical tools. This self-service capability fundamentally changes the economics and accessibility of custom AI, transforming Bright Run from a collection of AI tools into a complete platform for AI personalization that small businesses can afford, understand, and trust.

### Next Steps

1. **Stakeholder Review:** Circulate this overview document for feedback and sign-off
2. **Technical Architecture Review:** Validate database schema, API design, and scalability with engineering leadership
3. **Development Kickoff:** Week 1 starts with database schema implementation
4. **Milestone-Based Delivery:** 3 milestones over 8 weeks with clear acceptance tests
5. **Production Launch:** After Milestone 3, launch to beta users for feedback before general availability

---

**Document Status:** Draft for Review  
**Next Review Date:** TBD  
**Approval Required:** Product Manager, CTO, Business Owner Representative

