# Generation Components

This directory contains the Foundation Components for the Train-Data Conversation Generation UI.

## Components

### TemplateSelector

**File:** `TemplateSelector.tsx`

A reusable component for displaying and selecting conversation templates.

**Features:**
- Grid layout (3 columns on desktop, responsive on mobile)
- Visual selection indicator with checkmark
- Template cards showing:
  - Template name
  - Description
  - Tier badge (template, scenario, edge_case)
  - Rating with star icon
  - Usage count
  - Success rate
  - Active status badge
- Loading skeleton state
- Empty state handling
- Hover effects

**Props:**
```typescript
interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId: string | null;
  onSelectTemplate: (template: Template) => void;
  loading?: boolean;
}
```

**Usage:**
```tsx
import { TemplateSelector } from '@/components/generation/TemplateSelector';
import { useTemplates } from '@/hooks/use-templates';

function MyComponent() {
  const { templates, loading } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <TemplateSelector
      templates={templates}
      selectedTemplateId={selectedTemplate?.id ?? null}
      onSelectTemplate={setSelectedTemplate}
      loading={loading}
    />
  );
}
```

### ParameterForm

**File:** `ParameterForm.tsx`

A comprehensive form component for capturing conversation generation parameters with validation.

**Features:**
- Three required fields: Persona, Emotion, Topic
- Real-time validation with inline error messages
- Character count indicators with color-coded warnings
- Suggestion badges for quick selection
- Advanced options section (collapsible):
  - Temperature slider (0-1)
  - Max tokens input (100-8192)
- Form disabled state during generation
- Submit button with loading state

**Props:**
```typescript
interface ParameterFormProps {
  onSubmit: (params: GenerationParameters) => void;
  disabled?: boolean;
  defaultValues?: Partial<GenerationParameters>;
}
```

**Usage:**
```tsx
import { ParameterForm } from '@/components/generation/ParameterForm';

function MyComponent() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (params) => {
    setIsGenerating(true);
    try {
      await generateConversation(params);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ParameterForm
      onSubmit={handleSubmit}
      disabled={isGenerating}
    />
  );
}
```

## Supporting Files

### Types

**File:** `src/types/templates.ts`

Defines the `Template` interface matching the database schema with snake_case properties.

### Hook

**File:** `src/hooks/use-templates.ts`

Custom hook for fetching templates from the API with loading and error states.

**Usage:**
```tsx
const { templates, loading, error } = useTemplates();
```

### Validation Schema

**File:** `src/lib/schemas/generation.ts`

Zod schema for validating generation parameters:
- `persona`: 3-100 characters
- `emotion`: 3-50 characters
- `topic`: 3-200 characters
- `temperature`: 0-1 (optional)
- `maxTokens`: 100-8192 (optional)

### Test Page

**File:** `src/app/test/generation/page.tsx`

A complete test page demonstrating both components working together.

**Access:** Navigate to `/test/generation` in your browser.

## Implementation Status

✅ **COMPLETED:**
- Type definitions created
- Validation schema implemented
- useTemplates hook created
- TemplateSelector component built
- ParameterForm component built
- Test page created
- TypeScript compilation verified
- All linter checks passed
- Package dependencies installed (@hookform/resolvers)

## Dependencies

- `react-hook-form`: Form state management
- `@hookform/resolvers/zod`: Zod integration for validation
- `zod`: Schema validation
- `lucide-react`: Icons
- `@radix-ui/*`: UI components (Card, Badge, Button, etc.)

## Next Steps

To integrate these components into the main generation workflow:

1. Create the main generation page at `src/app/generate/page.tsx`
2. Import both TemplateSelector and ParameterForm
3. Add state management for:
   - Selected template
   - Form parameters
   - Generation status
4. Implement the API call to `/api/conversations/generate`
5. Add conversation preview/display after generation
6. Add error handling and success messages

## Design Patterns

- **Composition**: Both components are standalone and reusable
- **Controlled Components**: All form state is managed through props
- **Type Safety**: Full TypeScript support with proper type inference
- **Validation**: Client-side validation with Zod
- **Accessibility**: Proper labels, ARIA attributes, keyboard navigation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Skeleton screens and disabled states
- **Error Handling**: Clear, user-friendly error messages

