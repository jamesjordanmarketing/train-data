# Notification System

Centralized notification management for the Training Data Generation platform. Provides toast notifications with error-specific handling, deduplication, and action buttons.

## Features

- ✅ **Singleton Pattern** - Consistent notification state across the application
- ✅ **Deduplication** - Prevents duplicate toasts within 5-second window
- ✅ **Error-Specific Handling** - Different styling and duration based on error type
- ✅ **Action Buttons** - Support for Retry, View Details, and custom actions
- ✅ **Automatic Duration** - Smart duration based on error severity
- ✅ **Integration with Error System** - Works seamlessly with AppError classes
- ✅ **Accessibility** - ARIA labels and screen reader support
- ✅ **Custom Toast Components** - Specialized toasts for different scenarios

## Quick Start

### Basic Usage

```typescript
import { showSuccess, showError, showWarning, showInfo } from '@/lib/notifications';

// Success notification
showSuccess('Conversation generated successfully!');

// Error notification
showError('Failed to connect to server');

// Warning notification
showWarning('Generation may take longer than usual');

// Info notification
showInfo('Processing your request...');
```

### Advanced Usage with NotificationManager

```typescript
import { notificationManager } from '@/lib/notifications';

// Success with custom duration
notificationManager.success('Operation completed', {
  duration: 2000, // 2 seconds
});

// Success with action button
notificationManager.success('File uploaded', {
  action: {
    label: 'View',
    onClick: () => openFile(),
  },
});

// Error with description
notificationManager.error('Upload failed', {
  description: 'The file size exceeds the maximum allowed.',
});
```

### Error-Specific Handling

The notification manager automatically determines the appropriate duration and styling based on error type:

```typescript
import { notificationManager } from '@/lib/notifications';
import { AppError, ErrorCode } from '@/lib/errors';

// Temporary error (auto-dismiss after 5 seconds)
const networkError = new AppError(
  'Connection timeout',
  ErrorCode.ERR_NET_TIMEOUT,
  { isRecoverable: true }
);
notificationManager.showError(networkError);

// Permanent error (requires manual dismissal)
const validationError = new AppError(
  'Invalid input',
  ErrorCode.ERR_VAL_REQUIRED,
  { isRecoverable: false }
);
notificationManager.showError(validationError);
```

### Error with Retry Button

```typescript
import { notificationManager } from '@/lib/notifications';

notificationManager.showError(error, {
  onRetry: () => {
    // Retry the failed operation
    retryGeneration();
  },
});
```

### Error with View Details Button

```typescript
import { notificationManager } from '@/lib/notifications';

notificationManager.showError(error, {
  onViewDetails: () => {
    // Open error details modal
    setShowErrorModal(true);
  },
});
```

## Custom Toast Components

For specialized scenarios, use custom toast components with the notification manager:

### Rate Limit Toast

```typescript
import { notificationManager } from '@/lib/notifications';
import { RateLimitToast } from '@/components/notifications';

// Show rate limit toast with countdown
notificationManager.custom(
  <RateLimitToast
    retryAfterSeconds={30}
    onRetry={() => retryRequest()}
  />
);
```

### Network Error Toast

```typescript
import { notificationManager } from '@/lib/notifications';
import { NetworkErrorToast } from '@/components/notifications';

notificationManager.custom(
  <NetworkErrorToast
    message="Failed to connect to server"
    onRetry={() => retryConnection()}
  />
);
```

### Validation Error Toast

```typescript
import { notificationManager } from '@/lib/notifications';
import { ValidationErrorToast } from '@/components/notifications';

notificationManager.custom(
  <ValidationErrorToast
    message="Please correct the following errors"
    errors={{
      email: "Email is required",
      password: "Password must be at least 8 characters"
    }}
  />
);
```

### Generation Error Toast

```typescript
import { notificationManager } from '@/lib/notifications';
import { GenerationErrorToast } from '@/components/notifications';

notificationManager.custom(
  <GenerationErrorToast
    message="Failed to generate conversation"
    errorCode="ERR_GEN_TOKEN_LIMIT"
    onViewDetails={() => openErrorModal()}
  />
);
```

## API Reference

### NotificationManager

#### Methods

##### `success(message: string, options?: NotificationOptions): void`

Show success toast with green styling. Auto-dismisses after 4 seconds by default.

**Parameters:**
- `message` - Success message to display
- `options` - Optional configuration
  - `duration` - Duration in milliseconds (default: 4000)
  - `description` - Additional description text
  - `action` - Action button configuration

**Example:**
```typescript
notificationManager.success('Saved successfully', {
  action: {
    label: 'Undo',
    onClick: () => undo(),
  },
});
```

##### `error(error: Error | AppError | string, options?: NotificationOptions): void`

Show error toast with red styling. Duration is automatic based on error type:
- Retryable errors: 5 seconds (auto-dismiss)
- Permanent errors: 0 (persistent, requires manual dismissal)

**Parameters:**
- `error` - Error object or message string
- `options` - Optional configuration

**Example:**
```typescript
notificationManager.error('Operation failed', {
  description: 'Check your internet connection',
});
```

##### `showError(error: Error | AppError | unknown, options?: NotificationOptions & { onRetry?: () => void; onViewDetails?: () => void }): void`

Show error toast with automatic action buttons. Adds Retry button for retryable errors, or View Details button if callback provided.

**Parameters:**
- `error` - Error object
- `options` - Optional configuration
  - `onRetry` - Callback for retry action
  - `onViewDetails` - Callback for view details action

**Example:**
```typescript
notificationManager.showError(error, {
  onRetry: () => retryOperation(),
  onViewDetails: () => openErrorModal(error),
});
```

##### `warning(message: string, options?: NotificationOptions): void`

Show warning toast with orange/yellow styling. Auto-dismisses after 5 seconds by default.

##### `info(message: string, options?: NotificationOptions): void`

Show info toast with blue styling. Auto-dismisses after 4 seconds by default.

##### `custom(component: React.ReactNode, options?: { duration?: number }): void`

Show custom toast component. Use for specialized toast designs.

**Parameters:**
- `component` - Custom React component
- `options` - Optional configuration
  - `duration` - Duration in milliseconds (default: 0 for persistent)

##### `dismissAll(): void`

Dismiss all active toasts. Useful for cleanup on navigation.

##### `clearCache(): void`

Clear deduplication cache. Allows immediate re-display of previously shown messages.

### NotificationOptions

```typescript
interface NotificationOptions {
  duration?: number;          // Duration in ms, 0 for persistent
  action?: {
    label: string;            // Action button label
    onClick: () => void;      // Action button callback
  };
  description?: string;       // Additional description
  important?: boolean;        // Mark as important (future use)
}
```

## Deduplication

The notification manager prevents duplicate toasts from appearing within a 5-second window:

```typescript
// First call - toast shows
showSuccess('Operation completed');

// Second call within 5 seconds - suppressed
showSuccess('Operation completed');

// After 5 seconds - toast shows again
setTimeout(() => {
  showSuccess('Operation completed');
}, 5001);
```

## Integration with Error System

The notification manager integrates seamlessly with the error handling system:

```typescript
import { notificationManager } from '@/lib/notifications';
import { AppError, ErrorCode } from '@/lib/errors';

try {
  await generateConversation();
} catch (error) {
  // Automatic message extraction, duration, and retry handling
  notificationManager.showError(error, {
    onRetry: () => retryGeneration(),
  });
}
```

## Duration Guidelines

| Error Type | Duration | Behavior |
|------------|----------|----------|
| Success | 4 seconds | Auto-dismiss |
| Info | 4 seconds | Auto-dismiss |
| Warning | 5 seconds | Auto-dismiss |
| Temporary Error | 5 seconds | Auto-dismiss |
| Permanent Error | 0 (persistent) | Manual dismiss |
| Custom | 0 (persistent) | Manual dismiss |

## Accessibility

All toast notifications include:

- **ARIA labels** - Proper role and aria-live regions
- **Screen reader announcements** - Errors are announced assertively
- **Keyboard navigation** - Action buttons are keyboard accessible
- **Color contrast** - Meets WCAG AA standards
- **Focus management** - Proper focus handling for modals

## Best Practices

### 1. Use Appropriate Toast Types

```typescript
// ✅ Good - Clear success message
showSuccess('Conversation generated successfully');

// ❌ Bad - Generic message
showSuccess('Done');
```

### 2. Provide Actionable Messages

```typescript
// ✅ Good - Explains what happened and what to do
showError('Failed to save. Please check your connection and try again.');

// ❌ Bad - Vague message
showError('Error');
```

### 3. Use Error-Specific Toasts

```typescript
// ✅ Good - Use specialized toast for rate limits
notificationManager.custom(
  <RateLimitToast retryAfterSeconds={30} onRetry={retry} />
);

// ❌ Bad - Generic error toast for rate limit
showError('Rate limit exceeded');
```

### 4. Add Retry Actions for Recoverable Errors

```typescript
// ✅ Good - Provide retry action
notificationManager.showError(error, {
  onRetry: () => retryOperation(),
});

// ❌ Bad - No way to recover
notificationManager.showError(error);
```

### 5. Avoid Toast Spam

```typescript
// ✅ Good - Deduplication handles this automatically
for (let i = 0; i < 5; i++) {
  showSuccess('Saved'); // Only shows once
}

// ✅ Good - Batch operations, single toast
const results = await Promise.all(operations);
showSuccess(`${results.length} items processed successfully`);
```

## Examples

### Example 1: Form Validation Errors

```typescript
import { ValidationErrorToast } from '@/components/notifications';
import { notificationManager } from '@/lib/notifications';

function handleSubmit(data) {
  const errors = validateForm(data);
  
  if (Object.keys(errors).length > 0) {
    notificationManager.custom(
      <ValidationErrorToast
        message="Please correct the following errors"
        errors={errors}
      />
    );
    return;
  }
  
  // Submit form...
}
```

### Example 2: API Error Handling

```typescript
import { notificationManager } from '@/lib/notifications';
import { RateLimitToast, NetworkErrorToast } from '@/components/notifications';

async function fetchData() {
  try {
    const response = await apiClient.get('/data');
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_API_RATE_LIMIT') {
      notificationManager.custom(
        <RateLimitToast
          retryAfterSeconds={error.retryAfter || 30}
          onRetry={() => fetchData()}
        />
      );
    } else if (error.code === 'ERR_NET_TIMEOUT') {
      notificationManager.custom(
        <NetworkErrorToast
          message="Request timed out"
          onRetry={() => fetchData()}
        />
      );
    } else {
      notificationManager.showError(error, {
        onViewDetails: () => openErrorDetails(error),
      });
    }
  }
}
```

### Example 3: Generation Error with Details

```typescript
import { notificationManager } from '@/lib/notifications';
import { GenerationErrorToast } from '@/components/notifications';
import { ErrorDetailsModal } from '@/components/errors';

function handleGenerationError(error) {
  notificationManager.custom(
    <GenerationErrorToast
      message={error.getUserMessage()}
      errorCode={error.code}
      onViewDetails={() => setShowErrorModal(true)}
    />
  );
}

// In component
const [showErrorModal, setShowErrorModal] = useState(false);

<ErrorDetailsModal
  isOpen={showErrorModal}
  onClose={() => setShowErrorModal(false)}
  error={error}
  errorId={errorId}
/>
```

## Testing

Tests are located in `__tests__/manager.test.ts` and cover:

- ✅ Singleton pattern
- ✅ Success, error, warning, info notifications
- ✅ Deduplication logic
- ✅ Error-specific duration handling
- ✅ Action button integration
- ✅ Custom toast components
- ✅ Cache management

Run tests:
```bash
npm test src/lib/notifications
```

## Related Documentation

- [Error Handling System](../errors/README.md)
- [Error Details Modal](../../components/errors/README.md)
- [Custom Toast Components](../../components/notifications/README.md)
- [Sonner Documentation](https://sonner.emilkowal.ski/)

