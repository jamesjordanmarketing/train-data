# {{PROJECT_NAME}} - Structure Specification
**Version:** 1.0.0  
**Date:** [CURRENT_DATE]  
**Category:** [PROJECT_CATEGORY]  
**Product Abbreviation:** [PROJECT_ABBREVIATION]

**Source References:**
- Overview Document: `[PATH_TO_OVERVIEW_DOCUMENT]`
- User Stories: `[PATH_TO_USER_STORIES]`
- Functional Requirements: `[PATH_TO_FUNCTIONAL_REQUIREMENTS]`
- [Other Documents]: `[PATH_TO_OTHER_DOCUMENTS]`

**Purpose:** This document provides the complete file and folder structure for the {{PROJECT_NAME}}, serving as the authoritative reference for implementation.

---

## Root Structure
```
├── src/                             # Source code
│   ├── [primary-code-dir]/          # Main application code
│   ├── components/                  # Reusable components
│   ├── lib/                         # Core utilities and configurations
│   ├── types/                       # Type definitions
│   └── [other-src-dirs]/            # Other source directories
├── public/                          # Static assets
├── tests/                           # Test files
├── docs/                            # Documentation
└── [other-root-dirs]/               # Other root directories
```

## Application Directory Structure
```
src/[primary-code-dir]/
├── [feature-group-1]/               # Feature group 1
│   ├── [feature-1]/                 # Feature 1
│   │   ├── [file-1].[ext]           # Purpose of file 1
│   │   └── [file-2].[ext]           # Purpose of file 2
│   └── [feature-2]/                 # Feature 2
├── [feature-group-2]/               # Feature group 2
│   └── [features]/                  # Features
├── shared/                          # Shared application code
│   ├── [shared-category-1]/         # Shared category 1
│   └── [shared-category-2]/         # Shared category 2
└── [global-files]/                  # Global application files
```

## Components Directory Structure
```
src/components/
├── [component-category-1]/          # Component category 1
│   ├── [component-1]/               # Component 1
│   │   ├── index.[ext]              # Main component file
│   │   ├── types.[ext]              # Component types
│   │   ├── styles.[ext]             # Component styles
│   │   └── [component-1].test.[ext] # Component tests
│   └── [component-2]/               # Component 2
├── [component-category-2]/          # Component category 2
│   └── [components]/                # Components
└── shared/                          # Shared components
    └── [shared-components]/         # Shared component files
```

## Core Utilities Structure
```
src/lib/
├── utils/                           # Utility functions
│   ├── [utility-category-1]/        # Utility category 1
│   │   └── [utilities].[ext]        # Utility implementations
│   └── [utility-category-2]/        # Utility category 2
├── services/                        # External service integrations
│   └── [service-name]/              # Service implementation
├── hooks/                           # Custom hooks
│   └── [hook-name].[ext]            # Hook implementation
└── config/                          # Configuration
    └── [config-name].[ext]          # Configuration implementation
```

## Type Definitions Structure
```
src/types/
├── [domain-1]/                      # Domain 1 types
│   └── [type-definitions].[ext]     # Type definitions
├── [domain-2]/                      # Domain 2 types
│   └── [type-definitions].[ext]     # Type definitions
├── api/                             # API types
│   └── [api-types].[ext]            # API type definitions
└── index.[ext]                      # Type exports
```

## Testing Structure
```
tests/
├── unit/                            # Unit tests
│   ├── [test-category-1]/           # Test category 1
│   │   └── [test-files].[ext]       # Test implementations
│   └── [test-category-2]/           # Test category 2
├── integration/                     # Integration tests
│   └── [integration-tests]/         # Integration test implementations
├── e2e/                             # End-to-end tests
│   └── [e2e-tests]/                 # E2E test implementations
└── fixtures/                        # Test data
    └── [fixture-files]              # Test fixtures
```

## File Naming Conventions

### Component Files
- Main component: `index.[ext]`
- Types: `types.[ext]`
- Styles: `styles.[ext]`
- Tests: `[name].test.[ext]`
- Stories: `[name].stories.[ext]`

### Utility Files
- Implementation: `[name].[ext]`
- Types: `[name].types.[ext]`
- Tests: `[name].test.[ext]`

### Configuration Files
- Config files: `[name].config.[ext]`
- Environment files: `[name].env.[ext]`
- Type definitions: `[name].d.[ext]`

## Directory Naming Conventions

1. Feature directories: `kebab-case`
2. Component directories: `kebab-case`
3. Utility directories: `kebab-case`
4. Group directories: Appropriate framework convention (e.g., parentheses for grouping)

## Implementation Guidelines

### Component Organization
1. **Co-location**: Keep related files together
2. **Directory Per Component**: Each significant component gets its own directory
3. **Barrel Files**: Use index files for clean exports
4. **Clear Boundaries**: Maintain clear component boundaries
5. **Type Definitions**: Keep type definitions alongside components or in dedicated files

### Code Organization
1. **Feature Based**: Organize code by features or domains
2. **Shared Code**: Place shared utilities in dedicated directories
3. **Dependencies**: Minimize dependencies between unrelated features
4. **Consistency**: Maintain consistent file organization across similar components
5. **Documentation**: Include documentation for complex components or utilities

---

## Quality Standards

### Code Organization
- [ ] Proper file location following structure
- [ ] Clear component boundaries
- [ ] Type safety throughout
- [ ] Documentation for complex logic

### Performance
- [ ] Appropriate code splitting
- [ ] Lazy loading where beneficial
- [ ] Optimized assets
- [ ] Efficient state management

### Accessibility
- [ ] Semantic HTML
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Proper ARIA attributes

### Responsive Design
- [ ] Mobile-first approach
- [ ] Consistent breakpoint usage
- [ ] Viewport optimizations
- [ ] Touch-friendly interfaces

### Security
- [ ] Input validation
- [ ] Output encoding
- [ ] Secure data handling
- [ ] Authentication/authorization patterns

## Version Control Structure

### Branch Structure
```
├── main                            # Production code
├── develop                         # Development code
├── feature/*                       # Feature branches
├── release/*                       # Release branches
└── hotfix/*                       # Hotfix branches
```

### Standard Ignore Patterns
```
├── build/                         # Build outputs
├── coverage/                      # Test coverage
├── node_modules/                  # Dependencies
├── .env*                         # Environment files
└── *.log                         # Log files
``` 