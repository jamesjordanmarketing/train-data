import { DocumentSelectorClient } from '../client/DocumentSelectorClient'
import { mockDocuments } from '../../data/mock-data'
import { documentService, chunkService } from '../../lib/database'

async function getDocuments() {
  try {
    // Try to fetch from database
    const documents = await documentService.getAll()
    
    // Get chunk status for each completed document
    const documentsWithChunkStatus = await Promise.all(
      documents.map(async (doc) => {
        let hasChunks = false
        let chunkCount = 0
        
        if (doc.status === 'completed') {
          try {
            chunkCount = await chunkService.getChunkCount(doc.id)
            hasChunks = chunkCount > 0
          } catch (error) {
            console.error(`Error checking chunks for document ${doc.id}:`, error)
          }
        }
        
        return {
          ...doc,
          hasChunks,
          chunkCount,
          chunkExtractionStatus: doc.chunk_extraction_status || 'not_started'
        }
      })
    )
    
    return {
      documents: documentsWithChunkStatus,
      stats: {
        total: documents.length,
        pending: documents.filter(d => d.status === 'pending').length,
        categorizing: documents.filter(d => d.status === 'categorizing').length,
        completed: documents.filter(d => d.status === 'completed').length
      }
    }
  } catch (error) {
    console.error('Error fetching documents from database:', error)
    // Fallback to mock data if database connection fails
    return {
      documents: mockDocuments.map(doc => ({
        ...doc,
        hasChunks: false,
        chunkCount: 0
      })),
      stats: {
        total: mockDocuments.length,
        pending: mockDocuments.filter(d => d.status === 'pending').length,
        categorizing: mockDocuments.filter(d => d.status === 'categorizing').length,
        completed: mockDocuments.filter(d => d.status === 'completed').length
      }
    }
  }
}

export async function DocumentSelectorServer() {
  const data = await getDocuments()

  return <DocumentSelectorClient initialData={data} />
}