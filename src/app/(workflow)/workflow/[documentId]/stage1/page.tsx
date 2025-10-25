import { Suspense } from 'react'
import { StepAServer } from '../../../../../components/server/StepAServer'

interface Props {
  params: {
    documentId: string
  }
}

export default function Stage1Page({ params }: Props) {
  return (
    <div className="container mx-auto px-6 py-8">
      <Suspense fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      }>
        <StepAServer documentId={params.documentId} />
      </Suspense>
    </div>
  )
}