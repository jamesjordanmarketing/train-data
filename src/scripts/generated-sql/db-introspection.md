# Database Introspection Report

**Generated**: 2025-11-09T21:45:49.865Z

**Method**: Supabase Client Direct Probing

**Database**: https://hqhtbxlgzysfbekexwku.supabase.co


*Note: This method infers schema from actual data. Types are approximate.*


## Discovered Tables

Found **24** accessible tables:

- templates
- conversations
- scenarios
- edge_cases
- turns
- reviews
- categories
- personas
- emotions
- topics
- conversation_templates
- template_scenarios
- scenario_edge_cases
- export_logs
- ai_configs
- settings
- documents
- chunks
- tags
- workflow_sessions
- document_categories
- document_tags
- custom_tags
- tag_dimensions


---


# TEMPLATES TABLE ANALYSIS


## TEMPLATES - ✅ EXISTS

**Row Count**: 6

**Column Count**: 27


## Columns (inferred from sample data)

| Column Name | Inferred Type | Nullable | Sample Value |
| --- | --- | --- | --- |
| id | uuid | NO | "322f3ad4-7aad-41e6-b3d9-610a231122cf" |
| template_name | text (max 26) | NO | "Financial Planning Triumph" |
| description | text (max 58) | NO | "Conversation showing successful financial plannin |
| category | text (max 18) | NO | "Financial Planning" |
| tier | text (max 8) | NO | "template" |
| template_text | text (max 124) | NO | "Generate a conversation between a financial advis |
| structure | text (max 87) | NO | "Introduction → Problem Identification → Strategy  |
| variables | array | NO | [] |
| tone | text (max 27) | NO | "Professional yet empathetic" |
| complexity_baseline | integer | NO | 7 |
| style_notes | NULL (type unknown) | YES | NULL |
| example_conversation | NULL (type unknown) | YES | NULL |
| quality_threshold | NULL (type unknown) | YES | NULL |
| required_elements | NULL (type unknown) | YES | NULL |
| applicable_personas | NULL (type unknown) | YES | NULL |
| applicable_emotions | NULL (type unknown) | YES | NULL |
| applicable_topics | NULL (type unknown) | YES | NULL |
| usage_count | integer | NO | 0 |
| rating | integer | NO | 0 |
| success_rate | integer | NO | 0 |
| version | integer | NO | 1 |
| is_active | boolean | NO | true |
| created_at | timestamp | NO | "2025-10-29T22:17:56.235+00:00" |
| updated_at | timestamp | NO | "2025-10-29T22:17:56.235+00:00" |
| created_by | NULL (type unknown) | YES | NULL |
| last_modified_by | NULL (type unknown) | YES | NULL |
| last_modified | timestamp | NO | "2025-11-01T21:03:55.700842+00:00" |


## Required Columns Check

✅ All required columns present: id, template_name, description, category, tier, template_text


## Sample Record

```json
{
  "id": "322f3ad4-7aad-41e6-b3d9-610a231122cf",
  "template_name": "Financial Planning Triumph",
  "description": "Conversation showing successful financial planning journey",
  "category": "Financial Planning",
  "tier": "template",
  "template_text": "Generate a conversation between a financial advisor and {{persona}} about {{topic}}, with emotional arc showing {{emotion}}.",
  "structure": "Introduction → Problem Identification → Strategy Development → Implementation → Success",
  "variables": [],
  "tone": "Professional yet empathetic",
  "complexity_baseline": 7,
  "style_notes": null,
  "example_conversation": null,
  "quality_threshold": null,
  "required_elements": null,
  "applicable_personas": null,
  "applicable_emotions": null,
  "applicable_topics": null,
  "usage_count": 0,
  "rating": 0,
  "success_rate": 0,
  "version": 1,
  "is_active": true,
  "created_at": "2025-10-29T22:17:56.235+00:00",
  "updated_at": "2025-10-29T22:17:56.235+00:00",
  "created_by": null,
  "last_modified_by": null,
  "last_modified": "2025-11-01T21:03:55.700842+00:00"
}
```


---


# CONVERSATIONS TABLE ANALYSIS


## CONVERSATIONS - ✅ EXISTS

**Row Count**: 0

**Column Count**: 0


## Columns (inferred from sample data)

*No columns found*


## Required Columns Check

⚠️ **Missing columns**: id, template_id, scenario_id, conversation_data, status

Present columns: 


---


# E02 COMPATIBILITY SUMMARY


## E02 Readiness


## ❌ COMPATIBILITY ISSUES DETECTED

⛔ **Conversations**: Missing columns: id, template_id, scenario_id, conversation_data, status

**HARD BLOCK**: Cannot proceed with E02 mock data insertion until issues are resolved.
