# Testable Elements Discovery - T-2.1.3

## Task Information
- **Task ID**: T-2.1.3  
- **Task Title**: Spacing and Layout System Extraction
- **Type**: Design Tokens (TypeScript)
- **Pattern**: P006-DESIGN-TOKENS
- **Implementation Location**: `aplio-modern-1/styles/design-tokens/spacing.ts`
- **Total Lines**: 410 lines
- **Testing Approach**: TypeScript compilation, token accuracy validation, utility function testing

## Testable Elements Discovery

### TypeScript Design Token Elements

#### **T-2.1.3:ELE-1** - Base Spacing Scale (`baseSpacing`)
- **Type**: Design Token Export (SpacingScale interface)
- **Description**: Base spacing scale with Tailwind defaults + Aplio custom values (15: '60px', 25: '100px', 150: '150px')
- **Location**: Lines 150-208
- **Testing Focus**: 
  - Value accuracy validation against legacy tailwind.config.js
  - Custom spacing values preservation (60px, 100px, 150px)
  - TypeScript type safety with 'as const' assertion
- **Legacy Source**: tailwind.config.js lines 68-72

#### **T-2.1.3:ELE-2** - Component Spacing Patterns (`componentSpacing`) 
- **Type**: Design Token Export (ComponentSpacing interface)
- **Description**: Component-specific spacing patterns extracted from legacy SCSS (_common.scss lines 26-101)
- **Location**: Lines 238-304
- **Testing Focus**:
  - SCSS pattern extraction accuracy validation
  - Component spacing values: mobileMenu, sectionTagline, faq, modal, singlePage, integrationSlider, stackCards
  - Nested object structure and property access
- **Legacy Source**: aplio-legacy/scss/_common.scss lines 26-101

#### **T-2.1.3:ELE-3** - Layout Spacing Utilities (`layoutSpacing`)
- **Type**: Design Token Export (LayoutSpacing interface) 
- **Description**: Layout utilities including container config and responsive breakpoints (xs: '475px', 1xl: '1400px')
- **Location**: Lines 310-340
- **Testing Focus**:
  - Container center configuration validation
  - Custom breakpoint system (xs: 475px, 1xl: 1400px)
  - Responsive layout integration compatibility
- **Legacy Source**: tailwind.config.js lines 18-23

#### **T-2.1.3:ELE-4** - Spacing Utility Functions & Types
- **Type**: TypeScript Interfaces + Utility Functions
- **Description**: Type definitions (SpacingToken, SpacingScale, ComponentSpacing, LayoutSpacing) and utility functions (getSpacing, getComponentSpacing, generateSpacingCSS)
- **Location**: Lines 18-145 (interfaces), 343-410 (utility functions)
- **Testing Focus**:
  - TypeScript interface compliance and type safety
  - Utility function input/output validation
  - CSS generation accuracy
  - Import/export functionality
- **Legacy Source**: colors.ts pattern lines 19-35

### Infrastructure Elements

#### **Complete Spacing System** (`spacingSystem`)
- **Type**: Combined System Export (SpacingSystem interface)
- **Description**: Complete spacing system combining all tokens with default export
- **Location**: Lines 402-410
- **Testing Focus**: System integration and tree-shaking optimization

### Testing Priority Classification

#### **High Priority** (Critical for spacing accuracy)
- **T-2.1.3:ELE-1**: Base spacing scale - Core foundation with custom Aplio values
- **T-2.1.3:ELE-2**: Component spacing patterns - SCSS extraction accuracy critical
- **T-2.1.3:ELE-4**: Utility functions - getSpacing(), getComponentSpacing() core functionality

#### **Medium Priority** (Supporting system elements)  
- **T-2.1.3:ELE-3**: Layout spacing utilities - Responsive system support
- Complete spacing system integration

#### **Low Priority** (Type definitions and basic validation)
- TypeScript interface definitions
- CSS generation utility function
- Export structure validation

## Adapted Testing Strategy

Since T-2.1.3 implements **design tokens** (not React components), the testing approach focuses on:

1. **TypeScript Compilation Testing** - Validate all interfaces and exports compile correctly
2. **Token Value Accuracy** - Compare against legacy tailwind.config.js and _common.scss  
3. **Utility Function Validation** - Test getSpacing(), getComponentSpacing(), generateSpacingCSS()
4. **Legacy Fidelity Testing** - Ensure 100% exact value preservation for custom spacing (60px, 100px, 150px)
5. **Import/Export Testing** - Validate module structure and tree-shaking compatibility

**Note**: Visual testing and component scaffolding are **not applicable** for design token testing.