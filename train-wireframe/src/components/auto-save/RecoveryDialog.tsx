'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import {
  checkForRecoverableDrafts,
  recoverDraft,
  discardDraft,
  RecoveryItem,
  detectConflict,
  resolveConflict,
  ConflictResolution,
  Conflict,
} from '../../lib/auto-save/recovery';
import { errorLogger } from '../../lib/errors/error-logger';
import { toast } from 'sonner';

interface RecoveryDialogProps {
  /** Callback when recovery is complete */
  onRecover?: (item: RecoveryItem, data: any) => void;
  
  /** Callback when draft is discarded */
  onDiscard?: (item: RecoveryItem) => void;
  
  /** Function to fetch server data for conflict detection */
  getServerData?: (itemId: string, type: RecoveryItem['type']) => Promise<{
    data: any;
    updatedAt: Date;
  } | null>;
}

export function RecoveryDialog({
  onRecover,
  onDiscard,
  getServerData,
}: RecoveryDialogProps) {
  const [open, setOpen] = useState(false);
  const [recoveryItems, setRecoveryItems] = useState<RecoveryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RecoveryItem | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Check for recoverable drafts on mount
  useEffect(() => {
    const checkDrafts = async () => {
      const items = await checkForRecoverableDrafts();
      
      if (items.length > 0) {
        setRecoveryItems(items);
        setOpen(true);
      }
    };
    
    checkDrafts();
  }, []);
  
  const handleRecover = async (item: RecoveryItem) => {
    setIsRecovering(true);
    setSelectedItem(item);
    
    try {
      // Check for conflicts if getServerData is provided
      if (getServerData) {
        const serverInfo = await getServerData(item.id, item.type);
        
        if (serverInfo) {
          const detectedConflict = await detectConflict(
            item.id,
            serverInfo.data,
            serverInfo.updatedAt
          );
          
          if (detectedConflict) {
            // Show conflict resolution UI
            setConflict(detectedConflict);
            setIsRecovering(false);
            return;
          }
        }
      }
      
      // No conflict or no server check, proceed with recovery
      const data = await recoverDraft(item.id);
      
      if (data) {
        onRecover?.(item, data);
        
        // Remove from list
        setRecoveryItems(prev => prev.filter(i => i.id !== item.id));
        
        toast.success('Draft recovered successfully', {
          description: item.description,
        });
        
        // Close dialog if no more items
        if (recoveryItems.length === 1) {
          setOpen(false);
        }
      } else {
        toast.error('Failed to recover draft');
      }
    } catch (error) {
      errorLogger.error('Failed to recover draft', error, { itemId: item.id });
      toast.error('Failed to recover draft. Please try again.');
    } finally {
      setIsRecovering(false);
      setSelectedItem(null);
    }
  };
  
  const handleDiscard = async (item: RecoveryItem) => {
    try {
      await discardDraft(item.id);
      onDiscard?.(item);
      
      // Remove from list
      setRecoveryItems(prev => prev.filter(i => i.id !== item.id));
      
      toast.success('Draft discarded');
      
      // Close dialog if no more items
      if (recoveryItems.length === 1) {
        setOpen(false);
      }
    } catch (error) {
      errorLogger.error('Failed to discard draft', error, { itemId: item.id });
      toast.error('Failed to discard draft');
    }
  };
  
  const handleResolveConflict = async (strategy: ConflictResolution) => {
    if (!conflict || !selectedItem) return;
    
    try {
      const resolved = resolveConflict(conflict, strategy);
      onRecover?.(selectedItem, resolved);
      
      setRecoveryItems(prev => prev.filter(i => i.id !== selectedItem.id));
      setConflict(null);
      setSelectedItem(null);
      
      toast.success('Conflict resolved', {
        description: `Using ${strategy === ConflictResolution.USE_DRAFT ? 'draft' : 'server'} data`,
      });
      
      if (recoveryItems.length === 1) {
        setOpen(false);
      }
    } catch (error) {
      errorLogger.error('Failed to resolve conflict', error);
      toast.error('Failed to resolve conflict');
    }
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Unsaved Changes Detected
          </DialogTitle>
          <DialogDescription>
            We found {recoveryItems.length} draft{recoveryItems.length > 1 ? 's' : ''} with unsaved changes.
            Would you like to recover your work?
          </DialogDescription>
        </DialogHeader>
        
        {conflict && selectedItem ? (
          // Conflict resolution UI
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This draft conflicts with newer data on the server. Choose which version to keep:
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">Your Draft</h4>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Saved {formatTime(conflict.draftSavedAt)}
                  </p>
                  <Button
                    onClick={() => handleResolveConflict(ConflictResolution.USE_DRAFT)}
                    className="w-full"
                  >
                    Use Draft
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">Server Version</h4>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Updated {formatTime(conflict.serverUpdatedAt)}
                  </p>
                  <Button
                    onClick={() => handleResolveConflict(ConflictResolution.USE_SERVER)}
                    variant="outline"
                    className="w-full"
                  >
                    Use Server
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setConflict(null);
                  setSelectedItem(null);
                }}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Recovery items list
          <div className="space-y-3">
            {recoveryItems.map((item) => (
              <Card key={item.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{item.description}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Saved {formatTime(item.savedAt)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRecover(item)}
                        disabled={isRecovering && selectedItem?.id === item.id}
                        size="sm"
                      >
                        {isRecovering && selectedItem?.id === item.id ? 'Recovering...' : 'Recover'}
                      </Button>
                      <Button
                        onClick={() => handleDiscard(item)}
                        variant="ghost"
                        size="sm"
                      >
                        Discard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!conflict && (
          <DialogFooter className="border-t pt-4">
            <Button
              onClick={() => {
                // Discard all
                Promise.all(recoveryItems.map(item => handleDiscard(item)));
                setOpen(false);
              }}
              variant="ghost"
            >
              Discard All
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
            >
              Decide Later
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

