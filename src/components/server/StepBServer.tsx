import { StepBClient } from '../client/StepBClient'
import { mockDocuments, primaryCategories as mockCategories } from '../../data/mock-data'
import { categoryService } from '../../lib/database'
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
    console.error('[StepBServer] Database error:', error)
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

async function getCategories() {
  try {
    // Load categories from database
    const categories = await categoryService.getAll()
    
    // Transform database format to match UI expectations
    const transformedCategories = categories.map(category => ({
      id: category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
      name: category.name,
      description: category.description,
      examples: category.examples || [],
      isHighValue: category.is_high_value,
      impact: category.impact_description,
      detailedDescription: category.description,
      processingStrategy: category.is_high_value ? 'Deep Analysis' : 'Standard Processing',
      businessValueClassification: category.is_high_value ? 'High Value' : 'Medium Value'
    }))
    
    // Add enhanced analytics data to categories (keep this logic for UI)
    const categoriesWithAnalytics = transformedCategories.map(category => ({
      ...category,
      usageAnalytics: {
        totalSelections: Math.floor(Math.random() * 1000) + 100,
        recentActivity: Math.floor(Math.random() * 50) + 5
      },
      valueDistribution: {
        highValue: Math.floor(Math.random() * 40) + 10,
        mediumValue: Math.floor(Math.random() * 35) + 15,
        standardValue: Math.floor(Math.random() * 30) + 20
      }
    }))
    
    console.log('Loaded categories from database:', categoriesWithAnalytics.length)
    return categoriesWithAnalytics
  } catch (error) {
    console.error('Error loading categories from database:', error)
    // Fallback to mock data in case of error
    console.log('Falling back to mock data for categories')
    const categoriesWithAnalytics = mockCategories.map(category => ({
      ...category,
      usageAnalytics: {
        totalSelections: Math.floor(Math.random() * 1000) + 100,
        recentActivity: Math.floor(Math.random() * 50) + 5
      },
      valueDistribution: {
        highValue: Math.floor(Math.random() * 40) + 10,
        mediumValue: Math.floor(Math.random() * 35) + 15,
        standardValue: Math.floor(Math.random() * 30) + 20
      }
    }))
    return categoriesWithAnalytics
  }
}

interface Props {
  documentId: string
}

export async function StepBServer({ documentId }: Props) {
  const [document, categories] = await Promise.all([
    getDocument(documentId),
    getCategories()
  ])

  return <StepBClient document={document} categories={categories} />
}
