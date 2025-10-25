# Task Approach for T-2.1.5: Shadow and Border System Extraction

## Task ID
T-2.1.5

## Overview
I will extract shadow elevations and border styles from the legacy Aplio tailwind.config.js into TypeScript design tokens following the proven T-2.1.4 animations.ts pattern. This involves creating a comprehensive effects.ts file with type-safe shadow and border tokens that preserve exact legacy visual fidelity while implementing modern TypeScript interfaces.

## Implementation Strategy

1. **Extract Shadow System Definitions (ELE-1)**
   - Analyze tailwind.config.js lines 54-58 to extract dropShadow and boxShadow definitions
   - Extract nav shadow: '0px 0px 30px rgba(0, 0, 0, 0.05)' and icon shadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.07)'
   - Extract box shadow: '0px 5px 50px 0px rgba(0, 0, 0, 0.07)' for elevation systems
   - Create TypeScript shadow interfaces following animations.ts pattern with ShadowScale and ShadowDefinitions
   - Map shadow tokens to elevation levels (low, medium, high) with semantic naming

2. **Document Border System (ELE-2)**
   - Extract border radius values from tailwind.config.js lines 59-63: large (40px), medium (20px), DEFAULT (12px)
   - Analyze tailwind.config.js border color definitions: DEFAULT '#EDF0E6', dark '#373935'
   - Create border width scale based on Tailwind standards and any custom values
   - Implement BorderRadius, BorderWidth, and BorderColor interfaces following animations.ts structure
   - Document border style patterns (solid, dashed, dotted) used in legacy system

3. **Create TypeScript Interface System (ELE-3)**
   - Follow animations.ts interface pattern for EffectsSystem combining shadows and borders
   - Create ShadowToken, BorderToken, and EffectsSystem interfaces with proper typing
   - Implement type-safe exports with 'as const' assertions for tree-shaking optimization
   - Add utility functions: getShadow(), getBorderRadius(), getBorderColor(), generateEffectsCSS()
   - Structure interfaces to match animations.ts pattern for consistency across design token system

4. **Implement Visual Fidelity Validation**
   - Compare extracted shadow values against legacy visual output to ensure exact match
   - Validate border radius measurements match legacy component rendering
   - Test shadow elevation system maintains proper visual hierarchy from legacy
   - Ensure border color values preserve exact legacy color specifications

5. **Create Utility Functions and Exports**
   - Implement getShadow(), getBorderRadius(), getBorderColor() functions following animations.ts pattern
   - Add generateEffectsCSS() for dynamic CSS generation
   - Create semantic shadow helpers: getElevation(), getCardShadow(), getNavShadow()
   - Ensure Next.js 14 optimization with proper tree-shaking support

## Key Considerations

- **Legacy Fidelity**: Exact shadow and border value preservation required - all measurements and colors must match legacy exactly
- **TypeScript Safety**: Use 'as const' assertions and proper interface definitions following T-2.1.4 proven success pattern
- **Pattern Consistency**: Follow animations.ts structure for exports, interfaces, and utility functions to maintain design system coherence
- **Performance**: Optimize effects tokens for reduced bundle size and runtime performance in Next.js 14
- **Testing Adaptation**: Structure tokens for Jest validation testing using proven design token testing protocol from T-2.1.4

## Confidence Level
9/10 - Very high confidence based on successful T-2.1.4 implementation providing exact TypeScript design token pattern template. Shadow and border system is clearly defined in tailwind.config.js with precise extraction points. Strong foundation from T-2.1.4 testing protocol success and comprehensive context documentation.