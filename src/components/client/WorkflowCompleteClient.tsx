'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Alert, AlertDescription } from "../ui/alert"
import { 
  CheckCircle2, 
  FileText, 
  Tag, 
  Star, 
  Download,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react"
import { useWorkflowStore, Document as WorkflowDocument, TagDimension } from "../../stores/workflow-store"
import { Progress } from "../ui/progress"

interface Props {
  document: WorkflowDocument
  tagDimensions: TagDimension[]
  workflowSummary: {
    workflowId: string
    submittedAt: string
    processingEstimate: string
    status: string
  }
  workflowData?: {  // NEW: Optional database workflow data
    session: any
    category: any
    tags: {
      raw: any[]
      byDimension: Record<string, any[]>
    }
  } | null
}

export function WorkflowCompleteClient({ document, tagDimensions, workflowSummary, workflowData }: Props) {
  const router = useRouter()
  const workflowStore = useWorkflowStore()

  // Use database data if available, otherwise fall back to store
  const belongingRating = workflowData?.category?.belonging_rating ?? workflowStore.belongingRating
  const selectedCategory = workflowData?.category?.categories ?? workflowStore.selectedCategory
  
  // Transform normalized tags to display format if from database
  const selectedTags = useMemo(() => {
    if (workflowData?.tags?.raw && workflowData.tags.raw.length > 0) {
      // Transform normalized tags to frontend format
      const dimensionIdToKey: Record<string, string> = {
        '550e8400-e29b-41d4-a716-446655440003': 'authorship',
        '550e8400-e29b-41d4-a716-446655440004': 'format',
        '550e8400-e29b-41d4-a716-446655440005': 'disclosure-risk',
        '550e8400-e29b-41d4-a716-446655440006': 'intended-use',
        '550e8400-e29b-41d4-a716-446655440021': 'evidence-type',
        '550e8400-e29b-41d4-a716-446655440022': 'audience-level',
        '550e8400-e29b-41d4-a716-446655440023': 'gating-level'
      }

      const grouped: Record<string, string[]> = {}
      
      workflowData.tags.raw.forEach((tagAssignment: any) => {
        const dimensionKey = dimensionIdToKey[tagAssignment.dimension_id]
        if (!dimensionKey) return
        
        if (!grouped[dimensionKey]) {
          grouped[dimensionKey] = []
        }
        grouped[dimensionKey].push(tagAssignment.tag_id)
      })
      
      return grouped
    }
    
    return workflowStore.selectedTags
  }, [workflowData, workflowStore.selectedTags])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showProcessingDetails, setShowProcessingDetails] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null) // Clear any previous errors
    try {
      const workflowId = await workflowStore.submitWorkflow()
      setIsSubmitting(false)
      
      // If workflow was already submitted (workflowData exists), go to dashboard
      // Otherwise, refresh page with workflowId to show database data
      if (workflowData) {
        router.push('/dashboard')
      } else if (workflowId) {
        router.push(`/workflow/${document.id}/complete?workflowId=${workflowId}`)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Submit error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setSubmitError(errorMessage)
      setIsSubmitting(false)
    }
  }

  const handleStartNew = () => {
    workflowStore.resetWorkflow()
    router.push('/dashboard')
  }

  const getSelectedTagsCount = () => {
    return Object.values(selectedTags).reduce((total, tags) => total + tags.length, 0)
  }

  const getTagsByDimension = (dimensionId: string) => {
    const dimension = tagDimensions.find(d => d.id === dimensionId)
    const selectedTagIds = selectedTags[dimensionId] || []
    
    if (!dimension) return []
    
    return dimension.tags.filter(tag => selectedTagIds.includes(tag.id))
  }

  const relationshipLabels = {
    1: "No relationship",
    2: "Minimal relationship", 
    3: "Some relationship",
    4: "Strong relationship",
    5: "Perfect fit"
  }

  const handleExportSummary = async () => {
    try {
      const exportData = {
        workflowId: workflowSummary.workflowId,
        documentId: document.id,
        format: 'json',
        includeMetadata: true
      }

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = globalThis.document.createElement('a')
        a.href = url
        a.download = `workflow_${workflowSummary.workflowId}.json`
        globalThis.document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        globalThis.document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-green-900">Categorization Complete!</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your document has been successfully categorized and is ready for processing. 
            Review the summary below before final submission.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Summary */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Document</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Title</p>
              <p className="text-sm">{document.title}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Relationship Strength</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {belongingRating}/5
                </Badge>
                <span className="text-sm">
                  {belongingRating ? relationshipLabels[belongingRating as keyof typeof relationshipLabels] : 'Not rated'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Category Summary */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Primary Category</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium">{selectedCategory?.name}</p>
                {selectedCategory?.isHighValue && (
                  <Badge className="text-xs">High Value</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedCategory?.description}
              </p>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-1">Processing Impact</p>
              <p className="text-xs">{selectedCategory?.impact}</p>
            </div>
          </div>
        </Card>

        {/* Tags Summary */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Secondary Tags</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Tags Applied</p>
              <Badge variant="outline" className="text-sm">
                {getSelectedTagsCount()} tags across {Object.keys(selectedTags).length} dimensions
              </Badge>
            </div>
            
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Tag Breakdown</p>
              <div className="space-y-1">
                {Object.entries(selectedTags).map(([dimensionId, tagIds]) => {
                  const dimension = tagDimensions.find(d => d.id === dimensionId)
                  if (!dimension || tagIds.length === 0) return null
                  
                  return (
                    <div key={dimensionId} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{dimension.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {tagIds.length}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Review */}
      <Card className="max-w-6xl mx-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Categorization Details</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowProcessingDetails(!showProcessingDetails)}
            >
              {showProcessingDetails ? 'Hide' : 'Show'} Processing Details
            </Button>
          </div>

          {/* Tag Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(selectedTags).map(([dimensionId, tagIds]) => {
              const dimension = tagDimensions.find(d => d.id === dimensionId)
              const tags = getTagsByDimension(dimensionId)
              
              if (!dimension || tags.length === 0) return null
              
              return (
                <div key={dimensionId} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{dimension.name}</h4>
                    {dimension.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.name}
                        {tag.riskLevel && (
                          <span className="ml-1 text-xs opacity-70">
                            (Risk: {tag.riskLevel}/5)
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Processing Details */}
          {showProcessingDetails && (
            <div className="pt-6 border-t space-y-4">
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium">AI Training Optimization:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Document relationship strength ({belongingRating}/5) will influence training weight</li>
                      <li>• Primary category determines processing algorithm and feature extraction</li>
                      <li>• Secondary tags enable sophisticated filtering and usage optimization</li>
                      <li>• Risk level tags ensure appropriate security and access controls</li>
                      <li>• Evidence type tags optimize fact extraction and verification processes</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </Card>

      {/* Processing Simulation */}
      {isSubmitting && (
        <Card className="max-w-4xl mx-auto">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600 animate-spin" />
              <h3 className="font-medium">Processing Categorization Data</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Validating categorization data...</span>
                <span>100%</span>
              </div>
              <Progress value={100} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Optimizing AI training parameters...</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Updating knowledge base...</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {submitError && (
        <Alert variant="destructive" className="max-w-4xl mx-auto mb-6">
          <AlertDescription>
            <div className="font-semibold mb-2">Submission Error:</div>
            <code className="text-xs whitespace-pre-wrap break-words">{submitError}</code>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-4xl mx-auto pt-6">
        <Button 
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 min-w-48"
        >
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Submit for Processing
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleStartNew}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Start New Document
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleExportSummary}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Summary
          </Button>
        </div>
      </div>

      {/* Success Metrics */}
      <Card className="max-w-4xl mx-auto">
        <div className="p-6 bg-green-50 border-l-4 border-l-green-500">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-green-900">Categorization Success</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-green-900">Training Value</p>
              <p className="text-green-700">
                {belongingRating && belongingRating >= 4 ? 'High' : belongingRating && belongingRating >= 3 ? 'Medium' : 'Standard'}
              </p>
            </div>
            <div className="text-center">
              <p className="font-medium text-green-900">Metadata Coverage</p>
              <p className="text-green-700">
                {Math.round((Object.keys(selectedTags).length / tagDimensions.length) * 100)}% Complete
              </p>
            </div>
            <div className="text-center">
              <p className="font-medium text-green-900">Processing Ready</p>
              <p className="text-green-700">✓ Validated</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}