# Next.js 14 Modernization for Aplio Design System - Structure Specification
**Version:** 1.0.0  
**Date:** 02-24-2024  
**Category:** Design System Platform  
**Product Abbreviation:** aplio-mod-1

**Source References:**
- Overview Document: `pmc/product/01-aplio-mod-1-overview.md`
- User Stories: `pmc/product/02-aplio-mod-1-user-stories.md`
- Functional Requirements: `pmc/product/03-aplio-mod-1-functional-requirements.md`

**Purpose:** This document provides the complete file and folder structure for the Next.js 14 Aplio Design System modernization project, serving as the authoritative reference for implementation.

---

## Root Structure

aplio-modern-1/
├── src/                            # Source code root
├── public/                         # Static assets
├── design-system/                  # Design system documentation
├── tests/                          # Test files
└── [Configuration Files]           # Root config files

## Design System Documentation

### Design Token Documentation
design-system/
├── tokens/                         # Extracted design tokens
│   ├── colors.json                 # Color system tokens
│   ├── typography.json             # Typography tokens
│   ├── spacing.json                # Spacing system tokens
│   ├── animations.json             # Animation tokens
│   └── breakpoints.json            # Responsive breakpoints
├── components/                     # Component visual documentation
│   ├── ui/                         # UI component references
│   ├── marketing/                  # Marketing component references
│   ├── layout/                     # Layout component references
│   └── patterns/                   # Common patterns
├── animations/                     # Animation pattern documentation
│   ├── entry.md                    # Entry animations
│   ├── hover.md                    # Hover animations
│   ├── scroll.md                   # Scroll animations
│   └── transitions.md              # Transition animations
└── responsive/                     # Responsive behavior documentation
├── layouts.md                  # Layout behaviors
├── components.md               # Component behaviors
├── mobile.md                   # Mobile-specific patterns
└── touch.md                    # Touch accommodations

## Source Code Structure

### App Directory (Pages & Routing)
src/app/
├── (marketing)/                    # Marketing pages route group
│   ├── page.tsx                    # Home page (Home-4 template)
│   ├── about/
│   │   ├── page.tsx                # About page
│   │   └── loading.tsx             # About loading UI
│   ├── services/
│   │   ├── page.tsx                # Services page
│   │   └── loading.tsx             # Services loading UI
│   ├── contact/
│   │   ├── page.tsx                # Contact page
│   │   ├── loading.tsx             # Contact loading UI
│   │   └── actions.ts              # Contact form actions
│   └── testimonials/
│       ├── page.tsx                # Testimonials page
│       └── loading.tsx             # Testimonials loading UI
├── layout.tsx                      # Root layout
├── providers.tsx                   # App providers wrapper
├── globals.css                     # Global styles
└── not-found.tsx                   # 404 page

### Components Directory
src/components/
├── ui/                            # Base UI components
│   ├── button/
│   │   ├── index.tsx              # Button component
│   │   ├── button.test.tsx        # Button tests
│   │   ├── types.ts               # Button types
│   │   └── variants.ts            # Button variants
│   ├── card/
│   │   ├── index.tsx              # Card component
│   │   ├── card.test.tsx          # Card tests
│   │   ├── types.ts               # Card types
│   │   └── variants.ts            # Card variants
│   ├── input/
│   │   ├── index.tsx              # Input component
│   │   ├── input.test.tsx         # Input tests
│   │   ├── types.ts               # Input types
│   │   └── variants.ts            # Input variants
│   ├── typography/
│   │   ├── index.tsx              # Typography components
│   │   ├── typography.test.tsx    # Typography tests
│   │   ├── types.ts               # Typography types
│   │   └── variants.ts            # Typography variants
│   └── [other-base-components]/
├── marketing/                     # Marketing page components
│   ├── hero/
│   │   ├── index.tsx              # Hero component
│   │   ├── hero.test.tsx          # Hero tests
│   │   ├── card.tsx               # Hero card component
│   │   └── animations.ts          # Hero animations
│   ├── features/
│   │   ├── index.tsx              # Features section
│   │   ├── features.test.tsx      # Features tests
│   │   ├── feature-card.tsx       # Feature card component
│   │   └── animations.ts          # Feature animations
│   ├── testimonials/
│   │   ├── index.tsx              # Testimonials section
│   │   ├── testimonials.test.tsx  # Testimonials tests
│   │   ├── carousel.tsx           # Testimonial carousel
│   │   └── card.tsx               # Testimonial card
│   ├── faq/
│   │   ├── index.tsx              # FAQ section
│   │   ├── faq.test.tsx           # FAQ tests
│   │   ├── accordion.tsx          # FAQ accordion
│   │   └── animations.ts          # FAQ animations
│   └── cta/
│       ├── index.tsx              # CTA section
│       ├── cta.test.tsx           # CTA tests
│       └── animations.ts          # CTA animations
├── layout/                        # Layout components
│   ├── header/
│   │   ├── index.tsx              # Header component
│   │   ├── header.test.tsx        # Header tests
│   │   ├── navigation.tsx         # Navigation component
│   │   └── mobile-menu.tsx        # Mobile menu component
│   └── footer/
│       ├── index.tsx              # Footer component
│       ├── footer.test.tsx        # Footer tests
│       ├── newsletter.tsx         # Newsletter component
│       └── links.tsx              # Footer links component
└── shared/                        # Shared components
├── animations/
│   ├── fade-in.tsx            # Fade in animation
│   ├── slide-in.tsx           # Slide in animation
│   ├── scroll-reveal.tsx      # Scroll reveal animation
│   └── transition.tsx         # Transition animation
├── loaders/
│   ├── spinner.tsx            # Spinner component
│   ├── skeleton.tsx           # Skeleton component
│   └── progress.tsx           # Progress component
└── error-boundary/
├── index.tsx              # Error boundary component
└── fallback.tsx           # Error fallback component

### Core Systems
src/lib/
├── design-system/                 # Design system implementation
│   ├── tokens/
│   │   ├── colors.ts              # Color token implementation
│   │   ├── typography.ts          # Typography token implementation
│   │   ├── spacing.ts             # Spacing token implementation
│   │   ├── animations.ts          # Animation token implementation
│   │   └── breakpoints.ts         # Breakpoint token implementation
│   └── index.ts                   # Design system exports
├── styles/                       # Styling system
│   ├── theme/
│   │   ├── index.ts              # Theme configuration
│   │   └── variants.ts           # Common variant definitions
│   └── animations/
│       ├── index.ts              # Animation exports
│       ├── timings.ts            # Animation timing utilities
│       ├── transitions.ts        # Transition utilities
│       └── keyframes.ts          # Animation keyframes
├── utils/                        # Utility functions
│   ├── animation.ts              # Animation utilities
│   ├── responsive.ts             # Responsive utilities
│   ├── dom.ts                    # DOM utilities
│   └── validation.ts             # Validation utilities
└── hooks/                        # Custom hooks
├── use-theme.ts              # Theme hook
├── use-media-query.ts        # Media query hook
├── use-intersection.ts       # Intersection observer hook
└── use-animation.ts          # Animation hook

### Type Definitions
src/types/
├── design-system/                # Design system types
│   ├── tokens.ts                 # Token type definitions
│   ├── theme.ts                  # Theme type definitions
│   └── variants.ts               # Variant type definitions
├── components/                   # Component types
│   ├── ui.ts                     # UI component types
│   ├── marketing.ts              # Marketing component types
│   └── layout.ts                 # Layout component types
├── hooks/                        # Hook types
│   ├── theme.ts                  # Theme hook types
│   ├── animation.ts              # Animation hook types
│   └── media.ts                  # Media query hook types
└── global.d.ts                   # Global type declarations

## Configuration Files
./
├── package.json                  # Package manifest
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
├── prettier.config.js            # Prettier configuration
├── eslint.config.js              # ESLint configuration
└── jest.config.js                # Jest configuration

## Public Assets
public/
├── images/                       # Image assets
│   ├── marketing/                # Marketing images
│   ├── logos/                    # Logo assets
│   └── icons/                    # Icon assets
├── fonts/                        # Font files
└── favicon/                      # Favicon assets

## Test Structure
tests/
├── unit/                         # Unit tests
│   ├── components/               # Component tests
│   ├── hooks/                    # Hook tests
│   └── utils/                    # Utility tests
├── integration/                 # Integration tests
│   └── pages/                   # Page tests
├── e2e/                        # End-to-end tests
│   └── flows/                  # User flow tests
└── visual/                     # Visual regression tests
└── components/             # Component visual tests

---

## Implementation Guidelines

### File Naming Conventions
1. React Components: PascalCase for component names, kebab-case for files (e.g., `ButtonGroup.tsx` in `button-group/index.tsx`)
2. Utilities: camelCase (e.g., `formatDate.ts`)
3. Types: PascalCase (e.g., `ButtonProps.ts`)
4. Constants: UPPER_SNAKE_CASE for values, camelCase for exports
5. Configuration: kebab-case

### Component Organization Rules
1. **Co-location**: Keep related files together (component, types, tests, etc.)
2. **Directory Per Component**: Each significant component gets its own directory
3. **Barrel Files**: Use index.ts files for clean exports
4. **Client Directive**: Add 'use client' directive only at the component level, not in type or utility files
5. **Type Separation**: Keep types in separate files for larger components

### Server/Client Component Guidelines
1. **Server by Default**: Use server components by default
2. **Explicit Client Components**: Mark client components with 'use client' directive
3. **Minimize Client Code**: Keep client component code minimal
4. **State Management**: Contain state management within client boundaries
5. **Props Interface**: Design clean interfaces between server and client components

### Import/Export Guidelines
1. **Named Exports**: Use named exports for utilities and subcomponents
2. **Default Component Export**: Use default exports for main components
3. **Type Exports**: Export types separately
4. **Explicit Imports**: Avoid wildcard imports
5. **Relative Imports**: Use relative imports for co-located files

---

## Directory-Specific Guidelines

### Design System Documentation
- Extract and document all design tokens without implementation details
- Create visual references for all components
- Document animation patterns with timing and easing details
- Specify responsive behaviors across breakpoints

### App Directory
- Implement route groups to organize related pages
- Use server components for pages by default
- Implement loading and error states for all routes
- Keep page components focused on composition, not implementation

### Components Directory
- Organize by domain (ui, marketing, layout)
- Co-locate related files (component, types, tests)
- Component directories should include index.tsx, types.ts, and tests
- Use subcomponent files for complex components

### Core Systems
- Implement design tokens as TypeScript constants
- Create a theme system with light/dark mode support
- Develop animation utilities that match legacy behavior
- Create responsive utilities for consistent breakpoint handling

---

## Quality Standards

### Code Organization
- [ ] Proper file location following structure
- [ ] Clear component boundaries
- [ ] Type safety throughout
- [ ] Documentation for complex logic

### Performance
- [ ] Server-first component approach
- [ ] Lazy loading for client components
- [ ] Optimized images and assets
- [ ] Minimized client-side JavaScript

### Accessibility
- [ ] ARIA attributes where needed
- [ ] Keyboard navigation support
- [ ] Focus management
- [ ] Color contrast compliance

### Responsive Design
- [ ] Mobile-first approach
- [ ] Consistent breakpoint usage
- [ ] Touch target optimization
- [ ] Viewport considerations

This structure provides a comprehensive blueprint for implementing the modernized Aplio Design System using Next.js 14 and TypeScript, with a focus on maintaining the premium design quality through systematic design system extraction.

