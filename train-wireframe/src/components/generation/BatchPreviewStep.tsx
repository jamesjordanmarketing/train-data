import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAppStore } from '../../stores/useAppStore';
import { Loader2, DollarSign, Clock, Settings, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface BatchPreviewStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface EstimateResponse {
  success: boolean;
  data: {
    estimatedCost: number;
    estimatedTimeMinutes: number;
    conversationCount: number;
    breakdown: {
      templates: number;
      scenarios: number;
      edgeCases: number;
    };
  };
}

export function BatchPreviewStep({ onNext, onBack }: BatchPreviewStepProps) {
  const { batchGeneration, setBatchEstimates } = useAppStore();
  const { config } = batchGeneration;
  
  const [isLoading, setIsLoading] = useState(true);
  const [estimate, setEstimate] = useState<EstimateResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch cost and time estimates
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Call the estimate API endpoint
        const response = await fetch('/api/conversations/batch/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: config.tier,
            conversationCount: config.conversationCount,
            concurrency: config.concurrency,
            sharedParameters: config.sharedParameters,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch estimate');
        }
        
        const data: EstimateResponse = await response.json();
        
        if (data.success && data.data) {
          setEstimate(data.data);
          setBatchEstimates(data.data.estimatedCost, data.data.estimatedTimeMinutes);
        } else {
          throw new Error('Invalid response from estimate API');
        }
      } catch (err) {
        console.error('Estimate error:', err);
        setError('Failed to fetch estimate. Using fallback values.');
        
        // Fallback estimate calculation
        const fallbackEstimate = {
          estimatedCost: config.conversationCount * 0.085, // $0.085 per conversation
          estimatedTimeMinutes: Math.ceil(config.conversationCount / config.concurrency * 0.45), // ~27 seconds per conversation
          conversationCount: config.conversationCount,
          breakdown: calculateBreakdown(),
        };
        
        setEstimate(fallbackEstimate);
        setBatchEstimates(fallbackEstimate.estimatedCost, fallbackEstimate.estimatedTimeMinutes);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEstimate();
  }, [config, setBatchEstimates]);
  
  const calculateBreakdown = () => {
    if (config.tier === 'all') {
      return {
        templates: 30,
        scenarios: 40,
        edgeCases: 30,
      };
    } else if (config.tier === 'template') {
      return { templates: 30, scenarios: 0, edgeCases: 0 };
    } else if (config.tier === 'scenario') {
      return { templates: 0, scenarios: 40, edgeCases: 0 };
    } else if (config.tier === 'edge_case') {
      return { templates: 0, scenarios: 0, edgeCases: 30 };
    }
    return { templates: 0, scenarios: 0, edgeCases: 0 };
  };
  
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `~${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `~${hours}h ${mins}m` : `~${hours} hours`;
  };
  
  const handleStart = () => {
    if (!estimate) {
      toast.error('Estimate not available. Please try again.');
      return;
    }
    onNext();
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">Calculating estimates...</h3>
          <p className="text-sm text-gray-600">
            Analyzing costs and time requirements
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Generation Preview</h3>
        <p className="text-sm text-gray-600">
          Review the generation plan and estimated costs before starting
        </p>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}
      
      {/* Generation Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle2 className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Generation Plan</h4>
            <p className="text-sm text-blue-700 mt-1">
              Generating {estimate?.conversationCount || config.conversationCount} conversations across{' '}
              {config.tier === 'all' ? 'all tiers' : `${config.tier} tier`}
            </p>
          </div>
        </div>
        
        {estimate && config.tier === 'all' && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white rounded p-3">
              <div className="text-xs text-gray-600">Templates</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {estimate.breakdown.templates}
              </div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="text-xs text-gray-600">Scenarios</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {estimate.breakdown.scenarios}
              </div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="text-xs text-gray-600">Edge Cases</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {estimate.breakdown.edgeCases}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Cost Estimate */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Estimated Cost</h4>
          </div>
          <div className="text-3xl font-bold text-green-600">
            ${estimate?.estimatedCost.toFixed(2) || '0.00'}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Approximate Claude API cost
          </p>
        </div>
        
        <div className="border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Estimated Time</h4>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {estimate ? formatTime(estimate.estimatedTimeMinutes) : '0m'}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            With {config.concurrency} parallel requests
          </p>
        </div>
      </div>
      
      {/* Configuration Summary */}
      <div className="border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Configuration Summary</h4>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tier Selection</span>
            <Badge variant="outline">
              {config.tier === 'all' ? 'All Tiers' : config.tier.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Error Handling</span>
            <Badge variant="outline">
              {config.errorHandling === 'continue' ? 'Continue on Error' : 'Stop on Error'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Concurrency</span>
            <Badge variant="outline">
              {config.concurrency} parallel
            </Badge>
          </div>
          
          {Object.keys(config.sharedParameters).length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-sm font-medium text-gray-700 mb-2">Shared Parameters:</div>
              <div className="space-y-1">
                {Object.entries(config.sharedParameters).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{key}:</span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Important Notes */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Important Notes</h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Generation will start immediately and run in the background</li>
          <li>• You can close this modal and monitor progress from the dashboard</li>
          <li>• Failed conversations can be regenerated individually later</li>
          <li>• Actual costs may vary slightly based on conversation length</li>
        </ul>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={handleStart} className="flex-1">
          Start Generation
        </Button>
      </div>
    </div>
  );
}

