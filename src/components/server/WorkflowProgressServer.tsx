import { WorkflowProgressClient } from '../client/WorkflowProgressClient'

export async function WorkflowProgressServer() {
  // In a real app, you might fetch workflow state from the database here
  // For now, we'll let the client component handle the state
  
  return <WorkflowProgressClient />
}