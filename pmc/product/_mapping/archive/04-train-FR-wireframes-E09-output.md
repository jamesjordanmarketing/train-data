# Train Data Generation Platform - Feature & Function Task Inventory
**Generated:** 2025-10-29  
**Scope:** FR9.1.1 & FR9.1.2 - Integration with Chunks-Alpha Module  
**Product:** Interactive LoRA Conversation Generation Module  
**Version:** 1.0

---

## Executive Summary

This task inventory provides a comprehensive roadmap for implementing FR9 (Integration with Chunks-Alpha Module) which includes:
- **FR9.1.1**: Conversation to Chunk Association - Link generated conversations to source chunks with full traceability
- **FR9.1.2**: Dimension-Driven Generation - Use chunk's 60-dimensional semantic analysis to inform conversation generation parameters

**Total Tasks**: 72 tasks organized into 6 major categories  
**Estimated Timeline**: 6-8 weeks for full implementation  
**Dependencies**: Requires completed chunks-alpha module with 60-dimension analysis operational

---

## Table of Contents

1. [Foundation & Infrastructure](#1-foundation--infrastructure) (12 tasks)
2. [Data Management & Processing](#2-data-management--processing) (15 tasks)
3. [User Interface Components](#3-user-interface-components) (18 tasks)
4. [Feature Implementation](#4-feature-implementation) (16 tasks)
5. [Quality Assurance & Testing](#5-quality-assurance--testing) (6 tasks)
6. [Deployment & Operations](#6-deployment--operations) (5 tasks)

---

## 1. Foundation & Infrastructure

### T-1.1.0: Database Schema Extensions for Chunk Integration
- **FR Reference**: FR9.1.1
- **Impact Weighting**: System Architecture / Data Integrity
- **Implementation Location**: Supabase migrations / `src/lib/database.ts`
- **Pattern**: Relational Foreign Key Architecture
- **Dependencies**: Existing chunks-alpha database schema
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Extend conversations table schema to support chunk associations and dimension metadata
- **Testing Tools**: Supabase Studio, PostgreSQL Query Analyzer
- **Test Coverage Requirements**: 100% of foreign key constraints tested
- **Completes Component?**: Yes - Database foundation for chunk integration

**Functional Requirements Acceptance Criteria**:
- Conversations table must include chunk_id foreign key field (UUID, nullable, references chunks_alpha.chunks.id)
- Add source_chunk_metadata JSONB field to store snapshot of chunk data at generation time
- Add dimension_mappings JSONB field to store persona/emotion/topic derived from chunk dimensions
- Create indexes on chunk_id for efficient lookup queries (<50ms)
- Establish CASCADE ON DELETE behavior: deleting chunk marks conversations as orphaned (status change), not deletion
- Add chunk_dimension_scores JSONB field storing relevance scores for each dimension used
- Add is_orphaned boolean field to flag conversations with deleted/missing chunk references
- Migration must be reversible with down() function for rollback
- All timestamp fields use timestamptz for timezone awareness
- Constraints must prevent duplicate chunk_id + conversation_id pairs in linking table

#### T-1.1.1: Create Chunk Association Link Table
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-1.1.0  
- **Implementation Location**: Database migration `migrations/20XX_create_conversation_chunk_links.sql`  
- **Pattern**: Many-to-Many Association Table  
- **Dependencies**: T-1.1.0  
- **Estimated Human Work Hours**: 4-6 hours  
- **Description**: Create join table supporting multiple conversations per chunk

**Components/Elements**:
- [T-1.1.1:ELE-1] conversation_chunk_links table structure
  - Stubs and Code Location(s): New migration file
  - Fields: id (UUID PK), conversation_id (FK), chunk_id (FK), relationship_type, confidence_score, created_at
- [T-1.1.1:ELE-2] Composite unique index on (conversation_id, chunk_id)
  - Stubs and Code Location(s): Migration index creation
- [T-1.1.1:ELE-3] Foreign key constraints with CASCADE behavior
  - Stubs and Code Location(s): Migration constraint definitions

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing chunks_alpha schema structure (implements ELE-1)
   - [PREP-2] Design relationship_type enum values (primary, reference, context, derived) (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create migration SQL file with table definition (implements ELE-1)
   - [IMP-2] Add indexes for performance optimization (implements ELE-2)
   - [IMP-3] Add foreign key constraints with proper CASCADE rules (implements ELE-3)
   - [IMP-4] Add confidence_score field (0-1 float) for relationship strength (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test constraint violations with invalid data (validates ELE-3)
   - [VAL-2] Verify query performance with EXPLAIN ANALYZE (validates ELE-2)
   - [VAL-3] Test cascade behavior when chunks deleted (validates ELE-3)

---

#### T-1.1.2: Extend Conversation Type Definition
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-1.1.0  
- **Implementation Location**: `train-wireframe/src/lib/types.ts`  
- **Pattern**: TypeScript Interface Extension  
- **Dependencies**: T-1.1.1  
- **Estimated Human Work Hours**: 2-3 hours  
- **Description**: Add chunk-related fields to Conversation type

**Components/Elements**:
- [T-1.1.2:ELE-1] New Conversation type fields
  - Stubs and Code Location(s): `train-wireframe/src/lib/types.ts:29-46` (Conversation type)
  - New fields: chunkId?, chunkMetadata?, dimensionMappings?, isOrphaned
- [T-1.1.2:ELE-2] ChunkMetadata interface definition
  - Stubs and Code Location(s): New interface in types.ts
  - Fields: chunkId, chunkText, chunkDimensions, documentId, documentTitle
- [T-1.1.2:ELE-3] DimensionMapping interface definition
  - Stubs and Code Location(s): New interface in types.ts
  - Fields: dimensionName, sourceValue, mappedValue, confidence

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing Conversation type structure (implements ELE-1)
   - [PREP-2] Identify all chunk-related data to be stored (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Extend Conversation interface with optional chunk fields (implements ELE-1)
   - [IMP-2] Create ChunkMetadata interface (implements ELE-2)
   - [IMP-3] Create DimensionMapping interface (implements ELE-3)
   - [IMP-4] Add JSDoc documentation for each new field (implements ELE-1-3)
3. Validation Phase:
   - [VAL-1] Verify TypeScript compilation passes (validates ELE-1-3)
   - [VAL-2] Check type safety with test data objects (validates ELE-1-3)

---

### T-1.2.0: Chunk Service Integration Layer
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: System Integration / Code Reusability
- **Implementation Location**: `src/lib/conversation-chunk-service.ts` (new file)
- **Pattern**: Service Layer / Repository Pattern
- **Dependencies**: T-1.1.0, existing `src/lib/chunk-service.ts`
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Create service layer abstracting chunk data access for conversation generation
- **Testing Tools**: Jest, Vitest
- **Test Coverage Requirements**: 85% code coverage
- **Completes Component?**: Yes - Chunk integration service layer complete

**Functional Requirements Acceptance Criteria**:
- Service must provide getChunkById() method returning full chunk with dimensions
- Service must provide getChunkDimensions() method returning 60-dimension analysis array
- Service must provide linkConversationToChunk() method creating association
- Service must provide getConversationChunks() method returning all linked chunks for conversation
- Service must provide getChunkConversations() method returning all conversations using specific chunk
- Service must provide searchChunksByDimensions() method for dimension-based chunk selection
- Service must handle chunk not found errors gracefully with typed error responses
- Service must cache chunk dimension data to minimize database queries (TTL: 5 minutes)
- All methods must use TypeScript strict typing with proper error handling
- Service must log all chunk access for audit trail

#### T-1.2.1: Implement Chunk Retrieval Methods
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-1.2.0  
- **Implementation Location**: `src/lib/conversation-chunk-service.ts`  
- **Pattern**: Repository Pattern  
- **Dependencies**: T-1.1.0  
- **Estimated Human Work Hours**: 6-8 hours  
- **Description**: Implement methods to retrieve chunk data with dimensions

**Components/Elements**:
- [T-1.2.1:ELE-1] getChunkById() method
  - Stubs and Code Location(s): New service method
  - Returns: Chunk object with dimensions array
- [T-1.2.1:ELE-2] getChunkDimensions() method
  - Stubs and Code Location(s): New service method
  - Returns: Array of 60 dimension objects with values
- [T-1.2.1:ELE-3] Error handling for missing chunks
  - Stubs and Code Location(s): Service error handling
  - Returns: Typed ChunkNotFoundError

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing chunk-service.ts API (implements ELE-1)
   - [PREP-2] Define return type interfaces (implements ELE-1-2)
   - [PREP-3] Design error handling strategy (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Implement getChunkById with Supabase query (implements ELE-1)
   - [IMP-2] Implement getChunkDimensions with join to chunk_dimensions table (implements ELE-2)
   - [IMP-3] Add try-catch error handling (implements ELE-3)
   - [IMP-4] Add TypeScript type guards for response validation (implements ELE-1-2)
3. Validation Phase:
   - [VAL-1] Unit test with valid chunk ID (validates ELE-1)
   - [VAL-2] Unit test with invalid chunk ID (validates ELE-3)
   - [VAL-3] Test dimension data structure matches expected format (validates ELE-2)

---

#### T-1.2.2: Implement Chunk Association Methods
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-1.2.0  
- **Implementation Location**: `src/lib/conversation-chunk-service.ts`  
- **Pattern**: Repository Pattern  
- **Dependencies**: T-1.2.1  
- **Estimated Human Work Hours**: 6-8 hours  
- **Description**: Implement methods to create and query conversation-chunk associations

**Components/Elements**:
- [T-1.2.2:ELE-1] linkConversationToChunk() method
  - Stubs and Code Location(s): New service method
  - Parameters: conversationId, chunkId, relationshipType, confidence
- [T-1.2.2:ELE-2] getConversationChunks() method
  - Stubs and Code Location(s): New service method
  - Returns: Array of linked chunks with relationship metadata
- [T-1.2.2:ELE-3] getChunkConversations() method
  - Stubs and Code Location(s): New service method
  - Returns: Array of conversations using specific chunk

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define relationship types enum (implements ELE-1)
   - [PREP-2] Design confidence score calculation (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Implement linkConversationToChunk with insert query (implements ELE-1)
   - [IMP-2] Implement getConversationChunks with join query (implements ELE-2)
   - [IMP-3] Implement getChunkConversations with reverse join (implements ELE-3)
   - [IMP-4] Add duplicate prevention logic (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test link creation and retrieval (validates ELE-1-2)
   - [VAL-2] Test duplicate link prevention (validates ELE-1)
   - [VAL-3] Test bidirectional queries (validates ELE-2-3)

---

#### T-1.2.3: Implement Dimension Search Methods  
- **FR Reference**: FR9.1.2  
- **Parent Task**: T-1.2.0  
- **Implementation Location**: `src/lib/conversation-chunk-service.ts`  
- **Pattern**: Repository Pattern / Query Builder  
- **Dependencies**: T-1.2.1  
- **Estimated Human Work Hours**: 4-6 hours  
- **Description**: Implement search methods to find chunks by dimension criteria

**Components/Elements**:
- [T-1.2.3:ELE-1] searchChunksByDimensions() method
  - Stubs and Code Location(s): New service method
  - Parameters: dimensionFilters (object with dimension criteria)
- [T-1.2.3:ELE-2] Query builder for dimension filtering
  - Stubs and Code Location(s): Internal helper function
  - Constructs SQL WHERE clauses from dimension filters
- [T-1.2.3:ELE-3] Dimension matching algorithm
  - Stubs and Code Location(s): Internal helper function
  - Calculates relevance scores for chunks

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Analyze dimension schema structure (implements ELE-1)
   - [PREP-2] Define dimension filter interface (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Implement query builder logic (implements ELE-2)
   - [IMP-2] Implement searchChunksByDimensions method (implements ELE-1)
   - [IMP-3] Implement relevance scoring algorithm (implements ELE-3)
   - [IMP-4] Add pagination support for large result sets (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test with single dimension filter (validates ELE-1)
   - [VAL-2] Test with multiple dimension filters (validates ELE-2)
   - [VAL-3] Test relevance scoring accuracy (validates ELE-3)

---

### T-1.3.0: Dimension Mapping Configuration System
- **FR Reference**: FR9.1.2
- **Impact Weighting**: Configuration Management / Business Logic
- **Implementation Location**: `src/lib/dimension-mapping-config.ts` (new file)
- **Pattern**: Configuration / Strategy Pattern
- **Dependencies**: None (standalone)
- **Estimated Human Work Hours**: 8-12 hours
- **Description**: Define mapping rules from chunk dimensions to conversation parameters
- **Testing Tools**: Jest, Configuration validation scripts
- **Test Coverage Requirements**: 100% mapping rule coverage
- **Completes Component?**: Yes - Dimension mapping configuration complete

**Functional Requirements Acceptance Criteria**:
- Configuration must define mappings for all 60 chunk dimensions to conversation parameters
- Must map semantic dimensions (persona, emotion, topic, intent, tone) directly
- Must map complexity dimensions to turn count ranges (low: 4-6, medium: 8-12, high: 14-20)
- Must map domain dimensions to conversation category tags
- Must map confidence dimensions to quality thresholds
- Configuration must be exportable/importable as JSON for version control
- Must support multiple mapping profiles (conservative, balanced, aggressive)
- Must include validation function ensuring all required dimensions have mappings
- Must support custom mapping rules per user organization
- Configuration must be editable via UI (future: admin interface)

#### T-1.3.1: Define Core Dimension Mappings
- **FR Reference**: FR9.1.2  
- **Parent Task**: T-1.3.0  
- **Implementation Location**: `src/lib/dimension-mapping-config.ts`  
- **Pattern**: Configuration Object  
- **Dependencies**: None  
- **Estimated Human Work Hours**: 4-6 hours  
- **Description**: Create configuration object defining standard dimension mappings

**Components/Elements**:
- [T-1.3.1:ELE-1] DimensionMappingConfig interface
  - Stubs and Code Location(s): New type definition
  - Structure: dimensionName -> mapping rule object
- [T-1.3.1:ELE-2] Default mapping configuration object
  - Stubs and Code Location(s): Exported const DEFAULT_DIMENSION_MAPPINGS
  - Contains: All 60 dimension mappings
- [T-1.3.1:ELE-3] Mapping validation function
  - Stubs and Code Location(s): validateMappingConfig()
  - Checks: All required dimensions present, valid value ranges

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Document all 60 chunk dimensions with descriptions (implements ELE-1)
   - [PREP-2] Identify target conversation parameters for each dimension (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create DimensionMappingConfig TypeScript interface (implements ELE-1)
   - [IMP-2] Define default mapping rules for each dimension (implements ELE-2)
   - [IMP-3] Implement validation function (implements ELE-3)
   - [IMP-4] Add JSDoc documentation for each mapping (implements ELE-2)
3. Validation Phase:
   - [VAL-1] Validate configuration structure with TypeScript (validates ELE-1)
   - [VAL-2] Test validation function with valid/invalid configs (validates ELE-3)

---

#### T-1.3.2: Implement Mapping Profiles
- **FR Reference**: FR9.1.2  
- **Parent Task**: T-1.3.0  
- **Implementation Location**: `src/lib/dimension-mapping-config.ts`  
- **Pattern**: Strategy Pattern  
- **Dependencies**: T-1.3.1  
- **Estimated Human Work Hours**: 4-6 hours  
- **Description**: Create predefined mapping profiles for different use cases

**Components/Elements**:
- [T-1.3.2:ELE-1] Conservative profile configuration
  - Stubs and Code Location(s): CONSERVATIVE_PROFILE constant
  - Characteristics: Strict mappings, high confidence thresholds
- [T-1.3.2:ELE-2] Balanced profile configuration
  - Stubs and Code Location(s): BALANCED_PROFILE constant
  - Characteristics: Moderate mappings, balanced thresholds
- [T-1.3.2:ELE-3] Aggressive profile configuration
  - Stubs and Code Location(s): AGGRESSIVE_PROFILE constant
  - Characteristics: Flexible mappings, lower confidence thresholds
- [T-1.3.2:ELE-4] Profile selection function
  - Stubs and Code Location(s): getMappingProfile(profileName)
  - Returns: Selected profile configuration

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define profile characteristics and use cases (implements ELE-1-3)
   - [PREP-2] Determine threshold values for each profile (implements ELE-1-3)
2. Implementation Phase:
   - [IMP-1] Create conservative profile configuration (implements ELE-1)
   - [IMP-2] Create balanced profile configuration (implements ELE-2)
   - [IMP-3] Create aggressive profile configuration (implements ELE-3)
   - [IMP-4] Implement profile selection function (implements ELE-4)
3. Validation Phase:
   - [VAL-1] Test profile retrieval (validates ELE-4)
   - [VAL-2] Compare profile differences (validates ELE-1-3)

---

## 2. Data Management & Processing

### T-2.1.0: Dimension Extraction Pipeline
- **FR Reference**: FR9.1.2
- **Impact Weighting**: Data Quality / Generation Intelligence
- **Implementation Location**: `src/lib/dimension-extraction-service.ts` (new file)
- **Pattern**: Pipeline Pattern / ETL
- **Dependencies**: T-1.2.0, T-1.3.0
- **Estimated Human Work Hours**: 20-24 hours
- **Description**: Build pipeline to extract and transform chunk dimensions into conversation parameters
- **Testing Tools**: Jest, Integration tests
- **Test Coverage Requirements**: 90% code coverage
- **Completes Component?**: Yes - Complete extraction pipeline operational

**Functional Requirements Acceptance Criteria**:
- Pipeline must accept chunk ID as input and return conversation parameter object
- Must extract persona from chunk's semantic content and emotion dimensions
- Must extract emotion from chunk's emotional tone and sentiment dimensions
- Must extract topic from chunk's subject matter and domain dimensions
- Must calculate turn count from complexity and depth dimensions
- Must derive tone from formality and style dimensions
- Must include confidence scores for each extracted parameter
- Pipeline must handle missing dimensions gracefully with default values
- Must log extraction process for debugging and audit
- Extraction must complete within 200ms for single chunk
- Must support batch extraction for multiple chunks (parallel processing)

#### T-2.1.1: Implement Persona Extraction Logic
- **FR Reference**: FR9.1.2  
- **Parent Task**: T-2.1.0  
- **Implementation Location**: `src/lib/dimension-extraction-service.ts`  
- **Pattern**: Extraction / Transformation  
- **Dependencies**: T-1.2.0, T-1.3.1  
- **Estimated Human Work Hours**: 5-7 hours  
- **Description**: Extract persona parameters from chunk dimensions

**Components/Elements**:
- [T-2.1.1:ELE-1] extractPersona() function
  - Stubs and Code Location(s): New function in extraction service
  - Inputs: chunkDimensions array
  - Outputs: persona string + confidence score
- [T-2.1.1:ELE-2] Persona mapping lookup table
  - Stubs and Code Location(s): PERSONA_DIMENSION_MAP constant
  - Maps: Dimension values -> persona types
- [T-2.1.1:ELE-3] Confidence calculation algorithm
  - Stubs and Code Location(s): calculatePersonaConfidence()
  - Logic: Based on dimension score and consistency

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Identify relevant dimensions for persona (semantic, emotional) (implements ELE-2)
   - [PREP-2] Define persona types matching existing wireframe personas (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Create persona mapping lookup table (implements ELE-2)
   - [IMP-2] Implement extractPersona function (implements ELE-1)
   - [IMP-3] Implement confidence calculation (implements ELE-3)
   - [IMP-4] Add fallback logic for ambiguous dimensions (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test with clear persona dimensions (validates ELE-1)
   - [VAL-2] Test with ambiguous dimensions (validates ELE-1, ELE-3)
   - [VAL-3] Verify confidence scores are reasonable (validates ELE-3)

---

#### T-2.1.2: Implement Emotion and Tone Extraction
- **FR Reference**: FR9.1.2  
- **Parent Task**: T-2.1.0  
- **Implementation Location**: `src/lib/dimension-extraction-service.ts`  
- **Pattern**: Extraction / Transformation  
- **Dependencies**: T-2.1.1  
- **Estimated Human Work Hours**: 5-7 hours  
- **Description**: Extract emotion and tone parameters from chunk dimensions

**Components/Elements**:
- [T-2.1.2:ELE-1] extractEmotion() function
  - Stubs and Code Location(s): New function in extraction service
  - Uses: Emotional tone and sentiment dimensions
- [T-2.1.2:ELE-2] extractTone() function
  - Stubs and Code Location(s): New function in extraction service
  - Uses: Formality and style dimensions
- [T-2.1.2:ELE-3] Emotion/tone mapping tables
  - Stubs and Code Location(s): EMOTION_MAP, TONE_MAP constants

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Map dimension values to emotion types (implements ELE-3)
   - [PREP-2] Map dimension values to tone types (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Implement extractEmotion function (implements ELE-1)
   - [IMP-2] Implement extractTone function (implements ELE-2)
   - [IMP-3] Add weighted scoring for multiple relevant dimensions (implements ELE-1-2)
3. Validation Phase:
   - [VAL-1] Test emotion extraction accuracy (validates ELE-1)
   - [VAL-2] Test tone extraction accuracy (validates ELE-2)

---

#### T-2.1.3: Implement Complexity-Based Parameter Derivation
- **FR Reference**: FR9.1.2  
- **Parent Task**: T-2.1.0  
- **Implementation Location**: `src/lib/dimension-extraction-service.ts`  
- **Pattern**: Calculation / Business Logic  
- **Dependencies**: T-2.1.1  
- **Estimated Human Work Hours**: 4-6 hours  
- **Description**: Derive turn count and conversation length from complexity dimensions

**Components/Elements**:
- [T-2.1.3:ELE-1] deriveTurnCount() function
  - Stubs and Code Location(s): New function in extraction service
  - Logic: Maps complexity score (0-100) to turn count range (4-20)
- [T-2.1.3:ELE-2] deriveConversationDepth() function
  - Stubs and Code Location(s): New function in extraction service
  - Returns: depth level (shallow, moderate, deep)
- [T-2.1.3:ELE-3] Complexity threshold configuration
  - Stubs and Code Location(s): COMPLEXITY_THRESHOLDS constant

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define complexity ranges and corresponding turn counts (implements ELE-3)
   - [PREP-2] Define depth levels based on dimension scores (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Implement deriveTurnCount with threshold logic (implements ELE-1)
   - [IMP-2] Implement deriveConversationDepth function (implements ELE-2)
   - [IMP-3] Add randomization within ranges for variety (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test turn count derivation for different complexity levels (validates ELE-1)
   - [VAL-2] Test depth level assignment (validates ELE-2)

---

### T-2.2.0: Chunk Context Injection System
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Generation Quality / Contextual Relevance
- **Implementation Location**: `src/lib/context-injection-service.ts` (new file)
- **Pattern**: Template Injection / Context Builder
- **Dependencies**: T-1.2.0, T-2.1.0
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Build system to inject chunk content and metadata into generation prompts
- **Testing Tools**: Jest, Prompt validation
- **Test Coverage Requirements**: 85% code coverage
- **Completes Component?**: Yes - Context injection system fully operational

**Functional Requirements Acceptance Criteria**:
- System must inject chunk text into prompt template {{chunk_content}} placeholder
- Must inject extracted dimensions as {{persona}}, {{emotion}}, {{topic}} placeholders
- Must inject chunk metadata (document title, author, date) into {{metadata}} placeholder
- Must handle chunk text truncation for length limits (max 2000 characters)
- Must preserve chunk formatting (paragraphs, line breaks) in injected context
- Must sanitize chunk content to prevent prompt injection attacks
- Must support multiple chunks injection for conversation context (up to 3 chunks)
- Injection must maintain template structure without breaking generation
- Must log injected context for debugging and audit purposes
- System must validate all placeholders replaced before prompt submission

#### T-2.2.1: Implement Base Context Builder
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-2.2.0  
- **Implementation Location**: `src/lib/context-injection-service.ts`  
- **Pattern**: Builder Pattern  
- **Dependencies**: T-1.2.0  
- **Estimated Human Work Hours**: 6-8 hours  
- **Description**: Create context builder class for prompt injection

**Components/Elements**:
- [T-2.2.1:ELE-1] ContextBuilder class
  - Stubs and Code Location(s): New class in context-injection-service.ts
  - Methods: addChunk(), addMetadata(), build()
- [T-2.2.1:ELE-2] Template placeholder replacement logic
  - Stubs and Code Location(s): replacePlaceholders() method
  - Handles: {{variable}} syntax replacement
- [T-2.2.1:ELE-3] Context validation function
  - Stubs and Code Location(s): validateContext() method
  - Checks: All required placeholders filled

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define context object structure (implements ELE-1)
   - [PREP-2] Identify all placeholder types needed (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement ContextBuilder class with fluent interface (implements ELE-1)
   - [IMP-2] Implement placeholder replacement logic (implements ELE-2)
   - [IMP-3] Implement context validation (implements ELE-3)
   - [IMP-4] Add error handling for missing required data (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test builder with complete data (validates ELE-1-2)
   - [VAL-2] Test validation with incomplete data (validates ELE-3)

---

## 3. User Interface Components

### T-3.1.0: Chunk Selector Component
- **FR Reference**: FR9.1.1
- **Impact Weighting**: User Experience / Workflow Efficiency
- **Implementation Location**: `train-wireframe/src/components/generation/ChunkSelector.tsx` (new file)
- **Pattern**: React Component / Search Interface
- **Dependencies**: T-1.2.0
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Create UI component allowing users to select source chunks for conversation generation
- **Testing Tools**: Vitest, React Testing Library
- **Test Coverage Requirements**: 80% component coverage
- **Completes Component?**: Yes - Chunk selector fully functional

**Functional Requirements Acceptance Criteria**:
- Component must display searchable list of available chunks from chunks-alpha module
- Must show chunk preview (first 200 characters) in selection list
- Must display chunk metadata: document title, category, quality score
- Must support filtering chunks by: document, category, quality score, date range
- Must support search by chunk content keywords (full-text search)
- Selected chunk must display full text in preview panel
- Must show dimension summary for selected chunk (key dimensions with scores)
- Must support multi-select for conversation using multiple chunks
- Selection must update parent component state via callback
- Component must handle loading states and empty results gracefully
- Must display chunk usage count (how many conversations already use this chunk)

#### T-3.1.1: Build Chunk List Display
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-3.1.0  
- **Implementation Location**: `train-wireframe/src/components/generation/ChunkSelector.tsx`  
- **Pattern**: React List Component  
- **Dependencies**: T-1.2.0  
- **Estimated Human Work Hours**: 5-7 hours  
- **Description**: Implement chunk list display with preview

**Components/Elements**:
- [T-3.1.1:ELE-1] ChunkListItem component
  - Stubs and Code Location(s): New component (child of ChunkSelector)
  - Displays: Chunk preview, metadata, selection checkbox
- [T-3.1.1:ELE-2] Chunk preview truncation logic
  - Stubs and Code Location(s): truncateChunkText() utility function
  - Limits: First 200 characters with ellipsis
- [T-3.1.1:ELE-3] Virtual scrolling for performance
  - Stubs and Code Location(s): Using react-virtual or similar
  - Handles: Large lists (1000+ chunks)

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design chunk list item layout (implements ELE-1)
   - [PREP-2] Determine required chunk metadata fields (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Create ChunkListItem component (implements ELE-1)
   - [IMP-2] Implement text truncation utility (implements ELE-2)
   - [IMP-3] Integrate virtual scrolling library (implements ELE-3)
   - [IMP-4] Add click handlers for selection (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test rendering with mock chunk data (validates ELE-1)
   - [VAL-2] Test performance with large datasets (validates ELE-3)
   - [VAL-3] Test selection interaction (validates ELE-1)

---

#### T-3.1.2: Implement Chunk Search and Filtering
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-3.1.0  
- **Implementation Location**: `train-wireframe/src/components/generation/ChunkSelector.tsx`  
- **Pattern**: Search/Filter Component  
- **Dependencies**: T-3.1.1, T-1.2.3  
- **Estimated Human Work Hours**: 5-7 hours  
- **Description**: Add search and filter controls to chunk selector

**Components/Elements**:
- [T-3.1.2:ELE-1] Search input with debouncing
  - Stubs and Code Location(s): SearchBar sub-component
  - Debounce: 300ms delay before search execution
- [T-3.1.2:ELE-2] Filter dropdown controls
  - Stubs and Code Location(s): FilterControls sub-component
  - Filters: Document, category, quality, date
- [T-3.1.2:ELE-3] Active filters display badges
  - Stubs and Code Location(s): ActiveFilters sub-component
  - Shows: Applied filters with remove option

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design filter UI layout (implements ELE-2)
   - [PREP-2] Define filter state structure (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement search input with debounce hook (implements ELE-1)
   - [IMP-2] Create filter dropdown components (implements ELE-2)
   - [IMP-3] Implement active filters badge display (implements ELE-3)
   - [IMP-4] Connect filters to API query parameters (implements ELE-2)
3. Validation Phase:
   - [VAL-1] Test search debouncing (validates ELE-1)
   - [VAL-2] Test filter application and clearing (validates ELE-2-3)

---

### T-3.2.0: Chunk Preview Panel Component
- **FR Reference**: FR9.1.1
- **Impact Weighting**: User Experience / Information Display
- **Implementation Location**: `train-wireframe/src/components/generation/ChunkPreviewPanel.tsx` (new file)
- **Pattern**: React Detail Panel Component
- **Dependencies**: T-1.2.0
- **Estimated Human Work Hours**: 10-14 hours
- **Description**: Display full chunk details and dimension analysis
- **Testing Tools**: Vitest, React Testing Library
- **Test Coverage Requirements**: 75% component coverage
- **Completes Component?**: Yes - Chunk preview panel complete

**Functional Requirements Acceptance Criteria**:
- Panel must display full chunk text (scrollable if long)
- Must show document metadata: title, author, date, category
- Must display dimension summary table with all 60 dimensions
- Dimension table must show: dimension name, value, confidence score
- Must highlight key dimensions (top 10 by relevance score)
- Must show chunk quality metrics if available
- Must display usage statistics: # of conversations using this chunk
- Panel must include "Select for Generation" button
- Must support closing/collapsing panel
- Panel must be responsive (collapsible on mobile views)

#### T-3.2.1: Build Dimension Display Table
- **FR Reference**: FR9.1.1, FR9.1.2  
- **Parent Task**: T-3.2.0  
- **Implementation Location**: `train-wireframe/src/components/generation/ChunkPreviewPanel.tsx`  
- **Pattern**: Data Table Component  
- **Dependencies**: T-1.2.1  
- **Estimated Human Work Hours**: 4-6 hours  
- **Description**: Create table displaying chunk dimensions with formatting

**Components/Elements**:
- [T-3.2.1:ELE-1] DimensionTable component
  - Stubs and Code Location(s): Child component of ChunkPreviewPanel
  - Columns: Dimension Name, Value, Confidence, Category
- [T-3.2.1:ELE-2] Dimension highlighting logic
  - Stubs and Code Location(s): highlightKeyDimensions() utility
  - Highlights: Top 10 dimensions by relevance
- [T-3.2.1:ELE-3] Dimension grouping by category
  - Stubs and Code Location(s): groupDimensionsByCategory() utility
  - Groups: Semantic, Complexity, Domain, etc.

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design dimension table layout (implements ELE-1)
   - [PREP-2] Define dimension categories for grouping (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create DimensionTable component using Shadcn Table (implements ELE-1)
   - [IMP-2] Implement highlighting logic (implements ELE-2)
   - [IMP-3] Implement category grouping (implements ELE-3)
   - [IMP-4] Add sorting by value/confidence (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test table rendering with sample dimensions (validates ELE-1)
   - [VAL-2] Verify highlighting of key dimensions (validates ELE-2)
   - [VAL-3] Test grouping display (validates ELE-3)

---

### T-3.3.0: Generation Form Integration
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Workflow Integration / User Experience
- **Implementation Location**: `train-wireframe/src/components/generation/SingleGenerationForm.tsx`
- **Pattern**: Form Enhancement / Component Extension
- **Dependencies**: T-3.1.0, T-3.2.0
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Integrate chunk selector into existing generation form
- **Testing Tools**: Vitest, React Testing Library, Integration Tests
- **Test Coverage Requirements**: 85% component coverage
- **Completes Component?**: Yes - Generation form with chunk integration complete

**Functional Requirements Acceptance Criteria**:
- Form must include "Select Source Chunk" section with ChunkSelector component
- Chunk selection must auto-populate persona, emotion, topic fields from dimensions
- Must show "Auto-filled from chunk" indicator for populated fields
- Must allow manual override of auto-populated fields
- Must display selected chunk summary in form (title, preview)
- Form validation must ensure chunk selected for dimension-driven generation mode
- Must support "Manual Entry" mode bypassing chunk requirement
- Generation mode toggle: "Manual" vs "Chunk-Based"
- Form submission must include chunk ID in request payload
- Must show loading state during dimension extraction
- Form must handle chunk extraction errors gracefully with user feedback

#### T-3.3.1: Add Chunk Selection Section to Form
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-3.3.0  
- **Implementation Location**: `train-wireframe/src/components/generation/SingleGenerationForm.tsx`  
- **Pattern**: Form Section Extension  
- **Dependencies**: T-3.1.0  
- **Estimated Human Work Hours**: 4-6 hours  
- **Description**: Integrate ChunkSelector into generation form

**Components/Elements**:
- [T-3.3.1:ELE-1] Chunk selection form section
  - Stubs and Code Location(s): New form section in SingleGenerationForm
  - Contains: ChunkSelector component, selected chunk display
- [T-3.3.1:ELE-2] Generation mode toggle
  - Stubs and Code Location(s): Mode switch component
  - Options: "Manual Entry" vs "Chunk-Based Generation"
- [T-3.3.1:ELE-3] Selected chunk summary display
  - Stubs and Code Location(s): SelectedChunkSummary sub-component
  - Shows: Chunk title, preview, clear selection button

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing SingleGenerationForm structure (implements ELE-1)
   - [PREP-2] Design chunk section layout within form (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Add chunk selection section to form (implements ELE-1)
   - [IMP-2] Implement generation mode toggle (implements ELE-2)
   - [IMP-3] Create selected chunk summary component (implements ELE-3)
   - [IMP-4] Wire up ChunkSelector callbacks (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test chunk selection flow (validates ELE-1)
   - [VAL-2] Test mode toggle behavior (validates ELE-2)
   - [VAL-3] Test chunk deselection (validates ELE-3)

---

#### T-3.3.2: Implement Auto-Population from Dimensions
- **FR Reference**: FR9.1.2  
- **Parent Task**: T-3.3.0  
- **Implementation Location**: `train-wireframe/src/components/generation/SingleGenerationForm.tsx`  
- **Pattern**: Form Auto-Fill / State Management  
- **Dependencies**: T-3.3.1, T-2.1.0  
- **Estimated Human Work Hours**: 6-8 hours  
- **Description**: Auto-populate form fields from selected chunk dimensions

**Components/Elements**:
- [T-3.3.2:ELE-1] Dimension extraction trigger
  - Stubs and Code Location(s): useEffect hook on chunk selection
  - Calls: Dimension extraction service
- [T-3.3.2:ELE-2] Form field population logic
  - Stubs and Code Location(s): populateFromDimensions() function
  - Updates: persona, emotion, topic, turn count fields
- [T-3.3.2:ELE-3] Auto-fill indicator badges
  - Stubs and Code Location(s): AutoFilledBadge component
  - Shows: "Auto-filled from chunk" label with info icon

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Map dimension extraction results to form fields (implements ELE-2)
   - [PREP-2] Design auto-fill indicator UI (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Add useEffect hook triggering extraction on chunk select (implements ELE-1)
   - [IMP-2] Implement field population logic (implements ELE-2)
   - [IMP-3] Add auto-fill indicator badges to fields (implements ELE-3)
   - [IMP-4] Preserve user-edited values (don't overwrite manual changes) (implements ELE-2)
3. Validation Phase:
   - [VAL-1] Test auto-population on chunk selection (validates ELE-1-2)
   - [VAL-2] Test manual override behavior (validates ELE-2)
   - [VAL-3] Verify indicator display (validates ELE-3)

---

### T-3.4.0: Conversation Detail Chunk Display
- **FR Reference**: FR9.1.1
- **Impact Weighting**: Information Transparency / Traceability
- **Implementation Location**: `train-wireframe/src/components/dashboard/ConversationDetailModal.tsx` (new/enhanced)
- **Pattern**: Modal Component Extension
- **Dependencies**: T-1.2.2
- **Estimated Human Work Hours**: 8-12 hours
- **Description**: Display linked chunk information in conversation detail view
- **Testing Tools**: Vitest, React Testing Library
- **Test Coverage Requirements**: 75% component coverage
- **Completes Component?**: Yes - Conversation detail with chunk info complete

**Functional Requirements Acceptance Criteria**:
- Conversation detail must show "Source Chunk" section if chunk linked
- Must display chunk title and document name as clickable links
- Must show chunk preview (first 300 characters)
- Must display relationship type (primary, reference, context)
- Must show dimension mapping summary (which dimensions informed generation)
- Must display confidence score for chunk association
- Must include "View Full Chunk" button opening chunk detail
- Section must clearly indicate if conversation is orphaned (chunk deleted)
- Must show multiple chunks if conversation uses multiple sources
- Must format dimension mappings as expandable/collapsible list

#### T-3.4.1: Create Source Chunk Info Section
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-3.4.0  
- **Implementation Location**: `train-wireframe/src/components/dashboard/ConversationDetailModal.tsx`  
- **Pattern**: Information Section Component  
- **Dependencies**: T-1.2.2  
- **Estimated Human Work Hours**: 4-6 hours  
- **Description**: Add source chunk information section to conversation detail

**Components/Elements**:
- [T-3.4.1:ELE-1] SourceChunkSection component
  - Stubs and Code Location(s): New section component
  - Displays: Chunk metadata, preview, relationship info
- [T-3.4.1:ELE-2] Chunk link component
  - Stubs and Code Location(s): ChunkLink component
  - Action: Opens chunk detail in new panel/modal
- [T-3.4.1:ELE-3] Orphaned conversation indicator
  - Stubs and Code Location(s): OrphanedBadge component
  - Displays: Warning if chunk deleted/missing

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design source chunk section layout (implements ELE-1)
   - [PREP-2] Define orphaned conversation visual treatment (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Create SourceChunkSection component (implements ELE-1)
   - [IMP-2] Implement clickable chunk link (implements ELE-2)
   - [IMP-3] Add orphaned conversation indicator (implements ELE-3)
   - [IMP-4] Fetch chunk data on conversation detail open (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test section rendering with valid chunk (validates ELE-1-2)
   - [VAL-2] Test orphaned conversation display (validates ELE-3)

---

## 4. Feature Implementation

### T-4.1.0: Chunk-Based Conversation Generation Flow
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Core Functionality / Revenue Impact
- **Implementation Location**: `src/app/api/conversations/generate/route.ts` (enhanced)
- **Pattern**: API Endpoint Enhancement / Generation Pipeline
- **Dependencies**: T-1.2.0, T-2.1.0, T-2.2.0, T-3.3.0
- **Estimated Human Work Hours**: 24-30 hours
- **Description**: Implement complete chunk-based generation workflow from selection to conversation creation
- **Testing Tools**: Jest, Supertest (API testing), Integration tests
- **Test Coverage Requirements**: 90% critical path coverage
- **Completes Component?**: Yes - Complete chunk-based generation operational

**Functional Requirements Acceptance Criteria**:
- API endpoint must accept chunkId in request payload for chunk-based generation
- Must retrieve chunk data and dimensions before generation
- Must extract conversation parameters from chunk dimensions
- Must inject chunk context into prompt template
- Must call Claude API with enriched prompt
- Must store conversation with chunk_id foreign key
- Must create conversation_chunk_link record with relationship metadata
- Must log dimension extraction and mapping for audit
- Must handle errors at each stage with specific error messages
- Generation must complete within 45 seconds end-to-end
- Must support both single chunk and multi-chunk generation modes
- Must validate chunk exists before starting generation

#### T-4.1.1: Enhance Generation API Endpoint
- **FR Reference**: FR9.1.1, FR9.1.2  
- **Parent Task**: T-4.1.0  
- **Implementation Location**: `src/app/api/conversations/generate/route.ts`  
- **Pattern**: API Endpoint Enhancement  
- **Dependencies**: T-1.2.0, T-2.1.0  
- **Estimated Human Work Hours**: 10-12 hours  
- **Description**: Add chunk-based generation logic to API endpoint

**Components/Elements**:
- [T-4.1.1:ELE-1] Request validation with chunk handling
  - Stubs and Code Location(s): Endpoint request validation
  - Validates: chunkId presence and format
- [T-4.1.1:ELE-2] Chunk data retrieval step
  - Stubs and Code Location(s): Pre-generation chunk fetch
  - Calls: conversationChunkService.getChunkById()
- [T-4.1.1:ELE-3] Dimension extraction integration
  - Stubs and Code Location(s): Parameter extraction from dimensions
  - Calls: dimensionExtractionService.extractAll()
- [T-4.1.1:ELE-4] Context injection into prompt
  - Stubs and Code Location(s): Prompt enrichment step
  - Calls: contextInjectionService.buildContext()

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Review existing generation endpoint structure (implements ELE-1)
   - [PREP-2] Define request payload schema with chunk fields (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Add chunk ID validation to request handler (implements ELE-1)
   - [IMP-2] Implement chunk data retrieval step (implements ELE-2)
   - [IMP-3] Integrate dimension extraction service (implements ELE-3)
   - [IMP-4] Integrate context injection service (implements ELE-4)
   - [IMP-5] Add error handling for each step (implements ELE-1-4)
3. Validation Phase:
   - [VAL-1] Test API with valid chunk ID (validates ELE-1-4)
   - [VAL-2] Test API with invalid chunk ID (validates ELE-1-2)
   - [VAL-3] Test dimension extraction failure handling (validates ELE-3)

---

#### T-4.1.2: Implement Conversation-Chunk Linking
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-4.1.0  
- **Implementation Location**: `src/app/api/conversations/generate/route.ts`  
- **Pattern**: Database Transaction / Association Creation  
- **Dependencies**: T-4.1.1, T-1.2.2  
- **Estimated Human Work Hours**: 6-8 hours  
- **Description**: Store conversation-chunk association after successful generation

**Components/Elements**:
- [T-4.1.2:ELE-1] Link creation after conversation save
  - Stubs and Code Location(s): Post-generation link creation
  - Calls: conversationChunkService.linkConversationToChunk()
- [T-4.1.2:ELE-2] Relationship metadata calculation
  - Stubs and Code Location(s): Metadata builder
  - Includes: relationship type, confidence score, dimension mappings
- [T-4.1.2:ELE-3] Transaction-like error handling
  - Stubs and Code Location(s): Error rollback logic
  - Behavior: Delete conversation if linking fails

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define relationship type logic (primary vs reference) (implements ELE-2)
   - [PREP-2] Design error rollback strategy (implements ELE-3)
2. Implementation Phase:
   - [IMP-1] Add link creation step after conversation save (implements ELE-1)
   - [IMP-2] Implement relationship metadata calculation (implements ELE-2)
   - [IMP-3] Add rollback logic for link creation failures (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Test successful link creation (validates ELE-1-2)
   - [VAL-2] Test rollback on link failure (validates ELE-3)

---

### T-4.2.0: Orphaned Conversation Management
- **FR Reference**: FR9.1.1
- **Impact Weighting**: Data Integrity / User Experience
- **Implementation Location**: `src/lib/orphaned-conversation-service.ts` (new file)
- **Pattern**: Background Job / Maintenance Service
- **Dependencies**: T-1.2.2
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Detect and manage conversations orphaned by chunk deletions
- **Testing Tools**: Jest, Database integration tests
- **Test Coverage Requirements**: 85% code coverage
- **Completes Component?**: Yes - Orphan management complete

**Functional Requirements Acceptance Criteria**:
- Service must detect conversations with missing chunk references (orphans)
- Must flag orphaned conversations with is_orphaned=true
- Must preserve orphaned conversation data (don't cascade delete)
- Must notify users of orphaned conversations in dashboard
- Must provide "Re-link to Chunk" action for orphaned conversations
- Must support bulk orphan detection via scheduled job
- Detection must run daily via cron/scheduler
- Must log orphan detection events for audit
- Dashboard must display orphaned conversation count in warning badge
- Orphaned conversations must be filterable in conversation table

#### T-4.2.1: Implement Orphan Detection Logic
- **FR Reference**: FR9.1.1  
- **Parent Task**: T-4.2.0  
- **Implementation Location**: `src/lib/orphaned-conversation-service.ts`  
- **Pattern**: Data Integrity Check  
- **Dependencies**: T-1.2.2  
- **Estimated Human Work Hours**: 5-7 hours  
- **Description**: Create service detecting orphaned conversations

**Components/Elements**:
- [T-4.2.1:ELE-1] detectOrphans() function
  - Stubs and Code Location(s): Main detection method
  - Query: Find conversations with chunk_id not in chunks table
- [T-4.2.1:ELE-2] Orphan flagging logic
  - Stubs and Code Location(s): flagAsOrphaned() helper
  - Action: Update is_orphaned=true, add timestamp
- [T-4.2.1:ELE-3] Orphan count aggregation
  - Stubs and Code Location(s): getOrphanCount() method
  - Returns: Count by status, tier, etc.

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Design LEFT JOIN query for orphan detection (implements ELE-1)
   - [PREP-2] Define orphan metadata to store (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement detectOrphans query (implements ELE-1)
   - [IMP-2] Implement flagging logic (implements ELE-2)
   - [IMP-3] Implement count aggregation (implements ELE-3)
   - [IMP-4] Add logging for detected orphans (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test detection with mock orphaned data (validates ELE-1)
   - [VAL-2] Verify flagging updates correctly (validates ELE-2)
   - [VAL-3] Test count accuracy (validates ELE-3)

---

### T-4.3.0: Dimension-Based Chunk Recommendation
- **FR Reference**: FR9.1.2
- **Impact Weighting**: User Experience / Generation Quality
- **Implementation Location**: `src/lib/chunk-recommendation-service.ts` (new file)
- **Pattern**: Recommendation Engine / ML-Like Scoring
- **Dependencies**: T-1.2.3, T-2.1.0
- **Estimated Human Work Hours**: 20-24 hours
- **Description**: Recommend best chunks for desired conversation parameters
- **Testing Tools**: Jest, Recommendation accuracy tests
- **Test Coverage Requirements**: 80% code coverage
- **Completes Component?**: Yes - Recommendation engine operational

**Functional Requirements Acceptance Criteria**:
- Service must accept target persona, emotion, topic as input
- Must return ranked list of chunks matching criteria (top 10)
- Ranking must use composite score from dimension matches
- Must consider dimension confidence scores in ranking
- Must exclude already-used chunks if specified
- Must support filtering recommendations by quality threshold
- Recommendations must include match score explanation
- Must cache recommendations for identical queries (5 minute TTL)
- Service must complete recommendations within 300ms
- Must provide "Why recommended?" metadata for each chunk

#### T-4.3.1: Implement Chunk Scoring Algorithm
- **FR Reference**: FR9.1.2  
- **Parent Task**: T-4.3.0  
- **Implementation Location**: `src/lib/chunk-recommendation-service.ts`  
- **Pattern**: Scoring Algorithm  
- **Dependencies**: T-1.2.3  
- **Estimated Human Work Hours**: 8-10 hours  
- **Description**: Create algorithm scoring chunk relevance to target parameters

**Components/Elements**:
- [T-4.3.1:ELE-1] scoreChunk() function
  - Stubs and Code Location(s): Core scoring function
  - Calculates: Composite relevance score (0-100)
- [T-4.3.1:ELE-2] Dimension matching logic
  - Stubs and Code Location(s): matchDimension() helper
  - Compares: Target value to chunk dimension value
- [T-4.3.1:ELE-3] Confidence weighting
  - Stubs and Code Location(s): applyConfidenceWeight() helper
  - Adjusts: Score based on dimension confidence

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define scoring formula combining multiple dimensions (implements ELE-1)
   - [PREP-2] Determine dimension weight distribution (implements ELE-1)
2. Implementation Phase:
   - [IMP-1] Implement dimension matching logic (implements ELE-2)
   - [IMP-2] Implement confidence weighting (implements ELE-3)
   - [IMP-3] Implement composite scoring function (implements ELE-1)
   - [IMP-4] Add normalization to 0-100 scale (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test scoring with perfect match (validates ELE-1-2)
   - [VAL-2] Test scoring with partial match (validates ELE-1-3)
   - [VAL-3] Test edge cases (all dimensions match/none match) (validates ELE-1)

---

#### T-4.3.2: Implement Recommendation Ranking and Filtering
- **FR Reference**: FR9.1.2  
- **Parent Task**: T-4.3.0  
- **Implementation Location**: `src/lib/chunk-recommendation-service.ts`  
- **Pattern**: Ranking / Filtering Pipeline  
- **Dependencies**: T-4.3.1  
- **Estimated Human Work Hours**: 6-8 hours  
- **Description**: Rank scored chunks and apply filters

**Components/Elements**:
- [T-4.3.2:ELE-1] recommendChunks() main function
  - Stubs and Code Location(s): Public API method
  - Returns: Ranked array of chunks with scores
- [T-4.3.2:ELE-2] Ranking algorithm
  - Stubs and Code Location(s): rankChunks() helper
  - Sorts: By composite score descending
- [T-4.3.2:ELE-3] Filter application logic
  - Stubs and Code Location(s): applyFilters() helper
  - Filters: Quality threshold, usage exclusion, etc.

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Define filter parameter interface (implements ELE-3)
   - [PREP-2] Design ranking tie-breaker logic (implements ELE-2)
2. Implementation Phase:
   - [IMP-1] Implement ranking algorithm (implements ELE-2)
   - [IMP-2] Implement filter application (implements ELE-3)
   - [IMP-3] Implement main recommendChunks function (implements ELE-1)
   - [IMP-4] Add limit parameter (top N results) (implements ELE-1)
3. Validation Phase:
   - [VAL-1] Test ranking order correctness (validates ELE-2)
   - [VAL-2] Test filter application (validates ELE-3)
   - [VAL-3] Test complete recommendation flow (validates ELE-1)

---

## 5. Quality Assurance & Testing

### T-5.1.0: Integration Test Suite for Chunk Features
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Quality Assurance / Reliability
- **Implementation Location**: `src/__tests__/integration/chunk-integration.test.ts` (new file)
- **Pattern**: Integration Testing
- **Dependencies**: All T-4.x tasks
- **Estimated Human Work Hours**: 16-20 hours
- **Description**: Comprehensive integration tests for chunk-conversation features
- **Testing Tools**: Jest, Supertest, Test database
- **Test Coverage Requirements**: 85% integration path coverage
- **Completes Component?**: Yes - Integration test suite complete

**Functional Requirements Acceptance Criteria**:
- Test suite must cover end-to-end chunk selection to generation flow
- Must test dimension extraction accuracy with sample chunks
- Must test conversation-chunk linking creation and retrieval
- Must test orphan detection and flagging
- Must test chunk recommendation accuracy
- Must include performance tests (generation <45s, recommendations <300ms)
- Must test error scenarios (missing chunk, extraction failure, etc.)
- Tests must use isolated test database with cleanup
- Must include data fixtures for reproducible testing
- Test suite must run in CI/CD pipeline

#### T-5.1.1: Create Test Data Fixtures
- **FR Reference**: FR9.1.1, FR9.1.2  
- **Parent Task**: T-5.1.0  
- **Implementation Location**: `src/__tests__/fixtures/chunk-fixtures.ts`  
- **Pattern**: Test Data Factory  
- **Dependencies**: None  
- **Estimated Human Work Hours**: 4-6 hours  
- **Description**: Create reusable test data for chunk integration tests

**Components/Elements**:
- [T-5.1.1:ELE-1] Sample chunk data with dimensions
  - Stubs and Code Location(s): mockChunks array
  - Includes: Varied dimension values covering all scenarios
- [T-5.1.1:ELE-2] Sample conversation data
  - Stubs and Code Location(s): mockConversations array
  - Includes: Linked and unlinked conversations
- [T-5.1.1:ELE-3] Test database seeding functions
  - Stubs and Code Location(s): seedTestDatabase(), cleanupTestDatabase()

**Implementation Process**:
1. Preparation Phase:
   - [PREP-1] Identify test scenarios needing fixtures (implements ELE-1-2)
   - [PREP-2] Design fixture data structure (implements ELE-1-2)
2. Implementation Phase:
   - [IMP-1] Create mock chunk fixtures (implements ELE-1)
   - [IMP-2] Create mock conversation fixtures (implements ELE-2)
   - [IMP-3] Implement database seeding functions (implements ELE-3)
   - [IMP-4] Add cleanup functions (implements ELE-3)
3. Validation Phase:
   - [VAL-1] Verify fixtures load correctly (validates ELE-3)
   - [VAL-2] Test cleanup leaves no residual data (validates ELE-3)

---

### T-5.2.0: Performance Testing and Optimization
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Performance / Scalability
- **Implementation Location**: `src/__tests__/performance/chunk-performance.test.ts` (new file)
- **Pattern**: Performance Benchmarking
- **Dependencies**: T-5.1.0
- **Estimated Human Work Hours**: 12-16 hours
- **Description**: Performance tests ensuring chunk features meet latency requirements
- **Testing Tools**: Jest, Artillery (load testing)
- **Test Coverage Requirements**: N/A (benchmarking)
- **Completes Component?**: Yes - Performance testing complete

**Functional Requirements Acceptance Criteria**:
- Chunk retrieval must complete within 50ms (p95)
- Dimension extraction must complete within 200ms (p95)
- Chunk-based generation must complete within 45 seconds (p95)
- Chunk recommendations must complete within 300ms (p95)
- Orphan detection for 10,000 conversations must complete within 5 seconds
- Database queries must use indexes effectively (verified via EXPLAIN)
- Load testing must support 50 concurrent generation requests
- Performance tests must identify bottlenecks with profiling
- Tests must run nightly in CI/CD pipeline
- Performance regression alerts must trigger if thresholds exceeded

---

## 6. Deployment & Operations

### T-6.1.0: Database Migration Deployment
- **FR Reference**: FR9.1.1
- **Impact Weighting**: Operations / Deployment
- **Implementation Location**: Supabase migrations directory
- **Pattern**: Database Migration Management
- **Dependencies**: T-1.1.0, T-1.1.1
- **Estimated Human Work Hours**: 8-12 hours
- **Description**: Deploy database schema changes to production
- **Testing Tools**: Supabase CLI, Migration testing scripts
- **Test Coverage Requirements**: 100% migration rollback tested
- **Completes Component?**: Yes - Database migrations deployed

**Functional Requirements Acceptance Criteria**:
- Migrations must be tested in staging environment before production
- Must include rollback scripts for each migration
- Migration must complete within 5 minutes for production database
- Must verify data integrity after migration (no data loss)
- Must create database backup before migration
- Migration must not cause downtime (online migration if possible)
- Must verify indexes created successfully after migration
- Foreign key constraints must be validated post-migration
- Migration script must log progress for monitoring
- Must document any manual post-migration steps

---

### T-6.2.0: Feature Flag Configuration
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Risk Mitigation / Deployment Strategy
- **Implementation Location**: `src/lib/feature-flags.ts` (enhanced)
- **Pattern**: Feature Flag System
- **Dependencies**: None (standalone)
- **Estimated Human Work Hours**: 6-8 hours
- **Description**: Implement feature flags for gradual rollout
- **Testing Tools**: Manual verification, Feature flag testing
- **Test Coverage Requirements**: 100% flag state coverage
- **Completes Component?**: Yes - Feature flags operational

**Functional Requirements Acceptance Criteria**:
- Must create feature flags: ENABLE_CHUNK_INTEGRATION, ENABLE_DIMENSION_EXTRACTION, ENABLE_CHUNK_RECOMMENDATIONS
- Flags must be configurable per environment (dev/staging/prod)
- UI must respect feature flags (hide chunk selector if disabled)
- API must respect feature flags (return error if disabled)
- Flags must be toggleable without code deployment
- Must support gradual rollout (percentage-based flagging)
- Flag changes must take effect within 1 minute
- Must log flag state on each use for monitoring
- Flags must have default safe state (disabled)
- Must provide admin UI for flag management (optional: future)

---

### T-6.3.0: Monitoring and Observability Setup
- **FR Reference**: FR9.1.1, FR9.1.2
- **Impact Weighting**: Operations / Reliability
- **Implementation Location**: Logging/monitoring infrastructure
- **Pattern**: Observability Implementation
- **Dependencies**: All feature tasks
- **Estimated Human Work Hours**: 10-14 hours
- **Description**: Set up monitoring for chunk integration features
- **Testing Tools**: Logging libraries, APM tools
- **Test Coverage Requirements**: N/A (monitoring setup)
- **Completes Component?**: Yes - Monitoring fully configured

**Functional Requirements Acceptance Criteria**:
- Must log all chunk retrieval attempts (success/failure/latency)
- Must log all dimension extraction attempts with accuracy metrics
- Must log all generation requests with chunk_id for tracing
- Must track orphan conversation count as metric
- Must monitor recommendation service performance (latency, cache hit rate)
- Must create dashboard visualizing chunk feature usage
- Must set up alerts for: high error rates (>5%), slow generation (>60s), orphan spike (>10% increase)
- Must integrate with existing application logging (structured logs)
- Logs must include trace IDs for request correlation
- Must retain logs for 30 days minimum

---

## Summary

**Total Tasks**: 72 comprehensive tasks
- Foundation & Infrastructure: 12 tasks
- Data Management & Processing: 15 tasks
- User Interface Components: 18 tasks
- Feature Implementation: 16 tasks
- Quality Assurance & Testing: 6 tasks
- Deployment & Operations: 5 tasks

**Estimated Total Hours**: 520-680 hours (13-17 weeks at 40 hours/week)

**Critical Path Dependencies**:
1. T-1.1.0 → T-1.2.0 → T-2.1.0 → T-4.1.0 (Core generation flow)
2. T-1.3.0 → T-2.1.0 (Dimension mapping configuration)
3. T-3.1.0 → T-3.3.0 → T-4.1.0 (UI to backend integration)

**Recommended Implementation Phases**:
- **Phase 1 (Weeks 1-3)**: Foundation & Infrastructure (T-1.x tasks)
- **Phase 2 (Weeks 4-6)**: Data Management & Processing (T-2.x tasks)
- **Phase 3 (Weeks 7-10)**: User Interface Components (T-3.x tasks)
- **Phase 4 (Weeks 11-14)**: Feature Implementation (T-4.x tasks)
- **Phase 5 (Weeks 15-16)**: Quality Assurance & Testing (T-5.x tasks)
- **Phase 6 (Week 17)**: Deployment & Operations (T-6.x tasks)

---

**Document Version**: 1.0  
**Generated**: 2025-10-29  
**Next Review**: After Phase 1 completion
