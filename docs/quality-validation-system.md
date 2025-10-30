# Quality Validation System

## Overview

The Quality Validation System automatically assesses generated conversations, providing a 0-10 score based on multiple criteria. This enables early identification of low-quality conversations and data-driven quality improvement.

## Features

- **Automated Quality Scoring**: Calculate scores based on structural criteria (turn count, length, structure, confidence)
- **Detailed Breakdown**: View comprehensive breakdown of each quality component
- **Auto-Flagging**: Automatically flag conversations with score < 6 for revision
- **Visual Interface**: Interactive modal with progress bars and color-coded indicators
- **Actionable Recommendations**: Specific improvement suggestions based on quality issues
- **Quality Filtering**: Filter conversations by quality range in the dashboard

## Architecture

### Core Components

```
src/lib/quality/
  ├── types.ts              # TypeScript type definitions
  ├── scorer.ts             # Quality scoring engine
  ├── recommendations.ts    # Recommendation generator
  ├── auto-flag.ts          # Auto-flagging system
  ├── index.ts              # Main exports
  └── __tests__/
      └── scorer.test.ts    # Comprehensive test suite
```

### UI Components

```
train-wireframe/src/components/dashboard/
  ├── QualityDetailsModal.tsx    # Quality breakdown modal
  ├── ConversationTable.tsx      # Shows quality scores with clickable badges
  └── FilterBar.tsx              # Quality range filtering
```

## Quality Scoring Algorithm

### Scoring Components

Quality scores are calculated based on four weighted components:

1. **Turn Count (30% weight)**
   - Evaluates if conversation has appropriate number of exchanges
   - Tier-specific thresholds:
     - Template: 8-16 turns (optimal), 6-20 (acceptable)
     - Scenario: 10-20 turns (optimal), 8-24 (acceptable)
     - Edge Case: 6-12 turns (optimal), 4-16 (acceptable)

2. **Length (25% weight)**
   - Evaluates average turn length and overall conversation length
   - Checks for appropriate detail level
   - Tier-specific character count thresholds

3. **Structure (25% weight)**
   - Validates conversation structure:
     - Starts with user message
     - Proper role alternation (user → assistant → user...)
     - No empty turns
     - Balanced turn distribution
   - Binary score with penalties for issues

4. **Confidence (20% weight)**
   - Evaluates content quality indicators:
     - Response variation (not repetitive)
     - Consistent turn lengths
     - Natural conversation flow (question balance)
     - Complete ending
   - Factors classified as positive or negative impact

### Score Calculation

```typescript
overall_score = 
  turnCount.score * 0.30 +
  length.score * 0.25 +
  structure.score * 0.25 +
  confidence.score * 0.20
```

### Auto-Flagging

Conversations with `overall_score < 6.0` are automatically:
- Flagged with `autoFlagged: true`
- Status updated to `needs_revision`
- Review note added with specific issues
- Logged in review history

## Usage

### Scoring a Conversation

```typescript
import { qualityScorer, generateRecommendations } from '@/lib/quality';

// Calculate quality score
const score = qualityScorer.calculateScore({
  turns: conversation.turns,
  totalTurns: conversation.totalTurns,
  totalTokens: conversation.totalTokens,
  tier: 'template',
});

// Generate recommendations
score.recommendations = generateRecommendations(score);

console.log(`Quality Score: ${score.overall}/10`);
console.log(`Auto-flagged: ${score.autoFlagged}`);
```

### Viewing Quality Breakdown

1. Navigate to Conversations Dashboard
2. Click on any quality score badge (colored number in Quality column)
3. View detailed breakdown in modal:
   - Overall score with status
   - Component scores with progress bars
   - Detailed metrics for each component
   - Actionable recommendations
   - Calculation timestamp

### Filtering by Quality

1. Click "Filters" button in dashboard
2. Use Quality Score Range sliders:
   - Adjust Min/Max values
   - Or use quick filters: High (≥8), Medium (6-8), Low (<6)
3. View filtered results

### Auto-Flagging Behavior

When a conversation is generated:

```typescript
// During generation...
const qualityScore = qualityScorer.calculateScore(conversationData);

// Auto-flag if below threshold
if (qualityScore.overall < 6) {
  await evaluateAndFlag(conversationId, qualityScore, {
    threshold: 6,
    updateStatus: true,
    addReviewNote: true,
  });
}
```

## Quality Criteria Details

### Turn Count

**Optimal Range (10 points):**
- Template: 8-16 turns
- Scenario: 10-20 turns
- Edge Case: 6-12 turns

**Acceptable Range (5-7 points):**
- Template: 6-20 turns
- Scenario: 8-24 turns
- Edge Case: 4-16 turns

**Poor (<5 points):**
- Below acceptable minimum or above acceptable maximum

### Length

**Optimal (10 points):**
- Average turn length within tier-specific range
- Total conversation meets minimum length threshold

**Acceptable (5-7 points):**
- Slightly outside optimal range but meets basic requirements

**Poor (<5 points):**
- Very short turns (< 50 chars avg)
- Very long turns (> 600 chars avg)
- Overall conversation too short

### Structure

**Perfect (10 points):**
- Starts with user message
- Perfect role alternation
- No empty turns
- Balanced user/assistant distribution (±1 turn)

**Has Issues (0-9 points):**
- Penalties applied per issue:
  - Wrong starting role: -2 points
  - Role alternation error: -1.5 points per occurrence
  - Empty turns: -2 points per turn
  - Very short turns (<10 chars): -0.5 points per turn
  - Imbalanced distribution: -1 point

### Confidence

**High (8-10 points):**
- High response variation (>90% unique)
- Consistent turn lengths (CV < 0.5)
- Natural question flow (20-50% questions)
- Complete ending

**Medium (5-7 points):**
- Moderate variation
- Some inconsistencies
- Acceptable flow

**Low (<5 points):**
- High repetition
- Inconsistent lengths
- Poor flow indicators

## Recommendations System

The system generates specific, actionable recommendations based on quality issues:

### Categories

1. **Turn Count Recommendations**
   - Add follow-up questions
   - Remove redundant exchanges
   - Expand topic coverage

2. **Length Recommendations**
   - Add more detail to responses
   - Make responses more concise
   - Develop topics more thoroughly

3. **Structure Recommendations**
   - Fix role alternation
   - Remove/populate empty turns
   - Balance turn distribution

4. **Confidence Recommendations**
   - Vary responses
   - Maintain consistent lengths
   - Balance questions with statements

### Recommendation Format

```
🚨 **Critical**: This conversation requires revision
📊 **Turn Count**: Current has only 3 turns. Aim for 8-16 turns
📝 **Turn Length**: Average is 25 chars, which is too short
🔧 **Structure Issues**: 2 structural problem(s) detected:
   1. Does not start with user → Ensure conversation begins with user
   2. Empty turn found → Remove or populate empty turns
🎯 **Confidence Level**: Low confidence detected
```

## API Reference

### QualityScorer

```typescript
class QualityScorer {
  calculateScore(conversation: ConversationData): QualityScore;
  getTierConfig(tier: TierType): TierThresholds;
  getWeights(): WeightConfig;
}
```

### RecommendationGenerator

```typescript
class RecommendationGenerator {
  generateRecommendations(score: QualityScore): string[];
  generateTargetedRecommendations(breakdown: QualityBreakdown): Map<string, string[]>;
  getImprovementPriority(breakdown: QualityBreakdown): PriorityLevels;
}
```

### AutoFlagger

```typescript
class AutoFlagger {
  evaluateAndFlag(
    conversationId: string,
    qualityScore: QualityScore,
    options?: FlagOptions
  ): Promise<AutoFlagResult>;
  
  batchEvaluateAndFlag(
    evaluations: Array<{ conversationId: string; qualityScore: QualityScore }>,
    options?: FlagOptions
  ): Promise<AutoFlagResult[]>;
  
  unflagConversation(
    conversationId: string,
    performedBy: string,
    comment?: string
  ): Promise<void>;
}
```

## Testing

### Running Tests

```bash
# Run all quality tests
npm test src/lib/quality

# Run with coverage
npm test -- --coverage src/lib/quality

# Watch mode
npm test -- --watch src/lib/quality
```

### Test Coverage

The test suite includes:
- Turn count evaluation (all tiers)
- Length evaluation (optimal, acceptable, poor)
- Structure validation (all rules)
- Confidence scoring (all factors)
- Overall score calculation (weighted average)
- Auto-flagging behavior
- Tier-specific thresholds
- Edge cases (empty, single turn, very long)
- Score consistency

Target: 85%+ agreement with human judgment

## Performance

### Scoring Performance

- **Average Calculation Time**: <50ms
- **Target**: <100ms
- **Optimization**: In-memory calculation, no external API calls

### Database Impact

- Quality scores stored with conversation
- No additional database queries for score calculation
- Review history updated only when auto-flagging

## Color Coding

Quality scores use consistent color coding throughout the UI:

- **Green (≥8.0)**: Excellent quality, ready for training
- **Yellow (6.0-7.9)**: Acceptable quality, minor improvements possible
- **Red (<6.0)**: Needs revision, automatically flagged

## Best Practices

### For Developers

1. **Always calculate scores** immediately after generation
2. **Store complete breakdown** in quality metrics field
3. **Generate recommendations** before displaying to users
4. **Handle auto-flagging errors** gracefully (non-blocking)
5. **Test with real conversations** to validate scoring accuracy

### For Content Reviewers

1. **Review flagged conversations** first (score < 6)
2. **Check recommendations** for specific improvement areas
3. **Focus on critical issues** (structure, turn count)
4. **Use quality filters** to prioritize review queue
5. **Unflag after improvements** to track progress

## Troubleshooting

### Low Quality Scores

**Problem**: All conversations scoring low

**Solutions**:
- Check tier thresholds match content type
- Verify turn count is appropriate for tier
- Ensure proper role alternation
- Review turn length averages

### Auto-Flagging Not Working

**Problem**: Conversations not being flagged

**Solutions**:
- Verify threshold is set (default: 6.0)
- Check auto-flag integration in generation flow
- Review database permissions
- Check error logs for flagging failures

### Inconsistent Scores

**Problem**: Similar conversations getting different scores

**Solutions**:
- Ensure consistent conversation data format
- Check for edge cases (empty turns, very short content)
- Verify tier is correctly specified
- Review confidence scoring factors

## Future Enhancements

- [ ] Machine learning-based confidence scoring
- [ ] Custom threshold configuration per tier
- [ ] Quality trend analysis over time
- [ ] Batch recalculation for existing conversations
- [ ] A/B testing of scoring algorithms
- [ ] Integration with human review feedback loop

## Support

For questions or issues:
- Review test cases in `__tests__/scorer.test.ts`
- Check console logs for detailed scoring breakdown
- Refer to type definitions in `types.ts`
- Contact development team for scoring algorithm adjustments

