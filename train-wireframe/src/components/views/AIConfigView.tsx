import { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../ui/tabs';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '../ui/select';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { 
  Settings, 
  Cpu, 
  Timer, 
  DollarSign, 
  Key, 
  Clock,
  Save,
  RotateCcw,
  History,
  CheckCircle2,
  Loader2,
  XCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Activity
} from 'lucide-react';
import { 
  AIConfiguration, 
  AVAILABLE_MODELS, 
  validateAIConfiguration,
  BackoffStrategy 
} from '../../lib/types/ai-config';

interface ChangeHistoryEntry {
  id: string;
  timestamp: string;
  changedBy: string;
  changeType: string;
  description: string;
  previousValue: any;
  newValue: any;
}

export function AIConfigView() {
  const [effectiveConfig, setEffectiveConfig] = useState<AIConfiguration | null>(null);
  const [configDraft, setConfigDraft] = useState<Partial<AIConfiguration>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [changeHistory, setChangeHistory] = useState<ChangeHistoryEntry[]>([]);
  const [showPrimaryKey, setShowPrimaryKey] = useState(false);
  const [showSecondaryKey, setShowSecondaryKey] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  useEffect(() => {
    loadConfiguration();
  }, []);
  
  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai-configuration');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      const data = await response.json();
      setEffectiveConfig(data.effective || data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load AI configuration:', error);
      setIsLoading(false);
    }
  };
  
  const loadChangeHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch('/api/config/change-history?entity_type=ai_configuration&limit=20');
      if (!response.ok) {
        throw new Error('Failed to fetch change history');
      }
      const data = await response.json();
      setChangeHistory(data.changes || []);
      setIsLoadingHistory(false);
    } catch (error) {
      console.error('Failed to load change history:', error);
      setIsLoadingHistory(false);
    }
  };
  
  const handleSave = async () => {
    // Validate configuration
    const errors = validateAIConfiguration(configDraft);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setSaveStatus('saving');
    setValidationErrors([]);
    
    try {
      const response = await fetch('/api/ai-configuration', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configName: 'default',
          updates: configDraft
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save configuration');
      }
      
      setSaveStatus('saved');
      setConfigDraft({});
      await loadConfiguration();
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus('error');
      setValidationErrors([error instanceof Error ? error.message : 'Failed to save configuration']);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };
  
  const updateDraft = (updates: Partial<AIConfiguration>) => {
    setConfigDraft(prev => {
      const newDraft = { ...prev };
      
      // Deep merge updates
      Object.keys(updates).forEach(key => {
        const typedKey = key as keyof AIConfiguration;
        if (updates[typedKey] && typeof updates[typedKey] === 'object' && !Array.isArray(updates[typedKey])) {
          newDraft[typedKey] = {
            ...(prev[typedKey] as any || {}),
            ...(updates[typedKey] as any)
          } as any;
        } else {
          newDraft[typedKey] = updates[typedKey] as any;
        }
      });
      
      return newDraft;
    });
  };
  
  const handleReset = () => {
    if (confirm('Are you sure you want to discard all unsaved changes?')) {
      setConfigDraft({});
      setValidationErrors([]);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Loading AI configuration...</span>
      </div>
    );
  }
  
  if (!effectiveConfig) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Failed to load AI configuration. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const displayConfig: AIConfiguration = {
    model: {
      ...effectiveConfig.model,
      ...(configDraft.model || {})
    },
    rateLimiting: {
      ...effectiveConfig.rateLimiting,
      ...(configDraft.rateLimiting || {})
    },
    retryStrategy: {
      ...effectiveConfig.retryStrategy,
      ...(configDraft.retryStrategy || {})
    },
    costBudget: {
      ...effectiveConfig.costBudget,
      ...(configDraft.costBudget || {})
    },
    apiKeys: {
      ...effectiveConfig.apiKeys,
      ...(configDraft.apiKeys || {})
    },
    timeouts: {
      ...effectiveConfig.timeouts,
      ...(configDraft.timeouts || {})
    }
  };
  
  const hasChanges = Object.keys(configDraft).length > 0;
  
  // Calculate estimated cost per conversation
  const modelCapabilities = AVAILABLE_MODELS[displayConfig.model.model];
  const estimatedCostPerConversation = modelCapabilities 
    ? (modelCapabilities.costPer1kInputTokens * 2) + 
      (modelCapabilities.costPer1kOutputTokens * (displayConfig.model.maxTokens / 1000))
    : 0;
  
  // Calculate backoff progression
  const calculateBackoffDelays = (): number[] => {
    const delays: number[] = [];
    const { maxRetries, backoffType, baseDelay, maxDelay } = displayConfig.retryStrategy;
    
    for (let i = 0; i < maxRetries; i++) {
      let delay: number;
      switch (backoffType) {
        case 'exponential':
          delay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
          break;
        case 'linear':
          delay = Math.min(baseDelay * (i + 1), maxDelay);
          break;
        case 'fixed':
        default:
          delay = baseDelay;
          break;
      }
      delays.push(delay);
    }
    
    return delays;
  };
  
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">AI Configuration</h1>
          <p className="text-gray-600">
            Configure Claude API parameters and generation settings
          </p>
        </div>
        
        {/* Save Status & Actions */}
        <div className="flex items-center gap-4">
          {saveStatus !== 'idle' && (
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-blue-600">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">Save failed</span>
                </>
              )}
            </div>
          )}
          
          {hasChanges && (
            <Button
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => {
              setShowHistory(true);
              loadChangeHistory();
            }}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveStatus === 'saving'}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription>
            You have unsaved changes. Click "Save Changes" to apply them.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tabs Container */}
      <Tabs defaultValue="model" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="model">
            <Cpu className="w-4 h-4 mr-2" />
            Model
          </TabsTrigger>
          <TabsTrigger value="rate-retry">
            <Timer className="w-4 h-4 mr-2" />
            Rate & Retry
          </TabsTrigger>
          <TabsTrigger value="cost">
            <DollarSign className="w-4 h-4 mr-2" />
            Cost
          </TabsTrigger>
          <TabsTrigger value="keys">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="timeouts">
            <Clock className="w-4 h-4 mr-2" />
            Timeouts
          </TabsTrigger>
        </TabsList>
        
        {/* Model Configuration Tab */}
        <TabsContent value="model" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Model Configuration</h3>
            <p className="text-sm text-gray-600 mb-6">
              Configure Claude API model and generation parameters
            </p>
            
            <div className="space-y-6">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="model-select">Claude Model</Label>
                <Select
                  value={displayConfig.model.model}
                  onValueChange={(value) => 
                    updateDraft({ 
                      model: { 
                        ...displayConfig.model, 
                        model: value 
                      } 
                    })
                  }
                >
                  <SelectTrigger id="model-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AVAILABLE_MODELS).map(([modelName, capabilities]) => (
                      <SelectItem key={modelName} value={modelName}>
                        <div className="flex flex-col">
                          <span className="font-medium">{modelName}</span>
                          <span className="text-xs text-gray-500">
                            {capabilities.contextWindow.toLocaleString()} tokens context | 
                            ${capabilities.costPer1kInputTokens}/1k in, ${capabilities.costPer1kOutputTokens}/1k out
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {modelCapabilities && (
                  <p className="text-xs text-gray-500">
                    Supported features: {modelCapabilities.supportedFeatures.join(', ')}
                  </p>
                )}
              </div>
              
              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">Temperature</Label>
                  <span className="text-sm font-medium">{displayConfig.model.temperature.toFixed(2)}</span>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[displayConfig.model.temperature]}
                  onValueChange={([value]) => 
                    updateDraft({ 
                      model: { 
                        ...displayConfig.model, 
                        temperature: value 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Lower values (0.0-0.3): More deterministic, focused | 
                  Medium values (0.4-0.7): Balanced | 
                  Higher values (0.8-1.0): More creative, varied
                </p>
              </div>
              
              {/* Max Tokens */}
              <div className="space-y-2">
                <Label htmlFor="max-tokens">Max Output Tokens</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  min={1}
                  max={4096}
                  value={displayConfig.model.maxTokens}
                  onChange={(e) => 
                    updateDraft({ 
                      model: { 
                        ...displayConfig.model, 
                        maxTokens: parseInt(e.target.value) || 4096 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum number of tokens in generated response (1-4096)
                </p>
              </div>
              
              {/* Top P */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="top-p">Top P (Nucleus Sampling)</Label>
                  <span className="text-sm font-medium">{displayConfig.model.topP.toFixed(2)}</span>
                </div>
                <Slider
                  id="top-p"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[displayConfig.model.topP]}
                  onValueChange={([value]) => 
                    updateDraft({ 
                      model: { 
                        ...displayConfig.model, 
                        topP: value 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Alternative to temperature. Recommended: use temperature OR top_p, not both
                </p>
              </div>
              
              {/* Streaming */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="streaming">Enable Streaming</Label>
                  <p className="text-sm text-gray-500">Stream responses token-by-token</p>
                </div>
                <Switch
                  id="streaming"
                  checked={displayConfig.model.streaming}
                  onCheckedChange={(checked) => 
                    updateDraft({ 
                      model: { 
                        ...displayConfig.model, 
                        streaming: checked 
                      } 
                    })
                  }
                />
              </div>
              
              {/* Cost Estimation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Cost Estimation
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Input cost (1000 tokens):</span>
                    <span className="font-medium">${modelCapabilities?.costPer1kInputTokens.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Output cost (1000 tokens):</span>
                    <span className="font-medium">${modelCapabilities?.costPer1kOutputTokens.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-blue-300">
                    <span>Est. cost per conversation:</span>
                    <span>${estimatedCostPerConversation.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span>Est. cost for 100 conversations:</span>
                    <span className="font-medium">${(estimatedCostPerConversation * 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Rate Limiting & Retry Tab */}
        <TabsContent value="rate-retry" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rate Limiting</h3>
            <p className="text-sm text-gray-600 mb-6">
              Control API request rates to prevent throttling and manage costs
            </p>
            
            <div className="space-y-6">
              {/* Requests Per Minute */}
              <div className="space-y-2">
                <Label htmlFor="requests-per-minute">Requests Per Minute</Label>
                <Input
                  id="requests-per-minute"
                  type="number"
                  min={1}
                  max={1000}
                  value={displayConfig.rateLimiting.requestsPerMinute}
                  onChange={(e) => 
                    updateDraft({ 
                      rateLimiting: { 
                        ...displayConfig.rateLimiting, 
                        requestsPerMinute: parseInt(e.target.value) || 50 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum API requests allowed per minute (1-1000)
                </p>
              </div>
              
              {/* Concurrent Requests */}
              <div className="space-y-2">
                <Label htmlFor="concurrent-requests">Concurrent Requests</Label>
                <Input
                  id="concurrent-requests"
                  type="number"
                  min={1}
                  max={20}
                  value={displayConfig.rateLimiting.concurrentRequests}
                  onChange={(e) => 
                    updateDraft({ 
                      rateLimiting: { 
                        ...displayConfig.rateLimiting, 
                        concurrentRequests: parseInt(e.target.value) || 3 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum simultaneous API requests (1-20)
                </p>
              </div>
              
              {/* Burst Allowance */}
              <div className="space-y-2">
                <Label htmlFor="burst-allowance">Burst Allowance</Label>
                <Input
                  id="burst-allowance"
                  type="number"
                  min={0}
                  max={100}
                  value={displayConfig.rateLimiting.burstAllowance}
                  onChange={(e) => 
                    updateDraft({ 
                      rateLimiting: { 
                        ...displayConfig.rateLimiting, 
                        burstAllowance: parseInt(e.target.value) || 10 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Extra requests allowed in short bursts (0-100)
                </p>
              </div>
              
              {/* Rate Limit Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Rate Limit Summary
                </h4>
                <div className="text-sm text-green-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Sustained rate:</span>
                    <span className="font-medium">{displayConfig.rateLimiting.requestsPerMinute} req/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak rate (with burst):</span>
                    <span className="font-medium">
                      {displayConfig.rateLimiting.requestsPerMinute + displayConfig.rateLimiting.burstAllowance} req/min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Parallel processing:</span>
                    <span className="font-medium">{displayConfig.rateLimiting.concurrentRequests} requests</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Retry Strategy</h3>
            <p className="text-sm text-gray-600 mb-6">
              Configure automatic retry behavior for failed API requests
            </p>
            
            <div className="space-y-6">
              {/* Max Retries */}
              <div className="space-y-2">
                <Label htmlFor="max-retries">Max Retries</Label>
                <Input
                  id="max-retries"
                  type="number"
                  min={0}
                  max={10}
                  value={displayConfig.retryStrategy.maxRetries}
                  onChange={(e) => 
                    updateDraft({ 
                      retryStrategy: { 
                        ...displayConfig.retryStrategy, 
                        maxRetries: parseInt(e.target.value) || 3 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Number of retry attempts after initial failure (0-10)
                </p>
              </div>
              
              {/* Backoff Strategy */}
              <div className="space-y-2">
                <Label htmlFor="backoff-type">Backoff Strategy</Label>
                <Select
                  value={displayConfig.retryStrategy.backoffType}
                  onValueChange={(value) => 
                    updateDraft({ 
                      retryStrategy: { 
                        ...displayConfig.retryStrategy, 
                        backoffType: value as BackoffStrategy
                      } 
                    })
                  }
                >
                  <SelectTrigger id="backoff-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exponential">
                      <div className="flex flex-col">
                        <span className="font-medium">Exponential Backoff</span>
                        <span className="text-xs text-gray-500">Delay doubles each retry (recommended)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="linear">
                      <div className="flex flex-col">
                        <span className="font-medium">Linear Backoff</span>
                        <span className="text-xs text-gray-500">Delay increases linearly</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex flex-col">
                        <span className="font-medium">Fixed Delay</span>
                        <span className="text-xs text-gray-500">Constant delay between retries</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Base Delay */}
              <div className="space-y-2">
                <Label htmlFor="base-delay">Base Delay (milliseconds)</Label>
                <Input
                  id="base-delay"
                  type="number"
                  min={100}
                  max={60000}
                  step={100}
                  value={displayConfig.retryStrategy.baseDelay}
                  onChange={(e) => 
                    updateDraft({ 
                      retryStrategy: { 
                        ...displayConfig.retryStrategy, 
                        baseDelay: parseInt(e.target.value) || 1000 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Initial delay before first retry (100-60000ms)
                </p>
              </div>
              
              {/* Max Delay */}
              <div className="space-y-2">
                <Label htmlFor="max-delay">Max Delay (milliseconds)</Label>
                <Input
                  id="max-delay"
                  type="number"
                  min={1000}
                  max={300000}
                  step={1000}
                  value={displayConfig.retryStrategy.maxDelay}
                  onChange={(e) => 
                    updateDraft({ 
                      retryStrategy: { 
                        ...displayConfig.retryStrategy, 
                        maxDelay: parseInt(e.target.value) || 16000 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum delay cap for exponential backoff (1000-300000ms)
                </p>
              </div>
              
              {/* Backoff Progression Visualization */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Backoff Progression
                </h4>
                <div className="space-y-2">
                  {calculateBackoffDelays().map((delay, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-purple-900 w-20">
                        Retry {index + 1}:
                      </span>
                      <div className="flex-1 bg-purple-200 rounded-full h-6 relative">
                        <div 
                          className="bg-purple-600 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ 
                            width: `${Math.min((delay / displayConfig.retryStrategy.maxDelay) * 100, 100)}%` 
                          }}
                        >
                          {delay >= 1000 ? `${(delay / 1000).toFixed(1)}s` : `${delay}ms`}
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-purple-700 mt-3">
                    Total potential wait time: {(calculateBackoffDelays().reduce((a, b) => a + b, 0) / 1000).toFixed(1)}s
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Cost Management Tab */}
        <TabsContent value="cost" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cost Budget Configuration</h3>
            <p className="text-sm text-gray-600 mb-6">
              Set spending limits and receive alerts when approaching budgets
            </p>
            
            <div className="space-y-6">
              {/* Daily Budget */}
              <div className="space-y-2">
                <Label htmlFor="daily-budget">Daily Budget (USD)</Label>
                <Input
                  id="daily-budget"
                  type="number"
                  min={0}
                  step={0.01}
                  value={displayConfig.costBudget.dailyBudget}
                  onChange={(e) => 
                    updateDraft({ 
                      costBudget: { 
                        ...displayConfig.costBudget, 
                        dailyBudget: parseFloat(e.target.value) || 0 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum spending allowed per day
                </p>
              </div>
              
              {/* Weekly Budget */}
              <div className="space-y-2">
                <Label htmlFor="weekly-budget">Weekly Budget (USD)</Label>
                <Input
                  id="weekly-budget"
                  type="number"
                  min={0}
                  step={0.01}
                  value={displayConfig.costBudget.weeklyBudget}
                  onChange={(e) => 
                    updateDraft({ 
                      costBudget: { 
                        ...displayConfig.costBudget, 
                        weeklyBudget: parseFloat(e.target.value) || 0 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum spending allowed per week
                </p>
              </div>
              
              {/* Monthly Budget */}
              <div className="space-y-2">
                <Label htmlFor="monthly-budget">Monthly Budget (USD)</Label>
                <Input
                  id="monthly-budget"
                  type="number"
                  min={0}
                  step={0.01}
                  value={displayConfig.costBudget.monthlyBudget}
                  onChange={(e) => 
                    updateDraft({ 
                      costBudget: { 
                        ...displayConfig.costBudget, 
                        monthlyBudget: parseFloat(e.target.value) || 0 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum spending allowed per month
                </p>
              </div>
              
              {/* Alert Thresholds */}
              <div className="space-y-4">
                <Label>Alert Thresholds</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications when spending reaches these percentages
                </p>
                
                {displayConfig.costBudget.alertThresholds.map((threshold, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Alert {index + 1}</Label>
                        <span className="text-sm font-medium">{(threshold * 100).toFixed(0)}%</span>
                      </div>
                      <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={[threshold]}
                        onValueChange={([value]) => {
                          const newThresholds = [...displayConfig.costBudget.alertThresholds];
                          newThresholds[index] = value;
                          updateDraft({ 
                            costBudget: { 
                              ...displayConfig.costBudget, 
                              alertThresholds: newThresholds 
                            } 
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Budget Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Budget Summary
                </h4>
                <div className="text-sm text-yellow-800 space-y-2">
                  <div className="flex justify-between">
                    <span>Daily limit:</span>
                    <span className="font-medium">${displayConfig.costBudget.dailyBudget.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly limit:</span>
                    <span className="font-medium">${displayConfig.costBudget.weeklyBudget.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly limit:</span>
                    <span className="font-medium">${displayConfig.costBudget.monthlyBudget.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-yellow-300 pt-2 mt-2">
                    <p className="text-xs">
                      Alerts at: {displayConfig.costBudget.alertThresholds.map(t => `${(t * 100).toFixed(0)}%`).join(', ')}
                    </p>
                  </div>
                  
                  {/* Estimated Conversations */}
                  <div className="border-t border-yellow-300 pt-2 mt-2">
                    <p className="text-xs font-semibold">Estimated daily capacity:</p>
                    <p className="text-sm font-medium">
                      ~{Math.floor(displayConfig.costBudget.dailyBudget / estimatedCostPerConversation)} conversations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">API Key Management</h3>
            <p className="text-sm text-gray-600 mb-6">
              Manage Claude API keys and rotation settings
            </p>
            
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                API keys are encrypted at rest. Only the last 4 characters are displayed for security.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-6">
              {/* Primary API Key */}
              <div className="space-y-2">
                <Label htmlFor="primary-key">Primary API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-key"
                    type={showPrimaryKey ? 'text' : 'password'}
                    value={displayConfig.apiKeys.primaryKey}
                    onChange={(e) => 
                      updateDraft({ 
                        apiKeys: { 
                          ...displayConfig.apiKeys, 
                          primaryKey: e.target.value 
                        } 
                      })
                    }
                    placeholder="sk-ant-..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPrimaryKey(!showPrimaryKey)}
                  >
                    {showPrimaryKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Your active Claude API key
                </p>
              </div>
              
              {/* Secondary API Key */}
              <div className="space-y-2">
                <Label htmlFor="secondary-key">Secondary API Key (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-key"
                    type={showSecondaryKey ? 'text' : 'password'}
                    value={displayConfig.apiKeys.secondaryKey || ''}
                    onChange={(e) => 
                      updateDraft({ 
                        apiKeys: { 
                          ...displayConfig.apiKeys, 
                          secondaryKey: e.target.value 
                        } 
                      })
                    }
                    placeholder="sk-ant-... (optional)"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecondaryKey(!showSecondaryKey)}
                  >
                    {showSecondaryKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Backup key for rotation and failover
                </p>
              </div>
              
              {/* Key Version */}
              <div className="space-y-2">
                <Label htmlFor="key-version">Key Version</Label>
                <Input
                  id="key-version"
                  type="number"
                  min={1}
                  value={displayConfig.apiKeys.keyVersion}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">
                  Automatically incremented when keys are rotated
                </p>
              </div>
              
              {/* Rotation Schedule */}
              <div className="space-y-2">
                <Label htmlFor="rotation-schedule">Rotation Schedule</Label>
                <Select
                  value={displayConfig.apiKeys.rotationSchedule}
                  onValueChange={(value) => 
                    updateDraft({ 
                      apiKeys: { 
                        ...displayConfig.apiKeys, 
                        rotationSchedule: value as 'manual' | 'monthly' | 'quarterly'
                      } 
                    })
                  }
                >
                  <SelectTrigger id="rotation-schedule" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">
                      <div className="flex flex-col">
                        <span className="font-medium">Manual</span>
                        <span className="text-xs text-gray-500">Rotate keys manually as needed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="monthly">
                      <div className="flex flex-col">
                        <span className="font-medium">Monthly</span>
                        <span className="text-xs text-gray-500">Automatic rotation every 30 days</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="quarterly">
                      <div className="flex flex-col">
                        <span className="font-medium">Quarterly</span>
                        <span className="text-xs text-gray-500">Automatic rotation every 90 days</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Key Status Summary */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-medium text-indigo-900 mb-3 flex items-center">
                  <Key className="w-4 h-4 mr-2" />
                  Key Configuration Status
                </h4>
                <div className="text-sm text-indigo-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Primary key configured:</span>
                    <Badge variant={displayConfig.apiKeys.primaryKey ? 'default' : 'destructive'}>
                      {displayConfig.apiKeys.primaryKey ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Secondary key configured:</span>
                    <Badge variant={displayConfig.apiKeys.secondaryKey ? 'default' : 'secondary'}>
                      {displayConfig.apiKeys.secondaryKey ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Current version:</span>
                    <span className="font-medium">v{displayConfig.apiKeys.keyVersion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rotation policy:</span>
                    <span className="font-medium capitalize">{displayConfig.apiKeys.rotationSchedule}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Timeouts Tab */}
        <TabsContent value="timeouts" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Timeout Configuration</h3>
            <p className="text-sm text-gray-600 mb-6">
              Configure timeout values for API requests and generation operations
            </p>
            
            <div className="space-y-6">
              {/* Generation Timeout */}
              <div className="space-y-2">
                <Label htmlFor="generation-timeout">Generation Timeout (milliseconds)</Label>
                <Input
                  id="generation-timeout"
                  type="number"
                  min={1000}
                  max={600000}
                  step={1000}
                  value={displayConfig.timeouts.generationTimeout}
                  onChange={(e) => 
                    updateDraft({ 
                      timeouts: { 
                        ...displayConfig.timeouts, 
                        generationTimeout: parseInt(e.target.value) || 60000 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum time to wait for content generation (1s-10min). Default: 60s
                </p>
                <p className="text-xs text-gray-600">
                  Current: {(displayConfig.timeouts.generationTimeout / 1000).toFixed(1)}s
                </p>
              </div>
              
              {/* Connection Timeout */}
              <div className="space-y-2">
                <Label htmlFor="connection-timeout">Connection Timeout (milliseconds)</Label>
                <Input
                  id="connection-timeout"
                  type="number"
                  min={1000}
                  max={60000}
                  step={1000}
                  value={displayConfig.timeouts.connectionTimeout}
                  onChange={(e) => 
                    updateDraft({ 
                      timeouts: { 
                        ...displayConfig.timeouts, 
                        connectionTimeout: parseInt(e.target.value) || 10000 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum time to establish API connection (1s-60s). Default: 10s
                </p>
                <p className="text-xs text-gray-600">
                  Current: {(displayConfig.timeouts.connectionTimeout / 1000).toFixed(1)}s
                </p>
              </div>
              
              {/* Total Request Timeout */}
              <div className="space-y-2">
                <Label htmlFor="total-timeout">Total Request Timeout (milliseconds)</Label>
                <Input
                  id="total-timeout"
                  type="number"
                  min={1000}
                  max={900000}
                  step={1000}
                  value={displayConfig.timeouts.totalRequestTimeout}
                  onChange={(e) => 
                    updateDraft({ 
                      timeouts: { 
                        ...displayConfig.timeouts, 
                        totalRequestTimeout: parseInt(e.target.value) || 120000 
                      } 
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum total time for entire request lifecycle (1s-15min). Default: 120s
                </p>
                <p className="text-xs text-gray-600">
                  Current: {(displayConfig.timeouts.totalRequestTimeout / 1000).toFixed(1)}s
                </p>
              </div>
              
              {/* Timeout Explanation */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Understanding Timeouts</AlertTitle>
                <AlertDescription>
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• <strong>Connection Timeout:</strong> Time to establish initial connection</li>
                    <li>• <strong>Generation Timeout:</strong> Time for Claude to generate response</li>
                    <li>• <strong>Total Timeout:</strong> Maximum time for complete request (includes retries)</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              {/* Timeout Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Timeout Summary
                </h4>
                <div className="text-sm text-gray-800 space-y-2">
                  <div className="flex justify-between">
                    <span>Connection timeout:</span>
                    <span className="font-medium">{(displayConfig.timeouts.connectionTimeout / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Generation timeout:</span>
                    <span className="font-medium">{(displayConfig.timeouts.generationTimeout / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total request timeout:</span>
                    <span className="font-medium">{(displayConfig.timeouts.totalRequestTimeout / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <p className="text-xs text-gray-600">
                      These timeouts apply to all API requests and help prevent hanging operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Configuration Preview Pane */}
      <Card className="p-6 bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Effective Configuration Preview</h3>
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Unsaved Changes
            </Badge>
          )}
        </div>
        <pre className="text-sm bg-white p-4 rounded-lg overflow-auto max-h-96 border font-mono">
          {JSON.stringify(displayConfig, null, 2)}
        </pre>
        <p className="text-sm text-gray-500 mt-2">
          This shows your current configuration merged with any unsaved changes
        </p>
      </Card>
      
      {/* Change History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuration Change History</DialogTitle>
            <DialogDescription>
              View and rollback configuration changes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Loading history...</span>
              </div>
            ) : changeHistory.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No configuration changes found.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {changeHistory.map((change) => (
                  <Card key={change.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{change.changeType}</Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(change.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">{change.description}</p>
                        <p className="text-xs text-gray-500">Changed by: {change.changedBy}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Rollback functionality would go here
                          alert('Rollback functionality will be implemented with full API integration');
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Rollback
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

