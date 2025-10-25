# PMC Specification Command Engine

## Overview

The PMC Specification Command Engine is an autonomous system for generating project specifications using a chain of AI prompts. It extends the Command Engine framework to transform the current human-in-the-loop process into a more automated workflow, while still allowing for human kickoff events and interruptions when needed.

## Current Process Analysis

The current specification generation process involves:

1. Manually running JavaScript tools (`03-generate-FR-initial.js`, `03-generate-functional-requirements.js`, etc.)
2. Each tool loads prompt templates from the `_prompt_engineering/` directory
3. The templates are filled with file paths and project parameters
4. A human must copy/paste these prompts into Cursor's Claude interface
5. Claude generates the specification content
6. A human copies the result back and saves it to the appropriate file

This process is manual, error-prone, and lacks validation that all required steps are completed in the correct sequence.

## Proposed Automation Framework

### 1. Architecture

The PMC Spec Command Engine will work as a middleware layer between:
- The existing JavaScript tools that prepare prompts
- Claude 3.7 API for processing prompts
- The Command Engine for tracking context and ensuring proper command execution

#### Key Components:

1. **Prompt Pipeline Manager**
   - Orchestrates the sequential execution of prompts
   - Handles dependencies between specification artifacts
   - Tracks completion status of each stage

2. **API Integration Layer**
   - Connects to Claude 3.7 API
   - Handles authentication and rate limiting
   - Manages conversation context and history

3. **Specification Validator**
   - Ensures generated artifacts meet quality standards
   - Validates cross-references between documents
   - Checks for completeness and formatting

4. **Human Intervention Gateway**
   - Provides interfaces for human review at critical points
   - Allows for kickoff, approval, and interruption
   - Captures feedback for improving future generations

### 2. Autonomous Workflow

The automated specification generation process would follow this sequence:

1. **Initialization**
   ```
   node pmc/command-engine/spec-engine.js init "[PROJECT_NAME]" "[PROJECT_ABBREV]"
   ```
   - Creates project structure
   - Initializes configuration
   - Sets up logging and tracking

2. **Seed Story Generation**
   ```
   node pmc/command-engine/spec-engine.js generate seed-story
   ```
   - Loads seed story prompt template
   - Sends to Claude API
   - Validates and saves result

3. **Overview Document Generation**
   ```
   node pmc/command-engine/spec-engine.js generate overview
   ```
   - Loads overview prompt with references to seed story
   - Processes through Claude API
   - Validates cross-references

4. **User Stories Generation**
   ```
   node pmc/command-engine/spec-engine.js generate user-stories
   ```
   - Sends preprocessed user stories prompt to Claude
   - Tracks completion status
   - Validates format and references

5. **Functional Requirements Pipeline**
   ```
   node pmc/command-engine/spec-engine.js generate fr-pipeline
   ```
   - Executes the full FR generation process:
     a. Initial FR generation
     b. FR preprocessing (cleaning, deduplication)
     c. FR enhancement (detailed acceptance criteria)
   - Each step validated before proceeding

6. **Task Specification Generation**
   ```
   node pmc/command-engine/spec-engine.js generate tasks
   ```
   - Generates task specifications from FRs
   - Validates traceability to FRs and user stories
   - Produces complete task hierarchy

### 3. Human Interaction Points

The system supports three types of human interaction:

1. **Kickoff Events**
   - Manual initiation of the process
   - Selection of generation parameters
   - Providing initial project details

2. **Review Gates**
   - Critical approval points requiring human review
   - Options to approve, reject, or modify
   - Ability to provide feedback for refinement

3. **Interruption Points**
   - Ability to pause the process at any stage
   - Manual modification of intermediate artifacts
   - Resume functionality with validation checks

### 4. Command Engine Integration

The Spec Command Engine leverages the core Command Engine framework:

1. **Context Monitoring**
   - Tracks which specifications have been generated
   - Monitors dependencies between documents
   - Detects when specifications need updating due to changes

2. **Command Validation**
   - Ensures all specification steps are completed in proper sequence
   - Validates that required logging and tracking commands are executed
   - Prevents proceeding if critical dependencies are missing

3. **Checkpoint Mechanism**
   - Periodically validates the integrity of the specification set
   - Creates snapshots of the specification state
   - Enables rollback to previous versions if needed

4. **User Interface**
   - Provides clear status of the specification generation process
   - Displays warnings for missing or inconsistent specifications
   - Recommends actions to maintain specification integrity

## Implementation Approach for Claude 3.7 API Integration

### API Wrapper

```javascript
class ClaudeAPIWrapper {
  constructor(apiKey, model = 'claude-3-7-sonnet-20240307') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
    this.headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    };
  }

  async sendPrompt(systemPrompt, userPrompt, maxTokens = 4096) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: this.model,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          max_tokens: maxTokens
        })
      });
      
      const data = await response.json();
      
      // Register command execution
      commandEngine.registerCommandExecution(
        `node pmc/bin/aplio-agent-cli.js log "Processed AI prompt for specification generation"`,
        { context: 'specification_generation' }
      );
      
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }
}
```

### Prompt Pipeline Processor

```javascript
class PromptPipelineProcessor {
  constructor(projectName, projectAbbrev) {
    this.projectName = projectName;
    this.projectAbbrev = projectAbbrev;
    this.apiWrapper = new ClaudeAPIWrapper(process.env.CLAUDE_API_KEY);
    this.pipelineStatus = {};
  }

  async processPromptTemplate(templatePath, variables, outputPath) {
    // Load template file
    const template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace variables
    const filledTemplate = this._replaceVariables(template, variables);
    
    // Generate system prompt
    const systemPrompt = "You are a senior technical product manager and system architect with expertise in modern web application development.";
    
    // Send to Claude API
    const result = await this.apiWrapper.sendPrompt(systemPrompt, filledTemplate);
    
    // Save result
    fs.writeFileSync(outputPath, result);
    
    // Update status
    this.pipelineStatus[outputPath] = {
      completed: true,
      timestamp: new Date().toISOString()
    };
    
    // Register completion in Command Engine
    commandEngine.registerCommandExecution(
      `node pmc/bin/aplio-agent-cli.js file-created "${outputPath}" "Generated specification document"`,
      { taskId: `SPEC-${outputPath}`, context: 'specification_generation' }
    );
    
    return result;
  }
  
  _replaceVariables(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }
}
```

## Human-in-the-Loop Options

### 1. Full Automation with Review Gates

The most efficient approach involves:
- Automated processing of the entire specification chain
- Predefined review gates at critical points (e.g., after user stories, before task generation)
- Notification system for human reviews
- Web interface for reviewing and approving specifications

```bash
# Example full pipeline with review gates
node pmc/command-engine/spec-engine.js run-pipeline --with-reviews
```

### 2. Semi-Automated with Human Kickoff

A more controlled approach involves:
- Human initiation of each major specification step
- Automated processing of the prompt and API interaction
- Review and approval before proceeding to next step

```bash
# Semi-automated approach with human kickoff for each major step
node pmc/command-engine/spec-engine.js generate overview --review-required
```

### 3. Hybrid Approach

The most flexible option combines:
- Automated preparation of prompts
- Human review of prompts before API submission
- Automated processing and validation of results
- Human approval before committing to the specification repository

```bash
# Hybrid approach showing prompts for review
node pmc/command-engine/spec-engine.js generate fr-pipeline --show-prompts --review-results
```

## Error Handling and Recovery

The system includes robust error handling:

1. **API Failures**
   - Automatic retry with exponential backoff
   - Alternative prompt strategies if repeated failures
   - Fallback to human intervention

2. **Validation Failures**
   - Automatic detection of malformed specifications
   - Regeneration attempts with modified prompts
   - Notification for human intervention when needed

3. **Consistency Checks**
   - Cross-document reference validation
   - Traceability verification from user stories to tasks
   - Detection of missing or incomplete sections

4. **Resumability**
   - Checkpointing at each step
   - Ability to resume from any point in the pipeline
   - Preservation of partial results

## Conclusion

The PMC Specification Command Engine transforms the current manual process into a streamlined, automated workflow that maintains the benefits of human oversight while eliminating repetitive tasks and reducing errors. By integrating with the Command Engine framework, it ensures proper tracking of the specification generation process and maintains complete traceability between all artifacts.

This system can be implemented with varying degrees of automation based on project needs, from fully autonomous generation with occasional human reviews to a more controlled process with human approval at each step. In all cases, it dramatically improves efficiency while maintaining or enhancing the quality of the resulting specifications.

## Next Steps for Implementation

1. Implement the Claude API wrapper
2. Create the prompt pipeline processor
3. Integrate with the Command Engine
4. Develop validation mechanisms
5. Build human review interfaces
6. Test with existing prompt templates
7. Gradually increase automation levels


========================================================

**Original Question**

ok. we have a similar issue with our prompt commands for PMC. Often we have a long detailed prompt. Such as the ones in these files. Please read them:

pmc\product\_prompt_engineering\3a-preprocess-functional-requirements-prompt_v1.md
pmc\product\_prompt_engineering\3b-functional-requirements-prompt_v1.md

Those two together are used to by these scripts:
pmc\product\_tools\03-generate-FR-initial.js
pmc\product\_tools\03-generate-functional-requirements.js

to generate this file:pmc\product\03-aplio-mod-1-functional-requirements.md

and so far the two js scripts all they do is fill the prompts with file parameters and then the human has to cut and paste into the Cursor prompt.

But now that there is another use case (the Command Engine) it makes sense to think about how the Command Engine could become middleware for automating the specification build (see the rest of the prompts in 

So write to this file:
pmc\command-engine\description--pmc-spec-command-engine.md

And describe how the human in the loop process of all the prompts in: pmc\product\_prompt_engineering could be converted to an autonomous process, with human kickoff events and human interruptions if necessary.

Describe how you would do it if you were going to wrap prompts for delivery to the Claude 3.7 api