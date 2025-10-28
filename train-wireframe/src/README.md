# Training Data Conversation Generation Platform

A comprehensive platform for generating, managing, and reviewing AI training conversations with a three-tier architecture (Templates → Scenarios → Edge Cases).

## Features

### Core UI Infrastructure (E03)
- ✅ **Dashboard Layout** with header, sidebar navigation, and main content area
- ✅ **Loading States** with skeletons, spinners, and progress indicators
- ✅ **Error Handling** with toast notifications and inline validation
- ✅ **Confirmation Dialogs** for destructive actions
- ✅ **Keyboard Navigation** support throughout the application

### Generation Features (E04)
- ✅ **Single Conversation Generation** with full parameter configuration
- ✅ **Batch Generation** with multiple input methods (CSV, manual, template-based)
- ✅ **Progress Monitoring** with real-time updates and cancellation
- ✅ **Success/Error States** with clear feedback and retry options

### Data Organization (E05)
- ✅ **Conversation Table** with sorting, pagination, and row selection
- ✅ **Advanced Filtering** by tier, status, quality score, and more
- ✅ **Full-Text Search** across conversation titles and categories
- ✅ **Bulk Actions** for managing multiple conversations
- ✅ **Coverage Analytics** with quality distribution charts
- ✅ **Export Functionality** in multiple formats (JSON, JSONL, CSV, Markdown)

### Review & Approval System (E06)
- ✅ **Review Queue** displaying conversations awaiting review
- ✅ **Quality Metrics** display with overall and dimensional scores
- ✅ **Approval Workflow** with approve/reject/revision actions (UI ready)

### Three-Tier Architecture (E07)
- ✅ **Template Library** for reusable conversation foundations
- ✅ **Scenario Manager** for contextual variations
- ✅ **Edge Case Collection** for unusual situations and boundary conditions
- ✅ **Tier Navigation** with clear parent-child relationships

## Tech Stack

- **Next.js 14**: React framework (App Router compatible structure)
- **TypeScript**: Type-safe development
- **Supabase**: Backend database and real-time features
- **Zustand**: Global state management
- **Tailwind CSS**: Utility-first styling
- **Shadcn/ui**: High-quality React components
- **Sonner**: Toast notifications
- **Lucide React**: Icon library

## Project Structure

```
/
├── components/
│   ├── dashboard/          # Main dashboard components
│   │   ├── ConversationTable.tsx
│   │   ├── DashboardView.tsx
│   │   ├── ExportModal.tsx
│   │   ├── FilterBar.tsx
│   │   └── Pagination.tsx
│   ├── generation/         # Conversation generation
│   │   ├── SingleGenerationForm.tsx
│   │   └── BatchGenerationModal.tsx
│   ├── layout/             # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── views/              # Page views
│   │   ├── AnalyticsView.tsx
│   │   ├── EdgeCasesView.tsx
│   │   ├── ReviewQueueView.tsx
│   │   ├── ScenariosView.tsx
│   │   ├── SettingsView.tsx
│   │   └── TemplatesView.tsx
│   └── ui/                 # Shadcn components
├── lib/
│   ├── mockData.ts         # Robust mock data generator
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # Utility functions
├── stores/
│   └── useAppStore.ts      # Zustand global state
├── utils/supabase/
│   ├── client.ts           # Supabase client
│   └── info.tsx            # Supabase configuration
└── App.tsx                 # Main application entry point
```

## Mock Data

The application includes comprehensive mock data to demonstrate all features:

- **50 Conversations** with realistic content across all tiers
- **5 Templates** covering different use cases
- **5 Scenarios** based on templates
- **6 Edge Cases** with test results
- **Quality Metrics** for each conversation
- **Review History** tracking all actions

## Key Features Demonstrated

### Dashboard
- Real-time stats cards showing total conversations, approval rate, quality scores
- Tier breakdown visualization
- Filterable and sortable conversation table
- Bulk selection and actions
- Empty states with clear call-to-action

### Filtering & Search
- Quick filter pills for common queries
- Advanced filter builder with multiple conditions
- Real-time search across titles and categories
- Active filter chips with easy removal
- Filter combinations with AND/OR logic

### Generation
- Three-tier selection (Template/Scenario/Edge Case)
- Full parameter configuration (topic, audience, complexity, length, style)
- Advanced options (temperature, tokens, custom prompts)
- Progress tracking with estimated time remaining
- Success/error handling with retry capability

### Batch Generation
- Multiple input methods (CSV upload, manual entry, template-based, clone)
- Batch name and configuration
- Preview of items to be generated
- Concurrent processing simulation

### Analytics
- Quality score distribution histogram
- Topic coverage visualization (placeholder)
- Coverage gap identification
- Priority-based recommendations

### Export
- Flexible scope selection (selected, filtered, all)
- Multiple format support (JSON, JSONL, CSV, Markdown)
- Customizable export options (metadata, quality scores, history)
- Export summary before download

## Usage

### Navigation
Use the sidebar to navigate between different sections:
- **Dashboard**: Main view with conversation table
- **Templates**: Reusable conversation foundations
- **Scenarios**: Contextual variations
- **Edge Cases**: Unusual situations and boundary conditions
- **Review Queue**: Conversations awaiting approval
- **Analytics**: Coverage and quality insights
- **Settings**: User preferences and configuration

### Generating Conversations
1. Click "New Conversation" in the header
2. Select tier (Template/Scenario/Edge Case)
3. Configure parameters (topic, audience, complexity, etc.)
4. Click "Generate Conversation"
5. View results and add to your collection

### Batch Generation
1. Click "Batch Generate" in the header
2. Enter batch name
3. Choose input method (manual entry recommended for demo)
4. Enter topics (one per line)
5. Click "Start Batch Generation"

### Filtering & Search
1. Use the search bar for full-text search
2. Click quick filter pills for common queries
3. Click "Filters" for advanced filtering
4. Active filters shown as removable chips
5. Clear all filters with one click

### Bulk Actions
1. Select conversations using checkboxes
2. Bulk actions toolbar appears
3. Choose action (add tags, move to review, export, delete)
4. Confirm action in dialog

### Export
1. Select conversations (optional)
2. Click "Export" button
3. Choose scope (selected, filtered, all)
4. Select format (JSON, JSONL, CSV, Markdown)
5. Configure options
6. Click "Download Export"

## State Management

The application uses Zustand for global state management with the following slices:

- **UI State**: Sidebar, modals, current view
- **Data State**: Conversations, templates, scenarios, edge cases
- **Filter State**: Active filters, search query, sorting
- **Selection State**: Selected conversation IDs
- **Preferences**: User settings and preferences

## Responsive Design

- Desktop-first layout optimized for data-heavy workflows
- Responsive grid layouts for stats cards
- Flexible table with horizontal scroll on smaller screens
- Collapsible sidebar for more content space
- Mobile-friendly modals and dialogs

## Accessibility

- Semantic HTML throughout
- Keyboard navigation support
- Focus indicators on all interactive elements
- ARIA labels for screen readers
- Color contrast compliance (WCAG AA)
- Toast notifications for status updates

## Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multi-user editing and presence
- **Advanced Analytics**: Machine learning-based insights
- **Template Editor**: Visual template builder
- **Scenario Wizard**: Guided scenario creation
- **Edge Case Auto-Generator**: AI-powered edge case generation
- **Version Control**: Track changes and rollback
- **Export Scheduling**: Automated recurring exports
- **API Integration**: RESTful API for external systems
- **Custom Dashboards**: User-configurable analytics views

### Backend Integration
Currently using mock data. For production:
1. Connect to Supabase database
2. Implement real-time subscriptions
3. Add authentication and authorization
4. Integrate AI generation API
5. Set up batch processing queue
6. Configure storage for exports

## Development Notes

### Mock Data Generation
The `lib/mockData.ts` file contains robust mock data generation:
- Realistic conversation turns with varied content
- Quality metrics with dimensional scores
- Review history with multiple actions
- Parent-child relationships for tier hierarchy
- Randomized but realistic dates and values

### Component Organization
- **Layout components**: Reusable across all views
- **View components**: Page-level components for each section
- **Feature components**: Specific functionality (generation, filters, etc.)
- **UI components**: Shadcn components in `/components/ui`

### Type Safety
All data structures are strongly typed in `lib/types.ts`:
- Conversation, Template, Scenario, EdgeCase types
- Filter configuration types
- Quality metrics types
- Export configuration types

## Support

For questions, issues, or feature requests, please refer to the project documentation or contact the development team.

## License

This is a demonstration/prototype application for the Training Data Generation Platform project.
