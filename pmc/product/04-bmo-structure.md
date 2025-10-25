# Bright Run LoRA Fine-Tuning Training Data Platform - Structure Specification
**Version:** 1.0.0  
**Date:** 01-20-2025  
**Category:** LoRA Fine-Tuning Training Data Platform  
**Product Abbreviation:** BMO

**Source References:**
- Overview Document: `pmc/product/01-bmo-overview.md`
- User Stories: `pmc/product/02-bmo-user-stories.md`
- Functional Requirements: `pmc/product/03-bmo-functional-requirements.md`

**Purpose:** This document provides the complete file and folder structure for the Bright Run LoRA Training Data Platform, serving as the authoritative reference for implementation.

---

## Root Structure

```
bright-run-platform/
├── src/                            # Source code root
├── public/                         # Static assets
├── docs/                           # Documentation
├── tests/                          # Test files
├── scripts/                        # Build and deployment scripts
├── config/                         # Configuration files
└── [Configuration Files]           # Root config files
```

## Application Directory Structure

```
src/
├── app/                            # Next.js 14 app directory
│   ├── (auth)/                     # Authentication route group
│   │   ├── login/
│   │   │   ├── page.tsx            # Login page
│   │   │   └── loading.tsx         # Login loading UI
│   │   ├── signup/
│   │   │   ├── page.tsx            # Signup page
│   │   │   └── loading.tsx         # Signup loading UI
│   │   └── forgot-password/
│   │       ├── page.tsx            # Forgot password page
│   │       └── loading.tsx         # Forgot password loading UI
│   ├── (dashboard)/                # Dashboard route group
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   ├── loading.tsx         # Dashboard loading UI
│   │   │   └── layout.tsx          # Dashboard layout
│   │   ├── projects/
│   │   │   ├── page.tsx            # Projects list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx        # Project detail
│   │   │   │   ├── loading.tsx     # Project loading UI
│   │   │   │   └── layout.tsx      # Project layout
│   │   │   └── new/
│   │   │       ├── page.tsx        # New project wizard
│   │   │       └── loading.tsx     # New project loading UI
│   │   └── settings/
│   │       ├── page.tsx            # Settings page
│   │       ├── profile/
│   │       │   └── page.tsx        # Profile settings
│   │       ├── billing/
│   │       │   └── page.tsx        # Billing settings
│   │       └── security/
│   │           └── page.tsx        # Security settings
│   ├── (workflow)/                 # Workflow route group
│   │   ├── workflow/
│   │   │   ├── [projectId]/
│   │   │   │   ├── page.tsx        # Workflow overview
│   │   │   │   ├── stage-1/
│   │   │   │   │   └── page.tsx    # Knowledge ingestion
│   │   │   │   ├── stage-2/
│   │   │   │   │   └── page.tsx    # Content analysis
│   │   │   │   ├── stage-3/
│   │   │   │   │   └── page.tsx    # Training pair generation
│   │   │   │   ├── stage-4/
│   │   │   │   │   └── page.tsx    # Semantic variation
│   │   │   │   ├── stage-5/
│   │   │   │   │   └── page.tsx    # Quality assessment
│   │   │   │   └── stage-6/
│   │   │   │       └── page.tsx    # Export and deployment
│   │   │   └── loading.tsx         # Workflow loading UI
│   │   └── templates/
│   │       ├── page.tsx            # Template library
│   │       └── [templateId]/
│   │           └── page.tsx        # Template detail
│   ├── (enterprise)/               # Enterprise route group
│   │   ├── admin/
│   │   │   ├── page.tsx            # Admin dashboard
│   │   │   ├── users/
│   │   │   │   └── page.tsx        # User management
│   │   │   ├── projects/
│   │   │   │   └── page.tsx        # Project management
│   │   │   └── analytics/
│   │   │       └── page.tsx        # Analytics dashboard
│   │   └── api/
│   │       └── docs/
│   │           └── page.tsx        # API documentation
│   ├── layout.tsx                  # Root layout
│   ├── providers.tsx               # App providers wrapper
│   ├── globals.css                 # Global styles
│   ├── not-found.tsx               # 404 page
│   └── error.tsx                   # Error boundary
```

## Components Directory Structure

```
src/components/
├── ui/                            # Base UI components
│   ├── button/
│   │   ├── index.tsx              # Button component
│   │   ├── button.test.tsx        # Button tests
│   │   ├── types.ts               # Button types
│   │   └── variants.ts            # Button variants
│   ├── card/
│   │   ├── index.tsx              # Card component
│   │   ├── card.test.tsx          # Card tests
│   │   ├── types.ts               # Card types
│   │   └── variants.ts            # Card variants
│   ├── input/
│   │   ├── index.tsx              # Input component
│   │   ├── input.test.tsx         # Input tests
│   │   ├── types.ts               # Input types
│   │   └── variants.ts            # Input variants
│   ├── modal/
│   │   ├── index.tsx              # Modal component
│   │   ├── modal.test.tsx         # Modal tests
│   │   ├── types.ts               # Modal types
│   │   └── variants.ts            # Modal variants
│   ├── progress/
│   │   ├── index.tsx              # Progress component
│   │   ├── progress.test.tsx      # Progress tests
│   │   ├── types.ts               # Progress types
│   │   └── variants.ts            # Progress variants
│   └── [other-base-components]/
├── workflow/                      # Workflow-specific components
│   ├── stage-navigation/
│   │   ├── index.tsx              # Stage navigation component
│   │   ├── stage-navigation.test.tsx # Stage navigation tests
│   │   ├── types.ts               # Stage navigation types
│   │   └── stage-indicator.tsx    # Stage indicator subcomponent
│   ├── file-upload/
│   │   ├── index.tsx              # File upload component
│   │   ├── file-upload.test.tsx   # File upload tests
│   │   ├── types.ts               # File upload types
│   │   ├── drag-drop.tsx          # Drag and drop subcomponent
│   │   └── file-preview.tsx       # File preview subcomponent
│   ├── content-analysis/
│   │   ├── index.tsx              # Content analysis component
│   │   ├── content-analysis.test.tsx # Content analysis tests
│   │   ├── types.ts               # Content analysis types
│   │   ├── knowledge-graph.tsx    # Knowledge graph visualization
│   │   └── entity-highlight.tsx   # Entity highlighting
│   ├── training-pairs/
│   │   ├── index.tsx              # Training pairs component
│   │   ├── training-pairs.test.tsx # Training pairs tests
│   │   ├── types.ts               # Training pairs types
│   │   ├── pair-editor.tsx        # Pair editor subcomponent
│   │   └── pair-preview.tsx       # Pair preview subcomponent
│   ├── semantic-variation/
│   │   ├── index.tsx              # Semantic variation component
│   │   ├── semantic-variation.test.tsx # Semantic variation tests
│   │   ├── types.ts               # Semantic variation types
│   │   ├── variation-controls.tsx # Variation controls
│   │   └── variation-preview.tsx  # Variation preview
│   ├── quality-assessment/
│   │   ├── index.tsx              # Quality assessment component
│   │   ├── quality-assessment.test.tsx # Quality assessment tests
│   │   ├── types.ts               # Quality assessment types
│   │   ├── quality-metrics.tsx    # Quality metrics display
│   │   └── quality-feedback.tsx   # Quality feedback interface
│   └── export/
│       ├── index.tsx              # Export component
│       ├── export.test.tsx        # Export tests
│       ├── types.ts               # Export types
│       ├── format-selector.tsx    # Format selector
│       └── export-preview.tsx     # Export preview
├── dashboard/                     # Dashboard components
│   ├── project-card/
│   │   ├── index.tsx              # Project card component
│   │   ├── project-card.test.tsx  # Project card tests
│   │   ├── types.ts               # Project card types
│   │   └── project-actions.tsx    # Project actions subcomponent
│   ├── analytics/
│   │   ├── index.tsx              # Analytics component
│   │   ├── analytics.test.tsx     # Analytics tests
│   │   ├── types.ts               # Analytics types
│   │   ├── charts/
│   │   │   ├── quality-chart.tsx  # Quality chart
│   │   │   ├── progress-chart.tsx # Progress chart
│   │   │   └── usage-chart.tsx    # Usage chart
│   │   └── metrics/
│   │       ├── quality-metrics.tsx # Quality metrics
│   │       ├── progress-metrics.tsx # Progress metrics
│   │       └── usage-metrics.tsx  # Usage metrics
│   └── notifications/
│       ├── index.tsx              # Notifications component
│       ├── notifications.test.tsx # Notifications tests
│       ├── types.ts               # Notifications types
│       └── notification-item.tsx  # Notification item
├── layout/                        # Layout components
│   ├── header/
│   │   ├── index.tsx              # Header component
│   │   ├── header.test.tsx        # Header tests
│   │   ├── types.ts               # Header types
│   │   ├── navigation.tsx         # Navigation component
│   │   ├── user-menu.tsx          # User menu component
│   │   └── search.tsx             # Search component
│   ├── sidebar/
│   │   ├── index.tsx              # Sidebar component
│   │   ├── sidebar.test.tsx       # Sidebar tests
│   │   ├── types.ts               # Sidebar types
│   │   ├── nav-items.tsx          # Navigation items
│   │   └── collapsible.tsx        # Collapsible sections
│   └── footer/
│       ├── index.tsx              # Footer component
│       ├── footer.test.tsx        # Footer tests
│       ├── types.ts               # Footer types
│       └── links.tsx              # Footer links
├── forms/                         # Form components
│   ├── project-form/
│   │   ├── index.tsx              # Project form component
│   │   ├── project-form.test.tsx  # Project form tests
│   │   ├── types.ts               # Project form types
│   │   └── validation.ts          # Form validation
│   ├── settings-form/
│   │   ├── index.tsx              # Settings form component
│   │   ├── settings-form.test.tsx # Settings form tests
│   │   ├── types.ts               # Settings form types
│   │   └── sections/
│   │       ├── profile.tsx        # Profile section
│   │       ├── billing.tsx        # Billing section
│   │       └── security.tsx       # Security section
│   └── auth-forms/
│       ├── login-form.tsx         # Login form
│       ├── signup-form.tsx        # Signup form
│       └── forgot-password-form.tsx # Forgot password form
└── shared/                        # Shared components
    ├── loading/
    │   ├── spinner.tsx            # Spinner component
    │   ├── skeleton.tsx           # Skeleton component
    │   └── progress-bar.tsx       # Progress bar component
    ├── error/
    │   ├── error-boundary.tsx     # Error boundary component
    │   ├── error-fallback.tsx     # Error fallback component
    │   └── error-message.tsx      # Error message component
    ├── feedback/
    │   ├── toast.tsx              # Toast notification
    │   ├── alert.tsx              # Alert component
    │   └── tooltip.tsx            # Tooltip component
    └── data/
        ├── table.tsx              # Data table component
        ├── pagination.tsx         # Pagination component
        └── filters.tsx            # Filter component
```

## Core Systems Structure

```
src/lib/
├── ai/                            # AI processing services
│   ├── content-analysis/
│   │   ├── index.ts               # Content analysis service
│   │   ├── entity-extraction.ts   # Entity extraction
│   │   ├── topic-modeling.ts      # Topic modeling
│   │   ├── knowledge-graph.ts     # Knowledge graph construction
│   │   └── quality-assessment.ts  # Quality assessment
│   ├── training-generation/
│   │   ├── index.ts               # Training generation service
│   │   ├── pair-generation.ts     # Training pair generation
│   │   ├── conversation-gen.ts    # Conversation generation
│   │   └── task-specific.ts       # Task-specific generation
│   ├── semantic-variation/
│   │   ├── index.ts               # Semantic variation service
│   │   ├── variation-engine.ts    # Variation engine
│   │   ├── style-adaptation.ts    # Style adaptation
│   │   ├── cultural-variation.ts  # Cultural variation
│   │   └── diversity-scoring.ts   # Diversity scoring
│   └── models/
│       ├── openai.ts              # OpenAI integration
│       ├── anthropic.ts           # Anthropic integration
│       ├── huggingface.ts         # HuggingFace integration
│       └── local.ts               # Local model integration
├── workflow/                      # Workflow engine
│   ├── index.ts                   # Workflow engine
│   ├── stages/
│   │   ├── ingestion.ts           # Stage 1: Knowledge ingestion
│   │   ├── analysis.ts            # Stage 2: Content analysis
│   │   ├── generation.ts          # Stage 3: Training pair generation
│   │   ├── variation.ts           # Stage 4: Semantic variation
│   │   ├── assessment.ts          # Stage 5: Quality assessment
│   │   └── export.ts              # Stage 6: Export and deployment
│   ├── orchestration.ts           # Workflow orchestration
│   ├── state-management.ts        # Workflow state management
│   └── progress-tracking.ts       # Progress tracking
├── processing/                    # Content processing
│   ├── documents/
│   │   ├── index.ts               # Document processing service
│   │   ├── pdf-processor.ts       # PDF processing
│   │   ├── word-processor.ts      # Word document processing
│   │   ├── powerpoint-processor.ts # PowerPoint processing
│   │   └── text-processor.ts      # Text processing
│   ├── media/
│   │   ├── index.ts               # Media processing service
│   │   ├── audio-processor.ts     # Audio processing
│   │   ├── video-processor.ts     # Video processing
│   │   └── transcription.ts       # Transcription service
│   ├── web/
│   │   ├── index.ts               # Web content processing
│   │   ├── scraper.ts             # Web scraping
│   │   ├── content-extractor.ts   # Content extraction
│   │   └── robots-parser.ts       # Robots.txt parsing
│   └── validation/
│       ├── index.ts               # Content validation
│       ├── format-validation.ts   # Format validation
│       ├── quality-validation.ts  # Quality validation
│       └── virus-scan.ts          # Virus scanning
├── export/                        # Export services
│   ├── index.ts                   # Export service
│   ├── formats/
│   │   ├── huggingface.ts         # HuggingFace format
│   │   ├── json.ts                # JSON format
│   │   ├── csv.ts                 # CSV format
│   │   ├── parquet.ts             # Parquet format
│   │   └── custom.ts              # Custom format
│   ├── delivery/
│   │   ├── cloud-storage.ts       # Cloud storage delivery
│   │   ├── api-upload.ts          # API upload
│   │   └── local-download.ts      # Local download
│   └── validation/
│       ├── format-validation.ts   # Format validation
│       └── integrity-check.ts     # Integrity checking
├── security/                      # Security services
│   ├── encryption/
│   │   ├── index.ts               # Encryption service
│   │   ├── aes-encryption.ts      # AES encryption
│   │   ├── key-management.ts      # Key management
│   │   └── hsm-integration.ts     # HSM integration
│   ├── authentication/
│   │   ├── index.ts               # Authentication service
│   │   ├── jwt.ts                 # JWT handling
│   │   ├── oauth.ts               # OAuth integration
│   │   ├── saml.ts                # SAML integration
│   │   └── mfa.ts                 # Multi-factor authentication
│   ├── authorization/
│   │   ├── index.ts               # Authorization service
│   │   ├── rbac.ts                # Role-based access control
│   │   ├── permissions.ts         # Permission management
│   │   └── audit.ts               # Audit logging
│   └── privacy/
│       ├── index.ts               # Privacy service
│       ├── data-isolation.ts      # Data isolation
│       ├── anonymization.ts       # Data anonymization
│       └── deletion.ts            # Data deletion
├── integration/                   # External integrations
│   ├── training-platforms/
│   │   ├── huggingface-hub.ts     # HuggingFace Hub integration
│   │   ├── runpod.ts              # RunPod integration
│   │   ├── vast-ai.ts             # Vast.ai integration
│   │   └── paperspace.ts          # Paperspace integration
│   ├── cloud-storage/
│   │   ├── aws-s3.ts              # AWS S3 integration
│   │   ├── google-cloud.ts        # Google Cloud Storage
│   │   ├── azure-blob.ts          # Azure Blob Storage
│   │   └── local-storage.ts       # Local storage
│   ├── business-systems/
│   │   ├── crm/
│   │   │   ├── salesforce.ts      # Salesforce integration
│   │   │   ├── hubspot.ts         # HubSpot integration
│   │   │   └── pipedrive.ts       # Pipedrive integration
│   │   ├── document-management/
│   │   │   ├── sharepoint.ts      # SharePoint integration
│   │   │   ├── google-drive.ts    # Google Drive integration
│   │   │   └── dropbox.ts         # Dropbox integration
│   │   └── workflow-automation/
│   │       ├── zapier.ts          # Zapier integration
│   │       ├── power-automate.ts  # Power Automate integration
│   │       └── integromat.ts      # Integromat integration
│   └── payment/
│       ├── stripe.ts              # Stripe integration
│       ├── paypal.ts              # PayPal integration
│       └── billing.ts             # Billing service
├── utils/                         # Utility functions
│   ├── validation/
│   │   ├── index.ts               # Validation utilities
│   │   ├── schemas.ts             # Validation schemas
│   │   ├── sanitization.ts        # Data sanitization
│   │   └── formatting.ts          # Data formatting
│   ├── performance/
│   │   ├── index.ts               # Performance utilities
│   │   ├── caching.ts             # Caching utilities
│   │   ├── optimization.ts        # Optimization utilities
│   │   └── monitoring.ts          # Performance monitoring
│   ├── date-time/
│   │   ├── index.ts               # Date/time utilities
│   │   ├── formatting.ts          # Date formatting
│   │   ├── timezone.ts            # Timezone handling
│   │   └── duration.ts            # Duration calculations
│   └── file/
│       ├── index.ts               # File utilities
│       ├── compression.ts         # File compression
│       ├── conversion.ts          # File conversion
│       └── validation.ts          # File validation
└── config/                        # Configuration
    ├── index.ts                   # Configuration service
    ├── environment.ts             # Environment configuration
    ├── database.ts                # Database configuration
    ├── ai-services.ts             # AI services configuration
    ├── security.ts                # Security configuration
    └── features.ts                # Feature flags
```

## Type Definitions Structure

```
src/types/
├── ai/                            # AI-related types
│   ├── content-analysis.ts        # Content analysis types
│   ├── training-generation.ts     # Training generation types
│   ├── semantic-variation.ts      # Semantic variation types
│   └── models.ts                  # AI model types
├── workflow/                      # Workflow types
│   ├── stages.ts                  # Workflow stage types
│   ├── state.ts                   # Workflow state types
│   ├── progress.ts                # Progress tracking types
│   └── orchestration.ts           # Orchestration types
├── processing/                    # Processing types
│   ├── documents.ts               # Document processing types
│   ├── media.ts                   # Media processing types
│   ├── web.ts                     # Web processing types
│   └── validation.ts              # Validation types
├── export/                        # Export types
│   ├── formats.ts                 # Export format types
│   ├── delivery.ts                # Delivery types
│   └── validation.ts              # Export validation types
├── security/                      # Security types
│   ├── encryption.ts              # Encryption types
│   ├── authentication.ts          # Authentication types
│   ├── authorization.ts           # Authorization types
│   └── privacy.ts                 # Privacy types
├── integration/                   # Integration types
│   ├── training-platforms.ts      # Training platform types
│   ├── cloud-storage.ts           # Cloud storage types
│   ├── business-systems.ts        # Business system types
│   └── payment.ts                 # Payment types
├── components/                    # Component types
│   ├── ui.ts                      # UI component types
│   ├── workflow.ts                # Workflow component types
│   ├── dashboard.ts               # Dashboard component types
│   ├── layout.ts                  # Layout component types
│   ├── forms.ts                   # Form component types
│   └── shared.ts                  # Shared component types
├── api/                           # API types
│   ├── requests.ts                # API request types
│   ├── responses.ts               # API response types
│   ├── errors.ts                  # API error types
│   └── webhooks.ts                # Webhook types
├── database/                      # Database types
│   ├── models.ts                  # Database model types
│   ├── queries.ts                 # Query types
│   ├── migrations.ts              # Migration types
│   └── seeds.ts                   # Seed data types
└── global.d.ts                    # Global type declarations
```

## API Routes Structure

```
src/app/api/
├── auth/                          # Authentication endpoints
│   ├── login/
│   │   └── route.ts               # Login endpoint
│   ├── signup/
│   │   └── route.ts               # Signup endpoint
│   ├── logout/
│   │   └── route.ts               # Logout endpoint
│   ├── refresh/
│   │   └── route.ts               # Token refresh endpoint
│   └── verify/
│       └── route.ts               # Email verification endpoint
├── projects/                      # Project endpoints
│   ├── route.ts                   # Projects list endpoint
│   ├── [id]/
│   │   ├── route.ts               # Project CRUD endpoint
│   │   ├── workflow/
│   │   │   └── route.ts           # Workflow management endpoint
│   │   ├── files/
│   │   │   └── route.ts           # File management endpoint
│   │   └── export/
│   │       └── route.ts           # Export endpoint
│   └── templates/
│       └── route.ts               # Template endpoints
├── workflow/                      # Workflow endpoints
│   ├── stages/
│   │   ├── ingestion/
│   │   │   └── route.ts           # Ingestion stage endpoint
│   │   ├── analysis/
│   │   │   └── route.ts           # Analysis stage endpoint
│   │   ├── generation/
│   │   │   └── route.ts           # Generation stage endpoint
│   │   ├── variation/
│   │   │   └── route.ts           # Variation stage endpoint
│   │   ├── assessment/
│   │   │   └── route.ts           # Assessment stage endpoint
│   │   └── export/
│   │       └── route.ts           # Export stage endpoint
│   ├── progress/
│   │   └── route.ts               # Progress tracking endpoint
│   └── state/
│       └── route.ts               # State management endpoint
├── ai/                            # AI service endpoints
│   ├── content-analysis/
│   │   └── route.ts               # Content analysis endpoint
│   ├── training-generation/
│   │   └── route.ts               # Training generation endpoint
│   ├── semantic-variation/
│   │   └── route.ts               # Semantic variation endpoint
│   └── quality-assessment/
│       └── route.ts               # Quality assessment endpoint
├── processing/                    # Processing endpoints
│   ├── documents/
│   │   └── route.ts               # Document processing endpoint
│   ├── media/
│   │   └── route.ts               # Media processing endpoint
│   ├── web/
│   │   └── route.ts               # Web processing endpoint
│   └── validation/
│       └── route.ts               # Validation endpoint
├── export/                        # Export endpoints
│   ├── formats/
│   │   └── route.ts               # Format generation endpoint
│   ├── delivery/
│   │   └── route.ts               # Delivery endpoint
│   └── validation/
│       └── route.ts               # Export validation endpoint
├── integration/                   # Integration endpoints
│   ├── training-platforms/
│   │   └── route.ts               # Training platform integration
│   ├── cloud-storage/
│   │   └── route.ts               # Cloud storage integration
│   ├── business-systems/
│   │   └── route.ts               # Business system integration
│   └── webhooks/
│       └── route.ts               # Webhook endpoints
├── user/                          # User endpoints
│   ├── profile/
│   │   └── route.ts               # Profile management endpoint
│   ├── settings/
│   │   └── route.ts               # Settings management endpoint
│   └── billing/
│       └── route.ts               # Billing management endpoint
├── admin/                         # Admin endpoints
│   ├── users/
│   │   └── route.ts               # User management endpoint
│   ├── projects/
│   │   └── route.ts               # Project management endpoint
│   ├── analytics/
│   │   └── route.ts               # Analytics endpoint
│   └── system/
│       └── route.ts               # System management endpoint
└── webhooks/                      # Webhook endpoints
    ├── stripe/
    │   └── route.ts               # Stripe webhook
    ├── github/
    │   └── route.ts               # GitHub webhook
    └── custom/
        └── route.ts               # Custom webhook
```

## Database Structure

```
src/lib/database/
├── models/                        # Database models
│   ├── user.ts                    # User model
│   ├── project.ts                 # Project model
│   ├── workflow.ts                # Workflow model
│   ├── file.ts                    # File model
│   ├── training-data.ts           # Training data model
│   ├── export.ts                  # Export model
│   ├── template.ts                # Template model
│   ├── integration.ts             # Integration model
│   ├── billing.ts                 # Billing model
│   └── audit.ts                   # Audit model
├── migrations/                    # Database migrations
│   ├── 001-initial-schema.ts      # Initial schema
│   ├── 002-add-workflow.ts        # Add workflow tables
│   ├── 003-add-training-data.ts   # Add training data tables
│   ├── 004-add-integrations.ts    # Add integration tables
│   └── 005-add-audit.ts           # Add audit tables
├── seeds/                         # Database seeds
│   ├── users.ts                   # User seed data
│   ├── templates.ts               # Template seed data
│   └── integrations.ts            # Integration seed data
├── queries/                       # Database queries
│   ├── user-queries.ts            # User queries
│   ├── project-queries.ts         # Project queries
│   ├── workflow-queries.ts        # Workflow queries
│   ├── training-data-queries.ts   # Training data queries
│   └── analytics-queries.ts       # Analytics queries
├── connection.ts                  # Database connection
├── schema.ts                      # Database schema
└── index.ts                       # Database exports
```

## Testing Structure

```
tests/
├── unit/                          # Unit tests
│   ├── components/                # Component tests
│   │   ├── ui/                    # UI component tests
│   │   ├── workflow/              # Workflow component tests
│   │   ├── dashboard/             # Dashboard component tests
│   │   └── shared/                # Shared component tests
│   ├── lib/                       # Library tests
│   │   ├── ai/                    # AI service tests
│   │   ├── workflow/              # Workflow engine tests
│   │   ├── processing/            # Processing service tests
│   │   ├── export/                # Export service tests
│   │   ├── security/              # Security service tests
│   │   └── integration/           # Integration service tests
│   ├── utils/                     # Utility tests
│   └── hooks/                     # Hook tests
├── integration/                   # Integration tests
│   ├── api/                       # API endpoint tests
│   ├── workflow/                  # Workflow integration tests
│   ├── database/                  # Database integration tests
│   └── external/                  # External service tests
├── e2e/                          # End-to-end tests
│   ├── workflows/                 # Workflow E2E tests
│   ├── authentication/            # Authentication E2E tests
│   ├── projects/                  # Project management E2E tests
│   └── admin/                     # Admin E2E tests
├── visual/                       # Visual regression tests
│   ├── components/                # Component visual tests
│   ├── pages/                     # Page visual tests
│   └── workflows/                 # Workflow visual tests
├── performance/                  # Performance tests
│   ├── load/                      # Load testing
│   ├── stress/                    # Stress testing
│   └── benchmark/                 # Benchmark testing
└── fixtures/                     # Test fixtures
    ├── data/                      # Test data
    ├── files/                     # Test files
    └── mocks/                     # Mock data
```

## Configuration Files

```
config/
├── development/                   # Development configuration
│   ├── database.ts                # Development database config
│   ├── ai-services.ts             # Development AI services config
│   ├── security.ts                # Development security config
│   └── features.ts                # Development feature flags
├── staging/                       # Staging configuration
│   ├── database.ts                # Staging database config
│   ├── ai-services.ts             # Staging AI services config
│   ├── security.ts                # Staging security config
│   └── features.ts                # Staging feature flags
├── production/                    # Production configuration
│   ├── database.ts                # Production database config
│   ├── ai-services.ts             # Production AI services config
│   ├── security.ts                # Production security config
│   └── features.ts                # Production feature flags
└── shared/                        # Shared configuration
    ├── database.ts                # Shared database config
    ├── ai-services.ts             # Shared AI services config
    ├── security.ts                # Shared security config
    └── features.ts                # Shared feature flags
```

## Documentation Structure

```
docs/
├── api/                           # API documentation
│   ├── overview.md                # API overview
│   ├── authentication.md          # Authentication guide
│   ├── endpoints/                 # Endpoint documentation
│   │   ├── auth.md                # Authentication endpoints
│   │   ├── projects.md            # Project endpoints
│   │   ├── workflow.md            # Workflow endpoints
│   │   ├── ai.md                  # AI service endpoints
│   │   └── integration.md         # Integration endpoints
│   ├── schemas/                   # API schemas
│   │   ├── requests.md            # Request schemas
│   │   ├── responses.md           # Response schemas
│   │   └── errors.md              # Error schemas
│   └── examples/                  # API examples
│       ├── javascript.md          # JavaScript examples
│       ├── python.md              # Python examples
│       └── curl.md                # cURL examples
├── user-guides/                   # User guides
│   ├── getting-started.md         # Getting started guide
│   ├── workflow/                  # Workflow guides
│   │   ├── stage-1.md             # Stage 1 guide
│   │   ├── stage-2.md             # Stage 2 guide
│   │   ├── stage-3.md             # Stage 3 guide
│   │   ├── stage-4.md             # Stage 4 guide
│   │   ├── stage-5.md             # Stage 5 guide
│   │   └── stage-6.md             # Stage 6 guide
│   ├── templates/                 # Template guides
│   │   ├── using-templates.md     # Using templates guide
│   │   ├── creating-templates.md  # Creating templates guide
│   │   └── sharing-templates.md   # Sharing templates guide
│   ├── integrations/              # Integration guides
│   │   ├── training-platforms.md  # Training platform integration
│   │   ├── cloud-storage.md       # Cloud storage integration
│   │   └── business-systems.md    # Business system integration
│   └── troubleshooting/           # Troubleshooting guides
│       ├── common-issues.md       # Common issues
│       ├── error-codes.md         # Error codes
│       └── support.md             # Support guide
├── developer/                     # Developer documentation
│   ├── setup.md                   # Development setup
│   ├── architecture.md            # System architecture
│   ├── contributing.md            # Contributing guide
│   ├── testing.md                 # Testing guide
│   ├── deployment.md              # Deployment guide
│   └── security.md                # Security guide
├── enterprise/                    # Enterprise documentation
│   ├── deployment/                # Deployment guides
│   │   ├── on-premises.md         # On-premises deployment
│   │   ├── cloud.md               # Cloud deployment
│   │   └── hybrid.md              # Hybrid deployment
│   ├── security/                  # Security documentation
│   │   ├── encryption.md          # Encryption guide
│   │   ├── authentication.md      # Authentication guide
│   │   ├── authorization.md       # Authorization guide
│   │   └── compliance.md          # Compliance guide
│   ├── integration/               # Integration documentation
│   │   ├── sso.md                 # SSO integration
│   │   ├── api.md                 # API integration
│   │   └── webhooks.md            # Webhook integration
│   └── administration/            # Administration guides
│       ├── user-management.md     # User management
│       ├── project-management.md  # Project management
│       └── analytics.md           # Analytics and reporting
└── compliance/                    # Compliance documentation
    ├── gdpr.md                    # GDPR compliance
    ├── hipaa.md                   # HIPAA compliance
    ├── soc2.md                    # SOC2 compliance
    └── audit-trails.md            # Audit trail documentation
```

## File Naming Conventions

### Component Files
- Main component: `index.tsx`
- Types: `types.ts`
- Tests: `[name].test.tsx`
- Stories: `[name].stories.tsx`
- Variants: `variants.ts`

### Service Files
- Main service: `index.ts`
- Implementation: `[name].ts`
- Types: `[name].types.ts`
- Tests: `[name].test.ts`

### API Files
- Route handlers: `route.ts`
- Middleware: `middleware.ts`
- Validation: `validation.ts`

### Configuration Files
- Config files: `[name].config.ts`
- Environment files: `[name].env.ts`
- Type definitions: `[name].d.ts`

## Directory Naming Conventions

1. Feature directories: `kebab-case`
2. Component directories: `kebab-case`
3. Service directories: `kebab-case`
4. Route groups: `(group-name)` with parentheses
5. Dynamic routes: `[param-name]` with brackets

## Implementation Guidelines

### Component Organization
1. **Co-location**: Keep related files together (component, types, tests, etc.)
2. **Directory Per Component**: Each significant component gets its own directory
3. **Barrel Files**: Use index files for clean exports
4. **Clear Boundaries**: Maintain clear component boundaries
5. **Type Definitions**: Keep type definitions alongside components or in dedicated files

### Code Organization
1. **Feature Based**: Organize code by features or domains
2. **Shared Code**: Place shared utilities in dedicated directories
3. **Dependencies**: Minimize dependencies between unrelated features
4. **Consistency**: Maintain consistent file organization across similar components
5. **Documentation**: Include documentation for complex components or utilities

### Security and Privacy
1. **Data Isolation**: Implement complete customer data isolation
2. **Encryption**: Use end-to-end encryption for all sensitive data
3. **Access Control**: Implement role-based access control
4. **Audit Trails**: Maintain complete audit trails for all operations
5. **Compliance**: Ensure compliance with GDPR, HIPAA, and SOC2

### Performance
1. **Code Splitting**: Implement appropriate code splitting for large components
2. **Lazy Loading**: Use lazy loading for non-critical features
3. **Caching**: Implement intelligent caching strategies
4. **Optimization**: Optimize for performance at all levels
5. **Monitoring**: Implement comprehensive performance monitoring

---

## Quality Standards

### Code Organization
- [ ] Proper file location following structure
- [ ] Clear component boundaries
- [ ] Type safety throughout
- [ ] Documentation for complex logic

### Performance
- [ ] Appropriate code splitting
- [ ] Lazy loading where beneficial
- [ ] Optimized assets
- [ ] Efficient state management

### Security
- [ ] Input validation
- [ ] Output encoding
- [ ] Secure data handling
- [ ] Authentication/authorization patterns

### Accessibility
- [ ] Semantic HTML
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Proper ARIA attributes

### Responsive Design
- [ ] Mobile-first approach
- [ ] Consistent breakpoint usage
- [ ] Viewport optimizations
- [ ] Touch-friendly interfaces

### Privacy and Compliance
- [ ] Data isolation implementation
- [ ] Encryption standards
- [ ] Audit trail completeness
- [ ] Compliance verification

## Version Control Structure

### Branch Structure
```
├── main                            # Production code
├── develop                         # Development code
├── feature/*                       # Feature branches
├── release/*                       # Release branches
└── hotfix/*                       # Hotfix branches
```

### Standard Ignore Patterns
```
├── build/                         # Build outputs
├── coverage/                      # Test coverage
├── node_modules/                  # Dependencies
├── .env*                         # Environment files
├── *.log                         # Log files
├── .DS_Store                     # macOS files
└── .vscode/                      # VS Code settings
```

This structure provides a comprehensive blueprint for implementing the Bright Run LoRA Training Data Platform, ensuring scalability, maintainability, and adherence to privacy-first architecture principles.
