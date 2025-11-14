# Scaffolding Services Documentation

## Overview

The scaffolding services provide a structured approach to conversation generation by combining three key entities:
- **Personas**: Client archetypes with demographics, personality traits, and communication styles
- **Emotional Arcs**: Emotional journey patterns from starting emotion to ending emotion
- **Training Topics**: Subject matter areas with complexity levels and contextual requirements

## Services

### 1. ScaffoldingDataService

**Purpose**: CRUD operations for scaffolding entities (personas, emotional arcs, training topics)

**Location**: `src/lib/services/scaffolding-data-service.ts`

**Usage**:

```typescript
import { createClient } from '@/lib/supabase/server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';

const supabase = createClient();
const service = new ScaffoldingDataService(supabase);

// Fetch all personas
const personas = await service.getAllPersonas({ domain: 'financial_planning', is_active: true });

// Get specific persona
const persona = await service.getPersonaById('persona-uuid');

// Check compatibility
const compatibility = await service.checkCompatibility({
  persona_id: 'persona-uuid',
  arc_id: 'arc-uuid',
  topic_id: 'topic-uuid'
});
```

### 2. TemplateSelectionService

**Purpose**: Select appropriate prompt templates based on emotional arc, tier, and context

**Location**: `src/lib/services/template-selection-service.ts`

**Usage**:

```typescript
import { TemplateSelectionService } from '@/lib/services/template-selection-service';

const service = new TemplateSelectionService(supabase);

// Auto-select best template
const templateId = await service.selectTemplate({
  emotional_arc_type: 'anxious_to_calm',
  tier: 'template',
  persona_type: 'young_professional',
  topic_key: 'retirement_basics'
});

// Get selection with rationale
const selection = await service.selectTemplateWithRationale({
  emotional_arc_type: 'anxious_to_calm',
  tier: 'template'
});

console.log(`Selected: ${selection.template_name}`);
console.log(`Confidence: ${selection.confidence_score}`);
console.log(`Rationale: ${selection.rationale}`);
```

### 3. ParameterAssemblyService

**Purpose**: Orchestrate parameter assembly, compatibility checking, and system prompt construction

**Location**: `src/lib/services/parameter-assembly-service.ts`

**Usage**:

```typescript
import { ParameterAssemblyService } from '@/lib/services/parameter-assembly-service';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';
import { TemplateSelectionService } from '@/lib/services/template-selection-service';

const scaffoldingService = new ScaffoldingDataService(supabase);
const templateService = new TemplateSelectionService(supabase);
const assemblyService = new ParameterAssemblyService(scaffoldingService, templateService);

// Assemble all parameters
const assembled = await assemblyService.assembleParameters({
  persona_id: 'persona-uuid',
  emotional_arc_id: 'arc-uuid',
  training_topic_id: 'topic-uuid',
  tier: 'template',
  created_by: 'user-uuid'
});

console.log('Template variables:', assembled.template_variables);
console.log('System prompt:', assembled.system_prompt);
console.log('Compatibility score:', assembled.metadata.compatibility_score);
console.log('Warnings:', assembled.metadata.warnings);
```

## API Endpoints

### GET /api/scaffolding/personas

Fetch all personas with optional filtering.

**Query Parameters**:
- `domain` (optional): Filter by domain (default: 'financial_planning')
- `is_active` (optional): Filter by active status (default: true)
- `emotional_baseline` (optional): Filter by emotional baseline

**Response**:

```json
{
  "success": true,
  "personas": [...],
  "count": 10
}
```

**Example**:

```bash
curl http://localhost:3000/api/scaffolding/personas?domain=financial_planning
```

### GET /api/scaffolding/emotional-arcs

Fetch all emotional arcs with optional filtering.

**Query Parameters**:
- `domain` (optional): Filter by domain
- `is_active` (optional): Filter by active status
- `category` (optional): Filter by category (e.g., 'educational', 'therapeutic')

**Example**:

```bash
curl http://localhost:3000/api/scaffolding/emotional-arcs?category=educational
```

### GET /api/scaffolding/training-topics

Fetch all training topics with optional filtering.

**Query Parameters**:
- `domain` (optional): Filter by domain
- `is_active` (optional): Filter by active status
- `complexity_level` (optional): Filter by complexity ('beginner', 'intermediate', 'advanced')
- `category` (optional): Filter by category

**Example**:

```bash
curl http://localhost:3000/api/scaffolding/training-topics?complexity_level=beginner
```

### POST /api/scaffolding/check-compatibility

Check compatibility between persona, emotional arc, and training topic.

**Request Body**:

```json
{
  "persona_id": "uuid",
  "emotional_arc_id": "uuid",
  "training_topic_id": "uuid"
}
```

**Response**:

```json
{
  "success": true,
  "is_compatible": true,
  "warnings": [],
  "suggestions": [],
  "confidence": 0.85
}
```

**Example**:

```bash
curl -X POST http://localhost:3000/api/scaffolding/check-compatibility \
  -H "Content-Type: application/json" \
  -d '{
    "persona_id": "your-persona-id",
    "emotional_arc_id": "your-arc-id",
    "training_topic_id": "your-topic-id"
  }'
```

### POST /api/conversations/generate-with-scaffolding

Generate a conversation using scaffolding parameters.

**Request Body**:

```json
{
  "persona_id": "uuid",
  "emotional_arc_id": "uuid",
  "training_topic_id": "uuid",
  "tier": "template",
  "template_id": "uuid (optional)",
  "chunk_id": "uuid (optional)",
  "chunk_context": "string (optional)",
  "temperature": 0.7,
  "max_tokens": 2048,
  "created_by": "user-uuid (optional)"
}
```

**Response**:

```json
{
  "success": true,
  "conversation_id": "uuid",
  "conversation": {...},
  "metadata": {
    "generation_time_ms": 5000,
    "token_count": 1500,
    "compatibility_score": 0.85,
    "compatibility_warnings": [],
    "template_used": "template-uuid",
    "scaffolding": {
      "persona_name": "Sarah",
      "emotional_arc_name": "Anxious to Calm",
      "training_topic_name": "Retirement Planning Basics"
    }
  },
  "quality_metrics": {
    "quality_score": 8.5,
    "turn_count": 4,
    "status": "approved"
  },
  "cost": 0.0045
}
```

## Database Setup

Before using the scaffolding services, ensure the RPC functions are created in your Supabase database:

1. Open Supabase SQL Editor
2. Execute the SQL file: `src/lib/services/scaffolding-rpc-functions.sql`
3. Verify functions are created:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('increment_persona_usage', 'increment_arc_usage', 'increment_topic_usage');
```

## Testing

### Manual Testing with curl

1. **Test personas endpoint**:

```bash
curl http://localhost:3000/api/scaffolding/personas
```

2. **Test compatibility**:

```bash
curl -X POST http://localhost:3000/api/scaffolding/check-compatibility \
  -H "Content-Type: application/json" \
  -d '{
    "persona_id": "your-persona-id",
    "emotional_arc_id": "your-arc-id",
    "training_topic_id": "your-topic-id"
  }'
```

3. **Generate conversation with scaffolding**:

```bash
curl -X POST http://localhost:3000/api/conversations/generate-with-scaffolding \
  -H "Content-Type: application/json" \
  -d '{
    "persona_id": "your-persona-id",
    "emotional_arc_id": "your-arc-id",
    "training_topic_id": "your-topic-id",
    "tier": "template"
  }'
```

### Programmatic Testing

```typescript
// Test compatibility
const compatibilityResponse = await fetch('/api/scaffolding/check-compatibility', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    persona_id: 'persona-uuid',
    emotional_arc_id: 'arc-uuid',
    training_topic_id: 'topic-uuid'
  })
});

const compatibility = await compatibilityResponse.json();
console.log('Compatibility:', compatibility);

// Generate conversation
const generationResponse = await fetch('/api/conversations/generate-with-scaffolding', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    persona_id: 'persona-uuid',
    emotional_arc_id: 'arc-uuid',
    training_topic_id: 'topic-uuid',
    tier: 'template'
  })
});

const result = await generationResponse.json();
console.log('Generated conversation:', result);
```

## Troubleshooting

### Issue: "No templates found for arc"

**Cause**: The `prompt_templates` table doesn't have templates linked to the specified emotional arc type.

**Solution**: Ensure templates have the `emotional_arc_type` field populated. Run:

```sql
SELECT id, template_name, emotional_arc_type, tier 
FROM prompt_templates 
WHERE is_active = true;
```

### Issue: "Failed to increment usage"

**Cause**: RPC functions not created or permissions not granted.

**Solution**: Execute `scaffolding-rpc-functions.sql` in Supabase SQL Editor.

### Issue: Compatibility warnings

**Cause**: Mismatched scaffolding combinations (e.g., simple persona with advanced topic).

**Solution**: Review the warnings and suggestions in the compatibility check response. These are informational and don't prevent generation, but may indicate suboptimal combinations.

### Issue: "ANTHROPIC_API_KEY not configured"

**Cause**: Missing or invalid Anthropic API key.

**Solution**: Set the environment variable in `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Integration with UI

The scaffolding services are designed to integrate with UI components. See the specification document for React component examples:

- `ScaffoldingSelector`: Dropdown selectors for persona, arc, and topic
- `CompatibilityIndicator`: Visual feedback on combination compatibility
- `ScaffoldingPreview`: Preview of selected scaffolding before generation

## Best Practices

1. **Always check compatibility** before generating conversations to catch potential issues early
2. **Use auto template selection** unless you have a specific template requirement
3. **Review warnings** from the compatibility check - they provide valuable insights
4. **Monitor usage counts** to understand which scaffolding entities are most popular
5. **Validate scaffolding data** before creating new personas, arcs, or topics

## Related Documentation

- Main specification: `pmc/product/04-categories-to-conversation-pipeline-spec_v1.md`
- Database schema: See Prompt 1 migration files
- UI components: See Prompt 3 specifications
- Batch generation: See Prompt 4 specifications

