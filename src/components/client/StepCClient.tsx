'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Alert, AlertDescription } from "../ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Info,
  X
} from "lucide-react"
import { useWorkflowStore, Document, TagDimension, Tag } from "../../stores/workflow-store"
import { Checkbox } from "../ui/checkbox"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { mockTagSuggestions } from "../../data/mock-data"

interface Props {
  document: Document
  tagDimensions: TagDimension[]
  suggestions: Record<string, string[]> | null
}

export function StepCClient({ document, tagDimensions, suggestions: initialSuggestions }: Props) {
  const router = useRouter()
  const { 
    selectedTags,
    selectedCategory,
    setSelectedTags,
    addCustomTag,
    markStepComplete,
    validateStep,
    validationErrors 
  } = useWorkflowStore()

  const [openSections, setOpenSections] = useState<string[]>(['authorship'])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [customTagInput, setCustomTagInput] = useState('')
  const [customTagDimension, setCustomTagDimension] = useState<string | null>(null)

  // Get suggestions based on selected category
  const suggestions = selectedCategory 
    ? mockTagSuggestions[selectedCategory.id as keyof typeof mockTagSuggestions] 
    : initialSuggestions

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleTagToggle = (dimensionId: string, tagId: string, checked: boolean) => {
    const currentTags = selectedTags[dimensionId] || []
    const dimension = tagDimensions.find(d => d.id === dimensionId)
    
    let newTags: string[]
    
    if (dimension?.multiSelect) {
      // Multi-select: add or remove from array
      if (checked) {
        newTags = [...currentTags, tagId]
      } else {
        newTags = currentTags.filter(id => id !== tagId)
      }
    } else {
      // Single select: replace array with single item or empty
      newTags = checked ? [tagId] : []
    }
    
    setSelectedTags(dimensionId, newTags)
  }

  const applySuggestion = (dimensionId: string, tagIds: string[]) => {
    setSelectedTags(dimensionId, tagIds)
  }

  const addCustomTagToDimension = () => {
    if (!customTagInput.trim() || !customTagDimension) return
    
    const newTag: Tag = {
      id: `custom-${Date.now()}`,
      name: customTagInput.trim(),
      description: 'Custom tag created by user'
    }
    
    addCustomTag(customTagDimension, newTag)
    setCustomTagInput('')
    setCustomTagDimension(null)
  }

  const handleNext = () => {
    if (validateStep('C')) {
      markStepComplete('C')
      router.push(`/workflow/${document.id}/complete`)
    }
  }

  const handleBack = () => {
    router.push(`/workflow/${document.id}/stage2`)
  }

  const getRiskLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-orange-500'
      case 4: return 'bg-red-500'
      case 5: return 'bg-red-700'
      default: return 'bg-gray-500'
    }
  }

  const getCompletionStatus = (dimension: TagDimension) => {
    const tags = selectedTags[dimension.id] || []
    if (dimension.required && tags.length === 0) return 'required'
    if (tags.length > 0) return 'complete'
    return 'optional'
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Secondary Tags & Metadata</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Apply detailed metadata tags across multiple dimensions to optimize content processing 
          and enable sophisticated categorization for your AI training data.
        </p>
      </div>

      {/* Suggestions Panel */}
      {suggestions && showSuggestions && (
        <Card className="max-w-6xl mx-auto">
          <div className="p-4 bg-blue-50 border-l-4 border-l-blue-500 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Intelligent Suggestions</span>
                <Badge variant="outline" className="text-xs">
                  Based on "{selectedCategory?.name}"
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSuggestions(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-blue-800">
              We've pre-selected recommended tags based on your category selection. You can apply these suggestions or customize as needed.
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(suggestions).map(([dimensionId, tagIds]) => {
                const dimension = tagDimensions.find(d => d.id === dimensionId)
                if (!dimension) return null
                
                return (
                  <Button
                    key={dimensionId}
                    variant="outline"
                    size="sm"
                    onClick={() => applySuggestion(dimensionId, tagIds)}
                    className="text-xs"
                  >
                    Apply {dimension.name} suggestions
                  </Button>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Tag Dimensions */}
      <div className="max-w-6xl mx-auto space-y-4">
        {tagDimensions.map((dimension) => {
          const isOpen = openSections.includes(dimension.id)
          const completionStatus = getCompletionStatus(dimension)
          const currentTags = selectedTags[dimension.id] || []
          
          return (
            <Card key={dimension.id} className="overflow-hidden">
              <Collapsible open={isOpen} onOpenChange={() => toggleSection(dimension.id)}>
                <CollapsibleTrigger asChild>
                  <div className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <h3 className="font-medium">{dimension.name}</h3>
                      </div>
                      
                      {dimension.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                      
                      {completionStatus === 'complete' && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      
                      {completionStatus === 'required' && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {currentTags.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {currentTags.length} selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {dimension.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="space-y-3">
                      {dimension.multiSelect ? (
                        // Multi-select with checkboxes
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {dimension.tags.map((tag) => {
                            const isSelected = currentTags.includes(tag.id)
                            
                            return (
                              <div key={tag.id} className="flex items-start space-x-3">
                                <Checkbox
                                  id={tag.id}
                                  checked={isSelected}
                                  onCheckedChange={(checked) => 
                                    handleTagToggle(dimension.id, tag.id, checked as boolean)
                                  }
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <Label
                                    htmlFor={tag.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {tag.name}
                                    {tag.riskLevel && (
                                      <span className={`inline-block w-2 h-2 rounded-full ml-2 ${getRiskLevelColor(tag.riskLevel)}`} />
                                    )}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {tag.description}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        // Single select with radio buttons
                        <RadioGroup
                          value={currentTags[0] || ''}
                          onValueChange={(value) => handleTagToggle(dimension.id, value, true)}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {dimension.tags.map((tag) => (
                              <div key={tag.id} className="flex items-start space-x-3">
                                <RadioGroupItem value={tag.id} id={tag.id} />
                                <div className="grid gap-1.5 leading-none">
                                  <Label
                                    htmlFor={tag.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {tag.name}
                                    {tag.riskLevel && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <span className={`inline-block w-2 h-2 rounded-full ml-2 ${getRiskLevelColor(tag.riskLevel)}`} />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            Risk Level: {tag.riskLevel}/5
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {tag.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      )}
                      
                      {/* Custom Tag Creation */}
                      <div className="pt-3 border-t">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCustomTagDimension(dimension.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Custom Tag
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Custom Tag</DialogTitle>
                              <DialogDescription>
                                Add a custom tag for the {dimension.name} dimension
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="customTag">Tag Name</Label>
                                <Input
                                  id="customTag"
                                  value={customTagInput}
                                  onChange={(e) => setCustomTagInput(e.target.value)}
                                  placeholder="Enter custom tag name"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setCustomTagInput('')
                                    setCustomTagDimension(null)
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={addCustomTagToDimension}>
                                  Add Tag
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive" className="max-w-6xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Please complete the following required fields:</p>
              <ul className="list-disc list-inside text-sm">
                {Object.entries(validationErrors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tag Impact Preview */}
      <Card className="max-w-6xl mx-auto">
        <div className="p-4 bg-muted/50">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Tag Impact Preview:</p>
                <p className="text-sm">
                  Your selected tags will enhance AI training by providing rich metadata context, 
                  enabling sophisticated content filtering, risk assessment, and usage optimization 
                  across different business functions.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center max-w-6xl mx-auto pt-4">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>

        <Button 
          onClick={handleNext}
          className="flex items-center gap-2"
          disabled={Object.keys(validationErrors).length > 0}
        >
          Complete Categorization
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}