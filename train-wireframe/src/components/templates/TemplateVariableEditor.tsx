/**
 * TemplateVariableEditor Component
 * 
 * Allows editing of template variables including name, type, default value, and options.
 */

import React from 'react';
import { TemplateVariable } from '../../lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Plus, X } from 'lucide-react';

interface TemplateVariableEditorProps {
  variables: TemplateVariable[];
  onChange: (variables: TemplateVariable[]) => void;
  onSampleValuesChange: (values: Record<string, any>) => void;
}

/**
 * TemplateVariableEditor - Manages the list of variables for a template
 */
export const TemplateVariableEditor: React.FC<TemplateVariableEditorProps> = ({
  variables,
  onChange,
  onSampleValuesChange,
}) => {
  const handleAddVariable = () => {
    const newVariable: TemplateVariable = {
      name: '',
      type: 'text',
      defaultValue: '',
      helpText: '',
    };
    onChange([...variables, newVariable]);
  };

  const handleRemoveVariable = (index: number) => {
    const updated = variables.filter((_, i) => i !== index);
    onChange(updated);
    updateSampleValues(updated);
  };

  const handleUpdateVariable = (
    index: number,
    updates: Partial<TemplateVariable>
  ) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
    updateSampleValues(updated);
  };

  const updateSampleValues = (vars: TemplateVariable[]) => {
    const sampleValues: Record<string, any> = {};
    vars.forEach((v) => {
      if (v.name) {
        sampleValues[v.name] = v.defaultValue || `[${v.name}]`;
      }
    });
    onSampleValuesChange(sampleValues);
  };

  return (
    <div className="space-y-3">
      {variables.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p className="text-sm">No variables defined</p>
          <p className="text-xs mt-1">Add variables to use placeholders in your template</p>
        </div>
      ) : (
        variables.map((variable, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 space-y-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor={`var-name-${index}`} className="text-xs">
                    Variable Name
                  </Label>
                  <Input
                    id={`var-name-${index}`}
                    placeholder="e.g., topic"
                    value={variable.name}
                    onChange={(e) =>
                      handleUpdateVariable(index, { name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`var-type-${index}`} className="text-xs">
                    Type
                  </Label>
                  <Select
                    value={variable.type}
                    onValueChange={(value) =>
                      handleUpdateVariable(index, {
                        type: value as TemplateVariable['type'],
                      })
                    }
                  >
                    <SelectTrigger id={`var-type-${index}`} className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`var-default-${index}`} className="text-xs">
                    Default Value
                  </Label>
                  <Input
                    id={`var-default-${index}`}
                    placeholder="Default..."
                    value={variable.defaultValue}
                    onChange={(e) =>
                      handleUpdateVariable(index, { defaultValue: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveVariable(index)}
                  className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove variable</span>
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor={`var-help-${index}`} className="text-xs">
                Help Text (Optional)
              </Label>
              <Input
                id={`var-help-${index}`}
                placeholder="Describe what this variable is for..."
                value={variable.helpText || ''}
                onChange={(e) =>
                  handleUpdateVariable(index, { helpText: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {variable.type === 'dropdown' && (
              <div>
                <Label htmlFor={`var-options-${index}`} className="text-xs">
                  Dropdown Options (comma-separated)
                </Label>
                <Input
                  id={`var-options-${index}`}
                  placeholder="option1, option2, option3"
                  value={variable.options?.join(', ') || ''}
                  onChange={(e) =>
                    handleUpdateVariable(index, {
                      options: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0),
                    })
                  }
                  className="mt-1"
                />
              </div>
            )}

            {variable.name && (
              <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                <span className="font-mono font-medium text-purple-600">
                  {`{{${variable.name}}}`}
                </span>
                {variable.helpText && (
                  <span className="ml-2 text-gray-500">- {variable.helpText}</span>
                )}
              </div>
            )}
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddVariable}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Variable
      </Button>

      {variables.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-900 mb-2">
            Available Placeholders:
          </p>
          <div className="flex flex-wrap gap-2">
            {variables
              .filter((v) => v.name)
              .map((v, idx) => (
                <code
                  key={idx}
                  className="text-xs px-2 py-1 bg-white border border-blue-300 rounded text-purple-600 font-mono"
                >
                  {`{{${v.name}}}`}
                </code>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

