# Seed Narrative Generation Prompt

## Context and Purpose
You are tasked with transforming unstructured project data into a comprehensive seed narrative for {{PROJECT_NAME}}. 
This narrative will serve as the foundation for the seed story and subsequent project documentation.
Your primary focus is on extracting and structuring user narratives that capture both pain points and desired outcomes
from multiple stakeholder perspectives.

## Required Inputs
- **Template:** `{SEED_NARRATIVE_TEMPLATE_PATH}`
  - Defines the required format and sections for the narrative
- **Raw Data:** `{RAW_DATA_PATH}`
  - Unstructured input containing project information, requirements, and stakeholder needs
- **Example:** `{REFERENCE_EXAMPLE_PATH}`
  - Reference for expected quality and depth of narratives
[[ if current_status.enabled ]]
- **Current Status:** `{CODEBASE_REVIEW_PATH}`
  - The entire current codebase is here and has been worked on toward this project's goal. 
  - Read all the files in all the folders & subfolders to determine the current state.
[[ endif ]]

## Core Requirements

### 1. Narrative Structure
Follow the exact template structure with these key focuses:
- Big Picture (Vision and Core Problem)
- Stakeholder Analysis (Who Will Love This)
- Pain Point Identification and Classification
- Comprehensive User Narratives
- Feature-to-Story Mapping
- Success Metrics and Outcomes

### 2. User Narrative Requirements
Each narrative must include:
- Clear role identification
- Specific want/need statement
- Measurable outcome
- Priority level
- Impact category
- Human experience description
- Type (Pain/Pleasure Point)
-Placeholder for (USx.x.x) mapping from the Seed Stories document

### 2. User Narrative Format
Each user narrative (initials: UN) must include:
1. Unique identifier (UNx.x.x) following the hierarchical structure
2. Clear title reflecting the story's purpose
3. Role Affected
4. Standard user story format: "As a [user], I want [capability] so that [business benefit]."
5. Placeholder for (ISx.x.x) mapping from the Seed Stories document

### 3. Story Categories
Organize narratives by:
- Customer Stories (Business decision makers)
- End-User Stories (Daily users of the system)
- Influencer Stories (Strategic stakeholders)
- Additional Champion Stories (Secondary stakeholders)

### 4. Pain Point Analysis
For each identified pain point:
1. Extract the core problem
2. Identify affected stakeholders
3. Document human impact
4. Map to potential solutions
5. Create corresponding user stories

### 5. Quality Standards
Ensure all narratives are:
- Specific and actionable
- Emotionally resonant
- Measurable
- Prioritized
- Impact-focused
- Solution-oriented

## Story Writing Guidelines

### 1. Story Structure
Use consistent format:
```
As a [role],
I want [capability]
so that [outcome].
- Type: [Pain/Pleasure] Point
- Human Experience: [emotional/practical impact]
- Priority: [High/Medium/Low]
- Impact: [specific area]
```

### 2. Priority Levels
- **High:** Direct revenue impact or blocking issues
- **Medium:** Important improvements
- **Low:** Nice-to-have features

### 3. Impact Categories
- **Business:** Revenue, Growth, Market Position
- **Technical:** Code Quality, Performance
- **User:** Satisfaction, Productivity
- **Team:** Velocity, Knowledge

## Analysis Process
1. Spend 30 seconds analyzing the raw data
2. Identify key stakeholders and their needs
3. Extract core problems and desired outcomes
4. Map problems to stakeholder impacts
5. Create comprehensive narrative sets
6. Organize by theme and priority
7. Add human experience descriptions
8. Validate against success metrics

## Output Requirements
1. Follow markdown formatting
2. Use consistent structure
3. Include all template sections
4. Maintain clear hierarchy
5. Provide rich narrative detail

## Success Criteria
Generated narrative must:
1. Cover all stakeholder perspectives
2. Include both pain and pleasure points
3. Map features to user needs
4. Provide clear priority guidance
5. Include measurable outcomes
6. Capture human experiences
7. Guide future development

## Additional Guidelines
1. Focus on emotional and practical impacts
2. Use specific, actionable language
3. Include quantifiable metrics where possible
4. Consider both immediate and long-term effects
5. Maintain strategic alignment
6. Enable clear feature prioritization

## Output Location
Save the completed Seed Narrative in:
```
{{OUTPUT_PATH}}
```

Remember: The seed narrative must provide a rich, human-centered foundation that captures both the practical and emotional aspects of user needs. Focus on creating narratives that will drive meaningful feature development and ensure project success. 