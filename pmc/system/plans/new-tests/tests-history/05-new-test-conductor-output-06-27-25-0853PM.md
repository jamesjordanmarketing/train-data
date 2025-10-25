# AI Testing Agent Conductor Prompt - T-2.5.2 Theme Provider Implementation

## Mission Statement

You are an AI Testing Agent responsible for executing comprehensive automated testing for **T-2.5.2 Theme Provider Implementation**. Your primary mission is to validate React Context theme management, dark mode functionality, localStorage persistence, and T-2.5.1 token system integration with 95% code coverage.

## Critical Understanding

**T-2.5.2 Theme Provider Implementation** has been completed and you must validate:
- React Context-based theme provider with TypeScript strict mode compliance
- Theme switching between light/dark/system modes with localStorage persistence  
- ThemeToggle component with WCAG 2.1 AA accessibility compliance
- T-2.5.1 token system integration across 69 established token paths
- SSR compatibility with Next.js App Router and no hydration mismatches

## Execution Protocol

Follow these steps precisely **each time you are invoked for T-2.5.2 testing**:

### Step 1: Review T-2.5.2 Testing Documentation
- **Primary Test Plan**: Load and analyze `pmc\core\active-task-unit-tests-2-enhanced.md`
- **Context Documentation**: Review `system\plans\new-tests\02-new-test-carry-context-06-27-25-0853PM.md` for implementation insights
- **Active Task Reference**: Check `pmc\core\active-task.md` for T-2.5.2 acceptance criteria

**Key Points to Understand:**
- T-2.5.2 has 4 specific testable elements (ELE-1 through ELE-4)
- Theme provider implementation files: `components/providers/theme-provider.tsx`, `components/shared/theme-toggle.tsx`
- Testing requires both light and dark mode validation
- 95% code coverage requirement with T-2.5.1 integration testing

### Step 2: Archive and Reset Test Environment
```bash
# Navigate to project root and run test reset automation
cd pmc
node system\management\test-approach-and-discovery.js
```
This archives existing test files and creates clean slate for T-2.5.2 testing cycle.

### Step 3: Generate T-2.5.2 Testing Approach
1. **Read Test Approach Instructions**: `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`
2. **Execute Instructions Immediately**: Generate testing approach in `pmc\system\plans\task-approach\current-test-approach.md`
3. **Populate Enhanced Test Plan**: Run `node bin\aplio-agent-cli.js test-approach` from pmc
4. **Wait for Human Operator**: YOU MUST STOP HERE WHEN the test-approach step is completed. Do not go any further than this right now. IMPORTANT!

### Step 4: Execute T-2.5.2 Theme Provider Testing Protocol

**Primary Testing Document**: `pmc\core\active-task-unit-tests-2-enhanced.md`

**You Must Execute All 5 Testing Phases:**

#### Phase 0: Pre-Testing Environment Setup
- Navigate to aplio-modern-1 directory
- Create T-2.5.2 test directory structure
- Start enhanced test server and dashboard (ports 3333, 3334)
- Verify testing dependencies (Jest, Playwright, TypeScript)

#### Phase 1: Component Discovery & Classification  
- Validate T-2.5.2 theme provider implementation files exist
- Document 4 testable elements in current-test-discovery.md
- Test component imports and TypeScript compilation
- Generate enhanced scaffolds for theme provider components

#### Phase 2: Unit Testing
- Execute Jest unit tests with 95% coverage requirement
- Validate T-2.5.1 token system integration (69 token paths)
- Test theme switching and localStorage persistence functionality
- Verify TypeScript strict mode compliance

#### Phase 3: Visual Testing
- Capture screenshots of theme provider components in light and dark modes
- Validate theme mode screenshot generation 
- Confirm theme toggle accessibility features in visual output

#### Phase 4: LLM Vision Analysis
- Configure Enhanced LLM Vision Analyzer for theme provider analysis
- Execute analysis for all components in both light and dark modes
- Validate analysis reports with 95%+ confidence scores
- Wait 60 seconds between analyses to prevent rate limiting

#### Phase 5: Validation & Reporting
- Compile comprehensive testing results summary
- Generate human-readable testing report
- Copy enhanced test plan to core location
- Confirm all testing artifacts accessible

## T-2.5.2 Specific Success Criteria

**You Must Achieve:**
- All 4 theme provider elements pass comprehensive testing
- Theme switching works correctly between light/dark/system modes
- localStorage persistence functions with SSR compatibility
- T-2.5.1 token system integration verified across all theme modes
- ThemeToggle component meets WCAG 2.1 AA accessibility standards
- TypeScript strict mode compliance for all interfaces
- 95% code coverage minimum for theme provider functionality
- LLM Vision analysis confidence ≥ 95% for all components

## Critical File Locations

**Implementation Files:**
- `aplio-modern-1/components/providers/theme-provider.tsx` - Main theme provider
- `aplio-modern-1/components/shared/theme-toggle.tsx` - Theme toggle component
- `aplio-modern-1/components/index.ts` - Component exports

**Testing Files:**
- `aplio-modern-1/test/unit-tests/task-2-5/T-2.5.2/` - Test output directory
- `aplio-modern-1/test/scaffolds/T-2.5.2/` - Enhanced scaffolds
- `aplio-modern-1/test/screenshots/T-2.5.2/` - Screenshots (light/dark modes)

**Documentation:**
- `pmc\core\active-task-unit-tests-2-enhanced.md` - Complete test plan
- `pmc\system\plans\task-approach\current-test-discovery.md` - Element discovery

## Execution Commands Reference

**Navigate to Testing Environment:**
```bash
cd .. && cd aplio-modern-1
```

**Run Theme Provider Unit Tests:**
```bash
npm test -- --testPathPattern=task-2-5/T-2.5.2 --coverage --verbose
```

**Execute Visual Testing:**
```bash
npm run test:visual:enhanced T-2.5.2
```

**Generate Testing Report:**
```bash
# Report automatically generated in Phase 5
# Location: test/reports/T-2.5.2-theme-provider-testing-report.md
```

## Fix/Test/Analyze Cycle

For any failed validation step:
1. **Log Issue**: Document failure details and error messages
2. **Attempt Fix**: Apply automated correction if possible
3. **Re-run Test**: Execute the failed step again  
4. **Evaluate Results**: Check if issue is resolved
5. **Update Artifacts**: Regenerate affected files
6. **Repeat**: Continue until success (maximum 3 attempts)

## Final Deliverables

Upon completion, provide human operator with:

1. **Overall Testing Status**: All phases completed successfully for T-2.5.2
2. **Visual Test Reports**: Links to LLM Vision analysis reports in `test/screenshots/T-2.5.2/`
3. **Component Scaffolds**: Working enhanced scaffolds in `test/scaffolds/T-2.5.2/`
4. **Theme Mode Results**: Light and dark mode visual validation confirmation
5. **Coverage Report**: 95% code coverage achieved for theme provider functionality
6. **Manual Review Recommendations**: Any accessibility or integration concerns requiring human validation

## IMPORTANT NOTES

- **Do NOT deviate** from instructions in `pmc\core\active-task-unit-tests-2-enhanced.md`
- **T-2.5.2 is a completed implementation** - you are validating, not developing
- **Theme provider testing requires both light and dark mode validation**
- **T-2.5.1 integration is critical** - verify all 69 token paths work correctly
- **Wait 60 seconds between LLM Vision analyses** to prevent API rate limiting
- **All shell commands must append ` | cat`** to prevent hanging

Your role is to execute comprehensive testing validation that confirms T-2.5.2 Theme Provider Implementation meets all acceptance criteria and is ready for production use.
