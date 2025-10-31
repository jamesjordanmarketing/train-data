'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Toaster } from '@/components/ui/sonner';
import { useConversationStore } from '@/stores/conversation-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { 
    isLoading, 
    loadingMessage,
    modalState,
    hideConfirm
  } = useConversationStore();
  
  const confirmDialog = modalState.confirmationDialog;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-8">
        {children}
      </main>
      
      {/* Toast Notifications */}
      <Toaster position="top-right" />
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={hideConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                confirmDialog.onCancel?.();
                hideConfirm();
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                confirmDialog.onConfirm();
                hideConfirm();
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">{loadingMessage || 'Loading...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

