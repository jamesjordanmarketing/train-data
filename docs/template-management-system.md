# Template Management System - User Guide

## Overview

The Template Management System provides a complete CRUD (Create, Read, Update, Delete) interface for managing prompt templates used in conversation generation. This system supports versioning, usage tracking, quality thresholds, and flexible variable management.

## Features Implemented

### ✅ Core CRUD Operations
- **Create**: Add new templates with variables, tier classification, and metadata
- **Read**: List and view templates with filtering and sorting
- **Update**: Edit existing templates while preserving usage history
- **Delete**: Remove templates with dependency checking and archive suggestions

### ✅ Template Components
- **Template Structure**: Support for `{{placeholder}}` syntax
- **Variables**: Typed variables (text, number, dropdown) with default values and help text
- **Tier Classification**: Template, Scenario, Edge Case
- **Quality Thresholds**: Minimum quality scores for generated content
- **Status Management**: Active/Inactive status control

### ✅ User Interface
- **Template Table**: Sortable table with filtering by tier and status
- **Template Editor**: Full-featured modal editor with tabbed interface
- **Live Preview**: Real-time template preview with variable substitution
- **Variable Editor**: Intuitive interface for managing template variables
- **Validation**: Client-side validation with helpful error messages

### ✅ Data Management
- **Database Service**: Type-safe service layer for all operations
- **API Routes**: RESTful endpoints following Next.js conventions
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Dependency Checking**: Prevents deletion of templates in use

## Architecture

### File Structure

```
src/
├── lib/
│   └── template-service.ts              # Database operations
├── app/
│   └── api/
│       └── templates/
│           ├── route.ts                 # GET all, POST create
│           └── [id]/route.ts            # GET, PATCH, DELETE by ID
train-wireframe/
├── src/
│   ├── lib/
│   │   └── types.ts                     # Type definitions
│   └── components/
│       ├── views/
│       │   └── TemplatesView.tsx        # Main template management view
│       └── templates/
│           ├── TemplateTable.tsx        # Template list table
│           ├── TemplateEditorModal.tsx  # Template editor dialog
│           └── TemplateVariableEditor.tsx # Variable configuration
supabase/
└── migrations/
    └── 20241030_add_template_usage_function.sql
```

### Database Schema

The system uses the `prompt_templates` table with the following key fields:

```sql
prompt_templates (
  id UUID PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_text TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('template', 'scenario', 'edge_case')),
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  quality_threshold DECIMAL(3, 2) DEFAULT 0.70,
  rating DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### API Endpoints

#### GET /api/templates
Fetch all templates with filtering and sorting.

**Query Parameters:**
- `tier`: Filter by tier (template|scenario|edge_case)
- `isActive`: Filter by status (true|false)
- `sortBy`: Sort column (name|usageCount|rating|lastModified)
- `sortOrder`: Sort direction (asc|desc)

**Response:**
```json
{
  "templates": [...],
  "total": 42
}
```

#### POST /api/templates
Create a new template.

**Request Body:**
```json
{
  "name": "Technical Support Template",
  "description": "Template for technical support conversations",
  "structure": "You are helping with {{topic}}. The user's level is {{level}}.",
  "tier": "template",
  "variables": [
    {
      "name": "topic",
      "type": "text",
      "defaultValue": "software issue",
      "helpText": "The main topic of support"
    },
    {
      "name": "level",
      "type": "dropdown",
      "defaultValue": "intermediate",
      "options": ["beginner", "intermediate", "advanced"]
    }
  ],
  "qualityThreshold": 0.7,
  "isActive": true
}
```

**Response:** `201 Created`
```json
{
  "template": { ... }
}
```

#### GET /api/templates/[id]
Fetch a specific template by ID.

**Response:**
```json
{
  "template": { ... }
}
```

#### PATCH /api/templates/[id]
Update an existing template.

**Request Body:** (partial updates supported)
```json
{
  "name": "Updated Template Name",
  "isActive": false
}
```

**Response:**
```json
{
  "template": { ... }
}
```

#### DELETE /api/templates/[id]
Delete a template.

**Response (Success):**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

**Response (Conflict - has dependencies):** `409 Conflict`
```json
{
  "error": "Cannot delete template: 5 conversation(s) depend on it...",
  "canArchive": true,
  "suggestion": "Archive this template instead of deleting it"
}
```

## Usage Guide

### Creating a New Template

1. Click the **"Create Template"** button in the Templates view
2. Fill in the **Basic Info** tab:
   - Template name (required)
   - Tier selection (Template/Scenario/Edge Case)
   - Description
   - Quality threshold
   - Active status checkbox
3. Switch to the **Template & Variables** tab:
   - Enter your template structure using `{{placeholder}}` syntax
   - Add variables using the Variable Editor
   - Preview your template with sample values
4. Optionally configure **Advanced** settings:
   - Style notes
   - Example conversation
   - Required elements
5. Click **"Create Template"** to save

### Editing a Template

1. Find the template in the table
2. Click the **⋮** menu and select **"Edit Template"**
3. Make your changes in the editor
4. Click **"Update Template"** to save

### Deleting a Template

1. Find the template in the table
2. Click the **⋮** menu and select **"Delete"**
3. Confirm the deletion
4. If the template has dependencies, you'll be prompted to archive instead

### Working with Variables

Variables allow you to create flexible, reusable templates. Each variable has:

- **Name**: Used in `{{placeholder}}` syntax
- **Type**: text, number, or dropdown
- **Default Value**: Used in previews and suggestions
- **Help Text**: Description for template users
- **Options**: For dropdown type only

**Example:**
```
Variable: topic
Type: text
Default: "technical issue"
Help: "The main topic of the conversation"

Usage in template: "Let's discuss {{topic}}"
```

### Filtering and Sorting

Use the filter bar to narrow down templates:
- **Tier Filter**: Show only templates of a specific tier
- **Status Filter**: Show active or inactive templates
- **Column Sorting**: Click column headers to sort

## Type Definitions

### Template
```typescript
export type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: string; // Template text with {{placeholders}}
  variables: TemplateVariable[];
  tone: string;
  complexityBaseline: number;
  styleNotes?: string;
  exampleConversation?: string;
  qualityThreshold: number;
  requiredElements: string[];
  usageCount: number;
  rating: number;
  lastModified: string;
  createdBy: string;
  // Additional database fields
  tier?: TierType;
  isActive?: boolean;
  version?: number;
  applicablePersonas?: string[];
  applicableEmotions?: string[];
};
```

### TemplateVariable
```typescript
export type TemplateVariable = {
  name: string;
  type: 'text' | 'number' | 'dropdown';
  defaultValue: string;
  helpText?: string;
  options?: string[]; // For dropdown type
};
```

## Service Layer API

### TemplateService

```typescript
const service = new TemplateService(supabaseClient);

// Fetch all templates
const templates = await service.getAllTemplates({
  tier: 'template',
  isActive: true,
  sortBy: 'name',
  sortOrder: 'asc'
});

// Get single template
const template = await service.getTemplateById(id);

// Create template
const newTemplate = await service.createTemplate({
  name: 'New Template',
  structure: '...',
  // ... other fields
});

// Update template
const updated = await service.updateTemplate(id, {
  name: 'Updated Name'
});

// Delete template
await service.deleteTemplate(id);

// Increment usage count
await service.incrementUsageCount(id);

// Archive/activate template
await service.archiveTemplate(id);
await service.activateTemplate(id);
```

## Validation Rules

The system enforces the following validation rules:

1. **Required Fields**:
   - Template name must not be empty
   - Template structure must not be empty
   - Tier must be one of: template, scenario, edge_case

2. **Variables**:
   - All variables must have a name
   - Variable names must be unique
   - Variables referenced in `{{placeholders}}` must be defined

3. **Quality Threshold**:
   - Must be a number between 0 and 1

4. **Deletion**:
   - Cannot delete templates with active dependencies
   - Suggests archiving instead

## Error Handling

The system provides detailed error messages for common issues:

- **Missing required fields**: "Missing required fields: name and structure are required"
- **Invalid tier**: "Invalid tier. Must be one of: template, scenario, edge_case"
- **Undefined variables**: "Undefined variables in template: topic, level"
- **Duplicate variables**: "Duplicate variable names: topic"
- **Dependencies exist**: "Cannot delete template: 5 conversation(s) depend on it..."

## Performance Considerations

- Templates are fetched on demand with filtering and sorting applied server-side
- Table displays efficiently with proper indexing on common sort columns
- Variable editor updates preview without lag using React state management
- API responses include proper pagination headers for large datasets

## Future Enhancements

Potential improvements for future versions:

- [ ] Version history with diff viewing
- [ ] Template duplication/cloning
- [ ] Bulk operations (activate/deactivate multiple)
- [ ] Template testing/preview with real AI
- [ ] Export/import templates
- [ ] Template categories and tagging
- [ ] Usage analytics and insights
- [ ] Template suggestions based on usage patterns

## Troubleshooting

### Templates not loading
1. Check browser console for errors
2. Verify Supabase connection
3. Check database permissions (RLS policies)
4. Ensure `prompt_templates` table exists

### Cannot save template
1. Verify all required fields are filled
2. Check for validation errors in the form
3. Ensure variable definitions match placeholders
4. Check browser console for API errors

### Deletion not working
1. Check if template has dependencies (conversations)
2. Use archive instead if dependencies exist
3. Verify database permissions

## Support

For issues or questions:
- Check the browser console for detailed error messages
- Review the database logs for server-side errors
- Ensure all migrations have been applied
- Verify environment variables are configured correctly

## Database Migration

To set up the database function for usage tracking:

```bash
# Apply the migration
psql -h your-host -U your-user -d your-db -f supabase/migrations/20241030_add_template_usage_function.sql
```

Or using Supabase CLI:
```bash
supabase db push
```

## Testing

### Manual Testing Checklist

- [x] Create template with variables
- [x] Edit template and verify changes saved
- [x] Test preview with different variable values
- [x] Delete template and verify dependency check
- [x] Sort templates by different columns
- [x] Filter templates by tier and status
- [x] Toggle active/inactive status
- [x] Verify validation messages display correctly

### API Testing

Use the provided API endpoints with tools like Postman or curl:

```bash
# List templates
curl http://localhost:3000/api/templates

# Create template
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Template","structure":"{{greeting}}","tier":"template","variables":[]}'

# Update template
curl -X PATCH http://localhost:3000/api/templates/{id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Template"}'

# Delete template
curl -X DELETE http://localhost:3000/api/templates/{id}
```

---

**Version**: 1.0.0  
**Last Updated**: October 30, 2024  
**Status**: ✅ Implemented and Tested

