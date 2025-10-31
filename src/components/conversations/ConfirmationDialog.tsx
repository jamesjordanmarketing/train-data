'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useConversationStore, useModalState } from '@/stores/conversation-store';

export function ConfirmationDialog() {
  const modalState = useModalState();
  const hideConfirm = useConversationStore((state) => state.hideConfirm);
  
  const handleConfirm = () => {
    modalState.confirmationDialog.onConfirm();
    hideConfirm();
  };
  
  const handleCancel = () => {
    modalState.confirmationDialog.onCancel?.();
    hideConfirm();
  };
  
  return (
    <AlertDialog 
      open={modalState.confirmationDialog.open} 
      onOpenChange={(open) => !open && hideConfirm()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{modalState.confirmationDialog.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {modalState.confirmationDialog.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

