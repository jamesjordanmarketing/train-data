# Aplio Design System Next.js Modernization - Task to Test Mapping - Section 4
**Generated:** 2025-05-02

## Overview
This document maps tasks (T-4.Y.Z) and their elements (ELE-n) to their corresponding test requirements and implementation details. Each task element may be covered by multiple implementation steps (IMP-n) and validation steps (VAL-n).

## 4. Business Logic

### T-4.1.0: Header Component Implementation

- **FR Reference**: FR-4.1.0
- **Impact Weighting**: Operational Efficiency
- **Dependencies**: 
- **Description**: Header Component Implementation
- **Completes Component?**: 

**Functional Requirements Acceptance Criteria**:
- Header component visually matches the legacy implementation
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:12-303
- Layout, spacing, and alignment match the legacy design
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:35-47
- Logo implementation supports both light and dark variants if applicable
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:40-46
- Server/client boundaries are optimized with static content on the server
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:1-2
- Interactive elements are confined to client components
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:18-30
- Dropdown menu functionality matches the legacy behavior
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:66-81
- Dropdown animations match the timing and easing of the legacy implementation
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:72-77
- Mobile menu implementation matches the legacy design and functionality
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:137-238
- Mobile menu toggle animation matches the legacy implementation
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:110-122
- Responsive behavior matches the legacy implementation across all breakpoints
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:37-38
- Sticky header behavior is implemented if present in legacy design
Legacy Code Reference:
- `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:18-30
- `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:35-38
- Header state changes (e.g., on scroll) match the legacy implementation
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:18-30
- Component meets WCAG 2.1 AA accessibility requirements
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:47-112
- Keyboard navigation is properly implemented for all interactive elements
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:47-112
- Focus management follows accessibility best practices
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\navbar\PrimaryNavbar.jsx`:77-107

#### T-4.1.1: Header Structure and Static Elements

- **Parent Task**: T-4.1.0
- **Implementation Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\components\layout\Header\index.tsx`
- **Patterns**: P002-SERVER-COMPONENT, P013-LAYOUT-COMPONENT
- **Dependencies**: FR-2.1.0 (Design Token Extraction)
- **Estimated Human Testing Hours**: 6-8 hours
- **Description**: Set up the Header component with correct layout structure and static elements

#### Test Coverage Requirements
- **Test Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\test\unit-tests\task-4-1\T-4.1.1\`
- **Testing Tools**: Jest, TypeScript, React Testing Library, Storybook, Axe
- **Coverage Target**: 90% code coverage

#### Acceptance Criteria
- Header component structure visually matches the legacy implementation
- Layout, spacing, and alignment match the legacy design
- Logo implementation supports both light and dark variants if applicable
- Server component properly renders static content
- Navigation elements have proper semantic HTML structure

#### Element Test Mapping

##### [T-4.1.1:ELE-1] Server component structure: Create the base Header component structure with server-side rendered static content
- **Preparation Steps**:
  - [PREP-1] Study legacy component structure in PrimaryNavbar.jsx (implements ELE-1)
- **Implementation Steps**:
  - [IMP-1] Create server component base structure with appropriate semantic HTML (implements ELE-1)
- **Test Requirements**:
  - Verify Header component properly renders as a React Server Component without client-side interactivity
  - Validate that semantic HTML structure matches legacy implementation with proper heading levels and landmark regions
  - Test that component successfully renders without JavaScript errors when used in a server context
  - Ensure component integrates correctly with the Next.js 14 App Router architecture
- **Testing Deliverables**:
  - `Header.server.test.tsx`: Tests for server component rendering and structure
  - `Header.snapshot.test.tsx`: Snapshot tests comparing against legacy implementation structure
  - Server component validation tests verifying proper Next.js 14 integration
  - Accessibility test suite verifying semantic HTML structure
- **Human Verification Items**:
  - Visually verify header component structure matches legacy implementation 
  - Confirm proper DOM hierarchy using browser developer tools
  - Validate component renders correctly with JavaScript disabled

##### [T-4.1.1:ELE-2] Layout implementation: Implement header layout structure matching legacy design with proper spacing and alignment
- **Preparation Steps**:
  - [PREP-2] Extract layout patterns and spacing from legacy design (implements ELE-2)
- **Implementation Steps**:
  - [IMP-2] Implement header layout with grid/flexbox matching legacy design (implements ELE-2)
  - [IMP-5] Apply design tokens for colors, spacing, and typography (implements ELE-2)
- **Validation Steps**:
  - [VAL-1] Verify layout structure matches legacy design (validates ELE-2)
  - [VAL-4] Verify application of correct design tokens (validates ELE-2)
- **Test Requirements**:
  - Verify the header layout structure properly uses modern grid/flexbox while maintaining visual parity with legacy implementation
  - Test that spacing variables and design tokens are correctly applied across all layout elements
  - Validate header component maintains proper alignment of all child elements
  - Ensure layout implementation is resilient to different content lengths and screen sizes
- **Testing Deliverables**:
  - `Header.layout.test.tsx`: Tests focusing on layout structure and spacing
  - `Header.tokens.test.tsx`: Tests verifying design token application
  - Visual regression test suite comparing layout to legacy implementation
  - Storybook story documenting layout structure with various content scenarios
- **Human Verification Items**:
  - Visually inspect spacing and alignment across all header elements compared to legacy implementation
  - Verify proper responsiveness across different viewport sizes
  - Confirm correct application of design tokens for spacing, alignment, and typography

##### [T-4.1.1:ELE-3] Logo integration: Create Logo component with support for light/dark variants
- **Preparation Steps**:
  - [PREP-3] Identify logo variants and states in the legacy design (implements ELE-3)
- **Implementation Steps**:
  - [IMP-3] Create logo component with support for variants (implements ELE-3)
- **Validation Steps**:
  - [VAL-2] Confirm logo displays correctly in both light/dark modes (validates ELE-3)
- **Test Requirements**:
  - Verify logo component properly supports both light and dark variants
  - Test logo component accessibility including alt text and proper semantic structure
  - Validate logo sizing and responsive behavior matches legacy implementation
  - Ensure proper context-based rendering of appropriate logo variant based on theme
- **Testing Deliverables**:
  - `Logo.test.tsx`: Component tests for logo implementation and variants
  - `Logo.theme.test.tsx`: Tests for theme-based variant selection
  - Visual comparison tests for logo appearance in both light/dark modes
  - Accessibility tests for logo implementation
- **Human Verification Items**:
  - Visually verify correct logo variants appear in light and dark modes
  - Confirm logo maintains proper quality at different viewport sizes
  - Validate logo appears correctly in both color schemes with proper contrast

##### [T-4.1.1:ELE-4] Navigation structure: Set up navigation link structure with proper semantic HTML
- **Implementation Steps**:
  - [IMP-4] Set up static navigation structure with proper accessibility attributes (implements ELE-4)
- **Validation Steps**:
  - [VAL-3] Check accessibility of semantic HTML structure (validates ELE-4)
- **Test Requirements**:
  - Verify navigation structure uses semantic HTML elements (nav, ul, li) matching legacy implementation
  - Test proper implementation of ARIA attributes for accessibility
  - Validate that navigation links have proper structure for screen readers
  - Ensure navigation markup maintains backward compatibility with legacy implementation
- **Testing Deliverables**:
  - `NavStructure.test.tsx`: Tests for navigation structure and semantic markup
  - `NavAccessibility.test.tsx`: Accessibility-focused tests for navigation
  - Axe accessibility validation tests for navigation structure
  - DOM structure validation tests comparing to legacy implementation
- **Human Verification Items**:
  - Verify navigation is properly announced by screen readers
  - Confirm proper semantic structure using browser developer tools
  - Validate navigation appears correctly in browser accessibility tree

#### T-4.1.2: Dropdown Menu Implementation

- **Parent Task**: T-4.1.0
- **Implementation Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\components\layout\Header\DropdownMenu.tsx`
- **Patterns**: P003-CLIENT-COMPONENT, P017-HOVER-ANIMATION
- **Dependencies**: T-4.1.1
- **Estimated Human Testing Hours**: 8-10 hours
- **Description**: Implement dropdown menu functionality with matching behavior and animations

#### Test Coverage Requirements
- **Test Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\test\unit-tests\task-4-1\T-4.1.2\`
- **Testing Tools**: Jest, TypeScript, React Testing Library, Storybook, Chromatic, Playwright
- **Coverage Target**: 90% code coverage

#### Acceptance Criteria
- Dropdown menu functionality matches the legacy behavior
- Dropdown animations match the timing and easing of the legacy implementation
- Interactive elements are properly confined to client components
- Component meets WCAG 2.1 AA accessibility requirements
- Dropdown behavior works consistently across browsers

#### Element Test Mapping

##### [T-4.1.2:ELE-1] Client component wrapper: Create client-side component wrapper for interactive dropdown menu
- **Preparation Steps**:
  - [PREP-1] Analyze legacy dropdown behavior and interactions (implements ELE-1, ELE-2)
- **Implementation Steps**:
  - [IMP-1] Create client component with 'use client' directive (implements ELE-1)
- **Test Requirements**:
  - Verify component correctly uses the 'use client' directive for proper client-side rendering
  - Test that component hydrates correctly without hydration mismatch errors
  - Validate component properly integrates with the server component parent structure
  - Ensure component can access and manipulate client-side browser APIs
- **Testing Deliverables**:
  - `DropdownMenu.client.test.tsx`: Tests for client component structure and hydration
  - `DropdownMenu.integration.test.tsx`: Tests for integration with server component parent
  - Hydration test suite verifying proper client component behavior
  - Mock test fixtures for simulating server/client boundary
- **Human Verification Items**:
  - Verify dropdown menu properly hydrates without visual flickering
  - Confirm component behavior works with JavaScript enabled/disabled scenarios
  - Validate proper event handling on the client side

##### [T-4.1.2:ELE-2] Dropdown state management: Implement state handling for open/closed dropdown states
- **Preparation Steps**:
  - [PREP-1] Analyze legacy dropdown behavior and interactions (implements ELE-1, ELE-2)
- **Implementation Steps**:
  - [IMP-2] Implement state management for dropdown visibility (implements ELE-2)
  - [IMP-3] Add hover and click event handlers matching legacy behavior (implements ELE-2)
- **Validation Steps**:
  - [VAL-1] Test dropdown open/close behavior (validates ELE-2)
- **Test Requirements**:
  - Verify dropdown correctly manages open/closed state with proper React state management
  - Test that hover and click interactions function identically to legacy implementation
  - Validate proper handling of edge cases (rapid hover events, click outside, keyboard escape)
  - Ensure dropdown state is properly synchronized across multiple dropdown instances
- **Testing Deliverables**:
  - `DropdownState.test.tsx`: State management unit tests
  - `DropdownInteractions.test.tsx`: Tests for hover/click behaviors
  - Event handling test suite for all interaction patterns
  - Edge case test suite for unusual interaction patterns
- **Human Verification Items**:
  - Verify dropdown opens/closes with the same behavior and timing as legacy implementation
  - Confirm hover states feel natural and match legacy implementation
  - Validate that multiple dropdown instances behave consistently

##### [T-4.1.2:ELE-3] Dropdown animation: Implement animation effects matching legacy implementation
- **Preparation Steps**:
  - [PREP-2] Extract animation timing and easing functions from legacy code (implements ELE-3)
- **Implementation Steps**:
  - [IMP-4] Implement dropdown animations with matching timing (implements ELE-3)
- **Validation Steps**:
  - [VAL-2] Verify animation timing and easing matches legacy (validates ELE-3)
- **Test Requirements**:
  - Verify animation timing and easing curves match legacy implementation precisely
  - Test that animations perform well without causing layout shifts or performance issues
  - Validate animation behavior is consistent across supported browsers
  - Ensure animations respect user preferences for reduced motion
- **Testing Deliverables**:
  - `DropdownAnimation.test.tsx`: Animation timing and easing tests
  - `AnimationPerformance.test.ts`: Performance testing for animations
  - Visual regression tests comparing animation sequences to legacy
  - Motion preference test suite for reduced motion compliance
- **Human Verification Items**:
  - Visually verify animation timing and easing match legacy implementation
  - Confirm animations feel smooth and natural
  - Validate animations respect user preference for reduced motion

##### [T-4.1.2:ELE-4] Accessibility features: Add keyboard navigation and screen reader support
- **Preparation Steps**:
  - [PREP-3] Study accessibility patterns in legacy dropdown (implements ELE-4)
- **Implementation Steps**:
  - [IMP-5] Add keyboard navigation and ARIA attributes (implements ELE-4)
- **Validation Steps**:
  - [VAL-3] Confirm keyboard navigation works as expected (validates ELE-4)
  - [VAL-4] Test screen reader functionality (validates ELE-4)
- **Test Requirements**:
  - Verify keyboard navigation works for all dropdown interactions (Tab, Enter, Escape, Arrow keys)
  - Test proper implementation of ARIA attributes (aria-expanded, aria-controls, etc.)
  - Validate screen reader announces dropdown state changes appropriately
  - Ensure focus management follows WCAG 2.1 AA best practices
- **Testing Deliverables**:
  - `DropdownA11y.test.tsx`: Accessibility-focused tests
  - `KeyboardNav.test.tsx`: Tests for keyboard interactions
  - Screen reader announcement tests with various assistive technologies
  - Focus management test suite ensuring proper keyboard navigation
- **Human Verification Items**:
  - Test dropdown operation using keyboard-only navigation
  - Verify screen reader provides appropriate feedback for dropdown state changes
  - Confirm focus is properly trapped and managed within the dropdown when open

#### T-4.1.3: Mobile Menu Implementation

- **Parent Task**: T-4.1.0
- **Implementation Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\components\layout\Header\MobileMenu.tsx`
- **Patterns**: P003-CLIENT-COMPONENT, P018-TRANSITION-ANIMATION
- **Dependencies**: T-4.1.1
- **Estimated Human Testing Hours**: 10-12 hours
- **Description**: Implement mobile menu with toggle animation and responsive behavior

#### Test Coverage Requirements
- **Test Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\test\unit-tests\task-4-1\T-4.1.3\`
- **Testing Tools**: Jest, TypeScript, React Testing Library, Playwright, Storybook, Axe, Lighthouse
- **Coverage Target**: 90% code coverage

#### Acceptance Criteria
- Mobile menu implementation matches the legacy design and functionality
- Mobile menu toggle animation matches the legacy implementation
- Responsive behavior matches the legacy implementation across all breakpoints
- Mobile menu is accessible and meets WCAG 2.1 AA requirements
- Menu provides proper touch targets for mobile devices

#### Element Test Mapping

##### [T-4.1.3:ELE-1] Mobile toggle button: Create hamburger menu toggle button with animation
- **Preparation Steps**:
  - [PREP-1] Analyze mobile menu toggle animation in legacy code (implements ELE-1)
- **Implementation Steps**:
  - [IMP-1] Create mobile toggle button component with animation (implements ELE-1)
- **Validation Steps**:
  - [VAL-1] Test mobile toggle button animation (validates ELE-1)
- **Test Requirements**:
  - Verify toggle button animation timing and easing matches legacy implementation
  - Test that toggle button has appropriate ARIA attributes (aria-expanded, aria-controls)
  - Validate toggle button has proper touch target size for mobile devices (min 44×44px)
  - Ensure toggle button correctly communicates state to assistive technologies
- **Testing Deliverables**:
  - `ToggleButton.test.tsx`: Tests for toggle button functionality and animation
  - `ToggleButtonA11y.test.tsx`: Accessibility tests for toggle button
  - Visual regression tests comparing toggle animation to legacy implementation
  - Touch target size validation tests for mobile accessibility
- **Human Verification Items**:
  - Visually verify toggle animation matches legacy implementation
  - Confirm toggle button provides clear visual feedback when activated
  - Validate proper touch target size on actual mobile devices

##### [T-4.1.3:ELE-2] Mobile menu container: Implement expandable container for mobile menu items
- **Preparation Steps**:
  - [PREP-2] Extract mobile menu structure and behavior patterns (implements ELE-2, ELE-3)
- **Implementation Steps**:
  - [IMP-2] Implement mobile menu container with expand/collapse functionality (implements ELE-2)
- **Validation Steps**:
  - [VAL-2] Verify mobile menu expand/collapse behavior (validates ELE-2)
- **Test Requirements**:
  - Verify mobile menu container expands and collapses with appropriate animation
  - Test that container properly handles various content heights and dynamically adjusts
  - Validate that container is properly hidden from screen readers when collapsed
  - Ensure proper z-index handling and stacking context for overlapping elements
- **Testing Deliverables**:
  - `MobileMenuContainer.test.tsx`: Tests for container behavior and structure
  - `ContainerAnimation.test.tsx`: Tests for expand/collapse animations
  - Dynamic content height adjustment tests
  - Screen reader visibility tests based on menu state
- **Human Verification Items**:
  - Verify expand/collapse animation feels smooth and consistent with legacy
  - Confirm menu properly handles dynamic content with varying heights
  - Validate overlay behavior when menu is expanded

##### [T-4.1.3:ELE-3] Mobile navigation items: Create mobile-specific navigation items and dropdowns
- **Preparation Steps**:
  - [PREP-2] Extract mobile menu structure and behavior patterns (implements ELE-2, ELE-3)
- **Implementation Steps**:
  - [IMP-3] Build mobile navigation items with nested dropdowns (implements ELE-3)
  - [IMP-5] Implement touch-friendly interactions for mobile devices (implements ELE-3)
- **Validation Steps**:
  - [VAL-3] Test mobile navigation items and dropdowns (validates ELE-3)
- **Test Requirements**:
  - Verify mobile navigation items use proper semantic structure for accessibility
  - Test nested dropdown behavior within mobile menu context
  - Validate touch interactions are properly optimized for mobile experience
  - Ensure proper focus management when navigating between nested levels
- **Testing Deliverables**:
  - `MobileNavItems.test.tsx`: Tests for navigation items structure
  - `MobileNestedDropdowns.test.tsx`: Tests for nested dropdown behavior
  - Touch interaction test suite for mobile-specific behaviors
  - Focus management tests for nested navigation
- **Human Verification Items**:
  - Test touch interactions on actual mobile devices
  - Verify nested menu navigation feels intuitive and matches legacy behavior
  - Validate proper focus indicators are visible during keyboard navigation

##### [T-4.1.3:ELE-4] Responsive breakpoints: Implement responsive behavior for mobile menu across breakpoints
- **Preparation Steps**:
  - [PREP-3] Identify responsive breakpoints for mobile menu display (implements ELE-4)
- **Implementation Steps**:
  - [IMP-4] Add responsive styles for different breakpoints (implements ELE-4)
- **Validation Steps**:
  - [VAL-4] Confirm responsive behavior at all breakpoints (validates ELE-4)
- **Test Requirements**:
  - Verify responsive behavior matches legacy implementation at all defined breakpoints
  - Test that menu appropriately transitions between mobile/desktop views
  - Validate that no layout shifts occur during responsive transitions
  - Ensure consistent behavior across various device sizes and orientations
- **Testing Deliverables**:
  - `ResponsiveBreakpoints.test.tsx`: Tests for breakpoint-specific behavior
  - `MediaQueryTransitions.test.tsx`: Tests for transitions between breakpoints
  - Viewport simulation tests across various device sizes
  - Performance tests ensuring smooth responsive transitions
- **Human Verification Items**:
  - Test responsive behavior across all defined breakpoints
  - Verify smooth transitions between mobile and desktop layouts
  - Validate behavior in both portrait and landscape orientations on mobile devices

#### T-4.1.4: Header Interactivity and State Management

- **Parent Task**: T-4.1.0
- **Implementation Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\components\layout\Header\HeaderState.tsx`
- **Patterns**: P003-CLIENT-COMPONENT, P022-STATE-MANAGEMENT
- **Dependencies**: T-4.1.1, T-4.1.2, T-4.1.3
- **Estimated Human Testing Hours**: 8-10 hours
- **Description**: Implement header state changes and interactive behaviors

#### Test Coverage Requirements
- **Test Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\test\unit-tests\task-4-1\T-4.1.4\`
- **Testing Tools**: Jest, TypeScript, React Testing Library, Playwright, Web Vitals
- **Coverage Target**: 90% code coverage

#### Acceptance Criteria
- Sticky header behavior is implemented if present in legacy design
- Header state changes (e.g., on scroll) match the legacy implementation
- Focus management follows accessibility best practices
- Interactive elements maintain consistent state across the application
- Header behavior is performant and doesn't cause layout shifts

#### Element Test Mapping

##### [T-4.1.4:ELE-1] Scroll state handling: Implement header state changes based on scroll position
- **Preparation Steps**:
  - [PREP-1] Analyze scroll behavior and state transitions in legacy code (implements ELE-1, ELE-2)
- **Implementation Steps**:
  - [IMP-1] Create scroll listener for header state changes (implements ELE-1)
- **Validation Steps**:
  - [VAL-1] Test scroll-based state changes (validates ELE-1)
- **Test Requirements**:
  - Verify header state correctly changes based on scroll position thresholds
  - Test that scroll listener is properly optimized with debounce/throttle techniques
  - Validate scroll behavior is consistent across different browsers and devices
  - Ensure scroll-based state changes don't negatively impact performance metrics
- **Testing Deliverables**:
  - `ScrollListener.test.tsx`: Tests for scroll event handling and state updates
  - `ScrollPerformance.test.ts`: Performance optimization tests for scroll handling
  - Cross-browser scroll behavior tests with Playwright
  - Cumulative Layout Shift (CLS) performance tests during scrolling
- **Human Verification Items**:
  - Verify header state changes feel smooth and responsive during scrolling
  - Confirm scroll behavior matches legacy implementation exactly
  - Validate performance impact of scroll listener on different devices

##### [T-4.1.4:ELE-2] Sticky header behavior: Implement sticky header functionality with proper transitions
- **Preparation Steps**:
  - [PREP-1] Analyze scroll behavior and state transitions in legacy code (implements ELE-1, ELE-2)
- **Implementation Steps**:
  - [IMP-2] Implement sticky header with CSS and state management (implements ELE-2)
- **Validation Steps**:
  - [VAL-2] Verify sticky header behavior (validates ELE-2)
- **Test Requirements**:
  - Verify sticky header correctly adheres to viewport during scrolling
  - Test transition animations when header becomes sticky/unsticky
  - Validate sticky behavior works consistently across different browser implementations
  - Ensure sticky header implementation doesn't cause Cumulative Layout Shift (CLS)
- **Testing Deliverables**:
  - `StickyHeader.test.tsx`: Tests for sticky positioning and behavior
  - `StickyTransition.test.tsx`: Tests for transition animations
  - Browser compatibility tests for sticky implementation
  - Layout shift measurement tests during sticky transitions
- **Human Verification Items**:
  - Verify sticky header behavior looks and feels identical to legacy implementation
  - Confirm transitions between sticky/non-sticky states are smooth
  - Validate consistent behavior across different viewport sizes

##### [T-4.1.4:ELE-3] Focus management: Implement proper focus handling for interactive elements
- **Preparation Steps**:
  - [PREP-2] Study focus management patterns in legacy implementation (implements ELE-3)
- **Implementation Steps**:
  - [IMP-3] Add focus management for keyboard navigation (implements ELE-3)
- **Validation Steps**:
  - [VAL-3] Test keyboard focus management (validates ELE-3)
- **Test Requirements**:
  - Verify focus is properly managed across all interactive header elements
  - Test that focus is maintained during header state changes (sticky/non-sticky)
  - Validate focus trapping works correctly in dropdown/mobile menus
  - Ensure focus indicators are visible and meet contrast requirements
- **Testing Deliverables**:
  - `FocusManagement.test.tsx`: Tests for focus handling across interactive elements
  - `FocusTrapping.test.tsx`: Tests for focus containment in menus
  - Keyboard navigation test suite covering all interactive paths
  - Focus visibility tests for accessibility compliance
- **Human Verification Items**:
  - Test keyboard navigation through all interactive header elements
  - Verify focus is properly trapped within menus when open
  - Validate focus indicators are clearly visible and meet contrast guidelines

##### [T-4.1.4:ELE-4] Responsive state adaptations: Implement state management adjustments for different screen sizes
- **Preparation Steps**:
  - [PREP-3] Identify responsive state changes across breakpoints (implements ELE-4)
- **Implementation Steps**:
  - [IMP-4] Implement responsive state handling for different devices (implements ELE-4)
- **Validation Steps**:
  - [VAL-4] Confirm responsive state adaptations (validates ELE-4)
- **Test Requirements**:
  - Verify state management adapts appropriately across different viewport sizes
  - Test that state transitions occur correctly when viewport size changes
  - Validate responsive behavior with and without JavaScript enabled
  - Ensure consistent state management between mobile and desktop views
- **Testing Deliverables**:
  - `ResponsiveState.test.tsx`: Tests for breakpoint-specific state management
  - `ViewportTransition.test.tsx`: Tests for state handling during viewport changes
  - Progressive enhancement tests with JavaScript disabled
  - State synchronization tests between different views
- **Human Verification Items**:
  - Test state consistency when resizing viewport between breakpoints
  - Verify state transitions occur smoothly during responsive adjustments
  - Validate consistent behavior when switching between mobile and desktop views

### T-4.2.0: Footer Component Implementation

- **FR Reference**: FR-4.2.0
- **Impact Weighting**: Operational Efficiency
- **Dependencies**: 
- **Description**: Footer Component Implementation
- **Completes Component?**: 

**Functional Requirements Acceptance Criteria**:
- Footer component visually matches the legacy implementation
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:6-120
- Layout, spacing, and alignment match the legacy design
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:8-10
- Footer sections match the organization of the legacy design
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:10-11
- Logo implementation in footer matches the legacy design
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:12-18
- Newsletter form functionality is fully implemented
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\shared\NewsLetter.jsx`:1-80
- Newsletter form styling matches the legacy design
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\shared\NewsLetter.jsx`:21-25
- Social media links are implemented with correct icons
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:69-76
- Social media icon styling matches the legacy design
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:72-74
- Link groups are organized according to the legacy design
Legacy Code Reference:
- `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:19-32
- `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:33-46
- Copyright information is correctly displayed
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:97
- Responsive behavior matches the legacy implementation across all breakpoints
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:10-11
- Mobile layout adjustments match the legacy implementation
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:96-107
- Component is implemented primarily as a server component
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:6-120
- Interactive elements are properly isolated in client components
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:22-30
- Component meets WCAG 2.1 AA accessibility requirements
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:19-76
- Link groups have proper semantic structure for screen readers
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:19-32
- Keyboard navigation is properly implemented for all interactive elements
Legacy Code Reference: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-legacy\components\footer\Footer.jsx`:22-30

#### T-4.2.1: Footer Structure and Layout

- **Parent Task**: T-4.2.0
- **Implementation Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\components\layout\Footer\index.tsx`
- **Patterns**: P002-SERVER-COMPONENT, P013-LAYOUT-COMPONENT
- **Dependencies**: FR-2.1.0 (Design Token Extraction)
- **Estimated Human Testing Hours**: 6-8 hours
- **Description**: Implement footer component structure and layout with proper organization

#### Test Coverage Requirements
- **Test Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\test\unit-tests\task-4-2\T-4.2.1\`
- **Testing Tools**: Jest, TypeScript, React Testing Library, Storybook, Axe
- **Coverage Target**: 90% code coverage

#### Acceptance Criteria
- Footer component visually matches the legacy implementation
- Layout, spacing, and alignment match the legacy design
- Footer sections match the organization of the legacy design
- Component is implemented primarily as a server component
- Responsive behavior matches the legacy implementation across breakpoints

#### Element Test Mapping

##### [T-4.2.1:ELE-1] Server component structure: Create base Footer component as a server component
- **Preparation Steps**:
  - [PREP-1] Analyze footer structure in legacy implementation (implements ELE-1)
- **Implementation Steps**:
  - [IMP-1] Create server component with proper semantic HTML (implements ELE-1)
- **Validation Steps**:
  - [VAL-1] Verify footer structure matches legacy design (validates ELE-1)
- **Test Requirements**:
  - Verify Footer component renders correctly as a React Server Component
  - Test semantic HTML structure matches legacy implementation with proper landmark regions
  - Validate component renders without JavaScript errors in a server context
  - Ensure component structure follows Next.js 14 server component best practices
- **Testing Deliverables**:
  - `Footer.server.test.tsx`: Tests for server component structure and rendering
  - `Footer.semantic.test.tsx`: Tests for proper semantic HTML structure
  - Server component validation tests with Next.js testing utilities
  - Accessibility tests for landmark regions and semantic structure
- **Human Verification Items**:
  - Visually verify footer structure matches legacy implementation
  - Confirm proper semantic structure using browser developer tools
  - Validate component renders properly with JavaScript disabled

##### [T-4.2.1:ELE-2] Footer layout grid: Implement footer layout grid with proper section organization
- **Preparation Steps**:
  - [PREP-2] Study footer grid layout and organization (implements ELE-2)
- **Implementation Steps**:
  - [IMP-2] Implement footer grid layout matching legacy design (implements ELE-2)
- **Validation Steps**:
  - [VAL-2] Test grid layout and section organization (validates ELE-2)
- **Test Requirements**:
  - Verify footer grid layout uses modern CSS Grid or Flexbox while maintaining visual parity
  - Test that section organization matches legacy implementation exactly
  - Validate proper nesting of layout elements with consistent spacing
  - Ensure footer layout properly handles different content lengths and variations
- **Testing Deliverables**:
  - `FooterGrid.test.tsx`: Tests for grid layout structure
  - `SectionOrganization.test.tsx`: Tests for proper section structure
  - Visual regression tests comparing layout to legacy implementation
  - Content flexibility tests with varying content lengths
- **Human Verification Items**:
  - Visually verify grid layout and section organization matches legacy design
  - Confirm spacing between sections is consistent with legacy implementation
  - Validate layout is resilient to different content scenarios

##### [T-4.2.1:ELE-3] Logo implementation: Add logo component to footer with proper styling
- **Preparation Steps**:
  - [PREP-3] Identify footer logo requirements and styling (implements ELE-3)
- **Implementation Steps**:
  - [IMP-3] Add logo component with proper styling (implements ELE-3)
- **Validation Steps**:
  - [VAL-3] Confirm logo appearance and positioning (validates ELE-3)
- **Test Requirements**:
  - Verify footer logo implementation matches legacy design specifications
  - Test logo proper positioning and alignment within the footer layout
  - Validate logo has appropriate accessibility attributes
  - Ensure logo styling is consistent with design system guidelines
- **Testing Deliverables**:
  - `FooterLogo.test.tsx`: Tests for logo implementation in footer context
  - `LogoAccessibility.test.tsx`: Accessibility tests for footer logo
  - Visual regression tests for logo appearance
  - Design token application tests for logo styling
- **Human Verification Items**:
  - Visually verify logo appearance matches legacy footer implementation
  - Confirm logo positioning and alignment are consistent with legacy design
  - Validate logo maintains proper appearance across different viewport sizes

##### [T-4.2.1:ELE-4] Responsive layout: Implement responsive behavior for footer layout
- **Preparation Steps**:
  - [PREP-4] Extract responsive layout patterns for footer (implements ELE-4)
- **Implementation Steps**:
  - [IMP-4] Implement responsive styles for different screen sizes (implements ELE-4)
- **Validation Steps**:
  - [VAL-4] Test responsive behavior across all breakpoints (validates ELE-4)
- **Test Requirements**:
  - Verify responsive layout behavior matches legacy implementation across all breakpoints
  - Test that layout adjusts appropriately at each defined breakpoint
  - Validate proper reflow of content elements on smaller viewports
  - Ensure responsive transitions are smooth without layout shifts
- **Testing Deliverables**:
  - `FooterResponsive.test.tsx`: Tests for responsive layout behavior
  - `BreakpointBehavior.test.tsx`: Tests for specific breakpoint transitions
  - Visual comparison tests across defined viewport sizes
  - Layout shift measurements during responsive transitions
- **Human Verification Items**:
  - Test responsive behavior at each defined breakpoint
  - Verify content reflow behavior matches legacy implementation
  - Validate footer maintains proper appearance across various device sizes

#### T-4.2.2: Footer Link Groups

- **Parent Task**: T-4.2.0
- **Implementation Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\components\layout\Footer\LinkGroups.tsx`
- **Patterns**: P002-SERVER-COMPONENT, P011-ATOMIC-COMPONENT
- **Dependencies**: T-4.2.1
- **Estimated Human Testing Hours**: 4-6 hours
- **Description**: Implement footer link groups with proper organization and semantic structure

#### Test Coverage Requirements
- **Test Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\test\unit-tests\task-4-2\T-4.2.2\`
- **Testing Tools**: Jest, TypeScript, React Testing Library, Axe, Storybook
- **Coverage Target**: 90% code coverage

#### Acceptance Criteria
- Link groups are organized according to the legacy design
- Footer sections match the organization of the legacy design
- Link groups have proper semantic structure for screen readers
- Link behavior and styling match legacy implementation
- Link groups maintain proper organization across breakpoints

#### Element Test Mapping

##### [T-4.2.2:ELE-1] Link group component: Create reusable link group component with heading
- **Preparation Steps**:
  - [PREP-1] Analyze link group structure in legacy footer (implements ELE-1)
- **Implementation Steps**:
  - [IMP-1] Create reusable link group component (implements ELE-1)
- **Validation Steps**:
  - [VAL-1] Verify link group structure and organization (validates ELE-1)
- **Test Requirements**:
  - Verify link group component properly implements heading and list structure
  - Test component accepts and renders dynamic link data correctly
  - Validate component produces semantic HTML compatible with screen readers
  - Ensure component is reusable across different link group instances
- **Testing Deliverables**:
  - `LinkGroup.test.tsx`: Tests for component structure and props handling
  - `LinkGroupSemantics.test.tsx`: Tests for semantic HTML structure
  - Component reusability tests with different data configurations
  - Screen reader compatibility tests for link group structure
- **Human Verification Items**:
  - Verify link group visual structure matches legacy implementation
  - Confirm proper heading hierarchy is maintained
  - Validate that screen readers properly announce link group structure

##### [T-4.2.2:ELE-2] Link styling: Implement link styling matching legacy design
- **Preparation Steps**:
  - [PREP-2] Extract link styling patterns (implements ELE-2)
- **Implementation Steps**:
  - [IMP-2] Implement link styling with proper hover states (implements ELE-2)
- **Validation Steps**:
  - [VAL-2] Test link styling and hover states (validates ELE-2)
- **Test Requirements**:
  - Verify link styling matches legacy design for typography, colors, and spacing
  - Test hover, focus, and active states match legacy implementation
  - Validate design tokens are properly applied for consistent styling
  - Ensure links maintain proper styling with varying text lengths
- **Testing Deliverables**:
  - `LinkStyling.test.tsx`: Tests for base link styling
  - `LinkStates.test.tsx`: Tests for interactive states (hover, focus, active)
  - Visual regression tests comparing to legacy styling
  - Design token application tests for link styling
- **Human Verification Items**:
  - Visually verify link styling matches legacy implementation
  - Confirm hover/focus states match legacy behavior
  - Validate color contrast meets accessibility requirements

##### [T-4.2.2:ELE-3] Semantic structure: Ensure proper semantic HTML for accessibility
- **Preparation Steps**:
  - [PREP-3] Study semantic HTML structure for accessibility (implements ELE-3)
- **Implementation Steps**:
  - [IMP-3] Add semantic HTML structure for accessibility (implements ELE-3)
- **Validation Steps**:
  - [VAL-3] Confirm semantic HTML improves accessibility (validates ELE-3)
- **Test Requirements**:
  - Verify link groups use proper heading hierarchy (h2, h3, etc.)
  - Test navigation regions have appropriate ARIA landmarks
  - Validate list structures use proper semantic HTML (ul, li)
  - Ensure links have proper focus management for keyboard navigation
- **Testing Deliverables**:
  - `SemanticStructure.test.tsx`: Tests for proper HTML semantics
  - `HeadingHierarchy.test.tsx`: Tests for correct heading structure
  - Accessibility tests using Axe for WCAG compliance
  - Keyboard navigation tests through link groups
- **Human Verification Items**:
  - Inspect DOM structure using browser dev tools to verify semantics
  - Test navigation with screen reader to verify proper announcements
  - Validate keyboard navigation through link groups works as expected

##### [T-4.2.2:ELE-4] Responsive behavior: Implement responsive adjustments for link groups
- **Preparation Steps**:
  - [PREP-4] Identify responsive behavior patterns for link groups (implements ELE-4)
- **Implementation Steps**:
  - [IMP-4] Implement responsive styles for link groups (implements ELE-4)
- **Validation Steps**:
  - [VAL-4] Test responsive behavior of link groups (validates ELE-4)
- **Test Requirements**:
  - Verify link groups adjust layout appropriately at different breakpoints
  - Test column arrangement changes match legacy implementation
  - Validate spacing adjustments are applied correctly at each breakpoint
  - Ensure consistent appearance across different viewport sizes
- **Testing Deliverables**:
  - `LinkGroupResponsive.test.tsx`: Tests for responsive behavior
  - `ColumnArrangement.test.tsx`: Tests for column layout changes
  - Visual comparison tests at defined breakpoints
  - Storybook stories demonstrating responsive behavior
- **Human Verification Items**:
  - Test link group layout at each defined breakpoint
  - Verify column arrangement matches legacy implementation at each size
  - Validate link groups maintain proper alignment and spacing when reflowed

#### T-4.2.3: Newsletter Form Implementation

- **Parent Task**: T-4.2.0
- **Implementation Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\components\layout\Footer\NewsletterForm.tsx`
- **Patterns**: P003-CLIENT-COMPONENT, P015-FORM-COMPONENT, P023-FORM-HANDLING
- **Dependencies**: T-4.2.1
- **Estimated Human Testing Hours**: 8-10 hours
- **Description**: Implement newsletter subscription form with validation and submission handling

#### Test Coverage Requirements
- **Test Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\test\unit-tests\task-4-2\T-4.2.3\`
- **Testing Tools**: Jest, TypeScript, React Testing Library, MSW, Playwright, Axe
- **Coverage Target**: 90% code coverage

#### Acceptance Criteria
- Newsletter form functionality is fully implemented
- Newsletter form styling matches the legacy design
- Form provides proper validation feedback to users
- Form handles submission states correctly (loading, success, error)
- Form is accessible and meets WCAG 2.1 AA requirements

#### Element Test Mapping

##### [T-4.2.3:ELE-1] Client component wrapper: Create client-side component for newsletter form
- **Preparation Steps**:
  - [PREP-1] Study newsletter form component in legacy code (implements ELE-1)
- **Implementation Steps**:
  - [IMP-1] Create client component with form structure (implements ELE-1)
  - [IMP-5] Add accessibility attributes for form elements (implements ELE-1)
- **Validation Steps**:
  - [VAL-4] Check form accessibility (validates ELE-1)
- **Test Requirements**:
  - Verify component uses 'use client' directive and hydrates correctly
  - Test form structure matches legacy implementation with proper form elements
  - Validate accessibility attributes are correctly applied to form elements
  - Ensure form component integrates properly with server component parent
- **Testing Deliverables**:
  - `NewsletterForm.client.test.tsx`: Tests for client component setup
  - `FormStructure.test.tsx`: Tests for form element hierarchy
  - Accessibility tests for form element attributes
  - Hydration tests for client component behavior
- **Human Verification Items**:
  - Verify form structure visually matches legacy implementation
  - Confirm form is properly announced by screen readers
  - Validate form maintains proper appearance with JavaScript disabled

##### [T-4.2.3:ELE-2] Form styling: Implement newsletter form styling matching legacy design
- **Preparation Steps**:
  - [PREP-2] Extract form styling patterns (implements ELE-2)
- **Implementation Steps**:
  - [IMP-2] Implement form styling matching legacy design (implements ELE-2)
- **Validation Steps**:
  - [VAL-1] Test form appearance and styling (validates ELE-2)
- **Test Requirements**:
  - Verify form styling matches legacy design for inputs, buttons, and layout
  - Test input field styling for default, focus, and filled states
  - Validate proper application of design tokens for consistent styling
  - Ensure form styling is responsive across different viewport sizes
- **Testing Deliverables**:
  - `FormStyling.test.tsx`: Tests for form visual styling
  - `InputStates.test.tsx`: Tests for input field states and styling
  - Visual regression tests comparing to legacy styling
  - Responsive styling tests across breakpoints
- **Human Verification Items**:
  - Visually verify form styling matches legacy implementation
  - Confirm input field states (focus, hover) match legacy behavior
  - Validate button styling and hover states match legacy implementation

##### [T-4.2.3:ELE-3] Form validation: Add client-side validation for newsletter form
- **Preparation Steps**:
  - [PREP-3] Analyze form validation logic (implements ELE-3)
- **Implementation Steps**:
  - [IMP-3] Add form validation with error messages (implements ELE-3)
- **Validation Steps**:
  - [VAL-2] Verify form validation behavior (validates ELE-3)
- **Test Requirements**:
  - Verify email validation logic correctly identifies valid/invalid inputs
  - Test error message display matches legacy implementation
  - Validate form prevents submission with invalid data
  - Ensure validation provides appropriate visual and screen reader feedback
- **Testing Deliverables**:
  - `FormValidation.test.tsx`: Tests for validation logic
  - `ErrorDisplay.test.tsx`: Tests for error message handling
  - Unit tests for email validation with various test cases
  - Accessibility tests for error announcement
- **Human Verification Items**:
  - Test form validation with various valid and invalid inputs
  - Verify error messages are clearly visible and match legacy styling
  - Validate screen readers properly announce validation errors

##### [T-4.2.3:ELE-4] Form submission: Implement form submission handling with loading state
- **Preparation Steps**:
  - [PREP-4] Study form submission handling (implements ELE-4)
- **Implementation Steps**:
  - [IMP-4] Implement form submission with loading state (implements ELE-4)
- **Validation Steps**:
  - [VAL-3] Test form submission flow (validates ELE-4)
- **Test Requirements**:
  - Verify form submission correctly handles API requests
  - Test loading state visualization during submission
  - Validate success and error state handling after submission
  - Ensure form resets appropriately after successful submission
- **Testing Deliverables**:
  - `FormSubmission.test.tsx`: Tests for submission handling
  - `LoadingState.test.tsx`: Tests for loading indicator
  - Mock API response tests using MSW for success/error paths
  - End-to-end submission tests with Playwright
- **Human Verification Items**:
  - Test complete form submission flow with actual API endpoints
  - Verify loading indicators provide appropriate feedback during submission
  - Validate success/error messages match legacy implementation style

#### T-4.2.4: Social Media and Copyright Section

- **Parent Task**: T-4.2.0
- **Implementation Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\aplio-modern-1\components\layout\Footer\SocialLinks.tsx`
- **Patterns**: P002-SERVER-COMPONENT, P011-ATOMIC-COMPONENT
- **Dependencies**: T-4.2.1
- **Estimated Human Testing Hours**: 4-6 hours
- **Description**: Implement social media links and copyright information

#### Test Coverage Requirements
- **Test Location**: `C:\Users\james\Master\BrightHub\Build\APSD-runs\aplio-27-a1-c\pmc\system\test\unit-tests\task-4-2\T-4.2.4\`
- **Testing Tools**: Jest, TypeScript, React Testing Library, Axe, Storybook
- **Coverage Target**: 90% code coverage

#### Acceptance Criteria
- Social media links are implemented with correct icons
- Social media icon styling matches the legacy design
- Copyright information is correctly displayed
- Component meets WCAG 2.1 AA accessibility requirements
- Layout adjusts appropriately across breakpoints

#### Element Test Mapping

##### [T-4.2.4:ELE-1] Social media links: Create social media link components with icons
- **Preparation Steps**:
  - [PREP-1] Study social media links implementation in legacy footer (implements ELE-1)
- **Implementation Steps**:
  - [IMP-1] Create social media link components (implements ELE-1)
- **Validation Steps**:
  - [VAL-1] Verify social link appearance and behavior (validates ELE-1, ELE-2)
  - [VAL-4] Check accessibility of social links (validates ELE-1)
- **Test Requirements**:
  - Verify social media links use correct icons matching legacy implementation
  - Test that links have proper href attributes pointing to correct destinations
  - Validate links have appropriate accessibility attributes (aria-label, title)
  - Ensure links open in new tabs with appropriate security attributes
- **Testing Deliverables**:
  - `SocialLinks.test.tsx`: Tests for social link structure and attributes
  - `SocialLinkA11y.test.tsx`: Accessibility tests for social links
  - Icon rendering tests for correct visual representation
  - External link handling tests for security attributes
- **Human Verification Items**:
  - Verify social icons visually match legacy implementation
  - Confirm links open in new tabs with appropriate destinations
  - Validate proper visual indication for interactive social links

##### [T-4.2.4:ELE-2] Icon styling: Implement social media icon styling matching legacy design
- **Preparation Steps**:
  - [PREP-2] Extract icon styling patterns (implements ELE-2)
- **Implementation Steps**:
  - [IMP-2] Implement icon styling with hover effects (implements ELE-2)
- **Validation Steps**:
  - [VAL-1] Verify social link appearance and behavior (validates ELE-1, ELE-2)
- **Test Requirements**:
  - Verify icon styling matches legacy design for size, color, and spacing
  - Test hover effect transitions match legacy implementation timing and easing
  - Validate icons maintain proper styling across different viewport sizes
  - Ensure icon states (normal, hover, focus) have sufficient contrast
- **Testing Deliverables**:
  - `IconStyling.test.tsx`: Tests for base icon styling
  - `IconHoverEffects.test.tsx`: Tests for hover/focus animations
  - Visual regression tests comparing to legacy styling
  - Responsive tests for icon appearance across breakpoints
- **Human Verification Items**:
  - Visually verify icon styling matches legacy implementation
  - Confirm hover animations feel smooth and match legacy behavior
  - Validate icons maintain proper appearance at different zoom levels

##### [T-4.2.4:ELE-3] Copyright section: Add copyright information with proper styling
- **Preparation Steps**:
  - [PREP-3] Analyze copyright section implementation (implements ELE-3)
- **Implementation Steps**:
  - [IMP-3] Add copyright section with dynamic year (implements ELE-3)
- **Validation Steps**:
  - [VAL-2] Confirm copyright information is correctly displayed (validates ELE-3)
- **Test Requirements**:
  - Verify copyright text content matches legacy implementation format
  - Test dynamic year calculation returns the current year correctly
  - Validate styling matches legacy implementation for typography and spacing
  - Ensure proper semantic structure for copyright text
- **Testing Deliverables**:
  - `Copyright.test.tsx`: Tests for copyright text content and rendering
  - `DynamicYear.test.tsx`: Tests for year calculation logic
  - Visual comparison tests against legacy implementation
  - Typography styling tests for text appearance
- **Human Verification Items**:
  - Verify copyright text content and format match legacy implementation
  - Confirm copyright uses current year correctly
  - Validate styling and positioning match legacy implementation

##### [T-4.2.4:ELE-4] Responsive layout: Implement responsive behavior for social links and copyright
- **Preparation Steps**:
  - [PREP-4] Extract responsive behavior patterns (implements ELE-4)
- **Implementation Steps**:
  - [IMP-4] Implement responsive styles for different screen sizes (implements ELE-4)
- **Validation Steps**:
  - [VAL-3] Test responsive behavior across breakpoints (validates ELE-4)
- **Test Requirements**:
  - Verify responsive layout for social links and copyright matches legacy implementation
  - Test alignment and spacing adjustments occur at appropriate breakpoints
  - Validate proper stacking/reordering of elements on smaller viewports
  - Ensure touch targets for social links maintain minimum size on mobile devices
- **Testing Deliverables**:
  - `SocialResponsive.test.tsx`: Tests for responsive behavior
  - `SocialTouchTargets.test.tsx`: Tests for mobile-friendly touch targets
  - Visual regression tests at defined breakpoints
  - Layout validation tests for proper alignment across viewports
- **Human Verification Items**:
  - Test responsive behavior at all defined breakpoints
  - Verify layout adjustments match legacy implementation
  - Validate social icons maintain proper touch target size on mobile devices

