'use client';

/**
 * Example: Complete Batch Generation with Resume and Backup
 * 
 * This example demonstrates how to integrate:
 * 1. Batch processing with checkpoint resume
 * 2. Progress tracking with BatchSummary
 * 3. Pre-delete backup functionality
 * 
 * Usage:
 * - Copy this example to your app
 * - Modify generateConversation() to match your API
 * - Adjust item generation to match your data model
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Batch resume components
import { ResumeDialog } from '@/components/batch/ResumeDialog';
import { BatchSummary } from '@/components/batch/BatchSummary';
import {
  resumeBatchProcessing,
  BatchItem,
} from '@/lib/batch/processor';
import {
  loadCheckpoint,
  cleanupCheckpoint,
  BatchCheckpoint,
  BatchProgress,
} from '@/lib/batch/checkpoint';

// Backup components
import { PreDeleteBackup } from '@/components/backup/PreDeleteBackup';

interface Conversation {
  id: string;
  topic: string;
  persona: string;
  content?: string;
}

export function BatchGenerationExample() {
  const router = useRouter();
  
  // Batch state
  const [jobId] = useState(() => `batch-${Date.now()}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // UI state
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Check for existing checkpoint on mount
  useEffect(() => {
    checkForExistingCheckpoint();
  }, []);

  async function checkForExistingCheckpoint() {
    try {
      const checkpoint = await loadCheckpoint(jobId);
      if (checkpoint && checkpoint.progressPercentage < 100) {
        // Resume dialog will be shown automatically by ResumeDialog component
        console.log('Found incomplete checkpoint:', checkpoint);
      }
    } catch (error) {
      console.error('Error checking for checkpoint:', error);
    }
  }

  // Generate batch items (replace with your data source)
  function generateBatchItems(): BatchItem[] {
    const topics = [
      'AI Ethics and Responsible Development',
      'Machine Learning Fundamentals',
      'Neural Network Architectures',
      'Natural Language Processing',
      'Computer Vision Applications',
      'Reinforcement Learning Strategies',
      'Deep Learning Optimization',
      'Transfer Learning Techniques',
      'Generative AI Models',
      'Explainable AI Methods',
    ];

    return topics.map((topic, index) => ({
      id: `item-${index + 1}`,
      topic,
      parameters: {
        persona: index % 2 === 0 ? 'Expert' : 'Beginner',
        turnCount: 5,
        difficulty: index % 3 === 0 ? 'hard' : 'medium',
      },
      status: 'pending' as const,
    }));
  }

  // Your conversation generation logic
  async function generateConversation(item: BatchItem): Promise<void> {
    // Simulate API call (replace with your actual generation logic)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Example API call:
    // const response = await fetch('/api/conversations/generate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     topic: item.topic,
    //     parameters: item.parameters,
    //   }),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Generation failed');
    // }
    // 
    // const conversation = await response.json();

    // Simulate created conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random()}`,
      topic: item.topic,
      persona: item.parameters.persona,
      content: `Generated content for ${item.topic}`,
    };

    // Add to conversations list
    setConversations(prev => [...prev, newConversation]);
  }

  async function startBatch() {
    const items = generateBatchItems();
    
    setIsProcessing(true);
    setStartTime(new Date());
    setProgress({
      totalItems: items.length,
      completedItems: 0,
      failedItems: 0,
      pendingItems: items.length,
      progressPercentage: 0,
    });

    try {
      const result = await resumeBatchProcessing(
        jobId,
        items,
        generateConversation,
        (progressUpdate) => {
          setProgress({
            totalItems: items.length,
            completedItems: progressUpdate.completed,
            failedItems: progressUpdate.failed,
            pendingItems: items.length - progressUpdate.completed - progressUpdate.failed,
            progressPercentage: Math.round((progressUpdate.completed / items.length) * 100),
          });
        }
      );

      // Cleanup checkpoint after successful completion
      await cleanupCheckpoint(jobId);

      setIsProcessing(false);

      if (result.failed.length > 0) {
        toast.warning(
          `Batch completed with ${result.failed.length} failures. ${result.completed.length} succeeded.`
        );
      } else {
        toast.success(`Batch completed successfully! ${result.completed.length} conversations generated.`);
      }
    } catch (error) {
      console.error('Batch processing failed:', error);
      setIsProcessing(false);
      toast.error('Batch processing failed. Progress has been saved and can be resumed.');
    }
  }

  async function resumeFromCheckpoint(checkpoint: BatchCheckpoint) {
    const items = generateBatchItems();
    
    setIsProcessing(true);
    setStartTime(new Date());
    setProgress({
      totalItems: items.length,
      completedItems: checkpoint.completedItems.length,
      failedItems: checkpoint.failedItems.length,
      pendingItems: items.length - checkpoint.completedItems.length - checkpoint.failedItems.length,
      progressPercentage: checkpoint.progressPercentage,
    });

    try {
      const result = await resumeBatchProcessing(
        checkpoint.jobId,
        items,
        generateConversation,
        (progressUpdate) => {
          setProgress({
            totalItems: items.length,
            completedItems: progressUpdate.completed,
            failedItems: progressUpdate.failed,
            pendingItems: items.length - progressUpdate.completed - progressUpdate.failed,
            progressPercentage: Math.round((progressUpdate.completed / items.length) * 100),
          });
        }
      );

      await cleanupCheckpoint(checkpoint.jobId);
      setIsProcessing(false);

      toast.success(`Batch resumed and completed! ${result.completed.length} total conversations.`);
    } catch (error) {
      console.error('Batch resume failed:', error);
      setIsProcessing(false);
      toast.error('Failed to resume batch.');
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return;
    setShowBackupDialog(true);
  }

  async function performDelete() {
    // Your actual delete logic here
    // Example:
    // await fetch('/api/conversations/bulk-delete', {
    //   method: 'DELETE',
    //   body: JSON.stringify({ ids: selectedIds }),
    // });

    // Remove from local state
    setConversations(prev => 
      prev.filter(conv => !selectedIds.includes(conv.id))
    );
    setSelectedIds([]);
  }

  function toggleSelection(id: string) {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(convId => convId !== id)
        : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedIds(conversations.map(c => c.id));
  }

  function deselectAll() {
    setSelectedIds([]);
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Batch Conversation Generation</h1>
        <div className="flex gap-2">
          <Button
            onClick={startBatch}
            disabled={isProcessing}
          >
            <Play className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Start Batch'}
          </Button>
        </div>
      </div>

      {/* Resume Dialog - automatically shows if checkpoint exists */}
      <ResumeDialog
        onResume={resumeFromCheckpoint}
        onDiscard={(checkpoint) => {
          console.log('Checkpoint discarded:', checkpoint.jobId);
          toast.info('Checkpoint discarded');
        }}
      />

      {/* Batch Progress */}
      {progress && (
        <BatchSummary
          progress={progress}
          startTime={startTime || undefined}
        />
      )}

      {/* Conversation List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Generated Conversations ({conversations.length})
            </CardTitle>
            <div className="flex gap-2">
              {selectedIds.length > 0 ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                  >
                    Deselect All
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedIds.length})
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={conversations.length === 0}
                >
                  Select All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No conversations yet. Start a batch to generate conversations.
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-colors
                    ${selectedIds.includes(conv.id) 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'}
                  `}
                  onClick={() => toggleSelection(conv.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{conv.topic}</h3>
                      <p className="text-sm text-muted-foreground">
                        Persona: {conv.persona}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(conv.id)}
                      onChange={() => toggleSelection(conv.id)}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pre-Delete Backup Dialog */}
      <PreDeleteBackup
        isOpen={showBackupDialog}
        onClose={() => setShowBackupDialog(false)}
        conversationIds={selectedIds}
        onConfirmDelete={performDelete}
      />
    </div>
  );
}

export default BatchGenerationExample;

