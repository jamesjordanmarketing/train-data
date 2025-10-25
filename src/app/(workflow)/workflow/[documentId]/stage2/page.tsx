import { Suspense } from 'react'
import { StepBServer } from '../../../../../components/server/StepBServer'

interface Props {
  params: {
    documentId: string
  }
}

export default function Stage2Page({ params }: Props) {
  return (
    <div className="flex min-h-screen">
      {/* Categories Column */}
      <div className="flex-1">
        <Suspense fallback={
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        }>
          <StepBServer documentId={params.documentId} />
        </Suspense>
      </div>

      {/* Category Details Panel */}
      <div className="w-96 border-l bg-muted/30">
        <Suspense fallback={
          <div className="p-6 space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-32 bg-muted rounded animate-pulse"></div>
          </div>
        }>
          {/* Category details will be loaded dynamically */}
          <div className="p-6">
            <p className="text-muted-foreground text-sm">
              Select a category to view details
            </p>
          </div>
        </Suspense>
      </div>
    </div>
  )
}