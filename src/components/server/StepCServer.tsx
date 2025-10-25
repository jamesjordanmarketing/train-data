import { StepCClient } from '../client/StepCClient'
import { mockDocuments, tagDimensions, mockTagSuggestions } from '../../data/mock-data'
import { tagService } from '../../lib/database'
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
    console.error('[StepCServer] Database error:', error)
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

async function getTagDimensions() {
  try {
    // Load tag dimensions from database with nested tags
    const dimensions = await tagService.getDimensions()
    
    // Transform database format to match UI expectations
    const transformedDimensions = dimensions.map(dimension => ({
      id: dimension.name.toLowerCase().replace(/ /g, '-'),
      name: dimension.name,
      description: dimension.description,
      multiSelect: dimension.multi_select,
      required: dimension.required,
      tags: dimension.tags?.map(tag => ({
        id: tag.name.toLowerCase().replace(/ - /g, '-').replace(/ /g, '-').replace(/\//g, '-'),
        name: tag.name,
        description: tag.description,
        icon: tag.icon,
        riskLevel: tag.risk_level
      })) || []
    }))
    
    console.log('Loaded tag dimensions from database:', transformedDimensions.length)
    return transformedDimensions
  } catch (error) {
    console.error('Error loading tag dimensions from database:', error)
    // Fallback to mock data in case of error
    console.log('Falling back to mock data for tag dimensions')
    return tagDimensions
  }
}

async function getTagSuggestions(categoryId?: string) {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (categoryId && mockTagSuggestions[categoryId as keyof typeof mockTagSuggestions]) {
    return mockTagSuggestions[categoryId as keyof typeof mockTagSuggestions]
  }
  
  return null
}

interface Props {
  documentId: string
}

export async function StepCServer({ documentId }: Props) {
  const document = await getDocument(documentId)
  const dimensions = await getTagDimensions()
  
  // In a real app, you'd get the selected category from the workflow state
  // For now, we'll pass null and let the client component handle it
  const suggestions = null
  
  return (
    <StepCClient 
      document={document} 
      tagDimensions={dimensions}
      suggestions={suggestions}
    />
  )
}
