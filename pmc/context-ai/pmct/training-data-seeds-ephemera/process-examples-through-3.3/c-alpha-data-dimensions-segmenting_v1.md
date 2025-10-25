## Chunks Alpha Data Dimensions Segmenting

I've successfully categorized the 60+ dimensions from the master metadata dictionary into three files based on their generation requirements:

### **File #1: Previously Generated** (8 dimensions)
**Location:** `document-metadata-dictionary-previously-generated_v1.csv`
- Inherited from document upload or categorization module
- Examples: Doc_ID, Doc_Title, Author, Primary_Category
- **No AI or processing needed** - these values already exist

### **File #2: Mechanically Generated** (17 dimensions)  
**Location:** `document-metadata-dictionary-mechanically-generated_v1.csv`
- Calculated during chunk extraction without AI
- Examples: Chunk_ID, Token_Count, Page_Start, Vector_Checksum
- **Simple computation or tracking** - no thinking required

### **File #3: AI Processing Required** (35 dimensions)
**Location:** `document-metadata-dictionary-gen-AI-processing-required_v1.csv`
- Requires LLM analysis and generation
- Examples: Chunk_Type, Key_Terms, Claim, IP_Sensitivity
- **Needs AI reasoning** - the core value generation

## Key Insights from Your Answers

Based on your responses, I've identified several important architectural decisions:

1. **Integration Approach**: Everything stays in the main `chunks-alpha` app for seamless workflow
2. **Processing Strategy**: Batch processing with background jobs and progress tracking
3. **AI Configuration**: Claude Sonnet 4.5 with single API key, tracking usage per document
4. **Prompt Engineering**: Start with 3-5 fixed templates, iterate based on testing
5. **Storage**: Unlimited run history in same Supabase database
6. **Interface**: Spreadsheet with horizontal scrolling and preset views

## Efficiency Recommendations

I've also created an analysis document suggesting how to **group the 35 AI dimensions into 8 prompt groups** for efficient processing:

1. **Content Analysis** (6 dimensions in 1 prompt)
2. **Style Analysis** (3 dimensions in 1 prompt)  
3. **Task Extraction** (6 dimensions for Instructional chunks)
4. **CER Analysis** (5 dimensions for CER chunks)
5. **Scenario Analysis** (4 dimensions for Example chunks)
6. **Training Generation** (3 dimensions)
7. **Risk Assessment** (6 dimensions in 1 prompt)
8. **Training Decisions** (2 dimensions)

This grouping strategy could reduce the number of API calls from 35 individual prompts to just 5-8 prompts per chunk, while maintaining quality through logical grouping of related dimensions.

**Estimated cost per document: $0.34 - $0.50** for 20-30 chunks with all dimensions.

The categorization clearly shows that **over half the dimensions (35/60) require AI processing**, validating the need for a robust prompt engineering and testing environment. The mechanical and inherited dimensions provide the scaffolding, while the AI dimensions provide the actual training value.