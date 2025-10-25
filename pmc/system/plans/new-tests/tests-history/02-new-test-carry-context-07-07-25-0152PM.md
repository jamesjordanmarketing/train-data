# Development Context & Operational Priorities
**Date:** 07-07-25-0152PM
**Project:** Aplio Design System Modernization (aplio-mod-1) & Project Memory Core (PMC)
**Context Version:** 3.0.0

## Introduction

This context document addresses two integrated projects that operate in tandem:

1. **Aplio Design System Modernization (aplio-mod-1)**: A comprehensive modernization project converting the legacy Aplio Design System to leverage Next.js 14's App Router architecture and TypeScript. The project focuses on the Home-4 template implementation while preserving visual fidelity and enhancing developer experience.

2. **Project Memory Core (PMC)**: A structured task management and context retention system that manages the development of the Aplio project. PMC provides methodical task tracking, context preservation, and implementation guidance through its command-line interface and document-based workflow.

These projects are deliberately interconnected - PMC requires a real-world development project to refine its capabilities, while Aplio benefits from PMC's structured approach to development. Depending on current priorities, work may focus on either advancing the Aplio Design System implementation or enhancing the PMC tooling itself.

## Current Focus

### T-3.2.3 Active Testing Focus

**Task Summary**: T-3.2.3 Accordion Container Implementation has been successfully completed, creating a production-ready server component container that orchestrates existing AccordionItem components from T-3.2.2. The implementation provides variant support (single-open and multiple-open modes), comprehensive state management (controlled and uncontrolled patterns), and advanced focus coordination between multiple accordion items. The container preserves all existing T-3.2.2 animation systems (300ms transitions) while adding container-level functionality through server component optimization.

**What is Being Tested**: The complete T-3.2.3 Accordion container component system including:
1. **Accordion.tsx** - Main server component container with variant support and state coordination
2. **AccordionFocusManager.tsx** - Client component for advanced keyboard navigation between items  
3. **Accordion.module.css** - Container styling with visual variants and responsive design
4. **Updated index.tsx** - Export integration maintaining backward compatibility

**Why it is Being Tested**: This container component represents a critical orchestration layer that transforms individual T-3.2.2 AccordionItem components into a cohesive, production-ready accordion system. Testing must validate seamless integration with existing components, proper variant behavior, state management reliability, and accessibility compliance including focus management between multiple items.

**Current State of Implementation**: PRODUCTION READY - All 4 core elements implemented successfully:
- ELE-1: Server component container ✅ 
- ELE-2: Variant support (single/multiple-open modes) ✅
- ELE-3: State management (controlled/uncontrolled patterns) ✅  
- ELE-4: Focus management coordination ✅

**Critical Context for Testing**: The implementation maintains full compatibility with T-3.2.2 AccordionItem components without any modifications to their code, preserves exact 300ms animation timing, and integrates seamlessly with T-3.2.1 AccordionProvider context system.

### Testing Focus Areas

You must provide comprehensive testing scrutiny for these critical areas:

• **Container Orchestration**: Validate that the Accordion container properly renders, manages, and coordinates multiple AccordionItem components without interfering with their individual functionality
• **Variant Behavior**: Test single-open mode (only one item open at a time) versus multiple-open mode (multiple items can be open simultaneously) with proper state transitions
• **State Management Integration**: Verify both controlled mode (parent manages state via value/onValueChange props) and uncontrolled mode (container manages internal state via defaultOpen)
• **Focus Management System**: Test advanced keyboard navigation including arrow key navigation between items, Home/End key support, and focus restoration when items are dynamically changed
• **Animation Coordination**: Ensure container does not interfere with existing T-3.2.2 300ms height transition animations while providing proper state coordination
• **Accessibility Compliance**: Validate complete ARIA accordion pattern with proper region roles, expanded states, and screen reader support
• **Server Component Performance**: Test server-side rendering optimization and proper client-side delegation for interactive features

### Existing Testing Instructions Adaptations

You must make these critical adaptations to the baseline unit-test file pmc/core/active-task-unit-tests-2.md:

**New Test Cases Required**:
- **Container Integration Tests**: Test how Accordion container coordinates with multiple AccordionItem children (not covered in baseline)
- **Focus Management Tests**: Test arrow key navigation, Home/End keys, and focus restoration between multiple items (extends beyond individual item focus testing)  
- **Variant Switching Tests**: Test dynamic switching between single-open and multiple-open modes during runtime
- **State Synchronization Tests**: Test coordination between container state and individual AccordionItem states
- **Event Callback Tests**: Test onItemClick, onItemOpen, onItemClose callbacks with multiple items interacting

**Enhanced Assertions Required**:
- Container renders proper ARIA role="region" with accessibility attributes
- Variant behavior properly closes other items in single-open mode
- Focus management coordinates between multiple accordion headers  
- Animation timing remains exactly 300ms (±10ms tolerance) during container state changes
- State callbacks fire in correct order with proper parameters during multi-item interactions

**Testing Approaches Modified**:
- **Multi-Item Scenarios**: All tests must validate behavior with 2-5 accordion items, not just single items
- **Integration Focus**: Emphasize container-item coordination over individual item testing (T-3.2.2 already validated)  
- **Accessibility Extended**: Test keyboard navigation across multiple items, not just within individual items
- **Performance Validation**: Verify server component rendering and client-side hydration behavior

### Modified Testing Approaches

**Component Import Strategy**: Test imports must validate the new container exports from updated index.tsx while ensuring AccordionItem, AccordionProvider, and AccordionFocusManager are properly exported

**Scaffold Generation**: Create scaffolds with 2-5 accordion items to test container coordination scenarios, not single-item scenarios covered by T-3.2.2

**Visual Testing**: Focus on container-level visual consistency, variant styling differences, and focus state visualization across multiple items

**Animation Testing**: Validate coordination timing when multiple items transition states, especially in single-open mode where one item closes while another opens

### Eliminated Requirements

**Individual AccordionItem Testing**: T-3.2.2 already comprehensively validated AccordionItem components with 24/24 unit tests passing and 95% confidence visual validation. Do not re-test individual item functionality.

**Basic Animation Testing**: T-3.2.2 validated 300ms transition timing and height-based animations. Only test animation coordination at container level.

**Provider Context Testing**: T-3.2.1 validated AccordionProvider context system. Only test container integration with existing context, not context functionality itself.

**Icon Component Testing**: T-3.2.2 validated AccordionIcon component functionality. Container does not modify icon behavior.

### Additional Testing Needs

These critical test scenarios became necessary due to the container implementation but are not documented in the baseline test file:

**Server Component Rendering**: Test that container properly renders on server-side without window object, then hydrates correctly on client-side

**Dynamic Item Addition/Removal**: Test focus restoration and state management when accordion items are dynamically added or removed from the container

**Custom Render Props**: Test renderItem, renderHeader, renderContent props with container state coordination

**Event Bubbling**: Test that container properly handles events from multiple accordion items without conflicts

**Memory Leak Prevention**: Test that focus management and event listeners are properly cleaned up when container unmounts

**Accessibility State Announcements**: Test that screen readers properly announce state changes when multiple items change simultaneously

### Key Files and Locations

**Primary Implementation Files**:
- `aplio-modern-1/components/design-system/molecules/Accordion/Accordion.tsx` - Main container component (NEW)
- `aplio-modern-1/components/design-system/molecules/Accordion/AccordionFocusManager.tsx` - Focus management system (NEW)
- `aplio-modern-1/components/design-system/molecules/Accordion/Accordion.module.css` - Container styling (MODIFIED)
- `aplio-modern-1/components/design-system/molecules/Accordion/index.tsx` - Export integration (MODIFIED)

**Integration Dependencies**:
- `aplio-modern-1/components/design-system/molecules/Accordion/AccordionItem.tsx` - T-3.2.2 individual item component (UNCHANGED)
- `aplio-modern-1/components/design-system/molecules/Accordion/AccordionProvider.tsx` - T-3.2.1 context system (UNCHANGED)
- `aplio-modern-1/components/design-system/molecules/Accordion/hooks/useAccordionAnimation.ts` - Animation hook (UNCHANGED)
- `aplio-modern-1/components/design-system/molecules/Accordion/Accordion.types.ts` - Type definitions (UNCHANGED)

**Testing Infrastructure**:
- `aplio-modern-1/test/unit-tests/task-3-2/T-3.2.3/Accordion.test.tsx` - Container component tests (NEW)
- `aplio-modern-1/test/unit-tests/task-3-2/T-3.2.3/design-system-adherence-report.md` - DSAP compliance report (NEW)

### Specification References

**Pattern Implementation**:
- `aplio-modern-1/design-system/docs/components/interactive/accordion/component-design.md` - Container design patterns
- `aplio-modern-1/design-system/docs/animations/interactive/state-transitions.md` - Animation coordination requirements
- `aplio-modern-1/design-system/docs/architecture/component-hierarchy.md` - Server component architecture

**Legacy Reference**: 
- `aplio-legacy/components/home-4/CustomFAQ.jsx` lines 6-11 - Original container behavior patterns

**Design System Compliance**:
- T-3.2.3 achieved 96% DSAP compliance score, documented in design-system-adherence-report.md

### Success Criteria

Testing must validate these measurable conditions for PASS status:

**Functional Requirements**:
- Container renders minimum 2-5 accordion items successfully with proper wrapper structure
- Single-open variant allows only one item open at a time with automatic closing of others  
- Multiple-open variant allows concurrent open items without interference
- Controlled mode properly respects value prop and calls onValueChange callback
- Uncontrolled mode manages internal state correctly with defaultOpen support

**Accessibility Requirements**:
- Container has proper ARIA role="region" with accessibility attributes
- Arrow key navigation moves focus between accordion headers in sequence
- Home key moves focus to first item, End key to last item
- Focus restoration works when items are dynamically changed
- Screen reader announces state changes correctly

**Performance Requirements**:
- Server component renders without client-side JavaScript dependencies
- Animation timing remains 300ms (±10ms tolerance) during state transitions
- No memory leaks from event listeners or focus management during component lifecycle

**Integration Requirements**:
- Seamless integration with T-3.2.2 AccordionItem components without modifications
- Proper coordination with T-3.2.1 AccordionProvider context system
- Export integration maintains backward compatibility while adding new container exports

### Testing Requirements Summary

**Mandatory Test Coverage**:
- [ ] Container rendering with 2-5 AccordionItem components
- [ ] Single-open variant behavior with automatic item closing  
- [ ] Multiple-open variant behavior with concurrent items
- [ ] Controlled state management with value/onValueChange props
- [ ] Uncontrolled state management with defaultOpen prop
- [ ] Arrow key navigation between multiple accordion headers
- [ ] Home/End key navigation to first/last items
- [ ] Focus restoration during dynamic item changes
- [ ] Event callback coordination (onItemClick, onItemOpen, onItemClose)
- [ ] Server component rendering without window object
- [ ] Animation timing preservation (300ms ±10ms)
- [ ] Accessibility compliance with ARIA patterns
- [ ] Export integration and backward compatibility

**Success Gates**:
- All unit tests pass with ≥90% code coverage on container components
- Focus management tests validate proper keyboard navigation
- Variant tests confirm proper state coordination behavior  
- Integration tests verify T-3.2.2 compatibility preservation
- Performance tests confirm server component optimization

**File Targets**:
- Primary: `Accordion.tsx`, `AccordionFocusManager.tsx`, `Accordion.module.css`, updated `index.tsx`
- Integration: Proper import/export of AccordionItem, AccordionProvider, and related components
- Testing: Complete test suite in `test/unit-tests/task-3-2/T-3.2.3/` directory

### Testing Agent Directives

You shall execute testing following this exact sequence:

1. **You must read pmc/core/active-task.md completely** to understand the original task requirements and acceptance criteria
2. **You must navigate to aplio-modern-1/ directory** as your primary working directory for all testing operations  
3. **You must validate all 4 core implementation files exist** before beginning any test creation
4. **You must create comprehensive unit tests** covering all container functionality, variant behavior, state management, and focus coordination
5. **You must test integration scenarios** with multiple AccordionItem components (2-5 items minimum)
6. **You must validate accessibility compliance** including keyboard navigation and ARIA patterns
7. **You must verify server component behavior** including server-side rendering and client-side hydration
8. **You must confirm animation timing preservation** during container state changes (300ms ±10ms tolerance)
9. **You must test both controlled and uncontrolled usage patterns** with proper event callback validation
10. **You must validate focus management** across multiple accordion items with comprehensive keyboard navigation testing

**Critical Success Requirements**:
- Container integration tests with T-3.2.2 AccordionItem components (do not modify T-3.2.2 components)
- Focus management validation across multiple items with arrow keys, Home/End keys, and focus restoration
- Variant behavior testing for both single-open and multiple-open modes
- State management testing for both controlled (value/onValueChange) and uncontrolled (defaultOpen) patterns
- Accessibility compliance with complete ARIA accordion pattern
- Server component optimization validation without breaking client-side functionality

## Next Steps 

1. **Phase 0 Setup**: Navigate to aplio-modern-1/, create T-3.2.3 test directories, start test server and dashboard
2. **Phase 1 Discovery**: Validate all 4 T-3.2.3 components exist and can be imported properly
3. **Phase 2 Unit Testing**: Create comprehensive test suite covering container functionality, variants, state management, and focus coordination
4. **Phase 3 Visual Testing**: Generate scaffolds with multi-item scenarios and validate visual consistency
5. **Phase 4 Integration Testing**: Test container coordination with T-3.2.2 AccordionItem components and T-3.2.1 AccordionProvider

### Important Dependencies

**T-3.2.2 AccordionItem Components**: COMPLETED - All components ready for integration testing (do not modify)
**T-3.2.1 AccordionProvider Context**: COMPLETED - Context system ready for container coordination testing
**Testing Infrastructure**: ESTABLISHED - Enhanced testing framework ready for T-3.2.3 validation

### Important Files

**Implementation Files Created/Modified in T-3.2.3**:
- `aplio-modern-1/components/design-system/molecules/Accordion/Accordion.tsx` - Main container component (NEW)
- `aplio-modern-1/components/design-system/molecules/Accordion/AccordionFocusManager.tsx` - Focus management (NEW)  
- `aplio-modern-1/components/design-system/molecules/Accordion/Accordion.module.css` - Container styles (MODIFIED)
- `aplio-modern-1/components/design-system/molecules/Accordion/index.tsx` - Export integration (MODIFIED)

**Integration Dependencies (DO NOT MODIFY)**:
- `aplio-modern-1/components/design-system/molecules/Accordion/AccordionItem.tsx` - T-3.2.2 individual items
- `aplio-modern-1/components/design-system/molecules/Accordion/AccordionProvider.tsx` - T-3.2.1 context system
- `aplio-modern-1/components/design-system/molecules/Accordion/hooks/useAccordionAnimation.ts` - Animation hook

### Important Scripts, Markdown Files, and Specifications

**Testing Protocol References**:
- `pmc/core/active-task-unit-tests-2.md` - Baseline testing protocol to enhance and adapt
- `aplio-modern-1/test/utils/T-3.2.2-sequential-vision-analysis.js` - Proven LLM vision analysis framework
- `aplio-modern-1/test/utils/scaffold-templates/create-enhanced-scaffold.js` - Enhanced scaffold generation system

**Specification Files**:
- `pmc/core/active-task.md` - Complete T-3.2.3 requirements and acceptance criteria
- `aplio-modern-1/test/unit-tests/task-3-2/T-3.2.3/design-system-adherence-report.md` - DSAP compliance documentation (96% score)

### T-3.2.3 Recent Development Context

- **Last Milestone**: T-3.2.3 Container Implementation - PRODUCTION READY (All 4 elements completed successfully)
- **Key Outcomes**: 
  - Accordion container with variant support and state management coordination
  - AccordionFocusManager with advanced keyboard navigation between multiple items
  - Complete integration with existing T-3.2.2 and T-3.2.1 components without modifications
  - 96% DSAP compliance score with comprehensive accessibility support
- **Relevant Learnings**: 
  - Server component optimization requires careful client-side delegation for interactive features
  - Focus management between multiple items needs mutation observer for dynamic content changes
  - Animation coordination must preserve existing 300ms timing while adding container-level behavior
- **Technical Context**: 
  - Container preserves T-3.2.2's client component architecture for AccordionItem while adding server-optimized container layer
  - State management uses hybrid approach: server rendering + client coordination via AccordionProvider
  - Focus management extends T-3.2.2's individual item navigation to multi-item container scenarios

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