import Link from 'next/link'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}