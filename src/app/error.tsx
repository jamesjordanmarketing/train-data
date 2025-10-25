'use client'

import { useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Something went wrong!</h2>
            <p className="text-muted-foreground">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </p>
          </div>

          <div className="text-left bg-muted p-4 rounded text-xs overflow-auto max-h-40">
            <div className="font-semibold mb-2">Error Details:</div>
            <code className="whitespace-pre-wrap break-words">{error.message}</code>
            {error.digest && (
              <div className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={reset} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}