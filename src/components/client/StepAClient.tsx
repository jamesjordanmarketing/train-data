'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Alert, AlertDescription } from "../ui/alert"
import { ArrowRight, AlertCircle, Info } from "lucide-react"
import { useWorkflowStore, Document } from "../../stores/workflow-store"

interface Props {
  document: Document
}

export function StepAClient({ document }: Props) {
  const router = useRouter()
  const { 
    setBelongingRating, 
    belongingRating, 
    markStepComplete,
    validateStep,
    validationErrors,
    setCurrentDocument
  } = useWorkflowStore()
  
  const [localRating, setLocalRating] = useState<number | null>(belongingRating)

  useEffect(() => {
    // Set the current document when component mounts
    setCurrentDocument(document)
  }, [document, setCurrentDocument])

  const handleRatingChange = (value: string) => {
    const rating = parseInt(value)
    setLocalRating(rating)
    setBelongingRating(rating)
  }

  const handleNext = () => {
    if (validateStep('A')) {
      markStepComplete('A')
      router.push(`/workflow/${document.id}/stage2`)
    }
  }

  const ratingOptions = [
    { 
      value: 1, 
      label: "No relationship", 
      description: "This content doesn't reflect my expertise or voice at all" 
    },
    { 
      value: 2, 
      label: "Minimal relationship", 
      description: "Some minor connection but mostly generic content" 
    },
    { 
      value: 3, 
      label: "Some relationship", 
      description: "Moderately reflects my knowledge and perspective" 
    },
    { 
      value: 4, 
      label: "Strong relationship", 
      description: "Clearly represents my expertise and unique insights" 
    },
    { 
      value: 5, 
      label: "Perfect fit", 
      description: "Perfectly captures my voice, knowledge, and expertise" 
    }
  ]

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Statement of Belonging Assessment</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Rate how closely this document represents your unique voice, expertise, and perspective. 
          This assessment helps determine the training value and processing priority.
        </p>
      </div>

      {/* Document Reference */}
      <Card className="max-w-4xl mx-auto">
        <div className="p-4 bg-muted/50 border-l-4 border-l-primary">
          <h3 className="font-medium mb-2">Document: {document.title}</h3>
          <p className="text-sm text-muted-foreground">{document.summary}</p>
        </div>
      </Card>

      {/* Rating Interface */}
      <Card className="max-w-4xl mx-auto">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <Label className="text-base">How closely does this document represent your unique voice and expertise?</Label>
            
            <RadioGroup
              value={localRating?.toString() || ""}
              onValueChange={handleRatingChange}
              className="space-y-4"
            >
              {ratingOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem 
                    value={option.value.toString()} 
                    id={`rating-${option.value}`}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none flex-1">
                    <Label
                      htmlFor={`rating-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.value}/5 - {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Impact Preview */}
          {localRating && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Training Impact Preview:</p>
                  <p className="text-sm">
                    {localRating >= 4 && "High-value content identified. Will be prioritized for detailed processing and given increased training weight."}
                    {localRating === 3 && "Medium-value content. Will receive standard processing with moderate training emphasis."}
                    {localRating <= 2 && "Lower-relationship content. Will be processed with reduced training weight and may require additional validation."}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Validation Errors */}
      {validationErrors.belongingRating && (
        <Alert variant="destructive" className="max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationErrors.belongingRating}
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-end items-center max-w-4xl mx-auto pt-4">
        <Button 
          onClick={handleNext}
          className="flex items-center gap-2"
          disabled={!localRating}
        >
          Continue to Category Selection
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}