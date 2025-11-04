# Error Boundary System

**Version:** 1.0.0  
**Last Updated:** 2025-01-16

## Overview

The Error Boundary System provides comprehensive React error catching and recovery mechanisms for the Interactive LoRA Conversation Generation platform. This system ensures the application remains functional even when individual components crash, providing users with clear error messages and recovery options.

## Table of Contents

- [Features](#features)
- [Components](#components)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Integration Guide](#integration-guide)
- [Error Recovery](#error-recovery)
- [Development vs Production](#development-vs-production)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Features

✅ **Global Error Catching** - Catches all unhandled React errors  
✅ **Feature Isolation** - Isolates errors to specific features  
✅ **User-Friendly UI** - Clear error messages and recovery options  
✅ **Error Logging** - Automatic logging to ErrorLogger service  
✅ **Error Tracking** - Unique error IDs for support tracking  
✅ **Automatic Recovery** - Error boundaries reset on route navigation  
✅ **Development Mode** - Detailed error information for debugging  
✅ **Production Mode** - Generic error messages for users  
✅ **Accessible** - Keyboard navigation and screen reader support

## Components

### Base Components

#### `ErrorBoundary`

Base error boundary class component that catches React errors.

```tsx
import { ErrorBoundary } from '@/components/errors';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `children: ReactNode` - Child components to protect
- `fallback?: (error, errorInfo, reset) => ReactNode` - Custom fallback UI
- `onError?: (error, errorInfo) => void` - Custom error handler
- `isolate?: boolean` - If true, only catches errors in children

#### `ErrorFallback`

Default fallback UI component displayed when an error is caught.

```tsx
import { ErrorFallback } from '@/components/errors';

<ErrorFallback
  error={error}
  errorInfo={errorInfo}
  errorId="abc-123"
  onReset={handleReset}
/>
```

**Props:**
- `error: Error` - The error object
- `errorInfo: ErrorInfo` - React error info with component stack
- `errorId?: string` - Unique error ID for tracking
- `onReset?: () => void` - Reset function
- `showReportButton?: boolean` - Show/hide report button (default: true)

### Feature-Specific Boundaries

#### `DashboardErrorBoundary`

Isolates errors in the Dashboard view.

```tsx
import { DashboardErrorBoundary } from '@/components/errors';

<DashboardErrorBoundary>
  <DashboardView />
</DashboardErrorBoundary>
```

#### `GenerationErrorBoundary`

Isolates errors in Generation features (Single/Batch generation).

```tsx
import { GenerationErrorBoundary } from '@/components/errors';

<GenerationErrorBoundary>
  <GenerationForm />
</GenerationErrorBoundary>
```

#### `ExportErrorBoundary`

Isolates errors in Export features.

```tsx
import { ExportErrorBoundary } from '@/components/errors';

<ExportErrorBoundary>
  <ExportModal />
</ExportErrorBoundary>
```

#### `TemplatesErrorBoundary`

Isolates errors in Templates view.

```tsx
import { TemplatesErrorBoundary } from '@/components/errors';

<TemplatesErrorBoundary>
  <TemplatesView />
</TemplatesErrorBoundary>
```

#### `ReviewQueueErrorBoundary`

Isolates errors in Review Queue view.

```tsx
import { ReviewQueueErrorBoundary } from '@/components/errors';

<ReviewQueueErrorBoundary>
  <ReviewQueueView />
</ReviewQueueErrorBoundary>
```

#### `SettingsErrorBoundary`

Isolates errors in Settings view.

```tsx
import { SettingsErrorBoundary } from '@/components/errors';

<SettingsErrorBoundary>
  <SettingsView />
</SettingsErrorBoundary>
```

#### `ModalErrorBoundary`

Isolates errors in modal dialogs.

```tsx
import { ModalErrorBoundary } from '@/components/errors';

<Dialog open={open} onOpenChange={setOpen}>
  <ModalErrorBoundary onClose={() => setOpen(false)}>
    <DialogContent>
      <ComplexModalContent />
    </DialogContent>
  </ModalErrorBoundary>
</Dialog>
```

**Props:**
- `children: ReactNode` - Modal content to protect
- `onClose?: () => void` - Function to close modal on error

## Quick Start

### 1. Global Error Boundary

Wrap your entire app with a global error boundary:

```tsx
// src/App.tsx
import { ErrorBoundary } from '@/components/errors';

export default function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 2. Feature-Specific Boundaries

Wrap individual features to isolate errors:

```tsx
// src/components/views/DashboardView.tsx
import { DashboardErrorBoundary } from '@/components/errors';

export function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardView />
    </DashboardErrorBoundary>
  );
}
```

### 3. Modal Error Boundaries

Wrap modals to prevent errors from crashing the app:

```tsx
import { ModalErrorBoundary } from '@/components/errors';

<Dialog open={open} onOpenChange={setOpen}>
  <ModalErrorBoundary onClose={() => setOpen(false)}>
    <DialogContent>
      <TemplateEditorModal />
    </DialogContent>
  </ModalErrorBoundary>
</Dialog>
```

## Usage Examples

### Custom Fallback UI

Provide a custom fallback component:

```tsx
import { ErrorBoundary } from '@/components/errors';

function CustomFallback({ error, reset }) {
  return (
    <div className="error-container">
      <h1>Oops! Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  );
}

<ErrorBoundary
  fallback={(error, errorInfo, reset) => (
    <CustomFallback error={error} reset={reset} />
  )}
>
  <YourComponent />
</ErrorBoundary>
```

### Custom Error Handler

Add custom error handling logic:

```tsx
import { ErrorBoundary } from '@/components/errors';
import { trackErrorInAnalytics } from '@/lib/analytics';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to analytics
    trackErrorInAnalytics({
      error: error.message,
      component: errorInfo.componentStack,
    });
    
    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Nested Error Boundaries

Isolate errors at multiple levels:

```tsx
import { ErrorBoundary, DashboardErrorBoundary } from '@/components/errors';

<ErrorBoundary>
  <AppLayout>
    <DashboardErrorBoundary>
      <DashboardView>
        <ErrorBoundary>
          <ComplexWidget />
        </ErrorBoundary>
      </DashboardView>
    </DashboardErrorBoundary>
  </AppLayout>
</ErrorBoundary>
```

## Integration Guide

### Step 1: Wrap Root App

Add global error boundary to your app root:

```tsx
// src/App.tsx
import { ErrorBoundary } from '@/components/errors';

export default function App() {
  return (
    <ErrorBoundary>
      <DashboardLayout>
        {/* Your app content */}
      </DashboardLayout>
    </ErrorBoundary>
  );
}
```

### Step 2: Add Feature Boundaries

Wrap each major feature with a feature-specific boundary:

```tsx
// src/App.tsx
import {
  ErrorBoundary,
  DashboardErrorBoundary,
  TemplatesErrorBoundary,
  GenerationErrorBoundary,
} from '@/components/errors';

function renderView() {
  switch (currentView) {
    case 'dashboard':
      return (
        <DashboardErrorBoundary>
          <DashboardView />
        </DashboardErrorBoundary>
      );
    case 'templates':
      return (
        <TemplatesErrorBoundary>
          <TemplatesView />
        </TemplatesErrorBoundary>
      );
    // ... other views
  }
}
```

### Step 3: Wrap Modals

Add error boundaries to modal dialogs:

```tsx
import { ModalErrorBoundary, GenerationErrorBoundary } from '@/components/errors';

<ModalErrorBoundary>
  <GenerationErrorBoundary>
    <BatchGenerationModal />
  </GenerationErrorBoundary>
</ModalErrorBoundary>
```

### Step 4: Verify Error Logging

Ensure errors are logged to ErrorLogger:

```tsx
import { errorLogger } from '@/lib/errors/error-logger';

// ErrorBoundary automatically logs to errorLogger
// You can verify in browser console (development) or API logs (production)
```

## Error Recovery

### Automatic Recovery

Error boundaries automatically reset when:

1. **Route Navigation**: When user navigates to a different route
2. **Children Change**: When the component tree changes

```tsx
// Error boundary automatically resets when route changes
<ErrorBoundary>
  {currentRoute === 'dashboard' ? <DashboardView /> : <TemplatesView />}
</ErrorBoundary>
```

### Manual Recovery

Users can manually recover using:

1. **Reload Page Button**: Resets error boundary and attempts to re-render
2. **Navigate Away**: Go to a different section of the app
3. **Try Again Button**: Feature-specific boundaries provide retry option

### Recovery Best Practices

```tsx
// Provide clear recovery path
<ErrorBoundary
  fallback={(error, errorInfo, reset) => (
    <div>
      <h1>Error occurred</h1>
      <button onClick={reset}>Try Again</button>
      <button onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

## Development vs Production

### Development Mode

**Features:**
- ✅ Displays detailed error messages
- ✅ Shows full error stack trace
- ✅ Shows component stack trace
- ✅ Collapsible error details section
- ✅ Logs errors to console

**Example:**
```
Error: Failed to fetch data
  at fetchData (api.ts:42)
  at DataLoader (DataLoader.tsx:15)

Component Stack:
  at DataLoader (DataLoader.tsx:15)
  at DashboardView (DashboardView.tsx:25)
  at ErrorBoundary
```

### Production Mode

**Features:**
- ✅ Displays generic error messages
- ✅ Shows error ID for support tracking
- ✅ Hides technical details
- ✅ Logs errors to API endpoint
- ✅ User-friendly guidance

**Example:**
```
Something went wrong

We're sorry, but an unexpected error occurred.
Error ID: 8f7d2a1c-9e4b-4f8a-b3c5-6d8e2f1a9c7b

You can try:
• Reloading the page to start fresh
• Going back and trying a different action
• Reporting this issue if it persists
```

## Testing

### Unit Tests

Test error boundaries catch errors:

```tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/errors';

function ThrowError() {
  throw new Error('Test error');
}

test('ErrorBoundary catches errors', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

### Integration Tests

Test error recovery:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/errors';

test('ErrorBoundary resets on button click', () => {
  const { rerender } = render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );
  
  // Click reset button
  fireEvent.click(screen.getByText(/reload page/i));
  
  // Re-render with working component
  rerender(
    <ErrorBoundary>
      <div>Working</div>
    </ErrorBoundary>
  );
  
  expect(screen.getByText('Working')).toBeInTheDocument();
});
```

### Manual Testing

1. **Intentionally throw error** in a component:
   ```tsx
   function TestComponent() {
     throw new Error('Test error');
     return <div>Test</div>;
   }
   ```

2. **Verify fallback displays** with error details

3. **Click "Reload Page"** and verify recovery

4. **Click "Report Issue"** and verify email template

5. **Navigate between routes** and verify error boundaries reset

6. **Test feature-specific boundaries** isolate errors

7. **Verify error logging** in browser console (dev) or API logs (prod)

## Troubleshooting

### Common Issues

#### 1. Error Boundary Not Catching Errors

**Problem:** Errors are not being caught by error boundary.

**Solutions:**
- ✅ Ensure error is thrown during render phase (not in event handlers)
- ✅ Wrap component that throws error, not parent
- ✅ Check if error is thrown in async code (use try-catch)

```tsx
// ❌ Won't be caught by error boundary
function Component() {
  const handleClick = () => {
    throw new Error('Event handler error');
  };
  return <button onClick={handleClick}>Click</button>;
}

// ✅ Will be caught
function Component() {
  throw new Error('Render error');
  return <div>Component</div>;
}
```

#### 2. Error Boundary Not Resetting

**Problem:** Error boundary doesn't reset after clicking "Try Again".

**Solutions:**
- ✅ Ensure `onReset` is provided to ErrorFallback
- ✅ Change `children` prop to trigger reset
- ✅ Call `resetError()` method explicitly

#### 3. Error Details Not Showing

**Problem:** Error details not visible in development mode.

**Solutions:**
- ✅ Verify `process.env.NODE_ENV === 'development'`
- ✅ Click "Show Error Details" button to expand
- ✅ Check browser console for errors

#### 4. Error ID Not Generated

**Problem:** Error ID is missing in fallback UI.

**Solutions:**
- ✅ Ensure `crypto.randomUUID()` is available
- ✅ Check browser compatibility
- ✅ Verify error ID is passed to ErrorFallback

### Debugging Tips

1. **Check Error Logs:**
   ```tsx
   // Logs are automatically sent to errorLogger
   // Check browser console (dev) or API endpoint (prod)
   ```

2. **Enable Development Mode:**
   ```bash
   # Set environment variable
   NODE_ENV=development npm start
   ```

3. **Add Custom Logging:**
   ```tsx
   <ErrorBoundary
     onError={(error, errorInfo) => {
       console.log('Custom error handler:', error, errorInfo);
     }}
   >
     <YourComponent />
   </ErrorBoundary>
   ```

4. **Test Error Boundary:**
   ```tsx
   // Add test component that throws error
   function TestError() {
     if (window.location.hash === '#test-error') {
       throw new Error('Test error');
     }
     return null;
   }
   ```

## Best Practices

### 1. Error Boundary Placement

✅ **DO:** Wrap entire app with global error boundary  
✅ **DO:** Wrap each major feature with feature-specific boundary  
✅ **DO:** Wrap complex components that may fail  
✅ **DO:** Wrap modal dialogs to prevent full app crashes

❌ **DON'T:** Wrap every single component  
❌ **DON'T:** Use error boundaries for control flow  
❌ **DON'T:** Catch errors that should be handled in try-catch

### 2. Error Messages

✅ **DO:** Use user-friendly messages in production  
✅ **DO:** Include error ID for support tracking  
✅ **DO:** Provide clear recovery actions  
✅ **DO:** Show detailed errors in development

❌ **DON'T:** Show technical details to users  
❌ **DON'T:** Use generic "Error occurred" without context  
❌ **DON'T:** Hide error details from developers

### 3. Error Recovery

✅ **DO:** Provide "Try Again" button  
✅ **DO:** Offer alternative navigation paths  
✅ **DO:** Auto-reset on route changes  
✅ **DO:** Log errors for debugging

❌ **DON'T:** Force page reload for every error  
❌ **DON'T:** Leave users stranded without recovery options  
❌ **DON'T:** Ignore errors silently

### 4. Error Logging

✅ **DO:** Log all errors to ErrorLogger  
✅ **DO:** Include component stack trace  
✅ **DO:** Generate unique error IDs  
✅ **DO:** Send errors to monitoring service (Sentry, etc.)

❌ **DON'T:** Log sensitive user data  
❌ **DON'T:** Skip error logging in production  
❌ **DON'T:** Overwhelm logs with duplicate errors

### 5. Testing

✅ **DO:** Test error boundaries catch errors  
✅ **DO:** Test error recovery mechanisms  
✅ **DO:** Test feature isolation  
✅ **DO:** Test error logging

❌ **DON'T:** Skip error boundary tests  
❌ **DON'T:** Only test happy path  
❌ **DON'T:** Assume error boundaries work without testing

## Support

For questions or issues with error boundaries:

1. **Check Documentation**: Review this README and code comments
2. **Check Error Logs**: Review ErrorLogger output
3. **Report Issues**: Use "Report Issue" button in error fallback
4. **Contact Support**: Include error ID when reporting issues

## Related Documentation

- [Error Infrastructure](../../lib/errors/README.md) - Error classes and logging
- [Error Logger](../../lib/errors/error-logger.ts) - Error logging service
- [Error Classes](../../lib/errors/error-classes.ts) - Custom error types

## Changelog

### v1.0.0 (2025-01-16)
- ✨ Initial implementation of error boundary system
- ✨ Global and feature-specific error boundaries
- ✨ User-friendly fallback UI with recovery options
- ✨ Error logging to ErrorLogger service
- ✨ Development and production modes
- ✨ Comprehensive test coverage
- ✨ Complete documentation

