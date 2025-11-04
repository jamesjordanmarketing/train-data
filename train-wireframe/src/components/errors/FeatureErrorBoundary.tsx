'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface FeatureErrorFallbackProps {
  featureName: string;
  error: Error;
  onReset: () => void;
  alternativeRoute?: string;
}

/**
 * FeatureErrorFallback Component
 * 
 * Fallback UI for feature-specific error boundaries.
 * Displays a less alarming message than global errors since the rest of the app still works.
 * 
 * @example
 * ```tsx
 * <FeatureErrorFallback
 *   featureName="Dashboard"
 *   error={error}
 *   onReset={reset}
 *   alternativeRoute="/templates"
 * />
 * ```
 */
function FeatureErrorFallback({
  featureName,
  error,
  onReset,
  alternativeRoute = '/dashboard',
}: FeatureErrorFallbackProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(alternativeRoute);
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full shadow-md">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{featureName} Unavailable</CardTitle>
              <CardDescription className="mt-1">
                This feature encountered an error and couldn't load.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Don't worry — the rest of the application is still working. You can try reloading this feature or navigate to another area.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-3 p-2 bg-muted rounded-md">
              <p className="text-xs font-mono text-muted-foreground">
                {error.name}: {error.message}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={onReset} variant="outline" className="flex-1">
            Try Again
          </Button>
          <Button
            onClick={handleNavigate}
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * DashboardErrorBoundary
 * 
 * Isolates errors in the Dashboard view.
 * If Dashboard crashes, user can navigate to Templates or other sections.
 * 
 * @example
 * ```tsx
 * <DashboardErrorBoundary>
 *   <DashboardView />
 * </DashboardErrorBoundary>
 * ```
 */
export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <FeatureErrorFallback
          featureName="Dashboard"
          error={error}
          onReset={reset}
          alternativeRoute="/templates"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * GenerationErrorBoundary
 * 
 * Isolates errors in the Generation/Conversation features.
 * If Generation crashes, user can return to Dashboard to retry.
 * 
 * @example
 * ```tsx
 * <GenerationErrorBoundary>
 *   <BatchGenerationModal />
 * </GenerationErrorBoundary>
 * ```
 */
export function GenerationErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <FeatureErrorFallback
          featureName="Generation"
          error={error}
          onReset={reset}
          alternativeRoute="/dashboard"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * ExportErrorBoundary
 * 
 * Isolates errors in the Export features.
 * If Export crashes, user can return to Dashboard.
 * 
 * @example
 * ```tsx
 * <ExportErrorBoundary>
 *   <ExportModal />
 * </ExportErrorBoundary>
 * ```
 */
export function ExportErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <FeatureErrorFallback
          featureName="Export"
          error={error}
          onReset={reset}
          alternativeRoute="/dashboard"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * TemplatesErrorBoundary
 * 
 * Isolates errors in the Templates view.
 * If Templates crashes, user can navigate to Dashboard.
 * 
 * @example
 * ```tsx
 * <TemplatesErrorBoundary>
 *   <TemplatesView />
 * </TemplatesErrorBoundary>
 * ```
 */
export function TemplatesErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <FeatureErrorFallback
          featureName="Templates"
          error={error}
          onReset={reset}
          alternativeRoute="/dashboard"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * ReviewQueueErrorBoundary
 * 
 * Isolates errors in the Review Queue view.
 * If Review Queue crashes, user can navigate to Dashboard.
 * 
 * @example
 * ```tsx
 * <ReviewQueueErrorBoundary>
 *   <ReviewQueueView />
 * </ReviewQueueErrorBoundary>
 * ```
 */
export function ReviewQueueErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <FeatureErrorFallback
          featureName="Review Queue"
          error={error}
          onReset={reset}
          alternativeRoute="/dashboard"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * SettingsErrorBoundary
 * 
 * Isolates errors in the Settings view.
 * If Settings crashes, user can navigate to Dashboard.
 * 
 * @example
 * ```tsx
 * <SettingsErrorBoundary>
 *   <SettingsView />
 * </SettingsErrorBoundary>
 * ```
 */
export function SettingsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <FeatureErrorFallback
          featureName="Settings"
          error={error}
          onReset={reset}
          alternativeRoute="/dashboard"
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * ModalErrorBoundary
 * 
 * Isolates errors within modal dialogs.
 * If a modal crashes, it can be closed without affecting the rest of the app.
 * 
 * @example
 * ```tsx
 * <ModalErrorBoundary onReset={() => setOpen(false)}>
 *   <TemplateEditorModal />
 * </ModalErrorBoundary>
 * ```
 */
export function ModalErrorBoundary({ 
  children,
  onClose,
}: { 
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <div className="p-6">
          <Card className="max-w-md mx-auto shadow-md">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <CardTitle className="text-lg">Modal Error</CardTitle>
                  <CardDescription className="mt-1">
                    This dialog encountered an error.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please close this dialog and try again.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-3 p-2 bg-muted rounded-md">
                  <p className="text-xs font-mono text-muted-foreground">
                    {error.name}: {error.message}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                onClick={() => {
                  reset();
                  onClose?.();
                }} 
                variant="outline" 
                className="flex-1"
              >
                Close
              </Button>
              <Button onClick={reset} className="flex-1">
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

