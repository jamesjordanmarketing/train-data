# Document Categorization Workflow System

A comprehensive guided three-step categorization workflow that transforms technical document categorization into an accessible business process. This unified system includes Statement of Belonging assessment, 11 business-friendly primary category selection, and multi-dimensional secondary tagging.

## 🚀 Features

### Core Workflow
- **Step A: Statement of Belonging Assessment** - Evaluate document relationship to your expertise
- **Step B: Primary Category Selection** - Choose from 11 business-friendly categories
- **Step C: Secondary Tags & Metadata** - Apply tags across 7 metadata dimensions

### Key Capabilities
- ✅ **Guided 3-Step Process** with progress tracking and validation
- ✅ **Document Reference Panel** with persistent content context
- ✅ **Intelligent Tag Suggestions** based on category selection
- ✅ **Custom Tag Creation** for business-specific terminology
- ✅ **Draft Save & Resume** functionality with auto-save
- ✅ **Comprehensive Validation** with clear error messaging
- ✅ **Processing Impact Preview** showing AI training optimization
- ✅ **Workflow Analytics** and completion tracking

### Business-Focused Design
- **11 Primary Categories** designed for business value identification
- **7 Tag Dimensions** covering authorship, format, risk, evidence, use, audience, and gating
- **Risk Level Assessment** with 1-5 scale and visual indicators
- **Training Value Optimization** for AI systems and knowledge management

## 🛠 Technology Stack

- **Next.js 14** - Primary React framework with App Router
- **TypeScript** - Primary development language
- **Supabase** - Database and backend service with real-time capabilities
- **Zustand** - Global state management with persistence
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

## 📁 Project Structure

```
/
├── components/
│   ├── auth/
│   │   └── AuthStub.tsx              # Authentication stub for future integration
│   ├── ui/                           # Shadcn/UI components
│   ├── workflow/
│   │   ├── DocumentReferencePanel.tsx
│   │   ├── WorkflowProgress.tsx
│   │   ├── WorkflowLayout.tsx
│   │   └── steps/
│   │       ├── StepA.tsx            # Statement of Belonging assessment
│   │       ├── StepB.tsx            # Primary category selection
│   │       ├── StepC.tsx            # Secondary tags application
│   │       └── WorkflowComplete.tsx # Completion summary
│   └── DocumentSelector.tsx         # Document selection interface
├── data/
│   ├── mock-data.ts                 # Comprehensive mock data
│   └── supabase-mock.ts            # Database schema and mock data
├── lib/
│   ├── supabase.ts                 # Supabase client configuration
│   └── database.ts                 # Database service layer
├── stores/
│   └── workflow-store.ts           # Zustand state management
└── App.tsx                         # Main application component
```

## 🗄 Database Schema

### Core Tables
- **documents** - Document storage with metadata
- **workflow_sessions** - User workflow progress tracking
- **categories** - Primary category definitions
- **tag_dimensions** - Tag category structure
- **tags** - Individual tag definitions
- **user_profiles** - User and organization data
- **processing_jobs** - AI processing queue and status

### Key Features
- **Row Level Security (RLS)** for multi-tenant data isolation
- **JSONB columns** for flexible metadata storage
- **Audit trails** with created_at/updated_at timestamps
- **Full-text search** capabilities for documents
- **Workflow state persistence** across browser sessions

## 🎯 Business Categories

### High-Value Categories (Premium Training Data)
1. **Complete Systems & Methodologies** - End-to-end business frameworks
2. **Proprietary Strategies & Approaches** - Unique competitive advantages
3. **Customer Insights & Case Studies** - Real-world success stories
4. **Market Research & Competitive Intelligence** - Strategic market insights

### Standard Categories
5. **Process Documentation & Workflows** - Operational procedures
6. **Knowledge Base & Reference Materials** - Informational content
7. **Sales Enablement & Customer-Facing Content** - Sales support materials
8. **Training Materials & Educational Content** - Learning resources
9. **Communication Templates & Messaging** - Template-based content
10. **Project Artifacts & Deliverables** - Project-specific documentation
11. **External Reference & Third-Party Content** - External materials

## 🏷 Tag Dimensions

### 1. Authorship (Required, Single-Select)
- Brand/Company, Team Member, Customer, Mixed/Collaborative, Third-Party

### 2. Content Format (Optional, Multi-Select)
- How-to Guide, Strategy Note, Case Study, Story/Narrative, Sales Page, Email, Transcript, Presentation Slide, Whitepaper, Brief/Summary

### 3. Disclosure Risk (Required, Single-Select)
- Level 1-5 with detailed risk descriptions and visual indicators

### 4. Evidence Type (Optional, Multi-Select)
- Metrics/KPIs, Quotes/Testimonials, Before/After Results, Screenshots/Visuals, Data Tables, External References

### 5. Intended Use (Required, Multi-Select)
- Marketing, Sales Enablement, Delivery/Operations, Training, Investor Relations, Legal/Compliance

### 6. Audience Level (Optional, Multi-Select)
- Public, Lead, Customer, Internal, Executive

### 7. Gating Level (Optional, Single-Select)
- Public, Ungated Email, Soft Gated, Hard Gated, Internal Only, NDA Only

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account (for database integration)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Supabase environment variables
4. Run the development server: `npm run dev`

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Mock Data

The system includes comprehensive mock data for demonstration:

### Sample Documents
- **Customer Onboarding System Blueprint** - Complete methodology with 7-step framework
- **Sales Enablement Battle Cards** - Competitive analysis with objection handling
- **Industry Trends Report** - Third-party market research content

### Realistic Scenarios
- Multiple document types and authorship sources
- Varied content complexity and business value
- Representative metadata and tag combinations
- Workflow states at different completion levels

## 🔮 Future Integrations

### Authentication & User Management
- **NextAdmin** integration for dashboard templates
- **OAuth providers** (Google, GitHub, Microsoft)
- **Role-based access control** (Admin, User, Viewer)
- **Organization multi-tenancy** support

### AI & Processing
- **LLM Integration** with Qwen 32 and OpenAI API
- **Runpod** private hosting for sensitive content
- **Content extraction** and analysis pipelines
- **Training data optimization** algorithms

### Advanced Features
- **Bulk document processing** workflows
- **Analytics dashboard** with categorization insights
- **Export capabilities** for training data sets
- **API endpoints** for system integrations

## 🔒 Security & Privacy

- **Data encryption** at rest and in transit
- **Row-level security** for multi-tenant isolation
- **Audit logging** for compliance requirements
- **Risk assessment** built into categorization workflow
- **Access controls** based on content sensitivity

## 📈 Analytics & Reporting

### Workflow Metrics
- Categorization completion rates
- Average processing time per document
- Category distribution analysis
- Tag usage patterns and effectiveness

### Business Intelligence
- Training data value assessment
- Content ROI analysis
- Risk distribution reporting
- User productivity metrics

## 🤝 Contributing

This system is designed for enterprise use with extensible architecture:

1. **Component-based design** for easy customization
2. **TypeScript interfaces** for type safety
3. **Database abstraction layer** for flexible backends
4. **Mock data patterns** for testing and development
5. **Comprehensive documentation** for maintainability

## 📄 License

Enterprise software - contact for licensing information.

---

**Note**: This is a Minimum Viable Product (MVP) focused on visual demonstration with robust mock data. The formal backend integration and production deployment will be implemented in subsequent development phases.