import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
        
        {validation && validation.valid && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              All variables resolved successfully
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

