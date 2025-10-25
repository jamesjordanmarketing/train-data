# Wireframe Workflow Optimization Implementation Specification v3
**Date:** 2025-01-09  
**Author:** System Analysis  
**Purpose:** Crystal clear ACTION STEPS for implementing workflow optimization

## EXECUTIVE IMPLEMENTATION SUMMARY

This document provides explicit, actionable steps to implement the recommended solutions. The implementation involves TWO PARALLEL TRACKS:
- **Track A:** User Journey Integration into FR Generation (Question 1)
- **Track B:** Wireframe Generation Enhancement (Question 2)

**BOTH tracks should be implemented simultaneously** for maximum benefit.

---

## TRACK A: USER JOURNEY INTEGRATION (Question 1 Implementation)

### PHASE 1: User Journey Integration Points [IMMEDIATE ACTIONS]

#### ACTION 1.1: Update FR Preprocessing Prompt
**File:** `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_prompt_engineering\3a-preprocess-functional-requirements-prompt_v1.md`

**SPECIFIC CHANGES TO MAKE:**

1. **LOCATE** the section titled "## File Processing Instructions"
2. **ADD AFTER** point 2 (Reference Files), the following new point 3:
```markdown
3. **User Journey Integration**
   - **User Journey Document:** `{USER_JOURNEY_PATH}`
   - Extract all UJ elements (UJ1.1.1 through UJ6.3.3)
   - Map journey stages to FR categories
   - Consolidate persona-specific acceptance criteria
```

3. **LOCATE** the section titled "## Primary Tasks"
4. **INSERT** new task after "### 3. Reorder Requirements":
```markdown
### 4. Consolidate Persona-Specific Requirements
- Identify FRs with multiple persona variations
- Apply consolidation rules:
  * When personas have similar needs → Create single comprehensive FR
  * When personas conflict → Create base FR with progressive disclosure
  * When persona is unique → Note as advanced configuration
- Consolidation mapping:
  * Small Business Owner + Domain Expert = Power User Requirements
  * Content Creator + Quality Reviewer = Workflow Requirements  
  * AI Agency Professional = Advanced Configuration Requirements
- Document consolidation decisions in change log
```

5. **UPDATE** the "## Rules and Guidelines" section
6. **ADD** new rule:
```markdown
4. **Persona Consolidation**
   - Each FR must serve all personas through progressive disclosure
   - No persona-specific FRs allowed
   - Document persona variations in FR description
   - Maintain highest priority among all personas
```

#### ACTION 1.2: Update FR Enhancement Prompt Part 1
**File:** `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_prompt_engineering\3b-#1-functional-requirements-prompt_v1.md`

**SPECIFIC CHANGES TO MAKE:**

1. **LOCATE** the section "## Required Inputs"
2. **ADD** before the conditional current status block:
```markdown
- **User Journey:** `{USER_JOURNEY_PATH}`
  - Contains persona definitions and stage-specific acceptance criteria
  - Maps user workflows to system requirements
  - Defines success metrics and KPIs per stage
```

3. **LOCATE** "## Analysis Steps" → "### 2. Enhance FR Acceptance Criteria"
4. **REPLACE** the entire Step 2 with:
```markdown
### 2. Enhance FR Acceptance Criteria with User Journey Integration
For each existing FR:
- Cross-reference with User Journey elements (UJ X.X.X)
- Extract applicable journey acceptance criteria
- Add journey-specific success metrics:
  * Time to complete user goal
  * User confidence indicators  
  * Error recovery requirements
  * Progressive disclosure needs
- Map FR to user journey stages:
  * Stage 1: Discovery & Project Initialization
  * Stage 2: Content Ingestion & Processing
  * Stage 3: Knowledge Exploration
  * Stage 4: Training Data Generation
  * Stage 5: Quality Control
  * Stage 6: Synthetic Expansion
- Consolidate all persona criteria into single unified criterion
- Ensure criteria are testable and verifiable
```

#### ACTION 1.3: Update FR Enhancement Prompt Part 2
**File:** `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_prompt_engineering\3b-functional-requirements-prompt_v1.md`

**MAKE IDENTICAL CHANGES AS ACTION 1.2** (both files need the same user journey integration)

---

### PHASE 2: Consolidation Methodology [CONCRETE IMPLEMENTATION STEPS]

#### ACTION 2.1: Create Consolidation Rules Document
**CREATE NEW FILE:** `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_prompt_engineering\persona-consolidation-rules.md`

**FILE CONTENT TO CREATE:**
```markdown
# Persona Consolidation Rules for Functional Requirements

## Consolidation Decision Tree

### Step 1: Analyze Persona Requirements
For each FR, identify requirements from each persona:
- Small Business Owner requirements
- Domain Expert requirements  
- Content Creator requirements
- Quality Reviewer requirements
- AI Agency Professional requirements

### Step 2: Apply Consolidation Pattern

#### Pattern A: Similar Requirements (80% overlap)
ACTION: Create single comprehensive requirement
EXAMPLE:
- Input: All personas need "file upload"
- Output: "Multi-modal file upload supporting drag-drop, browse, API, and batch operations"

#### Pattern B: Conflicting Requirements  
ACTION: Create base + progressive disclosure
EXAMPLE:
- Input: Business Owner wants "simple", Agency wants "complex"
- Output: "Simple 3-step wizard (default) with Advanced Mode toggle for additional options"

#### Pattern C: Unique Requirements
ACTION: Create optional/configurable features
EXAMPLE:
- Input: Only Agency needs "API access"
- Output: "API endpoint available via settings panel (hidden by default)"

### Step 3: Document Consolidation
For each consolidated FR, document:
1. Original persona requirements
2. Consolidation pattern used
3. Progressive disclosure levels
4. Default configuration
5. Advanced options
```

#### ACTION 2.2: Create Extraction Script
**CREATE NEW FILE:** `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_tools\extract-user-journey-data.js`

**FILE CONTENT TO CREATE:**
```javascript
const fs = require('fs');
const path = require('path');

// Configuration
const USER_JOURNEY_PATH = '../product/03.5-bmo-user-journey.md';
const OUTPUT_PATH = '../product/_mapping/extracted-journey-data.json';

// Extract all UJ elements and their acceptance criteria
function extractUserJourneyData() {
  const content = fs.readFileSync(path.join(__dirname, USER_JOURNEY_PATH), 'utf8');
  
  const extractedData = {
    stages: [],
    personas: [],
    ujElements: [],
    acceptanceCriteria: []
  };
  
  // Extract stages (Stage 1-6)
  const stageRegex = /\*\*STAGE (\d+): ([^*]+)\*\*/g;
  let match;
  while ((match = stageRegex.exec(content)) !== null) {
    extractedData.stages.push({
      number: match[1],
      name: match[2].trim(),
      startLine: match.index
    });
  }
  
  // Extract UJ elements
  const ujRegex = /- \*\*UJ(\d+\.\d+\.\d+): ([^*]+)\*\*/g;
  while ((match = ujRegex.exec(content)) !== null) {
    const ujNumber = match[1];
    const ujName = match[2].trim();
    
    // Extract acceptance criteria for this UJ
    const ujSection = content.substring(match.index, match.index + 2000);
    const criteriaMatch = ujSection.match(/User Journey Acceptance Criteria:([\s\S]*?)(?=\* User Story|Technical Notes)/);
    
    extractedData.ujElements.push({
      id: `UJ${ujNumber}`,
      name: ujName,
      criteria: criteriaMatch ? criteriaMatch[1].trim() : '',
      stage: Math.floor(parseFloat(ujNumber))
    });
  }
  
  // Extract personas
  const personaRegex = /### ([^(]+) \(([^)]+)\)/g;
  while ((match = personaRegex.exec(content)) !== null) {
    extractedData.personas.push({
      name: match[1].trim(),
      type: match[2].trim()
    });
  }
  
  // Save extracted data
  fs.writeFileSync(
    path.join(__dirname, OUTPUT_PATH),
    JSON.stringify(extractedData, null, 2)
  );
  
  console.log(`Extracted ${extractedData.ujElements.length} UJ elements`);
  console.log(`Extracted ${extractedData.personas.length} personas`);
  console.log(`Data saved to ${OUTPUT_PATH}`);
}

// Run extraction
extractUserJourneyData();
```

#### ACTION 2.3: Create Consolidation Script
**CREATE NEW FILE:** `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_tools\consolidate-persona-criteria.js`

**FILE CONTENT TO CREATE:**
```javascript
const fs = require('fs');
const path = require('path');

// Load extracted journey data
const journeyData = require('../product/_mapping/extracted-journey-data.json');

function consolidatePersonaCriteria(ujElement) {
  const consolidated = {
    id: ujElement.id,
    name: ujElement.name,
    baseCriteria: [],
    progressiveFeatures: [],
    advancedOptions: []
  };
  
  // Parse criteria text to identify persona-specific requirements
  const criteriaLines = ujElement.criteria.split('\n').filter(line => line.trim());
  
  criteriaLines.forEach(line => {
    // Detect persona indicators
    if (line.includes('business owner') || line.includes('simple')) {
      consolidated.baseCriteria.push(line);
    } else if (line.includes('expert') || line.includes('advanced')) {
      consolidated.progressiveFeatures.push(line);
    } else if (line.includes('API') || line.includes('programmatic')) {
      consolidated.advancedOptions.push(line);
    } else {
      // Common to all personas
      consolidated.baseCriteria.push(line);
    }
  });
  
  // Generate unified criterion
  consolidated.unified = generateUnifiedCriterion(consolidated);
  
  return consolidated;
}

function generateUnifiedCriterion(consolidated) {
  return {
    description: `Unified requirement supporting all user types`,
    acceptanceCriteria: [
      ...consolidated.baseCriteria.map(c => `[BASE] ${c}`),
      ...consolidated.progressiveFeatures.map(c => `[PROGRESSIVE] ${c}`),
      ...consolidated.advancedOptions.map(c => `[ADVANCED] ${c}`)
    ],
    progressiveDisclosure: {
      level1: 'Basic features for new users',
      level2: 'Extended features for experienced users',
      level3: 'Advanced features for power users'
    }
  };
}

// Process all UJ elements
const consolidatedData = journeyData.ujElements.map(consolidatePersonaCriteria);

// Save consolidated data
fs.writeFileSync(
  path.join(__dirname, '../product/_mapping/consolidated-journey-criteria.json'),
  JSON.stringify(consolidatedData, null, 2)
);

console.log(`Consolidated ${consolidatedData.length} UJ elements`);
```

---

### PHASE 3: Implementation Instructions [EXECUTABLE STEPS]

#### ACTION 3.1: Run Data Extraction
**EXECUTE THESE COMMANDS:**
```bash
cd C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_tools
node extract-user-journey-data.js
```
**EXPECTED OUTPUT:** File created at `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_mapping\extracted-journey-data.json`

#### ACTION 3.2: Run Consolidation
**EXECUTE THESE COMMANDS:**
```bash
cd C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_tools
node consolidate-persona-criteria.js
```
**EXPECTED OUTPUT:** File created at `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_mapping\consolidated-journey-criteria.json`

#### ACTION 3.3: Update FR Generation Script
**MODIFY FILE:** `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_tools\03-generate-functional-requirements.js`

**ADD AFTER LINE 20 (after other requires):**
```javascript
// Load consolidated journey data
const consolidatedJourney = require('../product/_mapping/consolidated-journey-criteria.json');

// Function to enhance FRs with journey data
function enhanceWithJourneyData(frContent) {
  let enhanced = frContent;
  
  consolidatedJourney.forEach(ujElement => {
    // Find matching FR section
    const stageNum = ujElement.id.split('.')[0].replace('UJ', '');
    const frPattern = new RegExp(`FR${stageNum}\\.(\\d+)\\.(\\d+)`, 'g');
    
    enhanced = enhanced.replace(frPattern, (match) => {
      // Append journey criteria to matching FR
      const journeyAddition = `
      * Journey Integration: ${ujElement.name}
      * Progressive Levels: 
        - Basic: Default functionality
        - Advanced: Extended options
        - Expert: Full configuration
      `;
      return match + journeyAddition;
    });
  });
  
  return enhanced;
}
```

**MODIFY** the main processing function to call `enhanceWithJourneyData()` before writing output.

#### ACTION 3.4: Test Integration with Stage 1
**EXECUTE TEST SEQUENCE:**
```bash
# 1. Backup current FRs
copy C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\03-bmo-functional-requirements.md C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\03-bmo-functional-requirements-backup.md

# 2. Run enhanced FR generation for Stage 1 only
cd C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_tools
node 03-generate-functional-requirements.js --stage=1 --journey-enhanced=true

# 3. Compare output
# Check that Stage 1 FRs now include journey criteria
```

---

## TRACK B: WIREFRAME GENERATION ENHANCEMENT (Question 2 Implementation)

### Option 1: Enhanced Current Approach [IMMEDIATE ACTIONS]

**YES, this is IN ADDITION to Question 1 solutions.** Both tracks work together to improve the overall workflow.

#### ACTION B1: Update Wireframe Generator Template
**FILE:** `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_prompt_engineering\04-FR-wireframes-prompt_v4.md`

**SPECIFIC CHANGES TO MAKE:**

1. **LOCATE** the line "Inputs (local to generator)"
2. **ADD** new input:
```markdown
- User Journey: `pmc/product/03.5-bmo-user-journey.md`
```

3. **LOCATE** the "Parameters" section
4. **ADD** new parameter:
```markdown
- Journey Stage Number: [JOURNEY_STAGE_NUMBER] (1-6)
```

5. **LOCATE** "What to do" section
6. **INSERT** as new step 0:
```markdown
0) Extract journey context for Stage [JOURNEY_STAGE_NUMBER]:
   - User goals and workflows for this stage
   - Emotional journey points
   - Success celebration moments
   - Progressive disclosure requirements
   - Persona-specific UI adaptations
```

7. **LOCATE** "Final Output Format" section
8. **ADD** after "Context Summary":
```markdown
Journey Integration
- Stage [JOURNEY_STAGE_NUMBER] user goals: [extracted from journey]
- Key emotions: [confidence building, anxiety reduction, celebration]
- Progressive disclosure levels: [basic, advanced, expert]
- Persona adaptations: [unified interface serving all personas]
```

#### ACTION B2: Update Stage-Specific Prompts
**FOR EACH FILE** in `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_mapping\fr-maps\prompts\`:
- `04-FR-wireframes-prompt-E01.md`
- `04-FR-wireframes-prompt-E02.md`
- `04-FR-wireframes-prompt-E03.md`
- `04-FR-wireframes-prompt-E04.md`
- `04-FR-wireframes-prompt-E05.md`
- `04-FR-wireframes-prompt-E06.md`

**MAKE THESE CHANGES:**

1. **UPDATE** the "Inputs" section to include:
```markdown
- User Journey: `pmc/product/03.5-bmo-user-journey.md`
```

2. **UPDATE** the "Parameters" section:
   - For E01: Add `- Journey Stage Number: 1`
   - For E02: Add `- Journey Stage Number: 2`
   - For E03: Add `- Journey Stage Number: 3`
   - For E04: Add `- Journey Stage Number: 4`
   - For E05: Add `- Journey Stage Number: 5`
   - For E06: Add `- Journey Stage Number: 6`

#### ACTION B3: Create Journey-to-Wireframe Mapping
**CREATE NEW FILE:** `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_mapping\journey-to-wireframe-mapping.md`

**FILE CONTENT TO CREATE:**
```markdown
# Journey Stage to Wireframe Mapping

## Stage 1: Discovery & Project Initialization
### Key UI Elements from Journey
- Welcome/onboarding flow (UJ1.1.1)
- Project setup wizard (UJ1.1.2)
- Privacy assurance visuals (UJ1.2.1)
- ROI calculator (UJ1.3.1)

### Emotional Design Requirements
- Build confidence through simple language
- Reduce anxiety with progress indicators
- Celebrate project creation

### Progressive Disclosure
- Level 1: 3-step wizard
- Level 2: Advanced settings panel
- Level 3: API configuration

## Stage 2: Content Ingestion & Processing
### Key UI Elements from Journey
- Drag-drop upload area (UJ2.1.1)
- Processing status dashboard (UJ2.2.2)
- Document organization table (UJ2.3.1)

### Emotional Design Requirements
- Show immediate feedback on upload
- Maintain transparency during processing
- Provide confidence through preview

### Progressive Disclosure
- Level 1: Simple upload
- Level 2: Batch operations
- Level 3: Custom processing rules

[Continue for Stages 3-6...]
```

#### ACTION B4: Update Wireframe Generation Script
**MODIFY FILE:** `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_tools\04-generate-FR-wireframe-segments_v4.js`

**ADD** new function after line 50:
```javascript
// Load journey mapping data
const journeyMapping = require('../product/_mapping/journey-to-wireframe-mapping.json');

function enhancePromptWithJourney(prompt, stageNumber) {
  const stageData = journeyMapping[`stage${stageNumber}`];
  
  if (!stageData) return prompt;
  
  // Insert journey context into prompt
  const journeySection = `
### Journey-Informed Design Elements
- User Goals: ${stageData.goals.join(', ')}
- Emotional Requirements: ${stageData.emotions.join(', ')}
- Progressive Disclosure:
  * Basic: ${stageData.progressive.level1}
  * Advanced: ${stageData.progressive.level2}
  * Expert: ${stageData.progressive.level3}
- Success Indicators: ${stageData.success.join(', ')}
  `;
  
  // Insert after Context Summary
  return prompt.replace(
    /Context Summary[\s\S]*?(?=Wireframe Goals)/,
    `$&\n${journeySection}\n`
  );
}
```

**MODIFY** the main generation loop to call `enhancePromptWithJourney()` for each FR.

#### ACTION B5: Test Enhanced Wireframe Generation
**EXECUTE TEST SEQUENCE:**
```bash
# 1. Generate enhanced wireframe prompt for Stage 1, FR1.1.0
cd C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_tools
node 04-generate-FR-wireframe-segments_v4.js --stage=E01 --fr=FR1.1.0 --journey-enhanced=true

# 2. Review output file
# Open: C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\_mapping\fr-maps\04-bmo-FR-wireframes-output-E01.md

# 3. Verify journey elements are included:
# - Journey stage context
# - Emotional design requirements
# - Progressive disclosure levels
# - Persona consolidation
```

---

## IMPLEMENTATION VALIDATION CHECKLIST

### Phase 1 Completion Criteria
- [ ] File `3a-preprocess-functional-requirements-prompt_v1.md` updated with journey input
- [ ] File `3b-#1-functional-requirements-prompt_v1.md` updated with journey integration
- [ ] File `3b-functional-requirements-prompt_v1.md` updated identically
- [ ] All updates include full paths to user journey document

### Phase 2 Completion Criteria
- [ ] Created `persona-consolidation-rules.md` with decision tree
- [ ] Created `extract-user-journey-data.js` script
- [ ] Created `consolidate-persona-criteria.js` script
- [ ] Successfully executed extraction (JSON file exists)
- [ ] Successfully executed consolidation (JSON file exists)

### Phase 3 Completion Criteria
- [ ] Modified `03-generate-functional-requirements.js` with journey enhancement
- [ ] Tested Stage 1 FR generation with journey data
- [ ] Verified consolidated criteria appear in FRs
- [ ] No persona-specific FRs remain

### Option 1 (Question 2) Completion Criteria
- [ ] Updated `04-FR-wireframes-prompt_v4.md` template
- [ ] Updated all 6 stage-specific prompt files (E01-E06)
- [ ] Created `journey-to-wireframe-mapping.md`
- [ ] Modified `04-generate-FR-wireframe-segments_v4.js`
- [ ] Tested enhanced wireframe generation for at least one FR

---

## EXECUTION TIMELINE

### Day 1 (4 hours)
1. **Hour 1:** Complete Phase 1 (update 3 prompt files)
2. **Hour 2:** Create Phase 2 files (rules + 2 scripts)
3. **Hour 3:** Execute Phase 3 (run scripts, test)
4. **Hour 4:** Complete Option 1 updates (wireframe templates)

### Day 2 (2 hours)
1. **Hour 1:** Test full pipeline with Stage 1
2. **Hour 2:** Document results and refine

### Day 3 (2 hours)
1. **Hour 1:** Apply to remaining stages (E02-E06)
2. **Hour 2:** Final validation and documentation

---

## SUCCESS METRICS

### Immediate Success Indicators
1. **Journey Integration:** User journey data appears in generated FRs
2. **Persona Consolidation:** No duplicate FRs for different personas
3. **Progressive Disclosure:** Clear levels documented in each FR
4. **Wireframe Enhancement:** Journey context visible in wireframe prompts

### Quality Metrics
1. **Coverage:** 100% of UJ elements mapped to FRs
2. **Consolidation:** 5:1 persona-to-requirement ratio achieved
3. **Clarity:** Acceptance criteria include journey success metrics
4. **Completeness:** All 6 stages enhanced with journey data

---

## TROUBLESHOOTING GUIDE

### Common Issues and Solutions

**Issue 1:** Scripts fail to find user journey file
**Solution:** Verify file path: `C:\Users\james\Master\BrightHub\brun\brun8\pmc\product\03.5-bmo-user-journey.md`

**Issue 2:** Consolidation creates too few requirements
**Solution:** Adjust consolidation threshold in `consolidate-persona-criteria.js` from 80% to 60%

**Issue 3:** Wireframe prompts become too long
**Solution:** Summarize journey elements, keep only UI-relevant criteria

**Issue 4:** Progressive disclosure levels unclear
**Solution:** Use the 3-level model consistently: Basic → Advanced → Expert

---

**Document Status:** Implementation Ready  
**Estimated Time:** 8 hours total  
**Dependencies:** User journey document must be complete  
**Version:** 3.0 - ACTIONABLE SPECIFICATION