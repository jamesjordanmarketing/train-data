# Quick Start Guide: Import/Export & Variable Substitution

Get started with the new import/export and variable substitution features in 5 minutes.

## 🚀 Quick Start

### 1. Export Data

```typescript
// Add export button to your component
import { ExportModal } from '@/components/import-export';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function TemplatesPage() {
  const [showExport, setShowExport] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setShowExport(true)}>
        <Download className="h-4 w-4 mr-2" />
        Export Templates
      </Button>
      
      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        entityType="templates"
      />
    </div>
  );
}
```

### 2. Import Data

```typescript
// Add import button to your component
import { ImportModal } from '@/components/import-export';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export function TemplatesPage() {
  const [showImport, setShowImport] = useState(false);
  const { refetch } = useTemplates(); // Your data fetching hook
  
  return (
    <div>
      <Button onClick={() => setShowImport(true)}>
        <Upload className="h-4 w-4 mr-2" />
        Import Templates
      </Button>
      
      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={() => refetch()}
        entityType="templates"
      />
    </div>
  );
}
```

### 3. Add Template Preview

```typescript
// Add preview panel to your template form
import { TemplatePreviewPanel } from '@/components/templates/TemplatePreviewPanel';

export function TemplateForm() {
  const [structure, setStructure] = useState('Hello {{name}}!');
  const [sampleVariables, setSampleVariables] = useState({ name: 'User' });
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left: Form */}
      <div>
        <Label>Template Structure</Label>
        <Textarea
          value={structure}
          onChange={(e) => setStructure(e.target.value)}
          placeholder="Enter template with {{variables}}"
        />
      </div>
      
      {/* Right: Preview */}
      <TemplatePreviewPanel
        template={structure}
        variables={sampleVariables}
      />
    </div>
  );
}
```

### 4. Use Template Engine Programmatically

```typescript
import { TemplateSubstitution } from '@/lib/template-engine';

// Simple usage
const substitution = new TemplateSubstitution({
  userName: 'Alice',
  userAge: 30,
});

const result = substitution.substitute(
  'Hello {{userName}}, you are {{userAge}} years old!'
);
// Result: "Hello Alice, you are 30 years old!"

// With validation
const validation = substitution.validate(template);
if (!validation.valid) {
  console.error('Missing variables:', validation.missing);
}
```

## 📋 Variable Syntax Cheat Sheet

```typescript
// Simple variable
"Hello {{name}}"

// Nested variable
"Email: {{user.email}}"
"API: {{config.api.endpoint.url}}"

// Optional (empty string if missing)
"Hello{{nickname?}}"

// With default value
"Hello {{name:Guest}}"
"Count: {{items:0}}"

// Conditional
"{{#if premium}}VIP{{/if}}"
```

## 🔄 Export/Import Workflow

### Export Flow

1. User clicks "Export" button
2. Modal opens with format options (JSON/JSONL/CSV)
3. User selects format and items (all or selected)
4. Click "Export"
5. File downloads automatically

### Import Flow

1. User clicks "Import" button
2. Modal opens with file upload
3. User selects file (JSON or JSONL)
4. Click "Validate" to preview
5. Review validation results
6. Click "Import" to proceed
7. Success message and modal closes

## 🎯 Common Use Cases

### Use Case 1: Backup All Templates

```typescript
// Trigger export
<Button onClick={() => {
  const link = document.createElement('a');
  link.href = '/api/export/templates?format=json';
  link.click();
}}>
  Backup Templates
</Button>
```

### Use Case 2: Migrate Between Environments

1. Export from source environment (JSON format)
2. Download the file
3. Import to target environment
4. Enable "Overwrite existing" if updating

### Use Case 3: Share Templates with Team

1. Export specific templates (provide IDs)
2. Share JSON file
3. Team members import
4. Disable "Overwrite existing" to avoid conflicts

### Use Case 4: Template Preview in Real-time

```typescript
// In your form component
const [template, setTemplate] = useState('');
const [variables, setVariables] = useState({});

// Preview updates automatically as user types
<TemplatePreviewPanel
  template={template}
  variables={variables}
/>
```

### Use Case 5: Generate Conversations with Variable Substitution

```typescript
async function generateConversation(templateId: string, variables: any) {
  // Fetch template
  const template = await getTemplate(templateId);
  
  // Substitute variables
  const substitution = new TemplateSubstitution(variables);
  const resolved = substitution.substitute(template.structure);
  
  // Use resolved template for generation
  return generateWithLLM(resolved);
}
```

## 🐛 Troubleshooting

### Issue: Export returns empty file

**Solution:**
- Check authentication is valid
- Verify items exist in database
- Check browser console for errors

### Issue: Import validation fails

**Solution:**
- Verify JSON format is valid
- Check all required fields are present
- Ensure variable names match placeholders
- Review validation error messages

### Issue: Template preview shows placeholders

**Solution:**
- Check variable names match exactly
- Verify variables object has correct structure
- Use browser DevTools to inspect variables
- Check for typos in variable names

### Issue: CSV export has garbled characters

**Solution:**
- Ensure UTF-8 encoding
- Try opening with different spreadsheet software
- For Excel, import as UTF-8 CSV

## 💡 Pro Tips

### Tip 1: Use JSONL for Large Datasets

```
JSONL is more efficient for large datasets:
- One object per line
- Can be streamed
- Lower memory usage
```

### Tip 2: Always Validate Before Importing

```
Use validateOnly flag to preview:
- See what will be imported
- Check for errors
- Review duplicate warnings
```

### Tip 3: Use Optional Variables for Flexibility

```typescript
// Template works with or without nickname
"Hello {{name}}{{nickname?}}!"

// With nickname: "Hello Alice Smith!"
// Without: "Hello Alice!"
```

### Tip 4: Combine Default Values with Optional

```typescript
// Greeting has default, nickname is optional
"{{greeting:Hi}} {{name}}{{nickname?}}!"

// Flexible template that always works
```

### Tip 5: Test Templates with Preview

```
Always preview templates before saving:
1. Enter template structure
2. Provide sample variables
3. Check preview looks correct
4. Save template
```

## 📚 Next Steps

1. **Read the full guide**: `docs/IMPORT_EXPORT_GUIDE.md`
2. **Review technical docs**: `docs/TECHNICAL_IMPLEMENTATION.md`
3. **Check examples**: `__tests__/lib/template-engine/substitution.test.ts`
4. **Integrate into your app**: Follow integration checklist in summary

## 🔗 Related Documentation

- [Import/Export Guide](./IMPORT_EXPORT_GUIDE.md) - Comprehensive user guide
- [Technical Implementation](./TECHNICAL_IMPLEMENTATION.md) - Architecture and algorithms
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md) - Complete feature overview

## 💬 Need Help?

- Check validation error messages (they're descriptive)
- Review browser console for client-side errors
- Check server logs for API errors
- Refer to troubleshooting section in main guide

---

**Happy importing/exporting! 🎉**

