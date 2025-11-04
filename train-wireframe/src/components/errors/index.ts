/**
 * Error Boundary Components
 * 
 * React Error Boundaries for catching and handling component errors gracefully.
 * 
 * ## Components
 * 
 * ### Base Components
 * - `ErrorBoundary`: Base error boundary class component
 * - `ErrorFallback`: Default fallback UI component
 * 
 * ### Feature-Specific Boundaries
 * - `DashboardErrorBoundary`: Isolates Dashboard view errors
 * - `GenerationErrorBoundary`: Isolates Generation/Conversation errors
 * - `ExportErrorBoundary`: Isolates Export feature errors
 * - `TemplatesErrorBoundary`: Isolates Templates view errors
 * - `ReviewQueueErrorBoundary`: Isolates Review Queue view errors
 * - `SettingsErrorBoundary`: Isolates Settings view errors
 * - `ModalErrorBoundary`: Isolates modal dialog errors
 * 
 * ## Usage
 * 
 * ### Global Error Boundary
 * Wrap your entire app to catch all unhandled errors:
 * 
 * ```tsx
 * import { ErrorBoundary } from '@/components/errors';
 * 
 * function App() {
 *   return (
 *     <ErrorBoundary>
 *       <YourApp />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 * 
 * ### Feature-Specific Error Boundaries
 * Wrap individual features to isolate errors:
 * 
 * ```tsx
 * import { DashboardErrorBoundary } from '@/components/errors';
 * 
 * function DashboardPage() {
 *   return (
 *     <DashboardErrorBoundary>
 *       <DashboardView />
 *     </DashboardErrorBoundary>
 *   );
 * }
 * ```
 * 
 * ### Custom Fallback
 * Provide a custom fallback UI:
 * 
 * ```tsx
 * import { ErrorBoundary } from '@/components/errors';
 * 
 * <ErrorBoundary
 *   fallback={(error, errorInfo, reset) => (
 *     <div>
 *       <h1>Oops!</h1>
 *       <button onClick={reset}>Try Again</button>
 *     </div>
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 * 
 * ### Modal Error Boundaries
 * Wrap modals to prevent errors from crashing the app:
 * 
 * ```tsx
 * import { ModalErrorBoundary } from '@/components/errors';
 * 
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <ModalErrorBoundary onClose={() => setOpen(false)}>
 *     <DialogContent>
 *       <ComplexModalContent />
 *     </DialogContent>
 *   </ModalErrorBoundary>
 * </Dialog>
 * ```
 * 
 * ## Features
 * 
 * - ✅ Catches all unhandled React errors in children
 * - ✅ Displays user-friendly fallback UI with recovery options
 * - ✅ Logs errors to ErrorLogger with component stack trace
 * - ✅ Generates unique error ID for support tracking
 * - ✅ Development mode shows detailed error information
 * - ✅ Production mode shows generic error message
 * - ✅ Automatic error boundary reset on route navigation
 * - ✅ Feature-specific boundaries isolate errors to sections
 * - ✅ "Reload Page" and "Report Issue" recovery actions
 * 
 * @module errors
 */

// Export base components
export { ErrorBoundary } from './ErrorBoundary';
export { ErrorFallback } from './ErrorFallback';
export { ErrorDetailsModal } from './ErrorDetailsModal';

// Export feature-specific boundaries
export {
  DashboardErrorBoundary,
  GenerationErrorBoundary,
  ExportErrorBoundary,
  TemplatesErrorBoundary,
  ReviewQueueErrorBoundary,
  SettingsErrorBoundary,
  ModalErrorBoundary,
} from './FeatureErrorBoundary';

