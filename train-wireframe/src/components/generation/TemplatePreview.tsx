import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { Template } from '../../lib/types';
import { generatePreview } from '../../lib/ai';

interface TemplatePreviewProps {
  template: Template | null;
  parameters: Record<string, any>;
  className?: string;
}

export function TemplatePreview({ template, parameters, className }: TemplatePreviewProps) {
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [highlightPlaceholders, setHighlightPlaceholders] = useState(true);

  useEffect(() => {
    if (!template) {
      setPreview('');
      setErrors([]);
      return;
    }

    const result = generatePreview(template, parameters);
    setPreview(result.preview);
    setErrors(result.errors);
  }, [template, parameters]);

  if (!template) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4" />
            Template Preview
          </CardTitle>
          <CardDescription>Select a template to see a live preview</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Highlight unfilled placeholders in the preview
  const renderPreviewWithHighlights = () => {
    if (!highlightPlaceholders) {
      return preview;
    }

    const parts = preview.split(/(\{\{\w+\}\})/g);
    return parts.map((part, index) => {
      if (part.match(/\{\{\w+\}\}/)) {
        return (
          <span 
            key={index} 
            className="bg-yellow-200 text-yellow-900 px-1 py-0.5 rounded font-mono text-sm"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" />
              Template Preview
            </CardTitle>
            <CardDescription>Live preview with current parameters</CardDescription>
          </div>
          {errors.length === 0 && preview && !preview.includes('{{') && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          )}
          {errors.length > 0 && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.length} Error{errors.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Template:</span>
            <p className="font-medium">{template.name}</p>
          </div>
          <div>
            <span className="text-gray-600">Category:</span>
            <p className="font-medium">{template.category}</p>
          </div>
        </div>

        {/* Preview Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">Resolved Template:</label>
            <button
              type="button"
              onClick={() => setHighlightPlaceholders(!highlightPlaceholders)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {highlightPlaceholders ? 'Hide' : 'Show'} Placeholders
            </button>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap text-sm font-mono leading-relaxed">
            {preview || 'Enter parameter values to see preview...'}
          </div>
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-1">Validation Errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Template Metadata */}
        <div className="pt-4 border-t space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Tone:</span> {template.tone}
            </div>
            <div>
              <span className="font-medium">Complexity:</span> {template.complexityBaseline}/10
            </div>
            <div>
              <span className="font-medium">Quality Threshold:</span> {template.qualityThreshold}
            </div>
            <div>
              <span className="font-medium">Usage:</span> {template.usageCount} times
            </div>
          </div>
          {template.styleNotes && (
            <div className="text-xs">
              <span className="font-medium text-gray-600">Style Notes:</span>
              <p className="text-gray-500 mt-1">{template.styleNotes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

