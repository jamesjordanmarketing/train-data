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
  template_id?: string | null;
}

interface AvailableTemplate {
  id: string;
  template_name: string;
  description?: string;
  quality_threshold?: number;
  rating?: number;
}

export function ScaffoldingSelector({ value, onChange, disabled }: ScaffoldingSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [emotionalArcs, setEmotionalArcs] = useState<EmotionalArc[]>([]);
  const [trainingTopics, setTrainingTopics] = useState<TrainingTopic[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<AvailableTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
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

  useEffect(() => {
    // Load available templates when emotional arc changes (arc-first strategy)
    if (value.emotional_arc_id) {
      loadAvailableTemplates();
    } else {
      setAvailableTemplates([]);
    }
  }, [value.emotional_arc_id, value.tier, value.persona_id, value.training_topic_id]);

  async function loadScaffoldingData() {
    try {
      setLoading(true);
      setError(null);

      const [personasRes, arcsRes, topicsRes] = await Promise.all([
        fetch('/api/scaffolding/personas'),
        fetch('/api/scaffolding/emotional-arcs'),
        fetch('/api/scaffolding/training-topics')
      ]);

      // Check each response and log specific errors
      if (!personasRes.ok) {
        const errorText = await personasRes.text();
        console.error('Personas API error:', personasRes.status, errorText);
        throw new Error(`Failed to load personas: ${personasRes.status}`);
      }
      if (!arcsRes.ok) {
        const errorText = await arcsRes.text();
        console.error('Emotional arcs API error:', arcsRes.status, errorText);
        throw new Error(`Failed to load emotional arcs: ${arcsRes.status}`);
      }
      if (!topicsRes.ok) {
        const errorText = await topicsRes.text();
        console.error('Training topics API error:', topicsRes.status, errorText);
        throw new Error(`Failed to load training topics: ${topicsRes.status}`);
      }

      const [personasData, arcsData, topicsData] = await Promise.all([
        personasRes.json(),
        arcsRes.json(),
        topicsRes.json()
      ]);

      const personasList = personasData.personas || [];
      const arcsList = arcsData.emotional_arcs || [];
      const topicsList = topicsData.training_topics || [];

      console.log('Scaffolding data loaded:', {
        personas: personasList.length,
        arcs: arcsList.length,
        topics: topicsList.length
      });

      // Check if we have any data
      if (personasList.length === 0 && arcsList.length === 0 && topicsList.length === 0) {
        throw new Error('No scaffolding data found. Database tables may be empty. Please run setup scripts or contact administrator.');
      }

      setPersonas(personasList);
      setEmotionalArcs(arcsList);
      setTrainingTopics(topicsList);
    } catch (error) {
      console.error('Failed to load scaffolding data:', error);
      setError(`Failed to load scaffolding data: ${error instanceof Error ? error.message : 'Unknown error'}. Please refresh the page or check console for details.');
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

  async function loadAvailableTemplates() {
    try {
      setLoadingTemplates(true);
      
      // Find the selected emotional arc to get its arc_type
      const selectedArc = emotionalArcs.find(arc => arc.id === value.emotional_arc_id);
      if (!selectedArc) return;

      const selectedPersona = personas.find(p => p.id === value.persona_id);
      const selectedTopic = trainingTopics.find(t => t.id === value.training_topic_id);

      // Build query parameters
      const params = new URLSearchParams({
        emotional_arc_type: selectedArc.arc_type,
        tier: value.tier,
      });

      if (selectedPersona) {
        params.append('persona_type', selectedPersona.persona_type);
      }
      if (selectedTopic) {
        params.append('topic_key', selectedTopic.topic_key);
      }

      const res = await fetch(`/api/templates/select?${params.toString()}`);
      
      if (res.ok) {
        const result = await res.json();
        setAvailableTemplates(result.templates || []);
      }
    } catch (error) {
      console.error('Failed to load available templates:', error);
      // Don't show error to user, just log it
    } finally {
      setLoadingTemplates(false);
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

      {/* Available Templates (Arc-First Selection) */}
      {value.emotional_arc_id && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="template-select">Available Templates (Optional)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>
                    Select a specific template or leave blank to auto-select the best match.
                    Templates are filtered based on your emotional arc selection (arc-first strategy).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {loadingTemplates ? (
            <div className="h-10 bg-muted animate-pulse rounded" />
          ) : availableTemplates.length > 0 ? (
            <Select
              value={value.template_id || undefined}
              onValueChange={(val) => onChange({ ...value, template_id: val })}
              disabled={disabled}
            >
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Auto-select best template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <span className="text-muted-foreground">Auto-select best match</span>
                </SelectItem>
                {availableTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.template_name}</span>
                      {template.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </span>
                      )}
                      {(template.quality_threshold || template.rating) && (
                        <span className="text-xs text-muted-foreground">
                          {template.quality_threshold && `Quality: ${template.quality_threshold}/10`}
                          {template.quality_threshold && template.rating && ' • '}
                          {template.rating && `Rating: ${template.rating}/5`}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription className="text-sm">
                No templates found for this combination. Try adjusting your selections.
              </AlertDescription>
            </Alert>
          )}
          
          {availableTemplates.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Found {availableTemplates.length} compatible template{availableTemplates.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

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

