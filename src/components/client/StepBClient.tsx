'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Alert, AlertDescription } from "../ui/alert"
import { ScrollArea } from "../ui/scroll-area"
import { 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  TrendingUp, 
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { useWorkflowStore, Document, CategorySelection } from "../../stores/workflow-store"

interface Props {
  document: Document
  categories: CategorySelection[]
}

export function StepBClient({ document, categories }: Props) {
  const router = useRouter()
  const { 
    setSelectedCategory, 
    selectedCategory, 
    markStepComplete,
    validateStep,
    validationErrors,
    setCurrentStep
  } = useWorkflowStore()
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    selectedCategory?.id || null
  )
  const [previewCategory, setPreviewCategory] = useState<CategorySelection | null>(null)

  const handleCategorySelect = (category: CategorySelection) => {
    setSelectedCategoryId(category.id)
    setSelectedCategory(category)
    setPreviewCategory(category)
  }

  const handleNext = () => {
    if (validateStep('B')) {
      markStepComplete('B')
      router.push(`/workflow/${document.id}/stage3`)
    }
  }

  const handleBack = () => {
    router.push(`/workflow/${document.id}/stage1`)
  }

  const handleCategoryPreview = (category: CategorySelection) => {
    setPreviewCategory(category)
  }

  return (
    <div className="flex min-h-screen">
      {/* Categories Column */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {/* Step Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Primary Category Selection</h1>
            <p className="text-muted-foreground max-w-2xl">
              Choose the primary category that best represents this document's content and purpose. 
              This determines the processing approach and training optimization strategy.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="space-y-3">
            {categories.map((category) => {
              const isSelected = selectedCategoryId === category.id
              
              return (
                <Card 
                  key={category.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected 
                      ? 'ring-2 ring-primary border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleCategorySelect(category)}
                  onMouseEnter={() => handleCategoryPreview(category)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{category.name}</h3>
                          {category.isHighValue && (
                            <Badge className="text-xs">High Value</Badge>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {category.description}
                        </p>
                        
                        {/* Category Metrics */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {category.usageAnalytics && (
                            <>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{category.usageAnalytics.totalSelections} uses</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>{category.usageAnalytics.recentActivity} recent</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Impact Badge */}
                      <div className="flex-shrink-0">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            category.isHighValue 
                              ? 'border-orange-200 text-orange-800 bg-orange-50' 
                              : 'border-blue-200 text-blue-800 bg-blue-50'
                          }`}
                        >
                          {category.isHighValue ? 'High Impact' : 'Standard'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Validation Errors */}
          {validationErrors.selectedCategory && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validationErrors.selectedCategory}
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Assessment
            </Button>

            <Button 
              onClick={handleNext}
              className="flex items-center gap-2"
              disabled={!selectedCategoryId}
            >
              Continue to Tags
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Category Details Panel */}
      <div className="w-96 border-l bg-muted/30">
        <div className="p-6 h-full">
          {previewCategory ? (
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{previewCategory.name}</h3>
                    {previewCategory.isHighValue && (
                      <Star className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={`w-fit ${
                      previewCategory.isHighValue 
                        ? 'border-orange-200 text-orange-800 bg-orange-50' 
                        : 'border-blue-200 text-blue-800 bg-blue-50'
                    }`}
                  >
                    {previewCategory.isHighValue ? 'High Value Category' : 'Standard Category'}
                  </Badge>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {previewCategory.detailedDescription || previewCategory.description}
                  </p>
                </div>

                {/* Processing Strategy */}
                {previewCategory.processingStrategy && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Processing Strategy</h4>
                    <p className="text-sm text-muted-foreground">
                      {previewCategory.processingStrategy}
                    </p>
                  </div>
                )}

                {/* Business Value */}
                {previewCategory.businessValueClassification && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Business Value</h4>
                    <p className="text-sm text-muted-foreground">
                      {previewCategory.businessValueClassification}
                    </p>
                  </div>
                )}

                {/* Examples */}
                {previewCategory.examples && previewCategory.examples.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Examples</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {previewCategory.examples.map((example, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Usage Analytics */}
                {previewCategory.usageAnalytics && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Usage Analytics
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Selections</span>
                        <span className="font-medium">{previewCategory.usageAnalytics.totalSelections}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Recent Activity</span>
                        <span className="font-medium">{previewCategory.usageAnalytics.recentActivity}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Value Distribution */}
                {previewCategory.valueDistribution && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Value Distribution</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">High Value</span>
                        <span className="font-medium">{previewCategory.valueDistribution.highValue}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Medium Value</span>
                        <span className="font-medium">{previewCategory.valueDistribution.mediumValue}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Standard Value</span>
                        <span className="font-medium">{previewCategory.valueDistribution.standardValue}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Impact */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Processing Impact</h4>
                  <p className="text-sm text-muted-foreground">
                    {previewCategory.impact}
                  </p>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <Star className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Hover over a category to view detailed information
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}