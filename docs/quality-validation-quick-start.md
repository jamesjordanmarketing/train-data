# Quality Validation Quick Start

Get up and running with the Quality Validation System in 5 minutes.

## Installation

The quality validation system is already integrated into the conversation generation flow. No additional setup required!

## Quick Overview

The system automatically:
1. ✅ Calculates quality scores (0-10) for every generated conversation
2. 📊 Evaluates 4 components: Turn Count, Length, Structure, Confidence
3. 🚩 Flags conversations with score < 6 for revision
4. 💡 Provides actionable improvement recommendations

## Using the UI

### 1. View Quality Scores

Navigate to the Conversations Dashboard. Each conversation shows its quality score in the **Quality** column:

- 🟢 **8.0+** = Excellent (green badge)
- 🟡 **6.0-7.9** = Acceptable (yellow badge)
- 🔴 **<6.0** = Needs Revision (red badge)

### 2. View Detailed Breakdown

Click on any quality score badge to open the **Quality Details Modal**:

```
┌─────────────────────────────────────────┐
│ Quality Score Breakdown         [8.5]   │
├─────────────────────────────────────────┤
│ ✅ Excellent Quality                    │
│                                         │
│ 📊 Quality Components                   │
│                                         │
│ Turn Count              [9.0/10] ████   │
│ • Actual: 12 turns                      │
│ • Target: 8-16 turns (optimal)          │
│                                         │
│ Turn Length            [8.5/10] ████    │
│ • Average: 180 chars/turn               │
│ • Target: 100-400 chars/turn            │
│                                         │
│ Structure              [10/10]  █████   │
│ • All structural checks passed          │
│                                         │
│ Confidence             [7.5/10] ███▒    │
│ • High Response Variation               │
│ • Complete Ending                       │
│                                         │
│ 💡 Recommendations                      │
│ • Small improvements in flow could...   │
└─────────────────────────────────────────┘
```

### 3. Filter by Quality

In the dashboard:

1. Click **Filters** button
2. Scroll to **Quality Score Range**
3. Use sliders or quick filters:
   - **High (≥8)**: Production-ready conversations
   - **Medium (6-8)**: May need minor improvements
   - **Low (<6)**: Flagged for revision

## Using the API

### Basic Usage

```typescript
import { qualityScorer, generateRecommendations } from '@/lib/quality';

// Score a conversation
const score = qualityScorer.calculateScore({
  turns: [
    { role: 'user', content: 'Can you help me?' },
    { role: 'assistant', content: 'Of course! What do you need?' },
    // ... more turns
  ],
  totalTurns: 10,
  totalTokens: 500,
  tier: 'template',
});

// Generate recommendations
score.recommendations = generateRecommendations(score);

console.log(`Score: ${score.overall}/10`);
console.log(`Status: ${score.autoFlagged ? 'Flagged' : 'OK'}`);
```

### Auto-Flagging

```typescript
import { evaluateAndFlag } from '@/lib/quality';

// Auto-flag if needed
const result = await evaluateAndFlag(conversationId, score, {
  threshold: 6,
  updateStatus: true,
  addReviewNote: true,
});

console.log(`Flagged: ${result.wasFlagged}`);
```

### Full Integration Example

```typescript
import { validateAndFlag } from '@/lib/quality';

// Complete validation and flagging
const { score, flagResult } = await validateAndFlag(
  conversationId,
  {
    turns: conversation.turns,
    totalTurns: conversation.totalTurns,
    totalTokens: conversation.totalTokens,
    tier: conversation.tier,
  },
  { threshold: 6 }
);

// Use the results
if (score.autoFlagged) {
  console.log('⚠️ Conversation flagged for revision');
  console.log('Recommendations:', score.recommendations);
} else {
  console.log('✅ Quality check passed');
}
```

## Understanding Scores

### Score Breakdown

Each conversation receives scores for 4 components:

| Component | Weight | What It Measures |
|-----------|--------|------------------|
| Turn Count | 30% | Appropriate number of exchanges |
| Length | 25% | Turn length and detail level |
| Structure | 25% | Valid conversation format |
| Confidence | 20% | Content quality indicators |

**Overall Score** = Weighted average of all components

### Score Ranges

| Range | Status | Meaning | Action |
|-------|--------|---------|--------|
| 8.0-10.0 | Excellent | Production-ready | ✅ Approve for training |
| 6.0-7.9 | Acceptable | Minor improvements possible | ⚠️ Review & optionally improve |
| 0.0-5.9 | Needs Revision | Quality issues found | 🔄 Revise before use |

### Common Issues

#### Low Turn Count Score

**Problem**: "Current conversation has only 3 turns"

**Fix**:
- Add more follow-up questions
- Expand topic coverage
- Include clarifying exchanges

#### Low Length Score

**Problem**: "Average turn length is 25 chars, too short"

**Fix**:
- Provide more detailed responses
- Add context and examples
- Expand explanations

#### Structure Issues

**Problem**: "Improper role alternation at turn 3"

**Fix**:
- Ensure user and assistant alternate
- Remove duplicate consecutive roles
- Start with user message

#### Low Confidence

**Problem**: "Low confidence level detected"

**Fix**:
- Vary response content
- Avoid repetitive phrases
- Include natural conversation endings

## Common Workflows

### Workflow 1: Review Flagged Conversations

```bash
1. Open Conversations Dashboard
2. Click "Filters" → "Low (<6)" quick filter
3. Review each flagged conversation
4. Click quality score to see specific issues
5. Edit conversation to address recommendations
6. Regenerate or manually update
7. Verify new score ≥ 6
```

### Workflow 2: Quality Assurance Check

```bash
1. Generate batch of conversations
2. Sort by Quality column (ascending)
3. Review bottom 10% of scores
4. Check recommendations for patterns
5. Adjust generation parameters if needed
6. Re-generate problem conversations
```

### Workflow 3: Production Export

```bash
1. Open Conversations Dashboard
2. Apply filter: Quality ≥ 8.0
3. Select all high-quality conversations
4. Click "Export Selected"
5. Choose format (JSON/JSONL/CSV)
6. Download for training pipeline
```

## Tips & Best Practices

### For Better Scores

1. ✅ **Aim for 10-14 turns** for templates
2. ✅ **Keep turn length 150-300 chars** on average
3. ✅ **Always start with user message**
4. ✅ **Vary conversation content** (avoid repetition)
5. ✅ **End naturally** with assistant response

### When Reviewing

1. 📋 **Prioritize flagged conversations** (score < 6)
2. 📋 **Read recommendations** before editing
3. 📋 **Check structural issues first** (quick fixes)
4. 📋 **Then improve content quality** (confidence)
5. 📋 **Verify score improves** after changes

### When Generating

1. 🎯 **Use appropriate tier** for content type
2. 🎯 **Provide detailed prompts** for better responses
3. 🎯 **Review sample outputs** before batch generation
4. 🎯 **Monitor quality trends** over time
5. 🎯 **Adjust templates** based on recurring issues

## Troubleshooting

### All Scores Are Low

**Possible Causes:**
- Template tier mismatch (using wrong tier for content)
- Insufficient turn count in generation
- Very short responses

**Fix:**
- Verify tier selection (template/scenario/edge_case)
- Increase target turn count in generation
- Adjust prompt to encourage longer responses

### Modal Won't Open

**Possible Causes:**
- Conversation has no quality metrics
- Quality score = 0 or undefined

**Fix:**
- Regenerate conversation to calculate score
- Check console for errors
- Verify conversation was generated with quality system enabled

### Auto-Flagging Not Working

**Possible Causes:**
- Threshold set too low
- Database permissions issue
- Auto-flag integration not enabled

**Fix:**
- Check threshold setting (default: 6.0)
- Verify database write permissions
- Review generation logs for errors

## Next Steps

- 📖 Read full documentation: `docs/quality-validation-system.md`
- 🧪 Review test cases: `src/lib/quality/__tests__/scorer.test.ts`
- 🔧 Customize thresholds: Edit `src/lib/quality/scorer.ts`
- 📊 Monitor quality trends: Use dashboard analytics

## Support

Need help?
- Check the console for detailed scoring logs
- Review recommendations in quality modal
- Consult full documentation for advanced features
- Contact development team for threshold adjustments

---

**Quick Reference Card**

| What | Where | How |
|------|-------|-----|
| View scores | Dashboard → Quality column | Visual badges with scores |
| See breakdown | Click score badge | Opens detailed modal |
| Filter by quality | Filters → Quality Range | Sliders or quick buttons |
| Review flagged | Filters → Low (<6) | Shows only problematic ones |
| Export good ones | Filters → High (≥8) → Export | Production-ready conversations |

Happy scoring! 🎯

