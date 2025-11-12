'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generationParametersSchema, GenerationParameters } from '@/lib/schemas/generation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ParameterFormProps {
  onSubmit: (params: GenerationParameters) => void;
  disabled?: boolean;
  defaultValues?: Partial<GenerationParameters>;
}

const PERSONA_SUGGESTIONS = [
  'Sales Manager',
  'Account Executive',
  'Customer Success Manager',
  'Sales Development Rep',
  'Product Manager',
  'Marketing Director',
];

const EMOTION_SUGGESTIONS = [
  'Excited',
  'Frustrated',
  'Determined',
  'Optimistic',
  'Concerned',
  'Confused',
  'Confident',
];

export function ParameterForm({ onSubmit, disabled, defaultValues }: ParameterFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<GenerationParameters>({
    resolver: zodResolver(generationParametersSchema),
    mode: 'onChange',
    defaultValues: {
      temperature: 0.7,
      maxTokens: 2000,
      ...defaultValues
    }
  });

  const temperature = watch('temperature', 0.7);
  const persona = watch('persona', '');
  const emotion = watch('emotion', '');
  const topic = watch('topic', '');

  const handleSuggestionClick = (field: 'persona' | 'emotion', value: string) => {
    setValue(field, value, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Persona Field */}
      <div className="space-y-2">
        <Label htmlFor="persona" className="text-base font-semibold">
          Persona <span className="text-red-500">*</span>
        </Label>
        <Input
          id="persona"
          {...register('persona')}
          placeholder="e.g., Sales Manager"
          disabled={disabled}
          className={errors.persona ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.persona && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span className="font-medium">⚠</span> {errors.persona.message}
          </p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {persona.length}/100 characters
          </p>
          {persona.length > 0 && (
            <p className={`text-xs ${persona.length > 80 ? 'text-orange-500' : 'text-green-600'}`}>
              {persona.length > 80 ? 'Approaching limit' : 'Good length'}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {PERSONA_SUGGESTIONS.map(suggestion => (
            <Badge
              key={suggestion}
              variant="outline"
              className="cursor-pointer hover:bg-accent hover:border-primary transition-colors"
              onClick={() => !disabled && handleSuggestionClick('persona', suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Emotion Field */}
      <div className="space-y-2">
        <Label htmlFor="emotion" className="text-base font-semibold">
          Emotion <span className="text-red-500">*</span>
        </Label>
        <Input
          id="emotion"
          {...register('emotion')}
          placeholder="e.g., Frustrated"
          disabled={disabled}
          className={errors.emotion ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.emotion && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span className="font-medium">⚠</span> {errors.emotion.message}
          </p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {emotion.length}/50 characters
          </p>
          {emotion.length > 0 && (
            <p className={`text-xs ${emotion.length > 40 ? 'text-orange-500' : 'text-green-600'}`}>
              {emotion.length > 40 ? 'Approaching limit' : 'Good length'}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {EMOTION_SUGGESTIONS.map(suggestion => (
            <Badge
              key={suggestion}
              variant="outline"
              className="cursor-pointer hover:bg-accent hover:border-primary transition-colors"
              onClick={() => !disabled && handleSuggestionClick('emotion', suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Topic Field */}
      <div className="space-y-2">
        <Label htmlFor="topic" className="text-base font-semibold">
          Topic <span className="text-red-500">*</span>
        </Label>
        <Input
          id="topic"
          {...register('topic')}
          placeholder="e.g., Contract Renewal Delays"
          disabled={disabled}
          className={errors.topic ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.topic && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span className="font-medium">⚠</span> {errors.topic.message}
          </p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {topic.length}/200 characters
          </p>
          {topic.length > 0 && (
            <p className={`text-xs ${topic.length > 160 ? 'text-orange-500' : 'text-green-600'}`}>
              {topic.length > 160 ? 'Approaching limit' : 'Good length'}
            </p>
          )}
        </div>
      </div>

      {/* Advanced Options */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className="w-full justify-center hover:bg-accent"
          >
            <ChevronDown 
              className={`h-4 w-4 mr-2 transition-transform duration-200 ${
                showAdvanced ? 'rotate-180' : ''
              }`} 
            />
            Advanced Options
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          {/* Temperature Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature" className="text-sm font-medium">
                Temperature
              </Label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {temperature?.toFixed(2) ?? '0.70'}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[temperature ?? 0.7]}
              onValueChange={(value) => setValue('temperature', value[0])}
              disabled={disabled}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Lower values (0.0-0.3) = more consistent and focused responses
              <br />
              Higher values (0.7-1.0) = more creative and varied responses
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens" className="text-sm font-medium">
              Max Tokens
            </Label>
            <Input
              id="maxTokens"
              type="number"
              {...register('maxTokens', { valueAsNumber: true })}
              disabled={disabled}
              min={100}
              max={8192}
              step={100}
              className={errors.maxTokens ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.maxTokens && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="font-medium">⚠</span> {errors.maxTokens.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Maximum number of tokens in the generated conversation (100-8192)
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Submit Button */}
      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={disabled || !isValid} 
          className="w-full" 
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {disabled ? 'Generating...' : 'Generate Conversation'}
        </Button>
        {!isValid && persona && emotion && topic && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Please fix validation errors before generating
          </p>
        )}
      </div>
    </form>
  );
}

