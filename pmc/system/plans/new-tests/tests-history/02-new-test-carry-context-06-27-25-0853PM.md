# Development Context & Operational Priorities
**Date:** 06/27/2025
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses the handoff from T-2.5.2 Theme Provider Implementation to its comprehensive testing phase. The task successfully implemented a type-safe theme provider system that leverages the validated T-2.5.1 Design Token Typing System, providing React context-based theme management with light/dark mode support, system preference detection, and localStorage persistence.

## T-2.5.2 Active Testing Focus

### Task Summary
T-2.5.2 Theme Provider Implementation has been successfully completed, delivering a comprehensive theme management system built on top of the validated T-2.5.1 token system (69 token paths, 108/108 tests passing). The implementation includes a React Context-based theme provider with TypeScript strict mode compliance, SSR-compatible initialization, system preference detection via window.matchMedia, localStorage persistence with error handling, and seamless integration with existing Tailwind dark mode strategies. The system provides both a main ThemeProvider component and a user-friendly ThemeToggle component with full accessibility features, maintaining backward compatibility with the existing #B1E346 primary color and established design patterns.

### Critical Testing Context
- **T-2.5.1 Integration Dependency**: Theme provider directly integrates with the validated T-2.5.1 token system - all token resolution functions must be tested against the established 69 token paths across 5 categories (colors, typography, spacing, border, shadow)
- **SSR Compatibility Requirements**: Theme provider implements SSR-safe initialization patterns with document class application and localStorage handling that must be validated in both server and client environments
- **Legacy Compatibility Constraints**: Implementation preserves existing #B1E346 primary color usage and Tailwind dark mode class strategy - tests must verify no regression in existing color applications
- **TypeScript Strict Mode**: All implementations pass TypeScript strict mode compilation - tests must validate type safety and interface compliance matching T-2.5.1 standards

### Testing Focus Areas
- **ThemeProvider Component**: React Context implementation with state management, system preference detection, localStorage persistence, and document class application
- **ThemeToggle Component**: User interface with light/dark/system options, compact mode support, accessibility features (ARIA labels, keyboard navigation), and SVG icon integration
- **Hook Functions**: useTheme and useThemeTokens hooks providing type-safe access to theme state and token resolution utilities
- **Token Integration**: Theme-aware token resolution functions (getColorToken, getTypographyToken, getSpacingToken) that properly interface with T-2.5.1 system
- **Persistence System**: localStorage handling with error boundaries, SSR compatibility, and system preference synchronization
- **Type System**: Complete TypeScript interfaces (ThemeMode, ThemeConfig, ThemeContextValue, ThemeProviderProps) with strict mode compliance

### Existing Testing Instructions Adaptations
You must adapt the baseline unit-test file `pmc/core/active-task-unit-tests-2.md` with the following modifications:

- **Element Count Update**: Change from generic template to exactly 4 testable elements as documented in T-2.5.2:ELE-1 through T-2.5.2:ELE-4
- **Implementation Location**: Update all file paths to target `components/providers/theme-provider.tsx` and `components/shared/theme-toggle.tsx` instead of generic component locations
- **Token System Integration Testing**: Add comprehensive validation of T-2.5.1 token resolution functions and 69 established token paths
- **SSR Testing Requirements**: Include server-side rendering validation and hydration testing not present in generic template
- **Legacy Compatibility Testing**: Add specific validation of #B1E346 primary color preservation and existing Tailwind dark mode functionality
- **Pattern-Specific Testing**: Focus testing on P007-THEME-PROVIDER and P010-DARK-MODE patterns rather than generic component testing

### Modified Testing Approaches
- **Component Testing**: Must validate React Context provider/consumer patterns rather than simple component rendering
- **State Management Testing**: Focus on theme state transitions, system preference detection, and localStorage synchronization rather than basic state changes
- **Integration Testing**: Prioritize T-2.5.1 token system integration and type safety validation over isolated component testing
- **Visual Testing**: Include theme switching validation with both light and dark mode screenshots and transitions
- **Accessibility Testing**: Validate theme toggle keyboard navigation, ARIA attributes, and screen reader compatibility beyond standard accessibility checks

### Eliminated Requirements
- **Generic Component Scaffolding**: No longer needed as specific theme provider and toggle components are implemented
- **Pattern Discovery**: P007-THEME-PROVIDER and P010-DARK-MODE patterns are established - no pattern identification required
- **Token System Creation**: T-2.5.1 provides complete token system - no token creation or validation testing needed
- **Dark Mode Implementation**: Dark mode functionality is complete - focus testing on validation rather than implementation

### Additional Testing Needs
- **System Preference Integration**: Test window.matchMedia event handling and automatic theme switching when system preferences change
- **Error Boundary Testing**: Validate localStorage error handling and fallback behavior when storage is unavailable
- **SSR Hydration Testing**: Ensure theme provider initializes correctly in Next.js App Router environment without hydration mismatches
- **Theme Transition Testing**: Validate smooth transitions between light/dark modes and CSS class application timing
- **Token Resolution Edge Cases**: Test theme-aware token resolution with missing tokens, invalid paths, and type safety violations
- **Component Integration Testing**: Validate theme provider works correctly with existing components that use design tokens

### Key Files and Locations
**Primary Implementation Files**:
- `aplio-modern-1/components/providers/theme-provider.tsx` - Main theme provider implementation with React Context, hooks, and utilities
- `aplio-modern-1/components/shared/theme-toggle.tsx` - Theme switching UI component with accessibility features
- `aplio-modern-1/components/index.ts` - Updated exports including theme provider and toggle

**Integration Dependencies**:
- `aplio-modern-1/src/lib/design-system/tokens/` - T-2.5.1 token system (69 validated token paths)
- `aplio-modern-1/src/lib/design-system/tokens/tokens.ts` - TokenPath types and resolution utilities
- `aplio-modern-1/src/lib/design-system/tokens/colors.ts` - Color token definitions and StateVariations

**Testing Infrastructure**:
- `aplio-modern-1/test/unit-tests/task-2-5/T-2.5.2/` - Testing output directory
- `pmc/core/active-task-unit-tests-2.md` - Base test plan requiring customization

**Documentation**:
- `aplio-modern-1/test/unit-tests/task-2-5/T-2.5.2/design-system-adherence-report.md` - DSAP compliance documentation

### Specification References
- **Task Specification**: `pmc/core/active-task.md` - Lines 32-41 (acceptance criteria), Lines 84-132 (task approach), Lines 150-170 (component elements)
- **Design System Documentation**: `aplio-modern-1/design-system/docs/components/component-states.md` - Theme integration patterns
- **Architecture Documentation**: `aplio-modern-1/design-system/docs/architecture/design-system-consistency.md` - Cross-component styling requirements
- **Animation Documentation**: `aplio-modern-1/design-system/docs/animations/interactive/state-transitions.md` - Theme transition specifications
- **T-2.5.1 Reference**: Token system validation patterns and 108/108 test success criteria for integration testing

### Success Criteria
You shall achieve the following measurable conditions for testing completion:

1. **Component Validation**: All 4 theme provider elements (T-2.5.2:ELE-1 through T-2.5.2:ELE-4) pass comprehensive unit testing with 95% code coverage
2. **Integration Testing**: Theme provider successfully integrates with T-2.5.1 token system - all 69 token paths resolve correctly in both light and dark themes
3. **TypeScript Compliance**: All theme provider TypeScript interfaces compile in strict mode without errors
4. **SSR Compatibility**: Theme provider initializes correctly in Next.js App Router with no hydration mismatches
5. **Accessibility Validation**: Theme toggle component meets WCAG 2.1 AA standards with proper ARIA attributes and keyboard navigation
6. **Legacy Compatibility**: Existing #B1E346 primary color and Tailwind dark mode functionality preserved without regression
7. **Visual Validation**: Theme switching produces correct visual output in both light and dark modes with smooth transitions
8. **Error Handling**: localStorage errors and system preference detection failures handled gracefully with appropriate fallbacks

### Testing Requirements Summary
**Mandatory Test Targets**:
- [ ] ThemeProvider Context implementation and state management
- [ ] Theme switching functionality (light/dark/system modes)  
- [ ] localStorage persistence with SSR compatibility
- [ ] System preference detection and synchronization
- [ ] ThemeToggle component UI and accessibility
- [ ] useTheme and useThemeTokens hook functionality
- [ ] Token resolution integration with T-2.5.1 system
- [ ] TypeScript strict mode compliance validation
- [ ] Error boundary and fallback behavior testing
- [ ] Visual theme transition validation

**Success Gates**:
- All Jest unit tests pass with 95% coverage minimum
- TypeScript compilation succeeds in strict mode
- Visual screenshots match expected light/dark theme appearances
- Accessibility audit passes with no critical violations
- Integration tests with T-2.5.1 token system complete successfully

**File Verification Targets**:
- `components/providers/theme-provider.tsx` - Complete implementation validation
- `components/shared/theme-toggle.tsx` - UI component and accessibility testing
- `components/index.ts` - Export validation and import testing

### Testing Agent Directives
You shall follow these explicit directives in exact order:

1. **Navigate to Application Directory**: Execute `cd .. && cd aplio-modern-1` from pmc to access testing infrastructure
2. **Create Test Directory Structure**: Establish all required T-2.5.2 test directories using `mkdir -p` commands
3. **Start Testing Infrastructure**: Launch enhanced test server and dashboard on ports 3333 and 3334
4. **Execute Component Discovery**: Document all 4 testable elements in `current-test-discovery.md` with priority classification
5. **Generate Test Scaffolds**: Create comprehensive test scaffolds for ThemeProvider and ThemeToggle components
6. **Run Unit Test Suite**: Execute Jest testing with coverage reporting targeting 95% minimum
7. **Validate TypeScript Compliance**: Ensure strict mode compilation succeeds for all theme provider code
8. **Perform Integration Testing**: Validate T-2.5.1 token system integration with all 69 token paths
9. **Execute Visual Testing**: Capture and validate light/dark theme screenshots with transition testing
10. **Conduct Accessibility Audit**: Verify WCAG 2.1 AA compliance for theme toggle component
11. **Generate Compliance Report**: Document all testing results and validation outcomes
12. **Complete Success Verification**: Confirm all success criteria met before marking task complete

## Project Reference Guide
REFERENCE MATERIALS
Everything below this line is supporting information only. Do NOT select the current task focus from this section.

### Aplio Design System Modernization Project

#### Project Overview
This project aims to transform the existing JavaScript-based Aplio theme into a modern TypeScript-powered Next.js 14 platform. The project specifically focuses on migrating the Home 4 template (https://js-aplio-6.vercel.app/home-4) as the flagship demonstration while preserving Aplio's premium design aesthetics from the existing design system in `/aplio-legacy/`.

#### Key Documents
1. Seed Story: `pmc/product/00-aplio-mod-1-seed-story.md`
2. Project Overview: `pmc/product/00-aplio-mod-1-seed-narrative.md`
3. Raw Data: `pmc/product/_seeds/00-narrative-raw_data-ts-14-v3.md`

#### Project Objectives

##### Primary Goals
1. Migrate Home 4 template to Next.js 14 App Router architecture
2. Preserve exact design elements from `/aplio-legacy/`
3. Implement TypeScript with full type safety
4. Maintain premium design quality and animations

##### Technical Requirements
1. Next.js 14 App Router implementation
2. Complete TypeScript migration
3. Modern component architecture
4. Performance optimization

##### Design Requirements
1. Exact preservation of design elements from `/aplio-legacy/`
2. Maintenance of animation quality
3. Responsive behavior preservation
4. Professional template implementation

### Project Memory Core (PMC) System

#### Core Functionality
Everything in this section is supporting information only. Do NOT select the current task focus from this section.
PMC is a structured modern software development task management and context retention system built around the the main active task file as its central operational component. PMC is product agnostic. In this instance we are using it to code the Aplio Design System Modernization (aplio-mod-1) system described above. The system provides:

1. **Context Locality**: Instructions and context are kept directly alongside their relevant tasks
2. **Structured Checkpoints**: Regular token-based checks prevent context drift
3. **Directive Approach**: Clear commands and instructions with explicit timing requirements
4. **Task-Centric Documentation**: Single source of truth for task implementation

#### Commands

The driver for most PMC commands are in:
`pmc/bin/aplio-agent-cli.js`

The code for most PMC commands are contained within:
- The original context manager script: `pmc/system/management/context-manager.js`
- The second context manager script: `pmc/system/management/context-manager-v2.js` (created when the original got too large)
- The third context manager script: `pmc/system/management/context-manager-v3.js` (created when the second got too large)

Here are some important PMC commands:

##### Add Structured Task Approaches
```bash
node pmc/bin/aplio-agent-cli.js task-approach
```

##### Add Structured Test Approaches
```bash
node pmc/bin/aplio-agent-cli.js test-approach

#### Project Structure
```
project-root/aplio-legacy/ (legacy system)
project-root/aplio-modern-1/ (new system)
project-root/pmc/ (PMC system)

```