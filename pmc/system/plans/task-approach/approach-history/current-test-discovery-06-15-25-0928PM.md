# T-2.1.5 Design Token Testing Discovery

## Testable Elements Classification

### Shadow System Design Tokens
- **shadows**: Shadow scale with Tailwind defaults + Aplio custom values (nav, icon, box)
- **dropShadows**: Drop shadow scale for filter effects with legacy values  
- **elevations**: Semantic shadow mapping (none, subtle, low, medium, high, extreme)

### Border System Design Tokens  
- **borderColors**: Border color definitions from legacy system (#EDF0E6, #373935)
- **borderWidths**: Standard border width scale (0px, 1px, 2px, 4px, 8px)
- **borderStyles**: CSS border style definitions (solid, dashed, dotted, etc.)

### TypeScript Interface Definitions
- **ShadowScale**: Shadow definitions with elevation levels interface
- **DropShadowScale**: Drop shadow definitions for filters interface
- **BorderColorScale**: Border color definitions interface
- **BorderWidthScale**: Border width scale interface
- **BorderStyleScale**: Border style definitions interface
- **ElevationScale**: Semantic shadow mapping interface
- **EffectsSystem**: Complete effects system combining all tokens

### Utility Functions (Type-Safe Access)
- **getShadow()**: Get shadow by key with type safety
- **getDropShadow()**: Get drop shadow by key with type safety
- **getBorderColor()**: Get border color by key with type safety
- **getBorderWidth()**: Get border width by key with type safety
- **getBorderStyle()**: Get border style by key with type safety
- **getElevation()**: Get elevation shadow by semantic level
- **createShadow()**: Create custom shadow with parameters
- **generateBorderCSS()**: Generate complete border CSS from components
- **generateEffectsCSSVars()**: Generate CSS custom properties
- **getNavShadow()**: Get themed shadow for navigation components
- **getCardShadow()**: Get themed shadow for card components
- **getIconShadow()**: Get themed shadow for icon elements

### Legacy Fidelity Testing Requirements
- **Shadow Values**: Validate exact preservation of legacy shadow values from tailwind.config.js
- **Border Colors**: Validate exact preservation of border colors (#EDF0E6, #373935)
- **'as const' Assertions**: Validate TypeScript 'as const' assertions for tree-shaking
- **Interface Compliance**: Validate all exported values match interface definitions

### Testing Priority Classification
- **High Priority**: Shadow and border value accuracy, utility function behavior, TypeScript compilation
- **Medium Priority**: Interface compliance, 'as const' assertions, CSS generation functions
- **Low Priority**: Helper functions (getNavShadow, getCardShadow, getIconShadow)

## Testing Approach Summary
Design token testing requires Jest unit testing with dynamic imports following T-2.1.4 pattern:
- Use `await import('../../../../styles/design-tokens/effects')` to avoid TypeScript compilation issues
- Test exact value preservation against legacy sources (tailwind.config.js)
- Validate TypeScript interface compliance and utility function behavior
- Ensure 'as const' assertions work correctly for tree-shaking optimization
- No component rendering, visual testing, or LLM Vision analysis required

## Reference Implementation Pattern
Follow T-2.1.4 animations.ts testing pattern exactly:
- Location: `test/unit-tests/task-2-1.4/T-2.1.4/animations-basic.test.ts`
- Pattern: Jest with dynamic imports, nested describe blocks by element
- Focus: Interface validation, utility function testing, value accuracy 