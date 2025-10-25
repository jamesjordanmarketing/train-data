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
