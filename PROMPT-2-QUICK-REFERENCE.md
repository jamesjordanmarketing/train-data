# Prompt 2 - Backend Services - Quick Reference

## 🎯 Quick Import Guide

```typescript
// Import all services
import {
  // Main orchestrator
  getConversationGenerationService,
  ConversationGenerationService,
  
  // Individual services
  getClaudeAPIClient,
  getTemplateResolver,
  getQualityValidator,
  
  // Types
  type GenerationParams,
  type GenerationResult,
  type ClaudeAPIResponse,
  type ResolvedTemplate,
  type ValidationResult,
} from '@/lib/services';
```

---

## 🚀 Most Common Usage

### Generate a Conversation (Complete Workflow)

```typescript
import { getConversationGenerationService } from '@/lib/services';

const service = getConversationGenerationService();

const result = await service.generateSingleConversation({
  templateId: 'template-123',
  parameters: {
    persona: 'Anxious Investor',
    emotion: 'Worried',
    topic: 'Market Volatility',
    intent: 'seek_reassurance',
    tone: 'concerned'
  },
  tier: 'template',
  userId: 'user-456'
});

if (result.success) {
  console.log('ID:', result.conversation.id);
  console.log('Quality:', result.conversation.qualityScore);
  console.log('Cost:', `$${result.metrics.cost.toFixed(4)}`);
} else {
  console.error('Error:', result.error);
}
```

---

## 📚 Service Reference

### 1. ConversationGenerationService (Orchestrator)

**Purpose**: Complete conversation generation workflow

```typescript
const service = getConversationGenerationService();

// Generate conversation
const result = await service.generateSingleConversation({
  templateId: string,
  parameters: Record<string, any>,
  tier: 'template' | 'scenario' | 'edge_case',
  userId: string,
  runId?: string,        // Optional batch ID
  category?: string[],   // Optional tags
  temperature?: number,  // Override model temperature
  maxTokens?: number     // Override max tokens
});

// Check rate limit
const status = service.getRateLimitStatus();
```

**Returns**:
```typescript
interface GenerationResult {
  conversation: Conversation;
  success: boolean;
  error?: string;
  qualityDetails?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  metrics: {
    durationMs: number;
    cost: number;
    totalTokens: number;
  };
}
```

---

### 2. ClaudeAPIClient

**Purpose**: Direct Claude API integration

```typescript
import { getClaudeAPIClient } from '@/lib/services';

const client = getClaudeAPIClient();

// Generate conversation
const response = await client.generateConversation(prompt, {
  conversationId: 'conv-123',
  templateId: 'template-456',
  temperature: 0.7,
  maxTokens: 4096,
  userId: 'user-789'
});

// Check rate limit
const status = client.getRateLimitStatus();
console.log('Utilization:', status.utilization + '%');
console.log('Can make request:', status.canMakeRequest);
```

**Returns**:
```typescript
interface ClaudeAPIResponse {
  id: string;
  content: string;  // Raw response content
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  cost: number;
  durationMs: number;
}
```

---

### 3. TemplateResolver

**Purpose**: Template parameter injection

```typescript
import { getTemplateResolver } from '@/lib/services';

const resolver = getTemplateResolver();

// Resolve template
const resolved = await resolver.resolveTemplate({
  templateId: 'template-123',
  parameters: {
    persona: 'Anxious Investor',
    emotion: 'Worried',
    topic: 'Market Volatility'
  },
  userId: 'user-456'
});

if (resolved.success) {
  console.log('Prompt:', resolved.resolvedPrompt);
} else {
  console.error('Errors:', resolved.errors);
}

// Validate only (don't resolve)
const validation = await resolver.validateParameters(
  'template-123',
  { persona: 'Test' }
);

// Generate preview for UI
const preview = await resolver.generatePreview(
  'template-123',
  { persona: 'Test' }
);
```

**Returns**:
```typescript
interface ResolvedTemplate {
  templateId: string;
  originalTemplate: string;
  resolvedPrompt: string;
  parameters: Record<string, any>;
  success: boolean;
  errors: string[];
  warnings: string[];
  template: Template;
}
```

---

### 4. QualityValidator

**Purpose**: Automated quality assessment

```typescript
import { getQualityValidator } from '@/lib/services';

const validator = getQualityValidator();

// Full validation
const result = validator.validateConversation({
  turns: [
    { role: 'user', content: '...', timestamp: '...', tokenCount: 10 },
    { role: 'assistant', content: '...', timestamp: '...', tokenCount: 20 }
  ]
});

console.log('Score:', result.qualityMetrics.overall);
console.log('Confidence:', result.qualityMetrics.confidence);
console.log('Issues:', result.issues);
console.log('Suggestions:', result.suggestions);

// Quick pass/fail check
const passes = validator.quickValidate(conversation, 7.0);
```

**Returns**:
```typescript
interface ValidationResult {
  qualityMetrics: {
    overall: number;        // 0-10
    relevance: number;
    accuracy: number;
    naturalness: number;
    methodology: number;
    coherence: number;
    confidence: 'high' | 'medium' | 'low';
    uniqueness: number;
    trainingValue: 'high' | 'medium' | 'low';
  };
  scoreBreakdown: {
    turnCount: ScoreComponent;
    responseLength: ScoreComponent;
    structure: ScoreComponent;
    coherence: ScoreComponent;
  };
  issues: string[];
  suggestions: string[];
}
```

---

## 📊 Quality Scoring Guide

### Turn Count Thresholds
- **Optimal (10 pts)**: 8-16 turns
- **Acceptable (7 pts)**: 6-20 turns
- **Minimal (4 pts)**: 4-24 turns
- **Poor (2 pts)**: Outside minimal range

### Response Length Thresholds (average)
- **Optimal (10 pts)**: 100-500 characters
- **Acceptable (7 pts)**: 50-800 characters
- **Minimal (4 pts)**: 20-1200 characters
- **Poor (2 pts)**: Outside minimal range

### Score Weights
- Turn Count: **30%**
- Response Length: **25%**
- Structure: **30%**
- Coherence: **15%**

### Status Determination
```typescript
qualityScore >= threshold → 'generated'
qualityScore >= threshold - 2 → 'pending_review'
qualityScore < threshold - 2 → 'needs_revision'
```

---

## 🛠️ Configuration

### Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional (with defaults)
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=4096
ANTHROPIC_TEMPERATURE=0.7
RATE_LIMIT_RPM=50
```

### Rate Limiting

- **Default Limit**: 50 requests/minute
- **Window**: 60 seconds (sliding window)
- **Threshold**: 90% (starts queuing at 45/50)
- **Timeout**: 60 seconds max wait

---

## ⚠️ Error Handling

### Retryable Errors (Auto-retry with backoff)
- `429` - Rate limit exceeded
- `500` - Internal server error
- `502` - Bad gateway
- `503` - Service unavailable
- `504` - Gateway timeout
- `408` - Request timeout
- Network errors

### Non-Retryable Errors (Fail immediately)
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found

### Retry Strategy
- **Max Attempts**: 3
- **Base Delay**: 1 second
- **Max Delay**: 16 seconds
- **Pattern**: Exponential backoff with jitter

---

## 🔍 Monitoring

### Check Rate Limit Status

```typescript
const service = getConversationGenerationService();
const status = service.getRateLimitStatus();

console.log({
  current: status.currentCount,
  limit: status.limit,
  utilization: status.utilization.toFixed(1) + '%',
  canMakeRequest: status.canMakeRequest,
  estimatedWait: status.estimatedWaitMs + 'ms',
  status: status.status // 'healthy' | 'approaching' | 'throttled'
});
```

### Check Generation Logs

```typescript
import { generationLogService } from '@/lib/services';

// Get logs for a conversation
const logs = await generationLogService.getLogsByConversation(conversationId);

// Get cost summary
const summary = await generationLogService.getCostSummary(
  '2025-01-01T00:00:00Z',
  '2025-01-31T23:59:59Z'
);

console.log('Total cost:', summary.totalCost);
console.log('Success rate:', summary.successfulRequests / summary.totalRequests);
```

---

## 💡 Best Practices

### 1. Always Check Rate Limit Before Batch Operations

```typescript
const service = getConversationGenerationService();
const status = service.getRateLimitStatus();

if (status.utilization > 80) {
  console.warn('Rate limit approaching, consider waiting');
  await new Promise(resolve => setTimeout(resolve, status.estimatedWaitMs));
}
```

### 2. Validate Templates Before Generation

```typescript
const resolver = getTemplateResolver();
const validation = await resolver.validateParameters(templateId, params);

if (!validation.valid) {
  // Show errors to user BEFORE attempting generation
  return { errors: validation.errors };
}
```

### 3. Handle Generation Errors Gracefully

```typescript
const result = await service.generateSingleConversation(params);

if (!result.success) {
  // Log error
  console.error('Generation failed:', result.error);
  
  // Show user-friendly message
  return {
    error: 'Unable to generate conversation. Please try again.',
    details: result.error
  };
}
```

### 4. Monitor Quality Scores

```typescript
if (result.success && result.conversation.qualityScore < 7) {
  console.warn('Low quality conversation:', {
    id: result.conversation.id,
    score: result.conversation.qualityScore,
    issues: result.qualityDetails?.issues
  });
  
  // Flag for manual review
  await conversationService.updateStatus(
    result.conversation.id,
    'pending_review'
  );
}
```

### 5. Track Costs

```typescript
// After each generation
console.log('Generation cost:', {
  cost: `$${result.metrics.cost.toFixed(4)}`,
  tokens: result.metrics.totalTokens,
  duration: `${result.metrics.durationMs}ms`
});

// Periodic cost analysis
const monthlyCost = await generationLogService.calculateTotalCost({
  dateRange: [startOfMonth, endOfMonth]
});
console.log('Monthly cost:', `$${monthlyCost.toFixed(2)}`);
```

---

## 🐛 Common Issues & Solutions

### Issue: "Rate limit exceeded"

**Solution**: Service automatically handles this with retry logic. If persistent:
```typescript
const status = service.getRateLimitStatus();
await new Promise(resolve => setTimeout(resolve, status.estimatedWaitMs));
```

### Issue: "Template not found"

**Solution**: Verify template exists in database:
```typescript
const { data } = await supabase
  .from('templates')
  .select('id')
  .eq('id', templateId)
  .single();

if (!data) {
  console.error('Template does not exist');
}
```

### Issue: "Missing required parameter: persona"

**Solution**: Ensure all required parameters are provided:
```typescript
const validation = await resolver.validateParameters(templateId, params);
console.log('Missing:', validation.errors);
```

### Issue: Low quality scores

**Solution**: Check validation details:
```typescript
console.log('Quality breakdown:', result.qualityDetails);
console.log('Issues:', result.qualityDetails?.issues);
console.log('Suggestions:', result.qualityDetails?.suggestions);
```

---

## 📖 Type Definitions

### GenerationParams

```typescript
interface GenerationParams {
  templateId: string;
  parameters: Record<string, any>;  // persona, emotion, topic, etc.
  tier: 'template' | 'scenario' | 'edge_case';
  userId: string;
  runId?: string;                   // Optional batch ID
  category?: string[];              // Optional tags
  temperature?: number;             // Override temperature
  maxTokens?: number;               // Override max tokens
}
```

### GenerationResult

```typescript
interface GenerationResult {
  conversation: Conversation;       // Full conversation object with turns
  success: boolean;
  error?: string;
  qualityDetails?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  metrics: {
    durationMs: number;
    cost: number;
    totalTokens: number;
  };
}
```

---

## 🔗 Related Files

- **Services**: `src/lib/services/`
  - `claude-api-client.ts`
  - `template-resolver.ts`
  - `quality-validator.ts`
  - `conversation-generation-service.ts`
  - `index.ts`

- **AI Infrastructure**: `src/lib/ai/`
  - `rate-limiter.ts`
  - `retry-executor.ts`
  - `parameter-injection.ts`
  - `error-classifier.ts`

- **Configuration**: `src/lib/ai-config.ts`

- **Database Services**: `src/lib/services/`
  - `conversation-service.ts`
  - `generation-log-service.ts`

---

**Last Updated**: October 31, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅

