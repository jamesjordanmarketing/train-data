# Quick Start - Template Management System

## 🚀 5-Minute Setup

### 1. Apply Database Migration
```bash
supabase db push
```

### 2. Start Development Server
```bash
cd train-wireframe
npm run dev
```

### 3. Navigate to Templates
Open browser: `http://localhost:3000` → Click "Templates" in sidebar

---

## 📖 Quick API Reference

### Fetch All Templates
```typescript
GET /api/templates?sortBy=name&sortOrder=asc
```

### Create Template
```typescript
POST /api/templates
Content-Type: application/json

{
  "name": "My Template",
  "structure": "Hello {{name}}!",
  "tier": "template",
  "variables": [
    {
      "name": "name",
      "type": "text",
      "defaultValue": "User"
    }
  ]
}
```

### Update Template
```typescript
PATCH /api/templates/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": true
}
```

### Delete Template
```typescript
DELETE /api/templates/{id}
```

---

## 💻 Code Examples

### Using Template Service
```typescript
import { TemplateService } from '@/lib/template-service';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const supabase = createServerSupabaseClient();
const service = new TemplateService(supabase);

// Get templates
const templates = await service.getAllTemplates({
  isActive: true,
  sortBy: 'usageCount',
  sortOrder: 'desc'
});

// Create template
const template = await service.createTemplate({
  name: "Support Template",
  structure: "Helping with {{issue}}",
  tier: "template",
  variables: [{
    name: "issue",
    type: "text",
    defaultValue: "general inquiry"
  }],
  // ... other fields
});

// Increment usage
await service.incrementUsageCount(template.id);
```

### Using in React Components
```typescript
import { useState, useEffect } from 'react';
import { Template } from '@/lib/types';

function MyComponent() {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetch('/api/templates?isActive=true')
      .then(res => res.json())
      .then(data => setTemplates(data.templates));
  }, []);

  return (
    <div>
      {templates.map(t => (
        <div key={t.id}>{t.name}</div>
      ))}
    </div>
  );
}
```

---

## 🎯 Common Tasks

### Create a Template with Variables
1. Click "Create Template" button
2. Fill in name and description
3. Select tier (template/scenario/edge_case)
4. Enter template structure with `{{placeholders}}`
5. Add variables in Variable Editor
6. Click "Create Template"

### Edit a Template
1. Find template in table
2. Click ⋮ menu → "Edit Template"
3. Make changes
4. Click "Update Template"

### Filter Templates
Use the filter controls:
- **Tier**: template, scenario, edge_case
- **Status**: active, inactive
- Click column headers to sort

### Preview Template
1. Open template editor
2. Switch to "Template & Variables" tab
3. Add sample values to variables
4. Click "Preview" button

---

## 🔧 File Locations

| Component | Path |
|-----------|------|
| Service | `src/lib/template-service.ts` |
| API Routes | `src/app/api/templates/` |
| Main View | `train-wireframe/src/components/views/TemplatesView.tsx` |
| Table | `train-wireframe/src/components/templates/TemplateTable.tsx` |
| Editor | `train-wireframe/src/components/templates/TemplateEditorModal.tsx` |
| Variables | `train-wireframe/src/components/templates/TemplateVariableEditor.tsx` |
| Types | `train-wireframe/src/lib/types.ts` |
| Migration | `supabase/migrations/20241030_add_template_usage_function.sql` |

---

## 🐛 Quick Debugging

### Check if API is working
```bash
curl http://localhost:3000/api/templates
```

### Check database
```sql
SELECT id, template_name, tier, is_active 
FROM prompt_templates 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check logs
```bash
# Browser console (F12)
# Check Network tab for API calls
# Check Console tab for errors
```

---

## 📋 Template Variable Types

| Type | Use Case | Example |
|------|----------|---------|
| `text` | Free text input | Name, description, topic |
| `number` | Numeric values | Age, count, rating |
| `dropdown` | Predefined options | Level, category, status |

---

## 🎨 Template Syntax

### Placeholders
```
Hello {{name}}! You are at level {{level}}.
```

### With Variables
```typescript
variables: [
  { name: "name", type: "text", defaultValue: "User" },
  { name: "level", type: "number", defaultValue: "1" }
]
```

### Preview Result
```
Hello User! You are at level 1.
```

---

## ⚡ Performance Tips

1. **Use filtering**: Filter at API level, not client
2. **Server-side sorting**: Let database handle sorting
3. **Indexed columns**: Already optimized (name, usage_count, rating)
4. **Pagination**: Consider for 100+ templates
5. **Caching**: Consider React Query or SWR for caching

---

## ✅ Validation Rules

- Template name: Required, non-empty
- Structure: Required, non-empty
- Tier: Must be template/scenario/edge_case
- Variables: All must have unique names
- Quality threshold: 0-1 range
- Placeholders: Must match defined variables

---

## 🔐 Security Notes

- API routes use service role key (server-side only)
- RLS policies enforced on database
- Input validation at multiple levels
- Dependency checking prevents orphaned data
- Error messages don't leak sensitive info

---

## 📱 UI Components Used

From `train-wireframe/src/components/ui/`:
- Button, Input, Textarea, Label
- Dialog, Table, Badge, Alert
- Select, Checkbox, Tabs
- DropdownMenu

All from shadcn/ui library.

---

## 🆘 Common Issues

### "Template not found"
- Check if template exists in database
- Verify ID is correct UUID format

### "Cannot delete template"
- Template has dependencies
- Use archive instead (set `isActive: false`)

### "Undefined variables"
- Variable referenced in `{{placeholder}}` not defined
- Add variable in Variable Editor

### "Failed to fetch"
- Check API server is running
- Verify Supabase connection
- Check browser console for errors

---

## 📚 Further Reading

- Full documentation: `docs/template-management-system.md`
- Implementation summary: `TEMPLATE_MANAGEMENT_IMPLEMENTATION_SUMMARY.md`
- Database schema: Check E02 execution document
- Type definitions: `train-wireframe/src/lib/types.ts`

---

## 🎓 Best Practices

1. **Use descriptive names**: "Customer Support - Technical Issue"
2. **Add help text**: Explain what each variable does
3. **Set quality thresholds**: Match tier complexity
4. **Test with preview**: Verify placeholders resolve correctly
5. **Use inactive status**: Archive instead of delete
6. **Document requirements**: Use required_elements field

---

**Version**: 1.0.0  
**Last Updated**: October 30, 2024  
**Status**: ✅ Ready to Use

