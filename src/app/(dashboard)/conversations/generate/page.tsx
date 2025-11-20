'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/use-templates';
import { TemplateSelector } from '@/components/generation/TemplateSelector';
import { ParameterForm } from '@/components/generation/ParameterForm';
import { GenerationProgress } from '@/components/generation/GenerationProgress';
import { GenerationResult } from '@/components/generation/GenerationResult';
import { ScaffoldingSelector, ScaffoldingSelection } from '@/components/conversations/scaffolding-selector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Template } from '@/types/templates';
import { GenerationParameters } from '@/lib/schemas/generation';

type GenerationMode = 'template' | 'scaffolding';

export default function GeneratePage() {
  const router = useRouter();
  const { templates, loading: templatesLoading } = useTemplates();

  const [mode, setMode] = useState<GenerationMode>('scaffolding');
  const [step, setStep] = useState<'select' | 'configure' | 'generating' | 'complete'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [scaffoldingSelection, setScaffoldingSelection] = useState<ScaffoldingSelection>({
    persona_id: null,
    emotional_arc_id: null,
    training_topic_id: null,
    tier: 'template'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'starting' | 'generating' | 'validating' | 'saving' | 'complete'>('starting');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setStep('configure');
  };

  const handleSubmitParameters = async (params: GenerationParameters) => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    setStep('generating');
    setProgress(10);
    setStatus('starting');
    setError(null);

    try {
      // Simulate progress stages
      setTimeout(() => {
        setProgress(20);
        setStatus('generating');
      }, 500);

      const response = await fetch('/api/conversations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          parameters: {
            persona: params.persona,
            emotion: params.emotion,
            topic: params.topic,
          },
          tier: selectedTemplate.tier,
          temperature: params.temperature,
          maxTokens: params.maxTokens,
          category: params.category,
          chunkId: params.chunkId,
          documentId: params.documentId,
        })
      });

      setProgress(85);
      setStatus('validating');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await response.json();

      setProgress(95);
      setStatus('saving');

      setTimeout(() => {
        setProgress(100);
        setStatus('complete');
        setResult(data);
        setStep('complete');
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('complete');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWithScaffolding = async () => {
    if (!scaffoldingSelection.persona_id || !scaffoldingSelection.emotional_arc_id || !scaffoldingSelection.training_topic_id) {
      return;
    }

    setIsGenerating(true);
    setStep('generating');
    setProgress(10);
    setStatus('starting');
    setError(null);

    try {
      // Simulate progress stages
      setTimeout(() => {
        setProgress(30);
        setStatus('generating');
      }, 500);

      const response = await fetch('/api/conversations/generate-with-scaffolding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scaffoldingSelection)
      });

      setProgress(85);
      setStatus('validating');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await response.json();

      setProgress(95);
      setStatus('saving');

      // Trigger enrichment pipeline in separate API call
      // This ensures enrichment runs in its own serverless function with full execution time
      if (data.conversation?.conversation_id) {
        fetch(`/api/conversations/${data.conversation.conversation_id}/enrich`, {
          method: 'POST'
        })
          .then(enrichRes => enrichRes.json())
          .then(enrichData => {
            if (enrichData.success) {
              console.log('Enrichment completed:', enrichData.final_status);
            } else {
              console.error('Enrichment failed:', enrichData.error);
            }
          })
          .catch(err => {
            console.error('Failed to trigger enrichment:', err);
          });
      }

      setTimeout(() => {
        setProgress(100);
        setStatus('complete');
        setResult(data);
        setStep('complete');
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('complete');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewConversation = () => {
    if (result?.conversation?.id) {
      router.push(`/conversations?id=${result.conversation.id}`);
    }
  };

  const handleGenerateAnother = () => {
    setStep('select');
    setSelectedTemplate(null);
    setScaffoldingSelection({
      persona_id: null,
      emotional_arc_id: null,
      training_topic_id: null,
      tier: 'template'
    });
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const handleGoToDashboard = () => {
    router.push('/conversations');
  };

  const isScaffoldingSelectionComplete = 
    scaffoldingSelection.persona_id &&
    scaffoldingSelection.emotional_arc_id &&
    scaffoldingSelection.training_topic_id;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Generate New Conversation</h1>
          <p className="text-muted-foreground">
            Create an AI-powered training conversation
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Step 1: Selection (Template or Scaffolding) */}
        {step === 'select' && (
          <div className="space-y-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as GenerationMode)}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="scaffolding">Scaffolding-Based</TabsTrigger>
                <TabsTrigger value="template">Template-Based</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scaffolding" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Configure Conversation Scaffolding</h2>
                    <p className="text-muted-foreground">
                      Select persona, emotional journey, and training topic to generate a structured conversation
                    </p>
                  </div>
                  <Card className="p-6">
                    <ScaffoldingSelector
                      value={scaffoldingSelection}
                      onChange={setScaffoldingSelection}
                      disabled={isGenerating}
                    />
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={handleGenerateWithScaffolding}
                        disabled={!isScaffoldingSelectionComplete || isGenerating}
                        size="lg"
                      >
                        {isGenerating ? 'Generating...' : 'Generate Conversation'}
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="template" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Select a Template</h2>
                    <p className="text-muted-foreground">
                      Choose a template to use for generating your conversation
                    </p>
                  </div>
                  <TemplateSelector
                    templates={templates}
                    selectedTemplateId={selectedTemplate?.id || null}
                    onSelectTemplate={handleSelectTemplate}
                    loading={templatesLoading}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Step 2: Parameter Configuration */}
        {step === 'configure' && selectedTemplate && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Step 2: Configure Parameters</h2>
              <p className="text-muted-foreground">
                Enter the parameters for your conversation
              </p>
            </div>
            <div className="max-w-2xl">
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected Template:</p>
                <p className="text-lg">{selectedTemplate.template_name}</p>
              </div>
              <ParameterForm
                onSubmit={handleSubmitParameters}
                disabled={isGenerating}
              />
              <Button
                variant="outline"
                onClick={() => setStep('select')}
                className="w-full mt-4"
                disabled={isGenerating}
              >
                Back to Template Selection
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === 'generating' && (
          <div className="max-w-2xl mx-auto">
            <GenerationProgress
              status={status}
              progress={progress}
              estimatedTimeRemaining={Math.max(0, Math.floor((100 - progress) / 2))}
            />
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="max-w-2xl mx-auto">
            <GenerationResult
              result={result}
              error={error}
              onViewConversation={handleViewConversation}
              onGenerateAnother={handleGenerateAnother}
              onGoToDashboard={handleGoToDashboard}
            />
          </div>
        )}
      </div>
    </div>
  );
}

