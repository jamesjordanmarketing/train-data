/**
 * Retry Simulation Modal
 * 
 * Allows users to test and visualize retry behavior with different strategies
 * and failure rates. Helps understand how retry logic will work in production.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Card } from '../ui/card';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { 
  ExponentialBackoffStrategy, 
  LinearBackoffStrategy, 
  FixedDelayStrategy,
  RetryStrategy 
} from '../../../src/lib/ai/retry-strategy';
import { RetryExecutor } from '../../../src/lib/ai/retry-executor';

interface RetrySimulationModalProps {
  open: boolean;
  onClose: () => void;
  initialConfig?: {
    strategy: 'exponential' | 'linear' | 'fixed';
    maxAttempts: number;
    baseDelayMs: number;
  };
}

interface SimulationAttempt {
  attemptNumber: number;
  status: 'success' | 'failure' | 'pending';
  delay?: number;
  error?: string;
  timestamp: number;
}

interface SimulationResult {
  attempts: SimulationAttempt[];
  totalDuration: number;
  finalStatus: 'success' | 'failure';
  totalRetries: number;
}

export function RetrySimulationModal({ 
  open, 
  onClose, 
  initialConfig 
}: RetrySimulationModalProps) {
  const [strategy, setStrategy] = useState<'exponential' | 'linear' | 'fixed'>(
    initialConfig?.strategy || 'exponential'
  );
  const [maxAttempts, setMaxAttempts] = useState(initialConfig?.maxAttempts || 3);
  const [baseDelayMs, setBaseDelayMs] = useState(initialConfig?.baseDelayMs || 1000);
  const [failureRate, setFailureRate] = useState(50); // 50% failure rate
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setSimulationResult(null);

    const startTime = Date.now();
    const attempts: SimulationAttempt[] = [];
    
    // Create retry strategy based on selection
    let retryStrategy: RetryStrategy;
    switch (strategy) {
      case 'exponential':
        retryStrategy = new ExponentialBackoffStrategy(baseDelayMs, maxAttempts, 300000, 0.1);
        break;
      case 'linear':
        retryStrategy = new LinearBackoffStrategy(baseDelayMs, maxAttempts, 300000);
        break;
      case 'fixed':
        retryStrategy = new FixedDelayStrategy(baseDelayMs, maxAttempts);
        break;
    }

    const executor = new RetryExecutor(retryStrategy);

    try {
      let attemptCount = 0;
      
      await executor.execute(
        async () => {
          attemptCount++;
          const delay = attemptCount > 1 ? retryStrategy.calculateDelay(attemptCount - 2) : 0;
          
          // Add attempt to list (pending)
          attempts.push({
            attemptNumber: attemptCount,
            status: 'pending',
            delay: attemptCount > 1 ? delay : undefined,
            timestamp: Date.now() - startTime,
          });
          
          // Trigger UI update
          setSimulationResult({
            attempts: [...attempts],
            totalDuration: Date.now() - startTime,
            finalStatus: 'failure',
            totalRetries: attemptCount - 1,
          });

          // Simulate delay if not first attempt
          if (attemptCount > 1 && delay > 0) {
            await new Promise(resolve => setTimeout(resolve, Math.min(delay, 5000))); // Cap at 5s for demo
          } else {
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call time
          }

          // Simulate random failure based on failure rate
          const shouldFail = Math.random() * 100 < failureRate;
          
          if (shouldFail) {
            // Update attempt to failure
            attempts[attempts.length - 1] = {
              ...attempts[attempts.length - 1],
              status: 'failure',
              error: '500 Internal Server Error',
              timestamp: Date.now() - startTime,
            };
            
            setSimulationResult({
              attempts: [...attempts],
              totalDuration: Date.now() - startTime,
              finalStatus: 'failure',
              totalRetries: attemptCount - 1,
            });
            
            throw new Error('500 Internal Server Error');
          }

          // Success!
          attempts[attempts.length - 1] = {
            ...attempts[attempts.length - 1],
            status: 'success',
            timestamp: Date.now() - startTime,
          };
          
          setSimulationResult({
            attempts: [...attempts],
            totalDuration: Date.now() - startTime,
            finalStatus: 'success',
            totalRetries: attemptCount - 1,
          });

          return { success: true };
        },
        {
          requestId: 'simulation_' + Date.now(),
        }
      );
    } catch (error) {
      // All retries failed
      const totalDuration = Date.now() - startTime;
      setSimulationResult({
        attempts: [...attempts],
        totalDuration,
        finalStatus: 'failure',
        totalRetries: attempts.length - 1,
      });
    }

    setIsRunning(false);
  };

  const formatDelay = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStrategyDescription = () => {
    switch (strategy) {
      case 'exponential':
        return `Delay doubles each retry: ${baseDelayMs}ms, ${baseDelayMs * 2}ms, ${baseDelayMs * 4}ms, ...`;
      case 'linear':
        return `Delay increases linearly: ${baseDelayMs}ms, ${baseDelayMs * 2}ms, ${baseDelayMs * 3}ms, ...`;
      case 'fixed':
        return `Fixed delay between retries: ${baseDelayMs}ms every time`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Retry Strategy Simulation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Simulation Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="strategy">Retry Strategy</Label>
                <Select value={strategy} onValueChange={(val) => setStrategy(val as any)}>
                  <SelectTrigger id="strategy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exponential">Exponential Backoff</SelectItem>
                    <SelectItem value="linear">Linear Backoff</SelectItem>
                    <SelectItem value="fixed">Fixed Delay</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">{getStrategyDescription()}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Max Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min={1}
                  max={10}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 3)}
                />
                <p className="text-xs text-gray-500">Total attempts including first try</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseDelay">Base Delay (ms)</Label>
                <Input
                  id="baseDelay"
                  type="number"
                  min={100}
                  max={10000}
                  step={100}
                  value={baseDelayMs}
                  onChange={(e) => setBaseDelayMs(parseInt(e.target.value) || 1000)}
                />
                <p className="text-xs text-gray-500">Initial retry delay</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="failureRate">Failure Rate (%)</Label>
                <Input
                  id="failureRate"
                  type="number"
                  min={0}
                  max={100}
                  value={failureRate}
                  onChange={(e) => setFailureRate(parseInt(e.target.value) || 50)}
                />
                <p className="text-xs text-gray-500">Probability of simulated failure</p>
              </div>
            </div>

            <Button 
              onClick={handleRunSimulation} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Simulation...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>
          </Card>

          {/* Results */}
          {simulationResult && (
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Simulation Results</h3>
                <div className="flex items-center gap-2">
                  {simulationResult.finalStatus === 'success' ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Success
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Failed
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Total Attempts</div>
                  <div className="text-xl font-semibold">{simulationResult.attempts.length}</div>
                </div>
                <div>
                  <div className="text-gray-500">Retries</div>
                  <div className="text-xl font-semibold">{simulationResult.totalRetries}</div>
                </div>
                <div>
                  <div className="text-gray-500">Total Duration</div>
                  <div className="text-xl font-semibold">{formatDelay(simulationResult.totalDuration)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Attempt Timeline</h4>
                {simulationResult.attempts.map((attempt) => (
                  <div
                    key={attempt.attemptNumber}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      attempt.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : attempt.status === 'failure'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {attempt.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : attempt.status === 'failure' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <div className="font-medium">
                          Attempt {attempt.attemptNumber}
                          {attempt.delay !== undefined && (
                            <span className="text-sm text-gray-500 ml-2">
                              (waited {formatDelay(attempt.delay)})
                            </span>
                          )}
                        </div>
                        {attempt.error && (
                          <div className="text-sm text-red-600">{attempt.error}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDelay(attempt.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

