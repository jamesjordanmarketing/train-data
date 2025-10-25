# BrightRun Tech Stack Reference - v2

## Overview
This document serves as a comprehensive reference for the AI coding agent to understand and implement the approved technology stack for BrightRun projects. All listed technologies are pre-approved and should be used when building features.

## Core Technologies

### Frontend Framework
- **Next.js 14**: Primary React framework with App Router
  - Use for: Full-stack React applications, SSR/SSG, API routes
  - Features: App Router, Server Components, Streaming
  - Always use TypeScript configuration

### Language
- **TypeScript**: Primary development language
  - Use for: All JavaScript/React code
  - Configuration: Strict mode enabled
  - Benefits: Type safety, better IDE support, reduced runtime errors

### Database & Backend
- **Supabase**: Primary database and backend service
  - Use for: PostgreSQL database, real-time subscriptions, file storage
  - Features: Built-in auth, row-level security, real-time updates
  - **Important**: Always create databases and populate with mock data for development
  - Mock data should represent realistic production scenarios

### State Management
- **Zustand**: Global state management
  - Use for: Managing application-wide state in React components
  - Benefits: Lightweight, TypeScript-friendly, minimal boilerplate
  - Avoid Redux unless specifically required

### Styling
- **Tailwind CSS**: Utility-first CSS framework
  - Use for: All component styling and layouts
  - Benefits: Efficient, maintainable, consistent design system
  - Configure with custom design tokens when needed

### Authentication
- **Supabase Auth**: Built-in authentication system
  - Use for: User registration, login, session management
  - Features: Social auth, magic links, JWT tokens
  - Integrates seamlessly with Supabase database

### API Layer
- **Next.js API Routes**: Serverless API endpoints
  - Use for: Backend logic, external API integrations, data processing
  - Location: `/app/api/` directory (App Router)
  - Benefits: Serverless, TypeScript support, integrated with frontend

### Real-time Communication
- **WebSockets**: For real-time features
  - Implementation options:
    - Supabase Realtime (recommended for database changes)
    - Socket.io (for custom real-time features)
    - Native WebSocket API (for simple implementations)
  - Use for: Live updates, chat features, collaborative editing

### External Integrations
- **Various External APIs**: Third-party service integrations
  - Implementation: Use Next.js API routes as proxy when needed
  - Security: Never expose API keys to client-side
  - Error handling: Implement proper retry logic and fallbacks

## AI/ML Integration Stack

### AI Models & Services
- **Kimi**: AI model integration
- **Qwen 32**: Large language model
- **GPT-OSS 120B**: Open-source GPT model
- **OpenAI API Protocol**: Standard API interface for AI models
- **Runpod**: Private LLM hosting and inference
  - Use for: Self-hosted AI models, privacy-sensitive AI operations
  - Benefits: Cost control, data privacy, custom model deployment

### AI Implementation Guidelines
- Use OpenAI API Protocol standard for consistency
- Implement proper rate limiting and error handling
- Cache AI responses when appropriate
- Use streaming for long-form AI responses

## Development & Deployment

### Deployment Platform
- **Vercel**: Primary hosting and deployment
  - Use for: Next.js application deployment
  - Features: Automatic deployments, edge functions, analytics
  - Integration: Seamless with Next.js and GitHub

### Version Control
- **Git & GitHub**: Code management and collaboration
  - Use for: All code versioning, collaboration, CI/CD
  - Workflow: Feature branches, pull requests, code reviews
  - Integration: Automated deployments via Vercel

### Testing Framework
- **Jest**: JavaScript testing framework
  - Use for: Unit tests, integration tests
  - Configuration: TypeScript support enabled

- **React Testing Library**: React component testing
  - Use for: Component testing, user interaction testing
  - Philosophy: Test behavior, not implementation

## Implementation Guidelines

### Database Development
1. **Always create development databases** when implementing features that would use a database in production
2. **Populate with realistic mock data** that represents actual use cases
3. **Use Supabase migrations** for schema changes
4. **Implement row-level security** for data protection

### Code Organization
- Use TypeScript for all new code
- Follow Next.js 14 App Router conventions
- Implement proper error boundaries
- Use Zustand for state that needs to persist across components
- Keep API routes thin - delegate complex logic to separate modules

### Performance Considerations
- Use Next.js Server Components when possible
- Implement proper caching strategies
- Optimize images with Next.js Image component
- Use Tailwind's purge functionality for smaller CSS bundles

### Security Best Practices
- Never expose sensitive API keys to client-side
- Use Supabase RLS for database security
- Implement proper input validation
- Use HTTPS for all external API calls

## Quick Reference Commands

### Project Setup
```bash
# Create Next.js project with TypeScript
npx create-next-app@latest . --typescript --tailwind --app

# Install additional dependencies
npm install zustand @supabase/supabase-js
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### Supabase Setup
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize Supabase project
supabase init

# Start local development
supabase start
```

## Notes for AI Agent
- **Always use TypeScript** - no plain JavaScript
- **Mock data is mandatory** for any database-related features
- **Follow Next.js 14 App Router patterns** - avoid Pages Router
- **Use Tailwind classes** instead of custom CSS when possible
- **Implement proper error handling** for all external API calls
- **Use Zustand sparingly** - prefer React state when component-local state suffices
- **Test coverage is important** - write tests for critical functionality

---

*Last updated: [Current Date]*
*Version: 2.0*
*Target: AI Coding Agent Reference*