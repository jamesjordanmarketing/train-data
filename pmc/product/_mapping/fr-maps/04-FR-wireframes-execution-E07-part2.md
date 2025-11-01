# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E07 Part 2)
**Generated**: 2025-10-31  
**Segment**: E07 Part 2 - Detailed Specifications for Prompts 4-6  
**Purpose**: Complete specifications for Scenarios, Edge Cases, and Advanced Features

## Overview

This document provides **comprehensive, production-ready specifications** for Prompts 4-6 of the E07 implementation segment. These prompts were too brief in the original document and need the same level of detail as Prompts 1-3.

**Original Issue**: Prompts 4-6 in `04-FR-wireframes-execution-E07.md` were only 20-25 lines each with minimal guidance, compared to 200-380 lines for Prompts 1-3.

**This Document**: Expands Prompts 4-6 to match the detail, code examples, and specifications of the first three prompts.

---

## Prompt 4: Scenarios UI - Complete CRUD with Bulk Operations

**Scope**: Enhance ScenariosView with functional create/edit modals, bulk generation workflow, and CSV import  
**Dependencies**: Prompts 1-3 (Services, API Routes, and Templates UI must be complete)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Medium (CSV parsing, bulk operations, template integration)

========================

You are a senior frontend developer implementing the complete Scenario Management UI for the Interactive LoRA Conversation Generation Module.

### CONTEXT AND REQUIREMENTS

**Product Context:**

Scenarios are the middle tier of the template management system. They represent specific conversation topics based on parent templates, with concrete parameter values filled in. Users create scenarios by:
1. Selecting a parent template
2. Filling in template variables with specific values
3. Adding metadata (persona, topic, emotional arc)
4. Optionally generating conversations from the scenario

**Current Wireframe State** (`train-wireframe/src/components/views/ScenariosView.tsx`):
- ✅ Table layout with checkbox selection for bulk operations
- ✅ Status badges (not_generated, generated, error) with color coding
- ✅ Bulk generation UI framework with selection counter
- ✅ Generate/Regenerate buttons per row (placeholders)
- ✅ Filter dropdowns for status and parent template
- ❌ No scenario creation modal
- ❌ No API integration (all actions show toasts)
- ❌ No bulk import from CSV
- ❌ Generate buttons don't trigger actual generation
- ❌ No template variable resolution

**Technical Architecture:**
- **Framework**: React 18 with TypeScript
- **State Management**: React hooks (useState, useEffect)
- **API Integration**: Fetch API with error handling
- **UI Components**: Shadcn/UI (Dialog, Table, Select, Checkbox, etc.)
- **Form Validation**: Manual validation or Zod schemas
- **File Handling**: CSV parsing with Papa Parse library
- **Toast Notifications**: Sonner library

### IMPLEMENTATION TASKS

**Task 1: Create Scenario Modal Component**

Create `src/components/scenarios/ScenarioCreateModal.tsx` with template-driven form:

**Key Features:**
- Template selector dropdown (fetches from `/api/templates`)
- Dynamic form fields based on selected template's variables
- Metadata fields: name, description, topic, persona, emotional_arc
- Parameter values editor that mirrors template variables
- Preview section showing resolved template
- Validation: all template variables must have values
- Submit → POST `/api/scenarios`

**Component Structure:**
```typescript
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
```

---

**Task 2: Bulk Import Modal**

Create `src/components/scenarios/ScenarioBulkImportModal.tsx` for CSV import:

**Key Features:**
- File upload input (accept .csv)
- CSV parsing with Papa Parse
- Preview table showing parsed data
- Validation: check required columns, template exists
- Error highlighting for invalid rows
- Bulk create → POST `/api/scenarios/bulk`

**CSV Format Expected:**
```csv
name,template_id,topic,persona,emotional_arc,context,var1,var2,var3
"Scenario 1","uuid-here","Topic 1","Persona 1","Arc 1","Context 1","value1","value2","value3"
```

**Implementation Pattern:**
```typescript
// Install papa parse: npm install papaparse
// @types/papaparse for TypeScript
import Papa from 'papaparse';

const handleFileUpload = (file: File) => {
  Papa.parse(file, {
    header: true,
    complete: (results) => {
      // Validate and preview
      validateCSVData(results.data);
    },
    error: (error) => {
      toast.error(`CSV parsing failed: ${error.message}`);
    },
  });
};
```

---

**Task 3: Enhanced ScenariosView**

Update `train-wireframe/src/components/views/ScenariosView.tsx`:

**Key Features:**
- Fetch scenarios from `/api/scenarios` with filters
- Checkbox selection state management
- Bulk action bar when items selected
- Delete confirmation with batch DELETE calls
- Generation trigger → UPDATE generation_status
- Filter by template, status, generation_status
- Loading states and error handling

**Code Pattern:**
```typescript
export function ScenariosView() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    templateId: 'all',
    status: 'all',
    generationStatus: 'all',
  });

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.templateId !== 'all') params.append('templateId', filters.templateId);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.generationStatus !== 'all') params.append('generationStatus', filters.generationStatus);

      const response = await fetch(`/api/scenarios?${params.toString()}`);
      const data = await response.json();
      setScenarios(data.data || data.scenarios || []);
    } catch (error) {
      toast.error('Failed to load scenarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [filters]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(scenarios.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} scenarios? This cannot be undone.`)) {
      return;
    }

    const deletePromises = Array.from(selectedIds).map(id =>
      fetch(`/api/scenarios/${id}`, { method: 'DELETE' })
    );

    try {
      await Promise.all(deletePromises);
      toast.success(`${selectedIds.size} scenarios deleted`);
      setSelectedIds(new Set());
      fetchScenarios();
    } catch (error) {
      toast.error('Failed to delete some scenarios');
    }
  };

  const handleGenerate = async (id: string) => {
    try {
      // Trigger conversation generation
      const response = await fetch(`/api/conversations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: id }),
      });

      if (response.ok) {
        toast.success('Generation started');
        fetchScenarios(); // Refresh to show updated status
      }
    } catch (error) {
      toast.error('Failed to start generation');
    }
  };

  // Render implementation...
}
```

### TECHNICAL SPECIFICATIONS

**1. CSV Import Format:**
- Required columns: `name`, `template_id`, `topic`, `persona`, `emotional_arc`
- Optional columns: `description`, `context`, `status`
- Variable columns: Dynamic based on template (e.g., `var_product_name`, `var_issue_type`)
- Maximum rows per import: 100

**2. Validation Rules:**
- Template ID must exist in database
- All required template variables must have values in CSV
- Name must be unique per template
- Status must be one of: draft, active, archived
- Generation status defaults to 'not_generated'

**3. Bulk Operations:**
- Selection limited to 50 items at once
- Bulk delete checks for dependencies (edge cases)
- Bulk generation queues items sequentially
- Progress indicator for multi-item operations

**4. API Integration:**
- GET `/api/scenarios` - List with filters
- POST `/api/scenarios` - Create single
- POST `/api/scenarios/bulk` - Create multiple
- PATCH `/api/scenarios/:id` - Update
- DELETE `/api/scenarios/:id` - Delete
- GET `/api/templates/:id/scenarios` - Get by template

### ACCEPTANCE CRITERIA

- [ ] Create modal opens with template selector
- [ ] Template selection loads variables dynamically
- [ ] Variable form fields match template definition
- [ ] Form validation prevents invalid submissions
- [ ] Scenario creation succeeds → list refreshes → toast shown
- [ ] CSV import accepts valid file format
- [ ] CSV preview shows parsed data with validation
- [ ] Invalid CSV rows highlighted with errors
- [ ] Bulk import creates all valid scenarios
- [ ] Checkbox selection works (individual + select all)
- [ ] Bulk delete confirmation prevents accidents
- [ ] Bulk delete checks for dependencies
- [ ] Generate button triggers conversation generation
- [ ] Status badges update after generation
- [ ] Filters work (template, status, generation status)
- [ ] Loading states display during API calls
- [ ] Error messages are user-friendly

### DELIVERABLES

1. `src/components/scenarios/ScenarioCreateModal.tsx` (400-500 lines)
2. `src/components/scenarios/ScenarioBulkImportModal.tsx` (300-400 lines)
3. Updated `train-wireframe/src/components/views/ScenariosView.tsx` (400-500 lines)
4. CSV template file: `docs/scenario-import-template.csv`
5. Validation utility: `src/lib/utils/csv-validator.ts`

Implement complete scenario management with template integration, bulk operations, and CSV import capabilities following established React patterns.

++++++++++++++++++

## Prompt 5: Edge Cases UI - Complete CRUD with Test Execution Interface

**Scope**: Enhance EdgeCasesView with functional create/test modals and test execution workflow  
**Dependencies**: Prompts 1-4 (Services, API Routes, Templates, and Scenarios must be complete)  
**Estimated Time**: 8-10 hours  
**Risk Level**: Low-Medium (Test execution logic, result comparison)

========================

You are a senior frontend developer implementing the complete Edge Case Management UI for the Interactive LoRA Conversation Generation Module.

### CONTEXT AND REQUIREMENTS

**Product Context:**

Edge cases are the third tier of the template management system. They represent boundary conditions, unusual inputs, and failure scenarios that test the robustness of AI-generated conversations. Users create edge cases by:
1. Selecting a parent scenario
2. Defining the edge case type (error_condition, boundary_value, unusual_input, etc.)
3. Setting complexity level (1-10)
4. Optionally executing tests with expected vs actual behavior comparison

**Current Wireframe State** (`train-wireframe/src/components/views/EdgeCasesView.tsx`):
- ✅ Card-based grid layout with edge case type color coding
- ✅ Test status indicators (passed/failed/not_tested) with badges
- ✅ Type filters (error_condition, boundary_value, unusual_input, etc.)
- ✅ Complexity display with visual indicators
- ❌ No edge case creation modal
- ❌ No test execution interface
- ❌ No API integration (all actions show toasts)
- ❌ No auto-generation feature
- ❌ No test result comparison UI

**Technical Architecture:**
- **Framework**: React 18 with TypeScript
- **State Management**: React hooks (useState, useEffect)
- **API Integration**: Fetch API with error handling
- **UI Components**: Shadcn/UI (Dialog, Card, Badge, Progress, etc.)
- **Form Validation**: Manual validation
- **Toast Notifications**: Sonner library

### IMPLEMENTATION TASKS

**Task 1: Create Edge Case Modal Component**

Create `src/components/edge-cases/EdgeCaseCreateModal.tsx`:

**Key Features:**
- Scenario selector dropdown (fetches from `/api/scenarios`)
- Edge case type radio group or select
- Title and description fields
- Complexity slider (1-10)
- Expected behavior textarea
- Submit → POST `/api/edge-cases`

**Component Structure:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Scenario, EdgeCase, EdgeCaseType } from '../../lib/types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
    }

    if (!formData.description.trim()) {
      newErrors.push('Description is required');
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
```

---

**Task 2: Test Execution Modal Component**

Create `src/components/edge-cases/TestExecutionModal.tsx`:

**Key Features:**
- Display edge case details and expected behavior
- Execution button to trigger test
- Actual behavior textarea (can be manual or AI-generated)
- Pass/Fail toggle or automatic determination
- Comparison view (expected vs actual)
- Submit → PATCH `/api/edge-cases/:id` with test results

**Implementation Pattern:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { EdgeCase } from '../../lib/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestExecutionModalProps {
  edgeCase: EdgeCase;
  open: boolean;
  onClose: () => void;
  onSuccess: (edgeCase: EdgeCase) => void;
}

export function TestExecutionModal({ edgeCase, open, onClose, onSuccess }: TestExecutionModalProps) {
  const [actualBehavior, setActualBehavior] = useState('');
  const [testPassed, setTestPassed] = useState<boolean | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const expectedBehavior = edgeCase.testResults?.expectedBehavior || 'No expected behavior defined';

  const handleExecuteTest = async () => {
    setIsExecuting(true);
    try {
      // Optional: Call AI to generate actual behavior
      // const response = await fetch('/api/edge-cases/execute-test', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ edgeCaseId: edgeCase.id }),
      // });
      // const result = await response.json();
      // setActualBehavior(result.actualBehavior);
      
      // For now, just enable manual entry
      toast.info('Enter the actual behavior observed during testing');
    } catch (error) {
      toast.error('Test execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveResults = async () => {
    if (!actualBehavior.trim()) {
      toast.error('Please enter the actual behavior');
      return;
    }

    if (testPassed === null) {
      toast.error('Please indicate if the test passed or failed');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/edge-cases/${edgeCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_status: testPassed ? 'passed' : 'failed',
          test_results: {
            expectedBehavior,
            actualBehavior,
            passed: testPassed,
            testDate: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save test results');
      }

      toast.success(`Test marked as ${testPassed ? 'passed' : 'failed'}`);
      onSuccess(result.data);
      onClose();
    } catch (error: any) {
      console.error('Error saving test results:', error);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Execute Test: {edgeCase.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Edge Case Info */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Type:</span>{' '}
                <Badge variant="outline">{edgeCase.edgeCaseType}</Badge>
              </div>
              <div>
                <span className="font-semibold">Complexity:</span> {edgeCase.complexity}/10
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Description:</span>
                <p className="text-gray-700 mt-1">{edgeCase.description}</p>
              </div>
            </div>
          </div>

          {/* Expected Behavior */}
          <div>
            <Label className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              Expected Behavior
            </Label>
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap text-gray-800">
                {expectedBehavior}
              </pre>
            </div>
          </div>

          {/* Execute Test Button */}
          {!actualBehavior && (
            <div className="flex justify-center">
              <Button
                onClick={handleExecuteTest}
                disabled={isExecuting}
                size="lg"
              >
                {isExecuting ? 'Executing Test...' : 'Execute Test'}
              </Button>
            </div>
          )}

          {/* Actual Behavior */}
          <div>
            <Label htmlFor="actualBehavior">Actual Behavior Observed</Label>
            <Textarea
              id="actualBehavior"
              value={actualBehavior}
              onChange={(e) => setActualBehavior(e.target.value)}
              placeholder="Enter or paste the actual behavior observed during the test..."
              rows={6}
              className="mt-2"
            />
          </div>

          {/* Pass/Fail Selection */}
          {actualBehavior && (
            <div>
              <Label>Test Result</Label>
              <RadioGroup
                value={testPassed === null ? '' : testPassed.toString()}
                onValueChange={(value) => setTestPassed(value === 'true')}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-green-50">
                  <RadioGroupItem value="true" id="passed" />
                  <div className="flex items-center gap-2 flex-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Label htmlFor="passed" className="cursor-pointer font-semibold">
                      Test Passed
                    </Label>
                  </div>
                  <p className="text-xs text-gray-600">Actual matches expected behavior</p>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-red-50">
                  <RadioGroupItem value="false" id="failed" />
                  <div className="flex items-center gap-2 flex-1">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <Label htmlFor="failed" className="cursor-pointer font-semibold">
                      Test Failed
                    </Label>
                  </div>
                  <p className="text-xs text-gray-600">Actual differs from expected</p>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Comparison View */}
          {actualBehavior && testPassed !== null && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-green-700">✓ Expected</Label>
                <div className="mt-1 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <pre className="whitespace-pre-wrap">{expectedBehavior}</pre>
                </div>
              </div>
              <div>
                <Label className={testPassed ? 'text-green-700' : 'text-red-700'}>
                  {testPassed ? '✓' : '✗'} Actual
                </Label>
                <div className={`mt-1 border rounded-lg p-3 text-sm ${
                  testPassed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <pre className="whitespace-pre-wrap">{actualBehavior}</pre>
                </div>
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
            <Button
              onClick={handleSaveResults}
              disabled={isSaving || !actualBehavior || testPassed === null}
            >
              {isSaving ? 'Saving...' : 'Save Test Results'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

**Task 3: Enhanced EdgeCasesView**

Update `train-wireframe/src/components/views/EdgeCasesView.tsx`:

**Key Features:**
- Fetch edge cases from `/api/edge-cases` with filters
- Type filter buttons (all, error_condition, boundary_value, etc.)
- Test status filter (all, not_tested, passed, failed)
- Complexity sorting
- Test execution button per card → opens TestExecutionModal
- Delete confirmation
- Color-coded cards by type and test status

**Code Pattern:**
```typescript
export function EdgeCasesView() {
  const [edgeCases, setEdgeCases] = useState<EdgeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedEdgeCase, setSelectedEdgeCase] = useState<EdgeCase | null>(null);

  const [filters, setFilters] = useState({
    type: 'all',
    testStatus: 'all',
    scenarioId: 'all',
  });

  const fetchEdgeCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.testStatus !== 'all') params.append('testStatus', filters.testStatus);
      if (filters.scenarioId !== 'all') params.append('scenarioId', filters.scenarioId);

      const response = await fetch(`/api/edge-cases?${params.toString()}`);
      const data = await response.json();
      setEdgeCases(data.data || data.edgeCases || []);
    } catch (error) {
      toast.error('Failed to load edge cases');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdgeCases();
  }, [filters]);

  const handleTest = (edgeCase: EdgeCase) => {
    setSelectedEdgeCase(edgeCase);
    setTestModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete edge case "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/edge-cases/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Edge case deleted');
        fetchEdgeCases();
      } else {
        const error = await response.json();
        toast.error(error.error);
      }
    } catch (error) {
      toast.error('Failed to delete edge case');
    }
  };

  const getTypeColor = (type: EdgeCaseType): string => {
    switch (type) {
      case 'error_condition': return 'bg-red-100 border-red-300';
      case 'boundary_value': return 'bg-yellow-100 border-yellow-300';
      case 'unusual_input': return 'bg-purple-100 border-purple-300';
      case 'complex_combination': return 'bg-blue-100 border-blue-300';
      case 'failure_scenario': return 'bg-gray-100 border-gray-300';
      default: return 'bg-white border-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  // Render grid of cards...
}
```

### TECHNICAL SPECIFICATIONS

**1. Edge Case Types:**
- `error_condition` - System errors, exceptions
- `boundary_value` - Min/max/edge values
- `unusual_input` - Unexpected inputs
- `complex_combination` - Multiple factors
- `failure_scenario` - Intentional failures

**2. Test Execution Workflow:**
1. User clicks "Test" on edge case card
2. Modal opens with expected behavior
3. User executes test (manual or AI-assisted)
4. User enters actual behavior observed
5. User selects Pass/Fail
6. System saves test results with timestamp
7. Edge case card updates with test status badge

**3. Validation Rules:**
- Title required (1-200 characters)
- Description required (1-2000 characters)
- Complexity must be 1-10
- Test results can only be saved if both expected and actual are provided

**4. API Integration:**
- GET `/api/edge-cases` - List with filters
- POST `/api/edge-cases` - Create new
- PATCH `/api/edge-cases/:id` - Update/test results
- DELETE `/api/edge-cases/:id` - Delete
- GET `/api/scenarios/:id/edge-cases` - Get by scenario

### ACCEPTANCE CRITERIA

- [ ] Create modal opens with scenario selector
- [ ] Edge case type selection works (radio group)
- [ ] Complexity slider updates label dynamically
- [ ] Form validation prevents invalid submissions
- [ ] Edge case creation succeeds → list refreshes → toast shown
- [ ] Test execution modal displays edge case details
- [ ] Expected behavior displays correctly
- [ ] Actual behavior textarea accepts input
- [ ] Pass/Fail selection works
- [ ] Comparison view shows expected vs actual
- [ ] Test results save successfully
- [ ] Edge case cards show updated test status
- [ ] Type filters work (all types plus "all")
- [ ] Test status filters work (not_tested, passed, failed)
- [ ] Color coding by type is consistent
- [ ] Delete confirmation prevents accidents
- [ ] Loading states display during API calls
- [ ] Error messages are user-friendly

### DELIVERABLES

1. `src/components/edge-cases/EdgeCaseCreateModal.tsx` (400-500 lines)
2. `src/components/edge-cases/TestExecutionModal.tsx` (300-400 lines)
3. Updated `train-wireframe/src/components/views/EdgeCasesView.tsx` (400-500 lines)
4. Type definitions for test results (if not already in types.ts)

Implement complete edge case management with test execution capabilities and comprehensive result tracking.

++++++++++++++++++

## Prompt 6: Import/Export & Variable Substitution Engine

**Scope**: Implement advanced features including import/export functionality and sophisticated variable substitution engine  
**Dependencies**: Prompts 1-5 (All CRUD operations must be complete)  
**Estimated Time**: 12-14 hours  
**Risk Level**: Medium-High (Complex parsing logic, file handling, advanced substitution patterns)

========================

You are a senior full-stack developer implementing advanced features for the Template Management System in the Interactive LoRA Conversation Generation Module.

### CONTEXT AND REQUIREMENTS

**Product Context:**

This prompt adds powerful capabilities for managing templates, scenarios, and edge cases at scale:
1. **Import/Export** - Backup, migration, and bulk data management
2. **Variable Substitution Engine** - Advanced template processing with nested, conditional, and default values
3. **Template Preview** - Real-time preview of resolved templates before generation

These features enable:
- Bulk data management across environments
- Sharing templates between teams
- Advanced template authoring with complex variable logic
- Pre-validation of templates before conversation generation

**Current State:**
- ✅ Basic CRUD operations for all three entities
- ✅ Simple variable substitution ({{variable}})
- ❌ No import/export functionality
- ❌ No advanced variable substitution (nested, conditional, defaults)
- ❌ No template preview API
- ❌ No validation beyond basic presence checks

### IMPLEMENTATION TASKS

**Task 1: Export API Endpoints**

Create export endpoints for JSON/CSV downloads:

**File**: `src/app/api/export/templates/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { TemplateService } from '@/lib/services/template-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const templateService = new TemplateService(supabase);
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, jsonl, csv
    const ids = searchParams.get('ids')?.split(','); // Optional: specific IDs
    
    // Fetch templates
    const templates = ids && ids.length > 0
      ? await Promise.all(ids.map(id => templateService.getById(id)))
      : await templateService.getAll();
    
    // Filter out nulls
    const validTemplates = templates.filter(t => t !== null);
    
    if (format === 'csv') {
      const csv = convertTemplatesToCSV(validTemplates);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="templates-${Date.now()}.csv"`,
        },
      });
    }
    
    if (format === 'jsonl') {
      const jsonl = validTemplates.map(t => JSON.stringify(t)).join('\n');
      return new NextResponse(jsonl, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Content-Disposition': `attachment; filename="templates-${Date.now()}.jsonl"`,
        },
      });
    }
    
    // Default: JSON
    return NextResponse.json(
      {
        data: validTemplates,
        exportedAt: new Date().toISOString(),
        count: validTemplates.length,
      },
      {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="templates-${Date.now()}.json"`,
        },
      }
    );
  } catch (error: any) {
    console.error('Export templates error:', error);
    return NextResponse.json(
      { error: 'Failed to export templates', details: error.message },
      { status: 500 }
    );
  }
}

function convertTemplatesToCSV(templates: any[]): string {
  if (templates.length === 0) return '';
  
  // CSV headers
  const headers = ['id', 'name', 'description', 'category', 'structure', 'tone', 'complexity_baseline', 'quality_threshold', 'usage_count', 'rating'];
  
  // CSV rows
  const rows = templates.map(t => [
    t.id,
    `"${t.name.replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.category,
    `"${t.structure.replace(/"/g, '""')}"`,
    t.tone,
    t.complexityBaseline || t.complexity_baseline,
    t.qualityThreshold || t.quality_threshold,
    t.usageCount || t.usage_count || 0,
    t.rating || 0,
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}
```

**Similar endpoints needed:**
- `src/app/api/export/scenarios/route.ts`
- `src/app/api/export/edge-cases/route.ts`

---

**Task 2: Import API Endpoints**

Create import endpoints with validation and preview:

**File**: `src/app/api/import/templates/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { TemplateService } from '@/lib/services/template-service';
import { z } from 'zod';
import { createTemplateSchema } from '@/lib/validation/templates';

// Import schema (array of templates)
const importTemplatesSchema = z.object({
  templates: z.array(createTemplateSchema),
  overwriteExisting: z.boolean().default(false),
  validateOnly: z.boolean().default(false), // Preview mode
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const templateService = new TemplateService(supabase);
    
    const body = await request.json();
    const { templates, overwriteExisting, validateOnly } = importTemplatesSchema.parse(body);
    
    // Validation phase
    const validationResults = await validateTemplates(templates, templateService);
    
    if (validateOnly) {
      // Return validation results for preview
      return NextResponse.json({
        valid: validationResults.valid,
        invalid: validationResults.invalid,
        summary: {
          total: templates.length,
          validCount: validationResults.valid.length,
          invalidCount: validationResults.invalid.length,
          duplicates: validationResults.duplicates.length,
        },
      }, { status: 200 });
    }
    
    // Import phase
    if (validationResults.invalid.length > 0) {
      return NextResponse.json({
        error: 'Some templates failed validation',
        invalid: validationResults.invalid,
      }, { status: 400 });
    }
    
    const imported = [];
    const errors = [];
    
    for (const template of validationResults.valid) {
      try {
        // Check if exists (by name)
        const existing = await templateService.getByName(template.name);
        
        if (existing && !overwriteExisting) {
          errors.push({
            template: template.name,
            error: 'Template already exists (use overwriteExisting flag)',
          });
          continue;
        }
        
        if (existing && overwriteExisting) {
          // Update existing
          const updated = await templateService.update(existing.id, template);
          imported.push(updated);
        } else {
          // Create new
          const created = await templateService.create(template);
          imported.push(created);
        }
      } catch (error: any) {
        errors.push({
          template: template.name,
          error: error.message,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      imported: imported.length,
      failed: errors.length,
      results: {
        imported,
        errors,
      },
    }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }
    
    console.error('Import templates error:', error);
    return NextResponse.json({
      error: 'Failed to import templates',
      details: error.message,
    }, { status: 500 });
  }
}

async function validateTemplates(templates: any[], service: any) {
  const valid = [];
  const invalid = [];
  const duplicates = [];
  
  for (const template of templates) {
    const errors = [];
    
    // Check required fields
    if (!template.name || template.name.length === 0) {
      errors.push('Name is required');
    }
    
    if (!template.structure || template.structure.length < 10) {
      errors.push('Structure must be at least 10 characters');
    }
    
    // Validate variables match placeholders
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    const placeholders = new Set<string>();
    let match;
    while ((match = placeholderRegex.exec(template.structure)) !== null) {
      placeholders.add(match[1]);
    }
    
    const variableNames = new Set(template.variables?.map((v: any) => v.name) || []);
    const missingVars = Array.from(placeholders).filter(p => !variableNames.has(p));
    
    if (missingVars.length > 0) {
      errors.push(`Missing variables: ${missingVars.join(', ')}`);
    }
    
    // Check for duplicates in batch
    const duplicateInBatch = templates.filter(t => t.name === template.name).length > 1;
    if (duplicateInBatch) {
      duplicates.push(template.name);
    }
    
    if (errors.length > 0) {
      invalid.push({
        template: template.name,
        errors,
      });
    } else {
      valid.push(template);
    }
  }
  
  return { valid, invalid, duplicates };
}
```

---

**Task 3: Variable Substitution Engine**

Create advanced template parser and substitution module:

**File**: `src/lib/template-engine/parser.ts`
```typescript
/**
 * Template Parser
 * 
 * Supports:
 * - Simple: {{variable}}
 * - Nested: {{user.name}}, {{config.api.endpoint}}
 * - Conditional: {{#if condition}}...{{/if}}
 * - Defaults: {{variable:default_value}}
 * - Optional: {{variable?}}
 */

export type TemplateToken = {
  type: 'text' | 'variable' | 'conditional';
  value: string;
  modifier?: 'optional' | 'default';
  defaultValue?: string;
  path?: string[]; // For nested access
};

export class TemplateParser {
  private template: string;
  private position: number = 0;
  
  constructor(template: string) {
    this.template = template;
  }
  
  parse(): TemplateToken[] {
    const tokens: TemplateToken[] = [];
    
    while (this.position < this.template.length) {
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }
    
    return tokens;
  }
  
  private nextToken(): TemplateToken | null {
    // Check for variable start
    if (this.peek(2) === '{{') {
      return this.parseVariable();
    }
    
    // Parse text until next variable
    return this.parseText();
  }
  
  private parseVariable(): TemplateToken {
    this.advance(2); // Skip {{
    
    let variable = '';
    while (this.position < this.template.length && this.peek(2) !== '}}') {
      variable += this.template[this.position];
      this.position++;
    }
    
    this.advance(2); // Skip }}
    
    // Parse variable syntax
    const token = this.parseVariableSyntax(variable.trim());
    return token;
  }
  
  private parseVariableSyntax(variable: string): TemplateToken {
    // Check for conditional: #if
    if (variable.startsWith('#if ')) {
      return {
        type: 'conditional',
        value: variable.substring(4).trim(),
      };
    }
    
    // Check for optional: variable?
    if (variable.endsWith('?')) {
      return {
        type: 'variable',
        value: variable.slice(0, -1),
        modifier: 'optional',
        path: variable.slice(0, -1).split('.'),
      };
    }
    
    // Check for default: variable:default
    if (variable.includes(':')) {
      const [varName, defaultValue] = variable.split(':');
      return {
        type: 'variable',
        value: varName.trim(),
        modifier: 'default',
        defaultValue: defaultValue.trim(),
        path: varName.trim().split('.'),
      };
    }
    
    // Check for nested: user.name
    if (variable.includes('.')) {
      return {
        type: 'variable',
        value: variable,
        path: variable.split('.'),
      };
    }
    
    // Simple variable
    return {
      type: 'variable',
      value: variable,
      path: [variable],
    };
  }
  
  private parseText(): TemplateToken {
    let text = '';
    
    while (this.position < this.template.length && this.peek(2) !== '{{') {
      text += this.template[this.position];
      this.position++;
    }
    
    return {
      type: 'text',
      value: text,
    };
  }
  
  private peek(length: number = 1): string {
    return this.template.substring(this.position, this.position + length);
  }
  
  private advance(count: number = 1): void {
    this.position += count;
  }
}
```

**File**: `src/lib/template-engine/substitution.ts`
```typescript
import { TemplateParser, TemplateToken } from './parser';

export type SubstitutionContext = Record<string, any>;

export class TemplateSubstitution {
  private context: SubstitutionContext;
  
  constructor(context: SubstitutionContext) {
    this.context = context;
  }
  
  substitute(template: string): string {
    const parser = new TemplateParser(template);
    const tokens = parser.parse();
    
    return tokens.map(token => this.resolveToken(token)).join('');
  }
  
  private resolveToken(token: TemplateToken): string {
    if (token.type === 'text') {
      return token.value;
    }
    
    if (token.type === 'variable') {
      return this.resolveVariable(token);
    }
    
    if (token.type === 'conditional') {
      return this.resolveConditional(token);
    }
    
    return '';
  }
  
  private resolveVariable(token: TemplateToken): string {
    const value = this.getValue(token.path!);
    
    // Handle optional
    if (token.modifier === 'optional' && value === undefined) {
      return '';
    }
    
    // Handle default
    if (token.modifier === 'default' && value === undefined) {
      return token.defaultValue || '';
    }
    
    // Return value or placeholder if not found
    if (value === undefined) {
      return `{{${token.value}}}`;
    }
    
    return String(value);
  }
  
  private resolveConditional(token: TemplateToken): string {
    // Simple conditional evaluation
    const condition = token.value;
    const value = this.context[condition];
    
    // Truthy check
    return value ? '[conditional-true]' : '[conditional-false]';
  }
  
  private getValue(path: string[]): any {
    let current = this.context;
    
    for (const key of path) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }
  
  // Validation: Check if all variables can be resolved
  validate(template: string): { valid: boolean; missing: string[] } {
    const parser = new TemplateParser(template);
    const tokens = parser.parse();
    
    const missing: string[] = [];
    
    for (const token of tokens) {
      if (token.type === 'variable') {
        const value = this.getValue(token.path!);
        
        // Skip optional variables
        if (token.modifier === 'optional') continue;
        
        // Skip variables with defaults
        if (token.modifier === 'default') continue;
        
        if (value === undefined) {
          missing.push(token.value);
        }
      }
    }
    
    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
```

---

**Task 4: Template Preview API & UI**

**File**: `src/app/api/templates/preview/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { TemplateSubstitution } from '@/lib/template-engine/substitution';
import { z } from 'zod';

const previewSchema = z.object({
  template: z.string(),
  variables: z.record(z.any()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, variables } = previewSchema.parse(body);
    
    const substitution = new TemplateSubstitution(variables);
    
    // Validate
    const validation = substitution.validate(template);
    
    // Substitute
    const resolved = substitution.substitute(template);
    
    return NextResponse.json({
      resolved,
      validation,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Template preview error:', error);
    return NextResponse.json({
      error: 'Failed to preview template',
      details: error.message,
    }, { status: 500 });
  }
}
```

**UI Component**: `src/components/templates/TemplatePreviewPanel.tsx`
```typescript
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

interface TemplatePreviewPanelProps {
  template: string;
  variables: Record<string, any>;
}

export function TemplatePreviewPanel({ template, variables }: TemplatePreviewPanelProps) {
  const [preview, setPreview] = useState('');
  const [validation, setValidation] = useState<{ valid: boolean; missing: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const debounce = setTimeout(() => {
      generatePreview();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [template, variables]);
  
  const generatePreview = async () => {
    if (!template) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, variables }),
      });
      
      const data = await response.json();
      setPreview(data.resolved);
      setValidation(data.validation);
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Template Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {validation && !validation.valid && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Missing variables: {validation.missing.join(', ')}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-gray-50 border rounded-lg p-4 min-h-[200px]">
          {loading ? (
            <p className="text-gray-400 italic">Generating preview...</p>
          ) : (
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {preview || 'No preview available'}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

**Task 5: Import/Export UI Components**

**File**: `src/components/import-export/ExportModal.tsx`
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  entityType: 'templates' | 'scenarios' | 'edge-cases';
  selectedIds?: string[];
}

export function ExportModal({ open, onClose, entityType, selectedIds }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'jsonl' | 'csv'>('json');
  const [exportAll, setExportAll] = useState(!selectedIds || selectedIds.length === 0);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (!exportAll && selectedIds && selectedIds.length > 0) {
        params.append('ids', selectedIds.join(','));
      }
      
      const response = await fetch(`/api/export/${entityType}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityType}-${Date.now()}.${format === 'jsonl' ? 'jsonl' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${entityType} exported successfully`);
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export {entityType}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="cursor-pointer">JSON (Structured)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jsonl" id="jsonl" />
                <Label htmlFor="jsonl" className="cursor-pointer">JSONL (Line-delimited)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="cursor-pointer">CSV (Spreadsheet)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exportAll"
              checked={exportAll}
              onCheckedChange={(checked) => setExportAll(checked as boolean)}
            />
            <Label htmlFor="exportAll" className="cursor-pointer">
              Export all {entityType} {!exportAll && selectedIds && `(${selectedIds.length} selected)`}
            </Label>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**File**: `src/components/import-export/ImportModal.tsx` - Similar structure with file upload and preview.

### TECHNICAL SPECIFICATIONS

**1. Export Formats:**
- **JSON**: Single file, pretty-printed, includes metadata
- **JSONL**: One JSON object per line, efficient for large datasets
- **CSV**: Flat structure, compatible with Excel/Google Sheets

**2. Import Validation:**
- Schema validation with Zod
- Variable-placeholder consistency check
- Duplicate name detection
- Foreign key validation (template IDs for scenarios)
- Preview mode before actual import

**3. Variable Substitution Features:**
- **Simple**: `{{name}}` → Direct replacement
- **Nested**: `{{user.profile.name}}` → Deep object access
- **Optional**: `{{nickname?}}` → Empty string if not found
- **Default**: `{{nickname:Anonymous}}` → Use default if not found
- **Conditional**: `{{#if premium}}VIP{{/if}}` → Conditional rendering

**4. Performance Considerations:**
- Stream large exports (don't load all in memory)
- Batch imports in chunks of 100
- Debounce preview generation (300ms)
- Cache parsed templates

### ACCEPTANCE CRITERIA

- [ ] Export templates to JSON works
- [ ] Export templates to CSV works
- [ ] Export scenarios with selected IDs only works
- [ ] Import modal shows file upload
- [ ] Import preview validates before import
- [ ] Import shows validation errors for invalid data
- [ ] Import with overwrite flag updates existing
- [ ] Simple variable substitution works
- [ ] Nested variable access works ({{user.name}})
- [ ] Optional variables work ({{var?}})
- [ ] Default values work ({{var:default}})
- [ ] Template preview API returns resolved template
- [ ] Template preview UI updates in real-time
- [ ] Missing variables are highlighted in preview
- [ ] Export/import round-trip preserves data
- [ ] Loading states display during operations
- [ ] Error messages are descriptive

### DELIVERABLES

1. Export API endpoints (3 files):
   - `src/app/api/export/templates/route.ts`
   - `src/app/api/export/scenarios/route.ts`
   - `src/app/api/export/edge-cases/route.ts`

2. Import API endpoints (3 files):
   - `src/app/api/import/templates/route.ts`
   - `src/app/api/import/scenarios/route.ts`
   - `src/app/api/import/edge-cases/route.ts`

3. Template Engine (2 files):
   - `src/lib/template-engine/parser.ts` (300-400 lines)
   - `src/lib/template-engine/substitution.ts` (200-300 lines)

4. Preview API:
   - `src/app/api/templates/preview/route.ts`

5. UI Components (3 files):
   - `src/components/import-export/ExportModal.tsx` (200-300 lines)
   - `src/components/import-export/ImportModal.tsx` (300-400 lines)
   - `src/components/templates/TemplatePreviewPanel.tsx` (150-200 lines)

6. Utilities:
   - `src/lib/utils/csv-converter.ts` (CSV conversion helpers)
   - `src/lib/utils/json-validator.ts` (JSON validation helpers)

Implement complete import/export system and advanced variable substitution engine with comprehensive validation and preview capabilities.

++++++++++++++++++

---

## Summary & Implementation Guide

### Document Overview

This document provides **comprehensive, production-ready specifications** for Prompts 4-6 of the E07 Template Management System implementation.

**Total Content**:
- **Prompt 4 (Scenarios UI)**: ~675 lines with complete code examples
- **Prompt 5 (Edge Cases UI)**: ~815 lines with full implementations
- **Prompt 6 (Import/Export & Variables)**: ~700+ lines with advanced features
- **Total**: ~2,200+ lines of detailed specifications

### Comparison to Original

| Prompt | Original Lines | Expanded Lines | Improvement |
|--------|---------------|----------------|-------------|
| Prompt 4 | 24 | 675 | **28x more detail** |
| Prompt 5 | 19 | 815 | **43x more detail** |
| Prompt 6 | 22 | 700+ | **32x more detail** |

### Key Features Added

**Prompt 4 - Scenarios UI**:
- Complete ScenarioCreateModal with template-driven forms (450+ lines code)
- CSV bulk import with Papa Parse integration
- Enhanced ScenariosView with checkbox selection and bulk operations
- Full API integration patterns
- Validation and error handling

**Prompt 5 - Edge Cases UI**:
- EdgeCaseCreateModal with complexity slider and type selection (400+ lines code)
- TestExecutionModal with expected/actual comparison (300+ lines code)
- Enhanced EdgeCasesView with filtering and color coding
- Test execution workflow with pass/fail logic
- Result comparison UI

**Prompt 6 - Import/Export & Variables**:
- Export API for JSON/JSONL/CSV formats
- Import API with validation and preview
- Advanced variable substitution engine:
  - Parser supporting nested, optional, default values
  - Substitution engine with validation
  - Template preview API and UI
- Complete import/export UI components

### How to Use This Document

1. **Review original E07 document** (`04-FR-wireframes-execution-E07.md`) for context
2. **Use this document** (`04-FR-wireframes-execution-E07-part2.md`) for Prompts 4-6
3. **Follow the order**: Complete Prompts 1-3 from original document first
4. **Then implement** Prompts 4-6 using these detailed specifications
5. **Refer to acceptance criteria** for validation

### Next Steps

- ✅ Prompts 1-3: Already complete (from original document)
- ✅ Prompt 4-6 specifications: Now complete (this document)
- ⏳ Ready for implementation execution

**All prompts now have equal detail and comprehensive specifications!** 🎉

---

**End of E07 Part 2 - Detailed Specifications**  
**Generated**: 2025-10-31  
**Total Prompts Expanded**: 3 (Prompts 4, 5, 6)  
**Total Lines**: ~2,200+


