import { StepAClient } from '../client/StepAClient'
import { mockDocuments } from '../../data/mock-data'
import { createServerSupabaseClientWithAuth } from '../../lib/supabase-server'

async function getDocument(documentId: string) {
  // First, try to fetch from Supabase
  const supabase = await createServerSupabaseClientWithAuth()
  
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()
  
  if (error) {
    console.error('[StepAServer] Database error:', error)
    // Fallback to mock data for seed documents
    const mockDoc = mockDocuments.find(doc => doc.id === documentId)
    if (mockDoc) {
      return mockDoc
    }
    throw new Error('Document not found')
  }
  
  if (!document) {
    throw new Error('Document not found')
  }
  
  // Transform database document to match expected format
  // Map upload status to workflow status
  let workflowStatus: 'pending' | 'categorizing' | 'completed' = 'pending';
  if (document.status === 'categorizing') {
    workflowStatus = 'categorizing';
  } else if (document.status === 'completed' && document.workflow_status === 'completed') {
    workflowStatus = 'completed';
  }
  
  return {
    id: document.id,
    title: document.title,
    content: document.extracted_text || document.content || '',
    summary: document.summary || '',
    createdAt: document.created_at,
    authorId: document.author_id,
    status: workflowStatus,
  }
}

interface Props {
  documentId: string
}

export async function StepAServer({ documentId }: Props) {
  const document = await getDocument(documentId)

  return <StepAClient document={document} />
}