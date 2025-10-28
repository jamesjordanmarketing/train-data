# Document Metadata Dictionary - Categorization Analysis
**Date:** 2025-10-03  
**Version:** 1.0

## Overview
The original 60+ field metadata dictionary has been categorized into three distinct generation types based on how the data is created during the chunk processing pipeline.

## File Breakdown

### File #1: Previously Generated Dimensions (`document-metadata-dictionary-previously-generated_v1.csv`)
**Count:** 8 dimensions  
**Description:** Data inherited from parent document or the categorization module (Panels A, B, C)

These dimensions are already available from:
- Document upload metadata
- Document categorization workflow (belonging, category, tags)
- Original document properties

**Dimensions:**
- Doc_ID, Doc_Title, Doc_Version
- Source_Type, Source_URL
- Author, Doc_Date
- Primary_Category (from Panel B)

### File #2: Mechanically Generated Dimensions (`document-metadata-dictionary-mechanically-generated_v1.csv`)
**Count:** 17 dimensions  
**Description:** Data calculated or derived during chunk extraction without AI reasoning

These dimensions are generated through:
- Chunk extraction process (positions, boundaries)
- Token counting and text metrics
- System tracking and metadata
- Workflow state management

**Dimensions:**
- **Chunk Structure:** Chunk_ID, Section_Heading, Page_Start/End, Char_Start/End
- **Metrics:** Token_Count, Overlap_Tokens
- **System Generated:** Chunk_Handle, Embedding_ID, Vector_Checksum
- **Tracking:** Label_Source, Label_Model, Labeled_By, Label_Timestamp
- **Workflow:** Review_Status, Data_Split_Train_Dev_Test

### File #3: AI Processing Required Dimensions (`document-metadata-dictionary-gen-AI-processing-required_v1.csv`)
**Count:** 35 dimensions  
**Description:** Data requiring LLM analysis, reasoning, and generation

These dimensions need AI because they involve:
- Content understanding and summarization
- Classification and categorization
- Information extraction
- Quality assessment
- Risk evaluation

## AI Dimension Grouping Strategy

Based on the AI-required dimensions, here's a suggested grouping for efficient prompt engineering:

### Group 1: Content Analysis & Classification
**Single Prompt Possibility - Returns structured JSON with multiple fields**
- Chunk_Type
- Chunk_Summary_1s
- Key_Terms
- Audience
- Intent
- Domain_Tags

### Group 2: Style & Voice Analysis
**Single Prompt Possibility - Focuses on tone and brand**
- Tone_Voice_Tags
- Brand_Persona_Tags
- Style_Notes

### Group 3: Task/Instruction Extraction (for Instructional chunks)
**Single Prompt - Structured task analysis**
- Task_Name
- Preconditions
- Inputs
- Steps_JSON
- Expected_Output
- Warnings_Failure_Modes

### Group 4: Claim-Evidence-Reasoning (for CER chunks)
**Single Prompt - Argument structure extraction**
- Claim
- Evidence_Snippets
- Reasoning_Sketch
- Citations
- Factual_Confidence_0_1

### Group 5: Scenario/Example Analysis (for Example chunks)
**Single Prompt - Story structure extraction**
- Scenario_Type
- Problem_Context
- Solution_Action
- Outcome_Metrics

### Group 6: Training Data Generation
**Single Prompt - Creates training pairs**
- Prompt_Candidate
- Target_Answer
- Style_Directives

### Group 7: Risk & Compliance Assessment
**Single Prompt - Security and sensitivity analysis**
- Safety_Tags
- IP_Sensitivity
- PII_Flag
- Compliance_Flags
- Coverage_Tag
- Novelty_Tag

### Group 8: Training Decisions
**Single Prompt or Rule-based with AI assist**
- Include_In_Training_YN
- Augmentation_Notes

## Implementation Recommendations

### Prompt Efficiency
- **Minimum Prompts:** 5-8 prompts per chunk (grouping related dimensions)
- **Maximum Quality:** 10-15 prompts per chunk (more focused analysis)
- **Recommended:** 8 prompts balancing quality and efficiency

### Processing Strategy
1. **Universal Prompts (All Chunks):** Groups 1, 2, 7
2. **Type-Specific Prompts:**
   - Instructional: Group 3
   - CER: Group 4
   - Example: Group 5
3. **Optional/Secondary:** Groups 6, 8 (may be deferred or selective)

### Batch Processing Order
1. Extract all chunks first (mechanical)
2. Run universal analysis (Groups 1, 2, 7)
3. Run type-specific analysis based on Chunk_Type
4. Generate training data (Group 6)
5. Make training decisions (Group 8)

## Cost Estimation

### Per Chunk Processing
- **Input Context:** ~500-1000 tokens (chunk text + prompt)
- **Output:** ~200-500 tokens per prompt group
- **Total per chunk:** ~8 prompts × 700 tokens = 5,600 tokens average

### Per Document (20-30 chunks)
- **Low estimate:** 20 chunks × 5,600 = 112,000 tokens
- **High estimate:** 30 chunks × 5,600 = 168,000 tokens
- **Cost (Claude Sonnet 4.5):** ~$0.34 - $0.50 per document

## Quality Considerations

### High Priority Dimensions (Must be accurate)
- Chunk_Type (determines downstream processing)
- IP_Sensitivity (security critical)
- PII_Flag (compliance critical)
- Primary task/claim extraction (core value)

### Medium Priority Dimensions
- Style and tone tags
- Domain classifications
- Confidence scores

### Lower Priority Dimensions (Can iterate)
- Augmentation notes
- Some metadata tags
- Training suggestions

## Next Steps
1. Design JSON schemas for each prompt group
2. Create prompt templates for each group
3. Implement validation rules for each dimension type
4. Build error handling for dimension generation failures
5. Create confidence scoring rubric