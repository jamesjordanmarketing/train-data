# Prompt 6: Single Generation & Regeneration - Quick Start Guide

## Quick Access

### Open Single Generation Form
```typescript
// Method 1: From Dashboard
Click "Generate" button in dashboard header
→ Opens SingleGenerationForm modal

// Method 2: From Store
import { useAppStore } from './stores/useAppStore';
const { openGenerationModal } = useAppStore();
openGenerationModal();
```

### Regenerate Existing Conversation
```typescript
// From Conversation Table
1. Navigate to any conversation row
2. Click three-dot menu (MoreVertical icon)
3. Select "Regenerate" option
→ Opens pre-filled SingleGenerationForm
```

## Component Import Paths

```typescript
// Single Generation Form
import { SingleGenerationForm } from './components/generation/SingleGenerationForm';

// Template Preview
import { TemplatePreview } from './components/generation/TemplatePreview';

// Conversation Preview
import { ConversationPreview } from './components/generation/ConversationPreview';

// AI Utilities
import { 
  generatePreview, 
  validateParameters, 
  PERSONA_OPTIONS, 
  EMOTION_OPTIONS,
  INTENT_OPTIONS,
  TONE_OPTIONS 
} from './lib/ai';
```

## Form Field Reference

### Required Fields
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| **Persona** | Dropdown | 15 options | User persona type (e.g., "Mid-career professional") |
| **Emotion** | Dropdown | 14 options | Emotional state (e.g., "Curious", "Frustrated") |
| **Topic** | Textarea | Max 500 chars | What the conversation should cover |
| **Intent** | Dropdown | 10 options | User's goal (e.g., "Learn", "Troubleshoot") |
| **Tone** | Dropdown | 10 options | Conversation style (e.g., "Professional", "Friendly") |

### Optional Fields
| Field | Type | Description |
|-------|------|-------------|
| **Template** | Dropdown | Pre-defined conversation template |
| **Template Parameters** | Dynamic | Based on selected template variables |
| **Custom Parameters** | Key-Value Pairs | Additional user-defined parameters |

## Predefined Options

### Personas (15 options)
```typescript
'Young professional'
'Mid-career professional'
'Senior executive'
'Small business owner'
'Freelancer'
'Student'
'Recent graduate'
'Stay-at-home parent'
'Retiree'
'Technical expert'
'Non-technical user'
'Budget-conscious individual'
'High-income earner'
'First-time user'
'Power user'
```

### Emotions (14 options)
```typescript
'Curious'
'Confused'
'Frustrated'
'Excited'
'Worried'
'Confident'
'Overwhelmed'
'Satisfied'
'Anxious'
'Hopeful'
'Neutral'
'Determined'
'Skeptical'
'Relieved'
```

### Intents (10 options)
```typescript
'Learn'
'Troubleshoot'
'Compare options'
'Get recommendation'
'Understand concept'
'Solve problem'
'Make decision'
'Explore features'
'Get started'
'Optimize process'
```

### Tones (10 options)
```typescript
'Professional'
'Casual'
'Formal'
'Friendly'
'Technical'
'Empathetic'
'Direct'
'Educational'
'Consultative'
'Enthusiastic'
```

## Example Workflows

### Example 1: Basic Generation (No Template)

```typescript
// Step-by-step user actions:
1. Click "Generate" button
2. Leave Template as "None"
3. Select Persona: "Technical expert"
4. Select Emotion: "Confident"
5. Enter Topic: "How to implement JWT authentication in Node.js"
6. Select Intent: "Learn"
7. Select Tone: "Technical"
8. Click "Generate Conversation"
9. Wait 15-45 seconds
10. Review conversation preview
11. Click "Save Conversation"

// Result:
- New conversation added to dashboard
- Quality score calculated (7-9.5 range)
- Toast notification: "Conversation saved to dashboard"
```

### Example 2: Generation with Template

```typescript
// Step-by-step user actions:
1. Click "Generate" button
2. Select Template: "Technical Troubleshooting"
3. Fill Template Parameters:
   - symptom_description: "API returns 401 errors"
   - diagnostic_step: "check API key configuration"
   - follow_up_question: "Are you including Authorization header?"
4. (Optional) Click "Auto-fill" to populate sample values
5. Preview shows resolved template with parameters
6. Select Persona: "Technical Developer"
7. Select Emotion: "Frustrated"
8. Enter Topic: "API authentication issues"
9. Select Intent: "Troubleshoot"
10. Select Tone: "Technical"
11. Click "Generate Conversation"
12. Review and Save

// Result:
- Conversation generated using template structure
- Template parameters resolved in conversation
- Quality score reflects template quality threshold
```

### Example 3: Custom Parameters

```typescript
// Step-by-step user actions:
1. Open generation form
2. Fill core parameters (persona, emotion, etc.)
3. Scroll to "Custom Parameters" section
4. Enter Key: "difficulty_level"
5. Enter Value: "intermediate"
6. Click "Add Custom Parameter"
7. Add another: Key: "time_constraint", Value: "30 minutes"
8. Verify both parameters appear in list
9. Click "Generate Conversation"

// Result:
- Custom parameters stored in conversation.parameters.customParameters
- Can be used for filtering and analytics later
```

### Example 4: Regeneration

```typescript
// Step-by-step user actions:
1. Navigate to Conversations Dashboard
2. Find conversation: "Marcus-Roth-Confusion"
3. Click three-dot menu → "Regenerate"
4. Form opens with pre-filled values:
   - Persona: "Mid-career professional"
   - Emotion: "Confusion"
   - Topic: (original topic)
   - Intent: (original intent)
   - Tone: (original tone)
5. Modify Emotion: "Confusion" → "Confident"
6. Modify Tone: "Professional" → "Friendly"
7. Click "Regenerate Conversation"
8. Wait for generation
9. Review new version
10. Click "Save Conversation"

// Result:
- Original conversation: Status updated to 'archived'
- New conversation created with:
  - parentId: "conv-original-id"
  - Modified parameters
  - New quality score
- Toast: "Conversation regenerated and saved"
```

## Template Preview Features

### Live Preview
```typescript
// As user types in template parameters:
1. Template: "User: I need help with {{issue_type}}"
2. User enters issue_type: "password reset"
3. Preview updates: "User: I need help with password reset"

// Placeholder Highlighting:
- Unfilled placeholders: Yellow background
- Filled placeholders: Normal text
- Toggle visibility with "Show/Hide Placeholders" button
```

### Validation Errors
```typescript
// Missing required parameter:
Preview shows:
❌ Required parameter "issue_type" is missing

// Unknown placeholder:
Preview shows:
❌ Unknown placeholder "{{undefined_param}}" found in template
```

## Conversation Preview Features

### Quality Score Color Coding
```typescript
score >= 8.0: Green (Excellent)
score >= 6.0: Yellow (Good/Fair)
score < 6.0:  Red (Needs Improvement)
```

### Metadata Display
```typescript
// Top cards show:
1. Quality Score: 8.5/10 (with color)
2. Total Turns: 4
3. Total Tokens: 145
4. Status: Badge (Excellent/Good/Fair)
```

### Quality Metrics Breakdown
```typescript
// Detailed metrics:
- Relevance: 8.2/10
- Accuracy: 8.5/10
- Naturalness: 8.3/10
- Coherence: 8.7/10
- Confidence: High
- Training Value: High
```

### Conversation Turns
```typescript
// Display format:
[User Icon] USER (45 tokens)
"I need help with JWT authentication"

[Bot Icon] ASSISTANT (100 tokens)
"I'd be happy to help you implement JWT authentication..."

// Features:
- Show first 4 turns by default
- "Show All Turns" button if > 4 turns
- Scrollable area for long conversations
```

## API Endpoints (For Production Integration)

### Generation Endpoint
```typescript
POST /api/conversations/generate

Headers:
  Content-Type: application/json
  Authorization: Bearer <token>

Body:
{
  "templateId": "template-1",           // optional
  "persona": "Technical expert",
  "emotion": "Confident",
  "topic": "JWT authentication",
  "intent": "Learn",
  "tone": "Technical",
  "templateParameters": {               // if template selected
    "param1": "value1"
  },
  "customParameters": {                 // optional
    "difficulty": "intermediate"
  },
  "tier": "template"
}

Response 200:
{
  "conversation": {
    "id": "conv-12345",
    "title": "JWT authentication",
    "persona": "Technical expert",
    "emotion": "Confident",
    "qualityScore": 8.5,
    "turns": [...],
    "totalTurns": 4,
    "totalTokens": 145,
    "status": "generated",
    // ... full Conversation object
  }
}

Response 400:
{
  "error": "Validation failed: Missing required field 'persona'"
}

Response 500:
{
  "error": "Generation service unavailable"
}
```

### Regeneration Endpoint
```typescript
POST /api/conversations/:id/regenerate

Headers:
  Content-Type: application/json
  Authorization: Bearer <token>

Body:
{
  // Same as generation endpoint
  "persona": "Technical expert",
  "emotion": "Frustrated",  // modified
  // ... other parameters
}

Response 200:
{
  "conversation": {
    "id": "conv-67890",
    "parentId": "conv-12345",  // links to original
    "title": "JWT authentication",
    // ... rest of conversation
  },
  "archivedOriginal": true
}

// Original conversation (conv-12345) status → 'archived'
```

## Common Use Cases

### Use Case 1: Quick Test Generation
```
Goal: Generate a test conversation quickly
Steps:
1. Open modal
2. Select predefined persona, emotion, intent, tone
3. Enter topic
4. Click Generate
Time: ~1 minute + generation time
```

### Use Case 2: Template-Based Generation
```
Goal: Generate conversation following specific structure
Steps:
1. Open modal
2. Select template
3. Fill template parameters (use Auto-fill for testing)
4. Fill core parameters
5. Review template preview
6. Click Generate
Time: ~2-3 minutes + generation time
```

### Use Case 3: Iterative Refinement
```
Goal: Generate, review, and regenerate with modifications
Steps:
1. Generate initial conversation
2. Review quality score and content
3. If unsatisfied, click "Regenerate" in preview
4. Modify parameters (e.g., change tone)
5. Generate again
6. Compare results
7. Save best version
Time: ~3-5 minutes per iteration
```

### Use Case 4: Version Management
```
Goal: Create multiple versions of same conversation
Steps:
1. Generate original conversation → Save
2. Find in dashboard → Regenerate
3. Modify parameters → Save (creates version 2)
4. Regenerate again → Save (creates version 3)
5. Each version has parentId linking to previous
6. Can track evolution through version chain
```

## Keyboard Shortcuts (Future Enhancement)

```typescript
// Suggested shortcuts:
Ctrl/Cmd + K: Open generation modal
Ctrl/Cmd + Enter: Submit form (generate)
Ctrl/Cmd + S: Save conversation
Esc: Close modal/preview
Tab: Navigate form fields
Ctrl/Cmd + P: Toggle template preview
```

## Troubleshooting

### Issue: Template preview not updating
**Solution**: Ensure all required template parameters are filled

### Issue: Generation fails with validation error
**Solution**: Check that all required fields (persona, emotion, topic, intent, tone) are filled

### Issue: Custom parameter won't add
**Solution**: Ensure both key and value are entered, and key is unique

### Issue: Regenerate button not appearing
**Solution**: Conversation must be in a valid state (not archived)

### Issue: Form closes unexpectedly
**Solution**: Click inside modal to prevent backdrop click from closing

## Performance Tips

1. **Large Templates**: Use template preview sparingly for very large templates (>1000 chars)
2. **Many Custom Parameters**: Limit to 10-15 custom parameters for optimal performance
3. **Long Topics**: Keep topic under 500 characters for best results
4. **Parallel Generation**: Don't open multiple generation modals simultaneously

## Best Practices

### For Template Users
1. ✅ Always review template preview before generating
2. ✅ Use Auto-fill to understand expected parameter format
3. ✅ Test with sample values first
4. ✅ Verify all required parameters are filled

### For Custom Parameters
1. ✅ Use descriptive keys (e.g., "target_audience" not "ta")
2. ✅ Keep values concise
3. ✅ Document custom parameters for team reference
4. ✅ Avoid duplicate keys

### For Regeneration
1. ✅ Review original conversation before regenerating
2. ✅ Change only necessary parameters
3. ✅ Compare quality scores before/after
4. ✅ Document reason for regeneration in notes

### For Quality
1. ✅ Aim for quality score > 7.5
2. ✅ Review conversation content, not just score
3. ✅ Regenerate if score < 6.0
4. ✅ Check all quality metrics (not just overall)

## Support & Resources

- **Component Docs**: See inline TypeScript comments
- **Type Definitions**: `train-wireframe/src/lib/types.ts`
- **AI Utils**: `train-wireframe/src/lib/ai.ts`
- **Mock Data**: `train-wireframe/src/lib/mockData.ts`
- **Implementation Guide**: `PROMPT-6-SINGLE-GENERATION-IMPLEMENTATION.md`

## Next Steps

After familiarizing yourself with single generation:
1. Explore batch generation for multiple conversations
2. Learn about template creation and management
3. Understand quality validation system
4. Review conversation analytics dashboard

---

**Quick Reference Card**

```
┌─────────────────────────────────────────┐
│ SINGLE GENERATION CHEAT SHEET          │
├─────────────────────────────────────────┤
│ Open:      Click "Generate" button     │
│ Template:  Optional dropdown            │
│ Required:  Persona, Emotion, Topic,    │
│            Intent, Tone                 │
│ Optional:  Custom Parameters           │
│ Preview:   Live template resolution    │
│ Generate:  15-45 seconds               │
│ Save:      Adds to dashboard           │
│                                        │
│ REGENERATE                             │
│ Access:    3-dot menu → Regenerate     │
│ Pre-fills: All original parameters     │
│ Modify:    Any parameter               │
│ Result:    New version with parentId   │
│ Original:  Status → archived           │
└─────────────────────────────────────────┘
```

