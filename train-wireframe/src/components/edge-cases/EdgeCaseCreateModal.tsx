import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Scenario, EdgeCase } from '../../lib/types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type EdgeCaseType = 'error_condition' | 'boundary_value' | 'unusual_input' | 'complex_combination' | 'failure_scenario';

interface EdgeCaseCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (edgeCase: EdgeCase) => void;
  initialScenarioId?: string;
}

const EDGE_CASE_TYPES: { value: EdgeCaseType; label: string; description: string }[] = [
  {
    value: 'error_condition',
    label: 'Error Condition',
    description: 'System errors, exceptions, or failure states',
  },
  {
    value: 'boundary_value',
    label: 'Boundary Value',
    description: 'Minimum, maximum, or edge values',
  },
  {
    value: 'unusual_input',
    label: 'Unusual Input',
    description: 'Unexpected, malformed, or edge case inputs',
  },
  {
    value: 'complex_combination',
    label: 'Complex Combination',
    description: 'Multiple factors interacting in unusual ways',
  },
  {
    value: 'failure_scenario',
    label: 'Failure Scenario',
    description: 'Intentional failure or negative test cases',
  },
];

export function EdgeCaseCreateModal({ 
  open, 
  onClose, 
  onSuccess, 
  initialScenarioId 
}: EdgeCaseCreateModalProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    edgeCaseType: 'error_condition' as EdgeCaseType,
    complexity: 5,
    expectedBehavior: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchScenarios();
    }
  }, [open]);

  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/scenarios');
      const data = await response.json();
      const scenarioList = data.data || data.scenarios || [];
      setScenarios(scenarioList);

      // Pre-select if initial scenario ID provided
      if (initialScenarioId) {
        const scenario = scenarioList.find((s: Scenario) => s.id === initialScenarioId);
        if (scenario) {
          setSelectedScenario(scenario);
        }
      }
    } catch (error) {
      toast.error('Failed to load scenarios');
      console.error(error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) {
      newErrors.push('Title is required');
    } else if (formData.title.length > 200) {
      newErrors.push('Title must be 200 characters or less');
    }

    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    } else if (formData.description.length > 2000) {
      newErrors.push('Description must be 2000 characters or less');
    }

    if (!selectedScenario) {
      newErrors.push('Please select a parent scenario');
    }

    if (formData.complexity < 1 || formData.complexity > 10) {
      newErrors.push('Complexity must be between 1 and 10');
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
      const response = await fetch('/api/edge-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          parent_scenario_id: selectedScenario!.id,
          parent_scenario_name: selectedScenario!.name,
          edge_case_type: formData.edgeCaseType,
          complexity: formData.complexity,
          test_status: 'not_tested',
          test_results: formData.expectedBehavior ? {
            expectedBehavior: formData.expectedBehavior,
            actualBehavior: '',
            passed: false,
            testDate: '',
          } : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create edge case');
      }

      toast.success('Edge case created successfully');
      onSuccess(result.data);
      onClose();

      // Reset form
      setFormData({
        title: '',
        description: '',
        edgeCaseType: 'error_condition',
        complexity: 5,
        expectedBehavior: '',
      });
      setSelectedScenario(null);
    } catch (error: any) {
      console.error('Error creating edge case:', error);
      setErrors([error.message]);
    } finally {
      setIsSaving(false);
    }
  };

  const getComplexityLabel = (value: number): string => {
    if (value <= 3) return 'Low';
    if (value <= 6) return 'Medium';
    return 'High';
  };

  const getComplexityColor = (value: number): string => {
    if (value <= 3) return 'text-green-600';
    if (value <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Edge Case</DialogTitle>
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
          {/* Scenario Selection */}
          <div>
            <Label htmlFor="scenario">Parent Scenario <span className="text-red-500">*</span></Label>
            <Select
              value={selectedScenario?.id || ''}
              onValueChange={(id) => {
                const scenario = scenarios.find(s => s.id === id);
                setSelectedScenario(scenario || null);
              }}
            >
              <SelectTrigger id="scenario">
                <SelectValue placeholder="Select a scenario..." />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedScenario && (
              <p className="text-xs text-gray-600 mt-1">
                Template: {selectedScenario.parentTemplateName} | Topic: {selectedScenario.topic}
              </p>
            )}
          </div>

          {/* Basic Info */}
          <div>
            <Label htmlFor="title">Edge Case Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., User provides negative account balance"
            />
          </div>

          <div>
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the edge case..."
              rows={4}
            />
          </div>

          {/* Edge Case Type */}
          <div>
            <Label>Edge Case Type <span className="text-red-500">*</span></Label>
            <RadioGroup
              value={formData.edgeCaseType}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                edgeCaseType: value as EdgeCaseType 
              }))}
              className="mt-2 space-y-3"
            >
              {EDGE_CASE_TYPES.map((type) => (
                <div key={type.value} className="flex items-start space-x-3 border rounded-lg p-3 hover:bg-gray-50">
                  <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={type.value} className="font-semibold cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Complexity Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="complexity">
                Complexity Level <span className="text-red-500">*</span>
              </Label>
              <span className={`font-semibold ${getComplexityColor(formData.complexity)}`}>
                {formData.complexity} - {getComplexityLabel(formData.complexity)}
              </span>
            </div>
            <Slider
              id="complexity"
              min={1}
              max={10}
              step={1}
              value={[formData.complexity]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, complexity: value }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 - Simple</span>
              <span>5 - Moderate</span>
              <span>10 - Very Complex</span>
            </div>
          </div>

          {/* Expected Behavior */}
          <div>
            <Label htmlFor="expectedBehavior">Expected Behavior (Optional)</Label>
            <Textarea
              id="expectedBehavior"
              value={formData.expectedBehavior}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedBehavior: e.target.value }))}
              placeholder="Describe the expected system behavior for this edge case..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used for test validation when executing tests
            </p>
          </div>

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
            <Button type="submit" disabled={isSaving || !selectedScenario}>
              {isSaving ? 'Creating...' : 'Create Edge Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

