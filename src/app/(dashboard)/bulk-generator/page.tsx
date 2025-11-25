'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Zap, AlertTriangle, ArrowLeft, Layers, Users, Heart, BookOpen } from 'lucide-react';
import { useScaffoldingData } from '@/hooks/use-scaffolding-data';
import type { ParameterSet, BatchSubmitResponse } from '@/lib/types/bulk-generator.types';

// Cost estimation constants
const AVG_COST_PER_CONVERSATION = 0.45; // USD
const AVG_TIME_PER_CONVERSATION = 60; // seconds
const CONCURRENCY = 3;

// Default template ID - will auto-select if not hardcoded
const DEFAULT_TEMPLATE_ID = '00000000-0000-0000-0000-000000000000';

export default function BulkGeneratorPage() {
  const router = useRouter();
  const { personas, coreArcs, edgeArcs, topics, loading, error } = useScaffoldingData();
  
  // State
  const [category, setCategory] = useState<'core' | 'edge'>('core');
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [selectedArcIds, setSelectedArcIds] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get arcs based on category
  const availableArcs = category === 'core' ? coreArcs : edgeArcs;

  // Reset arc selection when category changes
  const handleCategoryChange = (newCategory: 'core' | 'edge') => {
    setCategory(newCategory);
    setSelectedArcIds([]); // Clear arc selection when switching categories
  };

  // Calculate estimates
  const estimate = useMemo(() => {
    const count = selectedPersonaIds.length * selectedArcIds.length * selectedTopicIds.length;
    const effectiveTime = (count / CONCURRENCY) * AVG_TIME_PER_CONVERSATION;
    
    return {
      conversationCount: count,
      formula: `${selectedPersonaIds.length} persona${selectedPersonaIds.length !== 1 ? 's' : ''} × ${selectedArcIds.length} arc${selectedArcIds.length !== 1 ? 's' : ''} × ${selectedTopicIds.length} topic${selectedTopicIds.length !== 1 ? 's' : ''}`,
      estimatedTimeMinutes: Math.ceil(effectiveTime / 60),
      estimatedCostUSD: count * AVG_COST_PER_CONVERSATION
    };
  }, [selectedPersonaIds.length, selectedArcIds.length, selectedTopicIds.length]);

  // Generate parameter sets for batch API
  const generateParameterSets = (): ParameterSet[] => {
    const sets: ParameterSet[] = [];
    
    for (const personaId of selectedPersonaIds) {
      for (const arcId of selectedArcIds) {
        for (const topicId of selectedTopicIds) {
          sets.push({
            templateId: DEFAULT_TEMPLATE_ID,
            parameters: {
              persona_id: personaId,
              emotional_arc_id: arcId,
              training_topic_id: topicId
            },
            tier: category === 'edge' ? 'edge_case' : 'template'
          });
        }
      }
    }
    
    return sets;
  };

  // Submit batch
  const handleSubmit = async () => {
    if (estimate.conversationCount === 0) {
      setSubmitError('Please select at least one persona, arc, and topic');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const parameterSets = generateParameterSets();
      
      const response = await fetch('/api/conversations/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${category === 'core' ? 'Core' : 'Edge Case'} Batch - ${new Date().toLocaleString()}`,
          parameterSets,
          concurrentProcessing: CONCURRENCY,
          errorHandling: 'continue',
          userId: '00000000-0000-0000-0000-000000000000' // TODO: Use real auth
        })
      });

      const result: BatchSubmitResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit batch');
      }

      // Redirect to batch monitoring page
      if (result.jobId) {
        router.push(`/batch-jobs/${result.jobId}`);
      } else {
        router.push('/batch-jobs');
      }
      
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit batch');
      setSubmitting(false);
    }
  };

  // Toggle helpers
  const togglePersona = (id: string) => {
    setSelectedPersonaIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleArc = (id: string) => {
    setSelectedArcIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleTopic = (id: string) => {
    setSelectedTopicIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllPersonas = () => {
    if (selectedPersonaIds.length === personas.length) {
      setSelectedPersonaIds([]);
    } else {
      setSelectedPersonaIds(personas.map(p => p.id));
    }
  };

  const selectAllArcs = () => {
    if (selectedArcIds.length === availableArcs.length) {
      setSelectedArcIds([]);
    } else {
      setSelectedArcIds(availableArcs.map(a => a.id));
    }
  };

  const selectAllTopics = () => {
    if (selectedTopicIds.length === topics.length) {
      setSelectedTopicIds([]);
    } else {
      setSelectedTopicIds(topics.map(t => t.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading scaffolding data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-destructive font-medium">Error loading data</p>
        <p className="text-muted-foreground text-sm max-w-md text-center">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Conversation Generator</h1>
          <p className="text-muted-foreground mt-1">
            Select parameters to generate multiple training conversations at once.
          </p>
        </div>
      </div>

      {/* Conversation Category */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Conversation Category
          </CardTitle>
          <CardDescription>
            Choose the type of conversations to generate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={category} 
            onValueChange={(v) => handleCategoryChange(v as 'core' | 'edge')}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="core" id="core" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="core" className="font-medium cursor-pointer">Core Conversations</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Standard emotional journeys (Confusion → Clarity, Fear → Confidence, etc.)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="edge" id="edge" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="edge" className="font-medium cursor-pointer">Edge Case Conversations</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Boundary and crisis scenarios (Crisis → Referral, Hostility → Boundary, etc.)
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Personas */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personas
            </CardTitle>
            <CardDescription>
              {personas.length} available • {selectedPersonaIds.length} selected
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAllPersonas}
          >
            {selectedPersonaIds.length === personas.length ? 'Deselect All' : 'Select All'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {personas.map(persona => (
              <div 
                key={persona.id} 
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`persona-${persona.id}`}
                  checked={selectedPersonaIds.includes(persona.id)}
                  onCheckedChange={() => togglePersona(persona.id)}
                />
                <Label 
                  htmlFor={`persona-${persona.id}`} 
                  className="flex-1 cursor-pointer"
                >
                  <span className="font-medium">{persona.name}</span>
                  {persona.archetype && (
                    <span className="text-muted-foreground ml-2 text-sm">— {persona.archetype}</span>
                  )}
                </Label>
              </div>
            ))}
            {personas.length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No personas found. Please check your database setup.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emotional Arcs */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {category === 'core' ? 'Emotional Arcs' : 'Edge Case Arcs'}
            </CardTitle>
            <CardDescription>
              {availableArcs.length} available • {selectedArcIds.length} selected
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAllArcs}
            disabled={availableArcs.length === 0}
          >
            {selectedArcIds.length === availableArcs.length && availableArcs.length > 0 ? 'Deselect All' : 'Select All'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableArcs.map(arc => (
              <div 
                key={arc.id} 
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`arc-${arc.id}`}
                  checked={selectedArcIds.includes(arc.id)}
                  onCheckedChange={() => toggleArc(arc.id)}
                />
                <Label 
                  htmlFor={`arc-${arc.id}`} 
                  className="flex-1 cursor-pointer"
                >
                  <span className="font-medium">{arc.name}</span>
                  {arc.arc_strategy && (
                    <span className="text-muted-foreground ml-2 text-sm">— {arc.arc_strategy}</span>
                  )}
                </Label>
              </div>
            ))}
            {availableArcs.length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No {category === 'core' ? 'core' : 'edge case'} arcs found. Please check your database setup.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Training Topics */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Training Topics
            </CardTitle>
            <CardDescription>
              {topics.length} available • {selectedTopicIds.length} selected
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAllTopics}
            disabled={topics.length === 0}
          >
            {selectedTopicIds.length === topics.length && topics.length > 0 ? 'Deselect All' : 'Select All'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2">
            {topics.map(topic => (
              <div 
                key={topic.id} 
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`topic-${topic.id}`}
                  checked={selectedTopicIds.includes(topic.id)}
                  onCheckedChange={() => toggleTopic(topic.id)}
                />
                <Label 
                  htmlFor={`topic-${topic.id}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  <span className="font-medium">{topic.name}</span>
                  {topic.category && (
                    <span className="text-muted-foreground block text-xs">{topic.category}</span>
                  )}
                </Label>
              </div>
            ))}
            {topics.length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center col-span-2">
                No training topics found. Please check your database setup.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batch Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Batch Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Conversations to Generate</p>
              <p className="text-4xl font-bold tracking-tight">{estimate.conversationCount}</p>
              <p className="text-xs text-muted-foreground">{estimate.formula}</p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Time</p>
                <p className="text-xl font-semibold">
                  ~{estimate.estimatedTimeMinutes} {estimate.estimatedTimeMinutes === 1 ? 'minute' : 'minutes'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="text-xl font-semibold">${estimate.estimatedCostUSD.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitting || estimate.conversationCount === 0}
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Batch...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate {estimate.conversationCount} Conversations
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

