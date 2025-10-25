# AI Testing Agent Conductor Prompt - T-2.5.5 CSS Implementation Strategy

## Mission Overview

You are an AI Testing Agent responsible for conducting comprehensive CSS-specific testing for T-2.5.5: CSS Implementation Strategy. This task requires **specialized CSS testing approaches** rather than component testing, focusing on compilation, cascade behavior, theme switching, and responsive design validation.

## Critical Testing Context

**IMPORTANT**: T-2.5.5 implements CSS files (reset.css, variables.css, base.css, breakpoints.css), NOT React components. You MUST adapt all testing strategies to validate CSS functionality through computed styles, visual rendering, and browser behavior.

## Execution Protocol

Follow these steps precisely:

### 1. Load Primary Testing Document
- **Primary Source**: `pmc\core\active-task-unit-tests-2-enhanced.md`
- This contains your CSS-specific testing protocol with 6 phases tailored for CSS validation
- **Critical**: This is NOT component testing - focus on CSS compilation, variables, and visual output

### 2. Review Implementation Context
- **Context Source**: `system\plans\new-tests\02-new-test-carry-context-07-01-25-0140PM.md`
- Contains critical CSS variable naming conventions (`--aplio-*` format)
- Details T-2.5.4 integration requirements and theme switching constraints
- Lists all four CSS files with their specific testing focus areas

### 3. Understand Task Requirements
- **Task Details**: `pmc\core\active-task.md`
- Four implementation elements: ELE-1 (reset), ELE-2 (variables), ELE-3 (base), ELE-4 (breakpoints)
- Implementation location: `aplio-modern-1/styles/globals/`

### 4. Archive Previous Test Files
Make sure you are in pmc\ before you run this command.
```bash
node system\management\test-approach-and-discovery.js
```

### 5. Generate CSS Testing Approach
- Read: `pmc\system\coding-prompts\03-test-approach-prompt-v3-enhanced.md`
- Generate your CSS-specific testing approach in `current-test-approach.md`
- Focus on:
  - CSS compilation validation strategies
  - CSS custom property testing methods
  - Theme switching verification approaches
  - Responsive breakpoint validation techniques
- Run: `node bin\aplio-agent-cli.js test-approach`
YOU MUST STOP HERE!!!
DO NOT START Step ### 6. Only the human can start Step ### 6.

### 6. Execute CSS Testing Protocol

Navigate to `aplio-modern-1` and execute the 6-phase CSS testing protocol from `pmc\core\active-task-unit-tests-2-enhanced.md`:

**Phase 0**: CSS Testing Environment Setup
- Verify all four CSS files exist
- Create CSS-specific test directories

**Phase 1**: CSS Discovery & Analysis
- Document CSS implementation structure
- Validate import integration
- Test compilation with Next.js build

**Phase 2**: CSS Variable Testing
- Create Puppeteer tests for computed styles
- Validate `--aplio-*` variables for T-2.5.4 compatibility

**Phase 3**: Theme Switching Testing
- Test automatic CSS variable updates
- Verify instant theme switching without JavaScript

**Phase 4**: Responsive Breakpoint Testing
- Validate all 7 breakpoints (xs:475px through 2xl:1536px)
- Test container system responsiveness

**Phase 5**: Visual CSS Validation
- Create test page at `/test-css-t255`
- Validate typography, forms, and utilities

**Phase 6**: DSAP Compliance Validation
- Verify button specs (30px padding, 30px radius)
- Generate compliance report

## Key Adaptations for CSS Testing

1. **No Component Scaffolds**: CSS files don't need React scaffolds
2. **Use Browser DevTools**: Validate CSS through computed styles
3. **Visual Testing Focus**: Screenshot CSS rendering, not components
4. **Build Validation**: Ensure CSS compiles without errors
5. **Theme Testing**: Toggle `dark` class on root element

## Success Criteria

You must validate:
- [ ] All CSS files compile successfully
- [ ] CSS variables resolve in browser (use `getComputedStyle()`)
- [ ] Theme switching is instantaneous (<100ms)
- [ ] Responsive breakpoints match legacy config
- [ ] DSAP button specifications met exactly
- [ ] Integration with T-2.5.4 composition system works

## Completion Report

After testing, provide:
1. CSS compilation results
2. Variable availability confirmation
3. Theme switching performance metrics
4. Responsive behavior validation
5. DSAP compliance status
6. Visual test page link: `/test-css-t255`

**Remember**: This is CSS testing, not component testing. Focus on stylesheets, cascade, computed values, and visual rendering.
