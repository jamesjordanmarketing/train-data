'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Persona, EmotionalArc, TrainingTopic } from '@/lib/types/scaffolding.types';
import { Card } from '@/components/ui/card';

interface ScaffoldingSelectorProps {
  value: ScaffoldingSelection;
  onChange: (selection: ScaffoldingSelection) => void;
  disabled?: boolean;
}

export interface ScaffoldingSelection {
  persona_id: string | null;
  emotional_arc_id: string | null;
  training_topic_id: string | null;
  tier: 'template' | 'scenario' | 'edge_case';
}

export function ScaffoldingSelector({ value, onChange, disabled }: ScaffoldingSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [emotionalArcs, setEmotionalArcs] = useState<EmotionalArc[]>([]);
  const [trainingTopics, setTrainingTopics] = useState<TrainingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compatibilityWarnings, setCompatibilityWarnings] = useState<string[]>([]);

  useEffect(() => {
    loadScaffoldingData();
  }, []);

  useEffect(() => {
    if (value.persona_id && value.emotional_arc_id && value.training_topic_id) {
      checkCompatibility();
    } else {
      setCompatibilityWarnings([]);
    }
  }, [value.persona_id, value.emotional_arc_id, value.training_topic_id]);

  async function loadScaffoldingData() {
    try {
      setLoading(true);
      setError(null);

      const [personasRes, arcsRes, topicsRes] = await Promise.all([
        fetch('/api/scaffolding/personas'),
        fetch('/api/scaffolding/emotional-arcs'),
        fetch('/api/scaffolding/training-topics')
      ]);

      if (!personasRes.ok || !arcsRes.ok || !topicsRes.ok) {
        throw new Error('Failed to load scaffolding data');
      }

      const [personasData, arcsData, topicsData] = await Promise.all([
        personasRes.json(),
        arcsRes.json(),
        topicsRes.json()
      ]);

      setPersonas(personasData.personas || []);
      setEmotionalArcs(arcsData.emotional_arcs || []);
      setTrainingTopics(topicsData.training_topics || []);
    } catch (error) {
      console.error('Failed to load scaffolding data:', error);
      setError('Failed to load scaffolding data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  async function checkCompatibility() {
    try {
      const res = await fetch('/api/scaffolding/check-compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_id: value.persona_id,
          emotional_arc_id: value.emotional_arc_id,
          training_topic_id: value.training_topic_id
        })
      });

      if (res.ok) {
        const result = await res.json();
        setCompatibilityWarnings(result.warnings || []);
      }
    } catch (error) {
      console.error('Failed to check compatibility:', error);
      // Don't show error to user, just log it
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Persona Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="persona-select">Client Persona</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Select the client character profile. This defines demographics, personality traits, and communication style.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={value.persona_id || undefined}
          onValueChange={(val) => onChange({ ...value, persona_id: val })}
          disabled={disabled}
        >
          <SelectTrigger id="persona-select">
            <SelectValue placeholder="Select a persona..." />
          </SelectTrigger>
          <SelectContent>
            {personas.map((persona) => (
              <SelectItem key={persona.id} value={persona.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{persona.name}</span>
                  {persona.archetype_summary && (
                    <span className="text-xs text-muted-foreground">{persona.archetype_summary}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Emotional Arc Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="arc-select">Emotional Journey</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Select the emotional transformation pattern. This is the PRIMARY selector that determines conversation structure and response strategy.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={value.emotional_arc_id || undefined}
          onValueChange={(val) => onChange({ ...value, emotional_arc_id: val })}
          disabled={disabled}
        >
          <SelectTrigger id="arc-select">
            <SelectValue placeholder="Select an emotional arc..." />
          </SelectTrigger>
          <SelectContent>
            {emotionalArcs.map((arc) => (
              <SelectItem key={arc.id} value={arc.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{arc.name}</span>
                  {arc.when_to_use && (
                    <span className="text-xs text-muted-foreground">{arc.when_to_use}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Training Topic Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="topic-select">Training Topic</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Select the specific conversation topic. This provides domain context and typical questions.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={value.training_topic_id || undefined}
          onValueChange={(val) => onChange({ ...value, training_topic_id: val })}
          disabled={disabled}
        >
          <SelectTrigger id="topic-select">
            <SelectValue placeholder="Select a topic..." />
          </SelectTrigger>
          <SelectContent>
            {trainingTopics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{topic.name}</span>
                  {(topic.category || topic.complexity_level) && (
                    <span className="text-xs text-muted-foreground">
                      {topic.category && topic.category}
                      {topic.category && topic.complexity_level && ' • '}
                      {topic.complexity_level && topic.complexity_level}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tier Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="tier-select">Conversation Tier</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Select the conversation complexity tier. Template (basic patterns), Scenario (domain-specific), or Edge Case (boundary conditions).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={value.tier}
          onValueChange={(val) => onChange({ ...value, tier: val as 'template' | 'scenario' | 'edge_case' })}
          disabled={disabled}
        >
          <SelectTrigger id="tier-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="template">
              <div className="flex flex-col">
                <span className="font-medium">Template (Tier 1)</span>
                <span className="text-xs text-muted-foreground">Foundation patterns and basic structures</span>
              </div>
            </SelectItem>
            <SelectItem value="scenario">
              <div className="flex flex-col">
                <span className="font-medium">Scenario (Tier 2)</span>
                <span className="text-xs text-muted-foreground">Domain-specific contexts and situations</span>
              </div>
            </SelectItem>
            <SelectItem value="edge_case">
              <div className="flex flex-col">
                <span className="font-medium">Edge Case (Tier 3)</span>
                <span className="text-xs text-muted-foreground">Boundary conditions and rare scenarios</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compatibility Warnings */}
      {compatibilityWarnings.length > 0 && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong className="font-medium">Compatibility Notes:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              {compatibilityWarnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

