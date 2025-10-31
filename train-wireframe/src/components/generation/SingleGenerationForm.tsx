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
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useAppStore } from '../../stores/useAppStore';
import { TierType, Conversation, ConversationTurn } from '../../lib/types';
import { toast } from 'sonner@2.0.3';
import { Loader2, Plus, X, Sparkles } from 'lucide-react';
import { 
  PERSONA_OPTIONS, 
  EMOTION_OPTIONS, 
  INTENT_OPTIONS, 
  TONE_OPTIONS,
  generateSampleParameters,
  validateParameters
} from '../../lib/ai';
import { TemplatePreview } from './TemplatePreview';
import { ConversationPreview } from './ConversationPreview';

interface SingleGenerationFormProps {
  conversationId?: string; // For regeneration
  onClose?: () => void;
}

interface GenerationParams {
  templateId?: string;
  persona: string;
  emotion: string;
  topic: string;
  intent: string;
  tone: string;
  templateParameters?: Record<string, any>;
  customParameters: Record<string, string>;
  tier: TierType;
}

export function SingleGenerationForm({ conversationId, onClose }: SingleGenerationFormProps) {
  const { 
    showGenerationModal, 
    closeGenerationModal, 
    addConversation,
    updateConversation,
    conversations,
    templates,
  } = useAppStore();
  
  const isRegenerating = !!conversationId;
  const originalConversation = isRegenerating 
    ? conversations.find(c => c.id === conversationId) 
    : null;

  // Form state
  const [formData, setFormData] = useState<GenerationParams>({
    persona: '',
    emotion: '',
    topic: '',
    intent: '',
    tone: '',
    templateParameters: {},
    customParameters: {},
    tier: 'template',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Custom parameter management
  const [customParamKey, setCustomParamKey] = useState('');
  const [customParamValue, setCustomParamValue] = useState('');

  // Pre-fill form if regenerating
  useEffect(() => {
    if (originalConversation) {
      setFormData({
        templateId: originalConversation.parameters?.templateId,
        persona: originalConversation.persona || '',
        emotion: originalConversation.emotion || '',
        topic: originalConversation.title || '',
        intent: originalConversation.parameters?.intent || '',
        tone: originalConversation.parameters?.tone || '',
        templateParameters: originalConversation.parameters?.templateParameters || {},
        customParameters: originalConversation.parameters?.customParameters || {},
        tier: originalConversation.tier || 'template',
      });
    }
  }, [originalConversation]);

  const selectedTemplate = formData.templateId 
    ? templates.find(t => t.id === formData.templateId) 
    : null;

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    const initialParams: Record<string, any> = {};
    
    if (template) {
      template.variables.forEach(variable => {
        initialParams[variable.name] = variable.defaultValue || '';
      });
    }
    
    setFormData(prev => ({
      ...prev,
      templateId: templateId || undefined,
      templateParameters: initialParams,
    }));
  };

  // Handle template parameter change
  const handleTemplateParameterChange = (paramName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      templateParameters: {
        ...prev.templateParameters,
        [paramName]: value,
      },
    }));
  };

  // Auto-fill sample values
  const handleAutoFillSamples = () => {
    if (selectedTemplate) {
      const samples = generateSampleParameters(selectedTemplate.variables);
      setFormData(prev => ({
        ...prev,
        templateParameters: samples,
      }));
      toast.success('Sample values filled');
    }
  };

  // Add custom parameter
  const handleAddCustomParameter = () => {
    if (!customParamKey.trim() || !customParamValue.trim()) {
      toast.error('Please enter both key and value');
      return;
    }

    if (formData.customParameters[customParamKey]) {
      toast.error('Parameter key already exists');
      return;
    }

    setFormData(prev => ({
      ...prev,
      customParameters: {
        ...prev.customParameters,
        [customParamKey]: customParamValue,
      },
    }));

    setCustomParamKey('');
    setCustomParamValue('');
    toast.success('Custom parameter added');
  };

  // Remove custom parameter
  const handleRemoveCustomParameter = (key: string) => {
    setFormData(prev => {
      const newParams = { ...prev.customParameters };
      delete newParams[key];
      return {
        ...prev,
        customParameters: newParams,
      };
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.persona.trim()) {
      toast.error('Please select a persona');
      return false;
    }
    if (!formData.emotion.trim()) {
      toast.error('Please select an emotion');
      return false;
    }
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic');
      return false;
    }
    if (!formData.intent.trim()) {
      toast.error('Please select an intent');
      return false;
    }
    if (!formData.tone.trim()) {
      toast.error('Please select a tone');
      return false;
    }

    // Validate template parameters if template selected
    if (selectedTemplate) {
      const validation = validateParameters(selectedTemplate, formData.templateParameters || {});
      if (!validation.valid) {
        toast.error(validation.errors[0]);
        return false;
      }
    }

    return true;
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Simulate API call to /api/conversations/generate
      // In production, this would be an actual fetch call
      const response = await simulateGeneration(formData);
      
      if (!response.ok) {
        throw new Error(response.error || 'Generation failed');
      }

      setResult(response.conversation);
      toast.success('Conversation generated successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation');
      toast.error(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle regeneration
  const handleRegenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      let response;
      
      if (isRegenerating && conversationId) {
        // Call regenerate endpoint
        response = await simulateRegeneration(conversationId, formData);
      } else {
        // Regular generation
        response = await simulateGeneration(formData);
      }
      
      if (!response.ok) {
        throw new Error(response.error || 'Regeneration failed');
      }

      setResult(response.conversation);
      toast.success('Conversation regenerated successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred during regeneration');
      toast.error(err.message || 'Regeneration failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!result) return;

    setIsSaving(true);
    
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (isRegenerating && conversationId) {
        // Archive original and save new version
        updateConversation(conversationId, { status: 'archived' });
        addConversation(result);
        toast.success('Conversation regenerated and saved');
      } else {
        addConversation(result);
        toast.success('Conversation saved to dashboard');
      }

      handleClose();
    } catch (err) {
      toast.error('Failed to save conversation');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      persona: '',
      emotion: '',
      topic: '',
      intent: '',
      tone: '',
      templateParameters: {},
      customParameters: {},
      tier: 'template',
    });
    setResult(null);
    setError(null);
    setIsGenerating(false);
    
    if (onClose) {
      onClose();
    } else {
      closeGenerationModal();
    }
  };

  // Show conversation preview if generation complete
  if (result) {
    return (
      <ConversationPreview
        conversation={result}
        onSave={handleSave}
        onRegenerate={handleRegenerate}
        onClose={handleClose}
        saving={isSaving}
        regenerating={isGenerating}
      />
    );
  }

  // Show loading state
  if (isGenerating) {
    return (
      <Dialog open={showGenerationModal || !!onClose} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <div className="space-y-4 py-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">
                  {isRegenerating ? 'Regenerating' : 'Generating'} conversation...
                </p>
                <p className="text-sm text-gray-500">
                  This may take 15-45 seconds
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={showGenerationModal || !!onClose} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isRegenerating ? 'Regenerate Conversation' : 'Generate New Conversation'}
          </DialogTitle>
          <DialogDescription>
            {isRegenerating 
              ? 'Modify parameters and regenerate. The original will be archived.' 
              : 'Configure parameters to generate a training conversation'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form Fields */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Template (Optional)</Label>
              <Select 
                value={formData.templateId || ''} 
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None - Generate from scratch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None - Generate from scratch</SelectItem>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Parameters */}
            {selectedTemplate && selectedTemplate.variables.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Template Parameters</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAutoFillSamples}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Auto-fill
                  </Button>
                </div>

                {selectedTemplate.variables.map((variable) => (
                  <div key={variable.name} className="space-y-2">
                    <Label htmlFor={`param-${variable.name}`}>
                      {variable.name}
                      {(!variable.defaultValue || variable.defaultValue === '') && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>

                    {variable.type === 'dropdown' && variable.options ? (
                      <Select
                        value={formData.templateParameters?.[variable.name] || ''}
                        onValueChange={(value) => handleTemplateParameterChange(variable.name, value)}
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
                    ) : variable.type === 'number' ? (
                      <Input
                        id={`param-${variable.name}`}
                        type="number"
                        value={formData.templateParameters?.[variable.name] || ''}
                        onChange={(e) => handleTemplateParameterChange(variable.name, parseFloat(e.target.value))}
                        placeholder={variable.helpText || `Enter ${variable.name}`}
                      />
                    ) : (
                      <Input
                        id={`param-${variable.name}`}
                        value={formData.templateParameters?.[variable.name] || ''}
                        onChange={(e) => handleTemplateParameterChange(variable.name, e.target.value)}
                        placeholder={variable.helpText || `Enter ${variable.name}`}
                      />
                    )}

                    {variable.helpText && (
                      <p className="text-xs text-gray-500">{variable.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* Core Parameters */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">Core Parameters</h3>

              {/* Persona */}
              <div className="space-y-2">
                <Label htmlFor="persona">Persona *</Label>
                <Select value={formData.persona} onValueChange={(value) => setFormData(prev => ({ ...prev, persona: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSONA_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Emotion */}
              <div className="space-y-2">
                <Label htmlFor="emotion">Emotion *</Label>
                <Select value={formData.emotion} onValueChange={(value) => setFormData(prev => ({ ...prev, emotion: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTION_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Textarea
                  id="topic"
                  placeholder="Describe what this conversation should cover..."
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">{formData.topic.length}/500 characters</p>
              </div>

              {/* Intent */}
              <div className="space-y-2">
                <Label htmlFor="intent">Intent *</Label>
                <Select value={formData.intent} onValueChange={(value) => setFormData(prev => ({ ...prev, intent: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intent" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTENT_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label htmlFor="tone">Tone *</Label>
                <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Custom Parameters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-700">Custom Parameters</h3>
                <Badge variant="outline">{Object.keys(formData.customParameters).length}</Badge>
              </div>

              {/* Existing custom parameters */}
              {Object.entries(formData.customParameters).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(formData.customParameters).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomParameter(key)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new custom parameter */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Parameter key"
                    value={customParamKey}
                    onChange={(e) => setCustomParamKey(e.target.value)}
                  />
                  <Input
                    placeholder="Parameter value"
                    value={customParamValue}
                    onChange={(e) => setCustomParamValue(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomParameter}
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Custom Parameter
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleGenerate} className="flex-1">
                {isRegenerating ? 'Regenerate' : 'Generate'} Conversation
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Right Column - Template Preview */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <TemplatePreview
              template={selectedTemplate}
              parameters={formData.templateParameters || {}}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simulate API generation
async function simulateGeneration(params: GenerationParams): Promise<{ ok: boolean; conversation?: Conversation; error?: string }> {
  await new Promise(resolve => setTimeout(resolve, 2500));

  // 90% success rate
  if (Math.random() < 0.9) {
    const turns: ConversationTurn[] = [
      {
        role: 'user',
        content: `I need help with ${params.topic}`,
        timestamp: new Date().toISOString(),
        tokenCount: Math.floor((params.topic.length + 20) / 4),
      },
      {
        role: 'assistant',
        content: `I'd be happy to help you with ${params.topic}. As someone who is ${params.persona.toLowerCase()} and feeling ${params.emotion.toLowerCase()}, I understand your ${params.intent.toLowerCase()} approach. Let me explain in a ${params.tone.toLowerCase()} manner.`,
        timestamp: new Date(Date.now() + 1000).toISOString(),
        tokenCount: 45,
      },
    ];

    const totalTokens = turns.reduce((sum, turn) => sum + turn.tokenCount, 0);
    const qualityScore = 7 + Math.random() * 2.5;

    const conversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: params.topic,
      persona: params.persona,
      emotion: params.emotion,
      tier: params.tier,
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
      parameters: {
        ...params,
        templateId: params.templateId,
        templateParameters: params.templateParameters,
        customParameters: params.customParameters,
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

    return { ok: true, conversation };
  } else {
    return { ok: false, error: 'Generation service temporarily unavailable' };
  }
}

// Simulate API regeneration
async function simulateRegeneration(
  originalId: string, 
  params: GenerationParams
): Promise<{ ok: boolean; conversation?: Conversation; error?: string }> {
  await new Promise(resolve => setTimeout(resolve, 2500));

  const result = await simulateGeneration(params);
  
  if (result.ok && result.conversation) {
    result.conversation.parentId = originalId;
    return result;
  }

  return result;
}
