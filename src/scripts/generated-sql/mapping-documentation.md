# Data Transformation Mapping Documentation

Generated: 2025-11-09T07:00:50.967Z

## Overview

This document describes how data from the LoRA training JSON files is mapped to the train-data application's database schema.

## Source Data Structure

### JSON File Structure
```
{
  "dataset_metadata": { ... },
  "consultant_profile": { ... },
  "training_pairs": [ ... ]
}
```

### Training Pair Structure
Each training pair contains:
- `id`: Unique identifier for the turn
- `conversation_id`: Identifier for the conversation
- `turn_number`: Turn number in conversation
- `conversation_metadata`: Client persona, background, context
- `emotional_context`: Detected emotions and analysis
- `response_strategy`: How to respond
- `target_response`: The actual response text
- `training_metadata`: Quality scores and learning objectives

## Field Mappings

### Conversations Table

| Database Field | Source | Transformation |
|---|---|---|
| `id` | Generated | UUID v4 |
| `conversation_id` | `training_pair.conversation_id` | Direct mapping |
| `title` | Derived | "${persona}: ${topic} (Turn ${n})" |
| `persona` | `conversation_metadata.client_persona` | Direct mapping |
| `emotion` | `emotional_context.detected_emotions.primary` | Direct mapping |
| `topic` | `dataset_metadata.notes` or `conversation_phase` | Extracted/derived |
| `intent` | `conversation_metadata.expected_outcome` | Direct mapping |
| `tone` | `response_strategy.tone_selection` | Direct mapping |
| `tier` | Derived | Based on quality_score (9+ = template, 7-9 = scenario, <7 = edge_case) |
| `status` | Generated | Random distribution (40% approved, 30% pending_review, 20% generated, 10% needs_revision) |
| `category` | Derived | Array: [vertical, conversation_phase, emotion] |
| `quality_score` | `training_metadata.quality_score` | Converted from 5-point to 10-point scale (×2) |
| `quality_metrics` | `training_metadata.quality_criteria` | Mapped to detailed quality metrics object |
| `confidence_level` | Fixed | 'high' (all seed data is high quality) |
| `turn_count` | `training_pair.turn_number` | Direct mapping |
| `total_tokens` | Calculated | Sum of estimated tokens from user input + response (length / 4) |
| `estimated_cost_usd` | Calculated | (total_tokens / 1000) × 0.015 |
| `generation_duration_ms` | Generated | Random between 2000-7000ms |
| `approved_by` | Conditional | Mock user UUID if status = 'approved' |
| `approved_at` | Conditional | Timestamp if status = 'approved' |
| `reviewer_notes` | `training_metadata.reviewer_notes` | If status = 'approved' |
| `parent_id` | Linked | UUID of template if tier = 'template' |
| `parent_type` | Conditional | 'template' if linked |
| `parameters` | Composite | JSONB object with metadata, emotional context, strategy |
| `review_history` | Generated | Array of review actions based on status |
| `error_message` | Conditional | Set if status = 'failed' |
| `retry_count` | Fixed | 0 |
| `created_at` | Generated | ISO timestamp distributed over last 30 days |
| `updated_at` | Same as created_at | ISO timestamp |
| `created_by` | Fixed | Mock user UUID |

### Templates Table

| Database Field | Source | Transformation |
|---|---|---|
| `id` | Generated | UUID v4 |
| `template_name` | Derived | "${strategy_name} - ${consultant_name}" |
| `description` | `response_strategy.primary_rationale` | Direct mapping |
| `category` | `dataset_metadata.vertical` | Direct mapping |
| `tier` | Fixed | 'template' |
| `template_text` | `system_prompt` | Direct mapping |
| `structure` | `response_breakdown.structure_type` | Direct mapping |
| `variables` | `consultant_profile` + `response_strategy` | Composite JSONB |
| `tone` | `consultant_profile.communication_style.tone` | Direct mapping |
| `complexity_baseline` | Fixed | 7.5 |
| `style_notes` | `consultant_profile.core_philosophy` + `communication_style` | Composite JSONB |
| `example_conversation` | First `training_pair` | user_input + target_response |
| `quality_threshold` | Fixed | Minimum scores object |
| `required_elements` | Derived | From consultant communication principles |
| `applicable_personas` | Derived | From consultant expertise |
| `applicable_emotions` | Derived | From training pairs emotional contexts |
| `applicable_topics` | Derived | From dataset metadata and pairs |
| `usage_count` | Fixed | 0 |
| `rating` | Fixed | 4.8 |
| `success_rate` | Fixed | 95.0 |
| `version` | Fixed | 1 |
| `is_active` | Fixed | true |
| `created_at` | Generated | Current timestamp |
| `updated_at` | Same as created_at | Current timestamp |
| `created_by` | Fixed | Mock user object (JSONB) |
| `last_modified_by` | Same as created_by | Mock user object |
| `last_modified` | Same as created_at | Current timestamp |

## Data Quality Transformations

### Quality Score Conversion
- Source: 5-point scale (1-5)
- Target: 10-point scale (0-10)
- Formula: source_score × 2

### Token Estimation
- Source: Text content (user input + response)
- Formula: Math.ceil(text.length / 4)
- Rationale: Rough estimate of 4 characters per token

### Status Distribution
- 40% approved
- 30% pending_review
- 20% generated
- 10% needs_revision

### Tier Assignment
- quality_score >= 9.0: 'template'
- quality_score >= 7.0: 'scenario'
- quality_score < 7.0: 'edge_case'

### Timestamp Generation
- Distributed over last 30 days
- Each conversation gets unique timestamp
- Variation added for hours/minutes

## Review History Generation

### For Approved Conversations
1. **Generated** action (2 days before approval)
2. **Moved to review** action (1 day before approval)
3. **Approved** action (at created_at timestamp)

### For Pending Review
1. **Generated** action (1 day before)
2. **Moved to review** action (at created_at)

### For Generated
1. **Generated** action (at created_at)

## Template Extraction Logic

One template is created per unique consultant profile (consultant_name):

1. **Identify unique consultant** from consultant_profile.name
2. **Extract primary strategy** from first training_pair.response_strategy
3. **Build template name** from strategy + consultant name
4. **Populate template fields** from consultant profile and first training pair
5. **Link conversations** with tier='template' to parent template via parent_id

## Validation Rules

### Required Fields (NOT NULL)
- id, conversation_id, persona, emotion, tier, status
- turn_count, total_tokens, retry_count
- created_at, updated_at, created_by

### UUID Validation
- All UUIDs must match pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

### Enum Validation
- tier: must be in ['template', 'scenario', 'edge_case']
- status: must be in ['draft', 'generated', 'pending_review', 'approved', 'rejected', 'needs_revision', 'failed']
- confidence_level: must be in ['high', 'medium', 'low']

### JSONB Validation
- All JSONB fields must contain valid JSON
- parameters, quality_metrics, review_history must be objects/arrays

### Numeric Validation
- quality_score: 0.0 - 10.0
- total_tokens: > 0
- turn_count: > 0

## SQL Escaping

All text fields are escaped for SQL injection prevention:
- Single quotes are doubled: ' → ''
- Example: "It's okay" → "It''s okay"

## Statistics

After processing all files, the script outputs:
- Total files processed
- Total conversations created
- Total turns processed
- Breakdown by status
- Breakdown by tier
- Average quality score
- Total tokens
- Total templates created
