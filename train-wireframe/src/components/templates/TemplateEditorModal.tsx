/**
 * TemplateEditorModal Component
 * 
 * Modal dialog for creating and editing prompt templates with live preview.
 */

import React, { useState, useEffect } from 'react';
import { Template, TemplateVariable, TierType } from '../../lib/types';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TemplateVariableEditor } from './TemplateVariableEditor';
import { Eye, Edit, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface TemplateEditorModalProps {
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onSave: (template: Partial<Template>) => Promise<void>;
}

/**
 * TemplateEditorModal - Full-featured editor for creating/editing templates
 */
export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  template,
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    structure: '',
    tier: 'template' as TierType,
    variables: [] as TemplateVariable[],
    qualityThreshold: 0.7,
    isActive: true,
    styleNotes: '',
    exampleConversation: '',
    requiredElements: [] as string[],
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [sampleValues, setSampleValues] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        structure: template.structure,
        tier: (template.tier || 'template') as TierType,
        variables: template.variables || [],
        qualityThreshold: template.qualityThreshold || 0.7,
        isActive: template.isActive !== undefined ? template.isActive : true,
        styleNotes: template.styleNotes || '',
        exampleConversation: template.exampleConversation || '',
        requiredElements: template.requiredElements || [],
      });
    } else {
      // Reset form for new template
      setFormData({
        name: '',
        description: '',
        structure: '',
        tier: 'template',
        variables: [],
        qualityThreshold: 0.7,
        isActive: true,
        styleNotes: '',
        exampleConversation: '',
        requiredElements: [],
      });
    }
    setErrors([]);
    setPreviewMode(false);
  }, [template, open]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Template name is required');
    }

    if (!formData.structure.trim()) {
      newErrors.push('Template structure is required');
    }

    // Validate placeholders match variables
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    const placeholders = new Set<string>();
    let match;
    while ((match = placeholderRegex.exec(formData.structure)) !== null) {
      placeholders.add(match[1]);
    }

    const variableNames = new Set(formData.variables.map((v) => v.name));
    const missingVariables = Array.from(placeholders).filter(
      (p) => !variableNames.has(p)
    );

    if (missingVariables.length > 0) {
      newErrors.push(
        `Undefined variables in template: ${missingVariables.join(', ')}`
      );
    }

    // Check for variables with empty names
    const emptyNameVars = formData.variables.filter((v) => !v.name.trim());
    if (emptyNameVars.length > 0) {
      newErrors.push('All variables must have a name');
    }

    // Check for duplicate variable names
    const varNames = formData.variables.map((v) => v.name);
    const duplicates = varNames.filter(
      (name, index) => varNames.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      newErrors.push(`Duplicate variable names: ${[...new Set(duplicates)].join(', ')}`);
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
    try {
      const templateData: Partial<Template> = {
        ...formData,
        id: template?.id,
      };

      await onSave(templateData);
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      setErrors(['Failed to save template. Please try again.']);
    } finally {
      setIsSaving(false);
    }
  };

  const resolveTemplate = (structure: string, values: Record<string, any>): string => {
    let resolved = structure;
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      resolved = resolved.replace(regex, value || `[${key}]`);
    });
    return resolved;
  };

  const highlightPlaceholders = (text: string): React.ReactNode => {
    const parts = text.split(/(\{\{\w+\}\})/g);
    return parts.map((part, index) => {
      if (part.match(/\{\{\w+\}\}/)) {
        return (
          <span key={index} className="bg-purple-100 text-purple-700 font-semibold">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="template">Template & Variables</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    Template Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Technical Support Template"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tier">
                    Tier <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tier: value as TierType })
                    }
                  >
                    <SelectTrigger id="tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="scenario">Scenario</SelectItem>
                      <SelectItem value="edge_case">Edge Case</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what this template is used for..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qualityThreshold">
                    Quality Threshold (0-1)
                  </Label>
                  <Input
                    id="qualityThreshold"
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formData.qualityThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualityThreshold: parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum quality score for generated conversations
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked as boolean })
                    }
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active (available for generation)
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="template" className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="structure">
                    Template Structure <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>

                {previewMode ? (
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto">
                    <p className="whitespace-pre-wrap font-mono text-sm">
                      {resolveTemplate(formData.structure, sampleValues)}
                    </p>
                  </div>
                ) : (
                  <Textarea
                    id="structure"
                    value={formData.structure}
                    onChange={(e) =>
                      setFormData({ ...formData, structure: e.target.value })
                    }
                    placeholder="Enter your template with {{placeholders}}...&#10;&#10;Example:&#10;You are a {{role}} helping with {{topic}}.&#10;The user's expertise level is {{expertise_level}}."
                    rows={10}
                    className="font-mono text-sm"
                    required
                  />
                )}
              </div>

              <div>
                <Label className="mb-2 block">Variables</Label>
                <TemplateVariableEditor
                  variables={formData.variables}
                  onChange={(variables) =>
                    setFormData({ ...formData, variables })
                  }
                  onSampleValuesChange={setSampleValues}
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="styleNotes">Style Notes</Label>
                <Textarea
                  id="styleNotes"
                  value={formData.styleNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, styleNotes: e.target.value })
                  }
                  placeholder="Any specific style guidelines or tone instructions..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="exampleConversation">Example Conversation</Label>
                <Textarea
                  id="exampleConversation"
                  value={formData.exampleConversation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exampleConversation: e.target.value,
                    })
                  }
                  placeholder="Provide an example conversation that demonstrates the desired output..."
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="requiredElements">
                  Required Elements (comma-separated)
                </Label>
                <Input
                  id="requiredElements"
                  value={formData.requiredElements.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiredElements: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    })
                  }
                  placeholder="e.g., greeting, solution, follow-up question"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Elements that must be present in generated conversations
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

