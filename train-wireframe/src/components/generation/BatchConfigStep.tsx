import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { useAppStore } from '../../stores/useAppStore';
import { AlertCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface BatchConfigStepProps {
  onNext: () => void;
  onCancel: () => void;
}

export function BatchConfigStep({ onNext, onCancel }: BatchConfigStepProps) {
  const { batchGeneration, setBatchConfig } = useAppStore();
  const { config } = batchGeneration;
  
  const [tier, setTier] = useState<string>(config.tier);
  const [errorHandling, setErrorHandling] = useState<string>(config.errorHandling);
  const [concurrency, setConcurrency] = useState<number[]>([config.concurrency]);
  const [paramKey, setParamKey] = useState('');
  const [paramValue, setParamValue] = useState('');
  const [sharedParams, setSharedParams] = useState<Record<string, string>>(config.sharedParameters);
  
  // Calculate conversation count based on tier selection
  const conversationCounts = {
    all: 100,
    template: 30,
    scenario: 40,
    edge_case: 30,
  };
  
  const conversationCount = conversationCounts[tier as keyof typeof conversationCounts] || 0;
  
  const addParameter = () => {
    if (!paramKey.trim() || !paramValue.trim()) {
      toast.error('Please enter both key and value');
      return;
    }
    
    if (sharedParams[paramKey]) {
      toast.error('Parameter key already exists');
      return;
    }
    
    setSharedParams({ ...sharedParams, [paramKey]: paramValue });
    setParamKey('');
    setParamValue('');
    toast.success('Parameter added');
  };
  
  const removeParameter = (key: string) => {
    const newParams = { ...sharedParams };
    delete newParams[key];
    setSharedParams(newParams);
  };
  
  const handleNext = () => {
    if (tier === 'all' || tier === 'template' || tier === 'scenario' || tier === 'edge_case') {
      setBatchConfig({
        tier: tier as any,
        conversationCount,
        errorHandling: errorHandling as 'continue' | 'stop',
        concurrency: concurrency[0],
        sharedParameters: sharedParams,
      });
      onNext();
    } else {
      toast.error('Please select a valid tier');
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Batch Generation Configuration</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure your batch generation settings and parameters
        </p>
      </div>
      
      {/* Tier Selection */}
      <div className="space-y-2">
        <Label htmlFor="tier">Tier Selection *</Label>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger id="tier">
            <SelectValue placeholder="Select tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers (100 conversations)</SelectItem>
            <SelectItem value="template">Template Only (30 conversations)</SelectItem>
            <SelectItem value="scenario">Scenario Only (40 conversations)</SelectItem>
            <SelectItem value="edge_case">Edge Case Only (30 conversations)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Select which tier(s) to generate conversations for
        </p>
      </div>
      
      {/* Conversation Count Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-blue-900">Total Conversations</div>
            <div className="text-xs text-blue-700 mt-1">
              Based on tier selection
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-900">
            {conversationCount}
          </div>
        </div>
      </div>
      
      {/* Error Handling Mode */}
      <div className="space-y-2">
        <Label htmlFor="errorHandling">Error Handling *</Label>
        <Select value={errorHandling} onValueChange={setErrorHandling}>
          <SelectTrigger id="errorHandling">
            <SelectValue placeholder="Select error handling mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="continue">Continue on Error</SelectItem>
            <SelectItem value="stop">Stop on Error</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Choose how to handle errors during batch generation
        </p>
      </div>
      
      {/* Concurrency Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="concurrency">Concurrent Conversations</Label>
          <Badge variant="outline">{concurrency[0]}</Badge>
        </div>
        <Slider
          id="concurrency"
          min={1}
          max={5}
          step={1}
          value={concurrency}
          onValueChange={setConcurrency}
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          Number of conversations to generate in parallel (1-5)
        </p>
      </div>
      
      {/* Shared Parameters */}
      <div className="space-y-2">
        <Label>Shared Parameters (Optional)</Label>
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Key (e.g., audience)"
              value={paramKey}
              onChange={(e) => setParamKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addParameter();
                }
              }}
              className="flex-1"
            />
            <Input
              placeholder="Value (e.g., developers)"
              value={paramValue}
              onChange={(e) => setParamValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addParameter();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={addParameter}
              disabled={!paramKey.trim() || !paramValue.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {Object.keys(sharedParams).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(sharedParams).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParameter(key)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              No parameters added yet
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Add parameters that will be applied to all conversations
        </p>
      </div>
      
      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium">Before you proceed:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Batch generation will consume API credits</li>
            <li>You'll see cost estimates in the next step</li>
            <li>Generation cannot be undone once started</li>
          </ul>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Next: Preview
        </Button>
      </div>
    </div>
  );
}

