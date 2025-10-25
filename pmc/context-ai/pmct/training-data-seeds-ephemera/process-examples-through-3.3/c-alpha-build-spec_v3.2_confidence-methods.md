# Chunk Alpha - Confidence Score Methodology Specification v1.0
**Date:** October 5, 2025  
**Purpose:** Define calculation methods for `generation_confidence_precision` and `generation_confidence_accuracy`  
**Status:** MVP - Simple First Iteration  
**Integration Point:** Build Prompt #3 (AI Dimension Generation)

---

## OVERVIEW

This specification defines how to calculate confidence scores for AI-generated chunk dimensions. These scores are **CRITICAL** for the dashboard's "Things We Know" vs "Things We Need to Know" categorization.

**Design Philosophy:**
- Keep it simple for the first iteration
- Easy to replace with more sophisticated methods later
- Focus on functionality over perfection
- Provide meaningful differentiation for testing

---

## CONFIDENCE SCORE DEFINITIONS

### Scale: 1-10 Integer Values

Both confidence scores use a **1-10 integer scale**:
- **10** = Highest confidence (perfect/complete)
- **8-9** = High confidence (appears in "Things We Know" - green section)
- **5-7** = Moderate confidence (appears in "Things We Need to Know" - orange section)
- **1-4** = Low confidence (appears in "Things We Need to Know" - orange section)

### Threshold for Dashboard Display

**Dashboard Logic:**
- `generation_confidence_accuracy >= 8` → **"Things We Know"** (green background)
- `generation_confidence_accuracy < 8` → **"Things We Need to Know"** (orange background)

---

## PRECISION SCORE CALCULATION

**Definition:** Measures completeness of dimension generation - how many expected fields were populated.

### Method: Field Completeness Ratio

```typescript
/**
 * Calculate precision score based on field completeness
 * Returns: Integer 1-10
 */
function calculatePrecisionScore(
  dimensions: Partial<ChunkDimensions>,
  chunkType: ChunkType
): number {
  // Define expected fields based on chunk type
  const expectedFieldsByType = {
    'Chapter_Sequential': [
      'chunk_summary_1s',
      'key_terms',
      'audience',
      'intent',
      'tone_voice_tags',
      'brand_persona_tags',
      'domain_tags',
      'coverage_tag',
      'novelty_tag',
      'ip_sensitivity',
    ],
    'Instructional_Unit': [
      'chunk_summary_1s',
      'key_terms',
      'task_name',
      'preconditions',
      'inputs',
      'steps_json',
      'expected_output',
      'warnings_failure_modes',
      'audience',
      'coverage_tag',
    ],
    'CER': [
      'chunk_summary_1s',
      'claim',
      'evidence_snippets',
      'reasoning_sketch',
      'citations',
      'factual_confidence_0_1',
      'audience',
      'coverage_tag',
      'novelty_tag',
      'ip_sensitivity',
    ],
    'Example_Scenario': [
      'chunk_summary_1s',
      'scenario_type',
      'problem_context',
      'solution_action',
      'outcome_metrics',
      'style_notes',
      'audience',
      'key_terms',
      'coverage_tag',
      'novelty_tag',
    ],
  };

  const expectedFields = expectedFieldsByType[chunkType] || [];
  
  // Count populated fields
  let populatedCount = 0;
  expectedFields.forEach(fieldName => {
    const value = dimensions[fieldName as keyof ChunkDimensions];
    
    // Check if field is meaningfully populated
    if (isFieldPopulated(value)) {
      populatedCount++;
    }
  });

  // Calculate ratio and convert to 1-10 scale
  const ratio = populatedCount / expectedFields.length;
  const score = Math.round(ratio * 10);
  
  // Ensure score is between 1 and 10
  return Math.max(1, Math.min(10, score));
}

/**
 * Helper: Check if a field value is meaningfully populated
 */
function isFieldPopulated(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
}
```

### Example Results

| Populated Fields | Expected Fields | Ratio | Precision Score |
|-----------------|----------------|-------|-----------------|
| 10 | 10 | 1.0 | 10 |
| 9 | 10 | 0.9 | 9 |
| 8 | 10 | 0.8 | 8 |
| 7 | 10 | 0.7 | 7 |
| 5 | 10 | 0.5 | 5 |
| 3 | 10 | 0.3 | 3 |
| 0 | 10 | 0.0 | 1 (minimum) |

---

## ACCURACY SCORE CALCULATION

**Definition:** Subjective assessment of dimension quality and relevance - how well the AI understood the content.

### Method: Precision-Based with Variance (MVP Approach)

For the **first iteration**, we'll base accuracy on precision with controlled variance to create realistic test data. In future iterations, this can be replaced with:
- AI self-assessment prompts
- Human quality ratings
- Semantic similarity checks
- Cross-validation against ground truth

```typescript
/**
 * Calculate accuracy score - MVP version uses precision with variance
 * Returns: Integer 1-10
 * 
 * FUTURE: Replace with AI self-assessment or human rating
 */
function calculateAccuracyScore(
  dimensions: Partial<ChunkDimensions>,
  chunkType: ChunkType,
  precisionScore: number
): number {
  // Start with precision score as baseline
  let score = precisionScore;
  
  // Add controlled variance to simulate quality assessment
  // This creates differentiation for testing purposes
  const variance = generateControlledVariance();
  score = score + variance;
  
  // Ensure score stays within 1-10 range
  return Math.max(1, Math.min(10, score));
}

/**
 * Generate controlled variance for accuracy testing
 * Returns: Integer between -2 and +2
 */
function generateControlledVariance(): number {
  // Use a weighted random to favor slight positive variance
  const random = Math.random();
  
  if (random < 0.1) return -2;      // 10% chance of -2
  if (random < 0.25) return -1;     // 15% chance of -1
  if (random < 0.65) return 0;      // 40% chance of 0 (same as precision)
  if (random < 0.9) return 1;       // 25% chance of +1
  return 2;                         // 10% chance of +2
}
```

### Example Results

| Precision Score | Variance | Accuracy Score | Displayed In |
|----------------|----------|----------------|--------------|
| 10 | +0 | 10 | Things We Know |
| 9 | +1 | 10 | Things We Know |
| 8 | +0 | 8 | Things We Know |
| 8 | -1 | 7 | Things We Need to Know |
| 7 | +1 | 8 | Things We Know |
| 5 | +0 | 5 | Things We Need to Know |
| 3 | +2 | 5 | Things We Need to Know |

---

## IMPLEMENTATION INSTRUCTIONS

### Integration Point

These methods should be added to `src/lib/dimension-generation/generator.ts` in the `DimensionGenerator` class.

### Step 1: Add Private Methods

Add these two private methods after the `mapResponseToDimensions` method:

```typescript
/**
 * Calculate precision score (1-10) based on field completeness
 */
private calculatePrecisionScore(
  dimensions: Partial<ChunkDimensions>,
  chunkType: ChunkType
): number {
  // [Insert full implementation from above]
}

/**
 * Calculate accuracy score (1-10) using precision with variance
 */
private calculateAccuracyScore(
  dimensions: Partial<ChunkDimensions>,
  chunkType: ChunkType,
  precisionScore: number
): number {
  // [Insert full implementation from above]
}

/**
 * Helper: Check if a field is meaningfully populated
 */
private isFieldPopulated(value: any): boolean {
  // [Insert helper implementation from above]
}

/**
 * Generate controlled variance for accuracy testing
 */
private generateControlledVariance(): number {
  // [Insert variance implementation from above]
}
```

### Step 2: Update Dimension Generation

In the `generateDimensionsForChunk` method, replace the null assignments:

**BEFORE (lines ~1901-1904):**
```typescript
// Meta-dimensions
generation_confidence_precision: null,
generation_confidence_accuracy: null,
```

**AFTER:**
```typescript
// Meta-dimensions - Calculate confidence scores
const precisionScore = this.calculatePrecisionScore(dimensions, chunk.chunk_type);
const accuracyScore = this.calculateAccuracyScore(dimensions, chunk.chunk_type, precisionScore);

dimensions.generation_confidence_precision = precisionScore;
dimensions.generation_confidence_accuracy = accuracyScore;
```

### Step 3: Ensure Scores Are Stored

Verify that the dimensions object with confidence scores is saved to the database:

```typescript
// Save to database (should already exist in code)
await chunkDimensionService.createDimensions(dimensions as Omit<ChunkDimensions, 'id' | 'generated_at'>);
```

---

## COMPONENT MODULARITY

**Making Components Easy to Replace:**

### File Structure for Future Replacement

Create confidence calculation as a **separate, swappable module**:

```
src/lib/dimension-generation/
├── generator.ts              # Main dimension generator
├── confidence/               # ← NEW: Confidence calculation module
│   ├── index.ts             # Exports current implementation
│   ├── v1-field-completeness.ts   # Current MVP method
│   └── README.md            # How to replace with new methods
```

### Interface Definition

Define a standard interface for confidence calculators:

```typescript
// src/lib/dimension-generation/confidence/index.ts

export interface ConfidenceCalculator {
  calculatePrecision(
    dimensions: Partial<ChunkDimensions>,
    chunkType: ChunkType
  ): number;
  
  calculateAccuracy(
    dimensions: Partial<ChunkDimensions>,
    chunkType: ChunkType,
    precisionScore: number
  ): number;
}

// Export current implementation
export { FieldCompletenessCalculator } from './v1-field-completeness';

// Default export for easy swapping
export const confidenceCalculator = new FieldCompletenessCalculator();
```

### Using the Swappable Module

In `generator.ts`:

```typescript
import { confidenceCalculator } from './confidence';

// In generateDimensionsForChunk method:
const precisionScore = confidenceCalculator.calculatePrecision(dimensions, chunk.chunk_type);
const accuracyScore = confidenceCalculator.calculateAccuracy(dimensions, chunk.chunk_type, precisionScore);
```

### How to Replace in Future

To implement a new confidence methodology:

1. Create new file: `src/lib/dimension-generation/confidence/v2-your-method.ts`
2. Implement the `ConfidenceCalculator` interface
3. Update the default export in `confidence/index.ts`:
   ```typescript
   export { YourNewCalculator } from './v2-your-method';
   export const confidenceCalculator = new YourNewCalculator();
   ```
4. No changes needed in `generator.ts` - it uses the interface

**That's it!** The system automatically uses the new method.

---

## FUTURE ENHANCEMENT IDEAS

When ready to improve confidence calculation, consider:

### Option 1: AI Self-Assessment
Add a final prompt asking Claude to rate its own confidence:
```
"On a scale of 1-10, how confident are you in the accuracy of these dimensions?"
```

### Option 2: Semantic Validation
- Extract key claims from dimensions
- Cross-check against original chunk text
- Lower score if claims not found in source

### Option 3: Multi-Model Consensus
- Generate dimensions with 2+ different models
- Compare results
- Higher confidence when models agree

### Option 4: Human-in-the-Loop
- Display dimensions to human reviewer
- Allow quick thumbs up/down rating
- Store ratings as ground truth

### Option 5: Domain-Specific Rules
- Define quality criteria per dimension type
- E.g., "key_terms must have 3-7 items"
- Check compliance, adjust score accordingly

### Option 6: Historical Performance
- Track accuracy over time
- Identify which dimension types are consistently good/bad
- Adjust scores based on historical patterns

---

## TESTING & VALIDATION

### Unit Tests to Create

```typescript
describe('Confidence Score Calculation', () => {
  test('Precision score: all fields populated → 10', () => {
    const dimensions = { /* all expected fields filled */ };
    expect(calculatePrecisionScore(dimensions, 'Chapter_Sequential')).toBe(10);
  });

  test('Precision score: half fields populated → 5', () => {
    const dimensions = { /* 5 of 10 fields filled */ };
    expect(calculatePrecisionScore(dimensions, 'Chapter_Sequential')).toBe(5);
  });

  test('Precision score: no fields populated → 1', () => {
    const dimensions = {};
    expect(calculatePrecisionScore(dimensions, 'Chapter_Sequential')).toBe(1);
  });

  test('Accuracy score: stays within 1-10 range', () => {
    for (let i = 0; i < 100; i++) {
      const score = calculateAccuracyScore({}, 'CER', 5);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    }
  });

  test('Accuracy score: generally near precision score', () => {
    const precisionScore = 7;
    const scores = [];
    for (let i = 0; i < 100; i++) {
      scores.push(calculateAccuracyScore({}, 'CER', precisionScore));
    }
    const avgScore = scores.reduce((a, b) => a + b) / scores.length;
    expect(Math.abs(avgScore - precisionScore)).toBeLessThan(2);
  });
});
```

### Integration Test

```typescript
describe('Confidence Scores in Dashboard', () => {
  test('High confidence dimensions appear in "Things We Know"', async () => {
    const chunk = await createTestChunk();
    const dimensions = await generateDimensions(chunk);
    
    // Confidence >= 8 should be in green section
    expect(dimensions.generation_confidence_accuracy).toBeGreaterThanOrEqual(8);
    
    const dashboard = render(<ChunkDashboard chunk={chunk} />);
    expect(dashboard.getByText('Things We Know')).toBeInTheDocument();
  });

  test('Low confidence dimensions appear in "Things We Need to Know"', async () => {
    const chunk = await createTestChunk();
    const dimensions = await generateDimensions(chunk);
    
    // Force low confidence for testing
    dimensions.generation_confidence_accuracy = 5;
    
    const dashboard = render(<ChunkDashboard chunk={chunk} />);
    expect(dashboard.getByText('Things We Need to Know')).toBeInTheDocument();
  });
});
```

---

## SUMMARY

### What This Spec Provides

✅ **Simple, working methodology** for confidence score calculation  
✅ **Clear 1-10 scale** with meaningful thresholds  
✅ **Easy-to-implement** code examples  
✅ **Modular design** for future replacement  
✅ **Dashboard integration** guidance  
✅ **Testing strategy** for validation  

### What to Do Next

1. **Coding Agent**: Implement methods in Build Prompt #3
2. **Test**: Verify scores are calculated and stored
3. **Validate**: Check dashboard displays correctly
4. **Iterate**: Replace with better methods when ready

### Key Takeaway

This is an **MVP methodology** designed to:
- Get the system working NOW
- Be replaced EASILY later
- Provide USEFUL differentiation for testing
- Not over-engineer for the first iteration

**The confidence scores don't need to be perfect - they just need to be functional enough to test the system and UI.**

---

**END OF CONFIDENCE METHODOLOGY SPECIFICATION**

*Version: 1.0 - MVP Implementation*  
*Date: October 5, 2025*  
*Status: Ready for Integration*
