/**
 * TemplateDetailModal Component
 * 
 * Read-only modal for viewing complete template details including
 * usage statistics, variables, and quick actions.
 */

import React from 'react';
import { Template, TemplateVariable } from '../../lib/types';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Edit,
  Copy,
  Trash2,
  Calendar,
  BarChart2,
  Star,
  CheckCircle,
  Archive,
  Tag,
  FileText,
  Code2,
} from 'lucide-react';
import { format } from 'date-fns';

interface TemplateDetailModalProps {
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onDelete?: (id: string) => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  hasNavigation?: boolean;
}

/**
 * TemplateDetailModal - Read-only view of template information
 */
export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  open,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onNavigatePrevious,
  onNavigateNext,
  hasNavigation = false,
}) => {
  if (!template) return null;

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'template':
        return 'default';
      case 'scenario':
        return 'secondary';
      case 'edge_case':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const highlightPlaceholders = (text: string) => {
    const parts = text.split(/(\{\{\w+\}\})/g);
    return parts.map((part, index) => {
      if (part.match(/\{\{\w+\}\}/)) {
        return (
          <span key={index} className="bg-purple-100 text-purple-700 font-semibold px-1 rounded">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      const duplicatedTemplate: Template = {
        ...template,
        id: '', // Clear ID for new template
        name: `${template.name} (Copy)`,
        usageCount: 0,
        rating: 0,
      };
      onDuplicate(duplicatedTemplate);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
      onDelete(template.id);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{template.name}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getTierColor(template.tier)}>
                  {template.tier || template.category}
                </Badge>
                {template.isActive !== undefined && (
                  <Badge variant={template.isActive ? 'default' : 'secondary'}>
                    {template.isActive ? (
                      <><CheckCircle className="h-3 w-3 mr-1 inline" /> Active</>
                    ) : (
                      <><Archive className="h-3 w-3 mr-1 inline" /> Inactive</>
                    )}
                  </Badge>
                )}
                {template.version && (
                  <Badge variant="outline">
                    v{template.version}
                  </Badge>
                )}
              </div>
            </div>
            {hasNavigation && (
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigatePrevious}
                  disabled={!onNavigatePrevious}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateNext}
                  disabled={!onNavigateNext}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Statistics Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Usage Count</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{template.usageCount || 0}</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Rating</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">
                {template.rating ? template.rating.toFixed(1) : 'N/A'}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Code2 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Variables</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {template.variables?.length || 0}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Quality Threshold</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {Math.round(template.qualityThreshold * 100)}%
              </p>
            </div>
          </div>

          {/* Description */}
          {template.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              </div>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border">
                {template.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Template Structure */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-4 w-4 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Template Structure</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap">
              {highlightPlaceholders(template.structure)}
            </div>
          </div>

          {/* Variables */}
          {template.variables && template.variables.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Variables</h3>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Default Value</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Help Text</th>
                    </tr>
                  </thead>
                  <tbody>
                    {template.variables.map((variable: TemplateVariable, index: number) => (
                      <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="p-3">
                          <code className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-mono">
                            {`{{${variable.name}}}`}
                          </code>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {variable.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-700">
                          {variable.defaultValue || <span className="text-gray-400 italic">None</span>}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {variable.helpText || <span className="text-gray-400 italic">No help text</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quality Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Quality Threshold</h3>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Minimum Score</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(template.qualityThreshold * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${template.qualityThreshold * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Complexity Baseline</h3>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Level</span>
                  <span className="font-semibold text-gray-900">
                    {template.complexityBaseline || 'Not set'}
                  </span>
                </div>
                {template.complexityBaseline && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(template.complexityBaseline / 10) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Required Elements */}
          {template.requiredElements && template.requiredElements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Required Elements</h3>
              <div className="flex flex-wrap gap-2">
                {template.requiredElements.map((element: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {element}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Style Notes */}
          {template.styleNotes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Style Notes</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                {template.styleNotes}
              </p>
            </div>
          )}

          {/* Example Conversation */}
          {template.exampleConversation && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Example Conversation</h3>
              <div className="bg-gray-50 p-4 rounded border font-mono text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                {template.exampleConversation}
              </div>
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">Created</span>
              </div>
              <p className="text-gray-600 ml-6">
                {template.lastModified ? formatDate(template.lastModified) : 'Unknown'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created By</span>
              <p className="text-gray-600">{template.createdBy || 'Unknown'}</p>
            </div>
            {template.applicablePersonas && template.applicablePersonas.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700 block mb-2">Applicable Personas</span>
                <div className="flex flex-wrap gap-1">
                  {template.applicablePersonas.map((persona, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {persona}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {template.applicableEmotions && template.applicableEmotions.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700 block mb-2">Applicable Emotions</span>
                <div className="flex flex-wrap gap-1">
                  {template.applicableEmotions.map((emotion, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 mt-6">
          <div className="flex-1 flex gap-2">
            {onEdit && (
              <Button variant="default" onClick={() => onEdit(template)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDuplicate && (
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

