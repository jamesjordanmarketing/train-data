import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { EdgeCase } from '../../lib/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestExecutionModalProps {
  edgeCase: EdgeCase;
  open: boolean;
  onClose: () => void;
  onSuccess: (edgeCase: EdgeCase) => void;
}

export function TestExecutionModal({ edgeCase, open, onClose, onSuccess }: TestExecutionModalProps) {
  const [actualBehavior, setActualBehavior] = useState('');
  const [testPassed, setTestPassed] = useState<boolean | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const expectedBehavior = edgeCase.testResults?.expectedBehavior || 'No expected behavior defined';

  const handleExecuteTest = async () => {
    setIsExecuting(true);
    try {
      // Optional: Call AI to generate actual behavior
      // const response = await fetch('/api/edge-cases/execute-test', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ edgeCaseId: edgeCase.id }),
      // });
      // const result = await response.json();
      // setActualBehavior(result.actualBehavior);
      
      // For now, just enable manual entry
      toast.info('Enter the actual behavior observed during testing');
    } catch (error) {
      toast.error('Test execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveResults = async () => {
    if (!actualBehavior.trim()) {
      toast.error('Please enter the actual behavior');
      return;
    }

    if (testPassed === null) {
      toast.error('Please indicate if the test passed or failed');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/edge-cases/${edgeCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_status: testPassed ? 'passed' : 'failed',
          test_results: {
            expectedBehavior,
            actualBehavior,
            passed: testPassed,
            testDate: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save test results');
      }

      toast.success(`Test marked as ${testPassed ? 'passed' : 'failed'}`);
      onSuccess(result.data);
      onClose();
    } catch (error: any) {
      console.error('Error saving test results:', error);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Execute Test: {edgeCase.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Edge Case Info */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Type:</span>{' '}
                <Badge variant="outline">{edgeCase.edgeCaseType}</Badge>
              </div>
              <div>
                <span className="font-semibold">Complexity:</span> {edgeCase.complexity}/10
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Description:</span>
                <p className="text-gray-700 mt-1">{edgeCase.description}</p>
              </div>
            </div>
          </div>

          {/* Expected Behavior */}
          <div>
            <Label className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              Expected Behavior
            </Label>
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap text-gray-800">
                {expectedBehavior}
              </pre>
            </div>
          </div>

          {/* Execute Test Button */}
          {!actualBehavior && (
            <div className="flex justify-center">
              <Button
                onClick={handleExecuteTest}
                disabled={isExecuting}
                size="lg"
              >
                {isExecuting ? 'Executing Test...' : 'Execute Test'}
              </Button>
            </div>
          )}

          {/* Actual Behavior */}
          <div>
            <Label htmlFor="actualBehavior">Actual Behavior Observed</Label>
            <Textarea
              id="actualBehavior"
              value={actualBehavior}
              onChange={(e) => setActualBehavior(e.target.value)}
              placeholder="Enter or paste the actual behavior observed during the test..."
              rows={6}
              className="mt-2"
            />
          </div>

          {/* Pass/Fail Selection */}
          {actualBehavior && (
            <div>
              <Label>Test Result</Label>
              <RadioGroup
                value={testPassed === null ? '' : testPassed.toString()}
                onValueChange={(value) => setTestPassed(value === 'true')}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-green-50">
                  <RadioGroupItem value="true" id="passed" />
                  <div className="flex items-center gap-2 flex-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Label htmlFor="passed" className="cursor-pointer font-semibold">
                      Test Passed
                    </Label>
                  </div>
                  <p className="text-xs text-gray-600">Actual matches expected behavior</p>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-red-50">
                  <RadioGroupItem value="false" id="failed" />
                  <div className="flex items-center gap-2 flex-1">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <Label htmlFor="failed" className="cursor-pointer font-semibold">
                      Test Failed
                    </Label>
                  </div>
                  <p className="text-xs text-gray-600">Actual differs from expected</p>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Comparison View */}
          {actualBehavior && testPassed !== null && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-green-700">✓ Expected</Label>
                <div className="mt-1 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <pre className="whitespace-pre-wrap">{expectedBehavior}</pre>
                </div>
              </div>
              <div>
                <Label className={testPassed ? 'text-green-700' : 'text-red-700'}>
                  {testPassed ? '✓' : '✗'} Actual
                </Label>
                <div className={`mt-1 border rounded-lg p-3 text-sm ${
                  testPassed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <pre className="whitespace-pre-wrap">{actualBehavior}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveResults}
              disabled={isSaving || !actualBehavior || testPassed === null}
            >
              {isSaving ? 'Saving...' : 'Save Test Results'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

