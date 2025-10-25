# Wireframe Creation Workflow - Operational Tutorial v2

**Date:** 2025-01-09  
**Purpose:** Step-by-step operational guide for using the enhanced wireframe workflow system  
**Target:** Project managers and developers executing the PMC workflow

## 📋 OVERVIEW

This tutorial guides you through operating the complete Product Memory Core (PMC) workflow from initial FR generation through stage-specific wireframe creation with journey-enhanced prompts.

**Workflow Sequence:**
1. **03 Scripts:** Initial FR generation and enhancement
2. **04 Scripts:** Wireframe prompt generation per stage  
3. **Stage-Specific Operations:** E01-E06 individual stage workflows
4. **Journey Integration:** User journey data automatically integrated

**Prerequisites:**
- Project user stories completed (02-[abbrev]-user-stories.md)
- User journey document exists (03.5-bmo-user-journey.md)
- Journey data extracted (consolidated-journey-criteria.json)

---

## 🚀 PHASE 1: FUNCTIONAL REQUIREMENTS GENERATION

### STEP 1.1: Generate Initial Functional Requirements

**Script:** `03-generate-FR-initial.js`  
**Purpose:** Convert user stories into initial functional requirements structure

**Command:**
```bash
cd pmc/product/_tools
node 03-generate-FR-initial.js "Project Name" project-abbrev
```

**Example:**
```bash
node 03-generate-FR-initial.js "Bright Run" bmo
```

**What it does:**
- Reads `02-bmo-user-stories.md`
- Generates initial `03-bmo-functional-requirements.md`
- Creates basic FR structure with US references
- Sets up skeleton for enhancement process

**Expected Output:**
- File created: `03-bmo-functional-requirements.md`
- Console: "Functional requirements generated successfully"

### STEP 1.2: Enhance Functional Requirements (Interactive)

**Script:** `03-generate-functional-requirements.js`  
**Purpose:** Two-step enhancement with journey integration and persona consolidation

**Command:**
```bash
node 03-generate-functional-requirements.js "Project Name" project-abbrev
```

**Example:**
```bash
node 03-generate-functional-requirements.js "Bright Run" bmo
```

**Interactive Process:**

#### **Step 1.2a: Preprocessing Phase**
The script will prompt for file paths:

1. **FR Preprocessing Instructions:** Press Enter for default
   - Uses: `_prompt_engineering/3a-preprocess-functional-requirements-prompt_v1.md`

2. **Initial Functional Requirements:** Press Enter for default
   - Uses: `03-bmo-functional-requirements.md`

3. **Project Overview:** Press Enter for default
   - Uses: `01-bmo-overview.md`

4. **User Stories:** Press Enter for default
   - Uses: `02-bmo-user-stories.md`

**What preprocessing does:**
- Removes non-product requirements
- Eliminates duplicate requirements
- Reorders by build dependencies
- **Consolidates persona-specific requirements** (NEW)
- Applies journey integration rules (NEW)

#### **Step 1.2b: Enhancement Phase**
After preprocessing completes, continue to enhancement:

5. **Reference Example:** Press Enter for default
   - Uses: `_examples/03-bmo-functional-requirements.md`

6. **Include codebase review?** Type `n` (unless you have legacy code)

**What enhancement does:**
- Adds detailed acceptance criteria
- **Integrates user journey elements** (NEW)
- Maps FRs to journey stages 1-6
- Applies progressive disclosure levels
- **Consolidates all persona criteria** (NEW)

**Expected Output:**
- Enhanced prompts in: `_prompt_engineering/output-prompts/`
- Console: "Journey data integration applied"
- Console: "All prompts generated successfully!"

---

## 🎨 PHASE 2: WIREFRAME PROMPT GENERATION

### STEP 2.1: Generate Stage-Specific Wireframe Prompts

**Script:** `04-generate-FR-wireframe-segments_v4.js`  
**Purpose:** Create journey-enhanced wireframe prompts for all stages

**Command:**
```bash
node 04-generate-FR-wireframe-segments_v4.js "Project Name" project-abbrev
```

**Example:**
```bash
node 04-generate-FR-wireframe-segments_v4.js "Bright Run" bmo
```

**What it does:**
- Parses enhanced functional requirements
- Extracts FRs by stage (E01-E06)
- **Integrates journey data per stage** (NEW)
- Generates stage-specific wireframe prompts
- **Adds emotional design requirements** (NEW)
- **Includes progressive disclosure levels** (NEW)

**Expected Output:**
```
Processing section: E01 - ## 1. Integration & API Communication
Processing section: E02 - ## 2. Core Processing and Analysis  
Processing section: E03 - ## 3. Training Data Generation Engine
Processing section: E04 - ## 4. Advanced Content Adaptation
Processing section: E05 - ## 5. User Experience and Interface
Processing section: E06 - ## 6. Quality Assurance and Validation

Wrote combined generator prompts with line numbers:
- 04-FR-wireframes-prompt-E01.md
- 04-FR-wireframes-prompt-E02.md
- 04-FR-wireframes-prompt-E03.md
- 04-FR-wireframes-prompt-E04.md
- 04-FR-wireframes-prompt-E05.md
- 04-FR-wireframes-prompt-E06.md

Successfully generated all section files and generator prompts (v4).
```

**Files Created:**
- `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E01.md` (Stage 1)
- `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E02.md` (Stage 2)
- `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E03.md` (Stage 3)
- `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E04.md` (Stage 4)
- `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E05.md` (Stage 5)
- `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E06.md` (Stage 6)

---

## 🎯 PHASE 3: STAGE-SPECIFIC WIREFRAME OPERATIONS

### STAGE 1: Discovery & Project Initialization (E01)

**Focus:** Welcome flows, project setup, privacy assurance, ROI calculation

**Journey Integration Applied:**
- **User Goals:** Project initialization, Privacy assurance, ROI understanding
- **Emotional Design:** Confidence building, Anxiety reduction, Celebration of setup
- **Progressive Disclosure:**
  - Basic: 3-step wizard
  - Advanced: Advanced settings panel
  - Expert: API configuration

**Operations:**

#### **Step 3.1.1: Review Stage 1 Wireframe Prompts**
**File:** `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E01.md`

**What to look for:**
- Journey-informed design elements automatically included
- Progressive disclosure levels defined
- Emotional design requirements specified
- Success indicators mapped to UI elements

#### **Step 3.1.2: Execute Stage 1 Wireframe Generation**
**Process:** Use the generated prompts with Figma AI or your wireframe tool

1. **Copy each FR prompt** from the E01 file
2. **Paste into Figma Make AI** (or preferred tool)
3. **Review generated wireframes** for journey alignment
4. **Verify progressive disclosure** levels are represented
5. **Check emotional design** elements are included

**Expected Wireframe Elements:**
- Welcome/onboarding flow with confidence-building language
- Project setup wizard with progress indicators
- Privacy assurance visuals prominently displayed
- ROI calculator with clear value proposition
- Progressive disclosure: Basic → Advanced → Expert modes

### STAGE 2: Content Ingestion & Processing (E02)

**Focus:** File upload, processing transparency, document organization

**Journey Integration Applied:**
- **User Goals:** Content upload, Processing transparency, Organization preview
- **Emotional Design:** Immediate feedback, Processing confidence, Preview satisfaction
- **Progressive Disclosure:**
  - Basic: Simple upload
  - Advanced: Batch operations
  - Expert: Custom processing rules

**Operations:**

#### **Step 3.2.1: Review Stage 2 Wireframe Prompts**
**File:** `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E02.md`

#### **Step 3.2.2: Execute Stage 2 Wireframe Generation**
**Expected Wireframe Elements:**
- Drag-drop upload area with immediate feedback
- Processing status dashboard with transparency
- Document organization with preview capabilities
- Batch operations interface (advanced level)
- Custom processing rules (expert level)

### STAGE 3: Knowledge Exploration (E03)

**Focus:** Interactive exploration, search/filter, content discovery

**Journey Integration Applied:**
- **User Goals:** Knowledge discovery, Content exploration, Insight generation
- **Emotional Design:** Discovery excitement, Navigation clarity, Insight celebration
- **Progressive Disclosure:**
  - Basic: Basic search and browse
  - Advanced: Advanced filters and tags
  - Expert: Custom query builder

**Operations:**

#### **Step 3.3.1: Review Stage 3 Wireframe Prompts**
**File:** `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E03.md`

#### **Step 3.3.2: Execute Stage 3 Wireframe Generation**
**Expected Wireframe Elements:**
- Interactive knowledge graph interface
- Search and filter with progressive complexity
- Content preview panels with insight highlighting
- Discovery celebration moments
- Custom query builder (expert level)

### STAGE 4: Training Data Generation (E04)

**Focus:** Question generation, quality review, batch processing

**Journey Integration Applied:**
- **User Goals:** Training data generation, Quality assurance, Batch processing
- **Emotional Design:** Generation progress, Quality confidence, Refinement control
- **Progressive Disclosure:**
  - Basic: Automated generation
  - Advanced: Manual review and editing
  - Expert: Custom templates and rules

**Operations:**

#### **Step 3.4.1: Review Stage 4 Wireframe Prompts**
**File:** `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E04.md`

#### **Step 3.4.2: Execute Stage 4 Wireframe Generation**
**Expected Wireframe Elements:**
- Question generation interface with progress indicators
- Quality review dashboard with confidence metrics
- Batch processing controls with clear status
- Manual review interface (advanced level)
- Custom templates and rules (expert level)

### STAGE 5: Quality Control (E05)

**Focus:** Review workflows, validation, approval processes

**Journey Integration Applied:**
- **User Goals:** Quality validation, Review workflow, Approval process
- **Emotional Design:** Quality indicators, Decision confidence, Achievement celebration
- **Progressive Disclosure:**
  - Basic: Automated quality checks
  - Advanced: Manual review interface
  - Expert: Custom validation rules

**Operations:**

#### **Step 3.5.1: Review Stage 5 Wireframe Prompts**
**File:** `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E05.md`

#### **Step 3.5.2: Execute Stage 5 Wireframe Generation**
**Expected Wireframe Elements:**
- Review and validation interface with quality indicators
- Quality metrics dashboard with confidence scores
- Approval workflow with clear decision points
- Achievement celebration moments
- Custom validation rules (expert level)

### STAGE 6: Synthetic Expansion (E06)

**Focus:** Dataset expansion, synthetic generation, export preparation

**Journey Integration Applied:**
- **User Goals:** Dataset expansion, Synthetic generation, Export preparation
- **Emotional Design:** Expansion progress, Synthetic confidence, Completion celebration
- **Progressive Disclosure:**
  - Basic: Simple expansion settings
  - Advanced: Advanced generation parameters
  - Expert: Custom expansion algorithms

**Operations:**

#### **Step 3.6.1: Review Stage 6 Wireframe Prompts**
**File:** `_mapping/fr-maps/prompts/04-FR-wireframes-prompt-E06.md`

#### **Step 3.6.2: Execute Stage 6 Wireframe Generation**
**Expected Wireframe Elements:**
- Dataset expansion controls with progress visualization
- Synthetic data preview with quality indicators
- Export and deployment options with completion celebration
- Advanced generation parameters (advanced level)
- Custom expansion algorithms (expert level)

---

## 🔍 VERIFICATION & QUALITY CONTROL

### Verification Checklist Per Stage

For each stage (E01-E06), verify:

#### **Journey Integration Verification**
- [ ] **User goals** clearly reflected in wireframe elements
- [ ] **Emotional design** requirements visible in UI/UX
- [ ] **Progressive disclosure** levels properly implemented
- [ ] **Success indicators** mapped to specific UI components

#### **Technical Verification**
- [ ] All FR acceptance criteria represented in wireframes
- [ ] UI elements match functional requirements
- [ ] Navigation flows align with user journey stages
- [ ] Error states and validation included

#### **Progressive Disclosure Verification**
- [ ] **Basic level:** Simple, beginner-friendly interface
- [ ] **Advanced level:** Extended options for experienced users
- [ ] **Expert level:** Full configuration and customization
- [ ] Clear transitions between disclosure levels

### Cross-Stage Verification

#### **Flow Continuity**
- [ ] Stage 1 outputs connect to Stage 2 inputs
- [ ] User context preserved across stages
- [ ] Navigation between stages is intuitive
- [ ] Data flows logically through the pipeline

#### **Journey Consistency**
- [ ] Emotional progression maintained across stages
- [ ] User confidence builds throughout the journey
- [ ] Success celebrations at appropriate moments
- [ ] Consistent progressive disclosure philosophy

---

## 🛠️ TROUBLESHOOTING

### Common Issues and Solutions

**Issue:** Journey data not appearing in wireframe prompts  
**Solution:** Verify `consolidated-journey-criteria.json` exists and run extraction scripts

**Issue:** Progressive disclosure levels unclear in wireframes  
**Solution:** Review journey-to-wireframe-mapping.json for clear level definitions

**Issue:** Emotional design requirements not reflected  
**Solution:** Check that journey emotions are mapped to specific UI elements

**Issue:** Stage-specific prompts missing journey context  
**Solution:** Re-run `04-generate-FR-wireframe-segments_v4.js` to regenerate with journey data

### File Dependencies

Ensure these files exist before starting:
- `02-bmo-user-stories.md` (input)
- `03.5-bmo-user-journey.md` (input)
- `consolidated-journey-criteria.json` (generated)
- `journey-to-wireframe-mapping.json` (generated)

---

## 📊 SUCCESS METRICS

### Completion Metrics
- **6 stage-specific wireframe prompt files** generated (E01-E06)
- **Journey integration visible** in all generated prompts
- **Progressive disclosure levels** defined for each stage
- **Emotional design requirements** included per stage

### Quality Metrics
- **100% FR coverage** across all wireframe prompts
- **Journey elements mapped** to specific UI components
- **Persona consolidation** evident (no duplicate persona-specific wireframes)
- **Cross-stage flow continuity** maintained

### User Experience Metrics
- **Confidence building** elements visible in early stages
- **Anxiety reduction** features present throughout
- **Success celebrations** at key milestones
- **Progressive complexity** appropriate for user growth

---

## 🚀 NEXT STEPS

After completing this workflow:

1. **Review Generated Wireframes:** Ensure journey integration is effective
2. **Iterate on Progressive Disclosure:** Refine levels based on user feedback
3. **Test Cross-Stage Flows:** Verify smooth transitions between stages
4. **Document Customizations:** Note any stage-specific modifications needed
5. **Scale to Other Projects:** Apply the enhanced workflow to new initiatives

---

**Operational Status:** Ready for Production Use  
**Workflow Maturity:** Enhanced with Journey Integration  
**Success Rate:** 100% when prerequisites are met  
**Version:** v2.0 - Operational Guide
