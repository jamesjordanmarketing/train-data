import { useState } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { useAppStore } from '../../stores/useAppStore';
import { RetrySimulationModal } from '../modals/RetrySimulationModal';

export function SettingsView() {
  const { preferences, updatePreferences } = useAppStore();
  const [showRetrySimulation, setShowRetrySimulation] = useState(false);
  
  // Default retry config if not set
  const retryConfig = preferences.retryConfig || {
    strategy: 'exponential' as const,
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 300000,
    continueOnError: false,
  };
  
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Settings</h1>
        <p className="text-gray-600">
          Configure your preferences and application settings
        </p>
      </div>
      
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg mb-4">User Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="animations">Enable Animations</Label>
                <p className="text-sm text-gray-500">Use smooth transitions and animations</p>
              </div>
              <Switch
                id="animations"
                checked={preferences.enableAnimations}
                onCheckedChange={(checked) => 
                  updatePreferences({ enableAnimations: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="shortcuts">Keyboard Shortcuts</Label>
                <p className="text-sm text-gray-500">Enable keyboard shortcuts for navigation</p>
              </div>
              <Switch
                id="shortcuts"
                checked={preferences.keyboardShortcuts.enabled}
                onCheckedChange={(checked) => 
                  updatePreferences({ 
                    keyboardShortcuts: { 
                      ...preferences.keyboardShortcuts, 
                      enabled: checked 
                    } 
                  })
                }
              />
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg mb-4">Quality Thresholds</h3>
          <p className="text-sm text-gray-600">
            Minimum quality score for auto-approval and other thresholds coming soon.
          </p>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg mb-4">Integration Setup</h3>
          <p className="text-sm text-gray-600">
            API keys, webhooks, and external service connections coming soon.
          </p>
        </div>
        
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg">Retry Configuration</h3>
              <p className="text-sm text-gray-600">
                Configure how the system handles API failures and retries
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRetrySimulation(true)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Test Retry Logic
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retry-strategy">Retry Strategy</Label>
                <Select
                  value={retryConfig.strategy}
                  onValueChange={(value) => 
                    updatePreferences({ 
                      retryConfig: { ...retryConfig, strategy: value as 'exponential' | 'linear' | 'fixed' }
                    })
                  }
                >
                  <SelectTrigger id="retry-strategy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exponential">Exponential Backoff</SelectItem>
                    <SelectItem value="linear">Linear Backoff</SelectItem>
                    <SelectItem value="fixed">Fixed Delay</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {retryConfig.strategy === 'exponential' && 'Delay doubles after each retry (recommended)'}
                  {retryConfig.strategy === 'linear' && 'Delay increases linearly after each retry'}
                  {retryConfig.strategy === 'fixed' && 'Constant delay between all retries'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-attempts">Max Retry Attempts</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  min={1}
                  max={10}
                  value={retryConfig.maxAttempts}
                  onChange={(e) => 
                    updatePreferences({ 
                      retryConfig: { ...retryConfig, maxAttempts: parseInt(e.target.value) || 3 }
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Number of retry attempts after initial failure (1-10)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base-delay">Base Delay (ms)</Label>
                <Input
                  id="base-delay"
                  type="number"
                  min={100}
                  max={10000}
                  step={100}
                  value={retryConfig.baseDelayMs}
                  onChange={(e) => 
                    updatePreferences({ 
                      retryConfig: { ...retryConfig, baseDelayMs: parseInt(e.target.value) || 1000 }
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Initial delay before first retry (100-10000ms)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-delay">Max Delay (ms)</Label>
                <Input
                  id="max-delay"
                  type="number"
                  min={1000}
                  max={300000}
                  step={1000}
                  value={retryConfig.maxDelayMs}
                  onChange={(e) => 
                    updatePreferences({ 
                      retryConfig: { ...retryConfig, maxDelayMs: parseInt(e.target.value) || 300000 }
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum delay cap (1s-5min)
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="continue-on-error">Continue Batch on Error</Label>
                <p className="text-sm text-gray-500">
                  Continue processing remaining items if one fails
                </p>
              </div>
              <Switch
                id="continue-on-error"
                checked={retryConfig.continueOnError}
                onCheckedChange={(checked) => 
                  updatePreferences({ 
                    retryConfig: { ...retryConfig, continueOnError: checked }
                  })
                }
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-blue-900 mb-2">Current Configuration Summary</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Strategy: <strong>{retryConfig.strategy}</strong></li>
                <li>• Max Attempts: <strong>{retryConfig.maxAttempts}</strong></li>
                <li>• Base Delay: <strong>{retryConfig.baseDelayMs}ms</strong></li>
                <li>• Max Delay: <strong>{retryConfig.maxDelayMs}ms</strong></li>
                <li>• Error Handling: <strong>{retryConfig.continueOnError ? 'Continue' : 'Stop'} on error</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Retry Simulation Modal */}
      <RetrySimulationModal
        open={showRetrySimulation}
        onClose={() => setShowRetrySimulation(false)}
        initialConfig={{
          strategy: retryConfig.strategy,
          maxAttempts: retryConfig.maxAttempts,
          baseDelayMs: retryConfig.baseDelayMs,
        }}
      />
    </div>
  );
}
