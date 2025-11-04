# Error Boundaries - Quick Start Guide

**Get started with Error Boundaries in 5 minutes**

## Installation

Error boundaries are already integrated! No installation needed.

## Basic Usage

### 1. Protect Your Entire App

```tsx
import { ErrorBoundary } from '@/components/errors';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 2. Protect Individual Features

```tsx
import { DashboardErrorBoundary } from '@/components/errors';

function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardView />
    </DashboardErrorBoundary>
  );
}
```

### 3. Protect Modals

```tsx
import { ModalErrorBoundary } from '@/components/errors';

<Dialog open={open}>
  <ModalErrorBoundary onClose={() => setOpen(false)}>
    <DialogContent>
      <ComplexForm />
    </DialogContent>
  </ModalErrorBoundary>
</Dialog>
```

## Available Boundaries

| Boundary | Use Case |
|----------|----------|
| `ErrorBoundary` | General-purpose error catching |
| `DashboardErrorBoundary` | Dashboard view |
| `GenerationErrorBoundary` | Generation features |
| `ExportErrorBoundary` | Export features |
| `TemplatesErrorBoundary` | Templates view |
| `ReviewQueueErrorBoundary` | Review queue |
| `SettingsErrorBoundary` | Settings view |
| `ModalErrorBoundary` | Modal dialogs |

## Custom Fallback

```tsx
<ErrorBoundary
  fallback={(error, errorInfo, reset) => (
    <div>
      <h1>Oops!</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

## Error Recovery

Users can recover from errors by:
- ✅ Clicking "Reload Page" button
- ✅ Navigating to a different page
- ✅ Clicking "Try Again" (feature boundaries)

Error boundaries **automatically reset** when:
- ✅ User navigates to a different route
- ✅ The component tree changes

## Development vs Production

### Development Mode
- Shows detailed error messages
- Displays full stack traces
- Collapsible error details
- Console logging

### Production Mode
- Generic error messages
- Error ID for support
- User-friendly guidance
- API logging

## Testing

### Manual Test

1. Add this component to test error boundary:
```tsx
function TestError() {
  if (window.location.hash === '#test-error') {
    throw new Error('Test error!');
  }
  return null;
}
```

2. Navigate to `/#test-error` to trigger error
3. Verify fallback UI displays
4. Click "Reload Page" to recover
5. Navigate away to clear error

### Unit Test

```tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/errors';

function ThrowError() {
  throw new Error('Test error');
}

test('catches errors', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

## Common Patterns

### Nested Boundaries

```tsx
<ErrorBoundary>
  <AppLayout>
    <DashboardErrorBoundary>
      <Dashboard />
    </DashboardErrorBoundary>
  </AppLayout>
</ErrorBoundary>
```

### With Custom Error Handler

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to analytics
    analytics.track('error', { error: error.message });
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Multiple Recovery Options

```tsx
<ErrorBoundary
  fallback={(error, errorInfo, reset) => (
    <div>
      <h1>Error</h1>
      <button onClick={reset}>Retry</button>
      <button onClick={() => router.push('/dashboard')}>
        Go Home
      </button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

## Troubleshooting

### Error Not Caught?

Error boundaries **only catch** errors:
- ✅ During render
- ✅ In lifecycle methods
- ✅ In constructors

Error boundaries **do NOT catch** errors:
- ❌ In event handlers
- ❌ In async code (promises, setTimeout)
- ❌ During server-side rendering

**Solution:** Use try-catch for event handlers and async code:

```tsx
// ❌ Not caught by error boundary
function Component() {
  const handleClick = () => {
    throw new Error('Click error');
  };
  return <button onClick={handleClick}>Click</button>;
}

// ✅ Properly handled
function Component() {
  const handleClick = () => {
    try {
      // risky code
    } catch (error) {
      console.error(error);
    }
  };
  return <button onClick={handleClick}>Click</button>;
}
```

### Error Details Not Showing?

1. Check if in development mode: `process.env.NODE_ENV === 'development'`
2. Click "Show Error Details" button to expand
3. Check browser console for errors

### Error Boundary Not Resetting?

1. Ensure `onReset` is called
2. Change the `children` prop to trigger reset
3. Navigate to a different route (auto-resets)

## Best Practices

✅ **DO:**
- Wrap entire app with global error boundary
- Use feature-specific boundaries for isolation
- Provide clear recovery options
- Log errors for debugging

❌ **DON'T:**
- Wrap every single component
- Use error boundaries for control flow
- Show technical errors to users
- Ignore errors silently

## Next Steps

1. ✅ Error boundaries are already integrated in App.tsx
2. ✅ Test by navigating to `/#test-error`
3. ✅ Customize error messages as needed
4. ✅ Monitor error logs in production

## Need More Help?

- 📖 [Full Documentation](./README.md)
- 🧪 [Testing Guide](./README.md#testing)
- 🐛 [Troubleshooting](./README.md#troubleshooting)
- 📝 [Implementation Details](./IMPLEMENTATION_SUMMARY.md)

## Examples

### Example 1: Simple Protection

```tsx
import { ErrorBoundary } from '@/components/errors';

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### Example 2: Dashboard with Recovery

```tsx
import { DashboardErrorBoundary } from '@/components/errors';

<DashboardErrorBoundary>
  <DashboardView />
</DashboardErrorBoundary>
```

### Example 3: Modal with Close Handler

```tsx
import { ModalErrorBoundary } from '@/components/errors';

<Dialog open={open} onOpenChange={setOpen}>
  <ModalErrorBoundary onClose={() => setOpen(false)}>
    <ComplexModalContent />
  </ModalErrorBoundary>
</Dialog>
```

### Example 4: Custom Fallback

```tsx
<ErrorBoundary
  fallback={(error, errorInfo, reset) => (
    <Card>
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{error.message}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={reset}>Try Again</Button>
      </CardFooter>
    </Card>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

## That's It! 🎉

You're ready to use error boundaries. They're already integrated and protecting your app.

**Questions?** Check the [full documentation](./README.md) or open an issue.

