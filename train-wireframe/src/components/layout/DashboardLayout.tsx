import { ReactNode } from 'react';
import { Header } from './Header';
import { Toaster } from '../ui/sonner';
import { useAppStore } from '../../stores/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { 
    showConfirmDialog, 
    confirmDialogConfig, 
    hideConfirm,
    isLoading,
    loadingMessage 
  } = useAppStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="w-full">
        {children}
      </main>
      
      {/* Toast Notifications */}
      <Toaster position="top-right" />
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={hideConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialogConfig?.title}</DialogTitle>
            <DialogDescription>{confirmDialogConfig?.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              confirmDialogConfig?.onCancel?.();
              hideConfirm();
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              confirmDialogConfig?.onConfirm();
              hideConfirm();
            }}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-600">{loadingMessage || 'Loading...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
