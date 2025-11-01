# Template Management Services

Complete service layer implementation for Templates, Scenarios, and Edge Cases in the Interactive LoRA Conversation Generation Module.

## Overview

This module provides three service classes with full CRUD operations, relationship handling, and specialized methods for managing the three-tier template system:

1. **TemplateService** - Reusable prompt structures with variable placeholders
2. **ScenarioService** - Specific conversation topics based on templates
3. **EdgeCaseService** - Boundary conditions and unusual situations for testing

## Features

✅ **Type Safety**: Strict TypeScript with comprehensive interfaces  
✅ **Error Handling**: Custom error types with descriptive messages  
✅ **Relationship Management**: Automatic foreign key validation and cascade handling  
✅ **Bulk Operations**: Batch creation for scenarios  
✅ **Filtering**: Advanced query filters for all entities  
✅ **Generation Tracking**: Status tracking for conversation generation  
✅ **Test Management**: Test status and results tracking for edge cases  

## Installation

```typescript
import { supabase } from '../supabase';
import {
  createTemplateService,
  createScenarioService,
  createEdgeCaseService,
} from './services';

// Create service instances
const templateService = createTemplateService(supabase);
const scenarioService = createScenarioService(supabase);
const edgeCaseService = createEdgeCaseService(supabase);
```

## TemplateService

### Basic Operations

```typescript
// Get all templates
const templates = await templateService.getAll();

// Filter templates
const activeTemplates = await templateService.getAll({
  isActive: true,
  minRating: 4,
  category: 'Financial Planning'
});

// Search templates
const results = await templateService.search('retirement');

// Get by ID
const template = await templateService.getById(templateId);

// Get by category
const categoryTemplates = await templateService.getByCategory('Financial Planning');
```

### Create Template

```typescript
const template = await templateService.create({
  name: 'Retirement Planning Discussion',
  description: 'Template for retirement planning conversations',
  category: 'Financial Planning',
  structure: 'Discuss {{topic}} with {{client_name}} focusing on {{goal}}',
  variables: [
    {
      name: 'topic',
      type: 'text',
      defaultValue: 'retirement goals',
      helpText: 'Main retirement topic to discuss'
    },
    {
      name: 'client_name',
      type: 'text',
      defaultValue: 'the client',
      helpText: 'Client name or reference'
    },
    {
      name: 'goal',
      type: 'dropdown',
      defaultValue: 'long-term security',
      helpText: 'Primary financial goal',
      options: ['long-term security', 'early retirement', 'legacy planning']
    }
  ],
  tone: 'Professional and empathetic',
  complexityBaseline: 6,
  qualityThreshold: 0.75,
  requiredElements: ['goal_setting', 'risk_assessment', 'action_plan'],
  applicablePersonas: ['Anxious Investor', 'Confident Planner', 'First-time Saver'],
  applicableEmotions: ['Anxious', 'Hopeful', 'Confused'],
  tier: 'template',
  isActive: true,
  createdBy: userId
});
```

### Update Template

```typescript
const updated = await templateService.update(templateId, {
  description: 'Updated description',
  qualityThreshold: 0.8,
  complexityBaseline: 7
});
```

### Delete Template (with cascade check)

```typescript
const result = await templateService.delete(templateId);

if (!result.success) {
  console.error(result.message);
  // Example: "Cannot delete template: 5 scenario(s) depend on it."
}
```

### Specialized Operations

```typescript
// Duplicate a template
const duplicate = await templateService.duplicate(
  templateId,
  'Retirement Planning Discussion (Copy)'
);

// Increment usage count (called when template is used)
await templateService.incrementUsageCount(templateId);

// Update rating
await templateService.updateRating(templateId, 4.5);
```

## ScenarioService

### Basic Operations

```typescript
// Get all scenarios
const scenarios = await scenarioService.getAll();

// Filter scenarios
const activeScenarios = await scenarioService.getAll({
  parentTemplateId: templateId,
  status: 'active',
  generationStatus: 'generated'
});

// Get by template ID
const templateScenarios = await scenarioService.getByTemplateId(templateId);

// Get by ID
const scenario = await scenarioService.getById(scenarioId);
```

### Create Scenario

```typescript
const scenario = await scenarioService.create({
  name: 'Market Downturn - Pre-Retirement Client',
  description: 'Client 5 years from retirement concerned about market volatility',
  parentTemplateId: templateId,
  context: 'Recent 15% market decline has caused anxiety. Client has $800K saved and plans to retire at 65.',
  parameterValues: {
    situation: 'market_downturn',
    timeframe: 'recent',
    client_age: 60,
    savings: '$800K'
  },
  topic: 'Market Volatility',
  persona: 'Anxious Investor',
  emotionalArc: 'Anxiety → Understanding → Reassurance',
  status: 'active',
  createdBy: userId
});
```

### Update Generation Status

```typescript
// Mark as generated successfully
await scenarioService.updateGenerationStatus(
  scenarioId,
  'generated',
  conversationId
);

// Mark as error
await scenarioService.updateGenerationStatus(
  scenarioId,
  'error',
  undefined,
  'API rate limit exceeded'
);
```

### Bulk Create Scenarios

```typescript
const scenarios = await scenarioService.bulkCreate([
  {
    name: 'Scenario 1',
    description: 'First scenario',
    context: 'Context for scenario 1',
    parentTemplateId: templateId,
    createdBy: userId
  },
  {
    name: 'Scenario 2',
    description: 'Second scenario',
    context: 'Context for scenario 2',
    parentTemplateId: templateId,
    createdBy: userId
  }
]);

console.log(`Created ${scenarios.length} scenarios`);
```

### Delete Scenario (with cascade check)

```typescript
const result = await scenarioService.delete(scenarioId);

if (!result.success) {
  console.error(result.message);
  // Example: "Cannot delete scenario: 3 edge case(s) depend on it."
}
```

## EdgeCaseService

### Basic Operations

```typescript
// Get all edge cases
const edgeCases = await edgeCaseService.getAll();

// Filter edge cases
const untested = await edgeCaseService.getAll({
  testStatus: 'not_tested',
  edgeCaseType: 'error_condition',
  minComplexity: 7
});

// Get by scenario ID
const scenarioEdgeCases = await edgeCaseService.getByScenarioId(scenarioId);

// Get by type
const errorCases = await edgeCaseService.getByType('error_condition');

// Get by ID
const edgeCase = await edgeCaseService.getById(edgeCaseId);
```

### Create Edge Case

```typescript
const edgeCase = await edgeCaseService.create({
  title: 'Negative Account Balance Inquiry',
  description: 'Client asks what happens if account goes negative during market downturn',
  parentScenarioId: scenarioId,
  edgeCaseType: 'error_condition',
  complexity: 8,
  createdBy: userId
});
```

### Update Test Status

```typescript
// Mark as passed with test results
await edgeCaseService.updateTestStatus(edgeCaseId, 'passed', {
  expectedBehavior: 'System should explain overdraft protection and prevention measures',
  actualBehavior: 'System correctly explained overdraft protection, rebalancing, and stop-loss features',
  passed: true,
  testDate: new Date().toISOString()
});

// Mark as failed
await edgeCaseService.updateTestStatus(edgeCaseId, 'failed', {
  expectedBehavior: 'System should provide clear explanation',
  actualBehavior: 'System provided vague response without specifics',
  passed: false,
  testDate: new Date().toISOString()
});
```

### Delete Edge Case

```typescript
// Edge cases have no dependencies, so they can be deleted directly
await edgeCaseService.delete(edgeCaseId);
```

## Type Definitions

All services use strongly-typed inputs and outputs:

```typescript
// Template types
type CreateTemplateInput = Omit<Template, 'id' | 'usageCount' | 'rating' | 'lastModified'>;
type UpdateTemplateInput = Partial<CreateTemplateInput>;

// Scenario types
type CreateScenarioInput = Omit<Scenario, 'id' | 'variationCount' | 'qualityScore' | 'createdAt' | 'parentTemplateName' | 'generationStatus' | 'conversationId' | 'errorMessage'>;
type UpdateScenarioInput = Partial<Omit<Scenario, 'id' | 'createdAt' | 'createdBy' | 'parentTemplateName'>>;

// Edge case types
type CreateEdgeCaseInput = Omit<EdgeCase, 'id' | 'createdAt' | 'parentScenarioName' | 'testStatus' | 'testResults'>;
type UpdateEdgeCaseInput = Partial<Omit<EdgeCase, 'id' | 'createdAt' | 'createdBy' | 'parentScenarioName'>>;
```

## Filter Options

### TemplateFilters

```typescript
interface TemplateFilters {
  category?: string;
  minRating?: number;
  search?: string;
  tier?: 'template' | 'scenario' | 'edge_case';
  isActive?: boolean;
}
```

### ScenarioFilters

```typescript
interface ScenarioFilters {
  parentTemplateId?: string;
  status?: 'draft' | 'active' | 'archived';
  persona?: string;
  topic?: string;
  emotionalArc?: string;
  generationStatus?: 'not_generated' | 'generated' | 'error';
}
```

### EdgeCaseFilters

```typescript
interface EdgeCaseFilters {
  parentScenarioId?: string;
  edgeCaseType?: EdgeCaseType;
  complexity?: number;
  minComplexity?: number;
  maxComplexity?: number;
  testStatus?: 'not_tested' | 'passed' | 'failed';
}
```

## Error Handling

All services throw descriptive errors:

```typescript
try {
  const template = await templateService.getById(invalidId);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // Example: "Template with ID xxx not found"
  }
}

// Delete operations return structured results
const result = await templateService.delete(templateId);
if (!result.success) {
  console.error(result.message);
  // Handle dependency errors gracefully
}
```

## Validation

Services perform automatic validation:

- **Required fields**: Name, structure/context, IDs
- **Foreign keys**: Parent template/scenario existence
- **Numeric ranges**: Rating (0-5), Complexity (1-10)
- **Enum values**: Status, tier, edge case type, test status

## Database Integration

Services use Supabase client with:

- **Row Level Security (RLS)**: Automatic via auth context
- **Transactions**: Atomic operations for bulk creates
- **Cascade checks**: Safe delete functions prevent orphaned data
- **Relationships**: Automatic joining of parent names
- **Indexes**: Optimized queries via proper where clauses

## Best Practices

### 1. Always Check Existence Before Operations

```typescript
const template = await templateService.getById(templateId);
if (!template) {
  throw new Error('Template not found');
}
```

### 2. Handle Delete Dependencies

```typescript
const result = await templateService.delete(templateId);
if (!result.success) {
  // Inform user about dependencies
  alert(result.message);
}
```

### 3. Use Filters for Efficient Queries

```typescript
// Good - filtered at database level
const active = await templateService.getAll({ isActive: true });

// Bad - filters in memory
const all = await templateService.getAll();
const active = all.filter(t => t.isActive);
```

### 4. Validate Foreign Keys

```typescript
// Services automatically validate, but you can pre-check
const template = await templateService.getById(parentTemplateId);
if (!template) {
  throw new Error('Invalid template ID');
}
```

### 5. Track Generation Status

```typescript
// Before generation
await scenarioService.updateGenerationStatus(scenarioId, 'not_generated');

try {
  // Generate conversation
  const conversation = await generateConversation(scenario);
  
  // On success
  await scenarioService.updateGenerationStatus(
    scenarioId,
    'generated',
    conversation.id
  );
} catch (error) {
  // On error
  await scenarioService.updateGenerationStatus(
    scenarioId,
    'error',
    undefined,
    error.message
  );
}
```

## Testing

Example test structure:

```typescript
describe('TemplateService', () => {
  let service: TemplateService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    service = new TemplateService(mockSupabase);
  });

  it('should create a template', async () => {
    const input: CreateTemplateInput = {
      name: 'Test Template',
      structure: 'Test {{variable}}',
      // ... other required fields
    };

    const result = await service.create(input);
    expect(result.id).toBeDefined();
    expect(result.name).toBe('Test Template');
  });

  it('should throw on invalid template ID', async () => {
    await expect(
      service.getById('invalid-id')
    ).rejects.toThrow();
  });
});
```

## Performance Considerations

1. **Use selective field loading** when needed (services load all fields by default)
2. **Apply filters at database level** via service filter parameters
3. **Use bulk operations** for creating multiple scenarios
4. **Index support** via proper query construction

## Database Schema Requirements

Services expect these tables to exist:

- `templates`: Template storage with RLS
- `scenarios`: Scenario storage with template foreign key
- `edge_cases`: Edge case storage with scenario foreign key

Optional database functions for enhanced functionality:

- `safe_delete_template(template_id UUID)`: Returns dependency check results
- `safe_delete_scenario(scenario_id UUID)`: Returns dependency check results
- `increment_template_usage(template_id UUID)`: Atomic usage count increment

## Migration Path

If upgrading from existing services:

1. Install new services alongside existing ones
2. Update imports to use new service classes
3. Replace method calls with new API
4. Test thoroughly before removing old services
5. Update any dependent code that relies on old response formats

## Support

For issues or questions:
- Check error messages for specific guidance
- Review type definitions for expected inputs
- Consult inline JSDoc comments in source code
- See implementation examples in this README

## License

Part of the Interactive LoRA Conversation Generation Module.

