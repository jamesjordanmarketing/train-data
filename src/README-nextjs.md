# Document Categorization Workflow - Next.js 14

This is a [Next.js](https://nextjs.org/) project bootstrapped with create-next-app, converted from a React/Vite application.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

This Next.js 14 application uses the App Router structure:

### Core Files
- `app/layout.tsx` - Root layout component with global styles and providers
- `app/page.tsx` - Main page component (entry point)
- `app/globals.css` - Global CSS with Tailwind v4 configuration

### Components
- `components/` - All React components including shadcn/ui components
- `components/workflow/` - Workflow-specific components
- `components/ui/` - shadcn/ui component library

### State Management
- `stores/workflow-store.ts` - Zustand store for workflow state management

### Data & Configuration
- `data/` - Mock data and type definitions
- `lib/` - Utility libraries including Supabase configuration

## Key Features

1. **Document Categorization Workflow**: 3-step guided process for categorizing documents
2. **Step A**: Statement of Belonging Assessment - rate document relationship strength
3. **Step B**: Primary Category Selection - choose from 11 business categories  
4. **Step C**: Secondary Tags & Metadata - apply detailed tags across 7 dimensions
5. **Responsive Layout**: Proper three-column layout with progress tracking
6. **State Persistence**: Zustand with localStorage persistence for draft saving

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with custom design tokens
- **shadcn/ui** - Component library
- **Zustand** - State management
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## Development Notes

### Client Components
Components that use client-side features (hooks, event handlers, browser APIs) are marked with `'use client'` directive:
- All workflow step components
- Document selector
- Progress tracking components
- State management components

### Server Components
By default, components are server components unless they need client-side features.

### Styling
- Uses Tailwind v4 with custom CSS variables defined in `app/globals.css`
- Custom typography system with base styles for headings, paragraphs, buttons
- Dark mode support with CSS variables

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.