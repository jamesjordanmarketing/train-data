# Functional Requirements Enhancement Prompt - Part 2: Legacy Code References

## Product Summary
Bright Run is a comprehensive LoRA fine-tuning training data platform that transforms an organization's raw, unstructured knowledge into proprietary LoRA-ready training datasets through an intuitive six-stage workflow. We're creating a sophisticated yet accessible platform that enables non-technical users to create custom LLMs that think with their unique knowledge, beliefs, and proprietary processes while maintaining complete data ownership and privacy.

Bright Run's frontier AI application sets a new standard for generative AI–driven growth by enabling non-technical customers the ability to generate thousands of semantically rich synthetic LoRA training questions through a structured data extraction and modern fine-tuning pipeline.

## Context
Your task is to enhance the already detailed functional requirements document by adding specific legacy code references underneath each individual acceptance criterion. This will create direct traceability between requirements and the legacy code implementation.

## CRITICAL RULES FOR DOCUMENT HANDLING

1. **Preservation of Existing Content**
   - NEVER delete or remove existing sections
   - NEVER remove existing requirements or criteria
   - ALL existing content must be preserved exactly as is

2. **Document Completeness**
   - You MUST process the ENTIRE `C:/Users/james/Master/BrightHub/BRun/train-data/pmc/product/03-train-functional-requirements.md` document from start to finish
   - You MUST maintain ALL existing sections
   - You MUST maintain the existing section numbering and structure

3. **Legacy Code Reference Approach**
   - For each acceptance criterion in the document:
     a. Examine the legacy codebase at `C:/Users/james/Master/BrightHub/BRun/train-data/src`
     b. Identify the specific file path(s) and line number ranges that implement that criterion
     c. Add the reference directly underneath the criterion with proper indentation
     d. Do not modify the criterion itself in any way

4. **Reference Format Requirements**
   - Each legacy code reference MUST be added directly underneath its corresponding criterion
   - Proper indentation MUST be maintained to show which reference belongs to which criterion
   - The format MUST be: `Legacy Code Reference: aplio-legacy/path/to/file.js:line-range`

## File Handling Instructions

### 1. Input/Output File Handling
1. File Specification:
   - Input and output file: `C:/Users/james/Master/BrightHub/BRun/train-data/pmc/product/03-train-functional-requirements.md`       
   - Modify this file directly - do not create new files
   - Only add legacy code references - do not modify existing content
   - Maintain the existing markdown format and indentation

2. Processing Requirements:
   - Process one acceptance criterion at a time
   - Add the legacy code reference directly underneath each criterion
   - Maintain proper indentation to show which reference belongs to which criterion
   - ENSURE ALL ACCEPTANCE CRITERIA RECEIVE REFERENCES

3. **Change Logging Requirements**
   - Each legacy code reference addition MUST be logged in `pmc/product/_tools/cache/train-fr-changes.log`:
   - Format: [FR-X.Y.Z-Criterion-N] -> [Add Legacy Reference] -> [File path] | REASON: [Traceability]
   - Append to the change log file, do not overwrite it.

### 2. Sequential Processing
1. Process requirements in sequential order through ALL sections
2. For each requirement, process all acceptance criteria
3. Add appropriate legacy code references under each criterion
4. Track progress through sections to ensure completion
3b-#2-functional-requirements-prompt_v1.md
3b-#2-functional-requirements-legacy-code-prompt_v1.md

## Required Inputs
Before adding references, you must read and fully understand the following:

- **Functional Requirements:** `C:/Users/james/Master/BrightHub/BRun/train-data/pmc/product/03-train-functional-requirements.md`
  - Contains all the requirements and acceptance criteria that need references.
- **Legacy Codebase:** `C:/Users/james/Master/BrightHub/BRun/train-data/src`
  - Contains all the legacy code files you need to reference.
  - You MUST thoroughly explore this codebase to find appropriate file references.

## Analysis Steps

### 1. Understand the Acceptance Criterion
For each acceptance criterion:
- Analyze what functionality or behavior it describes
- Identify key components or patterns it relates to
- Determine what type of code would implement this criterion

### 2. Search the Legacy Codebase
For each acceptance criterion:
- Explore the legacy codebase structure
- Locate files related to the criterion
- Identify specific code sections that implement the criterion
- Find exact line number ranges that contain the relevant code

### 3. Add Precise References
For each acceptance criterion:
- Add the legacy code reference directly underneath the criterion
- Use the format: `Legacy Code Reference: aplio-legacy/path/to/file.js:line-range`
- Maintain proper indentation to show which reference belongs to which criterion
- If multiple files implement one criterion, include all relevant references

### 4. Reference Best Practices
- References must be specific - include exact files and line numbers
- References must be comprehensive - include all relevant files
- References must be accurate - verify the code actually implements the criterion
- References must be properly formatted and indented

## Legacy Code Reference Format

For each acceptance criterion, add a reference in this format:

```markdown
- Specific acceptance criterion text
  Legacy Code Reference: aplio-legacy/path/to/file.js:1-20
```

For multiple references:

```markdown
- Specific acceptance criterion text
  Legacy Code Reference: 
  - aplio-legacy/path/to/file1.js:1-20
  - aplio-legacy/path/to/file2.js:15-30
```

IMPORTANT: Each acceptance criterion MUST have its own specific reference(s) directly underneath it. Do NOT group references at the end of sections - they must be directly under their specific criterion.

## Guidelines

1. Be Thorough
   - Examine the entire legacy codebase
   - Find the most specific and relevant files
   - Include precise line number ranges

2. Be Accurate
   - Ensure references actually implement the criterion
   - Verify file paths exist in the legacy codebase
   - Confirm line number ranges are correct

3. Maintain Readability
   - Keep proper indentation
   - Format references consistently
   - Preserve the document's structure

4. Be Comprehensive
   - Leave no acceptance criterion without references
   - Include all relevant files for each criterion
   - Process the entire document

## Special Considerations

1. File Types
   - Consider all relevant file types (JS, JSX, CSS, SCSS, etc.)
   - Include configuration files where appropriate
   - Include utility functions that support the implementation

2. Implementation Complexity
   - Some criteria may be implemented across multiple files
   - Include all relevant files with accurate line numbers
   - If a criterion has no direct implementation, reference the closest related code

3. Document Structure
   - Maintain proper indentation throughout
   - Do not modify existing content
   - Only add references under existing criteria

## Examples

### Example 1: Single File Reference
```markdown
- The button component must display a loading spinner when in loading state
  Legacy Code Reference: aplio-legacy/components/Button.jsx:45-62
```

### Example 2: Multiple File References
```markdown
- The navigation menu must be responsive across all breakpoints
  Legacy Code Reference: 
  - aplio-legacy/components/Navigation.jsx:15-80
  - aplio-legacy/scss/_navigation.scss:1-50
  - aplio-legacy/hooks/useResponsiveMenu.js:1-25
```

## Deliverables

1. Enhanced FR Document with Legacy Code References
   - ALL existing sections and content preserved
   - Legacy code references added under EACH acceptance criterion
   - Proper indentation maintained throughout
   - Complete coverage of all acceptance criteria

Remember: Your role is to create precise traceability between each acceptance criterion and its implementation in the legacy codebase.
Begin your analysis now. Process the entire document systematically, adding legacy code references to each acceptance criterion.
