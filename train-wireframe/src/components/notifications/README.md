# Notification Components

Error-specific toast components for the Training Data Generation platform. Provides specialized toast designs for different error scenarios with appropriate styling, icons, and actions.

## Components

### RateLimitToast

Toast notification for rate limit errors with countdown timer and retry button.

**Features:**
- ⏱️ Countdown timer showing seconds until retry is available
- 🔄 Retry button appears when countdown reaches zero
- 🎨 Warning color scheme (orange/yellow)
- ♿ Accessible with ARIA labels

**Usage:**
```typescript
import { RateLimitToast } from '@/components/notifications';
import { notificationManager } from '@/lib/notifications';

notificationManager.custom(
  <RateLimitToast
    retryAfterSeconds={30}
    onRetry={() => retryRequest()}
  />
);
```

**Props:**
- `retryAfterSeconds: number` - Number of seconds to wait before retry
- `onRetry?: () => void` - Callback when retry button is clicked

### NetworkErrorToast

Toast notification for network-related errors with retry functionality.

**Features:**
- 📡 Network-specific icon (wifi off)
- 🔄 Retry button for recoverable errors
- 🔴 Destructive color scheme (red)
- ♿ Accessible with assertive announcements

**Usage:**
```typescript
import { NetworkErrorToast } from '@/components/notifications';
import { notificationManager } from '@/lib/notifications';

notificationManager.custom(
  <NetworkErrorToast
    message="Failed to connect to server"
    onRetry={() => retryConnection()}
  />
);
```

**Props:**
- `message: string` - User-friendly error message
- `onRetry?: () => void` - Optional callback for retry button

### ValidationErrorToast

Toast notification for validation errors with field-level error details.

**Features:**
- 📝 List of field-specific validation errors
- ⚠️ Alert icon
- 🔴 Destructive color scheme (red)
- ♿ Accessible error list

**Usage:**
```typescript
import { ValidationErrorToast } from '@/components/notifications';
import { notificationManager } from '@/lib/notifications';

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

**Props:**
- `message: string` - Main error message
- `errors?: Record<string, string>` - Field-specific validation errors

### GenerationErrorToast

Toast notification for AI generation errors with error code and details link.

**Features:**
- ⚡ Generation-specific icon (lightning bolt)
- 🏷️ Error code display for troubleshooting
- 🔗 "View Details" link to error modal
- 🟠 Warning color scheme (orange/yellow)
- ♿ Accessible links

**Usage:**
```typescript
import { GenerationErrorToast } from '@/components/notifications';
import { notificationManager } from '@/lib/notifications';

notificationManager.custom(
  <GenerationErrorToast
    message="Failed to generate conversation"
    errorCode="ERR_GEN_TOKEN_LIMIT"
    onViewDetails={() => openErrorModal()}
  />
);
```

**Props:**
- `message: string` - User-friendly error message
- `errorCode?: string` - Optional error code for troubleshooting
- `onViewDetails?: () => void` - Callback to open error details modal

## Usage Examples

### Example 1: Rate Limit with Retry

```typescript
import { RateLimitToast } from '@/components/notifications';
import { notificationManager } from '@/lib/notifications';

async function handleRateLimit(error: APIError) {
  const retryAfter = error.retryAfter || 30; // seconds
  
  notificationManager.custom(
    <RateLimitToast
      retryAfterSeconds={retryAfter}
      onRetry={async () => {
        // Dismiss toast
        notificationManager.dismissAll();
        // Retry operation
        await retryRequest();
      }}
    />
  );
}
```

### Example 2: Network Error with Exponential Backoff

```typescript
import { NetworkErrorToast } from '@/components/notifications';
import { notificationManager } from '@/lib/notifications';

let retryCount = 0;
const maxRetries = 3;

async function fetchWithRetry() {
  try {
    return await apiClient.get('/data');
  } catch (error) {
    if (error.code === 'ERR_NET_TIMEOUT' && retryCount < maxRetries) {
      notificationManager.custom(
        <NetworkErrorToast
          message={`Request timed out (Attempt ${retryCount + 1}/${maxRetries})`}
          onRetry={() => {
            retryCount++;
            fetchWithRetry();
          }}
        />
      );
    } else {
      notificationManager.showError(error);
    }
  }
}
```

### Example 3: Form Validation

```typescript
import { ValidationErrorToast } from '@/components/notifications';
import { notificationManager } from '@/lib/notifications';
import { ValidationError } from '@/lib/errors';

function handleFormSubmit(data: FormData) {
  try {
    validateForm(data);
    // Submit form...
  } catch (error) {
    if (error instanceof ValidationError) {
      notificationManager.custom(
        <ValidationErrorToast
          message="Please correct the following errors"
          errors={error.validationErrors}
        />
      );
    }
  }
}
```

### Example 4: Generation Error with Details Modal

```typescript
import { GenerationErrorToast } from '@/components/notifications';
import { ErrorDetailsModal } from '@/components/errors';
import { notificationManager } from '@/lib/notifications';
import { useState } from 'react';

function GenerationComponent() {
  const [errorState, setErrorState] = useState<{
    error: Error | null;
    showModal: boolean;
  }>({ error: null, showModal: false });

  async function generateConversation() {
    try {
      await apiClient.generateConversation(params);
    } catch (error) {
      setErrorState({ error, showModal: false });
      
      notificationManager.custom(
        <GenerationErrorToast
          message={error.getUserMessage()}
          errorCode={error.code}
          onViewDetails={() => {
            setErrorState(prev => ({ ...prev, showModal: true }));
          }}
        />
      );
    }
  }

  return (
    <>
      {/* Your component UI */}
      
      <ErrorDetailsModal
        isOpen={errorState.showModal}
        onClose={() => setErrorState(prev => ({ ...prev, showModal: false }))}
        error={errorState.error}
      />
    </>
  );
}
```

## Styling

All toast components use consistent styling from the design system:

### Color Schemes

| Component | Background | Icon Color | Use Case |
|-----------|-----------|------------|----------|
| RateLimitToast | `bg-warning/10` | `text-warning` | Rate limits, temporary blocks |
| NetworkErrorToast | `bg-destructive/10` | `text-destructive` | Network failures, timeouts |
| ValidationErrorToast | `bg-destructive/10` | `text-destructive` | Form validation, input errors |
| GenerationErrorToast | `bg-warning/10` | `text-warning` | AI generation failures |

### Icons

| Component | Icon | Library |
|-----------|------|---------|
| RateLimitToast | Clock | lucide-react |
| NetworkErrorToast | WifiOff | lucide-react |
| ValidationErrorToast | AlertCircle | lucide-react |
| GenerationErrorToast | Zap | lucide-react |

## Accessibility

### ARIA Attributes

All components include proper ARIA attributes:

```typescript
<div
  role="alert"
  aria-live="assertive"  // or "polite" for less critical
  aria-atomic="true"
>
  {/* Toast content */}
</div>
```

### Screen Reader Support

- **Assertive announcements** for errors (NetworkErrorToast, ValidationErrorToast, GenerationErrorToast)
- **Polite announcements** for rate limits (RateLimitToast)
- **Descriptive button labels** for all action buttons
- **Icon labels** marked with `aria-hidden="true"`

### Keyboard Navigation

- All action buttons are keyboard accessible
- Links and buttons have proper focus indicators
- Modal interactions follow focus management best practices

## Testing

Each component has comprehensive tests covering:

- ✅ Rendering with required props
- ✅ Conditional rendering (retry buttons, error lists)
- ✅ User interactions (button clicks, countdown timer)
- ✅ Accessibility (ARIA labels, roles)
- ✅ Edge cases (long messages, empty errors)

Run tests:
```bash
npm test src/components/notifications
```

## Best Practices

### 1. Choose the Right Component

```typescript
// ✅ Good - Use RateLimitToast for 429 errors
if (error.code === 'ERR_API_RATE_LIMIT') {
  return <RateLimitToast retryAfterSeconds={30} onRetry={retry} />;
}

// ❌ Bad - Using generic error toast for rate limit
showError('Rate limit exceeded. Try again later.');
```

### 2. Provide Meaningful Messages

```typescript
// ✅ Good - Clear, actionable message
<NetworkErrorToast
  message="Failed to connect to server. Please check your internet connection."
  onRetry={retry}
/>

// ❌ Bad - Vague message
<NetworkErrorToast message="Error" onRetry={retry} />
```

### 3. Always Provide Retry Actions

```typescript
// ✅ Good - Recoverable error with retry
<NetworkErrorToast
  message="Connection timeout"
  onRetry={() => retryConnection()}
/>

// ⚠️ Acceptable - Non-recoverable error without retry
<NetworkErrorToast message="Server is offline" />
```

### 4. Include Error Codes for Technical Errors

```typescript
// ✅ Good - Error code helps with support
<GenerationErrorToast
  message="Failed to generate conversation"
  errorCode="ERR_GEN_TOKEN_LIMIT"
  onViewDetails={openDetails}
/>

// ❌ Bad - Missing error code for troubleshooting
<GenerationErrorToast
  message="Failed to generate conversation"
  onViewDetails={openDetails}
/>
```

### 5. Link to Error Details for Complex Errors

```typescript
// ✅ Good - Provide way to see full details
<GenerationErrorToast
  message={error.getUserMessage()}
  errorCode={error.code}
  onViewDetails={() => openErrorModal(error)}
/>

// ❌ Bad - No way to get more information
<GenerationErrorToast
  message={error.getUserMessage()}
  errorCode={error.code}
/>
```

## Component API Reference

### RateLimitToast Props

```typescript
interface RateLimitToastProps {
  /** Number of seconds to wait before retry is available */
  retryAfterSeconds: number;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
}
```

### NetworkErrorToast Props

```typescript
interface NetworkErrorToastProps {
  /** User-friendly error message */
  message: string;
  /** Optional callback when retry button is clicked */
  onRetry?: () => void;
}
```

### ValidationErrorToast Props

```typescript
interface ValidationErrorToastProps {
  /** Main error message */
  message: string;
  /** Field-specific validation errors */
  errors?: Record<string, string>;
}
```

### GenerationErrorToast Props

```typescript
interface GenerationErrorToastProps {
  /** User-friendly error message */
  message: string;
  /** Optional error code for troubleshooting */
  errorCode?: string;
  /** Callback to open error details modal */
  onViewDetails?: () => void;
}
```

## Related Documentation

- [Notification Manager](../../lib/notifications/README.md)
- [Error Handling System](../../lib/errors/README.md)
- [Error Details Modal](../errors/README.md)

