'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught error:', error, errorInfo);
    // TODO: Log to error tracking service (Sentry, etc.)
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} reset={this.reset} />;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-4 space-y-4">
              <p>
                An unexpected error occurred. This has been logged and we'll look into it.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto max-h-96">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              )}
              <div className="flex gap-2 mt-4">
                <Button onClick={this.reset} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error fallback for API errors
export function APIErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {isNetworkError ? 'Network Error' : 'API Error'}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          {isNetworkError 
            ? 'Unable to connect to the server. Please check your internet connection.'
            : 'There was a problem loading the data. Please try again.'}
        </p>
        <Button onClick={reset} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

// Error fallback for component-level errors
export function ComponentErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/5">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
        <div className="flex-1 space-y-2">
          <h4 className="text-sm font-semibold text-destructive">Failed to load component</h4>
          <p className="text-sm text-muted-foreground">
            An error occurred while rendering this section.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto text-destructive">
              {error.message}
            </pre>
          )}
          <Button onClick={reset} size="sm" variant="outline">
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}

