# Quality Validation Module

Automated quality scoring system for conversation evaluation.

## Quick Start

```typescript
import { qualityScorer, generateRecommendations, evaluateAndFlag } from '@/lib/quality';

// 1. Score a conversation
const score = qualityScorer.calculateScore({
  turns: conversation.turns,
  totalTurns: conversation.totalTurns,
  totalTokens: conversation.totalTokens,
  tier: 'template',
});

// 2. Generate recommendations
score.recommendations = generateRecommendations(score);

// 3. Auto-flag if needed
if (score.autoFlagged) {
  await evaluateAndFlag(conversationId, score);
}

console.log(`Quality: ${score.overall}/10`);
```

## Module Structure

```
quality/
├── types.ts              # TypeScript type definitions
├── scorer.ts             # Quality scoring engine
├── recommendations.ts    # Recommendation generator
├── auto-flag.ts          # Auto-flagging system
├── index.ts              # Main exports
├── README.md             # This file
└── __tests__/
    └── scorer.test.ts    # Comprehensive test suite
```

## Scoring Components

| Component | Weight | Purpose |
|-----------|--------|---------|
| Turn Count | 30% | Evaluates conversation length |
| Length | 25% | Evaluates turn detail level |
| Structure | 25% | Validates conversation format |
| Confidence | 20% | Assesses content quality |

## API Reference

### qualityScorer.calculateScore()

Calculate quality score for a conversation.

```typescript
const score: QualityScore = qualityScorer.calculateScore({
  turns: ConversationTurn[],
  totalTurns: number,
  totalTokens: number,
  tier: 'template' | 'scenario' | 'edge_case',
});
```

**Returns**: `QualityScore` with:
- `overall`: 0-10 score
- `breakdown`: Detailed component scores
- `recommendations`: Empty array (populate with generateRecommendations)
- `autoFlagged`: boolean
- `calculatedAt`: ISO timestamp

### generateRecommendations()

Generate actionable recommendations based on quality score.

```typescript
const recommendations: string[] = generateRecommendations(score);
```

**Returns**: Array of markdown-formatted recommendation strings.

### evaluateAndFlag()

Evaluate and auto-flag a conversation if below threshold.

```typescript
const result: AutoFlagResult = await evaluateAndFlag(
  conversationId: string,
  qualityScore: QualityScore,
  options?: {
    threshold?: number,      // Default: 6
    updateStatus?: boolean,  // Default: true
    addReviewNote?: boolean, // Default: true
  }
);
```

**Returns**: `AutoFlagResult` with flag status and details.

## Tier-Specific Thresholds

### Template
- Optimal Turns: 8-16
- Acceptable Turns: 6-20
- Avg Turn Length: 100-400 chars

### Scenario
- Optimal Turns: 10-20
- Acceptable Turns: 8-24
- Avg Turn Length: 150-500 chars

### Edge Case
- Optimal Turns: 6-12
- Acceptable Turns: 4-16
- Avg Turn Length: 120-450 chars

## Score Interpretation

- **8.0-10.0**: Excellent quality, production-ready
- **6.0-7.9**: Acceptable quality, minor improvements
- **0.0-5.9**: Needs revision, auto-flagged

## Testing

```bash
# Run tests
npm test src/lib/quality

# With coverage
npm test -- --coverage src/lib/quality

# Watch mode
npm test -- --watch src/lib/quality
```

## Performance

- **Calculation Time**: <50ms average
- **Target**: <100ms
- **Database Queries**: 0 (in-memory calculation)

## Examples

### Example 1: Basic Scoring

```typescript
import { qualityScorer } from '@/lib/quality';

const score = qualityScorer.calculateScore({
  turns: [
    { role: 'user', content: 'Can you help me invest wisely?' },
    { role: 'assistant', content: 'I\'d be happy to help! What are your investment goals?' },
    { role: 'user', content: 'I want to save for retirement.' },
    { role: 'assistant', content: 'Great! Let\'s discuss some strategies.' },
  ],
  totalTurns: 4,
  totalTokens: 200,
  tier: 'template',
});

console.log(score.overall); // e.g., 6.5
```

### Example 2: Full Validation

```typescript
import { validateAndFlag } from '@/lib/quality';

const { score, flagResult } = await validateAndFlag(
  'conv-123',
  conversationData,
  { threshold: 6 }
);

if (score.autoFlagged) {
  console.log('Issues:', score.recommendations);
} else {
  console.log('Quality passed!');
}
```

### Example 3: Custom Threshold

```typescript
import { evaluateAndFlag } from '@/lib/quality';

// Use stricter threshold
const result = await evaluateAndFlag(convId, score, {
  threshold: 7.5,
  updateStatus: true,
});
```

## Common Patterns

### Pattern 1: Generation Integration

```typescript
// In conversation generator
const score = qualityScorer.calculateScore(conversationData);
score.recommendations = generateRecommendations(score);

// Save with metrics
await conversationService.create({
  qualityScore: score.overall,
  qualityMetrics: { /* from score.breakdown */ },
  status: score.autoFlagged ? 'needs_revision' : 'generated',
});

// Auto-flag
if (score.autoFlagged) {
  await evaluateAndFlag(conversationId, score);
}
```

### Pattern 2: Batch Scoring

```typescript
import { autoFlagger } from '@/lib/quality';

const evaluations = conversations.map(conv => ({
  conversationId: conv.id,
  qualityScore: qualityScorer.calculateScore(conv),
}));

const results = await autoFlagger.batchEvaluateAndFlag(evaluations);
console.log(`Flagged ${results.filter(r => r.wasFlagged).length} conversations`);
```

### Pattern 3: Quality Monitoring

```typescript
// Calculate scores for all conversations
const scores = conversations.map(conv =>
  qualityScorer.calculateScore(conv)
);

// Analyze distribution
const avgScore = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;
const flaggedCount = scores.filter(s => s.autoFlagged).length;

console.log(`Average Quality: ${avgScore.toFixed(2)}`);
console.log(`Flagged Rate: ${(flaggedCount / scores.length * 100).toFixed(1)}%`);
```

## Troubleshooting

### Low Scores

**Problem**: All conversations scoring low

**Solutions**:
- Check tier matches content type
- Verify turn count is appropriate
- Ensure proper role alternation
- Review turn length averages

### Inconsistent Scores

**Problem**: Similar conversations get different scores

**Solutions**:
- Ensure consistent data format
- Check for edge cases (empty turns)
- Verify tier is correctly specified
- Review confidence factors

### Auto-Flagging Failing

**Problem**: Conversations not being flagged

**Solutions**:
- Verify threshold setting
- Check database permissions
- Review error logs
- Ensure integration is active

## Best Practices

1. **Always score immediately** after generation
2. **Generate recommendations** before displaying to users
3. **Handle flagging errors** gracefully (non-blocking)
4. **Store complete breakdown** in quality metrics
5. **Monitor quality trends** over time

## Further Reading

- [Full Documentation](../../../docs/quality-validation-system.md)
- [Quick Start Guide](../../../docs/quality-validation-quick-start.md)
- [Test Cases](../__tests__/scorer.test.ts)

## Support

For issues or questions:
- Check test cases for examples
- Review type definitions in types.ts
- Consult full documentation
- Contact development team

