# Comprehensive Unit Test Plan for Aplio Modernization Task T-1.1.3-FOLLOWUP

## Table of Contents
1. [Project & Task Context](#project--task-context)
2. [Test Process Overview](#test-process-overview)  
3. [Phase 1: Code Validation](#phase-1-code-validation)
4. [Phase 2: Requirements Analysis](#phase-2-requirements-analysis)
5. [Phase 3: Viewability Testing](#phase-3-viewability-testing)
6. [AI Agent Directives](#ai-agent-directives)
7. [Viewability Report Structure](#viewability-report-structure)
8. [Validation Protocol](#validation-protocol)
9. [Appendix: Test Commands](#appendix-test-commands)

## Project & Task Context
**Project**: Aplio Crypto Platform Modernization  
**Task ID**: T-1.1.3-FOLLOWUP  
**Component**: GetStart.tsx  
**Implementation Source**: pmc/core/active-task.md  
**Objective**: Validate the migration of GetStart component from React to Next.js 14 server component pattern  

## Test Process Overview
1. **Phase 1**: Execute static code validation
2. **Phase 2**: Analyze viewability requirements
3. **Phase 3**: Conduct visual validation (after human approval)

## Phase 1: Code Validation
### AI Agent Directives
1. You **shall** execute these steps in order:
   ```bash
   npm run lint components/GetStart.tsx
   npm test components/GetStart.test.tsx --watchAll=false
   tsc components/GetStart.tsx --noEmit
   ```
2. You **must** fix only:
   - Type errors
   - Prop validation issues
   - Missing imports
3. You **shall not** create:
   - New components
   - Test pages
   - Additional services

## Phase 2: Requirements Analysis
### Test Requirements Documentation
1. You **will** generate a report containing:
   ```markdown
   # GetStart.tsx Test Requirements

   ## Component Dependencies
   - [ ] Parent components required
   - [ ] Context providers needed
   - [ ] Data sources

   ## Environmental Needs
   - [ ] Mock APIs
   - [ ] Style context
   - [ ] Routing setup

   ## Minimum Test Requirements
   - Viewport size: [specify]
   - Required props: [list]
   - Data shape: [describe]
   ```

2. You **must** present this report for human approval before proceeding

## Phase 3: Viewability Testing
### Approval Protocol
1. You **shall** await explicit human approval before:
   ```bash
   "/c/Program Files/Google/Chrome/Application/chrome.exe" \
     --remote-debugging-port=9222 \
     --user-data-dir="/tmp/chrome-remote-debug" \
     --no-first-run
   ```

2. You **will** provide this URL for human verification:
   ```
   http://localhost:3000/_components/GetStart
   ```

## AI Agent Directives
### Execution Rules
1. **Phase Transition Rules**:
   - Must complete Phase 1 before Phase 2
   - Must receive human approval before Phase 3

2. **Modification Constraints**:
   - Only modify GetStart.tsx and its test file
   - Never create supporting components

3. **Reporting Requirements**:
   - Document all test requirements
   - Capture browser console outputs
   - Generate viewability report

## Viewability Report Structure
### Viewability Analysis
1. You **shall** assess:
   ```markdown
   ### Standalone Capability
   - [ ] Can render without parent: Yes/No
   - [ ] Required dependencies: [list]

   ### Data Requirements
   - [ ] Mock data needed: [describe]
   - [ ] API endpoints: [list]

   ### Rendering Constraints
   - [ ] Minimum viewport size: [specify]
   - [ ] Required props: [list]
   ```

2. You **must** include:
   ```json
   {
     "component": "GetStart",
     "status": "PASS/FAIL",
     "failed_checks": [],
     "recommended_actions": []
   }
   ```

## Validation Protocol
### Test-Evaluate-Fix Cycle
1. You **shall** execute this sequence:
   ```
   [Test] → [Evaluate] → [Fix] → [Repeat]
   ```

2. You **must** document each iteration:
   ```markdown
   ### Iteration [N]
   - Tests executed: [list]
   - Failures identified: [describe]
   - Fixes applied: [describe]
   ```

## Appendix: Test Commands
### Core Validation
```bash
# Linting
npm run lint components/GetStart.tsx

# Unit tests
npm test components/GetStart.test.tsx --watchAll=false

# Type checking
tsc components/GetStart.tsx --noEmit
```

### Viewability Testing
```bash
# Start Chrome debug instance
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --remote-debugging-port=9222 \
  --user-data-dir="/tmp/chrome-remote-debug" \
  --no-first-run

# Test component viewability
curl -X POST http://localhost:9222/json \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3000/_components/GetStart"}'
```

## Version Control
- Test Plan Version: 2.0.0-FOLLOWUP
- Last Updated: 2025-05-07
- Compatible With: T-1.1.3-FOLLOWUP@1.1.0