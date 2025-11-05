# Chunk Dimension Testing Environment - Initial Analysis & Questions
**Date:** 2025-10-03  
**Project:** Bright Run LoRA Training Data Platform  
**Module:** Chunk Dimension Testing Environment  
**Analysis Version:** 1.0

## Executive Summary

This analysis examines the requirements for building a comprehensive chunk dimension testing environment that extends the current document categorization module. The goal is to create a system that automatically extracts document chunks, generates detailed dimension values for each chunk using AI, and presents all data in a spreadsheet-like interface for evaluation and testing.

## Current System Understanding

### Existing Architecture
1. **Categorization Module (Complete):** 3-panel workflow for document-level categorization
   - Panel A: Belonging rating (1-5)
   - Panel B: Primary category selection (10 categories)
   - Panel C: Secondary tags (7 dimensions, 42+ tags)
   - Data stored in normalized Supabase tables

2. **Technology Stack:**
   - Next.js 14 with TypeScript
   - Supabase for database
   - Zustand for state management
   - shadcn/ui components
   - Feature flag system for safe migrations

3. **Key Assets:**
   - Document metadata dictionary with 60+ dimension fields
   - Working dashboard codebase for chunk display
   - Normalized database with category/tag data

## Requirements Analysis

### Core Functionality Required

1. **Chunk Extraction System**
   - Auto-extract 4 chunk types (Chapter, Instructional, CER, Example)
   - Maximum chunks: 5 Instructional, 10 CER, 5 Example
   - Use document-level categories to inform chunk extraction

2. **Dimension Generation Engine**
   - Generate values for 60+ dimensions per chunk
   - Differentiate between mechanical, inherited, and AI-generated dimensions
   - Multiple prompt engineering patterns based on dimension complexity

3. **Web Spreadsheet Interface**
   - Display all chunk dimensions in sortable, filterable grid
   - Support for regeneration and comparison of runs
   - Historical run tracking with timestamps

4. **Meta-Dimension System**
   - Add 10+ meta dimensions for analysis (criticality, confidence, cost, etc.)
   - Help evaluate dimension quality and generation approach

## Clarifying Questions

### 1. Data Architecture & Integration

**Q1.1:** Should the chunk extraction and dimension generation data be stored in the existing Supabase database alongside the categorization data, or in a separate schema/database?
**A1.1:** The chunk extraction and dimension data should be stored in the same Supabase database (Bright Run V.2). 

**Q1.2:** The document metadata dictionary CSV has 60+ fields. Should ALL of these become columns in the chunk dimension table, or should we focus on a subset for the MVP? If a subset, which are the highest priority?
We have answered this question in other documents in this context.
The short answer is yes they should all become columns and we will display them all on the web page table.  
You will see in the other document and the new data dictionary segments that we will have well organized types and efficient prompt discovery.

**Q1.3:** How should we handle the relationship between document-level categorization (already stored) and chunk-level dimensions? Should chunks inherit certain values from their parent document?
**A1.3:** We don't need the document-level belonging, primary categories, and tags to be explicitly created as individual dimensions for the chunks, but chunks can always inherit those values because the chunk will have reference to the main document, and those values can be referred to via that reference if needed.

### 2. Chunk Extraction Logic

**Q2.1:** For chunk extraction, you mention "As many needed so all logical chapters" for Chapter chunks. Should we:
- Extract ALL chapters/sections found in a document, or
- Limit to a maximum number (e.g., 10-20) for performance?
**A2.1:**  Yes limit chapter chunks to 15 max for now.

**Q2.2:** The extraction limits are "maximum of 5" for Instructional and Example chunks, "maximum of 10" for CER chunks. What criteria should be used to select WHICH 5/10 when more exist? Should we:
- Take the first N found?
- Use AI to rank and select the most valuable?.
- Let the user choose?
**A2.2:** Use AI to rank and select the most valuable


**Q2.3:** Should chunk extraction happen:
- Immediately when "Chunks" button is clicked?
- As a background job with progress tracking?
- In stages (extract first, then generate dimensions)?
**A2.3:** Chunk extraction should happen stages. Extract first, then generate dimensions. Process it as a background job with progress tracking.

### 3. AI Integration & Prompting

**Q3.1:** You mention using Claude Sonnet 3.5 as the default. Should the system:
- Use a single API key hardcoded in the backend?
- Support multiple API keys for load balancing?
- Track API usage per document/user?
*A3.1:**  I mention using Claude Sonnet 4.5 (use 4.5, not 3.5).
The system should use a single api key hardcoded on the backend for now.
Yes, track API usage per document/user

**Q3.2:** For the "context engineering types" you want different prompt patterns. Should we:
- Create a fixed set of 3-5 prompt templates initially?
- Build a flexible prompt template system that can be extended?
- Start with simple prompts and iterate based on testing?
**A3.2:** Create a fixed set of 3-5 prompt templates initially. Start with simple prompts and iterate based on testing.


**Q3.3:** The JSON Schema contract format for prompts - should this:
- Use OpenAI's function calling format?
- Use a custom JSON schema we define?
- Support both approaches?
**A3.3:** I am not sure how to answer that. We should use the JSON format that is best suited for the prompt. I am not sure what the OpenAI function calling format is. I do know that we should be using a contract format, not a tools format. Also, the prompt response should be in a structured format so it can easily be consumed and the information stored in the Supabase RDB.


### 4. Spreadsheet Interface Design

**Q4.1:** The spreadsheet view needs to display potentially 70+ columns (60 base + 10+ meta). Should we:
- Display all columns with horizontal scrolling?
- Implement column selection/hiding features?
- Create preset views (e.g., "Quality View", "Cost View", "Confidence View")?
**A4.1:** Display all columns with horizontal scrolling and Create preset views (e.g., "Quality View", "Cost View", "Confidence View"). There is no need to implement column selection/hiding features.

**Q4.2:** For the "run selector" feature - how many historical runs should be stored? Should there be:
- Unlimited storage of all runs?
- Last N runs per chunk?
- User-deletable runs?
**A4.2:** Unlimited storage of all runs

**Q4.3:** The spreadsheet should be "sortable by many columns". Should we also include:
- Multi-column sorting?
- Advanced filtering (greater than, contains, etc.)?
- Export to CSV/Excel functionality?
**A4.3:** No, none of these are needed now.

### 5. User Experience Flow

**Q5.1:** When the user clicks "Chunks" button after categorization, should they:
- See a loading screen while chunks are extracted/processed?
- Immediately see a chunk dashboard with "Processing" status?
- Configure extraction parameters before processing starts?
**A5.1:** See a loading screen while chunks are extracted/processed.


**Q5.2:** For the chunk dashboard display showing "things we know" (3 high confidence) and "things we don't know" (3 low confidence), should these be:
- Automatically selected based on confidence scores?
- Manually curated important dimensions?
- A mix of both approaches?
**A5.2:** These should be automatically selected based on confidence scores


**Q5.3:** Should chunk regeneration:
- Regenerate ALL dimensions for a chunk?
- Allow selective dimension regeneration?
- Create a new version/run automatically?
**A5.3:** chunk regeneration should regenerate all dimensions for the chunk which will be a new version/run automatically


### 6. Performance & Scalability

**Q6.1:** For a typical document with 20-30 chunks, each with 70+ dimensions, we're looking at 1400-2100 AI-generated values. Should we:
- Process all in parallel (fast but expensive)?
- Process in batches (balanced)?
- Process sequentially (slow but controlled)?
**A6.1:** Process in batches (balanced)


**Q6.2:** The AI cost calculation column - should this:
- Use real-time token counting?
- Estimate based on text length?
- Track actual API costs?
**A6.2:** Which one is cheapest and easiest to implement? I am guessing tracking actual API costs, yes? Choose that one.


**Q6.3:** Should dimension generation have a timeout or retry mechanism for failed AI calls?
**A6.3:** Yes.

### 7. Data Quality & Validation

**Q7.1:** For the confidence scoring (1-10 for precision and accuracy), should this be:
- Self-reported by the AI in its response?
- Calculated based on response characteristics?
- Both, with comparison/validation?
**A7.1:** This should be self-reported by the AI in its response


**Q7.2:** Should there be validation rules for dimension values (e.g., date formats, enum constraints)?
**A7.2:** Yes.

**Q7.3:** How should we handle chunks where AI cannot generate certain dimensions? Should we:
- Mark as "Unable to determine"?
- Use default values?
- Flag for manual review?
**A7.3:** Mark as "Unable to determine"

### 8. Technical Implementation

**Q8.1:** Should we reuse the existing dashboard codebase structure (`chunks-alpha-dashboard`) or integrate everything into the main app (`chunks-alpha`)?
**A8.1:** Maybe I am not sure. I want the workflow to operate as a seemless flow. If it is better to use a new structure than do that. I had thought integrating everything into the main app (`chunks-alpha`) would be the way to create the most reliable workflow. But if I am wrong, do whichever one will result in the highest quality results.

**Q8.2:** The document metadata dictionary CSV - should this be:
- Imported into the database as a dimension definition table?
- Kept as a configuration file?
- Hardcoded in the application?
**A8.2:** I don't know. I will leave this to you, the senior application architect to determine which way will result in the highest quality, with the best traceability.

**Q8.3:** For the "simple context engineering" in this iteration, what should be included in the context beyond the chunk text? Should we include:
- Document title and metadata?
- Previous/next chunk context?
- Document-level categories and tags?
**A8.3:** I do not know. I will leave this to you, the senior application architect to determine which way will result in the highest quality, with the best traceability.

### 9. Module Boundaries

**Q9.1:** You mention this is "the first module required in the LoRA document training pipeline." What specific outputs does the next module expect? Should we:
- Define a specific export format now?
- Build a flexible export system?
- Focus only on the testing interface for now?
**A9.1:** This is not accurate. The current module as implemented is the first module required. Right now we are not building the interfaces to the next module. The purpose of this implementation is to give us a way to have repeatable generation so we can fine tune the prompts and the priority of responses.

**Q9.2:** Should this module handle document upload, or continue using the existing upload functionality in the categorization module?
**A9.2:** do NOT implement document upload. use the existing functionality.

### 10. Testing & Iteration

**Q10.1:** For the testing workflow where you'll "manually update the prompt on the back end", should we:
- Create an admin interface for prompt editing?
- Use environment variables for prompts?
- Direct database editing for prompt templates?
**A10.1:** We don't need a full admin interface. I am not sure what you mean about environment variables. Ideally I will be able to edit the prompt templates in a Markdown file, and then we will have a utility to push the new versions to the DB

**Q10.2:** How should we measure success for the dimension generation? Should we track:
- Accuracy scores per dimension?
- Time to generate?
- Cost per document?
- All of the above?
**A10.2:** All of the above.

## Recommendations & Considerations

### Phased Approach Recommendation

Given the complexity, I recommend a phased approach:

**Phase 1: Foundation (Week 1)**
- Chunk extraction logic for 4 types
- Basic dimension storage schema
- Simple spreadsheet view

**Phase 2: AI Integration (Week 2)**
- Dimension generation with simple prompts
- Confidence scoring
- Meta-dimensions

**Phase 3: Interface Enhancement (Week 3)**
- Full spreadsheet functionality
- Run comparison
- Historical tracking

**Phase 4: Optimization (Week 4)**
- Prompt engineering refinement
- Performance optimization
- Quality validation

### Key Technical Decisions Needed

1. **Database Schema Design**
   - Should we create a `chunk_dimensions` table with 70+ columns?
   - Or use a more flexible EAV (Entity-Attribute-Value) model?
   - How to handle sparse data (many NULL values)?

2. **AI Processing Architecture**
   - Batch processing vs. streaming
   - Error handling and retry logic
   - Cost optimization strategies

3. **UI/UX Approach**
   - Build custom spreadsheet component vs. use existing library
   - Real-time updates vs. refresh-based
   - Mobile responsiveness considerations

### Risk Mitigation Strategies

1. **API Cost Overrun**
   - Implement cost estimation before processing
   - Add spending limits per document
   - Cache AI responses for reuse

2. **Performance Issues**
   - Implement pagination for large chunk sets
   - Use virtual scrolling for spreadsheet
   - Progressive loading of dimension data

3. **Data Quality Concerns**
   - Add validation rules for critical dimensions
   - Implement confidence thresholds
   - Create audit trails for all generations

## Next Steps

To proceed with building detailed task-based directives, I need clarity on:

1. **Priority dimensions** - Which of the 60+ dimensions are must-have vs. nice-to-have?
2. **Scale expectations** - Typical document sizes and chunk counts
3. **Cost constraints** - Budget for AI API calls per document
4. **Integration points** - How this connects to the next pipeline module
5. **User expertise level** - How technical are the users who will evaluate the data?

## Questions Summary

The most critical questions that will significantly impact the build approach:

1. **Scope:** Should we implement all 60+ dimensions from the CSV, or start with a subset?
2. **Architecture:** Extend the existing database schema or create new tables?
3. **Processing:** Batch vs. streaming for AI dimension generation?
4. **Interface:** Custom spreadsheet component or integrate existing library?
5. **Prompting:** Fixed templates or flexible system for context engineering?

Once these foundational questions are answered, I can create precise, actionable build directives that minimize context switching and maximize implementation efficiency.

## Appendix: Identified Gaps

### Current Gaps Between Requirements and Existing System

1. **No chunk extraction logic** - Need to build from scratch
2. **No AI integration** - Need to implement OpenAI/Claude API
3. **No spreadsheet view** - Need to create or integrate
4. **No dimension generation** - Need to build complete pipeline
5. **No run tracking** - Need to design storage and comparison system

### Potential Reusable Components

From existing codebase:
- Supabase connection and auth
- Document management system
- UI component library (shadcn/ui)
- Workflow state management patterns
- Server/client component architecture

From dashboard codebase:
- Document overview components
- Chunk display patterns
- Mock data structures
- Zustand store patterns

---

*This analysis identifies key decision points and clarifications needed to build a robust chunk dimension testing environment. Once these questions are addressed, we can proceed with detailed implementation specifications.*