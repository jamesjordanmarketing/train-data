import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAppStore } from '../../stores/useAppStore';
import { BatchConfigStep } from './BatchConfigStep';
import { BatchPreviewStep } from './BatchPreviewStep';
import { BatchProgressStep } from './BatchProgressStep';
import { BatchSummaryStep } from './BatchSummaryStep';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';

export function BatchGenerationModal() {
  const {
    showBatchModal,
    closeBatchModal,
    batchGeneration,
    setBatchStep,
    resetBatchGeneration,
    setCurrentView,
  } = useAppStore();
  
  const { currentStep, jobId } = batchGeneration;
  
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  
  // Handle modal close with confirmation if generation is in progress
  const handleClose = () => {
    if (currentStep === 3 && jobId) {
      // Show confirmation dialog if generation is in progress
      setShowCloseConfirm(true);
    } else {
      // Close immediately and reset if not generating
      closeBatchModal();
      resetBatchGeneration();
    }
  };
  
  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    closeBatchModal();
    toast.info('Generation continues in background. Check dashboard for progress.');
  };
  
  const handleCancelClose = () => {
    setShowCloseConfirm(false);
  };
  
  // Navigation handlers
  const handleNext = () => {
    setBatchStep((currentStep + 1) as 1 | 2 | 3 | 4);
  };
  
  const handleBack = () => {
    setBatchStep((currentStep - 1) as 1 | 2 | 3 | 4);
  };
  
  const handleComplete = () => {
    setBatchStep(4);
  };
  
  const handleViewConversations = () => {
    closeBatchModal();
    setCurrentView('dashboard');
    resetBatchGeneration();
    toast.success('Viewing generated conversations');
  };
  
  const handleCancel = () => {
    handleClose();
  };
  
  // Reset state when modal opens
  useEffect(() => {
    if (showBatchModal && currentStep === 4) {
      // If reopening after completion, reset to step 1
      resetBatchGeneration();
    }
  }, [showBatchModal]);
  
  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showBatchModal) return;
      
      // ESC key to close (with confirmation if generating)
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBatchModal, currentStep, jobId]);
  
  // Get step title for header
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Step 1 of 4: Configuration';
      case 2:
        return 'Step 2 of 4: Preview & Estimates';
      case 3:
        return 'Step 3 of 4: Generation Progress';
      case 4:
        return 'Summary';
      default:
        return 'Batch Generation';
    }
  };
  
  return (
    <>
      <Dialog open={showBatchModal} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle>
              <div className="flex items-center justify-between">
                <span>Batch Generation</span>
                <span className="text-sm font-normal text-gray-500">
                  {getStepTitle()}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="flex items-center flex-1"
              >
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
                    transition-colors duration-200
                    ${
                      step < currentStep
                        ? 'bg-green-500 text-white'
                        : step === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {step < currentStep ? '✓' : step}
            </div>
                {step < 4 && (
                  <div
                    className={`
                      flex-1 h-1 mx-2 rounded transition-colors duration-200
                      ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
              )}
            </div>
            ))}
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <BatchConfigStep onNext={handleNext} onCancel={handleCancel} />
            )}
            {currentStep === 2 && (
              <BatchPreviewStep onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 3 && (
              <BatchProgressStep onComplete={handleComplete} />
            )}
            {currentStep === 4 && (
              <BatchSummaryStep
                onClose={() => {
                  closeBatchModal();
                  resetBatchGeneration();
                }}
                onViewConversations={handleViewConversations}
              />
            )}
        </div>
      </DialogContent>
    </Dialog>
      
      {/* Close Confirmation Dialog */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generation in Progress</AlertDialogTitle>
            <AlertDialogDescription>
              Batch generation is currently running. If you close this modal, the generation will
              continue in the background. You can monitor progress from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Stay Here
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Close Modal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
