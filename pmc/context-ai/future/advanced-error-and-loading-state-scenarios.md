# Specification: Advanced Error and Loading State Scenarios for T-1.1.4 Components

## 1. Introduction & Goal

This document outlines a specification for advanced testing scenarios focused on error handling and loading states for components related to Task T-1.1.4 ("Loading and Error States Implementation"). The primary goal is to ensure robustness, resilience, and a high-quality user experience under a wider range of conditions than typically covered by basic unit tests.

This specification is intended for future implementation after the current Jest configuration fixes and foundational unit tests (Phases 1 and 2 of `active-task-unit-tests-2-version-b.md`) are successfully completed and validated.

## 2. Scope

This specification primarily applies to:
- Next.js App Router `loading.tsx` files.
- Next.js App Router `error.tsx` files.
- Custom `ErrorBoundary.tsx` components.
- Asynchronous Server Components (RSCs) like `DashboardStats.tsx` and their interaction with Suspense and error boundaries.

## 3. Rationale

Basic unit tests typically verify that loading indicators appear and error messages are displayed under straightforward conditions. Advanced scenarios are crucial for:
- Simulating real-world complexities (network latency, API failures, unexpected data).
- Ensuring graceful degradation of the user interface.
- Validating the effectiveness of error recovery mechanisms (e.g., "Try Again" buttons).
- Preventing cascading failures.
- Verifying accessibility (ARIA attributes, focus management) during loading and error states.
- Ensuring that loading and error states themselves do not introduce new UI issues (e.g., layout shifts).

## 4. Prerequisites

- Successful completion of Phases 1 and 2 as defined in `pmc/core/active-task-unit-tests-2-version-b.md`.
- A stable Jest testing environment with `jsdom`.
- Mock Service Worker (MSW) integrated and operational for mocking API responses (including delays and error statuses).
- React Testing Library for rendering components and making assertions.
- Familiarity with the T-1.1.4 components and their expected behaviors.

## 5. Proposed Advanced Scenarios

### 5.1. Advanced Loading State Scenarios

#### 5.1.1. Scenario: Simulated Network Latency
- **Description:** Test the behavior of `loading.tsx` components under simulated high network latency.
- **Components:** All `loading.tsx` files.
- **Test Steps:**
    1. Configure MSW to introduce a significant delay (e.g., 3-5 seconds) for data fetches that would trigger the `loading.tsx` via Suspense.
    2. Navigate to or render the component/route that triggers the loading state.
    3. Assert that the `loading.tsx` content is displayed correctly during the delay.
    4. Assert that the actual content replaces the loading indicator once the data resolves.
    5. (Optional) Use performance marking or similar to measure the perceived loading time.
- **Expected Outcome:**
    - Loading UI is stable and correctly displayed for the duration of the delay.
    - No premature rendering of incomplete content.
    - Content renders correctly after the delay.

#### 5.1.2. Scenario: Accessibility of Loading Indicators
- **Description:** Ensure loading indicators are accessible.
- **Components:** All `loading.tsx` files, any custom loading spinners/skeletons.
- **Test Steps:**
    1. Trigger the loading state.
    2. Inspect the DOM for appropriate ARIA attributes on loading indicators (e.g., `aria-busy="true"`, `role="status"` or `role="progressbar"`).
    3. If the loader is dynamic (e.g., spinner), ensure it doesn't cause excessive CPU usage or animation jank that could be an accessibility issue.
    4. Ensure focus management is handled correctly (e.g., focus is not lost or trapped).
- **Expected Outcome:**
    - Loading indicators meet WCAG accessibility guidelines.
    - Users with assistive technologies are properly informed about the loading state.

#### 5.1.3. Scenario: No Layout Shift During Loading
- **Description:** Verify that the appearance and disappearance of loading UIs do not cause Cumulative Layout Shift (CLS).
- **Components:** All `loading.tsx` files.
- **Test Steps:**
    1. Render the component/route in a state *before* loading is triggered. Capture initial layout metrics (if possible, or visually inspect in a controlled way).
    2. Trigger the loading state.
    3. Assert that the loading UI occupies a predictable space (e.g., using skeleton screens that match content dimensions, or ensuring the loader itself doesn't reflow content).
    4. Allow loading to complete and content to render.
    5. Assert that the transition from loading UI to content UI is smooth and does not cause surrounding elements to shift unexpectedly.
- **Expected Outcome:**
    - Minimal to zero CLS attributable to loading state transitions.
    - Consistent and stable layout for the user.

### 5.2. Advanced Error Handling Scenarios

#### 5.2.1. Scenario: Various API Error Responses
- **Description:** Test `error.tsx` and `ErrorBoundary.tsx` responses to different API error types (4xx, 5xx).
- **Components:** `error.tsx` files, `ErrorBoundary.tsx`, components making API calls (e.g., `DashboardStats.tsx`).
- **Test Steps:**
    1. Configure MSW to return different HTTP error statuses (e.g., 400, 401, 403, 404, 500, 503) for relevant API endpoints.
    2. Trigger actions that call these endpoints.
    3. Assert that the appropriate `error.tsx` or `ErrorBoundary.tsx` catches the error.
    4. Assert that user-friendly error messages are displayed (potentially varying based on error type, without exposing sensitive details).
    5. Assert that any "Try Again" functionality is present and attempts to refetch.
- **Expected Outcome:**
    - Errors are caught gracefully.
    - Users see appropriate feedback for different error conditions.
    - Recovery mechanisms function as expected.

#### 5.2.2. Scenario: Client-Side Rendering Errors
- **Description:** Test `ErrorBoundary.tsx` ability to catch errors originating from client-side component rendering logic.
- **Components:** `ErrorBoundary.tsx` and any complex client components it might wrap.
- **Test Steps:**
    1. Create a mock client component that deliberately throws an error during its render phase (e.g., `throw new Error('Client render error')`).
    2. Wrap this mock component with the `ErrorBoundary.tsx`.
    3. Render the wrapper.
    4. Assert that `ErrorBoundary.tsx` catches the error and displays its fallback UI.
    5. Test the "Try Again" functionality if applicable (though in this case, it might repeatedly fail unless the underlying cause is fixed or state is reset).
- **Expected Outcome:**
    - Client-side rendering errors are caught by the nearest `ErrorBoundary.tsx`.
    - Application does not crash; fallback UI is shown.

#### 5.2.3. Scenario: Error Logging
- **Description:** Verify that errors caught by boundaries are logged (to a mock service).
- **Components:** `error.tsx`, `ErrorBoundary.tsx`.
- **Test Steps:**
    1. Set up a mock logging service (e.g., a simple `jest.fn()`).
    2. Ensure `error.tsx` or `ErrorBoundary.tsx` are configured to call this logging service upon catching an error.
    3. Trigger an error (API or rendering).
    4. Assert that the mock logging service was called with relevant error information (error object, component stack if available).
- **Expected Outcome:**
    - Errors are reported to a logging mechanism for monitoring and debugging.

#### 5.2.4. Scenario: "Try Again" Functionality Robustness
- **Description:** Thoroughly test the "Try Again" or reset mechanism in `error.tsx` and `ErrorBoundary.tsx`.
- **Components:** `error.tsx`, `ErrorBoundary.tsx`.
- **Test Steps:**
    1. Trigger an error that displays the fallback UI with a "Try Again" button.
    2. Mock the underlying cause of the error (e.g., API endpoint via MSW) to initially fail, then succeed on a subsequent attempt.
    3. Click "Try Again".
    4. Assert that the component/data is re-attempted.
    5. Assert that upon successful re-attempt, the correct content is displayed and the error UI is dismissed.
    6. Test the scenario where "Try Again" still results in an error. Assert the error UI persists.
- **Expected Outcome:**
    - Reset/retry mechanism effectively allows users to recover from transient issues.
    - State is correctly managed during retry attempts.

#### 5.2.5. Scenario: Accessibility of Error Messages
- **Description:** Ensure error messages and error states are accessible.
- **Components:** `error.tsx` files, `ErrorBoundary.tsx`.
- **Test Steps:**
    1. Trigger an error state.
    2. Inspect the DOM for appropriate ARIA attributes on error messages (e.g., `role="alert"` for immediate announcements, or ensuring error text is associated with relevant form fields if applicable).
    3. Ensure focus is managed appropriately (e.g., moved to the error summary or the first interactive element for recovery).
- **Expected Outcome:**
    - Error states meet WCAG accessibility guidelines.
    - Users with assistive technologies are properly informed about errors and how to recover.

### 5.3. Interaction and Integration Scenarios

#### 5.3.1. Scenario: Nested Suspense Boundaries
- **Description:** Test interactions if multiple Suspense boundaries are nested, with different parts of the UI loading independently.
- **Components:** `loading.tsx`, components using `<React.Suspense>`.
- **Test Steps:**
    1. Create a test page structure with nested Suspense boundaries, each with its own async component and `loading.tsx` equivalent (or direct fallback).
    2. Simulate different loading times for the data sources of these nested components.
    3. Assert that each part of the UI displays its respective loading state independently.
    4. Assert that the overall page loads gracefully as data for each segment arrives.
- **Expected Outcome:**
    - Independent loading of UI segments.
    - Correct display of multiple loading indicators if applicable.

#### 5.3.2. Scenario: Error in one Suspense segment doesn't break others
- **Description:** Test that an error within one Suspense-managed segment is caught by its local `error.tsx` or `ErrorBoundary` without taking down other, unrelated segments of the page.
- **Components:** `error.tsx`, `ErrorBoundary.tsx`, components using `<React.Suspense>`.
- **Test Steps:**
    1. Create a test page with multiple independent sections, each wrapped in its own Suspense boundary and potentially an ErrorBoundary.
    2. Simulate an error (API or rendering) in one section.
    3. Assert that the error is caught and handled locally by that section's error UI.
    4. Assert that other sections of the page remain functional and correctly rendered.
- **Expected Outcome:**
    - Errors are isolated to their respective boundaries.
    - Page remains partially functional even if one segment encounters an error.

## 6. Tooling and Techniques

- **Mock Service Worker (MSW):** Essential for simulating API delays, various error responses (5xx, 4xx), and successful responses after retries.
- **React Testing Library (RTL):** For rendering components, interacting with them (e.g., clicking "Try Again"), and asserting on the DOM output. Key utilities: `render`, `screen`, `waitFor`, `findBy*`, `fireEvent`.
- **Jest:** Test runner, assertion library, and mocking capabilities (`jest.fn()`, `jest.spyOn()`).
- **`@testing-library/jest-dom`:** For custom DOM matchers (e.g., `toBeVisible`, `toHaveAttribute`).
- **Accessibility Testing Utilities:**
    - `jest-axe` for automated accessibility checks within tests.
- **Polyfills:** Ensure any browser APIs used (e.g., `fetch`, `TextEncoder`) are polyfilled in the JSDOM environment as needed (already partially addressed in `jest-setup-enhanced.js`).

## 7. Metrics and Success Criteria

- **Test Coverage:** Aim for high test coverage for these advanced scenarios within the relevant components.
- **Pass Rate:** All defined advanced tests should pass consistently.
- **No Regressions:** These tests, once implemented, should be part of the regular test suite to catch regressions in error/loading handling.
- **Accessibility Compliance:** Tests utilizing `jest-axe` should report no critical accessibility violations for loading and error states.
- **Qualitative Review:** For scenarios involving complex interactions or layout (like CLS), manual review might supplement automated tests.
