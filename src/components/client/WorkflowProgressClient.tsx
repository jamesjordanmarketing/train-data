'use client'

import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import { Check, Circle, Clock } from "lucide-react"
import { useWorkflowStore } from "../../stores/workflow-store"

const steps = [
  { id: 'A', name: 'Statement of Belonging', description: 'Assess document relationship' },
  { id: 'B', name: 'Primary Category', description: 'Select main category' },
  { id: 'C', name: 'Secondary Tags', description: 'Apply metadata tags' }
]

export function WorkflowProgressClient() {
  const { currentStep, completedSteps, isDraft, lastSaved } = useWorkflowStore()

  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return 'completed'
    if (currentStep === stepId) return 'active'
    return 'pending'
  }

  const getProgressPercentage = () => {
    const currentStepIndex = steps.findIndex(step => step.id === currentStep)
    const completedCount = completedSteps.length
    const totalSteps = steps.length
    
    if (currentStep === 'complete') return 100
    
    // Base progress on completed steps plus partial progress on current step
    return Math.round(((completedCount + 0.5) / totalSteps) * 100)
  }

  const getStepIcon = (stepId: string) => {
    const status = getStepStatus(stepId)
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-white" />
      case 'active':
        return <Circle className="h-4 w-4 text-white fill-current" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Categorization Progress</span>
          <span className="text-muted-foreground">{getProgressPercentage()}% Complete</span>
        </div>
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const isActive = status === 'active'
          const isCompleted = status === 'completed'

          return (
            <div key={step.id} className="flex items-start gap-3">
              {/* Step Icon */}
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                ${isCompleted 
                  ? 'bg-primary border-primary' 
                  : isActive 
                    ? 'bg-primary border-primary' 
                    : 'border-muted-foreground/30'
                }
              `}>
                {getStepIcon(step.id)}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    Step {step.id}: {step.name}
                  </h4>
                  {isActive && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      Current
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge className="text-xs px-2 py-0">
                      Complete
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className={`
                  absolute w-0.5 h-6 ml-4 mt-8 transition-colors
                  ${isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'}
                `} style={{ transform: 'translateX(-1px)' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Status Information */}
      <div className="pt-3 border-t space-y-2">
        {isDraft && lastSaved && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Draft saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {currentStep === 'complete' && (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <Check className="h-3 w-3" />
            <span>Workflow completed successfully</span>
          </div>
        )}
      </div>
    </div>
  )
}