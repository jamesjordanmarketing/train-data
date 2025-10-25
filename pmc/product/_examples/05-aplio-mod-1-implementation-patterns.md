# Next.js 14 Modernization for Aplio Design System - Implementation Patterns
**Version:** 1.0.0  
**Date:** 02-24-2024  
**Category:** Design System Platform  
**Product Abbreviation:** aplio-mod-1

**Source References:**
- Overview Document: `pmc/product/01-aplio-mod-1-overview.md`
- User Stories: `pmc/product/02-aplio-mod-1-user-stories.md`
- Functional Requirements: `pmc/product/03-aplio-mod-1-functional-requirements.md`
- Structure Specification: `pmc/product/04-aplio-mod-1-structure.md`

**Purpose:** This document serves as a pattern library and implementation guide for AI agents, providing concrete examples and standards for implementing the Next.js 14 Aplio Design System modernization.

---

## 1. Design System Implementation Patterns

### Design Token Implementation Pattern
```typescript
// Location: src/lib/design-system/tokens/colors.ts
// Usage: Implementing extracted color tokens

// Pattern:
import { ColorToken } from '@/types/design-system/tokens';

// Direct implementation of extracted color tokens
export const colors: Record<string, ColorToken> = {
  // Primary colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // UI colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
  },
  
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    disabled: '#94a3b8',
    inverse: '#ffffff',
  },
  
  // Border colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
  },
};

// Theme-aware color getter with type safety
export function getColor(key: keyof typeof colors, shade?: number | string): string {
  const color = colors[key];
  
  if (typeof color === 'string') {
    return color;
  }
  
  if (shade && typeof color === 'object' && shade in color) {
    return color[shade as keyof typeof color] as string;
  }
  
  // Default fallback
  return typeof color === 'object' ? color[500] : color;
}

### Typography Token Implementation Pattern
// Location: src/lib/design-system/tokens/typography.ts
// Usage: Implementing extracted typography tokens

// Pattern:
import { FontFamily, FontSize, FontWeight, LineHeight, TypographyTokens } from '@/types/design-system/tokens';

// Font families
export const fontFamilies: Record<FontFamily, string> = {
  sans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: '"Merriweather", "Times New Roman", Times, serif',
  mono: '"Fira Code", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

// Font sizes (extracted from legacy app)
export const fontSizes: Record<FontSize, string> = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
  '7xl': '4.5rem',   // 72px
  '8xl': '6rem',     // 96px
  '9xl': '8rem',     // 128px
};

// Font weights
export const fontWeights: Record<FontWeight, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

// Line heights
export const lineHeights: Record<LineHeight, string> = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

// Comprehensive typography tokens
export const typography: TypographyTokens = {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  // Preset styles for specific elements (extracted from legacy app)
  styles: {
    h1: {
      fontSize: fontSizes['5xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      fontFamily: fontFamilies.sans,
    },
    h2: {
      fontSize: fontSizes['4xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      fontFamily: fontFamilies.sans,
    },
    h3: {
      fontSize: fontSizes['3xl'],
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
      fontFamily: fontFamilies.sans,
    },
    h4: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
      fontFamily: fontFamilies.sans,
    },
    h5: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.normal,
      fontFamily: fontFamilies.sans,
    },
    h6: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.normal,
      fontFamily: fontFamilies.sans,
    },
    body: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
      fontFamily: fontFamilies.sans,
    },
    small: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      fontFamily: fontFamilies.sans,
    },
    caption: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      fontFamily: fontFamilies.sans,
    },
  },
};

### Animation Token Implementation Pattern
// Location: src/lib/design-system/tokens/animations.ts
// Usage: Implementing extracted animation tokens

// Pattern:
import { AnimationToken, AnimationTokens, EasingFunction, TimingToken } from '@/types/design-system/tokens';

// Duration tokens (extracted from legacy app)
export const durations: Record<TimingToken, number> = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
};

// Easing functions (extracted from legacy app)
export const easings: Record<EasingFunction, string> = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Custom easing extracted from legacy app
  custom1: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  custom2: 'cubic-bezier(0.42, 0, 0.58, 1)',
};

// Animation presets (extracted from legacy app)
export const animations: Record<AnimationToken, string> = {
  fadeIn: `fade-in ${durations.normal}ms ${easings.easeOut}`,
  fadeOut: `fade-out ${durations.normal}ms ${easings.easeIn}`,
  slideInUp: `slide-in-up ${durations.normal}ms ${easings.custom1}`,
  slideInDown: `slide-in-down ${durations.normal}ms ${easings.custom1}`,
  slideInLeft: `slide-in-left ${durations.normal}ms ${easings.custom1}`,
  slideInRight: `slide-in-right ${durations.normal}ms ${easings.custom1}`,
  slideOutUp: `slide-out-up ${durations.normal}ms ${easings.easeIn}`,
  slideOutDown: `slide-out-down ${durations.normal}ms ${easings.easeIn}`,
  slideOutLeft: `slide-out-left ${durations.normal}ms ${easings.easeIn}`,
  slideOutRight: `slide-out-right ${durations.normal}ms ${easings.easeIn}`,
  zoomIn: `zoom-in ${durations.slow}ms ${easings.custom2}`,
  zoomOut: `zoom-out ${durations.slow}ms ${easings.easeIn}`,
  bounce: `bounce ${durations.slow}ms ${easings.custom2}`,
  pulse: `pulse ${durations.slowest}ms ${easings.easeInOut} infinite`,
  spin: `spin ${durations.slowest}ms linear infinite`,
};

// Export complete animation tokens
export const animationTokens: AnimationTokens = {
  durations,
  easings,
  animations,
  // Delay variants (extracted from legacy app)
  delays: {
    none: 0,
    short: 100,
    medium: 200,
    long: 300,
    extraLong: 500,
  },
  // Animation sequences (extracted from legacy app)
  sequences: {
    staggered: 50,
    cascade: 100,
    delayed: 200,
  },
};

// Helper for getting animation with custom duration/easing
export function getAnimation(
  animation: AnimationToken,
  customDuration?: number,
  customEasing?: EasingFunction
): string {
  const [name, ...rest] = animations[animation].split(' ');
  const duration = customDuration ? `${customDuration}ms` : rest[0];
  const easing = customEasing ? easings[customEasing] : rest[1];
  
  return `${name} ${duration} ${easing}`;
}

### Responsive Token Implementation Pattern
// Location: src/lib/design-system/tokens/breakpoints.ts
// Usage: Implementing extracted responsive tokens

// Pattern:
import { Breakpoint, BreakpointTokens } from '@/types/design-system/tokens';

// Breakpoint values (extracted from legacy app)
export const breakpoints: Record<Breakpoint, number> = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Media query strings
export const mediaQueries: Record<Breakpoint, string> = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
};

// Container sizes (extracted from legacy app)
export const containers: Record<Breakpoint, string> = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Responsive spacing adjustments (from legacy)
export const responsiveSpacing: Record<Breakpoint, number> = {
  xs: 0.5, // 50% of base spacing
  sm: 0.75, // 75% of base spacing
  md: 1, // 100% of base spacing (default)
  lg: 1.25, // 125% of base spacing
  xl: 1.5, // 150% of base spacing
  '2xl': 2, // 200% of base spacing
};

// Export complete breakpoint tokens
export const breakpointTokens: BreakpointTokens = {
  breakpoints,
  mediaQueries,
  containers,
  responsiveSpacing,
};

// Media query helper for responsive styling
export function createMediaQuery(breakpoint: Breakpoint, nested: boolean = false): string {
  const prefix = nested ? '' : '@media ';
  return `${prefix}${mediaQueries[breakpoint]}`;
}


## 2. Component Implementation Patterns

### Server Component Pattern
// Location: src/app/page.tsx
// Usage: Server-rendered page component

// Pattern:
import { Suspense } from 'react'
import { Metadata } from 'next'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { LoadingSpinner } from '@/components/shared/loaders/spinner'
import { HeroSection } from '@/components/marketing/hero'
import { FeaturesSection } from '@/components/marketing/features'
import { TestimonialsSection } from '@/components/marketing/testimonials'
import { FAQSection } from '@/components/marketing/faq'
import { CTASection } from '@/components/marketing/cta'

// Metadata is defined on the server
export const metadata: Metadata = {
  title: 'Home 4 - Premium SaaS Landing Page',
  description: 'A modern, professional landing page for your SaaS product',
}

// Server component that fetches and passes data to client components
export default async function HomePage() {
  // Server-side data fetching (simulation of static data)
  const heroData = {
    title: "Empower Your Workflow with Aplio",
    subtitle: "A powerful, feature-rich platform designed for modern teams",
    cta: "Get Started",
    secondaryCta: "Learn More",
  }
  
  const featuresData = [
    {
      title: "Powerful Analytics",
      description: "Gain deep insights through comprehensive data analysis.",
      icon: "chart"
    },
    {
      title: "Seamless Integration",
      description: "Connect with your favorite tools and services instantly.",
      icon: "connect"
    },
    {
      title: "Secure by Design",
      description: "Enterprise-grade security protecting your sensitive data.",
      icon: "shield"
    },
    // More features...
  ]
  
  const testimonialsData = [
    {
      quote: "Aplio has transformed how our team collaborates. We're now 50% more productive.",
      author: "Sarah Johnson",
      role: "CTO, TechVision",
      image: "/images/testimonials/sarah.jpg"
    },
    // More testimonials...
  ]
  
  const faqData = [
    {
      question: "How easy is it to get started with Aplio?",
      answer: "Getting started with Aplio is incredibly simple. Sign up for an account, follow our quick setup guide, and you can be up and running in under 5 minutes."
    },
    // More FAQs...
  ]
  
  // Return component composition with suspense boundaries
  return (
    <main>
      {/* Hero Section */}
      <HeroSection 
        title={heroData.title}
        subtitle={heroData.subtitle}
        cta={heroData.cta}
        secondaryCta={heroData.secondaryCta}
      />
      
      {/* Features Section */}
      <ErrorBoundary fallback={<p>Failed to load features</p>}>
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturesSection features={featuresData} />
        </Suspense>
      </ErrorBoundary>
      
      {/* Testimonials Section */}
      <ErrorBoundary fallback={<p>Failed to load testimonials</p>}>
        <Suspense fallback={<LoadingSpinner />}>
          <TestimonialsSection testimonials={testimonialsData} />
        </Suspense>
      </ErrorBoundary>
      
      {/* FAQ Section */}
      <ErrorBoundary fallback={<p>Failed to load FAQs</p>}>
        <Suspense fallback={<LoadingSpinner />}>
          <FAQSection faqs={faqData} />
       </Suspense>
     </ErrorBoundary>
     
     {/* CTA Section */}
     <CTASection 
       title="Ready to transform your workflow?"
       description="Join thousands of teams already using Aplio."
       buttonText="Start Free Trial"
     />
   </main>
 )
}

## Client Component Pattern
// Location: src/components/marketing/hero/index.tsx
// Usage: Interactive hero section with animations

// Pattern:
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getAnimation } from '@/lib/design-system/tokens/animations'
import { useIntersectionObserver } from '@/lib/hooks/use-intersection'
import type { HeroProps } from './types'

export function HeroSection({ 
  title, 
  subtitle, 
  cta, 
  secondaryCta 
}: HeroProps) {
  // State for animation control
  const [isVisible, setIsVisible] = useState(false)
  
  // Intersection observer for triggering animations
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  })
  
  // Effect to control animation based on visibility
  useEffect(() => {
    if (isIntersecting) {
      setIsVisible(true)
    }
  }, [isIntersecting])
  
  // Animation variants (extracted from legacy app)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] // Extracted custom easing
      }
    }
  }
  
  return (
    <section ref={ref} className="relative bg-gradient-to-r from-primary-50 to-secondary-50 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 text-gray-900"
            variants={itemVariants}
          >
            {title}
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl mb-10 text-gray-700"
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={itemVariants}
          >
            <Button size="lg" variant="primary">
              {cta}
            </Button>
            
            <Button size="lg" variant="secondary">
              {secondaryCta}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

### Component Types Pattern
// Location: src/components/marketing/hero/types.ts
// Usage: Type definitions for hero component

// Pattern:
import { ReactNode } from 'react'

export interface HeroProps {
  /**
   * Main headline of the hero section
   */
  title: string;
  
  /**
   * Supporting text that appears below the title
   */
  subtitle: string;
  
  /**
   * Text for the primary call-to-action button
   */
  cta: string;
  
  /**
   * Text for the secondary call-to-action button
   */
  secondaryCta: string;
  
  /**
   * Optional background image URL
   */
  backgroundImage?: string;
  
  /**
   * Optional additional content to display
   */
  children?: ReactNode;
}

export interface HeroCardProps {
  /**
   * Card title text
   */
  title: string;
  
  /**
   * Card description text
   */
  description: string;
  
  /**
   * Icon name or component
   */
  icon: ReactNode | string;
  
  /**
   * Delay before animation starts (in ms)
   */
  animationDelay?: number;
}

### Component Variants Pattern
// Location: src/components/ui/button/variants.ts
// Usage: Type-safe component styling variants

// Pattern:
import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  // Base styles (extracted from legacy app)
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      // Variant styles (extracted from legacy app)
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
        secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
        outline: 'border border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 active:bg-primary-100',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
        link: 'bg-transparent text-primary-600 hover:underline p-0 h-auto',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
      },
      
      // Size styles (extracted from legacy app)
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
      
      // Width styles (extracted from legacy app)
      width: {
        auto: 'w-auto',
        full: 'w-full',
      },
      
      // Icon placement (extracted from legacy app)
      iconPlacement: {
        none: '',
        left: 'flex-row',
        right: 'flex-row-reverse',
        iconOnly: 'px-0 aspect-square',
      },
    },
    
    // Default variants (extracted from legacy app)
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      width: 'auto',
      iconPlacement: 'none',
    },
    
    // Compound variants for special cases
    compoundVariants: [
      {
        iconPlacement: ['left', 'right'],
        class: 'gap-2',
      },
      {
        iconPlacement: 'iconOnly',
        size: 'xs',
        class: 'w-7',
      },
      {
        iconPlacement: 'iconOnly',
        size: 'sm',
        class: 'w-9',
      },
      {
        iconPlacement: 'iconOnly',
        size: 'md',
        class: 'w-10',
      },
      {
        iconPlacement: 'iconOnly',
        size: 'lg',
        class: 'w-12',
      },
      {
        iconPlacement: 'iconOnly',
        size: 'xl',
        class: 'w-14',
      },
    ],
  }
)

// Export type for button props
export type ButtonVariantProps = VariantProps<typeof buttonVariants>

## 3. Animation Implementation Patterns

### Entry Animation Pattern
// Location: src/components/shared/animations/fade-in.tsx
// Usage: Reusable entry animation component

// Pattern:
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useIntersectionObserver } from '@/lib/hooks/use-intersection'
import { durations, easings } from '@/lib/design-system/tokens/animations'
import type { EntryAnimationProps } from './types'

export function FadeIn({
  children,
  direction = 'up',
  duration = 'normal',
  delay = 0,
  distance = 20,
  threshold = 0.1,
  triggerOnce = true,
  className,
}: EntryAnimationProps) {
  // State for controlling animation
  const [shouldAnimate, setShouldAnimate] = useState(false)
  
  // Intersection observer hook for triggering animation
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    triggerOnce,
  })
  
  // Effect to trigger animation when element is in view
  useEffect(() => {
    if (isIntersecting) {
      setShouldAnimate(true)
    } else if (!triggerOnce) {
      setShouldAnimate(false)
    }
  }, [isIntersecting, triggerOnce])
  
  // Calculate animation variants based on direction
  const getDirectionalVariants = () => {
    const variants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: {
          duration: durations[duration] / 1000, // Convert to seconds
          delay: delay / 1000, // Convert to seconds
          ease: easings.custom1, // Extracted from legacy app
        }
      }
    }
    
    // Add direction-specific transform
    switch (direction) {
      case 'up':
        variants.hidden.y = distance
        variants.visible.y = 0
        break
      case 'down':
        variants.hidden.y = -distance
        variants.visible.y = 0
        break
      case 'left':
        variants.hidden.x = distance
        variants.visible.x = 0
        break
      case 'right':
        variants.hidden.x = -distance
        variants.visible.x = 0
        break
      case 'scale':
        variants.hidden.scale = 0.95
        variants.visible.scale = 1
        break
      // Default is just fade with no transform
    }
    
    return variants
  }
  
  const variants = getDirectionalVariants()
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

### Scroll Animation Pattern
// Location: src/components/shared/animations/scroll-reveal.tsx
// Usage: Scroll-triggered animation component

// Pattern:
'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { ScrollRevealProps } from './types'

export function ScrollReveal({
  children,
  effect = 'fade',
  start = 'top bottom',
  end = 'bottom top',
  scrub = false,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  
  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mediaQuery.matches)
    
    const handleChange = () => setReduceMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  // Set up scroll-linked animation
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [start, end]
  })
  
  // Define different motion effects
  const getMotionProps = () => {
    // If user prefers reduced motion, return minimal effects
    if (reduceMotion) {
      return {
        opacity: useTransform(scrollYProgress, [0, 0.2], [0.5, 1])
      }
    }
    
    // Otherwise apply full effects based on selected type
    switch (effect) {
      case 'fade':
        return {
          opacity: useTransform(scrollYProgress, [0, 0.2], [0, 1])
        }
      case 'slide-up':
        return {
          opacity: useTransform(scrollYProgress, [0, 0.2], [0, 1]),
          y: useTransform(scrollYProgress, [0, 0.2], [50, 0])
        }
      case 'slide-down':
        return {
          opacity: useTransform(scrollYProgress, [0, 0.2], [0, 1]),
          y: useTransform(scrollYProgress, [0, 0.2], [-50, 0])
        }
      case 'slide-left':
        return {
          opacity: useTransform(scrollYProgress, [0, 0.2], [0, 1]),
          x: useTransform(scrollYProgress, [0, 0.2], [50, 0])
        }
      case 'slide-right':
        return {
          opacity: useTransform(scrollYProgress, [0, 0.2], [0, 1]),
          x: useTransform(scrollYProgress, [0, 0.2], [-50, 0])
        }
      case 'zoom':
        return {
          opacity: useTransform(scrollYProgress, [0, 0.2], [0, 1]),
          scale: useTransform(scrollYProgress, [0, 0.2], [0.9, 1])
        }
      case 'parallax':
        return {
          y: useTransform(scrollYProgress, [0, 1], [0, -50])
        }
      default:
        return {
          opacity: useTransform(scrollYProgress, [0, 0.2], [0, 1])
        }
    }
  }
  
  const motionProps = getMotionProps()
  
  return (
    <div ref={ref} className={className}>
      <motion.div
        style={motionProps}
        transition={scrub ? { duration: 0 } : { duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

### Hover Animation Pattern
// Location: src/components/ui/card/index.tsx
// Usage: Card component with hover animations

// Pattern:
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { durations, easings } from '@/lib/design-system/tokens/animations'
import { cn } from '@/lib/utils/classnames'
import type { CardProps } from './types'

export function Card({
  title,
  content,
  icon,
  hoverEffect = 'lift',
  className,
  children,
  ...props
}: CardProps) {
  // State for hover detection
  const [isHovered, setIsHovered] = useState(false)
  
  // Get hover animation variants based on effect type
  const getHoverVariants = () => {
    // Different hover effects extracted from legacy app
    switch (hoverEffect) {
      case 'lift':
        return {
          initial: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
          hover: { 
            y: -8, 
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            transition: {
              y: { duration: 0.3, ease: easings.easeOut },
              boxShadow: { duration: 0.3, ease: easings.easeOut }
            }
          }
        }
      case 'scale':
        return {
          initial: { scale: 1 },
          hover: { 
            scale: 1.03,
            transition: {
              duration: 0.3,
              ease: easings.easeOut
            }
          }
        }
      case 'border':
        return {
          initial: { borderColor: 'rgba(226, 232, 240, 1)' },
          hover: { 
            borderColor: 'rgba(99, 102, 241, 1)', 
            transition: {
              duration: 0.3,
              ease: easings.easeOut
            }
          }
        }
      case 'glow':
        return {
          initial: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
          hover: { 
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
            transition: {
              duration: 0.3,
              ease: easings.easeOut
            }
          }
        }
      case 'none':
      default:
        return {
          initial: {},
          hover: {}
        }
    }
  }
  
  const hoverVariants = getHoverVariants()
  
  return (
    <motion.div
      className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      variants={hoverVariants}
      {...props}
    >
      {/* Card content */}
      {icon && (
        <div className="mb-4 text-primary-600">{icon}</div>
      )}
      
      {title && (
        <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      )}
      
      {content && (
        <p className="text-gray-600">{content}</p>
      )}
      
      {children}
    </motion.div>
  )
}

## 4. Data Management Patterns

### Theme Context Pattern
// Location: src/lib/context/theme-context.tsx
// Usage: Theme management using extracted design tokens

// Pattern:
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes/dist/types'
import type { Theme, ThemeContextType } from '@/types/theme'

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme provider component
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)
  
  // Effect to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      <ThemeContextConsumer mounted={mounted}>
        {children}
      </ThemeContextConsumer>
    </NextThemesProvider>
  )
}

// Internal consumer to handle theme state
function ThemeContextConsumer({ 
  children, 
  mounted 
}: { 
  children: React.ReactNode; 
  mounted: boolean;
}) {
  const { theme, setTheme, systemTheme, themes } = useTheme()
  
  // Determine if dark mode is active
  const isDarkMode = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
  
  // Function to change theme
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }
  
  // Create context value
  const contextValue: ThemeContextType = {
    theme: theme as Theme,
    setTheme: changeTheme,
    isDarkMode,
    mounted,
    availableThemes: themes as Theme[],
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook for using the theme context
export function useThemeContext() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  
  return context
}

## Form Validation Pattern
// Location: src/components/marketing/contact/form.tsx
// Usage: Form with validation using extracted patterns

// Pattern:
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormError } from '@/components/ui/form-error'
import { FormSuccess } from '@/components/ui/form-success'
import type { ContactFormProps } from './types'

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

// Form data type
type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm({ onSubmit, className }: ContactFormProps) {
  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  
  // Form hook setup with validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  })
  
  // Form submission handler
  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(null)
      
      // Call the provided onSubmit handler or simulate API call
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Show success message
      setSubmitSuccess('Your message has been sent successfully!')
      // Reset form
      reset()
    } catch (error) {
      // Show error message
      setSubmitError('There was an error sending your message. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)}
      className={className}
    >
      {/* Form fields */}
      <div className="grid grid-cols-1 gap-6">
        {/* Name field */}
        <div>
          <label 
            htmlFor="name" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Your name"
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && (
            <FormError message={errors.name.message} />
          )}
        </div>
        
        {/* Email field */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your.email@example.com"
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && (
            <FormError message={errors.email.message} />
          )}
        </div>
        
        {/* Subject field */}
        <div>
          <label 
            htmlFor="subject" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject
          </label>
          <Input
            id="subject"
            {...register('subject')}
            placeholder="Message subject"
            aria-invalid={errors.subject ? 'true' : 'false'}
          />
          {errors.subject && (
            <FormError message={errors.subject.message} />
          )}
        </div>
        
        {/* Message field */}
        <div>
          <label 
            htmlFor="message" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message
          </label>
          <Textarea
            id="message"
            {...register('message')}
            placeholder="Your message..."
            rows={5}
            aria-invalid={errors.message ? 'true' : 'false'}
          />
          {errors.message && (
            <FormError message={errors.message.message} />
          )}
        </div>
        
        {/* Error message */}
        {submitError && (
          <FormError message={submitError} />
        )}
        
        {/* Success message */}
        {submitSuccess && (
          <FormSuccess message={submitSuccess} />
        )}
        
        {/* Submit button */}
        <div>
          <Button 
            type="submit"
            variant="primary"
            width="full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </div>
    </form>
  )
}

## 5. Responsive Implementation Patterns

### Responsive Layout Pattern
// Location: src/components/layout/container.tsx
// Usage: Responsive container based on extracted breakpoints

// Pattern:
import { HTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils/classnames'
import type { ContainerProps } from './types'

// Container variants based on extracted responsive layout patterns
const containerVariants = cva(
  'mx-auto px-4 w-full',
  {
    variants: {
      size: {
        // Size variants extracted from legacy app
        xs: 'max-w-screen-xs',
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full',
      },
      padding: {
        // Padding variants extracted from legacy app
        none: 'px-0',
        xs: 'px-2',
        sm: 'px-4',
        md: 'px-6',
        lg: 'px-8',
        xl: 'px-12',
      },
    },
    defaultVariants: {
      size: 'lg',
      padding: 'md',
    },
  }
)

export function Container({
  children,
  size,
  padding,
  className,
  ...props
}: ContainerProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(containerVariants({ size, padding }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

### Media Query Hook Pattern
// Location: src/lib/hooks/use-media-query.ts
// Usage: Responsive behavior hook based on extracted breakpoints

// Pattern:
'use client'

import { useEffect, useState } from 'react'
import { breakpoints } from '@/lib/design-system/tokens/breakpoints'
import type { Breakpoint } from '@/types/design-system/tokens'

export type MediaQueryOptions = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

// Hook for checking if a breakpoint is currently active
export function useMediaQuery(
  breakpoint: Breakpoint,
  options: MediaQueryOptions = {}
) {
  const { defaultValue = false, initializeWithValue = true } = options
  
  // Get the correct breakpoint value
  const breakpointValue = breakpoints[breakpoint]
  const query = `(min-width: ${breakpointValue}px)`
  
  // Initialize state
  const [matches, setMatches] = useState(() => {
    // If initializing with the current value and in browser environment
    if (initializeWithValue && typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    
    // Otherwise use default value
    return defaultValue
  })
  
  useEffect(() => {
    // Skip in SSR environment
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query)
      
      // Set initial value
      setMatches(mediaQuery.matches)
      
      // Create handler for changes
      const handler = (event: MediaQueryListEvent) => {
        setMatches(event.matches)
      }
      
      // Add event listener
      mediaQuery.addEventListener('change', handler)
      
      // Clean up
      return () => {
        mediaQuery.removeEventListener('change', handler)
      }
    }
    
    // No cleanup needed in SSR
    return undefined
  }, [query])
  
  return matches
}

// Hook that returns active breakpoints
export function useBreakpoints() {
  const isSm = useMediaQuery('sm')
  const isMd = useMediaQuery('md')
  const isLg = useMediaQuery('lg')
  const isXl = useMediaQuery('xl')
  const is2Xl = useMediaQuery('2xl')
  
  // Return all breakpoint states
  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    // Helper for current breakpoint name
    current: is2Xl ? '2xl' : isXl ? 'xl' : isLg ? 'lg' : isMd ? 'md' : isSm ? 'sm' : 'xs',
  }
}

// Hook for responsive value selection
export function useResponsiveValue<T>(values: Record<Breakpoint, T>): T {
  const { current } = useBreakpoints()
  
  // Get value for current breakpoint or fallback down the scale
  const getValue = (): T => {
    if (current in values) {
      return values[current as Breakpoint]

// Fallback logic - try larger breakpoints first, then smaller
   const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
   const currentIndex = breakpointOrder.indexOf(current as Breakpoint)
   
   // Try larger breakpoints
   for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
     const breakpoint = breakpointOrder[i]
     if (breakpoint in values) {
       return values[breakpoint]
     }
   }
   
   // Try smaller breakpoints
   for (let i = currentIndex - 1; i >= 0; i--) {
     const breakpoint = breakpointOrder[i]
     if (breakpoint in values) {
       return values[breakpoint]
     }
   }
   
   // Fallback to xs if nothing else matches
   return values.xs
 }
 
 return getValue()
}

---

## Implementation Rules

### 1. Design System Implementation

Extract and implement design tokens before component development
Use type-safe token implementations for all visual properties
Follow the extracted values precisely for visual consistency
Document any deviations from legacy implementation

### 2. Component Architecture

Use server components by default, especially for data-fetching and static content
Add 'use client' directive only when interactivity is required
Keep client components focused on interactivity
Use composition to combine server and client components

### 3. Type Safety

Create comprehensive type definitions for all components
Use strict TypeScript settings with proper null checking
Avoid any 'any' types throughout the codebase
Leverage TypeScript's type system for robust interfaces

### 4. Performance

Minimize client-side JavaScript with server components
Implement appropriate suspense boundaries for loading states
Optimize images and assets
Use efficient animations that match the legacy feel

### 5. Accessibility

Implement full keyboard navigation support
Use semantic HTML elements
Add proper ARIA attributes
Support reduced motion preferences

---

## Quality Standards

### Visual Fidelity
- [ ] Visual match with legacy application
- [ ] Animation quality matching legacy behavior
- [ ] Responsive behavior matching legacy application
- [ ] Precise color and typography implementation

### Technical Implementation
- [ ] Server-first architecture
- [ ] Complete TypeScript coverage
- [ ] Performance metrics meeting targets
- [ ] Optimized bundle size

### Developer Experience
- [ ] Clear, consistent component interfaces
- [ ] Comprehensive documentation
- [ ] Reusable patterns
- [ ] Type-safe APIs

### User Experience
- [ ] Fast page loads
- [ ] Smooth animations
- [ ] Responsive across devices
- [ ] Accessible to all users

Remember: The goal is to maintain the premium visual design from the legacy application while implementing a modern, type-safe, and performance-optimized codebase using Next.js 14.


