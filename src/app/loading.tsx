export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Loading...</h3>
          <p className="text-muted-foreground">Please wait while we prepare your content</p>
        </div>
      </div>
    </div>
  )
}