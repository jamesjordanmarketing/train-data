'use client';

import { useState } from 'react';
import { TemplateSelector } from '@/components/generation/TemplateSelector';
import { ParameterForm } from '@/components/generation/ParameterForm';
import { useTemplates } from '@/hooks/use-templates';
import { Template } from '@/types/templates';
import { GenerationParameters } from '@/lib/schemas/generation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function GenerationTestPage() {
  const { templates, loading, error } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [generationParams, setGenerationParams] = useState<GenerationParameters | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    console.log('Template selected:', template);
  };

  const handleSubmitParameters = async (params: GenerationParameters) => {
    console.log('Parameters submitted:', params);
    setGenerationParams(params);
    
    // Simulate API call
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Generation complete! Check console for params.');
    }, 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Generation Components Test</h1>
        <p className="text-muted-foreground">
          Testing TemplateSelector and ParameterForm components
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Template Selector Section */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Template</CardTitle>
            <CardDescription>
              Choose a conversation template from the options below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateSelector
              templates={templates}
              selectedTemplateId={selectedTemplate?.id ?? null}
              onSelectTemplate={handleSelectTemplate}
              loading={loading}
            />
          </CardContent>
        </Card>
      </section>

      {/* Selected Template Info */}
      {selectedTemplate && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Template Selected</AlertTitle>
          <AlertDescription className="text-green-700">
            <strong>{selectedTemplate.template_name}</strong> - {selectedTemplate.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Parameter Form Section */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Configure Parameters</CardTitle>
            <CardDescription>
              Provide the required parameters for conversation generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ParameterForm
              onSubmit={handleSubmitParameters}
              disabled={isGenerating || !selectedTemplate}
              defaultValues={{
                persona: '',
                emotion: '',
                topic: '',
              }}
            />
          </CardContent>
        </Card>
      </section>

      {/* Debug Info */}
      <section>
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-sm font-mono">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>
                <strong>Templates Loaded:</strong> {templates.length}
              </div>
              <div>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Selected Template:</strong>{' '}
                {selectedTemplate ? selectedTemplate.template_name : 'None'}
              </div>
              <div>
                <strong>Is Generating:</strong> {isGenerating ? 'Yes' : 'No'}
              </div>
              {generationParams && (
                <div className="mt-4">
                  <strong>Last Generation Params:</strong>
                  <pre className="mt-2 p-3 bg-slate-800 text-green-400 rounded overflow-x-auto">
                    {JSON.stringify(generationParams, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

