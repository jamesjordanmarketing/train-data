# How to Build Your Project with an AI Coding Agent

Hey there! This tutorial will show you how to use an AI coding agent to build the Aplio Design System project. Think of the AI as your coding partner that will help you create all the code for this project. Let's break it down into simple steps!

## What You'll Need

- A coding environment like Cursor, VSCode with GitHub Copilot, or another AI-powered coding tool
- The implementation prompt we created (located at `pmc/_prompt_engineering/prompt-aspiring/aplio-design-system-implementation-prompt.md`)
- Basic understanding of what the project is about (modernizing a design system)

## The Big Picture

The AI will help you build this project in phases:
1. **Design System Extraction** - Getting all the colors, fonts, and styles from the old code
2. **Component Building** - Creating the building blocks of the website
3. **Page Assembly** - Putting everything together into complete pages

## Step-by-Step Guide

### Step 1: Getting Started

1. Open your AI coding tool (like Cursor)
2. Create a new project folder called `aplio-modern-1`
3. Copy the implementation prompt to your clipboard

### Step 2: Starting the Conversation

Instead of giving the AI the entire prompt at once (which might be too much), we'll break it down into phases:

1. Start by introducing the project:

```
I need help building the Aplio Design System modernization project. This project transforms a JavaScript-based theme into a modern TypeScript-powered Next.js 14 platform. Let's start by setting up the project and extracting the design system. Can you help me with that?
```

2. After the AI responds, share the first part of the prompt (Project Overview and Implementation Approach sections)

### Step 3: Design System Extraction Phase

1. Ask the AI to help you set up the project structure:

```
Let's start by setting up the Next.js 14 project with TypeScript. Can you help me initialize the project and create the folder structure according to the design system requirements?
```

2. Once the project is set up, move to design token extraction:

```
Now, let's extract the design tokens from the legacy codebase. Here are the references we need to examine:

[Copy the "Step 1: Examine Legacy Code References" section from the prompt]

Can you help me implement the color system first?
```

3. Track progress by checking that the AI creates:
   - A proper Next.js 14 project structure
   - Design token files (colors.ts, typography.ts, etc.)
   - Theme provider implementation

### Step 4: Component Implementation Phase

1. After the design tokens are implemented, move to core UI components:

```
Great! Now that we have our design tokens, let's implement the core UI components. Can you help me create the Button component first, following the PATTERN-BUTTON-HOVER-ANIMATION pattern?
```

2. After each core component is completed, move to the next one:

```
The Button looks good! Now let's implement the Card component using the PATTERN-CARD-HOVER-EFFECTS pattern.
```

3. Once core components are done, move to Home-4 specific components:

```
Now let's implement the Home-4 template components. Let's start with the Hero section, referencing the legacy code at aplio-legacy/components/home-4/Hero.jsx.
```

4. Track progress by checking that the AI creates:
   - Core UI components (Button, Card, etc.)
   - Home-4 specific components (Hero, Feature, etc.)
   - Each component should match the visual style of the legacy code

### Step 5: Page Assembly Phase

1. After all components are implemented, ask the AI to assemble the Home-4 page:

```
Now that we have all our components, let's assemble the Home-4 page. Can you create the page.tsx file that imports and uses all our components?
```

2. Track progress by checking that:
   - The page imports all necessary components
   - Components are arranged in the correct order
   - The page matches the visual style of the legacy Home-4 page

## How to Check Progress

After each phase, you should check the AI's progress by:

1. **Looking at the files created** - Make sure they match what was requested
2. **Reviewing the code** - Check that it follows the patterns and principles
3. **Running the project** - Use `npm run dev` to see the actual result in the browser

If something doesn't look right, you can ask the AI to fix it:

```
The Button component doesn't have the hover animation effect. Can you update it to match the animation in the legacy code?
```

## Troubleshooting Tips

If the AI gets stuck or confused:

1. **Break down the task** - Ask for one specific thing at a time
2. **Provide context** - Remind the AI what you're working on
3. **Share code snippets** - Show the AI what you already have
4. **Ask for explanations** - If you don't understand something, ask the AI to explain it

## Example Conversation Flow

Here's an example of how your conversation might flow:

**You:** I need help building the Aplio Design System modernization project. This project transforms a JavaScript-based theme into a modern TypeScript-powered Next.js 14 platform. Let's start by setting up the project and extracting the design system.

**AI:** *[Responds with information about setting up a Next.js project]*

**You:** Great! Now let's set up the folder structure according to this pattern... [share relevant part of prompt]

**AI:** *[Helps create folder structure]*

**You:** Now, let's extract the color system from the legacy code. Here are the references... [share color system references]

**AI:** *[Helps implement color system]*

**You:** That looks good! Now let's move on to the typography system...

And so on, working through each phase of the project.

## Final Tips

1. **Take it step by step** - Don't rush through the process
2. **Save your work often** - Commit your code to Git regularly
3. **Ask questions** - If you don't understand something, ask the AI to explain
4. **Compare with legacy** - Always check that your new code matches the look and feel of the old code
5. **Test as you go** - Don't wait until the end to test your code

By following this guide, you'll be able to work with an AI coding agent to build the Aplio Design System project successfully. Good luck!
