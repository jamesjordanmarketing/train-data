'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/use-templates';
import { TemplateSelector } from '@/components/generation/TemplateSelector';
import { ParameterForm } from '@/components/generation/ParameterForm';
import { GenerationProgress } from '@/components/generation/GenerationProgress';
import { GenerationResult } from '@/components/generation/GenerationResult';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Template } from '@/types/templates';
import { GenerationParameters } from '@/lib/schemas/generation';

export default function GeneratePage() {
  const router = useRouter();
  const { templates, loading: templatesLoading } = useTemplates();

  const [step, setStep] = useState<'select' | 'configure' | 'generating' | 'complete'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
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

  const handleViewConversation = () => {
    if (result?.conversation?.id) {
      router.push(`/conversations?id=${result.conversation.id}`);
    }
  };

  const handleGenerateAnother = () => {
    setStep('select');
    setSelectedTemplate(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const handleGoToDashboard = () => {
    router.push('/conversations');
  };

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

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step === 'select' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'select' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            1
          </div>
          <span>Select Template</span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className={`flex items-center gap-2 ${step === 'configure' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'configure' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            2
          </div>
          <span>Configure</span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className={`flex items-center gap-2 ${step === 'generating' || step === 'complete' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'generating' || step === 'complete' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            3
          </div>
          <span>Generate</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Step 1: Template Selection */}
        {step === 'select' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Step 1: Select a Template</h2>
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

