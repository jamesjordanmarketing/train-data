/**
 * Workflow Navigation Utilities
 * 
 * Helpers for navigating between upload module and workflow system
 */

/**
 * Document workflow status
 */
export type WorkflowStatus = 
  | 'pending'
  | 'uploaded' 
  | 'processing'
  | 'completed'
  | 'categorizing'
  | 'error';

/**
 * Get the appropriate workflow stage for a document
 * @param status - Current document status
 * @returns Workflow stage path segment
 */
export function getWorkflowStage(status: WorkflowStatus): string {
  switch (status) {
    case 'completed':
      // Document ready for categorization - start at stage 1
      return 'stage1';
    
    case 'categorizing':
      // Document in categorization workflow - resume at stage 1
      return 'stage1';
    
    case 'pending':
      // Seed document - start at stage 1
      return 'stage1';
    
    default:
      // Uploaded/Processing/Error - not ready for workflow
      return 'stage1';
  }
}

/**
 * Check if document is ready for workflow
 * @param status - Current document status
 * @returns True if document can enter workflow
 */
export function isReadyForWorkflow(status: WorkflowStatus): boolean {
  return status === 'completed' || status === 'categorizing' || status === 'pending';
}

/**
 * Get workflow URL for a document
 * @param documentId - Document UUID
 * @param status - Current document status
 * @returns Full workflow path
 */
export function getWorkflowUrl(documentId: string, status: WorkflowStatus): string {
  const stage = getWorkflowStage(status);
  return `/workflow/${documentId}/${stage}`;
}

/**
 * Get user-friendly message for workflow readiness
 * @param status - Current document status
 * @returns Message explaining workflow availability
 */
export function getWorkflowReadinessMessage(status: WorkflowStatus): string {
  switch (status) {
    case 'completed':
      return 'Document is ready for categorization workflow';
    
    case 'categorizing':
      return 'Document is currently in categorization workflow';
    
    case 'pending':
      return 'Document is ready for workflow';
    
    case 'uploaded':
      return 'Document is queued for text extraction';
    
    case 'processing':
      return 'Text extraction in progress. Please wait for completion.';
    
    case 'error':
      return 'Document processing failed. Please fix errors before starting workflow.';
    
    default:
      return 'Document status unknown';
  }
}

/**
 * Bulk workflow processing helper
 * Returns documents that are ready for workflow
 * @param documents - Array of documents
 * @returns Filtered array of workflow-ready documents
 */
export function getWorkflowReadyDocuments<T extends { id: string; status: WorkflowStatus }>(
  documents: T[]
): T[] {
  return documents.filter(doc => isReadyForWorkflow(doc.status));
}

/**
 * Get next action label for document based on status
 * @param status - Current document status
 * @returns Button label for next action
 */
export function getNextActionLabel(status: WorkflowStatus): string {
  switch (status) {
    case 'completed':
      return 'Start Workflow';
    
    case 'categorizing':
      return 'Resume Workflow';
    
    case 'processing':
      return 'Processing...';
    
    case 'uploaded':
      return 'Queued';
    
    case 'error':
      return 'Fix Error';
    
    default:
      return 'View Document';
  }
}

