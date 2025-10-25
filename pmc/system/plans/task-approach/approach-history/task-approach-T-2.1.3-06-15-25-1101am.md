# Task Approach for T-2.1.3: Spacing and Layout System Extraction

## Task ID
T-2.1.3

## Overview
I will extract and convert the legacy spacing system into TypeScript design tokens following the successful T-2.1.2 typography pattern. This involves creating a comprehensive spacing.ts file with type-safe tokens extracted from Tailwind config and SCSS files, maintaining 100% legacy fidelity while implementing modern TypeScript interfaces and utility functions.

## Implementation Strategy

1. **Extract Base Spacing Scale (ELE-1)**
   - Analyze custom spacing values from tailwind.config.js lines 68-72 (15: '60px', 25: '100px', 150: '150px')
   - Create TypeScript spacing scale interfaces following typography.ts pattern
   - Implement base spacing scale with consistent units and scaling factors
   - Add Tailwind default spacing values where applicable

2. **Document Component Spacing Patterns (ELE-2)**
   - Extract component-specific spacing from _common.scss lines 26-101
   - Identify spacing patterns for mobile-menu, section-tagline, faq-items, modals
   - Create component spacing token definitions with semantic names
   - Document margin, padding, and gap patterns used across components

3. **Define Layout Spacing Utilities (ELE-3)**
   - Extract container configuration from tailwind.config.js lines 18-23 (container.center: true)
   - Document screen breakpoints (xs: '475px', 1xl: '1400px') for responsive spacing
   - Create layout-specific spacing utilities for containers and grid systems
   - Implement responsive spacing patterns based on breakpoint system

4. **Create TypeScript Type System (ELE-4)**
   - Follow typography.ts interface pattern for spacing tokens
   - Create SpacingToken, SpacingScale, ComponentSpacing interfaces
   - Implement type-safe exports with 'as const' assertions
   - Add utility functions for spacing calculations and CSS generation

5. **Implement Utility Functions**
   - Create getSpacing(), getComponentSpacing(), generateSpacingCSS() functions
   - Add responsive spacing helpers similar to typography system
   - Ensure Next.js 14 optimization with tree-shaking support

## Key Considerations

- **Legacy Fidelity**: Exact value preservation required - all spacing values must match legacy exactly (60px, 100px, 150px custom values)
- **TypeScript Safety**: Use 'as const' assertions and proper interface definitions following T-2.1.2 successful pattern
- **Pattern Consistency**: Follow typography.ts structure for exports, interfaces, and utility functions to maintain system coherence
- **Component Integration**: Ensure spacing tokens work seamlessly with Next.js 14 components and responsive design requirements
- **Testing Compatibility**: Structure tokens for Jest validation testing similar to T-2.1.2 comprehensive test approach

## Confidence Level
8/10 - High confidence based on successful T-2.1.2 implementation providing proven pattern and methodology. Legacy spacing system is well-defined with clear extraction points. Potential complexity in component spacing pattern documentation may require iterative refinement.