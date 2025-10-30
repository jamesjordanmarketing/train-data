import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Slider } from '../ui/slider';
import { useAppStore } from '../../stores/useAppStore';
import { TierType, Conversation, ConversationTurn, Template, TemplateVariable } from '../../lib/types';
import { toast } from 'sonner@2.0.3';
import { CheckCircle, Loader2, AlertCircle, Eye, Sparkles } from 'lucide-react';
import { generatePreview, generateSampleParameters, getRequiredParameters } from '../../lib/ai';

export function SingleGenerationForm() {
  const { 
    showGenerationModal, 
    closeGenerationModal, 
    addConversation,
    templates,
    scenarios
  } = useAppStore();
  
  const [tier, setTier] = useState<TierType>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('intermediate');
  const [complexity, setComplexity] = useState([5]);
  const [length, setLength] = useState('medium');
  const [style, setStyle] = useState('professional');
  const [parentId, setParentId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [temperature, setTemperature] = useState([0.7]);
  
  // Template parameter injection state
  const [templateParameters, setTemplateParameters] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [previewErrors, setPreviewErrors] = useState<string[]>([]);
  
  const [generating, setGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedConversation, setGeneratedConversation] = useState<Conversation | null>(null);
  
  const resetForm = () => {
    setTier('template');
    setSelectedTemplateId('');
    setTopic('');
    setAudience('intermediate');
    setComplexity([5]);
    setLength('medium');
    setStyle('professional');
    setParentId('');
    setShowAdvanced(false);
    setTemperature([0.7]);
    setGenerating(false);
    setGenerationComplete(false);
    setGenerationError(false);
    setProgress(0);
    setGeneratedConversation(null);
    setTemplateParameters({});
    setShowPreview(false);
    setPreviewText('');
    setPreviewErrors([]);
  };
  
  // Get selected template
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  
  // Update preview when template or parameters change
  useEffect(() => {
    if (selectedTemplate && showPreview) {
      const preview = generatePreview(selectedTemplate, templateParameters);
      setPreviewText(preview.preview);
      setPreviewErrors(preview.errors);
    }
  }, [selectedTemplate, templateParameters, showPreview]);
  
  // Handle template selection change
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Initialize parameters with defaults or empty values
      const initialParams: Record<string, any> = {};
      template.variables.forEach(variable => {
        initialParams[variable.name] = variable.defaultValue || '';
      });
      setTemplateParameters(initialParams);
    }
  };
  
  // Handle parameter value change
  const handleParameterChange = (paramName: string, value: any) => {
    setTemplateParameters(prev => ({
      ...prev,
      [paramName]: value,
    }));
  };
  
  // Auto-fill with sample values
  const handleAutoFillSamples = () => {
    if (selectedTemplate) {
      const samples = generateSampleParameters(selectedTemplate.variables);
      setTemplateParameters(samples);
      toast.success('Sample values filled');
    }
  };
  
  const handleClose = () => {
    resetForm();
    closeGenerationModal();
  };
  
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a conversation topic');
      return;
    }
    
    setGenerating(true);
    setProgress(0);
    
    // Simulate generation with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      
      // Randomly succeed or fail for demo
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        setProgress(100);
        
        // Generate mock conversation turns
        const turns: ConversationTurn[] = [
          {
            role: 'user',
            content: `I need help with ${topic}`,
            timestamp: new Date().toISOString(),
            tokenCount: Math.floor((topic.length + 20) / 4),
          },
          {
            role: 'assistant',
            content: `I'd be happy to help you with ${topic}. Let me explain the key concepts and best practices.`,
            timestamp: new Date(Date.now() + 1000).toISOString(),
            tokenCount: Math.floor((topic.length + 60) / 4),
          },
          {
            role: 'user',
            content: 'Can you provide a specific example?',
            timestamp: new Date(Date.now() + 2000).toISOString(),
            tokenCount: 10,
          },
          {
            role: 'assistant',
            content: `Certainly! Here's a practical example: When working with ${topic}, you'll want to follow these steps: 1) Understand the requirements, 2) Plan your approach, 3) Implement incrementally, 4) Test thoroughly. This ensures a systematic and reliable outcome.`,
            timestamp: new Date(Date.now() + 3000).toISOString(),
            tokenCount: 45,
          },
        ];
        
        const totalTokens = turns.reduce((sum, turn) => sum + turn.tokenCount, 0);
        const qualityScore = 7 + Math.random() * 2.5; // 7-9.5 range
        
        const newConversation: Conversation = {
          id: `conv-${Date.now()}`,
          title: topic,
          tier,
          category: ['Generated'],
          status: 'generated',
          qualityScore: parseFloat(qualityScore.toFixed(1)),
          qualityMetrics: {
            overall: qualityScore,
            relevance: qualityScore + (Math.random() - 0.5),
            accuracy: qualityScore + (Math.random() - 0.5),
            naturalness: qualityScore + (Math.random() - 0.5),
            methodology: qualityScore + (Math.random() - 0.5),
            coherence: qualityScore + (Math.random() - 0.5),
            confidence: qualityScore > 8 ? 'high' : 'medium',
            uniqueness: qualityScore + (Math.random() - 0.5),
            trainingValue: qualityScore > 8 ? 'high' : 'medium',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Current User',
          turns,
          totalTurns: turns.length,
          totalTokens,
          parentId: parentId || undefined,
          parentType: tier === 'scenario' ? 'template' : tier === 'edge_case' ? 'scenario' : undefined,
          parameters: {
            audience,
            complexity: complexity[0],
            length,
            style,
            temperature: temperature[0],
          },
          reviewHistory: [
            {
              id: `action-${Date.now()}`,
              action: 'generated',
              performedBy: 'System',
              timestamp: new Date().toISOString(),
            },
          ],
        };
        
        setGeneratedConversation(newConversation);
        setGenerationComplete(true);
        setGenerating(false);
        
        // Add to store
        addConversation(newConversation);
        toast.success('Conversation generated successfully!');
      } else {
        setGenerationError(true);
        setGenerating(false);
        toast.error('Generation failed. Please try again.');
      }
    }, 2500);
  };
  
  if (generationComplete && generatedConversation) {
    return (
      <Dialog open={showGenerationModal} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Conversation Generated Successfully!
            </DialogTitle>
            <DialogDescription>
              Your conversation has been created and added to the dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <span className="text-sm text-gray-600">Title:</span>
                <p>{generatedConversation.title}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Quality Score:</span>
                <p className="text-lg text-green-600">{generatedConversation.qualityScore}/10</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Preview (first 2 turns):</span>
                <div className="mt-2 space-y-2">
                  {generatedConversation.turns.slice(0, 2).map((turn, i) => (
                    <div key={i} className="text-sm">
                      <strong>{turn.role}:</strong> {turn.content}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Close
              </Button>
              <Button 
                onClick={() => {
                  resetForm();
                  toast.info('Ready to generate another conversation');
                }}
                className="flex-1"
              >
                Generate Another
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (generationError) {
    return (
      <Dialog open={showGenerationModal} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Generation Failed
            </DialogTitle>
            <DialogDescription>
              We encountered an error while generating your conversation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Error: Unable to connect to the generation service. Please check your connection and try again.
            </p>
            
            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setGenerationError(false);
                  handleGenerate();
                }}
                className="flex-1"
              >
                Retry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (generating) {
    return (
      <Dialog open={showGenerationModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="text-center space-y-2">
                <p className="text-lg">Generating conversation...</p>
                <p className="text-sm text-gray-500">{progress}% Complete</p>
                <p className="text-xs text-gray-400">Estimated time: ~{Math.max(1, Math.ceil((100 - progress) / 10))}s remaining</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setGenerating(false);
                toast.info('Generation cancelled');
              }}
            >
              Cancel Generation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={showGenerationModal} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate New Conversation</DialogTitle>
          <DialogDescription>
            Configure parameters to generate a training conversation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tier Selection */}
          <div className="space-y-3">
            <Label>Tier Selection</Label>
            <RadioGroup value={tier} onValueChange={(val) => setTier(val as TierType)}>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="template" id="template" />
                  <Label htmlFor="template" className="cursor-pointer flex-1">
                    <div>
                      <div>Template</div>
                      <div className="text-xs text-gray-500">Start from scratch</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="scenario" id="scenario" />
                  <Label htmlFor="scenario" className="cursor-pointer flex-1">
                    <div>
                      <div>Scenario</div>
                      <div className="text-xs text-gray-500">Based on template</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="edge_case" id="edge_case" />
                  <Label htmlFor="edge_case" className="cursor-pointer flex-1">
                    <div>
                      <div>Edge Case</div>
                      <div className="text-xs text-gray-500">Test unusual situations</div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          {/* Template Selection (for template tier) */}
          {tier === 'template' && templates.length > 0 && (
            <div className="space-y-2">
              <Label>Select Template (Optional)</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template or start from scratch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Start from scratch)</SelectItem>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} - {t.category} ({t.usageCount} uses)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedTemplate.description}
                </p>
              )}
            </div>
          )}
          
          {/* Template Parameters (if template selected) */}
          {selectedTemplate && selectedTemplate.variables.length > 0 && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Template Parameters</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoFillSamples}
                  className="text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Auto-fill Samples
                </Button>
              </div>
              
              {selectedTemplate.variables.map((variable) => {
                const isRequired = !variable.defaultValue || variable.defaultValue === '';
                
                return (
                  <div key={variable.name} className="space-y-2">
                    <Label htmlFor={`param-${variable.name}`}>
                      {variable.name} {isRequired && <span className="text-red-500">*</span>}
                    </Label>
                    
                    {variable.type === 'text' && (
                      <Input
                        id={`param-${variable.name}`}
                        value={templateParameters[variable.name] || ''}
                        onChange={(e) => handleParameterChange(variable.name, e.target.value)}
                        placeholder={variable.helpText || `Enter ${variable.name}`}
                      />
                    )}
                    
                    {variable.type === 'number' && (
                      <Input
                        id={`param-${variable.name}`}
                        type="number"
                        value={templateParameters[variable.name] || ''}
                        onChange={(e) => handleParameterChange(variable.name, parseFloat(e.target.value))}
                        placeholder={variable.helpText || `Enter ${variable.name}`}
                      />
                    )}
                    
                    {variable.type === 'dropdown' && variable.options && (
                      <Select
                        value={templateParameters[variable.name] || ''}
                        onValueChange={(value) => handleParameterChange(variable.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${variable.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {variable.options.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {variable.helpText && (
                      <p className="text-xs text-gray-500">{variable.helpText}</p>
                    )}
                  </div>
                );
              })}
              
              {/* Preview Button and Panel */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Template Preview
                </Button>
                
                {showPreview && (
                  <div className="mt-3 p-3 bg-white border rounded-lg">
                    <Label className="text-sm font-semibold mb-2 block">Resolved Template:</Label>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {previewText || 'Enter parameter values to see preview...'}
                    </div>
                    
                    {previewErrors.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs font-semibold text-red-700 mb-1">Validation Errors:</p>
                        <ul className="text-xs text-red-600 list-disc list-inside">
                          {previewErrors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Parent Selection (if scenario or edge case) */}
          {(tier === 'scenario' || tier === 'edge_case') && (
            <div className="space-y-2">
              <Label>Parent {tier === 'scenario' ? 'Template' : 'Scenario'} *</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select parent ${tier === 'scenario' ? 'template' : 'scenario'}`} />
                </SelectTrigger>
                <SelectContent>
                  {tier === 'scenario' && templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.usageCount} uses)
                    </SelectItem>
                  ))}
                  {tier === 'edge_case' && scenarios.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Topic/Context */}
          <div className="space-y-2">
            <Label htmlFor="topic">Conversation Topic or Context *</Label>
            <Textarea
              id="topic"
              placeholder="Describe what this conversation should cover..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-gray-500">{topic.length}/500 characters</p>
          </div>
          
          {/* Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Complexity */}
          <div className="space-y-2">
            <Label>Complexity: {complexity[0]}/10</Label>
            <Slider
              value={complexity}
              onValueChange={setComplexity}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Simple</span>
              <span>Complex</span>
            </div>
          </div>
          
          {/* Length */}
          <div className="space-y-2">
            <Label>Conversation Length</Label>
            <RadioGroup value={length} onValueChange={setLength} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="short" />
                <Label htmlFor="short">Short (5-10 turns)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium (10-20 turns)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="long" id="long" />
                <Label htmlFor="long">Long (20+ turns)</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Style */}
          <div className="space-y-2">
            <Label htmlFor="style">Style/Tone</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Advanced Options */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mb-2"
            >
              {showAdvanced ? '▼' : '▸'} Show Advanced Options
            </Button>
            
            {showAdvanced && (
              <div className="space-y-4 pl-4 border-l-2">
                <div className="space-y-2">
                  <Label>Temperature: {temperature[0]}</Label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                  <p className="text-xs text-gray-500">Controls randomness (0 = focused, 1 = creative)</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleGenerate} className="flex-1">
              Generate Conversation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
