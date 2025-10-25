# Implementation Directive for Aplio Design System Modernization

## Phase 1: Design System Extraction

### 1.1 Design Token Extraction
Direct the AI coding agent to:
1. Create a comprehensive design token mapping by inspecting the visual properties at https://js-aplio-6.vercel.app/home-4 and other referenced pages
2. Document all:
   - Color values and their contextual usage
   - Typography scales and font treatments
   - Spacing patterns and layout measurements
   - Animation timings and easing functions
   - Breakpoint definitions and responsive behaviors
3. Generate a type-safe design token configuration that will serve as the foundation for the modern implementation

### 1.2 Component Visual Mapping
Direct the AI coding agent to:
1. Create a component catalog that maps each visual element from the reference pages
2. For each component, document:
   - Visual characteristics without reference to implementation
   - Interactive behaviors and animations
   - Responsive design requirements
   - Accessibility requirements
3. Create a visual reference document that can be used during implementation without referencing legacy code

## Phase 2: Modern Foundation Creation

### 2.1 Directory Structure Implementation
Direct the AI coding agent to:
1. Create the core directory structure in aplio-modern-1 following Next.js 14 best practices:
```
aplio-modern-1/
├── app/                 # Next.js 14 App Router structure
├── components/          # Shared components
├── lib/                 # Utilities and configurations
└── styles/             # Global styles and design tokens
```

2. Initialize each directory with appropriate configuration files:
   - TypeScript configuration
   - Next.js configuration
   - Tailwind configuration
   - Design token integration

### 2.2 Component Architecture Setup
Direct the AI coding agent to:
1. Create typed component templates for each identified component type
2. Establish clear server/client component boundaries
3. Set up shared utilities and hooks
4. Create type definitions for all component props and states

## Phase 3: Modern Implementation

### 3.1 Component Development
Direct the AI coding agent to:
1. Implement each component using modern Next.js 14 patterns:
   - Start with server components by default
   - Create client components only when required for interactivity
   - Use TypeScript with strict mode
   - Implement design tokens for all visual properties

2. Follow this process for each component:
   - Reference visual design from the component catalog
   - Implement using modern patterns without referencing legacy code
   - Validate visual and functional parity against reference URLs
   - Document any deviations or improvements

### 3.2 Page Assembly
Direct the AI coding agent to:
1. Assemble pages using the newly created components
2. Implement page-specific logic using Next.js 14 patterns
3. Validate complete page functionality against reference URLs

## Quality Gates

### Visual Validation
Direct the AI coding agent to verify:
1. Exact visual match with reference pages
2. Correct implementation of animations and interactions
3. Responsive behavior across breakpoints
4. Accessibility compliance

### Technical Validation
Direct the AI coding agent to verify:
1. TypeScript strict mode compliance
2. Server component usage where appropriate
3. Client component boundaries are minimal and justified
4. Performance metrics meet or exceed targets

## Success Criteria
The implementation is complete when:
1. All pages visually and functionally match their reference URLs
2. Code uses modern Next.js 14 patterns exclusively
3. TypeScript coverage is 100%
4. All components are reusable and properly typed
5. Performance metrics meet specified targets

This directive provides clear boundaries for the AI coding agent while ensuring the modern implementation maintains visual parity with the reference design.

Would you like me to expand on any part of this directive or add additional specifics to any section?