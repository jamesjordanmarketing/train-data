# Chunk Dimension Generation Prompts
**Version:** 1.0  
**Date:** 2025-10-03  
**Purpose:** Structured prompts for generating all AI-required dimensions from chunk text  
**Format:** JSON Schema Contract Style  

---

## ============ PROMPT 1: CONTENT ANALYSIS ============
### Purpose
Analyze chunk content for classification, summarization, and key information extraction.

### Generated Dimensions
- Chunk_Type
- Chunk_Summary_1s  
- Key_Terms
- Audience
- Intent
- Domain_Tags

### Input Context Structure
```json
{
  "document_context": {
    "doc_id": "{DOC_ID}",
    "doc_title": "{DOC_TITLE}", 
    "author": "{AUTHOR}",
    "primary_category": "{PRIMARY_CATEGORY}",
    "belonging_rating": {BELONGING_RATING},
    "doc_tags": {
      "authorship": "{AUTHORSHIP_TAG}",
      "format": "{FORMAT_TAG}",
      "disclosure_risk": "{DISCLOSURE_RISK_TAG}",
      "intended_use": ["{INTENDED_USE_TAGS}"],
      "audience": "{AUDIENCE_TAG}"
    }
  },
  "chunk_context": {
    "chunk_id": "{CHUNK_ID}",
    "section_heading": "{SECTION_HEADING}",
    "chunk_position": {
      "page_start": {PAGE_START},
      "page_end": {PAGE_END},
      "char_start": {CHAR_START},
      "char_end": {CHAR_END}
    },
    "chunk_text": "{CHUNK_TEXT}"
  }
}
```

### Prompt Template
```json
{
  "system_prompt": "You are an expert content analyst specializing in LoRA training data preparation. You understand business wisdom, proprietary knowledge, and how to identify valuable training content.",
  
  "user_prompt": "Analyze the following chunk of text from a business document and extract key classification and content dimensions. The document '{doc_title}' has been categorized as '{primary_category}' with a belonging rating of {belonging_rating}/5.\n\nChunk text:\n{chunk_text}\n\nProvide a comprehensive analysis following the specified schema.",
  
  "response_schema": {
    "type": "object",
    "required": ["chunk_type", "chunk_summary_1s", "key_terms", "audience", "intent", "domain_tags", "confidence_scores"],
    "properties": {
      "chunk_type": {
        "type": "string",
        "enum": ["Chapter_Sequential", "Instructional_Unit", "CER", "Example_Scenario"],
        "description": "Structural role of this chunk in the document"
      },
      "chunk_summary_1s": {
        "type": "string",
        "maxLength": 240,
        "description": "One-sentence summary (max 30 words) of the chunk's main point"
      },
      "key_terms": {
        "type": "array",
        "items": {"type": "string"},
        "minItems": 3,
        "maxItems": 10,
        "description": "Salient terms and concepts from the chunk"
      },
      "audience": {
        "type": "string",
        "description": "Intended reader/user persona for this content"
      },
      "intent": {
        "type": "string",
        "enum": ["educate", "instruct", "persuade", "inform", "narrate", "summarize", "compare", "evaluate"],
        "description": "Author's primary intent for this chunk"
      },
      "domain_tags": {
        "type": "array",
        "items": {"type": "string"},
        "minItems": 1,
        "maxItems": 5,
        "description": "Topic/domain taxonomy labels"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "chunk_type_confidence": {"type": "number", "minimum": 0, "maximum": 1},
          "overall_confidence": {"type": "number", "minimum": 0, "maximum": 1}
        }
      }
    }
  }
}
```

### Dimension Mapping
- `chunk_type` → Chunk_Type
- `chunk_summary_1s` → Chunk_Summary_1s
- `key_terms` → Key_Terms (join with pipe delimiter)
- `audience` → Audience
- `intent` → Intent
- `domain_tags` → Domain_Tags (join with comma delimiter)

---

## ============ PROMPT 2: STYLE & VOICE ANALYSIS ============
### Purpose
Extract style, tone, and brand voice characteristics from the chunk.

### Generated Dimensions
- Tone_Voice_Tags
- Brand_Persona_Tags
- Style_Notes

### Input Context Structure
```json
{
  "document_context": {
    "doc_title": "{DOC_TITLE}",
    "author": "{AUTHOR}",
    "primary_category": "{PRIMARY_CATEGORY}",
    "belonging_rating": {BELONGING_RATING}
  },
  "chunk_context": {
    "chunk_id": "{CHUNK_ID}",
    "chunk_text": "{CHUNK_TEXT}",
    "chunk_type": "{CHUNK_TYPE}"
  }
}
```

### Prompt Template
```json
{
  "system_prompt": "You are an expert in brand voice analysis and writing style assessment. You can identify subtle tone variations, brand personality traits, and stylistic patterns that make content distinctive.",
  
  "user_prompt": "Analyze the style and voice characteristics of this chunk from '{doc_title}'. This is a {chunk_type} chunk with belonging rating {belonging_rating}/5.\n\nChunk text:\n{chunk_text}\n\nExtract detailed style and voice attributes.",
  
  "response_schema": {
    "type": "object",
    "required": ["tone_voice_tags", "brand_persona_tags", "style_notes", "confidence_scores"],
    "properties": {
      "tone_voice_tags": {
        "type": "array",
        "items": {"type": "string"},
        "minItems": 2,
        "maxItems": 6,
        "description": "Style/voice descriptors (e.g., authoritative, conversational, technical)"
      },
      "brand_persona_tags": {
        "type": "array",
        "items": {"type": "string"},
        "minItems": 2,
        "maxItems": 5,
        "description": "Brand identity traits relevant to voice"
      },
      "style_notes": {
        "type": "string",
        "maxLength": 500,
        "description": "Narrative/style attributes to mimic, specific patterns observed"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "precision_confidence": {"type": "number", "minimum": 0, "maximum": 1},
          "accuracy_confidence": {"type": "number", "minimum": 0, "maximum": 1}
        }
      }
    }
  }
}
```

### Dimension Mapping
- `tone_voice_tags` → Tone_Voice_Tags (join with comma)
- `brand_persona_tags` → Brand_Persona_Tags (join with comma)
- `style_notes` → Style_Notes

---

## ============ PROMPT 3: INSTRUCTIONAL ANALYSIS ============
### Purpose
Extract task and instructional components from Instructional_Unit chunks.

### Generated Dimensions
- Task_Name
- Preconditions
- Inputs
- Steps_JSON
- Expected_Output
- Warnings_Failure_Modes

### Activation Condition
**Only run if Chunk_Type == "Instructional_Unit"**

### Input Context Structure
```json
{
  "document_context": {
    "doc_title": "{DOC_TITLE}",
    "primary_category": "{PRIMARY_CATEGORY}"
  },
  "chunk_context": {
    "chunk_id": "{CHUNK_ID}",
    "chunk_text": "{CHUNK_TEXT}",
    "section_heading": "{SECTION_HEADING}"
  }
}
```

### Prompt Template
```json
{
  "system_prompt": "You are an expert instructional designer who can extract procedural knowledge and create clear, actionable task breakdowns from business content.",
  
  "user_prompt": "Extract the instructional components from this chunk. Document: '{doc_title}', Section: '{section_heading}'.\n\nChunk text:\n{chunk_text}\n\nIdentify all task-related elements.",
  
  "response_schema": {
    "type": "object",
    "required": ["task_name", "preconditions", "inputs", "steps_json", "expected_output", "warnings_failure_modes", "confidence_scores"],
    "properties": {
      "task_name": {
        "type": "string",
        "description": "Primary task/procedure name"
      },
      "preconditions": {
        "type": "string",
        "description": "Requirements before executing the task"
      },
      "inputs": {
        "type": "string",
        "description": "Inputs/resources needed to perform the task"
      },
      "steps_json": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "step": {"type": "string"},
            "details": {"type": "string"}
          }
        },
        "description": "Canonical steps in structured format"
      },
      "expected_output": {
        "type": "string",
        "description": "What success looks like if steps are followed"
      },
      "warnings_failure_modes": {
        "type": "string",
        "description": "Known pitfalls and failure conditions"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "completeness": {"type": "number", "minimum": 0, "maximum": 1},
          "accuracy": {"type": "number", "minimum": 0, "maximum": 1}
        }
      }
    }
  }
}
```

### Dimension Mapping
- `task_name` → Task_Name
- `preconditions` → Preconditions
- `inputs` → Inputs
- `steps_json` → Steps_JSON (stringify)
- `expected_output` → Expected_Output
- `warnings_failure_modes` → Warnings_Failure_Modes

---

## ============ PROMPT 4: CLAIM-EVIDENCE-REASONING ============
### Purpose
Extract argumentative structure from CER chunks.

### Generated Dimensions
- Claim
- Evidence_Snippets
- Reasoning_Sketch
- Citations
- Factual_Confidence_0_1

### Activation Condition
**Only run if Chunk_Type == "CER"**

### Input Context Structure
```json
{
  "document_context": {
    "doc_title": "{DOC_TITLE}",
    "author": "{AUTHOR}"
  },
  "chunk_context": {
    "chunk_id": "{CHUNK_ID}",
    "chunk_text": "{CHUNK_TEXT}"
  }
}
```

### Prompt Template
```json
{
  "system_prompt": "You are an expert in argumentative analysis and evidence extraction. You can identify claims, supporting evidence, and reasoning patterns in business content.",
  
  "user_prompt": "Extract the claim-evidence-reasoning structure from this chunk. Document: '{doc_title}' by {author}.\n\nChunk text:\n{chunk_text}\n\nIdentify the main argument and supporting elements.",
  
  "response_schema": {
    "type": "object",
    "required": ["claim", "evidence_snippets", "reasoning_sketch", "citations", "factual_confidence", "confidence_scores"],
    "properties": {
      "claim": {
        "type": "string",
        "description": "Main assertion stated in this chunk"
      },
      "evidence_snippets": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Quoted or paraphrased evidence supporting the claim"
      },
      "reasoning_sketch": {
        "type": "string",
        "maxLength": 300,
        "description": "High-level rationale connecting evidence to claim"
      },
      "citations": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Sources/links/references supporting evidence"
      },
      "factual_confidence": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Confidence score for factuality"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "claim_clarity": {"type": "number", "minimum": 0, "maximum": 1},
          "evidence_strength": {"type": "number", "minimum": 0, "maximum": 1}
        }
      }
    }
  }
}
```

### Dimension Mapping
- `claim` → Claim
- `evidence_snippets` → Evidence_Snippets (join with pipe)
- `reasoning_sketch` → Reasoning_Sketch
- `citations` → Citations (join with comma)
- `factual_confidence` → Factual_Confidence_0_1

---

## ============ PROMPT 5: SCENARIO ANALYSIS ============
### Purpose
Extract example and scenario components from Example_Scenario chunks.

### Generated Dimensions
- Scenario_Type
- Problem_Context
- Solution_Action
- Outcome_Metrics

### Activation Condition
**Only run if Chunk_Type == "Example_Scenario"**

### Input Context Structure
```json
{
  "document_context": {
    "doc_title": "{DOC_TITLE}",
    "primary_category": "{PRIMARY_CATEGORY}"
  },
  "chunk_context": {
    "chunk_id": "{CHUNK_ID}",
    "chunk_text": "{CHUNK_TEXT}"
  }
}
```

### Prompt Template
```json
{
  "system_prompt": "You are an expert case study analyst who can extract problem-solution narratives and identify key success patterns from business examples.",
  
  "user_prompt": "Extract the scenario structure from this example chunk. Document: '{doc_title}'.\n\nChunk text:\n{chunk_text}\n\nIdentify the problem, solution, and outcomes.",
  
  "response_schema": {
    "type": "object",
    "required": ["scenario_type", "problem_context", "solution_action", "outcome_metrics", "confidence_scores"],
    "properties": {
      "scenario_type": {
        "type": "string",
        "enum": ["case_study", "dialogue", "Q&A", "walkthrough", "anecdote"],
        "description": "Type of example or application"
      },
      "problem_context": {
        "type": "string",
        "description": "Real-world context of the example"
      },
      "solution_action": {
        "type": "string",
        "description": "Action taken in the example"
      },
      "outcome_metrics": {
        "type": "string",
        "description": "Measured results or KPIs"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "scenario_completeness": {"type": "number", "minimum": 0, "maximum": 1},
          "metrics_reliability": {"type": "number", "minimum": 0, "maximum": 1}
        }
      }
    }
  }
}
```

### Dimension Mapping
- `scenario_type` → Scenario_Type
- `problem_context` → Problem_Context
- `solution_action` → Solution_Action
- `outcome_metrics` → Outcome_Metrics

---

## ============ PROMPT 6: TRAINING PAIR GENERATION ============
### Purpose
Generate potential training pairs from chunk content.

### Generated Dimensions
- Prompt_Candidate
- Target_Answer
- Style_Directives

### Input Context Structure
```json
{
  "document_context": {
    "doc_title": "{DOC_TITLE}",
    "author": "{AUTHOR}",
    "belonging_rating": {BELONGING_RATING},
    "primary_category": "{PRIMARY_CATEGORY}"
  },
  "chunk_context": {
    "chunk_id": "{CHUNK_ID}",
    "chunk_text": "{CHUNK_TEXT}",
    "chunk_type": "{CHUNK_TYPE}",
    "chunk_summary": "{CHUNK_SUMMARY_1S}"
  },
  "style_context": {
    "tone_voice_tags": ["{TONE_VOICE_TAGS}"],
    "brand_persona_tags": ["{BRAND_PERSONA_TAGS}"]
  }
}
```

### Prompt Template
```json
{
  "system_prompt": "You are an expert in creating LoRA training pairs that capture business wisdom and unique methodologies. You understand how to formulate prompts that would elicit the knowledge contained in the source material.",
  
  "user_prompt": "Generate a training pair from this chunk (belonging: {belonging_rating}/5). The content represents '{primary_category}' with style: {tone_voice_tags}.\n\nChunk summary: {chunk_summary}\n\nChunk text:\n{chunk_text}\n\nCreate a natural prompt someone might ask and the ideal response.",
  
  "response_schema": {
    "type": "object",
    "required": ["prompt_candidate", "target_answer", "style_directives", "confidence_scores"],
    "properties": {
      "prompt_candidate": {
        "type": "string",
        "description": "Potential user prompt distilled from the chunk"
      },
      "target_answer": {
        "type": "string",
        "description": "Ideal answer that captures the chunk's wisdom"
      },
      "style_directives": {
        "type": "string",
        "description": "Formatting/voice directives for answers"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "prompt_relevance": {"type": "number", "minimum": 0, "maximum": 1},
          "answer_quality": {"type": "number", "minimum": 0, "maximum": 1}
        }
      }
    }
  }
}
```

### Dimension Mapping
- `prompt_candidate` → Prompt_Candidate
- `target_answer` → Target_Answer
- `style_directives` → Style_Directives

---

## ============ PROMPT 7: RISK & COMPLIANCE ============
### Purpose
Assess security, privacy, and IP sensitivity of chunk content.

### Generated Dimensions
- Safety_Tags
- IP_Sensitivity
- PII_Flag
- Compliance_Flags
- Coverage_Tag
- Novelty_Tag

### Input Context Structure
```json
{
  "document_context": {
    "doc_title": "{DOC_TITLE}",
    "primary_category": "{PRIMARY_CATEGORY}",
    "doc_tags": {
      "disclosure_risk": "{DISCLOSURE_RISK_TAG}",
      "gating_level": "{GATING_LEVEL_TAG}"
    }
  },
  "chunk_context": {
    "chunk_id": "{CHUNK_ID}",
    "chunk_text": "{CHUNK_TEXT}",
    "chunk_type": "{CHUNK_TYPE}"
  }
}
```

### Prompt Template
```json
{
  "system_prompt": "You are a compliance and risk assessment expert specializing in intellectual property, data privacy, and content sensitivity analysis for business training data.",
  
  "user_prompt": "Assess the risk and compliance factors for this chunk. Document category: '{primary_category}', Disclosure risk: {disclosure_risk}.\n\nChunk text:\n{chunk_text}\n\nEvaluate all risk dimensions.",
  
  "response_schema": {
    "type": "object",
    "required": ["safety_tags", "ip_sensitivity", "pii_flag", "compliance_flags", "coverage_tag", "novelty_tag", "confidence_scores"],
    "properties": {
      "safety_tags": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Sensitive-topic flags for filtering/guardrails"
      },
      "ip_sensitivity": {
        "type": "string",
        "enum": ["Public", "Internal", "Confidential", "Trade_Secret"],
        "description": "Confidentiality level for IP handling"
      },
      "pii_flag": {
        "type": "boolean",
        "description": "Indicates presence of personal data"
      },
      "compliance_flags": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Regulatory or policy flags"
      },
      "coverage_tag": {
        "type": "string",
        "enum": ["core", "supporting", "edge"],
        "description": "How central this chunk is to the domain"
      },
      "novelty_tag": {
        "type": "string",
        "enum": ["novel", "common", "disputed"],
        "description": "Whether content is common or unique IP"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "risk_assessment_confidence": {"type": "number", "minimum": 0, "maximum": 1},
          "compliance_confidence": {"type": "number", "minimum": 0, "maximum": 1}
        }
      }
    }
  }
}
```

### Dimension Mapping
- `safety_tags` → Safety_Tags (join with comma)
- `ip_sensitivity` → IP_Sensitivity
- `pii_flag` → PII_Flag
- `compliance_flags` → Compliance_Flags (join with comma)
- `coverage_tag` → Coverage_Tag
- `novelty_tag` → Novelty_Tag

---

## ============ PROMPT 8: TRAINING DECISIONS ============
### Purpose
Make training inclusion decisions and augmentation recommendations.

### Generated Dimensions
- Include_In_Training_YN
- Augmentation_Notes

### Input Context Structure
```json
{
  "document_context": {
    "belonging_rating": {BELONGING_RATING},
    "primary_category": "{PRIMARY_CATEGORY}"
  },
  "chunk_analysis": {
    "chunk_id": "{CHUNK_ID}",
    "chunk_type": "{CHUNK_TYPE}",
    "chunk_summary": "{CHUNK_SUMMARY_1S}",
    "ip_sensitivity": "{IP_SENSITIVITY}",
    "coverage_tag": "{COVERAGE_TAG}",
    "novelty_tag": "{NOVELTY_TAG}",
    "factual_confidence": {FACTUAL_CONFIDENCE}
  }
}
```

### Prompt Template
```json
{
  "system_prompt": "You are a LoRA training data curator who makes decisions about training data inclusion and enhancement strategies based on content quality and value.",
  
  "user_prompt": "Make training decisions for this chunk. Belonging: {belonging_rating}/5, Category: '{primary_category}', Type: {chunk_type}, IP: {ip_sensitivity}, Coverage: {coverage_tag}, Novelty: {novelty_tag}.\n\nSummary: {chunk_summary}\n\nDetermine training inclusion and augmentation strategy.",
  
  "response_schema": {
    "type": "object",
    "required": ["include_in_training", "augmentation_notes", "rationale", "confidence_scores"],
    "properties": {
      "include_in_training": {
        "type": "boolean",
        "description": "Whether to use this chunk in training"
      },
      "augmentation_notes": {
        "type": "string",
        "description": "Notes on paraphrase/style/noise augmentation strategies"
      },
      "rationale": {
        "type": "string",
        "description": "Reasoning for inclusion decision"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "decision_confidence": {"type": "number", "minimum": 0, "maximum": 1}
        }
      }
    }
  }
}
```

### Dimension Mapping
- `include_in_training` → Include_In_Training_YN
- `augmentation_notes` → Augmentation_Notes

---

## Processing Strategy Implementation Guide

### Execution Order
1. **Extract chunks** (mechanical process)
2. Run **Prompt 1** (Content Analysis) for ALL chunks
3. Run **Prompt 2** (Style Analysis) for ALL chunks  
4. Run **Prompt 7** (Risk & Compliance) for ALL chunks
5. Based on Chunk_Type from Prompt 1:
   - If "Instructional_Unit" → Run **Prompt 3**
   - If "CER" → Run **Prompt 4**
   - If "Example_Scenario" → Run **Prompt 5**
6. Run **Prompt 6** (Training Pairs) for selected high-value chunks
7. Run **Prompt 8** (Training Decisions) for ALL chunks

### Batch Processing Configuration
```javascript
// Next.js implementation example
const BATCH_SIZE = 5; // Process 5 chunks in parallel
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000; // 30 seconds per prompt

const processingConfig = {
  universal_prompts: [1, 2, 7], // Run for all chunks
  conditional_prompts: {
    "Instructional_Unit": [3],
    "CER": [4],
    "Example_Scenario": [5]
  },
  secondary_prompts: [6, 8] // Run after initial analysis
};
```

### Error Handling Strategy
```javascript
const dimensionDefaults = {
  // Prompt 1 defaults
  chunk_type: "Unable to determine",
  chunk_summary_1s: "Unable to determine",
  key_terms: [],
  audience: "Unable to determine",
  intent: "Unable to determine",
  domain_tags: [],
  
  // Add defaults for all dimensions...
};
```

### Cost Tracking Implementation
```javascript
const tokenCosts = {
  input_cost_per_1k: 0.003,  // Claude Sonnet 4.5 input
  output_cost_per_1k: 0.015, // Claude Sonnet 4.5 output
  
  trackUsage: (promptId, inputTokens, outputTokens) => {
    const cost = (inputTokens * 0.003 + outputTokens * 0.015) / 1000;
    // Store in database with chunk_id, prompt_id, timestamp
    return cost;
  }
};
```

### Confidence Score Aggregation
```javascript
const aggregateConfidence = (allScores) => {
  // Calculate weighted average based on dimension criticality
  const weights = {
    chunk_type_confidence: 0.3,
    risk_assessment_confidence: 0.25,
    overall_confidence: 0.2,
    // ... other weights
  };
  
  return Object.entries(allScores).reduce((acc, [key, value]) => {
    return acc + (weights[key] || 0.1) * value;
  }, 0);
};
```

## Meta-Dimensions Addition

### Additional columns to add to the database for analysis:

```javascript
const metaDimensions = {
  // Dimension criticality (1-10)
  dimension_criticality: {
    chunk_type: 10,
    ip_sensitivity: 9,
    pii_flag: 9,
    claim: 8,
    task_name: 8,
    // ... map for all dimensions
  },
  
  // Context engineering type
  context_engineering_type: {
    chunk_type: "deep_analysis",
    chunk_id: "mechanical",
    token_count: "mechanical",
    claim: "extraction",
    style_notes: "synthesis",
    // ... map for all dimensions
  },
  
  // Generation cost per dimension
  dimension_generation_cost: 0.0, // Calculated per run
  
  // Precision confidence (1-10)
  precision_confidence: 0, // From AI response
  
  // Accuracy confidence (1-10)
  accuracy_confidence: 0, // From AI response
  
  // System confidence in pure AI generation (1-10)
  ai_generation_confidence: 0, // Calculated from response
  
  // Timestamp of generation
  generated_at: "ISO timestamp",
  
  // Model used for generation
  generation_model: "claude-3-5-sonnet-20241022",
  
  // Prompt version used
  prompt_version: "1.0",
  
  // Run identifier
  run_id: "UUID"
};
```

## Validation Rules

### Dimension validation schemas for Next.js:

```typescript
import { z } from 'zod';

// Chunk Type validation
const ChunkTypeSchema = z.enum([
  "Chapter_Sequential",
  "Instructional_Unit", 
  "CER",
  "Example_Scenario"
]);

// IP Sensitivity validation
const IPSensitivitySchema = z.enum([
  "Public",
  "Internal",
  "Confidential",
  "Trade_Secret"
]);

// Confidence score validation
const ConfidenceSchema = z.number().min(0).max(1);

// Date format validation
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// Complete dimension validation
const ChunkDimensionsSchema = z.object({
  chunk_type: ChunkTypeSchema,
  chunk_summary_1s: z.string().max(240),
  key_terms: z.array(z.string()).min(1),
  ip_sensitivity: IPSensitivitySchema,
  pii_flag: z.boolean(),
  factual_confidence_0_1: ConfidenceSchema,
  // ... add all dimension validations
});
```

## Usage Example in Next.js

```typescript
// Example API route implementation
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { documentId, chunkId, chunkText } = await request.json();
  
  // Fetch document context
  const docContext = await getDocumentContext(documentId);
  
  // Prepare prompt inputs
  const prompt1Input = {
    document_context: docContext,
    chunk_context: { chunk_id: chunkId, chunk_text: chunkText }
  };
  
  // Call AI API with Prompt 1
  const dimensions = await callAI('content_analysis', prompt1Input);
  
  // Validate response
  const validated = ChunkDimensionsSchema.parse(dimensions);
  
  // Store in database
  await storeDimensions(chunkId, validated);
  
  return NextResponse.json({ success: true, dimensions: validated });
}
```

---

## Summary

This document contains **8 complete prompt templates** that will generate all 35 AI-required dimensions for chunk processing. Each prompt:

1. **Has clear boundaries** marked with prominent section headers
2. **Uses JSON Schema contract format** for structured responses
3. **Includes placeholders** for dynamic content insertion
4. **Maps outputs** to specific LoRA dimensions
5. **Is implementable** in Next.js applications
6. **Returns structured data** with clear dimension references

The prompts are designed to be:
- **Efficient**: 8 prompts instead of 35 individual calls
- **Contextual**: Uses existing document and categorization data
- **Validated**: Includes confidence scores and validation schemas
- **Trackable**: Supports cost and performance monitoring
- **Flexible**: Can be updated via markdown file edits

Total estimated processing: 5-8 API calls per chunk (3 universal + 1 type-specific + optional training generation)