import { Suspense } from 'react'
import { WorkflowCompleteServer } from '../../../../../components/server/WorkflowCompleteServer'

interface Props {
  params: {
    documentId: string
  }
  searchParams: {
    workflowId?: string
  }
}

export default function CompletePage({ params, searchParams }: Props) {
  return (
    <div className="container mx-auto px-6 py-8">
      <Suspense fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-20 bg-muted rounded-full w-20 mx-auto"></div>
          <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      }>
        <WorkflowCompleteServer 
          documentId={params.documentId}
          workflowId={searchParams.workflowId}
        />
      </Suspense>
    </div>
  )
}