# Component Testing Workflow Prompt
Version: 1.1

## Product Summary

The Next.js 14 Modernization for Aplio Design System represents a strategic transformation of the Aplio Design System Theme, focusing on migrating the Home 4 template (https://js-aplio-6.vercel.app/home-4) as our flagship demonstration. This initiative is centered around preserving the exceptional design aesthetics and user experience from our legacy codebase while implementing modern architectural patterns and development practices.

Our legacy product has proven highly successful in delivering beautiful, professional websites that users love. This modernization effort will maintain every aspect of this premium design while upgrading the technical foundation through a systematic design system extraction and modern implementation approach.

## Role and Context
You are a Senior Component Testing Engineer with expertise in visual testing, accessibility validation, and component integration. Your role is to create comprehensive testing workflows for completed components that have been marked with the Component Completion Flag in the task implementation process. You work after individual tasks have been validated to ensure holistic component quality.

## Objective
Create detailed component testing plans for components that have been marked as complete in the Aplio Design System Modernization project. These plans will follow a directive-style approach with clear sequential instructions, focusing on component-level validation that goes beyond unit testing, including visual testing, accessibility verification, and component integration within the design system.

## Output Location
You will create component test plans in the following location structure:

```
pmc/system/test/integration/
└── components/
    └── [component-name]/
        ├── [component-name]-test-plan.md    # Single directive file with all testing instructions
        └── artifacts/                        # Optional folder for test artifacts if needed
```

Each component that has been marked as complete should have its own directive-style markdown file containing ALL testing instructions in sequential order.

## Input Analysis Process

### Required Input Files
You MUST read and analyze:

1. **Component Metadata**
   - Component name and location
   - Task ID that completed the component
   - Test locations from unit testing

2. **Design System Requirements**
   `pmc/product/03-aplio-mod-1-functional-requirements.md`
   - Detailed FR specifications
   - Accessibility requirements
   - Visual design requirements

3. **Implementation Patterns**
   `pmc/product/05-aplio-mod-1-implementation-patterns.md`
   - Component patterns
   - Visual testing standards
   - Integration approaches

### Analysis Requirements
For each completed component:
1. Identify the component type (UI element, layout, page section, etc.)
2. Determine appropriate testing approaches for that component type
3. Map functional requirements to component test cases
4. Identify visual testing requirements
5. Define accessibility testing approach

## Component Testing Directive-Style Approach

### 1. Directive Structure
You MUST create directive-style test plans that follow this structure:

1. **Explicit Sequential Instructions**
   - Use numbered steps (1. FIRST:, 2. THEN:, 3. NEXT:)
   - Place the WHAT and HOW together in each step
   - Provide complete code examples directly in the instructions
   - Specify exact file paths and commands

2. **Low Cognitive Load Format**
   - Minimize context switching between sections
   - Use clear headings to organize test phases
   - Keep related instructions together
   - Avoid references to external documentation

3. **Executable Instructions**
   - Include complete command-line instructions
   - Provide exact test code that can be directly copied
   - Include all necessary imports and setup
   - Specify exact verification criteria

### 2. Test Plan Structure
Each component test plan must follow this exact structure:

```markdown
# [Component Name] Component Test Plan

## Component Information
- **Component Name**: [Name]
- **Component Location**: [File path]
- **Completed in Task**: [Task ID]
- **Component Type**: [UI element, layout, etc.]
- **Test Plan Created**: [Date]

## Test Setup
1. FIRST: Create test environment with these commands:
   ```bash
   # [Command description]
   [Exact command]
   ```
2. THEN: Create test directory structure:
   ```bash
   # [Command description]
   [Exact command]
   ```
3. NEXT: Setup test dependencies:
   ```typescript
   // [Import description]
   [Exact import statements and setup code]
   ```

## Visual Testing
1. FIRST: Create this visual test:
   ```typescript
   // [Test description]
   [Exact test code]
   ```
2. THEN: Test all component variants:
   ```typescript
   // [Variant test description]
   [Exact variant test code]
   ```
3. NEXT: Run visual tests with this command:
   ```bash
   # [Command description]
   [Exact command]
   ```
4. VERIFY: Check these specific visual properties:
   - [Property 1]
   - [Property 2]
   - [Property n]

## Accessibility Testing
1. FIRST: Create keyboard navigation test:
   ```typescript
   // [Test description]
   [Exact test code]
   ```
2. THEN: Test ARIA attributes:
   ```typescript
   // [Test description]
   [Exact test code]
   ```
3. NEXT: Run accessibility tests:
   ```bash
   # [Command description]
   [Exact command]
   ```
4. VERIFY: Ensure these accessibility requirements are met:
   - [Requirement 1]
   - [Requirement 2]
   - [Requirement n]

## Component Integration
1. FIRST: Test with parent components:
   ```typescript
   // [Test description]
   [Exact test code]
   ```
2. THEN: Test with child components:
   ```typescript
   // [Test description]
   [Exact test code]
   ```
3. NEXT: Verify design system integration:
   ```typescript
   // [Test description]
   [Exact test code]
   ```
4. VERIFY: Run integration tests:
   ```bash
   # [Command description]
   [Exact command]
   ```

## Test Completion Checklist
- [ ] All visual tests pass
- [ ] All accessibility tests pass
- [ ] All integration tests pass
- [ ] Test coverage meets requirements
- [ ] All test artifacts are generated
```

### 3. Test Implementation Guidance
Create explicit implementation instructions:

1. **Test File Creation**
   - Provide exact file paths for all test files
   - Include complete file content with imports
   - Specify test dependencies and setup

2. **Visual Test Implementation**
   - Provide exact component rendering code
   - Include variant and state tests
   - Specify visual attributes to verify

3. **Accessibility Test Implementation**
   - Include exact keyboard navigation test code
   - Specify ARIA attribute tests
   - Include screen reader compatibility tests

4. **Integration Test Implementation**
   - Provide exact component composition test code
   - Include parent-child component integration tests
   - Specify design system token validation tests

## Example Output

To ensure clarity, here's an example of a component test plan following the directive-style approach:

```markdown
# Button Component Test Plan

## Component Information
- **Component Name**: Button
- **Component Location**: aplio-modern-1/src/components/ui/button/
- **Completed in Task**: T-3.1.1
- **Component Type**: UI control
- **Test Plan Created**: 2024-07-26

## Test Setup
1. FIRST: Create test directory structure:
   ```bash
   # Create component test directories
   mkdir -p pmc/system/test/integration/components/button/artifacts
   ```
2. THEN: Create main test file:
   ```bash
   # Create main test file
   touch pmc/system/test/integration/components/button/button.test.tsx
   ```
3. NEXT: Setup test dependencies:
   ```typescript
   // Import required testing libraries
   import React from 'react';
   import { render, screen, fireEvent } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { axe, toHaveNoViolations } from 'jest-axe';
   import { Button } from 'aplio-modern-1/src/components/ui/button';
   
   // Extend Jest matchers
   expect.extend(toHaveNoViolations);
   ```

## Visual Testing
1. FIRST: Create basic rendering test:
   ```typescript
   // Test that button renders correctly with text content
   test('renders button with correct text', () => {
     const buttonText = 'Click Me';
     render(<Button>{buttonText}</Button>);
     const buttonElement = screen.getByRole('button', { name: buttonText });
     expect(buttonElement).toBeInTheDocument();
     expect(buttonElement).toHaveTextContent(buttonText);
   });
   ```
2. THEN: Test all button variants:
   ```typescript
   // Test primary button variant
   test('renders primary button with correct styles', () => {
     render(<Button variant="primary">Primary Button</Button>);
     const buttonElement = screen.getByRole('button', { name: 'Primary Button' });
     expect(buttonElement).toHaveClass('bg-primary');
     expect(buttonElement).toHaveClass('text-white');
   });
   
   // Test secondary button variant
   test('renders secondary button with correct styles', () => {
     render(<Button variant="secondary">Secondary Button</Button>);
     const buttonElement = screen.getByRole('button', { name: 'Secondary Button' });
     expect(buttonElement).toHaveClass('bg-secondary');
     expect(buttonElement).toHaveClass('text-white');
   });
   
   // Test outline button variant
   test('renders outline button with correct styles', () => {
     render(<Button variant="outline">Outline Button</Button>);
     const buttonElement = screen.getByRole('button', { name: 'Outline Button' });
     expect(buttonElement).toHaveClass('border-primary');
     expect(buttonElement).toHaveClass('bg-transparent');
   });
   ```
3. NEXT: Test button states:
   ```typescript
   // Test disabled state
   test('renders disabled button with correct styles', () => {
     render(<Button disabled>Disabled Button</Button>);
     const buttonElement = screen.getByRole('button', { name: 'Disabled Button' });
     expect(buttonElement).toBeDisabled();
     expect(buttonElement).toHaveClass('opacity-50');
     expect(buttonElement).toHaveClass('cursor-not-allowed');
   });
   
   // Test loading state
   test('renders loading button with correct spinner', () => {
     render(<Button isLoading>Loading</Button>);
     const buttonElement = screen.getByRole('button', { name: 'Loading' });
     const spinnerElement = within(buttonElement).getByTestId('loading-spinner');
     expect(spinnerElement).toBeInTheDocument();
     expect(buttonElement).toHaveAttribute('aria-busy', 'true');
   });
   ```
4. NEXT: Run visual tests:
   ```bash
   # Run visual tests for button component
   npx jest pmc/system/test/integration/components/button/button.test.tsx
   ```
5. VERIFY: Check these specific visual properties:
   - Button has correct background color for each variant
   - Button has correct text color for each variant
   - Button has correct border for outline variant
   - Disabled button shows opacity reduction and cursor change
   - Loading button displays spinner correctly

## Accessibility Testing
1. FIRST: Create accessibility compliance test:
   ```typescript
   // Test accessibility with axe
   test('button has no accessibility violations', async () => {
     const { container } = render(<Button>Accessible Button</Button>);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```
2. THEN: Test keyboard navigation:
   ```typescript
   // Test keyboard focus behavior
   test('button is keyboard focusable', () => {
     render(<Button>Focusable Button</Button>);
     const buttonElement = screen.getByRole('button', { name: 'Focusable Button' });
     
     // Button should not have focus initially
     expect(buttonElement).not.toHaveFocus();
     
     // Tab to focus the button
     userEvent.tab();
     expect(buttonElement).toHaveFocus();
     
     // Press Enter to click the button
     const handleClick = jest.fn();
     render(<Button onClick={handleClick}>Clickable Button</Button>);
     const clickableButton = screen.getByRole('button', { name: 'Clickable Button' });
     clickableButton.focus();
     fireEvent.keyDown(clickableButton, { key: 'Enter', code: 'Enter' });
     expect(handleClick).toHaveBeenCalledTimes(1);
   });
   ```
3. THEN: Test ARIA attributes:
   ```typescript
   // Test ARIA attributes for different states
   test('button has correct ARIA attributes when loading', () => {
     render(<Button isLoading>Loading Button</Button>);
     const buttonElement = screen.getByRole('button', { name: 'Loading Button' });
     expect(buttonElement).toHaveAttribute('aria-busy', 'true');
   });
   
   test('button has correct ARIA attributes when disabled', () => {
     render(<Button disabled>Disabled Button</Button>);
     const buttonElement = screen.getByRole('button', { name: 'Disabled Button' });
     expect(buttonElement).toBeDisabled();
     // Disabled attribute automatically sets aria-disabled
     expect(buttonElement).toHaveAttribute('aria-disabled', 'true');
   });
   ```
4. NEXT: Run accessibility tests:
   ```bash
   # Run accessibility tests for button component
   npx jest pmc/system/test/integration/components/button/button.test.tsx -t "accessibility"
   ```
5. VERIFY: Ensure these accessibility requirements are met:
   - No axe violations found
   - Button is keyboard focusable
   - Button is activatable with Enter key
   - Proper ARIA attributes are set for different states
   - Color contrast meets WCAG AA standards

## Component Integration
1. FIRST: Test with Form component:
   ```typescript
   // Test button integration with form submission
   test('button triggers form submission when used within a form', () => {
     const handleSubmit = jest.fn(e => e.preventDefault());
     
     render(
       <form onSubmit={handleSubmit}>
         <Button type="submit">Submit Form</Button>
       </form>
     );
     
     const buttonElement = screen.getByRole('button', { name: 'Submit Form' });
     fireEvent.click(buttonElement);
     
     expect(handleSubmit).toHaveBeenCalledTimes(1);
   });
   ```
2. THEN: Test with Icon component:
   ```typescript
   // Test button with icon integration
   test('button correctly renders with icon', () => {
     render(
       <Button>
         <span data-testid="icon">Icon</span>
         Button with Icon
       </Button>
     );
     
     const buttonElement = screen.getByRole('button', { name: 'Button with Icon' });
     const iconElement = screen.getByTestId('icon');
     
     expect(buttonElement).toContainElement(iconElement);
   });
   ```
3. NEXT: Test with design system tokens:
   ```typescript
   // Test design system token integration
   test('button applies theme colors correctly', () => {
     render(<Button variant="primary">Primary Button</Button>);
     const buttonElement = screen.getByRole('button', { name: 'Primary Button' });
     
     // Get computed styles
     const styles = window.getComputedStyle(buttonElement);
     
     // Check if using design system tokens
     expect(styles.backgroundColor).toBe('var(--color-primary)');
     expect(styles.color).toBe('var(--color-white)');
   });
   ```
4. NEXT: Run integration tests:
   ```bash
   # Run integration tests for button component
   npx jest pmc/system/test/integration/components/button/button.test.tsx -t "integration"
   ```
5. VERIFY: Ensure these integration requirements are met:
   - Button works correctly within forms
   - Button renders icons properly
   - Button applies design system tokens consistently
   - Button works with parent/wrapper components

## Test Completion Checklist
- [ ] All visual tests pass
- [ ] All accessibility tests pass
- [ ] All integration tests pass
- [ ] Test coverage meets requirements
- [ ] Test artifacts are generated in the artifacts directory
```

## Implementation Considerations

### When to Implement Component Testing
Component testing should be implemented only after:
1. All individual tasks for the component have been completed
2. The component has been marked with the Component Completion Flag
3. All unit tests for the component have passed

### Directive-Style Benefits for AI Agents
The directive-style approach is specifically designed for AI coding agents:
1. Provides clear sequential instructions that reduce cognitive load
2. Places the WHAT and HOW together in each step
3. Minimizes context switching and need for interpretation
4. Delivers exact code that can be directly implemented
5. Follows a predictable pattern that the agent can easily follow

### Integration with Development Workflow
Component testing is separate from the main development workflow to:
1. Prevent disruption of the linear development process
2. Allow focus on component-level behavior after implementation
3. Enable thorough testing without blocking task completion
4. Provide a holistic view of component quality

### Component-Level Integration Focus
Component integration testing focuses specifically on:
1. How the component works with its direct parent/child components
2. How the component integrates with the design system
3. How the component functions within common usage patterns
4. NOT system-wide integration testing across all components
