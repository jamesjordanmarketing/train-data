import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../lib/utils';

export type ReviewActionType = 'approve' | 'reject' | 'request_changes';

interface ReviewActionControlsProps {
  onAction: (action: ReviewActionType, comment: string, reasons: string[]) => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
}

const REJECTION_REASONS = [
  'Inappropriate content',
  'Factual errors',
  'Poor quality',
  'Off-topic',
  'Repetitive',
  'Incomplete response',
  'Format issues',
  'Other'
];

const REVISION_REASONS = [
  'Needs more detail',
  'Tone adjustment needed',
  'Clarity improvement',
  'Format correction',
  'Length adjustment',
  'Add examples',
  'Other'
];

export function ReviewActionControls({ 
  onAction, 
  isSubmitting, 
  disabled = false 
}: ReviewActionControlsProps) {
  const [comment, setComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<ReviewActionType | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [showReasonSection, setShowReasonSection] = useState(false);

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const validateAndSubmit = async (action: ReviewActionType) => {
    // Validation for reject and request_changes
    if ((action === 'reject' || action === 'request_changes') && !comment.trim()) {
      toast.error(
        action === 'reject' 
          ? 'Please provide a comment explaining why you are rejecting this conversation.'
          : 'Please provide a comment explaining what changes are needed.'
      );
      return;
    }

    try {
      await onAction(action, comment, selectedReasons);
      // Reset form after successful submission
      setComment('');
      setSelectedReasons([]);
      setSelectedAction(null);
      setShowReasonSection(false);
    } catch (error) {
      console.error('Failed to submit review action:', error);
    }
  };

  const handleApprove = () => {
    setSelectedAction('approve');
    validateAndSubmit('approve');
  };

  const handleReject = () => {
    if (!showReasonSection) {
      setSelectedAction('reject');
      setShowReasonSection(true);
      return;
    }
    validateAndSubmit('reject');
  };

  const handleRequestChanges = () => {
    if (!showReasonSection) {
      setSelectedAction('request_changes');
      setShowReasonSection(true);
      return;
    }
    validateAndSubmit('request_changes');
  };

  const handleCancel = () => {
    setShowReasonSection(false);
    setSelectedAction(null);
    setComment('');
    setSelectedReasons([]);
  };

  const currentReasons = selectedAction === 'reject' ? REJECTION_REASONS : REVISION_REASONS;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Review Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        {!showReasonSection ? (
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={handleApprove}
              disabled={isSubmitting || disabled}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting && selectedAction === 'approve' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
            <Button
              onClick={handleReject}
              disabled={isSubmitting || disabled}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={isSubmitting || disabled}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Changes
            </Button>
          </div>
        ) : (
          <>
            {/* Reason Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {selectedAction === 'reject' ? 'Rejection Reasons' : 'What needs to be changed?'}
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {currentReasons.map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <Checkbox
                      id={reason}
                      checked={selectedReasons.includes(reason)}
                      onCheckedChange={() => handleReasonToggle(reason)}
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor={reason}
                      className="text-sm cursor-pointer"
                    >
                      {reason}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div className="space-y-2">
              <Label htmlFor="comment" className="text-sm font-medium">
                Comment {(selectedAction === 'reject' || selectedAction === 'request_changes') && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Textarea
                id="comment"
                placeholder={
                  selectedAction === 'reject'
                    ? 'Explain why you are rejecting this conversation...'
                    : 'Describe what changes are needed...'
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">
                {selectedAction === 'reject' || selectedAction === 'request_changes' 
                  ? 'A comment is required for rejection or change requests'
                  : 'Optional: Provide additional context for your decision'}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => validateAndSubmit(selectedAction!)}
              disabled={isSubmitting}
              className={cn(
                "w-full",
                selectedAction === 'reject' && "bg-red-600 hover:bg-red-700",
                selectedAction === 'request_changes' && "bg-yellow-600 hover:bg-yellow-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  {selectedAction === 'reject' ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Confirm Rejection
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Request Changes
                    </>
                  )}
                </>
              )}
            </Button>
          </>
        )}

        {/* Keyboard Shortcuts Hint */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">A</kbd> Approve,{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">R</kbd> Reject,{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">C</kbd> Changes,{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">N</kbd> Next,{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">P</kbd> Previous
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

