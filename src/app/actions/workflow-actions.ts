'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveWorkflowDraft(formData: FormData) {
  try {
    const documentId = formData.get('documentId') as string
    const step = formData.get('step') as string
    const data = JSON.parse(formData.get('data') as string)

    // In a real app, save to database
    console.log('Saving draft:', { documentId, step, data })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    revalidatePath(`/workflow/${documentId}`)
    
    return { success: true, message: 'Draft saved successfully' }
  } catch (_error) {
    return { success: false, message: 'Failed to save draft' }
  }
}

export async function submitWorkflowStep(formData: FormData) {
  try {
    const documentId = formData.get('documentId') as string
    const step = formData.get('step') as string
    const data = JSON.parse(formData.get('data') as string)

    // Validate step data
    const validation = await validateWorkflowStep(step, data)
    if (!validation.valid) {
      return { success: false, errors: validation.errors }
    }

    // In a real app, save to database and update workflow state
    console.log('Submitting step:', { documentId, step, data })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Determine next step
    const nextStage = getNextStage(step)
    
    revalidatePath(`/workflow/${documentId}`)
    
    if (nextStage) {
      redirect(`/workflow/${documentId}/${nextStage}`)
    }

    return { success: true, message: 'Step completed successfully' }
  } catch (_error) {
    return { success: false, message: 'Failed to submit step' }
  }
}

export async function submitCompleteWorkflow(formData: FormData) {
  try {
    const documentId = formData.get('documentId') as string
    const workflowData = JSON.parse(formData.get('workflowData') as string)

    // In a real app, finalize workflow in database
    console.log('Submitting complete workflow:', { documentId, workflowData })

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    revalidatePath('/dashboard')
    redirect('/dashboard')

    return { success: true, message: 'Workflow submitted successfully' }
  } catch (_error) {
    return { success: false, message: 'Failed to submit workflow' }
  }
}

async function validateWorkflowStep(step: string, data: any) {
  const errors: Record<string, string> = {}

  switch (step) {
    case 'A':
      if (!data.belongingRating) {
        errors.belongingRating = 'Please provide a relationship rating'
      }
      break
    case 'B':
      if (!data.selectedCategory) {
        errors.selectedCategory = 'Please select a primary category'
      }
      break
    case 'C':
      const requiredDimensions = ['authorship', 'disclosure-risk', 'intended-use']
      requiredDimensions.forEach(dim => {
        if (!data.selectedTags || !data.selectedTags[dim] || data.selectedTags[dim].length === 0) {
          errors[dim] = `Please select at least one ${dim.replace('-', ' ')} tag`
        }
      })
      break
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

function getNextStage(currentStep: string): string | null {
  switch (currentStep) {
    case 'A':
      return 'stage2'
    case 'B':
      return 'stage3'
    case 'C':
      return 'complete'
    default:
      return null
  }
}