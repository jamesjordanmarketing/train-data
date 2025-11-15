# Template Selection Service - Quick Start Guide

## Overview

The Template Selection Service implements an "emotional arc as primary selector" strategy for choosing conversation templates. This guide shows you how to use the service in your application.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [API Endpoints](#api-endpoints)
3. [UI Integration](#ui-integration)
4. [Template Resolution](#template-resolution)
5. [Testing](#testing)

## Basic Usage

### Service-Level Usage

```typescript
import { createClient } from '@/lib/supabase/server';
import { TemplateSelectionService } from '@/lib/services/template-selection-service';

// Initialize service
const supabase = createClient();
const templateService = new TemplateSelectionService(supabase);

// Select templates by emotional arc (required)
const templates = await templateService.selectTemplates({
  emotional_arc_type: 'confusion_to_clarity',  // REQUIRED
  tier: 'template',                             // Optional
  persona_type: 'young_professional',           // Optional
  topic_key: 'retirement_basics'                // Optional
});

console.log(`Found ${templates.length} matching templates`);
// Returns: Array of templates sorted by quality_threshold

// Get single best template
const templateId = await templateService.selectTemplate({
  emotional_arc_type: 'confusion_to_clarity',
  tier: 'template'
});

// Validate compatibility
const validation = await templateService.validateCompatibility(
  templateId,
  'young_professional',
  'retirement_basics'
);

if (!validation.compatible) {
  console.warn('Compatibility warnings:', validation.warnings);
}
```

## API Endpoints

### GET /api/templates/select

Select templates using arc-first strategy.

**Query Parameters**:
- `emotional_arc_type` (required): The emotional arc type (e.g., "confusion_to_clarity")
- `tier` (optional): "template" | "scenario" | "edge_case"
- `persona_type` (optional): Persona type for filtering
- `topic_key` (optional): Topic key for filtering

**Example Request**:
```bash
curl "http://localhost:3000/api/templates/select?emotional_arc_type=confusion_to_clarity&tier=template&persona_type=young_professional"
```

**Example Response**:
```json
{
  "success": true,
  "templates": [
    {
      "id": "template-uuid-1",
      "template_name": "Confusion to Clarity - Financial Planning",
      "description": "Guide confused clients to clarity",
      "quality_threshold": 8.5,
      "rating": 4.7,
      "emotional_arc_type": "confusion_to_clarity",
      "tier": "template"
    }
  ],
  "count": 1,
  "criteria": {
    "emotional_arc_type": "confusion_to_clarity",
    "tier": "template",
    "persona_type": "young_professional"
  }
}
```

### POST /api/templates/select

Validate template compatibility.

**Request Body**:
```json
{
  "templateId": "template-uuid",
  "personaKey": "young_professional",
  "topicKey": "retirement_basics"
}
```

**Example Response**:
```json
{
  "success": true,
  "compatible": true,
  "warnings": []
}
```

## UI Integration

### Using the Scaffolding Selector Component

The `ScaffoldingSelector` component automatically implements arc-first selection:

```tsx
import { ScaffoldingSelector, ScaffoldingSelection } from '@/components/conversations/scaffolding-selector';

function MyComponent() {
  const [selection, setSelection] = useState<ScaffoldingSelection>({
    persona_id: null,
    emotional_arc_id: null,
    training_topic_id: null,
    tier: 'template',
    template_id: null  // Optional - leave null for auto-select
  });

  return (
    <ScaffoldingSelector
      value={selection}
      onChange={setSelection}
      disabled={false}
    />
  );
}
```

**User Flow**:
1. User selects **Emotional Arc** → Templates load automatically
2. User selects **Persona** (optional) → Templates filter
3. User selects **Topic** (optional) → Templates filter further
4. User selects **Tier** → Templates filter by tier
5. User optionally selects **Template** or leaves blank for auto-select

### Generate Conversation

Once the scaffolding is selected, generate a conversation:

```typescript
const response = await fetch('/api/conversations/generate-with-scaffolding', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    persona_id: selection.persona_id,
    emotional_arc_id: selection.emotional_arc_id,
    training_topic_id: selection.training_topic_id,
    tier: selection.tier,
    template_id: selection.template_id  // Optional
  })
});

const result = await response.json();
console.log('Generated conversation:', result.conversation_id);
```

## Template Resolution

### Resolve Scaffolding Variables

The `TemplateResolver` service resolves all scaffolding placeholders:

```typescript
import { TemplateResolver } from '@/lib/services/template-resolver';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';

const resolver = new TemplateResolver();
const scaffoldingService = new ScaffoldingDataService(supabase);

// Load scaffolding data
const persona = await scaffoldingService.getPersonaById(personaId);
const arc = await scaffoldingService.getEmotionalArcById(arcId);
const topic = await scaffoldingService.getTrainingTopicById(topicId);

// Template with placeholders
const templateText = `
You are roleplaying as {{persona_name}}, a {{persona_archetype}}.

Starting emotion: {{starting_emotion}} (intensity: {{starting_intensity_min}}-{{starting_intensity_max}})
Ending emotion: {{ending_emotion}} (intensity: {{ending_intensity_min}}-{{ending_intensity_max}})

Topic: {{topic_name}}
Complexity: {{topic_complexity}}
Target turns: {{target_turn_count}}

Typical questions:
{{persona_typical_questions}}

Response techniques:
{{response_techniques}}
`;

// Resolve all placeholders
const resolved = await resolver.resolveScaffoldingTemplate(templateText, {
  persona,
  emotional_arc: arc,
  training_topic: topic
});

console.log('Resolved template:', resolved);
// All {{placeholders}} are replaced with actual values
```

### Supported Variables

#### Persona Variables
- `{{persona_name}}` - Full persona name
- `{{persona_type}}` - Persona type identifier
- `{{persona_archetype}}` - Archetype summary
- `{{persona_demographics}}` - Formatted demographics
- `{{persona_financial_background}}` - Financial background text
- `{{persona_communication_style}}` - Communication style
- `{{persona_emotional_baseline}}` - Emotional baseline
- `{{persona_typical_questions}}` - Formatted bullet list
- `{{persona_common_concerns}}` - Formatted bullet list
- `{{persona_language_patterns}}` - Formatted bullet list

#### Emotional Arc Variables
- `{{emotional_arc_name}}` - Arc display name
- `{{arc_type}}` - Arc type identifier
- `{{starting_emotion}}` - Starting emotion name
- `{{starting_intensity_min}}` - Min starting intensity (0-1)
- `{{starting_intensity_max}}` - Max starting intensity (0-1)
- `{{ending_emotion}}` - Ending emotion name
- `{{ending_intensity_min}}` - Min ending intensity (0-1)
- `{{ending_intensity_max}}` - Max ending intensity (0-1)
- `{{typical_turn_count_min}}` - Min conversation turns
- `{{typical_turn_count_max}}` - Max conversation turns
- `{{target_turn_count}}` - Calculated midpoint turns
- `{{response_techniques}}` - Formatted bullet list
- `{{key_principles}}` - Formatted bullet list

#### Topic Variables
- `{{topic_name}}` - Topic display name
- `{{topic_key}}` - Topic identifier
- `{{topic_description}}` - Topic description
- `{{topic_complexity}}` - Complexity level
- `{{topic_example_questions}}` - Formatted bullet list
- `{{requires_numbers}}` - "yes" or "no"
- `{{requires_timeframe}}` - "yes" or "no"

## Testing

### Run Integration Tests

```bash
# Run the test script
./scripts/test-template-selection.sh

# Or manually test each endpoint
curl "http://localhost:3000/api/templates/select?emotional_arc_type=confusion_to_clarity"
```

### Test in UI

1. Navigate to `/conversations/generate`
2. Select "Scaffolding-Based" tab
3. Choose an Emotional Arc
4. Observe templates loading automatically
5. Optionally select Persona, Topic, and specific Template
6. Click "Generate Conversation"

### Verify Template Resolution

```typescript
// Test that all placeholders are resolved
const resolved = await resolver.resolveScaffoldingTemplate(templateText, scaffoldingData);

// Check for unresolved placeholders
if (resolved.includes('{{')) {
  console.error('Unresolved placeholders detected!');
  const matches = resolved.match(/\{\{[^}]+\}\}/g);
  console.error('Unresolved:', matches);
}
```

## Common Patterns

### Pattern 1: Auto-Select Best Template

```typescript
// Don't specify template_id - system picks best match
const templates = await templateService.selectTemplates({
  emotional_arc_type: 'confusion_to_clarity',
  tier: 'template'
});

const bestTemplate = templates[0]; // Already sorted by quality
```

### Pattern 2: Filter by Compatibility

```typescript
// Get only templates compatible with specific persona and topic
const compatibleTemplates = await templateService.selectTemplates({
  emotional_arc_type: 'confusion_to_clarity',
  tier: 'template',
  persona_type: 'young_professional',
  topic_key: 'retirement_basics'
});
```

### Pattern 3: Validate Before Generation

```typescript
// Validate compatibility before generating
const validation = await templateService.validateCompatibility(
  templateId,
  personaKey,
  topicKey
);

if (validation.warnings.length > 0) {
  console.warn('Compatibility warnings:', validation.warnings);
  // Proceed with caution or select different template
}
```

### Pattern 4: Get Templates for Multiple Arcs

```typescript
const arcs = ['confusion_to_clarity', 'anxious_to_calm', 'shame_to_acceptance'];

const templatesByArc = await Promise.all(
  arcs.map(arc => 
    templateService.selectTemplates({
      emotional_arc_type: arc,
      tier: 'template'
    })
  )
);
```

## Error Handling

```typescript
try {
  const templates = await templateService.selectTemplates(criteria);
  
  if (templates.length === 0) {
    console.warn('No templates found for criteria:', criteria);
    // Fallback: relax filters or show user message
  }
  
} catch (error) {
  if (error.message.includes('No templates found')) {
    // Handle: no templates for this arc
    console.error('No templates available for arc:', criteria.emotional_arc_type);
  } else {
    // Handle: other errors (database, network, etc.)
    console.error('Template selection failed:', error);
  }
}
```

## Best Practices

1. **Always Specify Emotional Arc**: It's the primary selector and required
2. **Use Auto-Select When Unsure**: Leave `template_id` null for automatic selection
3. **Check Compatibility**: Validate before generation if using specific template
4. **Sort Matters**: Templates are pre-sorted by quality - use first result
5. **Filter Progressively**: Start with arc+tier, then add persona/topic as needed
6. **Cache Scaffolding Data**: Load personas/arcs/topics once, reuse for filtering
7. **Handle Empty Results**: Always check `templates.length` before using
8. **Log Warnings**: Non-fatal warnings provide useful insights

## Troubleshooting

### Issue: No templates returned

**Cause**: No templates in database for specified arc/tier combination

**Solution**: 
```sql
-- Check available templates
SELECT emotional_arc_type, tier, COUNT(*) 
FROM prompt_templates 
WHERE is_active = true 
GROUP BY emotional_arc_type, tier;
```

### Issue: Template has unresolved placeholders

**Cause**: Variable name mismatch or missing data

**Solution**: Check variable names match supported list and scaffolding data is complete

### Issue: Compatibility warnings shown

**Cause**: Persona/topic not in template's suitable lists

**Solution**: This is informational - you can proceed or select different template

## Next Steps

- Review [PROMPT3_FILE1_IMPLEMENTATION_COMPLETE.md](../PROMPT3_FILE1_IMPLEMENTATION_COMPLETE.md) for detailed implementation info
- Check [Scaffolding Services README](../src/lib/services/SCAFFOLDING-SERVICES-README.md) for full service documentation
- See [Template Management System](./template-management-system.md) for template creation

## Support

For issues or questions:
1. Check implementation documentation
2. Review test script for examples
3. Inspect API responses for detailed error messages
4. Check browser console for client-side errors

---

**Last Updated**: November 15, 2025

