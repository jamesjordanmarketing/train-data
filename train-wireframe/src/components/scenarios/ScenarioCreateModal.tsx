import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Template, Scenario, TemplateVariable } from '../../lib/types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ScenarioCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (scenario: Scenario) => void;
  initialTemplateId?: string; // Optional pre-selection
}

export function ScenarioCreateModal({ open, onClose, onSuccess, initialTemplateId }: ScenarioCreateModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    persona: '',
    emotional_arc: '',
    context: '',
    parameterValues: {} as Record<string, any>,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Fetch templates on mount
  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data.data || data.templates || []);
      
      // Pre-select if initial template ID provided
      if (initialTemplateId) {
        const template = data.data.find((t: Template) => t.id === initialTemplateId);
        if (template) {
          handleTemplateChange(template);
        }
      }
    } catch (error) {
      toast.error('Failed to load templates');
      console.error(error);
    }
  };

  const handleTemplateChange = (template: Template) => {
    setSelectedTemplate(template);
    
    // Initialize parameter values with defaults
    const initialParams: Record<string, any> = {};
    template.variables.forEach((variable: TemplateVariable) => {
      initialParams[variable.name] = variable.defaultValue || '';
    });
    
    setFormData(prev => ({
      ...prev,
      parameterValues: initialParams,
    }));
  };

  const handleParameterChange = (variableName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      parameterValues: {
        ...prev.parameterValues,
        [variableName]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Scenario name is required');
    }

    if (!selectedTemplate) {
      newErrors.push('Please select a template');
    }

    if (!formData.topic.trim()) {
      newErrors.push('Topic is required');
    }

    if (!formData.persona.trim()) {
      newErrors.push('Persona is required');
    }

    if (!formData.emotional_arc.trim()) {
      newErrors.push('Emotional arc is required');
    }

    // Validate all template variables have values
    if (selectedTemplate) {
      selectedTemplate.variables.forEach((variable: TemplateVariable) => {
        if (!formData.parameterValues[variable.name]) {
          newErrors.push(`Variable "${variable.name}" requires a value`);
        }
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setErrors([]);

    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          parent_template_id: selectedTemplate!.id,
          parent_template_name: selectedTemplate!.name,
          context: formData.context,
          parameter_values: formData.parameterValues,
          topic: formData.topic,
          persona: formData.persona,
          emotional_arc: formData.emotional_arc,
          status: 'draft',
          generation_status: 'not_generated',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create scenario');
      }

      toast.success('Scenario created successfully');
      onSuccess(result.data);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        topic: '',
        persona: '',
        emotional_arc: '',
        context: '',
        parameterValues: {},
      });
      setSelectedTemplate(null);
    } catch (error: any) {
      console.error('Error creating scenario:', error);
      setErrors([error.message]);
    } finally {
      setIsSaving(false);
    }
  };

  const generatePreview = (): string => {
    if (!selectedTemplate) return '';
    
    let preview = selectedTemplate.structure;
    Object.entries(formData.parameterValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      preview = preview.replace(regex, value || `{{${key}}}`);
    });
    
    return preview;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Scenario</DialogTitle>
        </DialogHeader>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-900 mb-2">Please fix the following errors:</p>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-red-800">{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div>
            <Label htmlFor="template">Parent Template <span className="text-red-500">*</span></Label>
            <Select
              value={selectedTemplate?.id || ''}
              onValueChange={(id) => {
                const template = templates.find(t => t.id === id);
                if (template) handleTemplateChange(template);
              }}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-xs text-gray-600 mt-1">
                {selectedTemplate.description}
              </p>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Scenario Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Anxious Investor Market Volatility"
              />
            </div>
            <div>
              <Label htmlFor="topic">Topic <span className="text-red-500">*</span></Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="e.g., Market Volatility Concerns"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this scenario..."
              rows={2}
            />
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="persona">Persona <span className="text-red-500">*</span></Label>
              <Input
                id="persona"
                value={formData.persona}
                onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                placeholder="e.g., Anxious Investor"
              />
            </div>
            <div>
              <Label htmlFor="emotional_arc">Emotional Arc <span className="text-red-500">*</span></Label>
              <Input
                id="emotional_arc"
                value={formData.emotional_arc}
                onChange={(e) => setFormData(prev => ({ ...prev, emotional_arc: e.target.value }))}
                placeholder="e.g., anxiety to confidence"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="context">Context</Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              placeholder="Additional context for this scenario..."
              rows={3}
            />
          </div>

          {/* Dynamic Variable Fields */}
          {selectedTemplate && selectedTemplate.variables.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">Template Variables</h3>
              <div className="space-y-3">
                {selectedTemplate.variables.map((variable: TemplateVariable) => (
                  <div key={variable.name}>
                    <Label htmlFor={`var-${variable.name}`}>
                      {variable.name} <span className="text-red-500">*</span>
                    </Label>
                    {variable.helpText && (
                      <p className="text-xs text-gray-600 mb-1">{variable.helpText}</p>
                    )}
                    
                    {variable.type === 'dropdown' && variable.options ? (
                      <Select
                        value={formData.parameterValues[variable.name] || ''}
                        onValueChange={(value) => handleParameterChange(variable.name, value)}
                      >
                        <SelectTrigger id={`var-${variable.name}`}>
                          <SelectValue placeholder={`Select ${variable.name}...`} />
                        </SelectTrigger>
                        <SelectContent>
                          {variable.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : variable.type === 'number' ? (
                      <Input
                        id={`var-${variable.name}`}
                        type="number"
                        value={formData.parameterValues[variable.name] || ''}
                        onChange={(e) => handleParameterChange(variable.name, e.target.value)}
                        placeholder={variable.defaultValue || ''}
                      />
                    ) : (
                      <Input
                        id={`var-${variable.name}`}
                        value={formData.parameterValues[variable.name] || ''}
                        onChange={(e) => handleParameterChange(variable.name, e.target.value)}
                        placeholder={variable.defaultValue || ''}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Section */}
          {selectedTemplate && (
            <div>
              <Label>Template Preview</Label>
              <div className="bg-white border rounded-lg p-4 mt-1 max-h-40 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
                  {generatePreview()}
                </pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !selectedTemplate}>
              {isSaving ? 'Creating...' : 'Create Scenario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

